/* =================================================================
   ZEN HOBİ SANAT — interactions & motion
   ================================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- current year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- inject footer quick-registration form ---------- */
  (function () {
    var footer = $(".site-footer .wrap-wide");
    var grid = footer && $(".footer-grid", footer);
    if (!footer || !grid || $(".footer-form-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "footer-form-wrap";
    wrap.innerHTML =
      '<div class="ff-copy">' +
        '<h3>Kayıt &amp; Bilgi</h3>' +
        '<p>Size en uygun atölye, gün ve saati birlikte planlayalım. Kayıt formunu doldurun ya da WhatsApp\'tan yazın.</p>' +
      '</div>' +
      '<div class="ff-actions">' +
        '<a class="btn" href="kayit.html">Kayıt Formuna Git</a>' +
        '<a class="btn btn--gold-line" href="https://wa.me/905444034266?text=Merhaba%2C%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener">WhatsApp\'tan Yazın</a>' +
      '</div>';
    footer.insertBefore(wrap, grid);
  })();

  /* ---------- header scroll state ---------- */
  var header = $(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 30);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var toggle = $(".nav-toggle");
  var body = document.body;
  if (toggle) {
    // inject scrim
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);
    var closeNav = function () {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    scrim.addEventListener("click", closeNav);
    $$(".nav-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        // allow submenu parents to behave; close on real navigation
        if (a.getAttribute("href") && a.getAttribute("href") !== "#") closeNav();
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- scroll reveal (IntersectionObserver) ---------- */
  var revealEls = $$("[data-reveal], .reveal-line");
  revealEls.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", (parseInt(d, 10) * 110) + "ms");
  });
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach(function (item) {
    var q = $(".faq-q", item);
    var a = $(".faq-a", item);
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      // close siblings in same faq group
      var group = item.closest(".faq");
      if (group) $$(".faq-item.open", group).forEach(function (it) {
        if (it !== item) { it.classList.remove("open"); $(".faq-q", it).setAttribute("aria-expanded", "false"); $(".faq-a", it).style.height = "0px"; }
      });
      if (open) {
        item.classList.remove("open");
        q.setAttribute("aria-expanded", "false");
        a.style.height = "0px";
      } else {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        a.style.height = a.scrollHeight + "px";
      }
    });
  });
  window.addEventListener("resize", function () {
    $$(".faq-item.open .faq-a").forEach(function (a) { a.style.height = a.scrollHeight + "px"; });
  });

  /* ---------- drag-scroll horizontal rails ---------- */
  $$(".g-rail").forEach(function (rail) {
    var down = false, startX = 0, startScroll = 0, moved = false;
    rail.addEventListener("pointerdown", function (e) {
      down = true; moved = false; startX = e.clientX; startScroll = rail.scrollLeft;
      rail.classList.add("dragging"); rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      rail.scrollLeft = startScroll - dx;
    });
    var up = function () { down = false; rail.classList.remove("dragging"); };
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
    rail.addEventListener("pointerleave", up);
    rail.addEventListener("click", function (e) { if (moved) { e.preventDefault(); } }, true);
  });

  /* ---------- mini slider (auto fade) ---------- */
  $$("[data-slider]").forEach(function (slider) {
    var slides = $$(".ms-slide", slider);
    var dots = $$(".ms-dots button", slider);
    if (slides.length < 2) return;
    var i = 0, timer;
    var go = function (n) {
      slides[i].classList.remove("is-active");
      if (dots[i]) dots[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active");
      if (dots[i]) dots[i].classList.add("is-active");
    };
    dots.forEach(function (d, n) { d.addEventListener("click", function () { go(n); restart(); }); });
    var restart = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(i + 1); }, 4500); };
    restart();
  });

  /* ---------- form handler (real AJAX submit) ---------- */
  $$("form[data-form]").forEach(function (form) {
    // build an error line once
    var errEl = $(".form-error", form);
    if (!errEl) {
      errEl = document.createElement("div");
      errEl.className = "form-error";
      errEl.setAttribute("role", "alert");
      form.insertBefore(errEl, form.firstChild);
    }
    var restore = function (btn) {
      if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Gönder"; }
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errEl.classList.remove("show");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var msg = $(".form-success", form);
      var btn = $("button[type=submit]", form);
      if (btn) { btn.disabled = true; btn.textContent = "Gönderiliyor…"; }

      var action = form.getAttribute("action") || "";
      // no real endpoint configured → graceful demo success
      if (!action || /YOUR_FORM_ID/i.test(action)) {
        setTimeout(function () {
          if (msg) { msg.classList.add("show"); }
          form.reset(); restore(btn);
          if (msg) msg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        }, 700);
        return;
      }

      fetch(action, {
        method: (form.getAttribute("method") || "POST").toUpperCase(),
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (r) {
          if (r.ok && (r.data.success === undefined || r.data.success)) {
            if (msg) { msg.classList.add("show"); }
            form.reset();
            if (msg) msg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
          } else {
            throw new Error((r.data && r.data.message) || "Gönderilemedi");
          }
        })
        .catch(function () {
          errEl.textContent = "Gönderilirken bir sorun oluştu. Lütfen tekrar deneyin ya da WhatsApp'tan yazın: 0544 403 42 66";
          errEl.classList.add("show");
          errEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        })
        .then(function () { restore(btn); });
    });
  });

  /* ---------- pause offscreen videos (perf) ---------- */
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.2 });
    $$("video[data-autoplay]").forEach(function (v) { vio.observe(v); });
  }

  /* =================================================================
     GSAP-powered motion (progressive enhancement)
     ================================================================= */
  if (hasGSAP && !reduce) {
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    /* hero entrance */
    var heroBits = $$(".hero-inner [data-hero]");
    if (heroBits.length) {
      gsap.set(heroBits, { y: 28, opacity: 0 });
      gsap.to(heroBits, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.15 });
    }

    if (window.ScrollTrigger) {
      /* hero media parallax */
      var heroMedia = $(".hero-media video, .hero-media img");
      if (heroMedia) {
        gsap.to(heroMedia, {
          yPercent: 14, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
      }

      /* generic media parallax */
      $$("[data-parallax]").forEach(function (el) {
        var amt = parseFloat(el.getAttribute("data-parallax")) || 10;
        gsap.fromTo(el, { yPercent: -amt }, {
          yPercent: amt, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      /* pinned process */
      var stage = $(".process-stage");
      var steps = $$(".process-step");
      if (stage && steps.length) {
        gsap.set(steps, { autoAlpha: 0 });
        gsap.set(steps[0], { autoAlpha: 1 });
        steps.forEach(function (s, n) { if (n > 0) gsap.set(s, { position: "absolute", inset: 0 }); });
        steps[0].style.position = "absolute"; steps[0].style.inset = "0";
        stage.style.position = "relative"; stage.style.height = "100svh";

        var prog = $(".process-progress span");
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".process-pin", start: "top top",
            end: "+=" + (steps.length * 100) + "%", scrub: 0.6, pin: true,
            onUpdate: function (self) { if (prog) prog.style.width = (self.progress * 100) + "%"; }
          }
        });
        steps.forEach(function (s, n) {
          if (n === 0) return;
          tl.to(steps[n - 1], { autoAlpha: 0, duration: 0.4 }, n);
          tl.fromTo(s, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4 }, n);
        });
      }

      /* headline word/letter subtle rise handled by reveal-line via CSS */
    }

    /* magnetic buttons (desktop, fine pointer) */
    if (!isTouch) {
      $$("[data-magnetic], .btn--lg").forEach(function (btn) {
        var strength = 0.32;
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          var x = e.clientX - r.left - r.width / 2;
          var y = e.clientY - r.top - r.height / 2;
          gsap.to(btn, { x: x * strength, y: y * strength, duration: 0.5, ease: "power3.out" });
        });
        btn.addEventListener("mouseleave", function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
        });
      });
    }
  }

  /* =================================================================
     custom cursor (desktop only, independent of GSAP)
     ================================================================= */
  if (!isTouch && !reduce) {
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });
    var raf = function () {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    var hoverSel = "a, button, [data-magnetic], .course-card, .g-card, .tile-link";
    $$(hoverSel).forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
  }
})();
