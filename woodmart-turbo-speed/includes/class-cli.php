<?php
/**
 * WP-CLI: wp wts purge|turbo|status
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_CLI
 */
class WTS_CLI {

	/**
	 * Register command.
	 */
	public static function register() {
		if ( ! class_exists( 'WP_CLI' ) ) {
			return;
		}
		WP_CLI::add_command( 'wts', __CLASS__ );
	}

	/**
	 * Purge page cache.
	 *
	 * ## EXAMPLES
	 *
	 *     wp wts purge
	 */
	public function purge() {
		$n = WTS_Cache::purge_all();
		WP_CLI::success( sprintf( 'Purged %d cache files.', $n ) );
	}

	/**
	 * Enable turbo preset.
	 *
	 * ## EXAMPLES
	 *
	 *     wp wts turbo
	 */
	public function turbo() {
		WTS_Settings::enable_turbo();
		WTS_Cache::write_config();
		WTS_Cache::install_dropin();
		WTS_Cache::ensure_wp_cache_constant( true );
		WP_CLI::success( 'Turbo preset enabled.' );
	}

	/**
	 * Show status.
	 *
	 * ## EXAMPLES
	 *
	 *     wp wts status
	 */
	public function status() {
		$stats = WTS_Cache::stats();
		WP_CLI::log( 'WoodMart: ' . ( WTS_Plugin::is_woodmart() ? 'yes' : 'no' ) );
		WP_CLI::log( 'WooCommerce: ' . ( WTS_Plugin::is_woocommerce() ? 'yes' : 'no' ) );
		WP_CLI::log( 'Page cache: ' . ( WTS_Settings::on( 'page_cache' ) ? 'on' : 'off' ) );
		WP_CLI::log( 'Drop-in: ' . ( WTS_Cache::dropin_installed() ? 'yes' : 'no' ) );
		WP_CLI::log( 'WP_CACHE: ' . ( ( defined( 'WP_CACHE' ) && WP_CACHE ) ? 'true' : 'false' ) );
		WP_CLI::log( 'Cached pages: ' . (int) $stats['files'] );
	}
}
