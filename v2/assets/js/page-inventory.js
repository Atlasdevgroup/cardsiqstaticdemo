/* Inventory Management — intake sequence drives the live Add Cards window, directory tab filters,
   and the ledger's sticky record state. Runs deferred, before ciq.js boots. */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = function () { return CIQ.reducedMotion ? CIQ.reducedMotion() : false; };

  /* ------------------------------------------------ intake: steps 1–5 → Add Cards states 1–5 */
  var steps = document.getElementById('intake-steps');
  var add = document.querySelector('.i-add');
  if (steps && add) {
    var typed = add.querySelector('.i-add__typed');
    var count = add.querySelector('.i-add__count');
    function setState(n) {
      add.setAttribute('data-state', String(n));
      typed.textContent = n >= 1 ? typed.getAttribute('data-typed') : typed.getAttribute('data-placeholder');
      count.textContent = n >= 2 ? '1' : '0';
    }
    // The HTML ships the finished state (no-JS and reduced motion). With motion, start empty.
    if (!reduced()) setState(0);
    steps.addEventListener('ciq:step', function (e) { setState(Math.max(0, e.detail.index + 1)); });
  }

  /* ------------------------------------------------ directory: tabs filter the illustrative rows */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.i-dir__tabs [data-filter]'));
  var rows = Array.prototype.slice.call(document.querySelectorAll('.i-table tbody tr'));
  var countEl = document.querySelector('.i-dir__count');
  var TOTAL = { all: '184 cards', slab: '152 slabs', raw: '32 raw / sealed cards', review: '6 cards in review', noteam: '2 cards missing a team' };
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-filter');
      tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      var shown = 0;
      rows.forEach(function (r) {
        var types = (r.getAttribute('data-type') || '').split(' ');
        var hit = f === 'all' || types.indexOf(f) > -1;
        r.classList.toggle('is-filtered', !hit);
        if (hit) shown++;
      });
      if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + TOTAL[f];
    });
  });

  /* ------------------------------------------------ ledger: the sticky record follows the entries */
  var entries = Array.prototype.slice.call(document.querySelectorAll('.i-entry[data-state]'));
  var pill = document.querySelector('[data-state-pill]');
  var pillText = document.querySelector('[data-state-text]');
  var where = document.querySelector('[data-state-where]');
  var ICON = { ok: 'checkc', violet: 'link', teal: 'radio', amber: 'clock' };
  function apply(entry) {
    var p = entry.getAttribute('data-state').split('|');
    pillText.textContent = p[0];
    pill.className = 'lv-status lv-status--caps lv-status--' + p[1];
    var ico = pill.querySelector('.ico');
    if (ico && CIQ.icon) ico.outerHTML = CIQ.icon(ICON[p[1]] || 'checkc');
    where.textContent = p[2];
  }
  if (entries.length && pill && 'IntersectionObserver' in window && !reduced()) {
    apply(entries[0]);
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { if (en.isIntersecting) apply(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    entries.forEach(function (e) { io.observe(e); });
  }
})();
