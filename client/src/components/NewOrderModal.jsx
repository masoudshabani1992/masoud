import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BOX_TYPES, BOX_STRUCTURES } from '../utils/helpers';
import {
  X,
  PlusCircle,
  Boxes,
  User,
  Ruler,
  FileSpreadsheet,
  AlertCircle,
  Building,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function NewOrderModal({ isOpen, onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    box_type: BOX_TYPES[0],
    box_structure: BOX_STRUCTURES[0],
    length_mm: 200,
    width_mm: 140,
    height_mm: 60,
    quantity: 5000,
    priority: 'normal',
    notes: '',
    targetDeliveryDate: '۱۴۰۳/۰۶/۳۰',
    paperPreference: 'ایندربرد ۳۰۰ گرم',
    printColorsPreference: '۴ رنگ افست + سلفون مات'
  });

  useEffect(() => {
    if (isOpen) {
      api.getCustomers().then((res) => {
        setCustomers(res.customers || []);
        if (res.customers?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            customer_id: res.customers[0].id,
            customer_name: res.customers[0].company_name,
            customer_phone: res.customers[0].phone
          }));
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomerSelect = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setIsNewCustomer(true);
      setFormData((prev) => ({ ...prev, customer_id: '', customer_name: '', customer_phone: '' }));
    } else {
      setIsNewCustomer(false);
      const cust = customers.find((c) => c.id === parseInt(val));
      if (cust) {
        setFormData((prev) => ({
          ...prev,
          customer_id: cust.id,
          customer_name: cust.company_name,
          customer_phone: cust.phone
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.title || !formData.customer_name || !formData.quantity) {
      setError('لطفا عنوان پروژه، نام مشتری و تیراژ را مشخص فرمایید.');
      return;
    }

    setLoading(true);
    try {
      // If new customer, create it first
      let custId = formData.customer_id;
      if (isNewCustomer && formData.customer_name) {
        const newCustRes = await api.createCustomer({
          company_name: formData.customer_name,
          contact_person: formData.customer_name,
          phone: formData.customer_phone || '',
          address: '',
          notes: 'ثبت شده از طریق فرم سفارش'
        });
        custId = newCustRes.id;
      }

      const payload = {
        title: formData.title,
        customer_id: custId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        box_type: formData.box_type,
        box_structure: formData.box_structure,
        length_mm: parseFloat(formData.length_mm),
        width_mm: parseFloat(formData.width_mm),
        height_mm: parseFloat(formData.height_mm),
        quantity: parseInt(formData.quantity),
        priority: formData.priority,
        specs_data: {
          notes: formData.notes,
          targetDeliveryDate: formData.targetDeliveryDate,
          paperPreference: formData.paperPreference,
          printColorsPreference: formData.printColorsPreference
        }
      };

      const res = await api.createProject(payload);
      onCreated(res);
      onClose();
    } catch (err) {
      setError(err.message || 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>مرحله ۱: ثبت و تعریف سفارش جدید بازرگانی</span>
              </h2>
              <p className="text-xs text-indigo-200">
                مشخصات اولیه، تعریف مشتری، ابعاد فیزیکی و تیراژ مورد نیاز جعبه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>اطلاعات مشتری و کارفرما</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">انتخاب مشتری</label>
                <select
                  onChange={handleCustomerSelect}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name} ({c.contact_person})
                    </option>
                  ))}
                  <option value="new">+ تعریف مشتری جدید...</option>
                </select>
              </div>

              {isNewCustomer && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">نام شرکت / شخص مشتری</label>
                    <input
                      type="text"
                      placeholder="مثلا: شرکت آرایشی گلستان"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">شماره تماس همراه</label>
                    <input
                      type="text"
                      placeholder="0912..."
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Order Title & Box Type */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">عنوان کامل سفارش / پروژه</label>
              <input
                type="text"
                placeholder="مثلا: جعبه لمینتی ۲۴ عددی صادراتی چای کیسه‌ای"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع جعبه و متریال پایه</label>
                <select
                  value={formData.box_type}
                  onChange={(e) => setFormData({ ...formData, box_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {BOX_TYPES.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ساختار و مدل باز و بست جعبه</label>
                <select
                  value={formData.box_structure}
                  onChange={(e) => setFormData({ ...formData, box_structure: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {BOX_STRUCTURES.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Physical Dimensions & Quantity */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-indigo-600" />
              <span>ابعاد فیزیکی (میلی‌متر) و تیراژ تولید</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">طول (L) mm</label>
                <input
                  type="number"
                  value={formData.length_mm}
                  onChange={(e) => setFormData({ ...formData, length_mm: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">عرض (W) mm</label>
                <input
                  type="number"
                  value={formData.width_mm}
                  onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ارتفاع (H) mm</label>
                <input
                  type="number"
                  value={formData.height_mm}
                  onChange={(e) => setFormData({ ...formData, height_mm: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-800 mb-1">تیراژ (تعداد جعبه)</label>
                <input
                  type="number"
                  step="500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border-2 border-indigo-300 bg-white font-mono font-bold text-indigo-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Priority & Extra notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">اولویت تولید</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="normal">عادی (طبق زمان‌بندی روال)</option>
                <option value="high">اولویت بالا</option>
                <option value="urgent">فوری و اضطراری</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">تاریخ تحویل مورد نظر مشتری</label>
              <input
                type="text"
                placeholder="۱۴۰۳/۰۶/۳۰"
                value={formData.targetDeliveryDate}
                onChange={(e) => setFormData({ ...formData, targetDeliveryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">توضیحات و نیازمندی‌های خاص مشتری</label>
            <textarea
              rows="2"
              placeholder="مثلا: مقوای ضد رطوبت، سلفون مخملی، تست افتادن از ارتفاع..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'در حال ثبت...' : 'ثبت نهایی و ارجاع به استعلام قیمت (مرحله ۲)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
