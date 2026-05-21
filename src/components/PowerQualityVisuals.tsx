import React from "react";
import { Transformer } from "../types";
import { ShieldAlert, Activity, GitCommit, TrendingUp } from "lucide-react";

interface PowerQualityVisualsProps {
  transformer: Transformer;
}

export default function PowerQualityVisuals({ transformer }: PowerQualityVisualsProps) {
  const { voltage, current, nominalPower } = transformer;

  // Average values
  const avgV = (voltage.A + voltage.B + voltage.C) / 3;
  const avgI = (current.A + current.B + current.C) / 3;

  // Let's compute Unbalance Factor (Nomutanosiblik darajasi)
  // Simplified formula: max deviation from average / average * 100%
  const maxVDev = Math.max(
    Math.abs(voltage.A - avgV),
    Math.abs(voltage.B - avgV),
    Math.abs(voltage.C - avgV)
  );
  const vuf = avgV > 0 ? parseFloat(((maxVDev / avgV) * 100).toFixed(2)) : 0;

  const maxIDev = Math.max(
    Math.abs(current.A - avgI),
    Math.abs(current.B - avgI),
    Math.abs(current.C - avgI)
  );
  const iuf = avgI > 0 ? parseFloat(((maxIDev / avgI) * 100).toFixed(2)) : 0;

  // Power factor assumed at 0.85 (cos phi)
  const cosPhi = 0.85;
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi); // sin phi ~ 0.527

  // Active power: P = 3 * U_phase * I_phase * cos(phi) / 1000 kW
  const pKW = (3 * avgV * avgI * cosPhi) / 1000;
  // Reactive power: Q = 3 * U_phase * I_phase * sin(phi) / 1000 kVAR
  const qKVAR = (3 * avgV * avgI * sinPhi) / 1000;
  // Apparent power: S = 3 * U_phase * I_phase / 1000 kVA
  const sKVA = (3 * avgV * avgI) / 1000;

  // Render Vector Diagram coordinates
  // Phase angles: A = 0 rad, B = 2pi/3 (120 deg), C = 4pi/3 (240 deg)
  const angles = {
    A: 0,
    B: (2 * Math.PI) / 3,
    C: (4 * Math.PI) / 3,
  };

  const centerRef = 80;
  const maxRadius = 60;

  // Helper to map polar to Cartesian coordinates
  const getCoordinates = (angle: number, value: number, maxVal: number) => {
    const scale = maxVal > 0 ? value / maxVal : 0;
    const r = scale * maxRadius;
    const x = centerRef + r * Math.cos(angle);
    const y = centerRef - r * Math.sin(angle); // subtract because SVG Y goes down
    return { x, y };
  };

  // Maximum values for scaling the vector diagram
  const maxVScale = 260; // Max normal phase V
  const maxSafeI = (nominalPower * 1000) / (3 * 220); // Nom current per phase
  const maxIScale = Math.max(current.A, current.B, current.C, maxSafeI, 10);

  const coordsV = {
    A: getCoordinates(angles.A, voltage.A, maxVScale),
    B: getCoordinates(angles.B, voltage.B, maxVScale),
    C: getCoordinates(angles.C, voltage.C, maxVScale),
  };

  const coordsI = {
    A: getCoordinates(angles.A, current.A, maxIScale),
    B: getCoordinates(angles.B, current.B, maxIScale),
    C: getCoordinates(angles.C, current.C, maxIScale),
  };

  return (
    <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl transition-all" id="power-quality-panel">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h3 className="font-display font-bold text-sm text-slate-200">
          Vektor Diagrammasi va Quvvat ko'rsatkichlari
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Render Vector Phasor Diagram SVG */}
        <div className="bg-slate-950/70 p-4 border border-slate-900 rounded-xl flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-wide">
            Kuchlanish va Tok Fazali Vektorlari
          </span>
          
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible">
              {/* Polar Coordinate circles */}
              <circle cx={centerRef} cy={centerRef} r={maxRadius} fill="none" stroke="#1e293b" strokeWidth={1} />
              <circle cx={centerRef} cy={centerRef} r={maxRadius * 0.66} fill="none" stroke="#1e293b" strokeWidth={0.5} strokeDasharray="2 2" />
              <circle cx={centerRef} cy={centerRef} r={maxRadius * 0.33} fill="none" stroke="#1e293b" strokeWidth={0.5} strokeDasharray="2 2" />

              {/* X and Y axes */}
              <line x1={centerRef - maxRadius - 10} y1={centerRef} x2={centerRef + maxRadius + 10} y2={centerRef} stroke="#334155" strokeWidth={0.5} strokeDasharray="4 4" />
              <line x1={centerRef} y1={centerRef - maxRadius - 10} x2={centerRef} y2={centerRef + maxRadius + 10} stroke="#334155" strokeWidth={0.5} strokeDasharray="4 4" />

              {/* Phasor Vectors - Voltage (Thicker Solid Lines) */}
              {/* Phase A */}
              <line x1={centerRef} y1={centerRef} x2={coordsV.A.x} y2={coordsV.A.y} stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
              <polygon points={`${coordsV.A.x},${coordsV.A.y} ${coordsV.A.x-4},${coordsV.A.y-2} ${coordsV.A.x-4},${coordsV.A.y+2}`} fill="#f59e0b" transform={`rotate(${0}, ${coordsV.A.x}, ${coordsV.A.y})`} />
              
              {/* Phase B */}
              <line x1={centerRef} y1={centerRef} x2={coordsV.B.x} y2={coordsV.B.y} stroke="#10b981" strokeWidth={2} strokeLinecap="round" />
              
              {/* Phase C */}
              <line x1={centerRef} y1={centerRef} x2={coordsV.C.x} y2={coordsV.C.y} stroke="#ef4444" strokeWidth={2} strokeLinecap="round" />

              {/* Phasor Vectors - Current (Dashed Lines with Arrow markers) */}
              <line x1={centerRef} y1={centerRef} x2={coordsI.A.x} y2={coordsI.A.y} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 2" />
              <circle cx={coordsI.A.x} cy={coordsI.A.y} r={2} fill="#f59e0b" />

              <line x1={centerRef} y1={centerRef} x2={coordsI.B.x} y2={coordsI.B.y} stroke="#10b981" strokeWidth={1.5} strokeDasharray="2 2" />
              <circle cx={coordsI.B.x} cy={coordsI.B.y} r={2} fill="#10b981" />

              <line x1={centerRef} y1={centerRef} x2={coordsI.C.x} y2={coordsI.C.y} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="2 2" />
              <circle cx={coordsI.C.x} cy={coordsI.C.y} r={2} fill="#ef4444" />

              {/* Phasor Labels */}
              <text x={centerRef + maxRadius + 8} y={centerRef + 4} fill="#f59e0b" fontSize={8} fontFamily="JetBrains Mono" fontWeight="bold">A</text>
              <text x={coordsV.B.x - 8} y={coordsV.B.y - 4} fill="#10b981" fontSize={8} fontFamily="JetBrains Mono" fontWeight="bold">B</text>
              <text x={coordsV.C.x - 8} y={coordsV.C.y + 8} fill="#ef4444" fontSize={8} fontFamily="JetBrains Mono" fontWeight="bold">C</text>
            </svg>
          </div>

          <div className="flex gap-4 mt-2 justify-center select-none font-mono text-[9px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-yellow-400 block" /> Kuchlanish (V)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-400 block" /> Tok (A)
            </span>
          </div>
        </div>

        {/* Math & Power Metrics summary stats layout */}
        <div className="space-y-3.5">
          {/* Phase Unbalance coefficients */}
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">Tarmoq Simmetriyasi (Asymmetry)</span>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[10px] text-slate-400 block">VUF (Kuchlanish nomut.)</span>
                <span className={`text-base font-extrabold font-mono mt-0.5 block ${vuf > 3 ? "text-red-400" : vuf > 1.5 ? "text-amber-400" : "text-emerald-400"}`}>
                  {vuf}%
                </span>
                <span className="text-[9px] text-slate-600 block mt-0.5">Me'yor: &lt; 2%</span>
              </div>

              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[10px] text-slate-400 block">IUF (Tok nomutanosibligi)</span>
                <span className={`text-base font-extrabold font-mono mt-0.5 block ${iuf > 15 ? "text-red-400" : iuf > 8 ? "text-amber-400" : "text-emerald-400"}`}>
                  {iuf}%
                </span>
                <span className="text-[9px] text-slate-600 block mt-0.5">Me'yor: &lt; 10%</span>
              </div>
            </div>
          </div>

          {/* Apparent, Active, Reactive Power levels */}
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">Quvvat Uchburchagi (Power Triangle)</span>
            <div className="mt-2 space-y-2 bg-slate-950/40 p-3 rounded-lg border border-slate-900 font-mono text-xs">
              
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <GitCommit className="w-3 h-3 text-cyan-400" />
                  S (To'liq quvvat):
                </span>
                <span className="font-bold">{sKVA.toFixed(1)} kVA</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  P (Aktiv quvvat):
                </span>
                <span className="font-bold text-emerald-400">{pKW.toFixed(1)} kW</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-purple-400" />
                  Q (Reaktiv quvvat):
                </span>
                <span className="font-bold text-purple-400">{qKVAR.toFixed(1)} kVAR</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-550 border-t border-slate-900 pt-1.5 mt-1.5">
                <span>Quvvat koeffitsiyenti:</span>
                <span className="text-slate-300 font-bold">cos φ = {cosPhi}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
