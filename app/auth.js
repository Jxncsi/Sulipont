'use strict';
/* Közös: Supabase-kliens és fiók (e-mail + jelszó + iskola). Az oldalak az `sb`, a `user`, a `profile`, a `gate()` és a `requireLogin()` segítségével használják.
   A kulcs publikus (publishable): az adatokat a Supabase jogosultsági szabályai védik (supabase/schema.sql). */
const sb = supabase.createClient('https://ooxfoivynfhtcxhwsewz.supabase.co', 'sb_publishable_-IKs81lcTLiy3VAAA0gHZQ_5A-ItthP');
let user; // a bejelentkezett felhasználó; undefined: még nem tudjuk, null: nincs belépve
let profile = null; // { school_id, name, class_name }: melyik iskolába jár
const userName = () => profile?.name || '';
const userLabel = () => (profile ? `${profile.name}, ${profile.class_name}` : ''); // pl. „Kiss Anna, 9.A"

const AUTH_CLASSES = ['9.A', '9.B', '10.A', '10.B', '11.A', '11.B', '12.A', '12.B']; // ugyanaz, mint a dolgozat.js CLASSES
const AUTH_ERRORS = {
  'Invalid login credentials': 'Hibás e-mail-cím vagy jelszó.',
  'User already registered': 'Ezzel az e-mail-címmel már van fiók.',
  'Email not confirmed': 'Előbb erősítsd meg az e-mail-címedet (levelet küldtünk).',
  'Database error saving new user': 'A regisztráció nem sikerült: ellenőrizd az iskolát és az osztályt.',
};
let signingUp = false; // igaz: regisztráció, hamis: belépés

/** Belépés/regisztráció ablak + gomb a menüben. Az oldal <script>-je után fut, ezért a megszokott segédeket (el, $, fill, toast) használja. */
function buildAuth() {
  const field = (id, label, control) => el('div', { class: 'field', id: `${id}-field` }, el('label', { for: id, text: label }), control);
  const input = (id, props) => el('input', { id, ...props });
  const dialog = el('dialog', { id: 'auth-dialog', 'aria-labelledby': 'auth-title' },
    el('form', { id: 'auth-form', novalidate: '' },
      el('h2', { id: 'auth-title' }),
      field('a-name', 'Neved', input('a-name', { type: 'text', maxlength: '60', placeholder: 'pl. Kiss Anna', autocomplete: 'name' })),
      field('a-school', 'Iskolád', el('select', { id: 'a-school' })),
      field('a-class', 'Osztályod', el('select', { id: 'a-class' })),
      field('a-email', 'E-mail-cím', input('a-email', { type: 'email', autocomplete: 'email' })),
      field('a-pass', 'Jelszó (legalább 6 karakter)', input('a-pass', { type: 'password', autocomplete: 'current-password' })),
      el('p', { class: 'error', id: 'err-auth', role: 'alert' }),
      el('div', { class: 'actions' },
        el('button', { class: 'btn', type: 'button', id: 'auth-cancel', text: 'Mégse' }),
        el('button', { class: 'btn btn-primary', type: 'submit', id: 'auth-submit' })),
      el('p', { class: 'muted' }, el('button', { class: 'btn btn-small btn-ghost', type: 'button', id: 'auth-switch' }))));
  document.body.append(dialog);
  $('#site-nav').append(el('button', { class: 'btn btn-small', id: 'auth-btn', type: 'button', onclick: () => (user ? sb.auth.signOut() : openAuth()) }));

  fill($('#a-school'), [], 'Válassz…');
  fill($('#a-class'), AUTH_CLASSES, 'Válassz…');
  sb.from('schools').select('id, name').order('name').then(({ data }) => fill($('#a-school'), (data || []).map((s) => ({ value: s.id, label: s.name })), 'Válassz…'));

  $('#auth-cancel').onclick = () => dialog.close();
  $('#auth-switch').onclick = () => setAuthMode(!signingUp);
  $('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#a-email').value.trim(), password = $('#a-pass').value, name = $('#a-name').value.trim();
    const school_id = $('#a-school').value, class_name = $('#a-class').value;
    const fail = (text) => { $('#err-auth').textContent = text; };
    if (signingUp && name.length < 3) return fail('Add meg a neved (legalább 3 karakter).');
    if (signingUp && !school_id) return fail('Válaszd ki az iskolád.');
    if (signingUp && !class_name) return fail('Válaszd ki az osztályod.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Adj meg érvényes e-mail-címet.');
    if (password.length < 6) return fail('A jelszó legalább 6 karakter legyen.');
    const { data, error } = signingUp
      ? await sb.auth.signUp({ email, password, options: { data: { name, school_id, class_name } } }) // a profilt az adatbázis trigger hozza létre ebből
      : await sb.auth.signInWithPassword({ email, password });
    if (error) return fail(AUTH_ERRORS[error.message] || error.message);
    dialog.close();
    toast(signingUp && !data.session ? 'Küldtünk egy megerősítő levelet: kattints a linkre, utána lépj be.' : 'Üdv a Sulipontban!');
  };
  paintAuth();
}

function setAuthMode(up) {
  signingUp = up;
  $('#auth-title').textContent = up ? 'Regisztráció' : 'Belépés';
  $('#auth-submit').textContent = up ? 'Regisztrálok' : 'Belépek';
  $('#auth-switch').textContent = up ? 'Már van fiókom' : 'Nincs fiókod? Regisztrálj';
  for (const id of ['a-name', 'a-school', 'a-class']) $(`#${id}-field`).hidden = !up;
  $('#a-pass').autocomplete = up ? 'new-password' : 'current-password';
  $('#err-auth').textContent = '';
}

function openAuth(up = false) {
  setAuthMode(up);
  $('#auth-dialog').showModal();
  $('#a-email').focus();
}

function paintAuth() {
  $('#auth-btn').textContent = user ? `Kilépés (${userName() || user.email})` : 'Belépés';
}

/** Írás előtt hívjuk: ha nincs bejelentkezve, megnyitja a belépést és false-t ad. */
function requireLogin() {
  if (user) return true;
  openAuth();
  $('#err-auth').textContent = 'Ehhez be kell jelentkezned.'; // a toast az ablak mögé kerülne
  return false;
}

/** Az adatok csak az iskola tagjainak látszanak: belépés nélkül (vagy amíg betölt) ezt mutatjuk a lista helyett. Belépve null. */
function gate() {
  if (user) return null;
  const wide = 'grid-column: 1 / -1'; // rácsban (heti tábla, kártyák) a teljes szélességet foglalja
  if (user === undefined) return el('p', { class: 'empty', style: wide, text: 'Betöltés…' });
  return el('p', { class: 'empty', style: wide }, 'Az adatokat az iskolád tagjai látják. ',
    el('button', { class: 'btn btn-small btn-primary', type: 'button', text: 'Belépés', onclick: () => openAuth() }));
}

buildAuth();
let lastId; // az utoljára feldolgozott felhasználó: a Supabase fülváltáskor is újra jelez, ilyenkor nem töltünk újra
sb.auth.onAuthStateChange((_event, session) => {
  user = session?.user ?? null;
  setTimeout(async () => { // a Supabase-hívások ne fussanak a visszahívásban
    const id = user?.id ?? null;
    if (id === lastId) return;
    lastId = id;
    profile = null;
    if (user) profile = (await sb.from('profiles').select('*').maybeSingle()).data;
    paintAuth();
    if (typeof onAuthChange === 'function') await onAuthChange(); // az oldal újratölti és újrarajzolja magát
  });
});
