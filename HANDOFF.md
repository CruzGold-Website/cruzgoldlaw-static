# WordPress/Brizy to Static HTML Conversion — Complete Handoff (3 Sites Done)

## READ THIS ENTIRE DOCUMENT BEFORE WRITING A SINGLE LINE OF CODE.

This document contains every lesson learned from converting THREE WordPress sites to static HTML/CSS/JS:
1. **optimize360now.com** — Brizy page builder, 51 pages
2. **vernstenlaw.com** — GeneratePress + GenerateBlocks, 37 pages
3. **cruzgoldlaw.com** — GeneratePress + GenerateBlocks, 69 pages

The next site you convert will face the same problems. This document tells you what they are and how to solve them.

---

## The Task

A client (Three Stripes Digital, a law firm marketing agency) has ~10 WordPress sites that need converting to fully self-hosted static HTML/CSS/JS.

**Requirements:**
- **Pixel-perfect** — identical to the original. Same layout, fonts, spacing, colors, animations, everything.
- **All assets self-hosted** — no dependency on WordPress, CDNs, or the original server
- **All functionality works** — navigation, mobile responsiveness, forms (recreated with HTML/CSS, data posted to webhooks), sliders, carousels, accordions, maps
- **Clean, modular code** — organized file structure, easy to edit
- **Deploy to Cloudflare Pages** via GitHub integration
- **$250 per completed site**, payment on completion

The client does not care if you use AI. They care that the result is 1:1 identical and nothing is broken.

---

## The Approach That Works

### Phase 1: Discover all pages
### Phase 2: Scrape all pages
### Phase 3: Build — localize all assets, rewrite URLs, fix links, strip bloat, handle forms
### Phase 4: Fix passes — catch everything the build missed
### Phase 5: Path fixing — critical for flat output structure
### Phase 6: Cleanup — remove remaining WordPress artifacts
### Phase 7: QA audit
### Phase 8: Deploy

---

## Phase 1: Discover All Pages

**DO NOT rely on just crawling navigation links.** You will miss pages.

**Step 1:** Try fetching the sitemap:
- `https://site.com/sitemap.xml`
- `https://site.com/sitemap_index.xml`
- `https://site.com/wp-sitemap.xml`

If the sitemap is blocked (Wordfence returns 503), move to Step 2.

**Step 2:** Crawl internal links from MULTIPLE pages: homepage, blog, services, about, contact. Extract all `href` values. Deduplicate.

**Step 3:** After your initial scrape and link-fixing pass, you WILL discover more pages from:
- Blog pagination (`/category/blog/page/2/`, `/page/3/`)
- Blog posts linked from category pages but not from the main blog
- Category pages you didn't know existed

**LESSON FROM CRUZGOLDLAW:** We started with 67 pages and ended with 69. The extra 2 were blog pagination pages discovered when the build script logged "WARNING: Unknown internal link: /category/blog/page/2". Build your pipeline to handle late-discovered pages gracefully — you'll need to fetch them raw and process them through the FULL pipeline.

**LESSON FROM VERNSTENLAW:** Started with 31 pages, ended with 37. Same story.

---

## Phase 2: Scrape All Pages

**Tool:** `website-scraper` npm package (because `wget` isn't available on Windows).

```js
import scrape from 'website-scraper';

const urls = [
  { url: 'https://site.com/', filename: 'index.html' },
  { url: 'https://site.com/about/', filename: 'about.html' },
  // ... map every URL to a filename
];

await scrape({
  urls,
  directory: './site',
  sources: [
    { selector: 'img', attr: 'src' },
    { selector: 'img', attr: 'srcset' },
    { selector: 'link[rel="stylesheet"]', attr: 'href' },
    { selector: 'script', attr: 'src' },
    { selector: 'link[rel="icon"]', attr: 'href' },
    { selector: 'link[rel="shortcut icon"]', attr: 'href' },
    { selector: 'source', attr: 'srcset' },
    { selector: 'link[rel="preload"]', attr: 'href' },
  ],
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  urlFilter: (url) => url.includes('yourdomain.com'),
  filenameGenerator: 'bySiteStructure',
  maxRecursiveDepth: 1,
  maxDepth: 1,
});
```

**CRITICAL LESSON (bySiteStructure):** The scraper saves pages in WordPress directory structure: `about/index.html`, `testimonial/jenny-bock/index.html`. It makes CSS/JS/image paths RELATIVE to each page's directory depth. When you flatten everything to a single directory (`about.html`, `testimonial-jenny-bock.html`), ALL those relative paths break. This is the single biggest source of bugs. See Phase 5.

**For pages discovered AFTER the initial scrape:** Use raw `fetch()`:
```js
const res = await fetch(url, { headers: { 'User-Agent': '...' } });
const html = await res.text();
await writeFile(`./output/${filename}`, html);
```
These pages have ALL original WordPress URLs intact. They need the complete localization treatment.

---

## Phase 3: Build (The Main Script)

This is the most important step. One big `build.mjs` script that does everything:

### 3a. Create clean directory structure
```
output/
├── *.html          # All pages flat
├── css/            # All CSS files with clean names
├── js/             # All JS files with clean names
├── images/         # All images
├── videos/         # MP4 background videos (if any)
└── fonts/          # All font files
```

### 3b. Copy and rename CSS/JS files
The scraper saves files with URL-encoded names like `main.min_ver%3D3.6.1.css`. Rename to clean names:
```js
const cssMap = {
  'main.min_ver=3.6.1.css': 'generatepress-main.css',
  'formidableforms_ver=4122250.css': 'formidableforms.css',
  // etc.
};
```

### 3c. Download external CDN assets the scraper missed
Common ones:
- Swiper CSS/JS from `cdn.jsdelivr.net`
- Owl Carousel CSS/JS from `cdnjs.cloudflare.com`
- Google Fonts / Bunny Fonts (download CSS, then download all font files inside)
- Font files from the site's own `wp-content/uploads/generatepress/fonts/`

**LESSON FROM CRUZGOLDLAW:** Fonts were self-hosted under `wp-content/uploads/generatepress/fonts/` with 24 woff2/ttf files. The font CSS had absolute URLs pointing back to the site. Had to download all font files AND rewrite the font CSS to use relative `../fonts/` paths.

**LESSON FROM VERNSTENLAW:** The site declared "General Sans" font but it was never actually loading — the font files pointed to a dead staging domain. We wasted hours downloading and loading the actual font, which made our site look DIFFERENT. **ALWAYS verify in DevTools** (uncheck `font-family` on a heading — if the text doesn't change, the declared font isn't loading and you should use the same fallback).

### 3d. Copy all images
Walk `wp-content/uploads/` and copy all image files. **Watch for duplicate filenames** — two pages might use different images both called `photo.webp`. Track by file size and rename if different.

### 3e. Rewrite all URLs in HTML
For every HTML file, replace:
- `wp-content/plugins/.../file.css` → `css/clean-name.css`
- `wp-content/uploads/.../image.webp` → `images/image.webp`
- `https://cdn.jsdelivr.net/npm/swiper@11/...` → `css/swiper-bundle.min.css`
- Font URLs in inline `<style>` blocks → `fonts/filename.woff2`
- Video URLs → `videos/filename.mp4`
- Hostinger/staging domain URLs → local paths

**Handle both absolute and relative URLs.** The scraper makes some relative, keeps some absolute. Your regex must catch both:
```js
// Absolute
html.replace(/https?:\/\/(www\.)?site\.com\/wp-content\/uploads\/[^"')\s]+/g, ...)
// Relative (scraper-created)
html.replace(/(?:src|srcset)="(wp-content\/uploads\/[^"]+)"/g, ...)
// CSS url()
html.replace(/url\(['"]?https:\/\/site\.com\/wp-content\/[^'")\s]+['"]?\)/g, ...)
```

### 3f. Fix internal links
Build a slug→filename map and replace all internal links:

```js
const slugMap = {
  '': 'index.html',
  'about': 'about.html',
  'testimonial/jenny-bock': 'testimonial-jenny-bock.html',
  'category/blog/page/2': 'category-blog-page-2.html',
  // ... every page
};
```

**CRITICAL: Exclude file extensions from link-fixing regex:**
```js
if (/\.(svg|png|jpg|jpeg|webp|gif|js|css|ico|pdf|xml|json|php|otf|woff|woff2|ttf)$/i.test(cleanPath)) {
  return match; // Don't turn image URLs into .html links
}
```
Without this, SVG icon URLs, image paths, and font URLs get `.html` appended. This was a major bug on optimize360.

**Also fix:**
- `href="/slug/"` relative links
- `content="https://site.com/..."` in canonical/og meta tags
- Feed/comment links → `href="#"` (dead on static site)

**Log unknown links:** Print `WARNING: Unknown internal link: /slug` — these tell you about pages you missed.

### 3g. Strip WordPress bloat
**Safe to remove:**
- `window._wpemojiSettings` + emoji CSS + emoji loader `<script type="module">`
- RSS feed `<link>` tags
- oEmbed `<link>` tags
- `wp-json`, `api.w.org`, `EditURI`, `RSD` link tags
- `dns-prefetch` for CDNs you no longer use
- Google Tag Manager (unless client wants it — default: KEEP)
- `<meta name="generator">`, `<meta name="ti-site-data">`
- Rank Math SEO HTML comments
- `<link rel="shortlink">`, `<link rel="pingback">`
- `<script type="speculationrules">` blocks
- `<script>document.documentElement.className += " js";</script>`
- LiteSpeed Cache HTML comments
- `console.log()` debug statements
- `//# sourceURL=` debug directives

**NOT safe to remove:**
- Any inline `<style>` blocks — they contain page-specific CSS from the page builder
- Any `data-*` attributes used by JS (menus, sliders, accordions, popups)
- Any form-related scripts or config
- `<script type="application/ld+json">` — structured data, keep for SEO

### 3h. Handle forms
WordPress forms (Fluent Forms, Formidable, etc.) submit to `wp-admin/admin-ajax.php`. Create a custom `form-handler.js`:

```js
var WEBHOOK_URL = 'PLACEHOLDER_WEBHOOK_URL';
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('form.frm-fluent-form, form[data-form_id]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var formData = {};
      form.querySelectorAll('input, select, textarea').forEach(function(input) {
        if (input.name && input.type !== 'hidden' && input.type !== 'submit')
          formData[input.name] = input.value;
      });
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        mode: 'no-cors'
      }).then(function() { /* show success */ });
    });
  });
});
```

Also neutralize the original ajax URL:
```js
html = html.replace(/"ajaxUrl":"https?:\\\/\\\/[^"]+admin-ajax\.php"/g, '"ajaxUrl":""');
```

Add `form-handler.js` to every page before `</body>`.

---

## Phase 4: Fix Passes

The main build will miss things. Run these checks and fix iteratively:

### 4a. Missing assets
After the build, audit every `src=`, `href=`, `url()` for local paths that don't resolve to a file on disk. Download whatever is missing:
- Background images in CSS `url()` — easily missed because they're not in `src=` attributes
- Favicon files
- Images from staging/Hostinger domains
- Video files (.mp4) used as background videos
- TrustIndex/third-party CSS

### 4b. Late-discovered pages
Download with `fetch()`, then process through the FULL pipeline — URL rewriting, link fixing, bloat removal, form handler injection.

### 4c. Video files
Sites often have background MP4 videos from `wp-content/uploads/`. Download these to `videos/` and rewrite the URLs. They can be 2-5MB each.

### 4d. CSS background images
Search all CSS files for `url()` references to `cruzgoldlaw.com` or any external domain. Download the images and rewrite the paths. **Don't forget `../images/` in CSS** (since CSS is in `css/` subdirectory).

**LESSON FROM CRUZGOLDLAW:** Two different CSS files referenced `formidable/images/` (absolute URLs) and `formidable-pro/images/` (protocol-relative `//cruzgoldlaw.com/...`). The first fix pass only caught one set. Always check for BOTH absolute (`https://`) and protocol-relative (`//`) URL patterns.

---

## Phase 5: Path Fixing — THE BIGGEST GOTCHA

**This is the #1 source of bugs across all three conversions.**

The scraper uses `bySiteStructure`, saving pages in WordPress directory structure:
- `index.html` (root level)
- `about/index.html` (1 level deep)
- `testimonial/jenny-bock/index.html` (2 levels deep)

It makes ALL asset references relative to each page's depth:
- Homepage: `src="wp-content/uploads/.../logo.webp"` (no prefix)
- About page: `src="../wp-content/uploads/.../logo.webp"` (one `../`)
- Testimonial page: `src="../../wp-content/uploads/.../logo.webp"` (two `../../`)

When you flatten to `about.html` and `testimonial-jenny-bock.html` in the root, ALL those `../` prefixes point to nonexistent parent directories.

**The fix:**
```js
// Use while loops, NOT single replacements
while (html.includes('../css/')) html = html.split('../css/').join('css/');
while (html.includes('../js/')) html = html.split('../js/').join('js/');
while (html.includes('../images/')) html = html.split('../images/').join('images/');
while (html.includes('../fonts/')) html = html.split('../fonts/').join('fonts/');
while (html.includes('../videos/')) html = html.split('../videos/').join('videos/');

// Also fix ../wp-content paths
html = html.replace(/\.\.\/wp-content\/uploads\/[^"')\s]+/g, (match) => {
  const fname = match.split('/').pop().split('?')[0];
  if (imageExists(fname)) return `images/${fname}`;
  return match;
});
```

**WHY while loops?** A 2-level-deep page has `../../css/`. A single `split('../css/').join('css/')` turns `../../css/` into `../css/` — removing only ONE level. You need the while loop to keep going until all `../` are gone.

**LESSON FROM CRUZGOLDLAW:** We ran `fix-paths.mjs` once, thought we were done. User reported logo missing on inner pages. Turned out testimonial pages (2 levels deep) still had `../` after the first pass. Had to run the script TWICE. After that, we switched to while loops.

**BETTER APPROACH:** Build the path-fixing INTO your main build script from the start. Don't make it a separate fix pass. When you read each HTML file, strip ALL `../` prefixes before doing any other URL rewriting.

---

## Phase 6: Cleanup

After the build and fix passes, do a cleanup pass to remove remaining WordPress artifacts:

### What to clean:
1. **wp-emoji scripts** — Remove the `<script type="module">` block that loads the emoji polyfill. **GOTCHA:** The script may start with `/*! This file is auto-generated */` comment before the actual code. Your regex must handle this:
   ```js
   html = html.replace(/<script type="module">\s*\/\*![\s\S]*?wp-emoji[\s\S]*?<\/script>\s*/g, '');
   ```

2. **Pingback tags** — `<link rel="pingback" href=".../xmlrpc.php">` — dead on static site.

3. **LiteSpeed Cache comments** — `<!-- Page cached by LiteSpeed Cache ... -->` at end of every file.

4. **Debug artifacts** — `console.log()` statements, `//# sourceURL=` directives.

5. **Empty script blocks** — After removing sourceURL comments, some `<script id="xxx-after">` blocks become empty. Remove them.

### What NOT to clean:
1. **Inline `<style>` blocks** — GeneratePress/GenerateBlocks puts page-specific CSS inline. This is 37-54% of each page's file size. Extracting to external CSS risks breaking layout. LEAVE IT.

2. **Large CSS files that seem unused** — `formidableforms.css` (140KB), `block-library.css` (119KB). They MIGHT style elements you're not seeing. Only remove if you're 100% sure.

3. **jquery-migrate.min.js** — WordPress compat shim. Owl Carousel and other jQuery plugins might silently depend on deprecated methods.

4. **CSS class names** — `.gb-container-xxx`, `.wp-block-cover`, etc. These CANNOT be renamed without rewriting all the CSS, which breaks pixel-perfect.

5. **Google Tag Manager** — Client may want analytics. Keep unless told otherwise.

---

## Phase 7: QA Audit

Run this COMPREHENSIVE checklist before deploying:

### Automated checks (write a script):
1. **Broken local asset references** — every `src="css/..."`, `src="js/..."`, `src="images/..."` must resolve to an existing file
2. **Broken internal links** — every `href="*.html"` must point to an existing HTML file
3. **Remaining WordPress URLs** — search all HTML for `wp-content` or `wp-includes` in `src=`/`href=` attributes
4. **Remaining `../` paths** — zero should remain after flattening
5. **CSS file integrity** — no CSS file should be 0 bytes or contain HTML (sign of failed download)
6. **JS file integrity** — same for JS files
7. **Font file integrity** — all font files > 0 bytes
8. **Form handler present** — `form-handler.js` loaded on every page
9. **CSS url() references** — search all CSS files for `cruzgoldlaw.com` or any WP URLs

### Manual checks:
1. **External resources intact** — Google Maps iframes, Gravatar, GTM, social links should NOT be rewritten
2. **Fonts loading** — compare heading fonts side-by-side with original in DevTools
3. **Mobile menu** — test hamburger menu opens/closes
4. **Sliders/carousels** — test autoplay and manual navigation
5. **Video backgrounds** — verify they play
6. **Forms** — verify form HTML is visible (won't submit until webhook is set)
7. **Back-to-top button** — verify it appears on scroll

---

## Phase 8: Deploy

**Vercel (for preview):**
```bash
cd output && npx vercel --prod --yes
```

**GitHub (for Cloudflare Pages):**
```bash
cd output
git init && git add -A && git commit -m "Static site conversion"
gh repo create huzvert/sitename-static --private --source=. --push
```

---

## Mistakes Made Across All 3 Projects (Don't Repeat)

### 1. NEVER use `sed` on single-line minified files
`sed -i 's/old/new/g' file.css` on a 34KB single-line CSS file WIPED IT TO 0 BYTES on Windows/Git Bash. Always use Node.js `readFileSync`/`writeFileSync` for find-and-replace.

### 2. NEVER assume the declared font is what's rendering
On vernstenlaw.com, unchecking the font in DevTools made no visible difference — the browser was using fallback. We downloaded and loaded the real font, which made the site look WRONG. **Always verify in DevTools first.**

### 3. Single `split('../').join('')` doesn't handle multi-level depth
Pages 2+ levels deep (e.g., `testimonial/name/index.html`) produce `../../`. A single replacement only removes one `../`. Use while loops.

### 4. Font CSS from bunny.net has `&amp;` HTML entities
If using bunny.net or Google Fonts, the URL in `<link href="...">` has `&amp;` entities. Your regex must handle this.

### 5. ALWAYS process ALL pages through ALL steps
Pages scraped in a later step (pagination, extra blog posts) didn't go through the main pipeline. They had raw WordPress URLs. Every page must go through every processing step.

### 6. CSS paths break after moving files
`url("assets/img/photo.webp")` in CSS that moved from root to `css/` directory. Fix by using `../images/` and `../fonts/` in all CSS files.

### 7. Same filename, different images
Two pages might reference different images both called `photo.webp`. Track by file size and rename the duplicate.

### 8. Scraper creates directories for non-HTML URLs
When the scraper encounters a URL that redirects or returns HTML for a non-HTML path (like `swiper-init.js`), it creates a DIRECTORY with an `index.html` inside. Check your JS/CSS files for HTML content after downloading.

### 9. Protocol-relative URLs (`//domain.com/...`)
Formidable Forms Pro CSS used `//cruzgoldlaw.com/...` (no `https:`). Your regex for absolute URLs won't catch these. Always check for `//domain.com` patterns too.

### 10. wp-emoji script has a comment before the code
The emoji script `<script type="module">` starts with `/*! This file is auto-generated */` before the actual JS. A regex looking for `<script type="module">\s*const a=JSON.parse` won't match.

### 11. Don't remove CSS/JS unless 100% sure
User explicitly said: "if you are 100% sure it wouldn't break then do it, otherwise just leave it." When in doubt, keep it. A slightly larger file is acceptable; a visual regression is not.

### 12. Deploy once, test locally first
The client got frustrated when early Vercel deploys had issues. Use `npx http-server output/ -p 8080 -c-1` and verify everything in the browser BEFORE deploying.

### 13. Blog pagination pages need scraping too
`/category/blog/page/2/` and `/page/3/` are separate pages. If the site has paginated blog listings, scrape them all.

---

## Environment & Tools
- **OS:** Windows 11, bash shell (Git Bash)
- **Node.js:** v22.19.0
- **No wget, no python3 available** — use curl + Node.js scripts
- **npm packages:** `website-scraper` for initial scrape
- **Deployment:** Vercel CLI for preview (`npx vercel --prod --yes`), Cloudflare Pages for production
- **Git hosting:** GitHub (private repos under `huzvert`)

---

## Sites Completed
1. **optimize360now.com** — Brizy site, 51 pages. Scripts in `/c/Users/yeehuzz/shopif/optimize360/`
2. **vernstenlaw.com** — GeneratePress site, 37 pages. Scripts in `/c/Users/yeehuzz/vernstenlaw/`
3. **cruzgoldlaw.com** — GeneratePress site, 69 pages. Scripts in `/c/Users/yeehuzz/outlawz/`. Preview: https://output-lime-nine.vercel.app

---

## Reusable Pipeline Template

```bash
# 1. Discover pages — fetch sitemap, crawl links, compile master URL list
# 2. Scrape all known pages
node scrape.mjs

# 3. Build: copy assets, rewrite URLs, fix links, strip bloat, add form handler
node build.mjs
# → Check warnings for unknown links → scrape missing pages → re-run

# 4. Fix passes — download missing assets, process late pages, fix video/CSS URLs
node fix.mjs

# 5. Fix relative paths (THE MOST IMPORTANT STEP)
# Use while loops to strip ALL ../ prefixes. Run until 0 issues.
node fix-paths.mjs

# 6. Cleanup — remove emoji, pingback, LiteSpeed, debug artifacts
node cleanup.mjs

# 7. QA audit — automated + manual checks
node audit.mjs

# 8. Test locally
npx http-server output/ -p 8080 -c-1

# 9. Deploy
cd output && npx vercel --prod --yes
```

**The key insight:** Don't try to do everything in one script. The build script gets you 90% there. Then you need 2-3 fix passes to catch everything the build missed. Then a cleanup pass. Then an audit. This iterative approach is faster than trying to anticipate everything upfront.

**The other key insight:** Build the path-fixing (removing `../`) INTO your main build script from the start. Read each HTML file, strip ALL `../` prefixes with while loops, THEN do URL rewriting. This avoids the biggest class of bugs entirely.
