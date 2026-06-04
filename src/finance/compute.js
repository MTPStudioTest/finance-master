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
        var dateOnly = global.FinanceDates && global.FinanceDates.toDateOnly(base);
        if (dateOnly && global.FinanceDates && global.FinanceDates.addDaysDateOnly) {
            return new Date(global.FinanceDates.dateOnlyToNoonIso(global.FinanceDates.addDaysDateOnly(dateOnly, days)));
        }
        var date = new Date(base);
        date.setUTCDate(date.getUTCDate() + days);
        return date;
    }

    function dateOnly(value) {
        return global.FinanceDates && global.FinanceDates.toDateOnly
            ? global.FinanceDates.toDateOnly(value)
            : '';
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
        var raw = String(deal && deal.status || 'expected').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        if (raw === 'open' || raw === 'manual_expected_income') return 'expected';
        if (raw === 'signed' || raw === 'verbal_commitment') return 'confirmed';
        if (raw === 'invoice_sent' || raw === 'sent') return 'invoiced';
        if (raw === 'received' || raw === 'settled' || raw === 'closed') return 'paid';
        if (raw === 'deleted') return 'cancelled';
        if (raw === 'opportunity') return 'lead';
        return ['lead', 'proposal', 'expected', 'confirmed', 'invoiced', 'due', 'overdue', 'paid', 'cancelled', 'lost', 'risky'].indexOf(raw) !== -1 ? raw : 'expected';
    }

    function classifyIncomeDueState(deal, status, nowTs) {
        if (deal && deal.dueState) return String(deal.dueState);
        if (status === 'paid') return 'settled';
        if (status === 'cancelled' || status === 'lost') return 'inactive';
        var due = dateOnly(deal && deal.expectedDateISO);
        var today = dateOnly(nowTs);
        if (!due || !today) return 'upcoming';
        if (due < today) {
            var overdueMs = Date.parse(today + 'T00:00:00.000Z') - Date.parse(due + 'T00:00:00.000Z');
            return overdueMs > 14 * 24 * 60 * 60 * 1000 ? 'severely_overdue' : 'overdue';
        }
        if (status === 'overdue') return 'overdue';
        if (due === today || status === 'due') return 'due_today';
        var dueSoonEnd = global.FinanceDates && global.FinanceDates.addDaysDateOnly
            ? global.FinanceDates.addDaysDateOnly(today, 7)
            : dateOnly(addDays(nowTs, 7));
        if (dueSoonEnd && due <= dueSoonEnd) return 'due_soon';
        return 'upcoming';
    }

    function includeIncome(entry, scenario) {
        var status = String(entry && entry.status || '');
        var probability = Events.clampProbability(entry && entry.probability);
        var incomeType = String(entry && entry.incomeType || '').toLowerCase();
        if (status === 'paid' || status === 'cancelled' || status === 'lost') return false;
        if (scenario === 'conservative') {
            return ['confirmed', 'invoiced', 'due', 'overdue'].indexOf(status) !== -1 && probability >= 0.85;
        }
        if (scenario === 'expected') {
            return includeIncome(entry, 'conservative')
                || ((status === 'expected' || incomeType === 'retainer' || incomeType === 'recurring') && probability >= 0.5);
        }
        if (scenario === 'optimistic') {
            return includeIncome(entry, 'expected')
                || (['proposal', 'lead', 'risky'].indexOf(status) !== -1 && probability > 0);
        }
        return false;
    }

    function classifyObligationStatus(dueDate, nowTs) {
        var due = dateOnly(dueDate);
        var today = dateOnly(nowTs);
        if (!due || !today) return 'needs_review';
        if (due < today) return 'overdue';
        var dueSoonEnd = global.FinanceDates && global.FinanceDates.addDaysDateOnly
            ? global.FinanceDates.addDaysDateOnly(today, 7)
            : dateOnly(addDays(nowTs, 7));
        if (due <= dueSoonEnd) return 'due_soon';
        return 'upcoming';
    }

    function metricExplanation(key, label, value, parts, warnings) {
        return {
            key: key,
            label: label,
            value: round(Number(value) || 0),
            parts: safeArray(parts).map(function (part) {
                return {
                    label: String(part && part.label || ''),
                    value: round(Number(part && part.value) || 0),
                    operation: part && part.operation ? String(part.operation) : undefined
                };
            }),
            warnings: safeArray(warnings).map(function (warning) { return String(warning || ''); }).filter(Boolean)
        };
    }

    function incomeSettledIdMap(transactions) {
        var map = Object.create(null);
        safeArray(transactions).forEach(function (entry) {
            if (String(entry && entry.type) !== 'income.received') return;
            var linkedIncomeId = String(entry && entry.linkedIncomeId || '').trim();
            if (linkedIncomeId) map[linkedIncomeId] = true;
        });
        return map;
    }

    function debtMonthlyPressure(debt) {
        return round(Math.max(0, Number(debt && debt.monthlyPressure) || 0));
    }

    function includeDebtPlanFor(debt, field) {
        var outstanding = Number(debt && debt.outstanding) || 0;
        if (outstanding <= 0 || debtMonthlyPressure(debt) <= 0) return false;
        if (String(debt && debt.planStatus || '') === 'archived' || String(debt && debt.planStatus || '') === 'completed') return false;
        return debt && debt[field] !== false;
    }

    function buildTreasuryModel(readModel, snapshotSeed, cfg, nowTs) {
        var fiatAccounts = safeArray(readModel.fiatAccounts);
        var recurringExpenses = safeArray(readModel.recurringExpenses);
        var obligationReviewMap = Object.create(null);
        safeArray(readModel.obligationReviews).forEach(function (review) {
            if (!review || !review.id) return;
            obligationReviewMap[String(review.id)] = review;
        });
        var transactions = safeArray(readModel.transactions);
        var settledIncomeIds = incomeSettledIdMap(transactions);
        var pipelineDeals = safeArray(readModel.pipelineDeals).filter(function (deal) {
            return isPipelineIncluded(deal && deal.status) && settledIncomeIds[String(deal && deal.id || '')] !== true;
        });
        var debtAccounts = safeArray(readModel.debtAccounts);
        var debtPlanIds = Object.create(null);
        var debtPlansForBurn = debtAccounts.filter(function (debt) {
            if (!includeDebtPlanFor(debt, 'includeInBurnRate')) return false;
            debtPlanIds[String((debt && debt.id) || '')] = true;
            return true;
        });
        var debtPlansForRunway = debtAccounts.filter(function (debt) {
            return includeDebtPlanFor(debt, 'includeInRunway');
        });
        var debtPlansForSafeToSpend = debtAccounts.filter(function (debt) {
            return includeDebtPlanFor(debt, 'includeInSafeToSpend');
        });
        var recurringBurnExpenses = recurringExpenses.filter(function (expense) {
            var linkedDebtId = String(expense && expense.linkedDebtId || '').trim();
            return !linkedDebtId || debtPlanIds[linkedDebtId] !== true;
        });
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

        var personalBurn = recurringBurnExpenses
            .filter(function (expense) { return String(expense && expense.scope || '').toLowerCase() === 'personal' || String(expense && expense.scope || '').toLowerCase() === 'shared'; })
            .reduce(function (sum, expense) { return sum + (Number(expense && expense.monthlyAmount) || 0); }, 0);
        var businessBurn = recurringBurnExpenses
            .filter(function (expense) { return String(expense && expense.scope || '').toLowerCase() === 'business' || String(expense && expense.scope || '').toLowerCase() === 'shared'; })
            .reduce(function (sum, expense) { return sum + (Number(expense && expense.monthlyAmount) || 0); }, 0);
        debtPlansForBurn.forEach(function (debt) {
            var amount = debtMonthlyPressure(debt);
            var scope = String(debt && debt.scope || 'shared').toLowerCase();
            if (scope === 'personal' || scope === 'shared') personalBurn += amount;
            if (scope === 'business' || scope === 'shared') businessBurn += amount;
        });
        var recurringBurn = recurringBurnExpenses
            .reduce(function (sum, expense) { return sum + (Number(expense && expense.monthlyAmount) || 0); }, 0);
        var debtBurn = debtPlansForBurn
            .reduce(function (sum, debt) { return sum + debtMonthlyPressure(debt); }, 0);
        var debtRunwayBurn = debtPlansForRunway
            .reduce(function (sum, debt) { return sum + debtMonthlyPressure(debt); }, 0);
        var totalBurn = recurringBurn + debtBurn;
        var runwayBurn = recurringBurn + debtRunwayBurn;

        var obligations = [];
        var todayOnly = dateOnly(nowTs);
        var todayParts = todayOnly ? todayOnly.split('-').map(Number) : [];
        var forecastEndOnly = dateOnly(forecastEndTs);
        var lookbackStartOnly = global.FinanceDates && global.FinanceDates.addDaysDateOnly
            ? global.FinanceDates.addDaysDateOnly(todayOnly, -30)
            : dateOnly(addDays(nowTs, -30));
        recurringBurnExpenses.forEach(function (expense) {
            var dueDay = Math.max(1, Math.min(28, Number(expense && expense.dueDay) || 1));
            for (var monthOffset = 0; monthOffset < 4; monthOffset += 1) {
                var dueMonth = new Date(Date.UTC(todayParts[0] || new Date(nowTs).getUTCFullYear(), (todayParts[1] || (new Date(nowTs).getUTCMonth() + 1)) - 1 + monthOffset, dueDay, 12, 0, 0, 0));
                var generatedDueDate = global.FinanceDates && global.FinanceDates.dateOnlyFromParts
                    ? global.FinanceDates.dateOnlyFromParts(dueMonth.getUTCFullYear(), dueMonth.getUTCMonth() + 1, dueMonth.getUTCDate())
                    : dueMonth.toISOString().slice(0, 10);
                if (forecastEndOnly && generatedDueDate > forecastEndOnly) continue;
                if (monthOffset > 0 || !lookbackStartOnly || generatedDueDate >= lookbackStartOnly) {
                    var obligationId = String((expense && expense.id) || 'expense') + '-' + generatedDueDate.slice(0, 7);
                    var review = obligationReviewMap[obligationId] || null;
                    var dueDate = generatedDueDate;
                    var status = classifyObligationStatus(generatedDueDate, nowTs);
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
                        originalDueDate: generatedDueDate,
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
            var planStatus = String(debt && debt.planStatus || 'missing');
            if (planStatus === 'archived' || planStatus === 'completed') return;
            var debtDueDate = dateOnly((planStatus === 'starts_later' && debt && debt.startDate) || (debt && debt.dueDate));
            var pressure = debtMonthlyPressure(debt);
            if ((planStatus === 'on_hold' || planStatus === 'irregular') && pressure <= 0) return;
            var hasPlan = pressure > 0 || planStatus === 'on_hold' || planStatus === 'starts_later' || planStatus === 'irregular';
            obligations.push({
                id: String((debt && debt.id) || 'debt'),
                title: String((debt && debt.name) || 'Debt repayment'),
                type: 'debt',
                amount: round((Number(debt && debt.paymentAmount) || Number(debt && debt.minimumPayment) || 0) > 0 ? (Number(debt && debt.paymentAmount) || Number(debt && debt.minimumPayment)) : outstanding),
                dueDate: debtDueDate,
                planStatus: planStatus,
                monthlyPressure: pressure,
                status: hasPlan ? (pressure > 0 ? classifyObligationStatus(debtDueDate, nowTs) : planStatus) : 'needs_review',
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
            var probability = Events.clampProbability(deal && deal.probability);
            var grossAmount = Number.isFinite(Number(deal && deal.grossAmount))
                ? round(Number(deal && deal.grossAmount))
                : round(Number(deal && deal.value) || 0);
            return {
                id: String((deal && deal.id) || ''),
                title: String((deal && deal.title) || 'Income'),
                amount: grossAmount,
                grossAmount: grossAmount,
                netAmount: Number.isFinite(Number(deal && deal.netAmount)) ? round(Number(deal && deal.netAmount)) : null,
                vatRate: Number.isFinite(Number(deal && deal.vatRate)) ? Number(deal && deal.vatRate) : 0,
                vatAmount: Number.isFinite(Number(deal && deal.vatAmount)) ? round(Number(deal && deal.vatAmount)) : 0,
                dueDate: dateOnly(deal && deal.expectedDateISO),
                status: status,
                dueState: classifyIncomeDueState(deal, status, nowTs),
                probability: probability,
                weightedAmount: round(grossAmount * probability),
                incomeType: String((deal && deal.incomeType) || 'one_off'),
                projectId: String((deal && deal.projectId) || ''),
                scope: String((deal && deal.scope) || 'shared')
            };
        }).filter(function (entry) {
            return entry.status !== 'paid' && entry.status !== 'cancelled' && entry.status !== 'lost';
        });

        var incomeThisMonth = { confirmed: 0, invoiced: 0, due: 0, overdue: 0, expected: 0, proposal: 0, lead: 0, risky: 0, recurring: 0, received: 0 };
        income.forEach(function (entry) {
            var ts = Date.parse(entry.dueDate || '');
            if (!Number.isFinite(ts) || ts < monthStart || ts > monthEnd) return;
            if (entry.status === 'confirmed') incomeThisMonth.confirmed += entry.amount;
            if (entry.status === 'invoiced') incomeThisMonth.invoiced += entry.amount;
            if (entry.status === 'due') incomeThisMonth.due += entry.amount;
            if (entry.status === 'overdue' || entry.dueState === 'overdue' || entry.dueState === 'severely_overdue') incomeThisMonth.overdue += entry.amount;
            if (entry.status === 'expected') incomeThisMonth.expected += entry.amount;
            if (entry.status === 'proposal') incomeThisMonth.proposal += entry.amount;
            if (entry.status === 'lead') incomeThisMonth.lead += entry.amount;
            if (entry.status === 'risky') incomeThisMonth.risky += entry.amount;
            if (entry.incomeType === 'retainer' || entry.incomeType === 'recurring') incomeThisMonth.recurring += entry.amount;
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

        function isInsideDays(entry, days) {
            var ts = Date.parse(entry && entry.dueDate || '');
            if (!Number.isFinite(ts)) return false;
            return ts >= nowTs && ts <= addDays(nowTs, days).getTime();
        }

        var forecastIncome = income.filter(isInsideForecast);
        var conservative90 = forecastIncome.filter(function (entry) { return includeIncome(entry, 'conservative'); })
            .reduce(function (sum, entry) { return sum + ((Number(entry.amount) || 0) * Events.clampProbability(entry.probability)); }, 0);
        var expected90 = forecastIncome.filter(function (entry) { return includeIncome(entry, 'expected') && !includeIncome(entry, 'conservative'); })
            .reduce(function (sum, entry) { return sum + ((Number(entry.amount) || 0) * Events.clampProbability(entry.probability)); }, 0);
        var optimistic90 = forecastIncome.filter(function (entry) { return includeIncome(entry, 'optimistic') && !includeIncome(entry, 'expected'); })
            .reduce(function (sum, entry) { return sum + ((Number(entry.amount) || 0) * Events.clampProbability(entry.probability)); }, 0);
        var scheduled90 = obligations
            .filter(function (entry) { return entry.status !== 'paid'; })
            .reduce(function (sum, entry) { return sum + (Number(entry.amount) || 0); }, 0);
        var trulyAvailable = round(totalCash - reservedCash);

        function pushReviewItem(item) {
            reviewQueue.push(Object.assign({
                kind: 'setup',
                targetId: '',
                actionLabel: 'Review',
                tone: 'review'
            }, item));
        }

        var reviewQueue = [];
        obligations.filter(function (entry) {
            return entry.status === 'overdue' || entry.status === 'due_soon' || entry.status === 'needs_review' || entry.status === 'deferred';
        }).slice(0, 8).forEach(function (entry) {
            var isDebt = String(entry.type) === 'debt';
            reviewQueue.push({
                kind: isDebt ? 'debt' : 'obligation',
                id: entry.id,
                targetId: entry.id,
                title: entry.title,
                reason: isDebt ? 'Debt needs a due date or payment plan' : (entry.status === 'overdue' ? 'Overdue obligation' : (entry.status === 'due_soon' ? 'Due within 7 days' : 'Needs an obligation decision')),
                actionLabel: isDebt ? 'Add plan' : (entry.status === 'overdue' ? 'Mark paid' : 'Review'),
                tone: entry.status === 'overdue' ? 'urgent' : 'review'
            });
        });
        transactions.filter(function (entry) {
            return String(entry && entry.type) === 'expense.recorded'
                && !String(entry && entry.obligationId || '').trim()
                && String(entry && entry.categoryId || '').toLowerCase() === 'obligation';
        }).slice(0, 4).forEach(function (entry) {
            pushReviewItem({
                kind: 'payment',
                id: String(entry && entry.id || ''),
                targetId: String(entry && entry.id || ''),
                title: String(entry && entry.description || 'Payment'),
                reason: 'Actual payment needs matching to an obligation',
                actionLabel: 'Match',
                tone: 'review'
            });
        });
        transactions.filter(function (entry) {
            return String(entry && entry.categoryId || '').toLowerCase() === 'uncategorized'
                || String(entry && entry.reviewStatus || '').toLowerCase() === 'needs_review';
        }).slice(0, 4).forEach(function (entry) {
            pushReviewItem({
                kind: 'transaction',
                id: String(entry && entry.id || ''),
                targetId: String(entry && entry.id || ''),
                title: String(entry && entry.description || 'Transaction'),
                reason: 'Uncategorized transaction',
                actionLabel: 'Categorize',
                tone: 'review'
            });
        });
        income.filter(function (entry) {
            return entry.status === 'risky'
                || entry.status === 'lead'
                || entry.status === 'proposal'
                || entry.dueState === 'overdue'
                || entry.dueState === 'severely_overdue';
        }).slice(0, 4).forEach(function (entry) {
            reviewQueue.push({
                kind: 'pipeline',
                id: entry.id,
                targetId: entry.id,
                title: entry.title,
                reason: (entry.dueState === 'overdue' || entry.dueState === 'severely_overdue') ? 'Expected income is overdue' : 'Income confidence needs review',
                actionLabel: (entry.dueState === 'overdue' || entry.dueState === 'severely_overdue') ? 'Received' : 'Update',
                tone: 'review'
            });
        });
        if (!fiatAccounts.length) {
            reviewQueue.unshift({ kind: 'setup', id: 'missing-cash', targetId: 'missing-cash', title: 'Cash baseline', reason: 'Add at least one cash account', actionLabel: 'Add account', tone: 'urgent' });
        }
        if (!recurringExpenses.length) {
            pushReviewItem({ kind: 'setup', id: 'missing-burn', targetId: 'missing-burn', title: 'Monthly burn', reason: 'Add recurring fixed costs', actionLabel: 'Add recurring cost', tone: 'review' });
        }

        var actionThisWeekItems = reviewQueue.filter(function (item) {
            return ['obligation', 'payment', 'transaction', 'pipeline', 'debt', 'setup'].indexOf(String(item && item.kind || '')) !== -1;
        }).slice(0, 6);
        var next30Income = income.filter(function (entry) { return isInsideDays(entry, 30); });
        var next30Obligations = obligations.filter(function (entry) {
            return entry.status !== 'paid' && isInsideDays(entry, 30);
        });
        var next30Confirmed = next30Income
            .filter(function (entry) { return includeIncome(entry, 'conservative'); })
            .reduce(function (sum, entry) { return sum + ((Number(entry.amount) || 0) * Events.clampProbability(entry.probability)); }, 0);
        var next30ExpectedWeighted = next30Income
            .filter(function (entry) { return includeIncome(entry, 'expected') && !includeIncome(entry, 'conservative'); })
            .reduce(function (sum, entry) { return sum + ((Number(entry.amount) || 0) * Events.clampProbability(entry.probability)); }, 0);
        var next30ObligationTotal = next30Obligations
            .reduce(function (sum, entry) { return sum + (Number(entry.amount) || 0); }, 0);
        var confirmedShortTermObligations = next30Obligations
            .filter(function (entry) { return String(entry && entry.type || '') !== 'debt'; })
            .reduce(function (sum, entry) { return sum + (Number(entry.amount) || 0); }, 0);
        var debtPaymentsDueSoon = debtPlansForSafeToSpend
            .reduce(function (sum, debt) {
                return sum + debtMonthlyPressure(debt);
            }, 0);
        var actualCash = round(totalCash);
        var protectedCash = round(reservedCash);
        var committedShortTermObligations = round(next30ObligationTotal);
        var availableCash = round(actualCash - protectedCash - committedShortTermObligations);
        var minimumBufferDays = 7;
        var minimumBuffer = round(totalBurn > 0 ? (totalBurn * minimumBufferDays / 30) : 0);
        var safeToSpendWarnings = [];
        if (totalBurn <= 0) safeToSpendWarnings.push('Minimum buffer is unavailable until monthly burn is known.');
        if (debtAccounts.some(function (debt) {
            return (Number(debt && debt.outstanding) || 0) > 0
                && String(debt && debt.planStatus || 'missing') === 'missing';
        })) {
            safeToSpendWarnings.push('Some debt items still need payment plans.');
        }
        var safeToSpend = round(actualCash - protectedCash - confirmedShortTermObligations - debtPaymentsDueSoon - minimumBuffer);
        var debtRemaining = round(debtAccounts.reduce(function (sum, debt) {
            return sum + (Number(debt && debt.outstanding) || 0);
        }, 0));
        var explanations = {
            actualCash: metricExplanation('actualCash', 'Actual cash', actualCash, [
                { label: 'Active liquid account balances', value: actualCash, operation: 'add' }
            ]),
            protectedCash: metricExplanation('protectedCash', 'Protected cash', protectedCash, reserveBuckets
                .filter(function (bucket) { return Number(bucket && bucket.amount) > 0; })
                .map(function (bucket) { return { label: String(bucket.label || 'Reserve bucket'), value: Number(bucket.amount) || 0, operation: 'add' }; })),
            availableCash: metricExplanation('availableCash', 'Available cash', availableCash, [
                { label: 'Actual cash', value: actualCash, operation: 'add' },
                { label: 'This money is protected', value: protectedCash, operation: 'subtract' },
                { label: 'Due within 30 days', value: committedShortTermObligations, operation: 'subtract' }
            ]),
            safeToSpend: metricExplanation('safeToSpend', 'Safe-to-Spend', safeToSpend, [
                { label: 'Actual cash', value: actualCash, operation: 'add' },
                { label: 'This money is protected', value: protectedCash, operation: 'subtract' },
                { label: 'Confirmed obligations due within 30 days', value: confirmedShortTermObligations, operation: 'subtract' },
                { label: 'Debt payments due soon', value: debtPaymentsDueSoon, operation: 'subtract' },
                { label: 'Minimum 7-day buffer', value: minimumBuffer, operation: 'subtract' }
            ], safeToSpendWarnings),
            monthlyBurnRate: metricExplanation('monthlyBurnRate', 'Monthly burn rate', totalBurn, [
                { label: 'Recurring costs', value: recurringBurn, operation: 'add' },
                { label: 'Debt payment plans', value: debtBurn, operation: 'add' }
            ]),
            runway: metricExplanation('runway', 'Runway', runwayBurn > 0 ? round(availableCash / runwayBurn) : 0, [
                { label: 'Available cash', value: availableCash, operation: 'divide' },
                { label: 'Monthly burn rate', value: runwayBurn, operation: 'divide' }
            ], runwayBurn > 0 ? [] : ['Runway is unavailable until monthly burn is known.']),
            debtPressure: metricExplanation('debtPressure', 'Debt pressure', debtBurn, debtPlansForBurn.length
                ? debtPlansForBurn.map(function (debt) { return { label: String(debt.name || 'Debt payment plan'), value: debtMonthlyPressure(debt), operation: 'add' }; })
                : [{ label: 'Active debt payment plans', value: 0, operation: 'add' }],
                debtAccounts.some(function (debt) { return (Number(debt && debt.outstanding) || 0) > 0 && String(debt && debt.planStatus || 'missing') === 'missing'; })
                    ? ['Some debt items still need payment plans.']
                    : []),
            debtBurden: metricExplanation('debtBurden', 'Debt burden', debtRemaining, debtAccounts
                .filter(function (debt) { return (Number(debt && debt.outstanding) || 0) > 0; })
                .map(function (debt) { return { label: String(debt.name || 'Debt'), value: Number(debt.outstanding) || 0, operation: 'add' }; }))
        };

        return {
            actualCash: actualCash,
            totalCash: actualCash,
            protectedCash: protectedCash,
            reservedCash: protectedCash,
            trulyAvailableCash: trulyAvailable,
            availableCash: availableCash,
            safeToSpend: safeToSpend,
            committedShortTermObligations: committedShortTermObligations,
            confirmedShortTermObligations: round(confirmedShortTermObligations),
            debtPaymentsDueSoon: round(debtPaymentsDueSoon),
            minimumBuffer: minimumBuffer,
            minimumBufferDays: minimumBufferDays,
            shortTermObligationWindowDays: 30,
            reserveBuckets: reserveBuckets,
            monthlyPersonalBurn: round(personalBurn),
            monthlyBusinessBurn: round(businessBurn),
            totalMonthlyBurn: round(totalBurn),
            runwayMonths: runwayBurn > 0 ? round(availableCash / runwayBurn) : null,
            explanations: explanations,
            obligations: obligations,
            overdueObligations: obligations.filter(function (entry) { return entry.status === 'overdue'; }),
            dueSoonObligations: obligations.filter(function (entry) { return entry.status === 'due_soon'; }),
            upcomingObligations: obligations.filter(function (entry) { return entry.status === 'upcoming'; }),
            paidObligations: obligations.filter(function (entry) { return entry.status === 'paid'; }),
            income: income,
            incomeThisMonth: {
                confirmed: round(incomeThisMonth.confirmed),
                invoiced: round(incomeThisMonth.invoiced),
                due: round(incomeThisMonth.due),
                overdue: round(incomeThisMonth.overdue),
                expected: round(incomeThisMonth.expected),
                proposal: round(incomeThisMonth.proposal),
                lead: round(incomeThisMonth.lead),
                risky: round(incomeThisMonth.risky),
                recurring: round(incomeThisMonth.recurring),
                received: round(incomeThisMonth.received)
            },
            incomeScenarios: {
                conservative: round(availableCash + conservative90 - scheduled90),
                expected: round(availableCash + conservative90 + expected90 - scheduled90),
                optimistic: round(availableCash + conservative90 + expected90 + optimistic90 - scheduled90)
            },
            dashboardSummary: {
                actionThisWeek: {
                    count: reviewQueue.length,
                    urgentCount: reviewQueue.filter(function (item) { return item && item.tone === 'urgent'; }).length,
                    items: actionThisWeekItems
                },
                next30Days: {
                    confirmedIncoming: round(next30Confirmed),
                    expectedWeightedIncoming: round(next30ExpectedWeighted),
                    obligationsDue: round(next30ObligationTotal),
                    projectedNetMovement: round(next30Confirmed + next30ExpectedWeighted - next30ObligationTotal),
                    incomeCount: next30Income.length,
                    obligationCount: next30Obligations.length
                }
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

        var settledIncomeIdsForForecast = incomeSettledIdMap(readModel.transactions);
        safeArray(readModel.pipelineDeals).forEach(function (deal) {
            if (!isPipelineIncluded(deal.status)) return;
            if (settledIncomeIdsForForecast[String(deal && deal.id || '')] === true) return;

            var probability = Events.clampProbability(deal.probability);
            var weightedMinor = Events.toMinor((toNumber(deal.value, 0) * probability));
            weightedPipelineMinor += weightedMinor;

            if (isWithinForecast(deal.expectedDateISO, nowTs, forecastEndTs)) {
                forecastExpectedPipelineMinor += weightedMinor;
            }
        });

        var recurringMonthlyMinor = Events.toMinor(readModel.recurringMonthlyTotal || 0);
        var essentialRecurringMinor = Events.toMinor(safeArray(readModel.activeRecurringExpenses).filter(function(e){ return e.essential; }).reduce(function(sum, e){ return sum + (Number(e.monthlyAmount) || 0); }, 0));
        var survivalBurnMinor = essentialRecurringMinor;
        var comfortBurnMinor = recurringMonthlyMinor;
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

        var reserveTotalMinor = Events.toMinor(safeArray(readModel.reserveBuckets).reduce(function(sum, b) { return sum + (Number(b.currentAmount) || 0); }, 0));
        var trulyAvailableMinor = Math.max(0, realBalanceMinor - reserveTotalMinor);
        
        var monthlyBurn = monthlyBurnMinor == null ? null : Events.fromMinor(monthlyBurnMinor);
        var survivalBurn = Events.fromMinor(survivalBurnMinor);
        var comfortBurn = Events.fromMinor(comfortBurnMinor);
        
        var runwayMonths = null;
        if (monthlyBurnMinor != null && monthlyBurnMinor > 0) {
            runwayMonths = round(Events.fromMinor(trulyAvailableMinor) / Events.fromMinor(monthlyBurnMinor));
        }

        var breakEvenRevenue = monthlyBurn;

        var treasury = buildTreasuryModel(readModel, {}, cfg, nowTs);

        
        var attentionQueue = [];
        
        // 1. Transactions needing review
        safeArray(readModel.transactions).forEach(function(tx) {
            if (tx.reviewStatus === 'needs_review' || tx.categoryId === 'uncategorized') {
                attentionQueue.push({ type: 'Needs review', title: tx.description, amount: tx.amount, action: 'Review', id: tx.id, original: tx });
            }
        });
        
        // 2. Overdue invoices
        safeArray(readModel.invoices).forEach(function(inv) {
            if (inv.status !== 'Paid' && inv.expectedDate) {
                var expectedTs = Date.parse(inv.expectedDate);
                if (Number.isFinite(expectedTs) && expectedTs < nowTs) {
                    attentionQueue.push({ type: 'Overdue', title: inv.client + ' invoice', amount: inv.amount, action: 'Mark paid', id: inv.id, original: inv });
                }
            }
        });
        
        // 3. Due soon obligations
        safeArray(treasury.upcomingObligations).concat(safeArray(treasury.overdueObligations)).forEach(function(obl) {
            attentionQueue.push({ type: 'Due soon', title: obl.title, amount: obl.amount, action: 'Review', id: obl.id, original: obl });
        });
        
        // 4. Missing plan for debt
        safeArray(readModel.debtAccounts).forEach(function(debt) {
            if (debt.outstanding > 0 && String(debt.planStatus || 'missing') === 'missing') {
                attentionQueue.push({ type: 'Missing plan', title: debt.name, amount: debt.outstanding, action: 'Add plan', id: debt.id, original: debt });
            }
        });
        
        // 5. Missing forecast input
        if (safeArray(readModel.pipelineDeals).filter(function(d) { return Ledger.isPipelineActive(d.status); }).length === 0) {
            attentionQueue.push({ type: 'Missing forecast input', title: 'Income pipeline', amount: null, action: 'Add income', id: 'pipeline-missing' });
        }
        
        // 6. Missing reserves
        if (safeArray(readModel.reserveBuckets).length === 0) {
            attentionQueue.push({ type: 'Missing plan', title: 'Reserve buckets', amount: null, action: 'Create reserve', id: 'reserves-missing' });
        }
        
var snapshot = {
            realBalance: Events.fromMinor(realBalanceMinor),
            projectedBalance: Events.fromMinor(projectedBalanceMinor),
            attentionQueue: attentionQueue,
            trulyAvailable: Events.fromMinor(trulyAvailableMinor),
            reserveTotal: Events.fromMinor(reserveTotalMinor),
            survivalBurn: survivalBurn,
            comfortBurn: comfortBurn,
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
            actualCash: treasury.actualCash,
            reservedCash: treasury.reservedCash,
            protectedCash: treasury.protectedCash,
            trulyAvailableCash: treasury.trulyAvailableCash,
            availableCash: treasury.availableCash,
            safeToSpend: treasury.safeToSpend,
            committedShortTermObligations: treasury.committedShortTermObligations,
            confirmedShortTermObligations: treasury.confirmedShortTermObligations,
            debtPaymentsDueSoon: treasury.debtPaymentsDueSoon,
            minimumBuffer: treasury.minimumBuffer,
            minimumBufferDays: treasury.minimumBufferDays,
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
            explanations: Object.assign({}, treasury.explanations, {
                forecastConfidence: metricExplanation('forecastConfidence', 'Forecast confidence', Math.round((Number(confidenceResult.score) || 0) * 100), [
                    { label: 'Confidence score', value: Math.round((Number(confidenceResult.score) || 0) * 100), operation: 'add' }
                ], confidenceResult.reasons || confidenceResult.missingInputs || [])
            }),
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
