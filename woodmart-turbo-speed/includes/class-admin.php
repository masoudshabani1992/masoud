<?php
/**
 * Admin UI and AJAX.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Admin
 */
class WTS_Admin {

	/**
	 * Init.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'admin_init', array( __CLASS__, 'activation_redirect' ) );
		add_action( 'admin_notices', array( __CLASS__, 'notices' ) );
		add_action( 'wp_ajax_wts_save', array( __CLASS__, 'ajax_save' ) );
		add_action( 'wp_ajax_wts_turbo', array( __CLASS__, 'ajax_turbo' ) );
		add_action( 'wp_ajax_wts_purge', array( __CLASS__, 'ajax_purge' ) );
		add_action( 'wp_ajax_wts_dropin', array( __CLASS__, 'ajax_dropin' ) );
	}

	/**
	 * Menu.
	 */
	public static function menu() {
		add_menu_page(
			'WoodMart Turbo Speed',
			'توربو وودمارت',
			'manage_options',
			'woodmart-turbo-speed',
			array( __CLASS__, 'render' ),
			self::menu_icon(),
			59
		);
	}

	/**
	 * Lightning SVG menu icon.
	 *
	 * @return string
	 */
	private static function menu_icon() {
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#2ee59d" d="M13 2L4 14h7l-2 8 11-14h-7l2-6z"/></svg>';
		return 'data:image/svg+xml;base64,' . base64_encode( $svg );
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook Hook.
	 */
	public static function assets( $hook ) {
		if ( 'toplevel_page_woodmart-turbo-speed' !== $hook ) {
			return;
		}
		wp_enqueue_style(
			'wts-admin',
			WTS_URL . 'assets/css/admin.css',
			array(),
			WTS_VERSION
		);
		wp_enqueue_script(
			'wts-admin',
			WTS_URL . 'assets/js/admin.js',
			array(),
			WTS_VERSION,
			true
		);
		wp_localize_script(
			'wts-admin',
			'WTS',
			array(
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'nonce' => wp_create_nonce( 'wts_admin' ),
				'i18n'  => array(
					'saved'   => 'تنظیمات ذخیره شد',
					'turbo'   => 'حالت توربو فعال شد. کش خالی شد.',
					'purged'  => 'کش صفحه پاک شد',
					'cleaned' => 'پاکسازی دیتابیس انجام شد',
					'error'   => 'خطا. دوباره تلاش کنید.',
					'confirm' => 'حالت توربو تمام بهینه‌سازی‌های امن را روشن می‌کند. ادامه می‌دهید؟',
				),
			)
		);
	}

	/**
	 * First-run redirect.
	 */
	public static function activation_redirect() {
		if ( ! get_option( 'wts_do_activation_redirect' ) ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		delete_option( 'wts_do_activation_redirect' );
		if ( isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		wp_safe_redirect( admin_url( 'admin.php?page=woodmart-turbo-speed' ) );
		exit;
	}

	/**
	 * Admin notices on our screen only via render; keep empty globally.
	 */
	public static function notices() {
		// Notices are rendered inside the plugin screen.
	}

	/**
	 * Render page.
	 */
	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$settings = WTS_Settings::all();
		$stats    = WTS_Cache::stats();
		$counts   = WTS_Database::counts();
		$health   = self::health();
		include WTS_PATH . 'includes/views/admin-page.php';
	}

	/**
	 * Health checklist.
	 *
	 * @return array
	 */
	public static function health() {
		$conflicts = WTS_Plugin::conflicting_plugins();
		$items     = array(
			array(
				'ok'    => WTS_Plugin::is_woodmart(),
				'label' => WTS_Plugin::is_woodmart() ? 'قالب WoodMart شناسایی شد' : 'قالب WoodMart پیدا نشد — افزونه بدون قالب هم کار می‌کند',
			),
			array(
				'ok'    => WTS_Plugin::is_woocommerce(),
				'label' => WTS_Plugin::is_woocommerce() ? 'ووکامرس فعال است' : 'ووکامرس نصب نیست',
			),
			array(
				'ok'    => WTS_Settings::on( 'page_cache' ),
				'label' => WTS_Settings::on( 'page_cache' ) ? 'کش صفحه روشن است' : 'کش صفحه خاموش است',
			),
			array(
				'ok'    => defined( 'WP_CACHE' ) && WP_CACHE,
				'label' => ( defined( 'WP_CACHE' ) && WP_CACHE ) ? 'ثابت WP_CACHE در wp-config فعال است' : 'WP_CACHE در wp-config تعریف نشده — دکمه نصب Drop-in را بزنید',
			),
			array(
				'ok'    => WTS_Cache::dropin_installed(),
				'label' => WTS_Cache::dropin_installed() ? 'Drop-in کش (advanced-cache.php) نصب شده' : 'Drop-in کش نصب نشده — بیشترین تأثیر روی TTFB',
			),
			array(
				'ok'    => WTS_Settings::on( 'delay_js' ),
				'label' => WTS_Settings::on( 'delay_js' ) ? 'تأخیر جاوااسکریپت فعال است (بزرگ‌ترین جهش امتیاز PageSpeed)' : 'تأخیر جاوااسکریپت خاموش است',
			),
			array(
				'ok'    => empty( $conflicts ),
				'label' => empty( $conflicts )
					? 'افزونه کش/بهینه‌ساز تداخلی پیدا نشد'
					: ( 'افزونه تداخلی: ' . implode( '، ', $conflicts ) . ' — کش دوطرفه را همزمان روشن نکنید' ),
			),
			array(
				'ok'    => wp_using_ext_object_cache(),
				'label' => wp_using_ext_object_cache() ? 'Object Cache (Redis/Memcached) فعال است' : 'Object Cache خارجی نیست — Redis روی هاست امتیاز TTFB را بیشتر می‌کند',
			),
		);
		$score = 0;
		foreach ( $items as $item ) {
			if ( $item['ok'] ) {
				$score++;
			}
		}
		return array(
			'items' => $items,
			'score' => $score,
			'max'   => count( $items ),
			'pct'   => (int) round( ( $score / max( 1, count( $items ) ) ) * 100 ),
		);
	}

	/**
	 * Save settings AJAX.
	 */
	public static function ajax_save() {
		check_ajax_referer( 'wts_admin', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		$raw = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( is_string( $raw ) ) {
			parse_str( $raw, $raw );
		}
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		WTS_Settings::save( $raw );
		wp_send_json_success(
			array(
				'message' => 'saved',
				'health'  => self::health(),
				'stats'   => WTS_Cache::stats(),
			)
		);
	}

	/**
	 * Turbo preset.
	 */
	public static function ajax_turbo() {
		check_ajax_referer( 'wts_admin', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		WTS_Settings::enable_turbo();
		WTS_Cache::write_config();
		WTS_Cache::install_dropin();
		WTS_Cache::ensure_wp_cache_constant( true );
		WTS_Cache::purge_all();
		wp_send_json_success(
			array(
				'message'  => 'turbo',
				'settings' => WTS_Settings::all(),
				'health'   => self::health(),
			)
		);
	}

	/**
	 * Purge cache.
	 */
	public static function ajax_purge() {
		check_ajax_referer( 'wts_admin', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		$n = WTS_Cache::purge_all();
		wp_send_json_success(
			array(
				'removed' => $n,
				'stats'   => WTS_Cache::stats(),
			)
		);
	}

	/**
	 * Install drop-in + WP_CACHE.
	 */
	public static function ajax_dropin() {
		check_ajax_referer( 'wts_admin', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		$dropin = WTS_Cache::install_dropin();
		$const  = WTS_Cache::ensure_wp_cache_constant( true );
		WTS_Cache::write_config();
		wp_send_json_success(
			array(
				'dropin' => $dropin,
				'const'  => $const,
				'health' => self::health(),
			)
		);
	}

	/**
	 * Format bytes.
	 *
	 * @param int $bytes Bytes.
	 * @return string
	 */
	public static function bytes( $bytes ) {
		$bytes = (int) $bytes;
		if ( $bytes < 1024 ) {
			return $bytes . ' B';
		}
		if ( $bytes < 1048576 ) {
			return round( $bytes / 1024, 1 ) . ' KB';
		}
		return round( $bytes / 1048576, 2 ) . ' MB';
	}
}
