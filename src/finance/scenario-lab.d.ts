import type { FinanceSavedScenario, FinanceScenarioType } from '../types/finance';

export interface ScenarioLabMetrics {
  safeToSpend: number;
  availableCash: number;
  monthlyBurn: number;
  runway: number | null;
  debtPressure: number;
  reserveGap: number;
  protectedCash: number;
}

export interface ScenarioLabResult extends FinanceSavedScenario {
  base: ScenarioLabMetrics;
  adjusted: ScenarioLabMetrics;
  delta: {
    safeToSpend: number;
    availableCash: number;
    monthlyBurn: number;
    runway: number | null;
    debtPressure: number;
    reserveGap: number;
  };
  impactScore: number;
  warnings: string[];
}

export function buildScenarioLab(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  forecast?: Record<string, any>;
  decisionEngine?: Record<string, any>;
  savedScenarios?: FinanceSavedScenario[];
  nowIso?: string;
}): {
  generatedAt: string;
  base: ScenarioLabMetrics;
  recommended: FinanceSavedScenario[];
  saved: FinanceSavedScenario[];
  comparable: ScenarioLabResult[];
  topScenario: ScenarioLabResult | null;
  warnings: Array<{ scenarioId: string; warning: string }>;
};

export type { FinanceScenarioType };
