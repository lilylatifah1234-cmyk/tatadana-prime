"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/telegram";

interface DailyVelocity {
  day: string; // e.g. '01', '02', '03', ...
  amount: number;
}

export function VelocityLineChart() {
  const [hoveredDay, setHoveredDay] = useState<DailyVelocity | null>(null);

  // Daily velocity data for current month
  const data: DailyVelocity[] = [
    { day: "01", amount: 1250000 },
    { day: "02", amount: 450000 },
    { day: "03", amount: 2800000 },
    { day: "04", amount: 3200000 },
    { day: "05", amount: 20500000 }, // Flight to SIN (Peak spike)
    { day: "06", amount: 4200000 },
    { day: "07", amount: 890000 },
    { day: "08", amount: 7200000 }, // AWS/OpenAI Q4
    { day: "09", amount: 2400000 },
    { day: "10", amount: 650000 },
    { day: "11", amount: 1100000 },
    { day: "12", amount: 1850000 }, // Today
  ];

  const maxAmount = Math.max(...data.map((d) => d.amount)) * 1.1;
  const width = 500;
  const height = 140;
  const padding = 20;

  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.amount / maxAmount) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

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
          <p className="text-xs font-bold text-deficit tabular-nums">Tgl 05 (Rp 20.500.000)</p>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
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
          <path d={pathD} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Points */}
          {points.map((p) => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r={hoveredDay?.day === p.day ? "6" : "3.5"}
              className="fill-white stroke-tangerine stroke-2 cursor-pointer transition-all"
              onMouseEnter={() => setHoveredDay(p)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </svg>

        {/* Hover info tooltip */}
        <div className="h-6 flex items-center justify-between text-xs mt-2 px-2">
          {hoveredDay ? (
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <span className="w-2 h-2 rounded-full bg-tangerine" />
              <span>Tgl {hoveredDay.day} Okt:</span>
              <span className="font-bold text-tangerine-600 tabular-nums">
                {formatRupiah(hoveredDay.amount)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">
              Arahkan kursor ke titik grafik untuk rincian harian
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-medium">Bulan Oktober 2026</span>
        </div>
      </div>
    </div>
  );
}
