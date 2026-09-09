import React from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Calendar, Info, Clock } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';
import { PeriodFilter, DateRange } from '../types';

interface LeadVelocityChartProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
  selectedPeriod?: PeriodFilter;
  customRange?: DateRange;
}

interface VelocityPoint {
  rawDate: string;
  axisLabel: string;
  tooltipLabel: string;
  volumeLeads: number;
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
    const diffHours = (end - start) / (1000 * 3600) + 24; // inclusive of end date
    if (!isNaN(diffHours) && diffHours <= 72) {
      return true;
    }
  }

  // Also auto-detect if the dataset returned has hour variation (e.g. T01:00, T09:00, etc.)
  if (sampleDates && sampleDates.length > 0) {
    const hoursFound = new Set<number>();
    for (const dStr of sampleDates) {
      if (!dStr) continue;
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        // Check if there is an explicit time component or non-zero hour/minute
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
): VelocityPoint[] {
  // Check if all points belong to a single day
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
      // Fallback if string cannot be parsed as Date directly
      return {
        rawDate: trimmed,
        axisLabel: trimmed,
        tooltipLabel: trimmed,
        volumeLeads: pt.volume,
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
          volumeLeads: pt.volume,
        };
      } else {
        return {
          rawDate: trimmed,
          axisLabel: `${day}/${monthShort} ${hours}h`,
          tooltipLabel: `${day} de ${monthFull} de ${yearFull} às ${hours}:${minutes}`,
          volumeLeads: pt.volume,
        };
      }
    }

    // Daily grouping
    return {
      rawDate: trimmed,
      axisLabel: `${day}/${monthShort}/${yearShort}`,
      tooltipLabel: `${day} de ${monthFull} de ${yearFull}`,
      volumeLeads: pt.volume,
    };
  });
}

export const LeadVelocityChart: React.FC<LeadVelocityChartProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
  selectedPeriod,
  customRange,
}) => {
  const { rows, columns, loading } = queryResult;

  const rawDateSamples = (rows || []).map((r) => String(r[0] || ''));
  const isHourly = isPeriodUnder72h(selectedPeriod, customRange, rawDateSamples);

  let chartData: VelocityPoint[] = [];

  if (rows && rows.length > 0) {
    const cols = (columns || []).map((c) => String(c).toLowerCase());
    let dateIdx = cols.findIndex((c) => /data|date|criacao|created|dia|tempo|periodo|hora/i.test(c));
    let valIdx = cols.findIndex((c) => /count|qtd|total|volume|lead|venda|valor|sum/i.test(c));
    if (dateIdx === -1) dateIdx = 0;
    if (valIdx === -1) valIdx = dateIdx === 0 ? 1 : 0;

    const rawList = rows.map((row) => ({
      rawDate: String(row[dateIdx] || ''),
      volume: Number(row[valIdx] || 0),
    }));

    chartData = parseAndFormatPoints(rawList, isHourly);
  } else {
    // Generate appropriate placeholder data
    if (isHourly) {
      const now = new Date();
      const mockHourly = Array.from({ length: 24 }).map((_, i) => {
        const d = new Date(now);
        d.setHours(i, 0, 0, 0);
        return {
          rawDate: d.toISOString(),
          volume: [0, 0, 0, 1, 1, 2, 5, 12, 18, 25, 30, 28, 22, 26, 32, 29, 21, 15, 12, 8, 5, 3, 1, 0][i] || 0,
        };
      });
      chartData = parseAndFormatPoints(mockHourly, true);
    } else {
      const mockDaily = [
        { rawDate: '2026-07-20T00:00:00Z', volume: 20 },
        { rawDate: '2026-07-22T00:00:00Z', volume: 130 },
        { rawDate: '2026-07-24T00:00:00Z', volume: 60 },
        { rawDate: '2026-07-26T00:00:00Z', volume: 110 },
        { rawDate: '2026-07-28T00:00:00Z', volume: 180 },
        { rawDate: '2026-07-30T00:00:00Z', volume: 170 },
        { rawDate: '2026-08-01T00:00:00Z', volume: 140 },
        { rawDate: '2026-08-03T00:00:00Z', volume: 210 },
        { rawDate: '2026-08-05T00:00:00Z', volume: 130 },
        { rawDate: '2026-08-08T00:00:00Z', volume: 175 },
        { rawDate: '2026-08-11T00:00:00Z', volume: 90 },
        { rawDate: '2026-08-14T00:00:00Z', volume: 155 },
        { rawDate: '2026-08-16T00:00:00Z', volume: 230 },
        { rawDate: '2026-08-17T00:00:00Z', volume: 190 },
      ];
      chartData = parseAndFormatPoints(mockDaily, false);
    }
  }

  const totalLeads = chartData.reduce((acc, curr) => acc + curr.volumeLeads, 0);

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="leadVelocity"
      cardTitle="Volume de Novos Leads (Série Temporal)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 relative transition-all duration-300 flex flex-col justify-between hover:border-white/20">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-display tracking-tight">
                    Volume de Novos Leads no Tempo
                  </h2>
                  <div className="relative inline-flex items-center group/tooltip shrink-0">
                    <button
                      type="button"
                      className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label="Informações sobre Lead Velocity"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      Acompanha a entrada diária ou horária de novos leads criados no CRM (Lead Velocity), permitindo visualizar picos de captação.
                    </div>
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
              <p className="text-xs text-zinc-500 mt-1">
                {isHourly
                  ? 'Evolução por hora de novos leads capturados (visão horária para períodos ≤ 72h).'
                  : 'Evolução diária de novos leads capturados.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-800/60 px-3.5 py-1.5 rounded-full border border-white/5 text-xs font-medium text-zinc-300 self-start sm:self-auto">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Entradas no Período:</span>
              <strong className="text-white font-mono">{totalLeads.toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          {/* Area Chart with Responsive Height */}
          <div className="h-[260px] sm:h-[320px] w-full mt-4">
            {loading ? (
              <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="none" vertical={false} horizontal={false} />
                  <XAxis
                    dataKey="axisLabel"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    interval={isHourly && chartData.length > 24 ? Math.floor(chartData.length / 10) : 'equidistantPreserveStart'}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item: VelocityPoint = payload[0].payload;
                        return (
                          <div className="bg-zinc-900/95 backdrop-blur-2xl text-white p-3 rounded-xl shadow-2xl text-xs space-y-1 border border-white/10 ring-1 ring-white/5">
                            <p className="font-semibold text-zinc-400 flex items-center gap-1.5">
                              {isHourly ? <Clock className="w-3 h-3 text-sky-400" /> : <Calendar className="w-3 h-3 text-zinc-400" />}
                              <span>{item.tooltipLabel}</span>
                            </p>
                            <p className="text-zinc-200">
                              Volume de Leads: <strong className="text-white font-mono">{item.volumeLeads}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volumeLeads"
                    name="Volume de Leads"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVelocity)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#38bdf8', stroke: '#09090b', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Série Temporal</span>
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

