const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/logic/exams.js');

const TODAY = '2026-11-12'; // csütörtök
const ex = (id, className, date, subject = 'Matematika') => ({ id, className, date, subject, type: 'Dolgozat', teacher: 'Kiss Tamás', topic: '' });
const base = { className: '9.A', date: '2026-11-18', subject: 'Fizika', type: 'Dolgozat', teacher: 'Szabó Péter' };

// 9.A: szerdán 4 (torlódás), hétfőn 3 (még a határon belül); 9.B: szerdán 1
const exams = [
  ex(1, '9.A', '2026-11-18', 'Fizika'), ex(2, '9.A', '2026-11-18', 'Kémia'), ex(3, '9.A', '2026-11-18', 'Magyar'), ex(4, '9.A', '2026-11-18', 'Biológia'),
  ex(5, '9.A', '2026-11-16'), ex(6, '9.A', '2026-11-16', 'Angol'), ex(7, '9.A', '2026-11-16', 'Történelem'),
  ex(8, '9.B', '2026-11-18', 'Földrajz'),
];

test('validate: érvényes számonkérés hibamentes', () => assert.deepEqual(E.validate(base, TODAY), {}));

test('validate: hibás mezők', () => {
  const e = E.validate({ className: '7.C', date: '', subject: '', type: '', teacher: 'Ki' }, TODAY);
  assert.deepEqual(Object.keys(e).sort(), ['class', 'date', 'subject', 'teacher', 'type']);
});

test('validate: múltbeli és hétvégi dátum hibás, a mai nap jó', () => {
  assert.ok(E.validate({ ...base, date: '2026-11-11' }, TODAY).date);
  assert.ok(E.validate({ ...base, date: '2026-11-14' }, TODAY).date);
  assert.equal(E.validate({ ...base, date: TODAY }, TODAY).date, undefined);
});

test('countOnDay: osztályonként és naponként számol', () => {
  assert.equal(E.countOnDay(exams, '9.A', '2026-11-18'), 4);
  assert.equal(E.countOnDay(exams, '9.B', '2026-11-18'), 1);
  assert.equal(E.countOnDay(exams, '9.A', '2026-11-17'), 0);
});

test('wouldOverload: a harmadik még belefér, a negyedik már túl sok', () => {
  assert.equal(E.wouldOverload(exams, '9.A', '2026-11-16'), true, 'már 3 van, a 4. túlterhelne');
  assert.equal(E.wouldOverload(exams, '9.B', '2026-11-18'), false);
  assert.equal(E.wouldOverload(exams.slice(4, 6), '9.A', '2026-11-16'), false, '2 van, a 3. belefér');
});

test('overloaded: csak a háromnál több számít (a 3 nem)', () => {
  assert.deepEqual(E.overloaded(exams), [{ date: '2026-11-18', className: '9.A', count: 4 }]);
});

test('overloaded: osztályra és napokra szűkíthető', () => {
  assert.deepEqual(E.overloaded(exams, { className: '9.B' }), []);
  assert.deepEqual(E.overloaded(exams, { dates: ['2026-11-16'] }), []);
});

test('week: öt nap, osztályszűrés és túlterhelt jelölés', () => {
  const w = E.week(exams, '2026-11-16');
  assert.equal(w.length, 5);
  assert.deepEqual(w.map((d) => d.items.length), [3, 0, 5, 0, 0]);
  assert.equal(w[2].over[0].className, '9.A');
  const b = E.week(exams, '2026-11-16', '9.B');
  assert.deepEqual(b.map((d) => d.items.length), [0, 0, 1, 0, 0]);
  assert.deepEqual(b[2].over, []);
});

test('week: a napon belül osztály, majd tantárgy szerint rendez (a 10.A a 9.A után jön)', () => {
  const list = [ex(1, '10.A', '2026-11-16', 'Angol'), ex(2, '9.B', '2026-11-16', 'Magyar'), ex(3, '9.B', '2026-11-16', 'Angol')];
  assert.deepEqual(E.week(list, '2026-11-16')[0].items.map((x) => x.id), [3, 2, 1]);
});
