import React from "react";
import { Transformer } from "../types";
import {
  Zap,
  Activity,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Server,
  TrendingUp,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { PageId } from "../components/Sidebar";

interface DashboardPageProps {
  transformers: Transformer[];
  selectedId: string;
  onSelectTransformer: (id: string) => void;
  onNavigate: (page: PageId) => void;
}

export default function DashboardPage({ transformers, selectedId, onSelectTransformer, onNavigate }: DashboardPageProps) {
  const totalPower = transformers.reduce((sum, t) => sum + t.nominalPower, 0);
  const avgTemp = Math.round(transformers.reduce((sum, t) => sum + t.temperature, 0) / transformers.length);
  const normalCount = transformers.filter((t) => t.status === "normal").length;
  const warningCount = transformers.filter((t) => t.status === "warning").length;
  const errorCount = transformers.filter((t) => t.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Bosh Sahifa</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Tizim umumiy ko'rinishi va statistikasi</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1424] border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono uppercase font-semibold">Jami Uskunalar</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{transformers.length}</div>
          <div className="flex items-center gap-2 text-[10px] font-mono mt-1">
            <span className="text-emerald-400">● {normalCount} normal</span>
            <span className="text-amber-400">● {warningCount} ogohlantirish</span>
            <span className="text-red-400">● {errorCount} xato</span>
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-mono uppercase font-semibold">Tizim Quvvati</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{(totalPower / 1000).toFixed(1)} <span className="text-sm text-slate-400">MVA</span></div>
          <p className="text-[10px] text-slate-500 font-mono">Nominal umumiy quvvat</p>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-[10px] font-mono uppercase font-semibold">O'rtacha Harorat</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${avgTemp > 65 ? "text-orange-400" : "text-emerald-400"}`}>
            {avgTemp}°C
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Barcha transformatorlar bo'yicha</p>
        </div>

        <div className="bg-[#0d1424] border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-mono uppercase font-semibold">Faol Ogohlantirishlar</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${errorCount + warningCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {errorCount + warningCount}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {errorCount + warningCount === 0 ? "Barcha tizimlar me'yorda" : "Diqqat talab etiladi"}
          </p>
        </div>
      </div>

      {/* Transformer Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Uskunalar Ro'yxati
          </h3>
          <button
            onClick={() => onNavigate("telemetry")}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer transition-colors"
          >
            Batafsil <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transformers.map((item) => {
            const isSelected = item.id === selectedId;
            const avgVoltage = Math.round((item.voltage.A + item.voltage.B + item.voltage.C) / 3);
            const avgCurrent = Math.round((item.current.A + item.current.B + item.current.C) / 3);
            const maxSafeCurrent = Math.round((item.nominalPower * 1000) / (3 * 220));
            const loadPercent = Math.round((avgCurrent / maxSafeCurrent) * 100);

            const statusConfig = {
              normal: { bg: "border-slate-800/60 bg-[#0d1424]", dot: "bg-emerald-500", label: "Normal", labelColor: "text-emerald-400" },
              warning: { bg: "border-amber-900/40 bg-amber-950/10", dot: "bg-amber-500", label: "Ogohlantirish", labelColor: "text-amber-400" },
              error: { bg: "border-red-900/40 bg-red-950/10", dot: "bg-red-500 animate-ping", label: "Xato", labelColor: "text-red-400" },
            }[item.status];

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTransformer(item.id);
                  onNavigate("telemetry");
                }}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
                  isSelected ? "border-cyan-500/60 bg-cyan-950/10 shadow-lg shadow-cyan-950/10" : statusConfig.bg
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.type} • {item.nominalPower} kVA</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold ${statusConfig.labelColor}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-slate-950/50 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Kuchlanish</div>
                    <div className="text-sm font-bold text-yellow-400 font-mono">{avgVoltage}V</div>
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Tok</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono">{avgCurrent}A</div>
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Harorat</div>
                    <div className={`text-sm font-bold font-mono ${item.temperature > 70 ? "text-orange-400" : "text-emerald-400"}`}>{item.temperature}°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                    <MapPin className="w-3 h-3 text-slate-600" />
                    <span className="truncate max-w-[180px]">{item.location}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">
                    Yuklanish: <span className={`font-bold ${loadPercent > 85 ? "text-orange-400" : "text-slate-300"}`}>{loadPercent}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
