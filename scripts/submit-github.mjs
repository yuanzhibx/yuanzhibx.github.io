import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentFiles, publicContent, readTree } from './publication-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const remote = 'https://github.com/yuanzhibx/yuanzhibx.github.io.git';
const dryRun = process.argv.includes('--dry-run');
const cache = join(root, '.deploy');
const gitDir = join(cache, 'source.git');
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', ASTRO_TELEMETRY_DISABLED: '1' };
const git = (...args) => execFileSync('git', ['-c', 'http.version=HTTP/1.1', `--git-dir=${gitDir}`, ...args], { cwd: root, env, encoding: 'utf8' }).trim();

// 只生成已发布内容的提交快照，草稿及未引用的附件不会进入公开仓库。
const snapshot = new Map();
for (const directory of ['src', 'public', 'scripts', 'tests', 'templates', '.github']) {
  for (const [name, bytes] of await readTree(join(root, directory))) snapshot.set(`${directory}/${name}`, bytes);
}
for (const name of ['package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json', '.gitignore', 'README.md', '发布网站.command']) snapshot.set(name, await readFile(join(root, name)));
snapshot.set('public/.nojekyll', await readFile(join(root, 'public/.nojekyll')));
snapshot.set('docs/Obsidian同步发布.md', await readFile(join(root, 'docs/Obsidian同步发布.md')));
for (const [name, bytes] of await publicContent(await contentFiles(join(root, 'content')))) snapshot.set(`content/${name}`, bytes);
await mkdir(cache, { recursive: true });
const stage = await mkdtemp(join(cache, 'source-stage-'));
try {
  for (const section of ['study', 'coding', 'tools']) snapshot.set(`content/${section}/.gitkeep`, Buffer.alloc(0));
  for (const [name, bytes] of snapshot) {
    await mkdir(dirname(join(stage, name)), { recursive: true });
    await writeFile(join(stage, name), bytes);
  }
  // 对将要上传的快照构建，避免本地未上传的草稿附件掩盖缺失文件。
  execFileSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'check', '--root', stage], { cwd: root, env, stdio: 'inherit' });
  execFileSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', stage], { cwd: root, env, stdio: 'inherit' });
  if (!existsSync(gitDir)) execFileSync('git', ['init', '--bare', gitDir], { env, stdio: 'inherit' });
  if (!git('remote').split('\n').includes('origin')) git('remote', 'add', 'origin', remote);
  if (git('remote', 'get-url', 'origin') !== remote) throw new Error('发布仓库地址不一致。');
  git('fetch', 'origin', 'main');
  const parent = git('rev-parse', 'FETCH_HEAD');
  let baseline;
  const statePath = join(cache, 'last-submission.json');
  if (existsSync(statePath)) baseline = JSON.parse(await readFile(statePath, 'utf8')).commit;
  else if (existsSync(join(cache, 'last-deployment.json'))) baseline = JSON.parse(await readFile(join(cache, 'last-deployment.json'), 'utf8')).commit;
  if (baseline && baseline !== parent) throw new Error('GitHub 已有其他新提交，请先合并远端修改后再提交。');
  git('read-tree', '--empty');
  // 精确添加快照文件，构建产物不会被提交。
  execFileSync('git', [`--git-dir=${gitDir}`, `--work-tree=${stage}`, 'add', '--', ...snapshot.keys()], { cwd: stage, env, stdio: 'inherit' });
  const tree = git('write-tree');
  if (tree === git('rev-parse', `${parent}^{tree}`)) { console.log('GitHub 内容未改变，无需提交。'); }
  else {
    const commit = git('commit-tree', tree, '-p', parent, '-m', 'Publish website content from Obsidian');
    console.log(git('diff', '--shortstat', parent, commit));
    git('push', ...(dryRun ? ['--dry-run'] : []), 'origin', `${commit}:refs/heads/main`);
    if (!dryRun) await writeFile(statePath, JSON.stringify({ commit, previous: parent, submittedAt: new Date().toISOString() }, null, 2));
    console.log(dryRun ? '预检通过，没有更新 GitHub。' : `已提交 ${commit}。自动检查与发布进度：https://github.com/yuanzhibx/yuanzhibx.github.io/actions`);
  }
} finally { await rm(stage, { recursive: true, force: true }); }
