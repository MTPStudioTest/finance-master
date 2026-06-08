import type {
  FinanceGoalProgress,
  FinanceGoalState,
  FinanceMonthCloseSummary,
  FinanceReviewState,
  FinanceScopeFilter,
} from '../types/finance';

export function normalizeReviewState(input: unknown): FinanceReviewState;
export function buildWeeklyReviewState(input?: {
  previousReview?: unknown;
  summary: FinanceMonthCloseSummary;
  accounts?: Array<{ accountId: string; balance: number }>;
  checklist?: Partial<FinanceReviewState['checklist']>;
  nowIso?: string;
  notes?: string;
  chosenFocus?: { id: string; title?: string } | null;
}): FinanceReviewState;
export function normalizeGoalState(input: unknown): FinanceGoalState;
export function calculateGoalProgress(
  goalState: unknown,
  accounts: Array<Record<string, unknown>>,
  filter?: FinanceScopeFilter,
): FinanceGoalProgress[];
export function isWeeklyReviewDue(lastReviewedAt: unknown, nowIso?: string): boolean;
