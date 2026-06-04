const SCOPES = ['personal', 'business', 'shared'];
const REVIEW_HISTORY_LIMIT = 24;

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function financeScope(value, fallback = 'shared') {
  return SCOPES.includes(value) ? value : fallback;
}

function visibleForScope(itemScope, filter) {
  return filter === 'all' || itemScope === filter || itemScope === 'shared';
}

export function normalizeReviewState(input) {
  const source = isObject(input) ? input : {};
  const rawReconciliations = isObject(source.accountReconciliations) ? source.accountReconciliations : {};
  const accountReconciliations = {};
  Object.entries(rawReconciliations).forEach(([id, value]) => {
    if (!isObject(value) || !String(value.accountId || id).trim()) return;
    const balance = Number(value.balance);
    const reviewedAt = String(value.reviewedAt || '');
    if (!Number.isFinite(balance) || !Number.isFinite(Date.parse(reviewedAt))) return;
    accountReconciliations[id] = { accountId: String(value.accountId || id), balance, reviewedAt };
  });
  const checklist = isObject(source.checklist) ? source.checklist : {};
  const lastReviewedAt = source.lastReviewedAt === null || Number.isFinite(Date.parse(String(source.lastReviewedAt || '')))
    ? source.lastReviewedAt || null
    : null;
  const normalizedChecklist = {
    unresolvedItems: checklist.unresolvedItems === true || checklist.recurringCosts === true,
    matchPayments: checklist.matchPayments === true,
    confirmObligations: checklist.confirmObligations === true || checklist.pipeline === true,
    reviewSignals: checklist.reviewSignals === true || checklist.signals === true,
    closeMonth: checklist.closeMonth === true,
  };
  const history = Array.isArray(source.history) ? source.history.flatMap((entry) => {
    if (!isObject(entry) || !String(entry.monthKey || '').match(/^\d{4}-\d{2}$/) || !Number.isFinite(Date.parse(String(entry.closedAt || '')))) return [];
    const summary = isObject(entry.summary) ? entry.summary : {};
    const historyReconciliations = isObject(entry.accountReconciliations) ? entry.accountReconciliations : {};
    const closedAt = String(entry.closedAt);
    const normalizedEntry = {
      id: String(entry.id || `${entry.monthKey}-${closedAt}`),
      monthKey: String(entry.monthKey),
      closedAt,
      notes: typeof entry.notes === 'string' ? entry.notes : '',
      accountReconciliations: Object.fromEntries(Object.entries(historyReconciliations).flatMap(([id, value]) => {
        if (!isObject(value) || !String(value.accountId || id).trim()) return [];
        const balance = Number(value.balance);
        const reviewedAt = String(value.reviewedAt || closedAt);
        if (!Number.isFinite(balance) || !Number.isFinite(Date.parse(reviewedAt))) return [];
        return [[id, { accountId: String(value.accountId || id), balance, reviewedAt }]];
      })),
      checklist: {
        unresolvedItems: isObject(entry.checklist) && entry.checklist.unresolvedItems === true,
        matchPayments: isObject(entry.checklist) && entry.checklist.matchPayments === true,
        confirmObligations: isObject(entry.checklist) && entry.checklist.confirmObligations === true,
        reviewSignals: isObject(entry.checklist) && entry.checklist.reviewSignals === true,
        closeMonth: isObject(entry.checklist) && entry.checklist.closeMonth === true,
      },
      summary: {
        monthKey: String(summary.monthKey || entry.monthKey),
        netMovement: Number(summary.netMovement) || 0,
        incomeReceived: Number(summary.incomeReceived) || 0,
        expensesPaid: Number(summary.expensesPaid) || 0,
        obligationsReviewed: Number(summary.obligationsReviewed) || 0,
        reserveMovements: Number(summary.reserveMovements) || 0,
        runwayNow: Number.isFinite(Number(summary.runwayNow)) ? Number(summary.runwayNow) : null,
        unresolvedItems: Number(summary.unresolvedItems) || 0,
        protectedCash: Number(summary.protectedCash) || 0,
        monthlyBurn: Number(summary.monthlyBurn) || 0,
        forecastHorizonDays: Number.isFinite(Number(summary.forecastHorizonDays)) ? Number(summary.forecastHorizonDays) : undefined,
        forecastExpectedCash: Number.isFinite(Number(summary.forecastExpectedCash)) ? Number(summary.forecastExpectedCash) : null,
        forecastLowestCash: Number.isFinite(Number(summary.forecastLowestCash)) ? Number(summary.forecastLowestCash) : null,
        forecastWarning: typeof summary.forecastWarning === 'string' ? summary.forecastWarning : '',
        mainRisk: typeof summary.mainRisk === 'string' ? summary.mainRisk : 'No major close risk detected.',
        mainAction: typeof summary.mainAction === 'string' ? summary.mainAction : 'Keep next month reviewed on the same cadence.',
      },
    };
    if (isObject(entry.chosenFocus) && String(entry.chosenFocus.id || '').trim()) {
      normalizedEntry.chosenFocus = { id: String(entry.chosenFocus.id), title: String(entry.chosenFocus.title || 'Weekly focus') };
    }
    return [normalizedEntry];
  }).slice(0, REVIEW_HISTORY_LIMIT) : [];
  const normalized = {
    lastReviewedAt,
    accountReconciliations,
    checklist: normalizedChecklist,
    notes: typeof source.notes === 'string' ? source.notes : '',
    history,
  };
  if (isObject(source.chosenFocus) && String(source.chosenFocus.id || '').trim()) {
    normalized.chosenFocus = { id: String(source.chosenFocus.id), title: String(source.chosenFocus.title || 'Weekly focus') };
  }
  return normalized;
}

export function normalizeGoalState(input) {
  const source = isObject(input) && Array.isArray(input.goals) ? input.goals : [];
  return {
    goals: source.flatMap((goal) => {
      if (!isObject(goal) || !String(goal.id || '').trim() || !String(goal.name || '').trim()) return [];
      const targetAmount = Number(goal.targetAmount);
      if (!Number.isFinite(targetAmount) || targetAmount <= 0) return [];
      const createdAt = Number.isFinite(Date.parse(String(goal.createdAt || ''))) ? String(goal.createdAt) : new Date().toISOString();
      const updatedAt = Number.isFinite(Date.parse(String(goal.updatedAt || ''))) ? String(goal.updatedAt) : createdAt;
      return [{
        id: String(goal.id),
        name: String(goal.name),
        type: goal.type === 'savings' ? 'savings' : 'buffer',
        targetAmount,
        targetDate: /^\d{4}-\d{2}-\d{2}$/.test(String(goal.targetDate || '')) ? String(goal.targetDate) : undefined,
        scope: financeScope(goal.scope),
        linkedAccountIds: Array.isArray(goal.linkedAccountIds) ? goal.linkedAccountIds.map(String).filter(Boolean) : [],
        createdAt,
        updatedAt,
      }];
    }),
  };
}

export function calculateGoalProgress(goalState, accounts, filter = 'all') {
  const accountById = new Map((Array.isArray(accounts) ? accounts : []).map((account) => [String(account.id), account]));
  return normalizeGoalState(goalState).goals
    .filter((goal) => visibleForScope(goal.scope, filter))
    .map((goal) => {
      const currentAmount = goal.linkedAccountIds.reduce((sum, accountId) => {
        const account = accountById.get(accountId);
        return sum + Math.max(0, Number(account && account.balance) || 0);
      }, 0);
      return {
        ...goal,
        currentAmount,
        progressPercent: Math.min(100, Math.max(0, (currentAmount / goal.targetAmount) * 100)),
      };
    });
}

export function isWeeklyReviewDue(lastReviewedAt, nowIso = new Date().toISOString()) {
  const reviewed = Date.parse(String(lastReviewedAt || ''));
  const now = Date.parse(String(nowIso || ''));
  if (!Number.isFinite(reviewed)) return true;
  if (!Number.isFinite(now)) return false;
  return now - reviewed >= 7 * 24 * 60 * 60 * 1000;
}
