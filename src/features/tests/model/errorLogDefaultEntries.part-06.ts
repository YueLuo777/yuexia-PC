import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart6: ErrorLogEntry[] = [
  {
    id: 'review-status-chapter-number-outline-selected-001',
    title: '审核和状态目录章节序号应使用章纲外框选中态',
    area: '作品编辑器 / 审核 / 点评 / 润色 / 状态',
    symptom: '审核左侧章节序号和章纲序号的间隔不一致，选中后显示成填充图标，而不是章纲那种外圈高亮。',
    cause:
      '审核、点评、润色和状态更新目录单独维护 36px 序号按钮样式，选中态直接写在按钮背景上，没有复用章纲的数字块与外圈选中类。',
    solution:
      '抽出共用的 32px 章节序号网格和数字块样式，让审核、点评、润色和状态目录都使用 xy-detail-outline-number-block；选中时只追加 xy-detail-outline-number-selected 外圈，状态已更新则使用浅青内容态。',
    prevention:
      '以后新增章节序号类导航时优先复用 WORKBENCH_CHAPTER_NUMBER_BASE_CLASS 和 WORKBENCH_CHAPTER_NUMBER_GRID_STYLE，避免再出现填充式选中图标或不同间隔。',
    keywords: ['审核', '点评', '润色', '状态', '章节序号', '章纲', '选中态', 'ChapterEditor'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'workbench-left-directory-entry-padding-unified-001',
    title: '左侧目录条目需要统一为 4px 左内边距',
    area: '作品编辑器 / 未发布 / 已发布 / 设定库 / 脑洞库',
    symptom:
      '未发布、已发布、设定条目和脑洞库条目的左侧内边距不一致，部分条目仍保留 24px 或 26px 的旧缩进，导致标题展示空间变小，字数也没有稳定贴到最右侧。',
    cause: '章节目录和库目录分别维护样式，前期只在测试页验证了左移方案，正式组件里仍有不同的条目 padding 和字数样式。',
    solution:
      '将未发布、已发布章节条目改为 px-1；将设定/脑洞库条目基础样式改为 px-1，并让字数使用 ml-auto 的 11px 灰色贴右样式。',
    prevention:
      '后续调整左侧目录时，同时检查 ChapterSidebar、PublishedSidebar 和 WorkbenchLibraryPanel，确保分组条目与子条目的右边缘对齐规则一致。',
    keywords: [
      '未发布',
      '已发布',
      '设定条目',
      '脑洞库',
      '左移优化版',
      'ChapterSidebar',
      'PublishedSidebar',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-24',
  },
  {
    id: 'novel-library-overview-stat-desc-remove-001',
    title: '作品概览统计项下方说明需要删除',
    area: '我的小说 / 作品概览 / 四个统计小卡片',
    symptom:
      '作品概览里的“当前小说库、昨日新增字数、累计作品字数、单本平均字数”等说明文字占用空间，并且会让长数字与左侧说明显得拥挤。',
    cause: '统计项同时显示标题、说明和大号数值，信息层级过多；这些说明与标题含义重复，在紧凑卡片里价值不高。',
    solution:
      '删除四个统计项下方的 desc 说明渲染，只保留左侧统计标题和右侧统计值；同时把统计值字号从 19px 调整为 18px，给左侧标题留出更多空间。',
    prevention:
      '以后首页顶部概览卡优先保留短标题和核心数字；如需补充说明，应放到悬浮提示或详情页，不要重新塞回紧凑统计卡片内部。',
    keywords: [
      '我的小说',
      '作品概览',
      '当前小说库',
      '昨日新增字数',
      '累计作品字数',
      '单本平均字数',
      'NovelLibraryPage',
    ],
    updatedAt: '2026-06-23',
  },
  {
    id: 'test-collection-mark-completed-keeps-current-tab-001',
    title: '测试详情页标记已测试时不应自动切换到已测试分栏',
    area: '测试集合 / 已测试标记',
    symptom: '进入某个测试页后点击标记已测试，页面会退出当前测试并自动跳到已测试分栏，打断正在查看的测试内容。',
    cause:
      'toggleTestedTest 在更新已测试列表后，如果当前打开的测试路径等于被标记路径，就额外执行 setActivePath(null) 和 setCollectionTab(...)，把勾选动作和页面切换绑在了一起。',
    solution:
      '保留已测试状态写入和本地存储同步，移除自动关闭当前测试页和自动切换分栏的逻辑；用户需要查看已测试内容时再手动点击分栏。',
    prevention:
      '以后测试集合页的勾选类操作只改变勾选状态，不隐式改变当前详情页或分栏；相关回归测试需检查 toggleTestedTest 内不能再调用 setActivePath(null) 或 setCollectionTab(...)。',
    keywords: ['测试集合', '已测试', '标记已测试', '自动切换', 'TestCollectionPage', 'toggleTestedTest'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'test-collection-tested-bucket-and-format-log-migration-001',
    title: '测试集合页必须保留已测试分栏，测试迁入正式页后要清理临时入口',
    area: '测试集合 / 设定日志 / 智能导入格式',
    symptom:
      '测试集合页被简化后，原本勾选测试并放入“已测试”的功能消失；同时 14 号智能导入格式日志测试迁入正式日志后，测试集合仍可能残留临时入口。',
    cause:
      '整理测试集合时只保留了普通测试列表，遗漏了已测试分栏、本地标记、卡片勾选和详情页标记逻辑；测试方案合入正式页面后，也需要同步删除测试页、集合入口和旧测试文件。',
    solution:
      '恢复 TEST_COLLECTION_TESTED_PATHS_KEY、待测试/已测试分栏、卡片勾选、详情页标记；将智能导入格式日志合入正式输出日志的“格式”标签，并删除 SettingImportFormatLogTestPage 及集合入口。',
    prevention:
      '以后调整 TestCollectionPage 时，必须保留“待测试/已测试”分栏和勾选入口；临时测试页迁入正式功能后，要同时删除测试页、路由入口、render 分支和旧测试文件，并补正式页面守护测试。',
    keywords: [
      '测试集合',
      '已测试',
      '智能导入格式',
      '输出日志',
      '格式标签',
      'TestCollectionPage',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-23',
  },
  {
    id: 'setting-and-outline-link-picker-bulk-select-unified-001',
    title: '关联其他设定与章纲关联大纲需要统一批量勾选和弹窗样式',
    area: '作品编辑器 / 设定 / 章纲 / 关联资料',
    symptom:
      '设定页的关联其他设定缺少“关联所有”和分组全选；章纲页的关联大纲弹窗和设定关联弹窗不是同一套样式，已选内容也不够直观。',
    cause:
      '两个弹窗独立演进：设定关联已经形成三栏结构，但没有批量选择；章纲关联保留旧两栏结构和旧标签按钮，导致同类操作体验不一致。',
    solution:
      '关联其他设定新增当前标签“关联所有”和分组“全选/取消”；章纲关联大纲改为设定关联同款三栏布局：左侧分组勾选，中间预览，右侧显示本次将读取的已选列表，并统一青色标签和确认按钮样式。',
    prevention:
      '以后新增或调整关联弹窗时，以设定关联弹窗为基准，批量选择、分组全选、已选列表、底部确认区必须同步检查。',
    keywords: ['关联其他设定', '关联大纲', '关联资料', '分组全选', '关联所有', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'association-startup-marker-skipped-reset-001',
    title: '关闭软件后正文关联资料仍会恢复',
    area: '作品编辑器 / 正文 / 关联资料',
    symptom: '关闭软件再打开后，正文页的关联资料仍然显示为已关联，没有恢复到未关联状态。',
    cause:
      '启动清理依赖 sessionStorage 里的已清理标记；当 Electron 关闭或恢复时这个标记残留，resetWorkbenchAssociationsForNewAppSession 会直接跳过清理，导致 xinyuexia_workbench_linked_context_* 等本地关联继续被读取。',
    solution:
      '启动时不再因为已清理标记跳过处理，App 每次挂载都会执行 clearAllWorkbenchAssociations；关闭页面时的 pagehide/beforeunload 清理仍保留作为补充。',
    prevention:
      '关联状态属于当前打开软件期间的临时状态，启动清理必须幂等执行，不能用旧的已清理标记阻止下一次启动清理。',
    keywords: [
      '关联资料',
      '关闭软件',
      '正文',
      'localStorage',
      'sessionStorage',
      'WorkbenchPage',
      'workbenchAssociationCleanup',
    ],
    updatedAt: '2026-06-23',
  },
  {
    id: 'association-session-only-close-reset-001',
    title: '所有关联内容关闭软件后必须恢复未关联',
    area: '作品编辑器 / 关联内容 / 全局会话',
    symptom:
      '本章、上下文、脑洞、其他设定、关联小说等关联内容可能通过旧“记忆关联”逻辑写入本地存储，关闭软件再打开后仍保持关联状态。',
    cause:
      '旧实现允许用户开启关联持久化，并且不同页面各自处理清理：章节关联、AI会话关联、设定页关联、正文关联小说没有统一的新会话重置入口。',
    solution:
      '新增统一关联会话清理：软件启动时用 sessionStorage 判断新会话并清除旧关联，pagehide/beforeunload 时再次清理；旧“记忆关联”开关改为不可启用，系统设置说明改为“当前会话”。',
    prevention: '以后新增任何“关联”来源时，要接入统一清理函数，并补充对应测试，确保关联只能保留在当前打开软件期间。',
    keywords: ['关联', '当前会话', '关闭软件', '记忆关联', 'WorkbenchPage', 'WorkbenchAIPanel', 'ScriptEditorPage'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'setting-other-link-picker-migrated-to-production-001',
    title: '13号关联其他设定测试需要迁入正式设定页',
    area: '作品编辑器 / 设定 / 关联内容',
    symptom:
      '设定页原本只能在 AI 生成时关联当前设定或脑洞，无法从作品设定、人物设定、势力地图、道具资源、怪物图鉴和伏笔线索里挑选其他设定作为上下文。',
    cause:
      '“关联其他设定”此前只存在于测试页方案，没有接入正式设定页的关联按钮、弹窗选择、已选内容汇总和 AI 请求上下文拼装。',
    solution:
      '将 13 号测试的“关联其他设定”迁入正式设定页：关联按钮改为当前设定/其他设定/脑洞三段，其他设定弹窗按作品设定、人物设定、势力地图、道具资源、怪物图鉴和伏笔线索分栏读取条目，并把已选内容写入 AI 请求的“关联其他设定”上下文。',
    prevention:
      '以后设定页新增关联来源时，要同时更新关联按钮状态、选择弹窗、清空逻辑、AI 请求标签和回归测试，避免测试页可用但正式页缺入口。',
    keywords: ['13号测试', '关联其他设定', '智能导入设定', 'AI上下文', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'review-annotation-test-compact-auto-spacing-001',
    title: '审核标注测试页不应在短标注后留下大块空白',
    area: '测试集合 / 审核原文标注同步测试',
    symptom: '15号测试里的 AI 标注区域在段落和下一段之间出现大块空白，短标注也占出很高的视觉间隔。',
    cause:
      'AI 标注列表使用固定的 space-y-8，段落卡片也使用 p-4，大间距与内边距叠加后无法根据 AI 标注内容长短自动收缩。',
    solution:
      '将 AI 标注列表改为 space-y-3，卡片内边距改为 px-4 py-3，并根据标注文字长度使用 mt-2 或 mt-3 自动调整段落与标注之间的距离。',
    prevention:
      '以后做原文与 AI 标注对照时，列表间距应由内容自然撑开；短标注使用紧凑间距，长标注才增加呼吸感，避免固定大留白。',
    keywords: ['审核', 'AI标注', '测试页', '空白', '自动适应', '段落同步'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'setting-smart-import-lock-toggle-should-stay-colored-001',
    title: '智能导入设定锁按钮不应跟随导入按钮一起置灰',
    area: '作品编辑器 / 设定 / 智能导入设定',
    symptom: '智能导入设定默认锁定时，左侧导入按钮变灰不可用，右侧锁按钮也一起变灰，用户看不出锁仍然可以点击解锁。',
    cause: '组合按钮把主操作禁用态和锁开关视觉态混在一起，锁定状态下锁开关使用了灰色背景和灰色图标。',
    solution:
      '保留左侧智能导入设定按钮的禁用灰色；将右侧锁开关独立成可点击的黄色锁定态，解锁后锁开关切换为青色解锁态和解锁图标，同时左侧导入按钮变为青色可点击态。',
    prevention:
      '以后组合按钮里的主操作和安全开关要分开设计：主操作可以禁用，解锁开关必须保持明确颜色和可点击状态，并用回归测试锁住。',
    keywords: ['智能导入设定', '锁按钮', '解锁', '组合按钮', '禁用态', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'workbench-legacy-orange-selected-style-global-cleanup-001',
    title: '工作台旧橙色选中态需要全局清理并加扫描测试',
    area: '作品编辑器 / 工作台 / 全局样式',
    symptom:
      '章纲、状态、剧情链、关联读取等局部区域仍可能残留旧的橙色选中态或 #FFF7ED 暖底，经过多轮迭代后容易在不同页面反复出现。',
    cause:
      '旧样式不仅存在于单个按钮，还残留在全局类名 xy-selected-orange-bg、章纲数字“已用”默认色、主题配置默认值和若干正式页面引用中；局部测试只能覆盖某个页面，无法阻止旧样式从其他入口回流。',
    solution:
      '新增正式工作台旧样式扫描测试，禁止生产工作台和全局样式继续出现 xy-selected-orange-bg、bg-[#FFF7ED] 和章纲数字已用旧暖底；将正式引用改为 xy-selected-content-bg 或浅青选中态，并把章纲数字“已用”默认色迁移为浅青。',
    prevention:
      '以后调整选中态时优先使用中性命名的 xy-selected-content-bg 或当前青色体系；不要再新增颜色命名与旧橙色绑定的类名，主题旧默认值也要同步迁移。',
    keywords: [
      '旧样式残留',
      '橙色选中态',
      'xy-selected-orange-bg',
      '#FFF7ED',
      '章纲数字',
      '全局扫描测试',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
    ],
    updatedAt: '2026-06-23',
  },
  {
    id: 'review-font-size-tool-and-outline-orange-frame-001',
    title: '审核页缺少字号工具且章纲章节数字残留橙色框',
    area: '作品编辑器 / 审核 / 章纲',
    symptom:
      '审核页面没有和章纲页一致的字号放大缩小控件；章纲章节数字按钮在未选中或部分状态下仍出现橙色边框，和当前青色体系不一致。',
    cause:
      '审核原文预览拆成原文和 AI 标注后没有补回 FontSizeStepper；章纲/梗概章节数字的普通模式仍复用旧的橙色选中样式。',
    solution:
      '审核预览标题栏加入 FontSizeStepper，并让原文、AI 标注、段落对比、全文对比使用同一审核字号；章纲/梗概章节数字选中态改为青色边框和浅青背景。',
    prevention: '以后审核预览新增视图时同步套用审核字号；章节数字类导航选中态统一使用青色，不再复用橙色选中背景。',
    keywords: [
      '审核页',
      '字号',
      'FontSizeStepper',
      '章纲',
      '橙色框',
      '章节数字',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
    ],
    updatedAt: '2026-06-23',
  },
  {
    id: 'setting-smart-import-default-locked-and-relock-001',
    title: '智能导入设定应默认锁定并在使用后重新锁定',
    area: '作品编辑器 / 设定 / 智能导入设定',
    symptom: '智能导入设定按钮默认可直接点击，或者导入后仍保持可用，容易误触发重复导入。',
    cause:
      'smartImportLocked 的默认值按 false 处理，只有显式写入 true 时才锁定；按钮点击逻辑也主要依赖 disabled 状态，没有在导入函数入口再次判断是否已手动解锁。',
    solution:
      '将未明确解锁的状态统一视为锁定；锁定时按钮置灰不可用，点击锁图标后写入 smartImportLocked: false 才能导入；导入成功后再次写入 smartImportLocked: true。',
    prevention: '以后一次性导入、批量写入、批量迁移类按钮都应默认锁定，并在执行成功后自动回到锁定状态，避免连续误触。',
    keywords: ['智能导入设定', '默认锁定', '手动解锁', '自动重新锁定', 'smartImportLocked', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'review-status-summary-sidebar-gap-alignment-001',
    title: '审核点评润色状态梗概导航应按正文目录贴边',
    area: '作品编辑器 / 审核 / 点评 / 润色 / 状态 / 梗概',
    symptom: '审核、点评、润色、状态和梗概页面的左侧章节导航右侧留白比正文目录更宽，分组按钮到分割线之间显得空了一截。',
    cause:
      '这些左侧导航仍沿用 px-3 外层内边距，并在滚动容器上额外加 pr-1；虽然没有 scrollbar-gutter，但两层右侧间距叠加后，视觉上仍比正文目录更疏。',
    solution:
      '将审核/点评/润色共用目录、状态目录、剧情链目录和梗概目录外层改为 px-1 py-2，并移除滚动容器 pr-1，让分组行靠近右侧分割线，和正文目录保持一致。',
    prevention:
      '以后新增章节类左侧导航时，以正文目录为基准：外层使用窄边距，不在内部滚动区叠加右侧 padding，也不要预留滚动条槽。',
    keywords: ['审核', '点评', '润色', '状态', '梗概', '左侧导航', '分割线', 'ChapterEditor', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'review-preview-bottom-rounded-corner-artifact-001',
    title: '审核原文和AI标注底部应保留圆角且不露出白块',
    area: '作品编辑器 / 审核 / 原文预览与AI标注',
    symptom: '审核页中间原文预览和 AI 标注区域底部左右两侧出现小块白色区域，看起来像多出来的空白控件。',
    cause:
      '中间预览容器需要四角圆角，但内部原文区和 AI 标注区是直角分栏；如果外层没有裁切，底部会显得像多出白块；如果只保留顶部圆角，又会和用户希望的卡片四角圆角不一致。',
    solution:
      '将审核中间预览容器改为 overflow-hidden + rounded-2xl，保留上下四个圆角，同时把内部左右分栏裁切在圆角范围内。',
    prevention:
      '以后整高左右分栏预览区如果需要圆角，使用外层 rounded-2xl + overflow-hidden；不要通过去掉底部圆角来遮掩内部直角分栏。',
    keywords: ['审核页', '原文预览', 'AI标注', '底部白块', '圆角', 'ChapterEditor'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'setting-brainstorm-sidebar-entry-width-alignment-001',
    title: '设定和脑洞左侧条目宽度必须和分组宽度一致',
    area: '作品编辑器 / 设定 / 脑洞 / 左侧导航',
    symptom:
      '设定和脑洞页面左侧导航中，蓝色分组行更靠近右侧分割线，但分组下方的白色设定条目明显更窄，右侧留下突兀空白，和正文目录的贴边结构不一致。',
    cause:
      '分组下方条目曾额外包了一层 max-h + overflow-y-auto 的内部滚动容器；外层左栏滚动容器又使用 scrollbar-scroll-only，触发 scrollbar-gutter: stable，提前给滚动条保留宽度，导致设定/脑洞内容到右侧分割线的空白明显大于正文目录。',
    solution:
      '移除分组下方条目的内部滚动容器，并让设定/脑洞左栏外层滚动容器不再使用 scrollbar-scroll-only / scrollbar-half-width；分组行和条目行都按同一个父容器的 w-full 计算，右侧间距回到和正文目录一致的 px-1 基准。',
    prevention:
      '以后调整设定或脑洞左侧导航时，分组下方条目不要再套内部横向会吃宽度的滚动容器；外层目录滚动也不要使用会预留 scrollbar-gutter 的类，避免右侧凭空多出一条空白。',
    keywords: ['设定左侧导航', '脑洞左侧导航', '条目宽度', '分组宽度', '分割线间距', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'review-page-selection-and-divider-contrast-001',
    title: '审核页选章不应出现橙色选中态且中间分割线需要清晰',
    area: '作品编辑器 / 审核 / 左侧选章与中间预览',
    symptom:
      '审核页面左侧章节数字选中后出现橙色效果，和页面整体青色系不一致；中间原文和 AI 标注之间的竖向分割线过淡，不容易看出左右区域边界。',
    cause:
      '审核选章按钮复用了 xy-selected-orange-bg；原文预览、段落对比和全文对比区域使用 divide-slate-100，视觉对比度偏低。',
    solution: '将审核选章按钮选中态改为青色边框和浅青背景；将审核中间区域的 divide-slate-100 提升为 divide-slate-300。',
    prevention:
      '审核页章节选择应保持青色主视觉；新增左右对照区域时，分割线不要低于 slate-300，否则在白底内容区容易看不清。',
    keywords: ['审核页', '选章', '橙色选中态', 'AI标注', '分割线', 'ChapterEditor'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'new-work-navigation-defaults-use-min-width-001',
    title: '新作品导航默认宽度应使用最小值',
    area: '作品编辑器 / 新建作品 / 左侧导航',
    symptom:
      '新建作品进入正文、设定、脑洞、章纲、剧情蓝图、审核或状态页面时，多个左侧导航区域默认过宽，占用中间编辑空间。',
    cause:
      '多个导航宽度虽然支持拖拽和本地保存，但无保存记录时使用的是较宽的硬编码默认值，例如正文目录 300、设定库 430、审核左栏 220。',
    solution:
      '将未发布目录、已发布目录、设定/脑洞/章纲左栏、剧情蓝图树栏、审核左栏和状态左栏的默认值改为各自允许的最小宽度；保留拖拽范围和已保存宽度逻辑。',
    prevention:
      '以后新增可拖拽导航栏时，默认值应等于最小宽度；需要更宽时让用户手动拖拽并保存，不要把新作品初始界面做宽。',
    keywords: ['新作品', '导航宽度', '最小宽度', '正文目录', '设定左栏', '脑洞左栏', '审核左栏', '状态左栏'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'setting-brainstorm-sidebar-divider-gap-001',
    title: '设定和脑洞左侧导航不应和右侧分割线留出突兀空白',
    area: '作品编辑器 / 设定 / 脑洞 / 左侧导航',
    symptom: '设定、脑洞页面左侧分组和设定条目右侧留出明显空白，分割线没有贴着分组右边缘，和正文目录的贴边布局不一致。',
    cause:
      '设定/脑洞左栏外层使用 px-3 py-3，同时分组下条目滚动容器又使用 pr-1，导致分组按钮和白色设定卡片都比左栏实际宽度窄一截。',
    solution:
      '将设定/脑洞左栏外层改为 px-1 py-2，并移除分组条目容器的 pr-1，让分组行和下方白色设定卡片按 w-full 贴近右侧分割线。',
    prevention:
      '以后调整设定、脑洞左侧导航时，应以正文目录的贴边结构为基准；不要在左栏外层和条目容器同时叠加右侧内边距。',
    keywords: ['设定左侧导航', '脑洞左侧导航', '分割线', '右侧空白', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'novel-library-import-not-refreshing-after-success-001',
    title: '首页导入作品后列表没有立即出现',
    area: '首页 / 我的小说 / 导入作品',
    symptom:
      '点击首页导入并完成解析后，作品数据已经写入本地，但当前首页作品列表、统计和最近编辑区域没有立刻显示新导入的作品。',
    cause:
      '导入弹窗内部单独调用 useNovelLibrary，形成了和首页不同的作品库内存状态；弹窗保存的是自己的状态副本，首页当前渲染的状态没有收到更新。',
    solution:
      'ImportModal 改为接收首页传入的 onImport 回调；NovelLibraryPage 将同一个 useNovelLibrary 实例里的 importNovelWithChapters 传给导入弹窗，导入完成后直接更新首页正在渲染的作品列表。',
    prevention:
      '以后首页弹窗如果会创建、导入、删除或修改作品，应优先由页面持有状态并把动作作为回调传给弹窗；不要在弹窗里再次创建一套同名业务 hook 状态。',
    keywords: [
      '首页导入',
      '导入后不显示',
      'ImportModal',
      'NovelLibraryPage',
      'useNovelLibrary',
      'importNovelWithChapters',
    ],
    updatedAt: '2026-06-23',
  },
];
