# Sulipont – iskolai portál

> „Problémából Szoftver – Agilis Fejlesztés" projekt. Reszponzív webes alkalmazás tiszta HTML, CSS és JavaScript alapon, külső függőség nélkül.

Három valós iskolai probléma, egy közös felületen:

| Modul | Probléma | Megoldás |
|---|---|---|
| **Talált tárgyak** | Az elhagyott pulcsik, kulacsok, tolltartók a portán gyűlnek, és senki nem tudja, mi van ott. | Fotós lista, szűrés kategóriára és dátumra, „Ez az enyém!" jelzés, új tárgy felvétele űrlappal. |
| **Dolgozatnaptár** | A számonkérések torlódnak, mert a tanárok nem látják egymáséit. | Heti nézet osztályonként, új dolgozat felvétele, figyelmeztetés, ha egy napra háromnál több esik. |
| **Tankönyvbörze** | A felsőbb évesek használt könyvei kárba vesznek, az alsóbb évesek újat vesznek. | Hirdetésfeladás, keresés tantárgyra és évfolyamra, kedvencek. |

## Arculat

Az oldal az iskolai tárgyakból épül fel: parafatábla és polaroidok a talált tárgyaknak, spirálos tervező a dolgozatoknak, iskolatábla és könyvborítók a börzének. Saját rajzolt ikonok (nincs emoji), saját színek, négy betűtípus. A betűk nyílt licencűek (OFL) és a `fonts/` mappában vannak, így internet nélkül is működik minden.

## Futtatás

Nincs build lépés. Elég megnyitni az `app/talalt.html` fájlt böngészőben (a három oldal egymásra mutat), vagy helyi szerverrel:

```bash
npx serve .
```

Az adatok a böngésző `localStorage`-ában tárolódnak (nincs szerver). Az első indításnál demó adatok töltődnek be.

Tesztek (Node.js 18+):

```bash
node --test
```

## Mappaszerkezet

Három funkció, három oldal. Mindegyikhez egy HTML, egy CSS és egy JS fájl tartozik, a fájlok önállóak.

```
app/talalt.html    talalt.css    talalt.js      Talált tárgyak
app/dolgozat.html  dolgozat.css  dolgozat.js    Dolgozatnaptár
app/konyv.html     konyv.css     konyv.js       Tankönyvbörze
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
| Verziókövetés | Git (`main`, `dev`, `feature/*`, `docs/*` ágak) |

## Dokumentáció

Lásd a `docs.html` oldalt és a `docs/Sulipont-dokumentacio.docx` fájlt.
