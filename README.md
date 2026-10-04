# Yuanzhibx 个人网站

Astro + TypeScript 静态网站，导航为 Home / Study / Coding / Tools / About。网站地址为 <https://yuanzhibx.github.io/>。

在 Obsidian 的 `yuanzhibx.github.io` 文件夹编辑公开文章，在 Mac 手动提交后，由 GitHub Actions 自动检查并发布。完整说明见 [Obsidian 同步发布](docs/Obsidian同步发布.md)。

## 本地开发

需要 Node.js 22.12.0 或更高版本。

```bash
npm ci
npm run dev
```

## 从 Obsidian 提交

本地 `.obsidian-publish.json` 指定内容源，不放入公开仓库：

```json
{ "contentDirectory": "/你的笔记库/Yuanzhibx/yuanzhibx.github.io" }
```

```bash
npm run sync -- --dry-run
npm run publish
```

提交脚本保留远端历史，不强制推送；只上传已发布文章及其引用附件。直接从 Git 编辑本仓库时，请保持 `content/` 中只有愿意公开的内容。公开仓库中的历史文件无法通过设置 `draft: true` 撤回。

## 检查

```bash
npm run test:publishing
npm run build
npx playwright install chromium
npm test
```

浏览器验收在 `.verification/` 中建立隔离项目，不将测试文章加入正式内容。Actions 检查成功后部署正式 `dist/`，不会将源码和 Markdown 当作网站静态文件提供。
