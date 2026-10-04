import { mkdir, readFile, writeFile, mkdtemp, rename, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentFiles, hash } from './publication-files.mjs';

export async function syncContent(source, root, { dryRun = false } = {}) {
  source = resolve(source);
  const target = join(root, 'content');
  if (source === target || source.startsWith(target + '/')) throw new Error('Obsidian 目录不能位于网站 content 内。');
  const statePath = join(root, '.deploy/obsidian-sync.json');
  let state = {};
  try { state = JSON.parse(await readFile(statePath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (state.source && state.source !== source) throw new Error('内容源目录已改变，请先核对旧同步记录。');
  const incoming = await contentFiles(source);
  const current = await contentFiles(target);
  if (![...incoming.keys()].some((name) => name.endsWith('.md'))) throw new Error('源目录没有文章，已停止同步。');
  const changes = [];
  for (const name of new Set([...incoming.keys(), ...current.keys()])) {
    const before = current.has(name) ? hash(current.get(name)) : null;
    const after = incoming.has(name) ? hash(incoming.get(name)) : null;
    if (before === after) continue;
    const baseline = state.hashes?.[name] ?? null;
    // 初次同步不能覆盖不同内容；后续同步不能覆盖网站端单独修改的文件。
    if (!state.hashes || before !== baseline) throw new Error(`网站端存在独立修改，请先合并：${name}`);
    changes.push({ file: name, action: after === null ? '删除' : before === null ? '新增' : '修改' });
  }
  console.log(changes.length ? changes.map((change) => `${change.action} ${change.file}`).join('\n') : '文章与附件已同步，没有差异。');
  if (dryRun) return changes;
  await mkdir(join(root, '.deploy'), { recursive: true });
  const stage = await mkdtemp(join(root, '.deploy/content-stage-'));
  try {
    for (const section of ['study', 'coding', 'tools']) await mkdir(join(stage, section));
    for (const [name, bytes] of incoming) {
      await mkdir(dirname(join(stage, name)), { recursive: true });
      await writeFile(join(stage, name), bytes);
    }
    const fresh = await contentFiles(source);
    if (fresh.size !== incoming.size || [...fresh].some(([name, bytes]) => !incoming.has(name) || hash(bytes) !== hash(incoming.get(name)))) throw new Error('同步时源文件发生变化，请保存完毕后重试。');
    const targetFresh = await contentFiles(target);
    if (targetFresh.size !== current.size || [...targetFresh].some(([name, bytes]) => !current.has(name) || hash(bytes) !== hash(current.get(name)))) throw new Error('同步时网站文件发生变化，请保存完毕后重试。');
    if (changes.length) {
      const backup = join(root, '.deploy', `content-backup-${Date.now()}`);
      await rename(target, backup);
      try { await rename(stage, target); } catch (error) { await rename(backup, target); throw error; }
    }
    const stateTemp = statePath + '.tmp';
    await writeFile(stateTemp, JSON.stringify({ source, hashes: Object.fromEntries([...incoming].map(([name, bytes]) => [name, hash(bytes)])) }, null, 2));
    await rename(stateTemp, statePath);
  } finally { await rm(stage, { recursive: true, force: true }); }
  return changes;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  try {
    const config = JSON.parse(await readFile(join(root, '.obsidian-publish.json'), 'utf8'));
    await syncContent(config.contentDirectory, root, { dryRun: process.argv.includes('--dry-run') });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
