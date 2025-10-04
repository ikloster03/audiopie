#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcRenderer = path.join(projectRoot, 'src', 'renderer');
const distRenderer = path.join(projectRoot, 'dist', 'renderer');

const ensureDirSync = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const copyFileSync = (source, target) => {
  ensureDirSync(path.dirname(target));
  fs.copyFileSync(source, target);
};

const copyDirectorySync = (sourceDir, targetDir) => {
  ensureDirSync(targetDir);
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectorySync(sourcePath, targetPath);
    } else if (entry.isFile()) {
      copyFileSync(sourcePath, targetPath);
    }
  }
};

const copyAll = () => {
  if (!fs.existsSync(srcRenderer)) {
    return;
  }
  copyFileSync(path.join(srcRenderer, 'index.html'), path.join(distRenderer, 'index.html'));
  const stylesDir = path.join(srcRenderer, 'styles');
  if (fs.existsSync(stylesDir)) {
    copyDirectorySync(stylesDir, path.join(distRenderer, 'styles'));
  }
};

const watchMode = process.argv.includes('--watch');

copyAll();

if (watchMode) {
  const debounce = (fn, delay) => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  };
  const debouncedCopy = debounce(copyAll, 100);
  const indexPath = path.join(srcRenderer, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.watch(indexPath, debouncedCopy);
  }
  const stylesDir = path.join(srcRenderer, 'styles');
  if (fs.existsSync(stylesDir)) {
    fs.watch(stylesDir, { recursive: false }, debouncedCopy);
  }
}
