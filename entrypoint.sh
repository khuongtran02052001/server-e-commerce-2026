#!/usr/bin/env sh
set -eu

echo "Start blog :8080"
./blog &

echo "Start product :${PRODUCT_PORT:-8081}"
node dist/main.js &

echo "Start caddy :${PORT}"
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
