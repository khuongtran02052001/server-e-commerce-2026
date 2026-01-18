#!/usr/bin/env sh
set -eu

echo "Start blog :8080"
APP_PORT="${APP_PORT:-8080}" /app/blog &

echo "Generate prisma client"
: "${DATABASE_URL:?DATABASE_URL is required}"
cd /app
/app/node_modules/.bin/prisma generate --schema /app/prisma/schema.prisma

echo "Start product :8081"
PRODUCT_PORT="${PRODUCT_PORT:-8081}" node /app/dist/main.js &

echo "Start caddy :${PORT}"
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
