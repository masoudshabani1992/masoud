<?php
/**
 * Plugin bootstrap.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Plugin
 */
class WTS_Plugin {

	/**
	 * Singleton.
	 *
	 * @var WTS_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Get instance.
	 *
	 * @return WTS_Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		if ( isset( $_GET['wts_disable'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		if ( ! defined( 'WTS_ADVANCED_CACHE' ) && ! is_admin() && ! self::is_wp_cli() ) {
			WTS_Cache::maybe_serve_early();
		}

		WTS_Cleanup::init();
		WTS_Assets::init();
		WTS_Woodmart::init();
		WTS_WooCommerce::init();
		WTS_Frontend::init();
		WTS_Cache::init();
		WTS_Htaccess::init();

		if ( is_admin() ) {
			WTS_Admin::init();
			WTS_Database::init();
		}

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			require_once WTS_PATH . 'includes/class-cli.php';
			WTS_CLI::register();
		}

		add_filter( 'plugin_action_links_' . WTS_BASENAME, array( $this, 'action_links' ) );
		add_action( 'upgrader_process_complete', array( $this, 'maybe_refresh_dropin' ), 10, 2 );
	}

	/**
	 * Plugin action links.
	 *
	 * @param array $links Links.
	 * @return array
	 */
	public function action_links( $links ) {
		$url     = admin_url( 'admin.php?page=woodmart-turbo-speed' );
		$links[] = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'تنظیمات سرعت', 'woodmart-turbo-speed' ) . '</a>';
		return $links;
	}

	/**
	 * Refresh drop-in after plugin update.
	 *
	 * @param WP_Upgrader $upgrader Upgrader.
	 * @param array       $data     Data.
	 */
	public function maybe_refresh_dropin( $upgrader, $data ) {
		unset( $upgrader );
		if ( empty( $data['plugins'] ) || ! is_array( $data['plugins'] ) ) {
			return;
		}
		if ( in_array( WTS_BASENAME, $data['plugins'], true ) ) {
			WTS_Cache::install_dropin();
		}
	}

	/**
	 * Activate.
	 */
	public static function activate() {
		if ( false === get_option( 'wts_settings', false ) ) {
			add_option( 'wts_settings', WTS_Settings::defaults(), '', false );
		}
		add_option( 'wts_installed_at', time(), '', false );
		update_option( 'wts_do_activation_redirect', 1, false );

		wp_mkdir_p( WTS_CACHE_DIR . '/pages' );
		WTS_Cache::protect_cache_dir();
		WTS_Cache::write_config();
		WTS_Cache::install_dropin();
		WTS_Cache::ensure_wp_cache_constant( true );
	}

	/**
	 * Deactivate.
	 */
	public static function deactivate() {
		WTS_Cache::purge_all();
		WTS_Cache::remove_dropin();
		WTS_Cache::ensure_wp_cache_constant( false );
		WTS_Htaccess::remove_rules();
	}

	/**
	 * WP-CLI?
	 *
	 * @return bool
	 */
	public static function is_wp_cli() {
		return defined( 'WP_CLI' ) && WP_CLI;
	}

	/**
	 * Detect WoodMart.
	 *
	 * @return bool
	 */
	public static function is_woodmart() {
		if ( function_exists( 'woodmart_get_opt' ) || defined( 'WOODMART_THEME_DIR' ) || defined( 'WOODMART_VERSION' ) ) {
			return true;
		}
		$theme = wp_get_theme();
		if ( ! $theme ) {
			return false;
		}
		$slug = strtolower( (string) $theme->get_template() );
		return ( 'woodmart' === $slug );
	}

	/**
	 * Detect WooCommerce.
	 *
	 * @return bool
	 */
	public static function is_woocommerce() {
		return class_exists( 'WooCommerce' ) || defined( 'WC_PLUGIN_FILE' );
	}

	/**
	 * Conflicting cache/optimization plugins.
	 *
	 * @return string[]
	 */
	public static function conflicting_plugins() {
		$checks = array(
			'WP Rocket'          => 'WP_ROCKET_VERSION',
			'LiteSpeed Cache'    => 'LSCWP_V',
			'W3 Total Cache'     => 'W3TC_VERSION',
			'WP Super Cache'     => 'WPCACHEHOME',
			'Autoptimize'        => 'AUTOPTIMIZE_PLUGIN_VERSION',
			'FlyingPress'        => 'FLYING_PRESS_VERSION',
			'Swift Performance'  => 'SWIFT_PERFORMANCE_PLUGIN_URL',
			'SG Optimizer'       => 'SiteGround_Optimizer\\VERSION',
			'NitroPack'          => 'NITROPACK_VERSION',
			'WP Fastest Cache'   => 'WPFC_WP_PLUGIN_DIR',
			'Hummingbird'        => 'WPHB_VERSION',
			'Cache Enabler'      => 'CACHE_ENABLER_VERSION',
		);
		$found = array();
		foreach ( $checks as $label => $constant ) {
			if ( false !== strpos( $constant, '\\' ) ) {
				if ( defined( $constant ) ) {
					$found[] = $label;
				}
				continue;
			}
			if ( defined( $constant ) ) {
				$found[] = $label;
			}
		}
		if ( class_exists( 'LiteSpeed\Core' ) && ! in_array( 'LiteSpeed Cache', $found, true ) ) {
			$found[] = 'LiteSpeed Cache';
		}
		if ( class_exists( 'autoptimizeMain' ) && ! in_array( 'Autoptimize', $found, true ) ) {
			$found[] = 'Autoptimize';
		}
		return $found;
	}

	/**
	 * Front request that should never be optimized/cached.
	 *
	 * @return bool
	 */
	public static function is_excluded_request() {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return true;
		}
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return true;
		}
		if ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) {
			return true;
		}
		if ( is_feed() || is_trackback() || is_robots() || is_favicon() ) {
			return true;
		}
		if ( function_exists( 'wp_is_json_request' ) && wp_is_json_request() ) {
			return true;
		}
		if ( function_exists( 'is_preview' ) && is_preview() ) {
			return true;
		}
		if ( function_exists( 'is_customize_preview' ) && is_customize_preview() ) {
			return true;
		}
		if ( isset( $_GET['customize_changeset_uuid'] ) || isset( $_GET['preview'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return true;
		}
		$method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) : 'GET';
		if ( 'GET' !== $method && 'HEAD' !== $method ) {
			return true;
		}
		return false;
	}

	/**
	 * Sensitive WooCommerce views.
	 *
	 * @return bool
	 */
	public static function is_sensitive_page() {
		if ( ! function_exists( 'is_cart' ) ) {
			return false;
		}
		return ( is_cart() || is_checkout() || is_account_page() || is_wc_endpoint_url() );
	}
}
