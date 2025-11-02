import cron from 'node-cron';
import { ingestAll } from '../services/etl.js';
import { logger } from '../logger.js';

export function startScheduler() {
  cron.schedule('17 */6 * * *', async () => {
    try {
      logger.info('ETL cron started');
      const n = await ingestAll();
      logger.info({ n }, 'ETL cron finished');
    } catch (e: any) {
      logger.error({ e: e?.message }, 'ETL cron failed');
    }
  });
}