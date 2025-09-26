document.addEventListener('DOMContentLoaded', function () {
  /* =========================
     Calendly (Р±РµР· РїСЂРѕРјРµРЅРё)
  ========================== */
  const calendlyButtons = document.querySelectorAll('.calendly-button');
  calendlyButtons.forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const calendlyUrl = this.dataset.calendlyUrl;
      if (calendlyUrl) {
        if (typeof Calendly !== 'undefined' && Calendly.initPopupWidget) {
          Calendly.initPopupWidget({ url: calendlyUrl });
        } else {
          console.warn('Calendly script not fully loaded. Open in new tab.');
          window.open(calendlyUrl, '_blank');
        }
      } else {
        console.error('No Calendly URL defined for this button.');
      }
    });
  });

  /* =====================================================
     РђРІС‚РѕРїСѓСЃРєР°РЅРµ РїСЂРё РІРёРґРёРјРѕСЃС‚ (РјРѕР±РёР»РЅРё + РґРµСЃРєС‚РѕРї)
  ====================================================== */
  const MOBILE_QUERY = '(hover: none) and (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isMobile = mql.matches;

  // Р’СЃРёС‡РєРё РІРёРґРµР°
  const allVideos = Array.from(document.querySelectorAll('video'));

  // РџРѕРґРіРѕС‚РѕРІРєР° Р·Р° iOS/Android + С†РµРЅС‚СЂР°Р»РµРЅ РєРѕРЅС‚СЂРѕР»
  allVideos.forEach(v => {
    v.removeAttribute('autoplay');               // РЅРёРµ СѓРїСЂР°РІР»СЏРІР°РјРµ autoplay
    v.muted = true;                              // РЅСѓР¶РЅРѕ Р·Р° РјРѕР±РёР»РµРЅ autoplay
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    if (!v.getAttribute('preload')) v.preload = 'metadata';
  });

  // РџРѕРјРѕС‰РЅРё СЃРµР»РµРєС‚РѕСЂРё
  const isProceduresVideo = (v) => !!v.closest('.kinesitherapy-button-media');

  // РќР° Р”Р•РЎРљРўРћРџ: РЅРµ РЅР°Р±Р»СЋРґР°РІР°РјРµ вЂћРќР°С€РёС‚Рµ РїСЂРѕС†РµРґСѓСЂРёвЂњ (С‚Рµ СЃР° СЃР°РјРѕ hover)
  // РќР° РњРћР‘РР›РќР: РЅР°Р±Р»СЋРґР°РІР°РјРµ РІСЃРёС‡РєРё
  let observedVideos = allVideos.filter(v => isMobile || !isProceduresVideo(v));

  function containerOf(videoEl) {
    return videoEl.closest(
      '.image-container, .muscle-video-centered, .kinesitherapy-button-media, .hernia-step-media'
    );
  }

  function staticImgFor(videoEl) {
    const c = containerOf(videoEl);
    if (!c) return null;
    return c.querySelector(
      '.static-img, .static-muscle-img, .kinesitherapy-img, .static-hernia-img'
    );
  }

  // Р¤РѕСЂСЃРёСЂР°РЅРѕ РїРѕРєР°Р·РІР°РЅРµ/СЃРєСЂРёРІР°РЅРµ РЅР° РјРѕР±РёР»РЅРё (СЃ !important вЂ” РїРѕР±РµР¶РґР°РІР° hover CSS)
  function revealVideoOnMobile(videoEl) {
    if (!isMobile) return;
    const img = staticImgFor(videoEl);
    if (img) img.style.setProperty('opacity', '0', 'important');
    videoEl.style.setProperty('opacity', '1', 'important');
    videoEl.style.setProperty('visibility', 'visible', 'important');
  }

  function hideVideoOnMobile(videoEl) {
    if (!isMobile) return;
    const img = staticImgFor(videoEl);
    if (img) img.style.setProperty('opacity', '1', 'important');
    if (
      videoEl.classList.contains('hover-video') ||
      videoEl.classList.contains('hover-muscle-video') ||
      videoEl.classList.contains('kinesitherapy-video') ||
      videoEl.classList.contains('hover-hernia-video')
    ) {
      videoEl.style.setProperty('opacity', '0', 'important');
    }
  }

  // РџРѕ-РЅР°РґРµР¶РґРЅРѕ play: РёР·С‡Р°РєРІР° РґР°РЅРЅРё РїСЂРё РЅСѓР¶РґР° (iOS/Safari)
  function safePlay(v) {
    const doPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) {
      doPlay();
    } else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once: true });
      try { v.load(); } catch (e) {}
    }
  }

  // IO РЅР°Р±Р»СЋРґР°С‚РµР»
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      const css = window.getComputedStyle(v);
      const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
      const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= 0.35; // РїРѕ-СЂР°РЅРѕ СЃС‚Р°СЂС‚РёСЂР°РЅРµ

      if (shouldPlay) {
        // РќР° РјРѕР±РёР»РЅРё СЂР°Р·РєСЂРёРІР°РјРµ РІРёРґРµРѕС‚Рѕ Рё СЃРєСЂРёРІР°РјРµ СЃС‚Р°С‚РёС‡РЅРѕС‚Рѕ
        revealVideoOnMobile(v);

        // РќР° РґРµСЃРєС‚РѕРї вЂ“ Р°РєРѕ Рµ СЃРєСЂРёС‚Рѕ (С‡Р°РєР° hover), РЅРµ РїСѓСЃРєР°РјРµ РЅР°СЃРёР»Р°
        if (!isMobile && visuallyHidden) return;

        safePlay(v);
      } else {
        if (!v.paused) v.pause();
        // РђРєРѕ РёСЃРєР°С€ РЅСЏРєРѕРё РіСЂСѓРїРё РґР° РќР• СЃРµ РЅСѓР»РёСЂР°С‚, РґРѕР±Р°РІРё РєР»Р°СЃ РЅР°РїСЂ. .no-reset-on-exit
        if (!v.classList.contains('no-reset-on-exit')) v.currentTime = 0;
        hideVideoOnMobile(v);
      }
    });
  }, {
    root: null,
    rootMargin: '200px 0px',   // РїРѕ-РіР»Р°РґРєРѕ Р·Р°СЃРёС‡Р°РЅРµ РїСЂРё СЃРєСЂРѕР»
    threshold: [0, 0.2, 0.35, 0.5, 0.75, 1]
  });

  function observeAll() {
    observedVideos.forEach(v => io.observe(v));
  }
  function unobserveAll() {
    observedVideos.forEach(v => io.unobserve(v));
  }
  observeAll();

  // РџР°СѓР·Р° РЅР° РІСЃРёС‡РєРё, РєРѕРіР°С‚Рѕ С‚Р°Р±СЉС‚ Рµ СЃРєСЂРёС‚
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      allVideos.forEach(v => { if (!v.paused) v.pause(); });
    }
  }, { passive: true });

  // РџСЂРµРёРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїСЂРё resize Рё РїСЂРё СЃРјСЏРЅР° РјРѕР±РёР»РµРЅ/РґРµСЃРєС‚РѕРї Р±СЂРµР№РєРїРѕР№РЅС‚
  function reconfigureObserver() {
    unobserveAll();
    isMobile = mql.matches;
    observedVideos = allVideos.filter(v => isMobile || !isProceduresVideo(v));
    observeAll();
  }
  window.addEventListener('resize', reconfigureObserver, { passive: true });
  if (mql.addEventListener) mql.addEventListener('change', reconfigureObserver);

  /* =====================================================
     Hover РµС„РµРєС‚Рё (СЃР°РјРѕ Р·Р° РґРµСЃРєС‚РѕРї)
  ====================================================== */

  function addHover(containerSelector, imgSelector, videoSelector) {
    document.querySelectorAll(containerSelector).forEach(container => {
      const img = container.querySelector(imgSelector);
      const vid = container.querySelector(videoSelector);
      if (!img || !vid) return;

      container.addEventListener('mouseenter', () => {
        if (isMobile) return;    // РјРѕР±РёР»РЅРёС‚Рµ СЃРµ СѓРїСЂР°РІР»СЏРІР°С‚ РѕС‚ IO
        img.style.opacity = '0';
        vid.style.opacity = '1';
        safePlay(vid);
      });
      container.addEventListener('mouseleave', () => {
        if (isMobile) return;
        img.style.opacity = '1';
        vid.style.opacity = '0';
        vid.pause();
        vid.currentTime = 0;
      });
    });
  }

  // Hero / Intro
  addHover('.image-container', '.static-img', '.hover-video');

  // РњСѓСЃРєСѓР»Рё
  addHover('.muscle-video-centered', '.static-muscle-img', '.hover-muscle-video');

  // РќР°С€РёС‚Рµ РїСЂРѕС†РµРґСѓСЂРё вЂ” hover СЃР°РјРѕ РЅР° РґРµСЃРєС‚РѕРї (РЅР° РјРѕР±РёР»РЅРё РіРё РґРІРёР¶Рё IO)
  addHover('.kinesitherapy-button-media', '.kinesitherapy-img', '.kinesitherapy-video');

  // Timeline / Hernia СЃС‚СЉРїРєРё
  addHover('.hernia-step-media', '.static-hernia-img', '.hover-hernia-video');
});
