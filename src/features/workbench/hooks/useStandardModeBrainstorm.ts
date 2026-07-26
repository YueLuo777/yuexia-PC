import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useModels } from '@/features/models/hooks/useModels';
import { callModelStream } from '@/features/models/services/callModel';
import { normalizePromptCategoryName, usePrompts } from '@/features/prompts/hooks/usePrompts';
import {
  readBrainstormRecycleEntries,
  writeBrainstormRecycleEntries,
} from '@/features/workbench/components/workbenchLibraryDataState';
import { BRAINSTORM_OUTPUT_ONLY_INSTRUCTION, LIBRARY_AI_TIMEOUT_MS } from '@/features/workbench/components/workbenchBrainstormState';
import { stripAiThinkingBlock } from '@/features/workbench/components/workbenchLibraryAiText';
import { BRAINSTORM_TYPE } from '@/features/workbench/components/workbenchLibraryTabs';
import { stringifySettingContent } from '@/features/workbench/components/workbenchStructuredSettings';
import {
  GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY,
  WORKBENCH_LIBRARY_UPDATED_EVENT,
  readWorkbenchLibraryEntries,
  writeWorkbenchLibraryEntries,
  type WorkbenchLibraryEntry,
} from '@/features/workbench/model/workbenchLibraryStorage';
import {
  DEFAULT_STANDARD_BRAINSTORM_DRAFT,
  buildStandardBrainstormGenerationRequest,
  buildStandardBrainstormRevisionRequest,
  createEmptyGeneratedVersion,
  createSavedBrainstormEntry,
  createVersionFromBrainstormEntry,
  normalizeBrainstormEntries,
  type StandardBrainstormGenerationDraft,
  type StandardBrainstormVersion,
} from '@/features/workbench/model/standardModeBrainstormModel';

function readBrainstormEntries() {
  return normalizeBrainstormEntries(readWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY));
}

function getInitialBrainstormState() {
  const entries = readBrainstormEntries();
  return {
    entries,
    selectedEntryId: entries[0]?.id ?? null,
    versions: entries[0] ? [createVersionFromBrainstormEntry(entries[0])] : [],
  };
}

export function useStandardModeBrainstorm() {
  const initialStateRef = useRef<ReturnType<typeof getInitialBrainstormState> | null>(null);
  initialStateRef.current ??= getInitialBrainstormState();
  const [entries, setEntries] = useState(initialStateRef.current.entries);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(initialStateRef.current.selectedEntryId);
  const [versions, setVersions] = useState<StandardBrainstormVersion[]>(initialStateRef.current.versions);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [generationDraft, setGenerationDraft] = useState<StandardBrainstormGenerationDraft>(
    DEFAULT_STANDARD_BRAINSTORM_DRAFT,
  );
  const [revisionInput, setRevisionInput] = useState('');
  const [notice, setNotice] = useState('');
  const [generationProgress, setGenerationProgress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const requestAbortRef = useRef<AbortController | null>(null);
  const { models, activeModel } = useModels();
  const { prompts } = usePrompts();

  const selectedModel = activeModel ?? models[0] ?? null;
  const brainstormPrompt = useMemo(
    () => prompts.find((prompt) => normalizePromptCategoryName(prompt.category) === '脑洞')?.content ?? '',
    [prompts],
  );
  const systemPrompt = useMemo(
    () =>
      [
        brainstormPrompt || '你是专业的男频网文脑洞策划助手。请生成具体、可扩展、能支撑长篇连载的中文脑洞。',
        BRAINSTORM_OUTPUT_ONLY_INSTRUCTION,
      ]
        .filter(Boolean)
        .join('\n\n'),
    [brainstormPrompt],
  );
  const activeVersion = versions[activeVersionIndex] ?? null;
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null;
  const busy = isGenerating || isRevising;
  const entriesRef = useRef(entries);
  const activeVersionRef = useRef(activeVersion);
  entriesRef.current = entries;
  activeVersionRef.current = activeVersion;

  useEffect(() => {
    const syncEntries = (event?: Event) => {
      const detail = (event as CustomEvent<{ storageKey?: string }> | undefined)?.detail;
      if (detail?.storageKey && detail.storageKey !== GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY) return;
      setEntries(readBrainstormEntries());
    };
    window.addEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
    window.addEventListener('storage', syncEntries);
    return () => {
      window.removeEventListener(WORKBENCH_LIBRARY_UPDATED_EVENT, syncEntries);
      window.removeEventListener('storage', syncEntries);
    };
  }, []);

  useEffect(() => () => requestAbortRef.current?.abort(), []);

  const persistEntries = useCallback((nextEntries: WorkbenchLibraryEntry[]) => {
    const normalized = normalizeBrainstormEntries(nextEntries);
    setEntries(normalized);
    writeWorkbenchLibraryEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, normalized);
    return normalized;
  }, []);

  const selectEntry = useCallback((entry: WorkbenchLibraryEntry) => {
    setSelectedEntryId(entry.id);
    setVersions([createVersionFromBrainstormEntry(entry)]);
    setActiveVersionIndex(0);
    setRevisionInput('');
    setNotice('');
  }, []);

  const setVersionContent = useCallback((content: string, targetIndex = activeVersionIndex) => {
    setVersions((current) =>
      current.map((version, index) => (index === targetIndex ? { ...version, content } : version)),
    );
  }, [activeVersionIndex]);

  const persistContent = useCallback((sourceId: string, content: string) => {
    persistEntries(
      entries.map((entry) =>
        entry.id === sourceId
          ? {
              ...entry,
              content: stringifySettingContent({ type: BRAINSTORM_TYPE, body: content }),
              updatedAt: new Date().toLocaleString('zh-CN'),
            }
          : entry,
      ),
    );
  }, [entries, persistEntries]);

  const updateActiveVersionContent = useCallback((content: string) => {
    setVersionContent(content, activeVersionIndex);
    if (activeVersion?.sourceEntryId) persistContent(activeVersion.sourceEntryId, content);
  }, [activeVersion, activeVersionIndex, persistContent, setVersionContent]);

  const updateActiveVersionTitle = useCallback((title: string) => {
    setVersions((current) =>
      current.map((version, index) => (index === activeVersionIndex ? { ...version, title } : version)),
    );
    const sourceId = activeVersion?.sourceEntryId;
    if (!sourceId || !title.trim()) return;
    persistEntries(
      entries.map((entry) =>
        entry.id === sourceId ? { ...entry, title, updatedAt: new Date().toLocaleString('zh-CN') } : entry,
      ),
    );
  }, [activeVersion, activeVersionIndex, entries, persistEntries]);

  const normalizeActiveVersionTitle = useCallback(() => {
    if (!activeVersion) return;
    updateActiveVersionTitle(activeVersion.title.trim() || '未命名脑洞');
  }, [activeVersion, updateActiveVersionTitle]);

  const updateGenerationField = useCallback(
    <Key extends keyof StandardBrainstormGenerationDraft>(key: Key, value: StandardBrainstormGenerationDraft[Key]) => {
      setGenerationDraft((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const stopRequest = useCallback(() => requestAbortRef.current?.abort(), []);

  const prepareGeneration = useCallback(() => {
    setSelectedEntryId(null);
    setVersions([createEmptyGeneratedVersion()]);
    setActiveVersionIndex(0);
    setRevisionInput('');
    setNotice('');
  }, []);

  const prepareLibrary = useCallback(() => {
    const currentEntries = entriesRef.current;
    if (activeVersionRef.current?.sourceEntryId || currentEntries.length === 0) return;
    selectEntry(currentEntries[0]);
  }, [selectEntry]);

  const generateBrainstorm = useCallback(async () => {
    if (busy) return;
    if (!selectedModel) {
      setNotice('尚未配置可用模型，请先到模型管理中完成配置。');
      return;
    }
    const generatedVersion = createEmptyGeneratedVersion();
    setVersions([generatedVersion]);
    setSelectedEntryId(null);
    setActiveVersionIndex(0);
    setNotice('');
    setIsGenerating(true);
    setGenerationProgress('正在生成脑洞');
    const abortController = new AbortController();
    requestAbortRef.current = abortController;
    let streamed = '';
    try {
      const result = await callModelStream({
        model: selectedModel,
        prompt: systemPrompt,
        userContent: buildStandardBrainstormGenerationRequest(generationDraft),
        recordType: 'generate',
        signal: abortController.signal,
        timeoutMs: LIBRARY_AI_TIMEOUT_MS,
        onChunk: (chunk) => {
          streamed += chunk;
          setVersionContent(streamed, 0);
        },
      });
      const content = stripAiThinkingBlock(result).trim();
      setVersionContent(content, 0);
      setNotice('脑洞已生成，确认内容后点击保存脑洞。');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (streamed.trim()) {
          setNotice('已停止生成，已输出内容仍保留，确认后可保存到脑洞库。');
        } else {
          setNotice('已停止生成。');
        }
      } else {
        setNotice(`生成失败：${error instanceof Error ? error.message : '模型请求失败。'}`);
      }
    } finally {
      requestAbortRef.current = null;
      setGenerationProgress('');
      setIsGenerating(false);
    }
  }, [busy, generationDraft, selectedModel, setVersionContent, systemPrompt]);

  const saveActiveVersion = useCallback(() => {
    const content = activeVersion?.content.trim() ?? '';
    if (!activeVersion || !content) return;
    if (activeVersion.sourceEntryId) {
      persistContent(activeVersion.sourceEntryId, content);
      setNotice('当前脑洞已保存。');
      return;
    }
    const entry = createSavedBrainstormEntry(entries, activeVersion.title, content);
    const nextEntries = persistEntries([entry, ...entries]);
    selectEntry(nextEntries.find((item) => item.id === entry.id) ?? entry);
    setNotice('脑洞已保存到脑洞库。');
  }, [activeVersion, entries, persistContent, persistEntries, selectEntry]);

  const duplicateActiveVersion = useCallback(() => {
    const content = activeVersion?.content.trim() ?? '';
    if (!activeVersion || !content) return;
    const entry = createSavedBrainstormEntry(entries, `${activeVersion.title || '未命名脑洞'} 副本`, content);
    const nextEntries = persistEntries([entry, ...entries]);
    selectEntry(nextEntries.find((item) => item.id === entry.id) ?? entry);
    setNotice('已复制为新的脑洞。');
  }, [activeVersion, entries, persistEntries, selectEntry]);

  const reviseActiveVersion = useCallback(async () => {
    const requirement = revisionInput.trim();
    const sourceContent = activeVersion?.content.trim() ?? '';
    if (busy || !requirement || !sourceContent) return;
    if (!selectedModel) {
      setNotice('尚未配置可用模型，请先到模型管理中完成配置。');
      return;
    }
    const targetIndex = activeVersionIndex;
    const sourceId = activeVersion?.sourceEntryId;
    setNotice('');
    setIsRevising(true);
    const abortController = new AbortController();
    requestAbortRef.current = abortController;
    let streamed = '';
    try {
      const result = await callModelStream({
        model: selectedModel,
        prompt: systemPrompt,
        userContent: buildStandardBrainstormRevisionRequest(sourceContent, requirement),
        recordType: 'generate',
        signal: abortController.signal,
        timeoutMs: LIBRARY_AI_TIMEOUT_MS,
        onChunk: (chunk) => {
          streamed += chunk;
          setVersionContent(streamed, targetIndex);
          if (sourceId) persistContent(sourceId, streamed);
        },
      });
      const content = stripAiThinkingBlock(result).trim();
      setVersionContent(content, targetIndex);
      if (sourceId) persistContent(sourceId, content);
      setRevisionInput('');
      setNotice('当前脑洞已按要求修改并自动保存。');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setNotice('已停止修改，当前已经输出的内容会继续保留。');
      } else {
        setNotice(`修改失败：${error instanceof Error ? error.message : '模型请求失败。'}`);
      }
    } finally {
      requestAbortRef.current = null;
      setIsRevising(false);
    }
  }, [activeVersion, activeVersionIndex, busy, persistContent, revisionInput, selectedModel, setVersionContent, systemPrompt]);

  const deleteActiveVersion = useCallback(() => {
    if (!activeVersion) return;
    const sourceId = activeVersion.sourceEntryId;
    if (!sourceId) {
      setVersions([]);
      setActiveVersionIndex(0);
      setNotice('当前生成结果已删除。');
      return;
    }
    const sourceIndex = entries.findIndex((entry) => entry.id === sourceId);
    const sourceEntry = entries[sourceIndex];
    if (!sourceEntry) return;
    const nextEntries = persistEntries(entries.filter((entry) => entry.id !== sourceId));
    const recycleEntries = readBrainstormRecycleEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY);
    writeBrainstormRecycleEntries(GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY, [
      { ...sourceEntry, deletedAt: new Date().toISOString() },
      ...recycleEntries,
    ]);
    const nextEntry = nextEntries[Math.min(sourceIndex, Math.max(0, nextEntries.length - 1))];
    if (nextEntry) selectEntry(nextEntry);
    else {
      setSelectedEntryId(null);
      setVersions([]);
      setActiveVersionIndex(0);
    }
    setNotice(nextEntry ? `已删除，当前显示《${nextEntry.title}》。` : '脑洞已删除，脑洞库现在为空。');
  }, [activeVersion, entries, persistEntries, selectEntry]);

  const copyActiveVersion = useCallback(async () => {
    const content = activeVersion?.content.trim() ?? '';
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setNotice('当前脑洞已复制。');
    } catch {
      setNotice('复制失败，请检查系统剪贴板权限。');
    }
  }, [activeVersion]);

  return {
    entries,
    selectedEntryId,
    selectedEntry,
    activeVersion,
    generationDraft,
    revisionInput,
    notice,
    generationProgress,
    isGenerating,
    isRevising,
    busy,
    selectEntry,
    updateActiveVersionContent,
    updateActiveVersionTitle,
    normalizeActiveVersionTitle,
    updateGenerationField,
    setRevisionInput,
    generateBrainstorm,
    reviseActiveVersion,
    stopRequest,
    prepareGeneration,
    prepareLibrary,
    deleteActiveVersion,
    copyActiveVersion,
    saveActiveVersion,
    duplicateActiveVersion,
    showNotice: setNotice,
  };
}
