#!/usr/bin/env node
/**
 * replace-forms-with-calendly.mjs
 *
 * Idempotent transformer that replaces the FluentForms contact form on every
 * cruzgoldlaw.com page with a Calendly inline-embed widget.
 *
 * What it does per-page:
 *
 *   1. Resolve the page slug from the directory name (e.g.
 *      "immigration-lawyer-houston/index.html" → "immigration-lawyer-houston").
 *
 *   2. Look up the slug → utm_source mapping from
 *      .build-sources/calendly-source-map.json. Falls back to "website".
 *
 *   3. Replace EVERY occurrence of the FluentForms form block with a Calendly
 *      inline embed div. Some pages have 1 form (e.g. /about/), some have 2
 *      (e.g. /, /immigration-lawyer-houston/). All replaced.
 *
 *      The form block is anchored on:
 *          OPEN:  <div class="fluentform ff-default fluentform_wrapper_7
 *          CLOSE: </script>\n            </div>
 *
 *      Followed by an immediate trailing whitespace cleanup.
 *
 *   4. Strip the FluentForms-related stylesheets, the per-form styler block,
 *      the global fluentFormVars script, and the form-handler.js / fluent-
 *      form-submission.js script tags.
 *
 *   5. Inject (in <head>):
 *        - Calendly widget.css link
 *        - Calendly widget.js script (async)
 *        - Local /js/calendly-init.js script (defer)
 *      Idempotent: if any of the three is already present, don't add a duplicate.
 *
 *   6. Write the file back.
 *
 * The transformer is IDEMPOTENT: re-running on a transformed file is a no-op.
 * Detection: if the file contains 'class="calendly-inline-widget"', skip.
 *
 * Usage:
 *   node .build-sources/replace-forms-with-calendly.mjs              # all pages
 *   node .build-sources/replace-forms-with-calendly.mjs about        # one page
 *   node .build-sources/replace-forms-with-calendly.mjs --dry-run    # report only
 *
 * Exit codes:
 *   0 = success (or no-op idempotent)
 *   1 = error (parse failure, missing mapping, write error)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const SOURCE_MAP_PATH = join(__dirname, 'calendly-source-map.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SINGLE_SLUG = args.find((a) => !a.startsWith('--'));

// ─────────────────────────────────────────────────────────────
// Source map resolution
// ─────────────────────────────────────────────────────────────

const sourceMap = JSON.parse(await readFile(SOURCE_MAP_PATH, 'utf8'));
const CALENDLY_BASE_URL = sourceMap._calendly_url;

function resolveUtmSource(slug) {
  if (sourceMap.exact && Object.prototype.hasOwnProperty.call(sourceMap.exact, slug)) {
    return sourceMap.exact[slug];
  }
  for (const pattern of sourceMap.patterns || []) {
    if (slug.includes(pattern.match)) {
      return pattern.value;
    }
  }
  return sourceMap.default || 'website';
}

// ─────────────────────────────────────────────────────────────
// Page discovery
// ─────────────────────────────────────────────────────────────

function discoverPages() {
  const entries = readdirSync(REPO_ROOT, { withFileTypes: true });
  const pages = [];

  // Root index.html — represents the homepage; slug = "" (empty), use default source
  if (existsSync(join(REPO_ROOT, 'index.html'))) {
    pages.push({ slug: '', filePath: join(REPO_ROOT, 'index.html') });
  }

  // Subdirectory index.html files
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

// ─────────────────────────────────────────────────────────────
// Form-block detection + replacement
// ─────────────────────────────────────────────────────────────

/**
 * Replace every FluentForms block in `html` with `replacement`. Returns
 * { html: newHtml, count: numReplaced }.
 *
 * Strategy: find the start anchor matching <div class="fluentform ff-default fluentform_wrapper_N
 * (where N is any digit — pages use form IDs 1, 7, 8, etc.) and scan forward
 * to the close marker "</script>\n            </div>".
 *
 * Matching is greedy-safe because we look for the FIRST close marker after each
 * open marker, and we move forward past each replacement before searching for
 * the next open marker.
 */
function replaceFormBlocks(html, replacement) {
  // Match wrapper ID for any digit, both single and multi-digit.
  // Tolerant of either single or double quotes around the class attribute
  // (older scraped pages use single quotes, newer use double quotes).
  const OPEN_REGEX = /<div class=['"]fluentform ff-default fluentform_wrapper_\d+/g;
  // The form block we're consuming has the structure:
  //   <div class="fluentform_wrapper_N ...">
  //     <form ...>...</form>
  //     <div id="fluentform_N_errors"></div>
  //   </div>             <script type="text/javascript">
  //     window.fluent_form_ff_form_instance_N_M = {...};
  //   </script>
  // The script is a SIBLING of the wrapper div, not a child. Our close marker
  // captures the wrapper's </div> (which sits inline with the script open),
  // PLUS the script content, ending at </script>. We must NOT also consume
  // the trailing </div> that closes the page's parent container.
  //
  // Open is at offset openIdx; we scan forward to:
  //   1. The wrapper-closing </div> followed by whitespace and <script
  //   2. ...then advance through the script tag to its </script>
  const SIBLING_SCRIPT_OPEN_REGEX = /<\/div>\s*<script\b[^>]*>/g;
  const SCRIPT_CLOSE = '</script>';
  let count = 0;
  let result = '';
  let cursor = 0;

  while (cursor < html.length) {
    OPEN_REGEX.lastIndex = cursor;
    const match = OPEN_REGEX.exec(html);
    if (!match) {
      result += html.slice(cursor);
      break;
    }
    const openIdx = match.index;

    // Find the wrapper close + sibling script open
    SIBLING_SCRIPT_OPEN_REGEX.lastIndex = openIdx;
    const scriptOpenMatch = SIBLING_SCRIPT_OPEN_REGEX.exec(html);
    if (!scriptOpenMatch) {
      throw new Error(
        `Found form OPEN at offset ${openIdx} but no matching </div><script> ` +
        `wrapper-close + sibling script. Form block boundary detection failed.`,
      );
    }

    // Find the closing </script>
    const scriptCloseIdx = html.indexOf(SCRIPT_CLOSE, scriptOpenMatch.index + scriptOpenMatch[0].length);
    if (scriptCloseIdx === -1) {
      throw new Error(
        `Found form sibling <script> at offset ${scriptOpenMatch.index} but no closing </script>. ` +
        `Form block boundary detection failed.`,
      );
    }

    const blockEnd = scriptCloseIdx + SCRIPT_CLOSE.length;
    result += html.slice(cursor, openIdx);
    result += replacement;
    cursor = blockEnd;
    count += 1;
  }

  return { html: result, count };
}

// ─────────────────────────────────────────────────────────────
// Stylesheet/script stripping
// ─────────────────────────────────────────────────────────────

const STRIP_PATTERNS = [
  // Stylesheets — tolerant of either single or double quote attributes
  /<link[^>]*id=['"]fluent-form-styles-css['"][^>]*>\s*/g,
  /<link[^>]*id=['"]fluentform-public-default-css['"][^>]*>\s*/g,
  // The fluentFormVars script (full inline script tag)
  /<script[^>]*>\s*var fluentFormVars[\s\S]*?<\/script>\s*/g,
  // Per-form styler <style> block
  /<style id=['"]fluentform_styler_css_[^'"]*['"][\s\S]*?<\/style>\s*/g,
  // Standalone script tags pointing at form-handler.js or fluent-form-submission.js
  /<script[^>]*src=['"]\/js\/fluent-form-submission\.js['"][^>]*><\/script>\s*/g,
  /<script[^>]*src=['"]\/js\/form-handler\.js['"][^>]*><\/script>\s*/g,
  // Inline body-level form button styler (low-value but safe to strip).
  // Matches any fluent_form_N where N is a digit.
  /<style>form\.fluent_form_\d+[\s\S]{0,500}?<\/style>\s*/g,
];

function stripFluentFormAssets(html) {
  let result = html;
  let stripCount = 0;
  for (const pattern of STRIP_PATTERNS) {
    const before = result;
    result = result.replace(pattern, '');
    if (before !== result) stripCount++;
  }
  return { html: result, stripCount };
}

// ─────────────────────────────────────────────────────────────
// Calendly asset injection (head)
// ─────────────────────────────────────────────────────────────

const CALENDLY_HEAD_INJECT = `<link rel="preconnect" href="https://assets.calendly.com">
<link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css">
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
<script src="/js/calendly-init.js" defer></script>
</head>`;

function injectCalendlyHead(html) {
  // If already injected, skip (idempotency)
  if (html.includes('assets.calendly.com/assets/external/widget.js')) {
    return { html, injected: false };
  }
  const newHtml = html.replace(/<\/head>/i, CALENDLY_HEAD_INJECT);
  if (newHtml === html) {
    throw new Error('No </head> found in document — cannot inject Calendly assets.');
  }
  return { html: newHtml, injected: true };
}

// ─────────────────────────────────────────────────────────────
// Replacement HTML (the Calendly embed div)
// ─────────────────────────────────────────────────────────────

function buildReplacementHtml(utmSource) {
  // The widget needs a min-height to render. 700px is Calendly's recommended
  // baseline for inline embeds with date+time picker visible at once.
  const dataSource = utmSource.replace(/"/g, '&quot;');
  return `<div class="calendly-inline-widget" data-source="${dataSource}" style="min-width:320px;height:700px;"></div>`;
}

// ─────────────────────────────────────────────────────────────
// Per-page transformation
// ─────────────────────────────────────────────────────────────

async function transformPage(page) {
  const html = await readFile(page.filePath, 'utf8');

  // Idempotency check — if Calendly embed already present, skip
  if (html.includes('class="calendly-inline-widget"')) {
    return {
      slug: page.slug,
      status: 'skipped',
      reason: 'Already has Calendly embed',
    };
  }

  // No form to replace? Skip. Tolerate either single or double quotes.
  if (!/class=['"]fluentform ff-default fluentform_wrapper_\d+/.test(html)) {
    return {
      slug: page.slug,
      status: 'skipped',
      reason: 'No FluentForms block found',
    };
  }

  const utmSource = resolveUtmSource(page.slug);
  const replacement = buildReplacementHtml(utmSource);

  // 1. Replace form blocks
  let result;
  try {
    result = replaceFormBlocks(html, replacement);
  } catch (err) {
    return {
      slug: page.slug,
      status: 'error',
      reason: err.message,
    };
  }

  if (result.count === 0) {
    return {
      slug: page.slug,
      status: 'skipped',
      reason: 'No form blocks matched (open/close markers diverged)',
    };
  }

  // 2. Strip FluentForms assets
  const stripped = stripFluentFormAssets(result.html);

  // 3. Inject Calendly head assets
  let injected;
  try {
    injected = injectCalendlyHead(stripped.html);
  } catch (err) {
    return {
      slug: page.slug,
      status: 'error',
      reason: err.message,
    };
  }

  if (DRY_RUN) {
    return {
      slug: page.slug,
      status: 'would-write',
      utmSource,
      formsReplaced: result.count,
      assetsStripped: stripped.stripCount,
      headInjected: injected.injected,
    };
  }

  await writeFile(page.filePath, injected.html, 'utf8');

  return {
    slug: page.slug,
    status: 'written',
    utmSource,
    formsReplaced: result.count,
    assetsStripped: stripped.stripCount,
    headInjected: injected.injected,
  };
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`replace-forms-with-calendly.mjs`);
  console.log(`  REPO_ROOT:    ${REPO_ROOT}`);
  console.log(`  CALENDLY_URL: ${CALENDLY_BASE_URL}`);
  console.log(`  DRY_RUN:      ${DRY_RUN}`);
  console.log(`  SINGLE_SLUG:  ${SINGLE_SLUG ?? '(all pages)'}`);
  console.log('');

  let pages = discoverPages();
  if (SINGLE_SLUG) {
    pages = pages.filter((p) => p.slug === SINGLE_SLUG);
    if (pages.length === 0) {
      console.error(`No page found for slug "${SINGLE_SLUG}".`);
      process.exit(1);
    }
  }

  console.log(`Found ${pages.length} page(s) to consider.`);
  console.log('');

  let written = 0;
  let skipped = 0;
  let errored = 0;

  for (const page of pages) {
    const result = await transformPage(page);
    const slugLabel = page.slug || '(home)';

    if (result.status === 'written' || result.status === 'would-write') {
      written++;
      console.log(
        `  [${result.status === 'would-write' ? 'WOULD WRITE' : 'WRITTEN'}] ${slugLabel.padEnd(60)}` +
        ` utm_source=${result.utmSource} forms=${result.formsReplaced} stripped=${result.assetsStripped} headInj=${result.headInjected}`,
      );
    } else if (result.status === 'skipped') {
      skipped++;
      console.log(`  [SKIPPED]            ${slugLabel.padEnd(60)} ${result.reason}`);
    } else if (result.status === 'error') {
      errored++;
      console.log(`  [ERROR]              ${slugLabel.padEnd(60)} ${result.reason}`);
    }
  }

  console.log('');
  console.log(`Summary: written=${written} skipped=${skipped} errored=${errored}`);

  if (errored > 0) {
    process.exit(1);
  }
}

await main();
