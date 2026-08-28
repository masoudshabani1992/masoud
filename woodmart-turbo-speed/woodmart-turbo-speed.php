<?php
/**
 * Plugin Name:       WoodMart Turbo Speed
 * Plugin URI:        https://github.com/masoudshabani1992/masoud
 * Description:       افزایش شدید سرعت لود سایت‌های وردپرسی با قالب WoodMart و ووکامرس. کش صفحه، تأخیر جاوااسکریپت، بهینه‌سازی دارایی‌ها و پاکسازی بloat قالب.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Masoud
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       woodmart-turbo-speed
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'WTS_VERSION', '1.0.0' );
define( 'WTS_FILE', __FILE__ );
define( 'WTS_PATH', plugin_dir_path( __FILE__ ) );
define( 'WTS_URL', plugin_dir_url( __FILE__ ) );
define( 'WTS_BASENAME', plugin_basename( __FILE__ ) );
define( 'WTS_CACHE_DIR', WP_CONTENT_DIR . '/cache/wts' );

require_once WTS_PATH . 'includes/class-settings.php';
require_once WTS_PATH . 'includes/class-cache.php';
require_once WTS_PATH . 'includes/class-cleanup.php';
require_once WTS_PATH . 'includes/class-assets.php';
require_once WTS_PATH . 'includes/class-woodmart.php';
require_once WTS_PATH . 'includes/class-woocommerce.php';
require_once WTS_PATH . 'includes/class-frontend.php';
require_once WTS_PATH . 'includes/class-database.php';
require_once WTS_PATH . 'includes/class-htaccess.php';
require_once WTS_PATH . 'includes/class-admin.php';
require_once WTS_PATH . 'includes/class-plugin.php';

register_activation_hook( __FILE__, array( 'WTS_Plugin', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'WTS_Plugin', 'deactivate' ) );

add_action(
	'plugins_loaded',
	static function () {
		WTS_Plugin::instance();
	},
	0
);
