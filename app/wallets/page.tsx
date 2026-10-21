"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { WalletTransferModal } from "@/components/WalletTransferModal";
import { Wallet } from "@/types";
import { formatRupiah } from "@/lib/telegram";
import {
  WalletCards,
  Plus,
  ArrowRightLeft,
  Star,
  Trash2,
  Edit,
  Landmark,
  Coins,
  Smartphone,
  TrendingUp,
  Globe,
  Sparkles,
} from "lucide-react";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isNewWalletOpen, setIsNewWalletOpen] = useState(false);

  // Form New Wallet
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<Wallet["type"]>("bank");
  const [newBalance, setNewBalance] = useState("");
  const [newCurrency, setNewCurrency] = useState<"IDR" | "USD" | "SGD">("IDR");
  const [newIsDefault, setNewIsDefault] = useState(false);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallets");
      const data = await res.json();
      if (data.ok) setWallets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/wallets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      });
      fetchWallets();
    } catch (err) {
      alert("Gagal mengubah default wallet");
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm("Hapus dompet ini dari pembukuan?")) return;
    try {
      await fetch(`/api/wallets?id=${id}`, { method: "DELETE" });
      fetchWallets();
    } catch (err) {
      alert("Gagal menghapus dompet");
    }
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newBalance.replace(/[^0-9]/g, "")) || 0;
    try {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          type: newType,
          balance: num,
          currency: newCurrency,
          isDefault: newIsDefault,
        }),
      });
      setIsNewWalletOpen(false);
      setNewName("");
      setNewBalance("");
      fetchWallets();
    } catch (err) {
      alert("Gagal menambah dompet");
    }
  };

  const getWalletIcon = (type: Wallet["type"]) => {
    switch (type) {
      case "bank":
        return <Landmark className="w-5 h-5 text-blue-600" />;
      case "cash":
        return <Coins className="w-5 h-5 text-amber-600" />;
      case "ewallet":
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case "investment":
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case "foreign_currency":
        return <Globe className="w-5 h-5 text-cyan-600" />;
    }
  };

  const totalNetWorth = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Multi-Ledger Wallet Engine
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {wallets.length} Dompet Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola rekening prioritas, kas tunai, e-wallet, dan valas dengan sinkronisasi atomik.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-600" />
              <span>Mutasi Saldo</span>
            </button>

            <button
              onClick={() => setIsNewWalletOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold rounded-xl shadow-tangerine-glow flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Dompet Baru</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Total Net Worth Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-tangerine-400">
                💎 Total Net Worth Terkonsolidasi
              </span>
              <div className="font-display font-bold text-3xl text-white mt-1 tabular-nums">
                {formatRupiah(totalNetWorth)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Meliputi rekening giro bisnis, perbankan prioritas, investasi SBN, dan simpanan valas.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ledger Atomik Sinkron
              </span>
            </div>
          </div>

          {/* Wallets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury relative group hover:border-tangerine-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        {getWalletIcon(w.type)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-900">{w.name}</h3>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">
                          {w.type.replace("_", " ")} · {w.currency}
                        </span>
                      </div>
                    </div>

                    {w.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full bg-tangerine-100 text-tangerine-700 font-bold text-[10px] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-tangerine-600" /> Default
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(w.id)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-tangerine-600 transition-colors"
                        title="Jadikan default harian Telegram"
                      >
                        Set Default
                      </button>
                    )}
                  </div>

                  <div className="my-4">
                    <span className="text-[11px] text-slate-400 font-medium">Saldo Saat Ini</span>
                    <div className="font-display font-bold text-2xl text-slate-900 tracking-tight tabular-nums">
                      {formatRupiah(w.balance)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Diperbarui: {new Date(w.updatedAt).toLocaleTimeString("id-ID")} WIB
                  </span>
                  {!w.isDefault && (
                    <button
                      onClick={() => handleDeleteWallet(w.id)}
                      className="p-1 text-slate-400 hover:text-deficit hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Dompet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Tambah Dompet */}
      {isNewWalletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="font-display font-bold text-base text-slate-900 mb-4">
              Tambah Dompet / Rekening Baru
            </h3>
            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Dompet
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: BCA Prioritas 2 / OVO Kas Usaha"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipe
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
                  >
                    <option value="bank">Bank / Rekening</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cash">Kas Tunai</option>
                    <option value="investment">Investasi / Reksadana</option>
                    <option value="foreign_currency">Valas / Foreign Currency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mata Uang
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
                  >
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="SGD">SGD (Singapura)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Saldo Awal
                </label>
                <input
                  type="text"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine tabular-nums"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="w-4 h-4 text-tangerine rounded focus:ring-tangerine"
                />
                <label htmlFor="defaultCheck" className="text-xs text-slate-700 font-medium">
                  Jadikan dompet utama untuk transaksi harian bot Telegram
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewWalletOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-tangerine hover:bg-tangerine-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Tambah Dompet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        onSuccess={fetchWallets}
      />

      <TelegramSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onTransactionCreated={fetchWallets}
      />
    </div>
  );
}
