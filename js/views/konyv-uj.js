/* Hirdetésfeladás: űrlap validációval. */
(function (root) {
  const S = root.Sulipont;
  const { $, fillSelect, toast, showErrors, clearErrorsOnInput } = S.ui;
  const B = S.books;
  const { SUBJECTS, GRADES, CONDITIONS } = S.data;

  const KEYS = ['title', 'subject', 'grade', 'condition', 'price', 'seller', 'contact'];

  function read() {
    const price = $('#b-price').value.trim();
    return {
      id: S.store.makeId('b'),
      title: $('#b-title').value.trim(),
      subject: $('#b-subject').value,
      grade: Number($('#b-grade').value) || NaN,   // a placeholder ('') érvénytelen évfolyam
      condition: $('#b-condition').value,
      price: price === '' ? NaN : Number(price),    // az üres mező nem 0 Ft
      seller: $('#b-seller').value.trim(),
      contact: $('#b-contact').value.trim(),
      description: $('#b-desc').value.trim(),
      createdAt: Date.now(),
    };
  }

  function submit(e) {
    e.preventDefault();
    const book = read();
    if (showErrors('b', KEYS, B.validate(book))) return;
    const saved = S.repos.books.add(book);
    toast(`Hirdetés feladva: ${book.title}.`);
    if (!saved) toast('A böngésző tárolója megtelt: a hirdetés csak az oldal bezárásáig marad meg.', 'bad');
    S.go('konyv');
  }

  S.views = S.views || {};
  S.views['konyv-uj'] = {
    init() {
      fillSelect($('#b-subject'), SUBJECTS, { placeholder: 'Válassz…' });
      fillSelect($('#b-grade'), GRADES.map((g) => ({ value: g, label: `${g}. évfolyam` })), { placeholder: 'Válassz…' });
      fillSelect($('#b-condition'), CONDITIONS, { placeholder: 'Válassz…' });
      const form = $('#book-form');
      form.addEventListener('submit', submit);
      clearErrorsOnInput(form, 'b', KEYS);
    },
    show() {
      $('#book-form').reset();
      showErrors('b', KEYS, {});
    },
  };
})(window);
