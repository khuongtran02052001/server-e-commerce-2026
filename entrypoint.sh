#!/usr/bin/env sh
set -eu

echo "ENV: PORT=${PORT:-} APP_ENV=${APP_ENV:-} NODE_ENV=${NODE_ENV:-}"
echo "ENV: BLOG_PORT=${BLOG_PORT:-} PRODUCT_PORT=${PRODUCT_PORT:-}"

BLOG_PORT="${BLOG_PORT:-8080}"
PRODUCT_PORT="${PRODUCT_PORT:-8081}"

echo "Start blog :${BLOG_PORT}"
(
  cd /app/blog
  BLOG_PORT="${BLOG_PORT}" ./blog &
  echo $! > /tmp/blog.pid
)
BLOG_PID="$(cat /tmp/blog.pid)"

echo "Start product :${PRODUCT_PORT}"
PORT="${PRODUCT_PORT}" node /app/dist/main.js &
PROD_PID=$!

sleep 1
kill -0 "$BLOG_PID" 2>/dev/null || { echo "Blog process exited!"; exit 1; }
kill -0 "$PROD_PID" 2>/dev/null || { echo "Product process exited!"; exit 1; }

echo "Start caddy :${PORT:-8000}"
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
