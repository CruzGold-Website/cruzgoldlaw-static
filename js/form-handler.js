/* Form Handler — Routes submissions to CG Law Clients CRM via Cloudflare Worker
 *
 * Replaces the old Zapier webhook routing. Zero HTML changes required —
 * reads existing Fluent Forms markup and maps fields to the CRM payload.
 *
 * Endpoint:  POST https://cg-lead-proxy.bilal-17f.workers.dev/submit
 * Payload:   { first_name, last_name, phone?, email?, source, message?, website (honeypot) }
 */
(function () {

  var WORKER_URL = 'https://cg-lead-proxy.bilal-17f.workers.dev/submit';

  /* ────────────────────────────────────────────
   *  Source resolution
   *
   *  Priority: form ID (explicit) > URL path (contextual) > default
   *
   *  Form IDs 8, 3, 5, 6 are dedicated per-location or per-campaign
   *  forms baked into specific pages. Form ID 7 is the catch-all footer
   *  form that appears on 70+ pages — for that one we fall through to
   *  URL matching.
   * ──────────────────────────────────────────── */

  var FORM_ID_SOURCE = {
    '8': 'houston',       // immigration-lawyer-houston.html
    '3': 'philadelphia',  // immigration-lawyer-philadelphia.html
    '5': 'google_ads',    // family-immigration-lp.html  (legend: "Google Ad Form")
    '6': 'google_ads'     // spouse-immigration-lp.html  (landing page form)
  };

  function getSource(formId) {
    // Dedicated form IDs take priority — no ambiguity
    if (FORM_ID_SOURCE[formId]) return FORM_ID_SOURCE[formId];

    // For the catch-all forms (ID 7, 1, 4, etc.), infer from page URL
    var path = window.location.pathname.toLowerCase();

    // Landing pages (Google Ads) — URL ends in -lp or -lp.html
    if (path.indexOf('-lp') !== -1) return 'google_ads';

    // Location-specific pages
    if (path.indexOf('houston') !== -1)                               return 'houston';
    if (path.indexOf('philadelphia') !== -1 || path.indexOf('philly') !== -1) return 'philadelphia';
    if (path.indexOf('hackensack') !== -1)                            return 'hackensack';
    if (path.indexOf('ewing') !== -1)                                 return 'ewing';

    // Everything else — main website
    return 'website';
  }

  /* ────────────────────────────────────────────
   *  Payload construction
   *
   *  Fluent Forms nests the name field: names[first_name], names[last_name]
   *  The CRM expects flat keys: first_name, last_name
   *  All other fields (email, phone, message) are already flat.
   * ──────────────────────────────────────────── */

  function buildPayload(form, formId) {
    var payload = {};

    // Required — CRM rejects without these
    var firstName = form.querySelector('input[name="names[first_name]"]');
    var lastName  = form.querySelector('input[name="names[last_name]"]');
    if (firstName && firstName.value.trim()) payload.first_name = firstName.value.trim();
    if (lastName  && lastName.value.trim())  payload.last_name  = lastName.value.trim();

    // Optional — CRM skips email/SMS if not provided
    var email = form.querySelector('input[name="email"]');
    if (email && email.value.trim()) payload.email = email.value.trim();

    var phone = form.querySelector('input[name="phone"]');
    if (phone && phone.value.trim()) payload.phone = phone.value.trim();

    var message = form.querySelector('textarea[name="message"]');
    if (message && message.value.trim()) payload.message = message.value.trim();

    // Source — which page/funnel generated this lead
    payload.source = getSource(formId);

    // Honeypot — must be empty string for real users.
    // Bots auto-fill hidden fields; Worker silently drops non-empty values.
    var honeypot = form.querySelector('input[name="website"]');
    payload.website = (honeypot && honeypot.value) ? honeypot.value : '';

    return payload;
  }

  /* ────────────────────────────────────────────
   *  Validation
   *
   *  Only first_name and last_name are hard-required by the CRM.
   *  We re-use Fluent Forms' own CSS classes (ff-el-is-error, error text-danger)
   *  so error states look native without touching any stylesheets.
   * ──────────────────────────────────────────── */

  function validate(form) {
    var firstName = form.querySelector('input[name="names[first_name]"]');
    var lastName  = form.querySelector('input[name="names[last_name]"]');

    // Clear previous errors
    var prevErrors = form.querySelectorAll('.ff-el-is-error');
    for (var i = 0; i < prevErrors.length; i++) {
      prevErrors[i].classList.remove('ff-el-is-error');
    }
    var prevMsgs = form.querySelectorAll('.error.text-danger');
    for (var j = 0; j < prevMsgs.length; j++) {
      prevMsgs[j].remove();
    }

    var valid = true;

    if (!firstName || !firstName.value.trim()) {
      flagField(firstName);
      valid = false;
    }
    if (!lastName || !lastName.value.trim()) {
      flagField(lastName);
      valid = false;
    }

    return valid;
  }

  function flagField(input) {
    if (!input) return;
    // Add Fluent Forms error class to the field group wrapper
    var group = input.closest('.ff-el-group');
    if (group) group.classList.add('ff-el-is-error');
    // Insert error message below the input
    var content = input.closest('.ff-el-input--content');
    if (content) {
      var msg = document.createElement('div');
      msg.className = 'error text-danger';
      msg.textContent = 'This field is required';
      content.appendChild(msg);
    }
  }

  /* ────────────────────────────────────────────
   *  Honeypot injection
   *
   *  Added via JS so we don't touch 80+ HTML files. Hidden from
   *  real users (offscreen, zero-size, aria-hidden, negative tabindex).
   *  Bots that parse the DOM will find and fill it → Worker drops them.
   * ──────────────────────────────────────────── */

  function injectHoneypot(form) {
    if (form.querySelector('input[name="website"]')) return;
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'website';
    hp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;height:0;width:0;';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    form.appendChild(hp);
  }

  /* ────────────────────────────────────────────
   *  Success / error feedback
   *
   *  Uses the .form-success / .form-error classes already defined in
   *  css/custom-overrides.css (green box / red box, centered text).
   * ──────────────────────────────────────────── */

  function showSuccess(form) {
    // Remove any previous feedback
    var prev = form.parentNode.querySelector('.form-success, .form-error');
    if (prev) prev.remove();

    var el = document.createElement('div');
    el.className = 'form-success';
    el.textContent = 'Thanks for the submission! We will email / text you shortly.';
    form.parentNode.insertBefore(el, form.nextSibling);
  }

  /* ────────────────────────────────────────────
   *  Submit
   *
   *  No `mode: 'no-cors'` — the Worker returns proper CORS headers,
   *  so we get a real response and can distinguish success from failure.
   * ──────────────────────────────────────────── */

  function submitForm(form, formId) {
    if (!validate(form)) return;

    var btn = form.querySelector('button[type="submit"], input[type="submit"]');
    var originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting...';
    }

    var payload = buildPayload(form, formId);

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      if (res.ok) {
        // Confirmed — Worker accepted and forwarded to CRM
        form.style.display = 'none';
        showSuccess(form);
      } else {
        // Worker rejected (validation, rate limit, backend down)
        alert('Something went wrong. Please try again or call us directly.');
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }
    })
    .catch(function () {
      // Network-level failure (offline, DNS, Worker unreachable)
      alert('Network error. Please try again or call us directly.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  /* ────────────────────────────────────────────
   *  Initialization
   *
   *  Script loads AFTER fluent-form-submission.js (line 1107 in index.html)
   *  and is the last <script> tag (line 1175). Our submit listener fires
   *  first via e.stopPropagation(), preventing Fluent Forms' own handler
   *  from attempting a dead AJAX POST to the old WordPress backend.
   * ──────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Fluent Forms (all 80+ pages) ── */
    var forms = document.querySelectorAll('form.frm-fluent-form, form[data-form_id]');
    forms.forEach(function (form) {
      // Remove the loading state so Fluent Forms CSS shows the fields
      form.classList.remove('ff-form-loading');
      form.classList.add('ff-form-loaded');

      // Inject honeypot into every form
      injectHoneypot(form);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var formId = form.getAttribute('data-form_id') || '7';
        submitForm(form, formId);
      });
    });

    /* ── Formidable Forms (fallback for any legacy forms) ── */
    var formidable = document.querySelectorAll('form.frm-show-form');
    formidable.forEach(function (form) {
      injectHoneypot(form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        submitForm(form, 'formidable');
      });
    });
  });

})();
