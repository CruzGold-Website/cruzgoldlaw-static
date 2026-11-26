# Reads a live page (from git master, the state before the redesign) and returns its parts:
# <head>, hero texts, the content blocks in order (grouped by H2), author box, Calendly link.
import re, subprocess, os, html as _html
from bs4 import BeautifulSoup, NavigableString, Tag

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BASE_REF = os.environ.get("CG_BASE_REF", "master")

# Copy changes for the redesign that are not on master yet: slug -> [(old, new, times old must appear)].
# The build stops if a text is not found the expected number of times (master changed), so nothing is skipped quietly.
EDITS = {
  # Nov 24 call, Danilo's list 1 items 8 and 9: the "Ways to pay" row and the FAQ answer; the medical exam leaves the no-fee row
  "immigration-lawyer-cost": [
    ("We accept credit cards, and when money is tight we try to set up a payment plan.",
     "We accept all major credit cards and offer payment plans through Affirm, subject to approval.", 2),
    ('<span class="cg-kv-k">Affidavit of support (Form I-864) and medical exam form (Form I-693)</span>',
     '<span class="cg-kv-k">Affidavit of support (Form I-864)</span>', 1)],
  # item 6: a line before each "cases we handle" list
  "deportation-defense-lawyer": [
    ('id="deportation-cases-we-handle">Deportation cases we handle</h2>\n',
     'id="deportation-cases-we-handle">Deportation cases we handle</h2>\n<p>We take deportation cases on a case-by-case basis.</p>\n', 1)],
  "asylum-lawyer": [
    ('id="asylum-cases-we-handle">Asylum cases we handle</h2>\n',
     'id="asylum-cases-we-handle">Asylum cases we handle</h2>\n<p>We take asylum cases on a case-by-case basis.</p>\n', 1)],
}

def live_html(slug):
    path = "404.html" if slug == "404" else ("index.html" if slug == "" else slug + "/index.html")
    raw = subprocess.run(["git", "-C", REPO, "show", f"{BASE_REF}:{path}"], capture_output=True, check=True).stdout.decode("utf8")
    for old, new, n in EDITS.get(slug, ()):
        assert raw.count(old) == n, f"{slug}: expected {n}x {old[:60]!r}, found {raw.count(old)}"
        raw = raw.replace(old, new)
    return raw

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
        # read the attributes, not a regex: attribute order differs between pages (i-751 has data-source first)
        cal = [(w.get("data-url"), w.get("data-source") or "") for w in self.soup.select(".calendly-inline-widget") if w.get("data-url")]
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
