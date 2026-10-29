<?php
/**
 * Plugin Name: مانوش ارگانیک — نصب PWA
 * Description: افزودن manifest، service worker و بنر نصب برنامه مانوش به سایت وردپرسی.
 * Version: 1.2.1
 * Author: Manoosh Organic
 * Text Domain: manoosh-pwa
 */

if (!defined('ABSPATH')) { exit; }

final class Manoosh_PWA {
    const OPTION = 'manoosh_pwa_options';

    public static function boot() {
        add_action('init', array(__CLASS__, 'serve_endpoints'));
        add_action('wp_head', array(__CLASS__, 'head_tags'), 2);
        add_action('wp_footer', array(__CLASS__, 'render_prompt'));
        add_action('admin_menu', array(__CLASS__, 'admin_menu'));
        add_action('admin_init', array(__CLASS__, 'register_settings'));
    }

    private static function defaults() {
        return array('enabled' => 1, 'delay' => 4, 'message' => 'برای دسترسی سریع‌تر، برنامه مانوش ارگانیک را نصب کنید.');
    }

    private static function options() {
        return wp_parse_args(get_option(self::OPTION, array()), self::defaults());
    }

    private static function home_scope() {
        $path = wp_parse_url(home_url('/'), PHP_URL_PATH);
        return $path ? trailingslashit($path) : '/';
    }

    public static function serve_endpoints() {
        if (isset($_GET['manoosh_pwa_manifest'])) {
            self::send_manifest();
        }
        if (isset($_GET['manoosh_pwa_sw'])) {
            self::send_service_worker();
        }
    }

    private static function send_manifest() {
        $name = get_bloginfo('name') ?: 'مانوش ارگانیک';
        $scope = self::home_scope();
        $manifest = array(
            'id' => $scope,
            'name' => $name,
            'short_name' => 'مانوش',
            'description' => 'فروشگاه آنلاین محصولات طبیعی و ارگانیک مانوش',
            'start_url' => $scope,
            'scope' => $scope,
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#0f9d58',
            'orientation' => 'portrait',
            'lang' => 'fa',
            'dir' => 'rtl',
            'icons' => array(
                array('src' => plugins_url('assets/icon-192.png', __FILE__), 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any'),
                array('src' => plugins_url('assets/icon-512.png', __FILE__), 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any'),
            ),
        );
        nocache_headers();
        header('Content-Type: application/manifest+json; charset=utf-8');
        echo wp_json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private static function send_service_worker() {
        $scope = self::home_scope();
        nocache_headers();
        header('Content-Type: application/javascript; charset=utf-8');
        header('Service-Worker-Allowed: ' . $scope);
        echo "const CACHE='manoosh-pwa-shell-v1';\n";
        echo "const ROOT=" . wp_json_encode(home_url('/')) . ";\n";
        echo "self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.add(ROOT)).catch(()=>{}));self.skipWaiting()});\n";
        echo "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});\n";
        echo "self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.match(ROOT)))}});\n";
        exit;
    }

    public static function head_tags() {
        if (is_admin()) { return; }
        $manifest = add_query_arg('manoosh_pwa_manifest', '1', home_url('/'));
        $sw = add_query_arg('manoosh_pwa_sw', '1', home_url('/'));
        echo '<link rel="manifest" href="' . esc_url($manifest) . '">';
        echo '<meta name="theme-color" content="#0f9d58">';
        echo '<link rel="apple-touch-icon" href="' . esc_url(plugins_url('assets/icon-192.png', __FILE__)) . '">';
        echo '<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register(' . wp_json_encode($sw) . ',{scope:' . wp_json_encode(self::home_scope()) . '}).catch(function(e){console.warn("Manoosh PWA service worker:",e)})})}</script>';
    }

    public static function render_prompt() {
        if (is_admin()) { return; }
        $o = self::options();
        if (empty($o['enabled'])) { return; }
        $message = sanitize_text_field($o['message']);
        $delay = max(0, min(60, absint($o['delay'])));
        $logo = esc_url(plugins_url('assets/logo-manoosh.webp', __FILE__));
        $qr = esc_url(plugins_url('assets/qr-manoosh.png', __FILE__));
        $install_url = add_query_arg('manoosh-install', '1', home_url('/'));
        ?>
        <style>
        #manoosh-install-fab{position:fixed;z-index:999998;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));display:none;align-items:center;gap:8px;direction:rtl;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
        #manoosh-install-fab button{border:0;cursor:pointer;font:inherit;box-shadow:0 6px 24px #063b2050}
        #manoosh-install-fab .mpwa-primary{display:flex;align-items:center;gap:8px;border-radius:999px;background:#159957;color:#fff;padding:11px 17px;font-size:14px;font-weight:700}
        #manoosh-install-fab .mpwa-guide-open{border:1px solid #d9eee1;border-radius:999px;background:#fff;color:#177c49;padding:10px 14px;font-size:13px;font-weight:700}
        #manoosh-install-fab .mpwa-fab-logo{width:26px;height:26px;object-fit:cover;border-radius:50%;background:white}
        #manoosh-install-guide{position:fixed;inset:0;z-index:999999;display:none;background:#0008;direction:rtl;color:#203329;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
        #manoosh-install-guide .mpwa-dialog{position:absolute;inset: max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));max-width:680px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 18px 70px #0003}
        #manoosh-install-guide .mpwa-dialog-head{flex:none;position:relative;display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #edf1ee;background:#fff}
        #manoosh-install-guide .mpwa-dialog-head img{width:48px;height:48px;object-fit:cover;border-radius:14px}
        #manoosh-install-guide .mpwa-dialog-head h2{font-size:19px;line-height:1.5;margin:0;color:#163c2a}
        #manoosh-install-guide .mpwa-dialog-head p{font-size:12px;color:#758078;margin:2px 0 0}
        #manoosh-install-guide .mpwa-x{margin-right:auto;align-self:flex-start;border:0;border-radius:50%;width:38px;height:38px;background:#f1f4f2;color:#59655e;font-size:24px;cursor:pointer}
        #manoosh-install-guide .mpwa-content{overflow:auto;padding:18px 22px 24px;line-height:1.95;font-size:14px}
        #manoosh-install-guide .mpwa-content p{margin:0 0 14px}
        #manoosh-install-guide .mpwa-content h3{font-size:16px;color:#166b41;margin:20px 0 8px}
        #manoosh-install-guide .mpwa-benefits{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:10px 0 18px}
        #manoosh-install-guide .mpwa-benefit{border:1px solid #e3f0e7;border-radius:13px;padding:11px 12px;background:#f8fcf9}
        #manoosh-install-guide .mpwa-benefit strong{display:block;color:#167546;margin-bottom:3px}
        #manoosh-install-guide .mpwa-content ol{padding-right:24px;margin:6px 0 16px}
        #manoosh-install-guide .mpwa-content li{padding:2px 0 2px 4px}
        #manoosh-install-guide .mpwa-platform{padding:12px 15px;border:1px solid #e7eee9;border-radius:15px;margin:11px 0;background:#fff}
        #manoosh-install-guide .mpwa-platform h4{font-size:15px;color:#145e3a;margin:0 0 7px}
        #manoosh-install-guide .mpwa-platform p{margin:0}
        #manoosh-install-guide .mpwa-qr-area{display:flex;align-items:center;gap:16px;border-radius:16px;background:#f3faf5;padding:14px;margin:18px 0}
        #manoosh-install-guide .mpwa-qr{width:112px;height:112px;flex:none;background:#fff;border-radius:10px;padding:5px}
        #manoosh-install-guide .mpwa-qr-area strong{display:block;color:#155c39;margin-bottom:3px}
        #manoosh-install-guide .mpwa-qr-area a{color:#11804a;word-break:break-word}
        #manoosh-install-guide .mpwa-install-now{display:inline-block;margin-top:9px;border:0;border-radius:10px;background:#159957;color:#fff;padding:9px 15px;font:inherit;font-weight:700;text-decoration:none;cursor:pointer}
        #manoosh-install-guide .mpwa-tags{color:#748078;font-size:12px}
        #manoosh-install-guide .mpwa-footer{flex:none;padding:12px 20px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #edf1ee;background:#fff}
        #manoosh-install-guide .mpwa-done{width:100%;min-height:50px;border:0;border-radius:13px;background:#19a85b;color:#fff;font-size:16px;font-weight:700;cursor:pointer}
        @media(max-width:560px){#manoosh-install-fab{right:10px;left:10px;justify-content:center}#manoosh-install-fab .mpwa-primary{padding:10px 13px;font-size:13px}#manoosh-install-fab .mpwa-guide-open{padding:9px 11px;font-size:12px}#manoosh-install-guide .mpwa-dialog{inset:env(safe-area-inset-top) 0 0;border-radius:22px 22px 0 0}#manoosh-install-guide .mpwa-content{padding:14px 16px 20px;font-size:13px}#manoosh-install-guide .mpwa-benefits{grid-template-columns:1fr}#manoosh-install-guide .mpwa-qr{width:92px;height:92px}}
        </style>
        <nav id="manoosh-install-fab" aria-label="نصب برنامه مانوش">
          <button class="mpwa-primary" type="button"><img class="mpwa-fab-logo" src="<?php echo $logo; ?>" alt=""><span>نصب برنامه مانوش</span></button>
          <button class="mpwa-guide-open" type="button">راهنمای نصب</button>
        </nav>
        <section id="manoosh-install-guide" role="dialog" aria-modal="true" aria-labelledby="manoosh-install-title">
          <div class="mpwa-dialog">
            <header class="mpwa-dialog-head">
              <img src="<?php echo $logo; ?>" alt="لوگوی مانوش">
              <div><h2 id="manoosh-install-title">مانوش رو به گوشی‌ات اضافه کن!</h2><p>راهنمای نصب فروشگاه مانوش ارگانیک</p></div>
              <button class="mpwa-x" type="button" aria-label="بستن راهنما">×</button>
            </header>
            <div class="mpwa-content">
              <p>دوست داری هر وقت هوس طعم‌های خوشمزه و طبیعی مانوش رو کردی، بدون دردسر و سریع وارد فروشگاه بشی؟ از این به بعد می‌تونی مانوش ارگانیک رو روی صفحه گوشی‌ات نصب کنی تا دسترسی به فروشگاه اینترنتی‌مون برات راحت‌تر بشه.</p>
              <h3>با نصب مانوش چه مزیتی داری؟</h3>
              <div class="mpwa-benefits">
                <div class="mpwa-benefit"><strong>دسترسی سریع‌تر</strong>دیگه لازم نیست هر بار آدرس سایت رو جست‌وجو کنی؛ از روی صفحه گوشی وارد مانوش شو.</div>
                <div class="mpwa-benefit"><strong>خرید راحت‌تر</strong>محصولات موردعلاقه‌ات رو پیدا کن، بررسی کن و سفارشت رو آنلاین ثبت کن.</div>
                <div class="mpwa-benefit"><strong>همیشه در دسترس</strong>هر وقت به محصولات مانوش نیاز داشتی، راحت‌تر به فروشگاه اینترنتی ما سر بزن.</div>
                <div class="mpwa-benefit"><strong>تنوع محصولات در یک جا</strong>از کره‌های مغزیجات و ارده گرفته تا عسل، شیره‌ها، روغن‌ها و سایر محصولات مانوش رو ببین و انتخاب کن.</div>
              </div>
              <h3>چطور مانوش رو نصب کنیم؟</h3>
              <div class="mpwa-platform" id="manoosh-ios-steps"><h4>اگر آیفون داری (Safari)</h4><ol>
                <li>با مرورگر Safari وارد سایت <a href="https://manooshorganic.com/" target="_blank" rel="noopener">manooshorganic.com</a> شو.</li>
                <li>روی گزینه اشتراک‌گذاری (علامت مربع با فلش رو به بالا) بزن.</li>
                <li>گزینه <b>Add to Home Screen</b> یا «افزودن به صفحه اصلی» رو انتخاب کن.</li>
                <li>در صورت نمایش گزینه <b>Open as Web App</b>، می‌تونی اون رو فعال کنی.</li>
                <li>روی <b>Add</b> یا «افزودن» بزن. تمام! حالا آیکون مانوش روی صفحه گوشیته.</li>
              </ol></div>
              <div class="mpwa-platform" id="manoosh-android-steps"><h4>اگر گوشی اندرویدی داری (Google Chrome)</h4><ol>
                <li>با مرورگر Google Chrome وارد سایت <a href="https://manooshorganic.com/" target="_blank" rel="noopener">manooshorganic.com</a> شو.</li>
                <li>روی منوی سه‌نقطه بالای مرورگر بزن.</li>
                <li>اگر گزینه <b>Install app</b> یا <b>Add to Home screen</b> رو دیدی، انتخابش کن.</li>
                <li>مراحل نمایش‌داده‌شده رو تأیید کن. تمام! از آیکون مانوش روی صفحه گوشی‌ات وارد فروشگاه شو.</li>
              </ol></div>
              <div class="mpwa-qr-area"><img class="mpwa-qr" src="<?php echo $qr; ?>" alt="کیوآرکد نصب برنامه مانوش"><div><strong>اسکن کن و برنامه مانوش رو نصب کن</strong><span>این QR روی آیفون و اندروید، راهنمای نصب را باز می‌کند.</span><br><a href="<?php echo esc_url($install_url); ?>" target="_blank" rel="noopener">manooshorganic.com — نصب مانوش</a><br><button class="mpwa-install-now" type="button">نصب روی این گوشی</button></div></div>
              <p><b>یک بار نصب کن، راحت‌تر خرید کن!</b> از همراهی شما ممنونیم که مانوش رو برای انتخاب محصولات موردعلاقه‌تون همراه خودتون دارید.</p>
              <p class="mpwa-tags">#مانوش_ارگانیک &nbsp; #خرید_آنلاین &nbsp; #محصولات_طبیعی &nbsp; #کره_بادام_زمینی &nbsp; #مانوش</p>
            </div>
            <footer class="mpwa-footer"><button class="mpwa-done" type="button">متوجه شدم</button></footer>
          </div>
        </section>
        <script>
        (function(){var fab=document.getElementById('manoosh-install-fab'),guide=document.getElementById('manoosh-install-guide'),primary=fab.querySelector('.mpwa-primary'),guideOpen=fab.querySelector('.mpwa-guide-open'),close=guide.querySelector('.mpwa-x'),done=guide.querySelector('.mpwa-done'),installNow=guide.querySelector('.mpwa-install-now'),deferred=null,key='manoosh-pwa-dismissed';
        var standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
        var installRequest=new URLSearchParams(window.location.search).get('manoosh-install')==='1';
        if(standalone)return;
        function showGuide(){guide.style.display='block';document.documentElement.style.overflow='hidden'}
        function hideGuide(){guide.style.display='none';document.documentElement.style.overflow='';localStorage.setItem(key,'1')}
        function installApp(){if(deferred){deferred.prompt();deferred.userChoice.then(function(){deferred=null;localStorage.setItem(key,'1')})}else if(/iphone|ipad|ipod/i.test(navigator.userAgent)){document.getElementById('manoosh-ios-steps').scrollIntoView({behavior:'smooth',block:'center'})}else{document.getElementById('manoosh-android-steps').scrollIntoView({behavior:'smooth',block:'center'})}}
        if(installRequest){fab.style.display='flex'}
        else{setTimeout(function(){fab.style.display='flex'},<?php echo (int)$delay; ?>*1000)}
        window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;fab.style.display='flex'});
        window.addEventListener('appinstalled',function(){fab.style.display='none';localStorage.setItem(key,'1')});
        primary.addEventListener('click',function(){if(deferred){deferred.prompt();deferred.userChoice.then(function(){deferred=null;localStorage.setItem(key,'1')})}else{showGuide()}});
        installNow.addEventListener('click',installApp);
        guideOpen.addEventListener('click',showGuide);close.addEventListener('click',hideGuide);done.addEventListener('click',hideGuide);
        guide.addEventListener('click',function(e){if(e.target===guide)hideGuide()});
        document.addEventListener('keydown',function(e){if(e.key==='Escape'&&guide.style.display==='block')hideGuide()});
        })();
        </script>
        <?php
    }

    public static function admin_menu() {
        add_options_page('نصب PWA مانوش', 'نصب PWA مانوش', 'manage_options', 'manoosh-pwa', array(__CLASS__, 'settings_page'));
    }

    public static function register_settings() {
        register_setting('manoosh_pwa_group', self::OPTION, array('sanitize_callback' => array(__CLASS__, 'sanitize_options')));
    }

    public static function sanitize_options($input) {
        return array(
            'enabled' => empty($input['enabled']) ? 0 : 1,
            'delay' => isset($input['delay']) ? min(60, absint($input['delay'])) : 4,
            'message' => isset($input['message']) ? sanitize_text_field($input['message']) : self::defaults()['message'],
        );
    }

    public static function settings_page() {
        if (!current_user_can('manage_options')) { return; }
        $o = self::options();
        ?>
        <div class="wrap" dir="rtl">
          <h1>تنظیمات نصب PWA مانوش</h1>
          <p>این افزونه سایت را به یک وب‌اپ قابل نصب تبدیل می‌کند و بنر نصب را برای بازدیدکنندگان نمایش می‌دهد. نصب فقط روی HTTPS (یا localhost) فعال می‌شود.</p>
          <form method="post" action="options.php">
            <?php settings_fields('manoosh_pwa_group'); ?>
            <table class="form-table"><tbody>
              <tr><th scope="row">نمایش بنر نصب</th><td><label><input type="checkbox" name="<?php echo esc_attr(self::OPTION); ?>[enabled]" value="1" <?php checked($o['enabled']); ?>> فعال باشد</label></td></tr>
              <tr><th scope="row">تأخیر نمایش (ثانیه)</th><td><input type="number" min="0" max="60" name="<?php echo esc_attr(self::OPTION); ?>[delay]" value="<?php echo esc_attr($o['delay']); ?>"></td></tr>
              <tr><th scope="row">متن بنر</th><td><input class="regular-text" type="text" name="<?php echo esc_attr(self::OPTION); ?>[message]" value="<?php echo esc_attr($o['message']); ?>"></td></tr>
            </tbody></table>
            <?php submit_button('ذخیره تنظیمات'); ?>
          </form>
          <p><strong>توجه:</strong> پس از فعال‌سازی، کش سایت/CDN را پاک کنید. در iPhone/iPad، نصب از منوی Share و گزینه «افزودن به صفحه اصلی» انجام می‌شود.</p>
        </div>
        <?php
    }
}
Manoosh_PWA::boot();
