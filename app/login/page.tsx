"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: "login" (Masuk Akun) vs "register" (Daftar Akun Baru)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Mode tab di login: "email" | "phone"
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  // Form State: Awalnya DIBIARKAN KOSONG agar bebas diisi oleh pengguna
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Token Registrasi Otomatis (Default: 47893 sesuai permintaan)
  const [regToken, setRegToken] = useState("47893");

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fitur OTP ke Email / Phone
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpNotification, setOtpNotification] = useState<{
    otp: string;
    matchedPassword: string;
    target: string;
  } | null>(null);

  // Sinkronisasi tab / mode dari URL jika ada
  useEffect(() => {
    const tabParam = searchParams.get("tab") || searchParams.get("mode");
    if (tabParam === "phone" || tabParam === "wa") {
      setActiveTab("phone");
    }
    if (tabParam === "register" || searchParams.get("action") === "register") {
      setAuthMode("register");
    }
  }, [searchParams]);

  // 1-Click Login Google sebagai Owner (lilylatifah1234@gmail.com — Owner)
  const handleGoogleOwnerLogin = async () => {
    setLoading(true);
    setLoginError(null);
    setIsNotRegistered(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "lilylatifah1234@gmail.com",
          password: "lily1234#",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        if (data.profile) {
          window.dispatchEvent(
            new CustomEvent("tatadana-profile-updated", { detail: data.profile })
          );
        }
        router.push("/dashboard");
      } else {
        setLoginError(data.error || "Gagal masuk sebagai Owner Lily Latifah.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Terjadi gangguan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  // Minta Kode OTP ke Email atau Nomor WhatsApp
  const handleRequestOtp = async () => {
    const target = activeTab === "email" ? email.trim() : phone.trim();
    if (!target) {
      setLoginError(
        activeTab === "email"
          ? "Silakan masukkan alamat email terlebih dahulu untuk meminta kode OTP."
          : "Silakan masukkan nomor WhatsApp / HP terlebih dahulu untuk meminta kode OTP."
      );
      return;
    }

    setSendingOtp(true);
    setLoginError(null);
    setIsNotRegistered(false);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: activeTab === "email" ? email : undefined,
          phone: activeTab === "phone" ? phone : undefined,
          identifier: target,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setOtpNotification({
          otp: data.otp,
          matchedPassword: data.matchedPassword,
          target,
        });
        // Otomatis isikan sandi yang cocok dengan akun
        setPassword(data.matchedPassword);
      } else {
        setLoginError(data.error || "Gagal mengirimkan kode OTP.");
      }
    } catch (err: any) {
      setLoginError("Gagal menghubungi server pengirim OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Quick Preset Demo: Owner vs User
  const handleSelectDemo = (type: "owner" | "user" | "register") => {
    setLoginError(null);
    setIsNotRegistered(false);
    setOtpNotification(null);

    if (type === "owner") {
      setAuthMode("login");
      setActiveTab("email");
      setEmail("lilylatifah1234@gmail.com");
      setPassword("lily1234#");
      setPhone("082116696646");
      setFullName("Lily Latifah");
    } else if (type === "user") {
      setAuthMode("login");
      setActiveTab("email");
      setEmail("budi.pratama@perusahaan.com");
      setPassword("budi123#");
      setPhone("081299887766");
      setFullName("Budi Pratama");
    } else if (type === "register") {
      setAuthMode("register");
      setEmail("user.baru@gmail.com");
      setPassword("user123#");
      setPhone("081234567890");
      setFullName("Pengguna Baru");
      setRegToken("47893");
    }
  };

  // Submit Handler: Masuk ke Akun
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setIsNotRegistered(false);

    const loginEmail = activeTab === "email" ? email.trim() : email.trim();
    const loginPhone = activeTab === "phone" ? phone.trim() : "";

    if (!loginEmail && !loginPhone) {
      setLoginError("Alamat email atau nomor WhatsApp wajib diisi.");
      setLoading(false);
      return;
    }

    if (!password) {
      setLoginError("Kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password,
          phone: loginPhone,
          phoneWhatsapp: loginPhone,
        }),
      });

      const data = await res.json();

      // Kasus 1: Email Belum Terdaftar
      if (res.status === 404 || data.notRegistered) {
        setIsNotRegistered(true);
        setLoginError(data.error || "Alamat email belum terdaftar di sistem TataDana. Silakan daftar akun baru terlebih dahulu.");
        return;
      }

      // Kasus 2: Status Pending Approval -> arahkan ke pending-approval
      if (data.pendingApproval) {
        router.push(
          `/pending-approval?email=${encodeURIComponent(data.email || loginEmail)}&name=${encodeURIComponent(
            data.name || fullName || "Pengguna Baru"
          )}`
        );
        return;
      }

      // Kasus 3: Login Berhasil
      if (data.ok) {
        if (data.profile) {
          window.dispatchEvent(
            new CustomEvent("tatadana-profile-updated", { detail: data.profile })
          );
        }
        router.push("/dashboard");
      } else {
        setLoginError(data.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Terjadi gangguan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: Pendaftaran Akun Baru dengan Token 47893
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setIsNotRegistered(false);

    if (!email.trim()) {
      setLoginError("Alamat email wajib diisi untuk pendaftaran.");
      setLoading(false);
      return;
    }

    if (!password) {
      setLoginError("Kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setLoginError("Nomor WhatsApp / HP wajib diisi.");
      setLoading(false);
      return;
    }

    if (regToken.trim() !== "47893") {
      setLoginError("Nomor token tidak valid! Silakan masukkan nomor token resmi: 47893.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || email.split("@")[0].toUpperCase(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          token: regToken.trim(),
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push(
            `/pending-approval?email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(
              fullName || "User Baru"
            )}`
          );
        }, 1500);
      } else {
        setLoginError(data.error || "Pendaftaran gagal. Periksa kembali data Anda.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Terjadi kesalahan pada sistem pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-900 font-sans">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-base text-slate-900 tracking-tight">
            TataDana
          </span>
        </Link>

        {/* Mode Switcher Link in Header */}
        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "login" ? "register" : "login");
            setLoginError(null);
            setIsNotRegistered(false);
          }}
          className="text-xs font-bold text-[#f95700] hover:underline flex items-center gap-1"
        >
          {authMode === "login" ? (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Sudah Punya Akun? Masuk</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-5">
          
          {authMode === "login" ? (
            <>
              {/* Subtitle Deskripsi (Sesuai Image 1) */}
              <p className="text-center text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Masuk ke akun TataDana kamu untuk mengelola transaksi keuangan
              </p>

              {/* Tombol Google Owner (lilylatifah1234@gmail.com — Owner) */}
              <button
                type="button"
                onClick={handleGoogleOwnerLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border border-amber-200/90 bg-[#fffdfa] hover:bg-amber-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google (lilylatifah1234@gmail.com — Owner)</span>
              </button>

              {/* Divider: ATAU MASUK DENGAN AKUN LAIN */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider relative shrink-0">
                  ATAU MASUK DENGAN AKUN LAIN
                </span>
              </div>

              {/* Segmented Switcher Tab (Email & Password vs Nomor WhatsApp / HP) */}
              <div className="bg-[#f1f5f9] p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("email");
                    setLoginError(null);
                    setIsNotRegistered(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                    activeTab === "email"
                      ? "bg-white text-[#f95700] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Email & Password
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("phone");
                    setLoginError(null);
                    setIsNotRegistered(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                    activeTab === "phone"
                      ? "bg-white text-[#f95700] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Nomor WhatsApp / HP
                </button>
              </div>

              {/* Alert Error / Belum Terdaftar */}
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 leading-relaxed space-y-2 animate-fadeIn">
                  <div>{loginError}</div>
                  {isNotRegistered && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setLoginError(null);
                        setIsNotRegistered(false);
                      }}
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Daftar Akun Baru Sekarang (Token: 47893) →</span>
                    </button>
                  )}
                </div>
              )}

              {/* Banner Notifikasi OTP & Sandi Cocok */}
              {otpNotification && (
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Kode OTP Masuk Akun:</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-sky-300 font-mono text-sm font-extrabold text-[#f95700] shadow-sm">
                      {otpNotification.otp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sandi akun yang cocok: <strong className="font-mono text-slate-900 font-bold">{otpNotification.matchedPassword}</strong> (telah otomatis terisi ke form). Tekan tombol <strong>Masuk ke Akun</strong> untuk lanjut.
                  </p>
                </div>
              )}

              {/* Form Login (Input Awalnya Kosong Sesuai Permintaan) */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {activeTab === "email" ? (
                  <>
                    {/* Field 1: Alamat Email */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Alamat Email
                        </label>
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={sendingOtp}
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          <span>{sendingOtp ? "Mengirim..." : "Kirim OTP ke Email Ini"}</span>
                        </button>
                      </div>
                      <div className="bg-[#edf4fc] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setIsNotRegistered(false);
                          }}
                          placeholder="contoh: nama@email.com"
                          className="w-full text-xs bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Field 2: Kata Sandi + Lupa sandi? */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Kata Sandi
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Silakan hubungi Administrator (Lily Latifah: 082116696646) untuk mereset kata sandi akun Anda."
                            )
                          }
                          className="text-xs font-semibold text-[#f95700] hover:underline"
                        >
                          Lupa sandi?
                        </button>
                      </div>
                      <div className="bg-[#edf4fc] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi akun"
                          className="w-full text-xs bg-transparent text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Field 1: Nomor WhatsApp / HP */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Nomor WhatsApp / HP
                        </label>
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={sendingOtp}
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          <span>{sendingOtp ? "Mengirim..." : "Kirim OTP ke No WA"}</span>
                        </button>
                      </div>
                      <div className="bg-[#edf4fc] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setIsNotRegistered(false);
                          }}
                          placeholder="contoh: 0821xxxxxxx"
                          className="w-full text-xs bg-transparent text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Field 2: Kata Sandi / PIN Akun */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Kata Sandi / PIN
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Silakan hubungi Administrator (Lily Latifah: 082116696646) untuk reset PIN."
                            )
                          }
                          className="text-xs font-semibold text-[#f95700] hover:underline"
                        >
                          Lupa sandi?
                        </button>
                      </div>
                      <div className="bg-[#edf4fc] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi / PIN"
                          className="w-full text-xs bg-transparent text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Tombol Oranye: Masuk ke Akun → (Sesuai Image 1) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
                >
                  {loading ? (
                    <span>Memverifikasi Akun...</span>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Tautan Pendaftaran Akun Baru */}
              <div className="pt-2 text-center text-xs text-slate-600">
                Belum memiliki akun terdaftar?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setLoginError(null);
                    setIsNotRegistered(false);
                  }}
                  className="font-bold text-[#f95700] hover:underline"
                >
                  Daftar akun sekarang (Token: 47893) →
                </button>
              </div>
            </>
          ) : (
            /* ============================================================== */
            /* MODE PENDAFTARAN AKUN BARU (SESUAI PERMINTAAN DENGAN TOKEN 47893) */
            /* ============================================================== */
            <>
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold mb-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Pendaftaran Akun Baru</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                  Buat Akun TataDana Prime
                </h3>
                <p className="text-xs text-slate-500">
                  Lengkapi identitas Anda dan gunakan nomor token pendaftaran resmi.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 leading-relaxed animate-fadeIn">
                  {loginError}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 leading-relaxed flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* 1. Nama Lengkap */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Nama Lengkap
                  </label>
                  <div className="bg-[#edf4fc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full text-xs bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Alamat Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Alamat Email
                  </label>
                  <div className="bg-[#edf4fc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: user@gmail.com"
                      className="w-full text-xs bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Nomor WhatsApp / HP */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="bg-[#edf4fc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="contoh: 081234567890"
                      className="w-full text-xs bg-transparent text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Kata Sandi Baru */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Kata Sandi Akun
                  </label>
                  <div className="bg-[#edf4fc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-transparent focus-within:border-sky-300 focus-within:bg-white transition-all">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat kata sandi akun"
                      className="w-full text-xs bg-transparent text-slate-800 font-mono placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 5. Token Registrasi Otomatis (Wajib 47893) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Token Pendaftaran Otomatis
                    </label>
                    <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      Token Resmi: 47893
                    </span>
                  </div>
                  <div className="bg-[#edf4fc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-sky-300 bg-sky-50/50">
                    <KeyRound className="w-4 h-4 text-orange-500 shrink-0" />
                    <input
                      type="text"
                      required
                      value={regToken}
                      onChange={(e) => setRegToken(e.target.value)}
                      placeholder="47893"
                      className="w-full text-xs font-mono font-bold tracking-wider text-slate-900 bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase shrink-0">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Sistem otomatis mengisi token pendaftaran resmi <strong className="text-slate-800">47893</strong>.
                  </p>
                </div>

                {/* Tombol Submit Pendaftaran */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60 pt-3"
                >
                  {loading ? (
                    <span>Mendaftarkan Akun...</span>
                  ) : (
                    <>
                      <span>Daftar Akun Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Tautan Kembali ke Login */}
              <div className="pt-2 text-center text-xs text-slate-600">
                Sudah memiliki akun terdaftar?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setLoginError(null);
                    setIsNotRegistered(false);
                  }}
                  className="font-bold text-[#f95700] hover:underline"
                >
                  Masuk ke akun sekarang →
                </button>
              </div>
            </>
          )}

          {/* Kotak Bawah: Akun Pengujian Demo Cepat */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-sky-100 bg-[#f8fbff] space-y-2.5">
            <div className="text-[11px] font-bold text-slate-700">
              Akun Pengujian Demo Cepat:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo("owner")}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[11px] transition-colors"
              >
                Owner (Lily Latifah)
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("user")}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
              >
                User (Budi Pratama)
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("register")}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold text-[11px] transition-colors"
              >
                + Daftar Baru (Token 47893)
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400">
        TataDana &copy; 2026. Seluruh hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
            <span>Memuat Portal TataDana...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
