/* Új dolgozat vagy beadandó felvétele. Mentés előtt jelzi a torlódást: ha az osztálynak a napra már van 3 számonkérése, megerősítést kér. */
(function (root) {
  const S = root.Sulipont;
  const { $, fillSelect, toast, confirmDialog, showErrors, clearErrorsOnInput } = S.ui;
  const D = S.dates, E = S.exams;
  const { CLASSES, SUBJECTS, EXAM_TYPES } = S.data;

  const KEYS = ['class', 'date', 'subject', 'type', 'teacher'];

  function read() {
    return {
      id: S.store.makeId('d'),
      className: $('#d-class').value,
      date: $('#d-date').value,
      subject: $('#d-subject').value,
      type: $('#d-type').value,
      teacher: $('#d-teacher').value.trim(),
      topic: $('#d-topic').value.trim(),
    };
  }

  /** Élő tájékoztatás az osztály aznapi terheléséről. */
  function updateHint() {
    const cls = $('#d-class').value, date = $('#d-date').value;
    const hint = $('#d-hint');
    hint.classList.remove('hint-warn');
    if (!cls || !D.parseISO(date)) { hint.textContent = ''; return; }
    const n = E.countOnDay(S.repos.exams.list(), cls, date);
    if (E.wouldOverload(S.repos.exams.list(), cls, date)) {
      hint.classList.add('hint-warn');
      hint.textContent = `Figyelem: a(z) ${cls} osztálynak ezen a napon már ${n} számonkérése van, ez a(z) ${n + 1}. lenne (naponta legfeljebb ${E.MAX} javasolt).`;
    } else {
      hint.textContent = n ? `A(z) ${cls} osztálynak ezen a napon már ${n} számonkérése van.` : `A(z) ${cls} osztálynak ezen a napon még nincs számonkérése.`;
    }
  }

  function reset(params) {
    $('#exam-form').reset();
    $('#d-date').value = D.nextSchoolDay(S.state.today);
    if (CLASSES.includes(params.class)) $('#d-class').value = params.class;
    showErrors('d', KEYS, {});
    updateHint();
  }

  async function submit(e) {
    e.preventDefault();
    const item = read();
    if (showErrors('d', KEYS, E.validate(item, S.state.today))) return;

    if (E.wouldOverload(S.repos.exams.list(), item.className, item.date)) {
      const n = E.countOnDay(S.repos.exams.list(), item.className, item.date);
      const ok = await confirmDialog({
        title: 'Torlódás: háromnál több számonkérés',
        text: `A(z) ${item.className} osztálynak ${D.formatDate(item.date)} már ${n} számonkérése van. Biztosan felveszed a(z) ${n + 1}.-et is?`,
        okLabel: 'Mégis felveszem', danger: false,
      });
      if (!ok) return;
    }
    const saved = S.repos.exams.add(item);
    toast(`Felvéve: ${item.className} – ${item.subject} (${item.type}), ${D.formatDate(item.date)}.`);
    if (!saved) toast('A böngésző tárolója megtelt: az adat csak az oldal bezárásáig marad meg.', 'bad');
    S.go('dolgozat', { week: item.date, class: item.className });
  }

  S.views = S.views || {};
  S.views['dolgozat-uj'] = {
    init() {
      fillSelect($('#d-class'), CLASSES, { placeholder: 'Válassz…' });
      fillSelect($('#d-subject'), SUBJECTS, { placeholder: 'Válassz…' });
      fillSelect($('#d-type'), EXAM_TYPES, { placeholder: 'Válassz…' });
      $('#d-date').min = S.state.today;
      const form = $('#exam-form');
      form.addEventListener('submit', submit);
      clearErrorsOnInput(form, 'd', KEYS);
      $('#d-class').addEventListener('change', updateHint);
      $('#d-date').addEventListener('change', updateHint);
    },
    show: reset,
  };
})(window);
