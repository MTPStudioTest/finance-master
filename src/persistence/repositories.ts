import { selectRepositoryValue } from './legacy-migration.js';

const DB_NAME = 'finance-master';
const DB_VERSION = 1;
const STATE_STORE = 'state';

const memory = new Map<string, unknown>();
let database: IDBDatabase | null = null;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function encode(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STATE_STORE)) {
        request.result.createObjectStore(STATE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function readDatabase(key: string): Promise<unknown> {
  if (!database) return undefined;
  const transaction = database.transaction(STATE_STORE, 'readonly');
  return requestValue(transaction.objectStore(STATE_STORE).get(key));
}

async function writeDatabase(key: string, value: unknown): Promise<void> {
  if (!database) {
    localStorage.setItem(key, encode(value));
    return;
  }
  const transaction = database.transaction(STATE_STORE, 'readwrite');
  await requestValue(transaction.objectStore(STATE_STORE).put(clone(value), key));
}

async function deleteDatabase(key: string): Promise<void> {
  if (!database) {
    localStorage.removeItem(key);
    return;
  }
  const transaction = database.transaction(STATE_STORE, 'readwrite');
  await requestValue(transaction.objectStore(STATE_STORE).delete(key));
}

export async function initializeRepositories(keys: string[]): Promise<void> {
  database = await openDatabase();
  await Promise.all(keys.map(async (key) => {
    const stored = await readDatabase(key);
    const legacy = localStorage.getItem(key);
    const selected = selectRepositoryValue(stored, legacy);
    if (selected.source === 'empty') return;
    memory.set(key, clone(selected.value));
    if (selected.source !== 'localStorage') return;
    await writeDatabase(key, selected.value);
    if (database && selected.removeLegacy) localStorage.removeItem(key);
  }));
}

export function repositoryGet<T>(key: string, fallback: T): T {
  return clone(memory.has(key) ? memory.get(key) as T : fallback);
}

export function repositorySet(key: string, value: unknown): void {
  memory.set(key, clone(value));
  void writeDatabase(key, value);
}

export function repositoryRemove(key: string): void {
  memory.delete(key);
  void deleteDatabase(key);
}
