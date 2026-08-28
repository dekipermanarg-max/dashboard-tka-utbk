/* TKA category standard + Detail TO score styling */
(function () {
  function getTKACategory(score, testOrId) {
    const value = Number(score);
    if (!Number.isFinite(value)) return "—";
    const name = String(typeof getTestName === "function" ? getTestName(testOrId) : "").toUpperCase();

    if (name.includes("PREMIUM")) {
      if (value < 50) return "Kurang";
      if (value < 60) return "Memadai";
      if (value < 75) return "Baik";
      return "Istimewa";
    }

    if (value <= 424) return "Kurang";
    if (value <= 599) return "Memadai";
    if (value <= 724) return "Baik";
    return "Istimewa";
  }

  window.getTKACategory = getTKACategory;
  window.getTKAScoreCategory = getTKACategory;

  function currentDetailTestName() {
    const selector = document.getElementById("detailTestSelector");
    if (selector && selector.selectedIndex >= 0) {
      return String(selector.options[selector.selectedIndex]?.textContent || "");
    }
    return String(document.getElementById("detailTestTitle")?.textContent || "");
  }

  function isTKADetail() {
    return /TKA/i.test(currentDetailTestName());
  }

  function scoreClass(score, testName) {
    const n = Number(score);
    if (!Number.isFinite(n)) return "";
    const category = getTKACategory(n, testName);
    return category === "Kurang" ? "tka-score-kurang" :
           category === "Memadai" ? "tka-score-memadai" :
           category === "Baik" ? "tka-score-baik" :
           "tka-score-istimewa";
  }

  function injectStyle() {
    if (document.getElementById("tka-detail-category-style")) return;
    const style = document.createElement("style");
    style.id = "tka-detail-category-style";
    style.textContent = `
      #detailTable td.tka-score-kurang { background:#fff4e5 !important; color:#d97706 !important; font-weight:700; border-radius:4px; }
      #detailTable td.tka-score-memadai { background:#eaf4ff !important; color:#1976d2 !important; font-weight:700; border-radius:4px; }
      #detailTable td.tka-score-baik { background:#e7f8f8 !important; color:#0f8f95 !important; font-weight:700; border-radius:4px; }
      #detailTable td.tka-score-istimewa { background:#eaf7ea !important; color:#2e9b45 !important; font-weight:700; border-radius:4px; }
      .tka-detail-legend { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:12px; padding:10px 14px; border:1px solid #e3eaf2; border-radius:8px; background:#fff; font-size:12px; color:#52627a; }
      .tka-detail-legend-title { font-weight:700; color:#243b53; margin-right:2px; }
      .tka-detail-legend-item { display:inline-flex; align-items:center; gap:6px; white-space:nowrap; }
      .tka-detail-legend-dot { width:9px; height:9px; border-radius:50%; display:inline-block; }
      .tka-detail-legend-dot.kurang { background:#d97706; }
      .tka-detail-legend-dot.memadai { background:#1976d2; }
      .tka-detail-legend-dot.baik { background:#0f8f95; }
      .tka-detail-legend-dot.istimewa { background:#2e9b45; }
    `;
    document.head.appendChild(style);
  }

  function addLegend() {
    const card = document.querySelector("#page-detail .detail-table-card");
    if (!card || !isTKADetail()) return;
    if (card.querySelector(".tka-detail-legend")) return;
    const legend = document.createElement("div");
    legend.className = "tka-detail-legend";
    legend.innerHTML = `
      <span class="tka-detail-legend-title">Kategori Skor TKA:</span>
      <span class="tka-detail-legend-item"><i class="tka-detail-legend-dot kurang"></i>Kurang (200–424)</span>
      <span class="tka-detail-legend-item"><i class="tka-detail-legend-dot memadai"></i>Memadai (425–599)</span>
      <span class="tka-detail-legend-item"><i class="tka-detail-legend-dot baik"></i>Baik (600–724)</span>
      <span class="tka-detail-legend-item"><i class="tka-detail-legend-dot istimewa"></i>Istimewa (≥725)</span>
    `;
    card.appendChild(legend);
  }

  function styleDetailScores() {
    const table = document.getElementById("detailTable");
    if (!table || !isTKADetail()) return;
    const testName = currentDetailTestName();
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => String(th.textContent || "").trim().toUpperCase());
    const scoreStart = headers.findIndex(h => ["MAT", "B.IND", "ENG", "FIS", "KIM", "BIO", "EKO", "GEO", "SOS", "PPKN"].includes(h));

    table.querySelectorAll("tbody tr").forEach(row => {
      const cells = Array.from(row.children);
      cells.forEach((cell, index) => {
        cell.classList.remove("tka-score-kurang", "tka-score-memadai", "tka-score-baik", "tka-score-istimewa");
        if (scoreStart < 0 || index < scoreStart) return;
        const raw = String(cell.textContent || "").trim().replace(",", ".");
        if (!/^\d+(?:\.\d+)?$/.test(raw)) return;
        const cls = scoreClass(Number(raw), testName);
        if (cls) cell.classList.add(cls);
      });
    });
    addLegend();
  }

  function updateExistingCategory(el) {
    const text = String(el.textContent || "").trim();
    if (!/^(Kurang|Memadai|Baik|Istimewa)$/i.test(text)) return;
    const scope = el.closest("tr, .subject-card, .score-card, .score-item, .card, td, div");
    if (!scope) return;
    const candidates = Array.from(scope.querySelectorAll(".score-high,.score-medium,.score-low,[data-score],strong,b"));
    let score = null;
    for (const node of candidates) {
      const raw = node.getAttribute("data-score") || node.textContent || "";
      const m = String(raw).match(/(?:^|\s)(\d+(?:\.\d+)?)(?:\s|$)/);
      if (m) { score = Number(m[1]); break; }
    }
    if (score == null) {
      const m = String(scope.textContent || "").match(/(?:^|\s)(\d{3}(?:\.\d+)?)(?:\s|$)/);
      if (m) score = Number(m[1]);
    }
    if (score == null) return;
    const next = getTKACategory(score, window.currentTestId || "");
    if (next && next !== text) el.textContent = next;
  }

  function applyAll() {
    injectStyle();
    document.querySelectorAll("td,span,div,p,strong,b").forEach(updateExistingCategory);
    styleDetailScores();
  }

  window.applyTKACategories = applyAll;

  const observer = new MutationObserver(() => {
    clearTimeout(observer._timer);
    observer._timer = setTimeout(applyAll, 60);
  });

  function start() {
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    applyAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();