export type DecisionSeverity = 'critical' | 'high' | 'warning' | 'medium' | 'info' | 'opportunity';

export interface DecisionEngineStatus {
  key: string;
  label: string;
  severity: DecisionSeverity;
  explanation: string;
  primaryMetric: string;
  riskTolerance: string;
}

export interface DecisionAction {
  id: string;
  title: string;
  reason: string;
  urgency: string;
  sourceCardId: string;
  actionLabel: string;
  actionRoute: string;
}

export interface DecisionCardOutput {
  id: string;
  title: string;
  status: string;
  urgency: string;
  severity: DecisionSeverity;
  affectedMetric: string;
  explanation: string;
  sourceData: string;
  suggestedAction: string;
  actionLabel: string;
  actionRoute: string;
  optionalScenario: boolean;
  metricImpact: string;
  sourceIds: string[];
  trigger: string;
  why: string;
  source: string;
}

export interface DecisionTimelineItem {
  id: string;
  label: string;
  date: string;
  amount: number;
  kind: string;
  sourceId: string;
}

export interface DecisionScenarioShortcut {
  id: string;
  label: string;
  route: string;
  mode: 'display_only';
}

export interface DecisionEngineOutput {
  generatedAt: string;
  status: DecisionEngineStatus;
  weeklyFocus: DecisionAction[];
  decisionCards: DecisionCardOutput[];
  warnings: DecisionCardOutput[];
  opportunities: DecisionCardOutput[];
  pressureTimeline: Record<'7d' | '30d' | '90d', DecisionTimelineItem[]>;
  scenarioShortcuts: DecisionScenarioShortcut[];
}

export function buildDecisionEngine(input?: {
  readModel?: Record<string, any>;
  snapshot?: Record<string, any>;
  treasury?: Record<string, any>;
  forecast?: Record<string, any>;
  roadmapMetrics?: Record<string, any>;
  reviewState?: Record<string, any>;
  settings?: Record<string, any>;
  nowIso?: string;
}): DecisionEngineOutput;
