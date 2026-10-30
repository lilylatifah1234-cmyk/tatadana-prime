"use client";

import { formatRupiah } from "@/lib/telegram";
import { Transaction } from "@/types";

interface MonthlyFlow {
  month: string;
  inflow: number;
  outflow: number;
}

interface CashflowBarChartProps {
  data?: MonthlyFlow[];
  transactions?: Transaction[];
}

export function CashflowBarChart({ data, transactions = [] }: CashflowBarChartProps) {
  // Hitung riil dari transactions jika diberikan, atau gunakan 0 untuk semua bulan jika belum ada data
  const months = ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"];

  const currentMonthInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthOutflow = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const computedData: MonthlyFlow[] = data || months.map((m, idx) => {
    // Bulan berjalan (Okt) menampilkan total riil transaksi yang telah diinput
    if (idx === months.length - 1) {
      return { month: m, inflow: currentMonthInflow, outflow: currentMonthOutflow };
    }
    return { month: m, inflow: 0, outflow: 0 };
  });

  const maxVal = Math.max(...computedData.map((d) => Math.max(d.inflow, d.outflow)), 100000) * 1.15;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900">
            Komparasi Arus Kas 6 Bulan Terakhir
          </h3>
          <p className="text-xs text-slate-500">Pertumbuhan Inflow vs Outflow berkala</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-600">Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-olive-600" />
            <span className="text-slate-600">Outflow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 min-h-[200px]">
        {computedData.map((d) => {
          const inflowHeight = (d.inflow / maxVal) * 100;
          const outflowHeight = (d.outflow / maxVal) * 100;

          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1.5 h-44 relative">
                {/* Inflow Bar */}
                <div
                  className="w-1/2 max-w-[20px] bg-emerald-500 rounded-t-md transition-all duration-500 group-hover:bg-emerald-600 relative"
                  style={{ height: `${Math.max(inflowHeight, 2)}%`, opacity: d.inflow > 0 ? 1 : 0.2 }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 tabular-nums">
                    +{formatRupiah(d.inflow)}
                  </div>
                </div>

                {/* Outflow Bar */}
                <div
                  className="w-1/2 max-w-[20px] bg-olive-600 rounded-t-md transition-all duration-500 group-hover:bg-olive-700 relative"
                  style={{ height: `${Math.max(outflowHeight, 2)}%`, opacity: d.outflow > 0 ? 1 : 0.2 }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 tabular-nums">
                    -{formatRupiah(d.outflow)}
                  </div>
                </div>
              </div>

              {/* Month Label */}
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
