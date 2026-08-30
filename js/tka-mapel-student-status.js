/* TKA 200–800 category presentation for mapel averages + student scores */
(function () {
  const RANGE = {
    kurang: { label: 'Kurang', color: '#d97706' },
    memadai: { label: 'Memadai', color: '#1976d2' },
    baik: { label: 'Baik', color: '#0f8f95' },
    istimewa: { label: 'Istimewa', color: '#2e9b45' }
  };

  function category(value) {
    const n = Number(String(value).replace(',', '.').trim());
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
    return /TKA/i.test(selectedTestName(selectorId));
  }

  function applyTkaMapelAverages() {
    const page = document.getElementById('page-tka');
    if (!page || !isTKA200800('tkaTestSelector')) return;

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

    const values = Array.from(page.querySelectorAll('#studentScores .score-card-value'));
    const seenCards = new Set();

    values.forEach(function (valueEl) {
      /* Use the nearest actual score card. Never use a generic .card here,
         because that can encompass several mapel cards and cause duplicates. */
      const card = valueEl.closest('.score-card');
      if (!card || seenCards.has(card)) return;
      seenCards.add(card);

      /* Remove any duplicate statuses left by an earlier render/version. */
      card.querySelectorAll('.tka-score-status').forEach(function (el) { el.remove(); });

      const c = category(valueEl.textContent);
      if (!c) return;

      const status = document.createElement('div');
      status.className = 'tka-score-status';
      status.textContent = c.label;
      status.style.color = c.color;
      valueEl.insertAdjacentElement('afterend', status);
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
  let applying = false;
  const observer = new MutationObserver(function () {
    if (applying) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      applying = true;
      try { applyAll(); } finally { applying = false; }
    }, 100);
  });

  function start() {
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (_) {}
    applyAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
