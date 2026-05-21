import React, { useState } from "react";
import { Plus, X, Server, Shield, MapPin } from "lucide-react";

interface TransformerFormProps {
  onAddTransformer: (data: {
    name: string;
    location: string;
    type: string;
    nominalPower: number;
    primaryVoltage: number;
    secondaryVoltage: number;
  }) => void;
  onClose: () => void;
}

export default function TransformerForm({ onAddTransformer, onClose }: TransformerFormProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("TMG-630/10");
  const [nominalPower, setNominalPower] = useState(630);
  const [primaryVoltage, setPrimaryVoltage] = useState(10);
  const [secondaryVoltage, setSecondaryVoltage] = useState(0.4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      return alert("Iltimos barcha ma'lumotlarni to'ldiring!");
    }

    onAddTransformer({
      name,
      location,
      type,
      nominalPower,
      primaryVoltage,
      secondaryVoltage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="add-transformer-modal">
      <div className="relative w-full max-w-lg border border-slate-800 bg-slate-900 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Floating gradient visual effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Yangi Transformator Qo'shish</h2>
              <p className="text-xs text-slate-500 font-medium">Monitoring tarmog'iga yangi uskunani ro'yxatdan o'tkazish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-[5px] text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Transformator Nomi / Raqami
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Masalan: T-12 Fayzobod or Substation №4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Joylashuv (Ko'cha, Mahalla yoki Koordinata)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Masalan: Bog'ishamol ko'chasi 14, Toshkent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type/Mark Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Uskuna Turi (Markasi)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="TMG-630/10">TMG-630/10 (Moyli)</option>
                <option value="TMZ-1000/10">TMZ-1000/15 (Zirhli)</option>
                <option value="TM-400/10">TM-400/10 (Standart)</option>
                <option value="TMG-1600/10">TMG-1600/10 (Yuqori quvvat)</option>
                <option value="TSZ-400/10">TSZ-400/10 (Quruq)</option>
              </select>
            </div>

            {/* Nominal apparent Power */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Nominal Quvvat (kVA)
              </label>
              <select
                value={nominalPower}
                onChange={(e) => setNominalPower(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="160">160 kVA</option>
                <option value="250">250 kVA</option>
                <option value="400">400 kVA</option>
                <option value="630">630 kVA</option>
                <option value="1000">1000 kVA</option>
                <option value="1600">1600 kVA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Primary voltage */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Birlamchi Kuchlanish (kV)
              </label>
              <input
                type="number"
                step="0.1"
                value={primaryVoltage}
                onChange={(e) => setPrimaryVoltage(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                required
              />
            </div>

            {/* Secondary voltage */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Ikkilamchi Kuchlanish (kV)
              </label>
              <input
                type="number"
                step="0.01"
                value={secondaryVoltage}
                onChange={(e) => setSecondaryVoltage(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex h-12 gap-3 pt-4 border-t border-slate-800/80 mt-6 select-none">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-800 hover:bg-slate-800 rounded-xl font-display text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Bekor Qilish
            </button>
            <button
              type="submit"
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-display text-xs font-bold transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Qo'shish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
