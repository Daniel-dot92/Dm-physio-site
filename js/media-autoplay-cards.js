// /js/media-autoplay-cards.js
(function () {
  'use strict';

  /* ========== селектори ========== */
  const BOX_SELECTORS = [
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

  /* ========== детекция на iOS/мобилно ========== */
  const isiOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const MOBILE_QUERY = '(hover: none), (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isTouchLike = isiOS() ? true : mql.matches;

  /* ========== CSS overrides (видимост) ========== */
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
}`;
    const style = document.createElement('style');
    style.id = ID;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  })();

  /* ========== помощни ========= */
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

  function prepVideo(v, posterFallback){
    if (!v) return;

    // iOS: присвояваме директно src от <source>, преди каквото и да е.
    const firstSrcEl = v.querySelector('source');
    if (isiOS() && firstSrcEl && !v.src) {
      // избягваме "blob:" и странни относителни пътеки
      try { v.src = firstSrcEl.src || firstSrcEl.getAttribute('src') || ''; } catch(e){}
    }

    // атрибути за autoplay
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    v.setAttribute('x-webkit-airplay','deny');

    // iOS – preload=auto, иначе Safari понякога не качва данни за невидими елементи
    if (isiOS()) v.preload = 'auto';
    else if (!v.getAttribute('preload')) v.preload = 'metadata';

    if (!v.getAttribute('poster') && posterFallback) v.setAttribute('poster', posterFallback);

    // „събуди“ плеъра
    try { v.load(); } catch(e){}
  }

  function safePlay(v){
    if (!v) return;
    const doPlay = () => v.play().catch(()=>{}); // игнорираме AbortError
    if (isiOS()) {
      // На iOS не чакай loadeddata – пускай веднага (visibility ще се смени от нас)
      doPlay();
      return;
    }
    if (v.readyState >= 2) doPlay();
    else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once:true });
      try { v.load(); } catch(e){}
    }
  }

  /* ========== IntersectionObserver върху КОНТЕЙНЕРА ========== */
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
            // показваме и пускаме без да чакаме кадър (особено на iOS)
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
        }, isiOS() ? 160 : 80);
      });
    }, { root:null, rootMargin:'300px 0px', threshold:[0,0.2,0.35,0.5,0.75,1] });
  }

  /* ========== връзване на един бокс ========== */
  function wireBox(box){
    const { staticImg, video } = getMediaPair(box);
    if (!video || !staticImg) return;

    prepVideo(video, (staticImg.currentSrc || staticImg.src || ''));

    // earliest ready – при метаданни
    const onMeta = () => markReady(box);
    video.addEventListener('loadedmetadata', onMeta, { once:true });
    if (video.readyState >= 1) markReady(box);

    // Desktop hover
    box.addEventListener('mouseenter', ()=>{
      if (isTouchLike) return;
      showVideo(box);
      safePlay(video);
    }, { passive:true });

    box.addEventListener('mouseleave', ()=>{
      if (isTouchLike) return;
      hideVideo(box);
      try { video.pause(); video.currentTime = 0; } catch(e){}
    }, { passive:true });

    // Mobile — наблюдаваме контейнера
    if (isTouchLike){
      if (!io) io = buildIO();
      if (io){
        box.__video = video;
        io.observe(box);
      }
    }
  }

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

  /* ========== старт ========== */
  document.addEventListener('DOMContentLoaded', ()=>{
    wireAll();

    // iOS „събуждане“ на всички видеа – някои версии не инициализират <source>, докато не извикаш load() след рендер.
    if (isiOS()){
      requestAnimationFrame(()=>{
        document.querySelectorAll('video').forEach(v=>{
          try { v.load(); } catch(e){}
        });
      });
    }

    // динамично добавени елементи
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
