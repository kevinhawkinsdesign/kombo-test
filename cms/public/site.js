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

    // rAF so display:block has taken effect before measuring
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

  // Hover triggers
  document.querySelectorAll('.nav-trigger[data-nav]').forEach(function (btn) {
    btn.addEventListener('mouseenter', function () { openSection(btn.dataset.nav); });
  });

  // Click also toggles (touch / keyboard users)
  document.querySelectorAll('.nav-trigger[data-nav]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var alreadyOpen = btn.classList.contains('active') && panel.style.height !== '0px';
      if (alreadyOpen) {
        closePanel();
      } else {
        openSection(btn.dataset.nav);
      }
    });
  });

  // Close when mouse leaves the entire header
  header.addEventListener('mouseleave', function () {
    closeTimer = setTimeout(closePanel, 120);
  });
  header.addEventListener('mouseenter', function () {
    clearTimeout(closeTimer);
  });

  // Close on mega-link click
  document.querySelectorAll('.mega-link, .mega-featured').forEach(function (a) {
    a.addEventListener('click', closePanel);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });
})();

// Mobile menu toggle
(function () {
  var toggle     = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', function () {
    mobileMenu.classList.toggle('open');
    var open = mobileMenu.classList.contains('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();
