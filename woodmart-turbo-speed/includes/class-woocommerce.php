<?php
/**
 * WooCommerce optimizations.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_WooCommerce
 */
class WTS_WooCommerce {

	/**
	 * Init.
	 */
	public static function init() {
		if ( ! WTS_Plugin::is_woocommerce() ) {
			add_action( 'plugins_loaded', array( __CLASS__, 'maybe_late_init' ), 20 );
			return;
		}
		self::hooks();
	}

	/**
	 * WooCommerce may load after us.
	 */
	public static function maybe_late_init() {
		if ( WTS_Plugin::is_woocommerce() ) {
			self::hooks();
		}
	}

	/**
	 * Register hooks.
	 */
	private static function hooks() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'dequeue' ), 99 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'fragments' ), 100 );
		add_action( 'wp_footer', array( __CLASS__, 'delay_fragments_loader' ), 1 );
		add_filter( 'woocommerce_enqueue_styles', array( __CLASS__, 'maybe_disable_styles' ) );
	}

	/**
	 * Dequeue unused Woo assets.
	 */
	public static function dequeue() {
		if ( is_admin() || ! function_exists( 'is_woocommerce' ) ) {
			return;
		}

		$is_woo     = is_woocommerce() || is_cart() || is_checkout() || is_account_page();
		$is_product = is_product();
		$is_checkout = is_checkout() || is_account_page();

		if ( WTS_Settings::on( 'woo_disable_blocks_css' ) ) {
			wp_dequeue_style( 'wc-blocks-style' );
			wp_dequeue_style( 'wc-blocks-vendors-style' );
			wp_dequeue_style( 'wc-blocks-style-active-filters' );
			wp_dequeue_style( 'wc-blocks-style-mini-cart' );
			wp_dequeue_style( 'wp-block-library' );
		}

		if ( WTS_Settings::on( 'woo_disable_widgets_css' ) ) {
			wp_dequeue_style( 'wc-blocks-style-product-search' );
			wp_dequeue_style( 'woocommerce-inline' );
		}

		if ( WTS_Settings::on( 'woo_disable_attribution' ) ) {
			wp_dequeue_script( 'sourcebuster-js' );
			wp_dequeue_script( 'wc-order-attribution' );
			wp_dequeue_script( 'woocommerce-order-attribution' );
		}

		if ( WTS_Settings::on( 'woo_disable_password_meter' ) && ! $is_checkout ) {
			wp_dequeue_script( 'wc-password-strength-meter' );
			wp_dequeue_script( 'password-strength-meter' );
		}

		if ( WTS_Settings::on( 'woo_disable_photoswipe_away' ) && ! $is_product ) {
			wp_dequeue_script( 'zoom' );
			wp_dequeue_script( 'flexslider' );
			wp_dequeue_script( 'photoswipe' );
			wp_dequeue_script( 'photoswipe-ui-default' );
			wp_dequeue_script( 'wc-single-product' );
			wp_dequeue_style( 'photoswipe' );
			wp_dequeue_style( 'photoswipe-default-skin' );
		}

		if ( WTS_Settings::on( 'woo_disable_select2_away' ) && ! $is_checkout && ! is_cart() ) {
			wp_dequeue_style( 'select2' );
			wp_dequeue_script( 'selectWoo' );
			wp_dequeue_script( 'select2' );
		}

		if ( WTS_Settings::on( 'woo_scripts_shop_only' ) && ! $is_woo && ! self::has_woo_shortcode() ) {
			$scripts = array(
				'woocommerce',
				'wc-add-to-cart',
				'wc-cart-fragments',
				'wc-credit-card-form',
				'wc-jquery-blockui',
				'jquery-blockui',
				'jquery-placeholder',
				'fancybox',
				'wc_price_slider',
				'wc-chosen',
				'prettyPhoto',
				'prettyPhoto-init',
				'wc-checkout',
				'wc-cart',
				'wc-add-to-cart-variation',
				'wc-single-product',
			);
			foreach ( $scripts as $handle ) {
				wp_dequeue_script( $handle );
			}

			if ( WTS_Settings::on( 'woo_disable_styles_away' ) ) {
				wp_dequeue_style( 'woocommerce-general' );
				wp_dequeue_style( 'woocommerce-layout' );
				wp_dequeue_style( 'woocommerce-smallscreen' );
				wp_dequeue_style( 'woocommerce_frontend_styles' );
			}
		}
	}

	/**
	 * Cart fragments: disable or delay.
	 */
	public static function fragments() {
		if ( is_admin() || ! function_exists( 'is_cart' ) ) {
			return;
		}
		if ( is_cart() || is_checkout() ) {
			return;
		}

		if ( WTS_Settings::on( 'woo_disable_fragments' ) ) {
			wp_dequeue_script( 'wc-cart-fragments' );
			wp_deregister_script( 'wc-cart-fragments' );
			return;
		}

		// When Delay JS is on, keep the handle so it loads in-order after jQuery.
		if ( WTS_Settings::on( 'woo_delay_fragments' ) && ! WTS_Settings::on( 'delay_js' ) ) {
			wp_dequeue_script( 'wc-cart-fragments' );
			wp_deregister_script( 'wc-cart-fragments' );
		}
	}

	/**
	 * Load cart fragments after first interaction so mini-cart still works.
	 */
	public static function delay_fragments_loader() {
		if ( is_admin() || ! WTS_Settings::on( 'woo_delay_fragments' ) || WTS_Settings::on( 'woo_disable_fragments' ) ) {
			return;
		}
		if ( WTS_Settings::on( 'delay_js' ) ) {
			return;
		}
		if ( ! function_exists( 'is_cart' ) || is_cart() || is_checkout() ) {
			return;
		}
		if ( ! wp_script_is( 'jquery', 'done' ) && ! wp_script_is( 'jquery', 'enqueued' ) && ! WTS_Settings::on( 'delay_js' ) ) {
			// jQuery may still be delayed together with everything else.
		}

		$src = '';
		if ( defined( 'WC_PLUGIN_FILE' ) ) {
			$src = plugins_url( 'assets/js/frontend/cart-fragments.min.js', WC_PLUGIN_FILE );
		}
		if ( ! $src ) {
			return;
		}

		$src = esc_url( $src );
		echo "<script id='wts-delay-fragments'>(function(){var done=false;function load(){if(done)return;done=true;var s=document.createElement('script');s.src='{$src}';s.defer=true;document.body.appendChild(s);}['keydown','mousemove','touchstart','scroll','click'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true});});})();</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Optionally remove Woo storefront CSS completely off-shop.
	 *
	 * @param array $styles Styles.
	 * @return array
	 */
	public static function maybe_disable_styles( $styles ) {
		if ( ! WTS_Settings::on( 'woo_disable_styles_away' ) || is_admin() ) {
			return $styles;
		}
		if ( ! function_exists( 'is_woocommerce' ) ) {
			return $styles;
		}
		if ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() || self::has_woo_shortcode() ) {
			return $styles;
		}
		return array();
	}

	/**
	 * Detect Woo shortcodes/blocks in the main post.
	 *
	 * @return bool
	 */
	private static function has_woo_shortcode() {
		if ( ! is_singular() ) {
			return false;
		}
		$post = get_post();
		if ( ! $post ) {
			return false;
		}
		$hay = $post->post_content;
		$needles = array(
			'[products',
			'[product ',
			'[add_to_cart',
			'[woocommerce',
			'[shop',
			'wp:woocommerce',
			'wd-products',
			'woodmart_products',
		);
		foreach ( $needles as $n ) {
			if ( false !== strpos( $hay, $n ) ) {
				return true;
			}
		}
		return false;
	}
}
