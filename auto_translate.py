#!/usr/bin/env python3
"""
Auto-traduce TODO el texto inglés visible en los HTML estáticos usando
el endpoint gratuito de Google Translate (translate.googleapis.com).

Características:
- Sin API key, sin billing
- Cache persistente en translation_cache.json (las llamadas son one-shot)
- Idempotente: salta texto que ya está en español
- Solo toca texto entre `>` y `<` — nunca scripts, styles, atributos
- Rate-limit suave (100ms entre llamadas) para no provocar bloqueo

Uso:
    python3 auto_translate.py            # traduce todos los HTML
    python3 auto_translate.py about      # traduce solo /about
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
CACHE_PATH = BASE / 'translation_cache.json'

# Carga el cache existente
if CACHE_PATH.exists():
    try:
        CACHE = json.loads(CACHE_PATH.read_text(encoding='utf-8'))
    except Exception:
        CACHE = {}
else:
    CACHE = {}

print(f'Cache cargado: {len(CACHE)} traducciones existentes')


def save_cache():
    CACHE_PATH.write_text(json.dumps(CACHE, ensure_ascii=False, indent=2), encoding='utf-8')


def gtranslate(text, sl='en', tl='es'):
    """Llama al endpoint público no oficial. Devuelve la traducción o el original si falla."""
    if not text or not text.strip():
        return text
    if text in CACHE:
        return CACHE[text]

    url = (
        'https://translate.googleapis.com/translate_a/single'
        f'?client=gtx&sl={sl}&tl={tl}&dt=t&q={urllib.parse.quote(text)}'
    )
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read().decode('utf-8')
        data = json.loads(raw)
        # data[0] es lista de [translated, original, ...] segments
        result = ''.join(seg[0] for seg in data[0] if seg and seg[0])
        if not result:
            return text
        CACHE[text] = result
        # Guardar cada 20 nuevas traducciones por si se corta
        if len(CACHE) % 20 == 0:
            save_cache()
        time.sleep(0.12)  # rate limit suave
        return result
    except Exception as e:
        print(f'  ! error traduciendo {text[:60]!r}: {e}', file=sys.stderr)
        return text


# === Detección de "esto vale traducir" ===
SPANISH_ONLY_CHARS = re.compile(r'[áéíóúñ¿¡üÁÉÍÓÚÑÜ]')
PURE_NON_LETTER = re.compile(r'^[\d\s\W_]+$')
PRICE_PATTERN = re.compile(r'^\$?\s*\d+(?:[.,]\d+)?$')
URL_PATTERN = re.compile(r'https?://|www\.', re.I)
EMAIL_PATTERN = re.compile(r'^\s*\S+@\S+\.\S+\s*$')
ENGLISH_HINT = re.compile(r'\b(the|and|with|for|our|this|that|from|are|your|you|we|us|they|their|of)\b', re.I)


PLACEHOLDER_PATTERN = re.compile(r'\x01PLH\d+\x02|\x00P\d+\x00|^P\d+$')


def is_translatable_english(text):
    s = text.strip()
    if len(s) < 2:
        return False
    if not re.search(r'[A-Za-z]', s):
        return False
    # Saltar placeholders de cualquier formato
    if PLACEHOLDER_PATTERN.search(s):
        return False
    if '\x00' in s or '\x01' in s or '\x02' in s:
        return False
    if SPANISH_ONLY_CHARS.search(s):
        return False  # ya tiene chars españoles distintivos
    if PURE_NON_LETTER.match(s):
        return False
    if PRICE_PATTERN.match(s):
        return False
    if URL_PATTERN.search(s):
        return False
    if EMAIL_PATTERN.match(s):
        return False
    if len(s) <= 3 and not re.match(r'^[A-Za-z]+$', s):
        return False
    return True


def translate_html(html, label=''):
    placeholders = []

    def stash(m):
        placeholders.append(m.group(0))
        return f'\x01PLH{len(placeholders)-1}\x02'

    # 1) Proteger scripts, styles, comentarios (incluyendo el hydrate JSON)
    html = re.sub(r'<script\b[^>]*>.*?</script>', stash, html, flags=re.S | re.I)
    html = re.sub(r'<style\b[^>]*>.*?</style>', stash, html, flags=re.S | re.I)
    html = re.sub(r'<!--.*?-->', stash, html, flags=re.S)

    # 2) Buscar texto visible entre `>` y `<`
    text_re = re.compile(r'>([^<>]+)<')

    # Recolectar candidatos únicos primero (para batchear cache)
    candidates = set()
    for m in text_re.finditer(html):
        chunk = m.group(1)
        # Preservar leading/trailing whitespace separadamente
        stripped = chunk.strip()
        if is_translatable_english(stripped):
            candidates.add(stripped)

    if not candidates:
        return html, 0

    print(f'  {label}: {len(candidates)} strings únicos a traducir')

    # 3) Traducir candidatos (cache + API)
    for i, text in enumerate(sorted(candidates, key=len, reverse=True), 1):
        if text not in CACHE:
            translated = gtranslate(text)
            if i % 10 == 0:
                print(f'    {i}/{len(candidates)} - "{text[:40]}..." → "{translated[:40]}..."')

    save_cache()

    # 4) Aplicar reemplazos
    def repl(m):
        chunk = m.group(1)
        stripped = chunk.strip()
        if stripped in CACHE:
            translated = CACHE[stripped]
            # Conservar whitespace lead/trail original
            lead = chunk[: len(chunk) - len(chunk.lstrip())]
            trail = chunk[len(chunk.rstrip()):]
            return '>' + lead + translated + trail + '<'
        return m.group(0)

    new_html = text_re.sub(repl, html)

    # 5) Restaurar bloques protegidos
    new_html = re.sub(r'\x01PLH(\d+)\x02', lambda m: placeholders[int(m.group(1))], new_html)
    return new_html, len(candidates)


def main():
    args = sys.argv[1:]
    if args:
        # Filtros específicos
        files = []
        for arg in args:
            p = BASE / arg
            if p.is_file():
                files.append(p)
            else:
                files.extend([x for x in BASE.glob(arg) if x.is_file()])
    else:
        patterns = ['index.html', 'about', 'contact',
                    'journal/*', 'shop/*', 'shop/category/*',
                    'shop/collections/*', 'support/*']
        files = []
        for pat in patterns:
            files.extend([p for p in BASE.glob(pat) if p.is_file()])
        # Filtrar archivos no-HTML (macOS .DS_Store, etc.)
        files = [f for f in files if not f.name.startswith('.') and f.suffix in ('', '.html')]

    print(f'\nProcesando {len(files)} archivos…\n')
    total_changed = 0
    for f in files:
        rel = f.relative_to(BASE)
        try:
            t = f.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            print(f'! {rel}: {e}')
            continue
        new, n = translate_html(t, label=str(rel))
        if new != t:
            f.write_text(new, encoding='utf-8')
            total_changed += 1
            print(f'  ✓ {rel} actualizado')
        else:
            print(f'  — {rel} sin cambios')

    save_cache()
    print(f'\nResumen: {total_changed} archivos modificados.')
    print(f'Cache final: {len(CACHE)} traducciones en disco.')


if __name__ == '__main__':
    main()
