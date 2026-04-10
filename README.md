# Cruz Gold Law Static Site

Static HTML/CSS/JS version of cruzgoldlaw.com for client review and deployment.

## Links

- Repository: https://github.com/huzvert/cruzgoldlaw-static
- Deployment: https://output-lime-nine.vercel.app/index.html

## What This Repo Contains
Production-ready static pages (*.html)
Shared and modular styles in css/
JavaScript behavior files in js/
Site assets in images/, fonts/, and videos/
Build/migration scripts:
scrape.mjs (source scrape step)
build.mjs (cleanup/modularization step)
generate-sitemap.mjs (sitemap generation)

## NPM Scripts
npm run scrape - Scrape source site into local working folder
npm run build - No-op for static host platforms (safe deploy default)
npm run build:site - Build cleaned static output locally
npm run sitemap - Regenerate sitemap

## Deployment Notes
Deployment target is the static site files in this repository root and asset folders.
Internal/local-only folders are git-ignored (node_modules/, site/, .claude/, .env*).


## Large Video Asset Strategy

Large video files are intentionally versioned for reproducible static deployments.
If repository size becomes a concern, recommended next step is to move videos to object storage/CDN and update file URLs while keeping page markup and behavior unchanged.
