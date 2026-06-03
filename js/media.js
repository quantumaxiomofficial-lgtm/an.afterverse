(function () {
  var USERNAME = 'Afterblink';
  var AVATAR = 'media/Logo.png';

  var artworks = [
    { src: 'media/Blender render1.png',          label: 'Blender Render' },
    { src: 'media/Blender render2.png',          label: 'Blender Render' },
    { src: 'media/Blender render3.png',          label: 'Blender Render' },
    { src: 'media/Blender render4.png',          label: 'Blender Render' },
    { src: 'media/Digital Painting.png',         label: 'Digital Painting' },
    { src: 'media/Illustration10-frieren.png',   label: 'Frieren Illustration' },
    { src: 'media/OC-Yag .png',                  label: 'OC Yag' },
    { src: 'media/SANETSU.png',                  label: 'SANETSU' },
    { src: 'media/Tsukuyo FA.png',               label: 'Tsukuyo FA' },
    { src: 'media/Tsukuyo FA2.png',              label: 'Tsukuyo FA 2' },
    { src: 'media/Tsukuyo FA3.png',              label: 'Tsukuyo FA 3' },
  ];

  var animations = [
    { src: 'media/en4.mp4',                      label: 'EN4' },
    { src: 'media/Hairflow1.mp4',                label: 'Hair Flow' },
    { src: 'media/Hairflow2.mp4',                label: 'Hair Flow' },
    { src: 'media/Inbetweening.mp4',             label: 'Inbetweening' },
    { src: 'media/New Character.mp4',            label: 'New Character' },
    { src: 'media/Practice1.mp4',                label: 'Practice' },
    { src: 'media/TBH 1.mov',                    label: 'TBH' },
    { src: 'media/TBH 2.mov',                    label: 'TBH' },
  ];

  var allMedia = artworks.map(function (a) { a.type = 'image'; return a; })
    .concat(animations.map(function (a) { a.type = 'video'; return a; }));

  var feed = document.getElementById('mediaFeed');
  var lb = document.getElementById('lightbox');
  var lbVideo = document.getElementById('lbVideo');
  var lbImage = document.getElementById('lbImage');
  var lbClose = document.getElementById('lbClose');

  // Lightbox
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

  if (!feed) return;

  // ─── Intersection Observer for video autoplay ───
  var videoElements = [];
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

  // ─── Build posts ───
  allMedia.forEach(function (item) {
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

      // Track for IntersectionObserver
      if (observer) {
        observer.observe(video);
      }
      videoElements.push(video);
    }

    post.appendChild(mediaWrap);

    // Caption (no action icons)
    var caption = document.createElement('div');
    caption.className = 'feed-caption';
    caption.innerHTML = '<strong>' + USERNAME + '</strong> ' + item.label;
    post.appendChild(caption);

    feed.appendChild(post);
  });

  if (allMedia.length === 0) {
    feed.innerHTML = '<div class="feed-empty">No posts yet. Stay tuned!</div>';
  }

  // Stat counters
  var statA = document.getElementById('statArtworks');
  var statV = document.getElementById('statAnimations');
  if (statA) statA.textContent = artworks.length;
  if (statV) statV.textContent = animations.length;
})();
