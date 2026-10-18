# 4. Csapatszerepek és felelősségek

Agilis/Scrum jelleggel három szerepkör van. Kéttagú csapatnál a harmadik szerepet közösen vagy felosztva látják el. A nevek helyére a csapat tagjai kerülnek.

| Szerepkör | Csapattag | Fő felelősség |
|---|---|---|
| **Scrum Master / Projektkoordinátor** | _név_ | PM folyamatok, kommunikáció, határidők |
| **Lead Developer / Vezető fejlesztő** | _név_ | Technológia, alapkód, Git repository |
| **UI/UX Tervező & Tesztelő (QA)** | _név_ | Felület, Figma tervek, tesztelés |

## Szerepköri és feladatosztási mátrix (ki miért felelt)

A: Accountable (felel), R: Responsible (elvégzi), C: Consulted (egyeztetnek vele), I: Informed (értesül).

| Feladat | Scrum Master | Lead Dev | UI/UX & QA |
|---|:-:|:-:|:-:|
| Problémaelemzés (Ishikawa, 5 Miért) | A | C | R |
| Crazy 8s ötletelés | C | C | A/R |
| MoSCoW priorizálás | A/R | C | C |
| Trello tábla vezetése | A/R | I | C |
| Figma drótvázak | I | C | A/R |
| Git repository, ágstratégia | C | A/R | I |
| Közös mag: tárolás, router, dátum segédek | I | A/R | C |
| Talált tárgyak: logika | I | A/R | C |
| Talált tárgyak: felület, fotókezelés | I | C | A/R |
| Dolgozatnaptár: logika és figyelmeztetés | I | A/R | C |
| Dolgozatnaptár: heti nézet | I | C | A/R |
| Tankönyvbörze: logika, kedvencek | I | A/R | C |
| Tankönyvbörze: felület | I | C | A/R |
| Űrlap validáció, modal, interaktivitás | I | A/R | R |
| HTML/CSS, reszponzivitás | I | C | A/R |
| Pull Request átvizsgálás, merge | C | A/R | C |
| Tesztelés, hibák rögzítése a táblán | C | C | A/R |
| Dokumentáció | A/R | C | C |
| Záró prezentáció, retrospektív | A/R | R | R |

## Szerepek részletesen

### Scrum Master / Projektkoordinátor
- Kezeli a Trello táblát, a kártyákat a haladásnak megfelelően mozgatja.
- Elhárítja az akadályokat, ellenőrzi, hogy mindenki rendszeresen használja-e a Git-et.
- Irányítja a záró prezentáció előkészítését.

### Lead Developer
- Létrehozza a központi repót, meghatározza a branching stratégiát (lásd: `05-branching.md`).
- Megtervezi az adatmodellt, kódolja az üzleti logikát.
- Kezeli a Pull Request-eket, feloldja a merge konfliktusokat.

### UI/UX Tervező & Tesztelő (QA)
- Elkészíti a drótvázakat és a designt.
- Gondoskodik a reszponzivitásról és a felhasználóbarát elrendezésről.
- Folyamatosan tesztel, a hibákat a Trello „Hibák" oszlopában rögzíti, és rendszeresen commitol a saját ágára.
