/* Dashboard loader */
(function(){
  const original = document.createElement('script');
  original.src = 'app-original.js';
  original.onload = function(){
    const revisions = document.createElement('script');
    revisions.src = 'revisions.js';
    document.head.appendChild(revisions);
  };
  document.head.appendChild(original);
})();
