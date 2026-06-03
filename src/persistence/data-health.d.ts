export function latestLedgerTimestamp(ledger: unknown): string | null;
export function backupMetadata(
  backup: { version: number; exportedAt: string; ledger?: unknown[] },
  schemaLabel: string,
  appName: string,
): {
  appName: string;
  schemaLabel: string;
  backupVersion: number;
  exportedAt: string;
  eventCount: number;
  latestLocalEventAt: string | null;
};
export function inspectFinanceStorage(entries: Record<string, { present: boolean; value: unknown }>): {
  ok: boolean;
  issues: Array<{ key: string; label: string; message: string; severity: 'error' | 'warning' }>;
  eventCount: number;
  latestEventAt: string | null;
  checkedAt: string;
};
