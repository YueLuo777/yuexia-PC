export type WorkbenchAiRequestTagPolicy = {
  id: string;
  label: string;
  useXmlTags: boolean;
  reason: string;
  tags: string[];
};

export const WORKBENCH_AI_REQUEST_TAG_POLICIES: WorkbenchAiRequestTagPolicy[] = [
  {
    id: 'brainstorm',
    label: '脑洞',
    useXmlTags: false,
    reason: '脑洞生成已经由题材、背景、金手指、要求等固定问题组成，材料和指令不容易混淆。',
    tags: [],
  },
  {
    id: 'outline',
    label: '大纲',
    useXmlTags: true,
    reason: '大纲会同时发送当前设定、关联脑洞和修改要求，需要区分待处理材料、参考材料和用户指令。',
    tags: ['待处理设定', '关联脑洞', '修改要求'],
  },
  {
    id: 'detailOutline',
    label: '章纲',
    useXmlTags: true,
    reason: '章纲会混合设定资料、角色资料、前文章纲和本章要求，需要清楚区分参考材料和用户指令。',
    tags: ['关联资料', '设定资料', '角色资料', '前文章纲', '本章要求'],
  },
  {
    id: 'body',
    label: '正文',
    useXmlTags: true,
    reason:
      '正文生成会同时读取章纲、前文正文、前文梗概、关联设定和写作要求，标签能让 AI 明确哪些是上下文、哪些是任务。',
    tags: ['本章章纲', '前文正文', '前文梗概', '关联设定', '写作要求'],
  },
  {
    id: 'audit',
    label: '审核',
    useXmlTags: true,
    reason: '审核需要把待审核正文和审核标准分开，避免 AI 把要求写进正文或把正文当说明。',
    tags: ['待审核正文', '关联章纲', '审核要求'],
  },
  {
    id: 'comment',
    label: '综合点评',
    useXmlTags: true,
    reason: '点评需要区分待点评正文、章纲参考和点评维度，标签能让输出更聚焦。',
    tags: ['待点评正文', '关联章纲', '点评要求'],
  },
  {
    id: 'polish',
    label: '润色',
    useXmlTags: true,
    reason: '润色会修改正文表达，必须明确待润色正文和润色要求，避免改剧情或丢失原文边界。',
    tags: ['待润色正文', '关联章纲', '润色要求'],
  },
  {
    id: 'status',
    label: '更新状态',
    useXmlTags: true,
    reason: '状态更新会从正文中提取角色变化，并可能参考已有状态，需要明确提取来源和更新目标。',
    tags: ['待提取正文', '已有状态', '状态更新要求'],
  },
  {
    id: 'summary',
    label: '生成梗概',
    useXmlTags: true,
    reason: '梗概需要明确待梗概正文和梗概要求，避免把用户要求或前文说明混入梗概正文。',
    tags: ['待梗概正文', '梗概要求'],
  },
];

export function escapeAiRequestTagAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function wrapAiRequestTag(
  tagName: string,
  content: string,
  attributes?: Record<string, string>,
  options?: { preserveLeadingWhitespace?: boolean },
) {
  const text = options?.preserveLeadingWhitespace ? content.trimEnd() : content.trim();
  if (!text.trim()) return '';
  const attrs = attributes
    ? Object.entries(attributes)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => ` ${key}="${escapeAiRequestTagAttribute(value.trim())}"`)
        .join('')
    : '';
  return `<${tagName}${attrs}>\n${text}\n</${tagName}>`;
}

export function joinAiRequestSections(sections: string[]) {
  return sections
    .map((section) => section.trim())
    .filter(Boolean)
    .join('\n\n');
}
