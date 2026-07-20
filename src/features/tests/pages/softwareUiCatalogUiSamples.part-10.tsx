import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart10: UiSample[] = [
  {
    id: 'UI-119',
    group: '手动上传',
    name: '纸飞机发送按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合发送、提交、发布等操作；hover 时纸飞机向右飞并轻微上下浮动，文字滑出，按下时按钮缩小。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-119-button {
            font-family: inherit;
            font-size: 20px;
            background: royalblue;
            color: white;
            padding: 0.7em 1em;
            padding-left: 0.9em;
            display: flex;
            align-items: center;
            border: none;
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.2s;
            cursor: pointer;
          }
          .ui-119-button span {
            display: block;
            margin-left: 0.3em;
            transition: all 0.3s ease-in-out;
          }
          .ui-119-button svg {
            display: block;
            transform-origin: center center;
            transition: transform 0.3s ease-in-out;
          }
          .ui-119-button:hover .ui-119-svg-wrapper {
            animation: ui-119-fly 0.6s ease-in-out infinite alternate;
          }
          .ui-119-button:hover svg {
            transform: translateX(1.2em) rotate(45deg) scale(1.1);
          }
          .ui-119-button:hover span {
            transform: translateX(5em);
          }
          .ui-119-button:active {
            transform: scale(0.95);
          }
          @keyframes ui-119-fly {
            from { transform: translateY(0.1em); }
            to { transform: translateY(-0.1em); }
          }
        `}</style>
        <button className="ui-119-button" type="button">
          <div className="ui-119-svg-wrapper-1">
            <div className="ui-119-svg-wrapper">
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
          button:hover animates the plane wrapper, rotates the SVG, and slides the text away
        </code>
      </div>
    ),
  },
  {
    id: 'UI-120',
    group: '手动上传',
    name: '四宫格社交按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合社交入口、平台跳转、快捷外链；四个卡片组成异形圆角四宫格，hover 时单个卡片放大并切换品牌底色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-120-main {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
          }
          .ui-120-row {
            display: flex;
            flex-direction: row;
            gap: 0.5em;
          }
          .ui-120-card {
            width: 90px;
            height: 90px;
            outline: none;
            border: none;
            background: white;
            box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
            transition: .2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 900;
          }
          .ui-120-card1 {
            border-radius: 90px 5px 5px 5px;
            color: #cc39a4;
          }
          .ui-120-card2 {
            border-radius: 5px 90px 5px 5px;
            color: #03a9f4;
          }
          .ui-120-card3 {
            border-radius: 5px 5px 5px 90px;
            color: #111111;
          }
          .ui-120-card4 {
            border-radius: 5px 5px 90px 5px;
            color: #8c9eff;
          }
          .ui-120-card:hover {
            cursor: pointer;
            scale: 1.1;
            color: white;
          }
          .ui-120-card1:hover {
            background-color: #cc39a4;
          }
          .ui-120-card2:hover {
            background-color: #03a9f4;
          }
          .ui-120-card3:hover {
            background-color: black;
          }
          .ui-120-card4:hover {
            background-color: #8c9eff;
          }
        `}</style>
        <div className="ui-120-main">
          <div className="ui-120-row">
            <button className="ui-120-card ui-120-card1" type="button">
              IG
            </button>
            <button className="ui-120-card ui-120-card2" type="button">
              X
            </button>
          </div>
          <div className="ui-120-row">
            <button className="ui-120-card ui-120-card3" type="button">
              GH
            </button>
            <button className="ui-120-card ui-120-card4" type="button">
              DC
            </button>
          </div>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          each corner card has a different radius and brand hover color; hover scales the active card
        </code>
      </div>
    ),
  },
  {
    id: 'UI-121',
    group: '手动上传',
    name: '展开删除按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合删除、移除、清空等危险操作；hover 时文字变透明，右侧 X 图标区域展开成整颗按钮，按下时图标缩小。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-121-button {
            width: 150px;
            height: 50px;
            cursor: pointer;
            display: flex;
            align-items: center;
            background: #e62222;
            border: none;
            border-radius: 5px;
            box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
            position: relative;
          }
          .ui-121-button,
          .ui-121-button span {
            transition: 200ms;
          }
          .ui-121-text {
            transform: translateX(35px);
            color: white;
            font-weight: bold;
          }
          .ui-121-icon {
            position: absolute;
            border-left: 1px solid #c41b1b;
            transform: translateX(110px);
            height: 40px;
            width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ui-121-button svg {
            width: 15px;
            fill: #eee;
          }
          .ui-121-button:hover {
            background: #ff3636;
          }
          .ui-121-button:hover .ui-121-text {
            color: transparent;
          }
          .ui-121-button:hover .ui-121-icon {
            width: 150px;
            border-left: none;
            transform: translateX(0);
          }
          .ui-121-button:focus {
            outline: none;
          }
          .ui-121-button:active .ui-121-icon svg {
            transform: scale(0.8);
          }
        `}</style>
        <button className="ui-121-button" type="button">
          <span className="ui-121-text">Delete</span>
          <span className="ui-121-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
            </svg>
          </span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover hides the text and expands the icon segment to full width
        </code>
      </div>
    ),
  },
  {
    id: 'UI-122',
    group: '手动上传',
    name: '展开导航菜单 Radio',
    usage:
      '来自用户上传的 React + styled-components 代码。适合底部导航、顶部工具菜单、模块切换；默认只显示图标，hover 或 focus 时菜单项变宽，标题从右侧滑入。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-122-menu {
            padding: 0.5rem;
            background-color: #fff;
            position: relative;
            display: flex;
            justify-content: center;
            border-radius: 15px;
            box-shadow: 0 10px 25px 0 rgba(0, 0, 0, 0.075);
          }
          .ui-122-link {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 70px;
            height: 50px;
            border-radius: 8px;
            position: relative;
            z-index: 1;
            overflow: hidden;
            transform-origin: center left;
            transition: width 0.2s ease-in;
            text-decoration: none;
            color: inherit;
            border: 0;
            background: transparent;
            cursor: pointer;
            font: inherit;
          }
          .ui-122-link::before {
            position: absolute;
            z-index: -1;
            content: "";
            display: block;
            border-radius: 8px;
            width: 100%;
            height: 100%;
            top: 0;
            transform: translateX(100%);
            transition: transform 0.2s ease-in;
            transform-origin: center right;
            background-color: #eee;
          }
          .ui-122-link:hover,
          .ui-122-link:focus {
            outline: 0;
            width: 130px;
          }
          .ui-122-link:hover::before,
          .ui-122-link:focus::before,
          .ui-122-link:hover .ui-122-link-title,
          .ui-122-link:focus .ui-122-link-title {
            transform: translateX(0);
            opacity: 1;
          }
          .ui-122-link-icon {
            width: 28px;
            height: 28px;
            display: block;
            flex-shrink: 0;
            left: 18px;
            position: absolute;
          }
          .ui-122-link-icon svg {
            width: 28px;
            height: 28px;
          }
          .ui-122-link-title {
            transform: translateX(100%);
            transition: transform 0.2s ease-in, opacity 0.2s ease-in;
            transform-origin: center right;
            display: block;
            text-align: center;
            text-indent: 28px;
            width: 100%;
            opacity: 0;
          }
        `}</style>
        <div className="ui-122-menu">
          {[
            { title: 'Home', path: 'M4 12L12 5l8 7v8H6v-8z' },
            { title: 'Games', path: 'M7 15l8-8h4v4l-8 8-4-4z' },
            { title: 'Chat', path: 'M5 6h14v10H9l-4 4V6z' },
            { title: 'Search', path: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm5-1 4 4' },
            { title: 'Profile', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0' },
          ].map((item) => (
            <button key={item.title} className="ui-122-link" type="button">
              <span className="ui-122-link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d={item.path}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </span>
              <span className="ui-122-link-title">{item.title}</span>
            </button>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          link:hover expands width from 70px to 130px and slides the title into view
        </code>
      </div>
    ),
  },
];
