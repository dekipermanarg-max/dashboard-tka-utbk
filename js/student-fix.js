/* Student page revisions: no per-student average; TKA keeps Mapel Wajib + Mapel Pilihan, UTBK uses Subtes only. */
(function(){
  function norm(text){ return String(text || '').replace(/\s+/g,' ').trim().toLowerCase(); }

  /* =========================================================
     STUDENT NAME ALIAS
     Adek's Ruangguru anonymous email belongs to Aqhsa Aqila Hidayat.
     Wherever this student record is displayed, use the real display name.
  ========================================================= */
  const STUDENT_EMAIL_ALIASES = {
    'adekgm42qkiz6wiz@anonymous.ruangguru.com': 'Aqhsa Aqila Hidayat'
  };

  function getStudentEmail(student){
    if(!student) return '';
    const direct = [
      student.email,
      student.email_siswa,
      student.email_student,
      student.email_address,
      student.username,
      student.Email,
      student['Email Siswa'],
      student['Email Student'],
      student['email siswa'],
      student['email student']
    ];
    for(const value of direct){
      const email=String(value || '').trim().toLowerCase();
      if(STUDENT_EMAIL_ALIASES[email]) return email;
    }
    /* Fallback: API field naming can vary. Inspect every scalar field. */
    for(const value of Object.values(student)){
      const email=String(value || '').trim().toLowerCase();
      if(STUDENT_EMAIL_ALIASES[email]) return email;
    }
    return '';
  }

  function getStudentsData(){
    try{
      if(window.dashboardData && Array.isArray(window.dashboardData.students)) return window.dashboardData.students;
      if(typeof dashboardData !== 'undefined' && dashboardData && Array.isArray(dashboardData.students)) return dashboardData.students;
    }catch(e){}
    return [];
  }

  function applyStudentNameAliases(){
    try{
      const students=getStudentsData();
      if(!students.length) return;
      students.forEach(student => {
        const email = getStudentEmail(student);
        if(STUDENT_EMAIL_ALIASES[email]){
          student.nama = STUDENT_EMAIL_ALIASES[email];
          student.name = STUDENT_EMAIL_ALIASES[email];
        }
      });
    }catch(e){ console.error('Student name alias:', e); }
  }

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
    applyStudentNameAliases();
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

  function repopulateStudentSelector(){
    try{
      applyStudentNameAliases();
      if(typeof window.populateStudentSelector==='function' && window.populateStudentSelector.__studentAliasFix) return;
      if(typeof window.populateStudentSelector==='function') window.populateStudentSelector();
    }catch(e){ console.error('Student selector repopulate:',e); }
  }

  function install(){
    applyStudentNameAliases();

    /* Re-apply aliases before the native student selector is populated. */
    if(typeof window.populateStudentSelector==='function' && !window.populateStudentSelector.__studentAliasFix){
      const originalPopulateStudentSelector=window.populateStudentSelector;
      const wrappedPopulateStudentSelector=function(){
        applyStudentNameAliases();
        return originalPopulateStudentSelector.apply(this,arguments);
      };
      wrappedPopulateStudentSelector.__studentAliasFix=true;
      window.populateStudentSelector=wrappedPopulateStudentSelector;
    }

    if(typeof window.renderStudentDetail==='function' && !window.renderStudentDetail.__studentFix){
      const original=window.renderStudentDetail;
      const wrapped=function(){
        applyStudentNameAliases();
        const result=original.apply(this,arguments);
        setTimeout(applyStudentSummary,0);
        setTimeout(applyStudentSummary,100);
        setTimeout(applyStudentSummary,400);
        return result;
      };
      wrapped.__studentFix=true;
      window.renderStudentDetail=wrapped;
    }
    applyStudentSummary(); setTimeout(applyStudentSummary,100); setTimeout(applyStudentSummary,500);
  }

  let observerTimer=null;
  const observer=new MutationObserver(function(){
    if(observerTimer) return;
    observerTimer=setTimeout(function(){ observerTimer=null; applyStudentSummary(); },50);
  });

  function startObserver(){
    const target=document.getElementById('studentScores') || document.body;
    observer.observe(target,{childList:true,subtree:true});
    install();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(startObserver,100));
  else setTimeout(startObserver,100);

  window.applyStudentSummaryFix=applyStudentSummary;
  window.applyStudentNameAliases=applyStudentNameAliases;
})();
