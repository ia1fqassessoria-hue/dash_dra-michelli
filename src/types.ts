export type PeriodFilter = 'today' | '7days' | '30days' | '90days' | 'this_month' | 'last_month' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MetabaseCard {
  id: number;
  name: string;
  description?: string;
  display?: string;
  collection_id?: number;
  dataset_query?: any;
}

export interface MetabaseCardQueryResponse {
  data?: {
    cols?: Array<{ name: string; display_name: string; base_type: string }>;
    rows?: Array<Array<any>>;
    native_form?: { query: string };
  };
  error?: string;
  status?: string;
}

export interface MetabaseConnectionStatus {
  connected: boolean;
  baseUrl: string;
  responseTimeMs?: number;
  cardsCount?: number;
  cardsSample?: MetabaseCard[];
  error?: string;
}

export interface CardMapping {
  pipelineFunnelCardId?: number;
  leadSourceCardId?: number;
  slaPerformanceCardId?: number;
  revenueForecastCardId?: number;
  conversionRateCardId?: number;
  negotiationCycleCardId?: number;
}

export interface CrmHealthMetric {
  id: string;
  title: string;
  value: string | number;
  changePercent: number;
  isPositive: boolean;
  target?: string;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  unit?: string;
  category: 'pipeline' | 'sla' | 'revenue' | 'leads';
}

export interface PipelineStageData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

export interface LeadSourceData {
  source: string;
  leads: number;
  qualified: number;
  conversion: number;
  mrr: number;
}

export interface SlaData {
  rep: string;
  avgFirstContactMinutes: number;
  openDeals: number;
  staleDeals: number;
  closeRate: number;
}

export interface ForecastData {
  period: string;
  realized: number;
  pipelineValue: number;
  target: number;
}
