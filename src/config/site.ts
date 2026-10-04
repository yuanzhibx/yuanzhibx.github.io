// 个人信息只在这里维护；首页和 About 共用同一份文案。
export const site = {
  name: 'Yuanzhibx',
  tagline: 'ALL IN AI.',
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
