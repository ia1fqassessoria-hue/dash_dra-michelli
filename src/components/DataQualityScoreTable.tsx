import React, { useState, useMemo } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ArrowUpDown, 
  Trophy, 
  DollarSign, 
  Package, 
  Compass, 
  UserCheck,
  Search
} from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface DataQualityScoreTableProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface SellerQualityRow {
  vendedor: string;
  totalLeads: number;
  pctValor: number;
  pctProduto: number;
  pctOrigem: number;
  overallScore: number;
}

type SortField = 'overallScore' | 'totalLeads' | 'pctValor' | 'pctProduto' | 'pctOrigem' | 'vendedor';

export const DataQualityScoreTable: React.FC<DataQualityScoreTableProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const { rows, loading } = queryResult;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('overallScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const { dataList, teamAvgScore, totalLeadsAnalyzed } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { dataList: [], teamAvgScore: 0, totalLeadsAnalyzed: 0 };
    }

    let sumScores = 0;
    let sumLeads = 0;

    const list: SellerQualityRow[] = rows.map((r) => {
      const vendedor = String(r[0] || 'Não identificado').trim();
      const totalLeads = Number(r[1] || 0);
      const pctValor = Number(r[2] || 0);
      const pctProduto = Number(r[3] || 0);
      const pctOrigem = Number(r[4] || 0);

      // Composite score: simple average of the 3 dimensions
      const overallScore = (pctValor + pctProduto + pctOrigem) / 3;

      sumScores += overallScore * totalLeads;
      sumLeads += totalLeads;

      return {
        vendedor,
        totalLeads,
        pctValor,
        pctProduto,
        pctOrigem,
        overallScore,
      };
    });

    const avg = sumLeads > 0 ? sumScores / sumLeads : 0;

    return { dataList: list, teamAvgScore: avg, totalLeadsAnalyzed: sumLeads };
  }, [rows]);

  const sortedAndFiltered = useMemo(() => {
    let result = [...dataList];

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter((item) => item.vendedor.toLowerCase().includes(s));
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [dataList, searchTerm, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 50) {
      return {
        bg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        label: 'Excelente',
      };
    }
    if (score >= 25) {
      return {
        bg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        label: 'Regular',
      };
    }
    if (score >= 15) {
      return {
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        label: 'Atenção',
      };
    }
    return {
      bg: 'bg-red-500/10 text-red-300 border-red-500/20',
      label: 'Crítico',
    };
  };

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="dataQualityVendedor"
      cardTitle="Qualidade do Preenchimento por Vendedor (Data Quality Score)"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="card-data-quality-score"
        className="bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-white/10 relative transition-all duration-300 ease-out hover:border-white/20"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Qualidade do Preenchimento por Vendedor (Data Quality Score)</span>
              </h3>

              <div className="relative inline-flex items-center group/tooltip shrink-0">
                <button
                  type="button"
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  aria-label="Informações sobre Data Quality Score"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-80 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                  <p className="font-semibold text-blue-300 mb-1">Escopo desta métrica:</p>
                  Auditoria de qualidade no CRM avaliando a taxa de preenchimento dos campos essenciais da clínica por responsável.
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-transparent text-[10px] font-medium text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                Base Histórica Geral (Todos os Funis)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Score de qualidade (0 a 100) combinando a taxa de preenchimento de Valor, Produto e Origem.
            </p>
          </div>

          {/* Quick Stats & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-medium">Score Médio da Equipe:</span>
              <span className="text-sm font-extrabold text-blue-400 font-mono">
                {teamAvgScore.toFixed(1).replace('.', ',')}%
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar vendedor..."
                className="pl-8 pr-3 py-1.5 bg-zinc-950/60 border border-white/10 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors w-40 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="h-48 bg-white/5 animate-pulse rounded-2xl" />
        ) : sortedAndFiltered.length === 0 ? (
          <div className="h-36 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-zinc-500">
            Nenhum registro encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/60 text-zinc-400 font-medium">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('vendedor')}
                      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors text-left"
                    >
                      <span>Vendedor</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('totalLeads')}
                      className="flex items-center gap-1.5 ml-auto hover:text-zinc-200 transition-colors"
                      title="Volume total de leads acumulados na história do CRM para este usuário"
                    >
                      <span>Total Leads (Histórico Geral)</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('pctValor')}
                      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      <span>% Valor Preenchido</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('pctProduto')}
                      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-400" />
                      <span>% Produto Preenchido</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('pctOrigem')}
                      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>% Origem Preenchida</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('overallScore')}
                      className="flex items-center gap-1.5 ml-auto hover:text-zinc-200 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quality Score Geral</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-600" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-zinc-950/20 font-normal">
                {sortedAndFiltered.map((row, idx) => {
                  const badge = getScoreBadge(row.overallScore);
                  return (
                    <tr 
                      key={row.vendedor}
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Vendedor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors" title={row.vendedor}>
                            {row.vendedor}
                          </span>
                        </div>
                      </td>

                      {/* Total Leads */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-zinc-300">
                        {row.totalLeads.toLocaleString('pt-BR')}
                      </td>

                      {/* % Valor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                            <div
                              style={{ width: `${Math.min(100, Math.max(2, row.pctValor))}%` }}
                              className="bg-amber-500 h-full rounded-full"
                            />
                          </div>
                          <span className="font-mono text-zinc-300 font-medium text-[11px] w-12 text-right">
                            {row.pctValor.toFixed(1).replace('.', ',')}%
                          </span>
                        </div>
                      </td>

                      {/* % Produto */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                            <div
                              style={{ width: `${Math.min(100, Math.max(2, row.pctProduto))}%` }}
                              className="bg-blue-500 h-full rounded-full"
                            />
                          </div>
                          <span className="font-mono text-zinc-300 font-medium text-[11px] w-12 text-right">
                            {row.pctProduto.toFixed(1).replace('.', ',')}%
                          </span>
                        </div>
                      </td>

                      {/* % Origem */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                            <div
                              style={{ width: `${Math.min(100, Math.max(2, row.pctOrigem))}%` }}
                              className="bg-sky-500 h-full rounded-full"
                            />
                          </div>
                          <span className="font-mono text-zinc-300 font-medium text-[11px] w-12 text-right">
                            {row.pctOrigem.toFixed(1).replace('.', ',')}%
                          </span>
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {row.overallScore.toFixed(1).replace('.', ',')} %
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-blue-400" />
            <span>Score Geral = Média ponderada de Valor, Produto e Origem</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="text-zinc-500 italic">Auditoria acumulada de todos os pipelines e status de todos os tempos</span>
          </span>
          <span className="font-mono text-zinc-400">Total histórico analisado: {totalLeadsAnalyzed.toLocaleString('pt-BR')} leads</span>
        </div>
      </div>
    </CardEditWrapper>
  );
};
