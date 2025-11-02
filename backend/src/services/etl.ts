import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { logger } from "../logger.js";
import { config as appCfg } from "../config.js";

const prisma = new PrismaClient();

const DATA_GOV_API_KEY =
  process.env.DATA_GOV_API_KEY || (appCfg as any)?.dataGovApiKey || "";
const OGD_STATE_NAME =
  process.env.OGD_STATE_NAME || (appCfg as any)?.ogdStateName || "Gujarat";
const OGD_RESOURCE_IDS_RAW =
  process.env.OGD_RESOURCE_IDS ||
  (appCfg as any)?.ogdResourceIds?.join(",") ||
  "";
const OGD_RESOURCE_IDS = OGD_RESOURCE_IDS_RAW
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

const PAGE_LIMIT = Number(process.env.OGD_LIMIT || 1000);
const BASE = "https://api.data.gov.in/resource";

// ---- helpers ----
function toInt(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[, ]+/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
}
function toFloat(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[, ]+/g, ""));
  return Number.isFinite(n) ? n : null;
}

const MONTHS = [
  "JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC",
];
function parseMonthName(m?: string | number | null, fy?: string): Date | null {
  if (m == null) return null;

  // numeric (1..12)
  const maybeNum = Number(m);
  if (Number.isFinite(maybeNum) && maybeNum >= 1 && maybeNum <= 12) {
    return monthFromFY(maybeNum, fy);
  }

  // textual
  const up = String(m).trim().slice(0, 3).toUpperCase();
  const idx = MONTHS.indexOf(up);
  if (idx >= 0) return monthFromFY(idx + 1, fy);
  return null;
}

function monthFromFY(month1to12: number, fy?: string): Date {
  const m = Math.max(1, Math.min(12, month1to12));
  const [y1, y2] = normalizeFY(fy);
  const year = m >= 4 ? y1 : y2;
  return new Date(Date.UTC(year, m - 1, 1));
}
function normalizeFY(fy?: string): [number, number] {
  // default to current FY
  if (!fy || !/\d{4}/.test(fy)) {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    if (m >= 4) return [y, y + 1];
    return [y - 1, y];
  }
  const digits = Array.from(String(fy).matchAll(/\d{4}/g)).map((m) => Number(m[0]));
  if (digits.length >= 2) return [digits[0], digits[1]];
  if (digits.length === 1) return [digits[0], digits[0] + 1];
  const y = new Date().getUTCFullYear();
  return [y, y + 1];
}
function firstDayOfCurrentMonth(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(resourceId: string, offset: number) {
  const url = `${BASE}/${resourceId}`;
  const params = {
    "api-key": DATA_GOV_API_KEY,
    format: "json",
    limit: PAGE_LIMIT,
    offset,
    "filters[state_name]": OGD_STATE_NAME,
  };
  const res = await axios.get(url, { params, timeout: 20000 });
  return res.data as {
    records: Record<string, any>[];
    count?: number;
    total?: number;
  };
}

async function fetchAll(resourceId: string): Promise<Record<string, any>[]> {
  let offset = 0;
  const out: Record<string, any>[] = [];
  let pages = 0;

  for (;;) {
    let data: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        data = await fetchPage(resourceId, offset);
        break;
      } catch (e: any) {
        const wait = 1000 * Math.pow(2, attempt);
        logger?.warn?.({ err: e?.message, offset, attempt }, "OGD fetch error, retrying");
        await delay(wait);
      }
    }
    if (!data || !Array.isArray(data.records)) break;

    const page = data.records;
    if (page.length === 0) break;

    for (const r of page) {
      const st = (r.state_name || r.state || "").toString().trim().toUpperCase();
      if (!st || st !== OGD_STATE_NAME.toUpperCase()) continue;
      out.push(r);
    }

    offset += page.length;
    pages++;
    if (page.length < PAGE_LIMIT) break; 
    if (pages > 2000) break; 
  }

  return out;
}

function mapRow(row: Record<string, any>) {
  const district = (row.district_name || row.district || "").toString().trim();
  const state = (row.state_name || row.state || "").toString().trim();
  const fy = (row.financial_year || row.fy || row.fy_name || "").toString().trim();

  const monthDate =
    parseMonthName(row.month || row.month_name, fy) || firstDayOfCurrentMonth();

  const jobcards =
    toInt(row["Total No. of JobCards issued"]) ??
    toInt(row.total_no_of_jobcards_issued) ??
    toInt(row.jobcards_total);

  const workers =
    toInt(row["Total No. of Workers"]) ??
    toInt(row.total_no_of_workers) ??
    toInt(row.workers_total);

  const persondaysTotal =
    toInt(row.persondays_of_central_liability_so_far) ??
    toInt(row.persondays) ??
    toInt(row.persondays_total);

  const householdsWorked =
    toInt(row.total_households_worked) ?? toInt(row.households_worked);

  const avgDaysPerHH = toFloat(
    row.average_days_of_employment_provided_per_household
  );

  const womenPersondaysShare =
    toFloat(row.women_persondays_share) ?? toFloat(row.women_persondays_pct);

  const totalExpLakhs =
    toFloat(row["total_exp_rs__in_lakhs__"]) ??
    toFloat(row.total_expenditure_lakhs);

  const wagesLakhs = toFloat(row["wages_rs__in_lakhs_"]);
  const materialLakhs = toFloat(
    row["material_and_skilled_wages_rs__in_lakhs_"]
  );
  const adminExpLakhs =
    toFloat(row["total_adm_expenditure__rs__in_lakhs__"]) ??
    toFloat(row.admin_exp_lakhs);

  return {
    state,
    district,
    fy: fy || "unknown",
    month: monthDate,

    persondaysTotal,
    householdsWorked,
    avgDaysPerHH,
    womenPersondaysShare,
    totalExpLakhs,
    wagesLakhs,
    materialLakhs,
    adminExpLakhs,

    jobcardsTotal: jobcards,
    workersTotal: workers,
  };
}

async function upsertMetric(m: ReturnType<typeof mapRow>) {
  return prisma.metric.upsert({
    where: {
      state_district_fy_month: {
        state: m.state,
        district: m.district,
        fy: m.fy,
        month: m.month,
      } as any,
    },
    update: {
      persondaysTotal: m.persondaysTotal ?? undefined,
      householdsWorked: m.householdsWorked ?? undefined,
      avgDaysPerHH: m.avgDaysPerHH ?? undefined,
      womenPersondaysShare: m.womenPersondaysShare ?? undefined,
      totalExpLakhs: m.totalExpLakhs ?? undefined,
      wagesLakhs: m.wagesLakhs ?? undefined,
      materialLakhs: m.materialLakhs ?? undefined,
      adminExpLakhs: m.adminExpLakhs ?? undefined,
      jobcardsTotal: m.jobcardsTotal ?? undefined,
      workersTotal: m.workersTotal ?? undefined,
    },
    create: {
      state: m.state,
      district: m.district,
      fy: m.fy,
      month: m.month,
      persondaysTotal: m.persondaysTotal ?? undefined,
      householdsWorked: m.householdsWorked ?? undefined,
      avgDaysPerHH: m.avgDaysPerHH ?? undefined,
      womenPersondaysShare: m.womenPersondaysShare ?? undefined,
      totalExpLakhs: m.totalExpLakhs ?? undefined,
      wagesLakhs: m.wagesLakhs ?? undefined,
      materialLakhs: m.materialLakhs ?? undefined,
      adminExpLakhs: m.adminExpLakhs ?? undefined,
      jobcardsTotal: m.jobcardsTotal ?? undefined,
      workersTotal: m.workersTotal ?? undefined,
    },
  });
}

export async function ingestAll(): Promise<number> {
  if (!DATA_GOV_API_KEY) {
    logger?.error?.("DATA_GOV_API_KEY missing");
    return 0;
  }
  if (OGD_RESOURCE_IDS.length === 0) {
    logger?.error?.("OGD_RESOURCE_IDS missing");
    return 0;
  }

  let total = 0;
  for (const rid of OGD_RESOURCE_IDS) {
    logger?.info?.({ rid }, "OGD ingest: start");
    const rows = await fetchAll(rid);
    logger?.info?.({ rid, rows: rows.length }, "OGD ingest: fetched");

    for (const r of rows) {
      const m = mapRow(r);
      if (!m.district || !m.state) continue;
      try {
        await upsertMetric(m);
        total++;
      } catch (e: any) {
        logger?.warn?.({ err: e?.message, district: m.district }, "upsert failed");
      }
    }
    logger?.info?.({ rid, total }, "OGD ingest: done");
  }
  return total;
}

// Export for testing if needed
export { fetchAll as fetchOGDAll, mapRow as mapOGDRow };
