// 个人信息集中维护；首页简介与 About 文案分别配置。
export const site = {
  name: 'Yuanzhibx',
  tagline: 'ALL IN AI.',
  homeIntroduction: '我是 Yuanzhibx，一名农业工程与信息技术专业的硕士研究生。在这里记录学习过程，分享编程实践与工具使用经验，探索如何用代码与 AI 解决学习中的具体问题。',
  email: 'ybx0729@gmail.com',
  socialLinks: [
    { label: 'GitHub', handle: '@yuanzhibx', href: 'https://github.com/yuanzhibx' },
  ],
  introduction: [
    { text: '我是 Yuanzhibx，一名农业工程与信息技术专业的硕士研究生。在这里记录学习过程，分享编程实践与工具使用经验，探索如何用代码与 AI 解决学习中的具体问题。', strong: false },
  ],
  aboutSections: [
    {
      id: 'interests',
      title: 'Interests',
      paragraphs: [
        '目前，我对机器学习和 YOLO 等目标检测方法感兴趣，希望逐步理解模型的基本原理、训练过程和应用方式，并通过代码实践加深认识。我也关注这些方法在遥感影像分析中的应用，想进一步了解计算机算法如何帮助处理具体的农业与遥感问题。',
      ],
    },
    {
      id: 'currently',
      title: 'Currently',
      paragraphs: [
        '我希望在研一阶段完成并投稿一篇遥感与计算机算法相关的综述。目前还在探索具体选题，希望通过阅读文献、比较已有方法及其适用条件，逐步找到值得深入整理的问题。',
      ],
    },
    {
      id: 'about-this-site',
      title: 'About this site',
      paragraphs: [
        '建立这个网站，是希望把零散的学习记录整理成能够回顾、复用和交流的内容。这里会记录我对问题的理解、实践过程和遇到的困难，并随着学习深入逐步修正。',
        '网站主要分为 Study、Coding 和 Tools 三个部分，分别记录专业学习、编程实践，以及软件工具的使用经验。我会从日常笔记中挑选适合公开的内容，重新整理成文章，也希望逐渐积累一些可以重复使用的代码、方法和操作流程。',
        '对我而言，整理和写作也是检查自己是否理解一个问题的过程。这里的内容会随着新的学习和实践持续补充；如果你发现错误，或有不同的理解，欢迎通过邮箱或 GitHub 与我交流。',
      ],
    },
  ],
  decorationTopics: ['SOIL', 'GIS', 'REMOTE SENSING', 'CODE', 'TOOLS'],
  decorationMotto: ['KEEP LEARNING', 'KEEP EXPLORING'],
  showSectionImages: true,
};

export const introductionText = site.introduction.map((part) => part.text).join('');
export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Study', href: '/study/' },
  { label: 'Coding', href: '/coding/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'About', href: '/about/' },
];
