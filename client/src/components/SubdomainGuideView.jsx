import React, { useState } from 'react';
import {
  Globe,
  Server,
  Terminal,
  Copy,
  Check,
  Shield,
  Layers,
  FileCode,
  FolderTree,
  ExternalLink,
  Cpu
} from 'lucide-react';

export default function SubdomainGuideView() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const nginxConfig = `server {
    listen 80;
    server_name order.yourboxfactory.com; # نام ساب‌دامین اختصاصی شما

    # هدایت خودکار به HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name order.yourboxfactory.com;

    # گواهی SSL رایگان Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/order.yourboxfactory.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/order.yourboxfactory.com/privkey.pem;

    # بهینه‌سازی پروکسی برای پورت سامانه
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M; # حداکثر حجم مجاز آپلود فایل‌های طراحی
    }
}`;

  const dockerCompose = `version: '3.8'

services:
  box-factory-app:
    build: .
    container_name: box_factory_erp
    restart: always
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - JWT_SECRET=boxfactory-super-secret-key-1403
      - NODE_ENV=production
    volumes:
      - ./server/factory.db:/app/server/factory.db
      - ./server/uploads:/app/server/uploads
`;

  const pm2Command = `# ۱. نصب پکیج‌ها و بیلد فرانت‌اند
npm run build

# ۲. اجرای همیشگی با PM2 روی سرور
pm2 start server/index.js --name "box-factory"

# ۳. فعال‌سازی استارت خودکار هنگام ریبوت سرور
pm2 save
pm2 startup`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>راهنمای جامع راه‌اندازی و استقرار روی ساب‌دامین</span>
              <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                order.yourcompany.com
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              راهنمای گام به گام نصب روی هاست cPanel، سرور مجازی (Ubuntu VPS)، داکر و کانفیگ وب‌سرور Nginx
            </p>
          </div>
        </div>
      </div>

      {/* 4-Step Visual Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center">
            ۱
          </div>
          <h3 className="font-bold text-xs text-slate-800">تنظیم DNS ساب‌دامین</h3>
          <p className="text-[11px] text-slate-500">
            در کلودفلر یا پنل دامنه، یک رکورد <strong>A Record</strong> با نام ساب‌دامین (مانند <code>order</code>) به IP سرور متصل کنید.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
            ۲
          </div>
          <h3 className="font-bold text-xs text-slate-800">انتقال فایل‌ها به سرور</h3>
          <p className="text-[11px] text-slate-500">
            فایل‌های پروژه را از طریق Git یا FTP داخل سرور در مسیر دلخواه (مانند <code>/var/www/box-factory</code>) قرار دهید.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center">
            ۳
          </div>
          <h3 className="font-bold text-xs text-slate-800">اجرای اسکریپت با PM2</h3>
          <p className="text-[11px] text-slate-500">
            دستور <code>npm install</code> و <code>npm run build</code> را اجرا کرده و با <strong>PM2</strong> سرویس را روشن کنید.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 font-black text-sm flex items-center justify-center">
            ۴
          </div>
          <h3 className="font-bold text-xs text-slate-800">فعال‌سازی Nginx و SSL</h3>
          <p className="text-[11px] text-slate-500">
            کانفیگ Nginx را کپی کرده و با دستور <code>certbot</code> گواهی امنیتی SSL رایگان را فعال فرمایید.
          </p>
        </div>
      </div>

      {/* Configuration Code Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Nginx Config Block */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-3 font-mono text-xs border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-amber-400 font-sans">
              <FileCode className="w-4 h-4" />
              <span>فایل کانفیگ Nginx ساب‌دامین (/etc/nginx/sites-available/order)</span>
            </span>
            <button
              onClick={() => copyToClipboard(nginxConfig, 'nginx')}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md"
            >
              {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'nginx' ? 'کپی شد!' : 'کپی کانفیگ'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto text-slate-300 text-[11px] leading-relaxed p-2 bg-slate-950 rounded-xl">
            {nginxConfig}
          </pre>
        </div>

        {/* PM2 & Fast Startup Commands */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-3 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-cyan-400 font-sans">
                <Terminal className="w-4 h-4" />
                <span>دستورات راه‌اندازی با PM2 در لینوکس / VPS</span>
              </span>
              <button
                onClick={() => copyToClipboard(pm2Command, 'pm2')}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md"
              >
                {copiedKey === 'pm2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'pm2' ? 'کپی شد!' : 'کپی دستورات'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto text-cyan-300 text-[11px] leading-relaxed p-2 bg-slate-950 rounded-xl">
              {pm2Command}
            </pre>
          </div>

          {/* cPanel / DirectAdmin Note */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>نحوه استقرار در هاست اشتراکی cPanel / DirectAdmin:</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>وارد بخش <strong>Setup Node.js App</strong> در کنترل پنل خود شوید.</li>
              <li>ورژن Node.js را روی <strong>18 یا بالاتر</strong> قرار دهید.</li>
              <li>مسیر Application Root را به پوشه ساب‌دامین اختصاص دهید.</li>
              <li>فایل استارت آپ (Application Startup File) را <code>server/index.js</code> تنظیم نمایید.</li>
              <li>دکمه <strong>Run NPM Install</strong> و سپس <strong>Restart</strong> را بزنید.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
