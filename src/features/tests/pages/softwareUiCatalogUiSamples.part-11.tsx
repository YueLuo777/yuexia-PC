import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart11: UiSample[] = [
  {
    id: 'UI-123',
    group: '手动上传',
    name: '霓虹描边文字按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合品牌标题、强调入口、炫酷操作按钮；默认是透明描边文字，hover 时绿色文字从左到右展开并产生发光效果。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-950 px-6 py-7">
        <style>{`
          .ui-123-button {
            margin: 0;
            height: auto;
            background: transparent;
            padding: 0;
            border: none;
            cursor: pointer;
            --border-right: 6px;
            --text-stroke-color: rgba(255, 255, 255, 0.6);
            --animation-color: #37ff8b;
            --fs-size: 2em;
            letter-spacing: 3px;
            text-decoration: none;
            font-size: var(--fs-size);
            font-family: Arial, sans-serif;
            position: relative;
            text-transform: uppercase;
            color: transparent;
            -webkit-text-stroke: 1px var(--text-stroke-color);
          }
          .ui-123-hover-text {
            position: absolute;
            box-sizing: border-box;
            color: var(--animation-color);
            width: 0%;
            inset: 0;
            border-right: var(--border-right) solid var(--animation-color);
            overflow: hidden;
            transition: 0.5s;
            -webkit-text-stroke: 1px var(--animation-color);
          }
          .ui-123-button:hover .ui-123-hover-text {
            width: 100%;
            filter: drop-shadow(0 0 23px var(--animation-color));
          }
        `}</style>
        <button className="ui-123-button" data-text="Awesome" type="button">
          <span className="ui-123-actual-text">&nbsp;uiverse&nbsp;</span>
          <span aria-hidden="true" className="ui-123-hover-text">
            &nbsp;uiverse&nbsp;
          </span>
        </button>
        <code className="block rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-5 text-slate-300">
          hover text starts at width 0, then expands to 100% with a neon drop-shadow
        </code>
      </div>
    ),
  },
  {
    id: 'UI-124',
    group: '手动上传',
    name: '图标状态切换 Switch',
    usage:
      '来自用户上传的 React + styled-components 代码。适合启用/禁用、通过/不通过、开启/关闭状态；拨片内置叉号和勾号，选中后轨道变绿、拨片右移、勾号放大显示。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-124-switch {
            --switch-width: 46px;
            --switch-height: 24px;
            --switch-bg: rgb(131, 131, 131);
            --switch-checked-bg: rgb(0, 218, 80);
            --switch-offset: calc((var(--switch-height) - var(--circle-diameter)) / 2);
            --switch-transition: all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
            --circle-diameter: 18px;
            --circle-bg: #fff;
            --circle-shadow: 1px 1px 2px rgba(146, 146, 146, 0.45);
            --circle-checked-shadow: -1px 1px 2px rgba(163, 163, 163, 0.45);
            --circle-transition: var(--switch-transition);
            --icon-transition: all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
            --icon-cross-color: var(--switch-bg);
            --icon-cross-size: 6px;
            --icon-checkmark-color: var(--switch-checked-bg);
            --icon-checkmark-size: 10px;
            --effect-width: calc(var(--circle-diameter) / 2);
            --effect-height: calc(var(--effect-width) / 2 - 1px);
            --effect-bg: var(--circle-bg);
            --effect-border-radius: 1px;
            --effect-transition: all .2s ease-in-out;
            display: inline-block;
          }
          .ui-124-switch input {
            display: none;
          }
          .ui-124-switch svg {
            transition: var(--icon-transition);
            position: absolute;
            height: auto;
          }
          .ui-124-checkmark {
            width: var(--icon-checkmark-size);
            color: var(--icon-checkmark-color);
            transform: scale(0);
          }
          .ui-124-cross {
            width: var(--icon-cross-size);
            color: var(--icon-cross-color);
          }
          .ui-124-slider {
            box-sizing: border-box;
            width: var(--switch-width);
            height: var(--switch-height);
            background: var(--switch-bg);
            border-radius: 999px;
            display: flex;
            align-items: center;
            position: relative;
            transition: var(--switch-transition);
            cursor: pointer;
          }
          .ui-124-circle {
            width: var(--circle-diameter);
            height: var(--circle-diameter);
            background: var(--circle-bg);
            border-radius: inherit;
            box-shadow: var(--circle-shadow);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--circle-transition);
            z-index: 1;
            position: absolute;
            left: var(--switch-offset);
          }
          .ui-124-slider::before {
            content: "";
            position: absolute;
            width: var(--effect-width);
            height: var(--effect-height);
            left: calc(var(--switch-offset) + (var(--effect-width) / 2));
            background: var(--effect-bg);
            border-radius: var(--effect-border-radius);
            transition: var(--effect-transition);
          }
          .ui-124-switch input:checked + .ui-124-slider {
            background: var(--switch-checked-bg);
          }
          .ui-124-switch input:checked + .ui-124-slider .ui-124-checkmark {
            transform: scale(1);
          }
          .ui-124-switch input:checked + .ui-124-slider .ui-124-cross {
            transform: scale(0);
          }
          .ui-124-switch input:checked + .ui-124-slider::before {
            left: calc(100% - var(--effect-width) - (var(--effect-width) / 2) - var(--switch-offset));
          }
          .ui-124-switch input:checked + .ui-124-slider .ui-124-circle {
            left: calc(100% - var(--circle-diameter) - var(--switch-offset));
            box-shadow: var(--circle-checked-shadow);
          }
        `}</style>
        <label className="ui-124-switch">
          <input defaultChecked type="checkbox" aria-label="Icon switch" />
          <div className="ui-124-slider">
            <div className="ui-124-circle">
              <svg
                className="ui-124-cross"
                xmlSpace="preserve"
                viewBox="0 0 365.696 365.696"
                height={6}
                width={6}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g>
                  <path
                    fill="currentColor"
                    d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"
                  />
                </g>
              </svg>
              <svg
                className="ui-124-checkmark"
                xmlSpace="preserve"
                viewBox="0 0 24 24"
                height={10}
                width={10}
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <g>
                  <path
                    fill="currentColor"
                    d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                  />
                </g>
              </svg>
            </div>
          </div>
        </label>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checked state turns the track green, moves the circle right, hides cross, and shows checkmark
        </code>
      </div>
    ),
  },
  {
    id: 'UI-125',
    group: '手动上传',
    name: '旋转加号按钮 Button',
    usage:
      '来自用户上传的 React + Tailwind class 代码。适合新增、创建、添加按钮；hover 时整颗圆形加号旋转 90 度并填充深色，active 时描边和填充进一步变浅/变深。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-125-button {
            cursor: pointer;
            outline: none;
            border: 0;
            background: transparent;
            padding: 0;
            transition: transform 300ms ease, color 300ms ease;
          }
          .ui-125-button:hover {
            transform: rotate(90deg);
          }
          .ui-125-icon {
            width: 50px;
            height: 50px;
            stroke: #a1a1aa;
            fill: none;
            transition: fill 300ms ease, stroke 300ms ease;
          }
          .ui-125-button:hover .ui-125-icon {
            fill: #27272a;
          }
          .ui-125-button:active .ui-125-icon {
            stroke: #e4e4e7;
            fill: #52525b;
            transition-duration: 0ms;
          }
        `}</style>
        <button title="Add New" className="ui-125-button" type="button" aria-label="Add New">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="ui-125-icon" aria-hidden="true">
            <path
              d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
              strokeWidth="1.5"
            />
            <path d="M8 12H16" strokeWidth="1.5" />
            <path d="M12 16V8" strokeWidth="1.5" />
          </svg>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          hover rotates the button 90deg and fills the circle; active changes stroke and fill instantly
        </code>
      </div>
    ),
  },
  {
    id: 'UI-126',
    group: '手动上传',
    name: '渐变纸飞机发送按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合发送、提交、发布等主操作；蓝色渐变胶囊按钮，hover 时整体上浮、阴影加深，纸飞机图标旋转。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-126-button {
            font-family: inherit;
            font-size: 18px;
            background: linear-gradient(to bottom, #4dc7d9 0%, #66a6ff 100%);
            color: white;
            padding: 0.8em 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 25px;
            box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
            cursor: pointer;
          }
          .ui-126-button:hover {
            transform: translateY(-3px);
            box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
          }
          .ui-126-button:active {
            transform: scale(0.95);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
          }
          .ui-126-button span {
            display: block;
            margin-left: 0.4em;
            transition: all 0.3s;
          }
          .ui-126-button svg {
            width: 18px;
            height: 18px;
            fill: white;
            transition: all 0.3s;
          }
          .ui-126-svg-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            margin-right: 0.5em;
            transition: all 0.3s;
          }
          .ui-126-button:hover .ui-126-svg-wrapper {
            background-color: rgba(255, 255, 255, 0.5);
          }
          .ui-126-button:hover svg {
            transform: rotate(45deg);
          }
        `}</style>
        <button className="ui-126-button" type="button">
          <div className="ui-126-svg-wrapper-1">
            <div className="ui-126-svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} aria-hidden="true">
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="currentColor"
                  d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                />
              </svg>
            </div>
          </div>
          <span>Send</span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover lifts up, brightens the icon circle, and rotates the plane 45deg
        </code>
      </div>
    ),
  },
];
