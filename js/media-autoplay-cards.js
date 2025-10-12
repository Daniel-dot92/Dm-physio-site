// /js/media-autoplay-cards.js
// Карти със снимка + видео, които се пускат при скрол (mobile) и на hover (desktop).
// Ключова промяна: IntersectionObserver наблюдава КОНТЕЙНЕРА (не самото <video>),
// за да работи и когато видеото е временно "скрито" с visibility:hidden.

(function () {
  'use strict';

  /* =========================
     Конфигурация на селектори
  ========================= */
  const BOX_SELECTORS = [
    '.card__media',
    '.pain-button-media',
    '.journey-image',
    '.image-container',
    // вложени варианти
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

  // Някои iOS устройства лъжат media queries → форсираме mobile поведение при iOS.
  const isiOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const MOBILE_QUERY = '(hover: none), (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isTouchLike = isiOS() ? true : mql.matches;

  /* =========================
     Инжектирани CSS override-и
  ========================= */
  (function injectStyle() {
    const ID = 'media-autoplay-cards-overrides';
    if (document.getElementById(ID)) return;
    const css = `
/* По подразбиране: снимка видима, видео скрито */
.image-container .static-img,
.pain-button-media .static-img,
.card__media .static { opacity:1; transition:opacity .25s ease; }
.image-container .hover-img,
.pain-button-media .hover-img,
.card__media .hover { opacity:0; visibility:hidden; transition:opacity .25s ease; }

/* Докато НЕ е .video-ready — дръж видеото скрито */
.image-container:not(.video-ready) .hover-img,
.pain-button-media:not(.video-ready) .hover-img,
.card__media:not(.video-ready) .hover { opacity:0!important; visibility:hidden!important; }

/* Когато пускаме видеото — показваме видеото, скриваме снимката */
.image-container.is-playing .static-img,
.pain-button-media.is-playing .static-img,
.card__media.is-playing .static { opacity:0!important; }
.image-container.is-playing .hover-img,
.pain-button-media.is-playing .hover-img,
.card__media.is-playing .hover { opacity:1!important; visibility:visible!important; }

/* Desktop hover swap */
@media (hover:hover) and (pointer:fine){
  .image-container.video-ready:hover .static-img,
  .pain-button-media.video-ready:hover .static-img,
  .card__media.video-ready:hover .static { opacity:0!important; }
  .image-container.video-ready:hover .hover-img,
  .pain-button-media.video-ready:hover .hover-img,
  .card__media.video-ready:hover .hover { opacity:1!important; visibility:visible!important; }
}

/* На мобилно игнорираме hover — JS управлява показването */
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
     Помощни функции
  ========================= */
  function qsOneOf(selectors, root){
    for (let i=0; i<selectors.length; i++){
      const el = (root || document).querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  function getMediaPair(box){
    const staticImg = qsOneOf(IMG_SELECTORS, box);
    const video     = qsOneOf(VIDEO_SELECTORS, box);
    return { staticImg, video };
  }

  function markReady(box){ box.classList.add('video-ready'); }
  function showVideo(box){ box.classList.add('is-playing'); }
  function hideVideo(box){ box.classList.remove('is-playing'); }

  // Подготовка на видеото (изисквания за мобилно/iOS)
  function prepVideo(v, posterFallback){
    if (!v) return;
    v.removeAttribute('autoplay');
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if (!v.getAttribute('preload')) v.preload = 'metadata';
    if (!v.getAttribute('poster') && posterFallback) v.setAttribute('poster', posterFallback);
    try { v.load(); } catch(e){}
  }

  // Ако readyState >= 2 → play, иначе изчакай first frame
  function safePlay(v){
    if (!v) return;
    const doPlay = () => v.play().catch(()=>{}); // игнорирай AbortError
    if (v.readyState >= 2) doPlay();
    else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once:true });
      try { v.load(); } catch(e){}
    }
  }

  // Диагностика за „непускаем“ клип (напр. неподдържан кодек)
  function detectUnplayable(v, timeoutMs = 2200){
    return new Promise((resolve)=>{
      let done = false;
      const finish = (ok, reason) => { if (done) return; done = true; resolve({ ok, reason }); };

      if (v.error && v.error.code) return finish(false, 'media-error-'+v.error.code);

      const onLoaded = () => finish(true, 'loadeddata');
      const onError  = () => finish(false, 'error-event');
      v.addEventListener('loadeddata', onLoaded, { once:true });
      v.addEventListener('error', onError, { once:true });

      const t = setTimeout(() => {
        v.removeEventListener('loadeddata', onLoaded);
        v.removeEventListener('error', onError);
        if (v.readyState === 0) finish(false, 'timeout-rs0'); else finish(true, 'timeout-rs>0');
      }, timeoutMs);

      // леко „подканване“
      try { v.play()?.then(()=>{ try{ v.pause(); }catch(e){} }).catch(()=>{}); } catch(e){}
    });
  }

  /* =========================
     IO – наблюдава КОНТЕЙНЕРА
  ========================= */
  let io = null;
  function buildIO(){
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        const box = entry.target;
        const v = box.__video;
        if (!v) return;

        clearTimeout(box.__ioT);
        box.__ioT = setTimeout(()=>{
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2){
            // показваме видеото (сменяме класовете) и го пускаме
            markReady(box);
            showVideo(box);
            safePlay(v);
          } else {
            hideVideo(box);
            try {
              v.pause();
              if (!v.classList.contains('no-reset-on-exit')) v.currentTime = 0;
            } catch(e){}
          }
        }, isiOS() ? 160 : 100); // малък debounce, особено за iOS
      });
    }, { root:null, rootMargin:'300px 0px', threshold:[0,0.2,0.35,0.5,0.75,1] });
  }

  /* =========================
     Връзване на един контейнер
  ========================= */
  async function wireBox(box){
    const { staticImg, video } = getMediaPair(box);
    if (!video || !staticImg) return;

    // Подготовка
    prepVideo(video, (staticImg.currentSrc || staticImg.src || ''));

    // Ако клипът е неподдържан → остави само снимка (graceful)
    const diag = await detectUnplayable(video, 2200);
    if (!diag.ok){
      box.classList.remove('video-ready', 'is-playing');
      return;
    }

    // когато имаме кадър → позволяваме hover/автоплей
    if (video.readyState >= 2) markReady(box);
    else {
      const onReady = () => markReady(box);
      video.addEventListener('loadeddata', onReady, { once:true });
      video.addEventListener('canplay', onReady, { once:true });
    }

    // Desktop hover
    box.addEventListener('mouseenter', ()=>{
      if (isTouchLike) return;
      if (!box.classList.contains('video-ready')) return;
      showVideo(box);
      safePlay(video);
    }, { passive:true });

    box.addEventListener('mouseleave', ()=>{
      if (isTouchLike) return;
      hideVideo(box);
      try { video.pause(); video.currentTime = 0; } catch(e){}
    }, { passive:true });

    // Mobile — IO наблюдава КОНТЕЙНЕРА
    if (isTouchLike){
      if (!io) io = buildIO();
      if (io){
        box.__video = video;
        io.observe(box);
      }
    }
  }

  /* =========================
     Връзване на всички
  ========================= */
  function wireAll(){
    document.querySelectorAll(BOX_SELECTORS).forEach((box)=>{
      if (box.__wiredMediaAutoplay) return;
      box.__wiredMediaAutoplay = true;
      wireBox(box);
    });
  }

  function reconfigure(){
    isTouchLike = isiOS() ? true : mql.matches;
    if (io){ try{ io.disconnect(); }catch(e){} }
    io = null;
    if (isTouchLike) io = buildIO();
    document.querySelectorAll(BOX_SELECTORS).forEach((box)=>{
      const v = qsOneOf(VIDEO_SELECTORS, box);
      if (!v || !io) return;
      box.__video = v;
      io.observe(box);
    });
  }

  /* =========================
     Старт
  ========================= */
  document.addEventListener('DOMContentLoaded', ()=>{
    wireAll();

    // Следене за динамично добавени елементи
    const mo = new MutationObserver((muts)=>{
      for (const m of muts){
        if (m.addedNodes && m.addedNodes.length){ wireAll(); break; }
      }
    });
    mo.observe(document.body, { childList:true, subtree:true });

    if (mql.addEventListener) mql.addEventListener('change', reconfigure);
    else if (mql.addListener) mql.addListener(reconfigure);

    window.addEventListener('resize', reconfigure, { passive:true });

    // Когато табът стане скрит — спираме всички
    document.addEventListener('visibilitychange', ()=>{
      if (document.hidden){
        document.querySelectorAll(BOX_SELECTORS).forEach((box)=>{
          const v = qsOneOf(VIDEO_SELECTORS, box);
          if (!v) return;
          hideVideo(box);
          try { v.pause(); } catch(e){}
        });
      }
    });
  });
})();
