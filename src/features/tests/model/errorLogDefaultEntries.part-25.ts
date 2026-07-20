import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart25: ErrorLogEntry[] = [
  {
    id: 'workbench-brainstorm-short-placeholders-001',
    title: '脑洞题材和故事主题占位文字过长',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页“题材”和“故事主题”两个短输入框里的占位示例过长，在窄框里容易换行或显示拥挤。',
    cause: '占位文字沿用了较完整的示例列表，和当前短字段的可视宽度不匹配。',
    solution: '题材占位改为“如都市、玄幻”；故事主题占位改为“如系统流”。',
    prevention: '短字段占位只保留一到两个最关键示例，避免示例文本比输入框本身更抢眼。',
    keywords: ['脑洞页', '题材', '故事主题', '占位文字', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-count-buttons-still-wrap-001',
    title: '脑洞数量按钮去掉单位后仍然换行',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页“一次生成几个脑洞”按钮去掉“个”后，10 仍被挤到第二行，外框也保留了两行高度。',
    cause: '数量按钮仍使用 min-w-[50px]、h-9、gap-2 和可换行布局；外框内边距与最小高度也按两行按钮保留。',
    solution:
      '按钮缩为 h-8 min-w-[40px] px-2，选项容器改为 flex-nowrap gap-1.5 px-3，外框高度收紧为单行显示需要的 64px。',
    prevention: '数量选择这类固定少量选项应同时控制按钮宽度、容器 nowrap 和外框高度，不能只删单位文字。',
    keywords: ['脑洞页', '一次生成几个脑洞', '数量按钮', '一行显示', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-setting-sidebar-scrollbar-narrow-001',
    title: '大纲设定左侧滚动条过宽',
    area: '工作台 / 大纲设定 / 左侧分类列表',
    symptom: '大纲页面左侧设定分类列表的滚动条偏粗，视觉上比列表内容更抢眼。',
    cause: '左侧分类列表只使用普通 overflow-y-auto，没有接入当前工作台列表专用的细滚动条样式。',
    solution:
      '给左侧分类列表增加 xy-setting-sidebar-scrollbar 专用 class，并把 WebKit 滚动条宽度设为 5px，约为常用 8px 滚动条的 60%。',
    prevention: '只调整特定侧栏滚动条时使用专用 class，避免把全局滚动条或正文编辑区滚动条一起改细。',
    keywords: ['大纲设定', '左侧列表', '滚动条', '60%', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-count-option-unit-wrap-001',
    title: '脑洞数量按钮带“个”导致一行放不下',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页“一次生成几个脑洞”数量选项显示为 1个 / 2个 / 3个 / 5个 / 10个，按钮文字偏宽，容易换成两行。',
    cause:
      '数量选项自身已经位于“几个脑洞”的字段标题下，按钮里再次显示单位“个”造成冗余占宽；旧配置也会把 3个 这类值直接保存。',
    solution:
      '数量按钮改为只显示 1 / 2 / 3 / 5 / 10；读取和写入数量字段时归一旧的 N个 值为纯数字，保证旧数据仍能正确高亮。',
    prevention: '同一字段标题已经说明单位时，胶囊选项只显示核心值；回归测试同时断言不会再渲染 3个 按钮。',
    keywords: ['脑洞页', '一次生成几个脑洞', '数量选择', '个', '一行显示'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-count-field-clickable-only-001',
    title: '脑洞数量选择需要改成不可输入的浮动外框',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页“一次生成几个脑洞”只是普通按钮行，视觉上不像“你的构思”这类浮动边框输入框。',
    cause: '数量选择虽然在表单字段循环里渲染，但缺少独立外框样式，内部也没有明确的“只点击数字、不输入文本”结构约束。',
    solution:
      '新增 xy-brainstorm-count-field 外框，沿用浮动标签边框风格；内部保留 1 / 2 / 3 / 5 / 10 数字按钮，不渲染文本框。',
    prevention:
      '选择类字段如果需要和输入框视觉一致，应使用不可输入的 field 容器包住可点击选项，并用测试确认容器内没有 textbox。',
    keywords: ['脑洞页', '一次生成几个脑洞', '数量选择', '浮动外框', '不可输入'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-question-panel-horizontal-scroll-001',
    title: '脑洞页面右侧表单出现左右滚动条',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页面右侧生成配置表单底部出现横向滚动条，页面在窄宽度下可以左右滚动。',
    cause:
      '脑洞表单容器使用了 overflow-y-auto 的滚动容器，内部计数按钮行固定单行排列，窄宽度下内容撑出容器宽度并触发横向滚动。',
    solution:
      '把脑洞表单容器改为固定 overflow-hidden 布局，增加 xy-brainstorm-question-panel 限制内部最大宽度；计数按钮行改为可换行的 xy-brainstorm-count-options。',
    prevention: '固定页面里的右侧配置表单不能使用会暴露横向滚动的容器；胶囊按钮组在窄宽度下应允许换行或收缩。',
    keywords: ['脑洞页', '横向滚动条', '右侧表单', 'overflow-hidden', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-output-clear-font-tool-swap-001',
    title: '脑洞输出框清空与字号控件位置需要互换',
    area: '工作台 / 脑洞库 / 输出框工具',
    symptom: '脑洞库右侧输出框的“清空”按钮位于下方操作区，字号设置占用输出框右上角，和正文页面对话框的工具布局不一致。',
    cause:
      'WorkbenchLibraryPanel 的脑洞输出区把 FontSizeStepper 放在通用右上角浮动工具里，而清空按钮渲染在输入框下方操作栏。',
    solution:
      '把“清空”移动到脑洞输出框右上角边框工具；把“脑洞输出字号”移动到输出框左下角边框位置，并新增回归测试锁定位置类。',
    prevention:
      '脑洞输出框、正文对话框这类大文本浮动框应保持工具分区一致：危险/清空操作在右上，字号等辅助调节在左下或不遮挡正文的位置。',
    keywords: ['脑洞库', '清空', '字号设置', '输出框', 'WorkbenchLibraryPanel', 'FontSizeStepper'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-creation-flow-brainstorm-first-001',
    title: '工作台创作流程按钮顺序需要脑洞前置',
    area: '工作台 / 顶部创作流程',
    symptom:
      '工作台顶部创作流程按钮显示为“大纲 / 剧情链 / 章纲 / 正文 / 脑洞”，脑洞入口排在正文后面，不符合当前希望先脑洞再进入大纲的创作路径。',
    cause: 'WORKBENCH_MAIN_FLOW_STEPS 的共享流程配置仍把 brainstorm 放在主流程末尾，顶部 Header 直接按该数组顺序渲染。',
    solution: '把 brainstorm 移到创作流程首位，并同步更新流程顺序回归测试和 Header 渲染顺序测试。',
    prevention: '调整工作台顶部流程顺序时优先修改 workbenchCreationFlow.ts 的共享配置，并用 Header 测试锁定视觉顺序。',
    keywords: ['工作台', '创作流程', '脑洞', '大纲', 'WorkbenchHeader', 'workbenchCreationFlow'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-ai-chat-delete-session-status-hidden-001',
    title: '删除当前 AI 会话后顶部状态提示暂时隐藏',
    area: '正文续写 / AI 对话框 / 会话删除',
    symptom: '正文续写 AI 对话框点击“删除”后，页面最上方会显示“已删除当前会话并新建空会话”，遮挡当前操作视线。',
    cause: 'WorkbenchAIPanel 在删除最后一个会话并重建空会话时调用了 flashStatus，触发顶部状态条。',
    solution: '移除删除会话分支里的状态提示调用，保留删除、停止输出、清空上下文和新建空会话逻辑不变。',
    prevention:
      '会话删除这类用户明确点击后的即时操作，若没有失败或阻断，默认不再追加顶部状态提示；需要恢复时先确认是否会遮挡工作区。',
    keywords: ['正文续写', 'AI对话框', '删除会话', '顶部提示', 'flashStatus', 'WorkbenchAIPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-ai-chat-session-old-left-placement-001',
    title: '正文续写会话按钮没有恢复旧版左上位置',
    area: '正文续写 / AI 对话框 / 会话按钮',
    symptom:
      '正文续写 AI 对话框的 + / 1 会话按钮仍不像旧版仓库，按钮组偏向内容框中部，看起来没有恢复到原来的左上边框位置。',
    cause:
      '上次修复只把按钮从内容区挪回边框，但额外使用了 left: var(--xy-chat-session-tool-left, 6.25rem) 和新的宽度计算；旧仓库 YueLuo777/yuexia-PC 实际使用的是 left: 1.1rem、max-width: calc(100% - 8.5rem)，垂直位置继承通用 xy-floating-edge-tool。',
    solution:
      '读取旧仓库 src/shared/styles/index.css 后，把 xy-floating-chat-session-tool、xy-floating-chat-action-tool 和子容器规则恢复到旧版横向定位；更新回归测试锁定旧版左上位置。',
    prevention: '恢复旧 UI 时必须先对照旧仓库具体 CSS，不要只凭截图推断新的安全间距。',
    keywords: ['正文续写', 'AI对话框', '会话按钮', '左上位置', 'yuexia-PC', 'xy-floating-chat-session-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'chapter-sidebar-non-empty-volume-native-alert-001',
    title: '删除非空卷提示使用系统原生弹窗',
    area: '作品编辑器 / 正文 / 卷删除提示',
    symptom:
      '右键卷名删除仍包含章节的卷时，提示“该卷下还有章节，请先删除章节”会以系统原生窗口弹出，标题栏和按钮风格都不像月下写作内的提示框。',
    cause: 'ChapterSidebar 在非空卷阻断分支直接调用 window.alert，绕过了项目里的 ConfirmDialog 统一弹窗样式。',
    solution:
      '给 ConfirmDialog 增加可选单按钮模式；删除非空卷时打开应用内“无法删除卷”提示，使用 warning 图标和单个“确定”按钮。',
    prevention: '业务阻断、确认、警告类提示都应优先复用共享弹窗，不要在 React 组件里新增 window.alert。',
    keywords: ['正文', '卷删除', 'window.alert', 'ConfirmDialog', '提示框', 'ChapterSidebar'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-ai-chat-session-tool-inside-content-001',
    title: '正文续写会话按钮跑进 AI 对话内容框',
    area: '正文续写 / AI 对话框 / 会话按钮',
    symptom:
      '正文续写的 AI 对话框左上会话按钮（+、1）显示在内容框内部，空态“暂无对话内容...”也被顶部预留空间挤得偏低。',
    cause:
      '正式样式里左侧会话工具覆写了通用边框工具定位，使用 top: 0.65rem 和 transform: none，导致它不再贴在上边框，而是落进滚动内容区；聊天内容区还保留了 2.75rem 顶部内边距。测试集合的右侧 AI 面板复刻页也硬编码了 top-2 和 pt-12，所以同样会复现。',
    solution:
      '让 xy-floating-chat-session-tool 回到 top: 0 与 translateY(-50%) 的边框嵌入定位；把正式聊天记录区顶部内边距恢复到正常内容留白；同步把复刻页的正文会话按钮、删除/清空按钮移到上边框，并取消空态的大顶部 padding。',
    prevention:
      '边框嵌入工具需要保持和 xy-floating-edge-tool 一致的垂直定位，只允许左右位置、宽度这类轴向差异；测试复刻页不能用另一套会漂移的硬编码布局。',
    keywords: [
      '正文续写',
      'AI对话框',
      '会话按钮',
      '暂无对话内容',
      'xy-floating-chat-session-tool',
      '边框工具',
      '复刻页',
    ],
    updatedAt: '2026-06-07',
  },
  {
    id: 'test-collection-left-swipe-show-index-001',
    title: '测试内容页左滑不能返回测试总页',
    area: '测试集合 / 右键手势 / 返回测试',
    symptom: '在测试集合里打开某个测试内容后，右键向左滑动手势不再退回测试总页。',
    cause:
      '测试内容页使用 TestCollectionPage 内部 activePath 状态切换，浏览器路由仍停在 /test-collection；全局左滑只执行回首页逻辑，没有派发测试集合已有的“显示测试总页”事件。',
    solution:
      '全局左滑在当前路由为 /test-collection 时派发 TEST_COLLECTION_SHOW_INDEX_EVENT，由测试集合清空 activePath；其他页面继续保持左滑回首页。手势预览文案在测试页同步显示“返回测试”。',
    prevention: '对内部状态模拟子页面的模块，导航手势不能只依赖浏览器 history，应复用模块自己的返回事件或显式回调。',
    keywords: ['测试集合', '左滑', '右键手势', '返回测试', 'AppFrame', 'TestCollectionPage'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'plot-point-reader-clear-restores-default-001',
    title: '剧情链右侧关联设定点击 X 后会自动恢复',
    area: '作品编辑器 / 剧情链 / 关联设定 / AI 对话框',
    symptom: '剧情链右侧 AI 对话框下方已经显示“已关联”，点击 X 取消关联后，界面仍然显示已关联，像是取消无效。',
    cause:
      '章纲/剧情链关联读取存在默认继承逻辑；当关联 id 未显式配置时，会自动继承可读取设定或默认角色。清空后如果没有记录“用户已手动处理过关联”，默认继承又会把内容补回来。',
    solution:
      '给关联读取配置增加手动处理标记；确认读取或点击 X 清空后写入该标记，并把设定、角色、章纲 id 清成空数组，后续不再自动继承默认关联。',
    prevention:
      '带默认继承的关联选择器必须区分“从未配置”和“用户主动清空”，不能只用空值判断，否则清空类按钮会被默认值回填。',
    keywords: ['剧情链', '关联设定', '取消关联', '默认继承', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-ai-log-button-field-size-left-scope-001',
    title: '作品编辑器日志按钮需要移动到字段尺寸左侧且防止串日志',
    area: '作品编辑器 / 大纲 / 章纲 / 剧情链 / 设定 / 脑洞 / 输出日志',
    symptom:
      '部分页面的日志按钮仍放在模型提示词组合框右侧，和字段尺寸按钮位置不统一；大纲、章纲、剧情链日志共用同一打开状态时，容易显示成其他页面的输出日志。',
    cause:
      '日志入口位置分散在不同右侧配置区；设定脑洞日志和大纲类日志共用 isLibraryAiLogOpen 与 lastLibraryAiRequestLog，没有明确区分当前打开来源。',
    solution:
      '把日志按钮统一移动到字段尺寸按钮左侧；新增日志来源 scope，将设定/脑洞日志和大纲/章纲/剧情链日志分开打开与保存，大纲按钮只渲染大纲类输出日志。',
    prevention:
      '新增输出日志入口时必须同时声明日志来源，并把入口放在页面工具按钮组里；不要把日志按钮继续塞在模型提示词组合框旁边。',
    keywords: ['作品编辑器', '输出日志', '字段尺寸', '大纲', '章纲', '剧情链', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-ai-config-combined-gear-right-click-disable-001',
    title: '作品编辑器 AI 配置需要统一为组合齿轮框',
    area: '作品编辑器 / 右侧 AI 配置 / 脑洞提示词禁用',
    symptom:
      '测试页已经确认模型和提示词应放在同一个组合框里，标签旁使用标准齿轮；正式作品编辑器多个页面仍是上下两个独立选择框，状态页缺少同位置 AI 配置，脑洞页还用独立禁用提示词图标。',
    cause:
      '组合框方案先落在测试页，没有抽成正式可复用控件；提示词禁用能力绑定在 CapsuleSelect 内部图标上，和新的组合框结构不一致。',
    solution:
      '新增组合 AI 配置控件并替换作品编辑器内大纲、角色、脑洞、概要、章纲、剧情链、审核、点评的模型/提示词选择；状态页右栏同位置补充组合 AI 配置；提示词禁用改为右键提示词段弹出“禁用/启用”菜单。',
    prevention:
      'AI 配置视觉方案从测试页转正时要抽成共享控件，并同时迁移管理入口、禁用入口、输出日志相邻布局和状态页等后处理页面。',
    keywords: ['作品编辑器', 'AI配置', '组合框', '齿轮', '脑洞', '右键菜单', '状态'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'right-panel-combined-config-management-entry-001',
    title: '右侧 AI 配置组合框需要模型和提示词管理入口',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏方案预览',
    symptom:
      '组合后的模型/提示词下拉框顶部只有“模型”和“提示词”标签，用户希望在两个标签右侧各增加齿轮管理入口，并分别打开模型管理或提示词管理窗口。',
    cause: '测试页先验证了模型和提示词合并成组合下拉框，但没有同步补回原来单独选择框里的管理能力入口。',
    solution:
      '在组合下拉框的模型段和提示词段顶部边框位置各增加齿轮按钮；点击模型齿轮打开模型管理测试窗口，点击提示词齿轮打开提示词管理测试窗口。',
    prevention: '把两个配置控件合并成组合控件时，要同时保留每个分段原本的辅助操作入口，避免节省空间时丢失管理路径。',
    keywords: ['右侧AI配置', '组合下拉框', '模型管理', '提示词管理', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'setting-clear-action-moved-top-confirm-001',
    title: '大纲清空设定入口在左下角且需要顶部确认式组合按钮',
    area: '作品编辑器 / 大纲 / 左侧设定栏',
    symptom:
      '清空设定按钮放在左侧栏底部，和新建分类、新建设定入口距离较远；用户希望把“清空”放到顶部“新建 / 分类 / 设定”组合按钮最右侧，并防止误触。',
    cause:
      '清空设定作为全局设定操作，早期按危险操作放到底部；移动到顶部后如果只是普通按钮，容易和分类/设定创建入口一样被误点。',
    solution:
      '把清空设定入口移动到顶部同一组合条里，四段平均分配“新建 / 分类 / 设定 / 清空”；清空段使用红底白字，默认锁定且左键不可清空，悬停提示右键解锁，右键弹出仅含“解锁”的下拉菜单，解锁后才允许左键打开清空确认弹窗。',
    prevention:
      '大纲设定栏的同组全局操作应优先放在同一个组合条内；危险操作必须同时使用视觉警示、锁定状态、右键菜单解锁和清空确认弹窗，不要只靠位置隔离风险。',
    keywords: ['大纲设定', '清空设定', '组合按钮', '右键菜单', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-ai-config-gear-preview-static-001',
    title: '右侧 AI 配置 A 方案齿轮点不开且预览有黑色说明条',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏方案预览',
    symptom:
      'A 小齿轮展开行方案里，齿轮按钮看起来可以点击但没有展开配置；方案预览顶部还显示黑色说明框，挤占了右侧栏真实可用高度。',
    cause:
      '测试页只把 A 方案画成静态展示，没有给齿轮绑定展开状态；预览面板又额外渲染了方案标题和说明条，和正式右栏结构混在一起。',
    solution:
      '给 A 方案齿轮接入本地展开/收起状态，默认只露出宽度、模型简称和配置入口，点击后原地显示模型、提示词和输出日志；同时移除预览面板顶部黑色说明条。',
    prevention:
      '交互方案测试页里的按钮必须绑定对应状态或明确禁用；方案说明应留在测试页外层，不要占用模拟右侧栏内部空间。',
    keywords: ['右侧AI配置', '小齿轮', '点不开', '黑色说明条', '方案预览', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'test-collection-delete-marked-tests-applied-001',
    title: '测试集合待删除勾选项需要真正移除测试入口',
    area: '测试集合 / 待删除标记 / 测试路由',
    symptom:
      '用户已经完成一批测试，并在测试集合里勾选为待删除；如果只保留标记不清理代码，测试集合仍会继续显示过期入口。',
    cause: '待删除勾选框只负责记录用户希望 Codex 删除的测试路径，不会在应用运行时自动移除测试项或路由。',
    solution:
      '按当前待删除列表删除 6 个测试入口、对应独立路由、内联测试组件和独立测试页文件，并保留仍在使用的右侧 AI 配置栏统一方案测试。',
    prevention:
      '以后执行待删除勾选项时，先读取最新 delete marks 列表，再同步清理测试集合入口、renderActiveTest 分支、App 路由和独立测试页文件，避免误删旧 completed 状态。',
    keywords: ['测试集合', '待删除', '勾选框', '删除测试', 'TestCollectionPage', 'App路由'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-ai-config-schemes-overflow-001',
    title: '右侧 AI 配置方案测试页一次铺开太多右栏',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏方案测试',
    symptom:
      '五个省空间方案全部横向并排显示，页面变成一整排右侧栏，需要横向滚动，无法正常判断单个方案和当前右栏的差异。',
    cause: '测试页把“多个方案可选”实现成了“多个方案同时展示”，没有保留真实编辑器对比时需要的视口比例。',
    solution:
      '改成顶部方案切换条，主体只显示“当前右侧区域”和一个选中的方案预览；A-E 方案通过按钮切换，不再同时铺满页面。',
    prevention:
      '同一类布局方案测试应优先做单方案切换对比，只有需要全局鸟瞰时才横向铺开多个预览，避免测试页自身破坏判断。',
    keywords: ['右侧AI配置', '测试页', '方案对比', '横向滚动', '单方案预览', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'test-collection-delete-mark-checkbox-001',
    title: '测试集合需要待删除标记而不是自动完成隐藏',
    area: '测试集合 / 测试卡片 / 待删除标记',
    symptom:
      '用户需要通过勾选框标记要删除的测试内容，再告诉 Codex 删除；之前把勾选理解成完成测试并隐藏列表，反而增加了误触风险。',
    cause: '勾选动作的语义没有区分“标记给 Codex 看”和“应用内完成归档”，导致实现成自动过滤已完成内容。',
    solution:
      '恢复测试卡片和测试详情顶部的勾选框，但改为“标记待删除”；标记只写入待删除集合并显示数量，不再隐藏、删除或过滤测试入口。',
    prevention:
      '测试集合中的辅助勾选默认只能做显式标记，不能绑定隐藏或删除这类破坏性行为；真正删除由用户确认后交给 Codex 修改代码。',
    keywords: ['测试集合', '勾选框', '待删除', '标记', '误触', 'TestCollectionPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-ai-config-compact-schemes-test-001',
    title: '右侧模型和提示词配置需要多个省空间方案对比',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏',
    symptom:
      '每个页面都直接显示模型和提示词选择框会占用右侧区域顶部空间，影响 AI 对话框、关联内容和生成规则的可用高度。',
    cause: '模型和提示词配置属于低频调整项，但当前布局按高频控件常驻显示；如果直接移到弹窗又会打断工作流。',
    solution:
      '在右侧 AI 配置栏统一方案测试页加入五种不弹窗方案：小齿轮展开行、折叠胶囊条、侧边悬停配置、底部工具条、梗概行编辑态，均按真实右栏宽度展示。',
    prevention: '低频但关键的页面配置应先做多方案可视化测试，确认默认态占位、展开方式和误触风险后再进入正式编辑器。',
    keywords: ['右侧AI配置', '模型', '提示词', '省空间', '不弹窗', '测试页', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'test-collection-complete-checkbox-removed-001',
    title: '测试集合完成勾选容易误触并隐藏测试内容',
    area: '测试集合 / 测试卡片 / 测试详情顶部栏',
    symptom: '用户误点右侧 UI 测试的“完成测试”后，该测试内容从测试集合里消失，容易误以为测试页被删除。',
    cause:
      '完成勾选控件放在测试详情顶部和测试卡片右上角，点击后会写入 completedTestPaths 并过滤列表；该动作过于接近普通浏览操作，误触成本高。',
    solution:
      '删除测试详情顶部的完成测试按钮和测试卡片右上角勾选框；测试集合不再读取完成状态过滤列表，所有测试内容恢复显示。',
    prevention: '测试入口页不要放会隐藏入口的快捷勾选控件；如果以后需要归档测试，应放到明确的管理入口并提供恢复路径。',
    keywords: ['测试集合', '完成测试', '误触', '右侧UI', '隐藏测试', 'TestCollectionPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-right-panel-connected-layout-001',
    title: '作品编辑器右侧区域外层布局卡片和整体混用',
    area: '作品编辑器 / 大纲 / 剧情链 / 右侧 AI 区域',
    symptom:
      '大纲、剧情链等页面的右侧区域有的使用卡片式外框，有的使用连续整体面板，拖拽分割线和右栏边界的视觉规则不一致。',
    cause:
      '右侧 AI 区域在不同页面逐步扩展时，外层容器样式被单独实现；部分页面把整块生成配置包成卡片，部分页面则直接作为编辑器连续面板。',
    solution:
      '保留模型、提示词、输出日志、AI 输入框等现有控件 UI 样式，只把大纲/章纲普通右栏和剧情链独立右栏外层统一为连续白色面板；卡片只保留在内部内容项上。',
    prevention:
      '作品编辑器核心工作页的左右栏应统一使用连续面板；需要卡片感时只用于内部条目、提示块或候选内容，不要包住整块右侧功能区。',
    keywords: ['作品编辑器', '右侧区域', '大纲', '剧情链', '连续面板', '卡片式', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'test-collection-hide-completed-items-001',
    title: '测试集合已勾选内容仍继续显示',
    area: '测试集合 / 已完成勾选 / 测试入口列表',
    symptom: '测试集合里已经打钩的测试内容仍然留在列表中，用户想把这些已完成测试内容删除，不再干扰后续未完成测试。',
    cause: '完成勾选只写入 localStorage 作为状态标记，列表渲染仍直接使用完整 testGroups，没有按已完成路径过滤。',
    solution:
      '测试集合列表按 completedTestPaths 过滤已勾选测试；搜索只匹配未完成测试；在测试详情页勾选完成后自动返回列表，让该测试立即从列表消失。',
    prevention: '测试集合的完成勾选如果代表“已处理”，列表渲染必须同步隐藏或归档，避免状态标记和可见内容含义不一致。',
    keywords: ['测试集合', '打钩', '已完成', '删除测试内容', 'completedTestPaths', 'TestCollectionPage'],
    updatedAt: '2026-06-06',
  },
];
