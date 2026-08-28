/* Standardize TO display names across every dashboard menu. */
(function(){
  function standardize(name){
    const raw=String(name||'').trim();
    const upper=raw.toUpperCase();
    if(!upper) return raw;

    const isTKA=upper.includes('TKA');
    const isUTBK=upper.includes('UTBK');
    if(!isTKA && !isUTBK) return raw;

    const premium=/PREMIUM/i.test(raw);
    const regular=/REGULER|REGULAR/i.test(raw);
    const mode=premium?'Premium':regular?'Reguler':'';
    const numMatch=raw.match(/(?:EPISODE|EP|#)\s*0*(\d+)/i);
    const num=numMatch?numMatch[1]:'';

    if(isTKA && mode && num) return `TO TKA SMA ${mode} #${num}`;
    if(isUTBK && mode && num) return `TO UTBK ${mode} #${num}`;

    return raw.replace(/\bEpisode\s*(\d+)\b/ig,'#$1');
  }

  if(typeof window.getTestName==='function' && !window.getTestName.__standardized){
    const original=window.getTestName;
    const wrapped=function(testOrId){ return standardize(original(testOrId)); };
    wrapped.__standardized=true;
    window.getTestName=wrapped;
  }

  window.standardizeTOName=standardize;
})();
