<?php
/**
 * بازیکا — دروازهٔ داده 🔒
 * استندها فقط با «نشست معتبر + توکن» برگردانده می‌شوند.
 * هیچ فایل JSON مستقیمی از بیرون قابل دانلود نیست.
 */
require __DIR__ . '/../bz_guard.php';
bz_session_secure();
session_start();
bz_headers();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
bz_guard();                                     // قفل دامنه

/* توکن باید با نشست یکسان باشد */
$tok = (string)($_GET['t'] ?? '');
if (!hash_equals(bz_token(), $tok)) {
    http_response_code(403);
    exit(json_encode(['error' => 'forbidden'], JSON_UNESCAPED_UNICODE));
}

function bz_json_out($v) {
    echo json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$base = __DIR__ . '/../data/stands';
$x = (string)($_GET['x'] ?? 'index');

if ($x === 'index') {
    $c = @file_get_contents($base . '/index.json');
    bz_json_out($c ? json_decode($c, true) : ['stands' => []]);
}

if ($x === 'stand') {
    $id = preg_replace('/[^a-z0-9-]/', '', (string)($_GET['id'] ?? ''));
    $f = $base . '/' . $id . '.json';
    if ($id === '' || !is_file($f)) { http_response_code(404); bz_json_out(['error' => 'notfound']); }
    $c = @file_get_contents($f);
    bz_json_out($c ? json_decode($c, true) : ['error' => 'empty']);
}

/* مرجع‌های تشخیص دوربین (برای همهٔ استندها) */
if ($x === 'refs') {
    $out = [];
    foreach (glob($base . '/*.json') as $f) {
        if (basename($f) === 'index.json') continue;
        $st = json_decode((string)@file_get_contents($f), true);
        if ($st && !empty($st['ref'])) $out[] = ['id' => $st['id'], 'title' => $st['title'] ?? '', 'ref' => $st['ref']];
    }
    bz_json_out(['stands' => $out]);
}

http_response_code(400);
bz_json_out(['error' => 'badrequest']);
