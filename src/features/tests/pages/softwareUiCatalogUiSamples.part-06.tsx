import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart6: UiSample[] = [
  {
    id: 'UI-105',
    group: '手动上传',
    name: '波浪上浮输入框 Input',
    usage:
      '来自用户上传的 React + styled-components 代码。适合登录名、标题、短文本输入；聚焦或输入后，label 里的每个字母会按延迟依次上浮。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900 px-6 py-7">
        <style>{`
          .ui-105-form-control {
            position: relative;
            margin: 20px 0 40px;
            width: 190px;
          }
          .ui-105-form-control input {
            background-color: transparent;
            border: 0;
            border-bottom: 2px #fff solid;
            display: block;
            width: 100%;
            padding: 15px 0;
            font-size: 18px;
            color: #fff;
          }
          .ui-105-form-control input:focus,
          .ui-105-form-control input:valid {
            outline: 0;
            border-bottom-color: lightblue;
          }
          .ui-105-form-control label {
            position: absolute;
            top: 15px;
            left: 0;
            pointer-events: none;
          }
          .ui-105-form-control label span {
            display: inline-block;
            font-size: 18px;
            min-width: 5px;
            color: #fff;
            transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .ui-105-form-control input:focus + label span,
          .ui-105-form-control input:valid + label span {
            color: lightblue;
            transform: translateY(-30px);
          }
        `}</style>
        <div className="ui-105-form-control">
          <input type="text" required aria-label="Username" />
          <label>
            {'Username'.split('').map((char, index) => (
              <span key={`${char}-${index}`} style={{ transitionDelay: `${index * 50}ms` }}>
                {char}
              </span>
            ))}
          </label>
        </div>
        <code className="block rounded-lg bg-slate-800 px-3 py-2 text-[11px] leading-5 text-slate-300">
          input:focus + label span = lightblue + translateY(-30px), each span has 50ms delay
        </code>
      </div>
    ),
  },
  {
    id: 'UI-106',
    group: '手动上传',
    name: '书签收藏 Checkbox',
    usage:
      '来自用户上传的 React + styled-components 代码。适合收藏、加入书架、标记常用等状态；点击后书签变金色，并播放圆圈扩散和小点爆开动画。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-106-bookmark-label {
            --icon-size: 24px;
            --icon-secondary-color: rgb(77, 77, 77);
            --icon-hover-color: rgb(97, 97, 97);
            --icon-primary-color: gold;
            --icon-circle-border: 1px solid var(--icon-primary-color);
            --icon-circle-size: 35px;
            --icon-anmt-duration: 0.3s;
            display: inline-flex;
            cursor: pointer;
          }
          .ui-106-bookmark-label input {
            appearance: none;
            display: none;
          }
          .ui-106-bookmark {
            width: var(--icon-size);
            height: auto;
            fill: var(--icon-secondary-color);
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            transform-origin: top;
          }
          .ui-106-bookmark::after {
            content: "";
            position: absolute;
            width: 10px;
            height: 10px;
            box-shadow:
              0 30px 0 -4px var(--icon-primary-color),
              30px 0 0 -4px var(--icon-primary-color),
              0 -30px 0 -4px var(--icon-primary-color),
              -30px 0 0 -4px var(--icon-primary-color),
              -22px 22px 0 -4px var(--icon-primary-color),
              -22px -22px 0 -4px var(--icon-primary-color),
              22px -22px 0 -4px var(--icon-primary-color),
              22px 22px 0 -4px var(--icon-primary-color);
            border-radius: 50%;
            transform: scale(0);
          }
          .ui-106-bookmark::before {
            content: "";
            position: absolute;
            border-radius: 50%;
            border: var(--icon-circle-border);
            opacity: 0;
          }
          .ui-106-bookmark-label:hover .ui-106-bookmark {
            fill: var(--icon-hover-color);
          }
          .ui-106-bookmark-label input:checked + .ui-106-bookmark {
            fill: var(--icon-primary-color);
            animation: ui-106-bookmark var(--icon-anmt-duration) forwards;
            transition-delay: 0.3s;
          }
          .ui-106-bookmark-label input:checked + .ui-106-bookmark::before {
            animation: ui-106-circle var(--icon-anmt-duration) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            animation-delay: var(--icon-anmt-duration);
          }
          .ui-106-bookmark-label input:checked + .ui-106-bookmark::after {
            animation: ui-106-circles var(--icon-anmt-duration) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            animation-delay: var(--icon-anmt-duration);
          }
          @keyframes ui-106-bookmark {
            50% { transform: scaleY(0.6); }
            100% { transform: scaleY(1); }
          }
          @keyframes ui-106-circle {
            from {
              width: 0;
              height: 0;
              opacity: 0;
            }
            90% {
              width: var(--icon-circle-size);
              height: var(--icon-circle-size);
              opacity: 1;
            }
            to { opacity: 0; }
          }
          @keyframes ui-106-circles {
            from { transform: scale(0); }
            40% { opacity: 1; }
            to {
              transform: scale(0.8);
              opacity: 0;
            }
          }
        `}</style>
        <label className="ui-106-bookmark-label">
          <input type="checkbox" aria-label="Bookmark" />
          <div className="ui-106-bookmark">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <g>
                <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z" />
              </g>
            </svg>
          </div>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:checked + bookmark = gold fill + bookmark squash + circle burst animation
        </code>
      </div>
    ),
  },
  {
    id: 'UI-107',
    group: '手动上传',
    name: '滑入填充复选框 Checkbox',
    usage:
      '来自用户上传的 React + styled-components 代码。适合开关确认、批量选择、完成状态；点击后白色斜块从左上角滑入填满方框。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900 px-6 py-7">
        <style>{`
          .ui-107-checkbox {
            display: block;
            cursor: pointer;
            width: 30px;
            height: 30px;
            border: 3px solid rgba(255, 255, 255, 0);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            box-shadow: 0px 0px 0px 2px #fff;
          }
          .ui-107-checkbox div {
            width: 60px;
            height: 60px;
            background-color: #fff;
            top: -52px;
            left: -52px;
            position: absolute;
            transform: rotateZ(45deg);
            z-index: 100;
          }
          .ui-107-checkbox input[type="checkbox"]:checked + div {
            left: -10px;
            top: -10px;
          }
          .ui-107-checkbox input[type="checkbox"] {
            position: absolute;
            left: 50px;
            visibility: hidden;
          }
          .ui-107-transition {
            transition: 300ms ease;
          }
        `}</style>
        <label className="ui-107-checkbox">
          <input type="checkbox" aria-label="Checked" />
          <div className="ui-107-transition" />
        </label>
        <code className="block rounded-lg bg-slate-800 px-3 py-2 text-[11px] leading-5 text-slate-300">
          input:checked + div moves from top-left to fill the rounded square
        </code>
      </div>
    ),
  },
  {
    id: 'UI-108',
    group: '手动上传',
    name: '滑块胶囊标签 Radio',
    usage:
      '来自用户上传的 React + styled-components 代码。适合顶部标签、分类切换、状态筛选；选中项文字变蓝，浅蓝滑块会跟随移动，首个标签可带数字角标。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-108-tabs {
            display: flex;
            position: relative;
            background-color: #fff;
            box-shadow: 0 0 1px 0 rgba(24, 94, 224, 0.15), 0 6px 12px 0 rgba(24, 94, 224, 0.15);
            padding: 0.75rem;
            border-radius: 99px;
          }
          .ui-108-tabs * {
            z-index: 2;
          }
          .ui-108-container input[type="radio"] {
            display: none;
          }
          .ui-108-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 30px;
            width: 50px;
            font-size: .8rem;
            color: black;
            font-weight: 500;
            border-radius: 99px;
            cursor: pointer;
            transition: color 0.15s ease-in;
            position: relative;
          }
          .ui-108-notification {
            display: flex;
            align-items: center;
            justify-content: center;
            width: .8rem;
            height: .8rem;
            position: absolute;
            top: -2px;
            right: 3px;
            font-size: 10px;
            border-radius: 50%;
            margin: 0px;
            background-color: #e6eef9;
            transition: 0.15s ease-in;
          }
          .ui-108-container input[type="radio"]:checked + label {
            color: #185ee0;
          }
          .ui-108-container input[type="radio"]:checked + label > .ui-108-notification {
            background-color: #185ee0;
            color: #fff;
            margin: 0px;
          }
          .ui-108-container input[id="ui-108-radio-1"]:checked ~ .ui-108-glider {
            transform: translateX(0);
          }
          .ui-108-container input[id="ui-108-radio-2"]:checked ~ .ui-108-glider {
            transform: translateX(100%);
          }
          .ui-108-container input[id="ui-108-radio-3"]:checked ~ .ui-108-glider {
            transform: translateX(200%);
          }
          .ui-108-glider {
            position: absolute;
            display: flex;
            height: 30px;
            width: 50px;
            background-color: #e6eef9;
            z-index: 1;
            border-radius: 99px;
            transition: 0.25s ease-out;
          }
        `}</style>
        <div className="ui-108-container">
          <div className="ui-108-tabs">
            <input type="radio" id="ui-108-radio-1" name="ui-108-tabs" defaultChecked />
            <label className="ui-108-tab" htmlFor="ui-108-radio-1">
              Hello
              <span className="ui-108-notification">2</span>
            </label>
            <input type="radio" id="ui-108-radio-2" name="ui-108-tabs" />
            <label className="ui-108-tab" htmlFor="ui-108-radio-2">
              UI
            </label>
            <input type="radio" id="ui-108-radio-3" name="ui-108-tabs" />
            <label className="ui-108-tab" htmlFor="ui-108-radio-3">
              World
            </label>
            <span className="ui-108-glider" />
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          radio:checked + label changes color; checked radio moves the glider by 0 / 100% / 200%
        </code>
      </div>
    ),
  },
];
