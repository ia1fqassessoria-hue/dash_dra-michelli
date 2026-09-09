import React from 'react';
import { CrmHealthMetric } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Zap, 
  Target,
  Info
} from 'lucide-react';

interface KpiCardsProps {
  metrics: CrmHealthMetric[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const getCategoryIcon = (category: CrmHealthMetric['category']) => {
    switch (category) {
      case 'pipeline':
        return Target;
      case 'sla':
        return Clock;
      case 'revenue':
        return DollarSign;
      case 'leads':
        return Users;
      default:
        return Zap;
    }
  };

  const getStatusBadge = (status: CrmHealthMetric['status']) => {
    switch (status) {
      case 'healthy':
        return {
          label: 'Saudável',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          label: 'Atenção',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          label: 'Crítico',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: XCircle,
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric) => {
        const IconComponent = getCategoryIcon(metric.category);
        const statusConfig = getStatusBadge(metric.status);
        const StatusIcon = statusConfig.icon;

        return (
          <div
            key={metric.id}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl hover:border-white/20 hover:z-30 focus-within:z-30 transition-all duration-300 flex flex-col justify-between relative group"
          >
            {/* Top glass gradient bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                metric.status === 'healthy'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : metric.status === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-400'
              }`}
            />

            <div>
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-white/10 text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <IconComponent className="w-4 h-4" />
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusConfig.bg}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>

              {/* Title & Description Tooltip */}
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate" title={metric.title}>
                  {metric.title}
                </h3>
                <div className="relative inline-flex items-center group/tooltip shrink-0">
                  <button
                    type="button"
                    className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    aria-label={`Informações sobre ${metric.title}`}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                  <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-52 p-2 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                    {metric.description || `Indicador estratégico referente à métrica de ${metric.title.toLowerCase()}.`}
                  </div>
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <span className="text-2xl font-light text-white tracking-tight">
                  {metric.value}
                </span>
              </div>
            </div>

            {/* Change trend & Target */}
            <div className="mt-4 pt-2.5 border-t border-white/10 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-1">
                {metric.changePercent !== 0 && (
                  <span
                    className={`inline-flex items-center font-bold ${
                      metric.isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {metric.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {metric.changePercent > 0 ? `+${metric.changePercent}%` : `${metric.changePercent}%`}
                  </span>
                )}
                <span className="text-slate-500">vs ant.</span>
              </div>

              {metric.target && (
                <span className="text-slate-500 font-medium text-[10px]">
                  Meta: <span className="text-slate-300 font-semibold">{metric.target}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
