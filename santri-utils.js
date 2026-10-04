(function (global) {
    'use strict';

    // Fungsi bersama untuk index.html dan admin/admin.html:
    // format tanggal Indonesia, hitung denda, status bayar, filter, rekap, dan validasi input.

    var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var TARIF_KABUR = 30000;
    var TARIF_IZIN = 10000;

    // ---------- Teks & angka ----------
    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    var rpFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
    function rp(n) { return rpFmt.format(Number(n) || 0); }

    function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim(); }

    // ---------- Tanggal ----------
    function parseTgl(s) {
        if (!s) return null;
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
        if (!m) return null;
        var d = new Date(+m[1], +m[2] - 1, +m[3]);
        return isNaN(d.getTime()) ? null : d;
    }
    function fmtTgl(s) {
        var d = parseTgl(s);
        return d ? d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear() : '';
    }
    function hariIni() {
        var n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate());
    }
    function toISO(d) {
        var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
        var t = String(d.getDate()); if (t.length < 2) t = '0' + t;
        return d.getFullYear() + '-' + m + '-' + t;
    }
    function selisih(a, b) { return Math.round((b - a) / 86400000); }
    function hariIzin(text) {
        var m = String(text || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
    }
    function bulanKey(s) { return s && s.pulang ? String(s.pulang).slice(0, 7) : ''; }
    function labelBulan(key) {
        var p = String(key).split('-');
        return BULAN_PANJANG[+p[1] - 1] + ' ' + p[0];
    }
    function daftarBulan(list) {
        var seen = {}, out = [];
        list.forEach(function (s) {
            var k = bulanKey(s);
            if (k && !seen[k]) { seen[k] = 1; out.push(k); }
        });
        return out.sort().reverse();
    }

    // ---------- Denda ----------
    // Hari dihitung INKLUSIF (tanggal Pulang dan Balik sama-sama terhitung),
    // sama seperti tombol "Pindai" di halaman admin.
    function hitungDenda(s, akhir) {
        var p = parseTgl(s.pulang);
        var b = akhir || parseTgl(s.balik);
        if (!p || !b) return { ok: false, denda: null, hari: null, rincian: 'Tanggal Pulang / Balik belum diisi, denda belum bisa dihitung.' };
        if (!s.kabur_izin) return { ok: false, denda: null, hari: null, rincian: 'Status Kabur/Izin belum ditentukan, denda belum bisa dihitung.' };
        var hari = selisih(p, b) + 1;
        if (hari < 1) return { ok: false, denda: null, hari: hari, rincian: 'Tanggal Balik lebih awal dari tanggal Pulang, data tidak valid.' };

        if (s.kabur_izin === 'Kabur') {
            var d = hari * TARIF_KABUR;
            return { ok: true, denda: d, hari: hari, rincian: 'Kabur: ' + hari + ' hari x Rp30.000 = ' + rp(d) };
        }
        var izin = hariIzin(s.izin);
        var lebih = hari - izin;
        if (lebih > 0) {
            var d2 = lebih * TARIF_IZIN;
            return { ok: true, denda: d2, hari: hari, rincian: 'Izin ' + izin + ' hari, kelebihan ' + lebih + ' hari x Rp10.000 = ' + rp(d2) };
        }
        return { ok: true, denda: 0, hari: hari, rincian: 'Izin ' + izin + ' hari, tidak melebihi batas (total ' + hari + ' hari). Tidak ada denda.' };
    }

    function belumKembali(s) { return !!(s && s.pulang && !s.balik); }

    // Santri yang sudah pulang tetapi belum punya tanggal Balik: hitung berjalan sampai hari ini.
    function infoBelumKembali(s) {
        if (!belumKembali(s)) return null;
        var p = parseTgl(s.pulang);
        if (!p) return null;
        var t = hariIni();
        var hari = selisih(p, t) + 1;
        if (hari < 1) return { mulai: false };
        var r = hitungDenda(s, t);
        var izin = s.kabur_izin === 'Izin' ? hariIzin(s.izin) : 0;
        return {
            mulai: true,
            hari: hari,
            izin: izin,
            lewat: izin > 0 && hari > izin,
            denda: r.ok ? r.denda : null,
            rincian: r.rincian
        };
    }

    // Untuk kalkulator denda: pakai tanggal Balik jika ada, kalau belum kembali pakai hari ini.
    function hitungOtomatis(s) {
        if (s.balik) return hitungDenda(s);
        var k = infoBelumKembali(s);
        if (k && k.mulai) {
            var r = hitungDenda(s, hariIni());
            if (r.ok) { r.sementara = true; r.rincian += ' (sementara, dihitung sampai hari ini)'; }
            return r;
        }
        return hitungDenda(s);
    }

    // ---------- Pembayaran ----------
    function dibayarEfektif(s) {
        var d = Number(s && s.dibayar) || 0;
        if (d <= 0 && s && s.lunas) d = Number(s.denda) || 0; // data lama: ditandai lunas tanpa catatan nominal
        return d;
    }
    function bayarInfo(s) {
        var denda = s && s.denda > 0 ? Number(s.denda) : 0;
        if (!denda) return { denda: 0, terbayar: 0, sisa: 0, persen: 0, status: 'none' };
        var t = dibayarEfektif(s);
        var sisa = Math.max(denda - t, 0);
        var status = t >= denda ? 'lunas' : (t > 0 ? 'sebagian' : 'belum');
        return { denda: denda, terbayar: t, sisa: sisa, persen: Math.min(Math.round(t / denda * 100), 100), status: status };
    }

    // ---------- Potongan HTML bersama ----------
    var PILL = 'px-2 py-1 rounded-full text-xs font-semibold ';
    var DASH = '<span class="text-slate-300 text-xs">-</span>';

    function statusBadge(k) {
        if (!k) return DASH;
        var warna = k === 'Kabur' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700';
        return '<span class="' + PILL + warna + '">' + esc(k) + '</span>';
    }
    function bayarBadge(s) {
        var i = bayarInfo(s);
        if (i.status === 'none') return DASH;
        if (i.status === 'lunas') return '<span class="' + PILL + 'bg-emerald-100 text-emerald-700">Sudah Bayar</span>';
        if (i.status === 'sebagian') return '<span class="' + PILL + 'bg-orange-100 text-orange-700">Sebagian</span>';
        return '<span class="' + PILL + 'bg-amber-100 text-amber-700">Belum Bayar</span>';
    }
    function bayarDetail(s) {
        var i = bayarInfo(s);
        var teks = '';
        if (i.status === 'sebagian') teks = rp(i.terbayar) + ' dari ' + rp(i.denda);
        else if (i.status === 'lunas' && s.tgl_lunas) teks = 'Lunas ' + fmtTgl(s.tgl_lunas);
        return teks ? '<span class="block text-[11px] text-slate-400 mt-1">' + esc(teks) + '</span>' : '';
    }
    // Isi kolom/kotak "Balik": tanggal balik, atau penanda "belum kembali" beserta hitungan berjalan.
    function balikHtml(s) {
        if (s.balik) return esc(fmtTgl(s.balik));
        var k = infoBelumKembali(s);
        if (!k || !k.mulai) return '<span class="text-slate-300">-</span>';
        var badge = k.lewat
            ? '<span class="' + PILL + 'bg-rose-100 text-rose-700">Lewat batas izin</span>'
            : '<span class="' + PILL + 'bg-violet-100 text-violet-700">Belum kembali</span>';
        var info = 'Hari ke-' + k.hari + (k.izin ? ' dari ' + k.izin : '');
        if (k.denda > 0) info += ' · denda sementara ' + rp(k.denda);
        return badge + '<span class="block text-[11px] text-slate-400 mt-1 font-normal">' + esc(info) + '</span>';
    }

    // ---------- Filter, rekap, statistik ----------
    function filterData(list, f) {
        f = f || {};
        var q = norm(f.q);
        return list.filter(function (s) {
            if (q && norm(s.nama).indexOf(q) < 0 && norm(s.alamat).indexOf(q) < 0) return false;
            if (f.status === 'Izin' || f.status === 'Kabur') {
                if (s.kabur_izin !== f.status) return false;
            } else if (f.status === 'belum_kembali') {
                if (!belumKembali(s)) return false;
            }
            if (f.bayar) {
                var st = bayarInfo(s).status;
                if (f.bayar === 'tanpa') { if (st !== 'none') return false; }
                else if (f.bayar === 'belum_lunas') { if (st !== 'belum' && st !== 'sebagian') return false; }
                else if (st !== f.bayar) return false;
            }
            if (f.bulan && bulanKey(s) !== f.bulan) return false;
            return true;
        });
    }

    function rekapSantri(list) {
        var map = {}, rows = [];
        list.forEach(function (s) {
            var k = norm(s.nama);
            if (!k) return;
            var r = map[k];
            if (!r) { r = map[k] = { nama: s.nama, catatan: 0, denda: 0, terbayar: 0, sisa: 0, belumKembali: 0 }; rows.push(r); }
            var i = bayarInfo(s);
            r.catatan++;
            r.denda += i.denda;
            r.terbayar += i.terbayar;
            r.sisa += i.sisa;
            if (belumKembali(s)) r.belumKembali++;
        });
        rows.sort(function (a, b) { return (b.sisa - a.sisa) || String(a.nama).localeCompare(String(b.nama), 'id'); });
        return rows;
    }

    function statistik(list) {
        var st = { total: list.length, izin: 0, kabur: 0, belumLunas: 0, belumKembali: 0, terkumpul: 0 };
        list.forEach(function (s) {
            if (s.kabur_izin === 'Izin') st.izin++;
            if (s.kabur_izin === 'Kabur') st.kabur++;
            if (belumKembali(s)) st.belumKembali++;
            var i = bayarInfo(s);
            if (i.status === 'belum' || i.status === 'sebagian') st.belumLunas++;
            st.terkumpul += i.terbayar;
        });
        return st;
    }

    // ---------- Validasi input ----------
    // errors  : menghalangi penyimpanan
    // warnings: ditampilkan sebagai konfirmasi, boleh dilanjutkan
    function validasi(v, list, excludeId) {
        var errors = [], warnings = [];
        var nama = String(v.nama || '').replace(/\s+/g, ' ').trim();
        var p = parseTgl(v.pulang), b = parseTgl(v.balik), today = hariIni();

        if (!nama) errors.push('Nama santri wajib diisi.');
        if (v.denda != null && Number(v.denda) < 0) errors.push('Denda tidak boleh negatif.');
        if (p && b && b < p) errors.push('Tanggal Balik tidak boleh sebelum tanggal Pulang.');

        if (b && !p) warnings.push('Tanggal Balik terisi tetapi tanggal Pulang masih kosong.');
        [['Pulang', p], ['Balik', b]].forEach(function (x) {
            if (x[1] && Math.abs(x[1].getFullYear() - today.getFullYear()) > 1) {
                warnings.push('Tahun pada tanggal ' + x[0] + ' (' + x[1].getFullYear() + ') tampak janggal.');
            }
        });
        if (p && p > today) warnings.push('Tanggal Pulang ada di masa depan.');
        if (p && b && b >= p) {
            var n = selisih(p, b) + 1;
            if (n > 60) warnings.push('Rentang Pulang sampai Balik ' + n + ' hari, pastikan sudah benar.');
        }
        if (v.kabur_izin === 'Izin' && !/\d/.test(String(v.izin || ''))) {
            warnings.push('Status Izin, tetapi lama izin belum berisi angka (contoh: "3 Hari"), sehingga denda tidak bisa dihitung otomatis.');
        }

        var lain = (list || []).filter(function (x) { return String(x.id) !== String(excludeId); });
        var sama = lain.filter(function (x) { return norm(x.nama) === norm(nama) && String(x.pulang || '') === String(v.pulang || ''); });
        if (nama && sama.length) {
            warnings.push('Sudah ada data "' + nama + '" dengan tanggal Pulang yang sama' + (v.pulang ? '' : ' (sama-sama kosong)') + '.');
        } else if (nama) {
            var masihPergi = lain.filter(function (x) { return norm(x.nama) === norm(nama) && belumKembali(x); });
            if (masihPergi.length) warnings.push('"' + nama + '" masih punya catatan yang belum kembali (' + fmtTgl(masihPergi[0].pulang) + ').');
        }

        return { errors: errors, warnings: warnings, nama: nama };
    }

    global.SU = {
        esc: esc, rp: rp, norm: norm,
        parseTgl: parseTgl, fmtTgl: fmtTgl, hariIni: hariIni, toISO: toISO, selisih: selisih, hariIzin: hariIzin,
        bulanKey: bulanKey, labelBulan: labelBulan, daftarBulan: daftarBulan,
        hitungDenda: hitungDenda, hitungOtomatis: hitungOtomatis, belumKembali: belumKembali, infoBelumKembali: infoBelumKembali,
        dibayarEfektif: dibayarEfektif, bayarInfo: bayarInfo,
        statusBadge: statusBadge, bayarBadge: bayarBadge, bayarDetail: bayarDetail, balikHtml: balikHtml,
        filterData: filterData, rekapSantri: rekapSantri, statistik: statistik, validasi: validasi
    };
})(window);
