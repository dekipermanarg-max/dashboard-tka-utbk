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

  function getData(){
    try{
      if(window.dashboardData) return window.dashboardData;
      if(typeof dashboardData !== 'undefined') return dashboardData;
    }catch(e){}
    return null;
  }

  function applyAliases(){
    const data = getData();
    if(!data) return;
    if(Array.isArray(data.students)) data.students.forEach(applyToObject);
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

  /* Fix the profile heading when the selector uses the alias but the raw API name is still rendered. */
  function fixRenderedStudentProfile(){
    const selector = document.getElementById('studentSelector');
    if(!selector) return;
    const selected = selector.options[selector.selectedIndex];
    if(!selected || normalize(selected.textContent) !== 'aqhsa aqila hidayat') return;

    const profile = document.getElementById('studentProfile');
    if(!profile) return;
    profile.querySelectorAll('h1,h2,h3,.student-name,.profile-name').forEach(el => {
      if(normalize(el.textContent) === 'adek'){
        el.textContent = 'Aqhsa Aqila Hidayat';
      }
    });
  }

  function applyAll(){
    applyAliases();
    fixRenderedSelectors();
    fixRenderedStudentProfile();
  }

  window.applyStudentNameAliases = applyAll;

  /* Selector/profile contents can be rebuilt by other dashboard scripts. */
  function startObserver(){
    if(!document.body) return;
    let timer = null;
    const observer = new MutationObserver(function(){
      if(timer) return;
      timer = setTimeout(function(){
        timer = null;
        applyAll();
      }, 20);
    });
    observer.observe(document.body, {childList:true, subtree:true});
    applyAll();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
