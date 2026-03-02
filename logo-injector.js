/**
 * logo-injector.js
 * Reemplaza el logo SVG de AXM por texto "RELY RYDER" usando la tipografía de la página.
 * Sobrevive a la rehidratación de Framer usando MutationObserver.
 */
(function () {
  'use strict';

  var LOGO_TEXT = 'RELY RYDER';
  var OBSERVE_MS = 12000; // observar durante 12 segundos

  // Estilo del logo en el header
  var HEADER_STYLE = "font-family:'Mona Sans',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.5px;color:#fff;white-space:nowrap;display:flex;align-items:center;line-height:1";

  // Estilo del logo en el footer (un poco más grande)
  var FOOTER_STYLE = "font-family:'Mona Sans',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#fff;white-space:nowrap;display:flex;align-items:center;line-height:1";

  function replaceLogoSVG() {
    var replaced = 0;

    // 1) Header logos: divs SVG con clase framer-1ncbjao dentro de <a> con data-framer-name="Logo"
    var headerLogos = document.querySelectorAll('a[data-framer-name="Logo"] .framer-1ncbjao');
    headerLogos.forEach(function (el) {
      // Solo reemplazar si es un div SVG (no si ya es nuestro span)
      if (el.tagName === 'SPAN' && el.textContent === LOGO_TEXT) return;
      if (el.getAttribute('data-framer-component-type') === 'SVG' || el.style.backgroundImage) {
        var span = document.createElement('span');
        span.className = 'framer-1ncbjao';
        span.setAttribute('style', HEADER_STYLE);
        span.setAttribute('data-logo-injected', 'true');
        span.textContent = LOGO_TEXT;
        el.parentNode.replaceChild(span, el);
        replaced++;
      }
    });

    // 2) Footer logos: divs SVG con clase framer-msz396 dentro de div con data-framer-name="Logo"
    var footerLogos = document.querySelectorAll('div[data-framer-name="Logo"] .framer-msz396');
    footerLogos.forEach(function (el) {
      if (el.tagName === 'SPAN' && el.textContent === LOGO_TEXT) return;
      if (el.getAttribute('data-framer-component-type') === 'SVG' || el.style.backgroundImage) {
        var span = document.createElement('span');
        span.className = 'framer-msz396';
        span.setAttribute('style', FOOTER_STYLE);
        span.setAttribute('data-logo-injected', 'true');
        span.textContent = LOGO_TEXT;
        el.parentNode.replaceChild(span, el);
        replaced++;
      }
    });

    // 3) Fallback: cualquier div con data-framer-name="AXM Logo" que siga existiendo
    var axmLogos = document.querySelectorAll('[data-framer-name="AXM Logo"]');
    axmLogos.forEach(function (el) {
      var isFooter = el.closest('.framer-hre06x') !== null;
      var span = document.createElement('span');
      span.className = el.className;
      span.setAttribute('style', isFooter ? FOOTER_STYLE : HEADER_STYLE);
      span.setAttribute('data-logo-injected', 'true');
      span.textContent = LOGO_TEXT;
      el.parentNode.replaceChild(span, el);
      replaced++;
    });

    return replaced;
  }

  function start() {
    replaceLogoSVG();

    // Observar el DOM para sobrevivir a rehidrataciones de Framer
    if (typeof MutationObserver !== 'undefined') {
      var end = Date.now() + OBSERVE_MS;
      var observer = new MutationObserver(function () {
        replaceLogoSVG();
        if (Date.now() > end) observer.disconnect();
      });
      observer.observe(document.documentElement, { subtree: true, childList: true });
    }

    // Reintentos rápidos para cubrir la ventana de rehidratación
    var attempts = 0;
    var id = setInterval(function () {
      attempts++;
      replaceLogoSVG();
      if (attempts > 30) clearInterval(id);
    }, 300);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
})();

