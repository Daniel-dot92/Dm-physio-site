// /js/media-autoplay-cards.js
// Унифицирано поведение за карти със снимка + видео.
// * Desktop: hover swap след .video-ready
// * Mobile (iOS/Android): autoplay/stop по видимост чрез IO
// * iOS: warm-up + debounce, заглушаване на безобидни AbortError
// * Диагностика: ако източникът е неподдържан (codec) => graceful fallback към снимка

(function () {
  'use strict';

  /* =========================
     Селектори за контейнерите
  ========================= */
  const HOVER_CONTAINERS = [
    '.card__media',
    '.pain-button-media',
    '.journey-image',
    '.image-container',
    '.pain-buttons-grid .pain-button-media',
    '.pain-buttons-vertical .pain-button-media',
    '.two-col__right .pain-buttons-vertical .pain-button-media',
    '#pain-conditions-intro .pain-buttons-grid .pain-button-media',
    '.pain-buttons-grid .image-container',
    '.pain-buttons-vertical .image-container',
    '.two-col__right .pain-buttons-vertical .image-container',
    '#pain-conditions-intro .pain-buttons-grid .image-container'
  ].join(',');

  const IMG_SELECTORS   = ['.img--static', '.static-img', '.kinesitherapy-img', '.static-hernia-img', 'img'];
  const VIDEO_SELECTORS = [
    'video.img--hover', 'video.hover-img', 'video.hover-video',
    'video.hover-muscle-video', 'video.kinesitherapy-video',
    'video.hover-hernia-video', 'video'
  ];

  const MOBILE_QUERY = '(hover: none), (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isTouchLike = mql.matches;

  const isiOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* =========================
     Инжектирани override-и
  ========================= */
  (function injectStyle() {
    const ID = 'media-autoplay-cards-overrides';
    if (document.getElementById(ID)) return;
    const css = `
.image-container .static-img,
.pain-button-media .static-img,
.card__media .static { opacity:1; transition:opacity .25s ease; }
.image-container .hover-img,
.pain-button-media .hover-img,
.card__media .hover { opacity:0; visibility:hidden; transition:opacity .25s ease; }

.image-container:not(.video-ready) .hover-img,
.pain-button-media:not(.video-ready) .hover-img,
.card__media:not(.video-ready) .hover { opacity:0!important; visibility:hidden!important; }

.image-container.is-playing .static-img,
.pain-button-media.is-playing .static-img,
.card__media.is-playing .static { opacity:0!important; }
.image-container.is-playing .hover-img,
.pain-button-media.is-playing .hover-img,
.card__media.is-playing .hover { opacity:1!important; visibility:visible!important; }

@media (hover:hover) and (pointer:fine){
  .image-container.video-ready:hover .static-img,
  .pain-button-media.video-ready:hover .static-img,
  .card__media.video-ready:hover .static { opacity:0!important; }
  .image-container.video-ready:hover .hover-img,
  .pain-button-media.video-ready:hover .hover-img,
  .card__media.video-ready:hover .hover { opacity:1!important; visibility:visible!important; }
}

@media (hover:none){
  .image-container.video-ready:hover .static-img,
  .pain-button-media.video-ready:hover .static-img,
  .card__media.video-ready:hover .static { opacity:1!important; }
  .image-container.video-ready:hover .hover-img,
  .pain-button-media.video-ready:hover .hover-img,
  .card__media.video-ready:hover .hover { opacity:0!important; visibility:hidden!important; }
}
`;
    const style = document.createElement('style');
    style.id = ID;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  })();

  /* =========================
     Помощни
  ========================= */
  const log = (...a)=>console.debug('[media-autoplay]', ...a);

  function qsOneOf(selectors, root) {
    for (let i = 0; i < selectors.length; i++) {
      const el = (root || document).querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  function getMediaPair(container) {
    const staticImg = qsOneOf(IMG_SELECTORS, container);
    const video = qsOneOf(VIDEO_SELECTORS, container);
    return { staticImg, video };
  }

  function markReady(box){ box.classList.add('video-ready'); }
  function showVideo(box){ box.classList.add('is-playing'); }
  function hideVideo(box){ box.classList.remove('is-playing'); }

  // iOS warm-up и базова подготовка
  function prepVideo(v, posterFallback){
    if (!v) return;
    v.removeAttribute('autoplay');
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if (!v.getAttribute('preload')) v.preload = 'metadata';
    if (!v.getAttribute('poster') && posterFallback) v.setAttribute('poster', posterFallback);
    try { v.load(); } catch(e){}

    // iOS: кратко “затопляне”, за да позволи по-късно autoplay
    if (isiOS()) {
      try {
        const p = v.play();
        if (p && p.then) p.then(()=>{ try{ v.pause(); v.currentTime = 0; }catch(e){} }).catch(()=>{});
      } catch(e){}
    }
  }

  // Диагностика: неподдържан източник/кодек или вечен readyState=0
  function detectUnplayable(v, timeoutMs = 2500){
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok, reason) => { if (done) return; done = true; resolve({ ok, reason }); };

      // Ако веднага има грешка
      if (v.error && v.error.code) {
        return finish(false, 'media-error-'+v.error.code);
      }

      const onLoaded = () => finish(true, 'loadeddata');
      const onError  = () => finish(false, 'error-event');

      v.addEventListener('loadeddata', onLoaded, { once:true });
      v.addEventListener('error', onError, { once:true });

      // ако нищо не се случи в разумен срок -> вероятно неподдържан кодек/формат
      const t = setTimeout(() => {
        v.removeEventListener('loadeddata', onLoaded);
        v.removeEventListener('error', onError);
        if (v.readyState === 0) finish(false, 'timeout-rs0'); else finish(true, 'timeout-but-rs>0');
      }, timeoutMs);

      // safety: ако все пак тръгне play()
      const p = v.play?.();
      if (p && p.then) {
        p.then(() => { try{ v.pause(); }catch(e){} }).catch(()=>{});
      }
    });
  }

  function safePlay(v){
    if (!v) return;
    if (v.__wantPlay) return;
    v.__wantPlay = true;

    const doPlay = () =>
      v.play().catch(()=>{}).finally(()=>{ v.__wantPlay = false; });

    if (v.readyState >= 2) {
      doPlay();
    } else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once:true });

      // ако не зарежда, подтикни го
      if (v.networkState !== HTMLMediaElement.NETWORK_LOADING) {
        try { v.load(); } catch(e){}
      }
    }
  }

  /* =========================
     IO (с debounce) за mobile
  ========================= */
  let io = null;
  function buildIO(){
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        const v = entry.target;
        const box = v.__box;
        if (!box) return;

        clearTimeout(v.__ioT);
        v.__ioT = setTimeout(()=>{
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            markReady(box);      // позволи swap, дори ако клонирано правило е скрило видеото
            showVideo(box);
            safePlay(v);
          } else {
            hideVideo(box);
            try {
              v.pause();
              if (!v.classList.contains('no-reset-on-exit')) v.currentTime = 0;
            } catch(e){}
          }
        }, 120);
      });
    }, { root:null, rootMargin:'300px 0px', threshold:[0,0.2,0.35,0.5,0.75,1] });
  }

  /* =========================
     Свързване на един контейнер
  ========================= */
  async function wireContainer(container){
    const { staticImg, video } = getMediaPair(container);
    if (!video || !staticImg) return;

    prepVideo(video, (staticImg.currentSrc || staticImg.src || ''));

    // Диагностика за непускаеми клипове (на iOS особено важно)
    const diag = await detectUnplayable(video, 2200);
    if (!diag.ok) {
      // Оставяме снимката и не опитваме autoplay; пишем в конзолата защо
      log('Видео е неподдържано или не тръгва:', diag.reason, video.currentSrc || video.src);
      container.classList.remove('video-ready', 'is-playing');
      // не закачаме hover / IO
      return;
    }

    // Ако имаме кадър — позволяваме hover/автоплей
    if (video.readyState >= 2) markReady(container);
    else {
      const onReady = () => markReady(container);
      video.addEventListener('loadeddata', onReady, { once:true });
      video.addEventListener('canplay', onReady, { once:true });
    }

    // Desktop hover
    container.addEventListener('mouseenter', ()=>{
      if (isTouchLike) return;
      if (!container.classList.contains('video-ready')) return;
      showVideo(container);
      safePlay(video);
    }, { passive:true });

    container.addEventListener('mouseleave', ()=>{
      if (isTouchLike) return;
      hideVideo(container);
      try { video.pause(); video.currentTime = 0; } catch(e){}
    }, { passive:true });

    // Mobile — IO
    if (isTouchLike){
      if (!io) io = buildIO();
      if (io){
        video.__box = container;
        io.observe(video);
      }
    }
  }

  /* =========================
     Свързване на всички
  ========================= */
  function wireAll(){
    document.querySelectorAll(HOVER_CONTAINERS).forEach((c)=>{
      if (c.__wiredMediaAutoplay) return;
      c.__wiredMediaAutoplay = true;
      // без await в цикъл – не блокираме UI
      wireContainer(c);
    });
  }

  function reconfigure(){
    isTouchLike = mql.matches;
    if (io){ try{ io.disconnect(); }catch(e){} }
    io = null;
    if (isTouchLike) io = buildIO();
    document.querySelectorAll(HOVER_CONTAINERS).forEach((box)=>{
      const v = box.querySelector('video');
      if (!v) return;
      if (io){ v.__box = box; io.observe(v); }
    });
  }

  /* =========================
     Старт
  ========================= */
  document.addEventListener('DOMContentLoaded', ()=>{
    wireAll();

    const mo = new MutationObserver((muts)=>{
      for (const m of muts){
        if (m.addedNodes && m.addedNodes.length){ wireAll(); break; }
      }
    });
    mo.observe(document.body, { childList:true, subtree:true });

    if (mql.addEventListener) mql.addEventListener('change', reconfigure);
    else if (mql.addListener) mql.addListener(reconfigure);

    window.addEventListener('resize', reconfigure, { passive:true });

    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden){
        document.querySelectorAll(HOVER_CONTAINERS).forEach((box)=>{
          const v = box.querySelector('video'); if (!v) return;
          hideVideo(box); try{ v.pause(); }catch(e){}
        });
      }
    });
  });
})();
