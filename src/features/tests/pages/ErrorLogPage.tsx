import { AlertTriangle, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type ErrorLogEntry = {
  id: string;
  title: string;
  area: string;
  symptom: string;
  cause: string;
  solution: string;
  prevention: string;
  keywords: string[];
  updatedAt: string;
};

const STORAGE_KEY = 'xinyuexia_test_error_logs';

const defaultEntries: ErrorLogEntry[] = [
  {
    id: 'role-detail-row-misaligned-001',
    title: '角色详情同一行没有水平对齐',
    area: '大纲设定 / 角色详情 / 角色名 / 分类 / 存活死亡',
    symptom: '角色详情同一行里，角色名、分类、存活/死亡没有水平对齐，分类框视觉上比角色名低一截。',
    cause: '角色名是 44px 本体高度，但分类框的 CapsuleSelect 额外保留了顶部浮动标签预留，整块在布局里被算成更高的 56px，导致下沉。',
    solution: '角色详情分类框取消顶部预留，并以角色名字段尺寸为基准，只保留和角色名相同的高度与字号，让同一行三块基线对齐。',
    prevention: '同一行短字段如果都要对齐，先看实际外框高度，不要只看内部按钮高度；带浮动标签的控件要单独检查顶部预留。',
    keywords: ['角色详情', '分类', '角色名', '存活死亡', '对齐', 'CapsuleSelect'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-inline-disable-applied-001',
    title: '模型提示词选择框没有统一套用内嵌禁用图标样式',
    area: '全局模型/提示词选择框 / CapsuleSelect / WorkbenchLibraryPanel',
    symptom: '测试页里的提示词选择框已经是边框标签、左侧禁用图标、右侧管理按钮的一体式样式，但正式页面仍有提示词禁用按钮独立占位，模型行还需要额外空列对齐。',
    cause: 'CapsuleSelect 只支持 floatingLabel 和 actionLabel，不支持内嵌禁用图标；禁用逻辑被 WorkbenchLibraryPanel 单独用 PromptDisableButton 拼在选择框右侧。',
    solution: '给 CapsuleSelect 新增可选内嵌禁用开关；有禁用功能的提示词框把禁用图标放进选择框左侧，没有禁用功能的模型/提示词框不显示图标；删除独立禁用按钮和对齐空列。',
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
    solution: '在测试集合新增“输出日志折叠分组测试”，按“提示词 / 关联内容 / 用户要求”拆分折叠区，并保留“完整发送预览”证明折叠只影响查看、不影响发送给 AI。',
    prevention: '以后设计输出日志时，查看层折叠和实际请求 payload 必须分离，并在界面上明确折叠不改变发送内容。',
    keywords: ['输出日志', '折叠', '提示词', '关联内容', '用户要求', '测试集合'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-log-reader-context-001',
    title: '细纲输出日志看不出读取设定后的内容',
    area: '作品信息 / 细纲 / 输出日志 / 读取设定',
    symptom: '细纲输出日志虽然会把读取设定拼进 Context，但和所选章节正文混在一起，用户无法一眼确认读取设定后实际带了哪些内容。',
    cause: 'buildOutlineAiRequestLog 只保存完整 contextText，没有单独记录读取设定/前文细纲的上下文片段和字数。',
    solution: '细纲日志新增“读取设定”侧栏卡片，显示已读取项数和字数；正文区新增“读取设定后的内容”，单独展示读取设定和前文细纲拼接后的实际内容。',
    prevention: '新增读取/关联上下文后，输出日志不仅要展示完整 Context，还要把新增来源拆成独立可检查区，方便确认是否真的发给 AI。',
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
    cause: '分类框没有管理按钮，CapsuleSelect 仍按普通选择框把下拉层 portal 到 body 并使用 fixed 坐标；在缩放或弹窗布局里坐标会被算偏。',
    solution: 'CapsuleSelect 对所有带 floatingLabel 的选择框都改成本地 absolute 下拉层；普通无浮动标签的选择框继续 portal 到 body。',
    prevention: '边框嵌入标签类选择框应和触发控件处在同一定位上下文，不能只让带 actionLabel 的模型/提示词选择框走本地弹层。',
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
    solution: '给提炼剧情模块名称输入框新增 xy-extract-compact-field 专用样式，把 input 高度固定为 44px，并同步收紧圆角、padding 和浮动标签字号。',
    prevention: '以后只调整某个页面的短字段高度时，优先加页面级专用 class，不要直接修改共享的 xy-floating-compact。',
    keywords: ['提炼剧情', '模块编辑', '名称输入框', '44px', 'xy-floating-compact', 'xy-extract-compact-field'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-locator-volume-arrow-divider-002',
    title: '章节定位栏卷名和章节之间仍有箭头和中间线',
    area: '作品编辑器 / 顶部章节定位栏',
    symptom: '卷名“第一卷”和“第1章”之间还有向下箭头和贴合形成的中间分割线，用户只想保留一个空位。',
    cause: '上一次为了让两个胶囊衔接，把卷名胶囊去掉右边框并让章节胶囊负 margin 贴上，同时卷名仍保留 ChevronDown 图标。',
    solution: '删除卷名里的 ChevronDown 图标；卷名和章节改回两个独立圆角胶囊，去掉负 margin 和去右边框，只依赖父级 gap 留出空位。',
    prevention: '顶部定位控件的视觉改动要按最终截图意图判断：如果用户要“空位”，不要再用负 margin 衔接或图标暗示可下拉。',
    keywords: ['章节定位栏', '第一卷', '第1章', 'ChevronDown', '分割线', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'library-config-select-field-size-001',
    title: '模型提示词选择框宽度不能按页面单独调节',
    area: '大纲设定 / 角色 / 脑洞 / 字段尺寸 / 模型提示词选择框',
    symptom: '模型和提示词选择框统一改成 60% 后，部分页面仍会挤压文字；禁用按钮占用列宽也会影响提示词显示。',
    cause: '字段尺寸配置只覆盖角色名、分类名、设定名等文本字段，没有覆盖三类生成面板的模型/提示词选择框；禁用按钮宽度固定 52px。',
    solution: '字段尺寸新增设定、角色、脑洞三组模型框和提示词框配置；对应页面读取各自配置；禁用按钮列缩小为 44px，降低对提示词文本的挤压。',
    prevention: '以后调整模型/提示词选择框宽度时，要把外层灰卡、选择框宽度、管理按钮和禁用按钮拆开看，避免一个按钮改变整行文本起点。',
    keywords: ['字段尺寸', '模型选择框', '提示词选择框', '禁用按钮', '角色生成', '脑洞生成', '大纲设定'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-reader-tree-previous-only-001',
    title: '读取设定弹窗缺少导航树且会读取后文细纲',
    area: '作品信息 / 细纲 / 读取设定',
    symptom: '读取设定弹窗只有平铺列表，设定和细纲多了后不好找；生成第10章细纲时也会列出第10章之后的细纲。',
    cause: '读取弹窗直接渲染全量设定/细纲列表，没有像设定页一样按分组生成左侧导航；细纲来源没有按当前章节序号过滤。',
    solution: '弹窗改为左侧分组导航树加右侧列表；设定按类型分组，细纲按分卷分组；读取细纲只保留当前选中章节之前的章节。',
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
    symptom: 'UI库左侧编号导航把字体、颜色、按钮、输入框等所有条目都折叠到一个“UI”分类里，用户无法按“字体设置、颜色记录、按钮样式”等具体类型查找。',
    cause: 'catalogNavGroups 按 tab 粗略分组，把 ui tab 全部命名为 UI，collection tab 全部命名为 收藏，丢失了每条记录自身的 group 信息。',
    solution: '编号导航改为按条目自身 group 聚合；字体映射为“字体设置”，颜色映射为“颜色记录”，按钮映射为“按钮样式”；搜索和收藏状态也复用同一套具体分类。',
    prevention: 'UI库左侧导航应服务查找编号，优先使用可操作的 UI 类型分类，不能只按页面 Tab 作为导航分组。',
    keywords: ['UI库', '编号导航', '字体设置', '颜色记录', '按钮样式', 'SoftwareUiCatalogPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-read-settings-context-001',
    title: '细纲生成缺少读取设定和前文细纲',
    area: '作品信息 / 细纲 / 读取设定 / AI Context',
    symptom: '细纲右下角只能输入要求并读取当前章节正文，无法把大纲设定里的剧情大纲或已有前文细纲一起发给 AI，导致 AI 生成细纲时缺少设定依据。',
    cause: '细纲生成分支的 sendOutlineAiMessage 只调用 getSelectedOutlineContext，把所选章节正文作为 chapterContext，没有类似关联脑洞或关联上下文的读取弹窗和持久化选择。',
    solution: '在细纲输入框上方新增“读取设定”按钮；弹窗提供“设定/细纲”切换；设定里的“剧情大纲”默认勾选且不能取消；确认后把选中设定和细纲拼入 getOutlineAiContext，再作为 callModelStream 的 chapterContext 发送。',
    prevention: '以后新增关联/读取按钮时，要同时检查 UI 选择、默认必选项、输出日志预览和实际 callModelStream/callModel 参数，避免只做选择弹窗而没有进入 AI 请求。',
    keywords: ['细纲', '读取设定', '剧情大纲', '读取细纲', 'chapterContext', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-category-field-size-missing-001',
    title: '角色详情分类下拉框没有纳入字段尺寸',
    area: '作品信息 / 大纲设定 / 角色详情 / 分类',
    symptom: '字段尺寸可以调整搜索角色、分类名字、角色名字、设定名，但角色详情顶部的“分类”下拉框仍然保持固定宽高，视觉上像没有修复。',
    cause: '字段尺寸只覆盖了输入框类字段，角色详情分类使用 CapsuleSelect floatingLabel=分类，没有独立的 roleDetailCategory 配置，也没有让 CapsuleSelect 接收尺寸样式。',
    solution: '新增 roleDetailCategory 字段尺寸配置；CapsuleSelect 支持 style；角色详情分类下拉框套用 xy-capsule-custom-field-size，通过 CSS 变量同步宽度、高度和字号。',
    prevention: '以后把字段加入尺寸调节时，要按真实控件类型检查输入框、下拉框、按钮式选择框是否都覆盖到，不能只按字段名称判断。',
    keywords: ['大纲设定', '字段尺寸', '角色详情', '分类', 'CapsuleSelect', 'roleDetailCategory'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-field-size-settings-001',
    title: '大纲设定字段尺寸只能靠代码反复调整',
    area: '作品信息 / 大纲设定 / 字段尺寸',
    symptom: '角色名、搜索角色、分类名字、设定名等短字段的高度、宽度和字号每次都需要通过代码修改，用户无法自己试到合适尺寸。',
    cause: '真实大纲设定页面没有字段级尺寸配置入口，UI库里的规格配置只用于展示和收藏，没有写回 WorkbenchLibraryPanel 的实际字段。',
    solution: '在大纲设定顶部新增“字段尺寸”按钮，打开弹窗后可分别调整搜索角色、分类名字、角色名字、角色名、设定名的宽度、高度和字号；配置写入 localStorage 并实时作用到对应字段。',
    prevention: '用户频繁微调的 UI 尺寸应提供页面内配置入口，并使用本地持久化，避免每次都走代码改动。',
    keywords: ['大纲设定', '字段尺寸', '角色名', '搜索角色', '分类名字', '设定名', 'localStorage', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-name-field-height-font-001',
    title: '设定名输入框偏高且内容字偏小',
    area: '作品信息 / 大纲设定 / 设定详情',
    symptom: '设定名输入框外框显得臃肿，内部设定名文字不够醒目。',
    cause: '设定名复用了 xy-floating-outline-fixed 的默认输入框高度 66px 和 1rem 字号，这套尺寸更适合大输入区，不适合短名称字段。',
    solution: '新增 xy-floating-outline-setting-name 专用样式，把设定名输入框高度降到 56px，圆角同步收敛，并把输入文字提升到 1.125rem。',
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
    cause: 'smartImportLocked 只由右侧锁按钮手动切换，smartImportSettings 在成功解析并写入设定后没有主动把锁定状态写回当前 Tab 配置。',
    solution: '在智能导入成功 persist 之后调用 updateActiveTabConfig({ smartImportLocked: true })，让导入过一次后默认锁定；需要重新导入时再手动点击锁图标解锁。',
    prevention: '一次性导入、迁移、批处理类操作成功后应自动进入防误触状态，手动解锁作为再次执行的明确确认。',
    keywords: ['智能导入设定', '自动锁定', 'smartImportLocked', '重复导入', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-ai-dialog-real-floating-frame-001',
    title: '大纲设定 AI 对话框没有真正显示边框标签',
    area: '作品信息 / 大纲设定 / AI 输出框',
    symptom: '用户看不到“AI对话框”边框标签效果，清空虽然贴到了右上角，但输出区域本身仍然是普通 rounded border 容器。',
    cause: '上一次只在普通相对定位容器上添加 xy-floating-edge-tool，没有把 AI 输出区域外层改为 xy-floating-field / xy-floating-outline-preview 结构，因此左上角标签不会出现。',
    solution: '把大纲设定 AI 输出区外层改为 xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview，并把滚动内容放进 xy-floating-rich-preview；左上角补 label=AI对话框，右上角继续保留红色清空边框工具。',
    prevention: '需要“设定预览那种边框标签”时，必须同时迁移外层 xy-floating-field、内部 xy-floating-rich-preview 和 label，不能只加右上角工具按钮。',
    keywords: ['大纲设定', 'AI对话框', '边框标签', 'xy-floating-field', 'xy-floating-rich-preview', '清空'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-ai-clear-edge-tool-001',
    title: '大纲设定清空按钮占用下方操作区空间',
    area: '作品信息 / 大纲设定 / AI 输出框',
    symptom: '大纲设定 AI 输出框下方的红色“清空”按钮和智能导入、关联脑洞按钮挤在一起，占用操作区宽度，且距离要清空的输出框较远。',
    cause: '清空操作属于 AI 输出框本身，但原先被放在输入框上方的普通按钮行里，没有复用边框嵌入工具的布局方式。',
    solution: '把清空入口从下方按钮行移除，放到 AI 输出框右上角边框上，使用 xy-floating-edge-tool 形成边框标签效果，只保留“清空”两个字并使用红色文字。',
    prevention: '输出框自身的清空、字号、字数统计等轻量操作优先贴到边框工具位，不要和下方业务操作按钮混排。',
    keywords: ['大纲设定', '清空', '边框标签', 'AI输出框', 'xy-floating-edge-tool', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'model-prompt-select-width-sixty-percent-001',
    title: '模型和提示词选择框在部分生成区仍然横向撑满',
    area: '作品信息 / 角色生成 / 脑洞生成 / 正文续写',
    symptom: '大纲生成区的模型、提示词选择框已固定为区域宽度的 60%，但角色、脑洞和正文续写仍然横向撑满，看起来和大纲页不一致。',
    cause: '大纲页只在 SETTING_TAB 下设置 w-[60%]；角色页有独立渲染分支，正文续写使用 WorkbenchAIPanel 的独立配置框，没有复用大纲页宽度规则。',
    solution: '角色生成的模型/提示词行加 w-[60%]；脑洞生成纳入 WorkbenchLibraryPanel 的 60% 选择区判断；正文续写的顶部配置框改为 w-[60%] max-w-full。',
    prevention: '以后调整模型/提示词选择框宽度时，要同时检查大纲、角色、脑洞、细纲/概要和正文续写这些独立渲染分支，不能只改其中一个 activeTab。',
    keywords: ['模型选择框', '提示词选择框', '60%', '角色生成', '脑洞生成', '正文续写', 'WorkbenchLibraryPanel', 'WorkbenchAIPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'outline-setting-log-inline-with-model-001',
    title: '大纲生成标题占位且输出日志离模型管理太远',
    area: '作品信息 / 大纲生成 / 右侧配置区',
    symptom: '右侧配置区顶部显示“大纲生成”标题，占用一行空间；“输出日志”按钮放在右上角，和模型选择框里的“管理”按钮距离过远。',
    cause: '大纲页复用了高级配置区的通用 header，把 panelTitle 和输出日志按钮统一放在顶部，而不是按大纲页的紧凑表单布局放在模型行。',
    solution: '大纲页隐藏顶部 panelTitle，不再显示“大纲生成”；输出日志改为模型选择行的相邻按钮，放在模型管理右侧，脑洞页仍保留原顶部日志入口。',
    prevention: '大纲生成这类窄右栏配置应优先把辅助操作放进对应表单行，不要额外占用顶部标题栏；跨 Tab 复用 header 时要给大纲页单独判断。',
    keywords: ['大纲生成', '输出日志', '模型管理', '右侧配置区', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'software-ui-tech-dictionary-preview-001',
    title: '技术词典只有文字没有展示',
    area: 'UI库 / 技术词典 / SoftwareUiCatalogPage',
    symptom: '技术词典只显示编号、大白话说明和技术名，缺少对应的界面缩略展示，用户不容易理解每个技术词具体代表什么效果。',
    cause: 'TechItem 渲染时使用纯文本栅格，没有为技术词典项提供可视化预览组件；收藏页里的技术词典也复用了同样的纯文本布局。',
    solution: '新增 TechPreview 和 TechDictionaryCard，为 T-01 到 T-19 分别渲染小型界面示意，并让技术词典页和收藏页统一使用带展示区的卡片布局。',
    prevention: '以后新增技术词典条目时，除了 plain 和 tech 字段，还要同步补充对应的可视化展示，避免 UI库变成只能读文字的说明表。',
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
  {
    id: 'select-floating-label-test-label-clipped-001',
    title: '第04号测试选择框边框标签被裁切',
    area: '测试集合 / 04号测试 / 选择框边框标签测试',
    symptom: '选择框边框标签测试里，“模型”“提示词”等嵌入边框的标签文字被上方裁掉，看起来像字被遮住。',
    cause: '测试用 FloatingLabelSelectMock 把外层边框容器设置为 overflow-hidden，但标签是 absolute 放在边框线上并向上偏移，超出容器的上半部分被裁切。',
    solution: '外层边框容器改为 overflow-visible，让边框标签可以完整露出；内部按钮行单独保留 overflow-hidden 和圆角，继续裁切按钮背景和管理按钮区域。',
    prevention: '边框嵌入标签控件的外层不能直接 overflow-hidden；需要裁切内部内容时，应把裁切放到内部内容层，避免标签、字数统计、边框工具被截断。',
    keywords: ['04号测试', '选择框边框标签测试', 'FloatingLabelSelectMock', 'overflow-hidden', '标签裁切'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'test-collection-numbered-ui-first-001',
    title: '测试集合缺少稳定编号且 UI 库入口不在第一位',
    area: '测试集合 / 测试入口 / 编号',
    symptom: '测试集合里每个测试没有数字编号，后续沟通只能按名称描述；UI库测试在第二组里，不在第一行第一位，用户需要先找入口。',
    cause: '测试集合只按分组和标题渲染卡片，没有从全量测试顺序生成稳定编号；AI 链路测试组排在最前，导致 UI库无法取代第一张卡片。',
    solution: '把 UI 与主题分组移动到第一组，并让 UI库成为 01 号测试；按全量测试列表顺序生成两位数字编号，卡片和打开后的测试标题都显示编号，搜索也支持按编号匹配。',
    prevention: '以后新增测试时需要确认其编号位置，并在回复用户时说明“第 X 号测试”；测试集合的展示顺序变化要同步考虑编号稳定性。',
    keywords: ['测试集合', 'UI库', '编号', '01号测试', 'TestCollectionPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-escape-go-home-fallback-001',
    title: '作品编辑器 Esc 没有关闭对象时缺少回首页兜底',
    area: '作品编辑器 / 快捷键 / Esc',
    symptom: '在作品编辑器页面按 Esc 时，如果当前没有弹窗或侧边浮层可以关闭，页面没有进一步反馈；用户希望这时直接跳回首页。',
    cause: 'Esc 只作为 close_floating 快捷键派发给页面内浮层关闭逻辑，WorkbenchPage 只关闭回收站和普通弹窗，没有处理“没有可关闭对象”的空状态。',
    solution: '扩展 WorkbenchPage 的 close_floating 处理：先关闭快速导航、回收站、导出、查找、编辑设置、管理弹窗、关联章节和发布确认等可关闭层；如果都没有打开，则跳转到 /dashboard。',
    prevention: '全局 Esc 快捷键需要区分两层语义：有浮层时关闭最上层浮层，没有浮层时执行页面级兜底动作；新增浮层时要同步纳入页面 close_floating 判断。',
    keywords: ['Esc', '作品编辑器', '首页', 'close_floating', '快捷键', 'WorkbenchPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'symbol-replace-toolbar-order-001',
    title: '一键替换组合按钮顺序反了',
    area: '作品编辑器 / 正文工具栏 / 一键替换',
    symptom: '一键替换组合按钮从左到右显示为齿轮、开关、一键替换，和操作阅读顺序相反；用户期望一键替换在最左边，设置齿轮在最右边。',
    cause: '组合按钮在增加设置入口时按“设置、开关、执行”的内部实现顺序渲染，没有按工具栏用户操作顺序排列。',
    solution: '把一键替换组合按钮调整为“一键替换 / 开关 / 齿轮设置”，并复用分段按钮边框衔接方式，避免独立分隔线造成视觉杂点。',
    prevention: '工具栏组合按钮优先按用户动作顺序排列：主动作在左，状态开关居中，设置入口在右；不要按代码实现或配置入口优先级排列。',
    keywords: ['一键替换', '齿轮', '开关', '按钮顺序', '正文工具栏', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-toolbar-split-button-shadow-001',
    title: '章节工具栏组合按钮中间出现模糊阴影',
    area: '作品编辑器 / 顶部章节工具栏 / 组合按钮',
    symptom: '复制/优化组合按钮中间出现一块模糊的白色阴影，看起来像两个按钮没有干净衔接；审核、点评、状态三段按钮的视觉样式也不统一。',
    cause: '组合按钮中间使用独立的竖线 div 作为分隔，在浅底按钮和蓝底按钮交界处会产生额外背景层和抗锯齿痕迹；审核、点评仍是描边样式，状态是蓝底样式。',
    solution: '删除组合按钮内部独立分隔线，改为按钮自身 border-l 形成硬边界；审核、点评、状态统一为蓝底白字分段按钮，三段复用同一套高度、圆角和 hover 样式。',
    prevention: '以后分段按钮不要在按钮之间插入独立背景节点做分隔，优先使用相邻按钮的 border-l 或 divide 规则；同一组同层级操作需要共用同一视觉状态。',
    keywords: ['章节工具栏', '组合按钮', '复制', '优化', '审核', '点评', '状态', '阴影', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-context-menu-edit-action-001',
    title: '章节右键菜单缺少修改入口',
    area: '作品编辑器 / 章节侧栏 / 右键菜单',
    symptom: '右键点击章节时，弹出的菜单只有发布或删除等操作，没有直接进入修改当前章节的入口。',
    cause: '章节侧栏和已发布侧栏的右键菜单只覆盖发布、撤回、删除这类状态操作，没有把“选择并编辑章节”作为显式菜单项。',
    solution: '在未发布章节和已发布章节右键菜单顶部新增“修改章节”，点击后调用章节选择逻辑并关闭菜单，让正文编辑区切到该章节。',
    prevention: '章节列表的右键菜单应包含最常用的对象操作：修改、发布/撤回、删除；新增菜单项时未发布和已发布列表需要保持一致。',
    keywords: ['章节右键', '修改章节', 'ChapterSidebar', 'PublishedSidebar', '右键菜单'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'software-ui-manual-upload-merged-nav-001',
    title: 'UI库软件 UI 和手动上传拆成两个入口',
    area: 'UI库 / 软件 UI / 手动上传 / 编号导航',
    symptom: 'UI库里“软件 UI”和“手动上传”分成两个 Tab，查找 UI 编号时需要在两个入口之间切换，左侧编号导航也没有一个可折叠的统一 UI 分类。',
    cause: '手动上传的 UI 样式按来源单独成页，软件内置 UI 按标准样式成页，导航只按当前 Tab 扁平列出编号。',
    solution: '把手动上传内容合并到 UI Tab，顶部 Tab 改为 UI / 技术词典 / 收藏；左侧编号导航增加可折叠的顶层分类，UI 编号统一收进“UI”分类。',
    prevention: 'UI库应按用户查找目标组织，而不是按来源拆入口；同类 UI 编号进入同一顶层导航分类，再用小分组表达来源或类型。',
    keywords: ['UI库', '软件UI', '手动上传', '编号导航', '折叠', 'SoftwareUiCatalogPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-ai-chat-tools-overlap-top-001',
    title: '正文续写 AI 对话框边框工具和上方区域挤压',
    area: '正文续写 / AI 对话框 / 会话按钮',
    symptom: 'AI 对话框的边框标签贴近上方模型/提示词选择区，“AI对话框”文案占住左上角，+、删除、清空都挤在右上角，并且单个空会话时不显示 1 号会话按钮。',
    cause: '会话工具被统一放在右上 xy-floating-edge-tool，左上仍保留标题标签；之前为了“清空像黑板擦”隐藏了单空会话序号，但现在会话切换需要始终显示当前序号。',
    solution: '删除 AI 对话框边框标签，把左上角改为会话控制区，始终显示 + 和当前会话序号；右上角只保留删除/清空；聊天框上边距从 mt-3 增加到 mt-5。',
    prevention: '边框嵌入工具同时存在左上和右上操作时，应拆成左右两个工具区，并预留顶部间距；会话型 UI 不要隐藏当前会话序号。',
    keywords: ['正文续写', 'AI对话框', '会话按钮', '1号会话', '加号', '边框工具', '间距'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'test-nav-reclick-return-index-001',
    title: '测试导航在测试内容页不能返回测试总页',
    area: '测试集合 / 左侧导航 / TestCollectionPage',
    symptom: '在“测试”总页点击某个测试内容进入内嵌测试页面后，再点击左侧导航里的“测试”没有回到测试总页，只能点左上角返回。',
    cause: '测试内容是在 TestCollectionPage 内部通过 activePath 切换的，浏览器路由仍是 /test-collection；左侧导航再次跳到同一路由时不会重置组件内部状态。',
    solution: '新增 TEST_COLLECTION_SHOW_INDEX_EVENT，TestCollectionPage 监听该事件并清空 activePath；左侧导航点击当前 /test-collection 时派发事件，让“测试”导航成为返回测试总页入口。',
    prevention: '同一路由内的子页面切换如果需要被外部导航重置，应提供显式事件或状态入口，不要只依赖 React Router 重新挂载。',
    keywords: ['测试', '测试内容', '测试总页', '左侧导航', 'TestCollectionPage', 'activePath'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-ai-chat-u141-toolbar-001',
    title: '正文续写会话工具条没有融入 AI 对话框边框',
    area: '正文续写 / AI 对话框 / 会话工具条',
    symptom: '聊天区域上方有独立的胶囊工具条，新增会话、序号、删除、清空和下方聊天框分成两层，视觉上不够像 UI141 的边框嵌入工具。',
    cause: '会话工具条单独渲染在模型/提示词配置区下方，聊天记录框仍是普通灰底边框，字数统计也使用独立浮层样式。',
    solution: '移除独立工具条，把聊天记录框改为 xy-floating-outline-fixed + xy-floating-rich-preview，并将新增会话、序号、删除、清空收进 xy-floating-edge-tool 右上角边框工具，字数统计复用 xy-floating-count。',
    prevention: '需要套用 UI141 的大文本区域，应优先复用 xy-floating-field、xy-floating-edge-tool 和 xy-floating-count，不要再额外放一整行独立工具条。',
    keywords: ['正文续写', 'AI对话框', 'UI141', 'xy-floating-edge-tool', '会话工具条', '字数统计'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'floating-count-capsule-to-border-text-001',
    title: '边框字数统计看起来像浮动胶囊',
    area: '全局边框输入框 / 字数统计',
    symptom: '部分输入框右下角的“0字”字数统计留白偏大，看起来像一个浮动小胶囊，而不是嵌入边框的文字。',
    cause: 'xy-floating-count 的左右 padding 和 line-height 偏大，白底遮罩区域视觉上过厚。',
    solution: '缩小 xy-floating-count 的左右留白和行高，去掉圆角和阴影，并微调 right 位置，让字数统计更像贴在边框上的纯文本。',
    prevention: '边框嵌入式辅助信息只保留文字和必要遮罩，不要使用过大的 padding、圆角或阴影，否则会从边框标签变成独立徽标。',
    keywords: ['字数统计', '0字', '边框嵌入', 'xy-floating-count', '胶囊'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-category-select-floating-label-001',
    title: '角色详情分类选择框标签外置不统一',
    area: '作品信息 / 角色库 / 角色详情',
    symptom: '角色详情里的“分类”文字放在选择框外侧，和模型、提示词这类边框嵌入标签选择框不一致，视觉上像两套控件。',
    cause: '分类字段使用外置 label + CapsuleSelect 的普通模式，没有启用 CapsuleSelect 的 floatingLabel。',
    solution: '移除外置“分类”文字，把分类选择框改为 CapsuleSelect floatingLabel=分类，复用模型/提示词选择框的边框嵌入标签方式。',
    prevention: '角色详情里的选择框字段应优先复用 CapsuleSelect floatingLabel，避免同一行短字段出现外置标签和嵌入标签混用。',
    keywords: ['角色详情', '分类', 'CapsuleSelect', 'floatingLabel', '模型提示词选择框'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-name-input-too-tall-001',
    title: '角色详情里的角色名输入框过高',
    area: '作品信息 / 角色库 / 角色详情',
    symptom: '角色详情里的“角色名”输入框比左侧搜索角色输入框高很多，显得臃肿，占用顶部空间。',
    cause: '详情区角色名只使用 xy-floating-outline-fixed，默认 input 高度为 66px；搜索角色使用了 xy-floating-outline-role-compact，高度为 44px。',
    solution: '给详情区角色名输入框补上 xy-floating-outline-compact 和 xy-floating-outline-role-compact，使高度、圆角和字号与搜索角色一致。',
    prevention: '角色页里的短文本字段应统一使用 role compact 输入框，不要混用普通大号 outline 输入框。',
    keywords: ['角色名', '搜索角色', '输入框高度', '角色库', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'prompt-disable-icon-inside-select-test-001',
    title: '提示词禁用按钮占用独立列导致选择框变窄',
    area: '测试集合 / 选择框边框标签测试 / 提示词选择框',
    symptom: '提示词禁用功能放在选择框右侧独立按钮时，会挤压提示词名称显示空间，窄栏里更明显。',
    cause: '禁用状态作为外部按钮参与网格布局，占用了原本可用于显示选中提示词的宽度。',
    solution: '在测试页新增“禁用图标嵌入选中内容左侧”方案，把禁用圆圈放进选择框内部、选中内容左侧，点击图标复用原禁用切换逻辑。',
    prevention: '提示词禁用这类状态开关如果和选择框强绑定，优先测试嵌入式图标，避免独立按钮挤压主内容。',
    keywords: ['提示词', '禁用', '选择框', '测试页', '嵌入图标', 'FloatingLabelSelectMock'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-ai-dialog-outline-label-001',
    title: '大纲设定 AI 输出框缺少边框嵌入标签',
    area: '作品信息 / 大纲设定 / AI 对话框',
    symptom: '大纲设定右侧 AI 输出区域顶部有空白位置，但没有像设定预览那样显示边框嵌入标题，区域语义不够清楚。',
    cause: 'AI 输出区域仍使用旧的 xy-floating-label-fixed 样式，标签不嵌入边框。',
    solution: '把 AI 输出区域改为 xy-floating-outline-fixed，并将标签文案改为“AI对话框”，复用设定预览的边框嵌入标签技术。',
    prevention: '同一弹窗内的大文本区域应统一使用边框嵌入标签，避免一部分是旧浮动标签、一部分是新边框标签。',
    keywords: ['大纲设定', 'AI对话框', '边框标签', '设定预览', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-arrow-space-001',
    title: '模型提示词选择框箭头占位过宽导致内容截断',
    area: '全局模型/提示词选择框 / CapsuleSelect',
    symptom: '带管理按钮的模型或提示词选择框里，箭头距离管理按钮偏远，左侧选中内容过早截断。',
    cause: 'CapsuleSelect 的 inline action 箭头热区使用 w-9/w-10，箭头中心偏左，占用了本可显示选中名称的空间。',
    solution: '缩窄带管理按钮选择框的箭头热区，h-9/h-10/h-11 使用 w-6，h-12 使用 w-7，让箭头靠近管理按钮并给文本释放空间，同时保留不贴到三角的间距。',
    prevention: '复合选择框里右侧图标热区不应默认过宽；需要同时检查文字截断、箭头安全距离和管理按钮可点击范围。',
    keywords: ['CapsuleSelect', '箭头', '管理按钮', '模型选择框', '提示词选择框', '内容截断'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'smart-import-settings-duplicates-001',
    title: '智能导入设定重复点击会生成重复设定',
    area: '作品信息 / 大纲设定 / 智能导入设定',
    symptom: '智能导入设定后，如果再次点击同一个按钮，会按同一份 AI 输出再次生成同名同分类设定，列表里出现重复的世界观、核心爽点、主角金手指等条目。',
    cause: '智能导入逻辑每次都把解析出的片段直接新增到设定列表前面，没有按分类和设定名检查已有条目。',
    solution: '导入时按“分类 + 设定名”查找已有设定；已存在且内容相同则复用旧条目，内容不同则更新旧条目，不存在时才新增。',
    prevention: '所有从 AI 输出批量导入到资料库的功能都应做幂等处理，重复执行同一输入不应制造重复数据。',
    keywords: ['智能导入设定', '重复设定', '幂等', '大纲设定', '分类', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'outline-generator-select-width-001',
    title: '大纲生成模型提示词选择框过长',
    area: '作品信息 / 大纲生成 / 右侧配置区',
    symptom: '大纲生成右侧的模型和提示词选择框横向撑满整块区域，视觉上过长，挤压页面层次。',
    cause: '右侧配置区复用了通用模型/提示词选择布局，默认 w-full，没有按大纲生成区域的实际视觉比例收窄。',
    solution: '仅在大纲生成 activeTab 下，把模型和提示词选择框外层宽度固定为父区域的 60%；其他脑洞、细纲、概要等区域保持原布局。',
    prevention: '复用全局选择框时，页面级宽度应由业务容器控制，不要把所有配置区都默认拉满整行。',
    keywords: ['大纲生成', '模型选择框', '提示词选择框', '60%', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-sidebar-create-gap-001',
    title: '设定库左侧新建按钮上下留白过高',
    area: '作品信息 / 设定库 / 左侧分类栏',
    symptom: '新建分类、新建设定按钮上方和下方留白偏高，核心设定列表被向下挤，占用可视空间。',
    cause: '左侧栏统一使用 p-4，且新建按钮和分类列表之间使用 mt-5，在窄弹窗里垂直空间显得浪费。',
    solution: '左侧栏改为 px-4 pb-3 pt-2，按钮到分类列表的间距从 mt-5 收窄为 mt-2.5，保留按钮本身点击高度。',
    prevention: '侧栏顶部操作区如果按钮高度已足够，不要再叠加过大的上下 padding；优先压缩空白而不是缩小可点击按钮。',
    keywords: ['设定库', '新建分类', '新建设定', '核心设定', '间距', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-review-status-split-button-001',
    title: '审核点评和更新状态按钮割裂占用空间',
    area: '作品编辑器 / 顶部章节工具栏',
    symptom: '审核、点评是组合按钮，但更新状态单独放在右侧，横向空间占用偏大，也和同类章节操作不在一组。',
    cause: '同一层级的章节辅助操作没有合并，更新状态文案也比实际动作更长。',
    solution: '把更新状态并入审核/点评组合按钮，形成“审核 / 点评 / 状态”三段按钮，状态段保留品牌色强调并复用原 openStatusUpdate 逻辑。',
    prevention: '同一工具栏里连续的同级短操作优先合成分段按钮，动作文案保留核心词，减少横向挤压。',
    keywords: ['审核', '点评', '状态', '更新状态', '组合按钮', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-header-serial-width-001',
    title: '章节定位栏卷名和章节之间留出多余分隔区',
    area: '作品编辑器 / 顶部章节定位条',
    symptom: '顶部“第一卷 / 第1章”区域里，卷名和章节之间仍有一个分隔点或空白区，两个胶囊没有衔接起来；章节数字只有一位时也曾预留过宽。',
    cause: '章节序号 input 最初固定使用 w-8，后来虽然改为 ch 自适应，但卷名胶囊和章节胶囊之间仍保留了独立分隔符和父级 gap。',
    solution: '章节序号 input 继续按 String(serialValue).length 计算 ch 宽度；删除卷名和章节之间的分隔符，卷名胶囊去掉右边框，章节胶囊用负 margin 接上，形成连续区域。',
    prevention: '顶部短定位控件应按视觉组处理：属于同一定位信息的卷名和章节不要再插入独立点号或占位分隔区，只在章节与标题这类不同对象之间保留间隔。',
    keywords: ['章节序号', '第一卷', '第1章', '输入框宽度', '分隔符', '衔接', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-title-actions-split-button-001',
    title: '章节标题复制和优化按钮占用过宽',
    area: '作品编辑器 / 章节标题工具栏',
    symptom: '复制标题和标题优化作为两个独立按钮横向占位偏大，标题两个字重复出现，挤压右侧审核、点评等工具按钮。',
    cause: '同一对象的相邻操作被拆成两个完整按钮，文本也重复带“标题”上下文，导致工具栏信息密度不够。',
    solution: '把复制标题和标题优化合并为分段组合按钮，左侧为“复制”，右侧为“优化”，保留各自点击逻辑并去掉重复的“标题”文字。',
    prevention: '同一对象上的连续短操作优先使用分段组合按钮，按钮文案只保留动作，不重复上下文名。',
    keywords: ['章节标题', '复制', '优化', '组合按钮', '工具栏', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-published-inner-splitter-001',
    title: '已发布展开后未发布和已发布之间没有拖拽分割线',
    area: '作品编辑器 / 章节侧栏 / 已发布栏',
    symptom: '展开已发布章节后，未发布栏和已发布栏之间只能看到普通边线，不能直接拖拽调整两栏宽度；外侧分割线也容易让人误以为是在调中间两栏。',
    cause: '章节侧栏原来只有一套 chapterSidebarWidth，已发布栏使用固定宽度，分割线只放在章节区域和正文编辑器之间。',
    solution: '给已发布栏增加独立宽度状态和本地记忆；在未发布栏与已发布栏之间新增红色悬停分割线用于调整未发布栏；已发布展开时，外侧分割线改为调整已发布栏宽度。',
    prevention: '以后同一区域出现两个并排侧栏时，每个可变宽栏都要有明确的宽度状态、存储 key 和对应分割线，避免一个拖拽手柄控制多个视觉边界。',
    keywords: ['章节侧栏', '已发布', '未发布', '拖拽分割线', '宽度记忆', 'PublishedSidebar'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-inline-action-local-dropdown-001',
    title: '带管理按钮的模型下拉框在缩放弹窗里仍然偏左',
    area: '大纲设定 / 细纲 / CapsuleSelect / 模型提示词选择框',
    symptom: '模型或提示词选择框展开后，下拉菜单仍然没有贴住选择框，而是偏到左侧，尤其在大纲设定、细纲这类缩放弹窗中明显。',
    cause: '带管理按钮的 CapsuleSelect 位于 body zoom 和面板 zoom 叠加的上下文里。即使修正了 viewport 边界夹取，portal 到 document.body 的 fixed 坐标仍然可能和触发控件所在的缩放坐标系不一致。',
    solution: '带 actionLabel 的 CapsuleSelect 不再把下拉菜单 portal 到 body，而是直接渲染为选择框自身下面的 absolute 下拉层，让下拉菜单和触发控件处在同一个缩放上下文；普通无管理按钮的选择框继续使用 body portal。',
    prevention: '以后带复合按钮的选择框如果固定出现在缩放弹窗内部，优先用本地 absolute 下拉层；只有不在缩放容器里且确实会被裁剪的普通浮层才使用 body portal + fixed 坐标。',
    keywords: ['CapsuleSelect', 'actionLabel', '下拉框偏左', 'zoom', 'portal', 'absolute', '模型选择框', '提示词选择框'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-arrow-hover-button-bg-001',
    title: '模型提示词选择框箭头悬停凸出成按钮',
    area: '全局模型/提示词选择框 / CapsuleSelect',
    symptom: '鼠标移到选择框右侧箭头上时，箭头区域出现一整块浅蓝背景，看起来像独立按钮从选择框里凸出来。',
    cause: 'CapsuleSelect 的独立箭头热区使用了 hover:bg-sky-50，虽然可点击区域正确，但悬停背景会破坏整体选择框的一体感。',
    solution: '去掉箭头热区的 hover 背景，保留透明背景，只在 hover 时把箭头颜色变为品牌蓝；测试页 mock 同步改成相同效果。',
    prevention: '以后嵌入式图标热区如果属于同一个输入框或选择框，只改变图标颜色，不给整块区域加 hover 背景，除非设计明确需要分段按钮。',
    keywords: ['CapsuleSelect', '箭头', 'hover', '模型选择框', '提示词选择框', '管理按钮'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-body-zoom-clamp-001',
    title: '全局缩放下模型下拉框被错误推到左侧',
    area: '大纲设定 / CapsuleSelect / body zoom',
    symptom: '模型或提示词下拉框展开后没有贴着选择框左边，而是整体偏到左侧，遮住旁边内容。',
    cause: '页面 body 使用 zoom 后，window.innerWidth / documentElement.clientWidth 可能小于 getBoundingClientRect 得到的选择框可视 right。CapsuleSelect 为了防止下拉框越界，会用较小的 viewportWidth 夹住 left，误判为右侧越界并把菜单推到左侧。',
    solution: 'CapsuleSelect 计算 viewportWidth 时取 window.innerWidth、documentElement.clientWidth 和 rect.right + 8 的最大值，确保已可见的选择框不会因为全局 zoom 被错误夹到左边。',
    prevention: '以后在全局 zoom 或 transform 场景里做浮层边界夹取时，不能只信 window.innerWidth；至少要把触发控件的 getBoundingClientRect 边界纳入视口计算。',
    keywords: ['CapsuleSelect', '下拉框', 'zoom', 'innerWidth', 'getBoundingClientRect', '定位偏移'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'model-402-insufficient-balance-message-001',
    title: '大纲生成显示原始 402 余额不足错误',
    area: '通用模型调用 / 大纲生成 / callModel',
    symptom: '大纲生成输出框一直显示“Model request failed (402): Insufficient Balance”，用户容易以为大纲生成页面坏了。',
    cause: '模型接口返回 402 或 Insufficient Balance 时，通用模型调用层只把服务端 JSON 原样拼进错误信息，没有转换成用户能直接理解的中文提示。',
    solution: '在 callModel 的 formatModelError 中解析服务端 error.message，并识别 402、Insufficient Balance、余额不足等情况，统一提示当前模型 API 账户余额不足，需要换模型或充值。',
    prevention: '以后新增模型错误处理时，先在通用模型调用层归一化高频错误码，不要在单个页面里分别拼接原始接口错误。',
    keywords: ['大纲生成', '402', 'Insufficient Balance', '余额不足', 'callModel', '模型调用'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'prompt-disable-column-alignment-001',
    title: '提示词禁用按钮和模型/提示词选择框不对齐',
    area: '大纲设定 / 脑洞生成 / 角色生成 / 模型提示词选择框',
    symptom: '模型选择框占满整行，导致“管理”按钮出现在禁用按钮上方；提示词选择框因为右侧多了禁用按钮而变短，两行宽度不一致，禁用按钮也和提示词框不在同一水平线。',
    cause: '模型行使用单列布局，提示词行使用“选择框 + 禁用按钮”双列布局；同时禁用按钮没有按浮动标签选择框的顶部留白对齐。',
    solution: '有禁用按钮的区域里，模型行也使用同样的双列网格，但右侧只放空占位；禁用按钮增加顶部偏移并改为与选择框边框同高。',
    prevention: '以后模型/提示词成对出现且提示词右侧有独立操作按钮时，模型行也要保留同宽右侧占位，保证两行选择框宽度和左边文字起点一致。',
    keywords: ['模型', '提示词', '禁用按钮', '管理按钮', '对齐', 'CapsuleSelect'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-action-button-offset-001',
    title: '模型/提示词选择框的管理按钮下沉歪斜',
    area: '全局模型管理 / 提示词管理 / CapsuleSelect',
    symptom: '带“模型”“提示词”嵌入标签的选择框里，右侧“管理”按钮背景没有贴满整个右侧圆角区域，看起来比外框矮一截并向下偏。',
    cause: 'CapsuleSelect 使用 fieldset + legend 做边框嵌入标签后，管理按钮仍放在 legend 下方的内容行里，按钮高度只跟内容行对齐，没有跟整个 fieldset 外框对齐。',
    solution: '带 actionLabel 的 CapsuleSelect 不再使用 fieldset/legend，改为普通相对定位边框容器；嵌入标签用 absolute 压在边框上，管理按钮在真实边框高度内 absolute inset-y-0 right-0 铺满，并给左侧选择区域预留 pr-12。',
    prevention: '以后在带嵌入标签的复合选择框里做右侧固定操作区时，不要依赖 fieldset/legend 的默认布局；固定操作区应相对真实边框容器定位，内容区单独预留宽度。',
    keywords: ['CapsuleSelect', '管理按钮', 'fieldset', 'legend', '模型选择框', '提示词选择框', '对齐'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-floating-label-stacked-001',
    title: '模型提示词选择框标签和内容上下堆叠',
    area: '全局模型/提示词选择框 / CapsuleSelect',
    symptom: '带“模型”“提示词”边框标签的选择框变高，标签和当前选中内容看起来像上下两行，不够一体。',
    cause: '复合选择框固定使用 h-12，忽略调用方传入的 h-9/h-10/h-11；标签字号偏大，按钮内容没有显式垂直居中，管理按钮右侧定位也没有按真实高度统一。',
    solution: '复合选择框根据 buttonClassName 的高度选择真实外框高度；边框标签降为小号并与选中内容左边对齐；内容按钮改为 flex 垂直居中；管理按钮贴住真实右边界。',
    prevention: '以后调整 CapsuleSelect 的浮动标签时，必须同时检查高度、标签字号、选中内容起点、箭头和管理按钮的同一高度基准，避免只改标签背景造成整体错位。',
    keywords: ['CapsuleSelect', '浮动标签', '模型', '提示词', '上下堆叠', '管理按钮', '高度'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'panel-splitter-drag-stolen-by-modal-001',
    title: '大纲设定分割线拖拽失效',
    area: '大纲设定 / 细纲 / 概要 / 脑洞 / 面板分割线',
    symptom: '拖拽左右分割线时，面板宽度不变化，像是分割线没有反应。',
    cause: '全局弹窗拖拽托管会在捕获阶段接管弹窗内部的普通区域；另外脑洞页把左栏和预览栏做了更小的可视最大宽度，但拖拽计算仍从旧通用宽度开始，导致要拖很远才会有视觉变化。',
    solution: '给 WorkbenchLibraryPanel 的左侧、右侧、脑洞预览分割线补上 data-no-modal-drag，并在开始拖拽时 preventDefault + stopPropagation + stopImmediatePropagation；拖拽增量按 zoom 比例换算；脑洞页按当前可见宽度和脑洞自己的最大宽度计算。正文编辑页和剧本编辑器分割线也补同样隔离。',
    prevention: '以后新增弹窗内部分割线、拖拽条、滑块等交互区域时，必须标记 data-no-modal-drag，并在拖拽开始事件里阻止冒泡；如果布局对某个标签页有 min/max 二次限制，拖拽计算必须使用同一套可视 min/max。',
    keywords: ['大纲设定', '分割线', '拖拽失效', 'data-no-modal-drag', 'WorkbenchLibraryPanel', 'resize', 'zoom'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'model-prompt-floating-label-width-001',
    title: '模型和提示词选择框文字被外置标签挤压',
    area: '全局模型管理 / 提示词管理 / CapsuleSelect',
    symptom: '模型或提示词选择框左侧外置“模型”“提示词”标签占用宽度，窄栏里当前名称容易被截断；有禁用功能时更难一眼分清选择框和禁用按钮。',
    cause: '不同页面各自拼接标签、选择框、管理按钮和禁用按钮，布局规则不统一，导致右侧管理区和左侧标签同时挤占可用文本宽度。',
    solution: '在 CapsuleSelect 增加 floatingLabel，并让带管理按钮的选择框统一使用边框嵌入标签、独立箭头和窄管理按钮；有禁用能力的提示词继续把禁用/启用按钮放在选择框右侧。',
    prevention: '以后新增模型或提示词选择框时，统一复用 CapsuleSelect 的 floatingLabel + actionLabel，不再手写外置“模型/提示词”标签。',
    keywords: ['模型管理', '提示词管理', '选择框', 'CapsuleSelect', 'floatingLabel', '禁用按钮'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'modal-resize-jump-001',
    title: '输出日志弹窗缩放跳动、缩小不了',
    area: '作品编辑器 / 审核 / 点评 / 输出日志',
    symptom: '拖动弹窗边缘或右下角时，窗口会突然位移、放大，甚至大出屏幕后很难缩小。',
    cause: '页面手写 fixed 弹窗或内部 absolute 日志层，没有复用统一的 WorkbenchModal + useDraggableModal。还有一种情况是弹窗渲染在带 transform/zoom 的应用容器里，hook 按视口坐标写 fixed left/top/width/height，坐标系不一致就会在拖边时突然放大。',
    solution: '把独立弹窗迁移到 WorkbenchModal，或至少用 createPortal 渲染到 document.body，再接 useDraggableModal。拖拽时先把当前 DOM rect 固定成 left/top/width/height，并把尺寸夹在视口范围内。输出日志不要写在父弹窗内部 absolute 覆盖层里，优先改为独立 WorkbenchModal。遇到旧尺寸残留时换新的 storageId 或清理对应 xinyuexia_modal_position_* localStorage。',
    prevention: '以后新增可拖拽或可缩放弹窗，默认使用 WorkbenchModal 或 body portal。不要把可缩放 fixed 弹窗放在 transform/zoom 容器里，也不要在业务组件里重复写 fixed inset-0 + 手动 section 弹窗，除非只是不可缩放的轻提示。',
    keywords: ['弹窗', '输出日志', '缩放', '跳动', 'WorkbenchModal', 'useDraggableModal', 'createPortal', 'transform'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'utf8-bulk-replace-001',
    title: '中文文件批量替换后变成乱码',
    area: '全项目中文 TSX 文件',
    symptom: 'TypeScript 报大量 Unterminated string literal、File appears to be binary，页面中文显示乱码。',
    cause: '用 PowerShell Get-Content | Set-Content 对 UTF-8 中文文件做批量替换时，编码被错误重写。',
    solution: '先用 git 恢复被误伤文件，再用 apply_patch 做小范围修改。必要时先备份损坏文件，恢复后运行 npm.cmd run check 和 npm.cmd run build。',
    prevention: '不要用 PowerShell 管道批量改中文源码。优先使用 apply_patch；确实要脚本处理时，使用明确的 UTF-8 Node 脚本并立刻检查 diff。',
    keywords: ['编码', '乱码', 'PowerShell', 'UTF-8', 'apply_patch'],
    updatedAt: '2026-05-28',
  },
  {
    id: 'capsule-select-scaled-portal-001',
    title: '缩放弹窗里的下拉菜单偏位',
    area: '大纲设定 / 脑洞生成 / CapsuleSelect',
    symptom: '模型或提示词下拉展开后，菜单不贴着选择框，偏到左侧或被弹窗区域裁掉。',
    cause: '下拉层挂到带 transform/zoom/overflow 的缩放容器中，再把 getBoundingClientRect 的视口坐标换算成容器坐标。多层缩放或弹窗裁剪叠加后，坐标会二次偏移。',
    solution: 'CapsuleSelect 的下拉层统一 createPortal 到 document.body，并使用 fixed + getBoundingClientRect 的视口坐标定位。不要在缩放容器内再做相对坐标换算。',
    prevention: '以后做通用下拉、菜单、浮层，优先挂到 body 并用视口坐标定位；只有明确需要跟随局部滚动容器时才挂到局部容器。',
    keywords: ['下拉框', 'CapsuleSelect', '缩放', '弹窗', '定位', 'portal'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'maximized-window-drag-restore-001',
    title: '最大化窗口拖动无效',
    area: '桌面窗口 / 标题栏拖动',
    symptom: '窗口最大化后拖动标题栏没有反应，不能像常规软件一样先还原尺寸再拖动。',
    cause: '只用前端 pointermove + IPC 模拟拖动不够稳定。最大化窗口下 Windows/Electron 可能不持续派发 pointermove，或者退出最大化与 setBounds 的时序不同步，导致拖动看起来完全没生效。',
    solution: '标题栏空白区域使用 Electron 原生 -webkit-app-region: drag，让系统处理最大化还原拖动；标签页、测试按钮、UI库按钮、主题、比例、最小化、最大化、关闭等交互区域设置 -webkit-app-region: no-drag。自定义 IPC 拖动保留为非 Electron 或兜底逻辑。',
    prevention: '窗口标题栏拖动优先用 Electron 原生 drag region，不要把所有标题栏区域都设成 no-drag 后再完全依赖前端模拟。新增标题栏按钮或标签时必须放在 no-drag 区域。',
    keywords: ['最大化', '拖动', '标题栏', 'Electron', 'app-region', 'drag', 'no-drag'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'context-word-count-align-001',
    title: '关联上下文字数不对齐',
    area: '正文续写 / 关联上下文 / 章节列表',
    symptom: '正文和概要后的字数位数不同，导致单选项横向错位；右侧“概要 0 字”离滚动条太近，列表扫读时显得拥挤。',
    cause: '字数直接跟在“正文”“概要”后面渲染，没有给数字部分预留固定宽度；列表行右侧只使用普通 px-4 内边距，未给滚动条单独留出安全间距。',
    solution: '把字数拆成数字和“字”，数字使用 4ch 固定宽度、右对齐和 tabular-nums；右侧选择列加宽到 256px，并把行右内边距提高到 pr-10。',
    prevention: '同类统计数字出现在列表中时，先按常见最大位数预留固定字符宽度；带滚动条的列表右侧要额外预留空白，避免文字贴近滚动条。',
    keywords: ['关联上下文', '字数', '对齐', 'tabular-nums', '4ch', '滚动条', '右侧留白'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'modal-geometry-persistence-001',
    title: '部分弹窗不记忆大小和位置',
    area: '全局弹窗 / WorkbenchModal / 手写 fixed 弹窗',
    symptom: '部分弹窗关闭后再次打开会回到默认大小或默认位置，有些只能记住位置不能记住大小。',
    cause: '一部分手写弹窗接了 useDraggableModal 但没有 data-draggable-managed 和缩放手柄，导致全局弹窗托管与 hook 可能同时接管；另一部分 WorkbenchModal 依赖标题生成存储 key，标题变化时会丢失旧位置。',
    solution: '抽出 ModalResizeHandles 统一缩放手柄；已接 useDraggableModal 的手写弹窗统一标记 data-draggable-managed，并补齐相同的缩放手柄；主要 WorkbenchModal 增加稳定 storageId；全局弹窗托管增加无 header 弹窗的标题栏识别。',
    prevention: '以后新增可拖拽弹窗时优先使用 WorkbenchModal 并显式传 storageId；必须手写 fixed 弹窗时，若使用 useDraggableModal 就同时加 data-draggable-managed、relative 容器和 ModalResizeHandles。',
    keywords: ['弹窗', '记忆位置', '记忆大小', 'storageId', 'useDraggableModal', 'ModalResizeHandles'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'brainstorm-prompt-select-truncated-001',
    title: '脑洞生成提示词显示不全',
    area: '大纲设定 / 脑洞生成 / 模型和提示词选择框',
    symptom: '提示词选择框里只显示前一两个字，右侧管理和禁用按钮挤占空间，用户无法看清当前提示词。',
    cause: '脑洞右侧栏被限制到 300px，选择行还预留了 64px 禁用列和较大的列间距，CapsuleSelect 内部管理按钮继续占用选择框宽度。',
    solution: '脑洞右侧栏最低宽度提高到 340px、上限提高到 380px；模型/提示词行改成更紧凑的 44px 标签列和 52px 禁用列，列间距缩小；管理按钮宽度缩小到 44px。',
    prevention: '以后在窄侧栏里放选择框和操作按钮时，先按实际中文名称长度检查可用文字宽度，不要只看控件总宽。',
    keywords: ['脑洞生成', '提示词', '显示不全', 'CapsuleSelect', '禁用按钮', '管理按钮'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'review-modal-drag-unmaximizes-window-001',
    title: '审核弹窗拖动时带动软件窗口',
    area: '作品编辑器 / 审核点评弹窗 / 最大化窗口拖动',
    symptom: '软件最大化时打开审核弹窗，拖动审核弹窗会让软件窗口退出最大化，并且弹窗拖动时软件窗口也跟着移动。',
    cause: '窗口标题栏使用 Electron 原生 app-region: drag 后，覆盖到顶部区域的弹窗如果没有明确声明 app-region: no-drag，可能被系统命中为窗口拖拽区域。',
    solution: '审核点评弹窗的遮罩层、弹窗容器和弹窗标题栏统一设置 WebkitAppRegion: no-drag，弹窗本身仍使用 useDraggableModal 处理内部拖拽。',
    prevention: '所有覆盖标题栏或可能靠近顶部的可拖拽弹窗，都要显式设置 app-region: no-drag，避免和软件窗口最大化拖拽逻辑混在一起。',
    keywords: ['审核', '点评', '最大化', '拖动', 'app-region', 'no-drag', 'useDraggableModal'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-preview-title-overflow-001',
    title: '细纲预览标题重复导致显示不全',
    area: '作品信息 / 细纲预览 / 边框嵌入标签',
    symptom: '细纲预览区域已经在边框中显示“第X章细纲（第X卷）”，外层仍然显示“细纲预览”，导致顶部空间拥挤并出现显示不全。',
    cause: '细纲页复用了概要预览的外层标题，同时又新增了边框嵌入标签，两个标题表达的是同一层级信息。',
    solution: '细纲页和章节概要页都隐藏外层 outlinePreviewTitle，只保留边框嵌入的章节标签；卷概要由自身卡片标题表达。',
    prevention: '以后给输入框或预览框增加边框嵌入标签时，先检查外层标题是否重复；若标签已承担标题作用，应移除外层标题避免挤占空间。',
    keywords: ['细纲预览', '章节概要', '显示不全', '边框标签', 'outlinePreviewTitle', 'detail outline'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-frame-label-clipped-001',
    title: '细纲边框标签顶部被裁切',
    area: '作品信息 / 细纲预览 / 边框嵌入标签',
    symptom: '细纲预览第一张卡片的“第X章细纲（第X卷）”贴在滚动区顶部，标签上半部分被 overflow 容器裁掉，看起来显示不全。',
    cause: '外层“细纲预览”标题隐藏后，滚动区顶部没有为边框标签的向上偏移预留空间。',
    solution: '细纲页的预览滚动区增加顶部内边距，让第一个边框标签完整显示。',
    prevention: '带边框嵌入标签的首个卡片放进 overflow 容器时，要给容器顶部留出标签外溢空间。',
    keywords: ['细纲', '边框标签', '显示不全', 'overflow', 'padding top'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'summary-preview-title-duplicate-001',
    title: '章节概要中间标题重复且边框标签顶线',
    area: '作品信息 / 章节概要 / 边框嵌入标签',
    symptom: '章节概要弹窗中间预览区上方又显示一行“章节概要”，下方卡片已经用边框标签显示“第X章概要（第X卷）”，两层标题挤在一起。',
    cause: '概要预览复用了外层 outlinePreviewTitle 标题，同时卡片标题已经嵌入边框；删除外层标题后如果不补顶部内边距，第一张卡片的边框标签会贴到滚动区顶部。',
    solution: '章节概要/细纲预览中间栏统一不渲染外层预览标题，只保留卡片边框标签；滚动区顶部固定留出边框标签空间。',
    prevention: '带边框嵌入标题的列表型预览，不再额外加同名外层标题；首个卡片在 overflow 容器里必须给顶部标签留白。',
    keywords: ['章节概要', '边框标签', '标题重复', 'outlinePreviewTitle', 'padding top'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-empty-card-height-001',
    title: '细纲空内容卡片过高',
    area: '作品信息 / 细纲预览 / 章节细纲卡片',
    symptom: '细纲预览里没有内容的章节卡片仍然占用完整高度，一屏只能看到很少章节。',
    cause: '章节细纲 textarea 固定使用 h-[260px]，不区分空内容、短内容和长内容；滚动条也使用常规编辑器滚动条，空内容时视觉上显得很重。',
    solution: '细纲卡片空内容高度改为原来一半；有内容时按估算行数撑开，最高仍为原来的 260px；超过高度后在 textarea 内部滚动，并复用 scrollbar-scroll-only，平时隐藏滚动条，滚动时短暂显示滑块。',
    prevention: '列表型大文本卡片不要默认占满最大高度；应按内容量设置 min/max 高度，长内容内部滚动，滚动条默认隐藏以减少空白区域的视觉重量。',
    keywords: ['细纲', '空内容', '高度', 'textarea', 'scrollbar-scroll-only', '滚动条'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'context-radio-word-gap-001',
    title: '关联上下文字数和单位间距分离',
    area: '正文续写 / 关联上下文 / 正文概要选择列',
    symptom: '正文和概要后面的数字与“字”之间距离偏大，左右两组选择项也显得太挤。',
    cause: '正文/概要选择列宽度预留不足，数字列和单位列之间使用了较大的统一 gap。',
    solution: '扩大右侧正文/概要选择列，并把数字列和“字”单位列的间隔缩小。',
    prevention: '短单位统计建议把数字列和单位列拆开但使用更小 gap，同时给左右两组控件预留足够列宽。',
    keywords: ['关联上下文', '字数', '正文', '概要', '间距', '列宽'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'titlebar-native-drag-single-path-001',
    title: '标题栏拖动同时走原生拖动和 IPC 模拟拖动',
    area: '桌面窗口 / 最大化拖动 / AppFrame / Electron 主进程',
    symptom: '最大化后拖动标题栏不稳定，拖动弹窗时也可能牵动主窗口退出最大化。',
    cause: '标题栏已经使用 -webkit-app-region: drag，但 AppFrame 仍监听 pointer 事件并通过 IPC 调 main 进程 setBounds 模拟拖动，两套拖动路径会互相抢事件和状态。',
    solution: '标题栏拖动只保留 Electron 原生 drag region；删除前端 begin/move/end titlebar drag 调用、preload 暴露和主进程 IPC handler。按钮、标签页等可点击区域继续使用 no-drag。',
    prevention: '标题栏拖动优先使用 Electron 原生 drag region。除非明确要兼容非 Electron 环境，否则不要再叠加 pointer + IPC 的窗口移动实现。',
    keywords: ['标题栏', '最大化', '拖动', 'IPC', 'app-region', 'setBounds', 'Electron'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'postgres-data-tracked-runtime-001',
    title: 'PostgreSQL 运行数据目录被 Git 跟踪',
    area: '版本库 / 数据库 / shujuku/postgres-data',
    symptom: '工作区经常出现 pg_control、pg_wal、pg_internal.init 等数据库运行文件变动，提交体积变大。',
    cause: 'shujuku/postgres-data 是本地运行时数据目录，但曾被加入 Git 索引，后续 .gitignore 也无法自动停止跟踪已入库文件。',
    solution: '在 .gitignore 忽略 shujuku/postgres-data/**，并用 git rm --cached 从索引移除该目录，保留本地真实数据库文件不删除。',
    prevention: '数据库数据目录、日志、构建产物一旦误入库，必须同时补 .gitignore 和 git rm --cached；只改 .gitignore 不会影响已跟踪文件。',
    keywords: ['PostgreSQL', 'postgres-data', 'git rm --cached', '运行时数据', 'pg_wal', 'pg_control'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-clear-new-session-no-index-001',
    title: '正文续写清空后不是完整新上下文',
    area: '正文续写 / AI 会话 / 清空按钮',
    symptom: '点击清空后看起来像把当前内容清掉了，仍显示 1 号会话，不像真正新开一块空白输入区。',
    cause: 'resetSessions 固定创建 id=1 的默认会话，单会话状态也渲染序号按钮；外部关联上下文和上一次输出日志没有一起断开。',
    solution: '清空改为使用下一个会话 id 创建新的空会话，不继承输入、输出、消息、关联状态、外部关联上下文和上一次请求日志；只有一个空白会话时隐藏会话序号按钮。',
    prevention: '类似“黑板擦”的清空语义应表达为完整新上下文，不要重用可见会话序号，也不要保留父级关联上下文或上一轮日志。',
    keywords: ['清空', '新会话', '正文续写', '会话序号', '上下文', '输出日志'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'error-log-route-missing-001',
    title: '错误日志有页面但没有入口',
    area: '测试集合 / 错误日志 / 路由',
    symptom: '代码里已经有错误日志内容，但用户从测试集合和正式路由都找不到错误日志页面。',
    cause: 'ErrorLogPage 只创建了组件，没有挂到 App 路由，也没有加入 TestCollectionPage 的测试分组。',
    solution: '新增 /error-log 路由，并在测试集合中加入“错误日志”入口，默认记录和用户自定义记录继续合并显示。',
    prevention: '新增排查类页面时，组件、路由、入口三者要一起提交，否则用户会以为功能没有做。',
    keywords: ['错误日志', 'ErrorLogPage', '路由', '测试集合', '入口'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'webview-popup-hardening-001',
    title: '内置 webview 允许任意弹窗且类型为 any',
    area: '内置浏览器 / 剧本浏览器 / Electron 安全',
    symptom: 'webview 使用 allowpopups，主窗口 window.open 会直接 openExternal，webviewRef 使用 any，安全和类型边界都偏松。',
    cause: '内置浏览器为了方便打开网页保留了宽松默认值，没有限制外部 URL 协议，也没有给 Electron webview 补专用类型。',
    solution: '移除 webview 的 allowpopups；主进程只允许 http、https、mailto 外部打开；补 ElectronWebviewElement 类型替代 useRef<any>。',
    prevention: '嵌入第三方网页时默认关闭弹窗能力，并限制外部打开协议；需要新能力时再按白名单放开。',
    keywords: ['webview', 'allowpopups', 'openExternal', 'Electron', '安全', 'any'],
    updatedAt: '2026-05-29',
  },
];

function readSavedEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEntries;
    const saved = JSON.parse(raw) as ErrorLogEntry[];
    const savedIds = new Set(saved.map((entry) => entry.id));
    return [...defaultEntries.filter((entry) => !savedIds.has(entry.id)), ...saved];
  } catch {
    return defaultEntries;
  }
}

function saveEntries(entries: ErrorLogEntry[]) {
  const customEntries = entries.filter((entry) => !defaultEntries.some((item) => item.id === entry.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customEntries));
}

export function ErrorLogPage() {
  const [entries, setEntries] = useState<ErrorLogEntry[]>(readSavedEntries);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({
    title: '',
    area: '',
    symptom: '',
    cause: '',
    solution: '',
    prevention: '',
    keywords: '',
  });

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return entries;
    return entries.filter((entry) => (
      [
        entry.title,
        entry.area,
        entry.symptom,
        entry.cause,
        entry.solution,
        entry.prevention,
        entry.keywords.join(' '),
      ].join(' ').toLowerCase().includes(keyword)
    ));
  }, [entries, search]);

  const addEntry = () => {
    if (!draft.title.trim() || !draft.solution.trim()) return;
    const nextEntry: ErrorLogEntry = {
      id: `custom-${Date.now()}`,
      title: draft.title.trim(),
      area: draft.area.trim() || '未分类',
      symptom: draft.symptom.trim() || '未记录',
      cause: draft.cause.trim() || '待排查',
      solution: draft.solution.trim(),
      prevention: draft.prevention.trim() || '后续补充',
      keywords: draft.keywords.split(/[,\s，、]+/).map((item) => item.trim()).filter(Boolean),
      updatedAt: new Date().toLocaleDateString('zh-CN'),
    };
    setEntries((current) => {
      const next = [nextEntry, ...current];
      saveEntries(next);
      return next;
    });
    setDraft({ title: '', area: '', symptom: '', cause: '', solution: '', prevention: '', keywords: '' });
  };

  const deleteEntry = (id: string) => {
    if (defaultEntries.some((entry) => entry.id === id)) return;
    setEntries((current) => {
      const next = current.filter((entry) => entry.id !== id);
      saveEntries(next);
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4">
        <div>
          <div className="text-sm font-black text-[#08AACE]">Error Log</div>
          <h1 className="mt-1 text-2xl font-black text-slate-950">错误日志</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">记录软件里出现过的问题、原因和修复办法，后续遇到同类问题先从这里查。</p>
        </div>
        <div className="relative w-[320px] max-w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索问题、位置、关键词"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-bold text-slate-700 outline-none transition-colors focus:border-[#08AACE] focus:bg-white"
          />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-4 p-5">
        <section className="editor-scrollbar min-h-0 overflow-y-auto pr-1">
          <div className="grid gap-4">
            {filteredEntries.map((entry) => {
              const isDefault = defaultEntries.some((item) => item.id === entry.id);
              return (
                <article key={entry.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#08AACE]" />
                        <h2 className="truncate text-lg font-black text-slate-950">{entry.title}</h2>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{entry.area}</span>
                        <span>{entry.updatedAt}</span>
                        {isDefault && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[#08AACE]">内置</span>}
                      </div>
                    </div>
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
                        title="删除记录"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 p-5 text-sm leading-6">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="mb-1 text-xs font-black text-slate-400">现象</div>
                      <p className="text-slate-700">{entry.symptom}</p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl bg-amber-50 p-3">
                        <div className="mb-1 text-xs font-black text-amber-600">原因</div>
                        <p className="text-slate-700">{entry.cause}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <div className="mb-1 text-xs font-black text-emerald-600">解决办法</div>
                        <p className="text-slate-700">{entry.solution}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3">
                      <div className="mb-1 text-xs font-black text-slate-400">以后避免</div>
                      <p className="text-slate-700">{entry.prevention}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">{keyword}</span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="min-h-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#08AACE]" />
            <h2 className="text-base font-black text-slate-950">新增记录</h2>
          </div>
          <div className="mt-4 space-y-3">
            {([
              ['title', '问题标题'],
              ['area', '出现位置'],
              ['symptom', '现象'],
              ['cause', '原因'],
              ['solution', '解决办法'],
              ['prevention', '以后避免'],
              ['keywords', '关键词，用逗号分隔'],
            ] as const).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-black text-slate-400">{label}</span>
                {key === 'title' || key === 'area' || key === 'keywords' ? (
                  <input
                    value={draft[key]}
                    onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-[#08AACE] focus:bg-white"
                  />
                ) : (
                  <textarea
                    value={draft[key]}
                    onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                    className="editor-scrollbar h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none focus:border-[#08AACE] focus:bg-white"
                  />
                )}
              </label>
            ))}
            <button
              type="button"
              onClick={addEntry}
              disabled={!draft.title.trim() || !draft.solution.trim()}
              className="h-11 w-full rounded-xl bg-[#08AACE] text-sm font-black text-white hover:bg-[#0695B5] disabled:bg-slate-300"
            >
              保存到错误日志
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ErrorLogPage;
