FROM node:20-bullseye-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm install
COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/tsconfig.json ./
COPY backend/src ./src

COPY data ./data

RUN npm run build
EXPOSE 8080
CMD ["npm","start"]
