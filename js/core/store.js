/* Tárolás: localStorage, memóriás tartalékkal (privát módban vagy tele tárolónál sem omlik össze az oldal). */
(function (root) {
  const S = (root.Sulipont = root.Sulipont || {});
  const memory = {};

  function read(key) {
    if (key in memory) return memory[key];
    try { const raw = localStorage.getItem(key); return raw === null ? null : JSON.parse(raw); } catch { return null; }
  }

  /** true, ha tartósan sikerült menteni; false esetén az adat csak az oldal bezárásáig él. */
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); delete memory[key]; return true; }
    catch { memory[key] = value; return false; }
  }

  const makeId = (prefix = 'x') => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /** Elemek listája, első indításnál a seedFn() adataival. Az új elem előre kerül. */
  function collection(key, seedFn) {
    let items = null;
    const load = () => {
      if (items) return items;
      const saved = read(key);
      if (Array.isArray(saved)) items = saved;
      else { items = seedFn ? seedFn() : []; write(key, items); }
      return items;
    };
    return {
      list: load,
      save: () => write(key, load()),
      add(item) { load().unshift(item); return write(key, items); },
      remove(id) { items = load().filter((x) => x.id !== id); return write(key, items); },
      update(id, patch) { const it = load().find((x) => x.id === id); if (it) Object.assign(it, patch); return write(key, items); },
    };
  }

  /** Azonosítók halmaza (pl. kedvencek). */
  function idSet(key) {
    const load = () => { const v = read(key); return new Set(Array.isArray(v) ? v : []); };
    return {
      has: (id) => load().has(id),
      all: () => [...load()],
      /** Átkapcsolja; visszaadja az új állapotot (true = benne van). */
      toggle(id) {
        const set = load();
        const on = !set.has(id);
        if (on) set.add(id); else set.delete(id);
        write(key, [...set]);
        return on;
      },
      /** Eltávolítja az azonosítót (pl. törölt hirdetés kedvenc-jelölését). */
      drop(id) { const set = load(); if (set.delete(id)) write(key, [...set]); },
    };
  }

  S.store = { collection, idSet, makeId };
})(window);
