export interface RepositorySelection {
  source: 'indexeddb' | 'localStorage' | 'empty';
  value: unknown;
  removeLegacy: boolean;
}

export function decodeLegacyValue(raw: string): unknown;
export function selectRepositoryValue(databaseValue: unknown, legacyRaw: string | null): RepositorySelection;
