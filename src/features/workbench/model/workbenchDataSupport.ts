import { useCallback, useEffect, useMemo, useState } from 'react';

import { applyFormat, getStoredFormatSettings, saveSnapshot } from '@/features/workbench/components/EditorToolModals';
import type { Chapter, RecycledChapter, Volume, WorkbenchNovel } from '@/features/workbench/model/workbenchTypes';
import { countWords, ensureOneSelected, getSelectedChapter } from '@/features/workbench/model/workbenchRules';
import {
  cancelScheduledWorkbenchJsonWrite,
  scheduleWorkbenchJsonWrite,
} from '@/features/workbench/model/workbenchPersistenceQueue';
import {
  emitWorkspaceNovelSelected,
  WORKSPACE_NOVEL_SELECTED_EVENT,
  type WorkspaceNovelSelectedDetail,
} from '@/shared/events/workspaceEvents';
import { recordWritingWords } from '@/shared/stats/writingStats';
import { readJsonValue, writeJsonValue } from '@/shared/storage/jsonStorage';

export const NOVELS_KEY = 'xinyuexia_novels_v1';
export const CURRENT_ID_KEY = 'xinyuexia_current_novel_id';
export const VOLUMES_KEY = 'xinyuexia_volumes_v1';
export const RECYCLED_CHAPTERS_KEY = 'xinyuexia_recycled_chapters_v1';
export const SORT_KEY = 'xinyuexia_workbench_sort_asc';

export function readJson<T>(key: string, fallback: T, normalize?: (value: unknown) => T): T {
  return readJsonValue(key, fallback, normalize);
}

export function writeJson<T>(key: string, value: T) {
  cancelScheduledWorkbenchJsonWrite(key);
  writeJsonValue(key, value);
}

export function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function getChapterContentKey(novelId: number, chapterId: number) {
  return `xinyuexia_novel_${novelId}_chapter_${chapterId}`;
}

export function readChapterContent(novelId: number, chapterId: number) {
  return localStorage.getItem(getChapterContentKey(novelId, chapterId)) ?? '';
}

export function writeChapterContent(novelId: number, chapterId: number, content: string) {
  localStorage.setItem(getChapterContentKey(novelId, chapterId), content);
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('zh-CN');
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toChineseNumber(value: number) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (value <= 10) return value === 10 ? '十' : digits[value];
  if (value < 20) return `十${digits[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones === 0 ? `${digits[tens]}十` : `${digits[tens]}十${digits[ones]}`;
}

export function normalizeNumber(value: unknown, fallback: number) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function normalizeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function normalizeWorkbenchNovels(value: unknown): WorkbenchNovel[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Partial<WorkbenchNovel> => typeof item === 'object' && item !== null)
    .map((item, index) => ({
      id: normalizeNumber(item.id, index + 1),
      title: normalizeString(item.title, `作品${index + 1}`),
      type: item.type === 'script' ? 'script' : 'novel',
      ...(typeof item.category === 'string' ? { category: item.category } : {}),
      ...(item.channel === 'male' || item.channel === 'female' ? { channel: item.channel } : {}),
      ...(typeof item.synopsis === 'string' ? { synopsis: item.synopsis } : {}),
      ...(typeof item.cover === 'string' ? { cover: item.cover } : {}),
      ...(item.creationStatus === 'planning' || item.creationStatus === 'serializing' || item.creationStatus === 'completed'
        ? { creationStatus: item.creationStatus }
        : {}),
      ...(typeof item.targetWordCount === 'number' && Number.isFinite(item.targetWordCount)
        ? { targetWordCount: Math.max(0, item.targetWordCount) }
        : {}),
      ...(typeof item.wordCount === 'number' ? { wordCount: item.wordCount } : {}),
      ...(typeof item.createdAt === 'string' ? { createdAt: item.createdAt } : {}),
      ...(typeof item.lastModifiedAt === 'string' ? { lastModifiedAt: item.lastModifiedAt } : {}),
    }));
}

export function normalizeChapter(value: unknown, index: number): Chapter | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<Chapter>;
  return {
    id: normalizeNumber(item.id, Date.now() + index),
    title: normalizeString(item.title),
    serialNumber: Math.max(1, normalizeNumber(item.serialNumber, index + 1)),
    wordCount: Math.max(0, normalizeNumber(item.wordCount, 0)),
    isSelected: item.isSelected === true,
    ...(typeof item.isPublished === 'boolean' ? { isPublished: item.isPublished } : {}),
  };
}

export function normalizeVolume(value: unknown, index: number): Volume | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<Volume>;
  const chapters = Array.isArray(item.chapters)
    ? item.chapters
        .map((chapter, chapterIndex) => normalizeChapter(chapter, chapterIndex))
        .filter((chapter): chapter is Chapter => Boolean(chapter))
    : [];
  return {
    id: normalizeNumber(item.id, Date.now() + index),
    name: normalizeString(item.name, `卷${index + 1}`),
    isExpanded: item.isExpanded !== false,
    chapters,
  };
}

export function normalizeWorkbenchVolumeMap(value: unknown): Record<number, Volume[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([novelId, volumes]) => [
        Number(novelId),
        Array.isArray(volumes)
          ? volumes
              .map((volume, index) => normalizeVolume(volume, index))
              .filter((volume): volume is Volume => Boolean(volume))
          : [],
      ])
      .filter(([novelId]) => Number.isFinite(novelId)),
  ) as Record<number, Volume[]>;
}

export function normalizeRecycledChapter(value: unknown, index: number): RecycledChapter | null {
  const chapter = normalizeChapter(value, index);
  if (!chapter || !value || typeof value !== 'object') return null;
  const item = value as Partial<RecycledChapter>;
  return {
    ...chapter,
    volumeId: normalizeNumber(item.volumeId, 0),
    volumeName: normalizeString(item.volumeName),
    deletedAt: normalizeString(item.deletedAt),
    expireAt: normalizeString(item.expireAt),
    content: normalizeString(item.content),
  };
}

export function normalizeWorkbenchRecycledMap(value: unknown): Record<number, RecycledChapter[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([novelId, chapters]) => [
        Number(novelId),
        Array.isArray(chapters)
          ? chapters
              .map((chapter, index) => normalizeRecycledChapter(chapter, index))
              .filter((chapter): chapter is RecycledChapter => Boolean(chapter))
          : [],
      ])
      .filter(([novelId]) => Number.isFinite(novelId)),
  ) as Record<number, RecycledChapter[]>;
}

export function normalizeVolumeNames(volumesMap: Record<number, Volume[]>) {
  let changed = false;
  const next = Object.fromEntries(
    Object.entries(volumesMap).map(([novelId, volumes]) => [
      novelId,
      volumes.map((volume, index) => {
        if (volume.name === '集纲') return volume;
        if (/^第.+卷$/.test(volume.name)) return volume;
        if (/^第\d+卷$/.test(volume.name)) {
          const number = Number(volume.name.replace(/\D/g, ''));
          changed = true;
          return { ...volume, name: `第${toChineseNumber(number)}卷` };
        }
        if (index === 0 && volume.chapters.some((chapter) => chapter.title.startsWith('集纲'))) {
          changed = true;
          return { ...volume, name: '集纲' };
        }
        return volume;
      }),
    ]),
  ) as Record<number, Volume[]>;

  if (changed) writeJson(VOLUMES_KEY, next);
  return next;
}

export function createDefaultVolumes(type: WorkbenchNovel['type'] = 'novel'): Volume[] {
  const chapterId = uid();
  if (type === 'script') {
    return [
      {
        id: uid(),
        name: '集纲',
        isExpanded: true,
        chapters: [
          {
            id: chapterId,
            title: '集纲1',
            serialNumber: 1,
            wordCount: 0,
            isSelected: true,
            isPublished: false,
          },
        ],
      },
      { id: uid(), name: '第一卷', isExpanded: true, chapters: [] },
      { id: uid(), name: '第二卷', isExpanded: true, chapters: [] },
      { id: uid(), name: '第三卷', isExpanded: true, chapters: [] },
    ];
  }

  return [
    {
      id: uid(),
      name: '第一卷',
      isExpanded: true,
      chapters: [
        {
          id: chapterId,
          title: '',
          serialNumber: 1,
          wordCount: 0,
          isSelected: true,
          isPublished: false,
        },
      ],
    },
  ];
}
