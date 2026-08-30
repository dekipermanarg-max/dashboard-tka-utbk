/* Keep the TKA score legend visible only for TKA selections. */
(function () {
  function selectedTestName(selectorId) {
    const el = document.getElementById(selectorId);
    if (!el || el.selectedIndex < 0) return '';
    return String(el.options[el.selectedIndex]?.textContent || '').trim();
  }

  function isTKA(name) {
    return /TKA/i.test(String(name || ''));
  }

  function syncPage(pageId, selectorId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    const show = isTKA(selectedTestName(selectorId));
    page.querySelectorAll('.tka-score-legend').forEach(function (legend) {
      legend.style.display = show ? '' : 'none';
    });
  }

  function syncAll() {
    syncPage('page-overview', 'testSelector');
    syncPage('page-tka', 'tkaTestSelector');
    syncPage('page-students', 'studentTestSelector');
    syncPage('page-ranking', 'rankingTestSelector');
    syncPage('page-intervention-page', 'interventionTestSelector');

    const detail = document.getElementById('detailTable');
    if (detail) {
      const selector = document.getElementById('detailTestSelector');
      const name = selector && selector.selectedIndex >= 0
        ? String(selector.options[selector.selectedIndex]?.textContent || '')
        : String(document.getElementById('detailTestTitle')?.textContent || '');
      detail.closest('.detail-table-card')?.querySelectorAll('.tka-score-legend').forEach(function (legend) {
        legend.style.display = isTKA(name) ? '' : 'none';
      });
    }
  }

  function start() {
    document.addEventListener('change', function (event) {
      if (event.target && event.target.matches('select')) {
        setTimeout(syncAll, 0);
      }
    });

    const observer = new MutationObserver(function () {
      clearTimeout(observer._timer);
      observer._timer = setTimeout(syncAll, 80);
    });
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    syncAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
