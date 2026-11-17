# Sulipont – iskolai portál

> „Problémából Szoftver – Agilis Fejlesztés" projekt. Reszponzív webes alkalmazás tiszta HTML, CSS és JavaScript alapon (build nélkül). Az adatokat és a fiókokat a Supabase kezeli, az oldal Vercelen fut.

Három valós iskolai probléma, egy közös felületen:

| Modul | Probléma | Megoldás |
|---|---|---|
| **Talált tárgyak** | Az elhagyott pulcsik, kulacsok, tolltartók a portán gyűlnek, és senki nem tudja, mi van ott. | Fotós lista, szűrés kategóriára és dátumra, „Ez az enyém!" jelzés, új tárgy felvétele űrlappal. |
| **Dolgozatnaptár** | A számonkérések torlódnak, mert a tanárok nem látják egymáséit. | Heti nézet osztályonként, új dolgozat felvétele, figyelmeztetés, ha egy napra háromnál több esik. |
| **Tankönyvbörze** | A felsőbb évesek használt könyvei kárba vesznek, az alsóbb évesek újat vesznek. | Hirdetésfeladás, keresés tantárgyra és évfolyamra, kedvencek. |

## Arculat

Az oldal az iskolai tárgyakból épül fel: parafatábla és polaroidok a talált tárgyaknak, spirálos tervező a dolgozatoknak, iskolatábla és könyvborítók a börzének. Saját rajzolt ikonok (nincs emoji), saját színek, négy betűtípus. A betűk nyílt licencűek (OFL) és a `fonts/` mappában vannak, így internet nélkül is működik minden.

## Futtatás

Nincs build lépés, az oldal statikus. Helyi szerverrel (a Supabase-hez internet kell):

```bash
npx serve .
```

Az adatok a Supabase-ben vannak (táblák, jogosultsági szabályok és demó adatok: `supabase/schema.sql`). Minden adat **iskolához** tartozik: regisztrációkor a felhasználó kiválasztja az iskoláját és az osztályát (e-mail + jelszó), és belépve csak a saját iskolája tárgyait, dolgozatait és hirdetéseit látja. Belépés nélkül csak a belépés felület látszik. Új sort a saját iskolába lehet felvenni, törölni csak a sajátot.

Új iskola felvétele (Supabase SQL Editor):

```sql
insert into schools (name) values ('Példa Gimnázium');
```

A sémában egy „Minta Gimnázium" demó adatokkal van. A regisztrációnál az iskolát ellenőrzés nélkül lehet választani, így bárki csatlakozhat bármelyik iskolához (meghívókód később jöhet).

Tesztek (Node.js 18+):

```bash
node --test
```

A jogosultsági szabályokat a `supabase/rls-teszt.sql` próbálja ki (a Supabase SQL Editorban futtatható).

## Üzembe helyezés (Vercel)

1. A repót importáld a Vercelben (Framework Preset: *Other*, build parancs és kimeneti mappa üresen).
2. A `vercel.json` a főoldalt a `app/talalt.html`-re irányítja. Környezeti változó nem kell: a Supabase publikus kulcsa az `app/auth.js` elején van (a védelmet a Supabase jogosultsági szabályai adják).
3. Supabase → Authentication → URL Configuration: a *Site URL* legyen a Vercel-cím, hogy a megerősítő e-mail oda mutasson.

## Mappaszerkezet

Három funkció, három oldal. Mindegyikhez egy HTML, egy CSS és egy JS fájl tartozik, a fájlok önállóak.

```
app/talalt.html    talalt.css    talalt.js      Talált tárgyak
app/dolgozat.html  dolgozat.css  dolgozat.js    Dolgozatnaptár
app/konyv.html     konyv.css     konyv.js       Tankönyvbörze
app/auth.js                                     közös: Supabase-kliens, belépés és regisztráció (iskola + osztály)
supabase/schema.sql  rls-teszt.sql              adatbázis-séma + jogosultságok + demó adatok, és a jogosultsági teszt
vercel.json                                     Vercel beállítás (főoldal → app/talalt.html)
docs.html  docs.css                             a projektdokumentáció böngészőben olvasható változata
test.js                                         egységtesztek (a három JS fájl logikai részéhez)
fonts/                                          betűtípusok (OFL), így internet nélkül is működik
docs/                                           Sulipont-dokumentacio.docx (a docs.html tartalma Wordben)
```

## Eszközök

| Eszköz | Link |
|---|---|
| Projektmenedzsment (Trello) | https://trello.com/b/x6AtH50N/sulipont-iskolai-port%C3%A1l-tal%C3%A1lt-t%C3%A1rgyak-dolgozatnapt%C3%A1r-tank%C3%B6nyvb%C3%B6rze |
| Tervek | Figma |
| Adatbázis és fiókok | Supabase (Postgres + Auth) |
| Üzemeltetés | Vercel |
| Verziókövetés | Git (`main`, `dev`, `feature/*`, `docs/*` ágak) |

## Dokumentáció

Lásd a `docs.html` oldalt és a `docs/Sulipont-dokumentacio.docx` fájlt.
