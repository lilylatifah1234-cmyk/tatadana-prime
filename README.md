# TataDana Prime (TataDana) — Executive Wealth & Cashflow OS

> **Executive Personal Wealth & Cashflow OS — Terintegrasi Langsung dari Chat Telegram Kamu**
> Arsitektur Full-Stack Finansial Kelas Perbankan Digital dengan Supabase Enterprise, Telegram Webhook Ingress, Multi-AI Failover Pipeline, dan Next.js App Router.

---

## 🚀 Panduan Menjalankan di Localhost

Server saat ini **sudah aktif dan berjalan** di localhost:
- **URL Aplikasi**: [http://localhost:3000](http://localhost:3000)
- **Executive Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Pusat Laporan & Ekspor**: [http://localhost:3000/reports](http://localhost:3000/reports)
- **Alokasi Budget Proaktif**: [http://localhost:3000/budgets](http://localhost:3000/budgets)
- **Multi-Ledger Wallets**: [http://localhost:3000/wallets](http://localhost:3000/wallets)
- **Pengaturan & Telegram Bot**: [http://localhost:3000/settings](http://localhost:3000/settings)
- **Superadmin Enterprise Desk**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login & Onboarding Wizard**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🏛️ Arsitektur & Direktori Proyek

```
tatadana-prime/
├── app/
│   ├── api/
│   │   ├── admin/impersonate/       # User Impersonation & Audit Trail
│   │   ├── ai/gateway/              # Multi-AI Gateway Controller & Latency Monitor
│   │   ├── budgets/                 # Proactive Budget Cap & Threshold Alert
│   │   ├── categories/              # CRUD Master Kategori
│   │   ├── payment/manual/          # Manual Bank Transfer Approval Desk
│   │   ├── payment/midtrans/        # Midtrans Snap Ingress & Notifications
│   │   ├── reports/download/        # Time-Limited Signed URL (60 Menit)
│   │   ├── reports/export/          # On-Demand PDF & Excel (.xlsx) Generator
│   │   ├── telegram/set-webhook/    # BotFather Token Verification & AES-256
│   │   ├── telegram/webhook/        # Ingress <1s Idempotent Webhook
│   │   ├── transactions/            # Atomic Transaction Ledger
│   │   └── wallets/                 # Multi-Wallet Ledger & Transfer Mutasi
│   ├── admin/page.tsx               # Enterprise Superadmin Console
│   ├── budgets/page.tsx             # Proactive Budgeting & Alert Thresholds
│   ├── dashboard/page.tsx           # Executive Overview & 4 KPI Cards
│   ├── login/page.tsx               # Split-Screen Login & Onboarding Wizard
│   ├── reports/page.tsx             # Pusat Laporan, Data Grid & Receipt Accordion
│   ├── settings/page.tsx            # BotFather Guide, Scheduled Reminders, Profil
│   ├── transactions/page.tsx        # Buku Kas Transaksi Lengkap
│   ├── wallets/page.tsx             # Multi-Ledger Wallet Engine
│   ├── globals.css                  # Design Tokens, Tabular Figures, Tangerine Glow
│   ├── layout.tsx                   # Font Plus Jakarta Sans & Inter Tabular
│   └── page.tsx                     # 15-Section High-Conversion Landing Page
├── components/
│   ├── CashflowBarChart.tsx         # Komparasi Cashflow 6 Bulan Terakhir
│   ├── CategoryDonutChart.tsx       # Donut Chart dengan Hover Tooltips
│   ├── MetricsOverview.tsx          # 4 Key Metrics Card (Net Worth, Inflow, Outflow, Burn-Rate)
│   ├── NewTransactionModal.tsx      # Modal Catat Transaksi Manual
│   ├── OnboardingChecklist.tsx      # Dynamic Checklist Akun Baru
│   ├── OnboardingWizardModal.tsx    # 3-Pertanyaan Cepat Gaya Hidup AI
│   ├── RecentTransactionsTable.tsx  # Tabel 10 Transaksi & Receipt Accordion
│   ├── Sidebar.tsx                  # Enterprise Navigation Sidebar
│   ├── TelegramSandboxModal.tsx     # Interactive Telegram Chat Simulator
│   ├── VelocityLineChart.tsx        # Daily Spending Velocity Line Chart
│   └── WalletTransferModal.tsx      # Mutasi Antar-Dompet & Biaya Admin
├── lib/
│   ├── ai-engine.ts                 # Multi-AI Gateway (Gemini, GPT-4o, DeepSeek, Whisper)
│   ├── crypto.ts                    # Enkripsi AES-256-GCM Master Key
│   ├── db.ts                        # Hybrid Supabase & In-Memory Database Engine
│   ├── reports.ts                   # Generator Excel Multi-Sheet & Signed URLs
│   ├── supabase.ts                  # Supabase Client Initialization
│   └── telegram.ts                  # Slang Parser Indonesia & Rich Telegram Reply
├── supabase/
│   └── migrations/
│       └── 20261012_init_tatadana.sql # DDL Lengkap, RLS Policies & Atomic Triggers
├── types/
│   └── index.ts                     # TypeScript Master Definitions
├── .env.example                     # Template Variabel Lingkungan
├── .env.local                       # Runtime Config Lokal
├── package.json
├── tailwind.config.ts               # Brand Tokens: Tangerine #FF5F1F, Ivory, Emerald, Crimson
└── tsconfig.json
```

---

## ⚡ Fitur Utama yang Telah Aktif 100%

1. **Telegram Ingress & Bahasa Slang Indonesia**:
   - Mendeteksi nominal "15rb", "15k", "1.5jt", "ceban", "goceng", "gocap", "cepek", "500k".
   - Perintah cepat: `/saldo`, `/hari_ini`, `/minggu_ini`, `/bulan_ini`, `/budget`, `/bantuan`.
   - Format balasan visual dengan ASCII progress bar `[████████░░░░░░░░] 62% — Sisa Rp4.550.000`.

2. **Vision OCR Struk Multi-Item**:
   - Transaksi struk belanja dapat di-expand di tabel untuk menampilkan rincian barang, kuantitas, harga satuan, dan pajak PB1/PPN.

3. **Pusat Laporan & Ekspor Berstandar Perbankan**:
   - Ekspor Excel (.xlsx multi-sheet) dan PDF formal perbankan secara on-demand.
   - Dilindungi Time-Limited Signed URL (expired otomatis 60 menit).

4. **Multi-Ledger Wallet Engine**:
   - BCA Prioritas, Mandiri Bisnis, Rekening Valas USD, GoPay, Bibit SBN, Kas Tunai.
   - Mutasi antar-dompet dengan pemotongan saldo atomik dan pencatatan biaya admin.

5. **Superadmin Enterprise Desk**:
   - AI Gateway Controller dengan mode Cascading Failover (Gemini ➔ OpenAI ➔ DeepSeek).
   - User Impersonation Mode untuk support teknis aman.
   - Manual Payment Approval Desk (1-klik verifikasi bukti transfer).
   - Log audit privasi UU PDP Indonesia.

6. **Interactive Telegram Sandbox**:
   - Uji coba chat langsung di browser pada landing page maupun dashboard tanpa perlu membuka aplikasi Telegram terlebih dahulu.
