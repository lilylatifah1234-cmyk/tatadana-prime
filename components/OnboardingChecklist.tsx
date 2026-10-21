"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingChecklistProps {
  isTelegramConnected: boolean;
  walletCount: number;
  hasBudget: boolean;
  onOpenSandbox?: () => void;
}

export function OnboardingChecklist({
  isTelegramConnected,
  walletCount,
  hasBudget,
  onOpenSandbox,
}: OnboardingChecklistProps) {
  const steps = [
    {
      title: "Hubungkan Akun Telegram",
      desc: "Tautkan bot @TataDanaBot via BotFather atau uji coba langsung di Sandbox.",
      completed: isTelegramConnected,
      href: "/settings",
      actionText: "Setup Bot",
      onClick: onOpenSandbox,
    },
    {
      title: "Konfigurasi Dompet Utama",
      desc: `Mendukung rekening perbankan prioritas, kas, valas, dan e-wallet (${walletCount} dompet aktif).`,
      completed: walletCount > 0,
      href: "/wallets",
      actionText: "Kelola Dompet",
    },
    {
      title: "Tentukan Anggaran Induk (Cap)",
      desc: "Tetapkan batas burn-rate bulanan per kategori untuk proteksi likuiditas kas.",
      completed: hasBudget,
      href: "/budgets",
      actionText: "Atur Budget",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (completedCount === steps.length) {
    return null; // Sembunyikan checklist saat akun sudah siap 100%
  }

  return (
    <div className="bg-gradient-to-r from-sky-50/80 via-blue-50/70 to-indigo-50/60 rounded-2xl p-5 border border-sky-200/80 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-tangerine-600" />
            <h4 className="font-display font-bold text-sm text-slate-900">
              Langkah Awal Setup Ekosistem TataDana Prime
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Selesaikan 3 langkah mudah ini untuk pengalaman wealth tracking tanpa friksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-tangerine-700">{progressPercent}% Selesai</div>
          <div className="w-24 bg-white rounded-full h-2 overflow-hidden border border-tangerine-200">
            <div
              className="bg-tangerine h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border transition-all ${
              s.completed
                ? "bg-white/80 border-slate-200/80 opacity-80"
                : "bg-white border-tangerine-300 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {s.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-tangerine-500 shrink-0" />
              )}
              <span className={`text-xs font-bold ${s.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                {s.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{s.desc}</p>
            {!s.completed && (
              <div className="flex justify-end">
                {s.onClick ? (
                  <button
                    onClick={s.onClick}
                    className="text-[11px] font-bold text-tangerine-600 hover:text-tangerine-700 flex items-center gap-1"
                  >
                    <span>{s.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={s.href}
                    className="text-[11px] font-bold text-tangerine-600 hover:text-tangerine-700 flex items-center gap-1"
                  >
                    <span>{s.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
