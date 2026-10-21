"use client";

import { useState } from "react";
import { Transaction } from "@/types";
import { formatRupiah, formatWIBTime } from "@/lib/telegram";
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  Mic,
  MessageSquare,
  Globe,
  Trash2,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  onRefresh?: () => void;
  title?: string;
  limit?: number;
}

export function RecentTransactionsTable({
  transactions,
  onRefresh,
  title = "10 Transaksi Terkini",
  limit = 10,
}: RecentTransactionsTableProps) {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "expense" | "income" | "transfer">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan transaksi ini dari pembukuan? Saldo dompet akan disesuaikan otomatis.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getSourceIcon = (source: Transaction["source"]) => {
    switch (source) {
      case "telegram_receipt":
        return <span title="Vision OCR Struk"><Receipt className="w-3.5 h-3.5 text-purple-600" /></span>;
      case "telegram_voice":
        return <span title="Voice Note Whisper"><Mic className="w-3.5 h-3.5 text-emerald-600" /></span>;
      case "telegram_text":
        return <span title="Teks Telegram AI"><MessageSquare className="w-3.5 h-3.5 text-tangerine-600" /></span>;
      default:
        return <span title="Web Manual"><Globe className="w-3.5 h-3.5 text-slate-400" /></span>;
    }
  };

  let filtered = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchCat = t.categoryName?.toLowerCase().includes(q);
      const matchWallet = t.walletName?.toLowerCase().includes(q);
      if (!matchNote && !matchCat && !matchWallet) return false;
    }
    return true;
  });

  const displayedTxs = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card-luxury overflow-hidden">
      {/* Table Header with Filter Tabs & Live Badge */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-slate-900">{title}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filtered.length} Catatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinkronisasi instan Telegram Ingress & Web Manual (WIB UTC+7)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter Type Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-medium text-slate-600">
            {[
              { id: "all", label: "Semua" },
              { id: "expense", label: "Keluar" },
              { id: "income", label: "Masuk" },
              { id: "transfer", label: "Mutasi" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === tab.id
                    ? "bg-white text-slate-900 font-bold shadow-sm"
                    : "hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 flex items-center gap-1.5 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Tanggal (WIB)</th>
              <th className="py-3 px-4">Kategori & Keterangan</th>
              <th className="py-3 px-4">Dompet</th>
              <th className="py-3 px-4">Kanal</th>
              <th className="py-3 px-4 text-right">Nominal</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {displayedTxs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Belum ada transaksi pada filter ini. Coba ketik di Telegram Sandbox!
                </td>
              </tr>
            ) : (
              displayedTxs.map((tx) => {
                const isExpanded = expandedTxId === tx.id;
                const hasItems = tx.items && tx.items.length > 0;
                const { dateStr, timeStr } = formatWIBTime(new Date(tx.txTimestamp));

                return (
                  <tr
                    key={tx.id}
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => hasItems && toggleExpand(tx.id)}
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{dateStr}</div>
                      <div className="text-[10px] text-slate-400">{timeStr}</div>
                    </td>

                    {/* Category & Note */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                          {tx.categoryEmoji}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {tx.categoryName}
                          </div>
                          <div className="text-slate-500 truncate text-[11px]">
                            {tx.note || "-"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Wallet */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] inline-flex items-center gap-1">
                        👛 {tx.walletName}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-slate-100">{getSourceIcon(tx.source)}</div>
                        <span className="text-[11px] text-slate-600 capitalize">
                          {tx.source.replace("telegram_", "").replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap tabular-nums">
                      <div
                        className={`font-bold text-sm ${
                          tx.type === "expense"
                            ? "text-slate-900"
                            : tx.type === "income"
                            ? "text-emerald-600"
                            : "text-blue-600"
                        }`}
                      >
                        {tx.type === "expense" ? "-" : tx.type === "income" ? "+" : ""}
                        {formatRupiah(tx.amount)}
                      </div>
                      {hasItems && (
                        <div className="text-[10px] text-purple-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                          <Receipt className="w-3 h-3" />
                          <span>{tx.items?.length} item struk</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-slate-400 hover:text-deficit hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Accordion Detail Expanded View for Itemized Receipts */}
      {expandedTxId && (
        <div className="p-4 bg-purple-50/50 border-t border-purple-100 animate-fadeIn">
          {(() => {
            const tx = displayedTxs.find((t) => t.id === expandedTxId);
            if (!tx || !tx.items) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Rincian Multi-Item Struk Belanja ({tx.items.length} Barang/Jasa)
                    </span>
                  </div>
                  {tx.receiptImageUrl && (
                    <a
                      href={tx.receiptImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      <span>Lihat Foto Struk</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-purple-200/80 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-purple-100/60 text-purple-900 font-bold border-b border-purple-200">
                        <th className="py-2 px-3">Nama Barang / Jasa</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Harga Satuan</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {tx.items.map((item) => (
                        <tr key={item.id} className="hover:bg-purple-50/30">
                          <td className="py-2 px-3 font-medium text-slate-800">{item.itemName}</td>
                          <td className="py-2 px-3 text-center text-slate-600 tabular-nums">
                            {item.quantity}x
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                            {formatRupiah(item.unitPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                            {formatRupiah(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
