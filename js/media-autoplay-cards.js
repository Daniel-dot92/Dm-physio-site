// /js/media-autoplay-cards.js
document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_QUERY = '(hover: none) and (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isMobile = mql.matches;

  // РљРѕРЅС‚РµР№РЅРµСЂРё, РєРѕРёС‚Рѕ РЅР° РґРµСЃРєС‚РѕРї С‚СЂСЏР±РІР° РґР° PLAY СЃР°РјРѕ РїСЂРё hover:
  // рџ‘‰ Р”РѕР±Р°РІРµРЅРё: .two-col__right .pain-buttons-vertical вЂ¦ Рё #pain-conditions-intro .pain-buttons-grid вЂ¦
  const HOVER_CONTAINERS = [
    '.card__media',
    '.pain-button-media',
    '.journey-image',
    '.image-container',

    // РЅРѕРІРёС‚Рµ С‚Рё СЃРµРєС†РёРё (РёР·СЂРёС‡РЅРѕ, Р·Р° РґР° СЃРµ Р·Р°РєР°С‡Р°С‚ РІСЉРІ РІСЃРёС‡РєРё СЃР»СѓС‡Р°Рё):
    '.pain-buttons-grid .pain-button-media',
    '.pain-buttons-vertical .pain-button-media',
    '.two-col__right .pain-buttons-vertical .pain-button-media',
    '#pain-conditions-intro .pain-buttons-grid .pain-button-media',
    // Р°РєРѕ РЅСЏРєСЉРґРµ Р»РёРїСЃРІР° .pain-button-media, С…РІР°С‰Р°РјРµ Рё .image-container РІСЉС‚СЂРµ РІ С‚РµР·Рё СЃРµРєС†РёРё:
    '.pain-buttons-grid .image-container',
    '.pain-buttons-vertical .image-container',
    '.two-col__right .pain-buttons-vertical .image-container',
    '#pain-conditions-intro .pain-buttons-grid .image-container'
  ].join(',');

  // РќР°РјРёСЂР° РґРІРѕР№РєР°С‚Р° (static img, video) РІ РґР°РґРµРЅ РєРѕРЅС‚РµР№РЅРµСЂ
  function getMediaPair(container) {
    let staticImg =
      container.querySelector('.img--static, .static-img, .kinesitherapy-img, .static-hernia-img') ||
      container.querySelector('img'); // fallback

    let video =
      container.querySelector('video.img--hover, video.hover-img, video.hover-video, video.hover-muscle-video, video.kinesitherapy-video, video.hover-hernia-video') ||
      container.querySelector('video'); // fallback

    return { staticImg, video };
  }

  // РџРѕРґРіРѕС‚РѕРІРєР° РЅР° РІРёРґРµРѕ Р·Р° РјРѕР±РёР»РЅРѕ autoplay (iOS/Safari)
  function prepVideo(v) {
    if (!v) return;
    v.removeAttribute('autoplay');               // С†РµРЅС‚СЂР°Р»РµРЅ РєРѕРЅС‚СЂРѕР»
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    // РџРѕ-С‰Р°РґСЏС‰ preload, Р°РєРѕ Р»РёРїСЃРІР°
    if (!v.getAttribute('preload')) v.preload = 'metadata';
  }

  // РџРѕ-РЅР°РґРµР¶РґРЅРѕ play (РёР·С‡Р°РєРІР° readyState РїСЂРё РЅСѓР¶РґР°)
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

  // РќР° РјРѕР±РёР»РЅРё вЂ“ РїРѕРєР°Р·РІР° РІРёРґРµРѕ Рё СЃРєСЂРёРІР° СЃС‚Р°С‚РёС‡РЅР°С‚Р° СЃРЅРёРјРєР° (РїРѕР±РµР¶РґР°РІР° hover CSS)
  function revealOnMobile(container, video, staticImg) {
    if (!isMobile || !video) return;
    if (staticImg) staticImg.style.setProperty('opacity', '0', 'important');
    video.style.setProperty('opacity', '1', 'important');
    video.style.setProperty('visibility', 'visible', 'important');
  }

  function hideOnMobile(container, video, staticImg) {
    if (!isMobile || !video) return;
    if (staticImg) staticImg.style.setProperty('opacity', '1', 'important');
    // Р°РєРѕ РїРѕ РґРёР·Р°Р№РЅ РІРёРґРµРѕС‚Рѕ Рµ "hover", РіРѕ СЃРєСЂРёРІР°РјРµ РЅР° РјРѕР±РёР»РЅРѕ РёР·РІСЉРЅ РµРєСЂР°РЅР°
    video.style.setProperty('opacity', '0', 'important');
  }

  // IntersectionObserver Р·Р° РјРѕР±РёР»РЅРё (Рё Р·Р° РІСЃРёС‡РєРё, РєРѕРёС‚Рѕ РЅРµ СЃР° СЃРєСЂРёС‚Рё РѕС‚ hover РЅР° РґРµСЃРєС‚РѕРї)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const container = video.closest(HOVER_CONTAINERS) || video.parentElement;
      const { staticImg } = getMediaPair(container);
      const css = window.getComputedStyle(video);
      const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
      const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= 0.35;

      if (shouldPlay) {
        // РќР° РјРѕР±РёР»РЅРё вЂ“ СЂР°Р·РєСЂРёРІР°РјРµ Рё РїСѓСЃРєР°РјРµ
        revealOnMobile(container, video, staticImg);

        // РќР° РґРµСЃРєС‚РѕРї, Р°РєРѕ Рµ СЃРєСЂРёС‚Рѕ (С‡Р°РєР° hover), РЅРµ РіРѕ РїСѓСЃРєР°РјРµ РЅР°СЃРёР»Р°
        if (!isMobile && visuallyHidden) return;

        safePlay(video);
      } else {
        if (!video.paused) video.pause();
        // РќСѓР»РёСЂР°Р№ РїСЂРё РёР·Р»РёР·Р°РЅРµ
        if (!video.classList.contains('no-reset-on-exit')) video.currentTime = 0;
        hideOnMobile(container, video, staticImg);
      }
    });
  }, {
    root: null,
    rootMargin: '200px 0px',
    threshold: [0, 0.2, 0.35, 0.5, 0.75, 1]
  });

  // РќР°СЃС‚СЂРѕР№РІР° РµРґРёРЅ РєРѕРЅС‚РµР№РЅРµСЂ (РєР°СЂС‚Р°/Р±СѓС‚РѕРЅ) вЂ“ РїРѕРґРіРѕС‚РІСЏ РІРёРґРµРѕ, hover Р·Р° РґРµСЃРєС‚РѕРї, IO Рё Р·Р° РјРѕР±РёР»РЅРё
  function wireContainer(container) {
    const { staticImg, video } = getMediaPair(container);
    if (!video) return;

    prepVideo(video);

    // РќР° РґРµСЃРєС‚РѕРї вЂ“ play/pause СЃР°РјРѕ РїСЂРё hover
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

    // IO РЅР°Р±Р»СЋРґРµРЅРёРµ:
    // - РЅР° РјРѕР±РёР»РЅРё: РІРёРЅР°РіРё
    // - РЅР° РґРµСЃРєС‚РѕРї: СЃР°РјРѕ Р°РєРѕ Рµ РІРёРґРёРјРѕ РїРѕ CSS (С‚.Рµ. РЅСЏРјР° hover-СЃРєСЂРёРІР°РЅРµ)
    const css = window.getComputedStyle(video);
    const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
    if (isMobile || !visuallyHidden) {
      io.observe(video);
    }
  }

  // РќР°СЃС‚СЂРѕР№РІР° РІСЃРёС‡РєРё С‚РµРєСѓС‰Рё РєРѕРЅС‚РµР№РЅРµСЂРё
  function wireAll() {
    document.querySelectorAll(HOVER_CONTAINERS).forEach(wireContainer);
  }

  // Р РµРєРѕРЅС„РёРіСѓСЂРёСЂР°РЅРµ РїСЂРё СЃРјСЏРЅР° РјРѕР±РёР»РЅРѕ/РґРµСЃРєС‚РѕРї
  function reconfigure() {
    isMobile = mql.matches;
    io.disconnect();
    wireAll();
  }

  // РџСЉСЂРІРѕРЅР°С‡Р°Р»РЅРѕ Р·Р°РєР°С‡Р°РЅРµ
  wireAll();

  // РђРєРѕ РґРѕР±Р°РІСЏС€ РєР°СЂС‚Рё РґРёРЅР°РјРёС‡РЅРѕ (РЅР°РїСЂ. РІ СЃР°Р№РґР±Р°СЂ вЂћР‘РѕР»РєРѕРІРё СЃСЉСЃС‚РѕСЏРЅРёСЏвЂњ)
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

  // Р РµСЃРїРѕРЅСЃРёРІ СЃРјСЏРЅР°
  if (mql.addEventListener) mql.addEventListener('change', reconfigure);
  window.addEventListener('resize', reconfigure, { passive: true });
});
