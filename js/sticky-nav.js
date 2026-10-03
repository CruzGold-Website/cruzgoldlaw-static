/* Cached for 7 days. After any change to this file run: node .build-sources/bump-asset-version.mjs js/sticky-nav.js
   (gives it a new ?v= on every page that links it; see README.md). */
/**
 * Sticky header for cruzgoldlaw.com, without jQuery (2026-10-03).
 *
 * A plain-JavaScript port of what GP Premium's sticky.min.js did with this site's settings
 * (body classes sticky-enabled, both-sticky-menu, sticky-menu-fade, mobile-header, mobile-header-sticky):
 *   - desktop: #site-navigation turns fixed at the top once the page has scrolled two nav heights past
 *     the nav, fading in over 300 ms, and goes back in place when the page is scrolled above it; while
 *     stuck its id is "sticky-navigation", as GeneratePress's CSS expects;
 *   - phones: #mobile-header turns fixed as soon as the page scrolls;
 *   - a hidden copy (#sticky-placeholder) keeps the header's space so the page does not jump;
 *   - the stuck element gets "is_stuck navigation-stick navigation-clone" and, half a nav height later,
 *     "sticky-navigation-transition", which the stylesheets use (sticky logo, background).
 * Only the nav that is visible at the current width is active. sticky.min.js stays in the repo for the
 * ad landing pages, which still load jQuery.
 */
(function () {
  'use strict';

  var body = document.body;
  var FIXED = ['is_stuck', 'navigation-stick', 'navigation-clone'];
  var CLEARED = ['max-width', 'margin-top', 'margin-left', 'margin-right', 'position', 'top', 'left', 'right',
    'bottom', 'width', 'opacity', 'height', 'overflow', 'transform', 'transition', 'visibility', 'z-index'];

  function visible(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }

  function pageTop(el) {
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  function Sticky(el, fade, isActive) {
    this.el = el;
    this.fade = fade;
    this.isActive = isActive;
    this.stuck = false;
    this.top = 0;
    this.fadeTimer = 0;
    this.makePlaceholder();
    el.classList.add('stuckElement');
  }

  // Copy of the nav taken before it is marked, as GP does: same classes and content, hidden.
  Sticky.prototype.makePlaceholder = function () {
    var ph = this.el.cloneNode(true);
    ph.id = 'sticky-placeholder';
    ph.setAttribute('aria-hidden', 'true');
    ph.removeAttribute('itemtype');
    ph.removeAttribute('itemscope');
    ph.style.visibility = 'hidden';
    ph.style.display = 'none';
    this.ph = ph;
  };

  Sticky.prototype.stick = function () {
    var el = this.el, ph = this.ph, self = this;
    this.stuck = true;
    el.style.zIndex = '10000';
    if (this.fade) el.style.display = 'none';
    el.parentNode.insertBefore(ph, el.nextSibling);
    ph.style.display = '';
    if (getComputedStyle(ph).display === 'none') ph.style.display = 'block';
    FIXED.forEach(function (c) { ph.classList.add(c); });
    var side = getComputedStyle(el).cssFloat;
    if (side === 'left' || side === 'right') {
      ph.style.cssFloat = side;
      ph.style.setProperty('width', 'auto', 'important');
    }
    FIXED.forEach(function (c) { el.classList.add(c); });
    if (el.id === 'site-navigation') el.id = 'sticky-navigation';
    el.style.marginTop = '0px';
    el.style.position = 'fixed';
    el.style.top = '0px';
    el.style.left = '';
    el.style.right = '';
    el.style.bottom = '';
    if (this.fade) {
      el.style.display = '';
      el.style.opacity = '0';
      void el.offsetWidth;
      el.style.transition = 'opacity 300ms';
      el.style.opacity = '1';
      clearTimeout(this.fadeTimer);
      this.fadeTimer = setTimeout(function () {
        if (!self.stuck) return;
        el.style.removeProperty('opacity');
        el.style.removeProperty('transition');
      }, 320);
    }
  };

  Sticky.prototype.unstick = function () {
    var el = this.el;
    clearTimeout(this.fadeTimer);
    if (this.ph.parentNode) this.ph.parentNode.removeChild(this.ph);
    FIXED.forEach(function (c) { el.classList.remove(c); });
    CLEARED.forEach(function (p) { el.style.removeProperty(p); });
    if (el.style.display === 'none') el.style.removeProperty('display');
    el.classList.remove('sticky-navigation-transition', 'navigation-transition', 'sticky-nav-scrolling-up');
    if (el.id === 'sticky-navigation') el.id = 'site-navigation';
    this.stuck = false;
  };

  Sticky.prototype.update = function () {
    var el = this.el;
    if (!this.isActive()) {
      if (this.stuck) this.unstick();
      return;
    }
    var y = window.pageYOffset;
    if (!this.stuck) this.top = pageTop(el);
    var gap = this.fade ? 2 * el.offsetHeight : 0;
    if (!this.stuck && y > this.top && y >= this.top + gap) this.stick();
    if (this.stuck && y >= this.top + el.offsetHeight / 2) {
      el.classList.add('sticky-navigation-transition');
      this.ph.classList.add('sticky-navigation-transition');
    }
    if (this.stuck && y <= this.top) this.unstick();
    if (this.stuck) {
      // the fixed nav takes the width of the space it left
      var w = this.ph.getBoundingClientRect().width;
      if (Math.abs(w - el.getBoundingClientRect().width) > 0.5) el.style.width = w + 'px';
    }
  };

  var stickies = [];
  var desktopNav = document.getElementById('site-navigation');
  var mobileHeader = document.getElementById('mobile-header');
  if (body.classList.contains('sticky-enabled') && desktopNav) {
    stickies.push(new Sticky(desktopNav, body.classList.contains('sticky-menu-fade'), function () {
      return !(body.classList.contains('mobile-header') && visible(mobileHeader));
    }));
  }
  if (body.classList.contains('mobile-header') && body.classList.contains('mobile-header-sticky') && mobileHeader) {
    stickies.push(new Sticky(mobileHeader, false, function () { return visible(mobileHeader); }));
  }
  if (!stickies.length) return;

  function updateAll() {
    for (var i = 0; i < stickies.length; i++) stickies[i].update();
  }
  window.addEventListener('scroll', updateAll, { passive: true });
  window.addEventListener('resize', updateAll);

  // When the width changes, start over from the unstuck state (GP re-attaches the visible nav).
  var lastWidth = window.innerWidth, resizeTimer = 0;
  function onWidthChange() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      for (var i = 0; i < stickies.length; i++) {
        if (stickies[i].stuck) stickies[i].unstick();
        stickies[i].makePlaceholder();
      }
      updateAll();
    }, 250);
  }
  window.addEventListener('resize', onWidthChange);
  window.addEventListener('orientationchange', onWidthChange);

  // A same-page #anchor link in an open menu closes the menu first, as GP's script did.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.main-navigation ul a[href*="#"]');
    if (!a) return;
    var nav = a.closest('nav');
    if (a.pathname === window.location.pathname && a.getAttribute('href') !== '#' && nav && nav.classList.contains('toggled')) {
      nav.classList.remove('toggled');
      document.documentElement.classList.remove('mobile-menu-open');
    }
  });

  updateAll();
})();
