import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';

export const colorSamples: ColorSample[] = [
  { id: 'C-01', name: '品牌蓝', value: '#08B3D9', usage: '主按钮、选中态、重要强调。' },
  { id: 'C-02', name: '浅品牌蓝', value: '#E6F7FB', usage: '蓝色 hover、浅选中背景、图标底色。' },
  { id: 'C-03', name: '深品牌蓝', value: '#0695B5', usage: '主按钮 hover。' },
  { id: 'C-04', name: '用户指定蓝', value: '#08AACE', usage: '滚动条滑块、分类文字、字号控制强调。' },
  { id: 'C-05', name: '选中暖底', value: '#FFF7ED', usage: '作品设定库选中内容背景。' },
  { id: 'C-06', name: '浅青分类', value: '#E6F8FB', usage: '男女主、正派配角等浅色分类底。' },
  { id: 'C-07', name: '危险红', value: '#EF4444', usage: '删除、错误、冲突。' },
  { id: 'C-08', name: '警告橙', value: '#F97316', usage: '置顶、覆盖、重新生成。' },
  { id: 'C-09', name: '成功绿', value: '#22C55E', usage: '成功状态、正常通过。' },
  { id: 'C-10', name: '面板白', value: '#FFFFFF', usage: '弹窗、卡片、输入框背景。', textClass: 'text-slate-700' },
  { id: 'C-11', name: '页面浅灰', value: '#F8FAFC', usage: '测试页、列表背景、弱分区。', textClass: 'text-slate-700' },
  { id: 'C-12', name: '边框灰', value: '#E5E7EB', usage: '输入框、卡片、分割边线。', textClass: 'text-slate-700' },
];
