import sharp from 'sharp';

// 从本地来源图生成两档尺寸；页面不依赖外部图片服务。
// 保留画面上方，让人物的脸部、耳麦和托腮动作在横幅中完整可见。
const positions = { study: 'north', coding: 'north', tools: 'north' };
for (const name of ['study', 'coding', 'tools']) {
  for (const width of [480, 960]) {
    const path = `public/images/${name}${width === 480 ? '-480' : ''}.webp`;
    await sharp(`src/assets/${name}-original.jpg`)
      .resize(width, Math.round(width * 11 / 24), { fit: 'cover', position: positions[name] })
      .webp({ quality: 85 })
      .toFile(path);
    console.log(`已生成 ${path}`);
  }
}
