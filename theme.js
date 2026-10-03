(function () {
    'use strict';

    // Tema siang/malam bersama untuk index.html, admin/admin.html, dan admin/login.html.
    // Dipasang di <head> secara sinkron supaya halaman langsung tampil dengan tema yang benar (tanpa kedip putih).

    var KEY = 'dbsantri-theme';
    var root = document.documentElement;
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    var LIGHT_META = '#4f46e5';
    var DARK_META = '#161616';

    var css = [
        'html.dark{color-scheme:dark}',
        'html.dark body{background-color:#0B0B0B;color:#ECECEC}',
        // body memakai kelas bg-slate-50 / bg-gray-100 yang sama dengan kotak kecil di dalam kartu,
        // jadi latar halaman perlu aturan sendiri agar tetap lebih gelap dari kartu.
        'html.dark body.bg-slate-50,html.dark body.bg-gray-100{background-color:#0B0B0B}',
        'html.dark select option{background-color:#161616;color:#ECECEC}',

        'html.dark .bg-white{background-color:#161616}',
        'html.dark .bg-slate-50,html.dark .bg-gray-100{background-color:#1E1E1E}',
        'html.dark .bg-slate-100{background-color:#262626}',
        'html.dark .bg-slate-200{background-color:#303030}',
        'html.dark .bg-slate-300{background-color:#404040}',
        'html.dark .bg-slate-800{background-color:#2E2E2E}',
        'html.dark .bg-slate-900\\/40{background-color:rgba(0,0,0,.68)}',
        'html.dark .bg-indigo-50,html.dark .bg-indigo-100{background-color:rgba(129,140,248,.14)}',
        'html.dark .bg-emerald-50{background-color:rgba(16,185,129,.12)}',
        'html.dark .bg-emerald-100{background-color:rgba(16,185,129,.20)}',
        'html.dark .bg-amber-100{background-color:rgba(245,158,11,.20)}',
        'html.dark .bg-rose-50{background-color:rgba(244,63,94,.10)}',
        'html.dark .bg-rose-100{background-color:rgba(244,63,94,.20)}',
        'html.dark .bg-sky-100{background-color:rgba(14,165,233,.20)}',

        'html.dark .focus\\:bg-white:focus{background-color:#222222}',
        'html.dark .hover\\:bg-slate-100:hover{background-color:#262626}',
        'html.dark .hover\\:bg-slate-200:hover{background-color:#303030}',
        'html.dark .hover\\:bg-slate-50\\/80:hover{background-color:rgba(38,38,38,.7)}',
        'html.dark .hover\\:bg-indigo-100:hover{background-color:rgba(129,140,248,.26)}',
        'html.dark .hover\\:bg-emerald-100:hover{background-color:rgba(16,185,129,.26)}',
        'html.dark .hover\\:bg-rose-100:hover{background-color:rgba(244,63,94,.26)}',

        'html.dark .text-slate-800,html.dark .text-gray-800{color:#ECECEC}',
        'html.dark .text-slate-700,html.dark .text-gray-700{color:#DADADA}',
        'html.dark .text-slate-600{color:#BDBDBD}',
        'html.dark .text-slate-500,html.dark .text-gray-500{color:#A0A0A0}',
        'html.dark .text-slate-400,html.dark .text-gray-400{color:#808080}',
        'html.dark .text-slate-300{color:#626262}',
        'html.dark .text-indigo-600{color:#A5B4FC}',
        'html.dark .text-emerald-600{color:#34D399}',
        'html.dark .text-emerald-700{color:#6EE7B7}',
        'html.dark .text-amber-600{color:#FBBF24}',
        'html.dark .text-amber-700{color:#FCD34D}',
        'html.dark .text-rose-500,html.dark .text-rose-600,html.dark .text-red-600{color:#FB7185}',
        'html.dark .text-rose-700{color:#FDA4AF}',
        'html.dark .text-sky-600{color:#38BDF8}',
        'html.dark .text-sky-700{color:#7DD3FC}',
        'html.dark .hover\\:text-slate-600:hover{color:#BDBDBD}',
        'html.dark .hover\\:text-indigo-600:hover{color:#A5B4FC}',

        'html.dark .border-slate-100{border-color:#262626}',
        'html.dark .border-slate-200,html.dark .border-gray-300{border-color:#303030}',
        'html.dark .border-slate-200\\/70{border-color:rgba(48,48,48,.8)}',
        'html.dark .divide-slate-100>:not([hidden])~:not([hidden]){border-color:#262626}',
        'html.dark .ring-slate-900\\/5{--tw-ring-color:rgba(255,255,255,.08)}',

        'html.dark .scrollbar-thin::-webkit-scrollbar-thumb{background:#404040}',

        // Tombol ganti tema
        '.theme-toggle{width:40px;height:40px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;background:#f1f5f9;color:#475569;transition:background .2s,color .2s}',
        '.theme-toggle:hover{background:#e2e8f0}',
        'html.dark .theme-toggle{background:#262626;color:#FBBF24}',
        'html.dark .theme-toggle:hover{background:#303030}',
        '.theme-icon-sun{display:none}',
        'html.dark .theme-icon-sun{display:block}',
        'html.dark .theme-icon-moon{display:none}'
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'theme-css';
    style.textContent = css;
    (document.head || root).appendChild(style);

    function readSaved() {
        try {
            var v = localStorage.getItem(KEY);
            return v === 'dark' || v === 'light' ? v : null;
        } catch (e) {
            return null;
        }
    }

    function writeSaved(theme) {
        try { localStorage.setItem(KEY, theme); } catch (e) {}
    }

    function systemTheme() {
        return media && media.matches ? 'dark' : 'light';
    }

    function currentTheme() {
        return root.classList.contains('dark') ? 'dark' : 'light';
    }

    function refreshButtons() {
        var dark = currentTheme() === 'dark';
        var label = dark ? 'Ganti ke mode siang' : 'Ganti ke mode malam';
        var buttons = document.querySelectorAll('[data-theme-toggle]');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute('aria-label', label);
            buttons[i].setAttribute('title', label);
            buttons[i].setAttribute('aria-pressed', dark ? 'true' : 'false');
        }
    }

    function applyTheme(theme) {
        var dark = theme === 'dark';
        root.classList.toggle('dark', dark);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', dark ? DARK_META : LIGHT_META);
        refreshButtons();
    }

    applyTheme(readSaved() || systemTheme());

    document.addEventListener('DOMContentLoaded', refreshButtons);

    document.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
        if (!btn) return;
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        writeSaved(next);
        applyTheme(next);
    });

    // Ikuti pengaturan sistem selama pengguna belum memilih sendiri
    if (media) {
        var onSystemChange = function () {
            if (!readSaved()) applyTheme(systemTheme());
        };
        if (media.addEventListener) media.addEventListener('change', onSystemChange);
        else if (media.addListener) media.addListener(onSystemChange);
    }

    // Sinkron antar tab (misalnya index dan admin terbuka bersamaan)
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) applyTheme(readSaved() || systemTheme());
    });
})();
