/**
 * Savor 主题 - 完整构建脚本
 * 按顺序执行：清理 → JS 构建 → CSS 构建
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function run(script) {
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  执行: ${script}`);
  console.log(`═══════════════════════════════════════\n`);
  execSync(`node ${script}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

try {
  run('scripts/clean.mjs');
  run('scripts/build-js.mjs');
  run('scripts/build-css.mjs');

  console.log(`\n✅ Savor 主题构建完成！`);
  console.log(`   输出目录: C:\\Users\\Administrator\\SiYuan\\conf\\appearance\\themes\\Savor`);
} catch (err) {
  console.error('\n❌ 构建失败:', err.message);
  process.exit(1);
}
