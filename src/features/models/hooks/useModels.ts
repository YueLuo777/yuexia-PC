import { useEffect, useMemo, useState } from 'react';

import type { ModelItem, NewModelInput } from '@/features/models/model/modelTypes';
import { deleteRecordsByModel } from '@/hooks/useCallRecords';
import { APP_EVENTS } from '@/shared/events/appEvents';

const MODELS_KEY = 'xinyuexia_api_settings_v1';
const MODELS_MIGRATED_KEY = 'xinyuexia_models_migrated_v1';
const ACTIVE_MODEL_KEY = 'xinyuexia_active_model_id';
const PINAI_MODEL_ID = 'gpt-5.4';
const PINAI_BASE_URL = 'https://us.pinai-cn.com/v1';

function createModelInstanceId(id: string) {
  return `${id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeNewModelId(input: NewModelInput) {
  return input.id.trim();
}

function normalizeTemperature(value: number | undefined) {
  const next = Number(value);
  if (!Number.isFinite(next)) return 0.7;
  const stepped = Math.round(next / 0.05) * 0.05;
  return Math.max(0.1, Math.min(1, Number(stepped.toFixed(2))));
}

function isLegacyImageModel(model: ModelItem & { modelKind?: string }) {
  return model.modelKind === 'image' || /^gpt[-_]?image[-_]?/.test((model.model || model.id || '').trim());
}

function getEnvPinaiModel(): ModelItem | null {
  const apiKey = import.meta.env.VITE_PINAI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    id: PINAI_MODEL_ID,
    instanceId: PINAI_MODEL_ID,
    name: import.meta.env.VITE_PINAI_MODEL_NAME?.trim() || 'PinAI GPT-5.4',
    baseUrl: import.meta.env.VITE_PINAI_BASE_URL?.trim() || PINAI_BASE_URL,
    apiKey,
    model: import.meta.env.VITE_PINAI_MODEL_ID?.trim() || PINAI_MODEL_ID,
    provider: 'openai-compatible',
    enabled: true,
    locked: false,
    connectionStatus: 'unknown',
    temperature: 0.7,
  };
}

function syncEnvModel(models: ModelItem[]) {
  const envModel = getEnvPinaiModel();
  if (!envModel) return models;

  const existing = models.find((model) => model.id === envModel.id);
  const next = existing
    ? models.map((model) => (
      model.id === envModel.id
        ? {
            ...envModel,
            ...model,
            name: model.name || envModel.name,
            baseUrl: model.baseUrl || envModel.baseUrl,
            apiKey: model.apiKey || envModel.apiKey,
            model: model.model || envModel.model,
            provider: model.provider ?? envModel.provider,
            enabled: model.enabled ?? envModel.enabled,
            locked: model.locked ?? envModel.locked,
            connectionStatus: model.connectionStatus ?? envModel.connectionStatus,
            temperature: normalizeTemperature(model.temperature ?? envModel.temperature),
          }
        : model
    ))
    : [...models, envModel];

  if (JSON.stringify(next) !== JSON.stringify(models)) {
    writeModels(next);
  }
  return next;
}

function readModels() {
  try {
    const raw = localStorage.getItem(MODELS_KEY);
    if (!raw) return syncEnvModel([]);
    const parsed = JSON.parse(raw) as { models?: ModelItem[] };
    const storedModels = parsed.models ?? [];
    const rawModels = storedModels
      .filter((model) => !isLegacyImageModel(model as ModelItem & { modelKind?: string }))
      .map((model) => {
        const { modelKind: _ignoredModelKind, ...textModel } = model as ModelItem & { modelKind?: string };
        return {
          provider: 'openai-compatible' as const,
          ...textModel,
          instanceId: model.instanceId ?? model.id,
          temperature: normalizeTemperature(textModel.temperature),
        };
      });
    const models = rawModels;
    if (models.length !== storedModels.length) {
      writeModels(models);
    }
    const migrated = localStorage.getItem(MODELS_MIGRATED_KEY) === '1';
    if (!migrated) {
      const cleaned = models.filter((model) => !['deepseek-v4-flash', 'deepseek-v4-pro'].includes(model.id));
      localStorage.setItem(MODELS_MIGRATED_KEY, '1');
      if (cleaned.length !== models.length) {
        writeModels(cleaned);
        return syncEnvModel(cleaned);
      }
    }
    return syncEnvModel(models);
  } catch {
    return syncEnvModel([]);
  }
}

function writeModels(models: ModelItem[]) {
  localStorage.setItem(MODELS_KEY, JSON.stringify({ models }));
  window.dispatchEvent(new CustomEvent(APP_EVENTS.modelsUpdated));
}

export function readModelSnapshot() {
  return readModels();
}

export function useModels() {
  const [models, setModels] = useState<ModelItem[]>(readModels);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_MODEL_KEY) || readModels()[0]?.id || null);

  const activeModel = useMemo(() => models.find((model) => model.id === activeId) ?? null, [activeId, models]);

  useEffect(() => {
    const syncModels = () => setModels(readModels());
    window.addEventListener(APP_EVENTS.modelsUpdated, syncModels);
    return () => window.removeEventListener(APP_EVENTS.modelsUpdated, syncModels);
  }, []);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_MODEL_KEY, activeId);
    else localStorage.removeItem(ACTIVE_MODEL_KEY);
  }, [activeId]);

  const persist = (next: ModelItem[]) => {
    setModels(next);
    writeModels(next);
    if (next.length === 0) setActiveId(null);
    else if (!next.some((model) => model.id === activeId)) setActiveId(next[0].id);
  };

  const addModel = (input: NewModelInput) => {
    const id = normalizeNewModelId(input);
    if (!id || models.some((model) => model.id === id)) return false;
    const model: ModelItem = {
      id,
      instanceId: createModelInstanceId(id),
      name: input.name.trim() || id,
      baseUrl: input.baseUrl.trim(),
      apiKey: input.apiKey.trim(),
      model: id,
      provider: input.provider ?? 'openai-compatible',
      enabled: true,
      locked: false,
      connectionStatus: 'unknown',
      temperature: normalizeTemperature(input.temperature),
    };
    persist([...models, model]);
    setActiveId(model.id);
    return true;
  };

  const updateModel = (id: string, updates: Partial<ModelItem>) => {
    persist(models.map((model) => {
      if (model.id !== id) return model;
      const { id: _ignoredId, instanceId: _ignoredInstanceId, ...safeUpdates } = updates;
      return {
        ...model,
        ...safeUpdates,
        temperature: safeUpdates.temperature === undefined ? model.temperature : normalizeTemperature(safeUpdates.temperature),
      };
    }));
  };

  const deleteModel = (id: string) => {
    const target = models.find((model) => model.id === id);
    if (target) deleteRecordsByModel(target.id, target.instanceId);
    persist(models.filter((model) => model.id !== id));
  };

  const reorderModels = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= models.length || to >= models.length) return;
    const next = [...models];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persist(next);
  };

  return {
    models,
    activeId,
    activeModel,
    setActiveId,
    addModel,
    updateModel,
    deleteModel,
    reorderModels,
  };
}
