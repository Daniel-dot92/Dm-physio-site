// /js/topbar.js
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const MOBILE_MAX = 768;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  /* ---------- SELECTORS ---------- */
  const header  = document.querySelector('.tb-header');
  const burger  = document.querySelector('.tb-burger');
  const nav     = document.querySelector('.tb-nav');
  const dropToggles = document.querySelectorAll('.tb-drop-toggle');

  // Ако изобщо няма header на страницата — излизаме чисто
  if (!header) return;

  /* ---------- SCROLL BG (прави header полупрозрачен при скрол) ---------- */
  function applyHeaderBg(){
    const y = window.scrollY || 0;
    if (y > 0) header.classList.add('tb--transparent');
    else header.classList.remove('tb--transparent');
  }

  // init + on scroll (rAF throttle)
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
    // затвори всички отворени dropdown-и
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

  // Клик извън менюто затваря (само на мобилно)
  document.addEventListener('click', (e) => {
    if (!isMobile() || !nav) return;
    const target = e.target;
    const inside = nav.contains(target) || burger.contains(target);
    if (!inside && nav.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // ESC затваря мобилното меню
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile() && nav?.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // При преминаване към десктоп — увери се, че менюто е затворено
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileMenu();
  }, { passive: true });

  /* ---------- DROPDOWN (десктоп) ---------- */
  if (dropToggles.length){
    dropToggles.forEach(a => {
      a.addEventListener('click', () => {
        // На мобилно оставяме линковете да си навигират
        if (isMobile()) return;

        // На десктоп: отваря/затваря dropdown-а, без да пречим на href
        if (a.dataset.dropdown === 'toggle'){
          const li = a.closest('.tb-dropdown');
          if (!li) return;
          document.querySelectorAll('.tb-dropdown.tb-open').forEach(x => { if (x !== li) x.classList.remove('tb-open'); });
          li.classList.toggle('tb-open');
        }
      });
    });
  }

  /* ---------- Клик по линк в менюто (мобилно) -> затвори менюто ---------- */
  nav?.querySelectorAll('.tb-link, .tb-drop-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile() && nav.classList.contains('tb-nav--open')) {
        closeMobileMenu();
      }
    });
  });
});
