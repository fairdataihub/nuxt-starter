#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

# Extract host and port from postgres://user:pass@host:port/db?params
DB_HOST_PORT=$(echo "$DATABASE_URL" | sed -E 's|^[^:]+://([^@]*@)?([^/?]+).*|\2|')
DB_HOST=$(echo "$DB_HOST_PORT" | cut -d: -f1)
DB_PORT=$(echo "$DB_HOST_PORT" | cut -s -d: -f2)
DB_PORT=${DB_PORT:-5432}

# Wait for Postgres to accept connections
echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
RETRIES=30
until nc -z "$DB_HOST" "$DB_PORT"; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "Postgres did not become ready in time"
    exit 1
  fi
  sleep 2
done

echo "Running database migrations..."
cd /app
./node_modules/.bin/prisma migrate deploy

echo "Starting server..."
exec node /app/server/index.mjs
