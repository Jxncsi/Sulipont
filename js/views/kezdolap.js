/* Kezdőlap: a három modul összesítő számai. */
(function (root) {
  const S = root.Sulipont;
  const { $ } = S.ui;
  const D = S.dates;

  function show() {
    const { found, exams, books } = S.repos;
    const week = D.weekDays(D.mondayOf(D.nextSchoolDay(S.state.today)));
    const thisWeek = exams.list().filter((x) => week.includes(x.date));
    const crowded = S.exams.overloaded(exams.list(), { dates: week });

    $('#n-found').textContent = found.list().filter((x) => x.status === 'talalt').length;
    $('#n-exams').textContent = thisWeek.length;
    $('#n-books').textContent = books.list().length;

    const warn = $('#n-warn');
    warn.hidden = crowded.length === 0;
    warn.textContent = crowded.length === 1 ? '1 torlódó nap' : `${crowded.length} torlódó nap`;
  }

  S.views = S.views || {};
  S.views.kezdolap = { show };
})(window);
