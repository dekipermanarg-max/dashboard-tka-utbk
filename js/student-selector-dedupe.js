/* Student selector dedupe
   Keep one visible option per normalized student name.
   This intentionally works directly on the student selector instead of
   depending on dashboardData, because the selector can be rebuilt later
   by the app after the data has already loaded.
*/
(function(){
  function norm(v){
    return String(v == null ? '' : v).replace(/\s+/g,' ').trim().toLowerCase();
  }

  function dedupeSelect(select){
    if(!select) return;

    const selectedValue = String(select.value || '');
    const seen = new Set();

    [...select.options].forEach(function(option){
      const label = norm(option.textContent);
      if(!label) return;

      if(seen.has(label)) {
        /* If the duplicate is currently selected, keep the first option's
           value so changing the visible list never breaks the selection. */
        if(String(option.value) === selectedValue) {
          const keeper = [...select.options].find(function(o){
            return o !== option && norm(o.textContent) === label && !o.hidden;
          });
          if(keeper) select.value = keeper.value;
        }
        option.remove();
        return;
      }

      seen.add(label);
    });
  }

  function dedupe(){
    /* studentSelector is the actual student dropdown used throughout the app. */
    const primary = document.getElementById('studentSelector');
    if(primary) dedupeSelect(primary);

    /* Also catch any secondary student selectors without touching TO/test selectors. */
    document.querySelectorAll('select').forEach(function(select){
      if(select === primary) return;
      const id = String(select.id || '').toLowerCase();
      const aria = String(select.getAttribute('aria-label') || '').toLowerCase();
      if(id.includes('student') || aria.includes('student') || aria.includes('siswa')) {
        dedupeSelect(select);
      }
    });
  }

  let timer = null;
  let running = false;
  function schedule(){
    if(timer) return;
    timer = setTimeout(function(){
      timer = null;
      if(running) return;
      running = true;
      try { dedupe(); } finally { running = false; }
    }, 50);
  }

  function start(){
    dedupe();
    setTimeout(dedupe, 100);
    setTimeout(dedupe, 500);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.dedupeStudentSelector = dedupe;
})();
