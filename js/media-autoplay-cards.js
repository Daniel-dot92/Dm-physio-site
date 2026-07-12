/* media-autoplay-cards.js — light iOS-safe + CriOS unlock */
(function () {
  if (window.__dmMediaAutoplayCardsActive) return;
  window.__dmMediaAutoplayCardsActive = true;

  var UA = navigator.userAgent || '';
  var IS_IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var IS_IOS_CHROME = IS_IOS && /CriOS/.test(UA);
  var IS_TOUCH = typeof matchMedia==='function' && matchMedia('(hover:none) and (pointer:coarse)').matches;

  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  var cards = [];
  var byBox = new Map();
  var io = null;
  var activeTouchCard = null;
  var visibleCards = new Map();
  var scrollPlayTimer = null;
  // Keep preview media out of the initial render. A real touch arms mobile scroll previews.
  var touchPreviewIntentArmed = !IS_TOUCH;

  function prime(v, auto){
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if(auto) v.setAttribute('autoplay','');
    if(!v.preload) v.preload = 'metadata';
    v.controls = false;
    v.setAttribute('disablepictureinpicture','');
    v.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');
  }

  function getPreviewSrc(v){
    var direct = v.getAttribute('data-src');
    if(direct) return direct;
    var preview = v.getAttribute('data-dm-preview-src');
    if(preview) return preview;
    var key = v.getAttribute('data-dm-preview-key');
    if(!key) return '';
    try {
      var normalized = key.replace(/-/g, '+').replace(/_/g, '/');
      normalized += '='.repeat((4 - normalized.length % 4) % 4);
      return decodeURIComponent(escape(atob(normalized)));
    } catch(e) {
      return '';
    }
  }

  function createVideoFromPlaceholder(placeholder){
    if(!placeholder) return null;
    var existingId = placeholder.getAttribute('data-dm-preview-video-id');
    if(existingId){
      var existing = document.getElementById(existingId);
      if(existing && existing.tagName === 'VIDEO') return existing;
    }

    var preview = getPreviewSrc(placeholder);
    if(!preview) return null;

    var video = document.createElement('video');
    var id = existingId || ('dm-preview-' + Math.random().toString(36).slice(2));
    video.id = id;
    video.className = (placeholder.className || 'hover-img').replace(/\bdm-video-placeholder\b/g, '').trim() || 'hover-img';
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('data-dm-preview-src', preview);
    video.poster = placeholder.getAttribute('data-dm-preview-poster') || placeholder.currentSrc || placeholder.src || '';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.controls = false;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');

    placeholder.setAttribute('data-dm-preview-video-id', id);
    placeholder.style.display = 'none';
    if(placeholder.parentNode){
      placeholder.parentNode.insertBefore(video, placeholder.nextSibling);
    }
    return video;
  }

  function prepareVideo(m, video){
    if(!video) return null;
    var b=m.box, img=m.img;
    prime(video, IS_TOUCH);

    video.style.position='absolute';
    video.style.inset='0';
    video.style.width='100%';
    video.style.height='100%';
    video.style.objectFit='cover';
    video.style.opacity='0';
    if(!video.style.transition) video.style.transition='opacity .24s ease';
    if(img && img !== m.placeholder){
      if(!img.style.transition) img.style.transition='opacity .24s ease';
      img.style.opacity='1';
    }

    video.addEventListener('loadeddata', function(){
      b.classList.add('video-ready');
    }, {passive:true});
    return video;
  }

  function ensureVideo(m){
    if(m.vid) return m.vid;
    if(!m.placeholder) return null;
    var video=createVideoFromPlaceholder(m.placeholder);
    if(!video) return null;
    m.vid=prepareVideo(m, video);
    return m.vid;
  }

  function hydrate(m){
    if(m.hydrated) return;
    var v = ensureVideo(m);
    if(!v) return;
    var preview = getPreviewSrc(v);
    var s = $('source', v);

    try { v.preload = 'none'; } catch(e){}

    if(preview){
      v.src = preview;
    }else if(s && s.getAttribute('data-src')){
      v.src = s.getAttribute('data-src');
    }else if(s && s.src){
      v.setAttribute('data-src', s.src);
      v.removeAttribute('src');
      v.src = v.getAttribute('data-src');
      try { s.parentNode && s.parentNode.removeChild(s); } catch(e){}
    }else if(v.src || v.currentSrc){
      m.hydrated = true; return;
    }
    try{ v.load(); }catch(e){}
    m.hydrated = true;
  }

  function afterReady(v, cb){
    if(v.readyState>=2){ waitFrame(v, cb); return; }
    var done=false;
    function cleanup(){
      v.removeEventListener('loadeddata',on);
      v.removeEventListener('canplay',on);
      v.removeEventListener('error',onError);
    }
    var on=function(){
      if(done) return;
      done=true;
      cleanup();
      waitFrame(v, cb);
    };
    function onError(){
      if(done) return;
      done=true;
      cleanup();
    }
    v.addEventListener('loadeddata', on, {once:true});
    v.addEventListener('canplay', on, {once:true});
    v.addEventListener('error', onError, {once:true});
    try{ v.load(); }catch(e){}
  }

  function waitFrame(v, cb){
    if(v && typeof v.requestVideoFrameCallback === 'function'){
      v.requestVideoFrameCallback(function(){ cb(); });
      return;
    }
    requestAnimationFrame(function(){ requestAnimationFrame(cb); });
  }

  function reveal(m, token){
    if(token && m.showToken !== token) return;
    m.ready=true;
    m.box.classList.add('video-ready');
    m.box.classList.add('is-playing');
    m.vid.style.opacity='1';
    m.img.style.opacity='0';
    m.box.dataset.playing='1';
    if (IS_TOUCH) activeTouchCard = m;
  }

  function show(m){
    if(m.hideTimer){ clearTimeout(m.hideTimer); m.hideTimer = null; }
    if(!ensureVideo(m)) return;
    if(IS_TOUCH && m.box.dataset.playing){
      if(m.vid.paused){
        var resume = m.vid.play();
        if(resume && resume.catch) resume.catch(function(){});
      }
      return;
    }
    var token = (m.showToken || 0) + 1;
    m.showToken = token;
    if(IS_TOUCH) activeTouchCard = m;
    hydrate(m);
    if(!IS_TOUCH){
      m.ready=true;
      m.box.classList.add('video-ready');
      m.vid.style.opacity='1';
      m.img.style.opacity='0';
      var desktopPlay=m.vid.play();
      if(desktopPlay&&desktopPlay.catch) desktopPlay.catch(function(){});
      m.box.dataset.playing='1';
      return;
    }
    var p=m.vid.play();
    if(p&&p.then){
      p.then(function(){
        afterReady(m.vid,function(){ reveal(m, token); });
      }).catch(function(){ NEED_UNLOCK=true; });
    }else{
      afterReady(m.vid,function(){ reveal(m, token); });
    }
  }

  function hide(m){
    if(m.hideTimer){ clearTimeout(m.hideTimer); m.hideTimer = null; }
    if(!m.vid) return;
    m.showToken = (m.showToken || 0) + 1;
    try{m.vid.pause();}catch(e){}
    if(!IS_TOUCH){ try{m.vid.currentTime=0;}catch(e){} }
    m.vid.style.opacity='0';
    m.img.style.opacity='1';
    m.box.classList.remove('is-playing');
    delete m.box.dataset.playing;
    if (IS_TOUCH && activeTouchCard === m) activeTouchCard = null;
  }

  function visibleRatio(box){
    if(!box || !box.getBoundingClientRect) return 0;
    var r = box.getBoundingClientRect();
    if(!r.width || !r.height) return 0;
    var w = Math.max(0, Math.min(r.right, innerWidth || document.documentElement.clientWidth) - Math.max(r.left, 0));
    var h = Math.max(0, Math.min(r.bottom, innerHeight || document.documentElement.clientHeight) - Math.max(r.top, 0));
    return (w * h) / (r.width * r.height);
  }

  function playBestVisible(){
    if(!IS_TOUCH || !touchPreviewIntentArmed) return;
    visibleCards.forEach(function(ratio, m){
      var freshRatio = visibleRatio(m.box);
      if(freshRatio >= 0.35){
        if(m.box.dataset.playing){
          if(m.vid.paused){
            var resume = m.vid.play();
            if(resume && resume.catch) resume.catch(function(){});
          }
        }else{
          show(m);
        }
      }
    });
  }

  function scheduleBestVisible(){
    if(!IS_TOUCH || !touchPreviewIntentArmed) return;
    if(scrollPlayTimer) clearTimeout(scrollPlayTimer);
    scrollPlayTimer = setTimeout(function(){
      scrollPlayTimer = null;
      playBestVisible();
    }, 120);
  }

  function scheduleHide(m){
    if(!IS_TOUCH){ hide(m); return; }
    if(m.hideTimer) clearTimeout(m.hideTimer);
    m.hideTimer = setTimeout(function(){
      m.hideTimer = null;
      if(visibleRatio(m.box) > 0.01) return;
      if(activeTouchCard === m || m.box.dataset.playing) hide(m);
    }, 180);
  }

  function initBox(m){
    var b=m.box, img=m.img, v=m.vid;

    var cs = getComputedStyle(b);
    if(cs.position==='static') b.style.position='relative';
    if(cs.overflow==='visible') b.style.overflow='hidden';

    if(img && img !== m.placeholder){
      img.style.position='absolute';
      img.style.inset='0';
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      if(!img.style.transition) img.style.transition='opacity .24s ease';
      img.style.opacity='1';
    }
    if(v) prepareVideo(m, v);

    if(!b.dataset.mediaBound){
      b.dataset.mediaBound = '1';
      if(!IS_TOUCH){
        b.addEventListener('mouseenter', function(){ show(m); }, {passive:true});
        b.addEventListener('mouseleave', function(){ hide(m); }, {passive:true});
      } else {
        b.addEventListener('click', function(e){
          if(!b.dataset.playing){
            e.preventDefault();
            e.stopPropagation();
            show(m);
          }
        }, true);
      }
    }
  }

  function ensureObserver(){
    if(io || !('IntersectionObserver' in window)) return;
    var thr = IS_TOUCH ? 0.01 : 0.1;
    io = new IntersectionObserver(function(ents){
      for (var k=0;k<ents.length;k++){
        var en=ents[k];
        var m = byBox.get(en.target);
        if(!m) continue;
        if(en.isIntersecting && en.intersectionRatio >= thr){
          visibleCards.set(m, en.intersectionRatio);
          scheduleBestVisible();
        }else{
          visibleCards.delete(m);
          scheduleHide(m);
        }
      }
    }, {rootMargin:'0px', threshold:[0,0.01,0.1,0.35,0.5,0.6,1]});
    cards.forEach(function(m){ io.observe(m.box); });
  }

  function registerBox(box){
    if(byBox.has(box)) return;
    var img = $('.static-img', box);
    var vid = $('video.hover-img, video.hover-video, video.hover-muscle-video, video.kinesitherapy-video', box);
    var placeholder = $('.dm-video-placeholder[data-dm-preview-key], .dm-video-placeholder[data-dm-preview-src], img[data-dm-preview-key], img[data-dm-preview-src], img[data-src]', box);
    if(!img) img=placeholder;
    if(!(img && (vid || placeholder))) return;
    var m = {box:box,img:img,placeholder:placeholder,vid:vid,ready:false,hydrated:false,showToken:0,hideTimer:null};
    byBox.set(box, m);
    cards.push(m);
    initBox(m);
    if(io) io.observe(box);
  }

  function scan(root){
    $$('.image-container, .pain-button-media', root||document).forEach(registerBox);
  }

  scan(document);
  ensureObserver();

  function armTouchPreviews(event){
    if(!IS_TOUCH || touchPreviewIntentArmed) return;
    if(event && event.isTrusted === false) return;
    touchPreviewIntentArmed=true;
    scheduleBestVisible();
  }

  window.addEventListener('touchstart', armTouchPreviews, {passive:true});
  window.addEventListener('pointerdown', function(event){
    if(!event.pointerType || event.pointerType !== 'mouse') armTouchPreviews(event);
  }, {passive:true});

  if(!('IntersectionObserver' in window) && IS_TOUCH){
    var onL=function(){ if(touchPreviewIntentArmed && cards.length) show(cards[0]); };
    window.addEventListener('touchstart', function(){
      if(document.readyState==='complete') onL(); else window.addEventListener('load', onL, {once:true});
    }, {once:true,passive:true});
  }

  document.addEventListener('visibilitychange', function(){ if(document.hidden) cards.forEach(hide); }, {passive:true});
  window.addEventListener('pagehide', function(){ cards.forEach(hide); }, {passive:true});

  // ---- iOS Chrome gesture-unlock (минимално, без да променяме UX) ----
  var NEED_UNLOCK = IS_IOS_CHROME;
  var unlocked = false;

  function inViewport(el, r){
    var a=el.getBoundingClientRect(), H=innerHeight||document.documentElement.clientHeight, W=innerWidth||document.documentElement.clientWidth;
    if(a.width===0||a.height===0) return false;
    var xo=Math.max(0, Math.min(a.right,W)-Math.max(a.left,0));
    var yo=Math.max(0, Math.min(a.bottom,H)-Math.max(a.top,0));
    var vis = xo*yo, area=a.width*a.height;
    return area? (vis/area) >= (r||0.5) : false;
  }

  function doUnlock(){
    if(unlocked) return; unlocked=true;
    cards.forEach(function(m){ var video=ensureVideo(m); if(video) prime(video, IS_TOUCH); });
    var targets = cards.filter(function(m){ return inViewport(m.box,0.5); });
    var first = targets.length ? targets[0] : null;
    if(first){
      hydrate(first);
      if(!first.vid) return;
      try{
        first.vid.muted=true;
        first.vid.setAttribute('muted','');
        var p=first.vid.play();
        if(p&&p.catch)p.catch(function(){});
        activeTouchCard = first;
      }catch(e){}
    }
    setTimeout(function(){
      cards.forEach(function(m){ if(!m.box.dataset.playing || !inViewport(m.box,0.5)) hide(m); });
    },120);
  }

  function maybeUnlock(){
    if(!NEED_UNLOCK||unlocked) return;
    doUnlock(); NEED_UNLOCK=false;
    window.removeEventListener('touchstart', maybeUnlock, touchOpts);
    window.removeEventListener('click', maybeUnlock, true);
  }
  var touchOpts={once:true,passive:true};
  if(IS_IOS_CHROME){
    window.addEventListener('touchstart', maybeUnlock, touchOpts);
    window.addEventListener('click', maybeUnlock, true);
  }

  var deb;
  function resume(){
    clearTimeout(deb);
    deb=setTimeout(function(){
      cards.forEach(function(m){
        if(m.vid && m.box.dataset.playing && m.vid.paused && inViewport(m.box,0.5)){
          var p=m.vid.play(); if(p&&p.catch)p.catch(function(){ NEED_UNLOCK=true; });
        }
      });
    },100);
  }
  window.addEventListener('orientationchange', resume);
  window.addEventListener('resize', resume);

  function refresh(root){
    scan(root||document);
    ensureObserver();
    if(unlocked && IS_IOS_CHROME){
      cards.forEach(function(m){ var video=ensureVideo(m); if(video) prime(video, IS_TOUCH); });
    }
  }
  window.mediaAutoplayCardsRefresh = refresh;

  document.addEventListener('media-autoplay-cards:refresh', function(e){
    var root = (e && e.detail && e.detail.root) ? e.detail.root : document;
    refresh(root);
  });
})();
