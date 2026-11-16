# Builds every redesigned page except the home page (build_home.py) and the two ad landing pages (unchanged).
# usage: python -I .build-sources/redesign/build_pages.py [slug ...]
# Content comes from the live page on master (CG_BASE_REF); layout from Danilo's templates (2026-11-16 package).
import sys, os, re, html as H
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import Page, txt, _cls, head_of, meta_fingerprint, REPO, live_html
from blocks import *
from parts import header, footer, CAL, PHONE, GOOGLE, STAR, stars, PHONES, PLUS, MINUS, ARROW

V = "20261117e"
IMG = "/images/redesign/"
CALENDLY_PARAMS = "primary_color=bf992d&amp;text_color=0c152c"

# ---------------------------------------------------------------- page register
SERVICE = "service"; GUIDE = "guide"
GROUPS = {  # breadcrumb group, as in the menu
  "family-immigration-lawyer": "Family &amp; Citizenship", "marriage-green-card-lawyer": "Family &amp; Citizenship",
  "k1-visa-lawyer": "Family &amp; Citizenship", "adjustment-of-status-lawyer": "Family &amp; Citizenship", "citizenship-lawyer": "Family &amp; Citizenship",
  "green-card-lawyer": "Green Cards", "eb-1-visa-lawyer": "Green Cards", "eb2-niw-lawyer": "Green Cards", "eb-3-visa-lawyer": "Green Cards", "eb-5-visa-lawyer": "Green Cards",
  "visa-lawyer": "Visas", "work-visa-lawyer-new-jersey": "Visas", "h1b-visa-lawyer": "Visas", "o1-visa-lawyer": "Visas", "trusted-l-1-visa-lawyer": "Visas",
  "e-2-visa-lawyer-for-investors-entrepreneurs": "Visas", "tn-visa-lawyer": "Visas", "student-visa-lawyer-new-jersey": "Visas",
  "deportation-defense-lawyer": "Deportation &amp; Asylum", "asylum-lawyer": "Deportation &amp; Asylum", "criminal-immigration-lawyer": "Deportation &amp; Asylum", "vawa-lawyer": "Deportation &amp; Asylum",
  "immigration-lawyer-cost": "About",
}
GROUP_HOME = {"Family &amp; Citizenship": "/family-immigration-lawyer/", "Green Cards": "/green-card-lawyer/", "Visas": "/visa-lawyer/",
              "Deportation &amp; Asylum": "/deportation-defense-lawyer/", "About": "/about/", "Locations": None, "Blog": "/blog/"}

# hero headline: the live headline in sentence case, closing phrase in italics (the templates' pattern)
HEADLINE = {
  "green-card-lawyer": "Applying for a green card? Find the right path <em>before you file.</em>",
  "asylum-lawyer": "Afraid to return to your country? Start your asylum case <em>with a free consultation.</em>",
  "citizenship-lawyer": "Your citizenship application, checked by an attorney <em>before USCIS sees it.</em>",
  "criminal-immigration-lawyer": "For non-citizens facing a criminal charge: know the immigration effect <em>before you plead.</em>",
  "deportation-defense-lawyer": "Received a Notice to Appear? Get an attorney ready <em>before your first hearing.</em>",
  "eb-1-visa-lawyer": "Three EB-1 routes to a green card <em>without labor certification.</em>",
  "eb-5-visa-lawyer": "EB-5 green cards for investors <em>and their families.</em>",
  "eb2-niw-lawyer": "Petition for your own green card <em>through the National Interest Waiver.</em>",
  "family-immigration-lawyer": "Bringing a parent, child or sibling <em>to the United States.</em>",
  "h1b-visa-lawyer": "H-1B petitions for employers <em>and the professionals they hire.</em>",
  "immigration-lawyer-cost": "A free consultation and a fee you hear <em>before you decide.</em>",
  "k1-visa-lawyer": "Engaged to a partner abroad and planning <em>the wedding here.</em>",
  "marriage-green-card-lawyer": "A green card for your husband or wife, <em>here or abroad.</em>",
  "o1-visa-lawyer": "O-1 petitions for scientists, founders, <em>artists and athletes.</em>",
  "vawa-lawyer": "Your own path to a green card, <em>without your abuser's signature.</em>",
  "visa-lawyer": "Need a U.S. visa? Start with the one <em>that fits your plans.</em>",
  "immigration-lawyer-new-jersey": "Your family, <em>our priority.</em>",
  "immigration-lawyer-newark-nj": "Facing USCIS or immigration court in Newark? <em>Talk to an attorney first.</em>",
  "immigration-lawyer-philadelphia": "Start with a free call <em>to attorney Zachary Gold.</em>",
  "immigration-lawyer-houston": "Know your options <em>before you file.</em>",
}
# hero photos (design assets; the templates fix only the filler page's photo, the rest are picked by topic and flagged)
PHOTO = {
  "green-card-lawyer": ("couple-hug", "60% 35%"), "family-immigration-lawyer": ("family-hug", "50% 35%"), "marriage-green-card-lawyer": ("family-door", "50% 35%"),
  "k1-visa-lawyer": ("airport-reunion", "58% 50%"), "citizenship-lawyer": ("oath", "50% 30%"), "eb-1-visa-lawyer": ("professional", "50% 25%"),
  "eb2-niw-lawyer": ("professional", "50% 25%"), "eb-5-visa-lawyer": ("beach-flag", "50% 40%"), "visa-lawyer": ("beach-flag", "50% 40%"),
  "h1b-visa-lawyer": ("professional", "50% 25%"), "o1-visa-lawyer": ("professional", "50% 25%"), "deportation-defense-lawyer": ("parents-embrace", "50% 30%"),
  "asylum-lawyer": ("reunion-grandpa", "50% 30%"), "criminal-immigration-lawyer": ("senior-couple", "50% 35%"), "vawa-lawyer": ("family-door", "50% 35%"),
  "immigration-lawyer-cost": ("senior-couple", "50% 35%"),
  "n400-processing-time": ("oath", "50% 35%"), "eb2-niw-requirements": ("professional", "50% 25%"), "o1-visa-requirements": ("beach-flag", "50% 40%"),
  "immigration-attorneys-near-me": ("dad-daughter", "50% 35%"), "traveling-abroad-as-a-non-citizen-key-considerations": ("airport-reunion", "50% 40%"),
  "the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s": ("reunion-grandpa", "50% 35%"),
  "i-751-evidence-checklist": ("couple-hug", "50% 30%"), "common-misconceptions-in-immigration-law": ("family-door", "50% 35%"),
  "cruz-gold-law-trusted-immigration-lawyers-in-new-jersey": ("grandparents", "50% 30%"), "new-jersey-us-immigration-laws": ("family-baby", "50% 40%"),
  "navigating-immigration-changes-under-the-2025-trump-administration": ("parents-embrace", "50% 30%"),
  "understanding-the-rights-of-undocumented-individuals-in-the-usa": ("family-hug", "50% 35%"),
  "immigration-lawyer-new-jersey": ("family-baby", "50% 40%"), "immigration-lawyer-newark-nj": ("reunion-grandpa", "50% 35%"),
  "immigration-lawyer-philadelphia": ("airport-reunion", "58% 50%"), "immigration-lawyer-houston": ("family-door", "50% 35%"),
}
LABEL = {  # guide and article labels (09 gives eight of them)
  "n400-processing-time": "Guide · Citizenship", "eb2-niw-requirements": "Guide · Green cards", "o1-visa-requirements": "Guide · Work visas",
  "immigration-attorneys-near-me": "Guide · Finding a lawyer", "i-751-evidence-checklist": "Guide · Green cards",
  "traveling-abroad-as-a-non-citizen-key-considerations": "Article · Travel",
  "the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s": "Article · Processing times",
  "common-misconceptions-in-immigration-law": "Article · Immigration law", "cruz-gold-law-trusted-immigration-lawyers-in-new-jersey": "Article · New Jersey",
  "new-jersey-us-immigration-laws": "Article · New Jersey", "navigating-immigration-changes-under-the-2025-trump-administration": "Article · Policy changes",
  "understanding-the-rights-of-undocumented-individuals-in-the-usa": "Article · Your rights", "immigration-lawyer-cost": "Guide · Fees",
}
GUIDES = ["n400-processing-time", "i-751-evidence-checklist", "eb2-niw-requirements", "o1-visa-requirements", "immigration-attorneys-near-me",
          "cruz-gold-law-trusted-immigration-lawyers-in-new-jersey", "new-jersey-us-immigration-laws", "common-misconceptions-in-immigration-law",
          "navigating-immigration-changes-under-the-2025-trump-administration", "the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s",
          "traveling-abroad-as-a-non-citizen-key-considerations", "understanding-the-rights-of-undocumented-individuals-in-the-usa"]
SERVICES = ["green-card-lawyer", "deportation-defense-lawyer", "asylum-lawyer", "criminal-immigration-lawyer", "vawa-lawyer", "family-immigration-lawyer",
            "marriage-green-card-lawyer", "k1-visa-lawyer", "citizenship-lawyer", "eb-1-visa-lawyer", "eb2-niw-lawyer", "eb-5-visa-lawyer", "visa-lawyer",
            "h1b-visa-lawyer", "o1-visa-lawyer", "immigration-lawyer-cost", "adjustment-of-status-lawyer", "eb-3-visa-lawyer", "work-visa-lawyer-new-jersey",
            "trusted-l-1-visa-lawyer", "e-2-visa-lawyer-for-investors-entrepreneurs", "tn-visa-lawyer", "student-visa-lawyer-new-jersey"]

# ---------------------------------------------------------------- shared pieces
def crumb(items):
    parts = []
    for i, (label, href) in enumerate(items):
        if i: parts.append("<span aria-hidden=\"true\">›</span>")
        if href: parts.append(f'<a href="{href}">{label}</a>')
        else: parts.append(f'<span aria-current="page">{label}</span>')
    return f'<nav class="crumb" aria-label="Breadcrumb"><div class="wrap">{"".join(parts)}</div></nav>'

def calendly(p):
    if not p.cal_url:
        return None
    url = p.cal_url.replace("&amp;", "&")
    if "primary_color" not in url:
        url += ("&" if "?" in url else "?") + CALENDLY_PARAMS.replace("&amp;", "&")
    src = f' data-source="{p.cal_source}"' if p.cal_source else ""
    return f'<div class="calendly-inline-widget" data-url="{H.escape(url)}"{src} data-resize="true"></div>'

def book_href(p):
    return "#book" if p.cal_url else "/contact/"

def booking_light(p):
    """Booking block of the home template (01), used where the page template has none."""
    w = calendly(p)
    if not w: return ""
    calls = "".join(f'<li><a href="tel:{t}"><span>{c}<span class="cityph">{full[len(c):]}</span></span> <strong>{n}</strong></a></li>' for c, full, t, n in PHONES)
    return f'''<section class="h-book" id="book">
<div class="wrap h-book-in">
<p class="eyebrow">Free consultation</p>
<h2 class="display h-l h-h2">Pick a time to talk with <em>Zachary</em></h2>
<p class="lede">Choose a day below. You speak with attorney Zachary Gold, and you hear the fee before any work begins.</p>
<div class="h-cal">{w}</div>
<div class="h-callus"><span class="h-callus-l"><strong>Prefer to call?</strong></span> <ul>{calls}</ul></div>
</div>
</section>'''

def booking_dark(p, title_html, lede_html):
    """Booking block of the location templates (05, 06)."""
    w = calendly(p)
    if not w: return ""
    return f'''<section id="book" class="book on-dark">
<img src="{IMG}grandparents.webp" alt="" width="600" height="405" loading="lazy">
<div class="book-shade" aria-hidden="true"></div>
<div class="wrap">
<p class="eyebrow light">Free consultation</p>
<h2 class="display h-l h52">{title_html}</h2>
<p class="lede">{lede_html}</p>
<div class="book-cal">{w}</div>
</div>
</section>'''

def mem_strip():
    return f'''<section class="mem-strip"><div class="wrap">
<img src="{IMG}marta.webp" alt="Marta Cruz Gold" width="327" height="490" loading="lazy">
<div class="mem-strip-t"><p class="eyebrow">Remembering our founder</p>
<p class="serif">Marta Cruz Gold (1969–2023) opened the practice in 1995. Her role as a community leader in Mercer County remains an inspiration to us all.</p></div>
</div></section>'''

def cta_right(img, pos, eyebrow, title, lede, btn2, cls=""):
    return f'''<section class="cta-r on-dark{cls}">
<img src="{IMG}{img}.webp" alt="" width="1600" height="1066" loading="lazy" style="object-position:{pos}">
<div class="cta-r-shade" aria-hidden="true"></div>
<div class="wrap"><div class="cta-r-t">
<p class="eyebrow light">{eyebrow}</p>
<h2 class="display h-l h52">{title}</h2>
<p class="lede">{lede}</p>
<div class="btn-row">{btn2}</div>
</div></div>
</section>'''

def toc_items(secs, page=None):
    nav = page.ec.select_one("nav.cg-toc") if page is not None else None
    if nav is not None:
        return [(a["href"].lstrip("#"), txt(a)) for a in nav.find_all("a") if a.get("href", "").startswith("#")]
    items = [(heading_id(h), txt(h)) for h, _ in secs if h is not None and not txt(h).lower().startswith("related")]
    if not items and page is not None:  # older posts have only H3 headings
        items = [(heading_id(b), txt(b)) for b in page.blocks if b.name == "h3"]
    return items

def toc_aside(items, card_title, card_text, href, desk_cls=""):
    lis = "".join(f'<li><a href="#{i}"{" class=\"on\"" if n == 0 else ""}>{H.escape(t)}</a></li>' for n, (i, t) in enumerate(items))
    return f'''<aside class="toc-desk{desk_cls}">
<nav class="toc-box" aria-label="On this page"><p class="eyebrow">On this page</p><ul>{lis}</ul></nav>
<div class="side-cta"><img src="{IMG}zachary.webp" alt="" width="942" height="1008" loading="lazy"><strong>{card_title}</strong><span>{card_text}</span><a class="btn btn-gold" href="{href}">Book a time</a></div>
</aside>'''

def toc_phone(items):
    lis = "".join(f'<li><a href="#{i}">{H.escape(t)}</a></li>' for i, t in items)
    return f'<details class="toc-phone"><summary>On this page{PLUS.format(s=18, w=2.4)}{MINUS.format(s=18, w=2.4)}</summary><ul>{lis}</ul></details>'

def author_box(p):
    a = p.author
    if not a: return ""
    t = a.select_one(".cg-author-bio__text") or a
    return f'''<div class="author">
<img class="hexclip" src="{IMG}zachary-2x.webp" alt="Attorney Zachary Gold" width="784" height="980" loading="lazy">
<div class="author-t"><p class="eyebrow">About the author</p><strong class="serif author-n">Zachary Gold, Esq.</strong><p>{inner(t)}</p></div>
</div>'''

def byline_html(p, role_extra=""):
    role = "Owner and lead attorney"
    if p.byline:
        r = p.byline.select_one(".cg-byline__role")
        if r: role = inner(r)
    return f'''<div class="byline"><img src="{IMG}zachary.webp" alt="" width="942" height="1008"><span><span>Written by <a href="/about/">Zachary Gold, Esq.</a></span><span class="role">{role}</span></span></div>'''

# ---------------------------------------------------------------- article body (07 / 08)
def section_html(h, blocks, page, kind, ctx):
    """One H2 section of a service or guide article."""
    title = txt(h) if h is not None else ""
    tl = title.lower()
    hid = heading_id(h) if h is not None else ""
    h2 = f'<h2 class="display art-h2" id="{hid}">{inner(h)}</h2>' if h is not None else ""
    cls = [_cls(b) for b in blocks]
    # dark "working with" block
    if any("cg-points" in c for c in cls) and tl.startswith("working with"):
        lis = []
        for b in blocks:
            if "cg-points" in _cls(b):
                for li in b.find_all("li", recursive=False):
                    lead, rest = split_lead(li)
                    lead_h = f"<strong>{H.escape(lead)}.</strong> " if lead else ""
                    lis.append(f"<li>{CHECK_GOLD}<span>{lead_h}{rest}</span></li>")
        others = "".join(render(b) for b in blocks if "cg-points" not in _cls(b))
        return f'''<div class="dark-box workwith"><div class="stack gap18"><h2 class="display" id="{hid}">{inner(h)}</h2>{others}<ul>{"".join(lis)}</ul></div>
<img class="hexclip" src="{IMG}zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008" loading="lazy"></div>'''
    # fees block with the booking buttons
    if any("cg-cta-box" in c for c in cls):
        body = "".join(render(b) for b in blocks)
        return f'''<div class="fee-box"><h2 class="display" id="{hid}">{inner(h)}</h2>{body}
<div class="btn-row"><a class="btn btn-gold" href="{book_href(page)}">Book a free consultation</a><a class="btn btn-line" href="tel:+16099248500">Call (609) 924-8500</a></div></div>'''
    # FAQ
    if blocks and all(b.name == "details" for b in blocks):
        return f'<div class="faq"><h2 class="display art-h2" id="{hid}">{inner(h)}</h2>{r_faq(blocks)}</div>'
    # related pages
    if tl.startswith("related") or tl.startswith("where we help"):
        links = "".join(r_chips(b) for b in blocks if b.name in ("ul", "ol"))
        return f'<div class="art-sec gap16"><p class="eyebrow" id="{hid}">{inner(h)}</p>{links}</div>'
    # attorney section
    if any("cg-attorney" in c for c in cls):
        a = next(b for b in blocks if "cg-attorney" in _cls(b))
        ps = "".join(f"<p>{inner(x)}</p>" for x in a.find_all("p"))
        return f'''<div class="art-sec"><h2 class="display art-h2" id="{hid}">{inner(h)}</h2>
<div class="author"><img class="hexclip" src="{IMG}zachary-2x.webp" alt="Attorney Zachary Gold" width="784" height="980" loading="lazy"><div class="author-t">{ps}</div></div></div>'''
    # key takeaways (guides)
    if tl.startswith("key takeaways") and blocks and blocks[-1].name == "ul":
        intro = "".join(render(b) for b in blocks[:-1])
        lis = "".join(f"<li>{CHECK_DEEP}<span>{inner(li)}</span></li>" for li in blocks[-1].find_all("li", recursive=False))
        return f'<div class="art-sec">{intro}<div class="takeaways"><h2 class="eyebrow" id="{hid}">{inner(h)}</h2><ul>{lis}</ul></div></div>'
    # a timeline made of h3 steps (guide template: numbered steps)
    if ctx.get("steps_h3") and title == ctx["steps_h3"]:
        rest, steps = steps_from_h3(blocks)
        return f'<div class="art-sec g22">{h2}{"".join(render(b) for b in rest)}{steps}</div>'
    out = []
    i = 0
    while i < len(blocks):
        b = blocks[i]; c = _cls(b)
        nxt = blocks[i + 1] if i + 1 < len(blocks) else None
        # "What we ask you to collect:" + a plain list -> checklist box
        if b.name == "p" and txt(b).endswith(":") and nxt is not None and nxt.name == "ul" and "cg-list" in _cls(nxt) and not split_lead(_copy(nxt.find("li")))[0]:
            out.append(r_checkbox(nxt, inner(b).rstrip(":"))); i += 2; continue
        if b.name == "ul" and "cg-list" in c and not split_lead(_copy(b.find("li")))[0]:
            out.append(r_checkbox(b, "")); i += 1; continue
        if b.name == "div" and "cg-reviews" in c:
            out.append(r_reviews(b))
            # the note and the rating line under a review grid become one line
            j = i + 1; notes = []
            while j < len(blocks) and blocks[j].name == "p" and any(k in _cls(blocks[j]) for k in ("cg-note", "cg-rating-line")):
                notes.append(inner(blocks[j])); j += 1
            if notes:
                out.append(f'<p class="note">{" ".join(n if n.rstrip().endswith((".", ")", "</a>")) else n for n in notes)}</p>')
            i = j; continue
        if b.name == "ul" and "cg-kv" in c and ctx.get("kv_head") and title in ctx["kv_head"]:
            out.append(r_kv(b, ctx["kv_head"][title])); i += 1; continue
        if b.name == "ol" and "cg-steps" in c:
            out.append(render(b, {"hl": ctx.get("hl", "interview")})); i += 1; continue
        out.append(render(b)); i += 1
    g = " g22" if any(x in "".join(out) for x in ("cards2", "art-rev", "steps-l")) else ""
    return f'<div class="art-sec{g}">{h2}{"".join(out)}</div>'

def _copy(li):
    import copy
    return copy.copy(li) if li is not None else li

def article(page, kind, ctx):
    secs = page.sections()
    out = []
    first = True
    for h, blocks in secs:
        blocks = [b for b in blocks if not (b.name == "nav" and "cg-toc" in _cls(b))]
        if ctx.get("drop_first_figure") and first:
            pass
        if h is None and ctx.get("intro_skip"):
            blocks = blocks[ctx["intro_skip"]:]
        if h is None and not blocks:
            first = False; continue
        out.append(section_html(h, blocks, page, kind, ctx))
        first = False
    return out

# ---------------------------------------------------------------- service (07)
def first_figure_img(page):
    f = next((b for b in page.blocks if b.name == "figure" and b.find("img")), None)
    return f

def build_service(slug):
    p = Page(slug)
    group = GROUPS[slug]
    rewritten = p.cover is not None
    hl, lede = p.hero()
    head_crumb = crumb([("Home", "/"), (group, GROUP_HOME.get(group)), (H.escape(p.h1), None)])
    ctx = {"hl": "interview"}
    if slug == "green-card-lawyer":
        ctx["kv_head"] = {"How much does a green card cost?": ("Form", "USCIS fee")}
    fig = None
    if not rewritten:
        fig = first_figure_img(p)
        if fig is not None:
            p.blocks.remove(fig)
        # older pages: the first paragraph becomes the hero lede
        firstp = next((b for b in p.blocks if b.name == "p" and txt(b)), None)
        lede = inner(firstp) if firstp is not None else ""
        if firstp is not None: p.blocks.remove(firstp)
    if rewritten:
        photo, pos = PHOTO[slug]
        img = f'<img src="{IMG}{photo}.webp" alt="" width="1600" height="1066" fetchpriority="high" style="object-position:{pos}">'
        title_block = f'''<h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1>
<p class="display h-xl p-hero-h">{HEADLINE[slug]}</p>
<p class="lede">{H.escape(lede or "")}</p>'''
    else:
        fi = fig.find("img") if fig is not None else None
        src = fi.get("src") if fi is not None else f"{IMG}professional.webp"
        img = f'<img src="{H.escape(src)}" alt="{H.escape(fi.get("alt", "") if fi is not None else "")}" width="{(fi or {}).get("width", 1024) if fi is not None else 1024}" height="{(fi or {}).get("height", 682) if fi is not None else 682}" fetchpriority="high">'
        title_block = f'''<p class="eyebrow eyeline">{group}</p>
<h1 class="display h-xl p-hero-h">{H.escape(p.h1)}</h1>
<p class="lede">{lede}</p>'''
    trust = f'''<div class="p-trust"><span><strong class="serif">5.0</strong><span class="stars-t" role="img" aria-label="5 out of 5 stars">★★★★★</span>110 Google reviews, Ewing</span>
<span><img src="{IMG}aila-logo.svg" alt="AILA" width="26" height="26">AILA member</span><span class="es">¡Hablamos español!</span></div>'''
    byl = byline_html(p) if p.byline else ""
    hero = f'''<section class="p-hero">
<div class="wrap hero-grid">
<div class="p-hero-t">
{title_block}
<div class="btn-row"><a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-line" href="tel:+16099248500">Call (609) 924-8500</a></div>
{byl or trust}
</div>
<div class="p-hero-m">{img}
<div class="p-float"><span class="eyebrow">At your interview</span><strong>Zachary Gold attends USCIS field office interviews with his clients.</strong></div>
</div>
</div>
</section>'''
    secs = p.sections()
    items = toc_items(secs, p)
    body_parts = article(p, SERVICE, ctx)
    if p.author:
        body_parts.append(author_box(p))
    aside = toc_aside(items, "Talk to Zachary first", "Free consultation. You hear the fee before any work begins.", book_href(p))
    body = f'''<section class="p-body"><div class="wrap">
{aside.replace('class="toc-desk"', 'class="toc-desk svc-aside"')}
<article class="art">{"".join(body_parts)}</article>
</div></section>'''
    if slug == "green-card-lawyer":
        cta = cta_right("oath", "50% 30%", "After the green card", "One firm from your petition <em>to your oath.</em>",
                        "When you qualify, we prepare your citizenship application and get you ready for the interview.",
                        f'<a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="/citizenship-lawyer/">Citizenship &amp; naturalization</a>')
    else:
        cta = cta_right("oath", "50% 30%", "Free consultation", "Take the first step toward <em>peace of mind</em>",
                        "We’re here to help you navigate your legal journey with confidence and care.",
                        f'<a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a>')
    return p, head_crumb + hero + body + booking_light(p) + cta

# ---------------------------------------------------------------- guide (08)
def post_card(slug, excerpt, cta_word=None):
    p = Page(slug)
    photo, pos = PHOTO.get(slug, ("professional", "50% 25%"))
    label = LABEL.get(slug, "Article")
    word = cta_word or ("Read the guide →" if label.startswith("Guide") else "Read the article →")
    return f'''<a class="post-card" href="/{slug}/"><img class="pc-img" src="{IMG}{photo}.webp" alt="" width="600" height="400" loading="lazy" style="object-position:{pos}"><span class="pc-b"><span class="eyebrow">{label}</span><h3 class="serif">{H.escape(p.h1)}</h3><span class="pc-x">{excerpt}</span><span class="pc-go">{word}</span></span></a>'''

def build_guide(slug):
    p = Page(slug)
    photo, pos = PHOTO[slug]
    ctx = {"hl": "last"}
    if slug == "n400-processing-time":
        ctx["steps_h3"] = "N-400 timeline from filing to oath ceremony"
    # drop a lead figure (shown in the header instead) and use the first paragraph as the lede
    fig = first_figure_img(p)
    if fig is not None and p.blocks.index(fig) < 3:
        p.blocks.remove(fig)
    firstp = next((b for b in p.blocks if b.name == "p" and txt(b)), None)
    lede = inner(firstp) if firstp is not None else ""
    if firstp is not None: p.blocks.remove(firstp)
    label = LABEL[slug]
    gcrumb = crumb([("Home", "/"), ("Blog", "/blog/"), (H.escape(p.h1), None)])
    head = gcrumb + f'''<section class="g-head"><div class="wrap hero-grid">
<div class="g-head-t">
<p class="eyebrow eyeline">{label}</p>
<h1 class="display h-xl g-head-h">{H.escape(p.h1)}</h1>
<p class="lede">{lede}</p>
{byline_html(p)}
</div>
<img class="g-head-img" src="{IMG}{photo}.webp" alt="" width="1600" height="1066" fetchpriority="high" style="object-position:{pos}">
</div></section>'''
    secs = p.sections()
    items = toc_items(secs, p)
    parts = article(p, GUIDE, ctx)
    # inline CTA after the third section when the article is long enough (template 08)
    if slug == "n400-processing-time":
        ic_t, ic_p = "Worried about a delay, a notice or a trip abroad?", "Attorney Zachary Gold can review the circumstances and discuss possible next steps."
    else:
        ic_t, ic_p = "Questions about your case?", "Free consultation with attorney Zachary Gold. ¡Hablamos español!"
    inline = f'''<div class="in-cta workwith"><div class="stack gap14"><p class="eyebrow light">Free consultation</p><p class="display" style="font-size:30px;line-height:1.18;color:#fff;margin:0">{ic_t}</p><p>{ic_p}</p>
<div class="btn-row"><a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a></div></div>
<div class="desk-only"><img class="hexclip" src="{IMG}zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008" loading="lazy"></div></div>'''
    intro = 1 if (secs and secs[0][0] is None) else 0
    pos_i = min(len(parts), intro + 3) if len(parts) >= intro + 5 else min(len(parts), intro + 2)
    parts.insert(pos_i, inline)
    # author box before the related chips
    rel_i = next((i for i, x in enumerate(parts) if 'class="chips"' in x), len(parts))
    parts.insert(rel_i, author_box(p))
    body = f'''<section class="p-body g"><div class="wrap">
{toc_phone(items)}
{toc_aside(items, "Questions about your case?", "Free consultation with attorney Zachary Gold. ¡Hablamos español!", book_href(p), "")}
<article class="art art-g">{"".join(parts)}</article>
</div></section>'''
    # more guides: the next three guides in the blog order
    others = [g for g in GUIDES if g != slug]
    i = GUIDES.index(slug)
    pick = (GUIDES[i + 1:] + GUIDES[:i])[:3]
    cards = "".join(post_card(g, EXCERPT.get(g, "")) for g in pick)
    more = f'''<section class="more-g"><div class="wrap">
<div class="review-head"><div><p class="eyebrow">Keep reading</p><h2 class="display h-l h46">More guides</h2></div><a class="btn btn-line" href="/blog/">All articles</a></div>
<div class="g3" style="gap:28px">{cards}</div>
</div></section>'''
    if slug == "n400-processing-time":
        cta = cta_right("family-door", "50% 30%", "Free consultation", "Questions about your citizenship case? <em>Talk to Zachary.</em>",
                        "He reviews your history before you file and prepares you for the interview. ¡Hablamos español!",
                        f'<a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a>', " p104")
    else:
        cta = cta_right("family-door", "50% 30%", "Free consultation", "Have a question about <em>your own case?</em>",
                        "Book a free consultation with attorney Zachary Gold, at our Ewing office or by video. ¡Hablamos español!",
                        f'<a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a>', " p104")
    return p, head + body + more + booking_light(p) + cta

EXCERPT = {}

# ---------------------------------------------------------------- page shell
def page_html(p, inner_html, css=("cg.css", "cg-pages.css"), extra_css=()):
    head, _ = head_of(p.raw, css)
    links = "".join(f'<link rel="stylesheet" href="/css/{c}?v={V}">\n' for c in tuple(css) + tuple(extra_css))
    pre = ('<link rel="preload" href="/fonts/TuGOUUFxWphYQ6YI6q9Xp61FQzxDRKmzr1lWfxk.woff2" as="font" type="font/woff2" crossorigin>\n'
           '<link rel="preload" href="/fonts/mulish-v18-latin.woff2" as="font" type="font/woff2" crossorigin>\n')
    if "<!-- Google tag (gtag.js)" in head:
        head = head.replace("<!-- Google tag (gtag.js)", pre + links + "<!-- Google tag (gtag.js)", 1)
    else:
        head = head.rstrip() + "\n" + pre + links
    body_cls = 'class="cg-site cg-inner"'
    return (head + "</head>\n<body " + body_cls + ">\n<div class=\"cg\">\n" + header(book="#book" if p.cal_url else "/contact/") +
            "\n<main id=\"main\">\n" + inner_html + "\n</main>\n" + footer(book="#book" if p.cal_url else "/contact/") + "\n</div>\n" +
            f'<script src="/js/cg.js?v={V}" defer></script>\n</body>\n</html>\n')

def write(slug, html):
    path = os.path.join(REPO, "404.html" if slug == "404" else os.path.join(slug, "index.html"))
    open(path, "w", encoding="utf8", newline="\n").write(html)

def check_head(p, html):
    before = meta_fingerprint(p.raw); after = meta_fingerprint(html)
    assert before == after, f"head changed on {p.slug}"

BUILDERS = {}
for s in SERVICES: BUILDERS[s] = build_service
for g in GUIDES: BUILDERS[g] = build_guide

def main(slugs):
    import importlib
    for s in slugs:
        b = BUILDERS.get(s)
        if not b:
            print("no builder for", s); continue
        p, inner_html = b(s)
        html = page_html(p, inner_html)
        check_head(p, html)
        write(s, html)
        print("built", s, len(html))

if __name__ == "__main__":
    import locpages
    BUILDERS.update(locpages.BUILDERS)
    main(sys.argv[1:] or list(BUILDERS))
