const DELIMITERS = [',', ';', '\t'];

function normalizeHeader(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function aliases(headers, candidates) {
  return headers.find((header) => candidates.includes(normalizeHeader(header))) || '';
}

export function parseCsvLine(line, delimiter) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      fields.push(field.trim());
      field = '';
    } else {
      field += character;
    }
  }
  fields.push(field.trim());
  return fields;
}

export function detectCsvDelimiter(headerRow) {
  const ranked = DELIMITERS
    .map((delimiter) => ({ delimiter, fields: parseCsvLine(headerRow, delimiter).length }))
    .sort((left, right) => right.fields - left.fields);
  return ranked[0].fields > 1 ? ranked[0].delimiter : ',';
}

export function parseCsvDocument(raw) {
  const lines = String(raw || '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('Provide a header row and at least one transaction.');
  const delimiter = detectCsvDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('Every CSV column needs a header.');
  if (new Set(headers).size !== headers.length) throw new Error('CSV headers must be unique.');
  return {
    delimiter,
    headers,
    rows: lines.slice(1).map((line, index) => ({ rowNumber: index + 2, values: parseCsvLine(line, delimiter) })),
  };
}

export function inferCsvColumnMapping(headers) {
  return {
    date: aliases(headers, ['date', 'bookingdate', 'transactiondate', 'valuedate']),
    description: aliases(headers, ['description', 'memo', 'note', 'details', 'payee', 'reference', 'narrative']),
    amount: aliases(headers, ['amount', 'value', 'total', 'transactionamount']),
    debit: aliases(headers, ['debit', 'withdrawal', 'outflow', 'moneyout']),
    credit: aliases(headers, ['credit', 'deposit', 'inflow', 'moneyin']),
    category: aliases(headers, ['category', 'categoryid']),
    scope: aliases(headers, ['scope', 'group']),
  };
}

function parseDate(value) {
  const raw = String(value || '').trim();
  const european = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  const normalized = european ? `${european[3]}-${european[2].padStart(2, '0')}-${european[1].padStart(2, '0')}` : raw;
  const timestamp = Date.parse(`${normalized}T12:00:00`);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : '';
}

function parseMoney(value) {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const negative = raw.startsWith('(') && raw.endsWith(')');
  let cleaned = raw.replace(/[()\s']/g, '').replace(/[^\d,.-]/g, '');
  const comma = cleaned.lastIndexOf(',');
  const period = cleaned.lastIndexOf('.');
  if (comma >= 0 && period >= 0) {
    const decimal = comma > period ? ',' : '.';
    cleaned = cleaned.replace(decimal === ',' ? /\./g : /,/g, '').replace(decimal, '.');
  } else if (comma >= 0) {
    const decimalDigits = cleaned.length - comma - 1;
    cleaned = decimalDigits > 0 && decimalDigits <= 2 ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  }
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? (negative ? -Math.abs(amount) : amount) : Number.NaN;
}

function rowValue(document, row, column) {
  if (!column) return '';
  const index = document.headers.indexOf(column);
  return index >= 0 ? String(row.values[index] || '').trim() : '';
}

export function buildCsvFingerprint(row) {
  return `${row.date}|${row.description.trim().toLowerCase()}|${Number(row.amount).toFixed(2)}`;
}

export function buildCsvImportPreview(document, mapping, options = {}) {
  const rejected = [];
  const duplicates = [];
  const rows = [];
  const existing = new Set(options.existingFingerprints || []);
  const seen = new Set();
  const defaultCategory = String(options.defaultCategory || 'uncategorized').trim() || 'uncategorized';
  const defaultScope = ['personal', 'shared'].includes(options.defaultScope) ? options.defaultScope : 'business';
  const mappedHeaders = new Set(document.headers);
  const required = [mapping.date, mapping.description].filter(Boolean);
  if (required.length !== 2 || required.some((header) => !mappedHeaders.has(header))) {
    throw new Error('Map both the date and description columns.');
  }
  const usesSignedAmount = Boolean(mapping.amount && mappedHeaders.has(mapping.amount));
  const usesSplitAmount = Boolean(
    (mapping.debit && mappedHeaders.has(mapping.debit)) || (mapping.credit && mappedHeaders.has(mapping.credit)),
  );
  if (!usesSignedAmount && !usesSplitAmount) {
    throw new Error('Map a signed amount column or at least one debit or credit column.');
  }

  document.rows.forEach((row) => {
    const date = parseDate(rowValue(document, row, mapping.date));
    const description = rowValue(document, row, mapping.description);
    const amount = usesSignedAmount
      ? parseMoney(rowValue(document, row, mapping.amount))
      : Math.abs(parseMoney(rowValue(document, row, mapping.credit))) - Math.abs(parseMoney(rowValue(document, row, mapping.debit)));
    if (!date) {
      rejected.push({ rowNumber: row.rowNumber, reason: 'Date is missing or invalid.' });
      return;
    }
    if (!description) {
      rejected.push({ rowNumber: row.rowNumber, reason: 'Description is missing.' });
      return;
    }
    if (!Number.isFinite(amount) || amount === 0) {
      rejected.push({ rowNumber: row.rowNumber, reason: 'Amount must be non-zero.' });
      return;
    }
    const rawScope = rowValue(document, row, mapping.scope).toLowerCase();
    const scope = ['personal', 'business', 'shared'].includes(rawScope) ? rawScope : defaultScope;
    const transaction = {
      date,
      description,
      amount: Math.round(amount * 100) / 100,
      categoryId: rowValue(document, row, mapping.category) || defaultCategory,
      scope,
    };
    transaction.fingerprint = buildCsvFingerprint(transaction);
    if (existing.has(transaction.fingerprint) || seen.has(transaction.fingerprint)) {
      duplicates.push(transaction);
      return;
    }
    seen.add(transaction.fingerprint);
    rows.push(transaction);
  });
  return { rows, rejected, duplicates, sourceFile: String(options.sourceFile || 'pasted-transactions.csv') };
}

export function csvDelimiterLabel(delimiter) {
  return delimiter === '\t' ? 'Tab' : delimiter === ';' ? 'Semicolon' : 'Comma';
}
