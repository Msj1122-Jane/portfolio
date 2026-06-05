/* ============================================================
   马仕瑾 · 个人网站 v2 · script.js
   ============================================================ */

/* ── 自定义光标 ── */
(function () {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    document.body.classList.add('has-cursor');
  });

  (function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('[data-cursor="link"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));
  });
  document.querySelectorAll('[data-cursor="view"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-view'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-view'));
  });
  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('has-cursor', 'cur-link', 'cur-view');
  });
})();

/* ── 阅读进度条 ── */
(function () {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = Math.min(
      h.scrollTop / (h.scrollHeight - h.clientHeight) * 100, 100
    ) + '%';
  }, { passive: true });
})();

/* ── Header 边线 + 导航高亮 ── */
(function () {
  const header    = document.getElementById('header');
  const navLinks  = document.querySelectorAll('.nav a');
  const sections  = document.querySelectorAll('section[id]');

  function update() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 160) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── 滚动渐显 ── */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ── 数字跳动计数器 ── */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur    = 1500;
      const start  = performance.now();
      io.unobserve(el);

      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = v + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      })(start);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
})();

/* ── 主题切换（View Transitions API — 圆形扩散） ── */
(function () {
  const btn  = document.getElementById('themeBtn');
  const html = document.documentElement;
  if (!btn) return;

  btn.addEventListener('click', e => {
    const isDark = html.dataset.theme === 'dark';
    const x = e.clientX, y = e.clientY;
    const r = Math.hypot(
      Math.max(x, innerWidth  - x),
      Math.max(y, innerHeight - y)
    );

    if (!document.startViewTransition) {
      html.dataset.theme = isDark ? 'light' : 'dark';
      return;
    }

    document.startViewTransition(() => {
      html.dataset.theme = isDark ? 'light' : 'dark';
    }).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });
})();

/* ── 3D Tilt（作品卡 + 照片区） ── */
(function () {
  const TILT = 12; // 最大倾斜角度（度）

  function attach(el) {
    /* 卡片：变换作用在 .card-tilt-inner；照片：变换作用在 el 自身 */
    const target = el.querySelector('.card-tilt-inner') || el;
    const shine  = el.querySelector('.card-shine, .photo-shine');

    el.addEventListener('mouseenter', () => {
      target.style.transition = 'box-shadow .3s, border-color .3s';
    });

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      const rX = ((y - cy) / cy) * -TILT;
      const rY = ((x - cx) / cx) *  TILT;

      target.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(1.03,1.03,1.03)`;

      if (shine) {
        const px = (x / r.width)  * 100;
        const py = (y / r.height) * 100;
        shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.18), transparent 65%)`;
      }
    });

    el.addEventListener('mouseleave', () => {
      target.style.transition = 'transform .55s cubic-bezier(0.19,1,0.22,1), box-shadow .3s, border-color .3s';
      target.style.transform  = '';
      if (shine) shine.style.background = '';
    });
  }

  /* 照片 */
  const photoTilt = document.getElementById('photoTilt');
  if (photoTilt) attach(photoTilt);

  /* 作品卡片 */
  document.querySelectorAll('.project-card').forEach(attach);
})();
