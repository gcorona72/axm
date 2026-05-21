/**
 * safe-protection.js  (v4)
 *
 * Estrategia: NO tocar el DOM mientras Framer está hidratando.
 * Esperar a `window.load` + 1.5s para que React 18 termine su hidratación
 * y todos los chunks de la ruta carguen. Luego usar MutationObserver para
 * mantener las modificaciones aplicadas frente a re-renders / navegación SPA.
 */
(function () {
  'use strict';

  var LOGO_TEXT = 'RELY RYDER';

  // Diccionario amplio (case-insensitive en matching).
  // La key se compara con el text node trim()-eado. Los valores conservan
  // su capitalización propuesta; el CSS de Framer suele aplicar text-transform.
  var TRANSLATIONS = {
    // Nav principal
    'Shop': 'Tienda',
    'Journal': 'Revista',
    'About': 'Acerca de',
    'Contact': 'Contacto',
    'Support': 'Soporte',
    'Search': 'Buscar',
    'Account': 'Cuenta',
    'Cart': 'Carrito',
    'Menu': 'Menú',
    'Home': 'Inicio',

    // Categorías
    'All': 'Todo',
    'New Arrivals': 'Novedades',
    'Best Sellers': 'Más Vendidos',
    'Best Seller': 'Más Vendido',
    'Bestseller': 'Más Vendido',
    'Bestsellers': 'Más Vendidos',
    'Tops': 'Superiores',
    'Bottoms': 'Inferiores',
    'Outerwear': 'Abrigos',
    'Accessories': 'Accesorios',
    'Sale': 'Oferta',
    'Categories': 'Categorías',
    'Collections': 'Colecciones',
    'Products': 'Productos',
    'Featured': 'Destacado',

    // Colecciones
    'Elements': 'Elementos',
    'Essentials': 'Esenciales',
    'Freedom': 'Libertad',
    'Motion': 'Movimiento',

    // CTAs / Botones
    'Shop Now': 'Comprar Ahora',
    'Shop now': 'Comprar ahora',
    'Buy Now': 'Comprar Ahora',
    'Buy now': 'Comprar ahora',
    'Add to Cart': 'Añadir al Carrito',
    'Add to cart': 'Añadir al carrito',
    'View Product': 'Ver Producto',
    'View product': 'Ver producto',
    'View All': 'Ver Todo',
    'View all': 'Ver todo',
    'Read More': 'Leer Más',
    'Read more': 'Leer más',
    'Read Entry': 'Leer Entrada',
    'Read entry': 'Leer entrada',
    'Learn More': 'Saber Más',
    'Learn more': 'Saber más',
    'Continue Shopping': 'Seguir Comprando',
    'Continue shopping': 'Seguir comprando',
    'Checkout': 'Pagar',
    'Subscribe': 'Suscribirse',
    'Send': 'Enviar',
    'Submit': 'Enviar',
    'Sign Up': 'Registrarse',
    'Sign up': 'Registrarse',
    'Sign In': 'Iniciar Sesión',
    'Sign in': 'Iniciar sesión',
    'Log In': 'Iniciar Sesión',
    'Log in': 'Iniciar sesión',
    'Log Out': 'Cerrar Sesión',
    'Log out': 'Cerrar sesión',
    'Apply': 'Aplicar',
    'Filter': 'Filtrar',
    'Sort': 'Ordenar',
    'Close': 'Cerrar',
    'Back': 'Atrás',
    'Next': 'Siguiente',
    'Previous': 'Anterior',
    'Explore': 'Explorar',
    'Discover': 'Descubrir',
    'Upgrade': 'Actualizar',
    'Download': 'Descargar',
    'Open': 'Abrir',

    // Hero / textos destacados home
    'Just Dropped': 'Recién Llegado',
    'Just dropped': 'Recién llegado',
    'New': 'Nuevo',
    'New Drop': 'Nueva Entrega',
    'Coming Soon': 'Próximamente',
    'Sold Out': 'Agotado',
    'Out of Stock': 'Sin Stock',
    'In Stock': 'En Stock',
    'Limited Edition': 'Edición Limitada',
    'Move Your Way': 'Muévete a tu Manera',
    'Move your way': 'Muévete a tu manera',
    'Move your way.': 'Muévete a tu manera.',
    'Built for real performance': 'Construido para un rendimiento real',
    'Between Seasons': 'Entre Temporadas',
    'Between seasons': 'Entre temporadas',
    'From the Journal': 'De la Revista',
    'From The Journal': 'De la Revista',
    'Featured Journal': 'Revista Destacada',
    'About Axiom': 'Acerca de Axiom',
    'About AXIOM': 'Acerca de AXIOM',
    'Curated Gifts': 'Regalos Seleccionados',
    'Curated gifts': 'Regalos seleccionados',

    // Descripciones / textos largos
    'Find the perfect present with our curated selection of premium pieces. Timeless designs for those who appreciate quality.':
      'Encuentra el regalo perfecto con nuestra selección de piezas premium. Diseños atemporales para quienes aprecian la calidad.',
    'Layer up for changing weather with versatile pieces designed for adaptability. Premium materials meet considered design.':
      'Prepárate para el clima cambiante con piezas versátiles diseñadas para adaptarse. Materiales premium con diseño meditado.',
    'layer up for changing weather with versatile pieces designed for adaptability. Premium materials meet considered design.':
      'prepárate para el clima cambiante con piezas versátiles diseñadas para adaptarse. Materiales premium con diseño meditado.',
    'Premium materials meet considered design.': 'Materiales premium con diseño meditado.',
    'Timeless designs for those who appreciate quality.': 'Diseños atemporales para quienes aprecian la calidad.',
    'Designed for movement, built for life.': 'Diseñado para el movimiento, hecho para la vida.',
    'Crafted with intention, made to last.': 'Hecho con intención, creado para durar.',
    'Where form meets function.': 'Donde la forma se encuentra con la función.',
    'Engineered for the modern wardrobe.': 'Diseñado para el guardarropa moderno.',
    'Exploring the principles of design and how we approach everyday pieces.':
      'Explorando los principios del diseño y cómo abordamos las prendas cotidianas.',
    'EXPLORING THE PRINCIPLES OF DESIGN AND HOW WE APPROACH EVERYDAY PIECES.':
      'EXPLORANDO LOS PRINCIPIOS DEL DISEÑO Y CÓMO ABORDAMOS LAS PRENDAS COTIDIANAS.',

    // Journal article titles / common copy
    'The Evolution of Technical Wear': 'La Evolución de la Ropa Técnica',
    'Moving Through Cities': 'Moviéndose por las Ciudades',
    'Night Shift': 'Turno de Noche',
    'The Weight of Purpose': 'El Peso del Propósito',
    'Structure and Space': 'Estructura y Espacio',
    'The Space Between': 'El Espacio Intermedio',
    'The landscape of technical apparel has shifted dramatically.':
      'El panorama de la ropa técnica ha cambiado drásticamente.',

    // ABOUT page main copy
    'We craft considered essentials that embody the principles of thoughtful design, embracing the belief that our everyday garments should be as intentionally crafted as the spaces we inhabit.':
      'Creamos esenciales pensados que encarnan los principios del diseño meditado, con la convicción de que nuestras prendas cotidianas deberían estar tan cuidadas como los espacios que habitamos.',
    'AXIOM began with a simple observation: the modern wardrobe should mirror the principles of great architecture.':
      'RELY RYDER nació de una observación simple: el guardarropa moderno debería reflejar los principios de la gran arquitectura.',
    'AXIOM began with a simple observation: the modern wardrobe should mirror the principles of great architecture. Founded by a collective of designers and urban creatives.':
      'RELY RYDER nació de una observación simple: el guardarropa moderno debería reflejar los principios de la gran arquitectura. Fundado por un colectivo de diseñadores y creativos urbanos.',
    'Our values guide every decision we make, from design to production. We believe exceptional products come from clear principles, combining architectural influence with practical function.':
      'Nuestros valores guían cada decisión que tomamos, del diseño a la producción. Creemos que los productos excepcionales nacen de principios claros, combinando influencia arquitectónica con función práctica.',
    'We combine architectural principles with technical expertise to create our garments. Each piece goes through a rigorous development cycle, ensuring both quality construction and clean aesthetics.':
      'Combinamos principios arquitectónicos con experiencia técnica para crear nuestras prendas. Cada pieza pasa por un riguroso ciclo de desarrollo, garantizando una construcción de calidad y una estética limpia.',
    'Our team brings together diverse expertise across design, architecture, and technical apparel. Each member contributes unique perspectives while sharing our core vision for considered, architectural design.':
      'Nuestro equipo reúne experiencia diversa en diseño, arquitectura y ropa técnica. Cada integrante aporta perspectivas únicas mientras comparte nuestra visión central de un diseño meditado y arquitectónico.',
    'Built for real performance': 'Hecho para un rendimiento real',
    'Built\nfor real\nperformance': 'Hecho\npara un\nrendimiento real',
    'BUILT FOR REAL PERFORMANCE': 'HECHO PARA UN RENDIMIENTO REAL',

    // Press / quotes section
    'Design should serve both form and function in equal measure.':
      'El diseño debe servir tanto a la forma como a la función por igual.',
    'Every seam, every pocket, every element exists with purpose.':
      'Cada costura, cada bolsillo, cada elemento existe con un propósito.',
    'Quality is found in the deliberate consideration of every detail.':
      'La calidad se encuentra en la consideración deliberada de cada detalle.',
    'We subtract until only the essential remains.':
      'Restamos hasta que solo quede lo esencial.',
    'Clothing should enhance, not complicate, daily life.':
      'La ropa debe mejorar, no complicar, la vida diaria.',
    'Each piece adapts to your motion, your rhythm, your flow.':
      'Cada pieza se adapta a tu movimiento, tu ritmo, tu flujo.',
    'Founded by a collective of designers and urban creatives.':
      'Fundado por un colectivo de diseñadores y creativos urbanos.',

    // Brand swap
    'AXIOM': 'RELY RYDER',
    'Axiom': 'Rely Ryder',
    'axiom': 'rely ryder',
    'The beginning': 'El comienzo',
    'First Collection Launch': 'Lanzamiento de la Primera Colección',
    'Launched our first collection of considered essentials, focusing on clean lines, technical materials, and architectural influences.':
      'Lanzamos nuestra primera colección de esenciales pensados, con líneas limpias, materiales técnicos e influencias arquitectónicas.',
    'Technical Innovation': 'Innovación Técnica',
    'Introduced our proprietary technical fabrics and construction methods, setting new standards in performance wear.':
      'Introdujimos nuestras telas técnicas y métodos de construcción propios, marcando nuevos estándares en ropa de alto rendimiento.',
    'Global Recognition': 'Reconocimiento Global',
    'Expanded our presence globally while maintaining our commitment to considered design and sustainable practices.':
      'Expandimos nuestra presencia globalmente manteniendo el compromiso con el diseño meditado y las prácticas sostenibles.',
    'Future Forward': 'Hacia el Futuro',
    'Continuing to push boundaries in technical wear while staying true to our architectural roots and sustainable vision.':
      'Seguimos rompiendo límites en ropa técnica fieles a nuestras raíces arquitectónicas y a una visión sostenible.',
    'Meet the team': 'Conoce al equipo',
    'Our team brings together diverse expertise across design, architecture, and technical apparel.':
      'Nuestro equipo reúne experiencia diversa en diseño, arquitectura y ropa técnica.',
    'Each member contributes unique perspectives while sharing our core vision for considered, architectural design.':
      'Cada integrante aporta perspectivas únicas mientras comparte nuestra visión de diseño meditado y arquitectónico.',
    'Founder': 'Fundador',
    'Head of Design': 'Director de Diseño',
    'Technical Director': 'Director Técnico',
    'Our values guide every decision we make, from design to production.':
      'Nuestros valores guían cada decisión que tomamos, del diseño a la producción.',
    'We believe exceptional products come from clear principles, combining architectural influence with practical function.':
      'Creemos que los productos excepcionales nacen de principios claros, combinando influencia arquitectónica con función práctica.',
    'Design': 'Diseño',
    'Materials': 'Materiales',
    'Production': 'Producción',
    'Every garment begins with architectural concepts—proportion, space, structure—translated into pieces that feel as good as they look.':
      'Cada prenda comienza con conceptos arquitectónicos —proporción, espacio, estructura— traducidos en piezas que se sienten tan bien como se ven.',
    'We select materials based on performance and longevity, using construction methods that prioritize durability and comfort.':
      'Seleccionamos materiales por su rendimiento y longevidad, con métodos de construcción que priorizan la durabilidad y el confort.',
    'Our design details reveal their sophistication through use, creating garments that enhance rather than complicate daily life.':
      'Los detalles del diseño revelan su sofisticación con el uso, creando prendas que mejoran la vida diaria en vez de complicarla.',
    'our mission': 'nuestra misión',
    'our process': 'nuestro proceso',
    'our Values': 'nuestros Valores',
    'We combine architectural principles with technical expertise to create our garments.':
      'Combinamos principios arquitectónicos con experiencia técnica para crear nuestras prendas.',

    // CONTACT
    'For specific fit questions, email our support team at support@axiom.com with your height, weight, and usual size.':
      'Para preguntas sobre talla, escríbenos a support@axiom.com indicando tu altura, peso y talla habitual.',
    'See our returns page for full details.': 'Consulta nuestra página de devoluciones para más detalles.',
    'View our shipping page for delivery times and rates.': 'Consulta nuestra página de envíos para tiempos y tarifas.',
    'Refer to our detailed size guide for measurements, located on our product pages.':
      'Consulta la guía de tallas detallada disponible en cada página de producto.',
    'Wholesale inquiries': 'Consultas mayoristas',
    'For wholesale partnership opportunities, please email wholesale@axiom.com with details about your business.':
      'Para oportunidades de colaboración mayorista, escríbenos a wholesale@axiom.com con los datos de tu negocio.',
    'Talla & fit': 'Talla y ajuste',

    // JOURNAL section copy (home)
    'What began as purely functional design has transformed into something more considered - where performance meets architectural intention.':
      'Lo que comenzó como un diseño puramente funcional se ha transformado en algo más meditado — donde el rendimiento se encuentra con la intención arquitectónica.',
    'This evolution mirrors our own journey in creating garments that serve both purpose and form.':
      'Esta evolución refleja nuestro propio camino al crear prendas que sirven tanto al propósito como a la forma.',

    // Section labels
    'Living Architecture': 'Arquitectura Viva',
    'Engineering Better Materials': 'Materiales Mejor Diseñados',
    'Time as Design': 'El Tiempo Como Diseño',
    'After Hours': 'Después de Hora',
    'MY ACCOUNT': 'MI CUENTA',
    'My Account': 'Mi Cuenta',
    'My account': 'Mi cuenta',
    'Gift Guide': 'Guía de Regalos',
    'The Edit': 'La Edición',
    'Latest': 'Lo Último',
    'Trending': 'Tendencia',
    'Popular': 'Popular',
    'Recommended': 'Recomendado',
    'Featured Products': 'Productos Destacados',
    'Featured Product': 'Producto Destacado',
    'Shop the Look': 'Comprar el Look',
    'Shop the look': 'Comprar el look',
    'Complete the Look': 'Completar el Look',
    'Complete the look': 'Completar el look',
    'Lookbook': 'Catálogo',
    'New In': 'Nuevo',
    'Just In': 'Recién Llegado',
    'On Sale': 'En Oferta',
    'Top Sellers': 'Más Vendidos',
    'Quick View': 'Vista Rápida',
    'Quick view': 'Vista rápida',
    'Quick Add': 'Agregar Rápido',
    'Quick add': 'Agregar rápido',
    'Wishlist': 'Lista de Deseos',
    'Add to Wishlist': 'Añadir a Deseos',
    'Add to wishlist': 'Añadir a deseos',
    'Save': 'Guardar',
    'Save for Later': 'Guardar para Después',

    // Banner superior
    'Free standard shipping on all orders': 'Envío estándar gratis en todos los pedidos',
    'Free returns within 30 days': 'Devoluciones gratis en 30 días',
    '20% off with purchases of $200 or more': '20% de descuento en compras de $200 o más',
    'Free Shipping': 'Envío Gratis',
    'Free shipping': 'Envío gratis',
    'Free Returns': 'Devoluciones Gratis',
    'Free returns': 'Devoluciones gratis',

    // Soporte / footer
    'Shipping & Delivery': 'Envío y Entrega',
    'Shipping and Delivery': 'Envío y Entrega',
    'Returns & Refunds': 'Devoluciones y Reembolsos',
    'Returns and Refunds': 'Devoluciones y Reembolsos',
    'Payment Methods': 'Métodos de Pago',
    'Privacy Policy': 'Política de Privacidad',
    'Terms & Conditions': 'Términos y Condiciones',
    'Terms and Conditions': 'Términos y Condiciones',
    'Cookie Policy': 'Política de Cookies',
    'Follow Us': 'Síguenos',
    'Follow us': 'Síguenos',
    'Newsletter': 'Boletín',
    'Customer Service': 'Atención al Cliente',
    'Help': 'Ayuda',
    'FAQ': 'Preguntas Frecuentes',
    'FAQs': 'Preguntas Frecuentes',
    'Stores': 'Tiendas',
    'Find a Store': 'Encontrar una Tienda',

    // Producto
    'Description': 'Descripción',
    'Details': 'Detalles',
    'Size': 'Talla',
    'Sizes': 'Tallas',
    'Color': 'Color',
    'Colors': 'Colores',
    'Material': 'Material',
    'Materials': 'Materiales',
    'Care': 'Cuidado',
    'Specifications': 'Especificaciones',
    'Reviews': 'Reseñas',
    'Related Products': 'Productos Relacionados',
    'You May Also Like': 'También Te Puede Gustar',
    'You may also like': 'También te puede gustar',
    'Price': 'Precio',
    'Quantity': 'Cantidad',
    'Total': 'Total',
    'Subtotal': 'Subtotal',
    'Tax': 'Impuestos',
    'Shipping': 'Envío',

    // About / valores
    'Our Mission': 'Nuestra Misión',
    'Our Values': 'Nuestros Valores',
    'Our Story': 'Nuestra Historia',
    'Our Team': 'Nuestro Equipo',
    'Mission': 'Misión',
    'Values': 'Valores',
    'Press': 'Prensa',
    'Team': 'Equipo',
    'Story': 'Historia',
    'Vision': 'Visión',
    'Process': 'Proceso',
    'Journey': 'Trayectoria',
    'Value 1': 'Valor 1',
    'Value 2': 'Valor 2',
    'Value 3': 'Valor 3',
    'Intro': 'Introducción',

    // Contact / formulario
    'Get in Touch': 'Contáctanos',
    'Get in touch': 'Contáctanos',
    'Contact Us': 'Contáctanos',
    'Contact us': 'Contáctanos',
    'Name': 'Nombre',
    'Full Name': 'Nombre Completo',
    'First Name': 'Nombre',
    'Last Name': 'Apellido',
    'Email': 'Correo',
    'Email Address': 'Correo Electrónico',
    'Phone': 'Teléfono',
    'Message': 'Mensaje',
    'Subject': 'Asunto',
    'Required': 'Requerido',
    'Optional': 'Opcional',

    // Estados
    'Loading': 'Cargando',
    'Loading...': 'Cargando...',
    'Error': 'Error',
    'Success': 'Éxito',
    'Thank you': 'Gracias',
    'Thank You': 'Gracias',
    'Welcome': 'Bienvenido',
    'Yes': 'Sí',
    'No': 'No',

    // Badges template (los ocultamos pero por si quedan)
    'Unlock template': 'Desbloquear plantilla',
    'Unlock Template': 'Desbloquear Plantilla',
    'Made in Framer': '',
    'Made with Framer': '',
    'Built with Framer': '',
    'Built in Framer': ''
  };

  // Mapa case-insensitive para matching más flexible
  var TRANSLATIONS_CI = {};
  Object.keys(TRANSLATIONS).forEach(function (k) {
    TRANSLATIONS_CI[k.toLowerCase()] = TRANSLATIONS[k];
  });

  // WeakSet para text nodes ya traducidos (evita reemplazos repetidos)
  var translatedNodes = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;

  // ====== BADGE / TEMPLATE BUTTON REMOVAL ======
  function isBadgeRoot(el) {
    if (!el || el.nodeType !== 1) return false;
    try {
      var cl = el.classList ? Array.from(el.classList) : [];
      if (cl.indexOf('framer-RbLO6') !== -1) return true;
      if (cl.indexOf('framer-nm3c8g') !== -1) return true;
      var dataName = el.getAttribute && el.getAttribute('data-framer-name');
      if (dataName && /^open$/i.test(dataName)) return true;
      var links = el.querySelectorAll ? el.querySelectorAll('a[href]') : [];
      for (var i = 0; i < links.length; i++) {
        var href = (links[i].getAttribute('href') || '').toLowerCase();
        if (href.indexOf('launchnow.design') !== -1) return true;
        if (href.indexOf('frameship.io') !== -1) return true;
        if (href.indexOf('framer.com/templates') !== -1) return true;
      }
    } catch (_) {}
    return false;
  }

  function removeBadges() {
    try {
      var c = document.getElementById('__framer-badge-container');
      if (c && c.parentElement) c.parentElement.removeChild(c);
    } catch (_) {}
    try {
      var nodes = document.querySelectorAll(
        'div.framer-RbLO6, div.framer-nm3c8g, a[href*="launchnow.design"], a[href*="frameship.io"], a[href*="framer.com/templates"]'
      );
      Array.prototype.forEach.call(nodes, function (n) {
        var root = n;
        for (var hop = 0; hop < 4 && root.parentElement; hop++) {
          if (isBadgeRoot(root)) break;
          root = root.parentElement;
        }
        if (root && root.parentElement && isBadgeRoot(root)) {
          root.parentElement.removeChild(root);
        } else if (n && n.parentElement) {
          n.style.display = 'none';
        }
      });
    } catch (_) {}
    // "Unlock template" y "Made in Framer" por texto
    try {
      var spans = document.querySelectorAll('a, button, div');
      Array.prototype.forEach.call(spans, function (el) {
        if (!el || el.__hidden) return;
        var t = (el.textContent || '').trim();
        if (t === 'Unlock template' || t === 'Made in Framer' ||
            t === 'Unlock Template' || t === 'Made with Framer') {
          var n = el;
          for (var hop = 0; hop < 5 && n.parentElement; hop++) {
            n = n.parentElement;
            if (n.offsetHeight && n.offsetHeight < 200) break;
          }
          if (n) { n.style.display = 'none'; n.__hidden = true; }
        }
      });
    } catch (_) {}
  }

  // ====== LOGO REPLACEMENT ======
  function replaceLogo() {
    try {
      var logos = document.querySelectorAll('a[data-framer-name="Logo"] .framer-1ncbjao');
      Array.prototype.forEach.call(logos, function (el) {
        if (!el || el.getAttribute('data-logo-injected') === 'true') return;
        var span = document.createElement('span');
        span.className = 'framer-1ncbjao';
        span.setAttribute('data-logo-injected', 'true');
        span.textContent = LOGO_TEXT;
        span.style.cssText = "font-family:'Mona Sans',sans-serif;font-size:18px;font-weight:800;color:#fff;letter-spacing:0.02em;white-space:nowrap;";
        if (el.parentNode) el.parentNode.replaceChild(span, el);
      });
    } catch (_) {}
  }

  // ====== TRANSLATIONS ======
  function translateText(raw) {
    if (!raw) return null;
    var trimmed = raw.trim();
    if (!trimmed) return null;
    if (TRANSLATIONS.hasOwnProperty(trimmed)) return raw.replace(trimmed, TRANSLATIONS[trimmed]);
    var lower = trimmed.toLowerCase();
    if (TRANSLATIONS_CI.hasOwnProperty(lower)) return raw.replace(trimmed, TRANSLATIONS_CI[lower]);
    return null;
  }

  // Reemplaza el primer text node descendiente y vacía los demás.
  // Útil cuando el texto "New Arrivals" está partido entre múltiples spans.
  function replaceCompoundText(el, newText) {
    var firstText = null;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (firstText === null) {
        // Conservar leading/trailing whitespace del primer text node
        var raw = n.textContent;
        var lead = raw.match(/^\s*/)[0];
        var trail = raw.match(/\s*$/)[0];
        n.textContent = lead + newText + trail;
        firstText = n;
        if (translatedNodes) translatedNodes.add(n);
      } else {
        // Vaciar los demás text nodes (conservando whitespace para no romper inline-block gaps)
        var rt = n.textContent;
        var lt = rt.match(/^\s*/)[0];
        var tt = rt.match(/\s*$/)[0];
        n.textContent = lt + tt;
        if (translatedNodes) translatedNodes.add(n);
      }
    }
    return firstText !== null;
  }

  // Elementos cuyo textContent completo se traduce como un todo
  // (para evitar pisar contenido grande, sólo si textContent tiene ≤ 80 chars).
  function tryCompoundTranslation(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.__translatedCompound) return false;
    var full = (el.textContent || '').trim();
    if (!full || full.length > 600) return false;
    var rep = translateText(full);
    if (rep === null) return false;
    // Si el elemento contiene un único text node ya manejado, lo dejamos al loop principal.
    if (el.childNodes.length === 1 && el.firstChild.nodeType === 3) return false;
    // Evitar tocar elementos con hijos no-text relevantes (imágenes, inputs, etc.)
    var hasMedia = el.querySelector && el.querySelector('img,svg,input,video,iframe,canvas');
    if (hasMedia) return false;
    if (replaceCompoundText(el, rep.trim())) {
      el.__translatedCompound = true;
      return true;
    }
    return false;
  }

  function walkAndTranslate(root) {
    if (!root) return;
    var stack = [root];
    while (stack.length) {
      var node = stack.pop();
      if (!node) continue;
      var nt = node.nodeType;
      if (nt === 3) {
        // TEXT NODE
        if (translatedNodes && translatedNodes.has(node)) continue;
        var replaced = translateText(node.textContent);
        if (replaced !== null) {
          node.textContent = replaced;
          if (translatedNodes) translatedNodes.add(node);
        }
        continue;
      }
      if (nt !== 1) continue;
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'svg' || tag === 'SVG') continue;
      // Probar traducción compuesta primero (texto partido en varios spans)
      if (tryCompoundTranslation(node)) continue;
      var kids = node.childNodes;
      for (var i = 0; i < kids.length; i++) stack.push(kids[i]);
    }
  }

  function applyAll() {
    removeBadges();
    replaceLogo();
    if (document.body) walkAndTranslate(document.body);
  }

  // ====== ARRANQUE DIFERIDO ======
  function start() {
    setTimeout(applyAll, 50);
    setTimeout(applyAll, 600);
    setTimeout(applyAll, 1500);
    setTimeout(applyAll, 3000);

    try {
      var pending = false;
      var mo = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          applyAll();
        });
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (_) {}
  }

  function boot() {
    // Sin delay — el HTML ya viene pre-traducido en disco para los strings
    // simples (atómicos). El JS solo necesita procesar frases divididas
    // en varios <span>, lo cual se hace en walkAndTranslate.
    start();
  }

  // Arrancar lo antes posible: si el DOM ya está parseado, vamos ya.
  if (document.readyState !== 'loading') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  }
})();
