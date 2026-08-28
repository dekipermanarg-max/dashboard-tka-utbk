/* Student page revisions: no per-student average; TKA keeps Mapel Wajib + Mapel Pilihan, UTBK uses Subtes only. */
(function(){
  function norm(text){ return String(text || '').replace(/\s+/g,' ').trim().toLowerCase(); }
  function isUTBK(){
    try {
      if(typeof currentStudentTestId==='undefined') return false;
      if(typeof window.isUTBK==='function') return window.isUTBK((window.getTests&&window.getTests().find(t=>String(window.getTestId(t))===String(currentStudentTestId))) || currentStudentTestTestId);
      if(typeof window.getTestName==='function') return /UTBK/i.test(window.getTestName(currentStudentTestId));
    } catch(e) {}
    return false;
  }
  function removeCardByTitle(title){
    const wanted=norm(title);
    document.querySelectorAll('#studentScores .card, #studentScores section, #studentScores .student-section').forEach(card=>{
      const titleEl=card.querySelector('.card-title, h2, h3, .section-title');
      if(titleEl && (norm(titleEl.textContent).replace(/^\S+\s+/,'')===wanted || norm(titleEl.textContent).includes(wanted))) card.remove();
    });
  }
  function renameCardTitle(from,to){
    const wanted=norm(from);
    document.querySelectorAll('#studentScores .card-title, #studentScores h2, #studentScores h3, #studentScores .section-title').forEach(el=>{
      const text=norm(el.textContent);
      if(text===wanted || text.includes(wanted)) el.textContent=to;
    });
  }
  function removeAverageKpi(){
    const profile=document.getElementById('studentProfile');
    if(!profile) return;
    profile.querySelectorAll('.kpi-card').forEach(card=>{
      const label=card.querySelector('.kpi-label');
      if(label && norm(label.textContent).startsWith('rata-rata')) card.remove();
    });
  }
  function applyStudentSummary(){
    const profile=document.getElementById('studentProfile');
    const scores=document.getElementById('studentScores');
    if(!profile) return;
    removeAverageKpi();

    /* UTBK: only Subtes. TKA: keep Mapel Wajib and Mapel Pilihan. */
    if(scores && isUTBK()){
      removeCardByTitle('Mapel Wajib');
      renameCardTitle('Mapel Pilihan','Subtes');
    }

    if(typeof currentStudentId==='undefined' || typeof currentStudentTestId==='undefined') return;
    if(typeof getStudentResults!=='function' || typeof getSubtestName!=='function' || typeof getScore!=='function') return;
    const results=getStudentResults(currentStudentId,currentStudentTestId).map(r=>({r,value:getScore(r)})).filter(x=>x.value!==null);
    if(!results.length) return;
    const highest=Math.max(...results.map(x=>x.value));
    const lowest=Math.min(...results.map(x=>x.value));
    const highNames=[...new Set(results.filter(x=>x.value===highest).map(x=>getSubtestName(x.r.subtest_id)))];
    const lowNames=[...new Set(results.filter(x=>x.value===lowest).map(x=>getSubtestName(x.r.subtest_id)))];
    profile.querySelectorAll('.kpi-card').forEach(card=>{
      const label=card.querySelector('.kpi-label'); if(!label) return;
      const text=norm(label.textContent);
      if(text==='tertinggi' || text.startsWith('tertinggi')){ label.textContent='Tertinggi'; const note=card.querySelector('.kpi-note'); if(note) note.textContent=highNames.join(', '); }
      if(text==='terendah' || text.startsWith('terendah')){ label.textContent='Terendah'; const note=card.querySelector('.kpi-note'); if(note) note.textContent=lowNames.join(', '); }
    });
  }
  function install(){
    if(typeof window.renderStudentDetail==='function' && !window.renderStudentDetail.__studentFix){
      const original=window.renderStudentDetail;
      const wrapped=function(){ const result=original.apply(this,arguments); setTimeout(applyStudentSummary,0); setTimeout(applyStudentSummary,100); setTimeout(applyStudentSummary,400); return result; };
      wrapped.__studentFix=true; window.renderStudentDetail=wrapped;
    }
    applyStudentSummary(); setTimeout(applyStudentSummary,100); setTimeout(applyStudentSummary,500);
  }
  let observerTimer=null;
  const observer=new MutationObserver(function(){ if(observerTimer) return; observerTimer=setTimeout(function(){ observerTimer=null; applyStudentSummary(); },50); });
  function startObserver(){ const target=document.getElementById('studentScores') || document.body; observer.observe(target,{childList:true,subtree:true}); install(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(startObserver,100)); else setTimeout(startObserver,100);
  window.applyStudentSummaryFix=applyStudentSummary;
})();
