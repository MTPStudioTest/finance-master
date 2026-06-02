(function (global) {
    'use strict';

    function round(value) {
        var num = Number(value);
        if (!Number.isFinite(num)) return 0;
        return Math.round(num * 100) / 100;
    }

    function almostEqual(a, b, epsilon) {
        var tolerance = Number.isFinite(Number(epsilon)) ? Number(epsilon) : 0.01;
        return Math.abs((Number(a) || 0) - (Number(b) || 0)) <= tolerance;
    }

    function evaluateFinancialInvariants(context) {
        var source = context && typeof context === 'object' ? context : {};
        var snapshot = source.snapshot && typeof source.snapshot === 'object' ? source.snapshot : {};
        var components = source.components && typeof source.components === 'object' ? source.components : {};

        var violations = [];

        var expectedRealBalance = round(components.realBalanceFromSums);
        if (!almostEqual(snapshot.realBalance, expectedRealBalance, 0.01)) {
            violations.push({
                id: 'real-balance-consistency',
                message: 'Real balance does not match ledger sums.',
                expected: expectedRealBalance,
                actual: round(snapshot.realBalance),
                severity: 'high'
            });
        }

        if (snapshot.monthlyBurn == null) {
            if (snapshot.runwayMonths !== null) {
                violations.push({
                    id: 'runway-null-when-burn-missing',
                    message: 'Runway must be null when monthly burn is undefined.',
                    expected: null,
                    actual: snapshot.runwayMonths,
                    severity: 'medium'
                });
            }
        } else if (Number(snapshot.monthlyBurn) === 0) {
            if (snapshot.runwayMonths !== null) {
                violations.push({
                    id: 'runway-null-when-burn-zero',
                    message: 'Runway must be null when monthly burn is zero.',
                    expected: null,
                    actual: snapshot.runwayMonths,
                    severity: 'medium'
                });
            }
        } else {
            var expectedRunway = round((Number(snapshot.realBalance) || 0) / (Number(snapshot.monthlyBurn) || 1));
            if (!almostEqual(snapshot.runwayMonths, expectedRunway, 0.01)) {
                violations.push({
                    id: 'runway-formula',
                    message: 'Runway is inconsistent with balance / burn.',
                    expected: expectedRunway,
                    actual: round(snapshot.runwayMonths),
                    severity: 'high'
                });
            }
        }

        var expectedPipeline = round(components.weightedPipelineFromDeals);
        if (!almostEqual(snapshot.weightedPipeline, expectedPipeline, 0.01)) {
            violations.push({
                id: 'pipeline-sum-consistency',
                message: 'Weighted pipeline does not match deal list.',
                expected: expectedPipeline,
                actual: round(snapshot.weightedPipeline),
                severity: 'high'
            });
        }

        var expectedDebt = round(components.totalDebtFromLiabilities);
        if (!almostEqual(snapshot.totalDebt, expectedDebt, 0.01)) {
            violations.push({
                id: 'debt-total-consistency',
                message: 'Debt total does not match liability ledger.',
                expected: expectedDebt,
                actual: round(snapshot.totalDebt),
                severity: 'high'
            });
        }

        return {
            ok: violations.length === 0,
            violations: violations,
            messages: violations.map(function (entry) {
                return entry.message;
            })
        };
    }

    var api = {
        evaluateFinancialInvariants: evaluateFinancialInvariants
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.FinanceInvariants = api;
})(typeof window !== 'undefined' ? window : globalThis);
