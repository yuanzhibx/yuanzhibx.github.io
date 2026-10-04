import { glob, type Loader } from 'astro/loaders';

export function publishedMarkdown(): Loader {
  const markdown = glob({
    pattern: '**/*.md',
    base: './content',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  });
  return {
    name: 'published-markdown',
    async load(context) {
      // 清理旧缓存中的草稿，并在注册任何图片导入前排除草稿。
      for (const entry of context.store.values()) {
        if (entry.data.draft !== false) context.store.delete(entry.id);
      }
      const store: typeof context.store = {
        ...context.store,
        set(entry) {
          if (entry.data.draft !== false) {
            context.store.delete(entry.id);
            return false;
          }
          return context.store.set(entry);
        },
      };
      await markdown.load({ ...context, store });
    },
  };
}
