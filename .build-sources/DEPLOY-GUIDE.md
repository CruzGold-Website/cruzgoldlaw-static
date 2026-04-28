# Cloudflare Pages Deployment Guide

Step-by-step guide to deploy the migrated site to Cloudflare Pages and cut over from WordPress.

## Status (2026-04-28)

- ✅ DNS already migrated GoDaddy → Cloudflare nameservers
- ✅ Site restructured for Pages-compatible directory/trailing-slash URLs
- ✅ All asset refs converted to root-relative
- ✅ Canonical and og:url tags set to absolute production URLs
- ✅ `_redirects`, `_headers`, `robots.txt`, `404.html` configured
- ✅ Migration committed locally on branch `feature/cloudflare-pages-migration`
- ⏳ **Branch needs to be pushed** (auth issue: see "1. Push the branch" below)
- ⏳ Cloudflare Pages project not yet created
- ⏳ Custom domain not yet bound

---

## 1. Push the branch

The migration is committed on `feature/cloudflare-pages-migration`. The current `gh` CLI is authenticated as `threestripesdigital`, but the repo lives at `github.com/Mbamin/cruzgoldlaw-static` — push fails with 403.

**Pick one option:**

### Option A: Authenticate as Mbamin (recommended)

```bash
gh auth login
# Choose GitHub.com → HTTPS → Authenticate via browser/token as Mbamin
git push -u origin feature/cloudflare-pages-migration
```

### Option B: Add threestripesdigital as collaborator

1. Go to https://github.com/Mbamin/cruzgoldlaw-static/settings/access
2. Add `threestripesdigital` as a collaborator with write access
3. Run `git push -u origin feature/cloudflare-pages-migration`

### Option C: Push from the Mbamin account on a different machine

- Pull this repo state somewhere the Mbamin credentials are active
- Push the branch from there

---

## 2. Create Cloudflare Pages project

Once the branch is pushed:

1. Go to https://dash.cloudflare.com → **Workers & Pages**
2. Click **Create application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare on GitHub (Mbamin account if not already linked)
4. Select the repo: **Mbamin/cruzgoldlaw-static**
5. Configure the build:
   - **Project name:** `cruzgoldlaw` (or any unique slug; the *.pages.dev URL uses it)
   - **Production branch:** `master`
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` *(or leave blank — defaults to repo root)*
   - **Root directory:** `/` *(default)*
   - **Environment variables:** none needed
6. Click **Save and deploy**.

The first deploy takes 1-2 minutes. You'll get a URL like `https://cruzgoldlaw.pages.dev`.

> 💡 Recommendation: deploy the `feature/cloudflare-pages-migration` branch first as a **preview deployment** to verify everything works, BEFORE merging to master and going live.
>
> To deploy a branch as a preview: in Pages settings, set "Preview branch" to `feature/cloudflare-pages-migration`. The deploy URL will be `https://feature-cloudflare-pages-migration.cruzgoldlaw.pages.dev` or similar.

---

## 3. Verify on the *.pages.dev URL

Before binding the production domain, sanity-check on the preview URL:

```bash
# Adjust the URL to match what Pages assigned
PAGES_URL="https://cruzgoldlaw.pages.dev"

# Expected behavior
curl -sI "$PAGES_URL/"             # 200
curl -sI "$PAGES_URL/about/"       # 200
curl -sI "$PAGES_URL/contact/"     # 200
curl -sI "$PAGES_URL/about.html"   # 301 -> /about/
curl -sI "$PAGES_URL/about"        # 301 -> /about/
curl -sI "$PAGES_URL/css/inline-shared.css"        # 200
curl -sI "$PAGES_URL/images/cruzgoldlaw-logo.webp" # 200
curl -sI "$PAGES_URL/sitemap.xml"  # 200
curl -sI "$PAGES_URL/robots.txt"   # 200
curl -sI "$PAGES_URL/nonexistent"  # 404 (should serve our 404.html)
```

Open `$PAGES_URL` in a browser and:
- Click through every nav link — verify they go to `/foo/` style URLs
- Verify CSS, images, fonts load (no broken styling, no broken images in dev tools)
- Submit a contact form — verify it routes to the CRM (check the lead arrives)
- Test the carousel/slider on the homepage
- Test mobile responsiveness

---

## 4. Bind the custom domain

Once the preview URL works:

1. In Pages project → **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter `cruzgoldlaw.com` (apex) — Pages will detect existing DNS records
4. Pages will **automatically update DNS records** in your Cloudflare account:
   - Removes the existing A records for `cruzgoldlaw.com` (pointing at WordPress 89.116.192.66)
   - Adds CNAME flattening to point at the Pages project
5. Repeat for `www.cruzgoldlaw.com`:
   - Cloudflare Pages will auto-301 `www.cruzgoldlaw.com` → `cruzgoldlaw.com`
   - Or you can configure `www` to also serve content (then you'd want a redirect rule)

This is **the cutover moment**. From this point on, visitors hit Cloudflare Pages instead of WordPress.

> ⚠️ The current Cloudflare proxy SSL handshake is failing for the WordPress origin — `curl https://cruzgoldlaw.com/` fails with `sslv3 alert handshake failure`. This is because Cloudflare's SSL mode is likely "Full (strict)" but the WordPress origin doesn't have a matching cert. Once Pages takes over the domain, this issue disappears (Pages handles SSL natively).

SSL provisioning for `cruzgoldlaw.com` on Pages takes 5-10 minutes after the domain is bound.

---

## 5. Final verification (post-cutover)

```bash
# Real production URLs
curl -sI https://cruzgoldlaw.com/                      # 200
curl -sI https://cruzgoldlaw.com/about/                # 200
curl -sI https://www.cruzgoldlaw.com/                  # 301 -> https://cruzgoldlaw.com/
curl -sI https://cruzgoldlaw.com/about.html            # 301 -> /about/
curl -sI https://cruzgoldlaw.com/wp-admin/             # 301 -> /
curl -sI https://cruzgoldlaw.com/sitemap.xml           # 200
curl -sI https://cruzgoldlaw.com/css/inline-shared.css # 200
```

In a browser, hit:
- https://cruzgoldlaw.com/
- https://cruzgoldlaw.com/about/
- https://cruzgoldlaw.com/contact/
- https://www.cruzgoldlaw.com/ (should redirect to apex)

Submit a test contact form and verify the lead arrives in the CRM.

---

## 6. Email verification (CRITICAL)

After cutover, verify email still works (Cloudflare Pages does NOT touch email DNS records — they should be unchanged from your earlier setup):

```bash
# Verify MX still points to Microsoft 365
dig MX cruzgoldlaw.com +short
# Expected: 0 cruzgoldlaw-com.mail.protection.outlook.com.

# Verify SPF
dig TXT cruzgoldlaw.com +short | grep spf
# Expected: "v=spf1 include:spf.protection.outlook.com -all"

# Verify Resend DKIM
dig TXT resend._domainkey.cruzgoldlaw.com +short | grep -c "p=" 
# Expected: 1 (DKIM key present)

# Verify Amazon SES
dig MX send.cruzgoldlaw.com +short
# Expected: 10 feedback-smtp.us-east-1.amazonses.com.
```

Then send a test email:
- **Inbound**: Send an email from Gmail to `info@cruzgoldlaw.com` — verify it arrives in Outlook
- **Outbound**: Send an email from `info@cruzgoldlaw.com` to a Gmail account — check it doesn't land in spam (SPF/DKIM/DMARC pass)
- **Resend**: Trigger a transactional email (signup, contact form confirmation if applicable)
- **Amazon SES**: If you use SES for any sending, send a test through it

---

## 7. Search Console reconciliation

After cutover and SSL provisioning:

1. Go to https://search.google.com/search-console
2. Submit the new sitemap: `https://cruzgoldlaw.com/sitemap.xml`
3. Use the **URL Inspection** tool to fetch a few key pages and confirm Google can access them
4. Monitor **Coverage** report for any new 404s in the next 1-2 weeks

---

## 8. Keep WordPress as rollback

**Do not** cancel the WordPress hosting yet. Keep it running on `89.116.192.66` for **at least 2-4 weeks** post-cutover.

If something breaks on Cloudflare Pages, you can roll back instantly by:
1. In Cloudflare Pages: remove the `cruzgoldlaw.com` custom domain
2. In Cloudflare DNS: re-add A records for `cruzgoldlaw.com` and `www` pointing to `89.116.192.66`
3. Wait 1-5 minutes for DNS propagation

After 2-4 weeks of confirmed working with no issues, **then** cancel WordPress hosting.

---

## 9. Optional: tighten the redirects

The `_redirects` file currently has explicit per-page rules for the 68 known pages. Once you've confirmed everything works for a week or two, you can replace those with a glob rule:

```
/*.html  /:splat/  301
```

…to catch any future `.html` URL automatically. The current explicit rules are safer for the cutover (no risk of bad regex).

---

## Troubleshooting

### Pages preview shows broken styling
- Hard-refresh in browser (Cmd+Shift+R / Ctrl+Shift+R)
- Open dev tools → Network tab → check for failing CSS/JS requests
- Confirm `/css/inline-shared.css` returns 200 directly: `curl -sI https://YOUR-PAGES-URL/css/inline-shared.css`

### `*.pages.dev` shows "Project not found"
- The project name conflicts with another Cloudflare account
- Pick a different unique name in Pages settings

### Custom domain stuck on "Verifying"
- Check that Cloudflare can update your DNS — your domain MUST be on Cloudflare nameservers (you've already done this)
- Wait 10 minutes; sometimes provisioning takes longer than the UI suggests

### Forms break after deploy
- The CRM Worker (`cg-lead-proxy`) runs independently of Pages and shouldn't be affected
- Open dev tools → Network → submit form → check the request URL is the Worker URL
- Verify the Worker is still deployed at `https://cg-lead-proxy.bilal-17f.workers.dev/submit`

### `cruzgoldlaw.com` returns SSL error after binding domain
- Wait 10 minutes for cert provisioning
- Check Pages dashboard → Custom domains → SSL status

### Email stops working after cutover
- Check DNS records haven't been touched: `dig MX cruzgoldlaw.com +short`
- The MX record should still be `0 cruzgoldlaw-com.mail.protection.outlook.com.`
- If missing: re-add the email DNS records in Cloudflare DNS (they're in your `~/Downloads/cruzgoldlaw.com.txt` export)

---

## Rollback procedure

If you need to revert to WordPress:

1. **In Cloudflare Pages:** Remove `cruzgoldlaw.com` from Custom Domains
2. **In Cloudflare DNS:** Re-add the A records:
   - `cruzgoldlaw.com` A `89.116.192.66` (Proxied or DNS-only as you prefer)
   - `www` A `89.116.192.66`
3. Wait 1-5 minutes for propagation
4. WordPress is back live

The git branch `feature/cloudflare-pages-migration` and the Cloudflare Pages project remain intact — you can re-enable them when ready.

---

## Reference: file structure summary

```
69 page directories (about/, contact/, blog/, etc.) each containing index.html
1 root index.html (homepage)
1 404.html
css/   888 KB
js/    368 KB
images/  64 MB
fonts/  1.4 MB
videos/  19 MB

_headers     (Pages config: cache, security headers)
_redirects   (Pages config: 68 .html redirects + WP path blocks)
robots.txt   (search engines)
sitemap.xml  (69 URLs, apex + trailing slash)

.build-sources/  (NOT deployed publicly — internal build tools and docs)
```

Total deploy size: ~177 MB. Cloudflare Pages limits: 25k files, 25 MB per file. We're at 377 files, largest 4.8 MB. Comfortably within limits.
