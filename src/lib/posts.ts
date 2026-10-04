import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// 所有列表、推荐和静态路由共用此入口，开发预览也不暴露草稿。
export async function publishedPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  for (const post of posts) {
    if (!new RegExp(`^${post.data.section}/[a-z0-9]+(?:-[a-z0-9]+)*$`).test(post.id)) {
      throw new Error(`${post.id}：请使用 content/所属板块/英文短横线文件名.md，且 section 必须与目录一致。`);
    }
  }
  return posts.sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export function postHref(post: Post) {
  return `/${post.id}/`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
