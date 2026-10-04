import { fileURLToPath } from 'node:url';
import { contentFiles, publicContent } from './publication-files.mjs';

const files = await contentFiles(fileURLToPath(new URL('../content/', import.meta.url)));
const selected = await publicContent(files);
const excluded = [...files.keys()].filter((name) => !selected.has(name));
if (excluded.length) throw new Error(`提交中包含草稿或未引用附件：${excluded.join('、')}`);
console.log(`公开内容检查通过：${selected.size} 个文章及附件文件。`);
