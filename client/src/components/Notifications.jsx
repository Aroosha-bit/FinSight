import { Bell, X, Settings, TriangleAlert } from "lucide-react";
import { useState } from "react";

const notifications = [
  {
    id: 1,
    title: "Spending Alerts",
    message: "You've reached 90% of your Food budget.",
    time: "15 mins ago",
  },
  {
    id: 2,
    title: "Bill Reminders",
    message: "Internet bill due tomorrow.",
    time: "15 mins ago",
  },
  {
    id: 3,
    title: "AI suggestions",
    message:
      "Last month you overspent on shopping. Consider setting a tighter limit this month.",
    time: "15 mins ago",
  },
  {
    id: 4,
    title: "Savings nudges",
    message:
      "You've saved ₹5,000 this month. Great job! Consider investing it.",
    time: "15 mins ago",
  },
];

export default function Notifications({ onClose, onMarkAllRead, onSettings }) {
  const [markAllRead, setMarkAllRead] = useState(false);
  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close notifications"
          className="text-red-700 hover:text-red-900 cursor-pointer transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* List */}
      <div className="px-4 pb-4 flex flex-col gap-3 max-h-[420px] overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`${
              markAllRead ? "bg-white" : "bg-blue-50/70"
            } rounded-xl px-4 py-4 flex items-start justify-between gap-3`}
          >
            <div>
              <p className="font-bold text-slate-500 text-base">{n.title}</p>
              <p className="text-slate-500 text-sm mt-1 leading-snug">
                {n.message}
              </p>
              <p className="text-slate-400 text-xs font-medium mt-2">
                {n.time}
              </p>
            </div>
            <TriangleAlert className="w-6 h-6 text-amber-500 fill-amber-500/20 shrink-0 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <button
          onClick={onSettings}
          className="flex cursor-pointer items-center gap-2 text-slate-500 hover:text-slate-700 text-base font-medium transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={() => setMarkAllRead((prev) => !prev)}
          className="text-red-600 hover:text-red-700 cursor-pointer text-base font-semibold transition-colors"
        >
          mark all as read
        </button>
      </div>
    </div>
  );
}
