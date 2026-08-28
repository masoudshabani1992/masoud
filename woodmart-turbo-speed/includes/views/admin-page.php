<?php
/**
 * Admin screen.
 *
 * @package WoodMart_Turbo_Speed
 *
 * @var array $settings
 * @var array $stats
 * @var array $counts
 * @var array $health
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'wts_toggle' ) ) {
	/**
	 * Render a toggle row.
	 *
	 * @param string $key      Key.
	 * @param string $title    Title.
	 * @param string $help     Help.
	 * @param array  $settings Settings.
	 */
	function wts_toggle( $key, $title, $help, $settings ) {
		$on = ! empty( $settings[ $key ] );
		?>
	<label class="wts-row">
		<span class="wts-row__text">
			<span class="wts-row__title"><?php echo esc_html( $title ); ?></span>
			<span class="wts-row__help"><?php echo esc_html( $help ); ?></span>
		</span>
		<span class="wts-switch">
			<input type="hidden" name="<?php echo esc_attr( $key ); ?>" value="0">
			<input type="checkbox" name="<?php echo esc_attr( $key ); ?>" value="1" <?php checked( $on ); ?>>
			<span class="wts-switch__ui"></span>
		</span>
	</label>
		<?php
	}
}
?>
<div class="wts-wrap" dir="rtl">
	<div class="wts-hero">
		<div class="wts-hero__brand">
			<div class="wts-logo" aria-hidden="true">
				<svg viewBox="0 0 48 48" width="48" height="48"><defs><linearGradient id="wtsg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2ee59d"/><stop offset="1" stop-color="#5eead4"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="url(#wtsg)"/><path d="M26 8L12 26h10l-4 14 18-20H26l4-12z" fill="#071019"/></svg>
			</div>
			<div>
				<h1>WoodMart Turbo Speed</h1>
				<p>افزونه افزایش سرعت مخصوص قالب وودمارت و فروشگاه ووکامرس — نسخه <?php echo esc_html( WTS_VERSION ); ?></p>
			</div>
		</div>
		<div class="wts-hero__actions">
			<button type="button" class="wts-btn wts-btn--ghost" id="wts-purge">پاک کردن کش</button>
			<button type="button" class="wts-btn wts-btn--turbo" id="wts-turbo">
				<span>فعال‌سازی حالت توربو</span>
			</button>
		</div>
	</div>

	<div class="wts-toast" id="wts-toast" hidden></div>

	<div class="wts-kpis">
		<div class="wts-kpi">
			<div class="wts-ring" data-pct="<?php echo (int) $health['pct']; ?>">
				<svg viewBox="0 0 36 36">
					<path class="wts-ring__bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
					<path class="wts-ring__val" stroke-dasharray="<?php echo (int) $health['pct']; ?>, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
				</svg>
				<strong><?php echo (int) $health['pct']; ?>%</strong>
			</div>
			<div>
				<h2>سلامت بهینه‌سازی</h2>
				<p><?php echo (int) $health['score']; ?> از <?php echo (int) $health['max']; ?> مورد آماده است</p>
			</div>
		</div>
		<div class="wts-kpi wts-kpi--stat">
			<span class="wts-kpi__num" id="wts-cache-files"><?php echo (int) $stats['files']; ?></span>
			<span class="wts-kpi__label">صفحه کش‌شده</span>
		</div>
		<div class="wts-kpi wts-kpi--stat">
			<span class="wts-kpi__num" id="wts-cache-size"><?php echo esc_html( WTS_Admin::bytes( $stats['bytes'] ) ); ?></span>
			<span class="wts-kpi__label">حجم کش HTML</span>
		</div>
		<div class="wts-kpi wts-kpi--stat">
			<span class="wts-kpi__num"><?php echo (int) array_sum( $counts ); ?></span>
			<span class="wts-kpi__label">ردیف قابل پاکسازی در دیتابیس</span>
		</div>
	</div>

	<div class="wts-layout">
		<aside class="wts-side">
			<nav class="wts-tabs" id="wts-tabs">
				<button type="button" class="is-active" data-tab="dash">پیشخوان</button>
				<button type="button" data-tab="cache">کش صفحه</button>
				<button type="button" data-tab="assets">جاوااسکریپت و CSS</button>
				<button type="button" data-tab="woodmart">وودمارت</button>
				<button type="button" data-tab="woo">ووکامرس</button>
				<button type="button" data-tab="wp">پاکسازی وردپرس</button>
				<button type="button" data-tab="db">دیتابیس</button>
				<button type="button" data-tab="adv">پیشرفته</button>
			</nav>

			<div class="wts-card wts-card--tip">
				<h3>اگر هنوز کند است</h3>
				<ol>
					<li>هاست را روی PHP ۸.۱+ و OPcache بگذارید.</li>
					<li>تصاویر محصولات را WebP کنید (Imagify یا ShortPixel).</li>
					<li>از WoodMart ← CSS Generator استایل‌های اضافی را حذف کنید.</li>
					<li>اسلایدر و ویدیوی بالای صفحه را سبک کنید؛ LCP را یک تصویر بگذارید.</li>
					<li>Redis را روی هاست روشن کنید.</li>
				</ol>
			</div>
		</aside>

		<form class="wts-main" id="wts-form" autocomplete="off">
			<section class="wts-panel is-active" data-panel="dash">
				<div class="wts-card">
					<h2>وضعیت سیستم</h2>
					<ul class="wts-health" id="wts-health">
						<?php foreach ( $health['items'] as $item ) : ?>
							<li class="<?php echo $item['ok'] ? 'is-ok' : 'is-bad'; ?>">
								<span class="wts-dot"></span>
								<?php echo esc_html( $item['label'] ); ?>
							</li>
						<?php endforeach; ?>
					</ul>
					<div class="wts-actions">
						<button type="button" class="wts-btn wts-btn--primary" id="wts-dropin">نصب Drop-in کش (بیشترین تأثیر TTFB)</button>
					</div>
					<p class="wts-note">صفحه سبد، تسویه و حساب کاربری هرگز کش نمی‌شوند. برای دور زدن بهینه‌ساز روی یک صفحه از <code>?wts_disable=1</code> استفاده کنید.</p>
				</div>

				<div class="wts-card">
					<h2>این افزونه دقیقاً چه می‌کند؟</h2>
					<div class="wts-grid3">
						<div>
							<h3>۱. کش تمام‌صفحه</h3>
							<p>HTML آماده را قبل از بوت شدن وردپرس برمی‌گرداند. TTFB معمولاً از چند ثانیه به چند ده میلی‌ثانیه می‌رسد.</p>
						</div>
						<div>
							<h3>۲. تأخیر جاوااسکریپت</h3>
							<p>اسکریپت‌های سنگین وودمارت تا اولین حرکت ماوس/لمس اجرا نمی‌شوند. همین مورد امتیاز TBT و Speed Index را بالا می‌برد.</p>
						</div>
						<div>
							<h3>۳. حذف بار اضافی</h3>
							<p>اموجی، Embed، Gutenberg، Cart Fragments، Photoswipe و فونت گوگل از صفحاتی که لازم نیستند حذف می‌شوند.</p>
						</div>
					</div>
				</div>
			</section>

			<section class="wts-panel" data-panel="cache">
				<div class="wts-card">
					<h2>کش صفحه</h2>
					<?php
					wts_toggle( 'page_cache', 'فعال‌سازی کش صفحه', 'برای بازدیدکننده‌های مهمان، HTML نهایی روی دیسک ذخیره می‌شود.', $settings );
					wts_toggle( 'cache_mobile', 'کش جدا برای موبایل', 'اگر هدر موبایل وودمارت متفاوت است، روشن بماند.', $settings );
					wts_toggle( 'cache_query', 'کش کردن آدرس‌های دارای Query String', 'معمولاً خاموش بماند تا صفحات فیلتر و جستجو خراب نشوند.', $settings );
					?>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">عمر کش (ثانیه)</span>
						<input type="number" name="cache_ttl" min="300" max="604800" value="<?php echo (int) $settings['cache_ttl']; ?>">
						<span class="wts-row__help">پیش‌فرض ۴۳۲۰۰ = ۱۲ ساعت. با ذخیره محصول یا نوشته، کش خودکار خالی می‌شود.</span>
					</label>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">مسیرهایی که هرگز کش نشوند (هر خط یکی)</span>
						<textarea name="skip_uris" rows="4" placeholder="/custom-thank-you"><?php echo esc_textarea( $settings['skip_uris'] ); ?></textarea>
					</label>
				</div>
			</section>

			<section class="wts-panel" data-panel="assets">
				<div class="wts-card">
					<h2>جاوااسکریپت و CSS</h2>
					<?php
					wts_toggle( 'delay_js', 'تأخیر جاوااسکریپت تا تعامل کاربر', 'مهم‌ترین گزینه برای امتیاز PageSpeed روی وودمارت. سبد و تسویه مستثنی هستند.', $settings );
					wts_toggle( 'defer_js', 'Defer کردن اسکریپت‌ها (اگر تأخیر خاموش باشد)', 'اسکریپت را بعد از پارس HTML اجرا می‌کند.', $settings );
					wts_toggle( 'minify_html', 'فشرده‌سازی HTML', 'فاصله‌ها و کامنت‌های اضافی حذف می‌شوند.', $settings );
					wts_toggle( 'lazyload', 'Lazy Load تصاویر و iframe', 'تصویر اول (LCP) مستثنی و با اولویت بالا لود می‌شود.', $settings );
					wts_toggle( 'fetchpriority', 'Preload تصویر LCP', 'اولین تصویر صفحه با fetchpriority=high پیش‌بارگذاری می‌شود.', $settings );
					wts_toggle( 'remove_query_strings', 'حذف ?ver از فایل‌های استاتیک', 'کش مرورگر و CDN بهتر کار می‌کند.', $settings );
					wts_toggle( 'font_display_swap', 'font-display: swap برای گوگل فونت', 'متن بلافاصله با فونت جایگزین دیده می‌شود.', $settings );
					wts_toggle( 'disable_google_fonts', 'قطع کامل گوگل فونت‌ها', 'ظاهر فونت عوض می‌شود. اگر فونت را لوکال کرده‌اید روشن کنید.', $settings );
					wts_toggle( 'speculation_rules', 'پیش‌بارگذاری لینک‌ها (Speculation Rules)', 'با هاور، صفحه بعدی از قبل آماده می‌شود. مرورگرهای کرومیوم.', $settings );
					?>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">تایم‌اوت تأخیر JS (ثانیه، ۰ = فقط تعامل)</span>
						<input type="number" name="delay_js_timeout" min="0" max="60" value="<?php echo (int) $settings['delay_js_timeout']; ?>">
						<span class="wts-row__help">برای نمره بهتر PageSpeed روی ۰ بماند.</span>
					</label>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">کلمات مستثنی از تأخیر JS (هر خط یکی)</span>
						<textarea name="delay_js_excludes" rows="6"><?php echo esc_textarea( $settings['delay_js_excludes'] ); ?></textarea>
					</label>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">Critical CSS (اختیاری)</span>
						<textarea name="critical_css" rows="6" placeholder="body{margin:0} ..."><?php echo esc_textarea( $settings['critical_css'] ); ?></textarea>
					</label>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">Preload فونت‌های ووف (هر خط یک URL)</span>
						<textarea name="preload_fonts" rows="3" placeholder="https://example.com/wp-content/themes/woodmart/fonts/woodmart-font.woff2"><?php echo esc_textarea( $settings['preload_fonts'] ); ?></textarea>
					</label>
				</div>
			</section>

			<section class="wts-panel" data-panel="woodmart">
				<div class="wts-card">
					<h2>بهینه‌سازی مخصوص WoodMart</h2>
					<?php if ( ! WTS_Plugin::is_woodmart() ) : ?>
						<p class="wts-warn">قالب وودمارت الان فعال نیست. این گزینه‌ها وقتی قالب (یا چایلدتم) وودمارت باشد اثر می‌کنند.</p>
					<?php endif; ?>
					<?php
					wts_toggle( 'woodmart_disable_gfonts', 'قطع گوگل فونت وودمارت', 'درخواست خارجی fonts.googleapis.com حذف می‌شود. فونت سیستم یا فونت لوکال استفاده شود.', $settings );
					wts_toggle( 'woodmart_force_minified', 'اجبار CSS/JS فشرده قالب', 'نسخه min قالب لود می‌شود و Combine (مضر در HTTP/2) خاموش می‌ماند.', $settings );
					wts_toggle( 'woodmart_disable_preloader', 'حذف پری‌لودر تمام‌صفحه', 'پرده لودینگ اولیه وودمارت LCP را خراب می‌کند.', $settings );
					wts_toggle( 'woodmart_disable_animations', 'خاموش کردن انیمیشن‌ها', 'ظاهر کمی خشک‌تر می‌شود اما Main-thread آزادتر است.', $settings );
					wts_toggle( 'woodmart_elementor_opt', 'CSS بهینه‌شده Elementor وودمارت + قطع فونت Elementor', 'اگر صفحه‌ساز Elementor دارید روشن بماند.', $settings );
					wts_toggle( 'woodmart_disable_cf7_assets', 'لود Contact Form 7 فقط در صفحات فرم', 'JS/CSS فرم در بقیه صفحات حذف می‌شود.', $settings );
					wts_toggle( 'woodmart_product_only_scripts', 'اسکریپت گالری/زوم فقط در صفحه محصول', 'Photoswipe، Zoom، 360 و flexslider در صفحات دیگر لود نمی‌شوند.', $settings );
					wts_toggle( 'woodmart_disable_wp_lazy_conflict', 'هماهنگی Lazy Load با قالب', 'از دوباره‌کاری لیزی‌لود قالب جلوگیری می‌شود.', $settings );
					?>
					<div class="wts-callout">
						<strong>کار دستی در خود قالب که ارزشش را دارد:</strong>
						<ul>
							<li>WoodMart → Theme Settings → Performance: Minified CSS/JS روشن، Combine خاموش.</li>
							<li>WoodMart → CSS Generator: فقط ماژول‌هایی که در سایت استفاده می‌کنید.</li>
							<li>اگر Wishlist / Compare / AJAX Search نمی‌خواهید، از تنظیمات قالب خاموش کنید.</li>
							<li>هدر را سبک کنید: مگا‌منو با تصویر زیاد، HTML Block سنگین و ویجت اینستاگرام را حذف کنید.</li>
						</ul>
					</div>
				</div>
			</section>

			<section class="wts-panel" data-panel="woo">
				<div class="wts-card">
					<h2>ووکامرس</h2>
					<?php
					wts_toggle( 'woo_delay_fragments', 'تأخیر Cart Fragments', 'درخواست ajax get_refreshed_fragments دیگر اولِ هر صفحه شلیک نمی‌شود. مینی‌کارت بعد از تعامل به‌روز می‌شود.', $settings );
					wts_toggle( 'woo_disable_fragments', 'قطع کامل Cart Fragments', 'فقط اگر مینی‌کارت زنده نمی‌خواهید. با گزینه قبلی همزمان روشن نکنید.', $settings );
					wts_toggle( 'woo_scripts_shop_only', 'اسکریپت ووکامرس فقط در صفحات فروشگاه', 'بلاگ و صفحات ساده سبک می‌شوند. شورت‌کد محصول تشخیص داده می‌شود.', $settings );
					wts_toggle( 'woo_disable_styles_away', 'حذف CSS ووکامرس خارج از فروشگاه', 'اگر کارت محصول در صفحه اصلی دارید خاموش بماند.', $settings );
					wts_toggle( 'woo_conditional_assets', 'حذف دارایی‌های شرطی ووکامرس', 'اسکریپت‌های غیرضروری صفحه‌به‌صفحه حذف می‌شوند.', $settings );
					wts_toggle( 'woo_disable_blocks_css', 'حذف CSS بلوک‌های ووکامرس/گutenberg', 'اگر فروشگاه را با بلوک ووکامرس نساخته‌اید روشن کنید.', $settings );
					wts_toggle( 'woo_disable_password_meter', 'حذف Password Strength خارج از حساب/تسویه', '', $settings );
					wts_toggle( 'woo_disable_photoswipe_away', 'حذف Zoom / Photoswipe خارج از محصول', '', $settings );
					wts_toggle( 'woo_disable_select2_away', 'حذف Select2 خارج از تسویه و سبد', '', $settings );
					wts_toggle( 'woo_disable_widgets_css', 'حذف CSS ویجت‌های بلاک ووکامرس', '', $settings );
					wts_toggle( 'woo_disable_attribution', 'حذف Order Attribution / Sourcebuster', 'اسکریپت ردیابی منبع سفارش روی همه صفحات لود می‌شود و سنگین است.', $settings );
					?>
				</div>
			</section>

			<section class="wts-panel" data-panel="wp">
				<div class="wts-card">
					<h2>پاکسازی هسته وردپرس</h2>
					<?php
					wts_toggle( 'disable_emojis', 'حذف Emoji وردپرس', 'چند درخواست اضافی به s.w.org حذف می‌شود.', $settings );
					wts_toggle( 'disable_embeds', 'حذف Embed / oEmbed', '', $settings );
					wts_toggle( 'disable_jquery_migrate', 'حذف jQuery Migrate', 'وودمارت مدرن به آن نیاز ندارد.', $settings );
					wts_toggle( 'disable_dashicons', 'حذف Dashicons برای مهمان', '', $settings );
					wts_toggle( 'disable_gutenberg_css', 'حذف CSS Gutenberg در فرانت', 'اگر نوشته‌ها با بلوک ساخته شده‌اند ظاهر ممکن است کمی عوض شود.', $settings );
					wts_toggle( 'disable_xmlrpc', 'غیرفعال کردن XML-RPC', 'امنیت و کاهش حملات pingback.', $settings );
					wts_toggle( 'clean_head', 'تمیز کردن wp_head', 'RSD، wlwmanifest، generator، shortlink، REST link.', $settings );
					wts_toggle( 'heartbeat', 'کنترل Heartbeat', 'در فرانت قطع و در ادمین هر ۶۰ ثانیه.', $settings );
					wts_toggle( 'limit_revisions', 'محدود کردن رونوشت نوشته', '', $settings );
					wts_toggle( 'disable_rss', 'قطع فید RSS', 'اگر از فید استفاده می‌کنید خاموش بماند.', $settings );
					wts_toggle( 'disable_comments_assets', 'حذف comment-reply در صفحات بدون نظر', '', $settings );
					wts_toggle( 'autosave_interval', 'کاهش Autosave ادمین (۵ دقیقه)', '', $settings );
					?>
					<label class="wts-row wts-row--stack">
						<span class="wts-row__title">تعداد رونوشت نگهداری‌شده</span>
						<input type="number" name="revisions_to_keep" min="1" max="20" value="<?php echo (int) $settings['revisions_to_keep']; ?>">
					</label>
				</div>
			</section>

			<section class="wts-panel" data-panel="db">
				<div class="wts-card">
					<h2>پاکسازی دیتابیس</h2>
					<p class="wts-note">قبل از پاکسازی کامل از دیتابیس بکاپ بگیرید. این کار برگشت‌پذیر نیست.</p>
					<div class="wts-db">
						<?php
						$labels = array(
							'revisions'  => 'رونوشت نوشته',
							'drafts'     => 'پیش‌نویس خودکار',
							'trash'      => 'زباله‌دان',
							'spam'       => 'نظرات اسپم',
							'transients' => 'تراینزینت‌ها',
							'orphans'    => 'متای یتیم',
							'sessions'   => 'سشن منقضی ووکامرس',
						);
						foreach ( $labels as $key => $label ) :
							$n = isset( $counts[ $key ] ) ? (int) $counts[ $key ] : 0;
							?>
							<div class="wts-db__row">
								<div>
									<strong><?php echo esc_html( $label ); ?></strong>
									<span><?php echo (int) $n; ?> مورد</span>
								</div>
								<button type="button" class="wts-btn wts-btn--ghost wts-db-btn" data-task="<?php echo esc_attr( $key ); ?>">پاک کردن</button>
							</div>
						<?php endforeach; ?>
					</div>
					<div class="wts-actions">
						<button type="button" class="wts-btn wts-btn--danger" id="wts-db-all">پاکسازی همه</button>
					</div>
				</div>
			</section>

			<section class="wts-panel" data-panel="adv">
				<div class="wts-card">
					<h2>کش مرورگر و فشرده‌سازی سرور</h2>
					<?php
					wts_toggle( 'htaccess_browser_cache', 'نوشتن قوانین Cache-Control در .htaccess', 'فقط آپاچی. برای فایل‌های استاتیک یک سال کش.', $settings );
					wts_toggle( 'htaccess_gzip', 'فعال کردن Gzip در .htaccess', 'فقط آپاچی. اگر هاست از قبل Gzip/Brotli دارد لازم نیست.', $settings );
					?>
					<p class="wts-note">
						سرور فعلی:
						<strong><?php echo WTS_Htaccess::is_apache() ? 'Apache' : 'احتمالاً Nginx / LiteSpeed / دیگر'; ?></strong>
					</p>
					<?php if ( ! WTS_Htaccess::is_apache() ) : ?>
						<label class="wts-row wts-row--stack">
							<span class="wts-row__title">قطعه Nginx (دستی در کانفیگ سرور)</span>
							<textarea readonly rows="10"><?php echo esc_textarea( WTS_Htaccess::nginx_snippet() ); ?></textarea>
						</label>
					<?php endif; ?>
				</div>
				<div class="wts-card">
					<h2>عیب‌یابی</h2>
					<ul class="wts-list">
						<li>اگر مینی‌کارت خراب شد: تأخیر Fragments را خاموش کنید یا کلمات exclude را اضافه کنید.</li>
						<li>اگر مگا‌منو دیر باز شد: این رفتار تأخیر JS است و بعد از اولین حرکت درست می‌شود.</li>
						<li>اگر درگاه پرداخت در تسویه مشکل داشت به ما بگویید؛ تسویه به‌صورت پیش‌فرض مستثنی است.</li>
						<li>افزونه را همزمان با WP Rocket / LiteSpeed Cache / FlyingPress روی حالت کش صفحه روشن نکنید.</li>
						<li>دستور WP-CLI: <code>wp wts turbo</code> ، <code>wp wts purge</code> ، <code>wp wts status</code></li>
					</ul>
				</div>
			</section>

			<div class="wts-savebar">
				<button type="submit" class="wts-btn wts-btn--primary" id="wts-save">ذخیره تنظیمات</button>
				<span class="wts-savebar__hint">تغییرات بلافاصله روی فرانت اعمال می‌شوند و کش خالی می‌گردد.</span>
			</div>
		</form>
	</div>
</div>
