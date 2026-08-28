/* global MSWLSkeleton */
(function () {
  'use strict';

  var config = window.MSWLSkeleton || {};
  var productSelector = '.wd-product, .product-grid-item, .product-wrapper, .wd-product .product-element-top';
  var allSelector = config.selectors || productSelector;
  var active = new WeakSet();
  var overlays = [];
  var finished = false;

  function makeOverlay(host, imageOnly) {
    if (active.has(host) || host.querySelector(':scope > .mswl-skeleton-overlay')) return;
    active.add(host);
    host.classList.add('mswl-skeleton-host');
    var overlay = document.createElement('span');
    overlay.className = 'mswl-skeleton-overlay' + (imageOnly ? ' mswl-skeleton-image-only' : ' mswl-skeleton-generic');
    overlay.setAttribute('aria-hidden', 'true');
    ['image', 'line-1', 'line-2', 'price'].forEach(function (name) {
      var shape = document.createElement('i');
      shape.className = 'mswl-skeleton-shape mswl-skeleton-' + name;
      overlay.appendChild(shape);
    });
    host.appendChild(overlay);
    overlays.push(overlay);
    // Keep AJAX replacements covered briefly; initial overlays are removed together on load.
    if (finished) {
      window.setTimeout(function () { hideOverlay(overlay); }, 450);
    }
  }

  function hideOverlay(overlay) {
    if (!overlay || !overlay.parentNode) return;
    overlay.classList.add('is-hidden');
    window.setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 260);
  }

  function imageTargets() {
    if (!config.images) return [];
    return Array.prototype.slice.call(document.querySelectorAll('img:not(.mswl-seen)'));
  }

  function markImages() {
    imageTargets().forEach(function (img) {
      img.classList.add('mswl-seen');
      if (!img.complete || img.naturalWidth === 0) {
        img.addEventListener('load', function () { img.classList.add('mswl-loaded'); }, { once: true });
        img.addEventListener('error', function () { img.classList.add('mswl-loaded'); }, { once: true });
      }
    });
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    var products = config.products ? root.querySelectorAll(productSelector) : [];
    var generic = config.content ? root.querySelectorAll(allSelector) : [];
    if (config.products && root.matches && root.matches(productSelector)) makeOverlay(root, false);
    if (config.content && root.matches && root.matches(allSelector)) makeOverlay(root, false);
    Array.prototype.forEach.call(products, function (el) { makeOverlay(el, false); });
    Array.prototype.forEach.call(generic, function (el) {
      if (!el.matches(productSelector)) makeOverlay(el, false);
    });
    markImages();
  }

  function done() {
    if (finished) return;
    finished = true;
    overlays.forEach(hideOverlay);
    document.documentElement.classList.remove('mswl-preloading');
    document.body.classList.add('mswl-skeleton-ready');
  }

  function start() {
    scan(document.body);
    window.addEventListener('load', done, { once: true });
    // A safety net for cached/failed resources and very slow pages.
    if (Number(config.delay) > 0) window.setTimeout(done, Number(config.delay));
    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes, scan);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // AJAX filters can replace product cards without emitting a predictable event.
    window.setTimeout(function () { observer.disconnect(); }, 10000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
