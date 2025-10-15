#!/bin/sh
set -e

echo "Natural Disasters Monitor - Backend Starting..."
echo ""

ENV_FILE="/app/.env.generated"

if [ ! -f "$ENV_FILE" ]; then
    echo "First initialization - Generating .env with secure secrets..."
    echo ""

    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")

    cat > "$ENV_FILE" << EOF
PORT=3000
NODE_ENV=production

DATABASE_URL=${DATABASE_URL}

JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3001}
EOF

    echo ".env file created with generated secrets!"
    echo "   JWT_SECRET: ${JWT_SECRET:0:30}..."
    echo "   JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:0:30}..."
    echo ""
    echo "Secrets saved in Docker volume - will persist between restarts"
    echo ""
else
    echo "Using existing .env (secrets already generated previously)"
    echo ""
fi

echo "Loading environment variables..."
export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^$' | xargs)

echo "Waiting for PostgreSQL to be ready..."
until node -e "const { Client } = require('pg'); const client = new Client({connectionString: process.env.DATABASE_URL}); client.connect().then(() => client.end()).catch(e => process.exit(1));" 2>/dev/null; do
  echo "   PostgreSQL not ready yet - waiting..."
  sleep 2
done
echo "PostgreSQL ready!"
echo ""

echo "Running Prisma migrations..."
if [ ! -d "/app/prisma/migrations" ]; then
  echo "   Creating initial migration..."
  npx prisma migrate dev --name init --skip-generate
else
  echo "   Applying existing migrations..."
  npx prisma migrate deploy
fi

echo ""
echo "Server starting on port ${PORT}..."
echo "Health check: http://localhost:${PORT}/health"
echo "Auth endpoints: http://localhost:${PORT}/api/auth"
echo ""

exec npm start
