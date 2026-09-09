import React, { useState, useMemo } from 'react';
import { MetabaseCardQueryResult } from '../services/metabaseQueries';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { ShoppingBag, Search, Info, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { CardEditWrapper } from './CardEditWrapper';

interface ProcuraProdutoChartProps {
  queryResult: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardId: number;
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

interface ProductDemand {
  produto: string;
  total: number;
  share: number;
}

const BAR_COLORS = [
  '#3b82f6', '#60a5fa', '#2563eb', '#38bdf8', '#0284c7',
  '#f59e0b', '#fbbf24', '#eab308', '#ef4444', '#f97316'
];

export const ProcuraProdutoChart: React.FC<ProcuraProdutoChartProps> = ({
  queryResult,
  isEditMode,
  cardId,
  onUpdateCardId,
}) => {
  const { rows, loading } = queryResult;
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { items, totalGeral, topChartData } = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { items: [], totalGeral: 0, topChartData: [] };
    }

    const raw: { produto: string; total: number }[] = rows.map((r) => ({
      produto: String(r[0] || 'Desconhecido').trim(),
      total: Number(r[1] || 0),
    }));

    const sum = raw.reduce((acc, curr) => acc + curr.total, 0);

    const list: ProductDemand[] = raw.map((item) => ({
      produto: item.produto,
      total: item.total,
      share: sum > 0 ? (item.total / sum) * 100 : 0,
    }));

    // Top 8 for the bar chart
    const topChart = list.slice(0, 8).map((it) => ({
      name: it.produto.length > 18 ? `${it.produto.slice(0, 18)}...` : it.produto,
      fullName: it.produto,
      total: it.total,
      share: it.share,
    }));

    return { items: list, totalGeral: sum, topChartData: topChart };
  }, [rows]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const s = searchTerm.toLowerCase();
    return items.filter((it) => it.produto.toLowerCase().includes(s));
  }, [items, searchTerm]);

  const displayedList = showAll ? filteredItems : filteredItems.slice(0, 5);

  return (
    <CardEditWrapper
      isEditMode={isEditMode}
      cardKey="procuraPorProduto"
      cardTitle="Procura por Produto"
      currentCardId={cardId}
      onUpdateCardId={onUpdateCardId}
    >
      <div 
        id="card-procura-por-produto"
        className="bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-white/10 relative transition-all duration-300 ease-out hover:border-white/20"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Ranking de Procura por Produto</span>
              </h3>

              <div className="relative inline-flex items-center group/tooltip shrink-0">
                <button
                  type="button"
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  aria-label="Informações sobre procura por produto"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-72 p-3 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                  Contagem de leads baseada no campo 'Produto', exibindo a distribuição e o ranking dos serviços/produtos mais demandados.
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Frequência dos modelos e serviços registrados nas oportunidades de vendas do CRM.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-medium">Demanda Total:</span>
              <span className="text-sm font-extrabold text-blue-400 font-mono">
                {totalGeral.toLocaleString('pt-BR')} registros
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout: Chart on Left, Top Ranking List on Right */}
        {loading ? (
          <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
        ) : items.length === 0 ? (
          <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-zinc-500">
            Nenhum registro de produto encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chart - Top 8 Products */}
            <div className="lg:col-span-7 bg-zinc-950/40 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Produtos Mais Solicitados
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Volume de solicitações</span>
              </div>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="prodGrad0" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad1" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0369a1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad3" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad4" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#d97706" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad5" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#b45309" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad6" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="prodGrad7" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#991b1b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.95} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: '#71717a' }}
                      axisLine={{ stroke: '#27272a' }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11, fill: '#d4d4d8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-zinc-900/95 backdrop-blur-2xl text-white p-3 rounded-xl shadow-2xl text-xs space-y-1 border border-blue-500/30">
                              <p className="font-bold text-white">{data.fullName}</p>
                              <div className="flex items-center justify-between gap-4 text-blue-300">
                                <span>Solicitações:</span>
                                <strong className="font-mono text-white">{data.total.toLocaleString('pt-BR')}</strong>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-zinc-400 text-[11px]">
                                <span>Participação:</span>
                                <strong className="font-mono text-blue-400">{data.share.toFixed(1)}%</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                      {topChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#prodGrad${index % 8})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List Table / Ranking */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-3">
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produto..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/60 border border-white/10 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Items List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {displayedList.map((item, idx) => (
                    <div
                      key={item.produto}
                      className="p-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/50 border border-white/5 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-zinc-200 truncate" title={item.produto}>
                          {item.produto}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-white">
                          {item.total.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {item.share.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}

                  {displayedList.length === 0 && (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      Nenhum produto localizado para "{searchTerm}".
                    </div>
                  )}
                </div>
              </div>

              {/* View More Toggle */}
              {filteredItems.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{showAll ? 'Mostrar menos' : `Exibir todos (${filteredItems.length})`}</span>
                  {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </CardEditWrapper>
  );
};
