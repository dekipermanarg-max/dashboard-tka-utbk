/* Student selector dedupe
   Keeps one option per student identity/name so duplicate API rows do not
   appear twice in the Siswa dropdown. Does not mutate dashboardData/results.
*/
(function(){
  function norm(v){
    return String(v || '').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function isStudentSelect(select){
    const options=[...select.options];
    if(options.length < 2) return false;
    const knownNames=new Set((window.dashboardData?.students || []).map(s=>norm(s?.nama)));
    if(!knownNames.size) return false;
    const matches=options.filter(o=>knownNames.has(norm(o.textContent))).length;
    return matches >= Math.min(2, knownNames.size);
  }

  function dedupe(){
    document.querySelectorAll('select').forEach(select=>{
      if(!isStudentSelect(select)) return;
      const seen=new Set();
      [...select.options].forEach(option=>{
        const key=norm(option.textContent);
        if(!key) return;
        if(seen.has(key)) option.remove();
        else seen.add(key);
      });
    });
  }

  let timer=null;
  function schedule(){
    if(timer) return;
    timer=setTimeout(function(){ timer=null; dedupe(); },30);
  }

  const observer=new MutationObserver(schedule);
  function start(){
    observer.observe(document.body,{childList:true,subtree:true});
    dedupe();
    setTimeout(dedupe,100);
    setTimeout(dedupe,500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();

  window.dedupeStudentSelector=dedupe;
})();
