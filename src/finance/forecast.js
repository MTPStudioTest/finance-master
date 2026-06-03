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
  const status = normalizeStatus(statusOf(deal));
  return !['paid', 'cancelled', 'lost'].includes(status);
}

export const INCOME_STATUS_PROBABILITY_DEFAULTS = {
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
  received: 1,
  cancelled: 0,
  lost: 0,
};

function probabilityFor(deal) {
  if (Number.isFinite(Number(deal && deal.probability))) return clampProbability(deal.probability);
  const incomeType = String(deal && deal.incomeType || '').toLowerCase();
  if (incomeType === 'retainer' || incomeType === 'recurring') return INCOME_STATUS_PROBABILITY_DEFAULTS[incomeType];
  return INCOME_STATUS_PROBABILITY_DEFAULTS[normalizeStatus(statusOf(deal))] ?? 0.6;
}

function normalizeStatus(status) {
  const raw = String(status || 'expected').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  if (raw === 'open' || raw === 'manual_expected_income') return 'expected';
  if (raw === 'signed' || raw === 'verbal_commitment') return 'confirmed';
  if (raw === 'invoice_sent' || raw === 'sent') return 'invoiced';
  if (raw === 'received' || raw === 'settled' || raw === 'closed') return 'paid';
  if (raw === 'deleted') return 'cancelled';
  if (raw === 'opportunity') return 'lead';
  return raw;
}

function incomeScenarioValue(deal, scenario) {
  const status = normalizeStatus(statusOf(deal));
  const amount = Math.max(0, Number(deal && (deal.value ?? deal.amount)) || 0);
  const probability = probabilityFor(deal);
  const incomeType = String(deal && deal.incomeType || '').toLowerCase();
  if (scenario === 'conservative') {
    if (['confirmed', 'invoiced', 'due', 'overdue'].includes(status) && probability >= 0.85) return amount * probability;
    return 0;
  }
  if (scenario === 'expected') {
    if (['confirmed', 'invoiced', 'due', 'overdue'].includes(status) && probability >= 0.85) return amount * probability;
    if ((['expected'].includes(status) || incomeType === 'retainer' || incomeType === 'recurring') && probability >= 0.5) return amount * probability;
    return 0;
  }
  if (scenario === 'optimistic') {
    if (['lead', 'proposal', 'risky'].includes(status) && probability > 0) return amount * probability;
    return incomeScenarioValue(deal, 'expected');
  }
  return 0;
}

function isWithinWindow(date, today, horizonEnd) {
  if (!date) return false;
  return date >= today && date <= horizonEnd;
}

function isRetainerLike(deal) {
  const type = String(deal && deal.incomeType || '').toLowerCase();
  return type === 'retainer' || type === 'recurring';
}

function recurrenceCountInWindow(deal, today, horizonEnd) {
  if (!isRetainerLike(deal)) return 1;
  const start = dateOnly(deal && deal.expectedDateISO) || today;
  if (start > horizonEnd) return 0;
  const first = start < today ? today : start;
  const startTs = Date.parse(`${first}T00:00:00.000Z`);
  const endTs = Date.parse(`${horizonEnd}T00:00:00.000Z`);
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs < startTs) return 0;
  return Math.max(1, Math.floor((endTs - startTs) / (30 * 24 * 60 * 60 * 1000)) + 1);
}

function scenarioIncomeTotal(deals, scenario, today, horizonEnd) {
  return safeArray(deals).reduce((sum, deal) => {
    const count = recurrenceCountInWindow(deal, today, horizonEnd);
    if (!count) return sum;
    return sum + (incomeScenarioValue(deal, scenario) * count);
  }, 0);
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
    .filter((deal) => isRetainerLike(deal) ? recurrenceCountInWindow(deal, today, horizonEnd) > 0 : isWithinWindow(dateOnly(deal && deal.expectedDateISO), today, horizonEnd));
  const reserveTargetGap = round(reserveGap(readModel));
  const reserveMovements = reserveMovementCount(readModel, today, horizonEnd);
  const conservativeIncome = round(scenarioIncomeTotal(activeIncome, 'conservative', today, horizonEnd));
  const expectedIncome = round(scenarioIncomeTotal(activeIncome, 'expected', today, horizonEnd));
  const optimisticIncome = round(scenarioIncomeTotal(activeIncome, 'optimistic', today, horizonEnd));

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
      incomingCash: expectedIncome,
      outgoingCash: recurringObligations,
      endingCash: round(startingAvailableCash - recurringObligations + expectedIncome),
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
  if (safeArray(readModel && readModel.pipelineDeals).some((deal) => isActiveIncome(deal) && ['overdue', 'severely_overdue'].includes(String(deal && deal.dueState || '').toLowerCase()))) {
    warnings.push('Overdue income may make this forecast unreliable.');
  }
  if (Number.isFinite(lowestExpected) && lowestExpected < 0) {
    warnings.push('Expected forecast dips below available cash.');
  }
  const startingAvailableCash = Number((treasury && treasury.availableCash) ?? (snapshot && snapshot.availableCash));
  if (Number.isFinite(startingAvailableCash) && startingAvailableCash < 0) {
    warnings.push('Available cash is already negative.');
  }
  const confidenceScore = Number(snapshot && (snapshot.confidenceScore ?? snapshot.forecastConfidence));
  if (Number.isFinite(confidenceScore) && confidenceScore < 0.6) {
    warnings.push('Forecast confidence is low because some inputs need review.');
  }
  const reserveTargetGap = round(reserveGap(readModel));
  if (reserveTargetGap > 0) {
    warnings.push('Reserve targets are not fully funded.');
  }
  if (safeArray(readModel && readModel.debtAccounts).some((debt) => (Number(debt && debt.outstanding) || 0) > 0 && !(Number(debt && debt.minimumPaymentMonthly) > 0))) {
    warnings.push('Some debt items still need payment plans.');
  }

  return {
    generatedAt: nowIso,
    horizons: entries,
    byHorizon,
    warnings,
    lowestExpected: Number.isFinite(lowestExpected) ? round(lowestExpected) : null,
  };
}
