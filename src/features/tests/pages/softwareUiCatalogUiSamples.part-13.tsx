import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart13: UiSample[] = [
  {
    id: 'UI-131',
    group: '手动上传',
    name: '消息发送输入框 Input',
    usage:
      '来自用户本次上传的 React + styled-components 代码。适合 AI 对话输入区、作品编辑器右下角助手输入栏、需要图片或附件入口的消息发送栏。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-131-message-box {
            width: fit-content;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            padding: 0 15px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
          }
          .ui-131-message-box:focus-within {
            border: 1px solid #111827;
          }
          .ui-131-upload,
          .ui-131-send {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            background: transparent;
            color: #111827;
            cursor: pointer;
            outline: none;
          }
          .ui-131-upload {
            position: relative;
          }
          .ui-131-upload svg,
          .ui-131-send svg {
            height: 18px;
            transition: all 0.3s;
          }
          .ui-131-upload:hover,
          .ui-131-send:hover,
          .ui-131-message-input:focus ~ .ui-131-send,
          .ui-131-message-input:valid ~ .ui-131-send {
            color: #000000;
          }
          .ui-131-tooltip {
            position: absolute;
            top: -40px;
            display: none;
            opacity: 0;
            color: #111827;
            font-size: 10px;
            white-space: nowrap;
            background-color: #ffffff;
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 5px;
            box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.596);
            transition: all 0.3s;
          }
          .ui-131-upload:hover .ui-131-tooltip {
            display: block;
            opacity: 1;
          }
          .ui-131-message-input {
            width: 200px;
            height: 100%;
            background-color: transparent;
            outline: none;
            border: none;
            padding-left: 10px;
            color: #000000;
          }
        `}</style>
        <div className="ui-131-message-box">
          <button className="ui-131-upload" type="button" aria-label="Add an image">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
              <circle strokeWidth={20} stroke="currentColor" fill="none" r="158.5" cy="168.5" cx="168.5" />
              <path strokeLinecap="round" strokeWidth={25} stroke="currentColor" d="M167.759 79V259" />
              <path strokeLinecap="round" strokeWidth={25} stroke="currentColor" d="M79 167.138H259" />
            </svg>
            <span className="ui-131-tooltip">Add an image</span>
          </button>
          <input required placeholder="Message..." type="text" className="ui-131-message-input" aria-label="Message" />
          <button className="ui-131-send" type="button" aria-label="Send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
              <path
                fill="none"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              />
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="33.67"
                stroke="currentColor"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              />
            </svg>
          </button>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          messageBox: file upload icon + text input + send icon, focus-within highlights the border
        </code>
      </div>
    ),
  },
  {
    id: 'UI-132',
    group: '鎵嬪姩涓婁紶',
    name: '搜索输入框 Input',
    usage:
      '来自用户本次上传的 React + styled-components 代码。适合作品库、剧本库、提示词管理、UI 记录等列表页顶部搜索入口。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-132-group {
            display: flex;
            line-height: 28px;
            align-items: center;
            position: relative;
            max-width: 190px;
          }
          .ui-132-input {
            width: 100%;
            height: 40px;
            line-height: 28px;
            padding: 0 1rem;
            padding-left: 2.5rem;
            border: 2px solid transparent;
            border-radius: 8px;
            outline: none;
            background-color: #f3f3f4;
            color: #0d0c22;
            transition: .3s ease;
          }
          .ui-132-input::placeholder {
            color: #9e9ea7;
          }
          .ui-132-input:focus,
          .ui-132-input:hover {
            outline: none;
            border-color: rgba(234,76,137,0.4);
            background-color: #fff;
            box-shadow: 0 0 0 4px rgb(234 76 137 / 10%);
          }
          .ui-132-icon {
            position: absolute;
            left: 1rem;
            fill: #9e9ea7;
            width: 1rem;
            height: 1rem;
            pointer-events: none;
          }
        `}</style>
        <div className="ui-132-group">
          <svg className="ui-132-icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
            </g>
          </svg>
          <input placeholder="Search" type="search" className="ui-132-input" aria-label="Search" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          search input: leading icon, soft gray field, pink focus ring
        </code>
      </div>
    ),
  },
  {
    id: 'UI-133',
    group: '手动上传',
    name: '白色设置菜单 Radio',
    usage:
      '来自用户本次上传的 React + styled-components 纵向菜单。已改成白色背景黑色文字，适合模型选择框、提示词选择框、接口类型选择框；hover 时其它选项保持清晰，不做虚化。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-133-menu {
            display: flex;
            width: 240px;
            flex-direction: column;
            gap: 6px;
            overflow: hidden;
            border: 1px solid #dbe3ee;
            border-radius: 14px;
            background: #ffffff;
            padding: 8px;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
          }
          .ui-133-value {
            position: relative;
            display: flex;
            width: 100%;
            align-items: center;
            gap: 10px;
            border: 0;
            border-radius: 11px;
            background: transparent;
            padding: 10px;
            color: #111827;
            text-align: left;
            cursor: pointer;
            transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
          }
          .ui-133-value:hover,
          .ui-133-value:focus,
          .ui-133-value.is-active {
            outline: 0;
            background: #eefaff;
            color: #07a1c4;
          }
          .ui-133-value.is-active {
            transform: translateX(6px);
          }
          .ui-133-value::before {
            content: "";
            position: absolute;
            left: -7px;
            top: 9px;
            width: 4px;
            height: calc(100% - 18px);
            border-radius: 999px;
            background: #07a1c4;
            opacity: 0;
            transition: opacity 180ms ease;
          }
          .ui-133-value:focus::before,
          .ui-133-value.is-active::before {
            opacity: 1;
          }
          .ui-133-icon {
            display: grid;
            width: 30px;
            height: 30px;
            flex: 0 0 auto;
            place-items: center;
            border-radius: 10px;
            background: #f1f5f9;
            color: #64748b;
            font-size: 11px;
            font-weight: 950;
          }
          .ui-133-value:hover .ui-133-icon,
          .ui-133-value:focus .ui-133-icon,
          .ui-133-value.is-active .ui-133-icon {
            background: #dff7fd;
            color: #07a1c4;
          }
          .ui-133-text {
            display: flex;
            min-width: 0;
            flex-direction: column;
            gap: 2px;
          }
          .ui-133-text b {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            line-height: 1.2;
          }
          .ui-133-text em {
            color: #64748b;
            font-size: 11px;
            font-style: normal;
            line-height: 1.2;
          }
          .ui-133-value:hover .ui-133-text em,
          .ui-133-value:focus .ui-133-text em,
          .ui-133-value.is-active .ui-133-text em {
            color: #3b7180;
          }
        `}</style>
        <div className="ui-133-menu">
          {[
            ['GPT5.5', '通用创作', 'M'],
            ['DeepSeek 写作模型', '大纲/正文', 'AI'],
            ['OpenAI Compatible', '标准接口', 'API'],
            ['Ollama', '本地模型', 'L'],
          ].map(([label, desc, icon]) => (
            <button
              key={label}
              type="button"
              className={`ui-133-value ${label === 'DeepSeek 写作模型' ? 'is-active' : ''}`}
            >
              <span className="ui-133-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="ui-133-text">
                <b>{label}</b>
                <em>{desc}</em>
              </span>
            </button>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          white menu radio: model select / interface type select, no sibling blur on hover
        </code>
      </div>
    ),
  },
  {
    id: 'UI-134',
    group: '手动上传',
    name: '字号数量步进器 Input',
    usage:
      '来自用户上传的 React/Tailwind 数量输入步进器。适合所有字号大小设置：AI 输出字号、脑洞预览/输出字号、设定预览字号、剧本编辑器字号、调整模式字号等。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <div className="grid w-full max-w-[420px] gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {[
            ['AI 输出字号', 20],
            ['脑洞预览字号', 14],
            ['剧本编辑器字号', 16],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <span className="text-sm font-black text-slate-700">{label}</span>
              <FontSizeStepper
                value={Number(value)}
                min={12}
                max={32}
                onChange={() => undefined}
                ariaLabel={String(label)}
              />
            </div>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          quantity stepper: minus / centered value / plus, used for font size controls
        </code>
      </div>
    ),
  },
];
