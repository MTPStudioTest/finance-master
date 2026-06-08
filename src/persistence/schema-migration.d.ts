export type FinanceMigrationStatus = 'current' | 'pending' | 'failed';

export function validateRepositorySnapshot(snapshot: unknown): {
  valid: boolean;
  errors: string[];
};

export function evaluateMigrationStatus(schemaLabel?: string): FinanceMigrationStatus;

export function inspectRepositoryMigration(snapshot: unknown, schemaLabel?: string): {
  status: FinanceMigrationStatus;
  safeToMigrate: boolean;
  errors: string[];
};

export function migrateRepositorySnapshot(snapshot: unknown, schemaLabel?: string): {
  status: FinanceMigrationStatus;
  safeToMigrate: boolean;
  errors: string[];
  snapshot: unknown | null;
};
