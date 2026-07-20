import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart16: ErrorLogEntry[] = [
  {
    id: 'chapter-group-soft-blue-production-sync-001',
    title: '章节分组浅蓝底方案需要迁入所有正式目录并删除临时测试',
    area: '作品编辑器 / 正文目录 / 已发布 / 设定脑洞章纲目录 / 测试集合',
    symptom:
      '用户已经在测试集合中确认“浅蓝底”章节分组方案，如果只停留在测试页，正式正文、已发布、脑洞、设定、章纲等目录仍会显示旧的弱分组样式。',
    cause:
      '分组行样式分散在 ChapterSidebar、PublishedSidebar、WorkbenchLibraryPanel 和 ChapterEditor 中，测试方案页只是静态预览，不会自动同步到正式组件。',
    solution:
      '将正式分组行统一改为 border-[#c7dcff] + bg-[#eaf2ff] 的浅蓝底，图标使用 #1e71ef，数量改为白色半透明胶囊；删除 ChapterGroupColorOptionsTestPage 及测试集合入口。',
    prevention:
      '以后多方案测试页被用户确认后，应同步迁入正式组件、更新回归测试并删除临时方案入口；如果用户要求删除打钩测试，先读取待删除路径再同步清理入口、渲染分支和测试文件。',
    keywords: [
      '章节分组',
      '浅蓝底',
      '正式迁入',
      'ChapterSidebar',
      'PublishedSidebar',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
      '测试集合删除',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-profile-nav-separator-001',
    title: '首页头像区和导航区之间需要一条清晰分割线',
    area: '首页 / 左侧导航 / 头像区域与导航列表',
    symptom:
      '头像区下方直接进入导航列表，两个区域之间缺少边界，用户扫视时不容易判断头像信息区已经结束、导航区已经开始。',
    cause:
      '之前为了删除专区分组层级，移除了头像区底部边线；导航改为扁平列表后，头像区和导航列表之间仍需要一个轻量边界。',
    solution:
      '在 DashboardLayout 头像区容器上加入 border-b border-[#e1e5eb]，只分割头像区和导航区，不恢复专区标题或分组折叠线。',
    prevention: '后续首页侧栏可以保留这一条头像/导航分割线；不要把它扩展回专区分组线、专区标题或折叠专区结构。',
    keywords: ['首页', '左侧导航', '头像区', '分割线', '导航区', 'DashboardLayout', 'border-[#e1e5eb]'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-group-color-options-test-001',
    title: '章节分组行需要多套颜色和背景方案对比',
    area: '测试集合 / 作品编辑器 / 左侧章节侧栏',
    symptom:
      '当前“第一卷”这类分组行和普通章节行的背景、图标、边框层级区分不够明显，用户扫视左侧目录时容易忽视分卷分组。',
    cause:
      '正式侧栏分组行主要依赖透明或浅色背景、文件夹图标和文字粗细来区分层级，而选中章节行的蓝色底更突出，导致分组行视觉权重偏低。',
    solution:
      '新增 ChapterGroupColorOptionsTestPage，在测试集合里集中展示 6 套分组行方案，对比行背景、边框线、图标色、章数胶囊和左侧强调线。',
    prevention:
      '正式迁入章节分组配色前，先在测试页比较可读性和干扰度；应用时同步检查 ChapterSidebar、PublishedSidebar 以及脑洞、设定、章纲等左侧分组目录，避免只改正文目录。',
    keywords: [
      '章节分组',
      '第一卷',
      '背景色',
      '分组行',
      '测试集合',
      'ChapterGroupColorOptionsTestPage',
      'ChapterSidebar',
      'PublishedSidebar',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-sidebar-volume-chapter-left-alignment-001',
    title: '章节侧栏卷名和章节名需要上下对齐并更靠左',
    area: '作品编辑器 / 左侧章节侧栏 / 卷目录与章节行',
    symptom: '卷行里的“第一卷”和文件夹图标整体偏右，章节行又带有额外缩进，导致卷名和第1章、第2章的文字起点上下不齐。',
    cause:
      'ChapterSidebar 的滚动区使用 px-2，卷行使用 px-3，章节容器还有 ml-1，章节行再叠加 border-left 和 px-3，多个缩进来源叠加后文字起点错位。',
    solution:
      '将未发布和已发布章节侧栏滚动区改为 px-1，卷行改为 px-1，移除章节容器 ml-1，并把章节行左内边距调整为 px-[26px]，让卷名和章节名形成接近同一列的视觉对齐。',
    prevention:
      '后续调整章节目录时同时检查 ChapterSidebar 和 PublishedSidebar；卷行、章节容器、选中边框和章节文本 padding 要作为一组处理，不要单独恢复 ml-1 或 px-3。',
    keywords: ['作品编辑器', '章节侧栏', '第一卷', '第1章', '左对齐', 'ChapterSidebar', 'PublishedSidebar'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-navigation-zones-removed-001',
    title: '首页导航和导航设置不应再出现专区功能',
    area: '首页 / 左侧导航 / 导航设置',
    symptom:
      '左侧导航仍按“创作专区、数据专区、测试专区”展示分组，导航设置里也保留新增专区、隐藏专区和跨专区拖拽等管理入口。',
    cause:
      '导航配置最初按 NavGroupConfig 分组设计，DashboardLayout 渲染分组折叠行，NavSettingsModal 也把分组作为可管理对象。',
    solution:
      '默认导航改为单个内部“导航”容器，读取旧配置时自动拍平成导航项列表；左侧导航只渲染扁平导航项，导航设置只保留改名、隐藏/恢复和拖拽排序。',
    prevention:
      '后续导航调整不要再新增“专区”概念；需要分类时优先考虑测试集合或页面内部筛选，不要恢复首页导航分组标题、折叠专区或新增专区按钮。',
    keywords: ['首页', '左侧导航', '专区', '导航设置', 'NavSettingsModal', 'DashboardLayout', 'navConfig'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-sidebar-profile-height-minus-20-001',
    title: '首页侧栏头像区域高度需要缩小约 20%',
    area: '首页 / 左侧导航 / 头像区域',
    symptom: '左侧导航顶部头像区域纵向占用过高，截图红框位置留白偏多，压缩了下方导航的首屏可见空间。',
    cause: 'DashboardLayout 头像区外层使用 px-3 py-7，上下各 28px 的内边距让头像、姓名和留白组合后显得过高。',
    solution:
      '将头像区外层改为 px-3 py-[14px]，保留头像居中和姓名在下方的结构，只压缩容器垂直留白，使整体高度约减少 20%。',
    prevention:
      '后续调整首页侧栏头像区时不要恢复 py-7；若需要再改高度，优先只调整外层垂直内边距，避免破坏头像尺寸、姓名居中和上传交互。',
    keywords: ['首页', '左侧导航', '头像区域', '高度', '20%', 'DashboardLayout', 'py-[14px]'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-card-cover-menu-reference-001',
    title: '作品卡片封面需要接近参考书封并移除私密角标',
    area: '我的小说 / 作品卡片 / 封面与更多菜单',
    symptom:
      '默认作品封面和参考截图不一致，左上角仍显示“私密”角标；右下角三个点菜单打开后，点击页面空白处不会自动关闭。',
    cause:
      'NovelCard 的默认封面样式带有角标文本和通用图片占位图标，更多菜单只由按钮切换，没有在菜单打开期间监听外部点击。',
    solution:
      '将默认封面拆成 xy-wa-book-cover-empty 专用书封样式，移除私密角标，使用浅蓝渐变书脊和右下角羽毛水印；菜单打开时挂载 pointerdown/keydown 监听，点击卡片外或按 Esc 自动关闭。',
    prevention:
      '后续调整作品卡片时保持真实封面和默认封面样式分离；新增浮层菜单必须覆盖点击外部关闭和 Esc 关闭，避免菜单残留。',
    keywords: ['作品卡片', '封面', '私密', '三个点', '更多菜单', '点击空白关闭', 'NovelCard'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-search-background-f5f6f6-001',
    title: '我的小说搜索框背景色需要固定为 #F5F6F6',
    area: '我的小说 / 搜索小说输入框',
    symptom: '搜索小说输入框背景色和目标色值不一致，且共享搜索框 hover/focus 样式可能把背景改回白色。',
    cause: '小说库复用 xy-ui132-search 通用搜索框，默认背景和交互态由共享 CSS 控制，没有小说页专用色值覆盖。',
    solution: '给小说库搜索框增加 xy-novel-search 专用 class，并在普通、hover、focus 状态下统一使用 #F5F6F6 背景。',
    prevention:
      '后续调整小说库搜索框时保留 xy-novel-search 覆盖；若修改通用 xy-ui132-search，需确认不会覆盖小说页指定背景。',
    keywords: ['我的小说', '搜索小说', '#F5F6F6', 'xy-ui132-search', 'xy-novel-search', 'NovelLibraryPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'app-titlebar-color-e4e9ef-001',
    title: '顶部标题栏颜色需要统一为 #E4E9EF',
    area: '全局框架 / 顶部标题栏 / 作品标签栏',
    symptom: '作品编辑器顶部红框标注区域的标题栏颜色和目标色值不一致，需要调整为 #E4E9EF。',
    cause: '标题栏颜色由全局 --xy-wa-titlebar 变量控制，旧值仍是 #e1e5eb，和当前指定色值有轻微色差。',
    solution:
      '将 --xy-wa-titlebar 改为 #E4E9EF，继续由 .writer-assistant-theme .xy-wa-titlebar 应用到 AppFrame 顶部标题栏。',
    prevention:
      '后续调整顶部标签栏或标题栏时优先修改 --xy-wa-titlebar，不要在 AppFrame 里写死其它背景色，避免首页标签、作品标签和右侧窗口按钮区域色值分裂。',
    keywords: ['标题栏', '顶部导航栏', '#E4E9EF', 'xy-wa-titlebar', 'AppFrame', 'workspace-tab'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-editor-surface-background-f5f5f7-001',
    title: '作品编辑器正文输入区背景需要统一为 #F5F5F7',
    area: '作品编辑器 / 正文 / 中间输入区域',
    symptom: '正文编辑器中间输入区域背景色和用户标注区域不一致，视觉上没有贴合 #F5F5F7 的页面工作区底色。',
    cause:
      '正文编辑 surface 通过 --xy-wa-editor-bg 单独控制，且 textarea 文本层使用透明背景；只改外层或只改页面容器都可能被内部图层显示效果抵消。',
    solution:
      '将 --xy-wa-editor-bg 改为 #F5F5F7，并让 .xy-wa-editor-surface .xy-wa-editor-text-layer 同步使用 #F5F5F7 背景。',
    prevention:
      '后续调整正文输入区底色时，同时检查 xy-wa-editor-surface、xy-wa-editor-text-layer 和 ChapterEditor 的 textarea class，避免外层和输入层色值不一致。',
    keywords: [
      '作品编辑器',
      '正文',
      '输入区',
      '#F5F5F7',
      'xy-wa-editor-surface',
      'xy-wa-editor-text-layer',
      'ChapterEditor',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-nav-group-divider-hierarchy-001',
    title: '首页左侧导航分组线需要只分隔专区层级',
    area: '首页 / 左侧导航 / 分组分隔线',
    symptom:
      '头像区下方第一条横线让头像和第一个专区被过度切开，而第二、第三条分组线没有拉满整个导航宽度，专区层级不够清楚。',
    cause:
      '头像区域保留了独立 border-b，同时分组区域没有显式按分组序号控制分隔线，导致第一组前也出现分隔感，后续分隔线宽度不够明确。',
    solution: '移除头像区底部边线；导航分组 map 增加 groupIndex，只在第二个及之后的专区前渲染一条 w-full 的分隔线。',
    prevention:
      '后续调整首页导航层级时，头像区不要再加底部分隔线；专区分隔线应从第二组开始显示，并保持导航内容区全宽。',
    keywords: ['首页', '左侧导航', '分组线', '头像区', 'DashboardLayout', 'groupIndex', 'w-full'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-ai-input-border-options-test-001',
    title: '右侧 AI 输入框边框和已关联资料背景需要多方案对比',
    area: '测试集合 / 作品编辑器 / 右侧 AI 输入区',
    symptom: '当前亮蓝色边框和“已关联资料”背景过强，用户反馈颜色不好看，需要先看多套方案再决定正式迁入。',
    cause: '正式页只有单一高饱和蓝色方案，输入框边框、已关联资料背景、字数提示和发送/停止按钮没有横向对比依据。',
    solution:
      '在测试集合 AI 链路测试分组末尾新增“AI 输入框边框方案”，集中展示 8 套输入框边框线、已关联资料背景、已关联字数提示和按钮配色。',
    prevention:
      '正式迁入前先在测试集合比较边框线、active 背景、字数提示和红色停止/清空按钮的整体协调，再把选定方案同步到真实 AI 输入区。',
    keywords: ['AI输入框', '边框线', '已关联资料', '背景色', '测试集合', 'WorkbenchAIPanel', 'AiInlineInput'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-folder-group-style-sync-001',
    title: '已发布和脑洞等左侧分组需要同步正文文件夹样式',
    area: '作品编辑器 / 正文 / 已发布 / 脑洞 / 章纲 / 审核状态目录',
    symptom:
      '正文目录已经按文件夹分组展示，但已发布、脑洞、设定、角色、章纲和审核状态等页面仍保留品牌色块、Chevron 折叠箭头或橙色选中态，切换页面时目录样式不统一。',
    cause:
      '这些左侧目录分别由 ChapterSidebar、PublishedSidebar、WorkbenchLibraryPanel 和 ChapterEditor 独立渲染，之前只调整了单个入口，没有把分组行样式抽成一致的文件夹视觉。',
    solution:
      '为这些组件统一使用 WORKBENCH_FOLDER_GROUP_BUTTON_CLASS 和 WORKBENCH_FOLDER_GROUP_ICON_CLASS；展开分组显示 FolderOpen，折叠分组显示 Folder；已发布章节选中态同步为正文同款蓝色选中底。',
    prevention:
      '以后调整正文目录分组视觉时必须同步检查已发布、脑洞/设定/角色库、章纲卷目录、审核/点评/状态目录和资料读取弹窗，不要只改 ChapterSidebar 或单个页面。',
    keywords: [
      '正文目录',
      '已发布',
      '脑洞',
      '分组折叠',
      '文件夹',
      'FolderOpen',
      'PublishedSidebar',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-nav-group-folder-style-001',
    title: '首页左侧导航分组折叠需要像文件夹目录',
    area: '首页 / 左侧导航 / 分组折叠',
    symptom:
      '左侧导航分组标题使用专区图标、顶部边线和右侧 Chevron 折叠箭头，看起来更像普通设置分区，不像截图里的文件夹目录树。',
    cause:
      'DashboardLayout 直接读取 group.iconName 渲染分组图标，并把折叠状态放在右侧 Chevron 上；分组标题还有 border-t 和较小的 12px 标签样式。',
    solution:
      '将分组标题改成文件夹目录行：折叠时使用 Folder，展开时使用 FolderOpen，左侧图标加标题同一行显示，移除右侧 Chevron 和顶部边线，子项仍保留自己的页面图标与选中蓝底。',
    prevention:
      '后续调整首页导航分组时保留“文件夹 + 标题”的目录树视觉；折叠状态应通过文件夹形态和 aria-expanded 表达，不要恢复成右侧箭头标题栏。',
    keywords: ['首页', '左侧导航', '分组折叠', '文件夹', 'Folder', 'FolderOpen', 'Chevron', 'DashboardLayout'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-footer-settings-text-buttons-001',
    title: '首页左下角设置入口不应只显示图标',
    area: '首页 / 左侧导航 / 底部设置按钮',
    symptom: '首页左下角只有系统、主题、快捷键和导航设置的图标按钮，新用户难以判断每个入口具体作用。',
    cause:
      'DashboardLayout 底部操作区复用了 xy-wa-icon-button，只依赖图标和 title 提示；用户需要先悬停或猜测图标含义。',
    solution:
      '将底部设置入口改为两列文字按钮，直接显示“系统设置 / 主题颜色 / 快捷键 / 导航设置”，保留原有点击打开对应弹窗的逻辑。',
    prevention:
      '后续调整首页左下角入口时优先保留可见文字；除非空间极端受限，不要把这些低频但重要的配置入口恢复成纯图标。',
    keywords: [
      '首页',
      '左下角',
      '文字按钮',
      '设置入口',
      '系统设置',
      '主题颜色',
      '快捷键',
      '导航设置',
      'DashboardLayout',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-sidebar-resize-splitter-001',
    title: '首页左侧导航需要可拖拽调整宽度',
    area: '首页 / 左侧导航 / 拖拽分割线',
    symptom:
      '首页左侧导航宽度固定，用户在不同窗口尺寸或不同导航内容密度下无法手动调整，正文区域和导航区域的空间分配不够灵活。',
    cause: 'DashboardLayout 直接使用固定的 w-[224px] 侧栏宽度，首页外壳没有独立的宽度状态、拖拽热区或持久化记忆。',
    solution:
      '为首页侧栏增加 xinyuexia_dashboard_sidebar_width 宽度记忆、176px 到 340px 的安全范围、鼠标拖拽分割线和键盘左右键/Home/End 调整；侧栏改用 style={{ width: sidebarWidth }} 渲染。',
    prevention:
      '后续调整首页导航时不要恢复固定 w-[224px]；拖拽分割线的保存逻辑只应在用户拖拽或键盘调整时写入 localStorage，避免刷新、切页或窗口变化覆盖用户偏好。',
    keywords: ['首页', '左侧导航', '拖拽分割线', '侧栏宽度', 'localStorage', 'DashboardLayout', 'cursor-ew-resize'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-sidebar-avatar-name-layout-001',
    title: '首页侧栏头像和名字需要上下居中排列',
    area: '首页 / 左侧导航 / 头像区域',
    symptom: '左侧个人信息区把头像和名字横向放在同一行，不符合参考软件里“头像居中、名字在头像下面”的识别方式。',
    cause:
      'DashboardLayout 的头像区使用 flex row、items-center 和横向 gap，用户名容器占据右侧 flex-1，导致视觉重心偏左。',
    solution:
      '将头像区改成 flex-col items-center justify-center；头像使用 48px 圆形按钮居中，用户名和编辑输入框都放在头像下方并居中显示。',
    prevention:
      '后续调整侧栏个人信息区时，头像与用户名保持上下结构；上传头像、双击改名等交互只改内部控件，不要把容器恢复为横向排列。',
    keywords: ['首页', '侧栏', '头像', '用户名', '居中', 'DashboardLayout', 'flex-col'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-editor-lines-home-tab-size-001',
    title: '正文编辑区横线应可移除且首页标签需要更醒目',
    area: '作品编辑器 / 正文编辑区 / 顶部首页标签',
    symptom: '正文编辑器中间区域铺满横线，空白状态显得像稿纸；左上角“首页”字号偏小，不容易一眼找到返回入口。',
    cause:
      'xy-wa-editor-surface 使用 repeating-linear-gradient 绘制横向分隔线；工作区标签统一使用 13px 字号，首页没有单独的可识别字号层级。',
    solution:
      '将 xy-wa-editor-surface 背景改为纯编辑器底色；为 workspace-tab-home 和 workspace-tab-home-inactive 增加 15px、700 字重，让首页标签比普通作品标签更清楚。',
    prevention:
      '以后调整正文编辑器背景时，不要默认恢复稿纸横线；顶部固定入口需要和普通作品标签区分视觉层级，尤其是“首页”这种返回入口。',
    keywords: ['正文编辑器', '横线', 'xy-wa-editor-surface', '首页', 'workspace-tab-home', '字号', 'AppFrame'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-find-replace-modal-position-001',
    title: '查找替换弹窗不应每次出现在错误位置',
    area: '作品编辑器 / 正文 / 查找替换弹窗',
    symptom: '点击正文工具栏里的“查找”后，查找替换弹窗会出现在左上角或旧的错误位置，和用户当前操作区域脱节。',
    cause:
      '查找替换弹窗是手写 fixed 浮层，渲染在工作台页面内部；工作台外层存在缩放/transform 场景时 fixed 坐标容易和视口坐标不一致。同时旧默认几何写死 left: 16、top: 84，并复用旧 localStorage 位置缓存。',
    solution:
      '将查找替换弹窗改为 createPortal 渲染到 document.body，默认几何只保留居中偏移和宽度；使用新的稳定 storageId 避开旧错误缓存，并让 useDraggableModal 在保存拖动位置前按弹窗宽高夹到视口内。',
    prevention:
      '以后新增或调整可拖动弹窗时，优先复用 WorkbenchModal 或 body portal；不要把 fixed 可拖拽弹窗放在缩放容器内，也不要用固定 left/top 作为默认打开位置。',
    keywords: [
      '查找',
      '替换',
      '弹窗位置',
      'createPortal',
      'document.body',
      'useDraggableModal',
      'localStorage',
      'WorkbenchPage',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-transient-ai-drafts-clear-on-exit-001',
    title: '作品编辑器临时输入和 AI 输出不应跨软件退出保留',
    area: '作品编辑器 / 设定 / 人物设定 / 脑洞 / 正文 AI 对话',
    symptom:
      '生成设定、人物设定、脑洞或正文 AI 对话区域里的用户临时输入和 AI 输出，在关闭软件后再次打开仍可能残留，容易让用户误以为这些内容已经正式保存。',
    cause:
      '这些输入与输出为了页面切换和后台生成使用 localStorage 暂存，和正式作品设定、人物卡、章节正文使用同一类持久化介质；此前没有在软件退出时区分“临时对话”和“正式资料”。',
    solution:
      '新增 workbenchTransientAiCleanup：退出软件或页面卸载时扫描工作台 tab_configs 与正文 AI session 存储，只清空 aiInput、aiOutput、aiResult、AI messages 和后台任务 id；保留正式设定条目、人物卡字段、章节正文、选中项和模型提示词配置。',
    prevention:
      '以后新增 AI 输出框或用户要求输入框时，若内容只是本次对话临时态，必须接入退出清理；正式保存必须通过明确按钮写入作品资料，不能依赖 AI 输出框残留。',
    keywords: [
      '退出软件',
      '临时输入',
      'AI输出',
      'localStorage',
      '人物设定',
      '生成设定',
      'WorkbenchAIPanel',
      'workbenchTransientAiCleanup',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-open-workbench-preload-001',
    title: '我的小说打开作品时标签先出现而作品页稍后进入',
    area: '我的小说 / 工作区标签 / 作品编辑器加载',
    symptom: '点击我的小说里的作品后，顶部作品标签会先出现，作品编辑器内容随后才进入，体感像打开作品慢半拍。',
    cause:
      '作品列表点击时会同步 selectNovel 和 openWorkTab，外壳标签栏立即更新；真正的 /workbench 作品编辑器是 React.lazy 路由，第一次进入还需要加载较大的工作台模块并初始化本地作品、章节、AI面板等状态。',
    solution:
      '在我的小说/我的剧本页面进入时按当前类型预加载对应编辑器模块；作品卡片在鼠标进入、按下或键盘聚焦时也触发预加载，点击时再兜底触发一次，不改变原有作品选择和标签打开逻辑。',
    prevention:
      '体量较大的主工作区页面不要只等点击后懒加载；入口列表、卡片悬停和键盘聚焦都应提前预加载目标页面，减少外壳状态和实际页面渲染之间的视觉时间差。',
    keywords: ['我的小说', '作品标签', '作品编辑器', '预加载', 'React.lazy', 'WorkbenchPage', 'NovelLibraryPage'],
    updatedAt: '2026-06-12',
  },
];
