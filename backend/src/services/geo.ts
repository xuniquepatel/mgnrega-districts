import fs from "fs";
import * as turf from "@turf/turf";
import { config } from "../config.js";
import { logger } from "../logger.js";

type GFeat = turf.Feature<turf.Polygon | turf.MultiPolygon, any>;
type GFC = turf.FeatureCollection<turf.Polygon | turf.MultiPolygon, any>;

let fc: GFC | null = null;

export function loadGeo() {
  if (fc) return;
  try {
    if (!fs.existsSync(config.geojsonPath)) {
      logger.warn({ path: config.geojsonPath }, "GeoJSON not found");
      return;
    }
    const raw = fs.readFileSync(config.geojsonPath, "utf-8");
    if (!raw.trim()) {
      logger.warn("GeoJSON file is empty");
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed?.type !== "FeatureCollection") throw new Error("invalid geojson");
    fc = parsed as GFC;
    logger.info({ features: fc.features.length }, "GeoJSON loaded");
  } catch (e: any) {
    logger.warn({ err: e?.message }, "GeoJSON load failed; geolocation disabled");
    fc = null;
  }
}

export function listDistrictsFromGeo(state: string): string[] {
  if (!fc) return [];
  const up = state.toUpperCase();
  const out = new Set<string>();
  for (const f of fc.features) {
    const st = (f.properties?.ST_NM || f.properties?.state_name || "")
      .toString()
      .toUpperCase();
    if (st !== up) continue;
    const name =
      (f.properties?.DISTRICT ||
        f.properties?.district ||
        f.properties?.dt_name ||
        f.properties?.District ||
        "")
        .toString()
        .trim();
    if (name) out.add(name);
  }
  return Array.from(out).sort();
}

export function locateDistrict(lat: number, lon: number): { state?: string; district?: string } | null {
  if (!fc) return null;
  const pt = turf.point([lon, lat]);
  for (const f of fc.features as GFeat[]) {
    try {
      if (turf.booleanPointInPolygon(pt, f)) {
        const state = (f.properties?.ST_NM || f.properties?.state_name || "").toString();
        const district =
          (f.properties?.DISTRICT ||
            f.properties?.district ||
            f.properties?.dt_name ||
            f.properties?.District ||
            "").toString();
        return { state, district };
      }
    } catch {
    }
  }
  return null;
}
