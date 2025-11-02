# MGNREGA District Dashboard - Gujarat

## Development 
1. Install Docker Desktop, Node.js 20, Git, VS Code.
2. Clone repo and create `.env` from `.env.example`. Add your **data.gov.in** API key.
3. `docker compose up -d --build`
4. In another terminal: `docker compose exec backend npx prisma migrate deploy && npm run seed`
5. Open http://localhost:5173

## Fetch Gujarat GeoJSON
- Run `node scripts/fetch-geojson.js` once (or mount `data/gujarat-districts.geojson`).

## ETL config
- Edit `OGD_RESOURCE_IDS` with district+monthly resource UUIDs.
- The ETL runs every 6 hours and on server start (call `ingestAll()` if needed).

## Production on Ubuntu VPS
- Install Docker + Compose plugin
- Copy project, set `.env` (strong passwords), open ports 80/443, run `docker compose up -d --build`
- Put a reverse proxy (Caddy or Nginx) if using a domain and TLS.

## Accessibility & Low-literacy UX
- Language toggle (EN/HI/GU)
- Big numbers with simple captions
- One-line audio summary via browser TTS
- Offline cache of last-viewed district (PWA)
- "Use my location" to auto-detect district
- Comparatives: District vs State Average, trend lines for the last months

## Notes
- If OGD API is down, frontend still shows cached DB data and PWA cache.
- API has rate limits; backend batches requests and caches responses in Redis.
  
```

