"use client";

import { useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { Wallet } from "@/types";
import { formatRupiah } from "@/lib/telegram";

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSuccess: () => void;
}

export function WalletTransferModal({
  isOpen,
  onClose,
  wallets,
  onSuccess,
}: WalletTransferModalProps) {
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || "");
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState("2500");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const originWallet = wallets.find((w) => w.id === fromWalletId) || wallets[0];
  const targetWallet = wallets.find((w) => w.id === toWalletId) || wallets[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    const numFee = parseFloat(adminFee.replace(/[^0-9]/g, "")) || 0;

    if (!numAmount || numAmount <= 0) {
      alert("Masukkan nominal transfer yang valid");
      return;
    }

    if (fromWalletId === toWalletId) {
      alert("Dompet asal dan dompet tujuan tidak boleh sama");
      return;
    }

    if (originWallet && originWallet.balance < numAmount + numFee) {
      alert("Saldo dompet asal tidak mencukupi untuk nominal transfer dan biaya admin");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer",
          fromWalletId,
          toWalletId,
          amount: numAmount,
          adminFee: numFee,
          note: note || `Transfer dari ${originWallet?.name} ke ${targetWallet?.name}`,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Gagal memproses mutasi transfer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-tangerine-600" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Mutasi Saldo Antar-Dompet
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Origin Wallet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dari Dompet (Sumber)
            </label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — Saldo: {formatRupiah(w.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Target Wallet */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ke Dompet (Tujuan)
            </label>
            <select
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
            >
              {wallets
                .filter((w) => w.id !== fromWalletId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — Saldo: {formatRupiah(w.balance)}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nominal Transfer (Rp)
            </label>
            <input
              type="text"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 10000000 atau 10jt"
              className="w-full text-lg font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine tabular-nums"
            />
          </div>

          {/* Admin Fee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Biaya Admin / BI-FAST (Rp)
            </label>
            <input
              type="text"
              value={adminFee}
              onChange={(e) => setAdminFee(e.target.value)}
              placeholder="2500"
              className="w-full text-xs font-medium text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine tabular-nums"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan / Referensi
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Top-up Reksadana / Alokasi kas mingguan"
              className="w-full text-xs text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-tangerine hover:bg-tangerine-600 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
            >
              {loading ? "Memproses..." : "Kirim Mutasi Saldo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
