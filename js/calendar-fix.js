/* Calendar revisions: chronological order, standardized TO names, and completion marks. */
(function(){
  const TKA = [
    ['2026-07-14','2026-07-23','Juli','TO TKA SMA Premium #1','14–23 Jul 2026'],
    ['2026-07-28','2026-08-06','Juli','TO TKA SMA Premium #2','28 Jul–6 Agu 2026'],
    ['2026-08-10','2026-08-19','Agustus','TO TKA SMA Reguler #1','10–19 Agu 2026'],
    ['2026-08-24','2026-09-02','Agustus','TO TKA SMA Premium #3','24 Agu–2 Sep 2026'],
    ['2026-09-14','2026-09-23','September','TO TKA SMA Reguler #2','14–23 Sep 2026'],
    ['2026-09-24','2026-10-01','September','TO TKA SMA Premium #4','24 Sep–1 Okt 2026'],
    ['2026-10-02','2026-10-09','Oktober','TO TKA SMA Premium #5','2–9 Okt 2026'],
    ['2026-10-13','2026-10-20','Oktober','TO TKA SMA Premium #6','13–20 Okt 2026']
  ];

  const UTBK = [
    ['2026-08-20','2026-08-26','Agustus','TO UTBK Reguler #1','20–26 Agu 2026'],
    ['2026-08-27','2026-09-02','Agustus','TO UTBK Premium #1','27 Agu–2 Sep 2026'],
    ['2026-09-03','2026-09-09','September','TO UTBK Premium #2','3–9 Sep 2026'],
    ['2026-09-10','2026-09-16','September','TO UTBK Reguler #2','10–16 Sep 2026'],
    ['2026-09-17','2026-09-23','September','TO UTBK Premium #3','17–23 Sep 2026'],
    ['2026-09-24','2026-09-30','September','TO UTBK Premium #4','24–30 Sep 2026'],
    ['2026-10-01','2026-10-07','Oktober','TO UTBK Reguler #3','1–7 Okt 2026'],
    ['2026-10-08','2026-10-14','Oktober','TO UTBK Premium #5','8–14 Okt 2026'],
    ['2026-10-15','2026-10-21','Oktober','TO UTBK Premium #6','15–21 Okt 2026'],
    ['2026-10-22','2026-10-28','Oktober','TO UTBK Premium #7','22–28 Okt 2026'],
    ['2026-11-12','2026-11-18','November','TO UTBK Premium #8','12–18 Nov 2026'],
    ['2026-11-19','2026-11-26','November','TO UTBK Reguler #4','19–26 Nov 2026'],
    ['2026-11-26','2026-12-02','November','TO UTBK Premium #9','26 Nov–2 Des 2026'],
    ['2026-12-03','2026-12-09','Desember','TO UTBK Premium #10','3–9 Des 2026'],
    ['2026-12-10','2026-12-16','Desember','TO UTBK Premium #11','10–16 Des 2026'],
    ['2026-12-17','2026-12-23','Desember','TO UTBK Premium #12','17–23 Des 2026'],
    ['2027-01-07','2027-01-14','Januari','TO UTBK Reguler #5','7–14 Jan 2027'],
    ['2027-01-20','2027-01-27','Januari','TO UTBK Premium #13','20–27 Jan 2027'],
    ['2027-01-21','2027-01-27','Januari','TO UTBK Premium #14','21–27 Jan 2027'],
    ['2027-01-28','2027-02-03','Januari','TO UTBK Premium #15','28 Jan–3 Feb 2027'],
    ['2027-02-04','2027-02-10','Februari','TO UTBK Reguler #6','4–10 Feb 2027'],
    ['2027-02-11','2027-02-17','Februari','TO UTBK Premium #16','11–17 Feb 2027'],
    ['2027-02-18','2027-02-24','Februari','TO UTBK Premium #17','18–24 Feb 2027'],
    ['2027-02-25','2027-03-03','Februari','TO UTBK Reguler #7','25 Feb–3 Mar 2027'],
    ['2027-03-18','2027-03-24','Maret','TO UTBK Premium #18','18–24 Mar 2027'],
    ['2027-03-25','2027-03-31','Maret','TO UTBK Premium #19','25–31 Mar 2027'],
    ['2027-04-01','2027-04-07','April','TO UTBK Reguler #8','1–7 Apr 2027'],
    ['2027-04-08','2027-04-14','April','TO UTBK Premium #20','8–14 Apr 2027']
  ];

  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function status(start,end){
    const today=new Date(); today.setHours(0,0,0,0);
    const s=new Date(start+'T00:00:00'), e=new Date(end+'T23:59:59');
    if(today>e) return {mark:'✓',label:'Selesai',cls:'done'};
    if(today>=s && today<=e) return {mark:'●',label:'Sedang berlangsung',cls:'ongoing'};
    return {mark:'',label:'',cls:''};
  }
  function table(title,rows){
    rows=rows.slice().sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
    return `<div class="card calendar-card"><div class="card-title">${esc(title)}</div><div class="calendar-grid"><b>Bulan</b><b>TO</b><b>Tanggal</b>${rows.map(x=>{const s=status(x[0],x[1]);return `<div>${esc(x[2])}</div><div class="calendar-to ${s.cls}">${s.mark?`<span class="calendar-mark" title="${s.label}">${s.mark}</span>`:''}${esc(x[3])}</div><div>${esc(x[4])}</div>`}).join('')}</div></div>`;
  }
  function render(){
    const page=document.getElementById('page-calendar'); if(!page)return;
    page.innerHTML=`<div class="page-header"><div><h1>🗓️ Kalender TO</h1><p>Jadwal TO TKA & TO UTBK 2026/2027</p></div></div>${table('TO TKA',TKA)}${table('TO UTBK',UTBK)}<div class="calendar-note">✓ Selesai &nbsp; • &nbsp; ● Sedang berlangsung</div>`;
  }
  function apply(){
    render();
    if(!document.getElementById('calendarFixStyle')){
      const st=document.createElement('style'); st.id='calendarFixStyle';
      st.textContent=`
        .calendar-grid{display:grid;grid-template-columns:90px minmax(280px,1fr) 145px;border:1px solid #dbe3ee;border-radius:7px;overflow:hidden;font-size:12px}
        .calendar-grid>*{padding:8px;border-right:1px solid #dbe3ee;border-bottom:1px solid #dbe3ee}
        .calendar-grid>*:nth-child(3n){border-right:0}
        .calendar-grid>*:nth-last-child(-n+3){border-bottom:0}
        .calendar-grid>b{background:#eef3f9;font-weight:700}
        .calendar-to{font-weight:500}.calendar-to.done{font-weight:700}.calendar-mark{display:inline-flex;align-items:center;justify-content:center;margin-right:6px;width:18px;height:18px;border-radius:50%;font-weight:800}.calendar-to.done .calendar-mark{background:#dcfce7;color:#15803d}.calendar-to.ongoing .calendar-mark{color:#ca8a04}
        .calendar-note{margin-top:10px;font-size:12px;color:#64748b}
      `; document.head.appendChild(st);
    }
  }
  window.refreshCalendar=apply;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,150));else setTimeout(apply,150);
})();
