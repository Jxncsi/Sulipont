# 9. Arculat

## Ötlet

A Sulipont nem „egy újabb webalkalmazás kártyákkal", hanem az iskola tárgyaiból épül fel: füzetlap, cetli, matrica, gumibélyegző, krétatábla, parafatábla. Minden modul a saját valós tárgyára hasonlít, így első ránézésre kiderül, mire való.

| Modul | Tárgy, amire hasonlít | Színe |
|---|---|---|
| Kezdőlap | letéphető naptárlap a mai nappal, három „tárgy" csempe | sárga / kék / zöld |
| Talált tárgyak | a portai **parafatábla**: kitűzött polaroidok rajzszöggel, „IGÉNYELVE" gumibélyegző | sárga (címke) |
| Dolgozatnaptár | **spirálos tervezőnapló**: tantárgyanként színes matricák, a torlódó nap csíkos fejléccel és „Torlódás!" bélyeggel | kék (tinta) |
| Tankönyvbörze | **iskolatábla** a szűrőnek, **könyvborítók** színes gerinccel, könyvjelzővel és ármatricával | zöld (tábla) |

A logó egy piros tollal **bekarikázott 5-ös**, a magyar iskolai osztályzás legjobb jegye. A „Sulipont" névben a „pont" is erre utal.

## Színek

| Név | Érték | Mire használjuk |
|---|---|---|
| Papír | `#f4eddd` | háttér (halványkék vonalakkal és papírszemcsével, mint egy füzetlap) |
| Tinta | `#19150f` | szöveg, keretek, kemény árnyékok |
| Filctoll-piros | `#d6371f` | hibák, bélyeg, torlódás |
| Napsárga | `#ffc21a` | talált tárgyak, jegyzetek, kiemelés |
| Töltőtoll-kék | `#1e3fc4` | dolgozatnaptár, kézírásos megjegyzések |
| Táblazöld | `#1f5a45` | tankönyvbörze |
| Szövegkiemelő-rózsaszín | `#ff8db2` | dokumentáció, kedvenc |
| Parafa, fa | `#c99a5b`, `#8a5a2b` | a portai tábla és a krétatábla kerete |

A tantárgyaknak saját színük van (matematika sárga, magyar rózsaszín, fizika világoskék, kémia lime …), ugyanaz látszik a dolgozatok matricáin és a könyvek gerincén.

## Betűk

Mind nyílt licencű (OFL), a repóban tárolva (`fonts/`), magyar ékezetekkel (latin-ext):

- **Alfa Slab One**: címek és nagy számok (plakátos, vastag talpas)
- **Atkinson Hyperlegible**: folyó szöveg (a nehezen olvasóknak is jól olvasható)
- **Courier Prime**: írógépes címkék, dátumok, bélyegek
- **Caveat**: kézírásos megjegyzések (hely, tanár neve, könyv megjegyzése)

## Alapelvek

- **Nincs emoji és nincs sablonos ikon**: a tárgyak saját rajzolt SVG ikonok (`js/core/icons.js`).
- **Kemény árnyék, lenyomható gombok**: a gombok „fizikai" tárgyként viselkednek (hover: elemelkedik, kattintás: lenyomódik).
- **Enyhe elforgatás**: a kitűzött lapok, matricák és csempék néhány tized fokkal ferdék, mint a valódi cetlik; hoverre kiegyenesednek.
- **Egy szín = egy jelentés**: piros mindig hiba/torlódás, a modul színe mindig az adott modul.
- **Hozzáférhetőség**: a szöveg és a háttér kontrasztja megfelel az AA szintnek, a fókusz jól látszik, a mozgás kikapcsolható (`prefers-reduced-motion`).
