import type { FinanceMonthCloseSummary } from '../types/finance';

export function buildMonthCloseSummary(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  reviewQueue?: Array<Record<string, any>>;
  forecast?: Record<string, any>;
  nowIso?: string;
}): FinanceMonthCloseSummary;
