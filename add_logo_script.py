#!/usr/bin/env python3
import os

filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'report_logo.txt')

try:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    r = []

    # Verificar si ya está incluido
    if 'logo-injector.js' in content:
        r.append("logo-injector.js ya está incluido en index.html")
    else:
        # Insertar justo antes de </body>
        content = content.replace(
            '<script src="/badge-remover.js"></script>\n<!-- End of bodyEnd -->',
            '<script src="/badge-remover.js"></script>\n<script src="/logo-injector.js"></script>\n<!-- End of bodyEnd -->'
        )

        if 'logo-injector.js' in content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            r.append("✅ logo-injector.js añadido al index.html")
        else:
            r.append("❌ No se pudo insertar (patrón no encontrado)")

    with open(report_path, 'w') as f:
        f.write('\n'.join(r))

except Exception as e:
    with open(report_path, 'w') as f:
        f.write("ERROR: " + str(e))

