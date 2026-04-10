/* Form Handler — Intercepts Fluent Forms and Formidable Forms, posts to webhook */
(function () {
  const WEBHOOK_URL = 'PLACEHOLDER_WEBHOOK_URL'; // Replace with actual webhook URL

  document.addEventListener('DOMContentLoaded', function () {

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
     * Submit form data to webhook
     */
    function submitForm(form, formData) {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(WEBHOOK_URL, {
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

    /* ── Fluent Forms ── */
    const fluentForms = document.querySelectorAll('form.frm-fluent-form, form[data-form_id]');
    fluentForms.forEach(function (form) {
      form.classList.remove('ff-form-loading');
      form.classList.add('ff-form-loaded');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const data = collectFormData(form);
        data._form = form.getAttribute('data-form_id') || 'contact';
        submitForm(form, data);
      });
    });

    /* ── Formidable Forms ── */
    const formidableForms = document.querySelectorAll('form.frm-show-form');
    formidableForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const data = collectFormData(form);
        submitForm(form, data);
      });
    });
  });
})();
