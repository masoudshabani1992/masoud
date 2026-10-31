import React from 'react';
import {
  BookOpen,
  Bot,
  Database,
  Download,
  FileSpreadsheet,
  MonitorSmartphone,
  Printer,
  Server,
} from 'lucide-react';
import { buildBotFileDownloadUrl, buildCsvDownloadUrl } from '../api.js';
import { DashCard, HIDDIFY_SERIES } from './HiddifyPrimitives.jsx';

export default function AdminGuideView({ mode = 'guide' }) {
  if (mode === 'backup') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold m-0">پشتیبان‌گیری و دانلود پکیج نصب</h2>
          <p style={{ color: 'var(--p-text-muted-color)' }} className="text-xs sm:text-sm mt-1.5 mb-0">
            دانلود نسخه کامل ویندوز سرور، خروجی اکسل سپیدار و فایل‌های اجرایی ربات بومی دسکتاپ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashCard
            title="پکیج کامل اتوماسیون ویندوز (نسخه ۱۴.۰.۵)"
            subtitle="شامل سرور وب، پایگاه داده، تقویم شمسی و ربات بومی سپیدار"
            icon={Database}
            accent={HIDDIFY_SERIES.usage}
          >
            <p style={{ color: 'var(--p-text-muted-color)' }} className="text-xs leading-relaxed mb-4">
              این بسته فشرده شامل تمامی فایل‌های اجرایی سرور ویندوز (`start-windows-server.bat`) و برنامه دسکتاپ بومی سپیدار (`KavehSepidarBot.exe`) بدون نیاز به پایتون است.
            </p>
            <a
              href="/api/download-package"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-extrabold transition"
            >
              <Download className="w-4 h-4" />
              دانلود مستقیم پکیج کامل (kaveh-battery-automation.zip)
            </a>
          </DashCard>

          <DashCard
            title="خروجی اکسل / CSV استاندارد سپیدار سیستم"
            subtitle="پشتیبان‌گیری از کلیه فاکتورهای فروش، داغی و رسیدهای کارتخوان"
            icon={FileSpreadsheet}
            accent={HIDDIFY_SERIES.online}
          >
            <p style={{ color: 'var(--p-text-muted-color)' }} className="text-xs leading-relaxed mb-4">
              فایل خروجی با کدگذاری استاندارد ویندوز (`UTF-8 BOM`) تولید می‌شود و مستقیماً در اکسل فارسی و منوی ورود گروهی سپیدار قابل بازگشایی است.
            </p>
            <a
              href={buildCsvDownloadUrl({ period: 'all' })}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-extrabold transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              دانلود فایل پشتیبان اکسل کل اسناد (CSV)
            </a>
          </DashCard>
        </div>

        <DashCard
          title="فایل‌های مجزای ربات بومی ویندوز سپیدار (.EXE)"
          subtitle="بدون نیاز به نصب پایتون یا وابستگی جانبی روی ویندوز سرور"
          icon={Bot}
          accent={HIDDIFY_SERIES.users}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={buildBotFileDownloadUrl('start-sepidar-bot.bat')}
              style={{ borderColor: 'var(--p-content-border-color)' }}
              className="p-3.5 rounded-xl border hover:border-blue-500/50 flex items-center justify-between text-xs font-bold transition"
            >
              <span>۱. لانچر و سازنده فایل اجرایی (start-sepidar-bot.bat)</span>
              <Download className="w-4 h-4 text-blue-600" />
            </a>
            <a
              href={buildBotFileDownloadUrl('KavehSepidarBot.cs')}
              style={{ borderColor: 'var(--p-content-border-color)' }}
              className="p-3.5 rounded-xl border hover:border-blue-500/50 flex items-center justify-between text-xs font-bold transition"
            >
              <span>۲. کد برنامه دسکتاپ دات‌نت (KavehSepidarBot.cs)</span>
              <Download className="w-4 h-4 text-blue-600" />
            </a>
          </div>
        </DashCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold m-0">راهنمای نصب سرور ویندوز و اتصال سپیدار</h2>
        <p style={{ color: 'var(--p-text-muted-color)' }} className="text-xs sm:text-sm mt-1.5 mb-0">
          معماری شبکه دو طبقه (صندوق فروش طبقه پایین و سرور سپیدار طبقه بالا)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashCard
          title="۱. راه‌اندازی سرور طبقه بالا"
          subtitle="اجرای یک‌کلیکی روی ویندوز سرور"
          icon={Server}
          accent={HIDDIFY_SERIES.usage}
        >
          <ol style={{ color: 'var(--p-text-muted-color)' }} className="list-decimal pr-4 space-y-2 text-xs leading-relaxed">
            <li>نرم‌افزار Node.js LTS را یک‌بار روی ویندوز سرور طبقه بالا نصب کنید.</li>
            <li>روی فایل <code className="font-mono text-blue-600">start-windows-server.bat</code> دابل‌کلیک کنید تا پورت ۳۰۰۰ فعال شود.</li>
            <li>صندوقداران طبقه پایین با وارد کردن IP سرور (مثلاً <code className="font-mono">http://192.168.1.100:3000</code>) در مرورگر کروم به صندوق متصل می‌شوند.</li>
          </ol>
        </DashCard>

        <DashCard
          title="۲. اتصال دو پرینتر صندوق"
          subtitle="لیبل‌زن بارکد ۱۵۰۰+ و فیش‌زن ۸ سانتی"
          icon={Printer}
          accent={HIDDIFY_SERIES.online}
        >
          <ol style={{ color: 'var(--p-text-muted-color)' }} className="list-decimal pr-4 space-y-2 text-xs leading-relaxed">
            <li>پرینتر لیبل‌زن به صورت خودکار سریال‌های بارکد Code-128 را از عدد <strong>۱۵۰۰</strong> به بالا چاپ می‌کند (سایز پیش‌فرض ۵۰×۳۰ میلی‌متر).</li>
            <li>پرینتر حرارتی دوم فیش رسمی مشتری را در عرض استاندارد <strong>۸۰ میلی‌متر (۸ سانت)</strong> با جزئیات باتری نو، کسر داغی و نام بانک کارتخوان چاپ می‌کند.</li>
          </ol>
        </DashCard>

        <DashCard
          title="۳. ثبت خودکار در سپیدار (.EXE)"
          subtitle="بدون نیاز به وب‌سرویس یا ورود دستی CSV"
          icon={MonitorSmartphone}
          accent={HIDDIFY_SERIES.usageAvg}
        >
          <ol style={{ color: 'var(--p-text-muted-color)' }} className="list-decimal pr-4 space-y-2 text-xs leading-relaxed">
            <li>وارد پوشه <code className="font-mono text-blue-600">sepidar-windows-bot</code> شوید و <code className="font-mono">start-sepidar-bot.bat</code> را اجرا کنید.</li>
            <li>برنامه بومی <code className="font-mono text-emerald-600">KavehSepidarBot.exe</code> ساخته و باز می‌شود.</li>
            <li>پس از یک‌بار کالیبراسیون ۱ دقیقه‌ای، با تایید هر سند توسط مدیر مالی، ربات خودکار فاکتور را در پنجره سپیدار ثبت و ذخیره می‌نماید.</li>
          </ol>
        </DashCard>
      </div>
    </div>
  );
}
