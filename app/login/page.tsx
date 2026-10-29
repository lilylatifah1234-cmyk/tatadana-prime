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
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Shield,
  ArrowLeft,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode Akses: "user" (default pengguna biasa) vs "admin" (khusus superadmin/owner)
  const [roleMode, setRoleMode] = useState<"user" | "admin">("user");

  // Mode Autentikasi User: "login" (Masuk) vs "register" (Daftar Akun Baru)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Form State: 4 Field Utama Sesuai Permintaan (Nama, Email, Password, No. Telepon)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sinkronisasi dari query param URL jika ada (?role=admin atau ?mode=register)
  useEffect(() => {
    const roleParam = searchParams.get("role") || searchParams.get("tab");
    if (roleParam === "admin" || roleParam === "superadmin") {
      setRoleMode("admin");
    } else {
      setRoleMode("user");
    }

    const actionParam = searchParams.get("action") || searchParams.get("mode");
    if (actionParam === "register") {
      setAuthMode("register");
    }
  }, [searchParams]);

  // Submit Handler: Masuk ke Akun (User atau Admin)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setIsNotRegistered(false);

    const identifier = email.trim();
    if (!identifier) {
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
          email: identifier.includes("@") ? identifier : undefined,
          phone: !identifier.includes("@") ? identifier : undefined,
          password,
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
          `/pending-approval?email=${encodeURIComponent(data.email || identifier)}&name=${encodeURIComponent(
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
        // Jika admin, arahkan ke /admin atau /dashboard
        if (data.profile?.role === "superadmin" || data.profile?.role === "admin" || roleMode === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setLoginError(data.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Terjadi gangguan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: Pendaftaran Akun Baru (HANYA Nama, Email, Password, No. Telepon)
  // Token resmi 47893 dikirimkan otomatis di background
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    setIsNotRegistered(false);

    if (!fullName.trim()) {
      setLoginError("Nama lengkap wajib diisi.");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setLoginError("Alamat email wajib diisi untuk pendaftaran.");
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setLoginError("Nomor WhatsApp / HP wajib diisi.");
      setLoading(false);
      return;
    }

    if (!password) {
      setLoginError("Kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          token: "47893", // Token otomatis resmi pendaftaran
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSuccessMessage("Pendaftaran akun berhasil! Mengalihkan ke ruang aktivasi...");
        setTimeout(() => {
          router.push(
            `/pending-approval?email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(
              fullName.trim()
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

  // 1-Click Login Google sebagai Owner Lily Latifah (Khusus Mode Admin)
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
        router.push("/admin");
      } else {
        setLoginError(data.error || "Gagal masuk sebagai Owner Lily Latifah.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Terjadi gangguan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between selection:bg-olive-100 selection:text-olive-900 font-sans">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-olive-600 to-olive-700 flex items-center justify-center text-white shadow-md shadow-olive-600/30 transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-olive-100" />
          </div>
          <div>
            <span className="font-display font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              TataDana
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-olive-100 text-olive-800 border border-olive-200 tracking-wider">
                Prime
              </span>
            </span>
            <p className="text-[10px] text-olive-800/70 font-semibold">Executive Wealth OS</p>
          </div>
        </Link>

        {/* Quick Link Kembali ke Landing Page */}
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-olive-700 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Halaman Utama</span>
        </Link>
      </header>

      {/* Main Container Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-5">

          {/* ═══════════════════════════════════════════════════════
              JIKA MODE KHUSUS ADMIN (SUPERADMIN POV)
          ═══════════════════════════════════════════════════════ */}
          {roleMode === "admin" ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Portal Khusus Administrator</span>
                </div>
                <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                  Superadmin Desk Login
                </h2>
                <p className="text-xs text-slate-500">
                  Akses otorisasi penuh untuk Owner & Administrator TataDana Prime
                </p>
              </div>

              {/* Tombol 1-Click Login Google sebagai Owner Lily Latifah */}
              <button
                type="button"
                onClick={handleGoogleOwnerLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-olive-500 bg-olive-50 hover:bg-olive-100 text-olive-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-olive-600" />
                </div>
                <span>Masuk Cepat sebagai Owner (Lily Latifah — Superadmin)</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative shrink-0">
                  ATAU LOGIN DENGAN KREDENSIAL ADMIN
                </span>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Alamat Email Admin
                  </label>
                  <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lilylatifah1234@gmail.com"
                      className="w-full text-xs bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Kata Sandi Admin
                  </label>
                  <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi admin"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-olive-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
                >
                  {loading ? <span>Memverifikasi...</span> : <span>Masuk ke Superadmin Desk →</span>}
                </button>
              </form>

              {/* Switch Kembali ke User Mode */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRoleMode("user");
                    setLoginError(null);
                  }}
                  className="text-xs font-semibold text-olive-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Bukan Admin? Masuk atau Daftar sebagai Pengguna (User)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════
               JIKA MODE USER (HANYA Nama, Email, Password, No. Telepon)
            ═══════════════════════════════════════════════════════ */
            <div className="space-y-4">
              {/* Tab Switcher: Masuk vs Daftar Baru */}
              <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setLoginError(null);
                    setSuccessMessage(null);
                    setIsNotRegistered(false);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    authMode === "login"
                      ? "bg-white text-olive-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-olive-600" />
                  <span>Masuk Akun</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setLoginError(null);
                    setSuccessMessage(null);
                    setIsNotRegistered(false);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    authMode === "register"
                      ? "bg-white text-olive-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-olive-600" />
                  <span>Daftar Akun Baru</span>
                </button>
              </div>

              {/* Title & Deskripsi */}
              <div className="text-center space-y-1">
                <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                  {authMode === "login" ? "Masuk ke Akun Anda" : "Pendaftaran Akun Pengguna"}
                </h2>
                <p className="text-xs text-slate-500">
                  {authMode === "login"
                    ? "Kelola arus kas & laporan kekayaan Anda di TataDana Prime"
                    : "Isi data diri Anda di bawah untuk mulai menggunakan TataDana Prime"}
                </p>
              </div>

              {/* Pesan Error / Sukses */}
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 leading-relaxed space-y-2">
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
                      <span>Daftar Akun Baru Sekarang →</span>
                    </button>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 leading-relaxed flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* FORM 1: LOGIN USER (Email/No. Telepon & Password) */}
              {authMode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  {/* Field 1: Email atau Nomor Telepon */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Alamat Email / Nomor Telepon
                    </label>
                    <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsNotRegistered(false);
                        }}
                        placeholder="contoh: nama@email.com atau 0812xxxxxxx"
                        className="w-full text-xs bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 2: Kata Sandi */}
                  <div className="space-y-1">
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
                        className="text-xs font-semibold text-olive-700 hover:underline"
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
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

                  {/* Tombol Masuk */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-olive-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
                  >
                    {loading ? (
                      <span>Memverifikasi...</span>
                    ) : (
                      <>
                        <span>Masuk ke Akun</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600">
                    Belum memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setLoginError(null);
                        setIsNotRegistered(false);
                      }}
                      className="font-bold text-olive-700 hover:underline"
                    >
                      Daftar akun sekarang →
                    </button>
                  </div>
                </form>
              ) : (
                /* FORM 2: DAFTAR USER BARU — HANYA MENAMPILKAN Nama, Email, Password, No. Telepon */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* 1. Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Nama Lengkap
                    </label>
                    <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
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
                    <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
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

                  {/* 3. Nomor Telepon / WhatsApp */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
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

                  {/* 4. Kata Sandi */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Kata Sandi
                    </label>
                    <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200 focus-within:border-olive-500 focus-within:bg-white transition-all">
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

                  {/* Tombol Submit Pendaftaran */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-olive-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
                  >
                    {loading ? (
                      <span>Mendaftarkan Akun...</span>
                    ) : (
                      <>
                        <span>Daftar Akun Baru Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-600">
                    Sudah memiliki akun?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setLoginError(null);
                        setIsNotRegistered(false);
                      }}
                      className="font-bold text-olive-700 hover:underline"
                    >
                      Masuk ke akun sekarang →
                    </button>
                  </div>
                </form>
              )}

              {/* Tautan Khusus Akses Admin di Bagian Bawah */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRoleMode("admin");
                    setLoginError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-olive-700 flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-olive-600" />
                  <span>Masuk sebagai Administrator / Superadmin Desk →</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400">
        TataDana Prime &copy; 2026. Executive Wealth & Cashflow OS. Seluruh hak cipta dilindungi.
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
            <Sparkles className="w-4 h-4 text-olive-600 animate-spin" />
            <span>Memuat Portal TataDana Prime...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
