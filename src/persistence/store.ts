import { createDemoDrafts } from '../data/demo-data';
import { FINANCE_STORAGE_KEYS, STORAGE_KEYS } from '../settings/storage-keys';
import {
  CURRENT_BACKUP_VERSION,
  DATA_SCHEMA_LABEL,
  FINANCE_APP_NAME,
} from '../settings/data-version.js';
import {
  initializeRepositories,
  repositoryGet,
  repositoryRemove,
  repositorySet,
} from './repositories';
import {
  backupMetadata,
  evaluateStorageStatus,
  inspectBrowserStorageAvailability,
  inspectFinanceStorage,
} from './data-health.js';
import { inspectRepositoryMigration } from './schema-migration.js';
import type {
  CsvColumnMapping,
  CsvImportSummary,
  CsvTransactionRow,
  FinanceDataHealth,
  FinanceBackupV2,
  FinanceGoal,
  FinanceGoalProgress,
  FinanceGoalState,
  FinanceImportProfile,
  FinanceImportState,
  FinancePriceCache,
  FinancePriceQuote,
  FinanceReviewState,
  FinanceScope,
  FinanceScopeFilter,
} from '../types/finance';
import { createPriceProvider } from '../integrations/crypto-prices';
import { assertFinanceBackup, validateFinanceBackup } from './backup-validation.js';
import { calculateGoalProgress, normalizeGoalState, normalizeReviewState } from '../finance/goals.js';
import { buildMonthCloseSummary } from '../finance/month-close.js';
import { buildFinanceForecast } from '../finance/forecast.js';
import type { BrowserStorageStatus } from './data-health.js';
import type { FinanceMigrationStatus } from './schema-migration.js';

const DEFAULT_FINANCE_SETTINGS: FinanceSettings = {
  baseCurrency: 'EUR',
  forecastDays: 90,
};

const DEFAULT_UI_SETTINGS: FinanceUiSettings = {
  appearance: 'bright',
  reducedMotion: false,
  scopeFilter: 'all',
  walletPriceSource: 'manual',
  scenario: {
    marketMajors: 0,
    burnDelta: 0,
    probFloor: 50,
  },
};

const DEFAULT_REVIEW_STATE: FinanceReviewState = {
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
};

const DEFAULT_GOAL_STATE: FinanceGoalState = {
  goals: [],
};

const DEFAULT_IMPORT_STATE: FinanceImportState = {
  batches: [],
  profiles: [],
};

const DEFAULT_PRICE_CACHE: FinancePriceCache = {
  quotes: {},
};

const DEFAULT_BACKUP_META = {
  lastBackupAt: null as string | null,
};

let browserStorageStatus: BrowserStorageStatus = evaluateStorageStatus({
  indexedDbAvailable: false,
  localStorageAvailable: false,
  quotaAvailable: false,
});
let migrationStatus: FinanceMigrationStatus = 'current';

const MISSING_STORAGE_VALUE = Object.freeze({ __financeMasterMissing: true });

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getJson<T>(key: string, fallback: T): T {
  return repositoryGet(key, fallback);
}

function setJson(key: string, value: unknown): void {
  repositorySet(key, value);
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function appearance(value: unknown, fallback: FinanceUiSettings['appearance'] = 'bright'): FinanceUiSettings['appearance'] {
  return value === 'midnight' || value === 'bright' || value === 'aurora' ? value : fallback;
}

function scope(value: unknown, fallback: FinanceScope = 'shared'): FinanceScope {
  return value === 'personal' || value === 'business' || value === 'shared' ? value : fallback;
}

function scopeFilter(value: unknown, fallback: FinanceScopeFilter = 'all'): FinanceScopeFilter {
  return value === 'all' ? value : scope(value, fallback === 'all' ? 'shared' : fallback);
}

function entityId(prefix: string): string {
  return `${prefix}-${window.FinanceEvents?.createId?.() || Date.now().toString(36)}`;
}

function importHeaderSignature(headers: unknown): string {
  return Array.isArray(headers)
    ? headers.map((header) => String(header || '').trim().toLowerCase()).filter(Boolean).join('|')
    : '';
}

function normalizeCsvMapping(value: unknown): CsvColumnMapping {
  const mapping = isObject(value) ? value : {};
  return {
    date: String(mapping.date || ''),
    description: String(mapping.description || ''),
    amount: String(mapping.amount || ''),
    debit: String(mapping.debit || ''),
    credit: String(mapping.credit || ''),
    category: String(mapping.category || ''),
    scope: String(mapping.scope || ''),
  };
}

function normalizeImportState(value: unknown): FinanceImportState {
  const state = isObject(value) ? value : {};
  const batches = Array.isArray(state.batches)
    ? state.batches.filter(isObject).map((batch) => ({
      id: String(batch.id || ''),
      importedAt: String(batch.importedAt || ''),
      sourceFile: String(batch.sourceFile || ''),
      fingerprints: Array.isArray(batch.fingerprints) ? batch.fingerprints.map(String).filter(Boolean) : [],
      accountId: String(batch.accountId || '') || undefined,
      importedCount: Number.isFinite(Number(batch.importedCount)) ? Number(batch.importedCount) : undefined,
      duplicateCount: Number.isFinite(Number(batch.duplicateCount)) ? Number(batch.duplicateCount) : undefined,
      duplicateImportedCount: Number.isFinite(Number(batch.duplicateImportedCount)) ? Number(batch.duplicateImportedCount) : undefined,
      rejectedCount: Number.isFinite(Number(batch.rejectedCount)) ? Number(batch.rejectedCount) : undefined,
      duplicatePolicy: batch.duplicatePolicy === 'import' ? 'import' as const : (batch.duplicatePolicy === 'skip' ? 'skip' as const : undefined),
      incomeTotal: Number.isFinite(Number(batch.incomeTotal)) ? Number(batch.incomeTotal) : undefined,
      expenseTotal: Number.isFinite(Number(batch.expenseTotal)) ? Number(batch.expenseTotal) : undefined,
      dateFrom: /^\d{4}-\d{2}-\d{2}$/.test(String(batch.dateFrom || '')) ? String(batch.dateFrom) : undefined,
      dateTo: /^\d{4}-\d{2}-\d{2}$/.test(String(batch.dateTo || '')) ? String(batch.dateTo) : undefined,
    })).filter((batch) => batch.id && batch.importedAt && batch.sourceFile)
    : [];
  const profiles = Array.isArray(state.profiles)
    ? state.profiles.filter(isObject).map((profile) => {
      const headers = Array.isArray(profile.headers) ? profile.headers.map(String).filter(Boolean) : [];
      return {
        id: String(profile.id || ''),
        name: String(profile.name || 'CSV mapping'),
        headers,
        mapping: normalizeCsvMapping(profile.mapping),
        accountId: String(profile.accountId || '') || undefined,
        defaultCategory: String(profile.defaultCategory || 'uncategorized'),
        defaultScope: scope(profile.defaultScope, 'business'),
        createdAt: String(profile.createdAt || profile.updatedAt || new Date(0).toISOString()),
        updatedAt: String(profile.updatedAt || profile.createdAt || new Date(0).toISOString()),
      };
    }).filter((profile) => profile.id && importHeaderSignature(profile.headers))
    : [];
  const lastProfileId = String(state.lastProfileId || '');
  return {
    batches,
    profiles,
    ...(lastProfileId ? { lastProfileId } : {}),
  };
}

function toTransactionIso(date: string): string {
  return window.FinanceDates?.dateOnlyToNoonIso?.(date) || new Date().toISOString();
}

function eventMatchesScope(event: FinanceEvent, filter: FinanceScopeFilter): boolean {
  if (filter === 'all') return true;
  const eventScope = scope(event.metadata?.scope);
  return eventScope === filter || eventScope === 'shared';
}

function emitFinanceUpdated(snapshot: Record<string, unknown>, source: string): void {
  window.dispatchEvent(new CustomEvent('finance:updated', {
    detail: {
      snapshot: clone(snapshot),
      context: { source },
    },
  }));
}

const cachedContexts = new Map<FinanceScopeFilter, FinanceContext>();

function invalidate(): void {
  cachedContexts.clear();
}

function getLedgerRaw(): FinanceEvent[] {
  const parsed = getJson<unknown>(STORAGE_KEYS.ledger, []);
  return Array.isArray(parsed) ? parsed as FinanceEvent[] : [];
}

function saveLedgerRaw(events: FinanceEvent[]): void {
  setJson(STORAGE_KEYS.ledger, events);
  invalidate();
}

function rawStorageEntry(key: string): { present: boolean; value: unknown } {
  const value = repositoryGet(key, MISSING_STORAGE_VALUE);
  const present = !(isObject(value) && value.__financeMasterMissing === true);
  return { present, value: present ? value : undefined };
}

function financeTimestamp(entityId: string, requestedTimestamp?: unknown): string {
  const requested = Date.parse(String(requestedTimestamp || ''));
  let next = Number.isFinite(requested) ? requested : Date.now();
  const latest = Store.getFinanceLedger()
    .filter((event) => String(event.related_entity_id || '') === entityId)
    .reduce((max, event) => Math.max(max, Date.parse(event.timestamp) || 0), 0);
  if (latest >= next) next = latest + 1;
  return new Date(next).toISOString();
}

function defaultCashAccountDraft(input: {
  currency: string;
  timestamp: string;
  scope: FinanceScope;
}): FinanceEventDraft {
  return {
    type: 'asset.account_set',
    amount: 0,
    currency: input.currency,
    timestamp: input.timestamp,
    related_entity_id: entityId('cash'),
    metadata: {
      name: 'Operating cash',
      balance: 0,
      active: true,
      scope: input.scope,
      bucket: 'available',
      reserved: false,
      source: 'first-transaction-default-account',
    },
  };
}

function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function transactionDate(value: unknown): string {
  return window.FinanceDates?.toDateOnly?.(value) || String(value || '').slice(0, 10);
}

function reverseMatching(
  id: string,
  types: string[],
  source: string,
  predicate?: (event: FinanceEvent) => boolean,
): FinanceEvent[] {
  const currency = Store.getFinanceSettings().baseCurrency;
  const timestamp = financeTimestamp(id);
  const drafts = Store.getActiveFinanceEvents()
    .filter((event) => types.includes(event.type))
    .filter((event) => predicate ? predicate(event) : String(event.related_entity_id || '') === id)
    .map((event) => ({
      type: 'finance.event_reversed',
      amount: 0,
      currency: event.currency || currency,
      timestamp,
      related_entity_id: event.id,
      metadata: {
        entity_id: id,
        reason: source,
        reversed_event_id: event.id,
      },
    }));
  return drafts.length ? Store.appendFinanceEvents(drafts, { source }) : [];
}

export const Store = {
  async initialize(): Promise<void> {
    await initializeRepositories([
      STORAGE_KEYS.ledger,
      STORAGE_KEYS.settings,
      STORAGE_KEYS.ui,
      STORAGE_KEYS.review,
      STORAGE_KEYS.goals,
      STORAGE_KEYS.imports,
      STORAGE_KEYS.priceCache,
      STORAGE_KEYS.backupMeta,
      STORAGE_KEYS.demoSeed,
    ]);
    browserStorageStatus = await inspectBrowserStorageAvailability(window);
    migrationStatus = inspectRepositoryMigration({
      ledger: rawStorageEntry(STORAGE_KEYS.ledger).value,
      settings: rawStorageEntry(STORAGE_KEYS.settings).value,
      ui: rawStorageEntry(STORAGE_KEYS.ui).value,
      review: rawStorageEntry(STORAGE_KEYS.review).value,
      goals: rawStorageEntry(STORAGE_KEYS.goals).value,
      imports: rawStorageEntry(STORAGE_KEYS.imports).value,
      priceCache: rawStorageEntry(STORAGE_KEYS.priceCache).value,
    }, DATA_SCHEMA_LABEL).status;
  },

  getFinanceSettings(): FinanceSettings {
    const parsed = getJson<unknown>(STORAGE_KEYS.settings, DEFAULT_FINANCE_SETTINGS);
    if (!isObject(parsed)) return clone(DEFAULT_FINANCE_SETTINGS);
    return {
      baseCurrency: String(parsed.baseCurrency || DEFAULT_FINANCE_SETTINGS.baseCurrency).trim().toUpperCase() || 'EUR',
      forecastDays: Math.max(1, Math.floor(Number(parsed.forecastDays) || DEFAULT_FINANCE_SETTINGS.forecastDays)),
    };
  },

  saveFinanceSettings(settings: Partial<FinanceSettings>): FinanceSettings {
    const current = this.getFinanceSettings();
    const next = {
      baseCurrency: String(settings.baseCurrency || current.baseCurrency).trim().toUpperCase() || current.baseCurrency,
      forecastDays: Math.max(1, Math.floor(Number(settings.forecastDays) || current.forecastDays)),
    };
    setJson(STORAGE_KEYS.settings, next);
    invalidate();
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'saveFinanceSettings');
    return next;
  },

  getUiSettings(): FinanceUiSettings {
    const parsed = getJson<unknown>(STORAGE_KEYS.ui, DEFAULT_UI_SETTINGS);
    if (!isObject(parsed)) return clone(DEFAULT_UI_SETTINGS);
    const rawScenario = isObject(parsed.scenario) ? parsed.scenario : {};
    return {
      appearance: appearance(parsed.appearance),
      reducedMotion: parsed.reducedMotion === true,
      scopeFilter: scopeFilter(parsed.scopeFilter),
      walletPriceSource: parsed.walletPriceSource === 'coingecko' ? 'coingecko' : 'manual',
      scenario: {
        marketMajors: clamp(rawScenario.marketMajors, -50, 50, 0),
        burnDelta: clamp(rawScenario.burnDelta, -30, 30, 0),
        probFloor: clamp(rawScenario.probFloor, 0, 100, 50),
      },
    };
  },

  saveUiSettings(settings: Partial<FinanceUiSettings>): FinanceUiSettings {
    const current = this.getUiSettings();
    const rawScenario = settings.scenario || current.scenario;
    const next: FinanceUiSettings = {
      appearance: appearance(settings.appearance, current.appearance),
      reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : current.reducedMotion,
      scopeFilter: scopeFilter(settings.scopeFilter, current.scopeFilter),
      walletPriceSource: settings.walletPriceSource === 'coingecko' ? 'coingecko' : (settings.walletPriceSource === 'manual' ? 'manual' : current.walletPriceSource),
      scenario: {
        marketMajors: clamp(rawScenario.marketMajors, -50, 50, current.scenario.marketMajors),
        burnDelta: clamp(rawScenario.burnDelta, -30, 30, current.scenario.burnDelta),
        probFloor: clamp(rawScenario.probFloor, 0, 100, current.scenario.probFloor),
      },
    };
    setJson(STORAGE_KEYS.ui, next);
    window.dispatchEvent(new CustomEvent('finance:ui-updated', { detail: clone(next) }));
    return next;
  },

  getFinanceLedger(): FinanceEvent[] {
    const events = getLedgerRaw();
    return window.FinanceEvents?.sortFinancialEvents
      ? clone(window.FinanceEvents.sortFinancialEvents(events))
      : clone(events);
  },

  getActiveFinanceEvents(): FinanceEvent[] {
    const events = getLedgerRaw();
    return window.FinanceLedger?.getActiveEvents
      ? clone(window.FinanceLedger.getActiveEvents(events))
      : clone(events);
  },

  computeFinanceContext(force = false, filter: FinanceScopeFilter = 'all'): FinanceContext {
    if (!force && cachedContexts.has(filter)) return clone(cachedContexts.get(filter) as FinanceContext);
    if (!window.FinanceCompute?.computeFinancialContext) {
      throw new Error('Finance compute module is unavailable.');
    }
    const settings = this.getFinanceSettings();
    const events = getLedgerRaw().filter((event) => eventMatchesScope(event, filter));
    const context = window.FinanceCompute.computeFinancialContext(events, {
      ...settings,
      nowIso: new Date().toISOString(),
    });
    cachedContexts.set(filter, context);
    return clone(context);
  },

  getFinancialSnapshot(force = false, filter: FinanceScopeFilter = 'all'): Record<string, any> {
    return this.computeFinanceContext(force, filter).snapshot;
  },

  getFinancialReadModel(force = false, filter: FinanceScopeFilter = 'all'): Record<string, any> {
    return this.computeFinanceContext(force, filter).readModel;
  },

  appendFinanceEvent(draft: FinanceEventDraft, context: Record<string, unknown> = {}): FinanceEvent | null {
    return this.appendFinanceEvents([draft], context)[0] || null;
  },

  appendFinanceEvents(drafts: FinanceEventDraft[], context: Record<string, unknown> = {}): FinanceEvent[] {
    if (!drafts.length) return [];
    if (!window.FinanceLedger?.appendEvents) throw new Error('Finance ledger module is unavailable.');
    const nowIso = new Date().toISOString();
    const settings = this.getFinanceSettings();
    const result = window.FinanceLedger.appendEvents(getLedgerRaw(), drafts, {
      ...settings,
      nowIso,
    }, {
      nowIso,
      allowApproximateTimestamp: false,
    });
    saveLedgerRaw(result.events);
    emitFinanceUpdated(this.getFinancialSnapshot(true), String(context.source || 'appendFinanceEvents'));
    return clone(result.appended);
  },

  reverseFinanceEvent(id: string, reason = 'undo'): FinanceEvent | null {
    if (!window.FinanceLedger?.reverseEvent) throw new Error('Finance ledger module is unavailable.');
    const nowIso = new Date().toISOString();
    const settings = this.getFinanceSettings();
    const result = window.FinanceLedger.reverseEvent(getLedgerRaw(), id, reason, {
      ...settings,
      nowIso,
    }, { nowIso });
    saveLedgerRaw(result.events);
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'reverseFinanceEvent');
    return clone(result.appended[0] || null);
  },

  reverseTransaction(id: string, reason = 'ledger.transaction.reverse'): FinanceEvent[] {
    const transaction = (this.getFinancialReadModel().transactions || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(id || '') || String(entry.transactionEntityId || '') === String(id || ''));
    if (!transaction) throw new Error('This transaction could not be found.');
    const transactionEventId = String(transaction.id);
    const transactionEntityId = String(transaction.transactionEntityId || '');
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(transactionEntityId || transactionEventId);
    const drafts = this.getActiveFinanceEvents()
      .filter((event) => String(event.id) === transactionEventId
        || (!!transactionEntityId && String(event.metadata?.transactionId || '') === transactionEntityId))
      .map((event) => ({
        type: 'finance.event_reversed',
        amount: 0,
        currency: event.currency || currency,
        timestamp,
        related_entity_id: event.id,
        metadata: {
          entity_id: transactionEntityId || transactionEventId,
          reason,
          reversed_event_id: event.id,
        },
      }));
    return drafts.length ? this.appendFinanceEvents(drafts, { source: 'reverseTransaction' }) : [];
  },

  recordTransaction(input: {
    description: string;
    amount: number;
    timestamp: string;
    accountId: string;
    categoryId?: string;
    scope?: FinanceScope;
    source?: string;
    importBatchId?: string;
    fingerprint?: string;
    sourceFile?: string;
    obligationId?: string;
    obligationDueDate?: string;
    obligationTitle?: string;
  }): FinanceEvent[] {
    const account = (this.getFinancialReadModel().fiatAccounts || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(input.accountId || ''));
    const amount = Number(input.amount);
    if (!account) throw new Error('Choose a cash account before saving this transaction.');
    if (!Number.isFinite(amount) || amount === 0) throw new Error('Transaction amount must be non-zero.');
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(`transaction-${input.accountId}`, input.timestamp);
    const transactionId = entityId('transaction');
    const transactionScope = scope(input.scope, scope(account.scope));
    const balance = Math.round(((Number(account.balance) || 0) + amount) * 100) / 100;
    const sharedMetadata = {
      accountId: String(account.id),
      accountName: String(account.name || 'Account'),
      categoryId: String(input.categoryId || 'uncategorized'),
      scope: transactionScope,
      source: String(input.source || 'manual'),
      importBatchId: input.importBatchId || undefined,
      fingerprint: input.fingerprint || undefined,
      sourceFile: input.sourceFile || undefined,
      obligationId: input.obligationId || undefined,
      obligationDueDate: input.obligationDueDate || undefined,
      obligationTitle: input.obligationTitle || undefined,
    };
    return this.appendFinanceEvents([
      {
        type: amount > 0 ? 'income.received' : 'expense.recorded',
        amount: Math.abs(amount),
        currency,
        timestamp,
        related_entity_id: transactionId,
        metadata: {
          ...sharedMetadata,
          description: input.description,
        },
      },
      {
        type: 'asset.account_set',
        amount: balance,
        currency,
        timestamp: financeTimestamp(String(account.id), timestamp),
        related_entity_id: String(account.id),
        metadata: {
          name: account.name,
          balance,
          active: true,
          scope: transactionScope,
          bucket: account.bucket,
          reserved: account.reserved,
          transactionId,
          source: sharedMetadata.source,
          importBatchId: sharedMetadata.importBatchId,
        },
      },
    ], { source: input.source || 'recordTransaction' });
  },

  recordLedgerTransaction(input: {
    type: 'income' | 'expense' | 'adjustment';
    description: string;
    amount: number;
    timestamp: string;
    accountId: string;
    categoryId?: string;
    scope?: FinanceScope;
    direction?: 'increase' | 'decrease';
  }): FinanceEvent[] {
    const ledgerType = String(input.type || '').toLowerCase();
    const amount = Math.abs(Number(input.amount));
    if (!['income', 'expense', 'adjustment'].includes(ledgerType)) throw new Error('Choose income, expense, or adjustment.');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Transaction amount must be positive.');
    const readModel = this.getFinancialReadModel();
    const accounts = readModel.fiatAccounts || [];
    const requestedAccountId = String(input.accountId || '');
    const fallbackScope = scope(input.scope, 'business');
    if (!requestedAccountId && accounts.length === 0) {
      const currency = this.getFinanceSettings().baseCurrency;
      const timestamp = financeTimestamp('first-transaction-account', input.timestamp);
      const accountDraft = defaultCashAccountDraft({ currency, timestamp, scope: fallbackScope });
      const defaultAccountId = String(accountDraft.related_entity_id || '');
      const signedAmount = ledgerType === 'income'
        ? amount
        : ledgerType === 'expense'
          ? -amount
          : input.direction === 'decrease'
            ? -amount
            : amount;
      const categoryId = input.categoryId || (ledgerType === 'income' ? 'client-income' : ledgerType === 'adjustment' ? 'adjustment' : 'uncategorized');
      const transactionId = entityId(ledgerType === 'adjustment' ? 'adjustment' : 'transaction');
      const transactionDraft: FinanceEventDraft = {
        type: ledgerType === 'income' ? 'income.received' : ledgerType === 'expense' ? 'expense.recorded' : 'cash.adjusted',
        amount,
        currency,
        timestamp: financeTimestamp(transactionId, timestamp),
        related_entity_id: transactionId,
        metadata: {
          ledgerType: ledgerType === 'adjustment' ? 'adjustment' : undefined,
          direction: ledgerType === 'adjustment' ? (input.direction === 'decrease' ? 'decrease' : 'increase') : undefined,
          description: input.description,
          accountId: defaultAccountId,
          accountName: 'Operating cash',
          categoryId,
          scope: fallbackScope,
          source: 'manual-ledger',
        },
      };
      const balanceDraft: FinanceEventDraft = {
        type: 'asset.account_set',
        amount: signedAmount,
        currency,
        timestamp: financeTimestamp(defaultAccountId, timestamp),
        related_entity_id: defaultAccountId,
        metadata: {
          name: 'Operating cash',
          balance: signedAmount,
          active: true,
          scope: fallbackScope,
          bucket: 'available',
          reserved: false,
          transactionId,
          source: 'manual-ledger',
        },
      };
      return this.appendFinanceEvents([accountDraft, transactionDraft, balanceDraft], { source: 'recordLedgerTransaction.firstAccount' });
    }
    if (ledgerType === 'income') {
      return this.recordTransaction({
        description: input.description,
        amount,
        timestamp: input.timestamp,
        accountId: input.accountId,
        categoryId: input.categoryId || 'client-income',
        scope: input.scope,
        source: 'manual-ledger',
      });
    }
    if (ledgerType === 'expense') {
      return this.recordTransaction({
        description: input.description,
        amount: -amount,
        timestamp: input.timestamp,
        accountId: input.accountId,
        categoryId: input.categoryId || 'uncategorized',
        scope: input.scope,
        source: 'manual-ledger',
      });
    }
    const account = (this.getFinancialReadModel().fiatAccounts || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(input.accountId || ''));
    if (!account) throw new Error('Choose a cash account before saving this adjustment.');
    const direction = input.direction === 'decrease' ? 'decrease' : 'increase';
    const effect = direction === 'decrease' ? -amount : amount;
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(`adjustment-${input.accountId}`, input.timestamp);
    const transactionId = entityId('adjustment');
    const transactionScope = scope(input.scope, scope(account.scope));
    const balance = Math.round(((Number(account.balance) || 0) + effect) * 100) / 100;
    return this.appendFinanceEvents([
      {
        type: 'cash.adjusted',
        amount,
        currency,
        timestamp,
        related_entity_id: transactionId,
        metadata: {
          ledgerType: 'adjustment',
          direction,
          description: input.description,
          accountId: String(account.id),
          accountName: String(account.name || 'Account'),
          categoryId: String(input.categoryId || 'adjustment'),
          scope: transactionScope,
          source: 'manual-ledger',
        },
      },
      {
        type: 'asset.account_set',
        amount: balance,
        currency,
        timestamp: financeTimestamp(String(account.id), timestamp),
        related_entity_id: String(account.id),
        metadata: {
          name: account.name,
          balance,
          active: true,
          scope: scope(account.scope),
          bucket: account.bucket,
          reserved: account.reserved,
          transactionId,
          source: 'manual-ledger',
        },
      },
    ], { source: 'recordLedgerTransaction.adjustment' });
  },

  recordTransfer(input: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    timestamp: string;
    categoryId?: string;
    scope?: FinanceScope;
    description?: string;
  }): FinanceEvent[] {
    const readModel = this.getFinancialReadModel();
    const from = (readModel.fiatAccounts || []).find((entry: Record<string, unknown>) => String(entry.id) === String(input.fromAccountId || ''));
    const to = (readModel.fiatAccounts || []).find((entry: Record<string, unknown>) => String(entry.id) === String(input.toAccountId || ''));
    const amount = Math.abs(Number(input.amount));
    if (!from || !to) throw new Error('Choose both transfer accounts.');
    if (String(from.id) === String(to.id)) throw new Error('Transfer accounts must be different.');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Transfer amount must be positive.');
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(`transfer-${from.id}-${to.id}`, input.timestamp);
    const transferId = entityId('transfer');
    const transferScope = scope(input.scope, scope(from.scope));
    const fromBalance = Math.round(((Number(from.balance) || 0) - amount) * 100) / 100;
    const toBalance = Math.round(((Number(to.balance) || 0) + amount) * 100) / 100;
    return this.appendFinanceEvents([
      {
        type: 'transfer.recorded',
        amount,
        currency,
        timestamp,
        related_entity_id: transferId,
        metadata: {
          ledgerType: 'transfer',
          direction: 'transfer',
          description: input.description || `Transfer from ${String(from.name || 'account')} to ${String(to.name || 'account')}`,
          fromAccountId: String(from.id),
          fromAccountName: String(from.name || 'From account'),
          toAccountId: String(to.id),
          toAccountName: String(to.name || 'To account'),
          accountId: String(from.id),
          accountName: String(from.name || 'From account'),
          categoryId: String(input.categoryId || 'transfer'),
          scope: transferScope,
          source: 'manual-ledger',
        },
      },
      {
        type: 'asset.account_set',
        amount: fromBalance,
        currency,
        timestamp: financeTimestamp(String(from.id), timestamp),
        related_entity_id: String(from.id),
        metadata: { name: from.name, balance: fromBalance, active: true, scope: scope(from.scope), bucket: from.bucket, reserved: from.reserved, transactionId: transferId, source: 'manual-ledger' },
      },
      {
        type: 'asset.account_set',
        amount: toBalance,
        currency,
        timestamp: financeTimestamp(String(to.id), timestamp),
        related_entity_id: String(to.id),
        metadata: { name: to.name, balance: toBalance, active: true, scope: scope(to.scope), bucket: to.bucket, reserved: to.reserved, transactionId: transferId, source: 'manual-ledger' },
      },
    ], { source: 'recordTransfer' });
  },

  reviewObligation(input: {
    id: string;
    status: 'paid' | 'deferred' | 'needs_review';
    accountId?: string;
    paidAt?: string;
    deferredUntil?: string;
    amount?: number;
    notes?: string;
  }): FinanceEvent[] {
    const treasury = this.computeFinanceContext(true).treasury || {};
    const obligation = ((treasury.obligations || []) as Array<Record<string, unknown>>)
      .find((entry) => String(entry.id || '') === String(input.id || ''));
    if (!obligation) throw new Error('This obligation could not be found.');
    const status = input.status;
    if (status !== 'paid' && status !== 'deferred' && status !== 'needs_review') {
      throw new Error('Choose a valid obligation status.');
    }
    const currency = this.getFinanceSettings().baseCurrency;
    const amount = Math.abs(Number(input.amount ?? obligation.amount));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Obligation amount must be positive.');
    let transactionId = '';
    let accountId = '';
    let accountName = '';
    const scopeValue = scope(obligation.scope);
    if (status === 'paid') {
      if (!input.accountId) throw new Error('Choose the account that paid this obligation.');
      const account = (this.getFinancialReadModel().fiatAccounts || [])
        .find((entry: Record<string, unknown>) => String(entry.id) === String(input.accountId));
      if (!account) throw new Error('Choose a valid payment account.');
      accountId = String(account.id);
      accountName = String(account.name || 'Account');
      const transactionEvents = this.recordTransaction({
        description: `Paid ${String(obligation.title || 'obligation')}`,
        amount: -amount,
        timestamp: toTransactionIso(String(input.paidAt || obligation.dueDate || new Date().toISOString()).slice(0, 10)),
        accountId,
        categoryId: 'obligation',
        scope: scopeValue,
        source: 'obligation.review',
        obligationId: String(obligation.id),
        obligationDueDate: String(obligation.dueDate || ''),
        obligationTitle: String(obligation.title || 'Obligation'),
      });
      transactionId = String(transactionEvents[0]?.related_entity_id || transactionEvents[0]?.id || '');
    }
    if (status === 'deferred' && !input.deferredUntil) {
      throw new Error('Choose a new due date for this deferred obligation.');
    }
    const timestamp = financeTimestamp(String(input.id));
    const review = this.appendFinanceEvent({
      type: 'obligation.reviewed',
      amount,
      currency,
      timestamp,
      related_entity_id: String(input.id),
      metadata: {
        status,
        title: String(obligation.title || 'Obligation'),
        dueDate: String(obligation.dueDate || ''),
        originalDueDate: String(obligation.originalDueDate || obligation.dueDate || ''),
        paidAt: status === 'paid' ? toTransactionIso(String(input.paidAt || obligation.dueDate || new Date().toISOString()).slice(0, 10)) : undefined,
        deferredUntil: status === 'deferred' ? input.deferredUntil : undefined,
        accountId,
        accountName,
        transactionId,
        scope: scopeValue,
        notes: input.notes || '',
      },
    }, { source: 'reviewObligation' });
    return review ? [review] : [];
  },

  reviewTransaction(input: {
    id: string;
    categoryId: string;
    scope?: FinanceScope;
    notes?: string;
    linkedIncomeId?: string;
    linkedReserveId?: string;
    linkedDebtId?: string;
  }): FinanceEvent[] {
    const readModel = this.getFinancialReadModel();
    const transaction = (readModel.transactions || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(input.id || '') || String(entry.transactionEntityId || '') === String(input.id || ''));
    if (!transaction) throw new Error('This transaction could not be found.');
    const categoryId = String(input.categoryId || '').trim();
    if (!categoryId) throw new Error('Choose a category for this transaction.');
    const currency = this.getFinanceSettings().baseCurrency;
    const transactionId = String(transaction.id || input.id);
    const events = this.appendFinanceEvents([{
      type: 'transaction.reviewed',
      amount: Math.abs(Number(transaction.amount) || 0),
      currency,
      timestamp: financeTimestamp(transactionId),
      related_entity_id: transactionId,
      metadata: {
        categoryId,
        scope: scope(input.scope, scope(transaction.scope)),
        reviewStatus: 'reviewed',
        notes: String(input.notes || ''),
        linkedIncomeId: String(input.linkedIncomeId || '').trim(),
        linkedReserveId: String(input.linkedReserveId || '').trim(),
        linkedDebtId: String(input.linkedDebtId || '').trim(),
      },
    }], { source: 'reviewTransaction' });
    const linkedIncomeId = String(input.linkedIncomeId || '').trim();
    if (linkedIncomeId && String(transaction.type) === 'income.received') {
      const deal = (readModel.pipelineDeals || [])
        .find((entry: Record<string, unknown>) => String(entry.id || '') === linkedIncomeId);
      if (deal) {
        events.push(...this.appendFinanceEvents([{
          type: 'pipeline.stage_changed',
          amount: Number(deal.value) || Math.abs(Number(transaction.amount) || 0),
          currency,
          timestamp: financeTimestamp(linkedIncomeId),
          related_entity_id: linkedIncomeId,
          metadata: {
            title: String(deal.title || 'Income'),
            status: 'paid',
            stage: 'paid',
            probability: 1,
            expectedDateISO: String(transaction.timestamp || new Date().toISOString()).slice(0, 10),
            destinationAccountId: String(transaction.accountId || ''),
            destinationAccountName: String(transaction.accountName || ''),
            linkedTransactionId: transactionId,
            incomeType: String(deal.incomeType || 'one_off'),
            notes: String(input.notes || ''),
            scope: scope(input.scope, scope(transaction.scope)),
          },
        }], { source: 'reviewTransaction.linkIncome' }));
      }
    }
    return events;
  },

  matchTransactionToObligation(input: {
    transactionId: string;
    obligationId: string;
    notes?: string;
  }): FinanceEvent[] {
    const readModel = this.getFinancialReadModel();
    const transaction = (readModel.transactions || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(input.transactionId || '') || String(entry.transactionEntityId || '') === String(input.transactionId || ''));
    if (!transaction) throw new Error('This payment could not be found.');
    if (String(transaction.type) !== 'expense.recorded') throw new Error('Only expense payments can be matched to obligations.');
    const treasury = this.computeFinanceContext(true).treasury || {};
    const obligation = ((treasury.obligations || []) as Array<Record<string, unknown>>)
      .find((entry) => String(entry.id || '') === String(input.obligationId || ''));
    if (!obligation) throw new Error('Choose an obligation to match this payment to.');
    const currency = this.getFinanceSettings().baseCurrency;
    const transactionId = String(transaction.id || input.transactionId);
    const scopeValue = scope(obligation.scope, scope(transaction.scope));
    const timestamp = financeTimestamp(String(obligation.id));
    return this.appendFinanceEvents([
      {
        type: 'transaction.reviewed',
        amount: Math.abs(Number(transaction.amount) || 0),
        currency,
        timestamp,
        related_entity_id: transactionId,
        metadata: {
          categoryId: 'obligation',
          scope: scope(transaction.scope),
          reviewStatus: 'reviewed',
          obligationId: String(obligation.id),
          obligationTitle: String(obligation.title || 'Obligation'),
          notes: String(input.notes || ''),
        },
      },
      {
        type: 'obligation.reviewed',
        amount: Math.abs(Number(transaction.amount) || Number(obligation.amount) || 0),
        currency,
        timestamp: financeTimestamp(String(obligation.id), timestamp),
        related_entity_id: String(obligation.id),
        metadata: {
          status: 'paid',
          title: String(obligation.title || 'Obligation'),
          dueDate: String(obligation.dueDate || ''),
          originalDueDate: String(obligation.originalDueDate || obligation.dueDate || ''),
          paidAt: String(transaction.timestamp || new Date().toISOString()),
          accountId: String(transaction.accountId || ''),
          accountName: String(transaction.accountName || ''),
          transactionId,
          scope: scopeValue,
          notes: String(input.notes || ''),
        },
      },
    ], { source: 'matchTransactionToObligation' });
  },

  updatePipelineReview(input: {
    id: string;
    status: string;
    probability: number;
    expectedDateISO: string;
    destinationAccountId?: string;
    notes?: string;
  }): FinanceEvent[] {
    const readModel = this.getFinancialReadModel();
    const deal = (readModel.pipelineDeals || []).find((entry: Record<string, unknown>) => String(entry.id) === String(input.id || ''));
    if (!deal) throw new Error('This pipeline item could not be found.');
    const status = String(input.status || '').toLowerCase();
    if (!['lead', 'proposal', 'expected', 'confirmed', 'invoiced', 'due', 'overdue', 'risky', 'paid', 'cancelled', 'lost'].includes(status)) {
      throw new Error('Choose a supported income status.');
    }
    const probability = Number(input.probability);
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new Error('Probability must be between 0 and 1.');
    const expectedDateISO = window.FinanceDates?.toDateOnly?.(input.expectedDateISO) || '';
    if (!expectedDateISO) throw new Error('Choose a valid expected date.');
    const destination = (readModel.fiatAccounts || []).find((account: Record<string, unknown>) => String(account.id) === String(input.destinationAccountId || ''));
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(String(deal.id));
    return this.appendFinanceEvents([
      {
        type: 'pipeline.stage_changed',
        amount: 0,
        currency,
        timestamp,
        related_entity_id: String(deal.id),
        metadata: {
          stage: status,
          status,
          title: deal.title,
          scope: scope(deal.scope),
          expectedDateISO,
          destinationAccountId: String(input.destinationAccountId || ''),
          destinationAccountName: destination ? String(destination.name || '') : '',
          notes: String(input.notes || ''),
        },
      },
      {
        type: 'pipeline.probability_changed',
        amount: probability,
        currency,
        timestamp: financeTimestamp(String(deal.id), timestamp),
        related_entity_id: String(deal.id),
        metadata: {
          probability,
          scope: scope(deal.scope),
          expectedDateISO,
          destinationAccountId: String(input.destinationAccountId || ''),
          destinationAccountName: destination ? String(destination.name || '') : '',
          notes: String(input.notes || ''),
        },
      },
    ], { source: 'updatePipelineReview' });
  },

  cancelPipelineItem(id: string, notes = ''): FinanceEvent[] {
    const deal = (this.getFinancialReadModel().pipelineDeals || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(id || ''));
    if (!deal) throw new Error('This pipeline item could not be found.');
    const currency = this.getFinanceSettings().baseCurrency;
    return this.appendFinanceEvents([{
      type: 'pipeline.stage_changed',
      amount: 0,
      currency,
      timestamp: financeTimestamp(String(deal.id)),
      related_entity_id: String(deal.id),
      metadata: {
        stage: 'cancelled',
        status: 'cancelled',
        title: deal.title,
        scope: scope(deal.scope),
        notes,
      },
    }], { source: 'cancelPipelineItem' });
  },

  saveDebtPlan(input: {
    id: string;
    dueDate: string;
    minimumPayment: number;
    paymentPlanNote: string;
    planType?: 'regular' | 'custom';
    frequency?: string;
    installments?: Array<{ date: string; amount: number }>;
  }): FinanceEvent[] {
    const debt = (this.getFinancialReadModel().debtAccounts || [])
      .find((entry: Record<string, unknown>) => String(entry.id) === String(input.id || ''));
    if (!debt) throw new Error('This debt item could not be found.');
    let dueDate = window.FinanceDates?.toDateOnly?.(input.dueDate) || '';
    let minimumPayment = Math.abs(Number(input.minimumPayment));
    const planType = input.planType || 'regular';
    if (planType === 'custom') {
      const installments = Array.isArray(input.installments) ? input.installments : [];
      if (!installments.length) throw new Error('Add at least one installment for a custom plan.');
      const sorted = [...installments].sort((a, b) => a.date.localeCompare(b.date));
      dueDate = window.FinanceDates?.toDateOnly?.(sorted[0].date) || dueDate;
      minimumPayment = Math.abs(Number(sorted[0].amount)) || 0;
    } else {
      if (!dueDate) throw new Error('Choose a debt due date.');
      if (!Number.isFinite(minimumPayment) || minimumPayment <= 0) throw new Error('Add a positive minimum payment.');
    }
    const currency = this.getFinanceSettings().baseCurrency;
    const event = this.appendFinanceEvent({
      type: 'debt.plan_updated',
      amount: minimumPayment,
      currency,
      timestamp: financeTimestamp(String(debt.id)),
      related_entity_id: String(debt.id),
      metadata: {
        name: debt.name,
        scope: scope(debt.scope),
        dueDate,
        minimumPayment,
        paymentPlanNote: String(input.paymentPlanNote || '').trim(),
        planType,
        frequency: String(input.frequency || 'monthly'),
        installments: input.installments || [],
      },
    }, { source: 'saveDebtPlan' });
    return event ? [event] : [];
  },

  deactivateFiatAccount(id: string): FinanceEvent[] {
    return reverseMatching(id, ['asset.account_set'], 'deactivateFiatAccount', (event) => {
      const metadata = event.metadata || {};
      return String(event.related_entity_id || '') === id || String(metadata.accountId || '') === id;
    });
  },

  deactivateReserveBucket(id: string): FinanceEvent[] {
    return reverseMatching(id, ['asset.reserve_set', 'asset.reserve_allocated'], 'deactivateReserveBucket', (event) => {
      const metadata = event.metadata || {};
      return String(event.related_entity_id || '') === id || String(metadata.reserveId || '') === id;
    });
  },

  deactivateRecurringExpense(id: string): FinanceEvent[] {
    return reverseMatching(id, ['expense.recurring_set'], 'deactivateRecurringExpense');
  },

  deactivateWeb3Position(id: string): FinanceEvent[] {
    return reverseMatching(id, ['asset.position_set'], 'deactivateWeb3Position');
  },

  deactivateDefiPosition(id: string): FinanceEvent[] {
    return reverseMatching(id, ['asset.defi_set'], 'deactivateDefiPosition');
  },

  deactivateDebtAccount(id: string): FinanceEvent[] {
    return reverseMatching(id, ['debt.added', 'debt.payment_made'], 'deactivateDebtAccount');
  },

  markPipelineItemPaid(id: string, context: Record<string, unknown> = {}): FinanceEvent[] {
    const readModel = this.getFinancialReadModel();
    const deal = (readModel.pipelineDeals || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
    if (!deal || String(deal.status).toLowerCase() === 'paid') return [];
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(id, context.timestamp);
    const amount = Math.abs(Number(deal.value) || 0);
    const destinationAccountId = String(context.destinationAccountId || deal.destinationAccountId || '');
    const destination = (readModel.fiatAccounts || []).find((account: Record<string, unknown>) => String(account.id) === destinationAccountId);
    if (!destination) throw new Error('Choose a settlement account before marking this pipeline item as paid.');
    const drafts: FinanceEventDraft[] = [
      {
        type: 'pipeline.stage_changed',
        amount: 0,
        currency,
        timestamp,
        related_entity_id: id,
        metadata: { stage: 'paid', status: 'paid', title: deal.title, scope: scope(deal.scope) },
      },
      {
        type: 'invoice.paid',
        amount,
        currency,
        timestamp,
        related_entity_id: id,
        metadata: { client: deal.title, amount, expectedDate: deal.expectedDateISO, destinationAccountId, scope: scope(deal.scope) },
      },
      {
        type: 'income.received',
        amount,
        currency,
        timestamp,
        related_entity_id: id,
        metadata: { description: `Invoice paid: ${String(deal.title || 'Invoice')}`, invoiceId: id, destinationAccountId, accountId: destinationAccountId, accountName: destination.name, categoryId: 'client-income', scope: scope(deal.scope), source: 'pipeline-settlement' },
      },
    ];
    if (destination) {
      const balance = Math.round(((Number(destination.balance) || 0) + amount) * 100) / 100;
      drafts.push({
        type: 'asset.account_set',
        amount: balance,
        currency,
        timestamp: financeTimestamp(String(destination.id), timestamp),
        related_entity_id: String(destination.id),
        metadata: {
          name: destination.name,
          balance,
          active: true,
          scope: scope(destination.scope),
          bucket: destination.bucket,
          reserved: destination.reserved,
          invoiceId: id,
          settlementTransfer: true,
        },
      });
    }
    return this.appendFinanceEvents(drafts, { source: 'markPipelineItemPaid' });
  },

  getReviewState(): FinanceReviewState {
    return normalizeReviewState(getJson(STORAGE_KEYS.review, DEFAULT_REVIEW_STATE));
  },

  completeWeeklyReview(input: {
    accounts?: Array<{ accountId: string; balance: number }>;
    unresolvedItems?: boolean;
    matchPayments?: boolean;
    confirmObligations?: boolean;
    reviewSignals?: boolean;
    closeMonth?: boolean;
    notes?: string;
  } = {}): FinanceReviewState {
    const readModel = this.getFinancialReadModel();
    const currentAccounts = readModel.fiatAccounts || [];
    const submittedAccounts = Array.isArray(input.accounts)
      ? input.accounts
      : currentAccounts.map((account: Record<string, unknown>) => ({ accountId: String(account.id), balance: Number(account.balance) || 0 }));
    if (submittedAccounts.some((account: { accountId: string; balance: number }) => !String(account.accountId || '').trim() || !Number.isFinite(Number(account.balance)))) {
      throw new Error('Each reconciled account needs a valid balance.');
    }
    const nowIso = new Date().toISOString();
    const currency = this.getFinanceSettings().baseCurrency;
    const drafts = submittedAccounts.flatMap((submitted: { accountId: string; balance: number }) => {
      const account = currentAccounts.find((entry: Record<string, unknown>) => String(entry.id) === String(submitted.accountId));
      const balance = Number(submitted.balance);
      if (!account || !Number.isFinite(balance) || balance === Number(account.balance)) return [];
      return [{
        type: 'asset.account_set',
        amount: balance,
        currency,
        timestamp: financeTimestamp(String(account.id), nowIso),
        related_entity_id: String(account.id),
        metadata: {
          name: account.name,
          balance,
          active: true,
          scope: scope(account.scope),
          bucket: account.bucket,
          reserved: account.reserved,
          source: 'weekly-review-reconciliation',
        },
      }];
    });
    if (drafts.length) this.appendFinanceEvents(drafts, { source: 'completeWeeklyReview.reconcile' });
    const context = this.computeFinanceContext(true);
    const forecast = buildFinanceForecast({
      readModel: context.readModel,
      snapshot: context.snapshot,
      treasury: context.treasury,
      nowIso,
    });
    const summary = buildMonthCloseSummary({
      readModel: context.readModel,
      snapshot: context.snapshot,
      treasury: context.treasury,
      reviewQueue: context.treasury?.reviewQueue || [],
      forecast,
      nowIso,
    });
    const accountReconciliations = Object.fromEntries(submittedAccounts.map((account: { accountId: string; balance: number }) => [
      String(account.accountId),
      { accountId: String(account.accountId), balance: Number(account.balance), reviewedAt: nowIso },
    ]));
    const checklist = {
      unresolvedItems: input.unresolvedItems !== false,
      matchPayments: input.matchPayments !== false,
      confirmObligations: input.confirmObligations !== false,
      reviewSignals: input.reviewSignals !== false,
      closeMonth: input.closeMonth !== false,
    };
    const previousReview = this.getReviewState();
    const historyEntry = {
      id: `${summary.monthKey}-${nowIso}`,
      monthKey: summary.monthKey,
      closedAt: nowIso,
      notes: String(input.notes || ''),
      accountReconciliations,
      checklist,
      summary,
    };
    const history = [
      historyEntry,
      ...(previousReview.history || []).filter((entry) => entry.monthKey !== summary.monthKey),
    ].slice(0, 24);
    const review: FinanceReviewState = {
      lastReviewedAt: nowIso,
      accountReconciliations,
      checklist,
      notes: String(input.notes || ''),
      history,
    };
    setJson(STORAGE_KEYS.review, review);
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'completeWeeklyReview');
    return review;
  },

  getGoals(): FinanceGoalState {
    return normalizeGoalState(getJson(STORAGE_KEYS.goals, DEFAULT_GOAL_STATE));
  },

  getGoalProgress(filter: FinanceScopeFilter = 'all'): FinanceGoalProgress[] {
    return calculateGoalProgress(this.getGoals(), this.getFinancialReadModel(false, 'all').fiatAccounts || [], filter);
  },

  saveGoal(input: {
    id?: string;
    name: string;
    type: FinanceGoal['type'];
    targetAmount: number;
    targetDate?: string;
    scope?: FinanceScope;
    linkedAccountIds?: string[];
  }): FinanceGoal {
    const goals = this.getGoals();
    const current = goals.goals.find((goal) => goal.id === input.id);
    const nowIso = new Date().toISOString();
    const targetAmount = Number(input.targetAmount);
    if (!String(input.name || '').trim()) throw new Error('Add a name for this goal.');
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) throw new Error('Goal target must be greater than zero.');
    const goal: FinanceGoal = {
      id: current?.id || entityId('goal'),
      name: String(input.name).trim(),
      type: input.type === 'savings' ? 'savings' : 'buffer',
      targetAmount,
      targetDate: /^\d{4}-\d{2}-\d{2}$/.test(String(input.targetDate || '')) ? input.targetDate : undefined,
      scope: scope(input.scope, current?.scope || 'shared'),
      linkedAccountIds: Array.isArray(input.linkedAccountIds) ? input.linkedAccountIds.map(String).filter(Boolean) : [],
      createdAt: current?.createdAt || nowIso,
      updatedAt: nowIso,
    };
    goals.goals = current
      ? goals.goals.map((entry) => entry.id === goal.id ? goal : entry)
      : [...goals.goals, goal];
    setJson(STORAGE_KEYS.goals, goals);
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'saveGoal');
    return clone(goal);
  },

  deleteGoal(id: string): FinanceGoalState {
    const goals = this.getGoals();
    goals.goals = goals.goals.filter((goal) => goal.id !== String(id));
    setJson(STORAGE_KEYS.goals, goals);
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'deleteGoal');
    return clone(goals);
  },

  getImportState(): FinanceImportState {
    return normalizeImportState(getJson(STORAGE_KEYS.imports, DEFAULT_IMPORT_STATE));
  },

  saveCsvImportProfile(input: {
    name?: string;
    headers: string[];
    mapping: CsvColumnMapping;
    accountId?: string;
    defaultCategory?: string;
    defaultScope?: FinanceScope;
    sourceFile?: string;
  }): FinanceImportProfile {
    const headers = Array.isArray(input.headers) ? input.headers.map(String).filter(Boolean) : [];
    const signature = importHeaderSignature(headers);
    if (!signature) throw new Error('CSV profile needs detected headers.');
    const nowIso = new Date().toISOString();
    const imports = this.getImportState();
    const existing = imports.profiles.find((profile) => importHeaderSignature(profile.headers) === signature);
    const profile: FinanceImportProfile = {
      id: existing?.id || entityId('import-profile'),
      name: String(input.name || input.sourceFile || existing?.name || 'CSV mapping').trim() || 'CSV mapping',
      headers,
      mapping: normalizeCsvMapping(input.mapping),
      accountId: String(input.accountId || existing?.accountId || '') || undefined,
      defaultCategory: String(input.defaultCategory || existing?.defaultCategory || 'uncategorized').trim() || 'uncategorized',
      defaultScope: scope(input.defaultScope, existing?.defaultScope || 'business'),
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };
    imports.profiles = existing
      ? imports.profiles.map((entry) => entry.id === existing.id ? profile : entry)
      : [profile, ...imports.profiles].slice(0, 8);
    imports.lastProfileId = profile.id;
    setJson(STORAGE_KEYS.imports, imports);
    return clone(profile);
  },

  renameCsvImportProfile(id: string, name: string): FinanceImportProfile {
    const imports = this.getImportState();
    const profileId = String(id || '').trim();
    const nextName = String(name || '').trim();
    if (!profileId) throw new Error('Choose a saved CSV profile.');
    if (!nextName) throw new Error('CSV profile name cannot be empty.');
    const current = imports.profiles.find((profile) => profile.id === profileId);
    if (!current) throw new Error('Saved CSV profile was not found.');
    const updated: FinanceImportProfile = {
      ...current,
      name: nextName,
      updatedAt: new Date().toISOString(),
    };
    imports.profiles = imports.profiles.map((profile) => profile.id === profileId ? updated : profile);
    setJson(STORAGE_KEYS.imports, imports);
    return clone(updated);
  },

  deleteCsvImportProfile(id: string): FinanceImportState {
    const imports = this.getImportState();
    const profileId = String(id || '').trim();
    if (!profileId) throw new Error('Choose a saved CSV profile.');
    imports.profiles = imports.profiles.filter((profile) => profile.id !== profileId);
    if (imports.lastProfileId === profileId) delete imports.lastProfileId;
    setJson(STORAGE_KEYS.imports, imports);
    return clone(imports);
  },

  importCsvTransactions(rows: CsvTransactionRow[], options: {
    accountId: string;
    sourceFile?: string;
    duplicatePolicy?: 'skip' | 'import';
    duplicateCount?: number;
    rejectedCount?: number;
  }): CsvImportSummary {
    const sourceFile = String(options.sourceFile || 'pasted-transactions.csv');
    const duplicatePolicy = options.duplicatePolicy === 'import' ? 'import' : 'skip';
    const existing = new Set(this.getActiveFinanceEvents()
      .map((event) => String(event.metadata?.fingerprint || ''))
      .filter(Boolean));
    const batchId = entityId('import');
    let imported = 0;
    let duplicates = 0;
    let duplicateImported = 0;
    const acceptedFingerprints: string[] = [];
    rows.forEach((row) => {
      const duplicate = existing.has(row.fingerprint);
      if (duplicate && duplicatePolicy !== 'import') {
        duplicates += 1;
        return;
      }
      existing.add(row.fingerprint);
      acceptedFingerprints.push(row.fingerprint);
      if (duplicate) duplicateImported += 1;
      this.recordTransaction({
        description: row.description,
        amount: row.amount,
        timestamp: toTransactionIso(row.date),
        accountId: options.accountId,
        categoryId: row.categoryId,
        scope: row.scope,
        source: 'csv-import',
        importBatchId: batchId,
        fingerprint: row.fingerprint,
        sourceFile,
      });
      imported += 1;
    });
    const dates = rows.map((row) => String(row.date || '')).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
    const incomeTotal = rows.reduce((sum, row) => sum + (Number(row.amount) > 0 ? Number(row.amount) : 0), 0);
    const expenseTotal = rows.reduce((sum, row) => sum + (Number(row.amount) < 0 ? Math.abs(Number(row.amount)) : 0), 0);
    const imports = this.getImportState();
    imports.batches.push({
      id: batchId,
      importedAt: new Date().toISOString(),
      sourceFile,
      fingerprints: acceptedFingerprints,
      accountId: options.accountId,
      importedCount: imported,
      duplicateCount: Number(options.duplicateCount || 0) + duplicates,
      duplicateImportedCount: duplicateImported,
      rejectedCount: Number(options.rejectedCount || 0),
      duplicatePolicy,
      incomeTotal: Math.round(incomeTotal * 100) / 100,
      expenseTotal: Math.round(expenseTotal * 100) / 100,
      dateFrom: dates[0],
      dateTo: dates[dates.length - 1],
    });
    setJson(STORAGE_KEYS.imports, imports);
    return { batchId, imported, duplicates, duplicateImported };
  },

  exportTransactionsCsv(): string {
    const columns = [
      'date',
      'description',
      'amount',
      'direction',
      'type',
      'account',
      'accountId',
      'category',
      'scope',
      'reviewStatus',
      'linkedObligationId',
      'linkedIncomeId',
      'source',
    ];
    const rows = (this.getFinancialReadModel().transactions || []).map((entry: Record<string, unknown>) => {
      const signed = Number(entry.signedAmount ?? entry.amount) || 0;
      return [
        transactionDate(entry.timestamp),
        entry.description,
        signed,
        entry.direction || (signed < 0 ? 'out' : 'in'),
        entry.ledgerType || entry.type,
        entry.accountName || entry.fromAccountName || '',
        entry.accountId || entry.fromAccountId || '',
        entry.categoryId,
        entry.scope,
        entry.reviewStatus,
        entry.obligationId,
        entry.linkedIncomeId,
        entry.source,
      ].map(csvCell).join(',');
    });
    return [columns.join(','), ...rows].join('\n');
  },

  undoImportBatch(batchId: string): FinanceEvent[] {
    const currency = this.getFinanceSettings().baseCurrency;
    const drafts = this.getActiveFinanceEvents()
      .filter((event) => String(event.metadata?.importBatchId || '') === String(batchId))
      .map((event) => ({
        type: 'finance.event_reversed',
        amount: 0,
        currency: event.currency || currency,
        timestamp: financeTimestamp(String(event.related_entity_id || event.id)),
        related_entity_id: event.id,
        metadata: { reason: 'undoImportBatch', reversed_event_id: event.id, importBatchId: batchId },
      }));
    return drafts.length ? this.appendFinanceEvents(drafts, { source: 'undoImportBatch' }) : [];
  },

  getPriceCache(): FinancePriceCache {
    return getJson(STORAGE_KEYS.priceCache, DEFAULT_PRICE_CACHE);
  },

  async refreshCryptoPrices(): Promise<{ updated: number; source: string; error?: string }> {
    const ui = this.getUiSettings();
    const provider = createPriceProvider(ui.walletPriceSource);
    const positions = (this.getFinancialReadModel().web3Positions || [])
      .filter((position: Record<string, unknown>) => position.manualPriceOverride !== true);
    if (!positions.length || provider.id === 'manual') return { updated: 0, source: provider.id };
    const symbols = positions.map((position: Record<string, unknown>) => String(position.symbolOrName || '')).filter(Boolean);
    let quotes: FinancePriceQuote[];
    try {
      quotes = await provider.getQuotes(symbols, this.getFinanceSettings().baseCurrency);
    } catch (error) {
      return {
        updated: 0,
        source: provider.id,
        error: error instanceof Error ? error.message : 'Price refresh failed.',
      };
    }
    const bySymbol = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]));
    const currency = this.getFinanceSettings().baseCurrency;
    const drafts = positions.flatMap((position: Record<string, unknown>) => {
      const quote = bySymbol.get(String(position.symbolOrName || '').toUpperCase());
      if (!quote) return [];
      return [{
        type: 'asset.position_set',
        amount: 0,
        currency,
        timestamp: new Date().toISOString(),
        related_entity_id: String(position.id),
        metadata: {
          symbolOrName: position.symbolOrName,
          chain: position.chain,
          amount: position.amount,
          price: quote.price,
          liquidity: position.liquidity,
          scope: scope(position.scope),
          priceSource: quote.source,
          priceUpdatedAt: quote.quotedAt,
          manualPriceOverride: false,
        },
      }];
    });
    const cache = this.getPriceCache();
    quotes.forEach((quote) => {
      cache.quotes[quote.symbol.toUpperCase()] = quote;
    });
    setJson(STORAGE_KEYS.priceCache, cache);
    if (drafts.length) this.appendFinanceEvents(drafts, { source: 'refreshCryptoPrices' });
    return { updated: drafts.length, source: provider.id };
  },

  exportBackup(): FinanceBackupV2 {
    const exportedAt = new Date().toISOString();
    const backup: FinanceBackupV2 = {
      version: CURRENT_BACKUP_VERSION,
      exportedAt,
      ledger: this.getFinanceLedger(),
      financeSettings: this.getFinanceSettings(),
      uiSettings: this.getUiSettings(),
      review: this.getReviewState(),
      goals: this.getGoals(),
      imports: this.getImportState(),
      prices: this.getPriceCache(),
    };
    return {
      ...backup,
      metadata: backupMetadata(backup, DATA_SCHEMA_LABEL, FINANCE_APP_NAME),
    };
  },

  recordBackupExport(exportedAt = new Date().toISOString()): void {
    setJson(STORAGE_KEYS.backupMeta, { lastBackupAt: exportedAt });
  },

  previewBackup(input: unknown): import('../types/finance').FinanceBackupPreview {
    return validateFinanceBackup(input, { latestLocalEventAt: this.getLocalDataHealth().latestEventAt });
  },

  restoreBackup(input: unknown): FinanceBackupV2 {
    const backup = assertFinanceBackup(input);
    setJson(STORAGE_KEYS.ledger, backup.ledger);
    setJson(STORAGE_KEYS.settings, backup.financeSettings || DEFAULT_FINANCE_SETTINGS);
    setJson(STORAGE_KEYS.ui, backup.uiSettings || DEFAULT_UI_SETTINGS);
    setJson(STORAGE_KEYS.review, backup.review || DEFAULT_REVIEW_STATE);
    setJson(STORAGE_KEYS.goals, backup.goals || DEFAULT_GOAL_STATE);
    setJson(STORAGE_KEYS.imports, backup.imports || DEFAULT_IMPORT_STATE);
    setJson(STORAGE_KEYS.priceCache, backup.prices || DEFAULT_PRICE_CACHE);
    repositorySet(STORAGE_KEYS.demoSeed, 'restored-backup');
    invalidate();
    window.dispatchEvent(new CustomEvent('finance:ui-updated', { detail: clone(this.getUiSettings()) }));
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'restoreBackup');
    return this.exportBackup();
  },

  getLocalDataHealth(): FinanceDataHealth {
    const backupMeta = getJson<typeof DEFAULT_BACKUP_META>(STORAGE_KEYS.backupMeta, DEFAULT_BACKUP_META);
    const health = inspectFinanceStorage({
      ledger: rawStorageEntry(STORAGE_KEYS.ledger),
      settings: rawStorageEntry(STORAGE_KEYS.settings),
      ui: rawStorageEntry(STORAGE_KEYS.ui),
      review: rawStorageEntry(STORAGE_KEYS.review),
      goals: rawStorageEntry(STORAGE_KEYS.goals),
      imports: rawStorageEntry(STORAGE_KEYS.imports),
      priceCache: rawStorageEntry(STORAGE_KEYS.priceCache),
    });
    return {
      ...health,
      ...browserStorageStatus,
      schemaLabel: DATA_SCHEMA_LABEL,
      backupVersion: CURRENT_BACKUP_VERSION,
      lastBackupAt: typeof backupMeta.lastBackupAt === 'string' ? backupMeta.lastBackupAt : null,
      migrationStatus,
      storageKeys: [...FINANCE_STORAGE_KEYS],
    };
  },

  resetLocalFinanceData(): FinanceDataHealth {
    FINANCE_STORAGE_KEYS.forEach((key) => repositoryRemove(key));
    repositorySet(STORAGE_KEYS.demoSeed, 'deleted');
    invalidate();
    window.dispatchEvent(new CustomEvent('finance:ui-updated', { detail: clone(this.getUiSettings()) }));
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'resetLocalFinanceData');
    return this.getLocalDataHealth();
  },

  deleteInvoice(id: string, options: Record<string, unknown> = {}): FinanceEvent[] {
    const currency = this.getFinanceSettings().baseCurrency;
    const timestamp = financeTimestamp(id, options.timestamp);
    const drafts: FinanceEventDraft[] = [];
    if (options.reverseSettlement === true) {
      this.getActiveFinanceEvents()
        .filter((event) => {
          const metadata = event.metadata || {};
          return String(event.related_entity_id || '') === id || String(metadata.invoiceId || '') === id;
        })
        .filter((event) => ['invoice.paid', 'income.received', 'asset.account_set'].includes(event.type))
        .forEach((event) => drafts.push({
          type: 'finance.event_reversed',
          amount: 0,
          currency: event.currency || currency,
          timestamp,
          related_entity_id: event.id,
          metadata: { reason: 'deleteInvoice', reversed_event_id: event.id, entity_id: id },
        }));
    }
    drafts.push({
      type: 'pipeline.stage_changed',
      amount: 0,
      currency,
      timestamp,
      related_entity_id: id,
      metadata: { stage: 'cancelled', status: 'cancelled' },
    });
    return this.appendFinanceEvents(drafts, { source: 'deleteInvoice' });
  },

  seedDemoIfNeeded(force = false): void {
    const ledger = getLedgerRaw();
    if (!force && ledger.length > 0) {
      if (!repositoryGet(STORAGE_KEYS.demoSeed, '')) {
        repositorySet(STORAGE_KEYS.demoSeed, 'existing-ledger');
      }
      return;
    }
    // An empty ledger is never a stable operating state for the deployed app.
    // Stale demo flags such as "deleted" must not keep GitHub Pages empty forever.
    const currency = this.getFinanceSettings().baseCurrency;
    const nowIso = new Date().toISOString();
    const drafts = createDemoDrafts(currency);
    if (!window.FinanceLedger?.appendEvents) throw new Error('Finance ledger module is unavailable.');
    const result = window.FinanceLedger.appendEvents([], drafts, {
      ...this.getFinanceSettings(),
      nowIso,
    }, {
      nowIso,
      allowApproximateTimestamp: false,
    });
    saveLedgerRaw(result.events);
    repositorySet(STORAGE_KEYS.demoSeed, '1');
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'seedDemoIfNeeded');
  },

  clearAndReseedDemo(): void {
    repositoryRemove(STORAGE_KEYS.ledger);
    repositoryRemove(STORAGE_KEYS.demoSeed);
    invalidate();
    this.seedDemoIfNeeded(true);
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'clearAndReseedDemo');
  },

  deleteSampleData(): void {
    repositoryRemove(STORAGE_KEYS.ledger);
    repositorySet(STORAGE_KEYS.demoSeed, 'deleted');
    invalidate();
    emitFinanceUpdated(this.getFinancialSnapshot(true), 'deleteSampleData');
  },
};
