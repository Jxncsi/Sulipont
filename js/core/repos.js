/* A három modul tárolói (a seed adatokkal az első indításhoz) és a kedvencek. */
(function (root) {
  const S = root.Sulipont;
  S.repos = {
    found: S.store.collection('sulipont.found.v1', S.seed.found),
    exams: S.store.collection('sulipont.exams.v1', S.seed.exams),
    books: S.store.collection('sulipont.books.v1', S.seed.books),
    favorites: S.store.idSet('sulipont.favorites.v1'),
  };
})(window);
