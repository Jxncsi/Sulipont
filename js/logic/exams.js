/* Dolgozat- és beadandónaptár: validáció, napi terhelés, heti nézet. Nincs DOM-függés, Node-ban tesztelhető. */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const data = isNode ? require('../core/data.js') : root.Sulipont.data;
  const D = isNode ? require('../core/dates.js') : root.Sulipont.dates;
  const { MAX_EXAMS_PER_DAY: MAX } = data;

  const len = (s) => String(s ?? '').trim().length;

  /** Hibaobjektum a mezők kulcsaival (üres = érvényes). A „class" kulcs az osztály mezőé. */
  function validate(item, today) {
    const e = {};
    if (!data.CLASSES.includes(item.className)) e.class = 'Válassz osztályt.';
    if (!D.parseISO(item.date)) e.date = 'Add meg az időpontot.';
    else if (item.date < today) e.date = 'Múltbeli időpontra nem vehető fel számonkérés.';
    else if (D.isWeekend(item.date)) e.date = 'Hétvégére nem lehet számonkérést tenni.';
    if (!data.SUBJECTS.includes(item.subject)) e.subject = 'Válassz tantárgyat.';
    if (!data.EXAM_TYPES.includes(item.type)) e.type = 'Válassz típust.';
    if (len(item.teacher) < 3) e.teacher = 'Add meg a tanár nevét (legalább 3 karakter).';
    return e;
  }

  /** Hány számonkérése van az osztálynak azon a napon. */
  function countOnDay(exams, className, date) {
    return exams.filter((x) => x.className === className && x.date === date).length;
  }

  /** Igaz, ha még egy számonkérés felvétele a napi határ (MAX) fölé vinné az osztályt. */
  function wouldOverload(exams, className, date) {
    return countOnDay(exams, className, date) >= MAX;
  }

  /** Azok az (osztály, nap) párok, ahol háromnál több számonkérés van. dates / className szűkíthet. */
  function overloaded(exams, { dates = null, className = '' } = {}) {
    const counts = new Map();
    for (const x of exams) {
      if ((dates && !dates.includes(x.date)) || (className && x.className !== className)) continue;
      const key = `${x.date}|${x.className}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts]
      .filter(([, n]) => n > MAX)
      .map(([key, count]) => { const [date, cls] = key.split('|'); return { date, className: cls, count }; })
      .sort((a, b) => a.date.localeCompare(b.date) || a.className.localeCompare(b.className, 'hu', { numeric: true }));
  }

  /** A hét öt napja: [{ date, items, over }]. A className szűr (üres = minden osztály); over: a túlterhelt osztályok listája. */
  function week(exams, mondayIso, className = '') {
    const dates = D.weekDays(mondayIso);
    const over = overloaded(exams, { dates, className });
    return dates.map((date) => ({
      date,
      items: exams
        .filter((x) => x.date === date && (!className || x.className === className))
        .sort((a, b) => a.className.localeCompare(b.className, 'hu', { numeric: true }) || a.subject.localeCompare(b.subject, 'hu')),
      over: over.filter((o) => o.date === date),
    }));
  }

  const api = { validate, countOnDay, wouldOverload, overloaded, week, MAX };
  if (isNode) module.exports = api;
  else { root.Sulipont = root.Sulipont || {}; root.Sulipont.exams = api; }
})(typeof window !== 'undefined' ? window : globalThis);
