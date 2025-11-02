import { ingestAll } from "./services/etl.js";

ingestAll()
  .then(n => { console.log(`Ingested ${n} rows`); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
