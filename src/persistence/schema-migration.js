import { DATA_SCHEMA_LABEL } from '../settings/data-version.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export const MIGRATION_REGISTRY = Object.freeze([
  {
    schemaLabel: DATA_SCHEMA_LABEL,
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
  ['settings', 'ui', 'review', 'goals', 'imports', 'priceCache'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(snapshot, key) && snapshot[key] !== undefined && !isObject(snapshot[key])) {
      errors.push(`${key} must be stored as an object.`);
    }
  });
  return { valid: errors.length === 0, errors };
}

export function evaluateMigrationStatus(schemaLabel = DATA_SCHEMA_LABEL) {
  return schemaLabel === DATA_SCHEMA_LABEL ? 'current' : 'pending';
}

export function inspectRepositoryMigration(snapshot, schemaLabel = DATA_SCHEMA_LABEL) {
  const before = validateRepositorySnapshot(snapshot);
  if (!before.valid) {
    return { status: 'failed', safeToMigrate: false, errors: before.errors };
  }
  const registryEntry = MIGRATION_REGISTRY.find((entry) => entry.schemaLabel === schemaLabel);
  if (!registryEntry) {
    return { status: 'pending', safeToMigrate: false, errors: [] };
  }
  const migrated = registryEntry.migrate(snapshot);
  const after = validateRepositorySnapshot(migrated);
  return {
    status: after.valid ? 'current' : 'failed',
    safeToMigrate: after.valid,
    errors: after.errors,
  };
}
