"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { AIAuditLog, AdminAuditLog, PaymentOrder } from "@/types";
import { formatRupiah } from "@/lib/telegram";
import {
  ShieldCheck,
  Cpu,
  Users,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Sparkles,
  Zap,
  Activity,
  AlertOctagon,
  Database,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  UserCheck,
  UserX,
  ShieldAlert,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { UserProfile } from "@/types";

export default function SuperadminPage() {
  const [activeTab, setActiveTab] = useState<
    "user_approvals" | "data_management" | "ai_gateway" | "payments" | "users" | "audit_trail"
  >("user_approvals");
  const [aiLogs, setAiLogs] = useState<AIAuditLog[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // User Management & Role Authorization State
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Data Store Management State
  const [storeSummary, setStoreSummary] = useState<any>(null);
  const [fullStore, setFullStore] = useState<any>(null);
  const [testAmount, setTestAmount] = useState("350000");
  const [testNote, setTestNote] = useState("Uji mutasi webhook Telegram live");
  const [testType, setTestType] = useState<"expense" | "income">("expense");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // AI Gateway State
  const [aiMode, setAiMode] = useState<"cascading" | "dedicated">("cascading");
  const [dedicatedProvider, setDedicatedProvider] = useState<"gemini" | "openai" | "deepseek">("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Impersonation state
  const [impersonateReason, setImpersonateReason] = useState("");
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aiRes, payRes, admRes, storeRes, usersRes] = await Promise.all([
        fetch("/api/ai/gateway"),
        fetch("/api/payment/manual"),
        fetch("/api/admin/impersonate"),
        fetch("/api/admin/data"),
        fetch("/api/admin/users"),
      ]);

      const aiData = await aiRes.json();
      const payData = await payRes.json();
      const admData = await admRes.json();
      const storeData = await storeRes.json();
      const usersData = await usersRes.json();

      if (usersData.ok) {
        setRegisteredUsers(usersData.users || []);
        if (usersData.activeProfile) {
          setActiveProfile(usersData.activeProfile);
          const role = usersData.activeProfile.role;
          if (role !== "admin" && role !== "superadmin") {
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        }
      }

      if (aiData.ok) {
        setAiLogs(aiData.logs || []);
        if (aiData.config) {
          setAiMode(aiData.config.mode || "cascading");
          setDedicatedProvider(aiData.config.dedicatedProvider || "gemini");
        }
      }
      if (payData.ok) setPaymentOrders(payData.data || []);
      if (admData.ok) setAdminLogs(admData.data || []);
      if (storeData.ok) {
        setStoreSummary(storeData.summary);
        setFullStore(storeData.fullStore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestMutation = async () => {
    setIsGenerating(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_test_mutation",
          amount: parseFloat(testAmount) || 250000,
          type: testType,
          note: testNote || "Mutasi uji coba live Telegram Webhook",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({
          type: "success",
          text: "✅ Mutasi baru berhasil dibuat dan tersimpan permanen ke disk!",
        });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: `❌ ${data.message || "Gagal membuat mutasi"}` });
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: `❌ ${e.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetStore = async () => {
    if (!confirm("Apakah Anda yakin ingin mereset database lokal ke data bawaan (Lily Latifah PRO VIP)?")) return;
    setIsResetting(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({
          type: "success",
          text: "✅ Database lokal berhasil direset ke pengaturan awal!",
        });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: `❌ ${data.message || "Gagal reset"}` });
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: `❌ ${e.message}` });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm("Hapus transaksi ini dan pulihkan saldo dompet?")) return;
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_transaction", id }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: "✅ Transaksi berhasil dihapus dan saldo dompet dipulihkan." });
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "approve" }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: data.message });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.error || "Gagal menyetujui user" });
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    const reason = prompt("Masukkan alasan penolakan pendaftaran akun:", "Verifikasi data profil tidak memenuhi syarat");
    if (!reason) return;

    setApprovingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "reject", reason }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: data.message });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.error || "Gagal menolak user" });
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setApprovingId(null);
    }
  };

  const handleSwitchSession = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch_session", userId }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.error || "Gagal beralih sesi");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAIGateway = async () => {
    try {
      const res = await fetch("/api/ai/gateway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: aiMode,
          dedicatedProvider,
          geminiKey: geminiKey || undefined,
          openaiKey: openaiKey || undefined,
          deepseekKey: deepseekKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaveStatus("✅ Konfigurasi AI Gateway dan Cascading Failover berhasil disimpan!");
        setTimeout(() => setSaveStatus(null), 4000);
        fetchData();
      }
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handleApprovePayment = async (orderId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/payment/manual", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(data.message);
        fetchData();
      }
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const handleTriggerImpersonation = async () => {
    if (!impersonateReason || impersonateReason.trim().length < 5) {
      alert("Alasan audit wajib diisi minimal 5 karakter");
      return;
    }

    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: impersonateReason }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(`Berhasil masuk ke Impersonation Mode: ${data.targetUser.fullName}`);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  // Metrics
  const totalCostUsd = aiLogs.reduce((sum, l) => sum + (l.estimatedCostUsd || 0), 0);
  const avgLatency =
    aiLogs.length > 0 ? Math.round(aiLogs.reduce((sum, l) => sum + l.latencyMs, 0) / aiLogs.length) : 0;
  const pendingPayments = paymentOrders.filter((p) => p.paymentStatus === "pending");
  const pendingUsers = registeredUsers.filter((u) => u.approvalStatus === "pending");
  const approvedUsers = registeredUsers.filter((u) => u.approvalStatus === "approved");

  if (!loading && !isAuthorized) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-extrabold uppercase tracking-wider">
                Akses Ditolak (403 Forbidden)
              </span>
              <h2 className="font-display font-bold text-2xl text-white mt-3">
                Superadmin Desk Terproteksi
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Akun aktif Anda saat ini adalah <strong>{activeProfile?.fullName || "Pengguna Biasa"}</strong> dengan Role <strong>{(activeProfile?.role || "user").toUpperCase()}</strong>. Halaman ini diproteksi ketat dan hanya dapat diakses oleh akun Superadmin / Admin.
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <a
                href="/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Dashboard Eksekutif</span>
              </a>
              <button
                onClick={async () => {
                  await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: "lilylatifah1234@gmail.com", password: "lily1234#" }),
                  });
                  window.location.reload();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-tangerine-glow transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Beralih ke Akun Superadmin (Lily Latifah)</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-900 text-white px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-white tracking-tight">
                  Enterprise Superadmin Desk
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
                  ROOT PRIVILEGE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI Failover Gateway Controller, Manual Payment Approval, and Security Audit Trail.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Admin: <strong>root-superadmin</strong>
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Ingress Avg Latency
              </span>
              <div className="font-display font-bold text-2xl text-slate-900 mt-1 tabular-nums">
                {avgLatency} ms
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                ⚡ Respon webhook Telegram &lt; 1 detik
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estimasi Biaya Token AI
              </span>
              <div className="font-display font-bold text-2xl text-slate-900 mt-1 tabular-nums">
                ${totalCostUsd.toFixed(4)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total {aiLogs.length} panggilan model</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending Manual Transfers
              </span>
              <div className="font-display font-bold text-2xl text-tangerine mt-1 tabular-nums">
                {pendingPayments.length} Antrean
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Menunggu verifikasi bukti bayar</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mode Failover Multi-AI
              </span>
              <div className="font-display font-bold text-xl text-emerald-700 mt-1 capitalize">
                {aiMode === "cascading" ? "Cascading Auto-Switch" : "Dedicated Solo"}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Gemini 1.5 ⇄ GPT-4o ⇄ DeepSeek</p>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
            {[
              { id: "user_approvals", label: `Persetujuan User (${pendingUsers.length})`, icon: UserCheck },
              { id: "data_management", label: "Manajemen Data & Webhook DB", icon: Database },
              { id: "ai_gateway", label: "AI Gateway Controller", icon: Cpu },
              { id: "payments", label: `Manual Payment Desk (${pendingPayments.length})`, icon: CreditCard },
              { id: "users", label: "User Impersonation & Quota", icon: Users },
              { id: "audit_trail", label: "Security & Privacy Audit Trail", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-tangerine text-tangerine-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 0: USER APPROVAL DESK */}
          {activeTab === "user_approvals" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Alert Message */}
              {actionMessage && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                    actionMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <span>{actionMessage.text}</span>
                  <button
                    onClick={() => setActionMessage(null)}
                    className="text-xs font-bold underline ml-2"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* Role Tester Toolbar */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white border border-slate-700 shadow-luxury space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-tangerine-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-tangerine-300">
                      Toolbar Pengujian Role (Admin vs User Biasa)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                    Sesi Aktif: {activeProfile?.fullName} ({activeProfile?.role.toUpperCase()})
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gunakan tombol di bawah untuk beralih sesi secara instan. Ketika masuk sebagai <strong>User Biasa</strong>, menu "Superadmin Desk" akan otomatis hilang dari Sidebar dan akses ke <code>/admin</code> akan diblokir dengan halaman 403 Forbidden.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {registeredUsers.filter((u) => u.id !== "usr-lily-001" && u.role !== "superadmin").length === 0 ? (
                    <span className="text-xs text-slate-400 italic py-1">
                      Belum ada pengguna terdaftar baru. Ketika user baru mendaftar dari formulir pendaftaran, akun mereka akan muncul di sini untuk peninjauan.
                    </span>
                  ) : (
                    registeredUsers
                      .filter((u) => u.id !== "usr-lily-001" && u.role !== "superadmin")
                      .map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchSession(u.id)}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                            activeProfile?.id === u.id
                              ? "bg-emerald-600/30 border-emerald-500 text-emerald-300"
                              : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-white"
                          }`}
                        >
                          <span>Masuk Sesi: {u.fullName} ({(u.approvalStatus || "pending").toUpperCase()})</span>
                        </button>
                      ))
                  )}
                  {activeProfile?.id !== "usr-lily-001" && (
                    <button
                      onClick={() => handleSwitchSession("usr-lily-001")}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-tangerine to-tangerine-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-tangerine-glow transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Kembali ke Superadmin (Lily Latifah)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Pengguna Terdaftar
                  </span>
                  <div className="font-display font-bold text-2xl text-slate-900 mt-1">
                    {registeredUsers.length} Akun
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Database lokal TataDana</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-card-luxury relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-bl-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <span className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Menunggu Approval
                  </span>
                  <div className="font-display font-bold text-2xl text-amber-600 mt-1 tabular-nums">
                    {pendingUsers.length} Pengguna
                  </div>
                  <p className="text-[10px] text-amber-600 mt-1">Wajib persetujuan Superadmin</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Pengguna Disetujui (Approved)
                  </span>
                  <div className="font-display font-bold text-2xl text-emerald-600 mt-1">
                    {approvedUsers.length} Akun
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Akses penuh Dashboard aktif</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    Superadmin Aktif
                  </span>
                  <div className="font-display font-bold text-2xl text-sky-600 mt-1">
                    Lily Latifah
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">● PRO VIP LIFETIME</p>
                </div>
              </div>

              {/* Antrean Persetujuan Pengguna (Pending Approvals) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-amber-600" />
                      <h3 className="font-display font-bold text-base text-slate-900">
                        Antrean Pendaftaran Pengguna Baru (Waiting for Approval)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pengguna dalam antrean ini belum bisa membuka <code>/dashboard</code> dan saat ini berada di layar tunggu (Waiting Screen).
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {pendingUsers.length} Menunggu Persetujuan
                  </span>
                </div>

                {pendingUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Semua pendaftaran telah diproses!</p>
                    <p className="text-slate-400 mt-0.5">Tidak ada akun dalam antrean persetujuan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                          <th className="py-3 px-4">Nama Pengguna</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">No. WhatsApp</th>
                          <th className="py-3 px-4">Waktu Daftar</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Aksi Superadmin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {u.id}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{u.phoneWhatsapp || "-"}</td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {new Date(u.createdAt).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200 uppercase">
                                ⏳ PENDING
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveUser(u.id)}
                                  disabled={approvingId === u.id}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{approvingId === u.id ? "Memproses..." : "Setujui (Approve)"}</span>
                                </button>
                                <button
                                  onClick={() => handleRejectUser(u.id)}
                                  disabled={approvingId === u.id}
                                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all active:scale-95"
                                >
                                  Tolak
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Tabel Seluruh Pengguna Terdaftar */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Direktori Seluruh Pengguna Terdaftar
                    </h3>
                    <p className="text-xs text-slate-500">
                      Daftar akun lengkap dengan hak akses peran (Role) dan status persetujuan.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Total: {registeredUsers.length} Pengguna
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Pengguna</th>
                        <th className="py-2.5 px-3">Email & Kontak</th>
                        <th className="py-2.5 px-3">Role Sistem</th>
                        <th className="py-2.5 px-3">Status Persetujuan</th>
                        <th className="py-2.5 px-3 text-right">Uji Coba Sesi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registeredUsers.map((u) => {
                        const isCurrentActive = activeProfile?.id === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-tangerine to-tangerine-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                                  {u.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{u.fullName}</span>
                                    {isCurrentActive && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-extrabold uppercase">
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">ID: {u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-mono text-slate-800">{u.email}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{u.phoneWhatsapp || "-"}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === "superadmin"
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.approvalStatus === "approved"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : u.approvalStatus === "pending"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {u.approvalStatus?.toUpperCase() || "APPROVED"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleSwitchSession(u.id)}
                                disabled={isCurrentActive}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  isCurrentActive
                                    ? "bg-slate-100 text-slate-400 cursor-default"
                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95"
                                }`}
                              >
                                {isCurrentActive ? "Sesi Aktif" : "Uji Sesi Ini"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: AI GATEWAY CONTROLLER */}
          {activeTab === "ai_gateway" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Multi-Provider AI Gateway & Cascading Failover
                    </h3>
                    <p className="text-xs text-slate-500">
                      Jika Provider A mengalami rate limit (429) atau downtime (5xx), sistem otomatis beralih ke Provider B dalam hitungan milidetik.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Zero-Downtime Pipeline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Mode Operasi AI
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="aiMode"
                          checked={aiMode === "cascading"}
                          onChange={() => setAiMode("cascading")}
                          className="text-tangerine focus:ring-tangerine"
                        />
                        <span>1. Failover Cascading (Gemini ➔ GPT-4o ➔ DeepSeek)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="aiMode"
                          checked={aiMode === "dedicated"}
                          onChange={() => setAiMode("dedicated")}
                          className="text-tangerine focus:ring-tangerine"
                        />
                        <span>2. Single Dedicated Model (Fokus efisiensi beban)</span>
                      </label>
                    </div>
                  </div>

                  {aiMode === "dedicated" && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                        Pilih Dedicated Provider
                      </label>
                      <select
                        value={dedicatedProvider}
                        onChange={(e) => setDedicatedProvider(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
                      >
                        <option value="gemini">Google Gemini 1.5 Pro</option>
                        <option value="openai">OpenAI GPT-4o</option>
                        <option value="deepseek">DeepSeek V3 / R1</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* API Key Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      DeepSeek API Key
                    </label>
                    <input
                      type="password"
                      value={deepseekKey}
                      onChange={(e) => setDeepseekKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                {saveStatus && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold mb-3">
                    {saveStatus}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAIGateway}
                    className="px-5 py-2.5 bg-tangerine hover:bg-tangerine-600 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Perbarui Konfigurasi Gateway
                  </button>
                </div>
              </div>

              {/* AI Token Cost & Latency Table */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
                <h3 className="font-display font-bold text-base text-slate-900 mb-3">
                  Log Audit Pemanggilan AI & Analisis Latensi
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Provider & Model</th>
                        <th className="py-2.5 px-3">Aksi</th>
                        <th className="py-2.5 px-3 text-center">Tokens (In/Out)</th>
                        <th className="py-2.5 px-3 text-right">Latensi</th>
                        <th className="py-2.5 px-3 text-right">Estimasi Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 font-mono">
                          <td className="py-2.5 px-3 font-sans text-slate-700">
                            {new Date(log.createdAt).toLocaleTimeString("id-ID")} WIB
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            <span className="uppercase text-tangerine-600 font-bold mr-1">
                              [{log.provider}]
                            </span>
                            {log.model}
                          </td>
                          <td className="py-2.5 px-3 font-sans capitalize text-slate-600">
                            {log.actionType.replace("_", " ")}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {log.promptTokens} / {log.completionTokens}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                            {log.latencyMs} ms
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-900 font-bold">
                            ${log.estimatedCostUsd?.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL PAYMENT APPROVAL DESK */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Manual Bank Transfer Approval Desk
                </h3>
                <p className="text-xs text-slate-500">
                  Tinjau bukti mutasi transfer manual dari pengguna dan aktifkan langganan dalam 1-klik.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Pengguna</th>
                      <th className="py-3 px-3">Paket</th>
                      <th className="py-3 px-3 text-right">Nominal</th>
                      <th className="py-3 px-3 text-center">Bukti Transfer</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {order.orderId}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {order.userName}
                        </td>
                        <td className="py-3 px-3 uppercase font-bold text-tangerine-700">
                          {order.planType}
                        </td>
                        <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900">
                          {formatRupiah(order.grossAmount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {order.proofImageUrl ? (
                            <a
                              href={order.proofImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Lihat Bukti</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Midtrans VA/QRIS</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.paymentStatus === "settlement"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.paymentStatus === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {order.paymentStatus === "pending" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleApprovePayment(order.orderId, "approve")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Setujui (1-Klik)</span>
                              </button>
                              <button
                                onClick={() => handleApprovePayment(order.orderId, "reject")}
                                className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 font-bold text-[11px]"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER IMPERSONATION & QUOTA */}
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  User Impersonation Mode (Dukungan VIP & Penyelesaian Kendala)
                </h3>
                <p className="text-xs text-slate-500">
                  Masuk ke tampilan dashboard pengguna secara aman tanpa meminta password pengguna.
                  Setiap akses dicatat otomatis ke log audit privasi.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-lg space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Alasan Akses Impersonation (Wajib Audit)
                </label>
                <input
                  type="text"
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  placeholder="Contoh: Investigasi sinkronisasi struk belanja tiket pesawat"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine"
                />

                <button
                  onClick={handleTriggerImpersonation}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Lock className="w-4 h-4 text-tangerine-400" />
                  <span>Aktifkan Impersonation Mode untuk Akun Lily Latifah</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === "audit_trail" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Privacy & Security Audit Trail
                </h3>
                <p className="text-xs text-slate-500">
                  Log aktivitas sensitif admin sesuai kepatuhan regulasi privasi UU PDP Indonesia dan GDPR.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Waktu (WIB)</th>
                      <th className="py-2.5 px-3">Admin</th>
                      <th className="py-2.5 px-3">Aksi</th>
                      <th className="py-2.5 px-3">Target User</th>
                      <th className="py-2.5 px-3">Alasan / Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-sans text-slate-700">
                          {new Date(log.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {log.adminName}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-red-700">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-800">
                          {log.targetUserName || "System"}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">
                          {log.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DATA MANAGEMENT & PERSISTENT STORE */}
          {activeTab === "data_management" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Alert Message */}
              {actionMessage && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                    actionMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <span>{actionMessage.text}</span>
                  <button
                    onClick={() => setActionMessage(null)}
                    className="text-xs font-bold underline ml-2"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* Status Penyimpanan Persisten */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-sky-600" />
                      <h3 className="font-display font-bold text-base text-slate-900">
                        Status Database Persisten Lokal (JSON File Store)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Setiap mutasi saldo dari Webhook Telegram (
                      <code className="text-sky-600 font-bold">/api/telegram/webhook</code>
                      ) langsung ditulis ke disk secara atomik. Data tidak akan hilang saat dashboard di-refresh atau server di-restart.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchData}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Segarkan Data</span>
                    </button>
                    <button
                      onClick={handleResetStore}
                      disabled={isResetting}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                      <span>{isResetting ? "Mereset..." : "Reset Database ke Bawaan"}</span>
                    </button>
                  </div>
                </div>

                {/* Storage Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      File Database Lokal
                    </span>
                    <div className="font-mono text-xs font-bold text-sky-950 mt-1 truncate">
                      data/tatadana-store.json
                    </div>
                    <span className="text-[10.5px] text-sky-600">Status: Aktif & Tersinkron</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Akun Eksekutif Utama
                    </span>
                    <div className="font-bold text-sm text-slate-900 mt-1">
                      {storeSummary?.profileName || "Lily Latifah"}
                    </div>
                    <span className="text-[10.5px] text-emerald-600 font-bold uppercase">
                      ● Status: {storeSummary?.planType?.toUpperCase() || "PRO VIP"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total Mutasi Transaksi
                    </span>
                    <div className="font-display font-bold text-2xl text-slate-900 mt-1">
                      {storeSummary?.totalTransactions ?? fullStore?.transactions?.length ?? 0}
                    </div>
                    <span className="text-[10.5px] text-slate-500">Tersimpan di disk</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Multi-Wallet & Kategori
                    </span>
                    <div className="font-bold text-sm text-slate-900 mt-1">
                      {storeSummary?.totalWallets ?? 3} Dompet / {storeSummary?.totalCategories ?? 6} Kategori
                    </div>
                    <span className="text-[10.5px] text-slate-500">Siap untuk webhook & bot</span>
                  </div>
                </div>
              </div>

              {/* Generator Mutasi Uji Coba */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Simulasi Injeksi Mutasi Saldo Webhook Telegram
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uji coba penulisan langsung ke file database lokal tanpa harus mengirim pesan Telegram manual.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nominal (Rp)
                    </label>
                    <input
                      type="number"
                      value={testAmount}
                      onChange={(e) => setTestAmount(e.target.value)}
                      placeholder="Contoh: 350000"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono focus:outline-none focus:border-tangerine"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jenis Aliran Kas
                    </label>
                    <select
                      value={testType}
                      onChange={(e) => setTestType(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-semibold"
                    >
                      <option value="expense">Pengeluaran (Expense)</option>
                      <option value="income">Pemasukan (Income)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Catatan / Keterangan Mutasi
                    </label>
                    <input
                      type="text"
                      value={testNote}
                      onChange={(e) => setTestNote(e.target.value)}
                      placeholder="Contoh: Pembelian domain tatadana.id"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-medium"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleCreateTestMutation}
                      disabled={isGenerating}
                      className="w-full py-2.5 bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold rounded-xl shadow-tangerine-glow transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isGenerating ? "Menyimpan ke Disk..." : "Simpan Mutasi ke DB"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabel Mutasi Terkini di Database */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Daftar Mutasi Terkini di File Database
                    </h3>
                    <p className="text-xs text-slate-500">
                      Semua transaksi di bawah ini tersimpan di <code className="text-sky-600">data/tatadana-store.json</code> dan langsung tampil di Dashboard.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Total: {fullStore?.transactions?.length || 0} Data
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                        <th className="py-2.5 px-3">Dompet</th>
                        <th className="py-2.5 px-3">Sumber Mutasi</th>
                        <th className="py-2.5 px-3 text-right">Nominal</th>
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(fullStore?.transactions || []).slice(0, 15).map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <span className="mr-1.5">{tx.categoryEmoji || "🏷️"}</span>
                            <span>{tx.categoryName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 max-w-[200px] truncate">
                            {tx.note}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium">
                            {tx.walletName || "Dompet Utama"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                tx.source === "telegram_text"
                                  ? "bg-sky-100 text-sky-800"
                                  : tx.source === "receipt_ocr"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {tx.source}
                            </span>
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              tx.type === "expense" ? "text-deficit" : "text-surplus"
                            }`}
                          >
                            {tx.type === "expense" ? "-" : "+"}
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleDeleteTx(tx.id)}
                              title="Hapus mutasi dan pulihkan saldo"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!fullStore?.transactions || fullStore.transactions.length === 0) && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                            Belum ada mutasi tersimpan. Gunakan tombol di atas untuk membuat mutasi simulasi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <TelegramSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onTransactionCreated={fetchData}
      />
    </div>
  );
}
