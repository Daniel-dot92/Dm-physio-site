document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const MOBILE_MAX = 768;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  /* ---------- SELECTORS ---------- */
  const header   = document.querySelector('.tb-header');
  const burger   = document.querySelector('.tb-burger');
  const nav      = document.querySelector('.tb-nav');
  const dropToggles = document.querySelectorAll('.tb-drop-toggle');

  // Hide unfinished "Online plan" entries globally until they are ready.
  function hideUnpublishedLinks() {
    const blockedHrefs = new Set([
      '/online-recovery.html',
      'online-recovery.html',
      '../online-recovery.html',
      '/procedures/online-program-1.html',
      '/procedures/online-program-2.html',
      '/procedures/online-program-3.html',
      '/procedures/online-5proceduri.html',
      '/procedures/online-konsultaciq.html',
      '/procedures/online-podrujka.html',
      '/procedures/online-sesiq.html',
      '/procedures/online-videos.html'
    ]);

    document.querySelectorAll('a[href]').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (!blockedHrefs.has(href)) return;
      const wrapper = a.closest('.tb-drop-item, .tb-item, .chip, li');
      if (wrapper) {
        wrapper.remove();
      } else {
        a.remove();
      }
    });
  }
  hideUnpublishedLinks();

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



/* ---------- Relevant + Popular Recommendations ---------- */
(function () {
  'use strict';

  var LOCAL_STATS_KEY = 'dm_page_stats_v1';
  var GLOBAL_STATS_URL = window.DM_PAGE_STATS_URL || '/data/page-stats.json';
  var FALLBACK_STATS_URL = '/api/page-stats';
  var CONDITIONS_URL = '/conditions.html';
  var RECO_LIMIT = 6;

  function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch (_) { return fallback; }
  }

  function normalizePath(url) {
    try {
      var u = new URL(url, window.location.origin);
      var p = u.pathname || '/';
      return p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p;
    } catch (_) {
      return '/';
    }
  }

  function getLocalStats() {
    return safeParse(localStorage.getItem(LOCAL_STATS_KEY) || '{}', {});
  }

  function saveLocalStats(data) {
    try {
      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function upsertLocalStats(path, viewInc, engagementMsInc) {
    var data = getLocalStats();
    var item = data[path] || { views: 0, engagement_ms: 0 };
    item.views += viewInc || 0;
    item.engagement_ms += engagementMsInc || 0;
    data[path] = item;
    saveLocalStats(data);
    return data;
  }

  function setupLocalTracking() {
    var path = normalizePath(window.location.pathname);
    upsertLocalStats(path, 1, 0);

    var visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
    function flushEngagement() {
      if (!visibleSince) return;
      var delta = Date.now() - visibleSince;
      visibleSince = 0;
      if (delta > 0) upsertLocalStats(path, 0, delta);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        if (!visibleSince) visibleSince = Date.now();
      } else {
        flushEngagement();
      }
    });
    window.addEventListener('beforeunload', flushEngagement);
    window.addEventListener('pagehide', flushEngagement);
  }

  function setupOptionalGA4Events() {
    // Optional: set this once globally if you want automatic GA4 events.
    // Example: window.DM_GA4_ID = 'G-XXXXXXXXXX';
    var GA4_ID = window.DM_GA4_ID || '';
    if (GA4_ID && !window.gtag) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA4_ID, { send_page_view: true });
    }

    if (!window.gtag) return;

    var path = normalizePath(window.location.pathname);
    window.gtag('event', 'dm_page_view', { page_path: path });

    var start = Date.now();
    function sendEngagement() {
      var sec = Math.round((Date.now() - start) / 1000);
      if (sec < 3) return;
      window.gtag('event', 'dm_engagement_seconds', {
        page_path: path,
        value: sec
      });
    }
    window.addEventListener('pagehide', sendEngagement, { once: true });
    window.addEventListener('beforeunload', sendEngagement, { once: true });
  }

  var TAG_PATTERNS = [
    { tag: 'head', patterns: ['head', '/head-', '/head/', 'глава', 'migraine', 'световъртеж'] },
    { tag: 'neck', patterns: ['neck', '/neck-', '/neck/', 'врат', 'ший', 'cervic'] },
    { tag: 'shoulder', patterns: ['shoulder', '/ramo/', 'рамо', 'impingement'] },
    { tag: 'arm', patterns: ['/arm/', 'arm', 'ръка', 'лакът', 'китк', 'carpal', 'тенис лакът', 'голф лакът'] },
    { tag: 'chest', patterns: ['chest', '/gurdi/', 'гърди', 'корем', 'thoracic outlet', 'абдомин'] },
    { tag: 'back', patterns: ['/grub/', 'back', 'гръб', 'дискова херния', 'шипове'] },
    { tag: 'lower-back', patterns: ['/krust/', 'lower-back', 'кръст', 'ишиас', 'sciatica', 'piriformis', 'пириформис'] },
    { tag: 'pelvis', patterns: ['/dupe/', 'pelvis', 'таз', 'седалище', 'sacroiliac', 'cox'] },
    { tag: 'knee', patterns: ['knee', '/krak/', 'коляно', 'гонарт', 'мениск', 'patelo'] },
    { tag: 'ankle', patterns: ['/stupalo/', 'ankle', 'глезен', 'стъпал', 'ахил'] },
    { tag: 'neuralgia', patterns: ['невралг', 'radicul', 'tingling', 'изтръп'] },
    { tag: 'muscle', patterns: ['muscle', 'муска', 'мускул'] }
  ];

  function inferTags(text) {
    var src = (text || '').toLowerCase();
    var tags = [];
    TAG_PATTERNS.forEach(function (rule) {
      if (rule.patterns.some(function (p) { return src.indexOf(p.toLowerCase()) !== -1; })) {
        tags.push(rule.tag);
      }
    });
    return tags;
  }

  function inferCurrentContextTags() {
    var h1 = document.querySelector('h1');
    var h2 = document.querySelector('h2');
    var tagMeta = document.querySelector('meta[name="dm-tags"]');
    var extraTags = tagMeta ? tagMeta.getAttribute('content') || '' : '';
    var context = [
      window.location.pathname,
      document.title || '',
      h1 ? h1.textContent : '',
      h2 ? h2.textContent : '',
      extraTags
    ].join(' ');
    return inferTags(context);
  }

  function parseConditionButtons(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var links = Array.prototype.slice.call(doc.querySelectorAll('#conditions-list a.pain-button'));
    return links.map(function (a) {
      var href = a.getAttribute('href') || '';
      var url = normalizePath(href);
      var labelEl = a.querySelector('.pain-button-text');
      var title = (labelEl ? labelEl.textContent : a.textContent || '').trim();
      var tags = inferTags(url + ' ' + title);
      return {
        path: url,
        title: title,
        tags: tags,
        html: a.outerHTML
      };
    }).filter(function (x) { return x.path && x.path !== '/'; });
  }

  function fetchJsonSafe(url, cacheMode) {
    return fetch(url, { credentials: 'omit', cache: cacheMode || 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' at ' + url);
        return r.json();
      });
  }

  function fetchGlobalStats() {
    return fetchJsonSafe(GLOBAL_STATS_URL, 'no-cache')
      .catch(function () { return fetchJsonSafe(FALLBACK_STATS_URL, 'force-cache'); })
      .catch(function () { return { pages: {} }; });
  }

  function mergeStats(globalStats, localStats) {
    var pages = {};
    var gPages = (globalStats && globalStats.pages) ? globalStats.pages : {};

    Object.keys(gPages).forEach(function (k) {
      var path = normalizePath(k);
      var row = gPages[k] || {};
      pages[path] = {
        views: Number(row.views || 0),
        engagement_ms: Number(row.engagement_ms || 0),
        engagement_seconds: Number(row.engagement_seconds || 0)
      };
    });

    Object.keys(localStats || {}).forEach(function (k) {
      var path = normalizePath(k);
      var local = localStats[k] || {};
      if (!pages[path]) {
        pages[path] = { views: 0, engagement_ms: 0, engagement_seconds: 0 };
      }
      pages[path].views += Number(local.views || 0);
      pages[path].engagement_ms += Number(local.engagement_ms || 0);
    });
    return pages;
  }

  function popularityScore(stat) {
    if (!stat) return 0;
    var views = Number(stat.views || 0);
    var seconds = Number(stat.engagement_seconds || 0) + (Number(stat.engagement_ms || 0) / 1000);
    return (views * 5) + seconds;
  }

  function overlapCount(a, b) {
    if (!a || !b || !a.length || !b.length) return 0;
    var set = new Set(a);
    var count = 0;
    b.forEach(function (t) { if (set.has(t)) count++; });
    return count;
  }

  function pickRecommendations(catalog, statsByPath) {
    var currentPath = normalizePath(window.location.pathname);
    var contextTags = inferCurrentContextTags();

    var pool = catalog.filter(function (item) { return item.path !== currentPath; });
    var ranked = pool
      .map(function (item) {
        var overlap = overlapCount(contextTags, item.tags);
        var pop = popularityScore(statsByPath[item.path]);
        var score = (overlap * 100000) + pop;
        return { item: item, overlap: overlap, pop: pop, score: score };
      })
      .sort(function (a, b) {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap;
        return b.score - a.score;
      });

    var relevant = ranked.filter(function (x) { return x.overlap > 0; });
    var hasPopular = ranked.some(function (x) { return x.pop > 0; });

    // User preference: if there are no clearly relevant OR no popularity data, show random.
    if (!relevant.length || !hasPopular) {
      var shuffled = pool
        .map(function (item) { return { item: item, rnd: Math.random() }; })
        .sort(function (a, b) { return a.rnd - b.rnd; })
        .slice(0, RECO_LIMIT)
        .map(function (x) { return x.item; });
      return shuffled;
    }

    return relevant.slice(0, RECO_LIMIT).map(function (x) { return x.item; });
  }

  function attachSidebarVideoFallback(container) {
    if (!container) return;
    var mediaBoxes = container.querySelectorAll('.pain-button-media.image-container, .image-container');
    Array.prototype.forEach.call(mediaBoxes, function (box) {
      var vid = box.querySelector('video.hover-img');
      if (!vid || box.dataset.dmVideoBound === '1') return;

      box.dataset.dmVideoBound = '1';
      try {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.setAttribute('muted', '');
        vid.setAttribute('playsinline', '');
        vid.preload = vid.preload || 'none';
      } catch (_) {}

      function playVideo() {
        try {
          var p = vid.play();
          if (p && typeof p.catch === 'function') p.catch(function(){});
        } catch (_) {}
      }
      function stopVideo() {
        try {
          vid.pause();
          vid.currentTime = 0;
        } catch (_) {}
      }

      box.addEventListener('mouseenter', playVideo, { passive: true });
      box.addEventListener('mouseleave', stopVideo, { passive: true });
      box.addEventListener('touchstart', playVideo, { passive: true });
      box.addEventListener('touchend', stopVideo, { passive: true });
    });
  }

  function renderRecommendations(container, items) {
    if (!container || !items || !items.length) return;
    var html = items.map(function (item) { return item.html; }).join('');
    container.innerHTML = html;

    Array.prototype.forEach.call(container.children, function (el) {
      el.setAttribute('data-dm-reco-item', '1');
    });

    if (window.mediaAutoplayCardsRefresh) {
      window.mediaAutoplayCardsRefresh(container);
    }
    attachSidebarVideoFallback(container);
  }

  function setupRecommendations() {
    var container = document.getElementById('conditions-container');
    if (!container) return;

    var target = document.getElementById('random-conditions') || container;
    var didLoad = false;

    function loadAndRender() {
      if (didLoad) return;
      didLoad = true;

      Promise.all([
        fetch(CONDITIONS_URL, { credentials: 'omit', cache: 'force-cache' }).then(function (r) { return r.text(); }),
        fetchGlobalStats()
      ]).then(function (arr) {
        var catalog = parseConditionButtons(arr[0]);
        var localStats = getLocalStats();
        var mergedStats = mergeStats(arr[1], localStats);
        var picks = pickRecommendations(catalog, mergedStats);
        renderRecommendations(container, picks);

        // Guard against late random injectors from legacy inline scripts.
        var retries = 0;
        var maxRetries = 6;
        var guard = setInterval(function () {
          retries++;
          if (retries > maxRetries) {
            clearInterval(guard);
            return;
          }
          var hasForeign = Array.prototype.some.call(container.children, function (el) {
            return !el.hasAttribute('data-dm-reco-item');
          });
          if (hasForeign) renderRecommendations(container, picks);
        }, 2000);
      }).catch(function (err) {
        console.warn('Recommendations failed:', err);
      });
    }

    if (!('IntersectionObserver' in window)) {
      loadAndRender();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        loadAndRender();
      }
    }, { rootMargin: '220px 0px' });
    io.observe(target);
  }

  setupLocalTracking();
  setupOptionalGA4Events();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupRecommendations, { once: true });
  } else {
    setupRecommendations();
  }
})();
