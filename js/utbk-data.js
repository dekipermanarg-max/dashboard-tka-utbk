/* UTBK Reguler Episode 1 — data snapshot supplied by user */
(function(){
  const DATA = [
    ['Muhammad Faiz','FAIZMVTBY60BK7V1','SMA YARI SCHOOL','COMPLETED',[733,597,585,560,618,618,662,512]],
    ['Anindya Rahman Dias','ANINDYAZWO8GR4F0','SMAS DON BOSCO','COMPLETED',[686,561,690,509,608,657,673,419]],
    ['Athar Anugrah Pratama','ATHARMEI5A127H3N','SMAN 1 PADANG','COMPLETED',[570,669,560,487,579,545,667,538]],
    ['Nasywa Nawal Mohga','NASYWABQWEIQBEYY','SMA YARI SCHOOL','COMPLETED',[555,585,684,505,544,671,611,433]],
    ['Ahmad Akbar Yasin','AKBARAAQM88GS19N','SMAN 10 PADANG','COMPLETED',[599,581,635,507,490,611,611,433]],
    ['Maulana Arrasyid','MAULANAV2ESSG99Z','SMAN 5 PADANG','COMPLETED',[514,475,644,390,556,526,518,434]],
    ['Adek','ADEKGM42QKIZ6WIZ','SMAN 10 PADANG','COMPLETED',[501,478,466,546,379,522,473,448]],
    ['Nazhifatil Hayati','NAZHIFATXPDC72PL','SMAN 10 PADANG','ATTEMPT',[537,532,501,561,525,662,487,0]],
    ['Muti Nasywah Khayyirah','USERVFTJRXCB','SMAN 10 PADANG','COMPLETED',[416,501,459,473,367,512,474,450]],
    ['Siti Hanifah Zahra','HANIFAHS5YGZQD3O','SMAN 10 PADANG','COMPLETED',[449,360,570,470,422,498,422,394]],
    ['Hijraatul Hidayat','HIJRAATUD9V9LWOQ','SMAN 2 PADANG','COMPLETED',[493,420,386,487,460,423,455,448]],
    ['Raisya Mutiara Putri','RAISYA5WVCPEARA6','SMAN 6 PADANG','COMPLETED',[385,479,517,341,461,486,358,491]],
    ['Daffa Al Faith','DAFFAM2YWXUBUMEJ','SMAN 10 PADANG','COMPLETED',[406,398,475,387,422,491,441,432]],
    ['Muhammad Zidan Alfarabi','ZIDANM48JC9I738R','SMAS DON BOSCO','COMPLETED',[526,629,530,378,480,261,271,294]],
    ['Andini Haritsyah','ANDINI0LEQP02OPJ','SMAN 6 PADANG','COMPLETED',[313,447,482,501,378,458,391,380]],
    ['Humaira Hanriesta Br Matondang','HUMAIRAI6SVDD1NR','SMAN 10 PADANG','COMPLETED',[468,335,400,396,413,499,407,428]],
    ['Beby Marsya Qirani','BEBYDHQMTFYWTDKT','SMAN 4 PADANG','COMPLETED',[457,498,345,459,278,484,398,390]],
    ['Eqbal Atha Maravile','EQBALAZUZSTHIWXJ','SMAS DON BOSCO','COMPLETED',[300,343,339,503,453,265,455,494]],
    ['Assyfa Qalbina','ASSYFA73HU7KB8HW','MAS PP. DARUSSALAM SARAN KABUN','ATTEMPT',[413,383,446,0,388,489,380,430]]
  ];
  const SUBS = [
    ['UTBK_PU','PU'],['UTBK_PPU','PPU'],['UTBK_PBM','PBM'],['UTBK_PK','PK'],
    ['UTBK_LBI_SAINTEK','LBI Saintek'],['UTBK_LBI_SOSHUM','LBI Soshum'],['UTBK_LBE','LBE'],['UTBK_PM','PM']
  ];
  const TEST_ID='UTBK_REG_001', TEST_NAME='UTBK SMA Reguler Episode 1';
  const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  function inject(){
    if(!window.dashboardData) return false;
    const has=getTests().some(t=>String(getTestName(t)).toUpperCase()===TEST_NAME.toUpperCase());
    if(!has){
      dashboardData.tests.push({test_id:TEST_ID,jenis:'UTBK',nama_to:TEST_NAME});
      SUBS.forEach(([id,name])=>dashboardData.subtests.push({subtest_id:id,subtes:name,jenis:'UTBK'}));
      DATA.forEach(([nama,sourceId,sekolah,status,scores])=>{
        let student=dashboardData.students.find(s=>norm(s.nama)===norm(nama));
        if(!student){student={student_id:sourceId,nama,sekolah,cabang:'Padang - Tarandam'};dashboardData.students.push(student)}
        scores.forEach((nilai,i)=>dashboardData.results.push({test_id:TEST_ID,student_id:student.student_id,subtest_id:SUBS[i][0],nilai,status_pengerjaan:status}));
      });
    }
    currentStudentTestId = currentStudentTestId && isUTBK(getTests().find(t=>getTestId(t)===currentStudentTestId)) ? currentStudentTestId : TEST_ID;
    const us=getUTBKTests();
    if(document.getElementById('utbkTestSelector')) populateTestSelector('utbkTestSelector',us,TEST_ID);
    renderUTBK(TEST_ID);
    if(typeof populateStudentSelector==='function') populateStudentSelector();
    if(typeof renderStudentDetail==='function') renderStudentDetail();
    return true;
  }
  function render(){
    const page=document.getElementById('page-utbk'); if(!page)return;
    const testId=(document.getElementById('utbkTestSelector')?.value)||TEST_ID;
    const results=getResults(testId), students=getStudentsForDetail(testId), vals=results.map(getScore).filter(v=>v!=null);
    const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
    const by={}; results.forEach(r=>{(by[r.subtest_id]??=[]).push(getScore(r))});
    const cards=SUBS.map(([id,name])=>{const a=(by[id]||[]).filter(v=>v!=null),av=a.length?a.reduce((x,y)=>x+y,0)/a.length:0;return `<div class="subject-card"><div class="subject-name">${escapeHTML(name)}</div><div class="subject-score ${getTKASubjectScoreClass(av,testId)}">${a.length?av.toFixed(1):'—'}</div><div class="subject-meta">${a.length} peserta • Max ${a.length?Math.max(...a):'—'} • Min ${a.length?Math.min(...a):'—'}</div></div>`}).join('');
    const rank={};students.forEach(s=>{const a=getStudentResults(s.student_id,testId).map(getScore).filter(v=>v!=null);if(a.length)rank[s.student_id]={...s,average:a.reduce((x,y)=>x+y,0)/a.length}});
    const rows=Object.values(rank).sort((a,b)=>b.average-a.average).map((s,i)=>`<tr><td>${i+1}</td><td><strong>${escapeHTML(s.nama)}</strong></td><td>${escapeHTML(s.sekolah||'—')}</td><td><strong>${s.average.toFixed(1)}</strong></td><td><span class="status ${getStudentStatus(s.average).className}">${getStudentStatus(s.average).label}</span></td></tr>`).join('');
    page.innerHTML=`<div class="page-header"><div><h1>🚀 UTBK</h1><p>Analisis performa siswa pada TO UTBK</p></div><select id="utbkTestSelector"></select></div><div class="kpi-grid"><div class="card kpi-card"><div class="kpi-label">Peserta</div><div class="kpi-value">${new Set(results.map(r=>r.student_id)).size}</div><div class="kpi-note">Siswa dengan nilai</div></div><div class="card kpi-card"><div class="kpi-label">Rata-rata Skor</div><div class="kpi-value">${avg.toFixed(1)}</div><div class="kpi-note">Seluruh subtes</div></div><div class="card kpi-card"><div class="kpi-label">Skor Tertinggi</div><div class="kpi-value">${vals.length?Math.max(...vals):'—'}</div><div class="kpi-note">Nilai tertinggi</div></div><div class="card kpi-card"><div class="kpi-label">Skor Terendah</div><div class="kpi-value">${vals.length?Math.min(...vals):'—'}</div><div class="kpi-note">Nilai terendah</div></div></div><div class="card"><div class="card-title">📊 Analisis Performa UTBK berdasarkan subtes</div><div class="subject-grid">${cards}</div></div><div class="card"><div class="card-title">🏆 Ranking UTBK</div><div class="table-wrapper"><table><thead><tr><th>#</th><th>Siswa</th><th>Sekolah</th><th>Rata-rata</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    populateTestSelector('utbkTestSelector',getUTBKTests(),testId);
    document.getElementById('utbkTestSelector').onchange=e=>renderUTBK(e.target.value);
  }
  window.renderUTBK=render;
  function start(){if(inject())return;setTimeout(start,250)}
  start();
})();
