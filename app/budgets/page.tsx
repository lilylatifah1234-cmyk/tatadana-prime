"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { BudgetProgress } from "@/types";
import { formatRupiah } from "@/lib/telegram";
import {
  PieChart,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Edit2,
  Sparkles,
} from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCapValue, setEditCapValue] = useState("");
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/budgets");
      const data = await res.json();
      if (data.ok) setBudgets(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveCap = async (categoryId: string) => {
    const num = parseFloat(editCapValue.replace(/[^0-9]/g, ""));
    if (!num || num <= 0) return;

    try {
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, capAmount: num, periodMonth: "2026-10" }),
      });
      setEditingId(null);
      fetchBudgets();
    } catch (err) {
      alert("Gagal mengupdate budget");
    }
  };

  const totalCap = budgets.reduce((sum, b) => sum + b.capAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalCap - totalSpent;

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Alokasi Anggaran & Proactive Budgeting
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-tangerine-50 text-tangerine-700 font-bold border border-tangerine-200">
                Oktober 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Notifikasi otomatis terkirim langsung ke Telegram saat pemakaian mencapai 80% & 100%.
            </p>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Alokasi Plafon (Cap)
              </span>
              <div className="font-display font-bold text-2xl text-slate-900 mt-1 tabular-nums">
                {formatRupiah(totalCap)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Batas aman pengeluaran bulanan</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Terpakai Realtime
              </span>
              <div className="font-display font-bold text-2xl text-deficit mt-1 tabular-nums">
                {formatRupiah(totalSpent)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {totalCap > 0 ? Math.round((totalSpent / totalCap) * 100) : 0}% dari seluruh kuota plafon
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Sisa Likuiditas Aman
              </span>
              <div className="font-display font-bold text-2xl text-emerald-600 mt-1 tabular-nums">
                {formatRupiah(totalRemaining)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Likuiditas tersisa untuk 19 hari ke depan</p>
            </div>
          </div>

          {/* Smart Telegram Alert Explanation Box */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800 shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-sky-950 block">
                Sistem Peringatan Proaktif Telegram Aktif
              </span>
              <p className="text-sky-800 mt-0.5 leading-relaxed">
                Ketika kategori menyentuh <strong>80% (Warning)</strong>, bot mengirim pesan pengingat ke Telegram Anda.
                Saat menyentuh <strong>100% (Critical Breach)</strong>, AI Wealth Advisor menyarankan rekomendasi taktis secara otonom.
              </p>
            </div>
          </div>

          {/* Budget Categories Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const isEditing = editingId === b.categoryId;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {b.categoryEmoji}
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-900">
                          {b.categoryName}
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                            b.status === "critical"
                              ? "bg-red-100 text-red-800"
                              : b.status === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {b.status === "critical"
                            ? "CRITICAL BREACH (>100%)"
                            : b.status === "warning"
                            ? "AMBANG 80% TERSENTUH"
                            : "AMAN (<80%)"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingId(isEditing ? null : b.categoryId);
                        setEditCapValue(String(b.capAmount));
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Plafon Anggaran"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Spending & Cap numbers */}
                  <div className="flex items-baseline justify-between my-3">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">Terpakai</span>
                      <div className="font-bold text-lg text-slate-900 tabular-nums">
                        {formatRupiah(b.spentAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Plafon Bulanan</span>
                      <div className="font-bold text-sm text-slate-600 tabular-nums">
                        {formatRupiah(b.capAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Edit Cap Input Form if active */}
                  {isEditing && (
                    <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                      <input
                        type="text"
                        value={editCapValue}
                        onChange={(e) => setEditCapValue(e.target.value)}
                        placeholder="Plafon baru (Rp)"
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-bold tabular-nums"
                      />
                      <button
                        onClick={() => handleSaveCap(b.categoryId)}
                        className="px-3 py-1.5 bg-tangerine text-white text-xs font-bold rounded-lg hover:bg-tangerine-600"
                      >
                        Simpan
                      </button>
                    </div>
                  )}

                  {/* High Resolution Linear Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.status === "critical"
                          ? "bg-deficit"
                          : b.status === "warning"
                          ? "bg-threshold"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2 text-slate-500 font-medium">
                    <span>{b.percentage}% Terpakai</span>
                    <span className="tabular-nums">
                      {b.remainingAmount >= 0
                        ? `Sisa ${formatRupiah(b.remainingAmount)}`
                        : `Overbudget ${formatRupiah(Math.abs(b.remainingAmount))}`}
                    </span>
                  </div>

                  {/* Bot Alert Indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <BellRing className="w-3 h-3 text-tangerine-600" />
                      Alert Telegram: {b.alert80Sent ? "Sudah Terkirim" : "Standby"}
                    </span>
                    <span className="font-semibold text-slate-700">WIB UTC+7</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <TelegramSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onTransactionCreated={fetchBudgets}
      />
    </div>
  );
}
