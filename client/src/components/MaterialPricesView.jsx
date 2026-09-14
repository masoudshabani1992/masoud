import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatToman, formatNumber, normalizeSearch } from '../utils/helpers';
import {
  Layers,
  Search,
  Save,
  CheckCircle,
  Edit2,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function MaterialPricesView() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchMaterials = () => {
    setLoading(true);
    api.getMaterials()
      .then((res) => setMaterials(res.materials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleStartEdit = (mat) => {
    setEditingId(mat.id);
    setEditPrice(mat.price_per_unit);
    setEditDesc(mat.description || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.updateMaterialPrice(id, {
        price_per_unit: parseFloat(editPrice) || 0,
        description: editDesc
      });
      setEditingId(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchMaterials();
    } catch (err) {
      alert('خطا در ذخیره قیمت: ' + err.message);
    }
  };

  const filtered = materials.filter((m) => {
    if (!searchTerm) return true;
    const term = normalizeSearch(searchTerm);
    return (
      normalizeSearch(m.name).includes(term) ||
      normalizeSearch(m.category).includes(term) ||
      normalizeSearch(m.description).includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>مدیریت نرخ و قیمت روز مقوا و ملزومات کارخانه</span>
              <span className="bg-emerald-500 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                پایه محاسبات اتوماسیون
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              تغییرات قیمت در این بخش مستقیماً در ماشین‌حساب برآورد و استعلام سفارشات جدید اثرگذار است.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>نرخ با موفقیت ذخیره شد</span>
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی مقوا، فلوت، زینک، چاپ و..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <button
          onClick={fetchMaterials}
          className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="تازه‌سازی لیست"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-100 text-slate-700 font-bold">
            <tr>
              <th className="p-3.5">دسته‌بندی</th>
              <th className="p-3.5">نام متریال / خدمت</th>
              <th className="p-3.5">واحد سنجش</th>
              <th className="p-3.5">قیمت پایه روز (تومان)</th>
              <th className="p-3.5">توضیحات و مشخصات فنی</th>
              <th className="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">در حال دریافت قیمت‌ها...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">موردی یافت نشد.</td>
              </tr>
            ) : (
              filtered.map((mat) => {
                const isEditing = editingId === mat.id;

                return (
                  <tr key={mat.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {mat.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{mat.name}</td>
                    <td className="p-3.5 text-slate-600 font-medium">{mat.unit}</td>
                    <td className="p-3.5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="px-2.5 py-1 text-xs border-2 border-indigo-500 rounded-lg font-mono font-bold w-36 bg-white"
                        />
                      ) : (
                        <strong className="text-emerald-700 font-bold font-mono text-sm">
                          {formatToman(mat.price_per_unit)}
                        </strong>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="px-2.5 py-1 text-xs border border-indigo-300 rounded-lg w-full bg-white"
                        />
                      ) : (
                        mat.description || '---'
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(mat.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[11px] flex items-center gap-1 shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>ذخیره</span>
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-slate-500 hover:bg-slate-200 rounded-md text-[11px]"
                          >
                            انصراف
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(mat)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="ویرایش قیمت"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
