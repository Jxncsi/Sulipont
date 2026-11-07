/* Saját ikonkészlet: egyszerű, vastag vonalú rajzok (emoji helyett). Csak a kódban lévő, állandó SVG-t használjuk, felhasználói adat nem kerül bele. */
(function (root) {
  const S = root.Sulipont;

  // 48×48-as rajzok. Az alakzatok alapból kitöltöttek (var(--ic-fill)), a részletvonalak fill="none".
  const SHAPES = {
    'hoodie': '<path d="M17 8 L5 16 L8 31 L14 29 V42 H34 V29 L40 31 L43 16 L31 8 Q24 21 17 8Z"/><path fill="none" d="M18 33 H30 L28 40 H20Z"/>',
    'bottle': '<rect x="18" y="3" width="12" height="7" rx="2"/><path d="M16 12 H32 V40 A4 4 0 0 1 28 44 H20 A4 4 0 0 1 16 40Z"/><path fill="none" d="M16 21 H32 M16 29 H32"/>',
    'pencil-case': '<rect x="4" y="15" width="40" height="22" rx="9"/><path fill="none" d="M8 26 H40 M14 15 L16 7 M22 15 L23 5 M30 15 L29 7"/><circle cx="37" cy="26" r="2.5" fill="currentColor"/>',
    'backpack': '<path d="M13 15 A11 11 0 0 1 35 15 V40 A4 4 0 0 1 31 44 H17 A4 4 0 0 1 13 40Z"/><rect x="17" y="27" width="14" height="11" rx="2"/><path fill="none" d="M20 9 V7 A4 4 0 0 1 28 7 V9 M17 22 H31"/>',
    'key': '<circle cx="14" cy="24" r="9"/><circle cx="14" cy="24" r="3" fill="var(--card)"/><path fill="none" d="M23 24 H45 M37 24 V31 M43 24 V30"/>',
    'headphones': '<path fill="none" d="M7 28 V24 A17 17 0 0 1 41 24 V28"/><rect x="4" y="26" width="10" height="15" rx="4"/><rect x="34" y="26" width="10" height="15" rx="4"/>',
    'ball': '<circle cx="24" cy="24" r="19"/><path fill="none" d="M24 5 V43 M5 24 H43 M10 10 Q24 24 10 38 M38 10 Q24 24 38 38"/>',
    'box': '<path d="M5 15 L24 6 L43 15 V34 L24 43 L5 34Z"/><path fill="none" d="M5 15 L24 24 L43 15 M24 24 V43"/>',
    'pencil': '<path d="M8 40 L10 31 L33 8 L41 16 L18 39Z"/><path fill="none" d="M29 12 L37 20 M10 31 L18 39"/>',
    'book': '<path d="M5 9 H21 Q24 9 24 12 V41 Q24 38 21 38 H5Z"/><path d="M43 9 H27 Q24 9 24 12 V41 Q24 38 27 38 H43Z"/>',
    'heart': '<path d="M24 42 C7 31 4 20 9 14 C14 8 22 10 24 17 C26 10 34 8 39 14 C44 20 41 31 24 42Z"/>',
    'trash': '<path fill="none" d="M9 13 H39 M18 13 V8 H30 V13 M12 13 L14 41 H34 L36 13 M20 20 V34 M28 20 V34"/>',
    'alert': '<path d="M24 5 L45 41 H3Z"/><path fill="none" d="M24 18 V29"/><circle cx="24" cy="35" r="1.8" fill="currentColor"/>',
    'plus': '<path fill="none" stroke-width="5" d="M24 8 V40 M8 24 H40"/>',
    'check': '<path fill="none" stroke-width="5" d="M9 25 L20 36 L40 11"/>',
  };

  /** A talált tárgyak kategóriáihoz tartozó rajz és színfolt. */
  const CATEGORY = {
    'Ruházat': ['hoodie', 'var(--tomato)'],
    'Kulacs és étel': ['bottle', '#7aa2ff'],
    'Írószer': ['pencil-case', 'var(--sun)'],
    'Táska': ['backpack', 'var(--mint)'],
    'Kulcs és ékszer': ['key', 'var(--kraft)'],
    'Elektronika': ['headphones', 'var(--hl)'],
    'Sport': ['ball', '#ff7a3d'],
    'Egyéb': ['box', 'var(--paper-2)'],
  };

  function svg(name) {
    const t = document.createElement('template');
    t.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="var(--ic-fill, none)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${SHAPES[name] || SHAPES.box}</svg>`;
    return t.content.firstChild;
  }

  /** <span class="icon">…</span>; fill: CSS szín (csak a kódból, pl. 'var(--sun)'). */
  function icon(name, fill) {
    const span = document.createElement('span');
    span.className = 'icon';
    if (fill) span.style.setProperty('--ic-fill', fill);
    span.append(svg(name));
    return span;
  }

  /** A [data-icon] attribútumos elemekbe beteszi a rajzot. */
  function hydrateIcons(scope = document) {
    for (const node of scope.querySelectorAll('[data-icon]')) {
      node.classList.add('icon');
      node.replaceChildren(svg(node.dataset.icon));
    }
  }

  const categoryIcon = (category) => { const [name, tint] = CATEGORY[category] || CATEGORY['Egyéb']; return { name, tint }; };

  Object.assign(S.ui, { icon, hydrateIcons, categoryIcon });
})(window);
