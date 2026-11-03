/* Tankönyv- és jegyzetbörze: validáció, keresés/rendezés, ár- és elérhetőség-kezelés. Nincs DOM-függés, Node-ban tesztelhető. */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const data = isNode ? require('../core/data.js') : root.Sulipont.data;

  const len = (s) => String(s ?? '').trim().length;

  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
  /** Telefonszám: csak számjegy, szóköz, +, -, (, ), / karakterek, 7–15 számjeggyel. */
  function isPhone(s) {
    const t = String(s).trim();
    const digits = t.replace(/\D/g, '').length;
    return /^[+\d\s()\-/]+$/.test(t) && digits >= 7 && digits <= 15;
  }
  const isContact = (s) => isEmail(s) || isPhone(s);

  /** Hibaobjektum a mezők kulcsaival (üres = érvényes). */
  function validate(item) {
    const e = {};
    if (len(item.title) < 3) e.title = 'Add meg a könyv címét (legalább 3 karakter).';
    if (!data.SUBJECTS.includes(item.subject)) e.subject = 'Válassz tantárgyat.';
    if (!data.GRADES.includes(item.grade)) e.grade = 'Válassz évfolyamot.';
    if (!data.CONDITIONS.includes(item.condition)) e.condition = 'Válassz állapotot.';
    if (!Number.isInteger(item.price)) e.price = 'Add meg az árat egész forintban (0 = ingyen).';
    else if (item.price < 0 || item.price > data.MAX_PRICE) e.price = `Az ár 0 és ${data.MAX_PRICE} Ft között lehet.`;
    if (len(item.seller) < 3) e.seller = 'Add meg a neved és az osztályodat.';
    if (!isContact(item.contact || '')) e.contact = 'Adj meg e-mail-címet vagy telefonszámot.';
    return e;
  }

  /**
   * Szűrés szövegre, tantárgyra, évfolyamra és kedvencekre; rendezés: 'new' (legújabb elöl) vagy 'price' (olcsóbb elöl, azonos árnál az újabb).
   * favorites: azonosítók tömbje; ha onlyFavorites igaz, csak ezek maradnak.
   */
  function filter(items, { q = '', subject = '', grade = '', sort = 'new', onlyFavorites = false, favorites = [] } = {}) {
    const needle = q.trim().toLowerCase();
    const fav = new Set(favorites);
    return items
      .filter((b) => (!subject || b.subject === subject)
        && (!grade || b.grade === Number(grade))
        && (!onlyFavorites || fav.has(b.id))
        && (!needle || `${b.title} ${b.subject} ${b.description || ''}`.toLowerCase().includes(needle)))
      .sort((a, b) => (sort === 'price' ? a.price - b.price || b.createdAt - a.createdAt : b.createdAt - a.createdAt));
  }

  /** 1800 → "1 800 Ft" (szóköz helyett nem törhető szóközzel), 0 → "Ingyen" */
  function formatPrice(n) {
    if (n === 0) return 'Ingyen';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';
  }

  const api = { isEmail, isPhone, isContact, validate, filter, formatPrice };
  if (isNode) module.exports = api;
  else { root.Sulipont = root.Sulipont || {}; root.Sulipont.books = api; }
})(typeof window !== 'undefined' ? window : globalThis);
