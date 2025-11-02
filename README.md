# MGNREGA District Dashboard - Gujarat

## Development 
1. Install Docker Desktop, Node.js 20, Git, VS Code.
2. Clone repo and create `.env` from `.env.example`. Add your **data.gov.in** API key.
3. `docker compose up -d --build`
4. `docker compose exec backend npx prisma migrate deploy && npm run seed`
5. Access it at: http://localhost:5173

## Fetch Gujarat GeoJSON
- Run `node scripts/fetch-geojson.js` once (or mount `data/gujarat-districts.geojson`).

## ETL config
- Edit `OGD_RESOURCE_IDS` with district+monthly resource UUIDs.
- The ETL runs every 6 hours and on server start (call `ingestAll()` if needed).

## Accessibility
- Language toggle (EN/HI/GU)
- Big numbers with simple captions
- One-line audio summary via browser TTS
- Offline cache of last-viewed district (PWA)
- "Use my location" to auto-detect district
