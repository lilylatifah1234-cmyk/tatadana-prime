"use client";

import { formatRupiah } from "@/lib/telegram";

interface MonthlyFlow {
  month: string; // e.g. 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'
  inflow: number;
  outflow: number;
}

interface CashflowBarChartProps {
  data?: MonthlyFlow[];
}

export function CashflowBarChart({ data }: CashflowBarChartProps) {
  const defaultData: MonthlyFlow[] = [
    { month: "Mei", inflow: 85000000, outflow: 34000000 },
    { month: "Jun", inflow: 92000000, outflow: 41000000 },
    { month: "Jul", inflow: 78000000, outflow: 38000000 },
    { month: "Agu", inflow: 110000000, outflow: 46000000 },
    { month: "Sep", inflow: 95000000, outflow: 42000000 },
    { month: "Okt", inflow: 110000000, outflow: 39800000 },
  ];

  const chartData = data || defaultData;
  const maxVal = Math.max(...chartData.map((d) => Math.max(d.inflow, d.outflow))) * 1.15;

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
            <span className="w-3 h-3 rounded bg-tangerine-500" />
            <span className="text-slate-600">Outflow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 min-h-[200px]">
        {chartData.map((d) => {
          const inflowHeight = (d.inflow / maxVal) * 100;
          const outflowHeight = (d.outflow / maxVal) * 100;

          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1.5 h-44 relative">
                {/* Inflow Bar */}
                <div
                  className="w-1/2 max-w-[20px] bg-emerald-500 rounded-t-md transition-all duration-500 group-hover:bg-emerald-600 relative"
                  style={{ height: `${inflowHeight}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 tabular-nums">
                    +{formatRupiah(d.inflow)}
                  </div>
                </div>

                {/* Outflow Bar */}
                <div
                  className="w-1/2 max-w-[20px] bg-tangerine-500 rounded-t-md transition-all duration-500 group-hover:bg-tangerine-600 relative"
                  style={{ height: `${outflowHeight}%` }}
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
