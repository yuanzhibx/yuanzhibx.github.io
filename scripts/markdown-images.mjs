import { visit } from 'unist-util-visit';
import { resolve, sep } from 'node:path';
import sharp from 'sharp';

// public 中的本地图片也预留尺寸，避免正文加载时跳动。
export function localImages() {
  return async (tree, file) => {
    const tasks = [];
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      node.properties.loading ??= 'lazy';
      node.properties.decoding ??= 'async';
      const src = String(node.properties.src ?? '');
      if (!src.startsWith('/') || src.startsWith('//')) return;
      tasks.push((async () => {
        const root = resolve('public');
        const path = resolve(root, decodeURIComponent(src.split(/[?#]/)[0].slice(1)));
        if (!path.startsWith(root + sep)) throw new Error('图片路径必须位于 public 目录中');
        try {
          const { width, height } = await sharp(path).metadata();
          node.properties.width ??= width;
          node.properties.height ??= height;
        } catch {
          file.fail(`无法读取本地图片 ${src}，请检查 public 中的文件。`);
        }
      })());
    });
    await Promise.all(tasks);
  };
}
