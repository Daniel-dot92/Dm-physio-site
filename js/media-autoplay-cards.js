/* /js/media-autoplay-cards.js
 * Mobile (touch): autoplay when in viewport; pause+reset when out
 * Desktop: play on hover; pause+reset on leave
 * Shows video only when ready; supports <source data-src="...">
 */
(function () {
  const IS_TOUCH =
    typeof matchMedia === 'function' &&
    matchMedia('(hover: none) and (pointer: coarse)').matches;

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Таргетираме всички .image-container (вкл. .pain-button-media.image-container)
  const cards = $$('.image-container').map(box => {
    const img = $('.static-img', box);
    const vid = $('video.hover-img', box);
    return (img && vid) ? { box, img, vid, ready:false } : null;
  }).filter(Boolean);

  if (!cards.length) return;

  // ---------- helpers ----------
  function primeVideo(v) {
    v.muted = true; v.defaultMuted = true;
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if (!v.preload) v.preload = 'metadata';
  }
  function ensureSrc(v) {
    if (v.currentSrc) return;
    const s = $('source[data-src]', v);
    if (s && !s.src) { s.src = s.dataset.src; try { v.load(); } catch {} }
  }
  function afterReady(v, cb){
    if (v.readyState >= 2) { cb(); return; }
    const on = () => { v.removeEventListener('loadeddata', on); cb(); };
    v.addEventListener('loadeddata', on, { once:true });
    try { v.load(); } catch {}
  }
  const safePlay  = v => { afterReady(v, () => v.play().catch(()=>{})); };
  const safePause = v => { try{ v.pause(); }catch{} };
  const reset     = v => { try{ v.currentTime = 0; }catch{} };

  function showVideo(m) {
    ensureSrc(m.vid);
    afterReady(m.vid, () => {
      m.ready = true;
      m.box.classList.add('video-ready');
      m.vid.style.opacity = '1';
      m.img.style.opacity = '0';
      safePlay(m.vid);
      m.box.dataset.playing = '1';
    });
  }
  function hideVideo(m) {
    safePause(m.vid); reset(m.vid);
    m.vid.style.opacity = '0';
    m.img.style.opacity = '1';
    delete m.box.dataset.playing;
  }

  // ---------- init inline styles ----------
  cards.forEach(m => {
    const { box, img, vid } = m;
    primeVideo(vid);

    const cs = getComputedStyle(box);
    if (cs.position === 'static') box.style.position = 'relative';
    if (cs.overflow === 'visible') box.style.overflow = 'hidden';

    // слоеве
    [img, vid].forEach(el => {
      el.style.position = 'absolute';
      el.style.inset = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.objectFit = 'cover';
      if (!el.style.transition) el.style.transition = 'opacity .28s ease';
    });

    // стартово състояние
    vid.style.opacity = '0';
    img.style.opacity = '1';
  });

  // ---------- desktop: hover поведение ----------
  if (!IS_TOUCH) {
    cards.forEach(m => {
      m.box.addEventListener('mouseenter', () => showVideo(m), { passive:true });
      m.box.addEventListener('mouseleave', () => hideVideo(m), { passive:true });
    });
  }

  // ---------- intersection observer ----------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        const m = cards.find(x => x.box === en.target);
        if (!m) return;

        // Мобилно: autoplay в изглед; Десктоп: само предотвратяваме да играе offscreen
        if (IS_TOUCH) {
          if (en.isIntersecting && en.intersectionRatio >= 0.6) {
            // пускаме само ако още не играе
            if (!m.box.dataset.playing) showVideo(m);
          } else {
            hideVideo(m);
          }
        } else {
          // десктоп: ако картата излезе от изглед – спри/ресетни (safety net)
          if (!en.isIntersecting || en.intersectionRatio < 0.1) {
            hideVideo(m);
          } else {
            // само подсигуряваме src за по-бърз hover
            ensureSrc(m.vid);
          }
        }
      });
    }, { rootMargin: '200px 0px', threshold: [0, 0.1, 0.6, 1] });

    cards.forEach(m => io.observe(m.box));
  } else if (IS_TOUCH) {
    // без IO на мобилно: минимален фолбек – пусни при load, спри при blur/visibility
    cards.forEach(showVideo);
  }

  // таб/прозорец неактивен → стоп
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cards.forEach(hideVideo);
  }, { passive:true });
})();
