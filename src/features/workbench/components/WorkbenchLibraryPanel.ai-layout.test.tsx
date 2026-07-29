import { beforeEach, describe, expect, it } from 'vitest';
import {
  readWorkbenchLibraryPanelSource,
  readAiRequestLogGroupsSource,
  readAiRequestLogModalLayoutSource,
  readModelHookSource,
  readChapterEditorSource,
  readWorkbenchAiPanelSource,
} from './WorkbenchLibraryPanel.testUtils';

describe('WorkbenchLibraryPanel AI and shared layout contracts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps production AI output boxes running through background tasks', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const aiPanelSource = await readWorkbenchAiPanelSource();
    const chapterEditorSource = await readChapterEditorSource();

    expect(panelSource).toContainSource("target: 'workbenchLibraryAi'");
    expect(panelSource).toContainSource("target: 'workbenchOutlineAi'");
    expect(panelSource).toContainSource('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(panelSource).toContainSource('stopBackgroundAiTask');
    expect(panelSource).not.toContainSource('libraryAiAbortRef');

    expect(aiPanelSource).toContainSource("target: 'workbenchAiPanel'");
    expect(aiPanelSource).toContainSource('backgroundTaskId?: string');
    expect(aiPanelSource).toContainSource('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(aiPanelSource).not.toContainSource('abortControllerRef.current?.abort()');

    expect(chapterEditorSource).toContainSource("target: 'chapterReview'");
    expect(chapterEditorSource).toContainSource('writeReviewBackgroundTaskId');
    expect(chapterEditorSource).toContainSource('subscribeBackgroundAiTasks(syncBackgroundTasks)');
    expect(chapterEditorSource).not.toContainSource('reviewAiAbortRef');
  });

  it('keeps workbench model selects synchronized after model management changes', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const chapterEditorSource = await readChapterEditorSource();
    const modelHookSource = await readModelHookSource();

    expect(panelSource).toContainSource("import { useModels } from '@/features/models/hooks/useModels';");
    expect(panelSource).toContainSource('const { models: modelSnapshot } = useModels();');
    expect(panelSource).toContainSource(
      'const models = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);',
    );
    expect(panelSource).not.toContainSource("import { readModelSnapshot } from '@/features/models/hooks/useModels';");
    expect(panelSource).not.toContainSource(
      'const models = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);',
    );
    expect(chapterEditorSource).toContainSource("import { useModels } from '@/features/models/hooks/useModels';");
    expect(chapterEditorSource).toContainSource('const { models: modelSnapshot } = useModels();');
    expect(chapterEditorSource).toContainSource(
      'const reviewModels = useMemo(() => modelSnapshot.filter((model) => model.enabled), [modelSnapshot]);',
    );
    expect(chapterEditorSource).not.toContainSource(
      "import { readModelSnapshot } from '@/features/models/hooks/useModels';",
    );
    expect(chapterEditorSource).not.toContainSource(
      'const reviewModels = useMemo(() => readModelSnapshot().filter((model) => model.enabled), []);',
    );
    expect(modelHookSource).not.toContainSource('function syncEnvModel');
    expect(modelHookSource).not.toContainSource('import.meta.env.VITE_PINAI_API_KEY');
    expect(modelHookSource).toContainSource(
      'function writeModels(models: ModelItem[], options: { notify?: boolean } = {})',
    );
    expect(modelHookSource).toContainSource(
      'if (options.notify !== false) window.dispatchEvent(new CustomEvent(APP_EVENTS.modelsUpdated));',
    );
    expect(modelHookSource).toContainSource('if (!raw) return [];');
    expect(modelHookSource).toContainSource('writeModels(models, { notify: false });');
  });

  it('removes AI dialogue labels from library generator output cards', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();

    expect(panelSource).not.toContainSource('AI对话框');
  });

  it('can switch the library AI request log between titled sections and plain concatenated content', async () => {
    const panelSource = await readWorkbenchLibraryPanelSource();
    const logGroupsSource = await readAiRequestLogGroupsSource();
    const logLayoutSource = await readAiRequestLogModalLayoutSource();
    const settingRequestStart = panelSource.indexOf(
      'const buildSettingLibraryRequestText = (promptText: string, userText: string) => {',
    );
    const settingRequestEnd = panelSource.indexOf(
      'const buildLibraryAiRequestPayload = (text: string, overrideText?: string) => {',
      settingRequestStart,
    );
    const settingRequestSource = panelSource.slice(settingRequestStart, settingRequestEnd);

    expect(panelSource).toContainSource("import type { AiRequestLogGroup } from '@/shared/ui/AiRequestLogGroups';");
    expect(panelSource).toContainSource(
      "import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';",
    );
    expect(panelSource).toContainSource('export function buildRequestLogPlainPreview(groups: AiRequestLogGroup[])');
    expect(panelSource).toContainSource(".join('\\n\\n');");
    expect(panelSource).toContainSource('const [showLibraryAiLogTitles, setShowLibraryAiLogTitles] = useState(true);');
    expect(panelSource).toContainSource('const visibleAiRequestLogGroups = visibleAiRequestLog');
    expect(panelSource).toContainSource('function formatBrainstormReferenceForAi(title: string, text: string)');
    expect(panelSource).toContainSource('【参考资料开始：用户关联脑洞】');
    expect(panelSource).toContainSource(
      '注意：以下内容只是参考资料，不是输出格式，不要照抄标签，不要为它单独生成设定，不要输出本段任何标签。',
    );
    expect(panelSource).toContainSource('资料类型：脑洞');
    expect(panelSource).toContainSource('`资料标题：${safeTitle}`');
    expect(panelSource).toContainSource('【参考资料结束：用户关联脑洞】');
    expect(panelSource).toContainSource('function formatSettingLinkedContextForAi');
    expect(panelSource).toContainSource(
      "if (context.source === 'brainstorm') return formatBrainstormReferenceForAi(context.title, context.text);",
    );
    expect(panelSource).toContainSource("usage: '本次处理对象' | '参考资料';");
    expect(panelSource).toContainSource("'<关联设定>'");
    expect(panelSource).toContainSource('`<设定 用途="${item.usage}" 路径="${path}">`');
    expect(panelSource).toContainSource('function formatSettingLinkedContextForDisplay');
    expect(panelSource).not.toContainSource("wrapAiRequestTag('待处理设定'");
    expect(panelSource).not.toContainSource("wrapAiRequestTag('关联脑洞'");
    expect(panelSource).toContainSource('function formatSettingUserRequirementForAi');
    expect(panelSource).toContainSource("return wrapAiRequestTag('修改要求', text);");
    expect(settingRequestSource).toContainSource(
      'const linkedSettingContext = buildSettingLinkedContextPayload(getActiveLinkedSettingSnapshot()).aiText;',
    );
    expect(panelSource).toContainSource(
      'const linkedSettingWordCount = countSettingLinkedContextWords(currentLinkedSettingContext);',
    );
    expect(panelSource).toContainSource(
      'contextWordCount: hasLinkedSettingContext ? linkedSettingPayload.wordCount : 0,',
    );
    expect(panelSource).not.toContainSource(
      "contextWordCount: countTextWords(hasLinkedSettingContext ? linkedSettingContext.text : ''),",
    );
    expect(panelSource).toContainSource(
      "contextText: hasLinkedSettingContext ? linkedSettingPayload.displayText : '',",
    );
    expect(settingRequestSource).toContainSource(
      'const userRequirement = formatSettingUserRequirementForAi(userText);',
    );
    expect(settingRequestSource).not.toContainSource("'【其他要求】'");
    expect(settingRequestSource).not.toContainSource("'【用户要求】'");
    expect(panelSource).toContainSource(
      'userContent: activeTab === SETTING_TAB && overrideText === undefined ? settingUserRequirementForAi : requestText',
    );
    expect(panelSource).toContainSource(
      "userTitle: activeTab === SETTING_TAB ? '修改要求' : activeIsBrainstorm ? '其他要求' : undefined",
    );
    expect(panelSource).toContainSource("userTextTitle={activeTab === SETTING_TAB ? '修改要求' : '其他要求'}");
    expect(panelSource).toContainSource(
      'const visibleAiRequestLogPlainPreview = buildRequestLogPlainPreview(visibleAiRequestLogGroups);',
    );
    expect(panelSource).toContainSource('checked={showLibraryAiLogTitles}');
    expect(panelSource).toContainSource('onShowLibraryAiLogTitlesChange={setShowLibraryAiLogTitles}');
    expect(panelSource).toContainSource('onChange={(event) => onShowLibraryAiLogTitlesChange(event.target.checked)}');
    expect(panelSource).toContainSource('<span>显示标题内容</span>');
    expect(panelSource).toContainSource('<AiRequestLogModalLayout');
    expect(panelSource).toContainSource('showGroupedContent={showLibraryAiLogTitles}');
    expect(panelSource).toContainSource('plainPreview={visibleAiRequestLogPlainPreview}');
    expect(logLayoutSource).toContainSource('<AiRequestLogGroups');
    expect(logLayoutSource).toContainSource(
      'plainPreview.trim() ? <AiRequestLogContent content={plainPreview} /> : emptyText',
    );
    expect(logGroupsSource).toContainSource('function isSoftwareLogMarkerLine(line: string)');
    expect(logGroupsSource).toContainSource('export function AiRequestLogContent');
    expect(logGroupsSource).toContainSource('font-black text-red-500');
    expect(logGroupsSource).toContainSource('<AiRequestLogContent content={content} />');
    expect(logGroupsSource).toContainSource('fillSingleGroup = false');
    expect(logGroupsSource).toContainSource('fillGroupId,');
    expect(logGroupsSource).toContainSource('fillLastGroup = false');
    expect(logGroupsSource).toContainSource('fillGroupWeights,');
    expect(logGroupsSource).toContainSource('fillGroupWeights?: Record<string, number>;');
    expect(logGroupsSource).toContainSource(
      'const shouldFillSingleGroup = fillSingleGroup && visibleGroups.length === 1;',
    );
    expect(logGroupsSource).toContainSource(
      'const fillLastGroupIndex = fillLastGroup ? visibleGroups.length - 1 : -1;',
    );
    expect(logGroupsSource).toContainSource(
      'const hasFillGroupWeights = Boolean(fillGroupWeights && Object.keys(fillGroupWeights).length > 0);',
    );
    expect(logGroupsSource).toContainSource(
      'const shouldUseFillLayout = shouldFillSingleGroup || Boolean(fillGroupId) || fillLastGroup || hasFillGroupWeights;',
    );
    expect(logGroupsSource).toContainSource(
      "className={shouldUseFillLayout ? 'flex h-full min-h-0 flex-col gap-3' : 'space-y-3'}",
    );
    expect(logGroupsSource).toContainSource('const fillGroupWeight = fillGroupWeights?.[group.id];');
    expect(logGroupsSource).toContainSource(
      "const shouldFillWeightedGroup = typeof fillGroupWeight === 'number' && fillGroupWeight > 0 && !collapsed;",
    );
    expect(logGroupsSource).toContainSource(
      'const shouldFillGroup = (shouldFillSingleGroup && !collapsed) || (fillGroupId === group.id && !collapsed) || (fillLastGroupIndex === groupIndex && !collapsed) || shouldFillWeightedGroup;',
    );
    expect(logGroupsSource).toContainSource('style={fillGroupStyle}');
    expect(logGroupsSource).toContainSource(
      'ai-request-log-text editor-scrollbar whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 [scrollbar-gutter:stable]',
    );
    expect(logGroupsSource).not.toContainSource(
      'ai-request-log-text editor-scrollbar whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 [scrollbar-gutter:stable] text-xs leading-5',
    );
  });
});
