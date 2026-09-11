# بیلد، امضا و انتشار اپ مانوش 🤖

## ۱. اجرای سریع با Android Studio

1. آخرین نسخه **Android Studio** (Ladybug یا جدیدتر) را نصب کنید.
2. `File ← Open` و انتخاب پوشه همین ریپو. صبر کنید Sync تمام شود (اولین‌بار چند دقیقه طول می‌کشد).
3. فایل `local.properties.example` را کپی کنید به `local.properties` (اگر آدرس سایت عوض شد، همان‌جا عوض کنید).
4. یک Emulator بسازید (Pixel + API 34) یا گوشی واقعی را با USB وصل کنید.
5. دکمه ▶ Run — اپ با نام **مانوش** نصب و اجرا می‌شود.

> نیازی به Firebase، کلید ووکامرس یا تنظیمات اضافه نیست. فقط اینترنت لازم است.

## ۲. گرفتن فایل نصب (APK) بدون Android Studio — با گیت‌هاب

هر بار که روی هر برنچ **push** کنید، ورک‌فلو «Android build» به‌صورت خودکار اجرا می‌شود:

1. به تب **Actions** ریپو در گیت‌هاب بروید.
2. آخرین اجرای موفق `Build debug APK` را باز کنید.
3. از بخش **Artifacts** فایل `manoosh-debug-apk` را دانلود کنید (ZIP شامل APK).
4. APK را به گوشی منتقل و نصب کنید (نصب از منبع ناشناس را تایید کنید).

این APK برای **تست** عالی است. برای انتشار در کافه‌بازار/گوگل‌پلی باید نسخه Release امضاشده بسازید (مرحله ۳).

## ۳. ساخت نسخه انتشار (Release)

### ۳.۱. ساخت کی‌استور (فقط یک‌بار)

```bash
keytool -genkeypair -v -keystore manoosh.keystore \
  -alias manoosh -keyalg RSA -keysize 2048 -validity 10000
```

از این فایل و رمزهایش **مثل طلا** نگهداری کنید (گم شود = دیگر نمی‌توانید اپ را آپدیت کنید).
آن را هرگز داخل گیت commit نکنید.

### ۳.۲. بیلد محلی Release

```bash
export KEYSTORE_PATH=/path/to/manoosh.keystore
export KEYSTORE_PASSWORD='***'
export KEY_ALIAS=manoosh
export KEY_PASSWORD='***'
./gradlew :app:assembleRelease :app:bundleRelease
```

خروجی‌ها:

- `app/build/outputs/apk/release/app-release.apk` ← نصب مستقیم / کافه‌بازار / مایکت
- `app/build/outputs/bundle/release/app-release.aab` ← گوگل‌پلی (فقط AAB قبول می‌کند)

### ۳.۳. بیلد Release خودکار با تگ گیت

1. در گیت‌هاب: **Settings ← Secrets ← Actions** چهار سکرت بسازید:
   - `KEYSTORE_BASE64`: خروجی `base64 -w0 manoosh.keystore`
   - `KEYSTORE_PASSWORD` ،`KEY_ALIAS` ،`KEY_PASSWORD`
2. تگ بزنید و push کنید:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. ورک‌فلو نسخه Release را می‌سازد و در صفحه **Releases** گیت‌هاب منتشر می‌کند (هم AAB هم APK).

## ۴. انتشار در استورها

### کافه‌بازار / مایکت (پیشنهاد اول برای ایران)
- فایل **APK امضاشده** را بارگذاری کنید.
- نام بسته: `com.manoosh.app` — در همه نسخه‌ها ثابت می‌ماند.
- آیکون ۵۱۲، اسکرین‌شات گوشی (حداقل ۲ عدد) و توضیح فارسی آماده کنید.
- دسترسی‌های اپ فقط اینترنت است؛ در فرم حریم خصوصی «عدم جمع‌آوری داده حساس» را اعلام کنید (شماره موبایل فقط برای ورود/سفارش استفاده می‌شود).

### گوگل‌پلی
- فایل **AAB امضاشده** را در Play Console ← Production بارگذاری کنید.
- فرم Data Safety: شماره تلفن (Account management)، نام و آدرس (Order processing) — ذخیره روی سرور خودتان (سایت).
- چون پرداخت داخل اپ با **درگاه ایرانی و کالای فیزیکی** است، نیازی به Google Play Billing نیست (فقط کالای دیجیتال اجباری است).

### افزایش نسخه
در `app/build.gradle.kts`:

```kotlin
versionCode = 2      // هر انتشار +1 (عدد صحیح)
versionName = "1.1.0"
```

## ۵. تغییر آدرس سایت / شخصی‌سازی

| تغییر | کجا |
|---|---|
| آدرس سایت | `local.properties` ← `manoosh.baseUrl` (بدون اسلش آخر) |
| رنگ‌ها | `core/ui/theme/Color.kt` |
| فونت وزیرمتن | فایل TTF در `res/font/` + تغییر `AppFontFamily` در `Type.kt` (توضیح داخل فایل هست) |
| شماره‌ها و لینک‌ها | `core/common/Constants.kt` |
| بنرها | پنل وردپرس ← اپ مانوش (بدون نیاز به آپدیت اپ!) |

## ۶. عیب‌یابی بیلد

| خطا | راه‌حل |
|---|---|
| `gradle-wrapper.jar` یافت نشد | یک‌بار Gradle نسخه ۸ را جدا نصب کنید و داخل پوشه پروژه `gradle wrapper` را اجرا کنید تا فایل ساخته شود (بیلد گیت‌هاب به این فایل نیازی ندارد) |
| `SDK location not found` | `local.properties` باید `sdk.dir` داشته باشد (اندروید استودیو خودش می‌سازد) |
| خطای JDK | حتماً JDK 17 (در اندروید استودیو: Settings ← Build Tools ← Gradle ← Gradle JDK = 17) |
| بیلد CI قرمز است | لاگ جاب `debug-apk` را ببینید؛ معمولاً مشکل sync یا نسخه‌هاست |
| اپ بالا می‌آید ولی محصول نمی‌آورد | اینترنت/فیلترشکن را چک کنید؛ آدرس `manoosh.baseUrl` را چک کنید |
