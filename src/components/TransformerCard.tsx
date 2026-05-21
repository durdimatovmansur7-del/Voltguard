import React from "react";
import { Transformer } from "../types";
import { Thermometer, Zap, Shield, HelpCircle, HardDrive, Cpu, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

interface TransformerCardProps {
  transformer: Transformer;
  onOpenDiagnosis: () => void;
}

export default function TransformerCard({ transformer, onOpenDiagnosis }: TransformerCardProps) {
  const { name, location, type, nominalPower, voltage, current, temperature, oilLevel, status } = transformer;

  // Let's compute average values to show summary engineering electrical power metrics
  const avgVoltage = Math.round((voltage.A + voltage.B + voltage.C) / 3);
  const avgCurrent = Math.round((current.A + current.B + current.C) / 3);

  // Power factor assumed at 0.85
  const cosPhi = 0.85;

  // Real Active Power calculation for 3-phase grid: P = sqrt(3) * U * I * cos(phi) / 1000 kW
  // Wait, if U is phase voltage (~220V) and not line voltage (~380V), then P = 3 * U_phase * I_phase * cos(phi) / 1000 kW
  const activePowerKW = parseFloat(((3 * avgVoltage * avgCurrent * cosPhi) / 1000).toFixed(1));
  const maxSafeCurrent = Math.round((nominalPower * 1000) / (3 * 220)); // nominal amps capacity per phase
  const loadPercentage = Math.round((avgCurrent / maxSafeCurrent) * 100) || 0;

  // Color mappings based on status
  const statusTheme = {
    normal: {
      border: "border-emerald-800/60 bg-emerald-950/15",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      text: "text-emerald-400",
      light: "bg-emerald-500",
      message: "Uskuna mo'tadil holatda va barqaror ishlayapti.",
    },
    warning: {
      border: "border-amber-700/60 bg-amber-950/15",
      badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      text: "text-amber-500",
      light: "bg-amber-500",
      message: "Diqqat! Yuklama yoki harorat me'yordan biroz yuqoriroq.",
    },
    error: {
      border: "border-red-800/80 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      badge: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse",
      text: "text-red-500",
      light: "bg-red-600 animate-ping",
      message: "Xavfli holat! Zudlik bilan tekshirish talab etiladi !",
    },
  }[status];

  // Colors for phase indices
  const phaseColors = {
    A: "bg-amber-400", // standard utility colors Yellow, Green, Red
    B: "bg-emerald-500",
    C: "bg-red-500",
  };

  return (
    <div className={`border rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all ${statusTheme.border}`} id={`transformer-card-${transformer.id}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${statusTheme.badge}`}>
              {status === "normal" ? "Normal" : status === "warning" ? "Ogohlantirish" : "XAVF!"}
            </span>
            <span className="text-slate-500 font-mono text-xs">Uskuna ID: {transformer.id}</span>
          </div>
          <h2 className="font-display text-2xl font-bold mt-1 text-white">{name}</h2>
          <p className="text-sm text-slate-400">{location}</p>
        </div>

        <button
          onClick={onOpenDiagnosis}
          className="bg-purple-600 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all duration-200 hover:bg-purple-500 shadow-[0_4px_14px_rgba(147,51,234,0.4)] hover:shadow-[0_4px_20px_rgba(147,51,234,0.6)] cursor-pointer flex items-center justify-center gap-2"
        >
          <Cpu className="w-4 h-4" />
          <span>Generativ AI Diagnostika</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Moy harorati Indicator */}
        <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 font-display text-xs font-semibold">
            <span className="flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              Moy Harorati
            </span>
            <span className="font-mono text-xxs">Me'yor: &lt; 75°C</span>
          </div>

          <div className="my-4 text-center">
            <div className={`font-display text-4xl font-extrabold font-mono tracking-tight ${temperature > 85 ? "text-red-500" : temperature > 70 ? "text-orange-500" : "text-emerald-500"}`}>
              {temperature} <span className="text-lg font-normal">°C</span>
            </div>

            {/* Simulated bar scale */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${temperature > 85 ? "bg-red-500" : temperature > 70 ? "bg-orange-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min((temperature / 120) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-medium">
            Moy sathi: <span className={oilLevel === "low" ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
              {oilLevel === "low" ? "⚠️ Pasaygan (Leak)" : "✔️ Me'yorida"}
            </span>
          </div>
        </div>

        {/* Phase Voltages (Kuchlanish) */}
        <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 font-display text-xs font-semibold mb-3">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              Kuchlanish (V)
            </span>
            <span className="font-mono text-xxs">O'rtacha: {avgVoltage}V</span>
          </div>

          <div className="space-y-2.5">
            {(["A", "B", "C"] as const).map((ph) => {
              const volts = voltage[ph];
              // Deviation from 220V nominal
              const deviation = ((volts - 220) / 220) * 100;
              const isWrong = Math.abs(deviation) > 10;
              
              return (
                <div key={ph} className="flex items-center gap-2.5">
                  <span className={`w-6 h-5 flex items-center justify-center font-bold text-[10px] rounded text-slate-900 ${phaseColors[ph]}`}>
                    {ph}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-mono font-medium text-slate-300">
                      <span>{volts} V</span>
                      <span className={isWrong ? "text-red-400" : "text-slate-500"}>
                        {deviation >= 0 ? `+${deviation.toFixed(1)}` : deviation.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((volts / 300) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Currents (Tok kuchi) */}
        <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 font-display text-xs font-semibold mb-3">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-400" />
              Tok Kuchi (A)
            </span>
            <span className="font-mono text-xxs">Max: {maxSafeCurrent}A</span>
          </div>

          <div className="space-y-2.5">
            {(["A", "B", "C"] as const).map((ph) => {
              const amp = current[ph];
              const percent = Math.round((amp / maxSafeCurrent) * 100) || 0;
              
              return (
                <div key={ph} className="flex items-center gap-2.5">
                  <span className={`w-6 h-5 flex items-center justify-center font-bold text-[10px] rounded text-slate-900 ${phaseColors[ph]}`}>
                    {ph}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-mono font-medium text-slate-300">
                      <span>{amp} A</span>
                      <span className={percent > 90 ? "text-red-400 font-bold" : percent > 75 ? "text-amber-400" : "text-slate-500"}>
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${percent > 90 ? "bg-red-500 animate-pulse" : percent > 75 ? "bg-amber-400" : "bg-cyan-500"}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calculated Real Technical Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-800 bg-slate-950/30 rounded-xl mb-4 font-mono text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Transformator Turi</span>
          <span className="text-slate-200 mt-0.5 block font-bold">{type}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Nominal Quvvat</span>
          <span className="text-slate-200 mt-0.5 block font-bold">{nominalPower} kVA</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Yuklama Darajasi</span>
          <span className={`${loadPercentage > 90 ? "text-red-400" : loadPercentage > 75 ? "text-amber-400" : "text-emerald-400"} mt-0.5 block font-bold`}>
            {loadPercentage}%
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Joriy Aktiv Quvvat</span>
          <span className="text-cyan-400 mt-0.5 block font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {activePowerKW} kW
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
        <span className="w-2.5 h-2.5 rounded-full relative flex">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusTheme.light}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusTheme.light}`}></span>
        </span>
        <span className="text-slate-300">{statusTheme.message}</span>
      </div>
    </div>
  );
}
