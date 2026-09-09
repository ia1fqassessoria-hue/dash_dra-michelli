import {
  queryMetabaseCard,
  parseMetabaseData,
  fetchMetabaseCardInfo,
  buildCardParameters,
  getPeriodValue,
  filterRowsByPeriod,
} from "./metabase";
import { PeriodFilter, DateRange } from "../types";

export interface MetabaseCardQueryResult {
  cardId: number;
  cardName: string;
  loading: boolean;
  error?: string;
  columns: string[];
  rows: any[][];
  rawResponse?: any;
}

export interface DashboardCardIds {
  respostasForaCrm: number; // 255
  pctLeadsValor: number; // 256
  leadsOrfaos: number; // 237
  cicloVendasDias: number; // 244
  tempoMedioParado: number; // 254
  performanceUsuario: number; // 247
  respostasForaCrmPeriodo: number; // 240
  leadVelocity: number; // 234
  dataQualityVendedor: number; // 248
  etapaLeadsParados: number; // 251
  detalhamentoEventos: number; // 243
  produtosPreenchidos: number; // 242
  inatividadeVendedor: number; // 246
  pctLossReasonId: number; // 238
  pctClosestTaskAt: number; // 239
  pctLossReason: number; // 245
  origemLeads: number; // 250
  leadsSemResponsavelFernando: number; // 252
  leadsParados24h: number; // 236
  tarefasVencidas: number; // 253
  perdasMotivoIndefinido: number; // 249
  tempoPrimeiraResposta: number; // 241
  contatosDuplicados: number; // 235
  leadsParadosEtapasDra: number; // 273
  tarefasVencidasDra: number; // 274
  consultaRealizadaDra: number; // 275
  pctVendaConsultaDra: number; // 276
  totalLeadsParadosDra: number; // 277
}

export const DEFAULT_CARD_IDS: DashboardCardIds = {
  respostasForaCrm: 255,
  pctLeadsValor: 256,
  leadsOrfaos: 237,
  cicloVendasDias: 244,
  tempoMedioParado: 254,
  performanceUsuario: 247,
  respostasForaCrmPeriodo: 240,
  leadVelocity: 234,
  dataQualityVendedor: 248,
  etapaLeadsParados: 251,
  detalhamentoEventos: 243,
  produtosPreenchidos: 242,
  inatividadeVendedor: 246,
  pctLossReasonId: 238,
  pctClosestTaskAt: 239,
  pctLossReason: 245,
  origemLeads: 250,
  leadsSemResponsavelFernando: 252,
  leadsParados24h: 236,
  tarefasVencidas: 253,
  perdasMotivoIndefinido: 249,
  tempoPrimeiraResposta: 241,
  contatosDuplicados: 235,
  leadsParadosEtapasDra: 273,
  tarefasVencidasDra: 274,
  consultaRealizadaDra: 275,
  pctVendaConsultaDra: 276,
  totalLeadsParadosDra: 277,
};

export interface AllMetabaseData {
  respostasForaCrm: MetabaseCardQueryResult;
  pctLeadsValor: MetabaseCardQueryResult;
  leadsOrfaos: MetabaseCardQueryResult;
  cicloVendasDias: MetabaseCardQueryResult;
  tempoMedioParado: MetabaseCardQueryResult;
  performanceUsuario: MetabaseCardQueryResult;
  respostasForaCrmPeriodo: MetabaseCardQueryResult;
  leadVelocity: MetabaseCardQueryResult;
  dataQualityVendedor: MetabaseCardQueryResult;
  etapaLeadsParados: MetabaseCardQueryResult;
  detalhamentoEventos: MetabaseCardQueryResult;
  produtosPreenchidos: MetabaseCardQueryResult;
  inatividadeVendedor: MetabaseCardQueryResult;
  pctLossReasonId: MetabaseCardQueryResult;
  pctClosestTaskAt: MetabaseCardQueryResult;
  pctLossReason: MetabaseCardQueryResult;
  origemLeads: MetabaseCardQueryResult;
  leadsSemResponsavelFernando: MetabaseCardQueryResult;
  leadsParados24h: MetabaseCardQueryResult;
  tarefasVencidas: MetabaseCardQueryResult;
  perdasMotivoIndefinido: MetabaseCardQueryResult;
  tempoPrimeiraResposta: MetabaseCardQueryResult;
  contatosDuplicados: MetabaseCardQueryResult;
  leadsParadosEtapasDra: MetabaseCardQueryResult;
  tarefasVencidasDra: MetabaseCardQueryResult;
  consultaRealizadaDra: MetabaseCardQueryResult;
  pctVendaConsultaDra: MetabaseCardQueryResult;
  totalLeadsParadosDra: MetabaseCardQueryResult;
}

interface CachedResponse {
  data: AllMetabaseData;
  timestamp: Date;
}

const metabaseDataCache = new Map<string, CachedResponse>();

export function createCacheKey(
  customIds?: DashboardCardIds,
  selectedPeriod: PeriodFilter = "30days",
  customRange?: DateRange,
): string {
  const ids = customIds || DEFAULT_CARD_IDS;
  const idsString = JSON.stringify(ids);
  const periodVal = getPeriodValue(selectedPeriod, customRange);
  return `${idsString}_${selectedPeriod}_${periodVal}`;
}

export function clearMetabaseDataCache(): void {
  metabaseDataCache.clear();
}

export async function fetchAllMetabaseCardQueries(
  customIds?: DashboardCardIds,
  selectedPeriod: PeriodFilter = "30days",
  customRange?: DateRange,
  forceRefresh: boolean = false,
): Promise<{ data: AllMetabaseData; timestamp: Date; isFromCache: boolean }> {
  const cacheKey = createCacheKey(customIds, selectedPeriod, customRange);

  if (!forceRefresh && metabaseDataCache.has(cacheKey)) {
    const cached = metabaseDataCache.get(cacheKey)!;
    return {
      data: cached.data,
      timestamp: cached.timestamp,
      isFromCache: true,
    };
  }

  const ids = customIds || DEFAULT_CARD_IDS;
  const periodValue = getPeriodValue(selectedPeriod, customRange);

  const cardList = [
    {
      key: "respostasForaCrm",
      id: ids.respostasForaCrm,
      name: "Respostas fora do CRM - Michelli",
    },
    {
      key: "pctLeadsValor",
      id: ids.pctLeadsValor,
      name: 'Porcentagem de leads com o campo "valor" preenchido - Michelli',
    },
    {
      key: "leadsOrfaos",
      id: ids.leadsOrfaos,
      name: "Leads Órfãos (Sem Dono) - Michelli",
    },
    {
      key: "cicloVendasDias",
      id: ids.cicloVendasDias,
      name: "Ciclo de Vendas (Time to Close) - Dias - Michelli",
    },
    {
      key: "tempoMedioParado",
      id: ids.tempoMedioParado,
      name: "Tempo médio que lead fica parado - Michelli",
    },
    {
      key: "performanceUsuario",
      id: ids.performanceUsuario,
      name: "Performance por usuario - Michelli",
    },
    {
      key: "respostasForaCrmPeriodo",
      id: ids.respostasForaCrmPeriodo,
      name: "Respostas fora do CRM - Por periodo - Michelli",
    },
    {
      key: "leadVelocity",
      id: ids.leadVelocity,
      name: "Volume de Novos Leads no Tempo (Lead Velocity) - Michelli",
    },
    {
      key: "dataQualityVendedor",
      id: ids.dataQualityVendedor,
      name: "Qualidade do Preenchimento por Vendedor (Data Quality Score) - Michelli",
    },
    {
      key: "etapaLeadsParados",
      id: ids.etapaLeadsParados,
      name: "Etapa com maior numero de leads parados - Michelli",
    },
    {
      key: "detalhamentoEventos",
      id: ids.detalhamentoEventos,
      name: "Detalhamento de Eventos - Michelli",
    },
    {
      key: "produtosPreenchidos",
      id: ids.produtosPreenchidos,
      name: "Produtos preenchidos - Michelli",
    },
    {
      key: "inatividadeVendedor",
      id: ids.inatividadeVendedor,
      name: "Tempo de Inatividade por Vendedor (Funil de Vendas) - Michelli",
    },
    {
      key: "pctLossReasonId",
      id: ids.pctLossReasonId,
      name: "Porcentagem de loss_reason_id preenchido - Michelli",
    },
    {
      key: "pctClosestTaskAt",
      id: ids.pctClosestTaskAt,
      name: "Porcentagem de closest_task_at preenchido - Michelli",
    },
    {
      key: "pctLossReason",
      id: ids.pctLossReason,
      name: "Porcentagem de loss_reason preenchido - Michelli",
    },
    {
      key: "origemLeads",
      id: ids.origemLeads,
      name: "Origem dos Leads - Michelli",
    },
    {
      key: "leadsSemResponsavelFernando",
      id: ids.leadsSemResponsavelFernando,
      name: "Leads sem responsável (Fernando)",
    },
    {
      key: "leadsParados24h",
      id: ids.leadsParados24h,
      name: "Leads parados (> 24h em Atendimento/Qualificados)",
    },
    {
      key: "tarefasVencidas",
      id: ids.tarefasVencidas,
      name: "Tarefas Vencidas",
    },
    {
      key: "perdasMotivoIndefinido",
      id: ids.perdasMotivoIndefinido,
      name: "Perdas com motivo indefinido",
    },
    {
      key: "tempoPrimeiraResposta",
      id: ids.tempoPrimeiraResposta,
      name: "Tempo médio de primeira resposta (Atendimento)",
    },
    {
      key: "contatosDuplicados",
      id: ids.contatosDuplicados,
      name: "Contatos Duplicados - Michelli",
    },
    {
      key: "leadsParadosEtapasDra",
      id: ids.leadsParadosEtapasDra,
      name: 'Leads parados nas etapas "em atendimento" e "tem interesse" por mais de 24h',
    },
    {
      key: "tarefasVencidasDra",
      id: ids.tarefasVencidasDra,
      name: "Leads com tarefas vencidas",
    },
    {
      key: "consultaRealizadaDra",
      id: ids.consultaRealizadaDra,
      name: 'Número de leads em "Consulta Realizada"',
    },
    {
      key: "pctVendaConsultaDra",
      id: ids.pctVendaConsultaDra,
      name: "% de venda de consulta",
    },
    {
      key: "totalLeadsParadosDra",
      id: ids.totalLeadsParadosDra,
      name: "Total de Leads parados (> 24h em Atendimento/Tem Interesse)",
    },
  ];

  const results = await Promise.all(
    cardList.map(async (c) => {
      const cardInfo = await fetchMetabaseCardInfo(c.id);
      const params = buildCardParameters(
        cardInfo,
        periodValue,
        selectedPeriod,
        customRange,
      );

      let res = await queryMetabaseCard(c.id, params);
      if ((!res || res.error) && params.length > 0) {
        // Fallback without parameters if query fails with parameters
        res = await queryMetabaseCard(c.id, []);
      }

      if (!res || res.error) {
        return {
          cardId: c.id,
          cardName: c.name,
          loading: false,
          error: res?.error || `Falha ao executar Card #${c.id}`,
          columns: [],
          rows: [],
        };
      }

      const { columns, rows } = parseMetabaseData(res);

      return {
        cardId: c.id,
        cardName: c.name,
        loading: false,
        columns,
        rows,
        rawResponse: res,
      };
    }),
  );

  const data: AllMetabaseData = {
    respostasForaCrm: results[0],
    pctLeadsValor: results[1],
    leadsOrfaos: results[2],
    cicloVendasDias: results[3],
    tempoMedioParado: results[4],
    performanceUsuario: results[5],
    respostasForaCrmPeriodo: results[6],
    leadVelocity: results[7],
    dataQualityVendedor: results[8],
    etapaLeadsParados: results[9],
    detalhamentoEventos: results[10],
    produtosPreenchidos: results[11],
    inatividadeVendedor: results[12],
    pctLossReasonId: results[13],
    pctClosestTaskAt: results[14],
    pctLossReason: results[15],
    origemLeads: results[16],
    leadsSemResponsavelFernando: results[17],
    leadsParados24h: results[18],
    tarefasVencidas: results[19],
    perdasMotivoIndefinido: results[20],
    tempoPrimeiraResposta: results[21],
    contatosDuplicados: results[22],
    leadsParadosEtapasDra: results[23],
    tarefasVencidasDra: results[24],
    consultaRealizadaDra: results[25],
    pctVendaConsultaDra: results[26],
    totalLeadsParadosDra: results[27],
  };

  const fetchedTimestamp = new Date();
  metabaseDataCache.set(cacheKey, { data, timestamp: fetchedTimestamp });

  return {
    data,
    timestamp: fetchedTimestamp,
    isFromCache: false,
  };
}

// Helpers to format single metric value
export function extractSingleValue(
  result: MetabaseCardQueryResult,
  fallback: string | number = "0",
): string | number {
  if (result.rows && result.rows.length > 0 && result.rows[0].length > 0) {
    const val = result.rows[0][0];
    if (val !== null && val !== undefined) return val;
  }
  if (result && !result.error && result.rows && result.rows.length === 0) {
    return 0;
  }
  return fallback;
}
