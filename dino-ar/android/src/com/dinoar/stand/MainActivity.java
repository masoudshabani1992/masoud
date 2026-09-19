package com.dinoar.stand;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.InputStream;

/**
 * پوستهٔ اندروید تجربهٔ واقعیت افزودهٔ استند دایناسوری.
 * تمام صفحهٔ وب به‌صورت آفلاین از assets لود می‌شود و دوربین WebView
 * برای MindAR باز می‌شود.
 */
public class MainActivity extends Activity {

    private static final String BASE = "https://dino.app/";
    private static final int PERM_CAMERA = 77;
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setLoadWithOverviewMode(true);

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
        });

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (!url.startsWith(BASE)) {
                    return null;
                }
                String path = url.substring(BASE.length());
                int q = path.indexOf('?');
                if (q >= 0) {
                    path = path.substring(0, q);
                }
                if (path.length() == 0 || path.endsWith("/")) {
                    path = path + "index.html";
                }
                try {
                    InputStream in = getAssets().open(path);
                    return new WebResourceResponse(mime(path), "UTF-8", in);
                } catch (Exception e) {
                    return null;
                }
            }
        });

        ensureCameraAndLoad();
    }

    private void ensureCameraAndLoad() {
        if (Build.VERSION.SDK_INT >= 23) {
            if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[] { Manifest.permission.CAMERA }, PERM_CAMERA);
                return;
            }
        }
        web.loadUrl(BASE + "ar/");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        if (requestCode != PERM_CAMERA) {
            return;
        }
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
            web.loadUrl(BASE + "ar/");
        } else {
            new AlertDialog.Builder(this)
                .setTitle("دسترسی دوربین")
                .setMessage("برای واقعیت افزوده، اپ به دوربین نیاز دارد. از تنظیمات گوشی، دسترسی دوربین را به «استند دایناسوری» بدهید.")
                .setPositiveButton("بازکردن تنظیمات", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                        i.setData(Uri.parse("package:com.dinoar.stand"));
                        startActivity(i);
                    }
                })
                .setNegativeButton("تلاش دوباره", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface d, int w) {
                        ensureCameraAndLoad();
                    }
                })
                .show();
        }
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        // بعد از برگشت از تنظیمات، اگر مجوز آمده باشد صفحه تازه شود
        if (Build.VERSION.SDK_INT >= 23
                && checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            web.loadUrl(BASE + "ar/");
        }
    }

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg")) return "image/jpeg";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".glb")) return "model/gltf-binary";
        if (p.endsWith(".mind")) return "application/octet-stream";
        if (p.endsWith(".wav")) return "audio/wav";
        if (p.endsWith(".mp3")) return "audio/mpeg";
        return "application/octet-stream";
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && web.canGoBack()) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
