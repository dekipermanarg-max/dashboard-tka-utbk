/* Force original BAC logo + dashboard title into sidebar */
(function () {
  function applyBrand() {
    const brand = document.querySelector('.brand');
    if (!brand) return false;

    let logo = brand.querySelector('.bac-original-logo');
    if (!logo) {
      logo = document.createElement('img');
      logo.className = 'bac-original-logo';
      logo.alt = 'Brain Academy by Ruangguru';
      logo.src = 'logo-header-ba.png?v=20260825h';
      logo.style.cssText = 'display:block;width:180px;max-width:100%;height:auto;object-fit:contain;margin:0 0 16px 0;';
      brand.prepend(logo);
    }

    // Hide the old generic branding.
    brand.querySelectorAll('.brand-title,.brand-subtitle').forEach(function (el) {
      el.style.display = 'none';
    });

    // Add the requested BAC dashboard title below the logo.
    let title = brand.querySelector('.bac-dashboard-title');
    if (!title) {
      title = document.createElement('div');
      title.className = 'bac-dashboard-title';
      title.innerHTML = 'ANALISIS PERFORMA SISWA<br>TO TKA &amp; TO UTBK<br>BAC PADANG - TARANDAM<br>2026/2027';
      title.style.cssText = 'display:block;color:#fff;font-size:12px;line-height:1.45;font-weight:600;margin:0;';
      brand.appendChild(title);
    }

    return true;
  }

  if (applyBrand()) return;
  const observer = new MutationObserver(function () {
    if (applyBrand()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
