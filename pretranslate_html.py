#!/usr/bin/env python3
"""
Pre-traduce strings ingleses → españoles directamente en los HTML
estáticos del sitio. Así el browser recibe ya el contenido traducido
y no hay flash de texto inglés. El JS sigue activo para mantener las
traducciones si React intenta revertirlas durante la hidratación.

Estrategia conservadora:
- Solo reemplaza strings dentro de etiquetas HTML visibles para el usuario
  (texto entre `>` y `<`), nunca dentro de scripts ni atributos.
- Aplica límite de palabra (`\\b`) para no destrozar fragmentos parciales
  (p. ej. evitar reemplazar "Shop" dentro de "Shopify").
- Idempotente: si encuentra el resultado ya en español, no hace nada.
"""
from pathlib import Path
import re
import json

base = Path(__file__).resolve().parent

# Diccionario alineado con safe-protection.js
TRANSLATIONS = {
    # Nav principal
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
    # Categorías
    'All': 'Todo',
    'New Arrivals': 'Novedades',
    'Best Sellers': 'Más Vendidos',
    'Best Seller': 'Más Vendido',
    'Tops': 'Superiores',
    'Bottoms': 'Inferiores',
    'Outerwear': 'Abrigos',
    'Accessories': 'Accesorios',
    'Sale': 'Oferta',
    'Categories': 'Categorías',
    'Collections': 'Colecciones',
    'Products': 'Productos',
    'Featured': 'Destacado',
    # Colecciones
    'Elements': 'Elementos',
    'Essentials': 'Esenciales',
    'Freedom': 'Libertad',
    'Motion': 'Movimiento',
    # CTAs
    'Shop Now': 'Comprar Ahora',
    'Shop now': 'Comprar ahora',
    'Buy Now': 'Comprar Ahora',
    'Add to Cart': 'Añadir al Carrito',
    'View Product': 'Ver Producto',
    'View All': 'Ver Todo',
    'View all': 'Ver todo',
    'Read More': 'Leer Más',
    'Read Entry': 'Leer Entrada',
    'Learn More': 'Saber Más',
    'Continue Shopping': 'Seguir Comprando',
    'Checkout': 'Pagar',
    'Subscribe': 'Suscribirse',
    'Sign Up': 'Registrarse',
    'Sign In': 'Iniciar Sesión',
    'Log In': 'Iniciar Sesión',
    'Log Out': 'Cerrar Sesión',
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
    # Hero
    'Just Dropped': 'Recién Llegado',
    'Just dropped': 'Recién llegado',
    'New': 'Nuevo',
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
    'About Axiom': 'Acerca de Axiom',
    'About AXIOM': 'Acerca de AXIOM',
    'Curated Gifts': 'Regalos Seleccionados',
    'Curated gifts': 'Regalos seleccionados',
    'Gift Guide': 'Guía de Regalos',
    'The Edit': 'La Edición',
    'Latest': 'Lo Último',
    'Trending': 'Tendencia',
    'Popular': 'Popular',
    'Recommended': 'Recomendado',
    'Featured Products': 'Productos Destacados',
    'Featured Product': 'Producto Destacado',
    'Shop the Look': 'Comprar el Look',
    'Lookbook': 'Catálogo',
    'New In': 'Nuevo',
    'Just In': 'Recién Llegado',
    'On Sale': 'En Oferta',
    'Top Sellers': 'Más Vendidos',
    'Quick View': 'Vista Rápida',
    'Wishlist': 'Lista de Deseos',
    'Save for Later': 'Guardar para Después',
    # Banner superior
    'Free standard shipping on all orders': 'Envío estándar gratis en todos los pedidos',
    'Free returns within 30 days': 'Devoluciones gratis en 30 días',
    '20% off with purchases of $200 or more': '20% de descuento en compras de $200 o más',
    'Free Shipping': 'Envío Gratis',
    'Free Returns': 'Devoluciones Gratis',
    # Soporte
    'Shipping & Delivery': 'Envío y Entrega',
    'Returns & Refunds': 'Devoluciones y Reembolsos',
    'Payment Methods': 'Métodos de Pago',
    'Privacy Policy': 'Política de Privacidad',
    'Terms & Conditions': 'Términos y Condiciones',
    'Cookie Policy': 'Política de Cookies',
    'Follow Us': 'Síguenos',
    'Newsletter': 'Boletín',
    'Customer Service': 'Atención al Cliente',
    'Help': 'Ayuda',
    'FAQs': 'Preguntas Frecuentes',
    'Stores': 'Tiendas',
    # Producto
    'Description': 'Descripción',
    'Details': 'Detalles',
    'Size': 'Talla',
    'Sizes': 'Tallas',
    'Color': 'Color',
    'Colors': 'Colores',
    'Material': 'Material',
    'Care': 'Cuidado',
    'Specifications': 'Especificaciones',
    'Reviews': 'Reseñas',
    'Related Products': 'Productos Relacionados',
    'You May Also Like': 'También Te Puede Gustar',
    'Price': 'Precio',
    'Quantity': 'Cantidad',
    'Total': 'Total',
    'Subtotal': 'Subtotal',
    'Tax': 'Impuestos',
    'Shipping': 'Envío',
    # About / valores
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
    'Intro': 'Introducción',
    # Contact
    'Get in Touch': 'Contáctanos',
    'Contact Us': 'Contáctanos',
    'Name': 'Nombre',
    'Full Name': 'Nombre Completo',
    'First Name': 'Nombre',
    'Last Name': 'Apellido',
    'Email': 'Correo',
    'Phone': 'Teléfono',
    'Message': 'Mensaje',
    'Subject': 'Asunto',
    'Required': 'Requerido',
    'Optional': 'Opcional',
    # Estados
    'Loading': 'Cargando',
    'Error': 'Error',
    'Success': 'Éxito',
    'Thank you': 'Gracias',
    'Thank You': 'Gracias',
    'Welcome': 'Bienvenido',
    'Yes': 'Sí',
    'No': 'No',
}

# Orden por longitud descendente: traducir las frases largas primero para
# que "New Arrivals" no se rompa por traducir "New" antes.
sorted_keys = sorted(TRANSLATIONS.keys(), key=len, reverse=True)

# Patrón: captura el texto entre `>` y `<` (texto visible HTML).
TEXT_BETWEEN_TAGS = re.compile(r'>([^<>]+)<')


def translate_text_chunk(chunk: str) -> str:
    """Aplica todas las traducciones a un fragmento de texto visible."""
    out = chunk
    for k in sorted_keys:
        v = TRANSLATIONS[k]
        # Word boundary para no romper sub-palabras; ignora case-sensitively
        # porque las keys ya tienen la casing correcta y queremos preservar
        # diferencias como "Shop" vs "shop".
        # Usamos un patrón que requiere que k esté delimitado por no-alfanuméricos
        # o inicio/fin del chunk.
        try:
            pattern = re.compile(r'(?<![A-Za-z0-9])' + re.escape(k) + r'(?![A-Za-z0-9])')
            out = pattern.sub(v, out)
        except re.error:
            continue
    return out


def process_html(html: str) -> str:
    # 1) Aislar y proteger los bloques que NO queremos tocar:
    #    <script>...</script>, <style>...</style>, <!-- ... --> de hydrate JSON,
    #    y la sección con data-framer-hydrate-v2 (atributo).
    placeholders = []

    def stash(m):
        placeholders.append(m.group(0))
        return f'\x00PROT{len(placeholders)-1}\x00'

    # Proteger scripts, styles, y comments
    html = re.sub(r'<script\b[^>]*>.*?</script>', stash, html, flags=re.S | re.I)
    html = re.sub(r'<style\b[^>]*>.*?</style>', stash, html, flags=re.S | re.I)
    html = re.sub(r'<!--.*?-->', stash, html, flags=re.S)

    # Reemplazar texto visible
    def repl(m):
        return '>' + translate_text_chunk(m.group(1)) + '<'

    html = TEXT_BETWEEN_TAGS.sub(repl, html)

    # Restaurar placeholders
    def unstash(m):
        idx = int(m.group(1))
        return placeholders[idx]

    html = re.sub(r'\x00PROT(\d+)\x00', unstash, html)
    return html


def main():
    patterns = ['index.html', 'about', 'contact',
                'journal/*', 'shop/*', 'shop/category/*',
                'shop/collections/*', 'support/*']
    files = []
    for pat in patterns:
        files.extend([p for p in base.glob(pat) if p.is_file()])

    changed = 0
    for f in files:
        try:
            t = f.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            print(f'! {f}: {e}')
            continue
        new = process_html(t)
        if new != t:
            f.write_text(new, encoding='utf-8')
            changed += 1
            rel = f.relative_to(base)
            print(f'  ✓ {rel}')

    print(f'\nProcesados {changed} de {len(files)} archivos.')


if __name__ == '__main__':
    main()
