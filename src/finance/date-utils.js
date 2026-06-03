(function (global) {
    'use strict';

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function dateOnlyFromParts(year, month, day) {
        var y = Number(year);
        var m = Number(month);
        var d = Number(day);
        if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return '';
        var date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
        if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return '';
        return y + '-' + pad(m) + '-' + pad(d);
    }

    function isDateOnly(value) {
        var text = String(value || '').trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
        var parts = text.split('-').map(Number);
        return dateOnlyFromParts(parts[0], parts[1], parts[2]) === text;
    }

    function toDateOnly(value) {
        if (value == null || value === '') return '';
        if (typeof value === 'number' || Object.prototype.toString.call(value) === '[object Date]') {
            var directDate = new Date(value);
            if (!Number.isFinite(directDate.getTime())) return '';
            return dateOnlyFromParts(directDate.getUTCFullYear(), directDate.getUTCMonth() + 1, directDate.getUTCDate());
        }
        var text = String(value).trim();
        if (isDateOnly(text)) return text;
        var ts = Date.parse(text);
        if (!Number.isFinite(ts)) return '';
        var date = new Date(ts);
        return dateOnlyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }

    function todayDateOnly() {
        var date = new Date();
        return dateOnlyFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    function dateOnlyToNoonIso(value) {
        var date = toDateOnly(value);
        if (!date) return new Date().toISOString();
        return date + 'T12:00:00.000Z';
    }

    function addDaysDateOnly(value, days) {
        var date = toDateOnly(value);
        if (!date) return '';
        var parts = date.split('-').map(Number);
        var utc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + (Number(days) || 0), 12, 0, 0, 0));
        return dateOnlyFromParts(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
    }

    function monthKey(value) {
        var date = toDateOnly(value);
        return date ? date.slice(0, 7) : '';
    }

    function compareDateOnly(a, b) {
        var left = toDateOnly(a);
        var right = toDateOnly(b);
        if (!left || !right) return 0;
        return left < right ? -1 : (left > right ? 1 : 0);
    }

    global.FinanceDates = {
        addDaysDateOnly: addDaysDateOnly,
        compareDateOnly: compareDateOnly,
        dateOnlyFromParts: dateOnlyFromParts,
        dateOnlyToNoonIso: dateOnlyToNoonIso,
        isDateOnly: isDateOnly,
        monthKey: monthKey,
        todayDateOnly: todayDateOnly,
        toDateOnly: toDateOnly
    };
})(typeof window !== 'undefined' ? window : globalThis);
