/* UI segédek: DOM építés, értesítés, megerősítő modal, űrlaphibák. */
(function (root) {
  const S = (root.Sulipont = root.Sulipont || {});

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** el('div', {class:'x', text:'szöveg', onclick: fn}, ...gyerekek). A felhasználói szöveg mindig textContent-en át kerül be (nincs innerHTML). */
  function el(tag, props = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid);
    return n;
  }

  /** <select> feltöltése: options lehet szöveg- vagy {value,label} lista. */
  function fillSelect(select, options, { placeholder } = {}) {
    const opts = options.map((o) => (typeof o === 'object' ? el('option', { value: o.value, text: o.label }) : el('option', { value: o, text: o })));
    if (placeholder) opts.unshift(el('option', { value: '', text: placeholder }));
    select.replaceChildren(...opts);
  }

  function toast(message, type = 'ok') {
    const t = el('div', { class: `toast toast-${type}`, role: type === 'bad' ? 'alert' : 'status', text: message });
    $('#toast-region').append(t);
    setTimeout(() => t.remove(), 4500);
  }

  /** Megerősítő modal; Promise<boolean>. Ha a <dialog> nem támogatott, a böngésző confirm()-ját használja. */
  function confirmDialog({ title, text, okLabel = 'Rendben', danger = true }) {
    const dlg = $('#confirm-dialog');
    if (typeof dlg.showModal !== 'function') return Promise.resolve(window.confirm(`${title}\n${text}`));
    $('#dlg-title').textContent = title;
    $('#dlg-text').textContent = text;
    const ok = $('#dlg-ok');
    ok.textContent = okLabel;
    ok.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
    dlg.returnValue = '';
    return new Promise((resolve) => {
      dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
      dlg.showModal();
    });
  }

  /**
   * Űrlaphibák kiírása. Konvenció: a mező id-ja `<prefix>-<kulcs>`, a hibaüzeneté `err-<prefix>-<kulcs>`,
   * az általános hibáé `err-<prefix>-form`. Visszaadja, hogy volt-e hiba; az első hibás mezőre fókuszál.
   */
  function showErrors(prefix, keys, errors) {
    for (const k of keys) {
      const msg = errors[k] || '';
      const err = $(`#err-${prefix}-${k}`);
      const input = $(`#${prefix}-${k}`);
      if (err) err.textContent = msg;
      if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    }
    const general = $(`#err-${prefix}-form`);
    if (general) general.textContent = errors.form || '';
    const first = keys.find((k) => errors[k]);
    if (first) $(`#${prefix}-${first}`).focus();
    return Boolean(first || errors.form);
  }

  /** Egy mező hibáját módosításkor azonnal törli. */
  function clearErrorsOnInput(form, prefix, keys) {
    form.addEventListener('input', (e) => {
      const k = e.target.id.slice(prefix.length + 1);
      if (keys.includes(k)) { $(`#err-${prefix}-${k}`).textContent = ''; e.target.removeAttribute('aria-invalid'); }
      const general = $(`#err-${prefix}-form`);
      if (general) general.textContent = '';
    });
  }

  S.ui = { $, $$, el, fillSelect, toast, confirmDialog, showErrors, clearErrorsOnInput };
})(window);
