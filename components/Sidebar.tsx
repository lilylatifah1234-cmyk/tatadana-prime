"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  PieChart,
  WalletCards,
  Settings,
  ShieldCheck,
  Send,
  LogOut,
  ChevronRight,
  Sparkles,
  Globe,
  Bot,
  Copy,
  Check,
  ExternalLink,
  Cloud,
} from "lucide-react";
import { UserProfile, Subscription } from "@/types";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";

interface SidebarProps {
  onOpenSandbox?: () => void;
  profile?: UserProfile | null;
}

export function Sidebar({ onOpenSandbox, profile: propProfile }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(propProfile || null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [copiedBot, setCopiedBot] = useState(false);
  const [internalSandboxOpen, setInternalSandboxOpen] = useState(false);

  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
    }
  }, [propProfile]);

  const loadProfile = () => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (data.data) {
            setProfile(data.data);
            setAvatarFailed(false);
          }
          if (data.subscription) setSubscription(data.subscription);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdated = (event: any) => {
      setAvatarFailed(false);
      if (event?.detail) {
        setProfile((prev) => ({ ...(prev || {}), ...event.detail }));
      } else {
        loadProfile();
      }
    };

    window.addEventListener("tatadana-profile-updated", handleProfileUpdated);
    window.addEventListener("storage", loadProfile);

    return () => {
      window.removeEventListener("tatadana-profile-updated", handleProfileUpdated);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch {}
  };

  const handleCopyBot = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const botTag = "@lilybhotom_bot";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(botTag).catch(() => {
          fallbackCopy(botTag);
        });
      } else {
        fallbackCopy(botTag);
      }
    } catch {
      fallbackCopy(botTag);
    }
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  const handleOpenSandbox = () => {
    if (onOpenSandbox) {
      onOpenSandbox();
    } else {
      setInternalSandboxOpen(true);
    }
  };

  const isAdmin = profile?.role === "superadmin" || profile?.role === "admin";

  const navigation = [
    { name: "Beranda Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi & Mutasi", href: "/transactions", icon: ReceiptText },
    { name: "Laporan Eksekutif", href: "/reports", icon: BarChart3 },
    { name: "Alokasi Budget", href: "/budgets", icon: PieChart },
    { name: "Multi-Wallet", href: "/wallets", icon: WalletCards },
    { name: "Review & Deploy Vercel", href: "/reports?tab=vercel", icon: Cloud, isVercel: true },
    ...(isAdmin
      ? [{ name: "Superadmin Desk", href: "/admin", icon: ShieldCheck, isSuperadmin: true }]
      : []),
    { name: "Pengaturan Akun", href: "/settings", icon: Settings },
    { name: "Landing Page", href: "/", icon: Globe },
  ];

  const displayName = profile?.fullName || "Lily Latifah";
  const displayEmail = profile?.email || "lilylatifah1234@gmail.com";
  const initial = displayName.charAt(0).toUpperCase() || "L";
  const planLabel = subscription?.planType === "lifetime" ? "LIFETIME VIP" : "PRO VIP";
  const roleLabel = profile?.role ? profile.role.toUpperCase() : "SUPERADMIN";

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 shadow-sm">
        {/* Brand Header — Aksen Warna Olive Eksekutif */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-olive-600 to-olive-700 flex items-center justify-center text-white shadow-md shadow-olive-600/30 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-olive-100" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                TataDana
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-olive-100 text-olive-800 border border-olive-200 tracking-wider">
                  Prime
                </span>
              </div>
              <p className="text-[11px] text-olive-800/70 font-semibold">Executive Wealth OS</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links — Tema Warna Olive */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-olive-800/70 uppercase tracking-wider">
            Menu TataDana
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.isVercel && pathname === "/reports" && typeof window !== "undefined" && window.location.search.includes("tab=vercel"));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-olive-50 text-olive-900 font-bold border-l-4 border-olive-600 pl-3 shadow-sm"
                    : "text-slate-600 hover:text-olive-900 hover:bg-olive-50/70"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-olive-700" : "text-slate-400 group-hover:text-olive-600"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-olive-600" />}
                {item.isVercel && !isActive && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-olive-100 text-olive-800 border border-olive-200 uppercase">
                    24/7
                  </span>
                )}
              </Link>
            );
          })}

          {/* Panel Khusus Bot Telegram (Enriched Panel) */}
          <div className="pt-4 px-1">
            <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3.5 border border-slate-800 shadow-luxury text-white relative overflow-hidden group">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-olive-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

              {/* Bot Header & Live Status */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Send className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">Bot Finansial</span>
                </div>
                {/* Status Live Real-Time */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>● Bot Online WIB</span>
                </div>
              </div>

              {/* Username Bot with Quick Copy */}
              <div className="mb-2.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Bot className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-mono text-[11px] font-bold text-slate-100 truncate">
                    @lilybhotom_bot
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBot}
                  title="Salin username bot"
                  className="px-2 py-1 rounded-lg bg-slate-700/90 hover:bg-slate-700 text-[10px] font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1 shrink-0 active:scale-95 border border-slate-600/50"
                >
                  {copiedBot ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-300" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Chat Telegram & Simulator */}
              <div className="space-y-1.5 relative z-10">
                <a
                  href="https://t.me/lilybhotom_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-[11px] font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 group/btn"
                >
                  <Send className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                  <span>Buka Chat Telegram</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70 ml-0.5" />
                </a>

                <button
                  type="button"
                  onClick={handleOpenSandbox}
                  className="w-full py-2 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <Sparkles className="w-3 h-3 text-tangerine-400" />
                  <span>Uji Sandbox Simulator</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Starter Plan Upgrade Box (Sesuai Foto User) */}
        {(!subscription || subscription.planType === "starter") && (
          <div className="mx-3 mb-2 p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold text-slate-800">Paket Anda</span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">
                STARTER
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-tight">
              Upgrade ke Pro untuk unlimited transaksi & OCR struk
            </p>
            <button
              type="button"
              onClick={() =>
                alert("Fitur Upgrade Pro: Silakan hubungi Administrator (Lily Latifah) untuk aktivasi lisensi PRO VIP.")
              }
              className="w-full mt-2 py-1.5 px-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-[10.5px] rounded-xl shadow-sm transition-all"
            >
              ⚡ Upgrade Pro Rp99rb
            </button>
          </div>
        )}

        {/* User Footer & Plan Status with Dynamic Avatar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
              isAdmin ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              {roleLabel}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {planLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {/* Dynamic Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-olive-600 to-olive-700 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-olive-400/80 overflow-hidden shrink-0 relative bg-slate-100">
              {profile?.avatarUrl && !avatarFailed ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{displayEmail}</p>
            </div>
            <Link
              href="/login"
              title="Keluar / Ganti Akun"
              className="p-1.5 text-slate-400 hover:text-deficit hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Internal Sandbox modal fallback if page doesn't have its own */}
      {!onOpenSandbox && (
        <TelegramSandboxModal
          isOpen={internalSandboxOpen}
          onClose={() => setInternalSandboxOpen(false)}
        />
      )}
    </>
  );
}
