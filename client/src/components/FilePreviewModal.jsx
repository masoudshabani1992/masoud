import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  Paperclip,
  Layers,
  Sparkles,
  FileCheck,
  Check
} from 'lucide-react';

export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null;

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const fileUrl = file.file_url || file.url || file.dieline_file_url || '';
  const fileName = file.original_filename || file.dieline_filename || file.name || file.filename || 'پیوست خط تیغ';
  const fileSize = file.size || file.file_size_bytes || file.size_bytes;
  
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  
  const isPdf = ext === 'pdf' || fileUrl.startsWith('data:application/pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext) || fileUrl.startsWith('data:image/');
  const isSvg = ext === 'svg' || fileUrl.startsWith('data:image/svg+xml');
  const isVectorOrCad = ['ai', 'eps', 'cdr', 'dxf'].includes(ext);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn" dir="rtl">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md" title={fileName}>
                  {fileName}
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700 uppercase">
                  {ext}
                </span>
              </div>
              {fileSize && (
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  حجم فایل: {typeof fileSize === 'number' ? formatBytes(fileSize) : `${fileSize} KB`}
                </div>
              )}
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls for Images */}
            {isImage && !isPdf && (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                  title="بزرگنمایی"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono px-1 font-bold text-slate-300">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                  title="کوچکنمایی"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
                  title="چرخش تصویر"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Direct Download Button */}
            {fileUrl && (
              <a
                href={fileUrl}
                download={fileName}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>دانلود فایل</span>
              </a>
            )}

            {/* Open in new tab */}
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
                title="باز کردن در برگه جدید"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 rounded-xl border border-slate-700 transition"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Viewer Area */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center relative">
          
          {/* 1. PDF Embedded Viewer */}
          {isPdf && (
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-white shadow-2xl">
              <iframe
                src={fileUrl}
                title={fileName}
                className="w-full h-full border-none"
              />
            </div>
          )}

          {/* 2. Image / SVG Viewer */}
          {isImage && !isPdf && (
            <div className="flex items-center justify-center max-w-full max-h-full overflow-auto p-4">
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/60 bg-white/5"
              />
            </div>
          )}

          {/* 3. Vector CAD / AI / CDR / Other binary formats */}
          {!isPdf && !isImage && (
            <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-bold text-base text-white">{fileName}</h4>
                <p className="text-xs text-slate-400">
                  {isVectorOrCad
                    ? `فایل وکتور صنعتی (${ext.toUpperCase()}) مناسب جهت باز کردن در Illustrator، CorelDRAW و دستگاه برش CNC`
                    : `فرمت ${ext.toUpperCase()} - آماده دریافت و بررسی`}
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1 font-mono text-right" dir="ltr">
                <div>Filename: {fileName}</div>
                <div>Format: {ext.toUpperCase()}</div>
                {fileSize && <div>Size: {typeof fileSize === 'number' ? formatBytes(fileSize) : `${fileSize} KB`}</div>}
              </div>

              <div className="pt-2 flex justify-center">
                <a
                  href={fileUrl}
                  download={fileName}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-teal-900/40 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل جهت استفاده در نرم‌افزار تخصصی</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Status Bar */}
        <div className="py-2.5 px-6 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>پیش‌نمایش فعال فایل در داشبورد کارخانه</span>
          </div>
          <div className="font-mono text-slate-500">
            Arman Amiran Packaging ERP • Live Asset Viewer
          </div>
        </div>

      </div>
    </div>
  );
}
