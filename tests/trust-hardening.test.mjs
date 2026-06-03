import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildCsvImportPreview,
  detectCsvDelimiter,
  inferCsvColumnMapping,
  parseCsvDocument,
} from '../src/finance/csv-import.js';
import {
  assertFinanceBackup,
  assertFinanceBackupV1,
  migrateFinanceBackupV1,
  validateFinanceBackup,
} from '../src/persistence/backup-validation.js';
import {
  backupMetadata,
  evaluateStorageStatus,
  inspectFinanceStorage,
  latestLedgerTimestamp,
} from '../src/persistence/data-health.js';
import {
  evaluateMigrationStatus,
  inspectRepositoryMigration,
} from '../src/persistence/schema-migration.js';
import {
  calculateGoalProgress,
  isWeeklyReviewDue,
  normalizeReviewState,
} from '../src/finance/goals.js';
import { buildMonthCloseSummary } from '../src/finance/month-close.js';
import { buildFinanceForecast } from '../src/finance/forecast.js';

function validBackup() {
  return {
    version: 1,
    exportedAt: '2026-06-02T10:00:00.000Z',
    ledger: [{
      id: 'cash-main',
      type: 'asset.account_set',
      amount: 1200,
      currency: 'EUR',
      timestamp: '2026-06-02T09:00:00.000Z',
      created_at: '2026-06-02T09:00:00.000Z',
      related_entity_id: 'cash-main',
      metadata: { name: 'Operating', balance: 1200, scope: 'business' },
    }],
    financeSettings: { baseCurrency: 'EUR', forecastDays: 90 },
    uiSettings: {
      appearance: 'bright',
      reducedMotion: false,
      scopeFilter: 'all',
      walletPriceSource: 'manual',
      scenario: { marketMajors: 0, burnDelta: 0, probFloor: 50 },
    },
    review: { lastReviewedAt: null },
    imports: { batches: [] },
    prices: { quotes: {} },
  };
}

test('CSV delimiter detection covers comma, semicolon, and tab exports', () => {
  assert.equal(detectCsvDelimiter('date,description,amount'), ',');
  assert.equal(detectCsvDelimiter('date;description;amount'), ';');
  assert.equal(detectCsvDelimiter('date\tdescription\tamount'), '\t');
});

test('CSV preview parses quoted signed amounts and stable fingerprints', () => {
  const document = parseCsvDocument('booking date;memo;amount\n02.06.2026;"Studio, rent";"-1.234,50"');
  const mapping = inferCsvColumnMapping(document.headers);
  const preview = buildCsvImportPreview(document, mapping, { sourceFile: 'statement.csv' });

  assert.equal(preview.sourceFile, 'statement.csv');
  assert.deepEqual(preview.rejected, []);
  assert.deepEqual(preview.duplicates, []);
  assert.deepEqual(preview.rows, [{
    date: '2026-06-02',
    description: 'Studio, rent',
    amount: -1234.5,
    categoryId: 'uncategorized',
    scope: 'business',
    fingerprint: '2026-06-02|studio, rent|-1234.50',
  }]);
});

test('CSV preview supports debit and credit columns, defaults, invalid rows, and duplicates', () => {
  const document = parseCsvDocument([
    'date\tdetails\tdebit\tcredit',
    '2026-06-01\tClient payment\t\t500',
    '2026-06-02\tWorkspace\t45\t',
    'not-a-date\tBroken\t20\t',
    '2026-06-02\tWorkspace\t45\t',
  ].join('\n'));
  const mapping = inferCsvColumnMapping(document.headers);
  const preview = buildCsvImportPreview(document, mapping, {
    defaultCategory: 'bank-import',
    defaultScope: 'personal',
    existingFingerprints: ['2026-06-01|client payment|500.00'],
  });

  assert.equal(preview.rows.length, 1);
  assert.equal(preview.rows[0].amount, -45);
  assert.equal(preview.rows[0].categoryId, 'bank-import');
  assert.equal(preview.rows[0].scope, 'personal');
  assert.equal(preview.duplicates.length, 2);
  assert.deepEqual(preview.rejected, [{ rowNumber: 4, reason: 'Date is missing or invalid.' }]);
});

test('CSV preview requires mappings without mutating parsed data', () => {
  const document = parseCsvDocument('when,what,total\n2026-06-01,Payment,100');
  const before = structuredClone(document);
  assert.throws(() => buildCsvImportPreview(document, { date: '', description: '', amount: '' }), /Map both/);
  assert.deepEqual(document, before);
});

test('backup validation accepts complete CSV profiles and rejects incomplete ones', () => {
  const backup = validBackup();
  backup.imports.profiles = [{
    id: 'profile-bank',
    name: 'Bank CSV',
    headers: ['date', 'description', 'amount'],
    mapping: { date: 'date', description: 'description', amount: 'amount' },
    defaultCategory: 'uncategorized',
    defaultScope: 'business',
    createdAt: '2026-06-02T10:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
  }];
  assert.equal(validateFinanceBackup(backup).valid, true);

  backup.imports.profiles = [{ id: 'broken-profile', headers: ['date'] }];
  const preview = validateFinanceBackup(backup);
  assert.equal(preview.valid, false);
  assert(preview.errors.includes('CSV import profiles are incomplete.'));
});

test('backup preview summarizes a complete FinanceBackupV1 payload', () => {
  const backup = validBackup();
  const preview = validateFinanceBackup(backup);

  assert.equal(preview.valid, true);
  assert.equal(preview.version, 1);
  assert.equal(preview.currentVersion, 2);
  assert.equal(preview.appName, 'Finance Master');
  assert.equal(preview.exportedAt, backup.exportedAt);
  assert.deepEqual(preview.counts, {
    ledgerEvents: 1,
    accounts: 1,
    recurringCosts: 0,
    pipelineItems: 0,
    goals: 0,
    importBatches: 0,
    cachedQuotes: 0,
  });
  assert.equal(assertFinanceBackupV1(backup), backup);
});

test('backup metadata and age warnings preserve V2 compatibility', () => {
  const backup = migrateFinanceBackupV1(validBackup());
  backup.metadata = backupMetadata(backup, 'finance-master.local-first.v1', 'Finance Master');
  const preview = validateFinanceBackup(backup, { latestLocalEventAt: '2026-06-03T10:00:00.000Z' });

  assert.equal(preview.valid, true);
  assert.equal(preview.version, 2);
  assert.equal(preview.schemaLabel, 'finance-master.local-first.v1');
  assert.equal(preview.latestLocalEventAt, '2026-06-02T09:00:00.000Z');
  assert.deepEqual(preview.warnings, ['This backup is older than your newest local finance event.']);
  assert.equal(backup.metadata.eventCount, 1);
  assert.equal(backup.metadata.latestLocalEventAt, '2026-06-02T09:00:00.000Z');
});

test('backup validation rejects malformed, unsupported, and incomplete payloads without mutation', () => {
  const backup = validBackup();
  const before = structuredClone(backup);
  assert.equal(validateFinanceBackup(null).valid, false);
  assert.equal(validateFinanceBackup({ ...backup, version: 3 }).valid, false);
  assert.equal(validateFinanceBackup({ ...backup, version: 2 }).valid, false);
  assert.equal(validateFinanceBackup({ ...backup, review: undefined }).valid, false);
  assert.throws(() => assertFinanceBackupV1({ ...backup, ledger: [{ bad: true }] }), /Ledger event 1/);
  assert.deepEqual(backup, before);
});

test('V1 backups migrate to strict V2 goals and weekly review state', () => {
  const backup = validBackup();
  const migrated = migrateFinanceBackupV1(backup);

  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.goals, { goals: [] });
  assert.deepEqual(migrated.review, {
    lastReviewedAt: null,
    accountReconciliations: {},
    checklist: { recurringCosts: false, pipeline: false, signals: false },
    notes: '',
  });
  assert.equal(validateFinanceBackup(migrated).valid, true);
  assert.deepEqual(assertFinanceBackup(backup), migrated);
});

test('local data health reports corrupt Finance Master storage without throwing', () => {
  const health = inspectFinanceStorage({
    ledger: { present: true, value: 'not-json-ledger' },
    settings: { present: true, value: 'broken-settings' },
    ui: { present: false, value: undefined },
    review: { present: true, value: { lastReviewedAt: null } },
    goals: { present: true, value: { goals: [] } },
    imports: { present: true, value: { batches: 'broken' } },
    priceCache: { present: true, value: { quotes: {} } },
  });

  assert.equal(health.ok, false);
  assert.equal(health.eventCount, 0);
  assert.equal(health.latestEventAt, null);
  assert.deepEqual(health.issues.map((entry) => entry.key), ['ledger', 'settings', 'imports']);
  assert.equal(latestLedgerTimestamp(validBackup().ledger), '2026-06-02T09:00:00.000Z');
});

test('storage health distinguishes healthy, limited, and unavailable browser storage', () => {
  assert.deepEqual(evaluateStorageStatus({
    indexedDbAvailable: true,
    localStorageAvailable: true,
    quotaAvailable: true,
    quotaUsage: 10,
    quotaLimit: 100,
  }), {
    storageStatus: 'healthy',
    indexedDbAvailable: true,
    localStorageAvailable: true,
    quotaAvailable: true,
    quotaUsage: 10,
    quotaLimit: 100,
    privateModeWarning: false,
  });

  assert.equal(evaluateStorageStatus({
    indexedDbAvailable: true,
    localStorageAvailable: false,
    quotaAvailable: true,
  }).storageStatus, 'limited');
  assert.equal(evaluateStorageStatus({
    indexedDbAvailable: false,
    localStorageAvailable: false,
    quotaAvailable: false,
  }).storageStatus, 'unavailable');
});

test('migration guardrails report current schema and future schema safely', () => {
  const snapshot = {
    ledger: validBackup().ledger,
    settings: validBackup().financeSettings,
    ui: validBackup().uiSettings,
    review: migrateFinanceBackupV1(validBackup()).review,
    goals: { goals: [] },
    imports: { batches: [] },
    priceCache: { quotes: {} },
  };

  assert.equal(evaluateMigrationStatus('finance-master.local-first.v1'), 'current');
  assert.equal(evaluateMigrationStatus('finance-master.local-first.v99'), 'pending');
  assert.deepEqual(inspectRepositoryMigration(snapshot, 'finance-master.local-first.v1'), {
    status: 'current',
    safeToMigrate: true,
    errors: [],
  });
  assert.deepEqual(inspectRepositoryMigration({ ...snapshot, ledger: 'broken' }, 'finance-master.local-first.v1'), {
    status: 'failed',
    safeToMigrate: false,
    errors: ['Ledger events must be stored as a list.'],
  });
});

test('goal progress derives linked cash balances and respects treasury scope', () => {
  const goals = {
    goals: [
      {
        id: 'goal-buffer',
        name: 'Safety buffer',
        type: 'buffer',
        targetAmount: 10000,
        scope: 'shared',
        linkedAccountIds: ['cash-buffer'],
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
      {
        id: 'goal-studio',
        name: 'Studio runway',
        type: 'savings',
        targetAmount: 4000,
        scope: 'business',
        linkedAccountIds: ['cash-business'],
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-06-01T10:00:00.000Z',
      },
    ],
  };
  const accounts = [
    { id: 'cash-buffer', balance: 2500 },
    { id: 'cash-business', balance: 5000 },
  ];

  const personal = calculateGoalProgress(goals, accounts, 'personal');
  assert.equal(personal.length, 1);
  assert.equal(personal[0].currentAmount, 2500);
  assert.equal(personal[0].progressPercent, 25);

  const business = calculateGoalProgress(goals, accounts, 'business');
  assert.equal(business.length, 2);
  assert.equal(business[1].currentAmount, 5000);
  assert.equal(business[1].progressPercent, 100);
});

test('weekly review normalization keeps legacy reads useful and marks stale reviews due', () => {
  assert.deepEqual(normalizeReviewState({ lastReviewedAt: null }), {
    lastReviewedAt: null,
    accountReconciliations: {},
    checklist: {
      unresolvedItems: false,
      matchPayments: false,
      confirmObligations: false,
      reviewSignals: false,
      closeMonth: false,
    },
    notes: '',
    history: [],
  });
  assert.deepEqual(normalizeReviewState({
    lastReviewedAt: '2026-06-02T10:00:00.000Z',
    checklist: { recurringCosts: true, pipeline: true, signals: true },
  }).checklist, {
    unresolvedItems: true,
    matchPayments: false,
    confirmObligations: true,
    reviewSignals: true,
    closeMonth: false,
  });
  assert.equal(normalizeReviewState({
    lastReviewedAt: '2026-06-02T10:00:00.000Z',
    history: Array.from({ length: 25 }, (_, index) => ({
      id: `close-${index}`,
      monthKey: `2026-${String((index % 12) + 1).padStart(2, '0')}`,
      closedAt: '2026-06-02T10:00:00.000Z',
      notes: '',
      accountReconciliations: {},
      checklist: { unresolvedItems: true, matchPayments: true, confirmObligations: true, reviewSignals: true, closeMonth: true },
      summary: {
        monthKey: '2026-06',
        netMovement: 0,
        incomeReceived: 0,
        expensesPaid: 0,
        obligationsReviewed: 0,
        reserveMovements: 0,
        runwayNow: null,
        unresolvedItems: 0,
        protectedCash: 0,
        monthlyBurn: 0,
        mainRisk: 'No major close risk detected.',
        mainAction: 'Keep next month reviewed on the same cadence.',
      },
    })),
  }).history.length, 24);
  assert.equal(isWeeklyReviewDue(null, '2026-06-10T10:00:00.000Z'), true);
  assert.equal(isWeeklyReviewDue('2026-06-04T10:00:00.000Z', '2026-06-10T10:00:00.000Z'), false);
  assert.equal(isWeeklyReviewDue('2026-06-03T10:00:00.000Z', '2026-06-10T10:00:00.000Z'), true);
});

test('month close summary is deterministic and uses existing ledger evidence', () => {
  const forecast = buildFinanceForecast({
    nowIso: '2026-06-15T10:00:00.000Z',
    readModel: {
      pipelineDeals: [{ id: 'income-1', title: 'June close income', value: 1000, status: 'confirmed', probability: 0.9, expectedDateISO: '2026-06-20' }],
      reserveBuckets: [{ id: 'tax', targetAmount: 500, currentAmount: 300 }],
      debtAccounts: [{ id: 'card', minimumPaymentMonthly: 100 }],
    },
    snapshot: { monthlyBurn: 900, availableCash: 2000, confidenceScore: 0.8 },
    treasury: { availableCash: 2000, totalMonthlyBurn: 900 },
  });
  const summary = buildMonthCloseSummary({
    nowIso: '2026-06-15T10:00:00.000Z',
    readModel: {
      fiatAccounts: [{ id: 'reserve', reserved: true, bucket: 'tax' }],
      transactions: [
        { type: 'income.received', timestamp: '2026-06-02T10:00:00.000Z', signedAmount: 1500 },
        { type: 'expense.recorded', timestamp: '2026-06-05T10:00:00.000Z', signedAmount: -250, obligationId: 'rent' },
        { type: 'transfer', timestamp: '2026-06-08T10:00:00.000Z', signedAmount: 0, toAccountId: 'reserve' },
        { type: 'income.received', timestamp: '2026-05-30T10:00:00.000Z', signedAmount: 999 },
      ],
    },
    snapshot: { runwayMonths: 2.5, monthlyBurn: 900 },
    treasury: { protectedCash: 400 },
    reviewQueue: [{ id: 'unclear' }],
    forecast,
  });
  assert.equal(summary.monthKey, '2026-06');
  assert.equal(summary.netMovement, 1250);
  assert.equal(summary.incomeReceived, 1500);
  assert.equal(summary.expensesPaid, 250);
  assert.equal(summary.obligationsReviewed, 1);
  assert.equal(summary.reserveMovements, 1);
  assert.equal(summary.runwayNow, 2.5);
  assert.equal(summary.unresolvedItems, 1);
  assert.equal(summary.forecastHorizonDays, 30);
  assert.equal(summary.forecastExpectedCash, 2000);
  assert.equal(summary.forecastLowestCash, -2500);
  assert.match(summary.forecastWarning, /Expected forecast/);
  assert.equal(forecast.warnings.some((warning) => warning.includes('Reserve targets')), true);
  assert.match(summary.mainRisk, /Open items/);
});

test('finance forecast builds deterministic horizon scenarios from canonical inputs', () => {
  const forecast = buildFinanceForecast({
    nowIso: '2026-06-01T10:00:00.000Z',
    readModel: {
      pipelineDeals: [
        { id: 'confirmed', title: 'Confirmed work', value: 1000, status: 'confirmed', probability: 0.9, expectedDateISO: '2026-06-05' },
        { id: 'proposal', title: 'Proposal', value: 2000, status: 'proposal', probability: 0.4, expectedDateISO: '2026-07-01' },
        { id: 'lost', title: 'Lost', value: 9999, status: 'lost', probability: 1, expectedDateISO: '2026-06-05' },
      ],
      reserveBuckets: [{ id: 'tax', targetAmount: 1000, currentAmount: 250 }],
      debtAccounts: [{ id: 'card', minimumPaymentMonthly: 150 }],
    },
    snapshot: { availableCash: 3000, monthlyBurn: 1200, confidenceScore: 0.5 },
    treasury: { availableCash: 3000, totalMonthlyBurn: 1200 },
    horizons: [7, 30],
  });
  assert.equal(forecast.byHorizon['7'].conservative, 3620);
  assert.equal(forecast.byHorizon['7'].expected, 3620);
  assert.equal(forecast.byHorizon['30'].expected, 3500);
  assert.equal(forecast.byHorizon['30'].components.debtPaymentPlans, 150);
  assert.equal(forecast.byHorizon['30'].components.reserveTargetGap, 750);
  assert.equal(forecast.warnings.some((warning) => warning.includes('Forecast confidence is low')), true);
});
