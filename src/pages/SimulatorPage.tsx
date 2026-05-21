import React from "react";
import { Transformer } from "../types";
import TelemetrySimulator from "../components/TelemetrySimulator";
import { Sliders, Radio, Cpu } from "lucide-react";

interface SimulatorPageProps {
  transformers: Transformer[];
  selectedTransformer: Transformer;
  selectedId: string;
  onSelectTransformer: (id: string) => void;
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

export default function SimulatorPage({
  transformers,
  selectedTransformer,
  selectedId,
  onSelectTransformer,
  onUpdateTelemetry,
  autoTransmit,
  onToggleAutoTransmit,
}: SimulatorPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-xl font-bold text-white">IoT Simulator</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Datchik ma'lumotlarini qo'lda boshqarish va avtomatik uzatish</p>
      </div>

      {/* Transformer Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {transformers.map((t) => {
          const isActive = t.id === selectedId;
          const statusDot = {
            normal: "bg-emerald-500",
            warning: "bg-amber-500",
            error: "bg-red-500 animate-ping",
          }[t.status];

          return (
            <button
              key={t.id}
              onClick={() => onSelectTransformer(t.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                isActive
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                  : "bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
              <span className="font-display font-bold">{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Simulator Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TelemetrySimulator
            selectedTransformer={selectedTransformer}
            onUpdateTelemetry={onUpdateTelemetry}
            autoTransmit={autoTransmit}
            onToggleAutoTransmit={onToggleAutoTransmit}
          />
        </div>

        {/* Info Panel */}
        <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-bold text-sm text-slate-200">Simulator Haqida</h3>
          </div>

          <div className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
            <p>
              Bu panel IoT datchiklar (sensorlar) dan keladigan ma'lumotlarni simulyatsiya qilish uchun mo'ljallangan.
              Real sharoitda bu ma'lumotlar SCADA tizimiga avtomatik ravishda uzatiladi.
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-display font-bold text-slate-300 text-xs flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Avtomatik Uzatish Rejimi
              </h4>
              <p className="text-[11px] text-slate-500">
                {autoTransmit
                  ? "✅ Faol — Har 4.5 sekundda tasodifiy o'zgarishlar avtomatik uzatilmoqda"
                  : "⏸️ To'xtatilgan — Faqat qo'lda o'zgartirishlar qo'llaniladi"}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="font-display font-bold text-slate-300 text-xs">Joriy Transformator Holati</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kuchlanish (o'rt.):</span>
                  <span className="text-yellow-400">{Math.round((selectedTransformer.voltage.A + selectedTransformer.voltage.B + selectedTransformer.voltage.C) / 3)}V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tok (o'rt.):</span>
                  <span className="text-cyan-400">{Math.round((selectedTransformer.current.A + selectedTransformer.current.B + selectedTransformer.current.C) / 3)}A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harorat:</span>
                  <span className={selectedTransformer.temperature > 70 ? "text-orange-400" : "text-emerald-400"}>{selectedTransformer.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Moy sathi:</span>
                  <span className={selectedTransformer.oilLevel === "low" ? "text-red-400" : "text-emerald-400"}>
                    {selectedTransformer.oilLevel === "low" ? "PAST" : "Normal"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
