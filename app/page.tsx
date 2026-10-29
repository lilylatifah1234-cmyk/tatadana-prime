"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Receipt,
  Mic,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileSpreadsheet,
  FileText,
  BarChart3,
  Bot,
  Zap,
  Lock,
  PieChart,
  HelpCircle,
  Building,
} from "lucide-react";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  // ROI Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(50000000);
  const [estimatedLeakage, setEstimatedLeakage] = useState(12); // 12%

  const leakageNominal = Math.round((monthlyIncome * estimatedLeakage) / 100);
  const annualSaved = leakageNominal * 12;

  const faqs = [
    {
      q: "Bagaimana cara kerja pencatatan melalui Telegram Bot?",
      a: "Anda cukup menghubungkan bot resmi TataDana Prime (@lilybhotom_bot) ke akun Anda. Setelah terhubung, Anda dapat mengetik transaksi dengan bahasa santai sehari-hari ('makan siang 35k bca'), mengirim rekaman suara (voice note), atau memotret struk belanja. Pipeline AI kami mengekstrak nominal, kategori, dan dompet secara otomatis dalam <1 detik.",
    },
    {
      q: "Apakah data finansial dan perbankan saya aman?",
      a: "Sangat aman. Seluruh data transaksi diisolasi menggunakan Row Level Security (RLS) di tingkat database PostgreSQL enterprise. Token bot dienkripsi menggunakan standar militer AES-256-GCM. TataDana beroperasi secara patuh penuh terhadap UU Pelindungan Data Pribadi (UU PDP) Indonesia dan standar GDPR.",
    },
    {
      q: "Bagaimana sistem membaca struk belanja fisik/restoran yang panjang?",
      a: "Kami menggunakan Vision OCR berbasis multi-model AI. Sistem membedah satu foto struk menjadi entitas terperinci: nama merchant, tanggal, kuantitas tiap item, harga satuan, pajak PB1/PPN, hingga biaya layanan (service charge). Seluruhnya tersimpan rapi dan dapat di-expand di tabel laporan.",
    },
    {
      q: "Apakah saya harus mengunduh aplikasi tambahan di ponsel?",
      a: "Tidak perlu. Seluruh interaksi pencatatan harian dilakukan melalui aplikasi Telegram yang sudah ada di smartphone Anda. Untuk melihat dashboard grafik mendalam dan ekspor laporan, Anda cukup membuka portal web TataDana dari browser komputer maupun tablet.",
    },
    {
      q: "Bagaimana sistem mengenali format angka slang Indonesia?",
      a: "Parser kami dilatih secara khusus untuk memahami puluhan dialek finansial lokal, seperti '15rb', '15k', '1.5jt', '1,5 juta', 'ceban', 'goceng', 'gocap', 'cepek', hingga 'pekgo'. Anda tidak perlu memikirkan format baku.",
    },
    {
      q: "Apa yang membedakan Paket Starter, Pro, dan Lifetime Executive?",
      a: "Paket Starter mencakup 75 transaksi/bulan via teks & suara serta analitik web dasar. Paket Pro membuka transaksi unlimited, scan struk Vision AI multi-item, export laporan formal PDF/Excel tanpa batas, dan AI Wealth Advisor proaktif. Paket Lifetime memberikan akses seumur hidup untuk seluruh fitur Pro.",
    },
    {
      q: "Metode pembayaran apa saja yang didukung?",
      a: "Kami mendukung pembayaran instan otomatis via Midtrans Snap (QRIS real-time, Virtual Account BCA, Mandiri, BNI, Kartu Kredit 3D-Secure), serta opsi Manual Bank Transfer dengan approval desk superadmin terverifikasi.",
    },
  ];

  return (
    <div className="min-h-screen bg-ivory text-slate-900 selection:bg-tangerine-100 selection:text-tangerine-900 font-sans">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — STICKY HEADER
      ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-olive-600 to-olive-700 flex items-center justify-center text-white shadow-md shadow-olive-600/30 transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-olive-100" />
          </div>
          <div>
            <div className="font-display font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              TataDana
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-olive-100 text-olive-800 border border-olive-200 tracking-wider">
                Prime
              </span>
            </div>
            <p className="text-[10px] text-olive-800/70 font-semibold">Executive Wealth OS</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <a href="#fitur" className="hover:text-olive-700 transition-colors">
            Fitur Utama
          </a>
          <a href="#solusi" className="hover:text-olive-700 transition-colors">
            Solusi Kas
          </a>
          <a href="#roi-calculator" className="hover:text-olive-700 transition-colors">
            Kalkulator Kebocoran
          </a>
          <a href="#harga" className="hover:text-olive-700 transition-colors">
            Biaya Langganan
          </a>
          <a href="#faq" className="hover:text-olive-700 transition-colors">
            FAQ & Keamanan
          </a>
        </nav>

        {/* Auth Buttons: Khusus Admin vs Masuk & Daftar User */}
        <div className="flex items-center gap-3">
          <Link
            href="/login?role=admin"
            className="text-xs font-bold text-slate-700 hover:text-olive-800 px-3 py-2 rounded-xl border border-slate-200 hover:border-olive-300 hover:bg-olive-50/50 flex items-center gap-1.5 transition-all shadow-sm"
            title="Portal Khusus Administrator & Superadmin Desk"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-olive-600" />
            <span>Portal Khusus Admin</span>
          </Link>
          <Link
            href="/login?role=user"
            className="px-4 py-2 bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white text-xs font-bold rounded-xl shadow-md shadow-olive-600/30 transition-all hover:scale-105"
          >
            Daftar / Masuk Pengguna
          </Link>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 & 3 & 4 — HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative pt-16 pb-20 px-6 md:px-12 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Pre-headline tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive-50 border border-olive-200 text-xs font-bold text-olive-800 mb-6 shadow-sm animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-olive-600" />
          <span>Platform Otomasi Cashflow & Wealth OS Terintegrasi Telegram Pertama di Indonesia</span>
        </div>

        {/* H1 Headline */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Hentikan Kebocoran Kas. Bangun{" "}
          <span className="bg-gradient-to-r from-olive-600 via-emerald-600 to-olive-800 bg-clip-text text-transparent">
            Visibilitas Finansial Sejati
          </span>{" "}
          Langsung dari Ruang Chat Kamu.
        </h1>

        {/* Sub-headline */}
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          TataDana mengubah chat Telegram biasa menjadi asisten keuangan pribadi berkekuatan AI.
          Catat transaksi via teks slang, suara, atau foto struk dalam hitungan detik — biarkan
          analitik web kami menyusun neraca keuanganmu secara otomatis.
        </p>

        {/* Primary CTAs: Terpisah Jelas Antara Pengguna (User) dan Khusus Admin */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <Link
            href="/login?role=user"
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white text-sm font-bold rounded-xl shadow-md shadow-olive-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Daftar / Masuk Pengguna (User)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-olive-50 border-2 border-olive-400 text-olive-900 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:border-olive-500"
          >
            <ShieldCheck className="w-4 h-4 text-olive-600" />
            <span>Portal Khusus Superadmin Desk</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tanpa Spreadsheet Manual
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Respon Bot &lt; 1 Detik
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Wallet Atomik
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Standar Keamanan Perbankan
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 5 — HERO SPLIT-SCREEN MOCKUP
        ═══════════════════════════════════════════════════════ */}
        <div className="mt-14 relative rounded-3xl border border-slate-200/90 shadow-2xl bg-white overflow-hidden text-left">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-500 mx-auto">
              tatadana.id/portal — Real-Time Telegram Ingress Synchronization
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
            {/* Kiri (5 cols): Telegram Mobile Simulator */}
            <div className="md:col-span-5 bg-[#0E1621] p-5 text-white flex flex-col justify-between border-r border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-tangerine flex items-center justify-center font-bold text-xs">
                    TD
                  </div>
                  <div>
                    <p className="text-xs font-bold">TataDana Prime Bot</p>
                    <p className="text-[10px] text-emerald-400">● bot aktif (WIB)</p>
                  </div>
                </div>
                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                  LIVE INGRESS
                </span>
              </div>

              {/* Chat bubbles */}
              <div className="my-4 space-y-3 text-xs">
                {/* User msg */}
                <div className="flex justify-end">
                  <div className="bg-tangerine-600 text-white rounded-2xl rounded-br-none p-3 max-w-[85%] shadow">
                    "dinner meeting grand hyatt 1.85jt pake bca"
                    <span className="block text-[9px] text-tangerine-200 text-right mt-1">
                      11:45 WIB ✓✓
                    </span>
                  </div>
                </div>

                {/* Bot Reply */}
                <div className="flex justify-start">
                  <div className="bg-[#182533] text-slate-100 rounded-2xl rounded-bl-none p-3 max-w-[90%] border border-slate-700/80 font-mono text-[11px] leading-relaxed">
                    📅 Senin, 12 Okt — 11:45 WIB
                    <br />
                    💸 Pengeluaran Tercatat!
                    <br />
                    ├ Nominal : Rp1.850.000
                    <br />
                    ├ Kategori : 🍽️ Executive Dining
                    <br />
                    ├ Dompet : 👛 BCA Prioritas
                    <br />
                    └ Saldo : Rp142.500.000
                    <br />
                    <br />
                    📊 Status Budget Executive Dining:
                    <br />
                    [████████░░░░░░░░] 62% — Sisa Rp4.550.000
                  </div>
                </div>
              </div>

              {/* Bottom input simulation */}
              <div
                onClick={() => setIsSandboxOpen(true)}
                className="bg-[#17212B] p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:border-tangerine transition-colors"
              >
                <span>Ketik transaksi atau /saldo...</span>
                <Send className="w-3.5 h-3.5 text-tangerine-500" />
              </div>
            </div>

            {/* Kanan (7 cols): Real-Time Web Dashboard Preview */}
            <div className="md:col-span-7 p-6 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Executive Dashboard Live Feed
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Otomatis bertambah tanpa perlu refresh halaman browser
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Realtime Connected
                </span>
              </div>

              {/* Micro KPI Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Net Worth Portofolio
                  </span>
                  <div className="font-display font-bold text-base text-slate-900 mt-0.5 tabular-nums">
                    Rp 765.450.000
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">+8.4% bulan ini</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Burn-Rate Budget
                  </span>
                  <div className="font-display font-bold text-base text-tangerine-600 mt-0.5 tabular-nums">
                    65% (Aman)
                  </div>
                  <span className="text-[10px] text-slate-400">Plafon: Rp 61.000.000</span>
                </div>
              </div>

              {/* Recent sync item */}
              <div className="p-3.5 rounded-xl bg-white border border-tangerine-200 shadow-sm flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🍽️</span>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Dinner Meeting Grand Hyatt
                    </div>
                    <div className="text-[10px] text-slate-400">
                      BCA Prioritas · Via Telegram Ingress
                    </div>
                  </div>
                </div>
                <span className="font-bold text-xs text-slate-900 tabular-nums">
                  -Rp 1.850.000
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7 — THE BLEEDING COST (PROBLEM)
      ═══════════════════════════════════════════════════════ */}
      <section id="solusi" className="py-20 px-6 md:px-12 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-deficit">
              The Bleeding Cost Problem
            </span>
            <h2 className="font-display font-bold text-2xl md:text-4xl text-slate-900 mt-2 tracking-tight">
              Mengapa Uang Masuk Mengalir Cepat, Namun Menguap Tanpa Jejak?
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-3 leading-relaxed">
              Masalah terbesar para profesional berpenghasilan tinggi bukan kurangnya pendapatan,
              melainkan friksi pencatatan yang menghabiskan 45 detik setiap kali bertransaksi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-deficit text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Friksi Aplikasi Rumit (45 Detik)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membuka aplikasi terpisah, login PIN, memilih dropdown kategori, dan mengetik angka
                membuat Anda malas mencatat puluhan pengeluaran mikro bernilai 50rb–500rb.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-threshold text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Blind Spot Akhir Bulan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tanpa disadari, 15–20% penghasilan bocor pada langganan SaaS yang terlupakan,
                lifestyle dining, dan mutasi biaya admin perbankan yang tidak terpantau.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-tangerine text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Spreadsheet yang Terabaikan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memelihara spreadsheet manual seperti pekerjaan paruh waktu kedua. TataDana memotong
                proses ini dari 45 detik menjadi cukup 3 detik di chat Telegram yang sudah Anda buka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 8 — THE TATADANA SOLUTION (3 PILARS)
      ═══════════════════════════════════════════════════════ */}
      <section id="fitur" className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-tangerine-600">
            Tiga Pilar Inovasi TataDana
          </span>
          <h2 className="font-display font-bold text-2xl md:text-4xl text-slate-900 mt-2 tracking-tight">
            Arsitektur Finansial Kelas Perbankan Tanpa Hambatan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-card-luxury space-y-4 hover:border-tangerine-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-tangerine-50 text-tangerine-600 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              1. Zero-Friction Natural Ingress
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Catat transaksi dengan bahasa sehari-hari atau kirimkan voice note suara. AI Structured
              Output mengenali nominal slang Indonesia secara presisi (15rb, 1.5jt, ceban, goceng).
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-card-luxury space-y-4 hover:border-tangerine-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              2. Multi-Item Vision Intelligence
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cukup foto struk belanja restoran atau supermarket. Vision OCR membedah detail barang,
              harga satuan, pajak PB1, dan biaya layanan menjadi entitas itemized yang rapi.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-card-luxury space-y-4 hover:border-tangerine-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              3. Autonomous Wealth Advisor
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mendeteksi lonjakan burn-rate & anomali pengeluaran secara proaktif. Memberikan
              peringatan otomatis sebelum anggaran bulanan Anda jebol sebelum tutup buku kas.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 9 — ROI CALCULATOR INTERACTIVE
      ═══════════════════════════════════════════════════════ */}
      <section id="roi-calculator" className="py-20 px-6 md:px-12 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-tangerine-400">
            Kalkulator Kebocoran Finansial
          </span>
          <h2 className="font-display font-bold text-2xl md:text-4xl text-white mt-2 tracking-tight">
            Berapa Juta Rupiah yang Menguap Tanpa Jejak Tiap Tahunnya?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Rata-rata profesional perkotaan kehilangan 10%–15% arus kas akibat pengeluaran mikro yang tidak terdokumentasi.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 mt-10 text-left grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  Total Pendapatan Bulanan Anda: Rp {monthlyIncome.toLocaleString("id-ID")}
                </label>
                <input
                  type="range"
                  min={15000000}
                  max={250000000}
                  step={5000000}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full accent-tangerine cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  Estimasi Kebocoran Kas Mikro: {estimatedLeakage}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={estimatedLeakage}
                  onChange={(e) => setEstimatedLeakage(Number(e.target.value))}
                  className="w-full accent-tangerine cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">
                  Kebocoran Modal Bulanan
                </span>
                <div className="font-display font-bold text-2xl text-deficit mt-1 tabular-nums">
                  Rp {leakageNominal.toLocaleString("id-ID")} / bulan
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <span className="text-xs text-slate-400 uppercase font-bold">
                  Potensi Modal yang Diselamatkan TataDana
                </span>
                <div className="font-display font-bold text-3xl text-emerald-400 mt-1 tabular-nums">
                  Rp {annualSaved.toLocaleString("id-ID")} / tahun
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bandingkan dengan biaya langganan TataDana Pro yang hanya Rp 249.000 / bulan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 12 — PRICING MATRIX
      ═══════════════════════════════════════════════════════ */}
      <section id="harga" className="py-24 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-tangerine-600">
          Struktur Investasi Transparan
        </span>
        <h2 className="font-display font-bold text-2xl md:text-4xl text-slate-900 mt-2 tracking-tight">
          Pilih Paket yang Sesuai dengan Skala Portofolio Anda
        </h2>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-600 mt-8">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl transition-all ${
              billingCycle === "monthly" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              billingCycle === "yearly" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            <span>Tahunan</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold">
              Hemat 20%
            </span>
          </button>
          <button
            onClick={() => setBillingCycle("lifetime")}
            className={`px-4 py-2 rounded-xl transition-all ${
              billingCycle === "lifetime" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            ⭐ Lifetime VIP
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
          {/* STARTER */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-card-luxury flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
              <div className="mt-3">
                <span className="font-display font-bold text-3xl text-slate-900">
                  {billingCycle === "yearly" ? "Rp 990.000" : "Rp 99.000"}
                </span>
                <span className="text-xs text-slate-400">
                  {billingCycle === "yearly" ? " / tahun" : " / bulan"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Ideal untuk pemula yang ingin mulai membiasakan pencatatan tanpa friksi via Telegram.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 75 transaksi / bulan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pencatatan Teks & Voice Note Telegram</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 3 Dompet & 5 Kategori</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Scan Struk Belanja (Vision OCR)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Export Laporan Formal PDF & Excel</span>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-800 text-center block transition-colors"
            >
              Mulai Paket Starter
            </Link>
          </div>

          {/* PRO (FEATURED) */}
          <div className="bg-white p-8 rounded-3xl border-2 border-tangerine shadow-tangerine-glow flex flex-col justify-between relative scale-105 z-10">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-tangerine text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              Pilihan Paling Populer
            </span>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-tangerine-600">
                Pro Executive
              </span>
              <div className="mt-3">
                <span className="font-display font-bold text-3xl text-slate-900">
                  {billingCycle === "yearly" ? "Rp 2.490.000" : "Rp 249.000"}
                </span>
                <span className="text-xs text-slate-400">
                  {billingCycle === "yearly" ? " / tahun" : " / bulan"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Untuk profesional dan pemilik bisnis yang memerlukan visibilitas penuh & scan struk.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Transaksi Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Vision OCR Struk Multi-Item Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Wallet Tak Terbatas & Mutasi Saldo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Export Formal PDF & Excel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Wealth Advisor Otonom</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pengingat Terjadwal Harian (2x / hari)</span>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3 bg-gradient-to-r from-tangerine to-tangerine-600 text-white rounded-xl text-xs font-bold text-center block shadow-md hover:scale-105 transition-all"
            >
              Ambil Paket Pro Sekarang
            </Link>
          </div>

          {/* LIFETIME */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Lifetime Executive
              </span>
              <div className="mt-3">
                <span className="font-display font-bold text-3xl text-white">Rp 1.499.000</span>
                <span className="text-xs text-slate-400"> / sekali bayar</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Akses permanen selamanya untuk seluruh fitur Pro tanpa biaya perpanjangan berkala.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seluruh Fitur Paket Pro Seumur Hidup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akses Awal Fitur Baru Mendatang</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated VIP Customer Onboarding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dukungan Prioritas WhatsApp / Telegram</span>
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-8 w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold text-center block transition-colors"
            >
              Miliki Akses Seumur Hidup
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 13 — FAQ INTERAKTIF (MINIMAL 7 BUTIR)
      ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="py-20 px-6 md:px-12 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-tangerine-600">
              Pertanyaan yang Sering Diajukan
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-900 mt-2 tracking-tight">
              Keterbukaan Teknis, Privasi & Keamanan
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-display font-bold text-sm text-slate-900 hover:text-tangerine-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-tangerine-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed animate-fadeIn">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 14 — FINAL CONVERSION STRIP
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 py-16 px-6 md:px-12 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-white tracking-tight">
            Saatnya Menutup Celah Kebocoran Kas Kamu Hari Ini.
          </h2>
          <p className="text-xs md:text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan eksekutif, dokter, konsultan, dan pemilik bisnis yang mengandalkan TataDana Prime setiap hari.
          </p>
          <div className="pt-2">
            <Link
              href="/login?tab=user"
              className="px-8 py-3.5 bg-white text-slate-900 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Masuk dan Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 15 — CORPORATE FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 md:px-12 text-xs border-t border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-tangerine flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>TataDana Prime</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Executive Personal Wealth & Cashflow OS — Terintegrasi Langsung dari Chat Telegram Kamu.
            </p>
            <p className="text-[10px] text-slate-400">
              PT Tata Dana Digital Asia. Jakarta, Indonesia.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider mb-2">
              Solusi Produk
            </h4>
            <p><a href="#fitur" className="hover:text-white">Natural Ingress Bot</a></p>
            <p><a href="#fitur" className="hover:text-white">Vision OCR Struk Multi-Item</a></p>
            <p><a href="#fitur" className="hover:text-white">Multi-Ledger Wallet Engine</a></p>
            <p><a href="#fitur" className="hover:text-white">Executive PDF & Excel Reporting</a></p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider mb-2">
              Legalitas & Privasi
            </h4>
            <p><a href="#" className="hover:text-white">Kepatuhan UU PDP Indonesia</a></p>
            <p><a href="#" className="hover:text-white">Standar Enkripsi AES-256</a></p>
            <p><a href="#" className="hover:text-white">Kebijakan Privasi Data Nasabah</a></p>
            <p><a href="#" className="hover:text-white">Ketentuan Layanan Finansial</a></p>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider mb-2">
              Kontak & Dukungan
            </h4>
            <p className="text-slate-300">Telegram Bot: @TataDanaPrimeBot</p>
            <p className="text-slate-300">Email: concierge@tatadana.id</p>
            <p className="text-slate-300">WIB (Asia/Jakarta, UTC+7)</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© 2026 PT Tata Dana Digital Asia. Seluruh hak cipta dilindungi undang-undang.</p>
          <p>Dirancang & Diorkestrasi dengan Antigravity Enterprise Engine.</p>
        </div>
      </footer>

      {/* Interactive Telegram Sandbox Modal */}
      <TelegramSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />
    </div>
  );
}
