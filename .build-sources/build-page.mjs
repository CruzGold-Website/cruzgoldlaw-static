/**
 * build-page.mjs — Builds a blog post in the redesigned guide template (template 08) from a content file.
 *
 * Usage (run from .build-sources/):
 *   node build-page.mjs _content/my-new-post.html
 *
 * The content file starts with a metadata comment block, then the article HTML:
 *
 *   <!--
 *   TITLE: Page title for the browser tab and Google
 *   DESCRIPTION: Meta description (under 160 chars)
 *   CANONICAL: /my-new-post/
 *   PUBLISHED: 2026-11-25
 *   H1: Heading shown on the page (optional, defaults to TITLE)
 *   LABEL: Guide · Green cards (optional, the small label above the heading, defaults to "Guide")
 *   IMAGE: /images/redesign/couple-hug.webp (optional header photo, defaults to professional.webp)
 *   IMAGE_POS: 50% 30% (optional focus point of the header photo)
 *   CSS: css/extra.css (optional extra stylesheet)
 *   -->
 *   <div class="cg-guide-body">
 *   <p>First paragraph (shown under the heading)</p>
 *   <h2>Section heading</h2>
 *   ...
 *
 * What the template does with the article:
 *   - the first paragraph becomes the lede under the heading
 *   - every <h2> starts a section and is listed under "On this page"
 *   - a free consultation box goes after the second or third section
 *   - the author box, "More guides" (the three newest guides on /blog/), the calendar and the closing CTA are added
 *   - a section headed "Related ..." shows its links as chips; a section of <details> becomes the FAQ
 *
 * Output: <filename>.html next to this script (e.g. _content/new-post.html -> new-post.html).
 * Move it to /<slug>/index.html, and add the post to the blog list and the sitemap.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));  // .build-sources
const REPO = dirname(ROOT);
const PARTIALS = join(ROOT, '_partials');
const IMG = '/images/redesign/';
const SITE = 'https://cruzgoldlaw.com';
const BOOK_URL = 'https://calendly.com/zgold-cruzgoldlaw/free-immigration-consult-organic?utm_source=website&primary_color=bf992d&text_color=0c152c';
const PHONES = [['Ewing', ', NJ', '+16099248500', '(609) 924-8500'],
                ['Philadelphia', ', PA', '+12156082131', '(215) 608-2131'],
                ['Houston', ', TX', '+18329247490', '(832) 924-7490']];
const PLUS = (s, w) => `<svg class="ic-plus" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="${w}" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>`;
const MINUS = (s, w) => `<svg class="ic-minus" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="${w}" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>`;
const AUTHOR_BIO = 'Zachary Gold is the owner and lead attorney of Cruz Gold &amp; Associates, the immigration firm his mother, Marta Cruz Gold, founded in 1995. He began as a paralegal and has more than seven years of legal experience. He is a Rutgers University graduate, earned his law degree at Drexel University and is a member of the American Immigration Lawyers Association.';

function fail(msg) { console.error('Error: ' + msg); process.exit(1); }

// ── 1. Arguments and files ──────────────────────────────────────────────────
const contentArg = process.argv[2];
if (!contentArg) fail('no content file specified.\nUsage: node build-page.mjs _content/my-new-post.html');
const contentPath = join(ROOT, contentArg);
if (!existsSync(contentPath)) fail(`content file not found — ${contentPath}`);
for (const f of ['head-template.html', 'header.html', 'footer.html'])
  if (!existsSync(join(PARTIALS, f))) fail(`missing partial — _partials/${f}`);

// ── 2. Metadata ─────────────────────────────────────────────────────────────
const contentRaw = readFileSync(contentPath, 'utf8').replace(/^﻿/, '');
const metaMatch = contentRaw.match(/^<!--\s*([\s\S]*?)-->/);
if (!metaMatch) fail('content file must start with a metadata comment block.\nSee the comment at the top of build-page.mjs for the required format.');
const getMeta = key => { const m = metaMatch[1].match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm')); return m ? m[1].trim() : ''; };
const missing = ['TITLE', 'DESCRIPTION', 'CANONICAL'].filter(k => !getMeta(k));
if (missing.length) fail(`metadata block is missing required field(s): ${missing.join(', ')}`);

const title = getMeta('TITLE'), description = getMeta('DESCRIPTION');
let canonical = getMeta('CANONICAL');
if (!/^https?:\/\//.test(canonical)) canonical = new URL(canonical, SITE + '/').href;
const published = getMeta('PUBLISHED');
if (published && !/^\d{4}-\d{2}-\d{2}$/.test(published)) fail('PUBLISHED must look like 2026-11-25');
const h1 = getMeta('H1') || title.replace(/\s*\|\s*Cruz Gold.*$/i, '');
const label = getMeta('LABEL') || 'Guide';
const image = getMeta('IMAGE') || IMG + 'professional.webp';
const imagePos = getMeta('IMAGE_POS') || '50% 30%';
const cssFile = getMeta('CSS');
const slug = new URL(canonical, SITE).pathname.replace(/^\/|\/$/g, '');

// ── 3. A small HTML parser (the content files are plain, well-formed HTML) ──
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function parse(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|[^<]+|</g;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) {  // closing tag: pop back to the matching element
      const i = stack.map(n => n.tag).lastIndexOf(m[1].toLowerCase());
      if (i > 0) stack.length = i;
    } else if (m[2]) {
      const t = m[2].toLowerCase(), attrs = {};
      for (const a of m[3].matchAll(/([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
        attrs[a[1].toLowerCase()] = a[3] ?? a[4] ?? a[5] ?? '';
      const node = { tag: t, attrs, children: [] };
      top.children.push(node);
      if (!VOID.has(t) && !m[4]) stack.push(node);
    } else {
      top.children.push(m[0]);
    }
  }
  return root;
}
const isEl = n => typeof n === 'object';
const cls = n => (isEl(n) && n.attrs.class) || '';
const kids = (n, tag) => n.children.filter(c => isEl(c) && (!tag || c.tag === tag));
const find = (n, tag) => { for (const c of n.children) { if (!isEl(c)) continue; if (c.tag === tag) return c; const f = find(c, tag); if (f) return f; } return null; };
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = n => (isEl(n) ? n.children.map(text).join('') : decode(n));
const txt = n => text(n).replace(/\s+/g, ' ').trim();

// inner HTML keeping links and inline emphasis only (no classes or styles), as the redesign does on every page
const INLINE_OK = new Set(['a', 'strong', 'b', 'em', 'i', 'br', 'code', 'sup', 'sub', 'time', 'abbr', 'small', 'u', 'mark', 's']);
function inner(n) {
  const walk = el => el.children.map(c => {
    if (!isEl(c)) return c;
    if (['script', 'style', 'svg', 'noscript', 'img'].includes(c.tag)) return '';
    if (!INLINE_OK.has(c.tag)) return walk(c);
    if (c.tag === 'br') return '<br>';
    let at = '';
    if (c.tag === 'a' && c.attrs.href) {
      at = ` href="${c.attrs.href}"`;
      if (c.attrs.target) at += ` target="${c.attrs.target}"`;
      if (c.attrs.rel) at += ` rel="${c.attrs.rel}"`;
    }
    if (c.tag === 'time' && c.attrs.datetime) at = ` datetime="${c.attrs.datetime}"`;
    const t = { b: 'strong', i: 'em' }[c.tag] || c.tag;
    return `<${t}${at}>${walk(c)}</${t}>`;
  }).join('');
  return walk(n).replace(/\s+/g, ' ').trim();
}
const headingId = n => n.attrs.id || txt(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

// ── 4. Block renderers (same output as .build-sources/redesign/blocks.py) ───
function rImg(img) {
  const w = img.attrs.width, h = img.attrs.height;
  return `<img class="art-img" src="${img.attrs.src || ''}" alt="${img.attrs.alt || ''}"${w && h ? ` width="${w}" height="${h}"` : ''} loading="lazy">`;
}
const STAT_RE = /^\s*([\d.,]+(?:\s*(?:to|-|–)\s*[\d.,]+)?)\s+(months?|years?|weeks?|days?)\s*$/;
function rTable(t) {
  const rows = [];
  const collect = n => { for (const c of kids(n)) { if (c.tag === 'tr') rows.push(c); else if (['thead', 'tbody', 'tfoot'].includes(c.tag)) collect(c); } };
  collect(t);
  if (!rows.length) return '';
  const cells = r => kids(r).filter(c => c.tag === 'th' || c.tag === 'td');
  const head = cells(rows[0]);
  const hasHead = !!find(t, 'thead') || head.every(c => c.tag === 'th');
  let out = '', body = rows;
  if (hasHead) { out += '<thead><tr>' + head.map(c => `<th scope="col">${inner(c)}</th>`).join('') + '</tr></thead>'; body = rows.slice(1); }
  const cell = c => { const h = inner(c); return STAT_RE.test(h.replace(/<[^>]+>/g, '')) ? `<td><strong class="serif tv">${h}</strong></td>` : `<td>${h}</td>`; };
  out += '<tbody>' + body.map(r => '<tr>' + cells(r).map(cell).join('') + '</tr>').join('') + '</tbody>';
  const cap = find(t, 'caption');
  return `<div class="tbl"><table>${cap ? `<caption>${inner(cap)}</caption>` : ''}${out}</table></div>`;
}
const rList = (b, ordered) => {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="art-list">${kids(b, 'li').map(li => `<li>${inner(li)}</li>`).join('')}</${tag}>`;
};
function rFaq(list, openFirst = true) {
  return list.map((d, i) => {
    const s = find(d, 'summary');
    const bodyEl = d.children.find(c => cls(c).includes('cg-acc-body')) || d;
    const parts = bodyEl.children.map(c => isEl(c) ? (c.tag === 'summary' ? '' : render(c))
      : (bodyEl !== d && c.trim() ? `<p>${c.trim()}</p>` : '')).join('');
    return `<details${i === 0 && openFirst ? ' open' : ''}><summary>${s ? inner(s) : ''}${PLUS(22, 2.2)}${MINUS(22, 2.2)}</summary><div>${parts}</div></details>`;
  }).join('');
}
function rChips(b) {
  const links = [];
  const walk = n => { for (const c of kids(n)) { if (c.tag === 'a') links.push(c); else walk(c); } };
  walk(b);
  return '<div class="chips">' + links.map(a => `<a class="chip" href="${a.attrs.href || '#'}">${inner(a)}</a>`).join('') + '</div>';
}
function render(b) {
  const c = cls(b);
  switch (b.tag) {
    case 'p': {
      if (c.includes('cg-note')) return `<p class="note">${inner(b)}</p>`;
      const t = txt(b);
      if (t.startsWith('Source:') || t.startsWith('Sources:')) return `<p class="src-note">${inner(b)}</p>`;
      const img = find(b, 'img');
      if (img && !t) return rImg(img);
      return `<p>${inner(b)}</p>`;
    }
    case 'h3': return `<h3 class="art-h3" id="${headingId(b)}">${inner(b)}</h3>`;
    case 'h4': case 'h5': return `<h4 class="art-h4">${inner(b)}</h4>`;
    case 'ul': return c.includes('cg-related') ? rChips(b) : rList(b, false);
    case 'ol': return rList(b, true);
    case 'table': return rTable(b);
    case 'figure': {
      const t = find(b, 'table'); if (t) return rTable(t);
      const img = find(b, 'img');
      if (img) { const cap = find(b, 'figcaption'); return rImg(img) + (cap ? `<p class="src-note">${inner(cap)}</p>` : ''); }
      return '';
    }
    case 'blockquote': {
      const p = find(b, 'p'), cite = find(b, 'cite');
      return `<blockquote class="pull"><p class="serif">${inner(p || b)}</p>${cite ? `<cite>${inner(cite)}</cite>` : ''}</blockquote>`;
    }
    case 'details': return rFaq([b], false);
    case 'img': return rImg(b);
    case 'div': case 'section': case 'article': case 'aside': {
      const t = find(b, 'table');
      if (t) return rTable(t);  // a scroll wrapper around a table
      return kids(b).map(render).join('');
    }
    default: return '';
  }
}

// ── 5. Article ──────────────────────────────────────────────────────────────
const doc = parse(contentRaw.slice(metaMatch[0].length));
// unwrap a wrapper such as <div class="cg-guide-body"> around the whole article
let blocks = kids(doc);
while (blocks.length === 1 && blocks[0].tag === 'div' && kids(blocks[0]).some(k => k.tag === 'h2' || k.tag === 'p')) blocks = kids(blocks[0]);
blocks = blocks.filter(b => !(b.tag === 'nav' && cls(b).includes('cg-toc')) && b.tag !== 'h1');

// a lead figure goes (the header photo takes its place); the quick answer box, or else the first paragraph, becomes the lede
const figI = blocks.findIndex(b => b.tag === 'figure' && find(b, 'img'));
if (figI > -1 && figI < 3) blocks.splice(figI, 1);
let ledeI = blocks.findIndex(b => b.tag === 'blockquote' && cls(b).includes('cg-answer'));
if (ledeI > 1) ledeI = -1;  // only a quick answer at the top of the post
if (ledeI < 0) ledeI = blocks.findIndex(b => b.tag === 'p' && txt(b));
const lede = ledeI > -1 ? inner(blocks[ledeI].tag === 'blockquote' ? (find(blocks[ledeI], 'p') || blocks[ledeI]) : blocks[ledeI]) : '';
if (ledeI > -1) blocks.splice(ledeI, 1);

const secs = [];
for (const b of blocks) {
  if (b.tag === 'h2') secs.push([b, []]);
  else { if (!secs.length) secs.push([null, []]); secs[secs.length - 1][1].push(b); }
}
const CHECK_DEEP = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
function sectionHtml(h, bl) {
  const tl = h ? txt(h).toLowerCase() : '', hid = h ? headingId(h) : '';
  const h2 = h ? `<h2 class="display art-h2" id="${hid}">${inner(h)}</h2>` : '';
  if (h && bl.length && bl.every(b => b.tag === 'details'))
    return `<div class="faq"><h2 class="display art-h2" id="${hid}">${inner(h)}</h2>${rFaq(bl)}</div>`;
  if (tl.startsWith('related'))
    return `<div class="art-sec gap16"><p class="eyebrow" id="${hid}">${inner(h)}</p>${bl.map(b => ['ul', 'ol'].includes(b.tag) ? rChips(b) : render(b)).join('')}</div>`;
  if (tl.startsWith('key takeaways') && bl.length && bl[bl.length - 1].tag === 'ul') {
    const intro = bl.slice(0, -1).map(render).join('');
    const lis = kids(bl[bl.length - 1], 'li').map(li => `<li>${CHECK_DEEP}<span>${inner(li)}</span></li>`).join('');
    return `<div class="art-sec">${intro}<div class="takeaways"><h2 class="eyebrow" id="${hid}">${inner(h)}</h2><ul>${lis}</ul></div></div>`;
  }
  return `<div class="art-sec">${h2}${bl.map(render).join('')}</div>`;
}
const usedSecs = secs.filter(([h, bl]) => h || bl.length);
const parts = usedSecs.map(([h, bl]) => sectionHtml(h, bl));
const items = usedSecs.filter(([h]) => h && !txt(h).toLowerCase().startsWith('related')).map(([h]) => [headingId(h), txt(h)]);
if (!items.length) console.warn('Warning: no <h2> headings, so "On this page" is empty.');

const btns = `<a class="btn btn-gold" href="#book">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a>`;
const inline = `<div class="in-cta workwith"><div class="stack gap14"><p class="eyebrow light">Free consultation</p><p class="display" style="font-size:30px;line-height:1.18;color:#fff;margin:0">Questions about your case?</p><p>Free consultation with attorney Zachary Gold. ¡Hablamos español!</p>
<div class="btn-row">${btns}</div></div>
<div class="desk-only"><img class="hexclip" src="${IMG}zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008" loading="lazy"></div></div>`;
const intro = usedSecs.length && usedSecs[0][0] === null ? 1 : 0;
parts.splice(parts.length >= intro + 5 ? Math.min(parts.length, intro + 3) : Math.min(parts.length, intro + 2), 0, inline);
const author = `<div class="author">
<img class="hexclip" src="${IMG}zachary-author.webp" alt="Attorney Zachary Gold" width="224" height="280" loading="lazy">
<div class="author-t"><p class="eyebrow">About the author</p><strong class="serif author-n">Zachary Gold, Esq.</strong><p>${AUTHOR_BIO}</p></div>
</div>`;
const relI = parts.findIndex(x => x.includes('class="chips"'));
parts.splice(relI > -1 ? relI : parts.length, 0, author);

// ── 6. Page sections ────────────────────────────────────────────────────────
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const role = 'Owner and lead attorney' + (published ? ` · <time datetime="${published}">${fmtDate(published)}</time>` : '');
const h1Html = esc(decode(h1));
const crumbHtml = `<nav class="crumb" aria-label="Breadcrumb"><div class="wrap"><a href="/">Home</a><span aria-hidden="true">›</span><a href="/blog/">Blog</a><span aria-hidden="true">›</span><span aria-current="page">${h1Html}</span></div></nav>`;
const hero = `${crumbHtml}<section class="g-head"><div class="wrap hero-grid">
<div class="g-head-t">
<p class="eyebrow eyeline">${esc(decode(label))}</p>
<h1 class="display h-xl g-head-h">${h1Html}</h1>
<p class="lede">${lede}</p>
<div class="byline"><img src="${IMG}zachary.webp" alt="" width="942" height="1008"><span><span>Written by <a href="/about/">Zachary Gold, Esq.</a></span><span class="role">${role}</span></span></div>
</div>
<img class="g-head-img" src="${image}" alt="" width="1600" height="1066" fetchpriority="high" style="object-position:${imagePos}">
</div></section>`;
const tocDesk = items.map(([i, t], n) => `<li><a href="#${i}"${n === 0 ? ' class="on"' : ''}>${esc(t)}</a></li>`).join('');
const tocPhone = items.map(([i, t]) => `<li><a href="#${i}">${esc(t)}</a></li>`).join('');
const body = `<section class="p-body g"><div class="wrap">
<details class="toc-phone"><summary>On this page${PLUS(18, 2.4)}${MINUS(18, 2.4)}</summary><ul>${tocPhone}</ul></details>
<aside class="toc-desk">
<nav class="toc-box" aria-label="On this page"><p class="eyebrow">On this page</p><ul>${tocDesk}</ul></nav>
<div class="side-cta"><img src="${IMG}zachary.webp" alt="" width="942" height="1008" loading="lazy"><strong>Questions about your case?</strong><span>Free consultation with attorney Zachary Gold. ¡Hablamos español!</span><a class="btn btn-gold" href="#book">Book a time</a></div>
</aside>
<article class="art art-g">${parts.join('')}</article>
</div></section>`;

// More guides: the three newest guide cards on the blog list (not this post)
let more = '';
const blogPath = join(REPO, 'blog', 'index.html');
if (existsSync(blogPath)) {
  const cards = [...readFileSync(blogPath, 'utf8').matchAll(/<a class="post-card" href="([^"]*)">[\s\S]*?<\/a>/g)]
    .filter(m => m[1] !== `/${slug}/` && /<span class="eyebrow">Guide/.test(m[0])).slice(0, 3).map(m => m[0]);
  if (cards.length) more = `<section class="more-g"><div class="wrap">
<div class="review-head"><div><p class="eyebrow">Keep reading</p><h2 class="display h-l h46">More guides</h2></div><a class="btn btn-line" href="/blog/">All articles</a></div>
<div class="g3" style="gap:28px">${cards.join('')}</div>
</div></section>`;
} else console.warn('Warning: blog/index.html not found, so "More guides" is left out.');

const calls = PHONES.map(([c, st, t, n]) => `<li><a href="tel:${t}"><span>${c}<span class="cityph">${st}</span></span> <strong>${n}</strong></a></li>`).join('');
const book = `<section class="h-book" id="book">
<div class="wrap h-book-in">
<p class="eyebrow">Free consultation</p>
<h2 class="display h-l h-h2">Pick a time to talk with <em>Zachary</em></h2>
<p class="lede">Choose a day below. You speak with attorney Zachary Gold, and you hear the fee before any work begins.</p>
<div class="h-cal"><div class="calendly-inline-widget" data-url="${esc(BOOK_URL)}" data-source="website" data-resize="true"></div></div>
<div class="h-callus"><span class="h-callus-l"><strong>Prefer to call?</strong></span> <ul>${calls}</ul></div>
</div>
</section>`;
const cta = `<section class="cta-r on-dark p104">
<img src="${IMG}family-door.webp" alt="" width="1600" height="1066" loading="lazy" style="object-position:50% 30%">
<div class="cta-r-shade" aria-hidden="true"></div>
<div class="wrap"><div class="cta-r-t">
<p class="eyebrow light">Free consultation</p>
<h2 class="display h-l h52">Have a question about <em>your own case?</em></h2>
<p class="lede">Book a free consultation with attorney Zachary Gold, at our Ewing office or by video. ¡Hablamos español!</p>
<div class="btn-row">${btns}</div>
</div></div>
</section>`;

// ── 7. Head, body and partials ──────────────────────────────────────────────
const escAttr = s => esc(decode(s));
const ogImg = image.startsWith('/') ? SITE + image : image;
const extra = [`<meta property="article:section" content="Blog">`];
if (published) extra.push(`<meta property="article:published_time" content="${published}">`, `<meta property="article:modified_time" content="${published}">`);
extra.push(`<meta property="og:image" content="${ogImg}">`, `<meta name="twitter:image" content="${ogImg}">`);
const head = readFileSync(join(PARTIALS, 'head-template.html'), 'utf8')
  .replace(/\{\{TITLE\}\}/g, escAttr(title))
  .replace(/\{\{DESCRIPTION\}\}/g, escAttr(description))
  .replace(/\{\{CANONICAL\}\}/g, canonical)
  .replace(/\{\{OG_TYPE\}\}/g, 'article')
  .replace(/\{\{HEAD_EXTRA\}\}/g, extra.join('\n'))
  .replace(/\{\{PAGE_CSS\}\}/g, cssFile ? `<link rel="stylesheet" href="/${cssFile.replace(/^\//, '')}">` : '');
const header = readFileSync(join(PARTIALS, 'header.html'), 'utf8').replace(/^<!--[\s\S]*?-->\n/, '');
const footer = readFileSync(join(PARTIALS, 'footer.html'), 'utf8');

const finalHtml = head + '<body class="cg-site cg-inner">\n' + header + hero + body + more + book + cta + '\n' + footer;
const outputFile = basename(contentPath);
writeFileSync(join(ROOT, outputFile), finalHtml, 'utf8');
console.log(`✓  Built: ${outputFile}  (${(finalHtml.length / 1024).toFixed(1)} KB)`);
