import type { CsvColumnMapping, CsvImportPreview, CsvTransactionRow, FinanceScope } from '../types/finance';

export interface CsvDocument {
  delimiter: string;
  headers: string[];
  rows: Array<{ rowNumber: number; values: string[] }>;
}

declare function parseCsvLine(line: string, delimiter: string): string[];
export function detectCsvDelimiter(headerRow: string): string;
export function parseCsvDocument(raw: string): CsvDocument;
export function inferCsvColumnMapping(headers: string[]): CsvColumnMapping;
declare function buildCsvFingerprint(row: Pick<CsvTransactionRow, 'date' | 'description' | 'amount'>): string;
export function buildCsvImportPreview(document: CsvDocument, mapping: CsvColumnMapping, options?: {
  existingFingerprints?: string[];
  defaultCategory?: string;
  defaultScope?: FinanceScope;
  sourceFile?: string;
}): CsvImportPreview;
export function csvDelimiterLabel(delimiter: string): string;
