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

# Menu. Green Cards follows template 03/04. The other five groups use the same panel (user's call, 2026-11-17):
# three columns with a short line under each link, taken from the facts on that page, and a photo card.
# "Green card after asylum" is left out until a page covers it.
MENU = [
  ("locations", "Locations", [
     ("Our offices", [("New Jersey", "/immigration-lawyer-new-jersey/", "Ewing, just off I-295"),
                      ("Philadelphia", "/immigration-lawyer-philadelphia/", "123 S Broad Street"),
                      ("Houston", "/immigration-lawyer-houston/", "2808 Caroline Street")]),
     ("Cities we serve", [("Newark", "/immigration-lawyer-newark-nj/", "USCIS and court at 970 Broad Street"),
                          ("Jersey City", "/dedicated-immigration-lawyer-in-jersey-city/", "By video or at our Ewing office"),
                          ("Elizabeth", "/compassionate-immigration-lawyer-elizabeth-nj/", "By video or at our Ewing office")]),
     ("Start here", [("Contact us", "/contact/", "Four offices, one free consultation")])],
     ("Every office books the same consultation", "A free consultation with attorney Zachary Gold, in English or Spanish.", "grandparents", "50% 30%")),
  ("family", "Family &amp; Citizenship", [
     ("Family", [("Family-based immigration", "/family-immigration-lawyer/", "Parents, children and siblings"),
                 ("Marriage green card", "/marriage-green-card-lawyer/", "Spouses of citizens and residents"),
                 ("K-1 fiancé(e) visa", "/k1-visa-lawyer/", "A wedding in the United States")]),
     ("Green card and citizenship", [("Adjustment of status", "/adjustment-of-status-lawyer/", "Applying from inside the U.S."),
                                     ("Citizenship &amp; naturalization", "/citizenship-lawyer/", "Form N-400 and the interview")]),
     ("Start here", [("N-400 processing time", "/n400-processing-time/", "N-400 waits for Newark, Philadelphia and Houston"),
                     ("I-751 evidence checklist", "/i-751-evidence-checklist/", "Removing conditions on a green card")])],
     ("One firm from your petition to your oath", "When you qualify, we prepare your citizenship application and get you ready for the interview.", "family-hug", "50% 35%")),
  ("greencards", "Green Cards", [
     ("Through family", [("Marriage green card", "/marriage-green-card-lawyer/", "Spouses of citizens and residents"),
                         ("Family-based immigration", "/family-immigration-lawyer/", "Parents, children and siblings"),
                         ("Adjustment of status", "/adjustment-of-status-lawyer/", "Applying from inside the U.S.")]),
     ("Through work", [("EB-1A, EB-1B and EB-1C", "/eb-1-visa-lawyer/", "Extraordinary ability, researchers, executives"),
                       ("EB-2 National Interest Waiver", "/eb2-niw-lawyer/", "Self-petition for professionals"),
                       ("EB-3 and PERM", "/eb-3-visa-lawyer/", "Employer-sponsored"),
                       ("EB-5 investor", "/eb-5-visa-lawyer/", "Through an investment")]),
     ("Start here", [("All green card routes", "/green-card-lawyer/", "Which one fits you"),
                     ("What a green card costs", "/green-card-lawyer/#how-much-does-a-green-card-cost", "USCIS fees and our fees")])],
     ("Not sure which route is yours?", "Zachary Gold looks at how you entered and finds the route before you file.", "couple-hug", "60% 35%")),
  ("visas", "Visas", [
     ("Start here", [("All visas", "/visa-lawyer/", "Which visa fits your plans"),
                     ("All work visas", "/work-visa-lawyer-new-jersey/", "Temporary work visas")]),
     ("Work visas", [("H-1B", "/h1b-visa-lawyer/", "Specialty occupations"),
                     ("O-1", "/o1-visa-lawyer/", "Extraordinary ability"),
                     ("L-1", "/trusted-l-1-visa-lawyer/", "Transfers within a company"),
                     ("TN (Canada and Mexico)", "/tn-visa-lawyer/", "Canadian and Mexican professionals")]),
     ("Investors and students", [("E-2 investor", "/e-2-visa-lawyer-for-investors-entrepreneurs/", "Treaty investors"),
                                 ("Student visas", "/student-visa-lawyer-new-jersey/", "F-1, M-1 and J-1")])],
     ("Need a U.S. visa?", "Start with the one that fits your plans, and learn who has to file for it.", "professional", "50% 25%")),
  ("deportation", "Deportation &amp; Asylum", [
     ("In immigration court", [("Deportation defense", "/deportation-defense-lawyer/", "After a Notice to Appear"),
                               ("Asylum", "/asylum-lawyer/", "Afraid to return to your country")]),
     ("Related cases", [("Criminal immigration", "/criminal-immigration-lawyer/", "A charge or conviction"),
                        ("VAWA", "/vawa-lawyer/", "A green card without your abuser")]),
     ("Start here", [("Fees for court cases", "/immigration-lawyer-cost/", "Court cases are billed by the hour")])],
     ("Received a Notice to Appear?", "Call as soon as the notice arrives, and have it in front of you when we talk.", "parents-embrace", "50% 30%")),
  ("about", "About", [
     ("The firm", [("About us", "/about/", "A family firm since 1995"),
                   ("Client testimonials", "/client-testimonials/", "In our clients' own words"),
                   ("Fees", "/immigration-lawyer-cost/", "A fee you hear before you decide")]),
     ("Read", [("Blog", "/blog/", "Guides and articles")]),
     ("Get in touch", [("Contact us", "/contact/", "Four offices, one free consultation")])],
     ("You speak with Zachary Gold", "The attorney who owns the firm takes your first consultation.", "beach-flag", "50% 40%")),
]
# phone menu shows Green Cards' "Start here" group first (template 04)
PHONE_ORDER = {"greencards": [2, 0, 1]}
PHONE_SKIP = set()


def mega_panel(key, cols, card, book):
    out = []
    for title, links in cols:
        # long single lists split into columns of at most 4
        chunks = [links]
        for n, chunk in enumerate(chunks):
            lis = "".join(
                f'<li><a href="{h}"><strong>{t}</strong>' + (f'<span>{d}</span>' if d else '') + '</a></li>' for t, h, d in chunk)
            head = f'<p class="eyebrow">{title}</p>' if n == 0 else '<p class="eyebrow" aria-hidden="true">&nbsp;</p>'
            out.append(f'<div>{head}<ul>{lis}</ul></div>')
    if card:
        out.append(f'<a class="mega-card" href="{book}"><img src="/images/redesign/{card[2]}.webp" alt="" width="1200" height="800" loading="lazy" style="object-position:{card[3]}">'
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
