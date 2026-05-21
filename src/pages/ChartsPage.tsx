import React from "react";
import { Transformer } from "../types";
import CustomChart from "../components/CustomChart";
import { Activity, BarChart3, TrendingUp } from "lucide-react";

interface ChartsPageProps {
  transformers: Transformer[];
  selectedTransformer: Transformer;
  selectedId: string;
  onSelectTransformer: (id: string) => void;
}

export default function ChartsPage({ transformers, selectedTransformer, selectedId, onSelectTransformer }: ChartsPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="font-display text-xl font-bold text-white">Tahliliy Grafiklar</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Harorat, yuklanish va kuchlanish tarixiy ma'lumotlari</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-orange-400" />
            <h3 className="font-display font-bold text-sm text-slate-200">Moy Harorati Dinamikasi</h3>
          </div>
          <CustomChart
            data={selectedTransformer.history}
            type="temp"
            title="Moy Harorati Dinamikasi"
          />
        </div>

        <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm text-slate-200">Yuklanish Koeffitsiyenti</h3>
          </div>
          <CustomChart
            data={selectedTransformer.history}
            type="load"
            title="Yuklanish Koeffitsiyenti"
          />
        </div>
      </div>

      {/* Summary Table */}
      <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <h3 className="font-display font-bold text-sm text-slate-200">Barcha Transformatorlar Taqqoslash Jadvali</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left py-3 px-3">Nomi</th>
                <th className="text-center py-3 px-3">Turi</th>
                <th className="text-center py-3 px-3">Quvvat</th>
                <th className="text-center py-3 px-3">Kuchlanish</th>
                <th className="text-center py-3 px-3">Tok</th>
                <th className="text-center py-3 px-3">Harorat</th>
                <th className="text-center py-3 px-3">Holat</th>
              </tr>
            </thead>
            <tbody>
              {transformers.map((t) => {
                const avgV = Math.round((t.voltage.A + t.voltage.B + t.voltage.C) / 3);
                const avgA = Math.round((t.current.A + t.current.B + t.current.C) / 3);
                const statusLabel = { normal: "Normal", warning: "Ogohlantirish", error: "Xato" }[t.status];
                const statusColor = { normal: "text-emerald-400", warning: "text-amber-400", error: "text-red-400" }[t.status];

                return (
                  <tr key={t.id} className="border-b border-slate-900/50 hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-3 text-slate-200 font-sans font-medium">{t.name}</td>
                    <td className="py-3 px-3 text-center text-slate-400">{t.type}</td>
                    <td className="py-3 px-3 text-center text-cyan-400">{t.nominalPower} kVA</td>
                    <td className="py-3 px-3 text-center text-yellow-400">{avgV}V</td>
                    <td className="py-3 px-3 text-center text-slate-300">{avgA}A</td>
                    <td className={`py-3 px-3 text-center ${t.temperature > 70 ? "text-orange-400" : "text-emerald-400"}`}>{t.temperature}°C</td>
                    <td className={`py-3 px-3 text-center font-bold ${statusColor}`}>{statusLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
