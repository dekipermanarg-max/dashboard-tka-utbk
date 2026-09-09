/* Canonical student master: email is the identity key. */
(function(){
 const NAME_BY_EMAIL={"adegm42qkiz6wiz@anonymous.ruangguru.com":"Aqhsa Aqila Hidayat"};
 const ALIAS={"eqbalathamavile":"Eqbal Atha Marvile","eqbalatha marvile":"Eqbal Atha Marvile","eqbalathamarvile":"Eqbal Atha Marvile","eqbalatham aravile":"Eqbal Atha Marvile","eqbalathamaravile":"Eqbal Atha Marvile","muhammadzidanal farabi":"Muhammad Zidan Alfaribi","muhammadzidanalfarabi":"Muhammad Zidan Alfaribi","muhammadzidanalfaribi":"Muhammad Zidan Alfaribi"};
 const IMPORT_NAME_ALIASES={"eqbalatham aravile":"Eqbal Atha Maravile","" : ""};
 const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g,'');
 function apply(){const d=window.dashboardData;if(!d||!Array.isArray(d.students))return;const seen=new Set(),out=[];d.students.forEach(s=>{const email=String(s.email||s.email_address||s.email_siswa||'').trim().toLowerCase();let name=String(s.nama||s.name||'').trim();if(NAME_BY_EMAIL[email])name=NAME_BY_EMAIL[email];const n=norm(name);if(/^eqbalathamaravile$/.test(n)||/^eqbalathamavile$/.test(n))name='Eqbal Atha Maravile';if(/^muhammadzidanalfaribi$/.test(n)||/^muhammadzidanalfarabi$/.test(n))name='Muhammad Zidan Alfarabi';if(/^nazhifatil/.test(n))name='Nazhifatil H.';s.nama=name;const key=email||('id:'+String(s.student_id||''));if(seen.has(key))return;seen.add(key);out.push(s)});d.students=out;}
 window.applyStudentMasterFix=apply;
})();
