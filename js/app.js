/* Dashboard loader */
(function(){
  const logoFix = document.createElement('script');
  logoFix.src = 'js/logo-fix.js?v=20260825f';
  logoFix.onerror = function(e){ console.error('Gagal memuat logo-fix.js', e); };
  document.head.appendChild(logoFix);

  const original = document.createElement('script');
  original.src = 'app-original.js?v=20260825e';
  original.onload = function(){
    const revisions = document.createElement('script');
    revisions.src = 'revisions.js?v=20260825e';
    revisions.onload = function(){
      const finalRevisions = document.createElement('script');
      finalRevisions.src = 'final-revisions.js?v=20260825e';
      finalRevisions.onload = function(){
        try { if (typeof initNavigation === 'function') initNavigation(); } catch (e) { console.error('initNavigation:', e); }
        try { if (typeof initSelectors === 'function') initSelectors(); } catch (e) { console.error('initSelectors:', e); }
        try { if (typeof initDetailSearch === 'function') initDetailSearch(); } catch (e) { console.error('initDetailSearch:', e); }
        try { if (typeof initPrint === 'function') initPrint(); } catch (e) { console.error('initPrint:', e); }
        setTimeout(async function(){
          try {
            if (typeof loadDashboardData !== 'function') throw new Error('loadDashboardData tidak ditemukan');
            await loadDashboardData();
          } catch (error) {
            console.error('Dashboard initialization error:', error);
            if (typeof showError === 'function') showError('Gagal memuat data dashboard: ' + error.message);
          }
        }, 50);
      };
      finalRevisions.onerror = function(e){ console.error('Gagal memuat final-revisions.js', e); };
      document.head.appendChild(finalRevisions);
    };
    revisions.onerror = function(e){ console.error('Gagal memuat revisions.js', e); };
    document.head.appendChild(revisions);
  };
  original.onerror = function(e){ console.error('Gagal memuat app-original.js', e); };
  document.head.appendChild(original);
})();
