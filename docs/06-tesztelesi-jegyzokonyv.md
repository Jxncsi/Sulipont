# 6. Tesztelési jegyzőkönyv

Tesztelés dátuma: 2026. 11. 12. Tesztelt build: `dev` ág, a kiadás előtti állapot.
Tesztkörnyezet: Chromium alapú beépített böngésző, asztali szélesség (1200 px) és mobil nézet (375 px).

## Automata egységtesztek

```bash
node --test
```

Eredmény: **40 teszt sikeres**

| Fájl | Mit fed le | Tesztek |
|---|---|---|
| `tests/dates.test.js` | dátumkezelés, hétfő/hétvége, óraátállítás, formázás | 8 |
| `tests/found.test.js` | talált tárgyak: validáció, szűrés, igénylés | 13 |
| `tests/exams.test.js` | dolgozatnaptár: validáció, napi terhelés (> 3), heti nézet | 9 |
| `tests/books.test.js` | tankönyvbörze: validáció, keresés, rendezés, kedvencek, ár | 10 |

## Kézi tesztek

| Modul | Teszt | Eredmény |
|---|---|---|
| Talált tárgyak | Lista (8 demó tárgy), szűrés kategóriára (Ruházat: 2) és dátumra (utolsó 3 nap: 3), igényeltek elrejtése | megfelelt |
| Talált tárgyak | „Ez az enyém!": üres névre hiba, érvényes névre „Igényelve", visszavonás, törlés megerősítéssel | megfelelt |
| Talált tárgyak | Új tárgy: üres űrlap hibái, jövőbeli dátum elutasítva, 2000×1500 px fotó JPEG-re kicsinyítve, szöveges fájl elutasítva | megfelelt |
| Dolgozatnaptár | Heti nézet (5 nap), torlódás-figyelmeztetés (9.A: 4 számonkérés), osztályszűrő, hétváltás | megfelelt |
| Dolgozatnaptár | Új dolgozat: hétvége elutasítva, élő napi terhelés-jelzés, megerősítés a 4. felvételekor (Mégse: nem ment, OK: ment), törlés | megfelelt |
| Tankönyvbörze | Keresés (fizika: 1), tantárgy (matek: 1), évfolyam (9.: 3), rendezés ár szerint, kedvencek (megmaradnak a tárolóban) | megfelelt |
| Tankönyvbörze | Hirdetésfeladás: hibás ár (-5) és elérhetőség elutasítva, 0 Ft = „Ingyen", telefonszám `tel:` linkként, törlés megerősítéssel | megfelelt |
| Reszponzív | 375 px: mind a 7 nézeten nincs vízszintes görgetés, hamburger menü, heti tábla egy oszlopban; 1200 px: 4 oszlopos kártyarács | megfelelt |
| Cross-browser | Firefox, Safari, Edge | **még nem tesztelt** |
| Valódi telefon | iOS/Android; fotó készítése kamerával a feltöltéshez | **még nem tesztelt** |

## Tesztelés közben talált hiba

- **Dokumentációs oldal, Ütemezés szakasz:** a CSS-szelektor (`.timeline li`) a beágyazott pontokra is ráillett, ezért 4 helyett 15 „fázis"-kártya jelent meg. Javítva (`.timeline > li`).

## Ismert korlátok

- Az adatok a böngészőben vannak (`localStorage`), ezért két gép nem látja egymás adatait.
- Nincs bejelentkezés: bárki törölhet bármit, és bárki igényelhet bármit.
- A feltöltött fotók a böngésző tárolójában vannak (kicsinyítve, kb. 30–60 KB/db); a tároló ~5 MB-os, tele tárolónál figyelmeztetünk.
- Az iskolai szünetek és ünnepnapok nincsenek kezelve (csak a hétvége tiltott a dolgozatoknál).
