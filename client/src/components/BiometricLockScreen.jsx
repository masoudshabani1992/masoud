import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  ScanFace,
  Lock,
  Unlock,
  ShieldCheck,
  Smartphone,
  LogOut,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  playBiometricChime,
  detectDeviceBiometrics,
  triggerNativeBiometricAuth,
  isAutoBiometricPromptEnabled,
  setAutoBiometricPromptEnabled
} from '../utils/biometrics';
import { ROLES } from '../utils/helpers';

export default function BiometricLockScreen({ user, onUnlock, onLogout }) {
  const [status, setStatus] = useState('locked'); // 'locked' | 'scanning' | 'unlocked' | 'error'
  const [authMode, setAuthMode] = useState('fingerprint'); // 'fingerprint' | 'face_id'
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [autoLockSetting, setAutoLockSetting] = useState(isAutoBiometricPromptEnabled());

  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const dev = detectDeviceBiometrics();
    setDeviceInfo(dev);
    if (dev.defaultType === 'mobile_face_id') {
      setAuthMode('face_id');
    }

    // Auto-prompt on mount if mobile
    if (dev.isMobile) {
      const timer = setTimeout(() => {
        handleQuickBiometricScan();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleQuickBiometricScan = async () => {
    if (status === 'scanning' || status === 'unlocked') return;

    setStatus('scanning');
    setErrorMessage('');
    setScanProgress(15);
    playBiometricChime('scan');

    if (navigator.vibrate) {
      navigator.vibrate([30]);
    }

    let progress = 15;
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      progress += 20;
      if (progress >= 95) progress = 95;
      setScanProgress(progress);
    }, 100);

    try {
      // Trigger native biometric prompt if available
      await triggerNativeBiometricAuth('lock_screen_challenge', user?.username || '');

      setTimeout(() => {
        clearInterval(progressIntervalRef.current);
        setScanProgress(100);
        setStatus('unlocked');
        playBiometricChime('success');

        if (navigator.vibrate) {
          navigator.vibrate([50, 80, 50]);
        }

        setTimeout(() => {
          onUnlock();
        }, 500);
      }, 700);
    } catch (err) {
      clearInterval(progressIntervalRef.current);
      setStatus('error');
      setErrorMessage(err.message || 'احراز هویت بیومتریک ناموفق بود. لطفاً مجدداً لمس کنید.');
      playBiometricChime('error');
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handleTouchStart = () => {
    setIsHolding(true);
    handleQuickBiometricScan();
  };

  const handleTouchEnd = () => {
    setIsHolding(false);
  };

  const toggleAutoLock = (enabled) => {
    setAutoLockSetting(enabled);
    setAutoBiometricPromptEnabled(enabled);
  };

  const roleTitle = ROLES.find(r => r.id === user?.role)?.name || user?.department || 'پرسنل کارخانه';

  return (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-6 select-none font-sans overflow-hidden"
      dir="rtl"
    >
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-700"></div>

      {/* Top Header: Factory Brand & Lock Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              سامانه اتوماسیون آرمان امیران
            </h1>
            <p className="text-xs text-indigo-300 font-medium">قفل امنیتی بیومتریک کارخانه</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>امنیت سخت‌افزاری</span>
        </div>
      </div>

      {/* Center Main: User Card & Big Tactile Touch Sensor */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto max-w-sm mx-auto w-full text-center">
        {/* User Card */}
        <div className="mb-6 p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl w-full">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl font-black text-white">
                {(user?.full_name || user?.fullName || user?.username || 'U').charAt(0)}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h2 className="text-lg font-black text-white mb-1">
            {user?.full_name || user?.fullName || user?.username}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {roleTitle}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              @{user?.username}
            </span>
          </div>
        </div>

        {/* Biometric Scanning Touch Zone */}
        <div className="relative flex flex-col items-center justify-center my-3">
          {/* Outer Pulsing Wave Rings */}
          <div
            className={`absolute w-44 h-44 rounded-full border-2 border-indigo-400/30 transition-all duration-700 ${
              status === 'scanning' ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-40'
            }`}
          ></div>
          <div
            className={`absolute w-36 h-36 rounded-full border-2 border-purple-400/40 transition-all duration-500 ${
              status === 'scanning' ? 'scale-110 opacity-100' : 'scale-100 opacity-30'
            }`}
          ></div>

          {/* Interactive Touch Pad Button */}
          <button
            type="button"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onClick={handleQuickBiometricScan}
            className={`relative w-28 h-28 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl ${
              status === 'unlocked'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/50 scale-105'
                : status === 'scanning'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 shadow-indigo-500/60 scale-105 ring-4 ring-indigo-400/50'
                : status === 'error'
                ? 'bg-gradient-to-tr from-rose-600 to-red-600 shadow-rose-500/50'
                : 'bg-gradient-to-tr from-indigo-700 via-purple-700 to-slate-800 shadow-indigo-900/60 hover:brightness-110'
            }`}
          >
            {/* Holographic Laser Sweep Effect */}
            {status === 'scanning' && (
              <div className="absolute inset-x-2 top-0 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee] rounded-full animate-bounce"></div>
            )}

            {status === 'unlocked' ? (
              <Unlock className="w-12 h-12 text-white animate-in zoom-in" />
            ) : authMode === 'face_id' ? (
              <ScanFace
                className={`w-12 h-12 text-white transition-all ${
                  status === 'scanning' ? 'animate-pulse text-cyan-200' : ''
                }`}
              />
            ) : (
              <Fingerprint
                className={`w-12 h-12 text-white transition-all ${
                  status === 'scanning' ? 'animate-pulse text-cyan-200 scale-110' : ''
                }`}
              />
            )}
          </button>
        </div>

        {/* Status Text & Instruction */}
        <div className="mt-4">
          {status === 'unlocked' ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>هویت تأیید شد. در حال ورود به اتوماسیون...</span>
            </div>
          ) : status === 'scanning' ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-bold text-cyan-300 animate-pulse">
                در حال اسکن اثر انگشت... ({scanProgress}٪)
              </span>
              <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage || 'اسکن ناموفق بود؛ مجدداً سنسور را لمس کنید'}</span>
            </div>
          ) : (
            <p className="text-xs text-indigo-200 font-medium">
              {deviceInfo?.isMobile
                ? 'انگشت خود را روی سنسور قرار داده و لمس کنید'
                : 'برای باز شدن قفل اتوماسیون، روی آیکون اثر انگشت کلیک کنید'}
            </p>
          )}
        </div>

        {/* Toggle Mode: Fingerprint vs Face ID */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setAuthMode('fingerprint')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              authMode === 'fingerprint'
                ? 'bg-white/20 text-white border border-white/30 shadow'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>اثر انگشت</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('face_id')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              authMode === 'face_id'
                ? 'bg-white/20 text-white border border-white/30 shadow'
                : 'text-indigo-300 hover:text-white'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>تشخیص چهره</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer: Options & Logout */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-indigo-200 hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={autoLockSetting}
            onChange={(e) => toggleAutoLock(e.target.checked)}
            className="rounded border-white/30 text-indigo-600 focus:ring-indigo-500 bg-white/10"
          />
          <span>قفل خودکار با اثر انگشت در هر بار ورود به برنامه</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600/40 border border-white/15 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج از حساب / تغییر کاربر</span>
          </button>
        </div>
      </div>
    </div>
  );
}
