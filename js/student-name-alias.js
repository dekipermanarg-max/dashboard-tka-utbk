/* Student display-name aliases */
(function(){
  const EMAIL_ALIASES = {
    'adekgm42qkiz6wiz@anonymous.ruangguru.com': 'Aqhsa Aqila Hidayat'
  };

  function emailOf(student){
    if(!student) return '';
    return String(student.email || student.email_address || student.emailAddress || student.mail || '').trim().toLowerCase();
  }

  function applyAliases(){
    if(!window.dashboardData || !Array.isArray(window.dashboardData.students)) return;
    window.dashboardData.students.forEach(student => {
      const alias = EMAIL_ALIASES[emailOf(student)];
      if(alias){
        student.nama = alias;
        student.name = alias;
        student.display_name = alias;
      }
    });
  }

  window.applyStudentNameAliases = applyAliases;
})();
