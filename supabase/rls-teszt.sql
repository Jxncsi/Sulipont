-- Jogosultsági teszt (RLS): a Supabase SQL Editorban futtatható, a tesztadatokat nem hagyja az adatbázisban.
-- Két ideiglenes felhasználóval (a, b) és vendéggel (anon) próbálja ki a schema.sql szabályait.
-- A végén SZÁNDÉKOSAN hibával áll le, hogy minden visszagördüljön; az üzenet eleje mutatja az eredményt:
--   "RLS-TESZT: MINDEN RENDBEN"  vagy  "RLS-TESZT: HIBÁK: ..."

do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  n int;
  item uuid;
  book uuid;
  res text := '';
begin
  insert into auth.users (id, aud, role, email) values (a, 'authenticated', 'authenticated', 'a@teszt.hu'), (b, 'authenticated', 'authenticated', 'b@teszt.hu');
  select id into book from books limit 1;

  /* ---- vendég: olvashat, írni nem ---- */
  reset role; set local role anon;
  select count(*) into n from found_items;   if n < 8 then res := res || 'vendég nem olvashat; '; end if;
  begin insert into found_items (name, category, place, date) values ('xx', 'Egyéb', 'yy', current_date); res := res || 'vendég beszúrhat; '; exception when others then null; end;
  begin insert into exams (class_name, date, subject, type, teacher) values ('9.A', current_date, 'Fizika', 'Dolgozat', 'Kiss Tamás'); res := res || 'vendég dolgozatot vehet fel; '; exception when others then null; end;
  begin insert into books (title, subject, grade, condition, price, seller, contact) values ('xxx', 'Fizika', 9, 'Jó', 100, 'Kiss Anna', 'a@b.hu'); res := res || 'vendég hirdethet; '; exception when others then null; end;
  begin delete from found_items; get diagnostics n = row_count; if n > 0 then res := res || 'vendég törölhet; '; end if; exception when others then null; end;

  /* ---- „a" felhasználó: saját sort felvehet, mást nem ---- */
  reset role; perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true); set local role authenticated;
  insert into found_items (name, category, place, date) values ('Teszt tárgy', 'Egyéb', 'Teszt hely', current_date) returning id into item;
  begin insert into found_items (user_id, name, category, place, date) values (b, 'xx', 'Egyéb', 'yy', current_date); res := res || 'más nevében felvehet; '; exception when others then null; end;
  insert into exams (class_name, date, subject, type, teacher) values ('9.A', current_date, 'Fizika', 'Dolgozat', 'Kiss Tamás');
  insert into favorites (book_id) values (book);

  /* ---- „b" felhasználó: nem törölhet/módosíthat másét, igényelhet ---- */
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
