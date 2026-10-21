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

  // Calculate Metrics
  const totalNetWorth = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSafeBudget = budgets.reduce((sum, b) => sum + b.capAmount, 0);
  const burnRatePercentage =
    totalSafeBudget > 0 ? Math.round((totalOutflow / totalSafeBudget) * 100) : 0;

  // Donut data
  const donutData = categories
    .filter((c) => c.type === "expense")
    .map((c) => {
      const amt = transactions
        .filter((t) => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: c.name,
        emoji: c.iconEmoji,
        amount: amt,
        color: c.colorHex,
      };
    })
    .filter((c) => c.amount > 0);

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
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-tangerine to-tangerine-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-tangerine-300 overflow-hidden bg-slate-100 transition-transform group-hover:scale-105">
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
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-tangerine-50 text-tangerine-700 font-bold border border-tangerine-200">
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
              <Send className="w-3.5 h-3.5 text-tangerine" />
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
              className="h-9 px-4 bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white rounded-xl shadow-tangerine-glow transition-all flex items-center gap-1.5 text-xs font-bold hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
          {/* TAMPILAN ZERO STATE: Untuk Akun Baru yang Belum Memiliki Transaksi (Sesuai Foto User) */}
          {transactions.length === 0 ? (
            <div className="space-y-5 animate-fadeIn">
              {/* 1. Welcome Card dengan Avatar Initial & Tombol Catat Transaksi Baru */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                    {(profile?.fullName || "Lily Latifah").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                        Selamat Datang, {profile?.fullName || "lilylatifah"}!
                      </h2>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                        {profile?.role === "superadmin" ? "PRO VIP" : "STARTER"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">✉️ {profile?.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">📞 {profile?.phoneWhatsapp || "082116696646"}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewTxOpen(true)}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all shrink-0 hover:scale-[1.02] active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Transaksi Baru</span>
                </button>
              </div>

              {/* 2. Notification Box: Data Keuangan Masih Bersih */}
              <div className="bg-[#fffdfa] rounded-2xl p-4 sm:p-5 border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Data Keuangan Masih Bersih
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Belum ada transaksi tercatat pada akun ini. Mulai kelola arus kasmu sekarang!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewTxOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 hover:scale-[1.01]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Belum ada transaksi. Catat transaksi pertamamu sekarang!</span>
                </button>
              </div>

              {/* 3. Langkah Awal Onboarding (Banner Oranye Menyala Sesuai Foto User) */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LANGKAH AWAL ONBOARDING</span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white">
                    Mulai kendalikan keuanganmu dalam 3 langkah mudah:
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                  {/* Step 1 */}
                  <button
                    type="button"
                    onClick={() => setIsSandboxOpen(true)}
                    className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 text-left flex items-center justify-between shadow-md hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 shrink-0" />
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                          1. Hubungkan Telegram
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Biar bisa catat semudah chat</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Step 2 */}
                  <Link
                    href="/wallets"
                    className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 text-left flex items-center justify-between shadow-md hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 shrink-0" />
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                          2. Atur Dompet Utama
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">BCA, GoPay, Tunai, dll</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>

                  {/* Step 3 */}
                  <Link
                    href="/budgets"
                    className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 text-left flex items-center justify-between shadow-md hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 shrink-0" />
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                          3. Pasang Budget Bulanan
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mencegah gaji habis sebelum akhir bulan</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </div>
              </div>

              {/* 4. Strip Filter Periode (Sesuai Foto User: Harian, Mingguan, Bulan Ini, Tahun Ini & Tanggal) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600 h-9">
                  {[
                    { key: "harian", label: "Harian" },
                    { key: "mingguan", label: "Mingguan" },
                    { key: "bulan_ini", label: "Bulan Ini" },
                    { key: "tahun_ini", label: "Tahun Ini" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPeriod(p.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all h-8 flex items-center ${
                        selectedPeriod === p.key
                          ? "bg-orange-500 text-white shadow-sm font-bold"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Oktober 2026 (WIB)</span>
                </div>
              </div>

              {/* 5. 4 Key Metrics Card: Semua Nilai Menjadi NOL (Rp 0) Sesuai Permintaan & Foto User */}
              <MetricsOverview
                totalNetWorth={totalNetWorth}
                totalInflow={totalInflow}
                totalOutflow={totalOutflow}
                totalSafeBudget={totalSafeBudget}
                burnRatePercentage={burnRatePercentage}
              />

              {/* Tanya AI Section */}
              <div id="dashboard-ai-section">
                <DashboardAIAssistant />
              </div>
            </div>
          ) : (
            /* TAMPILAN AKUN YANG SUDAH MEMILIKI TRANSAKSI (Sesuai Akun Mereka Sendiri) */
            <>
              {/* Dynamic Onboarding Checklist */}
              <OnboardingChecklist
                isTelegramConnected={true}
                walletCount={wallets.length}
                hasBudget={budgets.length > 0}
                onOpenSandbox={() => setIsSandboxOpen(true)}
              />

              {/* 4 Key Metrics Card dengan Nilai Real Akun */}
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
                  <CashflowBarChart />
                </div>
                <div className="lg:col-span-1">
                  <VelocityLineChart />
                </div>
              </div>

              {/* Table: 10 Recent Transactions with Multi-Item Accordion */}
              <div>
                <RecentTransactionsTable
                  transactions={transactions}
                  onRefresh={fetchData}
                  title="10 Transaksi Terkini"
                  limit={10}
                />
              </div>
            </>
          )}
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
