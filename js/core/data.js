/* Közös, statikus adatok (választólisták, korlátok). Böngészőben és Node-ban is betölthető. */
(function (root) {
  const data = {
    CATEGORIES: ['Ruházat', 'Kulacs és étel', 'Írószer', 'Táska', 'Kulcs és ékszer', 'Elektronika', 'Sport', 'Egyéb'],
    CATEGORY_ICONS: { 'Ruházat': '👕', 'Kulacs és étel': '🥤', 'Írószer': '✏️', 'Táska': '🎒', 'Kulcs és ékszer': '🔑', 'Elektronika': '🎧', 'Sport': '⚽', 'Egyéb': '📦' },

    SUBJECTS: ['Matematika', 'Magyar', 'Történelem', 'Angol', 'Német', 'Fizika', 'Kémia', 'Biológia', 'Földrajz', 'Informatika', 'Egyéb'],
    GRADES: [9, 10, 11, 12],
    CONDITIONS: ['Új', 'Jó', 'Elfogadható', 'Kopott'],
    MAX_PRICE: 20000,

    CLASSES: ['9.A', '9.B', '10.A', '10.B', '11.A', '11.B', '12.A', '12.B'],
    EXAM_TYPES: ['Dolgozat', 'Témazáró', 'Beadandó', 'Felelet'],
    /** Ennél több számonkérés egy osztálynak egy napra: figyelmeztetés. */
    MAX_EXAMS_PER_DAY: 3,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.Sulipont = root.Sulipont || {}; root.Sulipont.data = data; }
})(typeof window !== 'undefined' ? window : globalThis);
