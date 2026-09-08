# Struktur Baru: Client & Admin Terpisah

```
santri/
├── client/                 <- untuk semua orang (hanya bisa lihat data)
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── admin/                   <- hanya untuk admin (login dulu)
│   ├── login.html
│   ├── admin.html
│   ├── manifest.json
│   └── service-worker.js
├── supabase-setup.sql       <- WAJIB dijalankan sekali di Supabase
└── README.md
```

## Update: Status Bayar & Denda Opsional

- Field **Denda** di form admin sekarang tidak wajib diisi. Kalau
  dikosongkan, datanya tersimpan sebagai kosong dan tabel menampilkan
  "-" (bukan Rp0).
- Setiap data sekarang punya **Status Bayar**: "Belum Bayar" (kuning)
  atau "Sudah Bayar" (hijau).
  - Baru dibuat → otomatis "Belum Bayar".
  - Di `admin/admin.html`, ada tombol "Tandai Lunas" / "Tandai belum"
    di kolom Status Bayar untuk mengubahnya kapan saja.
  - Di `client/index.html`, status ini hanya ditampilkan sebagai
    label — pengunjung biasa tidak bisa mengubahnya.
  - Kalau data tidak punya denda sama sekali, kolom ini tampil "-".
- **Penting:** jalankan ulang `supabase-setup.sql` di SQL Editor
  Supabase (aman dijalankan berkali-kali) — bagian atas file sekarang
  menambahkan kolom `lunas` dan membuat kolom `denda` boleh kosong.

## Upload ke GitHub Pages

Karena `client/` dan `admin/` memakai link relatif (`../admin/...`,
`../client/...`), keduanya harus tetap satu repo/satu situs — jangan
dipisah jadi dua repo terpisah, supaya link "Lihat Data" dan "Masuk
sebagai Admin" tetap jalan.

1. Buat repo baru di GitHub (boleh publik atau privat).
2. Upload seluruh isi folder `santri/` (termasuk `client/`, `admin/`,
   `README.md`, `supabase-setup.sql`) ke repo tersebut — lewat
   drag-and-drop di halaman repo GitHub, atau `git add` + `git push`
   kalau pakai command line.
3. Buka repo → **Settings** → **Pages**.
4. Di bagian **Build and deployment**, pilih **Source: Deploy from a
   branch**, lalu **Branch: main** (atau `master`), folder **/ (root)**.
   Klik **Save**.
5. Tunggu 1-2 menit, GitHub akan memberi URL seperti
   `https://namaakun.github.io/nama-repo/`.
6. Situs klien ada di:
   `https://namaakun.github.io/nama-repo/client/index.html`
   Panel admin ada di:
   `https://namaakun.github.io/nama-repo/admin/login.html`
7. Uji: buka URL admin, login, input data uji, cek muncul di URL
   client, coba tombol Tandai Lunas dan Hapus.

> Catatan: `supabase-setup.sql` dan `README.md` boleh ikut ter-upload
> ke repo (tidak masalah, hanya file dokumentasi/SQL, bukan halaman
> web), tapi tidak akan dan tidak perlu diakses lewat browser.

## Icon

`icon.png` (512x512) sudah disertakan di dalam folder `client/` dan
`admin/` — tidak perlu bikin sendiri lagi. Ingin ganti dengan logo
sendiri? Tinggal timpa file `icon.png` di kedua folder dengan gambar
512x512 (format PNG) sebelum upload.

## Apa yang berubah dari versi lama

- **client/index.html**: sekarang murni tampilan baca-saja. Tombol
  "Hapus" dan link "Input Data Baru" dihapus dari sini — pengunjung
  biasa tidak bisa mengubah data apa pun lagi, cuma bisa melihat.
- **admin/login.html**: halaman login baru memakai Supabase Auth
  (email + password).
- **admin/admin.html**: sekarang mengecek sesi login (`requireSession`)
  sebelum menampilkan apa pun — kalau belum login, otomatis dilempar
  ke halaman login. Setelah login, tampilannya sama seperti admin.html
  versi lama (form input + tabel + tombol hapus), ditambah tombol Keluar.
- **supabase-setup.sql**: sebelumnya, siapa pun yang menyalin
  `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari kode HTML bisa
  langsung insert/delete data lewat browser console, terlepas dari
  ada tidaknya form admin di frontend. Skrip ini mengaktifkan Row
  Level Security supaya server Supabase sendiri yang menolak
  insert/update/delete dari siapa pun yang belum login.

## Langkah setup (sekali saja)

1. **Jalankan `supabase-setup.sql`**
   Buka Supabase Dashboard → SQL Editor → tempel isi file ini → Run.

2. **Matikan pendaftaran akun publik**
   Authentication → Providers → Email → matikan
   "Allow new users to sign up". Tanpa ini, siapa pun bisa daftar
   sendiri dan otomatis bisa login sebagai "admin".

3. **Buat akun admin**
   Authentication → Users → Add user → isi email & password.
   Ini yang dipakai untuk login di `admin/login.html`.

4. **Upload/deploy kedua folder** (`client/` dan `admin/`) ke hosting
   Anda (mis. Netlify, Vercel, GitHub Pages, atau folder yang sama
   di server lama Anda). Keduanya tetap bisa berada di domain yang
   sama, hanya path-nya beda (`/client/...` dan `/admin/...`).

5. Jangan lupa taruh `icon.png` (512x512) di masing-masing folder
   `client/` dan `admin/` — file ini belum disertakan.

## Catatan tentang anon key

Kunci `SUPABASE_ANON_KEY` yang terlihat di kode HTML memang **normal
dan aman** untuk publik — ini bukan kebocoran. Keamanan sesungguhnya
ada di kebijakan RLS pada langkah 1 di atas, bukan pada
menyembunyikan kunci ini.
