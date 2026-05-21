import React from "react";
import { Transformer } from "../types";
import TransformerCard from "../components/TransformerCard";
import MimicDiagram from "../components/MimicDiagram";
import PowerQualityVisuals from "../components/PowerQualityVisuals";
import { Zap, Server, Activity, MapPin } from "lucide-react";

interface TelemetryPageProps {
  transformers: Transformer[];
  selectedTransformer: Transformer;
  selectedId: string;
  onSelectTransformer: (id: string) => void;
  onOpenDiagnosis: () => void;
}

export default function TelemetryPage({ transformers, selectedTransformer, selectedId, onSelectTransformer, onOpenDiagnosis }: TelemetryPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-xl font-bold text-white">Telemetriya va Sxema</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Real vaqtda kuchlanish, tok, harorat va sxema ko'rinishi</p>
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

      {/* Main Telemetry Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Transformer Card */}
        <div className="xl:col-span-2 space-y-6">
          <TransformerCard
            transformer={selectedTransformer}
            onOpenDiagnosis={onOpenDiagnosis}
          />
          <MimicDiagram transformer={selectedTransformer} />
        </div>

        {/* Right: Power Quality */}
        <div className="xl:col-span-1">
          <PowerQualityVisuals transformer={selectedTransformer} />
        </div>
      </div>
    </div>
  );
}
