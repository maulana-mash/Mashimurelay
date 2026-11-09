/**
 * Mashimurelay Startup Motion Graphic & Audio Controller (Robust & Zero-Lag)
 * Pacing: 2.2s snappy motion + 1.2s hold = 3.4s -> Auto-open Project Dashboard (Workspace)
 */
(function() {
  const SK = 0.62;
  const $ = id => document.getElementById(id);
  
  function getElements() {
    return {
      screen: $('appLoadingScreen'),
      st: $('loadingSt'),
      bg: $('loadingBg'),
      wm: $('loadingWm'),
      ld: $('loadingLd'),
      mk: $('loadingMk'),
      ring: $('loadingRing'),
      letters: Array.from(document.querySelectorAll('.loading-l'))
    };
  }

  let ac = null, mg = null, nb = null;
  
  function getAudioContext() {
    if (!ac) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          ac = new AudioCtx();
          mg = ac.createGain();
          mg.gain.value = 0.55;
          mg.connect(ac.destination);
          nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nb.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
      } catch (e) {}
    }
    if (ac && ac.state === 'suspended') {
      ac.resume().catch(() => {});
    }
    return ac;
  }

  function unlockAudio() {
    if (ac && ac.state === 'suspended') {
      ac.resume().catch(() => {});
    }
  }
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  function tone(f, d, ty, v, f2) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = Math.max(ctx.currentTime || 0, 0.001);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = ty;
      o.frequency.setValueAtTime(f, now);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
      g.gain.setValueAtTime(1e-4, now);
      g.gain.exponentialRampToValueAtTime(v, now + 0.008);
      g.gain.exponentialRampToValueAtTime(1e-4, now + d);
      o.connect(g).connect(mg);
      o.start(now);
      o.stop(now + d + 0.03);
    } catch (e) {}
  }

  function nz(d, f1, f2, v, q) {
    const ctx = getAudioContext();
    if (!ctx || !nb) return;
    try {
      const now = Math.max(ctx.currentTime || 0, 0.001);
      const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = nb;
      s.loop = true;
      b.type = 'bandpass';
      b.Q.value = q || 1;
      b.frequency.setValueAtTime(f1, now);
      b.frequency.exponentialRampToValueAtTime(f2, now + d);
      g.gain.setValueAtTime(1e-4, now);
      g.gain.exponentialRampToValueAtTime(v, now + d * 0.3);
      g.gain.exponentialRampToValueAtTime(1e-4, now + d);
      s.connect(b).connect(g).connect(mg);
      s.start(now);
      s.stop(now + d + 0.03);
    } catch (e) {}
  }

  const PS = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
  const S = {
    l(i) {
      const f = 392 * 2 ** (PS[i] / 12);
      tone(f, 0.09, 'triangle', 0.22);
      tone(f * 2, 0.05, 'sine', 0.06);
      nz(0.02, 5000, 5000, 0.05, 2);
    },
    pop() {
      tone(1100, 0.08, 'sine', 0.35, 300);
      tone(2200, 0.04, 'sine', 0.08, 900);
    },
    whoosh() {
      nz(0.52, 250, 2600, 0.3, 0.8);
    },
    zap() {
      nz(0.14, 7000, 1800, 0.35, 1);
      tone(150, 0.25, 'sine', 0.45, 45);
      tone(1318, 0.6, 'sine', 0.13);
      tone(1975, 0.7, 'sine', 0.1);
    }
  };

  let W, H, D, cx, animRunning = false;
  const PT = [...Array(14)].map(() => ({ x: Math.random(), y: Math.random(), s: 0.02 + Math.random() * 0.05, r: 1 + Math.random() * 2 }));

  function rs() {
    const els = getElements();
    if (!els.bg) return;
    D = window.devicePixelRatio || 1;
    W = els.bg.width = window.innerWidth * D;
    H = els.bg.height = window.innerHeight * D;
    cx = els.bg.getContext('2d');
  }

  function fit() {
    const els = getElements();
    if (!els.st) return;
    const s = window.innerWidth < 900 ? window.innerWidth * 0.62 / 700 : Math.min(window.innerWidth / 1920, window.innerHeight / 1080) * SK;
    els.st.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }

  function draw(t) {
    if (!cx) return;
    cx.clearRect(0, 0, W, H);
    cx.lineWidth = 1.6 * D;
    for (let k = 0; k < 5; k++) {
      cx.beginPath();
      for (let x = 0; x <= W; x += 14 * D) {
        const y = H * (0.5 + (k - 2) * 0.075) + Math.sin(x / (W / 5) + t * 2e-4 * (1 + k * 0.18) + k * 1.3) * H * 0.055;
        x ? cx.lineTo(x, y) : cx.moveTo(x, y);
      }
      cx.strokeStyle = 'rgba(40,150,255,' + (0.025 + k * 0.008) + ')';
      cx.stroke();
    }
    for (const p of PT) {
      const y = ((p.y - t * p.s * 1e-5) % 1 + 1) % 1;
      cx.beginPath();
      cx.arc(p.x * W, y * H, p.r * D, 0, 7);
      cx.fillStyle = 'rgba(90,200,255,.12)';
      cx.fill();
    }
  }

  function loop(ts) {
    if (!animRunning) return;
    draw(ts);
    requestAnimationFrame(loop);
  }

  let Q = [], transitionFired = false, motionCompleted = false;
  const at = (ms, f) => Q.push(setTimeout(f, ms));

  function fin() {
    const els = getElements();
    Q.forEach(clearTimeout);
    Q = [];
    els.letters.forEach(l => l.classList.add('on'));
    if (els.wm) els.wm.classList.add('dn');
    if (els.mk) els.mk.classList.add('in', 'g');
    if (els.ld) els.ld.style.opacity = '1';
  }

  function finishAndOpenWorkspace() {
    if (transitionFired) return;
    transitionFired = true;
    fin();
    const els = getElements();
    if (els.screen) {
      els.screen.classList.add('fade-out');
      setTimeout(() => {
        els.screen.style.display = 'none';
        animRunning = false;
        // Open Workspace Dashboard
        if (typeof window.openProjectDashboard === 'function') {
          window.openProjectDashboard();
        } else {
          window.mashimurelayNeedsInitialDashboard = true;
          window.dispatchEvent(new CustomEvent('mashimurelay:open-workspace'));
        }
      }, 450);
    }
  }

  function run() {
    const els = getElements();
    Q.forEach(clearTimeout);
    Q = [];
    transitionFired = false;
    motionCompleted = false;
    animRunning = true;
    requestAnimationFrame(loop);

    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      finishAndOpenWorkspace();
      return;
    }

    // Letters cascade (150ms start, 50ms per letter: 150ms - 750ms)
    els.letters.slice(0, 12).forEach((l, i) => at(150 + i * 50, () => { l.classList.add('on'); S.l(i); }));
    // TM badge pops in (850ms)
    at(850, () => { if (els.letters[12]) els.letters[12].classList.add('on'); S.pop(); });
    // Wordmark shifts down (1050ms)
    at(1050, () => { if (els.wm) els.wm.classList.add('dn'); S.whoosh(); });
    // Monogram M emerges with unblur, spring scale, and sound (1250ms)
    at(1250, () => { if (els.mk) els.mk.classList.add('in'); S.zap(); });
    // Progress bar shines (1600ms)
    at(1600, () => { if (els.ld) els.ld.style.opacity = '1'; });
    // Ambient breathing glow (1750ms)
    at(1750, () => { if (els.mk) els.mk.classList.add('g'); });
    // Motion completes at 2200ms -> Mark complete
    at(2200, () => { motionCompleted = true; });
    // HOLD 1.2s -> Finish at 3400ms!
    at(3400, () => {
      finishAndOpenWorkspace();
    });
  }

  // Quick skip on Escape key or on click during the 1.2s hold duration
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !transitionFired) {
      finishAndOpenWorkspace();
    }
  });
  window.addEventListener('pointerdown', e => {
    const els = getElements();
    if (els.screen && els.screen.contains(e.target) && motionCompleted && !transitionFired) {
      finishAndOpenWorkspace();
    }
  });

  function start() {
    fit();
    rs();
    window.addEventListener('resize', () => { fit(); rs(); });
    getAudioContext();
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.MashimurelayLoader = {
    run,
    fin,
    finishAndOpenWorkspace
  };
})();
