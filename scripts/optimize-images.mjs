import sharp from 'sharp';

// 从本地来源图生成两档尺寸；页面不依赖外部图片服务。
for (const name of ['study', 'coding', 'tools']) {
  for (const width of [480, 960]) {
    const path = `public/images/${name}${width === 480 ? '-480' : ''}.webp`;
    await sharp(`src/assets/${name}-original.jpg`)
      .resize(width, Math.round(width * 11 / 24), { fit: 'cover', position: name === 'tools' ? 'south' : 'centre' })
      .webp({ quality: 79 })
      .toFile(path);
    console.log(`已生成 ${path}`);
  }
}
