import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { decodeLegacyValue, selectRepositoryValue } from '../src/persistence/legacy-migration.js';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCES = [
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
