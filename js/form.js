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

    // Смяна на текста "Отвори/Скрий формата"
    details?.addEventListener('toggle', () => {
      if (!summaryT) return;
      summaryT.textContent = details.open ? (summaryT.dataset.close || 'Скрий формата')
                                          : (summaryT.dataset.open  || 'Пусни запитване');
    });

    // Отказ: чисти и свива
    btnCancel?.addEventListener('click', () => {
      form?.reset();
      details?.removeAttribute('open');
    });

    // Помощна: показване на успех + свиване + reset
    function showSuccess() {
      details?.removeAttribute('open');
      if (success) {
        success.hidden = false;
        try { success.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
      }
      form?.reset();
      btnSend?.removeAttribute('disabled');
    }

    // Сериализация към application/x-www-form-urlencoded (по-надеждно за Google Forms)
    function toUrlEncoded(fd) {
      const p = new URLSearchParams();
      for (const [k,v] of fd.entries()) p.append(k, v);
      p.append('_ts', Date.now()); // анти-cache
      return p.toString();
    }

    // Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      btnSend?.setAttribute('disabled', 'true');

      // 1) Вземаме стойностите ПРЕДИ каквото и да е reset/затваряне
      const payload = toUrlEncoded(new FormData(form));
      const action  = form.action;

      // 2) Пращаме с fetch (no-cors). При мрежова грешка — фолбек с iframe.
      fetch(action, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload
      })
      .then(() => {
        // Не можем да четем отговора (no-cors), но заявката е тръгнала → показваме успех
        showSuccess();
      })
      .catch(() => {
        // Фолбек: слушаме onload на скрития iframe (и с таймер за всеки случай)
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

  // Стартираме сигурно, без значение къде е включен скриптът
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
