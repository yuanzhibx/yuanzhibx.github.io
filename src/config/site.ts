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
    { text: '我是 Yuanzhibx，长期专注 ', strong: false },
    { text: 'Java AI', strong: true },
    { text: ' 技术栈、B 端 AI 应用产品开发与企业级项目交付。从模型能力到业务系统，从 Agent 编排到生产落地，持续构建真正进入企业工作流的 AI 产品。', strong: false },
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
