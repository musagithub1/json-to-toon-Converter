# frontend/Dockerfile

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then npm -g i pnpm && pnpm i --frozen-lockfile; \
  else npm i; fi

# Copy source
COPY . .

# Set API base for production (proxied via nginx at /api)
# If you use another value, set: ARG VITE_API_BASE and pass --build-arg
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

# Build
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Clean default and copy built app
RUN rm -rf ./*
COPY --from=build /app/dist ./

# Nginx config with /api proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck (basic)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD \
  wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
