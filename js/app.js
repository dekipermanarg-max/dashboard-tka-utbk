/* Dashboard loader */
(function(){
  const original = document.createElement('script');
  original.src = 'app-original.js?v=20260825b';
  original.onload = function(){
    const revisions = document.createElement('script');
    revisions.src = 'revisions.js?v=20260825b';
    revisions.onload = function(){
      // The original script waits for DOMContentLoaded, but this loader
      // is itself loaded after the DOM is ready. Initialize explicitly.
      try { if (typeof initNavigation === 'function') initNavigation(); }
      catch (e) { console.error('initNavigation:', e); }
      try { if (typeof initSelectors === 'function') initSelectors(); }
      catch (e) { console.error('initSelectors:', e); }
      try { if (typeof initDetailSearch === 'function') initDetailSearch(); }
      catch (e) { console.error('initDetailSearch:', e); }
      try { if (typeof initPrint === 'function') initPrint(); }
      catch (e) { console.error('initPrint:', e); }

      // Always attempt the data load even if one UI initializer fails.
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
      // Data should still load even if revisions fail.
      try { if (typeof loadDashboardData === 'function') loadDashboardData(); }
      catch (err) { console.error(err); }
    };
    document.head.appendChild(revisions);
  };
  original.onerror = function(e){
    console.error('Gagal memuat app-original.js', e);
  };
  document.head.appendChild(original);
})();