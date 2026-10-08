/* StreamIQ page.
 * Hero: a short show-clock run (08:41:12 → 08:41:20 PM) plays the hit → offer moment once, where the eye is,
 *       then holds. Markup ships in that held end state, so no-JS and reduced motion show the meaningful end.
 * Rail: the Break 04 record plays back once (08:31:02 → 08:46:31) and holds every event lit. Pause / Replay
 *       controls; "Watch a break run" replays it from the first event.
 * Close: the sticky top-bar CTA steps aside while the final CTA is on screen (one primary per view).
 */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = CIQ.reducedMotion ? CIQ.reducedMotion() : false;
  var hasIO = 'IntersectionObserver' in window;

  /* ------------------------------------------------ hero: show clock → break state (pre → hit → offer), once */
  var con = document.querySelector('.s-con');
  if (con && !reduced) {
    var clock = con.querySelector('[data-clock]');
    var burn = con.querySelector('[data-clock-burn]');
    var HIT = 20 * 3600 + 41 * 60 + 14;  // 08:41:14 PM, Card hit on the Break 04 record
    var START = HIT - 2, END = HIT + 6;  // opens two seconds before the hit, holds at 08:41:20 PM
    var t = START, timer = null, inView = !hasIO;

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var hms = function (s) { var h = Math.floor(s / 3600) % 24; return pad(h % 12 || 12) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); };
    var render = function () {
      clock.textContent = hms(t) + ' PM';
      if (burn) burn.textContent = hms(t);
      var state = t >= HIT + 1 ? 'offer' : t >= HIT ? 'hit' : 'pre';
      if (con.getAttribute('data-state') !== state) con.setAttribute('data-state', state);
    };
    var tick = function () {
      t += 1; render();
      if (t >= END) { clearInterval(timer); timer = null; document.removeEventListener('visibilitychange', run); if (io) io.disconnect(); }
    };
    var run = function () {
      clearInterval(timer); timer = null;
      if (t < END && inView && !document.hidden) timer = setInterval(tick, 1000);
    };

    render();
    // Start only when the current card (where the offer lands) is properly in view.
    var io = null;
    if (hasIO) {
      io = new IntersectionObserver(function (entries) {
        inView = entries[0].intersectionRatio >= 0.6;
        run();
      }, { threshold: [0, 0.6, 1] });
      io.observe(con.querySelector('.s-current') || con);
    } else { run(); }
    document.addEventListener('visibilitychange', run);
  }

  /* ------------------------------------------------ event rail: one playback of the Break 04 record */
  var rail = document.querySelector('.s-rail');
  if (rail) {
    var evs = Array.prototype.slice.call(rail.querySelectorAll('.s-ev'));
    var n = evs.length;
    var ctl = rail.querySelector('.s-rail__ctl');
    var btnPause = rail.querySelector('[data-rail="pause"]');
    var btnReplay = rail.querySelector('[data-rail="replay"]');
    var STEP = 1500, FIRST = 350;
    var idx = n, rtimer = null, visible = false, paused = false, started = false;

    // Active column gets more room so its record update reads on one or two lines.
    var cols = function (active) {
      var out = [];
      for (var k = 0; k < n; k++) out.push('minmax(0, ' + (k === active ? '1.55fr' : '1fr') + ')');
      return out.join(' ');
    };
    var show = function (i) { // i = -1 (nothing yet) … n-1 (last active) … n (complete, everything lit)
      idx = i;
      evs.forEach(function (s, k) {
        s.classList.toggle('is-done', k < i);
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-upcoming', k > i);
      });
      var complete = i >= n;
      rail.classList.toggle('is-complete', complete);
      rail.setAttribute('data-index', String(i));
      rail.style.setProperty('--cols', cols(complete ? -1 : i));
      var cur = evs[Math.min(Math.max(i, 0), n - 1)];
      if (i >= 0 && !complete) rail.setAttribute('data-phase', cur.getAttribute('data-phase'));
      else rail.removeAttribute('data-phase');
      if (btnPause) {
        if (complete && document.activeElement === btnPause) { var rep = btnPause.parentNode.querySelector('[data-rail="replay"]'); if (rep) rep.focus(); }
        btnPause.disabled = complete;
        if (complete) { paused = false; btnPause.setAttribute('aria-pressed', 'false'); }
      }
    };
    var step = function () {
      clearTimeout(rtimer); rtimer = null;
      if (!visible || paused || idx >= n) return;
      show(idx + 1);
      if (idx < n) rtimer = setTimeout(step, idx === n - 1 ? STEP * 1.4 : STEP);
    };
    var resume = function (delay) {
      clearTimeout(rtimer); rtimer = null;
      if (visible && !paused && idx < n) rtimer = setTimeout(step, delay);
    };
    var replay = function () {
      paused = false; started = true;
      if (btnPause) btnPause.setAttribute('aria-pressed', 'false');
      show(-1);
      resume(FIRST);
    };

    if (reduced) {
      show(n); // every event shown, no timers, no playback controls
    } else {
      if (ctl) ctl.hidden = false;
      show(-1);
      if (hasIO) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible && !started) { started = true; resume(FIRST); }
          else if (visible) resume(STEP * 0.6);
          else { clearTimeout(rtimer); rtimer = null; }
        }, { threshold: 0.3 }).observe(rail);
      } else { visible = true; started = true; resume(FIRST); }

      if (btnPause) btnPause.addEventListener('click', function () {
        paused = !paused;
        btnPause.setAttribute('aria-pressed', String(paused));
        if (paused) { clearTimeout(rtimer); rtimer = null; } else resume(400);
      });
      if (btnReplay) btnReplay.addEventListener('click', replay);

      // "Watch a break run" plays the record from 08:31:02 once the rail is reached.
      var watch = document.querySelector('.s-watch');
      if (watch) watch.addEventListener('click', function () { replay(); });
    }
  }

})();
