#!/usr/bin/env node
/**
 * migrate-to-pages.mjs
 *
 * One-shot migration script: converts the flat-file static site into a
 * Cloudflare Pages-compatible directory structure with trailing-slash URLs
 * matching the existing Google index and sitemap.
 *
 * What it does:
 *   1. Moves each `foo.html` -> `foo/index.html` (except index/404/partials)
 *   2. Rewrites all `href="bar.html"` -> `href="/bar/"` in HTML
 *   3. Rewrites all `href="css/x.css"` (etc) -> `href="/css/x.css"` (root-relative,
 *      so they resolve correctly from any directory depth)
 *   4. Rewrites canonical and og:url tags from "foo.html" -> "https://cruzgoldlaw.com/foo/"
 *   5. Updates sitemap.xml URLs (apex, trailing slash) — already correct, validates
 *
 * Idempotent: safe to re-run. Skips already-migrated pages.
 *
 * Run with: node migrate-to-pages.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PROD_HOST = 'https://cruzgoldlaw.com';

// Files that should NOT be moved into a directory
const KEEP_FLAT = new Set([
  'index.html',   // homepage stays at root
  '404.html',     // Cloudflare Pages convention for not-found
]);

// Asset-bearing path prefixes (when seen as relative refs, prepend `/`)
const ASSET_PREFIXES = ['css', 'js', 'images', 'fonts', 'videos'];

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Discover HTML files at repo root
// ─────────────────────────────────────────────────────────────────────────────

function listHtmlAtRoot() {
  return fs.readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !KEEP_FLAT.has(f))
    .sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Build the URL rewrite map
// Maps every "foo.html" reference -> "/foo/" (root-relative trailing slash)
// "index.html" -> "/" (root)
// ─────────────────────────────────────────────────────────────────────────────

function buildUrlMap(files) {
  const map = new Map();
  // index.html -> /
  map.set('index.html', '/');
  for (const f of files) {
    const slug = f.replace(/\.html$/, '');
    map.set(f, `/${slug}/`);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Rewrite HTML content
// ─────────────────────────────────────────────────────────────────────────────

function rewriteHtml(html, urlMap, currentSlug) {
  let out = html;

  // 3a. Rewrite href="foo.html" / href='foo.html' / src="foo.html" patterns
  //     ONLY when the value is NOT preceded by a slash, http, or other prefix
  //     (i.e. a bare relative ref to a sibling .html file).
  for (const [oldUrl, newUrl] of urlMap) {
    // Match: (href|src)="foo.html" (with optional fragment/query)
    // Capture: attribute name, quote, optional fragment/query
    const re = new RegExp(
      `((?:href|src)\\s*=\\s*["'])${escapeRegex(oldUrl)}((?:[?#][^"']*)?)["']`,
      'g'
    );
    out = out.replace(re, (match, prefix, suffix) => {
      // prefix ends with the opening quote; reproduce the same quote
      const quote = prefix.trim().slice(-1);
      return `${prefix}${newUrl}${suffix}${quote}`;
    });
  }

  // 3b. Rewrite root-relative asset refs: href="css/foo.css" -> href="/css/foo.css"
  //     This makes assets work regardless of directory depth.
  for (const prefix of ASSET_PREFIXES) {
    const re = new RegExp(
      `((?:href|src|srcset|content|data-[\\w-]+)\\s*=\\s*["'])(${prefix}/)`,
      'g'
    );
    out = out.replace(re, '$1/$2');
  }

  // 3b-bonus: srcset can contain multiple URLs separated by commas
  //   srcset="images/a.png 1x, images/b.png 2x"
  // The regex above only catches the first; handle subsequent ones inside srcset.
  out = out.replace(/srcset\s*=\s*"([^"]+)"/g, (match, value) => {
    const fixed = value.replace(
      new RegExp(`(^|,\\s*)(${ASSET_PREFIXES.join('|')})/`, 'g'),
      '$1/$2/'
    );
    return `srcset="${fixed}"`;
  });

  // 3c. Rewrite canonical and og:url to absolute production URL
  //     Currently: <link rel="canonical" href="about.html">
  //     Becomes:   <link rel="canonical" href="https://cruzgoldlaw.com/about/">
  const canonicalUrl = currentSlug === 'index'
    ? `${PROD_HOST}/`
    : `${PROD_HOST}/${currentSlug}/`;

  // canonical
  out = out.replace(
    /(<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["'])[^"']*(["'])/gi,
    `$1${canonicalUrl}$2`
  );
  // og:url
  out = out.replace(
    /(<meta[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["'])[^"']*(["'])/gi,
    `$1${canonicalUrl}$2`
  );
  // twitter:url (some pages have this)
  out = out.replace(
    /(<meta[^>]*name\s*=\s*["']twitter:url["'][^>]*content\s*=\s*["'])[^"']*(["'])/gi,
    `$1${canonicalUrl}$2`
  );

  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Move files into directories
// ─────────────────────────────────────────────────────────────────────────────

function migrateFile(filename, urlMap) {
  const slug = filename.replace(/\.html$/, '');
  const srcPath = path.join(ROOT, filename);
  const dstDir = path.join(ROOT, slug);
  const dstPath = path.join(dstDir, 'index.html');

  if (!fs.existsSync(srcPath)) {
    return { skipped: true, reason: 'source-missing' };
  }

  const html = fs.readFileSync(srcPath, 'utf8');
  const rewritten = rewriteHtml(html, urlMap, slug);

  fs.mkdirSync(dstDir, { recursive: true });
  fs.writeFileSync(dstPath, rewritten, 'utf8');
  fs.unlinkSync(srcPath);

  return { migrated: true, from: filename, to: `${slug}/index.html` };
}

function migrateIndex(urlMap) {
  // index.html stays at root, but its content needs rewriting too
  const filename = 'index.html';
  const srcPath = path.join(ROOT, filename);
  if (!fs.existsSync(srcPath)) return { skipped: true };

  const html = fs.readFileSync(srcPath, 'utf8');
  const rewritten = rewriteHtml(html, urlMap, 'index');
  fs.writeFileSync(srcPath, rewritten, 'utf8');
  return { rewritten: true, file: filename };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5: Validate sitemap.xml (apex + trailing slash already correct)
// ─────────────────────────────────────────────────────────────────────────────

function validateSitemap() {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return { skipped: true };
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const wrongHost = urls.filter((u) => !u.startsWith(PROD_HOST));
  const noTrailing = urls.filter((u) => u !== `${PROD_HOST}/` && !u.endsWith('/'));
  return {
    total: urls.length,
    wrongHost: wrongHost.length,
    missingTrailingSlash: noTrailing.length,
    sample: urls.slice(0, 3),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log('🚀 Cloudflare Pages migration starting...\n');

  const files = listHtmlAtRoot();
  console.log(`Found ${files.length} HTML files to migrate.`);

  const urlMap = buildUrlMap(files);

  // Migrate index.html in place (rewrite content, no move)
  console.log('\n📄 Rewriting index.html in place...');
  const indexResult = migrateIndex(urlMap);
  console.log('  ✓', indexResult);

  // Migrate every other HTML page
  console.log('\n📁 Moving pages into directory structure...');
  let migrated = 0;
  let skipped = 0;
  for (const f of files) {
    const result = migrateFile(f, urlMap);
    if (result.migrated) {
      migrated++;
      console.log(`  ✓ ${result.from} -> ${result.to}`);
    } else {
      skipped++;
      console.log(`  ⊘ ${f}: ${result.reason}`);
    }
  }

  // Validate sitemap
  console.log('\n🗺  Validating sitemap.xml...');
  const sm = validateSitemap();
  console.log('  ', sm);

  console.log(`\n✅ Done. Migrated ${migrated} files, skipped ${skipped}.`);
  console.log('\nNext steps:');
  console.log('  1. Spot-check a few pages: open about/index.html, contact/index.html');
  console.log('  2. Verify all internal links resolve');
  console.log('  3. Add _headers and _redirects files');
  console.log('  4. Commit and deploy to Cloudflare Pages');
}

main();
