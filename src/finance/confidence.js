(function (global) {
    'use strict';

    function clamp01(value) {
        var num = Number(value);
        if (!Number.isFinite(num)) return 0;
        if (num < 0) return 0;
        if (num > 1) return 1;
        return num;
    }

    function confidenceLevel(score) {
        var value = clamp01(score);
        if (value >= 0.75) return 'HIGH';
        if (value >= 0.45) return 'MEDIUM';
        return 'LOW';
    }

    function unique(values) {
        var seen = new Set();
        var out = [];
        (Array.isArray(values) ? values : []).forEach(function (value) {
            var entry = String(value || '').trim();
            if (!entry || seen.has(entry)) return;
            seen.add(entry);
            out.push(entry);
        });
        return out;
    }

    function computeConfidenceScore(input) {
        var source = input && typeof input === 'object' ? input : {};

        var score = 1;
        var missing = [];
        var reasons = [];

        if (source.missingRecurringExpenses) {
            score -= 0.12;
            missing.push('recurring expenses');
            reasons.push('Missing recurring expenses configuration.');
        }

        if (source.noRecentData) {
            score -= 0.15;
            missing.push('recent financial activity');
            reasons.push('No recent finance data in last 30 days.');
        }

        if (source.undefinedBurn) {
            score -= 0.25;
            missing.push('monthly burn');
            reasons.push('Monthly burn is undefined.');
        }

        if (source.emptyPipeline) {
            score -= 0.10;
            missing.push('pipeline');
            reasons.push('Pipeline is empty.');
        }

        if (source.staleCompute) {
            score -= 0.08;
            missing.push('compute freshness');
            reasons.push('Snapshot is stale versus latest event timestamp.');
        }

        var invariantCount = Array.isArray(source.invariantViolations) ? source.invariantViolations.length : 0;
        if (invariantCount > 0) {
            score -= Math.min(0.4, invariantCount * 0.1);
            reasons.push('Invariant checks reported ' + invariantCount + ' violation(s).');
        }

        score = clamp01(score);

        return {
            score: score,
            level: confidenceLevel(score),
            missingInputs: unique((source.missingInputs || []).concat(missing)),
            reasons: reasons
        };
    }

    var api = {
        clamp01: clamp01,
        confidenceLevel: confidenceLevel,
        computeConfidenceScore: computeConfidenceScore
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceConfidence = api;
})(typeof window !== 'undefined' ? window : globalThis);
