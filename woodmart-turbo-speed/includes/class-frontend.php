<?php
/**
 * HTML output buffer: minify, delay JS, lazy-load, LCP hints.
 *
 * @package WoodMart_Turbo_Speed
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class WTS_Frontend
 */
class WTS_Frontend {

	/**
	 * Whether buffering started.
	 *
	 * @var bool
	 */
	private static $buffering = false;

	/**
	 * Init.
	 */
	public static function init() {
		add_action( 'template_redirect', array( __CLASS__, 'start_buffer' ), 0 );
	}

	/**
	 * Start output buffer on front requests.
	 */
	public static function start_buffer() {
		if ( self::$buffering ) {
			return;
		}
		if ( WTS_Plugin::is_excluded_request() ) {
			return;
		}
		if ( ! self::needs_buffer() ) {
			return;
		}
		self::$buffering = true;
		ob_start( array( __CLASS__, 'process' ) );
	}

	/**
	 * Whether any HTML rewrite is enabled.
	 *
	 * @return bool
	 */
	private static function needs_buffer() {
		return WTS_Settings::on( 'delay_js' )
			|| WTS_Settings::on( 'minify_html' )
			|| WTS_Settings::on( 'lazyload' )
			|| WTS_Settings::on( 'fetchpriority' )
			|| WTS_Settings::on( 'page_cache' )
			|| WTS_Settings::on( 'disable_google_fonts' )
			|| WTS_Settings::on( 'woodmart_disable_gfonts' );
	}

	/**
	 * Process HTML.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	public static function process( $html ) {
		if ( ! is_string( $html ) || strlen( $html ) < 32 || false === stripos( $html, '<html' ) ) {
			return $html;
		}

		@ini_set( 'pcre.backtrack_limit', '20000000' ); // phpcs:ignore WordPress.PHP.IniSet.Risky
		@ini_set( 'pcre.recursion_limit', '20000000' ); // phpcs:ignore WordPress.PHP.IniSet.Risky

		if ( WTS_Settings::on( 'disable_google_fonts' ) || WTS_Settings::on( 'woodmart_disable_gfonts' ) ) {
			$html = self::strip_google_fonts( $html );
		}

		if ( WTS_Settings::on( 'delay_js' ) ) {
			$html = self::restore_lazy_src( $html );
			$html = self::inject_anti_lazy_css( $html );
		}

		if ( WTS_Settings::on( 'lazyload' ) || WTS_Settings::on( 'fetchpriority' ) ) {
			$html = self::images( $html );
			$html = self::iframes( $html );
		}

		if ( WTS_Settings::on( 'delay_js' ) && ! WTS_Plugin::is_sensitive_page() ) {
			$html = self::delay_js( $html );
		}

		if ( WTS_Settings::on( 'minify_html' ) ) {
			$html = self::minify( $html );
		}

		if ( WTS_Settings::on( 'page_cache' ) ) {
			WTS_Cache::store( $html );
		}

		return $html;
	}

	/**
	 * WoodMart hides images with data-src until JS runs. With Delay JS that
	 * would leave a blank page, so promote data-src to src.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function restore_lazy_src( $html ) {
		$html = preg_replace_callback(
			'#<img\s[^>]*>#i',
			static function ( $m ) {
				$tag = $m[0];
				if ( ! preg_match( '#\sdata-src=["\']([^"\']+)#i', $tag, $sm ) ) {
					return $tag;
				}
				$real = $sm[1];
				if ( preg_match( '#\ssrc=["\']([^"\']*)#i', $tag, $om ) ) {
					$orig = $om[1];
					$bad  = ( '' === $orig || 0 === strpos( $orig, 'data:' ) || false !== strpos( $orig, 'placeholder' ) || false !== strpos( $orig, 'lazy' ) );
					if ( $bad ) {
						$tag = preg_replace( '#\ssrc=["\'][^"\']*["\']#i', ' src="' . esc_url( $real ) . '"', $tag, 1 );
					}
				} else {
					$tag = preg_replace( '#<img#i', '<img src="' . esc_url( $real ) . '"', $tag, 1 );
				}
				if ( preg_match( '#\sdata-srcset=["\']([^"\']+)#i', $tag, $ssm ) && ! preg_match( '#(?:^|\s)srcset=#i', $tag ) ) {
					$tag = preg_replace( '#<img#i', '<img srcset="' . esc_attr( $ssm[1] ) . '"', $tag, 1 );
				}
				return $tag;
			},
			$html
		);
		return is_string( $html ) ? $html : '';
	}

	/**
	 * Undo WoodMart fade-in-on-JS so LCP is visible immediately.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function inject_anti_lazy_css( $html ) {
		$css = '<style id="wts-anti-lazy">img.lazy-load,img.wd-lazy-fade,img.wd-lazy-load,.wd-lazy-load,img[data-src]{opacity:1!important;visibility:visible!important;filter:none!important}</style>';
		if ( false !== stripos( $html, '</head>' ) ) {
			return str_ireplace( '</head>', $css . '</head>', $html );
		}
		return $css . $html;
	}

	/**
	 * Remove Google Fonts link/preload tags from HTML.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function strip_google_fonts( $html ) {
		$html = preg_replace( '#<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>#i', '', $html );
		$html = preg_replace( '#<style[^>]*id=["\'][^"\']*google-fonts[^"\']*["\'][^>]*>.*?</style>#is', '', $html );
		return is_string( $html ) ? $html : '';
	}

	/**
	 * Images: LCP eager + lazy rest.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function images( $html ) {
		$count = 0;
		$html  = preg_replace_callback(
			'#<img\s[^>]*>#i',
			static function ( $m ) use ( &$count ) {
				$tag = $m[0];
				$count++;

				$placeholder = false !== stripos( $tag, 'data-src' ) || false !== stripos( $tag, 'wd-lazy' ) || false !== stripos( $tag, 'lazy-load' );
				$has_real    = (bool) preg_match( '#\ssrc=["\'](?:https?:)?/#i', $tag );
				if ( $placeholder && ! $has_real ) {
					return $tag;
				}

				if ( 1 === $count && WTS_Settings::on( 'fetchpriority' ) ) {
					if ( false === stripos( $tag, 'fetchpriority=' ) ) {
						$tag = preg_replace( '#<img#i', '<img fetchpriority="high"', $tag, 1 );
					}
					if ( false === stripos( $tag, 'decoding=' ) ) {
						$tag = preg_replace( '#<img#i', '<img decoding="async"', $tag, 1 );
					}
					if ( false === stripos( $tag, 'loading=' ) ) {
						$tag = preg_replace( '#<img#i', '<img loading="eager"', $tag, 1 );
					}
					return $tag;
				}

				if ( WTS_Settings::on( 'lazyload' ) ) {
					if ( false === stripos( $tag, 'loading=' ) ) {
						$tag = preg_replace( '#<img#i', '<img loading="lazy"', $tag, 1 );
					}
					if ( false === stripos( $tag, 'decoding=' ) ) {
						$tag = preg_replace( '#<img#i', '<img decoding="async"', $tag, 1 );
					}
				}
				return $tag;
			},
			$html
		);

		if ( WTS_Settings::on( 'fetchpriority' ) && $count > 0 ) {
			if ( preg_match( '#<img[^>]+fetchpriority=["\']high["\'][^>]*>#i', $html, $m ) ) {
				$img = $m[0];
				$src = '';
				if ( preg_match( '#\ssrc=["\']([^"\']+)#i', $img, $sm ) ) {
					$src = $sm[1];
				}
				if ( $src && 0 !== strpos( $src, 'data:' ) && false === strpos( $html, 'as="image"' ) ) {
					$preload = '<link rel="preload" as="image" href="' . esc_url( $src ) . '" fetchpriority="high">';
					$html    = preg_replace( '#<head([^>]*)>#i', '<head$1>' . $preload, $html, 1 );
				}
			}
		}

		return is_string( $html ) ? $html : '';
	}

	/**
	 * Lazy iframes.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function iframes( $html ) {
		if ( ! WTS_Settings::on( 'lazyload' ) ) {
			return $html;
		}
		$html = preg_replace_callback(
			'#<iframe\s[^>]*>#i',
			static function ( $m ) {
				$tag = $m[0];
				if ( false !== stripos( $tag, 'loading=' ) ) {
					return $tag;
				}
				return preg_replace( '#<iframe#i', '<iframe loading="lazy"', $tag, 1 );
			},
			$html
		);
		return is_string( $html ) ? $html : '';
	}

	/**
	 * Delay JavaScript until first user interaction.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function delay_js( $html ) {
		$excludes = WTS_Settings::delay_excludes();
		$html     = preg_replace_callback(
			'#<script(\s[^>]*)?>(.*?)</script>#is',
			static function ( $m ) use ( $excludes ) {
				$attrs = isset( $m[1] ) ? $m[1] : '';
				$inner = isset( $m[2] ) ? $m[2] : '';
				$full  = $m[0];

				if ( preg_match( '/type\s*=\s*[\'"]\s*(application\/ld\+json|application\/json|speculationrules|text\/template|text\/html|importmap)/i', $attrs ) ) {
					return $full;
				}
				if ( false !== stripos( $attrs, 'wts-no-delay' ) || false !== stripos( $attrs, 'wts-delay-loader' ) || false !== stripos( $attrs, 'wts-delay-fragments' ) ) {
					return $full;
				}
				if ( false !== stripos( $attrs, 'ld+json' ) ) {
					return $full;
				}

				$hay = $attrs . ' ' . $inner;
				foreach ( $excludes as $ex ) {
					if ( '' !== $ex && false !== stripos( $hay, $ex ) ) {
						return $full;
					}
				}

				$orig_type = 'text/javascript';
				if ( preg_match( '/type\s*=\s*[\'"]([^\'"]+)[\'"]/i', $attrs, $tm ) ) {
					$orig_type = $tm[1];
					$attrs     = preg_replace( '/type\s*=\s*[\'"][^\'"]*[\'"]/i', 'type="wts/delayed"', $attrs );
				} else {
					$attrs = ' type="wts/delayed"' . $attrs;
				}
				$attrs .= ' data-wts-type="' . esc_attr( $orig_type ) . '"';
				return '<script' . $attrs . '>' . $inner . '</script>';
			},
			$html
		);

		if ( ! is_string( $html ) ) {
			return '';
		}

		$timeout = (int) WTS_Settings::get( 'delay_js_timeout', 0 );
		$loader  = self::delay_loader_js( $timeout );

		if ( false !== strpos( $html, '</body>' ) ) {
			$html = str_ireplace( '</body>', $loader . '</body>', $html );
		} else {
			$html .= $loader;
		}

		return $html;
	}

	/**
	 * Tiny inline loader. Scripts execute in original order.
	 *
	 * @param int $timeout Timeout seconds (0 = interaction only).
	 * @return string
	 */
	private static function delay_loader_js( $timeout ) {
		$timeout_ms = max( 0, (int) $timeout ) * 1000;
		$js         = '(function(){var loaded=false,t=' . $timeout_ms . ';function boot(){if(loaded)return;loaded=true;["keydown","mousemove","touchstart","touchmove","wheel","click","scroll"].forEach(function(e){window.removeEventListener(e,boot,false)});var nodes=Array.prototype.slice.call(document.querySelectorAll("script[type=\\"wts/delayed\\"]"));var i=0;function next(){if(i>=nodes.length)return;var s=nodes[i++],n=document.createElement("script"),a,j;for(j=0;j<s.attributes.length;j++){a=s.attributes[j];if(a.name==="type"||a.name==="data-wts-type"||a.name==="data-wts-delayed")continue;n.setAttribute(a.name,a.value);}n.type=s.getAttribute("data-wts-type")||"text/javascript";if(s.src){n.onload=n.onerror=next;n.src=s.src;s.parentNode.insertBefore(n,s);s.parentNode.removeChild(s);}else{n.text=s.text;s.parentNode.insertBefore(n,s);s.parentNode.removeChild(s);next();}}next();}["keydown","mousemove","touchstart","touchmove","wheel","click","scroll"].forEach(function(e){window.addEventListener(e,boot,{once:true,passive:true})});if(t>0)setTimeout(boot,t);})();';
		return '<script id="wts-delay-loader" data-wts-no-delay="1">' . $js . '</script>';
	}

	/**
	 * Conservative HTML minify.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function minify( $html ) {
		$parts = preg_split( '/(<(?:script|pre|textarea|style|code)\b[^>]*>.*?<\/(?:script|pre|textarea|style|code)>)/is', $html, -1, PREG_SPLIT_DELIM_CAPTURE );
		if ( ! is_array( $parts ) ) {
			return $html;
		}
		foreach ( $parts as $i => $part ) {
			if ( $i % 2 === 1 ) {
				continue;
			}
			$part          = preg_replace( '/<!--(?!\[if)(?!<!)(.*?)-->/s', '', $part );
			$part          = preg_replace( '/>\s+</', '><', $part );
			$part          = preg_replace( '/\s{2,}/', ' ', $part );
			$parts[ $i ] = $part;
		}
		$out = implode( '', $parts );
		return is_string( $out ) ? $out : $html;
	}
}
