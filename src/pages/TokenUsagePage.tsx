import {
  Activity,
  ArrowUpDown,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  Filter,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { readModelSnapshot } from '@/features/models/hooks/useModels';
import { getStatsByModel, pruneRecordsByModels, type CallRecord, useCallRecords } from '@/hooks/useCallRecords';
import { APP_EVENTS } from '@/shared/events/appEvents';
import { usePersistentState } from '@/shared/hooks/usePersistentState';
import { CapsuleSelect } from '@/shared/ui/CapsuleSelect';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

type SortField = 'timestamp' | 'latencyMs' | 'totalTokens';
type SortDir = 'asc' | 'desc';

function formatTime(ts: number) {
  const date = new Date(ts);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatTokens(value?: number, empty = '0') {
  if (!value) return empty;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return value.toLocaleString();
}

function getRecordTotal(record: CallRecord) {
  return record.totalTokens ?? ((record.inputTokens ?? 0) + (record.outputTokens ?? 0));
}

function typeLabel(type: CallRecord['type']) {
  if (type === 'api_test') return 'API 测试';
  if (type === 'chat') return '对话';
  if (type === 'generate') return '生成';
  return '流式';
}

export default function TokenUsagePage() {
  const { records, refresh, clear } = useCallRecords();
  const [models, setModels] = useState(readModelSnapshot);
  const [filterType, setFilterType] = usePersistentState<'all' | CallRecord['type']>('xinyuexia_token_usage_filter_type', 'all');
  const [filterModel, setFilterModel] = usePersistentState<string>('xinyuexia_token_usage_filter_model', 'all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const pruneOrphanRecords = () => {
      const currentModels = readModelSnapshot();
      setModels(currentModels);
      if (pruneRecordsByModels(currentModels)) refresh();
    };

    pruneOrphanRecords();
    window.addEventListener(APP_EVENTS.modelsUpdated, pruneOrphanRecords);
    return () => window.removeEventListener(APP_EVENTS.modelsUpdated, pruneOrphanRecords);
  }, [refresh]);

  const activeModelIds = useMemo(() => new Set(models.map((model) => model.id)), [models]);
  const activeModelInstanceIds = useMemo(() => new Set(models.map((model) => model.instanceId ?? model.id)), [models]);
  const activeRecords = useMemo(
    () => records.filter((record) => {
      if (record.modelInstanceId) return activeModelInstanceIds.has(record.modelInstanceId);
      return activeModelIds.has(record.modelId) || activeModelInstanceIds.has(record.modelId);
    }),
    [activeModelIds, activeModelInstanceIds, records],
  );

  useEffect(() => {
    if (filterModel === 'all') return;
    const exists = activeRecords.some((record) => (record.modelInstanceId ?? record.modelId) === filterModel);
    if (!exists) setFilterModel('all');
  }, [activeRecords, filterModel, setFilterModel]);

  const modelOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const record of activeRecords) {
      const key = record.modelInstanceId ?? record.modelId;
      if (!map.has(key)) map.set(key, record.modelName);
    }
    return Array.from(map.entries());
  }, [activeRecords]);

  const stats = useMemo(() => {
    const data = Object.values(getStatsByModel(activeRecords));
    return data.sort((a, b) => b.totalTokens - a.totalTokens);
  }, [activeRecords]);

  const filtered = useMemo(() => {
    const list = activeRecords.filter((record) => {
      const typeMatch = filterType === 'all' || record.type === filterType;
      const modelKey = record.modelInstanceId ?? record.modelId;
      const modelMatch = filterModel === 'all' || modelKey === filterModel;
      return typeMatch && modelMatch;
    });

    const multiplier = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortField === 'timestamp') return (a.timestamp - b.timestamp) * multiplier;
      if (sortField === 'latencyMs') return (a.latencyMs - b.latencyMs) * multiplier;
      return (getRecordTotal(a) - getRecordTotal(b)) * multiplier;
    });
  }, [activeRecords, filterType, filterModel, sortDir, sortField]);

  const totalInput = useMemo(
    () => activeRecords.reduce((sum, record) => sum + (record.inputTokens ?? 0), 0),
    [activeRecords],
  );
  const totalOutput = useMemo(
    () => activeRecords.reduce((sum, record) => sum + (record.outputTokens ?? 0), 0),
    [activeRecords],
  );
  const totalTokens = useMemo(
    () => activeRecords.reduce((sum, record) => sum + getRecordTotal(record), 0),
    [activeRecords],
  );
  const totalCalls = activeRecords.length;
  const successCalls = activeRecords.filter((record) => record.status === 'success').length;
  const failCalls = activeRecords.filter((record) => record.status === 'failed').length;
  const avgLatency = totalCalls > 0 ? Math.round(activeRecords.reduce((sum, record) => sum + record.latencyMs, 0) / totalCalls) : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((value) => (value === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDir('desc');
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-100 bg-white px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">Token用量</h1>
            <p className="truncate text-xs text-gray-400">合并展示模型调用记录、Token 消耗、成功失败与延迟数据。</p>
          </div>
          <span className="flex h-7 shrink-0 items-center rounded-md bg-cyan-500 px-2 text-xs text-white">{totalCalls} 次调用</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={refresh} className="flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-xs text-gray-600 hover:bg-gray-50">
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
          {activeRecords.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空记录
            </button>
          )}
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-1 gap-3 px-5 py-4 md:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-sky-500" />
            <span className="text-xs text-gray-500">输入 Token</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatTokens(totalInput)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-gray-500">输出 Token</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatTokens(totalOutput)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-gray-500">总 Token</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatTokens(totalTokens)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span className="text-xs text-gray-500">调用状态</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCalls}</div>
          <div className="mt-1 flex gap-2 text-xs">
            <span className="flex items-center gap-0.5 text-emerald-600"><CheckCircle className="h-3 w-3" />{successCalls}</span>
            <span className="flex items-center gap-0.5 text-red-500"><XCircle className="h-3 w-3" />{failCalls}</span>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-gray-500">平均延迟</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatDuration(avgLatency)}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {activeRecords.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <Cpu className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">暂无 Token 用量与调用记录</p>
            <p className="mt-1 text-xs">当你开始调用模型后，这里会按模型汇总消耗情况，并显示每次调用明细。</p>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-800">按模型汇总</h2>
              </div>
              <table className="w-full text-base">
                <thead className="bg-gray-50 text-[15px] text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">模型</th>
                    <th className="px-4 py-3 text-right font-medium">调用次数</th>
                    <th className="px-4 py-3 text-right font-medium">成功</th>
                    <th className="px-4 py-3 text-right font-medium">失败</th>
                    <th className="px-4 py-3 text-right font-medium">输入 Token</th>
                    <th className="px-4 py-3 text-right font-medium">输出 Token</th>
                    <th className="px-4 py-3 text-right font-medium">总 Token</th>
                    <th className="px-4 py-3 text-right font-medium">平均延迟</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[17px]">
                  {stats.map((stat) => (
                    <tr key={stat.modelInstanceId ?? stat.modelId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{stat.modelName}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{stat.callCount}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{stat.successCount}</td>
                      <td className="px-4 py-3 text-right text-red-500">{stat.failCount}</td>
                      <td className="px-4 py-3 text-right text-sky-600">{formatTokens(stat.totalInputTokens)}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{formatTokens(stat.totalOutputTokens)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatTokens(stat.totalTokens)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{formatDuration(stat.avgLatency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-800">调用明细</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Filter className="h-3.5 w-3.5" />
                    <span>筛选</span>
                  </div>
                  <CapsuleSelect
                    value={filterType}
                    onChange={(value) => setFilterType(value as typeof filterType)}
                    className="w-[150px]"
                    buttonClassName="h-9 rounded-xl px-3 text-sm"
                    options={[
                      { value: 'all', label: '全部类型' },
                      { value: 'api_test', label: 'API 测试' },
                      { value: 'chat', label: '对话' },
                      { value: 'generate', label: '生成' },
                      { value: 'stream', label: '流式' },
                    ]}
                  />
                  <CapsuleSelect
                    value={filterModel}
                    onChange={setFilterModel}
                    className="w-[180px]"
                    buttonClassName="h-9 rounded-xl px-3 text-sm"
                    options={[
                      { value: 'all', label: '全部模型' },
                      ...modelOptions.map(([id, name]) => ({ value: id, label: name })),
                    ]}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <Activity className="mx-auto mb-3 h-9 w-9 opacity-40" />
                  <p className="text-sm">暂无符合条件的调用记录</p>
                </div>
              ) : (
                <table className="w-full text-base">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-[15px] text-gray-500">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left font-medium">#</th>
                      <th className="cursor-pointer px-3 py-2 text-left font-medium hover:text-gray-700" onClick={() => handleSort('timestamp')}>
                        <span className="flex items-center gap-1">时间 {sortField === 'timestamp' && <ArrowUpDown className="h-3 w-3" />}</span>
                      </th>
                      <th className="px-3 py-2 text-left font-medium">模型</th>
                      <th className="px-3 py-2 text-left font-medium">模型ID</th>
                      <th className="px-3 py-2 text-left font-medium">类型</th>
                      <th className="cursor-pointer px-3 py-2 text-right font-medium hover:text-gray-700" onClick={() => handleSort('latencyMs')}>
                        <span className="flex items-center justify-end gap-1">延迟 {sortField === 'latencyMs' && <ArrowUpDown className="h-3 w-3" />}</span>
                      </th>
                      <th className="px-3 py-2 text-right font-medium">输入</th>
                      <th className="px-3 py-2 text-right font-medium">输出</th>
                      <th className="cursor-pointer px-3 py-2 text-right font-medium hover:text-gray-700" onClick={() => handleSort('totalTokens')}>
                        <span className="flex items-center justify-end gap-1">总 Token {sortField === 'totalTokens' && <ArrowUpDown className="h-3 w-3" />}</span>
                      </th>
                      <th className="px-3 py-2 text-center font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[17px]">
                    {filtered.map((record, index) => (
                      <tr key={record.id} className="transition-colors hover:bg-gray-50" title={record.error}>
                        <td className="px-3 py-2.5 text-gray-400">{filtered.length - index}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{formatTime(record.timestamp)}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-700">{record.modelName}</td>
                        <td className="max-w-[180px] truncate px-3 py-2.5 font-mono text-[15px] text-gray-500" title={record.modelApiId ?? record.modelId}>
                          {record.modelApiId ?? record.modelId}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded px-2 py-0.5 text-xs ${
                            record.type === 'api_test'
                              ? 'bg-sky-50 text-sky-600'
                              : record.type === 'chat'
                                ? 'bg-purple-50 text-purple-600'
                                : record.type === 'generate'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                          >
                            {typeLabel(record.type)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right text-gray-600">{formatDuration(record.latencyMs)}</td>
                        <td className="px-3 py-2.5 text-right text-sky-600">{formatTokens(record.inputTokens, '-')}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-600">{formatTokens(record.outputTokens, '-')}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-gray-700">{formatTokens(getRecordTotal(record), '-')}</td>
                        <td className="px-3 py-2.5 text-center">
                          {record.status === 'success'
                            ? <CheckCircle className="mx-auto h-4 w-4 text-emerald-500" />
                            : <XCircle className="mx-auto h-4 w-4 text-red-500" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="确认清空"
        description="确定要清空所有调用记录和 Token 用量统计吗？清空后无法恢复。"
        confirmText="确认清空"
        confirmVariant="danger"
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clear();
          setShowClearConfirm(false);
        }}
      />
    </div>
  );
}
