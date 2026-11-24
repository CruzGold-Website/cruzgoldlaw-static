/* Cached for 7 days. After any change to this file run: node .build-sources/bump-asset-version.mjs js/calendly-init.v2.js
   (gives it a new ?v= on every page that links it; see README.md). */
/**
 * Calendly inline-embed helper for cruzgoldlaw.com
 *
 * Loading (since 2026-10-03, speed PR): pages no longer put Calendly's widget.js and
 * widget.css in <head>. This script requests them after the window `load` event, once an
 * embed is within 600px of the screen. The booking iframe pulls several MB (Calendly app,
 * Stripe, reCAPTCHA, analytics) that used to compete with the page's own first render.
 * widget.js then auto-initialises every `.calendly-inline-widget[data-url]` as before, so
 * data-url (utm_source) and data-source are read exactly as they were.
 * A page that still loads widget.js in its own <head> (the ad landing pages) keeps the old
 * behaviour: nothing is injected, only the fallback timers are armed.
 *
 * What this script also handles:
 *
 *   1. GA4 `book_consultation` event: fires when Calendly emits a
 *      `calendly.event_scheduled` postMessage from inside the booking iframe.
 *
 *   2. Soft fallback CTA: if the widget hasn't rendered an <iframe> within
 *      15s of widget.js being requested (e.g. corporate firewall blocks
 *      assets.calendly.com, or the client lost connectivity mid-load), replace
 *      the empty embed shell with a phone/email/new-tab fallback so visitors
 *      can still convert.
 *
 * Loaded with `defer` so it runs after the DOM is parsed but doesn't block.
 */
(function () {
  'use strict';

  var WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
  var WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';
  var LAZY_MARGIN = '600px 0px';
  var LOAD_EVENT_MAX_WAIT_MS = 5000;
  var FALLBACK_PHONE = '(609) 924-8500';
  var FALLBACK_PHONE_HREF = 'tel:+16099248500';
  var FALLBACK_EMAIL = 'info@cruzgoldlaw.com';
  var FALLBACK_EMAIL_HREF = 'mailto:info@cruzgoldlaw.com';
  // Generic landing if data-url is missing for any reason — should never
  // happen with a build-time transformer but keeps the fallback link safe.
  var FALLBACK_BASE_URL = 'https://calendly.com/zgold-cruzgoldlaw/free-immigration-consult-organic';
  var FALLBACK_TIMEOUT_MS = 15000;

  // ── Visit attribution (first-party, since 2026-11-24) ─────────────────────
  // Every page records, in this browser's localStorage only: how the visitor
  // first arrived (landing URL, outside referrer, UTMs, ad click IDs) and the
  // pages they viewed. Nothing leaves the browser until the visitor engages
  // with the booking widget; then the record is POSTed to /api/visit (the
  // Pages Function in functions/api/visit.js), which adds city-level location
  // and forwards it to the CRM. The same visit id rides on the Calendly embed
  // URL as `salesforce_uuid`, which Calendly echoes in its booking webhook, so
  // the CRM can attach the visit to the lead. See README.md "Visit attribution".
  var VISIT_KEY = 'cg_visit_v1';
  var VISIT_ENDPOINT = '/api/visit';
  var VISIT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // a new first touch after 30 days
  var VISIT_MAX_PAGES = 50;
  var VISIT_MAX_EVENTS = 20;
  var VISIT_RESEND_MS = 5000;
  var UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var CLICK_ID_PARAMS = ['gclid', 'gbraid', 'wbraid', 'dclid', 'gclsrc', 'fbclid', 'msclkid'];

  var visit = null;
  var visitLastSent = 0;

  function newVisitId() {
    var c = window.crypto;
    if (c && typeof c.randomUUID === 'function') return 'web_' + c.randomUUID();
    var hex = '';
    for (var i = 0; i < 32; i++) {
      var n = c && c.getRandomValues ? c.getRandomValues(new Uint8Array(1))[0] & 15 : Math.floor(Math.random() * 16);
      hex += n.toString(16);
      if (i === 7 || i === 11 || i === 15 || i === 19) hex += '-';
    }
    return 'web_' + hex;
  }

  // How this page view arrived: URL, outside referrer, UTMs and ad click IDs.
  function readTouch() {
    var touch = {
      url: (window.location.pathname + window.location.search).slice(0, 500),
      referrer: '',
      at: new Date().toISOString(),
      utm: {},
      ids: {},
      tagged: false
    };
    try {
      if (document.referrer && new URL(document.referrer).hostname !== window.location.hostname) {
        touch.referrer = document.referrer.slice(0, 500);
      }
    } catch (e) { /* malformed referrer */ }
    try {
      var params = new URLSearchParams(window.location.search);
      var i, value;
      for (i = 0; i < UTM_PARAMS.length; i++) {
        value = params.get(UTM_PARAMS[i]);
        if (value) { touch.utm[UTM_PARAMS[i]] = value.slice(0, 200); touch.tagged = true; }
      }
      for (i = 0; i < CLICK_ID_PARAMS.length; i++) {
        value = params.get(CLICK_ID_PARAMS[i]);
        if (value) { touch.ids[CLICK_ID_PARAMS[i]] = value.slice(0, 300); touch.tagged = true; }
      }
    } catch (e) { /* no URLSearchParams */ }
    return touch;
  }

  function saveVisit() {
    try { window.localStorage.setItem(VISIT_KEY, JSON.stringify(visit)); } catch (e) { /* private mode */ }
  }

  function startVisit() {
    var touch = readTouch();
    var stored = null;
    try { stored = JSON.parse(window.localStorage.getItem(VISIT_KEY) || 'null'); } catch (e) { stored = null; }
    var fresh = stored && stored.id && stored.first && stored.first.at &&
      Date.now() - Date.parse(stored.first.at) < VISIT_MAX_AGE_MS;
    if (fresh) {
      visit = stored;
      if (!visit.pages) visit.pages = [];
      if (!visit.events) visit.events = [];
      // A later arrival from an ad, a tagged link or another site is kept as
      // the last touch; the first touch is never replaced.
      if (touch.tagged || touch.referrer) visit.last = touch;
    } else {
      visit = { id: newVisitId(), first: touch, last: null, pages: [], events: [], views: 0 };
    }
    var path = window.location.pathname;
    var previous = visit.pages[visit.pages.length - 1];
    if (!previous || previous.p !== path) {
      visit.pages.push({ p: path.slice(0, 200), t: Date.now() });
      visit.views = (visit.views || 0) + 1;
      // Keep the landing page plus the most recent pages.
      if (visit.pages.length > VISIT_MAX_PAGES) visit.pages.splice(1, visit.pages.length - VISIT_MAX_PAGES);
    }
    saveVisit();
  }

  // Put the visit id on each embed's Calendly URL before widget.js reads it.
  function tagWidgets() {
    if (!visit) return;
    var widgets = document.querySelectorAll('.calendly-inline-widget[data-url]');
    for (var i = 0; i < widgets.length; i++) {
      var url = widgets[i].getAttribute('data-url');
      if (!url || url.indexOf('salesforce_uuid=') !== -1) continue;
      widgets[i].setAttribute('data-url',
        url + (url.indexOf('?') === -1 ? '?' : '&') + 'salesforce_uuid=' + encodeURIComponent(visit.id));
    }
  }

  // Send the visit record to our own domain. `reason` says what the visitor did.
  function sendVisit(reason) {
    if (!visit) return;
    try {
      var now = Date.now();
      if (reason !== 'booked' && now - visitLastSent < VISIT_RESEND_MS) return;
      visitLastSent = now;
      var widget = document.querySelector('.calendly-inline-widget');
      var body = JSON.stringify({
        sessionId: visit.id,
        reason: reason,
        bookingPage: window.location.pathname,
        pageSource: widget ? widget.getAttribute('data-source') : null,
        first: visit.first,
        last: visit.last || null,
        pages: visit.pages,
        events: visit.events,
        views: visit.views || visit.pages.length
      });
      if (navigator.sendBeacon &&
          navigator.sendBeacon(VISIT_ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
      if (window.fetch) {
        window.fetch(VISIT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true,
          credentials: 'omit'
        }).catch(function () { /* tracking must never surface an error */ });
      }
    } catch (e) { /* tracking must never break booking */ }
  }

  function trackContactClicks(e) {
    if (!visit || !e.target || !e.target.closest) return;
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var kind = href.indexOf('tel:') === 0 ? 'call_click' : href.indexOf('mailto:') === 0 ? 'email_click' : null;
    if (kind) {
      visit.events.push({ e: kind, v: href.slice(0, 60), p: window.location.pathname.slice(0, 200), t: Date.now() });
      if (visit.events.length > VISIT_MAX_EVENTS) visit.events.shift();
      saveVisit();
    } else if (href.indexOf('calendly.com/') !== -1) {
      sendVisit('scheduler_link'); // fallback "open the scheduler in a new tab" link
    }
  }

  // A click inside the booking iframe moves focus into it: the earliest sign
  // the visitor is booking. Sending now gets the record to the CRM well before
  // Calendly's webhook.
  function trackWidgetFocus() {
    var active = document.activeElement;
    if (active && active.tagName === 'IFRAME' && (active.src || '').indexOf('calendly.com') !== -1) {
      sendVisit('widget_focus');
    }
  }

  function showFallbackFor(el) {
    // Don't replace if widget.js managed to inject its iframe in the meantime.
    if (el.querySelector('iframe')) return;
    var dataUrl = el.getAttribute('data-url') || FALLBACK_BASE_URL;
    el.innerHTML =
      '<div style="padding:2rem;text-align:center;background:#f5f5f5;border-radius:8px;">' +
      '<h3 style="margin-top:0;">Schedule Your Free Consultation</h3>' +
      '<p>Our online scheduler is taking a moment to load. You can also reach us directly:</p>' +
      '<p style="margin:1rem 0;"><strong>Call:</strong> <a href="' + FALLBACK_PHONE_HREF + '">' + FALLBACK_PHONE + '</a></p>' +
      '<p style="margin:1rem 0;"><strong>Email:</strong> <a href="' + FALLBACK_EMAIL_HREF + '">' + FALLBACK_EMAIL + '</a></p>' +
      '<p style="margin-top:1rem;"><a href="' + dataUrl + '" target="_blank" rel="noopener">Or open the scheduler in a new tab →</a></p>' +
      '</div>';
  }

  function armFallbackTimers() {
    var widgets = document.querySelectorAll('.calendly-inline-widget');
    for (var i = 0; i < widgets.length; i++) {
      (function (el) {
        setTimeout(function () { showFallbackFor(el); }, FALLBACK_TIMEOUT_MS);
      })(widgets[i]);
    }
  }

  var requested = false;
  function loadCalendly() {
    if (requested) return;
    requested = true;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = WIDGET_CSS;
    document.head.appendChild(css);
    var js = document.createElement('script');
    js.src = WIDGET_JS;
    js.async = true;
    document.head.appendChild(js);
    armFallbackTimers();
  }

  function loadWhenNear(widgets) {
    if (!('IntersectionObserver' in window)) { loadCalendly(); return; }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { io.disconnect(); loadCalendly(); return; }
      }
    }, { rootMargin: LAZY_MARGIN });
    for (var i = 0; i < widgets.length; i++) io.observe(widgets[i]);
  }

  function init() {
    try {
      startVisit();
      tagWidgets();
      document.addEventListener('click', trackContactClicks, true);
      window.addEventListener('blur', trackWidgetFocus);
    } catch (e) { visit = null; /* tracking must never break booking */ }
    var widgets = document.querySelectorAll('.calendly-inline-widget');
    if (!widgets.length) return;
    if (document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')) {
      armFallbackTimers(); // the page loads widget.js itself
      return;
    }
    var started = false;
    function start() { if (!started) { started = true; loadWhenNear(widgets); } }
    if (document.readyState === 'complete') { start(); return; }
    window.addEventListener('load', start);
    setTimeout(start, LOAD_EVENT_MAX_WAIT_MS); // a slow image must not hold the booking form back
  }

  // GA4 booking event — fires once when Calendly emits a booking-completed message
  function trackBookingComplete(e) {
    if (!e || !e.data) return;
    var d = e.data;
    var isCalendly = d && typeof d === 'object' && d.event && typeof d.event === 'string' && d.event.indexOf('calendly') === 0;
    if (!isCalendly) return;
    if (d.event === 'calendly.date_and_time_selected') sendVisit('time_selected');
    if (d.event === 'calendly.event_scheduled') {
      sendVisit('booked');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'book_consultation', {
          event_category: 'engagement',
          event_label: 'calendly_organic',
          page_path: window.location.pathname
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('message', trackBookingComplete);
})();
