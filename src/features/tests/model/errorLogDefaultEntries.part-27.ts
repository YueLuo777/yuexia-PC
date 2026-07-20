import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart27: ErrorLogEntry[] = [
  {
    id: 'workbench-brainstorm-output-sync-selected-entry-001',
    title: '脑洞切换后右侧输出框仍显示旧内容',
    area: '作品编辑器 / 脑洞 / 脑洞输出框',
    symptom:
      '在脑洞页左侧切换不同脑洞时，中间“脑洞预览”会变化，但右侧“脑洞输出框”仍停留在上一次生成或上一次选中的内容；输出框上方还残留一行重复标题。',
    cause:
      '脑洞列表点击只更新当前选中条目的 selectedId，右侧输出框取值仍来自当前 Tab 的 aiResult/aiOutput；页面化后右侧输出区域又保留了旧分区 header。',
    solution:
      '脑洞列表点击时同步把当前脑洞正文写入脑洞 Tab 的 aiResult，并清空旧 aiOutput，让输出框跟随选中脑洞切换；删除右侧输出框上方重复标题栏，仅保留边框内标签。',
    prevention:
      '同一个内容在预览区和输出区同时展示时，切换选中项必须同步所有展示状态；页面边框标签已经承担标题语义时，不要再保留外层重复 header。',
    keywords: ['脑洞', '脑洞输出框', 'selectedId', 'aiResult', 'aiOutput', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'chapter-editor-status-page-close-button-removed-001',
    title: '状态页面化后仍显示旧弹窗关闭按钮',
    area: '作品编辑器 / 状态页面',
    symptom:
      '作品编辑器顶部切到“状态”页面后，页面 header 右侧仍显示“关闭”按钮；状态已经是嵌入式页面，不应该再出现弹窗关闭入口。',
    cause:
      'ChapterEditor 的状态更新视图同时服务旧弹窗模式和新的 embeddedMode === status 页面模式，但 header 里的关闭按钮没有区分两种模式。',
    solution: '关闭按钮改为仅在非嵌入模式渲染；顶部“状态”页面不再显示“关闭”，旧弹窗模式仍保留关闭能力。',
    prevention:
      '弹窗功能页面化时，所有关闭按钮、遮罩点击关闭和保存后关闭逻辑都要按嵌入模式与弹窗模式分别判断，避免旧弹窗控件残留到页面里。',
    keywords: ['状态', '关闭', 'embeddedMode', 'ChapterEditor', '页面化', '弹窗'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-header-field-size-button-unified-001',
    title: '字段尺寸按钮分散在页面内部且位置不统一',
    area: '作品编辑器 / 顶部工具栏 / 字段尺寸',
    symptom:
      '字段尺寸按钮在不同页面内部各自显示，位置不统一；用户希望移动到作品编辑器顶部右上角，只有当前页面有字段尺寸配置时才显示，正文页隐藏。',
    cause:
      'WorkbenchLibraryPanel 和 ChapterEditor 各自维护字段尺寸弹窗入口，WorkbenchHeader 不知道当前流程是否支持字段尺寸，也没有统一触发当前页面弹窗的通道。',
    solution:
      'WorkbenchHeader 新增右上角可选字段尺寸按钮；WorkbenchPage 按当前流程判断是否显示，并通过打开信号触发当前页面自己的字段尺寸弹窗；WorkbenchLibraryPanel 和 ChapterEditor 支持外部打开信号与隐藏内部按钮，避免重复入口；正文流程不在字段尺寸流程集合内，因此自动隐藏。',
    prevention:
      '跨流程的通用工具入口应放在流程外层统一控制显示，再把动作信号下发给当前页面；不要在多个业务页面里重复放同一个全局工具按钮。',
    keywords: ['字段尺寸', 'WorkbenchHeader', 'WorkbenchPage', 'ChapterEditor', 'WorkbenchLibraryPanel', '顶部工具栏'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'chapter-editor-review-pages-state-isolation-001',
    title: '审核点评页面化后状态串用且概要仍有旧弹窗',
    area: '作品编辑器 / 审核 / 点评 / 状态 / 概要',
    symptom:
      '审核、点评、状态、概要改成顶部页面后，审核和点评仍可能共用同一份 AI 输出、修订草稿和输出日志；正文里的概要按钮还会打开旧概要弹窗；状态页保存后仍执行旧弹窗关闭逻辑。',
    cause:
      'ChapterEditor 里审核和点评沿用单套 reviewAiOutput、reviewRevisedDraft、reviewRequestLog 状态；WorkbenchPage 保留 summaryLibrary modal；状态保存逻辑没有区分嵌入页面和旧弹窗模式；顶部流程分组靠 Header 内部硬编码集合判断。',
    solution:
      '审核和点评改为按 ReviewMode 分别保存输入、输出、修订稿、对比视图、已确认段落和请求日志；AI 流式输出固定写回发起请求时的模式；切换章节会清理旧输出和对比草稿；正文概要入口统一切换到顶部“概要”页面并删除旧概要弹窗；状态页嵌入模式保存后不再关闭页面；流程配置拆成主流程和后处理流程分组。',
    prevention:
      '把弹窗功能页面化时，要同时拆状态、入口、保存后的关闭行为和顶部流程数据结构；AI 流式回调必须绑定请求发起时的业务模式，不能依赖当前正在显示的模式。',
    keywords: ['审核', '点评', '状态', '概要', 'ReviewMode', 'summaryLibrary', 'WorkbenchHeader', 'ChapterEditor'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-brainstorm-flow-kept-outline-tab-001',
    title: '顶部脑洞流程点击后仍停在大纲页',
    area: '作品编辑器 / 顶部创作流程 / 脑洞',
    symptom: '点击顶部“脑洞”流程按钮后，页面仍像停在大纲或其它设定页；作品信息和创作流程也被连成同一个组合按钮。',
    cause:
      '脑洞和大纲共用 WorkbenchLibraryPanel 实例，组件内部 activeTab 会优先读取旧的本地存储；WorkbenchHeader 把作品信息和流程按钮渲染在同一个 xy-capsule-group。',
    solution:
      '内嵌流程页按 activeCreationFlow 设置 React key，并让 defaultActiveTab 优先于旧存储；顶部拆成“作品信息”独立按钮组和单独的创作流程按钮组。',
    prevention:
      '同一组件承载不同流程页时，流程切换必须重置或显式同步内部页签；作品级信息入口和创作流程入口不要共用一个组合按钮。',
    keywords: ['脑洞', '大纲', '创作流程', 'WorkbenchHeader', 'WorkbenchLibraryPanel', 'defaultActiveTab', 'activeTab'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-quick-nav-removed-001',
    title: '作品编辑器左侧快速导航按钮最终删除',
    area: '作品编辑器 / 左侧悬浮导航',
    symptom: '作品编辑器左侧仍有一个 hover 后显示“导航”的悬浮按钮，用户确认不再需要这个功能。',
    cause:
      'WorkbenchQuickNav 作为额外快速导航入口保留在 WorkbenchPage 中，但顶部标签和全局左侧导航已经覆盖主要跳转需求。',
    solution:
      '删除 WorkbenchQuickNav 组件、按钮挂载、快速导航打开状态、导航配置读取，以及 close_floating 中关闭快速导航的分支。',
    prevention: '确认废弃的悬浮入口要删除完整状态链路和快捷键关闭分支，避免留下不可见但仍参与逻辑的功能。',
    keywords: ['快速导航', '导航按钮', 'WorkbenchQuickNav', '悬浮按钮', 'close_floating', '删除功能'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'setting-library-inner-tabs-replaced-by-header-flow-001',
    title: '设定库内部三段页签与顶部创作流程重复',
    area: '作品编辑器 / 创作流程 / 设定库面板',
    symptom:
      '作品编辑器顶部已经有“作品信息、脑洞、大纲、剧情链、章纲、正文”入口，页面内部仍显示“设置、角色、脑洞”三段切换，层级重复且占用纵向空间。',
    cause:
      '设定库面板沿用旧的内部 topTabs 作为设定、角色、脑洞切换入口；创作流程合并到 WorkbenchHeader 后，这个入口没有同步下沉或删除。',
    solution:
      '设定库面板不再渲染内部三段页签；字段尺寸不做全局入口，按当前页面分别放到脑洞、设定/大纲、角色、剧情链、章纲等页面自己的头部区域。',
    prevention:
      '主流程入口统一放在 WorkbenchHeader；页面级工具可以下沉到页面头部，但字段尺寸这类设置必须继续按 activeTab 使用各自的尺寸键，不能混成一套全局配置。',
    keywords: ['创作流程', '设置角色脑洞', '字段尺寸', 'WorkbenchLibraryPanel', 'WorkbenchHeader', 'activeTab'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-quick-nav-misapplied-to-dashboard-sidebar-001',
    title: '作品编辑器快速导航隐藏误作用到首页侧栏',
    area: '首页 / 作品编辑器 / 左侧导航',
    symptom:
      '用户只希望作品编辑器左侧快速导航小按钮平时隐藏、鼠标移过去显示，但首页全局左侧导航也被收起，页面内容被遮挡和挤偏。',
    cause:
      '把需求里的左侧小框误判为 DashboardLayout 全局侧栏，实际目标是 WorkbenchPage 里的 WorkbenchQuickNav 悬浮按钮。',
    solution:
      '恢复 DashboardLayout 固定侧栏；仅把 WorkbenchQuickNav 改为默认透明窄触发区，hover 或键盘 focus 时展开为完整按钮。',
    prevention:
      '涉及左侧按钮/侧栏的需求要先确认作用域，区分全局导航、作品编辑器快速导航和业务面板侧栏；全局布局改动必须检查首页。',
    keywords: ['首页', '左侧导航', '快速导航', 'WorkbenchQuickNav', 'DashboardLayout', 'hover', '作用域'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'embedded-brainstorm-flow-overflows-viewport-001',
    title: '脑洞流程页内容被二次放大后超出屏幕',
    area: '作品编辑器 / 创作流程 / 脑洞',
    symptom: '作品编辑器进入脑洞页后，预览、输出和生成表单纵向超出屏幕，底部内容需要滚到页面外才能看到。',
    cause:
      '作品页内嵌的 WorkbenchLibraryPanel 仍使用 scale=1.1，而应用自身也可能处在 110% 缩放；同时库面板根容器没有显式 h-full，三栏内容在高缩放下容易把外层撑高。',
    solution:
      '内嵌流程页改为 scale=1，保留弹窗场景的放大；库面板根容器和脑洞网格补 h-full/overflow-hidden，让左右栏在自身内部滚动。',
    prevention:
      '内嵌到固定工作区的页面不要再叠加组件级 zoom；高内容密度页面必须在根容器和三栏网格同时设置 h-full、min-h-0 和内部滚动。',
    keywords: ['脑洞', '创作流程', '超出屏幕', 'scale', '110%', 'h-full', 'overflow'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'brainstorm-preview-text-overlaps-floating-label-001',
    title: '脑洞预览正文挤到浮动标签右侧',
    area: '作品编辑器 / 脑洞 / 脑洞预览',
    symptom: '脑洞预览边框标签右侧露出正文片段，看起来像乱码或多余控件。',
    cause:
      '脑洞预览 textarea 复用了普通浮动边框输入框的顶部内边距，第一行正文离上边框太近；当内容较长时会贴到“脑洞预览”标签同一行。',
    solution: '给脑洞预览框增加专用 class，并提高 textarea 顶部内边距，让正文从浮动标签下方开始显示。',
    prevention: '带边框嵌入标签的长文本预览框需要单独校准顶部内边距，不能直接复用单行输入框或短文本框的浮动标签间距。',
    keywords: ['脑洞预览', '浮动标签', '乱码', '正文重叠', 'textarea', '边框标签'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'creation-flow-merged-into-work-info-header-001',
    title: '创作流程需要并入作品信息右侧导航',
    area: '作品编辑器 / 顶部作品信息区 / 创作流程',
    symptom:
      '创作流程以大横条显示在编辑区顶部，占用正文和流程页面的纵向空间；用户希望它并入作品信息右侧，形成“作品信息、脑洞、大纲、剧情链、章纲、正文”的同排入口。',
    cause:
      '流程入口被实现为 WorkbenchPage 内部的页面级横条，而作品信息仍是 WorkbenchHeader 里的单独胶囊按钮，两个入口层级分离，导致主流程没有和作品入口合并。',
    solution:
      '抽出 workbenchCreationFlow 配置作为单一流程来源；WorkbenchHeader 渲染作品信息和五个流程按钮；WorkbenchPage 删除旧创作流程横条，继续复用原 activeCreationFlow 切换逻辑。',
    prevention:
      '作品级主流程入口应集中在作品标题/作品信息同一组导航里；新增或调整流程步骤时先更新共享流程配置，并用顺序测试防止漏掉剧情链或章纲。',
    keywords: ['创作流程', '作品信息', '脑洞', '大纲', '剧情链', '章纲', '正文', 'WorkbenchHeader'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'management-drawer-card-compression-toggle-001',
    title: '右侧滑出管理页会压缩模型卡片且管理按钮不能再次收回',
    area: '测试集合 / 右侧滑出管理页测试 / 模型管理与提示词管理',
    symptom:
      '模型管理从工作区右侧滑出后，模型卡片被抽屉宽度挤压变形；已经打开同类管理页时，再次点击“管理”只会保持打开，不能收回。',
    cause:
      '完整模型管理页被直接渲染进较窄的抽屉区域，但抽屉内容没有保留管理页所需的最小宽度；管理按钮事件只执行 setDrawerType 打开，没有做同类型再次点击关闭的切换逻辑。',
    solution:
      '抽屉滚动容器内部增加最小宽度，模型管理保留 1180px、提示词管理保留 980px，窄屏时通过横向滚动避免卡片被压缩；新增 toggleDrawer，同类型再次点击时关闭抽屉，不同类型点击时切换内容。',
    prevention:
      '把完整管理页嵌入侧滑抽屉时，必须先决定使用最小宽度滚动方案或专门的紧凑模式；所有管理入口都应使用可开可关的幂等切换事件。',
    keywords: ['右侧滑出', '模型管理', '提示词管理', '卡片变形', '管理按钮', '抽屉', 'toggleDrawer'],
    updatedAt: '2026-06-02',
  },
  {
    id: 'plot-chain-to-outline-and-linked-context-inheritance-001',
    title: '剧情链和章纲需要减少重复关联与重复选择',
    area: '作品编辑器 / 生成剧情链 / 生成章纲 / 关联设定',
    symptom:
      '用户在生成剧情链和章纲之间切换时，需要反复关联设定；剧情链选中后也缺少直接进入章纲生成的入口，提示词选择还会在剧情链和章纲之间互相覆盖。',
    cause:
      '章纲和剧情链虽然共用同一组页面配置，但设定关联没有默认继承当前大纲设定；提示词只保存一个 promptId，剧情链分类和章纲分类会争用同一个字段；剧情链页面没有把已选剧情链交给章纲页面的显式按钮。',
    solution:
      '章纲/剧情链在未手动配置关联时自动继承当前大纲设定；剧情链页新增“生成章纲”按钮，把当前已选剧情链写入章纲输入框并切到章纲页；剧情链、章纲、概要分别保存自己的提示词选择。',
    prevention:
      '跨步骤工作流要把可继承的上下文和用户主动选择分开保存；不同提示词分类不要共用同一个 promptId；会消耗 token 的步骤必须保留手动触发按钮。',
    keywords: ['剧情链', '章纲', '关联设定', '自动继承', '提示词记忆', '生成章纲'],
    updatedAt: '2026-06-02',
  },
  {
    id: 'chapter-review-action-group-label-wrap-001',
    title: '章节工具组合按钮文字被拆成两行',
    area: '作品编辑器 / 章节工具栏 / 审核点评状态概要按钮',
    symptom: '审核、点评、状态、概要四个两字按钮在组合按钮里被拆成上下两行，影响识别。',
    cause:
      '组合按钮宽度较窄时，四个按钮等分后的可用宽度不足；按钮内部横向内边距偏大，又没有禁止中文换行，导致浏览器按单字折行。',
    solution:
      '给组合按钮文本增加 whitespace-nowrap，并把分段按钮横向内边距从 px-3 收窄到 px-1.5，确保两字标签保持一行显示。',
    prevention:
      '窄分段按钮使用中文短标签时必须显式禁止换行，并让内边距随按钮宽度收敛，避免字段尺寸设置压缩后文字竖排。',
    keywords: ['章节工具栏', '组合按钮', '审核', '点评', '状态', '概要', '换行'],
    updatedAt: '2026-06-02',
  },
  {
    id: 'plot-chain-source-ai-only-002',
    title: '剧情链来源只保留 AI 生成后，需同步删除冗余来源说明',
    area: '作品编辑器 / 生成剧情链 / 来源说明',
    symptom: '剧情库已经隐藏后，剧情链里仍显示“来源：AI生成”这一行，界面上只剩单一来源却还保留说明，显得重复。',
    cause:
      '剧情链请求和右侧生成规则里，仍保留了把来源单独当成一项展示的旧逻辑；在来源只剩 AI 生成时，这个字段不再提供有效决策信息。',
    solution:
      '移除剧情链右侧的来源说明行，并从生成请求文本里删除“来源：AI生成”描述，默认直接按 AI 生成处理，不再把来源当作可选配置项。',
    prevention: '当功能入口被隐藏或收敛为单一路径时，要同步清理页面展示和请求构造里的冗余字段，避免重复表达。',
    keywords: ['剧情链', 'AI生成', '来源说明', '冗余字段'],
    updatedAt: '2026-06-02',
  },
  {
    id: 'brainstorm-entry-promoted-to-top-workflow-001',
    title: '生成脑洞需要作为开书流程第一步独立入口',
    area: '作品编辑器 / 顶部工具条 / 创作流程',
    symptom:
      '脑洞页藏在生成大纲弹窗内部，顶部工具条缺少“生成脑洞”第一步；用户从零写小说时，流程不如“脑洞、大纲、剧情链、章纲”清晰。',
    cause:
      'WorkbenchHeader 只暴露生成大纲、生成剧情链、生成章纲等入口，生成大纲弹窗默认还打开脑洞页，导致按钮语义和实际打开页混在一起。',
    solution:
      '顶部工具条新增“生成脑洞”按钮并放在“生成大纲”左侧；点击生成脑洞时强制打开脑洞页，点击生成大纲时强制打开大纲页；弹窗标题随入口显示“生成脑洞”或“生成大纲”。',
    prevention:
      '全局顶部工具条应表达从零创作主流程；同一个弹窗承载多个页签时，入口按钮必须显式指定默认页签，不能依赖上次打开状态。',
    keywords: ['生成脑洞', '生成大纲', '顶部工具条', '脑洞', '大纲', '创作流程'],
    updatedAt: '2026-06-02',
  },
  {
    id: 'chapter-summary-moved-into-review-action-group-001',
    title: '章节概要入口需要并入章节工具组合按钮',
    area: '作品编辑器 / 顶部导航 / 章节工具栏',
    symptom:
      '章节概要作为顶部独立导航按钮，和每章写完后的审核、点评、状态收尾流程割裂；大纲设定按钮命名也不够贴近生成流程。',
    cause:
      '章节概要入口放在 WorkbenchHeader 导航里，而审核、点评、状态在 ChapterEditor 章节工具栏里，两个入口分属不同操作层级。',
    solution:
      '顶部“大纲设定”改名为“生成大纲”；移除顶部“章节概要”导航项，把概要入口作为审核/点评/状态组合按钮右侧的新分段按钮，点击仍打开原章节概要弹窗。',
    prevention: '每章收尾相关操作应集中在章节工具栏，同类按钮优先做成组合按钮；顶部导航保留更偏全局的生成入口。',
    keywords: ['章节概要', '概要', '审核', '点评', '状态', '生成大纲', '组合按钮'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-library-related-content-moved-to-hidden-section-001',
    title: '剧情库相关入口需要从主流程隐藏并保留恢复记录',
    area: '导航 / 隐藏专区 / 生成剧情链',
    symptom:
      '剧情库当前不适合主流程使用，但提炼剧情、提取设定和剧情链来源里的剧情库/混合仍会出现在日常入口里，容易让用户误入旧流程。',
    cause:
      '导航只有创作专区和测试专区，没有专门收纳隐藏功能的位置；剧情链来源按钮仍保留剧情库和混合来源，即使禁用也会占据主操作区。',
    solution:
      '新增“隐藏专区”，第一项为“隐藏内容”总览，下面保留“提炼剧情”和“提取设定”隐藏入口；隐藏内容页记录隐藏位置、隐藏原因和恢复方法；剧情链来源区只显示 AI生成，剧情库和混合从正式按钮中隐藏。',
    prevention:
      '不再主推但可能恢复的功能不要直接删除，应移动到隐藏专区并记录恢复点；主流程按钮区只保留当前推荐路径，减少误点。',
    keywords: ['隐藏专区', '隐藏内容', '剧情库', '提炼剧情', '提取设定', '生成剧情链', 'AI生成'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-chain-source-order-and-disable-menu-001',
    title: '剧情链来源按钮顺序和禁用入口不符合使用习惯',
    area: '作品编辑器 / 生成剧情链 / 来源按钮',
    symptom:
      '剧情链来源按钮里“剧情库”排在“AI生成”前面，不符合当前更常用 AI 生成的流程；剧情库和混合也没有临时禁用入口，容易误点不可用来源。',
    cause: '来源按钮顺序固定为剧情库、AI生成、混合，来源状态只保存当前选择，没有保存可禁用来源列表，也没有右键菜单。',
    solution:
      '将来源按钮顺序改为 AI生成、剧情库、混合；给剧情库和混合增加右键菜单，可禁用或取消禁用，禁用状态写入 tabConfigs；如果禁用当前来源则自动切回 AI生成。',
    prevention:
      '带来源切换的生成工具应让默认高频来源靠前；可选来源如果可能临时不可用，应支持持久禁用并避免当前配置停留在不可点击状态。',
    keywords: ['剧情链', '来源', 'AI生成', '剧情库', '混合', '右键菜单', '禁用'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-chain-opening-candidates-drift-to-followup-001',
    title: '剧情链空链候选后几条漂移成第一章续写',
    area: '作品编辑器 / 生成剧情链 / 空剧情链开头候选',
    symptom:
      '空剧情链生成 5 个候选时，前几条像第一章开场，但后几条会写成系统已激活、主角开始兑换资源、事件已经发生后的推进内容，更像第一章后半段或第二章。',
    cause:
      '提示词只强调“同一进度”和“第一章开头”，没有定义第一章开场必须包含读者首次进入故事时的主角处境、场景、压力或异变触发，模型容易把后续规划也当作开头候选。',
    solution:
      '在剧情链请求、输出格式规则和剧情链2种子提示词里补充空链专用硬规则：每条候选都必须从真正的第一章第一幕写起，禁止默认系统已激活、奖励已发放、战斗已开始、学校已爆炸或任务已推进到中段。',
    prevention: '凡是要求“同批开头候选”的提示词，都要同时约束候选进度和第一幕起点，避免模型用候选编号暗中推进时间线。',
    keywords: ['剧情链', '第一章', '开头候选', '同一进度', '续写', '剧情链2'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-chain-close-while-thinking-stale-loading-001',
    title: '剧情链思考中关闭后再次打开卡在思考状态',
    area: '作品编辑器 / 生成剧情链 / 弹窗关闭与流式请求',
    symptom:
      '剧情链 AI 正在思考时关闭窗口，再次打开剧情链弹窗，会恢复显示“正在思考...”，但实际请求已经没有可继续刷新的界面回调，看起来一直没有动作。',
    cause:
      '剧情链弹窗关闭会卸载 WorkbenchLibraryPanel，但流式请求没有在卸载时统一中止；同时 plotPointPreviewDraft 已经把“正在思考...”持久化到 tabConfigs，重新打开时恢复了死的占位文本。',
    solution:
      '为剧情链 standalone 面板增加卸载清理：关闭时 abort 当前 AbortController，并在持久化草稿仍是思考占位时写入“已中止”提示，避免下次打开继续显示假的加载状态。',
    prevention:
      '所有会卸载的 AI 流式弹窗都要在卸载 cleanup 中中止请求，并清理已持久化的 loading 占位；loading 文案不能作为可恢复结果长期保存。',
    keywords: ['剧情链', '正在思考', '关闭窗口', 'AbortController', '流式请求', '持久化'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'prompt-editor-content-blurry-and-plot-chain2-format-001',
    title: '提示词编辑内容发虚且剧情链2未参考剧情链格式',
    area: '提示词管理 / 小说提示词 / 剧情链',
    symptom:
      '从剧情链管理进入小说提示词后，编辑弹窗里的“提示词内容”文字看起来发虚；同时“剧情链2”没有明确参考同分类“剧情链”提示词的格式和生成规则。',
    cause:
      '提示词内容 textarea 使用 antialiased 字体渲染类，在弹窗层级里容易显得发灰发虚；剧情链2种子提示词是固定文本，没有读取本地“剧情链”提示词作为参考。',
    solution:
      '移除提示词内容编辑器的 antialiased 类，增加专用清晰渲染样式；剧情链2种子提示词改为动态生成，若本地存在“剧情链”提示词，则把它作为参考格式与规则，同时保留同一进度候选的硬规则。',
    prevention:
      '长文本编辑器不要套用弱化字体渲染类；同分类派生提示词应能引用主提示词格式，但硬规则必须单独保留，避免参考内容覆盖业务约束。',
    keywords: ['提示词管理', '小说提示词', '提示词内容', '模糊', '剧情链2', '剧情链'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-chain-same-stage-candidates-not-sequential-001',
    title: '剧情链候选被误生成成连续章节',
    area: '作品编辑器 / 生成剧情链 / 提示词与继续生成',
    symptom:
      '用户需要一次生成 5 个同进度备选，例如 5 个都能作为第一章开头；选中其中一个后，再继续生成 5 个衔接该剧情点的下一步备选。但 AI 会把剧情点 1/2/3 理解成第一章/第二章/第三章连续推进。',
    cause:
      '内置“剧情链2”提示词只要求连续编号，没有说明编号是候选序号；生成请求也需要在空链和已有剧情链两种状态下重复强调“同一进度备选”。',
    solution:
      '更新剧情链输出格式和“剧情链2”种子提示词，明确同一批候选都是同一进度的独立备选：空链时全是第一章/开头备选，有链时全是已选剧情链后的下一步备选；同时只迁移内置 seed-plot-chain-2，避免覆盖用户自建提示词。',
    prevention:
      '候选列表的编号必须和章节顺序彻底解耦；涉及“继续生成”的提示词要同时说明当前进度、下一进度和禁止连续章节误解。',
    keywords: ['剧情链', '剧情链2', '同一进度', '第一章', '继续生成', '提示词'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-chain-seeded-prompt-not-visible-001',
    title: '剧情链2提示词没有出现在剧情链分类下拉框',
    area: '提示词管理 / 剧情链 / 种子提示词',
    symptom:
      '剧情链弹窗的提示词下拉框只显示“剧情链”，用户看不到新增的“剧情链2”，误以为下拉框只读取了一个提示词而不是剧情链分类。',
    cause:
      'jsonStorage 在 localStorage 没有提示词数据时直接返回 fallback，不会执行 normalize，因此种子提示词只在已有提示词数据被 normalize 时追加；同时种子没有写回本地提示词库，已打开页面也可能不同步。',
    solution:
      '把提示词存储 fallback 改为包含种子提示词；usePrompts 初始化时检测本地库是否缺少种子，缺少则写回 promptsStorage 并触发同步，确保“剧情链2”真实进入剧情链分类。',
    prevention:
      '需要默认可见的种子数据不能只依赖 normalize 临时合并；应同时覆盖空存储 fallback，并在初始化时补写本地存储。',
    keywords: ['剧情链', '剧情链2', '提示词', '种子提示词', 'localStorage'],
    updatedAt: '2026-06-01',
  },
  {
    id: 'plot-chain-ai-generated-prompt-seed-001',
    title: '剧情链缺少适合 AI 生成的默认提示词',
    area: '作品编辑器 / 生成剧情链 / 提示词',
    symptom:
      '用户觉得剧情库来源不好用，希望有一个专门让 AI 根据关联设定、生成规则和用户要求生成精炼剧情点的提示词，并放在剧情链分类里，名称为“剧情链2”。',
    cause: '剧情链分类已存在，但本地提示词库没有内置适合 AI 自由生成剧情点的种子提示词，用户需要手动创建才能使用。',
    solution:
      '在提示词读取层增加“剧情链2”种子提示词：已有同名剧情链提示词时不重复创建；没有时自动显示在剧情链分类中，并可在提示词管理里编辑保存。',
    prevention: '新增工作流入口时，如果依赖专门提示词，应同时提供同分类种子提示词，并避免覆盖用户后续手动修改。',
    keywords: ['剧情链', '提示词', '剧情链2', 'AI生成', '种子提示词'],
    updatedAt: '2026-06-01',
  },
];
