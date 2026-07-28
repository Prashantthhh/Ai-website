/* ============================================================
   NEUFORM — Unified Architecture
   Vanilla JS: topology canvas, preloader, reveals, counters
   ============================================================ */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader");
  const preloaderCount = document.getElementById("preloaderCount");
  const preloaderFill = document.getElementById("preloaderFill");

  function finishPreload() {
    preloader.classList.add("done");
    document.querySelectorAll(".hero .line-mask").forEach(m => m.parentElement.classList.add("lines-in"));
    document.querySelectorAll(".hero .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 350 + i * 120);
    });
    startCounters(document.querySelector(".hero-metrics"));
  }

  if (prefersReduced) {
    finishPreload();
  } else {
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.ceil(Math.random() * 14));
      preloaderCount.textContent = String(p).padStart(2, "0");
      preloaderFill.style.width = p + "%";
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(finishPreload, 350);
      }
    }, 90);
  }

  /* ---------- Topology canvas (hero) ----------
     Distributed nodes drift, connect, and orbit toward a
     central core — "networks collapsing into a cohesive framework". */
  const canvas = document.getElementById("topologyCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, DPR, nodes = [], mouse = { x: -9999, y: -9999 };

  const NODE_COUNT = () => Math.min(110, Math.floor(window.innerWidth / 14));
  const LINK_DIST = 130;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeNodes() {
    nodes = [];
    const n = NODE_COUNT();
    for (let i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.44;

    for (const p of nodes) {
      // gentle pull toward the core
      const dx = cx - p.x, dy = cy - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      p.vx += (dx / dist) * 0.0022;
      p.vy += (dy / dist) * 0.0022;

      // orbital swirl
      p.vx += (-dy / dist) * 0.0035;
      p.vy += (dx / dist) * 0.0035;

      // mouse repulsion
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist < 140) {
        p.vx += (mdx / mdist) * 0.06;
        p.vy += (mdy / mdist) * 0.06;
      }

      // damping + speed cap
      p.vx *= 0.992; p.vy *= 0.992;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 0.9) { p.vx = (p.vx / sp) * 0.9; p.vy = (p.vy / sp) * 0.9; }

      p.x += p.vx; p.y += p.vy;

      // soft wrap
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.16;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const p of nodes) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // core ring
    const t = performance.now() / 1000;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 60 + Math.sin(t * 0.8) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.arc(cx, cy, 110 + Math.cos(t * 0.6) * 6, 0, Math.PI * 2);
    ctx.stroke();

    requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  if (!prefersReduced) requestAnimationFrame(step);

  window.addEventListener("resize", () => { resize(); makeNodes(); });
  window.addEventListener("pointermove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  /* ---------- Nav ---------- */
  const nav = document.getElementById("nav");
  const progressFill = document.getElementById("scrollProgressFill");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressFill.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }, { passive: true });

  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });
  mobileMenu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      mobileMenu.classList.remove("open");
    })
  );

  /* ---------- Scroll reveals ---------- */
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        const masks = entry.target.querySelectorAll(".line-mask");
        if (masks.length) entry.target.classList.add("lines-in");
        startCounters(entry.target);
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal, .card, .contact-inner").forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  function startCounters(scope) {
    if (!scope) return;
    scope.querySelectorAll("[data-count]").forEach(el => {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const dur = 1600;
      const t0 = performance.now();
      if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }
      (function frame(now) {
        const k = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (k < 1) requestAnimationFrame(frame);
      })(t0);
    });
  }

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let rx = 0, ry = 0, tx = 0, ty = 0;

  window.addEventListener("pointermove", e => {
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
  });

  (function cursorLoop() {
    rx += (tx - rx) * 0.16;
    ry += (ty - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(cursorLoop);
  })();

  document.querySelectorAll("a, button, [data-hover]").forEach(el => {
    el.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
  });

  /* ---------- Card tilt ---------- */
  if (!prefersReduced && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-4px) rotateX(${-py * 4}deg) rotateY(${px * 4}deg)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
