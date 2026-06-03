import type { FinanceBackup, FinanceBackupPreview } from '../types/finance';

export function validateFinanceBackup(input: unknown, options?: { latestLocalEventAt?: string | null }): FinanceBackupPreview;
export function assertFinanceBackupV1(input: unknown): Extract<FinanceBackup, { version: 1 }>;
export function migrateFinanceBackupV1(input: unknown): Extract<FinanceBackup, { version: 2 }>;
export function assertFinanceBackup(input: unknown): Extract<FinanceBackup, { version: 2 }>;

