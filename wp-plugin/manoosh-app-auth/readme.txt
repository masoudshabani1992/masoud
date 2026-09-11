=== Manoosh App Auth & API ===
Contributors: manoosh
Tags: woocommerce, rest api, otp, sms, android app
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Companion plugin for the Manoosh Android app: SMS OTP login, home banners, product variations, order pay URL.

== Description ==

Provides the `manoosh/v1` REST endpoints used by the Manoosh Android app:

* `POST /wp-json/manoosh/v1/otp/request` — send a 5-digit login code via SMS.
* `POST /wp-json/manoosh/v1/otp/verify` — verify the code, create/find the customer, issue a WordPress Application Password.
* `GET /wp-json/manoosh/v1/home` — home banners + featured categories + amazing section config.
* `GET /wp-json/manoosh/v1/variations?product_id=ID` — variable product options with minor-unit prices.
* `GET /wp-json/manoosh/v1/orders/<id>/pay-url` — secure order-pay URL (logged-in owner only).

Supported SMS providers: Kavenegar, Faraz SMS (ippanel pattern), Melipayamak (pattern), Ghasedak, or any custom HTTP endpoint. You can also hook `manoosh_otp_send_sms` from your own code.

== Installation ==

1. Upload the `manoosh-app-auth` folder to `/wp-content/plugins/`.
2. Activate the plugin.
3. Go to «اپ مانوش» in the admin menu, choose your SMS provider and save.
4. Send a test SMS from the same page.
5. Optionally configure home banners (JSON) and featured category IDs.
