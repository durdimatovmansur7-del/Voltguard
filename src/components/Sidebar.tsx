import React from "react";
import {
  Zap,
  LayoutDashboard,
  Activity,
  BarChart3,
  Wrench,
  Sliders,
  Bell,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type PageId = "dashboard" | "telemetry" | "charts" | "maintenance" | "simulator" | "notifications" | "diagnosis";

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  notificationCount: number;
  alarmCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode; badge?: "notifications" | "alarms" }[] = [
  { id: "dashboard", label: "Bosh Sahifa", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "telemetry", label: "Telemetriya", icon: <Zap className="w-5 h-5" /> },
  { id: "charts", label: "Grafiklar", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "maintenance", label: "Texnik Xizmat", icon: <Wrench className="w-5 h-5" /> },
  { id: "simulator", label: "Simulator", icon: <Sliders className="w-5 h-5" /> },
  { id: "notifications", label: "Ogohlantirishlar", icon: <Bell className="w-5 h-5" />, badge: "notifications" },
  { id: "diagnosis", label: "AI Diagnostika", icon: <Brain className="w-5 h-5" /> },
];

export default function Sidebar({ activePage, onNavigate, notificationCount, alarmCount, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-[#0a0f1d]/95 backdrop-blur-xl border-r border-slate-800/60 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[220px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/40">
        <div className="relative shrink-0">
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
          <div className="bg-cyan-400/10 border border-cyan-400/40 p-2 rounded-xl text-cyan-400">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-[11px] font-extrabold tracking-wide text-white uppercase leading-tight">
              TRANSFORMATOR
            </h1>
            <p className="text-[8px] text-slate-500 font-mono tracking-wider font-semibold">SCADA MONITORING</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          let badgeValue = 0;
          if (item.badge === "notifications") badgeValue = notificationCount;
          if (item.badge === "alarms") badgeValue = alarmCount;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full" />}
              <span className={`shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {badgeValue > 0 && (
                <span className={`${collapsed ? "absolute top-1 right-1" : "ml-auto"} bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                  {badgeValue > 99 ? "99+" : badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-800/40 p-3">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all cursor-pointer text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Yig'ish</span>}
        </button>
      </div>
    </aside>
  );
}
