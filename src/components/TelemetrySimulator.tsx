import React, { useState } from "react";
import { Transformer } from "../types";
import { Zap, Thermometer, Droplet, ArrowRight, Activity, Radio } from "lucide-react";

interface TelemetrySimulatorProps {
  selectedTransformer: Transformer;
  onUpdateTelemetry: (
    id: string,
    voltage: { A: number; B: number; C: number },
    current: { A: number; B: number; C: number },
    temperature: number,
    oilLevel: "normal" | "low"
  ) => void;
  autoTransmit: boolean;
  onToggleAutoTransmit: () => void;
}

export default function TelemetrySimulator({
  selectedTransformer,
  onUpdateTelemetry,
  autoTransmit,
  onToggleAutoTransmit,
}: TelemetrySimulatorProps) {
  // Local states mimicking the real-time physical device adjustment before transmitting
  const [voltsPercent, setVoltsPercent] = useState<number>(0); // slider percent, e.g. -20% to +20%
  const [loadMultiplier, setLoadMultiplier] = useState<number>(1.0); // load coefficient, e.g. 0.2x to 2.0x
  const [tempVal, setTempVal] = useState<number>(selectedTransformer.temperature);
  const [oilLow, setOilLow] = useState<boolean>(selectedTransformer.oilLevel === "low");
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // Sync state when selected transformer changes
  React.useEffect(() => {
    setTempVal(selectedTransformer.temperature);
    setOilLow(selectedTransformer.oilLevel === "low");
  }, [selectedTransformer.id]);

  // Handle local transmit
  const handleTransmit = () => {
    setIsTransmitting(true);
    
    // Calculate phase voltages centering ~220V nominal phase voltage
    const coeff = 1 + voltsPercent / 100;
    const voltage = {
      A: Math.round(220 * coeff + (Math.random() * 4 - 2)),
      B: Math.round(218 * coeff + (Math.random() * 4 - 2)),
      C: Math.round(221 * coeff + (Math.random() * 4 - 2)),
    };

    // Calculate currents basing on loadMultiplier and transformer capacity
    const nominalCurrent = Math.round((selectedTransformer.nominalPower * 1000) / (3 * 220));
    const baseCurrent = nominalCurrent * loadMultiplier;
    const current = {
      A: Math.round(baseCurrent * (0.95 + Math.random() * 0.1)),
      B: Math.round(baseCurrent * (0.92 + Math.random() * 0.16)), // intentionally some phase deviation
      C: Math.round(baseCurrent * (0.97 + Math.random() * 0.08)),
    };

    onUpdateTelemetry(
      selectedTransformer.id,
      voltage,
      current,
      tempVal,
      oilLow ? "low" : "normal"
    );

    // Visual feedback
    setTimeout(() => {
      setIsTransmitting(false);
    }, 600);
  };

  const currentLoadComputed = Math.round(loadMultiplier * 100);

  return (
    <div className="border border-cyan-800/50 rounded-2xl bg-cyan-950/20 p-6 shadow-xl backdrop-blur-sm" id="telemetry-simulator">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="bg-cyan-500/15 text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-cyan-500/30">
            Datchiklar Simulyatori
          </span>
          <h2 className="font-display text-lg font-bold text-white mt-1.5 flex items-center gap-2">
            <Radio className={`w-4 h-4 ${autoTransmit ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
            Fizik Qiymatlarni Uzatish
          </h2>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Ushbu panel datchiklardan keladigan ma'lumotlarni simulyatsiya qiladi. Bu yerda generator orqali ko'rsatkichlarni o'zgartirib, tizimga signalni uzatib ko'rishingiz mumkin.
      </p>

      <div className="space-y-5">
        {/* Voltage Deviation Controls */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Kuchlanish og'ishi (Nominal 220V)
            </label>
            <span className={`font-mono font-medium ${voltsPercent === 0 ? "text-slate-400" : voltsPercent > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {voltsPercent > 0 ? `+${voltsPercent}` : voltsPercent}% ({Math.round(220 * (1 + voltsPercent / 100))}V)
            </span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            value={voltsPercent}
            onChange={(e) => setVoltsPercent(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-25% Pasayish</span>
            <span>Me'yor</span>
            <span>+25% Kuchlanish</span>
          </div>
        </div>

        {/* Load Multiplier Controls */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Yuklama koeffitsiyenti (Tok kuchi)
            </label>
            <span className={`font-mono font-medium ${currentLoadComputed > 90 ? "text-red-400" : currentLoadComputed > 70 ? "text-amber-400" : "text-cyan-400"}`}>
              {currentLoadComputed}% ({loadMultiplier.toFixed(2)}x nominal)
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={loadMultiplier}
            onChange={(e) => setLoadMultiplier(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Yengil (20%)</span>
            <span>Normal (100%)</span>
            <span>O'ta Og'ir (200%)</span>
          </div>
        </div>

        {/* Temp Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              Moy harorati (°C)
            </label>
            <span className={`font-mono font-semibold ${tempVal > 85 ? "text-red-400" : tempVal > 70 ? "text-orange-400" : "text-emerald-400"}`}>
              {tempVal}°C
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="115"
            value={tempVal}
            onChange={(e) => setTempVal(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20°C Sovuq</span>
            <span>70°C Me'yor</span>
            <span>115°C Xavfli</span>
          </div>
        </div>

        {/* Oil leak switch */}
        <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Droplet className={`w-4 h-4 ${oilLow ? "text-red-500" : "text-sky-400"}`} />
            <div>
              <div className="text-xs font-semibold text-slate-200">Moy sizib chiqishi (Leak)</div>
              <div className="text-[10px] text-slate-500">Moy sathining tushib ketishi</div>
            </div>
          </div>
          <button
            onClick={() => setOilLow(!oilLow)}
            className={`w-11 h-6 rounded-full transition-colors relative ${oilLow ? "bg-red-500" : "bg-slate-700"}`}
          >
            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${oilLow ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          {/* Main broadcast switch */}
          <button
            onClick={handleTransmit}
            disabled={isTransmitting}
            className={`flex-1 relative font-display font-medium text-xs text-slate-950 py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 hover:scale-102 cursor-pointer ${isTransmitting ? "bg-emerald-400" : "bg-cyan-400 hover:bg-cyan-300"}`}
          >
            {isTransmitting ? (
              <>
                <Radio className="w-4 h-4 animate-ping text-slate-950" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 text-slate-950" />
                <span>Ilovaga Yuborish</span>
              </>
            )}
          </button>

          {/* Auto trans toggle */}
          <button
            onClick={onToggleAutoTransmit}
            className={`py-3 px-4 rounded-xl border font-display font-medium text-xs flex items-center justify-center gap-2 transition-all ${autoTransmit ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-400" : "border-slate-800 text-slate-400 hover:bg-slate-800/30"}`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoTransmit ? "animate-pulse" : ""}`} />
            <span>{autoTransmit ? "Avto-Uzatish: Yoqilgan" : "Avto-Uzatish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
