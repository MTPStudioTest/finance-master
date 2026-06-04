import {
  CURRENT_BACKUP_VERSION,
  DATA_SCHEMA_LABEL,
  FINANCE_APP_NAME,
  SUPPORTED_BACKUP_VERSIONS,
} from '../settings/data-version.js';
import { backupMetadata, latestLedgerTimestamp } from './data-health.js';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isTimestamp(value, allowNull = false) {
  if (allowNull && value === null) return true;
  return typeof value === 'string' && value.includes('T') && Number.isFinite(Date.parse(value));
}

function isScope(value, allowAll = false) {
  return ['personal', 'business', 'shared'].includes(value) || (allowAll && value === 'all');
}

function validateLedger(ledger, errors) {
  if (!Array.isArray(ledger)) {
    errors.push('Ledger events are missing.');
    return;
  }
  ledger.forEach((event, index) => {
    if (!isObject(event) || !String(event.id || '').trim() || !String(event.type || '').trim()
      || !Number.isFinite(Number(event.amount)) || !String(event.currency || '').trim()
      || !isTimestamp(event.timestamp) || !isTimestamp(event.created_at) || !isObject(event.metadata)) {
      errors.push(`Ledger event ${index + 1} is incomplete.`);
    }
  });
}

function validateSettings(backup, errors) {
  if (!isObject(backup.financeSettings) || !String(backup.financeSettings.baseCurrency || '').trim()
    || !Number.isFinite(Number(backup.financeSettings.forecastDays))) {
    errors.push('Finance settings are incomplete.');
  }
  const ui = backup.uiSettings;
  if (!isObject(ui) || !['dark-editorial', 'dark-restrained', 'bright-editorial', 'bright-minimal', 'color-field', 'monochrome-focus', 'aurora', 'midnight', 'twilight', 'bright'].includes(ui.appearance)
    || typeof ui.reducedMotion !== 'boolean' || !isScope(ui.scopeFilter, true)
    || !['manual', 'coingecko'].includes(ui.walletPriceSource) || !isObject(ui.scenario)
    || !['marketMajors', 'burnDelta', 'probFloor'].every((key) => Number.isFinite(Number(ui.scenario[key])))) {
    errors.push('UI settings are incomplete.');
  }
}

function validateReview(review, errors, version) {
  if (!isObject(review) || !isTimestamp(review.lastReviewedAt, true)) {
    errors.push('Weekly review state is incomplete.');
    return;
  }
  const checklist = isObject(review.checklist) ? review.checklist : {};
  const hasLegacyChecklist = typeof checklist.recurringCosts === 'boolean'
    && typeof checklist.pipeline === 'boolean'
    && typeof checklist.signals === 'boolean';
  const hasMonthCloseChecklist = typeof checklist.unresolvedItems === 'boolean'
    && typeof checklist.matchPayments === 'boolean'
    && typeof checklist.confirmObligations === 'boolean'
    && typeof checklist.reviewSignals === 'boolean'
    && typeof checklist.closeMonth === 'boolean';
  const history = Array.isArray(review.history) ? review.history : [];
  const invalidHistory = history.some((entry) => !isObject(entry) || !String(entry.id || '').trim()
    || !/^\d{4}-\d{2}$/.test(String(entry.monthKey || '')) || !isTimestamp(entry.closedAt)
    || typeof entry.notes !== 'string' || !isObject(entry.accountReconciliations)
    || !isObject(entry.checklist) || !isObject(entry.summary)
    || typeof entry.checklist.unresolvedItems !== 'boolean'
    || typeof entry.checklist.matchPayments !== 'boolean'
    || typeof entry.checklist.confirmObligations !== 'boolean'
    || typeof entry.checklist.reviewSignals !== 'boolean'
    || typeof entry.checklist.closeMonth !== 'boolean'
    || !/^\d{4}-\d{2}$/.test(String(entry.summary.monthKey || ''))
    || !Number.isFinite(Number(entry.summary.netMovement))
    || !Number.isFinite(Number(entry.summary.incomeReceived))
    || !Number.isFinite(Number(entry.summary.expensesPaid))
    || !Number.isFinite(Number(entry.summary.obligationsReviewed))
    || !Number.isFinite(Number(entry.summary.reserveMovements))
    || !Number.isFinite(Number(entry.summary.unresolvedItems))
    || !Number.isFinite(Number(entry.summary.protectedCash))
    || !Number.isFinite(Number(entry.summary.monthlyBurn))
    || (entry.summary.runwayNow !== null && !Number.isFinite(Number(entry.summary.runwayNow)))
    || typeof entry.summary.mainRisk !== 'string'
    || typeof entry.summary.mainAction !== 'string');
  if (version === 2 && (!isObject(review.accountReconciliations) || !isObject(review.checklist)
    || (!hasLegacyChecklist && !hasMonthCloseChecklist) || typeof review.notes !== 'string'
    || Object.values(review.accountReconciliations).some((entry) => !isObject(entry)
      || !String(entry.accountId || '').trim() || !Number.isFinite(Number(entry.balance)) || !isTimestamp(entry.reviewedAt))
    || invalidHistory)) {
    errors.push('Weekly review ritual state is incomplete.');
  }
}

function validateGoals(goals, errors, version) {
  if (version === 1) return;
  if (!isObject(goals) || !Array.isArray(goals.goals)
    || goals.goals.some((goal) => !isObject(goal) || !String(goal.id || '').trim()
      || !String(goal.name || '').trim() || !['savings', 'buffer'].includes(goal.type)
      || !Number.isFinite(Number(goal.targetAmount)) || Number(goal.targetAmount) <= 0
      || !isScope(goal.scope) || !Array.isArray(goal.linkedAccountIds)
      || (goal.targetDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(goal.targetDate)))
      || !isTimestamp(goal.createdAt) || !isTimestamp(goal.updatedAt))) {
    errors.push('Savings and buffer goals are incomplete.');
  }
}

function validateSupportingState(backup, errors, version) {
  validateReview(backup.review, errors, version);
  validateGoals(backup.goals, errors, version);
  if (!isObject(backup.imports) || !Array.isArray(backup.imports.batches)
    || backup.imports.batches.some((batch) => !isObject(batch) || !String(batch.id || '').trim()
      || !isTimestamp(batch.importedAt) || !String(batch.sourceFile || '').trim() || !Array.isArray(batch.fingerprints))) {
    errors.push('CSV import history is incomplete.');
  }
  if (isObject(backup.imports) && Array.isArray(backup.imports.profiles)
    && backup.imports.profiles.some((profile) => !isObject(profile) || !String(profile.id || '').trim()
      || !String(profile.name || '').trim() || !Array.isArray(profile.headers)
      || !isObject(profile.mapping) || !String(profile.mapping.date || '').trim()
      || !String(profile.mapping.description || '').trim() || !isTimestamp(profile.createdAt)
      || !isTimestamp(profile.updatedAt))) {
    errors.push('CSV import profiles are incomplete.');
  }
  if (!isObject(backup.prices) || !isObject(backup.prices.quotes)) {
    errors.push('Cached wallet prices are incomplete.');
  }
  const allowedScenarioTypes = ['reduce_flexible_costs', 'reduce_debt_pressure', 'add_recurring_income', 'protect_future_income', 'pause_savings_goal', 'increase_reserve_contribution'];
  if (backup.scenarios !== undefined && (!isObject(backup.scenarios) || !Array.isArray(backup.scenarios.scenarios)
    || backup.scenarios.scenarios.some((scenario) => !isObject(scenario) || !String(scenario.id || '').trim()
      || !String(scenario.name || '').trim() || !allowedScenarioTypes.includes(String(scenario.type || ''))
      || !Number.isFinite(Number(scenario.amount)) || Number(scenario.amount) < 0
      || (scenario.protectPercent !== undefined && (!Number.isFinite(Number(scenario.protectPercent)) || Number(scenario.protectPercent) < 0 || Number(scenario.protectPercent) > 100))
      || !isTimestamp(scenario.createdAt) || !isTimestamp(scenario.updatedAt)))) {
    errors.push('Saved scenarios are incomplete.');
  }
}

function uniqueRelated(ledger, type) {
  return new Set((Array.isArray(ledger) ? ledger : [])
    .filter((event) => event && event.type === type)
    .map((event) => String(event.related_entity_id || event.id || ''))
    .filter(Boolean)).size;
}

export function validateFinanceBackup(input, options = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(input)) {
    return { valid: false, counts: {}, errors: ['Backup must be a JSON object.'], warnings };
  }
  if (!SUPPORTED_BACKUP_VERSIONS.includes(input.version)) errors.push('Backup version is not supported.');
  if (!isTimestamp(input.exportedAt)) errors.push('Backup export date is missing or invalid.');
  validateLedger(input.ledger, errors);
  validateSettings(input, errors);
  validateSupportingState(input, errors, input.version);
  const ledger = Array.isArray(input.ledger) ? input.ledger : [];
  const localLatest = Date.parse(String(options.latestLocalEventAt || ''));
  const exported = Date.parse(String(input.exportedAt || ''));
  if (Number.isFinite(localLatest) && Number.isFinite(exported) && exported < localLatest) {
    warnings.push('This backup is older than your newest local finance event.');
  }
  const metadata = isObject(input.metadata)
    ? input.metadata
    : backupMetadata(input, DATA_SCHEMA_LABEL, FINANCE_APP_NAME);
  return {
    valid: errors.length === 0,
    version: input.version,
    currentVersion: CURRENT_BACKUP_VERSION,
    schemaLabel: String(metadata.schemaLabel || DATA_SCHEMA_LABEL),
    appName: String(metadata.appName || FINANCE_APP_NAME),
    exportedAt: isTimestamp(input.exportedAt) ? input.exportedAt : undefined,
    latestLocalEventAt: latestLedgerTimestamp(ledger) || undefined,
    counts: {
      ledgerEvents: ledger.length,
      accounts: uniqueRelated(ledger, 'asset.account_set'),
      recurringCosts: uniqueRelated(ledger, 'expense.recurring_set'),
      pipelineItems: uniqueRelated(ledger, 'pipeline.created'),
      goals: Array.isArray(input.goals?.goals) ? input.goals.goals.length : 0,
      importBatches: Array.isArray(input.imports?.batches) ? input.imports.batches.length : 0,
      scenarios: Array.isArray(input.scenarios?.scenarios) ? input.scenarios.scenarios.length : 0,
      cachedQuotes: isObject(input.prices?.quotes) ? Object.keys(input.prices.quotes).length : 0,
    },
    errors,
    warnings,
  };
}

export function assertFinanceBackupV1(input) {
  const preview = validateFinanceBackup(input);
  if (!preview.valid || input.version !== 1) throw new Error(preview.errors.concat(input.version === 1 ? [] : ['Backup is not version 1.']).join(' '));
  return input;
}

export function migrateFinanceBackupV1(input) {
  const backup = assertFinanceBackupV1(input);
  return {
    ...backup,
    version: 2,
    review: {
      lastReviewedAt: backup.review.lastReviewedAt,
      accountReconciliations: {},
      checklist: { recurringCosts: false, pipeline: false, signals: false },
      notes: '',
    },
    goals: { goals: [] },
  };
}

export function assertFinanceBackup(input) {
  const preview = validateFinanceBackup(input);
  if (!preview.valid) throw new Error(preview.errors.join(' '));
  return input.version === 1 ? migrateFinanceBackupV1(input) : input;
}
