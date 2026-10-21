"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Receipt,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Send,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Transaction } from "@/types";
import { formatRupiah, formatWIBTime } from "@/lib/telegram";

interface FinancialCalendarProps {
  transactions: Transaction[];
  onOpenNewTx?: () => void;
  onOpenSandbox?: () => void;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Helper untuk format angka singkat di sel kalender (misal: 45jt, 350rb)
function formatCompactNominal(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1).replace(".0", "")} M`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace(".0", "")} jt`;
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)} rb`;
  }
  return amount.toString();
}

export function FinancialCalendar({
  transactions,
  onOpenNewTx,
  onOpenSandbox,
}: FinancialCalendarProps) {
  // Default ke Oktober 2026 sesuai data transaksi demo
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed, 9 = Oktober
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-10-12");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Navigasi Bulan
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
    setSelectedDateStr("2026-10-12");
  };

  // Hitung jumlah hari dalam bulan & offset hari pertama (Senin = 0)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // 0 = Senin, 6 = Minggu

  // Petakan transaksi ke tanggal (format: YYYY-MM-DD)
  const txByDate = useMemo(() => {
    const map: Record<
      string,
      {
        inflow: number;
        outflow: number;
        items: Transaction[];
      }
    > = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.txTimestamp);
      // Gunakan waktu lokal atau ISO substring
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

      if (!map[dateKey]) {
        map[dateKey] = { inflow: 0, outflow: 0, items: [] };
      }

      if (tx.type === "income") {
        map[dateKey].inflow += tx.amount;
      } else if (tx.type === "expense") {
        map[dateKey].outflow += tx.amount;
      }
      map[dateKey].items.push(tx);
    });

    return map;
  }, [transactions]);

  // Statistik Bulanan
  const monthlyStats = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let activeDaysCount = 0;
    let busiestDay = { dateStr: "", count: 0 };

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const data = txByDate[dateKey];
      if (data && data.items.length > 0) {
        inflow += data.inflow;
        outflow += data.outflow;
        activeDaysCount++;
        if (data.items.length > busiestDay.count) {
          busiestDay = { dateStr: dateKey, count: data.items.length };
        }
      }
    }

    return {
      inflow,
      outflow,
      net: inflow - outflow,
      activeDaysCount,
      busiestDay,
    };
  }, [currentYear, currentMonth, daysInMonth, txByDate]);

  // Transaksi pada tanggal yang dipilih
  const selectedDayData = txByDate[selectedDateStr] || { inflow: 0, outflow: 0, items: [] };
  const filteredSelectedItems = selectedDayData.items.filter((item) => {
    if (filterType === "income") return item.type === "income";
    if (filterType === "expense") return item.type === "expense";
    return true;
  });

  const selectedDateObj = new Date(selectedDateStr + "T00:00:00");
  const selectedDateFormatted = selectedDateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════
          HEADER BAR KALENDER
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card-luxury flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {monthlyStats.activeDaysCount} Hari Aktif Transaksi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jurnal visual mutasi arus kas harian — klik tanggal mana pun untuk membedah rincian.
            </p>
          </div>
        </div>

        {/* Kontrol Navigasi & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Jenis Transaksi */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === "all" ? "bg-white text-slate-900 shadow-sm font-bold" : "hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterType("income")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterType === "income"
                  ? "bg-emerald-500 text-white shadow-sm font-bold"
                  : "hover:text-emerald-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("expense")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                filterType === "expense"
                  ? "bg-rose-500 text-white shadow-sm font-bold"
                  : "hover:text-rose-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Pengeluaran</span>
            </button>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MONTHLY HIGHLIGHT STRIP
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Pemasukan Bulan Ini
            </span>
            <span className="font-display font-bold text-lg text-emerald-600 mt-0.5 block tabular-nums">
              +{formatRupiah(monthlyStats.inflow)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Pengeluaran Bulan Ini
            </span>
            <span className="font-display font-bold text-lg text-rose-600 mt-0.5 block tabular-nums">
              -{formatRupiah(monthlyStats.outflow)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
              Surplus / Net Kas Bulan Ini
            </span>
            <span
              className={`font-display font-bold text-lg mt-0.5 block tabular-nums ${
                monthlyStats.net >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {monthlyStats.net >= 0 ? "+" : ""}
              {formatRupiah(monthlyStats.net)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <ArrowUpDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
              Hari Teraktif
            </span>
            <span className="font-display font-bold text-base text-slate-800 mt-0.5 block">
              {monthlyStats.busiestDay.dateStr
                ? `${new Date(monthlyStats.busiestDay.dateStr + "T00:00:00").getDate()} ${
                    MONTH_NAMES[currentMonth]
                  } (${monthlyStats.busiestDay.count} Tx)`
                : "Belum Ada"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN GRID: KALENDER + DETAIL RIWAYAT TANGGAL TERPILIH
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri (7 Cols): The Calendar Grid */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card-luxury space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kalender Buku Kas Harian
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pemasukan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Pengeluaran
              </span>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-1 border-b border-slate-100">
            {DAY_NAMES.map((dn, idx) => (
              <div key={idx} className={idx >= 5 ? "text-rose-400" : ""}>
                {dn}
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty Offset cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-dashed border-slate-100"
              />
            ))}

            {/* Days cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;
              const data = txByDate[dateKey];
              const isSelected = selectedDateStr === dateKey;
              const hasInflow = data && data.inflow > 0 && filterType !== "expense";
              const hasOutflow = data && data.outflow > 0 && filterType !== "income";
              const hasTx = (hasInflow || hasOutflow) && data.items.length > 0;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isSelected
                      ? "bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300/60"
                      : hasTx
                      ? "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-sm"
                      : "bg-white/60 hover:bg-slate-50 border-slate-100 text-slate-400"
                  }`}
                >
                  {/* Top: Day Number & Tx Count */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-sky-600 text-white font-extrabold"
                          : hasTx
                          ? "text-slate-900 group-hover:text-sky-700"
                          : "text-slate-500"
                      }`}
                    >
                      {day}
                    </span>

                    {hasTx && (
                      <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {data.items.length} tx
                      </span>
                    )}
                  </div>

                  {/* Bottom: Inflow / Outflow Chips */}
                  <div className="space-y-0.5 w-full text-[10px]">
                    {hasInflow && (
                      <div className="px-1 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 truncate">
                        +{formatCompactNominal(data.inflow)}
                      </div>
                    )}
                    {hasOutflow && (
                      <div className="px-1 py-0.5 rounded-md bg-rose-50 text-rose-800 font-bold border border-rose-200/80 truncate">
                        -{formatCompactNominal(data.outflow)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan (5 Cols): Riwayat Transaksi Tanggal Terpilih */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card-luxury flex flex-col justify-between space-y-4">
          <div>
            {/* Header Riwayat Tanggal */}
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                Riwayat Transaksi Harian
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 mt-0.5">
                {selectedDateFormatted}
              </h3>

              {/* Mini Card Saldo Harian */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[9.5px] font-bold text-emerald-700 uppercase">Pemasukan</span>
                  <div className="font-display font-bold text-xs text-emerald-700 mt-0.5">
                    +{formatRupiah(selectedDayData.inflow)}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
                  <span className="text-[9.5px] font-bold text-rose-700 uppercase">Pengeluaran</span>
                  <div className="font-display font-bold text-xs text-rose-700 mt-0.5">
                    -{formatRupiah(selectedDayData.outflow)}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="text-[9.5px] font-bold text-slate-700 uppercase">Net Kas</span>
                  <div
                    className={`font-display font-bold text-xs mt-0.5 ${
                      selectedDayData.inflow - selectedDayData.outflow >= 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {selectedDayData.inflow - selectedDayData.outflow >= 0 ? "+" : ""}
                    {formatRupiah(selectedDayData.inflow - selectedDayData.outflow)}
                  </div>
                </div>
              </div>
            </div>

            {/* List Transaksi */}
            <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
              {filteredSelectedItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-700">
                    Tidak ada transaksi pada tanggal ini
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Belum ada mutasi yang dicatat. Anda bisa mencatat transaksi baru melalui Bot Telegram atau form web.
                  </p>
                </div>
              ) : (
                filteredSelectedItems.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const hasItems = tx.items && tx.items.length > 0;
                  const txTime = formatWIBTime(tx.txTimestamp);

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-sm shrink-0">
                            {tx.categoryEmoji || "💳"}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">
                              {tx.note || tx.categoryName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                              <span className="font-semibold text-slate-700">{tx.categoryName}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-slate-400" />
                                {tx.walletName}
                              </span>
                              <span>•</span>
                              <span>{txTime.dateStr} {txTime.timeStr}</span>
                            </div>
                          </div>
                        </div>

                        {/* Nominal */}
                        <div className="text-right shrink-0">
                          <span
                            className={`font-display font-bold text-xs tabular-nums block ${
                              tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "-"}
                            {formatRupiah(tx.amount)}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase bg-slate-200/70 text-slate-600">
                            {tx.source === "telegram_receipt"
                              ? "OCR Struk"
                              : tx.source === "telegram_voice"
                              ? "Voice Note"
                              : tx.source === "telegram_text"
                              ? "Telegram Bot"
                              : "Web Form"}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Multi-Item Breakdown */}
                      {hasItems && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                            className="text-[10.5px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>
                              {isExpanded
                                ? "Tutup Rincian Struk Item"
                                : `Lihat ${tx.items?.length} Rincian Item Struk Belanja`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5 text-[11px] animate-fadeIn">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Hasil Ekstraksi Vision AI Multi-Item:
                              </span>
                              {tx.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-slate-700 py-0.5 border-b border-slate-50 last:border-0"
                                >
                                  <span>
                                    {item.itemName}{" "}
                                    <strong className="text-slate-400 font-normal">
                                      x{item.quantity}
                                    </strong>
                                  </span>
                                  <span className="font-mono font-medium text-slate-900 tabular-nums">
                                    {formatRupiah(item.totalPrice)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Action Bottom Strip */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onOpenSandbox}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-tangerine" />
              <span>Kirim via Telegram</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewTx}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-tangerine to-tangerine-600 hover:from-tangerine-600 hover:to-tangerine-700 text-white text-xs font-bold shadow-tangerine-glow transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat di Tanggal Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
