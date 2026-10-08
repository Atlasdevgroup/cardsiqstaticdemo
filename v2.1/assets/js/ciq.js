/* CardsIQ demo v2 — shared behavior (carried over from v1).
 * Reveal-on-scroll · stage sequences · count-up · card tilt · tabs · nav drawer · product drawer ·
 * sticky CTA after hero · CTA routing · footer. All motion honors prefers-reduced-motion.
 */
(function () {
  'use strict';
  var CIQ = (window.CIQ = window.CIQ || {});
  var R = CIQ.routes || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  CIQ.reducedMotion = function () { return reduce.matches || document.documentElement.classList.contains('shot'); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  CIQ.$$ = $$;

  /* ---------------------------------------------------------------- footer */
  function footer() {
    var f = document.createElement('footer');
    f.className = 'site-foot';
    f.innerHTML =
      '<div class="container site-foot__grid">' +
      '<div><img src="assets/img/brand/cardsiq-lockup.png" alt="CardsIQ" width="120" height="39"><p>The operating system for the modern hobby.</p></div>' +
      '<div><h2>Platform</h2><ul><li><a href="' + R.platform + '">How it works</a></li><li><a href="' + R.buybacks + '">Instant Buybacks</a></li><li><a href="' + R.inventory + '">Inventory Management</a></li><li><a href="' + R.streamiq + '">StreamIQ</a></li></ul></div>' +
      '<div><h2>Company</h2><ul><li><a href="' + R.about + '">About</a></li><li><a href="' + R.partner + '">Become a partner</a></li><li><a href="' + R.createAccount + '" data-cta="create-account">Create account</a></li></ul></div>' +
      '<div><h2>Support</h2><ul><li><a href="#contact">Contact Us</a></li><li><a href="#documentation">Documentation</a></li><li><a href="#terms">Terms of Service</a></li><li><a href="#privacy">Privacy Policy</a></li></ul></div>' +
      '</div><div class="container site-foot__legal"><span>© 2026 CardsIQ</span><span class="demo-tag">Design demo v2.1 — product views use illustrative data</span></div>';
    document.body.appendChild(f);
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }

  /* ---------------------------------------------------------------- toast */
  var toastTimer;
  CIQ.toast = function (html) {
    var t = document.querySelector('.toast');
    if (!t) return;
    t.innerHTML = html;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 3200);
  };

  /* ---------------------------------------------------------------- CTA routing */
  function ctas() {
    $$('[data-cta]').forEach(function (a) {
      var kind = a.getAttribute('data-cta');
      if (kind === 'partner') {
        var interest = a.getAttribute('data-interest');
        a.setAttribute('href', R.partner + (interest ? '?interest=' + encodeURIComponent(interest) : '') + '#inquiry');
      } else if (kind === 'create-account') {
        a.setAttribute('href', R.createAccount);
      } else if (kind === 'sign-in') {
        a.setAttribute('href', R.signIn);
      }
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-cta="create-account"], [data-cta="sign-in"], a[href^="#licensed-"], .site-foot a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      e.preventDefault();
      var what = a.getAttribute('data-cta') === 'sign-in' ? 'CardsIQ sign-in' : a.getAttribute('data-cta') === 'create-account' ? 'CardsIQ account sign-up' : 'the existing CardsIQ page';
      CIQ.toast('<b>Demo route.</b> In production this opens ' + what + '.');
    });
  }

  /* ---------------------------------------------------------------- nav drawer */
  function navDrawer() {
    var body = document.body;
    var openBtn = document.querySelector('[data-nav-open]');
    var side = document.getElementById('shell-side');
    var scrim = document.querySelector('.shell-scrim');
    if (!openBtn || !side) return;
    function set(open) {
      // Keep keyboard and screen-reader focus inside the open drawer.
      ['.shell-top', 'main', '.site-foot'].forEach(function (sel) { var el = document.querySelector(sel); if (el) el.inert = open; });
      body.classList.toggle('nav-open', open);
      openBtn.setAttribute('aria-expanded', String(open));
      if (scrim) scrim.hidden = !open;
      if (open) { var first = side.querySelector('a, button'); if (first) first.focus(); }
      else openBtn.focus();
    }
    openBtn.addEventListener('click', function () { set(true); });
    $$('[data-nav-close]').forEach(function (b) { b.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('nav-open')) set(false); });
  }

  /* ---------------------------------------------------------------- product drawer (CIQ.drawer)
   * One system for every product drawer: the app's right-side sheet (181544) and its
   * centred modal variant (181234). Pages supply content only.
   *   <button data-drawer="tpl-id">                         content from <template id="tpl-id">
   *   <button data-drawer="card" data-drawer-id="burrow">   content from CIQ.drawer.register('card', fn(id, trigger))
   *   data-drawer-variant="modal"                           centred modal instead of the side sheet
   *   <tr data-drawer-row> … <button data-drawer …>         a click anywhere on the row opens it
   * Esc, the scrim and the close button close it. Focus is trapped while open and returned
   * to the trigger on close; the trigger's row stays highlighted while its drawer is open.
   * A drawer opened from inside another drawer stacks, and shows a Back button. */
  CIQ.drawer = (function () {
    var host, panel, scroll, backBtn, closeTimer;
    var renderers = {}, stack = [], current = null, trigger = null, selected = null, returnTo = null, bound = false;
    var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
    function isOpen() { return !!host && host.classList.contains('is-open'); }
    function setInert(on) {
      Array.prototype.forEach.call(document.body.children, function (el) {
        if (el !== host && el.tagName !== 'SCRIPT') el.inert = on;
      });
    }
    function build() {
      host = document.createElement('div');
      host.className = 'lv-drawer';
      host.hidden = true;
      host.innerHTML =
        '<div class="lv-drawer__scrim" data-drawer-close></div>' +
        '<section class="lv-drawer__panel" role="dialog" aria-modal="true" tabindex="-1">' +
        '<button class="lv-drawer__back" type="button" hidden><span data-ico="arrow"></span>Back</button>' +
        '<button class="lv-drawer__close" type="button" data-drawer-close aria-label="Close"><span data-ico="close"></span></button>' +
        '<div class="lv-drawer__scroll" tabindex="0" role="region" aria-label="Drawer details"></div></section>';
      document.body.appendChild(host);
      panel = host.querySelector('.lv-drawer__panel');
      scroll = host.querySelector('.lv-drawer__scroll');
      backBtn = host.querySelector('.lv-drawer__back');
      CIQ.hydrateIcons(host);
      host.addEventListener('click', function (e) { if (e.target.closest('[data-drawer-close]')) close(); });
      backBtn.addEventListener('click', back);
      host.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var f = $$(FOCUSABLE, panel).filter(visible);
        if (!f.length) { e.preventDefault(); panel.focus(); return; }
        var first = f[0], last = f[f.length - 1], a = document.activeElement;
        if (e.shiftKey && (a === first || a === panel)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      });
    }
    function resolve(key, id, el) {
      if (renderers[key]) return renderers[key](id, el);
      var tpl = document.getElementById(key);
      return tpl && tpl.content ? tpl.content.cloneNode(true) : null;
    }
    function select(el) {
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (selected) selected.classList.remove('is-selected');
      trigger = el || null;
      selected = null;
      if (!trigger) return;
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', 'true');
      selected = trigger.closest('[data-drawer-row]') || trigger;
      selected.classList.add('is-selected');
    }
    function render(state) {
      var content = resolve(state.key, state.id, state.trigger);
      if (content == null) return false;
      scroll.innerHTML = '';
      if (typeof content === 'string') scroll.innerHTML = content; else scroll.appendChild(content);
      CIQ.hydrateIcons(scroll);
      scroll.scrollTop = 0;
      host.classList.toggle('lv-drawer--modal', state.variant === 'modal');
      var h = scroll.querySelector('[data-drawer-title]') || scroll.querySelector('h2, h3');
      if (h) {
        if (!h.id) h.id = 'lv-drawer-title';
        panel.setAttribute('aria-labelledby', h.id);
        panel.removeAttribute('aria-label');
      } else {
        panel.removeAttribute('aria-labelledby');
        panel.setAttribute('aria-label', state.label || 'Details');
      }
      backBtn.hidden = !stack.length;
      current = state;
      return true;
    }
    function open(key, opts) {
      opts = opts || {};
      if (!host) build();
      var state = { key: key, id: opts.id || null, variant: opts.variant || null, trigger: opts.trigger || null, label: opts.label || '' };
      var inside = state.trigger && host.contains(state.trigger);
      if (isOpen() && inside && current) { current.top = scroll.scrollTop; stack.push(current); } else stack = [];
      if (!render(state)) { if (inside) stack.pop(); return; }
      clearTimeout(closeTimer);
      if (!inside) select(state.trigger);
      if (!isOpen()) {
        returnTo = state.trigger || document.activeElement;
        document.documentElement.style.setProperty('--sbw', (window.innerWidth - document.documentElement.clientWidth) + 'px');
        document.documentElement.classList.add('has-drawer');
        setInert(true);
        host.hidden = false;
        void host.offsetWidth;
        scroll.scrollTop = 0;
        host.classList.add('is-open');
      }
      panel.focus({ preventScroll: true });
      document.dispatchEvent(new CustomEvent('ciq:drawer', { detail: { open: true, key: key, id: state.id } }));
    }
    function back() {
      var prev = stack.pop();
      if (!prev) return;
      render(prev);
      scroll.scrollTop = prev.top || 0;
      panel.focus({ preventScroll: true });
      document.dispatchEvent(new CustomEvent('ciq:drawer', { detail: { open: true, key: prev.key, id: prev.id, back: true } }));
    }
    function close() {
      if (!isOpen()) return;
      host.classList.remove('is-open');
      setInert(false);
      document.documentElement.classList.remove('has-drawer');
      select(null);
      stack = [];
      current = null;
      var to = returnTo;
      returnTo = null;
      var done = function () { if (!isOpen()) { host.hidden = true; scroll.innerHTML = ''; } };
      if (CIQ.reducedMotion()) done(); else closeTimer = setTimeout(done, 340);
      if (to && to.focus && document.body.contains(to)) to.focus({ preventScroll: true });
      document.dispatchEvent(new CustomEvent('ciq:drawer', { detail: { open: false } }));
    }
    function init() {
      $$('[data-drawer]').forEach(function (t) { t.setAttribute('aria-haspopup', 'dialog'); if (t !== trigger) t.setAttribute('aria-expanded', 'false'); });
      if (bound) return;
      bound = true;
      document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-drawer]');
        if (!t) {
          var row = e.target.closest('[data-drawer-row]');
          if (!row || e.target.closest('a, button, input, select, textarea, label')) return;
          t = row.querySelector('[data-drawer]');
          if (!t) return;
        }
        e.preventDefault();
        open(t.getAttribute('data-drawer'), { id: t.getAttribute('data-drawer-id'), variant: t.getAttribute('data-drawer-variant'), trigger: t, label: t.getAttribute('aria-label') });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(); }
      });
    }
    return {
      init: init,
      open: open,
      close: close,
      isOpen: isOpen,
      register: function (key, fn) { renderers[key] = fn; }
    };
  })();

  /* ---------------------------------------------------------------- past hero (sticky CTA) */
  function pastHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero || !('IntersectionObserver' in window)) { document.body.classList.add('past-hero'); return; }
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('past-hero', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 }).observe(hero.querySelector('[data-hero-cta]') || hero);
  }

  function finalCta() {
    var fin = document.querySelector('.cta-final');
    if (!fin || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('is-final-cta', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(fin);
  }

  /* ---------------------------------------------------------------- reveal */
  function reveal() {
    var els = $$('[data-reveal]');
    if (CIQ.reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- sequences
   * <el data-sequence data-interval="1600" data-loop data-hold="2600" data-interactive data-start="0">
   *   children with [data-step]. Adds .is-active / .is-done, sets --progress, fires 'ciq:step'.
   * Pauses off-screen. Reduced motion: shows final state, no timers.
   */
  CIQ.sequence = function (root) {
    var steps = $$('[data-step]', root).filter(function (s) { return s.closest('[data-sequence]') === root; });
    if (!steps.length) return null;
    var interval = +root.getAttribute('data-interval') || 1600;
    var hold = +root.getAttribute('data-hold') || interval * 1.6;
    var loop = root.hasAttribute('data-loop');
    var interactive = root.hasAttribute('data-interactive');
    var idx = -1, timer = null, visible = false, paused = false, finished = false;
    root.style.setProperty('--n', steps.length);

    function render(i) {
      idx = i;
      steps.forEach(function (s, k) {
        s.classList.toggle('is-done', k < i);
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-upcoming', k > i);
        if (interactive) { var c = s.querySelector('button') || s; if (k === i) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current'); }
      });
      root.style.setProperty('--progress', steps.length > 1 ? Math.max(0, i) / (steps.length - 1) : 1);
      root.setAttribute('data-index', i);
      root.dispatchEvent(new CustomEvent('ciq:step', { detail: { index: i, step: steps[i], steps: steps } }));
    }
    function tick() {
      clearTimeout(timer);
      if (!visible || paused) return;
      if (idx < steps.length - 1) {
        render(idx + 1);
        timer = setTimeout(tick, idx === steps.length - 1 ? hold : interval);
      } else if (loop) {
        render(-1);
        timer = setTimeout(tick, interval * 0.5);
      } else { finished = true; root.dispatchEvent(new CustomEvent('ciq:done')); }
    }
    if (CIQ.reducedMotion()) { render(steps.length - 1); }
    else {
      render(root.hasAttribute('data-start') ? +root.getAttribute('data-start') : -1);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible && !finished) { clearTimeout(timer); timer = setTimeout(tick, idx < 0 ? 350 : interval); }
          else clearTimeout(timer);
        }, { threshold: 0.35 }).observe(root);
      } else { visible = true; tick(); }
    }
    if (interactive) {
      // Steps that contain a button are already focusable; bare steps get a tab stop.
      steps.forEach(function (s) { if (!s.querySelector('button, a') && !s.hasAttribute('tabindex')) s.tabIndex = 0; });
      steps.forEach(function (s, k) {
        s.addEventListener('click', function () { paused = true; clearTimeout(timer); render(k); });
        s.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = Math.min(steps.length - 1, k + 1);
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = Math.max(0, k - 1);
          if (e.key === 'Home') n = 0;
          if (e.key === 'End') n = steps.length - 1;
          if (n !== null) { e.preventDefault(); paused = true; clearTimeout(timer); render(n); (steps[n].querySelector('button') || steps[n]).focus(); }
          // Native buttons already turn Enter/Space into a click; only bare steps need it.
          if ((e.key === 'Enter' || e.key === ' ') && !s.querySelector('button')) { e.preventDefault(); paused = true; clearTimeout(timer); render(k); }
        });
      });
    }
    return {
      go: function (i) { paused = true; clearTimeout(timer); render(i); },
      pause: function () { paused = true; clearTimeout(timer); },
      play: function () { if (CIQ.reducedMotion()) return; paused = false; finished = false; clearTimeout(timer); timer = setTimeout(tick, interval); },
      restart: function () { if (CIQ.reducedMotion()) { render(steps.length - 1); return; } paused = false; finished = false; clearTimeout(timer); render(-1); timer = setTimeout(tick, 350); },
      get index() { return idx; },
      get paused() { return paused; }
    };
  };

  /* ---------------------------------------------------------------- sequence controls
   * <button class="seq-ctl" type="button" data-seq-control="#seq-id"><span class="seq-ctl__ico"></span><span class="seq-ctl__label">Pause</span></button>
   * Pause / Play while running, Replay once finished. Hidden under reduced motion (nothing animates).
   */
  function seqControls() {
    $$('[data-seq-control]').forEach(function (btn) {
      var root = document.querySelector(btn.getAttribute('data-seq-control'));
      if (!root || !root._seq) return;
      if (CIQ.reducedMotion()) { btn.hidden = true; return; }
      var label = btn.querySelector('.seq-ctl__label, .seq-ctl__txt');
      var ico = btn.querySelector('.seq-ctl__ico');
      function show(state) {
        btn.setAttribute('data-state', state);
        if (ico && CIQ.icon) ico.innerHTML = CIQ.icon(state === 'playing' ? 'pause' : state === 'paused' ? 'play' : 'history');
        if (label) label.textContent = state === 'playing' ? 'Pause' : state === 'paused' ? 'Play' : 'Replay';
      }
      show('playing');
      btn.addEventListener('click', function () {
        var st = btn.getAttribute('data-state');
        if (st === 'playing') { root._seq.pause(); show('paused'); }
        else if (st === 'paused') { root._seq.play(); show('playing'); }
        else { root._seq.restart(); show('playing'); }
      });
      root.addEventListener('ciq:done', function () { show('done'); });
      // Picking a stage pauses autoplay, so the control offers Play.
      root.addEventListener('click', function (e) { if (root.hasAttribute('data-interactive') && e.target.closest('[data-step]') && btn.getAttribute('data-state') === 'playing') show('paused'); });
    });
  }

  /* ---------------------------------------------------------------- count-up */
  function countUp() {
    var els = $$('[data-count]');
    function fmt(el, v) {
      var dec = +el.getAttribute('data-decimals') || 0;
      var s = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      el.textContent = (el.getAttribute('data-prefix') || '') + s + (el.getAttribute('data-suffix') || '');
    }
    if (CIQ.reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(function (el) { fmt(el, +el.getAttribute('data-count')); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.getAttribute('data-count'), t0 = null, dur = 1400;
        (function frame(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          fmt(el, to * e);
          if (p < 1) requestAnimationFrame(frame);
        })(performance.now());
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- physical card tilt */
  function tilt() {
    if (CIQ.reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    $$('[data-tilt]').forEach(function (stage) {
      var cards = $$('.slab', stage);
      // Keep any compositional transform (rotation in a fan) and add the tilt on top of it.
      var base = cards.map(function (c) { var t = getComputedStyle(c).transform; return t && t !== 'none' ? t + ' ' : ''; });
      var max = +stage.getAttribute('data-tilt') || 6;
      var raf;
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          cards.forEach(function (c, i) {
            var depth = +c.getAttribute('data-depth') || 1;
            c.style.transform = base[i] + 'perspective(1200px) rotateY(' + (x * max * depth).toFixed(2) + 'deg) rotateX(' + (-y * max * depth).toFixed(2) + 'deg) translateZ(0)';
          });
        });
      });
      stage.addEventListener('pointerleave', function () { cards.forEach(function (c) { c.style.transform = ''; }); });
    });
  }

  /* ---------------------------------------------------------------- tabs (ARIA) */
  CIQ.tabs = function (root) {
    var tabs = $$('[role="tab"]', root);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[k]) { panels[k].hidden = !on; panels[k].classList.toggle('is-in', on); }
      });
      if (focus) tabs[i].focus();
      root.dispatchEvent(new CustomEvent('ciq:tab', { detail: { index: i } }));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var vertical = root.getAttribute('aria-orientation') === 'vertical' || (root.querySelector('[role=tablist]') || {}).getAttribute && root.querySelector('[role=tablist]').getAttribute('aria-orientation') === 'vertical';
        var next = vertical ? 'ArrowDown' : 'ArrowRight', prev = vertical ? 'ArrowUp' : 'ArrowLeft';
        var n = null;
        if (e.key === next || e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        if (e.key === prev || e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    var initial = Math.max(0, tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }));
    select(initial);
    return { select: select };
  };

  /* ---------------------------------------------------------------- boot */
  /* ---------------------------------------------------------------- icon hydration: <span data-ico="scan"></span> */
  /* ---------------------------------------------------------------- NFL team marks
   * The live app shows the team's logo in team chips. Logos: assets/img/teams/{abbr}.webp, taken from
   * the user's NFL TEAM BOARD file (rights confirmed). The Giants mark isn't in that file yet, so Giants
   * chips keep the colour square until it is supplied (add 'nyg' to TEAM_LOGOS). */
  var NFL_TEAMS = {
    Cardinals: 'ari', Falcons: 'atl', Ravens: 'bal', Bills: 'buf', Panthers: 'car', Bears: 'chi', Bengals: 'cin', Browns: 'cle',
    Cowboys: 'dal', Broncos: 'den', Lions: 'det', Packers: 'gb', Texans: 'hou', Colts: 'ind', Jaguars: 'jax', Chiefs: 'kc',
    Raiders: 'lv', Chargers: 'lac', Rams: 'lar', Dolphins: 'mia', Vikings: 'min', Patriots: 'ne', Saints: 'no', Giants: 'nyg',
    Jets: 'nyj', Eagles: 'phi', Steelers: 'pit', '49ers': 'sf', Seahawks: 'sea', Buccaneers: 'tb', Titans: 'ten', Commanders: 'was'
  };
  var TEAM_LOGOS = 'ari atl bal buf car chi cin cle dal den det gb hou ind jax kc lv lac lar mia min ne no nyj phi pit sf sea tb ten was'.split(' ');
  CIQ.teamLogo = function (abbr) {
    abbr = String(abbr || '').toLowerCase();
    return TEAM_LOGOS.indexOf(abbr) > -1 ? 'assets/img/teams/' + abbr + '.webp' : null;
  };
  CIQ.teamAbbr = function (nickname) { return NFL_TEAMS[String(nickname || '').trim()] || null; };
  function teamMarks(root) {
    $$('.lv-pill--team', root).forEach(function (p) {
      if (p.querySelector('.lv-tlogo')) return;
      var src = CIQ.teamLogo(p.getAttribute('data-team') || CIQ.teamAbbr(p.textContent));
      if (!src) return;
      var img = document.createElement('img');
      img.className = 'lv-tlogo';
      img.src = src;
      img.alt = '';
      img.width = 18;
      img.height = 18;
      img.decoding = 'async';
      p.insertBefore(img, p.firstChild);
      p.classList.add('has-logo');
    });
  }

  CIQ.hydrateIcons = function (root) {
    if (!CIQ.icon) return;
    $$('[data-ico]', root).forEach(function (el) {
      if (el.firstChild) return;
      el.innerHTML = CIQ.icon(el.getAttribute('data-ico'));
    });
    teamMarks(root);
  };

  function boot() {
    CIQ.hydrateIcons();
    footer();
    ctas();
    navDrawer();
    CIQ.drawer.init();
    pastHero();
    finalCta();
    reveal();
    countUp();
    tilt();
    $$('[data-sequence]').forEach(function (el) { el._seq = CIQ.sequence(el); });
    seqControls();
    $$('[data-tabs]').forEach(function (el) { el._tabs = CIQ.tabs(el); });
    document.dispatchEvent(new CustomEvent('ciq:ready'));
  }
  // Deferred page scripts run before DOMContentLoaded, so they can attach
  // 'ciq:step' / 'ciq:tab' listeners before the first state is rendered.
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
