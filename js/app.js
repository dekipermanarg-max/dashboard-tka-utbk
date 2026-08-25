/* Dashboard loader */
(function(){
  const original = document.createElement('script');
  original.src = 'js/app-original.js?v=20260825c';
  original.onload = function(){
    const revisions = document.createElement('script');
    revisions.src = 'js/revisions.js?v=20260825c';
    revisions.onload = function(){
      try { if (typeof initNavigation === 'function') initNavigation(); }
      catch (e) { console.error('initNavigation:', e); }
      try { if (typeof initSelectors === 'function') initSelectors(); }
      catch (e) { console.error('initSelectors:', e); }
      try { if (typeof initDetailSearch === 'function') initDetailSearch(); }
      catch (e) { console.error('initDetailSearch:', e); }
      try { if (typeof initPrint === 'function') initPrint(); }
      catch (e) { console.error('initPrint:', e); }

      setTimeout(async function(){
        try {
          if (typeof loadDashboardData !== 'function') {
            throw new Error('loadDashboardData tidak ditemukan');
          }
          await loadDashboardData();
        } catch (error) {
          console.error('Dashboard initialization error:', error);
          if (typeof showError === 'function') {
            showError('Gagal memuat data dashboard: ' + error.message);
          }
        }
      }, 50);
    };
    revisions.onerror = function(e){
      console.error('Gagal memuat revisions.js', e);
      try {
        if (typeof loadDashboardData === 'function') loadDashboardData();
      } catch (err) {
        console.error(err);
      }
    };
    document.head.appendChild(revisions);
  };
  original.onerror = function(e){
    console.error('Gagal memuat app-original.js', e);
  };
  document.head.appendChild(original);
})();
