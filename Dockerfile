# Build stage
FROM node:22.23.4-alpine AS builder

# Use alpine-based image and install only necessary dependencies
RUN apk add --no-cache openssl

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# prisma.config.ts requires DATABASE_URL to be defined, but `prisma generate`
# never connects. A placeholder is used so no real credentials are needed at
# build time.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}

# Copy only necessary files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc prisma.config.ts ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile \
  && pnpm prisma:generate \
  && pnpm store prune

# Copy source files and build (.dockerignore keeps .env and host artifacts out)
COPY . .
RUN pnpm run build

# Migration tooling stage: installs only the Prisma CLI (pinned to the
# project's version) so `prisma migrate deploy` can run in the final image
FROM node:22.23.4-alpine AS migrator

RUN apk add --no-cache openssl

WORKDIR /migrator

COPY package.json /tmp/package.json

RUN PRISMA_VERSION=$(node -p "require('/tmp/package.json').devDependencies.prisma") \
  && DOTENV_VERSION=$(node -p "require('/tmp/package.json').dependencies.dotenv") \
  && echo '{"private":true}' > package.json \
  && npm install --no-audit --no-fund --omit=dev \
    "prisma@${PRISMA_VERSION}" "dotenv@${DOTENV_VERSION}" \
  && npm cache clean --force

# Production stage
FROM node:22.23.4-alpine

LABEL maintainer="FAIR Data Innovations Hub <contact@fairdataihub.org>" \
  description="This is a Nuxt starter template for the FAIR Data Innovations Hub."

# Busybox is used netcat for waiting for Postgres to be ready
RUN apk add --no-cache openssl busybox-extras

ENV NODE_ENV=production

WORKDIR /app

# Nuxt server output (server/, public/, nitro.json)
COPY --from=builder --chown=node:node /app/.output ./
# Prisma CLI for running migrations at startup
COPY --from=migrator --chown=node:node /migrator/node_modules ./node_modules
# Prisma schema, migrations and config so `prisma migrate deploy` can find them
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/prisma.config.ts ./prisma.config.ts

# Copy our startup script and make it executable
COPY --chown=node:node --chmod=755 scripts/start.sh /app/scripts/start.sh

USER node

EXPOSE 3000

# Run startup script that runs migrations before starting the app
CMD ["/app/scripts/start.sh"]
