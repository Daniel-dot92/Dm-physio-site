document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const MOBILE_MAX = 768;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  /* ---------- SELECTORS ---------- */
  const header   = document.querySelector('.tb-header');
  const burger   = document.querySelector('.tb-burger');
  const nav      = document.querySelector('.tb-nav');
  const dropToggles = document.querySelectorAll('.tb-drop-toggle');

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


