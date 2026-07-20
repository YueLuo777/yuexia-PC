import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart30: ErrorLogEntry[] = [
  {
    id: 'plot-point-test-output-log-no-action-001',
    title: '剧情点测试页输出日志按钮没有效果',
    area: '测试集合 / 剧情点工作台 / 输出日志',
    symptom:
      '06号剧情点工作台测试里，顶部“输出日志”按钮点击后没有任何反馈，用户无法检查本次剧情点请求会发送给 AI 的内容。',
    cause:
      '测试页只绘制了输出日志按钮样式，没有绑定打开日志弹窗的状态，也没有把当前模型、来源、数量、长度、关联设定、用户要求和剧情链上下文整理成可查看内容。',
    solution:
      '给按钮接入 isOutputLogOpen 状态，点击后打开输出日志弹窗；弹窗按“AI配置 / 关联设定 / 用户要求 / 剧情链上下文”分组展示当前测试请求内容。',
    prevention:
      '测试页里的按钮如果用于验证真实交互，不能只做静态样式；新增按钮时至少要有弹窗、状态切换或可见反馈，避免误判方案已完成。',
    keywords: ['剧情点', '测试集合', '输出日志', '按钮无效', 'PlotPointWorkbenchTestPage'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-preview-first-card-top-gap-001',
    title: '细纲预览首个卡片顶部留白过大',
    area: '细纲 / 中间预览区 / 间距',
    symptom: '细纲预览区第一个细纲卡片上方留白偏高，顶部空隙显得浪费空间。',
    cause: '细纲预览中间滚动容器复用了概要预览的 pt-5 顶部内边距，细纲卡片本身还有边框标签占位，叠加后顶部显得过空。',
    solution: '仅在细纲模式下把中间滚动容器顶部内边距从 pt-5 调整为 pt-2.5，保留概要页原有间距。',
    prevention: '细纲卡片有边框标签和内部标题占位，调整外层滚动容器间距时要和概要页分开处理。',
    keywords: ['细纲', '预览区', '顶部留白', 'pt-2.5', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-reader-rename-to-association-setting-001',
    title: '细纲关联入口仍显示为读取设定',
    area: '细纲 / 剧情点 / 关联设定',
    symptom: '细纲里这个功能本质是把设定和前文细纲关联到本次 AI 请求，但按钮、弹窗、日志仍显示“读取设定”，语义不一致。',
    cause: '早期实现按“读取”命名 UI 文案，后续逻辑已经接近关联功能，但可见文案没有同步改名。',
    solution:
      '把细纲和剧情点相关入口、弹窗标题、输出日志分组、已关联统计、空状态和默认请求文案统一改为“关联设定/已关联”；底层字段名保持不变，避免破坏已保存的关联选择。',
    prevention:
      '重命名交互语义时优先改可见文案，保存字段和 localStorage key 只有在迁移明确时才改，避免 UI 文案调整引发数据丢失。',
    keywords: ['细纲', '关联设定', '读取设定', '输出日志', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-log-should-not-auto-read-chapter-body-001',
    title: '细纲输出日志会自动读取当前章节正文',
    area: '细纲 / 输出日志 / 读取设定',
    symptom: '打开生成细纲的输出日志时，日志里会出现“关联正文/所选章节正文”，看起来细纲请求会自动读取正文。',
    cause:
      '生成细纲和章节概要共用了 getOutlineAiContext 与日志分组，细纲分支也把当前章节正文拼进 contextText，日志侧栏再统一显示“关联正文”。',
    solution:
      '生成细纲分支不再自动拼接当前章节正文，只保留“读取设定/前文细纲”中用户主动选择的内容；输出日志在细纲模式下隐藏“关联正文”侧栏和“关联内容”分组。章节概要仍保留读取正文逻辑。',
    prevention:
      '共用 AI 日志组件时要按业务分支确认 context 来源；细纲、概要虽然布局相同，但一个应读设定/前文细纲，一个才应读正文。',
    keywords: ['细纲', '输出日志', '正文', '读取设定', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-reader-tab-order-settings-outlines-001',
    title: '读取设定弹窗设定和细纲标签顺序不符合预期',
    area: '细纲 / 剧情点 / 读取设定',
    symptom: '读取设定弹窗顶部标签顺序是“设定、细纲”，用户希望调换为“细纲、设定”。',
    cause: '读取设定弹窗的标签按钮按 settings 再 outlines 的顺序硬编码渲染。',
    solution: '调整按钮渲染顺序为 outlines 在前、settings 在后；保留原有 tab state 和内容切换逻辑。',
    prevention: '只改标签顺序时不要改 tab key 或数据源，避免文字换了但内容映射错误。',
    keywords: ['读取设定', '设定', '细纲', '标签顺序', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-reader-plot-outline-forced-required-001',
    title: '读取设定里的剧情大纲被强制默认读取',
    area: '细纲 / 剧情点 / 读取设定',
    symptom: '读取设定弹窗里“剧情大纲”自动勾选并显示默认读取，用户无法取消，只能被强制一起发送给 AI。',
    cause:
      '读取设定条目用 /剧情大纲/ 标记 required，并在 selected、clear、confirm、toggle 逻辑里始终合并 required id。',
    solution:
      '移除剧情大纲 required 标记；selected 只读取用户保存的选择；清空不再保留剧情大纲；确认不再强制合并；界面文案改为可按需求勾选或取消。',
    prevention:
      '默认读取和强制读取必须是明确需求；可选上下文项不要在 selected/confirm 多处硬合并，否则 UI 上取消也不会真正取消。',
    keywords: ['读取设定', '剧情大纲', '默认读取', '强制读取', '细纲', '剧情点'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-preview-scrollbar-inside-content-001',
    title: '细纲预览滚动条没有落在右侧空白带',
    area: '细纲 / 剧情点 / 中间预览区 / 滚动条',
    symptom: '细纲中间预览区的滚动条贴在内容卡片右侧，没有移动到预览区和右侧分割线之间的空白位置。',
    cause:
      '滚动容器放在 main 的 padding 内容盒内，滚动条只能出现在 padding 左侧边界，右侧 padding 形成空白带但滚动条进不去。',
    solution: '细纲模式下给中间滚动容器增加 -mr-4 和 pr-4，让滚动条向右进入空白带，同时保留内容到滚动条的间距。',
    prevention: '需要把滚动条放入内边距空白区时，要扩展滚动容器自身宽度，单纯调整内容 padding 不会改变滚动条位置。',
    keywords: ['细纲', '剧情点', '滚动条', '预览区', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'split-button-fixed-width-tail-gap-001',
    title: '组合按钮固定宽度后右侧出现空白',
    area: '作品编辑器 / 顶部工具栏 / 审核点评状态',
    symptom: '审核、点评、状态组合按钮右侧出现一块空白，像是状态按钮后面还有一个空按钮。',
    cause: '字段尺寸给组合按钮外框设置了固定宽度，但内部按钮按文字内容宽度排列，没有 flex 填满剩余空间。',
    solution: '组合按钮 action class 增加 flex-1，让每个子按钮按比例填满父容器，固定宽度时不会在右侧留下空白。',
    prevention: '可调宽度的组合按钮内部子项必须参与 flex 分配，不能只按内容宽度排布。',
    keywords: ['组合按钮', '审核', '点评', '状态', '字段尺寸', '空白', 'ChapterEditor'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'plot-point-standalone-should-use-outline-layout-001',
    title: '剧情点独立窗口没有参考生成细纲布局',
    area: '作品编辑器 / 生成剧情点 / 独立弹窗',
    symptom: '生成剧情点已经独立打开，但内容仍是小型生成框布局，没有像生成细纲一样保留章节目录、预览区和右侧生成区。',
    cause:
      'plotPointStandalone 模式直接渲染剧情点 overlay，而不是复用细纲页面主体布局，只解决了双层弹窗问题，没有满足“参考生成细纲布局”。',
    solution:
      'plotPointStandalone 改为复用细纲三栏主体布局，隐藏顶部细纲页签；右侧生成任务改为剧情点，窗口标题保持“剧情点”。',
    prevention: '用户说“参考某弹窗布局”时，应保留该弹窗的信息架构，只替换业务任务和标题，而不是改成另一种紧凑弹窗。',
    keywords: ['生成剧情点', '剧情点', '生成细纲', '三栏布局', 'plotPointStandalone'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'plot-point-generator-opened-detail-outline-modal-001',
    title: '生成剧情点按钮误打开细纲窗口',
    area: '作品编辑器 / 顶部导航 / 生成剧情点',
    symptom: '点击生成剧情点时先打开“细纲”大窗口，再在细纲窗口上叠加剧情点弹窗，看起来像把细纲也弹出来了。',
    cause:
      '顶部生成剧情点按钮复用了 detailOutlineLibrary modal，只通过 openPlotPointSignal 在细纲窗口内自动弹出剧情点层。',
    solution:
      '新增独立 plotPointGenerator modal，标题改为“剧情点”；WorkbenchLibraryPanel 增加 plotPointStandalone 模式，只渲染剧情点生成布局，不渲染细纲目录和细纲编辑区。',
    prevention: '“参考某页面布局”不等于复用该页面弹窗；独立功能入口应使用独立 modal key 和独立渲染模式。',
    keywords: ['生成剧情点', '剧情点', '细纲', '独立弹窗', 'WorkbenchPage', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'review-status-buttons-reuse-copy-style-001',
    title: '审核点评状态按钮没有完全复用复制按钮样式',
    area: '作品编辑器 / 顶部工具栏 / 审核点评状态',
    symptom: '审核、点评、状态按钮外框接近复制按钮，但文字颜色仍与复制按钮不一致。',
    cause:
      '按钮使用了另一套近似 class，虽然背景和边框改成了白底蓝边，但字体 class 没有直接复用复制按钮的 SPLIT_BUTTON_OUTLINE_ACTION_CLASS。',
    solution:
      '审核、点评、状态组合按钮改为直接使用 SPLIT_BUTTON_OUTLINE_GROUP_CLASS 和 SPLIT_BUTTON_OUTLINE_ACTION_CLASS，保证边框、背景、hover 和字体颜色与复制按钮一致。',
    prevention: '要求“和某按钮一样”时应直接复用已有 class 或组件，不要复制一套近似样式后再逐项修。',
    keywords: ['审核', '点评', '状态', '复制按钮', '字体颜色', 'ChapterEditor'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'capsule-select-disable-icon-label-misaligned-001',
    title: '提示词禁用图标导致标签和模型不对齐',
    area: '全局模型/提示词选择框 / CapsuleSelect / 禁用按钮',
    symptom: '带禁用按钮的提示词选择框里，“提示词”标签没有和“模型”标签左对齐，禁用图标还占在标签前面。',
    cause:
      'CapsuleSelect 在存在禁用按钮时把浮动标签 left 改到 58px，并把禁用按钮放在控件最左侧，导致标签和内容整体被错位。',
    solution:
      '浮动标签统一使用 left-5；禁用按钮从最左侧移动到选中内容右侧、箭头左侧，既保留禁用入口，也不影响模型/提示词标签对齐。',
    prevention: '浮动标签的起点不能跟随内部按钮变化；禁用、箭头、管理这类操作区应放在文本右侧，避免破坏标签层级。',
    keywords: ['CapsuleSelect', '提示词', '模型', '禁用按钮', '浮动标签', '对齐'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'plot-point-button-wrong-detail-outline-position-001',
    title: '生成剧情点按钮放错到细纲弹窗内部',
    area: '作品编辑器 / 顶部导航 / 生成剧情点',
    symptom: '生成剧情点按钮被放在细纲页读取设定旁边，而不是作品编辑器顶部“大纲设定”和“生成细纲”之间。',
    cause: '把“生成细纲左侧”理解成细纲弹窗内部读取设定区域，实际目标是作品编辑器顶部导航按钮顺序。',
    solution:
      '在 WorkbenchHeader 中新增“生成剧情点”导航按钮，位于“大纲设定”右侧、“生成细纲”左侧；点击后打开细纲窗口并自动弹出剧情点弹窗，同时移除细纲页内部重复入口。',
    prevention:
      '涉及“按钮左侧/右侧”的需求要先确认所在容器是顶部导航、页面工具栏还是弹窗内部，不要只按功能所在模块放置。',
    keywords: ['生成剧情点', '顶部导航', '大纲设定', '生成细纲', 'WorkbenchHeader', 'WorkbenchPage'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'review-status-buttons-copy-style-001',
    title: '审核点评状态组合按钮样式和复制按钮不一致',
    area: '作品编辑器 / 顶部工具栏 / 审核点评状态',
    symptom: '审核、点评、状态三个按钮显示为整块蓝底，和旁边复制按钮的白底蓝边风格不一致。',
    cause: '审核点评状态组合按钮使用了 filled group/action class，分割线也使用白色半透明边线。',
    solution: '把组合按钮改为白底、蓝色边框、蓝色文字和浅蓝 hover；中间分割线改为品牌蓝，视觉与复制按钮保持一致。',
    prevention: '同一工具栏里的组合按钮应复用同一视觉语义；新增 filled 样式前先确认是否需要和复制/优化组保持一致。',
    keywords: ['审核', '点评', '状态', '复制按钮', '组合按钮', 'ChapterEditor'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'field-size-missing-outline-review-editor-001',
    title: '细纲概要和审核点评缺少字段尺寸入口',
    area: '生成细纲 / 章节概要 / 作品编辑器 / 审核点评状态',
    symptom:
      '字段尺寸只能调大纲设定、角色、脑洞等区域，生成细纲、章节概要、审核点评的模型/提示词框，以及作品编辑器顶部审核点评状态按钮无法调整。',
    cause:
      '字段尺寸 key 只覆盖 WorkbenchLibraryPanel 的设定/角色/脑洞分支，细纲概要右侧配置和 ChapterEditor 审核点评配置没有接入同一存储逻辑。',
    solution:
      '给细纲和概要新增独立模型框/提示词框尺寸 key；作品编辑器新增字段尺寸弹窗，放在审核点评弹窗输出日志右侧，并覆盖审核点评状态组合按钮、审核模型框、审核提示词框和点评提示词框。',
    prevention:
      '新增 AI 配置区时要同时检查模型框、提示词框、输出日志旁字段尺寸入口和页面级字段分组，不能只给大纲设定页接入尺寸设置。',
    keywords: ['字段尺寸', '生成细纲', '章节概要', '审核', '点评', '状态', 'ChapterEditor', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'workbench-role-search-button-wraps-001',
    title: '角色搜索按钮被挤成两行',
    area: '大纲设定 / 角色库 / 搜索角色',
    symptom: '侧栏宽度较窄时，“搜索”按钮被 flex 压缩，两个字上下换行显示。',
    cause: '搜索按钮没有设置 shrink-0、whitespace-nowrap 或最小宽度，和可调宽度输入框放在同一行时会被压缩。',
    solution: '给搜索按钮增加 shrink-0、whitespace-nowrap 和 min-w-[64px]，保证“搜索”始终单行显示。',
    prevention: '侧栏里的短文本按钮如果和可调宽度输入框同排，要固定不收缩并禁止换行，避免中文按钮逐字换行。',
    keywords: ['搜索', '角色库', '换行', 'flex', 'shrink-0', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-plot-point-modal-context-001',
    title: '细纲页缺少独立生成剧情点入口',
    area: '作品信息 / 细纲 / 生成剧情点 / 读取设定',
    symptom: '生成细纲前无法先单独生成剧情点，只能把剧情点要求混在细纲输入框里。',
    cause: '细纲页只有读取设定和生成细纲输入框，没有并列的剧情点生成弹窗，也没有复用细纲读取设定上下文。',
    solution:
      '在细纲页读取设定左侧新增“生成剧情点”按钮；弹窗复用当前细纲模型、提示词、当前章节正文、读取设定和前文细纲，可生成、复制或放入细纲要求。',
    prevention:
      '细纲相关的辅助生成入口应复用同一套读取设定和前文细纲上下文，避免出现一个按钮读得到设定、另一个按钮读不到设定的分叉逻辑。',
    keywords: ['生成剧情点', '细纲', '读取设定', '前文细纲', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'workbench-field-size-modal-cross-tab-noise-001',
    title: '字段尺寸弹窗混入其他页面字段',
    area: '大纲设定 / 字段尺寸 / 设定角色脑洞',
    symptom: '从设定页面打开字段尺寸时，弹窗里同时显示角色短字段、角色名、分类、角色模型框、脑洞模型框等其他页面字段。',
    cause: '字段尺寸弹窗直接遍历全量 WORKBENCH_FIELD_SIZE_DEFAULTS，没有按当前 activeTab 过滤可配置字段。',
    solution: '按设定、角色、脑洞建立字段尺寸 key 分组；弹窗根据当前页面只渲染对应分组，标题同步显示当前页面名称。',
    prevention:
      '跨页面共享设置弹窗要区分保存全集和展示子集；新增字段尺寸 key 时必须加入对应页面分组，避免污染其他页面的设置入口。',
    keywords: ['字段尺寸', 'activeTab', '设定', '角色', '脑洞', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'workbench-role-short-field-size-unified-001',
    title: '大纲设定角色短字段尺寸重复且新建按钮间距过大',
    area: '大纲设定 / 字段尺寸 / 角色库',
    symptom:
      '搜索角色、分类名字、角色名字需要分别调尺寸；分类名字和角色名字右侧的新建按钮被 grid 推到很远，输入框和按钮之间空隙明显。',
    cause:
      '三个短输入框分别暴露了独立字段尺寸 key；新建分类/新建角色区域使用 grid-cols-[1fr_84px]，固定宽度输入框不会填满 1fr 列，按钮仍贴在最右列。',
    solution:
      '字段尺寸弹窗只保留“角色短字段”一个设置；搜索角色、分类名字、角色名字共用 roleSearch 尺寸；新建分类/新建角色两行改成 flex + gap-2，让按钮紧贴输入框。',
    prevention:
      '同一类短字段要优先复用一个尺寸入口；固定宽度控件旁边如果有按钮，避免用 1fr grid 把按钮推到容器最右侧。',
    keywords: ['大纲设定', '字段尺寸', '搜索角色', '分类名字', '角色名字', '新建分类', '新建角色'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'detail-outline-reader-group-color-scope-001',
    title: '读取设定导航树整组被染成蓝色',
    area: '作品信息 / 细纲 / 读取设定 / 导航树配色',
    symptom: '读取设定导航树里整个分组卡片都是蓝色，导致分类下的未选中选项也变成蓝底。',
    cause: '上次把 #E6F7FB 加在分组外层容器上，而不是只加在组标题按钮上。',
    solution: '分组外层和选项区恢复白底；只有组标题行使用 #E6F7FB；未选中选项保持白底，选中项才使用 #FFF7ED。',
    prevention: '导航树配色要区分组标题、普通选项和选中选项三层，不能把组标题色放到包含所有子项的外层容器。',
    keywords: ['读取设定', '导航树', '组标题', '#E6F7FB', '#FFF7ED', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-30',
  },
  {
    id: 'chapter-editor-review-esc-goes-home-001',
    title: '审核点评弹窗打开时按 ESC 直接回首页',
    area: '作品编辑器 / 审核点评 / 状态 / 查找 / ESC',
    symptom: '点击审核或点评后明明有弹窗，按 ESC 没有先关闭弹窗，而是触发作品编辑器兜底逻辑直接回到首页。',
    cause:
      '审核点评、状态更新、审核输出日志和审核模型/提示词管理是 ChapterEditor 内部 createPortal 渲染的浮层，但没有注册 useTopModalEscape，AppFrame 判断没有顶层弹窗后继续派发 close_floating，WorkbenchPage 执行了回首页兜底。',
    solution:
      '给审核输出日志、审核管理弹窗、审核点评主弹窗、状态更新弹窗和编辑器查找条注册 useTopModalEscape；ESC 现在按最上层浮层优先关闭，全部关闭后才允许页面级回首页。',
    prevention:
      '以后新增 createPortal 或 absolute 浮层时，必须同步接入 useTopModalEscape；只有没有任何顶层关闭处理时，ESC 才能执行页面级导航兜底。',
    keywords: ['ESC', '审核', '点评', '状态', '查找', 'useTopModalEscape', 'WorkbenchPage', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-floating-label-over-content-001',
    title: '模型提示词边框标签压在选中内容上方',
    area: '全局模型/提示词选择框 / CapsuleSelect / 边框标签',
    symptom: '“模型”“提示词”标签显示在选中模型或提示词名称的正上方，看起来像上下堆叠，而不是嵌在左上边框上。',
    cause:
      'CapsuleSelect 的浮动标签和选中内容使用了接近的左侧偏移；带管理按钮和带禁用图标的分支没有把标签层、图标层、文本层分开定位。',
    solution:
      '把浮动标签向左贴近边框；有禁用图标时标签放在图标右侧边框处，并把选中内容右移一点，避免标签和内容上下重叠。',
    prevention: '边框嵌入标签控件要单独校验标签起点、文本起点、禁用图标和右侧管理区，不能只看整体是否在同一行。',
    keywords: ['CapsuleSelect', '模型', '提示词', '边框标签', '管理按钮', '禁用图标'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'ai-request-log-compact-groups-applied-001',
    title: '输出日志折叠卡片过高且没有全局复用',
    area: '输出日志 / 大纲设定 / 脑洞 / 细纲 / 正文续写 / 审核点评',
    symptom: '折叠后的日志卡片仍显示说明文字，占用高度；分组折叠只停留在测试页，没有同步到所有输出日志。',
    cause:
      '测试页把“折叠只影响当前查看”的说明写进每个折叠头部，正式日志仍使用普通标题加大文本块，各页面没有共享折叠组件。',
    solution:
      '新增 AiRequestLogGroups 共享组件，折叠态只显示“提示词 / 关联内容 / 用户要求”等标题和统计；大纲设定、脑洞、细纲、正文续写、审核点评输出日志统一接入该组件。',
    prevention:
      '输出日志属于跨页面通用能力，后续新增日志入口时应复用同一个分组折叠组件，不要在每个页面手写说明卡和大段文本块。',
    keywords: ['输出日志', '折叠', '提示词', '关联内容', '用户要求', 'AiRequestLogGroups'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-inline-action-text-truncates-too-early-001',
    title: '带管理按钮的模型提示词选择框文本过早省略',
    area: '全局模型/提示词选择框 / CapsuleSelect / 管理按钮',
    symptom: '模型或提示词名称明明距离箭头还有空间，却提前显示省略号，能显示的字数偏少。',
    cause:
      '带管理按钮的 CapsuleSelect 文本按钮右侧额外留白偏大，文本 span 也没有按 flex 可用宽度撑满，省略边界比箭头位置更靠左。',
    solution:
      '收紧带管理按钮选择框的文字右侧 padding，并让文本 span 使用 min-w-0 + flex-1，把省略边界推到箭头左侧的安全距离内。',
    prevention:
      '复合选择框内如果右侧同时有箭头和管理按钮，文本、箭头、动作区要分开计算宽度；文本截断元素必须显式 min-w-0/flex-1。',
    keywords: ['CapsuleSelect', '模型选择框', '提示词选择框', '管理按钮', '省略号', '箭头'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-reader-nav-color-match-unpublished-001',
    title: '读取设定导航树颜色和未发布导航不一致',
    area: '作品信息 / 细纲 / 读取设定 / 导航树',
    symptom: '读取设定弹窗左侧导航树分组仍是白底，选中设定是浅蓝色，和未发布导航的分组色、选中色不一致。',
    cause: '读取设定导航树独立写了 bg-white 和 #EAF9FD，没有复用未发布导航的色彩规则。',
    solution: '导航树分组块改为 #E6F7FB，选中设定改为 #FFF7ED；右侧设定/细纲列表的选中态同步使用 #FFF7ED。',
    prevention:
      '同类导航树需要先对照已有导航配色，新增或调整选中态时要同步左侧树和右侧列表，避免同一弹窗出现两套选中颜色。',
    keywords: ['读取设定', '导航树', '未发布导航', '#E6F7FB', '#FFF7ED', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-create-buttons-clipped-by-field-width-001',
    title: '角色新建按钮被字段尺寸输入框挤出隐藏',
    area: '大纲设定 / 角色 / 分类名字 / 角色名字 / 新建按钮',
    symptom: '分类名字和角色名字输入框右侧的新建按钮只露出“新建”，后半段被右侧容器裁掉。',
    cause:
      '字段尺寸配置给输入框写入固定 width，左侧栏宽度不足时输入框仍按配置宽度占位，导致 grid 行整体横向溢出，按钮被 overflow 裁切。',
    solution: '字段尺寸样式在保留设置宽度的同时增加 maxWidth: 100%，让输入框在窄容器里自动让位，按钮列保持可见。',
    prevention:
      '字段尺寸这类用户可调宽度不能只写固定 width，凡是放在侧栏、弹窗或网格里的控件都要有容器级最大宽度约束。',
    keywords: ['字段尺寸', '新建按钮', '分类名字', '角色名字', '按钮隐藏', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'field-size-number-select-replace-001',
    title: '字段尺寸数字全选后输入会拼接旧值',
    area: '大纲设定 / 字段尺寸 / 数字输入框',
    symptom: '字段尺寸弹窗里宽度原本是 220，全选后输入 5，输入框会变成 520，像是没有真正替换选中的旧数字。',
    cause:
      '原控件使用受控的 type=number，输入过程中父级状态同步会让浏览器的选区和光标状态被重置，导致替换输入被当成插入输入。',
    solution:
      '字段尺寸数字框改为 text + inputMode=numeric，并增加本地草稿值；编辑时只更新草稿，失焦或回车时再按宽度/高度/字号各自范围归一化并写入设置。',
    prevention:
      '需要支持全选替换、连续输入和范围限制的数字配置框，不要直接用受控 number 输入实时回写；应拆分编辑草稿和提交值。',
    keywords: ['字段尺寸', '数字输入', '全选替换', '520', '受控输入', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
];
