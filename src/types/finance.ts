export type FinanceScope = 'personal' | 'business' | 'shared';
export type FinanceScopeFilter = 'all' | FinanceScope;

export interface FinanceAccountReconciliation {
  accountId: string;
  balance: number;
  reviewedAt: string;
}

export interface FinanceReviewState {
  lastReviewedAt: string | null;
  accountReconciliations: Record<string, FinanceAccountReconciliation>;
  checklist: {
    recurringCosts: boolean;
    pipeline: boolean;
    signals: boolean;
  };
  notes: string;
}

export interface FinanceReviewStateV1 {
  lastReviewedAt: string | null;
}

export interface FinanceGoal {
  id: string;
  name: string;
  type: 'savings' | 'buffer';
  targetAmount: number;
  targetDate?: string;
  scope: FinanceScope;
  linkedAccountIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FinanceGoalState {
  goals: FinanceGoal[];
}

export interface FinanceGoalProgress extends FinanceGoal {
  currentAmount: number;
  progressPercent: number;
}

export interface FinanceImportBatch {
  id: string;
  importedAt: string;
  sourceFile: string;
  fingerprints: string[];
}

export interface FinanceImportState {
  batches: FinanceImportBatch[];
}

export interface FinancePriceQuote {
  symbol: string;
  currency: string;
  price: number;
  source: string;
  quotedAt: string;
  manualOverride?: boolean;
}

export interface FinancePriceCache {
  quotes: Record<string, FinancePriceQuote>;
}

export interface FinanceBackupV1 {
  version: 1;
  exportedAt: string;
  ledger: FinanceEvent[];
  financeSettings: FinanceSettings;
  uiSettings: FinanceUiSettings;
  review: FinanceReviewStateV1;
  imports: FinanceImportState;
  prices: FinancePriceCache;
}

export interface FinanceBackupV2 {
  version: 2;
  exportedAt: string;
  metadata?: {
    appName: string;
    schemaLabel: string;
    backupVersion: number;
    exportedAt: string;
    eventCount: number;
    latestLocalEventAt: string | null;
  };
  ledger: FinanceEvent[];
  financeSettings: FinanceSettings;
  uiSettings: FinanceUiSettings;
  review: FinanceReviewState;
  goals: FinanceGoalState;
  imports: FinanceImportState;
  prices: FinancePriceCache;
}

export type FinanceBackup = FinanceBackupV1 | FinanceBackupV2;

export interface CsvTransactionRow {
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  scope: FinanceScope;
  fingerprint: string;
}

export interface CsvImportSummary {
  batchId: string;
  imported: number;
  duplicates: number;
}

export interface CsvColumnMapping {
  date: string;
  description: string;
  amount?: string;
  debit?: string;
  credit?: string;
  category?: string;
  scope?: string;
}

export interface CsvImportPreview {
  rows: CsvTransactionRow[];
  rejected: Array<{ rowNumber: number; reason: string }>;
  duplicates: CsvTransactionRow[];
  sourceFile: string;
}

export interface FinanceBackupPreview {
  valid: boolean;
  version?: number;
  currentVersion?: number;
  schemaLabel?: string;
  appName?: string;
  exportedAt?: string;
  latestLocalEventAt?: string;
  counts: Record<string, number>;
  errors: string[];
  warnings?: string[];
}

export interface FinanceDataHealthIssue {
  key: string;
  label: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface FinanceDataHealth {
  ok: boolean;
  issues: FinanceDataHealthIssue[];
  eventCount: number;
  latestEventAt: string | null;
  checkedAt: string;
  storageKeys: string[];
}

export interface LedgerRepository {
  get(): FinanceEvent[];
  set(events: FinanceEvent[]): void;
  remove(): void;
}

export interface SettingsRepository<T> {
  get(fallback: T): T;
  set(value: T): void;
  remove(): void;
}

export interface PriceProvider {
  id: string;
  getQuotes(symbols: string[], currency: string): Promise<FinancePriceQuote[]>;
}
