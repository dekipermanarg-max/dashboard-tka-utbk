/* TKA category standard — based on the displayed TKA rubric */
(function () {
  function getTKACategory(score, testOrId) {
    const value = Number(score);
    if (!Number.isFinite(value)) return "—";

    const name = String(typeof getTestName === "function" ? getTestName(testOrId) : "").toUpperCase();

    // Premium TKA retains the 0–100 scale.
    if (name.includes("PREMIUM")) {
      if (value < 50) return "Kurang";
      if (value < 60) return "Memadai";
      if (value < 75) return "Baik";
      return "Istimewa";
    }

    // TKA SMA Reguler: 200–800 scale.
    if (value <= 424) return "Kurang";
    if (value <= 599) return "Memadai";
    if (value <= 724) return "Baik";
    return "Istimewa";
  }

  window.getTKACategory = getTKACategory;
  window.getTKAScoreCategory = getTKACategory;

  function categoryForScore(value) {
    const score = Number(value);
    if (!Number.isFinite(score)) return null;
    return getTKACategory(score, window.currentTestId || "");
  }

  function updateExistingCategory(el) {
    const text = String(el.textContent || "").trim();
    if (!/^(Kurang|Memadai|Baik|Istimewa)$/i.test(text)) return;

    let scope = el.closest("tr, .subject-card, .score-card, .score-item, .card, td, div");
    if (!scope) return;

    // Prefer a score explicitly associated with the same row/card.
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

    const next = categoryForScore(score);
    if (next && next !== text) el.textContent = next;
  }

  function applyCategories() {
    document.querySelectorAll("td,span,div,p,strong,b").forEach(updateExistingCategory);
  }

  // Also correct categories after SPA re-renders / selector changes.
  const observer = new MutationObserver(() => {
    clearTimeout(observer._timer);
    observer._timer = setTimeout(applyCategories, 40);
  });

  function start() {
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    applyCategories();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
