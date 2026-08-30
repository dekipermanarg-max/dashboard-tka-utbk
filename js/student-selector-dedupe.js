/* Student selector dedupe — EMAIL FIRST
   The student's email is the identity key. Names are display labels only.
   Known source-name variants are canonicalized only when the email is not
   exposed by the selector data, so the web keeps one stable display name.
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

  /*
     These are source-data spelling variants of the same students.
     Keep the existing web display names as the canonical labels.
  */
  const NAME_ALIASES = new Map([
    ['eqbal atha marvile', 'Eqbal Atha Marvile'],
    ['eqbal atha maravile', 'Eqbal Atha Marvile'],
    ['muhammad zidan alfarabi', 'Muhammad Zidan Alfarabi'],
    ['muhammad zidan alfaribi', 'Muhammad Zidan Alfarabi']
  ]);

  function canonicalName(v){
    const n = norm(v);
    return NAME_ALIASES.get(n) || String(v == null ? '' : v).replace(/\s+/g,' ').trim();
  }

  function canonicalKey(v){
    const n = norm(v);
    return norm(NAME_ALIASES.get(n) || n);
  }

  function getStudents(){
    try {
      const d = window.dashboardData || (typeof dashboardData !== 'undefined' ? dashboardData : null);
      return d && Array.isArray(d.students) ? d.students : [];
    } catch(e) { return []; }
  }

  function studentEmail(student){
    if(!student) return '';

    const direct = [
      student.email,
      student.Email,
      student.email_siswa,
      student.email_student,
      student.student_email,
      student.studentEmail,
      student.emailSiswa,
      student.email_address,
      student['Email Siswa'],
      student['Email Student'],
      student['email siswa'],
      student['email student'],
      student.username
    ];

    for(const value of direct){
      const email = normEmail(value);
      if(email && email.includes('@')) return email;
    }

    try {
      for(const value of Object.values(student)){
        if(value == null || typeof value === 'object') continue;
        const email = normEmail(value);
        if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
      }
    } catch(e) {}

    return '';
  }

  function displayNameFor(student, option){
    return canonicalName(
      option?.textContent ||
      student?.display_name ||
      student?.nama ||
      student?.name ||
      student?.nama_siswa ||
      student?.student_name || ''
    );
  }

  function identityFor(student, option){
    const email = studentEmail(student);
    if(email) return 'email:' + email;

    /* Last resort: canonical display name, including known typo variants. */
    const name = canonicalKey(displayNameFor(student, option));
    return name ? 'name:' + name : '';
  }

  function applyCanonicalLabels(select, studentsById){
    [...select.options].forEach(function(option){
      const student = studentsById.get(String(option.value));
      const current = option.textContent || '';
      const canonical = displayNameFor(student, option);
      if(canonical && norm(canonical) !== norm(current)) option.textContent = canonical;
    });
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
    let keeperValue = selectedValue;

    applyCanonicalLabels(select, byId);

    const seenIdentity = new Set();
    [...select.options].forEach(function(option){
      const student = byId.get(String(option.value));
      const identity = identityFor(student, option);
      if(!identity) return;

      if(seenIdentity.has(identity)){
        if(String(option.value) === selectedValue){
          const keeper = [...select.options].find(function(o){
            if(o === option) return false;
            const s = byId.get(String(o.value));
            return identityFor(s, o) === identity;
          });
          if(keeper) keeperValue = String(keeper.value);
        }
        option.remove();
        return;
      }

      seenIdentity.add(identity);
    });

    if(keeperValue) select.value = keeperValue;
  }

  function dedupe(){
    const primary = document.getElementById('studentSelector');
    if(primary) dedupeSelect(primary);

    document.querySelectorAll('select').forEach(function(select){
      if(select === primary) return;
      const id = String(select.id || '').toLowerCase();
      const aria = String(select.getAttribute('aria-label') || '').toLowerCase();
      if(id.includes('student') || aria.includes('student') || aria.includes('siswa')){
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
    }, 20);
  }

  function start(){
    dedupe();
    setTimeout(dedupe, 50);
    setTimeout(dedupe, 150);
    setTimeout(dedupe, 500);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.dedupeStudentSelector = dedupe;
})();
