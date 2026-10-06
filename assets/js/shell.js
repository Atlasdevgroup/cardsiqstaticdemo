/* CardsIQ demo — application shell.
 * Loaded synchronously as the first element in <body> so the sidebar and top bar
 * render before page content (no layout flash). Page content lives in <main id="main">.
 *
 * Visitor shell (default): Platform nav + Sign in / Create account.
 * Member shell preview: add ?auth=member to any page URL.
 */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  // Central route config — the only place to wire production URLs.
  var CIQ = (window.CIQ = window.CIQ || {});
  CIQ.routes = CIQ.routes || {
    home: 'index.html',
    platform: 'platform.html',
    buybacks: 'instant-buybacks.html',
    inventory: 'inventory-management.html',
    streamiq: 'streamiq.html',
    about: 'about.html',
    partner: 'become-a-partner.html',
    createAccount: '#create-account', // production: CardsIQ sign-up route
    signIn: '#sign-in', // production: CardsIQ sign-in route
    repackHG: '#licensed-repacks-hg-breaks',
    repackRR: '#licensed-repacks-rogue-rips'
  };

  var params = new URLSearchParams(location.search);
  var member = params.get('auth') === 'member';
  CIQ.member = member;
  var page = document.body.getAttribute('data-page') || '';
  var R = CIQ.routes;

  var I = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5z"/>',
    platform: '<path d="m12 3.5 8.5 4.75L12 13 3.5 8.25 12 3.5Z"/><path d="m3.5 12.5 8.5 4.75 8.5-4.75"/><path d="m3.5 16.5 8.5 4.75 8.5-4.75"/>',
    buybacks: '<path d="M4.5 12a7.5 7.5 0 0 1 13.2-4.9L19.5 9"/><path d="M19.5 4.5V9H15"/><path d="M19.5 12a7.5 7.5 0 0 1-13.2 4.9L4.5 15"/><path d="M4.5 19.5V15H9"/>',
    inventory: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    streamiq: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48M7.76 16.24a6 6 0 0 1 0-8.48M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>',
    about: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.75v.01"/>',
    partner: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3.5 13h17"/>',
    repack: '<path d="m20.5 8-8.5-4.5L3.5 8v8l8.5 4.5 8.5-4.5V8Z"/><path d="m3.5 8 8.5 4.5L20.5 8M12 12.5v8"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    wallet: '<rect x="3.5" y="6.5" width="17" height="13" rx="2"/><path d="M16 13h.01M3.5 10h17"/>',
    logout: '<path d="M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    buyback2: '<path d="M7 7.5h11l-3-3M17 16.5H6l3 3"/>',
    activity: '<path d="M3.5 12h4l2.5-6 4 12 2.5-6h4"/>',
    pause: '<path d="M9 5.5v13M15 5.5v13"/>',
    // Record / lifecycle icons — hydrate anywhere with <span data-ico="name"></span>
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><rect x="8.5" y="7.5" width="7" height="9" rx="1"/>',
    value: '<path d="M4 20h16M7 16v-3M11 16V9M15 16v-5M19 16V6"/>',
    product: '<path d="m20.5 8-8.5-4.5L3.5 8v8l8.5 4.5 8.5-4.5V8Z"/><path d="m3.5 8 8.5 4.5L20.5 8M12 12.5v8"/>',
    buyer: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    offer: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.4c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2 0 2.9 5.8 1.4 5.8 4.2 0 1.2-1.3 2-3 2-1.3 0-2.5-.6-3-1.6M12 6.2v1.6M12 16.3v1.5"/>',
    verify: '<path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6l7-2.5Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    settle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.8-5"/>',
    history: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/><path d="M12 8v4.2l3 1.8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    sku: '<path d="M4 9.5V5a1 1 0 0 1 1-1h4.5L20 14.5 14.5 20 4 9.5Z"/><circle cx="8" cy="8" r="1.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bolt: '<path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12l1-7Z"/>',
    cards: '<rect x="3.5" y="6.5" width="11" height="14" rx="1.6"/><path d="M8 3.5h10.9a1.6 1.6 0 0 1 1.6 1.6V17"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M15.5 5.5a3.2 3.2 0 0 1 0 6.2M17.5 14.4a5.5 5.5 0 0 1 3 5.1"/>',
    store: '<path d="M4 9.5 5.5 4.5h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5v8h13v-8"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M4 5.5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2L4 5.5Z"/>',
    columns: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15M14.5 4.5v15"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z"/>',
    camera: '<rect x="3.5" y="6.5" width="12" height="11" rx="2"/><path d="m15.5 10.5 5-3v9l-5-3"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    rule: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + I[name] + '</svg>';
  }
  CIQ.icon = icon;

  function navItem(key, href, label, ico) {
    var current = key === page;
    return '<li><a class="nav-link' + (current ? ' is-current' : '') + '" href="' + href + '"' + (current ? ' aria-current="page"' : '') + '>' + icon(ico) + '<span>' + label + '</span></a></li>';
  }

  var memberGroups = member
    ? '<div class="nav-group"><p class="nav-label">Account</p><ul>' +
      navItem('_b', '#buybacks', 'Buybacks', 'buyback2') +
      navItem('_w', '#wallet', 'Wallet', 'wallet') +
      navItem('_a', '#activity', 'Activity', 'activity') +
      '</ul></div>'
    : '';

  var foot = member
    ? '<div class="side-foot side-foot--member">' +
      '<button class="icon-btn" type="button" aria-label="Notifications, 4 unread">' + icon('bell') + '<span class="badge">4</span></button>' +
      '<span class="balance"><span class="balance__coin" aria-hidden="true">$</span>250.00</span>' +
      '<a class="logout" href="index.html">Logout ' + icon('logout') + '</a></div>'
    : '<div class="side-foot">' +
      // The sidebar sign-up is the gradient primary only where sign-up is the page's primary action;
      // elsewhere it stays secondary so a single gradient primary leads each view.
      '<a class="btn ' + (document.body.getAttribute('data-primary-cta') === 'create-account' ? 'btn--primary' : 'btn--secondary') + ' btn--sm btn--block" data-cta="create-account" href="' + R.createAccount + '">Create account</a>' +
      '<p class="side-foot__alt">Have an account? <a href="' + R.signIn + '" data-cta="sign-in">Sign in</a></p></div>';

  var side =
    '<aside class="shell-side" id="shell-side" aria-label="CardsIQ navigation">' +
    '<div class="side-head"><a class="brand" href="' + R.home + '" aria-label="CardsIQ home"><img src="assets/img/brand/cardsiq-lockup.png" alt="CardsIQ" width="140" height="46"></a>' +
    '<button class="icon-btn side-close" type="button" aria-label="Close menu" data-nav-close>' + icon('close') + '</button></div>' +
    '<nav class="side-nav">' +
    '<ul class="nav-root">' + navItem('home', R.home, 'Home', 'home') + '</ul>' +
    memberGroups +
    '<div class="nav-group"><p class="nav-label">Platform</p><ul>' +
    navItem('platform', R.platform, 'How it works', 'platform') +
    navItem('buybacks', R.buybacks, 'Instant Buybacks', 'buybacks') +
    navItem('inventory', R.inventory, 'Inventory Management', 'inventory') +
    navItem('streamiq', R.streamiq, 'StreamIQ', 'streamiq') +
    '</ul></div>' +
    '<div class="nav-group"><p class="nav-label">Company</p><ul>' +
    navItem('about', R.about, 'About', 'about') +
    navItem('partner', R.partner, 'Become a partner', 'partner') +
    '</ul></div>' +
    '<div class="nav-group"><p class="nav-label">Licensed Repacks</p><ul>' +
    '<li><a class="nav-link" href="' + R.repackHG + '"><span class="mono-badge" aria-hidden="true">HG</span><span>HG Breaks</span></a></li>' +
    '<li><a class="nav-link" href="' + R.repackRR + '"><span class="mono-badge" aria-hidden="true">RR</span><span>Rogue Rips</span></a></li>' +
    '</ul></div>' +
    '</nav>' + foot + '</aside>' +
    '<div class="shell-scrim" data-nav-close hidden></div>';

  var primary = document.body.getAttribute('data-primary-cta') || 'partner';
  // Signed-in members already have an account: their sticky CTA falls back to the partner path.
  if (member && primary === 'create-account') primary = 'partner';
  var interest = document.body.getAttribute('data-interest') || '';
  var ctaLabel = (primary === 'partner' && document.body.getAttribute('data-primary-cta') !== 'partner') ? 'Become a partner' : document.body.getAttribute('data-primary-label') || (primary === 'create-account' ? 'Create account' : 'Become a partner');
  var topCta = primary === 'none' ? '' :
    '<a class="btn btn--primary btn--sm shell-top__cta" data-cta="' + primary + '"' + (interest ? ' data-interest="' + interest + '"' : '') + ' href="' + (primary === 'create-account' ? R.createAccount : R.partner) + '">' + ctaLabel + '</a>';

  var top =
    '<header class="shell-top">' +
    '<button class="icon-btn nav-toggle" type="button" aria-label="Open menu" aria-controls="shell-side" aria-expanded="false" data-nav-open>' + icon('menu') + '</button>' +
    '<a class="brand brand--top" href="' + R.home + '" aria-label="CardsIQ home"><img src="assets/img/brand/cardsiq-lockup.png" alt="CardsIQ" width="112" height="37"></a>' +
    '<form class="search" role="search" onsubmit="return false"><label class="sr-only" for="ciq-search">Search CardsIQ</label>' + icon('search') +
    '<input id="ciq-search" type="search" placeholder="Search cards, certs, breaks" autocomplete="off"></form>' +
    '<div class="shell-top__right">' + (member ? '' : '<a class="top-signin" href="' + R.signIn + '" data-cta="sign-in">Sign in</a>') + topCta + '</div>' +
    '</header>';

  document.write('<a class="skip-link" href="#main">Skip to content</a>' + side + top);
})();
