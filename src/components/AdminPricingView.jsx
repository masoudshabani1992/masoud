import React, { useEffect, useState } from 'react';
import {
  Coins,
  Recycle,
  Save,
  Plus,
  Trash2,
  Calculator,
  History,
  CreditCard,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { apiRequest } from '../api.js';
import {
  formatJalaliDateTime,
  formatNumber,
  formatToman,
  toEnglishDigits,
} from '../utils/format.js';

export default function AdminPricingView({ bootstrap, onRefreshBootstrap }) {
  const [brandRates, setBrandRates] = useState([]);
  const [matrixRates, setMatrixRates] = useState([]);
  const [scrapCategories, setScrapCategories] = useState([]);
  const [showAdvancedMatrix, setShowAdvancedMatrix] = useState(false);

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandPrice, setNewBrandPrice] = useState('132000');
  const [newAmpValue, setNewAmpValue] = useState('');
  const [newPosBank, setNewPosBank] = useState('');
  const [newPosCode, setNewPosCode] = useState('');

  const [priceLogs, setPriceLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bootstrap) return;
    setBrandRates(
      (bootstrap.brands || []).map((b) => ({
        brandId: b.id,
        name: b.name,
        is_active: b.is_active,
        defaultPricePerAmp: b.default_price_per_amp,
        applyToAllCategories: true,
      }))
    );
    setMatrixRates(
      (bootstrap.brandCategoryRates || []).map((r) => ({
        brandId: r.brand_id,
        categoryId: r.category_id,
        pricePerAmp: r.price_per_amp,
        sepidarItemPrefix: r.sepidar_item_prefix || '',
      }))
    );
    setScrapCategories(
      (bootstrap.categories || []).map((c) => ({
        categoryId: c.id,
        name: c.name,
        scrapPricePerAmp: c.scrap_price_per_amp,
        sepidarWarehouseCode: c.sepidar_warehouse_code || '101',
        sepidarScrapWarehouseCode: c.sepidar_scrap_warehouse_code || '102',
        sepidarScrapItemCode: c.sepidar_scrap_item_code || 'DAGHI-01',
      }))
    );
  }, [bootstrap]);

  const loadLogs = async () => {
    try {
      const data = await apiRequest('/api/admin/pricing/logs');
      setPriceLogs(data.logs || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const updateBrandPrice = (brandId, val) => {
    const num = Number(toEnglishDigits(val).replace(/[^0-9]/g, '')) || 0;
    setBrandRates((prev) =>
      prev.map((b) => (b.brandId === brandId ? { ...b, defaultPricePerAmp: num } : b))
    );
    if (!showAdvancedMatrix) {
      setMatrixRates((prev) =>
        prev.map((m) => (m.brandId === brandId ? { ...m, pricePerAmp: num } : m))
      );
    }
  };

  const updateMatrixPrice = (brandId, categoryId, val) => {
    const num = Number(toEnglishDigits(val).replace(/[^0-9]/g, '')) || 0;
    setMatrixRates((prev) =>
      prev.map((m) =>
        m.brandId === brandId && m.categoryId === categoryId
          ? { ...m, pricePerAmp: num }
          : m
      )
    );
  };

  const updateScrapPrice = (categoryId, field, val) => {
    setScrapCategories((prev) =>
      prev.map((c) => {
        if (c.categoryId !== categoryId) return c;
        if (field === 'scrapPricePerAmp') {
          const num = Number(toEnglishDigits(val).replace(/[^0-9]/g, '')) || 0;
          return { ...c, scrapPricePerAmp: num };
        }
        return { ...c, [field]: val };
      })
    );
  };

  const handleSaveAllPricing = async () => {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const payload = {
        brandDefaults: brandRates.map((b) => ({
          brandId: b.brandId,
          defaultPricePerAmp: b.defaultPricePerAmp,
          applyToAllCategories: !showAdvancedMatrix,
        })),
        matrixRates: showAdvancedMatrix ? matrixRates : [],
        scrapRates: scrapCategories,
      };
      await apiRequest('/api/admin/pricing', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setNotice('نرخ‌های آمپر برندها و نرخ داغی باتری با موفقیت ذخیره و در صندوق‌های طبقه پایین اعمال شد.');
      if (onRefreshBootstrap) await onRefreshBootstrap();
      await loadLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setError('');
    try {
      await apiRequest('/api/admin/brands', {
        method: 'POST',
        body: JSON.stringify({
          name: newBrandName.trim(),
          defaultPricePerAmp: Number(toEnglishDigits(newBrandPrice)) || 132000,
        }),
      });
      setNewBrandName('');
      if (onRefreshBootstrap) await onRefreshBootstrap();
      await loadLogs();
      setNotice('برند جدید اضافه شد.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddAmperage = async (e) => {
    e.preventDefault();
    const num = Number(toEnglishDigits(newAmpValue));
    if (!num || num <= 0) return;
    try {
      await apiRequest('/api/admin/amperages', {
        method: 'POST',
        body: JSON.stringify({ ampValue: num }),
      });
      setNewAmpValue('');
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAmperage = async (id) => {
    try {
      await apiRequest(`/api/admin/amperages/${id}`, { method: 'DELETE' });
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddPos = async (e) => {
    e.preventDefault();
    if (!newPosBank.trim()) return;
    try {
      await apiRequest('/api/admin/pos-terminals', {
        method: 'POST',
        body: JSON.stringify({
          bankName: newPosBank.trim(),
          terminalTitle: `کارتخوان بانک ${newPosBank.trim()}`,
          sepidarPosCode: newPosCode.trim() || `POS-${Date.now().toString().slice(-4)}`,
        }),
      });
      setNewPosBank('');
      setNewPosCode('');
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  const previewAmps = (bootstrap?.amperages || []).map((a) => a.amp_value);
  const carScrapRate = scrapCategories[0]?.scrapPricePerAmp || 50000;

  return (
    <div className="space-y-6">
      {/* Top Save Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            مدیریت قیمت فروش (بر اساس هر آمپر برند) و قیمت خرید داغی
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            هر تغییری که اینجا ذخیره کنید بلافاصله در فرمول محاسبه خودکار صندوق طبقه پایین اعمال می‌گردد.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAllPricing}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'در حال ذخیره...' : 'ذخیره و اعمال فوری قیمت‌ها'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-extrabold">
          {error}
        </div>
      )}

      {/* Main Pricing Cards: Brand Per-Ampere & Scrap Per-Ampere */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Brand Per-Ampere Rates */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                ۱. قیمت فروش هر آمپر بر اساس برند باتری (تومان)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مثال: برند راین آمپری ۱۳۲,۰۰۰ تومان ← باتری ۶۰ آمپر راین = ۷,۹۲۰,۰۰۰ تومان
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedMatrix((v) => !v)}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showAdvancedMatrix ? 'بازگشت به نرخ واحد هر برند' : 'تفکیک پیشرفته نرخ خودرو / موتور / UPS'}
            </button>
          </div>

          <div className="space-y-3">
            {brandRates.map((b) => (
              <div
                key={b.brandId}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-black text-sm text-slate-900">برند {b.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    مثال ۶۰ آمپر نو: {formatToman(b.defaultPricePerAmp * 60)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">هر ۱ آمپر:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={b.defaultPricePerAmp.toLocaleString('en-US')}
                    onChange={(e) => updateBrandPrice(b.brandId, e.target.value)}
                    className="w-36 px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-amber-500 font-black text-sm text-center tabular-nums"
                  />
                  <span className="text-xs font-bold text-slate-500">تومان</span>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Advanced Brand × Category Matrix */}
          {showAdvancedMatrix && (
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-extrabold text-blue-900 mb-2">
                ماتریس نرخ هر آمپر به تفکیک «برند × نوع باتری»:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-50 text-blue-950 font-bold">
                      <th className="p-2 text-right border border-blue-100">برند</th>
                      {scrapCategories.map((c) => (
                        <th key={c.categoryId} className="p-2 text-center border border-blue-100">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {brandRates.map((b) => (
                      <tr key={b.brandId}>
                        <td className="p-2 font-black border border-slate-200 bg-slate-50">{b.name}</td>
                        {scrapCategories.map((c) => {
                          const cell = matrixRates.find(
                            (m) => m.brandId === b.brandId && m.categoryId === c.categoryId
                          );
                          const val = cell ? cell.pricePerAmp : b.defaultPricePerAmp;
                          return (
                            <td key={c.categoryId} className="p-2 border border-slate-200 text-center">
                              <input
                                type="text"
                                dir="ltr"
                                value={val.toLocaleString('en-US')}
                                onChange={(e) =>
                                  updateMatrixPrice(b.brandId, c.categoryId, e.target.value)
                                }
                                className="w-28 px-2 py-1 rounded border border-slate-300 text-center font-bold tabular-nums"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add New Brand */}
          <form onSubmit={handleAddBrand} className="pt-3 border-t border-slate-100 flex flex-wrap items-end gap-2.5">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">افزودن برند جدید باتری</label>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="مثلاً صبا / واریان"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div className="w-36">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">نرخ هر آمپر (تومان)</label>
              <input
                type="text"
                dir="ltr"
                value={newBrandPrice}
                onChange={(e) => setNewBrandPrice(toEnglishDigits(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              افزودن برند
            </button>
          </form>
        </div>

        {/* 2. Scrap Battery Per-Ampere Rates (نرخ داغی بر اساس نوع باتری) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Recycle className="w-4 h-4 text-rose-600" />
              ۲. نرخ کسر باتری داغی بر اساس نوع باتری (تومان)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مثال: داغی آمپری ۵۰,۰۰۰ تومان ← برای داغی ۶۰ آمپر مبلغ ۳,۰۰۰,۰۰۰ تومان از فاکتور کسر می‌شود.
            </p>
          </div>

          <div className="space-y-3">
            {scrapCategories.map((cat) => (
              <div
                key={cat.categoryId}
                className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-black text-sm text-slate-900">داغی {cat.name}</div>
                    <div className="text-[11px] text-rose-700 tabular-nums mt-0.5">
                      کسر ۶۰ آمپر داغی: {formatToman(cat.scrapPricePerAmp * 60)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      value={cat.scrapPricePerAmp.toLocaleString('en-US')}
                      onChange={(e) =>
                        updateScrapPrice(cat.categoryId, 'scrapPricePerAmp', e.target.value)
                      }
                      className="w-32 px-3 py-2 rounded-xl border border-rose-300 bg-white font-black text-sm text-center text-rose-900 tabular-nums"
                    />
                    <span className="text-xs font-bold text-slate-600">تومان</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-100 text-[11px]">
                  <div>
                    <label className="text-slate-500 font-semibold block mb-0.5">کد انبار نو در سپیدار</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={cat.sepidarWarehouseCode}
                      onChange={(e) =>
                        updateScrapPrice(cat.categoryId, 'sepidarWarehouseCode', e.target.value)
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-white font-mono text-left"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold block mb-0.5">کد انبار داغی سپیدار</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={cat.sepidarScrapWarehouseCode}
                      onChange={(e) =>
                        updateScrapPrice(cat.categoryId, 'sepidarScrapWarehouseCode', e.target.value)
                      }
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-white font-mono text-left"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Calculated Price Chart for All Amperages */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">
              جدول پیش‌نمایش خودکار قیمت فروش آمپراژها (بدون داغی / با احتساب کسر داغی هم‌آمپر)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            بر مبنای نرخ داغی {formatNumber(carScrapRate)} تومان به ازای هر آمپر
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">برند باتری (نرخ آمپر)</th>
                {previewAmps.map((amp) => (
                  <th key={amp} className="px-3 py-3 text-center tabular-nums">
                    {formatNumber(amp)} آمپر
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brandRates.map((b) => (
                <tr key={b.brandId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-black text-slate-900">{b.name}</div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      آمپری {formatNumber(b.defaultPricePerAmp)} تومان
                    </div>
                  </td>
                  {previewAmps.map((amp) => {
                    const gross = Math.round(amp * b.defaultPricePerAmp);
                    const withScrap = Math.max(0, gross - Math.round(amp * carScrapRate));
                    return (
                      <td key={amp} className="px-3 py-3 text-center tabular-nums">
                        <div className="font-black text-emerald-700">
                          {formatNumber(withScrap)} <span className="text-[10px]">با داغی</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          آزاد: {formatNumber(gross)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Amperage Options & POS Terminals Management + Price Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Amperages */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-900">مدیریت لیست آمپراژهای آماده صندوق</h3>
          <div className="flex flex-wrap gap-2">
            {(bootstrap?.amperages || []).map((a) => (
              <div
                key={a.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 tabular-nums"
              >
                <span>{formatNumber(a.amp_value)} آمپر</span>
                <button
                  type="button"
                  onClick={() => handleDeleteAmperage(a.id)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAmperage} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              dir="ltr"
              value={newAmpValue}
              onChange={(e) => setNewAmpValue(toEnglishDigits(e.target.value))}
              placeholder="آمپراژ جدید (مثلاً 7 یا 45 یا 100)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              افزودن
            </button>
          </form>
        </div>

        {/* POS Terminals */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            دستگاه‌های کارتخوان صندوق و کد متناظر در سپیدار
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(bootstrap?.posTerminals || []).map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="font-black text-slate-900">بانک {p.bank_name}</div>
                <div className="text-[11px] text-slate-500">{p.terminal_title}</div>
                <div className="text-[11px] font-mono text-emerald-700" dir="ltr">
                  Sepidar: {p.sepidar_pos_code}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddPos} className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newPosBank}
              onChange={(e) => setNewPosBank(e.target.value)}
              placeholder="نام بانک کارتخوان جدید (مثلاً تجارت)"
              className="flex-1 min-w-[160px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
            <input
              type="text"
              dir="ltr"
              value={newPosCode}
              onChange={(e) => setNewPosCode(e.target.value)}
              placeholder="کد کارتخوان در سپیدار"
              className="w-44 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-left"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              افزودن کارتخوان
            </button>
          </form>
        </div>
      </div>

      {/* Price Change Audit History */}
      {priceLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-500" />
            تاریخچه تغییرات نرخ آمپر و داغی توسط مدیر مالی
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {priceLogs.map((log) => (
              <div
                key={log.id}
                className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <span className="font-semibold text-slate-800">{log.description}</span>
                <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                  {log.user_name} — {formatJalaliDateTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
