import React, { useMemo } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { Users, Clock, Info, Zap, ArrowUpDown } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface PerformanceVendedorChartProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface VendedorPerfData {
  vendedor: string;
  shortName: string;
  tempoAtendimentoHoras: number;
  volumeLeads: number;
}

export const PerformanceVendedorChart: React.FC<PerformanceVendedorChartProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const { rows, columns, loading } = queryResult;

  const { chartData, avgTempoAtendimento } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { chartData: [], avgTempoAtendimento: 0 };
    }

    const cols = (columns || []).map((c) => String(c).toLowerCase());

    // 1. Vendedor (col 0)
    let vendedorIdx = cols.findIndex((c) => /nome|vendedor|usuario|user|operador|agent|atendente/i.test(c));
    if (vendedorIdx === -1) vendedorIdx = 0;

    // 2. Volume de Leads Atendidos (col 1)
    let leadsIdx = cols.findIndex((c) => /volume|total|lead|count|qtd|atendido/i.test(c));
    if (leadsIdx === -1) leadsIdx = 1;

    // 3. Tempo Médio de Atendimento (h) (col 2)
    let tempoIdx = cols.findIndex((c) => /tempo|hora|hour|avg|media|resposta|atendimento/i.test(c));
    if (tempoIdx === -1) tempoIdx = 2;

    let sumVolume = 0;
    let weightedTime = 0;

    const list: VendedorPerfData[] = rows.map((row) => {
      const vendedor = String(row[vendedorIdx] || 'Desconhecido').trim();
      const volumeLeads = Number(row[leadsIdx] ?? 0);
      const tempoAtendimentoHoras = Number(row[tempoIdx] ?? 0);

      sumVolume += volumeLeads;
      weightedTime += tempoAtendimentoHoras * volumeLeads;

      const shortName = vendedor.includes('@')
        ? vendedor.split('@')[0]
        : vendedor.length > 18
        ? `${vendedor.slice(0, 18)}...`
        : vendedor;

      return {
        vendedor,
        shortName,
        tempoAtendimentoHoras: isNaN(tempoAtendimentoHoras) ? 0 : tempoAtendimentoHoras,
        volumeLeads: isNaN(volumeLeads) ? 0 : volumeLeads,
      };
    });

    const avgTempo = sumVolume > 0 ? weightedTime / sumVolume : 0;

    return {
      chartData: list,
      avgTempoAtendimento: avgTempo,
    };
  }, [rows, columns]);

  // Sort strictly by response time (highest to lowest for vertical bar ranking)
  const sortedData = useMemo(() => {
    const data = [...chartData];
    return data.sort((a, b) => b.tempoAtendimentoHoras - a.tempoAtendimentoHoras);
  }, [chartData]);

  const fastestSeller = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => a.tempoAtendimentoHoras - b.tempoAtendimentoHoras)[0];
  }, [chartData]);

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="performanceUsuario"
      cardTitle="Performance por Usuário (Tempo de Atendimento)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="card-performance-por-vendedor"
        className="bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-white/10 relative transition-all duration-300 flex flex-col justify-between h-full hover:border-white/20"
      >
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white font-display tracking-tight flex items-center gap-2">
                  <span>Performance por Usuário</span>
                </h2>
                <div className="relative inline-flex items-center group/tooltip shrink-0">
                  <button
                    type="button"
                    className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    aria-label="Informações sobre performance por usuário"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-80 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                    Mede o tempo médio (em horas) de atendimento cruzado com o volume de leads trabalhados por cada vendedor.
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-transparent text-[10px] font-medium text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Horas / Leads
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Análise de performance individual considerando o tempo médio (horas) e o volume operado na Clínica.
              </p>
            </div>

            {/* Quick KPI Badge */}
            <div className="flex items-center gap-2 bg-zinc-800/60 px-3.5 py-1.5 rounded-xl border border-white/5 text-xs text-zinc-300">
              <span className="text-[11px] text-zinc-500 font-medium">Média da Equipe:</span>
              <strong className="text-blue-300 font-mono font-extrabold">{avgTempoAtendimento.toFixed(1).replace('.', ',')}h</strong>
            </div>
          </div>

          {/* Highlights Banner */}
          {!loading && chartData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-zinc-400">Média Geral da Equipe:</span>
                </div>
                <span className="font-mono font-bold text-xs text-blue-300">
                  {avgTempoAtendimento.toFixed(1).replace('.', ',')}h
                </span>
              </div>

              {fastestSeller && (
                <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-xs text-zinc-400 truncate">Menor tempo médio:</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-blue-400 shrink-0 ml-2">
                    {fastestSeller.shortName} ({fastestSeller.tempoAtendimentoHoras.toFixed(1)}h)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard List */}
          <div className="flex-1 mt-1 min-h-[220px] max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />
            ) : sortedData.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-zinc-500">
                Nenhum dado de tempo de resposta encontrado no período.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedData.map((item, idx) => {
                  // Since we sort descending, max time is the first item's time, but let's calculate safely
                  const maxTime = Math.max(...chartData.map(d => d.tempoAtendimentoHoras));
                  const widthPercent = maxTime > 0 ? (item.tempoAtendimentoHoras / maxTime) * 100 : 0;
                  
                  // Color based on time (matching previous logic)
                  const isRed = item.tempoAtendimentoHoras > 5;
                  const isAmber = item.tempoAtendimentoHoras > 2 && item.tempoAtendimentoHoras <= 5;
                  
                  const barColor = isRed ? 'bg-red-500/20' : isAmber ? 'bg-amber-500/20' : 'bg-blue-500/20';
                  const textColor = isRed ? 'text-red-400' : isAmber ? 'text-amber-400' : 'text-blue-400';

                  return (
                    <div 
                      key={item.vendedor} 
                      className="relative rounded-xl bg-zinc-950/40 border border-white/5 overflow-hidden group hover:border-white/10 transition-colors"
                    >
                      {/* Progress Bar Background */}
                      <div 
                        className={`absolute left-0 top-0 bottom-0 ${barColor} transition-all duration-1000 ease-out origin-left`}
                        style={{ width: `${Math.max(widthPercent, 2)}%` }} // min 2% so it's always visible
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-300 border border-white/10 shadow-inner shrink-0">
                            {item.shortName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-zinc-200 truncate pr-2">
                              {item.shortName}
                            </div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <span>{item.volumeLeads.toLocaleString('pt-BR')} leads operados</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <div className={`text-base font-mono font-bold ${textColor}`}>
                            {item.tempoAtendimentoHoras.toFixed(1).replace('.', ',')}h
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {isRed ? 'Lento' : isAmber ? 'Atenção' : 'Rápido'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-blue-400" />
            <span>Ordenado por tempo médio de resposta (h)</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="text-zinc-500">Tempo de resposta da equipe pós-automação</span>
          </span>
          <span className="text-zinc-400 font-medium font-mono">
            {chartData.length} atendentes avaliados
          </span>
        </div>
      </div>
    </CardEditWrapper>
  );
};
