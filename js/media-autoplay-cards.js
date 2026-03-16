/* media-autoplay-cards.js — light iOS-safe + CriOS unlock */
(function () {
  var UA = navigator.userAgent || '';
  var IS_IOS = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var IS_IOS_CHROME = IS_IOS && /CriOS/.test(UA);
  var IS_TOUCH = typeof matchMedia==='function' && matchMedia('(hover:none) and (pointer:coarse)').matches;

  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  var cards = [];
  var byBox = new Map();
  var io = null;

  function prime(v, auto){
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted','');
    v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    if(auto) v.setAttribute('autoplay','');
    if(!v.preload) v.preload = 'metadata';
    v.controls = false;
    v.setAttribute('disablepictureinpicture','');
    v.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');
  }

  function hydrate(m){
    if(m.hydrated) return;
    var v = m.vid;
    var direct = v.getAttribute('data-src');
    var s = $('source', v);

    try { v.preload = 'none'; } catch(e){}

    if(direct){
      v.src = direct;
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
    if(v.readyState>=2){ cb(); return; }
    var on=function(){ v.removeEventListener('loadeddata',on); cb(); };
    v.addEventListener('loadeddata', on, {once:true});
    try{ v.load(); }catch(e){}
  }

  function show(m){
    hydrate(m);
    afterReady(m.vid,function(){
      m.ready=true;
      m.box.classList.add('video-ready');
      m.vid.style.opacity='1';
      m.img.style.opacity='0';
      var p=m.vid.play();
      if(p&&p.catch) p.catch(function(){ NEED_UNLOCK=true; });
      m.box.dataset.playing='1';
    });
  }

  function hide(m){
    try{m.vid.pause();}catch(e){}
    try{m.vid.currentTime=0;}catch(e){}
    m.vid.style.opacity='0';
    m.img.style.opacity='1';
    delete m.box.dataset.playing;
  }

  function initBox(m){
    var b=m.box, img=m.img, v=m.vid;
    prime(v, IS_TOUCH);

    var cs = getComputedStyle(b);
    if(cs.position==='static') b.style.position='relative';
    if(cs.overflow==='visible') b.style.overflow='hidden';

    img.style.position=v.style.position='absolute';
    img.style.inset=v.style.inset='0';
    img.style.width=v.style.width='100%';
    img.style.height=v.style.height='100%';
    img.style.objectFit=v.style.objectFit='cover';

    if(!v.style.transition) v.style.transition='opacity .24s ease';
    if(!img.style.transition) img.style.transition='opacity .24s ease';
    v.style.opacity='0'; img.style.opacity='1';

    v.addEventListener('loadeddata', function(){
      this.parentNode&&this.parentNode.classList.add('video-ready');
    }, {passive:true});

    if(!b.dataset.mediaBound){
      b.dataset.mediaBound = '1';
      if(!IS_TOUCH){
        b.addEventListener('mouseenter', function(){ show(m); }, {passive:true});
        b.addEventListener('mouseleave', function(){ hide(m); }, {passive:true});
      }
    }
  }

  function ensureObserver(){
    if(io || !('IntersectionObserver' in window)) return;
    var thr = IS_TOUCH ? (IS_IOS?0.6:0.5) : 0.1;
    io = new IntersectionObserver(function(ents){
      for(var i=0;i<ents.length;i++){
        var en=ents[i];
        var m = byBox.get(en.target);
        if(!m) continue;
        if(IS_TOUCH){
          if(en.isIntersecting && en.intersectionRatio>=thr){ if(!m.box.dataset.playing) show(m); }
          else { hide(m); }
        }else{
          if(!en.isIntersecting || en.intersectionRatio<0.1) hide(m);
          else hydrate(m);
        }
      }
    }, {rootMargin:'200px 0px', threshold:[0,0.1,0.5,0.6,1]});
    cards.forEach(function(m){ io.observe(m.box); });
  }

  function registerBox(box){
    if(byBox.has(box)) return;
    var img = $('.static-img', box);
    var vid = $('video.hover-img', box);
    if(!(img&&vid)) return;
    var m = {box:box,img:img,vid:vid,ready:false,hydrated:false};
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

  if(!('IntersectionObserver' in window) && IS_TOUCH){
    var onL=function(){ cards.forEach(show); };
    if(document.readyState==='complete') onL(); else window.addEventListener('load', onL, {once:true});
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
    cards.forEach(function(m){ prime(m.vid, IS_TOUCH); });
    var targets = cards.filter(function(m){ return inViewport(m.box,0.5); });
    targets.forEach(function(m){
      hydrate(m);
      try{ m.vid.muted=true; m.vid.setAttribute('muted',''); var p=m.vid.play(); if(p&&p.catch)p.catch(function(){}); }catch(e){}
    });
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
        if(m.box.dataset.playing && m.vid.paused && inViewport(m.box,0.5)){
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
      cards.forEach(function(m){ prime(m.vid, IS_TOUCH); });
    }
  }
  window.mediaAutoplayCardsRefresh = refresh;

  document.addEventListener('media-autoplay-cards:refresh', function(e){
    var root = (e && e.detail && e.detail.root) ? e.detail.root : document;
    refresh(root);
  });
})();
