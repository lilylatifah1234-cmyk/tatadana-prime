"use client";

import { useState } from "react";
import {
  Send,
  Mic,
  Image as ImageIcon,
  X,
  Sparkles,
  Bot,
  User,
  CheckCheck,
  RefreshCw,
  Info,
} from "lucide-react";

interface SandboxMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  isReceipt?: boolean;
  isVoice?: boolean;
}

interface TelegramSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated?: () => void;
}

export function TelegramSandboxModal({
  isOpen,
  onClose,
  onTransactionCreated,
}: TelegramSandboxModalProps) {
  const [messages, setMessages] = useState<SandboxMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `👋 Halo Lily Latifah! Selamat datang di TataDana Prime Bot.
Kirimkan transaksi Anda via teks natural (misal: "makan siang 35k pake bca"), voice note 🎙️, atau foto struk belanja 🧾.
Ketik /bantuan untuk melihat daftar perintah finansial.`,
      time: "11:40",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async (customPayload?: { text?: string; voice?: boolean; photo?: boolean }) => {
    const textToSend = customPayload?.text || inputText;
    if (!textToSend.trim() && !customPayload?.voice && !customPayload?.photo) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Add user message to UI
    let userDisplayMsg = textToSend;
    if (customPayload?.voice) userDisplayMsg = `🎙️ [Voice Note: 14 Detik] "${textToSend}"`;
    if (customPayload?.photo) userDisplayMsg = `🧾 [Foto Struk Belanja Restoran/Supermarket]`;

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: userDisplayMsg,
        time: timeStr,
        isVoice: customPayload?.voice,
        isReceipt: customPayload?.photo,
      },
    ]);

    setInputText("");
    setIsProcessing(true);

    try {
      // Kirim ke endpoint webhook backend
      const res = await fetch("/api/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          update_id: Math.floor(Math.random() * 10000000),
          message: {
            message_id: Math.floor(Math.random() * 10000),
            from: { id: 782194821, is_bot: false, first_name: "Lily" },
            chat: { id: 782194821, type: "private", first_name: "Lily" },
            date: Math.floor(Date.now() / 1000),
            text: customPayload?.photo || customPayload?.voice ? undefined : textToSend,
            caption: customPayload?.photo ? textToSend : undefined,
            photo: customPayload?.photo ? [{ file_id: "photo_test_123", file_unique_id: "u123", width: 800, height: 600 }] : undefined,
            voice: customPayload?.voice ? { file_id: "voice_test_123", duration: 12 } : undefined,
          },
        }),
      });

      const data = await res.json();
      const botReply = data.reply || "Format transaksi berhasil dicatat ke pembukuan utama!";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          time: timeStr,
        },
      ]);

      if (onTransactionCreated) {
        onTransactionCreated();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ Gagal menghubungi server webhook: ${err.message}`,
          time: timeStr,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleShortcuts = [
    { label: "🍽️ Makan Siang 35k BCA", text: "makan siang 35k pake bca" },
    { label: "⛽ Bensin Shell 500rb", text: "bensin shell 500rb bayar gopay" },
    { label: "💼 Gaji Direktur 65jt", text: "gaji direktur 65jt masuk bca" },
    { label: "🔄 Transfer 15jt ke Bibit", text: "transfer 15jt dari bca ke bibit fee 2500" },
    { label: "☕ Kopi Ceban Tunai", text: "kopi senopati ceban tunai" },
    { label: "💰 /saldo", text: "/saldo" },
    { label: "📊 /budget", text: "/budget" },
    { label: "📈 /hari_ini", text: "/hari_ini" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl h-[650px] flex flex-col overflow-hidden">
        {/* Telegram Top Header Bar */}
        <div className="bg-[#17212B] text-white p-3.5 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-tangerine to-tangerine-600 flex items-center justify-center text-white font-bold shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                TataDana Prime Bot
                <span className="text-[10px] bg-tangerine-500/20 text-tangerine-400 px-1.5 py-0.2 rounded font-mono">
                  VERIFIED
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                bot sedang aktif (WIB UTC+7)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-tangerine-50 border-b border-tangerine-100 px-4 py-2 flex items-center justify-between text-xs text-tangerine-900">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-tangerine-600 shrink-0" />
            <span>Interactive Simulator: Transaksi langsung tersinkron ke dashboard real-time!</span>
          </div>
          <button
            onClick={() => setMessages([messages[0]])}
            title="Reset Chat"
            className="text-slate-400 hover:text-slate-700"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Chat History Messages Scroll Area */}
        <div className="flex-1 bg-[#0E1621] p-4 overflow-y-auto space-y-3 font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="w-7 h-7 rounded-full bg-tangerine-600/20 text-tangerine-400 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-tangerine-600 text-white rounded-br-none"
                    : "bg-[#182533] text-slate-100 border border-slate-800 rounded-bl-none font-mono"
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                    m.sender === "user" ? "text-tangerine-200" : "text-slate-400"
                  }`}
                >
                  <span>{m.time}</span>
                  {m.sender === "user" && <CheckCheck className="w-3 h-3 text-white" />}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="w-7 h-7 rounded-full bg-tangerine-500 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-[10px]">
                  N
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic bg-[#182533] p-2.5 rounded-xl w-fit">
              <span className="w-2 h-2 rounded-full bg-tangerine-500 animate-ping" />
              AI sedang memproses input & sinkronisasi ledger...
            </div>
          )}
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="p-2 bg-slate-900 border-t border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
          {sampleShortcuts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage({ text: s.text })}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 transition-colors border border-slate-700 hover:border-tangerine-500"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#17212B] border-t border-slate-800 flex items-center gap-2">
          {/* Action: Send Mock Receipt */}
          <button
            onClick={() => sendMessage({ photo: true, text: "struk dinner plataran menteng" })}
            title="Kirim Foto Struk Belanja Multi-Item"
            className="p-2 text-slate-400 hover:text-tangerine-400 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Action: Send Mock Voice Note */}
          <button
            onClick={() =>
              sendMessage({
                voice: true,
                text: "makan siang meeting di plataran 450 ribu bayar pake bca",
              })
            }
            title="Kirim Voice Note Suara 60 Detik"
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ketik transaksi slang (mis: bensin shell 300rb gopay) atau /saldo..."
            className="flex-1 bg-[#0E1621] text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-tangerine-500"
          />

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            disabled={isProcessing}
            className="p-2.5 bg-tangerine hover:bg-tangerine-600 disabled:opacity-50 text-white rounded-xl shadow-md transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
