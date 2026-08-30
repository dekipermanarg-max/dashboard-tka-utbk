/* Student display-name alias
   Identity is based on EMAIL, not the student's current input name.
   The anonymous Ruangguru record may later arrive with a different name,
   but the web must keep the established display name.
*/
(function(){
  const ALIAS_EMAIL = 'adekgm42qkiz6wiz@anonymous.ruangguru.com';
  const DISPLAY_NAME = 'Aqhsa Aqila Hidayat';

  function norm(v){
    return String(v == null ? '' : v)
      .normalize('NFKC')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function normEmail(v){
    return String(v == null ? '' : v).trim().toLowerCase();
  }

  function getData(){
    try { return window.dashboardData || (typeof dashboardData !== 'undefined' ? dashboardData : null); }
    catch(e){ return null; }
  }

  /*
     IMPORTANT:
     Email is the identity key. Never use the student's current name as the
     deciding factor, because the source may later change Adek to another name.
  */
  function isAliasStudent(student){
    if(!student) return false;
    const emails = [
      student.email,
      student.Email,
      student.email_siswa,
      student.student_email,
      student.studentEmail,
      student.emailSiswa
    ];
    return emails.some(function(email){
      return normEmail(email) === ALIAS_EMAIL;
    });
  }

  function applyDataAlias(){
    const d=getData();
    if(!d || !Array.isArray(d.students)) return [];

    const matched=[];
    d.students.forEach(function(s){
      if(!isAliasStudent(s)) return;

      /* Keep every source identity/ID intact; only standardize display fields. */
      s.nama=DISPLAY_NAME;
      s.name=DISPLAY_NAME;
      s.display_name=DISPLAY_NAME;
      s.nama_siswa=DISPLAY_NAME;
      s.student_name=DISPLAY_NAME;
      s.__display_alias=DISPLAY_NAME;
      matched.push(s);
    });

    return matched;
  }

  /* Rename visible options for every matching student ID. */
  function syncStudentSelector(students){
    const selector=document.getElementById('studentSelector');
    if(!selector || !students.length) return false;

    const ids=new Set(
      students
        .filter(s => s && s.student_id != null)
        .map(s => String(s.student_id))
    );

    let found=false;
    [...selector.options].forEach(function(o){
      if(ids.has(String(o.value))){
        o.textContent=DISPLAY_NAME;
        found=true;
      }
    });
    return found;
  }

  /*
     If another script rebuilds the selector from source data, replace the
     anonymous raw label too. This is a display-only operation.
  */
  function renameRawAdekEverywhere(){
    document.querySelectorAll('select option').forEach(function(o){
      if(norm(o.textContent)==='adek') o.textContent=DISPLAY_NAME;
    });
    document.querySelectorAll('h1,h2,h3,.student-name,.profile-name,.student-header-name').forEach(function(el){
      if(norm(el.textContent)==='adek') el.textContent=DISPLAY_NAME;
    });
  }

  function applyAll(){
    const students=applyDataAlias();
    syncStudentSelector(students);
    renameRawAdekEverywhere();
  }

  /* Public helper for any future renderer that needs the canonical label. */
  window.getStudentDisplayName=function(student){
    return isAliasStudent(student) ? DISPLAY_NAME :
      String(
        student?.display_name ||
        student?.nama ||
        student?.name ||
        ''
      );
  };

  window.applyStudentNameAliases=applyAll;

  function start(){
    applyAll();
    if(!document.body) return;
    let timer=null;
    const observer=new MutationObserver(function(){
      if(timer) return;
      timer=setTimeout(function(){timer=null;applyAll();},30);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
