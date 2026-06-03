(function (global) {
    'use strict';

    var Events = global.FinanceEvents;
    if (!Events && typeof module !== 'undefined' && module.exports) {
        Events = require('./events.js');
    }
    if (!Events) {
        throw new Error('FinanceEvents is required before FinanceLedger.');
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function normalizeSettings(settings) {
        var source = settings && typeof settings === 'object' ? settings : {};
        return {
            baseCurrency: Events.normalizeCurrency(source.baseCurrency, 'EUR'),
            forecastDays: Number.isFinite(Number(source.forecastDays)) ? Math.max(1, Math.floor(Number(source.forecastDays))) : 90,
            nowIso: Events.isIsoTimestamp(source.nowIso) ? new Date(source.nowIso).toISOString() : new Date().toISOString()
        };
    }

    function assertCurrency(draft, baseCurrency) {
        var currency = Events.normalizeCurrency(draft && draft.currency, baseCurrency);
        if (currency !== Events.normalizeCurrency(baseCurrency, 'EUR')) {
            throw new Error('Event currency must match base currency (' + baseCurrency + ').');
        }
    }

    function appendEvents(currentEvents, drafts, settings, options) {
        var cfg = normalizeSettings(settings);
        var opts = options || {};
        var list = safeArray(currentEvents).slice();
        var created = [];

        safeArray(drafts).forEach(function (draft) {
            if (!draft || typeof draft !== 'object') return;
            assertCurrency(draft, cfg.baseCurrency);
            var event = Events.createFinancialEvent(draft, {
                baseCurrency: cfg.baseCurrency,
                nowIso: opts.nowIso || cfg.nowIso,
                allowApproximateTimestamp: Boolean(opts.allowApproximateTimestamp)
            });
            list.push(event);
            created.push(event);
        });

        return {
            events: Events.sortFinancialEvents(list),
            appended: created
        };
    }

    function reverseEvent(currentEvents, eventId, reason, settings, options) {
        var sorted = Events.sortFinancialEvents(currentEvents);
        var target = sorted.find(function (item) {
            return item && String(item.id) === String(eventId);
        });
        if (!target) {
            throw new Error('Cannot reverse missing finance event: ' + eventId);
        }

        var reversalDraft = {
            type: 'finance.event_reversed',
            amount: 0,
            currency: target.currency || ((settings && settings.baseCurrency) || 'EUR'),
            related_entity_id: String(target.id),
            timestamp: (options && options.timestamp) || (settings && settings.nowIso) || new Date().toISOString(),
            metadata: {
                reason: String(reason || 'undo'),
                reversed_event_id: String(target.id)
            }
        };

        return appendEvents(currentEvents, [reversalDraft], settings, options);
    }

    function getActiveEvents(events) {
        var sorted = Events.sortFinancialEvents(events);
        var reversedIds = Events.resolveReversedEventIds(sorted);
        return sorted.filter(function (event) {
            if (!event) return false;
            if (event.type === 'finance.event_reversed') return false;
            return !reversedIds.has(String(event.id));
        });
    }

    function isPipelineActive(stage) {
        var state = String(stage || '').toLowerCase();
        return state !== 'paid' && state !== 'closed' && state !== 'lost' && state !== 'cancelled' && state !== 'deleted';
    }

    function toIsoDateOnly(value) {
        return Events.toDateOnly ? Events.toDateOnly(value) : (global.FinanceDates ? global.FinanceDates.toDateOnly(value) : '');
    }

    function buildReadModel(events, settings) {
        var cfg = normalizeSettings(settings);
        var nowIso = cfg.nowIso;
        var nowTs = Date.parse(nowIso);
        var thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        var activeEvents = getActiveEvents(events);

        var pipelineById = Object.create(null);
        var invoiceById = Object.create(null);
        var recurringById = Object.create(null);
        var obligationReviewById = Object.create(null);
        var transactionReviewById = Object.create(null);
        var debtById = Object.create(null);
        var fiatById = Object.create(null);
        var web3ById = Object.create(null);
        var defiById = Object.create(null);
        var reserveById = Object.create(null);
        var transactions = [];

        var incomeLast30Minor = 0;

        activeEvents.forEach(function (event) {
            var metadata = event.metadata && typeof event.metadata === 'object' ? event.metadata : {};
            var relatedId = String(event.related_entity_id || metadata.entity_id || metadata.id || event.id);
            var eventAmount = Number(event.amount) || 0;
            var eventTs = Date.parse(event.timestamp);
            var ageMs = Number.isFinite(eventTs) ? Math.max(0, nowTs - eventTs) : Number.POSITIVE_INFINITY;

            if (event.type === 'income.received' || event.type === 'expense.recorded' || event.type === 'transfer.recorded' || event.type === 'cash.adjusted') {
                var direction = String(metadata.direction || '').trim();
                var displayAmount = eventAmount;
                if (event.type === 'expense.recorded') direction = 'out';
                if (event.type === 'income.received') direction = 'in';
                if (event.type === 'transfer.recorded') direction = 'transfer';
                if (event.type === 'cash.adjusted') direction = direction === 'decrease' ? 'out' : 'in';
                if (event.type === 'expense.recorded' || (event.type === 'cash.adjusted' && direction === 'out')) displayAmount = -Math.abs(eventAmount);
                transactions.push({
                    id: event.id,
                    transactionEntityId: relatedId,
                    type: event.type,
                    ledgerType: String(metadata.ledgerType || (event.type === 'income.received' ? 'income' : event.type === 'expense.recorded' ? 'expense' : event.type === 'transfer.recorded' ? 'transfer' : 'adjustment')),
                    direction: direction,
                    description: String(metadata.description || event.type),
                    amount: eventAmount,
                    signedAmount: displayAmount,
                    currency: event.currency,
                    accountId: String(metadata.accountId || '').trim(),
                    accountName: String(metadata.accountName || '').trim(),
                    fromAccountId: String(metadata.fromAccountId || '').trim(),
                    fromAccountName: String(metadata.fromAccountName || '').trim(),
                    toAccountId: String(metadata.toAccountId || '').trim(),
                    toAccountName: String(metadata.toAccountName || '').trim(),
                    categoryId: String(metadata.categoryId || 'uncategorized'),
                    scope: String(metadata.scope || 'shared'),
                    source: String(metadata.source || 'manual'),
                    importBatchId: String(metadata.importBatchId || '').trim(),
                    fingerprint: String(metadata.fingerprint || '').trim(),
                    obligationId: String(metadata.obligationId || '').trim(),
                    obligationDueDate: String(metadata.obligationDueDate || '').trim(),
                    obligationTitle: String(metadata.obligationTitle || '').trim(),
                    linkedIncomeId: String(metadata.invoiceId || metadata.pipelineId || metadata.linkedIncomeId || '').trim(),
                    reviewStatus: String(metadata.reviewStatus || '').trim() || (String(metadata.categoryId || 'uncategorized').toLowerCase() === 'uncategorized' ? 'needs_review' : 'clear'),
                    reviewNotes: '',
                    timestamp: event.timestamp
                });
            }

            if (event.type === 'income.received' && ageMs <= thirtyDaysMs) {
                incomeLast30Minor += Events.toMinor(eventAmount);
            }

            if (event.type === 'pipeline.created') {
                pipelineById[relatedId] = {
                    id: relatedId,
                    title: String(metadata.title || metadata.name || metadata.client || 'Pipeline Item'),
                    value: Number.isFinite(Number(metadata.value)) ? Number(metadata.value) : eventAmount,
                    probability: Events.clampProbability(metadata.probability != null ? metadata.probability : 1),
                    status: String(metadata.stage || metadata.status || 'open'),
                    expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                    destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                    destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                    scope: String(metadata.scope || 'shared'),
                    scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                    currency: event.currency,
                    createdAt: event.timestamp,
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'pipeline.stage_changed') {
                if (!pipelineById[relatedId]) {
                    pipelineById[relatedId] = {
                        id: relatedId,
                        title: String(metadata.title || metadata.name || 'Pipeline Item'),
                        value: 0,
                        probability: Events.clampProbability(metadata.probability != null ? metadata.probability : 1),
                        status: String(metadata.stage || metadata.status || 'open'),
                        expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        scope: String(metadata.scope || 'shared'),
                        scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                        currency: event.currency,
                        createdAt: event.timestamp,
                        updatedAt: event.timestamp
                    };
                }
                pipelineById[relatedId].status = String(metadata.stage || metadata.status || pipelineById[relatedId].status || 'open');
                pipelineById[relatedId].scope = String(metadata.scope || pipelineById[relatedId].scope || 'shared');
                if (metadata.expectedDateISO || metadata.expectedDate) {
                    pipelineById[relatedId].expectedDateISO = toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate);
                }
                if (metadata.title || metadata.name) {
                    pipelineById[relatedId].title = String(metadata.title || metadata.name);
                }
                if (metadata.scenarioInclusion) {
                    pipelineById[relatedId].scenarioInclusion = String(metadata.scenarioInclusion);
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountId')) {
                    pipelineById[relatedId].destinationAccountId = String(metadata.destinationAccountId || '').trim();
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountName')) {
                    pipelineById[relatedId].destinationAccountName = String(metadata.destinationAccountName || '').trim();
                }
                pipelineById[relatedId].updatedAt = event.timestamp;
                return;
            }

            if (event.type === 'pipeline.value_changed') {
                if (!pipelineById[relatedId]) {
                    pipelineById[relatedId] = {
                        id: relatedId,
                        title: String(metadata.title || metadata.name || 'Pipeline Item'),
                        value: 0,
                        probability: Events.clampProbability(metadata.probability != null ? metadata.probability : 1),
                        status: String(metadata.stage || metadata.status || 'open'),
                        expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        scope: String(metadata.scope || 'shared'),
                        scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                        currency: event.currency,
                        createdAt: event.timestamp,
                        updatedAt: event.timestamp
                    };
                }
                pipelineById[relatedId].value = Number.isFinite(Number(metadata.value)) ? Number(metadata.value) : eventAmount;
                pipelineById[relatedId].scope = String(metadata.scope || pipelineById[relatedId].scope || 'shared');
                if (metadata.expectedDateISO || metadata.expectedDate) {
                    pipelineById[relatedId].expectedDateISO = toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate);
                }
                if (metadata.title || metadata.name) {
                    pipelineById[relatedId].title = String(metadata.title || metadata.name);
                }
                if (metadata.scenarioInclusion) {
                    pipelineById[relatedId].scenarioInclusion = String(metadata.scenarioInclusion);
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountId')) {
                    pipelineById[relatedId].destinationAccountId = String(metadata.destinationAccountId || '').trim();
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountName')) {
                    pipelineById[relatedId].destinationAccountName = String(metadata.destinationAccountName || '').trim();
                }
                pipelineById[relatedId].updatedAt = event.timestamp;
                return;
            }

            if (event.type === 'pipeline.probability_changed') {
                if (!pipelineById[relatedId]) {
                    pipelineById[relatedId] = {
                        id: relatedId,
                        title: String(metadata.title || metadata.name || 'Pipeline Item'),
                        value: Number.isFinite(Number(metadata.value)) ? Number(metadata.value) : eventAmount,
                        probability: 1,
                        status: String(metadata.stage || metadata.status || 'open'),
                        expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        scope: String(metadata.scope || 'shared'),
                        scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                        currency: event.currency,
                        createdAt: event.timestamp,
                        updatedAt: event.timestamp
                    };
                }
                pipelineById[relatedId].probability = Events.clampProbability(metadata.probability != null ? metadata.probability : eventAmount);
                pipelineById[relatedId].scope = String(metadata.scope || pipelineById[relatedId].scope || 'shared');
                if (metadata.expectedDateISO || metadata.expectedDate) {
                    pipelineById[relatedId].expectedDateISO = toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate);
                }
                if (metadata.scenarioInclusion) {
                    pipelineById[relatedId].scenarioInclusion = String(metadata.scenarioInclusion);
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountId')) {
                    pipelineById[relatedId].destinationAccountId = String(metadata.destinationAccountId || '').trim();
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountName')) {
                    pipelineById[relatedId].destinationAccountName = String(metadata.destinationAccountName || '').trim();
                }
                pipelineById[relatedId].updatedAt = event.timestamp;
                return;
            }

            if (event.type === 'invoice.sent') {
                invoiceById[relatedId] = {
                    id: relatedId,
                    client: String(metadata.client || metadata.title || metadata.name || 'Invoice'),
                    amount: Number.isFinite(Number(metadata.amount)) ? Number(metadata.amount) : eventAmount,
                    expectedDate: toIsoDateOnly(metadata.expectedDate || metadata.expectedDateISO || event.timestamp),
                    status: String(metadata.status || 'Sent'),
                    destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                    destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                    scope: String(metadata.scope || 'shared'),
                    currency: event.currency,
                    sentAt: event.timestamp,
                    paidAt: null
                };
                return;
            }

            if (event.type === 'invoice.paid') {
                if (!invoiceById[relatedId]) {
                    invoiceById[relatedId] = {
                        id: relatedId,
                        client: String(metadata.client || metadata.title || metadata.name || 'Invoice'),
                        amount: Number.isFinite(Number(metadata.amount)) ? Number(metadata.amount) : eventAmount,
                        expectedDate: toIsoDateOnly(metadata.expectedDate || metadata.expectedDateISO || event.timestamp),
                        status: 'Paid',
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        scope: String(metadata.scope || 'shared'),
                        currency: event.currency,
                        sentAt: event.timestamp,
                        paidAt: event.timestamp
                    };
                }
                invoiceById[relatedId].status = 'Paid';
                invoiceById[relatedId].paidAt = event.timestamp;
                invoiceById[relatedId].scope = String(metadata.scope || invoiceById[relatedId].scope || 'shared');
                if (Number.isFinite(Number(metadata.amount))) {
                    invoiceById[relatedId].amount = Number(metadata.amount);
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountId')) {
                    invoiceById[relatedId].destinationAccountId = String(metadata.destinationAccountId || '').trim();
                }
                if (Object.prototype.hasOwnProperty.call(metadata, 'destinationAccountName')) {
                    invoiceById[relatedId].destinationAccountName = String(metadata.destinationAccountName || '').trim();
                }
                return;
            }

            if (event.type === 'expense.recurring_set') {
                recurringById[relatedId] = {
                    id: relatedId,
                    category: String(metadata.category || metadata.name || 'Recurring Expense'),
                    monthlyAmount: Number.isFinite(Number(metadata.monthlyAmount)) ? Number(metadata.monthlyAmount) : Math.abs(eventAmount),
                    essential: Boolean(metadata.essential),
                    active: metadata.active !== false,
                    dueDay: Math.max(1, Math.min(28, Number(metadata.dueDay) || 1)),
                    frequency: String(metadata.frequency || 'monthly'),
                    scope: String(metadata.scope || 'shared'),
                    currency: event.currency,
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'obligation.reviewed') {
                obligationReviewById[relatedId] = {
                    id: relatedId,
                    status: String(metadata.status || 'needs_review').toLowerCase(),
                    title: String(metadata.title || 'Obligation'),
                    amount: Number.isFinite(Number(metadata.amount)) ? Number(metadata.amount) : eventAmount,
                    dueDate: String(metadata.dueDate || ''),
                    paidAt: String(metadata.paidAt || ''),
                    deferredUntil: String(metadata.deferredUntil || ''),
                    accountId: String(metadata.accountId || ''),
                    accountName: String(metadata.accountName || ''),
                    transactionId: String(metadata.transactionId || ''),
                    notes: String(metadata.notes || ''),
                    reviewedAt: event.timestamp,
                    currency: event.currency,
                    scope: String(metadata.scope || 'shared')
                };
                return;
            }

            if (event.type === 'transaction.reviewed') {
                transactionReviewById[relatedId] = {
                    id: relatedId,
                    categoryId: String(metadata.categoryId || '').trim(),
                    scope: String(metadata.scope || '').trim(),
                    reviewStatus: String(metadata.reviewStatus || 'reviewed').trim(),
                    notes: String(metadata.notes || ''),
                    obligationId: String(metadata.obligationId || '').trim(),
                    obligationTitle: String(metadata.obligationTitle || '').trim(),
                    reviewedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'debt.added' || event.type === 'debt.payment_made' || event.type === 'debt.plan_updated') {
                if (!debtById[relatedId]) {
                    debtById[relatedId] = {
                        id: relatedId,
                        name: String(metadata.name || metadata.lender || 'Debt'),
                        totalAdded: 0,
                        totalPaid: 0,
                        outstanding: 0,
                        dueDate: '',
                        minimumPayment: 0,
                        paymentPlanNote: '',
                        planType: 'regular',
                        frequency: 'monthly',
                        installments: [],
                        planReviewedAt: '',
                        scope: String(metadata.scope || 'shared'),
                        currency: event.currency,
                        updatedAt: event.timestamp
                    };
                }
                if (event.type === 'debt.added') {
                    debtById[relatedId].totalAdded += Math.max(0, eventAmount);
                    if (metadata.dueDate) debtById[relatedId].dueDate = toIsoDateOnly(metadata.dueDate);
                    if (Number.isFinite(Number(metadata.minimumPayment))) debtById[relatedId].minimumPayment = Math.max(0, Number(metadata.minimumPayment));
                    if (metadata.paymentPlanNote) debtById[relatedId].paymentPlanNote = String(metadata.paymentPlanNote);
                } else if (event.type === 'debt.payment_made') {
                    debtById[relatedId].totalPaid += Math.max(0, eventAmount);
                } else {
                    if (metadata.dueDate) debtById[relatedId].dueDate = toIsoDateOnly(metadata.dueDate);
                    debtById[relatedId].minimumPayment = Math.max(0, Number(metadata.minimumPayment) || 0);
                    debtById[relatedId].paymentPlanNote = String(metadata.paymentPlanNote || '');
                    debtById[relatedId].planType = String(metadata.planType || 'regular');
                    debtById[relatedId].frequency = String(metadata.frequency || 'monthly');
                    debtById[relatedId].installments = Array.isArray(metadata.installments) ? metadata.installments : [];
                    debtById[relatedId].planReviewedAt = event.timestamp;
                }
                debtById[relatedId].outstanding = Math.max(0, debtById[relatedId].totalAdded - debtById[relatedId].totalPaid);
                debtById[relatedId].scope = String(metadata.scope || debtById[relatedId].scope || 'shared');
                debtById[relatedId].updatedAt = event.timestamp;
                return;
            }

            if (event.type === 'asset.account_set') {
                fiatById[relatedId] = {
                    id: relatedId,
                    name: String(metadata.name || 'Account'),
                    balance: Number.isFinite(Number(metadata.balance)) ? Number(metadata.balance) : eventAmount,
                    currency: event.currency,
                    active: metadata.active !== false,
                    scope: String(metadata.scope || 'shared'),
                    bucket: String(metadata.bucket || metadata.reserveBucket || 'available'),
                    reserved: Boolean(metadata.reserved) || (metadata.bucket && String(metadata.bucket) !== 'available'),
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'asset.position_set') {
                web3ById[relatedId] = {
                    id: relatedId,
                    symbolOrName: String(metadata.symbolOrName || metadata.symbol || 'TOKEN'),
                    amount: Number.isFinite(Number(metadata.amount)) ? Number(metadata.amount) : 0,
                    price: Number.isFinite(Number(metadata.price)) ? Number(metadata.price) : 0,
                    liquidity: String(metadata.liquidity || 'med'),
                    chain: String(metadata.chain || 'Unknown'),
                    scope: String(metadata.scope || 'shared'),
                    priceSource: String(metadata.priceSource || 'manual'),
                    priceUpdatedAt: String(metadata.priceUpdatedAt || event.timestamp),
                    manualPriceOverride: metadata.manualPriceOverride !== false,
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'asset.defi_set') {
                defiById[relatedId] = {
                    id: relatedId,
                    protocol: String(metadata.protocol || metadata.name || 'Protocol'),
                    collateralValue: Number.isFinite(Number(metadata.collateralValue)) ? Number(metadata.collateralValue) : 0,
                    debtValue: Number.isFinite(Number(metadata.debtValue)) ? Number(metadata.debtValue) : 0,
                    riskScore: String(metadata.riskScore || 'Low'),
                    scope: String(metadata.scope || 'shared'),
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'asset.reserve_set') {
                reserveById[relatedId] = {
                    id: relatedId,
                    name: String(metadata.name || 'Reserve'),
                    targetAmount: Number.isFinite(Number(metadata.targetAmount)) ? Number(metadata.targetAmount) : eventAmount,
                    currentAmount: Number.isFinite(Number(metadata.currentAmount)) ? Number(metadata.currentAmount) : eventAmount,
                    linkedCashAccountId: String(metadata.linkedCashAccountId || '').trim() || null,
                    purpose: String(metadata.purpose || 'custom'),
                    priority: String(metadata.priority || 'medium'),
                    scope: String(metadata.scope || 'shared'),
                    notes: String(metadata.notes || ''),
                    active: metadata.active !== false,
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'asset.reserve_allocated') {
                if (!reserveById[relatedId]) return;
                if (Number.isFinite(Number(metadata.currentAmount))) {
                    reserveById[relatedId].currentAmount = Number(metadata.currentAmount);
                } else if (Number.isFinite(eventAmount)) {
                    reserveById[relatedId].currentAmount = eventAmount;
                }
                reserveById[relatedId].updatedAt = event.timestamp;
                return;
            }
        });

        var pipelineDeals = Object.keys(pipelineById).map(function (id) { return pipelineById[id]; });
        var recurringExpenses = Object.keys(recurringById).map(function (id) { return recurringById[id]; });
        var obligationReviews = Object.keys(obligationReviewById).map(function (id) { return obligationReviewById[id]; });
        var activeRecurringExpenses = recurringExpenses.filter(function (item) { return item && item.active !== false; });
        var debtAccounts = Object.keys(debtById).map(function (id) { return debtById[id]; });
        var invoices = Object.keys(invoiceById).map(function (id) { return invoiceById[id]; });
        var reserveBuckets = Object.keys(reserveById).map(function (id) { return reserveById[id]; });
        var obligationByTransactionId = Object.create(null);
        Object.keys(obligationReviewById).forEach(function (id) {
            var review = obligationReviewById[id];
            if (review && review.transactionId) obligationByTransactionId[String(review.transactionId)] = review;
        });
        transactions = transactions.map(function (transaction) {
            var review = transactionReviewById[String(transaction.id)] || transactionReviewById[String(transaction.transactionEntityId)] || null;
            var matched = obligationByTransactionId[String(transaction.id)] || obligationByTransactionId[String(transaction.transactionEntityId)] || null;
            var categoryId = review && review.categoryId ? review.categoryId : transaction.categoryId;
            var scope = review && review.scope ? review.scope : transaction.scope;
            var obligationId = transaction.obligationId || (review && review.obligationId) || (matched && matched.id) || '';
            return Object.assign({}, transaction, {
                categoryId: categoryId,
                scope: scope,
                obligationId: obligationId,
                obligationTitle: transaction.obligationTitle || (review && review.obligationTitle) || (matched && matched.title) || '',
                reviewStatus: review && review.reviewStatus ? review.reviewStatus : (String(categoryId || '').toLowerCase() === 'uncategorized' ? 'needs_review' : (obligationId ? 'reviewed' : transaction.reviewStatus)),
                reviewNotes: review && review.notes ? review.notes : transaction.reviewNotes
            });
        });
        transactions.sort(function (a, b) {
            return (Date.parse(b.timestamp || '') || 0) - (Date.parse(a.timestamp || '') || 0);
        });

        pipelineDeals.sort(function (a, b) {
            var dateA = Date.parse(a.expectedDateISO || '') || 0;
            var dateB = Date.parse(b.expectedDateISO || '') || 0;
            if (dateA !== dateB) return dateA - dateB;
            return String(a.id).localeCompare(String(b.id));
        });

        invoices.sort(function (a, b) {
            var dateA = Date.parse(a.expectedDate || '') || 0;
            var dateB = Date.parse(b.expectedDate || '') || 0;
            if (dateA !== dateB) return dateA - dateB;
            return String(a.id).localeCompare(String(b.id));
        });

        var recurringMonthlyTotal = activeRecurringExpenses
            .reduce(function (sum, item) {
                return sum + (Number(item.monthlyAmount) || 0);
            }, 0);

        var weightedPipeline = pipelineDeals
            .filter(function (deal) { return isPipelineActive(deal.status); })
            .reduce(function (sum, deal) {
                return sum + ((Number(deal.value) || 0) * Events.clampProbability(deal.probability));
            }, 0);

        var forecastEnd = new Date(nowTs);
        forecastEnd.setDate(forecastEnd.getDate() + cfg.forecastDays);
        var expectedPipeline90d = pipelineDeals
            .filter(function (deal) { return isPipelineActive(deal.status); })
            .filter(function (deal) {
                var ts = Date.parse(deal.expectedDateISO || '');
                if (!Number.isFinite(ts)) return false;
                return ts >= nowTs && ts <= forecastEnd.getTime();
            })
            .reduce(function (sum, deal) {
                return sum + ((Number(deal.value) || 0) * Events.clampProbability(deal.probability));
            }, 0);

        var debtTotal = debtAccounts.reduce(function (sum, debt) {
            return sum + Math.max(0, Number(debt.outstanding) || 0);
        }, 0);

        var fiatAccounts = Object.keys(fiatById)
            .map(function (id) { return fiatById[id]; })
            .filter(function (account) { return account && account.active !== false; });
        var web3Positions = Object.keys(web3ById).map(function (id) { return web3ById[id]; });
        var defiPositions = Object.keys(defiById).map(function (id) { return defiById[id]; });

        return {
            currency: cfg.baseCurrency,
            asOf: cfg.nowIso,
            eventsCount: activeEvents.length,
            pipelineDeals: pipelineDeals,
            recurringExpenses: activeRecurringExpenses,
            obligationReviews: obligationReviews,
            debtAccounts: debtAccounts,
            invoices: invoices,
            transactions: transactions,
            fiatAccounts: fiatAccounts,
            web3Positions: web3Positions,
            defiPositions: defiPositions,
            recurringMonthlyTotal: Events.roundMoney(recurringMonthlyTotal),
            weightedPipeline: Events.roundMoney(weightedPipeline),
            expectedPipeline90d: Events.roundMoney(expectedPipeline90d),
            debtTotal: Events.roundMoney(debtTotal),
            incomeReceivedLast30Days: Events.fromMinor(incomeLast30Minor),
            monthlyIncomeEstimate: Events.roundMoney(Events.fromMinor(incomeLast30Minor) + expectedPipeline90d),
            invoicesSentCount: invoices.filter(function (invoice) {
                return String(invoice.status || '').toLowerCase() !== 'paid';
            }).length,
            openPipelineCount: pipelineDeals.filter(function (deal) {
                return isPipelineActive(deal.status);
            }).length
        };
    }

    var api = {
        normalizeSettings: normalizeSettings,
        appendEvents: appendEvents,
        reverseEvent: reverseEvent,
        getActiveEvents: getActiveEvents,
        buildReadModel: buildReadModel,
        isPipelineActive: isPipelineActive
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceLedger = api;
})(typeof window !== 'undefined' ? window : globalThis);
