/* Talált tárgyak: fotós kártyák, szűrés kategóriára, dátumra és szövegre. */
(function (root) {
  const S = root.Sulipont;
  const { $, el, fillSelect, toast, confirmDialog } = S.ui;
  const D = S.dates, F = S.found;
  const { CATEGORIES, CATEGORY_ICONS } = S.data;

  const repo = () => S.repos.found;

  function media(it) {
    // Csak a saját kódunk által előállított képet jelenítjük meg.
    if (typeof it.photo === 'string' && it.photo.startsWith('data:image/')) {
      return el('img', { class: 'card-photo', src: it.photo, alt: it.name, loading: 'lazy' });
    }
    return el('div', { class: 'card-photo card-photo-empty', 'aria-hidden': 'true', text: CATEGORY_ICONS[it.category] || '📦' });
  }

  function actions(it) {
    const main = it.status === 'igenyelve'
      ? el('button', { class: 'btn btn-small', type: 'button', text: 'Mégsem az enyém', onclick: () => unclaim(it) })
      : el('button', { class: 'btn btn-primary', type: 'button', text: 'Ez az enyém!', 'aria-label': `Ez az enyém: ${it.name}`, onclick: () => openClaim(it) });
    return [
      main,
      el('button', { class: 'btn btn-small btn-ghost', type: 'button', text: 'Törlés', 'aria-label': `Törlés: ${it.name}`, onclick: () => remove(it) }),
    ];
  }

  /* „Ez az enyém!": a név megadása után a tárgy igényeltnek számít, és a portán át lehet venni. */
  let target = null;

  function openClaim(it) {
    target = it;
    const dlg = $('#claim-dialog');
    if (typeof dlg.showModal !== 'function') { // régi böngésző: egyszerű kérdés
      const name = window.prompt(`Ez az enyém: ${it.name}\nNeved és osztályod:`);
      if (name !== null) applyClaim(name);
      return;
    }
    $('#claim-text').textContent = `${it.name} – ${it.place}. Add meg, ki vagy, hogy a portán átvehesd.`;
    $('#c-name').value = '';
    S.ui.showErrors('c', ['name'], {});
    dlg.showModal();
    $('#c-name').focus();
  }

  function applyClaim(name) {
    const error = F.validateClaim(name);
    if (S.ui.showErrors('c', ['name'], error ? { name: error } : {})) return false;
    repo().update(target.id, F.claim(target, name, S.state.today));
    render();
    toast(`Köszönjük, ${name.trim()}! A tárgyat a portán veheted át.`);
    return true;
  }

  function unclaim(it) {
    repo().update(it.id, F.unclaim(it));
    render();
    toast('Az igénylést visszavontad, a tárgy újra szabad.');
  }

  function card(it) {
    const claimed = it.status === 'igenyelve';
    return el('article', { class: 'card item' + (claimed ? ' is-claimed' : '') },
      media(it),
      el('h3', { text: it.name }),
      el('ul', { class: 'chips', 'aria-label': 'Jellemzők' },
        el('li', { class: 'chip', text: it.category }),
        claimed && el('li', { class: 'chip chip-warn', text: 'Igényelve' })),
      el('p', { class: 'meta', text: `Hol: ${it.place}` }),
      el('p', { class: 'meta', text: `Mikor: ${D.formatDate(it.date)}, ${F.agoLabel(it.date, S.state.today)}` }),
      it.description ? el('p', { class: 'meta', text: it.description }) : null,
      claimed ? el('p', { class: 'meta', text: `Igényelte: ${it.claimedBy}` }) : null,
      el('div', { class: 'card-actions' }, actions(it)));
  }

  async function remove(it) {
    const ok = await confirmDialog({ title: 'Törlöd a tárgyat a listáról?', text: `${it.name} (${it.place}). A művelet nem vonható vissza.`, okLabel: 'Törlés' });
    if (!ok) return;
    repo().remove(it.id);
    render();
    toast('A tárgy törölve a listáról.');
  }

  function render() {
    const all = repo().list();
    const list = F.filter(all, {
      q: $('#f-q').value, category: $('#f-cat').value, from: $('#f-from').value, to: $('#f-to').value, hideClaimed: $('#f-hide').checked,
    });
    $('#found-count').textContent = `${list.length} / ${all.length} tárgy`;
    $('#found-grid').replaceChildren(...(list.length ? list.map(card) : [el('p', { class: 'empty', text: 'Nincs a szűrésnek megfelelő tárgy.' })]));
  }

  S.views = S.views || {};
  S.views.talalt = {
    init() {
      fillSelect($('#f-cat'), CATEGORIES, { placeholder: 'Összes' });
      $('#f-from').max = $('#f-to').max = S.state.today;
      const form = $('#found-filters');
      form.addEventListener('input', render);
      form.addEventListener('submit', (e) => e.preventDefault());

      S.ui.clearErrorsOnInput($('#claim-form'), 'c', ['name']);
      $('#claim-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (applyClaim($('#c-name').value)) $('#claim-dialog').close();
      });
      $('#claim-cancel').addEventListener('click', () => $('#claim-dialog').close());
    },
    show: render,
  };
})(window);
