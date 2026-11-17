-- Sulipont adatbázis (Supabase / Postgres). A Supabase SQL Editorban egyben futtatható.
-- Szabályok: olvasni bárki tud (belépés nélkül is), írni csak bejelentkezett felhasználó, törölni csak a saját sorát.

create table found_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete set null,   -- a felvevő (a demó sorokhoz nincs)
  name text not null check (char_length(name) between 2 and 60),
  category text not null,
  place text not null check (char_length(place) between 2 and 60),
  description text not null default '' check (char_length(description) <= 200),
  date date not null,
  photo text,                                                                  -- kicsinyített JPEG data-URL (shortcut: sok fotónál Storage-ba érdemes tenni)
  status text not null default 'talalt' check (status in ('talalt', 'igenyelve')),
  claimed_by text,                                                             -- az igénylő neve (megjelenítéshez)
  claimed_by_user uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete set null,
  class_name text not null,
  date date not null,
  subject text not null,
  type text not null,
  teacher text not null check (char_length(teacher) >= 3),
  topic text not null default '',
  created_at timestamptz not null default now()
);

create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users on delete set null,
  title text not null check (char_length(title) >= 3),
  subject text not null,
  grade int not null check (grade between 9 and 12),
  condition text not null,
  price int not null check (price between 0 and 20000),
  seller text not null check (char_length(seller) >= 3),
  contact text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table favorites (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  book_id uuid not null references books on delete cascade,
  primary key (user_id, book_id)
);

/* ===== Jogosultságok (Row Level Security) ===== */
alter table found_items enable row level security;
alter table exams enable row level security;
alter table books enable row level security;
alter table favorites enable row level security;

create policy "olvasás: mindenki" on found_items for select using (true);
create policy "olvasás: mindenki" on exams for select using (true);
create policy "olvasás: mindenki" on books for select using (true);

create policy "felvétel: bejelentkezve" on found_items for insert to authenticated with check (user_id = auth.uid());
create policy "felvétel: bejelentkezve" on exams for insert to authenticated with check (user_id = auth.uid());
create policy "felvétel: bejelentkezve" on books for insert to authenticated with check (user_id = auth.uid());

create policy "törlés: csak a sajátot" on found_items for delete to authenticated using (user_id = auth.uid());
create policy "törlés: csak a sajátot" on exams for delete to authenticated using (user_id = auth.uid());
create policy "törlés: csak a sajátot" on books for delete to authenticated using (user_id = auth.uid());

-- „Ez az enyém!": bárki igényelhet, de csak az igénylő (vagy a felvevő) vonhatja vissza; csak a státusz-mezők módosíthatók
create policy "igénylés" on found_items for update to authenticated
  using (status = 'talalt' or claimed_by_user = auth.uid() or user_id = auth.uid())
  with check (claimed_by_user is null or claimed_by_user = auth.uid());
revoke update on found_items from authenticated;
grant update (status, claimed_by, claimed_by_user) on found_items to authenticated;

create policy "kedvencek: csak a saját" on favorites for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

/* ===== Demó adatok (felvevő nélkül, ezért senki nem törölheti) ===== */
insert into found_items (name, category, place, description, date, status, claimed_by) values
  ('Szürke kapucnis pulcsi', 'Ruházat', 'Tornaterem, női öltöző', 'Nike, M méret, a zsebében zsebkendő.', current_date - 1, 'talalt', null),
  ('Kék termosz kulacs', 'Kulacs és étel', 'Ebédlő', '', current_date - 2, 'igenyelve', 'Nagy Bence, 10.B'),
  ('Cicás tolltartó', 'Írószer', '204-es terem', 'Benne 3 toll és egy radír.', current_date - 3, 'talalt', null),
  ('Fekete sapka', 'Ruházat', 'Aula', '', current_date - 4, 'talalt', null),
  ('Piros hátizsák', 'Táska', 'Büfé előtt', 'Matekfüzet van benne.', current_date - 5, 'talalt', null),
  ('Kulcscsomó (3 kulcs)', 'Kulcs és ékszer', 'Porta', 'Kék kulcstartóval.', current_date - 6, 'talalt', null),
  ('Fehér fülhallgató', 'Elektronika', 'Könyvtár', 'Töltőtokban.', current_date - 7, 'talalt', null),
  ('Focilabda', 'Sport', 'Udvar', '', current_date - 9, 'talalt', null);

-- a mostani hét hétfőjéhez igazítva; a 9.A osztálynak csütörtökre 4 számonkérés esik, hogy a torlódás-figyelmeztetés látszódjon
insert into exams (class_name, date, subject, type, teacher, topic)
select c, date_trunc('week', current_date)::date + d, s, t, tn, tp from (values
  ('9.A', 0, 'Matematika', 'Dolgozat', 'Kiss Tamás', 'Függvények'),
  ('9.A', 3, 'Fizika', 'Dolgozat', 'Szabó Péter', 'Newton törvényei'),
  ('9.A', 3, 'Kémia', 'Témazáró', 'Varga Judit', 'Sav-bázis reakciók'),
  ('9.A', 3, 'Magyar', 'Beadandó', 'Horváth Gábor', 'Olvasónapló'),
  ('9.A', 3, 'Biológia', 'Dolgozat', 'Kovács Márta', 'Sejttan'),
  ('9.B', 1, 'Történelem', 'Témazáró', 'Tóth Anna', 'Az ókori Róma'),
  ('9.B', 2, 'Angol', 'Felelet', 'Nagy Erika', 'Unit 4 szókincs'),
  ('10.A', 2, 'Matematika', 'Dolgozat', 'Kiss Tamás', 'Másodfokú egyenletek'),
  ('10.A', 3, 'Informatika', 'Beadandó', 'Kiss Tamás', 'Weboldal'),
  ('11.B', 3, 'Fizika', 'Dolgozat', 'Szabó Péter', 'Hullámtan'),
  ('12.A', 4, 'Magyar', 'Dolgozat', 'Horváth Gábor', 'Érettségi gyakorlás')
) as v(c, d, s, t, tn, tp);

insert into books (title, subject, grade, condition, price, seller, contact, description, created_at) values
  ('Matematika 9. tankönyv', 'Matematika', 9, 'Jó', 1800, 'Kiss Anna, 12.A', 'anna.kiss@pelda.hu', '', now() - interval '1 day'),
  ('Fizika 10. tankönyv', 'Fizika', 10, 'Új', 2500, 'Nagy Bence, 11.B', '+36 30 123 4567', 'Egyszer sem használtam.', now() - interval '2 days'),
  ('Magyar nyelvtan jegyzet', 'Magyar', 11, 'Elfogadható', 800, 'Tóth Réka, 12.B', 'reka.toth@pelda.hu', 'Van benne ceruzás aláhúzás.', now() - interval '3 days'),
  ('Történelem 9.', 'Történelem', 9, 'Jó', 1500, 'Szabó Dávid, 10.A', '+36 20 555 1212', '', now() - interval '4 days'),
  ('Headway Intermediate', 'Angol', 10, 'Jó', 2200, 'Varga Lili, 11.A', 'lili.varga@pelda.hu', 'Munkafüzettel együtt.', now() - interval '5 days'),
  ('Kémia 11. tankönyv', 'Kémia', 11, 'Kopott', 600, 'Horváth Máté, 12.A', '+36 70 987 6543', '', now() - interval '6 days'),
  ('Biológia 9. munkafüzet', 'Biológia', 9, 'Új', 1200, 'Kovács Nóra, 10.B', 'nora.kovacs@pelda.hu', 'Kitöltetlen.', now() - interval '7 days'),
  ('Informatika 12. jegyzet', 'Informatika', 12, 'Jó', 900, 'Molnár Ádám, 12.A', 'adam.molnar@pelda.hu', '', now() - interval '8 days');
