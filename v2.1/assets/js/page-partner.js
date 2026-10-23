/* Become a Partner — one-step partner inquiry.
 * Primary Interest as radio chips, then Full Name / Company / Shop / Email / What are you trying to solve?
 * Field names and option values are the production ones: fullName, company, email, interest, message.
 * Progressive enhancement: without JS the form posts.
 * Runs deferred, before ciq.js boots (ciq.js hydrates icons afterwards).
 */
(function () {
  'use strict';
  var CIQ = (window.CIQ = window.CIQ || {});
  var R = CIQ.routes || {};
  var slice = function (list) { return Array.prototype.slice.call(list || []); };
  var reduced = function () { return !!(CIQ.reducedMotion && CIQ.reducedMotion()); };

  /* ------------------------------------------------------------------ submission adapter
   * The ONLY function to wire in production: replace its body with a call to the existing
   * partner-inquiry submission handler and return that Promise (reject on failure).
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
  var live = document.getElementById('bp-live');     // polite; written only for submit outcomes
  var status = document.getElementById('bp-status'); // visible summary; follows edits silently
  var submit = form.querySelector('.bp-submit');
  var submitLabel = submit.querySelector('.bp-submit__label');

  var FIELDS = ['fullName', 'company', 'email', 'interest', 'message'];
  var RULES = {
    interest: { label: 'Primary Interest', empty: 'Select a primary interest.' },
    fullName: { label: 'Full Name', empty: 'Enter your full name.' },
    company: { label: 'Company / Shop', empty: 'Enter your company or shop name.' },
    email: { label: 'Email', empty: 'Enter your email.', bad: 'Enter a valid email address, like you@yourshop.com.' }
  };
  var ORDER = ['interest', 'fullName', 'company', 'email'];
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var tried = false;

  /* ------------------------------------------------------------------ field helpers */
  function value(name) {
    var el = form.elements[name]; // a RadioNodeList for the chip groups: .value is the checked option
    return el ? String(el.value || '').trim() : '';
  }
  // The elements that carry aria-invalid / aria-describedby: one input, or every radio in a group.
  function controls(name) {
    var el = form.elements[name];
    if (!el) return [];
    return el.tagName ? [el] : slice(el);
  }
  function firstControl(name) {
    var c = controls(name);
    return c.filter(function (x) { return x.checked; })[0] || c[0];
  }
  function check(name) {
    var rule = RULES[name], v = value(name);
    if (!v) return rule.empty;
    if (rule.bad && !EMAIL.test(v)) return rule.bad;
    return '';
  }
  function setError(name, msg) {
    var el = document.getElementById('err-' + name);
    var group = form.querySelector('[data-group="' + name + '"]');
    controls(name).forEach(function (c) {
      if (msg) { c.setAttribute('aria-invalid', 'true'); c.setAttribute('aria-describedby', el.id); }
      else { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); }
    });
    if (group) group.classList.toggle('is-invalid', !!msg);
    el.textContent = msg || '';
    el.hidden = !msg;
  }
  function validate(name) { var msg = check(name); setError(name, msg); return !msg; }
  function invalid() {
    return ORDER.filter(function (n) { return !!check(n); });
  }
  function summaryText(bad) {
    if (!bad.length) return '';
    return (bad.length === 1 ? '1 field needs attention: ' : bad.length + ' fields need attention: ') +
      bad.map(function (n) { return RULES[n].label; }).join(', ') + '.';
  }
  function showSummary(text) { if (status.textContent !== text) status.textContent = text; }
  // Submit outcomes only. Clearing first lets screen readers repeat an identical message.
  function announce(text) {
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 60);
  }

  /* ------------------------------------------------------------------ chips: live .is-on state */
  function syncChips(name) {
    controls(name).forEach(function (r) {
      var chip = r.closest('.bp-chip');
      if (chip) chip.classList.toggle('is-on', r.checked);
    });
  }
  function pick(name, val) {
    controls(name).forEach(function (r) { r.checked = r.value === val; });
    syncChips(name);
    if (tried) validate(name);
  }
  controls('interest').forEach(function (r) {
    r.addEventListener('change', function () {
      syncChips('interest');
      if (tried || r.getAttribute('aria-invalid') === 'true') validate('interest');
    });
  });
  syncChips('interest');

  /* ------------------------------------------------------------------ text fields: errors update after an attempt */
  ['fullName', 'company', 'email'].forEach(function (n) {
    var f = form.elements[n];
    f.addEventListener('input', function () {
      if (tried || f.getAttribute('aria-invalid') === 'true') validate(n);
      if (tried && status.textContent) showSummary(summaryText(invalid()));
    });
    // Email format is checked when leaving a filled-in field.
    if (n === 'email') f.addEventListener('blur', function () { if (f.value.trim()) validate(n); });
  });

  function bringIntoView() {
    var top = panel.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) panel.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
  }

  /* ------------------------------------------------------------------ ?interest= preselects (product pages carry intent) */
  var MAP = { 'instant-buybacks': 'Instant Buybacks', 'inventory-management': 'Inventory Management', 'streamiq': 'StreamIQ', 'licensed-repacks': 'Licensed Repacks' };
  try {
    var q = new URLSearchParams(location.search).get('interest');
    if (q && MAP[q]) pick('interest', MAP[q]);
  } catch (e) { /* no URLSearchParams: leave unselected */ }

  /* ------------------------------------------------------------------ "Start with …" rows: preselect, then return to the form */
  slice(document.querySelectorAll('[data-pick]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (form.hidden) return; // after submitting, the anchor simply returns to the confirmation
      e.preventDefault();
      pick('interest', a.getAttribute('data-pick'));
      panel.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
      firstControl('interest').focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------ submit */
  function pending(on) {
    submit.disabled = on;
    if (on) form.setAttribute('aria-busy', 'true'); else form.removeAttribute('aria-busy');
    submitLabel.textContent = on ? 'Submitting…' : 'Submit inquiry';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    tried = true;
    var bad = [];
    ORDER.forEach(function (n) { if (!validate(n)) bad.push(n); });
    if (bad.length) {
      var text = summaryText(bad);
      showSummary(text);
      announce(text);
      firstControl(bad[0]).focus();
      return;
    }
    showSummary('');

    var data = {};
    FIELDS.forEach(function (n) { data[n] = value(n); });

    pending(true);
    submitInquiry(data).then(function () {
      showDone(data);
    }, function () {
      pending(false);
      var msg = 'Something went wrong. Your inquiry was not sent. Please try again.';
      showSummary(msg);
      announce(msg);
      submit.focus();
    });
  });

  /* ------------------------------------------------------------------ success */
  var MODULE_PAGE = {
    'Inventory Management': [R.inventory || 'inventory-management.html', 'Explore Inventory Management'],
    'Instant Buybacks': [R.buybacks || 'instant-buybacks.html', 'Explore Instant Buybacks'],
    'StreamIQ': [R.streamiq || 'streamiq.html', 'Explore StreamIQ']
  };
  // Success links resolve through the routes map so production rewrites apply.
  slice(document.querySelectorAll('[data-route]')).forEach(function (a) {
    var href = R[a.getAttribute('data-route')];
    if (href) a.setAttribute('href', href);
  });

  function showDone(data) {
    ['company', 'interest'].forEach(function (k) {
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

    // The inquiry moves "What happens next" forward: step 1 done, step 2 current.
    var track = document.querySelectorAll('.bp-next__step');
    if (track.length > 1) {
      track[0].classList.remove('is-current'); track[0].classList.add('is-done');
      track[1].classList.add('is-current');
    }

    bringIntoView();
    done.querySelector('.bp-done__title').focus({ preventScroll: true });
    announce("Inquiry received. We'll route it to the right CardsIQ team.");
  }
})();
