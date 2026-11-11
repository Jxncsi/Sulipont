'use strict';

/* ===== Adatok ===== */
const KEY = 'sulipont.found';
const CATEGORIES = { // kategória: [rajz neve, színfolt]
  'Ruházat': ['hoodie', 'var(--tomato)'],
  'Kulacs és étel': ['bottle', '#7aa2ff'],
  'Írószer': ['pencil-case', 'var(--sun)'],
  'Táska': ['backpack', 'var(--mint)'],
  'Kulcs és ékszer': ['key', 'var(--kraft)'],
  'Elektronika': ['headphones', 'var(--hl)'],
  'Sport': ['ball', '#ff7a3d'],
  'Egyéb': ['box', 'var(--paper-2)'],
};
const SHAPES = { // saját rajzok (48×48-as SVG)
  'hoodie': '<path d="M17 8 L5 16 L8 31 L14 29 V42 H34 V29 L40 31 L43 16 L31 8 Q24 21 17 8Z"/><path fill="none" d="M18 33 H30 L28 40 H20Z"/>',
  'bottle': '<rect x="18" y="3" width="12" height="7" rx="2"/><path d="M16 12 H32 V40 A4 4 0 0 1 28 44 H20 A4 4 0 0 1 16 40Z"/><path fill="none" d="M16 21 H32 M16 29 H32"/>',
  'pencil-case': '<rect x="4" y="15" width="40" height="22" rx="9"/><path fill="none" d="M8 26 H40 M14 15 L16 7 M22 15 L23 5 M30 15 L29 7"/>',
  'backpack': '<path d="M13 15 A11 11 0 0 1 35 15 V40 A4 4 0 0 1 31 44 H17 A4 4 0 0 1 13 40Z"/><rect x="17" y="27" width="14" height="11" rx="2"/><path fill="none" d="M20 9 V7 A4 4 0 0 1 28 7 V9"/>',
  'key': '<circle cx="14" cy="24" r="9"/><path fill="none" d="M23 24 H45 M37 24 V31 M43 24 V30"/>',
  'headphones': '<path fill="none" d="M7 28 V24 A17 17 0 0 1 41 24 V28"/><rect x="4" y="26" width="10" height="15" rx="4"/><rect x="34" y="26" width="10" height="15" rx="4"/>',
  'ball': '<circle cx="24" cy="24" r="19"/><path fill="none" d="M24 5 V43 M5 24 H43 M10 10 Q24 24 10 38 M38 10 Q24 24 38 38"/>',
  'box': '<path d="M5 15 L24 6 L43 15 V34 L24 43 L5 34Z"/><path fill="none" d="M5 15 L24 24 L43 15 M24 24 V43"/>',
};

/* ===== Dátumok: "ÉÉÉÉ-HH-NN" szövegek, UTC-ben számolva (így az óraátállítás nem zavar) ===== */
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date().toLocaleDateString('sv'); // a mai nap, helyi idő szerint
const addDays = (date, n) => new Date(Date.parse(date) + n * MS_PER_DAY).toISOString().slice(0, 10);
const daysBetween = (a, b) => (Date.parse(b) - Date.parse(a)) / MS_PER_DAY;
const isDate = (s) => /^\d{4}-\d\d-\d\d$/.test(s) && !isNaN(Date.parse(s)) && addDays(s, 0) === s; // a 2026-02-31 nem dátum
const shortDate = (s) => s.slice(5).replace('-', '. ') + '.'; // 2026-11-12 → 11. 12.
const DAYS = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

/* ===== Logika (DOM nélkül, a test.js ezt próbálja) ===== */
const tooShort = (text, n) => String(text).trim().length < n;

/** Hibák mezőnként; üres objektum = minden rendben. */
function validate(item, today = TODAY) {
  const errors = {};
  if (tooShort(item.name, 2)) errors.name = 'Add meg a tárgy nevét (legalább 2 karakter).';
  if (!(item.category in CATEGORIES)) errors.category = 'Válassz kategóriát.';
  if (tooShort(item.place, 2)) errors.place = 'Add meg, hol találták.';
  if (!isDate(item.date)) errors.date = 'Add meg a dátumot.';
  else if (item.date > today) errors.date = 'A találás dátuma nem lehet a jövőben.';
  return errors;
}

/** Szűrés kategóriára, szövegre, dátumtartományra; a legújabb elöl. */
function filter(items, { q = '', category = '', from = '', to = '', hideClaimed = false } = {}) {
  if (from && to && from > to) [from, to] = [to, from]; // fordított tartományt felcserélünk
  const text = q.trim().toLowerCase();
  return items
    .filter((it) => (!category || it.category === category)
      && (!from || it.date >= from) && (!to || it.date <= to)
      && (!hideClaimed || it.status !== 'igenyelve')
      && (!text || `${it.name} ${it.place} ${it.description}`.toLowerCase().includes(text)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function agoLabel(date, today = TODAY) {
  const n = daysBetween(date, today);
  return n <= 0 ? 'ma' : n === 1 ? 'tegnap' : `${n} napja`;
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
let items; // a böngészőben mentett tárgyak (a start() tölti be)
const save = () => localStorage.setItem(KEY, JSON.stringify(items));

/** Demó adatok az első indításhoz, a mai naphoz igazítva. */
function demoItems() {
  const item = (name, category, place, daysAgo, description = '') => ({
    id: crypto.randomUUID(), name, category, place, description, date: addDays(TODAY, -daysAgo), photo: null, status: 'talalt', claimedBy: null,
  });
  const claimed = { ...item('Kék termosz kulacs', 'Kulacs és étel', 'Ebédlő', 2), status: 'igenyelve', claimedBy: 'Nagy Bence, 10.B' };
  return [
    item('Szürke kapucnis pulcsi', 'Ruházat', 'Tornaterem, női öltöző', 1, 'Nike, M méret, a zsebében zsebkendő.'),
    claimed,
    item('Cicás tolltartó', 'Írószer', '204-es terem', 3, 'Benne 3 toll és egy radír.'),
    item('Fekete sapka', 'Ruházat', 'Aula', 4),
    item('Piros hátizsák', 'Táska', 'Büfé előtt', 5, 'Matekfüzet van benne.'),
    item('Kulcscsomó (3 kulcs)', 'Kulcs és ékszer', 'Porta', 6, 'Kék kulcstartóval.'),
    item('Fehér fülhallgató', 'Elektronika', 'Könyvtár', 7, 'Töltőtokban.'),
    item('Focilabda', 'Sport', 'Udvar', 9),
  ];
}

/** Polaroid: fotó, vagy a kategória rajza csíkos háttéren. Az „Igényelve" bélyeg ráütve. */
function polaroid(item) {
  const [shape, color] = CATEGORIES[item.category];
  let picture = el('img', { src: item.photo, alt: item.name });
  if (!item.photo) {
    const icon = el('span', { class: 'icon', style: `--ic-fill:${color}` });
    icon.innerHTML = `<svg viewBox="0 0 48 48" fill="var(--ic-fill)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${SHAPES[shape]}</svg>`; // csak a fenti, állandó rajzok
    picture = el('div', { class: 'photo-ph', style: `--tint:${color}` }, icon, el('span', { text: 'Nincs fotó' }));
  }
  return el('figure', { class: 'polaroid' }, picture,
    item.status === 'igenyelve' && el('span', { class: 'stamp', text: 'Igényelve' }),
    el('figcaption', { text: `${shortDate(item.date)} · ${agoLabel(item.date)}` }));
}

function card(item) {
  const claimed = item.status === 'igenyelve';
  const mainButton = claimed
    ? el('button', { class: 'btn btn-small', type: 'button', text: 'Mégsem az enyém', onclick: () => { Object.assign(item, { status: 'talalt', claimedBy: null }); save(); render(); } })
    : el('button', { class: 'btn btn-primary', type: 'button', text: 'Ez az enyém!', onclick: () => openClaim(item) });
  return el('article', { class: 'item' },
    polaroid(item),
    el('h3', { text: item.name }),
    el('ul', { class: 'chips' }, el('li', { class: 'chip', text: item.category })),
    el('p', { class: 'where' }, el('small', { text: 'Hol: ' }), item.place),
    item.description && el('p', { class: 'meta', text: item.description }),
    claimed && el('p', { class: 'meta' }, 'Igényelte: ', el('strong', { text: item.claimedBy })),
    el('div', { class: 'card-actions' }, mainButton,
      el('button', { class: 'btn btn-small btn-ghost', type: 'button', text: 'Törlés', onclick: () => remove(item) })));
}

function render() {
  const list = filter(items, { q: $('#f-q').value, category: $('#f-cat').value, from: $('#f-from').value, to: $('#f-to').value, hideClaimed: $('#f-hide').checked });
  $('#found-count').textContent = `${list.length} / ${items.length} tárgy`;
  $('#found-grid').replaceChildren(...(list.length ? list.map(card) : [el('p', { class: 'empty', text: 'Nincs a szűrésnek megfelelő tárgy.' })]));
}

async function remove(item) {
  if (!await confirmBox('Törlöd a tárgyat?', `${item.name} (${item.place}). A művelet nem vonható vissza.`, 'Törlés')) return;
  items = items.filter((x) => x !== item);
  save(); render(); toast('A tárgy törölve.');
}

/* „Ez az enyém!": név megadása után a tárgy „igényelt", a portán át lehet venni */
let claimed; // az a tárgy, amit éppen igényelnek
function openClaim(item) {
  claimed = item;
  $('#claim-text').textContent = `${item.name} – ${item.place}. Add meg, ki vagy, hogy a portán átvehesd.`;
  $('#c-name').value = '';
  showErrors('c', ['name'], {});
  $('#claim-dialog').showModal();
}

/* Új tárgy: űrlap + fotó. A fotót a böngésző kicsinyíti, hogy elférjen a tárolóban. */
const FIELDS = ['name', 'category', 'date', 'place', 'photo'];
let photo = null; // a kiválasztott fotó (kicsinyítve, szövegként)

/** Kép kicsinyítése: vászonra rajzoljuk, és JPEG-ként olvassuk vissza. */
function shrink(file, maxSize = 480) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function setPhoto(dataUrl) {
  photo = dataUrl;
  $('#t-preview').hidden = !dataUrl;
  $('#t-preview-img').src = dataUrl || '';
}

async function onPhotoChosen(e) {
  const file = e.target.files[0];
  setPhoto(null);
  $('#err-t-photo').textContent = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) { $('#err-t-photo').textContent = 'Csak képfájlt (JPG, PNG) lehet feltölteni.'; return; }
  try { setPhoto(await shrink(file)); } catch { $('#err-t-photo').textContent = 'Ezt a képet nem tudjuk feldolgozni, használj JPG vagy PNG fájlt.'; }
}

function showForm(open) {
  $('#found-form').hidden = !open;
  if (!open) return;
  $('#found-form').reset();
  setPhoto(null);
  $('#t-date').value = TODAY;
  showErrors('t', FIELDS, {});
  $('#t-name').focus();
}

function onSubmit(e) {
  e.preventDefault();
  const item = {
    id: crypto.randomUUID(), name: $('#t-name').value.trim(), category: $('#t-category').value, place: $('#t-place').value.trim(),
    date: $('#t-date').value, description: $('#t-desc').value.trim(), photo, status: 'talalt', claimedBy: null,
  };
  if (showErrors('t', FIELDS, validate(item))) return;
  items.unshift(item);
  try { save(); } catch { items.shift(); toast('A böngésző tárolója megtelt, törölj régi tárgyakat.', 'bad'); return; }
  showForm(false); render();
  toast(`„${item.name}" felvéve.`);
}

function start() {
  setupPage();
  items = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (!items) { items = demoItems(); save(); }

  fill($('#f-cat'), Object.keys(CATEGORIES), 'Összes');
  fill($('#t-category'), Object.keys(CATEGORIES), 'Válassz…');
  $('#f-from').max = $('#f-to').max = $('#t-date').max = TODAY; // jövőbeli dátumot nem lehet választani

  $('#found-filters').oninput = render;
  $('#found-filters').onsubmit = (e) => e.preventDefault(); // Enter ne töltse újra az oldalt
  $('#new-btn').onclick = () => showForm(true);
  $('#t-cancel').onclick = () => showForm(false);
  $('#found-form').onsubmit = onSubmit;
  $('#t-photo').onchange = onPhotoChosen;
  $('#t-photo-clear').onclick = () => { $('#t-photo').value = ''; setPhoto(null); };

  $('#claim-cancel').onclick = () => $('#claim-dialog').close();
  $('#claim-form').onsubmit = (e) => {
    e.preventDefault();
    const name = $('#c-name').value.trim();
    if (showErrors('c', ['name'], tooShort(name, 3) ? { name: 'Add meg a neved és az osztályodat (legalább 3 karakter).' } : {})) return;
    Object.assign(claimed, { status: 'igenyelve', claimedBy: name });
    save(); render();
    $('#claim-dialog').close();
    toast(`Köszönjük, ${name}! A tárgyat a portán veheted át.`);
  };
  render();
}

if (typeof document === 'undefined') module.exports = { validate, filter, agoLabel, isDate, addDays, daysBetween }; // a test.js-hez
else start();
