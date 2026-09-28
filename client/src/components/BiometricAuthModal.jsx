import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Sparkles,
  UserCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { api } from '../api/client';
import {
  playBiometricChime,
  detectDeviceBiometrics,
  saveStoredBiometricToken,
  saveLastBioUser,
  getLastBioUser,
  triggerNativeBiometricAuth
} from '../utils/biometrics';

export default function BiometricAuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('fingerprint'); // 'fingerprint' | 'face_id'
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const scanTimerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const dev = detectDeviceBiometrics();
    setDeviceInfo(dev);
    if (dev.defaultType === 'mobile_face_id') {
      setAuthMode('face_id');
    }

    // Load available users
    loadBiometricUsers();
  }, [isOpen]);

  const loadBiometricUsers = async () => {
    try {
      const res = await api.getBiometricUsersEnabled();
      if (res && res.users) {
        setUsersList(res.users);
        const lastUser = getLastBioUser();
        if (lastUser) {
          const found = res.users.find(u => u.username === lastUser.username || u.id === lastUser.id);
          if (found) {
            setSelectedUser(found);
            return;
          }
        }
        // Default to first user or sales/ceo
        setSelectedUser(res.users[0] || null);
      }
    } catch (err) {
      console.error('Failed to load biometric users', err);
    }
  };

  const handleStartBiometricScan = async (userOverride = null) => {
    const targetUser = userOverride || selectedUser;
    if (!targetUser) {
      setErrorMessage('لطفاً ابتدا پرسنل مورد نظر را انتخاب نمایید.');
      setStatus('error');
      return;
    }

    setStatus('scanning');
    setErrorMessage('');
    setScanProgress(10);
    playBiometricChime('scan');

    // Simulate progressive scanning while invoking native WebAuthn
    let progress = 10;
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    scanTimerRef.current = setInterval(() => {
      progress += 18;
      if (progress >= 90) progress = 90;
      setScanProgress(progress);
    }, 120);

    try {
      // 1. Get challenge
      const challengeRes = await api.getBiometricLoginChallenge(targetUser.username).catch(() => ({ challenge: 'default_challenge' }));
      
      // 2. Trigger native device prompt (if supported by OS/browser)
      await triggerNativeBiometricAuth(challengeRes.challenge, targetUser.username);

      // 3. Verify on server
      const verifyRes = await api.verifyBiometricLogin({
        userId: targetUser.id,
        username: targetUser.username,
        deviceType: authMode === 'face_id' ? 'mobile_face_id' : 'mobile_fingerprint',
        deviceName: deviceInfo?.deviceName || 'گوشی همراه پرسنل',
        authMethod: authMode
      });

      clearInterval(scanTimerRef.current);
      setScanProgress(100);

      if (verifyRes && verifyRes.token) {
        setStatus('success');
        playBiometricChime('success');
        
        // Save stored token & last user for next fast login
        if (verifyRes.bioToken) {
          saveStoredBiometricToken(verifyRes.bioToken);
        }
        saveLastBioUser(verifyRes.user);

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(verifyRes);
          }
        }, 850);
      } else {
        throw new Error(verifyRes.error || 'اعتبارسنجی بیومتریک ناموفق بود.');
      }
    } catch (err) {
      clearInterval(scanTimerRef.current);
      playBiometricChime('error');
      setStatus('error');
      setErrorMessage(err.message || 'خطا در اسکن بیومتریک دستگاه. لطفاً مجدداً تلاش کنید.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 select-none" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header with Pastel Accent */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/25 flex items-center justify-center">
              {authMode === 'face_id' ? <ScanFace className="w-6 h-6" /> : <Fingerprint className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800">ورود بیومتریک پرسنل</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  سریع و امن
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                احراز هویت با سنسور اثر انگشت یا تشخیص چهره موبایل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Mode Tabs (Fingerprint vs Face ID) */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => { setAuthMode('fingerprint'); setStatus('idle'); setErrorMessage(''); }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                authMode === 'fingerprint'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-4 h-4 text-teal-600" />
              <span>اثر انگشت (Fingerprint)</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('face_id'); setStatus('idle'); setErrorMessage(''); }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                authMode === 'face_id'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ScanFace className="w-4 h-4 text-emerald-600" />
              <span>تشخیص چهره (Face ID)</span>
            </button>
          </div>

          {/* Personnel Quick Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                انتخاب پرسنل جهت احراز هویت:
              </span>
              {selectedUser && (
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                  {selectedUser.department}
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              {usersList.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setStatus('idle');
                      setErrorMessage('');
                    }}
                    className={`p-2 rounded-xl text-right transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {u.full_name ? u.full_name.charAt(0) : 'U'}
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-black truncate">{u.full_name}</div>
                      <div className={`text-[9px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {u.username}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Scanning Area */}
          <div className="flex flex-col items-center justify-center py-4 px-2 space-y-4">
            
            {/* Visual Scanner Pad */}
            <div className="relative flex items-center justify-center">
              
              {/* Outer Pulsing Rings */}
              <div className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
                status === 'scanning'
                  ? 'bg-teal-400/20 animate-ping'
                  : status === 'success'
                  ? 'bg-emerald-400/30 scale-110'
                  : 'bg-slate-100'
              }`} />

              <div className={`absolute w-28 h-28 rounded-full border-2 border-dashed transition-all duration-500 ${
                status === 'scanning'
                  ? 'border-teal-500 animate-spin-slow'
                  : status === 'success'
                  ? 'border-emerald-500'
                  : 'border-slate-300'
              }`} />

              {/* Main Sensor Button */}
              <button
                type="button"
                onClick={() => handleStartBiometricScan()}
                disabled={status === 'scanning' || status === 'success'}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 ${
                  status === 'scanning'
                    ? 'bg-gradient-to-tr from-teal-500 to-cyan-500 ring-4 ring-teal-200 animate-pulse'
                    : status === 'success'
                    ? 'bg-emerald-600 ring-4 ring-emerald-200'
                    : status === 'error'
                    ? 'bg-rose-600 ring-4 ring-rose-200'
                    : 'bg-gradient-to-tr from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-500/30'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                ) : status === 'scanning' ? (
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                ) : authMode === 'face_id' ? (
                  <ScanFace className="w-11 h-11 text-white" />
                ) : (
                  <Fingerprint className="w-11 h-11 text-white" />
                )}
              </button>

              {/* Animated Laser Scan Bar (Top to Bottom) */}
              {status === 'scanning' && (
                <div className="absolute z-20 w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_8px_#34d399] animate-bounce pointer-events-none" />
              )}
            </div>

            {/* Status Information */}
            <div className="text-center space-y-1">
              {status === 'idle' && (
                <>
                  <p className="text-xs font-black text-slate-800">
                    برای اسکن {authMode === 'face_id' ? 'چهره' : 'اثر انگشت'}، روی سنسور کلیک کرده یا انگشت خود را روی گوشی قرار دهید
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    پشتیبانی از سنسورهای بیومتریک اندروید، آیفون، مک و ویندوز هلو
                  </p>
                </>
              )}

              {status === 'scanning' && (
                <>
                  <p className="text-xs font-black text-teal-700 flex items-center justify-center gap-1.5 animate-pulse">
                    <Sparkles className="w-4 h-4 text-teal-500" />
                    در حال اعتبارسنجی بیومتریک برای «{selectedUser?.full_name}»... ({scanProgress}%)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    لطفاً سنسور اثر انگشت یا دوربین تشخیص چهره گوشی را تایید فرمایید
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <p className="text-xs font-black text-emerald-700 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    احراز هویت بیومتریک با موفقیت تایید شد!
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold">
                    در حال انتقال به کارتابل اختصاصی...
                  </p>
                </>
              )}

              {status === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2 text-right">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

          </div>

          {/* Device & Security Info Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-700">دستگاه شناسایی‌شده:</span>
              <span className="text-teal-700 font-bold truncate max-w-[180px]">
                {deviceInfo?.deviceName || 'دستگاه همراه پرسنل'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>رمزنگاری سخت‌افزاری FIDO2</span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={() => handleStartBiometricScan()}
            disabled={status === 'scanning' || status === 'success'}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
          >
            {authMode === 'face_id' ? <ScanFace className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
            <span>
              {status === 'scanning'
                ? 'در حال خواندن اطلاعات سنسور...'
                : status === 'success'
                ? 'ورود موفقیت‌آمیز ✅'
                : `ورود با ${authMode === 'face_id' ? 'تشخیص چهره (Face ID)' : 'اثر انگشت'} برای ${selectedUser?.full_name || 'پرسنل'}`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
