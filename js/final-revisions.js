/* Final UI revisions requested by user */
(function(){
  function addStatusLegend(targetId){
    const target=document.getElementById(targetId);
    if(!target || document.getElementById(targetId+'Legend')) return;
    const card=document.createElement('div');
    card.id=targetId+'Legend';
    card.className='card status-legend-card';
    card.innerHTML='<div class="card-title">Legenda Status</div><div class="status-legend"><span><b class="legend-dot ontrack"></b> On Track — performa masih sesuai dan stabil</span><span><b class="legend-dot watchlist"></b> Watchlist — perlu dipantau</span><span><b class="legend-dot intervention"></b> Intervention — perlu tindak lanjut</span></div>';
    target.appendChild(card);
  }

  function removeDetailPage(){
    document.querySelector('.menu button[data-page="detail"]')?.remove();
    document.getElementById('page-detail')?.remove();
    document.getElementById('page-detail-page')?.remove();
  }

  function fixOverviewTitle(){
    document.querySelectorAll('#page-overview .card-subtitle').forEach(e=>{
      if(e.textContent.includes('Perbandingan TO Reguler')) e.textContent='Perbandingan TO terbaru yang diikuti siswa';
    });
  }

  function addStudentMapelTrend(){
    const host=document.getElementById('studentTrendCard');
    if(!host || document.getElementById('studentMapelTrend')) return;
    const c=document.createElement('div');
    c.id='studentMapelTrend';
    c.className='student-mapel-trend';
    c.innerHTML='<div class="card-title">📊 Perkembangan Nilai per Mapel</div><div class="card-subtitle">Perbandingan nilai rata-rata setiap mapel dari TO ke TO</div><div id="studentMapelRows"></div><div id="studentAnalysisNotes" class="student-analysis-notes"></div>';
    host.after(c);
  }

  function renderStudentMapelTrend(){
    const rowsEl=document.getElementById('studentMapelRows');
    const notesEl=document.getElementById('studentAnalysisNotes');
    if(!rowsEl || !currentStudentId) return;
    const tests=getTests().filter(t=>{
      const sel=getTests().find(x=>getTestId(x)===currentStudentTestId);
      return sel && (isUTBK(sel)?isUTBK(t):isTKA(t));
    });
    const latest=tests.map(t=>({t,vals:getStudentResults(currentStudentId,getTestId(t))})).filter(x=>x.vals.length);
    if(!latest.length){rowsEl.innerHTML='<div class="empty-score">Belum ada data per mapel.</div>';return}
    const groups={};
    latest.forEach(({t,vals})=>vals.forEach(r=>{
      const name=getSubtestName(r.subtest_id)||'Mapel';
      const v=getScore(r); if(v==null)return;
      (groups[name]??=[]).push({test:getTestName(t),value:v});
    }));
    const names=Object.keys(groups);
    rowsEl.innerHTML=names.map(name=>{
      const arr=groups[name]; const last=arr[arr.length-1]?.value; const prev=arr[arr.length-2]?.value; const delta=prev!=null?last-prev:null;
      const max=Math.max(...arr.map(x=>x.value),1); const bars=arr.map(x=>`<span class="mapel-point" style="height:${Math.max(8,x.value/max*100)}%" title="${escapeHTML(x.test)}: ${x.value}"></span>`).join('');
      return `<div class="mapel-trend-row"><div class="mapel-name"><strong>${escapeHTML(name)}</strong><small>${delta==null?'Belum ada perbandingan':delta>0?'↑ Naik '+delta.toFixed(1):delta<0?'↓ Turun '+Math.abs(delta).toFixed(1):'→ Stabil'}</small></div><div class="mapel-bars">${bars}</div><strong class="mapel-last">${last.toFixed(1)}</strong></div>`;
    }).join('');
    const alerts=[];
    names.forEach(name=>{const a=groups[name];if(a.length>=2){const d=a[a.length-1].value-a[a.length-2].value;if(d<0)alerts.push(`${name} turun ${Math.abs(d).toFixed(1)} poin`);else if(d>0)alerts.push(`${name} naik ${d.toFixed(1)} poin`);}});
    notesEl.innerHTML=alerts.length?'<div class="note-title">📝 Catatan Analisis</div>'+alerts.map(x=>`<div>• ${escapeHTML(x)}</div>`).join(''):'<div class="note-title">📝 Catatan Analisis</div><div>Belum cukup data untuk menentukan tren per mapel.</div>';
  }

  function addNotesToStudent(){
    if(!document.getElementById('studentAnalysisNotes')) return;
    renderStudentMapelTrend();
  }

  function addMinToSubjectCards(){
    document.querySelectorAll('#tkaSubjectGrid .subject-card, #tkaSubjectGrid .card').forEach(card=>{
      if(card.querySelector('.subject-min-label')) return;
      const text=card.textContent||'';
      if(!/Max/i.test(text)) return;
      const m=text.match(/Max\s*([0-9]+(?:\.[0-9]+)?)/i); if(!m)return;
      const name=(card.querySelector('.subject-name,.card-title,h3,h4')?.textContent||'').trim();
      if(!name)return;
      const vals=[];
      getResults(currentTestId).forEach(r=>{if((getSubtestName(r.subtest_id)||'').trim()===name){const v=getScore(r);if(v!=null)vals.push(v)}});
      if(!vals.length)return;
      const p=card.querySelector('.subject-stats,.kpi-note,.card-subtitle')||card.lastElementChild;
      const min=document.createElement('span');min.className='subject-min-label';min.textContent=' • Min '+Math.min(...vals);p?.appendChild(min);
    });
  }

  /* Use the exact original BAC logo uploaded by the user. */
  function useOriginalBACLogo(){
    const brand=document.querySelector('.brand');
    if(!brand || brand.querySelector('.bac-header-logo')) return;
    const logo=document.createElement('img');
    logo.className='bac-header-logo';
    logo.src='logo-header-ba.png?v=20260825';
    logo.alt='Brain Academy by Ruangguru';
    logo.loading='eager';
    const title=brand.querySelector('.brand-title');
    const subtitle=brand.querySelector('.brand-subtitle');
    if(title) title.remove();
    if(subtitle) subtitle.remove();
    brand.insertBefore(logo,brand.firstChild);
  }

  function apply(){
    removeDetailPage();
    fixOverviewTitle();
    addStatusLegend('page-overview');
    addStatusLegend('page-ranking');
    addStudentMapelTrend();
    addMinToSubjectCards();
    addNotesToStudent();
    useOriginalBACLogo();
  }

  const oldRenderStudentDetail=window.renderStudentDetail;
  if(typeof oldRenderStudentDetail==='function'){
    window.renderStudentDetail=function(){oldRenderStudentDetail();addStudentMapelTrend();renderStudentMapelTrend()};
  }
  const oldRenderTKA=window.renderTKA;
  if(typeof oldRenderTKA==='function'){
    window.renderTKA=function(id){oldRenderTKA(id);setTimeout(addMinToSubjectCards,0)};
  }
  const oldRenderOverview=window.renderOverview;
  if(typeof oldRenderOverview==='function'){
    window.renderOverview=function(id){oldRenderOverview(id);fixOverviewTitle();addStatusLegend('page-overview');useOriginalBACLogo()};
  }
  const oldRenderRanking=window.renderRankingPage;
  if(typeof oldRenderRanking==='function'){
    window.renderRankingPage=function(id){oldRenderRanking(id);addStatusLegend('page-ranking')};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,50));else setTimeout(apply,50);

  const st=document.createElement('style');st.textContent='.status-legend-card{margin-top:18px}.status-legend{display:flex;flex-wrap:wrap;gap:12px 22px;font-size:12px;color:#475569}.legend-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.legend-dot.ontrack{background:#16a34a}.legend-dot.watchlist{background:#eab308}.legend-dot.intervention{background:#ef4444}.student-mapel-trend{margin-top:18px}.mapel-trend-row{display:grid;grid-template-columns:190px 1fr 60px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #e5e7eb}.mapel-name{display:flex;flex-direction:column}.mapel-name small{color:#64748b;margin-top:3px}.mapel-bars{height:52px;display:flex;align-items:end;gap:5px;overflow:hidden}.mapel-point{display:block;width:12px;min-height:6px;background:#2563eb;border-radius:3px 3px 0 0}.mapel-last{text-align:right}.student-analysis-notes{margin-top:14px;padding:12px;background:#f8fafc;border-radius:8px;font-size:12px;line-height:1.6}.note-title{font-weight:700;margin-bottom:4px}.subject-min-label{font-weight:500}.menu button[data-page="detail"]{display:none}.bac-header-logo{display:block;width:180px;max-width:100%;height:auto;object-fit:contain;margin:0 0 18px 0}@media(max-width:700px){.mapel-trend-row{grid-template-columns:120px 1fr 50px}.mapel-point{width:8px}.bac-header-logo{width:150px}}';document.head.appendChild(st);
})();