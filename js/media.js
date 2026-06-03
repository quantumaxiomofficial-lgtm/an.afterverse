(function () {
  var USERNAME = 'Afterblink';
  var AVATAR = 'media/Logo.png';

  var feed = document.getElementById('mediaFeed');
  var lb = document.getElementById('lightbox');
  var lbVideo = document.getElementById('lbVideo');
  var lbImage = document.getElementById('lbImage');
  var lbClose = document.getElementById('lbClose');

  if (!feed) return;

  // ─── Lightbox ───
  function closeLB() {
    lb.classList.remove('active');
    if (lbVideo) { lbVideo.pause(); lbVideo.src = ''; lbVideo.style.display = 'none'; }
    if (lbImage) { lbImage.src = ''; lbImage.style.display = 'none'; }
    document.body.style.overflow = '';
  }

  if (lbClose) lbClose.addEventListener('click', closeLB);
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });

  function openMedia(src, isVideo) {
    if (isVideo) {
      if (lbVideo) { lbVideo.src = src; lbVideo.style.display = 'block'; }
      if (lbImage) lbImage.style.display = 'none';
    } else {
      if (lbImage) { lbImage.src = src; lbImage.style.display = 'block'; }
      if (lbVideo) { lbVideo.pause(); lbVideo.src = ''; lbVideo.style.display = 'none'; }
    }
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function mimeType(src) {
    var ext = src.split('.').pop().toLowerCase();
    return ext === 'mov' ? 'video/quicktime' : ext === 'webm' ? 'video/webm' : 'video/mp4';
  }

  // ─── Intersection Observer ───
  var observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().catch(function () {});
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.5 });
  }

  // ─── Build post from item ───
  function buildPost(item) {
    var post = document.createElement('div');
    post.className = 'feed-post';

    // Header
    var header = document.createElement('div');
    header.className = 'feed-post-header';
    header.innerHTML =
      '<div class="feed-post-avatar"><img src="' + AVATAR + '" alt="' + USERNAME + '" /></div>' +
      '<span class="feed-post-user">' + USERNAME + '</span>' +
      '<span class="feed-post-dot">\u25CF</span>' +
      '<span class="feed-post-time">' + (item.type === 'image' ? 'Artwork' : 'Animation') + '</span>';
    post.appendChild(header);

    // Media
    var mediaWrap = document.createElement('div');
    mediaWrap.className = 'feed-post-media';

    if (item.type === 'image') {
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.label;
      img.loading = 'lazy';
      mediaWrap.appendChild(img);

      var overlay = document.createElement('div');
      overlay.className = 'feed-post-overlay';
      overlay.innerHTML = '<i class="fa-solid fa-expand"></i>';
      mediaWrap.appendChild(overlay);

      mediaWrap.addEventListener('click', function () { openMedia(item.src, false); });
    } else {
      var video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-label', item.label);
      var source = document.createElement('source');
      source.src = item.src;
      source.type = mimeType(item.src);
      video.appendChild(source);
      mediaWrap.appendChild(video);

      var overlay = document.createElement('div');
      overlay.className = 'feed-post-overlay';
      overlay.innerHTML = '<i class="fa-solid fa-play"></i>';
      mediaWrap.appendChild(overlay);

      mediaWrap.addEventListener('click', function () { openMedia(item.src, true); });
      if (observer) observer.observe(video);
    }

    post.appendChild(mediaWrap);

    // Caption
    var caption = document.createElement('div');
    caption.className = 'feed-caption';
    caption.innerHTML = '<strong>' + USERNAME + '</strong> ' + item.label;
    post.appendChild(caption);

    return post;
  }

  // ─── Load manifest ───
  function loadManifest() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'media/manifest.json?' + Date.now(), true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        try {
          var data = JSON.parse(xhr.responseText);
          render(data);
        } catch (e) {
          feed.innerHTML = '<div class="feed-empty">Failed to parse media manifest.</div>';
        }
      } else {
        feed.innerHTML = '<div class="feed-empty">Could not load media. Try running <code>node build-manifest.js</code>.</div>';
      }
    };
    xhr.onerror = function () {
      feed.innerHTML = '<div class="feed-empty">Network error loading media.</div>';
    };
    xhr.send();
  }

  // ─── Render feed ───
  function render(data) {
    var all = [];

    (data.artworks || []).forEach(function (a) {
      a.type = 'image';
      all.push(a);
    });
    (data.animations || []).forEach(function (a) {
      a.type = 'video';
      all.push(a);
    });

    feed.innerHTML = '';

    if (all.length === 0) {
      feed.innerHTML = '<div class="feed-empty">No media yet. Drop files into the media folder!</div>';
      return;
    }

    // Sort: newest first by putting later entries first (reverse order)
    // or keep as-is from manifest. We'll reverse so newest uploads appear first.
    all.reverse();

    all.forEach(function (item) {
      feed.appendChild(buildPost(item));
    });

    // Update stat counters
    var statA = document.getElementById('statArtworks');
    var statV = document.getElementById('statAnimations');
    if (statA) statA.textContent = (data.artworks || []).length;
    if (statV) statV.textContent = (data.animations || []).length;
  }

  loadManifest();
})();
