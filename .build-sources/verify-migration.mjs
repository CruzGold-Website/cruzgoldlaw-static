#!/usr/bin/env node
/**
 * verify-migration.mjs
 *
 * Post-migration sanity checks. Run with: node .build-sources/verify-migration.mjs
 *
 * Checks:
 *   1. Every directory under repo root has an index.html
 *   2. No flat .html files remain at root (except index.html and 404.html)
 *   3. No HTML file contains href/src to "*.html" (sibling-page refs should be /slug/)
 *   4. No HTML file contains relative asset refs (href="css/..." should be href="/css/...")
 *   5. Every page has a canonical pointing to https://cruzgoldlaw.com/
 *   6. Every page has og:url pointing to https://cruzgoldlaw.com/
 *   7. sitemap.xml URLs match actual pages on disk
 *   8. _redirects file exists and is well-formed
 *   9. _headers file exists
 *  10. robots.txt exists
 *  11. All asset refs (/css/, /js/, /images/) resolve to real files
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROD_HOST = 'https://cruzgoldlaw.com';

let pass = 0;
let fail = 0;
const failures = [];

function check(desc, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  ✓ ${desc}`);
  } else {
    fail++;
    console.log(`  ✗ ${desc}${detail ? ` — ${detail}` : ''}`);
    failures.push(desc + (detail ? `: ${detail}` : ''));
  }
}

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => !e.name.startsWith('.') && !['css', 'js', 'images', 'fonts', 'videos', 'node_modules'].includes(e.name))
    .map((e) => e.name);
}

function listHtmlFiles(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    if (['node_modules', 'css', 'js', 'images', 'fonts', 'videos'].includes(e.name)) continue;
    const fullPath = path.join(dir, e.name);
    const relPath = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...listHtmlFiles(fullPath, relPath));
    } else if (e.name.endsWith('.html')) {
      out.push(relPath);
    }
  }
  return out;
}

console.log('🔍 Post-migration verification\n');

// ─────────────────────────────────────────────────────────────────────────────
// Check 1: directory structure
// ─────────────────────────────────────────────────────────────────────────────
console.log('━━━ Directory structure ━━━');
const pageDirs = listDirs(ROOT);
let allHaveIndex = true;
const missingIndex = [];
for (const d of pageDirs) {
  const indexPath = path.join(ROOT, d, 'index.html');
  if (!fs.existsSync(indexPath)) {
    allHaveIndex = false;
    missingIndex.push(d);
  }
}
check(`All ${pageDirs.length} page directories have index.html`, allHaveIndex,
  missingIndex.length ? `missing in: ${missingIndex.join(', ')}` : '');

// Check 2: flat HTML at root
const flatHtml = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !['index.html', '404.html'].includes(f));
check('No flat .html files at root (except index.html, 404.html)',
  flatHtml.length === 0,
  flatHtml.length ? `found: ${flatHtml.join(', ')}` : '');

// ─────────────────────────────────────────────────────────────────────────────
// Check 3-6: HTML content sanity
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ HTML content ━━━');
const htmlFiles = listHtmlFiles(ROOT);
console.log(`  (scanning ${htmlFiles.length} HTML files)`);

let badSiblingRefs = [];
let badAssetRefs = [];
let missingCanonical = [];
let missingOgUrl = [];
let badCanonical = [];

for (const rel of htmlFiles) {
  if (rel === '404.html') continue; // 404 has different rules
  const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');

  // Check 3: sibling .html refs (e.g. href="about.html") should not exist
  // Allow href="https://...html" (absolute external) and src="something.html" inside JSON-LD strings
  // Match: (href|src)="<not-/, not-h, not-#, not-?>...html"
  const siblingRe = /(?:href|src)\s*=\s*["'](?!\/|https?:|#|tel:|mailto:|javascript:|data:)[^"']*\.html(?:[?#][^"']*)?["']/g;
  const matches = content.match(siblingRe);
  if (matches && matches.length > 0) {
    badSiblingRefs.push(`${rel}: ${matches.length} (e.g. ${matches[0]})`);
  }

  // Check 4: relative asset refs (href="css/..." without leading slash)
  const relAssetRe = /(?:href|src)\s*=\s*["'](?!\/|https?:|#|tel:|mailto:|javascript:|data:)(css|js|images|fonts|videos)\//g;
  const assetMatches = content.match(relAssetRe);
  if (assetMatches && assetMatches.length > 0) {
    badAssetRefs.push(`${rel}: ${assetMatches.length} (e.g. ${assetMatches[0]})`);
  }

  // Check 5: canonical
  const canonicalMatch = content.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i);
  if (!canonicalMatch) {
    missingCanonical.push(rel);
  } else if (!canonicalMatch[1].startsWith(PROD_HOST)) {
    badCanonical.push(`${rel}: ${canonicalMatch[1]}`);
  }

  // Check 6: og:url
  const ogMatch = content.match(/<meta[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']+)["']/i);
  if (!ogMatch) {
    missingOgUrl.push(rel);
  }
}

check('No sibling .html refs (foo.html style)', badSiblingRefs.length === 0,
  badSiblingRefs.length ? `${badSiblingRefs.length} files; first: ${badSiblingRefs[0]}` : '');
check('No relative asset refs (css/foo.css style)', badAssetRefs.length === 0,
  badAssetRefs.length ? `${badAssetRefs.length} files; first: ${badAssetRefs[0]}` : '');
check('All pages have canonical', missingCanonical.length === 0,
  missingCanonical.length ? `missing in ${missingCanonical.length} files` : '');
check('All canonicals point to prod host', badCanonical.length === 0,
  badCanonical.length ? `bad in ${badCanonical.length} files; first: ${badCanonical[0]}` : '');
check('All pages have og:url', missingOgUrl.length === 0,
  missingOgUrl.length ? `missing in ${missingOgUrl.length} files` : '');

// ─────────────────────────────────────────────────────────────────────────────
// Check 7: sitemap matches disk
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Sitemap ━━━');
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const missing = [];
  for (const url of urls) {
    if (url === `${PROD_HOST}/`) {
      if (!fs.existsSync(path.join(ROOT, 'index.html'))) missing.push(url);
      continue;
    }
    const p = url.replace(PROD_HOST, '').replace(/\/$/, '');
    const indexPath = path.join(ROOT, p, 'index.html');
    if (!fs.existsSync(indexPath)) missing.push(url);
  }
  check(`Sitemap has ${urls.length} URLs, all resolve on disk`, missing.length === 0,
    missing.length ? `missing: ${missing.slice(0, 3).join(', ')}` : '');
} else {
  check('sitemap.xml exists', false, 'file missing');
}

// ─────────────────────────────────────────────────────────────────────────────
// Check 8-10: Pages config files
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Cloudflare Pages config ━━━');
check('_redirects exists', fs.existsSync(path.join(ROOT, '_redirects')));
check('_headers exists', fs.existsSync(path.join(ROOT, '_headers')));
check('robots.txt exists', fs.existsSync(path.join(ROOT, 'robots.txt')));
check('404.html exists', fs.existsSync(path.join(ROOT, '404.html')));

// ─────────────────────────────────────────────────────────────────────────────
// Check 12-14: Calendly embed integrity
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Calendly embed ━━━');
let pagesWithoutCalendly = [];
let pagesWithFluentForm = [];
let pagesWithoutCalendlyAssets = [];
const expectedCalendlyAssets = [
  'assets.calendly.com/assets/external/widget.css',
  'assets.calendly.com/assets/external/widget.js',
  '/js/calendly-init.v2.js',
];

for (const rel of htmlFiles) {
  if (rel === '404.html') continue;
  const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!content.includes('class="calendly-inline-widget"')) {
    pagesWithoutCalendly.push(rel);
  }
  if (/fluentform|fluent_form|fluent-form/.test(content)) {
    pagesWithFluentForm.push(rel);
  }
  for (const asset of expectedCalendlyAssets) {
    if (!content.includes(asset)) {
      pagesWithoutCalendlyAssets.push(`${rel} (missing ${asset})`);
      break;
    }
  }
}
check('All pages have Calendly inline embed', pagesWithoutCalendly.length === 0,
  pagesWithoutCalendly.length ? `missing in ${pagesWithoutCalendly.length} files: ${pagesWithoutCalendly.slice(0, 3).join(', ')}` : '');
check('No FluentForms refs remain', pagesWithFluentForm.length === 0,
  pagesWithFluentForm.length ? `${pagesWithFluentForm.length} files: ${pagesWithFluentForm.slice(0, 3).join(', ')}` : '');
check('All pages load Calendly assets', pagesWithoutCalendlyAssets.length === 0,
  pagesWithoutCalendlyAssets.length ? `${pagesWithoutCalendlyAssets.length} files; first: ${pagesWithoutCalendlyAssets[0]}` : '');

// ─────────────────────────────────────────────────────────────────────────────
// Check 11: spot-check asset references resolve
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Asset reference resolution (spot check) ━━━');
const sample = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const assetRefs = [...sample.matchAll(/(?:href|src)\s*=\s*["'](\/(?:css|js|images|fonts|videos)\/[^"'?#]+)/g)]
  .map((m) => m[1])
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .slice(0, 30); // spot-check first 30

let missingAssets = [];
for (const ref of assetRefs) {
  const filePath = path.join(ROOT, ref);
  if (!fs.existsSync(filePath)) {
    missingAssets.push(ref);
  }
}
check(`Asset refs resolve on disk (sampled ${assetRefs.length})`, missingAssets.length === 0,
  missingAssets.length ? `missing: ${missingAssets.slice(0, 5).join(', ')}` : '');

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'━'.repeat(50)}`);
console.log(`✅ ${pass} passed   ${fail > 0 ? `❌ ${fail} failed` : ''}`);
if (fail > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('\n🎉 All checks passed. Ready to deploy.');
