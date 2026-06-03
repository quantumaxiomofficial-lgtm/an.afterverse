(function () {
  var splash = document.getElementById('splash');
  var mainContent = document.getElementById('mainContent');
  var logo = document.getElementById('splashLogo');
  var sub = document.getElementById('splashSub');

  if (!splash) return;

  mainContent.style.opacity = '0';

  var tl = {
    start: performance.now(),
    duration: 4200,
  };

  function update(now) {
    var elapsed = now - tl.start;
    var progress = Math.min(elapsed / tl.duration, 1);

    // Logo: fade up 0-1.2s
    var logoP = Math.min(elapsed / 1000, 1);
    if (logo) {
      logo.style.opacity = Math.min(logoP * 1.5, 1);
      logo.style.transform = 'translateY(' + (20 - logoP * 20) + 'px)';
    }

    // Subtitle: fade in 1s-2s
    var subP = Math.max(0, Math.min((elapsed - 900) / 700, 1));
    if (sub) {
      sub.style.opacity = subP;
      sub.style.transform = 'translateY(' + (12 - subP * 12) + 'px)';
    }

    // Splash fade out: 3.2s-4.2s
    var fadeP = Math.max(0, Math.min((elapsed - 3200) / 1000, 1));
    splash.style.opacity = 1 - fadeP;

    // Main content fade in: 3.5s-4.5s
    var mainP = Math.max(0, Math.min((elapsed - 3500) / 1000, 1));
    mainContent.style.opacity = mainP;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      splash.style.display = 'none';
      mainContent.style.opacity = '1';
    }
  }

  requestAnimationFrame(update);
})();
