import React from 'react';
import { LeadSourceData } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Target, TrendingUp, DollarSign } from 'lucide-react';

interface LeadSourceChartProps {
  data: LeadSourceData[];
  cardId?: number;
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data, cardId }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalLeads = data.reduce((acc, curr) => acc + curr.leads, 0);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Origem dos Leads &amp; ROI por Canal
            </h2>
            {cardId && (
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
                Metabase #{cardId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribuição de novos contatos, qualificação e receita gerada por canal de aquisição
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/30 text-xs font-semibold text-blue-300">
          <span>Total:</span>
          <span className="font-bold text-white">{totalLeads} leads</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Pie Chart */}
        <div className="md:col-span-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="leads"
                nameKey="source"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item: LeadSourceData = payload[0].payload;
                    return (
                      <div className="bg-slate-950/95 backdrop-blur-2xl text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1 border border-white/15">
                        <p className="font-bold text-sm text-blue-400">{item.source}</p>
                        <p className="text-slate-200">
                          Leads Totais: <strong className="text-white">{item.leads}</strong>
                        </p>
                        <p className="text-slate-200">
                          Qualificados (SQL): <strong className="text-emerald-300">{item.qualified}</strong>
                        </p>
                        <p className="text-slate-200">
                          Taxa de Conversão: <strong className="text-amber-300">{item.conversion}%</strong>
                        </p>
                        <p className="text-slate-200">
                          Receita Ganha: <strong className="text-emerald-400">{formatCurrency(item.mrr)}</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Channel breakdown cards */}
        <div className="md:col-span-7 space-y-2">
          {data.map((item, idx) => {
            const pct = Math.round((item.leads / (totalLeads || 1)) * 100);
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.source}</h4>
                    <p className="text-[11px] text-slate-400">
                      {item.leads} leads ({pct}%) • {item.qualified} MQLs
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white block font-mono">
                    {formatCurrency(item.mrr)}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 block">
                    {item.conversion}% conv.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
