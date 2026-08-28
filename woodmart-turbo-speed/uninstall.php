<?php
/**
 * Uninstall WoodMart Turbo Speed.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'wts_settings' );
delete_option( 'wts_do_activation_redirect' );
delete_option( 'wts_installed_at' );
delete_transient( 'wts_db_last_cleanup' );

$cache_dir = WP_CONTENT_DIR . '/cache/wts';
if ( is_dir( $cache_dir ) ) {
	wts_uninstall_rrmdir( $cache_dir );
}

$dropin = WP_CONTENT_DIR . '/advanced-cache.php';
if ( is_readable( $dropin ) ) {
	$contents = file_get_contents( $dropin );
	if ( is_string( $contents ) && false !== strpos( $contents, 'WTS_ADVANCED_CACHE' ) ) {
		@unlink( $dropin );
	}
}

wts_uninstall_remove_wp_cache();
wts_uninstall_remove_htaccess();

/**
 * Recursively delete a directory.
 *
 * @param string $dir Directory path.
 */
function wts_uninstall_rrmdir( $dir ) {
	if ( ! is_dir( $dir ) ) {
		return;
	}
	$items = scandir( $dir );
	if ( false === $items ) {
		return;
	}
	foreach ( $items as $item ) {
		if ( '.' === $item || '..' === $item ) {
			continue;
		}
		$path = $dir . DIRECTORY_SEPARATOR . $item;
		if ( is_dir( $path ) ) {
			wts_uninstall_rrmdir( $path );
		} else {
			@unlink( $path );
		}
	}
	@rmdir( $dir );
}

/**
 * Remove WP_CACHE constant we added.
 */
function wts_uninstall_remove_wp_cache() {
	$candidates = array(
		( defined( 'ABSPATH' ) ? ABSPATH : '' ) . 'wp-config.php',
		dirname( defined( 'ABSPATH' ) ? ABSPATH : '' ) . '/wp-config.php',
	);
	foreach ( $candidates as $file ) {
		if ( ! $file || ! is_writable( $file ) ) {
			continue;
		}
		$contents = file_get_contents( $file );
		if ( ! is_string( $contents ) || false === strpos( $contents, 'WoodMart Turbo Speed' ) ) {
			continue;
		}
		$contents = preg_replace( "/define\(\s*'WP_CACHE'\s*,\s*true\s*\);\s*\/\/ WoodMart Turbo Speed\r?\n/", '', $contents );
		file_put_contents( $file, $contents );
		break;
	}
}

/**
 * Remove htaccess markers.
 */
function wts_uninstall_remove_htaccess() {
	$ht = ( defined( 'ABSPATH' ) ? ABSPATH : '' ) . '.htaccess';
	if ( ! is_writable( $ht ) ) {
		return;
	}
	$contents = file_get_contents( $ht );
	if ( ! is_string( $contents ) ) {
		return;
	}
	$contents = preg_replace( '/# BEGIN WoodMart Turbo Speed.*?# END WoodMart Turbo Speed\r?\n?/s', '', $contents );
	file_put_contents( $ht, $contents );
}
