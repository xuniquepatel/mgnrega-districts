set -e

echo "→ Prisma db push"
npx prisma db push

if [ "$SEED_ON_START" = "true" ]; then
  echo "→ Seeding demo rows"
  node dist/db/seed.js || true
fi

if [ "$INGEST_ON_START" = "true" ]; then
  echo "→ Ingesting from data.gov.in"
  node dist/runIngest.js || true
fi

echo "→ Starting API"
node dist/index.js
