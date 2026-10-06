/* Become a Partner — inquiry form, capability ↔ Primary Interest link, record highlight.
 * Runs deferred, before ciq.js boots. Nothing here auto-animates; transitions are user-driven
 * and collapse to instant under prefers-reduced-motion (global rule in ciq.css).
 */
(function () {
  'use strict';
  var CIQ = (window.CIQ = window.CIQ || {});
  var R = CIQ.routes || {};

  /* ------------------------------------------------------------------ submission adapter
   * The ONLY function to wire in production. Replace its body with a call to the existing
   * partner-inquiry submission handler and return that Promise. Field names match production:
   * fullName, company, email, interest, volume, workflow, message.
   * DEMO: no data leaves the browser. Nothing is sent, stored, or logged.
   */
  function submitInquiry(data) {
    void data;
    return new Promise(function (resolve) {
      setTimeout(function () { resolve({ ok: true }); }, 700);
    });
  }
  CIQ.submitInquiry = submitInquiry;

  var form = document.getElementById('inquiry-form');
  if (!form) return;
  var panel = document.getElementById('inquiry');
  var done = panel.querySelector('.bp-done');
  var status = document.getElementById('form-status'); // visible summary, not live
  var live = document.getElementById('form-live');     // polite live region, written only on submit outcomes
  var submit = form.querySelector('.bp-submit');
  var submitLabel = submit.querySelector('.bp-submit__label');
  var interest = form.elements.interest;

  /* ------------------------------------------------------------------ module pages for the success state */
  var MODULE_PAGE = {
    'Inventory Management': [R.inventory || 'inventory-management.html', 'Explore Inventory Management'],
    'Instant Buybacks': [R.buybacks || 'instant-buybacks.html', 'Explore Instant Buybacks'],
    'StreamIQ': [R.streamiq || 'streamiq.html', 'Explore StreamIQ']
  };

  /* ------------------------------------------------------------------ capabilities ↔ Primary Interest */
  var modList = document.querySelector('.bp-mods');
  var boxes = modList ? Array.prototype.slice.call(modList.querySelectorAll('input[type="checkbox"]')) : [];
  var record = document.querySelector('.bp-record');
  var fields = record ? Array.prototype.slice.call(record.querySelectorAll('[data-field]')) : [];
  var peek = null;

  function modKey(box) { return box.closest('.bp-mod').getAttribute('data-mod'); }

  function paintRecord() {
    var on = {};
    boxes.forEach(function (b) { if (b.checked) on[modKey(b)] = true; });
    if (peek) on[peek] = true;
    var any = Object.keys(on).length > 0;
    if (record) record.classList.toggle('has-focus', any);
    fields.forEach(function (f) { f.classList.toggle('is-on', !!on[f.getAttribute('data-field')]); });
  }

  function flashSelect() {
    if (CIQ.reducedMotion && CIQ.reducedMotion()) return;
    interest.classList.remove('is-linked'); void interest.offsetWidth; interest.classList.add('is-linked');
  }

  // Checkbox → select
  boxes.forEach(function (b) {
    b.addEventListener('change', function () {
      var picked = boxes.filter(function (x) { return x.checked; });
      var next = picked.length === 0 ? '' : picked.length === 1 ? picked[0].value : 'Multiple Products';
      // A single pick shows exactly which Primary Interest it wrote (e.g. "Added as Licensed Repacks").
      modList.setAttribute('data-picked', String(picked.length));
      if (interest.value !== next) {
        interest.value = next;
        flashSelect();
        if (attempted) validateField(interest);
      }
      paintRecord();
    });
    var row = b.closest('.bp-mod');
    row.addEventListener('mouseenter', function () { peek = modKey(b); paintRecord(); });
    row.addEventListener('mouseleave', function () { peek = null; paintRecord(); });
    b.addEventListener('focus', function () { peek = modKey(b); paintRecord(); });
    b.addEventListener('blur', function () { peek = null; paintRecord(); });
  });

  // Select → checkboxes
  function syncFromSelect() {
    var v = interest.value;
    if (v === 'Multiple Products') {
      // Keep any modules already picked; nothing to infer from "Multiple".
    } else {
      boxes.forEach(function (b) { b.checked = v !== '' && b.value === v; });
    }
    if (modList) modList.setAttribute('data-picked', String(boxes.filter(function (x) { return x.checked; }).length));
    paintRecord();
  }
  interest.addEventListener('change', syncFromSelect);

  // ?interest= preselects (links from product pages carry intent)
  var MAP = { 'instant-buybacks': 'Instant Buybacks', 'inventory-management': 'Inventory Management', 'streamiq': 'StreamIQ', 'licensed-repacks': 'Licensed Repacks' };
  try {
    var q = new URLSearchParams(location.search).get('interest');
    if (q && MAP[q]) { interest.value = MAP[q]; syncFromSelect(); }
  } catch (e) { /* no URLSearchParams: leave unselected */ }

  /* ------------------------------------------------------------------ validation */
  var RULES = {
    fullName: { label: 'Full Name', empty: 'Enter your full name.' },
    company: { label: 'Company / Shop', empty: 'Enter your company or shop name.' },
    email: { label: 'Work Email', empty: 'Enter your work email.', bad: 'Enter a valid email address, like you@yourshop.com.' },
    interest: { label: 'Primary Interest', empty: 'Select a primary interest.' },
    volume: { label: 'Monthly Card Volume', empty: 'Select your monthly card volume.' },
    workflow: { label: 'Current Workflow', empty: 'Select your current workflow.' }
  };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var attempted = false;

  function errEl(field) { return document.getElementById(field.id + '-err'); }

  function setError(field, msg) {
    var el = errEl(field);
    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', el.id);
      el.textContent = msg;
      el.hidden = false;
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      el.textContent = '';
      el.hidden = true;
    }
  }

  function check(field) {
    var rule = RULES[field.name];
    if (!rule) return '';
    var v = (field.value || '').trim();
    if (!v) return rule.empty;
    if (rule.bad && !EMAIL.test(v)) return rule.bad;
    return '';
  }

  function validateField(field) {
    var msg = check(field);
    setError(field, msg);
    return !msg;
  }

  Object.keys(RULES).forEach(function (name) {
    var field = form.elements[name];
    // After the first submit attempt, errors update as people fix them.
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', function () {
      if (attempted || field.getAttribute('aria-invalid') === 'true') validateField(field);
      if (attempted) updateSummary(false);
    });
    // Email format is checked when leaving a filled-in field.
    if (name === 'email') field.addEventListener('blur', function () { if (field.value.trim()) validateField(field); });
  });

  function invalidFields() {
    return Object.keys(RULES).map(function (n) { return form.elements[n]; }).filter(function (f) { return !!check(f); });
  }

  // Submit outcomes only. Clearing first lets screen readers repeat the same message on a second attempt.
  function announce(text) {
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 60);
  }

  // The visible summary follows edits silently; it is written only when its text actually changes.
  function showSummary(text) {
    if (status.textContent !== text) status.textContent = text;
  }

  function updateSummary(speak) {
    var bad = invalidFields();
    var text = bad.length ? (bad.length === 1 ? '1 field needs attention: ' : bad.length + ' fields need attention: ') + bad.map(function (f) { return RULES[f.name].label; }).join(', ') + '.' : '';
    showSummary(text);
    if (speak) announce(text);
  }

  /* ------------------------------------------------------------------ submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    attempted = true;
    var bad = [];
    Object.keys(RULES).forEach(function (n) { var f = form.elements[n]; if (!validateField(f)) bad.push(f); });
    if (bad.length) {
      updateSummary(true);
      bad[0].focus();
      return;
    }
    showSummary('');

    var data = {};
    ['fullName', 'company', 'email', 'interest', 'volume', 'workflow', 'message'].forEach(function (n) { data[n] = (form.elements[n].value || '').trim(); });

    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Submitting…';

    submitInquiry(data).then(function () {
      showDone(data);
    }, function () {
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      submitLabel.textContent = 'Submit inquiry';
      var msg = 'Something went wrong. Your inquiry was not sent. Please try again.';
      showSummary(msg);
      announce(msg);
    });
  });

  // Success-state links resolve through the routes map so production rewrites apply.
  Array.prototype.forEach.call(document.querySelectorAll('[data-route]'), function (a) {
    var href = R[a.getAttribute('data-route')];
    if (href) a.setAttribute('href', href);
  });

  function showDone(data) {
    ['company', 'interest', 'volume', 'workflow'].forEach(function (k) {
      var dd = done.querySelector('[data-out="' + k + '"]');
      if (dd) dd.textContent = data[k];
    });
    var mod = MODULE_PAGE[data.interest];
    var link = done.querySelector('.bp-done__module');
    if (mod && link) {
      link.setAttribute('href', mod[0]);
      link.querySelector('.bp-done__module-label').textContent = mod[1];
      link.hidden = false;
    }
    form.hidden = true;
    done.hidden = false;
    if (CIQ.hydrateIcons) CIQ.hydrateIcons(done);

    // The inquiry moves the "what happens next" track forward: step 1 done, step 2 current.
    var steps = document.querySelectorAll('.bp-next__step');
    if (steps.length) {
      steps[0].classList.remove('is-current'); steps[0].classList.add('is-done');
      steps[1].classList.add('is-current');
    }
    if (modList) modList.disabled = true;

    var title = done.querySelector('.bp-done__title');
    var top = panel.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) panel.scrollIntoView({ block: 'start', behavior: CIQ.reducedMotion && CIQ.reducedMotion() ? 'auto' : 'smooth' });
    title.focus({ preventScroll: true });
  }
})();
