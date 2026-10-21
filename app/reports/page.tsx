"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TelegramSandboxModal } from "@/components/TelegramSandboxModal";
import { FinancialCalendar } from "@/components/FinancialCalendar";
import { NewTransactionModal } from "@/components/NewTransactionModal";
import { formatRupiah, formatWIBTime } from "@/lib/telegram";
import { Transaction, Wallet, Category } from "@/types";
import { VercelDeploymentPanel } from "@/components/VercelDeploymentPanel";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowUpDown,
  Cloud,
  Terminal,
  Check,
  Copy,
  Code,
} from "lucide-react";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWallet, setSelectedWallet] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Export State
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);
  const [exportHistory, setExportHistory] = useState<
    Array<{ fileName: string; format: string; size: string; time: string; signedUrl: string }>
  >([
    {
      fileName: "TataDana_Executive_Report_2026-10.xlsx",
      format: "EXCEL",
      size: "34.8 KB",
      time: "Hari ini, 11:20 WIB",
      signedUrl: "/api/reports/download?token=demo&file=TataDana_Report.xlsx",
    },
  ]);

  // Expanded Accordion
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState<"calendar" | "table" | "vercel">("calendar");
  const [copiedVercel, setCopiedVercel] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, wRes, cRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/wallets"),
        fetch("/api/categories"),
      ]);

      const tData = await tRes.json();
      const wData = await wRes.json();
      const cData = await cRes.json();

      if (tData.ok) setTransactions(tData.data);
      if (wData.ok) setWallets(wData.data);
      if (cData.ok) setCategories(cData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "vercel") {
        setActiveReportTab("vercel");
      }
    }
  }, []);

  // Filter & Sort
  const filtered = transactions.filter((t) => {
    if (selectedType !== "all" && t.type !== selectedType) return false;
    if (selectedCategory !== "all" && t.categoryId !== selectedCategory) return false;
    if (selectedWallet !== "all" && t.walletId !== selectedWallet && t.toWalletId !== selectedWallet) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchCat = t.categoryName?.toLowerCase().includes(q);
      const matchWallet = t.walletName?.toLowerCase().includes(q);
      const matchItems = t.items?.some((i) => i.itemName.toLowerCase().includes(q));
      if (!matchNote && !matchCat && !matchWallet && !matchItems) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortField === "date") {
      const timeA = new Date(a.txTimestamp).getTime();
      const timeB = new Date(b.txTimestamp).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    } else {
      return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    }
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Financial summary
  const totalInflow = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOutflow = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netDelta = totalInflow - totalOutflow;
  const savingsRatio = totalInflow > 0 ? Math.round((netDelta / totalInflow) * 100) : 0;

  // Top 5 Expenses
  const categoryExpenses: Record<string, { name: string; emoji: string; amount: number }> = {};
  filtered
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!categoryExpenses[t.categoryId]) {
        categoryExpenses[t.categoryId] = {
          name: t.categoryName,
          emoji: t.categoryEmoji,
          amount: 0,
        };
      }
      categoryExpenses[t.categoryId].amount += t.amount;
    });
  const topExpenses = Object.values(categoryExpenses)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleExport = async (format: "excel" | "pdf") => {
    setIsExporting(format);
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, month: "2026-10" }),
      });
      const data = await res.json();
      if (data.ok) {
        setExportHistory((prev) => [
          {
            fileName: data.fileName,
            format: format.toUpperCase(),
            size: data.fileSize,
            time: "Baru saja",
            signedUrl: data.signedUrl,
          },
          ...prev,
        ]);

        // Auto trigger download
        window.open(data.signedUrl, "_blank");
      }
    } catch (err: any) {
      alert(`Gagal mengekspor laporan: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar onOpenSandbox={() => setIsSandboxOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Pusat Laporan & Pembukuan Eksekutif
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                Buku Kas Q4 2026
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                PRO VIP UNLOCKED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar pelaporan formal perbankan Asia Tenggara dengan export on-demand.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleExport("excel")}
              disabled={isExporting !== null}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExporting === "excel" ? "Menyusun .xlsx..." : "Ekspor Excel (.xlsx)"}</span>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting !== null}
              className="px-4 py-2 rounded-xl bg-olive-600 hover:bg-olive-700 text-white text-xs font-bold shadow-md shadow-olive-600/30 transition-all flex items-center gap-2 hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span>{isExporting === "pdf" ? "Menyusun PDF..." : "Ekspor Koding & Blueprint Vercel (PDF)"}</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Segmented Mode Tab Switcher: Kalender vs Tabel vs Vercel Review */}
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-300/80 w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setActiveReportTab("calendar")}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeReportTab === "calendar"
                  ? "bg-white text-slate-900 shadow-md border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeReportTab === "calendar" ? "text-sky-600" : "text-slate-500"}`} />
              <span>Kalender Kas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab("table")}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeReportTab === "table"
                  ? "bg-white text-slate-900 shadow-md border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeReportTab === "table" ? "text-emerald-600" : "text-slate-500"}`} />
              <span>Jurnal Mutasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab("vercel")}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeReportTab === "vercel"
                  ? "bg-olive-600 text-white shadow-md shadow-olive-600/30"
                  : "text-slate-700 hover:text-olive-900"
              }`}
            >
              <Cloud className={`w-4 h-4 ${activeReportTab === "vercel" ? "text-white" : "text-olive-600"}`} />
              <span>Tinjau Koding & Publikasi Vercel</span>
              <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                activeReportTab === "vercel" ? "bg-olive-700 text-olive-100" : "bg-olive-100 text-olive-800"
              }`}>
                Online 24/7
              </span>
            </button>
          </div>

          {activeReportTab === "calendar" ? (
            <FinancialCalendar
              transactions={transactions}
              onOpenNewTx={() => setIsNewTxOpen(true)}
              onOpenSandbox={() => setIsSandboxOpen(true)}
            />
          ) : activeReportTab === "table" ? (
            <>
              {/* Ringkasan Eksekutif Top Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Inflow Terfilter
              </span>
              <div className="font-display font-bold text-xl text-emerald-600 mt-1 tabular-nums">
                +{formatRupiah(totalInflow)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Pemasukan periode terpilih</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Outflow Terfilter
              </span>
              <div className="font-display font-bold text-xl text-deficit mt-1 tabular-nums">
                -{formatRupiah(totalOutflow)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Pengeluaran periode terpilih</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Net Cashflow Delta
              </span>
              <div
                className={`font-display font-bold text-xl mt-1 tabular-nums ${
                  netDelta >= 0 ? "text-emerald-700" : "text-deficit"
                }`}
              >
                {netDelta >= 0 ? "+" : ""}
                {formatRupiah(netDelta)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {netDelta >= 0 ? "Surplus Likuiditas Bersih" : "Defisit Kas Terdeteksi"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Rasio Tabungan / Investasi
              </span>
              <div className="font-display font-bold text-xl text-slate-900 mt-1 tabular-nums">
                {savingsRatio}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.max(0, Math.min(savingsRatio, 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top 5 Expenses Strip */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card-luxury">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Top 5 Expense Categories (Oktober 2026)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {topExpenses.map((exp, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                    <span>{exp.emoji}</span>
                    <span className="truncate">{exp.name}</span>
                  </div>
                  <div className="font-display font-bold text-sm text-slate-900 mt-1.5 tabular-nums">
                    {formatRupiah(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Data Grid & Advanced Filtering */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card-luxury overflow-hidden">
            <div className="p-5 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Data Grid Pembukuan ({filtered.length} Rekaman)
                </h3>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari transaksi, struk, atau toko..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-tangerine"
                  />
                </div>
              </div>

              {/* Filters Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-700"
                >
                  <option value="all">Semua Jenis Transaksi</option>
                  <option value="expense">Hanya Pengeluaran</option>
                  <option value="income">Hanya Pemasukan</option>
                  <option value="transfer">Hanya Transfer</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-700"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.iconEmoji} {c.name}
                    </option>
                  ))}
                </select>

                {/* Wallet Filter */}
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-700"
                >
                  <option value="all">Semua Dompet / Rekening</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      👛 {w.name}
                    </option>
                  ))}
                </select>

                {/* Sort Toggle */}
                <button
                  onClick={() => {
                    if (sortField === "date") {
                      if (sortOrder === "desc") setSortOrder("asc");
                      else {
                        setSortField("amount");
                        setSortOrder("desc");
                      }
                    } else {
                      if (sortOrder === "desc") setSortOrder("asc");
                      else {
                        setSortField("date");
                        setSortOrder("desc");
                      }
                    }
                  }}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700 flex items-center justify-between"
                >
                  <span>
                    Urut: {sortField === "date" ? "Tanggal" : "Nominal"} (
                    {sortOrder === "desc" ? "Tinggi/Baru" : "Rendah/Lama"})
                  </span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Tanggal (WIB)</th>
                    <th className="py-3 px-4">Kategori & Catatan</th>
                    <th className="py-3 px-4">Dompet Asal</th>
                    <th className="py-3 px-4">Kanal Input</th>
                    <th className="py-3 px-4 text-right">Nominal (IDR)</th>
                    <th className="py-3 px-4 text-center">Rincian Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ada transaksi yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((tx) => {
                      const isExpanded = expandedId === tx.id;
                      const hasItems = tx.items && tx.items.length > 0;
                      const { dateStr, timeStr } = formatWIBTime(new Date(tx.txTimestamp));

                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => hasItems && setExpandedId(isExpanded ? null : tx.id)}
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{dateStr}</div>
                            <div className="text-[10px] text-slate-400">{timeStr}</div>
                          </td>

                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-base shrink-0">{tx.categoryEmoji}</span>
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

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              👛 {tx.walletName}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 capitalize">
                            {tx.source.replace("telegram_", "").replace("_", " ")}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap tabular-nums">
                            <span
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
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {hasItems ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(isExpanded ? null : tx.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] inline-flex items-center gap-1"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>{tx.items?.length} Item</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-300 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Accordion Detail */}
            {expandedId && (
              <div className="p-4 bg-purple-50/60 border-t border-purple-100">
                {(() => {
                  const tx = transactions.find((t) => t.id === expandedId);
                  if (!tx || !tx.items) return null;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 uppercase">
                          🧾 Rincian Item Belanja — {tx.note}
                        </span>
                        {tx.receiptImageUrl && (
                          <a
                            href={tx.receiptImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
                          >
                            <span>Buka Foto Struk Fisik</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="bg-white rounded-xl border border-purple-200 overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-purple-100/50 text-purple-950 font-bold">
                              <th className="py-2 px-3">Item</th>
                              <th className="py-2 px-3 text-center">Kuantitas</th>
                              <th className="py-2 px-3 text-right">Harga Satuan</th>
                              <th className="py-2 px-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-100">
                            {tx.items.map((it) => (
                              <tr key={it.id}>
                                <td className="py-2 px-3 text-slate-800 font-medium">{it.itemName}</td>
                                <td className="py-2 px-3 text-center tabular-nums">{it.quantity}</td>
                                <td className="py-2 px-3 text-right tabular-nums">{formatRupiah(it.unitPrice)}</td>
                                <td className="py-2 px-3 text-right font-bold tabular-nums text-slate-900">
                                  {formatRupiah(it.totalPrice)}
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

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Menampilkan halaman {currentPage} dari {totalPages} ({filtered.length} total baris)
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>

          {/* Riwayat Dokumen Ekspor dengan Signed URL */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Riwayat Ekspor Laporan & Time-Limited Signed URL
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen disimpan sementara di Supabase Private Storage (expired otomatis 60 menit)
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Private Bucket Encrypted
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {exportHistory.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        item.format === "EXCEL"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-sky-50 text-tangerine-600"
                      }`}
                    >
                      {item.format === "EXCEL" ? (
                        <FileSpreadsheet className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.fileName}</p>
                      <p className="text-slate-400 text-[11px]">
                        {item.size} · Dibuat: {item.time} · Berlaku 60 Menit
                      </p>
                    </div>
                  </div>

                  <a
                    href={item.signedUrl}
                    download
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-tangerine text-slate-700 hover:text-tangerine-600 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Dokumen</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
            </>
          ) : (
            <VercelDeploymentPanel
              onExportPdf={() => handleExport("pdf")}
              isExporting={isExporting === "pdf"}
            />
          )}
        </div>
      </main>

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
    </div>
  );
}
