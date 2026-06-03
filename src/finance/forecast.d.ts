export interface FinanceForecastHorizon {
  days: number;
  horizonEnd: string;
  conservative: number;
  expected: number;
  optimistic: number;
  components: {
    startingAvailableCash: number;
    recurringObligations: number;
    debtPaymentPlans: number;
    reserveTargetGap: number;
    reserveMovements: number;
    conservativeIncome: number;
    expectedIncome: number;
    optimisticIncome: number;
  };
}

export interface FinanceForecast {
  generatedAt: string;
  horizons: FinanceForecastHorizon[];
  byHorizon: Record<string, FinanceForecastHorizon>;
  warnings: string[];
  lowestExpected: number | null;
}

export const INCOME_STATUS_PROBABILITY_DEFAULTS: Record<string, number>;

export function buildFinanceForecast(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  nowIso?: string;
  horizons?: number[];
}): FinanceForecast;
