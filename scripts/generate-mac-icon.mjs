#!/usr/bin/env node

/**
 * Генерирует иконку для macOS с правильными отступами (~10% padding)
 * macOS иконки должны занимать ~80% холста для корректного отображения в Dock
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const inputSvg = join(projectRoot, 'assets/audiopie.svg');
const outputDir = join(projectRoot, 'assets');
const outputPng = join(outputDir, 'audiopie-mac.png');

// Размер финальной иконки (Apple рекомендует 1024x1024)
const CANVAS_SIZE = 1024;
// Иконка занимает 80% холста (10% padding с каждой стороны)
const ICON_SIZE = Math.round(CANVAS_SIZE * 0.80);
const PADDING = Math.round((CANVAS_SIZE - ICON_SIZE) / 2);

async function generateMacIcon() {
  console.log('Генерация иконки для macOS с отступами...');
  console.log(`  Размер холста: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
  console.log(`  Размер иконки: ${ICON_SIZE}x${ICON_SIZE}`);
  console.log(`  Отступ: ${PADDING}px (${((PADDING / CANVAS_SIZE) * 100).toFixed(1)}%)`);

  // Проверяем наличие ImageMagick или sharp
  let useImageMagick = false;
  try {
    execSync('which convert', { stdio: 'ignore' });
    useImageMagick = true;
  } catch {
    console.log('ImageMagick не найден, пробуем sharp...');
  }

  if (useImageMagick) {
    // Используем ImageMagick
    const cmd = [
      'convert',
      '-background', 'none',
      '-density', '300',
      inputSvg,
      '-resize', `${ICON_SIZE}x${ICON_SIZE}`,
      '-gravity', 'center',
      '-extent', `${CANVAS_SIZE}x${CANVAS_SIZE}`,
      outputPng
    ].join(' ');
    
    console.log(`Выполняю: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
  } else {
    // Используем sharp через Node.js
    try {
      const sharp = (await import('sharp')).default;
      
      // Рендерим SVG в нужном размере
      const iconBuffer = await sharp(inputSvg)
        .resize(ICON_SIZE, ICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      
      // Создаём холст с отступами
      await sharp({
        create: {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([{
          input: iconBuffer,
          top: PADDING,
          left: PADDING
        }])
        .png()
        .toFile(outputPng);
        
    } catch (e) {
      console.error('Ошибка: не удалось загрузить sharp');
      console.error('Установите ImageMagick: brew install imagemagick');
      console.error('Или sharp: npm install sharp');
      process.exit(1);
    }
  }

  console.log(`✅ Иконка сохранена: ${outputPng}`);
}

generateMacIcon().catch(console.error);
