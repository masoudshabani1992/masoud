<?php
/**
 * File-based page cache.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Cache
 */
class WTS_Cache {

	/**
	 * Init hooks.
	 */
	public static function init() {
		add_action( 'send_headers', array( __CLASS__, 'miss_header' ) );
		add_action( 'wts_settings_saved', array( __CLASS__, 'on_settings_saved' ) );
		add_action( 'save_post', array( __CLASS__, 'purge_all' ) );
		add_action( 'deleted_post', array( __CLASS__, 'purge_all' ) );
		add_action( 'trashed_post', array( __CLASS__, 'purge_all' ) );
		add_action( 'switch_theme', array( __CLASS__, 'purge_all' ) );
		add_action( 'wp_update_nav_menu', array( __CLASS__, 'purge_all' ) );
		add_action( 'comment_post', array( __CLASS__, 'purge_all' ) );
		add_action( 'woocommerce_update_product', array( __CLASS__, 'purge_all' ) );
		add_action( 'woocommerce_product_set_stock', array( __CLASS__, 'purge_all' ) );
		add_action( 'woocommerce_variation_set_stock', array( __CLASS__, 'purge_all' ) );
		add_action( 'update_option_permalink_structure', array( __CLASS__, 'purge_all' ) );
		add_action( 'activated_plugin', array( __CLASS__, 'purge_all' ) );
		add_action( 'deactivated_plugin', array( __CLASS__, 'purge_all' ) );
		add_action( 'customize_save_after', array( __CLASS__, 'purge_all' ) );
	}

	/**
	 * Debug header on a generated (uncached) response.
	 */
	public static function miss_header() {
		if ( is_admin() || headers_sent() || ! WTS_Settings::on( 'page_cache' ) ) {
			return;
		}
		header( 'X-WTS-Cache: MISS' );
	}

	/**
	 * After settings change.
	 */
	public static function on_settings_saved() {
		self::write_config();
		if ( WTS_Settings::on( 'page_cache' ) ) {
			self::install_dropin();
			self::ensure_wp_cache_constant( true );
		} else {
			self::remove_dropin();
			self::ensure_wp_cache_constant( false );
		}
		self::purge_all();
	}

	/**
	 * Serve cache from the plugin (fallback if drop-in is missing).
	 */
	public static function maybe_serve_early() {
		if ( is_admin() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
			return;
		}
		if ( ! WTS_Settings::on( 'page_cache' ) ) {
			return;
		}
		if ( function_exists( 'wts_ac_try_serve' ) ) {
			wts_ac_try_serve();
			return;
		}
		$dropin = WTS_PATH . 'drop-ins/advanced-cache.php';
		if ( is_readable( $dropin ) ) {
			include $dropin;
		}
	}

	/**
	 * Should this response be stored?
	 *
	 * @return bool
	 */
	public static function should_store() {
		if ( ! WTS_Settings::on( 'page_cache' ) ) {
			return false;
		}
		if ( WTS_Plugin::is_excluded_request() ) {
			return false;
		}
		if ( is_user_logged_in() ) {
			return false;
		}
		if ( is_search() || is_404() || is_feed() ) {
			return false;
		}
		if ( defined( 'DONOTCACHEPAGE' ) && DONOTCACHEPAGE ) {
			return false;
		}
		if ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) ) {
			return false;
		}
		if ( ! empty( $_COOKIE['woocommerce_items_in_cart'] ) && '0' !== (string) $_COOKIE['woocommerce_items_in_cart'] ) {
			return false;
		}
		if ( function_exists( 'is_product' ) && isset( $_GET['add-to-cart'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return false;
		}
		$code = http_response_code();
		if ( $code && 200 !== (int) $code ) {
			return false;
		}
		return (bool) apply_filters( 'wts_should_cache', true );
	}

	/**
	 * Persist HTML to disk.
	 *
	 * @param string $html HTML.
	 */
	public static function store( $html ) {
		if ( ! self::should_store() ) {
			return;
		}
		if ( ! is_string( $html ) || strlen( $html ) < 512 ) {
			return;
		}
		if ( false === stripos( $html, '<html' ) ) {
			return;
		}

		$key  = self::cache_key();
		$dir  = WTS_CACHE_DIR . '/pages/' . substr( $key, 0, 2 );
		wp_mkdir_p( $dir );
		self::protect_cache_dir();

		$file = $dir . '/' . $key . '.html';
		$tmp  = $file . '.' . wp_generate_password( 6, false ) . '.tmp';

		$marker = "\n<!-- WTS cache " . gmdate( 'c' ) . " -->";
		$html  .= $marker;

		if ( false === file_put_contents( $tmp, $html, LOCK_EX ) ) {
			return;
		}
		@rename( $tmp, $file );

		if ( function_exists( 'gzencode' ) ) {
			$gz = gzencode( $html, 6 );
			if ( is_string( $gz ) ) {
				file_put_contents( $file . '.gz', $gz, LOCK_EX );
			}
		}
	}

	/**
	 * Cache key matching the drop-in.
	 *
	 * @return string
	 */
	public static function cache_key() {
		$host      = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( (string) $_SERVER['HTTP_HOST'] ) : 'localhost';
		$uri       = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '/';
		$https     = self::is_ssl_request() ? 's' : 'h';
		$is_mobile = WTS_Settings::on( 'cache_mobile' ) && self::is_mobile();
		return md5( $host . '|' . $uri . '|' . $https . '|' . ( $is_mobile ? 'm' : 'd' ) );
	}

	/**
	 * HTTPS check identical to the drop-in (do not use is_ssl()).
	 *
	 * @return bool
	 */
	public static function is_ssl_request() {
		if ( ! empty( $_SERVER['HTTPS'] ) && 'off' !== strtolower( (string) $_SERVER['HTTPS'] ) ) {
			return true;
		}
		if ( isset( $_SERVER['SERVER_PORT'] ) && '443' === (string) $_SERVER['SERVER_PORT'] ) {
			return true;
		}
		if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && 'https' === strtolower( (string) $_SERVER['HTTP_X_FORWARDED_PROTO'] ) ) {
			return true;
		}
		return false;
	}

	/**
	 * Mobile UA (must match drop-in).
	 *
	 * @return bool
	 */
	public static function is_mobile() {
		$ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
		if ( '' === $ua ) {
			return false;
		}
		return (bool) preg_match( '/Mobile|Android|Silk\/|Kindle|BlackBerry|Opera Mini|Opera Mobi|webOS|iPhone|iPad|iPod/i', $ua );
	}

	/**
	 * Write drop-in config.
	 */
	public static function write_config() {
		wp_mkdir_p( WTS_CACHE_DIR );
		self::protect_cache_dir();

		$skip = self::default_skip_uris();
		$skip = array_merge( $skip, WTS_Settings::skip_uris() );
		$skip = array_values( array_unique( array_filter( $skip ) ) );

		$config = array(
			'enabled'      => WTS_Settings::on( 'page_cache' ),
			'ttl'          => (int) WTS_Settings::get( 'cache_ttl', 43200 ),
			'cache_mobile' => WTS_Settings::on( 'cache_mobile' ),
			'cache_query'  => WTS_Settings::on( 'cache_query' ),
			'skip_uris'    => $skip,
		);

		$export = "<?php\nreturn " . var_export( $config, true ) . ";\n";
		file_put_contents( WTS_CACHE_DIR . '/config.php', $export, LOCK_EX );
	}

	/**
	 * WooCommerce + WP skip paths.
	 *
	 * @return string[]
	 */
	public static function default_skip_uris() {
		$skip = array(
			'/cart',
			'/checkout',
			'/my-account',
			'/basket',
			'/wc-api/',
			'/wp-login',
			'/order-pay',
			'/add-to-cart',
			'/lost-password',
			'/view-order',
		);

		if ( function_exists( 'wc_get_page_permalink' ) ) {
			foreach ( array( 'cart', 'checkout', 'myaccount' ) as $id ) {
				$url  = wc_get_page_permalink( $id );
				$path = wp_parse_url( (string) $url, PHP_URL_PATH );
				if ( is_string( $path ) && '/' !== $path && '' !== $path ) {
					$skip[] = untrailingslashit( $path );
				}
			}
		}

		return $skip;
	}

	/**
	 * Lock down the cache directory.
	 */
	public static function protect_cache_dir() {
		wp_mkdir_p( WTS_CACHE_DIR . '/pages' );
		$ht = WTS_CACHE_DIR . '/.htaccess';
		if ( ! file_exists( $ht ) ) {
			file_put_contents( $ht, "Deny from all\n", LOCK_EX );
		}
		foreach ( array( WTS_CACHE_DIR, WTS_CACHE_DIR . '/pages' ) as $dir ) {
			$index = $dir . '/index.php';
			if ( ! file_exists( $index ) ) {
				file_put_contents( $index, "<?php\n// Silence is golden.\n", LOCK_EX );
			}
		}
	}

	/**
	 * Install advanced-cache.php.
	 *
	 * @return bool
	 */
	public static function install_dropin() {
		$src  = WTS_PATH . 'drop-ins/advanced-cache.php';
		$dest = WP_CONTENT_DIR . '/advanced-cache.php';
		if ( ! is_readable( $src ) ) {
			return false;
		}
		if ( file_exists( $dest ) && is_readable( $dest ) ) {
			$existing = file_get_contents( $dest );
			if ( is_string( $existing ) && false === strpos( $existing, 'WTS_ADVANCED_CACHE' ) && strlen( trim( $existing ) ) > 0 ) {
				return false;
			}
		}
		return (bool) copy( $src, $dest );
	}

	/**
	 * Remove our drop-in only.
	 *
	 * @return bool
	 */
	public static function remove_dropin() {
		$dest = WP_CONTENT_DIR . '/advanced-cache.php';
		if ( ! file_exists( $dest ) || ! is_readable( $dest ) ) {
			return true;
		}
		$existing = file_get_contents( $dest );
		if ( ! is_string( $existing ) || false === strpos( $existing, 'WTS_ADVANCED_CACHE' ) ) {
			return false;
		}
		return @unlink( $dest );
	}

	/**
	 * Is our drop-in in place?
	 *
	 * @return bool
	 */
	public static function dropin_installed() {
		$dest = WP_CONTENT_DIR . '/advanced-cache.php';
		if ( ! is_readable( $dest ) ) {
			return false;
		}
		$existing = file_get_contents( $dest );
		return is_string( $existing ) && false !== strpos( $existing, 'WTS_ADVANCED_CACHE' );
	}

	/**
	 * Add or remove WP_CACHE in wp-config.php.
	 *
	 * @param bool $enable Enable.
	 * @return bool
	 */
	public static function ensure_wp_cache_constant( $enable ) {
		$file = self::locate_wp_config();
		if ( ! $file || ! is_readable( $file ) || ! is_writable( $file ) ) {
			return false;
		}
		$contents = file_get_contents( $file );
		if ( ! is_string( $contents ) ) {
			return false;
		}

		$line = "define('WP_CACHE', true); // WoodMart Turbo Speed";

		if ( $enable ) {
			if ( false !== strpos( $contents, 'WoodMart Turbo Speed' ) && false !== strpos( $contents, "define('WP_CACHE'" ) ) {
				return true;
			}
			if ( preg_match( "/define\(\s*'WP_CACHE'\s*,/", $contents ) ) {
				return false;
			}
			$contents = preg_replace( '/<\?php/', "<?php\n" . $line, $contents, 1 );
			return false !== file_put_contents( $file, $contents, LOCK_EX );
		}

		if ( false === strpos( $contents, 'WoodMart Turbo Speed' ) ) {
			return true;
		}
		$contents = preg_replace( "/define\(\s*'WP_CACHE'\s*,\s*true\s*\);\s*\/\/ WoodMart Turbo Speed\r?\n/", '', $contents );
		return false !== file_put_contents( $file, $contents, LOCK_EX );
	}

	/**
	 * Find wp-config.php.
	 *
	 * @return string
	 */
	public static function locate_wp_config() {
		if ( file_exists( ABSPATH . 'wp-config.php' ) ) {
			return ABSPATH . 'wp-config.php';
		}
		$parent = dirname( ABSPATH ) . '/wp-config.php';
		if ( file_exists( $parent ) && ! file_exists( dirname( ABSPATH ) . '/wp-settings.php' ) ) {
			return $parent;
		}
		return '';
	}

	/**
	 * Purge every cached page.
	 *
	 * @return int Files removed.
	 */
	public static function purge_all() {
		$dir   = WTS_CACHE_DIR . '/pages';
		$count = 0;
		if ( ! is_dir( $dir ) ) {
			return 0;
		}
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ( $iterator as $file ) {
			$path = $file->getPathname();
			if ( $file->isFile() ) {
				$name = $file->getFilename();
				if ( 'index.php' === $name || '.htaccess' === $name ) {
					continue;
				}
				if ( @unlink( $path ) ) {
					$count++;
				}
			}
		}
		return $count;
	}

	/**
	 * Cache statistics.
	 *
	 * @return array
	 */
	public static function stats() {
		$dir   = WTS_CACHE_DIR . '/pages';
		$files = 0;
		$bytes = 0;
		if ( is_dir( $dir ) ) {
			$iterator = new RecursiveIteratorIterator(
				new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS )
			);
			foreach ( $iterator as $file ) {
				if ( ! $file->isFile() ) {
					continue;
				}
				$ext = strtolower( $file->getExtension() );
				if ( 'html' !== $ext ) {
					continue;
				}
				$files++;
				$bytes += $file->getSize();
			}
		}
		return array(
			'files' => $files,
			'bytes' => $bytes,
		);
	}
}
