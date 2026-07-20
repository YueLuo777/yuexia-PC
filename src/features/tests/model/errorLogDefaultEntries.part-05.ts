import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart5: ErrorLogEntry[] = [
  {
    id: 'workbench-library-parent-snapshot-sync-001',
    title: '工作台父级资料链路需要实时同步',
    area: '作品编辑器 / 脑洞 / 设定 / 章纲 / 正文 AI 关联资料',
    symptom:
      '在脑洞、设定或章纲页保存内容后，顶部流程统计和正文 AI 关联资料可能仍读取旧快照；旧数据里的“设定/设定库”等 tab 名还可能被父级统计漏掉。',
    cause:
      'WorkbenchPage 直接在渲染时读取本地存储，没有订阅 WORKBENCH_LIBRARY_UPDATED_EVENT 和 storage 事件；父级筛选设定/脑洞时也直接比较中文 tab 字符串，没有先走 normalizeTabName。',
    solution:
      '新增 useWorkbenchLibrarySnapshots，让父级持有响应式 settingsEntries/outlineEntries，并监听作品设定键、章纲键和全局脑洞键；父级统计和上下文构建统一用 normalizeTabName 判断脑洞与设定。',
    prevention:
      '以后新增资料库或修改资料存储键时，父级流程统计、AI 关联资料和资料选择弹窗必须订阅同一更新事件，并复用 tab 归一化逻辑，不要在父级重新硬编码中文 tab 名。',
    keywords: [
      '工作台',
      '脑洞',
      '设定',
      '章纲',
      '正文AI',
      '关联资料',
      'WorkbenchPage',
      'WORKBENCH_LIBRARY_UPDATED_EVENT',
      'normalizeTabName',
    ],
    updatedAt: '2026-07-01',
  },
  {
    id: 'chapter-editor-output-log-last-group-fill-001',
    title: '正文输出日志的资料框应顶到弹窗底部',
    area: '作品编辑器 / 正文 / 输出日志',
    symptom: '正文输出日志里展开“资料”后，资料内容框只显示到中部，弹窗下方留下大块空白，看起来没有顶到底部。',
    cause:
      '正文 AI 日志和审核日志都复用了 AiRequestLogGroups，但真正需要拉满的是“资料/关联内容”组；只按最后一组拉满会在存在“用户要求”等后续组时选错目标，同时外层内容区如果仍允许自身滚动，内部内容框拿不到完整剩余高度。',
    solution:
      'AiRequestLogGroups 支持按 fillGroupId 指定某个日志组拉满；正文 AI 日志和审核日志都把 context 资料组设为拉满目标，并把右侧内容区改成 flex/min-h-0/overflow-hidden，让资料框吃满弹窗剩余高度，滚动只发生在资料框内部。',
    prevention:
      '以后新增长上下文日志时，要按具体日志组 id 指定需要拉满的资料组；不要依赖“最后一组”推断，也不要让父容器和子内容框同时抢滚动高度。',
    keywords: ['正文', '输出日志', '资料', '高度拉满', 'AiRequestLogGroups', 'ChapterEditor'],
    updatedAt: '2026-06-25',
  },
  {
    id: 'setting-import-format-preview-hierarchy-colors-001',
    title: '智能导入格式预览需要区分标签分组和设定名颜色',
    area: '工作台 / 设定 / 输出日志 / 格式 / 可复制格式',
    symptom:
      '格式预览里的标签名、分组名和设定名全都使用同一种深色文本，层级不够明显，用户希望标签名显示为金色，分组名显示为紫色，设定名显示为蓝色。',
    cause: '可复制格式直接把完整格式字符串放进 pre 文本框，没有按行识别 <标签>、<分组> 和 *设定名*：这三类层级。',
    solution:
      '新增格式预览渲染器：显示层按行判断格式，第一行顶层 <标签> 用金色，后续 <分组> 和 </分组> 用紫色，*...*：设定名用蓝色，正文和子设定标题继续保持普通文本色；底层格式字符串不变，不影响复制和智能导入。',
    prevention:
      '以后调整格式预览时，要保持“显示增强”和“可复制格式文本”分离；颜色、字号等只作用于渲染层，不要改动智能导入识别所需的原始文本格式。',
    keywords: ['输出日志', '格式', '智能导入', '标签名', '分组名', '设定名', '颜色', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-25',
  },
  {
    id: 'setting-import-format-should-not-add-group-name-entry-001',
    title: '输出日志格式页不应把分组名补成设定条目',
    area: '工作台 / 设定 / 输出日志 / 格式',
    symptom: '正式设定页“剧情规划”下只有剧情蓝图、爽点设计、分卷剧情，但格式页多出一个同名“剧情规划”条目。',
    cause:
      'getSettingImportFormatEntryTitles 合并当前条目、默认条目、结构化条目后，仍无条件追加分组名作为兜底，导致已有具体条目的分组也出现分组名本身。',
    solution:
      '格式页仅在没有任何可用条目标题时才使用分组名兜底；当默认、结构化或当前条目已经提供具体标题时，过滤掉和分组名相同的重复条目。',
    prevention: '以后格式页目录必须以正式设定页可见条目为口径；兜底标题只能用于空分组，不得和已有默认条目叠加。',
    keywords: ['输出日志', '格式', '剧情规划', '设定条目', '智能导入', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-25',
  },
  {
    id: 'smart-import-structured-fields-should-split-adjacent-headings-001',
    title: '智能导入结构化字段不应要求子设定之间必须空行',
    area: '工作台 / 设定 / 智能导入设定',
    symptom:
      'AI 输出“【时代背景】：正文”后紧接“【世界格局】：正文”时，世界格局和后续子设定没有写入各自的结构化输入框，而是被合并进时代背景框。',
    cause:
      'parseSectionedSettingBody 只把空一行后的下一个【子设定标题】：识别为新字段，AI 常见的紧凑格式没有空行，导致后续标题被当成上一字段正文。',
    solution:
      '结构化字段解析改为按独立行识别【子设定标题】：，只要下一行出现新的标题行就切换字段，不再强制要求两个子设定之间存在空白行。',
    prevention:
      '智能导入和格式预览的回归测试必须覆盖紧凑格式，确保“【字段A】：正文\\n【字段B】：正文”也能正确拆入不同输入框。',
    keywords: ['智能导入', '结构化字段', '世界观', '世界格局', 'parseSectionedSettingBody', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-25',
  },
  {
    id: 'setting-import-format-tree-uses-visible-setting-types-001',
    title: '输出日志格式目录应和设定页左侧目录一致',
    area: '工作台 / 设定 / 输出日志 / 格式',
    symptom:
      '格式页左侧目录出现正式设定页里没有的“资源体系”“书写规则”等分组，以及“资源货币”“写作规范”“写作禁忌”等条目。',
    cause:
      '格式页目录使用模块级静态默认结构 DEFAULT_WORK_SETTING_TYPES 和 DEFAULT_WORK_SETTING_STARTER_ENTRIES 生成，没有经过正式设定页的可见分组、隐藏分组和当前条目筛选。',
    solution:
      '将格式页目录改为运行时根据 settingTypeOptions、当前 settingEntries 和 getSettingTypeWorkspaceDomain 生成；作品设定、势力设定、道具资源、怪物图鉴、伏笔线索都复用当前可见分组，条目标题优先读取当前已有设定条目。',
    prevention:
      '以后智能导入格式预览不能单独维护一套静态目录；凡是展示设定分组和条目的地方，都应复用正式设定页的可见分组来源，避免旧默认结构残留。',
    keywords: ['输出日志', '格式', '智能导入', '设定目录', '资源体系', '书写规则', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'work-setting-default-skeleton-removes-old-resource-rule-groups-001',
    title: '新作品默认设定骨架不应继续创建旧分组',
    area: '工作台 / 设定 / 作品设定默认条目',
    symptom:
      '即使格式页已经按可见设定目录展示，新建作品时仍会默认生成“资源体系”“书写规则”以及“写作规范”“写作禁忌”等旧条目；后来一度把资源货币也移出默认项，导致清空设定时资源货币被当成自建项删除。',
    cause:
      'DEFAULT_WORK_SETTING_TYPES 和 DEFAULT_WORK_SETTING_STARTER_ENTRIES 仍保留旧默认骨架；修正时把“资源体系”旧分组和“资源货币”必要默认项混在一起处理，导致资源货币没有 lockedDefaultEntryId 保护。',
    solution:
      '默认作品设定骨架收敛为核心设定、剧情规划、世界地图、资源货币；默认条目创建基础设定、世界观、主角金手指/优势、剧情蓝图、爽点设计、分卷剧情、世界架构、危险区域和资源货币；书写规则旧条目不再默认创建，资源货币保留固定字段且不显示状态设定/确认。',
    prevention:
      '以后移动或删除设定分组时，要区分“旧分组残留”和“仍需保留的默认设定项”；同步检查 DEFAULT_WORK_SETTING_TYPES、DEFAULT_WORK_SETTING_STARTER_ENTRIES、lockedDefaultEntryId、无标签智能导入分类和结构化字段挂载类型，避免默认项被清空。',
    keywords: ['作品设定', '默认骨架', '资源体系', '书写规则', '资源货币', '智能导入', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'workbench-library-context-menu-viewport-clamp-001',
    title: '设定左侧右键菜单不应跑出屏幕',
    area: '工作台 / 设定 / 左侧分组与条目右键菜单',
    symptom: '在左侧设定目录靠近底部的条目上点击右键时，菜单仍从鼠标位置向下展开，底部操作会被屏幕边缘截掉。',
    cause:
      '分组、条目和提示词右键菜单直接使用 event.clientX / event.clientY 作为 fixed 浮层位置，没有根据菜单预估尺寸和窗口可视区域做边界限制。',
    solution:
      '复用 clampFixedMenuPosition，并给分组菜单、条目菜单、提示词菜单和章纲章节小菜单配置预估宽高；打开前先把 left/top 限制在视口内，靠底部或右侧时自动向内收。',
    prevention:
      '新增 fixed 右键菜单时不能直接保存鼠标坐标，应先按菜单尺寸和 8px 安全边距进行视口夹取，并用 WorkbenchLibraryPanel 源码测试锁住关键入口。',
    keywords: ['右键菜单', '设定目录', '菜单越界', '屏幕外', 'clampFixedMenuPosition', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'prompt-editor-modal-should-not-dim-manager-001',
    title: '编辑提示词不应让后方提示词管理变灰',
    area: '提示词管理 / 编辑提示词弹窗',
    symptom:
      '从提示词齿轮进入提示词管理，再点击编辑提示词时，后面的“设定提示词管理”被二级弹窗遮罩压成灰色，看起来像虚化或禁用。',
    cause: '编辑提示词弹窗自身使用了 bg-black/40 的全屏遮罩；它叠在提示词管理弹窗上方时，会把管理窗口再次压暗。',
    solution: '编辑提示词弹窗改为透明遮罩并提高到管理窗口上方层级，只突出编辑弹窗本身，不再让后方提示词管理变灰。',
    prevention:
      '以后嵌套在管理窗口里的二级编辑弹窗不要再使用半透明黑色遮罩；只有独立打开的管理窗口、回收站或确认类弹窗才使用背景遮罩。',
    keywords: ['提示词管理', '编辑提示词', '二级弹窗', '遮罩', '灰色', 'PromptsPage'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'library-ai-log-format-toolbar-and-fill-height-001',
    title: '输出日志切换按钮不应被格式标签挤到左侧',
    area: '工作台 / 输出日志 / 格式预览',
    symptom:
      '输出日志弹窗里，“输出日志 / 格式”组合按钮从右上角跑到左侧；同时章纲和设定的单个日志内容框、格式预览框没有向下拉满，格式文本还保留了较多无效空行。',
    cause:
      '格式页顶部分区把一级标签和视图切换放进同一个可伸缩区域，导致切换按钮位置随左侧内容变化；日志内容和格式预览仍使用固定最大高度，格式生成函数也在子设定之间额外插入空行。',
    solution:
      '顶部工具栏拆成左侧格式标签区和右侧固定视图切换区；单个日志组支持 fillSingleGroup 拉满剩余高度，格式预览卡片改为 flex-1；智能导入格式生成去掉子设定之间的空行。',
    prevention:
      '以后调整输出日志弹窗时，要同时检查“输出日志 / 格式”切换是否保持右上角、单个内容块是否拉满、多内容块是否自然收缩，并用 WorkbenchLibraryPanel 与 AiRequestLogGroups 的源码测试锁住关键布局类名。',
    keywords: ['输出日志', '格式', '智能导入', '日志弹窗', '高度拉满', 'WorkbenchLibraryPanel', 'AiRequestLogGroups'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-import-format-preview-scope-switch-001',
    title: '智能导入格式预览需要支持条目分组标签三种范围',
    area: '工作台 / 设定 / 输出日志 / 格式 / 可复制格式',
    symptom: '格式页只能显示当前设定条目的智能导入格式，无法一次复制整个分组或整个标签下的完整格式。',
    cause: '格式预览最初只围绕单个设定条目生成，没有把同一分组下的多个条目和同一标签下的多个分组组合成完整可导入文本。',
    solution:
      '新增“设定条目 / 分组 / 标签”范围切换；设定条目输出当前条目，分组输出当前分组下所有设定条目，标签输出当前顶部标签下所有分组和条目。',
    prevention:
      '以后智能导入格式类工具要同时考虑单项复制和批量生成两种使用方式，预览范围应明确显示并由同一套格式生成函数复用。',
    keywords: ['智能导入', '格式预览', '设定条目', '分组', '标签', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-import-format-remove-detail-preview-001',
    title: '智能导入格式页不需要重复展示子设定预览',
    area: '工作台 / 设定 / 输出日志 / 格式',
    symptom:
      '格式页在标题和可复制格式之间展示“智能导入会写入到”和“条目下的子设定”预览卡片，占用大量空间，用户只需要下方可复制格式。',
    cause:
      '格式页最初为了说明导入结构，把写入路径和字段卡片都展示出来；后续顶部标签和左侧目录已经足够表达位置关系，这块说明变成重复信息。',
    solution: '删除写入路径说明、可选提示说明和子设定预览卡片，只保留当前条目标题与“可复制格式”文本区。',
    prevention: '格式页优先服务复制和查看完整导入文本，路径层级交给顶部标签与左侧目录表达，避免中间再堆说明卡片。',
    keywords: ['格式页', '智能导入', '子设定预览', '可复制格式', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-import-format-tabs-move-to-log-toolbar-001',
    title: '智能导入格式页标签应放到日志顶部工具栏',
    area: '工作台 / 设定 / 输出日志 / 格式',
    symptom: '格式页左侧目录上方显示作品设定、人物设定等标签，占用左侧目录空间；顶部工具栏左侧却留有大块空白。',
    cause: '格式页最初复用了左侧目录树结构，把一级标签放进目录上方的网格区，没有利用日志顶部工具栏的横向空间。',
    solution:
      '只在切到“格式”页时，将作品设定、人物设定、势力设定、道具资源、怪物图鉴、伏笔线索标签移动到顶部工具栏左侧横向排列；输出日志页不显示这组标签，左侧目录只保留分组和条目。',
    prevention: '以后日志弹窗中的页面级标签优先放在顶部工具栏，左侧栏只放当前页的目录树，避免导航层级堆叠。',
    keywords: ['格式页', '智能导入', '输出日志', '顶部标签', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-import-format-preview-light-surface-001',
    title: '智能导入格式预览不应使用黑色代码块背景',
    area: '工作台 / 设定 / 输出日志 / 格式',
    symptom: '打开“格式”标签查看可复制格式时，预览区显示为黑色背景白色文字，和软件当前浅色设定框风格不一致。',
    cause:
      '格式预览使用了 bg-slate-950 text-slate-100 的深色代码块样式，虽然方便表达“可复制文本”，但在当前 UI 里显得像旧样式残留。',
    solution: '将格式预览改为浅色文本框：白色偏浅背景、浅灰边框、深色文字，同时保留预格式换行和滚动复制能力。',
    prevention:
      '以后日志或格式预览如果只是给用户复制文本，应优先使用软件统一的浅色预览框；深色代码块只用于真正的开发调试内容。',
    keywords: ['格式', '智能导入', '可复制格式', '黑色背景', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-entry-context-menu-create-entry-001',
    title: '设定条目右键菜单也需要新建入口',
    area: '工作台 / 设定 / 左侧设定条目右键菜单',
    symptom:
      '分组右键菜单里可以新建设定，但右键某个设定条目时只能复制、重命名、移动或删除，无法直接在当前条目所在分组中新建同类设定。',
    cause: '条目右键菜单和分组右键菜单维护了两套动作列表，新增分组级快捷操作后没有同步补到条目级菜单，导致入口不一致。',
    solution:
      '新增 createEntryFromEntryMenu：右键设定条目时按当前条目的设定分组新建设定；右键角色条目时按当前角色分组新建角色；菜单中新增“新建设定/新建角色”入口。',
    prevention:
      '以后新增左侧目录右键操作时，同步检查分组菜单和条目菜单是否都需要相同入口，并用 WorkbenchLibraryPanel 源码测试锁住关键文案和处理函数。',
    keywords: ['设定条目', '右键菜单', '新建设定', '新建角色', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'chapter-auto-replace-wording-001',
    title: '正文高频词入口应改为自动替换语义',
    area: '作品编辑器 / 正文 / 工具栏与词语替换设置',
    symptom: '正文工具栏仍显示“高频词”，设置弹窗仍显示“高频词设置”，但用户后续要用它管理特定词到其他词的替换规则。',
    cause: '早期该入口用于高频词高亮，后续正文工具已经扩展到自动替换场景，旧名称会让用户误以为这里只是统计或高亮词语。',
    solution: '正文工具栏入口改为“自动替换”；对应弹窗标题改为“词语替换设置”，输入提示和空状态改成替换词语语义。',
    prevention: '以后正文工具如果承担替换能力，可见文案统一使用“自动替换/词语替换”，不要再恢复“高频词”作为入口名称。',
    keywords: ['正文', '高频词', '自动替换', '词语替换设置', 'ChapterEditor', 'EditorToolModals'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'setting-clear-context-menu-generic-labels-001',
    title: '设定类右键清空菜单不应使用道具资源等域名',
    area: '工作台 / 设定 / 左侧分组右键菜单',
    symptom:
      '在道具资源分组上右键时，清空菜单显示为“清空道具资源”“清空道具资源分组”，用户希望这里直接显示通用的“清空设定”“清空设定分组”。',
    cause:
      '清空菜单标签会根据当前设定域动态拼接，例如道具资源、怪物、伏笔等域名会被写进危险操作文案，导致菜单变长且语义不够统一。',
    solution:
      '设定类清空目标统一改为“设定”和“设定分组”；角色类仍保留“角色”和“角色分组”；二次确认文案也同步使用通用设定表述。',
    prevention:
      '以后新增设定域时，不要让域名直接参与清空菜单标题；需要区分范围时用列表所在位置表达，菜单动作保持统一短文案。',
    keywords: ['右键菜单', '清空设定', '清空设定分组', '道具资源', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'world-map-resource-system-moved-to-work-settings-001',
    title: '世界地图和资源体系应归入作品设定',
    area: '工作台 / 设定 / 作品设定与势力设定',
    symptom:
      '世界地图、危险区域和资源货币仍混在势力地图或道具资源域里，容易让用户误以为它们需要像势力、道具一样做状态更新和确认。',
    cause:
      '早期为了补全设定分类，把地理结构和资源货币临时放在势力地图、道具资源下；后续流程明确后，它们更接近作品世界规则，不属于某个会随章节变化的对象状态。',
    solution:
      '作品设定新增世界地图和资源体系分组；世界地图保留世界架构、危险区域两个默认条目并删除状态/确认切换；资源货币迁入资源体系；势力地图改名为势力设定且只保留四类势力。',
    prevention:
      '以后判断设定归属时，先区分“世界规则型档案”和“剧情对象状态”：世界结构、危险区规则、货币体系进入作品设定；势力、道具、角色这类会变化的对象才保留状态更新。',
    keywords: ['作品设定', '世界地图', '危险区域', '资源体系', '资源货币', '势力设定', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'character-default-role-groups-undeletable-001',
    title: '人物设定默认分组不应被删除或清空隐藏',
    area: '工作台 / 设定 / 人物设定 / 角色分组',
    symptom:
      '人物设定需要固定保留女主角、重要正派角色、正派配角、重要反派角色、反派配角和龙套角色等默认分组，避免清空分组后只剩男主角。',
    cause:
      '人物分组模型已经有这些默认分组，但清空人物分组逻辑仍会把除男主角外的默认分组写入隐藏列表，并删除非男主角角色。',
    solution:
      '新增 isDefaultWorkbenchRoleType 统一判断默认人物分组；删除分组和右键菜单都禁止默认分组删除；清空人物分组只清理自建分组并保留全部默认分组，同时升级默认分组版本以恢复旧隐藏状态。',
    prevention:
      '以后涉及人物分组的删除、清空、隐藏和迁移逻辑时，统一使用 isDefaultWorkbenchRoleType，不要只用男主角做特例判断。',
    keywords: [
      '人物设定',
      '默认分组',
      '女主角',
      '正派角色',
      '反派角色',
      '龙套角色',
      '清空分组',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-24',
  },
  {
    id: 'novel-library-overview-average-label-fit-001',
    title: '作品概览平均字数标签不能被省略',
    area: '首页 / 作品概览 / 平均字数统计卡',
    symptom: '作品概览里的“平均字数”只显示成“平均...”，用户无法同时看到完整标签和 11,777 字这类数字。',
    cause:
      '作品概览卡片在宽屏下只占四分之一行宽，内部再分成两列两行后，小统计卡横向空间不足；标签列使用 truncate，优先把“平均字数”省略掉。',
    solution:
      '让作品概览卡片在宽屏下占两列，并把统计小卡改为标签 max-content、数值最小 86px 的两列布局；标签使用 whitespace-nowrap，不再省略“平均字数”。',
    prevention: '以后首页统计卡同时包含中文标签和长数字时，优先扩大父卡片或固定数值列宽，不要靠截断标签解决拥挤问题。',
    keywords: ['首页', '作品概览', '平均字数', '标签省略', 'NovelLibraryPage'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'global-brainstorm-library-cross-work-001',
    title: '脑洞库应为所有作品通用',
    area: '脑洞库 / 工作台脑洞 / 设定库面板',
    symptom: '切换不同小说作品后，脑洞内容会跟着作品变化，独立脑洞库也要求先选择作品，导致脑洞像设定一样被作品隔离。',
    cause:
      '脑洞和作品设定、人物设定共用了 xinyuexia_workbench_settings_${novelId} 这类作品级存储键；独立脑洞库页面也读取当前作品后再拼接作品级 storageKey。',
    solution:
      '新增全局脑洞存储键 xinyuexia_global_brainstorm_library_v1；WorkbenchLibraryPanel 读取时合并当前作品非脑洞条目和全局脑洞条目，保存时只把脑洞写入全局键，其他设定继续写入当前作品键；独立脑洞库直接打开全局脑洞。',
    prevention:
      '以后新增资料类型时先确认作用域：只有脑洞是全作品通用；作品设定、人物设定、势力地图、道具资源、怪物图鉴、伏笔线索、章纲和正文都应继续按作品隔离。',
    keywords: [
      '脑洞库',
      '全局脑洞',
      '作品隔离',
      '设定库',
      'WorkbenchLibraryPanel',
      'BrainstormLibraryPage',
      'GLOBAL_BRAINSTORM_LIBRARY_STORAGE_KEY',
    ],
    updatedAt: '2026-06-24',
  },
  {
    id: 'workspace-home-tab-always-novel-library-001',
    title: '顶部首页标签应固定返回小说首页',
    area: '顶部标题栏 / 首页标签 / 测试集合',
    symptom: '从测试页面点击左上角“首页”标签时，页面仍回到测试页面，而不是进入小说首页。',
    cause:
      'AppFrame 的 activateHomeTab 会读取 sessionStorage 中的上次首页路由；测试集合等非编辑器页面也会被 rememberHomeRoute 记录进去，导致首页标签拿到的是 /test-collection。',
    solution: '首页标签点击时固定 navigate(HOME_TAB.path)，并移除上次首页路由记忆逻辑，确保“首页”只回到 /novels。',
    prevention:
      '顶部固定首页入口不要复用最近页面或上次路由逻辑；测试集合、UI库、设置类页面都不能被记录成首页回退地址。',
    keywords: ['首页标签', '测试集合', '返回首页', '/novels', 'AppFrame', 'HOME_TAB'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'workspace-tabs-home-title-and-work-title-size-001',
    title: '顶部首页标签和作品标签字号需要统一',
    area: '顶部标题栏 / 工作区标签',
    symptom:
      '打开小说后，顶部“默认小说1”“大主宰”等作品标签字号和左侧“我的小说”入口不一致；同时用户希望该入口显示为“首页”。',
    cause:
      'AppFrame 的普通工作区标签基础样式仍是 13px/medium，只有首页标签通过 workspace-tab-home 额外提升到 15px/700；HOME_TAB 标题也仍写为“我的小说”。',
    solution:
      '将 HOME_TAB 标题改为“首页”；把 AppFrame 工作区标签基础字号统一为 15px 且 700 字重，active 状态也保持 font-bold，让首页标签和作品标签视觉一致。',
    prevention:
      '以后调整顶部标签栏时，首页标签和作品标签应共用同一字号/字重基线；如果只想区分首页，应通过宽度或固定位置区分，不要再单独降低作品标签字号。',
    keywords: ['顶部标签', '首页', '我的小说', '作品标签', '字号', 'AppFrame', 'WorkspaceTabsContext'],
    updatedAt: '2026-06-24',
  },
  {
    id: 'novel-library-average-word-count-fit-001',
    title: '作品概览平均字数需要完整显示',
    area: '我的小说 / 作品概览 / 平均字数统计卡',
    symptom: '平均字数为 11,777 字这类较长数值时，右侧数字显示不完整，看起来被小卡片裁掉。',
    cause: '作品概览统计小卡片使用 auto 右列和固定 18px 数值字号，卡片宽度较窄时左侧标题与右侧数值抢空间。',
    solution:
      '将统计小卡片改为左侧最小 42px、右侧最小 72px 的两列布局，并把数值字号改为 15px 到 18px 的自适应字号，确保长数字优先完整显示。',
    prevention:
      '以后首页统计卡新增或改名时，要同时检查四位以上带逗号数字和“字/本”等单位是否完整显示，不要只用短数字验证。',
    keywords: ['我的小说', '作品概览', '平均字数', '统计卡', '数字显示不全', 'NovelLibraryPage'],
    updatedAt: '2026-06-24',
  },
];
