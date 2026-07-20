import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart34: ErrorLogEntry[] = [
  {
    id: 'workbench-context-menu-width-fit-content-001',
    title: '设定分组右键菜单宽度过大',
    area: '工作台 / 设定 / 左侧分组右键菜单',
    symptom: '道具资源等分组右键菜单弹出后宽度明显超过文字所需，出现大片空白。',
    cause: '右键菜单使用固定最小宽度，按钮又按整行撑满，短菜单项会被迫占用过宽浮层。',
    solution: '分组、条目和提示词右键菜单改为 w-max + 合理最小/最大宽度，菜单项保持单行显示，只比最长文字略宽。',
    prevention: '短命令浮层不要使用过大的固定宽度；新增右键菜单时优先使用内容自适应宽度，并给长文字设置最大宽度边界。',
    keywords: ['右键菜单', '分组菜单', '道具资源', '宽度', 'w-max', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'male-protagonist-context-delete-disabled-001',
    title: '男主角右键菜单删除按钮应灰色禁用',
    area: '工作台 / 人物设定 / 男主角右键菜单',
    symptom: '男主角本身已经有不可删除保护，但右键菜单里的“删除”按钮仍按普通红色删除操作显示，容易误以为可以删除。',
    cause: '右键条目菜单只在确认删除阶段阻止男主角删除，没有在菜单层把删除操作表现为禁用状态。',
    solution: '右键对象是男主角时，删除菜单项显示为灰色 disabled，并在菜单动作里继续保留不可删除防线。',
    prevention: '默认骨架类条目不仅要有数据层保护，也要在菜单入口上展示禁用态，避免用户误解操作结果。',
    keywords: ['男主角', '人物设定', '右键菜单', '删除', '禁用', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'default-setting-entry-context-menu-unified-001',
    title: '默认设定条目也应能打开右键菜单',
    area: '工作台 / 设定 / 左侧设定条目右键菜单',
    symptom: '势力地图等页面里的默认设定条目右键没有反应，用户无法判断是没有菜单还是只是默认项不可删除。',
    cause: '条目右键入口为了保护默认设定条目，直接在打开菜单前 return，导致默认条目的右键菜单完全不显示。',
    solution:
      '默认设定条目继续允许打开右键菜单，但重命名和删除按钮显示为灰色 disabled；自建设定条目仍保持可重命名、可删除。',
    prevention: '默认项保护不要阻断基础交互入口，应在具体危险操作上禁用并保留动作层兜底。',
    keywords: ['默认设定', '设定条目', '右键菜单', '势力地图', '删除禁用', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-context-action-menu-test-08-migrated-001',
    title: '08号测试的设定右键快捷操作应迁入正式页',
    area: '工作台 / 设定 / 左侧分组和设定条目右键菜单',
    symptom:
      '08号测试已经验证底部保留新建主入口、分组和设定条目右键承载快捷操作，但正式页只迁入了一部分清空和删除能力。',
    cause: '原型页只用于展示右键菜单层级，正式页缺少新建设定、新建分组、重命名分组、复制条目和移动到分组等快捷动作。',
    solution:
      '正式分组右键菜单新增新建角色/设定、新建分组、重命名分组；条目右键菜单新增复制和移动到分组；默认分组和默认条目继续禁用危险操作，并删除 08号测试页入口和文件。',
    prevention: '测试页确认后要同时迁入正式交互、补正式页守护测试，并清理测试集合入口、render 分支和测试页文件。',
    keywords: [
      '08号测试',
      '设定分组右键操作',
      '右键菜单',
      '新建设定',
      '重命名分组',
      '移动到分组',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-brainstorm-original-entry-title-align-001',
    title: '09号测试原版条目标题应与分组标题对齐',
    area: '测试集合 / 设定脑洞条目原样恢复测试',
    symptom: '原样恢复版里，设定条目和脑洞库条目的第一个字比上方分组标题更靠左，和旧版视觉不一致。',
    cause: '分组标题前有文件夹图标和间距，标题实际起点约在 28px；原版白色条目只有卡片内边距，标题起点约在 16px。',
    solution:
      '只在原样恢复版条目标题上补 12px 左缩进，让条目标题首字与分组标题首字对齐，同时保留白色卡片和右侧字数胶囊。',
    prevention: '恢复旧版条目视觉时，不仅要恢复卡片和字数胶囊，还要对齐分组标题与条目标题的文字基线。',
    keywords: ['09号测试', '设定条目', '脑洞库', '原样恢复', '标题对齐', 'SettingBrainstormOriginalRowsTestPage'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'novel-library-extension-card-first-row-001',
    title: '首页扩展卡片不应掉到第二行',
    area: '首页 / 作品概览顶部卡片 / 扩展卡片',
    symptom: '作品概览、作品整理、最近编辑都在第一行，扩展卡片却单独占用第二行，造成顶部区域被拉高。',
    cause: '顶部可拖拽宽度网格只包含前三张卡片，扩展卡片写在网格闭合标签之后，所以自然换到了下一行。',
    solution:
      '将扩展卡片移入同一个 dashboardRowRef 网格，把宽度配置扩展为四张卡，并在最近编辑和扩展卡片之间增加第三条可拖拽分割线。',
    prevention:
      '首页顶部新增或移动卡片时，应先确认是否属于同一行可调整宽度卡片组；同组卡片必须放在同一个 grid 容器内。',
    keywords: ['首页', '扩展卡片', '作品概览', '作品整理', '最近编辑', '第一行', 'NovelLibraryPage'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-brainstorm-original-rows-test-migrated-001',
    title: '设定脑洞条目原样恢复测试应迁入正式页',
    area: '工作台 / 设定 / 左侧设定条目与脑洞库',
    symptom:
      '测试页已确认设定条目和脑洞库应恢复白色卡片、字数胶囊和标题对齐，但正式页普通设定/脑洞条目仍保留正文目录式左移样式。',
    cause:
      '正式页的 WORKBENCH_LIBRARY_ENTRY_ROW_BASE_CLASS 仍使用 px-1、rounded-lg 和 11px 贴右字数；测试页验证的原样样式没有迁入 WorkbenchLibraryPanel。',
    solution:
      '将 WorkbenchLibraryPanel 的设定/脑洞条目基类改为 min-h 38px、rounded-xl、px-4 py-2、shadow-sm；条目标题补 pl-3 对齐分组标题，字数恢复为浅底圆角胶囊；正文目录继续保留 ChapterSidebar 的 px-1 左移样式。',
    prevention:
      '测试页迁入正式页时，要明确作用域：设定/脑洞库走 WorkbenchLibraryPanel 条目常量，正文目录走 ChapterSidebar，不要把两者样式一起改。',
    keywords: ['设定条目', '脑洞库', '原样恢复', '白色卡片', '字数胶囊', 'WorkbenchLibraryPanel', 'ChapterSidebar'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'full-software-audit-verification-security-cleanup-001',
    title: '全软件审查后发现验证链和安全边界需要收紧',
    area: '全软件 / 验证流程 / Electron 安全 / 构建产物',
    symptom:
      '全软件审查时发现 verify 会被 lint 和过期测试断言卡住；内置 webview 虽未允许弹窗，但附加时缺少主进程二次收紧；release 目录保留了旧发布包和解包产物，明显放大本地体积。',
    cause:
      '测试文件使用了触发 no-regex-spaces 的正则写法，另一个源码断言仍检查旧版审核章节选中样式；webview 只依赖渲染层属性约束，没有在 will-attach-webview 阶段统一清理危险偏好；release 是被忽略的构建输出，历史包不会自动清理。',
    solution:
      '修正测试断言和 lint 写法；新增 Electron 安全测试并在主进程监听 will-attach-webview，清除 preload、强制 nodeIntegration false、contextIsolation true、sandbox true，并拒绝非 http/https webview 地址；删除本地 release 构建产物目录，后续需要时可重新打包生成。',
    prevention:
      '正式交付前使用 verify 作为完整门禁；webview 新能力必须先在主进程白名单中放行；release、dist、node_modules 等构建或依赖产物继续保持忽略，不作为源码长期积累。',
    keywords: ['全软件审查', 'verify', 'lint', 'webview', 'will-attach-webview', 'release', 'Electron 安全'],
    updatedAt: '2026-06-25',
  },
  {
    id: 'ai-inline-send-icon-deep-cyan-unified-001',
    title: 'AI输入框发射按钮线条色应统一为深青高对比',
    area: '共享组件 / AI输入框 / 发射按钮',
    symptom:
      '测试页确认深青高对比 #21B8DA 更适合作为白底发射按钮常态后，正式页面里的纸飞机按钮仍可能使用主题蓝、灰色或旧浅色，按钮旁竖线也可能被主题染成蓝色而显得突兀。',
    cause:
      '正式发射按钮颜色集中在共享样式 .xy-ai-inline-send 和 writer-assistant-theme 覆盖层里；此前不同主题和 neutral 变体分别覆盖颜色，测试页方案没有同步迁入共享样式。',
    solution:
      '将共享 AI 输入框的发射按钮颜色统一为 #21B8DA；停止按钮左侧分隔线保持 #d7dee8 浅灰，避免出现额外醒目的蓝色竖线；测试页和测试集合说明同步标记深青高对比方案。',
    prevention:
      '以后调整 AI 输入框发射按钮时，应优先改 AiInlineInput 的共享样式，并用 WorkbenchLibraryPanel 测试锁定默认、主题和 neutral 变体的颜色一致性。',
    keywords: ['AI输入框', '发射按钮', '纸飞机', '#21B8DA', '竖线', 'AiInlineInput'],
    updatedAt: '2026-06-26',
  },
  {
    id: 'workbench-close-linked-context-session-cleanup-001',
    title: '关闭软件后右侧 AI 关联资料不应继续保留',
    area: '工作台 / 正文右侧 AI / 关联资料 / 软件关闭清理',
    symptom: '关闭软件再打开后，右侧 AI 区仍可能保留上一轮的关联资料标题、关联正文和已关联条目，用户需要手动取消关联。',
    cause:
      '关闭和新会话清理只清除了章节关联开关 linkChapter 和 hasSentChapterContext，没有同步清理 AI 会话里保存的 contextTitle、contextText 和 linkedItems。',
    solution:
      'clearWorkbenchAiSessionLinksByStorageKey 在清理关联时同时重置 contextTitle、contextText、linkedItems、linkChapter 和 hasSentChapterContext；关闭、页面隐藏和启动清理都会走同一套逻辑。',
    prevention:
      '以后新增临时关联字段时，要加入 workbenchAssociationCleanup 的关闭清理测试，确保关闭软件只保留资料本体，不保留本次运行的关联状态。',
    keywords: [
      '关闭软件',
      '关联资料',
      '右侧AI',
      'linkedItems',
      'contextText',
      'WorkbenchAIPanel',
      'workbenchAssociationCleanup',
    ],
    updatedAt: '2026-07-06',
  },
  {
    id: 'prompt-management-txt-import-export-001',
    title: '提示词管理需要 TXT 导入导出入口',
    area: '提示词管理 / 顶部工具栏 / TXT 导入导出',
    symptom: '提示词管理右上角只有回收站入口，无法直接把提示词库导出为 TXT，也无法从 TXT 文件导入提示词。',
    cause:
      '页面此前只覆盖创建、编辑、删除、回收站和分类管理，缺少导入导出的显式入口；usePrompts 也只有单条新增，连续导入多条容易依赖旧 prompts 状态。',
    solution:
      '在回收站旁新增“导入提示词”和“导出提示词”按钮；导出生成月下提示词导出 v1 纯 TXT；导入优先识别同格式，多条一次性批量写入并同步新增分类，普通 TXT 会按单条提示词导入。',
    prevention:
      '提示词库新增迁移或备份入口时，页面按钮、TXT/JSON 格式解析、批量写入 hook 和源码断言测试要一起补，避免只有 UI 入口没有可靠数据写入。',
    keywords: ['提示词管理', '导入提示词', '导出提示词', 'TXT', 'PromptsPage', 'usePrompts', 'addPrompts'],
    updatedAt: '2026-07-07',
  },
  {
    id: 'global-data-migration-replace-import-001',
    title: '两台电脑之间需要可见的全局数据迁移入口',
    area: '设置 / 数据迁移 / 全局备份导入导出',
    symptom:
      '家里电脑和公司电脑安装同一项目后，提示词、新建小说和页面设置不一致；旧的本地备份页面入口隐藏，导入也只是叠加写入，不能保证公司电脑变成家里电脑状态。',
    cause:
      '备份能力停留在数据库设置隐藏页面，导航和设置页没有明确入口；导入逻辑只写入备份中的 key，没有先清除本软件已有的可恢复 key，旧数据可能残留。',
    solution:
      '设置页新增“数据迁移”分区，复用并升级全局备份页面；导出生成 yuexia-global-backup zip；导入前确认覆盖，先清除本软件可恢复 localStorage key，再写入备份内容，并兼容旧 JSON key 映射格式。',
    prevention:
      '全局迁移必须同时覆盖入口可见性、项目 key 白名单、安全脱敏、替换式恢复和导入确认；新增本地存储 key 时要确认 isRestorableLocalStorageKey 能覆盖。',
    keywords: [
      '全局数据迁移',
      '导出全局备份',
      '导入全局备份',
      'DbSettingsPage',
      'SettingsPage',
      'replaceRestorableLocalStorageData',
    ],
    updatedAt: '2026-07-07',
  },
  {
    id: 'test-collection-tested-pages-cleanup-001',
    title: '测试集合里已测试的临时测试页应及时清理',
    area: '测试集合 / 已测试标记 / 临时测试页清理',
    symptom:
      '测试集合里已有 6 个测试页被本机运行时标记为已测试，但入口、懒加载组件、渲染分支和专用测试文件仍然留在源码中，导致测试区继续堆积已完成验证的临时页面。',
    cause:
      '测试集合的已测试状态保存在 localStorage 的 xinyuexia_test_collection_tested_paths_v1 中，源码不会自动根据该运行时标记删除页面；如果完成验证后不做源码清理，临时页会长期占用测试导航。',
    solution:
      '按已测试标记清理 clean-writer、workbench-ai-right-width、shuimo-selection-state、shuimo-sidebar-scheme、shuimo-semantic-palette、genre-iteration-moonfall-style 这 6 个测试页，删除对应组件和测试文件，并把路径加入 TestCollectionDeleteMarkedCleanup.test.tsx 的回归断言。',
    prevention:
      '临时测试页确认完成后，应同步删除 TestCollectionPage 的入口和渲染分支、删除页面文件和专用测试文件，并在 TestCollectionDeleteMarkedCleanup.test.tsx 中登记已移除路径，避免后续重新加入。',
    keywords: [
      '已测试',
      '测试集合',
      '删除测试页',
      'TestCollectionPage',
      'TestCollectionDeleteMarkedCleanup',
      'xinyuexia_test_collection_tested_paths_v1',
    ],
    updatedAt: '2026-07-07',
  },
  {
    id: 'tomato-browser-adaptive-webview-collapsible-ai-001',
    title: '番茄浏览器网页不应被右侧 AI 配置区挤到显示不全',
    area: '番茄浏览器 / 内置 webview / 右侧 AI 配置区',
    symptom:
      '番茄浏览器中间网页区域被左侧导航和 420px 右侧 AI 配置区挤窄时，webview 仍强制 1280px 最小宽度，页面右侧需要横向滚动才能看到，看起来像网页显示不全。',
    cause:
      '页面根布局使用固定三列，webview 内层又设置 TOMATO_DESKTOP_MIN_WIDTH 作为 minWidth；当中间列实际宽度不足 1280px 时，外层容器裁切网页右侧。右侧 AI 配置也没有收起态，无法临时释放空间。',
    solution:
      '将番茄浏览器根布局改为动态 gridTemplateColumns；webview minWidth 改为 100%，随中间列自适应；右侧 AI 配置区增加 PanelRightClose/PanelRightOpen 收起展开按钮，收起后宽度降为 56px，把更多空间交给网页。',
    prevention:
      '内嵌网页页面不要在业务工作台里硬编码大于可见列宽的 minWidth；如果右侧配置区会长期占宽，应提供收起态，并用测试锁定自适应 webview 和收起按钮。',
    keywords: [
      '番茄浏览器',
      'webview',
      '网页显示不全',
      'AI配置',
      '收起展开',
      'TomatoGenreIterationTestPage',
      'PanelRightClose',
    ],
    updatedAt: '2026-07-07',
  },
  {
    id: 'tomato-browser-left-nav-bookmark-bar-001',
    title: '番茄浏览器左侧快捷区不应长期占用网页横向空间',
    area: '番茄浏览器 / 地址栏 / 快捷栏 / 收藏功能',
    symptom:
      '番茄浏览器左侧“题材迭代”快捷区独立占用 220px 宽度，网页本体可见宽度被压缩；用户还无法像浏览器收藏夹一样自由保存当前网页并命名。',
    cause:
      '番茄快捷入口沿用了测试原型的三列布局，左侧流程导航与浏览器地址栏分离；页面没有持久化收藏数据，也没有为当前 webview URL 和标题提供保存入口。',
    solution:
      '移除左侧独立导航列，把番茄排行榜、男频分类、搜索小说、迭代流程整合到地址栏下方快捷栏；新增收藏名称输入框、收藏当前网页按钮、收藏项列表和删除收藏能力，收藏数据保存到 xinyuexia_tomato_browser_bookmarks。',
    prevention:
      '浏览器类页面优先把快捷入口放在地址栏附近，避免常驻侧栏挤压网页；新增收藏能力时要同步保存 URL、可编辑标题、删除入口和本地持久化 key。',
    keywords: [
      '番茄浏览器',
      '快捷栏',
      '收藏夹',
      '收藏名称',
      'xinyuexia_tomato_browser_bookmarks',
      'TomatoGenreIterationTestPage',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-configurable-homepage-001',
    title: '番茄浏览器需要可配置首次进入首页',
    area: '番茄浏览器 / 首页设置 / 快捷栏',
    symptom:
      '点击左侧导航进入番茄浏览器时只能打开固定的番茄排行榜，用户不能把常用榜单、分类页或搜索页设为下次首次进入的页面。',
    cause:
      '页面初始化直接使用 TOMATO_DEFAULT_URL，没有独立保存用户选择的首页 URL；快捷栏也缺少打开首页和设为首页入口。',
    solution:
      '新增 xinyuexia_tomato_browser_home_url 本地存储 key；初始化时优先读取该 URL；快捷栏新增“打开首页”和“设为首页”按钮，允许把当前 webview 页面保存为下次进入番茄浏览器的首页。',
    prevention:
      '浏览器类导航页如果有默认打开地址，应把默认值和用户配置分开；提供显式“设为首页”入口，并在初始化测试中锁定本地 key 和打开逻辑。',
    keywords: [
      '番茄浏览器',
      '首页',
      '设为首页',
      '打开首页',
      'xinyuexia_tomato_browser_home_url',
      'TomatoGenreIterationTestPage',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-rank-default-home-url-001',
    title: '番茄浏览器默认首页应打开指定排行榜页面',
    area: '番茄浏览器 / 默认首页 / 番茄排行榜',
    symptom:
      '进入番茄浏览器或点击番茄排行榜时仍可能打开 https://fanqienovel.com/rank，而不是用户指定的 https://fanqienovel.com/rank/1_1_8；如果本地首页保存过旧默认值，设为首页看起来也可能没有变化。',
    cause:
      'TOMATO_DEFAULT_URL 和番茄排行榜快捷入口仍指向旧 rank 根路径；首页读取逻辑没有把历史旧默认值迁移到新的指定排行榜 URL。',
    solution:
      '将 TOMATO_DEFAULT_URL 和番茄排行榜入口统一改为 https://fanqienovel.com/rank/1_1_8；新增 TOMATO_OLD_DEFAULT_URL 兼容判断，读取到旧默认首页时自动回退到新默认地址。',
    prevention:
      '浏览器首页默认值调整时，要同步默认常量、快捷入口和本地历史值迁移规则，避免旧 localStorage 覆盖新默认。',
    keywords: ['番茄浏览器', '默认首页', '番茄排行榜', 'rank/1_1_8', 'TOMATO_DEFAULT_URL', 'TOMATO_OLD_DEFAULT_URL'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-ai-panel-resizable-001',
    title: '番茄浏览器右侧 AI 配置栏需要可拖拽调整宽度',
    area: '番茄浏览器 / 右侧 AI 配置 / 拖拽分割线',
    symptom: '番茄浏览器右侧 AI 配置栏固定为 420px，用户不能根据网页和 AI 区内容自由调整空间。',
    cause: '页面 grid 只按固定宽度渲染右侧 AI 配置栏，没有独立分割线、拖拽状态和最小宽度限制。',
    solution:
      '将布局改为浏览器主体、6px 分割线、AI 配置栏三列；新增 startAiPanelResize 拖拽逻辑，默认宽度 420px，最小宽度为默认宽度的 60% 即 252px，最大宽度 720px；收起状态隐藏分割线并保持 56px 窄栏。',
    prevention: '可调右侧栏应同时定义默认宽度、最小宽度、最大宽度和拖拽手柄，并用测试锁定 60% 最小宽度规则。',
    keywords: ['番茄浏览器', 'AI配置', '拖拽分割线', 'TOMATO_AI_PANEL_MIN_WIDTH', 'startAiPanelResize', 'col-resize'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-home-url-strip-force-mobile-001',
    title: '番茄浏览器软件默认首页不应保存移动端参数',
    area: '番茄浏览器 / 默认首页 / force_mobile 参数',
    symptom:
      '软件默认首页应为 https://fanqienovel.com/rank/1_1_8，但再次进入时可能变成 https://fanqienovel.com/rank/1_1_8?force_mobile=1。',
    cause:
      'webview 实际导航后的 URL 可能带有 force_mobile=1；此前只在设为首页或读取本地首页时清理，地址栏同步、收藏和新窗口跳转仍可能把该参数重新带回软件状态。',
    solution:
      '新增 normalizeTomatoBrowserUrl 作为番茄浏览器统一入口；首页读取/保存、地址栏同步、打开链接、收藏和新窗口跳转都统一删除 force_mobile 参数。',
    prevention:
      '浏览器首页和软件地址栏属于本地软件状态，不应直接持久化站点跳转产生的临时参数；所有 webview URL 回写路径都必须先做统一清理。',
    keywords: [
      '番茄浏览器',
      '软件默认首页',
      'force_mobile',
      'normalizeTomatoBrowserUrl',
      'normalizeTomatoHomeUrl',
      'xinyuexia_tomato_browser_home_url',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-horizontal-scrollbar-for-wide-page-001',
    title: '番茄浏览器宽网页被右侧栏压窄时底部应有横向滚动条',
    area: '番茄浏览器 / webview / 横向滚动',
    symptom: '右侧 AI 配置栏占用宽度后，番茄网页右侧内容被裁掉，页面最下方没有横向滚动条，用户无法看到完整网页。',
    cause:
      '上一轮为了解决网页显示不全把 webview 容器改成 overflow-hidden 且 minWidth 100%，但番茄榜单实际是桌面宽页；当可视列变窄时缺少横向滚动容器。',
    solution:
      '恢复 webview 外层 overflow-x-auto overflow-y-hidden，并设置 TOMATO_BROWSER_DESKTOP_MIN_WIDTH 为 1280px，让底部出现横向滚动条查看完整网页。',
    prevention: '内嵌桌面网页如果保持桌面宽度，外层必须保留横向滚动；只做 100% 自适应会导致站点内部内容被压缩或裁切。',
    keywords: ['番茄浏览器', '横向滚动条', 'webview', 'overflow-x-auto', 'TOMATO_BROWSER_DESKTOP_MIN_WIDTH'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-book-detail-new-window-current-view-001',
    title: '番茄浏览器点击书名应在当前页进入书籍详情',
    area: '番茄浏览器 / webview / 书籍详情跳转',
    symptom: '番茄排行榜页面可以打开，但点击书名无法进入书籍详情。',
    cause:
      '番茄站点的书籍详情链接可能通过新窗口或新标签打开；当前 webview 没有 allowpopups，也没有监听 new-window / did-create-window 事件接管跳转。',
    solution:
      '保持不使用 allowpopups，在 TomatoGenreIterationTestPage 中监听 webview 的 new-window 和 did-create-window 事件，提取目标 URL 后在当前番茄浏览器 webview 内打开；同时在 dom-ready / did-finish-load 后注入安全脚本，把页面里的 a[target] 改为 target=_self。',
    prevention:
      '内嵌浏览器不应放开任意弹窗；需要新窗口跳转时，应拦截目标 URL 并在当前受控 webview 中导航；站点使用 target=_blank 时应在 webview 内改为当前页打开。',
    keywords: ['番茄浏览器', '书籍详情', 'new-window', 'did-create-window', 'allowpopups', 'webview'],
    updatedAt: '2026-07-08',
  },
];
