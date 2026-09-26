import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ROLES, formatNumber, formatToman, formatDateFa } from '../utils/helpers';
import {
  Users,
  Award,
  Star,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Sliders,
  DollarSign,
  PlusCircle,
  Building2,
  ShieldCheck,
  Calendar,
  X,
  UserCheck,
  AlertCircle,
  Trophy,
  Flame,
  Zap,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  BadgeCheck,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Target,
  FileCheck,
  ThumbsUp,
  MessageSquare,
  Activity,
  Layers,
  Box,
  FileSpreadsheet,
  Package,
  Calculator
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'all', name: 'تمامی دپارتمان‌ها', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'design', name: 'واحد طراحی و آتلیه', icon: Box, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'marketer', name: 'واحد بازاریابی و فروش', icon: Users, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'production', name: 'واحد تولید و چاپ', icon: FileSpreadsheet, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'warehouse', name: 'واحد انبارداری و تدارکات', icon: Package, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'accounting', name: 'واحد مالی و برآورد', icon: Calculator, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'secretary', name: 'امور دفتری و اداری', icon: Building2, color: 'text-purple-600 bg-purple-50 border-purple-200' }
];

export default function HumanResourcesView() {
  const { currentUser, role } = useAuth();
  const isCeo = role === 'ceo';

  const [activeTab, setActiveTab] = useState('evaluations'); // 'evaluations' | 'directory' | 'matrix' | 'report'
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [deptStats, setDeptStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [evaluatingEmployee, setEvaluatingEmployee] = useState(null);
  const [viewingProfileEmployee, setViewingProfileEmployee] = useState(null);
  const [editingProfileEmployee, setEditingProfileEmployee] = useState(null);
  const [printableEvaluation, setPrintableEvaluation] = useState(null);
  const [disciplinaryModalEmp, setDisciplinaryModalEmp] = useState(null);

  // Evaluation Form States (5 Axes 0-100)
  const [scoreQuality, setScoreQuality] = useState(90);
  const [scoreSpeed, setScoreSpeed] = useState(85);
  const [scoreTarget, setScoreTarget] = useState(88);
  const [scoreDiscipline, setScoreDiscipline] = useState(95);
  const [scoreTeamwork, setScoreTeamwork] = useState(90);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [bonusPercent, setBonusPercent] = useState(10);
  const [evalSaving, setEvalSaving] = useState(false);

  // Disciplinary Log Form State
  const [discType, setDiscType] = useState('commendation');
  const [discTitle, setDiscTitle] = useState('');
  const [discDesc, setDiscDesc] = useState('');
  const [discSaving, setDiscSaving] = useState(false);

  // Fetch Employees List
  const fetchEmployees = async (dept = selectedDept, search = searchTerm) => {
    setLoading(true);
    try {
      const res = await api.getHrEmployees({ department: dept, search });
      if (res && res.success) {
        setEmployees(res.employees || []);
        if (!selectedPeriod && res.current_period) {
          setSelectedPeriod(res.current_period.yearMonth);
        }
      }
    } catch (err) {
      console.error('Error fetching HR employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Department Stats & KPIs
  const fetchDeptStats = async (period = selectedPeriod) => {
    try {
      const res = await api.getHrDepartmentStats({ period });
      if (res && res.success) {
        setDeptStats(res);
      }
    } catch (err) {
      console.error('Error fetching HR stats:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDeptStats();
  }, [selectedDept]);

  // Open Evaluation Modal
  const handleOpenEvaluationModal = (emp) => {
    setEvaluatingEmployee(emp);
    const prev = emp.latest_evaluation;
    setScoreQuality(prev?.score_quality || 90);
    setScoreSpeed(prev?.score_speed || 85);
    setScoreTarget(prev?.score_target || 88);
    setScoreDiscipline(prev?.score_discipline || 95);
    setScoreTeamwork(prev?.score_teamwork || 90);
    setStrengths(prev?.strengths || '');
    setImprovements(prev?.improvements || '');
    setFeedbackNotes(prev?.feedback_notes || '');
    setBonusPercent(prev?.bonus_percent || 10);
  };

  // Calculate live total and grade
  const liveTotalScore = Math.round((Number(scoreQuality) + Number(scoreSpeed) + Number(scoreTarget) + Number(scoreDiscipline) + Number(scoreTeamwork)) / 5);
  const liveGrade = liveTotalScore >= 90 ? 'A+' : liveTotalScore >= 75 ? 'A' : liveTotalScore >= 60 ? 'B' : 'C';
  const liveBonusAmount = evaluatingEmployee ? (Number(evaluatingEmployee.base_salary || 15000000) * Number(bonusPercent)) / 100 : 0;

  // Submit Evaluation
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingEmployee) return;

    setEvalSaving(true);
    try {
      const res = await api.submitHrEvaluation({
        user_id: evaluatingEmployee.id,
        period_fa: selectedPeriod || deptStats?.current_period?.yearMonth,
        score_quality: scoreQuality,
        score_speed: scoreSpeed,
        score_target: scoreTarget,
        score_discipline: scoreDiscipline,
        score_teamwork: scoreTeamwork,
        strengths,
        improvements,
        feedback_notes: feedbackNotes,
        bonus_percent: bonusPercent
      });

      if (res && res.success) {
        alert(res.message);
        setEvaluatingEmployee(null);
        fetchEmployees();
        fetchDeptStats();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت ارزیابی.');
    } finally {
      setEvalSaving(false);
    }
  };

  // View Detailed Profile
  const handleViewProfile = async (empId) => {
    try {
      const res = await api.getHrEmployee(empId);
      if (res && res.success) {
        setViewingProfileEmployee(res);
      }
    } catch (err) {
      alert('خطا در دریافت پرونده پرسنلی.');
    }
  };

  // Submit Disciplinary / Commendation Log
  const handleSubmitDisciplinary = async (e) => {
    e.preventDefault();
    if (!disciplinaryModalEmp || !discTitle.trim()) return;

    setDiscSaving(true);
    try {
      const res = await api.submitHrDisciplinaryLog({
        user_id: disciplinaryModalEmp.id,
        type: discType,
        title: discTitle,
        description: discDesc,
        date_fa: selectedPeriod
      });

      if (res && res.success) {
        alert(res.message);
        setDisciplinaryModalEmp(null);
        setDiscTitle('');
        setDiscDesc('');
        fetchEmployees();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت لاگ انضباطی.');
    } finally {
      setDiscSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 select-none animate-fadeIn pb-12" dir="rtl">
      
      {/* Top Banner: HR Control Center Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 border border-amber-400/40 shrink-0">
              <Users className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  مدیریت منابع انسانی و ارزیابی عملکرد پرسنل (HR Performance Center)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  دوره: {deptStats?.current_period?.fullMonthText || 'مهر ۱۴۰۵'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                سامانه هوشمند ارزیابی ۵ محوره پرسنل (کیفیت، سرعت، تارگت، انضباط، کار تیمی)، محاسبه پاداش بهره‌وری و مدیریت پرونده پرسنلی در تمامی دپارتمان‌های کارخانه جعبه‌سازی.
              </p>
            </div>
          </div>

          {/* Action Tabs Nav */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('evaluations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'evaluations'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>ارزیابی پرسنل ({employees.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>پرونده پرسنلی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>ماتریس واحدها</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters: Factory Performance Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Staff */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل پرسنل فعال</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{deptStats?.kpis?.active_employees || employees.length}</span>
            <span className="text-[10px] text-slate-400">نفر</span>
          </div>
        </div>

        {/* Evaluated this month */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between bg-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>ارزیابی‌شده این ماه</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-900 font-mono">{deptStats?.kpis?.evaluated_count || 0}</span>
            <span className="text-[10px] text-emerald-700">پرسنل</span>
          </div>
        </div>

        {/* Pending Evaluation */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between bg-amber-50/40">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>در انتظار ارزیابی</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-900 font-mono">{deptStats?.kpis?.pending_evaluation_count || 0}</span>
            <span className="text-[10px] text-amber-700">اقدام مدیریت</span>
          </div>
        </div>

        {/* Factory Average Score */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-xs flex flex-col justify-between bg-indigo-50/40">
          <div className="flex items-center justify-between text-indigo-800 text-xs font-bold">
            <span>میانگین نمره کارخانه</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-indigo-950 font-mono">{deptStats?.kpis?.factory_average_score || 91} <span className="text-xs">/ ۱۰۰</span></span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">Grade A+</span>
          </div>
        </div>

        {/* Total Bonus Awarded */}
        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs flex flex-col justify-between bg-teal-50/40">
          <div className="flex items-center justify-between text-teal-800 text-xs font-bold">
            <span>مجموع پاداش بهره‌وری</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-teal-950 font-mono truncate">
              {((deptStats?.kpis?.total_bonus_awarded || 6940000) / 1000000).toFixed(1)} م
            </span>
            <span className="text-[10px] text-teal-700">تومان</span>
          </div>
        </div>

        {/* Top Performer Badge */}
        <div className="bg-gradient-to-tr from-amber-500 to-indigo-700 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-200 text-xs font-bold">
            <span>پرسنل نمونه ماه 🏆</span>
            <Trophy className="w-4 h-4 text-amber-300" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-black truncate">{deptStats?.top_performers?.[0]?.full_name || 'طراح ارشد'}</div>
            <div className="text-[10px] text-amber-100 font-mono">نمره: {deptStats?.top_performers?.[0]?.total_score || 95} (A+)</div>
          </div>
        </div>
      </div>

      {/* Department Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{dept.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو نام، کد پرسنلی، واحد..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchEmployees(selectedDept, e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ================= TAB 1: EVALUATIONS CENTER ================= */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const matchedRole = ROLES.find((r) => r.id === emp.role);
              const latest = emp.latest_evaluation;
              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Employee Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-black text-sm shrink-0">
                        {emp.full_name?.slice(0, 2) || 'PR'}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{emp.full_name}</h3>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-bold text-indigo-600">{emp.personnel_code}</span>
                          <span>•</span>
                          <span>{emp.job_title}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-lg text-white font-bold text-[10px] ${matchedRole?.color || 'bg-slate-600'}`}>
                      {matchedRole?.name || emp.role}
                    </span>
                  </div>

                  {/* Performance Score Summary Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">ارزیابی دوره جاری ({deptStats?.current_period?.monthName || 'مهر'}):</span>
                      {emp.current_month_evaluated ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          <span>ثبت شده</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                          در انتظار ارزیابی
                        </span>
                      )}
                    </div>

                    {latest ? (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black font-mono text-slate-900">{latest.total_score}</span>
                          <span className="text-xs text-slate-400">/ ۱۰۰</span>
                          <span className={`px-2 py-0.2 rounded-md font-black text-xs ${
                            latest.performance_grade === 'A+' ? 'bg-emerald-500 text-white' :
                            latest.performance_grade === 'A' ? 'bg-teal-500 text-white' :
                            latest.performance_grade === 'B' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'
                          }`}>
                            Grade {latest.performance_grade}
                          </span>
                        </div>
                        <div className="text-right text-[11px] font-bold text-teal-700">
                          پاداش: {latest.bonus_percent}٪ ({((latest.bonus_amount || 0) / 1000).toLocaleString('fa-IR')} هـ ت)
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-slate-400 text-xs font-medium">
                        هنوز ارزیابی عملکردی ثبت نشده است
                      </div>
                    )}
                  </div>

                  {/* 5-Axis Score Mini Progress Bars (if evaluated) */}
                  {latest && (
                    <div className="grid grid-cols-5 gap-1 text-[10px] font-bold text-center">
                      <div className="p-1 bg-indigo-50/60 rounded-lg">
                        <div className="text-slate-500 text-[9px]">کیفیت</div>
                        <div className="font-mono text-indigo-700 font-black">{latest.score_quality}</div>
                      </div>
                      <div className="p-1 bg-indigo-50/60 rounded-lg">
                        <div className="text-slate-500 text-[9px]">سرعت</div>
                        <div className="font-mono text-indigo-700 font-black">{latest.score_speed}</div>
                      </div>
                      <div className="p-1 bg-indigo-50/60 rounded-lg">
                        <div className="text-slate-500 text-[9px]">تارگت</div>
                        <div className="font-mono text-indigo-700 font-black">{latest.score_target}</div>
                      </div>
                      <div className="p-1 bg-indigo-50/60 rounded-lg">
                        <div className="text-slate-500 text-[9px]">انضباط</div>
                        <div className="font-mono text-indigo-700 font-black">{latest.score_discipline}</div>
                      </div>
                      <div className="p-1 bg-indigo-50/60 rounded-lg">
                        <div className="text-slate-500 text-[9px]">تیمی</div>
                        <div className="font-mono text-indigo-700 font-black">{latest.score_teamwork}</div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEvaluationModal(emp)}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-300" />
                      <span>{emp.current_month_evaluated ? 'ویرایش ارزیابی' : 'ثبت ارزیابی عملکرد'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewProfile(emp.id)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      title="مشاهده پرونده پرسنلی و سوابق"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDisciplinaryModalEmp(emp)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-amber-700 rounded-xl transition"
                      title="ثبت تشویقی یا تذکر انضباطی"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: DIRECTORY & PERSONNEL PROFILES ================= */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-800">بانک اطلاعات و پرونده پرسنلی کارکنان</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{employees.length} نفر ثبت‌شده</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                  <th className="p-3 rounded-r-xl">کد پرسنلی</th>
                  <th className="p-3">نام و نام خانوادگی</th>
                  <th className="p-3">سمت سازمانی و دپارتمان</th>
                  <th className="p-3">کد ملی</th>
                  <th className="p-3">تاریخ استخدام</th>
                  <th className="p-3 text-center">حقوق پایه</th>
                  <th className="p-3 text-center">میانگین عملکرد</th>
                  <th className="p-3 text-center rounded-l-xl">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700">
                      {emp.personnel_code}
                    </td>
                    <td className="p-3">
                      <div className="font-black text-slate-900 text-sm">{emp.full_name}</div>
                      <div className="text-[11px] text-slate-400">@{emp.username} | {emp.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{emp.job_title}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {emp.national_id || '---'}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {emp.hire_date_fa || '---'}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-teal-800">
                      {emp.base_salary ? `${(emp.base_salary / 1000000).toFixed(1)} میلیون ت` : '---'}
                    </td>
                    <td className="p-3 text-center">
                      {emp.average_score ? (
                        <span className="inline-flex items-center gap-1 font-mono font-black text-slate-800 bg-indigo-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>{emp.average_score}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(emp.id)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده پرونده</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: DEPARTMENT PERFORMANCE MATRIX ================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptStats?.department_matrix?.map((d) => (
              <div key={d.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{d.name}</h4>
                    <span className="text-xs text-slate-500">{d.total_staff} پرسنل تخصصی</span>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${d.color} flex items-center justify-center text-white shadow-sm`}>
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">پرسنل ارزیابی‌شده:</span>
                    <strong className="text-slate-800 font-mono">{d.evaluated_staff} از {d.total_staff} نفر</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">میانگین امتیاز واحد:</span>
                    <strong className="text-lg font-black font-mono text-indigo-700">
                      {d.average_score ? `${d.average_score} / ۱۰۰` : '---'}
                    </strong>
                  </div>
                  {d.top_scorer && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <span>برترین پرسنل واحد:</span>
                      </div>
                      <strong>{d.top_scorer.name} ({d.top_scorer.score})</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: 5-AXIS PERFORMANCE EVALUATION ================= */}
      {evaluatingEmployee && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700 font-black text-base">
                <Award className="w-6 h-6 text-amber-500" />
                <span>ارزیابی تخصصی عملکرد: {evaluatingEmployee.full_name} ({evaluatingEmployee.personnel_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Score Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-md border border-slate-800">
              <div>
                <span className="text-xs text-slate-300 font-bold">سمت: {evaluatingEmployee.job_title} | {evaluatingEmployee.department}</span>
                <div className="text-xs text-amber-300 mt-0.5">دوره ارزیابی: {selectedPeriod || 'مهر ۱۴۰۵'}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">نمره کل محاسبه‌شده:</div>
                  <div className="text-2xl font-black font-mono text-amber-300">{liveTotalScore} <span className="text-xs font-sans text-slate-300">/ ۱۰۰</span></div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-sm font-black shadow-sm ${
                  liveGrade === 'A+' ? 'bg-emerald-500 text-white' :
                  liveGrade === 'A' ? 'bg-teal-500 text-white' :
                  liveGrade === 'B' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  Grade {liveGrade}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              
              {/* 5 Evaluation Axes */}
              <div className="space-y-3.5">
                <div className="font-black text-slate-800 text-xs flex items-center gap-1.5 border-b pb-1">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>محورهای ۵ گانه ارزیابی عملکرد (نمره ۰ تا ۱۰۰):</span>
                </div>

                {/* Axis 1: Quality */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-slate-800">۱. کیفیت کار و دقت فنی (Work Quality):</label>
                    <span className="font-mono font-black text-indigo-700 text-sm">{scoreQuality}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scoreQuality}
                    onChange={(e) => setScoreQuality(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">کاهش ضایعات و باطله، دقت در اندازه‌گیری، خط تیغ، فرمول و چاپ بدون خطای فنی</div>
                </div>

                {/* Axis 2: Speed & Delivery */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-slate-800">۲. سرعت عمل و تحویل به موقع (Speed & Timeliness):</label>
                    <span className="font-mono font-black text-indigo-700 text-sm">{scoreSpeed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scoreSpeed}
                    onChange={(e) => setScoreSpeed(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">رعایت موعد تحویل در چرخه ۱۰ مرحله‌ای، تسریع در فرآیندها و پاسخگویی به موقع</div>
                </div>

                {/* Axis 3: Target Achievement */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-slate-800">۳. تحقق تارگت و وظایف محوله (Target Achievement):</label>
                    <span className="font-mono font-black text-indigo-700 text-sm">{scoreTarget}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scoreTarget}
                    onChange={(e) => setScoreTarget(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">میزان تحقق تارگت ماهانه (استعلام بازاریاب، تیراژ چاپ، ثبت رسید انبار، برآورد)</div>
                </div>

                {/* Axis 4: Discipline & Punctuality */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-slate-800">۴. انضباط کاری و حضور و غیاب (Discipline):</label>
                    <span className="font-mono font-black text-indigo-700 text-sm">{scoreDiscipline}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scoreDiscipline}
                    onChange={(e) => setScoreDiscipline(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">حضور به موقع در شیفت، رعایت پروتکل‌های ایمنی، حفظ اموال و آراستگی محیط کار</div>
                </div>

                {/* Axis 5: Teamwork */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-black text-slate-800">۵. همکاری تیمی و اخلاق حرفه‌ای (Teamwork):</label>
                    <span className="font-mono font-black text-indigo-700 text-sm">{scoreTeamwork}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scoreTeamwork}
                    onChange={(e) => setScoreTeamwork(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">تعامل سازنده با همکاران و سرپرستان، مسئولیت‌پذیری و حفظ محرمانگی اطلاعات</div>
                </div>
              </div>

              {/* Bonus Calculator */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-teal-950">درصد پاداش بهره‌وری این دوره:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={bonusPercent}
                      onChange={(e) => setBonusPercent(Number(e.target.value))}
                      className="w-16 bg-white border border-teal-300 rounded-lg p-1 text-center font-mono font-black text-teal-900"
                    />
                    <span className="font-bold text-teal-800">درصد</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-teal-900 pt-1 border-t border-teal-200/60 font-bold">
                  <span>مبلغ پاداش متعلقه:</span>
                  <span className="font-mono font-black text-sm">{liveBonusAmount.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نقاط قوت برجسته پرسنل:</label>
                  <textarea
                    rows="2"
                    placeholder="مثال: دقت بالا در خط تیغ، تعامل موثر با مشتری..."
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">حوزه‌های نیازمند آموزش و بهبود:</label>
                  <textarea
                    rows="2"
                    placeholder="مثال: تسریع در ارائه نمونه‌های اولیه..."
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">دستور و یادداشت نهایی مدیریت عامل:</label>
                <textarea
                  rows="2"
                  placeholder="دستور پرداخت پاداش، ترفیع رتبه، ماموریت آموزشی یا تشویق کتبی..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingEmployee(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={evalSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-xl font-black shadow-md transition flex items-center gap-1.5"
                >
                  {evalSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>ثبت قطعی ارزیابی و ابلاغ به پرسنل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: FULL DIGITAL PERSONNEL FILE ================= */}
      {viewingProfileEmployee && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>پرونده پرسنلی دیجیتال: {viewingProfileEmployee.user?.full_name}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingProfileEmployee(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">کد پرسنلی:</span>
                <strong className="font-mono text-indigo-700">{viewingProfileEmployee.profile?.personnel_code}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">کد ملی:</span>
                <strong className="font-mono text-slate-800">{viewingProfileEmployee.profile?.national_id || '---'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">سمت سازمانی:</span>
                <strong className="text-slate-800">{viewingProfileEmployee.profile?.job_title}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">حقوق پایه:</span>
                <strong className="font-mono text-teal-800">{formatToman(viewingProfileEmployee.profile?.base_salary)}</strong>
              </div>
            </div>

            {/* Evaluation History Timeline */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5 border-b pb-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>تاریخچه کارنامه‌های ارزیابی عملکرد ({viewingProfileEmployee.evaluations?.length || 0} دوره):</span>
              </h4>

              {viewingProfileEmployee.evaluations?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {viewingProfileEmployee.evaluations.map((ev) => (
                    <div key={ev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-black text-slate-900">دوره {ev.period_fa} | ارزیاب: {ev.evaluator_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{ev.feedback_notes || 'عملکرد مورد تایید مدیریت'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-indigo-700">{ev.total_score}/100</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          Grade {ev.performance_grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">سابقه‌ای ثبت نشده است.</div>
              )}
            </div>

            {/* Disciplinary / Commendation Logs */}
            <div className="space-y-2">
              <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5 border-b pb-1">
                <ThumbsUp className="w-4 h-4 text-teal-600" />
                <span>لاگ تشویقی و انضباطی:</span>
              </h4>

              {viewingProfileEmployee.disciplinary_logs?.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {viewingProfileEmployee.disciplinary_logs.map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">{log.title}</strong>
                        <p className="text-[11px] text-slate-500">{log.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.date_fa}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-slate-400 text-xs">موردی ثبت نشده است.</div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProfileEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                بستن پرونده
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DISCIPLINARY & COMMENDATION ================= */}
      {disciplinaryModalEmp && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <ThumbsUp className="w-5 h-5 text-teal-600" />
                <span>ثبت تشویقی / تذکر: {disciplinaryModalEmp.full_name}</span>
              </div>
              <button
                type="button"
                onClick={() => setDisciplinaryModalEmp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDisciplinary} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع اقدام:</label>
                <select
                  value={discType}
                  onChange={(e) => setDiscType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                >
                  <option value="commendation">تشویقی و تقدیرنامه کتبی 🌟</option>
                  <option value="warning">تذکر شفاهی / کتبی انضباطی ⚠️</option>
                  <option value="training">ارتقاء مهارت و دوره آموزشی 📚</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان موضوع:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تقدیر از دقت در شیفت شب تولید..."
                  value={discTitle}
                  onChange={(e) => setDiscTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شرح و توضیحات:</label>
                <textarea
                  rows="3"
                  placeholder="توضیحات تکمیلی..."
                  value={discDesc}
                  onChange={(e) => setDiscDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDisciplinaryModalEmp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={discSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md transition"
                >
                  {discSaving ? 'در حال ثبت...' : 'ثبت در پرونده پرسنلی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
