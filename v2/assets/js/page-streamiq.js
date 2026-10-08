/* StreamIQ page.
 * Hero: TIME ELAPSED ticks while the stage is on screen (Pause clock control, WCAG 2.2.2). The current hit
 *       lands once (Card hit → Offer Sent), then holds. Markup ships in the held end state, so no-JS and
 *       reduced motion show 01:41:15 and Offer Sent.
 * Rail: the Break 04 record plays once through ciq.js (Pause / Replay via .seq-ctl). This file moves the
 *       show clock and the active phase with each step, and "Watch a break run" replays it from 08:31:02.
 * Listeners attach at the top level: page scripts run before ciq.js boots and renders the first step.
 */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = CIQ.reducedMotion ? CIQ.reducedMotion() : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

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
})();
