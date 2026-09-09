/* Canonical student master: email is the identity key. */
(function(){
 const NAME_BY_EMAIL={
  "adegm42qkiz6wiz@anonymous.ruangguru.com":"Aqhsa Aqila Hidayat",
  "adekgm42qkiz6wiz@anonymous.ruangguru.com":"Aqhsa Aqila Hidayat"
 };
 const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g,'');
 function apply(){const d=window.dashboardData;if(!d||!Array.isArray(d.students))return;const seen=new Set(),out=[];d.students.forEach(s=>{const email=String(s.email||s.email_address||s.email_siswa||s.mail||s.Email||s['Email Siswa']||'').trim().toLowerCase();let name=String(s.nama||s.name||s.student_name||s['Nama Siswa']||'').trim();if(NAME_BY_EMAIL[email])name=NAME_BY_EMAIL[email];const n=norm(name);if(/^eqbalathamarvile$/.test(n)||/^eqbalathamaravile$/.test(n))name='Eqbal Atha Maravile';if(/^muhammadzidanalfaribi$/.test(n)||/^muhammadzidanalfarabi$/.test(n))name='Muhammad Zidan Alfarabi';if(/^nazhifatil/.test(n))name='Nazhifatil H.';s.nama=name;const key=email||('id:'+String(s.student_id||s.id||''));if( key && seen.has(key))return;if(key)seen.add(key);out.push(s)});d.students=out;}
 window.applyStudentMasterFix=apply;
})();
