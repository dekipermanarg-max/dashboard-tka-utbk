/* Student page revisions: no per-student average; UTBK uses subtests instead of subject sections. */
(function(){
  function removeCardByTitle(title){
    const wanted=String(title).trim().toLowerCase();
    document.querySelectorAll('#studentScores .card, #studentScores section, #studentScores .student-section').forEach(card=>{
      const titleEl=card.querySelector('.card-title, h2, h3, .section-title');
      if(titleEl && titleEl.textContent.trim().toLowerCase()===wanted){
        card.remove();
      }
    });
  }

  function renameCardTitle(from,to){
    const wanted=String(from).trim().toLowerCase();
    document.querySelectorAll('#studentScores .card-title, #studentScores h2, #studentScores h3, #studentScores .section-title').forEach(el=>{
      if(el.textContent.trim().toLowerCase()===wanted) el.textContent=to;
    });
  }

  function applyStudentSummary(){
    const profile=document.getElementById('studentProfile');
    const scores=document.getElementById('studentScores');
    if(!profile) return;

    /* Per-student average is not needed. */
    profile.querySelectorAll('.kpi-card').forEach(card=>{
      const label=card.querySelector('.kpi-label');
      if(label && label.textContent.trim().toLowerCase()==='rata-rata') card.remove();
    });

    /* For UTBK, remove the generic Mapel Wajib section and call the
       remaining Mapel Pilihan section simply Subtes. */
    if(scores){
      removeCardByTitle('Mapel Wajib');
      renameCardTitle('Mapel Pilihan','Subtes');
    }

    if(typeof currentStudentId==='undefined' || typeof currentStudentTestId==='undefined') return;
    if(typeof getStudentResults!=='function' || typeof getSubtestName!=='function' || typeof getScore!=='function') return;

    const results=getStudentResults(currentStudentId,currentStudentTestId)
      .map(r=>({r,value:getScore(r)}))
      .filter(x=>x.value!==null);
    if(!results.length) return;

    const highest=Math.max(...results.map(x=>x.value));
    const lowest=Math.min(...results.map(x=>x.value));
    const highNames=[...new Set(results.filter(x=>x.value===highest).map(x=>getSubtestName(x.r.subtest_id)))];
    const lowNames=[...new Set(results.filter(x=>x.value===lowest).map(x=>getSubtestName(x.r.subtest_id)))];

    profile.querySelectorAll('.kpi-card').forEach(card=>{
      const label=card.querySelector('.kpi-label');
      if(!label) return;
      const text=label.textContent.trim().toLowerCase();
      if(text==='tertinggi' || text.startsWith('tertinggi')){
        label.textContent='Tertinggi';
        const note=card.querySelector('.kpi-note');
        if(note) note.textContent=highNames.join(', ');
      }
      if(text==='terendah' || text.startsWith('terendah')){
        label.textContent='Terendah';
        const note=card.querySelector('.kpi-note');
        if(note) note.textContent=lowNames.join(', ');
      }
    });
  }

  function install(){
    if(typeof window.renderStudentDetail==='function' && !window.renderStudentDetail.__studentFix){
      const original=window.renderStudentDetail;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        setTimeout(applyStudentSummary,0);
        setTimeout(applyStudentSummary,150);
        return result;
      };
      wrapped.__studentFix=true;
      window.renderStudentDetail=wrapped;
    }
    applyStudentSummary();
    setTimeout(applyStudentSummary,100);
    setTimeout(applyStudentSummary,500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
  else setTimeout(install,100);

  window.applyStudentSummaryFix=applyStudentSummary;
})();
