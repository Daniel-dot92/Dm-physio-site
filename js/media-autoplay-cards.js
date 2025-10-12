// /js/media-autoplay-cards.js
// Еднотипно поведение за всички карти/контейнери със снимка + видео:
// - Снимката стои, докато видеото не зареди (loadeddata) -> тогава контейнерът получава .video-ready
// - На десктоп: hover работи САМО ако .video-ready е наличен
// - На мобилно: с IntersectionObserver пуска/спира по видимост; hover се игнорира
// - Инжектира защитни CSS override-и, за да не „бутат“ стари стилове

(function(){
  'use strict';

  // ========== Конфигурируеми селектори ==========
  const HOVER_CONTAINERS = [
    '.card__media',
    '.pain-button-media',
    '.journey-image',
    '.image-container',

    // по-конкретни (ако имаш вложени решетки/списъци):
    '.pain-buttons-grid .pain-button-media',
    '.pain-buttons-vertical .pain-button-media',
    '.two-col__right .pain-buttons-vertical .pain-button-media',
    '#pain-conditions-intro .pain-buttons-grid .pain-button-media',
    '.pain-buttons-grid .image-container',
    '.pain-buttons-vertical .image-container',
    '.two-col__right .pain-buttons-vertical .image-container',
    '#pain-conditions-intro .pain-buttons-grid .image-container'
  ].join(',');

  // Кои елементи вътре да приемем за статично изображение и за видео:
  const IMG_SELECTORS   = ['.img--static', '.static-img', '.kinesitherapy-img', '.static-hernia-img', 'img'];
  const VIDEO_SELECTORS = [
    'video.img--hover', 'video.hover-img', 'video.hover-video',
    'video.hover-muscle-video', 'video.kinesitherapy-video',
    'video.hover-hernia-video', 'video'
  ];

  // ========== Състояние и media queries ==========
  const MOBILE_QUERY = '(hover: none), (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isTouchLike = mql.matches;

  // ========== Инжектиране на защитни CSS (override-и) ==========
  (function injectStyle(){
    const STYLE_ID = 'media-autoplay-cards-overrides';
    if (document.getElementById(STYLE_ID)) return;

    const css = `
/* --- media-autoplay-cards overrides --- */

/* По подразбиране: снимка видима, видео скрито */
.image-container .static-img,
.pain-button-media .static-img,
.card__media .static { opacity: 1; transition: opacity .25s ease; }
.image-container .hover-img,
.pain-button-media .hover-img,
.card__media .hover { opacity: 0; visibility: hidden; transition: opacity .25s ease; }

/* Докато НЕ е .video-ready — насила дръж видеото невидимо (покрива стари hover правила) */
.image-container:not(.video-ready) .hover-img,
.pain-button-media:not(.video-ready) .hover-img,
.card__media:not(.video-ready) .hover {
  opacity: 0 !important;
  visibility: hidden !important;
}

/* Когато реално пускаме видеото (is-playing) — показваме видеото, скриваме снимката */
.image-container.is-playing .static-img,
.pain-button-media.is-playing .static-img,
.card__media.is-playing .static { opacity: 0 !important; }
.image-container.is-playing .hover-img,
.pain-button-media.is-playing .hover-img,
.card__media.is-playing .hover { opacity: 1 !important; visibility: visible !important; }

/* На десктоп hover може да сменя САМО ако контейнерът е video-ready */
@media (hover:hover) and (pointer:fine){
  .image-container.video-ready:hover .static-img,
  .pain-button-media.video-ready:hover .static-img,
  .card__media.video-ready:hover .static { opacity: 0 !important; }

  .image-container.video-ready:hover .hover-img,
  .pain-button-media.video-ready:hover .hover-img,
  .card__media.video-ready:hover .hover { opacity: 1 !important; visibility: visible !important; }
}

/* На мобилно игнорирай hover напълно – JS управлява показването */
@media (hover:none){
  .image-container.video-ready:hover .static-img,
  .pain-button-media.video-ready:hover .static-img,
  .card__media.video-ready:hover .static { opacity: 1 !important; }
  .image-container.video-ready:hover .hover-img,
  .pain-button-media.video-ready:hover .hover-img,
  .card__media.video-ready:hover .hover { opacity: 0 !important; visibility: hidden !important; }
}
`;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  })();

  // ========== Помощни функции ==========
  function qsOneOf(selectors, root){
    for (let i=0; i<selectors.length; i++){
      const el = (root || document).querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  function getMediaPair(container){
    const staticImg = qsOneOf(IMG_SELECTORS,   container);
    const video     = qsOneOf(VIDEO_SELECTORS, container);
    return { staticImg, video };
  }

  // Подготовка за безопасен autoplay на мобилно/iOS
  function prepVideo(v, posterFallback){
    if (!v) return;
    v.removeAttribute('autoplay');
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if (!v.getAttribute('preload')) v.preload = 'metadata';
    if (!v.getAttribute('poster') && posterFallback) v.setAttribute('poster', posterFallback);
    try { v.load(); } catch(e){}
  }

  function safePlay(v){
    if (!v) return;
    const doPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) doPlay();
    else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once: true });
      try { v.load(); } catch(e){}
    }
  }

  function markReady(box){ box.classList.add('video-ready'); }
  function showVideo(box){ box.classList.add('is-playing'); }
  function hideVideo(box){ box.classList.remove('is-playing'); }

  // ========== IntersectionObserver за мобилно ==========
  let io = null;
  function buildIO(){
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        const box = v.__box;
        if (!box) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.35){
          if (box.classList.contains('video-ready')){
            showVideo(box);
            safePlay(v);
          }
        } else {
          hideVideo(box);
          try {
            v.pause();
            if (!v.classList.contains('no-reset-on-exit')) v.currentTime = 0;
          } catch(e){}
        }
      });
    }, {
      root: null,
      rootMargin: '200px 0px',
      threshold: [0, 0.2, 0.35, 0.5, 0.75, 1]
    });
  }

  // ========== Връзване на един контейнер ==========
  function wireContainer(container){
    const { staticImg, video } = getMediaPair(container);
    if (!video || !staticImg) return;

    // Подготовка за iOS/Android
    prepVideo(video, (staticImg.currentSrc || staticImg.src || ''));

    // Когато видеото е готово за първи кадър -> позволяваме hover/автоплей
    if (video.readyState >= 2) markReady(container);
    else {
      const onReady = () => markReady(container);
      video.addEventListener('loadeddata', onReady, { once:true });
      video.addEventListener('canplay',     onReady, { once:true });
    }

    // ДЕСKTOP HOVER — САМО СЛЕД video-ready
    container.addEventListener('mouseenter', () => {
      if (isTouchLike) return;
      if (!container.classList.contains('video-ready')) return;
      showVideo(container);
      safePlay(video);
    }, { passive:true });

    container.addEventListener('mouseleave', () => {
      if (isTouchLike) return;
      hideVideo(container);
      try {
        video.pause();
        video.currentTime = 0;
      } catch(e){}
    }, { passive:true });

    // МОБИЛНО — IO по видимост
    if (isTouchLike){
      if (!io) io = buildIO();
      if (io){
        video.__box = container;
        io.observe(video);
      }
    }
  }

  // ========== Връзване на всички налични контейнери ==========
  function wireAll(){
    document.querySelectorAll(HOVER_CONTAINERS).forEach((c) => {
      if (c.__wiredMediaAutoplay) return;
      c.__wiredMediaAutoplay = true;
      wireContainer(c);
    });
  }

  // ========== Ре-конфигуриране при смяна на устройство/ориентация ==========
  function reconfigure(){
    isTouchLike = mql.matches;

    // Разкачи предишния IO и създай нов при нужда
    if (io){ try { io.disconnect(); } catch(e){} }
    io = null;
    if (isTouchLike) io = buildIO();

    // Пре-наблюдавай видеата
    document.querySelectorAll(HOVER_CONTAINERS).forEach((box) => {
      const v = box.querySelector('video');
      if (!v) return;
      if (io){
        v.__box = box;
        io.observe(v);
      }
    });
  }

  // ========== Стартиране ==========
  document.addEventListener('DOMContentLoaded', () => {
    wireAll();

    // Следи за динамично добавени елементи (SPA/добавяне на карти)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations){
        if (m.addedNodes && m.addedNodes.length){ wireAll(); break; }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Реакция при смяна на media query
    if (mql.addEventListener) mql.addEventListener('change', reconfigure);
    else if (mql.addListener) mql.addListener(reconfigure);

    // Пре-конфигурирай и при resize (предпазно)
    window.addEventListener('resize', reconfigure, { passive: true });

    // Когато табът стане скрит — спри всички видеа
    document.addEventListener('visibilitychange', () => {
      if (document.hidden){
        document.querySelectorAll(HOVER_CONTAINERS).forEach((box) => {
          const v = box.querySelector('video');
          if (!v) return;
          hideVideo(box);
          try { v.pause(); } catch(e){}
        });
      }
    });
  });
})();
