const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../js/core/dates.js');

test('addDays hónap- és évhatáron átlép', () => {
  assert.equal(D.addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(D.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(D.addDays('2026-03-01', -1), '2026-02-28');
});

test('parseISO elutasítja a nem létező és hibás dátumot', () => {
  assert.equal(D.parseISO('2026-02-31'), null);
  assert.equal(D.parseISO('2026-13-01'), null);
  assert.equal(D.parseISO('hamis'), null);
  assert.equal(D.parseISO(''), null);
  assert.ok(D.parseISO('2028-02-29'), 'szökőév');
});

test('mondayOf: csütörtökből és vasárnapból is a hét hétfőjét adja', () => {
  assert.equal(D.mondayOf('2026-11-12'), '2026-11-09');
  assert.equal(D.mondayOf('2026-11-15'), '2026-11-09');
  assert.equal(D.mondayOf('2026-11-09'), '2026-11-09');
});

test('weekDays öt egymást követő napot ad', () => {
  assert.deepEqual(D.weekDays('2026-11-09'), ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']);
});

test('nextSchoolDay: hétvégéből hétfőt ad, hétköznapot nem változtat', () => {
  assert.equal(D.nextSchoolDay('2026-11-14'), '2026-11-16');
  assert.equal(D.nextSchoolDay('2026-11-15'), '2026-11-16');
  assert.equal(D.nextSchoolDay('2026-11-12'), '2026-11-12');
});

test('isWeekend', () => {
  assert.equal(D.isWeekend('2026-11-14'), true);
  assert.equal(D.isWeekend('2026-11-13'), false);
});

test('daysBetween az óraátállításon át is egész napot ad', () => {
  assert.equal(D.daysBetween('2026-10-24', '2026-10-27'), 3); // 2026. okt. 25-én állunk vissza a téli időre
  assert.equal(D.daysBetween('2026-11-12', '2026-11-12'), 0);
  assert.equal(D.daysBetween('2026-11-12', '2026-11-05'), -7);
});

test('formázás', () => {
  assert.equal(D.formatDate('2026-11-16'), '2026. 11. 16. (hétfő)');
  assert.equal(D.shortDate('2026-11-06'), '11. 06.');
  assert.equal(D.dayName('2026-11-14'), 'Szombat');
});
