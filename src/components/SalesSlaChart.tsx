import React from 'react';
import { SlaData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Clock, AlertTriangle, UserCheck } from 'lucide-react';

interface SalesSlaChartProps {
  data: SlaData[];
  cardId?: number;
}

export const SalesSlaChart: React.FC<SalesSlaChartProps> = ({ data, cardId }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              SLA de Atendimento &amp; Deals Estagnados
            </h2>
            {cardId && (
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
                Metabase #{cardId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tempo médio de resposta (1º contato) e risco de perda por inatividade (&gt; 48h)
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-semibold text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Meta SLA: &lt; 15 min</span>
        </div>
      </div>

      {/* SLA Chart */}
      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis dataKey="rep" tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="m" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: SlaData = payload[0].payload;
                  return (
                    <div className="bg-slate-950/95 backdrop-blur-2xl text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 border border-white/15">
                      <p className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        {item.rep}
                      </p>
                      <p className="text-slate-200">
                        Tempo Médio de 1º Contato: <strong className="text-amber-300">{item.avgFirstContactMinutes} min</strong>
                      </p>
                      <p className="text-slate-200">
                        Oportunidades Abertas: <strong className="text-white">{item.openDeals} deals</strong>
                      </p>
                      <p className="text-slate-200">
                        Deals Negligenciados (&gt;48h): <strong className="text-red-400">{item.staleDeals} deals</strong>
                      </p>
                      <p className="text-slate-200">
                        Taxa de Fechamento: <strong className="text-blue-400">{item.closeRate}%</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#cbd5e1' }} />
            <Bar
              yAxisId="left"
              dataKey="avgFirstContactMinutes"
              name="Tempo 1º Contato (min)"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="right"
              dataKey="staleDeals"
              name="Leads Estagnados (>48h)"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rep Table Summary */}
      <div className="mt-4 pt-3 border-t border-white/10 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
              <th className="pb-2">Vendedor</th>
              <th className="pb-2 text-center">Tempo Resposta</th>
              <th className="pb-2 text-center">Deals Abertos</th>
              <th className="pb-2 text-center">Estagnados</th>
              <th className="pb-2 text-right">Taxa Conversão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((rep, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5 font-semibold text-white">{rep.rep}</td>
                <td className="py-2.5 text-center font-mono font-medium">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] border ${
                    rep.avgFirstContactMinutes <= 15 ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {rep.avgFirstContactMinutes} min
                  </span>
                </td>
                <td className="py-2.5 text-center text-slate-300 font-medium">{rep.openDeals}</td>
                <td className="py-2.5 text-center font-bold">
                  {rep.staleDeals > 0 ? (
                    <span className="text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full text-[11px]">
                      {rep.staleDeals}
                    </span>
                  ) : (
                    <span className="text-blue-400">0</span>
                  )}
                </td>
                <td className="py-2.5 text-right font-bold text-white">{rep.closeRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
