# Builds the redesigned home page: keeps the live <head> meta/JSON-LD/analytics, swaps CSS and body.
# usage: python -I build_home.py <repo>
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parts import *

repo = sys.argv[1]
V = "20261118g"
src = open(os.path.join(repo, "index.html"), encoding="utf8").read()
if "cg-home.css" in src:
    sys.exit("index.html is already the redesign; build from git show master:index.html")
head_end = src.index("</head>")
head = src[:head_end]
# keep everything from <!DOCTYPE to the og/ld block, drop old font preloads + theme CSS, keep gtag + favicons + calendly-init
head = re.sub(r'<link rel="preload" href="/fonts/[^"]+" as="font"[^>]*>\n?', "", head)
head = re.sub(r'\s*<link rel="stylesheet"[^>]*href="/css/[^"]+"[^>]*>', "", head)
head = re.sub(r'<script src="/js/lazy-video\.js[^"]*" defer></script>\n?', "", head)
assert "calendly-init.v2.js" in head and "GT-K4TGJWQ6" in head and "application/ld+json" in head
new_css = (f'<link rel="preload" href="/fonts/TuGOUUFxWphYQ6YI6q9Xp61FQzxDRKmzr1lWfxk.woff2" as="font" type="font/woff2" crossorigin>\n'
           f'<link rel="preload" href="/fonts/mulish-v18-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
           f'<link rel="stylesheet" href="/css/cg.css?v={V}">\n<link rel="stylesheet" href="/css/cg-home.css?v={V}">\n')
head = head.replace('<!-- Google tag (gtag.js)', new_css + '<!-- Google tag (gtag.js)', 1)
assert new_css in head

CALENDLY = "https://calendly.com/zgold-cruzgoldlaw/free-immigration-consult-organic?utm_source=website&amp;primary_color=bf992d&amp;text_color=0c152c"
CHECK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#866a19" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'

def svc(img, pos, title, text, links, ph_hide):
    lis = "".join(f'<li{" class=\"ph-hide\"" if i in ph_hide else ""}><a href="{h}">{t} <span aria-hidden="true">›</span></a></li>' for i, (t, h) in enumerate(links))
    return (f'<article class="svc-card"><img src="/images/redesign/{img}.webp" alt="" width="600" height="400" loading="lazy" style="object-position:{pos}">'
            f'<div class="svc-body"><h3 class="serif">{title}</h3><p>{text}</p><ul>{lis}</ul></div></article>')

REVIEWS = [  # the six home reviews from the live page, word for word; the first three cut as in the design, … marks every cut
  ("RT", "", "Roberto A. Tejada Arevalo", "We hired Zach for our adjustment of status interview and it couldn’t have gone better! I felt safe and confident going in to my interview with Zach accompanying my wife and I as counsel. …"),
  ("AA", "", "Amal Ahmed", "Great experience with lawyer Zachary! He helped us prepare for our upcoming Stokes interview, advised us on additional evidence to submit, and attended the interview with us. …"),
  ("ND", " gold", "Natalie D", "Above and beyond!! … We were going through the immigration process when multiple new memos were published, and Zach was extremely helpful in providing guidance and, honestly, just calming us down. …"),
  ("MW", "", "Marly Lisa White", "He helped me throughout my green card process from beginning to end. … One thing I really appreciated is that he will never pressure you into doing something just to take your money. …"),
  ("JB", "", "Jovino Balunan", "Attorney Zach assisted and helped me with my second interview after a long time of wait. On the next day, my I-485 was approved. He really did an amazing Job explaining my case to the officer. …"),
  ("L", " gold", "Lissette", "Zach is hands down one of the BEST immigration attorneys out there. He’s attentive, responsive, and has an incredible attention to detail. …"),
]
def review(ini, cls, name, text):
    return (f'<figure class="review">{stars(15)}<blockquote class="serif">{text}</blockquote>'
            f'<figcaption><span class="rv-av{cls}" aria-hidden="true">{ini}</span><span class="rv-who"><strong>{name}</strong><span>Google review</span></span></figcaption></figure>')

FAQ = [  # live page, word for word
  ("How much does an immigration lawyer cost?", 'Most green card, citizenship and family petitions have a flat fee, court cases are billed by the hour, and government filing fees are separate. You hear our fee before any work begins, and our <a href="/immigration-lawyer-cost/">guide to immigration lawyer costs</a> lists typical ranges.'),
  ("Do immigration lawyers offer free consultations?", "Many do, and we do. The first 20-minute consultation with attorney Zachary Gold is free, and you can book it online."),
  ("Do I need an immigration lawyer for a green card?", "The law does not require one. A lawyer matters most when your history has a complication: an earlier overstay or entry without inspection, an arrest or conviction, a past denial, or a case already in immigration court. In those cases a filing mistake can lead to a denial or to removal proceedings."),
  ("What does an immigration lawyer do?", 'An immigration lawyer prepares and files applications with USCIS, gets clients ready for their interviews, and represents them in immigration court. Our cases cover <a href="/family-immigration-lawyer/">family petitions</a>, <a href="/adjustment-of-status-lawyer/">green cards through adjustment of status</a>, <a href="/citizenship-lawyer/">citizenship</a>, <a href="/work-visa-lawyer-new-jersey/">work visas</a> and removal defense.'),
  ("Can an immigration lawyer speed up my case?", "A lawyer cannot change how fast USCIS works through its queue. USCIS grants an expedite request only in limited situations, such as severe financial loss or an urgent humanitarian reason, and some work petitions can use premium processing for an extra fee. A complete filing lowers the chance of a request for evidence, which can add months to a case."),
]
faq = "".join(f'<details{" open" if i == 0 else ""}><summary>{q}{PLUS.format(s=22, w=2.2)}{MINUS.format(s=22, w=2.2)}</summary><p>{a}</p></details>' for i, (q, a) in enumerate(FAQ))

OFFICES = [
  ("Ewing, NJ", "830 Bear Tavern Rd, Suite 108", "Ewing Township, NJ 08628", "+16099248500", "(609) 924-8500", "https://www.google.com/maps?cid=2806749106084288155"),
  ("Hackensack, NJ", "831 Main St", "Hackensack, NJ 07601", "+16099248500", "(609) 924-8500", "https://www.google.com/maps?cid=12247082169007836280"),
  ("Philadelphia, PA", "123 S Broad St, Suite 1529", "Philadelphia, PA 19109", "+12156082131", "(215) 608-2131", "https://www.google.com/maps?cid=11561832743529919948"),
  ("Houston, TX", "2808 Caroline St #103-F", "Houston, TX 77004", "+18329247490", "(832) 924-7490", "https://www.google.com/maps?cid=7409599879789718386"),
]
offices = "".join(
  f'<div class="h-off"><div class="h-off-n"><h3 class="serif">{n}</h3><p class="h-off-a">{a1}<br><span class="l2">{a2}</span></p></div>'
  f'<p class="h-off-l"><a class="tel" href="tel:{t}">{tn}</a><a class="dir" href="{m}" target="_blank" rel="noopener">Directions</a></p></div>'
  for n, a1, a2, t, tn, m in OFFICES)

callus = "".join(f'<li><a href="tel:{t}"><span>{c}<span class="cityph">{full[len(c):]}</span></span> <strong>{n}</strong></a></li>' for c, full, t, n in PHONES)

body = f'''<body class="cg-site home">
<div class="cg">
{header()}
<main id="main">

<section class="h-hero">
<div class="h-hex hexbg" aria-hidden="true"></div>
<div class="wrap h-hero-in">
<div class="hero-grid">
<div class="h-copy">
<h1 class="eyebrow h-h1"><span class="h-h1-line" aria-hidden="true"></span>Cruz Gold &amp; Associates, Immigration Lawyers</h1>
<p class="display h-xl h-title">Know your path, your timeline and your fee <em>from the first call.</em></p>
<p class="lede h-lede">A free consultation with attorney Zachary Gold, for clients across <a href="/immigration-lawyer-new-jersey/">New Jersey</a> and in <a href="/immigration-lawyer-philadelphia/">Philadelphia</a> and <a href="/immigration-lawyer-houston/">Houston</a>. Most applications have a flat fee, and you hear it before any work begins. In English or Spanish.</p>
<div class="btn-row">
<a class="btn btn-gold" href="#book">{CAL.format(s=18, c="currentColor")}Book a free consultation</a>
<a class="btn btn-line" href="tel:+16099248500">{PHONE.format(s=18, w=2)}Call (609) 924-8500</a>
</div>
<div class="h-trust">
<a class="h-rating" href="#our-offices">{GOOGLE.format(s=26)}<span class="h-rating-t"><span class="h-rating-top"><strong class="serif">5.0</strong>{stars(14)}</span><span class="h-rating-sub">113 <span class="ph-hide">Google </span>reviews, four offices</span></span></a>
<span class="h-vbar" aria-hidden="true"></span>
<span class="h-aila"><img src="/images/redesign/aila-logo.svg" alt="AILA" width="34" height="34"><span>Member, American Immigration Lawyers <span class="ph-hide">Association</span><span class="ph-only">Assoc.</span></span></span>
</div>
</div>
<div class="h-media">
<div class="h-frame" aria-hidden="true"></div>
<img class="h-photo" src="/images/redesign/airport-reunion.webp" alt="" width="1200" height="788" fetchpriority="high">
<div class="h-zach"><img src="/images/redesign/zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008"><span class="h-zach-t"><strong>You speak with Zachary Gold</strong><span>The attorney who owns the firm takes your first consultation.</span></span></div>
<div class="h-quote">{stars(14, "#d9b65a")}<p class="serif">“He also attended my green card interview with me, which made me feel much more comfortable …”</p><span class="h-quote-by">Marly Lisa White, Google review</span></div>
</div>
</div>
</div>
</section>

<section class="h-firm">
<div class="wrap split">
<div class="h-mosaic">
<img class="h-m1" src="/images/redesign/family-baby.webp" alt="" width="600" height="400" loading="lazy">
<img class="h-m2" src="/images/redesign/grandparents.webp" alt="" width="600" height="405" loading="lazy">
<img class="h-m3" src="/images/redesign/senior-couple.webp" alt="" width="600" height="405" loading="lazy">
<div class="h-since"><img src="/images/redesign/monogram-white-112.webp" alt="" width="112" height="83" loading="lazy"><span class="serif h-since-t">Since 1995</span><span class="h-since-p">Founded by Marta Cruz Gold in Mercer County, New Jersey.</span></div>
</div>
<div class="stack24">
<p class="eyebrow">A family firm</p>
<h2 class="display h-l h-h2">We know what it means to build a life in a new country.</h2>
<p class="lede">Marta Cruz Gold opened the practice in 1995. Her son, attorney Zachary Gold, leads it today, and his interest in immigration law comes from his own parents’ move to the United States. Our roots are Cuban-American, and we work with clients in Spanish as well as English.</p>
<p class="h-body">Families, workers, students and people facing immigration court come to us from across New Jersey, Philadelphia and Houston. Every case starts with a conversation with the attorney about your options, before anything is filed.</p>
<a class="arrow-link" href="/about/">Our story {ARROW}</a>
</div>
</div>
</section>

<section class="h-svc">
<div class="wrap">
<div class="sec-head">
<div class="sec-head-t"><p class="eyebrow">What we handle</p><h2 class="display h-l h-h2">From the first petition to the citizenship oath</h2></div>
<a class="btn btn-line" href="/sitemap/">See all services</a>
</div>
<div class="g4" data-swipe="svc">
{svc("family-hug", "50% 35%", "Family &amp; Citizenship", "Petitions for spouses, parents, children and siblings, fiancé(e) visas, green cards through adjustment of status, and your citizenship application when you qualify.",
     [("Family-based immigration", "/family-immigration-lawyer/"), ("Marriage green card", "/marriage-green-card-lawyer/"), ("K-1 fiancé(e) visa", "/k1-visa-lawyer/"), ("Citizenship &amp; naturalization", "/citizenship-lawyer/")], {0})}
{svc("beach-flag", "50% 40%", "Green Cards", "Permanent residence through family, work or an investment, including self-petitions such as EB-1A and the National Interest Waiver.",
     [("All green card routes", "/green-card-lawyer/"), ("Adjustment of status", "/adjustment-of-status-lawyer/"), ("EB-2 National Interest Waiver", "/eb2-niw-lawyer/"), ("EB-5 investor", "/eb-5-visa-lawyer/")], {1})}
{svc("professional", "50% 25%", "Work &amp; Student Visas", "Temporary visas for professionals, company transferees, investors and students. We prepare the petition, answer requests for evidence and plan the next status.",
     [("H-1B", "/h1b-visa-lawyer/"), ("O-1", "/o1-visa-lawyer/"), ("L-1 and E-2", "/work-visa-lawyer-new-jersey/"), ("All visa types", "/visa-lawyer/")], {2})}
{svc("parents-embrace", "50% 30%", "Deportation &amp; Asylum", "If you or a family member has received a Notice to Appear, we can represent the person named on it in immigration court. Call as soon as it arrives.",
     [("Deportation defense", "/deportation-defense-lawyer/"), ("Asylum", "/asylum-lawyer/"), ("Fees for court cases", "/immigration-lawyer-cost/")], set())}
</div>
<div class="dots" aria-hidden="true" data-dots="svc"><span class="on"></span><span></span><span></span><span></span></div>
</div>
</section>

<section class="h-band">
<img src="/images/redesign/couple-hug.webp" alt="" width="1600" height="1066" loading="lazy">
<div class="h-band-shade" aria-hidden="true"></div>
<div class="wrap on-dark h-band-in">
<div class="h-band-t">
<p class="eyebrow light">At your interview</p>
<h2 class="display h-l h-band-h">You will not walk into your interview <em>alone.</em></h2>
<p class="lede" style="color:#dfe3ec">Attorney Zachary Gold goes over the likely questions with you beforehand, in English or Spanish, and attends your USCIS field office interview in person.</p>
<div><a class="btn btn-gold" href="#book">Book a free consultation</a></div>
</div>
</div>
</section>

<section class="h-zachary">
<div class="wrap split split-56">
<div class="h-hexpic"><div class="h-hex1" aria-hidden="true"></div><div class="h-hex2" aria-hidden="true"></div><img src="/images/redesign/zachary.webp" alt="Attorney Zachary Gold" width="942" height="1008" loading="lazy"></div>
<div class="stack24">
<p class="eyebrow">Your attorney</p>
<h2 class="display h-l h-h2">Meet attorney Zachary Gold</h2>
<p class="lede">Zachary Gold owns the firm and is the attorney you speak with at your first consultation. He started out at the firm as a paralegal, studied at Rutgers University and earned his law degree at Drexel University.</p>
<ul class="checks">
<li>{CHECK}Member of the American Immigration Lawyers Association</li>
<li>{CHECK}Attends USCIS interviews with his clients</li>
<li>{CHECK}Your fee quoted before any work begins</li>
<li>{CHECK}Family petitions, work visas and court cases under one roof</li>
</ul>
<figure class="h-zq"><svg width="34" height="26" viewBox="0 0 34 26" fill="#bf992d" aria-hidden="true"><path d="M0 26V15C0 6 5 1 13 0l1 4c-4 1-7 4-7 9h6v13zm20 0V15c0-9 5-14 13-15l1 4c-4 1-7 4-7 9h6v13z"/></svg>
<blockquote class="serif">One thing I really appreciated is that he will never pressure you into doing something just to take your money.</blockquote>
<figcaption>Marly Lisa White, Google review</figcaption></figure>
<div class="btn-row"><a class="btn btn-navy" href="#book">Book with Zachary</a><a class="btn btn-line" href="/about/">About the firm</a></div>
</div>
</div>
</section>

<section class="h-book" id="book">
<div class="wrap h-book-in">
<p class="eyebrow">Free consultation</p>
<h2 class="display h-l h-h2">Pick a time to talk with <em>Zachary</em></h2>
<p class="lede">Choose a day below. You speak with attorney Zachary Gold, and you hear the fee before any work begins.</p>
<div class="h-cal"><div class="calendly-inline-widget" data-url="{CALENDLY}" data-source="website" data-resize="true"></div></div>
<div class="h-callus"><span class="h-callus-l"><strong>Prefer to call?</strong></span> <ul>{callus}</ul></div>
</div>
</section>

<section class="h-marta">
<div class="wrap">
<div class="memorial">
<div class="h-arch"><div class="h-arch-frame" aria-hidden="true"></div><img src="/images/redesign/marta.webp" alt="Marta Cruz Gold" width="327" height="490" loading="lazy"></div>
<div class="h-marta-t">
<p class="eyebrow">In memory of our founder</p>
<h2 class="display h-marta-h">Marta Cruz Gold <span>1969–2023</span></h2>
<p class="serif h-marta-q">Marta’s legacy of integrity, excellence and empathy continues to guide us.</p>
<p class="h-marta-p">Marta’s legal journey began at Rutgers University School of Law and led to her own practice, The Law Office of Marta Cruz Gold, in 1995. Known for her dedication to justice and mentorship, and for her role as a community leader in Mercer County, she left a lasting impact in and out of the courtroom. Cruz Gold &amp; Associates continues her mission to provide compassionate legal services in Ewing, NJ.</p>
</div>
</div>
</div>
</section>

<section class="h-rev">
<div class="wrap">
<div class="sec-head">
<div class="sec-head-t"><p class="eyebrow">Client stories</p><h2 class="display h-l h-h2">What our clients say about working with us</h2></div>
<div class="h-rbox">{GOOGLE.format(s=34)}<span class="h-rbox-t"><span class="h-rbox-top"><strong class="serif">5.0</strong>{stars(17)}</span><a href="#our-offices">113 Google reviews across our four offices</a></span></div>
</div>
<div class="rv-track" data-swipe="rv" tabindex="0" aria-label="Client reviews">
{"".join(review(*r) for r in REVIEWS)}
</div>
<div class="h-rev-foot">
<p class="disclaim">Results may vary depending on your particular facts and legal circumstances.</p>
<span class="rv-ctrl"><span class="dots" aria-hidden="true" data-dots="rv"><span class="on"></span><span></span></span><button class="rv-prev" type="button" aria-label="Previous reviews">‹</button><button class="rv-next" type="button" aria-label="Next reviews">›</button><a class="btn btn-line" href="/client-testimonials/">All client stories</a></span>
</div>
</div>
</section>

<section class="h-faq">
<div class="wrap g2 faqgrid h-faq-in">
<div class="h-faq-l">
<p class="eyebrow">Common questions</p>
<h2 class="display h-l h-faq-h">Before you call, here is what most people ask</h2>
<p class="lede">Still unsure? The consultation is free, and Zachary can answer the questions that only your own case can answer.</p>
<div class="h-faq-btns"><a class="btn btn-navy" href="#book">Ask Zachary directly</a><a class="more" href="/blog/">Read our guides ›</a></div>
</div>
<div class="faq">{faq}</div>
</div>
</section>

<section class="h-cta">
<img src="/images/redesign/reunion-grandpa.webp" alt="" width="1600" height="1066" loading="lazy">
<div class="h-cta-shade" aria-hidden="true"></div>
<div class="wrap on-dark h-cta-in">
<div class="h-cta-t">
<img class="h-cta-mono" src="/images/redesign/monogram-white-112.webp" alt="" width="112" height="83" loading="lazy">
<h2 class="display h-l h-cta-h">Take the first step toward <em>peace of mind</em></h2>
<p class="lede">Every office books the same free consultation with attorney Zachary Gold. ¡Hablamos español!</p>
<div class="btn-row"><a class="btn btn-gold" href="#book">Book a free consultation</a><a class="btn btn-ghost" href="tel:+16099248500">Call (609) 924-8500</a></div>
</div>
<div class="g4 h-offices" id="our-offices">{offices}</div>
</div>
</section>

</main>
{footer()}
</div>
<script src="/js/cg.js?v={V}" defer></script>
</body>
</html>
'''
out = head + "</head>\n" + body
open(os.path.join(repo, "index.html"), "w", encoding="utf8", newline="\n").write(out)
print("wrote", len(out), "bytes")
