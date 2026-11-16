/* Cruz Gold redesign 2026-11: header menus, swipe rows and the review slider. No dependencies.
   Cached for 7 days: after a change run node .build-sources/bump-asset-version.mjs js/cg.js */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var hdr = d.getElementById('site-hdr');
  var dim = d.querySelector('.mega-dim');

  /* desktop mega menu: buttons with aria-expanded, one panel open at a time */
  var navBtns = [].slice.call(d.querySelectorAll('.navbtn'));
  function closeMega() {
    navBtns.forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
      var p = d.getElementById(b.getAttribute('aria-controls'));
      if (p) p.hidden = true;
    });
    if (dim) dim.hidden = true;
  }
  navBtns.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeMega();
      if (!open) {
        b.setAttribute('aria-expanded', 'true');
        d.getElementById(b.getAttribute('aria-controls')).hidden = false;
        if (dim) dim.hidden = false;
      }
    });
  });
  d.addEventListener('click', function (e) {
    if (!e.target.closest('.mega') && !e.target.closest('.navbtn')) closeMega();
  });
  if (dim) dim.addEventListener('click', closeMega);

  /* phone and tablet menu */
  var menuBtn = d.querySelector('.menu-btn');
  var mnav = d.getElementById('mnav');
  function placeMenu() {
    var b = hdr.getBoundingClientRect().bottom;
    mnav.style.top = Math.max(0, b) + 'px';
  }
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.classList.toggle('menu-open', open);
    if (open) placeMenu();
    mnav.classList.toggle('open', open);
  }
  if (menuBtn && mnav) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    window.addEventListener('resize', function () { if (mnav.classList.contains('open')) placeMenu(); });
    [].forEach.call(mnav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }
  [].forEach.call(d.querySelectorAll('.mnav-g'), function (g) {
    g.addEventListener('click', function () {
      var open = g.getAttribute('aria-expanded') === 'true';
      g.setAttribute('aria-expanded', open ? 'false' : 'true');
      d.getElementById(g.getAttribute('aria-controls')).hidden = open;
    });
  });

  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMega();
    if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });

  /* swipe rows: dots follow the scroll position */
  function pages(el) {
    var max = el.scrollWidth - el.clientWidth;
    return { max: max };
  }
  [].forEach.call(d.querySelectorAll('[data-swipe]'), function (row) {
    var dots = d.querySelector('[data-dots="' + row.getAttribute('data-swipe') + '"]');
    if (!dots) return;
    var spans = dots.children;
    function update() {
      var p = pages(row), n = spans.length;
      var i = p.max > 0 ? Math.round(row.scrollLeft / p.max * (n - 1)) : 0;
      for (var k = 0; k < n; k++) spans[k].classList.toggle('on', k === i);
    }
    row.addEventListener('scroll', update, { passive: true });
  });

  /* review slider buttons: move one view (three cards) at a time */
  var track = d.querySelector('.rv-track');
  var prev = d.querySelector('.rv-prev'), next = d.querySelector('.rv-next');
  function step(dir) {
    track.scrollBy({ left: dir * (track.clientWidth + 24), behavior: 'smooth' });
  }
  function edges() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }
  if (track && prev && next) {
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', edges, { passive: true });
    edges();
  }

  /* review sliders on the location pages: same arrow logic (filled = you can go that way) */
  [].forEach.call(d.querySelectorAll('[data-slider]'), function (t) {
    var sec = t.closest('section');
    var p = sec && sec.querySelector('.sl-prev'), n = sec && sec.querySelector('.sl-next');
    if (!p || !n) return;
    function ends() {
      p.disabled = t.scrollLeft <= 2;
      n.disabled = t.scrollLeft >= t.scrollWidth - t.clientWidth - 2;
    }
    p.addEventListener('click', function () { t.scrollBy({ left: -(t.clientWidth + 24), behavior: 'smooth' }); });
    n.addEventListener('click', function () { t.scrollBy({ left: t.clientWidth + 24, behavior: 'smooth' }); });
    t.addEventListener('scroll', ends, { passive: true });
    window.addEventListener('resize', ends);
    ends();
  });

  /* "On this page": mark the section being read */
  var tocLinks = [].slice.call(d.querySelectorAll('.toc-box a, .x-toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var targets = tocLinks.map(function (a) { return d.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    var io = new IntersectionObserver(function () {
      var cur = 0;
      targets.forEach(function (el, i) { if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) cur = i; });
      tocLinks.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    }, { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] });
    targets.forEach(function (el) { if (el) io.observe(el); });
  }

  /* phone contents list closes after a jump */
  [].forEach.call(d.querySelectorAll('.toc-phone a'), function (a) {
    a.addEventListener('click', function () { var det = a.closest('details'); if (det) det.open = false; });
  });
})();
