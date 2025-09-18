# --------------------------------------
# Stage 1: build the app
# --------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# install all deps
COPY package*.json ./
RUN npm ci

# copy your source & build
COPY . .
RUN npm run build

# --------------------------------------
# Stage 2: production image
# --------------------------------------
FROM node:22-alpine
WORKDIR /app

# Install system dependencies for health checks
RUN apk add --no-cache curl bash

# let's accept NODE_ENV and PORT as build-time args
ARG NODE_ENV=production
ARG PORT=8000

# set them as container ENV vars
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

# install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# bring in built app
COPY --from=builder /app/dist ./dist

# Set proper ownership
RUN chown -R node:node /app
USER node

EXPOSE $PORT

# Use our startup script
CMD ["npm", "run", "start:prod"]
