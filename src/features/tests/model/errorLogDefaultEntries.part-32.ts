import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart32: ErrorLogEntry[] = [
  {
    id: 'select-floating-label-test-label-clipped-001',
    title: '第04号测试选择框边框标签被裁切',
    area: '测试集合 / 04号测试 / 选择框边框标签测试',
    symptom: '选择框边框标签测试里，“模型”“提示词”等嵌入边框的标签文字被上方裁掉，看起来像字被遮住。',
    cause:
      '测试用 FloatingLabelSelectMock 把外层边框容器设置为 overflow-hidden，但标签是 absolute 放在边框线上并向上偏移，超出容器的上半部分被裁切。',
    solution:
      '外层边框容器改为 overflow-visible，让边框标签可以完整露出；内部按钮行单独保留 overflow-hidden 和圆角，继续裁切按钮背景和管理按钮区域。',
    prevention:
      '边框嵌入标签控件的外层不能直接 overflow-hidden；需要裁切内部内容时，应把裁切放到内部内容层，避免标签、字数统计、边框工具被截断。',
    keywords: ['04号测试', '选择框边框标签测试', 'FloatingLabelSelectMock', 'overflow-hidden', '标签裁切'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'test-collection-numbered-ui-first-001',
    title: '测试集合缺少稳定编号且 UI 库入口不在第一位',
    area: '测试集合 / 测试入口 / 编号',
    symptom:
      '测试集合里每个测试没有数字编号，后续沟通只能按名称描述；UI库测试在第二组里，不在第一行第一位，用户需要先找入口。',
    cause:
      '测试集合只按分组和标题渲染卡片，没有从全量测试顺序生成稳定编号；AI 链路测试组排在最前，导致 UI库无法取代第一张卡片。',
    solution:
      '把 UI 与主题分组移动到第一组，并让 UI库成为 01 号测试；按全量测试列表顺序生成两位数字编号，卡片和打开后的测试标题都显示编号，搜索也支持按编号匹配。',
    prevention:
      '以后新增测试时需要确认其编号位置，并在回复用户时说明“第 X 号测试”；测试集合的展示顺序变化要同步考虑编号稳定性。',
    keywords: ['测试集合', 'UI库', '编号', '01号测试', 'TestCollectionPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-escape-go-home-fallback-001',
    title: '作品编辑器 Esc 没有关闭对象时缺少回首页兜底',
    area: '作品编辑器 / 快捷键 / Esc',
    symptom:
      '在作品编辑器页面按 Esc 时，如果当前没有弹窗或侧边浮层可以关闭，页面没有进一步反馈；用户希望这时直接跳回首页。',
    cause:
      'Esc 只作为 close_floating 快捷键派发给页面内浮层关闭逻辑，WorkbenchPage 只关闭回收站和普通弹窗，没有处理“没有可关闭对象”的空状态。',
    solution:
      '扩展 WorkbenchPage 的 close_floating 处理：先关闭快速导航、回收站、导出、查找、编辑设置、管理弹窗、关联章节和发布确认等可关闭层；如果都没有打开，则跳转到 /dashboard。',
    prevention:
      '全局 Esc 快捷键需要区分两层语义：有浮层时关闭最上层浮层，没有浮层时执行页面级兜底动作；新增浮层时要同步纳入页面 close_floating 判断。',
    keywords: ['Esc', '作品编辑器', '首页', 'close_floating', '快捷键', 'WorkbenchPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'symbol-replace-toolbar-order-001',
    title: '一键替换组合按钮顺序反了',
    area: '作品编辑器 / 正文工具栏 / 一键替换',
    symptom:
      '一键替换组合按钮从左到右显示为齿轮、开关、一键替换，和操作阅读顺序相反；用户期望一键替换在最左边，设置齿轮在最右边。',
    cause: '组合按钮在增加设置入口时按“设置、开关、执行”的内部实现顺序渲染，没有按工具栏用户操作顺序排列。',
    solution:
      '把一键替换组合按钮调整为“一键替换 / 开关 / 齿轮设置”，并复用分段按钮边框衔接方式，避免独立分隔线造成视觉杂点。',
    prevention:
      '工具栏组合按钮优先按用户动作顺序排列：主动作在左，状态开关居中，设置入口在右；不要按代码实现或配置入口优先级排列。',
    keywords: ['一键替换', '齿轮', '开关', '按钮顺序', '正文工具栏', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-toolbar-split-button-shadow-001',
    title: '章节工具栏组合按钮中间出现模糊阴影',
    area: '作品编辑器 / 顶部章节工具栏 / 组合按钮',
    symptom:
      '复制/优化组合按钮中间出现一块模糊的白色阴影，看起来像两个按钮没有干净衔接；审核、点评、状态三段按钮的视觉样式也不统一。',
    cause:
      '组合按钮中间使用独立的竖线 div 作为分隔，在浅底按钮和蓝底按钮交界处会产生额外背景层和抗锯齿痕迹；审核、点评仍是描边样式，状态是蓝底样式。',
    solution:
      '删除组合按钮内部独立分隔线，改为按钮自身 border-l 形成硬边界；审核、点评、状态统一为蓝底白字分段按钮，三段复用同一套高度、圆角和 hover 样式。',
    prevention:
      '以后分段按钮不要在按钮之间插入独立背景节点做分隔，优先使用相邻按钮的 border-l 或 divide 规则；同一组同层级操作需要共用同一视觉状态。',
    keywords: ['章节工具栏', '组合按钮', '复制', '优化', '审核', '点评', '状态', '阴影', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-context-menu-edit-action-001',
    title: '章节右键菜单缺少修改入口',
    area: '作品编辑器 / 章节侧栏 / 右键菜单',
    symptom: '右键点击章节时，弹出的菜单只有发布或删除等操作，没有直接进入修改当前章节的入口。',
    cause: '章节侧栏和已发布侧栏的右键菜单只覆盖发布、撤回、删除这类状态操作，没有把“选择并编辑章节”作为显式菜单项。',
    solution:
      '在未发布章节和已发布章节右键菜单顶部新增“修改章节”，点击后调用章节选择逻辑并关闭菜单，让正文编辑区切到该章节。',
    prevention:
      '章节列表的右键菜单应包含最常用的对象操作：修改、发布/撤回、删除；新增菜单项时未发布和已发布列表需要保持一致。',
    keywords: ['章节右键', '修改章节', 'ChapterSidebar', 'PublishedSidebar', '右键菜单'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'software-ui-manual-upload-merged-nav-001',
    title: 'UI库软件 UI 和手动上传拆成两个入口',
    area: 'UI库 / 软件 UI / 手动上传 / 编号导航',
    symptom:
      'UI库里“软件 UI”和“手动上传”分成两个 Tab，查找 UI 编号时需要在两个入口之间切换，左侧编号导航也没有一个可折叠的统一 UI 分类。',
    cause: '手动上传的 UI 样式按来源单独成页，软件内置 UI 按标准样式成页，导航只按当前 Tab 扁平列出编号。',
    solution:
      '把手动上传内容合并到 UI Tab，顶部 Tab 改为 UI / 技术词典 / 收藏；左侧编号导航增加可折叠的顶层分类，UI 编号统一收进“UI”分类。',
    prevention:
      'UI库应按用户查找目标组织，而不是按来源拆入口；同类 UI 编号进入同一顶层导航分类，再用小分组表达来源或类型。',
    keywords: ['UI库', '软件UI', '手动上传', '编号导航', '折叠', 'SoftwareUiCatalogPage'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-ai-chat-tools-overlap-top-001',
    title: '正文续写 AI 对话框边框工具和上方区域挤压',
    area: '正文续写 / AI 对话框 / 会话按钮',
    symptom:
      'AI 对话框的边框标签贴近上方模型/提示词选择区，“AI对话框”文案占住左上角，+、删除、清空都挤在右上角，并且单个空会话时不显示 1 号会话按钮。',
    cause:
      '会话工具被统一放在右上 xy-floating-edge-tool，左上仍保留标题标签；之前为了“清空像黑板擦”隐藏了单空会话序号，但现在会话切换需要始终显示当前序号。',
    solution:
      '删除 AI 对话框边框标签，把左上角改为会话控制区，始终显示 + 和当前会话序号；右上角只保留删除/清空；聊天框上边距从 mt-3 增加到 mt-5。',
    prevention:
      '边框嵌入工具同时存在左上和右上操作时，应拆成左右两个工具区，并预留顶部间距；会话型 UI 不要隐藏当前会话序号。',
    keywords: ['正文续写', 'AI对话框', '会话按钮', '1号会话', '加号', '边框工具', '间距'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'test-nav-reclick-return-index-001',
    title: '测试导航在测试内容页不能返回测试总页',
    area: '测试集合 / 左侧导航 / TestCollectionPage',
    symptom:
      '在“测试”总页点击某个测试内容进入内嵌测试页面后，再点击左侧导航里的“测试”没有回到测试总页，只能点左上角返回。',
    cause:
      '测试内容是在 TestCollectionPage 内部通过 activePath 切换的，浏览器路由仍是 /test-collection；左侧导航再次跳到同一路由时不会重置组件内部状态。',
    solution:
      '新增 TEST_COLLECTION_SHOW_INDEX_EVENT，TestCollectionPage 监听该事件并清空 activePath；左侧导航点击当前 /test-collection 时派发事件，让“测试”导航成为返回测试总页入口。',
    prevention:
      '同一路由内的子页面切换如果需要被外部导航重置，应提供显式事件或状态入口，不要只依赖 React Router 重新挂载。',
    keywords: ['测试', '测试内容', '测试总页', '左侧导航', 'TestCollectionPage', 'activePath'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-ai-chat-u141-toolbar-001',
    title: '正文续写会话工具条没有融入 AI 对话框边框',
    area: '正文续写 / AI 对话框 / 会话工具条',
    symptom:
      '聊天区域上方有独立的胶囊工具条，新增会话、序号、删除、清空和下方聊天框分成两层，视觉上不够像 UI141 的边框嵌入工具。',
    cause: '会话工具条单独渲染在模型/提示词配置区下方，聊天记录框仍是普通灰底边框，字数统计也使用独立浮层样式。',
    solution:
      '移除独立工具条，把聊天记录框改为 xy-floating-outline-fixed + xy-floating-rich-preview，并将新增会话、序号、删除、清空收进 xy-floating-edge-tool 右上角边框工具，字数统计复用 xy-floating-count。',
    prevention:
      '需要套用 UI141 的大文本区域，应优先复用 xy-floating-field、xy-floating-edge-tool 和 xy-floating-count，不要再额外放一整行独立工具条。',
    keywords: ['正文续写', 'AI对话框', 'UI141', 'xy-floating-edge-tool', '会话工具条', '字数统计'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'floating-count-capsule-to-border-text-001',
    title: '边框字数统计看起来像浮动胶囊',
    area: '全局边框输入框 / 字数统计',
    symptom: '部分输入框右下角的“0字”字数统计留白偏大，看起来像一个浮动小胶囊，而不是嵌入边框的文字。',
    cause: 'xy-floating-count 的左右 padding 和 line-height 偏大，白底遮罩区域视觉上过厚。',
    solution:
      '缩小 xy-floating-count 的左右留白和行高，去掉圆角和阴影，并微调 right 位置，让字数统计更像贴在边框上的纯文本。',
    prevention:
      '边框嵌入式辅助信息只保留文字和必要遮罩，不要使用过大的 padding、圆角或阴影，否则会从边框标签变成独立徽标。',
    keywords: ['字数统计', '0字', '边框嵌入', 'xy-floating-count', '胶囊'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-category-select-floating-label-001',
    title: '角色详情分类选择框标签外置不统一',
    area: '作品信息 / 角色库 / 角色详情',
    symptom: '角色详情里的“分类”文字放在选择框外侧，和模型、提示词这类边框嵌入标签选择框不一致，视觉上像两套控件。',
    cause: '分类字段使用外置 label + CapsuleSelect 的普通模式，没有启用 CapsuleSelect 的 floatingLabel。',
    solution:
      '移除外置“分类”文字，把分类选择框改为 CapsuleSelect floatingLabel=分类，复用模型/提示词选择框的边框嵌入标签方式。',
    prevention:
      '角色详情里的选择框字段应优先复用 CapsuleSelect floatingLabel，避免同一行短字段出现外置标签和嵌入标签混用。',
    keywords: ['角色详情', '分类', 'CapsuleSelect', 'floatingLabel', '模型提示词选择框'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'role-detail-name-input-too-tall-001',
    title: '角色详情里的角色名输入框过高',
    area: '作品信息 / 角色库 / 角色详情',
    symptom: '角色详情里的“角色名”输入框比左侧搜索角色输入框高很多，显得臃肿，占用顶部空间。',
    cause:
      '详情区角色名只使用 xy-floating-outline-fixed，默认 input 高度为 66px；搜索角色使用了 xy-floating-outline-role-compact，高度为 44px。',
    solution:
      '给详情区角色名输入框补上 xy-floating-outline-compact 和 xy-floating-outline-role-compact，使高度、圆角和字号与搜索角色一致。',
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
    solution:
      '在测试页新增“禁用图标嵌入选中内容左侧”方案，把禁用圆圈放进选择框内部、选中内容左侧，点击图标复用原禁用切换逻辑。',
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
    solution:
      '把 AI 输出区域改为 xy-floating-outline-fixed，并将标签文案改为“AI对话框”，复用设定预览的边框嵌入标签技术。',
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
    solution:
      '缩窄带管理按钮选择框的箭头热区，h-9/h-10/h-11 使用 w-6，h-12 使用 w-7，让箭头靠近管理按钮并给文本释放空间，同时保留不贴到三角的间距。',
    prevention: '复合选择框里右侧图标热区不应默认过宽；需要同时检查文字截断、箭头安全距离和管理按钮可点击范围。',
    keywords: ['CapsuleSelect', '箭头', '管理按钮', '模型选择框', '提示词选择框', '内容截断'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'smart-import-settings-duplicates-001',
    title: '智能导入设定重复点击会生成重复设定',
    area: '作品信息 / 大纲设定 / 智能导入设定',
    symptom:
      '智能导入设定后，如果再次点击同一个按钮，会按同一份 AI 输出再次生成同名同分类设定，列表里出现重复的世界观、核心爽点、主角金手指等条目。',
    cause: '智能导入逻辑每次都把解析出的片段直接新增到设定列表前面，没有按分类和设定名检查已有条目。',
    solution:
      '导入时按“分类 + 设定名”查找已有设定；已存在且内容相同则复用旧条目，内容不同则更新旧条目，不存在时才新增。',
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
    solution:
      '仅在大纲生成 activeTab 下，把模型和提示词选择框外层宽度固定为父区域的 60%；其他脑洞、细纲、概要等区域保持原布局。',
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
    solution:
      '把更新状态并入审核/点评组合按钮，形成“审核 / 点评 / 状态”三段按钮，状态段保留品牌色强调并复用原 openStatusUpdate 逻辑。',
    prevention: '同一工具栏里连续的同级短操作优先合成分段按钮，动作文案保留核心词，减少横向挤压。',
    keywords: ['审核', '点评', '状态', '更新状态', '组合按钮', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-header-serial-width-001',
    title: '章节定位栏卷名和章节之间留出多余分隔区',
    area: '作品编辑器 / 顶部章节定位条',
    symptom:
      '顶部“第一卷 / 第1章”区域里，卷名和章节之间仍有一个分隔点或空白区，两个胶囊没有衔接起来；章节数字只有一位时也曾预留过宽。',
    cause:
      '章节序号 input 最初固定使用 w-8，后来虽然改为 ch 自适应，但卷名胶囊和章节胶囊之间仍保留了独立分隔符和父级 gap。',
    solution:
      '章节序号 input 继续按 String(serialValue).length 计算 ch 宽度；删除卷名和章节之间的分隔符，卷名胶囊去掉右边框，章节胶囊用负 margin 接上，形成连续区域。',
    prevention:
      '顶部短定位控件应按视觉组处理：属于同一定位信息的卷名和章节不要再插入独立点号或占位分隔区，只在章节与标题这类不同对象之间保留间隔。',
    keywords: ['章节序号', '第一卷', '第1章', '输入框宽度', '分隔符', '衔接', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-title-actions-split-button-001',
    title: '章节标题复制和优化按钮占用过宽',
    area: '作品编辑器 / 章节标题工具栏',
    symptom: '复制标题和标题优化作为两个独立按钮横向占位偏大，标题两个字重复出现，挤压右侧审核、点评等工具按钮。',
    cause: '同一对象的相邻操作被拆成两个完整按钮，文本也重复带“标题”上下文，导致工具栏信息密度不够。',
    solution:
      '把复制标题和标题优化合并为分段组合按钮，左侧为“复制”，右侧为“优化”，保留各自点击逻辑并去掉重复的“标题”文字。',
    prevention: '同一对象上的连续短操作优先使用分段组合按钮，按钮文案只保留动作，不重复上下文名。',
    keywords: ['章节标题', '复制', '优化', '组合按钮', '工具栏', 'ChapterEditor'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-published-inner-splitter-001',
    title: '已发布展开后未发布和已发布之间没有拖拽分割线',
    area: '作品编辑器 / 章节侧栏 / 已发布栏',
    symptom:
      '展开已发布章节后，未发布栏和已发布栏之间只能看到普通边线，不能直接拖拽调整两栏宽度；外侧分割线也容易让人误以为是在调中间两栏。',
    cause: '章节侧栏原来只有一套 chapterSidebarWidth，已发布栏使用固定宽度，分割线只放在章节区域和正文编辑器之间。',
    solution:
      '给已发布栏增加独立宽度状态和本地记忆；在未发布栏与已发布栏之间新增红色悬停分割线用于调整未发布栏；已发布展开时，外侧分割线改为调整已发布栏宽度。',
    prevention:
      '以后同一区域出现两个并排侧栏时，每个可变宽栏都要有明确的宽度状态、存储 key 和对应分割线，避免一个拖拽手柄控制多个视觉边界。',
    keywords: ['章节侧栏', '已发布', '未发布', '拖拽分割线', '宽度记忆', 'PublishedSidebar'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-inline-action-local-dropdown-001',
    title: '带管理按钮的模型下拉框在缩放弹窗里仍然偏左',
    area: '大纲设定 / 细纲 / CapsuleSelect / 模型提示词选择框',
    symptom:
      '模型或提示词选择框展开后，下拉菜单仍然没有贴住选择框，而是偏到左侧，尤其在大纲设定、细纲这类缩放弹窗中明显。',
    cause:
      '带管理按钮的 CapsuleSelect 位于 body zoom 和面板 zoom 叠加的上下文里。即使修正了 viewport 边界夹取，portal 到 document.body 的 fixed 坐标仍然可能和触发控件所在的缩放坐标系不一致。',
    solution:
      '带 actionLabel 的 CapsuleSelect 不再把下拉菜单 portal 到 body，而是直接渲染为选择框自身下面的 absolute 下拉层，让下拉菜单和触发控件处在同一个缩放上下文；普通无管理按钮的选择框继续使用 body portal。',
    prevention:
      '以后带复合按钮的选择框如果固定出现在缩放弹窗内部，优先用本地 absolute 下拉层；只有不在缩放容器里且确实会被裁剪的普通浮层才使用 body portal + fixed 坐标。',
    keywords: [
      'CapsuleSelect',
      'actionLabel',
      '下拉框偏左',
      'zoom',
      'portal',
      'absolute',
      '模型选择框',
      '提示词选择框',
    ],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-arrow-hover-button-bg-001',
    title: '模型提示词选择框箭头悬停凸出成按钮',
    area: '全局模型/提示词选择框 / CapsuleSelect',
    symptom: '鼠标移到选择框右侧箭头上时，箭头区域出现一整块浅蓝背景，看起来像独立按钮从选择框里凸出来。',
    cause:
      'CapsuleSelect 的独立箭头热区使用了 hover:bg-sky-50，虽然可点击区域正确，但悬停背景会破坏整体选择框的一体感。',
    solution:
      '去掉箭头热区的 hover 背景，保留透明背景，只在 hover 时把箭头颜色变为品牌蓝；测试页 mock 同步改成相同效果。',
    prevention:
      '以后嵌入式图标热区如果属于同一个输入框或选择框，只改变图标颜色，不给整块区域加 hover 背景，除非设计明确需要分段按钮。',
    keywords: ['CapsuleSelect', '箭头', 'hover', '模型选择框', '提示词选择框', '管理按钮'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-body-zoom-clamp-001',
    title: '全局缩放下模型下拉框被错误推到左侧',
    area: '大纲设定 / CapsuleSelect / body zoom',
    symptom: '模型或提示词下拉框展开后没有贴着选择框左边，而是整体偏到左侧，遮住旁边内容。',
    cause:
      '页面 body 使用 zoom 后，window.innerWidth / documentElement.clientWidth 可能小于 getBoundingClientRect 得到的选择框可视 right。CapsuleSelect 为了防止下拉框越界，会用较小的 viewportWidth 夹住 left，误判为右侧越界并把菜单推到左侧。',
    solution:
      'CapsuleSelect 计算 viewportWidth 时取 window.innerWidth、documentElement.clientWidth 和 rect.right + 8 的最大值，确保已可见的选择框不会因为全局 zoom 被错误夹到左边。',
    prevention:
      '以后在全局 zoom 或 transform 场景里做浮层边界夹取时，不能只信 window.innerWidth；至少要把触发控件的 getBoundingClientRect 边界纳入视口计算。',
    keywords: ['CapsuleSelect', '下拉框', 'zoom', 'innerWidth', 'getBoundingClientRect', '定位偏移'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'chapter-editor-replacement-labels-001',
    title: '正文工具栏两个替换入口名称容易混淆',
    area: '作品编辑器 / 正文工具栏 / 词语高亮与文字替换',
    symptom:
      '工具栏同时显示“自动替换”和“一键替换”，但前者实际只负责标记并高亮指定词语，用户容易误以为两个入口都在修改正文。',
    cause:
      '高频词高亮入口沿用了替换语义命名，而真正的规则替换入口又使用了强调执行方式的“一键替换”，名称没有直接描述各自结果。',
    solution:
      '将只标记词语的入口改名为“词语高亮”，将按原文和替换文本规则处理正文的入口及弹窗改名为“文字替换”，自动模式提示同步改成“自动文字替换”。',
    prevention: '以后正文工具命名优先描述操作结果；只改变视觉标记的功能使用“高亮”，实际修改正文内容的功能使用“替换”。',
    keywords: ['正文', '词语高亮', '文字替换', '自动文字替换', 'ChapterWritingSurface', 'EditorReplaceTools'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'unified-ui-system-preview-test-001',
    title: '跨页面 UI 缺少统一规范预览',
    area: '测试板块 / UI 与主题 / 全软件统一 UI 预览',
    symptom:
      '作品库、资料库、提示词管理和模型管理分别使用不同的卡片、输入框、创建入口与空状态样式，直接修改正式页前缺少集中对照效果。',
    cause: '各功能页面在不同阶段独立迭代，没有一张测试页同时展示统一尺寸、颜色和交互状态。',
    solution:
      '在测试板块 UI 与主题分组末尾新增统一 UI 预览，集中展示 12px 卡片、浅灰输入框、青蓝主操作、红色危险操作、紧凑创建入口以及统一空状态。',
    prevention:
      '后续迁移跨页面视觉规范前，先在统一预览测试中确认组件效果，再逐页落地并删除已经完成使命的临时测试入口。',
    keywords: ['统一UI', '测试板块', '作品库', '资料库', '提示词管理', '模型管理', 'UnifiedUiSystemPreviewTestPage'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'unified-ui-preview-production-migration-001',
    title: '07号统一 UI 预览未迁入正式页面',
    area: '作品库 / 提示词管理 / 模型管理',
    symptom:
      '测试板块已经确认作品库、提示词管理和模型管理的统一卡片方案，但正式页面仍保留不同圆角、按钮颜色和创建卡规格。',
    cause: '统一方案先停留在测试预览，没有同步迁移到三个正式页面；新增模型卡与创建提示词卡仍使用不同高度和圆角。',
    solution:
      '作品库顶部信息卡统一为 12px 圆角并规范主操作与危险操作颜色；提示词卡和创建卡统一为 12px 圆角；模型卡、失败日志面板和新增模型卡统一为 12px 圆角，并让新增模型卡复用创建提示词卡的高度、虚线、品牌色和悬停效果。',
    prevention:
      '测试页方案确认迁入正式页面时，逐项核对尺寸、圆角、边框、颜色和交互函数，并用跨页面源码测试锁定要求相同的创建卡样式。',
    keywords: ['07号测试', '统一UI', '作品库', '提示词管理', '模型管理', '创建提示词', '新增模型'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'compact-library-form-focused-test-001',
    title: '统一 UI 综合测试缩放后看不清资料库紧凑表单',
    area: '测试板块 / 资料库紧凑行式表单',
    symptom: '旧 07 号测试同时缩放展示作品库、资料库、提示词和模型页面，资料库短字段的节省空间效果不够直观。',
    cause: '综合测试承担的场景过多，左右缩放复刻让表单控件变得过小，用户无法直接判断真实尺寸和可操作性。',
    solution:
      '删除旧统一 UI 综合测试的页面、专属测试、集合入口和渲染分支；新增独立的资料库紧凑行式表单测试，以正常尺寸展示短字段按内容宽度、标签同行、自动并排和长文本压缩高度。',
    prevention: '需要验证控件密度和实际占位时使用正常尺寸的单场景测试页，不再把多个完整页面缩小后放入同一个对照测试。',
    keywords: ['资料库', '紧凑行式', '正常尺寸', '测试板块', 'CompactLibraryFormTestPage', '删除07号测试'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'compact-library-form-production-branch-001',
    title: '资料库紧凑行式测试未迁入正式脑洞生成表单',
    area: '资料库 / 构思库 / 脑洞生成 / 表单分支',
    symptom: '独立测试已经展示短字段同行和按内容宽度排列，但正式资料库仍使用大块浮动标题输入框，占用右栏纵向空间。',
    cause: '测试方案只验证了正常尺寸效果，尚未按照正式右栏 340 到 420px 的真实宽度重新适配。',
    solution:
      '在表单分支把题材和故事主题改为同行紧凑输入，主角金手指改为独立紧凑行；你的构思和补充内容保留宽文本区并分别压缩为 64px 和 80px，高亮、模型提示词配置、生成数量及提交逻辑保持不变。',
    prevention:
      '表单密度测试迁入正式页面时必须按正式容器宽度实测，并保留所有字段和业务处理链路，用源码测试锁定字段尺寸和布局。',
    keywords: ['表单分支', '资料库', '脑洞生成', '紧凑行式', '题材', '故事主题', '主角金手指', 'ConceptLibraryPage'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'compact-short-fields-cross-page-001',
    title: '多个短字段仍使用大号浮动标题边框',
    area: '设定编辑 / 提示词编辑 / 脑洞提示词编辑 / 模型编辑',
    symptom:
      '设定名、提示词名称、模型名称和模型 ID 等短字段使用标题嵌入粗边框的大输入区，占用高度并与资料库紧凑表单不一致。',
    cause: '通用浮动边框最初同时服务短输入和大文本区域，短字段没有按内容长度区分密度。',
    solution:
      '将设定名、提示词名称和说明、脑洞提示词名称和说明、模型名称与 ID 改为标签同行的 36px 紧凑输入；接口地址和 API Key 保留整行宽度但降低高度；提示词正文、设定正文和 AI 输出等长文本区域保持原样。',
    prevention:
      '新增字段时先判断是短元数据还是长文本：短元数据使用紧凑标签行，只有多段正文、预览和 AI 输出使用浮动标题大边框。',
    keywords: ['短字段', '设定名', '提示词名称', '模型名称', '模型ID', 'API Key', '紧凑表单'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'model-editor-size-custom-temperature-001',
    title: '模型编辑弹窗偏小且手动温度没有自定义状态',
    area: '模型管理 / 新增模型 / 编辑模型 / 温度预设',
    symptom:
      '模型编辑弹窗在桌面窗口中显得偏小；温度只有精准、均衡、创意三个固定预设，用户拖动滑块后仍会看起来属于某个固定预设。',
    cause:
      '弹窗宽度固定为 620px 且没有最小高度；温度选中状态只按数值与三个预设比较，没有记录用户是否通过滑块手动调整。',
    solution:
      '将弹窗宽度放大约 15% 到 713px，并增加 650px 最小高度；新增自定义温度卡，打开时非固定值归入自定义，用户拖动滑块后立即切换为自定义并显示当前温度。',
    prevention:
      '固定预设与连续滑块同时存在时，必须区分预设选择和手动调整来源；弹窗尺寸变更需同时锁定宽度、高度和桌面运行效果。',
    keywords: ['模型编辑', '弹窗尺寸', '温度预设', '自定义', '温度滑块', 'ModelEditorModal'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'chapter-text-replace-remove-settings-gear-001',
    title: '文字替换组合按钮保留了多余齿轮',
    area: '作品编辑器 / 正文工具栏 / 文字替换',
    symptom: '文字替换按钮和自动开关右侧仍显示独立设置齿轮，占用工具栏空间。',
    cause: '此前组合按钮同时保留主操作、自动开关和设置入口，后续工具栏收敛时没有移除设置分段。',
    solution:
      '删除文字替换组合按钮最右侧齿轮，只保留文字替换主操作和自动开关；替换执行、自动替换以及无规则时自动打开规则弹窗的逻辑保持不变。',
    prevention: '正文工具栏新增分段操作时只保留当前确实需要常驻的入口，设置类入口不应默认占用横向空间。',
    keywords: ['正文', '文字替换', '齿轮', '工具栏', 'ChapterWritingSurface'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'smart-format-settings-not-persisted-001',
    title: '智能排版开关关闭弹窗后没有生效',
    area: '作品编辑器 / 正文 / 智能排版 / 段落缩进',
    symptom: '用户在智能排版设置中打开段落缩进或切换合并空段落，关闭弹窗后工具栏智能排版和后续输入仍可能使用旧设置。',
    cause:
      '开关只更新 SmartFormatModal 内部 options 临时状态，只有点击立即智能排版才写入本地设置并同步 ChapterEditor；同时段落缩进说明错误地写成不写入正文空格。',
    solution:
      '开关变化时立即写入 SMART_FORMAT_KEY 并通过 onSettingsChange 同步 ChapterEditor；恢复默认也立即保存；说明改为每个非空段落开头写入两个全角空格。',
    prevention:
      '设置类开关如果会影响编辑器实时输入，必须在切换时同步持久化状态，不能只在执行按钮中保存；界面说明必须与实际文本变换一致。',
    keywords: ['智能排版', '段落缩进', '合并空段落', '全角空格', 'SmartFormatModal', 'ChapterEditor'],
    updatedAt: '2026-07-12',
  },
];
