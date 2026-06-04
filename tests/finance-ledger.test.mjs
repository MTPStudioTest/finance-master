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
  assert.equal(result.explanations.forecastConfidence.label, 'Forecast confidence');
  assert.equal(result.explanations.forecastConfidence.warnings.some((warning) => warning.includes('Missing recurring expenses')), true);
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
    {
      id: 'tax-reserve-bucket',
      type: 'asset.reserve_set',
      amount: 2000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'tax-reserve-bucket',
      metadata: { name: 'Tax Reserve', targetAmount: 2000, currentAmount: 500, purpose: 'tax_reserve', scope: 'business', active: true },
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
  assert.equal(result.readModel.reserveBuckets[0].name, 'Tax Reserve');
  assert.equal(result.readModel.reserveBuckets[0].currentAmount, 500);
  assert.equal(result.snapshot.realBalance, 1200);
  assert.equal(result.snapshot.monthlyBurn, 300);
  assert.equal(result.snapshot.runwayMonths, 3);
});

test('read model derives project treasury profiles and preserves archived profiles', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'project-alpha-created',
      type: 'project.profile_set',
      amount: 0,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'project-alpha',
      metadata: {
        name: 'Launch Treasury',
        clientOrPurpose: 'Client launch',
        color: 'mint',
        notes: 'Keep launch cash separate.',
        status: 'active',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
    },
    {
      id: 'project-alpha-archived',
      type: 'project.profile_set',
      amount: 0,
      currency: 'EUR',
      timestamp: '2026-06-03T10:00:00.000Z',
      related_entity_id: 'project-alpha',
      metadata: {
        name: 'Launch Treasury',
        clientOrPurpose: 'Client launch',
        color: 'mint',
        notes: 'Done for now.',
        status: 'archived',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.projectProfiles.length, 1);
  assert.equal(result.readModel.projectProfiles[0].id, 'project-alpha');
  assert.equal(result.readModel.projectProfiles[0].name, 'Launch Treasury');
  assert.equal(result.readModel.projectProfiles[0].clientOrPurpose, 'Client launch');
  assert.equal(result.readModel.projectProfiles[0].status, 'archived');
  assert.equal(result.readModel.projectProfiles[0].createdAt, '2026-06-01T09:00:00.000Z');
});

test('project treasury tags survive read-model derivation without changing global cash math', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'project-alpha',
      type: 'project.profile_set',
      amount: 0,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'project-alpha',
      metadata: { name: 'Launch Treasury', status: 'active' },
    },
    {
      id: 'cash-alpha',
      type: 'asset.account_set',
      amount: 2200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-alpha',
      metadata: { name: 'Launch Wallet', balance: 2200, scope: 'business', projectId: 'project-alpha' },
    },
    {
      id: 'cash-global',
      type: 'asset.account_set',
      amount: 800,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-global',
      metadata: { name: 'Studio Wallet', balance: 800, scope: 'business' },
    },
    {
      id: 'reserve-alpha',
      type: 'asset.reserve_set',
      amount: 600,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'reserve-alpha',
      metadata: { name: 'Launch tax', targetAmount: 1000, currentAmount: 600, scope: 'business', projectId: 'project-alpha' },
    },
    {
      id: 'cost-alpha',
      type: 'expense.recurring_set',
      amount: 300,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cost-alpha',
      metadata: { category: 'Launch tools', monthlyAmount: 300, dueDay: 7, scope: 'business', projectId: 'project-alpha' },
    },
    {
      id: 'debt-alpha',
      type: 'debt.added',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'debt-alpha',
      metadata: { name: 'Launch credit', scope: 'business', minimumPayment: 120, projectId: 'project-alpha' },
    },
    {
      id: 'income-alpha',
      type: 'pipeline.created',
      amount: 1500,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-alpha',
      metadata: { title: 'Launch milestone', value: 1500, probability: 1, status: 'confirmed', expectedDateISO: '2026-06-20', scope: 'business', projectId: 'project-alpha' },
    },
    {
      id: 'txn-alpha',
      type: 'income.received',
      amount: 500,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'txn-alpha-entity',
      metadata: { description: 'Launch deposit', accountId: 'cash-alpha', accountName: 'Launch Wallet', categoryId: 'client-income', scope: 'business', projectId: 'project-alpha' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.fiatAccounts.find((entry) => entry.id === 'cash-alpha').projectId, 'project-alpha');
  assert.equal(result.readModel.fiatAccounts.find((entry) => entry.id === 'cash-global').projectId, '');
  assert.equal(result.readModel.reserveBuckets[0].projectId, 'project-alpha');
  assert.equal(result.readModel.recurringExpenses[0].projectId, 'project-alpha');
  assert.equal(result.readModel.debtAccounts[0].projectId, 'project-alpha');
  assert.equal(result.readModel.pipelineDeals[0].projectId, 'project-alpha');
  assert.equal(result.readModel.transactions.find((entry) => entry.id === 'txn-alpha').projectId, 'project-alpha');
  assert.equal(result.treasury.actualCash, 3000);
  assert.equal(result.treasury.totalMonthlyBurn, 420);
});

test('income status aliases, default probabilities, and due states are normalized in the read model', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'legacy-open',
      type: 'pipeline.created',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'legacy-open',
      metadata: { title: 'Legacy open item', value: 1000, status: 'open', expectedDateISO: '2026-06-06', scope: 'business' },
    },
    {
      id: 'signed-today',
      type: 'pipeline.created',
      amount: 2000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'signed-today',
      metadata: { title: 'Signed today', value: 2000, status: 'signed', expectedDateISO: '2026-06-02', scope: 'business' },
    },
    {
      id: 'old-invoice',
      type: 'pipeline.created',
      amount: 1500,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'old-invoice',
      metadata: { title: 'Old invoice', value: 1500, status: 'invoice_sent', expectedDateISO: '2026-05-10', scope: 'business' },
    },
    {
      id: 'retainer',
      type: 'pipeline.created',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'retainer',
      metadata: { title: 'Monthly retainer', value: 1200, status: 'expected', incomeType: 'retainer', expectedDateISO: '2026-06-10', scope: 'business' },
    },
    {
      id: 'proposal-override',
      type: 'pipeline.created',
      amount: 900,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'proposal-override',
      metadata: { title: 'Proposal override', value: 900, status: 'proposal', probability: 0.25, expectedDateISO: '2026-06-20', scope: 'business' },
    },
    {
      id: 'vat-income',
      type: 'pipeline.created',
      amount: 1190,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'vat-income',
      metadata: { title: 'VAT income', value: 1190, netAmount: 1000, vatRate: 19, vatAmount: 190, grossAmount: 1190, status: 'confirmed', expectedDateISO: '2026-06-12', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });
  const byId = Object.fromEntries(result.readModel.pipelineDeals.map((item) => [item.id, item]));

  assert.equal(byId['legacy-open'].status, 'expected');
  assert.equal(byId['legacy-open'].probability, 0.6);
  assert.equal(byId['legacy-open'].dueState, 'due_soon');
  assert.equal(byId['signed-today'].status, 'confirmed');
  assert.equal(byId['signed-today'].probability, 0.9);
  assert.equal(byId['signed-today'].dueState, 'due_today');
  assert.equal(byId['old-invoice'].status, 'invoiced');
  assert.equal(byId['old-invoice'].probability, 0.95);
  assert.equal(byId['old-invoice'].dueState, 'severely_overdue');
  assert.equal(byId.retainer.probability, 0.9);
  assert.equal(byId.retainer.incomeType, 'retainer');
  assert.equal(byId['proposal-override'].probability, 0.25);
  assert.equal(byId['vat-income'].value, 1190);
  assert.equal(byId['vat-income'].netAmount, 1000);
  assert.equal(byId['vat-income'].vatRate, 19);
  assert.equal(byId['vat-income'].vatAmount, 190);
  assert.equal(byId['vat-income'].grossAmount, 1190);
  const treasuryVatIncome = result.treasury.income.find((item) => item.id === 'vat-income');
  assert.equal(treasuryVatIncome.amount, 1190);
  assert.equal(treasuryVatIncome.netAmount, 1000);
  assert.equal(treasuryVatIncome.vatAmount, 190);
});

test('read model derives transaction evidence from existing metadata and links', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 3000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 3000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'retainer-income',
      type: 'pipeline.created',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'retainer-income',
      metadata: { title: 'June retainer', value: 1200, probability: 1, status: 'paid', expectedDateISO: '2026-06-03', scope: 'business' },
    },
    {
      id: 'settlement-event',
      type: 'income.received',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'settlement-entity',
      metadata: {
        description: 'June retainer paid',
        accountId: 'cash-main',
        accountName: 'Operating cash',
        categoryId: 'client-income',
        scope: 'business',
        source: 'csv-import',
        sourceFile: 'bank.csv',
        importBatchId: 'import-june',
        fingerprint: '2026-06-03|june retainer paid|1200.00',
        invoiceId: 'retainer-income',
      },
    },
    {
      id: 'tax-reserve',
      type: 'asset.reserve_set',
      amount: 600,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'tax-reserve',
      metadata: { name: 'Tax reserve', targetAmount: 600, currentAmount: 300, scope: 'business' },
    },
    {
      id: 'credit-line',
      type: 'debt.added',
      amount: 2000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'credit-line',
      metadata: { name: 'Credit line', scope: 'business', minimumPayment: 100 },
    },
    {
      id: 'settlement-reviewed',
      type: 'transaction.reviewed',
      amount: 1200,
      currency: 'EUR',
      timestamp: '2026-06-03T10:04:00.000Z',
      related_entity_id: 'settlement-event',
      metadata: { categoryId: 'client-income', scope: 'business', linkedIncomeId: 'retainer-income', linkedReserveId: 'tax-reserve', linkedDebtId: 'credit-line', reviewStatus: 'reviewed' },
    },
    {
      id: 'rent-recurring',
      type: 'expense.recurring_set',
      amount: 300,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent-recurring',
      metadata: { category: 'Studio rent', monthlyAmount: 300, dueDay: 3, frequency: 'monthly', scope: 'business' },
    },
    {
      id: 'rent-payment',
      type: 'expense.recorded',
      amount: 300,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent-payment-entity',
      metadata: {
        description: 'Studio rent',
        accountId: 'cash-main',
        accountName: 'Operating cash',
        categoryId: 'obligation',
        scope: 'business',
        source: 'csv-import',
        sourceFile: 'bank.csv',
        importBatchId: 'import-june',
        fingerprint: '2026-06-03|studio rent|-300.00',
      },
    },
    {
      id: 'rent-reviewed',
      type: 'transaction.reviewed',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'rent-payment',
      metadata: { categoryId: 'obligation', scope: 'business', obligationId: 'rent-recurring-2026-06', obligationTitle: 'Studio rent', reviewStatus: 'reviewed' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });
  const income = result.readModel.transactions.find((entry) => entry.id === 'settlement-event');
  const rent = result.readModel.transactions.find((entry) => entry.id === 'rent-payment');

  assert.equal(income.sourceFile, 'bank.csv');
  assert.equal(income.importBatchId, 'import-june');
  assert.equal(income.linkedIncomeId, 'retainer-income');
  assert.equal(income.linkedReserveId, 'tax-reserve');
  assert.equal(income.linkedDebtId, 'credit-line');
  assert.equal(income.linkedIncomeTitle, 'June retainer');
  assert.equal(income.linkedDebtTitle, 'Credit line');
  assert.equal(income.fingerprint, '2026-06-03|june retainer paid|1200.00');
  assert.equal(rent.linkedObligationTitle, 'Studio rent');
  assert.equal(rent.reviewStatus, 'reviewed');
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
  assert.equal(result.treasury.actualCash, 6800);
  assert.equal(result.treasury.reservedCash, 1800);
  assert.equal(result.treasury.protectedCash, 1800);
  assert.equal(result.treasury.trulyAvailableCash, 5000);
  assert.equal(result.treasury.committedShortTermObligations, 1000);
  assert.equal(result.treasury.availableCash, 4000);
  assert.equal(result.treasury.safeToSpend, 3766.67);
  assert.equal(result.treasury.confirmedShortTermObligations, 1000);
  assert.equal(result.treasury.debtPaymentsDueSoon, 0);
  assert.equal(result.treasury.minimumBuffer, 233.33);
  assert.equal(result.treasury.totalMonthlyBurn, 1000);
  assert.equal(result.treasury.runwayMonths, 4);
  assert.equal(result.snapshot.realBalance, 6800);
  assert.equal(result.snapshot.trulyAvailableCash, 5000);
  assert.equal(result.snapshot.availableCash, 4000);
  assert.equal(result.snapshot.safeToSpend, 3766.67);
  assert.equal(result.explanations.availableCash.parts.map((part) => part.label).join('|'), 'Actual cash|This money is protected|Due within 30 days');
  assert.equal(result.explanations.safeToSpend.parts.map((part) => part.label).join('|'), 'Actual cash|This money is protected|Confirmed obligations due within 30 days|Debt payments due soon|Minimum 7-day buffer');
  assert.equal(result.explanations.runway.parts[0].label, 'Available cash');
  assert.equal(result.explanations.debtPressure.label, 'Debt pressure');
});

test('safe-to-spend excludes expected income and reserves debt pressure plus buffer', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 5000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 5000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'cash-vat',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-vat',
      metadata: { name: 'VAT reserve', balance: 1000, scope: 'business', bucket: 'vat_reserve', reserved: true },
    },
    {
      id: 'software-recurring',
      type: 'expense.recurring_set',
      amount: 900,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'software-recurring',
      metadata: { category: 'Studio tools', monthlyAmount: 900, dueDay: 12, frequency: 'monthly', scope: 'business' },
    },
    {
      id: 'debt-card',
      type: 'debt.added',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'debt-card',
      metadata: { name: 'Card balance', outstanding: 1200, minimumPayment: 300, frequency: 'monthly', scope: 'business' },
    },
    {
      id: 'income-expected',
      type: 'pipeline.created',
      amount: 10000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-expected',
      metadata: { title: 'Expected launch payment', value: 10000, probability: 0.9, status: 'confirmed', expectedDateISO: '2026-06-15', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.treasury.actualCash, 6000);
  assert.equal(result.treasury.protectedCash, 1000);
  assert.equal(result.treasury.availableCash, 4100);
  assert.equal(result.treasury.safeToSpend, 3520);
  assert.equal(result.treasury.confirmedShortTermObligations, 900);
  assert.equal(result.treasury.debtPaymentsDueSoon, 300);
  assert.equal(result.treasury.minimumBuffer, 280);
  assert.equal(result.treasury.incomeScenarios.expected, 10100);
  assert.equal(result.explanations.safeToSpend.value, 3520);
  assert.equal(result.explanations.safeToSpend.parts.find((part) => part.label === 'Debt payments due soon').value, 300);
  assert.equal(result.explanations.debtPressure.value, 300);
  assert.equal(result.explanations.debtPressure.parts.map((part) => part.label).join('|'), 'Card balance');
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
    {
      id: 'payment-unmatched',
      type: 'expense.recorded',
      amount: 120,
      currency: 'EUR',
      timestamp: nowIso,
      metadata: { description: 'Workspace card payment', accountId: 'cash-main', accountName: 'Operating cash', categoryId: 'obligation', scope: 'business' },
    },
    {
      id: 'txn-uncategorized',
      type: 'expense.recorded',
      amount: 30,
      currency: 'EUR',
      timestamp: nowIso,
      metadata: { description: 'Unclear spend', accountId: 'cash-main', accountName: 'Operating cash', categoryId: 'uncategorized', scope: 'business' },
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
  assert.equal(result.treasury.incomeScenarios.conservative, 3080);
  assert.equal(result.treasury.incomeScenarios.expected, 3600);
  assert.equal(result.treasury.incomeScenarios.optimistic, 4300);
  assert.equal(result.treasury.overdueObligations[0].title, 'Workspace');
  assert.equal(result.treasury.reviewQueue.some((item) => item.reason === 'Income confidence needs review'), true);
  assert.deepEqual(Array.from(result.treasury.dashboardSummary.actionThisWeek.items.map((item) => item.kind)), ['obligation', 'payment', 'transaction', 'pipeline']);
  assert.equal(result.treasury.dashboardSummary.actionThisWeek.urgentCount, 1);
  assert.equal(result.treasury.dashboardSummary.next30Days.confirmedIncoming, 1080);
  assert.equal(result.treasury.dashboardSummary.next30Days.expectedWeightedIncoming, 520);
  assert.equal(result.treasury.dashboardSummary.next30Days.obligationsDue, 500);
  assert.equal(result.treasury.dashboardSummary.next30Days.projectedNetMovement, 1100);
  assert.equal(result.treasury.dashboardSummary.next30Days.incomeCount, 3);
  assert.equal(result.treasury.dashboardSummary.next30Days.obligationCount, 1);
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

  assert.equal(result.treasury.incomeScenarios.conservative, 1450);
  assert.equal(result.treasury.incomeScenarios.expected, 1450);
  assert.equal(result.treasury.incomeScenarios.optimistic, 1450);
});

test('linked received income is not double-counted in forecast pipeline totals', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-02T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 3000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating cash', balance: 3000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'income-confirmed',
      type: 'pipeline.created',
      amount: 1200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'income-confirmed',
      metadata: { title: 'Settled project', value: 1200, probability: 1, status: 'confirmed', expectedDateISO: '2026-06-20', scope: 'business' },
    },
    {
      id: 'income-received',
      type: 'income.received',
      amount: 1200,
      currency: 'EUR',
      timestamp: '2026-06-03T10:00:00.000Z',
      related_entity_id: 'txn-paid-project',
      metadata: { description: 'Settled project paid', accountId: 'cash-main', accountName: 'Operating cash', invoiceId: 'income-confirmed', categoryId: 'client-income', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.treasury.income.some((entry) => entry.id === 'income-confirmed'), false);
  assert.equal(result.snapshot.weightedPipeline, 0);
  assert.equal(result.treasury.incomeThisMonth.received, 1200);
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
  assert.equal(result.treasury.incomeScenarios.conservative, -200);
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

test('recurring expenses normalize weekly, biweekly, monthly, quarterly, and yearly burn', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 12000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 12000, scope: 'business', bucket: 'available' },
    },
    ['weekly', 100],
    ['biweekly', 50],
    ['monthly', 250],
    ['quarterly', 600],
    ['yearly', 1200],
  ].map((entry) => Array.isArray(entry) ? {
    id: `cost-${entry[0]}`,
    type: 'expense.recurring_set',
    amount: entry[1],
    currency: 'EUR',
    timestamp: nowIso,
    related_entity_id: `cost-${entry[0]}`,
    metadata: { category: `Cost ${entry[0]}`, amount: entry[1], frequency: entry[0], scope: 'business' },
  } : entry), nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });
  const amounts = Object.fromEntries(result.readModel.recurringExpenses.map((entry) => [entry.frequency, entry.monthlyAmount]));

  assert.equal(amounts.weekly, 433.33);
  assert.equal(amounts.biweekly, 108.33);
  assert.equal(amounts.monthly, 250);
  assert.equal(amounts.quarterly, 200);
  assert.equal(amounts.yearly, 100);
  assert.equal(result.treasury.totalMonthlyBurn, 1091.66);
});

test('debt payment plans affect monthly burn and are not double-counted when linked to a recurring cost', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 5000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 5000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'cash-tax',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-tax',
      metadata: { name: 'Tax reserve', balance: 1000, scope: 'business', bucket: 'tax_reserve', reserved: true },
    },
    {
      id: 'debt-added',
      type: 'debt.added',
      amount: 2400,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'debt-card',
      metadata: { name: 'Card repayment', scope: 'business' },
    },
    {
      id: 'debt-plan',
      type: 'debt.plan_updated',
      amount: 600,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'debt-card',
      metadata: { name: 'Card repayment', scope: 'business', dueDate: '2026-07-15', minimumPayment: 600, frequency: 'quarterly', paymentPlanNote: 'Quarterly repayment agreed.' },
    },
    {
      id: 'linked-debt-cost',
      type: 'expense.recurring_set',
      amount: 600,
      currency: 'EUR',
      timestamp: '2026-06-03T10:06:00.000Z',
      related_entity_id: 'linked-debt-cost',
      metadata: { category: 'Card repayment', amount: 600, frequency: 'quarterly', linkedDebtId: 'debt-card', scope: 'business' },
    },
    {
      id: 'studio-rent',
      type: 'expense.recurring_set',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-03T10:07:00.000Z',
      related_entity_id: 'studio-rent',
      metadata: { category: 'Studio rent', monthlyAmount: 300, frequency: 'monthly', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.debtAccounts[0].minimumPaymentMonthly, 200);
  assert.equal(result.readModel.debtAccounts[0].estimatedPayoffMonths, 12);
  assert.equal(result.readModel.debtAccounts[0].estimatedPayoffDate, '2027-06-03');
  assert.equal(result.readModel.recurringExpenses.find((entry) => entry.id === 'linked-debt-cost').monthlyAmount, 200);
  assert.equal(result.treasury.totalMonthlyBurn, 500);
  assert.equal(result.snapshot.monthlyBurn, 500);
  assert.equal(result.treasury.committedShortTermObligations, 300);
  assert.equal(result.snapshot.runwayMonths, 9.4);
});

test('debt payment plan status controls current pressure without breaking legacy active plans', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 10000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 10000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'cash-tax',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-tax',
      metadata: { name: 'Tax reserve', balance: 1000, scope: 'business', bucket: 'tax_reserve', reserved: true },
    },
    {
      id: 'rent',
      type: 'expense.recurring_set',
      amount: 100,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'rent',
      metadata: { category: 'Studio rent', monthlyAmount: 100, frequency: 'monthly', dueDay: 15, scope: 'business' },
    },
    ...['legacy-active', 'paused', 'future', 'irregular-empty', 'irregular-custom', 'completed', 'archived'].flatMap((id, index) => [{
      id: `${id}-added`,
      type: 'debt.added',
      amount: 1200 + index,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: id,
      metadata: { name: id, scope: 'business' },
    }]),
    {
      id: 'legacy-active-plan',
      type: 'debt.plan_updated',
      amount: 600,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'legacy-active',
      metadata: { name: 'Legacy active', dueDate: '2026-08-15', minimumPayment: 600, frequency: 'quarterly', scope: 'business' },
    },
    {
      id: 'linked-legacy-cost',
      type: 'expense.recurring_set',
      amount: 600,
      currency: 'EUR',
      timestamp: '2026-06-03T10:06:00.000Z',
      related_entity_id: 'linked-legacy-cost',
      metadata: { category: 'Legacy active', amount: 600, frequency: 'quarterly', linkedDebtId: 'legacy-active', scope: 'business' },
    },
    {
      id: 'paused-plan',
      type: 'debt.plan_updated',
      amount: 100,
      currency: 'EUR',
      timestamp: '2026-06-03T10:07:00.000Z',
      related_entity_id: 'paused',
      metadata: { name: 'Paused', dueDate: '2026-06-20', minimumPayment: 100, frequency: 'monthly', planStatus: 'on_hold', scope: 'business' },
    },
    {
      id: 'future-plan',
      type: 'debt.plan_updated',
      amount: 100,
      currency: 'EUR',
      timestamp: '2026-06-03T10:08:00.000Z',
      related_entity_id: 'future',
      metadata: { name: 'Future', dueDate: '2026-07-20', minimumPayment: 100, frequency: 'monthly', planStatus: 'active', startDate: '2026-07-01', scope: 'business' },
    },
    {
      id: 'irregular-empty-plan',
      type: 'debt.plan_updated',
      amount: 500,
      currency: 'EUR',
      timestamp: '2026-06-03T10:09:00.000Z',
      related_entity_id: 'irregular-empty',
      metadata: { name: 'Irregular empty', dueDate: '2026-06-20', minimumPayment: 500, frequency: 'monthly', planStatus: 'irregular', scope: 'business' },
    },
    {
      id: 'irregular-custom-plan',
      type: 'debt.plan_updated',
      amount: 500,
      currency: 'EUR',
      timestamp: '2026-06-03T10:10:00.000Z',
      related_entity_id: 'irregular-custom',
      metadata: { name: 'Irregular custom', dueDate: '2026-06-20', minimumPayment: 500, frequency: 'monthly', planStatus: 'irregular', customMonthlyPressure: 150, scope: 'business' },
    },
    {
      id: 'completed-plan',
      type: 'debt.plan_updated',
      amount: 100,
      currency: 'EUR',
      timestamp: '2026-06-03T10:11:00.000Z',
      related_entity_id: 'completed',
      metadata: { name: 'Completed', dueDate: '2026-06-20', minimumPayment: 100, frequency: 'monthly', planStatus: 'completed', scope: 'business' },
    },
    {
      id: 'archived-plan',
      type: 'debt.plan_updated',
      amount: 100,
      currency: 'EUR',
      timestamp: '2026-06-03T10:12:00.000Z',
      related_entity_id: 'archived',
      metadata: { name: 'Archived', dueDate: '2026-06-20', minimumPayment: 100, frequency: 'monthly', planStatus: 'archived', scope: 'business' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });
  const debts = Object.fromEntries(result.readModel.debtAccounts.map((debt) => [debt.id, debt]));

  assert.equal(debts['legacy-active'].planStatus, 'active');
  assert.equal(debts['legacy-active'].monthlyPressure, 200);
  assert.equal(debts.paused.monthlyPressure, 0);
  assert.equal(debts.future.planStatus, 'starts_later');
  assert.equal(debts.future.monthlyPressure, 0);
  assert.equal(debts['irregular-empty'].monthlyPressure, 0);
  assert.equal(debts['irregular-custom'].monthlyPressure, 150);
  assert.equal(debts.completed.monthlyPressure, 0);
  assert.equal(debts.archived.monthlyPressure, 0);
  assert.equal(result.treasury.totalMonthlyBurn, 450);
  assert.equal(result.treasury.debtPaymentsDueSoon, 350);
  assert.equal(result.readModel.recurringExpenses.find((entry) => entry.id === 'linked-legacy-cost').monthlyAmount, 200);
});

test('ledger transaction read model supports explicit income, expense, transfer, and adjustment semantics', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-main-start',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 1000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'cash-tax-start',
      type: 'asset.account_set',
      amount: 200,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-tax',
      metadata: { name: 'Tax reserve', balance: 200, scope: 'business', bucket: 'tax_reserve', reserved: true },
    },
    {
      id: 'income-event',
      type: 'income.received',
      amount: 500,
      currency: 'EUR',
      timestamp: '2026-06-03T10:01:00.000Z',
      related_entity_id: 'txn-income',
      metadata: { description: 'Client paid', accountId: 'cash-main', accountName: 'Operating', categoryId: 'client-income', scope: 'business', source: 'manual-ledger' },
    },
    {
      id: 'expense-event',
      type: 'expense.recorded',
      amount: 120,
      currency: 'EUR',
      timestamp: '2026-06-03T10:02:00.000Z',
      related_entity_id: 'txn-expense',
      metadata: { description: 'Software', accountId: 'cash-main', accountName: 'Operating', categoryId: 'software', scope: 'business', source: 'manual-ledger' },
    },
    {
      id: 'transfer-event',
      type: 'transfer.recorded',
      amount: 300,
      currency: 'EUR',
      timestamp: '2026-06-03T10:03:00.000Z',
      related_entity_id: 'txn-transfer',
      metadata: { description: 'Reserve tax', fromAccountId: 'cash-main', fromAccountName: 'Operating', toAccountId: 'cash-tax', toAccountName: 'Tax reserve', accountId: 'cash-main', accountName: 'Operating', categoryId: 'transfer', scope: 'business', source: 'manual-ledger' },
    },
    {
      id: 'adjustment-event',
      type: 'cash.adjusted',
      amount: 40,
      currency: 'EUR',
      timestamp: '2026-06-03T10:04:00.000Z',
      related_entity_id: 'txn-adjustment',
      metadata: { description: 'Balance correction', direction: 'decrease', accountId: 'cash-main', accountName: 'Operating', categoryId: 'adjustment', scope: 'business', source: 'manual-ledger' },
    },
    {
      id: 'cash-main-final',
      type: 'asset.account_set',
      amount: 1040,
      currency: 'EUR',
      timestamp: '2026-06-03T10:05:00.000Z',
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 1040, scope: 'business', bucket: 'available', transactionId: 'txn-adjustment' },
    },
    {
      id: 'cash-tax-final',
      type: 'asset.account_set',
      amount: 500,
      currency: 'EUR',
      timestamp: '2026-06-03T10:06:00.000Z',
      related_entity_id: 'cash-tax',
      metadata: { name: 'Tax reserve', balance: 500, scope: 'business', bucket: 'tax_reserve', reserved: true, transactionId: 'txn-transfer' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.transactions.length, 4);
  assert.equal(result.readModel.transactions.find((entry) => entry.id === 'income-event').signedAmount, 500);
  assert.equal(result.readModel.transactions.find((entry) => entry.id === 'expense-event').signedAmount, -120);
  assert.equal(result.readModel.transactions.find((entry) => entry.id === 'transfer-event').ledgerType, 'transfer');
  assert.equal(result.readModel.transactions.find((entry) => entry.id === 'adjustment-event').signedAmount, -40);
  assert.equal(result.treasury.incomeThisMonth.received, 500);
  assert.equal(result.treasury.totalCash, 1540);
  assert.equal(result.treasury.reservedCash, 500);
});

test('reversing a transaction and linked account set restores prior active balance', () => {
  const finance = loadFinance();
  const nowIso = '2026-06-03T10:00:00.000Z';
  const events = append(finance, [
    {
      id: 'cash-start',
      type: 'asset.account_set',
      amount: 1000,
      currency: 'EUR',
      timestamp: nowIso,
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 1000, scope: 'business', bucket: 'available' },
    },
    {
      id: 'expense-event',
      type: 'expense.recorded',
      amount: 100,
      currency: 'EUR',
      timestamp: '2026-06-03T10:01:00.000Z',
      related_entity_id: 'txn-expense',
      metadata: { description: 'Reversed software', accountId: 'cash-main', accountName: 'Operating', categoryId: 'software', scope: 'business', source: 'manual-ledger' },
    },
    {
      id: 'cash-after',
      type: 'asset.account_set',
      amount: 900,
      currency: 'EUR',
      timestamp: '2026-06-03T10:02:00.000Z',
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 900, scope: 'business', bucket: 'available', transactionId: 'txn-expense' },
    },
    {
      id: 'reverse-expense',
      type: 'finance.event_reversed',
      amount: 0,
      currency: 'EUR',
      timestamp: '2026-06-03T10:03:00.000Z',
      related_entity_id: 'expense-event',
      metadata: { reversed_event_id: 'expense-event' },
    },
    {
      id: 'reverse-balance',
      type: 'finance.event_reversed',
      amount: 0,
      currency: 'EUR',
      timestamp: '2026-06-03T10:03:01.000Z',
      related_entity_id: 'cash-after',
      metadata: { reversed_event_id: 'cash-after' },
    },
  ], nowIso);

  const result = finance.FinanceCompute.computeFinancialContext(events, {
    baseCurrency: 'EUR',
    forecastDays: 90,
    nowIso,
  });

  assert.equal(result.readModel.transactions.length, 0);
  assert.equal(result.readModel.fiatAccounts[0].balance, 1000);
  assert.equal(result.treasury.totalCash, 1000);
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
