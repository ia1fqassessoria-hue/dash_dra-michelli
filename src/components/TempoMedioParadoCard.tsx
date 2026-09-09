import React, { useState } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface TempoMedioParadoCardProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface StageIdleData {
  stage: string;
  days: number;
  percentage: number;
  colorClass: string;
}

const STAGE_COLORS = [
  'bg-blue-600/30 border-blue-400/40 text-blue-100 hover:bg-blue-600/40',
  'bg-sky-600/30 border-sky-400/40 text-sky-100 hover:bg-sky-600/40',
  'bg-amber-600/30 border-amber-400/40 text-amber-100 hover:bg-amber-600/40',
  'bg-blue-700/30 border-blue-500/40 text-blue-100 hover:bg-blue-700/40',
  'bg-yellow-600/30 border-yellow-400/40 text-yellow-100 hover:bg-yellow-600/40',
  'bg-red-600/30 border-red-400/40 text-red-100 hover:bg-red-600/40',
  'bg-orange-600/30 border-orange-400/40 text-orange-100 hover:bg-orange-600/40',
  'bg-blue-800/30 border-blue-600/40 text-blue-100 hover:bg-blue-800/40',
];

export const TempoMedioParadoCard: React.FC<TempoMedioParadoCardProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { rows, columns, loading } = queryResult;

  let stages: StageIdleData[] = [];
  let totalDays = 0;

  if (rows && rows.length > 0) {
    const cols = (columns || []).map((c) => String(c).toLowerCase());
    let stageIdx = cols.findIndex((c) => /etapa|stage|funil|pipeline|status|nome/i.test(c));
    let daysIdx = cols.findIndex((c) => /dias|days|tempo|permanencia|media|avg/i.test(c));
    let pctIdx = cols.findIndex((c) => /pct|porcentagem|percent|representatividade/i.test(c));

    if (stageIdx === -1) stageIdx = 0;
    if (daysIdx === -1) daysIdx = stageIdx === 0 ? 1 : 0;
    if (pctIdx === -1) pctIdx = 2;

    stages = rows.map((row, idx) => {
      const stageName = String(row[stageIdx] || 'Etapa Não Definida');
      const days = parseFloat(Number(row[daysIdx] || 0).toFixed(2));
      const percentage = row[pctIdx] !== undefined ? parseFloat(Number(row[pctIdx] || 0).toFixed(2)) : 0;
      totalDays += days;

      return {
        stage: stageName,
        days,
        percentage,
        colorClass: STAGE_COLORS[idx % STAGE_COLORS.length],
      };
    });
  } else {
    const defaultData = [
      { stage: 'erro de envio de mensagem', days: 74.18, percentage: 24.67 },
      { stage: 'têm interesse', days: 49.98, percentage: 16.62 },
      { stage: 'não respondeu', days: 48.5, percentage: 16.13 },
      { stage: 'não tem interesse', days: 39.73, percentage: 13.21 },
      { stage: 'Venda ganha', days: 38.77, percentage: 12.90 },
      { stage: 'Em atendimento', days: 30.96, percentage: 10.30 },
      { stage: 'Venda perdida', days: 18.53, percentage: 6.17 },
    ];
    stages = defaultData.map((d, i) => ({
      ...d,
      colorClass: STAGE_COLORS[i % STAGE_COLORS.length],
    }));
    totalDays = 300.65;
  }

  const avgDays = stages.length > 0 ? totalDays / stages.length : 0;

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="tempoMedioParado"
      cardTitle="Gargalo de Retenção: Tempo Médio Parado (Dias)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 relative transition-all duration-300 flex flex-col justify-between hover:border-white/20">
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-left focus:outline-none group"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-display tracking-tight group-hover:text-zinc-200 transition-colors">
                    Tempo Médio Parado por Etapa
                  </h2>
                  <div className="relative inline-flex items-center group/tooltip shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label="Informações sobre Tempo Médio Parado"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      Mede a quantidade média de dias que os leads permanecem estagnados em cada etapa, sem movimentação.
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-[10px] font-medium hidden sm:inline-block">
                  {isExpanded ? 'Recolher' : 'Clique para expandir'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Duração média (em dias) que um lead passa estagnado antes de avançar ou ser perdido.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="bg-zinc-800/60 border border-white/5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 flex items-center gap-2">
                <span>Média Geral:</span>
                <strong className="text-white font-mono text-sm">
                  {avgDays.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias
                </strong>
              </div>
              <div className="p-2 rounded-full bg-zinc-800/80 border border-white/10 text-zinc-300 group-hover:text-white group-hover:bg-zinc-700/80 transition-colors shrink-0">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {/* Treemap / Grid Blocks */}
          {isExpanded && (
            loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-6 animate-fadeIn">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-28 bg-white/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 my-2 animate-fadeIn">
                {stages.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 ring-1 ring-white/5 hover:border-white/10 hover:-translate-y-0.5 backdrop-blur-md transition-all flex flex-col justify-between h-28 group"
                  >
                    <div>
                      <span className="text-xs font-medium block truncate capitalize tracking-wide text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {item.stage}
                      </span>
                    </div>

                    <div>
                      <span className="text-2xl font-extrabold font-display block bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 tracking-tight">
                        {item.days.toLocaleString('pt-BR')} <span className="text-xs font-normal text-zinc-500">dias</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Monitoramento de Funil</span>
          <span className="text-zinc-400 font-medium">Atualização em tempo real</span>
        </div>
      </div>
    </CardEditWrapper>
  );
};
