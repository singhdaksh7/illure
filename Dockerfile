# Stage 1: Build Frontend Production Artifacts
FROM node:22-alpine AS builder

WORKDIR /app

# Copy lockfiles and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build Vite bundle
COPY . .
RUN npm run build

# Stage 2: High-Performance Production Nginx Runtime
FROM nginx:alpine AS runner

# Remove default nginx static page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output into Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose container HTTP port (Traefik routes to port 80)
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
