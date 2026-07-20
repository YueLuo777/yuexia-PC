import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart20: ErrorLogEntry[] = [
  {
    id: 'outline-left-sidebar-max-fifth-viewport-001',
    title: '大纲左侧区域拖拽后宽度过大',
    area: '作品编辑器 / 大纲 / 左侧目录区域拖拽',
    symptom: '大纲页面左侧区域可以被拖到很宽，占用正文和右侧输出区域，用户希望最大宽度限制为屏幕的五分之一。',
    cause:
      '左侧区域只使用固定最大宽度 SETTING_LIBRARY_LEFT_MAX_WIDTH=640，读取历史宽度和拖拽时没有按当前窗口宽度重新夹取；章纲布局还会根据列数计算最小展示宽度，可能绕过拖拽状态继续撑大左栏。',
    solution:
      'getSettingLibraryLeftMaxWidth 按 window.innerWidth / scale / 5 计算当前视口五分之一，并同时用于历史宽度读取、拖拽最大值和窗口 resize 后夹取；章纲实际渲染宽度直接跟随拖拽状态。',
    prevention:
      '可拖拽分栏如果要求按屏幕比例限制，读取缓存、拖拽计算和最终渲染宽度必须共用同一个 clamp；由内容列数推导出的宽度也要服从同一上限。',
    keywords: [
      '大纲',
      '左侧区域',
      '拖拽宽度',
      '屏幕五分之一',
      'WorkbenchLibraryPanel',
      'SETTING_LIBRARY_LEFT_MAX_WIDTH',
    ],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-preview-output-splitter-left-only-001',
    title: '脑洞预览和输出之间的分割线只能向左拖',
    area: '作品编辑器 / 脑洞 / 预览区与输出区拖拽',
    symptom:
      '脑洞页面中间“脑洞预览”和“脑洞输出”之间的拖拽分割线往左拖能缩小预览区，但往右拖没有明显变化，像是只能朝左拖拽。',
    cause:
      '脑洞布局把预览区可见最大宽度限制为 420px，默认或历史保存宽度容易已经达到上限；拖拽计算本身支持左右增减，但向右扩展会立即被最大宽度夹住。',
    solution:
      '将 BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH 从 420 放宽到 480，保留输出区最小宽度不变，让预览区和输出区之间的分割线左右拖拽都能产生可见变化。',
    prevention:
      '给可拖拽分割线设置 min/max 时，要确认默认宽度不等于最大宽度；如果某个区域需要压缩显示，也要给用户留出向两侧调整的余量。',
    keywords: ['脑洞', '脑洞预览', '脑洞输出', '拖拽分割线', 'BRAINSTORM_LAYOUT_PREVIEW_MAX_WIDTH'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-right-actions-min-width-001',
    title: '章纲右侧操作按钮被挤到第二行',
    area: '作品编辑器 / 章纲 / 右侧 AI 输出栏 / 操作按钮',
    symptom:
      '右侧 AI 输出栏宽度被拖得过窄后，“替换章纲、撤销替换、复制章纲、清空章纲”四个按钮的文字被挤到第二行，按钮高度和阅读节奏都变乱。',
    cause:
      '章纲/概要右侧栏沿用通用 SETTING_LIBRARY_RIGHT_MIN_WIDTH=280，按钮本身也使用 min-w-0 flex-1，允许文字在过窄宽度下换行。',
    solution:
      '为章纲/概要右侧操作栏新增 OUTLINE_ACTION_RIGHT_MIN_WIDTH=420，读取历史宽度和拖拽时都按该最小值夹住；四个操作按钮加 min-w-[92px] 与 whitespace-nowrap，确保最小宽度下文字仍保持单行。',
    prevention:
      '带多枚文本按钮的可拖拽区域，最小栏宽必须按最长按钮组计算；按钮本身也要加 nowrap 和最小宽度，不能只依赖 flex 平均分配。',
    keywords: ['章纲', '右侧 AI 输出', '替换章纲', '撤销替换', '复制章纲', '清空章纲', '最小宽度'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'drag-splitter-icon-unified-test-page-001',
    title: '全局拖拽分割线鼠标指针已统一为正文同款',
    area: '测试集合 / 拖拽分割线 / 正文编辑器',
    symptom:
      '正文、右侧 AI、设定库、脑洞和剧情链里的拖拽分割线鼠标指针不一致，用户希望以正文未发布栏和正文区域中间的鼠标样子为准统一全局。',
    cause:
      '历史上不同区域分别实现拖拽热区，有的使用正文同款左右拖拽指针，有的使用列拖拽指针，视觉线条和热区宽度也各自实现，鼠标移入时的反馈不统一。',
    solution:
      '将 WorkbenchLibraryPanel 内设定库、脑洞、章纲、概要和剧情链分割线的 hover 指针与拖拽中 body 指针统一为正文同款 cursor-ew-resize；UI 库里的可拖拽分割线示例同步改为同款，并删除临时鼠标指针统一测试页、路由和测试集合入口。',
    prevention:
      '全局视觉统一类改动确认后要迁入正式页面，并同步删除临时测试页；新增横向分栏拖拽时统一使用正文同款左右拖拽指针。',
    keywords: [
      '拖拽分割线',
      '鼠标指针',
      'cursor-ew-resize',
      '测试集合',
      '正文',
      'WorkbenchPage',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-09',
  },
  {
    id: 'brainstorm-count-generate-button-overlap-001',
    title: '脑洞生成个数会被生成按钮遮住',
    area: '作品编辑器 / 设定库 / 脑洞生成 / 底部操作行',
    symptom:
      '生成个数 1/3/5/10 分段按钮在窄宽度或页面缩放后会跑到右侧生成按钮后方，生成按钮本身也显得过大，甚至文字被挤成竖排。',
    cause:
      '底部操作行使用 justify-between，左侧个数组合固定宽度不参与压缩，右侧生成按钮只靠 padding 撑开，没有稳定尺寸约束；当可用宽度不足时两侧区域互相挤压。',
    solution:
      '操作行改为固定间距布局，左侧生成个数组使用 min-w-0 flex-1 接收剩余空间，分段按钮等分压缩，并按需求移除 2 个选项；右侧生成按钮固定为 h-10 w-16、shrink-0、whitespace-nowrap，避免变成巨型按钮或遮挡数字。',
    prevention:
      '同一行里有分段控件和主按钮时，分段控件必须允许压缩，主按钮必须有稳定宽高；不要只依赖 padding 和 justify-between 来处理窄宽度布局。',
    keywords: ['脑洞', '生成个数', '生成按钮', '遮挡', '分段按钮', 'whitespace-nowrap'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'hidden-content-nav-moved-into-tests-001',
    title: '隐藏内容导航应收进测试集合',
    area: '导航 / 测试集合 / 隐藏内容',
    symptom:
      '左侧正式导航里单独显示“隐藏专区”，里面只有“隐藏内容”，但用户希望隐藏内容作为测试项查看，不再占用正式导航专区。',
    cause:
      '隐藏内容最初作为恢复索引放进独立导航分组，后续测试集合已经具备承载隐藏页面检查的能力，独立专区变成重复入口。',
    solution:
      '从 DEFAULT_NAV_CONFIG 删除隐藏专区；导航规范化把历史本地配置里的隐藏专区和 /hidden-content 路由过滤掉；测试集合把“隐藏页面”改为“隐藏内容”，直接打开 /hidden-content。',
    prevention:
      '以后不面向日常使用的索引页优先放进测试集合；从正式导航移除分组时要同时清理默认配置、历史本地配置归一化和测试集合入口。',
    keywords: ['隐藏专区', '隐藏内容', '测试集合', '导航', 'DEFAULT_NAV_CONFIG', 'hidden-content'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'desktop-launch-main-window-reference-001',
    title: '月下PC版 VBS 启动后窗口打不开',
    area: '桌面启动器 / Electron 主进程 / 月下PC版.vbs',
    symptom:
      '双击月下PC版.vbs 后启动日志显示 Vite 已就绪、Electron 已启动，但桌面窗口没有正常打开；electron-dev.log 反复出现 ReferenceError: mainWindow is not defined。',
    cause:
      'electron/main.cjs 在清理主进程代码时丢失了全局 mainWindow 声明，createWindow、focusMainWindow、窗口 IPC 等函数仍然读写该变量，导致 Electron 创建窗口时抛错；启动器清理旧 Electron 时又把路径反斜杠转成双反斜杠，PowerShell 命令行匹配不到旧主进程。',
    solution:
      '在 electron/main.cjs 的窗口状态常量之后补回 let mainWindow = null，让主窗口引用在 createWindow、关闭回调和 IPC 处理之间共享；同时修正 launch-xinyuexia.mjs 的旧 Electron 进程匹配，按真实命令行路径清理。',
    prevention:
      '以后精简 Electron 主进程时，先跑 npm.cmd run check:electron 和 npm.cmd run check:launcher，再用月下PC版.vbs 做一次真实启动验证，并确认旧 Electron 主进程会被替换。',
    keywords: [
      '月下PC版.vbs',
      'Electron',
      'mainWindow',
      'ReferenceError',
      'launcher.log',
      'electron-dev.log',
      'Stop-Process',
    ],
    updatedAt: '2026-06-09',
  },
  {
    id: 'smart-format-indent-options-regression-001',
    title: '智能排版缩进选项互相干扰',
    area: '作品编辑器 / 正文区域 / 智能排版',
    symptom:
      '智能排版里同时存在首行缩进、段落缩进和智能断句；段落缩进开启后不够稳定，正文空白状态下“从这里开始写...”占位字和光标都没有跟随段落缩进。',
    cause:
      '首行缩进只通过 textarea 的 textIndent 做视觉偏移，段落缩进则写入两个全角空格，两套缩进状态互斥且旧状态仍会触发清理正文缩进的副作用；原生 placeholder 前置空格只能移动占位字，不能移动空 textarea 的光标。',
    solution:
      '删除首行缩进和智能断句选项，智能排版只保留段落缩进与合并空段落；移除视觉首行缩进和相关清理副作用；段落缩进开启且正文为空时用临时 textIndent 同步缩进 placeholder 和光标，有正文后只保留写入正文的段落缩进。',
    prevention:
      '正文缩进只保留一种来源：需要写入正文时使用段落缩进，不再同时维护视觉 textIndent；删除 UI 选项时必须同步删除状态、副作用和格式化算法分支。',
    keywords: ['智能排版', '首行缩进', '段落缩进', '智能断句', 'placeholder', 'textIndent'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'archive-vector-extract-adjustment-removal-001',
    title: '不用的向量库、调整模式和提炼功能需要剥离归档',
    area: '代码清理 / 向量数据库 / 调整模式 / 提炼剧情与提炼设定',
    symptom:
      '用户已经不使用向量数据库，同时要求删除调整模式，并把提炼剧情、提炼设定相关代码和向量数据库代码一起存档，避免正式界面继续暴露旧入口。',
    cause:
      '旧代码仍分散在 Electron IPC、导航、快捷键、全局调整层、提炼页面、设定提取页面和测试示例里；如果只删入口不归档，后续需要查旧实现时不方便，如果只归档不删入口，又会留下不可用流程。',
    solution:
      '把向量数据库实现归档到 archived/vector-database，并在 archived/vector-database/extract-features 中保存提炼剧情和提炼设定相关代码；正式代码移除 pgvector/PostgreSQL 桥接、调整模式路由与全局层、提炼剧情路由与页面、提炼设定页面，并清理测试中心的旧可见示例。',
    prevention:
      '废弃功能要按“先归档、再断入口、再扫残留、再跑检查”的顺序处理；导航清洗名单可以保留旧路由用于过滤本地历史配置，但正式路由、快捷键和测试示例不应继续暴露已废弃功能。',
    keywords: ['向量数据库', '调整模式', '提炼剧情', '提炼设定', '归档', 'archived/vector-database'],
    updatedAt: '2026-06-09',
  },
  {
    id: 'detail-outline-font-size-toolbar-global-001',
    title: '章纲字号控件不应重复出现在每个章纲框里',
    area: '作品编辑器 / 章纲 / 字号工具',
    symptom: '每个章纲框左下角都显示一组字号加减按钮，滚动长章纲列表时重复占用框体边线空间。',
    cause:
      '章纲字号控件在章节卡片循环内部渲染，虽然修改的是同一个 detailOutlineFontSize 状态，但视觉上像每个框都有独立控件。',
    solution:
      '新增顶部工具栏级 renderDetailOutlineFontSizeTool，只在章纲页显示；章纲目录工具行顺序调整为日志、章纲字号、字段尺寸、设置；删除每个章纲卡片内部的字号控件。',
    prevention:
      '控制所有章纲框的全局工具应放在章纲工具栏，不放进章节卡片循环；测试锁定字号控件不再出现在卡片源码里，并且位于字段尺寸按钮左侧。',
    keywords: ['章纲', '字号', '字段尺寸', '工具栏', 'detailOutlineFontSize'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-linked-source-word-count-tight-001',
    title: '章纲关联设定按钮右侧只应紧邻显示关联字数',
    area: '作品编辑器 / 章纲 / 关联设定',
    symptom: '章纲页关联设定按钮右侧显示“已关联 N 项 · 字数”，且字数被 justify-between 推到区域最右侧。',
    cause: '右侧关联入口的 meta 同时承担数量和字数展示，并使用两端对齐布局，导致按钮和字数之间距离过远。',
    solution:
      '关联 meta 改为仅在关联字数大于 0 时显示 WordCountText；移除“已关联 N 项”文案；布局改为 flex items-center gap-3，让字数紧跟按钮右侧。',
    prevention: '关联入口的按钮负责表达是否已关联，按钮旁 meta 只显示关联字数；不要用 justify-between 推开按钮和字数。',
    keywords: ['章纲', '关联设定', '关联字数', 'justify-between', 'LinkedSourceControl'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-card-clear-border-bottom-right-001',
    title: '章纲卡片清空按钮需要嵌入右下边框',
    area: '作品编辑器 / 章纲 / 中间章纲卡片',
    symptom: '中间区域单章章纲框的清空显示在框内右下角，和边框贴合不够，用户希望嵌入到章纲框右下边框线上。',
    cause: '章纲卡片本身没有独立的贴边清空按钮，只依赖右侧或底部清空入口，无法对单章卡片形成一致的边框嵌入操作位。',
    solution:
      '给每个章纲卡片新增只清空本章章纲的 xy-floating-outline-card-clear-tool 按钮，并复用 xy-border-embedded-transparent-backplate；CSS 将按钮定位到右下边框。',
    prevention:
      '章纲卡片级操作要放在卡片自身边框工具位，和右侧 AI 输出框清空区分；测试锁定按钮 class、清空本章逻辑和右下边框定位。',
    keywords: ['章纲', '清空按钮', '右下边框', 'xy-floating-outline-card-clear-tool', '透明背板'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-tabbed-layout-long-chain-workflow-001',
    title: '剧情链双标签测试需要更贴近长链推进工作流',
    area: '测试集合 / 剧情链双标签布局测试',
    symptom: '剧情链测试页未写/已写状态不够突出，没有总链预览，生成候选不能清楚表达从链尾继续生成下一号剧情点。',
    cause:
      '测试页仍以静态候选和单卡片预览为主，缺少链尾生成下一号剧情点、总链一眼看完、状态分类强提示这三个长链核心入口。',
    solution:
      '左侧未写/已写改为醒目的双状态目录；生成页固定显示链尾和下一号，点击候选会追加为新的链尾并切到预览；预览页顶部新增剧情链总览；下一步建议只出现在最大序号链尾。',
    prevention:
      '剧情链测试页后续改动必须同时覆盖状态目录、总链预览、链尾续写、已写迁移和链尾建议；测试覆盖候选追加成新链尾和尾巴标为已写后的建议规则。',
    keywords: ['剧情链', '总链预览', '未写剧情', '已写剧情', '链尾续写'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-preview-tail-only-next-direction-001',
    title: '剧情链预览不应给每个已串联剧情点重复提示衔接到下一个编号',
    area: '测试集合 / 剧情链双标签布局测试 / 剧情链预览',
    symptom: '剧情链预览页每个剧情点下方都显示“衔接到 N”，即使这些剧情点已经连成剧情链，也会继续提示衔接到 4、5。',
    cause: '预览卡片按数组里的 next 固定渲染桥接说明，没有区分链内既有衔接和最后未写剧情点之后的生成建议。',
    solution:
      '卡片内不再显示“衔接到 N”；只在当前未写剧情点中序号最大的那个剧情点下方显示“下一步推荐方向”。右侧 AI 建议也改为跟随最后未写剧情点。',
    prevention:
      '剧情链预览页只展示已成链内容，下一步方向属于尾部未写剧情点的生成建议；测试锁定不再出现“衔接到”，并覆盖尾部剧情点标为已写后的建议前移。',
    keywords: ['剧情链预览', '衔接到', '下一步推荐方向', '最后未写剧情点', 'AI建议'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-ai-output-clear-bottom-right-001',
    title: '章纲右侧 AI 输出框清空按钮和选中章节信息位置混乱',
    area: '作品编辑器 / 章纲 / 右侧 AI 输出框',
    symptom: '章纲页右侧 AI 输出框的清空按钮停在上边框标题线附近；输出框下方还显示当前卷/章节、正文或章节字数信息。',
    cause:
      '右侧区域在输出框后额外渲染 isDetailOutlineTab 选中章节信息；清空按钮复用了贴边标题线定位，未按右侧输出框内部操作按钮处理。',
    solution:
      '删除右侧输出框下方的选中卷/章节信息块；把 xy-floating-outline-inner-clear-tool 改为框内右下角定位，并保留透明贴边按钮样式。',
    prevention:
      '章纲页右侧只承担 AI 输出和关联/操作入口，不再重复展示当前章节字数；测试锁定清空按钮底部右侧定位，并确认右侧源码不再包含选中章节信息块。',
    keywords: ['章纲', 'AI输出框', '清空按钮', '右下角', '选中章节信息'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-ai-output-word-count-hidden-001',
    title: '章纲右侧 AI 输出框不应显示字数统计',
    area: '作品编辑器 / 章纲 / 右侧 AI 输出框',
    symptom: '章纲页右侧 AI 输出框边框标题旁仍显示 0字；用户要求删除，同时中间区域章纲卡片自身的字数统计不应被删。',
    cause:
      '右侧 AI 输出框的 shouldShowOutlineDraftWordCount 把 isDetailOutlineTab 也算作显示条件；此前修复时又误把中间卡片统计当作目标。',
    solution:
      '右侧 AI 输出框只在剧情链 standalone 模式显示字数；中间章纲卡片恢复基于 outlineCardContent 的字数统计，并保持它不进入边框标题 label。',
    prevention:
      '章纲页有两个不同区域的字数统计：右侧 AI 输出框字数不要显示；中间章纲卡片内容字数要保留。测试需要分别锁定这两个位置。',
    keywords: ['章纲', 'AI输出框', '字数统计', 'outlinePreviewDraft', 'outlineCardContent'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-preview-status-action-empty-row-001',
    title: '剧情链预览卡片状态按钮不应单独占用空白行',
    area: '测试集合 / 剧情链预览 / 剧情点卡片',
    symptom: '剧情链预览卡片顶部左侧整行空白，只在右侧显示“移回未写 / 标为已写”按钮，导致卡片内容被往下挤。',
    cause:
      '测试页预览卡片把状态按钮放在独立的 justify-end 顶部行；正式页已选剧情点卡片也保留了一个 aria-hidden 的空 flex 占位。',
    solution: '测试页将状态按钮并入剧情点标题/正文同一行右侧；正式页将正文直接放到序号和按钮之间，删除空占位。',
    prevention:
      '剧情链卡片的状态按钮应作为内容行的右侧操作，不再创建只有右侧按钮的空白行；测试锁定不再出现空白按钮行和 aria-hidden 占位。',
    keywords: ['剧情链预览', '移回未写', '标为已写', '空白行', 'aria-hidden'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-reader-plot-chain-association-001',
    title: '章纲关联设定需要支持关联剧情链',
    area: '作品编辑器 / 章纲 / 关联设定',
    symptom: '章纲的“关联设定”弹窗只能选择设定、角色和前文章纲，无法把当前剧情链作为章纲生成上下文一起发给 AI。',
    cause:
      '关联弹窗只有三类 DetailOutlineReaderTab 和三套选择状态，AI 请求上下文也只拼接关联设定、关联角色和关联章纲。',
    solution:
      '新增“剧情链”标签和 detailOutlineReaderPlotChainIds 持久字段；将当前主链已选剧情点整理为可勾选条目，支持关联所有、清空和单项勾选；AI 上下文新增“关联剧情链”分组。',
    prevention:
      '章纲生成新增上下文来源时，要同时补类型、草稿选择、持久配置、弹窗标签、字数统计、输出日志和最终请求文本，避免只显示入口但不发送给 AI。',
    keywords: ['章纲', '关联设定', '剧情链', 'detailOutlineReaderPlotChainIds', '关联剧情链'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-card-border-title-word-count-overlap-001',
    title: '章纲卡片边框标题不应和正文字数挤在一起',
    area: '作品编辑器 / 章纲 / 章纲卡片边框标题',
    symptom:
      '章纲卡片边框标题仍显示成“第N章章纲 0字（第N卷）”一类拥挤效果，正文字数和卷信息夹在同一条边框线上，出现文字压叠。',
    cause:
      '此前只删除了左侧标题 label 里的正文计数，但右侧章节 meta 仍在章纲卡片边框线上渲染 chapter.wordCount，左侧标题还包含卷信息，双方继续抢空间。',
    solution:
      '章纲卡片左侧标题只保留“第N章章纲”；右侧 meta 改为“第N卷 · 章节名”，不再显示正文 WordCountText。概要卡片仍保留原本的章节字数显示。',
    prevention:
      '章纲卡片边框线上只放定位信息和章节名，不放正文统计；正文统计如果需要显示，应放在中间章纲内容区的独立统计位置。',
    keywords: ['章纲', '边框标题', '字数统计', '重叠', 'WordCountText'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-preview-test-mark-written-001',
    title: '剧情链预览测试页需要提供未写转已写入口',
    area: '测试集合 / 剧情链测试 / 剧情链预览',
    symptom:
      '剧情链测试页里“当前承接”命名不符合当前设计语义；切到“剧情链预览”后，只能查看剧情点衔接，不能把未写剧情点标为已写，也看不到它移动到已写分组。',
    cause: '测试页仍使用固定 plotPoints 状态数组，左侧目录按初始状态分组，预览页没有状态迁移按钮。',
    solution:
      '将“当前承接”改名为“当前剧情点”；测试页根组件新增已写剧情点状态集合，预览页每个剧情点卡片新增“标为已写 / 移回未写”按钮，点击后同步刷新左侧“未写剧情 / 已写剧情”分组。',
    prevention: '剧情链测试页涉及状态流转时，不能只做静态预览；预览页也要暴露推进状态按钮，并用交互测试确认分组迁移。',
    keywords: ['剧情链测试', '剧情链预览', '当前剧情点', '标为已写', '移回未写'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-ai-output-replace-undo-001',
    title: '章纲右侧 AI 输出需要支持替换所选章纲和撤销',
    area: '作品编辑器 / 章纲 / 右侧 AI 输出框',
    symptom:
      '章纲页最右侧区域仍按“章纲预览/保存章纲”理解，生成 AI 章纲后无法明确替换当前选中的章纲，也没有误替换后的撤销入口。',
    cause:
      '右侧草稿 outlinePreviewDraft 同时承担预览和编辑保存含义，按钮只调用旧的保存逻辑，替换前没有记录所选章纲原内容。',
    solution:
      '将细纲页右侧标题改为 AI输出章纲，选择章节时不再把已保存章纲自动回填到右侧 AI 输出；把“保存章纲”改为“替换章纲”；替换前缓存章节序号、原章纲内容和 AI 输出草稿，并在“复制章纲”左侧新增“撤销替换”按钮。',
    prevention: 'AI 输出区和正式章纲内容区要保持职责分离；任何覆盖式写入都需要保存上一次快照并提供同屏撤销入口。',
    keywords: ['章纲', 'AI输出', '替换章纲', '撤销替换', 'outlinePreviewDraft'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'detail-outline-card-title-remove-body-word-count-001',
    title: '章纲卡片标题不应显示正文内容字数',
    area: '作品编辑器 / 章纲 / 章纲卡片边框标题',
    symptom: '章纲卡片上边框标题里显示“第N章章纲 + 0字 + 卷信息”，字数统计和标题挤在一起，仍会造成视觉重叠。',
    cause:
      '章纲卡片标题 label 在 isDetailOutlineTab 下额外渲染了 countTextWords(outlineCardContent)，把正文内容字数放到了卡片边框标题线上。',
    solution: '删除章纲卡片标题里的 WordCountText，只保留章纲标题本身；中间章纲预览区域原有的字数统计不改。',
    prevention: '卡片边框标题只承担定位和标题职责；字数统计应放在预览区或独立统计位，避免和章节/卷信息抢同一条边框线。',
    keywords: ['章纲', '卡片标题', '字数统计', '重叠', 'outlineCardContent'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'brainstorm-preview-border-color-match-output-001',
    title: '脑洞预览框边线颜色和新脑洞输出框不一致',
    area: '作品编辑器 / 脑洞 / 脑洞预览框',
    symptom: '脑洞页面左侧“脑洞4”预览框边线是浅灰蓝色，中间“新脑洞1”输出框边线是深色，两个相邻内容框视觉不统一。',
    cause:
      '左侧脑洞预览同时使用了 xy-floating-outline-preview，继承通用预览框的 border-color: #d9e2ea；中间新脑洞输出框只使用普通 xy-floating-outline-fixed，保留了深色 #111827 边线。',
    solution:
      '给 xy-brainstorm-preview-field textarea 增加专用 border-color: #111827，只把脑洞预览框改成和新脑洞输出框一致的深色线。',
    prevention: '脑洞页左右相邻主内容框的边线颜色要单独锁定；通用预览框的浅色边线不能自动套到脑洞主预览。',
    keywords: ['脑洞', '预览框', '边线颜色', '新脑洞', 'xy-brainstorm-preview-field'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'brainstorm-output-title-baseline-001',
    title: '脑洞输出贴边标题和同排边框标题不在同一水平线',
    area: '作品编辑器 / 脑洞 / 新脑洞输出框',
    symptom:
      '脑洞页面中间输出框的“新脑洞1 + 字数统计”贴边标题和黑色上边框，比左侧“脑洞4 + 字数统计”与右侧生成配置标题整体下沉，看起来没有水平对齐。',
    cause:
      '脑洞输出区是 overflow-y-auto 滚动列表，贴边标题会向边框上方伸出半个标题高度；如果顶部留白只有 0.25rem，标题会被滚动容器裁剪，如果留白保持 0.625rem，首个输出框边框又会比左侧下沉 6px。',
    solution:
      '保留 xy-brainstorm-output-preview-list 的 padding-top: 0.625rem 作为标题裁剪缓冲，同时增加 margin-top: -0.375rem 抵消这 6px 下沉，让中间输出框上边框与左侧脑洞预览对齐且标题完整显示。',
    prevention: '滚动容器里的贴边标题不能只按边框位置调 padding；必须同时保留裁剪缓冲并用外层位移校正边框起点。',
    keywords: ['脑洞', '新脑洞', '贴边标题', '字数统计', '水平对齐', '边框基线'],
    updatedAt: '2026-06-08',
  },
];
