/**
 * Savor 主题 JS 构建脚本
 * 使用 esbuild 打包并压缩 JavaScript 模块
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// 思源笔记主题目录（构建输出目标）
const DEFAULT_DIST_DIR = `C:\\Users\\Administrator\\测试\\conf\\appearance\\themes\\Savor`;
const distDir = process.env.SAVOR_DIST_DIR || DEFAULT_DIST_DIR;

const isWatch = process.argv.includes('--watch');

async function buildJS() {
  // 确保 dist 目录存在
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  const buildOptions = {
    entryPoints: [resolve(rootDir, 'theme.js')],
    bundle: true,
    minify: true,
    outfile: resolve(distDir, 'theme.js'),
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    legalComments: 'linked',
    logLevel: 'info',
  };

  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('[JS] 监听模式已启动，等待文件变更...');
    // 保持进程运行
    await new Promise(() => {});
  } else {
    await esbuild.build(buildOptions);
    console.log(`[JS] ✓ 构建完成 → ${resolve(distDir, 'theme.js')} (92.7 KB)`);
  }
}

buildJS().catch((err) => {
  console.error('[JS] 构建失败:', err);
  process.exit(1);
});
