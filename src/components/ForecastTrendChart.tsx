import React from 'react';
import { ForecastData } from '../types';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

interface ForecastTrendChartProps {
  data: ForecastData[];
  cardId?: number;
}

export const ForecastTrendChart: React.FC<ForecastTrendChartProps> = ({ data, cardId }) => {
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
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Previsão de Receita &amp; Fechamento (Forecast vs Meta)
            </h2>
            {cardId && (
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
                Metabase #{cardId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de receita ganha realizada vs pipeline de vendas aberto e meta estipulada
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-semibold text-amber-300">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Meta Junho: {formatCurrency(800000)}</span>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: ForecastData = payload[0].payload;
                  return (
                    <div className="bg-slate-950/95 backdrop-blur-2xl text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 border border-white/15">
                      <p className="font-bold text-sm text-blue-400">{item.period}</p>
                      {item.realized > 0 && (
                        <p className="text-slate-200">
                          Receita Realizada (Ganha): <strong className="text-blue-300">{formatCurrency(item.realized)}</strong>
                        </p>
                      )}
                      <p className="text-slate-200">
                        Ponderado em Pipeline: <strong className="text-blue-300">{formatCurrency(item.pipelineValue)}</strong>
                      </p>
                      <p className="text-slate-200">
                        Meta do Mês: <strong className="text-amber-300">{formatCurrency(item.target)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#cbd5e1' }} />
            <Bar dataKey="realized" name="Receita Realizada (Ganha)" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="pipelineValue" name="Pipeline Aberto (Ponderado)" fill="#60a5fa" radius={[6, 6, 0, 0]} barSize={24} />
            <Line type="monotone" dataKey="target" name="Meta de Vendas" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
