import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  BatteryCharging,
  Recycle,
  CreditCard,
  Landmark,
  Banknote,
  Printer,
  Tag,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Eye,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../api.js';
import {
  formatJalaliDateTime,
  formatNumber,
  formatToman,
  paymentMethodLabel,
  sepidarStatusMeta,
  toEnglishDigits,
} from '../utils/format.js';
import { printBatteryLabel, printReceipt80mm } from '../utils/printEngine.js';

export default function CashierPosView({ bootstrap, onRefreshBootstrap, onOpenPrintModal }) {
  const categories = useMemo(
    () => (bootstrap?.categories || []).filter((c) => c.is_active),
    [bootstrap]
  );
  const brands = useMemo(
    () => (bootstrap?.brands || []).filter((b) => b.is_active),
    [bootstrap]
  );
  const amperages = useMemo(
    () => (bootstrap?.amperages || []).filter((a) => a.is_active),
    [bootstrap]
  );
  const posTerminals = useMemo(
    () => (bootstrap?.posTerminals || []).filter((p) => p.is_active),
    [bootstrap]
  );
  const rateMatrix = bootstrap?.brandCategoryRates || [];
  const settings = bootstrap?.publicSettings || {};

  // Form state
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [amperage, setAmperage] = useState(60);
  const [customAmpMode, setCustomAmpMode] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [hasScrap, setHasScrap] = useState(true);
  const [scrapCategoryId, setScrapCategoryId] = useState('');
  const [scrapAmperage, setScrapAmperage] = useState(60);
  const [scrapQuantity, setScrapQuantity] = useState(1);

  const [manualPriceOverride, setManualPriceOverride] = useState(null); // null = auto formula
  const [paymentMethod, setPaymentMethod] = useState('pos');
  const [posTerminalId, setPosTerminalId] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Quick battery search
  const [batterySearch, setBatterySearch] = useState('');

  // Recent sales & search
  const [recentSales, setRecentSales] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [searchAllStore, setSearchAllStore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRegisteredSale, setLastRegisteredSale] = useState(null);

  // Initialize defaults once bootstrap arrives
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
      setScrapCategoryId(categories[0].id);
    }
    if (!brandId && brands.length > 0) {
      setBrandId(brands[0].id);
    }
    if (!posTerminalId && posTerminals.length > 0) {
      setPosTerminalId(posTerminals[0].id);
    }
  }, [categories, brands, posTerminals, categoryId, brandId, posTerminalId]);

  const loadSalesHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (historySearch.trim()) {
        params.set('search', toEnglishDigits(historySearch.trim()));
      } else {
        params.set('period', 'today');
      }
      if (searchAllStore || historySearch.trim()) {
        params.set('scope', 'all_store');
      }
      const data = await apiRequest(`/api/sales?${params.toString()}`);
      setRecentSales(data.sales || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSalesHistory();
  }, [historySearch, searchAllStore]);

  // Helper to get Brand × Category per-ampere rate
  const getRatePerAmp = (bId, cId) => {
    const found = rateMatrix.find(
      (r) => Number(r.brand_id) === Number(bId) && Number(r.category_id) === Number(cId)
    );
    if (found) return Number(found.price_per_amp);
    const b = brands.find((x) => Number(x.id) === Number(bId));
    return b ? Number(b.default_price_per_amp) : 0;
  };

  const selectedCategory = categories.find((c) => Number(c.id) === Number(categoryId));
  const selectedBrand = brands.find((b) => Number(b.id) === Number(brandId));
  const selectedScrapCat =
    categories.find((c) => Number(c.id) === Number(scrapCategoryId || categoryId)) || selectedCategory;

  const unitPricePerAmp = getRatePerAmp(brandId, categoryId);
  const numericAmp = Number(amperage) || 0;
  const numericQty = Math.max(1, Number(quantity) || 1);
  const totalSoldAmps = numericAmp * numericQty;
  const grossAmount = Math.round(totalSoldAmps * unitPricePerAmp);

  const scrapRatePerAmp = hasScrap && selectedScrapCat ? Number(selectedScrapCat.scrap_price_per_amp) : 0;
  const numericScrapAmp = hasScrap ? Number(scrapAmperage) || 0 : 0;
  const numericScrapQty = hasScrap && numericScrapAmp > 0 ? Math.max(1, Number(scrapQuantity) || 1) : 0;
  const totalScrapAmps = numericScrapAmp * numericScrapQty;
  const scrapDeduction = Math.round(totalScrapAmps * scrapRatePerAmp);

  const autoNetPrice = Math.max(0, grossAmount - scrapDeduction);
  const effectiveFinalPrice = manualPriceOverride !== null ? manualPriceOverride : autoNetPrice;

  // Smart Search Combinations (نوع + برند + آمپراژ)
  const searchableCatalog = useMemo(() => {
    const items = [];
    for (const c of categories) {
      for (const b of brands) {
        const rate = getRatePerAmp(b.id, c.id);
        for (const a of amperages) {
          const basePrice = Math.round(a.amp_value * rate);
          items.push({
            key: `${c.id}-${b.id}-${a.amp_value}`,
            categoryId: c.id,
            categoryName: c.name,
            brandId: b.id,
            brandName: b.name,
            amp: a.amp_value,
            rate,
            basePrice,
            scrapRate: c.scrap_price_per_amp,
            searchText: `${c.name} ${b.name} ${a.amp_value} آمپر ${a.amp_value}ah`.toLowerCase(),
          });
        }
      }
    }
    return items;
  }, [categories, brands, amperages, rateMatrix]);

  const filteredCatalogResults = useMemo(() => {
    const q = toEnglishDigits(batterySearch).trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return searchableCatalog
      .filter((item) => tokens.every((tok) => item.searchText.includes(tok)))
      .slice(0, 9);
  }, [batterySearch, searchableCatalog]);

  const applyCatalogItem = (item) => {
    setCategoryId(item.categoryId);
    setScrapCategoryId(item.categoryId);
    setBrandId(item.brandId);
    setAmperage(item.amp);
    setCustomAmpMode(false);
    if (hasScrap) {
      setScrapAmperage(item.amp);
    }
    setManualPriceOverride(null);
    setBatterySearch('');
  };

  const handleSubmitSale = async (postAction = 'modal') => {
    setErrorMsg('');
    if (!categoryId || !brandId || !numericAmp || numericAmp <= 0) {
      setErrorMsg('لطفاً نوع باتری، برند و آمپراژ را انتخاب نمایید.');
      return;
    }
    if (paymentMethod === 'pos' && !posTerminalId) {
      setErrorMsg('لطفاً دستگاه کارتخوان (صادرات / پارسیان / ملت) را انتخاب کنید.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(categoryId),
        brandId: Number(brandId),
        amperage: numericAmp,
        quantity: numericQty,
        hasScrap: hasScrap && numericScrapAmp > 0,
        scrapCategoryId: Number(scrapCategoryId || categoryId),
        scrapAmperage: hasScrap ? numericScrapAmp : 0,
        scrapQuantity: hasScrap ? numericScrapQty : 0,
        finalSaleAmount: effectiveFinalPrice,
        paymentMethod,
        posTerminalId: paymentMethod === 'pos' ? Number(posTerminalId) : null,
        paymentRef,
        customerName,
        customerPhone: toEnglishDigits(customerPhone),
      };

      const data = await apiRequest('/api/sales', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const created = data.sale;
      setLastRegisteredSale(created);

      // Reset transient per-customer fields while keeping popular defaults ready for fast next customer
      setManualPriceOverride(null);
      setPaymentRef('');
      setCustomerName('');
      setCustomerPhone('');
      setQuantity(1);
      setScrapQuantity(1);

      if (onRefreshBootstrap) onRefreshBootstrap();
      loadSalesHistory();

      if (postAction === 'print_label') {
        printBatteryLabel(created, settings);
        apiRequest(`/api/sales/${created.id}/print`, {
          method: 'POST',
          body: JSON.stringify({ type: 'label' }),
        }).catch(() => {});
      } else if (postAction === 'print_receipt') {
        printReceipt80mm(created, settings);
        apiRequest(`/api/sales/${created.id}/print`, {
          method: 'POST',
          body: JSON.stringify({ type: 'receipt' }),
        }).catch(() => {});
      } else if (postAction === 'modal' && onOpenPrintModal) {
        onOpenPrintModal(created, 'both');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Search Bar for Cashier */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-600" />
            جستجوی سریع باتری برای صندوقدار (بر اساس نوع، برند یا آمپراژ)
          </label>
          <span className="text-xs font-bold text-slate-500">
            مثال جستجو: «راین 60»، «اوربیتال 74»، «موتور»، «ups 90»
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={batterySearch}
            onChange={(e) => setBatterySearch(e.target.value)}
            placeholder="نام باتری، برند (راین، اکسون، اوربیتال) یا عدد آمپراژ (50، 60، 66، 70، 74، 90) را تایپ کنید..."
            className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-semibold"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {batterySearch && (
            <button
              type="button"
              onClick={() => setBatterySearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-200/70"
            >
              پاک کردن
            </button>
          )}
        </div>

        {filteredCatalogResults.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
            {filteredCatalogResults.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => applyCatalogItem(item)}
                className="text-right p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {item.categoryName} — برند {item.brandName}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums">
                    آمپری {formatNumber(item.rate)} تومان | پایه: {formatToman(item.basePrice)}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-black text-xs tabular-nums shrink-0">
                  {formatNumber(item.amp)} آمپر
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success Banner for Last Registered Sale with Instant Dual Print Buttons */}
      {lastRegisteredSale && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-emerald-950 flex flex-wrap items-center gap-2">
                <span>فاکتور {lastRegisteredSale.invoice_number} ثبت شد</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black" dir="ltr">
                  لیبل #{lastRegisteredSale.label_number}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 font-semibold">
                {lastRegisteredSale.category_name} {lastRegisteredSale.brand_name} {lastRegisteredSale.amperage} آمپر | قابل پرداخت:{' '}
                {formatToman(lastRegisteredSale.final_sale_amount)} | وضعیت: ارسال شده به کارتابل تایید مدیر مالی (سپیدار)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                printBatteryLabel(lastRegisteredSale, settings);
                apiRequest(`/api/sales/${lastRegisteredSale.id}/print`, {
                  method: 'POST',
                  body: JSON.stringify({ type: 'label' }),
                }).catch(() => {});
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              چاپ لیبل (#{lastRegisteredSale.label_number})
            </button>

            <button
              type="button"
              onClick={() => {
                printReceipt80mm(lastRegisteredSale, settings);
                apiRequest(`/api/sales/${lastRegisteredSale.id}/print`, {
                  method: 'POST',
                  body: JSON.stringify({ type: 'receipt' }),
                }).catch(() => {});
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              چاپ فیش ۸ سانتی
            </button>

            <button
              type="button"
              onClick={() => onOpenPrintModal && onOpenPrintModal(lastRegisteredSale, 'both')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              پیش‌نمایش چاپ
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Column (8 cols): Structured Selection Form */}
        <div className="lg:col-span-8 space-y-5">
          {/* Step 1 & 2: Battery Category & Brand */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
            {/* 1. Category */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-xs flex items-center justify-center font-black">
                    ۱
                  </span>
                  نوع باتری (انتخاب از لیست)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setCategoryId(id);
                    setScrapCategoryId(id);
                    setManualPriceOverride(null);
                  }}
                  className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {categories.map((cat) => {
                  const active = Number(categoryId) === Number(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setScrapCategoryId(cat.id);
                        setManualPriceOverride(null);
                      }}
                      className={`p-3.5 rounded-xl border-2 text-right transition cursor-pointer ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="font-extrabold text-sm flex items-center justify-between">
                        <span>{cat.name}</span>
                        <BatteryCharging
                          className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`}
                        />
                      </div>
                      <div
                        className={`text-[11px] mt-1 tabular-nums ${
                          active ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        داغی هر آمپر: {formatNumber(cat.scrap_price_per_amp)} تومان
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Brand */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-xs flex items-center justify-center font-black">
                    ۲
                  </span>
                  برند باتری (صبا باتری)
                </label>
                <select
                  value={brandId}
                  onChange={(e) => {
                    setBrandId(Number(e.target.value));
                    setManualPriceOverride(null);
                  }}
                  className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (آمپری {formatNumber(getRatePerAmp(b.id, categoryId))} تومان)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {brands.map((b) => {
                  const active = Number(brandId) === Number(b.id);
                  const rate = getRatePerAmp(b.id, categoryId);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBrandId(b.id);
                        setManualPriceOverride(null);
                      }}
                      className={`p-3.5 rounded-xl border-2 text-right transition cursor-pointer ${
                        active
                          ? 'border-amber-500 bg-amber-50 text-slate-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-base">{b.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          صبا باتری
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-600 mt-1.5 tabular-nums">
                        هر آمپر: <span className="text-slate-900">{formatNumber(rate)}</span> تومان
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Amperage & Quantity */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-xs flex items-center justify-center font-black">
                    ۳
                  </span>
                  آمپراژ باتری فروخته شده
                </label>

                <div className="flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2 py-1 border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 ml-1">تعداد:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((q) => Math.max(1, q - 1));
                        setManualPriceOverride(null);
                      }}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-black text-sm tabular-nums">
                      {formatNumber(quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((q) => q + 1);
                        setManualPriceOverride(null);
                      }}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCustomAmpMode((v) => !v)}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    {customAmpMode ? 'انتخاب از لیست آماده' : 'وارد کردن آمپراژ دلخواه (موتور/UPS)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {amperages.map((a) => {
                  const active = !customAmpMode && Number(amperage) === Number(a.amp_value);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setCustomAmpMode(false);
                        setAmperage(a.amp_value);
                        setManualPriceOverride(null);
                      }}
                      className={`py-3 px-2 rounded-xl border-2 text-center transition cursor-pointer ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:border-blue-300 text-slate-800'
                      }`}
                    >
                      <div className="text-lg font-black tabular-nums leading-none">
                        {formatNumber(a.amp_value)}
                      </div>
                      <div className={`text-[10px] font-bold mt-1 ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                        آمپر (Ah)
                      </div>
                    </button>
                  );
                })}
              </div>

              {customAmpMode && (
                <div className="mt-3 flex items-center gap-3 bg-blue-50/70 border border-blue-200 p-3 rounded-xl">
                  <label className="text-xs font-bold text-blue-900 shrink-0">آمپراژ دقیق باتری:</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={amperage}
                    onChange={(e) => {
                      setAmperage(toEnglishDigits(e.target.value));
                      setManualPriceOverride(null);
                    }}
                    placeholder="مثلاً 7 یا 9 یا 100"
                    className="w-32 px-3 py-1.5 rounded-lg border border-blue-300 bg-white font-bold text-sm text-center"
                  />
                  <span className="text-xs text-blue-700 font-semibold">آمپرساعت (Ah)</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Scrap Battery (داغی باتری) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-xs flex items-center justify-center font-black">
                  ۴
                </span>
                <Recycle className="w-4 h-4 text-rose-600" />
                داغی باتری دریافتی از مشتری (کسر از قیمت فاکتور)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasScrap(false);
                    setScrapAmperage(0);
                    setManualPriceOverride(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition cursor-pointer ${
                    !hasScrap
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  بدون تحویل داغی
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasScrap(true);
                    if (!scrapAmperage) setScrapAmperage(amperage || 60);
                    setManualPriceOverride(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition cursor-pointer ${
                    hasScrap
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  دارای باتری داغی
                </button>
              </div>
            </div>

            {hasScrap ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {amperages.map((a) => {
                    const active = Number(scrapAmperage) === Number(a.amp_value);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setScrapAmperage(a.amp_value);
                          setManualPriceOverride(null);
                        }}
                        className={`py-2.5 px-2 rounded-xl border-2 text-center transition cursor-pointer ${
                          active
                            ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:border-rose-300 text-slate-700'
                        }`}
                      >
                        <div className="text-base font-black tabular-nums leading-none">
                          {formatNumber(a.amp_value)}
                        </div>
                        <div className="text-[10px] font-bold mt-1 text-slate-500">داغی Ah</div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 bg-rose-50/50 border border-rose-100 rounded-xl p-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      نوع باتری داغی (نرخ هر آمپر)
                    </label>
                    <select
                      value={scrapCategoryId || categoryId}
                      onChange={(e) => {
                        setScrapCategoryId(Number(e.target.value));
                        setManualPriceOverride(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (آمپری {formatNumber(c.scrap_price_per_amp)} تومان)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      آمپراژ دقیق داغی (قابل تایپ)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={scrapAmperage}
                      onChange={(e) => {
                        setScrapAmperage(toEnglishDigits(e.target.value));
                        setManualPriceOverride(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      تعداد باتری داغی تحویلی
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      value={scrapQuantity}
                      onChange={(e) => {
                        const v = Math.max(1, Number(toEnglishDigits(e.target.value)) || 1);
                        setScrapQuantity(v);
                        setManualPriceOverride(null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-200 font-semibold">
                مشتری باتری داغی تحویل نداده است (مبلغ کسر داغی: ۰ تومان).
              </div>
            )}
          </div>

          {/* Step 5: Payment Method & POS Bank Selection + Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-xs flex items-center justify-center font-black">
                ۵
              </span>
              روش پرداخت و انتخاب کارتخوان
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('pos')}
                className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-extrabold text-sm transition cursor-pointer ${
                  paymentMethod === 'pos'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>کارتخوان بانکی</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-extrabold text-sm transition cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Landmark className="w-4 h-4 text-blue-600" />
                <span>واریز به حساب</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-xl border-2 flex items-center justify-center gap-2 font-extrabold text-sm transition cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-amber-600 bg-amber-50 text-amber-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-600" />
                <span>دریافت نقد</span>
              </button>
            </div>

            {/* POS Terminal Sub-selection (صادرات، پارسیان، ملت) */}
            {paymentMethod === 'pos' && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                <div className="text-xs font-extrabold text-emerald-900">
                  انتخاب دستگاه کارتخوان (الزامی برای تطبیق بانک در سپیدار):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {posTerminals.map((pos) => {
                    const selected = Number(posTerminalId) === Number(pos.id);
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPosTerminalId(pos.id)}
                        className={`p-3 rounded-xl border-2 text-right transition cursor-pointer ${
                          selected
                            ? 'border-emerald-700 bg-emerald-700 text-white shadow-xs'
                            : 'border-emerald-200 bg-white hover:border-emerald-400 text-slate-800'
                        }`}
                      >
                        <div className="font-black text-sm">بانک {pos.bank_name}</div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            selected ? 'text-emerald-100' : 'text-slate-500'
                          }`}
                        >
                          {pos.terminal_title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Reference & Customer Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  شماره پیگیری / فیش (اختیاری)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(toEnglishDigits(e.target.value))}
                  placeholder="کد مرجع کارتخوان / واریز"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  نام مشتری / شرح (اختیاری)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="نام خریدار یا خودرو"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  تلفن همراه مشتری (اختیاری)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(toEnglishDigits(e.target.value))}
                  placeholder="0912..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold text-left"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Left Column (4 cols): Live Pricing Summary, Editable Sales Price Field & Dual Print Submit */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div>
                <div className="text-xs text-slate-400 font-semibold">خلاصه محاسبه خودکار صندوق</div>
                <div className="text-base font-black text-white mt-0.5">
                  {selectedCategory?.name || '-'} — {selectedBrand?.name || '-'}
                </div>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-amber-300 font-bold">لیبل نوبت بعدی</div>
                <div className="text-lg font-black text-amber-400 tabular-nums" dir="ltr">
                  #{settings.next_label_number || 1500}
                </div>
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-800/80 rounded-xl p-3">
                <div>
                  <div className="font-bold text-slate-200">قیمت باتری نو</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                    {formatNumber(totalSoldAmps)} آمپر × {formatNumber(unitPricePerAmp)} تومان
                  </div>
                </div>
                <div className="font-black text-sm text-white tabular-nums">
                  {formatToman(grossAmount)}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-800/80 rounded-xl p-3">
                <div>
                  <div className="font-bold text-rose-300">کسر باتری داغی</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                    {hasScrap && totalScrapAmps > 0
                      ? `${formatNumber(totalScrapAmps)} آمپر × ${formatNumber(scrapRatePerAmp)} تومان`
                      : 'بدون تحویل داغی'}
                  </div>
                </div>
                <div className="font-black text-sm text-rose-400 tabular-nums">
                  {hasScrap && scrapDeduction > 0 ? `${formatNumber(scrapDeduction)}- تومان` : '۰ تومان'}
                </div>
              </div>
            </div>

            {/* Editable Sales Price Field (فیلد قیمت فروش) */}
            <div className="pt-2 border-t border-slate-700/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  فیلد قیمت فروش نهایی (تومان)
                </label>
                {manualPriceOverride !== null && (
                  <button
                    type="button"
                    onClick={() => setManualPriceOverride(null)}
                    className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    بازگشت به قیمت خودکار
                  </button>
                )}
              </div>

              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={effectiveFinalPrice.toLocaleString('en-US')}
                onChange={(e) => {
                  const raw = toEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                  setManualPriceOverride(raw === '' ? 0 : Number(raw));
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-amber-500/80 focus:border-amber-400 text-amber-300 font-black text-xl text-center tabular-nums outline-none"
              />

              {manualPriceOverride !== null && manualPriceOverride !== autoNetPrice && (
                <div className="mt-1.5 text-[11px] text-amber-200/90 text-center tabular-nums">
                  قیمت فرمول سیستم: {formatToman(autoNetPrice)} (اصلاح دستی توسط صندوقدار)
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitSale('modal')}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>{submitting ? 'در حال ثبت...' : 'ثبت فاکتور + پنجره چاپ دوگانه'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitSale('print_label')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>ثبت + چاپ لیبل</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitSale('print_receipt')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>ثبت + فیش ۸ سانتی</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cashier Sales History & Reprint Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              فاکتورهای ثبت‌شده و چاپ مجدد لیبل / فیش ۸ سانتی
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              امکان جستجوی سریع فاکتور قبلی با شماره لیبل (از ۱۵۰۰ به بالا)، شماره فاکتور یا نام مشتری
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={searchAllStore}
                onChange={(e) => setSearchAllStore(e.target.checked)}
                className="rounded border-slate-300"
              />
              نمایش همه صندوق‌ها
            </label>
            <div className="relative">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="جستجوی لیبل (مثلاً 1500) یا نام..."
                className="pr-8 pl-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold w-56"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">کد لیبل</th>
                <th className="px-4 py-3">شماره فاکتور</th>
                <th className="px-4 py-3">ساعت و تاریخ</th>
                <th className="px-4 py-3">شرح باتری</th>
                <th className="px-4 py-3">داغی</th>
                <th className="px-4 py-3">مبلغ نهایی</th>
                <th className="px-4 py-3">پرداخت</th>
                <th className="px-4 py-3">صندوقدار</th>
                <th className="px-4 py-3">وضعیت سپیدار</th>
                <th className="px-4 py-3 text-center">چاپ پرینترها</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400 font-semibold">
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                recentSales.slice(0, 25).map((sale) => {
                  const st = sepidarStatusMeta(sale.sepidar_status, sale.bot_queue_status);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-950 font-black tabular-nums" dir="ltr">
                          #{sale.label_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800" dir="ltr">
                        {sale.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-slate-600 tabular-nums">
                        {formatJalaliDateTime(sale.created_at)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {sale.category_name} {sale.brand_name} — {formatNumber(sale.amperage)}Ah
                        {sale.quantity > 1 ? ` (${formatNumber(sale.quantity)} عدد)` : ''}
                      </td>
                      <td className="px-4 py-3 text-rose-700 font-semibold tabular-nums">
                        {sale.has_scrap ? `${formatNumber(sale.total_scrap_amps)}Ah (-${formatNumber(sale.scrap_deduction_amount)})` : 'ندارد'}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900 tabular-nums">
                        {formatToman(sale.final_sale_amount)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {paymentMethodLabel(sale)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-semibold">{sale.cashier_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${st.badgeClass}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => printBatteryLabel(sale, settings)}
                            title="چاپ مستقیم لیبل"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Tag className="w-3.5 h-3.5" />
                            <span>لیبل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => printReceipt80mm(sale, settings)}
                            title="چاپ مستقیم فیش ۸ سانتی"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>فیش ۸</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPrintModal && onOpenPrintModal(sale, 'both')}
                            title="پیش‌نمایش"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
}
