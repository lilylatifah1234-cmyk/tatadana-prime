"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/telegram";
import { Transaction } from "@/types";

interface DailyVelocity {
  day: string;
  amount: number;
}

interface VelocityLineChartProps {
  transactions?: Transaction[];
}

export function VelocityLineChart({ transactions = [] }: VelocityLineChartProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyVelocity | null>(null);

  // Hitung riwayat pengeluaran harian riil dari transaksi
  const dayBuckets: { [key: string]: number } = {};
  for (let d = 1; d <= 12; d++) {
    const key = d < 10 ? `0${d}` : `${d}`;
    dayBuckets[key] = 0;
  }

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      try {
        const date = new Date(t.txTimestamp);
        const dayStr = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
        if (dayBuckets[dayStr] !== undefined) {
          dayBuckets[dayStr] += t.amount;
        } else {
          dayBuckets[dayStr] = t.amount;
        }
      } catch {}
    });

  const data: DailyVelocity[] = Object.keys(dayBuckets)
    .sort()
    .map((day) => ({
      day,
      amount: dayBuckets[day],
    }));

  const maxAmount = Math.max(...data.map((d) => d.amount), 100000) * 1.1;
  const highestDay = data.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), { day: "-", amount: 0 });

  const width = 500;
  const height = 140;
  const padding = 20;

  const points = data.map((d, idx) => {
    const x = padding + (idx / Math.max(data.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - (d.amount / maxAmount) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || width - padding} ${height - padding} L ${points[0]?.x || padding} ${height - padding} Z`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card-luxury flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900">
            Daily Spending Velocity
          </h3>
          <p className="text-xs text-slate-500">Fluktuasi ritme pengeluaran harian (WIB)</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">Hari Terboros</span>
          <p className="text-xs font-bold text-olive-700 tabular-nums">
            {highestDay.amount > 0 ? `Tgl ${highestDay.day} (${formatRupiah(highestDay.amount)})` : "- (Rp 0)"}
          </p>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9FB36F" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#5D7328" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#E2E8F0"
            strokeDasharray="4 4"
          />

          {/* Filled Area */}
          <path d={areaD} fill="url(#velocityGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#5D7328" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Points */}
          {points.map((p) => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r={hoveredDay?.day === p.day ? "6" : "3.5"}
              className="fill-white stroke-olive-600 stroke-2 cursor-pointer transition-all hover:scale-125"
              onMouseEnter={() => setHoveredDay(p)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </svg>

        {/* Hover info tooltip */}
        <div className="h-6 flex items-center justify-between text-xs mt-2 px-2">
          {hoveredDay ? (
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <span className="w-2 h-2 rounded-full bg-olive-600" />
              <span>Tgl {hoveredDay.day} Okt:</span>
              <span className="font-bold text-olive-700 tabular-nums">
                {formatRupiah(hoveredDay.amount)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">
              {highestDay.amount > 0 ? "Arahkan kursor ke titik grafik untuk rincian harian" : "Belum ada pengeluaran harian (Rp 0)"}
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-medium">Bulan Oktober 2026</span>
        </div>
      </div>
    </div>
  );
}
