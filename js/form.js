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

    // ����� �� ������ "������/����� �������"
    details?.addEventListener('toggle', () => {
      if (!summaryT) return;
      summaryT.textContent = details.open ? (summaryT.dataset.close || '����� �������')
                                          : (summaryT.dataset.open  || '����� ���������');
    });

    // �����: ����� � �����
    btnCancel?.addEventListener('click', () => {
      form?.reset();
      details?.removeAttribute('open');
    });

    // �������: ��������� �� ����� + ������� + reset
    function showSuccess() {
      details?.removeAttribute('open');
      if (success) {
        success.hidden = false;
        try { success.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
      }
      form?.reset();
      btnSend?.removeAttribute('disabled');
    }

    // ������������ ��� application/x-www-form-urlencoded (��-�������� �� Google Forms)
    function toUrlEncoded(fd) {
      const p = new URLSearchParams();
      for (const [k,v] of fd.entries()) p.append(k, v);
      p.append('_ts', Date.now()); // ����-cache
      return p.toString();
    }

    // Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      btnSend?.setAttribute('disabled', 'true');

      // 1) ������� ����������� ����� ������� � �� � reset/���������
      const payload = toUrlEncoded(new FormData(form));
      const action  = form.action;

      // 2) ������� � fetch (no-cors). ��� ������� ������ � ������ � iframe.
      fetch(action, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload
      })
      .then(() => {
        // �� ����� �� ����� �������� (no-cors), �� �������� � �������� > ��������� �����
        showSuccess();
      })
      .catch(() => {
        // ������: ������� onload �� ������� iframe (� � ������ �� ����� ������)
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

  // ���������� �������, ��� �������� ���� � ������� ��������
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();


