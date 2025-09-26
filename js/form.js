// /js/form.js
(function () {
  function init() {
    const section  = document.getElementById('free-advice');
    if (!section) return;

    const details  = section.querySelector('#adviceReveal');
    const summaryT = section.querySelector('.advice-summary-btn .btn-text');
    const success  = section.querySelector('#adviceSuccess');
    const form     = section.querySelector('#adviceForm');
    const btnSend  = section.querySelector('.btn-submit');
    const btnCancel= section.querySelector('#cancelForm');
    const sink     = section.querySelector('#hidden_gform');

    // РЎРјСЏРЅР° РЅР° С‚РµРєСЃС‚Р° "РћС‚РІРѕСЂРё/РЎРєСЂРёР№ С„РѕСЂРјР°С‚Р°"
    details?.addEventListener('toggle', () => {
      if (!summaryT) return;
      summaryT.textContent = details.open ? (summaryT.dataset.close || 'РЎРєСЂРёР№ С„РѕСЂРјР°С‚Р°')
                                          : (summaryT.dataset.open  || 'РџСѓСЃРЅРё Р·Р°РїРёС‚РІР°РЅРµ');
    });

    // РћС‚РєР°Р·: С‡РёСЃС‚Рё Рё СЃРІРёРІР°
    btnCancel?.addEventListener('click', () => {
      form?.reset();
      details?.removeAttribute('open');
    });

    // РџРѕРјРѕС‰РЅР°: РїРѕРєР°Р·РІР°РЅРµ РЅР° СѓСЃРїРµС… + СЃРІРёРІР°РЅРµ + reset
    function showSuccess() {
      details?.removeAttribute('open');
      if (success) {
        success.hidden = false;
        try { success.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
      }
      form?.reset();
      btnSend?.removeAttribute('disabled');
    }

    // РЎРµСЂРёР°Р»РёР·Р°С†РёСЏ РєСЉРј application/x-www-form-urlencoded (РїРѕ-РЅР°РґРµР¶РґРЅРѕ Р·Р° Google Forms)
    function toUrlEncoded(fd) {
      const p = new URLSearchParams();
      for (const [k,v] of fd.entries()) p.append(k, v);
      p.append('_ts', Date.now()); // Р°РЅС‚Рё-cache
      return p.toString();
    }

    // Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      btnSend?.setAttribute('disabled', 'true');

      // 1) Р’Р·РµРјР°РјРµ СЃС‚РѕР№РЅРѕСЃС‚РёС‚Рµ РџР Р•Р”Р РєР°РєРІРѕС‚Рѕ Рё РґР° Рµ reset/Р·Р°С‚РІР°СЂСЏРЅРµ
      const payload = toUrlEncoded(new FormData(form));
      const action  = form.action;

      // 2) РџСЂР°С‰Р°РјРµ СЃ fetch (no-cors). РџСЂРё РјСЂРµР¶РѕРІР° РіСЂРµС€РєР° вЂ” С„РѕР»Р±РµРє СЃ iframe.
      fetch(action, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload
      })
      .then(() => {
        // РќРµ РјРѕР¶РµРј РґР° С‡РµС‚РµРј РѕС‚РіРѕРІРѕСЂР° (no-cors), РЅРѕ Р·Р°СЏРІРєР°С‚Р° Рµ С‚СЂСЉРіРЅР°Р»Р° в†’ РїРѕРєР°Р·РІР°РјРµ СѓСЃРїРµС…
        showSuccess();
      })
      .catch(() => {
        // Р¤РѕР»Р±РµРє: СЃР»СѓС€Р°РјРµ onload РЅР° СЃРєСЂРёС‚РёСЏ iframe (Рё СЃ С‚Р°Р№РјРµСЂ Р·Р° РІСЃРµРєРё СЃР»СѓС‡Р°Р№)
        let done = false;
        const onLoadOnce = () => {
          if (done) return;
          done = true;
          sink?.removeEventListener('load', onLoadOnce);
          showSuccess();
        };
        sink?.addEventListener('load', onLoadOnce, { once: true });
        const t = setTimeout(onLoadOnce, 1500);
        try { form.submit(); } catch(_) {
          clearTimeout(t);
          btnSend?.removeAttribute('disabled');
        }
      });
    });
  }

  // РЎС‚Р°СЂС‚РёСЂР°РјРµ СЃРёРіСѓСЂРЅРѕ, Р±РµР· Р·РЅР°С‡РµРЅРёРµ РєСЉРґРµ Рµ РІРєР»СЋС‡РµРЅ СЃРєСЂРёРїС‚СЉС‚
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
