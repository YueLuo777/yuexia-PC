import { BookOpenText, EyeOff, FolderTree, Globe, Moon, NotebookText, Palette, Sparkles, Workflow } from 'lucide-react';

import type { TestGroup } from '@/features/tests/pages/testCollectionTypes';

export const testGroups: TestGroup[] = [
  {
    title: 'UI 与主题',
    items: [
      {
        title: '错误日志',
        description: '记录软件里出现过的问题、原因、修复办法和后续防复发规则。',
        path: '/error-log',
        icon: NotebookText,
        badge: 'Log',
      },
      {
        title: '隐藏页面',
        description: '集中检查没有展示在正式导航里的页面、旧入口和内嵌功能。',
        path: '/hidden-pages-test',
        icon: EyeOff,
        badge: 'Hidden',
      },
      {
        title: 'UI库',
        description: '查看软件内可复用 UI、手动上传 UI 和技术词典记录。',
        path: '/software-ui-catalog',
        icon: Palette,
        badge: 'UI',
      },
      {
        title: '主题颜色',
        description: '查看主题颜色、深色主题配色和页面色板测试。',
        path: '/theme-colors',
        icon: Moon,
        badge: 'Theme',
      },
      {
        title: '水墨2 深度配色预览',
        description: '对照软件标题栏、正文选中、分组、AI 输入区、发送图标、字号控件和首页侧栏的水墨2候选配色。',
        path: '/shuimo2-deep-palette-preview-test',
        icon: Palette,
        badge: 'Shuimo2',
      },
      {
        title: '作品设定命名与主角能力归属模拟',
        description:
          '按正式设定页模拟作品和人物设定；所有角色将背景目标并入基础档案，并统一境界、功法、战斗和其他技能。',
        path: '/work-setting-taxonomy-proposal-test',
        icon: BookOpenText,
        badge: 'Setting Plan',
      },
      {
        title: 'AI可执行设定分类模拟',
        description: '在16号结构上补充力量规则、人设约束、知情边界、动态状态、成长变化与反派计划，模拟AI实际读取效果。',
        path: '/setting-ai-ready-taxonomy-test',
        icon: Sparkles,
        badge: 'AI Ready',
      },
      {
        title: '提示词设定与AI创作流程模拟',
        description:
          '根据提示词文件夹整理设定页面，并把白皮书、档案、细纲、续写、审核、发布和状态更新串成一条AI创作流程。',
        path: '/prompt-driven-novel-workspace-test',
        icon: Workflow,
        badge: 'Prompt Workflow',
      },
      {
        title: '思考框外层样式对比',
        description: '用同一段思考内容对比双层框、单层蓝框、蓝色消息块和紧凑折叠条四种版本。',
        path: '/ai-thinking-shell-variants-test',
        icon: Sparkles,
        badge: 'Thinking UI',
      },
      {
        title: '全项目同功能样式对比',
        description: '把空状态、弹窗外壳、分段切换、选中颜色和资料选择行的正式页面现状并排展示。',
        path: '/ui-consistency-comparison-test',
        icon: Palette,
        badge: 'UI Compare',
      },
      {
        title: '标准模式创作工作台模拟',
        description: '模拟点击书籍直达正文，以及从书籍底部进入创作工作台后按步骤完成新书准备和日常章节创作。',
        path: '/standard-mode-workbench-test',
        icon: Workflow,
        badge: 'Standard Mode',
      },
      {
        title: '专业与标准模式首页切换',
        description: '保持正式左侧导航和首页公共区域不变，仅对比两种模式下的书籍卡片及创作工作台入口。',
        path: '/mode-switch-novel-library-test',
        icon: BookOpenText,
        badge: 'Mode Switch',
      },
      {
        title: '标准模式精简创作工作台',
        description: '复刻脑洞到综合点评的九个正式功能页面，移除独立AI配置栏，并把每步操作收进页面底部。',
        path: '/simplified-standard-mode-workbench-test',
        icon: Workflow,
        badge: 'Simple Mode',
      },
    ],
  },
  {
    title: 'AI 链路测试',
    items: [
      {
        title: '所有提示词',
        description: '整理旧提示词会创建的资料库、模板字段、读取链路和章节发布更新方式。',
        path: '/prompt-library-structure-test',
        icon: FolderTree,
        badge: 'Prompt Lib',
      },
      {
        title: '提示词目录预览测试',
        description: '左侧按流程列出提示词文件，右侧预览选中的提示词原文。',
        path: '/prompt-workflow-preview-test',
        icon: FolderTree,
        badge: 'Prompt View',
      },
    ],
  },
  {
    title: '工具测试',
    items: [
      {
        title: '内置浏览器',
        description: '测试网页打开、收藏和登录状态保留。',
        path: '/test-browser',
        icon: Globe,
        badge: 'Browser',
      },
      {
        title: '番茄题材迭代原型',
        description: '用内置浏览器打开番茄小说排行榜，读取当前小说公开信息后做爽点提炼和题材迁移。',
        path: '/tomato-genre-iteration-test',
        icon: Globe,
        badge: 'Tomato',
      },
    ],
  },
];
