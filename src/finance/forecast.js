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

function recurrenceLimit(deal) {
  const unit = String(deal && deal.durationUnit || '').toLowerCase();
  const value = Number(deal && deal.durationValue);
  if (!Number.isFinite(value) || value <= 0) return Infinity;
  if (unit === 'months' || unit === 'times') return Math.max(1, Math.floor(value));
  return Infinity;
}

function recurrenceCountInWindow(deal, today, horizonEnd) {
  if (!isRetainerLike(deal)) return 1;
  const start = dateOnly(deal && deal.expectedDateISO) || today;
  if (start > horizonEnd) return 0;
  const first = start < today ? today : start;
  const startTs = Date.parse(`${first}T00:00:00.000Z`);
  const endTs = Date.parse(`${horizonEnd}T00:00:00.000Z`);
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs < startTs) return 0;
  const windowCount = Math.max(1, Math.floor((endTs - startTs) / (30 * 24 * 60 * 60 * 1000)) + 1);
  const limit = recurrenceLimit(deal);
  if (!Number.isFinite(limit)) return windowCount;
  const originalStartTs = Date.parse(`${start}T00:00:00.000Z`);
  const todayTs = Date.parse(`${today}T00:00:00.000Z`);
  const elapsed = start < today && Number.isFinite(originalStartTs) && Number.isFinite(todayTs)
    ? Math.max(0, Math.floor((todayTs - originalStartTs) / (30 * 24 * 60 * 60 * 1000)))
    : 0;
  return Math.max(0, Math.min(windowCount, limit - elapsed));
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
    return sum + Math.max(0, Number(debt && debt.monthlyPressure) || Number(debt && debt.minimumPaymentMonthly) || 0);
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
  if (safeArray(readModel && readModel.debtAccounts).some((debt) => (Number(debt && debt.outstanding) || 0) > 0 && String(debt && debt.planStatus || (Number(debt && debt.minimumPaymentMonthly) > 0 ? 'active' : 'missing')) === 'missing')) {
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

export function buildReserveHealth({ readModel = {}, treasury = {} } = {}) {
  const buckets = safeArray(readModel && readModel.reserveBuckets).filter((bucket) => bucket && bucket.active !== false);
  const targetAmount = round(buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket && bucket.targetAmount) || 0), 0));
  const currentAmount = round(buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket && bucket.currentAmount) || 0), 0));
  const protectedCash = round(Number((treasury && treasury.protectedCash) ?? (treasury && treasury.reservedCash) ?? currentAmount) || 0);
  const gap = round(Math.max(0, targetAmount - currentAmount));
  const coveragePercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : (protectedCash > 0 ? 100 : 0);
  const status = targetAmount <= 0
    ? (protectedCash > 0 ? 'funded' : 'unconfigured')
    : gap <= 0
      ? 'funded'
      : coveragePercent >= 50
        ? 'partial'
        : 'thin';
  return {
    status,
    targetAmount,
    currentAmount,
    protectedCash,
    gap,
    coveragePercent,
    bucketCount: buckets.length,
  };
}

export function buildDangerZoneForecast(forecast = {}) {
  const horizons = safeArray(forecast && forecast.horizons);
  if (!horizons.length) {
    return {
      status: 'unknown',
      lowestAmount: null,
      lowestDate: '',
      horizonDays: null,
      cause: 'Add forecast inputs to reveal future tight spots.',
      suggestedAction: 'Add expected income and recurring obligations.',
    };
  }
  const lowest = horizons.reduce((winner, entry) => {
    if (!winner) return entry;
    return Number(entry && entry.expected) < Number(winner && winner.expected) ? entry : winner;
  }, null);
  const lowestAmount = round(Number(lowest && lowest.expected) || 0);
  const warning = safeArray(forecast && forecast.warnings)[0] || '';
  const components = (lowest && lowest.components) || {};
  const outgoing = Number(components.recurringObligations || components.outgoingCash || 0);
  const incoming = Number(components.expectedIncome || components.incomingCash || 0);
  const cause = warning
    || (outgoing > incoming
      ? 'Recurring obligations exceed expected income in this window.'
      : 'Lowest projected balance comes from the current forecast mix.');
  const suggestedAction = lowestAmount < 0
    ? 'Pull confirmed income forward or reduce near-term obligations.'
    : outgoing > incoming
      ? 'Review upcoming obligations and expected income timing.'
      : 'Keep Flow current and watch the next forecast low.';
  return {
    status: lowestAmount < 0 ? 'shortfall' : lowestAmount < Math.max(250, outgoing * 0.1) ? 'tight' : 'clear',
    lowestAmount,
    lowestDate: String(lowest && lowest.horizonEnd || ''),
    horizonDays: Number(lowest && lowest.days) || null,
    cause,
    suggestedAction,
  };
}

export function buildFinancialWeather({ snapshot = {}, treasury = {}, forecast = {}, reserveHealth = null } = {}) {
  const reserve = reserveHealth || buildReserveHealth({ readModel: {}, treasury });
  const safeToSpend = Number((treasury && treasury.safeToSpend) ?? (snapshot && snapshot.safeToSpend));
  const availableCash = Number((treasury && treasury.availableCash) ?? (snapshot && snapshot.availableCash));
  const runway = Number((treasury && treasury.runwayMonths) ?? (snapshot && snapshot.runwayMonths));
  const warnings = safeArray(forecast && forecast.warnings);
  const danger = buildDangerZoneForecast(forecast);
  let state = 'Clear';
  let reason = 'Cash, runway, and reserves are in a usable range.';
  let suggestedAction = 'Keep the weekly review cadence.';

  if ((Number.isFinite(safeToSpend) && safeToSpend < 0) || (Number.isFinite(availableCash) && availableCash < 0) || danger.status === 'shortfall') {
    state = 'Stormy';
    reason = danger.status === 'shortfall' ? danger.cause : 'Available cash is below committed pressure.';
    suggestedAction = danger.status === 'shortfall' ? danger.suggestedAction : 'Cover near-term obligations before optional spending.';
  } else if ((Number.isFinite(runway) && runway < 2) || warnings.some((warning) => /debt|confidence|overdue/i.test(String(warning)))) {
    state = 'Tight';
    reason = Number.isFinite(runway) && runway < 2 ? 'Runway is under two months.' : warnings[0];
    suggestedAction = 'Review income timing, debt plans, and recurring burn.';
  } else if ((Number.isFinite(safeToSpend) && safeToSpend < Math.max(250, Number(treasury && treasury.minimumBuffer) || 0)) || reserve.status === 'thin' || danger.status === 'tight') {
    state = 'Watchful';
    reason = reserve.status === 'thin' ? 'Reserve coverage is below target.' : 'The forecast has a tight low point.';
    suggestedAction = 'Review reserves and the next cashflow low.';
  } else if (warnings.length || reserve.status === 'partial') {
    state = 'Stable';
    reason = warnings[0] || 'Core cash is steady, with one planning gap to watch.';
    suggestedAction = 'Keep Plan and Flow current.';
  }

  return {
    state,
    reason,
    suggestedAction,
  };
}

export function buildTopSignals({ readModel = {}, snapshot = {}, treasury = {}, forecast = {}, reserveHealth = null } = {}) {
  const reserve = reserveHealth || buildReserveHealth({ readModel, treasury });
  const danger = buildDangerZoneForecast(forecast);
  const signals = [];
  const addSignal = (signal) => {
    if (!signal || !signal.title) return;
    signals.push({
      title: String(signal.title),
      severity: signal.severity || 'info',
      reason: String(signal.reason || ''),
      recommendedAction: String(signal.recommendedAction || 'Review this item.'),
      source: signal.source || 'Pulse',
    });
  };

  if (danger.status === 'shortfall' || danger.status === 'tight') {
    addSignal({
      title: danger.status === 'shortfall' ? 'Forecast shortfall' : 'Tight forecast low',
      severity: danger.status === 'shortfall' ? 'critical' : 'warning',
      reason: danger.cause,
      recommendedAction: danger.suggestedAction,
      source: 'Flow',
    });
  }
  if (reserve.status === 'thin' || reserve.status === 'partial' || reserve.status === 'unconfigured') {
    addSignal({
      title: reserve.status === 'unconfigured' ? 'Reserve plan missing' : 'Reserve target gap',
      severity: reserve.status === 'thin' ? 'warning' : 'info',
      reason: reserve.status === 'unconfigured'
        ? 'No active reserve target is configured.'
        : `${reserve.coveragePercent}% of reserve targets are funded.`,
      recommendedAction: 'Review reserve targets in Plan.',
      source: 'Plan',
    });
  }
  if (safeArray(readModel && readModel.debtAccounts).some((debt) => (Number(debt && debt.outstanding) || 0) > 0 && String(debt && debt.planStatus || (Number(debt && debt.minimumPaymentMonthly) > 0 ? 'active' : 'missing')) === 'missing')) {
    addSignal({
      title: 'Debt payment plan missing',
      severity: 'warning',
      reason: 'A debt item has outstanding balance without a normalized payment plan.',
      recommendedAction: 'Add a payment plan so burn and runway stay accurate.',
      source: 'Plan',
    });
  }
  const openReviewCount = safeArray(treasury && treasury.reviewQueue).length || safeArray(snapshot && snapshot.attentionQueue).length;
  if (openReviewCount > 0) {
    addSignal({
      title: 'Open review items',
      severity: openReviewCount >= 5 ? 'warning' : 'info',
      reason: `${openReviewCount} item${openReviewCount === 1 ? '' : 's'} need classification, matching, or a decision.`,
      recommendedAction: 'Clear the most important items in Review.',
      source: 'Review',
    });
  }
  if (!signals.length) {
    addSignal({
      title: 'No major signal',
      severity: 'info',
      reason: 'The current local data does not show an urgent imbalance.',
      recommendedAction: 'Keep the weekly review cadence.',
      source: 'Radar',
    });
  }

  const rank = { critical: 3, warning: 2, info: 1 };
  return signals.sort((left, right) => (rank[right.severity] || 0) - (rank[left.severity] || 0)).slice(0, 5);
}

export function buildRoadmapFinanceMetrics({ readModel = {}, snapshot = {}, treasury = {}, nowIso = new Date().toISOString() } = {}) {
  const forecast = buildFinanceForecast({ readModel, snapshot, treasury, nowIso });
  const reserveHealth = buildReserveHealth({ readModel, treasury });
  return {
    forecast,
    reserveHealth,
    dangerZone: buildDangerZoneForecast(forecast),
    financialWeather: buildFinancialWeather({ snapshot, treasury, forecast, reserveHealth }),
    topSignals: buildTopSignals({ readModel, snapshot, treasury, forecast, reserveHealth }),
  };
}
