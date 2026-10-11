<?php
/**
 * به‌روزرسان خودکار «بازیکا» 🦖
 * بار اول:  update.php            → ساخت کلید مخفی
 * بعد از آن: update.php?key=کلید   → نصب جدیدترین بسته (دادهٔ CMS دست‌نخورده)
 * بررسی:     update.php?key=کلید&check=1
 * cron:      php update.php CLIDKEY
 */
error_reporting(0);
header('Content-Type: text/html; charset=utf-8');
define('HERE', __DIR__);

$cfg = HERE . '/update-config.php';
if (!file_exists($cfg)) {
    $secret = bin2hex(random_bytes(8));
    $url = 'https://raw.githubusercontent.com/masoudshabani1992/masoud/arena/01a0bb37-masoud/dino-ar/dino-ar-web-ar.zip';
    file_put_contents($cfg, "<?php\n\$UPDATE_KEY = '$secret';\n\$UPDATE_URL = '$url';\n");
    exit(html("<b>به‌روزرسان بازیکا آماده است ✅</b><br>کلید شما: <code dir='ltr'>$secret</code><br>از این به بعد: <code dir='ltr'>update.php?key=$secret</code>"));
}
require $cfg;

$key = isset($_GET['key']) ? (string)$_GET['key'] : '';
if (!$key && isset($_SERVER['argv'][1])) $key = preg_replace('/^key=/', '', $_SERVER['argv'][1]);
if (!isset($UPDATE_KEY) || !hash_equals($UPDATE_KEY, $key)) exit(html('⛔ کلید نامعتبر است.'));

$local = json_decode((string)@file_get_contents(HERE . '/version.json'), true);
if (isset($_GET['check'])) {
    $remote = json_decode((string)@file_get_contents(str_replace('/dino-ar-web-ar.zip', '/version.json', $UPDATE_URL)), true);
    exit(html('نسخهٔ شما: <b>' . h($local ? $local['build'] : '؟') . '</b><br>نسخهٔ منتشرشده: <b>' . h($remote ? $remote['build'] : '؟') . '</b><br>' .
        (($remote && $local && $remote['build'] !== $local['build']) ? '🆕 آپدیت موجود است — بدون check بزنید.' : '✅ به‌روز هستید.')));
}

$data = false;
if (function_exists('curl_init')) {
    $ch = curl_init($UPDATE_URL);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_FOLLOWLOCATION => 1, CURLOPT_TIMEOUT => 180]);
    $data = curl_exec($ch);
    curl_close($ch);
}
if (!$data && ini_get('allow_url_fopen')) $data = @file_get_contents($UPDATE_URL);
if (!$data || strlen($data) < 10000) exit(html('❌ دانلود بسته ممکن نشد.'));

$tmp = tempnam(sys_get_temp_dir(), 'bazika');
file_put_contents($tmp, $data);

$done = false; $msg = '';
if (class_exists('ZipArchive')) {
    $zip = new ZipArchive();
    if ($zip->open($tmp) === true) {
        $cfgBackup = file_get_contents($cfg);
        $done = true;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (strpos($name, 'data/') === 0) continue;   // دادهٔ CMS هرگز بازنویسی نشود
            if (substr($name, -1) === '/') { @mkdir(HERE . '/' . $name, 0777, true); continue; }
            $dest = HERE . '/' . $name;
            @mkdir(dirname($dest), 0777, true);
            if (file_put_contents($dest, $zip->getFromIndex($i)) === false) $done = false;
        }
        $zip->close();
        file_put_contents($cfg, $cfgBackup);
        $msg = 'ZipArchive';
    }
}
if (!$done) {
    @exec('unzip -oq ' . escapeshellarg($tmp) . ' -d ' . escapeshellarg(HERE) . ' 2>&1', $o, $rc);
    if ($rc === 0) { $done = true; $msg = 'unzip'; }
}
@unlink($tmp);

/* حذف فایل‌های قدیمی نسخه‌های قبل (که جایگزین امن شده‌اند) */
foreach (['index.html', 'ar/index.html', 'ar/viewer.html'] as $legacy) {
    if (is_file(HERE . '/' . $legacy)) @unlink(HERE . '/' . $legacy);
}

$new = json_decode((string)@file_get_contents(HERE . '/version.json'), true);
exit(html($done ? ('✅ به‌روزرسانی انجام شد (' . $msg . ')<br>نسخهٔ جدید: <b>' . h($new ? $new['build'] : '؟') . '</b>') : '❌ بازکردن زیپ ممکن نشد.'));

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function html($body) {
    return '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>به‌روزرسان بازیکا</title><style>body{font-family:Tahoma,sans-serif;background:#f6f1e6;color:#101418;display:flex;align-items:center;justify-content:center;min-height:90vh;margin:0}div{background:#fffdf7;border:1px solid #e5dcc8;border-radius:16px;padding:26px 30px;max-width:560px;line-height:2}code{background:#eee5d2;border-radius:6px;padding:2px 8px}</style></head><body><div>' . $body . '</div></body></html>';
}
