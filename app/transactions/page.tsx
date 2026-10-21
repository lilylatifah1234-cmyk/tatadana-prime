"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RecentTransactionsTable } from "@/components/RecentTransactionsTable";
import { NewTransactionModal } from "@/components/NewTransactionModal";
import { WalletTransferModal } from "@/components/WalletTransferModal";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { Transaction, Wallet, Category } from "@/types";
import { Plus, ArrowRightLeft, Send, Sparkles, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);

  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, wRes, cRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/wallets"),
        fetch("/api/categories"),
      ]);
      const tData = await tRes.json();
      const wData = await wRes.json();
      const cData = await cRes.json();

      if (tData.ok) setTransactions(tData.data);
      if (wData.ok) setWallets(wData.data);
      if (cData.ok) setCategories(cData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "excel" | "pdf") => {
    setIsExporting(format);
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, month: "2026-10" }),
      });
      const data = await res.json();
      if (data.ok && data.signedUrl) {
        window.open(data.signedUrl, "_blank");
      } else {
        alert(data.error || "Gagal mengunduh laporan");
      }
    } catch (e: any) {
      alert(`Gagal mengekspor laporan: ${e.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Transaksi & Mutasi Kas
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {transactions.length} Total Catatan
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PRO VIP UNLOCKED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh arus kas masuk, keluar, mutasi transfer, dan breakdown struk belanja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Ekspor Excel (PRO VIP) */}
            <button
              onClick={() => handleExport("excel")}
              disabled={isExporting !== null}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              title="Fitur Aktif PRO VIP: Ekspor seluruh transaksi ke file Excel .xlsx"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExporting === "excel" ? "Ekspor .xlsx..." : "Ekspor Excel"}</span>
            </button>

            {/* Ekspor PDF (PRO VIP) */}
            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting !== null}
              className="px-3.5 py-2 rounded-xl bg-tangerine hover:bg-tangerine-600 text-white text-xs font-bold shadow-tangerine-glow transition-all flex items-center gap-1.5 active:scale-95"
              title="Fitur Aktif PRO VIP: Ekspor rekening koran resmi perbankan ke file PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExporting === "pdf" ? "Ekspor PDF..." : "Ekspor PDF"}</span>
            </button>

            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Mutasi Dompet</span>
            </button>

            <button
              onClick={() => setIsNewTxOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 text-tangerine-400" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <RecentTransactionsTable
            transactions={transactions}
            onRefresh={fetchData}
            title="Daftar Mutasi Lengkap"
            limit={100}
          />
        </div>
      </main>

      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        wallets={wallets}
        categories={categories}
        onSuccess={fetchData}
      />

      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        onSuccess={fetchData}
      />

      <TelegramSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onTransactionCreated={fetchData}
      />
    </div>
  );
}
