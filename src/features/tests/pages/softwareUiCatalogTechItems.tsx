import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';

export const techItems: TechItem[] = [
  {
    id: 'T-01',
    name: '可拖拽分割线',
    plain: '就是你经常说的“红线位置”。鼠标放上去变成左右箭头，按住可以调整两边宽度。',
    tech: 'Resizable split pane / pointer events / CSS grid columns',
  },
  {
    id: 'T-02',
    name: '弹窗自由缩放',
    plain: '拖弹窗的边或角改变大小。拖右下角时，只动右边和下边，左上角不乱跑。',
    tech: 'Resizable modal / fixed origin geometry',
  },
  {
    id: 'T-03',
    name: '弹窗栈',
    plain: '多个弹窗一起打开时，Esc 只关闭最后打开的那个，不会一下全关。',
    tech: 'Modal stack / top modal escape handler',
  },
  {
    id: 'T-04',
    name: '点击外部关闭',
    plain: '有些设置页可以点空白关闭，有些编辑弹窗必须点 X 或 Esc。这个叫遮罩关闭规则。',
    tech: 'Backdrop click / modal close policy',
  },
  {
    id: 'T-05',
    name: '冻结表头',
    plain: '列表很多时，最上面的“原文 / 替换为”固定不动，下面内容滚动。',
    tech: 'Sticky header / position: sticky',
  },
  {
    id: 'T-06',
    name: '自动增高输入框',
    plain: '输入内容变多，框会跟着变高；超过限制后才出现滚动条。',
    tech: 'Auto-growing textarea',
  },
  {
    id: 'T-07',
    name: '只读可复制输入框',
    plain: '内容不能直接改，但可以选中、复制、滚动查看。',
    tech: 'Readonly textarea / selectable preview',
  },
  {
    id: 'T-08',
    name: '实时保存',
    plain: '改了分类、字号、宽度、当前标签后，不用点保存，下次打开还在。',
    tech: 'Local persistence / localStorage state',
  },
  {
    id: 'T-09',
    name: '标签记忆',
    plain: '上次停在角色、设定、脑洞哪个标签，下次打开还停在那里。',
    tech: 'Persisted active tab',
  },
  {
    id: 'T-10',
    name: '拖拽换分类',
    plain: '把角色、设定、细纲条目拖到另一个分类下面，就会移动分类。',
    tech: 'HTML drag and drop / drag state',
  },
  {
    id: 'T-11',
    name: '右键菜单',
    plain: '右键某个条目，弹出删除、置顶、清空等操作菜单。',
    tech: 'Context menu / portal overlay',
  },
  {
    id: 'T-12',
    name: '鼠标手势',
    plain: '按住右键向左滑回首页，向右滑前进；中途乱滑会判定无效。',
    tech: 'Mouse gesture recognizer / pointer trail',
  },
  {
    id: 'T-13',
    name: 'AI 生成链路',
    plain: '选择模型和提示词，把用户输入加上下文一起发给 AI，再显示结果。',
    tech: 'Model adapter / prompt composition / abort controller',
  },
  {
    id: 'T-14',
    name: 'RAG 召回',
    plain: '写作前先从设定库里找相关设定，再塞给 AI，避免写偏。',
    tech: 'Vector retrieval / pgvector / context injection',
  },
  {
    id: 'T-15',
    name: '内置数据库',
    plain: '软件自带 PostgreSQL 程序，用户不单独安装也能启动本地数据库。',
    tech: 'Embedded PostgreSQL runtime / child process',
  },
  {
    id: 'T-16',
    name: '打包资源',
    plain: '软件图标、数据库程序、运行时文件一起随安装包带过去。',
    tech: 'Electron builder extraResources / packaged runtime',
  },
  {
    id: 'T-17',
    name: '蓝色隐藏滚动条',
    plain: '平时看不到滚动条轨道，滚动或鼠标靠近时只显示蓝色滑块。',
    tech: 'Custom scrollbar / transparent track / hover reveal',
  },
  {
    id: 'T-18',
    name: '章节绑定内容',
    plain: '梗概、细纲、设定和某一章绑定，点章节时显示对应内容。',
    tech: 'Chapter-linked state / selected chapter id',
  },
  {
    id: 'T-19',
    name: '分裂按钮',
    plain: '一个按钮分成两个可点击区域：左边执行主操作，右边放锁定、下拉或更多设置，适合防止误触重要功能。',
    tech: 'Split button / compound button / adjacent action',
  },
  {
    id: 'T-20',
    name: '边框嵌入式透明背板',
    plain: '文字、字数、清空、章节信息这些内容压在边框线上时，不要加白底块，用透明背板和文字描边把边框线自然遮住。',
    tech: 'xy-border-embedded-transparent-backplate / transparent border-embedded label / text stroke mask',
  },
];
