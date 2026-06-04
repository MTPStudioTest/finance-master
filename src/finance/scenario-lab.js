function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function round(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function metricValue(source, keys, fallback = 0) {
  for (const key of keys) {
    const value = Number(source && source[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

function normalizeType(value) {
  const raw = String(value || '').trim().toLowerCase();
  return [
    'reduce_flexible_costs',
    'reduce_debt_pressure',
    'add_recurring_income',
    'protect_future_income',
    'pause_savings_goal',
    'increase_reserve_contribution',
  ].includes(raw) ? raw : 'reduce_flexible_costs';
}

function normalizeScenario(input, index = 0) {
  const type = normalizeType(input && input.type);
  const amount = Math.max(0, Number(input && input.amount) || 0);
  const nowIso = new Date().toISOString();
  return {
    id: String(input && input.id || `scenario-${type}-${index}`),
    name: String(input && input.name || labelForType(type)),
    type,
    amount,
    protectPercent: Math.max(0, Math.min(100, Number(input && input.protectPercent) || 0)),
    createdAt: String(input && input.createdAt || nowIso),
    updatedAt: String(input && input.updatedAt || nowIso),
  };
}

function labelForType(type) {
  return {
    reduce_flexible_costs: 'Reduce flexible costs',
    reduce_debt_pressure: 'Reduce debt pressure',
    add_recurring_income: 'Add recurring income',
    protect_future_income: 'Protect future income',
    pause_savings_goal: 'Pause savings goal',
    increase_reserve_contribution: 'Increase reserve contribution',
  }[type] || 'Scenario';
}

function deriveBase({ snapshot = {}, treasury = {} }) {
  const availableCash = metricValue(treasury, ['availableCash'], metricValue(snapshot, ['availableCash', 'trulyAvailableCash'], 0));
  const safeToSpend = metricValue(treasury, ['safeToSpend'], metricValue(snapshot, ['safeToSpend'], availableCash));
  const monthlyBurn = Math.max(0, metricValue(treasury, ['totalMonthlyBurn'], metricValue(snapshot, ['monthlyBurn'], 0)));
  const debtPressure = Math.max(0, metricValue(treasury, ['debtMonthlyPressure', 'debtPaymentsDueSoon'], metricValue(snapshot, ['debtPaymentsDueSoon'], 0)));
  const protectedCash = Math.max(0, metricValue(treasury, ['protectedCash'], metricValue(snapshot, ['reservedCash'], 0)));
  const reserveGap = Math.max(0, metricValue(treasury, ['reserveGap'], 0));
  const runway = monthlyBurn > 0 ? round(availableCash / monthlyBurn) : null;
  return {
    safeToSpend: round(safeToSpend),
    availableCash: round(availableCash),
    monthlyBurn: round(monthlyBurn),
    runway,
    debtPressure: round(debtPressure),
    reserveGap: round(reserveGap),
    protectedCash: round(protectedCash),
  };
}

function applyScenario(base, scenario) {
  const next = { ...base };
  const amount = Math.max(0, Number(scenario && scenario.amount) || 0);
  if (scenario.type === 'reduce_flexible_costs') {
    const reduction = Math.min(amount, next.monthlyBurn);
    next.monthlyBurn = round(next.monthlyBurn - reduction);
    next.safeToSpend = round(next.safeToSpend + reduction);
  }
  if (scenario.type === 'reduce_debt_pressure') {
    const reduction = Math.min(amount, next.debtPressure);
    next.debtPressure = round(next.debtPressure - reduction);
    next.monthlyBurn = round(Math.max(0, next.monthlyBurn - reduction));
    next.safeToSpend = round(next.safeToSpend + reduction);
  }
  if (scenario.type === 'add_recurring_income') {
    next.safeToSpend = round(next.safeToSpend + amount);
    next.availableCash = round(next.availableCash + amount);
  }
  if (scenario.type === 'protect_future_income') {
    const protectedAmount = round(amount * ((Number(scenario.protectPercent) || 0) / 100));
    next.safeToSpend = round(next.safeToSpend - protectedAmount);
    next.availableCash = round(next.availableCash - protectedAmount);
    next.protectedCash = round(next.protectedCash + protectedAmount);
    next.reserveGap = round(Math.max(0, next.reserveGap - protectedAmount));
  }
  if (scenario.type === 'pause_savings_goal') {
    next.safeToSpend = round(next.safeToSpend + amount);
    next.availableCash = round(next.availableCash + amount);
  }
  if (scenario.type === 'increase_reserve_contribution') {
    next.safeToSpend = round(next.safeToSpend - amount);
    next.availableCash = round(next.availableCash - amount);
    next.protectedCash = round(next.protectedCash + amount);
    next.reserveGap = round(Math.max(0, next.reserveGap - amount));
  }
  next.runway = next.monthlyBurn > 0 ? round(next.availableCash / next.monthlyBurn) : null;
  return next;
}

function delta(base, adjusted) {
  return {
    safeToSpend: round(adjusted.safeToSpend - base.safeToSpend),
    availableCash: round(adjusted.availableCash - base.availableCash),
    monthlyBurn: round(adjusted.monthlyBurn - base.monthlyBurn),
    runway: base.runway == null || adjusted.runway == null ? null : round(adjusted.runway - base.runway),
    debtPressure: round(adjusted.debtPressure - base.debtPressure),
    reserveGap: round(adjusted.reserveGap - base.reserveGap),
  };
}

function impactScore(changes) {
  const runway = changes.runway == null ? 0 : changes.runway * 100;
  return round(runway + changes.safeToSpend + Math.abs(Math.min(0, changes.monthlyBurn)) + Math.abs(Math.min(0, changes.debtPressure)) + Math.abs(Math.min(0, changes.reserveGap)));
}

function warningsFor(base, adjusted, scenario) {
  const warnings = [];
  if (adjusted.safeToSpend < 0) warnings.push('This scenario leaves Safe-to-Spend below zero.');
  if (adjusted.availableCash < 0) warnings.push('This scenario leaves available cash below zero.');
  if (scenario.type === 'protect_future_income' && !scenario.protectPercent) warnings.push('Choose a protection percentage to model future-income reserves.');
  if (scenario.type === 'increase_reserve_contribution' && base.reserveGap <= 0) warnings.push('Reserve gap is already closed in the current model.');
  return warnings;
}

function evaluate(base, scenario, index) {
  const normalized = normalizeScenario(scenario, index);
  const adjusted = applyScenario(base, normalized);
  const changes = delta(base, adjusted);
  return {
    ...normalized,
    base,
    adjusted,
    delta: changes,
    impactScore: impactScore(changes),
    warnings: warningsFor(base, adjusted, normalized),
  };
}

function defaultScenarios({ base, forecast = {}, decisionEngine = {} }) {
  const expectedIncome = Number(forecast && forecast.byHorizon && forecast.byHorizon['30'] && forecast.byHorizon['30'].components && forecast.byHorizon['30'].components.expectedIncome) || 0;
  const focusAmount = safeArray(decisionEngine && decisionEngine.warnings).length ? 250 : 150;
  return [
    { id: 'scenario-flex-cut', type: 'reduce_flexible_costs', name: 'Reduce flexible costs', amount: Math.min(Math.max(base.monthlyBurn * 0.08, focusAmount), 500) },
    { id: 'scenario-debt-pressure', type: 'reduce_debt_pressure', name: 'Reduce debt pressure', amount: Math.min(Math.max(base.debtPressure * 0.25, 100), base.debtPressure || 250) },
    { id: 'scenario-income', type: 'add_recurring_income', name: 'Add recurring income', amount: Math.max(1000, Math.min(3000, expectedIncome || 1500)) },
    { id: 'scenario-protect-income', type: 'protect_future_income', name: 'Protect future income', amount: Math.max(1000, expectedIncome || 1500), protectPercent: 25 },
    { id: 'scenario-pause-savings', type: 'pause_savings_goal', name: 'Pause savings goal', amount: 250 },
    { id: 'scenario-reserve', type: 'increase_reserve_contribution', name: 'Increase reserve contribution', amount: Math.min(Math.max(base.reserveGap * 0.2, 100), 500) },
  ];
}

export function buildScenarioLab({
  readModel = {},
  snapshot = {},
  treasury = {},
  forecast = {},
  decisionEngine = {},
  savedScenarios = [],
  nowIso = new Date().toISOString(),
} = {}) {
  const base = deriveBase({ readModel, snapshot, treasury });
  const saved = safeArray(savedScenarios).map(normalizeScenario);
  const recommended = defaultScenarios({ base, forecast, decisionEngine });
  const comparable = recommended.concat(saved).map((scenario, index) => evaluate(base, scenario, index));
  comparable.sort((left, right) => right.impactScore - left.impactScore || String(left.name).localeCompare(String(right.name)));
  return {
    generatedAt: nowIso,
    base,
    recommended: recommended.map(normalizeScenario),
    saved,
    comparable,
    topScenario: comparable[0] || null,
    warnings: comparable.flatMap((scenario) => scenario.warnings.map((warning) => ({ scenarioId: scenario.id, warning }))).slice(0, 6),
  };
}
