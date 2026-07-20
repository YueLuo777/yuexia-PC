import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart8: UiSample[] = [
  {
    id: 'UI-113',
    group: '手动上传',
    name: '星标收藏 Checkbox',
    usage:
      '来自用户上传的 React + styled-components 代码。适合收藏、评分、标记重点、常用项目；hover 时星星放大，选中后变成黄色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-113-star input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
          }
          .ui-113-star {
            display: block;
            position: relative;
            cursor: pointer;
            user-select: none;
          }
          .ui-113-star svg {
            position: relative;
            top: 0;
            left: 0;
            height: 50px;
            width: 50px;
            transition: all 0.3s;
            fill: #666;
          }
          .ui-113-star svg:hover {
            transform: scale(1.1);
          }
          .ui-113-star input:checked ~ svg {
            fill: #ffeb49;
          }
        `}</style>
        <label className="ui-113-star">
          <input type="checkbox" aria-label="Star" />
          <svg
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <g>
              <g>
                <path d="M9.362,9.158c0,0-3.16,0.35-5.268,0.584c-0.19,0.023-0.358,0.15-0.421,0.343s0,0.394,0.14,0.521 c1.566,1.429,3.919,3.569,3.919,3.569c-0.002,0-0.646,3.113-1.074,5.19c-0.036,0.188,0.032,0.387,0.196,0.506 c0.163,0.119,0.373,0.121,0.538,0.028c1.844-1.048,4.606-2.624,4.606-2.624s2.763,1.576,4.604,2.625 c0.168,0.092,0.378,0.09,0.541-0.029c0.164-0.119,0.232-0.318,0.195-0.505c-0.428-2.078-1.071-5.191-1.071-5.191 s2.353-2.14,3.919-3.566c0.14-0.131,0.202-0.332,0.14-0.524s-0.23-0.319-0.42-0.341c-2.108-0.236-5.269-0.586-5.269-0.586 s-1.31-2.898-2.183-4.83c-0.082-0.173-0.254-0.294-0.456-0.294s-0.375,0.122-0.453,0.294C10.671,6.26,9.362,9.158,9.362,9.158z" />
              </g>
            </g>
          </svg>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:checked ~ svg turns the star yellow; svg:hover scales it up
        </code>
      </div>
    ),
  },
  {
    id: 'UI-114',
    group: '手动上传',
    name: '深色指示灯开关 Switch',
    usage:
      '来自用户上传的 React + styled-components 代码。适合启用状态、电源状态、自动化开关；深色外壳带内阴影，选中后拨片右移，指示环由红色变绿色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-114-switch-button {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto;
            height: 55px;
          }
          .ui-114-switch-outer {
            height: 100%;
            background: #252532;
            width: 115px;
            border-radius: 165px;
            box-shadow: inset 0px 5px 10px 0px #16151c, 0px 3px 6px -2px #403f4e;
            border: 1px solid #32303e;
            padding: 6px;
            box-sizing: border-box;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
          .ui-114-switch-outer input[type="checkbox"] {
            opacity: 0;
            appearance: none;
            position: absolute;
          }
          .ui-114-button {
            width: 100%;
            height: 100%;
            display: flex;
            position: relative;
            justify-content: space-between;
          }
          .ui-114-button-toggle {
            height: 42px;
            width: 42px;
            background: linear-gradient(#3b3a4e, #272733);
            border-radius: 100%;
            box-shadow: inset 0px 5px 4px 0px #424151, 0px 4px 15px 0px #0f0e17;
            position: relative;
            z-index: 2;
            transition: left 0.3s ease-in;
            left: 0;
          }
          .ui-114-switch-outer input[type="checkbox"]:checked + .ui-114-button .ui-114-button-toggle {
            left: 58%;
          }
          .ui-114-switch-outer input[type="checkbox"]:checked + .ui-114-button .ui-114-button-indicator {
            animation: ui-114-indicator 1s forwards;
          }
          .ui-114-button-indicator {
            height: 25px;
            width: 25px;
            top: 50%;
            transform: translateY(-50%);
            border-radius: 50%;
            border: 3px solid #ef565f;
            box-sizing: border-box;
            right: 10px;
            position: relative;
          }
          @keyframes ui-114-indicator {
            0% {
              opacity: 1;
            }
            30% {
              opacity: 0;
            }
            100% {
              opacity: 1;
              border: 3px solid #60d480;
              left: -68%;
            }
          }
        `}</style>
        <label className="ui-114-switch-button" htmlFor="ui-114-switch">
          <div className="ui-114-switch-outer">
            <input id="ui-114-switch" type="checkbox" />
            <div className="ui-114-button">
              <span className="ui-114-button-toggle" />
              <span className="ui-114-button-indicator" />
            </div>
          </div>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked moves the toggle right and animates the indicator from red to green
        </code>
      </div>
    ),
  },
  {
    id: 'UI-115',
    group: '手动上传',
    name: '月亮主题切换 Switch',
    usage:
      '来自用户上传的 React + styled-components 代码。现在落到软件顶部的“黑色主题”按钮；打开黑色主题时显示深色轨道和月亮圆点。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-115-toggle-switch {
            position: relative;
            width: 100px;
            height: 50px;
            --light: #d8dbe0;
            --dark: #28292c;
            --link: rgb(27, 129, 112);
            --link-hover: rgb(24, 94, 82);
          }
          .ui-115-switch-label {
            position: absolute;
            width: 100%;
            height: 50px;
            background-color: var(--dark);
            border-radius: 25px;
            cursor: pointer;
            border: 3px solid var(--dark);
          }
          .ui-115-checkbox {
            position: absolute;
            display: none;
          }
          .ui-115-slider {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 25px;
            transition: 0.3s;
          }
          .ui-115-checkbox:checked ~ .ui-115-slider {
            background-color: var(--light);
          }
          .ui-115-slider::before {
            content: "";
            position: absolute;
            top: 10px;
            left: 10px;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            box-shadow: inset 12px -4px 0px 0px var(--light);
            background-color: var(--dark);
            transition: 0.3s;
          }
          .ui-115-checkbox:checked ~ .ui-115-slider::before {
            transform: translateX(50px);
            background-color: var(--dark);
            box-shadow: none;
          }
        `}</style>
        <div className="ui-115-toggle-switch">
          <label className="ui-115-switch-label">
            <input type="checkbox" className="ui-115-checkbox" aria-label="Theme switch" />
            <span className="ui-115-slider" />
          </label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked changes the track to light and moves the moon knob to the right
        </code>
      </div>
    ),
  },
];
