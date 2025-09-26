// /js/media-autoplay-cards.js
document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_QUERY = '(hover: none) and (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isMobile = mql.matches;

  // ����������, ����� �� ������� ������ �� PLAY ���� ��� hover:
  // ?? ��������: .two-col__right .pain-buttons-vertical � � #pain-conditions-intro .pain-buttons-grid �
  const HOVER_CONTAINERS = [
    '.card__media',
    '.pain-button-media',
    '.journey-image',
    '.image-container',

    // ������ �� ������ (�������, �� �� �� ������� ��� ������ ������):
    '.pain-buttons-grid .pain-button-media',
    '.pain-buttons-vertical .pain-button-media',
    '.two-col__right .pain-buttons-vertical .pain-button-media',
    '#pain-conditions-intro .pain-buttons-grid .pain-button-media',
    // ��� ������ ������ .pain-button-media, ������� � .image-container ����� � ���� ������:
    '.pain-buttons-grid .image-container',
    '.pain-buttons-vertical .image-container',
    '.two-col__right .pain-buttons-vertical .image-container',
    '#pain-conditions-intro .pain-buttons-grid .image-container'
  ].join(',');

  // ������ �������� (static img, video) � ����� ���������
  function getMediaPair(container) {
    let staticImg =
      container.querySelector('.img--static, .static-img, .kinesitherapy-img, .static-hernia-img') ||
      container.querySelector('img'); // fallback

    let video =
      container.querySelector('video.img--hover, video.hover-img, video.hover-video, video.hover-muscle-video, video.kinesitherapy-video, video.hover-hernia-video') ||
      container.querySelector('video'); // fallback

    return { staticImg, video };
  }

  // ���������� �� ����� �� ������� autoplay (iOS/Safari)
  function prepVideo(v) {
    if (!v) return;
    v.removeAttribute('autoplay');               // ��������� �������
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    // ��-����� preload, ��� ������
    if (!v.getAttribute('preload')) v.preload = 'metadata';
  }

  // ��-�������� play (������� readyState ��� �����)
  function safePlay(v) {
    if (!v) return;
    const doPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) {
      doPlay();
    } else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once: true });
      try { v.load(); } catch (e) {}
    }
  }

  // �� ������� � ������� ����� � ������ ���������� ������ (��������� hover CSS)
  function revealOnMobile(container, video, staticImg) {
    if (!isMobile || !video) return;
    if (staticImg) staticImg.style.setProperty('opacity', '0', 'important');
    video.style.setProperty('opacity', '1', 'important');
    video.style.setProperty('visibility', 'visible', 'important');
  }

  function hideOnMobile(container, video, staticImg) {
    if (!isMobile || !video) return;
    if (staticImg) staticImg.style.setProperty('opacity', '1', 'important');
    // ��� �� ������ ������� � "hover", �� �������� �� ������� ����� ������
    video.style.setProperty('opacity', '0', 'important');
  }

  // IntersectionObserver �� ������� (� �� ������, ����� �� �� ������ �� hover �� �������)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      const container = video.closest(HOVER_CONTAINERS) || video.parentElement;
      const { staticImg } = getMediaPair(container);
      const css = window.getComputedStyle(video);
      const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
      const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= 0.35;

      if (shouldPlay) {
        // �� ������� � ���������� � �������
        revealOnMobile(container, video, staticImg);

        // �� �������, ��� � ������ (���� hover), �� �� ������� ������
        if (!isMobile && visuallyHidden) return;

        safePlay(video);
      } else {
        if (!video.paused) video.pause();
        // ������� ��� ��������
        if (!video.classList.contains('no-reset-on-exit')) video.currentTime = 0;
        hideOnMobile(container, video, staticImg);
      }
    });
  }, {
    root: null,
    rootMargin: '200px 0px',
    threshold: [0, 0.2, 0.35, 0.5, 0.75, 1]
  });

  // ��������� ���� ��������� (�����/�����) � �������� �����, hover �� �������, IO � �� �������
  function wireContainer(container) {
    const { staticImg, video } = getMediaPair(container);
    if (!video) return;

    prepVideo(video);

    // �� ������� � play/pause ���� ��� hover
    container.addEventListener('mouseenter', () => {
      if (isMobile) return;
      if (staticImg) staticImg.style.opacity = '0';
      video.style.opacity = '1';
      safePlay(video);
    });
    container.addEventListener('mouseleave', () => {
      if (isMobile) return;
      if (staticImg) staticImg.style.opacity = '1';
      video.style.opacity = '0';
      video.pause();
      video.currentTime = 0;
    });

    // IO ����������:
    // - �� �������: ������
    // - �� �������: ���� ��� � ������ �� CSS (�.�. ���� hover-��������)
    const css = window.getComputedStyle(video);
    const visuallyHidden = (css.opacity === '0' || css.visibility === 'hidden');
    if (isMobile || !visuallyHidden) {
      io.observe(video);
    }
  }

  // ��������� ������ ������ ����������
  function wireAll() {
    document.querySelectorAll(HOVER_CONTAINERS).forEach(wireContainer);
  }

  // ��������������� ��� ����� �������/�������
  function reconfigure() {
    isMobile = mql.matches;
    io.disconnect();
    wireAll();
  }

  // ������������ ��������
  wireAll();

  // ��� ������� ����� ��������� (����. � ������� �������� ����������)
  const mo = new MutationObserver((mutations) => {
    let needsWire = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        needsWire = true; break;
      }
    }
    if (needsWire) wireAll();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // ��������� �����
  if (mql.addEventListener) mql.addEventListener('change', reconfigure);
  window.addEventListener('resize', reconfigure, { passive: true });
});


