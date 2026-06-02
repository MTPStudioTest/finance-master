export function decodeLegacyValue(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function selectRepositoryValue(databaseValue, legacyRaw) {
  if (databaseValue !== undefined) {
    return { source: 'indexeddb', value: databaseValue, removeLegacy: false };
  }
  if (legacyRaw == null) {
    return { source: 'empty', value: undefined, removeLegacy: false };
  }
  return { source: 'localStorage', value: decodeLegacyValue(legacyRaw), removeLegacy: true };
}
