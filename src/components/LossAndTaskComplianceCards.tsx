import React from "react";
import {
  MetabaseCardQueryResult,
  extractSingleValue,
} from "../services/metabaseQueries";
import { FileText, HelpCircle, Info, DatabaseZap } from "lucide-react";
import { CardEditWrapper } from "./CardEditWrapper";

interface LossAndTaskComplianceCardsProps {
  pctLossReason: MetabaseCardQueryResult;
  perdasMotivoIndefinido: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardIds: {
    pctLossReason: number;
    perdasMotivoIndefinido: number;
  };
  onUpdateCardId: (cardKey: string, newId: number) => void;
}

export const LossAndTaskComplianceCards: React.FC<
  LossAndTaskComplianceCardsProps
> = ({
  pctLossReason,
  perdasMotivoIndefinido,
  isEditMode,
  cardIds,
  onUpdateCardId,
}) => {
  // Card 245: Motivo de Perda (Texto)
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
  const lossReasonPct = formatPct(pctLossReason, 0.065);

  // Card 249: Perdas sem Motivo
  const perdasValRaw = extractSingleValue(perdasMotivoIndefinido, 0);
  const perdasVal = Number(perdasValRaw || 0).toLocaleString("pt-BR");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
            <DatabaseZap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-display flex items-center gap-2">
              <span>Análise de Motivos de Perda</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Métricas de conformidade e qualidade na justificativa de
              fechamento das oportunidades perdidas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card 1: Motivo de Perda (Texto) */}
        <CardEditWrapper
          isEditMode={isEditMode}
          cardKey="pctLossReason"
          cardTitle="Motivo de Perda (Texto)"
          currentCardId={cardIds.pctLossReason}
          onUpdateCardId={onUpdateCardId}
        >
          <div className="group bg-zinc-900 rounded-2xl p-5 border border-white/10 transition-all duration-300 relative h-full flex flex-col justify-between hover:border-white/20">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-[10px] tracking-wider text-zinc-500 font-semibold uppercase block truncate">
                    Justificativa Detalhada
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                    <span className="truncate">Motivo de Perda (Texto)</span>
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
                        Card #{cardIds.pctLossReason}
                      </p>
                      Percentual de oportunidades perdidas com a justificativa
                      detalhada (texto) preenchida no CRM.
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 shrink-0 group-hover:text-zinc-300 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                {pctLossReason.loading ? (
                  <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
                ) : (
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
                      {lossReasonPct.formatted}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {lossReasonPct.value >= 70
                        ? "Adequado"
                        : "Abaixo da meta"}
                    </span>
                  </div>
                )}
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 ring-1 ring-white/5">
                    <div
                      style={{ width: `${Math.max(2, lossReasonPct.value)}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        lossReasonPct.value >= 70
                          ? "bg-emerald-500"
                          : lossReasonPct.value >= 30
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Atual: {lossReasonPct.formatted}</span>
                    <span>Referência: ≥ 80%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-mono text-[10px] text-zinc-500">
                Card #{cardIds.pctLossReason}
              </span>
              <span className="text-[10px] text-zinc-400">
                {lossReasonPct.value < 10
                  ? "Abaixo do esperado"
                  : "Em conformidade"}
              </span>
            </div>
          </div>
        </CardEditWrapper>

        {/* Card 2: Perdas Sem Motivo */}
        <CardEditWrapper
          isEditMode={isEditMode}
          cardKey="perdasMotivoIndefinido"
          cardTitle="Perdas Sem Motivo"
          currentCardId={cardIds.perdasMotivoIndefinido}
          onUpdateCardId={onUpdateCardId}
        >
          <div className="group bg-zinc-900 rounded-2xl p-5 border border-white/10 transition-all duration-300 relative h-full flex flex-col justify-between hover:border-white/20">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-[10px] tracking-wider text-zinc-500 font-semibold uppercase block truncate">
                    Furo na Qualidade
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                    <span className="truncate">Perdas Sem Motivo</span>
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
                        Card #{cardIds.perdasMotivoIndefinido}
                      </p>
                      Oportunidades encerradas como "Perdido" sem a
                      justificativa preenchida no CRM.
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 shrink-0 group-hover:text-zinc-300 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                {perdasMotivoIndefinido.loading ? (
                  <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400">
                    {perdasVal}
                  </span>
                )}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 whitespace-nowrap">
                  Sem motivo
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-mono text-[10px] text-zinc-500">
                Card #{cardIds.perdasMotivoIndefinido}
              </span>
            </div>
          </div>
        </CardEditWrapper>
      </div>
    </div>
  );
};
