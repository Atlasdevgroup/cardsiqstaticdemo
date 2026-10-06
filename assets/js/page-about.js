/* About page — hero label readout alignment + the "fragmented → one record" weave. */
(function () {
  'use strict';
  var CIQ = window.CIQ || {};
  var reduced = function () { return CIQ.reducedMotion ? CIQ.reducedMotion() : window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var raf = function (fn) { var id; return function () { cancelAnimationFrame(id); id = requestAnimationFrame(fn); }; };

  /* ------------------------------------------------ hero: line the readout up with the slab's label */
  var art = document.querySelector('.ab-artifact');
  if (art) {
    var slab = art.querySelector('.ab-artifact__card');
    var size = raf(function () { art.style.setProperty('--slab-w', slab.getBoundingClientRect().width + 'px'); });
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(slab);
    else window.addEventListener('resize', size);
  }

  /* ------------------------------------------------ weave: six separate tools pass through CardsIQ and converge into one record.
     Above the threshold (gate) each tool keeps a dim dashed stub that stops short of the line — "before".
     Below it the threads are solid and converge on the record — "after". Both stay visible at rest and in reduced motion;
     only the solid half animates in. */
  var weave = document.querySelector('.weave');
  if (!weave) return;
  var svg = weave.querySelector('.weave__lines');
  var sources = Array.prototype.slice.call(weave.querySelectorAll('.weave__sources span'));
  var mark = weave.querySelector('.weave__mark');
  var gate = weave.querySelector('.weave__gate-line');
  var NS = 'http://www.w3.org/2000/svg';
  var GAP = 9; // visible break on each side of the threshold line

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function lit(d, cls, i) {
    svg.appendChild(el('path', { d: d, 'class': 'w-base' }));
    var p = el('path', { d: d, 'class': 'w-lit ' + (cls || '') });
    svg.appendChild(p);
    var len = p.getTotalLength();
    p.style.strokeDasharray = len + ' ' + len;
    p.style.setProperty('--i', i || 0);
    p.style.strokeDashoffset = weave.classList.contains('is-on') ? 0 : len;
    return p;
  }

  var lits = [];
  function draw() {
    var box = weave.getBoundingClientRect();
    if (!box.width) return;
    var down = (getComputedStyle(weave).getPropertyValue('--weave-dir') || 'down').trim() === 'down';
    var m = mark.getBoundingClientRect(), g = gate.getBoundingClientRect();
    var mx = m.left + m.width / 2 - box.left, my = m.top + m.height / 2 - box.top;
    var gy = g.top + g.height / 2 - box.top, gx = g.left + g.width / 2 - box.left;
    // Merge point sits just before the mark; one trunk runs from there into the record.
    var M = down ? { x: mx, y: m.top - box.top - 44 } : { x: m.left - box.left - 22, y: my };
    var T = down ? { x: mx, y: m.top - box.top - 4 } : { x: m.left - box.left - 4, y: my };
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    svg.innerHTML = '<defs><linearGradient id="weave-grad" gradientUnits="userSpaceOnUse" x1="' + (down ? 0 : gx) + '" y1="' + (down ? gy : 0) + '" x2="' + (down ? 0 : T.x) + '" y2="' + (down ? T.y : 0) + '">' +
      '<stop offset="0" stop-color="#22a8ff"/><stop offset=".6" stop-color="#4f7cff"/><stop offset="1" stop-color="#a258f7"/></linearGradient></defs>';
    lits = [];
    var nodes = [];
    sources.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var A, B, C, d;
      if (down) {
        A = { x: r.left + r.width / 2 - box.left, y: r.bottom - box.top + 14 };
        B = { x: A.x, y: gy - GAP };          // stub ends short of the line
        C = { x: A.x, y: gy + GAP };          // thread resumes past it
        var dy = M.y - C.y;
        d = 'M' + C.x + ' ' + C.y + ' C' + C.x + ' ' + (C.y + dy * 0.55) + ' ' + M.x + ' ' + (M.y - dy * 0.5) + ' ' + M.x + ' ' + M.y;
      } else {
        A = { x: r.right - box.left + 12, y: r.top + r.height / 2 - box.top };
        B = { x: gx - GAP, y: A.y };
        C = { x: gx + GAP, y: A.y };
        var dx = M.x - C.x;
        d = 'M' + C.x + ' ' + C.y + ' C' + (C.x + dx * 0.55) + ' ' + C.y + ' ' + (M.x - dx * 0.5) + ' ' + M.y + ' ' + M.x + ' ' + M.y;
      }
      if ((down ? B.y - A.y : B.x - A.x) > 4) svg.appendChild(el('path', { d: 'M' + A.x + ' ' + A.y + ' L' + B.x + ' ' + B.y, 'class': 'w-stub' }));
      svg.appendChild(el('circle', { cx: A.x, cy: A.y, r: 3, 'class': 'w-stub-node' }));
      lits.push(lit(d, '', i));
      nodes.push([C, i]);
    });
    lits.push(lit('M' + M.x + ' ' + M.y + ' L' + T.x + ' ' + T.y, 'w-trunk', 0));
    nodes.forEach(function (n) {
      var c = el('circle', { cx: n[0].x, cy: n[0].y, r: 3.5, 'class': 'w-node' });
      c.style.setProperty('--i', n[1]);
      svg.appendChild(c);
    });
  }

  function connect() {
    weave.classList.add('is-on');
    lits.forEach(function (p) { p.style.strokeDashoffset = 0; });
  }

  var redraw = raf(draw);
  draw();
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(weave);
  else window.addEventListener('resize', redraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  window.addEventListener('load', redraw);

  // Reduced motion: show the end state (which still reads before → after). Otherwise connect once, when the weave is in view.
  if (reduced() || !('IntersectionObserver' in window)) { connect(); }
  else {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); requestAnimationFrame(connect); }
    }, { threshold: 0.45 });
    io.observe(weave);
  }
})();
