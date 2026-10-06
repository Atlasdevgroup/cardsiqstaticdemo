/* CardsIQ demo — shared behavior.
 * Reveal-on-scroll · stage sequences · count-up · card tilt · tabs · nav drawer ·
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
      '</div><div class="container site-foot__legal"><span>© 2026 CardsIQ</span><span class="demo-tag">Design demo — product views use illustrative data</span></div>';
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
  function drawer() {
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
      var label = btn.querySelector('.seq-ctl__label');
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
      root.addEventListener('click', function (e) { if (e.target.closest('[data-step]') && btn.getAttribute('data-state') === 'playing') show('paused'); });
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
      var max = +stage.getAttribute('data-tilt') || 6;
      var raf;
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          cards.forEach(function (c, i) {
            var depth = +c.getAttribute('data-depth') || 1;
            c.style.transform = 'perspective(1200px) rotateY(' + (x * max * depth).toFixed(2) + 'deg) rotateX(' + (-y * max * depth).toFixed(2) + 'deg) translateZ(0)';
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
  CIQ.hydrateIcons = function (root) {
    if (!CIQ.icon) return;
    $$('[data-ico]', root).forEach(function (el) {
      if (el.firstChild) return;
      el.innerHTML = CIQ.icon(el.getAttribute('data-ico'));
    });
  };

  function boot() {
    CIQ.hydrateIcons();
    footer();
    ctas();
    drawer();
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
