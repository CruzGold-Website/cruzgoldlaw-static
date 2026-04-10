# Cruz Gold Law Static Site

Client-facing static website repository for cruzgoldlaw.com.

## What This Repo Contains

- Production-ready static pages (`*.html`)
- Shared and modular styles in `css/`
- JavaScript behavior files in `js/`
- Site assets in `images/`, `fonts/`, and `videos/`
- Build/migration scripts:
  - `scrape.mjs` (source scrape step)
  - `build.mjs` (cleanup/modularization step)
  - `generate-sitemap.mjs` (sitemap generation)

## NPM Scripts

- `npm run scrape` - Scrape source site into local working folder
- `npm run build` - Build cleaned static output
- `npm run sitemap` - Regenerate sitemap

## Deployment Notes

- Deployment target is the static site files in this repository root and asset folders.
- Internal/local-only folders are git-ignored (`node_modules/`, `site/`, `.claude/`, `.env*`).

## Large Video Asset Strategy

Large video files are intentionally versioned for reproducible static deployments.

If repository size becomes a concern, recommended next step is to move videos to object storage/CDN and update file URLs while keeping page markup and behavior unchanged.
