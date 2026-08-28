/* Keep UTBK snapshot available to every dashboard menu after async injection. */
(function(){
  function refresh(){
    try {
      if(typeof dashboardData==='undefined' || !dashboardData.tests?.some(t=>String(getTestName(t)).toUpperCase().includes('UTBK'))) return;
      if(typeof populateAllSelectors==='function') populateAllSelectors();
      if(typeof rankingSelector==='function') rankingSelector();
      if(typeof renderAll==='function') renderAll();
      if(typeof renderStudentDetail==='function') renderStudentDetail();
      if(typeof trend==='function') trend();
    } catch(e){ console.error('UTBK menu sync:',e); }
  }
  window.refreshAllMenusWithUTBK=refresh;
  setTimeout(refresh,50);
  setTimeout(refresh,300);
  setTimeout(refresh,1000);
})();
