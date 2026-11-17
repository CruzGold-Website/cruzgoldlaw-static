# Writes the redesigned header and footer into .build-sources/_partials/ (build notes, part 3:
# "Header, menu and footer are copied into every page and into _partials/header.html and footer.html").
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
for name, html in (("header.html", hdr), ("footer.html", ftr)):
    open(os.path.join(P, name), "w", encoding="utf8", newline="\n").write(html)
    print("wrote", name, len(html))
