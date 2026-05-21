import React, { useState } from "react";
import { Plus, Wrench, ShieldCheck, User } from "lucide-react";

interface MaintenanceQuickFormProps {
  transformerId: string;
  onAddLog: (log: { date: string; engineer: string; action: string; result: string }) => void;
}

const PRESET_ACTIONS = [
  { action: "Transformator moyini filtrlash va regeneratsiyalash", result: "Moy sarlavhalari suvsizlantirildi, kislotalilik darajasi 0.01 gacha tushirildi" },
  { action: "Sarg'ichlarning izolyatsiya qarshiligini monitoring qilish (Megoommetr)", result: "Sarg'ich-korpus qarshiligi 1500 MΩ ga teng (normativda > 1000 MΩ)" },
  { action: "Kuchsiz kontaktlarni tekshirish va yuqori voltli ulanishlarni tortish", result: "Kirish sanchqilarining barcha kontaktlari o'rnatilgan kuch bilan siqildi" },
  { action: "Havo quritish klapanlarini (silikagel datchikli) nazorat qilish", result: "Silikagel holati yaxshi, sarg'ayish yoki namlanish belgilari yo'q" },
  { action: "Favqulodda moy sathini tiklash va to'ldirish", result: "TMG bakiga 12 litr yangi transformator moyi qo'shildi, moy darajasi normada" },
];

export default function MaintenanceQuickForm({ transformerId, onAddLog }: MaintenanceQuickFormProps) {
  const [engineer, setEngineer] = useState("");
  const [usePreset, setUsePreset] = useState(true);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [customAction, setCustomAction] = useState("");
  const [customResult, setCustomResult] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engineer.trim()) return;

    const actionText = usePreset ? PRESET_ACTIONS[selectedPresetIdx].action : customAction;
    const resultText = usePreset ? PRESET_ACTIONS[selectedPresetIdx].result : customResult;

    if (!actionText.trim() || !resultText.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];

    onAddLog({
      date: todayStr,
      engineer: engineer.trim(),
      action: actionText.trim(),
      result: resultText.trim(),
    });

    // Reset some fields
    if (!usePreset) {
      setCustomAction("");
      setCustomResult("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-slate-900 bg-slate-950/40 p-4 rounded-xl space-y-4">
      <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">
        Texnik amaliyot kiritish formasi
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Engineer Name Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-mono">NAVBATCHI MUHANDIS (ENGINEER):</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500">
              <User className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              required
              placeholder="Masalan: G'aniyev A."
              value={engineer}
              onChange={(e) => setEngineer(e.target.value)}
              className="w-full bg-[#070b13] border border-slate-800 focus:border-cyan-500/80 rounded-lg p-2 pl-9 text-xs text-slate-100 outline-none font-mono"
            />
          </div>
        </div>

        {/* Input type Toggle tabs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-mono">AMALIYOT REJIMI:</label>
          <div className="grid grid-cols-2 bg-[#070b13] p-1 border border-slate-800 rounded-lg text-center leading-none">
            <button
              type="button"
              onClick={() => setUsePreset(true)}
              className={`py-1.5 rounded text-xxs font-mono cursor-pointer ${
                usePreset ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold" : "text-slate-500"
              }`}
            >
              Shablonlar
            </button>
            <button
              type="button"
              onClick={() => setUsePreset(false)}
              className={`py-1.5 rounded text-xxs font-mono cursor-pointer ${
                !usePreset ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold" : "text-slate-500"
              }`}
            >
              Mustaqil yozuv
            </button>
          </div>
        </div>
      </div>

      {usePreset ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-mono">KORPORATIV STANDART AMALIYOTLAR (PRESETS):</label>
          <select
            value={selectedPresetIdx}
            onChange={(e) => setSelectedPresetIdx(parseInt(e.target.value))}
            className="w-full bg-[#070b13] border border-slate-800 focus:border-cyan-500/80 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
          >
            {PRESET_ACTIONS.map((preset, index) => (
              <option key={index} value={index} className="bg-[#070b13] text-slate-300">
                {preset.action.substring(0, 52)}...
              </option>
            ))}
          </select>
          <p className="text-[10px] font-mono p-2 bg-cyan-950/10 border border-cyan-950/20 text-cyan-400/80 rounded mt-1">
            <span className="font-bold uppercase block text-[8px] tracking-wide mb-1 opacity-70">Avtomatik hisobot bayoni:</span>
            {PRESET_ACTIONS[selectedPresetIdx].result}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-mono">MUNTAZAM ISH TAVSIFI:</label>
            <input
              type="text"
              required={!usePreset}
              placeholder="Masalan: Shamollatish parraklari parrak podshipniklarini moylash..."
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              className="w-full bg-[#070b13] border border-slate-800 focus:border-cyan-500/80 rounded-lg p-2 text-xs text-slate-200 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-mono">BAJARILGAN ISH NATIJASI VA XULOSA:</label>
            <textarea
              required={!usePreset}
              rows={2}
              placeholder="Masalan: Podshipniklar toza va shovqinsiz aylanadi, harorat normallashdi"
              value={customResult}
              onChange={(e) => setCustomResult(e.target.value)}
              className="w-full bg-[#070b13] border border-slate-800 focus:border-cyan-500/80 rounded-lg p-2 text-xs text-slate-200 outline-none resize-none"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!engineer}
        className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-white text-slate-950 py-2 rounded-lg font-display text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        <Plus className="w-4 h-4 text-slate-950" />
        Xizmat Daftarchasiga kiritish
      </button>
    </form>
  );
}
