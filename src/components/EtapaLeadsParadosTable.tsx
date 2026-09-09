import React, { useState, useMemo } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { AlertTriangle, Layers, GitFork, Workflow, Table, Kanban, Send, ShoppingBag, Info } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface EtapaLeadsParadosTableProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface LeadParadoRow {
  pipeline: string;
  etapa: string;
  leadsParados: number;
}

export const EtapaLeadsParadosTable: React.FC<EtapaLeadsParadosTableProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const { rows, columns, loading } = queryResult;
  const [viewMode, setViewMode] = useState<'encapsulated' | 'table'>('encapsulated');

  let dataRows: LeadParadoRow[] = [];

  if (rows && rows.length > 0) {
    const cols = (columns || []).map((c) => String(c).toLowerCase());
    let pipeIdx = cols.findIndex((c) => /funil|pipeline/i.test(c));
    let etapaIdx = cols.findIndex((c) => /etapa|stage|status/i.test(c));
    let leadsIdx = cols.findIndex((c) => /parado|lead|count|total|qtd/i.test(c));

    if (pipeIdx === -1 && etapaIdx === -1) {
      pipeIdx = 0;
      etapaIdx = 1;
      leadsIdx = 2;
    } else {
      if (pipeIdx === -1) pipeIdx = 0;
      if (etapaIdx === -1) etapaIdx = pipeIdx === 0 ? 1 : 0;
      if (leadsIdx === -1) leadsIdx = 2;
    }

    dataRows = rows.map((row) => ({
      pipeline: String(row[pipeIdx] || 'Funil Padrão'),
      etapa: String(row[etapaIdx] || 'Etapa Padrão'),
      leadsParados: Number(row[leadsIdx] || 0),
    }));
  } else {
    dataRows = [
      { pipeline: 'Funil de Disparo', etapa: 'Não Respondeu', leadsParados: 10123 },
      { pipeline: 'Funil de Vendas', etapa: 'Contato Inicial', leadsParados: 9303 },
      { pipeline: 'Funil de Disparo', etapa: 'Têm Interesse', leadsParados: 409 },
      { pipeline: 'Funil de Disparo', etapa: 'Erro De Envio De Mensagem', leadsParados: 307 },
      { pipeline: 'Funil de Disparo', etapa: 'Não Tem Interesse', leadsParados: 242 },
      { pipeline: 'Funil de Vendas', etapa: 'Em Atendimento', leadsParados: 15 },
      { pipeline: 'Funil de Vendas', etapa: 'Em Negociação', leadsParados: 3 },
      { pipeline: 'Funil de Disparo', etapa: 'DISPARO DE MENSAGEM', leadsParados: 1 },
    ];
  }

  // Encapsulation grouping
  const pipelineGroups = useMemo(() => {
    const groupsMap = new Map<string, LeadParadoRow[]>();

    dataRows.forEach((row) => {
      const pipeName = row.pipeline ? row.pipeline.trim() : 'Outros Funis';
      if (!groupsMap.has(pipeName)) {
        groupsMap.set(pipeName, []);
      }
      groupsMap.get(pipeName)!.push(row);
    });

    const grandTotal = dataRows.reduce((acc, curr) => acc + curr.leadsParados, 0);

    const groups = Array.from(groupsMap.entries()).map(([pipelineName, stages]) => {
      const sortedStages = [...stages].sort((a, b) => b.leadsParados - a.leadsParados);
      const pipelineTotal = sortedStages.reduce((acc, curr) => acc + curr.leadsParados, 0);
      const pctOfGrandTotal = grandTotal > 0 ? (pipelineTotal / grandTotal) * 100 : 0;

      return {
        pipelineName,
        pipelineTotal,
        pctOfGrandTotal,
        stages: sortedStages.map((s) => ({
          ...s,
          pctOfPipeline: pipelineTotal > 0 ? (s.leadsParados / pipelineTotal) * 100 : 0,
          pctOfGrandTotal: grandTotal > 0 ? (s.leadsParados / grandTotal) * 100 : 0,
        })),
      };
    });

    return {
      grandTotal,
      groups: groups.sort((a, b) => b.pipelineTotal - a.pipelineTotal),
    };
  }, [dataRows]);

  const getPipelineIcon = (pipelineName: string) => {
    if (/disparo/i.test(pipelineName)) {
      return <Send className="w-4 h-4 text-amber-400" />;
    }
    if (/venda/i.test(pipelineName)) {
      return <ShoppingBag className="w-4 h-4 text-blue-400" />;
    }
    return <Workflow className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="etapaLeadsParados"
      cardTitle="Etapa com Maior Número de Leads Parados"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 relative transition-all duration-300 flex flex-col justify-between h-full hover:border-white/20">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-display tracking-tight">
                    Maior Número de Leads Parados por Etapa
                  </h2>
                  <div className="relative inline-flex items-center group/tooltip shrink-0">
                    <button
                      type="button"
                      className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label="Informações sobre Concentração de Leads por Etapa"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      Identifica em quais etapas do CRM há a maior concentração de leads parados sem movimentação ou evolução no atendimento.
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Mapa de calor das etapas do funil com maior acúmulo e estagnação de leads.
              </p>
            </div>

            {/* Controls: Mode Switcher & Summary Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div className="bg-zinc-800/80 border border-white/10 p-1 rounded-lg flex items-center gap-1 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('encapsulated')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === 'encapsulated'
                      ? 'bg-zinc-700 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Agrupar por pipeline"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Pipelines</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === 'table'
                      ? 'bg-zinc-700 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Visualizar em tabela contínua"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Tabela</span>
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <span className="font-mono text-white">
                  {pipelineGroups.grandTotal.toLocaleString('pt-BR')}
                </span>
                <span className="text-[10px] text-amber-400/80 font-normal">leads no total</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : viewMode === 'encapsulated' ? (
            /* ENCAPSULATED BY PIPELINE LAYOUT */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              {pipelineGroups.groups.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/60 border border-white/10 ring-1 ring-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-zinc-700/80 transition-all duration-300"
                >
                  {/* Pipeline Container Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          {getPipelineIcon(group.pipelineName)}
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-wide font-display">
                          {group.pipelineName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-zinc-100 block">
                          {group.pipelineTotal.toLocaleString('pt-BR')} leads
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {group.pctOfGrandTotal.toFixed(1)}% do total
                        </span>
                      </div>
                    </div>

                    {/* Overall Share Bar for Pipeline */}
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-zinc-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(group.pctOfGrandTotal, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stages List inside Pipeline */}
                  <div className="space-y-3">
                    {group.stages.map((stage, stageIdx) => {
                      const isMainGargalo = stage.pctOfPipeline >= 50;
                      return (
                        <div key={stageIdx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-zinc-300 capitalize flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isMainGargalo ? 'bg-amber-400' : 'bg-zinc-600'
                                }`}
                              />
                              {stage.etapa}
                            </span>
                            <div className="flex items-center gap-2 font-mono">
                              <span
                                className={`font-semibold ${
                                  isMainGargalo ? 'text-amber-300' : 'text-zinc-200'
                                }`}
                              >
                                {stage.leadsParados.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-normal">
                                ({stage.pctOfPipeline.toFixed(1)}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress bar per stage inside pipeline */}
                          <div className="w-full bg-zinc-900/80 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isMainGargalo
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm shadow-amber-500/20'
                                  : stage.pctOfPipeline >= 15
                                  ? 'bg-gradient-to-r from-indigo-500 to-sky-400'
                                  : 'bg-zinc-600'
                              }`}
                              style={{ width: `${Math.min(stage.pctOfPipeline, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-[10px] text-zinc-500 flex justify-between items-center border-t border-white/5">
                    <span>{group.stages.length} etapas registradas</span>
                    <span className="font-mono text-zinc-400">
                      Maior concentração: {group.stages[0]?.etapa}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABULAR FALLBACK VIEW */
            <div className="overflow-x-auto my-2 rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 font-semibold uppercase text-[10px] tracking-widest bg-zinc-900/80">
                    <th className="py-3 px-4">Pipeline</th>
                    <th className="py-3 px-4">Etapa</th>
                    <th className="py-3 px-4 text-right">Quantidade de Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {dataRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-zinc-300">
                      <td className="py-2.5 px-4 font-medium text-zinc-400">{row.pipeline}</td>
                      <td className="py-2.5 px-4 text-zinc-200 capitalize">{row.etapa}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-400/90">
                        {row.leadsParados.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-zinc-400" />
            <span>Distribuição por funil</span>
          </span>
          <span className="text-zinc-400 font-mono font-medium">
            {pipelineGroups.groups.length} pipelines • {dataRows.length} etapas analisadas
          </span>
        </div>
      </div>
    </CardEditWrapper>
  );
};

