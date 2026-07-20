import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart12: UiSample[] = [
  {
    id: 'UI-127',
    group: '手动上传',
    name: '交互色板卡片 Card',
    usage:
      '来自用户上传的 React + styled-components 代码。适合配色方案展示、主题色收藏、色卡预览；hover 某个色块时该色块变宽并显示色号。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-127-container {
            height: 200px;
            width: 350px;
            border-radius: 1em;
            overflow: hidden;
            box-shadow: 0 10px 20px #dbdbdb;
            font-family: sans-serif;
          }
          .ui-127-palette {
            display: flex;
            height: 86%;
            width: 100%;
          }
          .ui-127-color {
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            letter-spacing: 1px;
            transition: flex 0.1s linear;
          }
          .ui-127-color span {
            opacity: 0;
            transition: opacity 0.1s linear;
          }
          .ui-127-color:nth-child(1) {
            background: #264653;
          }
          .ui-127-color:nth-child(2) {
            background: #2a9d8f;
          }
          .ui-127-color:nth-child(3) {
            background: #e9c46a;
          }
          .ui-127-color:nth-child(4) {
            background: #f4a261;
          }
          .ui-127-color:nth-child(5) {
            background: #e76f51;
          }
          .ui-127-color:hover {
            flex: 2;
            box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
          }
          .ui-127-color:hover span {
            opacity: 1;
          }
          .ui-127-stats {
            height: 14%;
            width: 100%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5em;
            box-sizing: border-box;
            color: #bebebe;
          }
          .ui-127-stats svg {
            fill: #bebebe;
            transform: scale(1.2);
          }
        `}</style>
        <div className="ui-127-container">
          <div className="ui-127-palette">
            {['264653', '2A9D8F', 'E9C46A', 'F4A261', 'E76F51'].map((color) => (
              <div key={color} className="ui-127-color">
                <span>{color}</span>
              </div>
            ))}
          </div>
          <div className="ui-127-stats">
            <span>53421 saves</span>
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
              <path d="M4 7.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S5.5 9.83 5.5 9 4.83 7.5 4 7.5zm10 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S9.83 7.5 9 7.5z" />
            </svg>
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          color:hover doubles its flex size and reveals the color code
        </code>
      </div>
    ),
  },
  {
    id: 'UI-128',
    group: '手动上传',
    name: '圆形展开删除按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合删除、清空、移除等危险操作；默认是黑色圆形垃圾桶，hover 后展开为红色胶囊并显示 Delete 文案。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-128-button {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgb(20, 20, 20);
            border: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.164);
            cursor: pointer;
            transition-duration: .3s;
            overflow: hidden;
            position: relative;
          }
          .ui-128-svg-icon {
            width: 12px;
            transition-duration: .3s;
          }
          .ui-128-svg-icon path {
            fill: white;
          }
          .ui-128-button:hover {
            width: 140px;
            border-radius: 50px;
            transition-duration: .3s;
            background-color: rgb(255, 69, 69);
            align-items: center;
          }
          .ui-128-button:hover .ui-128-svg-icon {
            width: 50px;
            transition-duration: .3s;
            transform: translateY(60%);
          }
          .ui-128-button::before {
            position: absolute;
            top: -20px;
            content: "Delete";
            color: white;
            transition-duration: .3s;
            font-size: 2px;
          }
          .ui-128-button:hover::before {
            font-size: 13px;
            opacity: 1;
            transform: translateY(30px);
            transition-duration: .3s;
          }
        `}</style>
        <button className="ui-128-button" type="button" aria-label="Delete">
          <svg viewBox="0 0 448 512" className="ui-128-svg-icon" aria-hidden="true">
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
          </svg>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover expands from a 50px circle to a 140px red pill and reveals Delete text
        </code>
      </div>
    ),
  },
  {
    id: 'UI-129',
    group: '手动上传',
    name: '波浪标签输入框 Input',
    usage:
      '来自用户上传的 React + styled-components 代码。适合名称、标题、短文本输入；聚焦或输入后标签逐字上浮，底部蓝色线条从中间向两侧展开。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-129-wave-group {
            position: relative;
          }
          .ui-129-input {
            font-size: 16px;
            padding: 10px 10px 10px 5px;
            display: block;
            width: 200px;
            border: none;
            border-bottom: 1px solid #515151;
            background: transparent;
          }
          .ui-129-input:focus {
            outline: none;
          }
          .ui-129-label {
            color: #999;
            font-size: 18px;
            font-weight: normal;
            position: absolute;
            pointer-events: none;
            left: 5px;
            top: 10px;
            display: flex;
          }
          .ui-129-label-char {
            transition: 0.2s ease all;
            transition-delay: calc(var(--index) * .05s);
          }
          .ui-129-input:focus ~ .ui-129-label .ui-129-label-char,
          .ui-129-input:valid ~ .ui-129-label .ui-129-label-char {
            transform: translateY(-20px);
            font-size: 14px;
            color: #5264ae;
          }
          .ui-129-bar {
            position: relative;
            display: block;
            width: 200px;
          }
          .ui-129-bar::before,
          .ui-129-bar::after {
            content: '';
            height: 2px;
            width: 0;
            bottom: 1px;
            position: absolute;
            background: #5264ae;
            transition: 0.2s ease all;
          }
          .ui-129-bar::before {
            left: 50%;
          }
          .ui-129-bar::after {
            right: 50%;
          }
          .ui-129-input:focus ~ .ui-129-bar::before,
          .ui-129-input:focus ~ .ui-129-bar::after {
            width: 50%;
          }
        `}</style>
        <div className="ui-129-wave-group">
          <input required type="text" className="ui-129-input" aria-label="Name" />
          <span className="ui-129-bar" />
          <label className="ui-129-label">
            {'Name'.split('').map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="ui-129-label-char"
                style={{ '--index': index } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          focus moves label chars upward with staggered delay and expands the underline from center
        </code>
      </div>
    ),
  },
  {
    id: 'UI-130',
    group: '手动上传',
    name: '深色浮动标签输入框 Input',
    usage:
      '来自用户本次上传的 React + styled-components 代码。用于作品编辑器 AI 输入框、大纲设定 AI 输入框、脑洞字段、剧本编辑器 AI 输入框、新增模型和创建提示词表单。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-130-input-group {
            position: relative;
            background: #ffffff;
            border-radius: 1rem;
            padding: 1.25rem;
          }
          .ui-130-input {
            width: 220px;
            border: solid 1.5px #9e9e9e;
            border-radius: 1rem;
            background: #ffffff;
            padding: 1rem;
            font-size: 1rem;
            color: #111827;
            transition: border 150ms cubic-bezier(0.4,0,0.2,1);
          }
          .ui-130-user-label {
            position: absolute;
            left: 35px;
            top: 20px;
            color: #111827;
            pointer-events: none;
            transform: translateY(1rem);
            transition: 150ms cubic-bezier(0.4,0,0.2,1);
          }
          .ui-130-input:focus,
          .ui-130-input:valid {
            outline: none;
            border: 1.5px solid #111827;
          }
          .ui-130-input:focus ~ .ui-130-user-label,
          .ui-130-input:valid ~ .ui-130-user-label {
            transform: translateY(-50%) scale(0.8);
            background-color: #ffffff;
            padding: 0 .2em;
            color: #111827;
          }
        `}</style>
        <div className="ui-130-input-group">
          <input
            required
            type="text"
            name="ui-130-text"
            autoComplete="off"
            className="ui-130-input"
            aria-label="AI 输入内容"
          />
          <label className="ui-130-user-label">AI 输入内容</label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:focus or input:valid keeps the white field and dark label visible
        </code>
      </div>
    ),
  },
];
