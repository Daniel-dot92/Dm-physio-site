// Temporary gate: keep unfinished online plan pages unavailable in production.
(function () {
  'use strict';
  var blockedPaths = new Set([
    '/online-recovery.html'
  ]);
  var currentPath = (window.location && window.location.pathname) || '';
  if (blockedPaths.has(currentPath)) {
    window.location.replace('/services.html');
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

  function getPreviewSrc(video) {
    var preview = video.getAttribute('data-dm-preview-src');
    if (preview) return preview;
    var key = video.getAttribute('data-dm-preview-key');
    if (!key) return '';
    try {
      var normalized = key.replace(/-/g, '+').replace(/_/g, '/');
      normalized += '='.repeat((4 - normalized.length % 4) % 4);
      return decodeURIComponent(escape(atob(normalized)));
    } catch (_) {
      return '';
    }
  }

  function hydrateFromTarget(target) {
    var box = target && target.closest && target.closest('.image-container, .pain-button-media, .kinesitherapy-button-media, .muscle-video-centered, .hernia-step-media, .journey-image, .card__media');
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('video'), hydratePreviewVideo);
  }

  function initPreviewHydration() {
    document.addEventListener('pointerenter', function (event) {
      hydrateFromTarget(event.target);
    }, true);
    document.addEventListener('focusin', function (event) {
      hydrateFromTarget(event.target);
    }, true);
    document.addEventListener('touchstart', function (event) {
      hydrateFromTarget(event.target);
    }, { passive: true, capture: true });
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

    var originalAppendChild = Node.prototype.appendChild;
    var originalInsertBefore = Node.prototype.insertBefore;

    Node.prototype.appendChild = function (node) {
      if (isAnalyticsScript(node) && !hasAnalyticsConsent()) {
        return node;
      }
      return originalAppendChild.call(this, node);
    };

    Node.prototype.insertBefore = function (node, referenceNode) {
      if (isAnalyticsScript(node) && !hasAnalyticsConsent()) {
        return node;
      }
      return originalInsertBefore.call(this, node, referenceNode);
    };
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
  const dropToggles = document.querySelectorAll('.tb-drop-toggle');

  function setupHeaderLanguageSwitch() {
    if (!header || document.querySelector('.tb-header-lang')) return;
    const inner = header.querySelector('.tb-inner');
    const menuLang = header.querySelector('.tb-menu > .tb-lang-switch');
    if (!inner || !menuLang) return;

    const headerLang = document.createElement('div');
    headerLang.className = 'tb-header-lang';
    headerLang.setAttribute('aria-label', menuLang.getAttribute('aria-label') || 'Language');

    menuLang.querySelectorAll('a').forEach((link) => {
      const clone = link.cloneNode(true);
      clone.classList.remove('tb-link');
      headerLang.appendChild(clone);
    });

    inner.insertBefore(headerLang, burger || nav);
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

  // ESC �������
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile() && nav?.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // ��� resize ��� ������� ������ ��������� ���������
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileMenu();
  });

  /* ---------- MOBILE: dropdown toggle ---------- */
/* �� ������� �� ������ ��������. ����������� ������ �� ��������. */
if (dropToggles.length){
  dropToggles.forEach(a => {
    a.addEventListener('click', (e) => {
      // ��� � �������: �� ������ ���� (�� preventDefault), ����������� �������� �� href
      if (isMobile()) return;

      // �� ������� ������ ��������� ��� hover/click ��� �� �����
      if (a.dataset.dropdown === 'toggle'){
        // �� ������� ����� �� ������� ���� ���� �� �������-����
        // e.preventDefault();
        const li = a.closest('.tb-dropdown');
        if (!li) return;
        document.querySelectorAll('.tb-dropdown.tb-open').forEach(x => { if (x !== li) x.classList.remove('tb-open'); });
        li.classList.toggle('tb-open');
      }
    });
  });
}


  /* ---------- CLICK �� ����: �� ������� ������� ������ ---------- */
  nav?.querySelectorAll('.tb-link, .tb-drop-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile() && nav.classList.contains('tb-nav--open')) {
        closeMobileMenu();
      }
    });
  });
});
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
