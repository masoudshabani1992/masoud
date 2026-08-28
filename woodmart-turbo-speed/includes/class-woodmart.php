<?php
/**
 * WoodMart-specific optimizations.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Woodmart
 */
class WTS_Woodmart {

	/**
	 * Init.
	 */
	public static function init() {
		add_action( 'wp', array( __CLASS__, 'boot' ), 1 );
		add_filter( 'woodmart_option', array( __CLASS__, 'force_options' ), 20, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'dequeue' ), 10000 );
		add_action( 'wp_head', array( __CLASS__, 'inline_css' ), 40 );
	}

	/**
	 * Extra filters once WP is ready.
	 */
	public static function boot() {
		if ( ! WTS_Plugin::is_woodmart() ) {
			return;
		}

		if ( WTS_Settings::on( 'woodmart_disable_gfonts' ) ) {
			add_filter( 'woodmart_preload_gfonts', '__return_false' );
			add_filter( 'woodmart_enqueue_google_fonts', '__return_false' );
		}

		if ( WTS_Settings::on( 'woodmart_elementor_opt' ) ) {
			add_filter( 'woodmart_enqueue_elementor_optimized_css', '__return_true' );
			add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );
		}

		if ( WTS_Settings::on( 'woodmart_disable_wp_lazy_conflict' ) && WTS_Settings::on( 'delay_js' ) ) {
			add_filter( 'wp_lazy_loading_enabled', '__return_true' );
		}
	}

	/**
	 * Override WoodMart theme options related to performance.
	 *
	 * @param mixed  $value Value.
	 * @param string $slug  Option slug.
	 * @return mixed
	 */
	public static function force_options( $value, $slug ) {
		if ( WTS_Settings::on( 'woodmart_force_minified' ) ) {
			if ( in_array( $slug, array( 'minified_css', 'minified_js', 'include_minified_css', 'include_minified_js' ), true ) ) {
				return true;
			}
			if ( in_array( $slug, array( 'combined_css', 'combined_js', 'combine_js', 'combine_css' ), true ) ) {
				return false;
			}
		}

		if ( WTS_Settings::on( 'woodmart_disable_gfonts' ) ) {
			if ( in_array( $slug, array( 'google_font', 'load_google_fonts', 'google_fonts' ), true ) ) {
				return is_array( $value ) ? array() : '';
			}
		}

		if ( WTS_Settings::on( 'woodmart_disable_preloader' ) ) {
			if ( in_array( $slug, array( 'preloader', 'site_preloader', 'ajax_preloader' ), true ) ) {
				return false;
			}
		}

		if ( WTS_Settings::on( 'woodmart_disable_animations' ) ) {
			if ( in_array( $slug, array( 'animations', 'css_animation', 'page_transitions' ), true ) ) {
				return false;
			}
		}

		if ( WTS_Settings::on( 'disable_jquery_migrate' ) && 'remove_jquery_migrate' === $slug ) {
			return true;
		}

		return $value;
	}

	/**
	 * Dequeue WoodMart assets that are not needed on the current view.
	 */
	public static function dequeue() {
		if ( is_admin() || ! WTS_Plugin::is_woodmart() ) {
			return;
		}

		if ( WTS_Settings::on( 'woodmart_disable_gfonts' ) ) {
			$fonts = array(
				'woodmart-google-fonts',
				'wd-google-fonts',
				'woodmart-font',
				'woodmart-child-google-fonts',
				'google-fonts-1',
				'woodmart_google_font',
			);
			foreach ( $fonts as $handle ) {
				wp_dequeue_style( $handle );
				wp_deregister_style( $handle );
			}
		}

		if ( ! WTS_Settings::on( 'woodmart_product_only_scripts' ) ) {
			return;
		}

		$is_product = function_exists( 'is_product' ) && is_product();
		$is_shop    = function_exists( 'is_shop' ) && ( is_shop() || is_product_category() || is_product_tag() || is_product_taxonomy() );

		if ( ! $is_product ) {
			$product_scripts = array(
				'photoswipe',
				'photoswipe-ui-default',
				'photoswipe-default-skin',
				'zoom',
				'flexslider',
				'threesixty',
				'woodmart-threesixty',
				'wc-single-product',
				'prettyPhoto',
				'prettyPhoto-init',
				'jquery-zoom',
			);
			foreach ( $product_scripts as $handle ) {
				wp_dequeue_script( $handle );
				wp_dequeue_style( $handle );
			}
			wp_dequeue_style( 'photoswipe' );
			wp_dequeue_style( 'photoswipe-default-skin' );
		}

		if ( ! $is_product && ! $is_shop ) {
			wp_dequeue_script( 'wc-add-to-cart-variation' );
		}
	}

	/**
	 * Tiny CSS overrides that skip heavy visual extras.
	 */
	public static function inline_css() {
		if ( is_admin() || ! WTS_Plugin::is_woodmart() ) {
			return;
		}

		$css = '';
		if ( WTS_Settings::on( 'woodmart_disable_preloader' ) ) {
			$css .= '.wd-loader-overlay,.woodmart-preloader,.wd-page-loader,.xts-loader{display:none!important;opacity:0!important;visibility:hidden!important;}';
			$css .= 'html.wd-loading,body.wd-loading,body.website-loading{overflow:visible!important;}';
		}
		if ( WTS_Settings::on( 'woodmart_disable_animations' ) ) {
			$css .= '*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important;}';
		}

		if ( '' !== $css ) {
			echo '<style id="wts-woodmart-css">' . $css . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}
}
