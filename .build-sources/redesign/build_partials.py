# Writes the redesigned header, footer and head template into .build-sources/_partials/ (build notes, part 3:
# "Header, menu and footer are copied into every page and into _partials/header.html and footer.html").
# head-template.html is what build-page.mjs (new blog posts) fills in; it loads the same CSS as the built pages.
# usage: python -I .build-sources/redesign/build_partials.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parts import header, footer
from build_pages import V, REPO

P = os.path.join(REPO, ".build-sources", "_partials")
head_note = ("<!-- ====== HEADER (redesign 2026-11) ======\n"
             "     The page needs <body class=\"cg-site cg-inner\"> and, in <head>, /css/cg.css and /css/cg-pages.css with ?v=" + V + ".\n"
             "     Pages that book with Calendly keep href=\"#book\"; pages without a calendar link /contact/ instead. -->\n")
hdr = head_note + '<div class="cg">\n' + header(book="#book") + "\n<main id=\"main\">\n"
ftr = ("</main>\n" + footer(book="#book") + "\n</div>\n" + f'<script src="/js/cg.js?v={V}" defer></script>\n</body>\n</html>\n')
head_tpl = f'''<!DOCTYPE html>
<html lang="en-US" prefix="og: https://ogp.me/ns#"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{{{TITLE}}}}</title>
<meta name="description" content="{{{{DESCRIPTION}}}}">
<meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large">
<link rel="canonical" href="{{{{CANONICAL}}}}">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="{{{{OG_TYPE}}}}">
<meta property="og:title" content="{{{{TITLE}}}}">
<meta property="og:description" content="{{{{DESCRIPTION}}}}">
<meta property="og:url" content="{{{{CANONICAL}}}}">
<meta property="og:site_name" content="Cruz Gold &amp; Associates">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{{{TITLE}}}}">
<meta name="twitter:description" content="{{{{DESCRIPTION}}}}">
{{{{HEAD_EXTRA}}}}
<link rel="preload" href="/fonts/TuGOUUFxWphYQ6YI6q9Xp61FQzxDRKmzr1lWfxk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/mulish-v18-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/cg.css?v={V}">
<link rel="stylesheet" href="/css/cg-pages.css?v={V}">
{{{{PAGE_CSS}}}}
<!-- Google tag (gtag.js) snippet added by Site Kit -->
<script async id="google_gtagjs-js" src="https://www.googletagmanager.com/gtag/js?id=GT-K4TGJWQ6"></script>
<script id="google_gtagjs-js-after">
window.dataLayer = window.dataLayer || [];function gtag(){{dataLayer.push(arguments);}}
gtag("set","linker",{{"domains":["cruzgoldlaw.com"]}});
gtag("js", new Date());
gtag("set", "developer_id.dZTNiMT", true);
gtag("config", "GT-K4TGJWQ6");
</script>
<link rel="icon" href="/images/Favicon_legal_Services.png" sizes="32x32">
<link rel="icon" href="/images/Favicon_legal_Services.png" sizes="192x192">
<link rel="apple-touch-icon" href="/images/Favicon_legal_Services.png">
<meta name="msapplication-TileImage" content="/images/Favicon_legal_Services.png">
<script defer src="/js/calendly-init.v2.js?v=20261003"></script>
</head>
'''
for name, html in (("header.html", hdr), ("footer.html", ftr), ("head-template.html", head_tpl)):
    open(os.path.join(P, name), "w", encoding="utf8", newline="\n").write(html)
    print("wrote", name, len(html))
