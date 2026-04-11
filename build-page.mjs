/**
 * build-page.mjs — Assembles a complete HTML page from partials + a content file.
 *
 * Usage:
 *   node build-page.mjs _content/my-new-page.html
 *
 * The content file must start with a metadata comment block:
 *
 *   <!--
 *   TITLE: Page Title | Cruz Gold & Associates
 *   DESCRIPTION: Meta description (under 160 chars)
 *   CANONICAL: my-new-page.html
 *   CSS: css/gb-my-new-page.css
 *   -->
 *
 * CSS is optional — omit or leave blank if the page uses only global styles.
 *
 * Output is written to the repo root as <filename>.html
 * (e.g. _content/new-blog-post.html  →  new-blog-post.html)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));  // repo root
const PARTIALS = join(ROOT, '_partials');

// ── 1. Validate CLI argument ────────────────────────────────────────────────
const contentArg = process.argv[2];
if (!contentArg) {
  console.error('Error: no content file specified.');
  console.error('Usage: node build-page.mjs _content/my-new-page.html');
  process.exit(1);
}

const contentPath = join(ROOT, contentArg);
if (!existsSync(contentPath)) {
  console.error(`Error: content file not found — ${contentPath}`);
  process.exit(1);
}

// ── 2. Validate partials exist ──────────────────────────────────────────────
const REQUIRED_PARTIALS = ['head-template.html', 'header.html', 'footer.html'];
for (const f of REQUIRED_PARTIALS) {
  if (!existsSync(join(PARTIALS, f))) {
    console.error(`Error: missing partial — _partials/${f}`);
    process.exit(1);
  }
}

// ── 3. Parse metadata from the leading HTML comment ─────────────────────────
const contentRaw = readFileSync(contentPath, 'utf8');
const metaMatch = contentRaw.match(/^<!--\s*([\s\S]*?)-->/);

if (!metaMatch) {
  console.error('Error: content file must start with a metadata comment block.');
  console.error('See the comment at the top of build-page.mjs for the required format.');
  process.exit(1);
}

const metaBlock = metaMatch[1];
function getMeta(key) {
  const m = metaBlock.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim() : '';
}

const title       = getMeta('TITLE');
const description = getMeta('DESCRIPTION');
const canonical   = getMeta('CANONICAL');
const cssFile     = getMeta('CSS');

const missing = ['TITLE', 'DESCRIPTION', 'CANONICAL'].filter(k => !getMeta(k));
if (missing.length) {
  console.error(`Error: metadata block is missing required field(s): ${missing.join(', ')}`);
  process.exit(1);
}

// ── 4. Strip metadata comment, keep content HTML ────────────────────────────
const contentHtml = contentRaw.slice(metaMatch[0].length).trimStart();

// ── 5. Read partials ────────────────────────────────────────────────────────
const headTemplate = readFileSync(join(PARTIALS, 'head-template.html'), 'utf8');
const headerHtml   = readFileSync(join(PARTIALS, 'header.html'), 'utf8');
const footerHtml   = readFileSync(join(PARTIALS, 'footer.html'), 'utf8');

// ── 6. Inject metadata into head template ───────────────────────────────────
const pageCssLink = cssFile
  ? `<link rel="stylesheet" id="generateblocks-css" href="${cssFile}" media="all">`
  : '';

const head = headTemplate
  .replace(/\{\{TITLE\}\}/g,       escapeHtml(title))
  .replace(/\{\{DESCRIPTION\}\}/g, escapeHtml(description))
  .replace(/\{\{CANONICAL\}\}/g,   canonical)
  .replace(/\{\{PAGE_CSS\}\}/g,    pageCssLink);

function escapeHtml(str) {
  return str
    .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── 7. Build body tag ────────────────────────────────────────────────────────
const bodyTag = `\n<body class="wp-embed-responsive post-image-aligned-center slideout-enabled slideout-mobile sticky-menu-fade sticky-enabled both-sticky-menu mobile-header mobile-header-logo mobile-header-sticky no-sidebar nav-float-right separate-containers header-aligned-left dropdown-hover full-width-content" itemtype="https://schema.org/WebPage" itemscope="">\n`;

// ── 8. Assemble and write ────────────────────────────────────────────────────
const finalHtml = head + bodyTag + '\n' + headerHtml + '\n' + contentHtml + '\n' + footerHtml;

const outputFile = basename(contentPath);           // e.g. new-blog-post.html
const outputPath = join(ROOT, outputFile);
writeFileSync(outputPath, finalHtml, 'utf8');

console.log(`✓  Built: ${outputFile}  (${(finalHtml.length / 1024).toFixed(1)} KB)`);
