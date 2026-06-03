import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { decodeLegacyValue, selectRepositoryValue } from '../src/persistence/legacy-migration.js';
import { formatCurrencyAmount, resolveCurrencyCode } from '../src/finance/formatting.js';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCES = [
  'src/finance/date-utils.js',
  'src/finance/events.js',
  'src/finance/ledger.js',
  'src/finance/invariants.js',
  'src/finance/confidence.js',
  'src/finance/compute.js',
];

function loadFinance() {
  const context = vm.createContext({
    console,
    Date,
    Intl,
    Map,
    Math,
    Number,
    Object,
    Set,
    String,
  });
  for (const source of SOURCES) {
    vm.runInContext(readFileSync(resolve(ROOT, source), 'utf8'), context, { filename: source });
  }
  return context;
}

function loadFinancialEngine() {
  const context = vm.createContext({
    console,
    Date,
    Intl,
    Math,
    Number,
    Object,
    String,
  });
  context.window = context;
  vm.runInContext(readFileSync(resolve(ROOT, 'src/dashboard/financial-engine.js'), 'utf8'), context, {
    filename: 'src/dashboard/financial-engine.js',
  });
  return context.FinancialEngine;
}

function append(context, drafts, nowIso = '2026-06-02T10:00:00.000Z') {
  return context.FinanceLedger.appendEvents([], drafts, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  }, { nowIso }).events;
}

test('empty ledger produces a trustworthy empty-state snapshot', () => {
  const finance = loadFinance();
  const result = finance.FinanceCompute.computeFinancialContext([], {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso: '2026-06-02T10:00:00.000Z',
  });

  assert.equal(result.snapshot.realBalance, 0);
  assert.equal(result.snapshot.monthlyBurn, null);
  assert.equal(result.snapshot.runwayMonths, null);
  assert.equal(result.invariants.ok, true);
  assert.deepEqual(
    Array.from(result.snapshot.missingInputs),
    ['recurring expenses', 'recent financial activity', 'monthly burn', 'pipeline', 'compute freshness'],
  );
});

test('read model preserves account, scope, category, and recurring schedule metadata', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 1200, scope: 'business' },
    },
    {
      id: 'txn-rent',
      type: 'expense.recorded',
      amount: 45,
      currency: 'EUR',
      timestamp: nowIso,
      metadata: {
        description: 'Workspace',
        accountId: 'cash-main',
        accountName: 'Operating',
        categoryId: 'studio',
        scope: 'business',
        source: 'manual',
      },
    },
    {
      id: 'rent-recurring',
      type: 'expense.recurring_set',
      amount: 300,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent-recurring',
      metadata: { category: 'Studio rent', monthlyAmount: 300, dueDay: 31, frequency: 'monthly', scope: 'business' },
    },
  ], nowIso);
  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.fiatAccounts[0].scope, 'business');
  assert.equal(result.readModel.transactions[0].accountId, 'cash-main');
  assert.equal(result.readModel.transactions[0].categoryId, 'studio');
  assert.equal(result.readModel.recurringExpenses[0].dueDay, 28);
  assert.equal(result.readModel.recurringExpenses[0].frequency, 'monthly');
  assert.equal(result.snapshot.realBalance, 1200);
  assert.equal(result.snapshot.monthlyBurn, 300);
  assert.equal(result.snapshot.runwayMonths, 4);
});

test('treasury model separates reserved cash from truly available cash', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-available',
      type: 'asset.account_set',
      amount: 5000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-available',
      metadata: { name: 'Operating cash', balance: 5000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'cash-tax',
      type: 'asset.account_set',
      amount: 1800,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-tax',
      metadata: { name: 'Tax reserve', balance: 1800, scope: 'business', bucket: 'tax_reserve', reserved: true },
    },
    {
      id: 'rent-recurring',
      type: 'expense.recurring_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent-recurring',
      metadata: { category: 'Studio rent', monthlyAmount: 1000, dueDay: 8, frequency: 'monthly', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.treasury.totalCash, 6800);
  assert.equal(result.treasury.reservedCash, 1800);
  assert.equal(result.treasury.trulyAvailableCash, 5000);
  assert.equal(result.treasury.totalMonthlyBurn, 1000);
  assert.equal(result.treasury.runwayMonths, 5);
  assert.equal(result.snapshot.realBalance, 6800);
  assert.equal(result.snapshot.trulyAvailableCash, 5000);
});

test('treasury model classifies income scenarios and review items', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 4000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 4000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'cost-overdue',
      type: 'expense.recurring_set',
      amount: 500,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cost-overdue',
      metadata: { category: 'Workspace', monthlyAmount: 500, dueDay: 1, frequency: 'monthly', scope: 'business' },
    },
    {
      id: 'income-confirmed',
      type: 'pipeline.created',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-confirmed',
      metadata: { title: 'Signed project', value: 1200, probability: 0.9, status: 'confirmed', expectedDateISO: '2026-06-20', scope: 'business' },
    },
    {
      id: 'income-expected',
      type: 'pipeline.created',
      amount: 800,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-expected',
      metadata: { title: 'Likely advisory', value: 800, probability: 0.65, status: 'expected', expectedDateISO: '2026-06-22', scope: 'business' },
    },
    {
      id: 'income-risky',
      type: 'pipeline.created',
      amount: 2000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-risky',
      metadata: { title: 'Unclear collaboration', value: 2000, probability: 0.35, status: 'risky', expectedDateISO: '2026-06-24', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.treasury.incomeThisMonth.confirmed, 1200);
  assert.equal(result.treasury.incomeThisMonth.expected, 800);
  assert.equal(result.treasury.incomeThisMonth.risky, 2000);
  assert.equal(result.treasury.incomeScenarios.conservative, 3700);
  assert.equal(result.treasury.incomeScenarios.expected, 4500);
  assert.equal(result.treasury.incomeScenarios.optimistic, 6500);
  assert.equal(result.treasury.overdueObligations[0].title, 'Workspace');
  assert.equal(result.treasury.reviewQueue.some((item) => item.reason === 'Risky income assumption'), true);
});

test('treasury scenarios only include income inside the forecast horizon', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 1000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'income-inside',
      type: 'pipeline.created',
      amount: 500,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-inside',
      metadata: { title: 'June project', value: 500, probability: 0.9, status: 'confirmed', expectedDateISO: '2026-06-20', scope: 'business' },
    },
    {
      id: 'income-outside',
      type: 'pipeline.created',
      amount: 10000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-outside',
      metadata: { title: 'Late-year project', value: 10000, probability: 0.8, status: 'expected', expectedDateISO: '2026-10-20', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.treasury.incomeScenarios.conservative, 1500);
  assert.equal(result.treasury.incomeScenarios.expected, 1500);
  assert.equal(result.treasury.incomeScenarios.optimistic, 1500);
});

test('date utilities preserve date-only values and recurring due dates exactly', () => {
  const finance = loadFinance();
  assert.equal(finance.FinanceDates.toDateOnly('2026-06-05'), '2026-06-05');
  assert.equal(finance.FinanceDates.dateOnlyToNoonIso('2026-06-05'), '2026-06-05T12:00:00.000Z');
  assert.equal(finance.FinanceDates.addDaysDateOnly('2026-06-05', 7), '2026-06-12');

  const nowIso = '2026-06-05T22:30:00.000Z';
  const events = append(finance, [{
    id: 'health-insurance',
    type: 'expense.recurring_set',
    amount: 680,
    currency: 'EUR',
    timestamp: nowIso,
    related_entity_id: 'health-insurance',
    metadata: { category: 'Health insurance', monthlyAmount: 680, dueDay: 5, frequency: 'monthly', scope: 'personal' },
  }], nowIso);
  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 30,
    nowIso,
  });

  const currentMonth = result.treasury.obligations.find((entry) => entry.id === 'health-insurance-2026-06');
  assert.equal(currentMonth.dueDate, '2026-06-05');
  assert.equal(currentMonth.status, 'due_soon');
});

test('reviewed obligation instances can be marked paid and leave overdue queue', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 1000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'rent-recurring',
      type: 'expense.recurring_set',
      amount: 300,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent-recurring',
      metadata: { category: 'Studio rent', monthlyAmount: 300, dueDay: 1, frequency: 'monthly', scope: 'business' },
    },
    {
      id: 'rent-reviewed',
      type: 'obligation.reviewed',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'rent-recurring-2026-06',
      metadata: { status: 'paid', title: 'Studio rent', dueDate: '2026-06-01', paidAt: '2026-06-02T12:00:00.000Z', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.treasury.overdueObligations.some((entry) => entry.id === 'rent-recurring-2026-06'), false);
  assert.equal(result.treasury.paidObligations.length, 1);
  assert.equal(result.treasury.paidObligations[0].status, 'paid');
  assert.equal(result.treasury.incomeScenarios.conservative, 100);
});

test('transaction review events categorize transactions and clear review queue items', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 1000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'txn-unclear',
      type: 'expense.recorded',
      amount: 30,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'txn-entity',
      metadata: { description: 'Unclear tool charge', accountId: 'cash-main', accountName: 'Operating cash', categoryId: 'uncategorized', scope: 'business' },
    },
    {
      id: 'txn-reviewed',
      type: 'transaction.reviewed',
      amount: 30,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'txn-unclear',
      metadata: { categoryId: 'software', scope: 'business', reviewStatus: 'reviewed', notes: 'Classified during weekly review.' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.transactions[0].categoryId, 'software');
  assert.equal(result.readModel.transactions[0].reviewStatus, 'reviewed');
  assert.equal(result.treasury.reviewQueue.some((item) => item.kind === 'transaction' && item.targetId === 'txn-unclear'), false);
});

test('matching an existing payment to an obligation does not create a duplicate payment', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 700,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 700, scope: 'business', bucket: 'available' },
    },
    {
      id: 'rent-recurring',
      type: 'expense.recurring_set',
      amount: 300,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent-recurring',
      metadata: { category: 'Studio rent', monthlyAmount: 300, dueDay: 1, frequency: 'monthly', scope: 'business' },
    },
    {
      id: 'payment-event',
      type: 'expense.recorded',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-02T12:00:00.000Z',
      related_entity_id: 'payment-entity',
      metadata: { description: 'Studio rent paid', accountId: 'cash-main', accountName: 'Operating cash', categoryId: 'obligation', scope: 'business' },
    },
    {
      id: 'payment-reviewed',
      type: 'transaction.reviewed',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'payment-event',
      metadata: { categoryId: 'obligation', scope: 'business', obligationId: 'rent-recurring-2026-06', obligationTitle: 'Studio rent', reviewStatus: 'reviewed' },
    },
    {
      id: 'rent-reviewed',
      type: 'obligation.reviewed',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-03T10:06:00.000Z',
      related_entity_id: 'rent-recurring-2026-06',
      metadata: { status: 'paid', title: 'Studio rent', dueDate: '2026-06-01', paidAt: '2026-06-02T12:00:00.000Z', transactionId: 'payment-event', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.transactions.filter((entry) => entry.type === 'expense.recorded').length, 1);
  assert.equal(result.readModel.transactions[0].obligationId, 'rent-recurring-2026-06');
  assert.equal(result.treasury.paidObligations.length, 1);
  assert.equal(result.treasury.reviewQueue.some((item) => item.kind === 'payment' && item.targetId === 'payment-event'), false);
});

test('pipeline review and cancellation events update unresolved review state', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const reviewedEvents = append(finance, [
    {
      id: 'pipeline-risky',
      type: 'pipeline.created',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'pipeline-risky',
      metadata: { title: 'Speculative campaign', value: 1000, probability: 0.25, status: 'risky', expectedDateISO: '2026-06-20', scope: 'business' },
    },
    {
      id: 'pipeline-stage',
      type: 'pipeline.stage_changed',
      amount: 0,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'pipeline-risky',
      metadata: { status: 'expected', stage: 'expected', expectedDateISO: '2026-06-22', scope: 'business' },
    },
    {
      id: 'pipeline-probability',
      type: 'pipeline.probability_changed',
      amount: 0.7,
      currency: 'EUR',
      timestamp: '2026-06-03T10:06:00.000Z',
      related_entity_id: 'pipeline-risky',
      metadata: { probability: 0.7, expectedDateISO: '2026-06-22', scope: 'business' },
    },
  ], nowIso);
  const reviewed = finance.FinanceCompute.computeFinancialContext(reviewedEvents, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(reviewed.readModel.pipelineDeals[0].status, 'expected');
  assert.equal(reviewed.readModel.pipelineDeals[0].probability, 0.7);
  assert.equal(reviewed.treasury.reviewQueue.some((item) => item.kind === 'pipeline' && item.targetId === 'pipeline-risky'), false);

  const cancelledEvents = append(finance, [
    {
      id: 'pipeline-risky',
      type: 'pipeline.created',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'pipeline-risky',
      metadata: { title: 'Speculative campaign', value: 1000, probability: 0.25, status: 'risky', expectedDateISO: '2026-06-20', scope: 'business' },
    },
    {
      id: 'pipeline-cancelled',
      type: 'pipeline.stage_changed',
      amount: 0,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'pipeline-risky',
      metadata: { status: 'cancelled', stage: 'cancelled', scope: 'business' },
    },
  ], nowIso);
  const cancelled = finance.FinanceCompute.computeFinancialContext(cancelledEvents, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(cancelled.treasury.income.some((entry) => entry.id === 'pipeline-risky'), false);
});

test('debt plan events remove missing-plan review items', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'debt-added',
      type: 'debt.added',
      amount: 2000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'debt-credit-line',
      metadata: { name: 'Credit line', scope: 'business' },
    },
    {
      id: 'debt-plan',
      type: 'debt.plan_updated',
      amount: 150,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'debt-credit-line',
      metadata: { name: 'Credit line', scope: 'business', dueDate: '2026-07-15', minimumPayment: 150, paymentPlanNote: 'Monthly minimum agreed.' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.debtAccounts[0].dueDate, '2026-07-15');
  assert.equal(result.readModel.debtAccounts[0].minimumPayment, 150);
  assert.equal(result.treasury.reviewQueue.some((item) => item.kind === 'debt' && item.targetId === 'debt-credit-line'), false);
});

test('currency formatting respects an explicit currency before base currency', () => {
  assert.equal(resolveCurrencyCode('usd', 'EUR'), 'USD');
  assert.equal(resolveCurrencyCode('', 'EUR'), 'EUR');
  const explicit = formatCurrencyAmount(12, { currency: 'USD', baseCurrency: 'EUR', locale: 'en-US' });
  const fallback = formatCurrencyAmount(12, { baseCurrency: 'EUR', locale: 'en-US' });
  assert.match(explicit, /\$12\.00|US\$12\.00/);
  assert.match(fallback, /€12\.00/);
});

test('FinancialEngine confirmedIncome90d excludes paid income outside the next 90 days', () => {
  const engine = loadFinancialEngine();
  const result = engine.compute({
    nowIso: '2026-06-02T10:00:00.000Z',
    financeSnapshot: {
      realBalance: 0,
      projectedBalance: 0,
      weightedPipeline: 0,
      monthlyBurn: 0,
      runwayMonths: null,
      totalDebt: 0,
      confidenceScore: 1,
      missingInputs: [],
    },
    financeReadModel: {
      fiatAccounts: [],
      web3Positions: [],
      invoices: [
        { id: 'paid-inside', status: 'paid', amount: 1200, paidAt: '2026-06-20T12:00:00.000Z' },
        { id: 'paid-outside', status: 'paid', amount: 4000, paidAt: '2026-10-20T12:00:00.000Z' },
        { id: 'paid-before', status: 'paid', amount: 900, paidAt: '2026-05-20T12:00:00.000Z' },
      ],
    },
  });

  assert.equal(result.confirmedIncome90d, 1200);
});

test('reversals remove their target from active events and derived balances', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const incomeEvents = append(finance, [{
    id: 'income-one',
    type: 'income.received',
    amount: 500,
    currency: 'EUR',
    timestamp: nowIso,
    metadata: { description: 'Paid invoice', scope: 'business' },
  }], nowIso);
  const reversed = finance.FinanceLedger.reverseEvent(
    incomeEvents,
    'income-one',
    'test undo',
    { baseCurrency: 'EUR', forecastDays: 90, nowIso },
    { timestamp: '2026-06-02T10:01:00.000Z', nowIso: '2026-06-02T10:01:00.000Z' },
  ).events;
  const result = finance.FinanceCompute.computeFinancialContext(reversed, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso: '2026-06-02T10:02:00.000Z',
  });

  assert.equal(finance.FinanceLedger.getActiveEvents(reversed).length, 0);
  assert.equal(result.snapshot.realBalance, 0);
});

test('invariant evaluator reports inconsistent balances', () => {
  const finance = loadFinance();
  const result = finance.FinanceInvariants.evaluateFinancialInvariants({
    snapshot: { realBalance: 10, monthlyBurn: 5, runwayMonths: 1, weightedPipeline: 0, totalDebt: 0 },
    components: { realBalanceFromSums: 20, weightedPipelineFromDeals: 0, totalDebtFromLiabilities: 0 },
  });

  assert.equal(result.ok, false);
  assert.deepEqual(Array.from(result.violations, (violation) => violation.id), [
    'real-balance-consistency',
    'runway-formula',
  ]);
});

test('legacy repository migration preserves typed values and prefers IndexedDB', () => {
  assert.deepEqual(decodeLegacyValue('{"appearance":"bright"}'), { appearance: 'bright' });
  assert.equal(decodeLegacyValue('plain-string'), 'plain-string');
  assert.deepEqual(
    selectRepositoryValue(undefined, '{"scopeFilter":"business"}'),
    { source: 'localStorage', value: { scopeFilter: 'business' }, removeLegacy: true },
  );
  assert.deepEqual(
    selectRepositoryValue({ scopeFilter: 'shared' }, '{"scopeFilter":"business"}'),
    { source: 'indexeddb', value: { scopeFilter: 'shared' }, removeLegacy: false },
  );
});
