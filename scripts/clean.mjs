/**
 * Savor 主题 - 清理思源笔记主题目录中的构建产物
 */

import { rmSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const DEFAULT_DIST_DIR = `C:\\Users\\Administrator\\测试\\conf\\appearance\\themes\\Savor`;
const distDir = process.env.SAVOR_DIST_DIR || DEFAULT_DIST_DIR;

// 构建生成的文件 + 旧版本可能遗留的文件/目录
const generatedFiles = [
  'theme.js',
  'theme.css',
  // 旧版本遗留文件，确保彻底清理
  'theme.debug.js',
  'theme.debug.js.map',
  'theme.min.css',
  'theme.bundle.css',
];

// 需要清理的目录
const generatedDirs = [
  '.github',
];

if (existsSync(distDir)) {
  let cleaned = 0;

  // 清理文件
  for (const file of generatedFiles) {
    const filePath = resolve(distDir, file);
    if (existsSync(filePath)) {
      rmSync(filePath, { force: true });
      cleaned++;
    }
  }

  // 清理目录
  for (const dir of generatedDirs) {
    const dirPath = resolve(distDir, dir);
    if (existsSync(dirPath)) {
      rmSync(dirPath, { recursive: true, force: true });
      cleaned++;
    }
  }

  console.log(`已清理 ${cleaned} 个构建产物`);
} else {
  console.log('思源笔记主题目录不存在，无需清理');
}
