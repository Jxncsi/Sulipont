/* Futtatás: node --test   (a három oldal logikáját próbálja, külső függőség nélkül) */
const test = require('node:test');
const assert = require('node:assert/strict');
const found = require('./app/talalt.js');
const exams = require('./app/dolgozat.js');
const books = require('./app/konyv.js');

const TODAY = '2026-11-12'; // csütörtök
const ids = (list) => list.map((x) => x.id);

/* ---------- dátumok ---------- */
test('dátumok: hónap- és évhatár, nem létező nap, hét hétfője, hétvége', () => {
  assert.equal(exams.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(exams.isDate('2026-02-31'), false);
  assert.equal(exams.isDate('2026-11-12'), true);
  assert.equal(exams.mondayOf('2026-11-15'), '2026-11-09'); // vasárnapból az előző hétfő
  assert.deepEqual(exams.weekDays('2026-11-09').at(-1), '2026-11-13');
  assert.equal(exams.nextSchoolDay('2026-11-14'), '2026-11-16');
  assert.equal(found.daysBetween('2026-10-24', '2026-10-27'), 3); // az óraátállításon át is egész nap
});

/* ---------- talált tárgyak ---------- */
const item = (o = {}) => ({ id: 'a', name: 'Szürke pulcsi', category: 'Ruházat', place: 'Tornaterem', date: '2026-11-10', description: '', status: 'talalt', ...o });

test('talált tárgy: érvényes, hibás és jövőbeli dátum', () => {
  assert.deepEqual(found.validate(item(), TODAY), {});
  assert.deepEqual(Object.keys(found.validate(item({ name: 'x', category: 'Rakéta', place: '', date: '' }), TODAY)).sort(), ['category', 'date', 'name', 'place']);
  assert.ok(found.validate(item({ date: '2026-11-13' }), TODAY).date);
  assert.equal(found.validate(item({ date: TODAY }), TODAY).date, undefined);
});

test('talált tárgy: szűrés kategóriára, szövegre, dátumra (fordított tartomány is), igényeltek elrejtése', () => {
  const list = [
    item({ id: '1', name: 'Kék kulacs', category: 'Kulacs és étel', date: '2026-11-06', place: 'Ebédlő' }),
    item({ id: '2', date: '2026-11-10' }),
    item({ id: '3', name: 'Tolltartó', category: 'Írószer', date: '2026-11-08', description: 'cicás', status: 'igenyelve' }),
  ];
  assert.deepEqual(ids(found.filter(list)), ['2', '3', '1']);                        // a legújabb elöl
  assert.deepEqual(ids(found.filter(list, { category: 'Írószer' })), ['3']);
  assert.deepEqual(ids(found.filter(list, { q: 'CICÁS' })), ['3']);
  assert.deepEqual(ids(found.filter(list, { from: '2026-11-10', to: '2026-11-08' })), ['2', '3']);
  assert.deepEqual(ids(found.filter(list, { hideClaimed: true })), ['2', '1']);
  assert.deepEqual(ids(list), ['1', '2', '3']);                                       // az eredeti nem változik
});

test('talált tárgy: ma, tegnap, N napja', () => {
  assert.deepEqual(['2026-11-12', '2026-11-11', '2026-11-05'].map((d) => found.agoLabel(d, TODAY)), ['ma', 'tegnap', '7 napja']);
});

/* ---------- dolgozatnaptár ---------- */
const ex = (id, className, date, subject = 'Matematika') => ({ id, className, date, subject, type: 'Dolgozat', teacher: 'Kiss Tamás' });
const all = [ // 9.A: szerdán 4 (torlódás), hétfőn 3 (még a határon belül); 9.B: szerdán 1
  ex(1, '9.A', '2026-11-18'), ex(2, '9.A', '2026-11-18'), ex(3, '9.A', '2026-11-18'), ex(4, '9.A', '2026-11-18'),
  ex(5, '9.A', '2026-11-16'), ex(6, '9.A', '2026-11-16'), ex(7, '9.A', '2026-11-16'), ex(8, '9.B', '2026-11-18'),
];

test('dolgozat: érvényesség (hétvége, múlt, rövid név)', () => {
  const base = { className: '9.A', date: '2026-11-18', subject: 'Fizika', type: 'Dolgozat', teacher: 'Szabó Péter' };
  assert.deepEqual(exams.validate(base, TODAY), {});
  assert.ok(exams.validate({ ...base, date: '2026-11-14' }, TODAY).date);
  assert.ok(exams.validate({ ...base, date: '2026-11-11' }, TODAY).date);
  assert.equal(exams.validate({ ...base, date: TODAY }, TODAY).date, undefined);
  assert.ok(exams.validate({ ...base, teacher: 'Ki' }, TODAY).teacher);
});

test('dolgozat: a harmadik még belefér, a negyedik már torlódás (osztályonként számolva)', () => {
  assert.equal(exams.countOnDay(all, '9.A', '2026-11-18'), 4);
  assert.equal(exams.wouldOverload(all, '9.A', '2026-11-16'), true);  // 3 van, a 4. túl sok
  assert.equal(exams.wouldOverload(all, '9.B', '2026-11-18'), false);
});

test('dolgozat: heti nézet – öt nap, osztályszűrés, túlterhelt nap jelölése', () => {
  const w = exams.week(all, '2026-11-16');
  assert.deepEqual(w.map((d) => d.items.length), [3, 0, 5, 0, 0]);
  assert.deepEqual(w[2].over, [{ className: '9.A', count: 4 }]); // a hétfői 3 nem torlódás
  assert.deepEqual(w[0].over, []);
  assert.deepEqual(exams.week(all, '2026-11-16', '9.B').map((d) => d.items.length), [0, 0, 1, 0, 0]);
});

/* ---------- tankönyvbörze ---------- */
const book = (o = {}) => ({ id: 'a', title: 'Matematika 9.', subject: 'Matematika', grade: 9, condition: 'Jó', price: 1800, seller: 'Kiss Anna, 12.A', contact: 'anna@pelda.hu', description: '', createdAt: 1000, ...o });

test('könyv: érvényes hirdetés és az ár határai (0 ingyen, felső korlát, tört és negatív nem jó)', () => {
  assert.deepEqual(books.validate(book()), {});
  assert.equal(books.validate(book({ price: 0 })).price, undefined);
  assert.equal(books.validate(book({ price: 20000 })).price, undefined);
  for (const price of [20001, -1, 12.5, NaN]) assert.ok(books.validate(book({ price })).price, `ár: ${price}`);
});

test('könyv: elérhetőség (e-mail vagy telefon) és ár formázása', () => {
  for (const ok of ['anna.kiss@pelda.hu', '+36 30 123 4567', '06-20/555-1212']) assert.ok(books.validate(book({ contact: ok })).contact === undefined, ok);
  for (const bad of ['anna@pelda', '12345', 'hívj fel', '']) assert.ok(books.validate(book({ contact: bad })).contact, bad);
  assert.deepEqual([1800, 600, 0].map(books.formatPrice), ['1 800 Ft', '600 Ft', 'Ingyen']);
});

test('könyv: keresés, tantárgy, évfolyam, kedvencek, rendezés', () => {
  const list = [
    book({ id: '1', title: 'Fizika 10.', subject: 'Fizika', grade: 10, price: 2500, createdAt: 3000, description: 'ceruzás jegyzet' }),
    book({ id: '2', createdAt: 1000 }),
    book({ id: '3', title: 'Matematika 10.', grade: 10, createdAt: 2000 }),
  ];
  assert.deepEqual(ids(books.filter(list, { subject: 'Matematika' })), ['3', '2']);
  assert.deepEqual(ids(books.filter(list, { grade: '10' })), ['1', '3']);       // az évfolyam szövegként is jöhet az űrlapról
  assert.deepEqual(ids(books.filter(list, { q: 'CERUZÁS' })), ['1']);
  assert.deepEqual(ids(books.filter(list, { favorites: new Set(['2']) })), ['2']);
  assert.deepEqual(ids(books.filter(list, { favorites: new Set() })), []);
  assert.deepEqual(ids(books.filter(list, { sort: 'price' })), ['3', '2', '1']); // azonos árnál az újabb elöl
  assert.deepEqual(ids(list), ['1', '2', '3']);
});
