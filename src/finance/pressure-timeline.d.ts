export interface PressureTimelineItem {
  id: string;
  sourceId: string;
  sourceType: 'recurring_cost' | 'debt_plan' | 'income' | 'obligation' | 'reserve';
  kind: string;
  label: string;
  date: string;
  amount: number;
  daysUntil: number;
  route: string;
  focusId?: string;
  focusLabel?: string;
}

export type PressureTimeline = Record<'7d' | '30d' | '90d', PressureTimelineItem[]>;

export function buildPressureTimeline(input?: {
  readModel?: Record<string, any>;
  treasury?: Record<string, any>;
  decisionEngine?: Record<string, any> | null;
  nowIso?: string;
}): PressureTimeline;
