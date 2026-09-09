import React, { useMemo } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { UserCheck, Clock, AlertTriangle, Info, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface InatividadeVendedorChartProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface InatividadeItem {
  vendedor: string;
  shortName: string;
  quantidadeLeads: number;
  mediaDiasParado: number;
  urgencyColor: string;
}

export const InatividadeVendedorChart: React.FC<InatividadeVendedorChartProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const { rows, loading } = queryResult;

  const { items, overallAvgDays, totalActiveLeads } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { items: [], overallAvgDays: 0, totalActiveLeads: 0 };
    }

    let sumDaysWeighted = 0;
    let sumLeads = 0;

    const list: InatividadeItem[] = rows.map((r) => {
      const vendedor = String(r[0] || 'Não identificado').trim();
      const quantidadeLeads = Number(r[1] || 0);
      const mediaDiasParado = Number(r[2] || 0);

      sumDaysWeighted += mediaDiasParado * quantidadeLeads;
      sumLeads += quantidadeLeads;

      let urgencyColor = '#3b82f6'; // Blue (< 5 days)
      if (mediaDiasParado >= 10) {
        urgencyColor = '#ef4444'; // Red (>= 10 days)
      } else if (mediaDiasParado >= 5) {
        urgencyColor = '#f59e0b'; // Amber (5 - 10 days)
      }

      const shortName = vendedor.includes('@')
        ? vendedor.split('@')[0]
        : vendedor.length > 16
        ? `${vendedor.slice(0, 16)}...`
        : vendedor;

      return {
        vendedor,
        shortName,
        quantidadeLeads,
        mediaDiasParado,
        urgencyColor,
      };
    });

    const avg = sumLeads > 0 ? sumDaysWeighted / sumLeads : 0;

    return { items: list, overallAvgDays: avg, totalActiveLeads: sumLeads };
  }, [rows]);

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="inatividadeVendedor"
      cardTitle="Tempo de Inatividade por Vendedor (Funil de Vendas)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="card-inatividade-por-vendedor"
        className="bg-zinc-900/40 hover:bg-zinc-900/70 rounded-2xl p-6 sm:p-7 border border-white/5 ring-1 ring-white/5 backdrop-blur-2xl shadow-xl transition-all duration-500 ease-out"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Tempo de Inatividade por Vendedor</span>
              </h3>

              <div className="relative inline-flex items-center group/tooltip shrink-0">
                <button
                  type="button"
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  aria-label="Informações sobre tempo de inatividade"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-80 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                  Média de dias corridos que os leads no Funil de Vendas ficam sem atualização ou movimentação de etapa, agrupado por vendedor.
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-transparent text-[10px] font-medium text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                Leads Ativos
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Dias sem contato ou avanço de etapa, considerando apenas leads ativos da carteira.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-medium">Média da Equipe:</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">
                {overallAvgDays.toFixed(1).replace('.', ',')} dias
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-medium">Total de Leads Ativos:</span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">
                {totalActiveLeads.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 mt-1 min-h-[220px] max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />
          ) : items.length === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-zinc-500">
              Nenhum dado de inatividade disponível no momento.
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...items]
                .sort((a, b) => b.mediaDiasParado - a.mediaDiasParado)
                .map((item) => {
                const maxDays = Math.max(...items.map(d => d.mediaDiasParado));
                const widthPercent = maxDays > 0 ? (item.mediaDiasParado / maxDays) * 100 : 0;
                
                // Color based on days
                const isRed = item.mediaDiasParado >= 10;
                const isAmber = item.mediaDiasParado >= 5 && item.mediaDiasParado < 10;
                
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
                            <span>{item.quantidadeLeads.toLocaleString('pt-BR')} leads ativos</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className={`text-base font-mono font-bold ${textColor}`}>
                          {item.mediaDiasParado.toFixed(1).replace('.', ',')}
                          <span className="text-[10px] text-zinc-500 font-sans font-normal ml-0.5">dias</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {isRed ? 'Atenção Crítica' : isAmber ? 'Alerta' : 'Regular'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Posição atual da carteira</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="text-zinc-500">Considera oportunidades ativas no pipeline 'Funil de Vendas'</span>
          </span>
          <span className="text-zinc-400 font-medium font-mono">
            {items.length} responsáveis acompanhados
          </span>
        </div>
      </div>
    </CardEditWrapper>
  );
};
