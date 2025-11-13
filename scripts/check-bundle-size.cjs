#!/usr/bin/env node

/**
 * Bundle Size Checker
 *
 * Monitors the production bundle size and fails CI if it exceeds budgets.
 * Run after building: yarn build && node scripts/check-bundle-size.js
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

// Performance budgets (in KB)
const BUDGETS = {
  raw: 25, // 25KB raw (currently ~19.8KB after ref consolidation refactor)
  gzip: 8, // 8KB gzipped (currently ~6.4KB after ref consolidation refactor)
};

const BUNDLE_PATH = path.join(__dirname, '../dist/index.js');

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2);
}

function checkBundleSize() {
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error('❌ Bundle not found. Run `yarn build` first.');
    process.exit(1);
  }

  const bundleContent = fs.readFileSync(BUNDLE_PATH);
  const rawSize = bundleContent.length;
  const gzipSize = gzipSync(bundleContent).length;

  const rawKB = rawSize / 1024;
  const gzipKB = gzipSize / 1024;

  console.log('\n📦 Bundle Size Report\n');
  console.log(`Raw:    ${formatBytes(rawSize)} KB / ${BUDGETS.raw} KB budget`);
  console.log(`Gzipped: ${formatBytes(gzipSize)} KB / ${BUDGETS.gzip} KB budget`);

  const rawStatus = rawKB <= BUDGETS.raw ? '✅' : '❌';
  const gzipStatus = gzipKB <= BUDGETS.gzip ? '✅' : '❌';

  console.log(`\nStatus:  ${rawStatus} Raw ${gzipStatus} Gzip\n`);

  // Check if budgets are exceeded
  const failures = [];

  if (rawKB > BUDGETS.raw) {
    const excess = formatBytes((rawKB - BUDGETS.raw) * 1024);
    failures.push(`Raw size exceeds budget by ${excess} KB`);
  }

  if (gzipKB > BUDGETS.gzip) {
    const excess = formatBytes((gzipKB - BUDGETS.gzip) * 1024);
    failures.push(`Gzipped size exceeds budget by ${excess} KB`);
  }

  if (failures.length > 0) {
    console.error('❌ Bundle size check FAILED:\n');
    failures.forEach(f => console.error(`   - ${f}`));
    console.error('\nPlease optimize the bundle or update budgets if justified.\n');
    process.exit(1);
  }

  console.log('✅ Bundle size check PASSED\n');

  // Write results for tracking
  const results = {
    timestamp: new Date().toISOString(),
    raw: { size: rawSize, budget: BUDGETS.raw * 1024 },
    gzip: { size: gzipSize, budget: BUDGETS.gzip * 1024 },
  };

  const reportPath = path.join(__dirname, '../dist/bundle-size.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`📊 Report saved to: ${reportPath}\n`);
}

try {
  checkBundleSize();
} catch (error) {
  console.error('❌ Error checking bundle size:', error.message);
  process.exit(1);
}
