import {
  buildCurrentSettingLinkSnapshot,
  countSettingLinkedContextWords,
  formatSettingLinkedContextForAi,
  formatSettingLinkedContextForDisplay,
  hasSettingLinkedContext,
  type SettingLinkedContext,
} from './workbenchLibraryRequestLog';

type LinkedSettingEntry = {
  entryId: string;
  source: 'setting' | 'role';
  tabTitle: string;
  groupName: string;
  title: string;
  text: string;
};

type CurrentSettingEntry = {
  id: string;
  title: string;
} | null;

function buildLinkedSettingPath(entry: Pick<LinkedSettingEntry, 'tabTitle' | 'groupName' | 'title'>) {
  return [entry.tabTitle, entry.groupName, entry.title].join('/');
}

export function buildCurrentSettingLinkedContext(options: {
  entry: CurrentSettingEntry;
  body: string;
  source: 'setting' | 'role';
  fallbackPath: string[];
  allEntries: LinkedSettingEntry[];
}): SettingLinkedContext {
  const linkedEntry = options.allEntries.find(
    (entry) => entry.entryId === options.entry?.id && entry.source === options.source,
  );
  const path = linkedEntry ? buildLinkedSettingPath(linkedEntry) : options.fallbackPath.filter(Boolean).join('/');
  return {
    source: 'current',
    ...buildCurrentSettingLinkSnapshot(options.entry, options.body, path),
  };
}

export function buildOtherSettingLinkedContext(entries: LinkedSettingEntry[]): SettingLinkedContext {
  return {
    source: 'other',
    title: entries.length > 0 ? `其他设定 ${entries.length} 项` : '其他设定',
    text: entries.map((entry) => entry.text).filter(Boolean).join('\n\n'),
    items: entries.map((entry) => ({
      usage: '参考资料',
      path: buildLinkedSettingPath(entry),
      text: entry.text,
    })),
  };
}

export function buildSettingLinkedContextPayload(context: SettingLinkedContext) {
  return {
    hasContext: hasSettingLinkedContext(context),
    aiText: formatSettingLinkedContextForAi(context),
    displayText: formatSettingLinkedContextForDisplay(context),
    wordCount: countSettingLinkedContextWords(context),
  };
}
