'use strict';
/* Dolgozat- és beadandónaptár: heti nézet osztályonként, új dolgozat, figyelmeztetés, ha egy napra háromnál több esik. */

/* ===== Adatok ===== */
const KEY = 'sulipont.exams';
const SUBJECTS = ['Matematika', 'Magyar', 'Történelem', 'Angol', 'Német', 'Fizika', 'Kémia', 'Biológia', 'Földrajz', 'Informatika', 'Egyéb'];
const CLASSES = ['9.A', '9.B', '10.A', '10.B', '11.A', '11.B', '12.A', '12.B'];
const TYPES = ['Dolgozat', 'Témazáró', 'Beadandó', 'Felelet'];
const MAX = 3; // ennél több számonkérés egy osztálynak egy napra: figyelmeztetés

/* ===== Dátumok: "ÉÉÉÉ-HH-NN" szövegek, UTC-ben számolva (így az óraátállítás nem zavar) ===== */
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date().toLocaleDateString('sv'); // a mai nap, helyi idő szerint
const addDays = (date, n) => new Date(Date.parse(date) + n * MS_PER_DAY).toISOString().slice(0, 10);
const weekday = (date) => new Date(date).getUTCDay(); // 0 = vasárnap, 6 = szombat
const isDate = (s) => /^\d{4}-\d\d-\d\d$/.test(s) && !isNaN(Date.parse(s)) && addDays(s, 0) === s; // a 2026-02-31 nem dátum
const isWeekend = (date) => [0, 6].includes(weekday(date));
const mondayOf = (date) => addDays(date, -((weekday(date) + 6) % 7));
const weekDays = (monday) => [0, 1, 2, 3, 4].map((n) => addDays(monday, n));
const nextSchoolDay = (date) => (isWeekend(date) ? nextSchoolDay(addDays(date, 1)) : date);
const DAYS = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
const shortDate = (s) => s.slice(5).replace('-', '. ') + '.'; // 2026-11-12 → 11. 12.
const longDate = (s) => `${s.replaceAll('-', '. ')}. (${DAYS[weekday(s)].toLowerCase()})`;

/* ===== Logika (DOM nélkül, a test.js ezt próbálja) ===== */
const tooShort = (text, n) => String(text).trim().length < n;

/** Hibák mezőnként; üres objektum = minden rendben. */
function validate(exam, today = TODAY) {
  const errors = {};
  if (!CLASSES.includes(exam.className)) errors.class = 'Válassz osztályt.';
  if (!isDate(exam.date)) errors.date = 'Add meg az időpontot.';
  else if (exam.date < today) errors.date = 'Múltbeli időpontra nem vehető fel számonkérés.';
  else if (isWeekend(exam.date)) errors.date = 'Hétvégére nem lehet számonkérést tenni.';
  if (!SUBJECTS.includes(exam.subject)) errors.subject = 'Válassz tantárgyat.';
  if (!TYPES.includes(exam.type)) errors.type = 'Válassz típust.';
  if (tooShort(exam.teacher, 3)) errors.teacher = 'Add meg a tanár nevét (legalább 3 karakter).';
  return errors;
}

/** Hány számonkérése van az osztálynak azon a napon. */
const countOnDay = (exams, className, date) => exams.filter((x) => x.className === className && x.date === date).length;

/** Igaz, ha még egy számonkérés már a határ (MAX) fölé vinné az osztályt. */
const wouldOverload = (exams, className, date) => countOnDay(exams, className, date) >= MAX;

/** A hét öt napja: [{ date, items, over }]. A className szűr (üres = minden osztály); az over azok az osztályok, amelyeknek aznap háromnál több számonkérésük van. */
function week(exams, monday, className = '') {
  return weekDays(monday).map((date) => {
    const items = exams.filter((x) => x.date === date && (!className || x.className === className))
      .sort((a, b) => a.className.localeCompare(b.className, 'hu', { numeric: true }) || a.subject.localeCompare(b.subject, 'hu'));
    const over = CLASSES.map((c) => ({ className: c, count: items.filter((x) => x.className === c).length })).filter((x) => x.count > MAX);
    return { date, items, over };
  });
}

/* ===== Közös segédek (mindhárom oldalon ugyanazok) ===== */
const $ = (selector) => document.querySelector(selector);

/** Elem készítése: el('div', { class: 'x', text: 'szöveg', onclick: fn }, gyerek, gyerek). A szöveg textContent-en át kerül be, ezért biztonságos. */
function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (value !== false && value != null) node.setAttribute(key, value); // az üres szöveg is érték (pl. value="")
  }
  node.append(...kids.flat().filter(Boolean));
  return node;
}

/** <select> feltöltése; a placeholder az első, üres értékű elem. */
function fill(select, options, placeholder) {
  const first = placeholder ? [el('option', { value: '', text: placeholder })] : [];
  select.replaceChildren(...first, ...options.map((o) => el('option', { value: o.value ?? o, text: o.label ?? o })));
}

function toast(text, type = 'ok') {
  const note = el('div', { class: `toast toast-${type}`, role: 'status', text });
  $('#toast-region').append(note);
  setTimeout(() => note.remove(), 4500);
}

/** Megerősítő ablak. Igen/nem választ ad vissza (Promise). */
function confirmBox(title, text, okLabel, danger = true) {
  $('#dlg-title').textContent = title;
  $('#dlg-text').textContent = text;
  $('#dlg-ok').textContent = okLabel;
  $('#dlg-ok').className = danger ? 'btn btn-danger' : 'btn btn-primary';
  return new Promise((resolve) => {
    $('#confirm-dialog form').onsubmit = (e) => resolve(e.submitter.value === 'ok');
    $('#confirm-dialog').showModal();
  });
}

/** Hibák kiírása az űrlapmezők alá (mező: `előtag-kulcs`, hiba: `err-előtag-kulcs`). Igaz, ha volt hiba. */
function showErrors(prefix, keys, errors) {
  for (const key of keys) {
    $(`#err-${prefix}-${key}`).textContent = errors[key] || '';
    $(`#${prefix}-${key}`).ariaInvalid = errors[key] ? 'true' : null;
  }
  const first = keys.find((key) => errors[key]);
  if (first) $(`#${prefix}-${first}`).focus();
  return Boolean(first);
}

/** Az oldal közös része: mai nap a naptárlapon, mobil menü, a hiba eltűnik, ha javítod a mezőt. */
function setupPage() {
  const today = new Date(TODAY);
  $('#leaf-month').textContent = MONTHS[today.getUTCMonth()];
  $('#leaf-day').textContent = today.getUTCDate();
  $('#leaf-week').textContent = DAYS[today.getUTCDay()];
  $('#nav-toggle').onclick = () => $('#nav-toggle').setAttribute('aria-expanded', $('#site-nav').classList.toggle('open'));
  document.addEventListener('input', (e) => {
    const error = $('#err-' + e.target.id);
    if (error) { error.textContent = ''; e.target.ariaInvalid = null; }
  });
}

/* ===== Megjelenítés ===== */
let exams; // a böngészőben mentett számonkérések (a start() tölti be)
const save = () => localStorage.setItem(KEY, JSON.stringify(exams));
const view = { monday: mondayOf(nextSchoolDay(TODAY)), className: '' }; // melyik hetet és osztályt mutatjuk (üres osztály = mind)

/** Demó adatok. A 9.A osztálynak az első jövőbeli napra 4 számonkérés esik, hogy a figyelmeztetés látszódjon. */
function demoExams() {
  const days = weekDays(view.monday);
  const crowded = days.find((d) => d >= TODAY) || days[4];
  const exam = (className, date, subject, type, teacher, topic) => ({ id: crypto.randomUUID(), className, date, subject, type, teacher, topic });
  return [
    exam('9.A', days[0], 'Matematika', 'Dolgozat', 'Kiss Tamás', 'Függvények'),
    exam('9.A', crowded, 'Fizika', 'Dolgozat', 'Szabó Péter', 'Newton törvényei'),
    exam('9.A', crowded, 'Kémia', 'Témazáró', 'Varga Judit', 'Sav-bázis reakciók'),
    exam('9.A', crowded, 'Magyar', 'Beadandó', 'Horváth Gábor', 'Olvasónapló'),
    exam('9.A', crowded, 'Biológia', 'Dolgozat', 'Kovács Márta', 'Sejttan'),
    exam('9.B', days[1], 'Történelem', 'Témazáró', 'Tóth Anna', 'Az ókori Róma'),
    exam('9.B', days[2], 'Angol', 'Felelet', 'Nagy Erika', 'Unit 4 szókincs'),
    exam('10.A', days[2], 'Matematika', 'Dolgozat', 'Kiss Tamás', 'Másodfokú egyenletek'),
    exam('10.A', days[3], 'Informatika', 'Beadandó', 'Kiss Tamás', 'Weboldal'),
    exam('11.B', days[3], 'Fizika', 'Dolgozat', 'Szabó Péter', 'Hullámtan'),
    exam('12.A', days[4], 'Magyar', 'Dolgozat', 'Horváth Gábor', 'Érettségi gyakorlás'),
  ];
}

/** Egy számonkérés matricája. A színe a tantárgyé: a CSS-ben .sub-0 … .sub-10. */
function examCard(exam) {
  return el('article', { class: `exam sub-${SUBJECTS.indexOf(exam.subject)}` },
    el('div', { class: 'exam-head' },
      el('strong', { text: exam.subject }),
      el('span', { class: 'chip', text: exam.type }),
      !view.className && el('span', { class: 'chip', text: exam.className })),
    el('p', { class: 'exam-teacher', text: exam.teacher }),
    exam.topic && el('p', { class: 'exam-topic', text: exam.topic }),
    el('button', { class: 'exam-del', type: 'button', text: '✕', title: 'Törlés', 'aria-label': `Törlés: ${exam.className} ${exam.subject}`, onclick: () => remove(exam) }));
}

function dayColumn({ date, items, over }) {
  const cls = ['day', date === TODAY && 'is-today', over.length && 'is-over'].filter(Boolean).join(' ');
  return el('section', { class: cls },
    el('header', { class: 'day-head' },
      el('h3', { text: DAYS[weekday(date)] }),
      el('span', { class: 'day-date', text: shortDate(date) }),
      el('span', { class: 'day-count', text: items.length })),
    el('div', { class: 'day-body' }, items.length ? items.map(examCard) : el('p', { class: 'day-empty', text: 'szabad nap' })));
}

function render() {
  const days = week(exams, view.monday, view.className);
  $('#w-class').value = view.className;
  $('#week-label').textContent = `${view.monday.slice(0, 4)}. ${shortDate(days[0].date)} – ${shortDate(days[4].date)}`;

  const warnings = days.flatMap((day) => day.over.map((o) => ({ ...o, date: day.date })));
  $('#week-warnings').hidden = !warnings.length;
  $('#week-warnings').replaceChildren(...warnings.map((w) => el('li', {
    text: `Figyelem: a(z) ${w.className} osztálynak ${DAYS[weekday(w.date)].toLowerCase()} (${shortDate(w.date)}) ${w.count} számonkérése van, naponta legfeljebb ${MAX} javasolt.`,
  })));
  $('#week-board').replaceChildren(...days.map(dayColumn));
}

async function remove(exam) {
  if (!await confirmBox('Törlöd a számonkérést?', `${exam.className} – ${exam.subject} (${exam.type}), ${longDate(exam.date)}.`, 'Törlés')) return;
  exams = exams.filter((x) => x !== exam);
  save(); render(); toast('A számonkérés törölve.');
}

/* Új dolgozat: élő jelzés a napi terhelésről, megerősítés, ha már 3 van */
const FIELDS = ['class', 'date', 'subject', 'type', 'teacher'];

function updateHint() {
  const className = $('#d-class').value, date = $('#d-date').value, hint = $('#d-hint');
  const count = className && isDate(date) ? countOnDay(exams, className, date) : null;
  hint.classList.toggle('hint-warn', count !== null && wouldOverload(exams, className, date));
  hint.textContent = count === null ? ''
    : wouldOverload(exams, className, date) ? `Figyelem: a(z) ${className} osztálynak ezen a napon már ${count} számonkérése van, ez a(z) ${count + 1}. lenne (naponta legfeljebb ${MAX} javasolt).`
    : `A(z) ${className} osztálynak ezen a napon ${count ? `már ${count}` : 'még nincs'} számonkérése van.`;
}

function showForm(open) {
  $('#exam-form').hidden = !open;
  if (!open) return;
  $('#exam-form').reset();
  $('#d-date').value = nextSchoolDay(TODAY);
  $('#d-class').value = view.className;
  showErrors('d', FIELDS, {});
  updateHint();
  $('#d-class').focus();
}

async function onSubmit(e) {
  e.preventDefault();
  const exam = {
    id: crypto.randomUUID(), className: $('#d-class').value, date: $('#d-date').value, subject: $('#d-subject').value,
    type: $('#d-type').value, teacher: $('#d-teacher').value.trim(), topic: $('#d-topic').value.trim(),
  };
  if (showErrors('d', FIELDS, validate(exam))) return;
  if (wouldOverload(exams, exam.className, exam.date)) {
    const count = countOnDay(exams, exam.className, exam.date);
    const yes = await confirmBox('Torlódás: háromnál több számonkérés',
      `A(z) ${exam.className} osztálynak ${longDate(exam.date)} már ${count} számonkérése van. Biztosan felveszed a(z) ${count + 1}.-et is?`, 'Mégis felveszem', false);
    if (!yes) return;
  }
  exams.unshift(exam);
  try { save(); } catch { exams.shift(); toast('A böngésző tárolója megtelt.', 'bad'); return; }
  Object.assign(view, { monday: mondayOf(exam.date), className: exam.className }); // a felvett dolgozat hetére ugrunk
  showForm(false); render();
  toast(`Felvéve: ${exam.className} – ${exam.subject} (${exam.type}), ${longDate(exam.date)}.`);
}

function start() {
  setupPage();
  exams = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (!exams) { exams = demoExams(); save(); }

  fill($('#w-class'), CLASSES, 'Összes osztály');
  fill($('#d-class'), CLASSES, 'Válassz…');
  fill($('#d-subject'), SUBJECTS, 'Válassz…');
  fill($('#d-type'), TYPES, 'Válassz…');
  $('#d-date').min = TODAY; // múltbeli dátumot nem lehet választani

  $('#w-class').onchange = (e) => { view.className = e.target.value; render(); };
  $('#week-prev').onclick = () => { view.monday = addDays(view.monday, -7); render(); };
  $('#week-next').onclick = () => { view.monday = addDays(view.monday, 7); render(); };
  $('#week-today').onclick = () => { view.monday = mondayOf(nextSchoolDay(TODAY)); render(); };

  $('#new-btn').onclick = () => showForm(true);
  $('#d-cancel').onclick = () => showForm(false);
  $('#exam-form').onsubmit = onSubmit;
  $('#d-class').onchange = $('#d-date').onchange = updateHint;
  render();
}

if (typeof document === 'undefined') module.exports = { validate, countOnDay, wouldOverload, week, isDate, addDays, mondayOf, weekDays, nextSchoolDay, MAX }; // a test.js-hez
else start();
