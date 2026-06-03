function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function clampProbability(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function dateOnly(value) {
  const text = String(value || '');
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return '';
  return new Date(parsed).toISOString().slice(0, 10);
}

function addDays(value, days) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function statusOf(deal) {
  return String(deal && (deal.status || deal.stage) || 'expected').toLowerCase();
}

function isActiveIncome(deal) {
  const status = statusOf(deal);
  return !['paid', 'received', 'cancelled', 'lost', 'closed', 'deleted'].includes(status);
}

export const INCOME_STATUS_PROBABILITY_DEFAULTS = {
  lead: 0.15,
  proposal: 0.4,
  expected: 0.6,
  confirmed: 0.9,
  invoiced: 0.95,
  due: 0.95,
  overdue: 0.75,
  risky: 0.35,
  paid: 1,
  received: 1,
  cancelled: 0,
  lost: 0,
};

function probabilityFor(deal) {
  if (Number.isFinite(Number(deal && deal.probability))) return clampProbability(deal.probability);
  return INCOME_STATUS_PROBABILITY_DEFAULTS[statusOf(deal)] ?? 0.6;
}

function incomeScenarioValue(deal, scenario) {
  const status = statusOf(deal);
  const amount = Math.max(0, Number(deal && (deal.value ?? deal.amount)) || 0);
  const probability = probabilityFor(deal);
  if (scenario === 'conservative') {
    if (['confirmed', 'invoiced', 'due'].includes(status)) return amount * probability;
    return 0;
  }
  if (scenario === 'optimistic') {
    if (['lead', 'proposal'].includes(status)) return amount * Math.max(probability, 0.5);
    return amount * Math.max(probability, 0.85);
  }
  return amount * probability;
}

function isWithinWindow(date, today, horizonEnd) {
  if (!date) return false;
  return date >= today && date <= horizonEnd;
}

function reserveGap(readModel) {
  return safeArray(readModel && readModel.reserveBuckets).reduce((sum, bucket) => {
    const target = Math.max(0, Number(bucket && bucket.targetAmount) || 0);
    const current = Math.max(0, Number(bucket && bucket.currentAmount) || 0);
    return sum + Math.max(0, target - current);
  }, 0);
}

function reserveMovementCount(readModel, today, horizonEnd) {
  return safeArray(readModel && readModel.transactions).filter((entry) => {
    const type = String(entry && (entry.ledgerType || entry.type) || '').toLowerCase();
    if (type !== 'transfer' && !String(entry && entry.linkedReserveId || '').trim()) return false;
    const timestamp = dateOnly(entry && entry.timestamp);
    return isWithinWindow(timestamp, today, horizonEnd);
  }).length;
}

function scenarioForHorizon({ readModel, snapshot, treasury, today, days }) {
  const horizonEnd = addDays(today, days);
  const startingAvailableCash = Number(
    (treasury && treasury.availableCash)
    ?? (snapshot && snapshot.availableCash)
    ?? (treasury && treasury.trulyAvailableCash)
    ?? 0,
  );
  const monthlyBurn = Math.max(0, Number(
    (treasury && treasury.totalMonthlyBurn)
    ?? (snapshot && snapshot.monthlyBurn)
    ?? 0,
  ) || 0);
  const recurringObligations = round(monthlyBurn * (days / 30));
  const debtPaymentPlans = round(safeArray(readModel && readModel.debtAccounts).reduce((sum, debt) => {
    return sum + Math.max(0, Number(debt && debt.minimumPaymentMonthly) || 0);
  }, 0) * (days / 30));
  const activeIncome = safeArray(readModel && readModel.pipelineDeals)
    .filter(isActiveIncome)
    .filter((deal) => isWithinWindow(dateOnly(deal && deal.expectedDateISO), today, horizonEnd));
  const reserveTargetGap = round(reserveGap(readModel));
  const reserveMovements = reserveMovementCount(readModel, today, horizonEnd);
  const conservativeIncome = round(activeIncome.reduce((sum, deal) => sum + incomeScenarioValue(deal, 'conservative'), 0));
  const expectedIncome = round(activeIncome.reduce((sum, deal) => sum + incomeScenarioValue(deal, 'expected'), 0));
  const optimisticIncome = round(activeIncome.reduce((sum, deal) => sum + incomeScenarioValue(deal, 'optimistic'), 0));

  return {
    days,
    horizonEnd,
    conservative: round(startingAvailableCash - recurringObligations + conservativeIncome),
    expected: round(startingAvailableCash - recurringObligations + expectedIncome),
    optimistic: round(startingAvailableCash - recurringObligations + optimisticIncome),
    components: {
      startingAvailableCash: round(startingAvailableCash),
      recurringObligations,
      debtPaymentPlans,
      reserveTargetGap,
      reserveMovements,
      conservativeIncome,
      expectedIncome,
      optimisticIncome,
    },
  };
}

export function buildFinanceForecast({
  readModel = {},
  snapshot = {},
  treasury = {},
  nowIso = new Date().toISOString(),
  horizons = [7, 30, 60, 90, 180],
} = {}) {
  const today = dateOnly(nowIso) || new Date().toISOString().slice(0, 10);
  const entries = safeArray(horizons)
    .map((days) => Math.max(1, Math.floor(Number(days) || 0)))
    .filter(Boolean)
    .map((days) => scenarioForHorizon({ readModel, snapshot, treasury, today, days }));
  const byHorizon = Object.fromEntries(entries.map((entry) => [String(entry.days), entry]));
  const lowestExpected = entries.reduce((min, entry) => Math.min(min, Number(entry.expected)), Number.POSITIVE_INFINITY);
  const warnings = [];
  if (!safeArray(readModel && readModel.pipelineDeals).some(isActiveIncome)) {
    warnings.push('No active income forecast is recorded.');
  }
  if (Number.isFinite(lowestExpected) && lowestExpected < 0) {
    warnings.push('Expected forecast dips below available cash.');
  }
  const confidenceScore = Number(snapshot && (snapshot.confidenceScore ?? snapshot.forecastConfidence));
  if (Number.isFinite(confidenceScore) && confidenceScore < 0.6) {
    warnings.push('Forecast confidence is low because some inputs need review.');
  }
  const reserveTargetGap = round(reserveGap(readModel));
  if (reserveTargetGap > 0) {
    warnings.push('Reserve targets are not fully funded.');
  }

  return {
    generatedAt: nowIso,
    horizons: entries,
    byHorizon,
    warnings,
    lowestExpected: Number.isFinite(lowestExpected) ? round(lowestExpected) : null,
  };
}
