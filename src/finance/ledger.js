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

    function normalizeFrequency(value) {
        var raw = String(value || 'monthly').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        if (raw === 'week') return 'weekly';
        if (raw === 'two_weekly' || raw === 'every_two_weeks' || raw === 'fortnightly') return 'biweekly';
        if (raw === 'month') return 'monthly';
        if (raw === 'quarter') return 'quarterly';
        if (raw === 'annual' || raw === 'annually') return 'yearly';
        return ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'].includes(raw) ? raw : 'monthly';
    }

    function normalizeRecurrenceMonthlyAmount(amount, frequency) {
        var value = Math.abs(Number(amount) || 0);
        var normalizedFrequency = normalizeFrequency(frequency);
        if (normalizedFrequency === 'weekly') return Events.roundMoney(value * 52 / 12);
        if (normalizedFrequency === 'biweekly') return Events.roundMoney(value * 26 / 12);
        if (normalizedFrequency === 'quarterly') return Events.roundMoney(value / 3);
        if (normalizedFrequency === 'yearly') return Events.roundMoney(value / 12);
        return Events.roundMoney(value);
    }

    function normalizePlanStatus(value) {
        var raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        if (raw === 'paused' || raw === 'pause') return 'on_hold';
        if (raw === 'future' || raw === 'future_start' || raw === 'starts_later') return 'starts_later';
        if (raw === 'complete' || raw === 'paid_off') return 'completed';
        if (raw === 'archive') return 'archived';
        if (raw === 'custom') return 'irregular';
        return ['active', 'on_hold', 'starts_later', 'irregular', 'completed', 'archived', 'missing'].indexOf(raw) !== -1 ? raw : '';
    }

    function metadataBoolean(metadata, key, fallback) {
        if (metadata && Object.prototype.hasOwnProperty.call(metadata, key)) return metadata[key] !== false;
        return fallback !== false;
    }

    function resolveDebtPlanStatus(debt, nowIso) {
        var today = toIsoDateOnly(nowIso);
        var status = normalizePlanStatus(debt && debt.planStatus);
        var payment = Math.max(0, Number(debt && debt.paymentAmount) || Number(debt && debt.minimumPayment) || 0);
        var hasCustomPressure = Number.isFinite(Number(debt && debt.customMonthlyPressure)) && Number(debt.customMonthlyPressure) > 0;
        if (!status) status = payment > 0 || hasCustomPressure ? 'active' : 'missing';
        if (status === 'missing' && (payment > 0 || hasCustomPressure)) status = 'active';
        var startDate = toIsoDateOnly(debt && debt.startDate);
        var endDate = toIsoDateOnly(debt && debt.endDate);
        if (status === 'active' && endDate && today && endDate < today) return 'completed';
        if (status === 'active' && startDate && today && startDate > today) return 'starts_later';
        return status;
    }

    function resolveDebtMonthlyPressure(debt, nowIso) {
        var status = resolveDebtPlanStatus(debt, nowIso);
        if (['on_hold', 'starts_later', 'completed', 'archived', 'missing'].indexOf(status) !== -1) return 0;
        var customMonthlyPressure = Number(debt && debt.customMonthlyPressure);
        if (Number.isFinite(customMonthlyPressure) && customMonthlyPressure > 0) return Events.roundMoney(customMonthlyPressure);
        if (status === 'irregular') return 0;
        return normalizeRecurrenceMonthlyAmount(debt && debt.paymentAmount, debt && debt.paymentFrequency);
    }

    var INCOME_PROBABILITY_DEFAULTS = {
        lead: 0.15,
        proposal: 0.4,
        expected: 0.6,
        confirmed: 0.9,
        invoiced: 0.95,
        due: 0.95,
        overdue: 0.85,
        risky: 0.35,
        retainer: 0.9,
        recurring: 0.9,
        paid: 1,
        cancelled: 0,
        lost: 0
    };

    function normalizeIncomeStatus(value) {
        var raw = String(value || 'expected').trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        if (raw === 'open' || raw === 'manual_expected_income') return 'expected';
        if (raw === 'signed' || raw === 'verbal_commitment') return 'confirmed';
        if (raw === 'invoice_sent' || raw === 'sent') return 'invoiced';
        if (raw === 'received' || raw === 'settled' || raw === 'closed') return 'paid';
        if (raw === 'deleted') return 'cancelled';
        if (raw === 'opportunity') return 'lead';
        return ['lead', 'proposal', 'expected', 'confirmed', 'invoiced', 'due', 'overdue', 'paid', 'cancelled', 'lost', 'risky'].indexOf(raw) !== -1 ? raw : 'expected';
    }

    function defaultIncomeProbability(status, incomeType) {
        var type = String(incomeType || '').toLowerCase();
        if (type === 'retainer' || type === 'recurring') return INCOME_PROBABILITY_DEFAULTS[type];
        var normalized = normalizeIncomeStatus(status);
        return INCOME_PROBABILITY_DEFAULTS[normalized] != null ? INCOME_PROBABILITY_DEFAULTS[normalized] : 0.6;
    }

    function incomeProbability(metadata, status, incomeType) {
        if (metadata && Object.prototype.hasOwnProperty.call(metadata, 'probability') && Number.isFinite(Number(metadata.probability))) {
            return Events.clampProbability(metadata.probability);
        }
        return defaultIncomeProbability(status, incomeType);
    }

    function applyIncomeVatMetadata(target, metadata, fallbackValue) {
        if (!target || !metadata) return;
        if (Object.prototype.hasOwnProperty.call(metadata, 'netAmount')) {
            target.netAmount = Number.isFinite(Number(metadata.netAmount)) ? Number(metadata.netAmount) : null;
        } else if (!Object.prototype.hasOwnProperty.call(target, 'netAmount')) {
            target.netAmount = null;
        }
        if (Object.prototype.hasOwnProperty.call(metadata, 'vatRate')) {
            target.vatRate = Number.isFinite(Number(metadata.vatRate)) ? Number(metadata.vatRate) : 0;
        } else if (!Object.prototype.hasOwnProperty.call(target, 'vatRate')) {
            target.vatRate = 0;
        }
        if (Object.prototype.hasOwnProperty.call(metadata, 'vatAmount')) {
            target.vatAmount = Number.isFinite(Number(metadata.vatAmount)) ? Number(metadata.vatAmount) : 0;
        } else if (!Object.prototype.hasOwnProperty.call(target, 'vatAmount')) {
            target.vatAmount = 0;
        }
        if (Object.prototype.hasOwnProperty.call(metadata, 'grossAmount')) {
            target.grossAmount = Number.isFinite(Number(metadata.grossAmount)) ? Number(metadata.grossAmount) : fallbackValue;
        } else if (!Object.prototype.hasOwnProperty.call(target, 'grossAmount')) {
            target.grossAmount = fallbackValue;
        }
    }

    function classifyIncomeDueState(deal, nowIso) {
        var status = normalizeIncomeStatus(deal && deal.status);
        if (status === 'paid') return 'settled';
        if (status === 'cancelled' || status === 'lost') return 'inactive';
        var due = toIsoDateOnly(deal && deal.expectedDateISO);
        var today = toIsoDateOnly(nowIso);
        if (!due || !today) return 'upcoming';
        if (due < today) {
            var overdueMs = Date.parse(today + 'T00:00:00.000Z') - Date.parse(due + 'T00:00:00.000Z');
            return overdueMs > 14 * 24 * 60 * 60 * 1000 ? 'severely_overdue' : 'overdue';
        }
        if (status === 'overdue') return 'overdue';
        if (due === today || status === 'due') return 'due_today';
        var dueSoonEnd = global.FinanceDates && global.FinanceDates.addDaysDateOnly
            ? global.FinanceDates.addDaysDateOnly(today, 7)
            : '';
        if (dueSoonEnd && due <= dueSoonEnd) return 'due_soon';
        return 'upcoming';
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
        var state = normalizeIncomeStatus(stage);
        return state !== 'paid' && state !== 'lost' && state !== 'cancelled';
    }

    function toIsoDateOnly(value) {
        return Events.toDateOnly ? Events.toDateOnly(value) : (global.FinanceDates ? global.FinanceDates.toDateOnly(value) : '');
    }

    function addMonthsDateOnly(nowIso, months) {
        var date = new Date(nowIso);
        if (!Number.isFinite(date.getTime()) || !Number.isFinite(Number(months)) || Number(months) <= 0) return '';
        date.setUTCMonth(date.getUTCMonth() + Math.ceil(Number(months)));
        return date.toISOString().slice(0, 10);
    }

    function estimateDebtPayoff(debt, nowIso) {
        var outstanding = Math.max(0, Number(debt && debt.outstanding) || 0);
        if (outstanding <= 0) return { estimatedPayoffMonths: 0, estimatedPayoffDate: toIsoDateOnly(nowIso) };
        if (String(debt && debt.planType) === 'custom' && Array.isArray(debt.installments) && debt.installments.length) {
            var paid = 0;
            var sorted = debt.installments.slice().sort(function (a, b) {
                return String(a && a.date || '').localeCompare(String(b && b.date || ''));
            });
            for (var i = 0; i < sorted.length; i += 1) {
                paid += Math.max(0, Number(sorted[i] && sorted[i].amount) || 0);
                if (paid >= outstanding) {
                    return { estimatedPayoffMonths: null, estimatedPayoffDate: toIsoDateOnly(sorted[i].date) };
                }
            }
        }
        var monthly = Math.max(0, Number(debt && debt.minimumPaymentMonthly) || 0);
        if (monthly <= 0) return { estimatedPayoffMonths: null, estimatedPayoffDate: '' };
        var months = Math.ceil(outstanding / monthly);
        return { estimatedPayoffMonths: months, estimatedPayoffDate: addMonthsDateOnly(nowIso, months) };
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
        var projectById = Object.create(null);
        var transactions = [];
        var reversedByEventId = Object.create(null);

        var incomeLast30Minor = 0;

        Events.sortFinancialEvents(events).forEach(function (event) {
            var metadata = event && event.metadata && typeof event.metadata === 'object' ? event.metadata : {};
            if (event && event.type === 'finance.event_reversed') {
                var reversedId = String(metadata.reversed_event_id || event.related_entity_id || '').trim();
                if (reversedId) reversedByEventId[reversedId] = String(event.id || '').trim();
            }
        });

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
                    projectId: String(metadata.projectId || '').trim(),
                    source: String(metadata.source || 'manual'),
                    sourceFile: String(metadata.sourceFile || '').trim(),
                    sourceRowId: String(metadata.sourceRowId || metadata.rowNumber || '').trim(),
                    importBatchId: String(metadata.importBatchId || '').trim(),
                    fingerprint: String(metadata.fingerprint || '').trim(),
                    obligationId: String(metadata.obligationId || '').trim(),
                    obligationDueDate: String(metadata.obligationDueDate || '').trim(),
                    obligationTitle: String(metadata.obligationTitle || '').trim(),
                    linkedIncomeId: String(metadata.invoiceId || metadata.pipelineId || metadata.linkedIncomeId || '').trim(),
                    linkedDebtId: String(metadata.debtId || metadata.linkedDebtId || '').trim(),
                    linkedReserveId: String(metadata.reserveBucketId || metadata.linkedReserveId || '').trim(),
                    reversalOf: String(metadata.reversed_event_id || metadata.reversalOf || '').trim(),
                    reversedBy: reversedByEventId[String(event.id || '')] || '',
                    reviewStatus: String(metadata.reviewStatus || '').trim() || (String(metadata.categoryId || 'uncategorized').toLowerCase() === 'uncategorized' ? 'needs_review' : 'clear'),
                    reviewNotes: '',
                    timestamp: event.timestamp
                });
            }

            if (event.type === 'project.profile_set') {
                projectById[relatedId] = {
                    id: relatedId,
                    name: String(metadata.name || 'Project plan'),
                    clientOrPurpose: String(metadata.clientOrPurpose || metadata.purpose || ''),
                    status: String(metadata.status || 'active').toLowerCase() === 'archived' ? 'archived' : 'active',
                    color: String(metadata.color || 'mint'),
                    notes: String(metadata.notes || ''),
                    createdAt: String(metadata.createdAt || event.timestamp),
                    updatedAt: event.timestamp
                };
                return;
            }

            if (event.type === 'income.received' && ageMs <= thirtyDaysMs) {
                incomeLast30Minor += Events.toMinor(eventAmount);
            }

            if (event.type === 'pipeline.created') {
                var createdStatus = normalizeIncomeStatus(metadata.stage || metadata.status || 'expected');
                var createdIncomeType = String(metadata.incomeType || metadata.type || 'one_off');
                pipelineById[relatedId] = {
                    id: relatedId,
                    title: String(metadata.title || metadata.name || metadata.client || 'Pipeline Item'),
                    value: Number.isFinite(Number(metadata.value)) ? Number(metadata.value) : eventAmount,
                    probability: incomeProbability(metadata, createdStatus, createdIncomeType),
                    status: createdStatus,
                    expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                    destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                    destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                    incomeType: createdIncomeType,
                    scope: String(metadata.scope || 'shared'),
                    projectId: String(metadata.projectId || '').trim(),
                    scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                    currency: event.currency,
                    dueState: '',
                    createdAt: event.timestamp,
                    updatedAt: event.timestamp
                };
                applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
                return;
            }

            if (event.type === 'pipeline.stage_changed') {
                var stageStatus = normalizeIncomeStatus(metadata.stage || metadata.status || 'expected');
                var stageIncomeType = String(metadata.incomeType || metadata.type || 'one_off');
                if (!pipelineById[relatedId]) {
                    pipelineById[relatedId] = {
                        id: relatedId,
                        title: String(metadata.title || metadata.name || 'Pipeline Item'),
                        value: 0,
                        probability: incomeProbability(metadata, stageStatus, stageIncomeType),
                        status: stageStatus,
                        expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        incomeType: stageIncomeType,
                        scope: String(metadata.scope || 'shared'),
                        scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                        currency: event.currency,
                        dueState: '',
                        createdAt: event.timestamp,
                        updatedAt: event.timestamp
                    };
                    applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
                }
                pipelineById[relatedId].status = normalizeIncomeStatus(metadata.stage || metadata.status || pipelineById[relatedId].status || 'expected');
                pipelineById[relatedId].scope = String(metadata.scope || pipelineById[relatedId].scope || 'shared');
                if (Object.prototype.hasOwnProperty.call(metadata, 'projectId')) {
                    pipelineById[relatedId].projectId = String(metadata.projectId || '').trim();
                } else {
                    pipelineById[relatedId].projectId = pipelineById[relatedId].projectId || '';
                }
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
                if (metadata.incomeType || metadata.type) {
                    pipelineById[relatedId].incomeType = String(metadata.incomeType || metadata.type);
                }
                applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
                pipelineById[relatedId].updatedAt = event.timestamp;
                return;
            }

            if (event.type === 'pipeline.value_changed') {
                var valueStatus = normalizeIncomeStatus(metadata.stage || metadata.status || 'expected');
                var valueIncomeType = String(metadata.incomeType || metadata.type || 'one_off');
                if (!pipelineById[relatedId]) {
                    pipelineById[relatedId] = {
                        id: relatedId,
                        title: String(metadata.title || metadata.name || 'Pipeline Item'),
                        value: 0,
                        probability: incomeProbability(metadata, valueStatus, valueIncomeType),
                        status: valueStatus,
                        expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        incomeType: valueIncomeType,
                        scope: String(metadata.scope || 'shared'),
                        projectId: String(metadata.projectId || '').trim(),
                        scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                        currency: event.currency,
                        dueState: '',
                        createdAt: event.timestamp,
                        updatedAt: event.timestamp
                    };
                    applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
                }
                pipelineById[relatedId].value = Number.isFinite(Number(metadata.value)) ? Number(metadata.value) : eventAmount;
                pipelineById[relatedId].scope = String(metadata.scope || pipelineById[relatedId].scope || 'shared');
                if (Object.prototype.hasOwnProperty.call(metadata, 'projectId')) {
                    pipelineById[relatedId].projectId = String(metadata.projectId || '').trim();
                } else {
                    pipelineById[relatedId].projectId = pipelineById[relatedId].projectId || '';
                }
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
                if (metadata.incomeType || metadata.type) {
                    pipelineById[relatedId].incomeType = String(metadata.incomeType || metadata.type);
                }
                applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
                pipelineById[relatedId].updatedAt = event.timestamp;
                return;
            }

            if (event.type === 'pipeline.probability_changed') {
                var probabilityStatus = normalizeIncomeStatus(metadata.stage || metadata.status || 'expected');
                var probabilityIncomeType = String(metadata.incomeType || metadata.type || 'one_off');
                if (!pipelineById[relatedId]) {
                    pipelineById[relatedId] = {
                        id: relatedId,
                        title: String(metadata.title || metadata.name || 'Pipeline Item'),
                        value: Number.isFinite(Number(metadata.value)) ? Number(metadata.value) : eventAmount,
                        probability: incomeProbability(metadata, probabilityStatus, probabilityIncomeType),
                        status: probabilityStatus,
                        expectedDateISO: toIsoDateOnly(metadata.expectedDateISO || metadata.expectedDate || event.timestamp),
                        destinationAccountId: String(metadata.destinationAccountId || '').trim(),
                        destinationAccountName: String(metadata.destinationAccountName || '').trim(),
                        incomeType: probabilityIncomeType,
                        scope: String(metadata.scope || 'shared'),
                        projectId: String(metadata.projectId || '').trim(),
                        scenarioInclusion: String(metadata.scenarioInclusion || 'realistic'),
                        currency: event.currency,
                        dueState: '',
                        createdAt: event.timestamp,
                        updatedAt: event.timestamp
                    };
                    applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
                }
                pipelineById[relatedId].probability = Events.clampProbability(metadata.probability != null ? metadata.probability : eventAmount);
                pipelineById[relatedId].scope = String(metadata.scope || pipelineById[relatedId].scope || 'shared');
                if (Object.prototype.hasOwnProperty.call(metadata, 'projectId')) {
                    pipelineById[relatedId].projectId = String(metadata.projectId || '').trim();
                } else {
                    pipelineById[relatedId].projectId = pipelineById[relatedId].projectId || '';
                }
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
                if (metadata.incomeType || metadata.type) {
                    pipelineById[relatedId].incomeType = String(metadata.incomeType || metadata.type);
                }
                applyIncomeVatMetadata(pipelineById[relatedId], metadata, pipelineById[relatedId].value);
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
                    projectId: String(metadata.projectId || '').trim(),
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
                        projectId: String(metadata.projectId || '').trim(),
                        currency: event.currency,
                        sentAt: event.timestamp,
                        paidAt: event.timestamp
                    };
                }
                invoiceById[relatedId].status = 'Paid';
                invoiceById[relatedId].paidAt = event.timestamp;
                invoiceById[relatedId].scope = String(metadata.scope || invoiceById[relatedId].scope || 'shared');
                if (Object.prototype.hasOwnProperty.call(metadata, 'projectId')) {
                    invoiceById[relatedId].projectId = String(metadata.projectId || '').trim();
                } else {
                    invoiceById[relatedId].projectId = invoiceById[relatedId].projectId || '';
                }
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
                var recurringFrequency = normalizeFrequency(metadata.frequency);
                var recurringAmount = Number.isFinite(Number(metadata.amount)) ? Math.abs(Number(metadata.amount)) : Math.abs(eventAmount);
                var recurringMonthlyAmount = Number.isFinite(Number(metadata.monthlyAmount))
                    ? Math.abs(Number(metadata.monthlyAmount))
                    : normalizeRecurrenceMonthlyAmount(recurringAmount, recurringFrequency);
                recurringById[relatedId] = {
                    id: relatedId,
                    category: String(metadata.category || metadata.name || 'Recurring Expense'),
                    amount: recurringAmount,
                    monthlyAmount: recurringMonthlyAmount,
                    essential: Boolean(metadata.essential),
                    active: metadata.active !== false,
                    dueDay: Math.max(1, Math.min(28, Number(metadata.dueDay) || 1)),
                    frequency: recurringFrequency,
                    linkedDebtId: String(metadata.linkedDebtId || metadata.debtId || '').trim(),
                    scope: String(metadata.scope || 'shared'),
                    projectId: String(metadata.projectId || '').trim(),
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
                    scope: String(metadata.scope || 'shared'),
                    projectId: String(metadata.projectId || '').trim()
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
                    linkedIncomeId: String(metadata.linkedIncomeId || '').trim(),
                    linkedReserveId: String(metadata.linkedReserveId || '').trim(),
                    linkedDebtId: String(metadata.linkedDebtId || '').trim(),
                    projectId: String(metadata.projectId || '').trim(),
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
                        minimumPaymentMonthly: 0,
                        monthlyPressure: 0,
                        paymentAmount: 0,
                        paymentFrequency: 'monthly',
                        paymentPlanNote: '',
                        planType: 'regular',
                        planStatus: 'missing',
                        startDate: '',
                        endDate: '',
                        customMonthlyPressure: null,
                        includeInBurnRate: true,
                        includeInSafeToSpend: true,
                        includeInRunway: true,
                        frequency: 'monthly',
                        installments: [],
                        planReviewedAt: '',
                        scope: String(metadata.scope || 'shared'),
                        projectId: String(metadata.projectId || '').trim(),
                        currency: event.currency,
                        updatedAt: event.timestamp
                    };
                }
                if (event.type === 'debt.added') {
                    debtById[relatedId].totalAdded += Math.max(0, eventAmount);
                    if (metadata.dueDate) debtById[relatedId].dueDate = toIsoDateOnly(metadata.dueDate);
                    if (Number.isFinite(Number(metadata.minimumPayment))) debtById[relatedId].minimumPayment = Math.max(0, Number(metadata.minimumPayment));
                    if (metadata.paymentPlanNote) debtById[relatedId].paymentPlanNote = String(metadata.paymentPlanNote);
                    debtById[relatedId].frequency = normalizeFrequency(metadata.frequency || debtById[relatedId].frequency);
                    debtById[relatedId].paymentFrequency = normalizeFrequency(metadata.paymentFrequency || metadata.frequency || debtById[relatedId].paymentFrequency);
                    debtById[relatedId].paymentAmount = Number.isFinite(Number(metadata.paymentAmount)) ? Math.max(0, Number(metadata.paymentAmount)) : debtById[relatedId].minimumPayment;
                } else if (event.type === 'debt.payment_made') {
                    debtById[relatedId].totalPaid += Math.max(0, eventAmount);
                } else {
                    if (metadata.dueDate) debtById[relatedId].dueDate = toIsoDateOnly(metadata.dueDate);
                    debtById[relatedId].minimumPayment = Math.max(0, Number(metadata.minimumPayment) || 0);
                    debtById[relatedId].paymentAmount = Math.max(0, Number(metadata.paymentAmount != null ? metadata.paymentAmount : metadata.minimumPayment) || 0);
                    debtById[relatedId].paymentPlanNote = String(metadata.paymentPlanNote || '');
                    debtById[relatedId].planType = String(metadata.planType || 'regular');
                    debtById[relatedId].frequency = normalizeFrequency(metadata.frequency);
                    debtById[relatedId].paymentFrequency = normalizeFrequency(metadata.paymentFrequency || metadata.frequency);
                    debtById[relatedId].installments = Array.isArray(metadata.installments) ? metadata.installments : [];
                    debtById[relatedId].planStatus = normalizePlanStatus(metadata.planStatus || metadata.status) || (debtById[relatedId].paymentAmount > 0 ? 'active' : 'missing');
                    debtById[relatedId].startDate = toIsoDateOnly(metadata.startDate || '') || '';
                    debtById[relatedId].endDate = toIsoDateOnly(metadata.endDate || '') || '';
                    debtById[relatedId].customMonthlyPressure = Number.isFinite(Number(metadata.customMonthlyPressure)) ? Math.max(0, Number(metadata.customMonthlyPressure)) : null;
                    debtById[relatedId].includeInBurnRate = metadataBoolean(metadata, 'includeInBurnRate', true);
                    debtById[relatedId].includeInSafeToSpend = metadataBoolean(metadata, 'includeInSafeToSpend', true);
                    debtById[relatedId].includeInRunway = metadataBoolean(metadata, 'includeInRunway', true);
                    debtById[relatedId].planReviewedAt = event.timestamp;
                }
                debtById[relatedId].outstanding = Math.max(0, debtById[relatedId].totalAdded - debtById[relatedId].totalPaid);
                if (!debtById[relatedId].paymentAmount && debtById[relatedId].minimumPayment > 0) {
                    debtById[relatedId].paymentAmount = debtById[relatedId].minimumPayment;
                }
                debtById[relatedId].paymentFrequency = normalizeFrequency(debtById[relatedId].paymentFrequency || debtById[relatedId].frequency);
                debtById[relatedId].planStatus = resolveDebtPlanStatus(debtById[relatedId], nowIso);
                debtById[relatedId].minimumPaymentMonthly = normalizeRecurrenceMonthlyAmount(debtById[relatedId].paymentAmount, debtById[relatedId].paymentFrequency);
                debtById[relatedId].monthlyPressure = resolveDebtMonthlyPressure(debtById[relatedId], nowIso);
                Object.assign(debtById[relatedId], estimateDebtPayoff(debtById[relatedId], nowIso));
                debtById[relatedId].scope = String(metadata.scope || debtById[relatedId].scope || 'shared');
                if (Object.prototype.hasOwnProperty.call(metadata, 'projectId')) {
                    debtById[relatedId].projectId = String(metadata.projectId || '').trim();
                } else {
                    debtById[relatedId].projectId = debtById[relatedId].projectId || '';
                }
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
                    projectId: String(metadata.projectId || '').trim(),
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
                    projectId: String(metadata.projectId || '').trim(),
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
                    projectId: String(metadata.projectId || '').trim(),
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
                    projectId: String(metadata.projectId || '').trim(),
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
                if (Object.prototype.hasOwnProperty.call(metadata, 'projectId')) {
                    reserveById[relatedId].projectId = String(metadata.projectId || '').trim();
                }
                return;
            }
        });

        var projectProfiles = Object.keys(projectById).map(function (id) { return projectById[id]; });
        var pipelineDeals = Object.keys(pipelineById).map(function (id) { return pipelineById[id]; });
        pipelineDeals.forEach(function (deal) {
            deal.status = normalizeIncomeStatus(deal.status);
            deal.probability = Number.isFinite(Number(deal.probability)) ? Events.clampProbability(deal.probability) : defaultIncomeProbability(deal.status, deal.incomeType);
            deal.dueState = classifyIncomeDueState(deal, cfg.nowIso);
        });
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
            var linkedIncomeId = review && Object.prototype.hasOwnProperty.call(review, 'linkedIncomeId') ? review.linkedIncomeId : transaction.linkedIncomeId;
            var linkedReserveId = review && Object.prototype.hasOwnProperty.call(review, 'linkedReserveId') ? review.linkedReserveId : transaction.linkedReserveId;
            var linkedDebtId = review && Object.prototype.hasOwnProperty.call(review, 'linkedDebtId') ? review.linkedDebtId : transaction.linkedDebtId;
            var projectId = review && Object.prototype.hasOwnProperty.call(review, 'projectId') ? review.projectId : transaction.projectId;
            var linkedIncome = linkedIncomeId ? (pipelineById[String(linkedIncomeId)] || invoiceById[String(linkedIncomeId)] || null) : null;
            var linkedObligation = obligationId ? (recurringById[String(obligationId).replace(/-\d{4}-\d{2}$/, '')] || matched || null) : null;
            var linkedDebt = linkedDebtId ? debtById[String(linkedDebtId)] || null : null;
            return Object.assign({}, transaction, {
                categoryId: categoryId,
                scope: scope,
                obligationId: obligationId,
                linkedIncomeId: linkedIncomeId || '',
                linkedReserveId: linkedReserveId || '',
                linkedDebtId: linkedDebtId || '',
                projectId: projectId || '',
                obligationTitle: transaction.obligationTitle || (review && review.obligationTitle) || (matched && matched.title) || '',
                linkedIncomeTitle: linkedIncome ? String(linkedIncome.title || linkedIncome.client || 'Linked income') : '',
                linkedDebtTitle: linkedDebt ? String(linkedDebt.name || 'Linked debt') : '',
                linkedObligationTitle: linkedObligation ? String(linkedObligation.title || linkedObligation.category || 'Linked obligation') : '',
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

        projectProfiles.sort(function (a, b) {
            if (String(a.status || '') !== String(b.status || '')) return String(a.status || '').localeCompare(String(b.status || ''));
            return String(a.name || '').localeCompare(String(b.name || ''));
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
            projectProfiles: projectProfiles,
            pipelineDeals: pipelineDeals,
            recurringExpenses: activeRecurringExpenses,
            obligationReviews: obligationReviews,
            debtAccounts: debtAccounts,
            invoices: invoices,
            transactions: transactions,
            fiatAccounts: fiatAccounts,
            reserveBuckets: reserveBuckets.filter(function (bucket) { return bucket && bucket.active !== false; }),
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
        isPipelineActive: isPipelineActive,
        normalizeFrequency: normalizeFrequency,
        normalizeRecurrenceMonthlyAmount: normalizeRecurrenceMonthlyAmount
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceLedger = api;
})(typeof window !== 'undefined' ? window : globalThis);
