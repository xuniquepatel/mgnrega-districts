import axios from 'axios';
import { logger } from '../logger.js';
import { config } from '../config.js';

export type OGDRow = Record<string, any>;
const BASE = 'https://api.data.gov.in/resource';

export async function fetchResource(resourceId: string, filters: Record<string,string> = {}, limit = 1000): Promise<OGDRow[]> {
  const rows: OGDRow[] = [];
  let offset = 0;
  const paramsBase: any = {
    'api-key': config.apiKey,
    format: 'json',
    limit
  };
  while (true) {
    const params: any = { ...paramsBase, offset };
    for (const [k,v] of Object.entries(filters)) {
      params[`filters[${k}]`] = v;
    }
    try {
      const url = `${BASE}/${resourceId}`;
      const { data } = await axios.get(url, { params, timeout: 20000 });
      const recs: OGDRow[] = data?.records || [];
      rows.push(...recs);
      if (!recs.length || recs.length < limit) break;
      offset += limit;
    } catch (e: any) {
      logger.warn({ e: e?.message, offset }, 'ogd fetch failed — backing off');
      break;
    }
  }
  return rows;
}