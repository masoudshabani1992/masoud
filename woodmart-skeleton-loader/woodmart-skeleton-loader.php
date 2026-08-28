<?php
/**
 * Plugin Name: WoodMart Skeleton Loader
 * Plugin URI:  https://example.com/
 * Description: اسکلت لودینگ سبک و قابل تنظیم برای صفحات و کارت‌های محصول قالب وودمارت.
 * Version:     1.0.0
 * Author:      Masoud Shabani
 * Text Domain: woodmart-skeleton-loader
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * @package WoodMartSkeletonLoader
 */

defined( 'ABSPATH' ) || exit;

final class MSWL_WoodMart_Skeleton_Loader {
	const VERSION = '1.0.0';
	const OPTION  = 'mswl_options';

	/** @var MSWL_WoodMart_Skeleton_Loader|null */
	private static $instance = null;

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_head', array( $this, 'preload_class' ), 1 );
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	public static function defaults() {
		return array(
			'enabled'       => 1,
			'products'      => 1,
			'content'       => 1,
			'images'        => 1,
			'delay'         => 1200,
			'color'         => '#eeeeee',
			'highlight'     => '#f8f8f8',
			'selectors'     => '.wd-product, .product-grid-item, .product-wrapper, .wd-shop-products, .products, .wd-products-element, .wd-shop-content',
		);
	}

	private function options() {
		return wp_parse_args( (array) get_option( self::OPTION, array() ), self::defaults() );
	}

	public function preload_class() {
		if ( is_admin() || ! $this->options()['enabled'] ) {
			return;
		}
		// The class is added before the first paint, preventing a flash of unstyled content.
		echo '<script>document.documentElement.classList.add("mswl-preloading");</script>\n';
	}

	public function enqueue_assets() {
		if ( is_admin() || ! $this->options()['enabled'] ) {
			return;
		}

		$options = $this->options();
		wp_enqueue_style( 'mswl-style', plugin_dir_url( __FILE__ ) . 'assets/skeleton.css', array(), self::VERSION );
		wp_add_inline_style( 'mswl-style', ':root{--mswl-color:' . esc_attr( $options['color'] ) . ';--mswl-highlight:' . esc_attr( $options['highlight'] ) . ';}' );
		wp_enqueue_script( 'mswl-script', plugin_dir_url( __FILE__ ) . 'assets/skeleton.js', array(), self::VERSION, true );
		wp_localize_script( 'mswl-script', 'MSWLSkeleton', array(
			'products'  => (bool) $options['products'],
			'content'   => (bool) $options['content'],
			'images'    => (bool) $options['images'],
			'delay'     => max( 0, absint( $options['delay'] ) ),
			'selectors' => sanitize_text_field( $options['selectors'] ),
		) );
	}

	public function admin_menu() {
		add_options_page( 'اسکلت لودینگ وودمارت', 'اسکلت لودینگ وودمارت', 'manage_options', 'mswl-settings', array( $this, 'settings_page' ) );
	}

	public function register_settings() {
		register_setting( 'mswl_settings', self::OPTION, array( $this, 'sanitize_options' ) );
	}

	public function sanitize_options( $input ) {
		$defaults = self::defaults();
		$output   = array();
		foreach ( array( 'enabled', 'products', 'content', 'images' ) as $key ) {
			$output[ $key ] = empty( $input[ $key ] ) ? 0 : 1;
		}
		$output['delay']     = isset( $input['delay'] ) ? min( 5000, max( 0, absint( $input['delay'] ) ) ) : $defaults['delay'];
		$output['color']     = isset( $input['color'] ) && preg_match( '/^#[0-9a-fA-F]{6}$/', $input['color'] ) ? $input['color'] : $defaults['color'];
		$output['highlight'] = isset( $input['highlight'] ) && preg_match( '/^#[0-9a-fA-F]{6}$/', $input['highlight'] ) ? $input['highlight'] : $defaults['highlight'];
		$output['selectors']  = isset( $input['selectors'] ) ? sanitize_text_field( $input['selectors'] ) : $defaults['selectors'];
		return $output;
	}

	public function settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$o = $this->options();
		?>
		<div class="wrap" dir="rtl">
			<h1>اسکلت لودینگ وودمارت</h1>
			<p>نمایش اسکلت متحرک هنگام بارگذاری اولیه و به‌روزرسانی لیست محصولات وودمارت.</p>
			<form action="options.php" method="post">
				<?php settings_fields( 'mswl_settings' ); ?>
				<table class="form-table" role="presentation">
					<tr><th scope="row">فعال‌سازی</th><td><label><input type="checkbox" name="<?php echo esc_attr( self::OPTION ); ?>[enabled]" value="1" <?php checked( $o['enabled'], 1 ); ?>> فعال باشد</label></td></tr>
					<tr><th scope="row">محدوده‌ها</th><td>
						<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION ); ?>[products]" value="1" <?php checked( $o['products'], 1 ); ?>> کارت محصولات</label><br>
						<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION ); ?>[content]" value="1" <?php checked( $o['content'], 1 ); ?>> محتوای صفحات و بخش‌های وودمارت</label><br>
						<label><input type="checkbox" name="<?php echo esc_attr( self::OPTION ); ?>[images]" value="1" <?php checked( $o['images'], 1 ); ?>> تصاویر (تا زمان لود تصویر)</label>
					</td></tr>
					<tr><th scope="row"><label for="mswl-delay">حداکثر زمان نمایش (میلی‌ثانیه)</label></th><td><input id="mswl-delay" type="number" min="0" max="5000" name="<?php echo esc_attr( self::OPTION ); ?>[delay]" value="<?php echo esc_attr( $o['delay'] ); ?>"> <p class="description">برای جلوگیری از گیر کردن اسکلت؛ مقدار صفر یعنی بدون محدودیت زمانی.</p></td></tr>
					<tr><th scope="row">رنگ اسکلت</th><td><input type="color" name="<?php echo esc_attr( self::OPTION ); ?>[color]" value="<?php echo esc_attr( $o['color'] ); ?>"> <input type="color" name="<?php echo esc_attr( self::OPTION ); ?>[highlight]" value="<?php echo esc_attr( $o['highlight'] ); ?>"> <span class="description">رنگ پایه / درخشش</span></td></tr>
					<tr><th scope="row"><label for="mswl-selectors">انتخابگرها</label></th><td><textarea id="mswl-selectors" class="large-text code" rows="3" name="<?php echo esc_attr( self::OPTION ); ?>[selectors]"><?php echo esc_textarea( $o['selectors'] ); ?></textarea><p class="description">کلاس‌های CSS را با کاما جدا کنید. انتخابگرهای پیش‌فرض برای وودمارت مناسب هستند.</p></td></tr>
				</table>
				<?php submit_button( 'ذخیره تنظیمات' ); ?>
			</form>
		</div>
		<?php
	}
}

MSWL_WoodMart_Skeleton_Loader::instance();
