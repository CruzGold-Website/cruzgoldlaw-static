/**
 * Calendly inline-embed helper for cruzgoldlaw.com
 *
 * The embed divs themselves carry `data-url` (Calendly's canonical pattern) so
 * widget.js auto-initialises every `.calendly-inline-widget[data-url]` it
 * finds at load time. We do NOT call `Calendly.initInlineWidget()` from here —
 * that would race the async-loaded widget.js (which may not have populated
 * `window.Calendly` by the time this defer-script runs).
 *
 * What this script DOES handle:
 *
 *   1. GA4 `book_consultation` event: fires when Calendly emits a
 *      `calendly.event_scheduled` postMessage from inside the booking iframe.
 *
 *   2. Soft fallback CTA: if the widget hasn't rendered an <iframe> within
 *      15s (e.g. corporate firewall blocks assets.calendly.com, or client
 *      lost connectivity mid-load), replace the empty embed shell with a
 *      phone/email/new-tab fallback so visitors can still convert.
 *
 *      15s is intentionally permissive — Calendly's widget.js is async, the
 *      iframe contents come from a third-party origin with its own CDN, and
 *      slow mobile networks regularly take 8-10s to first paint.
 *
 * Loaded with `defer` so it runs after the DOM is parsed but doesn't block.
 */
(function () {
  'use strict';

  var FALLBACK_PHONE = '(609) 924-8500';
  var FALLBACK_PHONE_HREF = 'tel:+16099248500';
  var FALLBACK_EMAIL = 'info@cruzgoldlaw.com';
  var FALLBACK_EMAIL_HREF = 'mailto:info@cruzgoldlaw.com';
  // Generic landing if data-url is missing for any reason — should never
  // happen with a build-time transformer but keeps the fallback link safe.
  var FALLBACK_BASE_URL = 'https://calendly.com/zgold-cruzgoldlaw/free-immigration-consult-organic';
  var FALLBACK_TIMEOUT_MS = 15000;

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

  // GA4 booking event — fires once when Calendly emits a booking-completed message
  function trackBookingComplete(e) {
    if (!e || !e.data) return;
    var d = e.data;
    var isCalendly = d && typeof d === 'object' && d.event && typeof d.event === 'string' && d.event.indexOf('calendly') === 0;
    if (!isCalendly) return;
    if (d.event === 'calendly.event_scheduled') {
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
    document.addEventListener('DOMContentLoaded', armFallbackTimers);
  } else {
    armFallbackTimers();
  }
  window.addEventListener('message', trackBookingComplete);
})();
