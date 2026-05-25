import { AlertCircle, Eye, EyeOff, GripVertical, Plus, Server, Settings, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useModels } from '@/features/models/hooks/useModels';
import type { ModelItem, ModelProvider } from '@/features/models/model/modelTypes';
import { callModel } from '@/features/models/services/callModel';
import { addRecord, useCallRecords } from '@/hooks/useCallRecords';
import { useTopModalEscape } from '@/shared/hooks/useTopModalEscape';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type ModelDraft = {
  name: string;
  id: string;
  baseUrl: string;
  apiKey: string;
  provider: ModelProvider;
  temperature: number;
};

type ModelCardsPerRow = 3 | 4;

const MODEL_MANAGE_SETTINGS_KEY = 'xinyuexia_model_manage_settings_v1';

const temperaturePresets = [
  { label: '精准', value: 0.3, desc: '提炼、总结、校对' },
  { label: '均衡', value: 0.7, desc: '写作、对话、通用' },
  { label: '创意', value: 1.0, desc: '脑洞、扩写、风格化' },
] as const;

function loadCardsPerRow(): ModelCardsPerRow {
  try {
    const parsed = JSON.parse(localStorage.getItem(MODEL_MANAGE_SETTINGS_KEY) ?? '{}') as { cardsPerRow?: unknown };
    return parsed.cardsPerRow === 4 ? 4 : 3;
  } catch {
    return 3;
  }
}

function saveCardsPerRow(cardsPerRow: ModelCardsPerRow) {
  localStorage.setItem(MODEL_MANAGE_SETTINGS_KEY, JSON.stringify({ cardsPerRow }));
}

const providerMeta: Record<ModelProvider, { label: string; defaultBaseUrl: string; modelPlaceholder: string; namePlaceholder: string }> = {
  'openai-compatible': {
    label: 'OpenAI 兼容（GPT / DeepSeek 等）',
    defaultBaseUrl: '',
    modelPlaceholder: '',
    namePlaceholder: '',
  },
  anthropic: {
    label: 'Anthropic Claude',
    defaultBaseUrl: '',
    modelPlaceholder: '',
    namePlaceholder: '',
  },
};

function normalizeTemperature(value: number) {
  if (!Number.isFinite(value)) return 0.7;
  const stepped = Math.round(value / 0.05) * 0.05;
  return Math.max(0.1, Math.min(1, Number(stepped.toFixed(2))));
}

function formatTemperature(value: number) {
  return normalizeTemperature(value).toFixed(2);
}

function normalizeModelDraft(draft: ModelDraft) {
  const id = draft.id.trim();
  return {
    ...draft,
    id,
    name: draft.name.trim() || id,
    temperature: normalizeTemperature(draft.temperature),
    baseUrl: draft.baseUrl.trim().replace(/^(?:POST|GET)\s+/i, ''),
    apiKey: draft.apiKey.trim(),
  };
}

function formatLogTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function ModelEditorModal({
  isOpen,
  title,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  title: string;
  initial: ModelDraft;
  onClose: () => void;
  onSave: (draft: ModelDraft) => void;
}) {
  useTopModalEscape(isOpen, onClose);
  const [draft, setDraft] = useState<ModelDraft>(initial);
  const [showKey, setShowKey] = useState(false);
  const currentProvider = providerMeta[draft.provider];

  useEffect(() => {
    if (isOpen) setDraft(initial);
  }, [initial, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-sharp fixed inset-0 z-[260] flex items-center justify-center bg-black/40">
      <div
        className="modal-sharp w-[620px] max-w-[92vw] rounded-[28px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-8 py-7">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">模型名称</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={currentProvider.namePlaceholder}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">模型 ID</label>
            <input
              value={draft.id}
              onChange={(event) => setDraft((prev) => ({ ...prev, id: event.target.value }))}
              placeholder={currentProvider.modelPlaceholder}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-600">温度预设</label>
              <span className="text-xs font-bold text-brand">{formatTemperature(draft.temperature)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {temperaturePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setDraft((prev) => ({ ...prev, temperature: preset.value }))}
                  className={`rounded-2xl border px-3 py-2 text-left transition-colors ${
                    normalizeTemperature(draft.temperature) === preset.value
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-bold">{preset.label}</div>
                  <div className="mt-0.5 text-[11px] opacity-80">{formatTemperature(preset.value)}</div>
                  <div className="mt-1 truncate text-[10px] opacity-70">{preset.desc}</div>
                </button>
              ))}
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={normalizeTemperature(draft.temperature)}
              onChange={(event) => setDraft((prev) => ({ ...prev, temperature: normalizeTemperature(Number(event.target.value)) }))}
              className="mt-3 w-full accent-brand"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">接口类型</label>
            <select
              value={draft.provider}
              onChange={(event) => {
                const provider = event.target.value as ModelProvider;
                setDraft((prev) => ({
                  ...prev,
                  provider,
                  baseUrl: prev.baseUrl,
                }));
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
            >
              {(Object.keys(providerMeta) as ModelProvider[]).map((provider) => (
                <option key={provider} value={provider}>{providerMeta[provider].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">接口地址</label>
            <input
              value={draft.baseUrl}
              onChange={(event) => setDraft((prev) => ({ ...prev, baseUrl: event.target.value }))}
              placeholder={currentProvider.defaultBaseUrl}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={draft.apiKey}
                onChange={(event) => setDraft((prev) => ({ ...prev, apiKey: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-11 text-sm outline-none transition-colors focus:border-brand"
              />
              <button
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-slate-500"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/60 px-8 py-5">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-6 py-3 text-base text-slate-600 hover:bg-white">
            取消
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={!draft.name.trim() || !draft.id.trim()}
            className="rounded-2xl bg-brand px-7 py-3 text-base text-white transition-colors hover:bg-brand-dark disabled:bg-slate-300"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
}

function ModelManageSettingsModal({
  isOpen,
  cardsPerRow,
  onChange,
  onClose,
}: {
  isOpen: boolean;
  cardsPerRow: ModelCardsPerRow;
  onChange: (value: ModelCardsPerRow) => void;
  onClose: () => void;
}) {
  useTopModalEscape(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="modal-sharp fixed inset-0 z-[265] flex items-center justify-center bg-black/35 px-6" onClick={onClose}>
      <div
        className="modal-sharp w-[420px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">模型管理设置</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-3 text-sm font-bold text-slate-700">每行模型卡片</div>
          <div className="grid grid-cols-2 gap-3">
            {([3, 4] as const).map((value) => {
              const isActive = cardsPerRow === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange(value)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-base font-bold">{value} 个</div>
                  <div className="mt-1 text-xs opacity-75">{value === 3 ? '默认，更宽松' : '更紧凑'}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelManagePage() {
  const { models, addModel, updateModel, deleteModel, reorderModels } = useModels();
  const { records, clearApiTestFailures } = useCallRecords();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ModelItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [temperatureDragId, setTemperatureDragId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModelItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState<ModelCardsPerRow>(loadCardsPerRow);
  const [toast, setToast] = useState('');
  const dragIndexRef = useRef<number | null>(null);

  const enabledCount = models.filter((model) => model.enabled).length;
  const failureLogs = useMemo(
    () => records
      .filter((record) => record.type === 'api_test' && record.status === 'failed')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 30),
    [records],
  );

  useEffect(() => {
    saveCardsPerRow(cardsPerRow);
  }, [cardsPerRow]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const openAdd = () => {
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (model: ModelItem) => {
    setEditing(model);
    setShowAdd(false);
  };

  const testModel = async (model: ModelItem) => {
    const startedAt = performance.now();
    updateModel(model.id, { connectionStatus: 'testing', connectionLatencyMs: undefined });
    try {
      await callModel({
        model,
        prompt: '你是一个测试助手。',
        userContent: '请只返回“连接成功”。',
        chapterContext: '',
        recordType: 'api_test',
      });
      updateModel(model.id, { connectionStatus: 'connected', connectionLatencyMs: Math.round(performance.now() - startedAt) });
      showToast('连接成功');
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startedAt);
      const message = error instanceof Error ? error.message : 'API 测试失败';
      if (!message.startsWith('Model request failed')) {
        addRecord({
          modelId: model.id,
          modelApiId: model.model || model.id,
          modelInstanceId: model.instanceId ?? model.id,
          modelName: model.name,
          type: 'api_test',
          status: 'failed',
          latencyMs,
          endpoint: model.baseUrl,
          error: message.slice(0, 500),
        });
      }
      updateModel(model.id, { connectionStatus: 'failed', connectionLatencyMs: latencyMs });
      showToast('连接失败');
    }
  };

  const statusText = (model: ModelItem) => {
    const latencyText = typeof model.connectionLatencyMs === 'number' ? ` ${model.connectionLatencyMs}ms` : '';
    if (model.connectionStatus === 'connected') return `正常${latencyText}`;
    if (model.connectionStatus === 'failed') return `失败${latencyText}`;
    if (model.connectionStatus === 'testing') return '测试中';
    return '未测试';
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">模型管理</h1>
          <span className="flex h-7 items-center rounded-lg bg-orange-500 px-3 text-xs text-white">模型 {enabledCount} 个</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-brand"
          title="模型管理设置"
          aria-label="模型管理设置"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className={`flex min-h-0 flex-1 overflow-hidden px-7 py-6 ${cardsPerRow === 4 ? 'gap-4' : 'gap-5'}`}>
        <div className="min-w-0 flex-1 overflow-y-auto pr-1">
          <div className="mb-5 flex items-center gap-4">
            {models.length > 1 && (
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <GripVertical className="h-4 w-4" />
                拖拽卡片可调整模型顺序
              </div>
            )}
          </div>

          <div
            className={`grid auto-rows-fr items-stretch ${cardsPerRow === 4 ? 'gap-4' : 'gap-5'}`}
            style={{ gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))` }}
          >
            {models.map((model, index) => (
              <div
                key={model.id}
                draggable={temperatureDragId !== model.id}
                onDragStart={() => {
                  if (temperatureDragId === model.id) return;
                  dragIndexRef.current = index;
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  const from = dragIndexRef.current;
                  if (typeof from === 'number') reorderModels(from, index);
                  dragIndexRef.current = null;
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  dragIndexRef.current = null;
                  setDragOverIndex(null);
                  setTemperatureDragId(null);
                }}
                className={`model-card relative flex h-full min-h-[296px] flex-col overflow-hidden rounded-[20px] border bg-white transition-colors ${
                  cardsPerRow === 4 ? 'p-4 pr-[66px]' : 'p-5 pr-[78px]'
                } ${dragOverIndex === index ? 'border-brand ring-1 ring-brand' : 'border-slate-200'}`}
              >
                <button
                  onClick={() => updateModel(model.id, { locked: !model.locked })}
                  className={`absolute top-4 z-10 rounded-lg border px-2.5 py-1.5 text-center text-xs transition-colors ${
                    cardsPerRow === 4 ? 'right-3 w-[62px]' : 'right-4 w-[72px]'
                  } ${
                    model.locked ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {model.locked ? '已锁定' : '锁定'}
                </button>

                <div
                  className={`model-temp-slider absolute z-10 flex flex-col items-center rounded-full border border-slate-200 bg-slate-50 px-1.5 py-3 ${
                    cardsPerRow === 4 ? 'bottom-4 right-3 top-[92px] w-12' : 'bottom-5 right-4 top-[96px] w-14'
                  }`}
                  title={`温度 ${formatTemperature(model.temperature ?? 0.7)}`}
                  draggable={false}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    setTemperatureDragId(model.id);
                  }}
                  onMouseUp={() => setTemperatureDragId(null)}
                  onMouseLeave={() => setTemperatureDragId(null)}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setTemperatureDragId(model.id);
                  }}
                  onPointerUp={() => setTemperatureDragId(null)}
                  onPointerCancel={() => setTemperatureDragId(null)}
                  onDragStart={(event) => event.preventDefault()}
                >
                  <span className="mb-1 text-xs font-bold text-slate-400">温</span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={normalizeTemperature(model.temperature ?? 0.7)}
                    onChange={(event) => updateModel(model.id, { temperature: normalizeTemperature(Number(event.target.value)) })}
                    draggable={false}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      setTemperatureDragId(model.id);
                    }}
                    onMouseUp={() => setTemperatureDragId(null)}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      setTemperatureDragId(model.id);
                    }}
                    onPointerUp={() => setTemperatureDragId(null)}
                    onPointerCancel={() => setTemperatureDragId(null)}
                    onDragStart={(event) => event.preventDefault()}
                    className={`${cardsPerRow === 4 ? 'w-7' : 'w-8'} h-full cursor-pointer accent-brand`}
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  <span className="mt-1 text-xs font-bold text-brand">{formatTemperature(model.temperature ?? 0.7)}</span>
                </div>

                <div className="mb-4 min-w-0">
                  <div className="text-base font-bold leading-snug text-slate-900 [overflow-wrap:anywhere]" title={model.name}>{model.name}</div>
                </div>

                <div className="mt-auto space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="model-card-meta mb-3 space-y-2 rounded-xl bg-slate-50 px-3 py-3">
                    <div className="truncate text-[13px] text-slate-500" title={model.model}>模型ID: {model.model}</div>
                    <div className="truncate text-[13px] text-slate-500">状态：<span className={model.enabled ? 'text-emerald-600' : 'text-slate-400'}>{statusText(model)}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button onClick={() => openEdit(model)} className="model-action-button model-action-primary flex-1 rounded-lg border border-brand/30 py-2.5 text-sm text-brand hover:bg-brand-light">编辑模型</button>
                    <button onClick={() => void testModel(model)} className="model-action-button model-action-info flex-1 rounded-lg border border-sky-300 py-2.5 text-sm text-sky-500 hover:bg-sky-50">API 测试</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      disabled
                      title="预留"
                      className="model-action-button flex-1 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                    >
                      预留
                    </button>
                    <button
                      onClick={() => {
                        if (!model.locked) setDeleteTarget(model);
                      }}
                      disabled={model.locked}
                      className={`model-action-button ${model.locked ? 'model-action-disabled' : 'model-action-danger'} flex-1 rounded-lg border py-2.5 text-sm transition-colors ${model.locked ? 'cursor-not-allowed border-slate-200 text-slate-300' : 'border-red-300 text-red-500 hover:bg-red-50'}`}
                    >
                      {model.locked ? '已锁定' : '删除'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={openAdd}
              className="model-card model-add-card flex h-full min-h-[296px] flex-col items-center justify-center rounded-[20px] border border-dashed border-blue-400 bg-white text-blue-600 transition-colors hover:border-blue-500 hover:bg-blue-50/40"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-300 bg-blue-50/50">
                <Plus className="h-7 w-7" />
              </span>
              <span className="mt-5 text-lg font-medium">新增模型</span>
            </button>
          </div>
        </div>

        <aside className={`model-failure-panel flex shrink-0 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white ${cardsPerRow === 4 ? 'w-[280px]' : 'w-[300px]'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">失败日志</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">API 测试错误内容</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearApiTestFailures}
                disabled={failureLogs.length === 0}
                className="model-clear-failures rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                清空记录
              </button>
              <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-500">{failureLogs.length}</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {failureLogs.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center text-slate-400">
                <AlertCircle className="mb-3 h-8 w-8 text-slate-300" />
                <div className="text-sm font-medium">暂无失败日志</div>
                <div className="mt-1 text-xs leading-5">点击模型卡片里的 API 测试后，失败原因会显示在这里。</div>
              </div>
            ) : (
              failureLogs.map((log) => (
                <article key={log.id} className="model-failure-log rounded-2xl border border-red-100 bg-red-50/50 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900" title={log.modelName}>{log.modelName}</div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-400" title={log.endpoint}>{log.endpoint || '未记录接口地址'}</div>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">{formatLogTime(log.timestamp)}</span>
                  </div>
                  <pre className="model-failure-error max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-xs leading-5 text-red-700">{log.error || '未返回错误内容'}</pre>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>

      <ModelEditorModal
        isOpen={showAdd || !!editing}
        title={editing ? '编辑模型' : '新增模型'}
        initial={editing
          ? { name: editing.name, id: editing.model || editing.id, baseUrl: editing.baseUrl, apiKey: editing.apiKey, provider: editing.provider ?? 'openai-compatible', temperature: editing.temperature ?? 0.7 }
          : { name: '', id: '', baseUrl: '', apiKey: '', provider: 'openai-compatible', temperature: 0.7 }}
        onClose={() => {
          setEditing(null);
          setShowAdd(false);
        }}
        onSave={(draft) => {
          const normalized = normalizeModelDraft(draft);
          if (editing) {
            updateModel(editing.id, {
              name: normalized.name,
              baseUrl: normalized.baseUrl,
              apiKey: normalized.apiKey,
              model: normalized.id,
              provider: normalized.provider,
              temperature: normalized.temperature,
              connectionStatus: 'unknown',
              connectionLatencyMs: undefined,
            });
            setEditing(null);
            showToast('保存成功');
            return;
          }
          const created = addModel(normalized);
          if (!created) {
            showToast('模型 ID 已存在');
            return;
          }
          setShowAdd(false);
          showToast('模型已添加');
        }}
      />

      <ModelManageSettingsModal
        isOpen={showSettings}
        cardsPerRow={cardsPerRow}
        onChange={setCardsPerRow}
        onClose={() => setShowSettings(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="确认删除"
        description={`确定要删除模型「${deleteTarget?.name ?? ''}」吗？\n删除后将无法恢复。`}
        confirmText="确认删除"
        confirmVariant="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteModel(deleteTarget.id);
          setDeleteTarget(null);
          showToast('模型已删除');
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[160] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
