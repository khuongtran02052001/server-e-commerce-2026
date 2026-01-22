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
# deps
FROM node:20-bookworm-slim AS product_deps
WORKDIR /src/service-system
COPY service-system/package*.json ./
RUN npm ci

# builder
FROM node:20-bookworm-slim AS product_builder
WORKDIR /src/service-system
COPY --from=product_deps /src/service-system/node_modules ./node_modules
COPY service-system ./

# generate prisma client (dummy DATABASE_URL to satisfy prisma config during build)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
RUN npx prisma generate --schema prisma/schema.prisma
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

# blog runtime (keep blog files together)
RUN mkdir -p /app/blog
COPY --from=blog_builder /out/blog /app/blog/blog
COPY --from=blog_builder /src/service-blog/openapi /app/blog/openapi

# product runtime
COPY --from=product_builder /src/service-system/node_modules /app/node_modules
COPY --from=product_builder /src/service-system/dist /app/dist
COPY --from=product_builder /src/service-system/generated /app/generated
COPY --from=product_builder /src/service-system/prisma /app/prisma
COPY --from=product_builder /src/service-system/prisma.config.ts /app/prisma.config.ts

# caddy config + entrypoint
COPY Caddyfile.koyeb /etc/caddy/Caddyfile
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV APP_PORT=8080
ENV PRODUCT_PORT=8081

# Koyeb will expose $PORT; caddy binds to it
ENTRYPOINT ["/entrypoint.sh"]
