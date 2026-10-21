"use client";

import { useState } from "react";
import {
  Cloud,
  FileText,
  Download,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Code,
  Laptop,
  PowerOff,
  Globe,
  Bot,
  Zap,
} from "lucide-react";

interface VercelDeploymentPanelProps {
  onExportPdf: () => void;
  isExporting: boolean;
}

export function VercelDeploymentPanel({ onExportPdf, isExporting }: VercelDeploymentPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"vercelJson" | "env" | "webhook" | "db" | "sidebar">("vercelJson");

  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (err) {
      console.error("Gagal menyalin:", err);
    }
  };

  const gitCommands = `git init
git add .
git commit -m "Deploy TataDana Prime v1.0"
git branch -M main
git remote add origin https://github.com/<USERNAME>/tatadana-prime.git
git push -u origin main`;

  const envVariablesText = `# Konfigurasi Vercel Environment Variables
WEBHOOK_BASE_URL=https://tatadana-prime.vercel.app
TELEGRAM_BOT_TOKEN=8862445821:AAG9rzRPLPxeFD7K4tlfVx43LDXM4STJORI
TELEGRAM_BOT_USERNAME=lilybhotom_bot
ENCRYPTION_KEY=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
TZ=Asia/Jakarta
AI_ACTIVE_PROVIDER=gemini
AI_FAILOVER_ENABLED=true`;

  const webhookUrlText = `https://api.telegram.org/bot8862445821:AAG9rzRPLPxeFD7K4tlfVx43LDXM4STJORI/setWebhook?url=https://tatadana-prime.vercel.app/api/telegram/webhook`;

  const codeSnippets = {
    vercelJson: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "regions": ["sin1"], // Server Singapura untuk responsivitas tercepat di Indonesia
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization" }
      ]
    }
  ]
}`,
    env: envVariablesText,
    webhook: `import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseIndonesianFinancialSlang, formatExpenseBotReply } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const message = payload.message;
    if (!message || !message.text) return NextResponse.json({ ok: true, ignored: true });

    // 1. Parser bahasa alami slang Indonesia ("beli kopi 25rb pake gopay")
    const parsed = parseIndonesianFinancialSlang(message.text);
    if (!parsed) return NextResponse.json({ ok: true, ignored: true });

    // 2. Simpan transaksi secara permanen & isolasi multi-user
    const newTx = await db.createTransaction({
      walletId: parsed.wallet_asal || "w-bca-prio",
      walletName: "BCA Prioritas",
      categoryId: "cat-dining",
      categoryName: parsed.kategori,
      categoryEmoji: "☕",
      categoryColor: "#F59E0B",
      type: parsed.jenis,
      amount: parsed.nominal,
      note: parsed.catatan,
      source: "telegram_text",
    });

    return NextResponse.json({ ok: true, txId: newTx.id });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}`,
    db: `// lib/db.ts — Isolasi Akun & Data Persistence
export const db = {
  // Akun baru mendapatkan tampilan Nol (Rp 0), akun lama/Owner Lily Latifah tetap utuh
  async getWallets(userId?: string): Promise<Wallet[]> {
    const store = loadStoreFromFile();
    const currentUserId = userId || store.profile.id;
    const isOwner = store.profile.email === "lilylatifah1234@gmail.com";
    if (isOwner) {
      return [...store.wallets.filter((w) => w.userId === INITIAL_USER_ID || !w.userId)];
    }
    return [...store.wallets.filter((w) => w.userId === currentUserId)];
  },
  
  async createTransaction(data): Promise<Transaction> {
    const store = loadStoreFromFile();
    const newTx = { id: \`tx-\${Date.now()}\`, ...data, createdAt: new Date().toISOString() };
    store.transactions.unshift(newTx);
    saveStoreToFile(store); // Tersimpan permanen ke file JSON
    return newTx;
  }
};`,
    sidebar: `// components/Sidebar.tsx — Menu Navigasi Berbalut Warna Olive
<aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen">
  {/* Header Brand Olive */}
  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-olive-600 to-olive-700 text-white shadow-md">
    <Sparkles className="w-5 h-5 text-olive-100" />
  </div>
  <span className="bg-olive-100 text-olive-800 border border-olive-200 text-[10px] font-extrabold">
    Prime
  </span>

  {/* Link Menu Navigasi Aktif dengan Border Olive */}
  {navigation.map((item) => (
    <Link
      href={item.href}
      className={isActive 
        ? "bg-olive-50 text-olive-900 font-bold border-l-4 border-olive-600 pl-3 shadow-sm"
        : "text-slate-600 hover:text-olive-900 hover:bg-olive-50/70"}
    >
      <item.icon className={isActive ? "text-olive-700" : "text-slate-400"} />
      <span>{item.name}</span>
    </Link>
  ))}
</aside>`,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HERO BANNER: Solusi Online 24/7 Tanpa Laptop */}
      <div className="rounded-3xl bg-gradient-to-br from-olive-700 via-olive-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-olive-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-500/30 border border-olive-400/40 text-olive-200 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Cloud className="w-3.5 h-3.5 text-olive-300" />
                Vercel Cloud Deployment Ready
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online 24/7 Tanpa Laptop
              </span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Tinjau Kodingan & Publikasikan TataDana ke Vercel
            </h2>

            <p className="text-xs sm:text-sm text-olive-100/90 leading-relaxed">
              Saat berjalan di localhost (laptop), aplikasi akan terputus saat laptop mati atau sleep. Dengan meninjau kodingan ini dan mempublikasikannya ke <strong>Vercel Cloud</strong>, website TataDana dan bot Telegram <strong>@lilybhotom_bot</strong> akan tetap aktif online 24 jam nonstop setiap hari meskipun laptop Anda dalam keadaan mati.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExporting}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-olive-50 text-olive-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <FileText className="w-4 h-4 text-olive-700" />
              <span>{isExporting ? "Menyusun Dokumen PDF..." : "Simpan Dokumen Koding (PDF)"}</span>
            </button>

            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-olive-600/80 hover:bg-olive-600 border border-olive-400/50 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Zap className="w-4 h-4 text-olive-200" />
              <span>Buka Dashboard Vercel</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. PERBANDINGAN: Localhost vs Vercel Cloud */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Localhost (Saat Ini) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
            <Laptop className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900">Kondisi Localhost (Laptop)</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Terbatas
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aplikasi berjalan di <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">http://localhost:3000</code>. Hanya dapat diakses dari laptop ini. Jika laptop mati atau internet terputus, bot Telegram dan dashboard tidak dapat dibuka.
            </p>
          </div>
        </div>

        {/* Vercel Cloud (Setelah Dipublikasikan) */}
        <div className="bg-olive-50/70 rounded-2xl p-5 border border-olive-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-olive-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-olive-900">Kondisi Vercel Cloud (24/7)</h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-olive-200 text-olive-900 uppercase">
                Aktif Nonstop
              </span>
            </div>
            <p className="text-xs text-olive-900/80 leading-relaxed">
              Aplikasi berjalan di <code className="text-olive-900 font-bold bg-olive-100 px-1 py-0.5 rounded">https://tatadana-prime.vercel.app</code>. Tetap aktif online 24 jam nonstop di seluruh dunia meskipun laptop Anda dalam keadaan mati.
            </p>
          </div>
        </div>
      </div>

      {/* 3. PANDUAN 4 LANGKAH DEPLOY VERCEL */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Panduan 4 Langkah Publikasi ke Vercel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ikuti langkah mudah ini untuk mempublikasikan kodingan TataDana Prime ke Vercel Cloud.
            </p>
          </div>
          <span className="text-xs font-bold text-olive-700 bg-olive-50 px-3 py-1 rounded-full border border-olive-200">
            Estimasi Waktu: ~3 Menit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Langkah 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-olive-700 uppercase tracking-wider">
                  Langkah 1
                </span>
                <span className="text-[10px] font-bold text-slate-400">Terminal / Git</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900">Push Kodingan ke GitHub</h5>
              <p className="text-xs text-slate-500">
                Jalankan perintah ini di PowerShell atau terminal folder proyek:
              </p>
            </div>

            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl font-mono text-[11px] relative">
              <pre className="overflow-x-auto whitespace-pre">{gitCommands}</pre>
              <button
                type="button"
                onClick={() => copyToClipboard(gitCommands, "git")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="Salin Perintah Git"
              >
                {copiedKey === "git" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-olive-700 uppercase tracking-wider">
                  Langkah 2
                </span>
                <span className="text-[10px] font-bold text-slate-400">Vercel Web</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900">Import Repositori di Vercel</h5>
              <p className="text-xs text-slate-500">
                Buka <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-olive-700 font-bold underline">vercel.com/new</a>, pilih akun GitHub Anda, lalu klik tombol <strong>Import</strong> pada repositori <code className="bg-white px-1 py-0.5 rounded border">tatadana-prime</code>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Framework otomatis terdeteksi: <strong>Next.js 14</strong></span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-olive-700 uppercase tracking-wider">
                  Langkah 3
                </span>
                <span className="text-[10px] font-bold text-slate-400">Environment</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900">Salin Environment Variables</h5>
              <p className="text-xs text-slate-500">
                Tempel variabel lingkungan produksi ke kolom Environment Variables di pengaturan Vercel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(envVariablesText, "env")}
              className="w-full py-2 px-3 rounded-xl bg-olive-600 hover:bg-olive-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              {copiedKey === "env" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Variabel Lingkungan Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Semua Variabel Lingkungan (.env)</span>
                </>
              )}
            </button>
          </div>

          {/* Langkah 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-olive-700 uppercase tracking-wider">
                  Langkah 4
                </span>
                <span className="text-[10px] font-bold text-slate-400">Telegram Bot</span>
              </div>
              <h5 className="font-bold text-sm text-slate-900">Aktifkan Webhook Bot Telegram</h5>
              <p className="text-xs text-slate-500">
                Setelah deploy selesai, buka URL ini di browser untuk menghubungkan bot ke cloud Vercel:
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(webhookUrlText, "webhook")}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all truncate"
            >
              {copiedKey === "webhook" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>URL Webhook Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Tautan Aktivasi Webhook Telegram</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. CODE INSPECTOR: Peninjauan Kodingan Asli Hasil TataDana */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-olive-700" />
              Peninjauan Kodingan Asli TataDana Prime
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              File-file kunci ini disertakan secara lengkap di dalam dokumen PDF untuk ditinjau sebelum dipublikasikan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(codeSnippets[activeCodeTab], activeCodeTab)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-olive-500 text-slate-700 hover:text-olive-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copiedKey === activeCodeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kodingan Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin File Ini</span>
              </>
            )}
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
          {[
            { id: "vercelJson", label: "vercel.json (Hosting)", icon: Cloud },
            { id: "env", label: ".env.example (Variabel)", icon: Terminal },
            { id: "webhook", label: "api/telegram/webhook (Bot)", icon: Bot },
            { id: "db", label: "lib/db.ts (Database)", icon: ShieldCheck },
            { id: "sidebar", label: "components/Sidebar.tsx (Menu Olive)", icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCodeTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCodeTab === tab.id
                  ? "bg-olive-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Code Content Viewer */}
        <div className="rounded-2xl bg-slate-950 p-4 text-slate-200 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
          <pre className="whitespace-pre">{codeSnippets[activeCodeTab]}</pre>
        </div>
      </div>
    </div>
  );
}
