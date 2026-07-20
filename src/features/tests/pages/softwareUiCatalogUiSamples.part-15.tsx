import { BookOpen, Check, Database, GripVertical, LayoutPanelLeft, Minus, Plus, Settings, X } from 'lucide-react';
import { FontSizeStepper } from '@/shared/ui/FontSizeStepper';
import type { ColorSample, FontSample, TechItem, UiSample } from './softwareUiCatalogTypes';
export const uiSamplesPart15: UiSample[] = [
  {
    id: 'UI-138',
    group: '手动上传',
    name: '原色玻璃作品操作矩阵',
    usage:
      'UI-137 的原始配色版本。滑块使用用户原代码里的银色、黄金、铂金配色，第四项沿用银白玻璃色，方便对比是否更接近原 UI。',
    preview: (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-950 px-6 py-8">
        <style>{`
          .ui-138-action-glass {
            --bg: rgba(255, 255, 255, 0.06);
            --text: #e5e5e5;
            position: relative;
            display: grid;
            width: 282px;
            height: 112px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(2, minmax(0, 1fr));
            overflow: hidden;
            border-radius: 1rem;
            background: var(--bg);
            backdrop-filter: blur(12px);
            box-shadow:
              inset 1px 1px 4px rgba(255, 255, 255, 0.2),
              inset -1px -1px 6px rgba(0, 0, 0, 0.3),
              0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .ui-138-action-glass input {
            display: none;
          }
          .ui-138-action-glass label {
            position: relative;
            z-index: 2;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-right: 1px solid rgba(255, 255, 255, 0.16);
            border-bottom: 1px solid rgba(255, 255, 255, 0.16);
            color: var(--text);
            font-size: 17px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: color 0.3s ease-in-out;
          }
          .ui-138-action-glass label:nth-of-type(2),
          .ui-138-action-glass label:nth-of-type(4) {
            border-right: 0;
          }
          .ui-138-action-glass label:nth-of-type(3),
          .ui-138-action-glass label:nth-of-type(4) {
            border-bottom: 0;
          }
          .ui-138-action-glass label:hover,
          .ui-138-action-glass input:checked + label {
            color: #ffffff;
          }
          .ui-138-glider {
            position: absolute;
            z-index: 1;
            width: 50%;
            height: 50%;
            border-radius: 1rem;
            transition:
              transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
              background 0.4s ease-in-out,
              box-shadow 0.4s ease-in-out;
          }
          #ui-138-rename:checked ~ .ui-138-glider {
            transform: translate(0%, 0%);
            background: linear-gradient(135deg, #c0c0c055, #e0e0e0);
            box-shadow:
              0 0 18px rgba(192, 192, 192, 0.5),
              0 0 10px rgba(255, 255, 255, 0.4) inset;
          }
          #ui-138-cover:checked ~ .ui-138-glider {
            transform: translate(100%, 0%);
            background: linear-gradient(135deg, #ffd70055, #ffcc00);
            box-shadow:
              0 0 18px rgba(255, 215, 0, 0.5),
              0 0 10px rgba(255, 235, 150, 0.4) inset;
          }
          #ui-138-export:checked ~ .ui-138-glider {
            transform: translate(0%, 100%);
            background: linear-gradient(135deg, #d0e7ff55, #a0d8ff);
            box-shadow:
              0 0 18px rgba(160, 216, 255, 0.5),
              0 0 10px rgba(200, 240, 255, 0.4) inset;
          }
          #ui-138-delete:checked ~ .ui-138-glider {
            transform: translate(100%, 100%);
            background: linear-gradient(135deg, #ffffff44, #f5f5f5);
            box-shadow:
              0 0 18px rgba(255, 255, 255, 0.35),
              0 0 10px rgba(255, 255, 255, 0.4) inset;
          }
        `}</style>
        <div className="ui-138-action-glass">
          <input type="radio" name="ui-138-actions" id="ui-138-rename" defaultChecked />
          <label htmlFor="ui-138-rename">重命名</label>
          <input type="radio" name="ui-138-actions" id="ui-138-cover" />
          <label htmlFor="ui-138-cover">封面</label>
          <input type="radio" name="ui-138-actions" id="ui-138-export" />
          <label htmlFor="ui-138-export">导出</label>
          <input type="radio" name="ui-138-actions" id="ui-138-delete" />
          <label htmlFor="ui-138-delete">删除</label>
          <div className="ui-138-glider" />
        </div>
        <code className="block rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-5 text-slate-300">
          original color test: silver / gold / platinum / white glass
        </code>
      </div>
    ),
  },
  {
    id: 'UI-139',
    group: '作品',
    name: '作品卡片按钮方案 B',
    usage:
      '作品卡片底部 3 列 x 2 行固定按钮，最多显示 6 个常用入口；剩余操作集中到“更多”白底弹层，适合以后扩展到 9 个按钮。',
    preview: (
      <div className="w-[320px] rounded-[28px] border border-slate-100 bg-white p-4 shadow-xl">
        <div className="flex h-[190px] items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-50 via-white to-cyan-50">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-2xl font-black text-[#08AACE] shadow-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="mt-3 text-sm font-black text-slate-700">封面预览</div>
          </div>
        </div>
        <div className="px-1 pb-1 pt-4">
          <h3 className="truncate text-base font-black text-slate-900">月落长歌</h3>
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>128000 字</span>
            <span>2026-05-27</span>
          </div>
          <div className="relative mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {['继续阅读', '作品信息', '打开检查', '重命名', '封面', '更多'].map((action, index) => (
                <button
                  key={action}
                  type="button"
                  className={`h-9 min-w-0 rounded-xl px-2 text-xs font-black transition-all ${
                    index === 0
                      ? 'bg-[#08AACE] text-white shadow-[0_8px_18px_rgba(8,170,206,0.25)]'
                      : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-[#08AACE]'
                  }`}
                >
                  <span className="block truncate">{action}</span>
                </button>
              ))}
            </div>
            <div className="absolute right-1.5 top-[calc(100%+8px)] z-20 w-[150px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl">
              {['导出 txt', '关联小说', '复制书名'].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-black text-slate-600 hover:bg-sky-50 hover:text-[#08AACE]"
                >
                  {action}
                </button>
              ))}
              <button
                type="button"
                className="flex h-9 w-full items-center rounded-xl px-3 text-left text-xs font-black text-red-500 hover:bg-red-50"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-140',
    group: '输入框',
    name: '固定顶标圆角输入框',
    usage: '设定名、角色名、模块名等短字段。标签固定压在上边框并用白底切出缺口，输入区保持干净。',
    preview: (
      <div className="flex flex-col items-center gap-4 py-6">
        <style>{`
          .ui-140-field {
            position: relative;
            width: 220px;
            height: 74px;
          }
          .ui-140-field input {
            width: 100%;
            height: 66px;
            box-sizing: border-box;
            border: 2px solid #111827;
            border-radius: 23px;
            background: #ffffff;
            padding: 0 1.25rem;
            font-size: 16px;
            color: #111827;
            outline: none;
          }
          .ui-140-field label {
            position: absolute;
            left: 22px;
            top: -1px;
            transform: translateY(-50%);
            background: #ffffff;
            padding: 0 0.35rem;
            color: #111827;
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
            pointer-events: none;
          }
        `}</style>
        <div className="ui-140-field">
          <input readOnly aria-label="设定名" />
          <label>设定名</label>
        </div>
        <code className="block rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
          fixed label cuts a small white gap into the dark rounded border
        </code>
      </div>
    ),
  },
  {
    id: 'UI-141',
    group: '输入框',
    name: '边框内嵌工具文本框',
    usage: '设定预览、角色背景、角色状态、脑洞预览、脑洞输出框。左上角固定标签，左下角放字号，右下角放字数统计。',
    preview: (
      <div className="flex w-full justify-center py-6">
        <style>{`
          .ui-141-field-wrap {
            position: relative;
            width: min(560px, 100%);
            height: 260px;
          }
          .ui-141-field {
            position: relative;
            width: 100%;
            height: 100%;
          }
          .ui-141-field textarea {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            resize: none;
            border: 2px solid #111827;
            border-radius: 23px;
            background: #ffffff;
            padding: 1.35rem 1.25rem 3rem;
            font-size: 16px;
            line-height: 1.75;
            color: #111827;
            outline: none;
          }
          .ui-141-field label {
            position: absolute;
            left: 22px;
            top: 0;
            transform: translateY(-50%);
            background: #ffffff;
            padding: 0 0.35rem;
            color: #111827;
            font-size: 16px;
            font-weight: 500;
            line-height: 20px;
            pointer-events: none;
          }
          .ui-141-tool {
            position: absolute;
            left: 38px;
            bottom: 0;
            z-index: 2;
            transform: translateY(50%);
            background: #ffffff;
          }
          .ui-141-count {
            position: absolute;
            right: 20px;
            bottom: 0;
            z-index: 2;
            transform: translateY(50%);
            background: #ffffff;
            padding: 0 7px;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 800;
            line-height: 20px;
          }
        `}</style>
        <div className="ui-141-field-wrap">
          <div className="ui-141-field">
            <textarea
              readOnly
              value="这里是带边框工具槽的长文本区域。字号放在左下角，字数统计放在右下角，主内容区域保持干净。"
            />
            <label>设定预览</label>
            <span className="ui-141-count">46 字</span>
          </div>
          <div className="ui-141-tool">
            <FontSizeStepper value={16} min={12} max={28} onChange={() => undefined} ariaLabel="边框内嵌字号" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-142',
    group: '选择框',
    name: '下拉内嵌管理选择框',
    usage: '模型选择、提示词选择等需要在同一行保留“管理”入口的下拉框。右侧管理按钮嵌入边框内部，减少额外按钮挤占空间。',
    preview: (
      <div className="flex justify-center py-6">
        <div className="w-[320px]">
          <div className="relative pt-2">
            <span className="xy-border-embedded-transparent-backplate absolute left-6 top-0 z-10 text-sm font-black leading-none text-slate-700">
              模型
            </span>
            <div className="flex h-14 overflow-hidden rounded-[24px] border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
              <button type="button" className="min-w-0 flex-1 px-5 pt-1 text-left text-lg font-black text-slate-950">
                <span className="block truncate">DS-v4-flash</span>
              </button>
              <button type="button" className="grid w-11 shrink-0 place-items-center text-slate-700">
                ⌄
              </button>
              <button
                type="button"
                className="w-14 shrink-0 border-l border-[#08AACE]/40 bg-[#EAF9FD] text-sm font-black text-[#078fb0]"
              >
                管理
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'UI-143',
    group: '输入框',
    name: 'AI 输入框右侧图标按钮',
    usage:
      'AI 用户输入框的发送、停止等贴边动作按钮。图标按钮并入输入框右侧，按钮之间用细分割线区分，避免输入框右边另起一组按钮。',
    preview: (
      <div className="flex justify-center py-6">
        <div className="flex h-14 w-[420px] max-w-full overflow-hidden rounded-2xl border-2 border-[#08AACE] bg-white shadow-[0_8px_18px_rgba(8,170,206,0.08)]">
          <div className="flex min-w-0 flex-1 items-center px-4 text-sm font-bold text-slate-400">请输入要求</div>
          <button
            type="button"
            className="grid w-12 shrink-0 place-items-center border-l border-[#08AACE]/40 text-[#08AACE]"
          >
            <span className="text-lg leading-none">↑</span>
          </button>
          <button
            type="button"
            className="grid w-12 shrink-0 place-items-center border-l border-red-200 bg-red-500 text-white"
          >
            <span className="h-3 w-3 rounded-sm bg-current" />
          </button>
        </div>
      </div>
    ),
  },
];
