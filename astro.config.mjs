import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { localImages } from './scripts/markdown-images.mjs';

export default defineConfig({
  site: 'https://yuanzhibx.github.io',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, localImages],
    }),
    shikiConfig: {
      theme: 'github-dark',
      transformers: [{
        span(node) {
          // 原主题的注释灰色对比度偏低，保留配色并提高可读性。
          if (typeof node.properties.style === 'string') {
            node.properties.style = node.properties.style.replace(/#6a737d/gi, '#a3aebb');
          }
        },
        pre(node) {
          node.properties.tabIndex = 0;
          node.properties['data-language'] = this.options.lang;
        },
      }],
    },
  },
});
