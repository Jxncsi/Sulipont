/* Tankönyvbörze: hirdetések keresése tantárgyra és évfolyamra, kedvencek. */
(function (root) {
  const S = root.Sulipont;
  const { $, el, fillSelect, toast, confirmDialog } = S.ui;
  const B = S.books;
  const { SUBJECTS, GRADES } = S.data;

  const repo = () => S.repos.books;
  const favs = () => S.repos.favorites;
  const CONDITION_CLASS = { 'Új': 'chip-ok', 'Jó': 'chip-ok', 'Elfogadható': 'chip-plain', 'Kopott': 'chip-warn' };

  /** E-mail → mailto:, telefonszám → tel:, egyébként sima szöveg. */
  function contactNode(contact) {
    if (B.isEmail(contact)) return el('a', { href: `mailto:${contact.trim()}`, text: contact });
    if (B.isPhone(contact)) return el('a', { href: `tel:${contact.replace(/[^\d+]/g, '')}`, text: contact });
    return document.createTextNode(contact);
  }

  const subjectClass = (subject) => `sub-${Math.max(0, SUBJECTS.indexOf(subject))}`;

  /** Ármatrica: 1 800 Ft → „1 800 / Ft", 0 → „Ingyen". */
  function priceSticker(price) {
    if (price === 0) return el('div', { class: 'price price-free' }, el('b', { text: 'Ingyen' }));
    return el('div', { class: 'price' }, el('b', { text: B.formatPrice(price).replace(/ Ft$/, '') }), el('small', { text: 'Ft' }));
  }

  /** A kedvenc-gombot helyben frissítjük (így a szív animációja nem indul újra minden újrarajzoláskor). */
  function paintFav(btn, b, on) {
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? `Kivétel a kedvencek közül: ${b.title}` : `Kedvencnek jelölöm: ${b.title}`);
    btn.replaceChildren(S.ui.icon('heart', on ? 'var(--tomato)' : 'var(--card)'));
  }

  function favButton(b) {
    const btn = el('button', { class: 'fav', type: 'button' });
    paintFav(btn, b, favs().has(b.id));
    btn.addEventListener('click', () => {
      const on = favs().toggle(b.id);
      paintFav(btn, b, on);
      if ($('#k-fav').checked) render();                       // „csak a kedvenceim" nézetben a lista változik
      else if (on) { btn.classList.add('beat'); btn.addEventListener('animationend', () => btn.classList.remove('beat'), { once: true }); }
    });
    return btn;
  }

  function card(b) {
    return el('article', { class: `book ${subjectClass(b.subject)}` },
      priceSticker(b.price),
      el('ul', { class: 'chips', 'aria-label': 'Jellemzők' },
        el('li', { class: 'chip', text: b.subject }),
        el('li', { class: 'chip chip-plain', text: `${b.grade}. évf.` }),
        el('li', { class: 'chip ' + (CONDITION_CLASS[b.condition] || ''), text: b.condition })),
      el('h3', { text: b.title }),
      b.description ? el('p', { class: 'book-note', text: b.description }) : null,
      el('p', { class: 'meta' }, 'Eladó: ', el('strong', { text: b.seller })),
      el('p', { class: 'meta' }, 'Kapcsolat: ', contactNode(b.contact)),
      el('div', { class: 'card-actions' },
        favButton(b),
        el('button', { class: 'btn btn-small btn-ghost', type: 'button', 'aria-label': `Hirdetés törlése: ${b.title}`, onclick: () => remove(b) }, S.ui.icon('trash'), 'Törlés')));
  }

  async function remove(b) {
    const ok = await confirmDialog({ title: 'Törlöd a hirdetést?', text: `${b.title} (${B.formatPrice(b.price)}). A művelet nem vonható vissza.`, okLabel: 'Törlés' });
    if (!ok) return;
    repo().remove(b.id);
    favs().drop(b.id);
    render();
    toast('A hirdetés törölve.');
  }

  function render() {
    const all = repo().list();
    const onlyFavorites = $('#k-fav').checked;
    const list = B.filter(all, {
      q: $('#k-q').value, subject: $('#k-subject').value, grade: $('#k-grade').value, sort: $('#k-sort').value,
      onlyFavorites, favorites: favs().all(),
    });
    $('#book-count').textContent = `${list.length} / ${all.length} hirdetés`;
    const empty = onlyFavorites && !favs().all().length ? 'Még nincs kedvenced: jelölj meg egy hirdetést a ♡ gombbal.' : 'Nincs a keresésnek megfelelő hirdetés.';
    $('#book-grid').replaceChildren(...(list.length ? list.map(card) : [el('p', { class: 'empty', text: empty })]));
  }

  S.views = S.views || {};
  S.views.konyv = {
    init() {
      fillSelect($('#k-subject'), SUBJECTS, { placeholder: 'Összes' });
      fillSelect($('#k-grade'), GRADES.map((g) => ({ value: g, label: `${g}. évfolyam` })), { placeholder: 'Összes' });
      const form = $('#book-filters');
      form.addEventListener('input', render);
      form.addEventListener('submit', (e) => e.preventDefault());
    },
    show: render,
  };
})(window);
