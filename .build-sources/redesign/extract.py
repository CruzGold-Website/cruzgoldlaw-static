# Reads a live page (from git master, the state before the redesign) and returns its parts:
# <head>, hero texts, the content blocks in order (grouped by H2), author box, Calendly link.
import re, subprocess, os, html as _html
from bs4 import BeautifulSoup, NavigableString, Tag

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BASE_REF = os.environ.get("CG_BASE_REF", "master")

def live_html(slug):
    path = "404.html" if slug == "404" else ("index.html" if slug == "" else slug + "/index.html")
    return subprocess.run(["git", "-C", REPO, "show", f"{BASE_REF}:{path}"], capture_output=True, check=True).stdout.decode("utf8")

def txt(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()

# headings that start a block we do not carry over (old hero booking box, old bottom CTA, old carousels, old memorial)
SKIP_HEADINGS = ("how can we help?", "take the first step towards peace of mind", "stories of client success",
                 "remembering marta cruz gold", "reach out for trusted support", "contact us", "company", "locations")
SKIP_CLASSES = ("wp-block-cover", "footerstyle", "owl-carousel", "gb-loop-item", "calendly-inline-widget", "cg-byline",
                "cg-hero-cta", "cg-trust", "newspost1", "cg-author-bio")
BLOCKS = ("h2", "h3", "h4", "h5", "p", "ul", "ol", "table", "blockquote", "details", "figure", "iframe", "video", "hr")
DIV_BLOCKS = ("cg-reviews", "cg-cta-box", "cg-attorney", "cg-author-bio", "wp-block-table")

def _cls(el):
    return " ".join(el.get("class", [])) if isinstance(el, Tag) else ""

def leaves(root):
    """Content blocks in document order."""
    out = []
    def walk(el):
        for c in el.children:
            if not isinstance(c, Tag) or c.name in ("script", "style", "noscript", "svg"):
                continue
            cl = _cls(c)
            if any(k in cl for k in SKIP_CLASSES):
                continue
            if c.name == "nav" and "cg-toc" in cl:
                out.append(c); continue
            if c.name in BLOCKS or (c.name == "div" and any(k in cl for k in DIV_BLOCKS)):
                out.append(c); continue
            walk(c)
    walk(root)
    # drop the skipped headed regions: from a skip heading up to the next heading of the same or higher level
    res, skipping, lvl = [], False, 9
    for b in out:
        if b.name in ("h2", "h3", "h4"):
            t = txt(b).lower()
            n = int(b.name[1])
            if any(t.startswith(s) for s in SKIP_HEADINGS):
                skipping, lvl = True, n; continue
            if skipping and n <= lvl:
                skipping = False
        if skipping:
            continue
        if b.name == "p" and not txt(b) and not b.find("img"):
            continue
        res.append(b)
    return res

class Page:
    def __init__(self, slug):
        self.slug = slug
        self.raw = live_html(slug)
        self.soup = BeautifulSoup(self.raw, "html.parser")
        body = self.soup.body
        self.h1_el = body.find("h1")
        self.h1 = txt(self.h1_el) if self.h1_el else None
        self.main = body.find("main") or body
        self.cover = self.main.select_one(".wp-block-cover")
        self.ec = self.main.select_one(".entry-content") or self.main
        self.blocks = leaves(self.ec)
        cal = re.findall(r'class="calendly-inline-widget" data-url="([^"]+)"(?: data-source="([^"]*)")?', self.raw)
        self.cal_url, self.cal_source = (cal[0] if cal else (None, None))
        self.author = self.main.select_one(".cg-author-bio")
        self.byline = body.select_one(".cg-byline")

    # hero texts on the rewritten pages: the cover's H2 headline and the paragraph under it
    def hero(self):
        if not self.cover:
            return None, None
        hs = [txt(x) for x in self.cover.find_all(["h2", "p"]) if txt(x) and not x.find_parent(class_=re.compile("cg-hero-cta|cg-trust"))]
        hs = [h for h in hs if h != self.h1]
        return (hs[0] if hs else None), (hs[1] if len(hs) > 1 else None)

    def sections(self):
        """[(h2 element or None, [blocks])] split at each H2."""
        secs, cur = [], (None, [])
        for b in self.blocks:
            if b.name == "h2":
                secs.append(cur); cur = (b, [])
            else:
                cur[1].append(b)
        secs.append(cur)
        return [s for s in secs if s[0] is not None or s[1]]

def head_of(raw, css, js_after=""):
    """The live <head> with the old theme CSS/JS removed and the redesign CSS added.
    Title, meta, canonical, Open Graph, JSON-LD, analytics, favicons and calendly-init stay byte for byte."""
    head = raw[:raw.index("</head>")]
    head = re.sub(r'<link[^>]+rel="preload"[^>]*>\n?', "", head)
    head = re.sub(r'[ \t]*<link[^>]+rel=["\']stylesheet["\'][^>]*>\n?', "", head)
    head = re.sub(r'<style[^>]*>.*?</style>\n?', "", head, flags=re.S)
    head = re.sub(r'<noscript>.*?</noscript>\n?', "", head, flags=re.S)
    def keep_script(m):
        s = m.group(0)
        if "application/ld+json" in s or "googletagmanager" in s or "google_gtagjs" in s or "calendly-init" in s:
            return s
        return ""
    head = re.sub(r'<script\b[^>]*>.*?</script>\n?', keep_script, head, flags=re.S)
    return head, css

def meta_fingerprint(raw):
    head = raw[:raw.index("</head>")]
    return re.findall(r'<title>.*?</title>|<meta [^>]*>|<link rel="canonical"[^>]*>|<script type="application/ld\+json"[^>]*>.*?</script>', head, flags=re.S)
