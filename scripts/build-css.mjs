/**
 * Savor 主题 CSS 构建脚本
 * 1. 解析 theme.css 中所有 @import，合并为单一文件
 * 2. 使用 Lightning CSS 压缩输出到思源笔记主题目录
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, watch } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// 思源笔记主题目录（构建输出目标）
const DEFAULT_DIST_DIR = `C:\\Users\\Administrator\\测试\\conf\\appearance\\themes\\Savor`;
const distDir = process.env.SAVOR_DIST_DIR || DEFAULT_DIST_DIR;

const isWatch = process.argv.includes('--watch');

/**
 * 递归解析 CSS @import，将所有导入内联
 */
function resolveCSSImports(filePath, processedFiles = new Set()) {
  if (processedFiles.has(filePath)) return '';
  processedFiles.add(filePath);

  const dir = dirname(filePath);
  let content = readFileSync(filePath, 'utf-8');

  // 匹配 @import url(...) 和 @import '...'
  const importRegex = /@import\s+(?:url\(\s*['"]?|['"])([^'")\s]+)(?:['"]?\s*\)|['"])\s*;?/gi;
  content = content.replace(importRegex, (match, importPath) => {
    const resolvedPath = resolve(dir, importPath.trim());
    if (existsSync(resolvedPath)) {
      return resolveCSSImports(resolvedPath, processedFiles);
    }
    console.warn(`[CSS] ⚠ 找不到导入: ${importPath}`);
    return `/* @import failed: ${importPath} */`;
  });

  return content;
}

/**
 * 使用 lightningcss 压缩 CSS
 */
async function minifyWithLightning(css) {
  try {
    const { transform } = await import('lightningcss');
    const result = transform({
      filename: 'theme.css',
      code: Buffer.from(css),
      minify: true,
      sourceMap: false,
      targets: { chrome: 90 },
    });
    return result.code;
  } catch (err) {
    console.warn('[CSS] ⚠ lightningcss 压缩失败，使用未压缩版本:', err.message);
    return Buffer.from(css);
  }
}

async function buildCSS() {
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  const entryFile = resolve(rootDir, 'theme.css');
  if (!existsSync(entryFile)) {
    console.error('[CSS] ✗ 找不到 theme.css');
    process.exit(1);
  }

  console.log('[CSS] 正在解析 @import...');
  const bundledCSS = resolveCSSImports(entryFile);

  // 压缩并输出为 theme.css（思源笔记加载的入口文件）
  console.log('[CSS] 正在压缩...');
  const minified = await minifyWithLightning(bundledCSS);
  writeFileSync(resolve(distDir, 'theme.css'), minified, 'utf-8');
  console.log(`[CSS] ✓ 构建完成 → theme.css (${(minified.length / 1024).toFixed(1)} KB)`);
}

/**
 * 扫描目录下所有 CSS 文件
 */
function scanCSSFiles(dir, result = []) {
  if (!existsSync(dir)) return result;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      scanCSSFiles(fullPath, result);
    } else if (entry.name.endsWith('.css')) {
      result.push(fullPath);
    }
  }
  return result;
}

// ─── 主逻辑 ──────────────────────────────────────

if (isWatch) {
  console.log('[CSS] 监听模式启动...');
  await buildCSS();

  const cssFiles = scanCSSFiles(resolve(rootDir, 'style'));
  cssFiles.push(resolve(rootDir, 'theme.css'));
  console.log(`[CSS] 正在监听 ${cssFiles.length} 个 CSS 文件...`);

  let debounceTimer = null;
  for (const file of cssFiles) {
    watch(file, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`[CSS] 检测到变化: ${file}`);
        buildCSS();
      }, 200);
    });
  }

  // 保持进程运行
  await new Promise(() => {});
} else {
  await buildCSS();
}
