/* Form Handler - Intercepts Fluent Forms and posts to webhook */
(function() {
  var WEBHOOK_URL = 'PLACEHOLDER_WEBHOOK_URL'; // Replace with actual webhook URL

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', function() {
    // Find all Fluent Forms
    var forms = document.querySelectorAll('form.frm-fluent-form, form[data-form_id]');

    forms.forEach(function(form) {
      // Mark as loaded
      form.classList.remove('ff-form-loading');
      form.classList.add('ff-form-loaded');

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        var formData = {};
        var formName = form.getAttribute('data-form_id') || 'contact';
        formData._form = formName;

        form.querySelectorAll('input, select, textarea').forEach(function(input) {
          if (!input.name || input.type === 'hidden' || input.type === 'submit') return;
          if (input.type === 'checkbox') {
            formData[input.name] = input.checked ? input.value || 'yes' : '';
          } else if (input.type === 'radio') {
            if (input.checked) formData[input.name] = input.value;
          } else {
            formData[input.name] = input.value;
          }
        });

        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          mode: 'no-cors'
        }).then(function() {
          // Show success message
          var msg = document.createElement('div');
          msg.style.cssText = 'padding:20px;background:#d4edda;color:#155724;border-radius:5px;margin-top:15px;text-align:center;font-weight:600;';
          msg.textContent = 'Thank you! Your message has been sent successfully.';
          form.style.display = 'none';
          form.parentNode.insertBefore(msg, form.nextSibling);
        }).catch(function() {
          var msg = document.createElement('div');
          msg.style.cssText = 'padding:20px;background:#f8d7da;color:#721c24;border-radius:5px;margin-top:15px;text-align:center;';
          msg.textContent = 'Something went wrong. Please call us directly.';
          form.parentNode.insertBefore(msg, form.nextSibling);
          if (submitBtn) submitBtn.disabled = false;
        });
      });
    });

    // Also handle Formidable Forms
    var frmForms = document.querySelectorAll('form.frm-show-form');
    frmForms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var formData = {};
        form.querySelectorAll('input, select, textarea').forEach(function(input) {
          if (!input.name || input.type === 'hidden' || input.type === 'submit') return;
          formData[input.name] = input.value;
        });

        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          mode: 'no-cors'
        }).then(function() {
          var msg = document.createElement('div');
          msg.style.cssText = 'padding:20px;background:#d4edda;color:#155724;border-radius:5px;margin-top:15px;text-align:center;font-weight:600;';
          msg.textContent = 'Thank you! Your message has been sent successfully.';
          form.style.display = 'none';
          form.parentNode.insertBefore(msg, form.nextSibling);
        });
      });
    });
  });
})();
