# Cruz Gold Law — WordPress to Static HTML Conversion

## Project Overview
Converting **cruzgoldlaw.com** from WordPress to a fully self-hosted static HTML/CSS/JS site. This is one of ~10 sites for the same client (Three Stripes Digital). Payment: $250/site on completion.

## Client Requirements
- **Pixel-perfect** — identical to original WordPress site
- All assets self-hosted (no WordPress/CDN dependency)
- All functionality working (nav, mobile, sliders, forms, maps)
- Clean, modular code for future edits
- Deploy to **Cloudflare Pages** via GitHub
- Forms recreated with HTML/CSS, data posted to webhooks
- Client doesn't care about AI usage — only results matter

## Site Tech Stack (Original)
- **CMS:** WordPress 6.9.4
- **Theme:** GeneratePress + GP Premium
- **Plugins:** GenerateBlocks Pro, Fluent Forms, Formidable Forms, WP Owl Carousel, Suntyp Slider 2, Rank Math SEO, Site Kit (Google Analytics)
- **Fonts:** Self-hosted via GeneratePress — Mulish, Radley, Jost, Montserrat (woff2/ttf)
- **Sliders:** Swiper JS (brand carousel), Owl Carousel (news/testimonials)
- **Analytics:** Google Tag Manager GT-K4TGJWQ6

## What Was Built
- **69 HTML pages** (24 main pages + 22 blog posts + 20 testimonials + 1 category + 2 pagination)
- **33 CSS files** (theme, plugins, page-specific GenerateBlocks)
- **14 JS files** (jQuery, plugins, form handler)
- **210 images** + 6 videos + 24 font files
- **Preview URL:** https://output-lime-nine.vercel.app
- **Vercel project:** huzverts-projects/output

## Directory Structure
```
/c/Users/yeehuzz/outlawz/
├── site/                  # Raw scraped WordPress files (bySiteStructure)
├── output/                # Final clean static site
│   ├── *.html             # All 69 pages (flat structure)
│   ├── css/               # 33 CSS files (clean names)
│   ├── js/                # 14 JS files (clean names)
│   ├── images/            # 210 images
│   │   └── formidable/    # Formidable plugin assets
│   ├── videos/            # 6 MP4 background videos
│   └── fonts/             # 24 font files (woff2 + ttf)
├── scrape.mjs             # Initial scraper (website-scraper npm)
├── build.mjs              # Main build: copies assets, rewrites URLs, fixes links, strips bloat
├── fix.mjs                # Fix pass 1: missing assets, pagination pages, video downloads
├── fix2.mjs               # Fix pass 2: localize remaining WP URLs, video paths
├── fix3.mjs               # Fix pass 3: swiper-init.js removal, final CSS url() fixes
├── fix-paths.mjs          # Fix relative ../css/ ../js/ ../images/ paths (run TWICE for 2-level-deep pages)
├── cleanup.mjs            # Cleanup: CSS image URLs, WP bloat, emoji, pingback, LiteSpeed
├── cleanup2.mjs           # Cleanup: wp-emoji module script, formidable-pro CSS URLs
├── fix-final.mjs          # Final: favicon, move-rehab-logo artifact, deep ../ cleanup
├── generate-sitemap.mjs   # Auto-generates sitemap.xml from output/*.html (base: https://cruzgoldlaw.com)
└── package.json
```

## Pipeline (How It Was Done)

### Phase 1: Discover Pages
- Fetched sitemap from `cruzgoldlaw.com/sitemap.xml` (Rank Math)
- Found 67 pages across 4 sitemaps (page, post, testimonial, category)
- Later discovered 2 blog pagination pages during link-fixing

### Phase 2: Scrape
- Used `website-scraper` npm package with `bySiteStructure` file generator
- Scraped all 67 pages + same-domain CSS/JS/images
- External CDN assets (Swiper, Owl Carousel) NOT downloaded by scraper — handled separately

### Phase 3: Build (build.mjs)
- Created flat output structure (css/, js/, images/, fonts/)
- Copied and renamed all CSS/JS files (removed version query strings)
- Downloaded external CDN assets: Swiper CSS/JS, Owl Carousel CSS/JS
- Downloaded 24 font files from cruzgoldlaw.com/wp-content/uploads/generatepress/fonts/
- Rewrote all URLs in HTML: CSS, JS, images, fonts, CDN → local paths
- Fixed all internal links using slug→filename map
- Stripped WordPress bloat (RSS, oEmbed, wp-json, generator, dns-prefetch, shortlinks, etc.)
- Created form-handler.js with PLACEHOLDER_WEBHOOK_URL
- Added form-handler.js to all pages

### Phase 4: Fix Passes
- **fix.mjs:** Downloaded block-library.css, open-graph image, Menu_background image, blog pagination pages (page 2, 3), processed pagination through full pipeline
- **fix2.mjs:** Localized video URLs → videos/, CSS background-image url(), trustindex CSS
- **fix3.mjs:** Removed broken swiper-init.js (404 on original site — code is inline), fixed business-meeting-cafe image, move-rehab-perform-logo
- **fix-paths.mjs:** Fixed `../css/`, `../js/`, `../images/`, `../wp-content/` relative paths. **Had to run TWICE** — testimonial pages were 2 levels deep (`testimonial/name/index.html`), so scraper used `../../` which became `../` after first pass
- **fix-final.mjs:** Favicon paths, recursive `../` cleanup with while loops

### Phase 5: Cleanup
- **cleanup.mjs:** Localized wesley-tingey background image in 2 CSS files, formidable CSS image URLs, removed pingback/LiteSpeed/console.log/sourceURL/dns-prefetch
- **cleanup2.mjs:** Removed wp-emoji module scripts (regex needed `/*! auto-generated */` comment handling), fixed formidable-pro protocol-relative CSS URLs

## Problems Faced & Solutions

### 1. Scraper relative paths broke in flat structure
**Problem:** Scraper used `bySiteStructure` → pages in subdirs (`about/index.html`) → relative paths (`../css/`, `../wp-content/`). Flattened to root but paths still had `../`.
**Solution:** `fix-paths.mjs` replaces all `../css/` → `css/`, etc. Had to run **twice** because testimonial pages were 2 levels deep.

### 2. Logo missing on inner pages (user-reported bug)
**Problem:** Homepage logo `src="images/cruzgoldlaw-logo.webp"` ✓, but about page had `src="../wp-content/uploads/2025/03/cruzgoldlaw-logo.webp"` ✗
**Solution:** Same as #1 — the `../wp-content/` paths needed rewriting to `images/`.

### 3. swiper-init.js returns 404
**Problem:** The file doesn't exist on the original WordPress server. Scraper created a directory with an HTML 404 page inside.
**Solution:** Removed the `<script>` tag. Swiper initialization code is inline in the HTML already.

### 4. Empty JS files (suntyp-slider.js = 0 bytes, owl-carousel-custom.js = 1 byte)
**Problem:** These files are empty on the original server too.
**Decision:** Left as-is. Slider init code is inline. Removing the `<script>` tags was considered but not 100% safe.

### 5. wp-emoji script regex didn't match
**Problem:** First cleanup pass didn't remove emoji scripts because the `<script type="module">` block had a `/*! This file is auto-generated */` comment before the code.
**Solution:** Updated regex in cleanup2.mjs to handle the comment.

### 6. Formidable-pro vs formidable CSS URLs
**Problem:** `formidableforms.css` had two sets of image URLs — `formidable/images/` and `formidable-pro/images/` (protocol-relative `//cruzgoldlaw.com/...`). First fix only caught one set.
**Solution:** Second cleanup pass with protocol-relative URL regex.

### 7. move-rehab-perform-logo.png scraper artifact
**Problem:** Scraper created `move-rehab-perform-logo.png/index.html` (directory instead of file) because the URL redirected.
**Solution:** Downloaded the actual PNG, replaced the artifact path in srcset attributes.

## Decisions Made

### Kept (intentionally not removed):
- **Inline `<style>` blocks** (37-54% of page size) — GeneratePress page-specific CSS. Extracting risks breaking layout.
- **formidableforms.css** (140KB on all pages) — inline styles reference `.frm_style_formidable-style`. Not 100% sure it's unused.
- **jquery-migrate.min.js** (14KB) — Owl Carousel and plugins might need deprecated jQuery methods.
- **block-library.css** (119KB) — pages use `wp-block-*` classes.
- **Google Tag Manager** — client may want analytics.
- **CSS class names** (`.gb-container-xxx` etc.) — changing breaks pixel-perfect.
- **Empty JS files** (suntyp-slider.js, owl-carousel-custom.js) — harmless, removal not 100% safe.

### Removed:
- wp-emoji scripts/styles/JSON blocks
- RSS feed links, oEmbed links, wp-json/api.w.org links
- EditURI/RSD, dns-prefetch, shortlink, pingback tags
- generator meta, ti-site-data meta
- LiteSpeed Cache comments
- console.log debug statements
- sourceURL debug directives
- Rank Math HTML comments
- speculationrules script blocks

## Current State (as of 2026-04-09)
- **Site is DEPLOYED** at https://output-lime-nine.vercel.app
- **QA audit PASSED** — 0 broken links, 0 missing assets, 0 remaining WP URLs
- **User confirmed** logo fix works, everything looks good
- **GitHub repo:** https://github.com/huzvert/cruzgoldlaw-static (private)
- **Collaborator:** `threestripesdigital` invited with write access
- **Sitemap:** `generate-sitemap.mjs` creates `sitemap.xml` with 69 URLs (base: https://cruzgoldlaw.com). Run `node generate-sitemap.mjs` to regenerate.
- **Webhook placeholder** — `PLACEHOLDER_WEBHOOK_URL` in `js/form-handler.js` needs real URL from client

## What's Left To Do
1. Get client approval on the preview
2. Get webhook URL from client → replace in `js/form-handler.js`
3. Connect to Cloudflare Pages (point domain)
4. Get paid ($250)

## Related Projects
- **optimize360now.com** — Brizy site, 51 pages. Scripts in `/c/Users/yeehuzz/shopif/optimize360/`
- **vernstenlaw.com** — GeneratePress site, 37 pages. Scripts in `/c/Users/yeehuzz/vernstenlaw/`
- Both completed previously for the same client pipeline
