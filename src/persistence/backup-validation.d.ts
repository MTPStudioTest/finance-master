import type { FinanceBackupPreview, FinanceBackupV1, FinanceBackupV2 } from '../types/finance';

export function validateFinanceBackup(input: unknown): FinanceBackupPreview;
export function assertFinanceBackupV1(input: unknown): FinanceBackupV1;
export function migrateFinanceBackupV1(input: unknown): FinanceBackupV2;
export function assertFinanceBackup(input: unknown): FinanceBackupV2;
