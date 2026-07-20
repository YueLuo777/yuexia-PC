import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart4: ErrorLogEntry[] = [
  {
    id: 'polish-status-dot-outside-number-001',
    title: '文笔润色未润红点不应遮挡章节数字',
    area: '作品编辑器 / 文笔润色 / 左侧章节序号',
    symptom: '未润色红点放在章节按钮内部右上角时，会压住数字 1、2、3 等个位数字的右上区域。',
    cause: '红点使用 right/top 正值定位在按钮内部，章节数字居中显示时二者空间重叠。',
    solution:
      '将红点改为挂在按钮外侧右上角，使用 -right-1 -top-1，并把尺寸从 10px 缩小到 8px，保留白色描边但不覆盖数字。',
    prevention:
      '以后给章节数字加角标时，优先把状态点放在按钮外角或边框外侧；如果放在内部，必须用截图检查个位数和两位数是否被遮挡。',
    keywords: ['文笔润色', '未润', '红点', '遮挡数字', '章节序号', 'ChapterEditor'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'polish-status-dot-chapter-test-migrated-001',
    title: '文笔润色未润状态应使用章节数字右上角红点',
    area: '作品编辑器 / 文笔润色 / 左侧章节序号',
    symptom: '文笔润色页面的章节数字下方显示“未润/已润”文字，挤占章节按钮下方空间，视觉上比正文和章纲数字按钮更杂。',
    cause:
      '润色状态直接渲染为按钮底部文字标签，未润和已润都占据额外高度；测试页已确认右上角红点能更轻量地表达未润色状态。',
    solution:
      '将 16 号“文笔润色未润红点测试”迁入正式 ChapterEditor：文笔润色模式下，仅未润色章节在序号右上角显示红点，已润色章节不显示状态文字；同步删除临时测试页、测试集合入口和专属测试文件。',
    prevention:
      '以后临时视觉测试确认后，要同步迁入正式页并清理 TestCollectionPage 的 lazy import、卡片入口、render 分支和测试页文件；章节状态类信息优先使用不改变按钮高度的角标。',
    keywords: [
      '文笔润色',
      '未润',
      '红点',
      '章节序号',
      'ChapterEditor',
      'TestCollectionPage',
      'PolishStatusDotChapterTestPage',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-preview-width-mode-toggle-visual-stability-001',
    title: '审核润色等宽锁定与自由调节切换不应改变正文换行',
    area: '作品编辑器 / 剧情审核 / 文笔润色 / 原文预览',
    symptom: '隐藏章纲后，在“等宽锁定”和“自由调节”之间切换时，中间分割线体感有变化，第一段文字换行也会跟着变化。',
    cause:
      '自由调节模式直接套用本地保存的原文像素宽度；锁定模式使用 1fr 等分列。两套 grid 模板不同，切换按钮本身就可能触发布局重排。锁定分割线和可拖拽分割线也分别用不同 JSX 渲染。',
    solution:
      '新增统一的 REVIEW_PREVIEW_SEPARATOR_WIDTH 和 renderReviewPreviewColumnSeparator；锁定与自由模式共用同一条 7px 分割轨道。切到自由调节时先同步为当前等宽，并把自定义宽度标记设为 false；只有用户真正拖拽分割线后，才使用保存的像素宽度。',
    prevention:
      '以后调整审核/润色预览宽度模式时，要检查隐藏章纲状态下切换前后的 gridTemplateColumns 和首段尺寸是否一致；不要让自由模式在刚切换时直接读取旧像素宽度。',
    keywords: ['剧情审核', '文笔润色', '等宽锁定', '自由调节', '隐藏章纲', '分割线', '换行', 'ChapterEditor'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-preview-width-mode-toggle-001',
    title: '审核和润色预览应支持等宽锁定和自由调节',
    area: '作品编辑器 / 剧情审核 / 文笔润色 / 原文预览',
    symptom:
      '原文和审核后/润色后有时需要固定等宽，方便稳定对照；有时又需要用户按内容自由拖拽两侧宽度，单一“同宽”按钮不能覆盖两种使用方式。',
    cause:
      '预览区只有强制等宽布局，没有独立的宽度模式状态；中间正文分隔线也只能按一种交互渲染，无法在锁定分隔线和可拖拽分隔线之间切换。',
    solution:
      '新增 reviewPreviewWidthMode，默认 locked；工具栏改为“等宽锁定 / 自由调节”两段式按钮。locked 模式保留左右 1fr 等宽，free 模式恢复正文分隔线拖拽，并把原文列宽写入本地存储；测试集合新增“审核润色预览宽度模式测试”页面。',
    prevention:
      '以后调整审核、点评、润色预览宽度时，要同时检查 locked/free 两套 gridTemplateColumns、正文分隔线渲染、本地存储键和测试集合里的宽度模式测试页，避免只修一种模式。',
    keywords: [
      '剧情审核',
      '文笔润色',
      '等宽锁定',
      '自由调节',
      '原文',
      '审核后',
      '润色后',
      'ChapterEditor',
      'ReviewPreviewWidthModeTestPage',
    ],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-preview-compare-switch-removed-001',
    title: '审核润色预览不应再保留原文段落全文三态切换',
    area: '作品编辑器 / 剧情审核 / 文笔润色 / 原文预览',
    symptom:
      '宽度模式改成“等宽锁定 / 自由调节”后，工具栏如果继续保留“原文 / 段落 / 全文”切换，会和新的双栏预览逻辑重复，页面入口显得拥挤且容易误解。',
    cause:
      '旧版 compareView 同时承担预览、段落对比、全文对比三种视图；新增宽度模式后，真实页面应该固定在原文和审核后/润色后预览，而旧分支和“生成对比”按钮仍可能残留。',
    solution:
      '删除 reviewCompareView、段落差异、全文对比、段落替换和“生成对比”入口；中间区域始终渲染原文与审核后/润色后双栏预览，工具栏只保留章纲显示、等宽锁定/自由调节和字号控制。',
    prevention:
      '以后调整审核、润色预览工具栏时，测试要同时断言旧的“原文 / 段落 / 全文”切换、reviewCompareView 和“生成对比”入口不存在，避免旧分支回流。',
    keywords: ['剧情审核', '文笔润色', '原文', '段落', '全文', '生成对比', 'reviewCompareView', 'ChapterEditor'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'review-preview-text-columns-balanced-by-mode-001',
    title: '审核和润色预览列宽应按章纲显示状态平衡',
    area: '作品编辑器 / 剧情审核 / 文笔润色 / 原文预览',
    symptom:
      '剧情审核和文笔润色预览里，原文列和审核后/润色后列的最小宽度规则不一致；显示章纲时原文会吃剩余空间，审核后列仍像窄侧栏。',
    cause:
      '预览区 grid 在显示章纲时原文列和审核后/润色后列仍受保存的右侧像素宽度影响；隐藏章纲时右侧列也可能被这个像素宽度压窄，看起来像没有真正同宽。',
    solution:
      '显示章纲时，章纲列保留可调宽度，原文和审核后/润色后两列都使用 minmax(0, 1fr) 平分剩余空间；隐藏章纲时，原文和审核后/润色后都使用 calc((100% - 7px) / 3) 作为最小宽度，并同样用 1fr 平分可用空间。',
    prevention:
      '以后调整审核、点评、润色共用预览布局时，正文对照区不要再绑定单侧本地保存的像素宽度；显示章纲和隐藏章纲要分别检查实际渲染列宽。',
    keywords: ['剧情审核', '文笔润色', '原文', '审核后', '润色后', '显示章纲', '隐藏章纲', 'ChapterEditor'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'review-polish-preview-equal-width-labels-001',
    title: '审核和润色预览同宽按钮应按模式命名并按实际列数计算',
    area: '作品编辑器 / 剧情审核 / 文笔润色 / 原文预览',
    symptom:
      '文笔润色页点击“原文/AI同宽”后左右宽度不对；剧情审核页按钮名称仍叫“原文/AI同宽”；文笔润色左侧标题显示“第N章 润色前”，不符合用户希望的“第N章 原文”。',
    cause:
      '同宽按钮和左右栏标题复用了审核模式旧文案；同宽计算使用 showReviewOutline 判断固定列宽，但润色模式会隐藏章纲列，导致仍按不存在的章纲列扣宽。',
    solution:
      '同宽计算改为使用 effectiveShowReviewOutline；按钮按模式显示“原文/审核同宽”“原文/润色后同宽”或“原文/AI同宽”；左侧预览标题统一为“第N章 原文”。',
    prevention:
      '以后审核、点评、润色共用预览布局时，列宽计算必须基于实际渲染列，不要基于独立开关；模式文案要单独生成，避免把 AI 标注、审核、润色混用。',
    keywords: ['剧情审核', '文笔润色', '原文/审核同宽', '原文/润色后同宽', '润色前', 'ChapterEditor'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'workbench-review-flow-labels-expanded-001',
    title: '后处理流程按钮应使用完整动作名称',
    area: '作品编辑器 / 顶部流程按钮 / 提示词分类',
    symptom:
      '顶部后处理流程里“点评”“状态”“梗概”三个按钮名称偏短，和实际动作不够对应，用户要求改成“综合点评”“更新状态”“生成梗概”。',
    cause: '流程定义、提示词分类和 AI 请求标签策略沿用早期短名称，后续功能拆分后没有同步升级为动作型名称。',
    solution:
      '将 comment/status/summary 三个流程标题改为综合点评、更新状态、生成梗概；提示词默认分类同步改名，并把旧的点评、状态、梗概分类映射到新名称以兼容已有数据。',
    prevention:
      '以后调整流程按钮名称时，要同步检查 workbenchCreationFlow、提示词分类、AI 请求标签策略和头部按钮测试，避免不同入口显示新旧名称混用。',
    keywords: ['综合点评', '更新状态', '生成梗概', '点评', '状态', '梗概', 'workbenchCreationFlow', 'usePrompts'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'detail-outline-chapter-number-white-bg-001',
    title: '章纲章节序号按钮底色应保持白色',
    area: '作品编辑器 / 章纲 / 左侧章节序号',
    symptom:
      '章纲页面左侧章节序号按钮在有正文或有章纲内容时显示浅绿色或浅蓝底色，用户要求这些章节序号底色统一为 #FFFFFF。',
    cause:
      '章纲章节序号复用了 xy-detail-outline-number-used 和 xy-detail-outline-number-has-outline 的内容状态底色，状态类会给按钮写入非白色 background。',
    solution:
      '给章纲页章节序号额外添加 xy-detail-outline-number-white-bg，并在样式顺序上让它覆盖内容状态背景，只保留边框、文字和选中外圈表达状态。',
    prevention:
      '以后章纲页章节序号的内容状态不要再通过按钮底色表达；如需状态提示，应使用边框、文字或外圈，不要覆盖 #FFFFFF 底色。',
    keywords: ['章纲', '章节序号', '#ECFDF5', '#FFFFFF', 'xy-detail-outline-number-white-bg', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'workbench-flow-button-active-right-border-visible-001',
    title: '顶部流程按钮选中态左右边线必须一致',
    area: '作品编辑器 / 顶部流程按钮 / 章纲与正文入口',
    symptom:
      '选中“章纲”等中间流程按钮时，左侧能看到分隔线，右侧分隔线消失，导致按钮左右视觉不一致；其他流程按钮选中后也存在同类风险。',
    cause:
      'xy-flow-status-button 和 xy-flow-status-button.xy-active 都把 border-right-color 设置为 transparent，选中按钮自身右边框被隐藏，只剩相邻按钮或外层边框参与显示。',
    solution:
      '移除流程按钮默认态和选中态的透明右边框，让每个按钮都保留完整 1px 边框，并继续通过 margin-left:-1px 合并相邻边框避免双线。',
    prevention:
      '顶部流程按钮、分段按钮只要有选中态边框，就不要隐藏单侧边框；以后调整边线时要同时检查首项、中间项和末项的选中效果。',
    keywords: ['章纲', '顶部流程按钮', '边线', 'border-right-color', 'WorkbenchHeader', 'xy-flow-status-button'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'published-chapter-sidebar-title-hidden-001',
    title: '正文页发布到已发布后章节标题不能被隐藏',
    area: '正文 / 章节侧栏 / 已发布章节列表',
    symptom: '章节从未发布移动到已发布后，已发布栏只显示“第N章”和字数，原本的章节标题不显示，看起来像发布时标题丢失。',
    cause:
      'PublishedSidebar 渲染章节行时把 chapter.title 包在 className="hidden" 的 span 里，数据仍在，但视觉上被隐藏。',
    solution: '将已发布栏章节行改为直接渲染“第{serialNumber}章 {title}”，和未发布栏保持一致。',
    prevention: '以后调整已发布/未发布章节列表时，两侧章节标题展示规则必须同步；不要用 hidden 包裹核心标题文本。',
    keywords: ['正文', '章节标题', '已发布', '未发布', 'PublishedSidebar', 'chapter.title', 'hidden'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'detail-outline-plot-chain-action-button-white-bg-001',
    title: '章纲页剧情链操作按钮底色应保持白色',
    area: '工作台 / 章纲 / 剧情链操作按钮',
    symptom: '章纲页面里的操作按钮底色显示为浅绿色，编译后对应 #ECFDF5，和用户要求的白底按钮不一致。',
    cause:
      '剧情链条目里的“标为已写”按钮使用了 Tailwind 的 bg-emerald-50 和 hover:bg-emerald-100，实际渲染时底色变成 #ECFDF5。',
    solution: '将该按钮默认和 hover 背景都改为 bg-white，同时保留 emerald 边框和文字色用于表达可写状态。',
    prevention:
      '章纲页面的操作按钮默认底色应使用 #FFFFFF；需要状态提示时优先使用边框和文字色，不要再给按钮本体使用 bg-emerald-50。',
    keywords: ['章纲', '剧情链', '按钮底色', '#ECFDF5', '#FFFFFF', 'bg-emerald-50', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'shortcut-settings-four-column-header-reset-001',
    title: '快捷键设置页应使用四列紧凑布局和标题栏恢复默认',
    area: '设置 / 快捷键设置 / 布局与按钮样式',
    symptom:
      '快捷键设置页一行只能放三个快捷键，恢复默认单独占在内容区顶部，导致标题栏下方被空白行挤开；快捷键值按钮仍是白底样式，和鼠标手势的已开启按钮不一致。',
    cause:
      '快捷键页沿用了旧弹窗布局：内容网格停留在 xl:grid-cols-3，嵌入模式仍在内容区渲染恢复默认按钮，快捷键绑定按钮也保留了白底 hover 样式。',
    solution:
      '把恢复默认移动到统一设置页标题行右侧，并通过 SHORTCUT_SETTINGS_RESET_EVENT 调用快捷键模块内部重置逻辑；快捷键网格改为 xl:grid-cols-4；快捷键值按钮统一改为 bg-[#08AACE]、hover:bg-[#0798b8]、text-white 的实心青色样式。',
    prevention:
      '后续调整快捷键设置页时，标题栏操作应放在 SettingsPage header action 中，嵌入内容区首屏应直接从快捷键分组开始；快捷键值按钮和鼠标手势状态按钮应保持同一青色实心视觉。',
    keywords: [
      '快捷键设置',
      '恢复默认',
      '四列布局',
      '标题栏按钮',
      'SHORTCUT_SETTINGS_RESET_EVENT',
      'SettingsPage',
      'ShortcutSettingsModal',
    ],
    updatedAt: '2026-07-04',
  },
  {
    id: 'brainstorm-output-bottom-gap-auto-fit-001',
    title: '脑洞输出框底部空白应由自动布局消化',
    area: '工作台 / 脑洞 / 脑洞输出',
    symptom: '脑洞输出框和下方输入框之间留出一大片固定空白，输出框没有向下吃满可用空间。',
    cause:
      '脑洞输出右侧栏使用 flex 纵向布局和固定 gap-5，输出区与底部输入/按钮区之间的间距不会随底部按钮数量自动重新分配。',
    solution:
      '将脑洞输出栏内容改为 grid-rows-[minmax(0,1fr)_auto]，上方输出框自动占满剩余高度，下方输入和按钮区按内容高度占位，并把间距收紧为 gap-2。',
    prevention:
      '以后在脑洞输出底部增加按钮或工具时，应放在 auto 行里；输出预览区必须保持 minmax(0,1fr)，不要再用固定大 gap 制造空间。',
    keywords: ['脑洞', '脑洞输出', '输入框', '底部按钮', '自动适应', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'settings-action-buttons-match-home-settings-001',
    title: '设置页操作按钮必须匹配首页设置按钮',
    area: '设置 / 系统设置 / 快捷键设置 / 主题颜色 / 导航设置',
    symptom:
      '设置页里的“恢复默认”“新增分割线”“确认替换”等操作按钮仍使用白底描边或图标加文字样式，和用户指定的首页左下角“设置”实心青色按钮不一致。',
    cause:
      '设置页按钮沿用了旧的 SETTINGS_LIGHT_BUTTON_CLASS 和局部白底描边类，没有把首页设置入口的按钮样式作为统一标准。',
    solution:
      '把设置相关页面的操作按钮统一为 h-8、rounded-md、bg-[#08AACE]、hover:bg-[#0798b8]、text-white 的纯文字实心青色按钮，只保留文字差异。',
    prevention:
      '以后用户指定某个按钮 UI 为标准时，同类操作按钮应复用同一视觉参数；不要在同一设置页混用白底描边、图标加文字和实心按钮。',
    keywords: [
      '设置',
      '恢复默认',
      '新增分割线',
      '确认替换',
      '按钮样式',
      '首页设置按钮',
      'DashboardLayout',
      'SystemSettingsModal',
      'NavSettingsModal',
    ],
    updatedAt: '2026-07-04',
  },
  {
    id: 'system-settings-inner-tabs-match-settings-tree-active-001',
    title: '系统设置内部标签选中态应匹配设置树',
    area: '设置 / 系统设置 / 窗口标签',
    symptom:
      '统一设置页左侧“系统设置”使用实心青色选中态，但右侧系统设置里的“窗口、关联设置、软件图标”仍是白底选中态，视觉层级不统一。',
    cause: '系统设置内部标签沿用了旧弹窗/独立页面的 active 样式，没有针对 embedded 设置页模式同步新的设置树选中效果。',
    solution:
      '在 SystemSettingsModal 的 embedded 模式下，把当前内部标签 active 样式改为 bg-[#08AACE]、text-white、shadow-sm，未选中项改为浅青 hover。',
    prevention:
      '统一设置页内的二级导航 active 状态应跟左侧设置树保持同一视觉语言；新增 embedded 模式时要单独检查内层 tab、左栏和按钮状态。',
    keywords: ['设置', '系统设置', '窗口', '关联设置', '软件图标', '选中态', 'SettingsPage', 'SystemSettingsModal'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'dashboard-unified-settings-page-tree-001',
    title: '首页设置入口应进入统一设置树页面',
    area: '首页左侧导航 / 设置页面 / 系统设置',
    symptom:
      '左下角系统设置、主题颜色、快捷键、导航设置四个按钮分散跳转到独立页面，设置页顶部和四周留白过大，左上角内容没有贴近页面起点，整体显得空旷和割裂。',
    cause:
      '此前把每个设置项都迁成单独路由页面，页面之间缺少统一设置外壳；原页面还保留了各自的返回标题区和较大的页面 padding。',
    solution:
      '左下角只保留一个与新增卷一致的实心青色“设置”入口，进入 /settings 后使用左侧设置导航树切换系统设置、快捷键设置、主题颜色、导航设置；右侧设置面板改为 embedded 模式，隐藏重复标题和返回按钮，并压紧统一页面边距。',
    prevention:
      '同一类系统级配置应集中在一个设置 shell 内，通过左侧树切换内容；不要为每个小设置重新做独立页面或重复页面级标题区。',
    keywords: ['设置', '系统设置', '快捷键设置', '主题颜色', '导航设置', '设置树', 'DashboardLayout', 'SettingsPage'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'dashboard-settings-buttons-match-add-volume-001',
    title: '系统设置入口按钮必须匹配新增卷实心青色样式',
    area: '首页左侧导航 / 系统设置入口 / 按钮样式',
    symptom:
      '系统设置、主题颜色、快捷键、导航设置四个入口被做成白底品牌字按钮，和用户指定的正文页新增卷实心青色按钮不一致。',
    cause: '实现时误参考了章节右键菜单里的新增卷文字按钮，而不是正文页侧栏底部的新增卷主按钮。',
    solution:
      '将 SETTINGS_TEXT_BUTTON_CLASS 改为与 ChapterSidebar 底部新增卷一致的 h-8、rounded-md、bg-[#08AACE]、hover:bg-[#0798b8]、text-white 实心按钮样式。',
    prevention: '以后用户用截图指定按钮 UI 时，必须按截图中的可见按钮匹配，不要按同名菜单项或其他入口推断样式。',
    keywords: ['系统设置', '主题颜色', '快捷键', '导航设置', '新增卷', '按钮样式', 'DashboardLayout'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'settings-pages-plain-layout-too-sparse-001',
    title: '设置页去卡片化后不能只留下超宽空白布局',
    area: '系统设置 / 主题颜色 / 快捷键 / 导航设置 / 页面布局',
    symptom:
      '系统设置左侧标签和右侧内容比例失衡，快捷键卡片在超宽页面上显得很散，导航设置列表被压成中间一条窄列，页面整体看起来奇怪。',
    cause:
      '上一轮只移除了页面级卡片外壳，没有补上正式页面需要的内容宽度、分栏比例、标题区和操作区约束，导致控件被视窗宽度直接拉开。',
    solution:
      '给设置页统一设置固定内容宽度和页内骨架：系统设置使用 180px 左栏加内容区，快捷键使用 1180px 内容宽度并把恢复默认移到标题右侧，导航设置改为 1120px 宽列表，主题颜色页同步限制页面宽度。',
    prevention:
      '以后把弹窗改成页面时，不能只删除 rounded/border/shadow；必须同时定义页面最大宽度、标题区、内容滚动区和主要操作区，截图检查宽屏效果。',
    keywords: ['系统设置', '快捷键', '导航设置', '主题颜色', '页面布局', '去卡片化', '宽屏'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'system-settings-window-size-memory-page-shell-001',
    title: '窗口大小记忆和设置页外壳需要统一走真实页面',
    area: '系统设置 / 窗口大小 / 设置页 UI',
    symptom:
      '用户希望打开软件时沿用上一次关闭前的窗口大小，并且系统设置、主题颜色、快捷键、导航设置不要再像卡片一样浮在页面里。',
    cause:
      '窗口状态原本只在主进程里隐式保存，前端系统设置没有可见开关；几个设置路由复用了旧弹窗外壳，页面模式仍保留圆角、边框和阴影。',
    solution:
      '新增窗口大小记忆设置 IPC 和系统设置窗口标签；主进程按 rememberSize 决定是否读取和保存 window-state；设置页页面模式移除外层卡片边框阴影，入口和主要操作按钮改为白底品牌色轻按钮。',
    prevention:
      '以后把弹窗迁移成正式页面时，要区分 modal 外壳和 page 外壳；涉及窗口行为的设置必须落到 Electron 主进程，而不是只做前端开关。',
    keywords: ['系统设置', '窗口大小', 'rememberSize', 'window-state', '主题颜色', '快捷键', '导航设置', '页面外壳'],
    updatedAt: '2026-07-04',
  },
  {
    id: 'desktop-vbs-console-flash-hidden-node-start-001',
    title: '桌面 VBS 启动不应闪出黑色控制台',
    area: '桌面启动器 / 月下PC版.vbs / Windows',
    symptom: '双击月下PC版.vbs时会先闪出一个黑色控制台窗口，然后才显示软件界面。',
    cause:
      'VBS 直接等待控制台版 node.exe 执行 launch-xinyuexia.mjs；部分 Windows/Node 组合即使传入隐藏窗口参数，也可能在 Node 启动阶段短暂显示控制台。',
    solution:
      '月下PC版.vbs 优先查找无控制台的 nodew.exe；没有 nodew.exe 时，通过 WMI Win32_ProcessStartup.ShowWindow=0 后台创建 Node 启动器进程，并让 VBS 立即返回。',
    prevention:
      '以后调整 Windows 启动器时，实际用 wscript.exe 双击验证桌面启动，不只检查脚本语法；新增控制台型中间进程时必须显式隐藏窗口并保留 launcher.log。',
    keywords: [
      '月下PC版.vbs',
      '桌面启动器',
      '黑框',
      'node.exe',
      'nodew.exe',
      'WMI',
      'Win32_ProcessStartup',
      'launcher.log',
    ],
    updatedAt: '2026-07-04',
  },
];
