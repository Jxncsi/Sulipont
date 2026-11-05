/* Dolgozatnaptár: heti nézet osztályonként, torlódás-figyelmeztetéssel. */
(function (root) {
  const S = root.Sulipont;
  const { $, el, fillSelect, toast, confirmDialog } = S.ui;
  const D = S.dates, E = S.exams;
  const { CLASSES } = S.data;

  const repo = () => S.repos.exams;
  const st = { monday: null, className: '' }; // className: üres = minden osztály

  const startMonday = () => D.mondayOf(D.nextSchoolDay(S.state.today));

  /** Tantárgyszín: a SUBJECTS sorrendje szerint (a CSS-ben .sub-0 … .sub-10). */
  const subjectClass = (subject) => `sub-${Math.max(0, S.data.SUBJECTS.indexOf(subject))}`;

  function examCard(x, showClass) {
    return el('article', { class: `exam ${subjectClass(x.subject)}` },
      el('div', { class: 'exam-head' },
        el('strong', { text: x.subject }),
        el('span', { class: 'chip', text: x.type }),
        showClass ? el('span', { class: 'chip', text: x.className }) : null),
      el('p', { class: 'exam-teacher', text: x.teacher }),
      x.topic ? el('p', { class: 'exam-topic', text: x.topic }) : null,
      el('button', { class: 'exam-del', type: 'button', title: 'Törlés', 'aria-label': `Törlés: ${x.className} ${x.subject}`, onclick: () => remove(x) }, S.ui.icon('trash')));
  }

  function dayColumn({ date, items, over }) {
    const classes = ['day'];
    if (date === S.state.today) classes.push('is-today');
    if (over.length) classes.push('is-over');
    return el('section', { class: classes.join(' '), 'aria-label': `${D.dayName(date)} ${D.shortDate(date)}` },
      el('header', { class: 'day-head' },
        el('h3', { text: D.dayName(date) }),
        el('span', { class: 'day-date', text: D.shortDate(date) }),
        el('span', { class: 'day-count', text: String(items.length), title: `${items.length} számonkérés` })),
      el('div', { class: 'day-body' },
        items.length ? items.map((x) => examCard(x, !st.className)) : el('p', { class: 'day-empty', text: 'szabad nap' })));
  }

  function render() {
    if (!st.monday) return;
    const days = E.week(repo().list(), st.monday, st.className);
    $('#w-class').value = st.className;
    $('#week-label').textContent = `${st.monday.slice(0, 4)}. ${D.shortDate(days[0].date)} – ${D.shortDate(days[4].date)}`;

    const warnings = days.flatMap((d) => d.over);
    const box = $('#week-warnings');
    box.hidden = warnings.length === 0;
    box.replaceChildren(...warnings.map((w) => el('li', {}, S.ui.icon('alert', 'var(--sun)'),
      el('span', { text: `Figyelem: a(z) ${w.className} osztálynak ${D.dayName(w.date).toLowerCase()} (${D.shortDate(w.date)}) ${w.count} számonkérése van, naponta legfeljebb ${E.MAX} javasolt.` }))));

    $('#week-board').replaceChildren(...days.map(dayColumn));
  }

  async function remove(x) {
    const ok = await confirmDialog({ title: 'Törlöd a számonkérést?', text: `${x.className} – ${x.subject} (${x.type}), ${D.formatDate(x.date)}.`, okLabel: 'Törlés' });
    if (!ok) return;
    repo().remove(x.id);
    render();
    toast('A számonkérés törölve.');
  }

  const shift = (n) => { st.monday = D.addDays(st.monday, n * 7); render(); };

  S.views = S.views || {};
  S.views.dolgozat = {
    init() {
      fillSelect($('#w-class'), CLASSES, { placeholder: 'Összes osztály' });
      $('#w-class').addEventListener('change', (e) => { st.className = e.target.value; render(); });
      $('#week-prev').addEventListener('click', () => shift(-1));
      $('#week-next').addEventListener('click', () => shift(1));
      $('#week-today').addEventListener('click', () => { st.monday = startMonday(); render(); });
    },
    /** params.week: egy dátum, amelynek a hetét mutatjuk; params.class: osztályszűrő (üres = összes). */
    show(params) {
      if (D.parseISO(params.week)) st.monday = D.mondayOf(params.week);
      else if (!st.monday) st.monday = startMonday();
      if (params.class !== undefined) st.className = CLASSES.includes(params.class) ? params.class : '';
      render();
    },
  };
})(window);
