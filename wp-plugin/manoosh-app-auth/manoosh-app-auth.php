<?php
/**
 * Plugin Name:       Manoosh App Auth & API
 * Plugin URI:        https://manooshorganic.com
 * Description:       Companion API for the Manoosh Android app: SMS OTP login, home banners, product variations, order pay URL.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Manoosh
 * License:           GPL-2.0-or-later
 * Text Domain:       manoosh-app
 *
 * @package ManooshApp
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MANOOSH_APP_VERSION', '1.0.0');
define('MANOOSH_APP_OPTION', 'manoosh_app_settings');

/* -------------------------------------------------------------------------- */
/* Compatibility & activation                                                 */
/* -------------------------------------------------------------------------- */

add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
    }
});

register_activation_hook(__FILE__, function () {
    $defaults = array(
        'provider'       => 'none', // none|kavenegar|farazsms|melipayamak|ghasedak|custom
        'kavenegar_key'  => '',
        'kavenegar_tpl'  => 'verify',
        'faraz_user'     => '',
        'faraz_pass'     => '',
        'faraz_from'     => '',
        'faraz_pattern'  => '',
        'meli_user'      => '',
        'meli_pass'      => '',
        'meli_body_id'   => '',
        'ghasedak_key'   => '',
        'ghasedak_tpl'   => '',
        'custom_url'     => '',
        'custom_method'  => 'GET',
        'custom_header'  => '',
        'banners'        => '[]',
        'featured_cats'  => '',
        'amazing_title'  => 'پیشنهاد شگفت‌انگیز',
        'amazing_hours'  => 24,
    );
    if (!get_option(MANOOSH_APP_OPTION)) {
        add_option(MANOOSH_APP_OPTION, $defaults);
    }
});

function manoosh_app_settings() {
    $defaults = array(
        'provider' => 'none', 'banners' => '[]', 'featured_cats' => '',
        'amazing_title' => 'پیشنهاد شگفت‌انگیز', 'amazing_hours' => 24,
    );
    return wp_parse_args((array) get_option(MANOOSH_APP_OPTION, array()), $defaults);
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function manoosh_normalize_phone($phone) {
    $phone = trim((string) $phone);
    $fa = array('۰','۱','۲','۳','۴','۵','۶','۷','۸','۹');
    $en = array('0','1','2','3','4','5','6','7','8','9');
    $phone = str_replace($fa, $en, $phone);
    $phone = preg_replace('/[\s\-]/', '', $phone);
    // 98912... / +98912... / 0912...
    if (preg_match('/^\+?98(\d{10})$/', $phone, $m)) {
        $phone = '0' . $m[1];
    }
    return $phone;
}

function manoosh_is_valid_mobile($phone) {
    return (bool) preg_match('/^09\d{9}$/', $phone);
}

function manoosh_find_user_by_phone($phone) {
    // 1) username equals phone.
    $user = get_user_by('login', $phone);
    if ($user) {
        return $user;
    }
    // 2) meta lookup (billing_phone / manoosh_phone).
    $users = get_users(array(
        'meta_query' => array(
            'relation' => 'OR',
            array('key' => 'billing_phone', 'value' => $phone),
            array('key' => 'manoosh_phone', 'value' => $phone),
        ),
        'number' => 1,
    ));
    return !empty($users) ? $users[0] : null;
}

/* -------------------------------------------------------------------------- */
/* SMS sending                                                                */
/* -------------------------------------------------------------------------- */

function manoosh_send_otp_sms($phone, $code) {
    $s = manoosh_app_settings();
    $provider = isset($s['provider']) ? $s['provider'] : 'none';

    /**
     * Override SMS sending. Return array('ok' => bool, 'error' => string).
     */
    $override = apply_filters('manoosh_otp_send_sms', null, $phone, $code);
    if (is_array($override)) {
        return $override;
    }

    switch ($provider) {
        case 'kavenegar':
            $url = sprintf(
                'https://api.kavenegar.com/v1/%s/verify/lookup.json?receptor=%s&token=%s&template=%s',
                urlencode($s['kavenegar_key']), urlencode($phone), urlencode($code), urlencode($s['kavenegar_tpl'] ?: 'verify')
            );
            $res = wp_remote_get($url, array('timeout' => 20));
            return manoosh_http_ok($res);

        case 'farazsms': // ippanel pattern API (GET).
            $input_data = wp_json_encode(array('verification-code' => $code));
            $url = add_query_arg(array(
                'username'     => $s['faraz_user'],
                'password'     => urlencode($s['faraz_pass']),
                'from'         => $s['faraz_from'],
                'to'           => $phone,
                'input_data'   => urlencode($input_data),
                'pattern_code' => $s['faraz_pattern'],
            ), 'https://ippanel.com/patterns/pattern');
            $res = wp_remote_get($url, array('timeout' => 20));
            return manoosh_http_ok($res);

        case 'melipayamak': // pattern via BaseServiceNumber.
            $res = wp_remote_post('https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber', array(
                'timeout' => 20,
                'headers' => array('Content-Type' => 'application/json'),
                'body'    => wp_json_encode(array(
                    'username' => $s['meli_user'],
                    'password' => $s['meli_pass'],
                    'text'     => $code,
                    'to'       => $phone,
                    'bodyId'   => (int) $s['meli_body_id'],
                )),
            ));
            return manoosh_http_ok($res);

        case 'ghasedak':
            $res = wp_remote_post('https://api.ghasedaksms.com/v2/verification/send/simple', array(
                'timeout' => 20,
                'headers' => array('Content-Type' => 'application/json', 'apikey' => $s['ghasedak_key']),
                'body'    => wp_json_encode(array(
                    'receptor' => $phone,
                    'template' => $s['ghasedak_tpl'],
                    'type'     => 1,
                    'param1'   => $code,
                )),
            ));
            return manoosh_http_ok($res);

        case 'custom':
            $url = str_replace(array('{to}', '{code}'), array(urlencode($phone), urlencode($code)), $s['custom_url']);
            $headers = array();
            if (!empty($s['custom_header']) && strpos($s['custom_header'], ':') !== false) {
                list($hk, $hv) = explode(':', $s['custom_header'], 2);
                $headers[trim($hk)] = trim($hv);
            }
            if (strtoupper($s['custom_method']) === 'POST') {
                $res = wp_remote_post($url, array('timeout' => 20, 'headers' => $headers));
            } else {
                $res = wp_remote_get($url, array('timeout' => 20, 'headers' => $headers));
            }
            return manoosh_http_ok($res);

        default:
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("[manoosh-app] OTP for {$phone}: {$code} (no SMS provider configured)");
            }
            return array('ok' => false, 'error' => 'sms_provider_not_configured');
    }
}

function manoosh_http_ok($res) {
    if (is_wp_error($res)) {
        return array('ok' => false, 'error' => $res->get_error_message());
    }
    $code = (int) wp_remote_retrieve_response_code($res);
    if ($code >= 200 && $code < 300) {
        return array('ok' => true);
    }
    return array('ok' => false, 'error' => 'sms_http_' . $code);
}

/* -------------------------------------------------------------------------- */
/* REST API                                                                   */
/* -------------------------------------------------------------------------- */

add_action('rest_api_init', function () {
    register_rest_route('manoosh/v1', '/otp/request', array(
        'methods'             => 'POST',
        'callback'            => 'manoosh_rest_otp_request',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('manoosh/v1', '/otp/verify', array(
        'methods'             => 'POST',
        'callback'            => 'manoosh_rest_otp_verify',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('manoosh/v1', '/home', array(
        'methods'             => 'GET',
        'callback'            => 'manoosh_rest_home',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('manoosh/v1', '/variations', array(
        'methods'             => 'GET',
        'callback'            => 'manoosh_rest_variations',
        'permission_callback' => '__return_true',
    ));
    register_rest_route('manoosh/v1', '/orders/(?P<id>\d+)/pay-url', array(
        'methods'             => 'GET',
        'callback'            => 'manoosh_rest_pay_url',
        'permission_callback' => 'is_user_logged_in',
    ));
});

function manoosh_rest_otp_request(WP_REST_Request $req) {
    $phone = manoosh_normalize_phone($req->get_param('phone'));
    if (!manoosh_is_valid_mobile($phone)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'شماره موبایل معتبر نیست.'), 200);
    }
    if (get_transient('manoosh_otp_rl_' . $phone)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'لطفاً یک دقیقه دیگر تلاش کنید.'), 200);
    }
    $code = (string) wp_rand(10000, 99999);
    set_transient('manoosh_otp_' . $phone, $code, 2 * MINUTE_IN_SECONDS);
    set_transient('manoosh_otp_rl_' . $phone, 1, MINUTE_IN_SECONDS);
    delete_transient('manoosh_otp_attempts_' . $phone);

    $sent = manoosh_send_otp_sms($phone, $code);
    if (empty($sent['ok'])) {
        $msg = 'ارسال پیامک ناموفق بود.';
        if (defined('WP_DEBUG') && WP_DEBUG && !empty($sent['error'])) {
            $msg .= ' (' . $sent['error'] . ')';
        }
        return new WP_REST_Response(array('success' => false, 'message' => $msg), 200);
    }
    return new WP_REST_Response(array('success' => true, 'message' => 'کد تایید ارسال شد.', 'expires_in' => 120), 200);
}

function manoosh_rest_otp_verify(WP_REST_Request $req) {
    $phone = manoosh_normalize_phone($req->get_param('phone'));
    $code = preg_replace('/\D/', '', (string) $req->get_param('code'));
    if (!manoosh_is_valid_mobile($phone) || strlen($code) !== 5) {
        return new WP_REST_Response(array('success' => false, 'message' => 'کد تایید نامعتبر است.'), 200);
    }
    $attempts = (int) get_transient('manoosh_otp_attempts_' . $phone);
    if ($attempts >= 5) {
        return new WP_REST_Response(array('success' => false, 'message' => 'تعداد تلاش‌ها زیاد شد. کد جدید بگیرید.'), 200);
    }
    $expected = get_transient('manoosh_otp_' . $phone);
    if (!$expected || !hash_equals((string) $expected, $code)) {
        set_transient('manoosh_otp_attempts_' . $phone, $attempts + 1, 10 * MINUTE_IN_SECONDS);
        return new WP_REST_Response(array('success' => false, 'message' => 'کد تایید اشتباه است.'), 200);
    }
    delete_transient('manoosh_otp_' . $phone);
    delete_transient('manoosh_otp_attempts_' . $phone);

    $user = manoosh_find_user_by_phone($phone);
    if (!$user) {
        $login = $phone;
        $i = 1;
        while (username_exists($login)) {
            $i++;
            $login = $phone . '_' . $i;
        }
        $user_id = wp_insert_user(array(
            'user_login'   => $login,
            'user_pass'    => wp_generate_password(20),
            'display_name' => $phone,
            'nickname'     => $phone,
            'role'         => 'customer',
        ));
        if (is_wp_error($user_id)) {
            return new WP_REST_Response(array('success' => false, 'message' => 'ساخت حساب کاربری ناموفق بود.'), 200);
        }
        update_user_meta($user_id, 'manoosh_phone', $phone);
        update_user_meta($user_id, 'billing_phone', $phone);
        $user = get_user_by('id', $user_id);
    } else {
        update_user_meta($user->ID, 'manoosh_phone', $phone);
        if (!get_user_meta($user->ID, 'billing_phone', true)) {
            update_user_meta($user->ID, 'billing_phone', $phone);
        }
    }

    if (!class_exists('WP_Application_Passwords')) {
        return new WP_REST_Response(array('success' => false, 'message' => 'نسخه وردپرس قدیمی است (حداقل ۵٫۶).'), 200);
    }
    // Rotate previous app passwords issued for the app.
    foreach (WP_Application_Passwords::get_user_application_passwords($user->ID) as $item) {
        if (isset($item['name']) && $item['name'] === 'Manoosh App') {
            WP_Application_Passwords::delete_application_password($user->ID, $item['uuid']);
        }
    }
    list($password) = WP_Application_Passwords::create_new_application_password(
        $user->ID,
        array('name' => 'Manoosh App')
    );

    return new WP_REST_Response(array(
        'success'      => true,
        'message'      => 'خوش آمدید!',
        'app_password' => $password,
        'username'     => $user->user_login,
        'user'         => array(
            'id'    => $user->ID,
            'name'  => $user->display_name ?: $phone,
            'phone' => $phone,
        ),
        'customer_id'  => $user->ID,
    ), 200);
}

function manoosh_rest_home() {
    $s = manoosh_app_settings();
    $banners = json_decode($s['banners'], true);
    if (!is_array($banners)) {
        $banners = array();
    }
    $cats = array_values(array_filter(array_map('intval', preg_split('/[\s,]+/', (string) $s['featured_cats']))));
    return new WP_REST_Response(array(
        'banners'               => array_values(array_filter($banners, function ($b) {
            return is_array($b) && !empty($b['image']);
        })),
        'featured_category_ids' => $cats,
        'amazing_title'         => $s['amazing_title'] ?: 'پیشنهاد شگفت‌انگیز',
        'amazing_hours'         => (int) ($s['amazing_hours'] ?: 24),
    ), 200);
}

function manoosh_rest_variations(WP_REST_Request $req) {
    $product_id = (int) $req->get_param('product_id');
    if (!$product_id || !function_exists('wc_get_product')) {
        return new WP_REST_Response(array(), 200);
    }
    $product = wc_get_product($product_id);
    if (!$product || !$product->is_type('variable')) {
        return new WP_REST_Response(array(), 200);
    }
    // Store API uses minor units — match it so the app formats prices consistently.
    $decimals = function_exists('wc_get_price_decimals') ? (int) wc_get_price_decimals() : 0;
    $mult = pow(10, max(0, $decimals));
    $out = array();
    foreach ($product->get_children() as $child_id) {
        $v = wc_get_product($child_id);
        if (!$v) {
            continue;
        }
        $attrs = array();
        foreach ($v->get_attributes() as $tax => $term_slug) {
            $label = function_exists('wc_attribute_label') ? wc_attribute_label($tax) : $tax;
            $term = get_term_by('slug', $term_slug, $tax);
            $attrs[] = array('name' => $label, 'option' => $term ? $term->name : $term_slug);
        }
        $img = $v->get_image_id() ? wp_get_attachment_image_url($v->get_image_id(), 'full') : '';
        $out[] = array(
            'id'            => $v->get_id(),
            'attributes'    => $attrs,
            'price'         => (string) round((float) $v->get_price() * $mult),
            'regular_price' => (string) round((float) $v->get_regular_price() * $mult),
            'sale_price'    => $v->get_sale_price() !== '' ? (string) round((float) $v->get_sale_price() * $mult) : '',
            'in_stock'      => $v->is_in_stock(),
            'sku'           => $v->get_sku(),
            'image_src'     => $img ?: '',
        );
    }
    return new WP_REST_Response($out, 200);
}

function manoosh_rest_pay_url(WP_REST_Request $req) {
    $order_id = (int) $req->get_param('id');
    if (!$order_id || !function_exists('wc_get_order')) {
        return new WP_REST_Response(array('success' => false, 'message' => 'سفارش پیدا نشد.'), 404);
    }
    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_REST_Response(array('success' => false, 'message' => 'سفارش پیدا نشد.'), 404);
    }
    $user_id = get_current_user_id();
    if ((int) $order->get_customer_id() !== (int) $user_id) {
        return new WP_REST_Response(array('success' => false, 'message' => 'دسترسی غیرمجاز.'), 403);
    }
    if (!$order->needs_payment()) {
        return new WP_REST_Response(array('success' => false, 'message' => 'این سفارش نیاز به پرداخت ندارد.'), 200);
    }
    return new WP_REST_Response(array('success' => true, 'url' => $order->get_checkout_payment_url()), 200);
}

/* -------------------------------------------------------------------------- */
/* Admin settings                                                             */
/* -------------------------------------------------------------------------- */

add_action('admin_menu', function () {
    add_menu_page(
        'اپ مانوش',
        'اپ مانوش',
        'manage_woocommerce',
        'manoosh-app',
        'manoosh_app_settings_page',
        'dashicons-smartphone',
        56
    );
});

add_action('admin_init', function () {
    register_setting('manoosh_app_group', MANOOSH_APP_OPTION);

    // Test-SMS handler.
    if (
        isset($_POST['manoosh_test_sms']) &&
        check_admin_referer('manoosh_app_test') &&
        current_user_can('manage_woocommerce')
    ) {
        $to = manoosh_normalize_phone($_POST['manoosh_test_phone'] ?? '');
        if (!manoosh_is_valid_mobile($to)) {
            add_settings_error('manoosh_app', 'manoosh_test', 'شماره تست معتبر نیست.', 'error');
        } else {
            $res = manoosh_send_otp_sms($to, '11111');
            if (!empty($res['ok'])) {
                add_settings_error('manoosh_app', 'manoosh_test', 'پیامک تست با موفقیت ارسال شد.', 'success');
            } else {
                add_settings_error('manoosh_app', 'manoosh_test', 'ارسال ناموفق: ' . ($res['error'] ?? 'unknown'), 'error');
            }
        }
    }
});

function manoosh_app_field($key, $label, $type = 'text', $desc = '') {
    $s = manoosh_app_settings();
    $value = isset($s[$key]) ? $s[$key] : '';
    echo '<tr><th scope="row"><label for="manoosh_' . esc_attr($key) . '">' . esc_html($label) . '</label></th><td>';
    if ($type === 'textarea') {
        echo '<textarea id="manoosh_' . esc_attr($key) . '" name="' . esc_attr(MANOOSH_APP_OPTION . '[' . $key . ']') . '" rows="6" cols="60" dir="ltr" style="max-width:100%">' . esc_textarea($value) . '</textarea>';
    } elseif ($type === 'select_provider') {
        $providers = array(
            'none'        => 'غیرفعال (فقط لاگ در حالت دیباگ)',
            'kavenegar'   => 'کاوه‌نگار (Kavenegar)',
            'farazsms'    => 'فراز اس‌ام‌اس / آی‌پنل (پترن)',
            'melipayamak' => 'ملی‌پیامک (پترن)',
            'ghasedak'    => 'قاصدک',
            'custom'      => 'سرویس دلخواه (URL)',
        );
        echo '<select id="manoosh_provider" name="' . esc_attr(MANOOSH_APP_OPTION . '[provider]') . '">';
        foreach ($providers as $k => $label2) {
            echo '<option value="' . esc_attr($k) . '"' . selected($s['provider'], $k, false) . '>' . esc_html($label2) . '</option>';
        }
        echo '</select>';
    } else {
        echo '<input type="' . esc_attr($type) . '" id="manoosh_' . esc_attr($key) . '" name="' . esc_attr(MANOOSH_APP_OPTION . '[' . $key . ']') . '" value="' . esc_attr($value) . '" class="regular-text" dir="ltr" />';
    }
    if ($desc) {
        echo '<p class="description">' . esc_html($desc) . '</p>';
    }
    echo '</td></tr>';
}

function manoosh_app_settings_page() {
    if (!current_user_can('manage_woocommerce')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1>تنظیمات اپ مانوش</h1>
        <?php settings_errors('manoosh_app'); ?>
        <form method="post" action="options.php">
            <?php settings_fields('manoosh_app_group'); ?>
            <h2>ورود پیامکی</h2>
            <table class="form-table">
                <?php
                manoosh_app_field('provider', 'سرویس پیامک', 'select_provider');
                manoosh_app_field('kavenegar_key', 'کلید کاوه‌نگار');
                manoosh_app_field('kavenegar_tpl', 'نام قالب کاوه‌نگار', 'text', 'مثلاً verify — باید در پنل کاوه‌نگار ساخته شده باشد.');
                manoosh_app_field('faraz_user', 'نام کاربری فراز', 'text');
                manoosh_app_field('faraz_pass', 'رمز فراز');
                manoosh_app_field('faraz_from', 'شماره فرستنده فراز');
                manoosh_app_field('faraz_pattern', 'کد پترن فراز', 'text', 'پترن باید متغیر verification-code داشته باشد.');
                manoosh_app_field('meli_user', 'نام کاربری ملی‌پیامک');
                manoosh_app_field('meli_pass', 'رمز ملی‌پیامک');
                manoosh_app_field('meli_body_id', 'کد متن (BodyId) ملی‌پیامک', 'number');
                manoosh_app_field('ghasedak_key', 'کلید قاصدک');
                manoosh_app_field('ghasedak_tpl', 'نام قالب قاصدک');
                manoosh_app_field('custom_url', 'آدرس سرویس دلخواه', 'text', 'مثال: https://sms.example.com/send?to={to}&text={code}');
                manoosh_app_field('custom_method', 'متد سرویس دلخواه', 'text', 'GET یا POST');
                manoosh_app_field('custom_header', 'هدر سرویس دلخواه', 'text', 'مثال: apikey: ABC123');
                ?>
            </table>
            <h2>صفحه اصلی اپ</h2>
            <table class="form-table">
                <?php
                manoosh_app_field('banners', 'بنرها (JSON)', 'textarea', '[{"image":"https://...","title":"...","link_type":"product|category|url","link_value":"123"}]');
                manoosh_app_field('featured_cats', 'دسته‌های ویژه', 'text', 'آی‌دی دسته‌ها با کاما، مثلاً: 12,34');
                manoosh_app_field('amazing_title', 'عنوان پیشنهاد شگفت‌انگیز');
                manoosh_app_field('amazing_hours', 'مدت جشنواره (ساعت)', 'number');
                ?>
            </table>
            <?php submit_button('ذخیره تنظیمات'); ?>
        </form>

        <hr />
        <h2>تست پیامک</h2>
        <form method="post">
            <?php wp_nonce_field('manoosh_app_test'); ?>
            <input type="text" name="manoosh_test_phone" placeholder="09123456789" dir="ltr" class="regular-text" />
            <?php submit_button('ارسال پیامک تست (کد 11111)', 'secondary', 'manoosh_test_sms', false); ?>
        </form>
    </div>
    <?php
}
