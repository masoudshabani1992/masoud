<?php
/**
 * WoodMart Turbo Speed — advanced-cache.php drop-in.
 *
 * Served before most of WordPress boots. Config is a plain PHP file so we
 * never touch the database on a cache HIT.
 *
 * @package WoodMart_Turbo_Speed
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

if ( ! defined( 'WTS_ADVANCED_CACHE' ) ) {
	define( 'WTS_ADVANCED_CACHE', true );
}

if ( defined( 'WP_INSTALLING' ) && WP_INSTALLING ) {
	return;
}

if ( defined( 'XMLRPC_REQUEST' ) || defined( 'REST_REQUEST' ) || defined( 'WP_CLI' ) ) {
	return;
}

wts_ac_try_serve();

/**
 * Attempt to serve a cached page.
 */
function wts_ac_try_serve() {
	$method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( (string) $_SERVER['REQUEST_METHOD'] ) : 'GET';
	if ( 'GET' !== $method && 'HEAD' !== $method ) {
		return;
	}

	if ( ! empty( $_POST ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
		return;
	}

	$config_file = WP_CONTENT_DIR . '/cache/wts/config.php';
	if ( ! is_readable( $config_file ) ) {
		return;
	}

	$config = include $config_file;
	if ( ! is_array( $config ) || empty( $config['enabled'] ) ) {
		return;
	}

	if ( ! empty( $_COOKIE ) ) {
		foreach ( $_COOKIE as $name => $value ) {
			if ( ! is_string( $name ) ) {
				continue;
			}
			if ( 0 === strpos( $name, 'wordpress_logged_in_' ) ) {
				return;
			}
			if ( 0 === strpos( $name, 'wp-postpass_' ) ) {
				return;
			}
			if ( 0 === strpos( $name, 'comment_author_' ) ) {
				return;
			}
			if ( 'woocommerce_items_in_cart' === $name && ! empty( $value ) && '0' !== (string) $value ) {
				return;
			}
			if ( 'wts_nocache' === $name ) {
				return;
			}
		}
	}

	$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '/';

	if ( isset( $_GET['wts_nocache'] ) || isset( $_GET['wts_disable'] ) || isset( $_GET['preview'] ) || isset( $_GET['add-to-cart'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return;
	}

	if ( preg_match( '#/wp-admin/|/wp-login\.php|/wp-json/|xmlrpc\.php|wp-cron\.php|wp-register\.php#i', $uri ) ) {
		return;
	}

	if ( preg_match( '#(?:^|[?&])(?:wc-ajax|wc-api|add-to-cart|removed_item|logout|s)=#i', $uri ) ) {
		return;
	}

	if ( ! empty( $config['skip_uris'] ) && is_array( $config['skip_uris'] ) ) {
		foreach ( $config['skip_uris'] as $skip ) {
			$skip = (string) $skip;
			if ( '' !== $skip && false !== strpos( $uri, $skip ) ) {
				return;
			}
		}
	}

	$query = isset( $_SERVER['QUERY_STRING'] ) ? (string) $_SERVER['QUERY_STRING'] : '';
	if ( '' !== $query && empty( $config['cache_query'] ) ) {
		parse_str( $query, $params );
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		foreach ( array( 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'fbclid', 'gclid', 'gad_source', 'mc_cid', 'mc_eid', '_ga' ) as $track ) {
			unset( $params[ $track ] );
		}
		if ( ! empty( $params ) ) {
			return;
		}
	}

	$host      = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( (string) $_SERVER['HTTP_HOST'] ) : 'localhost';
	$https     = wts_ac_is_ssl() ? 's' : 'h';
	$is_mobile = ! empty( $config['cache_mobile'] ) && wts_ac_is_mobile();
	$key       = md5( $host . '|' . $uri . '|' . $https . '|' . ( $is_mobile ? 'm' : 'd' ) );
	$dir       = WP_CONTENT_DIR . '/cache/wts/pages/' . substr( $key, 0, 2 );
	$file      = $dir . '/' . $key . '.html';
	$gz        = $file . '.gz';

	if ( ! is_readable( $file ) ) {
		return;
	}

	$mtime = filemtime( $file );
	$ttl   = isset( $config['ttl'] ) ? (int) $config['ttl'] : 43200;
	if ( ! $mtime || ( $mtime + $ttl ) < time() ) {
		return;
	}

	$age = time() - $mtime;
	header( 'X-WTS-Cache: HIT' );
	header( 'X-WTS-Cache-Age: ' . $age );
	header( 'Vary: Accept-Encoding, Cookie' );
	header( 'Cache-Control: public, max-age=0, s-maxage=60' );
	header( 'Content-Type: text/html; charset=UTF-8' );

	$accept = isset( $_SERVER['HTTP_ACCEPT_ENCODING'] ) ? (string) $_SERVER['HTTP_ACCEPT_ENCODING'] : '';
	if ( false !== strpos( $accept, 'gzip' ) && is_readable( $gz ) ) {
		header( 'Content-Encoding: gzip' );
		header( 'Content-Length: ' . (string) filesize( $gz ) );
		if ( 'HEAD' !== $method ) {
			readfile( $gz );
		}
		exit;
	}

	header( 'Content-Length: ' . (string) filesize( $file ) );
	if ( 'HEAD' !== $method ) {
		readfile( $file );
	}
	exit;
}

/**
 * HTTPS?
 *
 * @return bool
 */
function wts_ac_is_ssl() {
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
 * Rough mobile UA check (must match plugin cache key).
 *
 * @return bool
 */
function wts_ac_is_mobile() {
	$ua = isset( $_SERVER['HTTP_USER_AGENT'] ) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
	if ( '' === $ua ) {
		return false;
	}
	return (bool) preg_match( '/Mobile|Android|Silk\/|Kindle|BlackBerry|Opera Mini|Opera Mobi|webOS|iPhone|iPad|iPod/i', $ua );
}
