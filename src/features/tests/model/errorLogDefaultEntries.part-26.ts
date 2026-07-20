import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart26: ErrorLogEntry[] = [
  {
    id: 'workbench-right-panel-current-ai-config-mock-001',
    title: '右侧 AI 配置栏测试页当前状态还原不准确',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏',
    symptom:
      '右侧 AI 配置栏统一方案测试页的“当前右侧区域”仍使用通用卡片和普通选择框，和正式编辑器里带浮动边框标签、内嵌管理按钮、独立输出日志按钮的 AI 配置不一致。',
    cause:
      '测试页为了快速做方案对比，先手写了抽象 SelectMock，没有按正式 CapsuleSelect 的视觉结构还原当前模型、提示词和 AI 对话框。',
    solution:
      '将测试页左列当前右侧区域改为灰底右栏、右上角宽度标记、模型/提示词胶囊选择框、模型行独立输出日志按钮，以及带边框标签和清空入口的 AI 对话框。',
    prevention:
      '做“当前 vs 改后”视觉对比时，当前状态必须优先对齐正式页面真实组件；不能用抽象 mock 代替已存在的关键控件。',
    keywords: ['作品编辑器', '右侧区域', 'AI配置', '测试页', 'CapsuleSelect', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-model-prompt-unified-settings-test-001',
    title: '模型和提示词需要验证统一设置页方案',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏',
    symptom:
      '大纲、剧情链、章纲、审核、点评、状态分别设置模型和提示词会增加重复操作，但完全移出页面又可能打断临时调整。',
    cause: '模型和提示词同时承担全局默认与页面临时覆盖两种角色，放在每个页面右侧会显重，完全集中到设置页又不够顺手。',
    solution:
      '在右侧 AI 配置栏统一方案测试页中新增三列对比：当前右侧区域、统一模型与提示词设置页、改后右侧区域；改后右侧只显示当前模型和提示词，并提供“调整”入口。',
    prevention: '涉及跨页面默认值的设计先用“统一默认 + 页面覆盖”测试验证，确认信息密度和操作路径后再迁入正式编辑器。',
    keywords: ['模型', '提示词', '统一设置', '页面覆盖', '右侧区域', '测试集合'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-right-panel-side-by-side-test-001',
    title: '右侧 AI 配置栏测试页需要只对比右侧区域',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏',
    symptom: '用户希望删除左侧和中间区域，只保留右侧区域，并把当前右侧区域和新方案并排对比，直接看出改动。',
    cause: '上一版测试页虽然还原了作品编辑器尺寸，但左侧目录和中间工作区仍占据视觉注意力，不利于聚焦比较右侧栏变化。',
    solution:
      '将测试页下方主体改为纯右侧栏对比：左侧显示当前右侧区域，右侧显示统一方案右侧区域，两列按同一页面宽度并排展示。',
    prevention: '做局部改版评估时，测试页应支持“当前 vs 新方案”的同域对比，避免无关区域干扰判断。',
    keywords: ['作品编辑器', '右侧区域', 'AI配置', '对比测试', '当前方案', '统一方案'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-right-panel-design-test-editor-size-001',
    title: '右侧 AI 配置栏测试页没有还原作品编辑器尺寸',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏',
    symptom:
      '右侧 AI 配置栏统一方案测试页额外加入测试侧栏和说明栏，压缩了中间工作区，无法判断正式作品编辑器尺寸下是否好用。',
    cause: '第一版测试页更像独立方案展示页，而不是作品编辑器页面还原，测试页面自身布局干扰了右侧栏真实观感。',
    solution:
      '将测试页重建为作品编辑器尺寸模拟：顶部流程导航，下方按左栏、分割线、中间工作区、分割线、右侧 AI 配置栏渲染，并根据页面类型切换真实左右宽度。',
    prevention:
      '用于判断正式页面观感的测试页，应优先还原正式页面外框和空间比例，再展示局部方案，避免原型容器影响判断。',
    keywords: ['作品编辑器', '右侧区域', 'AI配置', '测试页', '真实尺寸', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-right-panel-unified-design-test-001',
    title: '作品编辑器不同页面右侧 AI 区域样式不统一',
    area: '测试集合 / 作品编辑器 / 右侧 AI 配置栏',
    symptom:
      '大纲、剧情链、章纲、审核、状态等页面的右侧区域在标题、日志入口、模型提示词、关联内容、规则和输入区顺序上不统一。',
    cause:
      '各页面按功能逐步扩展右侧栏，没有先抽象统一的信息架构和组件顺序，导致后续调整宽度、字段和按钮时缺少共同参照。',
    solution:
      '新增“右侧 AI 配置栏统一方案”测试页，先用统一骨架展示多种页面状态：顶部标题/宽度/日志、AI配置、关联内容、生成规则、输入区、底部主操作。',
    prevention:
      '右侧 AI 区域正式改版前先在测试页确认统一信息架构；落地时各页面只替换内容、规则和主按钮，不再单独设计一套右侧栏。',
    keywords: ['作品编辑器', '右侧区域', 'AI配置', '统一方案', '测试集合', 'WorkbenchRightPanelUnifiedTestPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'outline-linked-brainstorm-button-wrap-001',
    title: '大纲页关联脑洞按钮被挤成两行',
    area: '作品编辑器 / 大纲 / 关联脑洞',
    symptom: '大纲页面右侧的“关联脑洞”按钮在较窄配置栏里被拆成上下两行，影响识别和点击。',
    cause: '按钮使用 w-1/3 固定比例宽度，右侧区域宽度不足时中文文本会自动换行。',
    solution: '将“关联脑洞”按钮改为最小宽度并禁止换行，按钮高度适当提升到 48px，保证文字一行显示。',
    prevention:
      '短命令按钮如果承载固定中文词组，应使用 whitespace-nowrap 和明确 min-width，避免跟随父级比例宽度被压缩换行。',
    keywords: ['大纲', '关联脑洞', '按钮换行', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-drag-splitter-width-badge-removed-001',
    title: '作品编辑器部分页面缺少拖拽分割线且残留宽度数字',
    area: '作品编辑器 / 审核 / 点评 / 状态 / 左右栏',
    symptom:
      '审核、点评、状态页面仍是固定三栏，不能像其它页面一样拖拽调整左右区域；多个页面还残留绿色宽度数字，占用界面位置。',
    cause: '宽度调试标记转正后没有及时撤下，审核、点评、状态页也仍使用固定 grid 列宽，没有接入统一的拖拽分割线交互。',
    solution:
      '移除正式页面和测试页中的可见宽度数字；为审核、点评、状态页面补上左右 8px 拖拽分割线，并保存用户调整后的左右栏宽度。',
    prevention:
      '宽度调试信息只保留在开发排查阶段；新增三栏工作台页面时复用可拖拽分割线模式，不再把调试宽度数字渲染到正式界面。',
    keywords: [
      '作品编辑器',
      '拖拽分割线',
      '宽度标记',
      '审核',
      '点评',
      '状态',
      'ChapterEditor',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-panel-width-badges-001',
    title: '作品编辑器左右区域缺少实时宽度提示',
    area: '作品编辑器 / 左侧栏 / 右侧 AI 配置栏',
    symptom: '调整作品编辑器各页面左右区域宽度时，界面没有直接显示当前区域宽度，只能凭视觉判断。',
    cause:
      '工作台不同页面的左右栏宽度分别保存在 WorkbenchPage、WorkbenchLibraryPanel 和 ChapterEditor 中，之前没有统一把当前宽度值渲染到栏位上。',
    solution: '该调试标记后续已从正式页面和测试页移除，宽度调整只保留拖拽分割线交互，不再在界面中显示数字宽度。',
    prevention:
      '宽度调试信息只应作为临时排查辅助，不应长期保留在正式工作台页面；需要调参时优先使用测试页或开发工具确认。',
    keywords: ['作品编辑器', '宽度', 'AI配置', '左侧栏', 'WorkbenchLibraryPanel', 'ChapterEditor', 'WorkbenchPage'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'chapter-review-status-page-header-removed-001',
    title: '审核点评状态页面顶部说明行重复占位',
    area: '作品编辑器 / 审核 / 点评 / 状态',
    symptom:
      '审核、点评、状态作为顶部流程页面打开时，页面顶部仍显示一整行标题和说明，占用纵向空间，且与顶部导航入口重复。',
    cause: 'ChapterEditor 的审核点评和状态视图同时服务旧弹窗和嵌入页面，header 没有按 embeddedMode 区分显示。',
    solution: '在 embeddedMode 页面模式下隐藏审核/点评/状态视图的 header；旧弹窗模式继续保留标题和关闭按钮。',
    prevention: '同一组件同时服务弹窗和页面时，应明确区分页面 chrome 与弹窗 chrome，避免页面模式重复显示标题说明行。',
    keywords: ['审核', '点评', '状态', '页面标题', 'embeddedMode', 'ChapterEditor'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'plot-chain-resizer-line-hover-only-001',
    title: '剧情链拖拽分割线常驻显示造成视觉干扰',
    area: '作品编辑器 / 剧情链 / 拖拽分割线',
    symptom: '剧情链三栏统一为连续面板后，左右拖拽分割线默认显示为竖线，在内容区域之间形成过强的常驻视觉边界。',
    cause: '剧情链拖拽 handle 的内部线条默认使用 bg-slate-200，虽然 hover 会变蓝，但未悬停时仍可见。',
    solution: '保留 8px 可拖拽热区和 hover 浅蓝反馈，将内部竖线默认改为透明，仅在鼠标悬停到分割区域时显示蓝色线。',
    prevention: '连续面板中的拖拽热区应优先隐藏常驻线条，只在 hover、拖拽或聚焦状态显示，避免工作区被过多边界线切碎。',
    keywords: ['剧情链', '拖拽分割线', 'hover', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'plot-chain-layout-unified-connected-panels-001',
    title: '剧情链三栏外框样式和大纲页面不统一',
    area: '作品编辑器 / 剧情链 / 三栏布局',
    symptom: '剧情链页面虽然已有左右拖拽分割线，但左中右三个区域仍是独立圆角卡片，和大纲页面连续衔接的工作区格式不同。',
    cause:
      '剧情链独立页保留了旧的 p-4 外边距、灰色背景以及三栏各自的 rounded-xl border 外框，导致分割线视觉上落在卡片间隙里，而不是作为区域边界。',
    solution:
      '将剧情链独立页改为白色连续工作区；主 grid 移除外边距；三栏外层取消圆角卡片边框，左右栏只保留边界线；拖拽分割线改为可见的窄边界轨道并在 hover 时高亮蓝色。',
    prevention:
      '作品编辑器里的大纲、剧情链、章纲等同级工作页应优先复用连续面板结构；新增拖拽分割线时同时检查外层容器是否仍有卡片间距。',
    keywords: ['剧情链', '大纲', '连续面板', '拖拽分割线', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'plot-chain-three-column-resizers-001',
    title: '剧情链左中右三栏不能拖拽调整宽度',
    area: '作品编辑器 / 剧情链 / 三栏布局',
    symptom: '剧情链页面左侧剧情链、中间剧情点预览、右侧生成配置三个区域宽度固定，不能按当前内容量调整。',
    cause:
      '剧情链独立页面仍使用固定 grid-cols-[300px_minmax(0,1fr)_360px] 和 gap 间距，没有接入工作台已有的列宽拖拽分隔线模式。',
    solution:
      '为剧情链页面新增左右栏宽度状态、本地持久化和两条拖拽分隔线；布局改为左栏、分隔线、中栏、分隔线、右栏的显式 grid 轨道。',
    prevention:
      '三栏工作区如果存在不同内容密度，应优先使用可拖拽分隔线，并为每个页面使用独立存储键，避免不同页面栏宽互相污染。',
    keywords: ['剧情链', '拖拽分割线', '三栏布局', 'WorkbenchLibraryPanel', 'plotPointStandalone'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-writing-bottom-divider-blue-001',
    title: '正文编辑区底部分割线与顶部蓝色分割线不一致',
    area: '作品编辑器 / 正文 / 底部状态栏',
    symptom: '正文编辑区底部状态栏上方仍是浅灰分割线，和作品信息下方的蓝色分割线视觉不统一。',
    cause: '正文编辑器底部状态栏使用 border-gray-100，顶部作品信息分割线使用 #08AACE，两处没有复用同一视觉规则。',
    solution: '将正文编辑器底部状态栏上边框改为 border-[#08AACE]，保持布局、高度和状态文案不变。',
    prevention: '编辑器主工作区的横向分割线应优先复用顶部主分割线颜色，避免同一层级出现灰线和蓝线混用。',
    keywords: ['正文', '底部分割线', '作品信息', '蓝色分割线', 'ChapterEditor', 'WorkbenchHeader'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'novel-card-open-direct-workbench-001',
    title: '小说卡片点击后多出作品总览中间页',
    area: '作品库 / 小说卡片 / 作品编辑器',
    symptom: '点击小说作品卡片后先进入作品总览页，需要再点一次进入正文编辑器，路径变长。',
    cause: '小说卡片打开逻辑为了展示作品进度，先跳转到 /novels/:novelId 中间页，再由总览页进入 /workbench。',
    solution:
      '删除作品总览中间页路由、页面、测试入口和原型页；小说卡片点击后直接选中作品、打开作品标签并跳转到 /workbench。',
    prevention:
      '作品卡片这类主工作入口应直接进入编辑器；如果需要展示进度，应放在编辑器内或首页概览中，不要新增阻断式中间页。',
    keywords: ['作品库', '小说卡片', '作品总览', '作品编辑器', 'NovelLibraryPage', 'workbench'],
    updatedAt: '2026-06-06',
  },
  {
    id: 'workbench-setting-create-buttons-combined-001',
    title: '大纲设定新建入口文案重复',
    area: '作品编辑器 / 大纲设定 / 左侧新建入口',
    symptom: '大纲设定左侧顶部显示“新建分类 / 新建设定”两个完整按钮，文案重复，占用横向空间。',
    cause: '创建分类和创建设定作为两个独立等宽按钮渲染，没有把共同动作“新建”抽成组合按钮前缀。',
    solution: '改为组合按钮样式，左侧固定显示“新建”，右侧两个动作按钮分别显示“分类”和“设定”，原点击逻辑保持不变。',
    prevention: '同组操作有共同动词时，优先用组合控件减少重复文案，同时保持每个动作的点击目标清晰。',
    keywords: ['大纲设定', '新建分类', '新建设定', '组合按钮', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-05',
  },
  {
    id: 'workbench-setting-sidebar-category-entry-height-compact-001',
    title: '大纲设定左侧分类和设定条目过高',
    area: '作品编辑器 / 大纲设定 / 左侧分类列表',
    symptom: '大纲设定左侧分类标题和分类下设定条目高度过大，同一屏只能看到较少内容。',
    cause: '分类头使用 py-2.5，条目使用 py-2，外层分类间距为 space-y-2；没有固定高度变量，主要由内边距和行高撑开。',
    solution:
      '分类头收紧为 py-1.5、text-sm、leading-5，条目收紧为 py-1.5、leading-5，分类间距从 space-y-2 降到 space-y-1，条目间距从 space-y-1 降到 space-y-0.5。',
    prevention:
      '侧边列表以信息密度为主，分类/条目高度调整应集中改列表容器的内边距、行高和间距，并同步说明当前近似高度。',
    keywords: ['大纲设定', '分类列表', '设定条目', '高度', 'WorkbenchLibraryPanel', 'space-y', 'py'],
    updatedAt: '2026-06-05',
  },
  {
    id: 'workbench-header-brainstorm-moved-after-writing-001',
    title: '作品编辑器顶部脑洞入口顺序不符合当前流程',
    area: '作品编辑器 / 顶部流程按钮 / WorkbenchHeader',
    symptom:
      '作品编辑器顶部创作流程按钮显示为“脑洞、大纲、剧情链、章纲、正文”，用户希望“大纲”作为第一个入口，“脑洞”移动到“正文”右侧成为最后一个。',
    cause: '顶部按钮顺序来自 WORKBENCH_MAIN_FLOW_STEPS 共享配置，旧顺序仍把 brainstorm 放在创作组第一位。',
    solution: '调整 WORKBENCH_MAIN_FLOW_STEPS 为“大纲、剧情链、章纲、正文、脑洞”，同步更新步骤序号和 Header 顺序测试。',
    prevention: '顶部流程顺序只从共享流程配置派生；调整入口顺序时必须同步测试断言，避免只改视觉或只改单个页面。',
    keywords: ['WorkbenchHeader', 'WORKBENCH_MAIN_FLOW_STEPS', '脑洞', '大纲', '正文', '创作流程', '按钮顺序'],
    updatedAt: '2026-06-05',
  },
  {
    id: 'project-optimization-test-ipc-browser-001',
    title: '项目优化审查后测试漂移和边界校验未收拢',
    area: '全项目优化 / 工作台测试 / Electron IPC / 内置浏览器',
    symptom:
      '全量测试里工作台字段尺寸测试仍按旧页面内按钮查找；数据库 IPC 接收相对 dataDir 字符串；模型 IPC 只检查 HTTPS 前缀；测试浏览器和脚本浏览器重复维护 URL 规范化逻辑。',
    cause:
      '字段尺寸入口已迁到顶部工具栏但测试没有同步合同；数据库路径、模型请求和浏览器 URL 工具缺少共享校验层，导致同类逻辑散在业务入口。',
    solution:
      '工作台测试改为覆盖脑洞页面合同和外部字段尺寸 signal；数据库 dataDir 增加绝对路径规范化并接入全部数据库 IPC；模型请求增加 URL、凭据、header 白名单和 body 大小校验；抽出 shared/browser/browserUrl 复用 URL 工具。',
    prevention:
      '入口迁移后测试应覆盖新的外层触发合同；所有跨 Electron 边界的路径和网络请求都必须先经过共享校验函数；两个以上页面复用的浏览器 URL 规则应集中维护。',
    keywords: [
      '项目优化',
      'WorkbenchLibraryPanel',
      '字段尺寸',
      'dataDir',
      'model:request',
      'BrowserWorkspace',
      'TestBrowserPage',
    ],
    updatedAt: '2026-06-05',
  },
  {
    id: 'capsule-select-selected-text-left-padding-001',
    title: '模型和提示词选择框内容偏右导致左侧留白过大',
    area: '全局模型/提示词选择框 / CapsuleSelect / 浮动标签选择框',
    symptom:
      '带边框标签的模型、提示词选择框里，已选内容距离左边过远，左侧显得空旷；用户希望所有同类选择框内容整体向左一些，但不能超出框外。',
    cause:
      'CapsuleSelect 的浮动标签分支统一给选择按钮使用 pl-9，标签、内容和右侧箭头/管理按钮之间留白偏保守，短文本时左侧空白尤其明显。',
    solution:
      '把带 floatingLabel 的选择按钮左内边距从 pl-9 调整为 pl-6，带“管理”按钮和不带“管理”按钮的分支同步生效；右侧保留原有箭头和管理按钮预留空间。',
    prevention:
      '以后调整 CapsuleSelect 时要同时检查标签、已选文字、箭头、禁用按钮和管理按钮的空间分配，避免只看单个控件导致全局选择框视觉不一致。',
    keywords: ['CapsuleSelect', '模型', '提示词', '浮动标签', '左内边距', '管理按钮'],
    updatedAt: '2026-06-05',
  },
  {
    id: 'novel-card-open-default-overview-and-workbench-001',
    title: '小说卡片点进去后工作台显示未选择作品',
    area: '作品库 / 小说卡片 / 作品总览 / 正文编辑器',
    symptom:
      '干净数据下点击“默认小说1”后，顶部会出现作品标签并跳到工作台，但正文区域显示“未选择作品”，用户无法继续编辑。',
    cause:
      '默认小说只由 useNovelLibrary 的 fallback state 创建，没有写回 xinyuexia_novels_v1；工作台 useWorkbenchData 只从 localStorage 读取作品库，因此找不到这个默认作品。',
    solution:
      '新增 readInitialNovels，在首次生成默认小说时同步写入 xinyuexia_novels_v1；小说卡片点击先进入正式作品总览页，用户再从总览页进入正文编辑器。',
    prevention:
      '所有默认数据如果会被多个模块读取，必须在初始化时落到共享持久层；新增跨页入口时要用测试覆盖首次启动、默认数据和目标页面读取同一份数据的链路。',
    keywords: [
      '作品库',
      '默认小说',
      '作品总览',
      '未选择作品',
      'useNovelLibrary',
      'useWorkbenchData',
      'xinyuexia_novels_v1',
    ],
    updatedAt: '2026-06-05',
  },
  {
    id: 'confirm-dialog-portal-over-recycle-modal-001',
    title: '清空脑洞回收站确认弹窗被回收站遮住',
    area: '作品编辑器 / 脑洞 / 回收站 / 确认弹窗',
    symptom: '在脑洞回收站里点击“清空回收站”后，确认弹窗出现在回收站弹窗后面，被回收站主体遮住。',
    cause:
      'ConfirmDialog 虽然设置了 z-[300]，但它按普通 React 子树渲染，没有 portal 到 document.body；当父级页面或其他 portal 弹窗形成新的层级上下文时，确认弹窗会被脑洞回收站的 portal 层压住。',
    solution:
      'ConfirmDialog 改为使用 createPortal 渲染到 document.body，让确认弹窗始终位于全局浮层栈中，z-[300] 能正确压过回收站 z-[260]。',
    prevention: '通用确认弹窗、二次确认弹窗这类“弹窗上的弹窗”必须进入全局 portal 层，不能依赖调用方所在 DOM 层级。',
    keywords: ['ConfirmDialog', 'createPortal', '脑洞回收站', '清空回收站', 'z-index', '弹窗层级'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-brainstorm-user-request-prefix-shortened-001',
    title: '脑洞用户要求固定说明过长',
    area: '作品编辑器 / 脑洞 / 输出日志 / 用户要求',
    symptom: '脑洞输出日志的“用户要求”顶部显示较长固定说明，用户希望只保留一个明确分隔标题。',
    cause:
      'buildBrainstormPromptFromQuestions 里把脑洞生成任务说明和生成要求固定拼进用户要求正文，导致日志里看起来不像纯用户输入。',
    solution: '脑洞用户要求前缀改为【以下是用户输出的内容】，后面继续只拼接实际填写过的字段。',
    prevention: '输出日志里的“用户要求”应尽量接近用户实际输入；任务规则更适合放在提示词里，不要混进用户输入展示区。',
    keywords: ['脑洞', '用户要求', '输出日志', 'buildBrainstormPromptFromQuestions', '提示词'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-brainstorm-log-hide-empty-context-user-001',
    title: '脑洞输出日志显示无效关联内容和空用户要求',
    area: '作品编辑器 / 脑洞 / 输出日志',
    symptom:
      '脑洞生成并没有关联内容功能，但输出日志仍显示“关联内容 / 未关联”；当用户没有输入任何脑洞字段时，用户要求里仍显示固定模板说明。',
    cause:
      '脑洞输出日志复用了通用日志分组，默认会渲染关联内容分组；buildBrainstormPromptFromQuestions 在没有字段时仍返回固定模板，日志对象也给空用户输入补了“无额外要求”兜底。',
    solution:
      '脑洞日志调用通用日志时关闭关联内容分组；脑洞用户要求为空时不渲染用户要求分组；脑洞请求构建在没有已填字段时返回空字符串，日志侧栏也不显示空用户输入卡片。',
    prevention:
      '通用日志组件要按业务能力传入显式开关；没有该能力的页面不要显示“未关联”这类占位分组，空输入也不能用模板文案冒充用户请求。',
    keywords: ['脑洞', '输出日志', '关联内容', '用户要求', 'buildBrainstormPromptFromQuestions', 'AiRequestLogGroups'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-brainstorm-request-omits-empty-fields-001',
    title: '脑洞用户要求会发送未填写字段',
    area: '作品编辑器 / 脑洞 / 输出日志 / AI 请求',
    symptom:
      '脑洞输出日志的“用户要求”会把主角金手指、你的构思、补充内容等空字段显示为“未填写”，看起来像用户实际输入了这些内容。',
    cause:
      'buildBrainstormPromptFromQuestions 在拼接脑洞 AI 请求时，对每个字段都固定输出一行，空值用“未填写”占位；生成前确认弹窗也复用同样的占位展示。',
    solution: '脑洞请求拼接改为只保留实际填写过的字段；确认弹窗同样过滤空字段，不再展示“未填写”。',
    prevention: '表单类 AI 请求不要把空字段用占位文本发送给模型；占位只属于输入框 UI，不应进入请求正文或输出日志。',
    keywords: ['脑洞', '用户要求', '未填写', '输出日志', 'buildBrainstormPromptFromQuestions', 'AI请求'],
    updatedAt: '2026-06-04',
  },
  {
    id: 'workbench-brainstorm-output-thinking-marker-hidden-001',
    title: '脑洞输出框露出 THINKING 内部标记',
    area: '作品编辑器 / 脑洞 / 脑洞输出框',
    symptom: '脑洞输出框里显示 [[THINKING seconds=... status=thinking]]、[[/THINKING]] 这类英文内部标记。',
    cause:
      '脑洞流式生成过程中 aiResult 可能保存了带思考块的中间文本；生成结束虽然会清理一次，但渲染输出框时没有像其他 AI 预览区一样再做展示层兜底过滤。',
    solution:
      '脑洞输出框展示值统一经过 stripAiThinkingBlock 清理后再渲染和统计字数，历史残留或流式中间态都不会直接露出内部标记。',
    prevention: '所有直接展示 AI 原始输出的区域都要在渲染层做一次内部标记过滤，不能只依赖请求完成后的保存清理。',
    keywords: ['脑洞', '脑洞输出框', 'THINKING', 'stripAiThinkingBlock', 'aiResult', '流式输出'],
    updatedAt: '2026-06-04',
  },
];
