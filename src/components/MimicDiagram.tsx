import React, { useState } from "react";
import { Transformer } from "../types";
import { Grid, Eye, EyeOff, ShieldAlert, Zap } from "lucide-react";

interface MimicDiagramProps {
  transformer: Transformer;
}

export default function MimicDiagram({ transformer }: MimicDiagramProps) {
  // Let's have simulated state for circuit breaker / disconnector switches
  const [qs1Open, setQs1Open] = useState(false); // Disconnector (QS) - normal is CLOSED (false)
  const [qf1Open, setQf1Open] = useState(false); // Circuit Breaker (QF) - normal is CLOSED (false)
  const [showFlow, setShowFlow] = useState(true);

  const isEnergized = !qs1Open && !qf1Open;

  // Let's compute average current
  const avgI = isEnergized ? Math.round((transformer.current.A + transformer.current.B + transformer.current.C) / 3) : 0;
  const avgV = isEnergized ? Math.round((transformer.voltage.A + transformer.voltage.B + transformer.voltage.C) / 3) : 0;

  return (
    <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl transition-all" id="mimic-diagram-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-sm text-slate-200">
            SCADA Mnemosxemasi (Mimic Diagram)
          </h3>
        </div>
        
        {/* Toggle Grid line flow animation */}
        <button
          onClick={() => setShowFlow(!showFlow)}
          className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider bg-slate-950/40 p-1.5 px-2.5 rounded border border-slate-900 cursor-pointer"
        >
          {showFlow ? (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Animatsiya: Yoqilgan</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Animatsiya: O'chirilgan</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl relative overflow-hidden select-none">
        
        {/* Absolute status indicators */}
        <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wide">
          <span className="text-slate-500">Nimstansiya statusi:</span>
          <span className={`inline-flex items-center gap-1 font-bold ${isEnergized ? "text-emerald-400" : "text-red-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isEnergized ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {isEnergized ? "KUCHLANISH OSTIDA" : "TOK KESILGAN (TRIP)"}
          </span>
        </div>

        {/* Dynamic Warning badge */}
        {transformer.status === "error" && isEnergized && (
          <div className="absolute top-3 right-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-md animate-bounce flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>HARORAT XAVFI!</span>
          </div>
        )}

        <div className="w-full flex justify-center py-5">
          <svg viewBox="0 0 400 300" className="w-full max-w-[480px] h-auto overflow-visible">
            
            {/* Definitions for animations and linear gradients */}
            <defs>
              <linearGradient id="flow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d5" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* HIGH VOLTAGE GRID SOURCE LINE (10 kV Incoming) */}
            {/* Horizontal 10 kV Busbar line */}
            <line x1={40} y1={30} x2={360} y2={30} stroke={isEnergized ? "#ea580c" : "#334155"} strokeWidth={3} />
            <text x={335} y={22} fill={isEnergized ? "#ea580c" : "#64748b"} fontSize={8} fontFamily="JetBrains Mono" fontWeight="bold">10 kV SHINA</text>

            {/* INCOMER DOWNWARD FEEDER LINE */}
            <line stroke={isEnergized ? "#ea580c" : "#334155"} strokeWidth={2} x1={200} y1={30} x2={200} y2={65} />

            {/* QS1: HIGH VOLTAGE DISCONNECTOR */}
            {/* Connection circles */}
            <circle cx={200} cy={65} r={3} fill={isEnergized ? "#ea580c" : "#64748b"} />
            <circle cx={200} cy={85} r={3} fill="#64748b" />
            
            {/* Interactive Toggle Switch line for QS1 */}
            {qs1Open ? (
              /* Drawn open at 40 degrees angle */
              <line x1={200} y1={65} x2={218} y2={52} stroke="#f43f5e" strokeWidth={2.5} className="cursor-pointer" onClick={() => setQs1Open(false)} />
            ) : (
              /* Drawn closed */
              <line x1={200} y1={65} x2={200} y2={85} stroke="#10b981" strokeWidth={2.5} className="cursor-pointer" onClick={() => setQs1Open(true)} />
            )}
            <text x={223} y={77} fill="#94a3b8" fontSize={7} fontFamily="JetBrains Mono" className="cursor-pointer" onClick={() => setQs1Open(!qs1Open)}>
              QS1 {qs1Open ? "🔴 Ochiq" : "🟢 Yopiq"}
            </text>

            <line stroke={(!qs1Open) ? "#ea580c" : "#334155"} strokeWidth={2} x1={200} y1={85} x2={200} y2={105} />

            {/* QF1: INCOMING VACUUM CIRCUIT BREAKER */}
            {/* Outlined box representing a solid mechanical breaker */}
            <rect
              x={185}
              y={105}
              width={30}
              height={20}
              rx={3}
              fill="#0f172a"
              stroke={qf1Open ? "#ef4444" : "#10b981"}
              strokeWidth={2}
              className="cursor-pointer"
              onClick={() => setQf1Open(!qf1Open)}
              title="QF1 ni o'chirish / yoqish"
            />
            {/* Inner toggle state symbol */}
            {qf1Open ? (
              <line x1={190} y1={115} x2={210} y2={115} stroke="#f43f5e" strokeWidth={2.5} className="cursor-pointer" onClick={() => setQf1Open(false)} />
            ) : (
              <line x1={200} y1={108} x2={200} y2={122} stroke="#10b981" strokeWidth={2.5} className="cursor-pointer" onClick={() => setQf1Open(true)} />
            )}
            <text x={223} y={118} fill="#94a3b8" fontSize={7} fontFamily="JetBrains Mono" className="cursor-pointer" onClick={() => setQf1Open(!qf1Open)}>
              QF1 {qf1Open ? "🔴 Trip" : "🟢 Closed"}
            </text>

            {/* Main supply flow downward towards Transformer */}
            <line stroke={isEnergized ? "#ea580c" : "#334155"} strokeWidth={2} x1={200} y1={125} x2={200} y2={145} />

            {/* TRANSFORMASTION WINDING SYMBOL (Star/Delta) */}
            {/* Intertwined double circles representing electromagnetic induction */}
            <g transform="translate(180, 145)">
              {/* Primary HV winding (Star symbol inside) */}
              <circle
                cx={20}
                cy={15}
                r={15}
                fill="none"
                stroke={isEnergized ? "#ea580c" : "#475569"}
                strokeWidth={2}
                className={isEnergized && showFlow ? "animate-pulse" : ""}
              />
              <path d="M20,7 L20,15 M20,15 L12,20 M20,15 L28,20" stroke="#f59e0b" strokeWidth={1} />
              
              {/* Secondary LV winding (Delta symbol inside) */}
              <circle
                cx={20}
                cy={27}
                r={15}
                fill="none"
                stroke={isEnergized ? "#3b82f6" : "#475569"}
                strokeWidth={2}
                className={isEnergized && showFlow ? "animate-pulse" : ""}
              />
              <path d="M20,20 L13,31 L27,31 Z" fill="none" stroke="#60a5fa" strokeWidth={1} />
              
              <text x={42} y={23} fill="#f3f4f6" fontSize={8} fontFamily="Space Grotesk" fontWeight="bold">{transformer.type}</text>
              <text x={42} y={32} fill="#64748b" fontSize={7} fontFamily="Space Grotesk">{transformer.nominalPower} kVA (Dyn11)</text>

              {/* Live Temperature readout box on the side */}
              <g transform="translate(42, -15)">
                <rect x={0} y={0} width={45} height={14} rx={2} fill="#0d1527" stroke="#1e293b" strokeWidth={1} />
                <text
                  x={22.5}
                  y={10}
                  textAnchor="middle"
                  fill={transformer.temperature > 85 ? "#ef4444" : transformer.temperature > 70 ? "#f97316" : "#10b981"}
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {transformer.temperature}°C
                </text>
              </g>
            </g>

            {/* LOW VOLTAGE GRID CONNECTIONS (0.4 kV) */}
            <line stroke={isEnergized ? "#3b82f6" : "#334155"} strokeWidth={2.5} x1={200} y1={187} x2={200} y2={215} />

            {/* QF2: LOW VOLTAGE MAIN BREAKER */}
            <rect
              x={186}
              y={215}
              width={28}
              height={18}
              rx={2}
              fill="#090d16"
              stroke={isEnergized ? "#10b981" : "#cf1d1d"}
              strokeWidth={1.5}
            />
            <line x1={190} y1={224} x2={210} y2={224} stroke={isEnergized ? "#10b981" : "#ef4444"} strokeWidth={1.5} />
            <text x={223} y={226} fill="#64748b" fontSize={7} fontFamily="JetBrains Mono">
              QF2 (LV)
            </text>

            <line stroke={isEnergized ? "#3b82f6" : "#334155"} strokeWidth={2.5} x1={200} y1={233} x2={200} y2={255} strokeDasharray={(!isEnergized && showFlow) ? "2 2" : "0"} />

            {/* 0.4 kV OUTGOING BUSBARS (Three phase splits - Yellow, Green, Red) */}
            <line x1={50} y1={255} x2={350} y2={255} stroke={isEnergized ? "#f59e0b" : "#475569"} strokeWidth={2.5} /> {/* Phase A bus */}
            <line x1={50} y1={260} x2={350} y2={260} stroke={isEnergized ? "#10b981" : "#475569"} strokeWidth={2.5} /> {/* Phase B bus */}
            <line x1={50} y1={265} x2={350} y2={265} stroke={isEnergized ? "#ef4444" : "#475569"} strokeWidth={2.5} /> {/* Phase C bus */}

            <text x={300} y={250} fill={isEnergized ? "#60a5fa" : "#64748b"} fontSize={8} fontFamily="JetBrains Mono" fontWeight="bold">0.4 kV SHINALAR (A,B,C)</text>

            {/* Dynamic load flow particles along lines if energized */}
            {isEnergized && showFlow && (
              <g className="animate-pulse">
                {/* Flow lines highlights */}
                <circle cx={200} cy={45} r={2} fill="#ea580c" />
                <circle cx={200} cy={95} r={2} fill="#f59e0b" />
                <circle cx={200} cy={135} r={2} fill="#10b981" />
                <circle cx={200} cy={202} r={2} fill="#3b82f6" />
                <circle cx={200} cy={244} r={2} fill="#1e40af" />
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic Telemetry Specs */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-900 font-mono text-center text-xs text-slate-400">
          <div>
            <div className="text-[9px] text-slate-500">Fazalararo Tok</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{avgI} A</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500">Fazaviy Kuchlanish</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{avgV} V</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500">Moy Harorati</div>
            <div className={`text-sm font-bold mt-0.5 ${transformer.temperature > 85 ? "text-red-400" : transformer.temperature > 70 ? "text-orange-400" : "text-emerald-400"}`}>
              {transformer.temperature} °C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
