/* Talált tárgyak: validáció, szűrés, igénylés. Nincs DOM-függés, Node-ban tesztelhető. */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const data = isNode ? require('../core/data.js') : root.Sulipont.data;
  const D = isNode ? require('../core/dates.js') : root.Sulipont.dates;

  const len = (s) => String(s ?? '').trim().length;

  /** Hibaobjektum a mezők kulcsaival (üres = érvényes). */
  function validate(item, today) {
    const e = {};
    if (len(item.name) < 2) e.name = 'Add meg a tárgy nevét (legalább 2 karakter).';
    if (!data.CATEGORIES.includes(item.category)) e.category = 'Válassz kategóriát.';
    if (len(item.place) < 2) e.place = 'Add meg, hol találták.';
    if (!D.parseISO(item.date)) e.date = 'Add meg a dátumot.';
    else if (item.date > today) e.date = 'A találás dátuma nem lehet a jövőben.';
    return e;
  }

  /** Igényléskor a név (és osztály) megadása kötelező. Üres szöveg = rendben. */
  function validateClaim(name) {
    return len(name) < 3 ? 'Add meg a neved és az osztályodat (legalább 3 karakter).' : '';
  }

  /** Szűrés szövegre, kategóriára és dátumtartományra (zárt intervallum). Fordított tartományt (mettől > meddig) felcseréli. A legújabb elöl. */
  function filter(items, { q = '', category = '', from = '', to = '', hideClaimed = false } = {}) {
    let lo = from, hi = to;
    if (lo && hi && lo > hi) [lo, hi] = [hi, lo];
    const needle = q.trim().toLowerCase();
    return items
      .filter((it) => (!category || it.category === category)
        && (!lo || it.date >= lo)
        && (!hi || it.date <= hi)
        && (!hideClaimed || it.status !== 'igenyelve')
        && (!needle || `${it.name} ${it.place} ${it.description || ''}`.toLowerCase().includes(needle)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  const claim = (item, name, today) => ({ ...item, status: 'igenyelve', claimedBy: String(name).trim(), claimedAt: today });
  const unclaim = (item) => ({ ...item, status: 'talalt', claimedBy: null, claimedAt: null });

  /** „ma", „tegnap", „5 napja" */
  function agoLabel(date, today) {
    const n = D.daysBetween(date, today);
    if (n <= 0) return 'ma';
    if (n === 1) return 'tegnap';
    return `${n} napja`;
  }

  const api = { validate, validateClaim, filter, claim, unclaim, agoLabel };
  if (isNode) module.exports = api;
  else { root.Sulipont = root.Sulipont || {}; root.Sulipont.found = api; }
})(typeof window !== 'undefined' ? window : globalThis);
