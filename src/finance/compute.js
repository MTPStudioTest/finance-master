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

    var RESERVE_BUCKETS = [
        'tax_reserve',
        'vat_reserve',
        'health_insurance',
        'debt_repayment',
        'personal_survival',
        'business_operating_costs',
        'investment_growth',
        'buffer'
    ];

    function normalizeBucket(value) {
        var raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        if (!raw) return 'available';
        if (raw === 'tax' || raw === 'taxes') return 'tax_reserve';
        if (raw === 'vat') return 'vat_reserve';
        if (raw === 'health' || raw === 'insurance') return 'health_insurance';
        if (raw === 'debt') return 'debt_repayment';
        if (raw === 'survival') return 'personal_survival';
        if (raw === 'business' || raw === 'operating') return 'business_operating_costs';
        if (raw === 'growth' || raw === 'investment') return 'investment_growth';
        if (raw === 'safety_buffer' || raw === 'safety') return 'buffer';
        return raw;
    }

    function labelBucket(bucket) {
        var labels = {
            available: 'Available',
            tax_reserve: 'Tax reserve',
            vat_reserve: 'VAT reserve',
            health_insurance: 'Health insurance',
            debt_repayment: 'Debt repayment',
            personal_survival: 'Personal survival',
            business_operating_costs: 'Business operating costs',
            investment_growth: 'Investment growth',
            buffer: 'Buffer'
        };
        return labels[bucket] || String(bucket || 'available').replace(/_/g, ' ');
    }

    function addDays(base, days) {
        var date = new Date(base);
        date.setDate(date.getDate() + days);
        return date;
    }

    function dateOnly(value) {
        var ts = Date.parse(String(value || ''));
        if (!Number.isFinite(ts)) return '';
        return new Date(ts).toISOString().slice(0, 10);
    }

    function startOfMonth(value) {
        var date = new Date(value);
        return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    }

    function endOfMonth(value) {
        var date = new Date(value);
        return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    function classifyIncomeStatus(deal) {
        var status = String(deal && deal.status || '').toLowerCase();
        var probability = Events.clampProbability(deal && deal.probability);
        if (status === 'received' || status === 'paid') return 'received';
        if (status === 'cancelled' || status === 'lost' || status === 'closed') return 'cancelled';
        if (status === 'confirmed' || status === 'signed' || probability >= 0.8) return 'confirmed';
        if (status === 'risky' || status === 'open' || probability < 0.5) return 'risky';
        return 'expected';
    }

    function classifyObligationStatus(dueDate, nowTs) {
        var dueTs = Date.parse(String(dueDate || ''));
        if (!Number.isFinite(dueTs)) return 'needs_review';
        if (dueTs < nowTs) return 'overdue';
        if (dueTs <= addDays(nowTs, 7).getTime()) return 'due_soon';
        return 'upcoming';
    }

    function buildTreasuryModel(readModel, snapshotSeed, cfg, nowTs) {
        var fiatAccounts = safeArray(readModel.fiatAccounts);
        var recurringExpenses = safeArray(readModel.recurringExpenses);
        var obligationReviewMap = Object.create(null);
        safeArray(readModel.obligationReviews).forEach(function (review) {
            if (!review || !review.id) return;
            obligationReviewMap[String(review.id)] = review;
        });
        var pipelineDeals = safeArray(readModel.pipelineDeals).filter(function (deal) {
            return isPipelineIncluded(deal && deal.status);
        });
        var transactions = safeArray(readModel.transactions);
        var debtAccounts = safeArray(readModel.debtAccounts);
        var monthStart = startOfMonth(nowTs).getTime();
        var monthEnd = endOfMonth(nowTs).getTime();
        var forecastEndTs = addDays(nowTs, cfg.forecastDays).getTime();

        var reserveMap = Object.create(null);
        var totalCash = 0;
        var reservedCash = 0;

        fiatAccounts.forEach(function (account) {
            var amount = Number(account && account.balance) || 0;
            var bucket = normalizeBucket(account && account.bucket);
            var isReserved = bucket !== 'available' || Boolean(account && account.reserved);
            totalCash += amount;
            if (isReserved) {
                reservedCash += amount;
                if (!reserveMap[bucket]) {
                    reserveMap[bucket] = { bucket: bucket, label: labelBucket(bucket), amount: 0 };
                }
                reserveMap[bucket].amount += amount;
            }
        });

        RESERVE_BUCKETS.forEach(function (bucket) {
            if (!reserveMap[bucket]) reserveMap[bucket] = { bucket: bucket, label: labelBucket(bucket), amount: 0 };
        });

        var reserveBuckets = Object.keys(reserveMap)
            .map(function (bucket) {
                return {
                    bucket: bucket,
                    label: reserveMap[bucket].label,
                    amount: round(reserveMap[bucket].amount)
                };
            })
            .sort(function (a, b) {
                var idxA = RESERVE_BUCKETS.indexOf(a.bucket);
                var idxB = RESERVE_BUCKETS.indexOf(b.bucket);
                if (idxA !== idxB) return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                return String(a.label).localeCompare(String(b.label));
            });

        var personalBurn = recurringExpenses
            .filter(function (expense) { return String(expense && expense.scope || '').toLowerCase() === 'personal' || String(expense && expense.scope || '').toLowerCase() === 'shared'; })
            .reduce(function (sum, expense) { return sum + (Number(expense && expense.monthlyAmount) || 0); }, 0);
        var businessBurn = recurringExpenses
            .filter(function (expense) { return String(expense && expense.scope || '').toLowerCase() === 'business' || String(expense && expense.scope || '').toLowerCase() === 'shared'; })
            .reduce(function (sum, expense) { return sum + (Number(expense && expense.monthlyAmount) || 0); }, 0);
        var totalBurn = recurringExpenses
            .reduce(function (sum, expense) { return sum + (Number(expense && expense.monthlyAmount) || 0); }, 0);

        var obligations = [];
        recurringExpenses.forEach(function (expense) {
            var dueDay = Math.max(1, Math.min(28, Number(expense && expense.dueDay) || 1));
            for (var monthOffset = 0; monthOffset < 4; monthOffset += 1) {
                var due = new Date(new Date(nowTs).getFullYear(), new Date(nowTs).getMonth() + monthOffset, dueDay, 12, 0, 0, 0);
                if (due.getTime() > forecastEndTs) continue;
                if (monthOffset > 0 || due.getTime() >= addDays(nowTs, -30).getTime()) {
                    var obligationId = String((expense && expense.id) || 'expense') + '-' + due.toISOString().slice(0, 7);
                    var review = obligationReviewMap[obligationId] || null;
                    var dueDate = due.toISOString().slice(0, 10);
                    var status = classifyObligationStatus(due.toISOString(), nowTs);
                    if (review && review.status === 'paid') {
                        status = 'paid';
                    } else if (review && review.status === 'deferred' && review.deferredUntil) {
                        dueDate = dateOnly(review.deferredUntil) || dueDate;
                        status = classifyObligationStatus(dueDate, nowTs);
                    } else if (review && review.status === 'needs_review') {
                        status = 'needs_review';
                    }
                    obligations.push({
                        id: obligationId,
                        sourceId: String((expense && expense.id) || 'expense'),
                        title: String((expense && expense.category) || 'Recurring cost'),
                        type: 'recurring_cost',
                        amount: round(Number(expense && expense.monthlyAmount) || 0),
                        dueDate: dueDate,
                        originalDueDate: due.toISOString().slice(0, 10),
                        status: status,
                        review: review,
                        scope: String((expense && expense.scope) || 'shared')
                    });
                }
            }
        });
        debtAccounts.forEach(function (debt) {
            var outstanding = Number(debt && debt.outstanding) || 0;
            if (outstanding <= 0) return;
            obligations.push({
                id: String((debt && debt.id) || 'debt'),
                title: String((debt && debt.name) || 'Debt repayment'),
                type: 'debt',
                amount: round(outstanding),
                dueDate: '',
                status: 'needs_review',
            scope: String((debt && debt.scope) || 'shared')
            });
        });
        obligations.sort(function (a, b) {
            var tsA = Date.parse(a.dueDate || '') || Number.MAX_SAFE_INTEGER;
            var tsB = Date.parse(b.dueDate || '') || Number.MAX_SAFE_INTEGER;
            return tsA - tsB;
        });

        var income = pipelineDeals.map(function (deal) {
            var status = classifyIncomeStatus(deal);
            return {
                id: String((deal && deal.id) || ''),
                title: String((deal && deal.title) || 'Income'),
                amount: round(Number(deal && deal.value) || 0),
                dueDate: dateOnly(deal && deal.expectedDateISO),
                status: status,
                probability: Events.clampProbability(deal && deal.probability),
                scope: String((deal && deal.scope) || 'shared')
            };
        }).filter(function (entry) {
            return entry.status !== 'received' && entry.status !== 'cancelled';
        });

        var incomeThisMonth = { confirmed: 0, expected: 0, risky: 0, received: 0 };
        income.forEach(function (entry) {
            var ts = Date.parse(entry.dueDate || '');
            if (!Number.isFinite(ts) || ts < monthStart || ts > monthEnd) return;
            if (entry.status === 'confirmed') incomeThisMonth.confirmed += entry.amount;
            if (entry.status === 'expected') incomeThisMonth.expected += entry.amount;
            if (entry.status === 'risky') incomeThisMonth.risky += entry.amount;
        });
        transactions.forEach(function (entry) {
            var ts = Date.parse(entry && entry.timestamp || '');
            if (!Number.isFinite(ts) || ts < monthStart || ts > monthEnd) return;
            if (String(entry && entry.type) === 'income.received') {
                incomeThisMonth.received += Number(entry && entry.amount) || 0;
            }
        });

        function isInsideForecast(entry) {
            var ts = Date.parse(entry && entry.dueDate || '');
            return Number.isFinite(ts) && ts >= nowTs && ts <= forecastEndTs;
        }

        var forecastIncome = income.filter(isInsideForecast);
        var confirmed90 = forecastIncome.filter(function (entry) { return entry.status === 'confirmed'; })
            .reduce(function (sum, entry) { return sum + entry.amount; }, 0);
        var expected90 = forecastIncome.filter(function (entry) { return entry.status === 'expected'; })
            .reduce(function (sum, entry) { return sum + entry.amount; }, 0);
        var risky90 = forecastIncome.filter(function (entry) { return entry.status === 'risky'; })
            .reduce(function (sum, entry) { return sum + entry.amount; }, 0);
        var scheduled90 = obligations
            .filter(function (entry) { return entry.status !== 'paid'; })
            .reduce(function (sum, entry) { return sum + (Number(entry.amount) || 0); }, 0);
        var trulyAvailable = round(totalCash - reservedCash);

        var reviewQueue = [];
        obligations.filter(function (entry) { return entry.status === 'overdue' || entry.status === 'needs_review'; }).slice(0, 6).forEach(function (entry) {
            reviewQueue.push({
                id: entry.id,
                title: entry.title,
                reason: entry.status === 'overdue' ? 'Overdue obligation' : 'Needs a due date or payment plan',
                tone: entry.status === 'overdue' ? 'urgent' : 'review'
            });
        });
        income.filter(function (entry) { return entry.status === 'risky'; }).slice(0, 4).forEach(function (entry) {
            reviewQueue.push({
                id: entry.id,
                title: entry.title,
                reason: 'Risky income assumption',
                tone: 'review'
            });
        });
        transactions.filter(function (entry) {
            return String(entry && entry.categoryId || '').toLowerCase() === 'uncategorized';
        }).slice(0, 4).forEach(function (entry) {
            reviewQueue.push({
                id: String(entry && entry.id || ''),
                title: String(entry && entry.description || 'Transaction'),
                reason: 'Uncategorized transaction',
                tone: 'review'
            });
        });
        if (!fiatAccounts.length) {
            reviewQueue.unshift({ id: 'missing-cash', title: 'Cash baseline', reason: 'Add at least one cash account', tone: 'urgent' });
        }
        if (!recurringExpenses.length) {
            reviewQueue.push({ id: 'missing-burn', title: 'Monthly burn', reason: 'Add recurring fixed costs', tone: 'review' });
        }

        return {
            totalCash: round(totalCash),
            reservedCash: round(reservedCash),
            trulyAvailableCash: trulyAvailable,
            reserveBuckets: reserveBuckets,
            monthlyPersonalBurn: round(personalBurn),
            monthlyBusinessBurn: round(businessBurn),
            totalMonthlyBurn: round(totalBurn),
            runwayMonths: totalBurn > 0 ? round(trulyAvailable / totalBurn) : null,
            obligations: obligations,
            overdueObligations: obligations.filter(function (entry) { return entry.status === 'overdue'; }),
            dueSoonObligations: obligations.filter(function (entry) { return entry.status === 'due_soon'; }),
            upcomingObligations: obligations.filter(function (entry) { return entry.status === 'upcoming'; }),
            paidObligations: obligations.filter(function (entry) { return entry.status === 'paid'; }),
            income: income,
            incomeThisMonth: {
                confirmed: round(incomeThisMonth.confirmed),
                expected: round(incomeThisMonth.expected),
                risky: round(incomeThisMonth.risky),
                received: round(incomeThisMonth.received)
            },
            incomeScenarios: {
                conservative: round(trulyAvailable + confirmed90 - scheduled90),
                expected: round(trulyAvailable + confirmed90 + expected90 - scheduled90),
                optimistic: round(trulyAvailable + confirmed90 + expected90 + risky90 - scheduled90)
            },
            reviewQueue: reviewQueue.slice(0, 10),
            debtRemaining: round(debtAccounts.reduce(function (sum, debt) {
                return sum + (Number(debt && debt.outstanding) || 0);
            }, 0)),
            reserveGaps: reserveBuckets.filter(function (bucket) {
                return RESERVE_BUCKETS.indexOf(bucket.bucket) !== -1 && Number(bucket.amount) <= 0;
            })
        };
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
        var realBalanceMinor = fiatAccounts.length > 0 ? fiatCashMinor : (hasAssetAnchor ? assetsTotalMinor : realBalanceFromEventsMinor);

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

        var treasury = buildTreasuryModel(readModel, {}, cfg, nowTs);

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
            lastComputedAt: nowIso,
            totalCash: treasury.totalCash,
            reservedCash: treasury.reservedCash,
            trulyAvailableCash: treasury.trulyAvailableCash,
            monthlyPersonalBurn: treasury.monthlyPersonalBurn,
            monthlyBusinessBurn: treasury.monthlyBusinessBurn,
            totalMonthlyBurn: treasury.totalMonthlyBurn,
            availableRunwayMonths: treasury.runwayMonths,
            confirmedIncomeThisMonth: treasury.incomeThisMonth.confirmed,
            expectedIncomeThisMonth: treasury.incomeThisMonth.expected,
            riskyIncomeThisMonth: treasury.incomeThisMonth.risky,
            debtRemaining: treasury.debtRemaining
        };

        if (treasury.totalMonthlyBurn > 0) {
            snapshot.monthlyBurn = treasury.totalMonthlyBurn;
            snapshot.runwayMonths = treasury.runwayMonths;
            snapshot.breakEvenRevenue = treasury.totalMonthlyBurn;
        }

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
            treasury: treasury,
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
