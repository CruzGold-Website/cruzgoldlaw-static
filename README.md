# Cruz Gold Law — Static Site

Production-ready static HTML/CSS/JS build of cruzgoldlaw.com.

- **Repository:** https://github.com/huzvert/cruzgoldlaw-static
- **Live preview:** https://output-lime-nine.vercel.app/index.html

---

## Repository Structure

```
/
├── index.html              # Homepage
├── *.html                  # All other pages (flat structure)
├── css/
│   ├── inline-shared.css   # Shared extracted inline styles
│   ├── theme-inline.css    # GeneratePress theme variables
│   ├── custom-overrides.css # Site Customizer overrides
│   ├── gb-*.css            # Per-page GenerateBlocks styles
│   └── ...                 # Third-party CSS (Owl Carousel, Swiper, etc.)
├── js/
│   ├── form-handler.js     # Form → webhook (set WEBHOOK_URL before deploy)
│   └── ...                 # Third-party JS (jQuery, Swiper, etc.)
├── images/
├── fonts/
├── videos/
├── _partials/              # Shared HTML fragments (do not edit during page builds)
│   ├── head-template.html
│   ├── header.html
│   └── footer.html
├── _content/               # Source files for new pages — VA edits these
│   └── example-blog-post.html
├── build-page.mjs          # Assembles new pages from partials + content file
├── build.mjs               # Original scrape-to-static build pipeline
├── scrape.mjs              # Website scraper
├── generate-sitemap.mjs    # Sitemap generator
└── sitemap.xml
```

---

## Adding New Pages

1. Copy `_content/example-blog-post.html` → `_content/your-page-slug.html`
2. Fill in the metadata block at the top (TITLE, DESCRIPTION, CANONICAL, CSS)
3. Write page content below the metadata comment
4. Run the build: `npm run build:page _content/your-page-slug.html`
5. The assembled page appears at `your-page-slug.html` — commit and push

---

## NPM Scripts

| Script | What it does |
|---|---|
| `npm run build:page _content/file.html` | Assemble a new page from partials + content file |

---

## Form Setup

`js/form-handler.js` — routes form submissions to location-specific Zapier webhooks (NJ, Philadelphia, Houston). Webhook URLs are configured and live.

---

## Deployment

Deployed via Vercel (static output). No build step required — Vercel serves the HTML files directly from the repo root.

Git-ignored: `node_modules/`, `site/`, `.vercel/`, `.env*`

---

## Video Assets

Large video files are versioned for reproducible deployments. If repo size becomes a concern, move videos to a CDN and update `src` references in the affected HTML pages.
