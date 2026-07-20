import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart9: UiSample[] = [
  {
    id: 'UI-116',
    group: '手动上传',
    name: '星光能量开关 Switch',
    usage:
      '来自用户上传的 React + styled-components 代码。适合高级模式、AI 增强、启动引擎等强调型开关；深色胶囊轨道内有星光粒子，选中后按钮滑到右侧并变成蓝色能量态。',
    preview: (
      <div className="flex flex-col items-center gap-5 py-5">
        <style>{`
          .ui-116-toggle-cont {
            --primary: #54a8fc;
            --light: #d9d9d9;
            --dark: #121212;
            --gray: #414344;
            --second: rgba(84, 168, 252, 0.22);
            position: relative;
            z-index: 10;
            width: fit-content;
            height: 50px;
            border-radius: 9999px;
          }
          .ui-116-toggle-input {
            display: none;
          }
          .ui-116-toggle-label {
            --gap: 5px;
            --knob-width: 50px;
            cursor: pointer;
            position: relative;
            display: inline-block;
            padding: 0.5rem;
            width: calc((var(--knob-width) + var(--gap)) * 2);
            height: 100%;
            background-color: var(--dark);
            border: 1px solid #777777;
            border-bottom: 0;
            border-radius: 9999px;
            box-sizing: content-box;
            transition: all 0.3s ease-in-out;
          }
          .ui-116-toggle-label::before {
            content: "";
            position: absolute;
            z-index: -10;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100% + 1.5rem);
            height: calc(100% + 1.5rem);
            background-color: var(--gray);
            border: 1px solid #777777;
            border-bottom: 0;
            border-radius: 9999px;
            transition: all 0.3s ease-in-out;
          }
          .ui-116-toggle-label::after {
            content: "";
            position: absolute;
            z-index: -10;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle at 50% -100%, rgb(58, 155, 252) 0%, rgba(12, 12, 12, 1) 80%);
            border-radius: 9999px;
          }
          .ui-116-cont-icon {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: var(--knob-width);
            height: 50px;
            overflow: clip;
            background-image: radial-gradient(circle at 50% 0%, #666666 0%, var(--gray) 100%);
            border: 1px solid #aaaaaa;
            border-bottom: 0;
            border-radius: 9999px;
            box-shadow: inset 0 -0.15rem 0.15rem var(--primary), inset 0 0 0.5rem 0.75rem var(--second);
            transition: transform 0.3s ease-in-out, background-image 0.3s ease-in-out, border 0.3s ease-in-out;
          }
          .ui-116-sparkle {
            position: absolute;
            top: 50%;
            left: 50%;
            display: block;
            width: calc(var(--sparkle-width) * 1px);
            aspect-ratio: 1;
            background-color: var(--light);
            border-radius: 50%;
            transform-origin: 50% 50%;
            rotate: calc(1deg * var(--sparkle-deg));
            transform: translate(-50%, -50%);
            animation: ui-116-sparkle calc(100s / var(--sparkle-duration)) linear infinite;
          }
          .ui-116-s1 { --sparkle-width: 2; --sparkle-deg: 25; --sparkle-duration: 11; }
          .ui-116-s2 { --sparkle-width: 1; --sparkle-deg: 100; --sparkle-duration: 18; }
          .ui-116-s3 { --sparkle-width: 1; --sparkle-deg: 280; --sparkle-duration: 5; }
          .ui-116-s4 { --sparkle-width: 2; --sparkle-deg: 200; --sparkle-duration: 3; }
          .ui-116-s5 { --sparkle-width: 2; --sparkle-deg: 30; --sparkle-duration: 20; }
          .ui-116-s6 { --sparkle-width: 2; --sparkle-deg: 300; --sparkle-duration: 9; }
          .ui-116-s7 { --sparkle-width: 1; --sparkle-deg: 250; --sparkle-duration: 4; }
          .ui-116-s8 { --sparkle-width: 2; --sparkle-deg: 210; --sparkle-duration: 8; }
          .ui-116-s9 { --sparkle-width: 2; --sparkle-deg: 100; --sparkle-duration: 9; }
          .ui-116-s10 { --sparkle-width: 1; --sparkle-deg: 15; --sparkle-duration: 13; }
          .ui-116-s11 { --sparkle-width: 1; --sparkle-deg: 75; --sparkle-duration: 18; }
          .ui-116-s12 { --sparkle-width: 2; --sparkle-deg: 65; --sparkle-duration: 6; }
          .ui-116-s13 { --sparkle-width: 2; --sparkle-deg: 50; --sparkle-duration: 7; }
          .ui-116-s14 { --sparkle-width: 1; --sparkle-deg: 320; --sparkle-duration: 5; }
          .ui-116-s15 { --sparkle-width: 1; --sparkle-deg: 220; --sparkle-duration: 5; }
          .ui-116-s16 { --sparkle-width: 1; --sparkle-deg: 215; --sparkle-duration: 2; }
          .ui-116-s17 { --sparkle-width: 2; --sparkle-deg: 135; --sparkle-duration: 9; }
          .ui-116-s18 { --sparkle-width: 2; --sparkle-deg: 45; --sparkle-duration: 4; }
          .ui-116-s19 { --sparkle-width: 1; --sparkle-deg: 78; --sparkle-duration: 16; }
          .ui-116-s20 { --sparkle-width: 1; --sparkle-deg: 89; --sparkle-duration: 19; }
          .ui-116-s21 { --sparkle-width: 2; --sparkle-deg: 65; --sparkle-duration: 14; }
          .ui-116-s22 { --sparkle-width: 2; --sparkle-deg: 97; --sparkle-duration: 1; }
          .ui-116-s23 { --sparkle-width: 1; --sparkle-deg: 174; --sparkle-duration: 10; }
          .ui-116-s24 { --sparkle-width: 1; --sparkle-deg: 236; --sparkle-duration: 5; }
          .ui-116-icon {
            width: 1.1rem;
            fill: var(--light);
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label {
            background-color: #41434400;
            border: 1px solid #3d6970;
            border-bottom: 0;
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label::before {
            box-shadow: 0 1rem 2.5rem -2rem #0080ff;
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label .ui-116-cont-icon {
            overflow: visible;
            background-image: radial-gradient(circle at 50% 0%, #045ab1 0%, var(--primary) 100%);
            border: 1px solid var(--primary);
            border-bottom: 0;
            transform: translateX(calc((var(--gap) * 2) + 100%)) rotate(-225deg);
          }
          .ui-116-toggle-input:checked + .ui-116-toggle-label .ui-116-sparkle {
            z-index: -10;
            width: calc(var(--sparkle-width) * 1.5px);
            background-color: #acacac;
          }
          @keyframes ui-116-sparkle {
            to {
              width: calc(var(--sparkle-width) * 0.5px);
              transform: translate(2000%, -50%);
            }
          }
        `}</style>
        <div className="ui-116-toggle-cont">
          <input className="ui-116-toggle-input" id="ui-116-toggle" name="ui-116-toggle" type="checkbox" />
          <label className="ui-116-toggle-label" htmlFor="ui-116-toggle">
            <div className="ui-116-cont-icon">
              {Array.from({ length: 24 }, (_, index) => (
                <span key={index} className={`ui-116-sparkle ui-116-s${index + 1}`} />
              ))}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 30 30"
                className="ui-116-icon"
                aria-hidden="true"
              >
                <path d="M0.96233 28.61C1.36043 29.0081 1.96007 29.1255 2.47555 28.8971L10.4256 25.3552C13.2236 24.11 16.4254 24.1425 19.2107 25.4401L27.4152 29.2747C27.476 29.3044 27.5418 29.3023 27.6047 29.32C27.6563 29.3348 27.7079 29.3497 27.761 29.3574C27.843 29.3687 27.9194 29.3758 28 29.3688C28.1273 29.3617 28.2531 29.3405 28.3726 29.2945C28.4447 29.262 28.5162 29.2287 28.5749 29.1842C28.6399 29.1446 28.6993 29.0994 28.7509 29.0477L28.9008 28.8582C28.9468 28.7995 28.9793 28.7274 29.0112 28.656C29.0599 28.5322 29.0811 28.4036 29.0882 28.2734C29.0939 28.1957 29.0868 28.1207 29.0769 28.0415C29.0705 27.9955 29.0585 27.9524 29.0472 27.9072C29.0295 27.8343 29.0302 27.7601 28.9984 27.6901L25.1638 19.4855C23.8592 16.7073 23.8273 13.5048 25.0726 10.7068L28.6145 2.75679C28.8429 2.24131 28.7318 1.63531 28.3337 1.2372C27.9165 0.820011 27.271 0.721743 26.7491 0.9961L19.8357 4.59596C16.8418 6.15442 13.2879 6.18696 10.2615 4.70062L1.80308 0.520214C1.7055 0.474959 1.60722 0.441742 1.50964 0.421943C1.44459 0.409215 1.37882 0.395769 1.3074 0.402133C1.14406 0.395769 0.981436 0.428275 0.818095 0.499692C0.77284 0.519491 0.719805 0.545671 0.67455 0.578198C0.596061 0.617088 0.524653 0.675786 0.4596 0.74084C0.394546 0.805894 0.335843 0.877306 0.296245 0.956502C0.263718 1.00176 0.237561 1.05477 0.217762 1.10003C0.152708 1.24286 0.126545 1.40058 0.120181 1.54978C0.120181 1.61483 0.126527 1.6735 0.132891 1.73219C0.15269 1.85664 0.178881 1.97332 0.237571 2.08434L4.41798 10.5427C5.91139 13.5621 5.8725 17.1238 4.3204 20.1099L0.720514 27.0233C0.440499 27.5536 0.545137 28.1928 0.96233 28.61Z" />
              </svg>
            </div>
          </label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked moves the glowing icon right and changes it from gray to blue
        </code>
      </div>
    ),
  },
  {
    id: 'UI-117',
    group: '手动上传',
    name: '左滑填充按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合普通确认、提交、继续等按钮；hover 时黑色背景从左向右填满，文字从深色变浅色。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-117-button {
            padding: 15px 25px;
            border: unset;
            border-radius: 15px;
            color: #212121;
            z-index: 1;
            background: #e8e8e8;
            position: relative;
            font-weight: 1000;
            font-size: 17px;
            box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
            transition: all 250ms;
            overflow: hidden;
            cursor: pointer;
          }
          .ui-117-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 0;
            border-radius: 15px;
            background-color: #212121;
            z-index: -1;
            box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
            transition: all 250ms;
          }
          .ui-117-button:hover {
            color: #e8e8e8;
          }
          .ui-117-button:hover::before {
            width: 100%;
          }
        `}</style>
        <button className="ui-117-button" type="button">
          Click me!
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover expands ::before from width 0 to 100% and flips the text color
        </code>
      </div>
    ),
  },
  {
    id: 'UI-118',
    group: '手动上传',
    name: '社交图标九宫格 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合社交分享、外链入口、平台选择；初始显示渐变背景和 HOVER 文案，hover 后九宫格卡片散开并显示各平台图标。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-4">
        <style>{`
          .ui-118-main {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            width: 14em;
            align-items: center;
            justify-content: center;
          }
          .ui-118-main-back {
            position: absolute;
            border-radius: 10px;
            transform: rotate(90deg);
            width: 11em;
            height: 11em;
            background: linear-gradient(270deg, #03a9f4, #cc39a4, #ffb5d2);
            z-index: -2;
            box-shadow: inset 0px 0px 180px 5px #ffffff;
            transition: opacity 0.4s ease-in-out;
          }
          .ui-118-card {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.596);
            backdrop-filter: blur(5px);
            border: 1px solid transparent;
            color: transparent;
            font-size: 12px;
            font-weight: 900;
            transition: 0.4s ease-in-out, 0.2s background-color ease-in-out;
          }
          .ui-118-card:nth-child(1) { border-top-left-radius: 10px; }
          .ui-118-card:nth-child(3) { border-top-right-radius: 10px; }
          .ui-118-card:nth-child(7) { border-bottom-left-radius: 10px; }
          .ui-118-card:nth-child(9) { border-bottom-right-radius: 10px; }
          .ui-118-text {
            position: absolute;
            font-size: 0.7em;
            transition: 0.4s ease-in-out;
            color: black;
            text-align: center;
            font-weight: bold;
            letter-spacing: 0.33em;
            z-index: 3;
          }
          .ui-118-main:hover {
            cursor: pointer;
          }
          .ui-118-main:hover .ui-118-main-back {
            opacity: 0;
          }
          .ui-118-main:hover .ui-118-card {
            margin: 0.2em;
            border-radius: 10px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.2);
            color: #111827;
          }
          .ui-118-main:hover .ui-118-text {
            opacity: 0;
            z-index: -3;
          }
          .ui-118-card:nth-child(1):hover { background-color: #cc39a4; color: white; }
          .ui-118-card:nth-child(2):hover { background-color: #03a9f4; color: white; }
          .ui-118-card:nth-child(3):hover { background-color: #ffb5d2; color: white; }
          .ui-118-card:nth-child(4):hover { background-color: #1e1f26; color: white; }
          .ui-118-card:nth-child(5):hover {
            background-image: linear-gradient(#bf66ff, #6248ff, #00ddeb);
            color: white;
          }
          .ui-118-card:nth-child(6):hover { background-color: #8c9eff; color: white; }
          .ui-118-card:nth-child(7):hover { background-color: black; color: white; }
          .ui-118-card:nth-child(8):hover { background-color: #29b6f6; color: white; }
          .ui-118-card:nth-child(9):hover { background-color: rgb(255, 69, 0); color: white; }
        `}</style>
        <div className="ui-118-main">
          {['IG', 'X', 'DR', 'CP', 'UI', 'DC', 'GH', 'TG', 'RD'].map((item) => (
            <div key={item} className="ui-118-card">
              {item}
            </div>
          ))}
          <p className="ui-118-text">
            HOVER
            <br />
            <br />
            FOR
            <br />
            <br />
            SOCIAL
          </p>
          <div className="ui-118-main-back" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          main:hover reveals the 3x3 social cards; each card has its own hover color
        </code>
      </div>
    ),
  },
];
