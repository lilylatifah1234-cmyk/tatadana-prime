"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  Send,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogOut,
} from "lucide-react";

function PendingApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "budi.santoso@tatadana.id";
  const nameParam = searchParams.get("name") || "Budi Santoso";

  const [email, setEmail] = useState(emailParam);
  const [userName, setUserName] = useState(nameParam);
  const [checking, setChecking] = useState(false);
  const [otpInput, setOtpInput] = useState("123454");
  const [otpError, setOtpError] = useState<string | null>(
    "Kode OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta kode baru."
  );
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Cek status persetujuan dari server
  const checkStatus = async () => {
    try {
      setChecking(true);
      const res = await fetch(`/api/auth/approval-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.ok && data.user) {
        if (data.user.approvalStatus === "approved") {
          setOtpSuccess("Akun Anda telah disetujui oleh Administrator! Mengalihkan ke Dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Polling berkala setiap 5 detik
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [email]);

  // Handler Verifikasi Kode OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otpInput.trim(),
          email,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setOtpSuccess(data.message || "Verifikasi OTP berhasil! Mengalihkan...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        setOtpError(
          data.error || "Kode OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta kode baru."
        );
      }
    } catch (err: any) {
      setOtpError("Terjadi gangguan koneksi verifikasi OTP.");
    } finally {
      setVerifying(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Halo Administrator Lily Latifah, akun saya (${userName} - ${email}) telah tercatat di Admin Panel TataDana. Mohon izin dan verifikasi akses ke akun saya. Terima kasih!`
  );

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

        <Link
          href="/login"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Kembali ke Login</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-4">
          
          {/* Subtitle Deskripsi Kebijakan Keamanan */}
          <p className="text-center text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Akun Anda telah tercatat di Admin Panel TataDana. Sesuai kebijakan keamanan, silakan hubungi Administrator (Lily Latifah) untuk mendapatkan izin/verifikasi.
          </p>

          {/* Kotak Notifikasi Merah / Pink: Kode OTP tidak ditemukan */}
          {otpError && (
            <div className="p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-xs font-medium leading-relaxed shadow-sm animate-fadeIn">
              {otpError}
            </div>
          )}

          {/* Notifikasi Hijau jika Berhasil Verifikasi */}
          {otpSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed shadow-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{otpSuccess}</span>
            </div>
          )}

          {/* Kartu Informasi Admin & Tombol Izin */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-sm">
            {/* Baris 1: Admin TataDana */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500 font-medium">Admin TataDana:</span>
              <span className="font-bold text-slate-900 text-sm">Lily Latifah</span>
            </div>

            <div className="border-t border-slate-100" />

            {/* Baris 2: Nomor WhatsApp Admin */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500 font-medium">Nomor WhatsApp Admin:</span>
              <span className="font-bold text-[#059669] font-mono text-sm">082116696646</span>
            </div>

            <div className="border-t border-slate-100" />

            {/* Tombol Hijau: Kirim Izin ke WhatsApp Admin */}
            <a
              href={`https://wa.me/6282116696646?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim Izin ke WhatsApp Admin (082116696646)</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>

            {/* Tombol Biru: Izin via Telegram (@lilybhotom_bot) */}
            <a
              href="https://t.me/lilybhotom_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Izin via Telegram (@lilybhotom_bot)</span>
            </a>
          </div>

          {/* Tombol Oranye: Saya Sudah Chat Admin — Cek Status Izin */}
          <button
            type="button"
            onClick={checkStatus}
            disabled={checking}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Memeriksa Status..." : "Saya Sudah Chat Admin — Cek Status Izin"}</span>
          </button>

          {/* Form Verifikasi OTP di Bagian Bawah */}
          <div className="space-y-2 pt-2">
            <p className="text-center text-xs text-slate-500">
              Atau jika admin telah memberikan kode verifikasi OTP (kode pengujian demo:{" "}
              <strong className="text-slate-900 font-bold">123456</strong>):
            </p>

            <form onSubmit={handleVerifyOtp} className="flex items-center gap-2">
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                className="flex-1 text-center font-mono font-bold tracking-widest text-sm py-3 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-slate-800"
              />

              <button
                type="submit"
                disabled={verifying}
                className="py-3 px-6 rounded-xl bg-[#111827] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 disabled:opacity-60 shrink-0"
              >
                {verifying ? "Memproses..." : "Verifikasi"}
              </button>
            </form>
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

export default function PendingApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
            <span>Memuat Layar Verifikasi TataDana...</span>
          </div>
        </div>
      }
    >
      <PendingApprovalContent />
    </Suspense>
  );
}
