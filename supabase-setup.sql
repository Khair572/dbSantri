-- ============================================================
-- SETUP KEAMANAN TABEL "santri" DI SUPABASE
-- Jalankan ini di: Supabase Dashboard > SQL Editor
-- ============================================================
-- Tanpa RLS (Row Level Security), SIAPA SAJA yang tahu URL project
-- dan anon key (yang memang publik, terlihat di kode HTML) bisa
-- insert/update/delete langsung ke tabel, walaupun mereka tidak
-- pernah membuka admin.html. Skrip ini mengunci itu di sisi server.

-- 0. Tambahkan kolom status bayar (lunas/belum) jika belum ada.
--    Denda sekarang boleh kosong, jadi kolom "denda" juga dibuat
--    boleh NULL agar form tidak wajib mengisinya.
alter table public.santri
  add column if not exists lunas boolean not null default false;

alter table public.santri
  alter column denda drop not null;

-- 1. Aktifkan RLS pada tabel santri
alter table public.santri enable row level security;

-- 2. Hapus policy lama jika ada (aman dijalankan berulang)
drop policy if exists "Publik bisa membaca data santri" on public.santri;
drop policy if exists "Admin bisa menambah data" on public.santri;
drop policy if exists "Admin bisa mengubah data" on public.santri;
drop policy if exists "Admin bisa menghapus data" on public.santri;

-- 3. Semua orang (termasuk yang belum login) boleh MEMBACA data
--    -> ini yang dipakai oleh client/index.html
create policy "Publik bisa membaca data santri"
on public.santri for select
to anon, authenticated
using (true);

-- 4. Hanya pengguna yang SUDAH LOGIN (admin) yang boleh menambah data
create policy "Admin bisa menambah data"
on public.santri for insert
to authenticated
with check (true);

-- 5. Hanya pengguna yang sudah login yang boleh mengubah data
create policy "Admin bisa mengubah data"
on public.santri for update
to authenticated
using (true)
with check (true);

-- 6. Hanya pengguna yang sudah login yang boleh menghapus data
create policy "Admin bisa menghapus data"
on public.santri for delete
to authenticated
using (true);

-- ============================================================
-- LANGKAH TAMBAHAN (dilakukan lewat Dashboard, bukan SQL):
-- ============================================================
-- A. Matikan pendaftaran akun publik, supaya orang lain tidak bisa
--    membuat akun sendiri dan otomatis jadi "admin":
--    Authentication > Providers > Email > matikan "Allow new users
--    to sign up".
--
-- B. Buat akun admin secara manual:
--    Authentication > Users > Add user > isi email & password admin.
--    Gunakan email & password ini untuk login di admin/login.html.
--
-- C. (Opsional tapi disarankan) Jika ingin lebih dari satu admin
--    tanpa berbagi 1 akun, ulangi langkah B untuk tiap admin.
-- ============================================================
