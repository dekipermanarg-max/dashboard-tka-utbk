/* Dashboard loader — stable load order + UI polish */
(function(){
  const polish=document.createElement('link');
  polish.rel='stylesheet';
  polish.href='css/polish.css?v=20260830a';
  document.head.appendChild(polish);

  function load(src, onload){
    const s=document.createElement('script'); s.src=src; s.onload=onload||null; s.onerror=e=>console.error('Gagal memuat',src,e); document.head.appendChild(s);
  }
  function installStudentSelectorGuard(){
    function norm(v){return String(v==null?'':v).normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();}
    function dedupe(select){if(!select)return;const seen=new Set();[...select.options].forEach(o=>{const k=norm(o.textContent);if(!k)return;if(seen.has(k))o.remove();else seen.add(k);});}
    function run(){dedupe(document.getElementById('studentSelector'));document.querySelectorAll('select').forEach(s=>{const id=norm(s.id),aria=norm(s.getAttribute('aria-label'));if(id.includes('student')||aria.includes('student')||aria.includes('siswa'))dedupe(s);});}
    const originalPopulate=window.populateAllSelectors;
    if(typeof originalPopulate==='function'&&!originalPopulate.__dedupeWrapped){function wrappedPopulate(){const r=originalPopulate.apply(this,arguments);run();requestAnimationFrame(run);setTimeout(run,100);return r;}wrappedPopulate.__dedupeWrapped=true;window.populateAllSelectors=wrappedPopulate;}
    run();requestAnimationFrame(run);setTimeout(run,100);setTimeout(run,500);
  }

  load('js/app-original.js?v=20260825h',function(){
    load('js/revisions.js?v=20260830i',function(){
      load('js/final-revisions.js?v=20260830i',function(){
        load('js/restore-revisions.js?v=20260825a',function(){
          load('js/student-fix.js?v=20260830b',function(){
            load('js/calendar-fix.js?v=20260828b',function(){
              load('js/tka-category-fix.js?v=20260830b',function(){
                load('js/tka-mapel-student-status.js?v=20260830a',function(){
                  load('js/student-name-alias.js?v=20260830f',function(){
                    try{if(typeof initNavigation==='function')initNavigation();}catch(e){console.error('initNavigation:',e);}
                    try{if(typeof initSelectors==='function')initSelectors();}catch(e){console.error('initSelectors:',e);}
                    try{if(typeof initDetailSearch==='function')initDetailSearch();}catch(e){console.error('initDetailSearch:',e);}
                    try{if(typeof initPrint==='function')initPrint();}catch(e){console.error('initPrint:',e);}
                    setTimeout(async function(){
                      try{
                        if(typeof loadDashboardData!=='function')throw new Error('loadDashboardData tidak ditemukan');
                        await loadDashboardData(); window.dashboardData=dashboardData;
                        if(typeof window.applyStudentNameAliases==='function')window.applyStudentNameAliases();
                        load('js/utbk-data.js?v=20260828e',function(){
                          load('js/utbk-kpi-detail.js?v=20260828a',function(){
                            load('js/test-name-fix.js?v=20260828a',function(){
                              load('js/student-selector-dedupe.js?v=20260830e',function(){
                                try{
                                  installStudentSelectorGuard();
                                  if(typeof window.restoreDashboardUI==='function')window.restoreDashboardUI();
                                  if(typeof window.applyStudentSummaryFix==='function')window.applyStudentSummaryFix();
                                  if(typeof populateAllSelectors==='function')populateAllSelectors();
                                  if(typeof window.dedupeStudentSelector==='function')window.dedupeStudentSelector();
                                  if(typeof rankingSelector==='function')rankingSelector();
                                  if(typeof renderAll==='function')renderAll();
                                  if(typeof window.refreshCalendar==='function')window.refreshCalendar();
                                  if(typeof window.applyTKACategories==='function')window.applyTKACategories();
                                  if(typeof window.applyTKAMapelStudentStatus==='function')window.applyTKAMapelStudentStatus();
                                  if(typeof window.applyStudentNameAliases==='function')window.applyStudentNameAliases();
                                  if(typeof window.applyOverviewImprovements==='function')window.applyOverviewImprovements();
                                  installStudentSelectorGuard();
                                  if(typeof window.dedupeStudentSelector==='function')window.dedupeStudentSelector();
                                  load('js/utbk-menu-sync.js?v=20260828a',function(){try{if(typeof window.refreshAllMenusWithUTBK==='function')window.refreshAllMenusWithUTBK();}catch(e){console.error('UTBK menu refresh:',e);}load('js/tka-legend-visibility.js?v=20260830a');});
                                }catch(e){console.error('Post-name-standardization render:',e);}
                              });
                            });
                          });
                        });
                      }catch(error){console.error('Dashboard initialization error:',error);if(typeof showError==='function')showError('Gagal memuat data dashboard: '+error.message);}
                    },50);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
})();
