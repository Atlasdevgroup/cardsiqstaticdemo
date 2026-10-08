/* StreamIQ page.
 * Hero: TIME ELAPSED ticks while the stage is on screen (Pause clock control, WCAG 2.2.2). The current hit
 *       lands once (Card hit → Offer Sent), then holds. Markup ships in the held end state, so no-JS and
 *       reduced motion show 01:41:15 and Offer Sent. The hit opens its Card Info drawer.
 * Rail: the Break 04 record plays once through ciq.js (Pause / Replay via .seq-ctl). This file moves the
 *       show clock and the active phase with each step, and "Watch a break run" replays it from 08:31:02.
 * Team board (v2.1): the on-stream NFL TEAM BOARD graphic and the CardsIQ Break #5 board play the last
 *       spots selling together (#board-sync, 17 steps). Each step re-derives the whole state from the step
 *       index, so Replay, Pause and reduced motion all land on the canonical 29/33 · 27 verified, CAR on sale.
 *       The markup ships in that end state.
 * Drawers (CIQ.drawer): 'routing' (Break Card Routing modal, 181234), 'card' (Card Info), 'seller' (181544).
 * Listeners attach at the top level: page scripts run before ciq.js boots and renders the first step.
 */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = CIQ.reducedMotion ? CIQ.reducedMotion() : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ------------------------------------------------ drawers: every open starts at its header, keyboard-scrollable
   * CIQ.drawer resets scrollTop while its host is still display:none after the previous close, so Chrome restores
   * the old offset when the host is shown again (shared-file request: reset in ciq.js open() right after
   * host.hidden = false). 'ciq:drawer' fires once the host is visible, so the reset sticks here. Focus then moves to
   * the scrolling area, so PageDown / arrows / Space scroll the drawer straight away (Back fires no event). */
  document.addEventListener('ciq:drawer', function (e) {
    // Back restores the previous drawer's place (ciq.js); only fresh opens start at the header.
    if (!e.detail || !e.detail.open || e.detail.back) return;
    var s = document.querySelector('.lv-drawer__scroll');
    if (!s) return;
    s.scrollTop = 0;
    s.tabIndex = -1;
    s.focus({ preventScroll: true });
  });

  /* ------------------------------------------------ hero: ticking stream clock + the hit landing */
  var stage = document.querySelector('.sq-stage');
  var elapsed = stage && stage.querySelector('[data-elapsed]');
  var hit = stage && stage.querySelector('.sq-hit');
  var ctl = stage && stage.querySelector('[data-clock-ctl]');
  if (stage && elapsed && hit && !reduced) {
    // Stream opened 7:00:00 PM; the Nabers hit is 08:41:14 PM on the Break 04 record → elapsed 01:41:14.
    var HIT = 1 * 3600 + 41 * 60 + 14;
    var t = HIT - 2, timer = null, inView = !hasIO, paused = false;
    var fmt = function (s) { return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); };
    var render = function () {
      elapsed.textContent = fmt(t);
      var state = t > HIT ? 'offer' : t === HIT ? 'hit' : 'pre';
      if (hit.getAttribute('data-state') !== state) hit.setAttribute('data-state', state);
    };
    var tick = function () { t += 1; render(); };
    var run = function () {
      clearInterval(timer); timer = null;
      if (inView && !paused && !document.hidden) timer = setInterval(tick, 1000);
    };
    var label = ctl && ctl.querySelector('.seq-ctl__label');
    var ico = ctl && ctl.querySelector('.seq-ctl__ico');
    var showCtl = function () {
      if (!ctl) return;
      if (label) label.textContent = paused ? 'Play clock' : 'Pause clock';
      if (ico && CIQ.icon) ico.innerHTML = CIQ.icon(paused ? 'play' : 'pause');
      ctl.setAttribute('aria-pressed', String(paused));
    };

    render();
    if (ctl) {
      ctl.hidden = false;
      showCtl();
      ctl.addEventListener('click', function () {
        paused = !paused;
        if (paused && t <= HIT) { t = HIT + 1; render(); } // pausing never strands the hit half-landed
        showCtl(); run();
      });
    }
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        run();
      }, { threshold: 0.25 }).observe(stage);
    } else { run(); }
    document.addEventListener('visibilitychange', run);
  }

  /* ------------------------------------------------ event rail: show clock + phase follow the playhead */
  var evs = document.getElementById('rail-events');
  var rail = document.querySelector('.sq-rail');
  if (evs && rail) {
    var now = rail.querySelector('[data-rail-now]');
    evs.addEventListener('ciq:step', function (e) {
      var i = e.detail.index;
      if (i < 0) {
        if (now) now.textContent = '08:31:00 PM';
        rail.removeAttribute('data-phase');
        return;
      }
      var step = e.detail.step;
      var time = step.querySelector('time');
      if (now && time) now.textContent = time.textContent + ' PM';
      rail.setAttribute('data-phase', step.getAttribute('data-phase'));
    });

    // "Watch a break run" replays the record from the first event once the rail is reached.
    var replay = function () {
      if (reduced || !evs._seq) return;
      var btn = document.querySelector('[data-seq-control="#rail-events"]');
      var state = btn && btn.getAttribute('data-state');
      if (btn && state === 'done') { btn.click(); return; }            // Replay → playing from the start
      if (btn && state === 'paused') btn.click();                       // Play, then rewind below
      evs._seq.restart();
    };
    Array.prototype.forEach.call(document.querySelectorAll('a[href="#break-run"]'), function (a) {
      a.addEventListener('click', function () { setTimeout(replay, 500); });
    });
  }

  /* ================================================ Break data (BUILD-BRIEF-V21 §3.1–3.3) */
  /* gen:data */
  // Generated by the StreamIQ board generator from BUILD-BRIEF-V21 §3.1–3.3. One row per spot:
  // [abbr, team, cross-league line, Break 04 buyer, Break 05 buyer]; buyer = "handle V|A" (Verified / Assigned), "" = open.
  var SPOTS = [["ari","Arizona Cardinals","Phoenix Suns, Arizona Diamondbacks","rookieridge V","ripking V"],["atl","Atlanta Falcons","Atlanta Hawks, Atlanta Braves","slabhaus V","slabhaus A"],["bal","Baltimore Ravens","Sacramento Kings, Baltimore Orioles","chromechaser V","vaultcollects V"],["buf","Buffalo Bills","Toronto Raptors, Toronto Blue Jays","buffalocards V","buffalocards V"],["car","Carolina Panthers","Charlotte Hornets","packwarrior A",""],["chi","Chicago Bears","Chicago Bulls, Chicago Cubs","slabcity V","slabcity V"],["cin","Cincinnati Bengals","Cincinnati Reds","northstarcards V","northstarcards V"],["cle","Cleveland Browns","Cleveland Cavaliers, Cleveland Guardians","waxroom V","waxroom V"],["dal","Dallas Cowboys","Dallas Mavericks, Texas Rangers","waxroom V","chromechaser V"],["den","Denver Broncos","Denver Nuggets, Colorado Rockies","endzonepulls A","endzonepulls V"],["det","Detroit Lions","Detroit Pistons, Detroit Tigers","chromechaser V","rookieridge V"],["gb","Green Bay Packers","Milwaukee Bucks, Milwaukee Brewers","sundaysingles V","sundaysingles V"],["hou","Houston Texans","Houston Rockets, Houston Astros","redzonerips V","redzonerips V"],["ind","Indianapolis Colts","Indiana Pacers","sundaysingles V","sundaysingles V"],["jax","Jacksonville Jaguars","","pylonpulls A",""],["kc","Kansas City Chiefs","Kansas City Royals","ripking V","ripking V"],["lv","Las Vegas Raiders","","blitzboxbreaks V","blitzboxbreaks V"],["lac","Los Angeles Chargers","Los Angeles Clippers, Los Angeles Dodgers","endzonepulls A","endzonepulls V"],["lar","Los Angeles Rams","Los Angeles Lakers, Los Angeles Angels","rookieridge V","rookieridge V"],["mia","Miami Dolphins","Miami Heat, Miami Marlins","pylonpulls A",""],["min","Minnesota Vikings","Minnesota Timberwolves, Minnesota Twins","northwoodscards V","northwoodscards V"],["ne","New England Patriots","Boston Celtics, Boston Red Sox","hobbyhouse V","hobbyhouse V"],["no","New Orleans Saints","New Orleans Pelicans","redzonerips V","redzonerips V"],["nyg","New York Giants","New York Knicks, New York Yankees","nycards V","nycards V"],["nyj","New York Jets","Brooklyn Nets, New York Mets","huddlehouse V","hobbyhouse V"],["phi","Philadelphia Eagles","Philadelphia 76ers, Philadelphia Phillies","vaultcollects V","vaultcollects V"],["pit","Pittsburgh Steelers","San Antonio Spurs, Pittsburgh Pirates","goalpostcards V","casehits V"],["sf","San Francisco 49ers","Golden State Warriors, San Francisco Giants","collector92 V","collector92 V"],["sea","Seattle Seahawks","Portland Trail Blazers, Seattle Mariners","slabcity V","slabcity V"],["tb","Tampa Bay Buccaneers","Orlando Magic, Tampa Bay Rays","packwarrior A","packwarrior A"],["ten","Tennessee Titans","Memphis Grizzlies, St. Louis Cardinals","huddlehouse V",""],["was","Washington Commanders","Washington Wizards, Washington Nationals","casehits V","casehits V"],["misc","Misc","","hobbyhaven V","chromechaser V"]];
  var LOGOS = ["ari","atl","bal","buf","car","chi","cin","cle","dal","den","det","gb","hou","ind","jax","kc","lv","lac","lar","mia","min","ne","no","nyj","phi","pit","sf","sea","tb","ten","was"];
  /* /gen:data */

  var SP = {}, ORDER = [];
  SPOTS.forEach(function (r, i) {
    ORDER.push(r[0]);
    SP[r[0]] = { abbr: r[0], name: r[1], cross: r[2], spot: i + 1, b4: buyer(r[3]), b5: buyer(r[4]) };
  });
  function buyer(s) { if (!s) return null; var p = s.split(' '); return { h: p[0], ok: p[1] === 'V' }; }
  function nick(a) { return a === 'misc' ? 'Misc' : SP[a].name.split(' ').pop(); }

  // Break 04 · Football Premium 02 · 10 cards, all hit and routed. tier: c = Ceiling, f = Floor. st: done = Completed,
  // sent = Offer Sent, ne = not eligible. ph = text-free placeholder for cards without a photo (no cert shown).
  var CARDS = {
    nabers: { t: '2024 Panini Prizm Malik Nabers Gold /10', g: 'PSA 10.0', team: 'Giants', tc: 'lv-team--giants', tier: 'c', ref: 1420, cost: 1260, spot: 'nyg', offer: 1278, st: 'done', hit: '8:41:14 PM', ph: 'sq-gold' },
    brady: { t: '2000 Bowman Tom Brady #236', g: 'PSA 8.0', cert: '82389068', team: 'Patriots', tc: 'lv-team--patriots', tier: 'c', alt: 1195, cl: 1165, ref: 1180, cost: 1040, spot: 'ne', offer: 1062, st: 'sent', hit: '8:44:52 PM', img: 'brady-2000-bowman-psa8.webp', iw: 900, ih: 1495 },
    burrow: { t: '2023 Donruss Optic Joe Burrow Downtown! #D4', g: 'PSA 9.0', cert: '103207853', team: 'Bengals', tc: 'lv-team--bengals', tier: 'c', alt: 1040, cl: 1020, ref: 1030, cost: 540, ls: [1065, 995], spot: 'cin', offer: 927, st: 'done', hit: '8:52:03 PM', img: 'burrow-2023-optic-downtown-psa9.webp', iw: 380, ih: 638 },
    chase: { t: '2021 Donruss Optic Ja’Marr Chase Rated Rookie', g: 'PSA 10.0', team: 'Bengals', tc: 'lv-team--bengals', tier: 'f', ref: 380, cost: 330, spot: 'cin', offer: 342, st: 'sent', hit: '8:53:40 PM', ph: 'sq-ph--holo' },
    williams: { t: '2024 Panini Prizm Caleb Williams Silver', g: 'PSA 10.0', team: 'Bears', tc: 'lv-team--bears', tier: 'f', ref: 310, cost: 290, spot: 'chi', offer: 279, st: 'done', hit: '8:47:30 PM', ph: 'sq-ph--silver' },
    daniels: { t: '2024 Donruss Optic Jayden Daniels Rated Rookie', g: 'PSA 10.0', team: 'Commanders', tc: 'lv-team--commanders', tier: 'f', ref: 285, cost: 270, spot: 'was', offer: 256.5, st: 'sent', hit: '8:49:05 PM', ph: 'sq-ph--holo' },
    stroud: { t: '2023 Panini Prizm C.J. Stroud Silver Prizm Rookie', g: 'PSA 10.0', team: 'Texans', tc: 'sq-tc--texans', tier: 'f', ref: 240, cost: 300, spot: 'hou', st: 'ne', hit: '8:36:10 PM', ph: 'sq-ph--silver' },
    bijan: { t: '2023 Donruss Optic Bijan Robinson Rated Rookie', g: 'PSA 10.0', team: 'Falcons', tc: 'sq-tc--falcons', tier: 'f', ref: 215, cost: 280, spot: 'atl', st: 'ne', hit: '8:45:37 PM', ph: 'sq-ph--holo' },
    wilson: { t: '2022 Panini Prizm Garrett Wilson Silver Prizm Rookie', g: 'PSA 10.0', team: 'Jets', tc: 'sq-tc--jets', tier: 'f', ref: 195, cost: 265, spot: 'nyj', st: 'ne', hit: '8:38:22 PM', ph: 'sq-ph--silver' },
    bowers: { t: '2024 Donruss Optic Brock Bowers Rated Rookie', g: 'PSA 10.0', team: 'Raiders', tc: 'sq-tc--raiders', tier: 'f', ref: 175, cost: 245, spot: 'lv', st: 'ne', hit: '8:50:18 PM', ph: 'sq-ph--holo' }
  };
  var HIT_ORDER = ['stroud', 'wilson', 'nabers', 'brady', 'bijan', 'williams', 'daniels', 'bowers', 'burrow', 'chase'];
  var CARDS_AT = {}; // spot → card ids routed there in Break 04
  HIT_ORDER.forEach(function (id) { (CARDS_AT[CARDS[id].spot] = CARDS_AT[CARDS[id].spot] || []).push(id); });
  var TIER = { c: '<span class="lv-tier lv-tier--ceiling"><b>Ceiling</b> $1,000.00–$1,500.00</span>', f: '<span class="lv-tier lv-tier--floor"><b>Floor</b> $150.00–$400.00</span>' };

  /* ------------------------------------------------ markup helpers */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function plusSec(time) { // "8:44:52 PM" → "8:44:53 PM": offers go out the second after the hit, as on the canonical record
    var m = /^(\d+):(\d+):(\d+) (AM|PM)$/.exec(time);
    var s = +m[3] + 1, mi = +m[2], h = +m[1];
    if (s > 59) { s = 0; mi += 1; }
    return h + ':' + pad(mi) + ':' + pad(s) + ' ' + m[4];
  }
  function mark(a, cls) {
    var src = CIQ.teamLogo && CIQ.teamLogo(a);
    return src ? '<img class="' + cls + '" src="' + src + '" alt="" width="160" height="160">'
      : '<span class="' + cls + ' ' + cls + '--txt" aria-hidden="true">' + (a === 'misc' ? 'MISC' : a.toUpperCase()) + '</span>';
  }
  var TC = { nyg: 'lv-team--giants', cin: 'lv-team--bengals', kc: 'lv-team--chiefs', ne: 'lv-team--patriots', den: 'lv-team--broncos', chi: 'lv-team--bears', was: 'lv-team--commanders', misc: 'lv-team--misc', min: 'lv-team--wolves', hou: 'sq-tc--texans', atl: 'sq-tc--falcons', nyj: 'sq-tc--jets', lv: 'sq-tc--raiders' };
  function teamChip(a) { return '<span class="lv-pill lv-pill--team ' + (TC[a] || '') + '" data-team="' + a + '">' + esc(nick(a)) + '</span>'; }
  function thumb(c, cls) {
    return c.img ? '<img class="' + cls + '" src="assets/img/slabs/' + c.img + '" alt="" width="' + c.iw + '" height="' + c.ih + '">'
      : '<span class="' + cls + ' ' + c.ph + '" aria-hidden="true"></span>';
  }
  function chips(c) {
    return '<span class="lv-pill lv-pill--grade">' + c.g + '</span>' + (c.cert ? '<span class="lv-pill lv-pill--cert">Cert #' + c.cert + '</span>' : '') +
      '<span class="lv-pill lv-pill--team ' + c.tc + '">' + c.team + '</span>';
  }
  function offerStatus(c) {
    if (c.st === 'done') return '<span class="lv-status lv-status--ok lv-status--sm"><span data-ico="dcheck"></span>Completed</span>';
    if (c.st === 'sent') return '<span class="lv-status lv-status--sent lv-status--sm"><span data-ico="send"></span>Offer Sent</span>';
    return '<span class="lv-status lv-status--muted lv-status--sm sq-st--ne"><span data-ico="xc"></span>Not eligible</span>';
  }
  function verifiedPill(ok) {
    return ok ? '<span class="lv-status lv-status--ok lv-status--sm">Verified</span>' : '<span class="lv-status lv-status--sm sq-st--assigned">Assigned</span>';
  }
  function handleBtn(h, brk) {
    return '<button type="button" class="lv-handle" data-drawer="seller" data-drawer-id="' + h + '" data-break="' + brk + '" aria-haspopup="dialog">' + h + '<span class="sr-only">: open seller record</span></button>';
  }
  function sec(ico, tone, title, tag, desc, act) {
    return '<div class="lv-dsec__head"><span class="lv-dsec__ico' + (tone ? ' lv-dsec__ico--' + tone : '') + '"><span data-ico="' + ico + '"></span></span>' +
      '<h3 class="lv-dsec__title">' + title + (tag ? ' <span class="lv-tag">' + tag + '</span>' : '') + '</h3>' +
      (desc ? '<p class="lv-dsec__desc">' + desc + '</p>' : '') + (act ? '<span class="lv-dsec__act">' + act + '</span>' : '') + '</div>';
  }
  function hist(items) {
    return '<ol class="lv-hist">' + items.map(function (it) {
      return '<li' + (it[3] ? ' class="is-' + it[3] + '"' : '') + '><span class="lv-hist__node"><span data-ico="' + (it[3] === 'pending' ? 'clock' : it[3] === 'current' ? 'bolt' : 'check') + '"></span></span>' +
        '<p class="lv-hist__ev">' + it[0] + (it[1] ? ' <small>' + it[1] + '</small>' : '') + '</p><span class="lv-hist__t">' + (it[2] || '') + '</span></li>';
    }).join('') + '</ol>';
  }
  function tile(k, v, cls, vcls) { return '<div class="lv-tile' + (cls ? ' ' + cls : '') + '"><p class="lv-tile__k">' + k + '</p><p class="lv-tile__v' + (vcls ? ' ' + vcls : '') + '">' + v + '</p></div>'; }

  /* ------------------------------------------------ Break Card Routing modal (181234), Break 04 */
  var routingTab = 1; // the live modal opens on Team Board; "See all 10 hits" opens on Card Hits
  function routingRow(a) {
    var s = SP[a], b = s.b4, n = (CARDS_AT[a] || []).length;
    return '<li class="sq-rt__row" data-drawer-row><span class="sq-rt__team">' + mark(a, 'sq-rt__logo') + '<span><b class="sq-rt__name">' + esc(s.name) + '</b>' +
      '<span class="sq-rt__spot">Spot ' + s.spot + (n ? ' · ' + n + (n > 1 ? ' cards' : ' card') : '') + '</span>' + (s.cross ? '<span class="sq-xl">+ ' + esc(s.cross) + '</span>' : '') + '</span></span>' +
      '<span class="sq-rt__buyer">' + handleBtn(b.h, '04') + '</span><span class="sq-rt__st">' + verifiedPill(b.ok) + '</span></li>';
  }
  function hitRow(id) {
    var c = CARDS[id], s = SP[c.spot];
    return '<li class="sq-rt__row sq-rt__row--hit" data-drawer-row>' + thumb(c, 'lv-thumb sq-rt__thumb') +
      '<span class="sq-rt__card"><button type="button" class="lv-rowbtn sq-rowbtn" data-drawer="card" data-drawer-id="' + id + '" aria-haspopup="dialog"><span class="lv-name">' + esc(c.t) + '</span></button><span class="lv-chips">' + chips(c) + '</span></span>' +
      '<span class="sq-rt__to"><span class="sq-rt__arrow" aria-hidden="true">→</span><span>Spot ' + s.spot + ' · ' + esc(nick(c.spot)) + '<small>' + c.hit + '</small></span></span>' +
      '<span class="sq-rt__buyer">' + handleBtn(s.b4.h, '04') + '</span><span class="sq-rt__st">' + offerStatus(c) + '</span></li>';
  }
  CIQ.drawer && CIQ.drawer.register('routing', function (id, trigger) {
    // A fresh open starts on its trigger's tab; Back (drawer already open) keeps the tab the visitor picked.
    if (!CIQ.drawer.isOpen()) routingTab = (trigger && trigger.getAttribute('data-routing-tab') === 'hits') ? 0 : 1;
    var el = document.createElement('div');
    el.className = 'sq-rt';
    el.innerHTML =
      '<div class="lv-dhead sq-rt__head">' +
        '<div class="lv-dhead__eyebrow"><span class="sq-rt__k">Break card routing</span><span class="lv-status lv-status--live lv-status--caps lv-status--sm">Live</span></div>' +
        '<h2 class="lv-dhead__title" data-drawer-title>Break 04</h2>' +
        '<div class="lv-chips"><span class="sq-chip">2026 NFL MIXER</span><span class="sq-chip sq-chip--plain">Football Premium 02</span></div>' +
        '<div class="lv-chips"><span class="sq-chip sq-chip--blue">10 hits</span><span class="sq-chip sq-chip--green">10 routed</span></div>' +
      '</div>' +
      '<div class="lv-dbody sq-rt__body">' +
        '<div class="lv-tiles sq-rt__tiles">' + tile('Hits', '10') + tile('Routed', '10') + tile('Cross-league', '0') + tile('Total cards', '10') + '</div>' +
        '<div class="sq-rt__tabs" role="tablist" aria-label="Break 04 routing view">' +
          '<button type="button" class="sq-rt__tab" role="tab" id="sq-rt-tab-hits" aria-controls="sq-rt-hits">Card Hits (10)</button>' +
          '<button type="button" class="sq-rt__tab" role="tab" id="sq-rt-tab-board" aria-controls="sq-rt-board">Team Board (33)</button>' +
        '</div>' +
        '<div class="sq-rt__panel" role="tabpanel" id="sq-rt-hits" aria-labelledby="sq-rt-tab-hits" tabindex="0"><ul class="sq-rt__hits">' + HIT_ORDER.map(hitRow).join('') + '</ul></div>' +
        '<div class="sq-rt__panel" role="tabpanel" id="sq-rt-board" aria-labelledby="sq-rt-tab-board" tabindex="0"><div class="sq-rt__cols">' +
          '<ul>' + ORDER.slice(0, 17).map(routingRow).join('') + '</ul><ul>' + ORDER.slice(17).map(routingRow).join('') + '</ul></div></div>' +
        '<p class="sq-dnote">Select a card or a buyer to open its record. Spot 7 holds 2 cards; every other routed spot holds 1.</p>' +
      '</div>';
    var tabs = [].slice.call(el.querySelectorAll('[role="tab"]'));
    function pick(i, focus) {
      routingTab = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        el.querySelector('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (n !== null) { e.preventDefault(); pick(n, true); }
      });
    });
    pick(routingTab);
    return el;
  });

  /* ------------------------------------------------ Card Info drawer (Break 04 hits) */
  function cardTrail(id, c, s) {
    var to = 'Spot ' + s.spot + ' · ' + esc(nick(c.spot));
    if (id === 'burrow') return hist([
      ['Intake', 'Scanned into Main Vault · cost $540.00', 'Oct 2, 8:42 AM'],
      ['Priced', 'FMV ALT $1,040.00 · CL $1,020.00', '9:14 AM'],
      ['Added to product', 'Football Premium 02', '11:37 AM'],
      ['Break started', 'Break 04 · BRK-1842-04', '8:31 PM'],
      ['Buyer assigned', 'northstarcards · Bengals · Spot 7', '8:32 PM'],
      ['Card hit', 'Routed to ' + to, '8:52:03 PM'],
      ['Offer Sent', '$927.00 = 90.0% × $1,030.00', '8:52:04 PM'],
      ['Offer accepted', 'northstarcards', '8:52:41 PM'],
      ['Verification passed', 'Identity · Card · Account · Duplicate', '8:54:09 PM'],
      ['Completed', 'Acquisition #7C41B2E9 · Destination INVENTORY', '8:54:12 PM']
    ]);
    if (id === 'nabers') return hist([
      ['Break created', 'Break 04 · BRK-1842-04', '8:31:02 PM'],
      ['Buyer assigned', 'nycards · Giants · Spot 24', '8:32:11 PM'],
      ['Product opened', 'Football Premium 02', '8:34:05 PM'],
      ['Card hit', 'Routed to ' + to, '8:41:14 PM'],
      ['Offer Sent', '$1,278.00 = 90.0% × $1,420.00', '8:41:15 PM'],
      ['Offer accepted', 'nycards', '8:43:02 PM'],
      ['Verification passed', 'Identity · Card · Account · Duplicate', '8:44:10 PM'],
      ['Completed', 'Transaction record closed', '8:46:31 PM']
    ]);
    var items = [['Card hit', 'Routed to ' + to + ' · ' + s.b4.h, c.hit]];
    if (c.st === 'ne') {
      items.push(['Not eligible for buyback', 'This product does not offer a buyback on this card', '', 'current']);
      items.push(['Fulfillment', 'Goes to ' + s.b4.h + ' with the break', '', 'pending']);
    } else {
      items.push(['Offer Sent', money(c.offer) + ' = 90.0% × ' + money(c.ref), plusSec(c.hit), c.st === 'sent' ? 'current' : '']);
      var p = c.st === 'sent' ? 'pending' : '';
      items.push(['Offer accepted', '', '', p], ['Verification passed', p ? '' : 'Identity · Card · Account · Duplicate', '', p], ['Completed', '', '', p]);
    }
    return hist(items);
  }
  CIQ.drawer && CIQ.drawer.register('card', function (id) {
    var c = CARDS[id];
    if (!c) return null;
    var s = SP[c.spot], b = s.b4, ok = c.st !== 'ne';
    var media = c.img ? '<img class="lv-dcard__img" src="assets/img/slabs/' + c.img + '" alt="" width="' + c.iw + '" height="' + c.ih + '">'
      : '<span class="lv-dcard__img sq-dph ' + c.ph + '" aria-hidden="true"></span>';
    var values = c.alt
      ? tile('FMV · ALT', money(c.alt), '', 'sq-v--fmv') + tile('FMV · CL', money(c.cl), '', 'sq-v--fmv') + tile('Cost', money(c.cost), '', 'sq-v--cost')
      : tile('Reference price', money(c.ref), '', 'sq-v--fmv') + tile('Cost', money(c.cost), '', 'sq-v--cost');
    var lastSale = c.ls ? '<dl class="lv-dl sq-dl"><div><dt>Last sale</dt><dd><span class="sq-ls"><span class="lv-src lv-src--alt">ALT</span><span class="lv-pill lv-pill--sale">' + money(c.ls[0]) + '</span></span><span class="sq-ls"><span class="lv-src lv-src--cl">CL</span><span class="lv-pill lv-pill--sale">' + money(c.ls[1]) + '</span></span></dd></div>' +
      '<div><dt>Reference price</dt><dd>' + money(c.ref) + '</dd></div></dl>' : (c.alt ? '<dl class="lv-dl sq-dl"><div><dt>Reference price</dt><dd>' + money(c.ref) + '</dd></div></dl>' : '');
    var html =
      '<div class="lv-dhead">' +
        '<div class="lv-dhead__eyebrow">' + offerStatus(c) + '<span class="sq-dmeta">Card hit ' + c.hit + '</span></div>' +
        '<h2 class="lv-dhead__title" data-drawer-title>' + esc(c.t) + '</h2>' +
        '<p class="lv-dhead__sub">Football Premium 02 · Break 04 · BRK-1842-04</p>' +
        '<div class="lv-chips">' + chips(c) + '</div>' +
      '</div><div class="lv-dbody">' +
      '<section class="lv-dsec">' + sec('value', 'green', 'Value', '', c.alt ? 'Fair market value from ALT and Card Ladder, against your cost.' : 'Reference price for this hit, against your cost.') +
        '<div class="lv-dcard">' + media + '<div class="sq-vtiles">' + values + '</div></div>' + lastSale + '</section>' +
      '<section class="lv-dsec">' + sec('layers', '', 'Break', '', '') +
        '<dl class="lv-dl"><div><dt>Product</dt><dd>FOOTBALL PREMIUM 02</dd></div><div><dt>Tier</dt><dd>' + TIER[c.tier] + '</dd></div>' +
        '<div><dt>Card hit</dt><dd>' + c.hit + '</dd></div>' +
        '<div><dt>Routed to</dt><dd>Spot ' + s.spot + ' · ' + esc(s.name) + (s.cross ? '<small class="sq-xl">+ ' + esc(s.cross) + '</small>' : '') + '</dd></div></dl>' +
        (ok ? '<p class="sq-elig is-ok"><span data-ico="checkc"></span>Eligible: PSA · value in $100–$5,000 · buyer verified</p>'
            : '<p class="sq-elig"><span data-ico="xc"></span>Not eligible for buyback in this product</p>') + '</section>' +
      '<section class="lv-dsec">' + sec('buyer', 'teal', 'Buyer', '', 'Whatnot buyer on Spot ' + s.spot + ' in Break 04.') +
        '<div class="sq-buyer">' + handleBtn(b.h, '04') + verifiedPill(b.ok) + '</div></section>' +
      (ok ? '<section class="lv-dsec">' + sec('buyback2', 'violet', 'Buyback', 'Partner Default', 'Instant offer at the seller’s effective rate.') +
        '<div class="lv-tiles">' + tile('Reference price', money(c.ref), '', 'sq-v--fmv') + tile('Buyback %', '90.0%', '', 'sq-v--rate') + tile('Offer', money(c.offer), '', 'sq-v--cost') + '</div>' +
        '<div class="sq-dstatus">' + offerStatus(c) + (c.st === 'done' ? '<span class="lv-link">View Transaction <span data-ico="external"></span></span>' : '<span class="sq-dmeta">Awaiting the buyer’s response</span>') + '</div>' +
        (id === 'burrow' ? '<dl class="lv-dl sq-dl"><div><dt>Acquisition</dt><dd class="lv-dl__mono">#7C41B2E9</dd></div><div><dt>Type</dt><dd>LIVE BREAK</dd></div><div><dt>Destination</dt><dd>INVENTORY</dd></div></dl>' : '') +
        '</section>' : '') +
      '<section class="lv-dsec">' + sec('history', 'amber', 'Activity', '', '') + cardTrail(id, c, s) + '</section>' +
      '</div>';
    return html;
  });

  /* ------------------------------------------------ Seller drawer (181544), keyed by handle */
  function spotsOf(h, k) { return ORDER.filter(function (a) { return SP[a][k] && SP[a][k].h === h; }); }
  CIQ.drawer && CIQ.drawer.register('seller', function (h) {
    var s4 = spotsOf(h, 'b4'), s5 = spotsOf(h, 'b5');
    if (!s4.length && !s5.length) return null;
    // Account-level state (as live 181234 reads it): a verified seller once any of the handle's spots in this show
    // is Verified, whichever break the drawer was opened from. The per-spot pills in "This show" keep each spot's state.
    var ok = s4.some(function (a) { return SP[a].b4.ok; }) || s5.some(function (a) { return SP[a].b5.ok; });
    var teams = [];
    s4.concat(s5).forEach(function (a) { if (teams.indexOf(a) < 0) teams.push(a); });
    function spotLine(a, kk) {
      var n = kk === 'b4' ? (CARDS_AT[a] || []).length : 0;
      return '<li class="sq-show__spot">' + mark(a, 'sq-show__logo') + '<span><b>' + esc(SP[a].name) + '</b><small>Spot ' + SP[a].spot + (n ? ' · ' + n + (n > 1 ? ' cards' : ' card') : '') + '</small></span>' + verifiedPill(SP[a][kk].ok) + '</li>';
    }
    var hits = [];
    s4.forEach(function (a) { (CARDS_AT[a] || []).forEach(function (id) { hits.push(id); }); });
    var show =
      (s4.length ? '<div class="sq-show__brk"><p class="sq-show__k"><span class="sq-brk__n">Break 04</span><span class="sq-mono">BRK-1842-04</span><span class="lv-status lv-status--live lv-status--sm">Live</span></p><ul class="sq-show__list">' + s4.map(function (a) { return spotLine(a, 'b4'); }).join('') + '</ul>' +
        (hits.length ? '<ul class="sq-show__cards">' + hits.map(function (id) {
          var c = CARDS[id];
          return '<li class="sq-show__card" data-drawer-row>' + thumb(c, 'lv-thumb lv-thumb--sm') + '<span class="sq-show__ct"><button type="button" class="lv-rowbtn sq-rowbtn" data-drawer="card" data-drawer-id="' + id + '" aria-haspopup="dialog"><span class="lv-name">' + esc(c.t) + '</span></button>' +
            '<span class="sq-show__cm">' + (c.offer ? '<span class="lv-pill lv-pill--offer">' + money(c.offer) + '</span>' : '') + offerStatus(c) + '</span></span></li>';
        }).join('') + '</ul>' : '') + '</div>' : '') +
      (s5.length ? '<div class="sq-show__brk"><p class="sq-show__k"><span class="sq-brk__n">Break 05</span><span class="sq-mono">BRK-1842-05</span><span class="lv-status lv-status--amber lv-status--sm"><span data-ico="box"></span>Filling</span></p><ul class="sq-show__list">' + s5.map(function (a) { return spotLine(a, 'b5'); }).join('') + '</ul></div>' : '');
    return '<div class="lv-dhead">' +
        '<h2 class="lv-dhead__title" data-drawer-title>' + h + ' <span class="lv-dhead__dot' + (ok ? '' : ' lv-dhead__dot--amber') + '" aria-hidden="true"></span></h2>' +
        '<p class="lv-dhead__sub">Whatnot · ' + (ok ? 'Verified seller' : 'Verification pending') + '</p>' +
        '<p class="lv-dhead__meta">Joined Aug 2026</p>' +
        '<div class="lv-chips">' + teams.map(function (a) { return teamChip(a); }).join('') + '</div>' +
      '</div><div class="lv-dbody">' +
      '<section class="lv-dsec">' + sec('percent', '', 'Seller Pricing', 'Partner Default', 'Compare this seller’s buyback rate with your partner default.', '<span class="lv-btn lv-btn--sm" aria-hidden="true"><span data-ico="edit"></span>Edit</span>') +
        '<div class="lv-tiles">' + tile('Partner default', '90.00%') + tile('Adjustment', '0.00%', 'lv-tile--blue') + tile('Effective', '90.00%', 'sq-tile--hl') + '</div>' +
        '<p class="sq-dsub">Value-Based Buyback Rates</p><p class="sq-ddesc">Partner range, seller override, and effective rate by card value.</p>' +
        '<div class="sq-scrollx"><table class="lv-table sq-rates"><caption class="sr-only">Value-based buyback rates for ' + h + '</caption><thead><tr><th scope="col">Card value</th><th scope="col">Partner</th><th scope="col">Adjustment</th><th scope="col">Effective</th></tr></thead>' +
        '<tbody><tr><td>$100.00–$5,000.00</td><td>90.00%</td><td class="sq-v--blue">0.00%</td><td>90.00%</td></tr></tbody></table></div>' +
        // Phones: the same single rate row as a stacked field list, so EFFECTIVE is never clipped off-screen.
        '<dl class="lv-dl sq-rates-dl"><div><dt>Card value</dt><dd>$100.00–$5,000.00</dd></div><div><dt>Partner</dt><dd>90.00%</dd></div>' +
        '<div><dt>Adjustment</dt><dd class="sq-v--blue">0.00%</dd></div><div><dt>Effective</dt><dd>90.00%</dd></div></dl>' +
        '<p class="lv-dsec__note">Applies to new offers for this user only. Existing offers keep their captured rate.</p></section>' +
      '<section class="lv-dsec">' + sec('shieldc', 'green', 'Fee Responsibility', 'Partner Default', 'Compare the partner default with this seller’s fee setting.') +
        '<div class="lv-tiles">' + tile('Partner default', 'Seller pays') + tile('Seller override', 'Use default') + tile('Effective', 'Seller pays', 'sq-tile--ok') + '</div>' +
        '<div class="lv-seg sq-seg" aria-hidden="true"><span class="is-on">Use Default</span><span>Seller Pays</span><span>Partner Pays</span></div>' +
        '<p class="lv-dsec__note">The platform fee is deducted from the seller payout.</p></section>' +
      '<section class="lv-dsec">' + sec('chart', 'violet', 'Floor Card Pricing', 'Live Value', 'Choose how this seller’s floor cards are valued when a break finishes.') +
        '<div class="lv-tiles sq-tiles2">' + tile('Floor cards', 'Live market value') + tile('Ceiling cards', 'Live market value', 'sq-tile--ok') + '</div></section>' +
      '<section class="lv-dsec">' + sec('clock', 'amber', 'Buyback', '', '') +
        '<div class="lv-tiles sq-tiles1">' + tile('Offer close', 'On fulfillment') + '</div></section>' +
      '<section class="lv-dsec">' + sec('streamiq', 'teal', 'This show', '2026 NFL MIXER', 'Spots and hits for ' + h + ' on STR-1842.') + '<div class="sq-show">' + show + '</div></section>' +
      '</div>';
  });

  /* ================================================ Team board: the last spots selling, on stream and in CardsIQ
   * Per spot: the tile turns gold (on sale) → its operator row fills (handle → Assigned → Verified) → the tile flips
   * to SOLD → Fill progress counts up. The aside mirrors the active spot's operator row beside the graphic, so the
   * link is visible in one view while the full board sits below it. When the CardsIQ rows are on screen and the
   * graphic is not, the rows drive the remaining steps themselves, so the fill is never played off-screen. */
  var sync = document.getElementById('board-sync');
  var board = document.querySelector('.sq-board');
  if (sync && board) {
    var grid = sync.querySelector('[data-tb-grid]');
    var region = board.querySelector('[data-board-scroll]');
    var sum = sync.querySelector('[data-tb-sum]');
    var mirror = document.querySelector('[data-sync-mirror]');
    var nSteps = sync.querySelectorAll('[data-step]').length;
    var tiles = {}, rows = {};
    [].forEach.call(grid.querySelectorAll('[data-spot]'), function (li) { tiles[li.getAttribute('data-spot')] = li; });
    [].forEach.call(board.querySelectorAll('tr[data-spot]'), function (tr) { rows[tr.getAttribute('data-spot')] = tr; });
    var q = function (sel) { return document.querySelector(sel); };
    var out = {
      now: q('[data-sync-now]'), spot: q('[data-sync-spot]'), sold: q('[data-sync-sold]'), sale: q('[data-sync-sale]'), open: q('[data-sync-open]'),
      assigned: board.querySelector('[data-fill-assigned]'), verified: board.querySelector('[data-fill-verified]'),
      sAssigned: q('[data-sync-assigned]'), sVerified: q('[data-sync-verified]')
    };
    var SEQ = ['den', 'gb', 'lv', 'misc']; // open at the start (25/33), all end Verified
    var WORD = { sold: 'sold', sale: 'on sale now', open: 'available' };
    var touched = false;

    var setTile = function (a, st) {
      var li = tiles[a];
      var was = li.classList.contains('is-sold') ? 'sold' : li.classList.contains('is-sale') ? 'sale' : 'open';
      if (was === st) return;
      li.classList.toggle('is-sold', st === 'sold');
      li.classList.toggle('is-sale', st === 'sale');
      li.querySelector('[data-tb-sr]').textContent = SP[a].name + ', spot ' + SP[a].spot + ': ' + WORD[st];
      if (!reduced) { li.classList.remove('is-flip'); void li.offsetWidth; li.classList.add('is-flip'); }
    };
    var OPEN_USER = '<span class="lv-k">Whatnot username</span><span class="sq-uname"><span class="sq-uname__dot" aria-hidden="true"></span><span aria-hidden="true">username</span><span class="sr-only">Open spot, no buyer yet</span></span>';
    var setRow = function (a, st) { // open | assigned | verified
      var tr = rows[a], h = SP[a].b5 && SP[a].b5.h;
      if (tr.getAttribute('data-st') === st) return;
      tr.setAttribute('data-st', st);
      tr.classList.toggle('is-open', st === 'open');
      var user = tr.cells[1], ver = tr.cells[3];
      if (st === 'open') {
        tr.removeAttribute('data-drawer-row');
        user.innerHTML = OPEN_USER;
        ver.innerHTML = '<span class="lv-k">Verified</span><span class="lv-status lv-status--muted lv-status--sm">Unassigned</span>';
        return;
      }
      tr.setAttribute('data-drawer-row', '');
      var btn = user.querySelector('button');
      if (!btn) { // the buyer's username lands in the field (the button is kept from here on, so an open drawer keeps its trigger)
        user.innerHTML = '<span class="lv-k">Whatnot username</span><button type="button" class="sq-uname is-set" data-drawer="seller" data-drawer-id="' + h + '" data-break="05" aria-haspopup="dialog" aria-expanded="false"><span class="sq-uname__dot" aria-hidden="true"></span>' + h + '<span class="sr-only">: open seller record</span></button>';
        btn = user.querySelector('button');
        if (!reduced) { btn.classList.add('is-typed'); }
      }
      btn.querySelector('.sq-uname__dot').classList.toggle('is-ok', st === 'verified');
      ver.innerHTML = '<span class="lv-k">Verified</span>' + verifiedPill(st === 'verified');
    };
    // The aside's copy of one operator row, built from the board's own cell markup (spans: the board stays the trigger).
    var mirrorKey = 'car:open:live';
    var setMirror = function (a, st, live) {
      if (!mirror) return;
      var key = a + ':' + st + (live ? ':live' : '');
      if (key === mirrorKey) return;
      var typed = !reduced && st === 'assigned' && mirrorKey.indexOf(a + ':open') === 0;
      mirrorKey = key;
      var s = SP[a], h = s.b5 && s.b5.h;
      mirror.setAttribute('data-spot', a);
      mirror.classList.toggle('is-live', !!live);
      mirror.innerHTML = '<div class="sq-team">' + mark(a, 'sq-team__logo') + '<div><p class="lv-name">' + esc(s.name) + '</p><p class="lv-sub">Spot ' + s.spot + '</p>' +
          (s.cross ? '<p class="sq-xl">+ ' + esc(s.cross) + '</p>' : '') + '</div></div>' +
        (st === 'open' ? '<span class="sq-uname"><span class="sq-uname__dot"></span>username</span><span class="lv-status lv-status--muted lv-status--sm">Unassigned</span>'
          : '<span class="sq-uname is-set' + (typed ? ' is-typed' : '') + '"><span class="sq-uname__dot' + (st === 'verified' ? ' is-ok' : '') + '"></span>' + esc(h) + '</span>' + verifiedPill(st === 'verified'));
    };
    var reveal = function (a) {
      if (reduced || touched || !region) return;
      var tr = rows[a];
      var r = region.getBoundingClientRect(), b = tr.getBoundingClientRect();
      var headH = tr.closest('table').tHead.getBoundingClientRect().height;
      if (b.top >= r.top + headH && b.bottom <= r.bottom) return;
      region.scrollTo({ top: b.top - r.top + region.scrollTop - headH - 6, behavior: 'smooth' });
    };

    sync.addEventListener('ciq:step', function (e) {
      var i = e.detail.index, steps = e.detail.steps;
      var tileSt = { den: 'open', gb: 'open', lv: 'open', misc: 'open', car: 'open' };
      var rowSt = { den: 'open', gb: 'open', lv: 'open', misc: 'open' };
      var active = null;
      for (var k = 0; k <= i; k++) {
        var a = steps[k].getAttribute('data-spot'), act = steps[k].getAttribute('data-act');
        if (act === 'sale') { tileSt[a] = 'sale'; active = a; }
        else if (act === 'assign') rowSt[a] = 'assigned';
        else if (act === 'verify') rowSt[a] = 'verified';
        else if (act === 'sold') { tileSt[a] = 'sold'; if (active === a) active = null; }
      }
      Object.keys(tileSt).forEach(function (a) { setTile(a, tileSt[a]); });
      SEQ.forEach(function (a) { setRow(a, rowSt[a]); });
      Object.keys(rows).forEach(function (a) { rows[a].classList.toggle('is-live', a === active); });
      // Mirror: the spot on sale; right after a sale closes, the spot that just sold; before the run, the first spot.
      var m = active || (i >= 0 && steps[i].getAttribute('data-act') === 'sold' ? steps[i].getAttribute('data-spot') : SEQ[0]);
      setMirror(m, rowSt[m] || 'open', m === active);

      // Fill progress counts a spot once its tile has flipped to SOLD (brief §3.4A.3: gold → row fills → SOLD → count).
      var nA = 0, nV = 0, nSold = 0, nSale = 0;
      SEQ.forEach(function (a) { if (tileSt[a] === 'sold') { nA++; if (rowSt[a] === 'verified') nV++; } });
      Object.keys(tileSt).forEach(function (a) { if (tileSt[a] === 'sold') nSold++; if (tileSt[a] === 'sale') nSale++; });
      var sold = 25 + nSold, assigned = 25 + nA, verified = 23 + nV, open = 33 - sold - nSale;
      out.assigned.textContent = assigned;
      out.verified.textContent = verified;
      if (out.sAssigned) out.sAssigned.textContent = assigned;
      if (out.sVerified) out.sVerified.textContent = verified;
      out.sold.textContent = sold;
      out.sale.textContent = nSale;
      out.open.textContent = open;
      out.now.textContent = active ? SP[active].name : 'Next spot opening';
      out.spot.textContent = active ? 'Spot ' + SP[active].spot : '';
      var openNames = ['car', 'den', 'gb', 'jax', 'lv', 'mia', 'ten', 'misc'].filter(function (a) { return a === 'jax' || a === 'mia' || a === 'ten' || tileSt[a] !== 'sold'; })
        .map(function (a) { return (a === 'misc' ? 'Misc' : SP[a].name.split(' ').slice(0, -1).join(' ')) + (tileSt[a] === 'sale' ? ' (on sale now)' : ''); });
      if (sum) sum.textContent = sold + ' of 33 spots sold; open: ' + openNames.join(', ');
      if (i < 0 && region && !touched) region.scrollTop = 0;
      if (active && i >= 0) reveal(active);
    });

    // Rows drive the run while they are on screen and the graphic is not (the graphic's own timer is paused meanwhile).
    var drive = null, graphicIn = false, rowsIn = false;
    var stopDrive = function () { if (drive) { clearInterval(drive); drive = null; } };
    var maybeDrive = function () {
      var seq = sync._seq;
      if (drive || reduced || !rowsIn || graphicIn || !seq || seq.paused || seq.index >= nSteps - 1) return;
      seq.pause();
      drive = setInterval(function () {
        if (seq.index >= nSteps - 1) { stopDrive(); sync.dispatchEvent(new CustomEvent('ciq:done')); }
        else seq.go(seq.index + 1);
      }, 760);
    };
    if (hasIO && !reduced && region) {
      new IntersectionObserver(function (en) {
        graphicIn = en[0].intersectionRatio >= 0.34;
        if (!graphicIn) maybeDrive();
      }, { threshold: [0, 0.35] }).observe(sync);
      new IntersectionObserver(function (en) {
        rowsIn = en[0].isIntersecting && en[0].intersectionRatio >= 0.49;
        if (rowsIn) { maybeDrive(); return; }
        if (drive) { stopDrive(); var seq = sync._seq; if (seq && seq.index < nSteps - 1) seq.play(); } // the graphic resumes when seen
      }, { threshold: [0, 0.5] }).observe(region);
    }

    // Exploring the board shows the canonical state at once: the run jumps to its end and the control offers Replay.
    var settle = function () {
      touched = true;
      var seq = sync._seq, wasDriving = !!drive;
      stopDrive();
      if (!seq) return;
      if (seq.index !== nSteps - 1) seq.go(nSteps - 1);
      else if (!wasDriving) return;
      sync.dispatchEvent(new CustomEvent('ciq:done'));
    };
    // 'click', not 'pointerdown': a touch swipe that only scrolls the page must not skip the run.
    board.addEventListener('click', settle);
    board.addEventListener('focusin', settle);
    if (region) ['wheel', 'touchstart'].forEach(function (ev) { region.addEventListener(ev, function () { touched = true; }, { passive: true }); });
    var ctlBtn = document.querySelector('[data-seq-control="#board-sync"]');
    if (ctlBtn) ctlBtn.addEventListener('click', function () {
      // Read the control after ciq.js has handled the click: Play / Replay → the board follows the run again.
      setTimeout(function () {
        if (ctlBtn.getAttribute('data-state') === 'playing') { touched = false; maybeDrive(); } else stopDrive();
      }, 0);
    });

    // Search: "Find team or username" filters the spots (team name, abbreviation or Whatnot handle).
    var search = board.querySelector('[data-board-search]');
    var count = board.querySelector('[data-board-count]');
    var empty = board.querySelector('[data-board-empty]');
    if (search) search.addEventListener('input', function () {
      var term = search.value.trim().toLowerCase(), n = 0;
      Object.keys(rows).forEach(function (a) {
        var tr = rows[a], set = tr.querySelector('.sq-uname.is-set');
        var hay = (a + ' ' + SP[a].name + ' ' + (set && SP[a].b5 ? SP[a].b5.h : '')).toLowerCase();
        var match = !term || hay.indexOf(term) > -1;
        tr.hidden = !match;
        if (match) n++;
      });
      // A half with no matching rows hides with its header, so no orphan header sits over an empty table.
      [].forEach.call(board.querySelectorAll('.sq-spots'), function (t) { t.hidden = !t.querySelector('tbody tr:not([hidden])'); });
      if (count) count.textContent = 'Showing ' + n + ' of 33 spots';
      if (empty) empty.hidden = n > 0;
      if (region) region.scrollTop = 0;
    });
  }
})();
