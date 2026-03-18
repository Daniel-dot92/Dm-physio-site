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
      'https://book.dmphysi0.com/book',
      'https://book.dmphysi0.com/book',
      'https://book.dmphysi0.com/book',
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
