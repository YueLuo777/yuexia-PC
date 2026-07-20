import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart14: UiSample[] = [
  {
    id: 'UI-135',
    group: '手动上传',
    name: '玻璃滑块单选 Radio',
    usage:
      '来自用户本次上传的 React + styled-components 代码。适合计划等级、模式切换、三段式状态筛选这类需要更强视觉反馈的单选控件。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-950 px-6 py-8">
        <style>{`
          .ui-135-glass-radio-group {
            --bg: rgba(255, 255, 255, 0.06);
            --text: #e5e5e5;
            display: flex;
            position: relative;
            overflow: hidden;
            width: fit-content;
            border-radius: 1rem;
            background: var(--bg);
            backdrop-filter: blur(12px);
            box-shadow:
              inset 1px 1px 4px rgba(255, 255, 255, 0.2),
              inset -1px -1px 6px rgba(0, 0, 0, 0.3),
              0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .ui-135-glass-radio-group input {
            display: none;
          }
          .ui-135-glass-radio-group label {
            position: relative;
            z-index: 2;
            display: flex;
            min-width: 80px;
            flex: 1;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            padding: 0.8rem 1.6rem;
            color: var(--text);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: color 0.3s ease-in-out;
          }
          .ui-135-glass-radio-group label:hover,
          .ui-135-glass-radio-group input:checked + label {
            color: #ffffff;
          }
          .ui-135-glass-glider {
            position: absolute;
            top: 0;
            bottom: 0;
            z-index: 1;
            width: calc(100% / 3);
            border-radius: 1rem;
            transition:
              transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
              background 0.4s ease-in-out,
              box-shadow 0.4s ease-in-out;
          }
          #ui-135-silver:checked ~ .ui-135-glass-glider {
            transform: translateX(0%);
            background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
            box-shadow:
              0 0 18px rgba(192, 192, 192, 0.5),
              0 0 10px rgba(255, 255, 255, 0.4) inset;
          }
          #ui-135-gold:checked ~ .ui-135-glass-glider {
            transform: translateX(100%);
            background: linear-gradient(135deg, #ffd70055, #ffcc00);
            box-shadow:
              0 0 18px rgba(255, 215, 0, 0.5),
              0 0 10px rgba(255, 235, 150, 0.4) inset;
          }
          #ui-135-platinum:checked ~ .ui-135-glass-glider {
            transform: translateX(200%);
            background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
            box-shadow:
              0 0 18px rgba(160, 216, 255, 0.5),
              0 0 10px rgba(200, 240, 255, 0.4) inset;
          }
        `}</style>
        <div className="ui-135-glass-radio-group">
          <input type="radio" name="ui-135-plan" id="ui-135-silver" defaultChecked />
          <label htmlFor="ui-135-silver">Silver</label>
          <input type="radio" name="ui-135-plan" id="ui-135-gold" />
          <label htmlFor="ui-135-gold">Gold</label>
          <input type="radio" name="ui-135-plan" id="ui-135-platinum" />
          <label htmlFor="ui-135-platinum">Platinum</label>
          <div className="ui-135-glass-glider" />
        </div>
        <code className="block rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-5 text-slate-300">
          glass radio: hidden inputs + labels + animated glider for three-option selection
        </code>
      </div>
    ),
  },
  {
    id: 'UI-136',
    group: '手动上传',
    name: '软件标签页分段 Radio',
    usage:
      '来自用户本次上传的 React + styled-components 代码。这里先套成软件顶部工作区标签页测试：外层浅灰底，当前标签白底突出。',
    preview: (
      <div className="flex w-full flex-col items-center gap-4 py-5">
        <style>{`
          .ui-136-radio-inputs {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            width: min(100%, 520px);
            box-sizing: border-box;
            border-radius: 0.5rem;
            background-color: #eeeeee;
            padding: 0.25rem;
            font-size: 14px;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
          }
          .ui-136-radio {
            min-width: 0;
            flex: 1 1 0;
            text-align: center;
          }
          .ui-136-radio input {
            display: none;
          }
          .ui-136-name {
            display: flex;
            min-width: 0;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            border: 0;
            border-radius: 0.5rem;
            padding: 0.5rem 0.7rem;
            color: rgba(51, 65, 85, 1);
            transition: all 0.15s ease-in-out;
          }
          .ui-136-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .ui-136-close {
            display: grid;
            width: 1.25rem;
            height: 1.25rem;
            flex: 0 0 auto;
            place-items: center;
            border-radius: 0.375rem;
            color: #64748b;
          }
          .ui-136-radio input:checked + .ui-136-name {
            background-color: #ffffff;
            font-weight: 600;
            color: #0f172a;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
          }
          .ui-136-radio input:checked + .ui-136-name .ui-136-close,
          .ui-136-name:hover .ui-136-close {
            background: #f1f5f9;
            color: #334155;
          }
        `}</style>
        <div className="ui-136-radio-inputs">
          {['首页', '作品编辑器', '提炼剧情', '提示词管理'].map((tab, index) => (
            <label key={tab} className="ui-136-radio">
              <input type="radio" name="ui-136-tabs" defaultChecked={index === 1} />
              <span className="ui-136-name">
                <span className="ui-136-title">{tab}</span>
                {tab !== '首页' && (
                  <span className="ui-136-close" aria-hidden="true">
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          software tab test: same radio-inputs structure, adapted for workspace tabs with optional close icon
        </code>
      </div>
    ),
  },
  {
    id: 'UI-137',
    group: '手动上传',
    name: '玻璃特效作品操作矩阵',
    usage:
      '把 UI-135 的玻璃滑块特效融入作品卡片的 2x2 操作按钮里。用于测试“重命名 / 封面 / 导出 / 删除”这种四宫格胶囊操作区。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-5">
        <style>{`
          .ui-137-action-glass {
            --bg: rgba(255, 255, 255, 0.72);
            --text: #08aace;
            position: relative;
            display: grid;
            width: 282px;
            height: 112px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            overflow: hidden;
            border: 1px solid rgba(226, 232, 240, 0.95);
            border-radius: 22px;
            background: var(--bg);
            backdrop-filter: blur(12px);
            box-shadow:
              inset 1px 1px 4px rgba(255, 255, 255, 0.75),
              inset -1px -1px 6px rgba(15, 23, 42, 0.08),
              0 8px 20px rgba(15, 23, 42, 0.08);
          }
          .ui-137-action-glass input {
            display: none;
          }
          .ui-137-action-glass label {
            position: relative;
            z-index: 2;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-right: 1px solid rgba(226, 232, 240, 0.9);
            border-bottom: 1px solid rgba(226, 232, 240, 0.9);
            color: var(--text);
            font-size: 17px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
          }
          .ui-137-action-glass label:nth-of-type(2),
          .ui-137-action-glass label:nth-of-type(4) {
            border-right: 0;
          }
          .ui-137-action-glass label:nth-of-type(3),
          .ui-137-action-glass label:nth-of-type(4) {
            border-bottom: 0;
          }
          .ui-137-action-glass label:hover,
          .ui-137-action-glass input:checked + label {
            color: #ffffff;
            text-shadow: 0 1px 8px rgba(15, 23, 42, 0.18);
          }
          .ui-137-action-glass label.ui-137-danger {
            color: #ff3b3b;
          }
          .ui-137-action-glass input:checked + label.ui-137-danger,
          .ui-137-action-glass label.ui-137-danger:hover {
            color: #ffffff;
          }
          .ui-137-glider {
            position: absolute;
            z-index: 1;
            width: 50%;
            height: 50%;
            border-radius: 18px;
            transition:
              transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
              background 0.4s ease-in-out,
              box-shadow 0.4s ease-in-out;
          }
          #ui-137-rename:checked ~ .ui-137-glider {
            transform: translate(0%, 0%);
            background: linear-gradient(135deg, rgba(8, 170, 206, 0.35), #08aace);
            box-shadow:
              0 0 18px rgba(8, 170, 206, 0.38),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
          #ui-137-cover:checked ~ .ui-137-glider {
            transform: translate(100%, 0%);
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), #38bdf8);
            box-shadow:
              0 0 18px rgba(56, 189, 248, 0.38),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
          #ui-137-export:checked ~ .ui-137-glider {
            transform: translate(0%, 100%);
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.28), #22c55e);
            box-shadow:
              0 0 18px rgba(34, 197, 94, 0.34),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
          #ui-137-delete:checked ~ .ui-137-glider {
            transform: translate(100%, 100%);
            background: linear-gradient(135deg, rgba(255, 59, 59, 0.32), #ff4545);
            box-shadow:
              0 0 18px rgba(255, 69, 69, 0.42),
              0 0 10px rgba(255, 255, 255, 0.42) inset;
          }
        `}</style>
        <div className="ui-137-action-glass">
          <input type="radio" name="ui-137-actions" id="ui-137-rename" defaultChecked />
          <label htmlFor="ui-137-rename">重命名</label>
          <input type="radio" name="ui-137-actions" id="ui-137-cover" />
          <label htmlFor="ui-137-cover">封面</label>
          <input type="radio" name="ui-137-actions" id="ui-137-export" />
          <label htmlFor="ui-137-export">导出</label>
          <input type="radio" name="ui-137-actions" id="ui-137-delete" />
          <label htmlFor="ui-137-delete" className="ui-137-danger">
            删除
          </label>
          <div className="ui-137-glider" />
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          2x2 glass matrix: radio inputs + labels + glider, delete keeps red text until selected
        </code>
      </div>
    ),
  },
];
