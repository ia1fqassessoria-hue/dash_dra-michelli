import { MetabaseCard, MetabaseCardQueryResponse, MetabaseConnectionStatus, CardMapping, PeriodFilter, DateRange } from '../types';

export const DEFAULT_MAPPING_KEY = 'metabase_card_mappings_v1';

const cardInfoCache = new Map<number, any>();

export async function fetchMetabaseCardInfo(cardId: number): Promise<any | null> {
  if (cardInfoCache.has(cardId)) {
    return cardInfoCache.get(cardId);
  }
  try {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${basePath}/api/metabase/card/${cardId}`);
    if (!res.ok) return null;
    const data = await res.json();
    cardInfoCache.set(cardId, data);
    return data;
  } catch {
    return null;
  }
}

export function getPeriodValue(period: PeriodFilter, customRange?: DateRange): string {
  switch (period) {
    case 'today':
      return 'today';
    case '7days':
      return 'past7days';
    case '30days':
      return 'past30days';
    case '90days':
      return 'past90days';
    case 'this_month':
      return 'thismonth';
    case 'last_month':
      return 'lastmonth';
    case 'custom':
      if (customRange?.startDate && customRange?.endDate) {
        return `${customRange.startDate}~${customRange.endDate}`;
      }
      return 'past30days';
    default:
      return 'past30days';
  }
}

export function getDateStringsForPeriod(period: PeriodFilter, customRange?: DateRange): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  switch (period) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr };
    case '7days': {
      const d = new Date(now.getTime() - 7 * 86400000);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
    case '30days': {
      const d = new Date(now.getTime() - 30 * 86400000);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
    case '90days': {
      const d = new Date(now.getTime() - 90 * 86400000);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: firstDay.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'last_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] };
    }
    case 'custom': {
      return {
        startDate: customRange?.startDate || todayStr,
        endDate: customRange?.endDate || todayStr,
      };
    }
    default: {
      const d = new Date(now.getTime() - 30 * 86400000);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
  }
}

export function buildCardParameters(
  cardInfo: any,
  periodValue: string,
  period?: PeriodFilter,
  customRange?: DateRange
): any[] {
  if (!cardInfo) return [];

  const parameters: any[] = [];
  const processedTagNames = new Set<string>();
  const dateStrings = period ? getDateStringsForPeriod(period, customRange) : null;

  // 1. Process explicit parameters defined on cardInfo.parameters
  if (Array.isArray(cardInfo?.parameters)) {
    for (const param of cardInfo.parameters) {
      if (param && param.target) {
        let val = periodValue;
        const nameOrSlug = String(param.name || param.slug || '').toLowerCase();
        
        if (dateStrings) {
          if (/inicio|start|from|de\b/i.test(nameOrSlug)) {
            val = dateStrings.startDate;
          } else if (/fim|end|to|ate\b/i.test(nameOrSlug)) {
            val = dateStrings.endDate;
          }
        }

        parameters.push({
          type: param.type || 'date/all-options',
          target: param.target,
          value: val,
          ...(param.id ? { id: param.id } : {}),
          ...(param.slug ? { slug: param.slug } : {}),
        });

        if (Array.isArray(param.target) && Array.isArray(param.target[1]) && param.target[1][0] === 'template-tag') {
          processedTagNames.add(param.target[1][1]);
        }
      }
    }
  }

  // 2. Process dataset_query template-tags
  const stages = cardInfo?.dataset_query?.stages || [];
  const nativeTags = cardInfo?.dataset_query?.native?.["template-tags"] || {};
  let templateTags: Record<string, any> = {};
  if (Array.isArray(stages) && stages[0]?.["template-tags"]) {
    templateTags = stages[0]["template-tags"];
  } else {
    templateTags = nativeTags;
  }

  const tagList = Array.isArray(templateTags) ? templateTags : Object.values(templateTags);

  for (const tag of tagList) {
    if (!tag || !tag.name || processedTagNames.has(tag.name)) continue;

    const tagNameLower = String(tag.name).toLowerCase();
    const widgetType = String(tag['widget-type'] || '').toLowerCase();
    const tagType = String(tag.type || '').toLowerCase();

    // Check if this tag is date-related
    const isDateTag =
      widgetType.startsWith('date') ||
      tagType === 'date' ||
      /data|date|periodo|time|dia|created|inicio|fim|range/i.test(tagNameLower);

    if (isDateTag) {
      let val: any = periodValue;

      if (dateStrings) {
        if (/inicio|start|from|de\b/i.test(tagNameLower)) {
          val = dateStrings.startDate;
        } else if (/fim|end|to|ate\b/i.test(tagNameLower)) {
          val = dateStrings.endDate;
        }
      }

      const targetType = tagType === 'dimension' ? 'dimension' : 'variable';

      parameters.push({
        type: widgetType || (tagType === 'dimension' ? 'date/all-options' : 'date/single'),
        target: [targetType, ['template-tag', tag.name]],
        value: val,
      });
      processedTagNames.add(tag.name);
    }
  }

  return parameters;
}

export async function checkMetabaseStatus(): Promise<MetabaseConnectionStatus> {
  try {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${basePath}/api/metabase/status`);
    if (!res.ok) {
      return {
        connected: false,
        baseUrl: 'https://metabase.grupofq.com',
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      baseUrl: 'https://metabase.grupofq.com',
      error: err.message || 'Falha ao conectar  API do backend/Metabase',
    };
  }
}

export async function fetchMetabaseCards(): Promise<MetabaseCard[]> {
  try {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${basePath}/api/metabase/cards`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function queryMetabaseCard(cardId: number, parameters: any[] = []): Promise<MetabaseCardQueryResponse | null> {
  try {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const res = await fetch(`${basePath}/api/metabase/card/${cardId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters }),
    });
    if (!res.ok) {
      return { error: `Erro ao executar Card #${cardId} (${res.status})` };
    }
    return await res.json();
  } catch (err: any) {
    return { error: err.message || 'Erro de rede ao consultar Card' };
  }
}

export function loadStoredMappings(): CardMapping {
  try {
    const stored = localStorage.getItem(DEFAULT_MAPPING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading card mappings', e);
  }
  return {};
}

export function saveStoredMappings(mappings: CardMapping): void {
  try {
    localStorage.setItem(DEFAULT_MAPPING_KEY, JSON.stringify(mappings));
  } catch (e) {
    console.error('Error saving card mappings', e);
  }
}

// Utility to extract table rows and column headers from Metabase card response
export function parseMetabaseData(response?: MetabaseCardQueryResponse | null) {
  if (!response || !response.data || !response.data.rows) {
    return { columns: [], rows: [] };
  }

  const columns = response.data.cols?.map(c => c.display_name || c.name) || [];
  const rows = response.data.rows || [];

  return { columns, rows };
}

function parseFlexibleDate(rawStr: any): Date | null {
  if (!rawStr) return null;
  if (rawStr instanceof Date) return isNaN(rawStr.getTime()) ? null : rawStr;

  const str = String(rawStr).trim();

  // Try standard JS Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Handle Portuguese text dates like "1 fev, 2026", "15 jul 2026", "8 ago, 2026"
  const ptMatch = str.match(/^(\d{1,2})\s+([a-zA-Zçáéíóúâêôãõ]+),?\s*(\d{2,4})$/i);
  if (ptMatch) {
    const day = parseInt(ptMatch[1], 10);
    const monthStr = ptMatch[2].toLowerCase().slice(0, 3);
    let year = parseInt(ptMatch[3], 10);
    if (year < 100) year += 2000;

    const monthMap: Record<string, number> = {
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
      jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11
    };

    if (monthMap[monthStr] !== undefined) {
      return new Date(year, monthMap[monthStr], day);
    }
  }

  return null;
}

export function filterRowsByPeriod(
  columns: string[],
  rows: any[][],
  period: PeriodFilter,
  customRange?: DateRange
): any[][] {
  if (!rows || rows.length === 0 || !columns || columns.length === 0) {
    return rows;
  }

  // Find date column index
  const dateColIdx = columns.findIndex((col) => {
    const colLower = String(col || '').toLowerCase();
    return /data|date|criacao|created|dia|evento|time|timestamp|periodo/.test(colLower);
  });

  if (dateColIdx === -1) {
    return rows;
  }

  // Calculate start and end bounds
  const { startDate, endDate } = getDateStringsForPeriod(period, customRange);
  const startMs = new Date(`${startDate}T00:00:00`).getTime();
  const endMs = new Date(`${endDate}T23:59:59.999`).getTime();

  if (isNaN(startMs) || isNaN(endMs)) {
    return rows;
  }

  return rows.filter((row) => {
    const rawVal = row[dateColIdx];
    const parsedDate = parseFlexibleDate(rawVal);
    if (!parsedDate) {
      return true; // Keep row if date can't be parsed
    }
    const time = parsedDate.getTime();
    return time >= startMs && time <= endMs;
  });
}
