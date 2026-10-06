/* Inventory Management — hero intake, record build, directory search/filter,
   product composition highlight, and the scroll-driven card ledger.
   Runs deferred before ciq.js boots, so 'ciq:step' listeners attach before the first render. */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduced = function () { return CIQ.reducedMotion ? CIQ.reducedMotion() : false; };

  /* ------------------------------------------------ hero: slab k ↔ record row k */
  var intake = document.querySelector('.intake');
  if (intake) {
    var list = intake.querySelector('.intake__list');
    var slabs = $$('.intake__slab', intake);
    var doneTimer;
    var complete = function () { intake.classList.add('is-complete'); };
    list.addEventListener('ciq:step', function (e) {
      var i = e.detail.index, last = e.detail.steps.length - 1;
      slabs.forEach(function (s) {
        var row = +s.style.getPropertyValue('--i');
        s.classList.toggle('is-active', row === i);
        s.classList.toggle('is-done', row < i);
      });
      intake.classList.toggle('is-started', i >= 0);
      clearTimeout(doneTimer);
      if (i === last) { if (reduced()) complete(); else doneTimer = setTimeout(complete, 1100); }
      else intake.classList.remove('is-complete');
    });
  }

  /* ------------------------------------------------ scan → available: the slab follows the rail */
  var build = document.querySelector('.build');
  if (build) {
    var rail = build.querySelector('.build__rail');
    rail.addEventListener('ciq:step', function (e) {
      build.setAttribute('data-step', e.detail.index);
      build.classList.toggle('is-on', e.detail.index >= 0);
    });
    // Vertical layouts: the rail runs exactly from the first node's centre to the last one's.
    var nodes = $$('.lc-node', rail);
    var placeRail = function () {
      var r = rail.getBoundingClientRect();
      var a = nodes[0].getBoundingClientRect(), b = nodes[nodes.length - 1].getBoundingClientRect();
      rail.style.setProperty('--rail-top', Math.round(a.top + a.height / 2 - r.top) + 'px');
      rail.style.setProperty('--rail-end', Math.round(r.bottom - b.top - b.height / 2) + 'px');
    };
    if (nodes.length) {
      placeRail();
      if ('ResizeObserver' in window) new ResizeObserver(placeRail).observe(rail);
      else window.addEventListener('resize', placeRail);
    }
  }

  /* ------------------------------------------------ directory: filter tabs + search */
  var dir = document.querySelector('.dir');
  if (dir) {
    var rows = $$('.dir__row:not(.dir__row--head)', dir);
    var tabs = $$('.dir__tab', dir);
    var input = dir.querySelector('#dir-q');
    var empty = dir.querySelector('.dir__empty');
    var emptyDot = empty.querySelector('.dir__empty-dot');
    var emptyText = empty.querySelector('.dir__empty-t');
    var count = dir.querySelector('#dir-count');
    var filter = 'all';
    var norm = function (s) { return String(s || '').toLowerCase().replace(/[#!'’,.$]/g, ' ').replace(/\s+/g, ' ').trim(); };
    rows.forEach(function (r) { r._text = norm(r.textContent + ' ' + (r.getAttribute('data-q') || '')); });

    var apply = function () {
      var terms = norm(input.value).split(' ').filter(Boolean);
      var n = 0;
      rows.forEach(function (r) {
        var kinds = (r.getAttribute('data-kind') || '').split(' ');
        var show = (filter === 'all' || kinds.indexOf(filter) > -1) &&
          terms.every(function (t) { return r._text.indexOf(t) > -1; });
        r.hidden = !show;
        if (show) n++;
      });
      empty.hidden = n > 0;
      // An empty "Missing Team" view is a clean result, not a broken table.
      var clean = filter === 'team' && !terms.length;
      empty.classList.toggle('is-ok', clean);
      emptyDot.classList.toggle('dot--ok', clean);
      emptyText.textContent = clean ? 'No cards are missing a team.' : 'No cards match this search.';
      count.textContent = n + (n === 1 ? ' card' : ' cards') + ' shown';
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        filter = t.getAttribute('data-filter');
        tabs.forEach(function (o) { o.setAttribute('aria-pressed', String(o === t)); });
        apply();
      });
    });
    input.addEventListener('input', apply);
  }

  /* ------------------------------------------------ product: manifest row ↔ market-value segment */
  var prod = document.querySelector('.prod');
  if (prod) {
    var mix = prod.querySelector('.mix');
    var segs = $$('.mix__seg', prod);
    var table = prod.querySelector('.manifest');
    var hl = function (k) {
      var ks = k ? k.split(' ') : [];
      mix.classList.toggle('has-hl', ks.length > 0);
      segs.forEach(function (s) { s.classList.toggle('is-hl', ks.indexOf(s.getAttribute('data-k')) > -1); });
    };
    $$('tbody tr', table).forEach(function (tr) {
      tr.addEventListener('pointerenter', function () { hl(tr.getAttribute('data-k')); });
      tr.addEventListener('pointerleave', function () { hl(null); });
    });
    // The seven supporting cards fold into one subtotal row; the button reveals them.
    var more = table.querySelector('.mf-more');
    var rest = document.getElementById('mf-rest');
    if (more && rest) {
      more.addEventListener('click', function () {
        var open = more.getAttribute('aria-expanded') !== 'true';
        more.setAttribute('aria-expanded', String(open));
        rest.hidden = !open;
        more.textContent = open ? 'Hide the 7 cards' : 'Show all 10 cards';
      });
    }
    // Keep table semantics when narrow layouts restyle rows as grids, and label the money cells.
    table.setAttribute('role', 'table');
    $$('thead, tbody, tfoot', table).forEach(function (g) { g.setAttribute('role', 'rowgroup'); });
    $$('tr', table).forEach(function (tr) { tr.setAttribute('role', 'row'); });
    $$('thead th', table).forEach(function (th) { th.setAttribute('role', 'columnheader'); });
    $$('tfoot th', table).forEach(function (th) { th.setAttribute('role', 'rowheader'); });
    $$('td', table).forEach(function (td) { td.setAttribute('role', 'cell'); });
    $$('tr', table).forEach(function (tr) {
      var money = $$('td.manifest__r', tr);
      if (money[0]) money[0].setAttribute('data-l', 'Cost');
      if (money[1]) money[1].setAttribute('data-l', 'Market');
    });
  }

  /* ------------------------------------------------ ledger: events activate as they cross the reading line */
  var ledger = document.querySelector('.ledger');
  if (ledger) {
    var evs = $$('.ev', ledger);
    var events = ledger.querySelector('.events');
    var rec = ledger.querySelector('.ledger__record');
    var out = {};
    ['state', 'where', 'value', 'count'].forEach(function (k) { out[k] = ledger.querySelector('[data-r="' + k + '"]'); });
    var cur = null;

    var set = function (i) {
      if (i === cur) return;
      cur = i;
      evs.forEach(function (e, k) {
        e.classList.toggle('is-done', k < i);
        e.classList.toggle('is-active', k === i);
        e.classList.toggle('is-upcoming', k > i);
      });
      var e = evs[i];
      var st = e.getAttribute('data-state').split('|');
      out.state.className = 'status status--' + st[0];
      out.state.textContent = st[1];
      out.where.textContent = e.getAttribute('data-where');
      out.value.textContent = e.getAttribute('data-value');
      out.count.textContent = (i + 1) + ' of ' + evs.length;
      rec.classList.remove('is-swap'); void rec.offsetWidth; rec.classList.add('is-swap');
    };

    if (reduced() || !('IntersectionObserver' in window)) {
      set(evs.length - 1);
    } else {
      ledger.classList.add('is-live');
      var raf = 0;
      var measure = function () {
        raf = 0;
        var line = window.innerHeight * 0.55;
        var i = 0;
        evs.forEach(function (e, k) { if (e.getBoundingClientRect().top < line) i = k; });
        set(i);
        var r = events.getBoundingClientRect();
        var reach = r.height - window.innerHeight * 0.08 - 28;
        var p = reach > 0 ? (line - r.top - 28) / reach : 1;
        events.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      var onScroll = function () { if (!raf) raf = requestAnimationFrame(measure); };
      // Listen only while the ledger is on screen.
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); measure(); }
        else { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
      }).observe(ledger);
      measure();
    }
  }
})();
