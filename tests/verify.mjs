import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, '.verification');
const screenshots = join(output, 'screenshots');
await mkdir(screenshots, { recursive: true });
const temporary = await mkdtemp(join(output, 'site-'));
const astro = join(root, 'node_modules/astro/bin/astro.mjs');
const checks = [];
const servers = [];
let browser;
let serverLog = '';
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };

function passed(message) { checks.push(message); console.log(`✓ ${message}`); }
async function runAstro(args, cwd) {
  return new Promise((accept, reject) => {
    const child = spawn(process.execPath, [astro, ...args], { cwd, env });
    let output = '';
    child.stdout.on('data', (data) => { output += data; });
    child.stderr.on('data', (data) => { output += data; });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? accept(output) : reject(new Error(output)));
  });
}
async function freePort() {
  const probe = createServer();
  await new Promise((accept) => probe.listen(0, '127.0.0.1', accept));
  const port = probe.address().port;
  await new Promise((accept) => probe.close(accept));
  return port;
}
async function preview(cwd) {
  const port = await freePort();
  const child = spawn(process.execPath, [astro, 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(port)], { cwd, env });
  servers.push(child);
  child.stdout.on('data', (data) => { serverLog += data; });
  child.stderr.on('data', (data) => { serverLog += data; });
  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(serverLog);
    try { if ((await fetch(url)).ok) return url; } catch { /* 等待本地服务器完成启动。 */ }
    await new Promise((accept) => setTimeout(accept, 100));
  }
  throw new Error(`测试服务器启动超时：${serverLog}`);
}
async function filesIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)]));
  return groups.flat();
}
async function noOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `页面出现横向溢出：${page.url()}`);
}
async function screenshot(page, name) {
  await page.evaluate(async () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  await page.screenshot({ path: join(screenshots, `${name}.png`), fullPage: true });
}
async function accessible(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })), [], `无障碍检查失败：${page.url()}`);
}
const longCode = 'const longLine = "' + 'abcdef'.repeat(45) + '";';
const fixtureBody = [
  '## 验证小节',
  '这是**加粗内容** 和[返回学习板块](/study/)。',
  '### 公式',
  '行内公式 $E = mc^2$。',
  '$$\n\\sum_{i=1}^{n} x_i^2\n$$',
  '## 图片',
  '![公共目录图片](/images/study.webp)',
  '![相对路径图片](./assets/probe.webp)',
  '## 代码',
  '```typescript\n// 用于验证长代码滚动与复制\n' + longCode + '\n```',
  '| 项目 | 内容 |\n| --- | --- |\n| 测试 | 表格 |',
].join('\n\n');

async function fixture(section, slug, options = {}) {
  const data = {
    title: `临时验证 ${slug}`, summary: '仅用于隔离环境的浏览器验收，不是真实文章。',
    date: '2026-09-27', section, type: 'note', tags: ['GIS'], featured: false, draft: false,
    ...options,
  };
  const body = options.body ?? fixtureBody;
  delete data.body;
  const frontmatter = Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  await writeFile(join(temporary, `content/${section}/${slug}.md`), `---\n${frontmatter}\n---\n\n${body}\n`);
}

try {
  await runAstro(['check'], root);
  await runAstro(['build'], root);
  passed('正式项目类型检查与静态构建通过');
  for (const name of ['src', 'public', 'scripts', 'content', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
    await cp(join(root, name), join(temporary, name), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
  const production = await preview(root);
  // 根据正式构建发现文章；空板块与已有内容的板块分别验收。
  const productionArticles = (await filesIn(join(root, 'dist')))
    .map((file) => relative(join(root, 'dist'), file))
    .filter((file) => /^(study|coding|tools)\/.+\/index\.html$/.test(file))
    .map((file) => `/${file.replace(/index\.html$/, '')}`);
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const routes = ['/', '/study/', '/coding/', '/tools/', '/about/'];
  for (const route of routes) {
    const response = await page.goto(production + route);
    assert.equal(response.status(), 200);
    await expect(page.locator('h1')).toHaveCount(1);
    assert.ok((await page.title()).includes('Yuanzhibx'));
    assert.ok(await page.locator('meta[name="description"]').getAttribute('content'));
    await expect(page.locator('footer .email-link')).toHaveAttribute('href', 'mailto:ybx0729@gmail.com');
    await noOverflow(page);
    await accessible(page);
    if (['/study/', '/coding/', '/tools/'].includes(route)) {
      const count = productionArticles.filter((article) => article.startsWith(route)).length;
      await expect(page.locator('[data-post]')).toHaveCount(count);
      if (count === 0) {
        await expect(page.locator('.empty-state')).toBeVisible();
        await expect(page.locator('[data-filters]')).toHaveCount(0);
      } else {
        await expect(page.locator('[data-no-results]')).toBeHidden();
      }
    }
    await screenshot(page, `${route === '/' ? 'home' : route.split('/')[1]}-desktop`);
  }
  passed('首页、三个板块与 About：按实际内容检查列表或空状态，标题、描述、邮箱、桌面布局及 WCAG 自动检查');
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: production });
  for (const route of productionArticles) {
    await page.goto(production + route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.toc a')).not.toHaveCount(0);
    const body = await page.locator('.prose').innerText();
    assert.equal(/\[\[|\/Users\/|DRAFT_SENTINEL|临时验证/.test(body), false);
    for (const link of await page.locator('.prose a[href^="/"], .related a').all()) {
      assert.equal((await context.request.get(production + await link.getAttribute('href'))).status(), 200);
    }
    for (const button of await page.getByRole('button', { name: /^复制第/ }).all()) {
      const code = await button.locator('xpath=ancestor::div[contains(@class,"code-frame")]').locator('pre code').textContent();
      await button.click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), code);
    }
    for (const width of [1536, 390, 320]) {
      await page.setViewportSize({ width, height: 1024 });
      await noOverflow(page);
      await accessible(page);
      if (width !== 320) await screenshot(page, `published-${route.split('/').at(-2)}-${width}`);
    }
  }
  await page.setViewportSize({ width: 1536, height: 1024 });
  passed(`已检查 ${productionArticles.length} 篇正式文章的目录、内部链接、代码复制及桌面和手机布局`);
  await page.goto(production);
  await expect(page.locator('.hero h1')).toHaveText('Yuanzhibx');
  await expect(page.locator('.hero .introduction strong')).toHaveText('Java AI');
  assert.equal((await page.locator('body').innerText()).includes('颜丙旭'), false);
  await page.getByRole('link', { name: 'Explore My Journey' }).click();
  await expect(page).toHaveURL(/#journey$/);
  assert.ok(await page.evaluate(() => window.scrollY > 0));
  for (const section of ['Study', 'Coding', 'Tools']) {
    await page.goto(production);
    await page.getByRole('link', { name: `Explore ${section}`, exact: true }).click();
    await expect(page.locator('h1')).toHaveText(section);
  }
  for (const label of ['Home', 'Study', 'Coding', 'Tools', 'About']) {
    await page.locator('#main-navigation').getByRole('link', { name: label, exact: true }).click();
    assert.equal(new URL(page.url()).pathname, label === 'Home' ? '/' : `/${label.toLowerCase()}/`);
  }
  passed('桌面导航、首页滚动按钮和三个板块入口均可用');
  const missing = await page.goto(production + '/not-a-real-page/');
  assert.equal(missing.status(), 404);
  await expect(page.locator('h1')).toHaveText('Page not found');
  await accessible(page);
  await screenshot(page, '404-desktop');
  await page.getByRole('link', { name: 'Back to Home' }).click();
  await expect(page.locator('h1')).toHaveText('Yuanzhibx');
  await page.goto(production);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  assert.notEqual(await page.locator('.skip-link').evaluate((el) => getComputedStyle(el).outlineStyle), 'none');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  passed('未知路径返回 HTTP 404；返回首页、键盘跳转、焦点样式与减少动态效果生效');

  for (const width of [390, 320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of routes.concat('/not-a-real-page/')) {
      await page.goto(production + route);
      await noOverflow(page);
      if (width === 390) {
        await accessible(page);
        await screenshot(page, `${route === '/' ? 'home' : route.split('/')[1]}-mobile`);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(production);
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(page.locator('#main-navigation')).toBeHidden();
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await screenshot(page, 'mobile-menu');
  await page.locator('#main-navigation').getByRole('link', { name: 'Study', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Study');
  passed('320 / 390 / 768 / 1024px 页面无横向溢出；手机菜单支持点击、键盘与 Escape');

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await noJs.newPage();
  await plain.goto(production);
  await expect(plain.locator('#main-navigation')).toBeVisible();
  await plain.locator('#main-navigation').getByRole('link', { name: 'Tools', exact: true }).click();
  await expect(plain.locator('h1')).toHaveText('Tools');
  passed('禁用 JavaScript 后仍可浏览页面、使用移动导航');
  await noJs.close();

  // 隔离副本只放测试夹具，真实文章数量变化不会影响筛选测试。
  await rm(join(temporary, 'content'), { recursive: true, force: true });
  for (const section of ['study', 'coding', 'tools']) {
    await mkdir(join(temporary, `content/${section}/assets`), { recursive: true });
    await cp(join(root, 'public/images/study-480.webp'), join(temporary, `content/${section}/assets/probe.webp`));
  }
  await fixture('study', 'test-project', { type: 'project', featured: true, cover: './assets/probe.webp', coverAlt: '临时封面验证' });
  await fixture('study', 'test-soil', { tags: ['土壤'], date: '2026-09-26' });
  await fixture('study', 'test-related', { date: '2026-09-25' });
  await sharp({ create: { width: 13, height: 17, channels: 3, background: '#ab1267' } }).webp().toFile(join(temporary, 'content/study/assets/draft-private.webp'));
  await fixture('study', 'hidden-draft', { draft: true, title: 'DRAFT_SENTINEL_74329', cover: './assets/draft-private.webp', coverAlt: '草稿附件验证', body: 'DRAFT_BODY_SECRET_74329\n\n![草稿附件](./assets/draft-private.webp)' });
  await fixture('study', 'default-draft', { draft: undefined, title: 'DEFAULT_DRAFT_SENTINEL_74329', body: 'DEFAULT_DRAFT_SECRET_74329' });
  await fixture('coding', 'test-article', { type: 'article', tags: ['TypeScript'] });
  await fixture('coding', 'test-project', { type: 'project', tags: ['Java'] });
  await fixture('tools', 'test-tutorial', { type: 'tutorial', tags: ['IDEA'] });
  await fixture('tools', 'test-guide', { type: 'guide', tags: ['IDEA', '配置'] });
  await runAstro(['build'], temporary);
  const withPosts = await preview(temporary);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: withPosts });
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto(withPosts + '/study/');
  await expect(page.locator('[data-post]:visible')).toHaveCount(3);
  await page.locator('[data-tag="GIS"]').click();
  await expect(page.locator('[data-post]:visible')).toHaveCount(2);
  await page.locator('[data-type-filter="project"]').click();
  await expect(page.locator('[data-post]:visible')).toHaveCount(1);
  await page.locator('[data-tag="土壤"]').click();
  await expect(page.locator('[data-post]:visible')).toHaveCount(0);
  await expect(page.locator('[data-no-results]')).toBeVisible();
  await page.locator('[data-clear-filters]').click();
  await expect(page.locator('[data-post]:visible')).toHaveCount(3);
  await expect(page.locator('[data-tag=""]')).toBeFocused();
  await page.goto(withPosts + '/study/?tag=GIS&type=note');
  await expect(page.locator('[data-post]:visible')).toHaveCount(1);
  await page.locator('[data-tag="土壤"]').click();
  await page.goBack();
  await expect(page.locator('[data-tag="GIS"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto(withPosts + '/study/?tag=不存在');
  await expect(page.locator('[data-no-results]')).toBeVisible();
  await page.locator('[data-clear-filters]').click();
  await accessible(page);
  await screenshot(page, 'fixture-study-desktop');
  for (const [section, type, tag] of [['coding', 'article', 'TypeScript'], ['tools', 'tutorial', 'IDEA']]) {
    await page.goto(withPosts + `/${section}/`);
    await page.locator(`[data-tag="${tag}"]`).click();
    await page.locator(`[data-type-filter="${type}"]`).click();
    await expect(page.locator('[data-post]:visible')).toHaveCount(1);
    await accessible(page);
  }
  passed('三个板块标签及类型筛选；组合无结果、重置、地址参数、浏览器后退与精选内容');

  await page.goto(withPosts + '/study/test-project/');
  await expect(page.locator('h1')).toHaveText('临时验证 test-project');
  await expect(page.locator('.prose strong')).toHaveText('加粗内容');
  await expect(page.locator('.prose .katex')).toHaveCount(2);
  await expect(page.locator('.prose table')).toBeVisible();
  await expect(page.locator('.prose pre code span[style]')).not.toHaveCount(0);
  await expect(page.locator('.toc a')).toHaveCount(4);
  await page.locator('.toc a').first().click();
  assert.equal(decodeURIComponent(new URL(page.url()).hash), '#验证小节');
  await page.getByRole('button', { name: '复制第 1 个代码块' }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await page.locator('.prose pre code').textContent());
  await expect(page.getByRole('button', { name: '复制第 1 个代码块' })).toHaveText('Copied!');
  await expect(page.locator('.related li')).toHaveCount(1);
  await expect(page.locator('.related li a')).toHaveAttribute('href', '/study/test-related/');
  for (const image of await page.locator('article img').all()) {
    assert.equal(await image.evaluate((el) => el.complete && el.naturalWidth > 0), true);
    assert.ok(Number(await image.getAttribute('width')) > 0);
    assert.ok(Number(await image.getAttribute('height')) > 0);
  }
  await accessible(page);
  await screenshot(page, 'fixture-article-desktop');
  for (const width of [390, 320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(page);
    assert.equal(await page.locator('.prose pre').evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).overflowX === 'auto'), true);
    if (width === 390) { await accessible(page); await screenshot(page, 'fixture-article-mobile'); }
  }
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('测试拒绝剪贴板权限')) }); });
  await page.getByRole('button', { name: '复制第 1 个代码块' }).click();
  await expect(page.getByRole('button', { name: '复制第 1 个代码块' })).toHaveText('Press ⌘/Ctrl+C');
  assert.equal(await page.evaluate(() => getSelection()?.toString()), await page.locator('.prose pre code').textContent());
  await page.getByRole('link', { name: '← Back to Study' }).click();
  await expect(page.locator('h1')).toHaveText('Study');
  passed('Markdown 正文、目录锚点、表格、公式、两类本地图片、封面、高亮、真实剪贴板复制及拒绝权限后备操作');
  passed('相关文章与返回板块；文章在手机和平板不溢出，长代码在块内滚动');

  for (const slug of ['hidden-draft', 'default-draft']) {
    const response = await page.goto(withPosts + `/study/${slug}/`);
    assert.equal(response.status(), 404);
  }
  const buildFiles = await filesIn(join(temporary, 'dist'));
  assert.equal(buildFiles.some((path) => /hidden-draft|default-draft|draft-private/.test(path)), false);
  for (const path of buildFiles.filter((path) => /\.(html|js|json|txt)$/.test(path))) {
    const contents = await readFile(path, 'utf8');
    assert.equal(/DRAFT_SENTINEL_74329|DRAFT_BODY_SECRET_74329|DEFAULT_DRAFT_SECRET_74329/.test(contents), false, `草稿泄露：${path}`);
  }
  const liveFiles = await filesIn(join(root, 'dist'));
  assert.equal(liveFiles.filter((file) => file.endsWith('.html')).length, 6 + productionArticles.length);
  assert.equal(liveFiles.some((file) => /test-project|test-soil|test-related|hidden-draft|default-draft/.test(file)), false);
  passed('显式草稿和默认草稿均无路由、无列表、无构建正文；正式目录没有任何测试文章');

  const draftFile = join(temporary, 'content/study/hidden-draft.md');
  const draftSource = await readFile(draftFile, 'utf8');
  await writeFile(draftFile, draftSource.replace('draft: true', 'draft: false'));
  await runAstro(['build'], temporary);
  assert.equal((await page.goto(withPosts + '/study/hidden-draft/')).status(), 200);
  assert.equal((await filesIn(join(temporary, 'dist'))).some((path) => path.includes('draft-private')), true);
  await writeFile(draftFile, draftSource);
  await runAstro(['build'], temporary);
  assert.equal((await page.goto(withPosts + '/study/hidden-draft/')).status(), 404);
  assert.equal((await filesIn(join(temporary, 'dist'))).some((path) => /hidden-draft|draft-private/.test(path)), false);
  passed('文章发布后再撤回为草稿，旧路由和专属附件均从重新构建结果中清除');

  // 仅在隔离副本关闭配图，验证配置开关与文本布局。
  const settings = join(temporary, 'src/config/site.ts');
  await writeFile(settings, (await readFile(settings, 'utf8')).replace('showSectionImages: true', 'showSectionImages: false'));
  await runAstro(['build'], temporary);
  await page.goto(withPosts);
  await expect(page.locator('.section-preview img')).toHaveCount(0);
  await expect(page.locator('.section-preview')).toHaveCount(3);
  await noOverflow(page);
  passed('关闭配图后保留完整的三板块文字和入口');

  await fixture('study', 'invalid-metadata', { date: '2026-02-30', type: 'guide' });
  await assert.rejects(runAstro(['build'], temporary), /日期|类型|InvalidContentEntryDataError/);
  passed('非法日期与板块类型会阻止构建');
  assert.deepEqual(errors, []);
  passed('浏览器未出现未捕获 JavaScript 错误');
  await writeFile(join(output, 'report.json'), JSON.stringify({ status: 'passed', checkedAt: new Date().toISOString(), checks }, null, 2));
  console.log(`\n全部验收通过；截图位于 ${screenshots}`);
} catch (error) {
  await writeFile(join(output, 'report.json'), JSON.stringify({ status: 'failed', checks, error: String(error) }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await Promise.all(servers.map((server) => new Promise((accept) => {
    if (server.exitCode !== null) return accept();
    server.once('exit', accept);
    server.kill('SIGTERM');
  })));
  await rm(temporary, { recursive: true, force: true });
}
