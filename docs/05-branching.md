# 5. Verziókövetés – branching stratégia

## Ágak

| Ág | Cél |
|---|---|
| `main` | Mindig kiadható, stabil állapot. Csak a `dev`-ből érkező merge-ek kerülnek ide. |
| `dev` | Az integrációs ág: ide olvadnak a kész feature-ök. |
| `feature/<téma>` | Egy-egy funkció fejlesztése (pl. `feature/talalt`). |
| `docs/<téma>` | Dokumentáció külön ágon. |
| `fix/<téma>` | Hibajavítás (a Trello „Hibák" oszlopából). |

## Munkafolyamat

1. A Trello kártya a „Folyamatban" oszlopba kerül.
2. A `dev` ágról nyitunk `feature/…` ágat.
3. Kis, beszédes commitokkal dolgozunk.
4. Kész állapotban Pull Request (vagy `--no-ff` merge) a `dev` ágba, a Lead Dev átnézi.
5. A kártya a „Tesztelés (QA)" oszlopba kerül, a tesztelő ellenőrzi.
6. Kiadáskor a `dev` ág bekerül a `main` ágba.

## Commit üzenetek

Formátum: `típus: rövid, magyar leírás`

| Típus | Mikor |
|---|---|
| `feat` | új funkció |
| `fix` | hibajavítás |
| `style` | megjelenés (CSS), logikai változás nélkül |
| `test` | tesztek |
| `docs` | dokumentáció |
| `refactor` | átszervezés viselkedésváltozás nélkül |
| `chore` | karbantartás, beállítások |
