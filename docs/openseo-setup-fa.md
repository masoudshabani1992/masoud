# راهنمای نصب و اتصال OpenSEO در این پروژه

**OpenSEO** یک ابزار سئو متن‌باز (جایگزین Semrush / Ahrefs) است که دو بخش دارد:

1. **MCP Server** — یک سرور MCP که به ایجنت‌های هوش مصنوعی (Claude Code، Cursor، Codex و…) اجازه می‌دهد از داده‌های سئو (کلمات کلیدی، SERP، بک‌لینک، سرچ کنسول و…) استفاده کنند.
2. **Agent Skills** — ۹ فایل `SKILL.md` که به ایجنت یاد می‌دهند هر گردش‌کار سئو را چطور انجام دهد.

> آدرس رسمی: [github.com/every-app/open-seo](https://github.com/every-app/open-seo) — مستندات: [openseo.so/docs](https://openseo.so/docs)

---

## چه چیزهایی همین حالا در این ریپو نصب شده است؟

| فایل/پوشه | کاربرد |
|---|---|
| `.mcp.json` | اتصال MCP در سطح پروژه — توسط **Claude Code** و **Codex CLI** خودکار خوانده می‌شود |
| `.cursor/mcp.json` | اتصال MCP در سطح پروژه — توسط **Cursor** خودکار خوانده می‌شود |
| `.claude/skills/*` | هر ۹ اسکیل OpenSEO برای Claude Code |
| `.cursor/skills/*` | هر ۹ اسکیل OpenSEO برای Cursor |

این یعنی وقتی این پروژه را با Claude Code یا Cursor باز کنید، OpenSEO از قبل آماده است؛ فقط کافی است یک بار لاگین OpenSEO را تأیید کنید (پایین را ببینید).

---

## گام ۱: ساخت حساب OpenSEO

به [openseo.so](https://openseo.so) بروید و ثبت‌نام کنید:

- استفاده از نسخه میزبانی‌شده با اشتراک **۱۰ دلار در ماه** ممکن است، یا
- **کلید API خودتان از DataForSEO** بیاورید و فقط به‌ازای مصرف، پول بدهید (بدون اشتراک).

برای محیط‌های headless یا CI هم می‌توانید در اپ OpenSEO به **Settings → API keys** بروید، یک کلید بسازید (با پیشوند `oseo_...`) و به‌جای لاگین OAuth از آن استفاده کنید.

## گام ۲: اتصال MCP

### Claude Code
چون `.mcp.json` در ریشه پروژه هست، فقط کافی است پروژه را باز کنید. بار اول از شما خواسته می‌شود لاگین OpenSEO را تأیید کنید.
اگر خواستید سرور را در سطح کاربر (همه پروژه‌ها) ثبت کنید:

```sh
claude mcp add --transport http --scope user openseo https://app.openseo.so/mcp
```

با API key (مثلاً برای سرور یا CI):

```sh
claude mcp add --transport http --scope user openseo https://app.openseo.so/mcp --header "Authorization: Bearer oseo_YOUR_KEY"
```

### Cursor
1. `Settings → Tools & Integrations → MCP Tools`
2. سرور `openseo` از `.cursor/mcp.json` این پروژه به‌صورت خودکار دیده می‌شود؛ اگر نه، دستی اضافه کنید:

```json
{
  "mcpServers": {
    "openseo": {
      "url": "https://app.openseo.so/mcp"
    }
  }
}
```

3. بار اول، لاگین OpenSEO را تأیید کنید.

### Codex CLI

```sh
codex mcp add openseo --url https://app.openseo.so/mcp
```

### کلاینت‌های دیگر
هر کلاینتی که از هدر سفارشی HTTP پشتیبانی کند، با `Authorization: Bearer oseo_YOUR_KEY` یا `x-api-key: oseo_YOUR_KEY` به آدرس `https://app.openseo.so/mcp` وصل می‌شود.

## گام ۳: استفاده از اسکیل‌ها

بعد از اتصال MCP، اسکیل‌های نصب‌شده را با این دستورات (در Claude Code) اجرا کنید:

| دستور | کار |
|---|---|
| `/seo-project-setup` | تنظیم اولیه پروژه سئو (اهداف، رقبا، صفحات کلیدی) — اول از این شروع کنید |
| `/seo-coach` | راهنمای انتخاب گردش‌کار مناسب اگر تازه‌کارید |
| `/keyword-research` | تحقیق کلمات کلیدی (حجم، سختی، CPC) |
| `/keyword-clustering` | گروه‌بندی کلمات کلیدی به خوشه برای صفحات |
| `/competitive-landscape` | نقشه بازار و رقبا |
| `/competitor-analysis` | تحلیل یک رقیب خاص |
| `/link-prospecting` | پیدا کردن فرصت لینک‌سازی |
| `/local-seo` | سئو محلی (Google Business Profile، گوگل‌مپ و…) |
| `/seo-audit` | ممیزی کامل سایت |

> نکته مهم: اسکیل‌ها فقط وقتی کار می‌کنند که MCP وصل شده باشد، چون داده‌ها را از OpenSEO می‌گیرند.

---

## یادداشت درباره این چت (Arena)

من در این چت یک ایجنت Arena هستم و ابزارهای من (جستجو، خواندن صفحات و…) توسط پلتفرم Arena مدیریت می‌شوند؛ یعنی نمی‌توانم از داخل چت، سرور MCP جدیدی به خودم وصل کنم. کاری که کردم این است که پروژه را **کاملاً آماده** کرده‌ام تا هر ایجنتی که این ریپو را باز کند (Claude Code، Cursor، Codex) بدون نصب اضافه به OpenSEO وصل شود.

ضمناً من همین حالا با ابزارهای وب خودم می‌توانم کارهای سئو انجام بدهم — مثلاً تحقیق کلمات کلیدی، بررسی رقبا یا تحلیل صفحات سایت شما. کافی است بگویید سایت یا حوزه‌تان چیست.

---

## (اختیاری) نصب کامل OpenSEO روی سرور خودتان

اگر می‌خواهید کل اپلیکیشن را خودتان میزبانی کنید (به‌جای نسخه میزبانی‌شده):

- **ساده با Docker:** طبق [`docs/SELF_HOSTING_DOCKER.md`](https://github.com/every-app/open-seo/blob/main/docs/SELF_HOSTING_DOCKER.md)
- **پیشنهادی با Cloudflare (رایگان):** طبق [`docs/SELF_HOSTING_CLOUDFLARE.md`](https://github.com/every-app/open-seo/blob/main/docs/SELF_HOSTING_CLOUDFLARE.md)

در هر دو حالت به یک کلید API از [DataForSEO](https://dataforseo.com) نیاز دارید.

## عیب‌یابی سریع

- اتصال برقرار نمی‌شود؟ آدرس باید دقیقاً `https://app.openseo.so/mcp` باشد.
- خطای OAuth در Codex؟ نسخه 0.147.0 یا جدیدتر لازم است، یا از API key استفاده کنید.
- ایجنت پروژه‌تان را پیدا نمی‌کند؟ از ایجنت بخواهید اول لیست پروژه‌های OpenSEO را بخواند و بعد ID پروژه را استفاده کند.
