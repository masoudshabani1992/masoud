<?php
/**
 * بازیکا — CMS اختصاصی استندهای ماهانه 🦖
 * یک فایل PHP، بدون دیتابیس؛ داده‌ها در data/stands
 * ورود:  your-domain/admin.php
 */
require __DIR__ . '/bz_guard.php';
bz_session_secure();
session_start();
header('Content-Type: text/html; charset=utf-8');
bz_headers();
bz_guard();   // قفل دامنه — پنل فقط روی دامنهٔ لایسنس‌دار
define('ROOT', __DIR__);
define('DATA', ROOT . '/data');
define('STANDS', DATA . '/stands');
@mkdir(STANDS, 0777, true);

function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function csrf_tok() { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16)); return $_SESSION['csrf']; }
function csrf_ok() { return isset($_POST['csrf']) && hash_equals(csrf_tok(), (string)$_POST['csrf']); }
function csrf_field() { return '<input type="hidden" name="csrf" value="' . csrf_tok() . '">'; }
function jread($f, $d = null) { $c = @file_get_contents($f); return $c ? json_decode($c, true) : $d; }
function jwrite($f, $v) { file_put_contents($f, json_encode($v, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)); }

$ADMIN = DATA . '/admin.json';

/* ── نصب اولیه: تعیین رمز مدیریت ── */
if (!file_exists($ADMIN)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['newpass'])) {
        if (!csrf_ok()) { header('Location: admin.php'); exit; }
        jwrite($ADMIN, ['hash' => password_hash($_POST['newpass'], PASSWORD_DEFAULT)]);
        header('Location: admin.php'); exit;
    }
    die(page('نصب بازیکا CMS', '<h2>🔐 نصب اولیه</h2><p>برای بخش مدیریت رمز عبور تعیین کنید:</p>
      <form method="post"><input type="password" name="newpass" required placeholder="رمز عبور مدیریت" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ccc">' . csrf_field() . '
      <button class="btn">ذخیره و ورود</button></form>'));
}

$cfg = jread($ADMIN, []);
if (isset($_GET['logout'])) { session_destroy(); header('Location: admin.php'); exit; }
/* آهسته‌سازی بروت‌فورس: حداکثر ۵ تلاش، بعد ۱۰ دقیقه قفل */
$GUARD = DATA . '/login-guard.json';
$g = jread($GUARD, ['n' => 0, 'until' => 0]);
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if (time() < ($g['until'] ?? 0)) {
        $loginErr = 'تلاش بیش از حد مجاز — چند دقیقه بعد دوباره امتحان کنید';
    } elseif (password_verify((string)$_POST['pass'], $cfg['hash'])) {
        $_SESSION['ok'] = 1;
        jwrite($GUARD, ['n' => 0, 'until' => 0]);
    } else {
        $g['n'] = (int)($g['n'] ?? 0) + 1;
        if ($g['n'] >= 5) { $g['until'] = time() + 600; $g['n'] = 0; $loginErr = 'تلاش بیش از حد مجاز — ۱۰ دقیقه قفل شد'; }
        else $loginErr = 'رمز نادرست است';
        jwrite($GUARD, $g);
    }
}
if (empty($_SESSION['ok'])) {
    die(page('ورود | بازیکا CMS', '<h2>🔐 ورود به مدیریت</h2>' .
      (isset($loginErr) ? '<p class="err">' . h($loginErr) . '</p>' : '') .
      '<form method="post"><input type="password" name="pass" required placeholder="رمز عبور" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ccc">' . csrf_field() . '
       <input type="hidden" name="login" value="1"><button class="btn">ورود</button></form>'));
}

/* ── کمکی آپلود ── */
function save_upload($key, $dir) {
    if (!isset($_FILES[$key]) || $_FILES[$key]['error'] !== 0) return null;
    @mkdir($dir, 0777, true);
    $name = preg_replace('/[^A-Za-z0-9._-]+/', '-', basename($_FILES[$key]['name']));
    move_uploaded_file($_FILES[$key]['tmp_name'], $dir . '/' . $name);
    return $name;
}

/* ── حذف استند ── */
if (isset($_GET['delete'])) {
    if (!isset($_GET['tok']) || !hash_equals(csrf_tok(), (string)$_GET['tok'])) { header('Location: admin.php'); exit; }
    $id = preg_replace('/[^a-z0-9-]/', '-', (string)$_GET['delete']);
    $idx = jread(STANDS . '/index.json', ['stands' => []]);
    $idx['stands'] = array_values(array_filter($idx['stands'], function ($s) use ($id) { return $s['id'] !== $id; }));
    jwrite(STANDS . '/index.json', $idx);
    @unlink(STANDS . '/' . $id . '.json');
    header('Location: admin.php'); exit;
}

/* ── ذخیرهٔ استند ── */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save'])) {
    if (!csrf_ok()) { header('Location: admin.php?edit=' . (string)($_POST['id'] ?? '') . '&err=csrf'); exit; }
    $title = trim((string)$_POST['title']);
    $id = preg_replace('/[^a-z0-9-]+/', '-', strtolower(trim((string)$_POST['id']))) ?: ('stand-' . time());
    $media = STANDS . '/' . $id . '/media';
    @mkdir($media, 0777, true);

    $old = jread(STANDS . '/' . $id . '.json', []);
    $refJson = (string)($_POST['ref_json'] ?? '');
    $refData = $refJson !== '' ? json_decode($refJson, true) : null;

    $st = [
        'id' => $id,
        'title' => $title,
        'month' => trim((string)$_POST['month']),
        'background' => (string)($_POST['background'] ?: ($old['background'] ?? '')),
        'narration' => (string)($_POST['narration'] ?: ($old['narration'] ?? '')),
        'aboutText' => (string)$_POST['aboutText'],
        'bounds' => [
            'x' => (float)($_POST['bx'] ?: 1.15),
            'zMin' => (float)($_POST['bzmin'] ?: 0.1),
            'zMax' => (float)($_POST['bzmax'] ?: 1.5),
        ],
        'characters' => [],
    ];

    // آپلودهای سراسری
    $bg = save_upload('f_background', $media);
    if ($bg) $st['background'] = '../data/stands/' . $id . '/media/' . $bg;
    $nar = save_upload('f_narration', $media);
    if ($nar) $st['narration'] = '../data/stands/' . $id . '/media/' . $nar;

    // شخصیت‌ها
    $n = (int)$_POST['charCount'];
    for ($i = 0; $i < $n; $i++) {
        $nm = trim((string)$_POST['c_name'][$i]);
        if ($nm === '') continue;
        $img = (string)$_POST['c_image'][$i];
        $iu = save_upload('c_imageup_' . $i, $media);
        if ($iu) $img = '../data/stands/' . $id . '/media/' . $iu;
        $roar = (string)$_POST['c_roar'][$i];
        $ru = save_upload('c_roarup_' . $i, $media);
        if ($ru) $roar = '../data/stands/' . $id . '/media/' . $ru;
        $st['characters'][] = [
            'id' => preg_replace('/[^a-z0-9-]+/', '-', strtolower($nm)) ?: ('char-' . $i),
            'name' => $nm,
            'left' => (float)$_POST['c_left'][$i],
            'top' => (float)$_POST['c_top'][$i],
            'width' => (float)($_POST['c_width'][$i] ?: 50),
            'z' => (int)$_POST['c_z'][$i],
            'anim' => (string)$_POST['c_anim'][$i],
            'dur' => (float)($_POST['c_dur'][$i] ?: 3),
            'image' => $img,
            'roar' => $roar,
            'meaning' => (string)$_POST['c_meaning'][$i],
            'era' => (string)$_POST['c_era'][$i],
            'region' => (string)$_POST['c_region'][$i],
            'diet' => (string)$_POST['c_diet'][$i],
            'size' => (string)$_POST['c_size'][$i],
            'desc' => (string)$_POST['c_desc'][$i],
        ];
    }

    if (is_array($refData) && !empty($refData['levels'])) $st['ref'] = $refData;
    jwrite(STANDS . '/' . $id . '.json', $st);
    $idx = jread(STANDS . '/index.json', ['stands' => []]);
    $found = false;
    foreach ($idx['stands'] as &$s) { if ($s['id'] === $id) { $s = ['id' => $id, 'title' => $title, 'month' => $st['month']]; $found = true; } }
    if (!$found) $idx['stands'][] = ['id' => $id, 'title' => $title, 'month' => $st['month']];
    jwrite(STANDS . '/index.json', $idx);
    header('Location: admin.php?edit=' . $id . '&saved=1'); exit;
}

/* ── ذخیرهٔ لایسنس/قفل دامنه ── */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_license'])) {
    if (!csrf_ok()) { header('Location: admin.php'); exit; }
    $lines = preg_split('/[\r\n,،]+/', (string)($_POST['lic_domains'] ?? ''));
    $doms = [];
    foreach ($lines as $l) {
        $l = strtolower(trim($l));
        $l = preg_replace('#^https?://#', '', $l);
        $l = preg_replace('#/.*$#', '', $l);
        if ($l !== '') $doms[] = $l;
    }
    jwrite(DATA . '/license.json', ['lock' => !empty($_POST['lic_lock']), 'domains' => array_values(array_unique($doms))]);
    header('Location: admin.php?lic=1'); exit;
}

/* ── مدل‌های موجود ── */
$models = [];
foreach (glob(ROOT . '/models/*.glb') as $m) $models[] = '../models/' . basename($m);

$idx = jread(STANDS . '/index.json', ['stands' => []]);

/* ── صفحهٔ ویرایش/ساخت ── */
if (isset($_GET['edit'])) {
    $id = preg_replace('/[^a-z0-9-]/', '-', (string)$_GET['edit']);
    $st = jread(STANDS . '/' . $id . '.json', ['id' => $id, 'title' => '', 'month' => '', 'characters' => []]);
    if ($id === 'new') $st = ['id' => '', 'title' => '', 'month' => '', 'characters' => []];
    $chars = $st['characters'] ?: [];
    // دو اسلات خالی اضافه
    $chars[] = []; $chars[] = [];
    $body = '<p><a href="admin.php">→ فهرست استندها</a></p>'
        . (isset($_GET['saved']) ? '<p class="ok">✅ ذخیره شد</p>' : '')
        . '<h2>✏️ ویرایش استند</h2><form method="post" enctype="multipart/form-data">'
        . '<label>شناسه (انگلیسی، مثل dino)</label><input name="id" value="' . h($st['id']) . '" ' . ($st['id'] ? 'readonly' : '') . '>'
        . '<label>عنوان</label><input name="title" required value="' . h($st['title']) . '">'
        . '<label>برچسب ماه (مثلاً شمارهٔ ۰۲)</label><input name="month" value="' . h($st['month']) . '">'
        . '<label>تصویر پس‌زمینهٔ داخل استند</label>'
        . ($st['background'] ? '<p class="dim">فعلی: ' . h($st['background']) . '</p>' : '')
        . '<input type="hidden" name="background" value="' . h($st['background']) . '"><input type="file" name="f_background" accept="image/*">'
        . '<label>صدای راوی</label>'
        . ($st['narration'] ? '<p class="dim">فعلی: ' . h($st['narration']) . '</p>' : '')
        . '<input type="hidden" name="narration" value="' . h($st['narration']) . '"><input type="file" name="f_narration" accept="audio/*">'
        . '<label>متن دکمهٔ ℹ (اطلاعات)</label><textarea name="aboutText" rows="8">' . h($st['aboutText'] ?? '') . '</textarea>'
        . '<h3>🦖 شخصیت‌ها (داخل استند)</h3>'
        . '<p class="dim">محدودهٔ حرکت: X ±<input name="bx" style="width:60px" value="' . h($st['bounds']['x'] ?? 1.15) . '"> Z از <input name="bzmin" style="width:60px" value="' . h($st['bounds']['zMin'] ?? 0.1) . '"> تا <input name="bzmax" style="width:60px" value="' . h($st['bounds']['zMax'] ?? 1.5) . '"></p>';
    foreach ($chars as $i => $c) {
        $body .= '<fieldset><legend>شخصیت ' . ($i + 1) . '</legend>'
            . '<label>نام</label><input name="c_name[' . $i . ']" value="' . h($c['name'] ?? '') . '">'
            . '<label>عکس برش شفاف شخصیت (PNG/WebP بدون پس‌زمینه)</label>' . ($c['image'] ?? '' ? '<p class="dim">فعلی: ' . h($c['image']) . '</p>' : '')
            . '<input type="hidden" name="c_image[' . $i . ']" value="' . h($c['image'] ?? '') . '"><input type="file" name="c_imageup_' . $i . '" accept="image/*">'
            . '<label>صدا (غرش)</label>' . ($c['roar'] ?? '' ? '<p class="dim">فعلی: ' . h($c['roar']) . '</p>' : '')
            . '<input type="hidden" name="c_roar[' . $i . ']" value="' . h($c['roar'] ?? '') . '"><input type="file" name="c_roarup_' . $i . '" accept="audio/*">'
            . '<label>معنای نام</label><input name="c_meaning[' . $i . ']" value="' . h($c['meaning'] ?? '') . '">'
            . '<label>دورهٔ زیست</label><input name="c_era[' . $i . ']" value="' . h($c['era'] ?? '') . '">'
            . '<label>موقعیت</label><input name="c_region[' . $i . ']" value="' . h($c['region'] ?? '') . '">'
            . '<label>تغذیه</label><input name="c_diet[' . $i . ']" value="' . h($c['diet'] ?? '') . '">'
            . '<label>جثه</label><input name="c_size[' . $i . ']" value="' . h($c['size'] ?? '') . '">'
            . '<label>توضیح قصه‌ای</label><textarea name="c_desc[' . $i . ']" rows="3">' . h($c['desc'] ?? '') . '</textarea>'
            . '<label>جای لایه: چپ٪ / بالا٪ / پهنا٪ / ترتیب(z)</label><div class="row"><input name="c_left[' . $i . ']" value="' . h($c['left'] ?? 10) . '"><input name="c_top[' . $i . ']" value="' . h($c['top'] ?? 10) . '"><input name="c_width[' . $i . ']" value="' . h($c['width'] ?? 50) . '"><input name="c_z[' . $i . ']" value="' . h($c['z'] ?? 1) . '"></div>'
            . '<label>نوع حرکت</label><select name="c_anim[' . $i . ']">'
            . '<option value="bob" ' . ((($c['anim'] ?? '') === 'bob') ? 'selected' : '') . '>بالا‌پایین (bob)</option>'
            . '<option value="sway" ' . ((($c['anim'] ?? '') === 'sway') ? 'selected' : '') . '>گهواره‌ای (sway)</option>'
            . '<option value="walk" ' . ((($c['anim'] ?? '') === 'walk') ? 'selected' : '') . '>قدم‌زدن (walk)</option></select>'
            . '<label>سرعت حرکت (ثانیه)</label><input name="c_dur[' . $i . ']" value="' . h($c['dur'] ?? 3) . '">'
            . '</fieldset>';
    }
    $body .= '<input type="hidden" name="charCount" value="' . count($chars) . '"><input type="hidden" name="save" value="1"><input type="hidden" name="ref_json" id="ref_json">' . csrf_field()
        . '<button class="btn" id="btnSave">💾 ذخیرهٔ استند</button> <span id="refStat" class="dim"></span></form>';
    die(page('ویرایش استند | بازیکا CMS', $body));
}

/* ── فهرست ── */
$body = '<h2>🗂️ استندهای منتشرشده</h2><p><a class="btn" href="admin.php?edit=new">＋ استند جدید (ماه بعد)</a> <a href="admin.php?logout=1">خروج</a></p>';
foreach ($idx['stands'] as $s) {
    $body .= '<div class="card"><b>' . h($s['title']) . '</b> <span class="dim">' . h($s['month']) . '</span><br>'
        . '<a class="btn" href="admin.php?edit=' . h($s['id']) . '">✏️ ویرایش</a> '
        . '<a class="btn ghost" href="ar/?stand=' . h($s['id']) . '" target="_blank">👁 پیش‌نمایش</a> '
        . '<a class="btn danger" href="admin.php?delete=' . h($s['id']) . '&tok=' . csrf_tok() . '" onclick="return confirm(\'حذف شود؟\')"> حذف</a></div>';
}
// کارت امنیت و قفل دامنه
$lic = bz_license();
$licDomains = implode("\n", $lic['domains']);
$body .= '<div class="card"><h3>🔒 امنیت و لایسنس (ضد کپی)</h3>'
    . (isset($_GET['lic']) ? '<p class="ok">✅ تنظیمات لایسنس ذخیره شد</p>' : '')
    . '<form method="post"><label>دامنه‌های مجاز (هر خط یک دامنه — مثال: example.com یا *.example.com)</label>'
    . '<textarea name="lic_domains" rows="3" placeholder="example.com">' . h($licDomains) . '</textarea>'
    . '<label style="font-weight:normal;margin-top:8px"><input type="checkbox" name="lic_lock" style="width:auto" ' . ($lic['lock'] ? 'checked' : '') . '> قفل دامنه فعال شود (سایت فقط روی دامنه‌های بالا اجرا می‌شود)</label><br>'
    . csrf_field() . '<input type="hidden" name="save_license" value="1"><button class="btn">💾 ذخیرهٔ لایسنس</button></form>'
    . '<p class="dim">' . ($lic['lock'] && $lic['domains'] ? '🟢 قفل فعال است — کپی این بسته روی دامنهٔ دیگر کار نخواهد کرد.' : '🟡 قفل غیرفعال است. برای جلوگیری از کپی‌برداری، دامنه‌های خود را ثبت و قفل را فعال کنید.') . ' تست روی localhost همیشه مجاز است.</p></div>';

// کارت به‌روزرسانی داخل پنل
$upKey = '';
if (file_exists(ROOT . '/update-config.php')) {
    require ROOT . '/update-config.php';
    $upKey = isset($UPDATE_KEY) ? $UPDATE_KEY : '';
}
$body .= '<div class="card"><h3>🔄 به‌روزرسانی نسخه</h3>' . ($upKey
    ? '<a class="btn" href="update.php?key=' . h($upKey) . '" target="_blank">⬆ نصب آخرین نسخه</a> <a class="btn ghost" href="update.php?key=' . h($upKey) . '&check=1" target="_blank">بررسی نسخه</a><p class="dim">استندها و رسانه‌های شما (پوشهٔ data/) هنگام آپدیت دست‌نخورده می‌مانند.</p>'
    : '<p class="dim">یک بار <code>update.php</code> را باز کنید تا کلید ساخته شود؛ بعد این دکمه‌ها فعال می‌شوند.</p>') . '</div>';
echo page('بازیکا CMS', $body);

/* ── قالب ── */
function page($title, $body) {
    return '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . h($title) . '</title>
<style>
body{font-family:Tahoma,Vazirmatn,sans-serif;background:#f4efe4;color:#17202b;margin:0;padding:18px;line-height:1.9}
h2{margin:6px 0 14px} h3{margin:18px 0 6px}
.wrap{max-width:860px;margin:auto}
label{display:block;margin:10px 0 2px;font-size:13px;font-weight:bold}
input,select,textarea{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #cbb98f;border-radius:10px;background:#fffdf7;font-family:inherit}
.row{display:flex;gap:8px}
fieldset{border:1px dashed #b7a06b;border-radius:14px;margin:14px 0;padding:12px;background:#fbf7ee}
.btn{display:inline-block;margin:8px 4px 0 0;padding:9px 18px;border:0;border-radius:10px;background:#1e7a46;color:#fff;text-decoration:none;cursor:pointer;font-family:inherit}
.btn.ghost{background:#fff;color:#1e7a46;border:2px solid #1e7a46}
.btn.danger{background:#b3261e}
.card{background:#fffdf7;border:1px solid #e2d7bd;border-radius:14px;padding:12px 14px;margin:10px 0}
.dim{opacity:.65;font-size:12px}
.err{color:#b3261e}.ok{color:#1e7a46}
a{color:#1e7a46}
</style></head><body><div class="wrap"><h1>🦖 بازیکا CMS</h1>' . $body . '</div>
<script src="ar/feat.js?v=2"></script>
<script src="ar/admin-ref.js?v=2"></script>
</body></html>';
}
