<?php
/**
 * بازیکا — لایهٔ محافظ 🔒
 * قفل دامنه (لایسنس) + توکن نشست برای داده‌ها
 * لایسنس در data/license.json ذخیره می‌شود و آپدیت‌ها آن را پاک نمی‌کنند.
 */

/* خواندن تنظیم لایسنس */
function bz_license() {
    $f = __DIR__ . '/data/license.json';
    $c = @file_get_contents($f);
    $j = $c ? json_decode($c, true) : null;
    if (!is_array($j)) $j = [];
    $j['domains'] = isset($j['domains']) && is_array($j['domains']) ? array_values(array_filter(array_map('trim', $j['domains']))) : [];
    $j['lock'] = !empty($j['lock']);
    return $j;
}

/* آیا این دامنه مجاز است؟ */
function bz_license_ok() {
    $lic = bz_license();
    if (!$lic['lock'] || !$lic['domains']) return true;           // هنوز قفلی فعال نشده
    $host = strtolower(preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? '')));
    if ($host === '' ) return false;
    if (in_array($host, ['localhost', '127.0.0.1'], true)) return true;  // تست محلی مالک همیشه مجاز
    foreach ($lic['domains'] as $d) {
        $d = strtolower(trim($d));
        if ($d === '' ) continue;
        if ($host === $d) return true;
        if (substr($host, -strlen('.' . $d)) === '.' . $d) return true;   // زیردامنه‌ها مجاز
        if (substr($d, 0, 2) === '*.' && substr($host, -strlen(substr($d, 1))) === substr($d, 1)) return true;
    }
    return false;
}

/* صفحهٔ قفل برای دامنهٔ غیرمجاز */
function bz_die_locked() {
    http_response_code(403);
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    die('<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>غیرمجاز</title>' .
        '<style>body{font-family:Tahoma,sans-serif;background:#101418;color:#f6f1e6;display:flex;align-items:center;justify-content:center;min-height:90vh;margin:0}div{text-align:center;line-height:2.2;max-width:520px;padding:24px}</style>' .
        '</head><body><div><h1>🔒</h1><p>این نسخه از <b>بازیکا</b> برای دامنهٔ دیگری لایسنس شده است.</p>' .
        '<p style="opacity:.7;font-size:13px">© بازیکا — هرگونه کپی‌برداری و میزبانی غیرمجاز ممنوع است.</p></div></body></html>');
}

/* اعمال محافظ در ابتدای صفحه — اگر دامنه مجاز نیست متوقف شو */
function bz_guard() {
    if (!bz_license_ok()) bz_die_locked();
}

/* توکن نشست (ضد دسترسی مستقیم به داده‌ها) */
function bz_token() {
    if (empty($_SESSION['bz_t'])) $_SESSION['bz_t'] = bin2hex(random_bytes(16));
    return $_SESSION['bz_t'];
}

/* تنظیم کوکی نشست امن قبل از session_start */
function bz_session_secure() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
}

/* سرتیترهای امنیتی عمومی */
function bz_headers() {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    if (!headers_sent()) header('X-Frame-Options: SAMEORIGIN');
}
