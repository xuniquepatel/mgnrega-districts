import { ingestAll } from './services/etl.js';
ingestAll().then(n => { console.log('ingested', n); process.exit(0); });
