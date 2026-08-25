/* Force original BAC logo into sidebar */
(function () {
  function applyLogo() {
    const brand = document.querySelector('.brand');
    if (!brand) return false;

    let logo = brand.querySelector('.bac-original-logo');
    if (!logo) {
      logo = document.createElement('img');
      logo.className = 'bac-original-logo';
      logo.alt = 'Brain Academy by Ruangguru';
      // index.html is in the repository root, so use a root-relative
      // repository path that also works on GitHub Pages project sites.
      logo.src = 'logo-header-ba.png?v=20260825g';
      logo.style.cssText = 'display:block;width:180px;max-width:100%;height:auto;object-fit:contain;margin:0 0 24px 0;';
      brand.prepend(logo);
    }

    brand.querySelectorAll('.brand-title,.brand-subtitle').forEach(function (el) {
      el.style.display = 'none';
    });
    return true;
  }

  if (applyLogo()) return;
  const observer = new MutationObserver(function () {
    if (applyLogo()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
