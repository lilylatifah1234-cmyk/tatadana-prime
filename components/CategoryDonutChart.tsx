"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/telegram";

interface CategoryData {
  name: string;
  emoji: string;
  amount: number;
  color: string;
}

interface CategoryDonutChartProps {
  categories: CategoryData[];
}

export function CategoryDonutChart({ categories }: CategoryDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  // SVG dimensions
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900">
            Alokasi Pengeluaran per Kategori
          </h3>
          <p className="text-xs text-slate-500">Breakdown real-time bulan berjalan</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
          Oktober 2026
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {categories.map((cat, idx) => {
              const percent = totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0;
              const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += percent;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={cat.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredIdx !== null ? (
              <>
                <span className="text-xl">{categories[hoveredIdx].emoji}</span>
                <span className="text-[11px] font-bold text-slate-900 max-w-[100px] truncate">
                  {categories[hoveredIdx].name}
                </span>
                <span className="text-xs font-bold text-olive-700 tabular-nums">
                  {totalAmount > 0
                    ? Math.round((categories[hoveredIdx].amount / totalAmount) * 100)
                    : 0}
                  %
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total Keluar
                </span>
                <span className="font-display font-bold text-sm text-slate-900 tabular-nums">
                  {formatRupiah(totalAmount)}
                </span>
                <span className="text-[10px] text-slate-500">100% Tercatat</span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {categories.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
              Belum ada data pengeluaran (Rp 0). Kategori akan terisi otomatis setelah transaksi diinput.
            </div>
          ) : (
            categories.map((cat, idx) => {
              const percentage = totalAmount > 0 ? Math.round((cat.amount / totalAmount) * 100) : 0;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isHovered ? "bg-slate-100/80 scale-[1.02]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm shrink-0">{cat.emoji}</span>
                    <span className="font-medium text-slate-800 truncate">{cat.name}</span>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="font-bold text-slate-900 tabular-nums">
                      {formatRupiah(cat.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 tabular-nums">{percentage}%</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
