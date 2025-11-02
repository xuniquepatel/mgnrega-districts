import { Router } from "express";
import { locateDistrict } from "../services/geo.js";

export const geo = Router();
geo.get("/geo/locate", (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: "lat and lon are required" });
  }
  const hit = locateDistrict(lat, lon);
  return res.json(hit ?? { state: null, district: null });
});
