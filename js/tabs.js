(function () {
  var navBtns = document.querySelectorAll('.nav-btn');
  var tabs = document.querySelectorAll('.tab');
  var toggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var bgBlur = document.getElementById('bg-blur');
  var isTransitioning = false;

  // Mobile nav toggle
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  // Tab switching with fade
  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (isTransitioning) return;
      var target = btn.getAttribute('data-tab');
      var currentTab = document.querySelector('.tab.active');
      var nextTab = document.getElementById('tab-' + target);
      if (!nextTab || currentTab === nextTab) return;

      isTransitioning = true;

      // Toggle background class
      if (bgBlur) {
        if (target === 'home') {
          bgBlur.classList.add('home-bg');
        } else {
          bgBlur.classList.remove('home-bg');
        }
      }

      // Update nav
      navBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Close mobile nav
      if (navLinks) navLinks.classList.remove('open');

      // Fade out current tab
      currentTab.classList.remove('active');
      currentTab.classList.add('fade-out');

      setTimeout(function () {
        currentTab.classList.remove('fade-out');
        currentTab.style.display = 'none';

        // Show and fade in next tab
        nextTab.style.display = 'block';
        nextTab.classList.add('active');

        isTransitioning = false;
      }, 200);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Ensure initial active tab has correct display
  var initial = document.querySelector('.tab.active');
  if (initial) {
    initial.style.display = 'block';
  }

  // Set correct background class on load
  var activeTab = document.querySelector('.tab.active');
  if (bgBlur && activeTab) {
    var id = activeTab.id;
    if (id === 'tab-home') {
      bgBlur.classList.add('home-bg');
    }
  }

  // Override initial CSS: .tab.active display comes from animation
  // but we need it visible immediately after splash
  setTimeout(function () {
    var at = document.querySelector('.tab.active');
    if (at) at.style.display = 'block';
  }, 100);
})();
