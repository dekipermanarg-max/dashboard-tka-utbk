/* TKA 200–800 category presentation for mapel averages + student scores */
(function () {
  const RANGE = {
    kurang: { label: 'Kurang', color: '#d97706' },
    memadai: { label: 'Memadai', color: '#1976d2' },
    baik: { label: 'Baik', color: '#0f8f95' },
    istimewa: { label: 'Istimewa', color: '#2e9b45' }
  };

  function category(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 200 || n > 800) return null;
    if (n <= 424) return RANGE.kurang;
    if (n <= 599) return RANGE.memadai;
    if (n <= 724) return RANGE.baik;
    return RANGE.istimewa;
  }

  function selectedTestName(selectorId) {
    const el = document.getElementById(selectorId);
    if (!el || el.selectedIndex < 0) return '';
    return String(el.options[el.selectedIndex]?.textContent || '').trim();
  }

  function isTKA200800(selectorId) {
    const name = selectedTestName(selectorId);
    return /TKA/i.test(name);
  }

  function applyTkaMapelAverages() {
    const page = document.getElementById('page-tka');
    if (!page || !isTKA200800('tkaTestSelector')) return;

    /* The TKA page renders average values per mapel/subtes in this grid. */
    page.querySelectorAll('#tkaSubjectGrid .subject-score').forEach(function (el) {
      const c = category(el.textContent);
      if (!c) return;
      el.style.color = c.color;
      el.style.fontWeight = '700';
    });
  }

  function applyStudentStatuses() {
    const page = document.getElementById('page-students');
    if (!page || !isTKA200800('studentTestSelector')) return;

    page.querySelectorAll('#studentScores .score-card-value').forEach(function (valueEl) {
      const c = category(valueEl.textContent);
      const card = valueEl.closest('.score-card, .card, [class*="score-card"]');
      if (!c || !card) return;

      let status = card.querySelector('.tka-score-status');
      if (!status) {
        status = document.createElement('div');
        status.className = 'tka-score-status';
        valueEl.insertAdjacentElement('afterend', status);
      }
      status.textContent = c.label;
      status.style.color = c.color;
    });
  }

  function injectStyle() {
    if (document.getElementById('tka-mapel-student-status-style')) return;
    const style = document.createElement('style');
    style.id = 'tka-mapel-student-status-style';
    style.textContent = `
      #studentScores .tka-score-status {
        margin-top: 2px;
        font-size: 11px;
        line-height: 1.2;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  function applyAll() {
    injectStyle();
    applyTkaMapelAverages();
    applyStudentStatuses();
  }

  window.applyTKAMapelStudentStatus = applyAll;

  let timer = null;
  const observer = new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(applyAll, 60);
  });

  function start() {
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    applyAll();
    setTimeout(applyAll, 150);
    setTimeout(applyAll, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
