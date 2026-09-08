# Struktur Situs

```
(repo root - ini yang jadi halaman client, https://namaakun.github.io/nama-repo/)
├── index.html
├── manifest.json
├── service-worker.js
├── icon.png
├── admin/                    <- panel admin, https://namaakun.github.io/nama-repo/admin/
│   ├── login.html
│   ├── admin.html
│   ├── manifest.json
│   ├── service-worker.js
│   └── icon.png
├── supabase-setup.sql        <- WAJIB dijalankan sekali di Supabase (bukan halaman web)
└── README.md
```

Halaman publik (client, hanya bisa lihat data) ada **di root repo**.
Panel admin (perlu login untuk tambah/hapus/tandai lunas) ada di
**subfolder `admin/`**. Keduanya harus tetap satu repo yang sama
supaya link "Masuk sebagai Admin" dan "Lihat Data" saling nyambung.

## Perbaikan link (8 September 2026)

Sebelumnya struktur project ini pakai folder `client/` terpisah dari
`admin/`, keduanya sejajar. Setelah dicoba upload ke GitHub Pages,
ternyata isi folder `client/` ada yang ter-upload langsung ke **root**
repo (bukan ke dalam folder `client/`), sehingga link
`../admin/login.html` di halaman client salah arah — dia naik ke luar
repo, bukan masuk ke folder `admin`.

Untuk menghindari kebingungan struktur folder ini seterusnya, project
sekarang disederhanakan: **root = client, `/admin` = admin**. Ini juga
memang pola paling umum dipakai orang lain di GitHub Pages.

### Cara memperbaiki repo yang sudah kamu upload

1. Di repo `dbSantri` kamu, **timpa file `index.html`, `manifest.json`,
   `service-worker.js`, dan `icon.png` yang ada di root** dengan versi
   baru dari paket ini (drag & drop file baru ke root repo, GitHub akan
   otomatis menawarkan untuk mengganti file yang namanya sama).
2. Pastikan folder **`admin/`** di repo kamu isinya persis seperti
   folder `admin/` di paket ini (`login.html`, `admin.html`,
   `manifest.json`, `service-worker.js`, `icon.png`). Kalau folder
   `admin/` belum ada sama sekali di repo kamu, upload folder ini
   apa adanya (drag folder `admin` ke halaman repo GitHub).
3. Tunggu 1-2 menit sampai GitHub Pages selesai build ulang, lalu buka
   lagi `https://khair572.github.io/dbSantri/` dan coba klik "Masuk
   sebagai Admin" — sekarang harusnya mengarah ke
   `https://khair572.github.io/dbSantri/admin/login.html` (bukan
   hilang `/dbSantri/`-nya lagi).

## Update: Status Bayar & Denda Opsional

- Field **Denda** di form admin sekarang tidak wajib diisi. Kalau
  dikosongkan, datanya tersimpan sebagai kosong dan tabel menampilkan
  "-" (bukan Rp0).
- Setiap data sekarang punya **Status Bayar**: "Belum Bayar" (kuning)
  atau "Sudah Bayar" (hijau).
  - Baru dibuat → otomatis "Belum Bayar".
  - Di `admin/admin.html`, ada tombol "Tandai Lunas" / "Tandai belum"
    di kolom Status Bayar untuk mengubahnya kapan saja.
  - Di `index.html` (client), status ini hanya ditampilkan sebagai
    label — pengunjung biasa tidak bisa mengubahnya.
  - Kalau data tidak punya denda sama sekali, kolom ini tampil "-".
- **Penting:** jalankan `supabase-setup.sql` di SQL Editor Supabase
  kalau belum pernah (aman dijalankan berkali-kali) — bagian atas
  file ini menambahkan kolom `lunas` dan membuat kolom `denda` boleh
  kosong.

## Upload ke GitHub Pages (dari awal / repo baru)

1. Buat repo baru di GitHub (boleh publik atau privat).
2. Upload **semua isi paket ini ke root repo** — artinya `index.html`,
   `manifest.json`, `service-worker.js`, `icon.png`, folder `admin/`,
   `supabase-setup.sql`, dan `README.md` semuanya langsung di root,
   BUKAN di dalam satu folder pembungkus lagi. Kalau kamu drag folder
   `santri/` itu sendiri (bukan isinya) ke GitHub, nanti pathnya jadi
   `/santri/index.html` dan salah. Pastikan yang di-drag adalah
   *isi* folder `santri/`, bukan foldernya.
3. Buka repo → **Settings** → **Pages**.
4. **Build and deployment** → **Source: Deploy from a branch** →
   **Branch: main** (atau `master`), folder **/ (root)** → **Save**.
5. Tunggu 1-2 menit, GitHub memberi URL:
   `https://namaakun.github.io/nama-repo/`
6. Client: `https://namaakun.github.io/nama-repo/`
   Admin: `https://namaakun.github.io/nama-repo/admin/login.html`
7. Uji: buka URL admin, login, input data uji, cek muncul di halaman
   client, coba tombol Tandai Lunas dan Hapus.

## Icon

`icon.png` (512x512) sudah disertakan, satu di root dan satu lagi di
folder `admin/`. Mau ganti dengan logo sendiri? Timpa saja kedua file
itu dengan gambar 512x512 (PNG) sebelum upload.

## Apa yang berubah dari versi lama (form input digabung admin+client)

- **index.html** (dulu di form input+lihat data jadi satu): sekarang
  murni tampilan baca-saja. Tombol "Hapus" dan form input dihapus dari
  sini — pengunjung biasa cuma bisa melihat.
- **admin/login.html**: halaman login baru memakai Supabase Auth
  (email + password).
- **admin/admin.html**: mengecek sesi login (`requireSession`) sebelum
  menampilkan apa pun — kalau belum login, otomatis dilempar ke
  halaman login. Setelah login: form input + tabel + tombol hapus +
  tombol Tandai Lunas, ditambah tombol Keluar.
- **supabase-setup.sql**: sebelumnya siapa pun yang menyalin
  `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari kode HTML bisa langsung
  insert/delete data lewat browser console, terlepas dari ada
  tidaknya form admin di frontend. Skrip ini mengaktifkan Row Level
  Security supaya server Supabase sendiri yang menolak
  insert/update/delete dari siapa pun yang belum login.

## Langkah setup Supabase (sekali saja)

1. **Jalankan `supabase-setup.sql`**
   Supabase Dashboard → SQL Editor → tempel isi file ini → Run.
2. **Matikan pendaftaran akun publik**
   Authentication → Providers → Email → matikan "Allow new users to
   sign up". Tanpa ini, siapa pun bisa daftar sendiri dan otomatis
   bisa login sebagai "admin".
3. **Buat akun admin**
   Authentication → Users → Add user → isi email & password. Ini yang
   dipakai untuk login di `admin/login.html`.

## Catatan tentang anon key

Kunci `SUPABASE_ANON_KEY` yang terlihat di kode HTML memang **normal
dan aman** untuk publik — ini bukan kebocoran. Keamanan sesungguhnya
ada di kebijakan RLS pada langkah Supabase di atas, bukan pada
menyembunyikan kunci ini.
