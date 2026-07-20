import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Copy,
  Folder,
  FileText,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import {
  buildGenreConceptPrompt,
  buildInspirationPrompt,
  createConceptSnapshot,
  createGenreConcept,
  createInspirationConcept,
  getConceptCloudObjectKey,
  parseConceptAiJson,
  readConceptCloudConfig,
  restoreConceptSnapshot,
  useConceptLibrary,
  writeConceptCloudConfig,
} from '@/features/concept-library/hooks/useConceptLibrary';
import type {
  ConceptCloudConfig,
  ConceptKind,
  InspirationConceptItem,
  ConceptLibraryItem,
  ConceptPlatform,
} from '@/features/concept-library/model/conceptLibraryTypes';
import { useModels } from '@/features/models/hooks/useModels';
import { callModel } from '@/features/models/services/callModel';
import type { AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { AppModalShell } from '@/shared/ui/AppModalShell';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';
import { WordCountText } from '@/shared/ui/WordCountText';

export const conceptTabs: Array<{ id: ConceptKind; label: string }> = [
  { id: 'inspiration', label: '灵感' },
  { id: 'genreConcept', label: '题材' },
];

export const platforms: ConceptPlatform[] = ['起点', '番茄', '通用'];

export const genres = ['玄幻', '都市', '仙侠', '科幻'];
export type InspirationSaveMode = 'normal' | 'association' | 'both';
export type ConceptInspirationFieldKey = 'genre' | 'theme' | 'cheat' | 'idea' | 'requirement';
export type ConceptInspirationDraft = Record<ConceptInspirationFieldKey, string>;

export type ConceptAiRequestLog = {
  createdAt: string;
  action: string;
  modelName: string;
  systemPrompt: string;
  userContent: string;
};

export const CONCEPT_INSPIRATION_FIELDS: Array<{
  key: ConceptInspirationFieldKey;
  label: string;
  placeholder: string;
}> = [
  { key: 'genre', label: '题材', placeholder: '如都市、玄幻' },
  { key: 'theme', label: '故事主题', placeholder: '如系统流' },
  { key: 'cheat', label: '主角金手指', placeholder: '如吞噬系统、神豪系统' },
  { key: 'idea', label: '你的构思', placeholder: '任何灵感都可以' },
  { key: 'requirement', label: '补充内容', placeholder: '主角名字、性格、女主设定等' },
];

export const EMPTY_INSPIRATION_DRAFT: ConceptInspirationDraft = {
  genre: '',
  theme: '',
  cheat: '',
  idea: '',
  requirement: '',
};

export interface ConceptLibraryPageProps {
  embedded?: boolean;
}

export function formatTime(value: string) {
  try {
    return new Date(value).toLocaleString('zh-CN');
  } catch {
    return value;
  }
}

export function buildGenreUserContent(platform: ConceptPlatform, genre: string, title: string, rawInput: string) {
  return [
    `平台：${platform}`,
    `类型：${genre}`,
    title.trim() ? `题材标题：${title.trim()}` : '',
    '',
    '题材设定：',
    rawInput.trim(),
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildInspirationUserContent(draft: ConceptInspirationDraft) {
  return CONCEPT_INSPIRATION_FIELDS.map((field) => {
    const value = draft[field.key].trim();
    return value ? `${field.label}：${value}` : '';
  })
    .filter(Boolean)
    .join('\n');
}

export function getInspirationFieldRows(value: string) {
  const rows = value
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(Array.from(line).length / 26)), 0);
  return Math.max(1, rows);
}

export function countTextWords(content: string) {
  return content.replace(/\s/g, '').length;
}

export function getRequestLogMeta(content: string) {
  return `${countTextWords(content)} 字`;
}

export function buildConceptLogGroups(log: ConceptAiRequestLog): AiRequestLogGroup[] {
  return [
    {
      id: 'prompt',
      title: '提示词',
      meta: getRequestLogMeta(log.systemPrompt),
      content: log.systemPrompt,
    },
    {
      id: 'user',
      title: '用户内容',
      meta: getRequestLogMeta(log.userContent),
      content: log.userContent,
      tone: 'amber',
    },
  ];
}

export function getItemDirectory(item: ConceptLibraryItem) {
  return `${item.kind === 'inspiration' ? '灵感' : '题材'} / ${item.category || '待整理'}`;
}

export function getKindLabel(kind: ConceptKind) {
  return kind === 'inspiration' ? '灵感' : '题材';
}

export function stopFormEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export function ConceptCard({ item, onDelete }: { item: ConceptLibraryItem; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [showAssociation, setShowAssociation] = useState(false);
  const association = item.kind === 'inspiration' ? item.association : undefined;
  const copyText = [
    `标题：${item.title}`,
    `目录：${getItemDirectory(item)}`,
    item.summary ? `梗概：${item.summary}` : '',
    item.kind === 'genreConcept' ? `平台：${item.platform} / 类型：${item.genre}` : '',
    '',
    item.content,
    association ? '\nAI 联想版本：' : '',
    association ? `标题：${association.title}` : '',
    association?.summary ? `梗概：${association.summary}` : '',
    association?.content ?? '',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.kind === 'inspiration' ? 'bg-cyan-50 text-cyan-700' : 'bg-violet-50 text-violet-700'}`}
            >
              {item.kind === 'inspiration' ? '灵感' : '题材'}
            </span>
            {item.status === 'pending' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">待整理</span>
            )}
            {item.cloudSyncedAt && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                已云备份
              </span>
            )}
          </div>
          <h2 className="mt-2 break-words text-base font-black leading-6 text-slate-950">{item.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Folder className="h-3.5 w-3.5" />
              {getItemDirectory(item)}
            </span>
            <span>{formatTime(item.updatedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-cyan-200 hover:text-cyan-600"
            title={copied ? '已复制' : '复制'}
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {item.summary && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-600">
          {item.summary}
        </p>
      )}

      {item.kind === 'genreConcept' && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
          <div className="rounded-lg bg-slate-50 px-3 py-2">平台：{item.platform}</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">类型：{item.genre}</div>
        </div>
      )}

      <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{item.content}</div>

      {association && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowAssociation((value) => !value)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 text-xs font-black text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {showAssociation ? '收起 AI 联想' : '查看 AI 联想'}
          </button>
          {showAssociation && (
            <section className="mt-3 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-cyan-700">AI 联想版</span>
                <h3 className="break-words text-sm font-black text-slate-900">{association.title}</h3>
              </div>
              {association.summary && (
                <p className="mt-2 text-sm font-bold leading-6 text-cyan-800">{association.summary}</p>
              )}
              <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {association.content}
              </div>
              {association.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {association.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-cyan-700"
                    >
                      <Tags className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {item.kind === 'genreConcept' && (
        <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
          {item.sellingPoints.length > 0 && (
            <div>
              <span className="font-black text-slate-800">卖点：</span>
              {item.sellingPoints.join('；')}
            </div>
          )}
          {item.audience && (
            <div>
              <span className="font-black text-slate-800">受众：</span>
              {item.audience}
            </div>
          )}
          {item.conflict && (
            <div>
              <span className="font-black text-slate-800">核心冲突：</span>
              {item.conflict}
            </div>
          )}
          {item.openingHook && (
            <div>
              <span className="font-black text-slate-800">开篇钩子：</span>
              {item.openingHook}
            </div>
          )}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500"
            >
              <Tags className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
