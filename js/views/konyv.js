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

  function favButton(b) {
    const on = favs().has(b.id);
    return el('button', {
      class: 'fav' + (on ? ' is-on' : ''), type: 'button', 'aria-pressed': String(on),
      'aria-label': on ? `Kivétel a kedvencek közül: ${b.title}` : `Kedvencnek jelölöm: ${b.title}`,
      onclick: () => { favs().toggle(b.id); render(); },
      text: on ? '♥' : '♡',
    });
  }

  function card(b) {
    return el('article', { class: 'card book' },
      el('div', { class: 'book-head' }, el('h3', { text: b.title }), favButton(b)),
      el('ul', { class: 'chips', 'aria-label': 'Jellemzők' },
        el('li', { class: 'chip', text: b.subject }),
        el('li', { class: 'chip chip-plain', text: `${b.grade}. évfolyam` }),
        el('li', { class: 'chip ' + (CONDITION_CLASS[b.condition] || ''), text: b.condition })),
      el('p', { class: 'price', text: B.formatPrice(b.price) }),
      b.description ? el('p', { class: 'meta', text: b.description }) : null,
      el('p', { class: 'meta' }, 'Eladó: ', b.seller),
      el('p', { class: 'meta' }, 'Kapcsolat: ', contactNode(b.contact)),
      el('div', { class: 'card-actions' },
        el('button', { class: 'btn btn-small btn-ghost', type: 'button', text: 'Hirdetés törlése', 'aria-label': `Hirdetés törlése: ${b.title}`, onclick: () => remove(b) })));
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
