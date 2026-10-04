import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { publishedMarkdown } from './lib/published-loader';
import { sections } from './config/sections';

const posts = defineCollection({
  loader: publishedMarkdown(),
  schema: ({ image }) => z.object({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    date: z.preprocess(
      (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value,
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD').refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
      }, '请输入真实有效的日期'),
    ),
    section: z.enum(['study', 'coding', 'tools']),
    type: z.enum(['project', 'note', 'article', 'tutorial', 'guide']),
    tags: z.array(z.string().trim().min(1)).default([]).transform((tags) => [...new Set(tags)]),
    cover: image().optional(),
    coverAlt: z.string().trim().min(1).optional(),
    featured: z.boolean().default(false),
    // 未填写 draft 时保持草稿，必须明确设为 false 才发布。
    draft: z.boolean().default(true),
  }).superRefine((post, ctx) => {
    if (!(sections[post.section].types as readonly string[]).includes(post.type)) {
      ctx.addIssue({ code: 'custom', path: ['type'], message: `该内容类型不属于 ${post.section} 板块` });
    }
    if (post.cover && !post.coverAlt) {
      ctx.addIssue({ code: 'custom', path: ['coverAlt'], message: '封面图片需要填写 coverAlt' });
    }
  }),
});

export const collections = { posts };
