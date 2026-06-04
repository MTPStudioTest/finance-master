import { buildPressureTimeline } from './pressure-timeline.js';

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function dateOnly(value) {
  const text = String(value || '');
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return '';
  return new Date(parsed).toISOString().slice(0, 10);
}

function daysUntil(date, today) {
  const target = Date.parse(`${dateOnly(date)}T00:00:00.000Z`);
  const base = Date.parse(`${dateOnly(today)}T00:00:00.000Z`);
  if (!Number.isFinite(target) || !Number.isFinite(base)) return null;
  return Math.floor((target - base) / (24 * 60 * 60 * 1000));
}

function normalizeFrequency(value) {
  const raw = String(value || 'monthly').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  if (raw === 'annual' || raw === 'annually') return 'yearly';
  if (raw === 'every_two_weeks' || raw === 'two_weekly' || raw === 'fortnightly') return 'biweekly';
  if (['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'].includes(raw)) return raw;
  return 'monthly';
}

function monthlyEquivalent(amount, frequency) {
  const value = Math.max(0, Number(amount) || 0);
  const normalized = normalizeFrequency(frequency);
  if (normalized === 'weekly') return round(value * 52 / 12);
  if (normalized === 'biweekly') return round(value * 26 / 12);
  if (normalized === 'quarterly') return round(value / 3);
  if (normalized === 'yearly') return round(value / 12);
  return round(value);
}

function debtPotentialPressure(debt) {
  const custom = Number(debt && debt.customMonthlyPressure);
  if (Number.isFinite(custom) && custom > 0) return round(custom);
  const monthly = Number(debt && (debt.monthlyPressure || debt.minimumPaymentMonthly));
  if (Number.isFinite(monthly) && monthly > 0) return round(monthly);
  return monthlyEquivalent(
    debt && (debt.paymentAmount ?? debt.minimumPayment),
    debt && (debt.paymentFrequency || debt.frequency),
  );
}

function activeIncome(deal) {
  const status = String(deal && (deal.status || deal.stage) || '').toLowerCase();
  return !['paid', 'received', 'settled', 'cancelled', 'lost', 'deleted'].includes(status);
}

function probabilityFor(deal) {
  const explicit = Number(deal && deal.probability);
  if (Number.isFinite(explicit)) return Math.max(0, Math.min(1, explicit));
  const status = String(deal && (deal.status || deal.stage) || 'expected').toLowerCase();
  if (['confirmed', 'invoiced', 'due', 'overdue'].includes(status)) return 0.9;
  if (status === 'proposal') return 0.4;
  if (status === 'lead') return 0.15;
  return 0.6;
}

function routeForSource(source) {
  if (source === 'Plan' || source === 'Money Plan') return 'plan';
  if (source === 'Flow' || source === 'Cash Timeline') return 'flow';
  if (source === 'Radar' || source === 'Risk Radar') return 'radar';
  if (source === 'Review' || source === 'Reality Check') return 'review';
  return 'decisions';
}

function makeCard(input) {
  const severity = input.severity || 'info';
  const source = input.source || 'Decision Lab';
  return {
    id: input.id,
    title: input.title,
    status: input.status || severity,
    urgency: input.urgency || severity,
    severity,
    affectedMetric: input.affectedMetric || '',
    explanation: input.explanation || input.why || '',
    sourceData: input.sourceData || '',
    suggestedAction: input.suggestedAction || 'Review this decision.',
    actionLabel: input.actionLabel || 'Review',
    actionRoute: input.actionRoute || routeForSource(source),
    optionalScenario: Boolean(input.optionalScenario),
    metricImpact: input.metricImpact || '',
    sourceIds: safeArray(input.sourceIds).map(String),
    trigger: input.trigger || input.id,
    why: input.why || input.explanation || '',
    source,
  };
}

function rankSeverity(value) {
  return { critical: 5, high: 4, warning: 3, medium: 2, info: 1, opportunity: 0 }[String(value || '').toLowerCase()] || 0;
}

function addTimelineItem(timeline, item, days) {
  if (days == null || days < 0) return;
  const entry = {
    id: item.id,
    label: item.label,
    date: item.date,
    amount: round(item.amount || 0),
    kind: item.kind,
    sourceId: item.sourceId || item.id,
  };
  if (days <= 7) timeline['7d'].push(entry);
  if (days <= 30) timeline['30d'].push(entry);
  if (days <= 90) timeline['90d'].push(entry);
}

function hasBusinessIncome(readModel) {
  return safeArray(readModel && readModel.pipelineDeals).some((deal) => {
    const scope = String(deal && deal.scope || 'business').toLowerCase();
    return activeIncome(deal) && (scope === 'business' || scope === 'shared');
  }) || safeArray(readModel && readModel.transactions).some((entry) => {
    const scope = String(entry && entry.scope || '').toLowerCase();
    return String(entry && entry.type) === 'income.received' && (scope === 'business' || scope === 'shared');
  });
}

function taxReserveState(readModel) {
  const buckets = safeArray(readModel && readModel.reserveBuckets).filter((bucket) => {
    const text = `${bucket && bucket.name || ''} ${bucket && bucket.purpose || ''} ${bucket && bucket.bucket || ''}`.toLowerCase();
    return bucket && bucket.active !== false && (text.includes('tax') || text.includes('vat'));
  });
  const current = buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket.currentAmount ?? bucket.amount) || 0), 0);
  const target = buckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket.targetAmount) || 0), 0);
  return { buckets, current: round(current), target: round(target), gap: round(Math.max(0, target - current)) };
}

function cardToFocus(card) {
  return {
    id: `focus-${card.id}`,
    title: card.suggestedAction,
    reason: card.why || card.explanation,
    urgency: card.urgency,
    sourceCardId: card.id,
    actionLabel: card.actionLabel,
    actionRoute: card.actionRoute,
  };
}

export function buildDecisionEngine({
  readModel = {},
  snapshot = {},
  treasury = {},
  forecast = {},
  roadmapMetrics = {},
  reviewState = {},
  settings = {},
  nowIso = new Date().toISOString(),
} = {}) {
  const today = dateOnly(nowIso) || new Date().toISOString().slice(0, 10);
  const actualCash = Number((treasury && treasury.actualCash) ?? (snapshot && snapshot.realBalance) ?? 0);
  const availableCash = Number((treasury && treasury.availableCash) ?? (snapshot && snapshot.availableCash) ?? actualCash);
  const safeToSpend = Number((treasury && treasury.safeToSpend) ?? (snapshot && snapshot.safeToSpend) ?? availableCash);
  const monthlyBurn = Math.max(0, Number((treasury && treasury.totalMonthlyBurn) ?? (snapshot && snapshot.monthlyBurn) ?? 0) || 0);
  const runway = Number((treasury && treasury.runwayMonths) ?? (snapshot && snapshot.runwayMonths));
  const obligations30 = Math.max(0, Number((treasury && treasury.confirmedShortTermObligations) ?? (treasury && treasury.committedShortTermObligations) ?? 0) || 0);
  const minimumBuffer = Math.max(0, Number(treasury && treasury.minimumBuffer) || 0);
  const expectedIncome30 = Math.max(0, Number(forecast && forecast.byHorizon && forecast.byHorizon['30'] && forecast.byHorizon['30'].components && forecast.byHorizon['30'].components.expectedIncome) || 0);
  const decisionCards = [];
  const warnings = [];
  const opportunities = [];
  const pressureTimeline = { '7d': [], '30d': [], '90d': [] };
  const riskTolerance = String(settings && settings.riskTolerance || 'balanced');

  const pushWarning = (card) => {
    decisionCards.push(card);
    warnings.push(card);
  };
  const pushOpportunity = (card) => {
    decisionCards.push(card);
    opportunities.push(card);
  };

  if (safeToSpend < 0 || availableCash < 0) {
    pushWarning(makeCard({
      id: 'negative-safe-cash',
      title: 'Near-term cash is overcommitted',
      severity: 'critical',
      affectedMetric: 'Safe-to-Spend',
      explanation: 'Available cash or Safe-to-Spend is below zero after protected cash and confirmed pressure.',
      why: 'The current cash position cannot cover the visible near-term commitments.',
      sourceData: `Safe-to-Spend ${round(safeToSpend)} · Available cash ${round(availableCash)}`,
      suggestedAction: 'Protect liquidity before optional spending.',
      actionLabel: 'Open Money Plan',
      actionRoute: 'plan',
      metricImpact: `${round(Math.min(safeToSpend, availableCash))}`,
      trigger: 'negative-safe-to-spend-or-available-cash',
      source: 'Money Plan',
    }));
  }

  if (Number.isFinite(runway) && runway < 1) {
    pushWarning(makeCard({
      id: 'low-runway-critical',
      title: 'Runway is below one month',
      severity: 'critical',
      affectedMetric: 'Runway',
      explanation: 'Available cash covers less than one month at the current monthly burn.',
      why: 'Runway below one month leaves little room for delayed income or surprise obligations.',
      sourceData: `${round(runway)} months`,
      suggestedAction: 'Reduce burn or collect confirmed revenue this week.',
      actionLabel: 'Open Cash Timeline',
      actionRoute: 'flow',
      metricImpact: `${round(runway)} months`,
      trigger: 'runway-under-one-month',
      source: 'Cash Timeline',
    }));
  }

  if (safeToSpend > 0 && Number.isFinite(runway) && runway < 2) {
    pushWarning(makeCard({
      id: 'safe-spend-runway-mismatch',
      title: 'Safe-to-Spend is positive but runway is weak',
      severity: 'warning',
      affectedMetric: 'Runway',
      explanation: 'The short-term spending number is positive, but the medium-term runway is still thin.',
      why: 'Available cash may cover the next 30 days while recurring pressure still drains the next months.',
      sourceData: `Safe-to-Spend ${round(safeToSpend)} · runway ${round(runway)} months`,
      suggestedAction: 'Favor cash-preserving choices until runway is above two months.',
      actionLabel: 'Open Cash Timeline',
      actionRoute: 'flow',
      metricImpact: `${round(runway)} months`,
      trigger: 'safe-to-spend-positive-runway-under-two',
      source: 'Cash Timeline',
    }));
  }

  if (obligations30 > Math.max(0, safeToSpend)) {
    pushWarning(makeCard({
      id: 'overloaded-month',
      title: 'The next 30 days are overloaded',
      severity: 'high',
      affectedMetric: '30-day obligations',
      explanation: 'Confirmed obligations due soon exceed the current Safe-to-Spend amount.',
      why: 'The month needs a liquidity decision before new optional spending.',
      sourceData: `${round(obligations30)} due · ${round(safeToSpend)} safe`,
      suggestedAction: 'Delay optional spending or pull confirmed income forward.',
      actionLabel: 'Open Reality Check',
      actionRoute: 'review',
      metricImpact: `${round(obligations30 - Math.max(0, safeToSpend))} gap`,
      trigger: 'thirty-day-obligations-exceed-safe-cash',
      source: 'Reality Check',
    }));
  }

  safeArray(readModel && readModel.obligations).forEach((entry) => {
    const dueDate = dateOnly(entry && entry.dueDate);
    const days = daysUntil(dueDate, today);
    addTimelineItem(pressureTimeline, {
      id: `obligation-${entry && entry.id}`,
      label: String(entry && entry.title || 'Obligation'),
      date: dueDate,
      amount: Number(entry && entry.amount) || 0,
      kind: 'Obligation',
      sourceId: entry && entry.id,
    }, days);
  });

  safeArray(readModel && readModel.recurringExpenses).forEach((expense) => {
    const dueDay = Math.max(1, Math.min(28, Number(expense && expense.dueDay) || 1));
    const base = new Date(`${today}T12:00:00.000Z`);
    const due = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), dueDay, 12));
    if (dateOnly(due) < today) due.setUTCMonth(due.getUTCMonth() + 1);
    const dueDate = dateOnly(due);
    addTimelineItem(pressureTimeline, {
      id: `recurring-${expense && expense.id}`,
      label: String(expense && expense.category || 'Recurring cost'),
      date: dueDate,
      amount: Number(expense && expense.monthlyAmount) || Number(expense && expense.amount) || 0,
      kind: 'Recurring cost',
      sourceId: expense && expense.id,
    }, daysUntil(dueDate, today));
  });

  safeArray(readModel && readModel.debtAccounts).forEach((debt) => {
    const outstanding = Number(debt && debt.outstanding) || 0;
    if (outstanding <= 0) return;
    const status = String(debt && debt.planStatus || 'missing');
    const pressure = debtPotentialPressure(debt);
    const startDate = dateOnly(debt && debt.startDate);
    const startDays = daysUntil(startDate, today);
    if (status === 'starts_later' && startDate) {
      addTimelineItem(pressureTimeline, {
        id: `debt-start-${debt && debt.id}`,
        label: `${debt && debt.name || 'Debt plan'} starts`,
        date: startDate,
        amount: pressure,
        kind: 'Debt starts',
        sourceId: debt && debt.id,
      }, startDays);
      if (startDays != null && startDays >= 0 && startDays <= 30) {
        pushWarning(makeCard({
          id: `debt-starts-${debt && debt.id}`,
          title: 'Payment pressure starts soon',
          severity: 'warning',
          affectedMetric: 'Monthly burn',
          explanation: `${debt && debt.name || 'A debt plan'} starts within 30 days and will add visible payment pressure.`,
          why: 'A future-starting debt plan is not current burn yet, but it is close enough to plan around.',
          sourceData: `${startDate} · ${round(pressure)} / month`,
          suggestedAction: 'Review the payment plan before it becomes active.',
          actionLabel: 'Open debt plan',
          actionRoute: 'plan',
          metricImpact: `+${round(pressure)} monthly pressure`,
          sourceIds: [debt && debt.id],
          trigger: 'debt-starts-within-thirty-days',
          source: 'Money Plan',
          optionalScenario: true,
        }));
      }
    }
    if (status === 'on_hold') {
      pushWarning(makeCard({
        id: `debt-on-hold-${debt && debt.id}`,
        title: 'Paused debt is hidden pressure',
        severity: 'info',
        affectedMetric: 'Debt pressure',
        explanation: `${debt && debt.name || 'A debt'} is on hold, so it is excluded from monthly burn today.`,
        why: 'Paused debt is still a liability and should be reviewed before it quietly returns.',
        sourceData: `${round(outstanding)} outstanding · ${round(pressure)} potential monthly pressure`,
        suggestedAction: 'Set a review date or confirm the hold.',
        actionLabel: 'Open debt planner',
        actionRoute: 'plan',
        metricImpact: `${round(pressure)} hidden monthly pressure`,
        sourceIds: [debt && debt.id],
        trigger: 'paused-debt-hidden-pressure',
        source: 'Money Plan',
      }));
    }
    if (status === 'irregular' && pressure <= 0) {
      pushWarning(makeCard({
        id: `debt-irregular-${debt && debt.id}`,
        title: 'Irregular debt pressure needs a monthly estimate',
        severity: 'info',
        affectedMetric: 'Debt pressure',
        explanation: `${debt && debt.name || 'A debt'} is irregular without custom monthly pressure.`,
        why: 'The liability is visible, but its monthly pressure cannot influence decisions until estimated.',
        sourceData: `${round(outstanding)} outstanding`,
        suggestedAction: 'Add a custom monthly pressure estimate.',
        actionLabel: 'Open debt planner',
        actionRoute: 'plan',
        metricImpact: 'Hidden pressure',
        sourceIds: [debt && debt.id],
        trigger: 'irregular-debt-without-pressure',
        source: 'Money Plan',
      }));
    }
    if (status === 'missing') {
      pushWarning(makeCard({
        id: `debt-missing-plan-${debt && debt.id}`,
        title: 'Debt exists without a payment plan',
        severity: 'warning',
        affectedMetric: 'Monthly burn',
        explanation: `${debt && debt.name || 'A debt'} has outstanding balance without normalized payment behavior.`,
        why: 'Long-term pressure is hidden until the debt has a payment plan.',
        sourceData: `${round(outstanding)} outstanding`,
        suggestedAction: 'Add a payment plan so burn and runway stay accurate.',
        actionLabel: 'Add payment plan',
        actionRoute: 'plan',
        metricImpact: 'Unknown monthly pressure',
        sourceIds: [debt && debt.id],
        trigger: 'missing-debt-payment-plan',
        source: 'Money Plan',
      }));
    }
  });

  const taxReserve = taxReserveState(readModel);
  if (hasBusinessIncome(readModel) && (!taxReserve.buckets.length || taxReserve.gap > 0 || (taxReserve.target > 0 && taxReserve.current / taxReserve.target < 0.5))) {
    pushWarning(makeCard({
      id: 'tax-reserve-underfunded',
      title: 'Tax reserve may be underfunded',
      severity: taxReserve.buckets.length ? 'warning' : 'info',
      affectedMetric: 'Protected cash',
      explanation: taxReserve.buckets.length ? 'A tax or VAT reserve exists but is below target.' : 'Business income is visible but no tax or VAT reserve target is active.',
      why: 'Unreserved tax money can make cash look safer than it is.',
      sourceData: `${round(taxReserve.current)} protected · ${round(taxReserve.target)} target`,
      suggestedAction: 'Allocate part of incoming business revenue to tax/VAT reserve.',
      actionLabel: 'Open Money Plan',
      actionRoute: 'plan',
      metricImpact: `${round(taxReserve.gap)} reserve gap`,
      trigger: 'business-income-with-tax-reserve-gap',
      source: 'Money Plan',
    }));
  }

  if (actualCash > 0 && monthlyBurn > 0 && expectedIncome30 > 0 && monthlyBurn > expectedIncome30) {
    pushWarning(makeCard({
      id: 'positive-cash-negative-structure',
      title: 'Cash looks healthy but structure is weak',
      severity: 'warning',
      affectedMetric: 'Monthly burn',
      explanation: 'Total cash is positive, but monthly burn is higher than expected 30-day income.',
      why: 'The current balance may hide a weak operating structure.',
      sourceData: `${round(monthlyBurn)} burn · ${round(expectedIncome30)} expected income`,
      suggestedAction: 'Review recurring burn and near-term revenue coverage.',
      actionLabel: 'Open Risk Radar',
      actionRoute: 'radar',
      metricImpact: `${round(monthlyBurn - expectedIncome30)} monthly structure gap`,
      trigger: 'positive-cash-high-burn-relative-revenue',
      source: 'Risk Radar',
    }));
  }

  safeArray(readModel && readModel.pipelineDeals).filter(activeIncome).forEach((deal) => {
    const value = Math.max(0, Number(deal && (deal.value ?? deal.amount)) || 0);
    if (value <= 0) return;
    const probability = probabilityFor(deal);
    const expectedValue = round(value * probability);
    const runwayImpact = monthlyBurn > 0 ? round(expectedValue / monthlyBurn) : null;
    const expectedDate = dateOnly(deal && deal.expectedDateISO);
    const dueDays = daysUntil(expectedDate, today);
    if (expectedDate) {
      addTimelineItem(pressureTimeline, {
        id: `income-${deal && deal.id}`,
        label: String(deal && (deal.title || deal.client || deal.name) || 'Expected income'),
        date: expectedDate,
        amount: expectedValue,
        kind: 'Expected income',
        sourceId: deal && deal.id,
      }, dueDays);
    }
    const solvesPressure = safeToSpend < 0 || (Number.isFinite(runway) && runway < 3) || obligations30 > Math.max(0, safeToSpend);
    if (runwayImpact != null && (runwayImpact >= 0.5 || solvesPressure)) {
      pushOpportunity(makeCard({
        id: `opportunity-${deal && deal.id}`,
        title: `${deal && (deal.title || deal.client || deal.name) || 'Opportunity'} could extend runway`,
        severity: 'opportunity',
        affectedMetric: 'Runway',
        explanation: `Expected value could add about ${runwayImpact.toFixed(1)} months of runway at current burn.`,
        why: solvesPressure ? 'This opportunity helps the current pressure point.' : 'The opportunity meaningfully improves the runway picture.',
        sourceData: `${round(expectedValue)} expected value · ${Math.round(probability * 100)}% confidence`,
        suggestedAction: 'Follow up while it can still affect the forecast.',
        actionLabel: 'Open Cash Timeline',
        actionRoute: 'flow',
        metricImpact: `+${runwayImpact.toFixed(1)} months runway`,
        sourceIds: [deal && deal.id],
        trigger: 'opportunity-runway-impact',
        source: 'Cash Timeline',
        optionalScenario: true,
      }));
    }
  });

  const hasRecentReview = Date.parse(String(reviewState && reviewState.lastReviewedAt || ''));
  if (!Number.isFinite(hasRecentReview)) {
    pushWarning(makeCard({
      id: 'weekly-review-due',
      title: 'Weekly money check is due',
      severity: 'info',
      affectedMetric: 'Data quality',
      explanation: 'No recent checkpoint is saved for the current operating picture.',
      why: 'Manual finance data stays trustworthy when cash accounts and assumptions are reviewed.',
      sourceData: 'No saved checkpoint',
      suggestedAction: 'Run the weekly review and choose this week’s focus.',
      actionLabel: 'Open Reality Check',
      actionRoute: 'review',
      metricImpact: 'Improves confidence',
      trigger: 'weekly-review-not-current',
      source: 'Reality Check',
    }));
  }

  decisionCards.sort((left, right) => rankSeverity(right.severity) - rankSeverity(left.severity));
  const weeklyFocus = decisionCards
    .filter((card) => card.severity !== 'opportunity')
    .slice(0, 3)
    .map(cardToFocus);

  let status = {
    key: 'stable',
    label: 'Stable',
    severity: 'info',
    explanation: 'No major decision pressure is visible in the current local data.',
    primaryMetric: Number.isFinite(runway) ? `${round(runway)} months runway` : `${round(safeToSpend)} Safe-to-Spend`,
    riskTolerance,
  };
  const top = decisionCards[0];
  if (top) {
    if (top.id === 'negative-safe-cash') status = { key: 'critical', label: 'Critical', severity: 'critical', explanation: top.why, primaryMetric: top.sourceData, riskTolerance };
    else if (top.id === 'low-runway-critical') status = { key: 'critical-runway', label: 'Critical', severity: 'critical', explanation: top.why, primaryMetric: top.sourceData, riskTolerance };
    else if (top.id === 'safe-spend-runway-mismatch') status = { key: 'fragile', label: 'Fragile', severity: 'warning', explanation: top.why, primaryMetric: top.sourceData, riskTolerance };
    else if (top.id === 'overloaded-month') status = { key: 'tight', label: 'Tight but manageable', severity: 'high', explanation: top.why, primaryMetric: top.sourceData, riskTolerance };
    else if (top.severity === 'opportunity') status = { key: 'opportunity-window', label: 'Opportunity window', severity: 'opportunity', explanation: top.why, primaryMetric: top.metricImpact, riskTolerance };
    else status = { key: 'watchful', label: 'Needs attention', severity: top.severity, explanation: top.why, primaryMetric: top.sourceData, riskTolerance };
  }

  const scenarioShortcuts = [
    { id: 'late-payment', label: 'What if I get paid late?', route: 'flow', mode: 'display_only' },
    { id: 'pause-debt', label: 'What if I pause this debt?', route: 'plan', mode: 'display_only' },
    { id: 'book-project', label: 'What if I book one €3,000 project?', route: 'flow', mode: 'display_only' },
    { id: 'tax-reserve', label: 'What if I reserve 30% for tax?', route: 'plan', mode: 'display_only' },
    { id: 'reduce-burn', label: 'What if I reduce burn by €300/month?', route: 'radar', mode: 'display_only' },
  ];
  const sharedPressureTimeline = buildPressureTimeline({
    readModel,
    treasury,
    decisionEngine: { weeklyFocus, decisionCards },
    nowIso,
  });

  return {
    generatedAt: nowIso,
    status,
    weeklyFocus,
    decisionCards: decisionCards.slice(0, 12),
    warnings: warnings.sort((left, right) => rankSeverity(right.severity) - rankSeverity(left.severity)).slice(0, 8),
    opportunities: opportunities.slice(0, 6),
    pressureTimeline: sharedPressureTimeline || pressureTimeline,
    scenarioShortcuts,
  };
}
