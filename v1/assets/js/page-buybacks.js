/* Instant Buybacks — hero offer ticket (wire + state progression) and the partner console detail. */
(function () {
  'use strict';
  var CIQ = window.CIQ;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------ hero: wire the physical card into the ticket chain */
  var deal = document.querySelector('.b-deal');
  if (deal) {
    var wire = deal.querySelector('.b-deal__wire');
    var img = deal.querySelector('.b-deal__card img');
    var node = deal.querySelector('.b-chain__node');

    var place = function () {
      if (getComputedStyle(wire).display === 'none') return;
      var f = deal.getBoundingClientRect(), s = img.getBoundingClientRect(), n = node.getBoundingClientRect();
      if (!s.width) return;
      var x0 = s.right - f.left - 10;
      var x1 = n.left - f.left + 1;
      wire.style.left = x0 + 'px';
      wire.style.width = Math.max(0, x1 - x0) + 'px';
      wire.style.top = (n.top - f.top + n.height / 2) + 'px';
    };
    var schedule = function () { requestAnimationFrame(place); };
    window.addEventListener('load', place);
    if (img.complete) schedule(); else img.addEventListener('load', place);
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(deal);
    deal.addEventListener('pointermove', schedule);
    deal.addEventListener('pointerleave', function () { setTimeout(place, 720); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

    /* Offer available → accepted → verified → settled. The meaningful state is "Offer available":
       it holds longest, and is the only state shown under reduced motion. The animated pill and track
       are aria-hidden; the figure's caption carries the state for assistive tech. */
    var ticket = deal.querySelector('.b-ticket');
    var pill = ticket.querySelector('.b-ticket__status');
    var offerK = ticket.querySelector('.b-ticket__offer-k');
    var track = $$('.b-states li', ticket);
    var STATES = [
      { cls: 'pending', label: 'Offer available', k: 'Instant offer', ms: 5200 },
      { cls: 'accepted', label: 'Offer accepted', k: 'Instant offer', ms: 1700 },
      { cls: 'ok', label: 'Verified', k: 'Instant offer', ms: 1700 },
      { cls: 'ok', label: 'Settled', k: 'Paid', ms: 3600 }
    ];
    var state = 0, timer = null, visible = false;
    var set = function (i) {
      state = i;
      var s = STATES[i];
      ticket.setAttribute('data-state', i);
      pill.className = 'status status--' + s.cls + ' b-ticket__status';
      pill.textContent = s.label;
      offerK.textContent = s.k;
      track.forEach(function (li, k) {
        li.classList.toggle('is-done', k < i);
        li.classList.toggle('is-on', k === i);
      });
    };
    var done = false;
    var tick = function () {
      clearTimeout(timer);
      if (!visible || done) return;
      timer = setTimeout(function () {
        var n = state + 1;
        if (n >= STATES.length) { set(0); done = true; return; }
        set(n); tick();
      }, STATES[state].ms);
    };
    set(0);
    if (!CIQ.reducedMotion() && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) tick(); else clearTimeout(timer);
      }, { threshold: 0.4 }).observe(ticket);
    }
  }

  /* ------------------------------------------------ partner console: select a queue row → offer detail */
  var ROWS = [
    { card: '2023 Donruss Optic Joe Burrow Downtown! #D4', grade: 'PSA 9', cert: '103207853', buyer: '@northstarcards', ctx: 'Stream #1842 · Break 04',
      mv: '$1,030', ov: '$927', st: ['ok', 'Settled'], step: 3, tone: 'ok' },
    { card: '2017 Panini Donruss Optic Patrick Mahomes II Lime #177', grade: 'PSA 9', cert: '159117071', buyer: '@vaultcollects', ctx: 'Identity · card · account · duplicate checks in review',
      mv: '$4,180', ov: '$3,762', st: ['info', 'Verification'], step: 2, tone: 'info' },
    { card: '2024 Panini Prizm Malik Nabers Gold /10', grade: 'PSA 10', cert: '', buyer: '@nycards', ctx: 'Buyer confirmed · awaiting verification',
      mv: '$1,420', ov: '$1,278', st: ['accepted', 'Offer accepted'], step: 1, tone: 'accepted' },
    { card: '1958 Topps Mickey Mantle #150', grade: 'PSA 4', cert: '69974937', buyer: '@cardroom', ctx: 'Offer created · awaiting approval',
      mv: '$2,230', ov: '$2,007', st: ['pending', 'Awaiting approval'], step: 0, tone: 'pending' },
    { card: '2000 Bowman Tom Brady #236', grade: 'PSA 8', cert: '82389068', buyer: '@collector92', ctx: 'Offer created · pending',
      mv: '$1,180', ov: '$1,062', st: ['pending', 'Pending'], step: 0, tone: 'pending' }
  ];
  /* Completed steps read in the past tense; the step in progress reads as in progress. */
  var STEPS = ['Offer', 'Accepted', 'Verified', 'Settled'];
  var STEPS_NOW = ['Offer', 'Accepted', 'Verifying', 'Settling'];
  /* Status filter → row tones. "Pending" covers everything not yet in verification or settled. */
  var FILTERS = { all: null, pending: ['pending', 'accepted'], info: ['info'], ok: ['ok'] };

  var queue = document.querySelector('.b-queue');
  var detail = document.getElementById('offer-detail');
  if (queue && detail) {
    var trs = $$('tbody tr', queue);
    var live = document.getElementById('offer-live');
    var console_ = queue.closest('.b-console');
    var tabs = $$('.b-console__tabs [data-filter]', console_);
    var search = console_.querySelector('.b-console__search input');
    var count = console_.querySelector('.b-queue__count');
    var empty = console_.querySelector('.b-queue__empty');
    var current = -1, filter = 'all';
    var el = {
      card: detail.querySelector('.b-detail__card'),
      id: detail.querySelector('.b-detail__id'),
      mv: detail.querySelector('.b-detail__mv'),
      ov: detail.querySelector('.b-detail__ov'),
      steps: detail.querySelector('.b-detail__steps'),
      meta: detail.querySelector('.b-detail__meta')
    };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var statusCls = function (k) { return k === 'accepted' ? 'status b-status--accepted' : 'status status--' + k; };

    /* quiet = the markup already shows this row (initial state): no animation, no announcement */
    var show = function (i, quiet) {
      if (i === current) return;
      current = i;
      var r = ROWS[i];
      trs.forEach(function (tr, k) {
        tr.classList.toggle('is-sel', k === i);
        var b = tr.querySelector('.b-q__btn');
        if (b) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }
      });
      if (quiet) return;
      el.card.textContent = r.card;
      el.id.innerHTML = '<span class="chip chip--grade">' + esc(r.grade) + '</span>' + (r.cert ? '<span class="chip">Cert ' + esc(r.cert) + '</span>' : '');
      el.mv.textContent = r.mv;
      el.ov.textContent = r.ov;
      el.steps.innerHTML = STEPS.map(function (s, k) {
        var done = r.step === 3 || k < r.step;
        var on = r.step !== 3 && k === r.step;
        return '<li class="' + (done ? 'is-done' : '') + (on ? ' is-on is-' + r.tone : '') + '">' + (on ? STEPS_NOW[k] : s) + '</li>';
      }).join('');
      el.meta.innerHTML =
        '<div><dt>Buyer</dt><dd>' + esc(r.buyer) + '</dd></div>' +
        '<div><dt>Context</dt><dd>' + esc(r.ctx) + '</dd></div>' +
        '<div><dt>Rules</dt><dd><span class="b-nw">PSA / BGS / SGC</span> · <span class="b-nw">$100–$5,000</span> · 90%</dd></div>' +
        '<div><dt>State</dt><dd><span class="' + statusCls(r.st[0]) + '">' + esc(r.st[1]) + '</span></dd></div>';
      if (live) live.textContent = r.buyer + ', ' + r.card + ', ' + r.grade + '. Offer ' + r.ov + ' of ' + r.mv + '. ' + r.st[1] + '.';
      if (!CIQ.reducedMotion()) { detail.classList.remove('is-swapping'); void detail.offsetWidth; detail.classList.add('is-swapping'); }
    };

    trs.forEach(function (tr, k) {
      var btn = tr.querySelector('.b-q__btn');
      if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); show(k); });
      // The whole row is a pointer target; the buyer button is the keyboard target.
      tr.addEventListener('click', function () { show(k); });
    });

    /* status filter + search: hide non-matching rows; keep the detail on a visible row */
    var apply = function () {
      var tones = FILTERS[filter];
      var q = search ? search.value.trim().toLowerCase().replace(/^@/, '') : '';
      var shown = [];
      trs.forEach(function (tr, k) {
        var r = ROWS[k];
        var ok = (!tones || tones.indexOf(r.tone) > -1) &&
          (!q || (r.buyer + ' ' + r.cert + ' ' + r.card).toLowerCase().indexOf(q) > -1);
        tr.hidden = !ok;
        if (ok) shown.push(k);
      });
      if (empty) empty.hidden = shown.length > 0;
      if (count) count.textContent = shown.length === ROWS.length ? 'Showing ' + ROWS.length + ' most recent offers' : 'Showing ' + shown.length + ' of ' + ROWS.length + ' most recent offers';
      if (shown.length && shown.indexOf(current) < 0) show(shown[0]);
    };
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-filter');
        tabs.forEach(function (t) { var on = t === b; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', String(on)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);

    // Open on a row other than the hero's Burrow offer: the console proves breadth, not the same deal again.
    show(1, true);
  }
})();
