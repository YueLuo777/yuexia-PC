import { useCallback, useEffect, useMemo, useState } from 'react';

import type { NewPlotLibraryItem, PlotLibraryItem } from '@/features/plot-library/model/plotLibraryTypes';
import { hydrateDatabaseCollection, writeDatabaseCollection } from '@/features/settings/model/databaseCollectionStore';

const PLOT_LIBRARY_KEY = 'xinyuexia_plot_library_v1';
const PLOT_RECYCLE_KEY = 'xinyuexia_plot_library_recycle_v1';

function readItems() {
  try {
    const raw = localStorage.getItem(PLOT_LIBRARY_KEY);
    return raw ? (JSON.parse(raw) as PlotLibraryItem[]) : [];
  } catch {
    return [];
  }
}

function writeItems(items: PlotLibraryItem[]) {
  localStorage.setItem(PLOT_LIBRARY_KEY, JSON.stringify(items));
  writeDatabaseCollection('plotLibrary', items);
}

function readRecycleItems() {
  try {
    const raw = localStorage.getItem(PLOT_RECYCLE_KEY);
    return raw ? (JSON.parse(raw) as PlotLibraryItem[]) : [];
  } catch {
    return [];
  }
}

function writeRecycleItems(items: PlotLibraryItem[]) {
  localStorage.setItem(PLOT_RECYCLE_KEY, JSON.stringify(items));
  writeDatabaseCollection('plotRecycle', items);
}

function wordCount(text: string) {
  return text.replace(/\s+/g, '').length;
}

function parseAnchors(content: string) {
  const fsText = content.match(/<fs>([\s\S]*?)<\/fs>/i)?.[1]?.trim();
  const bqText = content.match(/<bq>([\s\S]*?)<\/bq>/i)?.[1]?.trim();
  return { fsText, bqText };
}

function parseRating(content: string) {
  const match = content.match(/(?:#\s*)?评分[：:\s]*(\d{1,3})|【评分】\s*(\d{1,3})/);
  const value = Number(match?.[1] ?? match?.[2]);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : undefined;
}

function parseTags(content: string, inputTags: string[] = []) {
  const tagText = content.match(/(?:#\s*)?主题标签[：:\s]*([^\n]+)|【标签】([^\n]+)/)?.[1]
    ?? content.match(/(?:#\s*)?剧情点标签[：:\s]*([^\n]+)/)?.[1]
    ?? '';
  return Array.from(new Set([
    ...inputTags,
    ...tagText.split(/[,，、#\s]+/).map((item) => item.trim()).filter(Boolean),
  ]));
}

function createId() {
  return `plot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function savePlotItems(items: NewPlotLibraryItem[]) {
  const now = new Date().toISOString();
  const current = readItems();
  const nextItems: PlotLibraryItem[] = items.map((item) => ({
    ...parseAnchors(item.content),
    id: createId(),
    title: item.title,
    chapter: item.chapter,
    novelTitle: item.novelTitle,
    content: item.content,
    tags: parseTags(item.content, item.tags),
    rating: item.rating ?? parseRating(item.content),
    wordCount: wordCount(item.content),
    createdAt: now,
    updatedAt: now,
  }));
  writeItems([...nextItems, ...current]);
  return nextItems;
}

export function readPlotLibrarySnapshot() {
  return {
    items: readItems(),
  };
}

export function usePlotLibrary() {
  const [items, setItems] = useState<PlotLibraryItem[]>(readItems);
  const [recycleItems, setRecycleItems] = useState<PlotLibraryItem[]>(readRecycleItems);

  useEffect(() => {
    void hydrateDatabaseCollection<PlotLibraryItem>('plotLibrary', readItems(), (next) => {
      localStorage.setItem(PLOT_LIBRARY_KEY, JSON.stringify(next));
      setItems(next);
    });
    void hydrateDatabaseCollection<PlotLibraryItem>('plotRecycle', readRecycleItems(), (next) => {
      localStorage.setItem(PLOT_RECYCLE_KEY, JSON.stringify(next));
      setRecycleItems(next);
    });
  }, []);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
  }, [items]);

  const addItems = useCallback((input: NewPlotLibraryItem[]) => {
    const created = savePlotItems(input);
    setItems(readItems());
    return created;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Pick<PlotLibraryItem, 'title' | 'content' | 'tags' | 'rating'>>) => {
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id !== id) return item;
        const content = updates.content ?? item.content;
        return {
          ...item,
          ...updates,
          content,
          ...parseAnchors(content),
          tags: updates.tags ?? parseTags(content, item.tags),
          rating: updates.rating ?? parseRating(content) ?? item.rating,
          wordCount: wordCount(content),
          updatedAt: new Date().toISOString(),
        };
      });
      writeItems(next);
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        setRecycleItems((recyclePrev) => {
          const nextRecycle = [
            { ...target, deletedAt: new Date().toISOString() },
            ...recyclePrev.filter((item) => item.id !== id),
          ];
          writeRecycleItems(nextRecycle);
          return nextRecycle;
        });
      }
      const next = prev.filter((item) => item.id !== id);
      writeItems(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const now = new Date().toISOString();
    setRecycleItems((recyclePrev) => {
      const moved = readItems().map((item) => ({ ...item, deletedAt: now }));
      const movedIds = new Set(moved.map((item) => item.id));
      const nextRecycle = [...moved, ...recyclePrev.filter((item) => !movedIds.has(item.id))];
      writeRecycleItems(nextRecycle);
      return nextRecycle;
    });
    writeItems([]);
    setItems([]);
  }, []);

  const restoreItem = useCallback((id: string) => {
    setRecycleItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;
      const restored = { ...target };
      delete restored.deletedAt;
      const active = readItems();
      writeItems([restored, ...active.filter((item) => item.id !== id)]);
      setItems(readItems());
      const next = prev.filter((item) => item.id !== id);
      writeRecycleItems(next);
      return next;
    });
  }, []);

  const permanentDeleteItem = useCallback((id: string) => {
    setRecycleItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeRecycleItems(next);
      return next;
    });
  }, []);

  const clearRecycle = useCallback(() => {
    writeRecycleItems([]);
    setRecycleItems([]);
  }, []);

  return {
    items,
    recycleItems,
    tags,
    addItems,
    updateItem,
    deleteItem,
    clearAll,
    restoreItem,
    permanentDeleteItem,
    clearRecycle,
  };
}
