"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  latencyMs?: number;
  model?: string;
  suggestedFollowups?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-init",
    sender: "ai",
    text: `### 🤖 Halo! Saya TataDana AI Advisor

Saya memantau seluruh arus kas, dompet, dan mutasi Telegram Anda secara real-time. Anda bisa bertanya apa saja mengenai kondisi finansial, evaluasi anggaran, atau rekomendasi alokasi investasi.

Pilih topik cepat di bawah atau ketik pertanyaan langsung:`,
    timestamp: "Baru saja",
    model: "gemini-1.5-pro-wealth",
    latencyMs: 120,
    suggestedFollowups: [
      "🔍 Analisis Kebocoran Kas",
      "📊 Ringkasan Arus Kas Bulan Ini",
      "💡 Rekomendasi Alokasi Investasi",
      "🍽️ Sisa Budget & Pagu Belanja",
    ],
  },
];

const QUICK_PROMPTS = [
  { label: "🔍 Analisis Kebocoran Kas", prompt: "Analisis potensi kebocoran kas terbesar saya dan saran penghematannya" },
  { label: "📊 Ringkasan Arus Kas", prompt: "Bagaimana kondisi arus kas dan surplus likuiditas saya bulan ini?" },
  { label: "💡 Rekomendasi Investasi", prompt: "Beri rekomendasi alokasi investasi dividen dan penguatan modal" },
  { label: "🍽️ Sisa Pagu Budget", prompt: "Berapa sisa pagu anggaran bulan ini dan apakah ada kategori yang boros?" },
];

export function DashboardAIAssistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      const data = await res.json();

      if (data.ok) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.answer,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          latencyMs: data.latencyMs,
          model: data.model,
          suggestedFollowups: data.suggestedFollowups,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: Message = {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `Maaf, terjadi kendala saat menganalisis data keuangan: ${data.error || "Gagal memproses"}. Silakan coba kembali.`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: `Terjadi gangguan koneksi: ${err.message || "Gagal menghubungi server AI"}.`,
        timestamp: "Baru saja",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputQuery("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card-luxury overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-tangerine to-tangerine-600 flex items-center justify-center text-white shadow-tangerine-glow shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white tracking-tight">
                Tanya AI TataDana
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-400/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Multi-AI Engine Online
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Personal Wealth & Financial Intelligence Assistant — Terhubung ke Data Riil Kas Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Percakapan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Buka Panel AI" : "Tutup Panel AI"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-6 space-y-4">
          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Pertanyaan Populer:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-900 text-xs font-semibold transition-all hover:scale-105 active:scale-98 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Conversation Thread Container */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 select-text">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-tangerine to-tangerine-600 text-white font-medium"
                      : "bg-slate-50 border border-slate-200/90 text-slate-800"
                  }`}
                >
                  {/* Message Content */}
                  <div className="prose prose-sm max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Footer metadata */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                      msg.sender === "user"
                        ? "border-white/20 text-white/80"
                        : "border-slate-200/70 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.model && (
                        <span className="font-mono px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-700 text-[9.5px]">
                          {msg.model}
                        </span>
                      )}
                      {msg.latencyMs && (
                        <span className="text-[9.5px] text-emerald-600 font-medium">
                          ⚡ {msg.latencyMs}ms
                        </span>
                      )}
                    </div>

                    {msg.sender === "ai" && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-slate-700 transition-colors flex items-center gap-1"
                        title="Salin jawaban"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Followup suggestions */}
                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedFollowups.map((f, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(f)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-tangerine text-slate-700 hover:text-tangerine text-[11px] font-medium transition-colors flex items-center gap-1"
                        >
                          <span>{f}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-xs justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-tangerine animate-spin" />
                  <span className="font-medium text-xs">
                    Menganalisis mutasi kas & menyusun rekomendasi eksekutif...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-100"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Tanya kondisi kas, sisa anggaran makan, atau saran investasi..."
                disabled={loading}
                className="w-full text-xs px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tangerine/30 focus:border-tangerine font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold shadow-tangerine-glow transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span>Tanya</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
