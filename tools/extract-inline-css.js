#!/usr/bin/env node
/*
  Extrae todos los <style> inline de index.html a archivos en assets/css
  - Crea backup: index.inline-css.backup.html
  - Por cada <style> no vacío:
      * crea assets/css/style-XXX.css
      * inserta un <link rel="stylesheet" href="assets/css/style-XXX.css">
      * conserva el <style> con sus atributos pero con un comentario, para no romper scripts que lo esperen en el DOM
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const backupPath = path.join(root, 'index.inline-css.backup.html');
const cssDir = path.join(root, 'assets', 'css');

function main() {
  if (!fs.existsSync(indexPath)) {
    console.error('No se encontró index.html en', indexPath);
    process.exit(1);
  }

  // Backup
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(indexPath, backupPath);
    console.log('Backup creado:', path.relative(root, backupPath));
  } else {
    console.log('Backup ya existía:', path.relative(root, backupPath));
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  fs.mkdirSync(cssDir, { recursive: true });

  let counter = 0;
  const newHtml = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (match, rawAttrs, cssContent) => {
    // Si el bloque de estilo está vacío/solo whitespace, lo dejamos como está
    if (!cssContent || cssContent.trim() === '') {
      return match;
    }

    counter += 1;
    const fileName = `style-${String(counter).padStart(3, '0')}.css`;
    const outPath = path.join(cssDir, fileName);

    // Escribimos el CSS tal cual
    fs.writeFileSync(outPath, cssContent, 'utf8');

    // Asegurar que los atributos se reconstruyan bien
    const attrs = rawAttrs || '';
    const linkTag = `<link rel="stylesheet" href="assets/css/${fileName}">`;

    // Preservamos el <style ...> con los mismos atributos pero sin reglas, para evitar que scripts
    // que esperan nodos <style data-*> fallen. Dejamos un comentario marcador
    const preservedStyle = `<style${attrs}>/* moved to assets/css/${fileName} */</style>`;

    // Insertamos el <link> antes para mantener el orden de cascada aproximado
    return `${linkTag}\n${preservedStyle}`;
  });

  fs.writeFileSync(indexPath, newHtml, 'utf8');
  console.log(`Extraídos ${counter} bloques <style> a`, path.relative(root, cssDir));
}

main();

