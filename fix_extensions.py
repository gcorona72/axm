#!/usr/bin/env python3
"""
Convierte archivos HTML sin extensión a `.html` para que GitHub Pages
los sirva con MIME type correcto (text/html). Actualiza también todos
los enlaces internos (`./about` → `./about.html`, etc.) en todas las
páginas.
"""
from pathlib import Path
import re

base = Path(__file__).resolve().parent

# 1) Identificar archivos extensionless que son HTML
patterns_for_files = ['about', 'contact',
                      'journal/*', 'shop/*', 'shop/category/*',
                      'shop/collections/*', 'support/*']
files_to_rename = []
for pat in patterns_for_files:
    for p in base.glob(pat):
        if p.is_file() and not p.suffix and not p.name.startswith('.'):
            files_to_rename.append(p)

# Generar mapa old→new (rutas relativas al root, sin extensión → con .html)
rename_map = {}
for f in files_to_rename:
    rel = f.relative_to(base).as_posix()
    rename_map[rel] = rel + '.html'

print(f'Archivos a renombrar: {len(rename_map)}')

# 2) Renombrar archivos en disco
renamed = 0
for old_rel, new_rel in rename_map.items():
    old_p = base / old_rel
    new_p = base / new_rel
    if not old_p.exists() or new_p.exists():
        continue
    old_p.rename(new_p)
    renamed += 1
print(f'Renombrados: {renamed}')

# 3) Actualizar enlaces en TODAS las páginas (incluyendo index.html)
all_htmls = [base / 'index.html']
for ext_pat in ['*.html', '**/*.html']:
    all_htmls.extend([p for p in base.glob(ext_pat) if p.is_file()])
# Dedup
all_htmls = list(dict.fromkeys(all_htmls))

# Construir regex de reemplazo
# Reemplaza href="./about", href="about", href="/about", etc. → con .html sufijo
# Solo si el path (sin la barra inicial) coincide con una key del rename_map.
sorted_paths = sorted(rename_map.keys(), key=len, reverse=True)

updated = 0
for f in all_htmls:
    if not f.exists():
        continue
    try:
        text = f.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    new = text
    for path in sorted_paths:
        # Para evitar que "shop" → "shop.html" matchee dentro de "shop/something",
        # exigimos que el siguiente char NO sea `/` ni alfanumérico.
        # Patrón: matches "path" tras `./`, `/`, o `"`, seguido de `"`, `?`, `#`, o `'`.
        # Captura prefijos: vacío, ./, /, ../, ../../, ../../../, etc.
        pattern = re.compile(
            r'([\"\'])((?:\.{1,2}/)*|/)' + re.escape(path) + r'(?=[\"\'?#])'
        )
        new = pattern.sub(
            lambda m: m.group(1) + m.group(2) + path + '.html',
            new
        )
    if new != text:
        f.write_text(new, encoding='utf-8')
        updated += 1
        rel = f.relative_to(base)
        print(f'  ✓ {rel}')

print(f'\nEnlaces actualizados en {updated} archivos.')
