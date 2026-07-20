import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart5: UiSample[] = [
  {
    id: 'UI-94',
    group: '颜色',
    name: '颜色网格',
    usage: '主题颜色页面里选择颜色，按颜色本身排列。',
    preview: (
      <div className="grid w-[240px] grid-cols-8 gap-1.5 rounded-xl border border-slate-200 bg-white p-3">
        {[
          '#08AACE',
          '#22C55E',
          '#F97316',
          '#EF4444',
          '#8B5CF6',
          '#111827',
          '#EAB308',
          '#14B8A6',
          '#0EA5E9',
          '#F43F5E',
          '#84CC16',
          '#64748B',
        ].map((color) => (
          <span
            key={color}
            className="h-6 w-6 rounded-lg border border-white shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    ),
  },
  {
    id: 'UI-95',
    group: '颜色',
    name: '颜色绑定状态',
    usage: '先选填色位置，再选颜色，橙色框表示当前正在绑定。',
    preview: (
      <div className="flex w-[300px] items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="rounded-xl border-2 border-orange-500 px-3 py-2 text-xs font-black text-slate-700">
          按钮背景
        </div>
        <span className="text-xs font-black text-slate-300">→</span>
        <div className="h-9 w-9 rounded-xl bg-[#08AACE] shadow-sm" />
      </div>
    ),
  },
  {
    id: 'UI-96',
    group: '封面库',
    name: '封面缩略卡',
    usage: '封面库列表里展示封面、标题、状态。',
    preview: (
      <div className="w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-br from-slate-800 via-[#08AACE] to-slate-100" />
        <div className="p-3">
          <div className="truncate text-sm font-black text-slate-900">月落之后</div>
          <div className="mt-1 text-xs font-bold text-slate-400">默认封面</div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-97',
    group: '作品',
    name: '小说作品卡',
    usage: '首页作品列表，显示小说名、简介、字数和进入按钮。',
    preview: (
      <div className="w-[280px] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="text-base font-black text-slate-900">小说名：月落之后</div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">一部围绕月落灾变展开的长篇小说。</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-black text-[#08AACE]">正文：32万字</span>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">进入</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-98',
    group: '作品',
    name: '章节目录行',
    usage: '编辑器章节列表、梗概章节列表、细纲章节列表。',
    preview: (
      <div className="w-[300px] rounded-xl border border-slate-200 bg-white p-2">
        <div className="rounded-lg border border-[#08AACE] bg-[#FFF7ED] px-3 py-2">
          <div className="text-sm font-black text-slate-900">第22章 慌什么，完全不关你的事</div>
          <div className="mt-1 text-xs font-black text-slate-600">正文：3376字</div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-99',
    group: 'AI',
    name: '自动增高发送框',
    usage: 'AI 对话输入，回车发送，内容变多时框自动变高。',
    preview: (
      <div className="w-[300px] rounded-2xl border border-slate-200 bg-white p-2">
        <textarea
          className="h-14 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-brand"
          placeholder="输入内容，回车发送..."
        />
        <div className="mt-2 flex justify-end gap-2">
          <button className="h-8 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-500">清空</button>
          <button className="h-8 rounded-lg bg-[#08AACE] px-3 text-xs font-black text-white">发送</button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-100',
    group: 'AI',
    name: 'AI 输出结果框',
    usage: '脑洞输出框、梗概预览、细纲预览，右上角带复制/清空。',
    preview: (
      <div className="w-[300px] rounded-2xl border border-slate-200 bg-white">
        <div className="flex h-10 items-center justify-between border-b border-slate-100 px-3">
          <span className="text-sm font-black text-slate-900">脑洞输出框</span>
          <div className="flex gap-1">
            <button className="h-7 rounded-lg bg-slate-100 px-2 text-[11px] font-black text-slate-500">复制</button>
            <button className="h-7 rounded-lg bg-slate-100 px-2 text-[11px] font-black text-slate-500">清空</button>
          </div>
        </div>
        <div className="h-20 p-3 text-xs leading-6 text-slate-500">这里显示 AI 生成结果，可以编辑、复制或保存。</div>
      </div>
    ),
  },
  {
    id: 'UI-101',
    group: '按钮',
    name: '标题胶囊管理按钮',
    usage: '放在页面标题右侧，把模型管理和提示词管理合并成一个胶囊双按钮。',
    preview: (
      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <span className="text-sm font-black text-slate-900">大纲生成</span>
        <div className="flex h-8 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
          <button className="h-full px-3 text-xs font-black text-slate-600 hover:bg-[#08AACE] hover:text-white">
            模型管理
          </button>
          <button className="h-full border-l border-slate-200 px-3 text-xs font-black text-slate-600 hover:bg-[#08AACE] hover:text-white">
            提示词管理
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-102',
    group: '标签',
    name: '内嵌分段选择器',
    usage:
      '来自用户提供的 radio-inputs 代码。用于卡片宽度、封面高度、字号、小中大、多选一配置项；外层浅灰底，选中项白底浮起。',
    preview: (
      <div className="space-y-3">
        <div className="inline-flex w-[300px] flex-wrap rounded-lg bg-[#EEE] p-1 text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
          {['HTML', 'React', 'Vue'].map((item) => (
            <label key={item} className="flex-1 cursor-pointer text-center">
              <input type="radio" name="ui-102-radio" defaultChecked={item === 'HTML'} className="peer hidden" />
              <span className="flex items-center justify-center rounded-lg px-3 py-2 text-slate-700 transition-all duration-150 ease-in-out peer-checked:bg-white peer-checked:font-semibold">
                {item}
              </span>
            </label>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          .radio-inputs: flex + #EEE + p-1; input hidden; input:checked + .name = white + font-weight 600
        </code>
        <div className="rounded-lg bg-sky-50 px-3 py-2 text-xs leading-6 text-slate-600">
          <b className="text-sky-600">大白话：</b>
          HTML 是骨架，CSS 是皮肤，React 代码就是把骨架和皮肤打包成一个可复用的小零件。以后从 UI 网站拿这种组件，优先拿
          React 版本。
        </div>
      </div>
    ),
  },
  {
    id: 'UI-103',
    group: '手动上传',
    name: '心形收藏 Checkbox',
    usage:
      '来自用户上传的 React + styled-components 代码。适合收藏、喜欢、常用、置顶这类轻量状态；点击后心形填充并播放庆祝线条动画。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-103-heart {
            --heart-color: rgb(255, 91, 137);
            position: relative;
            width: 50px;
            height: 50px;
            transition: .3s;
          }
          .ui-103-heart .ui-103-checkbox {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            z-index: 20;
            cursor: pointer;
          }
          .ui-103-heart .ui-103-svg-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .ui-103-heart .ui-103-svg-outline,
          .ui-103-heart .ui-103-svg-filled {
            fill: var(--heart-color);
            position: absolute;
          }
          .ui-103-heart .ui-103-svg-filled {
            animation: ui-103-svg-filled 1s;
            display: none;
          }
          .ui-103-heart .ui-103-svg-celebrate {
            position: absolute;
            animation: ui-103-svg-celebrate .5s;
            animation-fill-mode: forwards;
            display: none;
            stroke: var(--heart-color);
            fill: var(--heart-color);
            stroke-width: 2px;
          }
          .ui-103-heart .ui-103-checkbox:checked ~ .ui-103-svg-container .ui-103-svg-filled,
          .ui-103-heart .ui-103-checkbox:checked ~ .ui-103-svg-container .ui-103-svg-celebrate {
            display: block;
          }
          @keyframes ui-103-svg-filled {
            0% { transform: scale(0); }
            25% { transform: scale(1.2); }
            50% { transform: scale(1); filter: brightness(1.5); }
          }
          @keyframes ui-103-svg-celebrate {
            0% { transform: scale(0); }
            50% { opacity: 1; filter: brightness(1.5); }
            100% { transform: scale(1.4); opacity: 0; display: none; }
          }
        `}</style>
        <div className="ui-103-heart" title="Like">
          <input type="checkbox" className="ui-103-checkbox" aria-label="Like" />
          <div className="ui-103-svg-container">
            <svg viewBox="0 0 24 24" className="ui-103-svg-outline" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z" />
            </svg>
            <svg viewBox="0 0 24 24" className="ui-103-svg-filled" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
            </svg>
            <svg className="ui-103-svg-celebrate" width={100} height={100} xmlns="http://www.w3.org/2000/svg">
              <polygon points="10,10 20,20" />
              <polygon points="10,50 20,50" />
              <polygon points="20,80 30,70" />
              <polygon points="90,10 80,20" />
              <polygon points="90,50 80,50" />
              <polygon points="80,80 70,70" />
            </svg>
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked ~ svg-container shows filled heart + celebrate animation
        </code>
      </div>
    ),
  },
  {
    id: 'UI-104',
    group: '手动上传',
    name: '弹性滑动开关 Switch',
    usage:
      '来自用户上传的 React + styled-components 代码。适合启用/禁用、自动/手动、开关设置这类二选一状态；选中后变蓝，按住时滑块会被拉长。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-104-switch {
            --button-width: 3.5em;
            --button-height: 2em;
            --toggle-diameter: 1.5em;
            --button-toggle-offset: calc((var(--button-height) - var(--toggle-diameter)) / 2);
            --toggle-shadow-offset: 10px;
            --toggle-wider: 3em;
            --color-grey: #cccccc;
            --color-green: #4296f4;
            display: inline-flex;
            cursor: pointer;
          }
          .ui-104-slider {
            display: inline-block;
            width: var(--button-width);
            height: var(--button-height);
            background-color: var(--color-grey);
            border-radius: calc(var(--button-height) / 2);
            position: relative;
            transition: 0.3s all ease-in-out;
          }
          .ui-104-slider::after {
            content: "";
            display: inline-block;
            width: var(--toggle-diameter);
            height: var(--toggle-diameter);
            background-color: #fff;
            border-radius: calc(var(--toggle-diameter) / 2);
            position: absolute;
            top: var(--button-toggle-offset);
            transform: translateX(var(--button-toggle-offset));
            box-shadow: var(--toggle-shadow-offset) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
            transition: 0.3s all ease-in-out;
          }
          .ui-104-checkbox {
            display: none;
          }
          .ui-104-checkbox:checked + .ui-104-slider {
            background-color: var(--color-green);
          }
          .ui-104-checkbox:checked + .ui-104-slider::after {
            transform: translateX(calc(var(--button-width) - var(--toggle-diameter) - var(--button-toggle-offset)));
            box-shadow: calc(var(--toggle-shadow-offset) * -1) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
          }
          .ui-104-checkbox:active + .ui-104-slider::after {
            width: var(--toggle-wider);
          }
          .ui-104-checkbox:checked:active + .ui-104-slider::after {
            transform: translateX(calc(var(--button-width) - var(--toggle-wider) - var(--button-toggle-offset)));
          }
        `}</style>
        <label className="ui-104-switch">
          <input type="checkbox" className="ui-104-checkbox" aria-label="Switch" />
          <span className="ui-104-slider" />
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked + slider = blue background + knob translate right; active stretches knob
        </code>
      </div>
    ),
  },
];
