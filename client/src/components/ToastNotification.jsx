import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Send, X, Sparkles } from 'lucide-react';
import { playNotificationSound } from '../utils/helpers';

export default function ToastNotification() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { id, message, title, type = 'success', duration = 4500 } = e.detail || {};
      if (!message) return;

      try {
        playNotificationSound();
        if (navigator.vibrate) {
          navigator.vibrate([25, 40, 25]);
        }
      } catch (err) {}

      const newToast = {
        id: id || 'toast_' + Date.now(),
        message,
        title: title || (type === 'success' ? 'ثبت و ارسال موفق' : 'اطلاعیه سیستم'),
        type,
        duration,
        progress: 100
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    };

    window.addEventListener('app_toast_notification', handleToastEvent);
    return () => window.removeEventListener('app_toast_notification', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 inset-x-0 z-[99999] pointer-events-none flex flex-col items-center gap-2.5 px-4 font-sans select-none"
      dir="rtl"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto max-w-md w-full rounded-2xl shadow-2xl p-4 border backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-500/20 ring-1 ring-emerald-400/30'
                : isError
                ? 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-500/20 ring-1 ring-rose-400/30'
                : 'bg-slate-900/95 text-white border-cyan-500/50 shadow-cyan-500/20'
            }`}
          >
            {/* Right: Icon */}
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isSuccess
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40 ring-2 ring-emerald-300/40'
                    : isError
                    ? 'bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-rose-500/40'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-cyan-500/40'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                ) : isError ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Center: Title & Message */}
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-white">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Send className="w-2.5 h-2.5" />
                    ارسال شد
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-200 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>

            {/* Left: Close Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
