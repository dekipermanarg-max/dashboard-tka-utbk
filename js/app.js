/* Dashboard loader — stable load order */
(function(){
  function load(src, onload){
    const s = document.createElement('script');
    s.src = src;
    s.onload = onload || null;
    s.onerror = function(e){ console.error('Gagal memuat', src, e); };
    document.head.appendChild(s);
  }

  /* Load the real dashboard core directly. The old wrapper caused the
     revision scripts to run before the core functions existed. */
  load('js/app-original.js?v=20260825h', function(){
    load('js/revisions.js?v=20260825h', function(){
      load('js/final-revisions.js?v=20260825h', function(){
        load('js/restore-revisions.js?v=20260825a', function(){
          try { if (typeof initNavigation === 'function') initNavigation(); } catch (e) { console.error('initNavigation:', e); }
          try { if (typeof initSelectors === 'function') initSelectors(); } catch (e) { console.error('initSelectors:', e); }
          try { if (typeof initDetailSearch === 'function') initDetailSearch(); } catch (e) { console.error('initDetailSearch:', e); }
          try { if (typeof initPrint === 'function') initPrint(); } catch (e) { console.error('initPrint:', e); }
          setTimeout(async function(){
            try {
              if (typeof loadDashboardData !== 'function') throw new Error('loadDashboardData tidak ditemukan');
              await loadDashboardData();
              if (typeof window.restoreDashboardUI === 'function') window.restoreDashboardUI();
            } catch (error) {
              console.error('Dashboard initialization error:', error);
              if (typeof showError === 'function') showError('Gagal memuat data dashboard: ' + error.message);
            }
          }, 50);
        });
      });
    });
  });
})();
