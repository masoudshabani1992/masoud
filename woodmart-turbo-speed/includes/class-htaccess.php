<?php
/**
 * Apache .htaccess browser cache + gzip.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Htaccess
 */
class WTS_Htaccess {

	const BEGIN = '# BEGIN WoodMart Turbo Speed';
	const END   = '# END WoodMart Turbo Speed';

	/**
	 * Init.
	 */
	public static function init() {
		add_action( 'wts_settings_saved', array( __CLASS__, 'sync' ) );
		add_action( 'wp_ajax_wts_htaccess', array( __CLASS__, 'ajax' ) );
	}

	/**
	 * Apply or remove based on settings.
	 */
	public static function sync() {
		if ( WTS_Settings::on( 'htaccess_browser_cache' ) || WTS_Settings::on( 'htaccess_gzip' ) ) {
			self::write_rules();
		} else {
			self::remove_rules();
		}
	}

	/**
	 * AJAX.
	 */
	public static function ajax() {
		check_ajax_referer( 'wts_admin', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		$ok = self::write_rules();
		if ( $ok ) {
			wp_send_json_success( array( 'message' => 'written' ) );
		}
		wp_send_json_error( array( 'message' => 'unwritable', 'rules' => self::rules() ) );
	}

	/**
	 * Path to .htaccess.
	 *
	 * @return string
	 */
	public static function path() {
		return ABSPATH . '.htaccess';
	}

	/**
	 * Write marker block.
	 *
	 * @return bool
	 */
	public static function write_rules() {
		$file = self::path();
		if ( ! file_exists( $file ) ) {
			if ( ! is_writable( ABSPATH ) ) {
				return false;
			}
			file_put_contents( $file, '' );
		}
		if ( ! is_readable( $file ) || ! is_writable( $file ) ) {
			return false;
		}

		$contents = file_get_contents( $file );
		if ( ! is_string( $contents ) ) {
			return false;
		}

		$block = self::BEGIN . "\n" . self::rules() . self::END . "\n";

		if ( false !== strpos( $contents, self::BEGIN ) ) {
			$contents = preg_replace(
				'/' . preg_quote( self::BEGIN, '/' ) . '.*?' . preg_quote( self::END, '/' ) . '\r?\n?/s',
				$block,
				$contents
			);
		} else {
			$contents = $block . "\n" . $contents;
		}

		return false !== file_put_contents( $file, $contents, LOCK_EX );
	}

	/**
	 * Remove marker block.
	 *
	 * @return bool
	 */
	public static function remove_rules() {
		$file = self::path();
		if ( ! is_readable( $file ) || ! is_writable( $file ) ) {
			return false;
		}
		$contents = file_get_contents( $file );
		if ( ! is_string( $contents ) || false === strpos( $contents, self::BEGIN ) ) {
			return true;
		}
		$contents = preg_replace(
			'/' . preg_quote( self::BEGIN, '/' ) . '.*?' . preg_quote( self::END, '/' ) . '\r?\n?/s',
			'',
			$contents
		);
		return false !== file_put_contents( $file, $contents, LOCK_EX );
	}

	/**
	 * Rules body.
	 *
	 * @return string
	 */
	public static function rules() {
		$gzip = WTS_Settings::on( 'htaccess_gzip' );
		$exp  = WTS_Settings::on( 'htaccess_browser_cache' );
		$out  = '';

		if ( $gzip ) {
			$out .= "<IfModule mod_deflate.c>\n";
			$out .= "  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml image/svg+xml\n";
			$out .= "</IfModule>\n";
			$out .= "<IfModule mod_gzip.c>\n";
			$out .= "  mod_gzip_on Yes\n";
			$out .= "  mod_gzip_item_include file \\.(html?|txt|css|js|php|pl)\$\n";
			$out .= "</IfModule>\n";
		}

		if ( $exp ) {
			$out .= "<IfModule mod_expires.c>\n";
			$out .= "  ExpiresActive On\n";
			$out .= "  ExpiresByType image/jpg \"access plus 1 year\"\n";
			$out .= "  ExpiresByType image/jpeg \"access plus 1 year\"\n";
			$out .= "  ExpiresByType image/gif \"access plus 1 year\"\n";
			$out .= "  ExpiresByType image/png \"access plus 1 year\"\n";
			$out .= "  ExpiresByType image/webp \"access plus 1 year\"\n";
			$out .= "  ExpiresByType image/svg+xml \"access plus 1 year\"\n";
			$out .= "  ExpiresByType image/x-icon \"access plus 1 year\"\n";
			$out .= "  ExpiresByType font/woff \"access plus 1 year\"\n";
			$out .= "  ExpiresByType font/woff2 \"access plus 1 year\"\n";
			$out .= "  ExpiresByType application/font-woff \"access plus 1 year\"\n";
			$out .= "  ExpiresByType text/css \"access plus 1 month\"\n";
			$out .= "  ExpiresByType application/javascript \"access plus 1 month\"\n";
			$out .= "  ExpiresByType text/javascript \"access plus 1 month\"\n";
			$out .= "</IfModule>\n";
			$out .= "<IfModule mod_headers.c>\n";
			$out .= "  <FilesMatch \"\\.(ico|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|css|js)\$\">\n";
			$out .= "    Header set Cache-Control \"public, max-age=31536000, immutable\"\n";
			$out .= "  </FilesMatch>\n";
			$out .= "</IfModule>\n";
			$out .= "FileETag None\n";
		}

		return $out;
	}

	/**
	 * Nginx snippet for the admin.
	 *
	 * @return string
	 */
	public static function nginx_snippet() {
		return "gzip on;\ngzip_comp_level 5;\ngzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;\n\nlocation ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)\$ {\n    expires 1y;\n    add_header Cache-Control \"public, immutable\";\n    access_log off;\n}\n";
	}

	/**
	 * Looks like Apache?
	 *
	 * @return bool
	 */
	public static function is_apache() {
		$sw = isset( $_SERVER['SERVER_SOFTWARE'] ) ? (string) $_SERVER['SERVER_SOFTWARE'] : '';
		return (bool) preg_match( '/apache/i', $sw );
	}
}
