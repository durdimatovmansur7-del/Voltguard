import React from "react";
import { AppNotification } from "../types";
import {
  Bell,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Filter,
} from "lucide-react";

interface NotificationsPageProps {
  notifications: AppNotification[];
  onClearNotifications: () => void;
}

export default function NotificationsPage({ notifications, onClearNotifications }: NotificationsPageProps) {
  const errorCount = notifications.filter((n) => n.type === "error").length;
  const warningCount = notifications.filter((n) => n.type === "warning").length;
  const infoCount = notifications.filter((n) => n.type === "info").length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Ogohlantirishlar</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Tizim xabarnomalar va ogohlantirish jurnali</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearNotifications}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-950/50 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Barchasini Tozalash
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-950/15 border border-red-900/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-red-500/20 p-2.5 rounded-xl">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-red-400 font-mono">{errorCount}</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">Kritik Xatolar</div>
          </div>
        </div>

        <div className="bg-amber-950/15 border border-amber-900/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-amber-500/20 p-2.5 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400 font-mono">{warningCount}</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">Ogohlantirishlar</div>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2.5 rounded-xl">
            <Info className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-cyan-400 font-mono">{infoCount}</div>
            <div className="text-[10px] text-slate-500 font-mono uppercase">Ma'lumotlar</div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="border border-slate-800 bg-[#090f1d]/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-purple-400" />
          <h3 className="font-display font-bold text-sm text-slate-200">Barcha Xabarnomalar</h3>
          <span className="ml-auto text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-full">
            {notifications.length} ta
          </span>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-600">
            <CheckCircle2 className="w-12 h-12 text-slate-800 mb-3" />
            <p className="text-sm font-mono">Barcha uskunalar me'yorida ishlayapti.</p>
            <p className="text-xs text-slate-700 mt-1">Faol buzilishlar yoki ogohlantirishlar yo'q.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {notifications.map((notif) => {
              const config = {
                info: {
                  border: "border-slate-800/80",
                  bg: "bg-slate-950/30",
                  icon: <Info className="w-4 h-4 text-cyan-400" />,
                  textColor: "text-slate-300",
                },
                warning: {
                  border: "border-amber-900/30",
                  bg: "bg-amber-950/10",
                  icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
                  textColor: "text-amber-300",
                },
                error: {
                  border: "border-red-900/30",
                  bg: "bg-red-950/10",
                  icon: <XCircle className="w-4 h-4 text-red-400" />,
                  textColor: "text-red-300",
                },
              }[notif.type];

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border ${config.border} ${config.bg} flex items-start gap-3 transition-colors hover:bg-slate-900/30`}
                >
                  <div className="shrink-0 mt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs font-mono text-slate-300 uppercase">{notif.transformerName}</span>
                      <span className="text-[10px] text-slate-600 font-mono shrink-0">{notif.time}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${config.textColor}`}>{notif.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
