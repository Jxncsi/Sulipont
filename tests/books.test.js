const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../js/logic/books.js');

const book = (o = {}) => ({ id: 'a', title: 'Matematika 9.', subject: 'Matematika', grade: 9, condition: 'Jó', price: 1800, seller: 'Kiss Anna, 12.A', contact: 'anna@pelda.hu', description: '', createdAt: 1000, ...o });

test('validate: érvényes hirdetés hibamentes', () => assert.deepEqual(B.validate(book()), {}));

test('validate: hibás mezők', () => {
  const e = B.validate(book({ title: 'a', subject: '', grade: 8, condition: 'Rossz', price: NaN, seller: '', contact: 'x' }));
  assert.deepEqual(Object.keys(e).sort(), ['condition', 'contact', 'grade', 'price', 'seller', 'subject', 'title']);
});

test('validate: az ár határai (0 ingyen, felső korlát, negatív és tört nem jó)', () => {
  assert.equal(B.validate(book({ price: 0 })).price, undefined);
  assert.equal(B.validate(book({ price: 20000 })).price, undefined);
  assert.ok(B.validate(book({ price: 20001 })).price);
  assert.ok(B.validate(book({ price: -1 })).price);
  assert.ok(B.validate(book({ price: 12.5 })).price);
});

test('elérhetőség: e-mail és telefon', () => {
  assert.ok(B.isContact('anna.kiss@pelda.hu'));
  assert.ok(B.isContact('+36 30 123 4567'));
  assert.ok(B.isContact('06-20/555-1212'));
  assert.ok(!B.isContact('anna@pelda'), 'pont nélküli domain');
  assert.ok(!B.isContact('12345'), 'túl rövid szám');
  assert.ok(!B.isContact('hívj fel'), 'szöveg');
  assert.ok(!B.isContact(''));
});

const list = [
  book({ id: '1', title: 'Fizika 10.', subject: 'Fizika', grade: 10, price: 2500, createdAt: 3000, description: 'ceruzás jegyzet' }),
  book({ id: '2', title: 'Matematika 9.', subject: 'Matematika', grade: 9, price: 1800, createdAt: 1000 }),
  book({ id: '3', title: 'Matematika 10.', subject: 'Matematika', grade: 10, price: 1800, createdAt: 2000 }),
];
const ids = (r) => r.map((x) => x.id);

test('filter: tantárgy és évfolyam (az évfolyam szövegként is jöhet az űrlapról)', () => {
  assert.deepEqual(ids(B.filter(list, { subject: 'Matematika' })), ['3', '2']);
  assert.deepEqual(ids(B.filter(list, { grade: '10' })), ['1', '3']);
  assert.deepEqual(ids(B.filter(list, { subject: 'Matematika', grade: '9' })), ['2']);
});

test('filter: szöveg a címben, tantárgyban és a megjegyzésben', () => {
  assert.deepEqual(ids(B.filter(list, { q: 'fizika' })), ['1']);
  assert.deepEqual(ids(B.filter(list, { q: 'CERUZÁS' })), ['1']);
  assert.deepEqual(ids(B.filter(list, { q: 'kémia' })), []);
});

test('filter: csak a kedvencek', () => {
  assert.deepEqual(ids(B.filter(list, { onlyFavorites: true, favorites: ['2'] })), ['2']);
  assert.deepEqual(ids(B.filter(list, { onlyFavorites: true, favorites: [] })), []);
  assert.deepEqual(ids(B.filter(list, { onlyFavorites: false, favorites: ['2'] })), ['1', '3', '2']);
});

test('filter: rendezés – legújabb elöl, illetve olcsóbb elöl (azonos árnál az újabb)', () => {
  assert.deepEqual(ids(B.filter(list, { sort: 'new' })), ['1', '3', '2']);
  assert.deepEqual(ids(B.filter(list, { sort: 'price' })), ['3', '2', '1']);
});

test('filter: az eredeti listát nem módosítja', () => {
  B.filter(list, { sort: 'price' });
  assert.deepEqual(ids(list), ['1', '2', '3']);
});

test('formatPrice', () => {
  assert.equal(B.formatPrice(1800), '1 800 Ft');
  assert.equal(B.formatPrice(600), '600 Ft');
  assert.equal(B.formatPrice(20000), '20 000 Ft');
  assert.equal(B.formatPrice(0), 'Ingyen');
});
