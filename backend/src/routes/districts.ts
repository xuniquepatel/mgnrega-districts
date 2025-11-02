import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { listDistrictsFromGeo } from "../services/geo.js";

const prisma = new PrismaClient();
export const districts = Router();

districts.get("/districts", async (req, res) => {
  const state = String(req.query.state || "").trim();
  if (!state) return res.status(400).json({ error: "state is required" });

  const dbRows = await prisma.metric.findMany({
    where: { state },
    select: { district: true },
    distinct: ["district"],
  });

  const fromDb = dbRows.map(r => r.district).filter(Boolean);
  const fromGeo = listDistrictsFromGeo(state);

  const all = Array.from(new Set([...fromDb, ...fromGeo])).sort();
  return res.json({ state, districts: all });
});
