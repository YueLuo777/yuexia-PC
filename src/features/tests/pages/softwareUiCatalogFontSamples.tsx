import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';

export const fontSamples: FontSample[] = [
  {
    id: 'F-01',
    name: '页面主标题',
    usage: '页面左上角主标题、重要弹窗标题。',
    className: 'text-3xl font-black text-slate-950',
    sample: '大纲设定',
  },
  {
    id: 'F-02',
    name: '模块标题',
    usage: '脑洞预览、设定预览、章节梗概这类区域标题。',
    className: 'text-xl font-black text-slate-900',
    sample: '脑洞预览',
  },
  {
    id: 'F-03',
    name: '区块标题',
    usage: '卡片标题、设置分组标题、表单小标题。',
    className: 'text-base font-bold text-slate-900',
    sample: '模型配置',
  },
  {
    id: 'F-04',
    name: '按钮文字',
    usage: '主按钮、普通按钮、弹窗底部操作按钮。',
    className: 'text-sm font-bold text-slate-800',
    sample: '发送',
  },
  {
    id: 'F-05',
    name: '正文输入',
    usage: '编辑器、预览框、AI 输出框里的长文本。',
    className: 'text-sm font-normal leading-7 text-slate-700',
    sample: '这里是正文内容，用于阅读、编辑和生成。',
  },
  {
    id: 'F-06',
    name: '辅助说明',
    usage: '空状态、提示说明、弱提示文字。',
    className: 'text-xs font-medium text-slate-400',
    sample: '用于提示当前状态或辅助说明',
  },
  {
    id: 'F-07',
    name: '编号强调',
    usage: 'UI 记录编号、统计数字、需要快速扫到的标识。',
    className: 'text-2xl font-black text-brand',
    sample: 'UI-18',
  },
  {
    id: 'F-08',
    name: '章节统计',
    usage: '章节数量、字数、当前脑洞字数等统计。',
    className: 'text-lg font-black text-slate-950',
    sample: '正文：3376字',
  },
];
