import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// 兼容旧入口，所有发布都改为提交源码并由 Actions 自动检查与部署。
const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, [fileURLToPath(new URL('./sync-obsidian.mjs', import.meta.url))], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, [fileURLToPath(new URL('./submit-github.mjs', import.meta.url)), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
