/* CardsIQ demo v2 — application shell.
 * Loaded synchronously as the first element in <body> so the sidebar and top bar
 * render before page content (no layout flash). Page content lives in <main id="main">.
 *
 * The shell mirrors the live CardsIQ app shell (icon tiles, gradient active pill,
 * "Search a cert or SKU", account pill) with the logged-out sales navigation.
 * Visitor shell (default): Sign in / Create account. Member preview: ?auth=member.
 */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  // Central route config — the only place to wire production URLs.
  // Served with `npx serve`, these files answer at /how-it-works, /instant-buybacks, …
  var CIQ = (window.CIQ = window.CIQ || {});
  CIQ.routes = CIQ.routes || {
    home: 'index.html',
    platform: 'how-it-works.html',
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
    // Live app nav icons
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    cubes: '<path d="m12 3.5 3.8 2.2v4.3L12 12.2 8.2 10V5.7L12 3.5Z"/><path d="M8.2 12.6 12 14.8v4.4l-3.8 2.2-3.8-2.2v-4.4l3.8-2.2Z"/><path d="m15.8 12.6 3.8 2.2v4.4l-3.8 2.2-3.8-2.2v-4.4l3.8-2.2Z"/>',
    archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1.2"/><path d="M5 9v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 12.5h4"/>',
    book: '<path d="M12 6.5c-1.8-1.3-4.5-2-8-2v13c3.5 0 6.2.7 8 2 1.8-1.3 4.5-2 8-2v-13c-3.5 0-6.2.7-8 2Z"/><path d="M12 6.5v13"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48M7.76 16.24a6 6 0 0 1 0-8.48M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>',
    playc: '<circle cx="12" cy="12" r="8.5"/><path d="M10.2 8.6v6.8l5.4-3.4-5.4-3.4Z"/>',
    dollar: '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.4c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.6.8-2.6 1.9 0 2.7 5.4 1.3 5.4 4 0 1.1-1.2 1.9-2.8 1.9-1.2 0-2.3-.5-2.8-1.4M12 6.6v1.5M12 15.9v1.5"/>',
    barcode: '<path d="M4 7V5h2.5M17.5 5H20v2M20 17v2h-2.5M6.5 19H4v-2M8 8.5v7M10.5 8.5v7M13 8.5v7M16 8.5v7"/>',
    cart: '<path d="M3.5 4.5h2l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8l1.4-6.7H6.4"/><circle cx="9.5" cy="19" r="1.2"/><circle cx="16.5" cy="19" r="1.2"/>',
    bank: '<path d="M3.5 9 12 4.5 20.5 9M5 9.5v8M9.7 9.5v8M14.3 9.5v8M19 9.5v8M3.5 19.5h17"/>',
    building: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 7.5h1.5M13.5 7.5H15M9 11h1.5M13.5 11H15M9 14.5h1.5M13.5 14.5H15M10.5 20.5v-3h3v3"/>',
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
    // Record / lifecycle icons
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><rect x="8.5" y="7.5" width="7" height="9" rx="1"/>',
    value: '<path d="M4 20h16M7 16v-3M11 16V9M15 16v-5M19 16V6"/>',
    product: '<path d="m20.5 8-8.5-4.5L3.5 8v8l8.5 4.5 8.5-4.5V8Z"/><path d="m3.5 8 8.5 4.5L20.5 8M12 12.5v8"/>',
    buyer: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    offer: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.4c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2 0 2.9 5.8 1.4 5.8 4.2 0 1.2-1.3 2-3 2-1.3 0-2.5-.6-3-1.6M12 6.2v1.6M12 16.3v1.5"/>',
    verify: '<path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6l7-2.5Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    settle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.8-5"/>',
    history: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/><path d="M12 8v4.2l3 1.8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkc: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.8-5"/>',
    dcheck: '<path d="m2.5 12.5 4 4L15 8M10.5 15.5l1 1L20 8"/>',
    xc: '<circle cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
    sku: '<path d="M4 9.5V5a1 1 0 0 1 1-1h4.5L20 14.5 14.5 20 4 9.5Z"/><circle cx="8" cy="8" r="1.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bolt: '<path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12l1-7Z"/>',
    cards: '<rect x="3.5" y="6.5" width="11" height="14" rx="1.6"/><path d="M8 3.5h10.9a1.6 1.6 0 0 1 1.6 1.6V17"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M15.5 5.5a3.2 3.2 0 0 1 0 6.2M17.5 14.4a5.5 5.5 0 0 1 3 5.1"/>',
    store: '<path d="M4 9.5 5.5 4.5h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5v8h13v-8"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>',
    columns: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15M14.5 4.5v15"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    sort: '<path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4 17-6.5Z"/>',
    camera: '<rect x="3.5" y="6.5" width="12" height="11" rx="2"/><path d="m15.5 10.5 5-3v9l-5-3"/>',
    database: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    rule: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    pin: '<path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    printer: '<path d="M7 8.5V3.5h10v5"/><rect x="3.5" y="8.5" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>',
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15"/>',
    gift: '<rect x="4" y="8.5" width="16" height="4" rx="1"/><path d="M5.5 12.5v7h13v-7M12 8.5v11M12 8.5S10.8 4.5 8.6 4.5a2 2 0 0 0 0 4H12Zm0 0s1.2-4 3.4-4a2 2 0 0 1 0 4H12Z"/>',
    share: '<circle cx="6" cy="12" r="2.2"/><circle cx="17.5" cy="6" r="2.2"/><circle cx="17.5" cy="18" r="2.2"/><path d="m8 11 7.6-4M8 13l7.6 4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    shield: '<path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6l7-2.5Z"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    chart: '<path d="M4 19.5h16M6.5 16l4-5 3 3 5-6.5"/>',
    layers: '<path d="m12 3.5 8.5 4.5L12 12.5 3.5 8 12 3.5Z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
    boxplus: '<path d="m20.5 8-8.5-4.5L3.5 8v8l8.5 4.5"/><path d="m3.5 8 8.5 4.5L20.5 8M12 12.5v8M18 14.5v6M15 17.5h6"/>',
    box: '<path d="m20.5 8-8.5-4.5L3.5 8v8l8.5 4.5 8.5-4.5V8Z"/><path d="m3.5 8 8.5 4.5L20.5 8M12 12.5v8"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 0 1-13.2 4.9M4.5 12a7.5 7.5 0 0 1 13.2-4.9"/><path d="M19.5 4.5V9H15M4.5 19.5V15H9"/>',
    kebab: '<circle cx="12" cy="5.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="18.5" r="1.2"/>',
    truck: '<path d="M3.5 6.5h10v9h-10zM13.5 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    pausec: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
    external: '<path d="M8 16 16 8M9.5 8H16v6.5"/>',
    trendup: '<path d="m4 16.5 5-5 3.5 3.5 7.5-7.5M14.5 7.5H20V13"/>',
    trenddown: '<path d="m4 7.5 5 5 3.5-3.5 7.5 7.5M14.5 16.5H20V11"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.5 3.5 5.3 3.5 8.5s-1.2 6-3.5 8.5c-2.3-2.5-3.5-5.3-3.5-8.5s1.2-6 3.5-8.5Z"/>',
    scanbar: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8.5 8.5v7M11 8.5v7M13.5 8.5v7M15.5 8.5v7"/>',
    file: '<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5Z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4"/>',
    edit: '<path d="M4.5 19.5h4l10-10-4-4-10 10v4ZM13 7.5l4 4"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.75v.01"/>',
    inbox: '<path d="M3.5 13.5 6 5.5h12l2.5 8v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-5Z"/><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5"/>',
    receipt: '<path d="M6 3.5h12v17l-2.5-1.5-2 1.5-1.5-1.5-1.5 1.5-2-1.5L6 20.5v-17Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    percent: '<path d="M18 6 6 18"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>',
    shieldc: '<path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6l7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
    tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3-8.7 8.7-8.3-8.3Z"/><circle cx="8" cy="8" r="1.4"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (I[name] || '') + '</svg>';
  }
  CIQ.icon = icon;

  function navItem(key, href, label, ico, badge) {
    var current = key === page;
    var tile = badge ? '<span class="nav-tile"><span class="mono-badge" aria-hidden="true">' + badge + '</span></span>' : '<span class="nav-tile">' + icon(ico) + '</span>';
    return '<li><a class="nav-link' + (current ? ' is-current' : '') + '" href="' + href + '"' + (current ? ' aria-current="page"' : '') + '>' + tile + '<span>' + label + '</span></a></li>';
  }

  var primaryAttr = document.body.getAttribute('data-primary-cta');
  var foot = member
    ? '<div class="side-foot side-foot--member">' +
      '<button class="icon-btn" type="button" aria-label="Notifications, 4 unread">' + icon('bell') + '<span class="badge">4</span></button>' +
      '<span class="balance">' + icon('wallet') + '$250.00</span>' +
      '<a class="logout" href="index.html">' + icon('logout') + 'Logout</a></div>'
    : '<div class="side-foot">' +
      // The sidebar sign-up is the gradient primary only where sign-up is the page's primary action;
      // elsewhere it stays secondary so a single gradient primary leads each view.
      '<a class="btn ' + (primaryAttr === 'create-account' ? 'btn--primary' : 'btn--secondary') + ' btn--sm btn--block" data-cta="create-account" href="' + R.createAccount + '">Create account</a>' +
      '<p class="side-foot__alt">Have an account? <a href="' + R.signIn + '" data-cta="sign-in">Sign in</a></p></div>';

  var side =
    '<aside class="shell-side" id="shell-side" aria-label="CardsIQ navigation">' +
    '<div class="side-head"><a class="brand" href="' + R.home + '" aria-label="CardsIQ home"><img src="assets/img/brand/cardsiq-lockup.png" alt="CardsIQ" width="140" height="46"></a>' +
    '<button class="icon-btn side-close" type="button" aria-label="Close menu" data-nav-close>' + icon('close') + '</button></div>' +
    '<nav class="side-nav">' +
    '<ul class="nav-root">' + navItem('platform', R.platform, 'How it works', 'grid') + '</ul>' +
    '<div class="nav-group"><p class="nav-label">Products</p><ul>' +
    navItem('buybacks', R.buybacks, 'Instant Buybacks', 'dollar') +
    navItem('inventory', R.inventory, 'Inventory Management', 'cubes') +
    navItem('streamiq', R.streamiq, 'StreamIQ', 'radio') +
    '</ul></div>' +
    '<div class="nav-group"><p class="nav-label">Company</p><ul>' +
    navItem('about', R.about, 'About', 'about') +
    navItem('partner', R.partner, 'Become a partner', 'building') +
    '</ul></div>' +
    '<div class="nav-group"><p class="nav-label">Licensed Repacks</p><ul>' +
    navItem('_hg', R.repackHG, 'HG Breaks', '', 'HG') +
    navItem('_rr', R.repackRR, 'Rogue Rips', '', 'RR') +
    '</ul></div>' +
    '</nav>' + foot + '</aside>' +
    '<div class="shell-scrim" data-nav-close hidden></div>';

  var primary = primaryAttr || 'partner';
  // Signed-in members already have an account: their sticky CTA falls back to the partner path.
  if (member && primary === 'create-account') primary = 'partner';
  var interest = document.body.getAttribute('data-interest') || '';
  var ctaLabel = (primary === 'partner' && primaryAttr !== 'partner') ? 'Become a partner' : document.body.getAttribute('data-primary-label') || (primary === 'create-account' ? 'Create account' : 'Become a partner');
  var topCta = primary === 'none' ? '' :
    '<a class="btn btn--primary btn--sm shell-top__cta" data-cta="' + primary + '"' + (interest ? ' data-interest="' + interest + '"' : '') + ' href="' + (primary === 'create-account' ? R.createAccount : R.partner) + '">' + ctaLabel + '</a>';

  var top =
    '<header class="shell-top">' +
    '<button class="icon-btn nav-toggle" type="button" aria-label="Open menu" aria-controls="shell-side" aria-expanded="false" data-nav-open>' + icon('menu') + '</button>' +
    '<a class="brand brand--top" href="' + R.home + '" aria-label="CardsIQ home"><img src="assets/img/brand/cardsiq-lockup.png" alt="CardsIQ" width="112" height="37"></a>' +
    '<form class="search" role="search" onsubmit="return false"><label class="sr-only" for="ciq-search">Search CardsIQ</label>' + icon('search') +
    '<input id="ciq-search" type="search" placeholder="Search a cert or SKU" autocomplete="off"></form>' +
    '<div class="shell-top__right">' + (member ? '<span class="top-signin">Member preview ' + icon('down') + '</span>' : '<a class="top-signin" href="' + R.signIn + '" data-cta="sign-in">Sign in</a>') + topCta + '</div>' +
    '</header>';

  document.write('<a class="skip-link" href="#main">Skip to content</a>' + side + top);
})();
