/**
 * Script de traducción persistente ES
 * Se ejecuta con máxima prioridad para traducir el contenido antes que otros scripts
 */
(function() {
  'use strict';

  // Diccionario de traducciones
  const translations = {
    // Navegación y menú
    'Shop': 'Tienda',
    'Journal': 'Revista',
    'About': 'Acerca de',
    'Contact': 'Contacto',
    'Support': 'Soporte',

    // Categorías
    'All': 'Todo',
    'New Arrivals': 'Novedades',
    'Best Sellers': 'Más Vendidos',
    'Tops': 'Superiores',
    'Bottoms': 'Inferiores',
    'Outerwear': 'Abrigos',
    'Accessories': 'Accesorios',
    'Sale': 'Oferta',

    // Colecciones
    'Elements': 'Elementos',
    'Essentials': 'Esenciales',
    'Freedom': 'Libertad',
    'Motion': 'Movimiento',
    'Collections': 'Colecciones',
    'Category': 'Categoría',

    // Productos
    'Architectural Daypack': 'Mochila Arquitectónica',
    'Element Cargo': 'Cargo Element',
    'Elements Hybrid Quarter Zip': 'Sudadera Híbrida Elements',
    'Elements Tech Jacket': 'Chaqueta Técnica Elements',
    'Elements Weather Hoodie': 'Sudadera Climática Elements',
    'Elements Weather Pant': 'Pantalón Climático Elements',
    'Essential Crewneck': 'Sudadera Esencial',
    'Essential Hoodie': 'Sudadera con Capucha Esencial',
    'Essential Tee': 'Camiseta Esencial',
    'Essential Trouser': 'Pantalón Esencial',
    'Freedom Graphic Tee': 'Camiseta Gráfica Freedom',
    'Freedom Oversized Hoodie': 'Sudadera Oversized Freedom',
    'Freedom Statement Crewneck': 'Sudadera Statement Freedom',
    'Minimal Socks': 'Calcetines Minimalistas',
    'Motion Performance Pant': 'Pantalón Performance Motion',
    'Motion Performance Tee': 'Camiseta Performance Motion',
    'Motion Tech Hoodie': 'Sudadera Técnica Motion',
    'Motion Track Jacket': 'Chaqueta Track Motion',
    'Premium Cap': 'Gorra Premium',
    'Statement Track': 'Track Statement',
    'Tech Short': 'Short Técnico',
    'Technical Belt': 'Cinturón Técnico',
    'Technical Side Bag': 'Bolso Lateral Técnico',
    'Weather Bucket': 'Sombrero Bucket',

    // Textos comunes
    'Add to Cart': 'Añadir al Carrito',
    'Buy Now': 'Comprar Ahora',
    'View Details': 'Ver Detalles',
    'Learn More': 'Saber Más',
    'Read More': 'Leer Más',
    'Shop Now': 'Comprar Ahora',
    'View All': 'Ver Todo',
    'Subscribe': 'Suscribirse',
    'Get Started': 'Comenzar',

    // Soporte
    'Shipping & Delivery': 'Envío y Entrega',
    'Returns & Refunds': 'Devoluciones y Reembolsos',
    'Payment Methods': 'Métodos de Pago',
    'Terms & Conditions': 'Términos y Condiciones',
    'Privacy Policy': 'Política de Privacidad',

    // Journal
    'Moving Through Cities': 'Moviéndose por las Ciudades',
    'Night Shift': 'Turno de Noche',
    'Structure and Space': 'Estructura y Espacio',
    'The Evolution of Technical Wear': 'La Evolución de la Ropa Técnica',
    'The Space Between': 'El Espacio Intermedio',
    'The Weight of Purpose': 'El Peso del Propósito',

    // Acciones
    'Search': 'Buscar',
    'Cart': 'Carrito',
    'Account': 'Cuenta',
    'Sign In': 'Iniciar Sesión',
    'Sign Up': 'Registrarse',
    'Log Out': 'Cerrar Sesión',

    // Textos descriptivos comunes
    'Featured': 'Destacado',
    'New': 'Nuevo',
    'Popular': 'Popular',
    'Trending': 'Tendencia',
    'Limited Edition': 'Edición Limitada',
    'Sold Out': 'Agotado',
    'In Stock': 'En Stock',
    'Pre Order': 'Pre-Orden',

    // Framer badges
    'Get this template': 'Obtener esta plantilla',
    "Let's go!": '¡Vamos!',
    "Let's go!": '¡Vamos!',

    // Otros textos comunes
    'Size': 'Talla',
    'Color': 'Color',
    'Quantity': 'Cantidad',
    'Price': 'Precio',
    'Total': 'Total',
    'Checkout': 'Pagar',
    'Continue Shopping': 'Seguir Comprando',
    'Your cart is empty': 'Tu carrito está vacío',
    'Free Shipping': 'Envío Gratis',
    'Email': 'Correo Electrónico',
    'Password': 'Contraseña',
    'Confirm Password': 'Confirmar Contraseña',
    'First Name': 'Nombre',
    'Last Name': 'Apellido',
    'Address': 'Dirección',
    'City': 'Ciudad',
    'State': 'Estado',
    'Zip Code': 'Código Postal',
    'Country': 'País',
    'Phone': 'Teléfono'
  };

  // Función para traducir texto con coincidencia exacta e insensible a mayúsculas
  function translateText(text) {
    if (!text || typeof text !== 'string') return text;

    const trimmed = text.trim();

    // Buscar coincidencia exacta
    for (const [eng, esp] of Object.entries(translations)) {
      if (trimmed === eng) {
        return text.replace(trimmed, esp);
      }
    }

    // Buscar coincidencia case-insensitive
    const lowerTrimmed = trimmed.toLowerCase();
    for (const [eng, esp] of Object.entries(translations)) {
      if (lowerTrimmed === eng.toLowerCase()) {
        return text.replace(trimmed, esp);
      }
    }

    // Buscar coincidencias parciales para textos más largos
    let translated = text;
    for (const [eng, esp] of Object.entries(translations)) {
      const regex = new RegExp('\\b' + eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      translated = translated.replace(regex, esp);
    }

    return translated;
  }

  // Atributos a traducir
  const attributesToTranslate = [
    'placeholder',
    'title',
    'alt',
    'aria-label',
    'data-original-title',
    'value'
  ];

  // Función para traducir un nodo de texto
  function translateTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const original = node.textContent;
      const translated = translateText(original);
      if (translated !== original) {
        node.textContent = translated;
        return true;
      }
    }
    return false;
  }

  // Función para traducir atributos de un elemento
  function translateElementAttributes(element) {
    let changed = false;
    attributesToTranslate.forEach(attr => {
      if (element.hasAttribute(attr)) {
        const original = element.getAttribute(attr);
        const translated = translateText(original);
        if (translated !== original) {
          element.setAttribute(attr, translated);
          changed = true;
        }
      }
    });
    return changed;
  }

  // Función para traducir un elemento y sus hijos
  function translateElement(element) {
    if (!element) return;

    // Marcar como traducido para evitar re-traducción constante
    if (element.hasAttribute && element.hasAttribute('data-translated')) {
      return;
    }

    // Traducir atributos
    translateElementAttributes(element);

    // Traducir nodos de texto directos
    const childNodes = Array.from(element.childNodes);
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        translateElement(node);
      }
    });

    // Marcar como traducido
    if (element.setAttribute) {
      element.setAttribute('data-translated', 'true');
    }
  }

  // Función para traducir toda la página
  function translatePage() {
    translateElement(document.body);
  }

  // Configurar MutationObserver para capturar cambios ANTES que otros scripts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      // Traducir nodos añadidos
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          translateElement(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          translateTextNode(node);
        }
      });

      // Re-traducir nodos modificados
      if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
        translateTextNode(mutation.target);
      }

      // Re-traducir si cambian atributos
      if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
        const attr = mutation.attributeName;
        if (attributesToTranslate.includes(attr)) {
          const element = mutation.target;
          const original = element.getAttribute(attr);
          const translated = translateText(original);
          if (translated !== original && translated !== mutation.oldValue) {
            element.setAttribute(attr, translated);
          }
        }
      }
    });
  });

  // Iniciar observación con máxima prioridad
  function startObserver() {
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: attributesToTranslate
    });
  }

  // Ejecutar traducción inicial inmediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      translatePage();
      startObserver();
      // Re-traducir periódicamente para capturar contenido cargado dinámicamente
      setInterval(translatePage, 1000);
    });
  } else {
    translatePage();
    startObserver();
    // Re-traducir periódicamente
    setInterval(translatePage, 1000);
  }

  // Interceptar antes de que se cargue completamente
  setTimeout(translatePage, 0);
  setTimeout(translatePage, 100);
  setTimeout(translatePage, 500);
  setTimeout(translatePage, 1000);
  setTimeout(translatePage, 2000);

  // Traducir cuando la página esté completamente cargada
  window.addEventListener('load', () => {
    translatePage();
    // Continuar traduciendo después de la carga
    setTimeout(translatePage, 100);
    setTimeout(translatePage, 500);
    setTimeout(translatePage, 1000);
  });

  console.log('✓ Traductor ES activado - La página se traducirá automáticamente');
})();

