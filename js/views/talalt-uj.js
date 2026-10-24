/* Új talált tárgy felvétele: űrlap validációval és fotófeltöltéssel (a kép a böngészőben kicsinyítve kerül tárolásra). */
(function (root) {
  const S = root.Sulipont;
  const { $, fillSelect, toast, showErrors, clearErrorsOnInput } = S.ui;
  const F = S.found;
  const { CATEGORIES } = S.data;

  const KEYS = ['name', 'category', 'date', 'place', 'photo'];
  const MAX_FILE = 15 * 1024 * 1024; // a kicsinyítés előtti feltöltési határ
  const MAX_SIDE = 480;              // a tárolt kép hosszabbik oldala (px)

  let photo = null; // dataURL vagy null

  /** Kép beolvasása és kicsinyítése JPEG-re, hogy a localStorage-ban elférjen. */
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * k));
        c.height = Math.max(1, Math.round(img.height * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unsupported')); };
      img.src = url;
    });
  }

  function setPhoto(dataUrl) {
    photo = dataUrl;
    $('#t-preview').hidden = !dataUrl;
    if (dataUrl) $('#t-preview-img').src = dataUrl; else $('#t-preview-img').removeAttribute('src');
  }

  async function onPhoto(e) {
    const file = e.target.files[0];
    $('#err-t-photo').textContent = '';
    if (!file) { setPhoto(null); return; }
    if (!file.type.startsWith('image/')) { setPhoto(null); $('#err-t-photo').textContent = 'Csak képfájlt (JPG, PNG) lehet feltölteni.'; return; }
    if (file.size > MAX_FILE) { setPhoto(null); $('#err-t-photo').textContent = 'A fájl túl nagy (legfeljebb 15 MB).'; return; }
    try { setPhoto(await shrink(file)); }
    catch { setPhoto(null); $('#err-t-photo').textContent = 'Ezt a képformátumot nem tudjuk feldolgozni, használj JPG vagy PNG fájlt.'; }
  }

  function reset() {
    $('#found-form').reset();
    setPhoto(null);
    $('#t-date').value = S.state.today;
    showErrors('t', KEYS, {});
  }

  function submit(e) {
    e.preventDefault();
    const item = {
      id: S.store.makeId('t'),
      name: $('#t-name').value.trim(),
      category: $('#t-category').value,
      place: $('#t-place').value.trim(),
      date: $('#t-date').value,
      description: $('#t-desc').value.trim(),
      photo,
      status: 'talalt', claimedBy: null, claimedAt: null,
    };
    if (showErrors('t', KEYS, F.validate(item, S.state.today))) return;
    const saved = S.repos.found.add(item);
    toast(`„${item.name}" felvéve a talált tárgyak közé.`);
    if (!saved) toast('A böngésző tárolója megtelt: a tárgy csak az oldal bezárásáig marad meg. Törölj régi tárgyakat.', 'bad');
    S.go('talalt');
  }

  S.views = S.views || {};
  S.views['talalt-uj'] = {
    init() {
      fillSelect($('#t-category'), CATEGORIES, { placeholder: 'Válassz…' });
      $('#t-date').max = S.state.today;
      const form = $('#found-form');
      form.addEventListener('submit', submit);
      clearErrorsOnInput(form, 't', KEYS);
      $('#t-photo').addEventListener('change', onPhoto);
      $('#t-photo-clear').addEventListener('click', () => { $('#t-photo').value = ''; setPhoto(null); });
    },
    show: reset,
  };
})(window);
