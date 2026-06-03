function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isTimestamp(value) {
  return typeof value === 'string' && value.includes('T') && Number.isFinite(Date.parse(value));
}

function issue(key, label, message, severity = 'error') {
  return { key, label, message, severity };
}

export function latestLedgerTimestamp(ledger) {
  if (!Array.isArray(ledger)) return null;
  const latest = ledger.reduce((max, event) => {
    const parsed = Date.parse(String(event?.timestamp || event?.created_at || ''));
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);
  return latest > 0 ? new Date(latest).toISOString() : null;
}

export function backupMetadata(backup, schemaLabel, appName) {
  const ledger = Array.isArray(backup?.ledger) ? backup.ledger : [];
  return {
    appName,
    schemaLabel,
    backupVersion: backup?.version,
    exportedAt: backup?.exportedAt,
    eventCount: ledger.length,
    latestLocalEventAt: latestLedgerTimestamp(ledger),
  };
}

export function inspectFinanceStorage(entries) {
  const issues = [];
  const ledger = entries.ledger;
  if (ledger.present && !Array.isArray(ledger.value)) {
    issues.push(issue('ledger', 'Ledger events', 'Stored ledger data is not a list of finance events.'));
  }
  if (Array.isArray(ledger.value)) {
    ledger.value.forEach((event, index) => {
      if (!isObject(event) || !String(event.id || '').trim() || !String(event.type || '').trim()
        || !Number.isFinite(Number(event.amount)) || !isTimestamp(event.timestamp)) {
        issues.push(issue('ledger', 'Ledger events', `Ledger event ${index + 1} is incomplete.`));
      }
    });
  }

  [
    ['settings', 'Finance settings'],
    ['ui', 'UI settings'],
    ['review', 'Review state'],
    ['goals', 'Goals'],
    ['imports', 'CSV import history'],
    ['priceCache', 'Cached prices'],
  ].forEach(([key, label]) => {
    if (entries[key]?.present && !isObject(entries[key].value)) {
      issues.push(issue(key, label, `${label} is stored in an unreadable shape.`));
    }
  });

  if (entries.imports?.present && isObject(entries.imports.value) && !Array.isArray(entries.imports.value.batches)) {
    issues.push(issue('imports', 'CSV import history', 'CSV import history is missing its batch list.'));
  }
  if (entries.goals?.present && isObject(entries.goals.value) && !Array.isArray(entries.goals.value.goals)) {
    issues.push(issue('goals', 'Goals', 'Goals data is missing its goal list.'));
  }
  if (entries.priceCache?.present && isObject(entries.priceCache.value) && !isObject(entries.priceCache.value.quotes)) {
    issues.push(issue('priceCache', 'Cached prices', 'Cached price data is missing its quote map.'));
  }

  const latestEventAt = latestLedgerTimestamp(Array.isArray(ledger.value) ? ledger.value : []);
  const eventCount = Array.isArray(ledger.value) ? ledger.value.length : 0;
  return {
    ok: issues.every((entry) => entry.severity !== 'error'),
    issues,
    eventCount,
    latestEventAt,
    checkedAt: new Date().toISOString(),
  };
}

