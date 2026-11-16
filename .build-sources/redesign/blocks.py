# Converts live content blocks into the markup of the redesign templates (classes in css/cg-pages.css).
import re, html as H
from bs4 import NavigableString, Tag
from extract import txt, _cls
from parts import PLUS, MINUS

ICON_PEOPLE = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>'
ICON_CASE = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
ICON_SHIELD = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
ICON_GLOBE = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>'
ICON_FLAG = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22V4a1 1 0 0 1 1-1h11l-2 4 2 4H5"/></svg>'
ICON_SCALE = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0z"/></svg>'
CARD_ICONS = [ICON_PEOPLE, ICON_CASE, ICON_SHIELD, ICON_GLOBE]
CHECK_GOLD = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d9b65a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
CHECK_DEEP = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
CHECK_22 = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
ICON_INFO = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></svg>'
PIN_26 = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
PEOPLE_26 = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>'
CHAT_26 = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
SHIELD_26 = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
WHY_ICONS = [PIN_26, PEOPLE_26, CHAT_26, SHIELD_26]
VIDEO_24 = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d9b65a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/></svg>'
PIN_24 = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d9b65a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
W_ICONS = [ICON_PEOPLE, ICON_FLAG, ICON_CASE, ICON_SCALE]
GOOGLE26 = '<svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>'

INLINE_OK = {"a", "strong", "b", "em", "i", "br", "code", "sup", "sub", "time", "abbr", "small", "u", "mark", "s"}

def inner(el, drop_lead=False):
    """Inner HTML of a live element, keeping links and inline emphasis only (no classes or styles)."""
    return re.sub(r"\s+", " ", _inner(el)).strip()

def _inner(el):
    out = []
    for c in el.children:
        if isinstance(c, NavigableString):
            if type(c).__name__ in ("Comment", "Doctype", "Declaration", "ProcessingInstruction"):
                continue
            out.append(H.escape(str(c), quote=False))
        elif isinstance(c, Tag):
            if c.name in ("script", "style", "svg", "noscript"):
                continue
            if c.name == "img":
                continue
            if c.name in INLINE_OK:
                if c.name == "br":
                    out.append("<br>"); continue
                attrs = ""
                if c.name == "a" and c.get("href"):
                    attrs = f' href="{H.escape(c["href"])}"'
                    if c.get("target"): attrs += f' target="{H.escape(c["target"])}"'
                    if c.get("rel"): attrs += f' rel="{" ".join(c["rel"]) if isinstance(c["rel"], list) else c["rel"]}"'
                if c.name == "time" and c.get("datetime"):
                    attrs = f' datetime="{H.escape(c["datetime"])}"'
                tag = {"b": "strong", "i": "em"}.get(c.name, c.name)
                out.append(f"<{tag}{attrs}>{_inner(c)}</{tag}>")
            else:
                out.append(_inner(c))
    return "".join(out)

def split_lead(li):
    """'<strong>Lead.</strong> rest' or 'Lead. rest' -> (lead, rest_html). Lead only if it is short."""
    first = next((c for c in li.children if not (isinstance(c, NavigableString) and not c.strip())), None)
    if isinstance(first, Tag) and first.name in ("strong", "b"):
        lead = txt(first).rstrip(".:").strip()
        first.extract()
        return lead, inner(li)
    h = inner(li)
    m = re.match(r"^([^<.:]{2,60})[.:]\s+(.*)$", h, re.S)
    if m and len(m.group(1).split()) <= 7:
        return m.group(1).strip(), m.group(2)
    return None, h

def heading_id(el):
    if el.get("id"):
        return el["id"]
    s = re.sub(r"[^a-z0-9]+", "-", txt(el).lower()).strip("-")
    return s[:80]

def cap1(s):
    return s[:1].upper() + s[1:] if s else s

# ---------- block renderers ----------
def r_p(b):
    c = _cls(b)
    if "cg-note" in c:
        return f'<p class="note">{inner(b)}</p>'
    if txt(b).startswith("Source:") or txt(b).startswith("Sources:"):
        return f'<p class="src-note">{inner(b)}</p>'
    img = b.find("img")
    if img and not txt(b):
        return r_img(img)
    return f"<p>{inner(b)}</p>"

def r_img(img):
    src = img.get("src", ""); alt = H.escape(img.get("alt", ""))
    w, h = img.get("width"), img.get("height")
    wh = f' width="{w}" height="{h}"' if w and h else ""
    return f'<img class="art-img" src="{H.escape(src)}" alt="{alt}"{wh} loading="lazy">'

def r_list(b, ordered=False):
    tag = "ol" if ordered else "ul"
    lis = "".join(f"<li>{inner(li)}</li>" for li in b.find_all("li", recursive=False))
    return f'<{tag} class="art-list">{lis}</{tag}>'

def r_cards(b):
    out = []
    items = b.find_all("li", recursive=False)
    parsed = [split_lead(li) for li in items]
    # an item without a lead in a list where the others have one: its title runs to the first comma
    if any(l for l, _ in parsed):
        for k, (l, rest) in enumerate(parsed):
            if not l:
                m = re.match(r"^([^<,]{2,60}),\s+(.*)$", rest, re.S)
                if m and len(m.group(1).split()) <= 7:
                    parsed[k] = (m.group(1).strip(), cap1(m.group(2)))
    for i, (lead, rest) in enumerate(parsed):
        h3 = f"<h3>{H.escape(lead)}</h3>" if lead else ""
        out.append(f'<div class="card-c">{CARD_ICONS[i % 4]}{h3}<p>{rest}</p></div>')
    return f'<div class="cards2 routes">{"".join(out)}</div>'

def r_checkbox(b, eyebrow):
    lis = "".join(f"<li><span>{cap1(inner(li))}</span></li>" for li in b.find_all("li", recursive=False))
    eb = f'<p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
    return f'<div class="check-box">{eb}<ul class="routes">{lis}</ul></div>'

def r_cols(b):
    lis = "".join(f"<li>{CHECK_22}<span>{inner(li)}</span></li>" for li in b.find_all("li", recursive=False))
    return f'<ul class="cols-list routes">{lis}</ul>'

STAT_RE = re.compile(r"^\s*([\d.,]+(?:\s*(?:to|-|–)\s*[\d.,]+)?)\s+(months?|years?|weeks?|days?)\s*$")

def r_kv(b, head=None):
    rows = []
    for li in b.find_all("li", recursive=False):
        k, v = li.select_one(".cg-kv-k"), li.select_one(".cg-kv-v")
        rows.append((inner(k) if k else inner(li), inner(v) if v else ""))
    if 1 < len(rows) <= 4 and all(STAT_RE.match(re.sub(r"<[^>]+>", "", v)) for _, v in rows):
        cells = []
        for k, v in rows:
            num, unit = STAT_RE.match(re.sub(r"<[^>]+>", "", v)).groups()
            name, _, sub = k.partition(", ")
            s = f'<span class="s">{cap1(sub)}</span>' if sub else ""
            cells.append(f'<div><span class="k">{name}</span><span class="display v">{num} <small>{unit}</small></span>{s}</div>')
        return f'<div class="stats routes4">{"".join(cells)}</div>'
    th = f'<thead><tr><th scope="col">{head[0]}</th><th scope="col">{head[1]}</th></tr></thead>' if head else ""
    trs = "".join(f"<tr><td>{k}</td><td>{v}</td></tr>" for k, v in rows)
    return f'<div class="tbl svc"><table>{th}<tbody>{trs}</tbody></table></div>'

def r_table(t):
    rows = t.find_all("tr")
    if not rows:
        return ""
    head_cells = rows[0].find_all(["th", "td"])
    has_head = bool(t.find("thead")) or all(c.name == "th" for c in head_cells)
    out = []
    if has_head:
        out.append("<thead><tr>" + "".join(f'<th scope="col">{inner(c)}</th>' for c in head_cells) + "</tr></thead>")
        rows = rows[1:]
    def cell(c):
        h = inner(c)
        if STAT_RE.match(re.sub(r"<[^>]+>", "", h)):  # a duration such as "11.5 months" (template 08)
            return f'<td><strong class="serif tv">{h}</strong></td>'
        return f"<td>{h}</td>"
    out.append("<tbody>" + "".join("<tr>" + "".join(cell(c) for c in r.find_all(["th", "td"])) + "</tr>" for r in rows) + "</tbody>")
    cap = t.find("caption")
    capt = f"<caption>{inner(cap)}</caption>" if cap else ""
    return f'<div class="tbl"><table>{capt}{"".join(out)}</table></div>'

def r_steps(b, highlight="interview"):
    lis = b.find_all("li", recursive=False)
    parsed = [split_lead(li) for li in lis]
    hl = None
    if highlight == "interview":
        hl = next((i for i, (l, _) in enumerate(parsed) if l and "interview" in l.lower()), len(parsed) - 1)
    elif highlight == "last":
        hl = len(parsed) - 1
    out = []
    for i, (lead, rest) in enumerate(parsed):
        h3 = f"<h3>{H.escape(lead)}</h3>" if lead else ""
        out.append(f'<li><span class="display n{" hl" if i == hl else ""}">{i + 1}</span><div>{h3}<p>{rest}</p></div></li>')
    return f'<ol class="steps-l">{"".join(out)}</ol>'

def steps_from_h3(blocks):
    """h3 + following paragraphs -> numbered steps (the guide template's timeline block)."""
    items, cur = [], None
    rest = []
    for b in blocks:
        if b.name == "h3":
            cur = [txt(b), []]; items.append(cur)
        elif cur is not None:
            cur[1].append(b)
        else:
            rest.append(b)
    lis = []
    for i, (t, bs) in enumerate(items):
        body = "".join(f"<p>{inner(x)}</p>" if x.name == "p" else render(x) for x in bs)
        lis.append(f'<li><span class="display n{" hl" if i == len(items) - 1 else ""}">{i + 1}</span><div><h3>{H.escape(t)}</h3>{body}</div></li>')
    return rest, f'<ol class="steps-l">{"".join(lis)}</ol>'

def r_reviews(b):
    figs = []
    for q in b.select("blockquote"):
        p = q.find("p"); cite = q.find("cite")
        figs.append(f'<figure class="review"><span class="stars-t" role="img" aria-label="5 out of 5 stars">★★★★★</span>'
                    f'<blockquote class="serif">{inner(p) if p else ""}</blockquote><figcaption>{inner(cite) if cite else ""}</figcaption></figure>')
    return f'<div class="g3 art-rev">{"".join(figs)}</div>'

def r_quote(b):
    """a single live blockquote (cg-quote outside a review grid): a pull quote with its attribution."""
    p = b.find("p"); cite = b.find("cite")
    body = inner(p) if p else inner(b)
    c = f"<cite>{inner(cite)}</cite>" if cite else ""
    return f'<blockquote class="pull"><p class="serif">{body}</p>{c}</blockquote>'

def r_faq(details_list, open_first=True):
    out = []
    for i, d in enumerate(details_list):
        s = d.find("summary")
        q = inner(s) if s else ""
        body_el = d.select_one(".cg-acc-body") or d
        parts = []
        for c in body_el.children:
            if isinstance(c, Tag) and c.name != "summary":
                parts.append(render(c))
            elif isinstance(c, NavigableString) and c.strip() and body_el is not d:
                parts.append(f"<p>{H.escape(c.strip())}</p>")
        out.append(f'<details{" open" if (i == 0 and open_first) else ""}><summary>{q}{PLUS.format(s=22, w=2.2)}{MINUS.format(s=22, w=2.2)}</summary><div>{"".join(parts)}</div></details>')
    return "".join(out)

def r_chips(b):
    links = b.find_all("a")
    return '<div class="chips">' + "".join(f'<a class="chip" href="{H.escape(a.get("href", "#"))}">{inner(a)}</a>' for a in links) + "</div>"

def render(b, ctx=None):
    """Generic renderer for one live block."""
    c = _cls(b)
    n = b.name
    if n == "p": return r_p(b)
    if n == "h3": return f'<h3 class="art-h3" id="{heading_id(b)}">{inner(b)}</h3>'
    if n in ("h4", "h5"): return f'<h4 class="art-h4">{inner(b)}</h4>'
    if n == "ul" and "cg-cols" in c: return r_cols(b)
    if n == "ul" and "cg-kv" in c: return r_kv(b)
    if n == "ul" and ("cg-related" in c): return r_chips(b)
    if n == "ul" and ("cg-list" in c or "cg-points" in c or "cg-why" in c):
        return r_cards(b)
    if n in ("ul", "ol") and "cg-steps" in c: return r_steps(b, (ctx or {}).get("hl", "interview"))
    if n == "ul": return r_list(b)
    if n == "ol": return r_list(b, True)
    if n == "table": return r_table(b)
    if n == "figure":
        t = b.find("table")
        if t: return r_table(t)
        img = b.find("img")
        if img:
            cap = b.find("figcaption")
            return r_img(img) + (f'<p class="src-note">{inner(cap)}</p>' if cap else "")
        return ""
    if n == "div" and "wp-block-table" in c:
        t = b.find("table"); return r_table(t) if t else ""
    if n == "blockquote": return r_quote(b)
    if n == "div" and "cg-reviews" in c: return r_reviews(b)
    if n == "details": return r_faq([b], open_first=False)
    if n == "iframe":
        return f'<div class="map-box"><iframe src="{H.escape(b.get("src",""))}" title="{H.escape(b.get("title","Map"))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
    if n == "hr": return ""
    if n == "div" and "cg-cta-box" in c:
        ps = b.find_all("p")
        return "".join(f"<p>{inner(p)}</p>" for p in ps if "cg-cta-row" not in _cls(p))
    return f"<p>{inner(b)}</p>" if txt(b) else ""
