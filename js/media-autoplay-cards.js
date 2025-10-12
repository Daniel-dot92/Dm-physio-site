// /js/media-autoplay-cards.js  (опростен, iOS-safe автоплей при видимост)
(function () {
  'use strict';

  // Кои контейнери да следим (и на тях вътре има <img> + <video>):
  const CONTAINERS = [
    '.image-container',
    '.pain-button-media',
    '.card__media'
  ].join(',');

  // безопасни play/pause обвивки
  const safePlay = v => v && v.play && v.play().catch(() => {});
  const safePause = v => v && v.pause && v.pause();

  // увери се, че видеото има нужните атрибути и постер от <img>, ако липсва
  function prepVideo(box) {
    const img = box.querySelector('img');
    const v   = box.querySelector('video');
    if (!v) return null;

    // задължителни за iOS автоплей
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    v.loop = true;

    // лека заявка, за да имаме loadeddata без да дърпаме целия файл
    v.preload = v.getAttribute('preload') || 'metadata';

    // ако няма poster – вземи от <img>
    if (!v.getAttribute('poster') && img) {
      const posterSrc = img.currentSrc || img.src || '';
      if (posterSrc) v.setAttribute('poster', posterSrc);
    }

    // подсигури “готовност” за iOS (пускаме load веднъж)
    try { v.load(); } catch(e) {}

    // когато има кадър — позволяваме визуалната смяна снимка→видео
    const markReady = () => box.classList.add('video-ready');
    if (v.readyState >= 2) markReady();
    else {
      v.addEventListener('loadeddata', markReady, { once:true });
      v.addEventListener('canplay',     markReady, { once:true });
    }

    return v;
  }

  // единна логика: IntersectionObserver управлява play/pause и класовете
  function buildIO() {
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver((entries) => {
      entries.forEach(en => {
        const box = en.target;
        const v = box.__video;
        if (!v) return;

        if (en.isIntersecting && en.intersectionRatio >= 0.35) {
          box.classList.add('is-playing');
          safePlay(v);
        } else {
          box.classList.remove('is-playing');
          // само pause – без reset на currentTime (iOS AbortError fix)
          safePause(v);
        }
      });
    }, { root:null, rootMargin:'200px 0px', threshold:[0, 0.2, 0.35, 0.6, 1] });
  }

  function wireBox(box) {
    if (box.__wired) return;
    const v = prepVideo(box);
    if (!v) return;
    box.__video = v;
    box.__wired = true;
  }

  function wireAll() {
    document.querySelectorAll(CONTAINERS).forEach(wireBox);
  }

  // стартираме
  document.addEventListener('DOMContentLoaded', () => {
    const io = buildIO();
    wireAll();

    if (io) {
      document.querySelectorAll(CONTAINERS).forEach(box => io.observe(box));
    }

    // ако динамично вкарваш карти – вържи и тях
    const mo = new MutationObserver((muts) => {
      let needsObserve = false;
      muts.forEach(m => {
        m.addedNodes && m.addedNodes.forEach(n => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches && n.matches(CONTAINERS)) { wireBox(n); needsObserve = true; }
          n.querySelectorAll && n.querySelectorAll(CONTAINERS).forEach(el => { wireBox(el); needsObserve = true; });
        });
      });
      if (needsObserve && io) {
        document.querySelectorAll(CONTAINERS).forEach(box => io.observe(box));
      }
    });
    mo.observe(document.body, { childList:true, subtree:true });

    // ако табът стане скрит – спри всички (пестим батерия, избягваме грешки)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.querySelectorAll(CONTAINERS).forEach(box => {
          const v = box.__video;
          if (!v) return;
          box.classList.remove('is-playing');
          safePause(v);
        });
      }
    });
  });
})();
