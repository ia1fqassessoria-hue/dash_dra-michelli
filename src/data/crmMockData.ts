import { CrmHealthMetric, PipelineStageData, LeadSourceData, SlaData, ForecastData, PeriodFilter } from '../types';

export function getPeriodMultiplier(period: PeriodFilter): { factor: number; label: string } {
  switch (period) {
    case 'today':
      return { factor: 0.12, label: 'Hoje' };
    case '7days':
      return { factor: 0.35, label: 'Últimos 7 dias' };
    case '30days':
      return { factor: 1.0, label: 'Últimos 30 dias' };
    case 'this_month':
      return { factor: 0.85, label: 'Este Mês' };
    case 'last_month':
      return { factor: 1.15, label: 'Mês Passado' };
    case 'custom':
      return { factor: 0.9, label: 'Período Personalizado' };
    default:
      return { factor: 1.0, label: 'Últimos 30 dias' };
  }
}

export function getCrmMetrics(period: PeriodFilter): CrmHealthMetric[] {
  const { factor } = getPeriodMultiplier(period);
  
  const leadsVal = Math.round(1420 * factor);
  const mqlVal = Math.round(680 * factor);
  const dealsVal = Math.round(210 * factor);
  const revenueVal = Math.round(845000 * factor);

  return [
    {
      id: 'conversion_rate',
      title: 'Taxa de Conversão Global',
      value: '22.8%',
      changePercent: 3.4,
      isPositive: true,
      target: '20.0%',
      status: 'healthy',
      description: 'Lead Qualificado (SQL) para Venda Fechada',
      category: 'pipeline',
    },
    {
      id: 'sla_first_contact',
      title: 'Tempo Médio de 1º Contato (SLA)',
      value: '14 min',
      changePercent: -18.5, // lower time is better
      isPositive: true,
      target: '< 15 min',
      status: 'healthy',
      description: 'Tempo até a equipe responder novos leads no CRM',
      unit: 'minutos',
      category: 'sla',
    },
    {
      id: 'neglected_leads',
      title: 'Leads Negligenciados (> 48h)',
      value: Math.max(2, Math.round(18 * factor)),
      changePercent: 12.0,
      isPositive: false,
      target: '0 leads',
      status: 'warning',
      description: 'Oportunidades sem interação nos últimos 2 dias',
      category: 'sla',
    },
    {
      id: 'avg_ticket',
      title: 'Ticket Médio por Contrato',
      value: `R$ ${(4250 + Math.round(120 * factor)).toLocaleString('pt-BR')}`,
      changePercent: 5.2,
      isPositive: true,
      target: 'R$ 4.000',
      status: 'healthy',
      description: 'Valor médio das oportunidades ganhas no período',
      category: 'revenue',
    },
    {
      id: 'sales_cycle',
      title: 'Ciclo Médio de Venda',
      value: '18.4 dias',
      changePercent: -2.1,
      isPositive: true,
      target: '15 dias',
      status: 'healthy',
      description: 'Tempo médio do 1º contato ao fechamento do contrato',
      category: 'pipeline',
    },
    {
      id: 'total_mrr',
      title: 'Receita Ganha no CRM',
      value: `R$ ${revenueVal.toLocaleString('pt-BR')}`,
      changePercent: 14.8,
      isPositive: true,
      target: `R$ ${Math.round(800000 * factor).toLocaleString('pt-BR')}`,
      status: 'healthy',
      description: 'Soma do valor das vendas ganhas no Supabase/CRM',
      category: 'revenue',
    },
  ];
}

export function getPipelineFunnelData(period: PeriodFilter): PipelineStageData[] {
  const { factor } = getPeriodMultiplier(period);

  return [
    {
      stage: '1. Inbound Leads (Novos)',
      count: Math.round(1450 * factor),
      value: Math.round(5800000 * factor),
      conversionRate: 100,
    },
    {
      stage: '2. Qualificados (MQL)',
      count: Math.round(720 * factor),
      value: Math.round(3600000 * factor),
      conversionRate: 49.6,
    },
    {
      stage: '3. Reunião / Agendado (SQL)',
      count: Math.round(410 * factor),
      value: Math.round(2460000 * factor),
      conversionRate: 56.9,
    },
    {
      stage: '4. Proposta Enviada',
      count: Math.round(230 * factor),
      value: Math.round(1610000 * factor),
      conversionRate: 56.1,
    },
    {
      stage: '5. Negociação Final',
      count: Math.round(115 * factor),
      value: Math.round(920000 * factor),
      conversionRate: 50.0,
    },
    {
      stage: '6. Contrato Ganho (Won)',
      count: Math.round(93 * factor),
      value: Math.round(845000 * factor),
      conversionRate: 80.8,
    },
  ];
}

export function getLeadSourceData(period: PeriodFilter): LeadSourceData[] {
  const { factor } = getPeriodMultiplier(period);

  return [
    {
      source: 'Google Ads (Search)',
      leads: Math.round(540 * factor),
      qualified: Math.round(290 * factor),
      conversion: 24.5,
      mrr: Math.round(320000 * factor),
    },
    {
      source: 'Inbound Organic (SEO)',
      leads: Math.round(380 * factor),
      qualified: Math.round(210 * factor),
      conversion: 28.2,
      mrr: Math.round(245000 * factor),
    },
    {
      source: 'Meta Ads (Instagram/FB)',
      leads: Math.round(310 * factor),
      qualified: Math.round(120 * factor),
      conversion: 14.8,
      mrr: Math.round(115000 * factor),
    },
    {
      source: 'Indicação / Referral',
      leads: Math.round(120 * factor),
      qualified: Math.round(95 * factor),
      conversion: 42.1,
      mrr: Math.round(180000 * factor),
    },
    {
      source: 'Outbound / LinkedIn B2B',
      leads: Math.round(100 * factor),
      qualified: Math.round(65 * factor),
      conversion: 31.0,
      mrr: Math.round(140000 * factor),
    },
  ];
}

export function getSlaTeamData(): SlaData[] {
  return [
    {
      rep: 'Lucas Silva',
      avgFirstContactMinutes: 8,
      openDeals: 34,
      staleDeals: 1,
      closeRate: 26.4,
    },
    {
      rep: 'Mariana Costa',
      avgFirstContactMinutes: 11,
      openDeals: 42,
      staleDeals: 2,
      closeRate: 24.1,
    },
    {
      rep: 'Gabriel Santos',
      avgFirstContactMinutes: 19,
      openDeals: 28,
      staleDeals: 5,
      closeRate: 19.8,
    },
    {
      rep: 'Camila Rocha',
      avgFirstContactMinutes: 12,
      openDeals: 38,
      staleDeals: 1,
      closeRate: 23.5,
    },
    {
      rep: 'Rafael Lima',
      avgFirstContactMinutes: 27,
      openDeals: 31,
      staleDeals: 9,
      closeRate: 15.2,
    },
  ];
}

export function getForecastData(): ForecastData[] {
  return [
    { period: 'Jan', realized: 620000, pipelineValue: 1200000, target: 600000 },
    { period: 'Fev', realized: 680000, pipelineValue: 1350000, target: 650000 },
    { period: 'Mar', realized: 740000, pipelineValue: 1400000, target: 700000 },
    { period: 'Abr', realized: 710000, pipelineValue: 1300000, target: 720000 },
    { period: 'Mai', realized: 790000, pipelineValue: 1550000, target: 750000 },
    { period: 'Jun', realized: 845000, pipelineValue: 1680000, target: 800000 },
    { period: 'Jul (Proj)', realized: 0, pipelineValue: 1850000, target: 850000 },
    { period: 'Ago (Proj)', realized: 0, pipelineValue: 1920000, target: 900000 },
  ];
}
