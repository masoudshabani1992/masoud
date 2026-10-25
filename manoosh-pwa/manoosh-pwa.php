<?php
/**
 * Plugin Name: مانوش ارگانیک — نصب PWA
 * Description: افزودن manifest، service worker و بنر نصب برنامه مانوش به سایت وردپرسی.
 * Version: 1.0.0
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
        ?>
        <style>
        #manoosh-pwa-prompt{position:fixed;z-index:999999;right:16px;left:16px;bottom:18px;max-width:540px;margin:auto;display:none;align-items:center;gap:12px;padding:14px;background:#fff;color:#202124;border:1px solid #dcefe3;border-radius:18px;box-shadow:0 8px 32px #0002;direction:rtl;font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
        #manoosh-pwa-prompt .mpwa-icon{width:44px;height:44px;border-radius:12px;flex:none}#manoosh-pwa-prompt .mpwa-copy{flex:1}#manoosh-pwa-prompt .mpwa-title{font-weight:700}#manoosh-pwa-prompt .mpwa-message{font-size:12px;color:#5f6368}#manoosh-pwa-prompt button{font:inherit;cursor:pointer;border:0}#manoosh-pwa-prompt .mpwa-install{background:#0f9d58;color:white;border-radius:11px;padding:9px 15px;white-space:nowrap}#manoosh-pwa-prompt .mpwa-close{background:transparent;color:#777;font-size:22px;padding:0 2px}
        </style>
        <aside id="manoosh-pwa-prompt" role="dialog" aria-label="نصب برنامه مانوش">
          <img class="mpwa-icon" src="<?php echo esc_url(plugins_url('assets/icon-192.png', __FILE__)); ?>" alt="">
          <div class="mpwa-copy"><div class="mpwa-title">نصب برنامه مانوش ارگانیک</div><div class="mpwa-message"><?php echo esc_html($message); ?></div></div>
          <button class="mpwa-install" type="button">نصب</button>
          <button class="mpwa-close" type="button" aria-label="بستن">×</button>
        </aside>
        <script>
        (function(){var box=document.getElementById('manoosh-pwa-prompt'),install=box.querySelector('.mpwa-install'),close=box.querySelector('.mpwa-close'),deferred=null,key='manoosh-pwa-dismissed';
        var standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
        if(standalone||localStorage.getItem(key))return;
        var timer=setTimeout(function(){box.style.display='flex'},<?php echo (int)$delay; ?>*1000);
        window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;box.style.display='flex';install.textContent='نصب';install.dataset.mode='native'});
        window.addEventListener('appinstalled',function(){box.style.display='none';localStorage.setItem(key,'1')});
        install.addEventListener('click',function(){if(deferred){deferred.prompt();deferred.userChoice.then(function(){deferred=null;box.style.display='none';localStorage.setItem(key,'1')})}else{var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);alert(ios?'برای نصب، دکمه اشتراک‌گذاری مرورگر را بزنید و «افزودن به صفحه اصلی» را انتخاب کنید.':'برای نصب، از منوی مرورگر گزینه «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.')}});
        close.addEventListener('click',function(){box.style.display='none';localStorage.setItem(key,'1');clearTimeout(timer)});
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
