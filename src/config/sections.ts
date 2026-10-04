export const sections = {
  study: {
    title: 'Study',
    description: '记录土壤、GIS 与遥感的学习与实践，整理阶段性成果与学习思考。',
    focus: ['Soil', 'GIS', 'Remote Sensing'],
    about: '整理阶段性成果，也记录学习过程中的问题与思考。',
    empty: '学习记录与阶段性成果将在整理完成后发布。',
    image: { src: '/images/study.webp', alt: '河流与农田交织的俯瞰景观' },
    types: ['project', 'note'],
  },
  coding: {
    title: 'Coding',
    description: '分享编程学习、技术文章与实践心得，持续探索代码与 AI 的可能。',
    focus: ['Programming', 'AI', 'Projects'],
    about: '记录编程中的理解与实践，积累可以复用的代码、脚本与工具。',
    empty: '技术文章与代码项目将在整理完成后发布。',
    image: { src: '/images/coding.webp', alt: '深色代码编辑器中的程序代码' },
    types: ['article', 'project'],
  },
  tools: {
    title: 'Tools',
    description: '整理软件使用教程、配置方法与实用攻略，让工具更好地服务学习与工作。',
    focus: ['Software', 'Setup', 'Workflows'],
    about: '整理具体的操作步骤与使用经验，让每一次配置和尝试都有迹可循。',
    empty: '软件教程、配置方法与实用攻略将在整理完成后发布。',
    image: { src: '/images/tools.webp', alt: '浅色桌面上的笔记本电脑与绿植' },
    types: ['tutorial', 'guide'],
  },
} as const;

export type Section = keyof typeof sections;
export const typeLabels = {
  project: 'Projects', note: 'Notes', article: 'Articles', tutorial: 'Tutorials', guide: 'Guides',
} as const;
