/* Student page revisions: no per-student average; show subjects for highest/lowest. */
(function(){
  function applyStudentSummary(){
    const profile=document.getElementById('studentProfile');
    if(!profile || typeof currentStudentId==='undefined' || typeof currentStudentTestId==='undefined') return;
    profile.querySelectorAll('.kpi-card').forEach(card=>{
      const label=card.querySelector('.kpi-label');
      if(label && label.textContent.trim().toLowerCase()==='rata-rata') card.remove();
    });
    if(typeof getStudentResults!=='function' || typeof getSubtestName!=='function' || typeof getScore!=='function') return;
    const results=getStudentResults(currentStudentId,currentStudentTestId).map(r=>({r,value:getScore(r)})).filter(x=>x.value!==null);
    if(!results.length) return;
    const highest=Math.max(...results.map(x=>x.value));
    const lowest=Math.min(...results.map(x=>x.value));
    const highNames=[...new Set(results.filter(x=>x.value===highest).map(x=>getSubtestName(x.r.subtest_id)))];
    const lowNames=[...new Set(results.filter(x=>x.value===lowest).map(x=>getSubtestName(x.r.subtest_id)))];
    profile.querySelectorAll('.kpi-card').forEach(card=>{
      const label=card.querySelector('.kpi-label'); if(!label) return;
      const text=label.textContent.trim().toLowerCase();
      if(text==='tertinggi') label.textContent='Tertinggi — '+highNames.join(', ');
      if(text==='terendah') label.textContent='Terendah — '+lowNames.join(', ');
    });
  }
  function install(){
    if(typeof window.renderStudentDetail==='function' && !window.renderStudentDetail.__studentFix){
      const original=window.renderStudentDetail;
      const wrapped=function(){ const result=original.apply(this,arguments); setTimeout(applyStudentSummary,0); return result; };
      wrapped.__studentFix=true;
      window.renderStudentDetail=wrapped;
    }
    setTimeout(applyStudentSummary,100);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100)); else setTimeout(install,100);
  window.applyStudentSummaryFix=applyStudentSummary;
})();
