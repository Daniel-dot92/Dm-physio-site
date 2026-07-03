// Temporary gate: keep unfinished online plan pages unavailable in production.
(function () {
  'use strict';
  var blockedPaths = new Set([
    '/online-recovery.html',
    '/online-questionnaire.html',
    '/procedures/online-5proceduri.html',
    '/procedures/online-konsultaciq.html',
    '/procedures/online-podrujka.html',
    '/procedures/online-program-1.html',
    '/procedures/online-program-2.html',
    '/procedures/online-program-3.html',
    '/procedures/online-sesiq.html',
    '/procedures/online-videos.html',
    '/biblioteka-uprazhnenia.html',
    '/uprazhnenia.html',
    '/uprazhnenie.html',
    '/simptomi.html',
    '/diagnozi.html',
    '/zoni.html',
    '/celi.html',
    '/sesii.html',
    '/programi.html',
    '/programa.html',
    '/trenirovki.html',
    '/trenirovka.html',
    '/individualna-programa.html'
  ]);
  var currentPath = (window.location && window.location.pathname) || '';
  var blockedPrefixes = [
    '/videos/procedures-online-'
  ];
  var isBlockedPrefix = blockedPrefixes.some(function (prefix) {
    return currentPath.indexOf(prefix) === 0;
  });
  if (blockedPaths.has(currentPath) || isBlockedPrefix) {
    window.location.replace('/services.html');
  }
})();

/* ---------- Fallback topbar for legacy pages ---------- */
(function () {
  'use strict';

  function ensureTopbar() {
    if (document.querySelector('.tb-header')) return;

    var header = document.createElement('header');
    header.className = 'tb-header';
    header.setAttribute('role', 'banner');
    header.innerHTML = [
      '<div class="tb-inner">',
      '<a href="/" class="tb-logo-link" aria-label="\u041d\u0430\u0447\u0430\u043b\u043e"><img src="/logo.webp" alt="DM Physio \u043b\u043e\u0433\u043e" class="tb-logo" loading="eager" decoding="async" width="64" height="64"></a>',
      '<button class="tb-burger" aria-controls="tb-primary-nav" aria-expanded="false" aria-label="\u041e\u0442\u0432\u043e\u0440\u0438 \u043c\u0435\u043d\u044e"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"></path></svg></button>',
      '<nav class="tb-nav" id="tb-primary-nav" aria-label="\u041e\u0441\u043d\u043e\u0432\u043d\u0430 \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f"><ul class="tb-menu">',
      '<li class="tb-item"><a class="tb-link" href="/">\u041d\u0430\u0447\u0430\u043b\u043e</a></li>',
      '<li class="tb-item tb-dropdown"><a class="tb-link tb-drop-toggle" href="/services.html" data-dropdown="toggle">\u041f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0438</a><div class="tb-drop-menu"><a class="tb-drop-link" href="/kinesitherapy.html">\u041a\u0438\u043d\u0435\u0437\u0438\u0442\u0435\u0440\u0430\u043f\u0438\u044f</a><a class="tb-drop-link" href="/massages.html">\u041c\u0430\u0441\u0430\u0436\u0438</a></div></li>',
      '<li class="tb-item tb-dropdown"><a class="tb-link tb-drop-toggle" href="/pain-conditions.html" data-dropdown="toggle">\u0411\u043e\u043b\u043a\u043e\u0432\u0438 \u0441\u044a\u0441\u0442\u043e\u044f\u043d\u0438\u044f</a><div class="tb-drop-menu tb-drop-menu--pain"><a class="tb-drop-link" href="/pain-head.html">\u0413\u043b\u0430\u0432\u0430</a><a class="tb-drop-link" href="/pain-neck.html">\u0412\u0440\u0430\u0442</a><a class="tb-drop-link" href="/pain-shoulder.html">\u0420\u0430\u043c\u043e</a><a class="tb-drop-link" href="/pain-arm.html">\u0420\u044a\u043a\u0430</a><a class="tb-drop-link" href="/pain-chest-abdomen.html">\u0413\u044a\u0440\u0434\u0438 \u0438 \u043a\u043e\u0440\u0435\u043c</a><a class="tb-drop-link" href="/pain-back.html">\u0413\u0440\u044a\u0431</a><a class="tb-drop-link" href="/pain-lower-back.html">\u041a\u0440\u044a\u0441\u0442</a><a class="tb-drop-link" href="/pain-buttocks-pelvis.html">\u0422\u0430\u0437 \u0438 \u0441\u0435\u0434\u0430\u043b\u0438\u0449\u0435</a><a class="tb-drop-link" href="/pain-thigh-knee.html">\u0411\u0435\u0434\u0440\u043e \u0438 \u043a\u043e\u043b\u044f\u043d\u043e</a><a class="tb-drop-link" href="/pain-lower-leg-ankle.html">\u041f\u043e\u0434\u0431\u0435\u0434\u0440\u0438\u0446\u0430 \u0438 \u0441\u0442\u044a\u043f\u0430\u043b\u043e</a><a class="tb-drop-link" href="/pain-neuralgia-general.html">\u041d\u0435\u0432\u0440\u0430\u043b\u0433\u0438\u0438</a></div></li>',
      '<li class="tb-item"><a class="tb-link" href="/contacts.html">\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u0438</a></li>',
      '<li class="tb-item"><a class="tb-link" href="https://www.dmphysi0.com/book" rel="noopener">\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u0438 \u0447\u0430\u0441\u043e\u0432\u0435</a></li>',
      '<li class="tb-item tb-lang-switch" aria-label="Language"><a class="tb-flag is-active" href="/" hreflang="bg-BG" lang="bg" aria-label="Bulgarian version"><img src="/bulgaria-flag.webp" alt="Bulgarian" width="28" height="28" loading="eager" decoding="async"></a><a class="tb-flag" href="/en/index.html" hreflang="en" lang="en" aria-label="English version"><img src="/great-britain-flag.webp" alt="English" width="28" height="28" loading="eager" decoding="async"></a></li>',
      '</ul></nav>',
      '</div>'
    ].join('');
    document.body.insertBefore(header, document.body.firstChild);
    if (!document.querySelector('main.page-content')) {
      var main = document.querySelector('main');
      if (main) main.classList.add('page-content');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureTopbar, { once: true });
  } else {
    ensureTopbar();
  }
})();

/* ---------- User-triggered preview video hydration ---------- */
(function () {
  'use strict';

  function hydratePreviewVideo(video) {
    if (!video || video.dataset.dmPreviewHydrated === '1') return;
    var source = video.querySelector('source[data-src]');
    var direct = video.getAttribute('data-src');
    var preview = getPreviewSrc(video);
    if (direct && !video.getAttribute('src')) {
      video.setAttribute('src', direct);
    }
    if (source && !source.getAttribute('src')) {
      source.setAttribute('src', source.getAttribute('data-src'));
    }
    if (!source && preview && !video.querySelector('source[src]') && !video.getAttribute('src')) {
      source = document.createElement('source');
      source.setAttribute('src', preview);
      source.setAttribute('type', 'video/mp4');
      video.appendChild(source);
    }
    video.dataset.dmPreviewHydrated = '1';
    try { video.load(); } catch (_) {}
  }

  function getPreviewSrc(node) {
    if (!node) return '';
    var direct = node.getAttribute('data-src');
    if (direct) return direct;
    var preview = node.getAttribute('data-dm-preview-src');
    if (preview) return preview;
    var key = node.getAttribute('data-dm-preview-key');
    if (!key) return '';
    try {
      var normalized = key.replace(/-/g, '+').replace(/_/g, '/');
      normalized += '='.repeat((4 - normalized.length % 4) % 4);
      return decodeURIComponent(escape(atob(normalized)));
    } catch (_) {
      return '';
    }
  }

  function createVideoFromPlaceholder(placeholder) {
    if (!placeholder || placeholder.tagName === 'VIDEO') return placeholder;
    if (placeholder.dataset.dmPreviewVideoId) {
      return document.getElementById(placeholder.dataset.dmPreviewVideoId);
    }

    var preview = getPreviewSrc(placeholder);
    if (!preview) return null;

    var video = document.createElement('video');
    var id = 'dm-preview-video-' + Math.random().toString(36).slice(2);
    var poster = placeholder.getAttribute('data-dm-preview-poster') || placeholder.getAttribute('src') || placeholder.getAttribute('poster') || '';
    var className = (placeholder.getAttribute('class') || '').replace(/\bdm-video-placeholder\b/g, '').replace(/\s+/g, ' ').trim();

    video.id = id;
    video.className = className || 'hover-img';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('aria-hidden', placeholder.getAttribute('aria-hidden') || 'true');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
    if (poster) video.setAttribute('poster', poster);
    if (placeholder.getAttribute('width')) video.setAttribute('width', placeholder.getAttribute('width'));
    if (placeholder.getAttribute('height')) video.setAttribute('height', placeholder.getAttribute('height'));

    var source = document.createElement('source');
    source.setAttribute('src', preview);
    source.setAttribute('type', 'video/mp4');
    video.appendChild(source);

    placeholder.dataset.dmPreviewVideoId = id;
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.display = 'none';
    placeholder.insertAdjacentElement('afterend', video);
    var box = getPreviewBox(video);
    if (box) box.classList.add('video-ready');
    hydratePreviewVideo(video);
    return video;
  }

  function getPreviewBox(target) {
    if (!target || !target.closest) return null;
    return target.closest('.image-container, .pain-button-media, .kinesitherapy-button-media, .muscle-video-centered, .hernia-step-media, .journey-image, .card__media, .dt-media, .video-container, .journey-step, .media-square');
  }

  function setPreviewStillVisible(video, visible) {
    var box = getPreviewBox(video);
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('.static-img, .kinesitherapy-img, img:not(.dm-video-placeholder):not(.hover-img)'), function (img) {
      img.style.opacity = visible ? '' : '0';
    });
  }

  function hydrateFromTarget(target) {
    var box = getPreviewBox(target);
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('video'), hydratePreviewVideo);
  }

  function findPreviewMedia(target) {
    if (!target || !target.closest) return null;
    var video = target.closest('video[data-dm-preview-key], video[data-dm-preview-src], video[data-src]');
    if (video) return video;
    var placeholder = target.closest('.dm-video-placeholder[data-dm-preview-key], .dm-video-placeholder[data-dm-preview-src], img[data-dm-preview-key], img[data-dm-preview-src]');
    if (placeholder) return placeholder;

    var box = target.closest('.image-container, .pain-button-media, .kinesitherapy-button-media, .muscle-video-centered, .hernia-step-media, .journey-image, .card__media, .dt-media, .video-container, .journey-step, .media-square');
    if (!box) return null;
    return box.querySelector('video[data-dm-preview-key], video[data-dm-preview-src], video[data-src], .dm-video-placeholder[data-dm-preview-key], .dm-video-placeholder[data-dm-preview-src], img[data-dm-preview-key], img[data-dm-preview-src]');
  }

  function playPreviewFromTarget(target) {
    var media = findPreviewMedia(target);
    if (!media) return;
    var video = media.tagName === 'VIDEO' ? media : createVideoFromPlaceholder(media);
    if (!video || video.tagName !== 'VIDEO') return;
    var box = getPreviewBox(video);
    hydratePreviewVideo(video);
    try {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.style.opacity = '1';
      setPreviewStillVisible(video, false);
      if (box) {
        box.classList.add('video-ready');
        box.classList.add('is-playing');
        box.dataset.playing = '1';
      }
      var played = video.play();
      if (played && typeof played.catch === 'function') played.catch(function () {});
    } catch (_) {}
  }

  function pausePreviewFromTarget(target) {
    var media = findPreviewMedia(target);
    var video = media && media.tagName === 'VIDEO' ? media : null;
    if (!video && target && target.closest) {
      var box = target.closest('.image-container, .pain-button-media, .kinesitherapy-button-media, .muscle-video-centered, .hernia-step-media, .journey-image, .card__media, .dt-media, .video-container, .journey-step, .media-square');
      video = box && box.querySelector('video[data-dm-preview-hydrated="1"]');
    }
    if (!video) return;
    try {
      video.pause();
      video.currentTime = 0;
      video.style.opacity = '';
      setPreviewStillVisible(video, true);
      var box = getPreviewBox(video);
      if (box) {
        box.classList.remove('is-playing');
        delete box.dataset.playing;
        delete box.dataset.touchPreviewConfirmed;
      }
    } catch (_) {}
  }

  var activeTouchPreviewVideo = null;
  var touchPreviewObserver = null;

  function isTouchPreviewMode() {
    return (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) || window.innerWidth <= 900;
  }

  function pausePreviewVideo(video, reset) {
    if (!video) return;
    try {
      video.pause();
      if (reset) video.currentTime = 0;
      video.style.opacity = '';
      setPreviewStillVisible(video, true);
      var box = getPreviewBox(video);
      if (box) box.classList.remove('is-playing');
    } catch (_) {}
  }

  function playPreviewVideo(video) {
    if (!video || video.tagName !== 'VIDEO') return;
    hydratePreviewVideo(video);
    try {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.style.opacity = '1';
      setPreviewStillVisible(video, false);
      var box = getPreviewBox(video);
      if (box) {
        box.classList.add('video-ready');
        box.classList.add('is-playing');
      }
      var played = video.play();
      if (played && typeof played.catch === 'function') played.catch(function () {});
    } catch (_) {}
  }

  function mediaFromBox(box) {
    if (!box) return null;
    return box.querySelector('video[data-dm-preview-key], video[data-dm-preview-src], video[data-src], .dm-video-placeholder[data-dm-preview-key], .dm-video-placeholder[data-dm-preview-src], img[data-dm-preview-key], img[data-dm-preview-src]');
  }

  function playBestTouchPreview(box) {
    var media = mediaFromBox(box);
    if (!media) return;
    var video = media.tagName === 'VIDEO' ? media : createVideoFromPlaceholder(media);
    if (!video || video.tagName !== 'VIDEO') return;

    if (activeTouchPreviewVideo && activeTouchPreviewVideo !== video) {
      pausePreviewVideo(activeTouchPreviewVideo, true);
    }
    activeTouchPreviewVideo = video;
    playPreviewVideo(video);
  }

  function initTouchScrollPreviews() {
    if (!isTouchPreviewMode() || !('IntersectionObserver' in window) || touchPreviewObserver) return;

    var mediaBoxSelector = '.image-container, .pain-button-media, .kinesitherapy-button-media, .muscle-video-centered, .hernia-step-media, .journey-image, .card__media, .dt-media, .video-container, .journey-step, .media-square';
    var observedBoxes = new WeakSet();
    var observedList = [];
    var visibleBoxes = new Map();
    var touchPreviewHasUserIntent = false;

    function visibleRatio(box) {
      if (!box || !box.getBoundingClientRect) return 0;
      var rect = box.getBoundingClientRect();
      if (!rect.width || !rect.height) return 0;
      var width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      var height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      return (width * height) / (rect.width * rect.height);
    }

    function playBestVisiblePreview() {
      var bestBox = null;
      var bestRatio = 0;
      observedList.forEach(function (box) {
        var ratio = visibleRatio(box);
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestBox = box;
        }
      });
      if (bestBox && bestRatio >= 0.35) {
        playBestTouchPreview(bestBox);
      }
    }

    function playTouchedBox(target) {
      touchPreviewHasUserIntent = true;
      var box = getPreviewBox(target);
      if (box) {
        playBestTouchPreview(box);
      } else {
        setTimeout(playBestVisiblePreview, 60);
      }
    }

    touchPreviewObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          visibleBoxes.set(entry.target, entry.intersectionRatio);
        } else {
          visibleBoxes.delete(entry.target);
          var media = mediaFromBox(entry.target);
          var video = media && media.tagName === 'VIDEO' ? media : null;
          if (video && activeTouchPreviewVideo === video) {
            pausePreviewVideo(video, true);
            activeTouchPreviewVideo = null;
          }
        }
      });

      var bestBox = null;
      var bestRatio = 0;
      visibleBoxes.forEach(function (ratio, box) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestBox = box;
        }
      });
      if (bestBox && touchPreviewHasUserIntent) playBestTouchPreview(bestBox);
    }, {
      threshold: [0, 0.25, 0.45, 0.6, 0.8, 1],
      rootMargin: '-8% 0px -25% 0px'
    });

    function observePreviews(root) {
      if (!root || !root.querySelectorAll) return;
      Array.prototype.forEach.call(root.querySelectorAll(mediaBoxSelector), function (box) {
        if (observedBoxes.has(box) || !mediaFromBox(box)) return;
        observedBoxes.add(box);
        observedList.push(box);
        touchPreviewObserver.observe(box);
      });
    }

    observePreviews(document);
    if ('MutationObserver' in window && document.body) {
      var mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
            if (node.nodeType === 1) observePreviews(node);
          });
        });
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('touchstart', function (event) {
      playTouchedBox(event.target);
    }, { passive: true });
    window.addEventListener('pointerdown', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse') playTouchedBox(event.target);
    }, { passive: true });
  }

  function initPreviewHydration() {
    window.__dmPreviewHydrationActive = true;
    document.addEventListener('pointerenter', function (event) {
      if (isTouchPreviewMode()) return;
      var box = getPreviewBox(event.target);
      if (!box || !box.matches(':hover')) return;
      hydrateFromTarget(event.target);
      playPreviewFromTarget(event.target);
    }, true);
    document.addEventListener('pointerout', function (event) {
      if (isTouchPreviewMode()) return;
      pausePreviewFromTarget(event.target);
    }, true);
    document.addEventListener('focusin', function (event) {
      hydrateFromTarget(event.target);
      playPreviewFromTarget(event.target);
    }, true);
    document.addEventListener('focusout', function (event) {
      pausePreviewFromTarget(event.target);
    }, true);
    document.addEventListener('pointerdown', function (event) {
      if (!isTouchPreviewMode() || event.pointerType === 'mouse') return;
      hydrateFromTarget(event.target);
      playBestTouchPreview(getPreviewBox(event.target));
    }, { passive: true, capture: true });
    document.addEventListener('touchstart', function (event) {
      hydrateFromTarget(event.target);
      if (isTouchPreviewMode()) {
        playBestTouchPreview(getPreviewBox(event.target));
      } else {
        playPreviewFromTarget(event.target);
      }
    }, { passive: true, capture: true });
    document.addEventListener('click', function (event) {
      if (!isTouchPreviewMode()) return;
      var box = getPreviewBox(event.target);
      if (!box || !mediaFromBox(box)) return;
      if (box.dataset.touchPreviewConfirmed === '1') return;
      event.preventDefault();
      event.stopPropagation();
      box.dataset.touchPreviewConfirmed = '1';
      playBestTouchPreview(box);
    }, true);

    initTouchScrollPreviews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreviewHydration, { once: true });
  } else {
    initPreviewHydration();
  }
})();

/* ---------- Lazy footer maps ---------- */
(function () {
  'use strict';

  function loadMapFrame(frame) {
    var src = frame && frame.getAttribute('data-src');
    if (!frame || !src || frame.getAttribute('src')) return;
    frame.setAttribute('src', src);
  }

  function initLazyMaps() {
    var frames = Array.prototype.slice.call(document.querySelectorAll('iframe[data-src]'));
    if (!frames.length) return;

    frames.forEach(function (frame) {
      if (frame.dataset.dmMapBound === '1') return;
      frame.dataset.dmMapBound = '1';

      if (!('IntersectionObserver' in window)) {
        loadMapFrame(frame);
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadMapFrame(frame);
          observer.disconnect();
        });
      }, { rootMargin: '700px 0px', threshold: 0.01 });

      observer.observe(frame);

      setTimeout(function () {
        if (!frame.getAttribute('src')) loadMapFrame(frame);
      }, 2500);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyMaps, { once: true });
  } else {
    initLazyMaps();
  }
  window.addEventListener('load', initLazyMaps, { once: true });
})();

/* ---------- Cookie consent for analytics scripts ---------- */
(function () {
  'use strict';

  var CONSENT_KEY = 'dm_cookie_consent_v1';
  var HOTJAR_ID = 6534654;
  var HOTJAR_VERSION = 6;
  var blockedScriptHosts = [
    'static.hotjar.com',
    'script.hotjar.com',
    'googletagmanager.com',
    'google-analytics.com'
  ];

  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function saveConsent(analyticsAllowed) {
    var payload = {
      analytics: Boolean(analyticsAllowed),
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('dm-cookie-consent-change', { detail: payload }));
    return payload;
  }

  function hasAnalyticsConsent() {
    var consent = readConsent();
    return Boolean(consent && consent.analytics === true);
  }

  window.dmHasAnalyticsConsent = hasAnalyticsConsent;

  function isAnalyticsScript(node) {
    if (!node || node.tagName !== 'SCRIPT') return false;
    var src = String(node.src || node.getAttribute('src') || '').toLowerCase();
    return blockedScriptHosts.some(function (host) { return src.indexOf(host) !== -1; });
  }

  function patchScriptInsertion() {
    if (window.__dmCookieScriptPatch) return;
    window.__dmCookieScriptPatch = true;
  }

  function respectsDoNotTrack() {
    try {
      return navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
    } catch (_) {
      return false;
    }
  }

  function loadHotjar() {
    if (window.__dmHotjarLoaded || !hasAnalyticsConsent() || respectsDoNotTrack()) return;
    window.__dmHotjarLoaded = true;

    (function (h, o, t, j, a, r) {
      h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
      h._hjSettings = { hjid: HOTJAR_ID, hjsv: HOTJAR_VERSION };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script');
      r.async = true;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }

  function loadGA4() {
    var GA4_ID = window.DM_GA4_ID || '';
    if (!GA4_ID || window.__dmGA4Loaded || !hasAnalyticsConsent()) return;
    window.__dmGA4Loaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: true });
  }

  window.dmLoadAnalytics = function () {
    loadHotjar();
    loadGA4();
  };

  function injectStyles() {
    if (document.getElementById('dm-cookie-consent-style')) return;
    var style = document.createElement('style');
    style.id = 'dm-cookie-consent-style';
    style.textContent = [
      '.dm-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;display:flex;gap:16px;align-items:center;justify-content:space-between;max-width:980px;margin:0 auto;padding:16px 18px;border:1px solid rgba(15,23,42,.14);border-radius:14px;background:#fff;color:#102033;box-shadow:0 18px 44px rgba(15,23,42,.18);font-family:inherit}',
      '.dm-cookie-banner[hidden]{display:none}',
      '.dm-cookie-text{font-size:14px;line-height:1.45;margin:0}',
      '.dm-cookie-text strong{display:block;margin-bottom:3px;color:#063f3d;font-size:15px}',
      '.dm-cookie-text a{color:#086f83;font-weight:700;text-decoration:underline;text-underline-offset:2px}',
      '.dm-cookie-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;flex:0 0 auto}',
      '.dm-cookie-btn{border:1px solid #c9d6df;border-radius:999px;background:#fff;color:#123;padding:10px 14px;font-weight:700;cursor:pointer;font-size:14px}',
      '.dm-cookie-btn:hover{background:#f3f8fa}',
      '.dm-cookie-btn--primary{background:#0e7c86;border-color:#0e7c86;color:#fff}',
      '.dm-cookie-btn--primary:hover{background:#096670}',
      '.dm-cookie-manage{position:fixed;left:14px;bottom:14px;z-index:99998;border:1px solid #c9d6df;border-radius:999px;background:#fff;color:#123;padding:8px 11px;font-size:12px;font-weight:700;box-shadow:0 8px 22px rgba(15,23,42,.14);cursor:pointer}',
      '.dm-cookie-manage[hidden]{display:none}',
      '@media (max-width:700px){.dm-cookie-banner{left:10px;right:10px;bottom:10px;display:block;padding:14px}.dm-cookie-actions{margin-top:12px;justify-content:stretch}.dm-cookie-btn{flex:1 1 auto}}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildBanner() {
    if (document.getElementById('dm-cookie-banner')) return;
    injectStyles();

    var banner = document.createElement('section');
    banner.id = 'dm-cookie-banner';
    banner.className = 'dm-cookie-banner';
    var isEnglishPage = /^\/en(?:\/|$)/.test(window.location.pathname);
    banner.setAttribute('aria-label', isEnglishPage ? 'Cookie consent' : 'Съгласие за бисквитки');
    banner.hidden = Boolean(readConsent());
    var cookieText = isEnglishPage ? {
      title: 'We use cookies to improve the website',
      body: 'Necessary cookies keep the site working. With your consent, we use analytics tools such as Hotjar to understand which pages are useful and where visitors have difficulty. ',
      privacy: 'Privacy Policy',
      privacyUrl: '/privacy-policy.html',
      reject: 'Necessary only',
      accept: 'Accept',
      manage: 'Cookies'
    } : {
      title: 'Използваме бисквитки за подобряване на сайта',
      body: 'Необходимите бисквитки пазят сайта работещ. С ваше съгласие използваме аналитични инструменти като Hotjar, за да разбираме кои страници са полезни и къде потребителите се затрудняват. ',
      privacy: 'Политика за поверителност',
      privacyUrl: '/privacy-policy.html',
      reject: 'Само необходими',
      accept: 'Приемам',
      manage: 'Бисквитки'
    };
    banner.innerHTML = [
      '<p class="dm-cookie-text">',
      '<strong>' + cookieText.title + '</strong>',
      cookieText.body,
      '<a href="' + cookieText.privacyUrl + '">' + cookieText.privacy + '</a>',
      '</p>',
      '<div class="dm-cookie-actions">',
      '<button class="dm-cookie-btn" type="button" data-dm-cookie-reject>' + cookieText.reject + '</button>',
      '<button class="dm-cookie-btn dm-cookie-btn--primary" type="button" data-dm-cookie-accept>' + cookieText.accept + '</button>',
      '</div>'
    ].join('');

    var manage = document.createElement('button');
    manage.id = 'dm-cookie-manage';
    manage.className = 'dm-cookie-manage';
    manage.type = 'button';
    manage.textContent = cookieText.manage;
    manage.hidden = !readConsent();

    document.body.appendChild(banner);
    document.body.appendChild(manage);

    function closeWithChoice(analyticsAllowed) {
      saveConsent(analyticsAllowed);
      banner.hidden = true;
      manage.hidden = false;
      if (analyticsAllowed) window.dmLoadAnalytics();
    }

    banner.querySelector('[data-dm-cookie-accept]').addEventListener('click', function () {
      closeWithChoice(true);
    });

    banner.querySelector('[data-dm-cookie-reject]').addEventListener('click', function () {
      closeWithChoice(false);
    });

    manage.addEventListener('click', function () {
      banner.hidden = false;
      manage.hidden = true;
    });
  }

  patchScriptInsertion();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildBanner, { once: true });
  } else {
    buildBanner();
  }

  if (hasAnalyticsConsent()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window.dmLoadAnalytics, { once: true });
    } else {
      window.dmLoadAnalytics();
    }
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const MOBILE_MAX = 768;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  /* ---------- SELECTORS ---------- */
  const header   = document.querySelector('.tb-header');
  const burger   = document.querySelector('.tb-burger');
  const nav      = document.querySelector('.tb-nav');

  function ensurePainConditionsDropdown() {
    if (!header || !nav) return;
    const isEnglish = /^\/en(?:\/|$)/.test(window.location.pathname);
    const base = isEnglish ? '/en' : '';
    const items = isEnglish ? [
      ['Head', '/pain-head.html'],
      ['Neck', '/pain-neck.html'],
      ['Shoulder', '/pain-shoulder.html'],
      ['Arm', '/pain-arm.html'],
      ['Chest and abdomen', '/pain-chest-abdomen.html'],
      ['Back', '/pain-back.html'],
      ['Lower back', '/pain-lower-back.html'],
      ['Buttocks and pelvis', '/pain-buttocks-pelvis.html'],
      ['Thigh and knee', '/pain-thigh-knee.html'],
      ['Lower leg and foot', '/pain-lower-leg-ankle.html'],
      ['Neuralgia', '/pain-neuralgia-general.html']
    ] : [
      ['\u0413\u043b\u0430\u0432\u0430', '/pain-head.html'],
      ['\u0412\u0440\u0430\u0442', '/pain-neck.html'],
      ['\u0420\u0430\u043c\u043e', '/pain-shoulder.html'],
      ['\u0420\u044a\u043a\u0430', '/pain-arm.html'],
      ['\u0413\u044a\u0440\u0434\u0438 \u0438 \u043a\u043e\u0440\u0435\u043c', '/pain-chest-abdomen.html'],
      ['\u0413\u0440\u044a\u0431', '/pain-back.html'],
      ['\u041a\u0440\u044a\u0441\u0442', '/pain-lower-back.html'],
      ['\u0422\u0430\u0437 \u0438 \u0441\u0435\u0434\u0430\u043b\u0438\u0449\u0435', '/pain-buttocks-pelvis.html'],
      ['\u0411\u0435\u0434\u0440\u043e \u0438 \u043a\u043e\u043b\u044f\u043d\u043e', '/pain-thigh-knee.html'],
      ['\u041f\u043e\u0434\u0431\u0435\u0434\u0440\u0438\u0446\u0430 \u0438 \u0441\u0442\u044a\u043f\u0430\u043b\u043e', '/pain-lower-leg-ankle.html'],
      ['\u041d\u0435\u0432\u0440\u0430\u043b\u0433\u0438\u0438', '/pain-neuralgia-general.html']
    ];

    const painLink = Array.from(nav.querySelectorAll('.tb-link')).find((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const text = (link.textContent || '').toLowerCase();
      return href.indexOf('pain-conditions') !== -1 || text.indexOf('\u0431\u043e\u043b\u043a\u043e\u0432\u0438') !== -1 || text.indexOf('pain conditions') !== -1;
    });
    const item = painLink && painLink.closest('.tb-item');
    if (!item || item.querySelector('.tb-drop-menu--pain')) return;

    item.classList.add('tb-dropdown');
    painLink.classList.add('tb-drop-toggle');
    painLink.setAttribute('data-dropdown', 'toggle');

    const menu = document.createElement('div');
    menu.className = 'tb-drop-menu tb-drop-menu--pain';
    menu.innerHTML = items.map(([label, href]) => '<a class="tb-drop-link" href="' + base + href + '">' + label + '</a>').join('');
    item.appendChild(menu);
  }
  ensurePainConditionsDropdown();

  function setupHeaderLanguageSwitch() {
    if (!header || document.querySelector('.tb-header-lang')) return;
    const inner = header.querySelector('.tb-inner');
    const menuLang = header.querySelector('.tb-menu > .tb-lang-switch');
    if (!inner || !menuLang) return;

    const headerLang = document.createElement('div');
    headerLang.className = 'tb-header-lang';
    headerLang.setAttribute('aria-label', menuLang.getAttribute('aria-label') || 'Language');

    const links = Array.from(menuLang.querySelectorAll('a'));
    const currentPath = (window.location && window.location.pathname) || '';
    const isEnglish = /^\/en(?:\/|$)/.test(currentPath);
    const activeLink = links.find((link) => link.classList.contains('is-active')) || links.find((link) => {
      const href = link.getAttribute('href') || '';
      return isEnglish ? href.indexOf('/en/') !== -1 : href.indexOf('/en/') === -1;
    }) || links[0];

    function langCode(link) {
      const href = link.getAttribute('href') || '';
      const imgAlt = (link.querySelector('img')?.getAttribute('alt') || '').toLowerCase();
      return href.indexOf('/en/') !== -1 || imgAlt.indexOf('brit') !== -1 || imgAlt.indexOf('english') !== -1 ? 'EN' : 'BG';
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tb-lang-current';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="tb-lang-current__flag">' + (activeLink ? activeLink.innerHTML : '') + '</span><span>' + langCode(activeLink) + '</span><b aria-hidden="true">&#9662;</b>';

    const menu = document.createElement('div');
    menu.className = 'tb-lang-menu';
    links.forEach((link) => {
      const clone = link.cloneNode(true);
      clone.classList.remove('tb-link');
      clone.classList.remove('tb-flag');
      clone.classList.remove('lang-flag');
      clone.classList.add('tb-lang-option');
      clone.insertAdjacentHTML('beforeend', '<span>' + langCode(clone) + '</span>');
      menu.appendChild(clone);
    });

    headerLang.appendChild(button);
    headerLang.appendChild(menu);

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = headerLang.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!headerLang.contains(event.target)) {
        headerLang.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      }
    });

    inner.appendChild(headerLang);

    const mobileLang = headerLang.cloneNode(true);
    mobileLang.classList.add('tb-header-lang--mobile');
    headerLang.classList.add('tb-header-lang--menu');

    const mobileButton = mobileLang.querySelector('.tb-lang-current');
    if (mobileButton) {
      mobileButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = mobileLang.classList.toggle('is-open');
        mobileButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', (event) => {
        if (!mobileLang.contains(event.target)) {
          mobileLang.classList.remove('is-open');
          mobileButton.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const menuList = menuLang.parentNode;
    const bookItem = header.querySelector('.tb-link[href*="/book"]')?.closest('.tb-item');
    if (bookItem && bookItem.parentNode) {
      const langItem = document.createElement('li');
      langItem.className = 'tb-item tb-lang-item';
      langItem.appendChild(headerLang);
      bookItem.parentNode.insertBefore(langItem, bookItem);
    }

    const contactsItem = Array.from(menuList.querySelectorAll('.tb-link')).find((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const text = (link.textContent || '').toLowerCase();
      return href.indexOf('contacts') !== -1 || text.indexOf('контакти') !== -1 || text.indexOf('contacts') !== -1;
    })?.closest('.tb-item');
    const firstUtility = menuList.querySelector('.tb-lang-item') || bookItem;
    if (contactsItem && firstUtility && contactsItem !== firstUtility && contactsItem.parentNode === menuList) {
      menuList.insertBefore(contactsItem, firstUtility);
    }

    menuLang.remove();
    inner.appendChild(mobileLang);
  }
  setupHeaderLanguageSwitch();

  // Hide unfinished "Online plan" entries globally until they are ready.
  function hideUnpublishedLinks() {
    const blockedHrefs = new Set([
      '/online-recovery.html',
      'online-recovery.html',
      '../online-recovery.html'
    ]);

    document.querySelectorAll('a[href]').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (!blockedHrefs.has(href)) return;
      const dropdownItem = a.closest('.tb-drop-item');
      if (dropdownItem) {
        dropdownItem.remove();
        return;
      }
      a.remove();
    });
  }
  hideUnpublishedLinks();

  // Keep booking navigation in the same tab across the site.
  function normalizeBookingLinks() {
    const bookingHrefs = new Set([
      'https://www.dmphysi0.com/book',
      'https://www.dmphysi0.com/book',
      'https://www.dmphysi0.com/book',
      '/book',
      'book'
    ]);

    document.querySelectorAll('a[href]').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (!bookingHrefs.has(href)) return;
      a.setAttribute('href', '/book');
      a.removeAttribute('target');
      a.removeAttribute('rel');
    });
  }
  normalizeBookingLinks();

  function initSiteSearch() {
    if (!header || document.querySelector('.dm-site-search')) return;
    const inner = header.querySelector('.tb-inner');
    if (!inner) return;

    const isEnglish = /^\/en(?:\/|$)/.test(window.location.pathname);
    const copy = isEnglish ? {
      open: 'Search',
      label: 'Search the site',
      placeholder: 'Search the site...',
      submit: 'Search',
      close: 'Close',
      suggestions: 'Suggestions',
      results: 'Search results',
      empty: 'No results found.',
      loading: 'Loading search...',
      error: 'Search is temporarily unavailable.'
    } : {
      open: 'Търси',
      label: 'Търси в сайта',
      placeholder: 'Търси в сайта...',
      submit: 'Търси',
      close: 'Затвори',
      suggestions: 'Предложения',
      results: 'Резултати от търсенето',
      empty: 'Няма намерени резултати.',
      loading: 'Зареждане на търсачката...',
      error: 'Търсачката временно не е достъпна.'
    };

    const trigger = document.createElement('button');
    trigger.className = 'dm-search-trigger dm-search-trigger--menu';
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'dm-site-search-panel');
    trigger.innerHTML = '<span aria-hidden="true">⌕</span><span>' + copy.open + '</span>';

    const bookItem = header.querySelector('.tb-link[href*="/book"]')?.closest('.tb-item');
    const langItem = header.querySelector('.tb-lang-item');
    if (bookItem && bookItem.parentNode) {
      const searchItem = document.createElement('li');
      searchItem.className = 'tb-item tb-search-item';
      searchItem.appendChild(trigger);
      bookItem.parentNode.insertBefore(searchItem, langItem || bookItem);

      const contactsItem = Array.from(bookItem.parentNode.querySelectorAll('.tb-link')).find((link) => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase();
        return href.indexOf('contacts') !== -1 || text.indexOf('контакти') !== -1 || text.indexOf('contacts') !== -1;
      })?.closest('.tb-item');
      if (contactsItem && contactsItem !== searchItem) {
        bookItem.parentNode.insertBefore(contactsItem, searchItem);
      }
    } else {
      const anchor = inner.querySelector('.tb-header-lang') || burger || nav;
      inner.insertBefore(trigger, anchor || null);
    }

    const mobileTrigger = trigger.cloneNode(true);
    mobileTrigger.classList.remove('dm-search-trigger--menu');
    mobileTrigger.classList.add('dm-search-trigger--mobile');
    const mobileLang = inner.querySelector('.tb-header-lang--mobile');
    inner.insertBefore(mobileTrigger, mobileLang || burger || nav || null);

    const panel = document.createElement('section');
    panel.id = 'dm-site-search-panel';
    panel.className = 'dm-site-search';
    panel.hidden = true;
    panel.innerHTML = [
      '<form class="dm-site-search__form" role="search">',
      '<label class="dm-site-search__label" for="dm-site-search-input">' + copy.label + '</label>',
      '<div class="dm-site-search__row">',
      '<input id="dm-site-search-input" type="search" autocomplete="off" placeholder="' + copy.placeholder + '">',
      '<button type="submit">' + copy.submit + '</button>',
      '<button class="dm-site-search__close" type="button" aria-label="' + copy.close + '">×</button>',
      '</div>',
      '</form>',
      '<p class="dm-site-search__status" aria-live="polite"></p>',
      '<div class="dm-site-search__suggestions" role="listbox" aria-label="' + copy.suggestions + '"></div>',
      '<div class="dm-site-search__results" aria-label="' + copy.results + '"></div>'
    ].join('');
    document.body.appendChild(panel);

    const input = panel.querySelector('#dm-site-search-input');
    const form = panel.querySelector('form');
    const close = panel.querySelector('.dm-site-search__close');
    const status = panel.querySelector('.dm-site-search__status');
    const suggestions = panel.querySelector('.dm-site-search__suggestions');
    const results = panel.querySelector('.dm-site-search__results');
    let indexPromise = null;
    let activeSuggestion = -1;
    let lastMatches = [];

    function normalize(value) {
      return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function normalizeQuery(value) {
      return normalize(value)
        .replace(/шишове/g, 'шипове')
        .replace(/\s+/g, ' ')
        .replace(/\s*\|\s*(?:ДМ\s*Физио|DM Physio)(?:\s*\([^)]*\))?(?:\s+София)?\s*$/i, '')
        .replace(/\s*(?:-|–)\s*(?:ДМ\s*Физио|DM Physio)(?:\s*\([^)]*\))?(?:\s+София)?\s*$/i, '')
        .trim();
    }

    function queryTokens(query) {
      const stopWords = new Set(isEnglish
        ? ['a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'with', 'on']
        : ['и', 'или', 'на', 'в', 'с', 'за', 'от', 'до', 'при', 'по', 'към']);
      return normalizeQuery(query).split(/\s+/).filter(function (token) {
        return token.length > 1 && !stopWords.has(token);
      });
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
      });
    }

    function loadIndex() {
      if (!indexPromise) {
        status.textContent = copy.loading;
        indexPromise = fetch('/search-index.json', { credentials: 'same-origin' })
          .then(function (response) {
            if (!response.ok) throw new Error('Search index failed');
            return response.json();
          })
          .then(function (payload) {
            status.textContent = '';
            const seenUrls = new Set();
            return (payload.pages || []).filter(function (page) {
              if (!page || !page.url || seenUrls.has(page.url)) return false;
              seenUrls.add(page.url);
              return page && page.url && !/^\/(?:en\/)?(?:uprazhnenia|biblioteka-uprazhnenia|simptomi|diagnozi|zoni|celi|sesii|programi|trenirovki|individualna-programa|uprazhnenie|trenirovka|programa)\.html/.test(page.url);
            });
          })
          .catch(function () {
            status.textContent = copy.error;
            return [];
          });
      }
      return indexPromise;
    }

    function scorePage(page, query) {
      const q = normalizeQuery(query);
      if (!q) return 0;
      const tokens = queryTokens(query);
      if (!tokens.length && q.length < 3) return 0;
      const title = normalize(page.title);
      const excerpt = normalize(page.excerpt);
      const tags = normalize(page.tags);
      const text = normalize(page.text);
      const haystack = [title, excerpt, tags, text].join(' ');
      const allTokensMatch = tokens.length ? tokens.every(function (token) { return haystack.includes(token); }) : haystack.includes(q);
      const anyTokenMatch = tokens.some(function (token) { return haystack.includes(token); });
      const exactMatch = title.includes(q) || excerpt.includes(q) || text.includes(q) || tags.includes(q);

      if (!exactMatch && !allTokensMatch && !anyTokenMatch) return 0;

      let score = page.locale === (isEnglish ? 'en' : 'bg') ? 8 : 0;
      if (title.includes(q)) score += 240;
      if (excerpt.includes(q)) score += 90;
      if (tags.includes(q)) score += 75;
      if (text.includes(q)) score += 45;
      if (allTokensMatch) score += 70;
      tokens.forEach(function (token) {
        if (title.includes(token)) score += 42;
        if (tags.includes(token)) score += 24;
        if (excerpt.includes(token)) score += 18;
        if (text.includes(token)) score += 4;
      });
      if (!allTokensMatch && tokens.length > 1) score = Math.floor(score * 0.32);
      return score;
    }

    function search(query) {
      return loadIndex().then(function (pages) {
        return pages.map(function (page) {
          return Object.assign({ _score: scorePage(page, query) }, page);
        }).filter(function (page) {
          return page._score > 0;
        }).sort(function (a, b) {
          return b._score - a._score;
        });
      });
    }

    function typeLabel(type) {
      const bg = { condition: 'Ръководство', procedure: 'Процедура', booking: 'Свободни часове', contact: 'Контакт', page: 'Страница', video: 'Видео' };
      const en = { condition: 'Guide', procedure: 'Service', booking: 'Booking', contact: 'Contact', page: 'Page', video: 'Video' };
      return (isEnglish ? en : bg)[type] || type || (isEnglish ? 'Page' : 'Страница');
    }

    function displayTitle(title) {
      return String(title || '')
        .replace(/\s*\|\s*DM Physio(?:\s+София)?\s*$/i, '')
        .replace(/\s*-\s*DM Physio(?:\s+София)?\s*$/i, '')
        .replace(/\s*–\s*DM Physio(?:\s+София)?\s*$/i, '')
        .replace(/\s*\|\s*(?:ДМ\s*Физио|DM Physio)(?:\s*\([^)]*\))?(?:\s+София)?\s*$/i, '')
        .replace(/\s*(?:-|–)\s*(?:ДМ\s*Физио|DM Physio)(?:\s*\([^)]*\))?(?:\s+София)?\s*$/i, '')
        .trim();
    }

    function displayExcerpt(excerpt) {
      return String(excerpt || '')
        .replace(/\s*(?:в|при)\s+DM Physio(?:\s+в)?\s+София/gi, '')
        .replace(/\s*(?:в|при)\s+ДМ\s*Физио(?:\s+в)?\s+София/gi, '')
        .replace(/\s*DM Physio\s+София/gi, '')
        .replace(/\s*ДМ\s*Физио\s+София/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    function pickResultThumb(page, usedThumbs) {
      const fallback = '/pngs/pain-conditions/new/backpain-Thumbnail.webp';
      const candidates = []
        .concat(page.images || [])
        .concat(page.thumbnail || [])
        .concat(fallback)
        .filter(Boolean)
        .filter(function (thumb) { return !/(^|\/)(?:logo|favicon|apple-touch-icon)(?:\.|$)/i.test(thumb); });
      const uniqueCandidates = [];
      const seen = new Set();
      candidates.forEach(function (thumb) {
        const key = String(thumb || '').toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        uniqueCandidates.push(thumb);
      });
      const fresh = uniqueCandidates.find(function (thumb) {
        return !usedThumbs || !usedThumbs.has(String(thumb).toLowerCase());
      });
      const thumb = fresh || uniqueCandidates[0] || fallback;
      if (usedThumbs) usedThumbs.add(String(thumb).toLowerCase());
      return thumb;
    }

    function resultCard(page, usedThumbs) {
      const thumb = pickResultThumb(page, usedThumbs);
      return [
        '<article class="dm-search-card">',
        '<a class="dm-search-card__thumb" href="' + escapeHtml(page.url) + '"><img src="' + escapeHtml(thumb) + '" alt="" loading="lazy"></a>',
        '<div class="dm-search-card__body">',
        '<h3><a href="' + escapeHtml(page.url) + '">' + escapeHtml(displayTitle(page.title)) + '</a></h3>',
        '<p>' + escapeHtml(displayExcerpt(page.excerpt)) + '</p>',
        '<div class="dm-search-card__meta"><span>' + escapeHtml(typeLabel(page.type)) + '</span><span>' + escapeHtml((page.locale || '').toUpperCase()) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function renderSuggestions(matches) {
      activeSuggestion = -1;
      lastMatches = matches.slice(0, 5);
      const usedThumbs = new Set();
      results.innerHTML = '';
      suggestions.innerHTML = lastMatches.map(function (page, index) {
        return resultCard(page, usedThumbs)
          .replace('class="dm-search-card', 'class="dm-search-card dm-search-suggestion-card')
          .replace('<article ', '<article role="option" id="dm-search-option-' + index + '" ');
      }).join('');
      const query = input.value.trim();
      status.textContent = lastMatches.length ? (isEnglish ? matches.length + ' results for "' + query + '"' : matches.length + ' резултата за „' + query + '“') : copy.empty;
    }

    function renderResults(matches, query) {
      suggestions.innerHTML = '';
      const visible = matches.slice(0, 24);
      const usedThumbs = new Set();
      status.textContent = visible.length ? (isEnglish ? visible.length + ' results for "' + query + '"' : visible.length + ' резултата за „' + query + '“') : copy.empty;
      results.innerHTML = visible.map(function (page) { return resultCard(page, usedThumbs); }).join('');
    }

    function renderDefaultResults(pages) {
      if (input.value.trim()) return;
      const defaultUrls = isEnglish
        ? ['/en/sustiqnia/neck-diskova.html', '/en/pain-arm.html']
        : ['/sustiqnia/neck-diskova.html', '/pain-arm.html'];
      const defaults = defaultUrls.map(function (url) {
        return pages.find(function (page) { return page.url === url; });
      }).filter(Boolean);
      const usedThumbs = new Set();
      suggestions.innerHTML = '';
      status.textContent = defaults.length ? (isEnglish ? 'Suggested pages' : 'Препоръчани страници') : '';
      results.innerHTML = defaults.map(function (page) { return resultCard(page, usedThumbs); }).join('');
    }

    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      mobileTrigger.setAttribute('aria-expanded', 'true');
      setTimeout(function () { input.focus(); }, 20);
      loadIndex().then(renderDefaultResults);
    }

    function closePanel() {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      mobileTrigger.setAttribute('aria-expanded', 'false');
      suggestions.innerHTML = '';
      results.innerHTML = '';
      status.textContent = '';
    }

    function updateActive(delta) {
      const items = Array.prototype.slice.call(suggestions.querySelectorAll('.dm-search-suggestion-card'));
      if (!items.length) return;
      activeSuggestion = (activeSuggestion + delta + items.length) % items.length;
      items.forEach(function (item, index) {
        item.classList.toggle('is-active', index === activeSuggestion);
      });
      const link = items[activeSuggestion].querySelector('a[href]');
      if (link) link.focus();
    }

    let timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      const query = input.value.trim();
      if (query.length < 2) {
        suggestions.innerHTML = '';
        results.innerHTML = '';
        loadIndex().then(renderDefaultResults);
        return;
      }
      timer = setTimeout(function () {
        search(query).then(renderSuggestions);
      }, 130);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        updateActive(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        updateActive(-1);
      } else if (event.key === 'Escape') {
        closePanel();
        trigger.focus();
      }
    });

    suggestions.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        updateActive(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        updateActive(-1);
      } else if (event.key === 'Escape') {
        closePanel();
        trigger.focus();
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      search(query).then(function (matches) {
        renderResults(matches, query);
      });
    });

    trigger.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    mobileTrigger.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    close.addEventListener('click', closePanel);

    document.addEventListener('click', function (event) {
      if (panel.hidden) return;
      if (panel.contains(event.target) || trigger.contains(event.target) || mobileTrigger.contains(event.target)) return;
      closePanel();
    });
  }
  initSiteSearch();

  /* ---------- SCROLL BEHAVIOR ----------
     - ��� y > 0 -> ����� ��������� (rgba 0.4)
     - ��� y === 0 -> ������� ������
  -------------------------------------- */
  function applyHeaderBg(){
    if (!header) return;
    const y = window.scrollY || 0;
    if (y > 0) {
      header.classList.add('tb--transparent');
    } else {
      header.classList.remove('tb--transparent');
    }
  }

  // init + on scroll (� rAF)
  let ticking = false;
  function onScroll(){
    if (!ticking){
      window.requestAnimationFrame(() => {
        applyHeaderBg();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  applyHeaderBg();

  /* ---------- MOBILE: burger toggle ---------- */
  function closeMobileMenu(){
    nav?.classList.remove('tb-nav--open');
    document.body.classList.remove('tb-no-scroll');
    // ��������� � ������ �������� dropdown-�
    document.querySelectorAll('.tb-dropdown.tb-open').forEach(li => li.classList.remove('tb-open'));
    burger?.setAttribute('aria-expanded', 'false');
  }
  function toggleMobileMenu(){
    if (!nav) return;
    const open = nav.classList.toggle('tb-nav--open');
    document.body.classList.toggle('tb-no-scroll', open);
    burger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger?.addEventListener('click', () => {
    if (!isMobile()) return;
    toggleMobileMenu();
  });

  // ��������� ��� ���� �����
  document.addEventListener('click', (e) => {
    if (!isMobile() || !nav) return;
    const target = e.target;
    const inside = nav.contains(target) || burger.contains(target);
    if (!inside && nav.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // ESC closes the mobile menu.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile() && nav?.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // Clear mobile menu state on desktop resize.
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileMenu();
  });

  /* ---------- Mobile dropdown toggle ---------- */
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest?.('.tb-drop-toggle');
    if (!toggle || !nav?.contains(toggle) || !isMobile()) return;
    const li = toggle.closest('.tb-dropdown');
    const menu = li?.querySelector('.tb-drop-menu');
    if (!li || !menu) return;
    event.preventDefault();
    event.stopPropagation();
    nav.querySelectorAll('.tb-dropdown.tb-open').forEach((item) => {
      if (item !== li) item.classList.remove('tb-open');
    });
    li.classList.toggle('tb-open');
  }, true);

  nav?.querySelectorAll('.tb-drop-toggle').forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      if (!isMobile()) return;
      const li = toggle.closest('.tb-dropdown');
      const menu = li?.querySelector('.tb-drop-menu');
      if (!li || !menu) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      nav.querySelectorAll('.tb-dropdown.tb-open').forEach((item) => {
        if (item !== li) item.classList.remove('tb-open');
      });
      li.classList.toggle('tb-open');
    });
  });

  nav?.addEventListener('click', (event) => {
    const toggle = event.target.closest?.('.tb-drop-toggle');
    if (!toggle || !nav.contains(toggle) || !isMobile()) return;
    const li = toggle.closest('.tb-dropdown');
    const menu = li?.querySelector('.tb-drop-menu');
    if (!li || !menu) return;
    event.preventDefault();
    event.stopPropagation();
    nav.querySelectorAll('.tb-dropdown.tb-open').forEach((item) => {
      if (item !== li) item.classList.remove('tb-open');
    });
    li.classList.toggle('tb-open');
  });

  /* ---------- Close mobile menu after real navigation ---------- */  nav?.querySelectorAll('.tb-link, .tb-drop-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile() && link.classList.contains('tb-drop-toggle')) return;
      if (isMobile() && nav.classList.contains('tb-nav--open')) {
        closeMobileMenu();
      }
    });
  });
});
/* ---------- Mapless footer content ---------- */
(function () {
  'use strict';

  function injectFooterStyles() {
    if (document.getElementById('dm-compact-footer-style')) return;
    var style = document.createElement('style');
    style.id = 'dm-compact-footer-style';
    style.textContent = [
      'footer .dm-footer-mapless .contact-container{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:40px;align-items:start}',
      'footer .dm-footer-mapless__col{min-width:0;text-align:left}',
      'footer .dm-footer-mapless h2,footer .dm-footer-mapless h3{margin:0 0 14px;color:inherit;font-size:1.12rem;font-weight:800;line-height:1.25}',
      'footer .dm-footer-mapless a{color:#0b4f63;text-decoration:none}',
      'footer .dm-footer-mapless a:hover,footer .dm-footer-mapless a:focus-visible{color:#0e9f6e;text-decoration:underline;text-underline-offset:3px}',
      'footer .dm-footer-mapless p{margin:0 0 10px;line-height:1.55}',
      'footer .dm-footer-mapless__muted{opacity:.86}',
      'footer .dm-footer-mapless__contact{display:grid;gap:5px;margin:12px 0 0;font-style:normal}',
      'footer .dm-footer-mapless__contacts{display:grid;gap:8px;font-style:normal}',
      'footer .dm-footer-mapless__contacts .contact-item{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px;align-items:start;margin-bottom:0;padding:3px 0}',
      'footer .dm-footer-mapless__icon{width:22px;height:22px;color:#0e9f6e;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round;margin-top:3px}',
      'footer .dm-footer-mapless__contacts .contact-item.phone span{font-size:1.06rem;line-height:1.35;letter-spacing:0}',
      'footer .dm-footer-mapless__phone-list{display:grid;gap:2px}',
      'footer .dm-footer-mapless__phone-list a{font-weight:800}',
      'footer .dm-footer-mapless__contacts .email-item a{font-size:.95rem;word-break:normal;overflow-wrap:anywhere}',
      'footer .dm-footer-mapless__social-col{display:grid;align-content:start}',
      'footer .dm-footer-mapless__quicklinks{display:grid;gap:6px;margin:0 0 12px;padding:0;list-style:none}',
      'footer .dm-footer-mapless__links{display:grid;gap:7px;margin:0;padding:0;list-style:none}',
      'footer .dm-footer-mapless .social-links{justify-content:flex-start;margin-top:12px;gap:8px}',
      'footer .dm-footer-mapless .social-links img{width:34px!important;height:34px!important;object-fit:contain;display:block}',
      'footer .dm-footer-mapless .footer-links{border-top:1px solid rgba(15,23,42,.12);padding-top:16px}',
      'footer .dm-footer-mapless__legal{display:inline-flex;gap:6px 10px;flex-wrap:wrap;justify-content:center}',
      'footer .dm-footer-mapless .map-link::after{content:"↗"}',
      '@media (prefers-color-scheme:dark){footer .dm-footer-mapless a{color:#d8f7ff}footer .dm-footer-mapless a:hover,footer .dm-footer-mapless a:focus-visible{color:#20e6a4}footer .dm-footer-mapless__icon{color:#20e6a4}}',
      '@media (max-width:1024px){footer .dm-footer-mapless .contact-container{grid-template-columns:repeat(2,minmax(0,1fr))}footer .dm-footer-mapless__col{order:initial!important}}',
      '@media (max-width:768px){footer .dm-footer-mapless .contact-container{grid-template-columns:1fr;gap:22px}footer .dm-footer-mapless .social-links img{width:34px!important;height:34px!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function icon(name) {
    var paths = {
      phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.91.32 1.8.59 2.65a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6.27 6.27l1.25-1.25a2 2 0 0 1 2.11-.45c.85.27 1.74.47 2.65.59A2 2 0 0 1 22 16.92z"></path>',
      mapPin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>'
    };
    return '<svg class="dm-footer-mapless__icon" viewBox="0 0 24 24" aria-hidden="true">' + paths[name] + '</svg>';
  }

  function socialLinks() {
    return [
      '<nav class="social-links" aria-label="Социални профили">',
      '<a href="https://www.facebook.com/dmphysio03" target="_blank" rel="noopener" aria-label="Facebook"><img src="/pngs/social/facebook.png" alt="" width="22" height="22" loading="lazy" decoding="async"></a>',
      '<a href="https://www.instagram.com/dm.physio/" target="_blank" rel="noopener" aria-label="Instagram"><img src="/pngs/social/instagram.png" alt="" width="22" height="22" loading="lazy" decoding="async"></a>',
      '<a href="https://www.youtube.com/@dmphysio3352" target="_blank" rel="noopener" aria-label="YouTube"><img src="/pngs/social/Youtube.png" alt="" width="22" height="22" loading="lazy" decoding="async"></a>',
      '<a href="https://www.tiktok.com/@dmphysio" target="_blank" rel="noopener" aria-label="TikTok"><img src="/pngs/social/tiktok.png" alt="" width="22" height="22" loading="lazy" decoding="async"></a>',
      '</nav>'
    ].join('');
  }

  function buildBulgarianFooter() {
    return [
      '<section class="contact-section dm-footer-mapless" aria-label="Footer">',
      '<div class="contact-container">',
      '<div class="contact-left dm-footer-mapless__col dm-footer-mapless__social-col">',
      '<h2>Свържете се с нас:</h2>',
      '<ul class="dm-footer-mapless__quicklinks">',
      '<li><a href="/contacts.html">Контакти</a></li>',
      '<li><a href="https://www.dmphysi0.com/book" rel="noopener">Запазете час</a></li>',
      '</ul>',
      socialLinks(),
      '</div>',
      '<nav class="contact-center dm-footer-mapless__col" aria-label="Болка и състояния"><h3>Болка и състояния</h3><ul class="dm-footer-mapless__links">',
      '<li><a href="/pain-lower-back.html">Болка в кръста</a></li>',
      '<li><a href="/pain-neck.html">Болка във врата</a></li>',
      '<li><a href="/pain-head.html">Главоболие и тил</a></li>',
      '<li><a href="/pain-shoulder.html">Болка в рамото</a></li>',
      '<li><a href="/pain-thigh-knee.html">Бедро и коляно</a></li>',
      '<li><a href="/pain-arm.html">Ръка, лакът и китка</a></li>',
      '</ul></nav>',
      '<nav class="contact-right dm-footer-mapless__col" aria-label="Процедури"><h3>Процедури</h3><ul class="dm-footer-mapless__links">',
      '<li><a href="/procedures/functional-assessment.html">Функционална оценка</a></li>',
      '<li><a href="/procedures/details-kinesitherapy.html">Кинезитерапевтична процедура</a></li>',
      '<li><a href="/procedures/manual-therapy.html">Мануална терапия</a></li>',
      '<li><a href="/procedures/lecheben-masaj.html">Лечебен масаж</a></li>',
      '<li><a href="/procedures/specialized-exercises.html">Специализирани упражнения</a></li>',
      '</ul></nav>',
      '<address class="dm-footer-mapless__col dm-footer-mapless__contacts" aria-label="Контакти">',
      '<h3>Контакти</h3>',
      '<div class="contact-item phone">' + icon('phone') + '<span class="dm-footer-mapless__phone-list"><a href="tel:+359883688414">088 368 8414</a><a href="tel:+359876600498">087 660 0498</a></span></div>',
      '<div class="contact-item address-item">' + icon('mapPin') + '<span>София, ул. „Проф. Христо Данов“ 19<br><a class="map-link" href="https://maps.app.goo.gl/QsERnvvAdoY1nRXp6?g_st=ipc" target="_blank" rel="noopener">Вижте на карта</a></span></div>',
      '<div class="contact-item email-item">' + icon('mail') + '<span><a href="mailto:dmphysio369@gmail.com">dmphysio369@gmail.com</a></span></div>',
      '</address>',
      '</div>',
      '<div class="footer-links">',
      '<span>© 2026 DM Physio. Всички права запазени.</span>',
      '<span class="dm-footer-mapless__legal"><a href="/privacy-policy.html">Поверителност</a><span>·</span><a href="/terms.html">Условия</a><span>·</span><a href="/privacy-policy.html#cookies">Бисквитки</a><span>·</span><a href="/">BG</a><span>|</span><a href="/en/index.html">EN</a></span>',
      '</div>',
      '</section>'
    ].join('');
  }

  function initCompactFooter() {
    var footer = document.querySelector('footer.footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'footer';
      document.body.appendChild(footer);
    }
    if (footer.dataset.dmCompactFooter === '1') return;
    footer.dataset.dmCompactFooter = '1';
    injectFooterStyles();
    footer.innerHTML = buildBulgarianFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompactFooter, { once: true });
  } else {
    initCompactFooter();
  }
})();
/* ---------- Deferred Recommendations Script Loader ---------- */
(function () {
  'use strict';

  var loaded = false;
  function loadRecommendationsScript() {
    if (loaded || window.__dmRecoScriptLoaded) return;
    loaded = true;
    window.__dmRecoScriptLoaded = true;

    var s = document.createElement('script');
    s.src = '/js/topbar-recommendations.js';
    s.defer = true;
    s.async = true;
    document.head.appendChild(s);
  }

  function scheduleLoad() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadRecommendationsScript, { timeout: 3200 });
    } else {
      setTimeout(loadRecommendationsScript, 1800);
    }
  }

  function initDeferredRecommendations() {
    var container = document.getElementById('conditions-container');
    if (!container) return;

    var currentPath = (window.location && window.location.pathname) || '/';
    var isHome = currentPath === '/' || currentPath === '/index.html';
    if (!isHome) {
      scheduleLoad();
      return;
    }

    var target = document.getElementById('random-conditions') || container;
    if (!('IntersectionObserver' in window)) {
      scheduleLoad();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        scheduleLoad();
      }
    }, { rootMargin: '280px 0px' });

    io.observe(target);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeferredRecommendations, { once: true });
  } else {
    initDeferredRecommendations();
  }
})();
