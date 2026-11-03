# 1. Problémaelemzés

## A három kiválasztott probléma

| # | Probléma | Ki érintett? | Következmény |
|---|---|---|---|
| 1 | **Talált tárgyak**: az elhagyott pulcsik, kulacsok, tolltartók a portán gyűlnek, és senki nem tudja, mi van ott. | diákok, portás | a tárgyak gazdátlanok maradnak |
| 2 | **Dolgozat- és beadandónaptár**: a számonkérések torlódnak, mert a tanárok nem látják egymáséit. | diákok, tanárok | egy napra 4–5 számonkérés is esik |
| 3 | **Tankönyv- és jegyzetbörze**: a felsőbb évesek használt könyvei kárba vesznek, az alsóbb évesek újat vesznek. | diákok, szülők | felesleges költség, kidobott könyvek |

**Közös gyökér:** az iskolai információ szétszórt (a portán, a tanárok fejében, a faliújságon), és nincs egy közös, keresni-szűrni tudó felület.

> Probléma-állítás: *„Az iskolai információk nem jutnak el az érintettekhez, mert nincs egy közös, kereshető felület."*

## Ishikawa (halszálka) diagram

**Következmény (a hal feje):** az iskolai információ nem jut el az érintettekhez.

| Ág | Okok |
|---|---|
| **Emberek** | A portás nem tudja nyilvántartani a talált tárgyakat. A tanárok nem egyeztetnek a dolgozatokról. A diákok nem tudják, kinek adnák el a könyvet. |
| **Folyamat** | A talált tárgy leadása nincs rögzítve. A dolgozat időpontját a tanár egyedül dönti el. A könyvek hirdetése szóbeli. |
| **Eszközök** | Doboz a portán, papíros füzet, faliújság. Nincs közös digitális felület. |
| **Információ** | Nem látszik, mi van a portán. Nem látszik, melyik napon hány dolgozat van. Nem látszik, milyen használt könyv kapható. |
| **Környezet** | A szünetek rövidek, nincs idő keresgélni. Sok osztály, sok tanár, sok tárgy. |
| **Szabályok** | Nincs napi dolgozatkorlát. Nincs határidő a talált tárgyak megőrzésére. Nincs hirdetési szabály. |

(A diagram rajzolt változata a `docs.html` oldalon található.)

## 5 Miért

### 1. Talált tárgyak
1. **Miért marad gazdátlan a tárgy?** Mert a gazdája nem tudja, hogy a portán van.
2. **Miért nem tudja?** Mert nincs róla lista, a doboz tartalmát nem látja senki.
3. **Miért nincs lista?** Mert a leadáskor senki nem írja fel, mi került be.
4. **Miért nem írja fel senki?** Mert papíron fáradságos, és nincs, aki ellenőrizné.
5. **Miért nincs más eszköz?** Mert nincs egyszerű, fotóval is működő felület.
→ **Gyökérok:** hiányzik a talált tárgyak közös, fotós nyilvántartása.

### 2. Dolgozatnaptár
1. **Miért torlódnak a dolgozatok?** Mert több tanár ugyanarra a napra tervez.
2. **Miért?** Mert nem látják egymás számonkéréseit.
3. **Miért nem látják?** Mert mindenki a saját naplójába írja.
4. **Miért külön naplók?** Mert nincs osztályonkénti közös naptár.
5. **Miért nincs?** Mert eddig senki nem vállalta a vezetését és nincs jelzés a torlódásról.
→ **Gyökérok:** hiányzik a közös, figyelmeztetéssel ellátott dolgozatnaptár.

### 3. Tankönyvbörze
1. **Miért vesznek újat az alsóbb évesek?** Mert nem tudják, hogy van használt.
2. **Miért nem tudják?** Mert a felsőbb évesek nem hirdetik.
3. **Miért nem hirdetik?** Mert nincs hova, a faliújság nem kereshető.
4. **Miért nem jó a faliújság?** Mert nem szűrhető tantárgyra és évfolyamra.
5. **Miért nincs jobb?** Mert nincs diákok közötti, keresésre épülő felület.
→ **Gyökérok:** hiányzik a kereshető tankönyvhirdetési felület.

## Következtetés

Egy reszponzív webes portál kell, három modullal, egységes kezelőfelülettel (lista, szűrés, új elem felvétele űrlappal), amely telefonról is használható.
