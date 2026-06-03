(function (global) {
    'use strict';

    var Events = global.FinanceEvents;
    var Ledger = global.FinanceLedger;
    var Compute = global.FinanceCompute;
    var ModalEvents = global.FinanceModalEvents;

    if (!Events && typeof module !== 'undefined' && module.exports) {
        Events = require('./events.js');
    }
    if (!Ledger && typeof module !== 'undefined' && module.exports) {
        Ledger = require('./ledger.js');
    }
    if (!Compute && typeof module !== 'undefined' && module.exports) {
        Compute = require('./compute.js');
    }
    if (!ModalEvents && typeof module !== 'undefined' && module.exports) {
        ModalEvents = require('./modal-events.js');
    }

    if (!Events || !Ledger || !Compute) {
        throw new Error('FinanceCommandService dependencies are missing.');
    }

    function normalizeSettings(settings) {
        return Ledger.normalizeSettings(settings || {});
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function previewFromDrafts(store, drafts, settingsOverride) {
        if (!store || typeof store.getFinanceLedger !== 'function' || typeof store.getFinanceSettings !== 'function') {
            return null;
        }
        var list = safeArray(drafts).filter(Boolean);
        if (!list.length) return null;
        var persistedSettings = store.getFinanceSettings() || {};
        var mergedSettings = normalizeSettings({
            baseCurrency: (settingsOverride && settingsOverride.baseCurrency) || persistedSettings.baseCurrency,
            forecastDays: (settingsOverride && settingsOverride.forecastDays) || persistedSettings.forecastDays,
            nowIso: (settingsOverride && settingsOverride.nowIso) || new Date().toISOString()
        });
        var currentEvents = store.getFinanceLedger();
        if (ModalEvents && typeof ModalEvents.previewSnapshot === 'function') {
            return ModalEvents.previewSnapshot(currentEvents, list, mergedSettings).snapshot;
        }
        var appendResult = Ledger.appendEvents(currentEvents, list, mergedSettings, {
            nowIso: mergedSettings.nowIso,
            allowApproximateTimestamp: false
        });
        return Compute.computeFinancialState(appendResult.events, mergedSettings);
    }

    function appendDrafts(store, drafts, options) {
        if (!store || typeof store.appendFinanceEvents !== 'function') {
            throw new Error('Store.appendFinanceEvents is unavailable.');
        }
        var list = safeArray(drafts).filter(Boolean);
        if (!list.length) return [];
        var opts = options || {};
        return store.appendFinanceEvents(list, {
            source: opts.source || 'finance.command'
        });
    }

    function getActiveEvents(store) {
        if (!store || typeof store.getFinanceLedger !== 'function' || !Ledger || typeof Ledger.getActiveEvents !== 'function') {
            return [];
        }
        return Ledger.getActiveEvents(store.getFinanceLedger());
    }

    var api = {
        normalizeSettings: normalizeSettings,
        previewFromDrafts: previewFromDrafts,
        appendDrafts: appendDrafts,
        getActiveEvents: getActiveEvents
    };

    global.FinanceCommandService = api;
})(typeof window !== 'undefined' ? window : globalThis);
