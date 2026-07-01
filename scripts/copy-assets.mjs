/**
 * Savor 主题 - 复制静态资源到思源笔记主题目录
 *
 * 复制 theme.json、font/、i18n/ 等非构建产物的文件
 */

import { existsSync, mkdirSync, cpSync, readdirSync, statSync, copyFileSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// 思源笔记主题目录
const DEFAULT_DIST_DIR = resolve(rootDir, 'dist');
const distDir = process.env.SAVOR_DIST_DIR || DEFAULT_DIST_DIR;

// 需要复制的目录列表
const copyDirs = ['font', 'i18n'];

// 需要复制的单个文件列表
const copyFiles = [
  'theme.json',
  'icon.png',
  'preview.png',
  'README.md',
  'README_zh_CN.md',
];

function copyAssets() {
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  // 复制目录
  for (const dir of copyDirs) {
    const srcDir = resolve(rootDir, dir);
    const destDir = resolve(distDir, dir);
    if (existsSync(srcDir)) {
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      cpSync(srcDir, destDir, { recursive: true, force: true });
      const count = countFiles(destDir);
      console.log(`[资源] ✓ ${dir}/ → ${count} 个文件`);
    } else {
      console.warn(`[资源] ⚠ 源目录不存在: ${dir}/`);
    }
  }

  // 复制单个文件
  for (const file of copyFiles) {
    const srcFile = resolve(rootDir, file);
    const destFile = resolve(distDir, file);
    if (existsSync(srcFile)) {
      rmSync(destFile, { force: true });
      copyFileSync(srcFile, destFile);
      console.log(`[资源] ✓ ${file}`);
    } else {
      console.warn(`[资源] ⚠ 源文件不存在: ${file}`);
    }
  }

  console.log('[资源] ✓ 静态资源复制完成');
}

function countFiles(dir) {
  let count = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

copyAssets();
