/* Kezdőlap: a három modul összesítő számai. */
(function (root) {
  const S = root.Sulipont;
  const { $ } = S.ui;
  const D = S.dates;

  const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

  /** A mai nap a naptárlapon. */
  function leaf() {
    const d = D.parseISO(S.state.today);
    $('#leaf-month').textContent = MONTHS[d.getMonth()];
    $('#leaf-day').textContent = d.getDate();
    $('#leaf-week').textContent = D.dayName(S.state.today);
  }

  function show() {
    leaf();
    const { found, exams, books } = S.repos;
    const week = D.weekDays(D.mondayOf(D.nextSchoolDay(S.state.today)));
    const thisWeek = exams.list().filter((x) => week.includes(x.date));
    const crowded = S.exams.overloaded(exams.list(), { dates: week });

    $('#n-found').textContent = found.list().filter((x) => x.status === 'talalt').length;
    $('#n-exams').textContent = thisWeek.length;
    $('#n-books').textContent = books.list().length;

    const warn = $('#n-warn');
    warn.hidden = crowded.length === 0;
    warn.textContent = crowded.length === 1 ? 'Torlódás!' : `${crowded.length} torlódás!`;
  }

  S.views = S.views || {};
  S.views.kezdolap = { show };
})(window);
