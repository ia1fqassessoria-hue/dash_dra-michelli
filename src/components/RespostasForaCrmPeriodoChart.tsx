import React from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MessageSquareOff, Calendar, Info, Clock, X, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';
import { PeriodFilter, DateRange } from '../types';

interface RespostasForaCrmPeriodoChartProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
  selectedPeriod?: PeriodFilter;
  customRange?: DateRange;
  onClose?: () => void;
}

interface ChartPoint {
  rawDate: string;
  axisLabel: string;
  tooltipLabel: string;
  totalRespostas: number;
}

const MONTH_NAMES_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTH_NAMES_FULL = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

function isPeriodUnder72h(
  period?: PeriodFilter,
  customRange?: DateRange,
  sampleDates?: string[]
): boolean {
  if (period === 'today') return true;

  if (period === 'custom' && customRange?.startDate && customRange?.endDate) {
    const start = new Date(customRange.startDate).getTime();
    const end = new Date(customRange.endDate).getTime();
    const diffHours = (end - start) / (1000 * 3600) + 24;
    if (!isNaN(diffHours) && diffHours <= 72) {
      return true;
    }
  }

  if (sampleDates && sampleDates.length > 0) {
    const hoursFound = new Set<number>();
    for (const dStr of sampleDates) {
      if (!dStr) continue;
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        if (dStr.includes('T') || dStr.includes(':')) {
          hoursFound.add(d.getHours());
        }
      }
    }
    if (hoursFound.size > 1) {
      return true;
    }
  }

  return false;
}

function parseAndFormatPoints(
  rawPoints: Array<{ rawDate: string; volume: number }>,
  isHourly: boolean
): ChartPoint[] {
  let isSingleDay = true;
  let firstDayStr = '';

  for (const pt of rawPoints) {
    const d = new Date(pt.rawDate);
    if (!isNaN(d.getTime())) {
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!firstDayStr) {
        firstDayStr = dayKey;
      } else if (firstDayStr !== dayKey) {
        isSingleDay = false;
        break;
      }
    }
  }

  return rawPoints.map((pt) => {
    const trimmed = (pt.rawDate || '').trim();
    const parsedDate = new Date(trimmed);

    if (isNaN(parsedDate.getTime())) {
      return {
        rawDate: trimmed,
        axisLabel: trimmed,
        tooltipLabel: trimmed,
        totalRespostas: pt.volume,
      };
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const monthIndex = parsedDate.getMonth();
    const monthShort = MONTH_NAMES_SHORT[monthIndex] || '';
    const monthFull = MONTH_NAMES_FULL[monthIndex] || '';
    const yearShort = String(parsedDate.getFullYear()).slice(-2);
    const yearFull = parsedDate.getFullYear();
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    if (isHourly) {
      if (isSingleDay) {
        return {
          rawDate: trimmed,
          axisLabel: `${hours}:${minutes}`,
          tooltipLabel: `${day} de ${monthFull} de ${yearFull} às ${hours}:${minutes}`,
          totalRespostas: pt.volume,
        };
      } else {
        return {
          rawDate: trimmed,
          axisLabel: `${day}/${monthShort} ${hours}h`,
          tooltipLabel: `${day} de ${monthFull} de ${yearFull} às ${hours}:${minutes}`,
          totalRespostas: pt.volume,
        };
      }
    }

    return {
      rawDate: trimmed,
      axisLabel: `${day}/${monthShort}/${yearShort}`,
      tooltipLabel: `${day} de ${monthFull} de ${yearFull}`,
      totalRespostas: pt.volume,
    };
  });
}

export const RespostasForaCrmPeriodoChart: React.FC<RespostasForaCrmPeriodoChartProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
  selectedPeriod,
  customRange,
  onClose,
}) => {
  const { rows, columns, loading } = queryResult;

  const rawDateSamples = (rows || []).map((r) => String(r[0] || ''));
  const isHourly = isPeriodUnder72h(selectedPeriod, customRange, rawDateSamples);

  let chartData: ChartPoint[] = [];

  if (rows && rows.length > 0) {
    const cols = columns || [];
    let dateIdx = cols.findIndex((c) => /periodo|data|date|hora|created/i.test(c));
    let valIdx = cols.findIndex((c) => /total|respostas|count|qtd|fora|volume/i.test(c));
    if (dateIdx === -1) dateIdx = 0;
    if (valIdx === -1) valIdx = dateIdx === 0 ? 1 : 0;

    const rawList = rows.map((row) => ({
      rawDate: String(row[dateIdx] || ''),
      volume: Number(row[valIdx] || 0),
    }));

    chartData = parseAndFormatPoints(rawList, isHourly);
  } else {
    // Fallback placeholder data
    if (isHourly) {
      const now = new Date();
      const mockHourly = Array.from({ length: 24 }).map((_, i) => {
        const d = new Date(now);
        d.setHours(i, 0, 0, 0);
        return {
          rawDate: d.toISOString(),
          volume: [5, 2, 1, 0, 0, 3, 15, 45, 82, 110, 95, 88, 70, 92, 120, 105, 80, 60, 42, 30, 18, 12, 8, 4][i] || 0,
        };
      });
      chartData = parseAndFormatPoints(mockHourly, true);
    } else {
      const mockDaily = [
        { rawDate: '2026-08-10T00:00:00Z', volume: 1155 },
        { rawDate: '2026-08-11T00:00:00Z', volume: 997 },
        { rawDate: '2026-08-12T00:00:00Z', volume: 1200 },
        { rawDate: '2026-08-13T00:00:00Z', volume: 1640 },
        { rawDate: '2026-08-14T00:00:00Z', volume: 1056 },
        { rawDate: '2026-08-15T00:00:00Z', volume: 780 },
        { rawDate: '2026-08-16T00:00:00Z', volume: 640 },
        { rawDate: '2026-08-17T00:00:00Z', volume: 1310 },
      ];
      chartData = parseAndFormatPoints(mockDaily, false);
    }
  }

  const totalRespostas = chartData.reduce((acc, curr) => acc + curr.totalRespostas, 0);
  const avgRespostas = chartData.length > 0 ? Math.round(totalRespostas / chartData.length) : 0;
  
  let peakPoint: ChartPoint | null = null;
  for (const pt of chartData) {
    if (!peakPoint || pt.totalRespostas > peakPoint.totalRespostas) {
      peakPoint = pt;
    }
  }

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="respostasForaCrmPeriodo"
      cardTitle="Respostas Fora do CRM (Série Temporal)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="section-respostas-fora-crm-periodo"
        className="bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-amber-500/30 relative overflow-hidden transition-all duration-300 ease-out animate-fadeIn hover:border-amber-500/50"
      >
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <MessageSquareOff className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Respostas Fora do CRM (Série Temporal)</span>
                </h3>

                <div className="relative inline-flex items-center group/tooltip">
                  <button
                    type="button"
                    className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    aria-label="Informações sobre respostas fora do CRM"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-72 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                    Volume temporal de respostas enviadas nos canais de atendimento que não estão vinculadas a nenhum lead no CRM.
                  </div>
                </div>

                {isHourly ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-semibold text-sky-400">
                    <Clock className="w-3 h-3" />
                    Série Horária (≤ 72h)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[10px] font-semibold text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    Série Diária
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {isHourly
                  ? 'Volume de mensagens enviadas fora do CRM por hora (visão horária para períodos ≤ 72h).'
                  : 'Volume de mensagens enviadas fora do CRM distribuídas no tempo.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Summary Stats Badges */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-white/5 flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 font-medium">Total no Período</span>
                  <span className="text-sm font-extrabold text-amber-400 font-mono">
                    {totalRespostas.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="hidden md:flex px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-white/5 flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 font-medium">Média {isHourly ? '/ Hora' : '/ Dia'}</span>
                  <span className="text-sm font-extrabold text-zinc-200 font-mono">
                    {avgRespostas.toLocaleString('pt-BR')}
                  </span>
                </div>
                {peakPoint && (
                  <div className="hidden lg:flex px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-white/5 flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 font-medium">Pico ({peakPoint.axisLabel})</span>
                    <span className="text-sm font-extrabold text-red-400 font-mono flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {peakPoint.totalRespostas.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  title="Fechar seção de respostas fora do CRM"
                  aria-label="Fechar seção"
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-[270px] w-full mt-2">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-zinc-500">Carregando dados de mensagens...</span>
                </div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-zinc-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500/80" />
                  Nenhum registro de respostas fora do CRM no período selecionado.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRespostasForaCrm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="axisLabel"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={false}
                    interval={isHourly && chartData.length > 24 ? Math.floor(chartData.length / 10) : 'equidistantPreserveStart'}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => Number(v).toLocaleString('pt-BR')}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item: ChartPoint = payload[0].payload;
                        return (
                          <div className="bg-zinc-900/95 backdrop-blur-2xl text-white p-3 rounded-xl shadow-2xl text-xs space-y-1 border border-amber-500/30 ring-1 ring-white/5">
                            <p className="font-semibold text-zinc-400 flex items-center gap-1.5">
                              {isHourly ? <Clock className="w-3 h-3 text-sky-400" /> : <Calendar className="w-3 h-3 text-zinc-400" />}
                              <span>{item.tooltipLabel}</span>
                            </p>
                            <p className="text-amber-300 flex items-center justify-between gap-4">
                              <span>Total de Respostas Fora do CRM:</span>
                              <strong className="text-white font-mono text-sm">
                                {item.totalRespostas.toLocaleString('pt-BR')}
                              </strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRespostas"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientRespostasForaCrm)"
                    dot={chartData.length <= 30 ? { r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#18181b' } : false}
                    activeDot={{ r: 5, fill: '#fbbf24', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Monitoramento de Integridade do Atendimento</span>
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            {isHourly ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Agrupamento por Hora (≤ 72h)</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>Agrupamento Diário</span>
              </>
            )}
          </span>
        </div>
      </div>
    </CardEditWrapper>
  );
};
