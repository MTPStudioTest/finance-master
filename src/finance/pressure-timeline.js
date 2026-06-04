function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function round(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function dateOnly(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value || '');
  if (!Number.isFinite(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function daysUntil(today, value) {
  const only = dateOnly(value);
  if (!only) return null;
  const target = new Date(`${only}T12:00:00.000Z`);
  const base = new Date(`${dateOnly(today)}T12:00:00.000Z`);
  if (!Number.isFinite(target.getTime()) || !Number.isFinite(base.getTime())) return null;
  return Math.floor((target.getTime() - base.getTime()) / 86400000);
}

function pushItem(timeline, item, now) {
  const days = daysUntil(now, item.date);
  if (days == null || days < 0 || days > 90) return;
  const entry = { ...item, date: dateOnly(item.date), daysUntil: days, amount: round(item.amount) };
  if (days <= 7) timeline['7d'].push(entry);
  if (days <= 30) timeline['30d'].push(entry);
  timeline['90d'].push(entry);
}

function recurringDate(expense, now) {
  const today = new Date(`${dateOnly(now)}T12:00:00.000Z`);
  const dueDay = Math.max(1, Math.min(28, Number(expense && expense.dueDay) || today.getUTCDate()));
  for (let offset = 0; offset < 4; offset += 1) {
    const candidate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + offset, dueDay, 12));
    if (candidate >= today) return dateOnly(candidate);
  }
  return dateOnly(today);
}

function debtDate(debt, now) {
  const status = String(debt && debt.planStatus || '');
  if (status === 'starts_later' && debt.startDate) return dateOnly(debt.startDate);
  if (debt.dueDate) return dateOnly(debt.dueDate);
  return recurringDate({ dueDay: 1 }, now);
}

function debtAmount(debt) {
  const current = Number(debt && debt.monthlyPressure);
  if (Number.isFinite(current) && current > 0) return current;
  const payment = Number(debt && (debt.paymentAmount ?? debt.minimumPayment));
  return Number.isFinite(payment) ? Math.max(0, payment) : 0;
}

function incomeDate(income) {
  return dateOnly(income && (income.expectedDateISO || income.expectedDate || income.dueDate));
}

function incomeAmount(income) {
  const value = Number(income && (income.value ?? income.amount));
  const probability = Number(income && income.probability);
  const multiplier = Number.isFinite(probability) ? Math.max(0, Math.min(1, probability)) : 1;
  return round((Number.isFinite(value) ? value : 0) * multiplier);
}

function sortWindow(items) {
  const seen = new Set();
  return safeArray(items).filter((item) => {
    const key = `${item.sourceType || ''}:${item.sourceId || item.id || ''}:${item.date || ''}:${item.amount || 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
    return Math.abs(Number(b.amount) || 0) - Math.abs(Number(a.amount) || 0);
  });
}

export function buildPressureTimeline({
  readModel = {},
  treasury = {},
  decisionEngine = null,
  nowIso = new Date().toISOString(),
} = {}) {
  const now = dateOnly(nowIso) || dateOnly(new Date());
  const timeline = { '7d': [], '30d': [], '90d': [] };

  safeArray(readModel.recurringExpenses).forEach((expense) => {
    if (expense && expense.active === false) return;
    pushItem(timeline, {
      id: String(expense.id || `expense-${expense.category || ''}`),
      sourceId: String(expense.id || ''),
      sourceType: 'recurring_cost',
      kind: 'Recurring cost',
      label: String(expense.category || 'Recurring cost'),
      date: recurringDate(expense, now),
      amount: -Math.abs(Number(expense.monthlyAmount) || 0),
      route: 'plan',
    }, now);
  });

  safeArray(readModel.debtAccounts).forEach((debt) => {
    if (!debt || debt.active === false) return;
    const status = String(debt.planStatus || '');
    if (status === 'archived' || status === 'completed') return;
    const amount = debtAmount(debt);
    if (status === 'missing' && amount <= 0) {
      pushItem(timeline, {
        id: String(debt.id || `debt-${debt.name || ''}`),
        sourceId: String(debt.id || ''),
        sourceType: 'debt_plan',
        kind: 'Debt plan review',
        label: String(debt.name || 'Debt plan'),
        date: now,
        amount: 0,
        route: 'plan',
      }, now);
      return;
    }
    if (amount <= 0 && status !== 'starts_later') return;
    pushItem(timeline, {
      id: String(debt.id || `debt-${debt.name || ''}`),
      sourceId: String(debt.id || ''),
      sourceType: 'debt_plan',
      kind: status === 'starts_later' ? 'Debt starts' : 'Debt plan',
      label: String(debt.name || 'Debt plan'),
      date: debtDate(debt, now),
      amount: -Math.abs(amount),
      route: 'plan',
    }, now);
  });

  safeArray(readModel.pipelineDeals).forEach((income) => {
    const status = String(income && income.status || '').toLowerCase();
    if (['paid', 'cancelled', 'lost'].includes(status)) return;
    const date = incomeDate(income);
    if (!date) return;
    const amount = incomeAmount(income);
    if (amount <= 0) return;
    pushItem(timeline, {
      id: String(income.id || `income-${income.title || ''}`),
      sourceId: String(income.id || ''),
      sourceType: 'income',
      kind: 'Expected income',
      label: String(income.title || income.client || 'Expected income'),
      date,
      amount,
      route: 'flow',
    }, now);
  });

  safeArray(treasury.obligations).forEach((obligation) => {
    const status = String(obligation && obligation.status || '').toLowerCase();
    if (status === 'paid') return;
    const date = dateOnly(obligation && obligation.dueDate);
    if (!date) return;
    const type = String(obligation && obligation.type || '').toLowerCase();
    pushItem(timeline, {
      id: String(obligation.id || `obligation-${obligation.title || ''}`),
      sourceId: String(obligation.sourceId || obligation.id || ''),
      sourceType: type === 'recurring_cost' ? 'recurring_cost' : (type === 'debt' ? 'debt_plan' : 'obligation'),
      kind: type === 'recurring_cost' ? 'Recurring cost' : (type === 'debt' ? 'Debt plan' : 'Obligation'),
      label: String(obligation.title || 'Obligation'),
      date,
      amount: -Math.abs(Number(obligation.amount) || 0),
      route: 'review',
    }, now);
  });

  safeArray(readModel.reserveBuckets).forEach((bucket) => {
    if (!bucket || bucket.active === false) return;
    const target = Number(bucket.targetAmount) || 0;
    const current = Number(bucket.currentAmount) || 0;
    const gap = Math.max(0, target - current);
    if (gap <= 0) return;
    pushItem(timeline, {
      id: String(bucket.id || `reserve-${bucket.name || ''}`),
      sourceId: String(bucket.id || ''),
      sourceType: 'reserve',
      kind: 'Reserve gap',
      label: String(bucket.name || 'Reserve bucket'),
      date: dateOnly(addDays(new Date(`${now}T12:00:00.000Z`), 30)),
      amount: -round(gap),
      route: 'plan',
    }, now);
  });

  const focusByCard = new Map(safeArray(decisionEngine && decisionEngine.weeklyFocus)
    .map((focus) => [String(focus.sourceCardId || ''), focus]));
  safeArray(decisionEngine && decisionEngine.decisionCards).forEach((card) => {
    const focus = focusByCard.get(String(card.id || ''));
    if (!focus) return;
    Object.keys(timeline).forEach((key) => {
      timeline[key].forEach((item) => {
        if (!item.focusId && String(item.sourceId || '') && String(card.relatedId || '') === String(item.sourceId)) {
          item.focusId = focus.id;
          item.focusLabel = focus.title;
        }
      });
    });
  });

  timeline['7d'] = sortWindow(timeline['7d']);
  timeline['30d'] = sortWindow(timeline['30d']);
  timeline['90d'] = sortWindow(timeline['90d']);
  return timeline;
}
