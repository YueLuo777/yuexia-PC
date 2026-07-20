import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart19: ErrorLogEntry[] = [
  {
    id: 'library-ai-log-title-content-toggle-001',
    title: '输出日志需要可切换标题分组和纯内容预览',
    area: '作品编辑器 / 输出日志 / 脑洞生成链路',
    symptom:
      '输出日志预览只能显示“提示词”“用户要求”等分组标题，用户希望可以勾选显示标题内容；不勾选时只看提示词正文和其他要求正文拼接内容。',
    cause: 'LibraryAiLogShell 右侧固定渲染 AiRequestLogGroups，分组标题和字数徽标无法隐藏。',
    solution:
      '新增 showLibraryAiLogTitles 状态和“显示标题内容”复选框；勾选时渲染 AiRequestLogGroups，不勾选时用 buildRequestLogPlainPreview 将同一组日志内容按空行拼接成纯文本预览。',
    prevention:
      '输出日志的真实请求内容和展示方式要分离；新增日志显示选项时只改变预览渲染，不改变发送给 AI 的 systemPrompt / userContent。',
    keywords: ['输出日志', '显示标题内容', '提示词', '其他要求', 'AiRequestLogGroups', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-generation-should-send-prompt-and-requirements-only-001',
    title: '脑洞生成应只输出实际内容',
    area: '作品编辑器 / 脑洞 / AI生成链路',
    symptom: '脑洞生成时输出内容仍像是在展示提示词或用户要求包装，而不是直接生成脑洞正文。',
    cause:
      '脑洞确认生成把字段拼装文本当作用户消息发送，之前还带内部请求头；虽然已选提示词作为 system prompt 读取，但用户消息缺少统一的“其他要求”分隔和明确的只输出实际内容约束。',
    solution:
      '脑洞字段拼装函数统一返回【其他要求】块，不再追加内部请求头或“用户要求”块；模型 system prompt 追加“请直接输出实际脑洞内容，不要复述提示词、其他要求、题材、故事主题等标签”。',
    prevention:
      'AI链路要分清 system prompt 和 userContent：提示词走 system，用户字段走 userContent，输出区只显示模型回答正文。',
    keywords: ['脑洞', '生成链路', '提示词', '其他要求', 'system prompt', 'userContent', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-output-title-rename-from-new-brainstorm-001',
    title: '脑洞输出框默认标题不应叫新脑洞',
    area: '作品编辑器 / 脑洞 / 脑洞输出框',
    symptom: '脑洞输出框左上角默认显示“新脑洞1”，用户希望它表达这是输出区域，而不是已经新建了一个脑洞条目。',
    cause: '临时 AI 输出预览复用了“保存为新脑洞”的命名语义，getTemporaryBrainstormTitle 默认返回“新脑洞N”。',
    solution: '将 getTemporaryBrainstormTitle 默认标题改为“脑洞输出框N”；保存按钮“保存为新脑洞”保留动作语义不变。',
    prevention: '临时输出框标题应描述区域用途，保存/创建动作文案才使用“新建/新脑洞”语义，避免误导用户以为内容已入库。',
    keywords: ['脑洞', '脑洞输出框', '新脑洞', 'getTemporaryBrainstormTitle', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-generate-request-header-leaks-to-output-001',
    title: '脑洞生成后输出框显示内部请求头',
    area: '作品编辑器 / 脑洞 / AI生成链路',
    symptom: '点击脑洞生成后，输出区域显示“【以下是用户输出的内容】”，像是生成链路没有真正返回脑洞内容。',
    cause:
      '脑洞确认生成把 buildBrainstormPromptFromQuestions 的完整结构化请求文本同时作为模型 userContent 和界面 visibleUserText；该文本包含内部边界“【以下是用户输出的内容】”，请求未返回或模型回声时会直接暴露在输出框和预览拆分里。',
    solution:
      '将脑洞内部请求头抽成 BRAINSTORM_REQUEST_HEADER；sendLibraryAiMessage 支持 visibleText，确认生成时模型仍收到完整请求，但界面只显示清洗后的用户字段；流式、最终结果和预览拆分都会剥离该内部请求头。',
    prevention:
      'AI 请求里的内部边界、日志标签和协议标记不能直接复用为用户可见输出；新增生成链路时要分离 requestText、visibleText 和 displayContent。',
    keywords: [
      '脑洞',
      '生成',
      '以下是用户输出的内容',
      'visibleText',
      'BRAINSTORM_REQUEST_HEADER',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-09',
  },
  {
    id: 'workbench-freezes-when-model-read-dispatches-update-001',
    title: '进入作品编辑器后模型读取事件导致界面卡死',
    area: '作品编辑器 / 模型选择 / useModels',
    symptom: '进入作品编辑器后鼠标还能移动，但页面点击没有反应，像主界面被卡住。',
    cause:
      '为让各页面模型选择框响应新建模型，WorkbenchLibraryPanel 和 ChapterEditor 改用 useModels；但 readModels 在读取时会做旧数据清理或环境模型同步，并通过 writeModels 派发 modelsUpdated，多个订阅组件进入页面时可能形成重复刷新。',
    solution:
      '给 writeModels 增加 notify 选项；readModels 内部的迁移、清理和环境模型同步改为静默写入，只有新增、编辑、删除、排序这类用户操作才派发 modelsUpdated。',
    prevention:
      '读取函数必须保持无通知副作用；需要整理本地数据时可以静默写回，但不能在组件初始化读取阶段广播全局更新事件。',
    keywords: ['作品编辑器', '卡死', '模型读取', 'modelsUpdated', 'readModels', 'writeModels', 'useModels'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'workbench-model-selects-stale-after-new-model-001',
    title: '新建模型后工作台模型选择框不刷新',
    area: '作品编辑器 / 模型选择 / 脑洞 / 大纲 / 章纲 / 概要 / 审核 / 点评 / 状态',
    symptom: '用户在模型管理中新建模型后，各大工作台页面的模型选择框仍显示旧列表，甚至提示暂无可用模型。',
    cause:
      'WorkbenchLibraryPanel 和 ChapterEditor 使用 readModelSnapshot 配合空依赖 useMemo，只在组件首次渲染时读取一次模型；模型管理保存后虽然派发 modelsUpdated 事件，但这些页面没有订阅更新。',
    solution:
      '将 WorkbenchLibraryPanel 和 ChapterEditor 改为使用 useModels，再从响应式 modelSnapshot 里过滤启用模型；新增模型、编辑模型和删除模型后，下拉框会随 modelsUpdated 同步刷新。',
    prevention:
      '凡是页面上长期存在的模型选择框都应使用 useModels 或显式监听 APP_EVENTS.modelsUpdated；readModelSnapshot 只适合一次性请求或测试初始化。',
    keywords: [
      '模型管理',
      '模型选择框',
      'readModelSnapshot',
      'useModels',
      'modelsUpdated',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
    ],
    updatedAt: '2026-06-09',
  },
  {
    id: 'review-status-summary-directory-match-detail-outline-style-001',
    title: '审核点评状态概要目录样式需要统一但不能丢功能',
    area: '作品编辑器 / 审核 / 点评 / 状态 / 概要目录',
    symptom:
      '审核、点评、状态、概要相关目录视觉不一致；用户希望它们做成章纲目录同款，但概要页仍要保留“卷概要”等专属按钮。',
    cause:
      '审核点评和状态目录由 ChapterEditor 单独渲染，只拿到扁平章节列表；章纲和概要目录由 WorkbenchLibraryPanel 按卷分组渲染，因此样式和层级长期分叉。',
    solution:
      '为 ChapterEditor 传入 volumes，审核点评和状态目录改为按卷分组的蓝色卷条与自适应章节序号按钮；概要目录继续保留原 WorkbenchLibraryPanel 行为和“卷概要”入口。',
    prevention:
      '目录样式统一时只迁移视觉骨架和分组数据，不要删除页面专属动作；新增目录变体要同时补源码级断言覆盖关键入口。',
    keywords: ['审核', '点评', '状态', '概要', '章纲目录', '卷概要', 'ChapterEditor', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-clear-settings-returned-to-create-segment-001',
    title: '大纲清空按钮不应单独占一行',
    area: '作品编辑器 / 大纲 / 清空设定',
    symptom: '清空设定被拆到“新建 / 分类 / 设定”组合按钮下方单独一行，虽然右键热区变大，但浪费了左侧目录纵向空间。',
    cause: '为修复窄栏下右键解锁不明显，临时把清空按钮拆成整宽按钮，没有保留用户原本希望跟在设定右侧的紧凑布局。',
    solution:
      '恢复“新建 / 分类 / 设定 / 清空”同一行四段组合按钮，并将横向内边距收窄到 px-2；清空段继续保留右键解锁和左键确认逻辑。',
    prevention: '解决窄栏交互问题时优先收紧按钮内边距或调整最小宽度，不要把同组操作拆到新行，除非用户明确要求。',
    keywords: ['大纲', '清空设定', '组合按钮', '右键解锁', '节省空间', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-number-buttons-auto-fit-min-width-001',
    title: '章纲目录序号按钮被目录宽度压扁',
    area: '作品编辑器 / 章纲 / 章纲目录序号按钮',
    symptom: '章纲目录宽度变窄后，章节序号按钮被固定列数网格强行压扁，按钮只剩很窄一条。',
    cause:
      '目录序号网格使用 outlineColumns 固定列数和 minmax(0, 1fr)，列宽会跟随目录宽度继续压缩；设置弹窗里的“每行显示”手动列数也和自动适应需求冲突。',
    solution:
      '移除 outlineColumns 和“每行显示”设置；序号网格改为 repeat(auto-fit, minmax(36px, max-content))，按钮增加 min-w-9 和 px-2，达到最小宽度后自动换行。',
    prevention:
      '数字序号按钮不能使用 minmax(0, 1fr) 这类可压扁列宽；需要按容器宽度自适应时，用 auto-fit 和明确最小按钮宽度。',
    keywords: ['章纲', '章纲目录', '序号按钮', '最小宽度', 'auto-fit', 'outlineColumns', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'plot-chain-backup-slots-match-main-chain-style-001',
    title: '剧情链备选链样式需要和主链统一',
    area: '作品编辑器 / 剧情链 / 左侧目录树',
    symptom:
      '主链已经改成正文分卷同款浅蓝条，但备选链仍是灰色小按钮；当前主链标题仍显示“剧情链1”，用户希望显示为“主链”。',
    cause:
      '此前只迁移了当前主链的目录样式，备选链折叠区仍沿用旧灰底按钮；主链标题继续读取 slot 名称，没有按确定主链后的语义重命名。',
    solution: '主链标题固定显示“主链”；备选链下的每条链改用和主链一致的 36px 浅蓝条，右侧保留点数统计。',
    prevention: '同一目录树里的主链和备选链应使用统一层级样式，只通过标题和分组位置表达主次，不用完全不同的按钮样式。',
    keywords: ['剧情链', '主链', '备选链', '目录树', '浅蓝条', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'plot-chain-filter-buttons-four-char-width-001',
    title: '剧情链顶部按钮宽度仍然偏大',
    area: '作品编辑器 / 剧情链 / 左二顶部按钮组',
    symptom: '剧情链顶部“全部、只看未写、只看已写、生成章纲”按钮仍然过宽，占用横向空间，用户只需要能容纳四个字的宽度。',
    cause: '按钮统一使用 w-24 和 gap-3，给四字按钮留了过多横向余量。',
    solution: '将四个按钮统一从 w-24 收窄到 w-20，横向内边距从 px-3 收到 px-2，按钮间距从 gap-3 收到 gap-2。',
    prevention: '短中文工具按钮应按最长文案估算安全宽度，避免为了视觉饱满使用过宽固定值挤占内容区。',
    keywords: ['剧情链', '按钮宽度', '只看未写', '只看已写', '生成章纲', 'w-20'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-clear-settings-unlock-visible-under-narrow-sidebar-001',
    title: '大纲左侧收窄后清空右键解锁不明显',
    area: '作品编辑器 / 大纲 / 清空设定',
    symptom:
      '大纲左侧目录按 350 显示上限收窄后，顶部“新建 / 分类 / 设定 / 清空”四段组合按钮被压窄，清空按钮的右键解锁入口看起来像消失了。',
    cause:
      '清空设定仍和新建、分类、设定挤在同一行四段组合条里；左栏最小宽度回落后，每段按钮热区过窄，不适合承载危险操作的右键解锁。',
    solution:
      '保留“新建 / 分类 / 设定”三段组合条，将清空设定拆到下一行整宽红色按钮，沿用右键解锁菜单和左键确认清空逻辑。',
    prevention: '危险操作需要稳定点击和右键热区；当侧栏允许显著收窄时，不要把危险操作塞进等分组合按钮的窄分段里。',
    keywords: ['大纲', '清空设定', '右键解锁', '侧栏宽度', '组合按钮', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-left-resize-range-restored-after-scale-max-001',
    title: '大纲左侧目录按缩放限制后拖拽失效',
    area: '作品编辑器 / 大纲 / 左侧目录拖拽',
    symptom: '按 125% 系统缩放换算大纲左侧目录最高 350 后，拖拽条无法继续调整宽度，表现为拖拽失效。',
    cause:
      '换算后的最大宽度约为 280 或更低；旧的 OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH=400 仍作为大纲页最小宽度参与夹取，导致 min/max 被夹成同一个值。',
    solution:
      '大纲页最大宽度低于工具栏安全最小宽度时，最小宽度回落到基础 180px，保留缩放后的最大宽度上限，同时恢复可拖拽区间。',
    prevention: '新增固定最大宽度时要检查所有安全最小宽度是否会顶穿上限；拖拽分栏必须保证 min 小于 max。',
    keywords: ['大纲', '左侧目录', '拖拽失效', '125%', '最大宽度', '最小宽度', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-left-max-width-respects-display-scale-001',
    title: '大纲左侧目录最大宽度需要按系统缩放换算',
    area: '作品编辑器 / 大纲 / 左侧目录宽度',
    symptom: '用户要求大纲左侧目录最高 350，但在 Windows 125% 缩放和软件内部缩放下，直接写 350 会在屏幕上显得更宽。',
    cause:
      '旧宽度限制只按 window.innerWidth 和软件 scale 计算屏幕五分之一，没有把固定上限 350 按系统 devicePixelRatio 换算；同时 400px 工具栏安全最小宽度会把最大宽度顶穿。',
    solution:
      '新增 OUTLINE_LEFT_MAX_DISPLAY_WIDTH=350，并按 350 / 软件 scale / window.devicePixelRatio 计算大纲页左侧目录上限；大纲页安全最小宽度改为不超过换算后的最大宽度。',
    prevention:
      '涉及“屏幕上看起来多少像素”的宽度时，要同时考虑软件 zoom 和系统缩放；min/max 冲突时不能让安全最小宽度突破用户指定的最大显示宽度。',
    keywords: ['大纲', '左侧目录', '最大宽度', '350', '125%', 'devicePixelRatio', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'plot-chain-main-slot-directory-volume-style-001',
    title: '剧情链当前主链目录样式不像正文分卷',
    area: '作品编辑器 / 剧情链 / 左侧目录树',
    symptom:
      '剧情链左侧目录里“当前主链”显示为大卡片，和正文目录的分卷标题条不一致；未写剧情点也以小数字块显示，和正文章节行的阅读方式不同。',
    cause: '剧情链目录最初按独立卡片和数字快捷入口实现，没有复用正文分卷“分类标题条 + 子项行”的信息层级。',
    solution:
      '将当前主链改为正文分卷同款的 36px 浅蓝标题条，左侧使用展开箭头，中间显示链名，右侧显示未写数量；未写剧情点改为章节式行项目，选中态使用橙色左边框和浅橙底。',
    prevention:
      '同属左侧目录树的分类结构应优先复用正文分卷视觉骨架；新增剧情链目录状态时避免再退回大卡片或孤立数字块。',
    keywords: ['剧情链', '当前主链', '目录树', '正文分卷', '未写剧情点', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-preview-textarea-top-padding-too-large-001',
    title: '脑洞预览第一行离上边框过远',
    area: '作品编辑器 / 脑洞 / 左二区域脑洞预览',
    symptom: '脑洞左二区域的输入光标和第一行内容距离上边框过大，看起来像文本区域顶部空了一截。',
    cause:
      '脑洞预览框复用浮动边框输入样式后，又单独给 xy-brainstorm-preview-field textarea 设置了 padding-top: 2.35rem；标题已移到边框线上，但正文仍保留旧的大顶部留白。',
    solution: '将脑洞预览 textarea 顶部内边距从 2.35rem 收回到 1.35rem，和同类浮动边框正文框保持一致。',
    prevention:
      '边框标题或工具移出正文内部后，要同步回收 textarea 的顶部预留空间；不要让隐藏 label 继续决定正文第一行位置。',
    keywords: ['脑洞', '左二区域', '脑洞预览', 'padding-top', '光标', 'index.css'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-count-segment-height-reduced-001',
    title: '脑洞生成个数组合按钮高度偏高',
    area: '作品编辑器 / 脑洞 / 生成个数',
    symptom: '脑洞页“生成个数”分段按钮高度过高，和旁边表单区视觉比例不协调，用户希望缩小 20%。',
    cause: '生成个数组合按钮沿用了 h-10，即 40px 高；在只显示 1/3/5/10 四个数字时，40px 的高度显得过厚。',
    solution:
      '将生成个数组合按钮外框从 h-10 调整为 h-8，高度从 40px 降到 32px，约缩小 20%，保留按钮宽度、等分和选中逻辑不变。',
    prevention:
      '短数字分段控件不应默认沿用主按钮高度；调整生成按钮布局时要分别检查主操作按钮和辅助分段控件的视觉层级。',
    keywords: ['脑洞', '生成个数', '分段按钮', '高度', 'h-8', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'feature-zone-generators-archived-token-usage-moved-001',
    title: '功能专区需要删除并归档旧生成器',
    area: '导航 / 功能专区 / 脑洞生成器 / 大纲生成器 / Token用量',
    symptom:
      '功能专区里仍保留脑洞生成器、大纲生成器和 Token 用量；用户已经不再需要旧生成器入口，但希望代码存起来以后备用，Token 用量则更适合放在数据专区。',
    cause:
      '早期独立生成器和脑洞库作为功能专区入口存在，后来作品编辑器内已有更完整的脑洞、大纲与章纲流程，旧入口变成重复功能；Token 用量属于调用数据统计，不应继续挂在功能专区。',
    solution:
      '将 src/features/ideas 整体移动到 archived/feature-zone-generators 保存；正式路由删除 /idea-generator、/outline-generator 和 /idea-library；导航默认配置把 Token用量移入数据专区，并把功能专区加入历史导航清洗名单。',
    prevention:
      '删除导航专区时要同时处理默认导航、历史本地导航清洗、正式路由和代码归档；保留的数据类页面应迁入数据专区，而不是跟废弃功能一起删除。',
    keywords: ['功能专区', '脑洞生成器', '大纲生成器', 'Token用量', '数据专区', '归档', 'navConfig'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'field-size-buttons-renamed-settings-001',
    title: '字段尺寸按钮需要统一改名为设置',
    area: '作品编辑器 / 设置入口 / 章纲目录',
    symptom:
      '各页面仍显示“字段尺寸”按钮，章纲目录旁还保留一个单独齿轮设置入口，容易让用户误以为字段尺寸和目录设置是两套不同入口。',
    cause:
      '字段尺寸配置最初只负责控件尺寸，后来章纲目录的每行显示也属于同一类页面设置，但旧入口文案和单独齿轮没有同步收敛。',
    solution:
      '将 WorkbenchHeader、WorkbenchLibraryPanel 和 ChapterEditor 的字段尺寸按钮统一改名为“设置”；章纲/概要的每行显示配置并入同一个设置弹窗，删除目录右侧独立齿轮。',
    prevention:
      '页面级配置入口应使用统一命名；新增子设置时优先并入当前页面设置弹窗，避免同一区域出现多个含义接近的设置按钮。',
    keywords: ['字段尺寸', '设置', '章纲目录', '齿轮', 'WorkbenchHeader', 'WorkbenchLibraryPanel', 'ChapterEditor'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-resize-range-blocked-by-toolbar-safe-min-001',
    title: '章纲目录拖拽线被安全最小宽度夹死',
    area: '作品编辑器 / 章纲 / 章纲目录拖拽线',
    symptom: '章纲页面拖拽章纲目录右侧分割线时，目录宽度几乎不变化，像是拖拽线失效。',
    cause:
      '章纲目录复用了大纲设定页的 OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH=400，而章纲目录最大宽度是屏幕五分之一；在常见窗口宽度下最大值小于或接近 400px，导致 min/max 被夹成同一个值。',
    solution:
      '将 400px 工具栏安全最小宽度只保留给大纲设定页；章纲和概要目录改回屏幕八分之一到五分之一的真实拖拽区间，避免安全宽度覆盖拖拽范围。',
    prevention:
      '通用分栏 clamp 不能把某个页面的工具栏安全宽度套到所有页面；如果某页工具已移到顶部或按钮数量不同，应按标签页分开 min/max 来源。',
    keywords: ['章纲', '章纲目录', '拖拽线', '最小宽度', '最大宽度', 'OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-left-toolbar-safe-min-width-001',
    title: '大纲左侧区域最小宽度会挡住工具按钮文字',
    area: '作品编辑器 / 大纲 / 左侧区域拖拽',
    symptom:
      '大纲相关页面左侧区域被拖窄后，顶部工具按钮的文字或按钮内容会被遮挡，用户希望最小宽度至少能完整显示四个按钮。',
    cause: '左侧区域最小宽度只按通用像素值或屏幕八分之一夹取，没有把标题行工具组的实际按钮宽度纳入最小宽度计算。',
    solution:
      '新增 OUTLINE_LEFT_TOOLBAR_SAFE_MIN_WIDTH=400，并让大纲、章纲、概要左侧栏的最小宽度取该安全值和屏幕八分之一中的较大值；当屏幕五分之一小于安全值时，优先保证按钮文字不被遮挡。',
    prevention:
      '带标题和多枚工具按钮的可拖拽侧栏，min/max 不能只按屏幕比例计算；必须为工具组设置安全最小宽度，并在比例上限冲突时优先保证控件可读。',
    keywords: ['大纲', '左侧区域', '最小宽度', '工具按钮', '字段尺寸', '日志', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-sidebar-eighth-to-fifth-and-font-toolbar-001',
    title: '章纲目录宽度范围和字号位置需要调整',
    area: '作品编辑器 / 章纲 / 目录栏与顶部工具栏',
    symptom:
      '章纲目录拖拽范围需要更窄且稳定，最小宽度应为屏幕八分之一、最大宽度应为屏幕五分之一；章纲字号控件放在左侧目录标题旁，占用目录工具区。',
    cause:
      '章纲目录左栏只按通用左栏最小宽度夹取，未给章纲页设置独立的视口比例最小值；章纲字号控件渲染在目录栏头部，没有挂到外层工作台右上工具区。',
    solution:
      '为 DETAIL_OUTLINE_TAB 新增 getDetailOutlineLeftMinWidth，按 window.innerWidth / scale / 8 设置最小值，并继续用五分之一作为最大值；WorkbenchHeader 增加 extraTools 插槽，章纲页通过 workbench-header-extra-tools portal 将字号控件移到字段尺寸和日志左侧。',
    prevention:
      '页面级工具应优先放在工作台顶部工具区，避免挤占目录栏；同一拖拽栏需要独立 min/max 时，应在 clamp 层按标签页区分，而不是在最终 grid 宽度里二次覆盖。',
    keywords: ['章纲', '章纲目录', '字号', '字段尺寸', '屏幕八分之一', '屏幕五分之一', 'WorkbenchHeader'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'unpublished-sidebar-max-one-fifth-viewport-001',
    title: '正文未发布栏拖拽宽度需要限制',
    area: '作品编辑器 / 正文 / 未发布章节栏拖拽',
    symptom: '正文页面的未发布章节栏可以被拖得过宽，占用正文编辑区域；用户希望未发布栏最大宽度限制为屏幕的五分之一。',
    cause: '未发布栏使用固定 CHAPTER_SIDEBAR_MAX_WIDTH=420 作为最大值，没有按当前窗口宽度和应用缩放比例动态夹取。',
    solution:
      '新增 getChapterSidebarMaxWidth，按 window.innerWidth / (5 * getEffectiveAppScale()) 计算当前屏幕五分之一，并让 normalizeChapterSidebarWidth 在读取缓存、拖拽和窗口 resize 时统一夹取。',
    prevention:
      '正文侧栏这类高频编辑区分栏应按视口比例设最大值；固定像素最大值只能作为兜底上限，缓存宽度也必须在窗口 resize 时重新规范化。',
    keywords: ['正文', '未发布', '章节栏', '拖拽宽度', '屏幕五分之一', 'WorkbenchPage'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-left-resize-clamped-by-columns-001',
    title: '章纲目录右侧拖拽线失效',
    area: '作品编辑器 / 章纲 / 章纲目录右侧分割线',
    symptom: '章纲页面拖拽章纲目录右侧分割线时，目录区域宽度没有明显变化，像是拖拽线失效。',
    cause:
      '目录实际渲染宽度同时取拖拽状态、章纲列数推导的最低宽度和屏幕比例上限；当列数推导宽度接近上限时，拖拽状态变化会被 Math.max/Math.min 抵消。',
    solution:
      '章纲目录实际宽度改为直接跟随 settingLibraryLeftWidth；屏幕比例限制继续放在历史宽度读取、拖拽最大值和 resize 夹取层，避免最终渲染宽度二次覆盖拖拽结果。',
    prevention:
      '可拖拽分栏的最终 grid 宽度应直接使用可拖拽状态；内容列数、推荐宽度等只能影响默认值或内部布局，不能在渲染层重新覆盖用户拖拽后的宽度。',
    keywords: ['章纲', '章纲目录', '拖拽线', '左侧宽度', 'outlineSidebarWidth', 'outlineColumns'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'plot-chain-filter-generate-buttons-equal-width-001',
    title: '剧情链过滤和生成按钮宽度不统一',
    area: '作品编辑器 / 剧情链 / 左二顶部按钮组',
    symptom:
      '剧情链页面顶部“全部、只看未写、只看已写、生成章纲”四个按钮被自适应网格撑得过宽，区域明明可以容纳四字按钮，却显示成三上一下。',
    cause: '按钮组使用 auto-fit/minmax(128px,1fr)，每列会吃掉剩余空间并保持 128px 起步，超过四个中文字实际需要的宽度。',
    solution:
      '按钮组改为 flex-wrap，四个按钮统一使用 w-24、相同高度和 whitespace-nowrap；区域足够宽时一行显示，不够宽时自然换行，但按钮宽度只保留容纳四个字的尺寸。',
    prevention: '短中文按钮组不要用 1fr 拉伸填满整行；如果按钮语义长度固定，应使用固定安全宽度加 flex-wrap。',
    keywords: ['剧情链', '按钮宽度', '全部', '只看未写', '只看已写', '生成章纲', 'w-24'],
    updatedAt: '2026-06-09',
  },
];
