import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart18: ErrorLogEntry[] = [
  {
    id: 'plot-chain-formal-four-area-timeline-preview-001',
    title: '剧情链正式页左二需要时间线预览框',
    area: '作品编辑器 / 剧情链 / 四区域布局',
    symptom:
      '剧情链左二已选剧情点仍像普通卡片列表，长内容被压缩后不方便顺着主链检查，用户选定测试页的时间线方案后希望正式页也改成四区域中的时间线预览。',
    cause:
      '测试页只完成了时间线方案对比，正式 WorkbenchLibraryPanel 的剧情链 standalone 左二区域仍保留旧卡片承载方式，候选区和右侧生成配置没有问题但中间预览没有迁移。',
    solution:
      '正式剧情链页继续保持四个区域：左一目录、左二时间线预览、左三生成剧情点备选、右四生成配置和 AI 区；左二改为竖向时间线节点和独立滚动全文预览框，并保留标为已写、移回未写、删除、评分和 AI 评价展开功能。',
    prevention:
      '剧情链测试页确认后的方案要迁入正式页时，只替换目标区域，不连带改动候选区和右侧配置；长内容预览不要再用 line-clamp 作为正文承载。',
    keywords: ['剧情链', '正式页', '四区域', '时间线预览', '左二', '预览框', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'plot-chain-long-content-preview-box-designs-001',
    title: '剧情链长内容需要预览框方案对比',
    area: '测试集合 / 剧情链双标签布局测试 / 剧情链预览',
    symptom: '剧情链正式页的剧情点卡片使用行数截断，长内容只能看到前几行，用户希望改成能显示完整内容的预览框。',
    cause: '当前剧情点卡片为了保持列表紧凑使用 line-clamp，适合短梗概但不适合检查一整条剧情点的正文、衔接和 AI 评价。',
    solution:
      '在剧情链双标签布局测试页新增“内容显示方案”切换：方案一全展开卡片，方案二聚焦预览框，方案三时间线预览框；同时拉长测试剧情点内容，真实比较长文本显示效果。',
    prevention:
      '正式页改剧情链卡片前先在测试页确认内容密度；如果要显示完整剧情点，避免继续使用 line-clamp 作为主要正文承载。',
    keywords: [
      '剧情链',
      '内容显示不全',
      '预览框',
      '全展开卡片',
      '聚焦预览框',
      '时间线预览框',
      'PlotChainTabbedLayoutTestPage',
    ],
    updatedAt: '2026-06-10',
  },
  {
    id: 'writing-ai-output-font-size-tool-header-position-001',
    title: '正文 AI 输出字号工具需要放到顶部工具区',
    area: '作品编辑器 / 正文 / 右侧 AI 面板 / 字号设置',
    symptom:
      '正文页右侧 AI 对话框的字号设置显示在输出框底部，和用户标注的顶部红框位置不一致，也挤占对话框底部字数和输入区域附近的空间。',
    cause:
      'WorkbenchAIPanel 把 FontSizeStepper 直接渲染在 xy-floating-chat-shell 内部，并使用 xy-floating-chat-font-tool 贴在对话框边框底部。',
    solution:
      '保留 outputFontSize 状态在 WorkbenchAIPanel 内部，通过 workbench-header-extra-tools portal 将 AI 输出字号 FontSizeStepper 渲染到作品编辑器顶部工具区，删除框内 xy-floating-chat-font-tool。',
    prevention:
      '正文页右侧 AI 面板的全局工具优先放到 WorkbenchHeader 的 extraTools 区；不要把字号、日志这类全局控制塞进输出框边框内部。',
    keywords: ['正文', 'AI输出字号', '字号设置', 'workbench-header-extra-tools', 'WorkbenchAIPanel', 'FontSizeStepper'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'outline-character-editor-should-match-role-form-layout-001',
    title: '大纲人物设定编辑区需要复用角色表单样式',
    area: '作品编辑器 / 大纲 / 人物设定 / 角色编辑',
    symptom:
      '切到大纲左侧“人物设定”后，中间角色编辑区不像原角色页：短字段、分类、存活/死亡和性格/背景/状态大框的间距、尺寸、边框节奏都不对。',
    cause:
      '人物设定模式临时用 grid + flex-1 拼了一个编辑区，没有套用角色页已有的 xy-floating-outline-role-compact、字段尺寸配置、分类下拉对齐和大边框正文框结构。',
    solution:
      '将人物设定编辑区改为角色页同款三列顶部表单：角色名、分类、存活/死亡；下方性格、背景、状态改为全宽独立大边框 textarea，并接入 roleTextFontSize 和字数标签。',
    prevention:
      '把已有页面功能嵌入新导航模式时，不要只复制数据字段；需要同时复用原页面的字段尺寸、边框类、下拉对齐和状态按钮禁用样式。',
    keywords: ['大纲', '人物设定', '角色界面', '角色名', '性格', '背景', '状态', 'xy-floating-outline-role-compact'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'outline-work-character-setting-scope-bottom-create-toolbar-001',
    title: '大纲左侧需要区分作品设定和人物设定',
    area: '作品编辑器 / 大纲 / 左侧导航 / 设定与角色',
    symptom:
      '用户希望原来的“新建 分类 设定 清空”行贴到左侧栏底部，原位置改成“作品设定/人物设定”切换；切到人物设定后左侧目录应显示男主角、女主角、正派配角等角色分类，并把新建设定改为新建角色。',
    cause:
      '大纲页原本只把 SETTING_TAB 当作作品设定库渲染，左侧顶部工具条同时承担创建和清空操作，没有一个独立状态来在大纲页内切换作品设定与角色库。',
    solution:
      '新增 outlineSettingScope，在作品设定模式继续使用设定库，在人物设定模式复用角色库和角色分类；顶部渲染作品设定/人物设定分段按钮，底部固定渲染新建分类与新建设定/角色入口，人物设定模式不显示清空设定。',
    prevention:
      '以后给大纲页增加同栏切换时，要把视觉切换状态和实际数据 tab 拆开：界面仍在大纲页，数据源可映射到 SETTING_TAB 或 ROLE_TAB，避免只改按钮文案导致目录和保存目标错位。',
    keywords: ['大纲', '作品设定', '人物设定', '新建分类', '新建角色', 'outlineSettingScope', 'ROLE_TAB'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'outline-setting-user-request-sent-as-other-requirements-001',
    title: '大纲用户要求需要按其他要求发送给 AI',
    area: '作品编辑器 / 大纲 / 输出日志 / AI请求',
    symptom: '大纲页输出日志里显示“用户要求”，用户希望这部分也实际发送给 AI，并统一使用【其他要求】格式。',
    cause:
      '大纲设定生成请求仍使用【用户要求】作为拼接标题，日志分组标题也沿用默认“用户要求”，和脑洞链路的“其他要求”格式不一致。',
    solution:
      '将大纲设定生成请求中的用户输入块改为【其他要求】；日志分组和侧栏标题同步显示“其他要求”，并确保空输入时不会发送空的其他要求标题。',
    prevention: '大纲、脑洞等生成链路的用户补充输入要统一称为“其他要求”；日志展示标题必须和实际 userContent 包装一致。',
    keywords: ['大纲', '用户要求', '其他要求', '输出日志', 'userContent', 'buildSettingLibraryRequestText'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'outline-linked-brainstorm-lost-after-log-open-001',
    title: '大纲关联脑洞后点击日志会丢失关联',
    area: '作品编辑器 / 大纲 / 关联脑洞 / 输出日志',
    symptom: '用户在大纲页面刚关联脑洞后，点击右上或面板内的“日志”，已关联脑洞状态消失，像是日志操作把脑洞取消关联了。',
    cause:
      'WorkbenchLibraryPanel 用 tabs 数组引用作为 normalizedTabs 的 useMemo 依赖；父组件打开日志时重新渲染并传入新数组，触发配置重读。未开启记忆关联时 readTabConfigs 会剥离 loadedBrainstormId/Title/Text，导致当前会话里的关联也被清掉。',
    solution:
      '新增 tabsSignature，以标签内容而不是数组引用驱动 normalizedTabs；父组件普通重渲染或打开日志不再触发配置重读，也不会清掉当前会话的关联脑洞。',
    prevention:
      '组件 effect 依赖不要直接使用父组件每次 render 都可能新建的数组/对象；涉及临时关联状态时，普通 UI 弹窗开关不能触发 storage 重读和瞬时字段清理。',
    keywords: ['大纲', '关联脑洞', '日志', 'tabsSignature', 'normalizedTabs', 'readTabConfigs', 'loadedBrainstormId'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'workbench-directory-group-bar-height-match-brainstorm-001',
    title: '左侧目录分组条高度需要以脑洞库为准',
    area: '作品编辑器 / 脑洞 / 章纲 / 概要 / 剧情链 / 审核 / 点评 / 状态 / 左侧目录',
    symptom: '章纲、概要、剧情链、审核、点评、状态的左侧分组条比脑洞库条子更高，切换页面时仍有体感上的高度差。',
    cause:
      '这些目录条使用 px-2 py-2、h-7 图标和 py-1.5 计数胶囊；脑洞库条子使用更紧的 px-3 py-1.5、leading-5 和 py-0.5 数量胶囊。',
    solution:
      '将卷条、剧情链条和审核/点评/状态分组条统一到脑洞库同款高度节奏：px-3 py-1.5、text-sm leading-5、h-6 展开图标、rounded-full px-2 py-0.5 计数胶囊。',
    prevention: '统一左侧导航时要以脑洞库分组条为高度基准；新增分组条不要再使用 px-2 py-2 或 py-1.5 的右侧计数胶囊。',
    keywords: ['左侧目录', '脑洞库', '高度', '分组条', 'px-3 py-1.5', 'h-6', 'rounded-full'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'plot-chain-directory-expanded-height-mismatch-001',
    title: '剧情链和审核目录展开后高度节奏不一致',
    area: '作品编辑器 / 剧情链 / 审核 / 点评 / 状态 / 左侧目录',
    symptom:
      '剧情链和审核、点评、状态页面切换或点开左侧分组时，虽然颜色接近，但展开后的高度、间距和按钮节奏仍有明显体感差异。',
    cause:
      '审核/点评/状态目录使用 px-3 py-3 外层、mt-1 网格、36px 序号按钮；剧情链目录仍使用 px-2 py-2 外层、mt-0.5 竖向整行列表和不同的展开间距。',
    solution:
      '将剧情链目录外层改为 px-3 py-3，主链未写剧情点改为 mt-1 网格和 h-9/min-w-9 序号按钮；备选链展开内容也收敛到 mt-1 gap-2 px-1.5 py-1.5。',
    prevention:
      '左侧目录分组样式不仅要统一颜色，也要统一外层 padding、展开 margin、gap 和按钮基础高度；剧情链新增目录项时继续复用审核目录的高度节奏。',
    keywords: ['剧情链', '审核', '点评', '状态', '左侧目录', '高度', '展开', 'px-3 py-3', 'h-9', 'grid'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'workbench-summary-middle-card-half-width-001',
    title: '概要中间章节概要框变成半宽',
    area: '作品编辑器 / 概要 / 中间区域',
    symptom: '概要页中间区域只有一个章节概要框时，卡片仍只占中间区域左半边，右侧留下大片空白，看起来像框突然变小。',
    cause:
      '概要章节卡片复用了旧的双列网格；章纲页通过 isDetailOutlineTab 走单列，但概要页进入 grid-cols-2，即使只有一章也被限制成半宽。',
    solution: '将章纲/概要中间章节卡片列表统一为 grid-cols-1，让概要章节概要框横向撑满中间区域。',
    prevention:
      '章节概要、章纲这类正文预览卡片不要用双列网格压缩主编辑框；需要多列时必须确认空态和单章场景不会出现半宽框。',
    keywords: ['概要', '中间区域', '章节概要', '半宽', 'grid-cols-2', 'grid-cols-1'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'workbench-outline-summary-directory-top-gap-001',
    title: '章纲和概要目录第一卷没有顶到顶部',
    area: '作品编辑器 / 章纲 / 概要 / 左侧目录',
    symptom: '章纲和概要页面切换后，左侧目录的“第一卷”距离顶部明显过大，看起来没有和审核、点评、状态目录对齐。',
    cause:
      '章纲/概要左侧目录在移除可见目录标题后，仍保留了原先承载日志、字号和设置按钮的一行工具栏占位，把第一个卷分组整体向下推。',
    solution:
      '删除章纲/概要左侧目录顶部工具栏占位，让目录滚动区直接承载卷分组；字号和字段设置继续走顶部/header 工具位，不再占用左侧目录高度。',
    prevention:
      '左侧目录标题或工具迁移到其他位置后，要同步移除空容器和 min-height 占位；对齐审核/点评/状态目录时以“aside padding 后直接进入卷组”为基准。',
    keywords: ['章纲', '概要', '第一卷', '左侧目录', '顶部空白', '工具栏占位', '卷分组'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'workbench-left-directory-title-and-plot-chain-group-ui-001',
    title: '左侧目录标题和剧情链分组样式不统一',
    area: '作品编辑器 / 脑洞 / 章纲 / 审核 / 点评 / 状态 / 概要 / 剧情链',
    symptom:
      '概要、章纲、审核、点评页面左上角仍显示目录标题；剧情链主链分组和审核目录卷分组样式不一致，切换页面时左侧导航有明显跳动感。',
    cause: '不同页面的左侧目录分别维护标题、padding 和分组按钮样式，剧情链仍使用旧的浅蓝小条样式。',
    solution:
      '移除章节概要、章纲目录、审核目录、点评目录文字标题；将审核、点评、状态、脑洞/大纲设定库和概要/章纲目录左栏外边距统一到 px-3 py-3；剧情链主链和备选链分组改为审核目录同款青色分组条。',
    prevention:
      '新增左侧导航页时优先复用同一套目录分组结构，不要额外添加左上角文字标题；剧情链分组按钮应保持和章节目录卷按钮一致。',
    keywords: ['左侧目录', '章节概要', '章纲目录', '审核目录', '点评目录', '剧情链', '主链', '备选链'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'outline-empty-setting-fields-readonly-001',
    title: '大纲空态设定名和设定预览无法输入',
    area: '作品编辑器 / 大纲 / 设定名 / 设定预览',
    symptom: '大纲页没有选中任何设定时，设定名和设定预览看起来像输入框，但点击后无法输入内容。',
    cause: '空态分支直接渲染 readOnly 的 input 和 textarea，只能显示“未选择设定”，不会创建或选择可编辑条目。',
    solution:
      '移除空态只读限制；用户首次在设定名或设定预览输入内容时，自动创建一条未分类大纲设定并立即选中，后续继续走正常 updateEntry 编辑链路。',
    prevention:
      '可见输入框不要在空态静默只读；如果没有可编辑目标，要么显示明确空态按钮，要么像本页一样在首次输入时自动创建目标，并补真实 fireEvent.change 交互测试。',
    keywords: ['大纲', '设定名', '设定预览', 'readOnly', '空态', '自动新建', 'updateEntry'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'outline-page-inputs-blocked-by-floating-decoration-001',
    title: '大纲页输入框点击后无法输入',
    area: '作品编辑器 / 大纲 / 章纲 / 设定预览',
    symptom: '大纲页面多个 textarea 或 AI 要求输入框点击后不能稳定输入，表现为光标不进入或输入被拖拽/浮动装饰层干扰。',
    cause:
      '边框嵌入式透明背板和浮动标题装饰层增加后，部分大纲输入区没有显式声明为非拖拽交互区域；一度给 input/textarea 增加 z-index 又会反过来遮住浮动标题；新增的透明背板 label 还会被 :not(.absolute) 规则改成相对定位。',
    solution:
      '给大纲、章纲、卷概要、设定预览和内联 AI 输入 textarea 标记 data-no-modal-drag；让透明背板标签、字数和章节元信息不接收鼠标事件；移除输入框 z-index，保持旧仓库的标签在上、输入框默认层级；透明背板 label 明确恢复 absolute。',
    prevention:
      '新增边框嵌入标题、字数或右上角工具时，要同时检查正文 textarea 是否仍可点击、标题是否不被输入框遮住；不要给通用 input/textarea 提升 z-index，补 data-no-modal-drag 与 pointer-events 回归测试。',
    keywords: ['大纲', '输入框', 'textarea', '无法输入', 'data-no-modal-drag', 'pointer-events', '透明背板'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-generator-frame-title-and-new-session-clear-001',
    title: '生成大纲输出框需要边框标题和新会话清空',
    area: '作品编辑器 / 大纲 / 生成大纲输出框',
    symptom: '大纲生成输出框缺少左上角边框标题，清空入口也被移除后无法从当前对话快速开始新会话。',
    cause:
      '输出框只保留了空状态文字，没有使用边框嵌入标题；此前清空按钮被当作普通框内清空移除，没有区分“开始新会话”的清上下文语义。',
    solution:
      '在输出框左上角添加“生成大纲”透明背板边框标题；右上角新增透明背板清空按钮，调用 clearLibraryAiDialog 清空当前 AI 对话、输入和结果，相当于开启无上下文的新会话。',
    prevention: 'AI 对话输出框的清空按钮要明确区分普通文本清空与新会话清上下文，并用边框嵌入式透明背板保持边线干净。',
    keywords: ['大纲', '生成大纲', '清空', '新会话', '透明背板', 'clearLibraryAiDialog'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'workbench-default-opens-writing-page-001',
    title: '作品编辑器默认入口被上次页面覆盖',
    area: '作品编辑器 / 默认入口',
    symptom: '进入作品编辑器时会恢复上次停留的大纲、章纲或其他页面，而不是默认进入正文页面。',
    cause:
      'WorkbenchPage 在作品加载时读取 xinyuexia_workbench_active_flow_page_ 本地缓存，并在切换创作流时继续写入该缓存。',
    solution: '作品加载时固定 setActiveCreationFlow("writing")，并移除创作流页面的本地缓存恢复与写入逻辑。',
    prevention: '作品编辑器默认入口应由显式产品规则控制；临时导航状态不要跨作品打开流程自动恢复。',
    keywords: ['作品编辑器', '默认入口', '正文', 'activeCreationFlow', 'writing'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-right-preview-font-size-linked-001',
    title: '章纲字号设置漏掉右侧输出框',
    area: '作品编辑器 / 章纲',
    symptom: '调整章纲字号时，中间章纲卡片会变化，但右侧“第N章章纲”输出/编辑框仍保持原字号。',
    cause:
      '右侧 outlinePreviewDraft 框只在聚焦时切换 activeLibraryFontTarget，没有把 textarea 和思考预览内容的 fontSize 绑定到 detailOutlineFontSize。',
    solution:
      '右侧章纲输出框普通编辑态和思考预览态都在章纲页使用 detailOutlineFontSize，并点击思考预览时同步切换到章纲字号目标。',
    prevention: '章纲相关的所有正文框都必须同时接入字号目标和字号渲染值，不能只给中间列表卡片绑定。',
    keywords: ['章纲', '字号设置', '右侧输出框', 'detailOutlineFontSize', 'outlinePreviewDraft'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'outline-output-frame-editability-and-visual-clarity-001',
    title: '大纲输出区域边框发虚且清空入口干扰编辑',
    area: '作品编辑器 / 大纲',
    symptom:
      '大纲页右侧输出区域边框偏浅，空状态“可以在这里生成大纲...”显示发虚；右上角和底部仍有清空按钮，容易干扰编辑判断。',
    cause:
      '大纲右侧输出框复用了 outline-preview 浅灰边框和浅灰空状态文字；输出区仍保留早期的内嵌清空按钮和底部清空操作。',
    solution:
      '给大纲输出框新增 xy-outline-ai-output-frame 黑线样式，移除右侧输出框内嵌清空和底部清空按钮，并把空状态文字改为更清晰的深灰加粗。',
    prevention: '大纲输出/预览类正文框应保持和设定预览一致的清晰边框；清空类危险操作不应默认贴在主要编辑框边缘。',
    keywords: ['大纲', '设定预览', '清空按钮', '黑线', '空状态', 'xy-outline-ai-output-frame'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'library-font-size-follows-focused-editor-001',
    title: '右上角字号设置需要跟随当前点击的文本框',
    area: '作品编辑器 / 脑洞 / 大纲 / 章纲',
    symptom: '脑洞页右上角同时显示多个字号设置，用户需要先判断预览字号和输出字号，空间占用也偏大。',
    cause: '此前按区域渲染多个 FontSizeStepper，没有记录当前正在编辑的文本框，因此无法让一个字号控件复用到不同正文框。',
    solution:
      '新增 activeLibraryFontTarget，点击脑洞预览、脑洞输出、大纲预览或章纲卡片时切换当前字号目标；右上角只渲染一个 FontSizeStepper，并按当前目标读写对应字号配置。',
    prevention: '新增可调字号文本框时，应接入 activeLibraryFontTarget，而不是在 header 里增加第二个字号控件。',
    keywords: ['字号设置', '焦点', '脑洞预览', '脑洞输出', '大纲', '章纲', 'activeLibraryFontTarget'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-multi-output-selection-save-replace-001',
    title: '脑洞多输出需要按勾选保存并限制替换',
    area: '作品编辑器 / 脑洞 / 多输出框',
    symptom:
      '一次生成 3、5、10 个脑洞时，输出框无法单独勾选；保存为新脑洞会保存所有输出，替换脑洞也可能在多输出情况下误用第一条。',
    cause:
      '脑洞 AI 会话只保存 previewTitles 和 previewDrafts，没有记录输出框勾选状态；保存和替换逻辑直接读取全部输出或第一条输出。',
    solution:
      '为脑洞输出预览新增 previewSelectedIndexes，多输出时在每个输出框标题处显示勾选框；保存为新脑洞只保存勾选项，替换脑洞只在恰好勾选 1 个输出时可点击。',
    prevention: '多输出场景的批量保存和单条替换必须共用同一份选择状态，并用回归测试锁定按钮禁用条件。',
    keywords: ['脑洞', '多输出', '勾选', '保存为新脑洞', '替换脑洞', 'previewSelectedIndexes'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-save-title-and-stream-header-tool-001',
    title: '保存新脑洞命名和流式输出位置不符合脑洞页规则',
    area: '作品编辑器 / 脑洞',
    symptom:
      '点击保存为新脑洞时会沿用脑洞输出框标题，生成“脑洞输出框1”一类名称；流式输出开关仍停在输出框边缘，没有进入右上角工具区。',
    cause:
      '保存新脑洞时直接使用预览输出框的 title；流式输出开关仍复用 xy-floating-border-stream-tool 的边框绝对定位样式。',
    solution:
      '保存前读取脑洞库现有“脑洞N”条目并按最大编号连续生成“脑洞1、脑洞2...”名称；新增 header 专用流式输出工具，放在脑洞字号设置左侧。',
    prevention:
      '输出框显示名称和入库名称要分离；移动边框工具到 header 时必须使用非绝对定位的 header 样式并补回归测试。',
    keywords: ['脑洞', '保存为新脑洞', '命名', '流式输出', '右上角', 'xy-header-stream-tool'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'library-preview-font-size-tools-moved-to-header-001',
    title: '脑洞和大纲字号设置统一移动到右上角',
    area: '作品编辑器 / 脑洞 / 大纲',
    symptom:
      '脑洞预览、脑洞输出框和大纲预览的字号设置仍停在内容框边缘，和章纲页面右上角设置位置不一致，也容易占用正文框边缘空间。',
    cause:
      '章纲页已经接入 workbench-header-extra-tools 的顶部工具插槽，但脑洞预览、脑洞输出和大纲预览仍各自在内容框内部渲染 xy-floating-border-font-tool。',
    solution:
      '新增通用 renderLibraryHeaderFontSizeTool，根据当前标签页把脑洞预览字号、脑洞输出字号、大纲预览字号或章纲字号渲染到顶部工具插槽，并移除脑洞/大纲内容框内部的左下字号控件。',
    prevention:
      '同一工作台页面的字号入口统一走 header portal；新增预览字号能力时同步补 source-level 回归测试，避免再次散落到内容框边缘。',
    keywords: ['脑洞', '大纲', '字号设置', '右上角', 'workbench-header-extra-tools', 'FontSizeStepper'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-empty-model-response-shows-blank-output-001',
    title: '脑洞生成空返回会显示空白输出框',
    area: '作品编辑器 / 脑洞 / AI生成链路',
    symptom: '点击生成后脑洞输出框显示 0 字，没有内容，也没有错误提示。',
    cause:
      '修复用户输入回退后，如果模型返回空字符串或请求异常，脑洞输出框会被写入空内容；catch 分支也会把 aiResult 清空，导致用户看不到失败原因。',
    solution:
      '新增 getBrainstormDisplayContent：空返回显示“模型没有返回内容”错误，复读输入显示复读错误；异常分支把错误文本同步写入 aiResult 和 aiOutput。',
    prevention: 'AI生成链路不能把空字符串当作成功输出；所有失败、空返回和异常都必须在主输出框给出可见反馈。',
    keywords: ['脑洞', '空返回', '0字', 'getBrainstormDisplayContent', 'aiResult', 'aiOutput'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-output-falls-back-to-user-request-001',
    title: '脑洞输出框把用户输入当成生成结果',
    area: '作品编辑器 / 脑洞 / AI生成链路',
    symptom:
      '点击脑洞生成后，脑洞输出框显示【其他要求】以及用户填写的题材、故事主题、补充内容，而不是 AI 生成的实际脑洞。',
    cause:
      'getLatestUsefulAiText 在 aiOutput 含有 [[USER]] / [[AI]] 标记但没有有效 AI 内容时，会去掉标记后回退返回整段内容，导致 USER 段被当成可用 AI 输出。部分模型复读输入时也会被直接展示为结果。',
    solution:
      '当内容存在对话标记但没有有效 AI 回答时返回空字符串；新增 isBrainstormEchoedRequest，若模型最终内容与发送的其他要求完全一致，则显示明确错误提示，不再把复读内容作为脑洞结果。',
    prevention:
      '输出预览不能从带 USER 标记的请求文本里回退提取结果；AI结果展示层要区分 pending、空回复、模型复读和真实生成内容。',
    keywords: [
      '脑洞',
      'AI生成',
      '其他要求',
      'getLatestUsefulAiText',
      'isBrainstormEchoedRequest',
      'aiOutput',
      'aiResult',
    ],
    updatedAt: '2026-06-09',
  },
];
