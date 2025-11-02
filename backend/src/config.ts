export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbUrl: process.env.DATABASE_URL as string,
  redisUrl: process.env.REDIS_URL as string,
  apiKey: process.env.DATA_GOV_API_KEY || '',
  resourceIds: (process.env.OGD_RESOURCE_IDS || '').split(',').map(s => s.trim()).filter(Boolean),
  stateName: process.env.OGD_STATE_NAME || 'Gujarat',
  geojsonPath: process.env.GEOJSON_PATH || '/app/data/gujarat-districts.geojson',
  enableFakeSeed: (process.env.ENABLE_FAKE_SEED || 'false') === 'true'
};