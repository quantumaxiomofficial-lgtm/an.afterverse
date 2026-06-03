(function () {
  var el = document.getElementById('statVisits');
  if (!el) return;

  var key = 'afterblink-site-v2';

  // Try localStorage first for instant display
  var cached = localStorage.getItem(key);
  if (cached) {
    el.textContent = cached;
  }

  // Fetch from CountAPI
  var api = 'https://api.countapi.xyz/hit/afterblink/visits';

  fetch(api)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var count = data.value;
      if (count) {
        el.textContent = count.toLocaleString();
        try { localStorage.setItem(key, String(count)); } catch (e) {}
      }
    })
    .catch(function () {
      // Increment local counter as fallback
      var local = parseInt(localStorage.getItem(key), 10) || 0;
      local += 1;
      el.textContent = local;
      try { localStorage.setItem(key, String(local)); } catch (e) {}
    });
})();
