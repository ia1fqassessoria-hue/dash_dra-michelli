import React, { useState, useEffect, useCallback } from "react";
import { PeriodFilter, DateRange, MetabaseConnectionStatus } from "./types";
import { checkMetabaseStatus } from "./services/metabase";
import {
  fetchAllMetabaseCardQueries,
  AllMetabaseData,
  DashboardCardIds,
  DEFAULT_CARD_IDS,
} from "./services/metabaseQueries";
import { exportDashboardToPdf } from "./utils/pdfExport";

import { Header } from "./components/Header";
import { TopKpiRow } from "./components/TopKpiRow";
import { RespostasForaCrmPeriodoChart } from "./components/RespostasForaCrmPeriodoChart";
import { OperacaoSlaSection } from "./components/OperacaoSlaSection";
import { LossAndTaskComplianceCards } from "./components/LossAndTaskComplianceCards";
import { TempoMedioParadoCard } from "./components/TempoMedioParadoCard";
import { PerformanceVendedorChart } from "./components/PerformanceVendedorChart";
import { EtapaLeadsParadosTable } from "./components/EtapaLeadsParadosTable";
import { LeadVelocityChart } from "./components/LeadVelocityChart";
import { DetalhamentoEventosTable } from "./components/DetalhamentoEventosTable";
import { ProdutosPreenchidosCard } from "./components/ProdutosPreenchidosCard";
import { OrigemLeadsChart } from "./components/OrigemLeadsChart";
import { InatividadeVendedorChart } from "./components/InatividadeVendedorChart";
import { DataQualityScoreTable } from "./components/DataQualityScoreTable";

import {
  Sparkles,
  FileSpreadsheet,
  Edit3,
  Check,
  Database,
  Loader2,
  Settings,
} from "lucide-react";

const REFRESH_INTERVAL_SECONDS = 600; // 10 minutes in seconds
const CARD_IDS_STORAGE_KEY = "crm_michelli_card_ids";

function loadStoredCardIds(): DashboardCardIds {
  try {
    const saved = localStorage.getItem(CARD_IDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        !parsed.leadsSemResponsavelFernando ||
        !parsed.tempoPrimeiraResposta
      ) {
        localStorage.setItem(
          CARD_IDS_STORAGE_KEY,
          JSON.stringify(DEFAULT_CARD_IDS),
        );
        return DEFAULT_CARD_IDS;
      }
      return { ...DEFAULT_CARD_IDS, ...parsed };
    }
  } catch (e) {
    console.error("Erro ao carregar IDs armazenados:", e);
  }
  return DEFAULT_CARD_IDS;
}

function getInitialUrlParams(): {
  period: PeriodFilter;
  customRange: DateRange;
} {
  if (typeof window === "undefined") {
    return {
      period: "30days",
      customRange: {
        startDate: new Date(Date.now() - 30 * 86400000)
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      },
    };
  }
  const params = new URLSearchParams(window.location.search);
  const periodParam = params.get("period") as PeriodFilter;
  const startDate =
    params.get("startDate") ||
    new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const endDate =
    params.get("endDate") || new Date().toISOString().split("T")[0];

  const validPeriods: PeriodFilter[] = [
    "today",
    "7days",
    "30days",
    "90days",
    "this_month",
    "last_month",
    "custom",
  ];
  const period = validPeriods.includes(periodParam) ? periodParam : "30days";

  return { period, customRange: { startDate, endDate } };
}

export default function App() {
  const initialParams = getInitialUrlParams();

  // Period filter state
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(
    initialParams.period,
  );
  const [customRange, setCustomRange] = useState<DateRange>(
    initialParams.customRange,
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync state changes with URL query string
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("period", selectedPeriod);
    if (
      selectedPeriod === "custom" &&
      customRange.startDate &&
      customRange.endDate
    ) {
      url.searchParams.set("startDate", customRange.startDate);
      url.searchParams.set("endDate", customRange.endDate);
    } else {
      url.searchParams.delete("startDate");
      url.searchParams.delete("endDate");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedPeriod, customRange]);

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("period", selectedPeriod);
    if (
      selectedPeriod === "custom" &&
      customRange.startDate &&
      customRange.endDate
    ) {
      url.searchParams.set("startDate", customRange.startDate);
      url.searchParams.set("endDate", customRange.endDate);
    }
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Auto-refresh state (10 minutes)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [secondsToNextRefresh, setSecondsToNextRefresh] = useState<number>(
    REFRESH_INTERVAL_SECONDS,
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // PDF Export state
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Metabase Connection Status
  const [metabaseStatus, setMetabaseStatus] =
    useState<MetabaseConnectionStatus | null>(null);

  // Card Query IDs Mapping State
  const [cardIds, setCardIds] = useState<DashboardCardIds>(loadStoredCardIds);

  // In-Place Dashboard Edit Mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Expandable Respostas Fora do CRM per period chart (Card #151)
  const [showRespostasForaCrmChart, setShowRespostasForaCrmChart] =
    useState<boolean>(false);

  // Live Metabase queries state
  const [mbData, setMbData] = useState<AllMetabaseData | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  // Load Metabase status and execute all card queries
  const refreshAllMetabaseData = useCallback(
    async (
      customIds?: DashboardCardIds,
      period?: PeriodFilter,
      range?: DateRange,
      forceRefresh: boolean = false,
    ) => {
      setIsRefreshing(true);
      const targetIds = customIds || cardIds;
      const targetPeriod = period || selectedPeriod;
      const targetRange = range || customRange;

      const [status, result] = await Promise.all([
        checkMetabaseStatus(),
        fetchAllMetabaseCardQueries(
          targetIds,
          targetPeriod,
          targetRange,
          forceRefresh,
        ),
      ]);

      setMetabaseStatus(status);
      setMbData(result.data);
      setLastUpdated(result.timestamp);
      setIsFromCache(result.isFromCache);
      setSecondsToNextRefresh(REFRESH_INTERVAL_SECONDS);
      setIsRefreshing(false);
    },
    [cardIds, selectedPeriod, customRange],
  );

  useEffect(() => {
    refreshAllMetabaseData();
  }, [selectedPeriod, customRange, refreshAllMetabaseData]);

  // Handler for updating a single card's query ID directly from edit overlay
  const handleUpdateCardId = (cardKey: string, newId: number) => {
    const updated = {
      ...cardIds,
      [cardKey]: newId,
    };
    setCardIds(updated);
    try {
      localStorage.setItem(CARD_IDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
    refreshAllMetabaseData(updated, undefined, undefined, true);
  };

  // 10-Minute Auto-Refresh Timer
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setSecondsToNextRefresh((prev) => {
        if (prev <= 1) {
          refreshAllMetabaseData(undefined, undefined, undefined, true);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refreshAllMetabaseData]);

  // PDF Export trigger
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportDashboardToPdf("dashboard-content");
    setIsExportingPdf(false);
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white relative overflow-x-hidden antialiased flex flex-col justify-between">
      {/* Top Fixed Header with Filters & Edit Mode */}
      <Header
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={setAutoRefreshEnabled}
        secondsToNextRefresh={secondsToNextRefresh}
        onManualRefresh={() =>
          refreshAllMetabaseData(undefined, undefined, undefined, true)
        }
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        isFromCache={isFromCache}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        metabaseStatus={metabaseStatus}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onShareLink={handleShareLink}
        copiedLink={copiedLink}
      />

      {/* Active Edit Mode Alert Banner */}
      {isEditMode && (
        <div className="bg-amber-500/10 border-y border-amber-500/20 px-4 py-2.5 text-xs text-amber-300 animate-fadeIn no-print relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-medium">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-amber-400">⚠️</span>
              <span>
                <strong>Modo de Configuração Ativo:</strong> Selecione "Alterar
                ID" em qualquer indicador para atualizar a referência da query
                no Metabase.
              </span>
            </div>
            <button
              onClick={() => setIsEditMode(false)}
              className="px-3 py-1 bg-amber-400 text-zinc-950 font-bold rounded-full hover:bg-amber-300 transition-colors text-[11px] shrink-0"
            >
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Container */}
      <main
        id="dashboard-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 relative z-10 w-full"
      >
        {/* Main Loading View when fetching data */}
        {isRefreshing ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 px-4 text-center space-y-6 animate-fadeIn">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 bg-zinc-800/50 rounded-full blur-2xl animate-pulse" />
              <div className="w-20 h-20 border-2 border-white/10 border-t-zinc-300 rounded-full animate-spin" />
              <Database className="w-7 h-7 text-zinc-400 absolute animate-pulse" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h2 className="text-base font-bold text-white tracking-tight font-display flex items-center justify-center gap-2">
                <span>Carregando Indicadores</span>
                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Consultando dados no Metabase. As informações serão exibidas em
                instantes.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-medium backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
              <span>Aguardando resposta do servidor...</span>
            </div>
          </div>
        ) : (
          mbData && (
            <>
              {/* Main Page Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1 pb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                    Diagnóstico Operacional do CRM
                  </h1>
                </div>
              </div>

              {/* Executive Summary / Header Info */}
              <section className="bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-white/10 relative overflow-hidden transition-all hover:border-white/20 duration-300 ease-out">
                <div className="space-y-1.5 max-w-3xl">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-200 font-display tracking-tight">
                    Visão Geral da Operação
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Monitoramento do tempo de resposta da equipe comercial,
                    identificação de gargalos de movimentação por etapa e
                    conformidade no preenchimento de campos obrigatórios do CRM.
                  </p>
                </div>
              </section>

              {/* 1. Top KPI Summary Row (Cards 211, 212, 228, 214, 232) */}
              <section aria-label="KPIs Dashboard">
                <TopKpiRow
                  respostasForaCrm={mbData.respostasForaCrm}
                  pctLeadsValor={mbData.pctLeadsValor}
                  leadsSemResponsavelFernando={
                    mbData.leadsSemResponsavelFernando
                  }
                  cicloVendasDias={mbData.cicloVendasDias}
                  tempoPrimeiraResposta={mbData.tempoPrimeiraResposta}
                  contatosDuplicados={mbData.contatosDuplicados}
                  leadsParadosEtapasDra={mbData.leadsParadosEtapasDra}
                  tarefasVencidasDra={mbData.tarefasVencidasDra}
                  consultaRealizadaDra={mbData.consultaRealizadaDra}
                  pctVendaConsultaDra={mbData.pctVendaConsultaDra}
                  totalLeadsParadosDra={mbData.totalLeadsParadosDra}
                  isEditMode={isEditMode}
                  cardIds={cardIds}
                  onUpdateCardId={handleUpdateCardId}
                  isRespostasChartOpen={showRespostasForaCrmChart}
                  onToggleRespostasChart={() =>
                    setShowRespostasForaCrmChart((prev) => !prev)
                  }
                />
              </section>

              {/* 1.1 Expandable Section: Respostas Fora do CRM por Período (Card #217) */}
              {showRespostasForaCrmChart && mbData.respostasForaCrmPeriodo && (
                <section
                  aria-label="Respostas Fora do CRM por Período"
                  className="transition-all duration-500 ease-out"
                >
                  <RespostasForaCrmPeriodoChart
                    queryResult={mbData.respostasForaCrmPeriodo}
                    isEditMode={isEditMode}
                    cardId={cardIds.respostasForaCrmPeriodo}
                    onUpdateCardId={handleUpdateCardId}
                    selectedPeriod={selectedPeriod}
                    customRange={customRange}
                    onClose={() => setShowRespostasForaCrmChart(false)}
                  />
                </section>
              )}

              {/* 2. Alertas Críticos & SLAs Operacionais (Cards 229, 230, 231) */}
              <section aria-label="Alertas Operacionais e SLAs">
                <OperacaoSlaSection
                  tarefasVencidas={mbData.tarefasVencidas}
                  pctClosestTaskAt={mbData.pctClosestTaskAt}
                  isEditMode={isEditMode}
                  cardIds={{
                    tarefasVencidas: cardIds.tarefasVencidas,
                    pctClosestTaskAt: cardIds.pctClosestTaskAt,
                  }}
                  onUpdateCardId={handleUpdateCardId}
                />
              </section>

              {/* 3. Conformidade de Preenchimento & Governança (Cards 224, 225, 226) */}
              <section aria-label="Conformidade de Preenchimento">
                <LossAndTaskComplianceCards
                  pctLossReason={mbData.pctLossReason}
                  perdasMotivoIndefinido={mbData.perdasMotivoIndefinido}
                  isEditMode={isEditMode}
                  cardIds={{
                    pctLossReason: cardIds.pctLossReason,
                    perdasMotivoIndefinido: cardIds.perdasMotivoIndefinido,
                  }}
                  onUpdateCardId={handleUpdateCardId}
                />
              </section>

              {/* Volume de Novos Leads no Tempo (Lead Velocity - Card 218) */}
              <section aria-label="Lead Velocity">
                <LeadVelocityChart
                  queryResult={mbData.leadVelocity}
                  isEditMode={isEditMode}
                  cardId={cardIds.leadVelocity}
                  onUpdateCardId={handleUpdateCardId}
                  selectedPeriod={selectedPeriod}
                  customRange={customRange}
                />
              </section>

              {/* 4. Performance da Equipe Comercial (Cards 216 e 223) */}
              <section aria-label="Performance Comercial">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <PerformanceVendedorChart
                    queryResult={mbData.performanceUsuario}
                    isEditMode={isEditMode}
                    cardId={cardIds.performanceUsuario}
                    onUpdateCardId={handleUpdateCardId}
                  />

                  <InatividadeVendedorChart
                    queryResult={mbData.inatividadeVendedor}
                    isEditMode={isEditMode}
                    cardId={cardIds.inatividadeVendedor}
                    onUpdateCardId={handleUpdateCardId}
                  />
                </div>
              </section>

              {/* 6. Tempo Médio Parado e Gargalos por Etapa (Cards 215 e 220) */}
              <section aria-label="Tempo Médio Parado">
                <TempoMedioParadoCard
                  queryResult={mbData.tempoMedioParado}
                  isEditMode={isEditMode}
                  cardId={cardIds.tempoMedioParado}
                  onUpdateCardId={handleUpdateCardId}
                />
              </section>

              <section aria-label="Concentração de Leads por Etapa">
                <EtapaLeadsParadosTable
                  queryResult={mbData.etapaLeadsParados}
                  isEditMode={isEditMode}
                  cardId={cardIds.etapaLeadsParados}
                  onUpdateCardId={handleUpdateCardId}
                />
              </section>

              {/* 7. Conformidade de Produtos e Origem dos Leads (Cards 222 e 227) */}
              <section aria-label="Catálogo e Origem">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <ProdutosPreenchidosCard
                    queryResult={mbData.produtosPreenchidos}
                    isEditMode={isEditMode}
                    cardId={cardIds.produtosPreenchidos}
                    onUpdateCardId={handleUpdateCardId}
                  />

                  <OrigemLeadsChart
                    queryResult={mbData.origemLeads}
                    isEditMode={isEditMode}
                    cardId={cardIds.origemLeads}
                    onUpdateCardId={handleUpdateCardId}
                  />
                </div>
              </section>

              {/* 8. Qualidade do Preenchimento por Vendedor (Card 219) */}
              <section aria-label="Qualidade do Preenchimento por Vendedor">
                <DataQualityScoreTable
                  queryResult={mbData.dataQualityVendedor}
                  isEditMode={isEditMode}
                  cardId={cardIds.dataQualityVendedor}
                  onUpdateCardId={handleUpdateCardId}
                />
              </section>

              {/* 9. Detalhamento de Eventos (Card 221) */}
              <section aria-label="Detalhamento de Eventos">
                <DetalhamentoEventosTable
                  queryResult={mbData.detalhamentoEventos}
                  isEditMode={isEditMode}
                  cardId={cardIds.detalhamentoEventos}
                  onUpdateCardId={handleUpdateCardId}
                />
              </section>
            </>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-white/10 bg-zinc-950 py-6 no-print w-full relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-zinc-600 hidden sm:inline-block"></span>
            <span className="font-semibold text-zinc-300">
              Diagnóstico do CRM • Dra. Michelli Pacheco
            </span>
            <span className="hidden sm:inline-block">•</span>
            <span>
              &copy; 2026 Dra. Michelli Pacheco. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-zinc-500">
            <span>
              Atualizado:{" "}
              <strong className="text-zinc-300 font-mono">
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </span>
            <span>•</span>
            <span>
              Próxima atualização:{" "}
              <strong className="text-zinc-300 font-mono">
                {formatCountdown(secondsToNextRefresh)}
              </strong>
            </span>

            {/* Developer Mapear IDs button - hidden on mobile, visible on desktop */}
            <span className="hidden md:inline text-zinc-700">•</span>
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-amber-300 text-[11px] font-medium transition-all group active:scale-95 cursor-pointer"
              title="Configurar IDs das queries do Metabase"
            >
              <Settings className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <span>{isEditMode ? "Concluir" : "Configurar IDs"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
