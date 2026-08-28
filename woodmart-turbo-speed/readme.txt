=== WoodMart Turbo Speed ===
Contributors: masoud
Tags: woodmart, woocommerce, performance, cache, pagespeed, speed
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

افزونه افزایش سرعت مخصوص قالب WoodMart و فروشگاه ووکامرس.

== Description ==

WoodMart Turbo Speed a full-page cache, delay-JS, WoodMart-aware asset cleanup and WooCommerce cart-fragments delay plugin.

Features:

* Full page cache via advanced-cache.php drop-in (guest HTML before WordPress boots)
* Delay JavaScript until first user interaction (biggest PageSpeed win on WoodMart)
* WooCommerce cart fragments delay / disable
* Conditional WooCommerce & WoodMart scripts (Photoswipe, Zoom, Select2, CF7)
* HTML minify, native lazy-load, LCP preload
* WordPress bloat removal (emoji, embed, dashicons, XML-RPC, heartbeat)
* Database cleanup
* Apache gzip + expires (optional)
* Persian RTL admin, one-click Turbo mode

Cart, checkout and My Account are never cached.

== Installation ==

1. پوشه `woodmart-turbo-speed` را در `wp-content/plugins/` کپی کنید یا از افزونه‌ها → بارگذاری نصب کنید.
2. افزونه را فعال کنید.
3. از منوی «توربو وودمارت» دکمه «فعال‌سازی حالت توربو» را بزنید.
4. یک صفحه را در حالت ناشناس تست کنید و هدر `X-WTS-Cache: HIT` را ببینید.

== Changelog ==

= 1.0.0 =
* اولین نسخه.
