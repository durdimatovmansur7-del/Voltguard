import React, { useState, useEffect } from "react";
import { Transformer } from "../types";
import { Cpu, X, Brain, RefreshCw, AlertCircle, FileText, CheckCircle } from "lucide-react";

interface AIDiagnosisPanelProps {
  transformer: Transformer;
  onClose: () => void;
}

export default function AIDiagnosisPanel({ transformer, onClose }: AIDiagnosisPanelProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetchDiagnosis = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: transformer.name,
          location: transformer.location,
          voltage: transformer.voltage,
          current: transformer.current,
          temperature: transformer.temperature,
          loadPercent: Math.round(((transformer.current.A + transformer.current.B + transformer.current.C) / 3 / ((transformer.nominalPower * 1000) / (3 * 220))) * 100) || 0,
          oilLevel: transformer.oilLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Serverdan tahliliy hisobotni olishda ichki xato yuz berdi.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReport(data.diagnosis);
      setIsDemo(!!data.isDemo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Tizim ulanishida kutilmagan xato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
  }, [transformer.id]);

  // Robust, elegant simple Markdown-to-HTML formatter to render bullet points, tags, and icons cleanly
  const renderMarkdown = (md: string) => {
    const lines = md.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={index} className="text-sm font-display font-bold text-cyan-300 mt-5 mb-2 first:mt-0 flex items-center gap-2">
            <span className="w-1 h-3 bg-cyan-400 rounded-full" />
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      
      // Bold items
      let content: React.ReactNode = trimmed;
      if (trimmed.includes("**")) {
        const parts = trimmed.split("**");
        content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="text-white font-semibold">{part}</strong>;
          }
          return part;
        });
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={index} className="flex items-start gap-2 text-xs text-slate-300 pl-2 my-1 leading-relaxed">
            <span className="text-cyan-500 font-bold mt-0.5">•</span>
            <span>{trimmed.substring(2)}</span>
          </div>
        );
      }

      // Check lists or numbered links
      if (/^\d+\./.test(trimmed)) {
        const match = trimmed.match(/^(\d+\.)(.*)/);
        if (match) {
          return (
            <div key={index} className="flex items-start gap-2 text-xs text-slate-300 pl-2 my-1.5 leading-relaxed">
              <span className="text-purple-400 font-mono font-bold">{match[1]}</span>
              <span>{match[2]}</span>
            </div>
          );
        }
      }

      // Plain paragraph lines
      if (trimmed === "") return <div key={index} className="h-2" />;

      return (
        <p key={index} className="text-xs text-slate-300 leading-relaxed my-1">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" id="ai-diagnosis-modal">
      
      {/* Sidebar-style Drawer drawer panel layout */}
      <div className="w-full sm:max-w-xl h-full sm:h-[calc(100vh-2rem)] border-l sm:border border-slate-800 bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header bar section */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800/80 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-1.5">
                Generativ AI Tahlili
                <span className="bg-purple-900/40 text-purple-300 border border-purple-800 text-[9px] px-1.5 py-0.2 rounded font-medium select-none">
                  Gemini 3.5
                </span>
              </h2>
              <p className="text-xxs text-slate-400 font-medium font-mono">{transformer.name} uchun hisobot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Report Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {loading && (
            <div className="h-full flex flex-col justify-center items-center py-12 text-center" id="diagnosis-loading">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin" />
                <Cpu className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h4 className="font-display text-sm font-semibold text-white animate-pulse">
                Uskuna Telemetriyasi Tahlil Qilinmoqda...
              </h4>
              <p className="text-xxs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Faza toklari (I_A, I_B, I_C), kuchlanish balanslari va sarg'ichlar moy harorati (${transformer.temperature}°C) o'rganilib, muhandislik hisoboti shakllantirilmoqda...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-xs text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <div className="space-y-2">
                <p className="font-medium">Tahlilni shakllantirishda xato yuz berdi</p>
                <p className="text-slate-400 text-xxs">{error}</p>
                <button
                  onClick={fetchDiagnosis}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-white rounded px-3 py-1 font-semibold transition-colors mt-1 cursor-pointer"
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          )}

          {report && (
            <div className="space-y-4" id="diagnosis-report">
              
              {/* Highlight summary badge box */}
              {isDemo && (
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-3 text-xxs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>
                    <strong>Demo Rejimi:</strong> API kaliti aniqlanmaganligi sababli, avtomatik muhandislik algoritmi asosida tuzilgan tahlil namoyish etilmoqda.
                  </span>
                </div>
              )}

              {/* Verified Certificate Stamp */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-purple-500/5 text-purple-500/20 font-display font-extrabold text-4xl select-none uppercase tracking-widest leading-none rotate-12">
                  AI OK
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wide">Avtomatik Diagnostika Hisoboti</h3>
                  <p className="text-slate-500 text-xxs mt-0.5">Uskuna sozi: {transformer.status === "normal" ? "Normal" : "Tezkor ko'rik lozim"}</p>
                  <p className="text-slate-400 text-xxs mt-1 bg-slate-900 py-1 px-2.5 rounded font-mono inline-block">
                    {new Date().toLocaleDateString("UZ-uz")} o'lchov ko'rsatkichlari bo'yicha
                  </p>
                </div>
              </div>

              {/* Styled markdown container */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/90 font-sans space-y-2">
                {renderMarkdown(report)}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center shrink-0">
          <span className="text-xxs text-slate-500 font-mono flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Muhandislik xulosasi № {transformer.id.substring(0, 5)}
          </span>
          <button
            onClick={fetchDiagnosis}
            disabled={loading}
            className="border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 py-1.5 px-3 rounded-lg text-xxs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Qayta baholash</span>
          </button>
        </div>
      </div>
    </div>
  );
}
