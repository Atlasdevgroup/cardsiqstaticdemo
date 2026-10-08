/* Inventory Management v2.1
   - Incoming Inventory: status tabs, search and source filter; every row opens the order drawer.
   - Inventory Directory: tabs filter rows; every row opens the card drawer (provenance).
   - Receiving: "Scan a card" / "Receive an order" modes drive the live Add Cards window (states 0–5).
   - Ledger: the sticky record follows the entries.
   Runs deferred, after ciq.js has defined CIQ.drawer but before it boots, so renderers and
   ciq:step listeners are attached at the top level. Product data is illustrative and canonical
   (BUILD-BRIEF-V21 §2). Unknown fields are left out, never filled. */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = function () { return CIQ.reducedMotion ? CIQ.reducedMotion() : false; };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ================================================================ shared markup helpers */
  function ico(n) { return '<span data-ico="' + n + '"></span>'; }
  function src(name, type) { return '<span class="i-src">' + name + (type ? '<small>' + type + '</small>' : '') + '</span>'; }
  function status(cls, icon, label, caps) {
    return '<span class="lv-status lv-status--' + cls + (caps ? ' lv-status--caps' : '') + ' lv-status--sm">' + (icon ? ico(icon) : '') + label + '</span>';
  }
  var S = {
    awaiting: status('muted', 'clock', 'Awaiting shipment'),
    transit: status('sent', 'truck', 'In transit'),
    delivered: status('teal', 'box', 'Delivered'),
    onhand: status('muted', 'pin', 'On hand'),
    incoming: status('teal', 'inbox', 'Incoming', 1),
    review: status('amber', 'clock', 'Needs review', 1),
    ready: status('sent', 'scanbar', 'Ready for intake', 1),
    received: status('ok', 'checkc', 'Received', 1),
    available: status('ok', 'checkc', 'Available', 1),
    assigned: status('violet', 'link', 'Assigned', 1),
    completed: status('ok', 'checkc', 'Completed')
  };
  function pill(kind, text) {
    if (kind === 'team') return '<span class="lv-pill lv-pill--team ' + text[1] + '">' + text[0] + '</span>';
    if (kind === 'needs') return '<span class="lv-pill i-needs">' + ico('info') + text + '</span>';
    if (kind === 'noteam') return '<span class="lv-pill i-noteam">' + text + '</span>';
    if (kind === 'wh') return '<span class="lv-pill lv-pill--wh">' + ico('pin') + text + '</span>';
    return '<span class="lv-pill lv-pill--' + kind + '">' + text + '</span>';
  }
  function chips(list) { return '<div class="lv-chips">' + list.map(function (c) { return pill(c[0], c[1]); }).join('') + '</div>'; }
  function thumb(c, cls) {
    if (!c.img) return '<span class="lv-thumb i-rawthumb ' + (cls || '') + '" aria-hidden="true"></span>';
    return '<img class="lv-thumb ' + (cls || '') + '" src="assets/img/slabs/' + c.img[0] + '" alt="" width="' + c.img[1] + '" height="' + c.img[2] + '">';
  }
  function dhead(o) {
    return '<div class="lv-dhead">' +
      (o.eyebrow ? '<div class="lv-dhead__eyebrow">' + o.eyebrow + '</div>' : '') +
      '<h2 class="lv-dhead__title" data-drawer-title>' + o.title + (o.dot ? ' <span class="lv-dhead__dot' + (o.dot === 'amber' ? ' lv-dhead__dot--amber' : '') + '"></span>' : '') + '</h2>' +
      (o.sub ? '<p class="lv-dhead__sub">' + o.sub + '</p>' : '') +
      (o.meta ? '<p class="lv-dhead__meta">' + o.meta + '</p>' : '') +
      (o.chips || '') + '</div>';
  }
  function dsec(icon, tone, title, desc, body) {
    return '<section class="lv-dsec"><div class="lv-dsec__head">' +
      '<span class="lv-dsec__ico' + (tone ? ' lv-dsec__ico--' + tone : '') + '">' + ico(icon) + '</span>' +
      '<h3 class="lv-dsec__title">' + title + '</h3>' + (desc ? '<p class="lv-dsec__desc">' + desc + '</p>' : '') +
      '</div>' + body + '</section>';
  }
  function dl(rows) {
    return '<dl class="lv-dl">' + rows.filter(Boolean).map(function (r) {
      return '<div' + (r[2] === 'total' ? ' class="lv-dl__total"' : '') + '><dt>' + r[0] + '</dt><dd' + (r[2] === 'mono' ? ' class="lv-dl__mono"' : '') + '>' + r[1] + '</dd></div>';
    }).join('') + '</dl>';
  }
  /* history items: [event, detail, time, state] with state done | current | pending */
  function hist(items) {
    return '<ol class="lv-hist">' + items.map(function (h) {
      var st = h[3] || 'done';
      var node = st === 'pending' ? 'clock' : st === 'current' ? 'bolt' : 'check';
      return '<li' + (st !== 'done' ? ' class="is-' + st + '"' : '') + '><span class="lv-hist__node">' + ico(node) + '</span>' +
        '<p class="lv-hist__ev">' + h[0] + (h[1] ? '<small>' + h[1] + '</small>' : '') + '</p>' +
        '<span class="lv-hist__t">' + (h[2] || '') + '</span></li>';
    }).join('') + '</ol>';
  }

  /* ================================================================ cards (canonical) */
  var CARD = {
    mayeSC: { t: '2024 Signature Class Drake Maye Rookie Class Chrome Auto Gold Refractor #RCVDM', img: ['maye-2024-signature-class-gold-auto-psa8.webp', 541, 900], chips: [['grade', 'PSA 8.0'], ['cert', 'Cert #142107918'], ['team', ['Patriots', 'lv-team--patriots']]] },
    edwards: { t: '2020 Panini Prizm Anthony Edwards Blue Ice #258', img: ['edwards-2020-prizm-blue-ice-psa10.webp', 465, 781], chips: [['grade', 'PSA 10.0'], ['cert', 'Cert #62098915'], ['team', ['Timberwolves', 'lv-team--wolves']]] },
    curry: { t: '2022 Select Stephen Curry Signature #SSCY', img: ['curry-2022-select-signature-psa9.webp', 449, 784], chips: [['grade', 'PSA 9.0'], ['cert', 'Cert #83289827'], ['team', ['Warriors', 'i-team--warriors']]] },
    mahomesLime: { t: '2017 Panini Donruss Optic Patrick Mahomes II Lime #177', img: ['mahomes-2017-optic-lime-psa9.webp', 900, 1499], chips: [['grade', 'PSA 9.0'], ['cert', 'Cert #159117071'], ['team', ['Chiefs', 'lv-team--chiefs']]] },
    mhj: { t: '“2024 Prizm MHJ Silver RC Cardinals raw NM-MT”', img: null, chips: [['raw', 'RAW'], ['needs', 'Needs match']] },
    burrowIce: { t: '2020 Panini Prizm Joe Burrow Blue Ice #307', img: ['burrow-2020-prizm-blue-ice-psa9.webp', 538, 900], chips: [['grade', 'PSA 9.0'], ['cert', 'Cert #83079660'], ['team', ['Bengals', 'lv-team--bengals']]] },
    burrow: { t: '2023 Donruss Optic Joe Burrow Downtown! #D4', img: ['burrow-2023-optic-downtown-psa9.webp', 380, 638], chips: [['grade', 'PSA 9.0'], ['cert', 'Cert #103207853'], ['team', ['Bengals', 'lv-team--bengals']]] }
  };
  function mini(key, cost, st, hi) {
    var c = CARD[key];
    return '<li class="i-dmini' + (hi ? ' is-hi' : '') + '">' + thumb(c) +
      '<div class="i-dmini__main"><p class="lv-name">' + c.t + '</p>' + chips(c.chips) + '</div>' +
      '<div class="i-dmini__end"><span class="lv-k">Cost</span><span class="lv-pill lv-pill--cost">' + cost + '</span>' + st + '</div></li>';
  }
  function minis(list, hiKey) {
    return '<ul class="i-dminis">' + list.map(function (m) { return mini(m[0], m[1], m[2], m[0] === hiKey); }).join('') + '</ul>';
  }
  /* A mini row with its own end cells (the buyback card row: cost, market value, destination, status as live 181347) */
  function miniRow(key, end, hi) {
    var c = CARD[key];
    return '<ul class="i-dminis"><li class="i-dmini' + (hi ? ' is-hi' : '') + '">' + thumb(c) +
      '<div class="i-dmini__main"><p class="lv-name">' + c.t + '</p>' + chips(c.chips) + '</div>' +
      '<div class="i-dmini__end">' + end + '</div></li></ul>';
  }
  var PENDING_RECEIVE = [
    ['Received into CardsIQ', 'Scan the cert at intake', '', 'pending'],
    ['Verified', 'Cert matches the order', '', 'pending'],
    ['Added to available inventory', '', '', 'pending']
  ];

  /* ================================================================ orders (Incoming Inventory) */
  var ORDERS = {
    'ebay-40562': function (hi) {
      return dhead({
        eyebrow: src('eBay') + S.transit,
        title: 'Order 14-12873-40562',
        sub: '2 cards from gridironvault',
        meta: 'Purchased Sep 29, 2026, 9:16 PM · Imported 9:18 PM'
      }) + '<div class="lv-dbody">' +
        dsec('receipt', '', 'Order', 'Imported from the marketplace with the order.', dl([
          ['Source', 'eBay'], ['Origin', 'Marketplace purchase'], ['Order number', '14-12873-40562', 'mono'],
          ['Purchase date', 'Sep 29, 2026, 9:16 PM'], ['Seller', 'gridironvault'], ['Order total', '$1,392.00']
        ])) +
        dsec('cards', 'teal', 'Cards in Order <span class="lv-tag">2</span>', 'Each card has its own incoming record.', minis([['mayeSC', '$766.61', S.incoming], ['edwards', '$625.39', S.incoming]], hi)) +
        dsec('dollar', 'green', 'Cost Basis', 'Captured at purchase, before the cards arrive.', dl([
          ['Item subtotal', '$1,380.00<small class="i-dl__parts">Maye $760.00 + Edwards $620.00</small>'], ['Shipping', '$12.00'], ['Order total', '$1,392.00', 'total']
        ]) + '<p class="lv-dsec__note">Shipping is allocated across the cards by price: Maye $766.61 · Edwards $625.39.</p>') +
        dsec('truck', '', 'Shipping', '', dl([
          ['Carrier', 'USPS'], ['Tracking', '9405 5036 9930 0184 2264 17', 'mono'], ['Status', S.transit],
          ['Shipped', 'Sep 30, 2026'], ['Estimated delivery', 'Oct 3, 2026']
        ])) +
        dsec('history', 'violet', 'History', '', hist([
          ['Order imported', 'eBay · 2 cards', 'Sep 29, 9:18 PM'],
          ['Tracking detected', 'USPS', 'Sep 30, 10:31 AM'],
          ['In transit', '', 'Sep 30, 6:05 PM', 'current'],
          ['Delivered', '', 'Est. Oct 3', 'pending']
        ].concat(PENDING_RECEIVE))) +
        '</div>';
    },
    'goldin-41873': function (hi) {
      return dhead({
        eyebrow: src('Goldin', 'Auction') + S.transit,
        title: 'Invoice 41873',
        sub: '1 card won at auction',
        meta: 'Purchased Sep 27, 2026 · Imported 10:02 PM'
      }) + '<div class="lv-dbody">' +
        dsec('receipt', '', 'Order', '', dl([
          ['Source', 'Goldin'], ['Origin', 'Auction purchase'], ['Invoice', '41873', 'mono'], ['Purchase date', 'Sep 27, 2026']
        ])) +
        dsec('cards', 'teal', 'Cards in Order <span class="lv-tag">1</span>', '', minis([['curry', '$1,140.00', S.incoming]], hi)) +
        dsec('dollar', 'green', 'Cost Basis', '', dl([['Cost basis', '$1,140.00', 'total']]) + '<p class="lv-dsec__note">Includes buyer\'s premium.</p>') +
        dsec('truck', '', 'Shipping', '', dl([
          ['Carrier', 'FedEx'], ['Status', S.transit], ['Shipped', 'Sep 30, 2026'], ['Estimated delivery', 'Oct 5, 2026']
        ])) +
        dsec('history', 'violet', 'History', '', hist([
          ['Order imported', 'Goldin · 1 card', 'Sep 27, 10:02 PM'],
          ['Tracking detected', 'FedEx', 'Sep 30, 4:40 PM'],
          ['In transit', '', '', 'current'],
          ['Delivered', '', 'Est. Oct 5', 'pending']
        ].concat(PENDING_RECEIVE))) +
        '</div>';
    },
    'fanatics-3318402': function (hi) {
      return dhead({
        eyebrow: src('Fanatics Collect') + S.awaiting,
        title: 'Order 3318402',
        sub: '1 card · tracking pending',
        meta: 'Purchased Oct 1, 2026, 7:44 PM · Imported 7:46 PM'
      }) + '<div class="lv-dbody">' +
        dsec('receipt', '', 'Order', '', dl([
          ['Source', 'Fanatics Collect'], ['Origin', 'Marketplace purchase'], ['Order number', '3318402', 'mono'], ['Purchase date', 'Oct 1, 2026, 7:44 PM']
        ])) +
        dsec('cards', 'teal', 'Cards in Order <span class="lv-tag">1</span>', '', minis([['mahomesLime', '$720.00', S.incoming]], hi)) +
        dsec('dollar', 'green', 'Cost Basis', '', dl([['Cost basis', '$720.00', 'total']])) +
        dsec('truck', '', 'Shipping', '', dl([['Status', S.awaiting], ['Tracking', 'Pending']])) +
        dsec('history', 'violet', 'History', '', hist([
          ['Order imported', 'Fanatics Collect · 1 card', 'Oct 1, 7:46 PM'],
          ['Awaiting shipment', 'Tracking appears when the seller ships', '', 'current'],
          ['In transit', '', '', 'pending'],
          ['Delivered', '', '', 'pending']
        ].concat(PENDING_RECEIVE))) +
        '</div>';
    },
    'ebay-77815': function (hi) {
      return dhead({
        eyebrow: src('eBay') + S.awaiting + S.review,
        title: 'Order 14-13002-77815',
        sub: '1 card from desertdugout',
        meta: 'Purchased Oct 1, 2026, 11:20 AM'
      }) + '<div class="lv-dbody">' +
        '<p class="i-dnote">' + ico('info') + '<span><b>Needs review.</b> The listing title didn\'t match one catalog card. Confirm the card at intake.</span></p>' +
        dsec('receipt', '', 'Order', '', dl([
          ['Source', 'eBay'], ['Origin', 'Marketplace purchase'], ['Order number', '14-13002-77815', 'mono'],
          ['Purchase date', 'Oct 1, 2026, 11:20 AM'], ['Seller', 'desertdugout'], ['Order total', '$68.50']
        ])) +
        dsec('cards', 'teal', 'Cards in Order <span class="lv-tag">1</span>', 'Listing title as synced.', minis([['mhj', '$68.50', S.review]], hi)) +
        dsec('dollar', 'green', 'Cost Basis', '', dl([['Item', '$64.00'], ['Shipping', '$4.50'], ['Order total', '$68.50', 'total']])) +
        dsec('truck', '', 'Shipping', '', dl([['Status', S.awaiting], ['Tracking', 'Pending']])) +
        dsec('history', 'violet', 'History', '', hist([
          ['Order imported', 'eBay · 1 card', ''],
          ['Card identity: needs review', 'No single catalog match for the listing title', '', 'current'],
          ['In transit', '', '', 'pending'],
          ['Delivered', '', '', 'pending'],
          ['Received into CardsIQ', 'Confirm the card at intake', '', 'pending'],
          ['Added to available inventory', '', '', 'pending']
        ])) +
        '</div>';
    },
    'alt-8f21c9': function (hi) {
      return dhead({
        eyebrow: src('ALT') + S.delivered + S.ready,
        title: 'Order 8F21C9',
        sub: '1 card · delivered, ready for intake',
        meta: 'Purchased Sep 30, 2026, 3:05 PM · Imported 3:07 PM'
      }) + '<div class="lv-dbody">' +
        dsec('receipt', '', 'Order', '', dl([
          ['Source', 'ALT'], ['Origin', 'Marketplace purchase'], ['Order number', '8F21C9', 'mono'], ['Purchase date', 'Sep 30, 2026, 3:05 PM']
        ])) +
        dsec('cards', 'teal', 'Cards in Order <span class="lv-tag">1</span>', '', minis([['burrowIce', '$385.00', S.ready]], hi)) +
        dsec('dollar', 'green', 'Cost Basis', '', dl([['Cost basis', '$385.00', 'total']])) +
        dsec('truck', '', 'Shipping', '', dl([['Carrier', 'UPS'], ['Status', S.delivered], ['Delivered', 'Oct 2, 2026, 1:47 PM']])) +
        dsec('history', 'violet', 'History', '', hist([
          ['Order imported', 'ALT · 1 card', 'Sep 30, 3:07 PM'],
          ['Tracking detected', 'UPS', 'Oct 1, 9:12 AM'],
          ['In transit', '', 'Oct 1, 5:30 PM'],
          ['Delivered', '', 'Oct 2, 1:47 PM'],
          ['Ready for intake', 'Scan the cert to receive', '', 'current']
        ].concat(PENDING_RECEIVE)) +
          '<p class="i-dact"><button type="button" class="lv-btn lv-btn--teal" data-jump="#intake" data-jump-mode="order">' + ico('scanbar') + 'Receive this order</button></p>') +
        '</div>';
    },
    'buyback-7c41b2e9': function (hi) {
      return dhead({
        eyebrow: src('Buyback', 'CardsIQ') + status('teal', '', 'Live break', 1) + S.onhand + S.received,
        title: 'Acquisition #7C41B2E9',
        sub: '1 card purchased from northstarcards',
        meta: 'Oct 2, 2026, 8:54 PM'
      }) + '<div class="lv-dbody">' +
        dsec('cart', '', 'Acquisition', 'Bought back on stream. The breaker already holds the card, so nothing ships.', dl([
          ['Origin', 'Buyback (live break)'], ['Seller', '<span class="lv-handle">northstarcards</span>'],
          ['Break', 'Break 04 · BRK-1842-04'], ['Offer', '$927.00 = 90.0% × $1,030.00']
        ])) +
        dsec('cards', 'teal', 'Cards in Transaction <span class="lv-tag">1</span>', '', miniRow('burrow',
          '<span class="i-dpair"><span class="lv-k">Cost</span><span class="lv-pill lv-pill--cost">$927.00</span></span>' +
          '<span class="i-dpair"><span class="lv-k">Market value</span><span class="lv-pill lv-pill--fmv">$1,030.00</span></span>' +
          '<span class="i-dpair"><span class="lv-k">Destination</span><span class="i-dest">Inventory</span></span>' + S.completed, hi === 'burrow')) +
        dsec('history', 'violet', 'History', '', hist([
          ['Card hit', '2026 NFL Mixer · Break 04', '8:52:03 PM'],
          ['Offer sent', '$927.00 at 90.0%', '8:52:04 PM'],
          ['Offer accepted', 'northstarcards', '8:52:41 PM'],
          ['Verification passed', 'Identity, card, account, duplicate', '8:54:09 PM'],
          ['Completed', '', '8:54:12 PM'],
          ['Received into inventory', 'Destination: Inventory · Main Vault', '']
        ])) +
        '</div>';
    }
  };

  /* ================================================================ directory cards (provenance) */
  /* Value: FMV ALT / FMV CL / Cost tiles, then the last sale beside the card (directory cell anatomy) */
  function vals(c) {
    var v = c.v;
    function sale(mark, x) { return '<span class="lv-val"><span class="lv-src lv-src--' + mark + '">' + mark.toUpperCase() + '</span><span class="lv-pill lv-pill--' + (x === '—' ? 'empty' : 'sale') + '">' + x + '</span></span>'; }
    function fmv(x) { return '<p class="lv-tile__v' + (x === '—' ? ' i-dtiles__none' : ' i-dtiles__fmv') + '">' + x + '</p>'; }
    var media = c.img
      ? '<img class="lv-dcard__img" src="assets/img/slabs/' + c.img[0] + '" alt="' + c.t.replace(/"/g, '&quot;') + '" width="' + c.img[1] + '" height="' + c.img[2] + '">'
      : '<span class="lv-dcard__img i-rawthumb" role="img" aria-label="Raw card, no photo"></span>';
    return '<div class="lv-tiles i-dtiles">' +
      '<div class="lv-tile"><p class="lv-tile__k">FMV · ALT</p>' + fmv(v[0]) + '</div>' +
      '<div class="lv-tile"><p class="lv-tile__k">FMV · CL</p>' + fmv(v[1]) + '</div>' +
      '<div class="lv-tile"><p class="lv-tile__k">Cost</p><p class="lv-tile__v i-dtiles__cost">' + v[2] + '</p></div></div>' +
      '<div class="lv-dcard i-dval">' + media + '<div><span class="lv-k">Last sale price</span><span class="lv-vals">' + sale('alt', v[3]) + sale('cl', v[4]) + '</span></div></div>';
  }
  var DIR = {
    burrow: {
      st: S.assigned, img: ['burrow-2023-optic-downtown-psa9.webp', 380, 638], t: '2023 Donruss Optic Joe Burrow Downtown! #D4',
      chips: [['grade', 'PSA 9.0'], ['cert', 'Cert #103207853'], ['team', ['Bengals', 'lv-team--bengals']], ['wh', 'Main Vault']],
      meta: 'SKU #CIQ-P123891 · Added Oct 2, 2026, 8:42 AM', v: ['$1,040.00', '$1,020.00', '$540.00', '$1,065.00', '$995.00'],
      acq: [['Origin', 'Manual intake (scan)'], ['Source', 'Scanned at intake'], ['Received', 'Oct 2, 2026, 8:42 AM'], ['Cost basis', '$540.00', 'total']],
      act: [['Scanned at intake', 'Main Vault · cost $540.00', '8:42 AM'], ['Priced', '$1,030.00 reference from ALT + CL', '9:14 AM'], ['Added to Football Premium 02', 'Ceiling card', '11:37 AM']],
      more: true
    },
    mahomes: {
      st: S.available, img: ['mahomes-2017-optic-holo-psa10.webp', 900, 1494], t: '2017 Panini Donruss Optic Patrick Mahomes II Holo #177',
      chips: [['grade', 'PSA 10.0'], ['cert', 'Cert #156971694'], ['team', ['Chiefs', 'lv-team--chiefs']], ['wh', 'Main Vault']],
      meta: 'Added Oct 2, 2026, 8:39 AM', v: ['$1,880.00', '$1,845.00', '$1,520.00', '$1,910.00', '$1,825.00'],
      acq: [['Origin', 'Manual intake (scan)'], ['Source', 'Scanned at intake'], ['Received', 'Oct 2, 2026, 8:39 AM'], ['Cost basis', '$1,520.00', 'total']],
      act: [['Scanned at intake', 'Main Vault · cost $1,520.00', '8:39 AM'], ['Added to available inventory', '', '8:39 AM']]
    },
    brady: {
      st: S.assigned, img: ['brady-2000-bowman-psa8.webp', 900, 1495], t: '2000 Bowman Tom Brady #236',
      chips: [['grade', 'PSA 8.0'], ['cert', 'Cert #82389068'], ['team', ['Patriots', 'lv-team--patriots']], ['wh', 'Main Vault']],
      meta: 'Added Oct 1, 2026, 4:12 PM', v: ['$1,195.00', '$1,165.00', '$1,040.00', '$1,210.00', '$1,140.00'],
      acq: [['Origin', 'Auction purchase'], ['Source', src('Goldin', 'Auction')], ['Reference', 'Invoice 41522', 'mono'], ['Acquired', 'Sep 24, 2026'], ['Received', 'Oct 1, 2026, 4:12 PM'], ['Cost basis', '$1,040.00', 'total']],
      act: [['Purchased', 'Goldin · Invoice 41522', 'Sep 24'], ['Received into CardsIQ', 'Main Vault', 'Oct 1, 4:12 PM'], ['Added to Football Premium 02', 'Ceiling card', '', 'current']]
    },
    kobe: {
      st: S.available, img: ['kobe-1998-stadium-club-chrome-refractor-psa10.webp', 536, 900], t: '1998 Stadium Club Chrome Kobe Bryant Refractor #6',
      chips: [['grade', 'PSA 10.0'], ['cert', 'Cert #99344756'], ['team', ['Lakers', 'lv-team--lakers']], ['wh', 'Main Vault']],
      meta: 'Added Oct 1, 2026, 2:05 PM', v: ['$3,420.00', '$3,380.00', '$2,760.00', '$3,500.00', '$3,350.00'],
      acq: [['Origin', 'Marketplace purchase'], ['Source', src('Fanatics Collect')], ['Order', '3297715', 'mono'], ['Acquired', 'Sep 25, 2026'], ['Received', 'Oct 1, 2026, 2:05 PM'], ['Cost basis', '$2,760.00', 'total']],
      act: [['Purchased', 'Fanatics Collect · Order 3297715', 'Sep 25'], ['Received into CardsIQ', 'Main Vault', 'Oct 1, 2:05 PM'], ['Added to available inventory', '', '']]
    },
    maye: {
      st: S.available, img: ['maye-2024-prizm-red-sparkle-psa10.webp', 535, 900], t: '2024 Panini Prizm Drake Maye Red Sparkle #329',
      chips: [['grade', 'PSA 10.0'], ['cert', 'Cert #139782623'], ['team', ['Patriots', 'lv-team--patriots']], ['wh', 'Main Vault']],
      meta: 'Added Sep 30, 2026, 11:48 AM', v: ['$640.00', '$615.00', '$410.00', '$655.00', '$600.00'],
      acq: [['Origin', 'Marketplace purchase'], ['Source', src('eBay')], ['Order', '14-12688-10937', 'mono'], ['Acquired', 'Sep 25, 2026'], ['Delivered', 'Sep 30, 2026, 11:02 AM'], ['Received', 'Sep 30, 2026, 11:48 AM'], ['Item', '$405.00'], ['Shipping', '$5.00'], ['Cost basis', '$410.00', 'total']],
      act: [['Purchased', 'eBay · Order 14-12688-10937', 'Sep 25'], ['Delivered', '', 'Sep 30, 11:02 AM'], ['Received into CardsIQ', 'Cert matched the order', 'Sep 30, 11:48 AM'], ['Added to available inventory', '', '']]
    },
    wemby: {
      st: S.review, img: ['wembanyama-2022-bowman-u-best-auto-psa10.webp', 469, 799], t: '2022 Bowman University Best Victor Wembanyama Auto-Refractor #BOAVW',
      chips: [['grade', 'PSA 10.0'], ['cert', 'Cert #78900062'], ['noteam', 'Missing team'], ['wh', 'Main Vault']],
      meta: 'Added Sep 29, 2026, 3:20 PM', v: ['$1,650.00', '$1,600.00', '$1,280.00', '$1,700.00', '$1,580.00'],
      note: '<b>Needs review.</b> Missing team. Set the team before the card goes into a product.',
      acq: [['Origin', 'Marketplace purchase'], ['Source', src('ALT')], ['Order', '7D04A1', 'mono'], ['Acquired', 'Sep 26, 2026'], ['Received', 'Sep 29, 2026, 3:20 PM'], ['Cost basis', '$1,280.00', 'total']],
      act: [['Purchased', 'ALT · Order 7D04A1', 'Sep 26'], ['Received into CardsIQ', 'Main Vault', 'Sep 29, 3:20 PM'], ['Needs review', 'Missing team', '', 'current']]
    },
    bonix: {
      st: S.available, img: null, t: '2024 Panini Prizm Bo Nix Silver Prizm Rookie Broncos',
      chips: [['raw', 'RAW'], ['cert', 'SKU #CIQ-412'], ['team', ['Broncos', 'lv-team--broncos']], ['wh', 'Main Vault']],
      meta: 'Added Sep 29, 2026, 10:02 AM', v: ['—', '—', '$95.00', '$170.00', '$165.00'],
      acq: [['Origin', 'Raw intake'], ['Source', 'Heystack batch'], ['Received', 'Sep 29, 2026, 10:02 AM'], ['Cost basis', '$95.00', 'total']],
      act: [['Imported from a Heystack batch', 'Raw card · SKU #CIQ-412', 'Sep 29, 10:02 AM'], ['Added to available inventory', 'Main Vault', '']]
    }
  };
  function cardDrawer(id) {
    var c = DIR[id];
    if (!c) return null;
    return dhead({ eyebrow: c.st, title: c.t, meta: c.meta, chips: chips(c.chips) }) +
      '<div class="lv-dbody">' +
      (c.note ? '<p class="i-dnote">' + ico('info') + '<span>' + c.note + '</span></p>' : '') +
      dsec('value', 'green', 'Value', 'Fair market value from ALT and Card Ladder beside your cost.', vals(c)) +
      dsec('cart', '', 'Acquisition', 'Where it came from, what you paid, and when it arrived.', dl(c.acq)) +
      dsec('history', 'violet', 'Recent Activity', '', hist(c.act) +
        (c.more ? '<p class="i-dact"><button type="button" class="lv-link" data-jump="#ledger" data-jump-focus="#ledger-title">See Break 04 and the buyback in the ledger ' + ico('arrow') + '</button></p>' : '')) +
      '</div>';
  }

  if (CIQ.drawer) {
    CIQ.drawer.register('order', function (id, trigger) {
      var fn = ORDERS[id];
      return fn ? fn(trigger && trigger.getAttribute('data-card')) : null;
    });
    CIQ.drawer.register('card', function (id) { return cardDrawer(id); });
  }

  /* Page-level fixes for the shared drawer (ciq.js is read-only for page builders; listed as shared requests):
     - every drawer opens at its header: render() resets scrollTop while the host is still hidden, and Chrome
       restores the previous drawer's offset on unhide. 'ciq:drawer' fires after the host is shown, so reset here.
     - keyboard users can scroll long drawers: the scroller joins the focus trap's Tab cycle as a named region. */
  document.addEventListener('ciq:drawer', function (e) {
    // Back restores the previous drawer's place (ciq.js); only fresh opens start at the header.
    if (!e.detail || !e.detail.open || e.detail.back) return;
    var s = document.querySelector('.lv-drawer__scroll');
    if (!s) return;
    s.scrollTop = 0;
    if (!s.hasAttribute('tabindex')) {
      s.tabIndex = 0;
      s.setAttribute('role', 'region');
      s.setAttribute('aria-label', 'Drawer details');
    }
  });

  /* Buttons inside a drawer that lead back into the page: close the drawer, then go. */
  document.addEventListener('click', function (e) {
    var j = e.target.closest && e.target.closest('[data-jump]');
    if (!j) return;
    e.preventDefault();
    var target = document.querySelector(j.getAttribute('data-jump'));
    var mode = j.getAttribute('data-jump-mode');
    if (CIQ.drawer && CIQ.drawer.isOpen()) CIQ.drawer.close();
    if (mode) setMode(mode, true);
    if (!target) return;
    setTimeout(function () {
      var fsel = j.getAttribute('data-jump-focus');
      var focusEl = fsel ? document.querySelector(fsel) : mode ? document.querySelector('.i-mode [data-mode="' + mode + '"]') : target;
      target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      if (focusEl && focusEl.focus) focusEl.focus({ preventScroll: true });
    }, 30);
  });

  /* ================================================================ Incoming Inventory filters */
  var inc = document.querySelector('.i-inc');
  if (inc) {
    var iTabs = $$('.i-inc__tabs [data-filter]', inc);
    var iRows = $$('.i-inc__table tbody tr[data-type]', inc);
    var iNone = inc.querySelector('.i-inc__none');
    var iCount = inc.querySelector('.i-inc__count');
    var iQ = inc.querySelector('.i-inc__q');
    var iSel = inc.querySelector('.i-inc__sel');
    var TAB_TOTAL = { all: 12, awaiting: 3, transit: 6, delivered: 2, review: 1, received: 1 };
    var SRC_TOTAL = { ebay: [5, 'eBay'], fanatics: [2, 'Fanatics Collect'], goldin: [2, 'Goldin'], alt: [2, 'ALT'], buyback: [1, 'buyback'] };
    var tab = 'all';
    var noun = function (n) { return n === 1 ? 'card' : 'cards'; };
    var norm = function (s) { return String(s || '').toLowerCase().replace(/[\s ]+/g, ' ').trim(); };
    iRows.forEach(function (r) { r._text = norm(r.textContent + ' ' + (r.getAttribute('data-search') || '')); r._digits = r._text.replace(/[^a-z0-9]/g, ''); });
    function applyInc() {
      var q = norm(iQ && iQ.value), qd = q.replace(/[^a-z0-9]/g, '');
      var s = iSel ? iSel.value : 'all';
      var shown = 0;
      iRows.forEach(function (r) {
        var types = (r.getAttribute('data-type') || '').split(' ');
        var hit = (tab === 'all' || types.indexOf(tab) > -1) && (s === 'all' || r.getAttribute('data-src') === s) &&
          (!q || r._text.indexOf(q) > -1 || (qd.length > 3 && r._digits.indexOf(qd) > -1));
        r.hidden = !hit;
        if (hit) shown++;
      });
      if (iNone) iNone.hidden = shown > 0;
      var msg;
      if (!q && s === 'all') msg = 'Showing ' + shown + ' of ' + TAB_TOTAL[tab] + ' incoming ' + noun(TAB_TOTAL[tab]);
      else if (!q && tab === 'all') msg = 'Showing ' + shown + ' of ' + SRC_TOTAL[s][0] + ' ' + SRC_TOTAL[s][1] + ' ' + noun(SRC_TOTAL[s][0]);
      else msg = shown ? 'Showing ' + shown + ' matching ' + (shown === 1 ? 'card' : 'cards') : 'No incoming cards match';
      if (iCount) iCount.textContent = msg;
    }
    iTabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tab = t.getAttribute('data-filter');
        iTabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
        applyInc();
      });
    });
    if (iQ) iQ.addEventListener('input', applyInc);
    if (iSel) iSel.addEventListener('change', applyInc);
  }

  /* ================================================================ directory: tabs filter the illustrative rows */
  var tabs = $$('.i-dir__tabs [data-filter]');
  var rows = $$('.i-table tbody tr');
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

  /* ================================================================ receiving: two intake paths, one Add Cards window
     Steps 1–5 → Add Cards states 1–5. Mode "scan" = Path 1 (cert 103207853), "order" = Path 2
     (cert 83079660 matched to ALT order 8F21C9, cost prefilled). The HTML ships scan mode, state 5. */
  var section = document.getElementById('intake');
  var steps = document.getElementById('intake-steps');
  var add = document.querySelector('.i-add');
  var modeBtns = $$('.i-mode [data-mode]');
  var mode = 'scan';
  function setState(n) {
    if (!add) return;
    var typed = add.querySelector('.i-add__typed');
    add.setAttribute('data-state', String(n));
    typed.textContent = n >= 1 ? typed.getAttribute('data-typed-' + mode) : typed.getAttribute('data-placeholder');
    add.querySelector('.i-add__count').textContent = n >= 2 ? '1' : '0';
  }
  function syncCtl() {
    var ctl = document.querySelector('[data-seq-control="#intake-steps"]');
    if (!ctl || ctl.hidden) return;
    ctl.setAttribute('data-state', 'playing');
    var l = ctl.querySelector('.seq-ctl__label'), i = ctl.querySelector('.seq-ctl__ico');
    if (l) l.textContent = 'Pause';
    if (i && CIQ.icon) i.innerHTML = CIQ.icon('pause');
  }
  function setMode(m, fromDrawer) {
    if (!section || !add || (m === mode && !fromDrawer)) return;
    mode = m;
    section.setAttribute('data-mode', m);
    add.setAttribute('data-mode', m);
    modeBtns.forEach(function (b) { var on = b.getAttribute('data-mode') === m; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    if (steps && steps._seq) { steps._seq.restart(); if (!reduced()) syncCtl(); }
    else setState(reduced() ? 5 : 0);
  }
  if (steps && add) {
    // The HTML ships the finished state (no-JS and reduced motion). With motion, start empty.
    if (!reduced()) setState(0);
    steps.addEventListener('ciq:step', function (e) { setState(Math.max(0, e.detail.index + 1)); });
    modeBtns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
    // These steps are not interactive, so a click on one doesn't pause the sequence. The shared control
    // still flips to "Play" on any step click; put it back to "Pause" while the sequence really plays.
    steps.addEventListener('click', function (e) {
      if (!e.target.closest('[data-step]')) return;
      setTimeout(function () {
        var c = document.querySelector('[data-seq-control="#intake-steps"]');
        if (c && c.getAttribute('data-state') === 'paused' && steps._seq && !steps._seq.paused) syncCtl();
      }, 0);
    });
  }

  /* ================================================================ phone tab strips: drop the edge fade at the end */
  $$('.i-inc__tabs, .i-dir__tabs').forEach(function (t) {
    function upd() { t.classList.toggle('is-end', t.scrollLeft + t.clientWidth >= t.scrollWidth - 1); }
    t.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

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
