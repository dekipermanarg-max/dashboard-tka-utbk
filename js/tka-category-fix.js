/* TKA score categories — 200–800 scale across every TKA page */
(function () {
  const RANGE = {
    kurang: { min: 200, max: 424, label: "Kurang", color: "#d97706", bg: "#fff4e5" },
    memadai: { min: 425, max: 599, label: "Memadai", color: "#1976d2", bg: "#eaf4ff" },
    baik: { min: 600, max: 724, label: "Baik", color: "#0f8f95", bg: "#e7f8f8" },
    istimewa: { min: 725, max: Infinity, label: "Istimewa", color: "#2e9b45", bg: "#eaf7ea" }
  };

  function getTKACategory(score) {
    const value = Number(score);
    if (!Number.isFinite(value)) return "—";
    if (value >= 200 && value <= 424) return RANGE.kurang.label;
    if (value >= 425 && value <= 599) return RANGE.memadai.label;
    if (value >= 600 && value <= 724) return RANGE.baik.label;
    if (value >= 725) return RANGE.istimewa.label;
    return "—";
  }

  function categoryKey(score) {
    const value = Number(score);
    if (!Number.isFinite(value) || value < 200) return "";
    if (value <= 424) return "kurang";
    if (value <= 599) return "memadai";
    if (value <= 724) return "baik";
    return "istimewa";
  }

  function isTKAName(name) {
    return /TKA/i.test(String(name || ""));
  }

  function getSelectedTestName(selectId) {
    const select = document.getElementById(selectId);
    if (!select || select.selectedIndex < 0) return "";
    return String(select.options[select.selectedIndex]?.textContent || "").trim();
  }

  function getPageTestName(pageId, selectorId) {
    const selected = getSelectedTestName(selectorId);
    if (selected) return selected;
    if (pageId === "page-tka") return "TKA";
    return "";
  }

  function pageUsesTKA(pageId, selectorId) {
    return isTKAName(getPageTestName(pageId, selectorId));
  }

  /* Override the old scale helpers so every TKA TO using 200–800 gets the same rule. */
  window.getTKAScoreScale = function (testOrId) {
    let name = "";
    try {
      if (typeof getTestName === "function") name = getTestName(testOrId) || "";
      else name = String(testOrId || "");
    } catch (_) {}
    return isTKAName(name) ? "200-800" : "";
  };

  window.getTKACategory = getTKACategory;
  window.getTKAScoreCategory = getTKACategory;

  window.getTKAScoreClass = function (score, testOrId) {
    let name = "";
    try {
      if (typeof getTestName === "function") name = getTestName(testOrId) || "";
      else name = String(testOrId || "");
    } catch (_) {}
    if (!isTKAName(name)) return "score-normal";
    const key = categoryKey(score);
    return key ? "tka-score-" + key : "score-normal";
  };

  window.getTKASubjectScoreClass = function (score, testOrId) {
    let name = "";
    try {
      if (typeof getTestName === "function") name = getTestName(testOrId) || "";
      else name = String(testOrId || "");
    } catch (_) {}
    if (!isTKAName(name)) return "";
    const key = categoryKey(score);
    return key ? "tka-subject-" + key : "";
  };

  function injectStyle() {
    if (document.getElementById("tka-score-category-style")) return;
    const style = document.createElement("style");
    style.id = "tka-score-category-style";
    style.textContent = `
      .tka-score-kurang, .tka-subject-kurang { color:${RANGE.kurang.color} !important; font-weight:700 !important; }
      .tka-score-memadai, .tka-subject-memadai { color:${RANGE.memadai.color} !important; font-weight:700 !important; }
      .tka-score-baik, .tka-subject-baik { color:${RANGE.baik.color} !important; font-weight:700 !important; }
      .tka-score-istimewa, .tka-subject-istimewa { color:${RANGE.istimewa.color} !important; font-weight:700 !important; }

      #detailTable td.tka-score-kurang { background:${RANGE.kurang.bg} !important; border-radius:4px; }
      #detailTable td.tka-score-memadai { background:${RANGE.memadai.bg} !important; border-radius:4px; }
      #detailTable td.tka-score-baik { background:${RANGE.baik.bg} !important; border-radius:4px; }
      #detailTable td.tka-score-istimewa { background:${RANGE.istimewa.bg} !important; border-radius:4px; }

      .tka-score-legend {
        display:flex;
        align-items:center;
        gap:14px;
        flex-wrap:wrap;
        margin-top:18px;
        padding:10px 14px;
        border:1px solid #e3eaf2;
        border-radius:8px;
        background:#fff;
        font-size:12px;
        color:#52627a;
      }
      .tka-score-legend-title { font-weight:700; color:#243b53; margin-right:2px; }
      .tka-score-legend-item { display:inline-flex; align-items:center; gap:6px; white-space:nowrap; }
      .tka-score-legend-dot { width:9px; height:9px; border-radius:50%; display:inline-block; flex:0 0 9px; }
      .tka-score-legend-dot.kurang { background:${RANGE.kurang.color}; }
      .tka-score-legend-dot.memadai { background:${RANGE.memadai.color}; }
      .tka-score-legend-dot.baik { background:${RANGE.baik.color}; }
      .tka-score-legend-dot.istimewa { background:${RANGE.istimewa.color}; }
    `;
    document.head.appendChild(style);
  }

  function legendHTML() {
    return `
      <span class="tka-score-legend-title">Legenda Kategori Skor TKA</span>
      <span class="tka-score-legend-item"><i class="tka-score-legend-dot kurang"></i>Kurang (200–424)</span>
      <span class="tka-score-legend-item"><i class="tka-score-legend-dot memadai"></i>Memadai (425–599)</span>
      <span class="tka-score-legend-item"><i class="tka-score-legend-dot baik"></i>Baik (600–724)</span>
      <span class="tka-score-legend-item"><i class="tka-score-legend-dot istimewa"></i>Istimewa (≥725)</span>
    `;
  }

  function ensureLegend(pageId, selectorId) {
    const page = document.getElementById(pageId);
    if (!page) return;
    const existing = page.querySelector(":scope > .tka-score-legend");
    if (!pageUsesTKA(pageId, selectorId)) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const legend = document.createElement("div");
    legend.className = "tka-score-legend";
    legend.innerHTML = legendHTML();
    page.appendChild(legend);
  }

  function clearClasses(el) {
    el.classList.remove(
      "tka-score-kurang", "tka-score-memadai", "tka-score-baik", "tka-score-istimewa",
      "tka-subject-kurang", "tka-subject-memadai", "tka-subject-baik", "tka-subject-istimewa"
    );
  }

  function applyClass(el, score, prefix = "tka-score-") {
    if (!el) return;
    clearClasses(el);
    const key = categoryKey(score);
    if (key) el.classList.add(prefix + key);
  }

  function applyTkaPage() {
    const page = document.getElementById("page-tka");
    if (!page || !pageUsesTKA("page-tka", "tkaTestSelector")) return;

    ["tkaAverage", "tkaHighest", "tkaLowest"].forEach(id => {
      const el = document.getElementById(id);
      if (el) applyClass(el, el.textContent);
    });

    page.querySelectorAll("#tkaSubjectGrid .subject-score").forEach(el => {
      applyClass(el, el.textContent, "tka-subject-");
    });

    const ranking = document.getElementById("tkaRankingTable");
    if (ranking) {
      ranking.querySelectorAll("tr").forEach(row => {
        const cells = Array.from(row.children);
        if (cells.length >= 4) applyClass(cells[3], cells[3].textContent);
      });
    }

    ensureLegend("page-tka", "tkaTestSelector");
  }

  function applyOverviewPage() {
    const page = document.getElementById("page-overview");
    if (!page || !pageUsesTKA("page-overview", "testSelector")) return;

    const avg = document.getElementById("averageScore");
    if (avg) applyClass(avg, avg.textContent);

    const ranking = document.getElementById("rankingTable");
    if (ranking) ranking.querySelectorAll("tr").forEach(row => {
      const cells = Array.from(row.children);
      if (cells.length >= 4) applyClass(cells[3], cells[3].textContent);
    });

    ensureLegend("page-overview", "testSelector");
  }

  function applyStudentPage() {
    const page = document.getElementById("page-students");
    if (!page || !pageUsesTKA("page-students", "studentTestSelector")) return;

    page.querySelectorAll("#studentScores .score-card-value").forEach(el => {
      applyClass(el, el.textContent);
    });

    page.querySelectorAll("#studentProfile .profile-kpi-value").forEach(el => {
      const card = el.closest(".kpi-card");
      const label = card?.querySelector(".kpi-label")?.textContent || "";
      if (/rata-rata|tertinggi|terendah/i.test(label)) applyClass(el, el.textContent);
    });

    ensureLegend("page-students", "studentTestSelector");
  }

  function applyRankingPage() {
    const page = document.getElementById("page-ranking");
    if (!page || !pageUsesTKA("page-ranking", "rankingTestSelector")) return;
    const table = document.getElementById("rankingPageTable");
    if (table) table.querySelectorAll("tr").forEach(row => {
      const cells = Array.from(row.children);
      if (cells.length >= 4) applyClass(cells[3], cells[3].textContent);
    });
    ensureLegend("page-ranking", "rankingTestSelector");
  }

  function applyInterventionPage() {
    const page = document.getElementById("page-intervention-page");
    if (!page || !pageUsesTKA("page-intervention-page", "interventionTestSelector")) return;
    page.querySelectorAll(".score-card-value,.subject-score,.kpi-value,.profile-kpi-value").forEach(el => applyClass(el, el.textContent));
    ensureLegend("page-intervention-page", "interventionTestSelector");
  }

  function currentDetailTestName() {
    const selector = document.getElementById("detailTestSelector");
    if (selector && selector.selectedIndex >= 0) return String(selector.options[selector.selectedIndex]?.textContent || "");
    return String(document.getElementById("detailTestTitle")?.textContent || "");
  }

  function applyDetailPage() {
    const table = document.getElementById("detailTable");
    if (!table || !isTKAName(currentDetailTestName())) return;

    const headers = Array.from(table.querySelectorAll("thead th")).map(th => String(th.textContent || "").trim().toUpperCase());
    const scoreStart = headers.findIndex(h => ["MAT", "B.IND", "ENG", "MAT LANJ", "ENG LANJ", "FIS", "KIM", "BIO", "EKO", "GEO", "SOS", "PPKN"].includes(h));

    table.querySelectorAll("tbody tr").forEach(row => {
      Array.from(row.children).forEach((cell, index) => {
        clearClasses(cell);
        if (scoreStart < 0 || index < scoreStart) return;
        const raw = String(cell.textContent || "").trim().replace(",", ".");
        if (!/^\d+(?:\.\d+)?$/.test(raw)) return;
        applyClass(cell, Number(raw));
      });
    });

    const card = table.closest(".detail-table-card") || table.parentElement?.parentElement;
    if (card && !card.querySelector(".tka-score-legend")) {
      const legend = document.createElement("div");
      legend.className = "tka-score-legend";
      legend.innerHTML = legendHTML();
      card.appendChild(legend);
    }
  }

  function applyAll() {
    injectStyle();
    applyOverviewPage();
    applyTkaPage();
    applyStudentPage();
    applyRankingPage();
    applyInterventionPage();
    applyDetailPage();
  }

  window.applyTKACategories = applyAll;

  const observer = new MutationObserver(() => {
    clearTimeout(observer._timer);
    observer._timer = setTimeout(applyAll, 80);
  });

  function start() {
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    applyAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
