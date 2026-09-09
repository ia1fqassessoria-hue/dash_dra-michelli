import React, { useState } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { Package, CheckCircle2, AlertCircle, Layers, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface ProdutosPreenchidosCardProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

export const ProdutosPreenchidosCard: React.FC<ProdutosPreenchidosCardProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { rows, loading, error } = queryResult;

  // Row format: [preenchidos, porcentagem_preenchidos, vazios, porcentagem_vazios, total]
  let preenchidos = 0;
  let pctPreenchidos = 0;
  let vazios = 0;
  let pctVazios = 0;
  let total = 0;

  if (rows && rows.length > 0) {
    const r = rows[0];
    preenchidos = Number(r[0] || 0);
    pctPreenchidos = Number(r[1] || 0);
    vazios = Number(r[2] || 0);
    pctVazios = Number(r[3] || 0);
    total = Number(r[4] || 0);
  }

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="produtosPreenchidos"
      cardTitle="Produtos Preenchidos"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="card-produtos-preenchidos"
        className="bg-zinc-900 rounded-2xl p-6 border border-white/10 relative transition-all duration-300 ease-out flex flex-col justify-between hover:border-white/20"
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
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] tracking-widest text-zinc-500 font-semibold uppercase block">
                  Conformidade de Catálogo
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 group-hover:text-zinc-200 transition-colors">
                    <span>Produtos Preenchidos</span>
                  </h3>
                  <div className="relative inline-flex items-center group/tooltip shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label="Informações sobre preenchimento de produto"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      Proporção de oportunidades no CRM que possuem o campo 'Produto' devidamente preenchido vs oportunidades em branco.
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

          {/* Main KPI Ratio */}
          {isExpanded && (
            loading ? (
              <div className="h-20 bg-white/5 animate-pulse rounded-xl my-3 animate-fadeIn" />
            ) : (
              <div className="space-y-4 my-2 animate-fadeIn">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
                    {pctPreenchidos.toFixed(1).replace('.', ',')}%
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">dos leads com produto qualificado</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {preenchidos.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">de {total.toLocaleString('pt-BR')} leads</span>
                </div>
              </div>

              {/* Progress Split Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex ring-1 ring-white/5 p-0.5">
                  <div
                    style={{ width: `${Math.max(2, pctPreenchidos)}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                    title={`Preenchidos: ${pctPreenchidos}%`}
                  />
                  <div
                    style={{ width: `${Math.max(2, pctVazios)}%` }}
                    className="h-full bg-zinc-700/50 rounded-full transition-all duration-1000 ease-out ml-0.5"
                    title={`Vazios: ${pctVazios}%`}
                  />
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                  <span className="flex items-center gap-1 text-blue-300">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    <span>{preenchidos.toLocaleString('pt-BR')} ({pctPreenchidos.toFixed(1)}%) preenchidos</span>
                  </span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    <AlertCircle className="w-3 h-3 text-zinc-500" />
                    <span>{vazios.toLocaleString('pt-BR')} ({pctVazios.toFixed(1)}%) vazios</span>
                  </span>
                </div>
              </div>
            </div>
            )
          )}
        </div>

        {/* Footer info */}
        {isExpanded && (
          <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between text-[11px] text-zinc-500 animate-fadeIn">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" /> Base Total Analisada
            </span>
            <span className="font-mono text-zinc-300 font-semibold">{total.toLocaleString('pt-BR')} leads</span>
          </div>
        )}
      </div>
    </CardEditWrapper>
  );
};
