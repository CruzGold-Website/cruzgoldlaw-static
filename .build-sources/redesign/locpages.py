# Builders for templates 05, 06 (locations), 09 (blog list), 10 (about), 11 (contact), 12 (testimonials),
# 13 (text pages), 14 (sitemap) and 15 (404). Imported by build_pages.py.
import re, html as H
import build_pages as B
from build_pages import (Page, txt, _cls, IMG, crumb, calendly, book_href, booking_light, booking_dark, mem_strip, cta_right,
                         toc_aside, toc_phone, author_box, byline_html, section_html, first_figure_img, PHOTO, HEADLINE,
                         LABEL, GROUPS)
from blocks import *

BUILDERS = {}

def map_src(which):
    raw = B.live_html({"ewing": "immigration-lawyer-new-jersey", "philadelphia": "immigration-lawyer-philadelphia", "houston": "immigration-lawyer-houston"}[which])
    m = re.search(r'<iframe title="(Map: Cruz Gold &amp; Associates, [^"]+)" src="([^"]+)"', raw)
    return m.group(1), m.group(2)

def map_box(which, cls="map-box"):
    title, src = map_src(which)
    return f'<div class="{cls}"><iframe title="{title}" src="{src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>'

OFFICES = [
  ("Ewing, NJ", "830 Bear Tavern Rd, Suite 108", "Ewing Township, NJ 08628", "+16099248500", "(609) 924-8500", "https://www.google.com/maps?cid=2806749106084288155"),
  ("Hackensack, NJ", "831 Main St", "Hackensack, NJ 07601", "+16099248500", "(609) 924-8500", "https://www.google.com/maps?cid=12247082169007836280"),
  ("Philadelphia, PA", "123 S Broad St, Suite 1529", "Philadelphia, PA 19109", "+12156082131", "(215) 608-2131", "https://www.google.com/maps?cid=11561832743529919948"),
  ("Houston, TX", "2808 Caroline St #103-F", "Houston, TX 77004", "+18329247490", "(832) 924-7490", "https://www.google.com/maps?cid=7409599879789718386"),
]

def rv_card(text, name, gold=False, marta=False, sub="Google review"):
    ini = "".join(w[0] for w in name.split()[:2]).upper()
    mt = '<span class="eyebrow">About Marta Cruz Gold</span>' if marta else ""
    s = f"<span>{sub}</span>" if sub else ""
    return (f'<figure class="review{" marta" if marta else ""}">{mt}<span class="stars-t" role="img" aria-label="5 out of 5 stars">★★★★★</span>'
            f'<blockquote class="serif rq">{text}</blockquote><figcaption class="rev-cap"><span class="av{" gold" if gold else ""}" aria-hidden="true">{ini}</span>'
            f'<span><strong>{H.escape(name)}</strong>{s}</span></figcaption></figure>')

# location reviews: 05 shows Anchal Kannambadi, Andrew and Ali Jamil (cut as in the design); the slider continues with
# three more of the site's testimonials, word for word
LOC_REVIEWS = [
  ("From the start of our process they have been so helpful, kind and patient with everything … They really do treat us like family which can be rare in the legal environment!", "Anchal Kannambadi"),
  ("Zachary helped me navigate a confusing immigration issue for my parents and I could not have been happier. His professionalism and respect for his clients is evident.", "Andrew"),
  ("I felt compelled to write this review because it is the least I can do to thank him, and let others know that there’s an attorney who’s not going to take advantage of the client’s situation.", "Ali Jamil"),
  ("Honestly, I would recommend this Lawyer, Zachary Cruz to anyone who wants to file for immigration in the US. He’s very organized, professional and proactive. He’ll get the job done within a reasonable amount of time.", "Agnes Kamara"),
  ("Mr Cruz, give one and one consultation, he literally make you feel like family. He gives you real time feedback, counsel, and breakdown the process. I recommend you use this law firm for all you immigration issues.", "Martin Sampson"),
  ("Zachary Gold is an amazing attorney. I cannot thank him enough for his hard work and dedication! 5 stars is not enough-I wish I could give him more!", "Vanessa Noel"),
]

def why_items(ul, first_pad=False):
    out = []
    for i, li in enumerate(ul.find_all("li", recursive=False)):
        lead, rest = split_lead(li)
        h3 = f"<h3>{H.escape(lead)}</h3>" if lead else ""
        pad = " first-pad" if (first_pad and i == 0) else ""
        out.append(f'<div class="why-item{pad}"><span class="why-ic" aria-hidden="true">{WHY_ICONS[i % 4]}</span><div>{h3}<p>{rest}</p></div></div>')
    return "".join(out)

def quote_fig(bq, big=False):
    p = bq.find("p"); cite = bq.find("cite")
    t = inner(p) if p else inner(bq)
    c = inner(cite) if cite else ""
    if not c:
        m = re.match(r"^(.*”)\s*(.+)$", t)
        if m: t, c = m.group(1), m.group(2)
    return f'<figure class="why-q{" big" if big else ""}"><span class="stars-t" role="img" aria-label="5 out of 5 stars">★★★★★</span><blockquote class="serif">{t}</blockquote><figcaption>{c}</figcaption></figure>'

def sec(p, prefix):
    for h, bl in p.sections():
        if h is not None and txt(h).lower().startswith(prefix.lower()):
            return h, bl
    return None, []

def faq_block(p):
    for h, bl in p.sections():
        if h is not None and bl and all(b.name == "details" for b in bl):
            return h, bl
    return None, []

def prose_section(sections, page):
    if not sections: return ""
    parts = [section_html(h, bl, page, B.SERVICE, {"hl": "interview"}) for h, bl in sections]
    return f'<section class="prose-sec"><div class="wrap"><div class="art">{"".join(parts)}</div></div></section>'

def loc_crumb(town):
    return f'<nav class="crumb" aria-label="Breadcrumb"><div class="wrap"><a href="/">Home</a><span aria-hidden="true">›</span><span>Locations</span><span aria-hidden="true">›</span><span aria-current="page">{town}</span></div></nav>'

# ---------------------------------------------------------------- 05: city with an office
CITY = {
  "immigration-lawyer-new-jersey": dict(city="New Jersey", office="Our New Jersey office", street="830 Bear Tavern Road, Suite 108", line="Ewing Township, NJ 08628 · just off I-295",
       tel="+16099248500", teln="(609) 924-8500", dirs="https://www.google.com/maps?cid=2806749106084288155", call="Call the Ewing office", map="ewing"),
  "immigration-lawyer-philadelphia": dict(city="Philadelphia", office="Our Philadelphia office", street="123 S Broad St, Suite 1529", line="Philadelphia, PA 19109",
       tel="+12156082131", teln="(215) 608-2131", dirs="https://www.google.com/maps?cid=11561832743529919948", call="Call the Philadelphia office", map="philadelphia"),
  "immigration-lawyer-houston": dict(city="Houston", office="Our Houston office", street="2808 Caroline St #103-F", line="Houston, TX 77004 · south of downtown",
       tel="+18329247490", teln="(832) 924-7490", dirs="https://www.google.com/maps?cid=7409599879789718386", call="Call the Houston office", map="houston"),
}

def loc_reviews(title):
    cards = "".join(rv_card(t, n, gold=(i % 2 == 1)) for i, (t, n) in enumerate(LOC_REVIEWS))
    return f'''<section class="l-rev"><div class="wrap">
<div class="review-head"><div class="stack gap16" style="max-width:640px"><p class="eyebrow">Client stories</p><h2 class="display h-l h50">{title}</h2></div>
<span class="arrows"><button type="button" class="sl-prev" aria-label="Previous reviews" disabled>‹</button><button type="button" class="sl-next" aria-label="Next reviews">›</button></span></div>
<div class="slide3" data-slider tabindex="0" aria-label="Client reviews">{cards}</div>
<p class="note" style="margin-top:22px">Results may vary depending on your particular facts and legal circumstances.</p>
</div></section>'''

def heard_section(h, inner_html, hex_pos="left:-80px;bottom:-80px", lede=""):
    head = f'<h2 class="display h-l h50" id="{heading_id(h)}">{inner(h)}</h2>' if h is not None else ""
    return f'''<section class="l-heard on-dark"><div class="hexbg-white l-heard-hex" style="{hex_pos}" aria-hidden="true"></div><div class="wrap">
<div class="sec-intro"><p class="eyebrow light">Where your case is heard</p>{head}{lede}</div>
{inner_html}</div></section>'''

def build_loc_office(slug):
    p = Page(slug)
    c = CITY[slug]
    hl, lede = p.hero()
    photo, pos = PHOTO[slug]
    out = [loc_crumb(c["city"])]
    out.append(f'''<section class="l-hero"><div class="wrap"><div class="hero-grid">
<div class="l-hero-t">
<h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1>
<p class="display h-xl l-hero-h">{HEADLINE[slug]}</p>
<p class="lede">{H.escape(lede or "")}</p>
<div class="btn-row"><a class="btn btn-gold" href="#book">Book a free consultation</a><a class="btn btn-line" href="tel:{c["tel"]}">{c["call"]}</a></div>
<div class="l-rate">{GOOGLE26}<span>More than 90 Google reviews of our Ewing office average <strong>5.0 stars</strong>.</span></div>
</div>
<div class="l-hero-m"><img src="{IMG}{photo}.webp" alt="" width="1200" height="800" fetchpriority="high" style="object-position:{pos}">
<div class="l-office"><div class="l-office-t"><span class="eyebrow light">{c["office"]}</span><strong class="serif">{c["street"]}</strong>
<span class="sub">{c["line"]}</span><a href="tel:{c["tel"]}">{c["teln"]}</a></div><a class="btn btn-gold" href="{c["dirs"]}" target="_blank" rel="noopener">Directions</a></div></div>
</div></div></section>''')
    used = set()
    h, bl = sec(p, "Why work with")
    if h is not None:
        used.add(id(h))
        ul = next(b for b in bl if b.name == "ul")
        figs = "".join(quote_fig(q) for q in bl if q.name == "blockquote")
        out.append(f'''<section class="l-why"><div class="wrap split split-56">
<div class="l-why-l"><p class="eyebrow">Why work with us</p><h2 class="display h-l h50" id="{heading_id(h)}">{inner(h)}</h2>
<img src="{IMG}zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008" loading="lazy"></div>
<div class="l-why-r">{why_items(ul)}<div class="g2" style="gap:18px">{figs}</div></div>
</div></section>''')
    if slug == "immigration-lawyer-new-jersey":
        hh, hb = sec(p, "Where your")
        used.add(id(hh))
        cards = [("USCIS", "Newark Field Office", "Peter W. Rodino Federal Building, 970 Broad Street. Green card and citizenship interviews for most of northern and central New Jersey."),
                 ("USCIS", "Mount Laurel Field Office", "For applicants around Ewing and Trenton and in the southern counties, such as Camden, Burlington and Atlantic."),
                 ("Immigration court", "Newark Immigration Court", 'In the same federal building on Broad Street. Our <a href="/immigration-lawyer-newark-nj/">Newark page</a> lists every office there.'),
                 ("Detained cases", "Elizabeth Immigration Court", "Inside the Elizabeth Detention Center on Evans Street, when the person is detained.")]
        cg = "".join(f'<div class="dcard"><span class="eyebrow light">{e}</span><h3 class="serif">{t}</h3><p>{d}</p></div>' for e, t, d in cards)
        foot = "".join(f"<p>{inner(b)}</p>" for b in [b for b in hb if b.name == "p"][1:])
        foot = re.sub(r"(estimated )(\d+(?:\.\d+)? months)", r"\1<strong>\2</strong>", foot, count=1)
        out.append(heard_section(hh, f'<div class="g4">{cg}</div><div class="heard-foot">{foot}</div>',
                                 lede='<p class="lede">Your ZIP code decides which USCIS office you get. Your Notice to Appear names the court.</p>'))
    else:
        cards = []
        for h2, bl2 in p.sections():
            t = txt(h2).lower() if h2 is not None else ""
            if h2 is not None and any(k in t for k in ("uscis", "immigration court", "asylum applicants")):
                used.add(id(h2)); cards.append((h2, bl2))
        if len(cards) == 1:
            h2, bl2 = cards[0]
            body = "".join(f"<p>{inner(b)}</p>" for b in bl2 if b.name == "p")
            out.append(heard_section(h2, f'<div class="heard-foot" style="margin-top:0;padding-top:0;border-top:0">{body}</div>'))
        elif cards:
            cg = "".join(f'<div class="dcard"><h2 class="serif" style="margin:0 0 10px;color:#fff;font-size:21px;font-weight:400;line-height:1.3" id="{heading_id(h2)}">{inner(h2)}</h2>{"".join(f"<p>{inner(b)}</p>" for b in bl2 if b.name == "p")}</div>' for h2, bl2 in cards)
            out.append(heard_section(None, f'<div class="g3">{cg}</div>'))
    if slug == "immigration-lawyer-new-jersey": hc, cb = sec(p, "Cases we take")
    elif slug == "immigration-lawyer-houston": hc, cb = sec(p, "Family, work")
    else: hc, cb = sec(p, "Green cards and visas")
    if hc is not None:
        used.add(id(hc))
        imgs = [("family-hug", "50% 35%"), ("professional", "50% 25%"), ("parents-embrace", "50% 30%")]
        cards = None
        if slug == "immigration-lawyer-new-jersey":
            titles = ["Family immigration", "Work visas and green cards", "Removal defense"]
            paras = [b for b in cb if b.name == "p"]
            cards = [(titles[i], f"<p>{inner(x)}</p>") for i, x in enumerate(paras[:3])]
        elif slug == "immigration-lawyer-houston":
            cards, cur = [], None
            for b in cb:
                if b.name == "h3": cur = [inner(b), ""]; cards.append(cur)
                elif cur is not None: cur[1] += render(b)
        if cards:
            cg = "".join(f'<article class="svc-card"><img src="{IMG}{imgs[i % 3][0]}.webp" alt="" width="1200" height="800" loading="lazy" style="object-position:{imgs[i % 3][1]}"><div class="l-case-b"><h3 class="serif">{t}</h3>{body}</div></article>' for i, (t, body) in enumerate(cards))
            out.append(f'''<section class="l-cases"><div class="wrap"><div class="sec-intro"><p class="eyebrow">Our work in {c["city"]}</p><h2 class="display h-l h50" id="{heading_id(hc)}">{inner(hc)}</h2></div>
<div class="g3" style="gap:28px">{cg}</div></div></section>''')
        else:
            body = "".join(render(b) for b in cb)
            out.append(f'''<section class="l-cases"><div class="wrap"><div class="sec-intro"><p class="eyebrow">Our work in {c["city"]}</p><h2 class="display h-l h50" id="{heading_id(hc)}">{inner(hc)}</h2></div>
<div class="wcard l-case-b" style="max-width:900px">{body}</div></div></section>''')
    rest = [(h2, bl2) for h2, bl2 in p.sections() if h2 is not None and id(h2) not in used and not (bl2 and all(b.name == "details" for b in bl2))]
    award = [s for s in rest if "best immigration lawyer" in txt(s[0]).lower()]
    rest = [s for s in rest if s not in award]
    if award:
        h2, bl2 = award[0]
        link = p.ec.find("a", string=re.compile("award recognition"))
        lk = f'<a class="arrow-link" href="{link["href"]}">View our award recognition →</a>' if link else ""
        ps = "".join(f'<p class="serif" style="margin:0;font-size:20px;line-height:1.5;color:#0c152c">{inner(b)}</p>' for b in bl2 if b.name == "p")
        out.insert(2, f'''<section class="mem-strip"><div class="wrap"><div class="mem-strip-t" style="text-align:center;align-items:center">
<p class="eyebrow">Recognized in Houston</p><h2 class="display" style="font-size:34px;line-height:1.15">{inner(h2)}</h2>{ps}{lk}</div></div></section>''')
    out.append(loc_reviews("New Jersey families on working with us" if c["city"] == "New Jersey" else f"{c['city']} clients on working with us"))
    if rest:
        out.append(prose_section(rest, p))
    hf, fb = faq_block(p)
    out.append(f'''<section class="l-faq cream"><div class="wrap g2 faqgrid">
<div class="l-faq-l"><p class="eyebrow">Questions</p><h2 class="display h-l h46" id="{heading_id(hf)}">{inner(hf)}</h2>{map_box(c["map"])}</div>
<div class="faq">{r_faq(fb)}</div></div></section>''')
    office_word = c["call"].replace("Call the ", "")
    out.append(booking_dark(p, f'Talk to Zachary about your <em>{c["city"]} case</em>',
                            f'Pick a day below, or call the {office_word} at <a href="tel:{c["tel"]}">{c["teln"]}</a>. ¡Hablamos español!'))
    out.append(mem_strip())
    return p, "\n".join(out)

# ---------------------------------------------------------------- 06: city without an office
TOWN = {"immigration-lawyer-newark-nj": ("Newark", "about an hour south by car"),
        "dedicated-immigration-lawyer-in-jersey-city": ("Jersey City", None),
        "compassionate-immigration-lawyer-elizabeth-nj": ("Elizabeth", None)}

def build_loc_town(slug):
    p = Page(slug)
    town, drive = TOWN[slug]
    rewritten = p.cover is not None
    hl, lede = p.hero()
    fig = None
    if not rewritten:
        fig = first_figure_img(p)
        if fig is not None: p.blocks.remove(fig)
        firstp = next((b for b in p.blocks if b.name == "p" and txt(b)), None)
        lede = inner(firstp) if firstp is not None else ""
        if firstp is not None: p.blocks.remove(firstp)
    ewing = ("830 Bear Tavern Road, " + drive + ".") if drive else "830 Bear Tavern Road, Suite 108, Ewing."
    meet = f'''<div class="l-meet"><span class="eyebrow light">How {town} clients meet us</span><div class="l-meet-g routes">
<span>{VIDEO_24}<span><strong>By video</strong>From home or work, at the time you book.</span></span>
<span>{PIN_24}<span><strong>At our Ewing office</strong>{ewing}</span></span></div></div>'''
    if rewritten:
        photo, pos = PHOTO[slug]
        img = f'<img src="{IMG}{photo}.webp" alt="" width="1600" height="1066" fetchpriority="high" style="object-position:{pos}">'
        title = f'<h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1>\n<p class="display h-xl l-hero-h h58">{HEADLINE[slug]}</p>\n<p class="lede">{H.escape(lede or "")}</p>'
        rate = f'<div class="l-rate">{GOOGLE26}<span>More than 90 Google reviews of our Ewing office average <strong>5.0 stars</strong>.</span></div>'
    else:
        fi = fig.find("img") if fig is not None else None
        img = f'<img src="{H.escape(fi.get("src"))}" alt="{H.escape(fi.get("alt", ""))}" width="{fi.get("width", 1200)}" height="{fi.get("height", 800)}" fetchpriority="high">'
        title = f'<p class="eyebrow eyeline">Locations</p>\n<h1 class="display h-xl l-hero-h h58">{H.escape(p.h1)}</h1>\n<p class="lede">{lede}</p>'
        rate = byline_html(p)
    out = [loc_crumb(town)]
    out.append(f'''<section class="l-hero"><div class="wrap"><div class="hero-grid">
<div class="l-hero-t">{title}
<div class="btn-row"><a class="btn btn-gold" href="#book">Book a free consultation</a><a class="btn btn-line" href="tel:+16099248500">Call (609) 924-8500</a></div>
{rate}</div>
<div class="l-hero-m">{img}{meet}</div>
</div></div></section>''')
    used = set()
    h, bl = sec(p, "Why work with")
    if h is not None:
        used.add(id(h))
        ul = next(b for b in bl if b.name == "ul")
        lead_p = next((b for b in bl if b.name == "p"), None)
        qs = [b for b in bl if b.name == "blockquote"]
        lp = f'<p class="why-lead">{inner(lead_p)}</p>' if lead_p is not None else ""
        out.append(f'''<section class="l-why"><div class="wrap g2" style="align-items:start">
<div class="l-why-l" style="gap:22px"><p class="eyebrow">Why work with us</p><h2 class="display h-l h50" id="{heading_id(h)}">{inner(h)}</h2>
<div>{why_items(ul, first_pad=True)}</div></div>
<div class="l-why-r" style="gap:20px">{lp}{"".join(quote_fig(q, True) for q in qs)}</div>
</div></section>''')
    if slug == "immigration-lawyer-newark-nj":
        hh, hb = sec(p, "Where Newark")
        used.add(id(hh))
        items = [split_lead(li) for li in hb[0].find_all("li", recursive=False)]
        # the first three places share one building (template 06 groups them); the live descriptions say where in it
        d0 = re.sub(r"^Peter W\. Rodino Federal Building, 970 Broad Street\.\s*", "", items[0][1])
        d1 = re.sub(r"^Room 1200 in the same building\.\s*", "", items[1][1])
        d2 = re.sub(r"^11th floor of the same building\.?\s*", "", items[2][1])
        out.append(heard_section(hh, f'''<div class="g2" style="gap:24px;align-items:stretch">
<div class="dcard-lg"><span class="eyebrow light">One building</span><h3 class="serif">970 Broad Street</h3><span class="sub">Peter W. Rodino Federal Building</span>
<ul><li><span>USCIS</span><span><strong>{items[0][0]}</strong>{d0}</span></li>
<li><span>Room 1200</span><span><strong>{items[1][0]}</strong>{d1}</span></li>
<li><span>11th floor</span><span><strong>{items[2][0]}</strong>{d2}</span></li></ul></div>
<div class="stack gap24"><div class="dcard-m"><span class="eyebrow light">Asylum interviews</span><h3 class="serif">{items[3][0]}</h3><p>{items[3][1]}</p></div>
<div class="dcard-m"><span class="eyebrow light">Detention</span><h3 class="serif">{items[4][0]}</h3><p>{cap1(items[4][1])}</p></div></div>
</div>''', hex_pos="right:-80px;top:-80px"))
        hw, wb = sec(p, "What we handle")
        used.add(id(hw))
        cards = []
        for i, li in enumerate(wb[0].find_all("li", recursive=False)):
            lead, rest = split_lead(li)
            cards.append(f'<div class="wcard">{W_ICONS[i % 4]}<h3 class="serif">{lead}</h3><p>{cap1(rest)}</p></div>')
        out.append(f'''<section class="l-cases"><div class="wrap"><div class="sec-intro" style="margin-bottom:48px"><p class="eyebrow">Our work in Newark</p><h2 class="display h-l h50" id="{heading_id(hw)}">{inner(hw)}</h2></div>
<div class="g4">{"".join(cards)}</div></div></section>''')
    else:
        rest = [(h2, bl2) for h2, bl2 in p.sections() if (h2 is None or id(h2) not in used)]
        items = [(heading_id(h2), txt(h2)) for h2, _ in rest if h2 is not None]
        parts = [section_html(h2, bl2, p, B.SERVICE, {"hl": "interview"}) for h2, bl2 in rest]
        parts.append(author_box(p))
        out.append(f'''<section class="p-body"><div class="wrap">
{toc_aside(items, "Talk to Zachary first", "Free consultation. You hear the fee before any work begins.", "#book").replace('class="toc-desk"', 'class="svc-aside"')}
<article class="art">{"".join(parts)}</article></div></section>''')
    hf, fb = faq_block(p)
    if hf is not None:
        out.append(f'''<section class="l-faq"><div class="wrap g2 faqgrid">
<div class="l-faq-l"><p class="eyebrow">Questions</p><h2 class="display h-l h46" id="{heading_id(hf)}">{inner(hf)}</h2>
<div class="meet-box"><strong>Meeting us from {town}</strong><p>{town} clients meet us by video or at our office at 830 Bear Tavern Road, Suite 108, in Ewing{", " + drive if drive else ""}.</p>
<div class="btn-row"><a class="btn btn-navy" href="#book">Book a video consultation</a><a class="btn btn-line" href="https://www.google.com/maps?cid=2806749106084288155" target="_blank" rel="noopener">Directions to Ewing</a></div></div></div>
<div class="faq">{r_faq(fb)}</div></div></section>''')
    out.append(booking_dark(p, f'Talk to Zachary about your <em>{town} case</em>',
                            'Pick a day below for a video or in-person consultation, or call <a href="tel:+16099248500">(609) 924-8500</a>. ¡Hablamos español!'))
    out.append(mem_strip())
    return p, "\n".join(out)

for s in CITY: BUILDERS[s] = build_loc_office
for s in TOWN: BUILDERS[s] = build_loc_town

# ---------------------------------------------------------------- 09: blog list
def blog_items(slug):
    p = Page(slug)
    items = []
    heads = p.main.find_all("h5") or [h for h in p.main.find_all("h2") if h.find("a") or h.find_next("a", string=re.compile("Read More"))]
    for h5 in heads:
        a = h5.find("a") or h5.find_next("a")
        box = h5.find_parent(class_=re.compile("gb-loop-item")) or h5.parent
        ex = next((q for q in box.find_all("p") if txt(q) and txt(q) != "Read More"), None)
        if ex is None:  # pages 2 and 3: the excerpt is the paragraph after the heading
            ex = next((q for q in h5.find_all_next("p", limit=3) if txt(q) and txt(q) != "Read More"), None)
        items.append((txt(h5), a["href"] if a else "#", inner(ex) if ex is not None else ""))
    return p, items

def card_img(slug):
    photo = PHOTO.get(slug)
    if photo:
        return f'<img class="pc-img" src="{IMG}{photo[0]}.webp" alt="" width="1200" height="800" loading="lazy" style="object-position:{photo[1]}">'
    lp = Page(slug)
    f = first_figure_img(lp)
    fi = f.find("img") if f is not None else None
    src = fi["src"] if fi is not None else f"{IMG}professional.webp"
    return f'<img class="pc-img" src="{H.escape(src)}" alt="" width="1200" height="800" loading="lazy">'

def card_for(title, href, excerpt):
    slug = href.strip("/").split("/")[-1]
    label = LABEL.get(slug) or GROUPS.get(slug) or ("Locations" if slug in TOWN or slug in CITY else "Article")
    go = "Read the guide →" if label.startswith("Guide") else ("Read the article →" if label.startswith("Article") else "Read more →")
    return f'<a class="post-card" href="{href}">{card_img(slug)}<span class="pc-b"><span class="eyebrow">{label}</span><h3 class="serif">{H.escape(title)}</h3><span class="pc-x">{excerpt}</span><span class="pc-go">{go}</span></span></a>'

BLOG_PAGES = ["blog", "category-blog-page-2", "category-blog-page-3"]
def build_blog(slug):
    p, items = blog_items(slug)
    n = BLOG_PAGES.index(slug) + 1
    out = [crumb([("Home", "/"), ("Blog", None)] if n == 1 else [("Home", "/"), ("Blog", "/blog/"), (f"Page {n}", None)])]
    out.append(f'''<section class="b-head"><div class="hexbg b-head-hex" aria-hidden="true"></div><div class="wrap">
<h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1>
<p class="display h-xl b-head-h">Guides for your <em>immigration case.</em></p>
<p class="lede">Green cards, visas, citizenship, processing times and your rights, explained by Cruz Gold &amp; Associates.</p>
</div></section>''')
    feat, grid_items = "", items
    if n == 1 and items:
        t, href, ex = items[0]
        s0 = href.strip("/")
        photo = PHOTO.get(s0, ("couple-hug", "50% 30%"))
        lp = Page(s0)
        date = txt(lp.byline.find("time")).replace("\xa0", " ") if (lp.byline is not None and lp.byline.find("time")) else ""
        mins = max(1, round(len(re.findall(r"\w+", " ".join(txt(b) for b in lp.blocks))) / 230))
        meta = " · ".join(x for x in (date, f"{mins} min read") if x)
        label = LABEL.get(s0, "Guide")
        feat = f'''<a href="{href}" class="post-card feat workwith" aria-label="{H.escape(t)}"><img src="{IMG}{photo[0]}.webp" alt="" width="1600" height="1066" loading="lazy" style="object-position:{photo[1]}">
<span class="feat-b"><span class="eyebrow">Newest guide · {label.split(" · ")[-1]}</span><h2 class="serif">{H.escape(t)}</h2><span class="x">{ex}</span><span class="d">{meta}</span><span class="btn btn-navy">Read the guide</span></span></a>'''
        grid_items = items[1:]
    cards = "".join(card_for(*it) for it in grid_items)
    pg = ['<span class="off" aria-disabled="true">← Previous</span>' if n == 1 else f'<a href="{"/blog/" if n == 2 else "/category-blog-page-2/"}">← Previous</a>']
    for k, s in enumerate(BLOG_PAGES, 1):
        pg.append(f'<span aria-current="page">{k}</span>' if k == n else f'<a href="{"/blog/" if k == 1 else "/" + s + "/"}">{k}</a>')
    pg.append(f'<a href="/{BLOG_PAGES[n]}/">Next →</a>' if n < 3 else '<span class="off" aria-disabled="true">Next →</span>')
    out.append(f'''<section class="b-list"><div class="wrap">{feat}
<div class="b-bar"><h2 class="display">All articles</h2><span>Page {n} of 3</span></div>
<div class="g3 b-grid">{cards}</div>
<nav class="pager" aria-label="Blog pages">{"".join(pg)}</nav>
</div></section>''')
    out.append(booking_light(p))
    out.append(f'''<section class="cta-dark on-dark"><div class="hexbg-white cta-dark-hex" aria-hidden="true"></div><div class="wrap workwith">
<div class="cta-dark-t"><p class="eyebrow light">Free consultation</p><h2 class="display h-l" style="font-size:48px;line-height:1.08">Have a question about <em>your own case?</em></h2>
<p class="lede">Book a free consultation with attorney Zachary Gold, at our Ewing office or by video. ¡Hablamos español!</p></div>
<div class="cta-dark-b"><a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a></div>
</div></section>''')
    return p, "\n".join(out)
for s in BLOG_PAGES: BUILDERS[s] = build_blog

# ---------------------------------------------------------------- 10: about
CAP_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>'
DOC_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'

def offices_block(title, book):
    offs = "".join(f'<div><h3 class="serif">{n}</h3><p>{a1}<br>{a2}</p><p><a class="tel" href="tel:{t}">{tn}</a><a href="{m}" target="_blank" rel="noopener">Directions</a></p></div>' for n, a1, a2, t, tn, m in OFFICES)
    return f'''<section class="offices-cta on-dark"><div class="wrap">
<div class="offices-cta-t"><p class="eyebrow light">Free consultation</p><h2 class="display h-l h52">{title}</h2>
<p class="lede">Every office books the same free consultation with attorney Zachary Gold. ¡Hablamos español!</p>
<div class="btn-row"><a class="btn btn-gold" href="{book}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a></div></div>
<div class="g4 off4">{offs}</div></div></section>'''

def build_about(slug):
    p = Page(slug)
    blocks = [b for b in p.main.find_all(["h2", "h3", "h4", "p"]) if txt(b) and not b.find_parent(class_="footerstyle")]
    intro = next(b for b in blocks if b.name == "p" and len(txt(b)) > 80)
    h_commit = next(b for b in blocks if b.name == "h2" and "Integrity" in txt(b))
    p_commit = blocks[blocks.index(h_commit) + 1]
    h_z = next(b for b in blocks if b.name == "h2" and "Zachary" in txt(b))
    zps = []
    for b in blocks[blocks.index(h_z) + 1:]:
        if b.name == "h2": break
        if b.name == "p": zps.append(b)
    h_v = next(b for b in blocks if b.name == "h2" and "Values" in txt(b))
    vp = [b for b in blocks[blocks.index(h_v) + 1:] if b.name == "p" and len(txt(b)) > 40][:3]
    out = [crumb([("Home", "/"), ("About", None)])]
    out.append(f'''<section class="p-hero a-hero"><div class="hexbg a-hero-hex" aria-hidden="true"></div><div class="wrap hero-grid">
<div class="p-hero-t"><h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1>
<p class="display h-xl" style="font-size:64px;line-height:1.04">A family firm, <em>since 1995.</em></p>
<p class="lede">{inner(intro)}</p>
<div class="btn-row"><a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-line" href="/client-testimonials/">Client stories</a></div></div>
<img class="a-hero-img" src="{IMG}beach-flag.webp" alt="" width="1200" height="801" fetchpriority="high">
</div></section>''')
    tl = [("1995", "The practice opens", "After law school at Rutgers, Marta Cruz Gold opens The Law Office of Marta Cruz Gold and becomes a community leader in Mercer County."),
          ("Then", "The next generation", "Zachary Gold starts his career as a paralegal and earns his Juris Doctor at Drexel University."),
          ("2023", "Marta’s legacy", "Marta passes away on June 12, 2023. Cruz Gold &amp; Associates carries on her mission of compassionate legal services."),
          ("Today", "Led by Zachary Gold", "The firm works from Ewing, Hackensack, Philadelphia and Houston, in English and Spanish.")]
    lis = "".join(f'<li><span class="display yr">{y}</span><strong>{t}</strong><p>{d}</p></li>' for y, t, d in tl)
    out.append(f'''<section class="sec112"><div class="wrap"><div class="sec-intro" style="margin-bottom:56px"><p class="eyebrow">Our story</p>
<h2 class="display h-l h50">From a Mercer County practice to four offices</h2></div><ol class="g4 tl">{lis}</ol></div></section>''')
    creds = (f'<li>{CAP_ICON}J.D., Drexel University</li><li>{CAP_ICON}Rutgers University alumnus</li>'
             f'<li><img src="{IMG}aila-logo.svg" alt="" width="24" height="24">Member, AILA</li><li>{DOC_ICON}Started as a paralegal</li>')
    zbody = "".join(f'<p class="body">{inner(z)}</p>' for z in zps[1:])
    out.append(f'''<section class="cream sec112 a-zach"><div class="wrap split">
<div><img class="a-zach-img" src="{IMG}zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008" loading="lazy"></div>
<div class="a-zach-t"><p class="eyebrow">Owner and attorney</p><h2 class="display h-l h50">{inner(h_z)}</h2>
<p class="lede">{inner(zps[0])}</p>{zbody}
<ul class="creds routes">{creds}</ul></div></div></section>''')
    vals = ["Integrity", "Family-centered care", "Excellence"]
    vcards = "".join(f'<div class="vcard"><span class="display num">0{i + 1}</span><h3 class="serif">{t}</h3><p>{inner(vp[i])}</p></div>' for i, t in enumerate(vals))
    out.append(f'''<section class="sec112"><div class="wrap">
<div class="sec-intro"><p class="eyebrow">Our commitment</p><h2 class="display h-l h50">{inner(h_commit)}</h2><p class="lede">{inner(p_commit)}</p></div>
<h2 class="display" style="font-size:36px;line-height:1.1;margin:0 0 32px">{inner(h_v)}</h2>
<div class="g3" style="gap:28px">{vcards}</div></div></section>''')
    out.append(f'''<section class="a-mem on-dark"><div class="hexbg-white a-mem-hex" aria-hidden="true"></div><div class="wrap memorial">
<img class="a-mem-img" src="{IMG}marta.webp" alt="Marta Cruz Gold" width="327" height="490" loading="lazy">
<div class="a-mem-t"><p class="eyebrow light">In memory of our founder</p><h2 class="display h-l" style="font-size:48px;line-height:1.08">Marta Cruz Gold <em>(1969–2023)</em></h2>
<p class="lede">Marta’s legal journey began at Rutgers University School of Law and led to her own practice in 1995. Known for her dedication to justice and mentorship, she left a lasting impact both in and out of the courtroom.</p>
<p class="body">Her legacy of integrity, excellence and empathy continues to guide us, and her role as a community leader in Mercer County remains an inspiration to us all.</p></div>
</div></section>''')
    r1 = rv_card("From the beginning, it was obvious Mrs. Gold had a clear knowledge of the law and that held true to form throughout our process. At all times, she clearly communicated next steps and was always incredibly responsive.", "Dave Ropiak", sub="")
    r2 = rv_card("Zachary Gold was not only incredibly knowledgeable about the immigration process, but he was also patient, understanding, and empathetic throughout the entire process.", "Lukas McHugh", gold=True, sub="")
    out.append(f'''<section class="cream sec112 a-rev"><div class="wrap"><div class="sec-intro" style="margin-bottom:48px"><p class="eyebrow">Client stories</p>
<h2 class="display h-l h50">Clients of Marta, clients of Zachary</h2></div><div class="g2" style="gap:28px">{r1}{r2}</div>
<p class="note" style="margin-top:22px">Results may vary depending on your particular facts and legal circumstances.</p></div></section>''')
    out.append(booking_light(p))
    h_cta = next((b for b in p.soup.find_all("h3") if txt(b).lower().startswith("your case is our priority")), None)
    out.append(offices_block("Your case is <em>our priority.</em>", book_href(p)))
    return p, "\n".join(out)
BUILDERS["about"] = build_about

# ---------------------------------------------------------------- 11: contact
MAIL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>'
PIN20 = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
CLOCK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
FB = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'
IG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>'
LI = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>'

def build_contact(slug):
    p = Page(slug)
    out = [crumb([("Home", "/"), ("Contact", None)])]
    out.append(f'''<section class="cream c-head"><div class="wrap"><h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1>
<p class="display h-xl c-head-h">Talk to attorney <em>Zachary Gold.</em></p>
<p class="lede">Book a free consultation online, or call the Ewing office. ¡Hablamos español!</p></div></section>''')
    out.append(f'''<section class="c-main"><div class="wrap">
<div class="c-side">
<div class="c-call"><span class="eyebrow light">Call us</span><a class="display" href="tel:+16099248500">(609) 924-8500</a><span class="sub">Ewing office, main line</span>
<div class="c-call-o"><span>Philadelphia <a href="tel:+12156082131">(215) 608-2131</a></span><span>Houston <a href="tel:+18329247490">(832) 924-7490</a></span></div></div>
<div class="c-info">
<div class="c-row"><span class="c-ic">{MAIL}</span><span><strong>Email</strong><a href="mailto:info@cruzgoldlaw.com">info@cruzgoldlaw.com</a></span></div>
<div class="c-row"><span class="c-ic">{PIN20}</span><span><strong>Visit us</strong>830 Bear Tavern Rd, Suite 108<br>Ewing, NJ 08628<a class="dirs" href="https://www.google.com/maps?cid=2806749106084288155" target="_blank" rel="noopener">Directions</a></span></div>
<div class="c-row"><span class="c-ic">{CLOCK}</span><span class="c-hours"><strong>Office hours</strong><span>Mon – Fri <span>9:00 am – 5:00 pm</span></span><span class="closed">Sat – Sun <span>Closed</span></span></span></div>
<div class="c-social"><a href="https://www.facebook.com/cruzgoldlaw" aria-label="Facebook" target="_blank" rel="noopener">{FB}</a><a href="https://www.instagram.com/cruzgoldlaw/" aria-label="Instagram" target="_blank" rel="noopener">{IG}</a><a href="https://www.linkedin.com/company/cruz-gold-associates" aria-label="LinkedIn" target="_blank" rel="noopener">{LI}</a></div>
</div></div>
<div class="c-book" id="book"><div class="c-book-h"><h2 class="display">Book your free consultation</h2><span><img src="{IMG}zachary.webp" alt="" width="942" height="1008">With attorney Zachary Gold</span></div>{calendly(p)}</div>
</div></section>''')
    offs = "".join(f'<div><h3 class="serif">{n}</h3><p>{a1}<br>{a2}</p><p><a class="tel" href="tel:{t}">{tn}</a><a href="{m}" target="_blank" rel="noopener">Directions</a></p></div>' for n, a1, a2, t, tn, m in OFFICES)
    out.append(f'''<section class="c-map"><div class="wrap">{map_box("ewing", "c-map-box")}
<div class="stack gap14"><p class="eyebrow">Our offices</p><h2 class="display h-l" style="font-size:44px;line-height:1.08">Four offices, one free consultation</h2></div>
<div class="g4 c-off">{offs}</div></div></section>''')
    return p, "\n".join(out)
BUILDERS["contact"] = build_contact

# ---------------------------------------------------------------- 12: testimonials
MARTA_NAMES = {"Dave Ropiak", "Frank Farmer", "marek zawarus"}
QUOTE_BIG = '<svg width="96" height="80" viewBox="0 0 48 40" aria-hidden="true"><path fill="#bf992d" d="M0 40V22C0 9.5 6.5 2 19 0l2 5c-7 2-10 6.5-10 13h9v22zm27 0V22c0-12.5 6.5-20 19-22l2 5c-7 2-10 6.5-10 13h9v22z"/></svg>'

def testimonials():
    p = Page("client-testimonials")
    out = []
    for it in p.soup.select(".gb-loop-item"):
        ps = [x for x in it.find_all(["p", "h2", "h3", "h4", "h5"]) if txt(x)]
        if len(ps) >= 2:
            out.append((inner(ps[0]), txt(ps[-1])))
    return out

def build_testimonials(slug):
    p = Page(slug)
    T = testimonials()
    out = [crumb([("Home", "/"), ("About", "/about/"), ("Client Testimonials", None)])]
    g44 = GOOGLE26.replace('width="26" height="26"', 'width="44" height="44"')
    out.append(f'''<section class="cream t-head"><div class="wrap hero-grid">
<div class="stack gap22"><h1 class="eyebrow eyeline">{H.escape(p.h1)}</h1><p class="display h-xl" style="font-size:60px;line-height:1.05">Real results, <em>real people.</em></p>
<p class="lede" style="max-width:540px">What clients say about working with attorney Zachary Gold and the Cruz Gold &amp; Associates team, in their own words.</p></div>
<div class="t-rate"><div>{g44}<span class="stack" style="gap:2px"><span style="display:flex;align-items:center;gap:10px"><strong class="display num">5.0</strong><span class="stars-t" role="img" aria-label="5 out of 5 stars">★★★★★</span></span><span class="sub">113 Google reviews across our four offices</span></span></div>
<a class="btn btn-line" href="https://www.google.com/maps?cid=2806749106084288155" target="_blank" rel="noopener">Read them on Google</a></div>
</div></section>''')
    out.append(f'''<section class="t-feat"><div class="wrap workwith">{QUOTE_BIG}<figure>
<blockquote class="serif">… I felt compelled to write this review because it is the least I can do to thank him, and let others know that there’s an attorney who’s not going to take advantage of the client’s situation.</blockquote>
<figcaption class="rev-cap"><span class="av" aria-hidden="true">AJ</span><span><strong>Ali Jamil</strong><span class="sub">Client of attorney Zachary Gold</span></span></figcaption></figure></div></section>''')
    cards = "".join(rv_card(t, n, gold=(i % 2 == 1), marta=(n in MARTA_NAMES), sub="") for i, (t, n) in enumerate(T))
    out.append(f'''<section class="t-all"><div class="wrap">
<div class="t-bar"><h2 class="display">In their own words</h2><span>Reviews are quoted as written. “…” marks a shortened passage.</span></div>
<div class="masonry">{cards}</div>
<p class="note" style="margin-top:8px">Results may vary depending on your particular facts and legal circumstances.</p></div></section>''')
    out.append(booking_light(p))
    out.append(cta_right("family-hug", "50% 35%", "Free consultation", "Start your own story <em>with a free call.</em>",
                         "Talk to attorney Zachary Gold about your case. ¡Hablamos español!",
                         f'<a class="btn btn-gold" href="{book_href(p)}">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a>', " p104"))
    return p, "\n".join(out)
BUILDERS["client-testimonials"] = build_testimonials

# ---------------------------------------------------------------- 13: text pages
def legal_inner(p):
    parts, toc = [], []
    for h, bl in p.sections():
        if h is not None:
            i = heading_id(h); toc.append((i, txt(h)))
            parts.append(f'<h2 id="{i}">{inner(h)}</h2>')
        for b in bl:
            if b.name == "figure" and not b.find("table"):
                continue
            if b.name == "h3":
                parts.append(f'<h3 id="{heading_id(b)}">{inner(b)}</h3>')
            elif b.name in ("ul", "ol"):
                parts.append(f"<{b.name}>" + "".join(f"<li>{inner(li)}</li>" for li in b.find_all("li", recursive=False)) + f"</{b.name}>")
            else:
                parts.append(render(b))
    if len(toc) < 2:
        toc = [(heading_id(b), txt(b)) for b in p.blocks if b.name == "h3"]
    return parts, toc

def build_text(slug):
    p = Page(slug)
    parts, toc = legal_inner(p)
    date = ""
    for b in p.blocks[:5]:
        if b.name == "p" and re.match(r"^(Last updated|Effective|Updated)", txt(b), re.I):
            date = inner(b)
            parts = [x for x in parts if x != f"<p>{date}</p>"]
            break
    out = [crumb([("Home", "/"), (H.escape(p.h1), None)])]
    dl = f'<p class="date">{date}</p>' if date else ""
    out.append(f'<section class="cream x-head"><div class="wrap"><p class="eyebrow">Legal</p><h1 class="display h-xl x-head-h">{H.escape(p.h1)}</h1>{dl}</div></section>')
    links = "".join(f'<a href="#{i}"{" class=\"on\"" if n == 0 else ""}>{H.escape(t)}</a>' for n, (i, t) in enumerate(toc))
    if parts and parts[0].startswith("<p>"):
        parts[0] = parts[0].replace("<p>", '<p class="lede">', 1)
    out.append(f'''<section class="x-body"><div class="wrap">
{toc_phone(toc)}
<aside class="toc-desk x-toc"><nav aria-label="On this page"><p class="eyebrow">On this page</p>{links}</nav></aside>
<article class="legal">{"".join(parts)}</article></div></section>''')
    out.append(booking_light(p))
    return p, "\n".join(out)
BUILDERS["privacy-policy"] = build_text
BUILDERS["app-privacy-policy"] = build_text

# ---------------------------------------------------------------- 14: sitemap (groups and labels of template 14)
SITEMAP = [
  ("Locations", [("Immigration Lawyer New Jersey", "/immigration-lawyer-new-jersey/"), ("Immigration Lawyer Newark, NJ", "/immigration-lawyer-newark-nj/"),
                 ("Immigration Lawyer Jersey City", "/dedicated-immigration-lawyer-in-jersey-city/"), ("Immigration Lawyer Elizabeth, NJ", "/compassionate-immigration-lawyer-elizabeth-nj/"),
                 ("Immigration Lawyer Philadelphia", "/immigration-lawyer-philadelphia/"), ("Immigration Lawyer Houston", "/immigration-lawyer-houston/")]),
  ("Family &amp; Citizenship", [("Family-Based Immigration", "/family-immigration-lawyer/"), ("Marriage Green Card", "/marriage-green-card-lawyer/"), ("K-1 Fiancé(e) Visa", "/k1-visa-lawyer/"),
                 ("Adjustment of Status", "/adjustment-of-status-lawyer/"), ("Citizenship and Naturalization", "/citizenship-lawyer/")]),
  ("Green Cards", [("Green Card Lawyer", "/green-card-lawyer/"), ("EB-1A / EB-1B / EB-1C", "/eb-1-visa-lawyer/"), ("EB-2 National Interest Waiver", "/eb2-niw-lawyer/"),
                 ("EB-3 and PERM", "/eb-3-visa-lawyer/"), ("EB-5 Investor Visa", "/eb-5-visa-lawyer/")]),
  ("Visas", [("Visa Lawyer", "/visa-lawyer/"), ("All Work Visas", "/work-visa-lawyer-new-jersey/"), ("H-1B Visa", "/h1b-visa-lawyer/"), ("O-1 Visa", "/o1-visa-lawyer/"),
             ("L-1 Visa", "/trusted-l-1-visa-lawyer/"), ("E-2 Investor Visa", "/e-2-visa-lawyer-for-investors-entrepreneurs/"), ("TN Visa (Canada and Mexico)", "/tn-visa-lawyer/"),
             ("Student Visas", "/student-visa-lawyer-new-jersey/")]),
  ("Deportation &amp; Asylum", [("Deportation Defense Lawyer", "/deportation-defense-lawyer/"), ("Asylum Lawyer", "/asylum-lawyer/"),
             ("Criminal Immigration Lawyer", "/criminal-immigration-lawyer/"), ("VAWA Lawyer", "/vawa-lawyer/")]),
  ("Guides", [("I-751 Evidence Checklist", "/i-751-evidence-checklist/"), ("EB-2 NIW Requirements", "/eb2-niw-requirements/"), ("O-1 Visa Requirements", "/o1-visa-requirements/"),
              ("N-400 Processing Time by Field Office", "/n400-processing-time/"), ("Immigration Lawyer Cost", "/immigration-lawyer-cost/"),
              ("Finding an Immigration Attorney Near You", "/immigration-attorneys-near-me/")]),
  ("Blog", [("All Articles", "/blog/"), ("Common Misconceptions in Immigration Law", "/common-misconceptions-in-immigration-law/"),
            ("Understanding Lengthy Immigration Process Times", "/the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s/"),
            ("Traveling Abroad as a Non-Citizen", "/traveling-abroad-as-a-non-citizen-key-considerations/"),
            ("Immigration Changes under the 2025 Trump Administration", "/navigating-immigration-changes-under-the-2025-trump-administration/"),
            ("Rights of Undocumented Individuals in the USA", "/understanding-the-rights-of-undocumented-individuals-in-the-usa/"),
            ("How Cruz Gold &amp; Associates Helps New Jersey Immigrants", "/new-jersey-us-immigration-laws/"),
            ("Trusted Immigration Lawyers in New Jersey", "/cruz-gold-law-trusted-immigration-lawyers-in-new-jersey/")]),
  ("The Firm", [("Home", "/"), ("About Us", "/about/"), ("Client Testimonials", "/client-testimonials/"), ("Contact Us", "/contact/"),
                ("Privacy Policy", "/privacy-policy/"), ("App Privacy Policy", "/app-privacy-policy/")]),
]
def build_sitemap(slug):
    p = Page(slug)
    cols = "".join(f'<div><h2 class="eyebrow">{g}</h2><ul>' + "".join(f'<li><a href="{h}">{t}</a></li>' for t, h in links) + "</ul></div>" for g, links in SITEMAP)
    out = [crumb([("Home", "/"), ("Sitemap", None)]),
           f'<section class="cream s-head"><div class="wrap"><h1 class="display h-xl s-head-h">{H.escape(p.h1)}</h1><p class="lede">Every page on our site, grouped by topic.</p></div></section>',
           f'<section class="s-body"><div class="wrap">{cols}</div></section>', booking_light(p)]
    return p, "\n".join(out)
BUILDERS["sitemap"] = build_sitemap

# ---------------------------------------------------------------- 15: 404
def build_404(slug):
    p = Page("404")
    chips = [("Green cards", "/green-card-lawyer/"), ("Citizenship", "/citizenship-lawyer/"), ("Visas", "/visa-lawyer/"), ("Deportation defense", "/deportation-defense-lawyer/"),
             ("Our offices", "/contact/"), ("Blog", "/blog/")]
    ch = "".join(f'<a class="chip" href="{h}">{t}</a>' for t, h in chips)
    return p, f'''<section class="e-sec"><div class="hexbg e-hex" aria-hidden="true"></div><div class="wrap">
<img class="mono" src="{IMG}monogram-color.webp" alt="" width="168" height="125">
<h1 class="display e-num">404</h1>
<p class="display h-l e-h">Page not found</p>
<p class="lede">The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track.</p>
<div class="btn-row"><a class="btn btn-navy" href="/">Go to homepage</a><a class="btn btn-line" href="/contact/">Contact us</a></div>
<div class="e-more"><p class="eyebrow">Or start with</p><div class="chips">{ch}</div></div>
</div></section>'''
BUILDERS["404"] = build_404
