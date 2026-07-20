import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart13: ErrorLogEntry[] = [
  {
    id: 'setting-taxonomy-plan-migrated-to-production-001',
    title: '设定分类与人物关系字段从测试页迁入正式页',
    area: '作品编辑器 / 大纲 / 作品设定 / 人物设定',
    symptom:
      '“设定分类与人物字段方案测试”已经确认了作品设定 14 类顺序和人物关系归属，但正式设定页仍使用旧分类，人物关系也只能混写在基础设定里。',
    cause:
      '测试页只是保存方案，没有同步到 WorkbenchLibraryPanel 的 DEFAULT_SETTING_TYPES、智能导入分类规则和 RoleContent 人物字段结构。',
    solution:
      '正式作品设定分类改为核心设定、题材卖点、世界规则、成长体系、金手指、势力组织、人物关系、道具资源、地点地图、主线剧情、伏笔谜团、禁写规则、其他设定、未分类；旧分类名自动映射到新分类；人物设定卡新增“人物关系”输入区并纳入 AI 读取内容；迁入后删除临时测试页入口。',
    prevention:
      '以后测试页确认的资料结构方案迁入正式页时，要同时更新默认分类、导入归类、数据解析/序列化、AI 读取内容和测试集合清理。',
    keywords: [
      '设定分类',
      '人物关系',
      'DEFAULT_SETTING_TYPES',
      'classifySettingText',
      'RoleContent',
      'SettingTaxonomyPlanTestPage',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-selection-style-option-a-word-count-official-001',
    title: '章纲左侧选中态采用方案 A 并显示字数',
    area: '作品编辑器 / 章纲 / 左侧章节数字条目',
    symptom:
      '章纲选中态测试已经确认采用方案 A，但正式左侧数字条目仍是旧的小号按钮；测试预览里有内容状态还显示“有章纲”，不够直观。',
    cause:
      '方案页只完成了多方案比较，正式 WorkbenchLibraryPanel 没有迁入双态色块方钮和字数徽标；测试页的有内容徽标也沿用了状态文案。',
    solution:
      '正式章纲左侧条目改为方案 A：选中有内容用薄荷绿、选中无内容用浅橙；有内容直接显示章纲字数，无内容显示“无章纲”。测试页同步去掉“有章纲”字样，改成“1865字选中”等字数表达。',
    prevention:
      '以后章纲目录状态确认后，要同步迁入正式页和测试页文案；有内容状态优先显示字数，不再回退到“有章纲”这类抽象标签。',
    keywords: [
      '章纲',
      '方案A',
      '双态色块',
      '薄荷绿',
      '1865字',
      '无章纲',
      'WorkbenchLibraryPanel',
      'WorkbenchDetailOutlineSelectionStyleTestPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-flow-button-option-a-soft-gray-official-001',
    title: '顶部流程按钮改用方案 A 浅灰柔线',
    area: '作品编辑器 / 顶部流程按钮',
    symptom: '黑色细线方案结构清楚但视觉偏重，用户最终选择测试页里的“方案 1：浅灰柔线”。',
    cause: '黑色线条虽然能压住灰蒙感，但在作品编辑器顶部会比正文区域更抢眼；浅灰柔线更符合轻量工具感。',
    solution:
      '正式 xy-flow-status 线条改为方案 A：外框 #CBD5E1、内部分隔 #E2E8F0、选中边框 #BDEEF7、轻量灰影 0 1px 3px rgba(15, 23, 42, 0.08)。',
    prevention: '以后从流程按钮框线测试页迁入方案时，只迁入线色、选中边框和阴影；不要带入测试卡片布局或额外竖线。',
    keywords: ['流程按钮', '方案A', '浅灰柔线', '#CBD5E1', '#E2E8F0', 'WorkbenchHeader', 'index.css'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'chapter-sidebar-selected-background-options-test-001',
    title: '正文目录选中橙底需要更多替代方案',
    area: '测试集合 / 作品编辑器 / 左侧正文目录',
    symptom: '正文目录选中章节使用浅橙底，用户觉得不够好看，希望先在测试页比较更多背景方案。',
    cause: '先前只提供默认、加粗和橙底三种方案，缺少冷灰、浅青、薄荷、描边等更克制的选中态对比。',
    solution:
      '在“作品编辑器左侧导航加粗测试”中新增“正文目录：选中背景方案对比”，保留当前橙底作为对照，并增加浅青蓝、冷灰、薄荷绿、蓝色描边、淡紫灰方案。',
    prevention: '正式迁入前只从该测试页选择一种选中背景；不要同时改章节行字体、卷条或右侧编辑区。',
    keywords: ['正文目录', '选中背景', '橙底', '#FFF7ED', 'WorkbenchSidebarBoldNavigationTestPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-selection-state-design-test-001',
    title: '章纲有内容与无内容选中态需要先在测试页比较',
    area: '测试集合 / 作品编辑器 / 章纲左侧数字条目',
    symptom: '章纲页面左侧数字条目只有“1 / 2”这类短编号，有章纲和无章纲在选中后不够容易区分。',
    cause: '正式章纲目录当前主要依靠背景和边框表达选中态，没有把“有章纲”和“无章纲”的状态差异单独设计成可比较方案。',
    solution:
      '新增“章纲选中态方案测试”，同时展示有章纲选中和无章纲选中，提供双态色块、左侧状态条、胶囊徽标、极简边框 4 套方案。',
    prevention:
      '正式迁入章纲数字条目选中态前，先在该测试页确认方案；迁入时只改章纲数字条目的状态视觉，不顺手调整右侧编辑区。',
    keywords: ['章纲', '选中态', '有章纲', '无章纲', '测试页', 'WorkbenchDetailOutlineSelectionStyleTestPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-flow-button-black-fine-line-only-001',
    title: '顶部流程按钮只迁入黑色细线方案',
    area: '作品编辑器 / 顶部流程按钮',
    symptom:
      '顶部流程按钮灰色线偏弱；迁入测试页“方案 4：黑色细线”时，容易把测试预览里的其他布局或额外竖线一起带进正式页面。',
    cause:
      '测试页方案同时展示边框、阴影和内部按钮结构；正式页面已有自己的按钮组结构，如果直接照搬预览布局，会在“审核”等按钮右侧叠出多余竖线。',
    solution:
      '正式页面只把流程按钮线条改为 #111827 的 1px 细线和轻量黑色阴影；按钮尺寸、文字、背景和分组不改，按钮右边线保持透明以避免重复竖线。',
    prevention:
      '以后从流程按钮框线测试页迁入方案时，只迁入 line color/line width/shadow，不要迁入测试预览的额外分隔结构。',
    keywords: ['流程按钮', '黑色细线', '#111827', '竖线', 'WorkbenchHeader', 'index.css'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'brainstorm-entry-selected-text-match-chapter-sidebar-001',
    title: '脑洞条目选中态文字应匹配正文目录黑字样式',
    area: '作品编辑器 / 脑洞 / 左侧脑洞列表',
    symptom: '脑洞页面选中的“脑洞1”仍显示橙色文字，和正文目录选中章节的浅橙底、黑色加粗文字、灰色数字不一致。',
    cause:
      'WorkbenchLibraryPanel 对 activeIsBrainstorm 的条目按钮和标题单独叠加了 text-orange-500，导致选中态既有橙底又有橙字，视觉过重。',
    solution:
      '脑洞条目选中态保留 xy-selected-orange-bg，但文字改为 text-gray-900/text-gray-700；标题使用 text-sm font-black text-gray-700，右侧字数改为 text-gray-400。',
    prevention: '以后同步正文目录选中样式时，脑洞条目只用浅橙底表达选中，不要再给条目标题加 text-orange-500。',
    keywords: ['脑洞', '选中态', 'text-orange-500', 'xy-selected-orange-bg', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-context-library-confirm-link-required-outline-001',
    title: '正文关联资料确认后必须真正关联当前章纲',
    area: '作品编辑器 / 正文 / 关联资料弹窗',
    symptom: '关联资料弹窗底部按钮文案仍是“确认读取”；点击后如果只选择当前章纲，右侧 AI 面板没有正确显示已关联资料。',
    cause:
      '确认逻辑会把当前章节必选章纲从 selectedItems 中过滤掉，只把可选项写入 linkedContextItems；在用户主动确认后，空数组又会阻止必选章纲重新附加。',
    solution:
      '按钮改名为“确认关联”；确认时把 requiredContextItems 和可选项合并后一起写入 linkedContextItems，并用合并结果同步草稿选中项。',
    prevention:
      '关联资料弹窗的确认动作必须保存最终会发送给 AI 的有效关联项；必选当前章纲不能只存在于弹窗草稿或派生 effective 列表里。',
    keywords: ['关联资料', '确认关联', '确认读取', '当前章纲', 'linkedContextItems', 'WorkbenchPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-flow-button-border-color-options-test-001',
    title: '顶部流程按钮灰色框线需要更多对比方案',
    area: '测试集合 / UI 与主题 / 作品编辑器配色',
    symptom: '作品编辑器顶部流程按钮的灰色框线偏弱，用户希望在测试页多看几套边框方案，并特别加入黑色线版本。',
    cause:
      '原配色测试只比较正文输入区、标题栏和面板整体色，没有把顶部流程按钮框线单独拆出来比较深浅、冷暖和黑色线强度。',
    solution:
      '在“作品编辑器输入区与标题栏配色测试”中新增“顶部流程按钮框线方案”，提供浅灰、蓝灰、深蓝灰、黑色细线和黑色加粗线 5 套对比。',
    prevention:
      '正式迁入顶部流程按钮框线前，先在该测试页确认线色和线宽；黑色线至少比较细线与加粗两档，避免直接上过重边框。',
    keywords: ['顶部流程按钮', '框线', '黑色线', '边框方案', 'WorkbenchSurfaceColorStyleTestPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-surface-color-style-test-page-001',
    title: '作品编辑器输入区和标题栏配色需要先在测试页比较',
    area: '测试集合 / UI 与主题 / 作品编辑器配色',
    symptom:
      '用户想确认正文输入区使用 #F5F5F7 是否合适，同时比较软件标题栏的颜色，但正式界面没有并排预览不同组合的地方。',
    cause:
      '正文输入区、软件标题栏、右侧 AI 面板和边界线属于同一套视觉层级，单独改一个颜色很难判断整体是否灰、是否够清晰。',
    solution:
      '新增“作品编辑器输入区与标题栏配色测试”，放入测试集合 UI 与主题分组，提供 5 套 #F5F5F7 输入区和不同标题栏/边界组合方案。',
    prevention: '正式迁入正文输入区或标题栏配色前，先在该测试页对比整屏层级；不要只凭单个色值直接改生产样式。',
    keywords: [
      '#F5F5F7',
      '标题栏',
      '正文输入区',
      '配色测试',
      'TestCollectionPage',
      'WorkbenchSurfaceColorStyleTestPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-reader-link-button-toggle-clear-001',
    title: '章纲关联大纲按钮应再次点击取消关联',
    area: '作品编辑器 / 章纲 / 关联大纲按钮',
    symptom: '章纲页面已关联大纲后，取消关联仍依赖右侧独立 X，入口不如正文页面一致；已关联状态的按钮也不够醒目。',
    cause:
      'LinkedSourceControl 默认把已关联主按钮继续作为打开弹窗入口，把清除动作拆到单独 X 按钮；章纲页没有启用与正文一致的同按钮切换交互。',
    solution:
      '为 LinkedSourceControl 增加 clearOnLinkedClick 模式；章纲页关联大纲控件启用该模式，已关联时点击主按钮直接清空关联，不再渲染独立 X，并把已关联主按钮改为红底白字。',
    prevention:
      '以后章纲页关联控件应保持“未关联点击打开、已关联再次点击取消”的双态按钮；不要恢复独立 X 或弱提示色的已关联按钮。',
    keywords: ['章纲', '关联大纲', '取消关联', '红底按钮', 'LinkedSourceControl', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-floating-title-font-match-meta-001',
    title: '章纲与状态变化浮动标题需要匹配右侧章节标题字体',
    area: '作品编辑器 / 章纲 / 章纲编辑卡片',
    symptom:
      '章纲卡片左上角“第X章章纲”和下方“状态变化”仍使用蓝色小号浮动标题，和右上角“第1卷 · 未命名章节”的黑色粗体不一致。',
    cause:
      '章纲标题复用了通用 xy-floating-title-text 样式，该样式默认是蓝色、较小字号并带白色描边；右侧章节 meta 使用的是 text-sm font-black text-slate-950。',
    solution:
      '为章纲和状态变化标题增加 xy-detail-outline-heading-title 专用类，覆盖为黑色、14px、900 字重和 20px 行高，并取消蓝色标题描边。',
    prevention:
      '后续调整章纲卡片边框标题时，章纲标题和状态变化标题应共用 xy-detail-outline-heading-title，不要退回通用蓝色浮动标题。',
    keywords: ['章纲', '状态变化', '浮动标题', '字体', 'WorkbenchLibraryPanel', 'xy-detail-outline-heading-title'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'startup-dashboard-removed-open-novels-001',
    title: '软件启动不应再进入首页',
    area: '启动入口 / 路由 / 我的小说',
    symptom: '用户希望进入软件后直接看到“我的小说”，不要再停在原来的首页，也不要保留首页页面。',
    cause: '旧实现把根路由、兜底路由、Electron 默认地址、启动器 hash、顶部固定标签和部分返回兜底都指向 /dashboard。',
    solution:
      '删除 DashboardPage 页面路由和文件；把根路由、未知路由、Electron 默认 hash、VBS 启动器、顶部固定标签、F1/左滑返回和工作台兜底统一改到 /novels。',
    prevention:
      '后续新增返回入口或启动入口时统一指向 HOME_TAB.path，不要重新写死 /dashboard；若要恢复首页，必须同时恢复路由、启动器和导航契约测试。',
    keywords: ['启动', '首页', '我的小说', '/novels', '/dashboard', 'DashboardPage', 'HOME_TAB'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-selected-chapter-orange-volume-default-001',
    title: '橙底选中态只应用到章节和条目',
    area: '作品编辑器 / 左侧目录 / 分卷与章节选中态',
    symptom: '正文目录中“第一卷”等分卷行跟着当前章节变成 #FFF7ED，用户实际只希望“第1章”等选中章节使用橙底。',
    cause: '上一版把“当前分组/当前卷”也视为选中态，给分组标题行叠加了 xy-selected-orange-bg。',
    solution:
      '移除 ChapterSidebar、PublishedSidebar、WorkbenchLibraryPanel 和 ChapterEditor 中分组/分卷标题行的橙底联动，只保留真正选中的章节、条目、勾选项使用 xy-selected-orange-bg。',
    prevention:
      '目录样式区分“分组标题行”和“可选内容行”：分组标题可加粗但保持默认分组底色，橙底只给用户直接选中的章节或条目。',
    keywords: [
      '分卷',
      '第一卷',
      '选中章节',
      '#FFF7ED',
      'xy-selected-orange-bg',
      'ChapterSidebar',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-bold-orange-group-style-production-001',
    title: '加粗橙底分组方案需要迁入所有正式目录',
    area: '作品编辑器 / 左侧目录 / 分组与选中态',
    symptom:
      '测试页确认“加粗橙底方案”后，正式页面里的正文、已发布、脑洞、设定、人物、章纲、审核、点评和状态目录仍可能保留中等字重或浅青蓝选中态。',
    cause:
      '这些目录分散在 ChapterSidebar、PublishedSidebar、WorkbenchLibraryPanel 和 ChapterEditor 中，各自维护分组标题、数量徽标和选中条目样式。',
    solution:
      '将正式目录分组标题和数量徽标统一加粗；当前分组、当前章节、当前条目、已勾选读取项等选中态统一使用 xy-selected-orange-bg，确保真实背景为 #FFF7ED。',
    prevention:
      '以后从测试页迁入目录样式时，要同时检查正文/已发布/资料库/章纲/审核点评状态四类组件，并避免直接使用会被主题覆盖的 bg-[#FFF7ED]。',
    keywords: [
      '加粗橙底方案',
      '分组',
      '#FFF7ED',
      'xy-selected-orange-bg',
      'ChapterSidebar',
      'PublishedSidebar',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'orange-selected-background-theme-override-001',
    title: '橙底选中态不能直接使用 bg-[#FFF7ED]',
    area: '作品编辑器 / 左侧导航 / 主题样式覆盖',
    symptom: '测试页和正式正文目录虽然写了 #FFF7ED，但界面实际仍显示浅青蓝，用户指出颜色不对。',
    cause: 'writer-assistant-theme 的全局 CSS 会把 .bg-[#FFF7ED] 统一重写成 var(--xy-wa-active-soft)，实际变成浅青色。',
    solution:
      '新增 xy-selected-orange-bg 专用类，使用 background-color: #FFF7ED !important，并让正文目录章节行、当前卷行和加粗橙底测试方案都改用该类。',
    prevention:
      '以后需要保留真实橙底时，不要直接使用 bg-[#FFF7ED]；应使用 xy-selected-orange-bg 或先确认全局主题没有重写该 Tailwind 类。',
    keywords: [
      '#FFF7ED',
      '浅青蓝',
      'xy-selected-orange-bg',
      'writer-assistant-theme',
      'ChapterSidebar',
      'WorkbenchSidebarBoldNavigationTestPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'chapter-sidebar-selected-volume-orange-background-001',
    title: '正文目录当前卷行也需要橙底选中态',
    area: '作品编辑器 / 正文目录 / 卷分组选中态',
    symptom:
      '正文目录当前章节已经改为 #FFF7ED 背景，但“第一卷”等当前卷分组行仍然显示浅青蓝背景，用户看到正式页面仍像没有改到。',
    cause:
      '上一版只处理章节列表项 chapter.isSelected，没有处理当前章节所在卷行的视觉状态；卷行固定使用 WORKBENCH_FOLDER_GROUP_BUTTON_CLASS 的 #E7F8FD 背景。',
    solution:
      '将卷行拆成基础样式、默认浅青色调和选中橙底色调；当卷内存在当前选中章节时，卷行使用 border-transparent bg-[#FFF7ED]，文字颜色继续保持 #1f2933。',
    prevention: '以后调整正文目录选中态时，要同时检查当前章节行和当前章节所属卷行，不能只验证章节列表项。',
    keywords: ['正文目录', '第一卷', '卷分组', '选中态', '#FFF7ED', 'ChapterSidebar'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-sidebar-bold-orange-background-option-test-001',
    title: '左侧导航加粗测试需要橙底选中方案',
    area: '测试集合 / 作品编辑器 / 左侧导航加粗方案',
    symptom: '当前加粗测试页只有默认浅青选中背景，无法对比 #FFF7ED 橙底选中项在加粗状态下的效果。',
    cause: '测试页只提供当前样式和加粗方案，缺少同样加粗但换选中背景的第三方案。',
    solution:
      '在 WorkbenchSidebarBoldNavigationTestPage 中新增“加粗橙底方案”，保持文字加粗，只把选中项背景改为 #FFF7ED，并改为自适应三列预览。',
    prevention: '新增左侧导航视觉方案时先放在测试页独立列，不直接覆盖正式样式。',
    keywords: ['加粗方案', '#FFF7ED', '左侧导航', '测试集合', 'WorkbenchSidebarBoldNavigationTestPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'chapter-editor-high-frequency-highlight-visible-color-001',
    title: '正文高频词高亮不应被输入层遮住',
    area: '作品编辑器 / 正文 / 高频词',
    symptom: '开启高频词后，正文中配置过的词没有明显高亮；高频词设置里也只能使用固定黄色，不能按用户偏好选择颜色。',
    cause:
      '正文 textarea 使用 xy-wa-editor-text-layer 后被全局背景规则设为不透明，遮住了下层 HighlightOverlay；高亮颜色也写死为 yellow 类名。',
    solution:
      '正文 textarea 显式使用透明背景，让下层高频词覆盖层可见；新增高频词高亮颜色配置，保存到 xinyuexia_high_freq_highlight_color，并在 HighlightOverlay 中按配置渲染。',
    prevention:
      '以后调整正文输入层背景或稿纸线时，要同时验证 HighlightOverlay 是否仍可见；高频词颜色用存储配置和内联色值，不要恢复固定 Tailwind 黄底。',
    keywords: ['高频词', '高亮', 'HighlightOverlay', 'textarea', 'backgroundColor', '高亮颜色', 'ChapterEditor'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'chapter-sidebar-selected-background-only-001',
    title: '正文目录选中章节只应改变背景',
    area: '作品编辑器 / 正文目录 / 章节选中态',
    symptom: '正文目录选中章节时，标题文字被改成橙色、右侧字数被改成蓝色，和用户要求的“只改选中背景”不一致。',
    cause: '上一版把参考图里的橙色风格理解为整套选中态，同时修改了边框、标题文字和字数字色。',
    solution:
      '选中章节仅使用 #FFF7ED 背景；边框保持透明，章节标题继续使用 text-gray-700，右侧字数继续使用 text-gray-400。',
    prevention: '正文目录章节选中态只允许用背景表达当前项，除非用户明确要求，不要额外修改标题、字数或边框颜色。',
    keywords: ['正文目录', '章节选中态', '#FFF7ED', '字体颜色', 'ChapterSidebar'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'linked-word-count-label-compact-001',
    title: '关联字数提示应更短',
    area: '作品编辑器 / AI 关联资料 / 字数提示',
    symptom: '关联资料按钮右侧显示“已关联：XXXX 字”，在窄区域里占用空间偏多，容易挤压关联按钮组。',
    cause: '旧文案同时在按钮里表达“已关联”，又在字数提示里重复“已关联：”，信息重复。',
    solution: '把正文 AI 面板、设定关联脑洞和章纲关联大纲的字数提示统一改为“关联 X 字”，测试预览页同步更新。',
    prevention: '关联按钮本身负责表达已关联状态，旁边 meta 只保留“关联 + 字数”，不要恢复“已关联：X 字”的重复文案。',
    keywords: [
      '关联字数',
      '已关联',
      'WordCountText',
      'WorkbenchAIPanel',
      'WorkbenchLibraryPanel',
      'LinkedSourceControl',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'brainstorm-generate-sequential-only-001',
    title: '脑洞生成应固定为逐个生成',
    area: '作品信息 / 脑洞生成 / 生成数量',
    symptom: '脑洞生成区仍有“逐个 / 一次”切换，用户选择多个数量时容易误以为软件会一次性批量生成多个脑洞。',
    cause:
      '旧版保留 BrainstormGenerateMode 的 batch 分支、brainstormGenerateMode 配置项和模式切换按钮，生成入口可以在逐个与一次性生成之间切换。',
    solution:
      '删除“逐个 / 一次”切换和 batch 模式字段，生成按钮改为“逐个生成”；选择 3、5、10 时统一按顺序生成，完成一个后再生成下一个。',
    prevention:
      '脑洞多数量生成只保留顺序请求路径，后续调整脑洞生成控件时不要恢复 batch 类型、brainstormGenerateMode 配置或“一次”按钮。',
    keywords: ['脑洞生成', '逐个生成', '批量生成', '一次', 'WorkbenchLibraryPanel', 'BrainstormGenerateMode'],
    updatedAt: '2026-06-13',
  },
];
