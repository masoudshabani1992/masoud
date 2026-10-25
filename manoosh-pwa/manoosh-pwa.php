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
        $logo = esc_url(plugins_url('assets/logo-manoosh.webp', __FILE__));
        ?>
        <style>
        #manoosh-pwa-prompt{position:fixed;z-index:999999;right:16px;left:16px;bottom:calc(18px + env(safe-area-inset-bottom));max-width:540px;margin:auto;display:none;align-items:center;gap:12px;padding:14px;background:#fff;color:#202124;border:1px solid #dcefe3;border-radius:18px;box-shadow:0 8px 32px #0003;direction:rtl;font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
        #manoosh-pwa-prompt .mpwa-icon{width:48px;height:48px;object-fit:contain;border-radius:12px;flex:none}#manoosh-pwa-prompt .mpwa-copy{flex:1}#manoosh-pwa-prompt .mpwa-title{font-weight:700}#manoosh-pwa-prompt .mpwa-message{font-size:12px;color:#5f6368}#manoosh-pwa-prompt button{font:inherit;cursor:pointer;border:0}#manoosh-pwa-prompt .mpwa-install{background:#0f9d58;color:white;border-radius:11px;padding:9px 15px;white-space:nowrap}#manoosh-pwa-prompt .mpwa-close{background:transparent;color:#777;font-size:22px;padding:0 2px}
        #manoosh-ios-guide{position:fixed;inset:0;z-index:1000000;display:none;background:#0006;direction:rtl;color:#17171b;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
        #manoosh-ios-guide .mpwa-sheet{position:absolute;inset:env(safe-area-inset-top) 0 0;background:#fff;border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:auto;padding:clamp(30px,8vh,76px) 22px calc(20px + env(safe-area-inset-bottom));box-sizing:border-box}
        #manoosh-ios-guide .mpwa-logo{width:74px;height:74px;object-fit:contain;border-radius:20px;margin:0 auto 16px}
        #manoosh-ios-guide h2{font-size:21px;line-height:1.5;text-align:center;margin:0 auto 12px;max-width:340px;font-weight:700}
        #manoosh-ios-guide .mpwa-lead{font-size:14px;color:#73737b;text-align:center;margin:0 auto 24px;max-width:340px;line-height:1.9}
        #manoosh-ios-guide .mpwa-steps{border-top:1px solid #eee;padding-top:8px;max-width:440px;width:100%;margin:0 auto;display:grid;gap:8px}
        #manoosh-ios-guide .mpwa-step{display:grid;grid-template-columns:36px 1fr 40px;align-items:center;gap:10px;min-height:78px}
        #manoosh-ios-guide .mpwa-num{width:28px;height:28px;border-radius:50%;background:#e8f6ee;color:#0f9d58;font-weight:700;display:grid;place-items:center}
        #manoosh-ios-guide .mpwa-step-text{font-size:14px;line-height:1.8;color:#666}
        #manoosh-ios-guide .mpwa-step-text strong{color:#26262b;font-weight:700}
        #manoosh-ios-guide .mpwa-symbol{width:38px;height:38px;color:#6757d9;display:grid;place-items:center}
        #manoosh-ios-guide .mpwa-symbol svg{width:27px;height:27px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
        #manoosh-ios-guide .mpwa-demo{height:48px;border:1px solid #e5e5eb;border-radius:12px;background:#fafafd;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:0 10px;margin:8px 0 0;color:#6053ce;font-size:12px;font-weight:600}
        #manoosh-ios-guide .mpwa-demo .mpwa-mini-share{font-size:20px;font-weight:700}
        #manoosh-ios-guide .mpwa-done{margin-top:auto;min-height:56px;border:0;border-radius:14px;background:#19a85b;color:#fff;font-size:17px;font-weight:700;cursor:pointer;box-shadow:0 4px 10px #19a85b33}
        @media(max-height:700px){#manoosh-ios-guide .mpwa-sheet{padding-top:24px}#manoosh-ios-guide .mpwa-logo{width:54px;height:54px;margin-bottom:8px}#manoosh-ios-guide h2{font-size:18px}#manoosh-ios-guide .mpwa-lead{margin-bottom:12px}.mpwa-step{min-height:62px!important}}
        </style>
        <aside id="manoosh-pwa-prompt" role="dialog" aria-label="نصب برنامه مانوش">
          <img class="mpwa-icon" src="<?php echo esc_url(plugins_url('assets/icon-192.png', __FILE__)); ?>" alt="">
          <div class="mpwa-copy"><div class="mpwa-title">نصب برنامه مانوش ارگانیک</div><div class="mpwa-message"><?php echo esc_html($message); ?></div></div>
          <button class="mpwa-install" type="button">نصب</button>
          <button class="mpwa-close" type="button" aria-label="بستن">×</button>
        </aside>
        <section id="manoosh-ios-guide" role="dialog" aria-modal="true" aria-label="راهنمای نصب مانوش روی آیفون">
          <div class="mpwa-sheet">
            <img class="mpwa-logo" src="<?php echo $logo; ?>" alt="لوگوی مانوش ارگانیک">
            <h2>وب‌اپلیکیشن مانوش را به صفحه اصلی موبایل خود اضافه کنید</h2>
            <p class="mpwa-lead">برای نصب برنامه مانوش روی آیفون، این سه مرحله را انجام دهید:</p>
            <div class="mpwa-steps">
              <div class="mpwa-step"><span class="mpwa-num">۱</span><div class="mpwa-step-text">در نوار پایین مرورگر روی دکمه <strong>Share</strong> بزنید.</div><span class="mpwa-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v8h14v-8"/></svg></span></div>
              <div class="mpwa-step"><span class="mpwa-num">۲</span><div class="mpwa-step-text">در منوی بازشده، گزینه <strong>Add to Home Screen</strong> را انتخاب کنید.</div><span class="mpwa-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 8v8m-4-4h8"/></svg></span></div>
              <div class="mpwa-step"><span class="mpwa-num">۳</span><div class="mpwa-step-text">در صفحه بعد، در گوشه بالا روی <strong>Add</strong> بزنید.</div><span class="mpwa-symbol" aria-hidden="true"><span style="font-size:13px;font-weight:700">Add</span></span></div>
            </div>
            <div class="mpwa-demo" aria-hidden="true"><span>نصب مانوش</span><span class="mpwa-mini-share">↥</span></div>
            <button class="mpwa-done" type="button">متوجه شدم</button>
          </div>
        </section>
        <script>
        (function(){var box=document.getElementById('manoosh-pwa-prompt'),guide=document.getElementById('manoosh-ios-guide'),install=box.querySelector('.mpwa-install'),close=box.querySelector('.mpwa-close'),done=guide.querySelector('.mpwa-done'),deferred=null,key='manoosh-pwa-dismissed';
        var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(/Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
        var standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
        if(standalone||localStorage.getItem(key))return;
        if(ios){guide.style.display='block';document.documentElement.style.overflow='hidden';done.addEventListener('click',function(){guide.style.display='none';document.documentElement.style.overflow='';localStorage.setItem(key,'1')});return;}
        var timer=setTimeout(function(){box.style.display='flex'},<?php echo (int)$delay; ?>*1000);
        window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;box.style.display='flex';install.textContent='نصب'});
        window.addEventListener('appinstalled',function(){box.style.display='none';localStorage.setItem(key,'1')});
        install.addEventListener('click',function(){if(deferred){deferred.prompt();deferred.userChoice.then(function(){deferred=null;box.style.display='none';localStorage.setItem(key,'1')})}else{alert('برای نصب، از منوی مرورگر گزینه «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.')}});
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
