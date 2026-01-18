FROM golang:1.23-alpine AS blog_builder
RUN apk add --no-cache git ca-certificates tzdata
WORKDIR /src
COPY service-blog/go.mod service-blog/go.sum ./service-blog/
WORKDIR /src/service-blog
RUN go mod download
COPY service-blog ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/blog ./cmd/server/main.go

# ======================
# PRODUCT build
# ======================
FROM node:20-bookworm-slim AS product_builder
WORKDIR /src
COPY service-product/package*.json ./service-product/
WORKDIR /src/service-product
RUN npm ci
COPY service-product ./

# prisma generate + build
RUN npx prisma generate
RUN npm run build

# ======================
# RUNTIME
# ======================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# install caddy
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL "https://caddyserver.com/api/download?os=linux&arch=amd64" -o /usr/bin/caddy \
  && chmod +x /usr/bin/caddy

# blog binary
COPY --from=blog_builder /out/blog /app/blog

# product runtime
COPY --from=product_builder /src/service-product/node_modules /app/node_modules
COPY --from=product_builder /src/service-product/dist /app/dist
COPY --from=product_builder /src/service-product/generated /app/generated
COPY --from=product_builder /src/service-product/prisma /app/prisma
COPY --from=product_builder /src/service-product/prisma.config.ts /app/prisma.config.ts

# caddy config + entrypoint
COPY Caddyfile.koyeb /etc/caddy/Caddyfile
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV APP_PORT=8080
ENV PRODUCT_PORT=8081

# Koyeb will expose $PORT; caddy binds to it
ENTRYPOINT ["/entrypoint.sh"]
