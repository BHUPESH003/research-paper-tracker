#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Clean any stale build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf packages/shared/dist packages/shared/tsconfig.tsbuildinfo
rm -rf apps/backend/dist apps/backend/tsconfig.tsbuildinfo

# Build shared package
echo "🔨 Building shared package..."
pnpm --filter @shared build

# Build backend
echo "🔨 Building backend..."
pnpm --filter @research-paper-tracker/backend build

echo "✅ Build complete!"
echo ""
echo "To start the server, run:"
echo "  cd apps/backend && node dist/server.js"
echo ""
echo "Or with PM2:"
echo "  pm2 start apps/backend/dist/server.js --name api"
