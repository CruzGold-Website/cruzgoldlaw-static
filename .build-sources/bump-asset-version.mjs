#!/usr/bin/env node
/**
 * Give changed CSS/JS files a new ?v= on every page that links them.
 *
 * Browsers and the Cloudflare edge keep /css/* and /js/* for 7 days (_headers). A page has to link a
 * changed file under a new URL, or visitors keep seeing the old copy for up to a week.
 *
 * Usage, from the repo root:
 *   node .build-sources/bump-asset-version.mjs css/custom-overrides.css [js/calendly-init.v2.js ...]
 *
 * Sets ?v=<today as YYYYMMDD> on every link to those files in every HTML page and in the partials in
 * .build-sources/_partials/. If a file already has today's version, the next letter is used
 * (20261003b, 20261003c ...). Prints how many links changed per file. Commit the pages with the file.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const files = process.argv.slice(2).map((f) => f.replace(/^\.?\//, ''));
if (!files.length || files.some((f) => !/^(css|js)\/[^/]+\.(css|js)$/.test(f))) {
  console.error('Usage: node .build-sources/bump-asset-version.mjs css/<file>.css [js/<file>.js ...]');
  process.exit(1);
}
for (const f of files) {
  if (!existsSync(join(root, f))) {
    console.error(`Not found: ${f} (run this from the repo root)`);
    process.exit(1);
  }
}

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.build-sources' && dir === root) {
        const partials = join(p, '_partials');
        if (existsSync(partials)) out.push(...htmlFiles(partials));
        continue;
      }
      out.push(...htmlFiles(p));
    } else if (entry.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

const d = new Date();
const today = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const pages = htmlFiles(root);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const f of files) {
  // href="/css/x.css", href="css/x.css" (partials), with or without ?v=...
  const re = new RegExp(`((?:href|src)=["']/?)${escape(f)}(?:\\?v=([^"']*))?(["'])`, 'g');
  const used = new Set();
  for (const p of pages) {
    for (const m of readFileSync(p, 'utf8').matchAll(re)) if (m[2]) used.add(m[2]);
  }
  // the next version after the highest one used today: 20261003, then 20261003b, 20261003c ...
  const suffixes = ['', ...'bcdefghijklmnopqrstuvwxyz'];
  let highest = -1;
  suffixes.forEach((s, i) => { if (used.has(today + s)) highest = i; });
  if (highest === suffixes.length - 1) {
    console.error(`${f}: 25 versions already used today; edit the links by hand`);
    process.exit(1);
  }
  const version = today + suffixes[highest + 1];
  let links = 0, changedPages = 0;
  for (const p of pages) {
    const before = readFileSync(p, 'utf8');
    let n = 0;
    const after = before.replace(re, (all, start, _v, quote) => { n++; return `${start}${f}?v=${version}${quote}`; });
    if (n) {
      links += n;
      changedPages++;
      writeFileSync(p, after);
    }
  }
  console.log(`${f}: ?v=${version} on ${links} links in ${changedPages} files`);
  if (!links) console.log(`  (no page links ${f})`);
}
