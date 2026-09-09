import React, { useState } from "react";
import {
  MetabaseCardQueryResult,
  extractSingleValue,
  DashboardCardIds,
} from "../services/metabaseQueries";
import {
  MessageSquareOff,
  Percent,
  FileX2,
  UserX,
  Hourglass,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Info,
  Plus,
  Clock,
  CalendarX,
  CheckCircle,
  List,
} from "lucide-react";
import { CardEditWrapper } from "./CardEditWrapper";
import { LeadsParadosModal } from "./LeadsParadosModal";

interface TopKpiRowProps {
  respostasForaCrm: MetabaseCardQueryResult;
  pctLeadsValor: MetabaseCardQueryResult;
  leadsSemResponsavelFernando: MetabaseCardQueryResult;
  cicloVendasDias: MetabaseCardQueryResult;
  tempoPrimeiraResposta: MetabaseCardQueryResult;
  contatosDuplicados: MetabaseCardQueryResult;
  leadsParadosEtapasDra: MetabaseCardQueryResult;
  tarefasVencidasDra: MetabaseCardQueryResult;
  consultaRealizadaDra: MetabaseCardQueryResult;
  pctVendaConsultaDra: MetabaseCardQueryResult;
  totalLeadsParadosDra?: MetabaseCardQueryResult;
  isEditMode: boolean;
  cardIds: DashboardCardIds;
  onUpdateCardId: (cardKey: string, newId: number) => void;
  isRespostasChartOpen?: boolean;
  onToggleRespostasChart?: () => void;
}

export const TopKpiRow: React.FC<TopKpiRowProps> = ({
  respostasForaCrm,
  pctLeadsValor,
  leadsSemResponsavelFernando,
  cicloVendasDias,
  tempoPrimeiraResposta,
  contatosDuplicados,
  leadsParadosEtapasDra,
  tarefasVencidasDra,
  consultaRealizadaDra,
  pctVendaConsultaDra,
  totalLeadsParadosDra,
  isEditMode,
  cardIds,
  onUpdateCardId,
  isRespostasChartOpen,
  onToggleRespostasChart,
}) => {
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false);

  const respostasRaw = extractSingleValue(respostasForaCrm, 0);
  const respostasVal = Number(respostasRaw || 0).toLocaleString("pt-BR");

  // Format percentage for leads com campo valor (Card 212)
  let pctValRaw = extractSingleValue(pctLeadsValor, 0.0031);
  let pctFormatted = "0,31%";
  if (typeof pctValRaw === "number") {
    pctFormatted = `${(pctValRaw * (pctValRaw <= 1 ? 100 : 1)).toFixed(2).replace(".", ",")}%`;
  } else if (typeof pctValRaw === "string") {
    pctFormatted = pctValRaw.includes("%") ? pctValRaw : `${pctValRaw}%`;
  }

  // Format leads órfãos / sem responsável (Fernando) (Card 228)
  let orfaosRaw = extractSingleValue(leadsSemResponsavelFernando, 0);
  let orfaosFormatted = Number(orfaosRaw || 0).toLocaleString("pt-BR");

  // Format ciclo de vendas em dias (Card 214)
  let cicloValRaw = extractSingleValue(cicloVendasDias, 229.3);
  let cicloFormatted =
    typeof cicloValRaw === "number"
      ? cicloValRaw.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
      : cicloValRaw;

  // Format tempo médio de primeira resposta em minutos (Card 232)
  let tempo1Raw = extractSingleValue(tempoPrimeiraResposta, 68.3);
  let tempo1Formatted =
    typeof tempo1Raw === "number"
      ? `${tempo1Raw.toFixed(1).replace(".", ",")} min`
      : `${tempo1Raw} min`;

  // Format contatos duplicados (Card 233)
  let duplicadosRaw = extractSingleValue(contatosDuplicados, 0);
  let duplicadosFormatted = Number(duplicadosRaw || 0).toLocaleString("pt-BR");

  // Format Leads Parados Etapas Dra (Card 273)
  let leadsParadosRaw = extractSingleValue(leadsParadosEtapasDra, 0);
  let leadsParadosFormatted = Number(leadsParadosRaw || 0).toLocaleString(
    "pt-BR",
  );

  // Format Tarefas Vencidas Dra (Card 274)
  let tarefasVencidasRaw = extractSingleValue(tarefasVencidasDra, 0);
  let tarefasVencidasFormatted = Number(tarefasVencidasRaw || 0).toLocaleString(
    "pt-BR",
  );

  // Format Consulta Realizada Dra (Card 275)
  let consultaRealizadaRaw = extractSingleValue(consultaRealizadaDra, 0);
  let consultaRealizadaFormatted = Number(
    consultaRealizadaRaw || 0,
  ).toLocaleString("pt-BR");

  // Format Pct Venda Consulta Dra (Card 276)
  let pctVendaRaw = extractSingleValue(pctVendaConsultaDra, 0);
  let pctVendaFormatted = "0%";
  if (typeof pctVendaRaw === "number") {
    pctVendaFormatted = `${(pctVendaRaw * (pctVendaRaw <= 1 ? 100 : 1)).toFixed(2).replace(".", ",")}%`;
  } else if (typeof pctVendaRaw === "string") {
    pctVendaFormatted = pctVendaRaw.includes("%")
      ? pctVendaRaw
      : `${pctVendaRaw}%`;
  }

  let totalLeadsParadosRaw = extractSingleValue(
    totalLeadsParadosDra || {
      loading: true,
      cardId: 0,
      cardName: "",
      columns: [],
      rows: [],
    },
    0,
  );

  let finalLeadsParadosCount = Number(totalLeadsParadosRaw);
  if (
    finalLeadsParadosCount === 0 &&
    leadsParadosEtapasDra &&
    leadsParadosEtapasDra.rows
  ) {
    finalLeadsParadosCount = leadsParadosEtapasDra.rows.length;
  }

  let totalLeadsParadosFormatted =
    finalLeadsParadosCount.toLocaleString("pt-BR");

  const kpis = [
    {
      key: "respostasForaCrm",
      cardId: cardIds.respostasForaCrm,
      title: "Respostas Fora do CRM",
      subtext: "Mensagens sem vínculo na Clínica",
      tooltip:
        "Volume total de respostas ou mensagens enviadas nos canais de atendimento que não estão vinculadas a um lead no CRM.",
      value: respostasVal,
      queryResult: respostasForaCrm,
      icon: MessageSquareOff,
    },
    {
      key: "pctLeadsValor",
      cardId: cardIds.pctLeadsValor,
      title: "Leads com Valor Preenchido",
      subtext: "Adoção do campo valor",
      tooltip:
        'Percentual de leads no CRM que possuem o campo "valor" devidamente preenchido. Reflete a qualidade do preenchimento.',
      value: pctFormatted,
      queryResult: pctLeadsValor,
      icon: Percent,
    },
    {
      key: "cicloVendasDias",
      cardId: cardIds.cicloVendasDias,
      title: "Ciclo de Vendas (Dias)",
      subtext: "Time to Close na Clínica",
      tooltip:
        "Tempo médio (em dias) que um lead leva desde o momento da sua criação até a resolução (ganho ou perda).",
      value: cicloFormatted,
      queryResult: cicloVendasDias,
      icon: Hourglass,
      badge: {
        text: "dias",
        color: "text-zinc-500 font-mono text-[11px]",
        isUnit: true,
      },
    },
    {
      key: "totalLeadsParadosDra",
      cardId: cardIds.totalLeadsParadosDra,
      title: "Leads Parados > 24h",
      subtext: "Em Atendimento / Tem Interesse",
      tooltip:
        'Quantidade total de leads nas etapas "Em atendimento" e "Tem interesse" que não foram atualizados nas últimas 24 horas.',
      value: totalLeadsParadosFormatted,
      queryResult: totalLeadsParadosDra || leadsParadosEtapasDra,
      icon: Clock,
      badge: {
        text: "leads",
        color: "text-zinc-500 font-mono text-[11px]",
        isUnit: true,
      },
    },
    {
      key: "consultaRealizadaDra",
      cardId: cardIds.consultaRealizadaDra,
      title: "Consultas Realizadas",
      subtext: "Funil Pacientes.Dra Michelli",
      tooltip:
        'Número de leads que atingiram o estágio "Consulta Realizada" no pipeline específico.',
      value: consultaRealizadaFormatted,
      queryResult: consultaRealizadaDra,
      icon: CheckCircle,
      badge: {
        text: "leads",
        color: "text-zinc-500 font-mono text-[11px]",
        isUnit: true,
      },
    },
    {
      key: "pctVendaConsultaDra",
      cardId: cardIds.pctVendaConsultaDra,
      title: "% Venda de Consulta",
      subtext: "Criados vs Comparecidos",
      tooltip:
        "Taxa de conversão de leads (não deletados) que compareceram ou realizaram a consulta em relação ao total de leads criados.",
      value: pctVendaFormatted,
      queryResult: pctVendaConsultaDra,
      icon: TrendingUp,
    },
  ];

  const renderCard = (kpi: (typeof kpis)[0]) => {
    const Icon = kpi.icon;
    const BadgeIcon =
      kpi.badge && "icon" in kpi.badge ? (kpi.badge as any).icon : null;
    const isLoading = kpi.queryResult.loading;

    return (
      <CardEditWrapper
        key={kpi.key}
        isEditMode={isEditMode}
        cardKey={kpi.key}
        cardTitle={kpi.title}
        currentCardId={kpi.cardId}
        onUpdateCardId={onUpdateCardId}
      >
        <div className="group bg-zinc-900 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative h-full flex flex-col justify-between min-h-[150px]">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                {kpi.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative inline-flex items-center group/tooltip">
                <button
                  type="button"
                  className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors focus:outline-none"
                  aria-label={`Informações sobre ${kpi.title}`}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover/tooltip:block group-focus-within/tooltip:block w-56 p-2.5 bg-zinc-900/95 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl rounded-xl text-[11px] font-normal text-zinc-300 leading-snug shadow-2xl z-50 pointer-events-none">
                  {kpi.tooltip}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300 group-hover:border-zinc-600 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-baseline gap-2 min-w-0">
              {isLoading ? (
                <div className="h-8 w-20 bg-white/5 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-400 truncate">
                  {kpi.value}
                </span>
              )}
            </div>

            {!isLoading &&
              kpi.badge &&
              (kpi.badge.isUnit ? (
                <span className={kpi.badge.color}>{kpi.badge.text}</span>
              ) : (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 whitespace-nowrap ${kpi.badge.color}`}
                >
                  {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                  {kpi.badge.text}
                </span>
              ))}
          </div>
          <div className="flex items-center justify-between gap-2 mt-2 pt-0.5">
            <p className="text-[11px] text-zinc-500 line-clamp-1 font-medium">
              {kpi.subtext}
            </p>
            {kpi.key === "respostasForaCrm" && onToggleRespostasChart && (
              <button
                type="button"
                id="btn-ver-mais-respostas-fora-crm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRespostasChart();
                }}
                title={
                  isRespostasChartOpen
                    ? "Ocultar gráfico por período"
                    : "Exibir gráfico detalhado por período"
                }
                aria-label={
                  isRespostasChartOpen
                    ? "Ocultar gráfico por período"
                    : "Exibir gráfico detalhado por período"
                }
                className={`p-1.5 rounded-lg border transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0 ${
                  isRespostasChartOpen
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm rotate-45"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700/60 hover:border-zinc-500 shadow-sm"
                }`}
              >
                <Plus className="w-3.5 h-3.5 transition-transform" />
              </button>
            )}
            {kpi.key === "totalLeadsParadosDra" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLeadsModalOpen(true);
                }}
                title="Ver lista de leads"
                aria-label="Ver lista de leads"
                className="p-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 shadow-sm transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardEditWrapper>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-5">
        {kpis.map(renderCard)}
      </div>
      <LeadsParadosModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        queryResult={leadsParadosEtapasDra}
        cardId={cardIds.leadsParadosEtapasDra}
      />
    </>
  );
};
