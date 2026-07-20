import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart15: ErrorLogEntry[] = [
  {
    id: 'workbench-ai-input-neutral-style-migration-001',
    title: '21号测试的 AI 输入框中性灰线方案需要迁入正式页',
    area: '作品编辑器 / 右侧 AI 输入区 / AiInlineInput',
    symptom:
      '21号测试已经验证 AI 输入框边框和发送区颜色方案，需要迁入正式编辑器；同时用户要求不要改变现有 UI 样式，不能重做布局、尺寸或按钮结构。',
    cause:
      '测试页的默认中性灰线方案只涉及颜色语义，但正式共享输入控件此前仍由主题蓝色覆盖边框、发送按钮和停止按钮分割线。',
    solution:
      '给 AiInlineInput 增加默认 neutral 变体，保留原 xy-floating-field、xy-floating-ai、xy-floating-with-inline-actions 结构，只在 writer-assistant-theme 下覆盖输入框边框、发送按钮 hover/active 和停止按钮分割线为中性色；迁入后删除 21 号临时测试页入口和文件。',
    prevention:
      '以后把视觉测试迁入正式页时，先判断是否需要改结构；若用户要求不改 UI 样式，只做可控变体或颜色 token 覆盖，并用测试锁住原控件结构。',
    keywords: ['21号测试', 'AI输入框', '中性灰线', 'AiInlineInput', 'xy-ai-inline-neutral', '不改UI样式'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'test-collection-delete-marked-pages-001',
    title: '测试集合里勾选完成的临时测试需要彻底退场',
    area: '测试集合 / 临时测试页 / 路由清理',
    symptom:
      '用户在测试集合里勾选了一批已经测试完成的页面，要求从测试里删除；如果只删除列表入口，仍可能留下独立路由、懒加载引用或孤立测试文件。',
    cause:
      '临时测试页通常同时存在于 TestCollectionPage 懒加载入口、测试列表、活动页渲染分支、部分独立路由和对应源码文件中，退场时需要按同一份勾选记录逐项清理。',
    solution:
      '按本机 xinyuexia_test_collection_delete_marks_v1 记录移除 12 个勾选测试页；同步删除 TestCollectionPage 的 import、列表项和 render switch，删除 /prompt-taxonomy-test 独立路由，并移除对应临时页文件及只服务这些页面的断言测试。',
    prevention:
      '以后处理“勾选测试已完成，请删除”时，先读取勾选路径，再逐项核对 collection 入口、App 独立路由、页面文件、相关测试断言和残留 rg 结果，避免留下不可达代码或失效引用。',
    keywords: [
      '测试集合',
      '勾选删除',
      '临时测试页',
      'TestCollectionPage',
      'PromptTaxonomyTestPage',
      'EditorGridLineTestPage',
      'SoftwareModalStyleTestPage',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-grid-line-font-setting-001',
    title: '正文编辑器需要接入稿纸虚线设置',
    area: '作品编辑器 / 正文 / 字体设置',
    symptom: '稿纸虚线只存在于测试集合，正式正文编辑器无法使用，用户要求迁入正文并加到字号设置里。',
    cause:
      '前几版先在 EditorGridLineTestPage 验证了字号联动、文字下方线位和字底间隔，但 ChapterEditor 的 FontSettings 仍只保存字体、颜色、字号和行高。',
    solution:
      '为 FontSettings 增加 gridLineEnabled，并在字体设置弹窗增加“稿纸虚线”开关；正文 textarea 和高频词覆盖层复用 getEditorGridLineStyle，根据字号、行高和滚动位置绘制虚线。',
    prevention:
      '以后测试页视觉确认后迁入正式编辑器时，要同步接入持久化设置、正式输入层、覆盖层和源码回归测试，避免测试页可用但正式页面不可用。',
    keywords: ['正文编辑器', '稿纸虚线', '字号设置', 'ChapterEditor', 'FontSettingsModal', 'gridLineEnabled'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'editor-grid-line-underline-gap-increase-001',
    title: '编辑器网格虚线与文字间隔需要加大',
    area: '测试集合 / 编辑器网格虚线测试 / 正文背景',
    symptom: '虚线已经落在文字下方，但参考图中字体底部到虚线之间的空隙更明显，当前测试页间隔仍偏小。',
    cause: '上一版 lineOffsetPx 使用固定 +3px 作为字底下方间隔，在 28px 以上字号下视觉距离不够，虚线仍显得贴近文字。',
    solution:
      '新增 underlineGapPx，按 Math.max(8, fontSize * 0.22) 计算下方间隔，再参与 lineOffsetPx 计算；默认字号下虚线进一步下移，字号变大时间隔同步放大。',
    prevention:
      '以后调整稿纸虚线时同时检查线位和字底空隙，不只判断虚线是否在文字下方；字号联动值应单独命名，避免隐藏在 lineOffsetPx 魔法数里。',
    keywords: ['编辑器', '网格虚线', '文字间隔', 'underlineGapPx', 'EditorGridLineTestPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'editor-grid-line-baseline-offset-001',
    title: '编辑器网格虚线需要落在文字下方',
    area: '测试集合 / 编辑器网格虚线测试 / 正文背景',
    symptom: '测试页里的虚线看起来穿过文字中部，和参考图中虚线贴在每行文字下方的效果不一致。',
    cause:
      '原实现使用 1px 高的 SVG 横线，再通过 background-size 拉伸到整行高度；SVG 内部的 0.5px 横线被等比例缩放后落到行盒中间。',
    solution:
      '将背景 SVG 改为与 lineHeightPx 同高，并新增 lineOffsetPx，把横线绘制在每个行盒内的文字下沿位置；字号变化时行高和线位同步更新。',
    prevention:
      '以后做编辑器稿纸线时不要拉伸 1px 图片充当整行背景；应在完整行高画布里按字体尺寸计算线位，避免线条穿过文字。',
    keywords: ['编辑器', '网格虚线', '文字下方', 'EditorGridLineTestPage', 'lineOffsetPx'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-left-gutter-increase-001',
    title: '作品库左侧留白需要增加 30%',
    area: '我的小说 / 作品库主内容区 / 左侧留白',
    symptom: '作品库内容紧贴左侧，截图标注的左侧留白宽度偏窄，用户要求将该区域宽度提高 30%。',
    cause:
      '上一版为了压缩页面缝隙，把 NovelLibraryPage 主内容容器左右 padding 收到 px-4，也就是 16px；在当前视觉稿里左侧留白需要略宽一些。',
    solution:
      '将主内容容器从 px-4 调整为 px-[21px]，按 16px * 1.3 约等于 20.8px 取整为 21px；只调整外侧留白，不改卡片、搜索和作品列表逻辑。',
    prevention: '以后微调作品库外侧留白时保留源码测试断言，避免重新回到 px-4 或 px-8 这类过窄/过宽的旧值。',
    keywords: ['我的小说', '左侧留白', '作品库', 'NovelLibraryPage', 'px-[21px]'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-overview-subtitle-remove-001',
    title: '作品概览副标题需要删除',
    area: '我的小说 / 顶部四卡片 / 作品概览卡',
    symptom: '作品概览标题下方的“当前小说库统计/当前剧本库统计”占用纵向空间，用户明确要求删除。',
    cause: '上一版为了说明数据来源给作品概览卡增加了副标题，但在紧凑四卡片布局中这个说明不是必要信息。',
    solution: '删除作品概览标题下方的当前库统计说明，只保留标题、预留标签和 2x2 统计数据；测试同步断言不再包含该文案。',
    prevention: '以后顶部数据卡优先保留直接统计项，避免添加解释性副标题占用紧凑卡片高度，除非用户明确要求说明来源。',
    keywords: ['我的小说', '作品概览', '当前小说库统计', '当前剧本库统计', 'NovelLibraryPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'editor-grid-line-test-font-size-sync-001',
    title: '正文编辑器需要测试随字号变化的网格虚线',
    area: '测试集合 / 编辑器网格虚线测试 / 正文背景',
    symptom:
      '用户希望正文区域出现类似参考截图的稿纸网格虚线，并且网格线间距能随着字号大小变化，但直接放进正式编辑器会影响正文阅读和输入体验。',
    cause:
      '当前正式正文背景已经去掉横线并使用纯色背景；网格线需要先验证线型、行高算法、字号变化联动以及无/实线/虚线切换是否适合现有编辑器。',
    solution:
      '新增 EditorGridLineTestPage 并加入测试集合 UI 分组末尾；页面提供无、实线、虚线三种线型和字号滑块，用 lineHeightPx = Math.round(fontSize * 1.72) 驱动 background-size，让虚线网格随字号变化。',
    prevention:
      '正式迁入前先在测试集合确认字号、行高、虚线颜色和线型；迁入时应复用同一套字号到行高的计算，避免背景线和文本行错位。',
    keywords: ['编辑器', '网格线', '虚线', '字号', '测试集合', 'EditorGridLineTestPage', 'backgroundSize'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-content-padding-too-wide-001',
    title: '作品库内容区顶部和左侧留白过大',
    area: '我的小说 / 内容区 / 顶部四卡片与侧边栏间距',
    symptom: '作品库内容区与顶部标签栏、左侧导航之间的空白过宽，用户截图标注希望这些缝隙缩小一半。',
    cause: 'NovelLibraryPage 主内容容器使用 px-8 py-7，左右 32px、上下 28px 的外侧留白在当前紧凑卡片布局下显得过大。',
    solution:
      '将主内容容器改为 px-4 py-3.5，把左右留白压到 16px、上下留白压到 14px；只调整外侧内容区 padding，不改变卡片和作品列表功能逻辑。',
    prevention:
      '以后压缩作品库卡片高度后，需要同步检查页面外侧 padding；紧凑布局下优先用 16px 左右边距和 14px 顶部边距作为默认。',
    keywords: ['我的小说', '内容区', '左侧缝隙', '顶部缝隙', 'NovelLibraryPage', 'px-4', 'py-3.5'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-top-cards-row-too-tall-001',
    title: '作品库顶部四卡片区域过高',
    area: '我的小说 / 顶部四卡片 / 数据卡与操作卡',
    symptom: '顶部四张卡片高度超过用户红框标注范围，尤其数据卡四行统计和作品整理 2x2 操作按钮把整行撑得过高。',
    cause:
      '上一版为了增加信息密度放大了统计字号，并保留纵向四行统计；作品整理按钮仍使用 min-h-[52px]，导致卡片行高度继续增长。',
    solution:
      '将顶部四卡片统一收紧到 min-h-[126px]；数据卡统计改为 2x2 紧凑排布；作品整理按钮降到 min-h-[40px] 并缩小图标和说明文字；最近编辑和预留卡同步压缩内边距与行高。',
    prevention:
      '以后调整顶部四卡片信息量时，先控制整行高度，再决定展示密度；新增统计项优先用横向或 2x2 网格，不要继续增加纵向高度。',
    keywords: [
      '我的小说',
      '顶部四卡片',
      '高度',
      '作品概览',
      '作品整理',
      '最近编辑',
      'NovelLibraryPage',
      'min-h-[126px]',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-context-menu-width-too-wide-001',
    title: '章节右键菜单主菜单宽度过大',
    area: '作品编辑器 / 章节侧栏 / 已发布侧栏 / 右键菜单',
    symptom: '章节右键弹窗主菜单宽度明显超过菜单文字所需宽度，右侧留白过多，看起来比截图中红框标注的目标宽度更笨重。',
    cause:
      '套用测试页小型弹窗样式时主菜单宽度沿用 206px，测试预览里甚至使用 220px，适合普通设置菜单但不适合只有四五个短中文操作项的章节右键菜单。',
    solution:
      '把正式未发布章节和已发布章节右键菜单主宽度统一收窄为 136px，并同步测试页章节右键菜单预览宽度；右侧“暂留选项”子菜单保持独立宽度，不再由主菜单撑宽。',
    prevention:
      '以后右键菜单宽度应按最长菜单项和是否有箭头决定，短操作菜单不要复用设置弹窗宽度；测试预览转正后也要跟随真实组件尺寸。',
    keywords: ['章节右键菜单', '宽度', 'ChapterSidebar', 'PublishedSidebar', 'SoftwareModalStyleTestPage', 'w-[136px]'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'nav-settings-add-divider-button-footer-001',
    title: '导航设置新增分割线入口占用过大',
    area: '首页 / 左侧导航 / 导航设置 / 分割线',
    symptom:
      '导航设置弹窗顶部出现一整块“导航分割线”说明卡，视觉面积过大；用户只需要一个新增分割线按钮，并希望它靠近底部关闭按钮。',
    cause: '新增多条分割线时把说明文字和按钮做成了内容区提示卡，功能入口被放大成独立区域，和实际使用频率不匹配。',
    solution:
      '删除内容区的“导航分割线”说明卡，只保留一个“新增分割线”按钮；按钮移动到底部操作区，并放在“关闭”按钮左侧，原有 addDivider 逻辑和禁用条件保持不变。',
    prevention:
      '以后低频设置动作优先放在弹窗底部操作区或紧凑工具栏，不要默认占用内容区大块说明位置；除非用户需要说明文案，否则只保留必要按钮。',
    keywords: ['导航设置', '新增分割线', '关闭按钮', 'NavSettingsModal', 'addDivider', '分割线'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-top-cards-density-clickable-recent-001',
    title: '作品库顶部数据卡过空且最近编辑入口不够明确',
    area: '我的小说 / 顶部四卡片 / 数据卡与最近编辑卡',
    symptom:
      '第一张数据卡字号偏小、内容显得空；最近编辑卡顶部还有“快速进入”和右上角图标，占用空间，同时作品名只是普通文本感，用户不容易知道可以点击进入。',
    cause:
      '数据卡仍停留在四行小字号统计，预留项没有提供信息密度；最近编辑卡沿用快捷入口卡的标题结构，没有把作品行做成可点击按钮的视觉。',
    solution:
      '数据卡增加“作品概览”和当前库说明，统计值放大，并把空的预留行改为平均字数；最近编辑卡删除“快速进入”和右上角时钟图标，把每条最近作品改为带边框、浅底、悬停态的可点击行。',
    prevention:
      '以后调整顶部四卡片时，数据卡优先用真实统计填充空位；最近编辑列表需要用按钮边框或明确点击态提示，避免只靠文字暗示可进入。',
    keywords: ['我的小说', '顶部四卡片', '作品概览', '平均字数', '最近编辑', '快速进入', 'Clock3', 'NovelLibraryPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-context-menu-reference-style-apply-001',
    title: '章节右键菜单需要套用测试页小型弹窗样式',
    area: '作品编辑器 / 章节侧栏 / 已发布侧栏 / 右键菜单',
    symptom:
      '测试页里的菜单示例仍是其他软件的“私密作品设置、书封管理”等占位内容，正式章节右键菜单也还保留普通小白框样式，没有同步成截图里的小型菜单和右侧子菜单。',
    cause:
      '之前弹窗样式测试只用于预览，没有绑定到当前软件真实的章节右键菜单内容，也没有处理“移入分组”这种带右侧子菜单但暂时无功能的入口。',
    solution:
      '把测试页“作品菜单”改为章节右键菜单：重命名、修改章节、发布章节、移入分组、删除章节；正式未发布和已发布章节右键菜单统一使用 8px 圆角、#e5e7eb 边框、浅阴影、红色危险操作，并给“移入分组”增加只含“暂留选项”的右侧子菜单。',
    prevention: '以后把测试页样式转正时，先替换为本软件真实菜单文案，再同步正式组件；占位内容不能直接带入正式菜单。',
    keywords: [
      '章节右键菜单',
      '08号测试',
      '移入分组',
      '暂留选项',
      'ChapterSidebar',
      'PublishedSidebar',
      'SoftwareModalStyleTestPage',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-sidebar-nav-divider-drag-multiple-001',
    title: '首页左侧导航分割线需要可拖拽且可新增删除',
    area: '首页 / 左侧导航 / 导航设置 / 分割线',
    symptom: '导航设置里只能通过下拉框选择一条分割线位置，无法像列表项一样直接拖拽，也不能自由新增或删除多条分割线。',
    cause:
      '导航配置只保存单个 dividerAfterItemTo，NavSettingsModal 把分割线当作一个下拉字段，而不是导航列表里的可操作条目。',
    solution:
      '新增 dividerAfterItemTos 数组并兼容旧 dividerAfterItemTo；DashboardLayout 按数组渲染多条分割线；NavSettingsModal 提供“新增分割线”，并把分割线渲染为可拖拽、可删除的列表行。',
    prevention:
      '以后导航视觉层级调整不要再只做单字段下拉；分割线、导航项这类会影响列表结构的对象应尽量在同一个可拖拽列表里管理。',
    keywords: ['首页', '左侧导航', '导航设置', '分割线', '拖拽', '新增分割线', '删除分割线', 'dividerAfterItemTos'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-organize-card-bottom-blank-001',
    title: '作品整理卡片底部出现明显空白',
    area: '我的小说 / 顶部四卡片 / 作品整理卡',
    symptom: '作品整理卡片里“卡片设置”和“回收站”下方留出一大块空白，四个操作按钮集中在上半部分，视觉重心不稳。',
    cause: '卡片本身有固定最小高度，但内部操作按钮使用固定 48px 高度，按钮网格没有占满卡片剩余高度。',
    solution:
      '将作品整理卡片改为 flex 纵向布局，按钮网格使用 flex-1 和两行等高 grid，按钮改为 h-full + min-h-[52px]，让四个操作入口自然填满卡片内容区。',
    prevention:
      '以后调整顶部操作卡时，避免在固定高度卡片内只使用固定高度按钮；操作网格应跟随卡片高度伸展，减少底部无效空白。',
    keywords: ['作品整理', '卡片设置', '回收站', '底部空白', 'NovelLibraryPage', 'grid-rows-2', 'flex-1'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-data-card-title-remove-recent-list-001',
    title: '我的小说数据卡标题区需要删除且最近编辑显示多条作品',
    area: '我的小说 / 顶部四卡片 / 数据卡与最近编辑卡',
    symptom:
      '数据卡顶部仍显示“小说数据 / 我的小说”和书本图标，占用空间；最近编辑卡只显示一个作品和“继续编辑”，不能像列表一样快速看到最近几个作品及日期。',
    cause: '之前按概览卡设计保留了标题区，并把最近编辑实现成单个最近作品的大按钮，不符合用户希望的紧凑列表格式。',
    solution:
      '删除数据卡标题区和 BookOpen 图标，只保留作品、昨日更新、字数、预留统计；最近编辑改为最多 3 条作品列表，每行左侧标题、右侧日期，日期统一显示为年/月/日，点击单行进入对应作品。',
    prevention:
      '以后调整作品库顶部卡片时，数据卡优先保留统计密度；最近编辑卡应优先展示多条最近作品，除非用户明确要求单个大入口。',
    keywords: ['我的小说', '数据卡', '最近编辑', '多条作品', 'NovelLibraryPage', 'BookOpen', 'recentWorks'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'software-modal-reference-style-test-001',
    title: '弹窗样式先用测试页承接截图参考',
    area: '测试集合 / 弹窗样式测试 / 现有弹窗内容预览',
    symptom:
      '用户希望把项目弹窗改成参考软件的小型白底菜单样式，但直接改正式弹窗会影响导航设置、系统设置、快捷键、作品菜单等多个入口。',
    cause:
      '正式弹窗分散在共享设置、导航、快捷键、作品和工作台组件中，样式和尺寸差异较大，需要先确认目标样式是否适合当前内容密度。',
    solution:
      '新增 SoftwareModalStyleTestPage，只挂在测试集合；用 8px 圆角、#e5e7eb 边框、细分割线、浅阴影、灰色更新时间、右侧箭头和 #ff3b30 危险操作色，套入作品菜单、导航设置、系统设置和快捷键内容预览。',
    prevention: '正式迁移前先让用户确认测试页样式；确认后再抽共享弹窗/菜单样式，不要一次性改所有正式弹窗造成回归风险。',
    keywords: [
      '弹窗样式',
      '测试集合',
      'SoftwareModalStyleTestPage',
      '作品菜单',
      '导航设置',
      '系统设置',
      '快捷键',
      '菜单弹窗',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'dashboard-sidebar-configurable-nav-divider-001',
    title: '首页左侧导航删除专区后仍需要可配置分割线',
    area: '首页 / 左侧导航 / 导航设置 / 分割线',
    symptom:
      '专区删除后，导航项变成一整列平铺列表，用户无法用横线把常用入口和其他入口区分开，也不能在导航设置里指定横线位置。',
    cause:
      '之前去掉专区时只保留扁平 NavItem 列表，NavGroupConfig 没有保存分割线位置，DashboardLayout 也没有按导航配置渲染列表内分割线。',
    solution:
      '在 NavGroupConfig 增加 dividerAfterItemTo，默认放在 /novels 后；DashboardLayout 在对应导航项后渲染与头像区一致的 #e1e5eb 横线；NavSettingsModal 增加“导航分割线位置”下拉框，可选择任意可见导航项后或不显示。',
    prevention:
      '以后删除分组/专区时，如果用户仍需要视觉层级，应保留轻量分割线这种配置项，不要把它和专区管理绑定在一起。',
    keywords: [
      '首页',
      '左侧导航',
      '导航设置',
      '分割线',
      'dividerAfterItemTo',
      'DashboardLayout',
      'NavSettingsModal',
      'navConfig',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-top-gap-indent-selection-001',
    title: '正文编辑区顶部不能出现假空行且缩进空格不能被拖选',
    area: '作品编辑器 / 正文页面 / 输入区顶部间距与段落缩进',
    symptom: '正文工具栏下方出现一整条像空行一样的空白；开启段落缩进后，鼠标从行首拖选会把缩进前的空格一起选中。',
    cause:
      '正文 textarea 使用 pt-10 作为顶部内边距，视觉上像多了一行空白；段落缩进使用真实全角空格写入内容，原先只在单点光标时夹到缩进后，没有处理拖选范围的起止边界。',
    solution:
      '将正文 textarea 和高频词覆盖层顶部内边距统一收紧为 pt-3；把光标保护升级为选择范围保护，onSelect/onMouseUp/onKeyUp 都把 selectionStart 和 selectionEnd 夹到缩进空格之后。',
    prevention:
      '以后调整正文页顶部空白时优先检查 ChapterEditor 的 textarea padding 和 HighlightOverlay 对齐；段落缩进相关问题要同时覆盖点击、键盘移动和鼠标拖选。',
    keywords: [
      '正文',
      '空行',
      'pt-10',
      'pt-3',
      '段落缩进',
      '拖选',
      'selectionStart',
      'ChapterEditor',
      'HighlightOverlay',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-title-card-data-row-001',
    title: '我的小说顶部卡片需要在小说库页面变成数据卡片',
    area: '我的小说 / 顶部卡片 / 数据卡片与最近编辑',
    symptom:
      '用户截图中的“我的小说”卡片仍显示“共 X 部小说，保持专注写作和资料管理”，没有展示作品、昨日更新、字数和预留数据，也没有在同一行加入最近编辑快捷卡。',
    cause: '之前把需求落在 DashboardPage 首页顶部卡片上，但截图实际指向 NovelLibraryPage 的作品库顶部标题卡片。',
    solution:
      '将 NovelLibraryPage 顶部改为四卡片行：我的小说/我的剧本数据卡、作品整理操作卡、最近编辑快捷卡和预留扩展卡；最近编辑点击复用 handleOpen 进入对应作品。',
    prevention:
      '以后用户用截图指出“这个卡片”时，先用页面文案反查真实组件，不要只按功能名推断到 DashboardPage；涉及作品库标题卡时优先检查 NovelLibraryPage。',
    keywords: ['我的小说', '作品整理', '最近编辑', '数据卡片', 'NovelLibraryPage', 'DashboardPage', '截图定位'],
    updatedAt: '2026-06-12',
  },
];
