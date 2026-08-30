/* Student display-name aliases — applied to data and rendered selectors */
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
      if(value && (k.includes('email') || k === 'mail' || k.includes('username'))){
        if(value.includes('@')) return value;
      }
    }
    return normalize(student.email || student.email_address || student.emailAddress || student.mail || student.username || '');
  }

  function applyToObject(student){
    const alias = EMAIL_ALIASES[emailOf(student)];
    if(!alias) return false;
    student.nama = alias;
    student.name = alias;
    student.display_name = alias;
    student.nama_siswa = alias;
    student.student_name = alias;
    return true;
  }

  function applyAliases(){
    const data = window.dashboardData;
    if(!data) return;

    // Apply to student master data.
    if(Array.isArray(data.students)) data.students.forEach(applyToObject);

    // Also cover result rows in case the selector is sourced from results.
    if(Array.isArray(data.results)) data.results.forEach(applyToObject);
  }

  function fixRenderedSelectors(){
    document.querySelectorAll('select').forEach(select => {
      [...select.options].forEach(option => {
        if(normalize(option.textContent) === 'adek'){
          option.textContent = 'Aqhsa Aqila Hidayat';
        }
      });
    });
  }

  function applyAll(){
    applyAliases();
    fixRenderedSelectors();
  }

  window.applyStudentNameAliases = applyAll;

  // Selector contents can be rebuilt by other dashboard scripts, so keep the
  // display alias applied whenever options are regenerated.
  function startObserver(){
    if(!document.body) return;
    let timer = null;
    const observer = new MutationObserver(function(){
      if(timer) return;
      timer = setTimeout(function(){ timer = null; fixRenderedSelectors(); }, 20);
    });
    observer.observe(document.body, {childList:true, subtree:true});
    fixRenderedSelectors();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
