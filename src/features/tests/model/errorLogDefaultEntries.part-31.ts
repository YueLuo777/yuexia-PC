import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart31: ErrorLogEntry[] = [
  {
    id: 'role-detail-row-misaligned-001',
    title: '角色详情同一行没有水平对齐',
    area: '大纲设定 / 角色详情 / 角色名 / 分类 / 存活死亡',
    symptom: '角色详情同一行里，角色名、分类、存活/死亡没有水平对齐，分类框视觉上比角色名低一截。',
    cause:
      '角色名是 44px 本体高度，但分类框的 CapsuleSelect 额外保留了顶部浮动标签预留，整块在布局里被算成更高的 56px，导致下沉。',
    solution:
      '角色详情分类框取消顶部预留，并以角色名字段尺寸为基准，只保留和角色名相同的高度与字号，让同一行三块基线对齐。',
    prevention:
      '同一行短字段如果都要对齐，先看实际外框高度，不要只看内部按钮高度；带浮动标签的控件要单独检查顶部预留。',
    keywords: ['角色详情', '分类', '角色名', '存活死亡', '对齐', 'CapsuleSelect'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-inline-disable-applied-001',
    title: '模型提示词选择框没有统一套用内嵌禁用图标样式',
    area: '全局模型/提示词选择框 / CapsuleSelect / WorkbenchLibraryPanel',
    symptom:
      '测试页里的提示词选择框已经是边框标签、左侧禁用图标、右侧管理按钮的一体式样式，但正式页面仍有提示词禁用按钮独立占位，模型行还需要额外空列对齐。',
    cause:
      'CapsuleSelect 只支持 floatingLabel 和 actionLabel，不支持内嵌禁用图标；禁用逻辑被 WorkbenchLibraryPanel 单独用 PromptDisableButton 拼在选择框右侧。',
    solution:
      '给 CapsuleSelect 新增可选内嵌禁用开关；有禁用功能的提示词框把禁用图标放进选择框左侧，没有禁用功能的模型/提示词框不显示图标；删除独立禁用按钮和对齐空列。',
    prevention: '模型/提示词选择框的视觉结构应集中在 CapsuleSelect 内，不要在业务页面用额外按钮和空列拼接同一控件。',
    keywords: ['CapsuleSelect', '模型选择框', '提示词选择框', '禁用图标', '管理按钮', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'ai-log-folding-group-test-001',
    title: '输出日志右侧内容缺少分组折叠测试',
    area: '测试集合 / 输出日志 / 折叠分组',
    symptom: '输出日志右侧区域把提示词、关联内容和用户要求连续展示，内容很长时用户不能临时隐藏不想看的部分。',
    cause: '日志展示层没有分组折叠状态，查看体验和实际发送 payload 绑得太紧，容易误以为隐藏内容会影响发送。',
    solution:
      '在测试集合新增“输出日志折叠分组测试”，按“提示词 / 关联内容 / 用户要求”拆分折叠区，并保留“完整发送预览”证明折叠只影响查看、不影响发送给 AI。',
    prevention: '以后设计输出日志时，查看层折叠和实际请求 payload 必须分离，并在界面上明确折叠不改变发送内容。',
    keywords: ['输出日志', '折叠', '提示词', '关联内容', '用户要求', '测试集合'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-log-reader-context-001',
    title: '细纲输出日志看不出读取设定后的内容',
    area: '作品信息 / 细纲 / 输出日志 / 读取设定',
    symptom:
      '细纲输出日志虽然会把读取设定拼进 Context，但和所选章节正文混在一起，用户无法一眼确认读取设定后实际带了哪些内容。',
    cause: 'buildOutlineAiRequestLog 只保存完整 contextText，没有单独记录读取设定/前文细纲的上下文片段和字数。',
    solution:
      '细纲日志新增“读取设定”侧栏卡片，显示已读取项数和字数；正文区新增“读取设定后的内容”，单独展示读取设定和前文细纲拼接后的实际内容。',
    prevention:
      '新增读取/关联上下文后，输出日志不仅要展示完整 Context，还要把新增来源拆成独立可检查区，方便确认是否真的发给 AI。',
    keywords: ['细纲', '输出日志', '读取设定', 'Context', '前文细纲', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-reader-nav-font-size-001',
    title: '读取设定左侧导航树文字偏小',
    area: '作品信息 / 细纲 / 读取设定 / 左侧导航树',
    symptom: '读取设定弹窗左侧“设定导航”的分组名和设定名字号偏小，筛选时不够清楚。',
    cause: '导航标题、分组按钮和条目按钮统一使用 text-xs，实际只有约 12px，和弹窗主体内容层级不匹配。',
    solution: '把读取设定左侧导航标题、分组名、条目名放大到约 15px，计数放大到 13px，行高同步从 32px 提到 40px。',
    prevention: '树状导航如果承担主要筛选入口，字号不能低于主体可读级别；放大文字时要同步增加行高，避免列表显得拥挤。',
    keywords: ['读取设定', '设定导航', '导航树', '字号', '细纲', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-category-dropdown-local-001',
    title: '角色详情分类下拉框弹层偏左',
    area: '大纲设定 / 角色详情 / 分类选择框 / CapsuleSelect',
    symptom: '角色详情顶部“分类”选择框展开后，下拉菜单跑到左侧，没有贴住分类框。',
    cause:
      '分类框没有管理按钮，CapsuleSelect 仍按普通选择框把下拉层 portal 到 body 并使用 fixed 坐标；在缩放或弹窗布局里坐标会被算偏。',
    solution:
      'CapsuleSelect 对所有带 floatingLabel 的选择框都改成本地 absolute 下拉层；普通无浮动标签的选择框继续 portal 到 body。',
    prevention:
      '边框嵌入标签类选择框应和触发控件处在同一定位上下文，不能只让带 actionLabel 的模型/提示词选择框走本地弹层。',
    keywords: ['角色详情', '分类', 'CapsuleSelect', 'floatingLabel', '下拉框偏左', 'portal', 'absolute'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'test-prompt-disable-icon-scale-001',
    title: '测试页提示词禁用图标偏大',
    area: '测试集合 / 方案 G / 提示词选择框',
    symptom: '提示词禁用圆圈图标在选择框左侧占比偏大，压迫选中内容起点。',
    cause: '内嵌禁用图标沿用了 h-7 w-7 和 border-[3px]，相对 48px 选择框显得过重。',
    solution: '把内嵌禁用图标缩小约 20%，从 28px 改为 22px，斜线长度和粗细同步按比例收紧。',
    prevention: '内嵌状态图标需要按所在控件高度单独定比例，不能直接复用外置按钮尺寸。',
    keywords: ['测试页', '提示词', '禁用图标', '方案G', 'FloatingLabelSelectMock', '22px'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'extract-module-compact-field-height-001',
    title: '提炼剧情模块编辑短字段高度过高',
    area: '提炼剧情 / 模块编辑 / 名称输入框',
    symptom: '模块编辑里的名称短字段高度偏高，看起来比页面里 44px 紧凑行臃肿。',
    cause: '名称框复用了全局 xy-floating-compact；这套样式会被其他 AI 输入框和浮动标签控件共享，不能直接全局压低。',
    solution:
      '给提炼剧情模块名称输入框新增 xy-extract-compact-field 专用样式，把 input 高度固定为 44px，并同步收紧圆角、padding 和浮动标签字号。',
    prevention: '以后只调整某个页面的短字段高度时，优先加页面级专用 class，不要直接修改共享的 xy-floating-compact。',
    keywords: ['提炼剧情', '模块编辑', '名称输入框', '44px', 'xy-floating-compact', 'xy-extract-compact-field'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-locator-volume-arrow-divider-002',
    title: '章节定位栏卷名和章节之间仍有箭头和中间线',
    area: '作品编辑器 / 顶部章节定位栏',
    symptom: '卷名“第一卷”和“第1章”之间还有向下箭头和贴合形成的中间分割线，用户只想保留一个空位。',
    cause:
      '上一次为了让两个胶囊衔接，把卷名胶囊去掉右边框并让章节胶囊负 margin 贴上，同时卷名仍保留 ChevronDown 图标。',
    solution:
      '删除卷名里的 ChevronDown 图标；卷名和章节改回两个独立圆角胶囊，去掉负 margin 和去右边框，只依赖父级 gap 留出空位。',
    prevention:
      '顶部定位控件的视觉改动要按最终截图意图判断：如果用户要“空位”，不要再用负 margin 衔接或图标暗示可下拉。',
    keywords: ['章节定位栏', '第一卷', '第1章', 'ChevronDown', '分割线', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'library-config-select-field-size-001',
    title: '模型提示词选择框宽度不能按页面单独调节',
    area: '大纲设定 / 角色 / 脑洞 / 字段尺寸 / 模型提示词选择框',
    symptom: '模型和提示词选择框统一改成 60% 后，部分页面仍会挤压文字；禁用按钮占用列宽也会影响提示词显示。',
    cause:
      '字段尺寸配置只覆盖角色名、分类名、设定名等文本字段，没有覆盖三类生成面板的模型/提示词选择框；禁用按钮宽度固定 52px。',
    solution:
      '字段尺寸新增设定、角色、脑洞三组模型框和提示词框配置；对应页面读取各自配置；禁用按钮列缩小为 44px，降低对提示词文本的挤压。',
    prevention:
      '以后调整模型/提示词选择框宽度时，要把外层灰卡、选择框宽度、管理按钮和禁用按钮拆开看，避免一个按钮改变整行文本起点。',
    keywords: ['字段尺寸', '模型选择框', '提示词选择框', '禁用按钮', '角色生成', '脑洞生成', '大纲设定'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-reader-tree-previous-only-001',
    title: '读取设定弹窗缺少导航树且会读取后文细纲',
    area: '作品信息 / 细纲 / 读取设定',
    symptom: '读取设定弹窗只有平铺列表，设定和细纲多了后不好找；生成第10章细纲时也会列出第10章之后的细纲。',
    cause: '读取弹窗直接渲染全量设定/细纲列表，没有像设定页一样按分组生成左侧导航；细纲来源没有按当前章节序号过滤。',
    solution:
      '弹窗改为左侧分组导航树加右侧列表；设定按类型分组，细纲按分卷分组；读取细纲只保留当前选中章节之前的章节。',
    prevention: '用于生成后文的上下文读取功能必须默认只读前文；列表量变大时要提供分组导航和折叠，而不是继续平铺。',
    keywords: ['读取设定', '细纲', '前文细纲', '导航树', '分组折叠', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-ai-session-limit-confirm-001',
    title: '正文续写会话超过上限只禁用新增按钮',
    area: '正文续写 / AI 会话',
    symptom: '会话按钮最多需要保留8个，但继续点击新增时应该弹窗询问是否清空，而不是无反馈或继续增加。',
    cause: '新增会话逻辑使用固定 10 个上限，并直接禁用 + 按钮；没有确认弹窗来承接“清空后新开会话”的操作。',
    solution: '会话上限改为 8；点击 + 且已达上限时弹出确认框，确认后调用清空逻辑新开空白会话。',
    prevention: '达到上限的新增入口不要只禁用按钮；如果用户仍可能需要继续操作，应给出确认弹窗和明确后果。',
    keywords: ['正文续写', '会话上限', '清空', 'ConfirmDialog', 'WorkbenchAIPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'software-ui-catalog-collapse-persist-performance-001',
    title: 'UI库折叠状态不保存且打开渲染过重',
    area: '测试 / UI库 / 编号导航 / 内容分组',
    symptom: 'UI库打开时一次性渲染大量手动上传预览，体感偏慢；左侧导航或内容分组折叠后下次打开不会记住。',
    cause: '折叠状态只存在组件内存，关闭后丢失；手动上传内容合并到 UI 后仍默认展开，首次进入就要渲染大量复杂预览。',
    solution: '新增导航折叠和内容折叠 localStorage；手动上传区默认折叠，点击编号时会自动展开对应分组再滚动。',
    prevention: 'UI库这种重预览页面要把折叠状态持久化，默认避免渲染低频重内容，导航跳转时再按需展开。',
    keywords: ['UI库', '折叠状态', 'localStorage', '性能', '手动上传', 'SoftwareUiCatalogPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'software-ui-catalog-nav-specific-groups-001',
    title: 'UI库编号导航只显示一个 UI 总分类',
    area: '测试 / UI库 / 编号导航',
    symptom:
      'UI库左侧编号导航把字体、颜色、按钮、输入框等所有条目都折叠到一个“UI”分类里，用户无法按“字体设置、颜色记录、按钮样式”等具体类型查找。',
    cause:
      'catalogNavGroups 按 tab 粗略分组，把 ui tab 全部命名为 UI，collection tab 全部命名为 收藏，丢失了每条记录自身的 group 信息。',
    solution:
      '编号导航改为按条目自身 group 聚合；字体映射为“字体设置”，颜色映射为“颜色记录”，按钮映射为“按钮样式”；搜索和收藏状态也复用同一套具体分类。',
    prevention: 'UI库左侧导航应服务查找编号，优先使用可操作的 UI 类型分类，不能只按页面 Tab 作为导航分组。',
    keywords: ['UI库', '编号导航', '字体设置', '颜色记录', '按钮样式', 'SoftwareUiCatalogPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-read-settings-context-001',
    title: '细纲生成缺少读取设定和前文细纲',
    area: '作品信息 / 细纲 / 读取设定 / AI Context',
    symptom:
      '细纲右下角只能输入要求并读取当前章节正文，无法把大纲设定里的剧情大纲或已有前文细纲一起发给 AI，导致 AI 生成细纲时缺少设定依据。',
    cause:
      '细纲生成分支的 sendOutlineAiMessage 只调用 getSelectedOutlineContext，把所选章节正文作为 chapterContext，没有类似关联脑洞或关联上下文的读取弹窗和持久化选择。',
    solution:
      '在细纲输入框上方新增“读取设定”按钮；弹窗提供“设定/细纲”切换；设定里的“剧情大纲”默认勾选且不能取消；确认后把选中设定和细纲拼入 getOutlineAiContext，再作为 callModelStream 的 chapterContext 发送。',
    prevention:
      '以后新增关联/读取按钮时，要同时检查 UI 选择、默认必选项、输出日志预览和实际 callModelStream/callModel 参数，避免只做选择弹窗而没有进入 AI 请求。',
    keywords: ['细纲', '读取设定', '剧情大纲', '读取细纲', 'chapterContext', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-category-field-size-missing-001',
    title: '角色详情分类下拉框没有纳入字段尺寸',
    area: '作品信息 / 大纲设定 / 角色详情 / 分类',
    symptom:
      '字段尺寸可以调整搜索角色、分类名字、角色名字、设定名，但角色详情顶部的“分类”下拉框仍然保持固定宽高，视觉上像没有修复。',
    cause:
      '字段尺寸只覆盖了输入框类字段，角色详情分类使用 CapsuleSelect floatingLabel=分类，没有独立的 roleDetailCategory 配置，也没有让 CapsuleSelect 接收尺寸样式。',
    solution:
      '新增 roleDetailCategory 字段尺寸配置；CapsuleSelect 支持 style；角色详情分类下拉框套用 xy-capsule-custom-field-size，通过 CSS 变量同步宽度、高度和字号。',
    prevention:
      '以后把字段加入尺寸调节时，要按真实控件类型检查输入框、下拉框、按钮式选择框是否都覆盖到，不能只按字段名称判断。',
    keywords: ['大纲设定', '字段尺寸', '角色详情', '分类', 'CapsuleSelect', 'roleDetailCategory'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-field-size-settings-001',
    title: '大纲设定字段尺寸只能靠代码反复调整',
    area: '作品信息 / 大纲设定 / 字段尺寸',
    symptom:
      '角色名、搜索角色、分类名字、设定名等短字段的高度、宽度和字号每次都需要通过代码修改，用户无法自己试到合适尺寸。',
    cause:
      '真实大纲设定页面没有字段级尺寸配置入口，UI库里的规格配置只用于展示和收藏，没有写回 WorkbenchLibraryPanel 的实际字段。',
    solution:
      '在大纲设定顶部新增“字段尺寸”按钮，打开弹窗后可分别调整搜索角色、分类名字、角色名字、角色名、设定名的宽度、高度和字号；配置写入 localStorage 并实时作用到对应字段。',
    prevention: '用户频繁微调的 UI 尺寸应提供页面内配置入口，并使用本地持久化，避免每次都走代码改动。',
    keywords: [
      '大纲设定',
      '字段尺寸',
      '角色名',
      '搜索角色',
      '分类名字',
      '设定名',
      'localStorage',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-name-field-height-font-001',
    title: '设定名输入框偏高且内容字偏小',
    area: '作品信息 / 大纲设定 / 设定详情',
    symptom: '设定名输入框外框显得臃肿，内部设定名文字不够醒目。',
    cause:
      '设定名复用了 xy-floating-outline-fixed 的默认输入框高度 66px 和 1rem 字号，这套尺寸更适合大输入区，不适合短名称字段。',
    solution:
      '新增 xy-floating-outline-setting-name 专用样式，把设定名输入框高度降到 56px，圆角同步收敛，并把输入文字提升到 1.125rem。',
    prevention: '短标题类边框标签字段应使用独立 compact 尺寸，不要直接复用大文本输入区的默认高度。',
    keywords: ['设定名', '输入框高度', '字体', 'xy-floating-outline-setting-name', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-name-preview-gap-001',
    title: '设定名和设定预览边框标签间距过近',
    area: '作品信息 / 大纲设定 / 设定详情',
    symptom: '设定名输入框底部和设定预览边框标签靠得太近，两块边框标签视觉上挤在一起。',
    cause: '设定名区域和设定预览区域之间只保留 mb-3，边框标签自身会向上浮动，占用这段间距。',
    solution: '把设定名区域底部间距从 mb-3 调整为 mb-6，选中设定和空状态保持一致。',
    prevention: '上下相邻的边框嵌入标签字段需要额外预留标签浮动空间，不要只按普通表单间距设置。',
    keywords: ['设定名', '设定预览', '边框标签', '间距', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'smart-import-auto-lock-after-import-001',
    title: '智能导入设定导入后不会自动锁定',
    area: '作品信息 / 大纲设定 / 智能导入设定',
    symptom: '智能导入设定成功执行后，按钮仍然保持可点击状态，用户容易误以为还需要再点一次，或误触发重复导入。',
    cause:
      'smartImportLocked 只由右侧锁按钮手动切换，smartImportSettings 在成功解析并写入设定后没有主动把锁定状态写回当前 Tab 配置。',
    solution:
      '在智能导入成功 persist 之后调用 updateActiveTabConfig({ smartImportLocked: true })，让导入过一次后默认锁定；需要重新导入时再手动点击锁图标解锁。',
    prevention: '一次性导入、迁移、批处理类操作成功后应自动进入防误触状态，手动解锁作为再次执行的明确确认。',
    keywords: ['智能导入设定', '自动锁定', 'smartImportLocked', '重复导入', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-ai-dialog-real-floating-frame-001',
    title: '大纲设定 AI 对话框没有真正显示边框标签',
    area: '作品信息 / 大纲设定 / AI 输出框',
    symptom: '用户看不到“AI对话框”边框标签效果，清空虽然贴到了右上角，但输出区域本身仍然是普通 rounded border 容器。',
    cause:
      '上一次只在普通相对定位容器上添加 xy-floating-edge-tool，没有把 AI 输出区域外层改为 xy-floating-field / xy-floating-outline-preview 结构，因此左上角标签不会出现。',
    solution:
      '把大纲设定 AI 输出区外层改为 xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview，并把滚动内容放进 xy-floating-rich-preview；左上角补 label=AI对话框，右上角继续保留红色清空边框工具。',
    prevention:
      '需要“设定预览那种边框标签”时，必须同时迁移外层 xy-floating-field、内部 xy-floating-rich-preview 和 label，不能只加右上角工具按钮。',
    keywords: ['大纲设定', 'AI对话框', '边框标签', 'xy-floating-field', 'xy-floating-rich-preview', '清空'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-ai-clear-edge-tool-001',
    title: '大纲设定清空按钮占用下方操作区空间',
    area: '作品信息 / 大纲设定 / AI 输出框',
    symptom:
      '大纲设定 AI 输出框下方的红色“清空”按钮和智能导入、关联脑洞按钮挤在一起，占用操作区宽度，且距离要清空的输出框较远。',
    cause: '清空操作属于 AI 输出框本身，但原先被放在输入框上方的普通按钮行里，没有复用边框嵌入工具的布局方式。',
    solution:
      '把清空入口从下方按钮行移除，放到 AI 输出框右上角边框上，使用 xy-floating-edge-tool 形成边框标签效果，只保留“清空”两个字并使用红色文字。',
    prevention: '输出框自身的清空、字号、字数统计等轻量操作优先贴到边框工具位，不要和下方业务操作按钮混排。',
    keywords: ['大纲设定', '清空', '边框标签', 'AI输出框', 'xy-floating-edge-tool', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'model-prompt-select-width-sixty-percent-001',
    title: '模型和提示词选择框在部分生成区仍然横向撑满',
    area: '作品信息 / 角色生成 / 脑洞生成 / 正文续写',
    symptom:
      '大纲生成区的模型、提示词选择框已固定为区域宽度的 60%，但角色、脑洞和正文续写仍然横向撑满，看起来和大纲页不一致。',
    cause:
      '大纲页只在 SETTING_TAB 下设置 w-[60%]；角色页有独立渲染分支，正文续写使用 WorkbenchAIPanel 的独立配置框，没有复用大纲页宽度规则。',
    solution:
      '角色生成的模型/提示词行加 w-[60%]；脑洞生成纳入 WorkbenchLibraryPanel 的 60% 选择区判断；正文续写的顶部配置框改为 w-[60%] max-w-full。',
    prevention:
      '以后调整模型/提示词选择框宽度时，要同时检查大纲、角色、脑洞、细纲/概要和正文续写这些独立渲染分支，不能只改其中一个 activeTab。',
    keywords: [
      '模型选择框',
      '提示词选择框',
      '60%',
      '角色生成',
      '脑洞生成',
      '正文续写',
      'WorkbenchLibraryPanel',
      'WorkbenchAIPanel',
    ],
    updatedAt: '2026-05-29',
  },
  {
    id: 'outline-setting-log-inline-with-model-001',
    title: '大纲生成标题占位且输出日志离模型管理太远',
    area: '作品信息 / 大纲生成 / 右侧配置区',
    symptom:
      '右侧配置区顶部显示“大纲生成”标题，占用一行空间；“输出日志”按钮放在右上角，和模型选择框里的“管理”按钮距离过远。',
    cause:
      '大纲页复用了高级配置区的通用 header，把 panelTitle 和输出日志按钮统一放在顶部，而不是按大纲页的紧凑表单布局放在模型行。',
    solution:
      '大纲页隐藏顶部 panelTitle，不再显示“大纲生成”；输出日志改为模型选择行的相邻按钮，放在模型管理右侧，脑洞页仍保留原顶部日志入口。',
    prevention:
      '大纲生成这类窄右栏配置应优先把辅助操作放进对应表单行，不要额外占用顶部标题栏；跨 Tab 复用 header 时要给大纲页单独判断。',
    keywords: ['大纲生成', '输出日志', '模型管理', '右侧配置区', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'software-ui-tech-dictionary-preview-001',
    title: '技术词典只有文字没有展示',
    area: 'UI库 / 技术词典 / SoftwareUiCatalogPage',
    symptom:
      '技术词典只显示编号、大白话说明和技术名，缺少对应的界面缩略展示，用户不容易理解每个技术词具体代表什么效果。',
    cause:
      'TechItem 渲染时使用纯文本栅格，没有为技术词典项提供可视化预览组件；收藏页里的技术词典也复用了同样的纯文本布局。',
    solution:
      '新增 TechPreview 和 TechDictionaryCard，为 T-01 到 T-19 分别渲染小型界面示意，并让技术词典页和收藏页统一使用带展示区的卡片布局。',
    prevention:
      '以后新增技术词典条目时，除了 plain 和 tech 字段，还要同步补充对应的可视化展示，避免 UI库变成只能读文字的说明表。',
    keywords: ['UI库', '技术词典', '展示', 'TechPreview', 'SoftwareUiCatalogPage', '01号测试'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'floating-label-top-gap-12px-001',
    title: '边框嵌入标签顶部留白偏窄',
    area: '全局模型/提示词选择框 / 04号测试 / CapsuleSelect',
    symptom: '选择框边框嵌入标签上方预留只有 8px，标签和边框顶部靠得偏紧，视觉上不够透气。',
    cause: '测试 mock 和正式带管理按钮的 CapsuleSelect 都使用 pt-2 作为浮动标签顶部预留，对应 8px。',
    solution: '把浮动标签顶部预留从 pt-2 调整为 pt-3，对应 12px；测试页和正式 CapsuleSelect 同步更新。',
    prevention: '调整边框嵌入标签间距时，测试 mock 和正式组件要一起改，避免测试效果和真实页面不一致。',
    keywords: ['04号测试', 'CapsuleSelect', '边框标签', '留白', '12px', 'pt-3'],
    updatedAt: '2026-05-29',
  },
];
