# Shared redesign markup (header, menus, footer, call bar) for cruzgoldlaw.com. Used by build_home.py.
CAL = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>'
PHONE = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>'
CHEV = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
STAR = '<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{c}" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>'
GOOGLE = '<svg width="{s}" height="{s}" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>'
PLUS = '<svg class="ic-plus" width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="{w}" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>'
MINUS = '<svg class="ic-minus" width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="{w}" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>'
ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

def stars(s, c="#bf992d"):
    return '<span class="stars" role="img" aria-label="5 out of 5 stars">' + STAR.format(s=s, c=c) * 5 + '</span>'

PHONES = [("Ewing", "Ewing, NJ", "+16099248500", "(609) 924-8500"),
          ("Philadelphia", "Philadelphia, PA", "+12156082131", "(215) 608-2131"),
          ("Houston", "Houston, TX", "+18329247490", "(832) 924-7490")]

# Menu. Green Cards follows template 03/04 exactly. The other groups have no design yet:
# same panel, live menu links, no descriptions or photo card (flagged for Danilo).
MENU = [
  ("locations", "Locations", [
     ("Locations", [("New Jersey", "/immigration-lawyer-new-jersey/", ""), ("Philadelphia", "/immigration-lawyer-philadelphia/", ""),
                    ("Houston", "/immigration-lawyer-houston/", ""), ("Newark", "/immigration-lawyer-newark-nj/", ""),
                    ("Jersey City", "/dedicated-immigration-lawyer-in-jersey-city/", ""), ("Elizabeth", "/compassionate-immigration-lawyer-elizabeth-nj/", "")])], None),
  ("family", "Family &amp; Citizenship", [
     ("Family &amp; Citizenship", [("Family-based immigration", "/family-immigration-lawyer/", ""), ("Marriage green card", "/marriage-green-card-lawyer/", ""),
                    ("K-1 fiancé(e) visa", "/k1-visa-lawyer/", ""), ("Adjustment of status", "/adjustment-of-status-lawyer/", ""),
                    ("Citizenship &amp; naturalization", "/citizenship-lawyer/", "")])], None),
  ("greencards", "Green Cards", [
     ("Through family", [("Marriage green card", "/marriage-green-card-lawyer/", "Spouses of citizens and residents"),
                         ("Family-based immigration", "/family-immigration-lawyer/", "Parents, children and siblings"),
                         ("Adjustment of status", "/adjustment-of-status-lawyer/", "Applying from inside the U.S.")]),
     ("Through work", [("EB-1A, EB-1B and EB-1C", "/eb-1-visa-lawyer/", "Extraordinary ability, researchers, executives"),
                       ("EB-2 National Interest Waiver", "/eb2-niw-lawyer/", "Self-petition for professionals"),
                       ("EB-3 and PERM", "/eb-3-visa-lawyer/", "Employer-sponsored"),
                       ("EB-5 investor", "/eb-5-visa-lawyer/", "Through an investment")]),
     ("Start here", [("All green card routes", "/green-card-lawyer/", "Which one fits you"),
                     ("What a green card costs", "/green-card-lawyer/#how-much-does-a-green-card-cost", "USCIS fees and our fees"),
                     ("Green card after asylum", "/asylum-lawyer/", "One year after the grant")])],
     ("Not sure which route is yours?", "Zachary Gold looks at how you entered and finds the route before you file.")),
  ("visas", "Visas", [
     ("Visas", [("All visas", "/visa-lawyer/", ""), ("All work visas", "/work-visa-lawyer-new-jersey/", ""), ("H-1B", "/h1b-visa-lawyer/", ""),
                ("O-1", "/o1-visa-lawyer/", ""), ("L-1", "/trusted-l-1-visa-lawyer/", ""),
                ("E-2 investor", "/e-2-visa-lawyer-for-investors-entrepreneurs/", ""), ("TN (Canada and Mexico)", "/tn-visa-lawyer/", ""),
                ("Student visas", "/student-visa-lawyer-new-jersey/", "")])], None),
  ("deportation", "Deportation &amp; Asylum", [
     ("Deportation &amp; Asylum", [("Deportation defense", "/deportation-defense-lawyer/", ""), ("Asylum", "/asylum-lawyer/", ""),
                    ("Criminal immigration", "/criminal-immigration-lawyer/", ""), ("VAWA", "/vawa-lawyer/", "")])], None),
  ("about", "About", [
     ("About", [("About us", "/about/", ""), ("Client testimonials", "/client-testimonials/", ""), ("Fees", "/immigration-lawyer-cost/", ""),
                ("Blog", "/blog/", ""), ("Contact us", "/contact/", "")])], None),
]
# phone menu shows Green Cards' "Start here" group first (template 04)
PHONE_ORDER = {"greencards": [2, 0, 1]}
# template 04 leaves this link out of the phone menu
PHONE_SKIP = {"Green card after asylum"}


def mega_panel(key, cols, card, book):
    out = []
    for title, links in cols:
        # long single lists split into columns of at most 4
        chunks = [links[i:i + 4] for i in range(0, len(links), 4)] if not card else [links]
        for n, chunk in enumerate(chunks):
            lis = "".join(
                f'<li><a href="{h}"><strong>{t}</strong>' + (f'<span>{d}</span>' if d else '') + '</a></li>' for t, h, d in chunk)
            head = f'<p class="eyebrow">{title}</p>' if n == 0 else '<p class="eyebrow" aria-hidden="true">&nbsp;</p>'
            out.append(f'<div>{head}<ul>{lis}</ul></div>')
    if card:
        out.append(f'<a class="mega-card" href="{book}"><img src="/images/redesign/couple-hug.webp" alt="" width="1600" height="1066" loading="lazy">'
                   f'<span class="mega-card-shade"></span><span class="mega-card-txt"><span class="serif mega-card-t">{card[0]}</span>'
                   f'<span class="mega-card-p">{card[1]}</span><span class="btn btn-gold">Book a free consultation</span></span></a>')
    return f'<div class="mega" id="mega-{key}" hidden><div class="wrap mega-in">{"".join(out)}</div></div>'


def header(book="#book", home="/"):
    ubar_phones = "".join(f'<span>{c} <a href="tel:{t}">{n}</a></span>' for c, _, t, n in PHONES)
    nav = "".join(
        f'<button class="navlink navbtn" type="button" aria-expanded="false" aria-controls="mega-{k}">{label} {CHEV}</button>'
        for k, label, _, _ in MENU)
    megas = "".join(mega_panel(k, cols, card, book) for k, _, cols, card in MENU)
    groups = []
    for k, label, cols, _ in MENU:
        order = PHONE_ORDER.get(k, range(len(cols)))
        body = ""
        for i in order:
            title, links = cols[i]
            if len(cols) > 1:
                body += f'<p class="eyebrow">{title}</p>'
            body += "".join(f'<a href="{h}">{t}</a>' for t, h, _ in links if t not in PHONE_SKIP)
        groups.append(f'<button class="mnav-g" type="button" aria-expanded="false" aria-controls="mnav-{k}">{label}'
                      f'{PLUS.format(s=18, w=2.4)}{MINUS.format(s=18, w=2.4)}</button><div class="mnav-p" id="mnav-{k}" hidden>{body}</div>')
    mphones = "".join(f'<span>{c} <a href="tel:{t}">{n}</a></span>' for c, _, t, n in PHONES)
    return f'''<div class="ubar"><div class="wrap ubar-in">
<div class="ubar-l"><span class="ubar-free hide-phone">{CAL.format(s=15, c="#d9b65a")}Free consultation with attorney Zachary Gold</span><span class="ubar-es">¡Hablamos español!</span></div>
<div class="ubar-r"><div class="desk-only ubar-phones">{ubar_phones}</div><a class="ubar-call" href="tel:+16099248500">(609) 924-8500</a></div>
</div></div>
<header class="site-hdr" id="site-hdr">
<div class="wrap hdr">
<a href="{home}" aria-label="Cruz Gold &amp; Associates, home"><img class="site-logo" src="/images/redesign/logo-color.webp" alt="Cruz Gold &amp; Associates" width="440" height="234"></a>
<nav class="desk-only mainnav" aria-label="Main">{nav}</nav>
<div class="hdr-act">
<a class="btn btn-gold hide-phone hdr-cta" href="{book}">Free consultation</a>
<a class="mob-only icon-btn call-ic" href="tel:+16099248500" aria-label="Call the Ewing office">{PHONE.format(s=22, w=2)}</a>
<button class="mob-only icon-btn menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><svg class="ic-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg><svg class="ic-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c152c" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
</div>
</div>
{megas}
</header>
<div class="mega-dim" hidden></div>
<nav class="mnav" id="mnav" aria-label="Main">
<div class="mnav-list">{"".join(groups)}</div>
<div class="mnav-foot"><a class="btn btn-gold" href="{book}">Book a free consultation</a><div class="mnav-phones">{mphones}</div></div>
</nav>'''


def footer(pad_cls="", book="#book"):
    return f'''<footer class="foot{pad_cls}">
<div class="wrap">
<div class="footgrid">
<div class="foot-brand">
<img class="foot-logo" src="/images/redesign/logo-white.webp" alt="Cruz Gold &amp; Associates" width="440" height="234" loading="lazy">
<p class="foot-about">Immigration lawyers for families, workers and people facing immigration court in New Jersey, Philadelphia and Houston. Since 1995.</p>
<p class="foot-contact"><a class="foot-tel" href="tel:+16099248500">(609) 924-8500</a><br><span class="foot-dot"> · </span><a href="mailto:info@cruzgoldlaw.com">info@cruzgoldlaw.com</a></p>
</div>
<div class="foot-col-p"><p class="eyebrow light">Practice</p><ul><li><a href="/family-immigration-lawyer/">Family &amp; Citizenship</a></li><li><a href="/green-card-lawyer/">Green Cards</a></li><li><a href="/visa-lawyer/">Visas</a></li><li><a href="/deportation-defense-lawyer/">Deportation Defense</a></li><li class="foot-hide-ph"><a href="/asylum-lawyer/">Asylum</a></li></ul></div>
<div class="foot-col-l"><p class="eyebrow light">Locations</p><ul><li><a href="/immigration-lawyer-new-jersey/">New Jersey</a></li><li class="foot-hide-ph"><a href="/immigration-lawyer-newark-nj/">Newark</a></li><li class="foot-hide-ph"><a href="/dedicated-immigration-lawyer-in-jersey-city/">Jersey City</a></li><li class="foot-hide-ph"><a href="/compassionate-immigration-lawyer-elizabeth-nj/">Elizabeth</a></li><li><a href="/immigration-lawyer-philadelphia/">Philadelphia</a></li><li><a href="/immigration-lawyer-houston/">Houston</a></li></ul></div>
<div class="foot-col-f"><p class="eyebrow light">Firm</p><ul><li><a href="/about/">About us</a></li><li class="foot-hide-ph"><a href="/client-testimonials/">Client stories</a></li><li class="foot-hide-ph"><a href="/immigration-lawyer-cost/">Fees</a></li><li class="foot-hide-ph"><a href="/blog/">Blog</a></li><li class="foot-hide-ph"><a href="/contact/">Contact</a></li><li class="foot-hide-ph"><a href="/sitemap/">Sitemap</a></li></ul></div>
</div>
<div class="foot-bot">
<span>© 2026 Cruz Gold &amp; Associates<span class="foot-hide-ph">. All rights reserved.</span><span class="foot-ph"> ·</span> <a href="/privacy-policy/">Privacy policy</a></span>
<span class="foot-hide-ph">Results may vary depending on your particular facts and legal circumstances.</span>
</div>
</div>
</footer>
<div class="callbar"><a class="btn btn-line" href="tel:+16099248500">{PHONE.format(s=18, w=2.2)}Call</a><a class="btn btn-gold" href="{book}">Free consultation</a></div>'''
