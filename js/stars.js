(function () {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.2,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        drift: (Math.random() - 0.5) * 0.04,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.y -= s.speed;
      s.x += s.drift;

      if (s.y < -2) {
        s.y = h + 2;
        s.x = Math.random() * w;
      }
      if (s.x < -2) s.x = w + 2;
      if (s.x > w + 2) s.x = -2;

      const pulse = Math.sin(Date.now() * 0.001 + s.alpha * 10) * 0.15 + 0.85;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 180, 255, ${s.alpha * pulse})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createStars(Math.floor((w * h) / 8000));
  });

  resize();
  createStars(Math.floor((w * h) / 8000));
  draw();
})();
