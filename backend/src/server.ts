import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { config } from "./config.js";
import { logger } from "./logger.js";
import { health } from "./routes/health.js";
import { districts } from "./routes/districts.js";
import { metrics } from "./routes/metrics.js";
import { geo } from "./routes/geo.js";
import { startScheduler } from "./workers/scheduler.js";
import { loadGeo } from "./services/geo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATIC_DIR = path.resolve(__dirname, "../static"); 

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  app.use("/api", health);
  app.use("/api", districts);
  app.use("/api", metrics);
  app.use("/api", geo);

  app.use(express.static(STATIC_DIR));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(STATIC_DIR, "index.html"));
  });

  return app;
}

export async function start() {
  try { loadGeo(); } catch (e:any) { logger.warn({err:e?.message}, "GeoJSON load skipped"); }
  const app = createApp();
  app.listen(config.port, () => logger.info(`API listening on :${config.port}`));
  startScheduler();
}
