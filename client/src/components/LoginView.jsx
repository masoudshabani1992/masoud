import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/helpers';
import { api } from '../api/client';
import {
  Boxes,
  Lock,
  User,
  LogIn,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  ScanFace,
  Sparkles,
  Smartphone,
  Zap,
  Unlock,
  ChevronDown
} from 'lucide-react';
import {
  playBiometricChime,
  detectDeviceBiometrics,
  isAutoBiometricPromptEnabled,
  triggerNativeBiometricAuth,
  getLastBioUser,
  saveLastBioUser
} from '../utils/biometrics';

export default function LoginView() {
  const { login, switchRole, loginBiometric } = useAuth();
  
  // Login Mode: 'biometric' (Default) | 'password'
  const [activeTab, setActiveTab] = useState('biometric');
  const [authMode, setAuthMode] = useState('fingerprint'); // 'fingerprint' | 'face_id'
  
  // Password form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Biometric direct state
  const [bioUsers, setBioUsers] = useState([]);
  const [selectedBioUser, setSelectedBioUser] = useState(null);
  const [bioStatus, setBioStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'
  const [scanProgress, setScanProgress] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState(null);

  const scanIntervalRef = useRef(null);

  useEffect(() => {
    const dev = detectDeviceBiometrics();
    setDeviceInfo(dev);
    if (dev.defaultType === 'mobile_face_id') {
      setAuthMode('face_id');
    }

    // Load available biometric users
    loadBiometricUsers();
  }, []);

  const loadBiometricUsers = async () => {
    try {
      const res = await api.getBiometricUsersEnabled();
      if (res && res.users && res.users.length > 0) {
        setBioUsers(res.users);
        const lastUser = getLastBioUser();
        let target = res.users[0];
        if (lastUser) {
          const found = res.users.find(u => u.username === lastUser.username || u.id === lastUser.id);
          if (found) target = found;
        }
        setSelectedBioUser(target);
      } else {
        // Fallback default users
        const fallbackUsers = [
          { id: 1, username: 'admin', full_name: 'مهندس مسعود شعبانی', role: 'admin', department: 'مدیریت ارشد سیستم' },
          { id: 2, username: 'ceo', full_name: 'مدیرعامل کارخانه', role: 'ceo', department: 'مدیریت کارخانه' },
          { id: 3, username: 'sales', full_name: 'امور بازرگانی و فروش', role: 'sales', department: 'واحد فروش' },
          { id: 4, username: 'designer', full_name: 'طراح آتلیه امیران', role: 'design', department: 'آتلیه طراحی' },
          { id: 5, username: 'production', full_name: 'سرپرست سالن تولید', role: 'production', department: 'سالن چاپ و جعبه‌سازی' }
        ];
        setBioUsers(fallbackUsers);
        setSelectedBioUser(fallbackUsers[0]);
      }
    } catch (err) {
      console.warn('Fallback to standard users list');
    }
  };

  const handleStartBiometricScan = async (userToAuth = null) => {
    const targetUser = userToAuth || selectedBioUser;
    if (!targetUser) {
      setError('لطفاً ابتدا پرسنل مورد نظر را انتخاب فرمایید.');
      return;
    }

    setError(null);
    setBioStatus('scanning');
    setScanProgress(15);
    playBiometricChime('scan');

    if (navigator.vibrate) {
      navigator.vibrate([35]);
    }

    let p = 15;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = setInterval(() => {
      p += 22;
      if (p >= 95) p = 95;
      setScanProgress(p);
    }, 110);

    try {
      // 1. Get challenge
      const challengeRes = await api.getBiometricLoginChallenge(targetUser.username).catch(() => ({ challenge: 'default_bio_challenge' }));

      // 2. Prompt native device hardware if available
      await triggerNativeBiometricAuth(challengeRes.challenge, targetUser.username);

      // 3. Verify on server
      const verifyRes = await api.verifyBiometricLogin({
        username: targetUser.username,
        authType: authMode,
        credential: {
          id: 'bio_device_passkey_' + Date.now(),
          type: authMode,
          device: deviceInfo?.deviceName || 'Mobile Sensor'
        }
      });

      clearInterval(scanIntervalRef.current);
      setScanProgress(100);
      setBioStatus('success');
      playBiometricChime('success');

      if (navigator.vibrate) {
        navigator.vibrate([40, 70, 40]);
      }

      saveLastBioUser(targetUser);

      setTimeout(() => {
        if (loginBiometric) {
          loginBiometric(verifyRes);
        }
      }, 500);

    } catch (err) {
      clearInterval(scanIntervalRef.current);
      setBioStatus('error');
      setError(err.message || 'خطا در احراز هویت اثر انگشت. لطفاً مجدداً سنسور را لمس فرمایید.');
      playBiometricChime('error');
      if (navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد نمایید.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'نام کاربری یا کلمه عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginRole = async (roleId) => {
    setError(null);
    setLoading(true);
    try {
      await switchRole(roleId);
    } catch (err) {
      setError('خطا در ورود: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none" dir="rtl">
      
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Right Column: Factory Branding & Fast Roles */}
        <div className="md:col-span-5 bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between border-l border-indigo-950/40">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 font-black text-sm">
                امیران
              </div>
              <div>
                <h2 className="text-lg font-black text-white">اتوماسیون تولید (MIS)</h2>
                <span className="text-xs text-amber-300 font-bold">شرکت آرمان امیران</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 font-medium">
              سامانه یکپارچه مدیریت فرآیند ۱۰ مرحله‌ای تولید کارتن و جعبه‌سازی با تفکیک سطوح دسترسی پرسنل و کارتابل‌های اختصاصی.
            </p>

            {/* Quick Demo Access Roles */}
            <div className="pt-3 border-t border-indigo-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                <span>ورود سریع با نقش‌های کارخانه:</span>
                <span className="text-[10px] text-slate-400">رمز: ۱۲۳۴۵۶</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleQuickLoginRole(r.id)}
                    className="p-2 bg-indigo-950/70 hover:bg-indigo-600/50 border border-indigo-800/60 hover:border-indigo-400 rounded-xl text-right transition-all group"
                  >
                    <div className="font-black text-white text-[11px] group-hover:text-amber-300 transition-colors truncate">
                      {r.name}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {r.desc.split('،')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Left Column: Interactive Auth Modes (Biometric vs Password) */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-5">
          
          {/* Header Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900">ورود به اتوماسیون آرمان امیران</h1>
            <p className="text-xs text-slate-500 font-medium">
              سامانه هوشمند مدیریت فرآیند ۱۰ مرحله‌ای جعبه‌سازی
            </p>
          </div>

          {/* DUAL MODE SELECTOR TABS */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('biometric')}
              className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'biometric'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>ورود با اثر انگشت / چهره</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activeTab === 'password'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>ورود با رمز عبور</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PROMINENT BIOMETRIC SCANNER (DEFAULT & HIGH-TECH) */}
          {activeTab === 'biometric' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Personnel Selector Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-black flex items-center justify-center text-sm shadow">
                    {(selectedBioUser?.full_name || 'U').charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">
                      {selectedBioUser?.full_name || 'انتخاب پرسنل'}
                    </div>
                    <div className="text-[10px] text-teal-700 font-bold">
                      {selectedBioUser?.department || selectedBioUser?.role} (@{selectedBioUser?.username})
                    </div>
                  </div>
                </div>

                {/* Dropdown to switch user */}
                <select
                  value={selectedBioUser?.username || 'admin'}
                  onChange={(e) => {
                    const u = bioUsers.find(x => x.username === e.target.value);
                    if (u) setSelectedBioUser(u);
                  }}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-400 cursor-pointer shadow-2xs"
                >
                  {bioUsers.map(u => (
                    <option key={u.id || u.username} value={u.username}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Big Interactive Tactile Fingerprint / Face Sensor */}
              <div className="relative flex flex-col items-center justify-center py-4 bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden">
                
                {/* Glowing Laser Scan Ring */}
                <div
                  className={`absolute w-36 h-36 rounded-full border-2 border-teal-400/30 transition-all duration-700 ${
                    bioStatus === 'scanning' ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-20'
                  }`}
                ></div>

                {/* Sensor Touch Pad Button */}
                <button
                  type="button"
                  onClick={() => handleStartBiometricScan()}
                  className={`relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer ${
                    bioStatus === 'success'
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/50 scale-105'
                      : bioStatus === 'scanning'
                      ? 'bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-500 shadow-teal-500/60 scale-105 ring-4 ring-teal-400/50'
                      : 'bg-gradient-to-tr from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 shadow-teal-900/60 hover:scale-105 ring-4 ring-teal-500/30'
                  }`}
                >
                  {bioStatus === 'scanning' && (
                    <div className="absolute inset-x-2 top-1 h-1 bg-cyan-200 shadow-[0_0_15px_#22d3ee] rounded-full animate-bounce"></div>
                  )}

                  {bioStatus === 'success' ? (
                    <Unlock className="w-10 h-10 text-white animate-in zoom-in" />
                  ) : authMode === 'face_id' ? (
                    <ScanFace className={`w-10 h-10 text-white ${bioStatus === 'scanning' ? 'animate-pulse text-cyan-200' : ''}`} />
                  ) : (
                    <Fingerprint className={`w-10 h-10 text-white ${bioStatus === 'scanning' ? 'animate-pulse text-cyan-200 scale-110' : ''}`} />
                  )}
                </button>

                {/* Status Message */}
                <div className="mt-3 text-center">
                  {bioStatus === 'success' ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اثر انگشت تأیید شد. در حال ورود...</span>
                    </div>
                  ) : bioStatus === 'scanning' ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-cyan-300 animate-pulse">
                        در حال خواندن اثر انگشت... ({scanProgress}٪)
                      </div>
                      <div className="w-36 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-150"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs font-black text-white flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>برای ورود، سنسور اثر انگشت بالا را لمس کنید</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        سازگار با حسگر اثر انگشت گوشی، تبلت و وب
                      </div>
                    </div>
                  )}
                </div>

                {/* Sensor Mode Switch */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMode('fingerprint')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      authMode === 'fingerprint' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    سنسور اثر انگشت
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('face_id')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      authMode === 'face_id' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    تشخیص چهره
                  </button>
                </div>

              </div>

              {/* Direct Instant Action Button */}
              <button
                type="button"
                onClick={() => handleStartBiometricScan()}
                disabled={bioStatus === 'scanning'}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Fingerprint className="w-5 h-5 animate-pulse" />
                <span>{bioStatus === 'scanning' ? 'در حال اسکن سنسور...' : 'اسکن سنسور و ورود فوری با اثر انگشت'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: MANUAL USERNAME & PASSWORD FORM */}
          {activeTab === 'password' && (
            <form onSubmit={handleSubmitPassword} className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">نام کاربری (Username):</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: admin یا ceo یا sales"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl font-bold text-sm text-slate-900 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">کلمه عبور (Password):</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl font-bold text-sm text-slate-900 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'در حال بررسی اطلاعات...' : 'ورود با نام کاربری و کلمه عبور'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer Notice (Spans across full 12 columns horizontally - Single Clean Notice) */}
        <div className="md:col-span-12 bg-slate-900 text-slate-300 border-t border-slate-800 py-3.5 px-6 text-[12px] flex flex-row items-center justify-between flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-bold text-slate-100 text-xs sm:text-sm">
              همکار گرامی! تمامی اطلاعات این اتوماسیون محرمانه و امانت در اختیار شماست
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-black font-mono text-xs sm:text-sm shrink-0">
            <span className="text-slate-400 font-sans font-bold">برنامه‌نویس:</span>
            <span className="text-amber-300">مسعود شعبانی</span>
          </div>
        </div>

      </div>
    </div>
  );
}
