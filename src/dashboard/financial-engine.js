/**
 * FinancialEngine — Snapshot-first compatibility layer.
 */

window.FinancialEngine = (function () {
    'use strict';

    const STRESS_LEVELS = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High'
    };

    function toNumber(value, fallback) {
        const num = Number(value);
        if (Number.isFinite(num)) return num;
        return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
    }

    function clamp(value, min, max) {
        const num = toNumber(value, min);
        return Math.min(max, Math.max(min, num));
    }

    function normalizeSnapshot(source) {
        const snap = source && typeof source === 'object' ? source : {};
        const monthlyBurn = snap.monthlyBurn == null ? null : toNumber(snap.monthlyBurn, 0);
        const runwayMonths = snap.runwayMonths == null ? null : toNumber(snap.runwayMonths, null);
        return {
            realBalance: toNumber(snap.realBalance, 0),
            projectedBalance: toNumber(snap.projectedBalance, 0),
            weightedPipeline: toNumber(snap.weightedPipeline, 0),
            monthlyBurn,
            runwayMonths,
            breakEvenRevenue: snap.breakEvenRevenue == null ? monthlyBurn : toNumber(snap.breakEvenRevenue, monthlyBurn),
            revenueToday: toNumber(snap.revenueToday, 0),
            totalDebt: toNumber(snap.totalDebt, 0),
            confidenceScore: Math.max(0, Math.min(1, toNumber(snap.confidenceScore, 0))),
            missingInputs: Array.isArray(snap.missingInputs) ? snap.missingInputs.slice() : [],
            lastComputedAt: snap.lastComputedAt || new Date().toISOString()
        };
    }

    function emptyReadModel() {
        return {
            pipelineDeals: [],
            recurringExpenses: [],
            debtAccounts: [],
            invoices: [],
            fiatAccounts: [],
            web3Positions: [],
            defiPositions: [],
            expectedPipeline90d: 0
        };
    }

    function getStoreSnapshot() {
        if (!window.Store || typeof window.Store.getFinancialSnapshot !== 'function') return null;
        return normalizeSnapshot(window.Store.getFinancialSnapshot());
    }

    function getStoreReadModel() {
        if (!window.Store || typeof window.Store.getFinancialReadModel !== 'function') return emptyReadModel();
        const model = window.Store.getFinancialReadModel();
        return model && typeof model === 'object' ? model : emptyReadModel();
    }

    function legacySnapshotFromV1(data) {
        const source = data && typeof data === 'object' ? data : {};
        const expenses = Array.isArray(source.expenses) ? source.expenses : [];
        const debt = Array.isArray(source.debt) ? source.debt : [];
        const income = Array.isArray(source.income) ? source.income : [];
        const fiatAccounts = Array.isArray(source.fiatAccounts) ? source.fiatAccounts : [];
        const savings = Array.isArray(source.savings) ? source.savings : [];
        const recurring = expenses.reduce((acc, entry) => acc + toNumber(entry && entry.monthlyAmount, 0), 0);
        const debtPayment = debt.reduce((acc, entry) => acc + toNumber(entry && entry.monthlyPayment, 0), 0);
        const monthlyBurn = recurring + debtPayment;
        const realBalance = fiatAccounts.reduce((acc, entry) => acc + toNumber(entry && entry.balance, 0), 0)
            + savings.reduce((acc, entry) => acc + toNumber(entry && entry.amount, 0), 0);
        const weightedPipeline = income
            .filter((entry) => String(entry && entry.status || '').toLowerCase() !== 'paid')
            .reduce((acc, entry) => acc + (toNumber(entry && entry.amount, 0) * toNumber(entry && entry.probability, 0)), 0);
        const totalDebt = debt.reduce((acc, entry) => acc + toNumber(entry && entry.total, 0), 0);
        const runwayMonths = monthlyBurn > 0 ? (realBalance / monthlyBurn) : null;
        return {
            realBalance,
            projectedBalance: realBalance + weightedPipeline,
            weightedPipeline,
            monthlyBurn,
            runwayMonths,
            breakEvenRevenue: monthlyBurn,
            revenueToday: 0,
            totalDebt,
            confidenceScore: 0.4,
            missingInputs: ['legacy finance model'],
            lastComputedAt: new Date().toISOString()
        };
    }

    function contextFromInput(data) {
        if (data && typeof data === 'object' && data.financeSnapshot) {
            return {
                snapshot: normalizeSnapshot(data.financeSnapshot),
                readModel: data.financeReadModel && typeof data.financeReadModel === 'object' ? data.financeReadModel : emptyReadModel()
            };
        }
        if (data && typeof data === 'object' && data.realBalance != null && data.weightedPipeline != null) {
            return {
                snapshot: normalizeSnapshot(data),
                readModel: emptyReadModel()
            };
        }
        const storeSnapshot = getStoreSnapshot();
        if (storeSnapshot) {
            return {
                snapshot: storeSnapshot,
                readModel: getStoreReadModel()
            };
        }
        return {
            snapshot: normalizeSnapshot(legacySnapshotFromV1(data)),
            readModel: emptyReadModel()
        };
    }

    function computeAllocation(readModel) {
        const fiatTotal = (Array.isArray(readModel.fiatAccounts) ? readModel.fiatAccounts : [])
            .reduce((acc, entry) => acc + toNumber(entry && entry.balance, 0), 0);
        let growth = 0;
        let speculative = 0;
        let safeWeb3 = 0;
        (Array.isArray(readModel.web3Positions) ? readModel.web3Positions : []).forEach((entry) => {
            const value = toNumber(entry && entry.amount, 0) * toNumber(entry && entry.price, 0);
            const liq = String(entry && entry.liquidity || '').toLowerCase();
            if (liq === 'low') speculative += value;
            else if (liq === 'med' || liq === 'medium') growth += value;
            else safeWeb3 += value;
        });
        return {
            safe: fiatTotal + safeWeb3,
            growth,
            speculative
        };
    }

    function compute(data) {
        const ctx = contextFromInput(data);
        const snapshot = ctx.snapshot;
        const readModel = ctx.readModel || emptyReadModel();
        const allocation = computeAllocation(readModel);
        const runway = snapshot.runwayMonths;

        let stressLevel = STRESS_LEVELS.LOW;
        if (runway == null || runway < 4) stressLevel = STRESS_LEVELS.HIGH;
        else if (runway < 6) stressLevel = STRESS_LEVELS.MEDIUM;

        const runwayScore = runway == null ? 0 : Math.min(100, Math.max(0, (runway / 12) * 100));
        const confidenceScore = Math.round(snapshot.confidenceScore * 100);
        const debtPenalty = snapshot.totalDebt > Math.max(1, snapshot.realBalance) ? 18 : 0;
        const safetyScore = Math.max(0, Math.min(100, Math.round((runwayScore * 0.6) + (confidenceScore * 0.4) - debtPenalty)));

        const monthlyBurn = snapshot.monthlyBurn == null ? 0 : snapshot.monthlyBurn;
        const weightedIncome90d = toNumber(readModel.expectedPipeline90d, snapshot.weightedPipeline);
        const confirmedIncome90d = (Array.isArray(readModel.invoices) ? readModel.invoices : [])
            .filter((entry) => String(entry && entry.status || '').toLowerCase() === 'paid')
            .reduce((acc, entry) => acc + toNumber(entry && entry.amount, 0), 0);

        const liquidNetWorth = snapshot.realBalance;
        const totalNetWorth = snapshot.projectedBalance;
        const debtTotalRemaining = snapshot.totalDebt;
        const web3Total = allocation.growth + allocation.speculative;
        const fiatTotal = allocation.safe;

        return {
            fiatTotal,
            savingsTotal: 0,
            debtTotalRemaining,
            web3Total,
            totalNetWorth,
            liquidNetWorth,
            monthlyBurn,
            survivalBurn: monthlyBurn,
            runwayMonths: snapshot.runwayMonths,
            survivalRunwayMonths: snapshot.runwayMonths,
            confirmedIncome90d,
            weightedIncome90d,
            stressLevel,
            safetyScore,
            allocation,
            confidenceScore: snapshot.confidenceScore,
            missingInputs: snapshot.missingInputs,
            computedAt: snapshot.lastComputedAt
        };
    }

    function generateProjections(data, scenarioToggles = {}) {
        const ctx = contextFromInput(data);
        const metrics = compute(data);
        const readModel = ctx.readModel || emptyReadModel();
        const months = 12;
        const projections = {
            safe: [],
            realistic: [],
            optimistic: []
        };

        const income = Array.isArray(readModel.pipelineDeals) ? readModel.pipelineDeals : [];
        let currentSafe = toNumber(ctx.snapshot.realBalance, 0);
        let currentRealistic = toNumber(ctx.snapshot.realBalance, 0);
        let currentOptimistic = toNumber(ctx.snapshot.realBalance, 0);

        const probabilityFloor = clamp(toNumber(scenarioToggles.probFloor, 50) / 100, 0, 1);
        const marketShift = clamp(toNumber(scenarioToggles.marketShift, 0), -1, 1);

        for (let i = 0; i < months; i++) {
            const targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() + i);
            const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

            const monthIncome = income.filter((item) => {
                const itemDate = new Date(item.expectedDateISO || '');
                return itemDate >= monthStart && itemDate <= monthEnd;
            });

            const normalizeProbability = (raw) => clamp(Math.max(toNumber(raw, 0), probabilityFloor) * (1 + marketShift), 0, 1);

            const safeInc = monthIncome
                .filter((inc) => String(inc.status || '').toLowerCase() === 'signed' || String(inc.status || '').toLowerCase() === 'paid')
                .reduce((acc, inc) => acc + toNumber(inc.value, 0), 0);
            const realInc = monthIncome
                .reduce((acc, inc) => acc + (toNumber(inc.value, 0) * normalizeProbability(inc.probability)), 0);
            const optInc = monthIncome
                .reduce((acc, inc) => acc + (toNumber(inc.value, 0) * clamp(normalizeProbability(inc.probability) + 0.2, 0, 1)), 0);

            const burn = toNumber(metrics.monthlyBurn, 0) * (1 + (scenarioToggles.burnChange || 0));
            currentSafe = currentSafe + safeInc - burn;
            currentRealistic = currentRealistic + realInc - burn;
            currentOptimistic = currentOptimistic + optInc - burn;

            projections.safe.push(Math.max(0, currentSafe));
            projections.realistic.push(Math.max(0, currentRealistic));
            projections.optimistic.push(Math.max(0, currentOptimistic));
        }

        return projections;
    }

    function getSignals(metrics) {
        if (!metrics) return null;
        const runway = metrics.runwayMonths;
        return {
            RUNWAY_STATUS: runway == null ? 'unknown' : (runway >= 6 ? 'safe' : (runway >= 4 ? 'thin' : 'critical')),
            STRESS_LEVEL: String(metrics.stressLevel || STRESS_LEVELS.HIGH).toLowerCase(),
            STABILITY_SCORE: toNumber(metrics.safetyScore, 0),
            URGENCY_FLAG: runway == null || runway < 4,
            CONFIDENCE_SCORE: toNumber(metrics.confidenceScore, 0),
            MISSING_INPUTS: Array.isArray(metrics.missingInputs) ? metrics.missingInputs.slice() : []
        };
    }

    function getSignalsFromStore() {
        if (!window.Store || typeof window.Store.getFinancialSnapshot !== 'function') return null;
        const metrics = compute({
            financeSnapshot: window.Store.getFinancialSnapshot(),
            financeReadModel: typeof window.Store.getFinancialReadModel === 'function'
                ? window.Store.getFinancialReadModel()
                : emptyReadModel()
        });
        return getSignals(metrics);
    }

    return {
        compute,
        generateProjections,
        getSignals,
        getSignalsFromStore,
        STRESS_LEVELS
    };
})();
