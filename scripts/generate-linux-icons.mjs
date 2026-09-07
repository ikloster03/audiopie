#!/usr/bin/env node
/**
 * Генерация иконок для Linux (AppImage)
 * Создает набор PNG иконок разных размеров в build/icons/
 * Требует: npm install sharp --save-dev
 */

import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const assetsDir = join(rootDir, 'assets');
const iconsDir = join(rootDir, 'build', 'icons');

// Стандартные размеры иконок для Linux
const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256, 512];

async function generateLinuxIcons() {
  try {
    const sharp = (await import('sharp')).default;
    
    const svgPath = join(assetsDir, 'audiopie.svg');
    
    if (!existsSync(svgPath)) {
      console.error('❌ SVG файл не найден:', svgPath);
      process.exit(1);
    }
    
    // Создаем директорию для иконок
    if (!existsSync(iconsDir)) {
      mkdirSync(iconsDir, { recursive: true });
    }
    
    console.log('📦 Генерация Linux иконок из SVG...\n');
    
    for (const size of ICON_SIZES) {
      const outputPath = join(iconsDir, `${size}x${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ ${size}x${size}.png`);
    }
    
    console.log(`\n✅ Иконки созданы в ${iconsDir}`);
    console.log('   Используйте "icon": "build/icons" в electron-builder.json для Linux');
    
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    console.log('\nУстановите зависимости:');
    console.log('  npm install sharp --save-dev');
    process.exit(1);
  }
}

generateLinuxIcons();
