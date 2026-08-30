/* Dashboard loader — stable load order */
(function(){
  function load(src, onload){
    const s = document.createElement('script');
    s.src = src;
    s.onload = onload || null;
    s.onerror = function(e){ console.error('Gagal memuat', src, e); };
    document.head.appendChild(s);
  }

  load('js/app-original.js?v=20260825h', function(){
    load('js/revisions.js?v=20260825h', function(){
      load('js/final-revisions.js?v=20260825h', function(){
        load('js/restore-revisions.js?v=20260825a', function(){
          load('js/student-fix.js?v=20260830a', function(){
            load('js/calendar-fix.js?v=20260828b', function(){
              load('js/tka-category-fix.js?v=20260828a', function(){
                try { if (typeof initNavigation === 'function') initNavigation(); } catch (e) { console.error('initNavigation:', e); }
                try { if (typeof initSelectors === 'function') initSelectors(); } catch (e) { console.error('initSelectors:', e); }
                try { if (typeof initDetailSearch === 'function') initDetailSearch(); } catch (e) { console.error('initDetailSearch:', e); }
                try { if (typeof initPrint === 'function') initPrint(); } catch (e) { console.error('initPrint:', e); }
                setTimeout(async function(){
                  try {
                    if (typeof loadDashboardData !== 'function') throw new Error('loadDashboardData tidak ditemukan');
                    await loadDashboardData();
                    window.dashboardData = dashboardData;
                    load('js/utbk-data.js?v=20260828e', function(){
                      load('js/utbk-kpi-detail.js?v=20260828a', function(){
                        load('js/test-name-fix.js?v=20260828a', function(){
                          load('js/student-selector-dedupe.js?v=20260830a', function(){
                            try {
                              if (typeof window.restoreDashboardUI === 'function') window.restoreDashboardUI();
                              if (typeof window.applyStudentSummaryFix === 'function') window.applyStudentSummaryFix();
                              if (typeof populateAllSelectors === 'function') populateAllSelectors();
                              if (typeof window.dedupeStudentSelector === 'function') window.dedupeStudentSelector();
                              if (typeof rankingSelector === 'function') rankingSelector();
                              if (typeof renderAll === 'function') renderAll();
                              if (typeof window.refreshCalendar === 'function') window.refreshCalendar();
                              if (typeof window.applyTKACategories === 'function') window.applyTKACategories();
                              load('js/utbk-menu-sync.js?v=20260828a', function(){
                                try { if (typeof window.refreshAllMenusWithUTBK === 'function') window.refreshAllMenusWithUTBK(); } catch (e) { console.error('UTBK menu refresh:', e); }
                              });
                            } catch (e) { console.error('Post-name-standardization render:', e); }
                          });
                        });
                      });
                    });
                  } catch (error) {
                    console.error('Dashboard initialization error:', error);
                    if (typeof showError === 'function') showError('Gagal memuat data dashboard: ' + error.message);
                  }
                }, 50);
              });
            });
          });
        });
      });
    });
  });
})();
