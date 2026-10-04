import { readdir, readFile, lstat } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { parseFrontmatter, createMarkdownProcessor } from '@astrojs/markdown-remark';
import { visit } from 'unist-util-visit';

export const sections = ['study', 'coding', 'tools'];
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function readTree(root, prefix = '') {
  const files = new Map();
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`不接受软链接：${path}`);
    if (entry.isDirectory()) {
      for (const [name, bytes] of await readTree(root, path)) files.set(name, bytes);
    } else if (entry.isFile()) files.set(path, await readFile(join(root, path)));
  }
  return files;
}

export async function contentFiles(root) {
  const files = new Map();
  for (const section of sections) {
    if (!(await lstat(join(root, section))).isDirectory()) throw new Error(`缺少分类目录：${section}`);
    for (const [name, bytes] of await readTree(root, section)) {
      if (!/\.(md|png|jpe?g|webp|gif|svg|avif|pdf)$/i.test(name)) throw new Error(`不支持的内容文件：${name}`);
      files.set(name, bytes);
    }
  }
  return files;
}

export async function publicContent(files) {
  const selected = new Map();
  let urls = [];
  // 用 Markdown 语法树收集附件，代码示例中的路径不会误触发附件上传。
  const renderer = await createMarkdownProcessor({ syntaxHighlight: false, remarkPlugins: [() => (tree) => {
    visit(tree, (node) => {
      if (['image', 'link', 'definition'].includes(node.type)) urls.push(node.url);
    });
  }] });
  for (const [name, bytes] of files) {
    if (!name.endsWith('.md')) continue;
    const { frontmatter, content } = parseFrontmatter(bytes.toString());
    if (frontmatter.draft !== false) continue;
    if (frontmatter.section !== name.split('/')[0]) throw new Error(`分类与目录不符：${name}`);
    selected.set(name, bytes);
    urls = [];
    await renderer.render(content);
    if (frontmatter.cover) urls.push(frontmatter.cover);
    for (const url of urls) {
      if (!url || /^(https?:|mailto:|#|\/)/.test(url)) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(url)) throw new Error(`不支持的附件地址：${name}`);
      const target = posix.normalize(posix.join(posix.dirname(name), decodeURIComponent(url.split(/[?#]/)[0])));
      if (target.startsWith('../') || !files.has(target)) throw new Error(`附件不存在或超出内容目录：${name} → ${url}`);
      if (target.endsWith('.md')) throw new Error(`文章链接请使用网站路径，而不是 Markdown 文件：${name} → ${url}`);
      selected.set(target, files.get(target));
    }
  }
  return selected;
}
