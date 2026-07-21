/* =================================================================
   ZEN HOBİ SANAT — Motion (motion.dev) micro-interactions
   Framer Motion lineage, vanilla build. Progressive enhancement.

   Scope is deliberately separated from GSAP (main.js):
   GSAP owns  x / y  (translate) on .btn--lg + parallax + pin.
   Motion owns  scale  + entrance of elements GSAP never touches.
   No two libraries write the same transform channel on the same node.
   ================================================================= */
(function () {
  "use strict";

  var M = window.Motion;
  if (!M || typeof M.animate !== "function") return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };

  /* Framer-Motion-style springs -------------------------------------------- */
  var springSoft = M.spring({ stiffness: 220, damping: 20, mass: 1 });   // hover
  var springSnap = M.spring({ stiffness: 480, damping: 26, mass: 1 });   // press

  function animate(el, keyframes, easing) {
    return M.animate(el, keyframes, { easing: easing });
  }

  /* -----------------------------------------------------------------------
     whileHover + whileTap  (the Framer Motion signature)
     hover  → lift + gentle grow
     press  → scale down, spring back on release
     ----------------------------------------------------------------------- */
  function gesture(el, opts) {
    opts = opts || {};
    var lift = opts.lift == null ? -6 : opts.lift;   // px
    var grow = opts.grow == null ? 1.03 : opts.grow; // hover scale
    var tap = opts.tap == null ? 0.96 : opts.tap;    // press scale
    var hovering = false;

    if (!isTouch) {
      el.addEventListener("pointerenter", function () {
        hovering = true;
        animate(el, { y: lift, scale: grow }, springSoft);
      });
      el.addEventListener("pointerleave", function () {
        hovering = false;
        animate(el, { y: 0, scale: 1 }, springSoft);
      });
    }

    var release = function () {
      animate(el, { scale: hovering ? grow : 1, y: hovering ? lift : 0 }, springSnap);
    };
    el.addEventListener("pointerdown", function () {
      animate(el, { scale: tap }, springSnap);
    });
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
  }

  /* Cards — the biggest Framer-Motion moment on the page */
  $$(".course-card").forEach(function (el) { gesture(el, { lift: -8, grow: 1.02, tap: 0.985 }); });
  $$(".quote-card").forEach(function (el) { gesture(el, { lift: -6, grow: 1.015, tap: 0.99 }); });
  $$(".feature").forEach(function (el) { gesture(el, { lift: -4, grow: 1.01, tap: 0.995 }); });

  /* Gallery + Instagram tiles — playful pop */
  $$(".g-card").forEach(function (el) { gesture(el, { lift: -6, grow: 1.04, tap: 0.97 }); });
  $$(".insta-tiles a").forEach(function (el) { gesture(el, { lift: 0, grow: 1.06, tap: 0.95 }); });

  /* Buttons GSAP does NOT own (magnetic handles .btn--lg) → tactile press only */
  $$(".btn:not(.btn--lg):not([data-magnetic]), .link-arrow").forEach(function (el) {
    gesture(el, { lift: 0, grow: 1.03, tap: 0.94 });
  });

  /* Floating WhatsApp bubble — springy press */
  $$(".wa-float").forEach(function (el) { gesture(el, { lift: 0, grow: 1.08, tap: 0.9 }); });

  /* -----------------------------------------------------------------------
     inView entrance — staggered, spring-eased.
     Only for nodes GSAP / the CSS reveal system does NOT already handle.
     ----------------------------------------------------------------------- */
  if (typeof M.inView === "function") {
    var galCards = $$(".g-rail .g-card");
    if (galCards.length) {
      galCards.forEach(function (el) { el.style.opacity = "0"; });
      M.inView(".g-rail", function (info) {
        M.animate(
          galCards,
          { opacity: [0, 1], transform: ["translateY(26px) scale(.96)", "none"] },
          { delay: M.stagger(0.07), duration: 0.7, easing: [0.22, 1, 0.36, 1] }
        );
        return function () {}; // run once
      }, { amount: 0.15 });
    }
  }

  /* -----------------------------------------------------------------------
     Page fade-out on internal navigation.
     A cream-coloured curtain fades in, then we navigate — the next page,
     sharing the same background, appears seamlessly beneath it.
     ----------------------------------------------------------------------- */
  (function () {
    var curtain = document.createElement("div");
    curtain.className = "page-curtain";
    document.body.appendChild(curtain);

    // bfcache / back-forward: make sure the curtain is never left covering the page
    window.addEventListener("pageshow", function () {
      M.animate(curtain, { opacity: [null, 0] }, { duration: 0.35, easing: "ease-out" })
        .finished.then(function () { curtain.style.pointerEvents = "none"; });
    });

    function isPlainLeftClick(e) {
      return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    }

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || !isPlainLeftClick(e)) return;
      var a = e.target.closest("a");
      if (!a) return;

      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;                 // anchor / no-op
      if (a.target && a.target !== "_self") return;                // new tab / frame
      if (a.hasAttribute("download")) return;

      var url;
      try { url = new URL(a.href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;           // external site
      if (/^(mailto:|tel:|whatsapp:)/i.test(url.protocol)) return; // handled by OS
      // same document (pure hash change) → let the browser scroll
      if (url.pathname === window.location.pathname && url.hash) return;

      e.preventDefault();
      curtain.style.pointerEvents = "auto";
      var done = false;
      var go = function () { if (!done) { done = true; window.location.href = a.href; } };

      M.animate(curtain, { opacity: [0, 1] }, { duration: 0.34, easing: [0.4, 0, 0.2, 1] })
        .finished.then(go);
      // hard fallback so navigation never stalls if the animation is interrupted
      setTimeout(go, 500);
    });
  })();
})();
