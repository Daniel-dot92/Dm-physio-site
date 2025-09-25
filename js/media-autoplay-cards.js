// /js/media-autoplay-cards.js
document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_QUERY = '(hover: none) and (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isMobile = mql.matches;

  // Контейнери, които на десктоп трябва да PLAY само при hover:
  // 👉 Добавени: .two-col__right .pain-buttons-vertical … и #pain-conditions-intro .pain-buttons-grid …
  const HOVER_CONTAINERS = [
    '.card__media',
    '.pain-button-media',
    '.journey-image',
    '.image-container',

    // новите ти секции (изрично, за да се закачат във всички случаи):
    '.pain-buttons-grid .pain-button-media',
    '.pain-buttons-vertical .pain-button-media',
    '.two-col__right .pain-buttons-vertical .pain-button-media',
    '#pain-conditions-intro .pain-buttons-grid .pain-button-media',
    // ако някъде липсва .pain-button-media, хващаме и .image-container вътре в тези секции:
    '.pain-buttons-grid .image-container',
    '.pain-buttons-vertical .image-container',
    '.two-col__right .pain-buttons-vertical .image-container',
    '#pain-conditions-intro .pain-buttons-grid .image-container'
  ].join(',');

  // Намира двойката (static img, video) в даден контейнер
  function getMediaPair(container) {
    let staticImg =
      container.querySelector('.img--static, .static-img, .kinesitherapy-img, .static-hernia-img') ||
      container.querySelector('img'); // fallback

    let video =
      container.querySelector('video.img--hover, video.hover-img, video.hover-video, video.hover-muscle-video, video.kinesitherapy-video, video.hover-hernia-video') ||
      container.querySelector('video'); // fallback

    return { staticImg, video };
  }

  // Подготовка на видео за мобилно autoplay (iOS/Safari)
  function prepVideo(v) {
    if (!v) return;
    v.removeAttribute('autoplay');               // централен контрол
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    // По-щадящ preload, ако липсва
    if (!v.getAttribute('preload')) v.preload = 'metadata';
  }

  // По-надеждно play (изчаква readyState при нужда)
  function safePlay(v) {
    if (!v) return;
    const doPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) {
      doPlay();
    } else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once: true });
      try { v.load(); } catch (e) {}
    }
  }

  // На мобилни – показва видео и скрива статичната снимка (побеждава hover CSS)
  function revealOnMobile(container, video, staticImg) {
    if (!isMobile || !video) return;
    if (staticImg) staticImg.style.setProperty('opacity', '0', 'important');
    video.style.setProperty('opacity', '1', 'important');
    video.style.setProperty('visibility', 'visible', 'important');
  }

  function hideOnMobile(container, video, staticImg) {
    if (!isMobile || !video) return;
    if (staticImg) staticImg.style.setProperty('opacity', '1', 'important');
    // ако по дизайн видеото е "hover", го скриваме на мобилно извън екрана
    video.style.setProperty('opacity', '0', 'important');
  }

  // IntersectionObserver за мобилни (и за всички, които не са скрити от hover на десктоп)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const container = video.closest(HOVER_CONTAINERS) || video.parentElement;
      const { staticImg } = getMediaPair(container);
      const css = window.getComputedStyle(video);
      const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
      const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= 0.35;

      if (shouldPlay) {
        // На мобилни – разкриваме и пускаме
        revealOnMobile(container, video, staticImg);

        // На десктоп, ако е скрито (чака hover), не го пускаме насила
        if (!isMobile && visuallyHidden) return;

        safePlay(video);
      } else {
        if (!video.paused) video.pause();
        // Нулирай при излизане
        if (!video.classList.contains('no-reset-on-exit')) video.currentTime = 0;
        hideOnMobile(container, video, staticImg);
      }
    });
  }, {
    root: null,
    rootMargin: '200px 0px',
    threshold: [0, 0.2, 0.35, 0.5, 0.75, 1]
  });

  // Настройва един контейнер (карта/бутон) – подготвя видео, hover за десктоп, IO и за мобилни
  function wireContainer(container) {
    const { staticImg, video } = getMediaPair(container);
    if (!video) return;

    prepVideo(video);

    // На десктоп – play/pause само при hover
    container.addEventListener('mouseenter', () => {
      if (isMobile) return;
      if (staticImg) staticImg.style.opacity = '0';
      video.style.opacity = '1';
      safePlay(video);
    });
    container.addEventListener('mouseleave', () => {
      if (isMobile) return;
      if (staticImg) staticImg.style.opacity = '1';
      video.style.opacity = '0';
      video.pause();
      video.currentTime = 0;
    });

    // IO наблюдение:
    // - на мобилни: винаги
    // - на десктоп: само ако е видимо по CSS (т.е. няма hover-скриване)
    const css = window.getComputedStyle(video);
    const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
    if (isMobile || !visuallyHidden) {
      io.observe(video);
    }
  }

  // Настройва всички текущи контейнери
  function wireAll() {
    document.querySelectorAll(HOVER_CONTAINERS).forEach(wireContainer);
  }

  // Реконфигуриране при смяна мобилно/десктоп
  function reconfigure() {
    isMobile = mql.matches;
    io.disconnect();
    wireAll();
  }

  // Първоначално закачане
  wireAll();

  // Ако добавяш карти динамично (напр. в сайдбар „Болкови състояния“)
  const mo = new MutationObserver((mutations) => {
    let needsWire = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        needsWire = true; break;
      }
    }
    if (needsWire) wireAll();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Респонсив смяна
  if (mql.addEventListener) mql.addEventListener('change', reconfigure);
  window.addEventListener('resize', reconfigure, { passive: true });
});
