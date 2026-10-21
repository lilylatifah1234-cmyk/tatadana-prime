"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { UserProfile, Category } from "@/types";
import {
  User,
  Send,
  Bell,
  Tags,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Camera,
  Upload,
  Crown,
  Copy,
  Check,
  RotateCcw,
  Bot,
  AlertCircle,
  Phone,
  Mail,
  Coins,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "telegram" | "reminders" | "categories">("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState("Lily Latifah");
  const [email, setEmail] = useState("lilylatifah1234@gmail.com");
  const [phone, setPhone] = useState("+6281288991122");
  const [currency, setCurrency] = useState<"IDR" | "USD" | "SGD">("IDR");
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
  );
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Telegram Form State
  const [botToken, setBotToken] = useState("");
  const [webhookInputUrl, setWebhookInputUrl] = useState("");
  const [liveWebhookInfo, setLiveWebhookInfo] = useState<{ url: string; pending: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  // Reminders Form State
  const [morningTime, setMorningTime] = useState("08:30");
  const [eveningTime, setEveningTime] = useState("20:45");
  const [isReminderActive, setIsReminderActive] = useState(true);

  // Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#0284C7");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatCap, setNewCatCap] = useState("5000000");

  const executivePresets = [
    {
      label: "Lily Latifah (Executive Classic)",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80",
    },
    {
      label: "Professional Director",
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=350&q=80",
    },
    {
      label: "Wealth Management Principal",
      url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=350&q=80",
    },
    {
      label: "Fintech Executive",
      url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=350&q=80",
    },
  ];

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.ok && data.data) {
        setProfile(data.data);
        if (data.data.fullName) setFullName(data.data.fullName);
        if (data.data.email) setEmail(data.data.email);
        if (data.data.phoneWhatsapp) setPhone(data.data.phoneWhatsapp);
        if (data.data.defaultCurrency) setCurrency(data.data.defaultCurrency);
        if (data.data.avatarUrl) setAvatarUrl(data.data.avatarUrl);
      }
    } catch (e) {
      console.error("Gagal mengambil data profil:", e);
    }
  };

  const fetchWebhookStatus = async () => {
    try {
      const res = await fetch("/api/telegram/set-webhook");
      const data = await res.json();
      if (data.ok && data.result) {
        setLiveWebhookInfo({
          url: data.result.url || "",
          pending: data.result.pending_update_count || 0,
        });
        if (data.result.url) {
          setWebhookInputUrl(data.result.url.replace(/\/api\/telegram\/webhook$/, ""));
        }
      }
    } catch (e) {
      console.error("Gagal memeriksa status webhook:", e);
    }
  };

  const fetchData = async () => {
    try {
      const cRes = await fetch("/api/categories");
      const cData = await cRes.json();
      if (cData.ok) setCategories(cData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchData();
    fetchWebhookStatus();
    setBotToken("8862445821:AAG9rzRPLPxeFD7K4tlfVx43LDXM4STJORI");
  }, []);

  // Process image file for local gallery upload & base64 conversion
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setProfileMessage({
        type: "error",
        text: "File harus berupa format gambar (JPEG, PNG, WebP, GIF).",
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setProfileMessage({
        type: "error",
        text: "Gagal membaca file dari galeri perangkat.",
      });
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setProfileMessage({
          type: "error",
          text: "Format gambar tidak didukung atau file gambar rusak.",
        });
      };
      img.onload = () => {
        // High quality downscaling (max 600px dimension) for instant storage and crisp retina preview
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill background white so transparent PNG/icons do not turn black on JPEG conversion
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const base64Data = canvas.toDataURL("image/jpeg", 0.88);
          setAvatarUrl(base64Data);
          setAvatarImgError(false);
          setProfileMessage({
            type: "info",
            text: "Foto dari galeri siap digunakan. Klik 'Simpan Perubahan Profil' untuk menyimpan permanen.",
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Save profile changes to backend persistent store
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneWhatsapp: phone,
          defaultCurrency: currency,
          avatarUrl,
          role: "admin",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setProfile(data.data);
        setAvatarImgError(false);
        try {
          localStorage.setItem("tatadana-profile", JSON.stringify(data.data));
        } catch {}
        setProfileMessage({
          type: "success",
          text: "✅ Foto & profil eksekutif berhasil disimpan ke database lokal (data/tatadana-store.json)!",
        });
        // Real-time broadcast to Sidebar and other components
        window.dispatchEvent(
          new CustomEvent("tatadana-profile-updated", { detail: data.data })
        );
      } else {
        setProfileMessage({
          type: "error",
          text: `❌ Gagal menyimpan profil: ${data.error || "Terjadi kendala"}`,
        });
      }
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: `❌ Terjadi kesalahan: ${err.message}`,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleVerifyTelegram = async (customUrl?: string) => {
    if (!botToken.trim()) {
      alert("Masukkan token bot Telegram dari @BotFather");
      return;
    }

    setIsVerifying(true);
    setVerifyStatus("⏳ Menghubungkan ke Telegram Bot API...");

    try {
      const res = await fetch("/api/telegram/set-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: botToken,
          webhookUrl: typeof customUrl === "string" ? customUrl : webhookInputUrl || undefined,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setVerifyStatus(data.message || `✅ Berhasil! Bot @${data.botUsername} telah ditautkan.`);
        fetchWebhookStatus();
      } else {
        setVerifyStatus(`❌ Gagal: ${data.message}`);
      }
    } catch (err: any) {
      setVerifyStatus(`❌ Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName,
          type: newCatType,
          iconEmoji: newCatEmoji,
          colorHex: newCatColor,
          monthlyBudgetCap: parseFloat(newCatCap) || 0,
        }),
      });
      setNewCatName("");
      fetchData();
    } catch (err) {
      alert("Gagal menambah kategori");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      alert("Gagal menghapus kategori");
    }
  };

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
              Pengaturan Akun & Integrasi Sistem
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola profil eksekutif, foto profil galeri, token bot Telegram (@lilybhotom_bot), dan master kategori.
            </p>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-6">
          {/* Settings Tabs */}
          <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
            {[
              { id: "profile", label: "Profil & Identitas", icon: User },
              { id: "telegram", label: "Bot Telegram", icon: Send },
              { id: "reminders", label: "Pengingat Terjadwal", icon: Bell },
              { id: "categories", label: "Master Kategori", icon: Tags },
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

          {/* TAB 1: PROFIL & FOTO EKSEKUTIF */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Ultra-Premium Hero Profile Card */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-tangerine/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Large Avatar with Gallery Upload Overlay */}
                  <div className="relative group shrink-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingImage(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingImage(false);
                      }}
                      onDrop={handleDropImage}
                      title="Klik atau geser foto dari galeri lokal ke sini"
                      className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ${
                        isDraggingImage ? "ring-emerald-400 scale-105" : "ring-amber-400/80"
                      } shadow-2xl overflow-hidden relative cursor-pointer bg-slate-800 transition-all group-hover:scale-105`}
                    >
                      {avatarUrl && !avatarImgError ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          onError={() => setAvatarImgError(true)}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-tangerine to-tangerine-600 text-3xl font-bold text-white">
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 text-white p-2 text-center backdrop-blur-[2px]">
                        <Camera className="w-6 h-6 mb-1 text-amber-300" />
                        <span className="text-[10px] font-bold tracking-tight">
                          {isDraggingImage ? "Lepaskan Foto di Sini" : "Ubah dari Galeri"}
                        </span>
                      </div>
                    </div>

                    {/* Floating Camera Button on bottom edge */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Unggah Foto dari Galeri"
                      className="absolute bottom-0 right-0 p-2.5 rounded-full bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white shadow-lg border-2 border-slate-900 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Profile Header Metadata */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                        {fullName}
                      </h2>
                      {/* Luxury Badge: PRO VIP / Admin */}
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-tangerine-500/20 to-amber-600/20 border border-amber-400/50 text-amber-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>PRO VIP / Admin</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono flex items-center justify-center sm:justify-start gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{email}</span>
                      <span className="text-emerald-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        ● Akun Terverifikasi
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{phone}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>Mata Uang: {currency}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        <Bot className="w-3 h-3 text-sky-400" />
                        <span>Telegram: @lilybhotom_bot</span>
                      </span>
                    </div>

                    {/* Quick photo upload button */}
                    <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>Unggah Foto dari Galeri (PC / Ponsel)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl(
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                          );
                          setProfileMessage({
                            type: "info",
                            text: "Foto dikembalikan ke default Lily Latifah. Klik 'Simpan Perubahan Profil' untuk mengonfirmasi.",
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-400" />
                        <span>Reset Foto</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Avatars for Quick Customization */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 relative z-10">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilihan Avatar Eksekutif Eksklusif:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {executivePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          setProfileMessage({
                            type: "info",
                            text: `Avatar "${preset.label}" dipilih. Klik 'Simpan Perubahan Profil' di bawah untuk menerapkan.`,
                          });
                        }}
                        className={`p-2 rounded-xl flex items-center gap-2.5 text-left transition-all border ${
                          avatarUrl === preset.url
                            ? "bg-amber-500/20 border-amber-400 text-white shadow-sm"
                            : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-300"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/30"
                        />
                        <span className="text-[11px] font-semibold truncate leading-tight">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Message Toast */}
              {profileMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border shadow-sm ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : profileMessage.type === "info"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-red-50 text-red-900 border-red-200"
                  }`}
                >
                  {profileMessage.type === "success" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {profileMessage.type === "info" && (
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  {profileMessage.type === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="flex-1">{profileMessage.text}</span>
                </div>
              )}

              {/* Form Details Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-card-luxury space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Rincian Identitas & Preferensi Akun
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Data ini otomatis digunakan oleh asisten bot Telegram (@lilybhotom_bot) saat menyapa dan mencatat mutasi keuangan.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    ID: usr-lily-001
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap Eksekutif
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Lily Latifah"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Alamat Email Utama (Kredensial Login)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={email}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Primary
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nomor WhatsApp (Format E.164)
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+6281288991122"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mata Uang Utama Pelaporan
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-medium bg-white"
                      >
                        <option value="IDR">IDR — Indonesian Rupiah (Rp)</option>
                        <option value="USD">USD — United States Dollar ($)</option>
                        <option value="SGD">SGD — Singapore Dollar (S$)</option>
                      </select>
                    </div>
                  </div>

                  {/* Telegram Sync Status & Security Notice */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Koneksi Telegram Terintegrasi</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        Chat ID: 782194821
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Setiap foto profil dan data yang Anda simpan di sini akan secara persisten tersimpan di database lokal <code>data/tatadana-store.json</code> dan langsung terpancar di bilah navigasi (Sidebar).
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold rounded-xl shadow-tangerine-glow transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyimpan ke Database...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Simpan Perubahan Profil</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: TELEGRAM BOT */}
          {activeTab === "telegram" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Bot Status Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-tangerine to-tangerine-600 flex items-center justify-center text-white shadow-tangerine-glow">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900">
                        Status Koneksi Telegram Bot
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700">
                          Online & Tersambung ke Ingress Webhook
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSandboxOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Buka Sandbox Chat
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bot Username:</span>
                    <span className="font-bold text-slate-900 font-mono">@lilybhotom_bot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Webhook Target:</span>
                    <span className="font-mono text-slate-700">/api/telegram/webhook (HTTPS Ingress)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enkripsi Token:</span>
                    <span className="font-semibold text-emerald-600">AES-256-GCM Master Security Active</span>
                  </div>
                </div>
              </div>

              {/* BotFather Interactive Guide & Input */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
                <h3 className="font-display font-bold text-base text-slate-900 mb-2">
                  Tautkan Bot Telegram Pribadi via BotFather
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Ikuti 3 langkah cepat di bawah ini untuk membuat dan menautkan bot Telegram Anda sendiri:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-tangerine-600">Langkah 1:</span>
                    <p className="text-slate-600 mt-1">
                      Buka Telegram dan cari <strong>@BotFather</strong>, lalu kirim perintah <code>/newbot</code>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-tangerine-600">Langkah 2:</span>
                    <p className="text-slate-600 mt-1">
                      Beri nama bot Anda (misal: <em>TataDanaLilyBot</em>) dan salin <strong>API Token</strong> yang diberikan.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-tangerine-600">Langkah 3:</span>
                    <p className="text-slate-600 mt-1">
                      Tempelkan token pada kolom di bawah dan klik <strong>"Uji & Tautkan Koneksi"</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Telegram Bot API Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="Contoh: 7182938192:AAH9fklwe923kjlsf908..."
                      className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-mono"
                    />
                    <button
                      onClick={() => handleVerifyTelegram()}
                      disabled={isVerifying}
                      className="px-5 py-2.5 bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold rounded-xl shadow-tangerine-glow transition-all whitespace-nowrap"
                    >
                      {isVerifying ? "⏳ Memverifikasi..." : "Uji & Tautkan Koneksi"}
                    </button>
                  </div>

                  {verifyStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        verifyStatus.includes("✅")
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {verifyStatus}
                    </div>
                  )}

                  {/* Section Webhook ngrok / Cloudflare HTTPS */}
                  <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Domain Webhook Publik (ngrok / Cloudflare HTTPS)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Jalankan <code>ngrok http 3000</code> di terminal, lalu tempelkan URL HTTPS yang muncul ke kolom di bawah:
                        </p>
                      </div>
                      {liveWebhookInfo?.url ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 self-start sm:self-auto">
                          ● Webhook Terdaftar di Telegram
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0 self-start sm:self-auto">
                          ○ Belum Ada Webhook Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={webhookInputUrl}
                        onChange={(e) => setWebhookInputUrl(e.target.value)}
                        placeholder="Contoh: https://a1b2-c3d4-e5f6.ngrok-free.app"
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-tangerine font-mono"
                      />
                      <button
                        onClick={() => handleVerifyTelegram(webhookInputUrl)}
                        disabled={isVerifying || !webhookInputUrl}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
                      >
                        {isVerifying ? "⏳ Memasang..." : "🚀 Pasang Webhook"}
                      </button>
                    </div>

                    {liveWebhookInfo && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
                        <span className="truncate">
                          <strong>Target URL Terdaftar:</strong>{" "}
                          <span className="font-mono text-slate-800">
                            {liveWebhookInfo.url || "Belum ada (Gunakan ngrok atau buka /dashboard)"}
                          </span>
                        </span>
                        <span className="shrink-0 text-slate-500">
                          Antrean Pesan Menunggu: <strong>{liveWebhookInfo.pending}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REMINDERS */}
          {activeTab === "reminders" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Konfigurasi Pengingat Cerdas (Scheduled Reminders)
                </h3>
                <p className="text-xs text-slate-500">
                  Pengingat otomatis terkirim langsung ke Telegram (maksimal 2x per hari pada jam WIB pilihan Anda).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-slate-800">
                    <Clock className="w-4 h-4 text-tangerine-600" />
                    <span>Pengingat Pagi (Start of Day)</span>
                  </div>
                  <input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 w-full"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    Review alokasi harian & cek sisa limit budget sebelum aktivitas dimulai.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs text-slate-800">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Pengingat Malam (Tutup Buku Kas)</span>
                  </div>
                  <input
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    className="text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 w-full"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    Mendorong pencatatan pengeluaran kecil sebelum tidur agar tidak terjadi blind spot kas.
                  </p>
                </div>
              </div>

              {/* Preview Message */}
              <div className="p-4 rounded-xl bg-[#182533] text-slate-200 border border-slate-700 font-mono text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-tangerine-400">
                  Pratinjau Pesan Bot Telegram:
                </span>
                <p>
                  "🌙 Selamat malam Lily Latifah! Jangan lupa catat pengeluaran hari ini sebelum tutup buku kas.
                  Ketik 'makan malam 120k bca' atau kirimkan foto struk belanja kamu sekarang!"
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => alert("Jadwal pengingat berhasil disimpan")}
                  className="px-5 py-2.5 bg-tangerine hover:bg-tangerine-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Jadwal Pengingat
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MASTER KATEGORI */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
                <h3 className="font-display font-bold text-base text-slate-900 mb-3">
                  Tambah Kategori Baru
                </h3>
                <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={newCatEmoji}
                      onChange={(e) => setNewCatEmoji(e.target.value)}
                      className="w-full text-center text-base p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Nama Kategori
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Misal: Hobi & Golf"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Tipe
                    </label>
                    <select
                      value={newCatType}
                      onChange={(e) => setNewCatType(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    >
                      <option value="expense">Pengeluaran</option>
                      <option value="income">Pemasukan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Plafon (Rp)
                    </label>
                    <input
                      type="text"
                      value={newCatCap}
                      onChange={(e) => setNewCatCap(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-5 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-tangerine hover:bg-tangerine-600 text-white text-xs font-bold rounded-xl shadow-md"
                    >
                      Tambah Kategori
                    </button>
                  </div>
                </form>
              </div>

              {/* Category List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
                <h3 className="font-display font-bold text-base text-slate-900 mb-4">
                  Daftar Kategori Aktif ({categories.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                          {c.iconEmoji}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {c.type === "expense" ? "Pengeluaran" : "Pemasukan"} · Plafon: Rp{" "}
                            {c.monthlyBudgetCap.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 text-slate-400 hover:text-deficit hover:bg-red-50 rounded-lg"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
