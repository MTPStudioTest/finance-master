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
  calculateGoalProgress,
  isWeeklyReviewDue,
  normalizeReviewState,
} from '../src/finance/goals.js';

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

test('backup preview summarizes a complete FinanceBackupV1 payload', () => {
  const backup = validBackup();
  const preview = validateFinanceBackup(backup);

  assert.equal(preview.valid, true);
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
    checklist: { recurringCosts: false, pipeline: false, signals: false },
    notes: '',
  });
  assert.equal(isWeeklyReviewDue(null, '2026-06-10T10:00:00.000Z'), true);
  assert.equal(isWeeklyReviewDue('2026-06-04T10:00:00.000Z', '2026-06-10T10:00:00.000Z'), false);
  assert.equal(isWeeklyReviewDue('2026-06-03T10:00:00.000Z', '2026-06-10T10:00:00.000Z'), true);
});
