/* TO IMPORT STAGING — email-first student matching */
(function(){
  'use strict';
  const API_ALL = 'https://script.google.com/macros/s/AKfycbyInRshwcgOWIM3RhFGBdhHDCz8kJhwWCiyVR8Zu7-L3YORvk-ypxW7yoxwEtgYpTHy/exec?action=all';
  const API_BASE = API_ALL.split('?')[0];
  const esc = s => String(s ?? '').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const norm = s => String(s ?? '').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
  const emailNorm = s => norm(s).replace(/^mailto:/,'');
  let rows=[];
  let parsed=[];
  let errors=[];

  function css(){
    if(document.getElementById('importToStyles')) return;
    const st=document.createElement('style'); st.id='importToStyles';
    st.textContent=`#page-import-to{display:none}.import-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.import-card{background:#fff;border:1px solid #dbe4f0;border-radius:14px;padding:18px;box-shadow:0 6px 20px rgba(30,60,100,.05)}.import-card h3{margin:0 0 8px;font-size:15px}.import-muted{font-size:12px;color:#718096}.import-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.import-form label{font-size:12px;font-weight:600;color:#334155}.import-form input,.import-form select,.import-form textarea{width:100%;box-sizing:border-box;margin-top:6px;border:1px solid #d7e0ec;border-radius:9px;padding:10px;background:#fff}.import-form textarea{min-height:130px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}.import-full{grid-column:1/-1}.import-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.import-btn{border:0;border-radius:9px;padding:10px 14px;font-weight:700;cursor:pointer}.import-primary{background:#2563eb;color:#fff}.import-secondary{background:#eef4ff;color:#1d4ed8}.import-danger{background:#fff1f2;color:#be123c}.import-status{margin-top:12px;padding:10px 12px;border-radius:9px;background:#f8fafc;font-size:12px}.import-status.ok{background:#ecfdf5;color:#166534}.import-status.warn{background:#fffbeb;color:#92400e}.import-status.err{background:#fff1f2;color:#991b1b}.import-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.import-stat{padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.import-stat b{display:block;font-size:20px;margin-top:3px}.import-table{width:100%;border-collapse:collapse;font-size:12px}.import-table th,.import-table td{padding:8px;border-bottom:1px solid #edf2f7;text-align:left}.import-table th{color:#64748b;background:#f8fafc}.import-errors{margin-top:12px;border:1px solid #fde68a;background:#fffbeb;border-radius:10px;overflow:hidden}.import-errors-title{padding:10px 12px;font-size:12px;font-weight:700;color:#92400e;border-bottom:1px solid #fde68a}.import-errors table{width:100%;border-collapse:collapse;font-size:12px}.import-errors th,.import-errors td{padding:8px 10px;border-bottom:1px solid #fef3c7;text-align:left;vertical-align:top}.import-errors th{color:#92400e;background:#fef3c7}.import-errors tr:last-child td{border-bottom:0}.import-error-rownum{font-weight:700;color:#92400e;white-space:nowrap}.tag{display:inline-block;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:700}.tag-ok{background:#dcfce7;color:#166534}.tag-warn{background:#fef3c7;color:#92400e}.tag-bad{background:#fee2e2;color:#991b1b}.import-note{padding:11px 12px;border-left:3px solid #2563eb;background:#eff6ff;color:#334155;font-size:12px;border-radius:6px}.import-hidden{display:none!important}@media(max-width:900px){.import-grid,.import-form{grid-template-columns:1fr}.import-stats{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(st);
  }

  function ensurePage(){
    let sec=document.getElementById('page-import-to');
    if(sec) return sec;
    css();
    const main=document.querySelector('.main-content'); if(!main) return null;
    sec=document.createElement('section'); sec.id='page-import-to'; sec.className='page';
    sec.innerHTML=`<div class="page-header"><div><h1>📥 Import TO</h1><p>Tambah TO baru tanpa mengubah kode dashboard</p></div></div><div class="import-note">Pegangan siswa tetap <b>email</b>. Jika nama pada file berbeda, sistem akan memakai nama master siswa yang sudah ada di dashboard.</div><div class="import-grid" style="margin-top:16px"><div class="import-card"><h3>1. Informasi TO</h3><div class="import-muted">Isi identitas TO yang akan ditambahkan.</div><div class="import-form" style="margin-top:12px"><label>Jenis<select id="importType"><option>TKA</option><option>UTBK</option></select></label><label>Test ID<input id="importTestId" placeholder="mis. TKA004"></label><label class="import-full">Nama TO<input id="importTestName" placeholder="mis. TO TKA SMA Reguler #2"></label><label>Tanggal<input id="importTestDate" type="date"></label><label>Skala<select id="importScale"><option value="200-800">200–800</option><option value="0-100">0–100</option></select></label></div></div><div class="import-card"><h3>2. Masukkan Data</h3><div class="import-muted">Bisa upload CSV/TSV atau paste langsung dari Excel/Google Sheets.</div><div class="import-actions"><label class="import-btn import-secondary" for="importFile">📄 Pilih CSV/TSV</label><input id="importFile" class="import-hidden" type="file" accept=".csv,.tsv,.txt"></div><div class="import-form" style="margin-top:10px"><label class="import-full">Data mentah<textarea id="importPaste" placeholder="Tempel tabel dari Excel/Google Sheets di sini..."></textarea></label></div><div class="import-actions"><button id="importPasteBtn" class="import-btn import-secondary">📋 Proses Data</button><button id="importClearBtn" class="import-btn import-danger">Bersihkan</button></div></div></div><div class="card" style="margin-top:16px"><div class="card-title">3. Validasi & Preview</div><div id="importStats" class="import-stats"></div><div id="importStatus" class="import-status">Belum ada data yang diproses.</div><div id="importErrors" class="import-errors" style="display:none"></div><div style="overflow:auto;margin-top:12px"><table class="import-table"><thead id="importHead"></thead><tbody id="importBody"></tbody></table></div></div><div class="card" style="margin-top:16px"><div class="card-title">4. Import ke database</div><div class="import-muted">Data baru akan dikirim ke Apps Script menggunakan <b>action=import</b>.</div><div class="import-actions"><button id="importSubmit" class="import-btn import-primary">🚀 Import TO</button><button id="importSaveDraft" class="import-btn import-secondary">💾 Simpan Draft</button><button id="importRefresh" class="import-btn import-secondary">↻ Refresh Dashboard</button></div><div id="importSubmitStatus" class="import-status">Belum di-import.</div></div>`;
    main.appendChild(sec);
    return sec;
  }

  function ensureMenu(){
    const nav=document.querySelector('.menu');
    if(!nav) return false;
    let b=nav.querySelector('[data-page="import-to"]');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.page='import-to';
      b.innerHTML='📥 <span>Import TO</span>';
      nav.appendChild(b);
    }
    b.setAttribute('aria-label','Import TO');
    b.style.display='block';
    b.style.visibility='visible';
    b.style.opacity='1';
    if(!b.__importBound){
      b.__importBound=true;
      b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();showPage();});
    }
    return true;
  }

  function showPage(){
    ensurePage();
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    const p=document.getElementById('page-import-to'); if(p)p.style.display='block';
    document.querySelectorAll('.menu button').forEach(b=>b.classList.remove('active'));
    const b=document.querySelector('[data-page="import-to"]'); if(b)b.classList.add('active');
  }

  function splitLine(line,sep){let out=[],cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='\"'){if(q&&line[i+1]==='\"'){cur+='\"';i++;}else q=!q;}else if(c===sep&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;}
  function parseText(text){const clean=String(text||'').replace(/^\uFEFF/,'').trim();if(!clean)return [];const lines=clean.split(/\r?\n/).filter(x=>x.trim());const first=lines[0];const sep=first.includes('\t')?'\t':(first.includes(';')?';':',');const headers=splitLine(first,sep).map(x=>norm(x));return lines.slice(1).map(line=>{const vals=splitLine(line,sep);const o={};headers.forEach((h,i)=>o[h]=String(vals[i]??'').trim());return o;});}
  function value(o,names){for(const n of names){const k=norm(n);if(o[k]!==undefined&&o[k]!=='')return o[k];}return '';}
  function subjectColumns(data){const reserved=new Set(['email','e-mail','nama','name','student','student name','test_id','test id','nilai','score','subtest','subtes','mapel','subject','durasi pengerjaan','jumlah keluar tab','durasi keluar tab']);const keys=new Set();data.forEach(o=>Object.keys(o).forEach(k=>{if(!reserved.has(norm(k)))keys.add(k);}));return [...keys];}
  function masterStudents(){return Array.isArray(window.dashboardData?.students)?window.dashboardData.students:[];}
  function masterEmail(s){return emailNorm(s.email||s.email_address||s.email_siswa||s.mail||'');}
  function masterName(s){return s.nama||s.name||s.student_name||'Tanpa Nama';}
  function masterId(s){return s.student_id||s.id||'';}
  function matchStudent(email,name){const ms=masterStudents();const e=emailNorm(email);let s=e?ms.find(x=>masterEmail(x)===e):null;if(!s&&name){const n=norm(name);s=ms.find(x=>norm(masterName(x))===n)||null;}return s;}
  function parseRows(data){const subjects=subjectColumns(data),result=[],foundErrors=[];data.forEach((o,i)=>{const email=value(o,['email','e-mail','email siswa']),name=value(o,['nama','name','student','student name']),s=matchStudent(email,name);if(!email&&!name){foundErrors.push({row:i+2,name:name||'—',email:email||'—',msg:'Email/nama kosong'});return;}if(!s){foundErrors.push({row:i+2,name:name||'—',email:email||'—',msg:'Siswa tidak ditemukan berdasarkan email/nama'});return;}const directScore=value(o,['nilai','score']),subtest=value(o,['subtest','subtes','mapel','subject']);if(directScore&&subtest){const n=Number(String(directScore).replace(',','.'));if(Number.isFinite(n))result.push({student_id:masterId(s),student_name:masterName(s),email:masterEmail(s),subtest_name:subtest,score:n});else foundErrors.push({row:i+2,name:masterName(s),email:masterEmail(s),msg:'Nilai tidak valid'});return;}let count=0;subjects.forEach(k=>{const raw=o[k];if(raw!==''&&raw!==undefined){const n=Number(String(raw).replace(',','.'));if(Number.isFinite(n)){result.push({student_id:masterId(s),student_name:masterName(s),email:masterEmail(s),subtest_name:k,score:n});count++;}}});if(!count)foundErrors.push({row:i+2,name:masterName(s),email:masterEmail(s),msg:'Tidak ada nilai yang terbaca'});});return {result,errors:foundErrors};}
  function render(){const stat=document.getElementById('importStats'),status=document.getElementById('importStatus'),head=document.getElementById('importHead'),body=document.getElementById('importBody'),errorBox=document.getElementById('importErrors');if(!stat)return;const unique=new Set(parsed.map(x=>x.student_id));stat.innerHTML=[['Baris',rows.length],['Siswa cocok',unique.size],['Nilai',parsed.length],['Masalah',errors.length]].map(x=>`<div class="import-stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');status.className='import-status '+(errors.length?'warn':(parsed.length?'ok':'warn'));if(errors.length){status.textContent=`${parsed.length} nilai valid. ${errors.length} baris bermasalah dan tidak akan dikirim.`;errorBox.style.display='block';errorBox.innerHTML=`<div class="import-errors-title">⚠️ ${errors.length} baris perlu diperbaiki sebelum import</div><div style="overflow:auto"><table><thead><tr><th>Baris</th><th>Nama Siswa</th><th>Email</th><th>Masalah</th></tr></thead><tbody>${errors.map(e=>`<tr><td class="import-error-rownum">${esc(e.row)}</td><td>${esc(e.name||'—')}</td><td>${esc(e.email||'—')}</td><td>${esc(e.msg)}</td></tr>`).join('')}</tbody></table></div>`;}else{status.textContent=parsed.length?`Siap: ${unique.size} siswa, ${parsed.length} nilai. Nama mengikuti master berdasarkan email.`:'Belum ada data valid.';errorBox.style.display='none';errorBox.innerHTML='';}head.innerHTML='<tr><th>Siswa</th><th>Email</th><th>Subtes</th><th>Nilai</th><th>Status</th></tr>';body.innerHTML=parsed.slice(0,100).map(x=>`<tr><td>${esc(x.student_name)}</td><td>${esc(x.email)}</td><td>${esc(x.subtest_name)}</td><td>${esc(x.score)}</td><td><span class="tag tag-ok">COCOK</span></td></tr>`).join('');}
  function process(data){rows=data;const p=parseRows(data);parsed=p.result;errors=p.errors;render();}
  function payload(){const testId=document.getElementById('importTestId').value.trim(),testName=document.getElementById('importTestName').value.trim();return {action:'import',test:{test_id:testId,test_name:testName,nama_to:testName,jenis:document.getElementById('importType').value,tanggal:document.getElementById('importTestDate').value,scale:document.getElementById('importScale').value},results:parsed.map((x,i)=>({result_id:`${testId||'NEW'}_${String(i+1).padStart(4,'0')}`,student_id:x.student_id,test_id:testId,subtest_name:x.subtest_name,nilai:x.score,email:x.email,student_name:x.student_name}))};}
  function saveDraft(){localStorage.setItem('dashboard_tka_import_draft',JSON.stringify({saved_at:new Date().toISOString(),rows,parsed,errors,meta:payload().test}));const el=document.getElementById('importSubmitStatus');el.className='import-status ok';el.textContent='Draft tersimpan di browser ini.';}
  async function submit(){const st=document.getElementById('importSubmitStatus'),p=payload();if(errors.length){st.className='import-status err';st.textContent=`Perbaiki ${errors.length} baris bermasalah terlebih dahulu sebelum import.`;return;}if(!p.test.test_id||!p.test.test_name||!parsed.length){st.className='import-status err';st.textContent='Lengkapi Test ID, Nama TO, dan data nilai terlebih dahulu.';return;}st.className='import-status warn';st.textContent='Mengirim data ke Apps Script…';try{const r=await fetch(API_BASE+'?action=import',{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)});const text=await r.text();let j;try{j=JSON.parse(text)}catch(_){j=null}if(!r.ok)throw new Error('HTTP '+r.status);if(j&&j.success===false)throw new Error(j.error||'API menolak import');st.className='import-status ok';st.textContent='Import diterima oleh endpoint. Silakan refresh dashboard.';}catch(e){st.className='import-status err';st.textContent='Belum bisa masuk ke database: '+e.message+'. Apps Script harus mendukung action=import/doPost.';}}
  function bind(){
    ensurePage();ensureMenu();
    document.getElementById('importFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>process(parseText(r.result));r.readAsText(f);});
    document.getElementById('importPasteBtn')?.addEventListener('click',()=>{const ta=document.getElementById('importPaste');if(ta?.value.trim())process(parseText(ta.value));else{const text=prompt('Paste tabel dari Excel/Google Sheets di sini:');if(text)process(parseText(text));}});
    document.getElementById('importClearBtn')?.addEventListener('click',()=>{rows=[];parsed=[];errors=[];const ta=document.getElementById('importPaste');if(ta)ta.value='';render();});
    document.getElementById('importSaveDraft')?.addEventListener('click',saveDraft);
    document.getElementById('importSubmit')?.addEventListener('click',submit);
    document.getElementById('importRefresh')?.addEventListener('click',async()=>{if(typeof window.loadDashboardData==='function'){await window.loadDashboardData();window.dashboardData=dashboardData;ensurePage();}});
  }
  window.initTOImport=bind;
  window.showImportTO=showPage;

  let menuObserverStarted=false;
  function keepMenuAlive(){
    if(menuObserverStarted)return;
    menuObserverStarted=true;
    const root=document.querySelector('.sidebar')||document.body;
    if(root){
      const observer=new MutationObserver(function(){ensureMenu();});
      observer.observe(root,{childList:true,subtree:true});
    }
    ensureMenu();
    setTimeout(ensureMenu,100);
    setTimeout(ensureMenu,500);
    setTimeout(ensureMenu,1500);
    setTimeout(ensureMenu,3000);
  }

  function start(){css();ensurePage();ensureMenu();keepMenuAlive();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
