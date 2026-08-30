/* Student display-name alias
   Adek is the Ruangguru anonymous record for Aqhsa Aqila Hidayat.
   Keep the original student_id so all TKA/UTBK scores stay attached.
*/
(function(){
  const RAW_NAME = 'adek';
  const DISPLAY_NAME = 'Aqhsa Aqila Hidayat';

  function norm(v){
    return String(v == null ? '' : v).replace(/\s+/g,' ').trim().toLowerCase();
  }

  function getData(){
    try { return window.dashboardData || (typeof dashboardData !== 'undefined' ? dashboardData : null); }
    catch(e){ return null; }
  }

  function getAliasStudent(){
    const d=getData();
    if(!d || !Array.isArray(d.students)) return null;
    return d.students.find(s => norm(s?.nama)===RAW_NAME || norm(s?.name)===RAW_NAME) || null;
  }

  function applyDataAlias(){
    const s=getAliasStudent();
    if(!s) return null;
    s.nama=DISPLAY_NAME;
    s.name=DISPLAY_NAME;
    s.display_name=DISPLAY_NAME;
    s.nama_siswa=DISPLAY_NAME;
    s.student_name=DISPLAY_NAME;
    s.__display_alias=DISPLAY_NAME;
    return s;
  }

  /* Rename the visible option only. Never change option.value/student_id. */
  function syncStudentSelector(student){
    const selector=document.getElementById('studentSelector');
    if(!selector || !student || student.student_id==null) return false;
    const id=String(student.student_id);
    let found=false;
    [...selector.options].forEach(o=>{
      if(String(o.value)===id){
        o.textContent=DISPLAY_NAME;
        found=true;
      }
    });
    return found;
  }

  /* If another script rebuilds the selector from raw data, catch Adek again. */
  function renameRawAdekEverywhere(){
    document.querySelectorAll('select option').forEach(o=>{
      if(norm(o.textContent)===RAW_NAME) o.textContent=DISPLAY_NAME;
    });
    document.querySelectorAll('h1,h2,h3,.student-name,.profile-name,.student-header-name').forEach(el=>{
      if(norm(el.textContent)===RAW_NAME) el.textContent=DISPLAY_NAME;
    });
  }

  function applyAll(){
    const student=applyDataAlias();
    syncStudentSelector(student);
    renameRawAdekEverywhere();
  }

  window.applyStudentNameAliases=applyAll;

  function start(){
    applyAll();
    if(!document.body) return;
    let timer=null;
    const observer=new MutationObserver(()=>{
      if(timer) return;
      timer=setTimeout(()=>{timer=null;applyAll();},30);
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
