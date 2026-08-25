/* Restore the requested dashboard UI after the core and revision scripts load. */
(function(){
  function text(el, value){ if(el) el.textContent=value; }
  function card(id){ const e=document.getElementById(id); return e && e.closest('.kpi-card'); }
  function applyBrand(){
    const brand=document.querySelector('.brand'); if(!brand)return;
    let logo=brand.querySelector('.bac-header-logo');
    if(!logo){
      logo=document.createElement('img'); logo.className='bac-header-logo';
      logo.src='logo-header-ba.png?v=20260825i'; logo.alt='Brain Academy by Ruangguru';
      brand.prepend(logo);
    }
    let title=brand.querySelector('.brand-title');
    if(!title){ title=document.createElement('div'); title.className='brand-title'; brand.appendChild(title); }
    title.innerHTML='ANALISIS PERFORMA SISWA';
    let sub=brand.querySelector('.brand-subtitle');
    if(!sub){ sub=document.createElement('div'); sub.className='brand-subtitle'; brand.appendChild(sub); }
    sub.innerHTML='TO TKA &amp; TO UTBK<br>BAC PADANG - TARANDAM<br>2026/2027';
    title.style.display='block'; sub.style.display='block';
  }
  function applyStatic(){
    applyBrand();
    document.querySelector('.menu button[data-page="detail"]')?.remove();
    document.getElementById('page-detail')?.remove();
    document.querySelectorAll('#page-overview .two-column').forEach(e=>e.style.display='none');
    card('totalStudents')?.classList.add('kpi-total-students');
    card('totalStudents')?.querySelector('.kpi-note')?.remove();
    ['tkaParticipants','tkaHighest','tkaLowest'].forEach(id=>card(id)?.querySelector('.kpi-note')?.remove());
    const tkaTitle=document.querySelector('#page-tka .card-title');
    if(tkaTitle)tkaTitle.textContent='📊 Rata-rata Nilai per Mapel';
    document.getElementById('tkaRankingTable')?.closest('.card')?.remove();
    document.querySelectorAll('#page-overview .card-title').forEach(e=>{if(e.textContent.trim()==='Top Performance')e.textContent='🏆 10 Siswa Teratas';});
    document.querySelectorAll('#page-overview .card-title').forEach(e=>{if(e.textContent.trim()==='Perlu Perhatian')e.closest('.card')?.remove();});
    if(window.addStatusLegend){ addStatusLegend('page-overview'); addStatusLegend('page-ranking'); }
  }
  window.restoreDashboardUI=applyStatic;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyStatic,100));else setTimeout(applyStatic,100);
  const st=document.createElement('style');
  st.textContent=`
    .brand{text-align:left;padding-bottom:18px}
    .bac-header-logo{display:block;width:180px;max-width:100%;height:auto;object-fit:contain;object-position:left;margin:0 0 14px 0}
    .brand-title{font-size:14px;font-weight:800;line-height:1.35;color:#fff;letter-spacing:.1px}
    .brand-subtitle{font-size:12px;line-height:1.55;color:#fff;margin-top:3px}
    .kpi-total-students{border:2px solid #2563eb;background:#eff6ff}
  `;
  document.head.appendChild(st);
})();
