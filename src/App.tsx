import React, { useState, useEffect, useCallback } from "react";
import { Transformer, AppNotification } from "./types";
import TransformerForm from "./components/TransformerForm";
import AIDiagnosisPanel from "./components/AIDiagnosisPanel";
import Sidebar, { PageId } from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import TelemetryPage from "./pages/TelemetryPage";
import ChartsPage from "./pages/ChartsPage";
import MaintenancePage from "./pages/MaintenancePage";
import SimulatorPage from "./pages/SimulatorPage";
import NotificationsPage from "./pages/NotificationsPage";
import {
  Zap,
  Plus,
  Clock,
  Bell,
} from "lucide-react";

// Pre-populate four realistic transformers in Tashkent
const INITIAL_TRANSFORMERS: Transformer[] = [
  {
    id: "TR-2401",
    name: "T-1 (Fayzobod nimstansiyasi)",
    location: "Yashnobod tumani, Fayzobod ko'chasi",
    type: "TMZ-1000/10",
    nominalPower: 1000,
    primaryVoltage: 10,
    secondaryVoltage: 0.4,
    voltage: { A: 219, B: 221, C: 218 },
    current: { A: 145, B: 138, C: 152 },
    temperature: 52,
    oilLevel: "normal",
    lastUpdated: "Hozirgina",
    status: "normal",
    history: [
      { time: "18:00", temp: 48, load: 38, voltageAvg: 220 },
      { time: "19:00", temp: 50, load: 42, voltageAvg: 219 },
      { time: "20:00", temp: 53, load: 46, voltageAvg: 221 },
      { time: "21:00", temp: 52, load: 45, voltageAvg: 219 },
    ],
  },
  {
    id: "TR-2402",
    name: "T-2 (Yunusobod 12-dahasi)",
    location: "Yunusobod tumani, Bog'ishamol ko'chasi",
    type: "TMG-630/10",
    nominalPower: 630,
    primaryVoltage: 10,
    secondaryVoltage: 0.4,
    voltage: { A: 206, B: 211, C: 208 },
    current: { A: 198, B: 212, C: 209 },
    temperature: 71,
    oilLevel: "normal",
    lastUpdated: "Hozirgina",
    status: "warning",
    history: [
      { time: "18:00", temp: 64, load: 82, voltageAvg: 214 },
      { time: "19:00", temp: 67, load: 88, voltageAvg: 211 },
      { time: "20:00", temp: 70, load: 92, voltageAvg: 208 },
      { time: "21:00", temp: 71, load: 93, voltageAvg: 207 },
    ],
  },
  {
    id: "TR-2403",
    name: "T-3 (Yunusobod Metro liniyasi)",
    location: "Yunusobod tumani, Amir Temur ko'chasi",
    type: "TSZ-400/10",
    nominalPower: 400,
    primaryVoltage: 10,
    secondaryVoltage: 0.4,
    voltage: { A: 222, B: 224, C: 221 },
    current: { A: 64, B: 58, C: 61 },
    temperature: 42,
    oilLevel: "normal",
    lastUpdated: "Hozirgina",
    status: "normal",
    history: [
      { time: "18:00", temp: 40, load: 22, voltageAvg: 223 },
      { time: "19:00", temp: 41, load: 24, voltageAvg: 222 },
      { time: "20:00", temp: 42, load: 25, voltageAvg: 224 },
      { time: "21:00", temp: 42, load: 24, voltageAvg: 222 },
    ],
  },
  {
    id: "TR-2404",
    name: "T-4 (Sirg'ali Sanoat zonasi)",
    location: "Sirg'ali tumani, Yangi-Hayot ko'chasi",
    type: "TMG-1600/10",
    nominalPower: 1600,
    primaryVoltage: 10,
    secondaryVoltage: 0.4,
    voltage: { A: 218, B: 220, C: 217 },
    current: { A: 210, B: 232, C: 215 },
    temperature: 87,
    oilLevel: "low",
    lastUpdated: "Hozirgina",
    status: "error",
    history: [
      { time: "18:00", temp: 78, load: 68, voltageAvg: 219 },
      { time: "19:00", temp: 81, load: 72, voltageAvg: 218 },
      { time: "20:00", temp: 84, load: 75, voltageAvg: 218 },
      { time: "21:00", temp: 87, load: 74, voltageAvg: 218 },
    ],
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    time: "21:14",
    transformerName: "T-4 (Sirg'ali)",
    message: "Moy harorati me'yoriy 75°C darajadan oshdi (87°C)!",
    type: "error",
  },
  {
    id: "notif-2",
    time: "21:12",
    transformerName: "T-4 (Sirg'ali)",
    message: "Datchik ogohlantirishi: Moy sathining pasayishi kashf etildi!",
    type: "error",
  },
  {
    id: "notif-3",
    time: "21:02",
    transformerName: "T-2 (Yunusobod)",
    message: "Faza yuklamalari oshmoqda (O'rtacha tok kuchi: 206A).",
    type: "warning",
  },
];

export default function App() {
  const [transformers, setTransformers] = useState<Transformer[]>(INITIAL_TRANSFORMERS);
  const [selectedId, setSelectedId] = useState<string>("TR-2401");
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [autoTransmit, setAutoTransmit] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [maintenanceLogs, setMaintenanceLogs] = useState<Record<string, Array<{ id: string; date: string; engineer: string; action: string; result: string }>>>({
    "TR-2401": [
      { id: "log-1", date: "2026-05-10", engineer: "Raximov S.", action: "Moy sathi va kislotaliligini sinovdan o'tkazish", result: "Me'yorda, 0.02 mg KOH/g" },
      { id: "log-2", date: "2026-04-15", engineer: "Sodiqov M.", action: "Profilaktika va kontaktlarni taranglash", result: "Barcha klemma birikmalari mustahkamlandi" }
    ],
    "TR-2402": [
      { id: "log-3", date: "2026-05-02", engineer: "Nazarov T.", action: "Havo quritgichdagi silikagelni yangilash", result: "2 kg yangi silikagel to'ldirildi" }
    ],
    "TR-2404": [
      { id: "log-4", date: "2026-05-18", engineer: "Usmonov B.", action: "Moy sizib chiqishini tekshirish", result: "⚠️ Radiator qovurg'asida mayda darz aniqlandi, kley quyish rejalashtirildi" }
    ]
  });

  const handleAddMaintenanceLog = (transformerId: string, log: { date: string; engineer: string; action: string; result: string }) => {
    const newLog = {
      id: `log-${Date.now()}`,
      ...log
    };
    setMaintenanceLogs(prev => ({
      ...prev,
      [transformerId]: [newLog, ...(prev[transformerId] || [])]
    }));
    pushNotification(
      transformers.find(t => t.id === transformerId)?.name || "Transformator",
      `Yangi texnik xizmat yozuvi kiritildi: ${log.action}`,
      "info"
    );
  };

  // Update live system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("UZ-uz", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute selected transformer
  const selectedTransformer = transformers.find((t) => t.id === selectedId) || transformers[0];

  // Helper to append notifications
  const pushNotification = useCallback((transformerName: string, message: string, type: "info" | "warning" | "error") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("UZ-uz", { hour: "2-digit", minute: "2-digit" });
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      time: timeStr,
      transformerName,
      message,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
  }, []);

  // Update specific transformer telemetry
  const handleUpdateTelemetry = useCallback(
    (
      id: string,
      voltage: { A: number; B: number; C: number },
      current: { A: number; B: number; C: number },
      temperature: number,
      oilLevel: "normal" | "low"
    ) => {
      setTransformers((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;

          const maxSafeCurrent = Math.round((t.nominalPower * 1000) / (3 * 220));
          const avgCurrent = (current.A + current.B + current.C) / 3;
          const loadPercent = (avgCurrent / maxSafeCurrent) * 100;

          let status: "normal" | "warning" | "error" = "normal";
          if (temperature > 85 || oilLevel === "low" || loadPercent > 115) {
            status = "error";
          } else if (temperature > 70 || loadPercent > 85) {
            status = "warning";
          }

          if (status === "error" && t.status !== "error") {
            pushNotification(t.name, `Kritik ogohlantirish! Harorat: ${temperature}°C, Moy: ${oilLevel === "low" ? "KAMAYGAN" : "OK"}`, "error");
          } else if (status === "warning" && t.status === "normal") {
            pushNotification(t.name, `Ogohlantirish holati: Harorat ${temperature}°C ga ko'tarildi.`, "warning");
          }

          const nowStr = new Date().toLocaleTimeString("UZ-uz", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          const newHistoryPoint = {
            time: nowStr,
            temp: temperature,
            load: Math.round(loadPercent),
            voltageAvg: Math.round((voltage.A + voltage.B + voltage.C) / 3),
          };

          const history = [...t.history.slice(-9), newHistoryPoint];

          return {
            ...t,
            voltage,
            current,
            temperature,
            oilLevel,
            status,
            history,
            lastUpdated: "Hozirgina",
          };
        })
      );
    },
    [pushNotification]
  );

  // Background Live Telemetry Fluctuation Loop
  useEffect(() => {
    if (!autoTransmit) return;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * transformers.length);
      const target = transformers[randomIdx];

      const tempDelta = (Math.random() - 0.5) * 1.6;
      const loadDelta = (Math.random() - 0.5) * 6;
      const voltDelta = (Math.random() - 0.5) * 1.5;

      const key = (target.nominalPower * 1000) / (3 * 220);
      const avgCurrentNow = (target.current.A + target.current.B + target.current.C) / 3;
      const nominalMultiplier = Math.max(0.2, Math.min(2.0, (avgCurrentNow + loadDelta) / key));

      const coeff = 1 + (voltDelta / 100);
      const newVoltage = {
        A: Math.max(160, Math.min(260, Math.round(target.voltage.A * coeff))),
        B: Math.max(160, Math.min(260, Math.round(target.voltage.B * coeff))),
        C: Math.max(160, Math.min(260, Math.round(target.voltage.C * coeff))),
      };

      const newBaseCurrent = key * nominalMultiplier;
      const newCurrent = {
        A: Math.round(newBaseCurrent * (0.96 + Math.random() * 0.08)),
        B: Math.round(newBaseCurrent * (0.94 + Math.random() * 0.12)),
        C: Math.round(newBaseCurrent * (0.97 + Math.random() * 0.06)),
      };

      const newTemp = Math.max(20, Math.min(120, Math.round(target.temperature + tempDelta)));

      handleUpdateTelemetry(target.id, newVoltage, newCurrent, newTemp, target.oilLevel);
    }, 4500);

    return () => clearInterval(interval);
  }, [autoTransmit, transformers, handleUpdateTelemetry]);

  // Form submit callback for registering a new Transformer
  const handleAddTransformerSubmit = (data: {
    name: string;
    location: string;
    type: string;
    nominalPower: number;
    primaryVoltage: number;
    secondaryVoltage: number;
  }) => {
    const newId = `TR-${2400 + transformers.length + 1}`;
    const newTransformer: Transformer = {
      id: newId,
      name: data.name,
      location: data.location,
      type: data.type,
      nominalPower: data.nominalPower,
      primaryVoltage: data.primaryVoltage,
      secondaryVoltage: data.secondaryVoltage,
      voltage: { A: 220, B: 219, C: 221 },
      current: { A: 45, B: 40, C: 43 },
      temperature: 38,
      oilLevel: "normal",
      lastUpdated: "Yangi ro'yxatga olindi",
      status: "normal",
      history: [
        { time: "21:00", temp: 37, load: 15, voltageAvg: 220 },
        { time: "21:10", temp: 38, load: 16, voltageAvg: 220 },
      ],
    };

    setTransformers((prev) => [...prev, newTransformer]);
    setSelectedId(newId);
    pushNotification(data.name, "Yangi transformator monitoring tarmog'iga muvaffaqiyatli qo'shildi.", "info");
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Navigate handler
  const handleNavigate = (page: PageId) => {
    if (page === "diagnosis") {
      setIsDiagnosisOpen(true);
      return;
    }
    setActivePage(page);
  };

  const activeAlarmsCount = transformers.filter((t) => t.status !== "normal").length;

  // Render active page content
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <DashboardPage
            transformers={transformers}
            selectedId={selectedId}
            onSelectTransformer={setSelectedId}
            onNavigate={handleNavigate}
          />
        );
      case "telemetry":
        return (
          <TelemetryPage
            transformers={transformers}
            selectedTransformer={selectedTransformer}
            selectedId={selectedId}
            onSelectTransformer={setSelectedId}
            onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
          />
        );
      case "charts":
        return (
          <ChartsPage
            transformers={transformers}
            selectedTransformer={selectedTransformer}
            selectedId={selectedId}
            onSelectTransformer={setSelectedId}
          />
        );
      case "maintenance":
        return (
          <MaintenancePage
            transformers={transformers}
            selectedTransformer={selectedTransformer}
            selectedId={selectedId}
            onSelectTransformer={setSelectedId}
            maintenanceLogs={maintenanceLogs}
            onAddLog={handleAddMaintenanceLog}
          />
        );
      case "simulator":
        return (
          <SimulatorPage
            transformers={transformers}
            selectedTransformer={selectedTransformer}
            selectedId={selectedId}
            onSelectTransformer={setSelectedId}
            onUpdateTelemetry={handleUpdateTelemetry}
            autoTransmit={autoTransmit}
            onToggleAutoTransmit={() => setAutoTransmit(!autoTransmit)}
          />
        );
      case "notifications":
        return (
          <NotificationsPage
            notifications={notifications}
            onClearNotifications={handleClearNotifications}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex font-sans antialiased selection:bg-cyan-500 selection:text-slate-900" id="main-scada-app">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        notificationCount={notifications.length}
        alarmCount={activeAlarmsCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-[72px]" : "ml-[220px]"}`}>
        
        {/* Top Header Bar */}
        <header className="border-b border-slate-900 bg-[#0a0f1d]/85 backdrop-blur-md sticky top-0 z-20 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Page breadcrumb */}
            <div className="flex items-center gap-3">
              <h2 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wide">
                {activePage === "dashboard" && "Bosh Sahifa"}
                {activePage === "telemetry" && "Telemetriya"}
                {activePage === "charts" && "Grafiklar"}
                {activePage === "maintenance" && "Texnik Xizmat"}
                {activePage === "simulator" && "Simulator"}
                {activePage === "notifications" && "Ogohlantirishlar"}
              </h2>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Notification badge button */}
              <button
                onClick={() => setActivePage("notifications")}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {/* Clock */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-3.5 py-1.5 text-center font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentTime} UZ</span>
              </div>

              {/* Add button */}
              <button
                onClick={() => setIsAddOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-display font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Yangi Qo'shish</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-4 bg-[#05080e] select-none text-center">
          <div className="px-6 text-[10px] text-slate-600 font-mono tracking-wide">
            <p>© 2026 TRANSFORMATORLAR MONITORINGI TIZIMI • LOCHIN KO'Z SCADA V4.2</p>
          </div>
        </footer>
      </div>

      {/* Add New Transformer Dialog Modal */}
      {isAddOpen && (
        <TransformerForm
          onAddTransformer={handleAddTransformerSubmit}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {/* AI Diagnostic Report Drawer Panel */}
      {isDiagnosisOpen && (
        <AIDiagnosisPanel
          transformer={selectedTransformer}
          onClose={() => setIsDiagnosisOpen(false)}
        />
      )}
    </div>
  );
}
