(function () {
  const VIDEOS = [
    { src: 'media/Newcharacter-jiggle1.mp4', label: 'New Character' },
    { src: 'media/tf2.mp4',                  label: 'TF2' },
    { src: 'media/Demo2.mov',                label: 'Demo 2' },
    { src: 'media/Untitled.mp4',             label: 'Untitled' },
    { src: 'media/Demo1.mov',                label: 'Demo 1' },
    { src: 'media/tf1.mp4',                  label: 'TF1' },
    { src: 'media/en4.mp4',                  label: 'EN4' },
  ];

  const grid = document.getElementById('videoGrid');
  const lb = document.getElementById('lightbox');
  const lbVideo = document.getElementById('lbVideo');
  const lbClose = document.getElementById('lbClose');

  if (!grid) return;

  function openLightbox(src) {
    if (!lb || !lbVideo) return;
    lbVideo.src = src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lb || !lbVideo) return;
    lb.classList.remove('active');
    lbVideo.pause();
    lbVideo.src = '';
    document.body.style.overflow = '';
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);

  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  function mimeType(src) {
    var ext = src.split('.').pop().toLowerCase();
    if (ext === 'mp4') return 'video/mp4';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'webm') return 'video/webm';
    return 'video/mp4';
  }

  VIDEOS.forEach(function (v) {
    const card = document.createElement('div');
    card.className = 'video-card';

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    video.loop = true;
    video.setAttribute('aria-label', v.label);

    const source = document.createElement('source');
    source.src = v.src;
    source.type = mimeType(v.src);
    video.appendChild(source);

    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    overlay.innerHTML = '<div class="play-icon"><i class="fa-solid fa-play"></i></div>';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'video-card-label';
    labelDiv.innerHTML = '<span>' + v.label + '</span><span class="video-card-badge">Animation</span>';

    card.appendChild(video);
    card.appendChild(overlay);
    card.appendChild(labelDiv);

    card.addEventListener('click', function () {
      openLightbox(v.src);
    });

    card.addEventListener('mouseenter', function () {
      video.play().catch(function () {});
    });

    card.addEventListener('mouseleave', function () {
      video.pause();
      video.currentTime = 0;
    });

    grid.appendChild(card);
  });

  if (grid.children.length === 0) {
    grid.innerHTML = '<div class="empty-state">No animations to show yet. Stay tuned!</div>';
  }
})();
