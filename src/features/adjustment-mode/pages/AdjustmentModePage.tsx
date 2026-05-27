import { useEffect, useRef, useState } from 'react';
import { Download, Edit3, Grid3X3, MousePointer2, Palette, RotateCcw, Save, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  ADJUSTMENT_MODE_UPDATED_EVENT,
  clearAdjustmentHistoryEntries,
  isAdjustmentModeEnabled,
  makeAdjustmentExportPackage,
  parseAdjustmentCustomButtonsImportPackage,
  parseAdjustmentImportPackage,
  readAdjustmentCustomButtons,
  readAdjustmentHistoryEntries,
  readAdjustmentRules,
  restoreAdjustmentHistoryEntry,
  saveAdjustmentCustomButtons,
  saveAdjustmentRules,
  setAdjustmentModeEnabled,
  type AdjustmentCustomButton,
  type AdjustmentHistoryEntry,
  type AdjustmentRule,
} from '@/shared/adjustment-mode/adjustmentModeStore';
import {
  readTextEditMode,
  readTextOverrides,
  setTextEditMode,
  TEXT_EDIT_MODE_EVENT,
  TEXT_OVERRIDE_UPDATED_EVENT,
} from '@/shared/text-overrides/textOverrideStore';

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatHistoryTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function AdjustmentModePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rules, setRules] = useState<AdjustmentRule[]>(readAdjustmentRules);
  const [history, setHistory] = useState<AdjustmentHistoryEntry[]>(readAdjustmentHistoryEntries);
  const [customButtons, setCustomButtons] = useState<AdjustmentCustomButton[]>(readAdjustmentCustomButtons);
  const [textEditMode, setTextEditModeState] = useState(readTextEditMode);
  const [textOverrideCount, setTextOverrideCount] = useState(() => readTextOverrides().filter((item) => item.enabled).length);
  const [advancedMode, setAdvancedMode] = useState(isAdjustmentModeEnabled);
  const [message, setMessage] = useState('请选择一种调整方式。');

  useEffect(() => {
    const sync = () => {
      setRules(readAdjustmentRules());
      setHistory(readAdjustmentHistoryEntries());
      setCustomButtons(readAdjustmentCustomButtons());
      setAdvancedMode(isAdjustmentModeEnabled());
    };
    window.addEventListener(ADJUSTMENT_MODE_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ADJUSTMENT_MODE_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    const syncTextMode = () => {
      setTextEditModeState(readTextEditMode());
      setTextOverrideCount(readTextOverrides().filter((item) => item.enabled).length);
    };
    window.addEventListener(TEXT_EDIT_MODE_EVENT, syncTextMode);
    window.addEventListener(TEXT_OVERRIDE_UPDATED_EVENT, syncTextMode);
    return () => {
      window.removeEventListener(TEXT_EDIT_MODE_EVENT, syncTextMode);
      window.removeEventListener(TEXT_OVERRIDE_UPDATED_EVENT, syncTextMode);
    };
  }, []);

  async function copyExport() {
    const text = JSON.stringify(makeAdjustmentExportPackage(rules), null, 2);
    await navigator.clipboard.writeText(text);
    setMessage('调整包已复制，可以直接发给 Codex 同步到代码。');
  }

  function downloadExport() {
    downloadText(`调整模式-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(makeAdjustmentExportPackage(rules), null, 2));
    setMessage('调整包已下载。');
  }

  async function importRules(file: File) {
    const parsed: unknown = JSON.parse(await file.text());
    const imported = parseAdjustmentImportPackage(parsed);
    const importedButtons = parseAdjustmentCustomButtonsImportPackage(parsed);
    saveAdjustmentRules(imported);
    saveAdjustmentCustomButtons(importedButtons);
    setRules(imported);
    setCustomButtons(importedButtons);
    setMessage(`已导入 ${imported.length} 条调整、${importedButtons.length} 个新增按钮。`);
  }

  function clearRules() {
    if (!window.confirm('确认清空所有调整记录吗？')) return;
    clearAdjustmentHistoryEntries();
    saveAdjustmentCustomButtons([]);
    saveAdjustmentRules([]);
    setRules([]);
    setCustomButtons([]);
    setHistory([]);
    setMessage('已清空调整记录。');
  }

  function restoreHistory(entry: AdjustmentHistoryEntry) {
    const nextRules = restoreAdjustmentHistoryEntry(entry.id);
    setRules(nextRules);
    setHistory(readAdjustmentHistoryEntries());
    setMessage(entry.beforeRule ? `已恢复：${entry.label}` : `已撤销：${entry.label}`);
  }

  function openTextMode() {
    setAdjustmentModeEnabled(false);
    setAdvancedMode(false);
    setTextEditMode(true);
    setTextEditModeState(true);
    setMessage('文案调整已开启。去任意页面点击文字即可修改，同名文案会自动同步。');
  }

  function closeTextMode() {
    setTextEditMode(false);
    setTextEditModeState(false);
    setMessage('文案调整已关闭。');
  }

  function openAdvancedMode() {
    setTextEditMode(false);
    setTextEditModeState(false);
    setAdjustmentModeEnabled(true);
    setAdvancedMode(true);
    setMessage('高级 UI 调整已开启。右侧浮层可选择元素、改 UI、添加按钮。');
  }

  function closeAdvancedMode() {
    setAdjustmentModeEnabled(false);
    setAdvancedMode(false);
    setMessage('高级 UI 调整已关闭。');
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">调整模式</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">分成两种：文案调整只改字，高级 UI 调整才改按钮、颜色、大小和布局。</p>
        </div>
        <div className="rounded-xl bg-brand-light px-4 py-2 text-xs font-black text-[#08AACE]">{message}</div>
      </header>

      <main className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={`rounded-2xl border bg-white p-5 shadow-sm ${textEditMode ? 'border-[#08AACE]' : 'border-slate-100'}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-[#08AACE]">
                    <Type className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">文案调整</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">只改软件里显示的文字，不动布局。</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${textEditMode ? 'bg-brand-light text-[#08AACE]' : 'bg-slate-100 text-slate-400'}`}>
                  {textEditMode ? '已开启' : '未开启'}
                </span>
              </div>
              <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
                <div>1. 点击“开启文案调整”。</div>
                <div>2. 去任意页面，点你想修改的文字。</div>
                <div>3. 输入新名字并保存。</div>
                <div>4. 同名文案会自动同步，比如一个“重命名”改了，其他作品卡片里的“重命名”也会一起变。</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={textEditMode ? closeTextMode : openTextMode}
                  className={`h-11 rounded-xl text-sm font-black ${textEditMode ? 'bg-slate-100 text-slate-600' : 'bg-[#08AACE] text-white'}`}
                >
                  {textEditMode ? '关闭文案调整' : '开启文案调整'}
                </button>
                <button onClick={() => navigate('/text-overrides')} className="h-11 rounded-xl border border-[#08AACE] bg-white text-sm font-black text-[#08AACE]">
                  管理文案
                </button>
              </div>
              <div className="mt-3 rounded-xl border border-[#08AACE]/15 bg-brand-light px-3 py-2 text-xs font-black text-[#08AACE]">
                已启用 {textOverrideCount} 条文案修改
              </div>
            </section>

            <section className={`rounded-2xl border bg-white p-5 shadow-sm ${advancedMode ? 'border-[#08AACE]' : 'border-slate-100'}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-[#08AACE]">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">高级 UI 调整</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">可以改大小、颜色、位置，也可以添加占位按钮。</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${advancedMode ? 'bg-brand-light text-[#08AACE]' : 'bg-slate-100 text-slate-400'}`}>
                  {advancedMode ? '已开启' : '未开启'}
                </span>
              </div>
              <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
                <div>1. 点击“开启高级 UI 调整”。</div>
                <div>2. 右侧浮层点“选择元素”。</div>
                <div>3. 点软件里的按钮、输入框、卡片。</div>
                <div>4. 修改字号、颜色、宽高、间距，最后导出调整包给我同步进代码。</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={advancedMode ? closeAdvancedMode : openAdvancedMode}
                  className={`h-11 rounded-xl text-sm font-black ${advancedMode ? 'bg-slate-100 text-slate-600' : 'bg-[#08AACE] text-white'}`}
                >
                  {advancedMode ? '关闭高级调整' : '开启高级调整'}
                </button>
                <button onClick={() => navigate('/software-ui-catalog')} className="h-11 rounded-xl border border-[#08AACE] bg-white text-sm font-black text-[#08AACE]">
                  查看 UI 记录
                </button>
              </div>
              <div className="mt-3 rounded-xl border border-[#08AACE]/15 bg-brand-light px-3 py-2 text-xs font-black text-[#08AACE]">
                已记录 {rules.length} 条 UI 调整 / 新增按钮 {customButtons.length} 个
              </div>
            </section>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#08AACE]" />
              <h2 className="text-lg font-black text-slate-900">两种模式的区别</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['文案调整', '只改显示文字，适合“重命名改成改名”“我的小说改成作品”等。'],
                ['自动同步', '按原文案识别，同样叫“重命名”的地方会一起改。'],
                ['高级 UI 调整', '改按钮大小、颜色、位置、间距，或添加新按钮。'],
                ['同步到代码', '高级 UI 调整后导出调整包，发给我后可以写进源码。'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-black text-slate-900">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#08AACE]/20 bg-brand-light p-4">
              <div className="mb-3 text-sm font-black text-[#08AACE]">已开启的能力</div>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600">
                  <MousePointer2 className="h-4 w-4 text-[#08AACE]" />
                  点选元素
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600">
                  <Grid3X3 className="h-4 w-4 text-[#08AACE]" />
                  网格和对齐线
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600">
                  <Save className="h-4 w-4 text-[#08AACE]" />
                  导出调整包
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => navigate('/novels')} className="h-10 rounded-xl bg-[#08AACE] px-5 text-sm font-black text-white">去我的小说</button>
              <button onClick={() => navigate('/workbench')} className="h-10 rounded-xl border border-[#08AACE] bg-white px-5 text-sm font-black text-[#08AACE]">去作品编辑器</button>
              <button onClick={() => navigate('/dashboard')} className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600">去首页</button>
            </div>
          </div>
          </div>

          <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">调整记录</h2>
              <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-black text-[#08AACE]">{rules.length} 条 / 按钮 {customButtons.length} 个</span>
            </div>
            <div className="grid gap-2">
              <button onClick={() => void copyExport()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08AACE] text-sm font-black text-white">
                <Save className="h-4 w-4" />
                复制调整包
              </button>
              <button onClick={downloadExport} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#08AACE] bg-white text-sm font-black text-[#08AACE]">
                <Download className="h-4 w-4" />
                下载调整包
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="h-11 rounded-xl bg-slate-100 text-sm font-black text-slate-600">导入调整包</button>
              <button onClick={clearRules} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-black text-red-500">
                <RotateCcw className="h-4 w-4" />
                清空记录
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void importRules(file).catch((error) => setMessage(error instanceof Error ? error.message : '导入失败'));
              }}
            />
            <div className="mt-4 rounded-2xl border border-[#08AACE]/15 bg-brand-light p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-black text-slate-900">最近操作</div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-[#08AACE]">{history.length} 条</span>
              </div>
              <div className="editor-scrollbar max-h-[220px] space-y-2 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#08AACE]/20 bg-white/70 p-4 text-center text-xs font-bold text-slate-400">暂无最近操作</div>
                ) : history.slice(0, 12).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-[#08AACE]/10 bg-white p-3">
                    <div className="truncate text-sm font-black text-slate-800">{entry.label}</div>
                    <div className="mt-1 truncate text-[11px] font-bold text-slate-400">{entry.action} · {formatHistoryTime(entry.createdAt)}</div>
                    <button
                      onClick={() => restoreHistory(entry)}
                      className="mt-2 h-8 w-full rounded-lg bg-[#08AACE] text-xs font-black text-white"
                    >
                      恢复这条
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="editor-scrollbar mt-4 max-h-[180px] space-y-2 overflow-y-auto pr-1">
              {customButtons.length === 0 ? null : customButtons.map((button) => (
                <div key={button.id} className="rounded-xl border border-[#08AACE]/10 bg-brand-light p-3">
                  <div className="truncate text-sm font-black text-slate-800">{button.label}</div>
                  <div className="mt-1 truncate text-[11px] font-bold text-[#08AACE]">{button.route} · {button.note}</div>
                </div>
              ))}
            </div>
            <div className="editor-scrollbar mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {rules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-400">暂无调整记录</div>
              ) : rules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="truncate text-sm font-black text-slate-800">{rule.label}</div>
                  <div className="mt-1 truncate text-[11px] font-bold text-slate-400">{rule.route}</div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
