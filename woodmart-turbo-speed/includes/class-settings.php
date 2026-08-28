<?php
/**
 * Settings storage.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Settings
 */
class WTS_Settings {

	const OPTION = 'wts_settings';

	/**
	 * Runtime cache.
	 *
	 * @var array|null
	 */
	private static $cache = null;

	/**
	 * Default settings. Toggles are 0/1.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'page_cache'                       => 1,
			'cache_mobile'                     => 1,
			'cache_ttl'                        => 43200,
			'cache_query'                      => 0,
			'cache_logged_out_only'            => 1,

			'delay_js'                         => 1,
			'delay_js_timeout'                 => 0,
			'delay_js_excludes'                => "js.stripe.com\nstripe.network\npaypal.com\ngoogle.com/recaptcha\nrecaptcha\nsquareup\namazon-pay\napple-pay",
			'defer_js'                         => 1,
			'minify_html'                      => 1,
			'lazyload'                         => 1,
			'fetchpriority'                    => 1,
			'remove_query_strings'             => 1,
			'font_display_swap'                => 1,
			'disable_google_fonts'             => 0,
			'critical_css'                     => '',
			'preload_fonts'                    => '',
			'speculation_rules'                => 1,

			'disable_emojis'                   => 1,
			'disable_embeds'                   => 1,
			'disable_jquery_migrate'           => 1,
			'disable_dashicons'                => 1,
			'disable_gutenberg_css'            => 1,
			'disable_xmlrpc'                   => 1,
			'clean_head'                       => 1,
			'heartbeat'                        => 1,
			'limit_revisions'                  => 1,
			'revisions_to_keep'                => 3,
			'disable_rss'                      => 0,
			'disable_comments_assets'          => 1,
			'autosave_interval'                => 1,

			'woodmart_disable_gfonts'          => 1,
			'woodmart_force_minified'          => 1,
			'woodmart_disable_preloader'       => 1,
			'woodmart_disable_animations'      => 0,
			'woodmart_elementor_opt'           => 1,
			'woodmart_disable_cf7_assets'      => 0,
			'woodmart_product_only_scripts'    => 1,
			'woodmart_disable_wp_lazy_conflict' => 1,

			'woo_delay_fragments'              => 1,
			'woo_disable_fragments'            => 0,
			'woo_conditional_assets'           => 1,
			'woo_disable_blocks_css'           => 1,
			'woo_scripts_shop_only'            => 0,
			'woo_disable_password_meter'       => 1,
			'woo_disable_photoswipe_away'      => 1,
			'woo_disable_select2_away'         => 1,
			'woo_disable_styles_away'          => 0,
			'woo_disable_widgets_css'          => 1,
			'woo_disable_attribution'          => 1,

			'htaccess_browser_cache'           => 0,
			'htaccess_gzip'                    => 0,

			'skip_uris'                        => '',
		);
	}

	/**
	 * Settings enabled by the one-click turbo preset.
	 *
	 * @return string[]
	 */
	public static function turbo_keys() {
		return array(
			'page_cache',
			'cache_mobile',
			'delay_js',
			'defer_js',
			'minify_html',
			'lazyload',
			'fetchpriority',
			'remove_query_strings',
			'font_display_swap',
			'speculation_rules',
			'disable_emojis',
			'disable_embeds',
			'disable_jquery_migrate',
			'disable_dashicons',
			'disable_gutenberg_css',
			'disable_xmlrpc',
			'clean_head',
			'heartbeat',
			'limit_revisions',
			'disable_comments_assets',
			'autosave_interval',
			'woodmart_disable_gfonts',
			'woodmart_force_minified',
			'woodmart_disable_preloader',
			'woodmart_elementor_opt',
			'woodmart_product_only_scripts',
			'woodmart_disable_wp_lazy_conflict',
			'woo_delay_fragments',
			'woo_conditional_assets',
			'woo_disable_blocks_css',
			'woo_disable_password_meter',
			'woo_disable_photoswipe_away',
			'woo_disable_select2_away',
			'woo_disable_widgets_css',
			'woo_disable_attribution',
		);
	}

	/**
	 * All settings with defaults applied.
	 *
	 * @return array
	 */
	public static function all() {
		if ( null === self::$cache ) {
			$stored      = get_option( self::OPTION, array() );
			self::$cache = wp_parse_args( is_array( $stored ) ? $stored : array(), self::defaults() );
			self::$cache = apply_filters( 'wts_settings', self::$cache );
		}
		return self::$cache;
	}

	/**
	 * Get one setting.
	 *
	 * @param string $key     Setting key.
	 * @param mixed  $default Default.
	 * @return mixed
	 */
	public static function get( $key, $default = null ) {
		$all = self::all();
		if ( array_key_exists( $key, $all ) ) {
			return $all[ $key ];
		}
		return $default;
	}

	/**
	 * Whether a toggle is on.
	 *
	 * @param string $key Setting key.
	 * @return bool
	 */
	public static function on( $key ) {
		return ! empty( self::get( $key ) );
	}

	/**
	 * Reset runtime cache.
	 */
	public static function flush_runtime() {
		self::$cache = null;
	}

	/**
	 * Persist settings.
	 *
	 * @param array $input Raw input.
	 * @return array
	 */
	public static function save( $input ) {
		$clean    = self::sanitize( $input );
		$previous = get_option( self::OPTION, array() );
		update_option( self::OPTION, $clean, false );
		self::$cache = $clean;
		do_action( 'wts_settings_saved', $clean, is_array( $previous ) ? $previous : array() );
		return $clean;
	}

	/**
	 * Enable the turbo preset (keeps textareas and numeric fields).
	 *
	 * @return array
	 */
	public static function enable_turbo() {
		$current = self::all();
		foreach ( self::turbo_keys() as $key ) {
			$current[ $key ] = 1;
		}
		$current['cache_ttl']          = max( 3600, (int) $current['cache_ttl'] );
		$current['revisions_to_keep']  = 3;
		$current['delay_js_timeout']   = 0;
		return self::save( $current );
	}

	/**
	 * Sanitize incoming settings.
	 *
	 * @param array $input Raw.
	 * @return array
	 */
	public static function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			$input = array();
		}
		$defaults = self::defaults();
		$out      = array();

		$integers = array(
			'cache_ttl'          => array( 300, 604800 ),
			'delay_js_timeout'   => array( 0, 60 ),
			'revisions_to_keep'  => array( 1, 20 ),
		);

		$textareas = array( 'delay_js_excludes', 'critical_css', 'preload_fonts', 'skip_uris' );

		foreach ( $defaults as $key => $default ) {
			if ( isset( $integers[ $key ] ) ) {
				$val           = isset( $input[ $key ] ) ? (int) $input[ $key ] : (int) $default;
				$out[ $key ]   = min( $integers[ $key ][1], max( $integers[ $key ][0], $val ) );
				continue;
			}
			if ( in_array( $key, $textareas, true ) ) {
				$raw         = isset( $input[ $key ] ) ? (string) $input[ $key ] : (string) $default;
				$out[ $key ] = self::sanitize_textarea( $key, $raw );
				continue;
			}
			$out[ $key ] = empty( $input[ $key ] ) ? 0 : 1;
		}

		return $out;
	}

	/**
	 * Sanitize textarea fields.
	 *
	 * @param string $key Field key.
	 * @param string $raw Raw value.
	 * @return string
	 */
	private static function sanitize_textarea( $key, $raw ) {
		if ( 'critical_css' === $key ) {
			$raw = wp_kses( $raw, array() );
			$raw = str_replace( array( '</style', '<script', '<?' ), '', $raw );
			return trim( $raw );
		}
		$raw   = str_replace( array( "\r\n", "\r" ), "\n", $raw );
		$lines = array_filter( array_map( 'trim', explode( "\n", $raw ) ) );
		$lines = array_map( 'sanitize_text_field', $lines );
		return implode( "\n", $lines );
	}

	/**
	 * Delay JS exclude keywords.
	 *
	 * @return string[]
	 */
	public static function delay_excludes() {
		$raw = self::get( 'delay_js_excludes', '' );
		$arr = array_filter( array_map( 'trim', explode( "\n", (string) $raw ) ) );
		return apply_filters( 'wts_delay_js_excludes', $arr );
	}

	/**
	 * Extra skip URI fragments.
	 *
	 * @return string[]
	 */
	public static function skip_uris() {
		$raw = self::get( 'skip_uris', '' );
		return array_filter( array_map( 'trim', explode( "\n", (string) $raw ) ) );
	}
}
