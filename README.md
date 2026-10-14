# Sulipont – iskolai portál

> „Problémából Szoftver – Agilis Fejlesztés" projekt. Reszponzív webes alkalmazás tiszta HTML, CSS és JavaScript alapon, külső függőség nélkül.

Három valós iskolai probléma, egy közös felületen:

| Modul | Probléma | Megoldás |
|---|---|---|
| **Talált tárgyak** | Az elhagyott pulcsik, kulacsok, tolltartók a portán gyűlnek, és senki nem tudja, mi van ott. | Fotós lista, szűrés kategóriára és dátumra, „Ez az enyém!" jelzés, új tárgy felvétele űrlappal. |
| **Dolgozatnaptár** | A számonkérések torlódnak, mert a tanárok nem látják egymáséit. | Heti nézet osztályonként, új dolgozat felvétele, figyelmeztetés, ha egy napra háromnál több esik. |
| **Tankönyvbörze** | A felsőbb évesek használt könyvei kárba vesznek, az alsóbb évesek újat vesznek. | Hirdetésfeladás, keresés tantárgyra és évfolyamra, kedvencek. |

## Futtatás

Nincs build lépés. Elég megnyitni az `index.html` fájlt böngészőben, vagy helyi szerverrel:

```bash
npx serve .
```

Az adatok a böngésző `localStorage`-ában tárolódnak (nincs szerver). Az első indításnál demó adatok töltődnek be.

Tesztek (Node.js 18+):

```bash
node --test tests/
```

## Mappaszerkezet

```
index.html      az alkalmazás
docs.html       a projektdokumentáció böngészőben olvasható változata
css/            stíluslapok (alap, elrendezés, komponensek, modulok, reszponzív)
js/core/        dátum segédek, tárolás, UI segédek, router
js/logic/       a modulok üzleti logikája (DOM nélkül, tesztelhető)
js/views/       a nézetek (kezdőlap, talált tárgyak, dolgozatnaptár, tankönyvbörze)
tests/          egységtesztek a logikához
docs/           Markdown dokumentáció (elemzés, MoSCoW, szerepkörök, ...)
```

## Eszközök

| Eszköz | Link |
|---|---|
| Projektmenedzsment (Trello) | https://trello.com/b/x6AtH50N/sulipont-iskolai-port%C3%A1l-tal%C3%A1lt-t%C3%A1rgyak-dolgozatnapt%C3%A1r-tank%C3%B6nyvb%C3%B6rze |
| Tervek (Figma) | https://www.figma.com/design/hCLiY46XTIukD7jxpJfkar |
| Verziókövetés | Git (`main`, `dev`, `feature/*`, `docs/*` ágak) |

## Dokumentáció

Lásd a [docs/](docs/) mappát és a `docs.html` oldalt.
