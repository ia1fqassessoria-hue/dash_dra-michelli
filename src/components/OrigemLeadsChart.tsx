import React, { useMemo, useState } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Compass, Info, Globe, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface OrigemLeadsChartProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface OrigemItem {
  name: string;
  value: number;
  pct: number;
  color: string;
}

const COLOR_PALETTE = [
  '#3b82f6', // Primary Blue
  '#60a5fa', // Light Blue
  '#f59e0b', // Amber / Gold
  '#2563eb', // Royal Blue
  '#eab308', // Yellow
  '#ef4444', // Red
  '#71717a', // Gray
];

export const OrigemLeadsChart: React.FC<OrigemLeadsChartProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { rows, loading } = queryResult;

  const { items, totalLeads, trackablePct } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { items: [], totalLeads: 0, trackablePct: 0 };
    }

    const list: OrigemItem[] = rows.map((r, index) => {
      const name = String(r[0] || 'Não Informado').trim();
      const val = Number(r[1] || 0);
      const pct = Number(r[2] || 0);

      // Give gray to "Não Informado" or "vazio", and vivid colors to tracked channels
      let color = COLOR_PALETTE[index % COLOR_PALETTE.length];
      if (/não informado|vazio|null|sem origem/i.test(name)) {
        color = '#52525b';
      }

      return {
        name,
        value: val,
        pct,
        color,
      };
    });

    const sum = list.reduce((acc, curr) => acc + curr.value, 0);
    const untracked = list.find((i) => /não informado/i.test(i.name))?.value || 0;
    const trackedSum = sum - untracked;
    const trackPct = sum > 0 ? (trackedSum / sum) * 100 : 0;

    return { items: list, totalLeads: sum, trackablePct: trackPct };
  }, [rows]);

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="origemLeads"
      cardTitle="Origem dos Leads"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="card-origem-dos-leads"
        className="bg-zinc-900/40 hover:bg-zinc-900/70 rounded-2xl p-6 sm:p-7 border border-white/5 ring-1 ring-white/5 backdrop-blur-2xl shadow-xl transition-all duration-500 ease-out flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="w-full flex items-start justify-between gap-2 mb-4 text-left focus:outline-none group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] tracking-widest text-zinc-500 font-semibold uppercase block">
                  Atribuição & Marketing
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 group-hover:text-zinc-200 transition-colors">
                    <span>Origem dos Leads</span>
                  </h3>
                  <div className="relative inline-flex items-center group/tooltip shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label="Informações sobre origem dos leads"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      Volume e distribuição dos leads por canal de origem (ex: Tráfego Pago, Orgânico, Indicação), avaliando o rastreamento da captação.
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-[10px] font-medium hidden sm:inline-block ml-2">
                    {isExpanded ? 'Recolher' : 'Clique para expandir'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-zinc-800/80 border border-white/10 text-zinc-300 group-hover:text-white group-hover:bg-zinc-700/80 transition-colors shrink-0">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {/* Content: Donut on Left, Breakdown List on Right */}
          {isExpanded && (
            loading ? (
              <div className="h-44 bg-white/5 animate-pulse rounded-xl my-3 animate-fadeIn" />
            ) : items.length === 0 ? (
              <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-zinc-500 animate-fadeIn">
                Nenhum dado de origem encontrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-3 animate-fadeIn">
              {/* Donut Chart */}
              <div className="sm:col-span-5 relative h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={items}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={3}
                    >
                      {items.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as OrigemItem;
                          return (
                            <div className="bg-zinc-900/95 backdrop-blur-2xl text-white p-2.5 rounded-xl shadow-2xl text-xs space-y-1 border border-white/10">
                              <p className="font-bold text-white flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                                {data.name}
                              </p>
                              <p className="text-zinc-300 flex items-center justify-between gap-3">
                                <span>Volume:</span>
                                <strong className="font-mono text-white">{data.value.toLocaleString('pt-BR')}</strong>
                              </p>
                              <p className="text-blue-300 flex items-center justify-between gap-3">
                                <span>Participação:</span>
                                <strong className="font-mono">{data.pct.toFixed(2)}%</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-zinc-500 font-medium">Rastreado</span>
                  <span className="text-xs font-bold text-blue-400 font-mono">
                    {trackablePct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="sm:col-span-7 space-y-1.5">
                {items.map((item) => (
                  <div
                    key={item.name}
                    className="p-2 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-zinc-300 truncate font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {item.value.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          )}
        </div>

        {/* Footer */}
        {isExpanded && (
          <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between text-[11px] text-zinc-500 animate-fadeIn">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" /> Rastreabilidade de Canais
            </span>
            <span className="font-mono text-zinc-300">
              {trackablePct > 50 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Boa Identificação
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Alto Não Informado
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </CardEditWrapper>
  );
};
