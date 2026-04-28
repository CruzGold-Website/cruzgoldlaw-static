/**
 * Calendly inline-embed initializer for cruzgoldlaw.com
 *
 * Renders the Calendly inline widget into every <div class="calendly-inline-widget">
 * element on the page, passing utm_source from the element's data-source attribute
 * (or the default "website") through to the embed URL. Calendly forwards utm_source
 * to the invitee.created webhook as `tracking.utm_source` — that's how the CRM
 * attributes the Lead source (handled server-side in PR-1).
 *
 * Also fires a GA4 `book_consultation` event when a booking completes, detected via
 * Calendly's postMessage API. If gtag isn't present (e.g. during dev preview), the
 * event is no-op.
 *
 * Defensive against:
 * - Calendly widget.js failing to load (5s timeout shows fallback contact info)
 * - Pages without a Calendly embed div (no-op)
 * - Multiple embeds on one page (each gets its own widget instance with its own
 *   data-source value)
 *
 * Loaded async/defer at the bottom of <head>; widget.js itself is loaded via
 * standard <script> tag in <head>. We don't manually inject widget.js here to
 * avoid double-loading.
 */
(function () {
  'use strict';

  var CALENDLY_BASE_URL = 'https://calendly.com/zgold-cruzgoldlaw/free-immigration-consult-organic';
  var DEFAULT_SOURCE = 'website';
  var WIDGET_LOAD_TIMEOUT_MS = 5000;

  function buildUrl(source) {
    var src = (source || DEFAULT_SOURCE).trim();
    // Calendly accepts UTM params as querystring; it forwards them to the
    // invitee.created webhook payload as tracking.utm_source. Keep the param
    // name lowercase — Calendly is case-sensitive on UTM keys.
    return CALENDLY_BASE_URL + '?utm_source=' + encodeURIComponent(src);
  }

  function initWidgets() {
    var widgets = document.querySelectorAll('.calendly-inline-widget');
    if (widgets.length === 0) return;

    if (typeof window.Calendly === 'undefined' || !window.Calendly.initInlineWidget) {
      // widget.js hasn't loaded yet (or failed). Try again on window load,
      // then give up after a timeout and show fallback CTAs.
      window.addEventListener('load', function () {
        setTimeout(function () {
          if (typeof window.Calendly !== 'undefined' && window.Calendly.initInlineWidget) {
            initWidgets();
          } else {
            showFallback();
          }
        }, 800);
      });
      // Hard timeout: if widget.js doesn't load in 5s, show fallback.
      setTimeout(function () {
        if (typeof window.Calendly === 'undefined' || !window.Calendly.initInlineWidget) {
          showFallback();
        }
      }, WIDGET_LOAD_TIMEOUT_MS);
      return;
    }

    for (var i = 0; i < widgets.length; i++) {
      var el = widgets[i];
      // Skip if already initialised (Calendly leaves a marker iframe inside)
      if (el.querySelector('iframe')) continue;
      var source = el.getAttribute('data-source') || DEFAULT_SOURCE;
      window.Calendly.initInlineWidget({
        url: buildUrl(source),
        parentElement: el,
        prefill: {},
        utm: {}
      });
    }
  }

  function showFallback() {
    var widgets = document.querySelectorAll('.calendly-inline-widget');
    for (var i = 0; i < widgets.length; i++) {
      var el = widgets[i];
      if (el.querySelector('iframe')) continue; // already loaded
      el.innerHTML =
        '<div style="padding:2rem;text-align:center;background:#f5f5f5;border-radius:8px;">' +
        '<h3 style="margin-top:0;">Schedule Your Free Consultation</h3>' +
        '<p>Our online scheduler is taking a moment to load. You can also reach us directly:</p>' +
        '<p style="margin:1rem 0;"><strong>Call:</strong> <a href="tel:+16099248500">(609) 924-8500</a></p>' +
        '<p style="margin:1rem 0;"><strong>Email:</strong> <a href="mailto:info@cruzgoldlaw.com">info@cruzgoldlaw.com</a></p>' +
        '<p style="margin-top:1rem;"><a href="' + CALENDLY_BASE_URL + '" target="_blank" rel="noopener">Or open the scheduler in a new tab →</a></p>' +
        '</div>';
    }
  }

  // GA4 booking event — fires once when Calendly emits a booking-completed message
  function trackBookingComplete(e) {
    if (!e || !e.data) return;
    var isCalendly = e.data && typeof e.data === 'object' && e.data.event && typeof e.data.event === 'string' && e.data.event.indexOf('calendly') === 0;
    if (!isCalendly) return;
    if (e.data.event === 'calendly.event_scheduled') {
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
    document.addEventListener('DOMContentLoaded', initWidgets);
  } else {
    initWidgets();
  }
  window.addEventListener('message', trackBookingComplete);
})();
