/* Platform page — hero record wires + lifecycle stage detail. */
(function () {
  'use strict';
  var CIQ = window.CIQ;

  /* ------------------------------------------------ hero: wires from callouts to the physical card */
  var fig = document.querySelector('.p-asset');
  if (fig) {
    var svg = fig.querySelector('.p-asset__wires');
    var stage = fig.querySelector('.p-asset__stage');
    var card = fig.querySelector('.p-asset__card .slab img');
    var callouts = Array.prototype.slice.call(fig.querySelectorAll('.callout'));
    var NS = 'http://www.w3.org/2000/svg';
    var paths = [], pins = [];

    function draw() {
      if (getComputedStyle(svg).display === 'none' || !card.complete) return;
      var box = fig.getBoundingClientRect();
      var c = card.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
      svg.innerHTML = '<defs><linearGradient id="wire-grad" x1="0" x2="1"><stop offset="0" stop-color="#22a8ff"/><stop offset="1" stop-color="#a258f7"/></linearGradient></defs>';
      paths = []; pins = [];
      callouts.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var t = (el.getAttribute('data-target') || '0.5,0.5').split(',').map(Number);
        var left = r.right < c.left + c.width / 2;
        var x0 = (left ? r.right : r.left) - box.left;
        var y0 = r.top + r.height / 2 - box.top;
        var x1 = c.left + c.width * t[0] - box.left;
        var y1 = c.top + c.height * t[1] - box.top;
        var mx = (x0 + x1) / 2;
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', 'M' + x0 + ' ' + y0 + ' C' + mx + ' ' + y0 + ' ' + mx + ' ' + y1 + ' ' + x1 + ' ' + y1);
        var pin = document.createElementNS(NS, 'circle');
        pin.setAttribute('cx', x1); pin.setAttribute('cy', y1); pin.setAttribute('r', 3.5);
        svg.appendChild(p); svg.appendChild(pin);
        paths.push(p); pins.push(pin);
      });
      sync();
    }
    function sync() {
      callouts.forEach(function (el, i) {
        var lit = el.classList.contains('is-active') || el.classList.contains('is-done');
        if (paths[i]) paths[i].classList.toggle('is-lit', lit);
        if (pins[i]) pins[i].classList.toggle('is-lit', el.classList.contains('is-active'));
      });
    }
    stage.addEventListener('ciq:step', sync);
    window.addEventListener('load', draw);
    if (card.complete) requestAnimationFrame(draw); else card.addEventListener('load', draw);
    if ('ResizeObserver' in window) new ResizeObserver(function () { schedule(); }).observe(fig);
    // Tilt moves the card; keep wires attached while the pointer moves.
    var pending = 0;
    function schedule() { if (!pending) pending = requestAnimationFrame(function () { pending = 0; draw(); }); }
    fig.addEventListener('pointermove', schedule);
    fig.addEventListener('pointerleave', function () { setTimeout(draw, 720); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  /* ------------------------------------------------ lifecycle: what the record holds at each stage */
  var STAGES = [
    { name: 'Identity', time: '08:42 AM', state: ['info', 'Identified'],
      desc: 'PSA certification matched. The card enters CardsIQ once, with an identity that every later workflow inherits.',
      fields: [['Card', '2023 Donruss Optic Joe Burrow Downtown! #D4'], ['Grade', 'PSA 9 MINT'], ['Cert', '103207853']] },
    { name: 'Inventory', time: '08:42 AM', state: ['info', 'SKU created'],
      desc: 'An internal SKU is generated so the card can be tracked as inventory.',
      fields: [['SKU', 'CIQ-P123891'], ['State', 'Intake'], ['Source', 'Graded intake']] },
    { name: 'Value', time: '09:14 AM', state: ['ok', 'Available'],
      desc: 'Market context and cost basis attach to the same record, not a separate spreadsheet. The card is released into operational inventory.',
      fields: [['Market value', '$1,030'], ['Cost basis', '$540'], ['Market data', 'ALT + Card Ladder']] },
    { name: 'Product', time: '11:37 AM', state: ['product', 'In product'],
      desc: 'The card is assigned to a break product. Card-level economics stay attached.',
      fields: [['Product', 'Football Premium 02'], ['Product size', '10 cards'], ['Product cost', '$4,820']] },
    { name: 'Break', time: '08:31 PM', state: ['live', 'Live'],
      desc: 'The product opens on stream. The break keeps its own ledger inside the show.',
      fields: [['Show', 'Stream #1842 · 2026 NFL Mixer'], ['Break', 'Break 04'], ['Spots', '28 / 32 filled']] },
    { name: 'Buyer', time: '08:32 PM', state: ['info', 'Assigned'],
      desc: 'The spot is mapped to a buyer, so the card knows who owns it the moment it is hit.',
      fields: [['Buyer', '@northstarcards'], ['Spot', 'Bengals'], ['Hit', '08:52:03 PM']] },
    { name: 'Offer', time: '08:52 PM', state: ['pending', 'Offer available'],
      desc: 'The hit is eligible under the business rules, so an instant offer is generated from market value.',
      fields: [['Instant offer', '$927'], ['Buyback rate', '90% of market'], ['Accepted', '08:52:41 PM']] },
    { name: 'Verification', time: '08:54 PM', state: ['ok', 'Verified'],
      desc: 'Identity, card, account, and duplicate checks run against the same record.',
      fields: [['Identity', 'Passed'], ['Duplicate check', 'Clear'], ['Cert', '103207853 matched']] },
    { name: 'Settlement', time: '08:54 PM', state: ['ok', 'Settled'],
      desc: 'Payout completes and the transaction record closes, with nothing left to reconcile.',
      fields: [['Paid', '$927'], ['Buyer', '@northstarcards'], ['Hit to settled', '2m 09s']] },
    { name: 'History', time: 'Complete', state: ['ok', 'Record complete'],
      desc: 'Every state change was written to the same record, so the history is complete without reconciliation.',
      fields: [['Events', '10'], ['Workflows', 'Inventory · StreamIQ · Buybacks'], ['Record', 'One']] }
  ];

  var rail = document.querySelector('.p-rail');
  var panel = document.querySelector('.p-life__panel');
  if (rail && panel) {
    var stepEl = panel.querySelector('.p-life__step');
    var timeEl = panel.querySelector('.p-life__time');
    var headEl = panel.querySelector('.p-life__head');
    var descEl = panel.querySelector('.p-life__desc');
    var fieldsEl = panel.querySelector('.p-life__fields');
    var stateEl = panel.querySelector('.p-life__state');
    // Codes, money, and times read as data; names and phrases stay in the text face.
    var mono = /^(\$[\d,.]+|CIQ-\S+|\d[\d,.:]*( ?(AM|PM))?|\d+ \/ \d+ filled)$/;
    function show(i) {
      var s = STAGES[Math.max(0, i)];
      stepEl.textContent = 'Stage ' + (Math.max(0, i) + 1) + ' of ' + STAGES.length;
      timeEl.textContent = s.time;
      headEl.textContent = s.name;
      descEl.textContent = s.desc;
      fieldsEl.innerHTML = s.fields.map(function (f) {
        return '<div><dt>' + f[0] + '</dt><dd' + (mono.test(f[1]) ? ' class="t-mono"' : '') + '>' + f[1] + '</dd></div>';
      }).join('');
      stateEl.className = 'status status--' + s.state[0] + ' p-life__state';
      stateEl.textContent = s.state[1];
      panel.classList.remove('is-swapping'); void panel.offsetWidth; panel.classList.add('is-swapping');
    }
    show(0);
    rail.addEventListener('ciq:step', function (e) {
      if (e.detail.index < 0) return;
      // Autoplay stays silent; a stage the visitor picks (which pauses autoplay) is announced.
      if (rail._seq && rail._seq.paused) panel.setAttribute('aria-live', 'polite');
      show(e.detail.index);
    });
  }
})();
