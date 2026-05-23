import { useCallback, useEffect, useState } from 'react';

export interface CallRecord {
  id: string;
  modelId: string;
  modelApiId?: string;
  modelInstanceId?: string;
  modelName: string;
  type: 'api_test' | 'chat' | 'generate' | 'stream';
  timestamp: number;
  status: 'success' | 'failed';
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  endpoint?: string;
  error?: string;
}

const CALL_RECORDS_KEY = 'xinyuexia_call_records_v1';
const UPDATE_EVENT = 'xinyuexia_call_records_updated';
const MAX_RECORDS = 500;

export function loadRecords(): CallRecord[] {
  try {
    const raw = localStorage.getItem(CALL_RECORDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CallRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: CallRecord[]) {
  localStorage.setItem(CALL_RECORDS_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function addRecord(record: Omit<CallRecord, 'id' | 'timestamp'>) {
  const newRecord: CallRecord = {
    ...record,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  const records = loadRecords();
  records.push(newRecord);
  saveRecords(records);
  return newRecord;
}

export function clearRecords() {
  localStorage.removeItem(CALL_RECORDS_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function clearApiTestFailureRecords() {
  const records = loadRecords().filter((record) => !(record.type === 'api_test' && record.status === 'failed'));
  saveRecords(records);
}

export function deleteRecordsByModel(modelId: string, modelInstanceId?: string) {
  const records = loadRecords();
  const identity = modelInstanceId ?? modelId;
  const next = records.filter((record) => {
    if (record.modelInstanceId) return record.modelInstanceId !== identity;
    return record.modelId !== modelId && record.modelId !== identity;
  });
  if (next.length !== records.length) saveRecords(next);
  return next.length !== records.length;
}

export function pruneRecordsByModels(models: Array<{ id: string; instanceId?: string }>) {
  const records = loadRecords();
  const currentInstanceIds = new Set(models.map((model) => model.instanceId ?? model.id));
  const currentModelIds = new Set(models.map((model) => model.id));

  const next = records.filter((record) => {
    if (record.modelInstanceId) return currentInstanceIds.has(record.modelInstanceId);
    return currentModelIds.has(record.modelId) || currentInstanceIds.has(record.modelId);
  });

  if (next.length !== records.length) saveRecords(next);
  return next.length !== records.length;
}

export function getStatsByModel(records: CallRecord[]) {
  const stats: Record<string, {
    modelId: string;
    modelInstanceId?: string;
    modelName: string;
    callCount: number;
    successCount: number;
    failCount: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    avgLatency: number;
    totalLatency: number;
  }> = {};

  for (const record of records) {
    const key = record.modelInstanceId ?? record.modelId;
    if (!stats[key]) {
      stats[key] = {
        modelId: record.modelId,
        modelInstanceId: record.modelInstanceId,
        modelName: record.modelName,
        callCount: 0,
        successCount: 0,
        failCount: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        avgLatency: 0,
        totalLatency: 0,
      };
    }

    const stat = stats[key];
    stat.callCount += 1;
    if (record.status === 'success') stat.successCount += 1;
    else stat.failCount += 1;
    stat.totalInputTokens += record.inputTokens ?? 0;
    stat.totalOutputTokens += record.outputTokens ?? 0;
    stat.totalTokens += record.totalTokens ?? 0;
    stat.totalLatency += record.latencyMs;
  }

  for (const key of Object.keys(stats)) {
    const stat = stats[key];
    stat.avgLatency = stat.callCount > 0 ? Math.round(stat.totalLatency / stat.callCount) : 0;
  }

  return stats;
}

export function useCallRecords() {
  const [records, setRecords] = useState<CallRecord[]>(loadRecords);

  useEffect(() => {
    const sync = () => setRecords(loadRecords());
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const refresh = useCallback(() => {
    setRecords(loadRecords());
  }, []);

  const clear = useCallback(() => {
    clearRecords();
    setRecords([]);
  }, []);

  const clearApiTestFailures = useCallback(() => {
    clearApiTestFailureRecords();
    setRecords(loadRecords());
  }, []);

  const deleteByModel = useCallback((modelId: string, modelInstanceId?: string) => {
    deleteRecordsByModel(modelId, modelInstanceId);
    setRecords(loadRecords());
  }, []);

  const pruneByModels = useCallback((models: Array<{ id: string; instanceId?: string }>) => {
    pruneRecordsByModels(models);
    setRecords(loadRecords());
  }, []);

  return { records, refresh, clear, clearApiTestFailures, deleteByModel, pruneByModels };
}
