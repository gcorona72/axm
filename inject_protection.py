#!/usr/bin/env python3
"""
Inyecta el script safe-protection.js en TODAS las páginas secundarias,
con `defer` para que no bloquee la carga y se ejecute en orden documental
después de los módulos de Framer.
"""
from pathlib import Path

base = Path(__file__).resolve().parent
patterns = ['about', 'contact', 'journal/*', 'shop/*', 'shop/category/*',
            'shop/collections/*', 'support/*']

files = []
for pat in patterns:
    files.extend([p for p in base.glob(pat) if p.is_file()])

# Tag canónico — fácil de detectar para idempotencia
TAG = '<!-- AXM-PROTECTION -->'
INJECT = (
    '\n' + TAG +
    '\n<script src="/safe-protection.js" defer></script>\n'
)

added = 0
skipped = 0
for path in files:
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        print(f'⚠️  {path}: {e}')
        continue
    if TAG in text:
        skipped += 1
        continue
    # Calcular ruta relativa al safe-protection.js desde la página
    depth = len(path.relative_to(base).parts) - 1
    href = ('../' * depth) + 'safe-protection.js' if depth > 0 else 'safe-protection.js'
    inject = '\n' + TAG + f'\n<script src="{href}" defer></script>\n'
    # Insertar justo antes de </body>
    if '</body>' in text:
        new_text = text.replace('</body>', inject + '</body>', 1)
    elif '</html>' in text:
        new_text = text.replace('</html>', inject + '</html>', 1)
    else:
        new_text = text + inject
    path.write_text(new_text, encoding='utf-8')
    added += 1
    print(f'  + {path.relative_to(base)}  (href={href})')

print(f'\nResumen: añadidos={added}  ya tenían={skipped}  total={len(files)}')
