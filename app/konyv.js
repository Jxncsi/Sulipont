'use strict';
/* Tankönyv- és jegyzetbörze: hirdetésfeladás, keresés tantárgyra és évfolyamra, kedvencek. */

/* ===== Adatok ===== */
const SUBJECTS = ['Matematika', 'Magyar', 'Történelem', 'Angol', 'Német', 'Fizika', 'Kémia', 'Biológia', 'Földrajz', 'Informatika', 'Egyéb'];
const GRADES = [9, 10, 11, 12];
const CONDITIONS = { 'Új': 'chip-ok', 'Jó': 'chip-ok', 'Elfogadható': 'chip-plain', 'Kopott': 'chip-warn' }; // állapot: címke színe
const MAX_PRICE = 20000;
const DAYS = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
const MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];

/* ===== Logika (DOM nélkül, a test.js ezt próbálja) ===== */
const tooShort = (text, n) => String(text).trim().length < n;
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isPhone = (s) => /^[+\d\s()\-/]+$/.test(s.trim()) && s.replace(/\D/g, '').length >= 7 && s.replace(/\D/g, '').length <= 15; // 7–15 számjegy

/** Hibák mezőnként; üres objektum = minden rendben. */
function validate(book) {
  const errors = {};
  if (tooShort(book.title, 3)) errors.title = 'Add meg a könyv címét (legalább 3 karakter).';
  if (!SUBJECTS.includes(book.subject)) errors.subject = 'Válassz tantárgyat.';
  if (!GRADES.includes(book.grade)) errors.grade = 'Válassz évfolyamot.';
  if (!(book.condition in CONDITIONS)) errors.condition = 'Válassz állapotot.';
  if (!Number.isInteger(book.price)) errors.price = 'Add meg az árat egész forintban (0 = ingyen).';
  else if (book.price < 0 || book.price > MAX_PRICE) errors.price = `Az ár 0 és ${MAX_PRICE} Ft között lehet.`;
  if (tooShort(book.seller, 3)) errors.seller = 'Add meg a neved és az osztályodat.';
  if (!isEmail(book.contact) && !isPhone(book.contact)) errors.contact = 'Adj meg e-mail-címet vagy telefonszámot.';
  return errors;
}

/** Szűrés szövegre, tantárgyra, évfolyamra, kedvencekre; rendezés: 'new' = legújabb elöl, 'price' = olcsóbb elöl. */
function filter(books, { q = '', subject = '', grade = '', sort = 'new', favorites = null } = {}) {
  const text = q.trim().toLowerCase();
  return books
    .filter((b) => (!subject || b.subject === subject) && (!grade || b.grade === Number(grade))
      && (!favorites || favorites.has(b.id))
      && (!text || `${b.title} ${b.subject} ${b.description}`.toLowerCase().includes(text)))
    .sort((a, b) => (sort === 'price' ? a.price - b.price : 0) || b.createdAt - a.createdAt); // azonos árnál az újabb elöl
}

/** 1800 → "1 800 Ft" (nem törhető szóközzel), 0 → "Ingyen" */
const formatPrice = (n) => (n === 0 ? 'Ingyen' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft');

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
  const today = new Date();
  $('#leaf-month').textContent = MONTHS[today.getMonth()];
  $('#leaf-day').textContent = today.getDate();
  $('#leaf-week').textContent = DAYS[today.getDay()];
  $('#nav-toggle').onclick = () => $('#nav-toggle').setAttribute('aria-expanded', $('#site-nav').classList.toggle('open'));
  document.addEventListener('input', (e) => {
    const error = $('#err-' + e.target.id);
    if (error) { error.textContent = ''; e.target.ariaInvalid = null; }
  });
}

/* ===== Megjelenítés ===== */
let books = []; // a Supabase-ből betöltött hirdetések (a start() tölti be)
let favorites = new Set(); // a bejelentkezett felhasználó kedvencnek jelölt hirdetései (azonosítók)

/** Az adatbázis created_at oszlopa a kódban createdAt (ezredmásodperc, a rendezéshez). */
const fromRow = (r) => ({ ...r, createdAt: Date.parse(r.created_at) });

/** Hibás Supabase-válasznál hibaüzenetet ír, és false-t ad. */
function ok(error, text) {
  if (error) toast(`${text} (${error.message})`, 'bad');
  return !error;
}

/** Törölni csak a saját hirdetést lehet. */
const mine = (book) => user && book.user_id === user.id;

/** Belépés/kilépés után: a kedvencek a fiókhoz tartoznak, ezért újratöltjük őket (az auth.js hívja). */
async function onAuthChange() {
  favorites = new Set();
  if (user) {
    const { data, error } = await sb.from('favorites').select('book_id');
    if (ok(error, 'Nem sikerült betölteni a kedvenceket.')) favorites = new Set(data.map((f) => f.book_id));
  }
  render();
}

/** E-mail → mailto: link, telefonszám → tel: link, más → sima szöveg. */
function contactLink(contact) {
  if (isEmail(contact)) return el('a', { href: `mailto:${contact.trim()}`, text: contact });
  return el('a', { href: `tel:${contact.replace(/[^\d+]/g, '')}`, text: contact });
}

/** Ármatrica: "1 800 / Ft", vagy „Ingyen". */
function priceSticker(price) {
  if (price === 0) return el('div', { class: 'price price-free' }, el('b', { text: 'Ingyen' }));
  return el('div', { class: 'price' }, el('b', { text: formatPrice(price).replace(/ Ft$/, '') }), el('small', { text: 'Ft' }));
}

/** Szív-gomb: kedvencnek jelöl / visszavesz. */
function favButton(book) {
  const button = el('button', { class: 'fav', type: 'button' });
  const paint = () => {
    const on = favorites.has(book.id);
    button.classList.toggle('is-on', on);
    button.textContent = on ? '♥' : '♡';
    button.setAttribute('aria-pressed', on);
    button.setAttribute('aria-label', `${on ? 'Kivétel a kedvencek közül' : 'Kedvencnek jelölöm'}: ${book.title}`);
  };
  button.onclick = async () => {
    if (!requireLogin()) return;
    const on = favorites.has(book.id);
    const { error } = on
      ? await sb.from('favorites').delete().eq('book_id', book.id)
      : await sb.from('favorites').insert({ book_id: book.id });
    if (!ok(error, 'Nem sikerült menteni.')) return;
    if (on) favorites.delete(book.id); else favorites.add(book.id);
    paint();
    if ($('#k-fav').checked) render(); // „csak a kedvenceim" nézetben a lista is változik
  };
  paint();
  return button;
}

function card(book) {
  return el('article', { class: `book sub-${SUBJECTS.indexOf(book.subject)}` }, // a gerinc színe a tantárgyé (CSS: .sub-0 … .sub-10)
    priceSticker(book.price),
    el('ul', { class: 'chips' },
      el('li', { class: 'chip', text: book.subject }),
      el('li', { class: 'chip chip-plain', text: `${book.grade}. évf.` }),
      el('li', { class: `chip ${CONDITIONS[book.condition]}`, text: book.condition })),
    el('h3', { text: book.title }),
    book.description && el('p', { class: 'book-note', text: book.description }),
    el('p', { class: 'meta' }, 'Eladó: ', el('strong', { text: book.seller })),
    el('p', { class: 'meta' }, 'Kapcsolat: ', contactLink(book.contact)),
    el('div', { class: 'card-actions' }, favButton(book),
      mine(book) && el('button', { class: 'btn btn-small btn-ghost', type: 'button', text: 'Törlés', onclick: () => remove(book) })));
}

function render() {
  const onlyFavorites = $('#k-fav').checked;
  const list = filter(books, { q: $('#k-q').value, subject: $('#k-subject').value, grade: $('#k-grade').value, sort: $('#k-sort').value, favorites: onlyFavorites ? favorites : null });
  $('#book-count').textContent = `${list.length} / ${books.length} hirdetés`;
  const empty = onlyFavorites && !favorites.size ? 'Még nincs kedvenced: jelölj meg egy hirdetést a szívvel.' : 'Nincs a keresésnek megfelelő hirdetés.';
  $('#book-grid').replaceChildren(...(list.length ? list.map(card) : [el('p', { class: 'empty', text: empty })]));
}

async function remove(book) {
  if (!await confirmBox('Törlöd a hirdetést?', `${book.title} (${formatPrice(book.price)}). A művelet nem vonható vissza.`, 'Törlés')) return;
  const { error } = await sb.from('books').delete().eq('id', book.id); // a kedvenc-jelölések az adatbázisban vele együtt törlődnek
  if (!ok(error, 'Nem sikerült törölni.')) return;
  books = books.filter((x) => x !== book);
  favorites.delete(book.id);
  render(); toast('A hirdetés törölve.');
}

/* Hirdetésfeladás */
const FIELDS = ['title', 'subject', 'grade', 'condition', 'price', 'seller', 'contact'];

function showForm(open) {
  $('#book-form').hidden = !open;
  if (!open) return;
  $('#book-form').reset();
  $('#b-seller').value = userName(); // a regisztrációkor megadott név
  showErrors('b', FIELDS, {});
  $('#b-title').focus();
}

async function onSubmit(e) {
  e.preventDefault();
  if (!requireLogin()) return;
  const price = $('#b-price').value.trim();
  const book = {
    title: $('#b-title').value.trim(), subject: $('#b-subject').value,
    grade: Number($('#b-grade').value),             // üres választásnál 0, ami nem érvényes évfolyam
    condition: $('#b-condition').value,
    price: price === '' ? NaN : Number(price),      // az üres mező nem 0 Ft
    seller: $('#b-seller').value.trim(), contact: $('#b-contact').value.trim(), description: $('#b-desc').value.trim(),
  };
  if (showErrors('b', FIELDS, validate(book))) return;
  const { data, error } = await sb.from('books').insert(book).select().single();
  if (!ok(error, 'Nem sikerült feladni.')) return;
  books.unshift(fromRow(data));
  showForm(false); render();
  toast(`Hirdetés feladva: ${book.title}.`);
}

async function start() {
  setupPage();
  const { data, error } = await sb.from('books').select('*');
  if (ok(error, 'Nem sikerült betölteni a hirdetéseket.')) books = data.map(fromRow);

  const grades = GRADES.map((g) => ({ value: g, label: `${g}. évfolyam` }));
  fill($('#k-subject'), SUBJECTS, 'Összes');
  fill($('#k-grade'), grades, 'Összes');
  fill($('#b-subject'), SUBJECTS, 'Válassz…');
  fill($('#b-grade'), grades, 'Válassz…');
  fill($('#b-condition'), Object.keys(CONDITIONS), 'Válassz…');

  $('#book-filters').oninput = render;
  $('#book-filters').onsubmit = (e) => e.preventDefault(); // Enter ne töltse újra az oldalt
  $('#new-btn').onclick = () => requireLogin() && showForm(true);
  $('#b-cancel').onclick = () => showForm(false);
  $('#book-form').onsubmit = onSubmit;
  render();
}

if (typeof document === 'undefined') module.exports = { validate, filter, isEmail, isPhone, formatPrice }; // a test.js-hez
else addEventListener('DOMContentLoaded', start); // az auth.js a lap végén töltődik be, a start() csak utána fut
