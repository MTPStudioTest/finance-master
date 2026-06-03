(function (global) {
    'use strict';

    var REQUIRED_EVENT_TYPES = [
        'income.received',
        'expense.recorded',
        'expense.recurring_set',
        'obligation.reviewed',
        'debt.added',
        'debt.payment_made',
        'invoice.sent',
        'invoice.paid',
        'pipeline.created',
        'pipeline.stage_changed',
        'pipeline.value_changed',
        'pipeline.probability_changed',
        'transaction.reviewed',
        'debt.plan_updated'
    ];

    var SUPPLEMENTAL_EVENT_TYPES = [
        'balance.opening_set',
        'asset.account_set',
        'asset.position_set',
        'asset.defi_set',
        'finance.event_reversed'
    ];

    var ALL_EVENT_TYPES = REQUIRED_EVENT_TYPES.concat(SUPPLEMENTAL_EVENT_TYPES);

    function deepClone(value) {
        if (value === undefined) return undefined;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            return value;
        }
    }

    function roundMoney(value) {
        var amount = Number(value);
        if (!Number.isFinite(amount)) return 0;
        return Math.round(amount * 100) / 100;
    }

    function createId() {
        try {
            if (global.crypto && typeof global.crypto.randomUUID === 'function') {
                return global.crypto.randomUUID();
            }
        } catch (error) {
            // Ignore and use fallback.
        }
        return 'fin-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    function normalizeCurrency(currency, fallback) {
        var candidate = String(currency || fallback || 'EUR').trim().toUpperCase();
        return candidate || 'EUR';
    }

    function clampProbability(value) {
        var num = Number(value);
        if (!Number.isFinite(num)) return 0;
        if (num < 0) return 0;
        if (num > 1) return 1;
        return num;
    }

    function isValidEventType(value) {
        return ALL_EVENT_TYPES.indexOf(String(value || '').trim()) !== -1;
    }

    function isIsoTimestamp(value) {
        if (typeof value !== 'string' || !value.trim()) return false;
        var ts = Date.parse(value);
        if (!Number.isFinite(ts)) return false;
        return value.indexOf('T') !== -1;
    }

    function parseTimestamp(value) {
        if (isIsoTimestamp(value)) return new Date(value).toISOString();
        return null;
    }

    function localDateKey(isoTimestamp, timeZone) {
        var ts = Date.parse(isoTimestamp);
        if (!Number.isFinite(ts)) return null;
        var date = new Date(ts);
        try {
            var formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: timeZone || undefined,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            var parts = formatter.formatToParts(date);
            var year = parts.find(function (part) { return part.type === 'year'; });
            var month = parts.find(function (part) { return part.type === 'month'; });
            var day = parts.find(function (part) { return part.type === 'day'; });
            if (year && month && day) {
                return year.value + '-' + month.value + '-' + day.value;
            }
        } catch (error) {
            // Ignore and use local fallback.
        }
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function toMinor(amountMajor) {
        var value = Number(amountMajor);
        if (!Number.isFinite(value)) return 0;
        return Math.round(value * 100);
    }

    function fromMinor(amountMinor) {
        var value = Number(amountMinor);
        if (!Number.isFinite(value)) return 0;
        return Math.round(value) / 100;
    }

    function sortFinancialEvents(events) {
        var list = Array.isArray(events) ? events.slice() : [];
        return list.sort(function (a, b) {
            var tsA = Date.parse(a && a.timestamp ? a.timestamp : '') || 0;
            var tsB = Date.parse(b && b.timestamp ? b.timestamp : '') || 0;
            if (tsA !== tsB) return tsA - tsB;

            var createdA = Date.parse(a && a.created_at ? a.created_at : '') || 0;
            var createdB = Date.parse(b && b.created_at ? b.created_at : '') || 0;
            if (createdA !== createdB) return createdA - createdB;

            var idA = String(a && a.id || '');
            var idB = String(b && b.id || '');
            return idA.localeCompare(idB);
        });
    }

    function createFinancialEvent(draft, options) {
        var opts = options || {};
        var input = draft && typeof draft === 'object' ? draft : {};

        var type = String(input.type || '').trim();
        if (!isValidEventType(type)) {
            throw new Error('Invalid financial event type: ' + type);
        }

        var amount = Number(input.amount);
        if (!Number.isFinite(amount)) {
            throw new Error('Financial event amount must be a finite number.');
        }

        var nowIso = parseTimestamp(opts.nowIso) || new Date().toISOString();

        var timestamp = parseTimestamp(input.timestamp);
        if (!timestamp && opts.allowApproximateTimestamp) {
            var fallbackRaw = input.timestamp || input.created_at || nowIso;
            var fallbackTs = Date.parse(fallbackRaw);
            if (Number.isFinite(fallbackTs)) {
                timestamp = new Date(fallbackTs).toISOString();
            }
        }
        if (!timestamp) {
            throw new Error('Financial event timestamp is required and must be ISO-8601.');
        }

        var event = {
            id: String(input.id || createId()),
            timestamp: timestamp,
            type: type,
            amount: roundMoney(amount),
            currency: normalizeCurrency(input.currency, opts.baseCurrency),
            metadata: deepClone(input.metadata && typeof input.metadata === 'object' ? input.metadata : {}),
            created_at: parseTimestamp(input.created_at) || nowIso
        };

        if (input.related_entity_id != null && String(input.related_entity_id).trim()) {
            event.related_entity_id = String(input.related_entity_id).trim();
        }

        if (input.updated_at && isIsoTimestamp(input.updated_at)) {
            event.updated_at = new Date(input.updated_at).toISOString();
        }

        if (!input.timestamp && opts.allowApproximateTimestamp) {
            event.metadata.approximateTimestamp = true;
        }

        return event;
    }

    function resolveReversedEventIds(events) {
        var reversed = new Set();
        var sorted = sortFinancialEvents(events);
        sorted.forEach(function (event) {
            if (!event || event.type !== 'finance.event_reversed') return;
            var target = event.related_entity_id
                || (event.metadata && event.metadata.reversed_event_id)
                || (event.metadata && event.metadata.event_id)
                || null;
            if (target) reversed.add(String(target));
        });
        return reversed;
    }

    var api = {
        REQUIRED_EVENT_TYPES: REQUIRED_EVENT_TYPES,
        SUPPLEMENTAL_EVENT_TYPES: SUPPLEMENTAL_EVENT_TYPES,
        ALL_EVENT_TYPES: ALL_EVENT_TYPES,
        deepClone: deepClone,
        roundMoney: roundMoney,
        createId: createId,
        normalizeCurrency: normalizeCurrency,
        clampProbability: clampProbability,
        isValidEventType: isValidEventType,
        isIsoTimestamp: isIsoTimestamp,
        localDateKey: localDateKey,
        toMinor: toMinor,
        fromMinor: fromMinor,
        sortFinancialEvents: sortFinancialEvents,
        createFinancialEvent: createFinancialEvent,
        resolveReversedEventIds: resolveReversedEventIds
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceEvents = api;
})(typeof window !== 'undefined' ? window : globalThis);
