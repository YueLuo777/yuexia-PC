import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  Heart,
  MessageSquare,
  Palette,
  Search,
  Settings,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { colorSamples, fontSamples, techItems, uiSamples } from './softwareUiCatalogData';
import { NumberPill, SectionTitle, TechDictionaryCard } from './softwareUiCatalogComponents';
import {
  DEFAULT_UI_SPECS,
  getBaseSpecs,
  NumberSpecInput,
  readUiSpecDefaults,
  RenderSpecPreview,
  SpecPill,
  writeUiSpecDefaults,
} from './softwareUiCatalogSpecs';
import {
  CATALOG_CONTENT_COLLAPSED_STORAGE_KEY,
  CATALOG_NAV_COLLAPSED_STORAGE_KEY,
  DEFAULT_CATALOG_COLLECTION_IDS,
  readCatalogCollection,
  readCatalogMarks,
  readCollapsedRecord,
  writeCatalogCollection,
  writeCatalogMarks,
  writeCollapsedRecord,
} from './softwareUiCatalogStorage';
import type { CatalogMark } from './softwareUiCatalogStorage';
import type { ColorSample, FontSample, TechItem, UiSample, UiSpecs } from './softwareUiCatalogTypes';
import { renderSoftwareUiCatalogPageView } from './SoftwareUiCatalogPageView';

type CatalogTab = 'ui' | 'manual' | 'tech' | 'collection';

const LANDING_PREVIEW_SELECTED_IDS = ['UI-119', 'UI-112', 'UI-102', 'UI-109', 'UI-115', 'UI-125', 'UI-132'];

const MANUAL_UI_TYPE_ORDER = ['Button', 'Switch', 'Checkbox', 'Input', 'Radio', 'Card', 'Loader', '其他'] as const;

function getManualUiType(item: UiSample) {
  if (item.id === 'UI-102') return 'Radio';
  const matchedType = MANUAL_UI_TYPE_ORDER.find((type) => type !== '其他' && item.name.includes(type));
  return matchedType ?? '其他';
}

type SoftwareUiCatalogPageProps = {
  embedded?: boolean;
  onClose?: () => void;
};

export function SoftwareUiCatalogPage({ embedded = false, onClose }: SoftwareUiCatalogPageProps = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CatalogTab>('ui');
  const [collapsedCatalogNavGroups, setCollapsedCatalogNavGroups] = useState<Record<string, boolean>>(() =>
    readCollapsedRecord(CATALOG_NAV_COLLAPSED_STORAGE_KEY),
  );
  const [collapsedCatalogContentGroups, setCollapsedCatalogContentGroups] = useState<Record<string, boolean>>(() =>
    readCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, { manual: true }),
  );
  const [catalogSearch, setCatalogSearch] = useState('');
  const [uiSpecDefaults, setUiSpecDefaults] = useState<Record<string, Partial<UiSpecs>>>(() => readUiSpecDefaults());
  const [uiSpecOverrides, setUiSpecOverrides] = useState<Record<string, Partial<UiSpecs>>>({});
  const [activeSpecItemId, setActiveSpecItemId] = useState<string | null>(null);
  const [catalogMarks, setCatalogMarks] = useState<Record<string, CatalogMark>>(() => readCatalogMarks());
  const [catalogCollection, setCatalogCollection] = useState<Record<string, boolean>>(() => readCatalogCollection());
  const normalizedSearch = catalogSearch.trim().toLowerCase();
  const matchesCatalogSearch = (parts: Array<string | undefined>) => {
    if (!normalizedSearch) return true;
    return parts.some((part) => part?.toLowerCase().includes(normalizedSearch));
  };
  const filteredFontSamples = fontSamples.filter((item) =>
    matchesCatalogSearch([item.id, item.name, item.usage, item.sample]),
  );
  const filteredColorSamples = colorSamples.filter((item) =>
    matchesCatalogSearch([item.id, item.name, item.usage, item.value]),
  );
  const manualUiSamples = uiSamples.filter((item) => item.id === 'UI-102' || item.group === '手动上传');
  const landingPreviewSamples = LANDING_PREVIEW_SELECTED_IDS.map((id) =>
    manualUiSamples.find((item) => item.id === id),
  ).filter((item): item is UiSample => Boolean(item));
  const filteredManualUiSamples = manualUiSamples.filter((item) =>
    matchesCatalogSearch([item.id, item.name, item.group, item.usage]),
  );
  const filteredLandingPreviewSamples = landingPreviewSamples.filter((item) =>
    matchesCatalogSearch([item.id, item.name, item.group, item.usage, 'UI 落地预览 已勾选']),
  );
  const manualUiGroups = MANUAL_UI_TYPE_ORDER.map((type) => ({
    type,
    items: filteredManualUiSamples.filter((item) => getManualUiType(item) === type),
  })).filter((group) => group.items.length > 0);
  const standardUiSamples = uiSamples.filter((item) => item.id !== 'UI-102' && item.group !== '手动上传');
  const filteredStandardUiSamples = standardUiSamples.filter((item) =>
    matchesCatalogSearch([item.id, item.name, item.group, item.usage]),
  );
  const filteredTechItems = techItems.filter((item) =>
    matchesCatalogSearch([item.id, item.name, item.plain, item.tech]),
  );
  const collectedFontSamples = fontSamples.filter(
    (item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.usage, item.sample]),
  );
  const collectedColorSamples = colorSamples.filter(
    (item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.usage, item.value]),
  );
  const collectedStandardUiSamples = standardUiSamples.filter(
    (item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.group, item.usage]),
  );
  const collectedManualUiSamples = manualUiSamples.filter(
    (item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.group, item.usage]),
  );
  const collectedTechItems = techItems.filter(
    (item) => catalogCollection[item.id] && matchesCatalogSearch([item.id, item.name, item.plain, item.tech]),
  );
  const collectedCatalogItems = useMemo(() => {
    const matchesCollectionSearch = (parts: Array<string | undefined>) => {
      if (!normalizedSearch) return true;
      return parts.some((part) => part?.toLowerCase().includes(normalizedSearch));
    };
    const collectedStandardSamples = uiSamples.filter(
      (item) =>
        item.id !== 'UI-102' &&
        item.group !== '手动上传' &&
        catalogCollection[item.id] &&
        matchesCollectionSearch([item.id, item.name, item.group, item.usage]),
    );
    const collectedManualSamples = uiSamples.filter(
      (item) =>
        (item.id === 'UI-102' || item.group === '手动上传') &&
        catalogCollection[item.id] &&
        matchesCollectionSearch([item.id, item.name, item.group, item.usage]),
    );

    return [
      ...fontSamples
        .filter(
          (item) =>
            catalogCollection[item.id] && matchesCollectionSearch([item.id, item.name, item.usage, item.sample]),
        )
        .map((item) => ({ id: item.id, label: item.name, group: '字体设置', tab: 'collection' as CatalogTab })),
      ...colorSamples
        .filter(
          (item) => catalogCollection[item.id] && matchesCollectionSearch([item.id, item.name, item.usage, item.value]),
        )
        .map((item) => ({ id: item.id, label: item.name, group: '颜色记录', tab: 'collection' as CatalogTab })),
      ...collectedStandardSamples.map((item) => ({
        id: item.id,
        label: item.name,
        group: item.group,
        tab: 'collection' as CatalogTab,
      })),
      ...collectedManualSamples.map((item) => ({
        id: item.id,
        label: item.name,
        group: getManualUiType(item),
        tab: 'collection' as CatalogTab,
      })),
      ...techItems
        .filter(
          (item) => catalogCollection[item.id] && matchesCollectionSearch([item.id, item.name, item.plain, item.tech]),
        )
        .map((item) => ({ id: item.id, label: item.name, group: '技术词典', tab: 'collection' as CatalogTab })),
    ];
  }, [catalogCollection, normalizedSearch]);
  const collectedTotalCount = collectedCatalogItems.length;
  const groups = Array.from(new Set(filteredStandardUiSamples.map((item) => item.group)));
  const catalogNavItems = useMemo(() => {
    if (normalizedSearch) {
      return [
        ...filteredFontSamples.map((item) => ({
          id: item.id,
          label: item.name,
          group: '字体设置',
          tab: 'ui' as CatalogTab,
        })),
        ...filteredColorSamples.map((item) => ({
          id: item.id,
          label: item.name,
          group: '颜色记录',
          tab: 'ui' as CatalogTab,
        })),
        ...filteredStandardUiSamples.map((item) => ({
          id: item.id,
          label: item.name,
          group: item.group,
          tab: 'ui' as CatalogTab,
        })),
        ...filteredManualUiSamples.map((item) => ({
          id: item.id,
          label: item.name,
          group: getManualUiType(item),
          tab: 'ui' as CatalogTab,
        })),
        ...filteredTechItems.map((item) => ({
          id: item.id,
          label: item.name,
          group: '技术词典',
          tab: 'tech' as CatalogTab,
        })),
      ];
    }
    if (activeTab === 'tech') {
      return filteredTechItems.map((item) => ({
        id: item.id,
        label: item.name,
        group: '技术词典',
        tab: 'tech' as CatalogTab,
      }));
    }
    if (activeTab === 'collection') {
      return collectedCatalogItems;
    }
    return [
      ...filteredFontSamples.map((item) => ({
        id: item.id,
        label: item.name,
        group: '字体设置',
        tab: 'ui' as CatalogTab,
      })),
      ...filteredColorSamples.map((item) => ({
        id: item.id,
        label: item.name,
        group: '颜色记录',
        tab: 'ui' as CatalogTab,
      })),
      ...filteredStandardUiSamples.map((item) => ({
        id: item.id,
        label: item.name,
        group: item.group,
        tab: 'ui' as CatalogTab,
      })),
      ...filteredManualUiSamples.map((item) => ({
        id: item.id,
        label: item.name,
        group: getManualUiType(item),
        tab: 'ui' as CatalogTab,
      })),
    ];
  }, [
    activeTab,
    collectedCatalogItems,
    filteredColorSamples,
    filteredFontSamples,
    filteredManualUiSamples,
    filteredStandardUiSamples,
    filteredTechItems,
    normalizedSearch,
  ]);

  const catalogNavGroups = useMemo(() => {
    const groupMap = new Map<string, typeof catalogNavItems>();
    catalogNavItems.forEach((item) => {
      const groupLabel = item.group === '按钮' ? '按钮样式' : item.group;
      groupMap.set(groupLabel, [...(groupMap.get(groupLabel) ?? []), item]);
    });
    return Array.from(groupMap.entries()).map(([title, items]) => ({ title, items }));
  }, [catalogNavItems]);

  const toggleCatalogNavGroup = (title: string) => {
    setCollapsedCatalogNavGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      writeCollapsedRecord(CATALOG_NAV_COLLAPSED_STORAGE_KEY, next);
      return next;
    });
  };

  const toggleCatalogContentGroup = (key: string) => {
    setCollapsedCatalogContentGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      writeCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, next);
      return next;
    });
  };

  const scrollToCatalogItem = (id: string, tab: CatalogTab) => {
    let shouldDeferScroll = false;
    if (manualUiSamples.some((item) => item.id === id)) {
      setCollapsedCatalogContentGroups((prev) => {
        if (prev.manual === false) return prev;
        shouldDeferScroll = true;
        const next = { ...prev, manual: false };
        writeCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, next);
        return next;
      });
    }
    const standardItem = standardUiSamples.find((item) => item.id === id);
    if (standardItem && collapsedCatalogContentGroups[standardItem.group]) {
      shouldDeferScroll = true;
      setCollapsedCatalogContentGroups((prev) => {
        const next = { ...prev, [standardItem.group]: false };
        writeCollapsedRecord(CATALOG_CONTENT_COLLAPSED_STORAGE_KEY, next);
        return next;
      });
    }
    const scroll = () =>
      document.getElementById(`catalog-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (activeTab !== tab) {
      setActiveTab(tab);
      window.setTimeout(scroll, 0);
      return;
    }
    if (shouldDeferScroll) {
      window.setTimeout(scroll, 0);
      return;
    }
    scroll();
  };

  const updateUiSpec = (id: string, key: keyof UiSpecs, value: number) => {
    setUiSpecOverrides((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const restoreUiSpecDefault = (id: string) => {
    setUiSpecOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveUiSpecDefault = (id: string, specs: UiSpecs) => {
    const next = { ...uiSpecDefaults, [id]: specs };
    setUiSpecDefaults(next);
    writeUiSpecDefaults(next);
    restoreUiSpecDefault(id);
  };

  const setCatalogMark = (id: string, mark: CatalogMark) => {
    setCatalogMarks((prev) => {
      const next = { ...prev };
      if (next[id] === mark) delete next[id];
      else next[id] = mark;
      writeCatalogMarks(next);
      return next;
    });
  };

  const toggleCatalogCollection = (id: string) => {
    setCatalogCollection((prev) => {
      const next = { ...prev };
      if (next[id]) {
        if (DEFAULT_CATALOG_COLLECTION_IDS.includes(id)) next[id] = false;
        else delete next[id];
      } else next[id] = true;
      writeCatalogCollection(next);
      return next;
    });
  };

  const renderCollectionButton = (id: string) => {
    const isCollected = Boolean(catalogCollection[id]);
    return (
      <button
        type="button"
        onClick={() => toggleCatalogCollection(id)}
        className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-black transition-colors ${
          isCollected
            ? 'border-rose-200 bg-rose-50 text-rose-500'
            : 'border-slate-200 bg-white text-slate-400 hover:text-rose-500'
        }`}
        title={isCollected ? '取消收藏' : '收藏'}
      >
        <Heart className={`h-3 w-3 ${isCollected ? 'fill-current' : ''}`} />
        收藏
      </button>
    );
  };

  const renderMarkControls = (id: string) => {
    const mark = catalogMarks[id];
    return (
      <div className="flex shrink-0 items-center gap-1">
        {renderCollectionButton(id)}
        <button
          type="button"
          onClick={() => setCatalogMark(id, 'rare')}
          className={`h-7 rounded-full border px-2 text-[11px] font-black transition-colors ${
            mark === 'rare'
              ? 'border-slate-300 bg-slate-100 text-slate-600'
              : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
          }`}
          title="标记为不常用"
        >
          不常用
        </button>
      </div>
    );
  };

  const activeSpecItem = activeSpecItemId ? standardUiSamples.find((item) => item.id === activeSpecItemId) : undefined;
  const activeSpecs = activeSpecItem
    ? {
        ...getBaseSpecs(activeSpecItem),
        ...(uiSpecDefaults[activeSpecItem.id] ?? {}),
        ...(uiSpecOverrides[activeSpecItem.id] ?? {}),
      }
    : null;

  return renderSoftwareUiCatalogPageView({
    ArrowLeft,
    Check,
    ChevronDown,
    ChevronRight,
    Code2,
    Heart,
    MessageSquare,
    NumberPill,
    NumberSpecInput,
    Palette,
    RenderSpecPreview,
    Search,
    SectionTitle,
    Settings,
    Sparkles,
    SpecPill,
    TechDictionaryCard,
    Type,
    X,
    activeSpecItem,
    activeSpecs,
    activeTab,
    catalogNavGroups,
    catalogNavItems,
    catalogSearch,
    collapsedCatalogContentGroups,
    collapsedCatalogNavGroups,
    collectedColorSamples,
    collectedFontSamples,
    collectedManualUiSamples,
    collectedStandardUiSamples,
    collectedTechItems,
    collectedTotalCount,
    embedded,
    filteredColorSamples,
    filteredFontSamples,
    filteredLandingPreviewSamples,
    filteredManualUiSamples,
    filteredStandardUiSamples,
    filteredTechItems,
    getBaseSpecs,
    getManualUiType,
    groups,
    manualUiGroups,
    navigate,
    onClose,
    renderCollectionButton,
    renderMarkControls,
    restoreUiSpecDefault,
    saveUiSpecDefault,
    scrollToCatalogItem,
    setActiveSpecItemId,
    setActiveTab,
    setCatalogSearch,
    toggleCatalogContentGroup,
    toggleCatalogNavGroup,
    uiSpecDefaults,
    uiSpecOverrides,
    updateUiSpec,
  });
}
