const SCOPES = ['personal', 'business', 'shared'];

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
  return {
    lastReviewedAt,
    accountReconciliations,
    checklist: {
      recurringCosts: checklist.recurringCosts === true,
      pipeline: checklist.pipeline === true,
      signals: checklist.signals === true,
    },
    notes: typeof source.notes === 'string' ? source.notes : '',
  };
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
