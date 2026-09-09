import React from 'react';
import { PipelineStageData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Filter, ArrowRight, Layers } from 'lucide-react';

interface PipelineHealthChartProps {
  data: PipelineStageData[];
  cardId?: number;
}

export const PipelineHealthChart: React.FC<PipelineHealthChartProps> = ({ data, cardId }) => {
  // Custom colors for funnel gradient from fresh lead to contract won
  const COLORS = ['#3b82f6', '#60a5fa', '#2563eb', '#38bdf8', '#0284c7', '#1d4ed8'];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Saúde do Funil de Vendas (CRM)
            </h2>
            {cardId && (
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
                Metabase #{cardId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Volume de oportunidades, valor total acumulado e taxa de conversão por etapa
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300">
          <span>Conversão Final:</span>
          <span className="text-blue-400 font-bold">
            {((data[data.length - 1]?.count / (data[0]?.count || 1)) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }}
              width={160}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: PipelineStageData = payload[0].payload;
                  return (
                    <div className="bg-slate-950/95 backdrop-blur-2xl text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1 border border-white/15">
                      <p className="font-bold text-sm text-blue-400">{item.stage}</p>
                      <p className="text-slate-200">
                        Oportunidades: <strong className="text-white">{item.count} leads</strong>
                      </p>
                      <p className="text-slate-200">
                        Valor em Pipeline: <strong className="text-amber-400">{formatCurrency(item.value)}</strong>
                      </p>
                      <p className="text-slate-300">
                        Conversão da etapa: <strong className="text-blue-300">{item.conversionRate}%</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Flow Cards below */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-white/10">
        {data.map((stage, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              {stage.stage.split('.')[1] || stage.stage}
            </span>
            <span className="text-sm font-bold text-white block mt-0.5">
              {stage.count} deals
            </span>
            <span className="text-[11px] text-amber-400 font-mono block mt-0.5">
              {formatCurrency(stage.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
