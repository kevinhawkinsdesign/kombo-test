// Mega-menu hover navigation
(function () {
  var header = document.querySelector('.site-header');
  var panel  = document.getElementById('mega-panel');
  var inner  = document.getElementById('mega-panel-inner');
  if (!header || !panel || !inner) return;

  var closeTimer = null;

  function openSection(id) {
    clearTimeout(closeTimer);

    document.querySelectorAll('.mega-section').forEach(function (s) {
      s.classList.toggle('active', s.dataset.section === id);
    });
    document.querySelectorAll('.nav-trigger').forEach(function (t) {
      t.classList.toggle('active', t.dataset.nav === id);
    });

    requestAnimationFrame(function () {
      panel.style.height = inner.scrollHeight + 'px';
    });
  }

  function closePanel() {
    document.querySelectorAll('.nav-trigger').forEach(function (t) {
      t.classList.remove('active');
    });
    panel.style.height = '0';
    panel.addEventListener('transitionend', function handler() {
      document.querySelectorAll('.mega-section').forEach(function (s) {
        s.classList.remove('active');
      });
      panel.removeEventListener('transitionend', handler);
    });
  }

  document.querySelectorAll('.nav-trigger[data-nav]').forEach(function (btn) {
    btn.addEventListener('mouseenter', function () { openSection(btn.dataset.nav); });
    btn.addEventListener('click', function () {
      var alreadyOpen = btn.classList.contains('active') && panel.style.height !== '0px';
      if (alreadyOpen) { closePanel(); } else { openSection(btn.dataset.nav); }
    });
  });

  header.addEventListener('mouseleave', function () {
    closeTimer = setTimeout(closePanel, 120);
  });
  header.addEventListener('mouseenter', function () {
    clearTimeout(closeTimer);
  });

  document.querySelectorAll('.mega-link, .mega-featured').forEach(function (a) {
    a.addEventListener('click', closePanel);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });
})();

// Mobile menu — full-screen takeover
(function () {
  var toggle     = document.querySelector('.nav-toggle');
  var closeBtn   = document.querySelector('.mobile-close');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (!toggle || !mobileMenu) return;

  function openMobile() {
    mobileMenu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    mobileMenu.classList.contains('open') ? closeMobile() : openMobile();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMobile);

  document.querySelectorAll('.mobile-menu-body a').forEach(function (a) {
    a.addEventListener('click', closeMobile);
  });
})();
