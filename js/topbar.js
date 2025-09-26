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
     - РїСЂРё y > 0 -> СЃС‚Р°РІР° РїСЂРѕР·СЂР°С‡РЅР° (rgba 0.4)
     - РїСЂРё y === 0 -> РѕР±СЂР°С‚РЅРѕ РїР»СЉС‚РЅР°
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

  // init + on scroll (СЃ rAF)
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
    // Р·Р°С‚РІР°СЂСЏРјРµ Рё РІСЃРёС‡РєРё РѕС‚РІРѕСЂРµРЅРё dropdown-Рё
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

  // Р·Р°С‚РІР°СЂСЏРЅРµ РїСЂРё РєР»РёРє РёР·РІСЉРЅ
  document.addEventListener('click', (e) => {
    if (!isMobile() || !nav) return;
    const target = e.target;
    const inside = nav.contains(target) || burger.contains(target);
    if (!inside && nav.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // ESC Р·Р°С‚РІР°СЂСЏ
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile() && nav?.classList.contains('tb-nav--open')) {
      closeMobileMenu();
    }
  });

  // РїСЂРё resize РєСЉРј РґРµСЃРєС‚РѕРї С‡РёСЃС‚РёРј РјРѕР±РёР»РЅРѕС‚Рѕ СЃСЉСЃС‚РѕСЏРЅРёРµ
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileMenu();
  });

  /* ---------- MOBILE: dropdown toggle ---------- */
/* РќР° РјРѕР±РёР»РЅРѕ РќР• РёСЃРєР°РјРµ Р°РєРѕСЂРґРµРѕРЅ. РџРѕР·РІРѕР»СЏРІР°РјРµ Р»РёРЅРєСЉС‚ РґР° РЅР°РІРёРіРёСЂР°. */
if (dropToggles.length){
  dropToggles.forEach(a => {
    a.addEventListener('click', (e) => {
      // Р°РєРѕ Рµ РјРѕР±РёР»РЅРѕ: РЅРµ РїСЂР°РІРёРј РЅРёС‰Рѕ (РќР• preventDefault), РїРѕР·РІРѕР»СЏРІР°РјРµ СЃР»РµРґРІР°РЅРµ РЅР° href
      if (isMobile()) return;

      // РЅР° РґРµСЃРєС‚РѕРї РѕСЃС‚Р°РІР° РїРѕРІРµРґРµРЅРёРµ С‚РёРї hover/click Р°РєРѕ РіРѕ РёСЃРєР°С€
      if (a.dataset.dropdown === 'toggle'){
        // РїРѕ Р¶РµР»Р°РЅРёРµ РјРѕР¶РµС€ РґР° РѕСЃС‚Р°РІРёС€ С‚РѕР·Рё Р±Р»РѕРє Р·Р° РґРµСЃРєС‚РѕРї-РєР»РёРє
        // e.preventDefault();
        const li = a.closest('.tb-dropdown');
        if (!li) return;
        document.querySelectorAll('.tb-dropdown.tb-open').forEach(x => { if (x !== li) x.classList.remove('tb-open'); });
        li.classList.toggle('tb-open');
      }
    });
  });
}


  /* ---------- CLICK РїРѕ Р»РёРЅРє: РЅР° РјРѕР±РёР»РЅРѕ Р·Р°С‚РІР°СЂСЏ РјРµРЅСЋС‚Рѕ ---------- */
  nav?.querySelectorAll('.tb-link, .tb-drop-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isMobile() && nav.classList.contains('tb-nav--open')) {
        closeMobileMenu();
      }
    });
  });
});
