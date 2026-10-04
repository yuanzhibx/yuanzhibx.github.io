import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncContent } from '../scripts/sync-obsidian.mjs';
import { publicContent } from '../scripts/publication-files.mjs';

const article = (draft, body = '') => Buffer.from(`---\ntitle: 测试\nsection: study\ndraft: ${draft}\n---\n${body}`);

test('提交快照排除草稿和未引用附件，保留真实引用附件', async () => {
  const files = new Map([
    ['study/public.md', article(false, '![图](./assets/shared.svg)\n```md\n![演示](./assets/missing.svg)\n```')],
    ['study/draft.md', article(true, '![草稿](./assets/private.svg)')],
    ['study/default.md', Buffer.from('---\nsection: study\n---\n未指定发布状态')],
    ['study/assets/shared.svg', Buffer.from('<svg/>')],
    ['study/assets/private.svg', Buffer.from('PRIVATE_SENTINEL')],
  ]);
  assert.deepEqual([...await publicContent(files)].map(([name]) => name).sort(), ['study/assets/shared.svg', 'study/public.md']);
});

test('附件缺失或引用草稿 Markdown 时停止提交', async () => {
  await assert.rejects(publicContent(new Map([['study/public.md', article(false, '![图](./missing.png)')]])), /附件不存在/);
  await assert.rejects(publicContent(new Map([['study/public.md', article(false, '[链接](./draft.md)')], ['study/draft.md', article(true)]])), /网站路径/);
});

test('首次核对、源端更新、新增、预检、冲突和删除同步', async () => {
  const root = await mkdtemp(join(tmpdir(), 'website-publish-'));
  const source = join(root, 'notes');
  try {
    for (const base of [source, join(root, 'content')]) {
      for (const section of ['study', 'coding', 'tools']) await mkdir(join(base, section), { recursive: true });
      await writeFile(join(base, 'study/a.md'), article(false, '原文'));
    }
    await syncContent(source, root);
    await writeFile(join(source, 'study/a.md'), article(false, 'Obsidian 修改'));
    await syncContent(source, root, { dryRun: true });
    assert.match(await readFile(join(root, 'content/study/a.md'), 'utf8'), /原文/);
    await syncContent(source, root);
    assert.match(await readFile(join(root, 'content/study/a.md'), 'utf8'), /Obsidian 修改/);
    await writeFile(join(source, 'study/b.md'), article(true, '新增草稿'));
    await syncContent(source, root);
    assert.match(await readFile(join(root, 'content/study/b.md'), 'utf8'), /新增草稿/);
    await writeFile(join(root, 'content/study/a.md'), article(false, '网站端修改'));
    await assert.rejects(syncContent(source, root), /独立修改/);
    assert.match(await readFile(join(root, 'content/study/a.md'), 'utf8'), /网站端修改/);
    await writeFile(join(root, 'content/study/a.md'), article(false, 'Obsidian 修改'));
    await unlink(join(source, 'study/b.md'));
    await syncContent(source, root);
    await assert.rejects(readFile(join(root, 'content/study/b.md')), /ENOENT/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
