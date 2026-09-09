import React from "react";
import {
  MetabaseCardQueryResult,
  extractSingleValue,
} from "../services/metabaseQueries";
import { CalendarX2, CalendarClock, Info, ShieldAlert } from "lucide-react";
import { CardEditWrapper } from "./CardEditWrapper";

interface OperacaoSlaSectionProps {
  tarefasVencidas: MetabaseCardQueryResult;
  pctClosestTaskAt: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardIds: {
    tarefasVencidas: number;
    pctClosestTaskAt: number;
  };
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

export const OperacaoSlaSection: React.FC<OperacaoSlaSectionProps> = ({
  tarefasVencidas,
  pctClosestTaskAt,
  isEditMode,
  cardIds,
  onUpdateCardId,
}) => {
  // Card 230: Tarefas Vencidas
  const tarefasValRaw = extractSingleValue(tarefasVencidas, 0);
  const tarefasVal = Number(tarefasValRaw || 0).toLocaleString("pt-BR");

  // Card 239: Próxima Tarefa Agendada
  const formatPct = (result: MetabaseCardQueryResult, fallback: number = 0) => {
    const raw = extractSingleValue(result, fallback);
    let num =
      typeof raw === "number" ? raw : parseFloat(String(raw).replace(",", "."));
    if (isNaN(num)) num = 0;
    const pct = num <= 1 ? num * 100 : num;
    return {
      formatted: `${pct.toFixed(2).replace(".", ",")}%`,
      value: Math.min(100, Math.max(0, pct)),
    };
  };
  const closestTaskPct = formatPct(pctClosestTaskAt, 0.0013);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-display flex items-center gap-2">
              <span>Acompanhamento de Tarefas e Follow-ups</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Métricas de agendamento de próximas tarefas e atrasos nas
              interações com leads.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card 1: Tarefas Vencidas */}
        <CardEditWrapper
          isEditMode={isEditMode}
          cardKey="tarefasVencidas"
          cardTitle="Tarefas Vencidas"
          currentCardId={cardIds.tarefasVencidas}
          onUpdateCardId={onUpdateCardId}
        >
          <div className="group bg-zinc-900 rounded-2xl p-5 border border-white/10 transition-all duration-300 relative h-full flex flex-col justify-between hover:border-white/20">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-[10px] tracking-wider text-zinc-500 font-semibold uppercase block truncate">
                    Atraso Operacional
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                    <span className="truncate">Tarefas Vencidas</span>
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative inline-flex items-center group/tooltip">
                    <button
                      type="button"
                      className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-60 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      <p className="font-semibold text-white mb-1">
                        Card #{cardIds.tarefasVencidas}
                      </p>
                      Volume de tarefas de vendas (follow-ups, reuniões) que já
                      passaram do prazo.
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 shrink-0 group-hover:text-zinc-300 transition-colors">
                    <CalendarX2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                {tarefasVencidas.loading ? (
                  <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
                    {tarefasVal}
                  </span>
                )}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 whitespace-nowrap">
                  Prazo expirado
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-mono text-[10px] text-zinc-500">
                Card #{cardIds.tarefasVencidas}
              </span>
            </div>
          </div>
        </CardEditWrapper>

        {/* Card 2: Próxima Tarefa Agendada */}
        <CardEditWrapper
          isEditMode={isEditMode}
          cardKey="pctClosestTaskAt"
          cardTitle="Próxima Tarefa Agendada"
          currentCardId={cardIds.pctClosestTaskAt}
          onUpdateCardId={onUpdateCardId}
        >
          <div className="group bg-zinc-900 rounded-2xl p-5 border border-white/10 transition-all duration-300 relative h-full flex flex-col justify-between hover:border-white/20">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-[10px] tracking-wider text-zinc-500 font-semibold uppercase block truncate">
                    Agendamento de Follow-up
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                    <span className="truncate">Próxima Tarefa Agendada</span>
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="relative inline-flex items-center group/tooltip">
                    <button
                      type="button"
                      className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors focus:outline-none"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-64 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                      <p className="font-semibold text-white mb-1">
                        Card #{cardIds.pctClosestTaskAt}
                      </p>
                      Percentual de leads ativos no CRM que possuem uma próxima
                      tarefa/follow-up devidamente agendada.
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 shrink-0 group-hover:text-zinc-300 transition-colors">
                    <CalendarClock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                {pctClosestTaskAt.loading ? (
                  <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
                ) : (
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
                      {closestTaskPct.formatted}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {closestTaskPct.value >= 70
                        ? "Adequado"
                        : "Abaixo da meta"}
                    </span>
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 ring-1 ring-white/5">
                    <div
                      style={{ width: `${Math.max(2, closestTaskPct.value)}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        closestTaskPct.value >= 70
                          ? "bg-emerald-500"
                          : closestTaskPct.value >= 30
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Atual: {closestTaskPct.formatted}</span>
                    <span>Referência: ≥ 90%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-mono text-[10px] text-zinc-500">
                Card #{cardIds.pctClosestTaskAt}
              </span>
              <span className="text-[10px] text-zinc-400">
                {closestTaskPct.value < 10
                  ? "Abaixo do esperado"
                  : "Em conformidade"}
              </span>
            </div>
          </div>
        </CardEditWrapper>
      </div>
    </div>
  );
};
