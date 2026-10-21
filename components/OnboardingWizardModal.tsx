"use client";

import { useState } from "react";
import { Sparkles, Check, ArrowRight, X, ShieldCheck } from "lucide-react";

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export function OnboardingWizardModal({
  isOpen,
  onClose,
  onCompleted,
}: OnboardingWizardModalProps) {
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("Corporate Executive & Director");
  const [primaryWallets, setPrimaryWallets] = useState<string[]>(["BCA", "Mandiri", "Bibit"]);
  const [allocationStyle, setAllocationStyle] = useState("50/30/20 Standard Executive");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsGenerating(true);
    // Simulasi penyusunan kategori dinamis AI
    setTimeout(() => {
      setIsGenerating(false);
      onCompleted();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-tangerine-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Onboarding Wizard
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="font-display font-bold text-xl text-white mt-2">
            Sesuaikan Ekosistem Wealth Kamu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Langkah {step} dari 3: AI kami menyusun hirarki kategori dinamis sesuai gaya hidup kamu.
          </p>

          {/* Stepper bar */}
          <div className="flex gap-1.5 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-tangerine" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900">
                1. Apa profil profesi dan struktur pendapatan kamu?
              </h3>
              <div className="space-y-2">
                {[
                  {
                    title: "Corporate Executive & Senior Management",
                    desc: "Pendapatan gaji direksi, tunjangan operasional, dan dividen kuartalan.",
                  },
                  {
                    title: "High-Earning Consultant & Agency Owner",
                    desc: "Cashflow dinamis dengan multiple client retainers dan profit share.",
                  },
                  {
                    title: "Solopreneur / Pelaku UMKM Skala Menengah",
                    desc: "Pemisahan ketat antara dompet pribadi dan belanja operasional usaha.",
                  },
                ].map((opt) => (
                  <div
                    key={opt.title}
                    onClick={() => setProfession(opt.title)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      profession === opt.title
                        ? "border-tangerine bg-tangerine-50/60 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{opt.title}</span>
                      {profession === opt.title && (
                        <Check className="w-4 h-4 text-tangerine-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900">
                2. Instrumen perbankan & dompet apa yang paling sering kamu gunakan?
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: "BCA Prioritas", type: "Bank" },
                  { name: "Mandiri Bisnis", type: "Bank" },
                  { name: "Rekening Valas USD", type: "Valas" },
                  { name: "GoPay / OVO", type: "E-Wallet" },
                  { name: "Bibit / SBN", type: "Investasi" },
                  { name: "Kas Tunai", type: "Cash" },
                ].map((w) => {
                  const isSelected = primaryWallets.includes(w.name);
                  return (
                    <div
                      key={w.name}
                      onClick={() => {
                        setPrimaryWallets((prev) =>
                          isSelected ? prev.filter((x) => x !== w.name) : [...prev, w.name]
                        );
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-tangerine bg-tangerine-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{w.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-tangerine-600" />}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{w.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900">
                3. Pola alokasi dan disiplin budgeting yang ingin diterapkan?
              </h3>
              <div className="space-y-2">
                {[
                  {
                    title: "50/30/20 Standard Executive",
                    desc: "50% Esensial, 30% Gaya Hidup & Traveling, 20% Investasi & Tabungan.",
                  },
                  {
                    title: "Aggressive Wealth Accumulation (40/20/40)",
                    desc: "Fokus maksimal pertumbuhan portofolio investasi dan likuiditas.",
                  },
                  {
                    title: "Balanced Cashflow Management",
                    desc: "Burn-rate fleksibel dengan alert dini saat menyentuh batas 80%.",
                  },
                ].map((alloc) => (
                  <div
                    key={alloc.title}
                    onClick={() => setAllocationStyle(alloc.title)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      allocationStyle === alloc.title
                        ? "border-tangerine bg-tangerine-50/60 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{alloc.title}</span>
                      {allocationStyle === alloc.title && (
                        <Check className="w-4 h-4 text-tangerine-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{alloc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Kembali
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-tangerine-glow hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? "Menyusun Hirarki AI..." : "Selesaikan Inisialisasi"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
