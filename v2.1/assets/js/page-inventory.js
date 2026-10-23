/* Inventory Management v2.1
   - Ledger: the sticky record follows the entries.
   Runs deferred, before ciq.js boots. Product data is illustrative and canonical
   (BUILD-BRIEF-V21 §2). Unknown fields are left out, never filled. */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = function () { return CIQ.reducedMotion ? CIQ.reducedMotion() : false; };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ================================================================ ledger: the sticky record follows the entries */
  var entries = $$('.i-entry[data-state]');
  var pillEl = document.querySelector('[data-state-pill]');
  var pillText = document.querySelector('[data-state-text]');
  var where = document.querySelector('[data-state-where]');
  var ICON = { ok: 'checkc', violet: 'link', teal: 'radio', amber: 'clock' };
  function apply(entry) {
    var p = entry.getAttribute('data-state').split('|');
    pillText.textContent = p[0];
    pillEl.className = 'lv-status lv-status--caps lv-status--' + p[1];
    var icoEl = pillEl.querySelector('.ico');
    if (icoEl && CIQ.icon) icoEl.outerHTML = CIQ.icon(ICON[p[1]] || 'checkc');
    where.textContent = p[2];
  }
  if (entries.length && pillEl && 'IntersectionObserver' in window && !reduced()) {
    apply(entries[0]);
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { if (en.isIntersecting) apply(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    entries.forEach(function (e) { io.observe(e); });
  }
})();
