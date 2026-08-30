/* Overview student count — email is the primary identity key. */
(function(){
  function norm(v){return String(v==null?'':v).normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();}
  function emailOf(s){
    if(!s)return '';
    const vals=[s.email,s.Email,s.email_siswa,s.email_student,s.student_email,s.studentEmail,s.email_address,s['Email Siswa'],s['Email Student'],s['email siswa'],s['email student'],s.username];
    for(const v of vals){const e=String(v||'').trim().toLowerCase();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return e;}
    try{for(const v of Object.values(s)){if(v==null||typeof v==='object')continue;const e=String(v).trim().toLowerCase();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return e;}}catch(e){}
    return '';
  }
  function canonicalName(s){
    const n=norm(s?.nama||s?.name||s?.nama_siswa||s?.student_name||'');
    if(n==='adek')return 'aqhsa aqila hidayat';
    if(n==='eqbal atha maravile'||n==='eqbal atha marvile')return 'eqbal atha marvile';
    if(n==='muhammad zidan alfarabi'||n==='muhammad zidan alfaribi')return 'muhammad zidan alfaribi';
    return n;
  }
  function identity(s){return emailOf(s)||canonicalName(s);}
  function uniqueStudents(students){
    const seen=new Set(),out=[];
    (students||[]).forEach(s=>{const k=identity(s);if(!k||!seen.has(k)){if(k)seen.add(k);out.push(s);}});
    return out;
  }
  const original=window.calculateOverview;
  if(typeof original==='function'&&!original.__emailUniqueCount){
    const wrapped=function(testId){
      const result=original.apply(this,arguments);
      const students=(window.dashboardData&&Array.isArray(window.dashboardData.students))?window.dashboardData.students:[];
      const unique=uniqueStudents(students);
      const participantIds=new Set((typeof getResults==='function'?getResults(testId):[]).map(r=>String(r.student_id)));
      const participantStudents=students.filter(s=>participantIds.has(String(s.student_id)));
      const uniqueParticipantCount=uniqueStudents(participantStudents).length;
      return {...result,totalStudents:unique.length,participants:uniqueParticipantCount,notParticipants:Math.max(unique.length-uniqueParticipantCount,0)};
    };
    wrapped.__emailUniqueCount=true;
    window.calculateOverview=wrapped;
  }
  window.getUniqueBranchStudentCount=function(){
    const students=(window.dashboardData&&Array.isArray(window.dashboardData.students))?window.dashboardData.students:[];
    return uniqueStudents(students).length;
  };
})();
