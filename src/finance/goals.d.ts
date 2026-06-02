import type {
  FinanceGoalProgress,
  FinanceGoalState,
  FinanceReviewState,
  FinanceScopeFilter,
} from '../types/finance';

export function normalizeReviewState(input: unknown): FinanceReviewState;
export function normalizeGoalState(input: unknown): FinanceGoalState;
export function calculateGoalProgress(
  goalState: unknown,
  accounts: Array<Record<string, unknown>>,
  filter?: FinanceScopeFilter,
): FinanceGoalProgress[];
export function isWeeklyReviewDue(lastReviewedAt: unknown, nowIso?: string): boolean;
