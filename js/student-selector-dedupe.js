/* Student selector dedupe
   Identity is EMAIL-first, not name-first.
   A student's source name may change, but the same email represents the
   same student. This prevents duplicate labels when the source contains
   repeated records for the same email.
*/
(function(){
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

  function getStudents(){
    try {
      const d = window.dashboardData || (typeof dashboardData !== 'undefined' ? dashboardData : null);
      return d && Array.isArray(d.students) ? d.students : [];
    } catch(e) {
      return [];
    }
  }

  function studentEmail(student){
    if(!student) return '';
    const fields = [
      student.email,
      student.Email,
      student.email_siswa,
      student.student_email,
      student.studentEmail,
      student.emailSiswa
    ];
    for(const value of fields){
      const email = normEmail(value);
      if(email) return email;
    }
    return '';
  }

  function dedupeSelect(select){
    if(!select) return;

    const students = getStudents();
    const byId = new Map();
    students.forEach(function(student){
      if(student && student.student_id != null){
        byId.set(String(student.student_id), student);
      }
    });

    const selectedValue = String(select.value || '');
    const seenIdentity = new Set();

    [...select.options].forEach(function(option){
      const student = byId.get(String(option.value));
      const email = studentEmail(student);
      const identity = email || ('name:' + norm(option.textContent));

      if(identity === 'name:') return;

      if(seenIdentity.has(identity)) {
        if(String(option.value) === selectedValue) {
          const keeper = [...select.options].find(function(o){
            if(o === option) return false;
            const s = byId.get(String(o.value));
            const e = studentEmail(s);
            const k = e || ('name:' + norm(o.textContent));
            return k === identity && !o.hidden;
          });
          if(keeper) select.value = keeper.value;
        }
        option.remove();
        return;
      }

      seenIdentity.add(identity);
    });
  }

  function dedupe(){
    const primary = document.getElementById('studentSelector');
    if(primary) dedupeSelect(primary);

    document.querySelectorAll('select').forEach(function(select){
      if(select === primary) return;
      const id = String(select.id || '').toLowerCase();
      const aria = String(select.getAttribute('aria-label') || '').toLowerCase();
      if(id.includes('student') || aria.includes('student') || aria.includes('siswa')) {
        dedupeSelect(select);
      }
    });
  }

  let timer = null;
  let running = false;
  function schedule(){
    if(timer) return;
    timer = setTimeout(function(){
      timer = null;
      if(running) return;
      running = true;
      try { dedupe(); } finally { running = false; }
    }, 50);
  }

  function start(){
    dedupe();
    setTimeout(dedupe, 100);
    setTimeout(dedupe, 500);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.dedupeStudentSelector = dedupe;
})();
