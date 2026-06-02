(function (global) {
    'use strict';

    var Events = global.FinanceEvents;
    var Ledger = global.FinanceLedger;
    var Compute = global.FinanceCompute;

    if (!Events && typeof module !== 'undefined' && module.exports) {
        Events = require('./events.js');
    }
    if (!Ledger && typeof module !== 'undefined' && module.exports) {
        Ledger = require('./ledger.js');
    }
    if (!Compute && typeof module !== 'undefined' && module.exports) {
        Compute = require('./compute.js');
    }

    if (!Events || !Ledger || !Compute) {
        throw new Error('Finance modal event utilities require events/ledger/compute modules.');
    }

    function requireTimestamp(timestamp) {
        if (!Events.isIsoTimestamp(timestamp)) {
            throw new Error('Timestamp is required and must be ISO-8601.');
        }
        return new Date(timestamp).toISOString();
    }

    function requireAmount(amount) {
        var value = Number(amount);
        if (!Number.isFinite(value)) {
            throw new Error('Amount must be a finite number.');
        }
        return value;
    }

    function validateProbability(probability) {
        var value = Number(probability);
        return Number.isFinite(value) && value >= 0 && value <= 1;
    }

    function requireProbability(probability) {
        if (!validateProbability(probability)) {
            throw new Error('Probability must be in range 0..1.');
        }
        return Number(probability);
    }

    function normalizeSettings(settings) {
        return Ledger.normalizeSettings(settings || {});
    }

    function buildPipelineCreateDraft(input, settings) {
        var source = input && typeof input === 'object' ? input : {};
        var cfg = normalizeSettings(settings);
        var amount = Math.abs(requireAmount(source.amount));
        var timestamp = requireTimestamp(source.timestamp);
        var probability = requireProbability(source.probability);
        var id = String(source.id || source.related_entity_id || ('pipe-' + Date.now()));
        var status = String(source.status || 'open').trim().toLowerCase() || 'open';
        return {
            type: 'pipeline.created',
            amount: amount,
            currency: Events.normalizeCurrency(source.currency, cfg.baseCurrency),
            timestamp: timestamp,
            related_entity_id: id,
            metadata: {
                title: String(source.title || 'Pipeline Item'),
                value: amount,
                probability: probability,
                status: status,
                stage: status,
                expectedDateISO: String(source.expectedDateISO || timestamp.slice(0, 10))
            }
        };
    }

    function buildRecurringExpenseDraft(input, settings) {
        var source = input && typeof input === 'object' ? input : {};
        var cfg = normalizeSettings(settings);
        var amount = Math.abs(requireAmount(source.monthlyAmount != null ? source.monthlyAmount : source.amount));
        return {
            type: 'expense.recurring_set',
            amount: amount,
            currency: Events.normalizeCurrency(source.currency, cfg.baseCurrency),
            timestamp: requireTimestamp(source.timestamp),
            related_entity_id: String(source.id || source.related_entity_id || ('expense-' + Date.now())),
            metadata: {
                category: String(source.category || 'Recurring Expense'),
                monthlyAmount: amount,
                essential: Boolean(source.essential),
                active: source.active !== false
            }
        };
    }

    function buildIncomeOrExpenseDraft(input, settings) {
        var source = input && typeof input === 'object' ? input : {};
        var cfg = normalizeSettings(settings);
        var amount = requireAmount(source.amount);
        var draftType = source.type;
        if (!draftType) {
            draftType = amount >= 0 ? 'income.received' : 'expense.recorded';
        }
        if (draftType !== 'income.received' && draftType !== 'expense.recorded') {
            throw new Error('Unsupported transaction draft type: ' + draftType);
        }
        return {
            type: draftType,
            amount: Math.abs(amount),
            currency: Events.normalizeCurrency(source.currency, cfg.baseCurrency),
            timestamp: requireTimestamp(source.timestamp),
            related_entity_id: source.related_entity_id ? String(source.related_entity_id) : undefined,
            metadata: source.metadata && typeof source.metadata === 'object'
                ? Events.deepClone(source.metadata)
                : {}
        };
    }

    function previewSnapshot(events, drafts, settings) {
        var cfg = normalizeSettings(settings);
        var nowIso = Events.isIsoTimestamp(cfg.nowIso) ? cfg.nowIso : new Date().toISOString();
        var appendResult = Ledger.appendEvents(events || [], drafts || [], cfg, {
            nowIso: nowIso,
            allowApproximateTimestamp: false
        });
        return {
            snapshot: Compute.computeFinancialState(appendResult.events, {
                baseCurrency: cfg.baseCurrency,
                forecastDays: cfg.forecastDays,
                nowIso: nowIso
            }),
            events: appendResult.events,
            appended: appendResult.appended
        };
    }

    function cancelWithoutMutation(events) {
        return Array.isArray(events) ? events.slice() : [];
    }

    var api = {
        requireTimestamp: requireTimestamp,
        requireAmount: requireAmount,
        validateProbability: validateProbability,
        requireProbability: requireProbability,
        buildPipelineCreateDraft: buildPipelineCreateDraft,
        buildRecurringExpenseDraft: buildRecurringExpenseDraft,
        buildIncomeOrExpenseDraft: buildIncomeOrExpenseDraft,
        previewSnapshot: previewSnapshot,
        cancelWithoutMutation: cancelWithoutMutation
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceModalEvents = api;
})(typeof window !== 'undefined' ? window : globalThis);
