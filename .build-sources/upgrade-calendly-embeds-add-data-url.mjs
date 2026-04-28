#!/usr/bin/env node
/**
 * upgrade-calendly-embeds-add-data-url.mjs
 *
 * One-shot upgrader. Adds `data-url="<full Calendly URL with utm_source>"` to
 * every existing `.calendly-inline-widget` div across the repo, switching the
 * pages from the broken programmatic-init pattern to Calendly's canonical
 * auto-init pattern. See replace-forms-with-calendly.mjs (buildReplacementHtml)
 * for the rationale.
 *
 * Idempotent: if a div already has `data-url`, it's left alone.
 *
 * The transformer reads `data-source="<value>"` from each embed div and uses
 * that as the `utm_source` query param in the constructed Calendly URL. This
 * preserves the per-page attribution that PR-1 (CRM mapping) depends on.
 *
 * Usage:
 *   node .build-sources/upgrade-calendly-embeds-add-data-url.mjs              # all pages
 *   node .build-sources/upgrade-calendly-embeds-add-data-url.mjs --dry-run    # report only
 *
 * Exit codes:
 *   0 = success (or no-op idempotent)
 *   1 = error
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const SOURCE_MAP_PATH = join(__dirname, 'calendly-source-map.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

const sourceMap = JSON.parse(await readFile(SOURCE_MAP_PATH, 'utf8'));
const CALENDLY_BASE_URL = sourceMap._calendly_url;

function discoverPages() {
  const entries = readdirSync(REPO_ROOT, { withFileTypes: true });
  const pages = [];
  if (existsSync(join(REPO_ROOT, 'index.html'))) {
    pages.push({ slug: '', filePath: join(REPO_ROOT, 'index.html') });
  }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name.startsWith('.') || ent.name.startsWith('_')) continue;
    if (['css', 'js', 'images', 'fonts', 'videos', 'node_modules'].includes(ent.name)) continue;
    const indexPath = join(REPO_ROOT, ent.name, 'index.html');
    if (existsSync(indexPath)) {
      pages.push({ slug: ent.name, filePath: indexPath });
    }
  }
  return pages;
}

/**
 * For each `<div class="calendly-inline-widget" ...>` lacking a `data-url`
 * attribute, inject one constructed from the div's `data-source` value.
 *
 * Anchors:
 *   open: class="calendly-inline-widget"
 *   close: > (the end of the opening tag)
 *
 * The match scans the entire opening tag. If `data-url=` already appears
 * inside, no-op. Otherwise we read `data-source="..."` (defaulting to
 * "website") and build the canonical URL.
 *
 * We do NOT use a single regex with lookbehind — Node's regex engine supports
 * it but it's brittle here because attribute order varies. Manual scan is
 * clearer and easier to reason about.
 */
function upgradeEmbedDivs(html) {
  const OPEN_REGEX = /<div\s+class="calendly-inline-widget"/g;
  let result = '';
  let cursor = 0;
  let upgraded = 0;
  let alreadyHadDataUrl = 0;

  while (cursor < html.length) {
    OPEN_REGEX.lastIndex = cursor;
    const match = OPEN_REGEX.exec(html);
    if (!match) {
      result += html.slice(cursor);
      break;
    }

    const tagStart = match.index;
    const tagEnd = html.indexOf('>', tagStart);
    if (tagEnd === -1) {
      throw new Error(`Found embed div opening at ${tagStart} but no closing '>'`);
    }
    const openingTag = html.slice(tagStart, tagEnd + 1);

    if (openingTag.includes('data-url=')) {
      // Already upgraded — skip
      result += html.slice(cursor, tagEnd + 1);
      cursor = tagEnd + 1;
      alreadyHadDataUrl += 1;
      continue;
    }

    // Extract data-source value (default to "website" if missing)
    const sourceMatch = openingTag.match(/data-source="([^"]+)"/);
    const utmSource = sourceMatch ? sourceMatch[1] : 'website';
    const calendlyUrl = `${CALENDLY_BASE_URL}?utm_source=${encodeURIComponent(utmSource)}`;
    const dataUrlAttr = ` data-url="${calendlyUrl.replace(/"/g, '&quot;')}"`;

    // Inject `data-url="..."` immediately after `class="calendly-inline-widget"`.
    // Position: after the closing quote of the class attribute, before the next space.
    const classAttrEnd = tagStart + match[0].length; // points just past the closing " of class
    result += html.slice(cursor, classAttrEnd);
    result += dataUrlAttr;
    result += html.slice(classAttrEnd, tagEnd + 1);
    cursor = tagEnd + 1;
    upgraded += 1;
  }

  return { html: result, upgraded, alreadyHadDataUrl };
}

async function main() {
  console.log('upgrade-calendly-embeds-add-data-url.mjs');
  console.log(`  REPO_ROOT:    ${REPO_ROOT}`);
  console.log(`  CALENDLY_URL: ${CALENDLY_BASE_URL}`);
  console.log(`  DRY_RUN:      ${DRY_RUN}`);
  console.log('');

  const pages = discoverPages();
  console.log(`Found ${pages.length} page(s) to inspect.`);
  console.log('');

  let written = 0;
  let untouched = 0;
  let totalUpgraded = 0;
  let totalAlreadyHad = 0;

  for (const page of pages) {
    const html = await readFile(page.filePath, 'utf8');
    const result = upgradeEmbedDivs(html);
    const slugLabel = page.slug || '(home)';

    if (result.upgraded === 0) {
      untouched += 1;
      const reason = result.alreadyHadDataUrl > 0
        ? `${result.alreadyHadDataUrl} embed(s) already have data-url`
        : 'No calendly-inline-widget divs found';
      console.log(`  [SKIP]  ${slugLabel.padEnd(60)} ${reason}`);
      totalAlreadyHad += result.alreadyHadDataUrl;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [WOULD] ${slugLabel.padEnd(60)} upgraded=${result.upgraded} already=${result.alreadyHadDataUrl}`);
    } else {
      await writeFile(page.filePath, result.html, 'utf8');
      console.log(`  [WRITE] ${slugLabel.padEnd(60)} upgraded=${result.upgraded} already=${result.alreadyHadDataUrl}`);
    }
    written += 1;
    totalUpgraded += result.upgraded;
    totalAlreadyHad += result.alreadyHadDataUrl;
  }

  console.log('');
  console.log(`Summary: pages=${pages.length} pages_with_changes=${written} pages_untouched=${untouched} embeds_upgraded=${totalUpgraded} embeds_already_had=${totalAlreadyHad}`);
}

await main();
