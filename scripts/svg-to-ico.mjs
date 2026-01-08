#!/usr/bin/env node
/**
 * Конвертация SVG в ICO
 * Требует: npm install sharp png-to-ico --save-dev
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

async function convertSvgToIco() {
  try {
    const sharp = (await import('sharp')).default;
    const pngToIco = (await import('png-to-ico')).default;
    
    const svgPath = join(assetsDir, 'audiopie.svg');
    const icoPath = join(assetsDir, 'audiopie.ico');
    
    // Размеры для ICO (стандартные размеры Windows иконок)
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];
    
    console.log('📦 Генерация PNG разных размеров...');
    
    for (const size of sizes) {
      const buffer = await sharp(svgPath)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
      console.log(`  ✓ ${size}x${size}`);
    }
    
    console.log('🔧 Создание ICO...');
    const icoBuffer = await pngToIco(pngBuffers);
    writeFileSync(icoPath, icoBuffer);
    
    console.log(`✅ Создан ${icoPath}`);
    
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    console.log('\nУстановите зависимости:');
    console.log('  npm install sharp png-to-ico --save-dev');
    process.exit(1);
  }
}

convertSvgToIco();
