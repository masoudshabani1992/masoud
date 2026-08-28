<?php
/**
 * Database cleanup.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Database
 */
class WTS_Database {

	/**
	 * Init AJAX.
	 */
	public static function init() {
		add_action( 'wp_ajax_wts_db_cleanup', array( __CLASS__, 'ajax_cleanup' ) );
	}

	/**
	 * AJAX handler.
	 */
	public static function ajax_cleanup() {
		check_ajax_referer( 'wts_admin', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}

		$task = isset( $_POST['task'] ) ? sanitize_key( wp_unslash( $_POST['task'] ) ) : 'all';
		$result = self::run( $task );
		set_transient( 'wts_db_last_cleanup', time(), WEEK_IN_SECONDS );
		wp_send_json_success( $result );
	}

	/**
	 * Run cleanup task(s).
	 *
	 * @param string $task Task key.
	 * @return array
	 */
	public static function run( $task = 'all' ) {
		$map = array(
			'revisions'   => array( __CLASS__, 'revisions' ),
			'drafts'      => array( __CLASS__, 'auto_drafts' ),
			'trash'       => array( __CLASS__, 'trash' ),
			'spam'        => array( __CLASS__, 'spam' ),
			'transients'  => array( __CLASS__, 'transients' ),
			'orphans'     => array( __CLASS__, 'orphans' ),
			'sessions'    => array( __CLASS__, 'sessions' ),
		);

		$out = array();
		if ( 'all' === $task ) {
			foreach ( $map as $key => $cb ) {
				$out[ $key ] = (int) call_user_func( $cb );
			}
		} elseif ( isset( $map[ $task ] ) ) {
			$out[ $task ] = (int) call_user_func( $map[ $task ] );
		}

		$out['total'] = array_sum( $out );
		return $out;
	}

	/**
	 * Counts for the dashboard.
	 *
	 * @return array
	 */
	public static function counts() {
		global $wpdb;
		$counts = array(
			'revisions'  => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'revision'" ),
			'drafts'     => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status = 'auto-draft'" ),
			'trash'      => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_status = 'trash'" ) + (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->comments} WHERE comment_approved = 'trash'" ),
			'spam'       => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->comments} WHERE comment_approved = 'spam'" ),
			'transients' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_%' OR option_name LIKE '\\_site\\_transient\\_%'" ),
		);

		$table = $wpdb->prefix . 'woocommerce_sessions';
		$counts['sessions'] = 0;
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$counts['sessions'] = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE session_expiry < UNIX_TIMESTAMP()" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		$counts['orphans'] = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL" );
		return $counts;
	}

	/**
	 * Delete revisions.
	 *
	 * @return int
	 */
	public static function revisions() {
		global $wpdb;
		$ids = $wpdb->get_col( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'revision' LIMIT 5000" );
		$n   = 0;
		foreach ( $ids as $id ) {
			if ( wp_delete_post_revision( (int) $id ) ) {
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Auto-drafts.
	 *
	 * @return int
	 */
	public static function auto_drafts() {
		global $wpdb;
		$ids = $wpdb->get_col( "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'auto-draft' LIMIT 2000" );
		$n   = 0;
		foreach ( $ids as $id ) {
			if ( wp_delete_post( (int) $id, true ) ) {
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Trash posts + comments.
	 *
	 * @return int
	 */
	public static function trash() {
		global $wpdb;
		$n   = 0;
		$ids = $wpdb->get_col( "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'trash' LIMIT 2000" );
		foreach ( $ids as $id ) {
			if ( wp_delete_post( (int) $id, true ) ) {
				$n++;
			}
		}
		$cids = $wpdb->get_col( "SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = 'trash' LIMIT 2000" );
		foreach ( $cids as $id ) {
			if ( wp_delete_comment( (int) $id, true ) ) {
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Spam comments.
	 *
	 * @return int
	 */
	public static function spam() {
		global $wpdb;
		$ids = $wpdb->get_col( "SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = 'spam' LIMIT 5000" );
		$n   = 0;
		foreach ( $ids as $id ) {
			if ( wp_delete_comment( (int) $id, true ) ) {
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Expired transients.
	 *
	 * @return int
	 */
	public static function transients() {
		if ( function_exists( 'delete_expired_transients' ) ) {
			delete_expired_transients();
		}
		global $wpdb;
		$timeouts = $wpdb->get_col( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_timeout\\_%' AND option_value < UNIX_TIMESTAMP() LIMIT 5000" );
		$n        = 0;
		foreach ( $timeouts as $name ) {
			$key = str_replace( '_transient_timeout_', '', $name );
			if ( delete_transient( $key ) ) {
				$n++;
			}
		}
		$site = $wpdb->get_col( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE '\\_site\\_transient\\_timeout\\_%' AND option_value < UNIX_TIMESTAMP() LIMIT 2000" );
		foreach ( $site as $name ) {
			$key = str_replace( '_site_transient_timeout_', '', $name );
			if ( delete_site_transient( $key ) ) {
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Orphan postmeta.
	 *
	 * @return int
	 */
	public static function orphans() {
		global $wpdb;
		return (int) $wpdb->query( "DELETE pm FROM {$wpdb->postmeta} pm LEFT JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE p.ID IS NULL" );
	}

	/**
	 * Expired WooCommerce sessions.
	 *
	 * @return int
	 */
	public static function sessions() {
		global $wpdb;
		$table = $wpdb->prefix . 'woocommerce_sessions';
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			return 0;
		}
		return (int) $wpdb->query( "DELETE FROM {$table} WHERE session_expiry < UNIX_TIMESTAMP()" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}
}
