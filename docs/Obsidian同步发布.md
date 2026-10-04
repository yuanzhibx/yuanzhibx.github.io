# 从 Obsidian 编辑并发布网站

## 内容源

Obsidian 中的 `Yuanzhibx/yuanzhibx.github.io/` 是网站文章的主要编辑位置，与 GitHub 仓库名称一致。

```text
yuanzhibx.github.io/
  study/
    assets/
  coding/
    assets/
  tools/
    assets/
  _templates/
  使用说明.md
```

仅同步 `study/`、`coding/`、`tools/` 的 Markdown、图片及 PDF。说明和模板不作为文章发布。原来的学习笔记与论文笔记不参与同步。

## 日常发布

1. 在 Obsidian 修改文章，保留开头的文章属性。文件名是网址的一部分，已有文章尽量不改名。
2. 图片放到文章所在分类的 `assets/`，使用 `![说明](./assets/图片名.webp)`。文章之间使用实际网站路径，如 `[另一篇文章](/study/define-crs-vs-project/)`。
3. 新文章默认 `draft: true`；准备公开时改成 `draft: false`。
4. 在 Mac 打开项目中的 **发布网站.command**。它会同步文章、检查上传快照，再提交到 GitHub。
5. 在 [GitHub Actions](https://github.com/yuanzhibx/yuanzhibx.github.io/actions) 等待“检查并发布网站”成功，再查看 [网站](https://yuanzhibx.github.io/)。

保存笔记不会自动发布。仅提交操作会触发网上检查与发布。iCloud 负责设备间的笔记文件同步，与网站发布是两个独立步骤；本机需要已经下载源文件，并且有 Node.js、项目依赖及 GitHub 推送权限。

## 预览和预检

在网站项目目录运行：

```bash
npm run sync -- --dry-run
npm run sync
npm run dev
```

开发预览地址见终端输出，通常为 `http://127.0.0.1:4321/`。草稿不会生成页面；需要查看草稿时临时设为 `draft: false`，只预览，不提交。

仅检查上传内容、但不推送：

```bash
npm run submit -- --dry-run
```

正式提交：

```bash
npm run publish
```

`npm run deploy` 兼容原有习惯，现在也执行相同发布流程。

## 发布边界与冲突

- GitHub 是公开仓库，会保存网站源码和已发布文章的 Markdown。提交脚本只上传明确 `draft: false` 的文章，以及这些文章引用的内容附件。未引用附件和草稿留在本地。
- `public/` 是明确的公开资源目录，里面的文件都会上传；私人或草稿附件应放在文章旁的 `assets/`。
- 网站项目的 `content/` 是同步副本。若两边分别修改，工具会停止并指出冲突文件，需要先手动合并。不要删除同步记录来跳过冲突。
- 删除源文章，或把它设为草稿，再提交成功后，网站会撤下页面。已公开内容仍可能保存在 GitHub 历史中。
- 同步前会保留网站旧内容至本地 `.deploy/content-backup-*`；这些备份不上传。
- GitHub 出现其他新提交时，脚本停止，避免覆盖远端修改。请先把远端变化合并到本地项目后，再更新提交基线。

## 自动检查

GitHub Actions 在 `main` 收到提交后安装依赖，检查草稿隔离和同步规则，再执行类型检查、正式构建与浏览器验收。全部通过后才部署 `dist/`。检查失败时线上保持上一版；拉取请求只检查，不发布。

本地 `.obsidian-publish.json` 记录内容源的绝对路径，换电脑时修改该配置。配置、同步记录、登录凭据和本地备份均不上传。

双链、笔记嵌入和 Dataview 没有转换支持；请使用标准 Markdown。发布仍由 Mac 的按钮提交触发，不包含手机端直接推送配置。
