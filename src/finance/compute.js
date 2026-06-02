(function (global) {
    'use strict';

    var Events = global.FinanceEvents;
    var Ledger = global.FinanceLedger;
    var Invariants = global.FinanceInvariants;
    var Confidence = global.FinanceConfidence;

    if (!Events && typeof module !== 'undefined' && module.exports) {
        Events = require('./events.js');
    }
    if (!Ledger && typeof module !== 'undefined' && module.exports) {
        Ledger = require('./ledger.js');
    }
    if (!Invariants && typeof module !== 'undefined' && module.exports) {
        Invariants = require('./invariants.js');
    }
    if (!Confidence && typeof module !== 'undefined' && module.exports) {
        Confidence = require('./confidence.js');
    }

    if (!Events || !Ledger || !Invariants || !Confidence) {
        throw new Error('FinanceCompute dependencies are missing.');
    }

    function normalizeSettings(settings) {
        return Ledger.normalizeSettings(settings || {});
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function isWithinLastDays(timestamp, nowTs, days) {
        var ts = Date.parse(timestamp);
        if (!Number.isFinite(ts)) return false;
        var age = nowTs - ts;
        return age >= 0 && age <= (days * 24 * 60 * 60 * 1000);
    }

    function isWithinForecast(timestamp, nowTs, endTs) {
        var ts = Date.parse(timestamp);
        if (!Number.isFinite(ts)) return false;
        return ts >= nowTs && ts <= endTs;
    }

    function isPipelineIncluded(stage) {
        return Ledger.isPipelineActive(stage);
    }

    function toNumber(value, fallback) {
        var num = Number(value);
        if (!Number.isFinite(num)) return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
        return num;
    }

    function round(value) {
        return Events.roundMoney(value);
    }

    function computeFinancialContext(events, settings) {
        var cfg = normalizeSettings(settings);
        var sortedEvents = Events.sortFinancialEvents(safeArray(events));
        var activeEvents = Ledger.getActiveEvents(sortedEvents);
        var readModel = Ledger.buildReadModel(sortedEvents, cfg);

        var nowIso = cfg.nowIso || new Date().toISOString();
        var nowTs = Date.parse(nowIso);
        var endDate = new Date(nowTs);
        endDate.setDate(endDate.getDate() + cfg.forecastDays);
        var forecastEndTs = endDate.getTime();

        var realBalanceFromEventsMinor = 0;
        var revenueTodayMinor = 0;
        var recentExpenseMinor = 0;
        var hasExpenseEvent = false;
        var forecastFutureIncomeMinor = 0;

        var todayKey = Events.localDateKey(nowIso);

        activeEvents.forEach(function (event) {
            var eventTs = Date.parse(event.timestamp);
            var amountMinor = Events.toMinor(Math.abs(Number(event.amount) || 0));
            var isPastOrNow = Number.isFinite(eventTs) ? eventTs <= nowTs : false;
            var isForecastFuture = Number.isFinite(eventTs) ? (eventTs > nowTs && eventTs <= forecastEndTs) : false;

            if (event.type === 'income.received') {
                if (isPastOrNow) {
                    realBalanceFromEventsMinor += Events.toMinor(Number(event.amount) || 0);
                } else if (isForecastFuture) {
                    forecastFutureIncomeMinor += Events.toMinor(Number(event.amount) || 0);
                }
                if (isPastOrNow && todayKey && Events.localDateKey(event.timestamp) === todayKey) {
                    revenueTodayMinor += Events.toMinor(Number(event.amount) || 0);
                }
                return;
            }

            if (event.type === 'expense.recorded') {
                hasExpenseEvent = true;
                if (isPastOrNow) {
                    realBalanceFromEventsMinor -= amountMinor;
                }
                if (isWithinLastDays(event.timestamp, nowTs, 30)) {
                    recentExpenseMinor += amountMinor;
                }
                return;
            }

            if (event.type === 'debt.added') {
                // Debt additions register liabilities; they do not increase liquid cash balance.
                return;
            }

            if (event.type === 'debt.payment_made') {
                // Debt payments are tracked as liability updates and excluded from real cash balance.
                return;
            }

            if (event.type === 'balance.opening_set') {
                if (isPastOrNow) {
                    realBalanceFromEventsMinor += Events.toMinor(Number(event.amount) || 0);
                }
            }
        });

        var fiatAccounts = safeArray(readModel.fiatAccounts);
        var web3Positions = safeArray(readModel.web3Positions);
        var defiPositions = safeArray(readModel.defiPositions);
        var fiatCashMinor = Events.toMinor(fiatAccounts.reduce(function (sum, account) {
            return sum + (Number(account && account.balance) || 0);
        }, 0));
        var web3AssetsMinor = Events.toMinor(web3Positions.reduce(function (sum, position) {
            return sum + ((Number(position && position.amount) || 0) * (Number(position && position.price) || 0));
        }, 0));
        var defiNetMinor = Events.toMinor(defiPositions.reduce(function (sum, position) {
            return sum + ((Number(position && position.collateralValue) || 0) - (Number(position && position.debtValue) || 0));
        }, 0));
        var assetsTotalMinor = fiatCashMinor + web3AssetsMinor + defiNetMinor;
        var hasAssetAnchor = fiatAccounts.length > 0 || web3Positions.length > 0 || defiPositions.length > 0;
        var realBalanceMinor = hasAssetAnchor ? assetsTotalMinor : realBalanceFromEventsMinor;

        var weightedPipelineMinor = 0;
        var forecastExpectedPipelineMinor = 0;

        safeArray(readModel.pipelineDeals).forEach(function (deal) {
            if (!isPipelineIncluded(deal.status)) return;

            var probability = Events.clampProbability(deal.probability);
            var weightedMinor = Events.toMinor((toNumber(deal.value, 0) * probability));
            weightedPipelineMinor += weightedMinor;

            if (isWithinForecast(deal.expectedDateISO, nowTs, forecastEndTs)) {
                forecastExpectedPipelineMinor += weightedMinor;
            }
        });

        var recurringMonthlyMinor = Events.toMinor(readModel.recurringMonthlyTotal || 0);
        var monthlyBurnMinor = null;

        if ((readModel.recurringExpenses || []).length > 0) {
            monthlyBurnMinor = recurringMonthlyMinor;
        } else if (recentExpenseMinor > 0) {
            monthlyBurnMinor = recentExpenseMinor;
        } else if (hasExpenseEvent) {
            monthlyBurnMinor = 0;
        }

        var scheduledRecurringMinor = recurringMonthlyMinor > 0
            ? Math.round(recurringMonthlyMinor * (cfg.forecastDays / 30))
            : 0;

        var projectedBalanceMinor = realBalanceMinor + forecastExpectedPipelineMinor + forecastFutureIncomeMinor - scheduledRecurringMinor;

        var totalDebtMinor = Events.toMinor(readModel.debtTotal || 0);

        var monthlyBurn = monthlyBurnMinor == null ? null : Events.fromMinor(monthlyBurnMinor);
        var runwayMonths = null;
        if (monthlyBurnMinor != null && monthlyBurnMinor > 0) {
            runwayMonths = round(Events.fromMinor(realBalanceMinor) / Events.fromMinor(monthlyBurnMinor));
        }

        var breakEvenRevenue = monthlyBurn;

        var snapshot = {
            realBalance: Events.fromMinor(realBalanceMinor),
            projectedBalance: Events.fromMinor(projectedBalanceMinor),
            weightedPipeline: Events.fromMinor(weightedPipelineMinor),
            monthlyBurn: monthlyBurn,
            runwayMonths: runwayMonths,
            breakEvenRevenue: breakEvenRevenue,
            revenueToday: Events.fromMinor(revenueTodayMinor),
            totalDebt: Events.fromMinor(totalDebtMinor),
            confidenceScore: 1,
            missingInputs: [],
            lastComputedAt: nowIso
        };

        var missingInputs = [];
        if ((readModel.recurringExpenses || []).length === 0) {
            missingInputs.push('recurring expenses');
        }
        if (activeEvents.length === 0 || !activeEvents.some(function (event) { return isWithinLastDays(event.timestamp, nowTs, 30); })) {
            missingInputs.push('recent financial activity');
        }
        if (snapshot.monthlyBurn == null) {
            missingInputs.push('monthly burn');
        }
        if ((readModel.pipelineDeals || []).filter(function (deal) { return isPipelineIncluded(deal.status); }).length === 0) {
            missingInputs.push('pipeline');
        }

        var latestEventTs = activeEvents.length ? Date.parse(activeEvents[activeEvents.length - 1].timestamp) : 0;
        var staleCompute = latestEventTs > 0 ? ((nowTs - latestEventTs) > (45 * 24 * 60 * 60 * 1000)) : true;

        var components = {
            realBalanceFromSums: Events.fromMinor(realBalanceMinor),
            weightedPipelineFromDeals: Events.fromMinor(weightedPipelineMinor),
            totalDebtFromLiabilities: Events.fromMinor(totalDebtMinor)
        };

        var invariantResult = Invariants.evaluateFinancialInvariants({
            snapshot: snapshot,
            components: components
        });

        var confidenceResult = Confidence.computeConfidenceScore({
            missingRecurringExpenses: (readModel.recurringExpenses || []).length === 0,
            noRecentData: missingInputs.indexOf('recent financial activity') !== -1,
            undefinedBurn: snapshot.monthlyBurn == null,
            emptyPipeline: missingInputs.indexOf('pipeline') !== -1,
            staleCompute: staleCompute,
            missingInputs: missingInputs.concat(invariantResult.messages || []),
            invariantViolations: invariantResult.violations
        });

        snapshot.confidenceScore = confidenceResult.score;
        snapshot.missingInputs = confidenceResult.missingInputs;

        if (invariantResult.violations.length > 0 && global.console && typeof global.console.warn === 'function') {
            global.console.warn('[FinanceInvariant] violation(s)', invariantResult.violations);
        }

        return {
            snapshot: snapshot,
            readModel: readModel,
            invariants: invariantResult,
            confidence: confidenceResult,
            diagnostics: {
                staleCompute: staleCompute,
                latestEventTimestamp: latestEventTs ? new Date(latestEventTs).toISOString() : null,
                forecastDays: cfg.forecastDays,
                baseCurrency: cfg.baseCurrency,
                invariantMessages: invariantResult.messages || [],
                forecastFutureIncome: Events.fromMinor(forecastFutureIncomeMinor),
                realBalanceFromEvents: Events.fromMinor(realBalanceFromEventsMinor),
                realBalanceFromFiatAccounts: Events.fromMinor(fiatCashMinor),
                realBalanceFromAssets: Events.fromMinor(assetsTotalMinor),
                realBalanceUsesFiatAnchor: fiatAccounts.length > 0,
                realBalanceUsesAssetAnchor: hasAssetAnchor
            }
        };
    }

    function computeFinancialState(events, settings) {
        return computeFinancialContext(events, settings).snapshot;
    }

    var api = {
        normalizeSettings: normalizeSettings,
        computeFinancialContext: computeFinancialContext,
        computeFinancialState: computeFinancialState
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceCompute = api;
})(typeof window !== 'undefined' ? window : globalThis);
