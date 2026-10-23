/* Dátum segédek. A dátumokat helyi időben, "YYYY-MM-DD" szövegként kezeljük (az <input type="date"> is ezt adja). */
(function (root) {
  const DAYS = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
  const pad = (n) => String(n).padStart(2, '0');

  function toISO(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  const todayISO = () => toISO(new Date());

  /** Érvénytelen vagy nem létező dátumra (pl. 2026-02-31) null-t ad. */
  function parseISO(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return toISO(d) === s ? d : null;
  }

  function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
  function isWeekend(iso) { const w = parseISO(iso).getDay(); return w === 0 || w === 6; }
  function mondayOf(iso) { return addDays(iso, -((parseISO(iso).getDay() + 6) % 7)); }
  function weekDays(mondayIso) { return [0, 1, 2, 3, 4].map((i) => addDays(mondayIso, i)); }
  function nextSchoolDay(iso) { let d = iso; while (isWeekend(d)) d = addDays(d, 1); return d; }

  /** b - a napban (UTC-vel számolva, hogy az óraátállítás ne zavarjon). */
  function daysBetween(a, b) {
    const x = parseISO(a), y = parseISO(b);
    return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86400000);
  }

  const dayName = (iso) => DAYS[parseISO(iso).getDay()];
  /** 2026. 11. 16. (hétfő) */
  function formatDate(iso) { const d = parseISO(iso); return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}. (${DAYS[d.getDay()].toLowerCase()})`; }
  /** 11. 16. */
  function shortDate(iso) { const d = parseISO(iso); return `${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`; }

  const api = { toISO, todayISO, parseISO, addDays, isWeekend, mondayOf, weekDays, nextSchoolDay, daysBetween, dayName, formatDate, shortDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.Sulipont = root.Sulipont || {}; root.Sulipont.dates = api; }
})(typeof window !== 'undefined' ? window : globalThis);
