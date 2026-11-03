/* Demó adatok az első indításhoz. A dátumok a mai naphoz igazodnak, így a demó mindig friss. */
(function (root) {
  const S = root.Sulipont;
  const D = S.dates;
  const id = S.store.makeId;
  const today = () => S.state.today;

  function found() {
    const mk = (name, category, place, ago, description, extra = {}) => ({
      id: id('t'), name, category, place, date: D.addDays(today(), -ago), description, photo: null,
      status: 'talalt', claimedBy: null, claimedAt: null, ...extra,
    });
    return [
      mk('Szürke kapucnis pulcsi', 'Ruházat', 'Tornaterem, női öltöző', 1, 'Nike, M méret, a zsebében zsebkendő.'),
      mk('Kék termosz kulacs', 'Kulacs és étel', 'Ebédlő', 2, '', { status: 'igenyelve', claimedBy: 'Nagy Bence, 10.B', claimedAt: D.addDays(today(), -1) }),
      mk('Cicás tolltartó', 'Írószer', '204-es terem', 3, 'Benne 3 toll és egy radír.'),
      mk('Fekete sapka', 'Ruházat', 'Aula', 4, ''),
      mk('Piros hátizsák', 'Táska', 'Büfé előtt', 5, 'Matekfüzet van benne.'),
      mk('Kulcscsomó (3 kulcs)', 'Kulcs és ékszer', 'Porta', 6, 'Kék kulcstartóval.'),
      mk('Fehér fülhallgató', 'Elektronika', 'Könyvtár', 7, 'Töltőtokban.'),
      mk('Focilabda', 'Sport', 'Udvar', 9, ''),
    ];
  }

  /** A mostani (vagy a következő tanítási napot tartalmazó) hétre. A 9.A osztálynak az első jövőbeli napra 4 számonkérés esik, hogy a figyelmeztetés látszódjon. */
  function exams() {
    const days = D.weekDays(D.mondayOf(D.nextSchoolDay(today())));
    const crowded = days.find((d) => d >= today()) || days[4];
    const mk = (className, date, subject, type, teacher, topic) => ({ id: id('d'), className, date, subject, type, teacher, topic });
    return [
      mk('9.A', days[0], 'Matematika', 'Dolgozat', 'Kiss Tamás', 'Függvények'),
      mk('9.A', crowded, 'Fizika', 'Dolgozat', 'Szabó Péter', 'Newton törvényei'),
      mk('9.A', crowded, 'Kémia', 'Témazáró', 'Varga Judit', 'Sav-bázis reakciók'),
      mk('9.A', crowded, 'Magyar', 'Beadandó', 'Horváth Gábor', 'Olvasónapló'),
      mk('9.A', crowded, 'Biológia', 'Dolgozat', 'Kovács Márta', 'Sejttan'),
      mk('9.B', days[1], 'Történelem', 'Témazáró', 'Tóth Anna', 'Az ókori Róma'),
      mk('9.B', days[2], 'Angol', 'Felelet', 'Nagy Erika', 'Unit 4 szókincs'),
      mk('10.A', days[2], 'Matematika', 'Dolgozat', 'Kiss Tamás', 'Másodfokú egyenletek'),
      mk('10.A', days[3], 'Informatika', 'Beadandó', 'Kiss Tamás', 'Weboldal'),
      mk('11.B', days[3], 'Fizika', 'Dolgozat', 'Szabó Péter', 'Hullámtan'),
      mk('12.A', days[4], 'Magyar', 'Dolgozat', 'Horváth Gábor', 'Érettségi gyakorlás'),
    ];
  }

  function books() {
    const day = 86400000;
    const mk = (title, subject, grade, condition, price, seller, contact, ago, description = '') => ({
      id: id('b'), title, subject, grade, condition, price, seller, contact, description, createdAt: Date.now() - ago * day,
    });
    return [
      mk('Matematika 9. tankönyv', 'Matematika', 9, 'Jó', 1800, 'Kiss Anna, 12.A', 'anna.kiss@pelda.hu', 1),
      mk('Fizika 10. tankönyv', 'Fizika', 10, 'Új', 2500, 'Nagy Bence, 11.B', '+36 30 123 4567', 2, 'Egyszer sem használtam.'),
      mk('Magyar nyelvtan jegyzet', 'Magyar', 11, 'Elfogadható', 800, 'Tóth Réka, 12.B', 'reka.toth@pelda.hu', 3, 'Van benne ceruzás aláhúzás.'),
      mk('Történelem 9.', 'Történelem', 9, 'Jó', 1500, 'Szabó Dávid, 10.A', '+36 20 555 1212', 4),
      mk('Headway Intermediate', 'Angol', 10, 'Jó', 2200, 'Varga Lili, 11.A', 'lili.varga@pelda.hu', 5, 'Munkafüzettel együtt.'),
      mk('Kémia 11. tankönyv', 'Kémia', 11, 'Kopott', 600, 'Horváth Máté, 12.A', '+36 70 987 6543', 6),
      mk('Biológia 9. munkafüzet', 'Biológia', 9, 'Új', 1200, 'Kovács Nóra, 10.B', 'nora.kovacs@pelda.hu', 7, 'Kitöltetlen.'),
      mk('Informatika 12. jegyzet', 'Informatika', 12, 'Jó', 900, 'Molnár Ádám, 12.A', 'adam.molnar@pelda.hu', 8),
    ];
  }

  S.seed = { found, exams, books };
})(window);
