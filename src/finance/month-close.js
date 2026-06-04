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

function monthKey(value) {
  return (dateOnly(value) || new Date().toISOString().slice(0, 10)).slice(0, 7);
}

function signedAmount(entry) {
  if (Number.isFinite(Number(entry && entry.signedAmount))) return Number(entry.signedAmount);
  const amount = Math.abs(Number(entry && entry.amount) || 0);
  const direction = String(entry && entry.direction || '').toLowerCase();
  const type = String(entry && (entry.ledgerType || entry.type) || '').toLowerCase();
  if (direction === 'out' || type.includes('expense') || type.includes('payment')) return -amount;
  return amount;
}

function reserveMovementLabel(entry, accounts = []) {
  if (String(entry && entry.linkedReserveId || '').trim()) return String(entry.linkedReserveId);
  const type = String(entry && (entry.ledgerType || entry.type) || '').toLowerCase();
  if (type !== 'transfer') return '';
  const byId = new Map(safeArray(accounts).map((account) => [String(account && account.id || ''), account]));
  const ids = [
    String(entry && (entry.fromAccountId || entry.accountId) || ''),
    String(entry && (entry.toAccountId || entry.destinationAccountId) || ''),
  ].filter(Boolean);
  return ids.some((id) => {
    const account = byId.get(id);
    return Boolean(account && (account.reserved === true || String(account.bucket || 'available') !== 'available'));
  }) ? ids.join(' -> ') : '';
}

function classifyRisk({ unresolvedItems, runwayNow, monthlyBurn, protectedCash, forecastWarning }) {
  if (unresolvedItems > 0) return 'Open items need review before the checkpoint is fully reliable.';
  if (forecastWarning) return forecastWarning;
  if (runwayNow != null && runwayNow < 3) return 'Runway is below three months.';
  if (monthlyBurn > 0 && protectedCash <= 0) return 'No protected cash is recorded for upcoming reserves.';
  return 'No major checkpoint risk detected.';
}

function classifyAction({ unresolvedItems, runwayNow, protectedCash, forecastWarning }) {
  if (unresolvedItems > 0) return 'Resolve open items in Logbook.';
  if (forecastWarning) return 'Review the forecast before saving the next checkpoint.';
  if (runwayNow != null && runwayNow < 3) return 'Review burn pressure and upcoming income.';
  if (protectedCash <= 0) return 'Review reserve targets in Plan.';
  return 'Keep next month reviewed on the same cadence.';
}

export function buildMonthCloseSummary({
  readModel = {},
  snapshot = {},
  treasury = {},
  reviewQueue = [],
  forecast = null,
  nowIso = new Date().toISOString(),
} = {}) {
  const activeMonth = monthKey(nowIso);
  const accounts = safeArray(readModel.fiatAccounts);
  const monthTransactions = safeArray(readModel.transactions).filter((entry) => monthKey(entry && entry.timestamp) === activeMonth);
  const incomeReceived = monthTransactions
    .filter((entry) => String(entry && (entry.ledgerType || entry.type)) === 'income.received')
    .reduce((sum, entry) => sum + Math.abs(signedAmount(entry)), 0);
  const expensesPaid = monthTransactions
    .filter((entry) => String(entry && (entry.ledgerType || entry.type)) === 'expense.recorded' && String(entry && entry.categoryId || '').toLowerCase() !== 'transfer')
    .reduce((sum, entry) => sum + Math.abs(signedAmount(entry)), 0);
  const netMovement = monthTransactions.reduce((sum, entry) => sum + signedAmount(entry), 0);
  const obligationsReviewed = monthTransactions.filter((entry) => String(entry && entry.obligationId || '').trim()).length;
  const reserveMovements = monthTransactions.filter((entry) => reserveMovementLabel(entry, accounts)).length;
  const unresolvedItems = safeArray(reviewQueue).length;
  const runwayRaw = Number(snapshot.runwayMonths ?? treasury.runwayMonths);
  const runwayNow = Number.isFinite(runwayRaw) ? round(runwayRaw) : null;
  const protectedCash = round(Number(treasury.protectedCash ?? snapshot.protectedCash ?? 0));
  const monthlyBurn = round(Number(treasury.totalMonthlyBurn ?? snapshot.monthlyBurn ?? 0));
  const forecast30 = forecast && forecast.byHorizon ? (forecast.byHorizon['30'] || null) : null;
  const forecastHorizon = forecast30 || (forecast && Array.isArray(forecast.horizons) ? forecast.horizons[0] : null);
  const forecastWarning = String(forecast && Array.isArray(forecast.warnings) && forecast.warnings[0] || '');
  const forecastHorizonDays = forecastHorizon ? Number(forecastHorizon.days) : undefined;
  const forecastExpectedCash = forecastHorizon ? round(Number(forecastHorizon.expected)) : null;
  const forecastLowestCash = forecast && Number.isFinite(Number(forecast.lowestExpected)) ? round(Number(forecast.lowestExpected)) : null;
  const basis = { unresolvedItems, runwayNow, monthlyBurn, protectedCash, forecastWarning };
  return {
    monthKey: activeMonth,
    netMovement: round(netMovement),
    incomeReceived: round(incomeReceived),
    expensesPaid: round(expensesPaid),
    obligationsReviewed,
    reserveMovements,
    runwayNow,
    unresolvedItems,
    protectedCash,
    monthlyBurn,
    forecastHorizonDays,
    forecastExpectedCash,
    forecastLowestCash,
    forecastWarning,
    mainRisk: classifyRisk(basis),
    mainAction: classifyAction(basis),
  };
}
