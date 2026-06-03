(function () {
  var toast = document.getElementById('toast');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  document.querySelectorAll('.socials-copy').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var card = btn.closest('.socials-card');
      if (!card) return;

      var url = card.getAttribute('data-copy');
      if (!url) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          showToast('Copied to clipboard!');
        }).catch(function () {
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }

      btn.classList.add('copied');
      setTimeout(function () { btn.classList.remove('copied'); }, 1200);
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Copied to clipboard!'); }
    catch (e) { showToast('Could not copy'); }
    document.body.removeChild(ta);
  }
})();
