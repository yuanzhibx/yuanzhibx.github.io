# Yuanzhibx 个人网站

Astro + TypeScript 静态网站，导航为 Home / Study / Coding / Tools / About。网站地址为 <https://yuanzhibx.github.io/>。

在 Obsidian 的 `yuanzhibx.github.io` 文件夹编辑公开文章，在 Mac 手动提交后，由 GitHub Actions 自动检查并发布。完整说明见 [Obsidian 同步发布](docs/Obsidian同步发布.md)。

## 山东省耕地土壤盐渍化时空变化可视化系统

课程项目通过 `/soil/` 提供只读地图查询。 [打开在线地图](https://yuanzhibx.github.io/soil/)

| 项目 | 说明 |
| --- | --- |
| 输入 | geoBoundaries 山东省界、WorldCover 2021 地表覆盖和耕地、2015–2024 年 ECe，以及 Terra/MODIS 春季观测。 |
| 输出 | 年度盐渍化图、年际变化图、春季 NDVI 图层和当前视野的耕地面积占比。 |
| 技术 | 网页使用 Vue 3.5.45 和 OpenLayers 10.11.0。GeoServer 3.0.2 WMS 与 Spring Boot、MySQL 用于本地全栈版。 |
| 模块 | Python、GDAL、NumPy 预处理数据，本地服务提供图层发布和记录维护，公开网页读取发布时导出的静态图层与快照。 |
| 规则 | 年度 ECe 决定盐渍化等级，NDVI 展示春季植被绿度。以 2021 年耕地为固定基准，地图缩放或平移后按当前视野内的耕地面积重新统计。 |
| 当前进展 | 覆盖山东省约 20.6 万个含耕地网格，已上线 10 年年度图、年际对比和春季 NDVI。 |

GitHub Pages 部署的 `public/soil/` 采用静态发布方式。实时 WMS 接入需要单独部署的公共 HTTPS GeoServer。更新快照时，先在课程项目重新执行 `npm run build:pages`，再同步发布包。 [GitHub Pages 静态托管说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

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
