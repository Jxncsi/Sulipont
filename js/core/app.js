/* Alkalmazás mag: közös állapot, hash-alapú router, mobil menü. A nézetek a js/views/ mappából regisztrálják magukat. */
(function (root) {
  const S = root.Sulipont;
  const { $, $$ } = S.ui;
  const DEFAULT_VIEW = 'kezdolap';

  S.state = { today: S.dates.todayISO() };
  S.views = S.views || {}; // a nézetek az app.js előtt töltődnek be és már regisztrálták magukat

  /** Navigálás: S.go('talalt-uj') vagy S.go('dolgozat', { week: '2026-11-16' }) */
  S.go = function (view, params) {
    location.hash = view + (params ? '?' + new URLSearchParams(params) : '');
  };

  function parseHash() {
    const [name, q = ''] = location.hash.slice(1).split('?');
    const known = $$('.view').some((v) => v.dataset.view === name);
    return { name: known ? name : DEFAULT_VIEW, params: Object.fromEntries(new URLSearchParams(q)) };
  }

  function route(moveFocus) {
    const { name, params } = parseHash();
    let section = name;
    for (const v of $$('.view')) {
      v.hidden = v.dataset.view !== name;
      if (!v.hidden) section = v.dataset.section;
    }
    for (const a of $$('[data-nav]')) {
      if (a.dataset.nav === section) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    const view = S.views[name];
    if (view) view.show(params);
    document.title = `${$(`#h-${name}`).textContent.trim()} – Sulipont`;
    window.scrollTo(0, 0);
    setNav(false);
    if (moveFocus) $('#main').focus({ preventScroll: true });
  }

  /* Mobil menü */
  function setNav(open) {
    const nav = $('#site-nav'), btn = $('#nav-toggle');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
  }

  function init() {
    $('#nav-toggle').addEventListener('click', () => setNav($('#nav-toggle').getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
    S.ui.hydrateIcons();
    Object.values(S.views).forEach((v) => v.init && v.init());
    window.addEventListener('hashchange', () => route(true));
    route(false);
    // A böngésző a #fragment alapján a nézet tetejéhez görget (a ragadós fejléc alá): ezt visszaállítjuk.
    window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
  }

  init();
})(window);
