/* UTBK KPI detail: show highest/lowest score with subtest name. */
(function(){
  function apply(){
    const page=document.getElementById('page-utbk');
    if(!page || typeof getResults!=='function') return;
    const selector=document.getElementById('utbkTestSelector');
    const testId=selector?.value;
    if(!testId) return;
    const results=getResults(testId)||[];
    const scored=results.map(r=>({score:typeof getScore==='function'?getScore(r):Number(r.nilai),subtest:r.subtest_id})).filter(x=>Number.isFinite(x.score));
    if(!scored.length) return;
    const high=Math.max(...scored.map(x=>x.score));
    const low=Math.min(...scored.map(x=>x.score));
    const highItem=scored.find(x=>x.score===high);
    const lowItem=scored.find(x=>x.score===low);
    const cards=page.querySelectorAll('.kpi-card');
    if(cards.length<4) return;
    const highCard=cards[2];
    const lowCard=cards[3];
    const highValue=highCard.querySelector('.kpi-value');
    const lowValue=lowCard.querySelector('.kpi-value');
    const highNote=highCard.querySelector('.kpi-note');
    const lowNote=lowCard.querySelector('.kpi-note');
    if(highValue) highValue.textContent=String(high);
    if(lowValue) lowValue.textContent=String(low);
    if(highNote) highNote.textContent=typeof getSubtestName==='function'?getSubtestName(highItem.subtest):highItem.subtest;
    if(lowNote) lowNote.textContent=typeof getSubtestName==='function'?getSubtestName(lowItem.subtest):lowItem.subtest;
  }
  function wrap(){
    if(typeof window.renderUTBK!=='function') return setTimeout(wrap,100);
    if(window.__utbkKpiWrapped) return;
    const original=window.renderUTBK;
    window.renderUTBK=function(testId){
      const result=original.apply(this,arguments);
      setTimeout(apply,0);
      return result;
    };
    window.__utbkKpiWrapped=true;
    setTimeout(apply,0);
  }
  wrap();
})();
