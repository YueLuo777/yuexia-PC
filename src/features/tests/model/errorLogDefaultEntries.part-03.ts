import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart3: ErrorLogEntry[] = [
  {
    id: 'editor-paper-baseline-grid-test-preview-001',
    title: '正文稿纸线对齐方案应先用测试页验证字号变化',
    area: '测试集合 / 正文 / 稿纸线',
    symptom:
      '正文稿纸虚线和文字可能重合，用户希望先验证“文字始终坐在虚线上”的基准线方案，并确认改字体大小后是否还能稳定对齐。',
    cause:
      '旧稿纸线按背景图重复绘制，文字按 textarea 字号和倍率行高渲染；字号、字体和缩放变化时，虚线位置和文字行盒容易漂移。',
    solution:
      '新增“正文稿纸线基准对齐测试”页，用 rowHeight=max(字号+20, 字号*2)、baseline=rowHeight-5 计算虚线间距和位置；textarea 行高使用同一个 px rowHeight，并提供 18/22/24px 与滑杆测试字号变化。',
    prevention:
      '正式迁入正文编辑器前，先用测试页验证常用字号和自定义字号下的视觉贴线效果；稿纸线开启时应让虚线间距、背景重复高度和 textarea 行高共用同一套 px 基准。',
    keywords: ['正文', '稿纸线', '虚线', '字号', '行高', 'baseline', 'EditorPaperBaselineGridTestPage'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'workbench-ai-width-test-right-panel-match-production-001',
    title: '右侧 AI 区宽度测试页必须复用正式控件',
    area: '测试集合 / 右侧 AI 区统一宽度切换测试',
    symptom:
      '17号测试页里的右侧 AI 区按钮、输入框、模型/提示词选择和正式页面不一样，导致用户无法通过测试页确认真实页面切换时是否会有体感变化。',
    cause:
      '测试页手写了一套相似 UI，没有复用正式右侧 AI 区使用的 CombinedAiConfigSelect、AiInlineInput、浮动输出框、关联条和底部按钮结构。',
    solution:
      '将 17号测试页右侧 AI 区改为复用正式共享组件和正式 class：模型/提示词用 CombinedAiConfigSelect，输入框用 AiInlineInput，输出框使用 xy-floating-chat-shell，关联条和底部四按钮按正式 WorkbenchAIPanel 结构复刻。',
    prevention:
      '以后做用于验证真实页面体感变化的测试页时，关键区域必须复用正式组件或正式 class；只允许业务内容 mock，不允许按钮、输入框、选择框和布局结构另起一套。',
    keywords: [
      '17号测试',
      '右侧 AI 区',
      '420px',
      'CombinedAiConfigSelect',
      'AiInlineInput',
      'WorkbenchAiWidthUnifiedPreviewTestPage',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'test-collection-prune-removed-tested-paths-001',
    title: '测试页删除后不应残留在已测试记录里',
    area: '测试集合 / 已测试',
    symptom:
      '临时测试页迁入正式页面并从测试集合删除后，如果用户此前勾选过“已测试”，本地已测试记录里仍可能残留旧 path，造成已测试计数或列表状态不干净。',
    cause:
      '已测试状态存放在 localStorage 中，删除测试集合入口只移除了可见卡片和 render 分支，没有主动把旧 path 从本地已测试数组里剪掉。',
    solution:
      '新增 validTestPaths，根据当前 TestCollectionPage 的真实测试入口过滤 readTestedTestPaths；读取时发现无效 path 就回写清理后的数组，并在页面挂载后再次清理当前 state，确保热更新或旧本地状态也会被移除。',
    prevention:
      '以后临时测试页迁入正式功能并删除入口时，要同时把 path/component 加入 TestCollectionDeleteMarkedCleanup.test，并确保已测试记录只保存当前仍存在的测试路径。',
    keywords: ['测试集合', '已测试', '删除测试页', 'localStorage', 'validTestPaths', 'TestCollectionPage'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'prompt-dropdown-connected-style-production-001',
    title: '提示词下拉应像从选择框内向下延伸',
    area: '共享 UI / 模型选择 / 提示词选择 / CapsuleSelect / CombinedAiConfigSelect',
    symptom:
      '测试页确认的提示词下拉衔接方案没有迁入正式页面时，正式模型/提示词下拉仍像外面弹出的独立卡片，和选择框之间的关系不够明确。',
    cause:
      '提示词下拉衔接样式只存在于 PromptDropdownConnectedStyleTestPage；正式 CapsuleSelect 和 CombinedAiConfigSelect 仍使用通用 rounded-xl 独立弹层，缺少贴住底部、去掉上边框、承接下圆角的样式。',
    solution:
      '将测试页方案迁入共享组件：本地 CapsuleSelect 下拉和 CombinedAiConfigSelect 下拉统一使用 top-[calc(100%-2px)]、border-2、border-t-0、#08AACE 边框和下圆角阴影；打开时选择框底部圆角收起并隐藏底边，视觉上像从框内向下延伸。同步删除临时测试页和测试集合入口。',
    prevention:
      '以后视觉测试页确认后，要把样式迁入共享组件并删除临时入口；模型/提示词选择框的下拉层应优先复用这套衔接规则，避免某些页面回到外浮卡片样式。',
    keywords: [
      '提示词下拉',
      '模型下拉',
      '衔接样式',
      'CapsuleSelect',
      'CombinedAiConfigSelect',
      'PromptDropdownConnectedStyleTestPage',
      'TestCollectionPage',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'chapter-editor-paragraph-indent-real-text-001',
    title: '正文段落缩进不应再用整层可见文字覆盖 textarea',
    area: '作品编辑器 / 正文 / 段落缩进',
    symptom:
      '修复段落缩进后，正文编辑区出现部分文字被隐藏；选中文字时，textarea 的选中文本和覆盖层文本同时显示，导致文字重叠。',
    cause:
      '旧方案让 textarea 文本透明，再用 HighlightOverlay 渲染整篇可见文字来模拟每段缩进。覆盖层和 textarea 的换行、选区渲染无法完全一致，选中时浏览器还会显示真实 textarea 文本，于是出现双层文字和遮挡。',
    solution:
      '正文 textarea 始终显示真实文字；开启段落缩进时，通过 applyParagraphIndentToText 给每个非空行写入真实的两个全角空格。HighlightOverlay 只负责高频词高亮，不再渲染整篇可见文字，也移除 xy-wa-editor-paragraph-overlay 的 text-indent 样式。',
    prevention:
      '以后正文 textarea 作为主编辑器时，不要用整篇可见覆盖层模拟排版；需要缩进、排版或清理时优先规范真实文本内容，并确保选中、复制、粘贴和高亮层不会产生双层文字。',
    keywords: [
      '正文',
      '段落缩进',
      'textarea',
      'HighlightOverlay',
      '文字重叠',
      '全角空格',
      'applyParagraphIndentToText',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'disabled-prompt-placeholder-no-check-001',
    title: '无可用提示词占位项不应显示选中勾',
    area: '共享 UI / 提示词选择 / CombinedAiConfigSelect',
    symptom:
      '提示词下拉框没有真实可用提示词时，列表里显示“无可用提示词”，但右侧仍出现选中勾，像是用户已经选中了一个提示词。',
    cause:
      '下拉选中状态只比较 displayedValue 和 option.value；“无可用提示词”占位项的 value 也是空字符串，虽然 disabled，但仍被当作当前显示项渲染选中态。',
    solution:
      'CapsuleSelect 和 CombinedAiConfigSelect 的 selected 判断都增加 !option.disabled，禁用占位项可以显示但不会出现选中底色或右侧勾。',
    prevention:
      '以后处理 fallback/placeholder 选项时，要把“显示用占位”和“真实可选项”分开判断；禁用项即使 value 匹配，也不应渲染为选中项。',
    keywords: ['提示词选择', '无可用提示词', '选中勾', 'disabled', 'CapsuleSelect', 'CombinedAiConfigSelect'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'smart-format-modal-compact-spacing-001',
    title: '智能排版弹窗不应在内容上下留下过大空位',
    area: '作品编辑器 / 正文 / 智能排版',
    symptom: '智能排版弹窗的开关列表上方和底部按钮栏上方留白偏大，视觉上比其他工具弹窗松散，红框区域显得空旷。',
    cause: '弹窗内容区使用 p-5，并且每个开关行使用 py-3；只有两个设置项时，这些内边距会被放大成明显空位。',
    solution:
      '将智能排版内容区改为 px-5 py-3，开关行和底部按钮栏统一收紧到 py-2.5，预览区顶部间距改为 mt-3，让弹窗顶部、列表、底部操作区的节奏更接近。',
    prevention:
      '以后调整小型工具弹窗时，优先按内容数量设置垂直密度；只有少量设置项的弹窗不要直接套用大表单的 p-5 / py-3 间距，并用源代码断言锁定智能排版弹窗的紧凑间距。',
    keywords: ['智能排版', '弹窗', '留白', '间距', 'EditorToolModals', 'ToggleRow'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'chapter-editor-paragraph-indent-overlay-001',
    title: '正文段落缩进不应只缩进整篇第一行',
    area: '作品编辑器 / 正文 / 段落缩进',
    symptom: '正文开启段落缩进后，只有第一段第一行缩进两格，后续段落没有缩进。',
    cause:
      '正文编辑区把 textIndent 直接设置在 textarea 上。textarea 是单个文本控件，不是按段落渲染的 HTML 内容，CSS text-indent 只会作用于整个控件的第一行。',
    solution:
      '去掉 textarea 上的 textIndent；开启段落缩进时让 textarea 文字透明、保留光标颜色，并由 HighlightOverlay 渲染可见文字。覆盖层按换行拆成多个 block span，再通过 .xy-wa-editor-paragraph-overlay > span 设置 text-indent: 2em，让每个段落都独立缩进。',
    prevention:
      '以后正文这类 textarea 编辑器如果需要逐段视觉排版，不要直接依赖 textarea 的 text-indent；应使用覆盖层或真正的富文本段落节点，并补源码断言防止 textIndent 回到 textarea。',
    keywords: ['正文', '段落缩进', 'textarea', 'textIndent', 'HighlightOverlay', 'ChapterEditor'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'combined-ai-config-select-fallback-check-001',
    title: '模型和提示词下拉显示项与勾选项必须一致',
    area: '共享 UI / 模型选择 / 提示词选择',
    symptom:
      '模型和提示词选择框展开后，有些当前显示的选项右侧没有勾；例如模型显示 deepseek，但下拉列表里的 deepseek 没有选中勾，而提示词结构审核却有勾。',
    cause:
      'CombinedAiConfigSelect 和 CapsuleSelect 在 value 找不到对应 option 时，会退回显示第一个选项的 label，但下拉列表的选中勾仍只比较原始 value，导致显示项和勾选项不同步。',
    solution:
      '为 CapsuleSelect 增加 displayedOption/displayedValue，为 CombinedAiConfigSelect 增加 getDisplayOption/activeDisplayValue；下拉列表的 selected 状态改为对比实际显示的选项值，确保显示哪个选项，展开后哪个选项就有勾。',
    prevention:
      '以后所有下拉组件如果存在 fallback display label，就必须让 dropdown selected 状态复用同一个 fallback 结果；不要让按钮显示逻辑和列表勾选逻辑各自计算。',
    keywords: [
      '模型选择',
      '提示词选择',
      '下拉框',
      '选中勾',
      'CapsuleSelect',
      'CombinedAiConfigSelect',
      'displayedOption',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'ui-unification-production-migration-001',
    title: '用户确认后的 UI 统一预览应迁入正式页面并删除临时测试',
    area: '共享 UI / 模型管理 / 提示词管理 / 测试集合',
    symptom:
      '用户在 UI统一风格预览测试页逐项打钩确认后，如果测试页继续留在测试集合里，会让已确认方案和正式页面之间出现重复入口，也容易让后续维护误以为样式还停留在预览阶段。',
    cause:
      '预览页只是临时确认面；确认后需要把主按钮、图标按钮、胶囊按钮组、弹窗关闭按钮、卡片边框和提示词管理操作区迁入真实页面，同时清理临时 route、lazy import 和测试文件。',
    solution:
      '新增 IconButton、CapsuleActionGroup 和图标按钮 class；统一 AppModalShell 关闭按钮、xy-capsule 底层样式、模型管理编辑弹窗与提示词管理按钮/卡片样式；移除 UI统一风格预览测试页、测试文件、测试集合入口和 route case。',
    prevention:
      '以后临时测试页通过用户确认后，必须同一轮迁入正式页面并删除测试入口；共享按钮、弹窗、卡片操作区优先复用 ActionButton、IconButton、CapsuleActionGroup 或 AppModalShell，不再复制局部按钮 class。',
    keywords: [
      'UI统一',
      '正式迁移',
      '删除测试页',
      'ActionButton',
      'IconButton',
      'CapsuleActionGroup',
      'AppModalShell',
      'TestCollectionPage',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'model-management-four-by-three-grid-001',
    title: '模型管理卡片应按一行四个一列约三个显示',
    area: '模型管理 / 工作台管理弹窗',
    symptom:
      '模型管理弹窗放大后，模型卡片仍按旧布局显示，卡片过宽过高，一行只能看到两个左右，纵向也只能看到很少的模型。',
    cause:
      '模型管理仍保留旧的 3/4 列用户设置，旧用户本地设置可能继续落在 3 列；卡片最小高度 296px，在大弹窗里也难以一列显示三个。',
    solution:
      '将模型管理网格固定为每行 4 个模型，并把模型卡片和新增模型卡片高度统一为 250px；压缩卡片内边距、元信息区和温度条位置，让一列约 3 个模型能在大弹窗里同时出现。',
    prevention:
      '以后调整模型管理布局时，先确认一行 4 个、一列约 3 个的目标仍成立；不要再恢复本地 3 列设置或把模型卡片高度改回 296px。',
    keywords: ['模型管理', '模型卡片', '四列', '三行', 'MODEL_MANAGE_COLUMNS', 'MODEL_CARD_HEIGHT_CLASS'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'shared-ui-reuse-components-first-pass-001',
    title: '功能相同的弹窗、日志和按钮不应继续各自手写',
    area: '共享 UI / 概念库 / 作品库 / 设置页',
    symptom:
      '软件里仍存在多个功能相同但实现不同的 UI：概念库和作品库弹窗手写 fixed inset-0，概念库 AI 日志直接渲染底层 AiRequestLogGroups，按钮只有 class 常量没有组件入口，设置页也缺少统一页面壳。',
    cause:
      '之前只抽出了部分底层组件，旧页面还没有迁入共享外壳；新的复用约定也没有源码断言，后续开发容易继续复制局部样式。',
    solution:
      '新增 ActionButton、SettingsSurface、useUiPreference 作为按钮、设置页壳和 UI 偏好记忆入口；作品新建/导入/回收站迁入 AppModalShell；概念库云同步、输出日志、AI 联想预览迁入 AppModalShell，输出日志改用 AiRequestLogModalLayout；新增源码级回归测试锁定这些入口。',
    prevention:
      '以后新增业务弹窗默认用 AppModalShell，工作台业务弹窗用 WorkbenchModal；AI 日志默认用 AiRequestLogModalLayout；按钮优先用 ActionButton；设置类页面用 SettingsSurface；用户偏好状态优先用 useUiPreference，不再在页面里复制外壳和 localStorage 读写。',
    keywords: [
      'AppModalShell',
      'AiRequestLogModalLayout',
      'ActionButton',
      'SettingsSurface',
      'useUiPreference',
      '概念库',
      '作品库',
      '复用组件',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'workbench-management-modals-large-size-unified-001',
    title: '模型管理和提示词管理弹窗不应偏小',
    area: '工作台 / 模型管理弹窗 / 提示词管理弹窗',
    symptom:
      '从工作台打开模型管理或提示词管理时，弹窗高度偏矮，部分入口宽度只有 1200px，和用户期望的截图尺寸相比显得太小。',
    cause:
      '管理弹窗尺寸分散写在 WorkbenchPage、LibraryManagementModal 和 ChapterEditor 中，旧值统一限制在 820px 高，其中设定/脑洞右侧配置入口还使用了 1200px 宽。',
    solution:
      '新增 WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS，统一模型管理和提示词管理弹窗尺寸；当前上限为屏幕视觉尺寸 80%，缩放容器内会按 --xinyuexia-effective-scale 抵消软件缩放，避免管理弹窗超过屏幕 80%。',
    prevention:
      '以后调整模型管理或提示词管理弹窗尺寸时，既要检查 workbenchManagementModalSize.ts，也要检查 useDraggableModal 的 inline geometry 上限；新增管理入口必须复用受 80% 上限保护的尺寸规则。',
    keywords: [
      '模型管理',
      '提示词管理',
      '弹窗尺寸',
      '大弹窗',
      'WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS',
      'WorkbenchPage',
      'ChapterEditor',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'embedded-model-management-header-and-log-cleanup-001',
    title: '嵌入式模型管理弹窗不应出现重复标题和失败日志栏',
    area: '工作台 / 模型管理弹窗',
    symptom:
      '从工作台打开模型管理时，弹窗外壳和模型管理页各显示一行“模型管理”，模型数量在第二行，设置齿轮离关闭按钮较远，右侧失败日志栏占用了大量空间。',
    cause:
      '模型管理页被直接嵌入通用管理弹窗，通用弹窗保留自己的标题栏，页面内部也保留完整顶栏和失败日志侧栏，导致同一功能在弹窗里重复展示。',
    solution:
      '给 ModelManagePage 增加 embedded 模式：嵌入弹窗时由模型管理页自己的紧凑顶栏同时显示标题、模型数量、设置齿轮和关闭按钮，父级弹窗不再额外渲染模型管理标题栏；嵌入模式隐藏失败日志侧栏，独立 /model-manage 页面仍保留完整日志。',
    prevention:
      '以后把完整管理页嵌入工作台弹窗时，要先确认页面是否需要 embedded 模式；标题、关闭、设置入口只能保留一套，诊断类侧栏默认只放在独立管理页。',
    keywords: ['模型管理', '嵌入弹窗', '重复标题', '失败日志', '设置齿轮', 'ModelManagePage'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'ai-log-weighted-space-rules-001',
    title: '各创作页面输出日志应按内容重要性分配高度',
    area: '作品编辑器 / 章纲 / 正文 / 剧情审核 / 综合点评 / 文笔润色 / 输出日志',
    symptom:
      '输出日志里多个展开分组时，重要内容没有按页面用途分配空间：章纲的关联资料可能被提示词挤压，正文资料没有获得更多核对空间，审核和润色的原文也不能稳定占据主要高度。',
    cause:
      '旧布局只支持单个分组填满或固定某一个分组填满，无法根据页面和实际存在的分组组合设置 1:1、1:2:1、1:1:2:1 等比例。',
    solution:
      '统一使用 fillGroupWeights。章纲：有提示词、关联资料、其他要求时等高，只有提示词和其他要求时 2:1。正文：提示词、资料、用户要求按 1:2:1，只有资料时提示词/资料 1:2，只有用户要求时提示词/用户要求 2:1。审核、综合点评、文笔润色：提示词、关联章纲、原文、其他要求按 1:1:2:1，原文始终获得最大空间。',
    prevention:
      '以后新增日志分组时先判断它属于规则、资料、正文还是用户补充，再给对应页面补权重和源码断言；不要再用单个 fillGroupId 处理复杂日志布局。',
    keywords: [
      '输出日志',
      '高度比例',
      '章纲',
      '正文',
      '剧情审核',
      '综合点评',
      '文笔润色',
      'fillGroupWeights',
      'AiRequestLogGroups',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'outline-ai-log-prompt-user-height-ratio-001',
    title: '章纲输出日志提示词与其他要求应充分占满弹窗高度',
    area: '作品编辑器 / 章纲 / 输出日志',
    symptom:
      '章纲输出日志里“提示词”和“其他要求”展开后只占用上半部分，弹窗底部留下大块空白；当只有提示词时，提示词框没有吃满可用高度，能看到的提示词内容偏少。',
    cause:
      'AiRequestLogGroups 只支持单个分组占满或指定一个分组占满，无法让提示词和其他要求按比例共同撑满右侧日志区域。',
    solution:
      '给 AiRequestLogGroups 增加 fillGroupWeights；章纲日志根据实际可见分组动态传入权重。没有其他要求时，提示词作为单个可见分组占满上下；只有提示词和其他要求时按 2:1 高度分配；如果同时有提示词、关联资料和其他要求，则三者等高，其他要求自然贴到弹窗底部。',
    prevention:
      '以后调整输出日志分组高度时，要区分单分组占满、指定分组占满和多分组按比例占满三种场景；章纲日志应继续保持“有资料则等高、无资料时提示词/其他要求 2:1”的空间规则。',
    keywords: ['章纲', '输出日志', '提示词', '其他要求', '高度比例', 'AiRequestLogGroups', 'fillGroupWeights'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-ai-log-button-and-groups-001',
    title: '顶部 AI 日志入口应能打开审核相关页面日志',
    area: '作品编辑器 / 剧情审核 / 综合点评 / 文笔润色 / AI日志',
    symptom:
      '顶部右上角的全局“日志”按钮切到剧情审核、综合点评、文笔润色等页面时，没有像脑洞、设定、章纲、正文那样打开当前页面对应日志；即使打开后，日志弹窗也不像正文日志那样有左侧“链路 / 模型 / 提示词”信息栏。用户没有输入任何额外要求时，日志里却把默认审核规则显示成“用户要求”。',
    cause:
      '审核相关页面虽然接收 openLogSignal，但日志入口行为没有用测试锁定；顶部右侧工具条没有明确层级和 no-drag 标记，可能被中间流程滚动层或 Electron 拖拽区域影响点击；审核日志还挂在右侧配置栏内部，容易被局部容器裁剪或显得没有响应。仅靠 signal 广播也不如正文页那样由当前页面直接接管日志入口稳定。请求日志把默认模式说明和修改后全文输出规则混进 userText，导致没有用户输入时也显示“用户要求”；日志解析还用普通【标题】切段，导致所选提示词内部的【其他要求】被误识别成外层日志分组。',
    solution:
      '保留顶部全局“日志”按钮作为唯一入口；参考正文页日志入口，把当前页面的打开日志函数注册给 WorkbenchPage，顶部按钮优先直接调用当前页面 handler，没有 handler 时才回退 openLogSignal；移除右侧配置栏额外日志按钮；顶部右侧工具条加 z-30、data-no-modal-drag 和 WebkitAppRegion no-drag 保证可点击。审核相关日志改用 WorkbenchModal 全局弹窗，并改成正文同款左右布局：左侧显示链路、模型、提示词、当前章节和关联章纲字数；默认审核规则和固定输出规则归入“提示词”，只有用户真实输入内容时才显示“其他要求”；新日志使用内部隐藏分隔符切段，旧日志只识别原文之后、发送上下文之前的“其他要求”，不再把旧版“用户要求”兜成用户输入。',
    prevention:
      '以后新增创作流程页时，要接入顶部全局日志按钮，并按当前页面展示对应日志；顶部按钮层级、no-drag、直接 handler 注册、signal 兜底和弹窗挂载位置都要有回归断言。不要在页面内部再重复添加独立日志按钮；长上下文日志要按来源拆分，确保用户能单独核对提示词、关联资料和正文。',
    keywords: [
      '剧情审核',
      'AI日志',
      '输出日志',
      '顶部日志',
      '关联章纲',
      '原文',
      '提示词',
      'openLogSignal',
      'ChapterEditor',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-model-selection-persisted-001',
    title: '审核相关页面模型选择应记忆用户上次操作',
    area: '作品编辑器 / 剧情审核 / 综合点评 / 文笔润色 / 更新状态',
    symptom: '用户在剧情审核等页面选定模型后，切换到其他页面再回来，模型下拉框又变成默认模型。',
    cause:
      'reviewModelId 只使用组件内存状态初始化为空，页面切换导致组件重建后重新触发默认模型回填，没有读取或保存用户上次选择。',
    solution:
      '新增 REVIEW_MODEL_ID_STORAGE_KEY 和 readReviewModelId；模型下拉框改用 setReviewModelIdWithStorage 写入 localStorage；只有已保存模型不存在或模型列表为空时才自动回退。',
    prevention:
      '以后剧情审核、综合点评、文笔润色、更新状态里的模型、提示词、布局这类用户会反复选择的控件，都应明确判断是否属于用户偏好，并在切页重建场景下做持久化回归断言。',
    keywords: ['剧情审核', '综合点评', '文笔润色', '更新状态', '模型选择', '切换页面', '用户操作记忆', 'ChapterEditor'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-preview-outline-visible-persisted-001',
    title: '剧情审核预览章纲显隐状态应记忆用户选择',
    area: '作品编辑器 / 剧情审核 / 综合点评 / 原文预览',
    symptom: '用户在剧情审核等预览页面隐藏章纲或调整预览字号后，下次重新进入页面又恢复默认，和上一次操作不一致。',
    cause:
      'showReviewOutline 和 reviewPreviewFontSize 只使用 React 内存状态，没有写入本地存储，也没有在组件初始化时读取用户上一次的选择。',
    solution:
      '新增 REVIEW_PREVIEW_OUTLINE_VISIBLE_STORAGE_KEY、REVIEW_PREVIEW_FONT_SIZE_STORAGE_KEY 及对应读取函数；默认显示章纲，只有存储值为 false 时恢复隐藏；切换章纲显隐和调整预览字号时同步写入 localStorage。',
    prevention:
      '以后新增剧情审核、综合点评、文笔润色这类预览操作时，需要区分临时状态和用户偏好；用户会反复切换的布局状态应优先接入本地持久化，并补源级回归断言。',
    keywords: ['剧情审核', '综合点评', '章纲', '隐藏章纲', '显示章纲', '用户操作记忆', 'ChapterEditor'],
    updatedAt: '2026-07-05',
  },
];
