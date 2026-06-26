document.addEventListener('DOMContentLoaded', function () {
  /* =========================
     Calendly (��� �������)
  ========================== */
  const calendlyButtons = document.querySelectorAll('.calendly-button');
  calendlyButtons.forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const calendlyUrl = this.dataset.calendlyUrl;
      if (calendlyUrl) {
        window.location.assign(calendlyUrl);
      } else {
        console.error('No Calendly URL defined for this button.');
      }
    });
  });

  /* =====================================================
     ����������� ��� �������� (������� + �������)
  ====================================================== */
  const MOBILE_QUERY = '(hover: none) and (pointer: coarse)';
  const mql = window.matchMedia(MOBILE_QUERY);
  let isMobile = mql.matches;

  // ������ �����
  const allVideos = Array.from(document.querySelectorAll('video'));

  // ���������� �� iOS/Android + ��������� �������
  allVideos.forEach(v => {
    v.removeAttribute('autoplay');               // ��� ����������� autoplay
    v.muted = true;                              // ����� �� ������� autoplay
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    if (!v.getAttribute('preload')) v.preload = 'metadata';
  });

  // ������� ���������
  const isProceduresVideo = (v) => !!v.closest('.kinesitherapy-button-media');

  // �� �������: �� ����������� ������� ��������� (�� �� ���� hover)
  // �� �������: ����������� ������
  let observedVideos = allVideos.filter(v => isMobile || !isProceduresVideo(v));

  function containerOf(videoEl) {
    return videoEl.closest(
      '.image-container, .muscle-video-centered, .kinesitherapy-button-media, .hernia-step-media'
    );
  }

  function staticImgFor(videoEl) {
    const c = containerOf(videoEl);
    if (!c) return null;
    return c.querySelector(
      '.static-img, .static-muscle-img, .kinesitherapy-img, .static-hernia-img'
    );
  }

  // ��������� ���������/�������� �� ������� (� !important � ��������� hover CSS)
  function revealVideoOnMobile(videoEl) {
    if (!isMobile) return;
    const img = staticImgFor(videoEl);
    if (img) img.style.setProperty('opacity', '0', 'important');
    videoEl.style.setProperty('opacity', '1', 'important');
    videoEl.style.setProperty('visibility', 'visible', 'important');
  }

  function hideVideoOnMobile(videoEl) {
    if (!isMobile) return;
    const img = staticImgFor(videoEl);
    if (img) img.style.setProperty('opacity', '1', 'important');
    if (
      videoEl.classList.contains('hover-video') ||
      videoEl.classList.contains('hover-muscle-video') ||
      videoEl.classList.contains('kinesitherapy-video') ||
      videoEl.classList.contains('hover-hernia-video')
    ) {
      videoEl.style.setProperty('opacity', '0', 'important');
    }
  }

  // ��-�������� play: ������� ����� ��� ����� (iOS/Safari)
  function hydrateVideoSource(v) {
    if (!v) return;
    const direct = v.getAttribute('data-src');
    const preview = getPreviewSrc(v);
    const source = v.querySelector('source');
    if (direct && !v.getAttribute('src')) {
      v.setAttribute('src', direct);
    }
    if (source && source.getAttribute('data-src') && !source.getAttribute('src')) {
      source.setAttribute('src', source.getAttribute('data-src'));
    }
    if (!source && preview && !v.querySelector('source[src]') && !v.getAttribute('src')) {
      const created = document.createElement('source');
      created.setAttribute('src', preview);
      created.setAttribute('type', 'video/mp4');
      v.appendChild(created);
    }
    try { v.load(); } catch (e) {}
  }

  function getPreviewSrc(v) {
    const preview = v.getAttribute('data-dm-preview-src');
    if (preview) return preview;
    const key = v.getAttribute('data-dm-preview-key');
    if (!key) return '';
    try {
      let normalized = key.replace(/-/g, '+').replace(/_/g, '/');
      normalized += '='.repeat((4 - normalized.length % 4) % 4);
      return decodeURIComponent(escape(atob(normalized)));
    } catch (e) {
      return '';
    }
  }

  function safePlay(v) {
    hydrateVideoSource(v);
    const doPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) {
      doPlay();
    } else {
      const onData = () => { v.removeEventListener('loadeddata', onData); doPlay(); };
      v.addEventListener('loadeddata', onData, { once: true });
      try { v.load(); } catch (e) {}
    }
  }

  function observeAll() {}
  function unobserveAll() {}

  // ����� �� ������, ������ ����� � �����
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      allVideos.forEach(v => { if (!v.paused) v.pause(); });
    }
  }, { passive: true });

  // ���������������� ��� resize � ��� ����� �������/������� ����������
  function reconfigureObserver() {
    unobserveAll();
    isMobile = mql.matches;
    observedVideos = allVideos.filter(v => isMobile || !isProceduresVideo(v));
    observeAll();
  }
  window.addEventListener('resize', reconfigureObserver, { passive: true });
  if (mql.addEventListener) mql.addEventListener('change', reconfigureObserver);

  /* =====================================================
     Hover ������ (���� �� �������)
  ====================================================== */

  function addHover(containerSelector, imgSelector, videoSelector) {
    document.querySelectorAll(containerSelector).forEach(container => {
      const img = container.querySelector(imgSelector);
      const vid = container.querySelector(videoSelector);
      if (!img || !vid) return;

      container.addEventListener('mouseenter', () => {
        if (isMobile) return;    // ��������� �� ���������� �� IO
        img.style.opacity = '0';
        vid.style.opacity = '1';
        safePlay(vid);
      });
      container.addEventListener('mouseleave', () => {
        if (isMobile) return;
        img.style.opacity = '1';
        vid.style.opacity = '0';
        vid.pause();
        vid.currentTime = 0;
      });
    });
  }

  // Hero / Intro
  addHover('.image-container', '.static-img', '.hover-video');

  // �������
  addHover('.muscle-video-centered', '.static-muscle-img', '.hover-muscle-video');

  // ������ ��������� � hover ���� �� ������� (�� ������� �� ����� IO)
  addHover('.kinesitherapy-button-media', '.kinesitherapy-img', '.kinesitherapy-video');

  // Timeline / Hernia ������
  addHover('.hernia-step-media', '.static-hernia-img', '.hover-hernia-video');
});


