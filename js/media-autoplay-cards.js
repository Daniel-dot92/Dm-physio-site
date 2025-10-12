/* /js/media-autoplay-cards.js — iOS-safe
 * Mobile (touch/iOS): autoplay в полезрението; pause+reset извън
 * Desktop: play при hover; stop при leave и извън полезрението
 * Lazy src: предпочитаме video.src вместо <source> за iOS
 */
(function () {
  const UA = navigator.userAgent || '';
  const IS_IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const IS_TOUCH =
    typeof matchMedia === 'function' &&
    matchMedia('(hover: none) and (pointer: coarse)').matches;

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Намираме всички контейнери .image-container (вкл. .pain-button-media.image-container)
  const cards = $$('.image-container').map(box => {
    const img = $('.static-img', box);
    const vid = $('video.hover-img', box);
    return (img && vid) ? { box, img, vid, ready:false, hydrated:false } : null;
  }).filter(Boolean);

  if (!cards.length) return;

  // ---------- helpers ----------
  function primeVideo(v, forAutoplay) {
    // iOS изисква тези да са set като атрибути ПРЕДИ да сложим src
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if (forAutoplay) v.setAttribute('autoplay',''); // само на мобилно
    // metadata стига (намалява трафик)
    if (!v.preload) v.preload = 'metadata';
  }

  function ensureSrc(m){
    if (m.hydrated) return;
    const v = m.vid;

    // 1) ако има директно data-src на самото <video>
    const directData = v.getAttribute('data-src');
    // 2) ако има <source data-src>
    const s = $('source[data-src]', v);

    if (directData) {
      v.src = directData;
    } else if (s && s.dataset.src) {
      // iOS често игнорира <source> след .load(); подай директно на video.src
      // (ще премахнем <source>, за да няма конфликт)
      v.src = s.dataset.src;
      try { s.remove(); } catch {}
    } else {
      // има ли вече валиден src?
      if (v.currentSrc || v.src) { m.hydrated = true; return; }
    }

    try { v.load(); } catch {}
    m.hydrated = true;
  }

  function afterReady(v, cb){
    if (v.readyState >= 2) { cb(); return; }
    const on = () => { v.removeEventListener('loadeddata', on); cb(); };
    v.addEventListener('loadeddata', on, { once:true });
    // Safari понякога не trigger-ва без load()
    try { v.load(); } catch {}
  }

  // iOS понякога връща rejected play() дори при muted.
  // Ще пробваме няколко пъти кратко и ще заглушим грешките.
  function tryPlay(v, attempts = 2){
    const go = () => v.play().catch(()=>{ if (attempts>0) setTimeout(()=>tryPlay(v, attempts-1), 80); });
    // microtask/raf помага на WebKit
    if ('requestAnimationFrame' in window) requestAnimationFrame(go); else setTimeout(go, 0);
  }

  function safePlay(m){
    const v = m.vid;
    afterReady(v, () => tryPlay(v));
  }
  const safePause = v => { try{ v.pause(); }catch{} };
  const reset     = v => { try{ v.currentTime = 0; }catch{} };

  function showVideo(m) {
    ensureSrc(m);
    afterReady(m.vid, () => {
      m.ready = true;
      m.box.classList.add('video-ready');
      m.vid.style.opacity = '1';
      m.img.style.opacity = '0';
      safePlay(m);
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

    primeVideo(vid, IS_TOUCH); // на мобилно добавяме и autoplay атрибут

    const cs = getComputedStyle(box);
    if (cs.position === 'static') box.style.position = 'relative';
    if (cs.overflow === 'visible') box.style.overflow = 'hidden';

    // подреждаме слоевете
    img.style.position = 'absolute';
    img.style.inset = '0';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    vid.style.position = 'absolute';
    vid.style.inset = '0';
    vid.style.width = '100%';
    vid.style.height = '100%';
    vid.style.objectFit = 'cover';

    if (!vid.style.transition) vid.style.transition = 'opacity .28s ease';
    if (!img.style.transition) img.style.transition = 'opacity .28s ease';

    // стартово състояние
    vid.style.opacity = '0';
    img.style.opacity = '1';

    // iOS оптимизация: предварително закачаме loadeddata, за да flip-нем веднага щом стане ready
    vid.addEventListener('loadeddata', () => { m.ready = true; m.box.classList.add('video-ready'); }, { once:false });
  });

  // ---------- desktop: hover ----------
  if (!IS_TOUCH) {
    cards.forEach(m => {
      m.box.addEventListener('mouseenter', () => showVideo(m), { passive:true });
      m.box.addEventListener('mouseleave', () => hideVideo(m), { passive:true });
    });
  }

  // ---------- intersection observer ----------
  if ('IntersectionObserver' in window) {
    const thresholdPlay = IS_TOUCH ? (IS_IOS ? 0.6 : 0.5) : 0.1;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        const m = cards.find(x => x.box === en.target);
        if (!m) return;

        if (IS_TOUCH) {
          if (en.isIntersecting && en.intersectionRatio >= thresholdPlay) {
            if (!m.box.dataset.playing) showVideo(m);
          } else {
            hideVideo(m);
          }
        } else {
          // десктоп: safety net – не оставяме да играе offscreen
          if (!en.isIntersecting || en.intersectionRatio < 0.1) {
            hideVideo(m);
          } else {
            // за по-бърз hover
            ensureSrc(m);
          }
        }
      });
    }, { rootMargin: '200px 0px', threshold: [0, 0.1, 0.5, 0.6, 1] });

    cards.forEach(m => io.observe(m.box));
  } else if (IS_TOUCH) {
    // фолбек без IO: пусни след onload; спри при blur
    const onLoad = () => cards.forEach(showVideo);
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once:true });
  }

  // таб/прозорец неактивен → стоп
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cards.forEach(hideVideo);
  }, { passive:true });

  // iOS low-power/lock → спри
  window.addEventListener('pagehide', () => cards.forEach(hideVideo), { passive:true });
})();
