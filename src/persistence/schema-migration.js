import { DATA_SCHEMA_LABEL } from '../settings/data-version.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export const LEGACY_LOCAL_FIRST_SCHEMA_LABEL = 'finance-master.local-first.v0';

export const MIGRATION_REGISTRY = Object.freeze([
  {
    schemaLabel: LEGACY_LOCAL_FIRST_SCHEMA_LABEL,
    targetSchemaLabel: DATA_SCHEMA_LABEL,
    migrate(snapshot) {
      const next = clone(snapshot);
      return {
        ...next,
        ledger: Array.isArray(next.ledger) ? next.ledger : [],
        settings: isObject(next.settings) ? next.settings : {},
        ui: isObject(next.ui) ? next.ui : {},
        review: isObject(next.review) ? next.review : {},
        goals: isObject(next.goals) ? next.goals : { goals: [] },
        imports: isObject(next.imports) ? next.imports : { batches: [], profiles: [] },
        scenarios: isObject(next.scenarios) && Array.isArray(next.scenarios.scenarios) ? next.scenarios : { scenarios: [] },
        priceCache: isObject(next.priceCache) && isObject(next.priceCache.quotes) ? next.priceCache : { quotes: {} },
        backupMeta: isObject(next.backupMeta) ? next.backupMeta : { lastBackupAt: null },
      };
    },
  },
  {
    schemaLabel: DATA_SCHEMA_LABEL,
    targetSchemaLabel: DATA_SCHEMA_LABEL,
    migrate(snapshot) {
      return clone(snapshot);
    },
  },
]);

export function validateRepositorySnapshot(snapshot) {
  const errors = [];
  if (!isObject(snapshot)) {
    return { valid: false, errors: ['Repository snapshot must be an object.'] };
  }
  if (Object.prototype.hasOwnProperty.call(snapshot, 'ledger') && snapshot.ledger !== undefined && !Array.isArray(snapshot.ledger)) {
    errors.push('Ledger events must be stored as a list.');
  }
  ['settings', 'ui', 'review', 'goals', 'imports', 'scenarios', 'priceCache', 'backupMeta'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(snapshot, key) && snapshot[key] !== undefined && !isObject(snapshot[key])) {
      errors.push(`${key} must be stored as an object.`);
    }
  });
  if (isObject(snapshot.scenarios) && Array.isArray(snapshot.scenarios.scenarios) === false) {
    errors.push('scenarios must include a scenario list.');
  }
  if (isObject(snapshot.priceCache) && !isObject(snapshot.priceCache.quotes)) {
    errors.push('priceCache must include a quote map.');
  }
  return { valid: errors.length === 0, errors };
}

export function evaluateMigrationStatus(schemaLabel = DATA_SCHEMA_LABEL) {
  return schemaLabel === DATA_SCHEMA_LABEL ? 'current' : 'pending';
}

export function migrateRepositorySnapshot(snapshot, schemaLabel = DATA_SCHEMA_LABEL) {
  const before = validateRepositorySnapshot(snapshot);
  if (!before.valid) {
    return { status: 'failed', safeToMigrate: false, errors: before.errors, snapshot: null };
  }
  const registryEntry = MIGRATION_REGISTRY.find((entry) => entry.schemaLabel === schemaLabel);
  if (!registryEntry) {
    return { status: 'pending', safeToMigrate: false, errors: [], snapshot: null };
  }
  const migrated = registryEntry.migrate(snapshot);
  const after = validateRepositorySnapshot(migrated);
  return {
    status: after.valid ? 'current' : 'failed',
    safeToMigrate: after.valid,
    errors: after.errors,
    snapshot: after.valid ? migrated : null,
  };
}

export function inspectRepositoryMigration(snapshot, schemaLabel = DATA_SCHEMA_LABEL) {
  const result = migrateRepositorySnapshot(snapshot, schemaLabel);
  return {
    status: result.status,
    safeToMigrate: result.safeToMigrate,
    errors: result.errors,
  };
}
