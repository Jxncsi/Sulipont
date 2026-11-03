const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../js/logic/found.js');

const TODAY = '2026-11-12';
const item = (o = {}) => ({ id: 'a', name: 'Szürke pulcsi', category: 'Ruházat', place: 'Tornaterem', date: '2026-11-10', description: '', status: 'talalt', claimedBy: null, claimedAt: null, ...o });

test('validate: érvényes tárgy hibamentes', () => {
  assert.deepEqual(F.validate(item(), TODAY), {});
});

test('validate: hiányzó vagy hibás mezők', () => {
  const e = F.validate(item({ name: ' x ', category: 'Rakéta', place: '', date: '' }), TODAY);
  assert.deepEqual(Object.keys(e).sort(), ['category', 'date', 'name', 'place']);
});

test('validate: a mai nap még jó, a jövő nem', () => {
  assert.equal(F.validate(item({ date: TODAY }), TODAY).date, undefined);
  assert.ok(F.validate(item({ date: '2026-11-13' }), TODAY).date);
});

test('validate: nem létező dátum hibás', () => {
  assert.ok(F.validate(item({ date: '2026-02-31' }), TODAY).date);
});

test('validateClaim: legalább 3 karakter kell', () => {
  assert.ok(F.validateClaim('  '));
  assert.ok(F.validateClaim('Ab'));
  assert.equal(F.validateClaim('Kiss Anna, 9.A'), '');
});

const list = [
  item({ id: '1', name: 'Kék kulacs', category: 'Kulacs és étel', date: '2026-11-06', place: 'Ebédlő' }),
  item({ id: '2', name: 'Pulcsi', date: '2026-11-10' }),
  item({ id: '3', name: 'Tolltartó', category: 'Írószer', date: '2026-11-08', description: 'cicás', status: 'igenyelve' }),
];

test('filter: kategória', () => assert.deepEqual(F.filter(list, { category: 'Írószer' }).map((x) => x.id), ['3']));
test('filter: szöveg a névben, helyben és a leírásban is', () => {
  assert.deepEqual(F.filter(list, { q: 'ebédlő' }).map((x) => x.id), ['1']);
  assert.deepEqual(F.filter(list, { q: 'CICÁS' }).map((x) => x.id), ['3']);
});
test('filter: dátumtartomány zárt intervallum', () => {
  assert.deepEqual(F.filter(list, { from: '2026-11-08', to: '2026-11-10' }).map((x) => x.id), ['2', '3']);
});
test('filter: fordított tartományt felcseréli', () => {
  assert.deepEqual(F.filter(list, { from: '2026-11-10', to: '2026-11-08' }).map((x) => x.id), ['2', '3']);
});
test('filter: igényeltek elrejtése', () => {
  assert.deepEqual(F.filter(list, { hideClaimed: true }).map((x) => x.id), ['2', '1']);
});
test('filter: a legújabb elöl, az eredeti lista nem módosul', () => {
  assert.deepEqual(F.filter(list).map((x) => x.id), ['2', '3', '1']);
  assert.deepEqual(list.map((x) => x.id), ['1', '2', '3']);
});

test('claim és unclaim: nem módosítja az eredetit', () => {
  const c = F.claim(item(), ' Kiss Anna, 9.A ', TODAY);
  assert.equal(c.status, 'igenyelve');
  assert.equal(c.claimedBy, 'Kiss Anna, 9.A');
  assert.equal(c.claimedAt, TODAY);
  assert.equal(item().status, 'talalt');
  assert.equal(F.unclaim(c).status, 'talalt');
  assert.equal(F.unclaim(c).claimedBy, null);
});

test('agoLabel', () => {
  assert.equal(F.agoLabel('2026-11-12', TODAY), 'ma');
  assert.equal(F.agoLabel('2026-11-11', TODAY), 'tegnap');
  assert.equal(F.agoLabel('2026-11-05', TODAY), '7 napja');
});
