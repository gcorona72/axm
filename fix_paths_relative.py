#!/usr/bin/env python3
"""
Convierte las referencias absolutas (/safe-protection.js,
/assets/css/axm-instant.css) a paths relativos para que funcionen
tanto en local como en GitHub Pages (subpath /axm/).
"""
from pathlib import Path
import re

base = Path(__file__).resolve().parent

patterns = ['index.html', 'about', 'contact',
            'journal/*', 'shop/*', 'shop/category/*',
            'shop/collections/*', 'support/*']

files = []
for pat in patterns:
    files.extend([p for p in base.glob(pat) if p.is_file()])
files = [f for f in files if not f.name.startswith('.')]

# Recursos absolutos que debemos relativizar
ABSOLUTE_REFS = [
    '/safe-protection.js',
    '/assets/css/axm-instant.css',
]

count = 0
for f in files:
    try:
        text = f.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue

    # Calcular profundidad relativa al root del repo
    rel = f.relative_to(base)
    depth = len(rel.parts) - 1
    prefix = '../' * depth if depth > 0 else ''

    new = text
    for abs_ref in ABSOLUTE_REFS:
        # Convertir "/safe-protection.js" → "../safe-protection.js" (o "" desde root)
        relative_ref = prefix + abs_ref.lstrip('/')
        # Reemplazar tanto con como sin query string
        new = re.sub(
            r'(["\'(])' + re.escape(abs_ref) + r'(\?[^"\')\s]*)?(["\')\s])',
            lambda m: m.group(1) + relative_ref + (m.group(2) or '') + m.group(3),
            new
        )

    if new != text:
        f.write_text(new, encoding='utf-8')
        count += 1
        print(f'  ✓ {rel}  (depth={depth}, prefix={prefix!r})')

print(f'\n{count} archivos actualizados.')
