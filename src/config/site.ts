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
    { text: '我是 Yuanzhibx，一名农业工程与信息技术专业的硕士研究生。我希望在专业学习中逐步积累编程与算法实践经验，探索代码与 AI 在具体问题中的应用。', strong: false },
  ],
  aboutSections: [
    {
      id: 'interests',
      title: 'Interests',
      paragraphs: [
        '目前，我关注计算机算法与遥感的结合，希望从一个具体的遥感技术任务入手，逐步形成自己的研究方向。遥感影像变化检测、语义分割与地块提取是优先了解的候选方向，无人机遥感目标检测也是考虑中的方向。',
        '这些方向仍处于探索阶段，综述选题和毕业论文的具体问题尚未确定。',
      ],
    },
    {
      id: 'currently',
      title: 'Currently',
      paragraphs: [
        '近期，我希望围绕遥感算法完成一篇综述。选题前，计划通过文献阅读，比较已有综述的覆盖范围、公开数据与代码的可获取性，以及不同方向的学习难度，再逐步缩小问题范围。',
        '后续也希望围绕选定方向开展一个小型算法实践项目，从数据处理、代表方法复现到结果评估，加深对论文方法的理解，并积累实际的代码与实验经验。',
      ],
    },
    {
      id: 'about-this-site',
      title: 'About this site',
      paragraphs: [
        '建立这个网站，是希望把零散的学习记录整理成能够回顾、复用和交流的内容。这里会记录我对问题的理解、实践过程和遇到的困难，并随着学习深入逐步修正。',
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
