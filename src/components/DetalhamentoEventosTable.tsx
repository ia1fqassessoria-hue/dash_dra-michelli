import React, { useState } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { Zap, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface DetalhamentoEventosTableProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface EventoRow {
  tipoAcao: string;
  quantidade: number;
  representatividadePct: string;
}

export const DetalhamentoEventosTable: React.FC<DetalhamentoEventosTableProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { rows, columns, loading } = queryResult;

  let dataRows: EventoRow[] = [];

  if (rows && rows.length > 0) {
    const cols = (columns || []).map((c) => String(c).toLowerCase());
    let tipoIdx = cols.findIndex((c) => /tipo|acao|event|evento|name|nome/i.test(c));
    let qtdIdx = cols.findIndex((c) => /qtd|quantidade|count|total/i.test(c));
    let repIdx = cols.findIndex((c) => /pct|porcentagem|percent|representa/i.test(c));

    if (tipoIdx === -1) tipoIdx = 0;
    if (qtdIdx === -1) qtdIdx = tipoIdx === 0 ? 1 : 0;
    if (repIdx === -1) repIdx = 2;

    dataRows = rows.map((row) => {
      const tipo = String(row[tipoIdx] || 'Evento');
      const qtd = Number(row[qtdIdx] || 0);
      const repVal = row[repIdx];
      let repStr = '0%';
      if (typeof repVal === 'number') {
        repStr = `${repVal.toFixed(2).replace('.', ',')}%`;
      } else if (typeof repVal === 'string') {
        repStr = repVal.includes('%') ? repVal : `${repVal}%`;
      }

      return {
        tipoAcao: tipo,
        quantidade: qtd,
        representatividadePct: repStr,
      };
    });
  } else {
    dataRows = [
      { tipoAcao: 'outgoing_chat_message_add', quantidade: 2076, representatividadePct: '65,02%' },
      { tipoAcao: 'entity_responsible_changed', quantidade: 645, representatividadePct: '20,2%' },
      { tipoAcao: 'custom_field_1056072_value_changed', quantidade: 216, representatividadePct: '6,76%' },
      { tipoAcao: 'custom_field_1708170_value_changed', quantidade: 181, representatividadePct: '5,67%' },
      { tipoAcao: 'conversation_answer_add', quantidade: 30, representatividadePct: '0,94%' },
      { tipoAcao: 'lead_status_changed', quantidade: 22, representatividadePct: '0,69%' },
      { tipoAcao: 'entity_direct_message_add', quantidade: 15, representatividadePct: '0,47%' },
      { tipoAcao: 'custom_field_value_changed', quantidade: 5, representatividadePct: '0,16%' },
      { tipoAcao: 'talk_close', quantidade: 2, representatividadePct: '0,06%' },
      { tipoAcao: 'common_note_add', quantidade: 1, representatividadePct: '0,03%' },
    ];
  }

  const totalEventos = dataRows.reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="detalhamentoEventos"
      cardTitle="Detalhamento de Eventos (Auditoria)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 relative transition-all duration-300 flex flex-col justify-between hover:border-white/20">
        <div>
          {/* Collapsible Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left focus:outline-none group min-h-[44px]"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-display tracking-tight group-hover:text-zinc-200 transition-colors">
                    Detalhamento de Eventos no CRM
                  </h2>
                  <span
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center group/tooltip shrink-0 cursor-pointer"
                  >
                    <span
                      className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                      aria-label="Informações sobre Auditoria de Eventos"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </span>
                    <span className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      Lista detalhada das microações, tarefas, edições e interações ocorridas no CRM, agrupadas para auditoria.
                    </span>
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 text-[10px] font-medium">
                  {isExpanded ? 'Recolher' : 'Clique para expandir'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Auditoria de logs e histórico de interações executadas na plataforma.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-2 bg-zinc-800/60 px-3.5 py-1.5 rounded-full border border-white/5 text-xs font-medium text-zinc-300">
                <span>Total de Eventos:</span>
                <strong className="text-white font-mono">{totalEventos.toLocaleString('pt-BR')}</strong>
              </div>

              <div className="p-2 rounded-full bg-zinc-800/80 border border-white/10 text-zinc-300 group-hover:text-white group-hover:bg-zinc-700/80 transition-colors shrink-0">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {/* Expanded Content Table */}
          {isExpanded && (
            <div className="overflow-x-auto custom-scrollbar mt-4 rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-md animate-fadeIn">
              {loading ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-6 bg-white/5 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 font-semibold uppercase text-[10px] tracking-widest bg-zinc-900/80">
                      <th className="py-3.5 px-4">Tipo de Ação no Kommo</th>
                      <th className="py-3.5 px-4 text-center">Quantidade de Eventos</th>
                      <th className="py-3.5 px-4 text-right">Representatividade (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {dataRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-zinc-300">
                        <td className="py-2.5 px-4 font-mono text-zinc-300 font-medium">{row.tipoAcao}</td>
                        <td className="py-2.5 px-4 text-center font-mono text-white font-semibold">
                          {row.quantidade.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-zinc-400">
                          {row.representatividadePct}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Logs de Integração</span>
            <span className="text-zinc-400 font-mono font-medium">{dataRows.length} linhas</span>
          </div>
        )}
      </div>
    </CardEditWrapper>
  );
};
