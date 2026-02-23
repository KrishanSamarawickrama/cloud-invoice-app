# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# In production, API calls go to /api (same origin, proxied by Nginx)
ENV VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

# Output stage — just the static files
FROM alpine:3.20 AS output
COPY --from=build /app/dist /dist
