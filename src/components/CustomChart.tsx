import React, { useState } from "react";

interface HistoryData {
  time: string;
  temp: number;
  load: number;
  voltageAvg: number;
}

interface CustomChartProps {
  data: HistoryData[];
  type: "temp" | "load" | "voltage";
  title: string;
}

export default function CustomChart({ data, type, title }: CustomChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 font-mono text-xs border border-slate-800 rounded-lg bg-slate-900/40">
        Malumotlar mavjud emas
      </div>
    );
  }

  // Get min/max values for scaling
  const values = data.map((d) => {
    if (type === "temp") return d.temp;
    if (type === "load") return d.load;
    return d.voltageAvg;
  });

  const maxVal = Math.max(...values, 10) * 1.15;
  const minVal = Math.max(0, Math.min(...values) * 0.85);
  const range = maxVal - minVal || 1;

  // Chart coordinates SVG parameters
  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Map data to SVG points
  const points = data.map((d, idx) => {
    const val = type === "temp" ? d.temp : type === "load" ? d.load : d.voltageAvg;
    const x = paddingLeft + (idx / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, val, time: d.time };
  });

  // Create path description line
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Generate grid values (4 intervals)
  const gridLines = Array.from({ length: 4 }).map((_, i) => {
    const val = minVal + (range / 3) * i;
    const y = paddingTop + chartHeight - (i / 3) * chartHeight;
    return { val, y };
  });

  const unit = type === "temp" ? "°C" : type === "load" ? "%" : "V";
  const lineColor = type === "temp" ? "#ea580c" : type === "load" ? "#06b6d4" : "#10b981";
  const areaColor = type === "temp" ? "rgba(234, 88, 12, 0.15)" : type === "load" ? "rgba(6, 182, 212, 0.15)" : "rgba(16, 185, 129, 0.15)";

  return (
    <div className="border border-slate-800/80 rounded-xl bg-slate-900/70 p-5 shadow-xl transition-all" id={`chart-${type}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-medium text-sm text-slate-300 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
          {title}
        </h3>
        <span className="text-xs font-mono text-slate-500">
          Me'yor: {type === "temp" ? "max 75°C" : type === "load" ? "max 80%" : "380±10% V"}
        </span>
      </div>

      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#1e293b"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                fill="#64748b"
                fontSize={9}
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {Math.round(line.val)}
                {unit}
              </text>
            </g>
          ))}

          {/* X axis times */}
          {points.map((p, idx) => {
            // Draw x labels for first, mid, and last points
            const isLabel = idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1;
            if (!isLabel) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - 8}
                fill="#64748b"
                fontSize={9}
                fontFamily="Space Grotesk"
                textAnchor={idx === 0 ? "start" : idx === points.length - 1 ? "end" : "middle"}
              >
                {p.time}
              </text>
            );
          })}

          {/* Area shadow path */}
          {areaPath && (
            <path
              d={areaPath}
              fill={areaColor}
              stroke="none"
            />
          )}

          {/* Glowing Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interaction Dots and Overlay */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Invisible touch anchor */}
              <circle
                cx={p.x}
                cy={p.y}
                r={10}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Point hover effect dot */}
              {(hoveredIdx === idx || (hoveredIdx === null && idx === points.length - 1)) && (
                <g>
                  {/* Vertical coordinate indicator line */}
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartHeight}
                    stroke="#334155"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  
                  {/* Outer pulsating ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={1.5}
                    className="animate-ping"
                  />
                  {/* Key focus dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill={lineColor}
                    stroke="#0b0f19"
                    strokeWidth={1.5}
                  />
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Dynamic Float Tooltip UI */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-15 bg-slate-950/90 border border-slate-700/60 rounded px-2.5 py-1.5 shadow-2xl font-mono text-xxs text-white"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 35}%`,
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            <div className="text-slate-400 font-display font-medium text-xxs mb-0.5">
              {points[hoveredIdx].time}
            </div>
            <div className="font-bold">
              {points[hoveredIdx].val.toFixed(1)} {unit}
            </div>
          </div>
        )}
      </div>

      {/* Min / Max / Avg stats widgets */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 font-mono text-center">
        <div>
          <div className="text-[10px] text-slate-500">Maksimal</div>
          <div className="text-xs font-semibold text-slate-300">
            {Math.max(...values).toFixed(1)}
            {unit}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">O'rtacha</div>
          <div className="text-xs font-semibold text-slate-300">
            {(values.reduce((s, x) => s + x, 0) / (values.length || 1)).toFixed(1)}
            {unit}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Minimal</div>
          <div className="text-xs font-semibold text-slate-300">
            {Math.min(...values).toFixed(1)}
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
}
