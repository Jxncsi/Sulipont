-- Jogosultsági teszt (RLS): a Supabase SQL Editorban futtatható, a tesztadatokat nem hagyja az adatbázisban.
-- Vendéggel és három ideiglenes felhasználóval próbálja ki a schema.sql szabályait:
--   a és b a „Minta Gimnázium" tagja, c egy másik iskoláé.
-- A végén SZÁNDÉKOSAN hibával áll le, hogy minden visszagördüljön; az üzenet eleje mutatja az eredményt:
--   "RLS-TESZT: MINDEN RENDBEN"  vagy  "RLS-TESZT: HIBÁK: ..."

do $$
declare
  s1 uuid; s2 uuid := gen_random_uuid();
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  c uuid := gen_random_uuid();
  n int;
  item uuid;
  book uuid;
  res text := '';
begin
  select id into s1 from schools where name = 'Minta Gimnázium';
  insert into schools (id, name) values (s2, 'Teszt Iskola 2');
  -- a profilt a handle_new_user trigger hozza létre a regisztrációs adatokból
  insert into auth.users (id, aud, role, email, raw_user_meta_data) values
    (a, 'authenticated', 'authenticated', 'a@teszt.hu', jsonb_build_object('name', 'Teszt Anna', 'school_id', s1, 'class_name', '9.A')),
    (b, 'authenticated', 'authenticated', 'b@teszt.hu', jsonb_build_object('name', 'Teszt Béla', 'school_id', s1, 'class_name', '9.B')),
    (c, 'authenticated', 'authenticated', 'c@teszt.hu', jsonb_build_object('name', 'Teszt Cili', 'school_id', s2, 'class_name', '10.A'));
  select id into book from books limit 1;

  /* ---- vendég: csak az iskolák listáját látja, adatot nem; írni nem tud ---- */
  reset role; set local role anon;
  select count(*) into n from schools;       if n < 2 then res := res || 'vendég nem látja az iskolákat; '; end if;
  select count(*) into n from found_items;   if n <> 0 then res := res || 'vendég lát tárgyakat; '; end if;
  select count(*) into n from exams;         if n <> 0 then res := res || 'vendég lát dolgozatokat; '; end if;
  select count(*) into n from books;         if n <> 0 then res := res || 'vendég lát hirdetéseket; '; end if;
  begin insert into found_items (school_id, name, category, place, date) values (s1, 'xx', 'Egyéb', 'yy', current_date); res := res || 'vendég beszúrhat; '; exception when others then null; end;
  begin delete from found_items; get diagnostics n = row_count; if n > 0 then res := res || 'vendég törölhet; '; end if; exception when others then null; end;

  /* ---- „a" (1. iskola): látja az iskola adatait, a saját iskolájába vehet fel ---- */
  reset role; perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true); set local role authenticated;
  select count(*) into n from found_items;   if n < 8 then res := res || 'a nem látja az iskola tárgyait; '; end if;
  insert into found_items (name, category, place, date) values ('Teszt tárgy', 'Egyéb', 'Teszt hely', current_date) returning id into item;  -- az iskolát a my_school() tölti ki
  select count(*) into n from found_items where id = item and school_id = s1;   if n <> 1 then res := res || 'az iskola nem automatikus; '; end if;
  begin insert into found_items (school_id, name, category, place, date) values (s2, 'xx', 'Egyéb', 'yy', current_date); res := res || 'másik iskolába felvehet; '; exception when others then null; end;
  begin insert into found_items (user_id, name, category, place, date) values (b, 'xx', 'Egyéb', 'yy', current_date); res := res || 'más nevében felvehet; '; exception when others then null; end;
  insert into exams (class_name, date, subject, type, teacher) values ('9.A', current_date, 'Fizika', 'Dolgozat', 'Kiss Tamás');
  insert into favorites (book_id) values (book);
  select count(*) into n from profiles;      if n <> 1 then res := res || 'más profilja látható; '; end if;

  /* ---- „c" (2. iskola): az 1. iskola adataihoz nem fér hozzá ---- */
  reset role; perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true); set local role authenticated;
  select count(*) into n from found_items;   if n <> 0 then res := res || 'másik iskola látja a tárgyakat; '; end if;
  select count(*) into n from exams;         if n <> 0 then res := res || 'másik iskola látja a dolgozatokat; '; end if;
  select count(*) into n from books;         if n <> 0 then res := res || 'másik iskola látja a hirdetéseket; '; end if;
  update found_items set status = 'igenyelve', claimed_by = 'C', claimed_by_user = c where id = item; get diagnostics n = row_count;   if n > 0 then res := res || 'másik iskola igényelhet; '; end if;
  delete from found_items where id = item; get diagnostics n = row_count;                                                            if n > 0 then res := res || 'másik iskola törölhet; '; end if;
  begin insert into exams (school_id, class_name, date, subject, type, teacher) values (s1, '9.A', current_date, 'Fizika', 'Dolgozat', 'Kiss Tamás'); res := res || 'másik iskolába dolgozatot vehet fel; '; exception when others then null; end;
  begin insert into favorites (book_id) values (book); res := res || 'másik iskola hirdetését kedvelheti; '; exception when others then null; end;

  /* ---- „b" (ugyanaz az iskola): nem törölhet/módosíthat másét, igényelhet ---- */
  reset role; perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true); set local role authenticated;
  delete from found_items where id = item; get diagnostics n = row_count;   if n > 0 then res := res || 'más tárgyát törölheti; '; end if;
  delete from exams where user_id = a; get diagnostics n = row_count;      if n > 0 then res := res || 'más dolgozatát törölheti; '; end if;
  begin update found_items set name = 'átírva' where id = item; res := res || 'a tárgy neve átírható; '; exception when others then null; end;
  begin update found_items set status = 'igenyelve', claimed_by = 'B', claimed_by_user = a where id = item; get diagnostics n = row_count; if n > 0 then res := res || 'más nevében igényelhet; '; end if; exception when others then null; end;
  update found_items set status = 'igenyelve', claimed_by = 'B', claimed_by_user = b where id = item; get diagnostics n = row_count;
  if n <> 1 then res := res || 'igénylés nem megy; '; end if;
  select count(*) into n from favorites;   if n <> 0 then res := res || 'más kedvencei láthatók; '; end if;

  /* ---- „a" (a felvevő) visszavonhatja az igénylést és törölheti a sajátját ---- */
  reset role; perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true); set local role authenticated;
  update found_items set status = 'talalt', claimed_by = null, claimed_by_user = null where id = item; get diagnostics n = row_count;
  if n <> 1 then res := res || 'a felvevő nem vonhatja vissza az igénylést; '; end if;
  delete from found_items where id = item; get diagnostics n = row_count;
  if n <> 1 then res := res || 'a saját tárgy nem törölhető; '; end if;

  reset role;
  raise exception '%', case when res = '' then 'RLS-TESZT: MINDEN RENDBEN (a tesztadatok visszagördültek)' else 'RLS-TESZT: HIBÁK: ' || res end;
end $$;
