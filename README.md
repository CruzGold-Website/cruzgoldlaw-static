# Cruz Gold Law — Static Site

Production static site for **cruzgoldlaw.com**, deployed on Cloudflare Pages.

- **Repository:** https://github.com/Mbamin/cruzgoldlaw-static
- **Production:** https://cruzgoldlaw.com
- **Hosting:** Cloudflare Pages

---

## Repository Structure

```
/
├── index.html              # Homepage (root)
├── 404.html                # Custom 404 page
├── about/
│   └── index.html          # /about/
├── contact/
│   └── index.html          # /contact/
├── ... 67 more page directories ...
├── css/                    # Stylesheets (root-relative refs: /css/foo.css)
├── js/                     # Scripts
├── images/                 # Images, photos, logos
├── fonts/                  # Web fonts
├── videos/                 # Background videos
├── _headers                # Cloudflare Pages: HTTP response headers
├── _redirects              # Cloudflare Pages: URL redirect rules
├── robots.txt              # Search engine directives
├── sitemap.xml             # XML sitemap (69 URLs)
└── .build-sources/         # Build-time scripts and partials (not deployed publicly)
    ├── _partials/          # Header/footer/head HTML fragments
    ├── _content/           # Source files for new pages — VA edits these
    ├── build-page.mjs      # Page assembly script
    ├── generate-sitemap.mjs
    ├── SOP.md              # Internal SOP (private)
    └── VA-GUIDE.md         # VA workflow guide (private)
```

### URL structure

All pages use trailing-slash URLs: `https://cruzgoldlaw.com/about/`. This matches the original WordPress URL structure and preserves SEO equity (981+ existing internal references and Google's indexed URLs).

Asset paths are root-relative (`/css/foo.css`, `/images/logo.webp`) so they work from any directory depth.

Canonical and og:url tags use absolute production URLs (`https://cruzgoldlaw.com/...`).

---

## Adding new pages

1. `cp .build-sources/_content/example-blog-post.html .build-sources/_content/your-slug.html`
2. Fill in the metadata block at the top (TITLE, DESCRIPTION, CANONICAL, CSS).
3. Write page content below the metadata comment.
4. Run: `npm run build:page .build-sources/_content/your-slug.html`
5. The assembled page appears at `your-slug/index.html` — commit and push.
6. Add the URL to `sitemap.xml`.

> **Heads up:** the `build-page.mjs` script may need updating to output `your-slug/index.html` instead of `your-slug.html` (legacy behavior). Verify before relying on it.

---

## Deployment

Cloudflare Pages auto-deploys every push to `master`:

- **Build command:** *(none — static files)*
- **Build output directory:** `/` (repo root)
- **Production branch:** `master`

Custom domains:
- `cruzgoldlaw.com` (apex, canonical)
- `www.cruzgoldlaw.com` (auto-redirects to apex via Cloudflare Pages)

### First-time deployment checklist

1. Push this branch to GitHub.
2. In Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select repo `Mbamin/cruzgoldlaw-static`, branch `master` (or `feature/cloudflare-pages-migration` for staging).
4. Build command: leave blank. Build output directory: leave blank (defaults to root).
5. Deploy. You'll get a `*.pages.dev` URL — verify the site loads correctly.
6. Add custom domain `cruzgoldlaw.com` in Pages **Custom domains** tab.
7. Add custom domain `www.cruzgoldlaw.com` (Pages auto-301s www → apex).
8. Verify at `https://cruzgoldlaw.com/`.

---

## Forms

`js/form-handler.js` routes form submissions to a Cloudflare Worker (`cg-lead-proxy`) which forwards leads to the CRM. Source detection is path-based (Houston, Philadelphia, Hackensack, Ewing, `-lp` for Google Ads landing pages).

---

## Configuration files

| File | Purpose |
|---|---|
| `_headers` | Cache-Control, security headers, content types |
| `_redirects` | Legacy `.html` URL redirects, WP path blocks |
| `robots.txt` | Allow indexing, point to sitemap |
| `sitemap.xml` | XML sitemap (apex + trailing slash form) |

---

## Migration from WordPress

This repo replaced the legacy WordPress site (Hostinger, IP `89.116.192.66`) on **2026-04-28**. The migration:

- Converted 69 flat HTML files into directory/index.html structure
- Rewrote 2,719 relative asset references to root-relative paths
- Updated canonical/og:url tags to absolute production URLs
- Added `_redirects` for legacy `.html` and WordPress URLs
- See `.build-sources/migrate-to-pages.mjs` for the migration script (kept for reference).

Email infrastructure (Microsoft 365, Resend, Amazon SES) is unaffected — DNS records were preserved during the Cloudflare migration.

---

## Video assets

Large video files are versioned for reproducible deployments. Total ~19 MB. If repo size becomes a concern, move to R2 and update `src` references.
