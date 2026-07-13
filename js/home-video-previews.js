(function () {
  'use strict';

  if (!document.body || !document.querySelector('.tb-header--home-left-nav')) return;

  var BOX_SELECTOR = '.pain-button-media.image-container';
  var MEDIA_SELECTOR = '.dm-video-placeholder[data-dm-preview-key], .dm-video-placeholder[data-dm-preview-src], video[data-dm-preview-key], video[data-dm-preview-src], video[data-src]';
  var activeVideo = null;
  var cards = [];

  function isTouchMode() {
    return window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  function previewSrc(node) {
    if (!node) return '';
    var direct = node.getAttribute('data-src') || node.getAttribute('data-dm-preview-src');
    if (direct) return direct;
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

  function applyLayerStyle(el) {
    el.style.position = 'absolute';
    el.style.inset = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.objectFit = 'cover';
    el.style.objectPosition = 'center';
    el.style.transition = 'opacity .24s ease';
  }

  function ensureVideo(box) {
    var currentVideo = box.querySelector('video.dm-home-preview-video');
    if (currentVideo) return currentVideo;

    var media = box.querySelector(MEDIA_SELECTOR);
    if (!media) return null;
    if (media.tagName === 'VIDEO') {
      media.classList.add('dm-home-preview-video');
      return media;
    }

    var src = previewSrc(media);
    if (!src) return null;

    var video = document.createElement('video');
    video.className = 'hover-img dm-home-preview-video';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
    video.setAttribute('poster', media.getAttribute('data-dm-preview-poster') || media.getAttribute('src') || '');
    video.src = src;
    applyLayerStyle(video);
    video.style.opacity = '0';

    media.style.display = 'none';
    media.insertAdjacentElement('afterend', video);
    return video;
  }

  function primeBox(box) {
    if (box.dataset.dmHomeVideoBound === '1') return null;
    var staticImg = box.querySelector('.static-img');
    var video = ensureVideo(box);
    if (!staticImg || !video) return null;

    box.dataset.dmHomeVideoBound = '1';
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    box.style.overflow = 'hidden';
    applyLayerStyle(staticImg);
    applyLayerStyle(video);
    staticImg.style.opacity = '1';
    video.style.opacity = '0';

    var card = { box: box, image: staticImg, video: video };

    box.addEventListener('pointerenter', function () {
      if (!isTouchMode()) playCard(card);
    }, { passive: true });
    box.addEventListener('pointerleave', function () {
      if (!isTouchMode()) pauseCard(card);
    }, { passive: true });

    return card;
  }

  function cardFromTarget(target) {
    var box = target && target.closest && target.closest(BOX_SELECTOR);
    if (!box) return null;
    return cards.find(function (card) { return card.box === box; }) || null;
  }

  function isLeavingBox(event, box) {
    var next = event.relatedTarget;
    return !next || (next !== box && !(box.contains && box.contains(next)));
  }

  function playCard(card) {
    if (!card || !card.video) return;
    if (activeVideo && activeVideo !== card.video) {
      var previous = cards.find(function (item) { return item.video === activeVideo; });
      pauseCard(previous);
    }
    activeVideo = card.video;
    card.box.classList.add('is-playing');
    card.image.style.opacity = '0';
    card.video.style.opacity = '1';
    try {
      card.video.muted = true;
      card.video.setAttribute('muted', '');
      card.video.setAttribute('playsinline', '');
      var played = card.video.play();
      if (played && typeof played.catch === 'function') played.catch(function () {});
    } catch (_) {}
  }

  function pauseCard(card) {
    if (!card || !card.video) return;
    try {
      card.video.pause();
      card.video.currentTime = 0;
    } catch (_) {}
    card.box.classList.remove('is-playing');
    card.video.style.opacity = '0';
    card.image.style.opacity = '1';
    if (activeVideo === card.video) activeVideo = null;
  }

  function visibleRatio(el) {
    var rect = el.getBoundingClientRect();
    var width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    var height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    var area = rect.width * rect.height;
    return area ? (width * height) / area : 0;
  }

  function playBestVisible() {
    var best = null;
    var bestRatio = 0;
    cards.forEach(function (card) {
      var ratio = visibleRatio(card.box);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = card;
      }
    });
    if (best && bestRatio >= 0.18) {
      playCard(best);
    } else if (activeVideo) {
      cards.forEach(pauseCard);
    }
  }

  function init() {
    cards = Array.prototype.map.call(document.querySelectorAll(BOX_SELECTOR), primeBox).filter(Boolean);
    if (!cards.length) return;

    document.addEventListener('pointerover', function (event) {
      if (isTouchMode()) return;
      var card = cardFromTarget(event.target);
      if (card) playCard(card);
    }, true);

    document.addEventListener('mouseover', function (event) {
      if (isTouchMode()) return;
      var card = cardFromTarget(event.target);
      if (card) playCard(card);
    }, true);

    document.addEventListener('pointerout', function (event) {
      if (isTouchMode()) return;
      var card = cardFromTarget(event.target);
      if (card && isLeavingBox(event, card.box)) pauseCard(card);
    }, true);

    document.addEventListener('mouseout', function (event) {
      if (isTouchMode()) return;
      var card = cardFromTarget(event.target);
      if (card && isLeavingBox(event, card.box)) pauseCard(card);
    }, true);

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function () {
        playBestVisible();
      }, { threshold: [0, 0.25, 0.45, 0.65, 0.85, 1], rootMargin: '-8% 0px -20% 0px' });
      cards.forEach(function (card) { observer.observe(card.box); });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        playBestVisible();
      });
    }, { passive: true });

    window.addEventListener('pagehide', function () { cards.forEach(pauseCard); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cards.forEach(pauseCard);
    }, { passive: true });

    setTimeout(playBestVisible, 250);
    setInterval(function () {
      if (document.hidden) return;
      playBestVisible();
    }, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
