/* =========================================================
   ZEKRA — app logic (vanilla JS, no build step)
   ========================================================= */
(function () {
  "use strict";

  const D = window.ZEKRA_DATA;
  const I18N = window.ZEKRA_I18N;
  const ICONS = window.ZEKRA_ICONS;

  // ---------- State ----------
  const DEFAULT = {
    lang: "ar",
    theme: "dark",
    onboarded: false,
    points: 120,
    bookings: [],
    budget: { total: 0, occasion: null, expenses: [] },
    checklist: { occasion: null, done: [] }
  };
  let store = load();

  function load() {
    try {
      const raw = localStorage.getItem("zekra_state");
      if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() {
    try { localStorage.setItem("zekra_state", JSON.stringify(store)); } catch (e) {}
  }

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const t = (k) => (I18N[store.lang] && I18N[store.lang][k]) || k;
  const L = (o) => (store.lang === "ar" ? o.ar : o.en);
  const view = () => document.getElementById("view");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function icon(name, cls) {
    return `<svg class="${cls || "ic"}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  }
  function money(n) {
    return Number(n || 0).toLocaleString(store.lang === "ar" ? "ar-EG" : "en-US");
  }
  function serviceById(id) { return D.services.find((s) => s.id === id); }
  function categoryById(id) { return D.categories.find((c) => c.id === id); }
  function vendorById(id) { return D.vendors.find((v) => v.id === id); }
  function grad(arr) { return `linear-gradient(135deg, ${arr[0]}, ${arr[1]})`; }

  function vThumb(v, cls) {
    const s = serviceById(v.service);
    return `<div class="${cls}" style="background:${grad(v.grad)}">${icon(s ? s.icon : "star")}</div>`;
  }

  // ---------- Router ----------
  let stack = [];
  let current = null;

  function go(name, params, replace) {
    if (current && !replace) stack.push(current);
    current = { name, params: params || {} };
    render();
  }
  function back() {
    const prev = stack.pop();
    current = prev || { name: "home", params: {} };
    render();
  }

  const MAIN_TABS = ["home", "explore", "bot", "bookings", "profile"];

  function render() {
    const root = view();
    root.innerHTML = SCREENS[current.name] ? SCREENS[current.name](current.params) : SCREENS.home();
    renderNav();
    // bind after render
    if (BIND[current.name]) BIND[current.name](current.params);
    root.scrollTop = 0;
  }

  // ---------- Bottom nav ----------
  function renderNav() {
    const nav = document.getElementById("bottom-nav");
    const hidden = ["detail", "budget", "checklist"].includes(current.name);
    nav.style.display = hidden ? "none" : "flex";
    if (hidden) return;
    const items = [
      { id: "home", ic: "home", label: t("navHome") },
      { id: "explore", ic: "compass", label: t("navExplore") },
      { id: "bot", ic: "spark", label: t("navBot"), center: true },
      { id: "bookings", ic: "calendar", label: t("navBookings") },
      { id: "profile", ic: "user", label: t("navProfile") }
    ];
    nav.innerHTML = items.map((it) => {
      const active = current.name === it.id ? "active" : "";
      if (it.center) {
        return `<button class="nav-item center ${active}" data-tab="${it.id}">
          <span class="nav-fab">${icon(it.ic)}</span><span>${it.label}</span></button>`;
      }
      return `<button class="nav-item ${active}" data-tab="${it.id}">${icon(it.ic)}<span>${it.label}</span></button>`;
    }).join("");
    nav.querySelectorAll("[data-tab]").forEach((b) => {
      b.onclick = () => { stack = []; go(b.dataset.tab, {}, true); };
    });
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---------- Bottom sheet ----------
  function openSheet(html) {
    const root = document.getElementById("sheet-root");
    root.innerHTML = `<div class="sheet-backdrop"><div class="sheet">
      <div class="sheet-grab"></div>${html}</div></div>`;
    const bd = $(".sheet-backdrop", root);
    requestAnimationFrame(() => bd.classList.add("show"));
    bd.addEventListener("click", (e) => { if (e.target === bd) closeSheet(); });
    return root;
  }
  function closeSheet() {
    const bd = $(".sheet-backdrop");
    if (!bd) return;
    bd.classList.remove("show");
    setTimeout(() => { document.getElementById("sheet-root").innerHTML = ""; }, 260);
  }

  // ======================================================
  //  SCREENS
  // ======================================================
  const SCREENS = {};
  const BIND = {};

  // ---------- HOME ----------
  SCREENS.home = function () {
    const h = new Date().getHours();
    const greet = h < 17 ? t("greetingMorning") : t("greetingEvening");
    const occasions = D.categories.map((c) => `
      <button class="occasion-card" data-occasion="${c.id}" style="background:${grad(c.grad)}">
        <div class="oc-ic">${icon(c.icon)}</div>
        <span>${L(c)}</span>
      </button>`).join("");

    const featured = D.vendors.slice().sort((a, b) => b.reviews - a.reviews).slice(0, 6).map(featCard).join("");
    const topRated = D.vendors.slice().sort((a, b) => b.rating - a.rating).slice(0, 4).map(vendorCard).join("");

    return `<div class="screen">
      <header class="app-header">
        <div class="head-titles">
          <div class="greet">${greet} 👋</div>
          <h1>${t("planningQ")}</h1>
        </div>
        <button class="head-icon-btn" data-open="profile">${icon("user")}</button>
      </header>

      <button class="search-bar" data-tab="explore" style="width:100%">
        ${icon("search")}<span style="color:var(--text-3);font-size:.95rem">${t("searchPh")}</span>
      </button>

      <div class="section-head"><h3>${t("occasions")}</h3></div>
      <div class="h-scroll">${occasions}</div>

      <div class="section-head"><h3>${t("quickTools")}</h3></div>
      <div class="tools-grid">
        <button class="tool-card hero wide" data-tab="bot">
          <div class="t-ic">${icon("spark")}</div>
          <div class="t-txt"><div class="t-title">${t("aiBot")}</div><div class="t-sub">${t("aiBotSub")}</div></div>
          <span class="chev">${icon("chevron")}</span>
        </button>
        <button class="tool-card" data-open="budget">
          <div class="t-ic">${icon("wallet")}</div>
          <div class="t-title">${t("budgetTool")}</div><div class="t-sub">${t("budgetSub")}</div>
        </button>
        <button class="tool-card" data-open="checklist">
          <div class="t-ic">${icon("list")}</div>
          <div class="t-title">${t("checklistTool")}</div><div class="t-sub">${t("checklistSub")}</div>
        </button>
      </div>

      <div class="section-head"><h3>${t("featured")}</h3>
        <button class="link" data-tab="explore">${t("seeAll")}</button></div>
      <div class="h-scroll">${featured}</div>

      <div class="section-head"><h3>${t("topRated")}</h3>
        <button class="link" data-tab="explore">${t("seeAll")}</button></div>
      ${topRated}
      <div class="spacer-24"></div>
    </div>`;
  };
  BIND.home = function () {
    view().querySelectorAll("[data-occasion]").forEach((b) =>
      b.onclick = () => go("explore", { occasion: b.dataset.occasion }));
    bindCommon();
  };

  function featCard(v) {
    const s = serviceById(v.service);
    return `<button class="feat-card" data-vendor="${v.id}">
      <div class="feat-thumb" style="background:${grad(v.grad)}">
        ${icon(s ? s.icon : "star")}
        <span class="badge">${L(s)}</span>
      </div>
      <div class="feat-body">
        <div class="v-name">${esc(L(v))}</div>
        <div class="v-meta">${L(D.areas[v.area])}</div>
        <div class="v-bottom">
          <span class="v-price"><span class="from">${t("startingFrom")}</span>${money(v.price)} ${t("egp")}${v.unitAr ? `<small> ${store.lang==="ar"?v.unitAr:v.unitEn}</small>` : ""}</span>
          <span class="v-rating">${icon("star")}${v.rating}</span>
        </div>
      </div>
    </button>`;
  }

  function vendorCard(v) {
    const s = serviceById(v.service);
    return `<button class="vendor-card" data-vendor="${v.id}">
      ${vThumb(v, "vendor-thumb")}
      <div class="vendor-info">
        <div class="v-name">${esc(L(v))}</div>
        <div class="v-meta">${icon("pin")} ${L(D.areas[v.area])} · ${L(s)}</div>
        <div class="v-bottom">
          <span class="v-price"><span class="from">${t("startingFrom")}</span>${money(v.price)} ${t("egp")}${v.unitAr ? `<small> ${store.lang==="ar"?v.unitAr:v.unitEn}</small>` : ""}</span>
          <span class="v-rating">${icon("star")}${v.rating} <small style="color:var(--text-3);font-weight:500">(${v.reviews})</small></span>
        </div>
      </div>
    </button>`;
  }

  // ---------- EXPLORE ----------
  SCREENS.explore = function (params) {
    const svc = params.service || "all";
    const bud = params.budget || "all";
    const occ = params.occasion || null;
    const q = params.q || "";

    let list = D.vendors.slice();
    if (occ) list = list.filter((v) => v.tags.includes(occ));
    if (svc !== "all") list = list.filter((v) => v.service === svc);
    if (bud !== "all") list = list.filter((v) => v.budget === bud);
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter((v) => (v.ar + v.en + L(serviceById(v.service))).toLowerCase().includes(qq));
    }

    const svcChips = [`<button class="chip ${svc === "all" ? "active" : ""}" data-svc="all">${t("allServices")}</button>`]
      .concat(D.services.map((s) => `<button class="chip ${svc === s.id ? "active" : ""}" data-svc="${s.id}">${L(s)}</button>`)).join("");
    const budChips = [`<button class="chip ${bud === "all" ? "active" : ""}" data-bud="all">${t("budget")}</button>`]
      .concat(D.budgets.map((b) => `<button class="chip ${bud === b.id ? "active" : ""}" data-bud="${b.id}">${L(b)}</button>`)).join("");

    const occTitle = occ ? " · " + L(categoryById(occ)) : "";

    return `<div class="screen">
      <header class="app-header">
        <div class="head-titles"><h1>${t("navExplore")}${occTitle}</h1></div>
      </header>
      <div class="search-bar">
        ${icon("search")}
        <input id="searchInput" type="text" placeholder="${t("searchPh")}" value="${esc(q)}">
      </div>
      <div class="chips-row">${svcChips}</div>
      <div class="chips-row">${budChips}</div>
      <div class="results-count">${list.length} ${t("resultsFound")}</div>
      ${list.length ? list.map(vendorCard).join("") : emptyState("compass", t("noResults"))}
      <div class="spacer-24"></div>
    </div>`;
  };
  BIND.explore = function (params) {
    const p = Object.assign({ service: "all", budget: "all", occasion: null, q: "" }, params);
    view().querySelectorAll("[data-svc]").forEach((b) =>
      b.onclick = () => go("explore", Object.assign({}, p, { service: b.dataset.svc }), true));
    view().querySelectorAll("[data-bud]").forEach((b) =>
      b.onclick = () => go("explore", Object.assign({}, p, { budget: b.dataset.bud }), true));
    const inp = $("#searchInput");
    if (inp) {
      let ti;
      inp.oninput = () => {
        clearTimeout(ti);
        const val = inp.value;
        ti = setTimeout(() => {
          const pos = inp.selectionStart;
          go("explore", Object.assign({}, p, { q: val }), true);
          const ni = $("#searchInput"); if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (e) {} }
        }, 250);
      };
    }
    bindCommon();
  };

  // ---------- VENDOR DETAIL ----------
  const REVIEWS_POOL = [
    { n: "Mariam", ar: "خدمة راقية وتعامل محترم، تجربة تستاهل.", en: "Elegant service and lovely people — worth it." },
    { n: "Ahmed", ar: "التزام في المواعيد والنتيجة فاقت توقعاتي.", en: "On time and the result exceeded my expectations." },
    { n: "Hana", ar: "أسعار عادلة وجودة ممتازة، رشحتهم لكل صحابي.", en: "Fair prices and great quality, recommended to everyone." },
    { n: "Youssef", ar: "تنظيم رائع من أول تواصل لآخر لحظة.", en: "Brilliant organization from first contact to the end." }
  ];

  SCREENS.detail = function (params) {
    const v = vendorById(params.id);
    if (!v) return SCREENS.home();
    const s = serviceById(v.service);
    const already = store.bookings.some((b) => b.vendorId === v.id);
    const unit = v.unitAr ? ` <small style="font-size:.8rem;color:var(--text-3)">${store.lang === "ar" ? v.unitAr : v.unitEn}</small>` : "";

    const packages = [
      { name: store.lang === "ar" ? "أساسي" : "Basic", desc: store.lang === "ar" ? "الباقة المبدئية" : "Starter package", mult: 1 },
      { name: store.lang === "ar" ? "مميز" : "Standard", desc: store.lang === "ar" ? "الأكثر اختياراً" : "Most popular", mult: 1.6 },
      { name: store.lang === "ar" ? "بريميم" : "Premium", desc: store.lang === "ar" ? "كل شيء شامل" : "All inclusive", mult: 2.4 }
    ].map((p) => `<div class="pkg"><div><div class="pk-name">${p.name}</div><div class="pk-desc">${p.desc}</div></div>
      <div class="pk-price">${money(Math.round(v.price * p.mult))} ${t("egp")}</div></div>`).join("");

    const reviews = REVIEWS_POOL.slice(0, 3).map((r) => `<div class="review-item">
      <div class="review-head">
        <div class="review-avatar">${r.n[0]}</div>
        <div><div class="review-name">${r.n}</div></div>
        <div class="review-stars">★★★★★</div>
      </div>
      <p>${store.lang === "ar" ? r.ar : r.en}</p></div>`).join("");

    return `<div class="screen no-nav">
      <div class="detail-hero" style="background:${grad(v.grad)}">
        <button class="back-btn" data-back>${icon("back")}</button>
        ${icon(s ? s.icon : "star", "ic dh-ic")}
      </div>
      <div class="detail-card">
        <div class="detail-title-row">
          <div>
            <h2>${esc(L(v))}</h2>
            <div class="detail-sub">${icon("pin")} ${L(D.areas[v.area])} · ${L(s)}
              <span class="badge">${L(D.budgets.find((b) => b.id === v.budget))}</span></div>
          </div>
          <span class="v-rating" style="font-size:1rem">${icon("star")}${v.rating}</span>
        </div>

        <div class="detail-price-box">
          <div><div class="from">${t("startingFrom")}</div><div class="amt">${money(v.price)} ${t("egp")}${unit}</div></div>
          <div class="v-rating" style="font-size:.82rem;color:var(--text-2)"><span>${v.reviews} ${t("reviewsWord")}</span></div>
        </div>

        <div class="detail-section"><h4>${t("about")}</h4><p>${store.lang === "ar" ? v.descAr : v.descEn}</p></div>
        <div class="detail-section"><h4>${t("packages")}</h4>${packages}</div>
        <div class="detail-section"><h4>${t("reviewsTitle")}</h4>${reviews}</div>
      </div>

      <div class="book-bar">
        <button class="btn btn-ghost" data-add-plan="${v.id}">${icon("plus")} ${t("addToPlan")}</button>
        <button class="btn ${already ? "btn-primary booked" : "btn-primary"}" data-book="${v.id}">
          ${already ? t("booked") : t("book")}</button>
      </div>
    </div>`;
  };
  BIND.detail = function () {
    view().querySelector("[data-back]").onclick = back;
    const bookBtn = view().querySelector("[data-book]");
    bookBtn.onclick = () => {
      const id = bookBtn.dataset.book;
      if (store.bookings.some((b) => b.vendorId === id)) { go("bookings", {}, true); stack = []; return; }
      const date = new Date(Date.now() + (14 + Math.floor(Math.random() * 40)) * 86400000);
      store.bookings.push({ id: "b" + Date.now(), vendorId: id, date: date.toISOString(), status: Math.random() > 0.5 ? "confirmed" : "pending" });
      store.points += 50;
      save();
      toast(t("thanksBooking"));
      render();
    };
    const planBtn = view().querySelector("[data-add-plan]");
    if (planBtn) planBtn.onclick = () => {
      const v = vendorById(planBtn.dataset.addPlan);
      store.budget.expenses.push({ id: "e" + Date.now(), name: L(v), amount: v.price });
      if (!store.budget.occasion && v.tags[0]) store.budget.occasion = v.tags[0];
      save();
      toast(store.lang === "ar" ? "تمت الإضافة للميزانية ✓" : "Added to budget ✓");
    };
  };

  // ---------- BOT ----------
  let convo = null; // {messages:[], step, answers}
  const BUDGET_OPTS = [
    { ar: "أقل من ١٥ ألف", en: "Under 15k", val: 12000, tier: "low" },
    { ar: "١٥ – ٥٠ ألف", en: "15k – 50k", val: 35000, tier: "medium" },
    { ar: "٥٠ – ١٠٠ ألف", en: "50k – 100k", val: 75000, tier: "premium" },
    { ar: "أكتر من ١٠٠ ألف", en: "100k+", val: 150000, tier: "premium" }
  ];
  const GUEST_OPTS = [
    { ar: "أقل من ٥٠", en: "Under 50", val: 40 },
    { ar: "٥٠ – ١٥٠", en: "50 – 150", val: 100 },
    { ar: "١٥٠ – ٣٠٠", en: "150 – 300", val: 220 },
    { ar: "أكتر من ٣٠٠", en: "300+", val: 400 }
  ];
  const DATE_OPTS = [
    { ar: "خلال شهر", en: "Within a month" },
    { ar: "خلال ٣ شهور", en: "In 3 months" },
    { ar: "خلال ٦ شهور", en: "In 6 months" },
    { ar: "بعد سنة", en: "In a year" }
  ];

  function initConvo() {
    convo = { messages: [{ from: "bot", text: t("botHello") }], step: "occasion", answers: {} };
  }

  SCREENS.bot = function () {
    if (!convo) initConvo();
    return `<div class="screen screen-chat">
      <header class="app-header" style="background:transparent">
        <div class="head-titles"><div class="greet">ZEKRA</div><h1>${t("aiBot")}</h1></div>
        <button class="head-icon-btn" data-restart title="${t("restart")}">${icon("spark")}</button>
      </header>
      <div class="chat-wrap">
        <div class="chat-scroll" id="chatScroll">${convo.messages.map(renderMsg).join("")}</div>
        <div id="quickReplies"></div>
        <div class="chat-input-bar">
          <input id="chatInput" type="text" placeholder="${t("typeMsg")}">
          <button class="chat-send" id="chatSend">${icon("send")}</button>
        </div>
      </div>
    </div>`;
  };

  function renderMsg(m) {
    if (m.rich) return `<div class="msg bot rich">${m.text}</div>`;
    return `<div class="msg ${m.from}">${m.text}</div>`;
  }

  BIND.bot = function () {
    const scroll = $("#chatScroll");
    const scrollDown = () => { scroll.scrollTop = scroll.scrollHeight; };
    scrollDown();

    $("[data-restart]").onclick = () => { initConvo(); render(); };

    function pushMsg(from, text, rich) {
      convo.messages.push({ from, text, rich });
      scroll.insertAdjacentHTML("beforeend", renderMsg({ from, text, rich }));
      scrollDown();
    }
    function typing(cb) {
      scroll.insertAdjacentHTML("beforeend", `<div class="msg bot" id="typing"><span class="typing"><span></span><span></span><span></span></span></div>`);
      scrollDown();
      setTimeout(() => { const t2 = $("#typing"); if (t2) t2.remove(); cb(); }, 850);
    }

    function renderQuick() {
      const box = $("#quickReplies");
      let opts = [];
      if (convo.step === "occasion") opts = D.categories.map((c) => ({ label: L(c), value: c.id }));
      else if (convo.step === "budget") opts = BUDGET_OPTS.map((b) => ({ label: store.lang === "ar" ? b.ar : b.en, value: b }));
      else if (convo.step === "guests") opts = GUEST_OPTS.map((g) => ({ label: store.lang === "ar" ? g.ar : g.en, value: g }));
      else if (convo.step === "date") opts = DATE_OPTS.map((d) => ({ label: store.lang === "ar" ? d.ar : d.en, value: d }));
      if (!opts.length) { box.innerHTML = ""; return; }
      box.className = "quick-replies";
      box.innerHTML = opts.map((o, i) => `<button class="quick-reply" data-qr="${i}">${o.label}</button>`).join("");
      box.querySelectorAll("[data-qr]").forEach((b, i) => b.onclick = () => choose(opts[i]));
      scrollDown();
    }

    function choose(opt) {
      $("#quickReplies").innerHTML = "";
      pushMsg("user", esc(opt.label));
      advance(opt.value);
    }

    function advance(value) {
      const step = convo.step;
      if (step === "occasion") {
        convo.answers.occasion = value;
        convo.step = "budget";
        typing(() => { pushMsg("bot", t("botAskBudget")); renderQuick(); });
      } else if (step === "budget") {
        convo.answers.budget = value;
        convo.step = "guests";
        typing(() => { pushMsg("bot", t("botAskGuests")); renderQuick(); });
      } else if (step === "guests") {
        convo.answers.guests = value;
        convo.step = "date";
        typing(() => { pushMsg("bot", t("botAskDate")); renderQuick(); });
      } else if (step === "date") {
        convo.answers.date = value;
        convo.step = "done";
        typing(() => { pushMsg("bot", t("botThinking")); setTimeout(buildPlan, 700); });
      }
    }

    function buildPlan() {
      const a = convo.answers;
      const occ = typeof a.occasion === "string" ? a.occasion : "weddings";
      const tier = a.budget && a.budget.tier ? a.budget.tier : "medium";
      const total = a.budget && a.budget.val ? a.budget.val : 35000;

      // recommendations: within/under tier, distinct services, by rating
      const order = { low: 1, medium: 2, premium: 3 };
      const recs = D.vendors
        .filter((v) => v.tags.includes(occ) && order[v.budget] <= order[tier])
        .sort((x, y) => y.rating - x.rating);
      const seen = {}; const picks = [];
      for (const v of recs) { if (!seen[v.service]) { seen[v.service] = 1; picks.push(v); } if (picks.length >= 4) break; }

      pushMsg("bot", t("botPlanReady"));

      // budget split card
      const split = (D.budgetBreakdown[occ] || []).slice(0, 6).map(([svc, pct]) => {
        const s = serviceById(svc);
        return `<div class="plan-line"><span>${L(s)}</span><b>${money(Math.round(total * pct / 100))} ${t("egp")}</b></div>`;
      }).join("");
      pushMsg("bot", `<b>${t("botBudgetPlan")}</b><div style="margin-top:6px">${split}</div>
        <div class="plan-line" style="border-top:1px solid var(--border);margin-top:6px;padding-top:8px">
        <span>${t("totalBudget")}</span><b>${money(total)} ${t("egp")}</b></div>`, true);

      // vendor recommendations
      const recHtml = picks.map((v) => {
        const s = serviceById(v.service);
        return `<div class="mini-vendor" data-vendor="${v.id}" style="cursor:pointer">
          <div class="mini-thumb" style="background:${grad(v.grad)}">${icon(s.icon)}</div>
          <div class="mini-info"><b>${esc(L(v))}</b><small>${L(s)} · ${money(v.price)} ${t("egp")} · ★${v.rating}</small></div>
          ${icon("chevron", "ic")}</div>`;
      }).join("");
      pushMsg("bot", `<b>${t("botRecommend")}</b><div style="margin-top:6px">${recHtml}</div>`, true);

      // create checklist + budget
      store.checklist.occasion = occ;
      store.checklist.done = [];
      store.budget.occasion = occ;
      if (!store.budget.total) store.budget.total = total;
      save();
      pushMsg("bot", t("botCreatedChecklist"));

      // wire vendor taps inside chat
      scroll.querySelectorAll(".mini-vendor[data-vendor]").forEach((el) =>
        el.onclick = () => go("detail", { id: el.dataset.vendor }));
      renderQuick();
    }

    function sendText() {
      const inp = $("#chatInput");
      const val = inp.value.trim();
      if (!val) return;
      inp.value = "";
      $("#quickReplies").innerHTML = "";
      pushMsg("user", esc(val));
      // interpret free text loosely
      if (convo.step === "occasion") {
        const found = D.categories.find((c) => val.includes(c.ar) || val.toLowerCase().includes(c.en.toLowerCase()));
        advance(found ? found.id : "weddings");
      } else if (convo.step === "budget") {
        const num = parseInt(val.replace(/[^\d]/g, ""), 10);
        const tier = !num ? "medium" : num < 15000 ? "low" : num < 50000 ? "medium" : "premium";
        advance({ val: num || 35000, tier });
      } else if (convo.step === "guests") {
        const num = parseInt(val.replace(/[^\d]/g, ""), 10);
        advance({ val: num || 100 });
      } else if (convo.step === "date") {
        advance({ ar: val, en: val });
      } else {
        typing(() => pushMsg("bot", store.lang === "ar"
          ? "لو حابب تبدأ خطة جديدة اضغط على أيقونة ✨ فوق."
          : "Tap the ✨ icon above to start a new plan."));
      }
    }

    $("#chatSend").onclick = sendText;
    $("#chatInput").onkeydown = (e) => { if (e.key === "Enter") sendText(); };

    // render quick replies for current step (or wire recommendations if already done)
    if (convo.step === "done") {
      scroll.querySelectorAll(".mini-vendor[data-vendor]").forEach((el) =>
        el.onclick = () => go("detail", { id: el.dataset.vendor }));
    } else {
      renderQuick();
    }
  };

  // ---------- BUDGET ----------
  SCREENS.budget = function () {
    const b = store.budget;
    const spent = b.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const remaining = b.total - spent;
    const pct = b.total > 0 ? Math.min(100, Math.round((spent / b.total) * 100)) : 0;

    const expenses = b.expenses.length
      ? b.expenses.map((e) => `<div class="expense-item">
          <span class="e-dot"></span>
          <span class="e-name">${esc(e.name)}</span>
          <span class="e-amt">${money(e.amount)} ${t("egp")}</span>
          <button class="e-del" data-del="${e.id}">${icon("trash")}</button>
        </div>`).join("")
      : `<div class="empty" style="padding:34px 10px"><p>${t("noExpenses")}</p></div>`;

    let suggested = "";
    if (b.occasion && b.total > 0) {
      const rows = (D.budgetBreakdown[b.occasion] || []).map(([svc, p]) => {
        const s = serviceById(svc);
        return `<div class="suggest-item"><span class="s-name">${L(s)}</span>
          <span class="s-pct">${p}%</span><span class="s-amt">${money(Math.round(b.total * p / 100))} ${t("egp")}</span></div>`;
      }).join("");
      suggested = `<div class="section-head"><h3>${t("suggested")}</h3></div>${rows}`;
    }

    return `<div class="screen no-nav">
      <div class="back-row"><button class="back-btn" data-back>${icon("back")}</button><h2>${t("budgetTitle")}</h2></div>
      <div class="budget-ring-card">
        <div class="b-label">${t("totalBudget")}</div>
        <div class="b-total">${money(b.total)} <span style="font-size:1rem">${t("egp")}</span></div>
        <div class="budget-bar"><i style="width:${pct}%"></i></div>
        <div class="budget-legend">
          <div><span>${t("spent")}</span><b>${money(spent)} ${t("egp")}</b></div>
          <div class="r"><span>${t("remaining")}</span><b>${money(remaining)} ${t("egp")}</b></div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:8px">
        <button class="btn btn-ghost" style="flex:1" data-set-budget>${t("setBudget")}</button>
        <button class="btn btn-primary" style="flex:1" data-add-exp>${icon("plus")} ${t("addExpense")}</button>
      </div>
      <div class="section-head"><h3>${t("addExpense")}</h3></div>
      ${expenses}
      ${suggested}
      <div class="spacer-24"></div>
    </div>`;
  };
  BIND.budget = function () {
    view().querySelector("[data-back]").onclick = back;
    view().querySelectorAll("[data-del]").forEach((b) => b.onclick = () => {
      store.budget.expenses = store.budget.expenses.filter((e) => e.id !== b.dataset.del);
      save(); render();
    });
    view().querySelector("[data-set-budget]").onclick = () => {
      openSheet(`<h3>${t("setBudget")}</h3>
        <div class="field"><label>${t("totalBudget")} (${t("egp")})</label>
          <input id="bTotal" type="number" inputmode="numeric" value="${store.budget.total || ""}" placeholder="50000"></div>
        <div class="field"><label>${t("occasions")}</label>
          <select id="bOcc">${D.categories.map((c) => `<option value="${c.id}" ${store.budget.occasion === c.id ? "selected" : ""}>${L(c)}</option>`).join("")}</select></div>
        <button class="btn btn-primary btn-block" id="bSave">${t("save")}</button>`);
      $("#bSave").onclick = () => {
        const val = parseInt($("#bTotal").value, 10);
        if (!val || val < 0) { toast(t("pickAmount")); return; }
        store.budget.total = val;
        store.budget.occasion = $("#bOcc").value;
        save(); closeSheet(); render();
      };
    };
    view().querySelector("[data-add-exp]").onclick = () => {
      openSheet(`<h3>${t("addExpense")}</h3>
        <div class="field"><label>${t("expenseName")}</label><input id="eName" type="text" placeholder="${t("expenseName")}"></div>
        <div class="field"><label>${t("expenseAmount")} (${t("egp")})</label><input id="eAmt" type="number" inputmode="numeric" placeholder="5000"></div>
        <button class="btn btn-primary btn-block" id="eSave">${t("add")}</button>`);
      $("#eSave").onclick = () => {
        const name = $("#eName").value.trim();
        const amt = parseInt($("#eAmt").value, 10);
        if (!name || !amt) { toast(t("pickAmount")); return; }
        store.budget.expenses.push({ id: "e" + Date.now(), name, amount: amt });
        save(); closeSheet(); render();
      };
    };
  };

  // ---------- CHECKLIST ----------
  SCREENS.checklist = function () {
    const occ = store.checklist.occasion;
    const pills = D.categories.map((c) => `<button class="chip ${occ === c.id ? "active" : ""}" data-occ="${c.id}">${L(c)}</button>`).join("");

    if (!occ) {
      return `<div class="screen no-nav">
        <div class="back-row"><button class="back-btn" data-back>${icon("back")}</button><h2>${t("checklistTitle")}</h2></div>
        <div class="occasion-pills">${pills}</div>
        ${emptyState("list", t("pickOccasion"))}
      </div>`;
    }

    const tpl = D.checklistTemplates[occ] || [];
    const done = store.checklist.done;
    const doneCount = done.length;
    const pct = tpl.length ? Math.round((doneCount / tpl.length) * 100) : 0;

    const items = tpl.map((task, i) => {
      const isDone = done.includes(i);
      const when = task.months === 0 ? t("now") : `${task.months} ${t("monthsLeft")}`;
      return `<div class="task-item ${isDone ? "done" : ""}" data-task="${i}">
        <div class="task-check">${icon("check")}</div>
        <div class="task-body"><div class="t-name">${L(task)}</div><div class="t-when">${when}</div></div>
      </div>`;
    }).join("");

    return `<div class="screen no-nav">
      <div class="back-row"><button class="back-btn" data-back>${icon("back")}</button><h2>${t("checklistTitle")}</h2>
        <button class="head-icon-btn" style="margin-inline-start:auto" data-reset-list title="${t("resetList")}">${icon("spark")}</button></div>
      <div class="occasion-pills">${pills}</div>
      <div class="progress-card">
        <div class="progress-top">
          <div><div class="p-num">${pct}<small>%</small></div><div class="p-label">${t("progress")}</div></div>
          <div style="text-align:end"><div class="p-num" style="font-size:1.1rem">${doneCount}/${tpl.length}</div>
            <div class="p-label">${pct === 100 ? t("allDone") : (tpl.length - doneCount) + " " + t("tasksLeft")}</div></div>
        </div>
        <div class="progress-bar"><i style="width:${pct}%"></i></div>
      </div>
      ${items}
      <div class="spacer-24"></div>
    </div>`;
  };
  BIND.checklist = function () {
    view().querySelector("[data-back]").onclick = back;
    view().querySelectorAll("[data-occ]").forEach((b) => b.onclick = () => {
      if (store.checklist.occasion !== b.dataset.occ) { store.checklist.occasion = b.dataset.occ; store.checklist.done = []; save(); }
      render();
    });
    const rl = view().querySelector("[data-reset-list]");
    if (rl) rl.onclick = () => { store.checklist.done = []; save(); render(); };
    view().querySelectorAll("[data-task]").forEach((el) => el.onclick = () => {
      const i = Number(el.dataset.task);
      const done = store.checklist.done;
      const idx = done.indexOf(i);
      if (idx >= 0) done.splice(idx, 1); else done.push(i);
      save(); render();
    });
  };

  // ---------- BOOKINGS ----------
  SCREENS.bookings = function () {
    const list = store.bookings;
    if (!list.length) {
      return `<div class="screen">
        <header class="app-header"><div class="head-titles"><h1>${t("bookingsTitle")}</h1></div></header>
        ${emptyState("calendar", t("noBookings"), t("exploreNow"), "explore")}
      </div>`;
    }
    const cards = list.slice().reverse().map((bk) => {
      const v = vendorById(bk.vendorId);
      if (!v) return "";
      const s = serviceById(v.service);
      const d = new Date(bk.date).toLocaleDateString(store.lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
      return `<div class="booking-card">
        <div class="booking-thumb" style="background:${grad(v.grad)}">${icon(s.icon)}</div>
        <div class="booking-info">
          <div class="bk-name">${esc(L(v))}</div>
          <div class="bk-date">${L(s)} · ${d}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:end;gap:8px">
          <span class="status-pill ${bk.status}">${bk.status === "confirmed" ? t("statusConfirmed") : t("statusPending")}</span>
          <button class="e-del" data-cancel="${bk.id}" title="${t("cancel")}">${icon("trash")}</button>
        </div>
      </div>`;
    }).join("");
    return `<div class="screen">
      <header class="app-header"><div class="head-titles"><h1>${t("bookingsTitle")}</h1></div></header>
      ${cards}
      <div class="spacer-24"></div>
    </div>`;
  };
  BIND.bookings = function () {
    view().querySelectorAll("[data-cancel]").forEach((b) => b.onclick = () => {
      store.bookings = store.bookings.filter((x) => x.id !== b.dataset.cancel);
      save(); render();
    });
    bindCommon();
  };

  // ---------- PROFILE ----------
  SCREENS.profile = function () {
    return `<div class="screen">
      <header class="app-header"><div class="head-titles"><h1>${t("profileTitle")}</h1></div></header>
      <div class="profile-head">
        <div class="profile-avatar">Z</div>
        <div><div class="p-name">${t("guestUser")}</div><div class="p-mail">guest@zekra.app</div></div>
      </div>
      <div class="loyalty-card">
        <div><div class="l-label">${t("loyalty")}</div><div class="l-pts">${money(store.points)} <span style="font-size:.9rem;font-weight:600">${t("points")}</span></div></div>
        <div class="l-star">${icon("star")}</div>
      </div>

      <div class="section-head"><h3>${t("settings")}</h3></div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="s-ic">${icon("globe")}</div>
          <div class="s-label">${t("language")}</div>
          <div class="seg" id="langSeg">
            <button class="${store.lang === "ar" ? "active" : ""}" data-lang="ar">عربي</button>
            <button class="${store.lang === "en" ? "active" : ""}" data-lang="en">EN</button>
          </div>
        </div>
        <div class="settings-row">
          <div class="s-ic">${icon("moon")}</div>
          <div class="s-label">${t("theme")}</div>
          <div class="seg" id="themeSeg">
            <button class="${store.theme === "dark" ? "active" : ""}" data-theme="dark">${t("dark")}</button>
            <button class="${store.theme === "light" ? "active" : ""}" data-theme="light">${t("light")}</button>
          </div>
        </div>
      </div>

      <div class="settings-group">
        <button class="settings-row" data-open="budget">
          <div class="s-ic">${icon("wallet")}</div><div class="s-label">${t("myBudget")}</div>
          <span class="s-val chev">${icon("chevron")}</span></button>
        <button class="settings-row" data-open="checklist">
          <div class="s-ic">${icon("list")}</div><div class="s-label">${t("myChecklist")}</div>
          <span class="s-val chev">${icon("chevron")}</span></button>
        <button class="settings-row" data-about>
          <div class="s-ic">${icon("info")}</div><div class="s-label">${t("aboutApp")}</div>
          <span class="s-val chev">${icon("chevron")}</span></button>
      </div>

      <div class="settings-group">
        <button class="settings-row danger" data-reset>
          <div class="s-ic">${icon("trash")}</div><div class="s-label">${t("resetData")}</div></button>
      </div>
      <div class="spacer-24"></div>
    </div>`;
  };
  BIND.profile = function () {
    view().querySelectorAll("[data-lang]").forEach((b) => b.onclick = () => setLang(b.dataset.lang));
    view().querySelectorAll("[data-theme]").forEach((b) => b.onclick = () => setTheme(b.dataset.theme));
    view().querySelector("[data-about]").onclick = () => {
      openSheet(`<h3>${t("aboutApp")}</h3>
        <p style="color:var(--text-2);font-size:.92rem;margin-bottom:18px">${t("aboutText")}</p>
        <button class="btn btn-primary btn-block" onclick="void 0" id="aboutClose">${t("close")}</button>`);
      $("#aboutClose").onclick = closeSheet;
    };
    view().querySelector("[data-reset]").onclick = () => {
      if (confirm(t("confirmReset"))) {
        const lang = store.lang, theme = store.theme;
        store = JSON.parse(JSON.stringify(DEFAULT));
        store.lang = lang; store.theme = theme; store.onboarded = true;
        save(); stack = []; go("home", {}, true);
      }
    };
    bindCommon();
  };

  // ---------- shared ----------
  function emptyState(ic, text, ctaLabel, ctaTab) {
    return `<div class="empty">
      <div class="em-ic">${icon(ic)}</div>
      <p>${text}</p>
      ${ctaLabel ? `<button class="btn btn-primary" data-tab="${ctaTab}" style="padding:12px 24px">${ctaLabel}</button>` : ""}
    </div>`;
  }
  function bindCommon() {
    view().querySelectorAll("[data-vendor]").forEach((b) => b.onclick = () => go("detail", { id: b.dataset.vendor }));
    view().querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => { stack = []; go(b.dataset.tab, {}, true); });
    view().querySelectorAll("[data-open]").forEach((b) => b.onclick = () => go(b.dataset.open, {}));
  }

  // ---------- Settings appliers ----------
  function applyLang() {
    document.documentElement.lang = store.lang;
    document.documentElement.dir = I18N[store.lang].dir;
  }
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", store.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", store.theme === "dark" ? "#0d0916" : "#f5f1fb");
  }
  function setLang(l) { store.lang = l; save(); applyLang(); render(); }
  function setTheme(th) { store.theme = th; save(); applyTheme(); render(); }

  // ---------- Onboarding ----------
  const ONBOARD_SLIDES = [
    { icon: "calendar", tk: "onboard1Title", bk: "onboard1Body" },
    { icon: "star", tk: "onboard2Title", bk: "onboard2Body" },
    { icon: "spark", tk: "onboard3Title", bk: "onboard3Body" }
  ];
  function showOnboarding() {
    const root = document.getElementById("onboard-root");
    let i = 0;
    function paint() {
      const s = ONBOARD_SLIDES[i];
      root.innerHTML = `<div class="onboard">
        <div class="onboard-top">
          <span class="wordmark" style="font-size:1.2rem">ZEKRA</span>
          <button class="skip" id="obSkip">${t("skip")}</button>
        </div>
        <div class="onboard-body">
          <div class="onboard-illus"><span class="ring"></span><span class="ring two"></span>${icon(s.icon, "ic")}</div>
          <h2>${t(s.tk)}</h2>
          <p>${t(s.bk)}</p>
        </div>
        <div class="onboard-dots">${ONBOARD_SLIDES.map((_, k) => `<i class="${k === i ? "active" : ""}"></i>`).join("")}</div>
        <button class="btn btn-primary btn-block" id="obNext">${i === ONBOARD_SLIDES.length - 1 ? t("getStarted") : t("navHome") /*placeholder*/}</button>
      </div>`;
      // better label for next
      $("#obNext").textContent = i === ONBOARD_SLIDES.length - 1 ? t("getStarted") : (store.lang === "ar" ? "التالي" : "Next");
      $("#obSkip").onclick = finish;
      $("#obNext").onclick = () => { if (i < ONBOARD_SLIDES.length - 1) { i++; paint(); } else finish(); };
    }
    function finish() {
      store.onboarded = true; save();
      root.innerHTML = "";
    }
    // splash first
    root.innerHTML = `<div class="onboard onboard-splash">
      <div class="onboard-illus" style="width:150px;height:150px"><span class="ring"></span>
        <span class="splash-mark wordmark">Z</span></div>
      <div style="margin-top:26px" class="wordmark" >ZEKRA</div>
      <p style="color:var(--text-2);margin-top:10px;max-width:260px;text-align:center">${t("tagline")}</p>
    </div>`;
    // style the splash wordmark bigger
    const wm = root.querySelector(".onboard-splash > .wordmark");
    if (wm) { wm.style.fontSize = "1.8rem"; wm.style.marginTop = "26px"; }
    setTimeout(paint, 1400);
  }

  // ---------- Boot ----------
  function boot() {
    applyLang();
    applyTheme();
    go("home", {}, true);
    if (!store.onboarded) showOnboarding();

    // service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
    }
  }
  boot();
})();
