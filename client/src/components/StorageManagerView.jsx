import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  HardDrive,
  Folder,
  File,
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Layers,
  Paperclip,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function StorageManagerView() {
  const { currentUser, role } = useAuth();
  const [files, setFiles] = useState([]);
  const [userFolders, setUserFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const fetchStorageFiles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedUser !== 'all') params.username = selectedUser;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const res = await api.getStorageFiles(params);
      if (res && res.success) {
        setFiles(res.files || []);
        setUserFolders(res.user_folders || []);
      }
    } catch (err) {
      console.error('Error fetching storage files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageFiles();
  }, [selectedUser, selectedCategory]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('حجم فایل بیش از سقف مجاز (۵۰ مگابایت) است.');
      return;
    }

    setUploading(true);
    setUploadSuccess(null);
    try {
      const res = await api.uploadToStorage(file, uploadCategory);
      if (res && res.success) {
        setUploadSuccess(`فایل «${file.name}» با موفقیت در پوشه کاربر (${res.username}) ذخیره گردید.`);
        fetchStorageFiles();
      }
    } catch (err) {
      alert('خطا در آپلود فایل به Storage: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`آیا از حذف فایل «${file.original_filename}» از پوشه Storage (${file.username}) اطمینان دارید؟`)) {
      return;
    }

    try {
      const res = await api.deleteStorageFile(file.id);
      if (res.success) {
        setFiles(files.filter(f => f.id !== file.id));
      }
    } catch (err) {
      alert('خطا در حذف فایل: ' + err.message);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalStorageSize = files.reduce((acc, f) => acc + (f.file_size_bytes || 0), 0);

  return (
    <div className="w-full space-y-6 select-none animate-fadeIn" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">مرکز ذخیره‌سازی فایل‌ها و پیوست‌ها (Storage)</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold">
                پوشه‌بندی خودکار بر اساس کاربر
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              کلیه خطوط تیغ، قالب‌ها، طرح‌های چاپی، اسناد اکسل و پیوست‌های ارسالی مستقیماً در پوشه فیزیکی <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">Storage/نام_کاربر/</code> ذخیره می‌شوند.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="cursor-pointer px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'در حال آپلود...' : 'آپلود مستقیم فایل'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button
            onClick={fetchStorageFiles}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition border border-slate-700"
            title="بروزرسانی فایل‌ها"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">✕</button>
        </div>
      )}

      {/* User Storage Folders KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedUser('all')}
          className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            selectedUser === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span>همه پوشه‌ها</span>
            <Folder className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-base font-black font-mono">
            {files.length} فایل
          </div>
        </button>

        {userFolders.map((uf) => (
          <button
            key={uf.username}
            onClick={() => setSelectedUser(selectedUser === uf.username ? 'all' : uf.username)}
            className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              selectedUser === uf.username
                ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400 text-cyan-950 shadow-md font-bold'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold truncate">
              <span className="truncate">Storage/{uf.username}</span>
              <User className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm font-black font-mono">{uf.file_count}</span>
              <span className="text-[10px] text-slate-500 font-mono">{formatBytes(uf.total_size)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">دسته‌بندی:</span>
          {['all', 'dieline', 'artwork', 'migration', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' && 'همه فایل‌ها'}
              {cat === 'dieline' && 'خطوط تیغ و قالب'}
              {cat === 'artwork' && 'طرح چاپی و گرافیک'}
              {cat === 'migration' && 'فایل‌های اکسل و مهاجرت'}
              {cat === 'general' && 'پیوست‌های عمومی'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در نام فایل، کاربر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStorageFiles()}
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Files Grid / List */}
      {loading ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
          <p className="text-sm font-bold text-slate-500">در حال بارگذاری لیست فایل‌های Storage...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 text-slate-400">
          <Folder className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-base font-bold text-slate-700">هیچ فایلی در این پوشه ذخیره نشده است.</p>
          <p className="text-xs text-slate-400">فایل‌های آپلود شده توسط بازاریاب‌ها، طراحان و مدیران به صورت خودکار در این قسمت قرار می‌گیرند.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">نام فایل اصلی</th>
                  <th className="py-3 px-4">پوشه کاربر در Storage</th>
                  <th className="py-3 px-4">دسته‌بندی</th>
                  <th className="py-3 px-4">حجم فایل</th>
                  <th className="py-3 px-4">تاریخ آپلود</th>
                  <th className="py-3 px-4 text-center">عملیات و دانلود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition">
                    {/* File Name & Path */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                            {file.original_filename}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            storage/{file.relative_path}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* User Folder */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 text-[11px]">
                        Storage/{file.username}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {file.category === 'dieline' && '📐 خط تیغ و قالب'}
                        {file.category === 'artwork' && '🎨 طرح چاپی'}
                        {file.category === 'migration' && '📊 اکسل مهاجرت'}
                        {file.category === 'general' && '📎 پیوست عمومی'}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {formatBytes(file.file_size_bytes)}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {file.created_at?.split(' ')[0] || file.created_at?.split('T')[0] || '1405/01/15'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={file.file_url}
                          download={file.original_filename}
                          className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          title="دانلود فایل از Storage"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>دانلود</span>
                        </a>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + file.file_url);
                            alert('لینک مستقیم فایل در حافظه کپی شد.');
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="کپی آدرس فایل"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {(role === 'ceo' || currentUser?.username === file.username) && (
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                            title="حذف فایل از Storage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
