/* Student display-name aliases — applied by email, while preserving the source student_id. */
(function(){
  const EMAIL_ALIASES = {
    'adekgm42qkiz6wiz@anonymous.ruangguru.com': 'Aqhsa Aqila Hidayat'
  };

  function normalize(v){
    return String(v == null ? '' : v).trim().toLowerCase();
  }

  function emailOf(student){
    if(!student) return '';
    const keys = Object.keys(student);
    for(const key of keys){
      const k = normalize(key);
      const value = normalize(student[key]);
      if(value && (k.includes('email') || k === 'mail' || k.includes('username')) && value.includes('@')) return value;
    }
    return normalize(student.email || student.email_address || student.emailAddress || student.mail || student.username || '');
  }

  function getData(){
    try{
      if(window.dashboardData) return window.dashboardData;
      if(typeof dashboardData !== 'undefined') return dashboardData;
    }catch(e){}
    return null;
  }

  function getAliasRecords(){
    const data = getData();
    if(!data || !Array.isArray(data.students)) return [];
    return data.students
      .map(student => ({ student, alias: EMAIL_ALIASES[emailOf(student)] }))
      .filter(x => x.alias && x.student && x.student.student_id != null);
  }

  function applyToObject(student){
    const alias = EMAIL_ALIASES[emailOf(student)];
    if(!alias) return false;
    student.nama = alias;
    student.name = alias;
    student.display_name = alias;
    student.nama_siswa = alias;
    student.student_name = alias;
    student.__display_alias = alias;
    return true;
  }

  function applyAliases(){
    const data = getData();
    if(!data) return;
    if(Array.isArray(data.students)) data.students.forEach(applyToObject);
  }

  /*
     IMPORTANT: the alias must keep the original student_id because all scores
     are keyed by student_id. If the selector points to another student with
     the same display name, scores appear as 0/empty. Always make the visible
     alias option point to the email-matched record's original student_id.
  */
  function syncAliasStudentSelector(){
    const selector = document.getElementById('studentSelector');
    if(!selector) return false;

    const aliases = getAliasRecords();
    if(!aliases.length) return false;

    let changed = false;
    aliases.forEach(({student, alias}) => {
      const canonicalId = String(student.student_id);
      const matching = [...selector.options].filter(o => String(o.value) === canonicalId);
      if(!matching.length) return;

      const canonicalOption = matching[0];
      canonicalOption.textContent = alias;

      /* Remove duplicate visible aliases so the email-matched record wins. */
      [...selector.options].forEach(option => {
        if(option === canonicalOption) return;
        if(normalize(option.textContent) === normalize(alias)) option.remove();
      });

      if(selector.value && normalize(selector.options[selector.selectedIndex]?.textContent) === normalize(alias) && selector.value !== canonicalId){
        selector.value = canonicalId;
        changed = true;
      }
    });

    return changed;
  }

  function fixRenderedStudentProfile(){
    const selector = document.getElementById('studentSelector');
    if(!selector) return;
    const selected = selector.options[selector.selectedIndex];
    if(!selected) return;

    const aliases = getAliasRecords();
    const aliasRecord = aliases.find(x => String(x.student.student_id) === String(selected.value));
    if(!aliasRecord) return;

    const profile = document.getElementById('studentProfile');
    if(!profile) return;
    profile.querySelectorAll('h1,h2,h3,.student-name,.profile-name').forEach(el => {
      if(normalize(el.textContent) === 'adek' || normalize(el.textContent) !== normalize(aliasRecord.alias)){
        if(normalize(el.textContent) === 'adek') el.textContent = aliasRecord.alias;
      }
    });
  }

  function forceCanonicalStudentSelection(){
    const selector = document.getElementById('studentSelector');
    if(!selector) return false;
    const aliases = getAliasRecords();
    if(!aliases.length) return false;

    const selected = selector.options[selector.selectedIndex];
    if(!selected) return false;

    const alias = aliases.find(x => normalize(selected.textContent) === normalize(x.alias));
    if(!alias) return false;

    const canonicalId = String(alias.student.student_id);
    let changed = false;
    if(selector.value !== canonicalId){
      selector.value = canonicalId;
      changed = true;
    }
    try {
      if(typeof currentStudentId !== 'undefined' && String(currentStudentId) !== canonicalId){
        currentStudentId = canonicalId;
        changed = true;
      }
    } catch(e){}
    try { window.currentStudentId = canonicalId; } catch(e){}
    return changed;
  }

  function rerenderIfAliasChanged(changed){
    if(!changed) return;
    try {
      if(typeof renderStudentDetail === 'function') renderStudentDetail();
    } catch(e){ console.error('Alias student rerender:', e); }
  }

  function applyAll(){
    applyAliases();
    const selectorChanged = syncAliasStudentSelector();
    const canonicalChanged = forceCanonicalStudentSelection();
    fixRenderedStudentProfile();
    rerenderIfAliasChanged(selectorChanged || canonicalChanged);
  }

  window.applyStudentNameAliases = applyAll;

  function startObserver(){
    if(!document.body) return;
    let timer = null;
    const observer = new MutationObserver(function(){
      if(timer) return;
      timer = setTimeout(function(){
        timer = null;
        applyAll();
      }, 50);
    });
    observer.observe(document.body, {childList:true, subtree:true});
    applyAll();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserver);
  else startObserver();
})();
