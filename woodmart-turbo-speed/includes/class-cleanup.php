<?php
/**
 * WordPress core bloat removal.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Cleanup
 */
class WTS_Cleanup {

	/**
	 * Init.
	 */
	public static function init() {
		if ( WTS_Settings::on( 'disable_emojis' ) ) {
			self::disable_emojis();
		}
		if ( WTS_Settings::on( 'disable_embeds' ) ) {
			self::disable_embeds();
		}
		if ( WTS_Settings::on( 'clean_head' ) ) {
			self::clean_head();
		}
		if ( WTS_Settings::on( 'disable_xmlrpc' ) ) {
			add_filter( 'xmlrpc_enabled', '__return_false' );
			add_filter(
				'wp_headers',
				static function ( $headers ) {
					unset( $headers['X-Pingback'] );
					return $headers;
				}
			);
			add_filter( 'pings_open', '__return_false', 999 );
		}
		if ( WTS_Settings::on( 'heartbeat' ) ) {
			add_action( 'init', array( __CLASS__, 'heartbeat' ), 1 );
		}
		if ( WTS_Settings::on( 'limit_revisions' ) ) {
			$keep = (int) WTS_Settings::get( 'revisions_to_keep', 3 );
			add_filter(
				'wp_revisions_to_keep',
				static function () use ( $keep ) {
					return $keep;
				}
			);
		}
		if ( WTS_Settings::on( 'disable_rss' ) ) {
			add_action( 'do_feed', array( __CLASS__, 'disable_feed' ), 1 );
			add_action( 'do_feed_rdf', array( __CLASS__, 'disable_feed' ), 1 );
			add_action( 'do_feed_rss', array( __CLASS__, 'disable_feed' ), 1 );
			add_action( 'do_feed_rss2', array( __CLASS__, 'disable_feed' ), 1 );
			add_action( 'do_feed_atom', array( __CLASS__, 'disable_feed' ), 1 );
		}
		if ( WTS_Settings::on( 'autosave_interval' ) ) {
			if ( ! defined( 'AUTOSAVE_INTERVAL' ) ) {
				define( 'AUTOSAVE_INTERVAL', 300 );
			}
		}
		add_action( 'wp_default_scripts', array( __CLASS__, 'remove_jquery_migrate' ) );
		add_filter( 'wp_lazy_loading_enabled', array( __CLASS__, 'native_lazy' ) );
	}

	/**
	 * Emojis.
	 */
	public static function disable_emojis() {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'admin_print_styles', 'print_emoji_styles' );
		remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
		remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
		remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
		add_filter( 'tiny_mce_plugins', array( __CLASS__, 'tiny_mce_emojis' ) );
		add_filter( 'wp_resource_hints', array( __CLASS__, 'emoji_dns' ), 10, 2 );
		add_filter( 'emoji_svg_url', '__return_false' );
	}

	/**
	 * TinyMCE emoji plugin.
	 *
	 * @param array $plugins Plugins.
	 * @return array
	 */
	public static function tiny_mce_emojis( $plugins ) {
		if ( is_array( $plugins ) ) {
			return array_diff( $plugins, array( 'wpemoji' ) );
		}
		return array();
	}

	/**
	 * Remove s.w.org prefetch.
	 *
	 * @param array  $urls URLs.
	 * @param string $rel  Rel.
	 * @return array
	 */
	public static function emoji_dns( $urls, $rel ) {
		if ( 'dns-prefetch' === $rel ) {
			$urls = array_filter(
				$urls,
				static function ( $url ) {
					return false === strpos( $url, 's.w.org' );
				}
			);
		}
		return $urls;
	}

	/**
	 * Embeds.
	 */
	public static function disable_embeds() {
		remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
		remove_action( 'wp_head', 'wp_oembed_add_host_js' );
		remove_filter( 'oembed_dataparse', 'wp_filter_oembed_result', 10 );
		add_filter( 'embed_oembed_discover', '__return_false' );
		add_filter( 'rewrite_rules_array', array( __CLASS__, 'remove_embed_rewrites' ) );
		add_action(
			'wp_footer',
			static function () {
				wp_dequeue_script( 'wp-embed' );
			}
		);
	}

	/**
	 * Remove embed rewrite rules.
	 *
	 * @param array $rules Rules.
	 * @return array
	 */
	public static function remove_embed_rewrites( $rules ) {
		foreach ( $rules as $rule => $rewrite ) {
			if ( false !== strpos( $rewrite, 'embed=true' ) ) {
				unset( $rules[ $rule ] );
			}
		}
		return $rules;
	}

	/**
	 * Clean wp_head extras.
	 */
	public static function clean_head() {
		remove_action( 'wp_head', 'rsd_link' );
		remove_action( 'wp_head', 'wlwmanifest_link' );
		remove_action( 'wp_head', 'wp_generator' );
		remove_action( 'wp_head', 'wp_shortlink_wp_head', 10 );
		remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
		remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 );
		remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
		remove_action( 'template_redirect', 'rest_output_link_header', 11 );
		remove_action( 'wp_head', 'wp_resource_hints', 2 );
		add_filter( 'the_generator', '__return_empty_string' );
	}

	/**
	 * Heartbeat control.
	 */
	public static function heartbeat() {
		if ( ! is_admin() ) {
			wp_deregister_script( 'heartbeat' );
			return;
		}
		add_filter(
			'heartbeat_settings',
			static function ( $settings ) {
				$settings['interval'] = 60;
				return $settings;
			}
		);
	}

	/**
	 * Kill feeds.
	 */
	public static function disable_feed() {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}

	/**
	 * jQuery migrate.
	 *
	 * @param WP_Scripts $scripts Scripts.
	 */
	public static function remove_jquery_migrate( $scripts ) {
		if ( is_admin() || ! WTS_Settings::on( 'disable_jquery_migrate' ) ) {
			return;
		}
		if ( isset( $scripts->registered['jquery'] ) ) {
			$script = $scripts->registered['jquery'];
			if ( $script->deps ) {
				$script->deps = array_diff( $script->deps, array( 'jquery-migrate' ) );
			}
		}
	}

	/**
	 * Keep native lazy unless we handle it.
	 *
	 * @param bool $default Default.
	 * @return bool
	 */
	public static function native_lazy( $default ) {
		if ( WTS_Settings::on( 'lazyload' ) ) {
			return true;
		}
		return $default;
	}
}
