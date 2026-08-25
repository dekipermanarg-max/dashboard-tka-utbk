/* Dashboard loader */
(function(){
  const original = document.createElement('script');
  original.src = 'app-original.js';
  original.onload = function(){
    const revisions = document.createElement('script');
    revisions.src = 'revisions.js';
    revisions.onload = async function(){
      // app-original.js normally initializes on DOMContentLoaded.
      // Because this loader itself is loaded after the document is ready,
      // that event has already fired. Start the original initialization
      // explicitly after both scripts are available.
      try {
        initNavigation();
        initSelectors();
        initDetailSearch();
        initPrint();
        await loadDashboardData();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        if (typeof showError === 'function') {
          showError('Gagal menginisialisasi dashboard: ' + error.message);
        }
      }
    };
    revisions.onerror = function(){
      console.error('Gagal memuat revisions.js');
    };
    document.head.appendChild(revisions);
  };
  original.onerror = function(){
    console.error('Gagal memuat app-original.js');
  };
  document.head.appendChild(original);
})();