function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isTimestamp(value) {
  return typeof value === 'string' && value.includes('T') && Number.isFinite(Date.parse(value));
}

function text(value) {
  return String(value || '').trim();
}

function metadataOf(event) {
  return isObject(event?.metadata) ? event.metadata : {};
}

function issue(key, label, message, severity = 'error') {
  return { key, label, message, severity };
}

function pushDuplicateIdIssues(issues, key, label, records, name = label) {
  if (!Array.isArray(records)) return;
  const seen = new Set();
  records.forEach((record, index) => {
    const id = text(record && record.id);
    if (!id) return;
    if (seen.has(id)) {
      issues.push(issue(key, label, `${name} item ${index + 1} repeats ID "${id}".`));
    }
    seen.add(id);
  });
}

function entityId(event) {
  const metadata = metadataOf(event);
  return text(event?.related_entity_id || metadata.entity_id || metadata.id || event?.id);
}

function collectEntityIds(ledger, predicate) {
  const ids = new Set();
  ledger.forEach((event) => {
    if (!isObject(event) || !predicate(event)) return;
    const id = entityId(event);
    if (id) ids.add(id);
  });
  return ids;
}

function reportMissingReference(issues, event, index, sourceKey, targetIds, label) {
  const metadata = metadataOf(event);
  const ref = text(metadata[sourceKey]);
  if (!ref || !targetIds.size || targetIds.has(ref)) return;
  issues.push(issue('ledger', 'Orphaned links', `Ledger event ${index + 1} links ${label} "${ref}", but no matching record exists.`));
}

export function evaluateStorageStatus(capabilities = {}) {
  const indexedDbAvailable = capabilities.indexedDbAvailable === true;
  const localStorageAvailable = capabilities.localStorageAvailable === true;
  const quotaAvailable = capabilities.quotaAvailable === true;
  const quotaUsage = Number.isFinite(Number(capabilities.quotaUsage)) ? Number(capabilities.quotaUsage) : null;
  const quotaLimit = Number.isFinite(Number(capabilities.quotaLimit)) ? Number(capabilities.quotaLimit) : null;
  const privateModeWarning = indexedDbAvailable !== true || localStorageAvailable !== true || quotaAvailable !== true;
  const storageStatus = !indexedDbAvailable && !localStorageAvailable
    ? 'unavailable'
    : privateModeWarning
      ? 'limited'
      : 'healthy';
  return {
    storageStatus,
    indexedDbAvailable,
    localStorageAvailable,
    quotaAvailable,
    quotaUsage,
    quotaLimit,
    privateModeWarning,
  };
}

export async function inspectBrowserStorageAvailability(browserGlobal = globalThis) {
  var localStorageAvailable = false;
  try {
    var storage = browserGlobal && browserGlobal.localStorage;
    if (storage) {
      var key = 'finance-master.storage-check';
      storage.setItem(key, 'ok');
      storage.removeItem(key);
      localStorageAvailable = true;
    }
  } catch {
    localStorageAvailable = false;
  }

  var quotaAvailable = false;
  var quotaUsage = null;
  var quotaLimit = null;
  try {
    var estimate = await browserGlobal?.navigator?.storage?.estimate?.();
    if (estimate && Number.isFinite(Number(estimate.quota))) {
      quotaAvailable = true;
      quotaUsage = Number.isFinite(Number(estimate.usage)) ? Number(estimate.usage) : 0;
      quotaLimit = Number(estimate.quota);
    }
  } catch {
    quotaAvailable = false;
  }

  return evaluateStorageStatus({
    indexedDbAvailable: Boolean(browserGlobal && 'indexedDB' in browserGlobal),
    localStorageAvailable,
    quotaAvailable,
    quotaUsage,
    quotaLimit,
  });
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
    const eventIds = new Set();
    const cashAccountIds = collectEntityIds(ledger.value, (event) => String(event.type || '') === 'asset.account_set');
    const reserveIds = collectEntityIds(ledger.value, (event) => String(event.type || '') === 'asset.reserve_set');
    const debtIds = collectEntityIds(ledger.value, (event) => String(event.type || '').startsWith('debt.'));
    const incomeIds = collectEntityIds(ledger.value, (event) => String(event.type || '').startsWith('invoice.') || String(event.type || '').startsWith('pipeline.'));
    ledger.value.forEach((event, index) => {
      if (!isObject(event) || !String(event.id || '').trim() || !String(event.type || '').trim()
        || !Number.isFinite(Number(event.amount)) || !isTimestamp(event.timestamp)) {
        issues.push(issue('ledger', 'Ledger events', `Ledger event ${index + 1} is incomplete.`));
        return;
      }
      const id = text(event.id);
      if (eventIds.has(id)) {
        issues.push(issue('ledger', 'Duplicate IDs', `Ledger event ${index + 1} repeats ID "${id}".`));
      }
      eventIds.add(id);
    });

    ledger.value.forEach((event, index) => {
      if (!isObject(event)) return;
      const metadata = metadataOf(event);
      const reversedId = text(metadata.reversed_event_id || metadata.reversalOf);
      if (reversedId && !eventIds.has(reversedId)) {
        issues.push(issue('ledger', 'Orphaned links', `Ledger event ${index + 1} reverses missing event "${reversedId}".`));
      }
      reportMissingReference(issues, event, index, 'accountId', cashAccountIds, 'cash account');
      reportMissingReference(issues, event, index, 'fromAccountId', cashAccountIds, 'source account');
      reportMissingReference(issues, event, index, 'toAccountId', cashAccountIds, 'destination account');
      reportMissingReference(issues, event, index, 'linkedCashAccountId', cashAccountIds, 'cash account');
      reportMissingReference(issues, event, index, 'reserveBucketId', reserveIds, 'reserve bucket');
      reportMissingReference(issues, event, index, 'linkedReserveId', reserveIds, 'reserve bucket');
      reportMissingReference(issues, event, index, 'debtId', debtIds, 'debt plan');
      reportMissingReference(issues, event, index, 'linkedDebtId', debtIds, 'debt plan');
      reportMissingReference(issues, event, index, 'invoiceId', incomeIds, 'income item');
      reportMissingReference(issues, event, index, 'pipelineId', incomeIds, 'income item');
      reportMissingReference(issues, event, index, 'linkedIncomeId', incomeIds, 'income item');
    });
  }

  [
    ['settings', 'Finance settings'],
    ['ui', 'UI settings'],
    ['review', 'Review state'],
    ['goals', 'Goals'],
    ['imports', 'CSV import history'],
    ['scenarios', 'Saved scenarios'],
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
  if (entries.goals?.present && isObject(entries.goals.value) && Array.isArray(entries.goals.value.goals)) {
    const cashAccountIds = Array.isArray(ledger.value)
      ? collectEntityIds(ledger.value, (event) => String(event.type || '') === 'asset.account_set')
      : new Set();
    pushDuplicateIdIssues(issues, 'goals', 'Duplicate IDs', entries.goals.value.goals, 'Goal');
    entries.goals.value.goals.forEach((goal, index) => {
      if (!isObject(goal) || !Array.isArray(goal.linkedAccountIds) || !cashAccountIds.size) return;
      goal.linkedAccountIds.map(text).filter(Boolean).forEach((accountId) => {
        if (!cashAccountIds.has(accountId)) {
          issues.push(issue('goals', 'Orphaned links', `Goal ${index + 1} links missing cash account "${accountId}".`));
        }
      });
    });
  }
  if (entries.scenarios?.present && isObject(entries.scenarios.value) && !Array.isArray(entries.scenarios.value.scenarios)) {
    issues.push(issue('scenarios', 'Saved scenarios', 'Saved scenario data is missing its scenario list.'));
  }
  if (entries.scenarios?.present && isObject(entries.scenarios.value) && Array.isArray(entries.scenarios.value.scenarios)) {
    pushDuplicateIdIssues(issues, 'scenarios', 'Duplicate IDs', entries.scenarios.value.scenarios, 'Scenario');
  }
  if (entries.imports?.present && isObject(entries.imports.value)) {
    pushDuplicateIdIssues(issues, 'imports', 'Duplicate IDs', entries.imports.value.batches, 'Import batch');
    pushDuplicateIdIssues(issues, 'imports', 'Duplicate IDs', entries.imports.value.profiles, 'CSV profile');
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
