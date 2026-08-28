<?php
/**
 * Script and style optimization.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Assets
 */
class WTS_Assets {

	/**
	 * Init.
	 */
	public static function init() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'dequeue' ), 9999 );
		add_action( 'wp_print_scripts', array( __CLASS__, 'dequeue_late' ), 100 );
		add_filter( 'script_loader_tag', array( __CLASS__, 'script_loader_tag' ), 10, 3 );
		add_filter( 'style_loader_tag', array( __CLASS__, 'style_loader_tag' ), 10, 4 );
		add_filter( 'style_loader_src', array( __CLASS__, 'strip_ver' ), 15, 2 );
		add_filter( 'script_loader_src', array( __CLASS__, 'strip_ver' ), 15, 2 );
		add_action( 'wp_head', array( __CLASS__, 'head_hints' ), 1 );
		add_action( 'wp_head', array( __CLASS__, 'critical_css' ), 2 );
		add_action( 'wp_footer', array( __CLASS__, 'speculation_rules' ), 99 );
	}

	/**
	 * Dequeue unused assets.
	 */
	public static function dequeue() {
		if ( is_admin() ) {
			return;
		}

		if ( WTS_Settings::on( 'disable_dashicons' ) && ! is_user_logged_in() ) {
			wp_dequeue_style( 'dashicons' );
			wp_deregister_style( 'dashicons' );
		}

		if ( WTS_Settings::on( 'disable_gutenberg_css' ) ) {
			wp_dequeue_style( 'wp-block-library' );
			wp_dequeue_style( 'wp-block-library-theme' );
			wp_dequeue_style( 'wc-blocks-style' );
			wp_dequeue_style( 'wc-blocks-vendors-style' );
			wp_dequeue_style( 'global-styles' );
			wp_dequeue_style( 'classic-theme-styles' );
			wp_dequeue_style( 'wp-webfonts' );
		}

		if ( WTS_Settings::on( 'disable_comments_assets' ) ) {
			if ( ! is_singular() || ! comments_open() || ! get_option( 'thread_comments' ) ) {
				wp_dequeue_script( 'comment-reply' );
			}
		}

		if ( WTS_Settings::on( 'disable_google_fonts' ) ) {
			self::dequeue_google_fonts();
		}

		if ( WTS_Settings::on( 'woodmart_disable_cf7_assets' ) && function_exists( 'wpcf7_enqueue_scripts' ) ) {
			if ( ! self::content_has( array( '[contact-form-7', 'wpcf7-form', 'wpcf7' ) ) ) {
				add_filter( 'wpcf7_load_js', '__return_false' );
				add_filter( 'wpcf7_load_css', '__return_false' );
				wp_dequeue_script( 'contact-form-7' );
				wp_dequeue_style( 'contact-form-7' );
			}
		}
	}

	/**
	 * Extra dequeue after prints start.
	 */
	public static function dequeue_late() {
		if ( is_admin() ) {
			return;
		}
		if ( WTS_Settings::on( 'disable_embeds' ) ) {
			wp_dequeue_script( 'wp-embed' );
		}
	}

	/**
	 * Add defer unless delayed / excluded.
	 *
	 * @param string $tag    Tag.
	 * @param string $handle Handle.
	 * @param string $src    Src.
	 * @return string
	 */
	public static function script_loader_tag( $tag, $handle, $src ) {
		unset( $src );
		if ( is_admin() || ! WTS_Settings::on( 'defer_js' ) || WTS_Settings::on( 'delay_js' ) ) {
			return $tag;
		}
		if ( WTS_Plugin::is_sensitive_page() ) {
			return $tag;
		}
		$skip = array( 'jquery', 'jquery-core', 'jquery-migrate', 'wc-checkout', 'wc-password-strength-meter', 'stripe', 'woocommerce-tokenization-form' );
		if ( in_array( $handle, $skip, true ) ) {
			return $tag;
		}
		if ( false !== strpos( $tag, ' defer' ) || false !== strpos( $tag, ' async' ) ) {
			return $tag;
		}
		return str_replace( ' src', ' defer src', $tag );
	}

	/**
	 * Font-display swap on Google Fonts CSS.
	 *
	 * @param string $tag    Tag.
	 * @param string $handle Handle.
	 * @param string $href   Href.
	 * @param string $media  Media.
	 * @return string
	 */
	public static function style_loader_tag( $tag, $handle, $href, $media ) {
		unset( $handle, $media );
		if ( WTS_Settings::on( 'disable_google_fonts' ) && self::is_google_font_url( $href ) ) {
			return '';
		}
		if ( WTS_Settings::on( 'font_display_swap' ) && self::is_google_font_url( $href ) && false === strpos( $href, 'display=' ) ) {
			$href_new = add_query_arg( 'display', 'swap', $href );
			$tag      = str_replace( $href, esc_url( $href_new ), $tag );
		}
		return $tag;
	}

	/**
	 * Strip ?ver= query strings from static files.
	 *
	 * @param string $src    Src.
	 * @param string $handle Handle.
	 * @return string
	 */
	public static function strip_ver( $src, $handle ) {
		unset( $handle );
		if ( is_admin() || ! WTS_Settings::on( 'remove_query_strings' ) || ! is_string( $src ) ) {
			return $src;
		}
		if ( false === strpos( $src, 'ver=' ) ) {
			return $src;
		}
		return remove_query_arg( 'ver', $src );
	}

	/**
	 * Resource hints + font preloads.
	 */
	public static function head_hints() {
		if ( is_admin() ) {
			return;
		}

		$preloads = WTS_Settings::get( 'preload_fonts', '' );
		if ( $preloads ) {
			foreach ( array_filter( array_map( 'trim', explode( "\n", (string) $preloads ) ) ) as $url ) {
				$url = esc_url( $url );
				if ( ! $url ) {
					continue;
				}
				$type = 'font/woff2';
				if ( preg_match( '/\.woff($|\?)/i', $url ) && ! preg_match( '/woff2/i', $url ) ) {
					$type = 'font/woff';
				}
				echo '<link rel="preload" as="font" type="' . esc_attr( $type ) . '" href="' . $url . '" crossorigin>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
		}

		if ( ! WTS_Settings::on( 'disable_google_fonts' ) && ! WTS_Settings::on( 'woodmart_disable_gfonts' ) ) {
			echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
			echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
		}

		echo '<link rel="dns-prefetch" href="//www.google-analytics.com">' . "\n";
		echo '<link rel="dns-prefetch" href="//www.googletagmanager.com">' . "\n";
	}

	/**
	 * Critical CSS.
	 */
	public static function critical_css() {
		$css = trim( (string) WTS_Settings::get( 'critical_css', '' ) );
		if ( '' === $css ) {
			return;
		}
		echo '<style id="wts-critical-css">' . $css . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Speculation Rules API — prerender on hover/moderate eagerness.
	 */
	public static function speculation_rules() {
		if ( ! WTS_Settings::on( 'speculation_rules' ) || is_admin() ) {
			return;
		}
		$rules = array(
			'prerender' => array(
				array(
					'source'    => 'document',
					'where'     => array(
						'and' => array(
							array( 'href_matches' => '/*' ),
							array(
								'not' => array(
									'href_matches' => array(
										'/cart*',
										'/checkout*',
										'/my-account*',
										'/wp-admin/*',
										'/wp-login.php*',
									),
								),
							),
							array(
								'not' => array(
									'selector_matches' => '[rel~="nofollow"], [download], [target="_blank"]',
								),
							),
						),
					),
					'eagerness' => 'moderate',
				),
			),
		);
		echo '<script type="speculationrules">' . wp_json_encode( $rules ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Google font URL?
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	public static function is_google_font_url( $url ) {
		return is_string( $url ) && ( false !== strpos( $url, 'fonts.googleapis.com' ) || false !== strpos( $url, 'fonts.gstatic.com' ) );
	}

	/**
	 * Drop registered Google Font styles.
	 */
	private static function dequeue_google_fonts() {
		global $wp_styles;
		if ( empty( $wp_styles ) || empty( $wp_styles->registered ) ) {
			return;
		}
		foreach ( $wp_styles->registered as $handle => $obj ) {
			$src = isset( $obj->src ) ? (string) $obj->src : '';
			if ( self::is_google_font_url( $src ) ) {
				wp_dequeue_style( $handle );
				wp_deregister_style( $handle );
			}
		}
	}

	/**
	 * Cheap content scan for shortcodes.
	 *
	 * @param string[] $needles Needles.
	 * @return bool
	 */
	private static function content_has( $needles ) {
		if ( ! is_singular() ) {
			return false;
		}
		$post = get_post();
		if ( ! $post ) {
			return false;
		}
		$hay = $post->post_content . ' ' . (string) $post->post_excerpt;
		foreach ( $needles as $n ) {
			if ( false !== strpos( $hay, $n ) ) {
				return true;
			}
		}
		return false;
	}
}
