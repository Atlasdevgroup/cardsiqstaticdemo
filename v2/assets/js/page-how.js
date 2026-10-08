/* How it works — lifecycle panel: stage copy + the real CardsIQ screen for each stage. */
(function () {
  'use strict';

  // Copy: dev /how-it-works lifecycle verbs (Identify · Value · Operate · Transact · Record) and
  // the approved v1 stage descriptions. Modules link to where each stage happens.
  var STAGES = [
    { name: 'Identity', verb: 'Identify', mod: ['Inventory Management', 'inventory-management.html'],
      desc: 'PSA certification matched. The card enters CardsIQ once, with an identity every later workflow inherits.' },
    { name: 'Inventory', verb: 'Identify', mod: ['Inventory Management', 'inventory-management.html'],
      desc: 'An internal SKU and a warehouse location are attached, so the card can be tracked as inventory before it is priced.' },
    { name: 'Value', verb: 'Value', mod: ['Inventory Management', 'inventory-management.html'],
      desc: 'Market data from ALT and Card Ladder and your cost basis attach to the same record, not a separate spreadsheet. The card is released as available.' },
    { name: 'Product', verb: 'Operate', mod: ['Inventory Management', 'inventory-management.html'],
      desc: 'The card is assigned to a break product. Card-level economics stay attached, and the product knows its floor and ceiling.' },
    { name: 'Break', verb: 'Operate', mod: ['StreamIQ', 'streamiq.html'],
      desc: 'The product opens on stream. The break keeps its own ledger inside the show.' },
    { name: 'Buyer', verb: 'Operate', mod: ['StreamIQ', 'streamiq.html'],
      desc: 'The team spot is mapped to a verified buyer, so the card knows who owns it the moment it is hit.' },
    { name: 'Offer', verb: 'Transact', mod: ['Instant Buybacks', 'instant-buybacks.html'],
      desc: 'The hit is eligible under your rules, so an instant offer is sent at your buyback rate on the reference price.' },
    { name: 'Verification', verb: 'Transact', mod: ['Instant Buybacks', 'instant-buybacks.html'],
      desc: 'Identity, card, account, and duplicate checks run against the same record before anything settles.' },
    { name: 'Settlement', verb: 'Transact', mod: ['Instant Buybacks', 'instant-buybacks.html'],
      desc: 'Payout completes and the acquisition is recorded, with nothing left to reconcile after the stream.' },
    { name: 'History', verb: 'Record', mod: ['Inventory Management', 'inventory-management.html'],
      desc: 'Every state change was written to the same record. The card comes back into inventory with its whole history attached.' }
  ];

  var rail = document.getElementById('life-rail');
  var panel = document.querySelector('.h-life__panel');
  if (!rail || !panel) return;
  var frags = Array.prototype.slice.call(panel.querySelectorAll('[data-frag]'));
  var q = function (s) { return panel.querySelector(s); };
  var stepEl = q('.h-life__step'), verbEl = q('.h-life__verb'), headEl = q('.h-life__head'), descEl = q('.h-life__desc');
  var modLink = q('.h-life__where a'), modName = q('.h-life__mod');

  function show(i) {
    var k = Math.max(0, i), s = STAGES[k];
    stepEl.textContent = 'Stage ' + (k + 1) + ' of ' + STAGES.length;
    verbEl.textContent = s.verb;
    headEl.textContent = s.name;
    descEl.textContent = s.desc;
    modName.textContent = s.mod[0];
    modLink.setAttribute('href', s.mod[1]);
    frags.forEach(function (f) { f.hidden = +f.getAttribute('data-frag') !== k; });
  }
  show(0);
  rail.addEventListener('ciq:step', function (e) {
    if (e.detail.index < 0) return;
    // Autoplay stays silent; a stage the visitor picks (which pauses autoplay) is announced.
    if (rail._seq && rail._seq.paused) panel.querySelector('.h-life__copy').setAttribute('aria-live', 'polite');
    show(e.detail.index);
  });
})();
