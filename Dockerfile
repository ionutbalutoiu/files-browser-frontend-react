# Stage 1: Build the frontend
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Nginx with config template
FROM nginx:1.29.4

ENV PUBLIC_SERVER_NAME=files.balutoiu.com \
    PUBLIC_LISTEN=80 \
    PUBLIC_FILES_PATH=/storage/files-public/ \
    PUBLIC_FILES_LOCATION=/

ENV INTERNAL_SERVER_NAME=files.internal.balutoiu.com \
    INTERNAL_LISTEN=80 \
    INTERNAL_FILES_PATH=/storage/files/ \
    INTERNAL_FILES_LOCATION=/files/ \
    INTERNAL_API_BASE_PATH=http://127.0.0.1:8080

# Frontend runtime config (injected at container startup)
ENV PUBLIC_BASE_URL=https://files.balutoiu.com

# Copy built frontend from builder stage
COPY --from=builder /app/dist /app/dist

# Copy nginx config template
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copy runtime config injection script
COPY docker/00-inject-config.sh /docker-entrypoint.d/00-inject-config.sh
RUN chmod +x /docker-entrypoint.d/00-inject-config.sh
