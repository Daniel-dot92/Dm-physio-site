document.addEventListener('DOMContentLoaded', function () {
  var calendlyButtons = document.querySelectorAll('.calendly-button');
  calendlyButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var calendlyUrl = this.dataset.calendlyUrl;
      if (calendlyUrl) {
        window.location.assign(calendlyUrl);
      } else {
        console.error('No Calendly URL defined for this button.');
      }
    });
  });

  var MEDIA_BOX_SELECTOR = [
    '.image-container',
    '.muscle-video-centered',
    '.kinesitherapy-button-media',
    '.hernia-step-media',
    '.dt-media',
    '.pain-button-media',
    '.journey-image',
    '.card__media',
    '.media-square',
    '.video-container'
  ].join(', ');

  var STATIC_SELECTOR = [
    '.static-img',
    '.static-muscle-img',
    '.kinesitherapy-img',
    '.static-hernia-img',
    '.dt-media__img',
    'img:not(.dm-video-placeholder):not(.hover-video):not(.kinesitherapy-video):not(.hover-muscle-video):not(.hover-hernia-video)'
  ].join(', ');

  var PREVIEW_SELECTOR = [
    'video[data-dm-preview-key]',
    'video[data-dm-preview-src]',
    'video[data-src]',
    '.dm-video-placeholder[data-dm-preview-key]',
    '.dm-video-placeholder[data-dm-preview-src]',
    'img[data-dm-preview-key]',
    'img[data-dm-preview-src]'
  ].join(', ');

  var mql = window.matchMedia('(hover: none) and (pointer: coarse)');
  var isMobile = mql.matches;
  var items = [];
  var activeItem = null;
  var io = null;
  var mobileScrollStarted = false;

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
    } catch (e) {
      return '';
    }
  }

  function primeVideo(video) {
    if (!video || video.tagName !== 'VIDEO') return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'metadata';
    video.controls = false;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
  }

  function hydrateVideo(video) {
    if (!video || video.tagName !== 'VIDEO') return null;
    primeVideo(video);
    if (video.dataset.dmPreviewHydrated === '1') return video;

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
    try { video.load(); } catch (e) {}
    return video;
  }

  function createVideoFromPlaceholder(placeholder) {
    if (!placeholder) return null;
    if (placeholder.tagName === 'VIDEO') return hydrateVideo(placeholder);

    if (placeholder.dataset.dmPreviewVideoId) {
      return hydrateVideo(document.getElementById(placeholder.dataset.dmPreviewVideoId));
    }

    var preview = getPreviewSrc(placeholder);
    if (!preview) return null;

    var video = document.createElement('video');
    var id = 'dm-preview-video-' + Math.random().toString(36).slice(2);
    var className = (placeholder.getAttribute('class') || '')
      .replace(/\bdm-video-placeholder\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    var poster = placeholder.getAttribute('data-dm-preview-poster') ||
      placeholder.getAttribute('src') ||
      placeholder.getAttribute('poster') ||
      '';

    video.id = id;
    video.className = className || 'hover-video';
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

    return hydrateVideo(video);
  }

  function ensureVideo(item) {
    if (!item) return null;
    if (item.video && item.video.tagName === 'VIDEO') return hydrateVideo(item.video);
    item.video = createVideoFromPlaceholder(item.preview);
    return item.video;
  }

  function reveal(item) {
    if (!item) return;
    var video = ensureVideo(item);
    if (!video) return;

    if (item.staticImg) item.staticImg.style.setProperty('opacity', '0', 'important');
    video.style.setProperty('opacity', '1', 'important');
    video.style.setProperty('visibility', 'visible', 'important');
    video.style.setProperty('pointer-events', 'none', 'important');
    item.box.classList.add('video-ready');
    item.box.dataset.playing = '1';
  }

  function conceal(item, resetTime) {
    if (!item) return;
    var video = item.video;
    if (video && typeof video.pause === 'function') {
      try { video.pause(); } catch (e) {}
      if (resetTime) {
        try { video.currentTime = 0; } catch (e) {}
      }
      video.style.setProperty('opacity', '0', 'important');
    }
    if (item.staticImg) item.staticImg.style.setProperty('opacity', '1', 'important');
    delete item.box.dataset.playing;
    if (activeItem === item) activeItem = null;
  }

  function playItem(item) {
    if (!item) return;

    items.forEach(function (other) {
      if (other !== item) conceal(other, false);
    });

    reveal(item);
    var video = item.video;
    if (!video || typeof video.play !== 'function') return;

    function start() {
      try {
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute('muted', '');
        var played = video.play();
        if (played && typeof played.catch === 'function') played.catch(function () {});
      } catch (e) {}
    }

    start();
    if (video.readyState < 2) {
      var onData = function () {
        video.removeEventListener('loadeddata', onData);
        if (activeItem === item && video.paused) start();
      };
      video.addEventListener('loadeddata', onData, { once: true });
      try { video.load(); } catch (e) {}
    }

    activeItem = item;
  }

  function buildItem(box) {
    if (!box || box.dataset.dmMobilePreviewBound === '1') return null;
    var preview = box.querySelector(PREVIEW_SELECTOR);
    if (!preview) return null;

    var staticImg = box.querySelector(STATIC_SELECTOR);
    var video = preview.tagName === 'VIDEO' ? preview : null;

    box.dataset.dmMobilePreviewBound = '1';
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    if (getComputedStyle(box).overflow === 'visible') box.style.overflow = 'hidden';

    if (staticImg) {
      staticImg.style.transition = staticImg.style.transition || 'opacity .24s ease';
    }

    if (video) {
      primeVideo(video);
      video.style.transition = video.style.transition || 'opacity .24s ease';
      video.style.setProperty('opacity', '0', 'important');
    }

    return { box: box, preview: preview, staticImg: staticImg, video: video, ratio: 0 };
  }

  function scan() {
    items = [];
    document.querySelectorAll(MEDIA_BOX_SELECTOR).forEach(function (box) {
      var item = buildItem(box);
      if (item) items.push(item);
    });
  }

  function bestVisibleItem() {
    var visible = items
      .filter(function (item) { return item.ratio >= 0.45; })
      .sort(function (a, b) { return b.ratio - a.ratio; });
    return visible[0] || null;
  }

  function measureVisibility(item) {
    if (!item || !item.box) return 0;
    var rect = item.box.getBoundingClientRect();
    var viewportH = window.innerHeight || document.documentElement.clientHeight || 1;
    var viewportW = window.innerWidth || document.documentElement.clientWidth || 1;
    if (rect.width <= 0 || rect.height <= 0) return 0;

    var visibleX = Math.max(0, Math.min(rect.right, viewportW) - Math.max(rect.left, 0));
    var visibleY = Math.max(0, Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0));
    return (visibleX * visibleY) / (rect.width * rect.height);
  }

  function refreshMeasuredRatios() {
    items.forEach(function (item) {
      item.ratio = measureVisibility(item);
    });
  }

  function activateBestVisible() {
    if (!isMobile || !mobileScrollStarted) return;
    var best = bestVisibleItem();
    if (best) {
      if (activeItem !== best || !best.video || best.video.paused) playItem(best);
    } else if (activeItem) {
      conceal(activeItem, false);
    }
  }

  function observeAll() {
    if (!isMobile || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var item = items.find(function (candidate) { return candidate.box === entry.target; });
        if (item) item.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      window.requestAnimationFrame(activateBestVisible);
    }, {
      root: null,
      rootMargin: '-8% 0px -12% 0px',
      threshold: [0, 0.25, 0.45, 0.55, 0.7, 0.85, 1]
    });

    items.forEach(function (item) { io.observe(item.box); });
  }

  function unobserveAll() {
    if (io) {
      io.disconnect();
      io = null;
    }
    items.forEach(function (item) { conceal(item, false); item.ratio = 0; });
  }

  function bindDesktopHover() {
    items.forEach(function (item) {
      if (item.box.dataset.dmDesktopPreviewBound === '1') return;
      item.box.dataset.dmDesktopPreviewBound = '1';

      item.box.addEventListener('mouseenter', function () {
        if (isMobile) return;
        playItem(item);
      }, { passive: true });

      item.box.addEventListener('mouseleave', function () {
        if (isMobile) return;
        conceal(item, true);
      }, { passive: true });
    });
  }

  function configure() {
    unobserveAll();
    isMobile = mql.matches || window.innerWidth <= 768;
    mobileScrollStarted = false;
    scan();
    bindDesktopHover();
    if (isMobile) observeAll();
  }

  function beginMobileScrollPlayback() {
    if (!isMobile) return;
    mobileScrollStarted = true;
    refreshMeasuredRatios();
    activateBestVisible();
    window.setTimeout(function () {
      refreshMeasuredRatios();
      activateBestVisible();
    }, 80);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) items.forEach(function (item) { conceal(item, false); });
  }, { passive: true });

  window.addEventListener('pagehide', function () {
    items.forEach(function (item) { conceal(item, false); });
  }, { passive: true });

  window.addEventListener('resize', configure, { passive: true });
  window.addEventListener('scroll', beginMobileScrollPlayback, { passive: true });
  window.addEventListener('touchmove', beginMobileScrollPlayback, { passive: true });
  window.addEventListener('wheel', beginMobileScrollPlayback, { passive: true });
  if (mql.addEventListener) {
    mql.addEventListener('change', configure);
  } else if (mql.addListener) {
    mql.addListener(configure);
  }

  configure();
});
