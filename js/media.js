(function () {
  var USERNAME = 'Afterblink';
  var AVATAR = 'media/Logo.png';

  var feed = document.getElementById('mediaFeed');
  var lb = document.getElementById('lightbox');
  var lbVideo = document.getElementById('lbVideo');
  var lbImage = document.getElementById('lbImage');
  var lbClose = document.getElementById('lbClose');

  var imageExts = { png: 1, jpg: 1, jpeg: 1, gif: 1, webp: 1, bmp: 1 };
  var videoExts = { mp4: 1, mov: 1, webm: 1, avi: 1, mkv: 1 };
  var exclude = { 'logo.png': 1, 'discord server screenshot.png': 1, 'manifest.json': 1, 'qa.png': 1 };

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

  // ─── Label from filename ───
  function labelFromName(name) {
    return name
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); })
      .trim();
  }

  // ─── Build post ───
  function buildPost(item) {
    var post = document.createElement('div');
    post.className = 'feed-post';

    var header = document.createElement('div');
    header.className = 'feed-post-header';
    header.innerHTML =
      '<div class="feed-post-avatar"><img src="' + AVATAR + '" alt="' + USERNAME + '" /></div>' +
      '<span class="feed-post-user">' + USERNAME + '</span>' +
      '<span class="feed-post-dot">\u25CF</span>' +
      '<span class="feed-post-time">' + (item.type === 'image' ? 'Artwork' : 'Animation') + '</span>';
    post.appendChild(header);

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

    var caption = document.createElement('div');
    caption.className = 'feed-caption';
    caption.innerHTML = '<strong>' + USERNAME + '</strong> ' + item.label;
    post.appendChild(caption);

    return post;
  }

  // ─── Get repo name ───
  function getRepo() {
    // Use config value if set
    if (typeof GITHUB_REPO !== 'undefined' && GITHUB_REPO) {
      return GITHUB_REPO;
    }
    // Fallback: detect from page URL (GitHub Pages)
    var path = window.location.pathname;
    var parts = path.replace(/\/$/, '').split('/').filter(Boolean);
    if (parts.length > 0 && parts[parts.length - 1].indexOf('.') > -1) {
      parts.pop();
    }
    if (parts.length > 0) {
      return parts[0];
    }
    return 'Website';
  }

  // ─── Fetch from GitHub API ───
  function loadFromGitHub() {
    var user = typeof GITHUB_USER !== 'undefined' && GITHUB_USER && GITHUB_USER !== 'your-username'
      ? GITHUB_USER
      : null;

    if (!user) {
      feed.innerHTML = '<div class="feed-empty">Set your GitHub username in <code>js/config.js</code></div>';
      return;
    }

    var repo = getRepo();
    var url = 'https://api.github.com/repos/' + encodeURIComponent(user) + '/' + encodeURIComponent(repo) + '/contents/media';

    feed.innerHTML = '<div class="feed-empty">Loading media...</div>';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API says: ' + res.status + ' ' + res.statusText);
        return res.json();
      })
      .then(function (files) {
        if (!Array.isArray(files)) throw new Error('Unexpected response');

        var artworks = [];
        var animations = [];

        files.forEach(function (f) {
          var name = f.name.toLowerCase();
          if (f.type !== 'file') return;
          if (exclude[name]) return;

          var ext = name.split('.').pop();
          var src = f.download_url;
          var label = labelFromName(f.name);

          if (imageExts[ext]) {
            artworks.push({ src: src, label: label, type: 'image' });
          } else if (videoExts[ext]) {
            animations.push({ src: src, label: label, type: 'video' });
          }
        });

        artworks.reverse();
        animations.reverse();
        render(artworks, animations);
      })
      .catch(function (err) {
        feed.innerHTML =
          '<div class="feed-empty">Could not load media. Check:<br>' +
          '&bull; Your GitHub username in <code>js/config.js</code><br>' +
          '&bull; Your repo name (currently trying <strong>' + repo + '</strong>)<br>' +
          '&bull; The <code>media/</code> folder exists in your repo<br><br>' +
          '<span style="font-size:0.75rem;color:rgba(255,255,255,0.25)">' + err.message + '</span></div>';
      });
  }

  // ─── Render ───
  function render(artworks, animations) {
    feed.innerHTML = '';

    var all = artworks.concat(animations);
    if (all.length === 0) {
      feed.innerHTML = '<div class="feed-empty">No media found. Drop files into the media folder!</div>';
      return;
    }

    all.forEach(function (item) {
      feed.appendChild(buildPost(item));
    });

    var statA = document.getElementById('statArtworks');
    var statV = document.getElementById('statAnimations');
    if (statA) statA.textContent = artworks.length;
    if (statV) statV.textContent = animations.length;
  }

  loadFromGitHub();
})();
