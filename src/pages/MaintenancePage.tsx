import React from "react";
import { Transformer } from "../types";
import MaintenanceQuickForm from "../components/MaintenanceQuickForm";
import { BookOpen, Wrench, Calendar, User } from "lucide-react";

interface MaintenanceLog {
  id: string;
  date: string;
  engineer: string;
  action: string;
  result: string;
}

interface MaintenancePageProps {
  transformers: Transformer[];
  selectedTransformer: Transformer;
  selectedId: string;
  onSelectTransformer: (id: string) => void;
  maintenanceLogs: Record<string, MaintenanceLog[]>;
  onAddLog: (transformerId: string, log: { date: string; engineer: string; action: string; result: string }) => void;
}

export default function MaintenancePage({ transformers, selectedTransformer, selectedId, onSelectTransformer, maintenanceLogs, onAddLog }: MaintenancePageProps) {
  const logs = maintenanceLogs[selectedTransformer.id] || [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-xl font-bold text-white">Texnik Xizmat Ko'rsatish</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Profilaktika jurnali va texnik xizmat yozuvlari</p>
      </div>

      {/* Transformer Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {transformers.map((t) => {
          const isActive = t.id === selectedId;
          const logCount = (maintenanceLogs[t.id] || []).length;

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
              <Wrench className="w-3 h-3" />
              <span className="font-display font-bold">{t.name}</span>
              {logCount > 0 && (
                <span className="bg-slate-700 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-full">{logCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-slate-200">Yangi Yozuv Qo'shish</h3>
            </div>
            <MaintenanceQuickForm
              transformerId={selectedTransformer.id}
              onAddLog={(log) => onAddLog(selectedTransformer.id, log)}
            />
          </div>
        </div>

        {/* Right: Logs */}
        <div className="lg:col-span-2">
          <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Xronologik Yozuvlar — {selectedTransformer.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-full">
                {logs.length} yozuv
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-600 border border-dashed border-slate-900 rounded-xl bg-slate-950/40">
                <Wrench className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-500" />
                <p className="text-sm font-mono">Hozircha ushbu transformator bo'yicha profilaktika yozuvlari mavjud emas.</p>
                <p className="text-xs text-slate-600 mt-1">Chap tarafdagi forma orqali yangi yozuv qo'shing</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="bg-slate-950/50 hover:bg-slate-950/80 transition-colors p-5 border border-slate-900 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className="font-bold text-cyan-400 flex items-center gap-2 text-xs font-mono">
                        <User className="w-3.5 h-3.5" />
                        {log.engineer}
                      </span>
                      <span className="text-slate-500 text-xs font-mono flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {log.date}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 font-sans mb-2">{log.action}</h4>
                    <p className="text-xs text-slate-400 font-sans bg-slate-950 px-3 py-2 rounded-lg border border-slate-900/60 font-mono">
                      {log.result}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
