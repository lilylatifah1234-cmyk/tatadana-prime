"use client";

import { Wallet, TrendingUp, TrendingDown, Clock, ArrowUpRight } from "lucide-react";
import { formatRupiah } from "@/lib/telegram";

interface MetricsOverviewProps {
  totalNetWorth: number;
  totalInflow: number;
  totalOutflow: number;
  totalSafeBudget: number;
  burnRatePercentage: number;
}

export function MetricsOverview({
  totalNetWorth,
  totalInflow,
  totalOutflow,
  totalSafeBudget,
  burnRatePercentage,
}: MetricsOverviewProps) {
  const remainingBudget = Math.max(0, totalSafeBudget - totalOutflow);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. SALDO TOTAL (Border Atas Oranye) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-orange-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between min-h-[135px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              SALDO TOTAL
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 tracking-tight tabular-nums">
            {formatRupiah(totalNetWorth)}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Semua Dompet Aktif</span>
          <span className="font-bold text-slate-600">IDR</span>
        </div>
      </div>

      {/* 2. PEMASUKAN BULAN INI (Border Atas Hijau) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-emerald-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between min-h-[135px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              PEMASUKAN BULAN INI
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 tracking-tight tabular-nums">
            {formatRupiah(totalInflow)}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-emerald-600 font-bold">Inflow Arus Kas</span>
          <span className="font-bold text-slate-600">Bulan Ini</span>
        </div>
      </div>

      {/* 3. PENGELUARAN BULAN INI (Border Atas Merah) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-rose-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between min-h-[135px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              PENGELUARAN BULAN INI
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 tracking-tight tabular-nums">
            {formatRupiah(totalOutflow)}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="text-rose-600 font-bold">Outflow Beban</span>
          <span className="font-bold text-slate-600">Tercatat</span>
        </div>
      </div>

      {/* 4. BUDGET TERSISA (Border Atas Biru) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 border-t-4 border-t-blue-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between min-h-[135px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              BUDGET TERSISA
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 tracking-tight tabular-nums">
            {formatRupiah(remainingBudget)}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>{totalSafeBudget > 0 ? `Plafon: ${formatRupiah(totalSafeBudget)}` : "Belum ada budget"}</span>
          <span className="font-bold text-slate-600">{burnRatePercentage}% Burn</span>
        </div>
      </div>
    </div>
  );
}
