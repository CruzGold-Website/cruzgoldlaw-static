/* Form Handler — Routes form submissions to location-specific Zapier webhooks */
(function () {

  const WEBHOOKS = {
    nj:   'https://hooks.zapier.com/hooks/catch/23184405/u6der7n/',
    philly: 'https://hooks.zapier.com/hooks/catch/23184405/u6df0tn/',
    houston: 'https://hooks.zapier.com/hooks/catch/23184405/uq1m000/'
  };

  /**
   * Determine which webhook to use.
   * Priority: form_id match first, then page URL for the catch-all footer form.
   */
  function getWebhook(formId) {
    // Location-specific forms (unique per location page)
    if (formId === '8') return WEBHOOKS.houston;
    if (formId === '3') return WEBHOOKS.philly;
    if (formId === '1') return WEBHOOKS.nj;

    // Footer form (ID 7) and any others — route by current page URL
    const path = window.location.pathname.toLowerCase();
    if (path.includes('houston'))      return WEBHOOKS.houston;
    if (path.includes('philadelphia') || path.includes('philly')) return WEBHOOKS.philly;
    return WEBHOOKS.nj; // default — firm is NJ-based
  }

  /**
   * Collect form field values (skips hidden/submit inputs)
   */
  function collectFormData(form) {
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (!input.name || input.type === 'hidden' || input.type === 'submit') return;
      if (input.type === 'checkbox') {
        data[input.name] = input.checked ? input.value || 'yes' : '';
      } else if (input.type === 'radio') {
        if (input.checked) data[input.name] = input.value;
      } else {
        data[input.name] = input.value;
      }
    });
    return data;
  }

  /**
   * Show feedback message after submission
   */
  function showMessage(form, type) {
    const msg = document.createElement('div');
    msg.className = type === 'success' ? 'form-success' : 'form-error';
    msg.textContent = type === 'success'
      ? 'Thank you! Your message has been sent successfully.'
      : 'Something went wrong. Please call us directly.';
    form.parentNode.insertBefore(msg, form.nextSibling);
  }

  /**
   * Submit form data to the correct Zapier webhook
   */
  function submitForm(form, formId) {
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const webhookUrl = getWebhook(formId);
    const formData = collectFormData(form);
    formData._form_id = formId;
    formData._page = window.location.pathname;

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      mode: 'no-cors'
    }).then(function () {
      form.style.display = 'none';
      showMessage(form, 'success');
    }).catch(function () {
      showMessage(form, 'error');
      if (submitBtn) submitBtn.disabled = false;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Fluent Forms ── */
    const fluentForms = document.querySelectorAll('form.frm-fluent-form, form[data-form_id]');
    fluentForms.forEach(function (form) {
      form.classList.remove('ff-form-loading');
      form.classList.add('ff-form-loaded');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const formId = form.getAttribute('data-form_id') || '7';
        submitForm(form, formId);
      });
    });

    /* ── Formidable Forms ── */
    const formidableForms = document.querySelectorAll('form.frm-show-form');
    formidableForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        submitForm(form, 'formidable');
      });
    });

  });
})();
