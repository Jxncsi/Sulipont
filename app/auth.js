'use strict';
/* Közös: Supabase-kliens és fiók (e-mail + jelszó). Az oldalak az `sb`, a `user` és a `requireLogin()` segítségével használják.
   A kulcs publikus (publishable): az adatokat a Supabase jogosultsági szabályai védik (supabase/schema.sql). */
const sb = supabase.createClient('https://ooxfoivynfhtcxhwsewz.supabase.co', 'sb_publishable_-IKs81lcTLiy3VAAA0gHZQ_5A-ItthP');
let user = null; // a bejelentkezett felhasználó (vagy null)
const userName = () => user?.user_metadata?.name || '';

const AUTH_ERRORS = {
  'Invalid login credentials': 'Hibás e-mail-cím vagy jelszó.',
  'User already registered': 'Ezzel az e-mail-címmel már van fiók.',
  'Email not confirmed': 'Előbb erősítsd meg az e-mail-címedet (levelet küldtünk).',
};
let signingUp = false; // igaz: regisztráció, hamis: belépés

/** Belépés/regisztráció ablak + gomb a menüben. Az oldal <script>-je után fut, ezért a megszokott segédeket (el, $, toast) használja. */
function buildAuth() {
  const field = (id, label, props) => el('div', { class: 'field', id: `${id}-field` }, el('label', { for: id, text: label }), el('input', { id, ...props }));
  const dialog = el('dialog', { id: 'auth-dialog', 'aria-labelledby': 'auth-title' },
    el('form', { id: 'auth-form', novalidate: '' },
      el('h2', { id: 'auth-title' }),
      field('a-name', 'Neved és osztályod', { type: 'text', maxlength: '60', placeholder: 'pl. Kiss Anna, 9.A', autocomplete: 'name' }),
      field('a-email', 'E-mail-cím', { type: 'email', autocomplete: 'email' }),
      field('a-pass', 'Jelszó (legalább 6 karakter)', { type: 'password', autocomplete: 'current-password' }),
      el('p', { class: 'error', id: 'err-auth', role: 'alert' }),
      el('div', { class: 'actions' },
        el('button', { class: 'btn', type: 'button', id: 'auth-cancel', text: 'Mégse' }),
        el('button', { class: 'btn btn-primary', type: 'submit', id: 'auth-submit' })),
      el('p', { class: 'muted' }, el('button', { class: 'btn btn-small btn-ghost', type: 'button', id: 'auth-switch' }))));
  document.body.append(dialog);
  $('#site-nav').append(el('button', { class: 'btn btn-small', id: 'auth-btn', type: 'button', onclick: () => (user ? sb.auth.signOut() : openAuth()) }));

  $('#auth-cancel').onclick = () => dialog.close();
  $('#auth-switch').onclick = () => setAuthMode(!signingUp);
  $('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = $('#a-email').value.trim(), password = $('#a-pass').value, name = $('#a-name').value.trim();
    const fail = (text) => { $('#err-auth').textContent = text; };
    if (signingUp && name.length < 3) return fail('Add meg a neved és az osztályodat (legalább 3 karakter).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Adj meg érvényes e-mail-címet.');
    if (password.length < 6) return fail('A jelszó legalább 6 karakter legyen.');
    const { data, error } = signingUp
      ? await sb.auth.signUp({ email, password, options: { data: { name } } })
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
  $('#a-name-field').hidden = !up;
  $('#a-pass').autocomplete = up ? 'new-password' : 'current-password';
  $('#err-auth').textContent = '';
}

function openAuth(up = false) {
  setAuthMode(up);
  $('#auth-dialog').showModal();
  $('#a-email').focus();
}

function paintAuth() {
  $('#auth-btn').textContent = user ? `Kilépés (${userName().split(',')[0] || user.email})` : 'Belépés';
}

/** Írás előtt hívjuk: ha nincs bejelentkezve, megnyitja a belépést és false-t ad. */
function requireLogin() {
  if (user) return true;
  openAuth();
  $('#err-auth').textContent = 'Ehhez be kell jelentkezned.'; // a toast az ablak mögé kerülne
  return false;
}

buildAuth();
sb.auth.onAuthStateChange((_event, session) => {
  user = session?.user ?? null;
  paintAuth();
  setTimeout(() => typeof onAuthChange === 'function' && onAuthChange()); // az oldal újrarajzolja magát (a Supabase-hívások ne fussanak a visszahívásban)
});
