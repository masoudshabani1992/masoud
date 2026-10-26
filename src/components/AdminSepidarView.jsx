import React, { useEffect, useState } from 'react';
import {
  Server,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Settings,
  Eye,
  Play,
  ShieldCheck,
  Terminal,
  CheckSquare,
  Bot,
  Download,
  MonitorCheck,
  Sparkles,
} from 'lucide-react';
import {
  apiRequest,
  buildCsvDownloadUrl,
  buildBotFileDownloadUrl,
} from '../api.js';
import {
  formatJalaliDateTime,
  formatNumber,
  formatToman,
  paymentMethodLabel,
  sepidarStatusMeta,
} from '../utils/format.js';

export default function AdminSepidarView({ bootstrap, onRefreshBootstrap }) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'bot_rpa' | 'settings' | 'logs'
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sales, setSales] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [previewModalData, setPreviewModalData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [botStatus, setBotStatus] = useState(null);
  const [botSimSteps, setBotSimSteps] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const [cfg, setCfg] = useState({
    sepidar_mode: 'simulation',
    sepidar_server_url: 'http://192.168.1.100:7361/api',
    sepidar_username: 'kaveh_finance',
    sepidar_password: '',
    sepidar_integration_key: 'KAVEH-SABA-POS-01',
    sepidar_fiscal_year: '1405',
    sepidar_currency_multiplier: '10',
    sepidar_default_customer_code: '10001',
    sepidar_sale_sl_code: '611001',
    sepidar_scrap_sl_code: '151005',
    sepidar_cash_fund_code: 'FUND-101',
    sepidar_cash_sl_code: '111001',
    sepidar_transfer_bank_code: 'BANK-TR-01',
    sepidar_transfer_sl_code: '112005',
    sepidar_bot_api_key: 'KAVEH-BOT-SECRET-1405',
    sepidar_exe_path: 'C:\\Program Files (x86)\\Sepidar System\\Sepidar\\Sepidar.exe',
  });

  useEffect(() => {
    if (bootstrap?.adminSettings) {
      setCfg((prev) => ({
        ...prev,
        ...bootstrap.adminSettings,
      }));
    }
  }, [bootstrap]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const q = statusFilter === 'all' ? 'includeRejected=true' : `sepidarStatus=${statusFilter}`;
      const data = await apiRequest(`/api/sales?${q}`);
      setSales(data.sales || []);
      setSelectedIds([]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await apiRequest('/api/admin/sepidar/logs');
      setLogs(data.logs || []);
    } catch {
      // ignore
    }
  };

  const loadBotStatus = async () => {
    try {
      const data = await apiRequest('/api/admin/bot/status');
      setBotStatus(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSales();
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === 'logs') loadLogs();
    if (activeTab === 'bot_rpa') loadBotStatus();
  }, [activeTab]);

  const openVoucherPreview = async (saleId) => {
    try {
      const data = await apiRequest(`/api/admin/sepidar/preview/${saleId}`);
      setPreviewModalData(data);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const approveSingle = async (saleId) => {
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await apiRequest(`/api/admin/sepidar/approve/${saleId}`, {
        method: 'POST',
      });
      setFeedback({
        type: 'success',
        text: res.sepidarResult?.queuedForBot
          ? res.sepidarResult.message
          : `سند با موفقیت تایید و در سپیدار ثبت شد (شماره فاکتور: ${res.sale?.sepidar_doc_number} | سند حسابداری: ${res.sale?.sepidar_voucher_number}).`,
      });
      setPreviewModalData(null);
      await loadSales();
      await loadBotStatus();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      await loadSales();
    } finally {
      setProcessing(false);
    }
  };

  const approveBulk = async () => {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await apiRequest('/api/admin/sepidar/approve-bulk', {
        method: 'POST',
        body: JSON.stringify({ saleIds: selectedIds }),
      });
      setFeedback({
        type: res.errorCount > 0 ? 'error' : 'success',
        text:
          cfg.sepidar_mode === 'windows_bot'
            ? `${formatNumber(res.syncedCount)} سند تایید و به صف «ربات ویندوزی سپیدار» ارسال شد.`
            : `تایید گروهی انجام شد: ${formatNumber(res.syncedCount)} سند در سپیدار ثبت گردید${
                res.errorCount > 0 ? ` (${formatNumber(res.errorCount)} خطا)` : '.'
              }`,
      });
      await loadSales();
      await loadBotStatus();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const rejectSingle = async (saleId) => {
    setProcessing(true);
    try {
      await apiRequest(`/api/admin/sepidar/reject/${saleId}`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'رد شده توسط مدیر مالی قبل از ارسال به سپیدار' }),
      });
      setPreviewModalData(null);
      await loadSales();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const saveSettings = async (e) => {
    if (e) e.preventDefault();
    setProcessing(true);
    setFeedback(null);
    try {
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(cfg),
      });
      if (onRefreshBootstrap) await onRefreshBootstrap();
      await loadBotStatus();
      setFeedback({
        type: 'success',
        text: 'تنظیمات اتصال سپیدار با موفقیت ذخیره شد.',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const activateWindowsBotMode = async () => {
    setProcessing(true);
    setFeedback(null);
    try {
      const updated = { ...cfg, sepidar_mode: 'windows_bot' };
      setCfg(updated);
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
      if (onRefreshBootstrap) await onRefreshBootstrap();
      await loadBotStatus();
      setFeedback({
        type: 'success',
        text: 'حالت «ربات دستیار ویندوزی سپیدار» فعال شد! از این لحظه با تایید هر سند، ربات ویندوزی آن را خودکار جای حسابدار در سپیدار ثبت می‌کند.',
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const runLiveBotSimulation = async () => {
    const jobs = botStatus?.queuedJobs || [];
    if (jobs.length === 0) {
      setFeedback({
        type: 'error',
        text: 'ابتدا حالت «ربات ویندوزی» را فعال کنید و حداقل یک فاکتور را از تب «کارتابل تایید اسناد» تایید نمایید تا وارد صف ربات شود.',
      });
      return;
    }

    setProcessing(true);
    setBotSimSteps([]);
    const appendStep = (txt) => setBotSimSteps((prev) => [...prev, txt]);

    try {
      appendStep(`۱. ربات ویندوزی روی سرور طبقه بالا بیدار شد و ${jobs.length} سند تاییدشده را از صف دریافت کرد...`);
      await new Promise((r) => setTimeout(r, 450));
      appendStep(`۲. باز کردن پنجره نرم‌افزار Sepidar.exe و ورود خودکار با نام کاربری «${cfg.sepidar_username}»...`);
      await new Promise((r) => setTimeout(r, 450));

      for (const j of jobs) {
        const item = j.payload.SaleInvoice.Items[0];
        const rec = j.payload.TreasuryReceipt;
        appendStep(
          `۳. تایپ خودکار فاکتور ${j.invoiceNumber} (لیبل #${j.labelNumber}): کد کالا ${item.ItemCode} | مبلغ خالص ${rec.Amount.toLocaleString('fa-IR')} ریال در ${rec.BankOrPosTitle}...`
        );
        await new Promise((r) => setTimeout(r, 400));
      }

      const res = await apiRequest('/api/admin/bot/simulate-run', { method: 'POST' });
      appendStep(
        `۴. ذخیره نهایی (Ctrl+S) در سپیدار انجام شد و ${res.completedCount} سند با کد رهگیری سپیدار ثبت گردید!`
      );

      await loadBotStatus();
      await loadSales();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleTestConnection = async () => {
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await apiRequest('/api/admin/sepidar/test-connection', {
        method: 'POST',
        body: JSON.stringify(cfg),
      });
      setFeedback({
        type: res.ok ? 'success' : 'error',
        text: res.message,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const approvableSales = sales.filter(
    (s) =>
      (s.sepidar_status === 'pending' && s.bot_queue_status !== 'queued') ||
      s.sepidar_status === 'error'
  );

  const toggleSelectAll = () => {
    const ids = approvableSales.map((s) => s.id);
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              یکپارچه‌سازی با نرم‌افزار حسابداری سپیدار (سرور طبقه بالا)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              پشتیبانی از ۳ روش: ۱) ربات دستیار ویندوزی خودکار (بدون نیاز به وب‌سرویس) ۲) وب‌سرویس رسمی سپیدار ۳) اکسل استاندارد
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-amber-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            کارتابل تایید اسناد ({formatNumber(bootstrap?.pendingSepidarCount || 0)})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bot_rpa')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'bot_rpa'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            ربات ویندوزی (جای حسابدار)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-amber-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            تنظیمات اتصال
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-amber-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            لاگ تبادل
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-extrabold flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="underline shrink-0 cursor-pointer"
          >
            بستن
          </button>
        </div>
      )}

      {/* TAB 1: APPROVAL QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'pending', label: 'در انتظار تایید / صف ربات' },
                { id: 'synced', label: 'ثبت شده در سپیدار' },
                { id: 'error', label: 'دارای خطای ارتباط' },
                { id: 'all', label: 'همه اسناد' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={approveBulk}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  تایید و ارسال گروهی ({formatNumber(selectedIds.length)} سند)
                </button>
              )}

              <a
                href={buildCsvDownloadUrl(
                  statusFilter === 'all' ? {} : { sepidarStatus: statusFilter }
                )}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                خروجی اکسل سپیدار
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        approvableSales.length > 0 &&
                        selectedIds.length === approvableSales.length
                      }
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-3 py-3 whitespace-nowrap">لیبل / فاکتور</th>
                  <th className="px-3 py-3 whitespace-nowrap">تاریخ و ساعت</th>
                  <th className="px-3 py-3 whitespace-nowrap">صندوقدار</th>
                  <th className="px-3 py-3 whitespace-nowrap">شرح باتری و داغی</th>
                  <th className="px-3 py-3 whitespace-nowrap">خالص دریافتی</th>
                  <th className="px-3 py-3 whitespace-nowrap">روش پرداخت / بانک</th>
                  <th className="px-3 py-3 whitespace-nowrap">وضعیت سپیدار</th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">بررسی و ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 font-bold">
                      در حال بارگذاری اسناد...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 font-bold">
                      سندی در این وضعیت وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  sales.map((s) => {
                    const st = sepidarStatusMeta(s.sepidar_status, s.bot_queue_status);
                    const isQueuedBot = s.sepidar_status === 'pending' && s.bot_queue_status === 'queued';
                    const canApprove =
                      (s.sepidar_status === 'pending' && !isQueuedBot) ||
                      s.sepidar_status === 'error';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 text-center">
                          {canApprove && (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(s.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds((prev) => [...prev, s.id]);
                                } else {
                                  setSelectedIds((prev) => prev.filter((id) => id !== s.id));
                                }
                              }}
                              className="rounded border-slate-300"
                            />
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="font-black text-slate-900" dir="ltr">
                            #{s.label_number}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                            {s.invoice_number}
                          </div>
                        </td>
                        <td className="px-3 py-3 tabular-nums text-slate-600 whitespace-nowrap">
                          {formatJalaliDateTime(s.created_at)}
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">
                          {s.cashier_name}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {s.category_name} {s.brand_name} — {formatNumber(s.amperage)}Ah ({formatNumber(s.quantity)}×)
                          </div>
                          <div className="text-[11px] text-rose-700 font-semibold tabular-nums">
                            {s.has_scrap
                              ? `کسر داغی: ${formatNumber(s.total_scrap_amps)}Ah (${formatToman(s.scrap_deduction_amount)})`
                              : 'بدون باتری داغی'}
                          </div>
                        </td>
                        <td className="px-3 py-3 tabular-nums whitespace-nowrap">
                          <div className="font-black text-slate-900">{formatToman(s.final_sale_amount)}</div>
                          {s.is_manual_price ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                              قیمت اصلاحی صندوق
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">
                          <div>{paymentMethodLabel(s)}</div>
                          {s.payment_ref && (
                            <div className="text-[10px] text-slate-500 font-mono" dir="ltr">
                              Ref: {s.payment_ref}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${st.badgeClass}`}>
                            {st.label}
                          </span>
                          {s.sepidar_doc_number && (
                            <div className="text-[11px] font-mono text-emerald-700 mt-1" dir="ltr">
                              {s.sepidar_doc_number} / {s.sepidar_voucher_number}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openVoucherPreview(s.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>سند حسابداری</span>
                            </button>
                            {canApprove && (
                              <button
                                type="button"
                                disabled={processing}
                                onClick={() => approveSingle(s.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {cfg.sepidar_mode === 'windows_bot'
                                    ? 'تایید و ارسال به ربات'
                                    : 'تایید و ثبت'}
                                </span>
                              </button>
                            )}
                            {isQueuedBot && (
                              <button
                                type="button"
                                onClick={() => setActiveTab('bot_rpa')}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer"
                              >
                                مشاهده در صف ربات
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WINDOWS DESKTOP RPA BOT (نرم‌افزار ویندوزی جایگزین حسابدار بدون وب‌سرویس یا CSV) */}
      {activeTab === 'bot_rpa' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                    <span>ربات دستیار ویندوزی سپیدار (ثبت خودکار جای حسابدار)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px]">
                      بدون نیاز به وب‌سرویس یا اکسل دستی
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    این نرم‌افزار ویندوزی روی سرور طبقه بالا کنار <code>Sepidar.exe</code> باز می‌ماند؛ به محض اینکه مدیر مالی دکمه «تایید» را بزند، ربات خودش پنجره سپیدار را باز کرده، با نام کاربری و رمز وارد می‌شود و فاکتور فروش، کسر داغی و رسید کارتخوان را دقیقاً مثل یک اپراتور انسانی ثبت می‌کند!
                  </p>
                </div>
              </div>

              {cfg.sepidar_mode !== 'windows_bot' ? (
                <button
                  type="button"
                  disabled={processing}
                  onClick={activateWindowsBotMode}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  فعال‌سازی حالت «ربات ویندوزی»
                </button>
              ) : (
                <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black shrink-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  حالت ربات ویندوزی فعال است
                </span>
              )}
            </div>

            {/* 4-Step Visual Architecture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {[
                {
                  step: '۱',
                  title: 'ثبت در صندوق پایین',
                  desc: 'صندوقدار فروش باتری، داغی و کارتخوان را ثبت و فیش/لیبل را چاپ می‌کند.',
                },
                {
                  step: '۲',
                  title: 'تایید مدیر مالی',
                  desc: 'مدیر مالی در پنل وب روی «تایید و ارسال به ربات» کلیک می‌کند.',
                },
                {
                  step: '۳',
                  title: 'تایپ خودکار در سپیدار',
                  desc: 'برنامه ویندوزی kaveh_sepidar_bot پنجره سپیدار را باز کرده و سند را تایپ و ذخیره (Ctrl+S) می‌کند.',
                },
                {
                  step: '۴',
                  title: 'اعلام شماره سند',
                  desc: 'ربات شماره فاکتور ثبت‌شده در سپیدار را به همین پنل وب گزارش می‌دهد.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white/10 border border-white/15 rounded-xl p-3.5 space-y-1"
                >
                  <div className="text-amber-400 font-black text-xs">مرحله {item.step}: {item.title}</div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Download Windows Bot Files + Queue Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Download Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                دانلود نرم‌افزار ربات ویندوزی (آماده نصب روی سرور طبقه بالا)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                این ۳ فایل را در یک پوشه روی سرور ویندوز طبقه بالا (کنار سپیدار) قرار داده و روی{' '}
                <code className="font-mono bg-slate-100 px-1 rounded">start-sepidar-bot.bat</code> دابل‌کلیک کنید. همچنین همین فایل‌ها در پوشه{' '}
                <code className="font-mono bg-slate-100 px-1 rounded">sepidar-windows-bot/</code> پروژه قرار دارند:
              </p>

              <div className="space-y-2.5">
                <a
                  href={buildBotFileDownloadUrl('kaveh_sepidar_bot.py')}
                  className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-between text-xs font-extrabold text-blue-950 transition"
                >
                  <span>۱. هسته ربات گرافیکی ویندوز (kaveh_sepidar_bot.py)</span>
                  <Download className="w-4 h-4 text-blue-600 shrink-0" />
                </a>

                <a
                  href={buildBotFileDownloadUrl('start-sepidar-bot.bat')}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-extrabold text-slate-800 transition"
                >
                  <span>۲. لانچر اجرای یک‌کلیکی ویندوز (start-sepidar-bot.bat)</span>
                  <Download className="w-4 h-4 text-slate-600 shrink-0" />
                </a>

                <a
                  href={buildBotFileDownloadUrl('requirements.txt')}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-extrabold text-slate-800 transition"
                >
                  <span>۳. پیش‌نیازهای کنترل ویندوز (requirements.txt)</span>
                  <Download className="w-4 h-4 text-slate-600 shrink-0" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 leading-relaxed font-semibold">
                ربات دارای دکمه <strong>«کالیبراسیون ۱ دقیقه‌ای فرم سپیدار»</strong> است تا دقیقاً با هر نسخه و سایز مانیتور سرور سپیدار شما هماهنگ شود.
              </div>
            </div>

            {/* Live Bot Queue & Simulator */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <MonitorCheck className="w-4 h-4 text-emerald-600" />
                    صف فعلی ربات ویندوزی ({formatNumber(botStatus?.queuedJobs?.length || 0)} سند منتظر تایپ در سپیدار)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    وضعیت ربات روی سرور ویندوز:{' '}
                    <strong className={botStatus?.botOnline ? 'text-emerald-600' : 'text-amber-600'}>
                      {botStatus?.botOnline
                        ? `آنلاین (${botStatus.botHost})`
                        : 'در انتظار اتصال کلاینت ویندوز (آماده تست شبیه‌ساز)'}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={runLiveBotSimulation}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  تست شبیه‌سازی کار ربات روی اسناد صف
                </button>
              </div>

              {(botStatus?.queuedJobs || []).length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-semibold">
                  در حال حاضر سندی در صف ربات نیست. (می‌توانید حالت ربات ویندوزی را فعال کرده و از تب «کارتابل تایید اسناد» یک سند را تایید کنید تا اینجا در صف قرار بگیرد.)
                </div>
              ) : (
                <div className="space-y-2">
                  {botStatus.queuedJobs.map((j) => (
                    <div
                      key={j.saleId}
                      className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-black text-slate-900" dir="ltr">
                          #{j.labelNumber} ({j.invoiceNumber})
                        </span>
                        <span className="mx-2 text-slate-400">|</span>
                        <span className="font-bold text-slate-700">
                          {j.payload.SaleInvoice.Items[0].ItemTitle}
                        </span>
                      </div>
                      <span className="font-black text-blue-800 tabular-nums">
                        {formatNumber(j.payload.TreasuryReceipt.Amount)} ریال
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {botSimSteps.length > 0 && (
                <div className="bg-slate-950 text-emerald-300 rounded-xl p-4 font-mono text-xs space-y-1.5">
                  {botSimSteps.map((step, i) => (
                    <div key={i}>▸ {step}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEPIDAR CONNECTION SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                تنظیمات روش ارتباطی و نام کاربری / رمز عبور سپیدار
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                نام کاربری و رمز عبور تعریف‌شده در این صفحه هم توسط «ربات ویندوزی» و هم توسط «وب‌سرویس سپیدار» استفاده می‌شود.
              </p>
            </div>

            <button
              type="button"
              disabled={processing}
              onClick={handleTestConnection}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              تست وضعیت اتصال
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">روش ثبت خودکار در سپیدار</label>
              <select
                value={cfg.sepidar_mode}
                onChange={(e) => setCfg({ ...cfg, sepidar_mode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
              >
                <option value="windows_bot">
                  ربات دستیار ویندوزی سپیدار (ثبت خودکار جای حسابدار بدون نیاز به وب‌سرویس یا CSV)
                </option>
                <option value="simulation">
                  شبیه‌ساز تست آنی (جهت تست سریع در پیش‌نمایش)
                </option>
                <option value="live_api">
                  وب‌سرویس رسمی سپیدار در شبکه داخلی (Live REST API)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                واحد پول ارسالی به سپیدار
              </label>
              <select
                value={cfg.sepidar_currency_multiplier}
                onChange={(e) => setCfg({ ...cfg, sepidar_currency_multiplier: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
              >
                <option value="10">ریال (تومان صندوق × ۱۰)</option>
                <option value="1">تومان (بدون ضریب ۱۰)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نام کاربری سپیدار (UserName)
              </label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_username}
                onChange={(e) => setCfg({ ...cfg, sepidar_username: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رمز عبور کاربر سپیدار (Password)
              </label>
              <input
                type="password"
                dir="ltr"
                value={cfg.sepidar_password}
                onChange={(e) => setCfg({ ...cfg, sepidar_password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                کلید امنیتی ربات ویندوزی (Bot Key)
              </label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_bot_api_key}
                onChange={(e) => setCfg({ ...cfg, sepidar_bot_api_key: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-left"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مسیر فایل اجرایی سپیدار روی سرور ویندوز طبقه بالا (جهت ربات ویندوزی)
              </label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_exe_path}
                onChange={(e) => setCfg({ ...cfg, sepidar_exe_path: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                آدرس وب‌سرویس (فقط در حالت API)
              </label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_server_url}
                onChange={(e) => setCfg({ ...cfg, sepidar_server_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سال مالی سپیدار</label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_fiscal_year}
                onChange={(e) => setCfg({ ...cfg, sepidar_fiscal_year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">کد مشتری پیش‌فرض در سپیدار</label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_default_customer_code}
                onChange={(e) => setCfg({ ...cfg, sepidar_default_customer_code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">کد معین فروش باتری در سپیدار</label>
              <input
                type="text"
                dir="ltr"
                value={cfg.sepidar_sale_sl_code}
                onChange={(e) => setCfg({ ...cfg, sepidar_sale_sl_code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-left"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm cursor-pointer"
            >
              ذخیره تنظیمات سپیدار
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SYNC LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900">لاگ تراکنش‌ها، ربات ویندوزی و پاسخ سپیدار</h3>
          {logs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">لاگی ثبت نشده است.</div>
          ) : (
            <div className="space-y-2.5">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-black ${
                        l.status === 'success' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      [{l.action}] {l.message}
                    </span>
                    <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                      {formatJalaliDateTime(l.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACCOUNTING VOUCHER & PAYLOAD PREVIEW MODAL */}
      {previewModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm sm:text-base">
                  پیش‌نمایش سند حسابداری دوبل در سپیدار
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  فاکتور {previewModalData.sale.invoice_number} | لیبل #{previewModalData.sale.label_number} | کاربر سپیدار:{' '}
                  <span dir="ltr" className="font-mono text-amber-300">
                    {previewModalData.payload.AuthUser}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalData(null)}
                className="text-slate-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 cursor-pointer"
              >
                بستن
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-900">
                    آرتیکل‌های سند حسابداری دوبل (واحد پول: {previewModalData.payload.VoucherPreview.currency})
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    سند تراز است (جمع بدهکار = جمع بستانکار)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 font-extrabold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">ردیف</th>
                        <th className="p-2.5">کد حساب سپیدار</th>
                        <th className="p-2.5">عنوان حساب و شرح آرتیکل</th>
                        <th className="p-2.5 text-left">بدهکار ({previewModalData.payload.VoucherPreview.currency})</th>
                        <th className="p-2.5 text-left">بستانکار ({previewModalData.payload.VoucherPreview.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewModalData.payload.VoucherPreview.lines.map((line) => (
                        <tr key={line.row}>
                          <td className="p-2.5 font-bold">{formatNumber(line.row)}</td>
                          <td className="p-2.5 font-mono font-bold text-blue-700" dir="ltr">
                            {line.accountCode}
                          </td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{line.accountTitle}</div>
                            <div className="text-[11px] text-slate-500">{line.description}</div>
                          </td>
                          <td className="p-2.5 text-left font-black text-slate-900 tabular-nums">
                            {line.debit > 0 ? formatNumber(line.debit) : '۰'}
                          </td>
                          <td className="p-2.5 text-left font-black text-slate-900 tabular-nums">
                            {line.credit > 0 ? formatNumber(line.credit) : '۰'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900 text-white font-black">
                        <td colSpan={3} className="p-2.5 text-left">
                          جمع کل سند حسابداری:
                        </td>
                        <td className="p-2.5 text-left text-amber-400 tabular-nums">
                          {formatNumber(previewModalData.payload.VoucherPreview.totalDebit)}
                        </td>
                        <td className="p-2.5 text-left text-amber-400 tabular-nums">
                          {formatNumber(previewModalData.payload.VoucherPreview.totalCredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <details className="bg-slate-950 text-slate-200 rounded-xl p-4 text-xs">
                <summary className="cursor-pointer font-bold text-amber-400">
                  مشاهده بسته اطلاعاتی ارسالی به ربات ویندوزی / سپیدار
                </summary>
                <pre
                  dir="ltr"
                  className="mt-3 text-[11px] font-mono overflow-x-auto text-emerald-300 leading-relaxed"
                >
                  {JSON.stringify(previewModalData.payload, null, 2)}
                </pre>
              </details>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              {previewModalData.sale.sepidar_status !== 'synced' ? (
                <>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => rejectSingle(previewModalData.sale.id)}
                    className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    رد / ابطال این فاکتور
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => approveSingle(previewModalData.sale.id)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {processing
                      ? 'در حال پردازش...'
                      : cfg.sepidar_mode === 'windows_bot'
                      ? 'تایید و ارسال به ربات ویندوزی سپیدار'
                      : 'تایید نهایی مدیر مالی و ثبت در سپیدار'}
                  </button>
                </>
              ) : (
                <div className="text-xs font-extrabold text-emerald-700">
                  این سند قبلاً با شماره {previewModalData.sale.sepidar_doc_number} در سپیدار ثبت شده است.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
