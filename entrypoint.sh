#!/usr/bin/env sh
set -eu

export APP_PORT="${APP_PORT:-8080}"
export PRODUCT_PORT="${PRODUCT_PORT:-8081}"

echo "Start blog :$APP_PORT"
APP_PORT="$APP_PORT" /app/blog &

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "Start product :$PRODUCT_PORT"
DATABASE_URL="$DATABASE_URL" PRODUCT_PORT="$PRODUCT_PORT" node /app/dist/main.js &

echo "Start caddy :${PORT}"
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
