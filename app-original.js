// Compatibility loader for the dashboard script.
(function(){
  var s = document.createElement('script');
  s.src = 'js/app-original.js?v=20260825d';
  s.onload = function(){
    var fix = document.createElement('script');
    fix.src = 'js/tka-detail-category-fix.js?v=20260828a';
    document.head.appendChild(fix);
  };
  document.head.appendChild(s);
})();
