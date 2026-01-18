#!/usr/bin/env sh
set -eu

echo "ENV: PORT=${PORT:-} SERVICE_BLOG_ENV=${SERVICE_BLOG_ENV:-} PRODUCT_PORT=${PRODUCT_PORT:-} APP_ENV=${APP_ENV:-}"

SERVICE_BLOG_ENV="${SERVICE_BLOG_ENV:-8080}"
PRODUCT_PORT="${PRODUCT_PORT:-8081}"

echo "Start blog :${SERVICE_BLOG_ENV}"
/app/blog &
BLOG_PID=$!

echo "Start product :${PRODUCT_PORT}"
PRODUCT_PORT="${PRODUCT_PORT}" node /app/dist/main.js &
PROD_PID=$!

# Đợi 1 chút rồi check tiến trình còn sống không
sleep 1
if ! kill -0 "$BLOG_PID" 2>/dev/null; then
  echo "Blog process exited! (PID $BLOG_PID)"
  exit 1
fi
if ! kill -0 "$PROD_PID" 2>/dev/null; then
  echo "Product process exited! (PID $PROD_PID)"
  exit 1
fi

echo "Start caddy :${PORT}"
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
