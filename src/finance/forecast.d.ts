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

export interface FinanceReserveHealth {
  status: 'funded' | 'partial' | 'thin' | 'unconfigured';
  targetAmount: number;
  currentAmount: number;
  protectedCash: number;
  gap: number;
  coveragePercent: number;
  bucketCount: number;
}

export interface FinanceDangerZoneForecast {
  status: 'unknown' | 'shortfall' | 'tight' | 'clear';
  lowestAmount: number | null;
  lowestDate: string;
  horizonDays: number | null;
  cause: string;
  suggestedAction: string;
}

export interface FinanceWeather {
  state: 'Clear' | 'Stable' | 'Watchful' | 'Tight' | 'Stormy';
  reason: string;
  suggestedAction: string;
}

export interface FinanceTopSignal {
  title: string;
  severity: 'critical' | 'warning' | 'info';
  reason: string;
  recommendedAction: string;
  source: string;
}

export interface RoadmapFinanceMetrics {
  forecast: FinanceForecast;
  reserveHealth: FinanceReserveHealth;
  dangerZone: FinanceDangerZoneForecast;
  financialWeather: FinanceWeather;
  topSignals: FinanceTopSignal[];
}

export const INCOME_STATUS_PROBABILITY_DEFAULTS: Record<string, number>;

export function buildFinanceForecast(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  nowIso?: string;
  horizons?: number[];
}): FinanceForecast;

export function buildReserveHealth(input?: {
  readModel?: Record<string, any>;
  treasury?: Record<string, any>;
}): FinanceReserveHealth;

export function buildDangerZoneForecast(forecast?: Partial<FinanceForecast>): FinanceDangerZoneForecast;

export function buildFinancialWeather(input?: {
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  forecast?: Partial<FinanceForecast>;
  reserveHealth?: FinanceReserveHealth | null;
}): FinanceWeather;

export function buildTopSignals(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  forecast?: Partial<FinanceForecast>;
  reserveHealth?: FinanceReserveHealth | null;
}): FinanceTopSignal[];

export function buildRoadmapFinanceMetrics(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  nowIso?: string;
}): RoadmapFinanceMetrics;
