# 3. Priorizálás – MoSCoW

## Must have (nélküle nincs értelme a szoftvernek)

**Talált tárgyak**
- Fotós lista (fotó vagy helyettesítő ikon, név, kategória, hely, dátum)
- Szűrés kategóriára és dátumra
- „Ez az enyém!" jelzés
- Új tárgy felvétele űrlappal és validációval

**Dolgozat- és beadandónaptár**
- Heti nézet (hétfő–péntek)
- Új dolgozat felvétele űrlappal és validációval
- Figyelmeztetés, ha egy osztálynak egy napra háromnál több számonkérés esik

**Tankönyv- és jegyzetbörze**
- Hirdetésfeladás űrlappal és validációval
- Keresés tantárgyra és évfolyamra
- Kedvencek

**Közös**
- Adatok megőrzése újratöltés után (localStorage)
- Reszponzív kialakítás (telefon, tablet, asztali)

## Should have (fontos, de a Must-ok nélkül is működik)

- Fotó feltöltése a böngészőből (automatikus kicsinyítéssel)
- Osztály szerinti szűrés és hétváltás a naptárban
- Szöveges keresés és rendezés (ár, legújabb) a börzén
- Törlés (tárgy, dolgozat, hirdetés) megerősítéssel
- Kezdőlapi összesítő számok
- Toast értesítések

## Could have (jó, ha belefér)

- Igénylés visszavonása („mégsem az enyém")
- Demó adatok az első indításkor
- Billentyűzettel is használható kezelés, fókuszkezelés

## Won't have (most nem készül el)

- Bejelentkezés és jogosultságok (tanár, diák, portás)
- Szerveroldali adatbázis, több gépen közös adatok
- E-mail vagy push értesítés
- Üzenetküldés a hirdető és a vevő között
- Sötét téma, exportálás

## Indoklás

Egy 2–3 fős csapat korlátozott idő alatt a Must + Should szintet vállalja. A három modul azonos mintát követ (lista, szűrés, űrlap), ezért a közös részek (űrlapkezelés, tárolás, kártyák) egyszer készülnek el.
