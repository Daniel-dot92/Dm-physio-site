document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Малък лог за диагностика (виж в DevTools -> Console)
  console.log('topbar.js loaded');

  const MOBILE_MAX = 768;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  /* ---------- Top Bar opacity при скрол ---------- */
  const topBar = document.querySelector('.top-bar');
  const scrollThreshold = 50;

  function adjustTopBarOpacity() {
    if (!topBar) return;
    const scrolled = window.scrollY;
    if (scrolled > scrollThreshold) {
      const opacity = Math.max(0.7, 1 - (scrolled - scrollThreshold) / 200);
      topBar.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    } else {
      topBar.style.backgroundColor = 'rgba(0, 0, 0, 1)';
    }
  }
  window.addEventListener('scroll', adjustTopBarOpacity, { passive: true });
  adjustTopBarOpacity();

  /* ---------- Навигация: хамбургер + мобилен акордеон ---------- */
  const hamburgerToggle = document.querySelector('.hamburger-menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  // Вземаме .dropbtn/.dropdown-content след като DOM е готов
  const dropdownToggles = document.querySelectorAll('.main-nav .dropbtn');
  const dropdownContents = document.querySelectorAll('.main-nav .dropdown-content');

  function closeAllDropdowns() {
    dropdownContents.forEach(dc => dc.classList.remove('active'));
  }

  function closeMobileMenu() {
    mainNav?.classList.remove('active');
    document.body.classList.remove('no-scroll');
    closeAllDropdowns();
  }

  // Хамбургер: работи само на мобилно
  if (hamburgerToggle && mainNav) {
    hamburgerToggle.addEventListener('click', () => {
      if (!isMobile()) return; // игнор на десктоп
      mainNav.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
  }

  // Клик по линк вътре в менюто: затваря на мобилно
  if (mainNav) {
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (isMobile() && mainNav.classList.contains('active')) {
          closeMobileMenu();
        }
      });
    });
  }

  // Мобилен акордеон за "Процедури"
  if (dropdownToggles.length) {
    dropdownToggles.forEach(toggle => {
      // Ползваме pointerup, за да хванем и touch, и click
      const handler = (e) => {
        if (!isMobile()) return;  // десктоп: няма акордеон
        e.preventDefault();       // спираме навигацията към services.html на мобилно
        const content = toggle.nextElementSibling;
        if (!content || !content.classList.contains('dropdown-content')) return;

        // Затваряме други, отваряме текущия
        dropdownContents.forEach(dc => { if (dc !== content) dc.classList.remove('active'); });
        content.classList.toggle('active');
      };

      toggle.addEventListener('pointerup', handler);
      // резервно, ако pointer събития не са налични
      toggle.addEventListener('click', handler);
    });
  }

  // Клик извън менюто -> затваряне (мобилно)
  document.addEventListener('click', (e) => {
    if (!isMobile() || !mainNav) return;
    const withinNav = mainNav.contains(e.target) || hamburgerToggle?.contains(e.target);
    if (!withinNav && mainNav.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Escape затваря мобилното меню
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile() && mainNav?.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // При resize към десктоп: чисти мобилните състояния
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeMobileMenu();
    }
  });
});
