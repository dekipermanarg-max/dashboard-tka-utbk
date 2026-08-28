/* UTBK Reguler Episode 1 — data snapshot supplied by user */
(function(){
  /*
   DATA:
   nama, sourceId, sekolah, status, durasiPengerjaan(sec), keluarTab, durasiKeluarTab(sec), scores[8]
  */
  const DATA = [
    ['Muhammad Faiz','FAIZMVTBY60BK7V1','SMA YARI SCHOOL','COMPLETED',9896,0,0,[733,597,585,560,618,618,662,512]],
    ['Anindya Rahman Dias','ANINDYAZWO8GR4F0','SMAS DON BOSCO','COMPLETED',10196,0,0,[686,561,690,509,608,657,673,419]],
    ['Athar Anugrah Pratama','ATHARMEI5A127H3N','SMAN 1 PADANG','COMPLETED',9254,3,12,[570,669,560,487,579,545,667,538]],
    ['Nasywa Nawal Mohga','NASYWABQWEIQBEYY','SMA YARI SCHOOL','COMPLETED',9698,0,0,[555,585,684,505,544,671,611,433]],
    ['Ahmad Akbar Yasin','AKBARAAQM88GS19N','SMAN 10 PADANG','COMPLETED',8335,0,0,[599,581,635,507,490,611,611,433]],
    ['Maulana Arrasyid','MAULANAV2ESSG99Z','SMAN 5 PADANG','COMPLETED',9285,0,0,[514,475,644,390,556,526,518,434]],
    ['Adek','ADEKGM42QKIZ6WIZ','SMAN 10 PADANG','COMPLETED',8984,0,0,[501,478,466,546,379,522,473,448]],
    ['Nazhifatil Hayati','NAZHIFATXPDC72PL','SMAN 10 PADANG','ATTEMPT',8502,1,1,[537,532,501,561,525,662,487,0]],
    ['Muti Nasywah Khayyirah','USERVFTJRXCB','SMAN 10 PADANG','COMPLETED',9107,3,76,[416,501,459,473,367,512,474,450]],
    ['Siti Hanifah Zahra','HANIFAHS5YGZQD3O','SMAN 10 PADANG','COMPLETED',10412,0,0,[449,360,570,470,422,498,422,394]],
    ['Hijraatul Hidayat','HIJRAATUD9V9LWOQ','SMAN 2 PADANG','COMPLETED',9222,3,206,[493,420,386,487,460,423,455,448]],
    ['Raisya Mutiara Putri','RAISYA5WVCPEARA6','SMAN 6 PADANG','COMPLETED',8603,0,0,[385,479,517,341,461,486,358,491]],
    ['Daffa Al Faith','DAFFAM2YWXUBUMEJ','SMAN 10 PADANG','COMPLETED',9660,0,0,[406,398,475,387,422,491,441,432]],
    ['Muhammad Zidan Alfarabi','ZIDANM48JC9I738R','SMAS DON BOSCO','COMPLETED',5394,1,39,[526,629,530,378,480,261,271,294]],
    ['Andini Haritsyah','ANDINI0LEQP02OPJ','SMAN 6 PADANG','COMPLETED',8104,5,12,[313,447,482,501,378,458,391,380]],
    ['Humaira Hanriesta Br Matondang','HUMAIRAI6SVDD1NR','SMAN 10 PADANG','COMPLETED',10181,0,0,[468,335,400,396,413,499,407,428]],
    ['Beby Marsya Qirani','BEBYDHQMTFYWTDKT','SMAN 4 PADANG','COMPLETED',9743,2,2,[457,498,345,459,278,484,398,390]],
    ['Eqbal Atha Maravile','EQBALAZUZSTHIWXJ','SMAS DON BOSCO','COMPLETED',2489,6,154,[300,343,339,503,453,265,455,494]],
    ['Assyfa Qalbina','ASSYFA73HU7KB8HW','MAS PP. DARUSSALAM SARAN KABUN','ATTEMPT',16794,3,1,[413,383,446,0,388,489,380,430]]
  ];

  const SUBS = [
    ['UTBK_PU','PU'],['UTBK_PPU','PPU'],['UTBK_PBM','PBM'],['UTBK_PK','PK'],
    ['UTBK_LBI_SAINTEK','LBI Saintek'],['UTBK_LBI_SOSHUM','LBI Soshum'],['UTBK_LBE','LBE'],['UTBK_PM','PM']
  ];
  const TEST_ID='UTBK_REG_001', TEST_NAME='UTBK SMA Reguler Episode 1';
  const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const fmtDuration=sec=>{sec=Number(sec)||0;const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':')};
  let activeTestId=TEST_ID;

  function inject(){
    if(typeof dashboardData === 'undefined' || !dashboardData) return false;
    const existing=getTests().find(t=>String(getTestName(t)).toUpperCase()===TEST_NAME.toUpperCase());
    if(!existing){
      dashboardData.tests.push({test_id:TEST_ID,jenis:'UTBK',nama_to:TEST_NAME});
      SUBS.forEach(([id,name])=>dashboardData.subtests.push({subtest_id:id,subtes:name,jenis:'UTBK'}));
      DATA.forEach(([nama,sourceId,sekolah,status,durasiPengerjaan,keluarTab,durasiKeluarTab,scores])=>{
        let student=dashboardData.students.find(s=>norm(s.nama)===norm(nama));
        if(!student){student={student_id:sourceId,nama,sekolah,cabang:'Padang - Tarandam'};dashboardData.students.push(student)}
        scores.forEach((nilai,i)=>dashboardData.results.push({test_id:TEST_ID,student_id:student.student_id,subtest_id:SUBS[i][0],nilai,status_pengerjaan:status,durasi_pengerjaan:durasiPengerjaan,jumlah_keluar_tab:keluarTab,durasi_keluar_tab:durasiKeluarTab}));
      });
      activeTestId=TEST_ID;
    } else {
      activeTestId=getTestId(existing);
      const map={};
      DATA.forEach(([nama,sourceId,sekolah,status,durasiPengerjaan,keluarTab,durasiKeluarTab])=>map[norm(nama)]={durasiPengerjaan,keluarTab,durasiKeluarTab,status});
      getResults(TEST_ID).forEach(r=>{
        const st=dashboardData.students.find(s=>s.student_id===r.student_id);
        const d=st&&map[norm(st.nama)];
        if(d){r.durasi_pengerjaan=d.durasiPengerjaan;r.jumlah_keluar_tab=d.keluarTab;r.durasi_keluar_tab=d.durasiKeluarTab;r.status_pengerjaan=d.status;}
      });
    }
    const us=getUTBKTests();
    if(document.getElementById('utbkTestSelector')) populateTestSelector('utbkTestSelector',us,activeTestId);
    if(typeof renderUTBK==='function') renderUTBK(activeTestId);
    if(typeof populateStudentSelector==='function') populateStudentSelector();
    if(typeof renderStudentDetail==='function') renderStudentDetail();
    return true;
  }

  function getDetailRows(testId){
    const byStudent={};
    getResults(testId).forEach(r=>{
      const sid=r.student_id;
      if(!byStudent[sid]) byStudent[sid]={results:[],durasi:r.durasi_pengerjaan,jumlahKeluarTab:r.jumlah_keluar_tab,durasiKeluarTab:r.durasi_keluar_tab,status:r.status_pengerjaan};
      byStudent[sid].results.push(r);
    });
    // getParticipants() returns student IDs, so resolve each ID to the full student object.
    return getParticipants(testId).map(studentId=>{
      const student=dashboardData.students.find(s=>String(s.student_id)===String(studentId)) || {student_id:studentId,nama:getStudentName(studentId)};
      const d=byStudent[studentId]||{};
      return {...student,...d};
    });
  }

  function render(){
    const page=document.getElementById('page-utbk'); if(!page)return;
    const testId=(document.getElementById('utbkTestSelector')?.value)||activeTestId;
    const results=getResults(testId), students=getStudentsForDetail(testId), vals=results.map(getScore).filter(v=>v!=null);
    const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
    const by={}; results.forEach(r=>{(by[r.subtest_id]??=[]).push(getScore(r))});
    const cards=SUBS.map(([id,name])=>{const a=(by[id]||[]).filter(v=>v!=null),av=a.length?a.reduce((x,y)=>x+y,0)/a.length:0;return `<div class="subject-card"><div class="subject-name">${escapeHTML(name)}</div><div class="subject-score ${getTKASubjectScoreClass(av,testId)}">${a.length?av.toFixed(1):'—'}</div><div class="subject-meta">${a.length} peserta • Max ${a.length?Math.max(...a):'—'} • Min ${a.length?Math.min(...a):'—'}</div></div>`}).join('');
    const rank={};students.forEach(s=>{const a=getStudentResults(s.student_id,testId).map(getScore).filter(v=>v!=null);if(a.length)rank[s.student_id]={...s,average:a.reduce((x,y)=>x+y,0)/a.length}});
    const rows=Object.values(rank).sort((a,b)=>b.average-a.average).map((s,i)=>`<tr><td>${i+1}</td><td><strong>${escapeHTML(s.nama)}</strong></td><td>${escapeHTML(s.sekolah||'—')}</td><td><strong>${s.average.toFixed(1)}</strong></td><td><span class="status ${getStudentStatus(s.average).className}">${getStudentStatus(s.average).label}</span></td></tr>`).join('');
    const detailRows=getDetailRows(testId).sort((a,b)=>String(a.nama||'').localeCompare(String(b.nama||'')));
    const detailHead='<tr><th>No.</th><th>Nama Siswa</th><th>Durasi Pengerjaan</th><th># Keluar Tab</th><th>Durasi Keluar Tab</th>'+SUBS.map(([,name])=>`<th>${escapeHTML(name)}</th>`).join('')+'</tr>';
    const detailBody=detailRows.map((s,i)=>{const scoreMap={};(s.results||[]).forEach(r=>scoreMap[r.subtest_id]=getScore(r));return `<tr><td>${i+1}</td><td><strong>${escapeHTML(s.nama)}</strong></td><td>${fmtDuration(s.durasi)}</td><td>${Number(s.jumlahKeluarTab)||0}</td><td>${fmtDuration(s.durasiKeluarTab)}</td>${SUBS.map(([id])=>`<td class="${scoreMap[id]!=null?getScoreCellClass(scoreMap[id],testId):''}">${scoreMap[id]!=null?scoreMap[id]:'—'}</td>`).join('')}</tr>`}).join('');

    page.innerHTML=`<div class="page-header"><div><h1>🚀 UTBK</h1><p>Analisis performa siswa pada TO UTBK</p></div><select id="utbkTestSelector"></select></div><div class="kpi-grid"><div class="card kpi-card"><div class="kpi-label">Peserta</div><div class="kpi-value">${new Set(results.map(r=>r.student_id)).size}</div><div class="kpi-note">Siswa dengan nilai</div></div><div class="card kpi-card"><div class="kpi-label">Rata-rata Skor</div><div class="kpi-value">${avg.toFixed(1)}</div><div class="kpi-note">Seluruh subtes</div></div><div class="card kpi-card"><div class="kpi-label">Skor Tertinggi</div><div class="kpi-value">${vals.length?Math.max(...vals):'—'}</div><div class="kpi-note">Nilai tertinggi</div></div><div class="card kpi-card"><div class="kpi-label">Skor Terendah</div><div class="kpi-value">${vals.length?Math.min(...vals):'—'}</div><div class="kpi-note">Nilai terendah</div></div></div><div class="card"><div class="card-title">📊 Analisis Performa UTBK berdasarkan subtes</div><div class="subject-grid">${cards}</div></div><div class="card"><div class="card-title">🏆 Ranking UTBK</div><div class="table-wrapper"><table><thead><tr><th>#</th><th>Siswa</th><th>Sekolah</th><th>Rata-rata</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div><div class="card"><div class="card-title">📋 Detail Peserta UTBK</div><div class="card-subtitle" style="margin:-10px 0 16px;color:#64748b;font-size:12px;">Durasi ditampilkan dalam format jam:menit:detik. Data mengikuti rekap TO UTBK.</div><div class="table-wrapper" style="overflow-x:auto;"><table class="utbk-detail-table"><thead>${detailHead}</thead><tbody>${detailBody}</tbody></table></div></div>`;
    populateTestSelector('utbkTestSelector',getUTBKTests(),testId);
    document.getElementById('utbkTestSelector').onchange=e=>renderUTBK(e.target.value);
  }

  window.renderUTBK=render;
  function start(){if(inject())return;setTimeout(start,250)}
  start();
})();
