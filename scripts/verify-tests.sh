#!/bin/bash
set -e

echo "🧪 Verifying test infrastructure..."

# Check Vitest
echo "Checking Vitest..."
pnpm test --run src/__tests__/example.test.ts

# Build for E2E
echo "Building for E2E tests..."
pnpm build

# Check Playwright (smoke tests only)
echo "Checking Playwright..."
pnpm test:e2e tests/smoke.spec.ts

echo "✅ All test infrastructure verified!"
