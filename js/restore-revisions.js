/* Restore the requested dashboard UI after the core and revision scripts load. */
(function(){
  function card(id){ const e=document.getElementById(id); return e && e.closest('.kpi-card'); }
  function applyBrand(){
    const brand=document.querySelector('.brand'); if(!brand)return;
    let logo=brand.querySelector('.bac-header-logo');
    if(!logo){
      logo=document.createElement('img'); logo.className='bac-header-logo';
      logo.src='logo-header-ba.png?v=20260825m'; logo.alt='Brain Academy by Ruangguru';
      brand.prepend(logo);
    }
    let title=brand.querySelector('.brand-title');
    if(!title){ title=document.createElement('div'); title.className='brand-title'; brand.appendChild(title); }
    title.textContent='ANALISIS PERFORMA SISWA';
    let sub=brand.querySelector('.brand-subtitle');
    if(!sub){ sub=document.createElement('div'); brand.appendChild(sub); }
    sub.className='brand-subtitle';
    sub.innerHTML='TO TKA &amp; TO UTBK<br>BAC PADANG - TARANDAM<br>2026/2027';
    title.style.display='block'; sub.style.display='block';
  }
  function placeOverviewLegend(){
    const overview=document.getElementById('page-overview');
    if(!overview)return;
    if(typeof window.addStatusLegend==='function') window.addStatusLegend('page-overview');
    const legend=document.getElementById('page-overviewLegend');
    if(!legend)return;
    const cards=[...overview.querySelectorAll('.card')];
    const improvement=document.getElementById('overviewImprovementCard');
    const top=cards.find(c=>c.querySelector('.card-title')?.textContent.trim()==='🏆 10 Siswa Teratas');
    if(improvement){ improvement.parentNode.insertBefore(legend,improvement); }
    else if(top){ top.parentNode.insertBefore(legend,top.nextElementSibling); }
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
    if(tkaTitle)tkaTitle.textContent='📊 Analisis performa TO TKA berdasarkan mapel — nilai rata-rata';
    document.getElementById('tkaRankingTable')?.closest('.card')?.remove();
    document.querySelectorAll('#page-overview .card-title').forEach(e=>{if(e.textContent.trim()==='Top Performance')e.textContent='🏆 10 Siswa Teratas';});
    document.querySelectorAll('#page-overview .card-title').forEach(e=>{if(e.textContent.trim()==='Perlu Perhatian')e.closest('.card')?.remove();});
    placeOverviewLegend();
  }
  window.restoreDashboardUI=applyStatic;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(applyStatic,100));else setTimeout(applyStatic,100);
  const st=document.createElement('style');
  st.textContent=`
    .brand{text-align:left;padding:0 12px 10px !important;height:220px !important;min-height:0 !important;margin:0 !important;overflow:visible !important;display:block !important}
    .bac-header-logo{display:block;width:150px;max-width:100%;height:auto;object-fit:contain;object-position:left;margin:0 0 8px 0 !important}
    .brand-title{display:block !important;font-size:14px;font-weight:800;line-height:1.25;color:#fff;letter-spacing:.1px;margin:0 !important;padding:0 !important}
    .brand-subtitle{display:block !important;font-size:12px;line-height:1.45;color:#fff;margin:2px 0 0 0 !important;padding:0 !important}
    .kpi-total-students{border:2px solid #2563eb;background:#eff6ff}
  `;
  document.head.appendChild(st);
})();
