"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MetricsOverview } from "@/components/MetricsOverview";
import { CategoryDonutChart } from "@/components/CategoryDonutChart";
import { CashflowBarChart } from "@/components/CashflowBarChart";
import { VelocityLineChart } from "@/components/VelocityLineChart";
import { RecentTransactionsTable } from "@/components/RecentTransactionsTable";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { NewTransactionModal } from "@/components/NewTransactionModal";
import { WalletTransferModal } from "@/components/WalletTransferModal";
import { DashboardAIAssistant } from "@/components/DashboardAIAssistant";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import {
  Plus,
  ArrowRight,
  ArrowRightLeft,
  Calendar,
  Send,
  Sparkles,
  Download,
  Filter,
  Cloud,
} from "lucide-react";
import { Transaction, Wallet, Category, BudgetProgress, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("bulan_ini");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, cRes, tRes, bRes, pRes] = await Promise.all([
        fetch("/api/wallets"),
        fetch("/api/categories"),
        fetch("/api/transactions"),
        fetch("/api/budgets"),
        fetch("/api/profile"),
      ]);

      const wData = await wRes.json();
      const cData = await cRes.json();
      const tData = await tRes.json();
      const bData = await bRes.json();
      const pData = await pRes.json();

      if (pData.ok && pData.data) {
        // Route Guard: Pending user must wait on /pending-approval
        if (pData.data.approvalStatus === "pending") {
          router.push(
            `/pending-approval?email=${encodeURIComponent(pData.data.email)}&name=${encodeURIComponent(
              pData.data.fullName
            )}`
          );
          return;
        }
        setProfile(pData.data);
      }

      if (wData.ok) setWallets(wData.data);
      if (cData.ok) setCategories(cData.data);
      if (tData.ok) setTransactions(tData.data);
      if (bData.ok) setBudgets(bData.data);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleProfileUpdated = (event: any) => {
      if (event?.detail) {
        setProfile((prev) => ({ ...(prev || {}), ...event.detail }));
      } else {
        fetchData();
      }
    };

    window.addEventListener("tatadana-profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("tatadana-profile-updated", handleProfileUpdated);
    };
  }, []);

  // Data riil: hitung metrik langsung dari database / input user (NOL secara default)
  const totalNetWorth = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  const totalInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSafeBudget = budgets.length > 0
    ? budgets.reduce((sum, b) => sum + b.capAmount, 0)
    : 0;
  const burnRatePercentage =
    totalSafeBudget > 0 ? Math.round((totalOutflow / totalSafeBudget) * 100) : 0;

  // Distribusi Pengeluaran Kategori (Donut Chart) dihitung riil dari transaksi
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const categorySpendingMap = new Map<string, { name: string; emoji: string; color: string; amount: number }>();

  expenseTransactions.forEach((t) => {
    const key = t.categoryId || t.categoryName || "Lainnya";
    const existing = categorySpendingMap.get(key);
    if (existing) {
      existing.amount += t.amount;
    } else {
      categorySpendingMap.set(key, {
        name: t.categoryName || "Lainnya",
        emoji: t.categoryEmoji || "🏷️",
        color: t.categoryColor || "#5D7328",
        amount: t.amount,
      });
    }
  });

  const donutData = Array.from(categorySpendingMap.values());

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sidebar */}
      <Sidebar profile={profile} onOpenSandbox={() => setIsSandboxOpen(true)} />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/settings"
              title="Kelola & Ubah Foto Profil di Pengaturan"
              className="relative group shrink-0"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-olive-600 to-olive-700 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-olive-300 overflow-hidden bg-slate-100 transition-transform group-hover:scale-105">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile?.fullName || "Lily Latifah"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : null}
                <span>{(profile?.fullName || "Lily Latifah").charAt(0).toUpperCase()}</span>
              </div>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                  Ringkasan Eksekutif
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-olive-50 text-olive-800 font-bold border border-olive-200">
                  WIB (UTC+7)
                </span>
                {profile?.role === "user" ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    POV USER BIASA
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    SUPERADMIN POV
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Selamat datang kembali, <strong className="text-slate-800">{profile?.fullName || "Lily Latifah"}</strong>.{" "}
                {profile?.role === "user" ? (
                  <span className="text-emerald-600 font-medium">(Tampilan Mode Pengguna Standar — Superadmin Desk tersembunyi)</span>
                ) : (
                  <span className="text-indigo-600 font-medium">(Akses Superadmin Aktif — Kelola User & Kontrol Penuh)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Developer Role Switcher (Admin vs User) */}
            <RoleSwitcher
              currentRole={profile?.role || "superadmin"}
              onRoleChange={(newRole) => {
                setProfile((prev) => (prev ? { ...prev, role: newRole } : null));
              }}
            />

            {/* Filter Periode Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600 h-9">
              {[
                { key: "hari_ini", label: "Hari Ini" },
                { key: "7_hari", label: "7 Hari" },
                { key: "bulan_ini", label: "Bulan Ini" },
                { key: "tahunan", label: "Tahunan" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPeriod(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all h-8 flex items-center ${
                    selectedPeriod === p.key
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Quick Action: Vercel 24/7 Cloud */}
            <Link
              href="/reports?tab=vercel"
              className="h-9 px-3 border border-olive-300 bg-olive-50 hover:bg-olive-100 text-olive-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold hover:border-olive-400"
              title="Tinjau Koding & Publikasikan ke Vercel (Online 24/7)"
            >
              <Cloud className="w-3.5 h-3.5 text-olive-600" />
              <span className="hidden sm:inline">Vercel 24/7</span>
            </Link>

            {/* Quick Action: Tanya AI */}
            <button
              onClick={() => {
                const el = document.getElementById("dashboard-ai-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-9 px-3.5 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold hover:border-sky-400"
              title="Konsultasi Tanya AI Finansial"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Tanya AI</span>
            </button>

            {/* Quick Action: Telegram Sandbox */}
            <button
              onClick={() => setIsSandboxOpen(true)}
              className="h-9 px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold hover:border-slate-300"
              title="Uji coba Bot Telegram"
            >
              <Send className="w-3.5 h-3.5 text-olive-600" />
              <span className="hidden sm:inline">Uji Bot</span>
            </button>

            {/* Quick Action: Transfer Mutasi */}
            <button
              onClick={() => setIsTransferOpen(true)}
              className="h-9 px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold hover:border-slate-300"
              title="Mutasi Antar Dompet"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Mutasi</span>
            </button>

            {/* Quick Action: Catat Manual */}
            <button
              onClick={() => setIsNewTxOpen(true)}
              className="h-9 px-4 bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white rounded-xl shadow-md shadow-olive-600/30 transition-all flex items-center gap-1.5 text-xs font-bold hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Dynamic Onboarding Checklist */}
          <OnboardingChecklist
            isTelegramConnected={profile?.telegramConnected || true}
            walletCount={wallets.length}
            hasBudget={budgets.length > 0}
            onOpenSandbox={() => setIsSandboxOpen(true)}
          />

          {/* 4 Key Metrics Card */}
          <MetricsOverview
            totalNetWorth={totalNetWorth}
            totalInflow={totalInflow}
            totalOutflow={totalOutflow}
            totalSafeBudget={totalSafeBudget}
            burnRatePercentage={burnRatePercentage}
          />

          {/* Interactive Tanya AI Section */}
          <div id="dashboard-ai-section">
            <DashboardAIAssistant />
          </div>

          {/* Visual Analytics Grid: Donut + Bar + Velocity Line */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CategoryDonutChart categories={donutData} />
            </div>
            <div className="lg:col-span-1">
              <CashflowBarChart transactions={transactions} />
            </div>
            <div className="lg:col-span-1">
              <VelocityLineChart transactions={transactions} />
            </div>
          </div>

          {/* Table: Recent Transactions with Multi-Item Accordion */}
          <div>
            <RecentTransactionsTable
              transactions={transactions}
              onRefresh={fetchData}
              title="10 Transaksi Terkini"
              limit={10}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <TelegramSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onTransactionCreated={fetchData}
      />

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
    </div>
  );
}
