import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart7: UiSample[] = [
  {
    id: 'UI-109',
    group: '手动上传',
    name: '彩色 SVG 加载动画 Loader',
    usage:
      '来自用户上传的 React + styled-components 代码。适合 AI 思考、生成中、导入中等等待状态；三段 SVG 线条循环描边，中间圆形会旋转并切换渐变。',
    preview: (
      <div className="flex flex-col items-center gap-4">
        <style>{`
          .ui-109-absolute {
            position: absolute;
          }
          .ui-109-inline-block {
            display: inline-block;
          }
          .ui-109-loader {
            display: flex;
            margin: 0.25em 0;
          }
          .ui-109-w-2 {
            width: 0.5em;
          }
          .ui-109-dash {
            animation: ui-109-dash-array 2s ease-in-out infinite,
              ui-109-dash-offset 2s linear infinite;
          }
          .ui-109-spin {
            animation: ui-109-spin-dash-array 2s ease-in-out infinite,
              ui-109-spin 8s ease-in-out infinite,
              ui-109-dash-offset 2s linear infinite;
            transform-origin: center;
          }
          @keyframes ui-109-dash-array {
            0% { stroke-dasharray: 0 1 359 0; }
            50% { stroke-dasharray: 0 359 1 0; }
            100% { stroke-dasharray: 359 1 0 0; }
          }
          @keyframes ui-109-spin-dash-array {
            0% { stroke-dasharray: 270 90; }
            50% { stroke-dasharray: 0 360; }
            100% { stroke-dasharray: 270 90; }
          }
          @keyframes ui-109-dash-offset {
            0% { stroke-dashoffset: 365; }
            100% { stroke-dashoffset: 5; }
          }
          @keyframes ui-109-spin {
            0% { rotate: 0deg; }
            12.5%, 25% { rotate: 270deg; }
            37.5%, 50% { rotate: 540deg; }
            62.5%, 75% { rotate: 810deg; }
            87.5%, 100% { rotate: 1080deg; }
          }
        `}</style>
        <div className="ui-109-loader">
          <svg height={0} width={0} viewBox="0 0 64 64" className="ui-109-absolute" aria-hidden="true">
            <defs xmlns="http://www.w3.org/2000/svg">
              <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="ui-109-b">
                <stop stopColor="#973BED" />
                <stop stopColor="#007CFF" offset={1} />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2={0} x2={0} y1={64} x1={0} id="ui-109-c">
                <stop stopColor="#FFC800" />
                <stop stopColor="#F0F" offset={1} />
                <animateTransform
                  repeatCount="indefinite"
                  keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
                  keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                  dur="8s"
                  values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
                  type="rotate"
                  attributeName="gradientTransform"
                />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" y2={2} x2={0} y1={62} x1={0} id="ui-109-d">
                <stop stopColor="#00E0ED" />
                <stop stopColor="#00DA72" offset={1} />
              </linearGradient>
            </defs>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 64 64"
            height={64}
            width={64}
            className="ui-109-inline-block"
          >
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={8}
              stroke="url(#ui-109-b)"
              d="M 54.722656,3.9726563 A 2.0002,2.0002 0 0 0 54.941406,4 h 5.007813 C 58.955121,17.046124 49.099667,27.677057 36.121094,29.580078 a 2.0002,2.0002 0 0 0 -1.708985,1.978516 V 60 H 29.587891 V 31.558594 A 2.0002,2.0002 0 0 0 27.878906,29.580078 C 14.900333,27.677057 5.0448787,17.046124 4.0507812,4 H 9.28125 c 1.231666,11.63657 10.984383,20.554048 22.6875,20.734375 a 2.0002,2.0002 0 0 0 0.02344,0 c 11.806958,0.04283 21.70649,-9.003371 22.730469,-20.7617187 z"
              className="ui-109-dash"
              pathLength={360}
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 64 64"
            height={64}
            width={64}
            className="ui-109-inline-block"
          >
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={10}
              stroke="url(#ui-109-c)"
              d="M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54"
              className="ui-109-spin"
              pathLength={360}
            />
          </svg>
          <div className="ui-109-w-2" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 64 64"
            height={64}
            width={64}
            className="ui-109-inline-block"
          >
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={8}
              stroke="url(#ui-109-d)"
              d="M 4,4 h 4.6230469 v 25.919922 c -0.00276,11.916203 9.8364941,21.550422 21.7500001,21.296875 11.616666,-0.240651 21.014356,-9.63894 21.253906,-21.25586 a 2.0002,2.0002 0 0 0 0,-0.04102 V 4 H 56.25 v 25.919922 c 0,14.33873 -11.581192,25.919922 -25.919922,25.919922 a 2.0002,2.0002 0 0 0 -0.0293,0 C 15.812309,56.052941 3.998433,44.409961 4,29.919922 Z"
              className="ui-109-dash"
              pathLength={360}
            />
          </svg>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          SVG paths animate stroke-dasharray + stroke-dashoffset; center circle also rotates
        </code>
      </div>
    ),
  },
  {
    id: 'UI-110',
    group: '手动上传',
    name: '浮动标签输入框 Input',
    usage:
      '来自用户上传的 React + styled-components 代码。适合姓名、标题、搜索词等短文本输入；聚焦或已有内容时，标签缩小并浮到边框上方。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-6 py-8">
        <style>{`
          .ui-110-input-group {
            position: relative;
          }
          .ui-110-input {
            border: solid 1.5px #9e9e9e;
            border-radius: 1rem;
            background: #ffffff;
            padding: 1rem;
            font-size: 1rem;
            color: #111827;
            transition: border 150ms cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ui-110-user-label {
            position: absolute;
            left: 15px;
            color: #111827;
            pointer-events: none;
            transform: translateY(1rem);
            transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ui-110-input:focus,
          .ui-110-input:valid {
            outline: none;
            border: 1.5px solid #111827;
          }
          .ui-110-input:focus ~ .ui-110-user-label,
          .ui-110-input:valid ~ .ui-110-user-label {
            transform: translateY(-50%) scale(0.8);
            background-color: #ffffff;
            padding: 0 .2em;
            color: #111827;
          }
        `}</style>
        <div className="ui-110-input-group">
          <input
            required
            type="text"
            name="ui-110-text"
            autoComplete="off"
            className="ui-110-input"
            aria-label="First Name"
          />
          <label className="ui-110-user-label">First Name</label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          input:focus or input:valid keeps the white field and dark label visible
        </code>
      </div>
    ),
  },
  {
    id: 'UI-111',
    group: '手动上传',
    name: '立体拨动开关 Switch',
    usage:
      '来自用户上传的 React + styled-components 代码。适合黑白主题、开关设置、启用状态；hover 时开关会有 3D 倾斜，选中后圆形拨片滑到右侧。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-111-label {
            height: 60px;
            width: 120px;
            background-color: #ffffff;
            border-radius: 30px;
            box-shadow:
              inset 0 0 5px 4px rgba(255, 255, 255, 1),
              inset 0 0 20px 1px rgba(0, 0, 0, 0.488),
              10px 20px 30px rgba(0, 0, 0, 0.096),
              inset 0 0 0 3px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            cursor: pointer;
            position: relative;
            transition: transform 0.4s;
          }
          .ui-111-label:hover {
            transform: perspective(100px) rotateX(5deg) rotateY(-5deg);
          }
          .ui-111-checkbox:checked ~ .ui-111-label:hover {
            transform: perspective(100px) rotateX(-5deg) rotateY(5deg);
          }
          .ui-111-checkbox {
            display: none;
          }
          .ui-111-checkbox:checked ~ .ui-111-label::before {
            left: 70px;
            background-color: #000000;
            background-image: linear-gradient(315deg, #000000 0%, #414141 70%);
            transition: 0.4s;
          }
          .ui-111-label::before {
            position: absolute;
            content: "";
            height: 40px;
            width: 40px;
            border-radius: 50%;
            background-color: #000000;
            background-image: linear-gradient(130deg, #757272 10%, #ffffff 11%, #726f6f 62%);
            left: 10px;
            box-shadow: 0 2px 1px rgba(0, 0, 0, 0.3), 10px 10px 10px rgba(0, 0, 0, 0.3);
            transition: 0.4s;
          }
        `}</style>
        <div>
          <input type="checkbox" name="ui-111-checkbox" id="ui-111-checkbox" className="ui-111-checkbox" />
          <label htmlFor="ui-111-checkbox" className="ui-111-label" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          checkbox:checked ~ label moves the knob right; label:hover applies a perspective tilt
        </code>
      </div>
    ),
  },
  {
    id: 'UI-112',
    group: '手动上传',
    name: '展开箭头按钮 Button',
    usage:
      '来自用户上传的 React + styled-components 代码。适合“了解更多”“下一步”“查看详情”这类强调操作；hover 时左侧圆形背景展开为整条按钮，箭头右移，文字变白。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-3">
        <style>{`
          .ui-112-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            cursor: pointer;
            outline: none;
            border: 0;
            vertical-align: middle;
            text-decoration: none;
            background: transparent;
            padding: 0 1.25rem 0 4rem;
            font-size: inherit;
            font-family: inherit;
            width: 12rem;
            height: 3rem;
            border-radius: 999px;
            color: #282936;
          }
          .ui-112-button::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            z-index: 0;
            width: 3rem;
            height: 3rem;
            border-radius: 999px;
            background: #282936;
            transform: translateY(-50%);
            transition: width 0.45s cubic-bezier(0.65, 0, 0.076, 1);
          }
          .ui-112-circle {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            position: absolute;
            left: 0;
            top: 0;
            z-index: 2;
            display: block;
            margin: 0;
            width: 3rem;
            height: 3rem;
            border-radius: 1.625rem;
          }
          .ui-112-icon {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            position: absolute;
            top: 0;
            bottom: 0;
            margin: auto;
            background: #fff;
          }
          .ui-112-arrow {
            left: 0.625rem;
            width: 1.125rem;
            height: 0.125rem;
            background: none;
          }
          .ui-112-arrow::before {
            position: absolute;
            content: "";
            top: -0.29rem;
            right: 0.0625rem;
            width: 0.625rem;
            height: 0.625rem;
            border-top: 0.125rem solid #fff;
            border-right: 0.125rem solid #fff;
            transform: rotate(45deg);
          }
          .ui-112-button-text {
            transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
            position: relative;
            z-index: 1;
            padding: 0;
            margin: 0;
            color: currentColor;
            font-weight: 700;
            line-height: 1;
            text-align: center;
            text-transform: uppercase;
          }
          .ui-112-button:hover::before {
            width: 100%;
          }
          .ui-112-button:hover .ui-112-arrow {
            background: #fff;
            transform: translate(0.375rem, 0);
          }
          .ui-112-button:hover .ui-112-button-text {
            color: #fff;
          }
        `}</style>
        <button className="ui-112-button" type="button">
          <span className="ui-112-circle" aria-hidden="true">
            <span className="ui-112-icon ui-112-arrow" />
          </span>
          <span className="ui-112-button-text">Learn More</span>
        </button>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          button:hover expands the circle to 100%, moves the arrow, and turns the label white
        </code>
      </div>
    ),
  },
];
