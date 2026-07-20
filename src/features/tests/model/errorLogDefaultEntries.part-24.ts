import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart24: ErrorLogEntry[] = [
  {
    id: 'workbench-plot-chain-reasoning-final-output-mismatch-001',
    title: '剧情链右侧思考内容与左侧剧情点不一致',
    area: '作品编辑器 / 剧情链 / 右侧 AI 输出',
    symptom:
      '剧情链生成后，左侧剧情点预览显示的是最终解析出的候选剧情点，但右侧输出框展开已思考后会看到模型 reasoning 里的中途草稿，内容可能和左侧最终剧情点不一致。',
    cause:
      '左侧候选卡片来自 plotPointGeneratedCandidateText 的最终答案解析；右侧输出框直接渲染 outlinePreviewDraft 的 [[THINKING]] 思考块。带 reasoning 的模型会在思考过程里尝试不同方案，这部分不等于最终输出。',
    solution:
      '给 renderAiChatContent 增加 hideReasoningBody 选项；剧情链右侧输出框只显示已思考/正在思考的状态和最终答案，不再展示 reasoning 正文，避免把思考草稿误认为最终剧情点。',
    prevention:
      '剧情链、候选列表这类左侧为最终解析结果的页面，右侧只展示最终输出和思考状态；不要把模型内部思考正文与最终候选并列给用户核对。',
    keywords: ['剧情链', '剧情点预览', 'AI思考', 'reasoning', 'hideReasoningBody', 'plotPointGeneratedCandidateText'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-detail-outline-card-font-stepper-001',
    title: '章纲卡片左下角缺少字号设置',
    area: '作品编辑器 / 章纲 / 章纲卡片',
    symptom:
      '章纲页面每个章纲框只有内容、右上章节信息和右下字数统计，左下角没有像大纲和设定预览那样的字号设置，无法直接调节章纲卡片正文显示字号。',
    cause:
      '此前只把 xy-floating-border-font-tool 接入角色、脑洞预览、设定预览等边框预览框，章纲列表卡片虽然也使用 xy-floating-outline-preview，但没有单独的字号状态和步进器。',
    solution:
      '新增 detailOutlineFontSize 标签页配置，章纲卡片 textarea 使用该字号渲染；仅在章纲页 isDetailOutlineTab 下给每个章纲卡片左下角添加 FontSizeStepper，复用 xy-floating-border-font-tool 的左下角边框工具格式，不影响概要页。',
    prevention:
      '凡是章纲、大纲、设定这类可编辑预览框需要字号调节时，统一使用左下角 xy-floating-border-font-tool，避免同类边框框体能力不一致。',
    keywords: ['章纲', '字号设置', 'xy-floating-border-font-tool', 'FontSizeStepper', 'detailOutlineFontSize'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-generator-elastic-layout-001',
    title: '脑洞生成表单空间利用不合理',
    area: '作品编辑器 / 脑洞 / 右侧生成表单',
    symptom:
      '脑洞页面右侧生成表单里，题材和模型框左侧没有对齐，故事主题和提示词框右侧没有对齐；模型/题材之间、补充内容/生成按钮之间留白偏大；构思写到两行后需要内部滚动或不能完整看到。',
    cause:
      '顶部模型/提示词选择器和下方问题面板使用了不同的内边距与对齐方式；问题面板额外 p-3 导致字段整体内缩；补充内容字段用 flex-1 撑满剩余高度，而文本行数又被限制到最多 4 行。',
    solution:
      '脑洞右栏模型/提示词选择器强制占满同一列宽；问题面板改为 px-0 py-2，题材/故事主题行改为更紧凑的 gap-2.5；构思、补充内容等文本框按内容行数弹性增高，不再内部滚动；补充内容取消撑满剩余高度，生成按钮间距收紧到 mt-2。',
    prevention:
      '右侧生成表单应以顶部配置框作为左右边界基准，内部字段不再额外套横向 padding；用户输入型文本框优先外部增高，只有整个表单区域滚动。',
    keywords: ['脑洞', '生成表单', '弹性高度', '对齐', '构思', '补充内容'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'software-ui-catalog-border-transparent-backplate-tech-001',
    title: '技术词典需要记录边框嵌入式透明背板',
    area: 'UI库 / 技术词典 / SoftwareUiCatalogPage',
    symptom:
      '边框内嵌内容已经在正式页面使用 xy-border-embedded-transparent-backplate，但 UI 库技术词典里没有独立条目，后续无法直接说用 T 编号那个技术。',
    cause: '此前只把该技术记录在错误日志和 CSS 类名里，没有补充到 SoftwareUiCatalogPage 的 techItems。',
    solution:
      '新增技术词典 T-20 边框嵌入式透明背板，说明用途是边框线上文字、字数、清空、章节信息不使用白底块，改用透明背板和文字描边遮线，并增加对应小预览。',
    prevention: '以后新增可复用 UI 技术时，除了日志和 CSS 类名，也同步写进技术词典，方便直接按编号复用。',
    keywords: [
      '技术词典',
      'T-20',
      '边框嵌入式透明背板',
      'xy-border-embedded-transparent-backplate',
      'SoftwareUiCatalogPage',
    ],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-border-content-transparent-backplate-all-001',
    title: '边框内嵌内容需要全部使用透明背板技术',
    area: '作品编辑器 / 大纲 / 章纲 / 正文 / 脑洞 / 角色 / 审核点评',
    symptom:
      '章纲卡片右上角 第X章 章节名 正文：XXX字 这类内容贴在边框线上，如果没有显式使用透明背板技术，后续容易被改回白底块或被边框线穿过。',
    cause:
      '此前部分边框内容是靠 xy-floating-outline-preview 的后代选择器间接获得透明背板效果，源码里看不出这个位置已经受规则保护；右下角字数统计仍有一套通用白底背景规则。',
    solution:
      '把章纲右上章节信息、各右侧输出 清空、脑洞输出标题、审核/点评输出工具显式接入 xy-border-embedded-transparent-backplate；将通用 xy-floating-count 改为透明背景与文字级遮线，让正文、大纲、章纲、角色、脑洞、状态等右下角字数统一使用同一技术。',
    prevention:
      '以后任何压在边框线上的内容都默认使用 xy-border-embedded-transparent-backplate 或同等规则；不要再为边框内嵌文字增加 bg-white px-* 白底背板。',
    keywords: ['边框内嵌', '透明背板', 'xy-border-embedded-transparent-backplate', '字数统计', '章纲右上角'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-embedded-font-tool-left-bottom-001',
    title: '嵌入边框字号控件位置不统一',
    area: '作品编辑器 / 正文 / 大纲 / 设定预览 / 脑洞预览 / 角色详情',
    symptom:
      '正文右侧 AI 输出框的字号控件在边框左下角，但大纲/设定预览等页面的字号控件出现在右上角，导致同一种嵌入边框工具格式在不同页面不一致。',
    cause:
      '正文使用专用的 xy-floating-chat-font-tool 左下定位；角色背景、角色状态、脑洞预览、设定预览等位置仍复用通用 xy-floating-edge-tool，该类默认是右上角工具位。',
    solution:
      '新增通用左下字号工具类 xy-floating-border-font-tool，并把角色背景、角色状态、脑洞预览、设定预览、空设定预览统一接入；脑洞输出字号继续保留独立类名，但定位规则改为同样的左下角；软件格式目录 UI-141 同步改成左下角示例。',
    prevention:
      '嵌入边框的字号设置统一使用左下角工具位，危险/清空类操作放右上角；不要再用 xy-floating-edge-tool 承载字号步进器。',
    keywords: ['字号设置', '左下角', '边框嵌入', 'xy-floating-border-font-tool', 'xy-floating-edge-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-border-embedded-transparent-backplate-001',
    title: '边框贴边文字仍像有白色底片',
    area: '作品编辑器 / 大纲 / 章纲 / 右侧输出框 / 脑洞输出工具',
    symptom:
      '章纲卡片左上角 第X章章纲（第X卷）、右下角字数、右上角章节信息，以及右侧输出框贴边 清空 等位置虽然已去掉 bg-white，但截图里仍能看到类似白色底片的块感；部分贴边文字还容易被边框线穿过。',
    cause:
      '上一版透明背板用四向白色 text-shadow 遮住边框线，视觉上会形成一圈接近矩形的白影；嵌套的字数组件如果只处理外层，也可能让边框线继续压到内部文字。',
    solution:
      '将大纲/章纲/右侧输出框的贴边标签、字数、章节元信息、清空文字统一改为透明背景 + 文字描边遮线的边框嵌入式透明背板；抽出可复用类 xy-border-embedded-transparent-backplate，去掉四向白影，并给字数、章节元信息、清空工具的子元素同步描边；脑洞输出右上工具外层也去掉通用白色背板。',
    prevention:
      '贴边文字需要遮线时优先用 xy-border-embedded-transparent-backplate 或同等的 -webkit-text-stroke + paint-order: stroke fill 做文字级遮线，不再用 bg-white px-* 或四向 text-shadow 做块状遮罩；按钮本体样式和外层背板要分开检查。',
    keywords: ['边框嵌入', '透明背板', '白色底片', '章纲', '清空', 'xy-border-embedded-transparent-backplate'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-detail-outline-card-chapter-meta-001',
    title: '章纲卡片右上角缺少正文章节信息',
    area: '作品编辑器 / 章纲 / 章纲卡片',
    symptom: '章纲页面每个章纲卡片只有左上角的第X章章纲（第X卷），无法在卡片内直接看到对应正文的章节名和正文字数。',
    cause:
      '章纲预览卡片只渲染章纲标题与章纲内容字数，未把已有的 chapter.title 和 chapter.wordCount 显示到卡片贴边区域。',
    solution:
      '在章纲页每个章纲卡片右上角新增 第X章 章节名 正文：XXX字 信息，标题为空时显示 未命名章节；该信息只在章纲页显示，不影响概要页；复用透明贴边文字阴影技术，避免恢复白色底片。',
    prevention: '章纲卡片需要同时区分章纲内容字数和正文内容字数，右上角放正文元信息，右下角继续保留章纲自身字数统计。',
    keywords: ['章纲', '右上角', '章节名', '正文字数', 'xy-floating-outline-chapter-meta'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-plot-chain-generation-rule-heading-hidden-001',
    title: '剧情链右侧生成规则标题需要删除',
    area: '作品编辑器 / 剧情链 / 右侧生成参数',
    symptom:
      '剧情链右侧 AI 区域在模型/提示词下方显示 生成规则 标题，占用一行空间，和当前右侧区域希望更紧凑直铺的格式不一致。',
    cause: '剧情链右栏早期把长度、剧情点类型、剧情点数量归到一个显式标题下；右侧布局统一后，这个标题成为冗余提示。',
    solution:
      '删除剧情链右侧可见的 生成规则 标题，只保留下方长度、剧情点类型、剧情点数量按钮组；不改实际发送给 AI 的规则内容和按钮样式尺寸。',
    prevention:
      '右侧参数区如果标签项已经能说明用途，不再额外添加分组标题；需要保留给 AI 的提示规则时，和可见 UI 标题分开处理。',
    keywords: ['剧情链', '生成规则', '右侧参数', '标题删除', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-ai-reset-session-status-hidden-001',
    title: '清空正文 AI 会话后不应显示“已新开空会话”',
    area: '正文右侧 AI / 会话清空 / 顶部状态提示',
    symptom: '正文右侧 AI 面板点击清空或重置会话后，顶部状态栏会显示 已新开空会话，占用右侧区域上方空间。',
    cause:
      'WorkbenchAIPanel 的 resetSessions 在完成重建空会话后调用了 flashStatus(已新开空会话)，但这个操作本身已经通过会话列表变化可见，不需要额外提示。',
    solution: '移除 resetSessions 里的顶部状态提示，只保留停止输出、清空关联、创建新空会话和重置日志状态的逻辑。',
    prevention:
      '会话删除、清空、重置这类用户主动触发且结果直接可见的操作，不再追加顶部状态提示；需要提示时优先确认是否会遮挡右侧工作区。',
    keywords: ['正文AI', '已新开空会话', '顶部提示', 'resetSessions', 'flashStatus', '会话清空'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-right-panel-07-shellless-layout-001',
    title: '作品编辑器右侧区域需要统一为 07 测试无卡片式',
    area: '作品编辑器 / 右侧 AI 区域 / 大纲 / 脑洞 / 正文 / 章纲 / 审核点评状态',
    symptom:
      '角色生成、大纲/题材生成、剧情点生成、章纲/概要、状态更新、审核/点评等右侧区域仍混用外层白色卡片、软卡参数块或 AI 配置 / AI 输出框 标题，和 07 号测试及正文页右侧直铺格式不一致。',
    cause:
      '此前只拆掉了部分 AI 对话框外壳，并保留了 xy-soft-shell-panel 作为过渡弱化方案；不同分支仍各自包了一层 rounded-xl border ... bg-white，导致右侧区域层级不统一。',
    solution:
      '将正式作品编辑器右侧区域统一改为 bg-gray-50 px-4 pb-4 pt-2 的直铺壳；角色、题材/设定、剧情点、状态、审核/点评的主输出区改由现有 xy-floating-field xy-floating-outline-preview 直接承载；章纲/概要当前信息和审核/点评参数梗概去掉软卡壳，仅保留文字信息；保留按钮、输入框、列表项和弹窗本身的尺寸与样式。',
    prevention:
      '以后对齐正文右栏或 07 测试格式时，先拆右侧承载外壳，不要再给右侧整块或参数梗概套白卡/软卡；主输出框、输入框、按钮组和列表项仍按控件自身边界保留。',
    keywords: ['作品编辑器', '右侧区域', '07测试', '无卡片式', 'xy-floating-outline-preview', 'xy-soft-shell-panel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-session-buttons-separated-mask-001',
    title: '会话按钮不应连成分段按钮',
    area: '正文右侧 AI / 脑洞输出框 / 右侧 AI 测试复刻页',
    symptom:
      '正文 AI、脑洞输出和右侧测试页的 + / 1 / 2 / 3 / 4 会话按钮被合并成一条分段按钮，虽然中间不再露线，但视觉上不如最早的独立圆角按钮。',
    cause:
      '上次为了解决 + 和 1 之间露出输出框边线的问题，把按钮间距设为 0，并用 margin-left: -1px 合并相邻边框，副作用是按钮变成连体样式。',
    solution:
      'xy-floating-session-buttons 恢复独立按钮间距和完整圆角，取消负边距与圆角压平；每个按钮本体增加一圈极窄的 box-shadow 遮线层，遮住输出框上边线，避免恢复整块白色背板；正式正文 AI、脑洞输出和右侧测试复刻页同步改为 overflow-visible，防止遮线层被裁切。',
    prevention:
      '边框上的会话按钮需要独立按钮加遮线层，不要再用连体分段按钮解决露线；遮线应挂在按钮本体，不要恢复工具外层白底背板。',
    keywords: ['会话按钮', '独立按钮', '分段按钮', '遮线层', 'xy-floating-session-buttons', 'box-shadow'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-shellless-audit-official-001',
    title: '作品编辑器外层卡片审查建议需要正式落地',
    area: '作品编辑器 / 大纲 / 章纲 / 角色 / 审核点评状态',
    symptom:
      '测试页已经给出大纲、脑洞、章纲概要、正文、角色设定、审核点评状态的外层卡片去留建议，但正式作品编辑器里仍有个别重复外壳或残留的 AI对话框 标题。',
    cause:
      '此前先做了审查测试页和脑洞去外壳，尚未把弱化参数信息外壳、保留主输出卡片的规则同步到正式页面的其他分支；角色生成右栏还残留旧对话框标题。',
    solution:
      '新增 xy-soft-shell-panel 弱化外壳技术；保留正文 AI、章纲概要预览、审核点评结果等主卡片，弱化章纲概要右侧当前信息块与审核点评参数梗概；移除角色生成输出区残留的 AI对话框 可见标题和隐藏 label。',
    prevention:
      '后续批量调整作品编辑器外壳时，先按主工作卡片、列表项、弹窗、字段组外壳、参数梗概分类，只对字段组和参数梗概使用 xy-shellless-panel 或 xy-soft-shell-panel，不要改动主输出区域边界。',
    keywords: ['作品编辑器', '外层卡片', '弱化外壳', 'xy-soft-shell-panel', 'xy-shellless-panel', 'AI对话框'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-session-buttons-gap-line-001',
    title: '会话新增按钮和序号按钮之间仍露出边框线',
    area: '正文右侧 AI / 脑洞输出框 / 右侧 AI 测试复刻页',
    symptom:
      '去掉 + / 1 会话工具外层白色背板后，+ 和 1 两个按钮本体中间仍能看到一小段输出框上边线，像按钮之间夹了一条线。',
    cause:
      '会话按钮组内部仍使用 gap-1 留出横向空隙；外层背板透明后，空隙位置会直接露出下面的浮动输出框边框。正文页的序号按钮还额外包了一层 div，只改按钮本体圆角时也可能漏掉包裹层。',
    solution:
      '新增 xy-floating-session-buttons 会话按钮组规则，取消按钮间 gap，让相邻按钮用 margin-left: -1px 合并边框，并同时处理直接按钮和包裹一层按钮的相邻圆角；正文 AI、脑洞 AI 和右侧测试复刻页统一接入该类。',
    prevention:
      '边框上的连续小按钮去掉背板后，不能再依赖透明间距分隔；需要用组合按钮方式合并相邻边框，避免底层边框线从按钮缝隙露出。',
    keywords: ['会话按钮', '+', '1', '边框线', 'gap-1', 'xy-floating-session-buttons'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-shellless-audit-test-001',
    title: '作品编辑器缺少外层卡片去留审查测试',
    area: '测试集合 / 作品编辑器 / 外层卡片审查',
    symptom:
      '脑洞页去掉外层卡片后，需要继续判断大纲、章纲、正文、角色、审核、点评、状态等作品编辑器页面是否也存在字段已经是强边框但外面又套一层卡片的重复层级。',
    cause:
      '不同页面里的卡片用途不同；有些是字段组外壳，可以用 xy-shellless-panel 去掉，有些是 AI 主输出、章节预览、列表项或结果卡片，仍需要保留边界。',
    solution:
      '新增作品编辑器外层卡片审查测试页，集中展示大纲、脑洞、章纲概要、正文、角色设定、审核点评状态的建议状态：建议去外壳、建议弱化、建议保留；测试页用 xy-shellless-panel 预览只去承载外壳、不动字段本体的效果。',
    prevention:
      '批量改作品编辑器页面前先在测试集合做审查预览，按字段组外壳和主工作卡片分类，不要把 AI 输出、章节预览、列表项这类主要视觉单位误删边界。',
    keywords: ['作品编辑器', '外层卡片', '审查测试', 'workbench-shellless-audit-test', 'xy-shellless-panel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-question-shellless-panel-001',
    title: '脑洞生成配置外层卡片框需要去掉',
    area: '工作台 / 脑洞 / 右侧生成配置',
    symptom:
      '脑洞页面右侧生成配置里，题材、故事主题、主角金手指、构思、数量和补充内容这些输入框外面还有一层整体卡片框，视觉上形成框里套框。',
    cause:
      '脑洞问题面板的承载容器同时负责滚动和外观，类名里带有 rounded-xl border border-gray-200 bg-white p-3；用户只想保留各个输入框本身，不需要外层卡片壳。',
    solution:
      '新增可复用的 xy-shellless-panel 技术类，只移除承载容器的边框、圆角、背景和阴影；脑洞问题面板保留 xy-brainstorm-question-panel、滚动、横向隐藏和 p-3 内边距，确保内部输入框不被改动。',
    prevention:
      '去掉一组表单外层卡片时，不要删除内部字段的浮动边框；优先把承载能力和卡片外观拆开，保留滚动、内边距、宽度限制，单独去掉外壳样式。',
    keywords: ['脑洞', '外层卡片', '去外壳', 'xy-shellless-panel', 'xy-brainstorm-question-panel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-outline-preview-backplate-001',
    title: '章纲/预览卡片贴边标题仍有白色底片',
    area: '工作台 / 大纲 / 章纲 / 脑洞输出',
    symptom:
      '章纲卡片左上角的第N章章纲标题，以及部分贴边的清空、脑洞输出标题、字数统计，会露出一段横向白色底片，视觉上像边框被白条垫住。',
    cause:
      '这些位置复用了浮动边框标签写法，默认 label、xy-floating-count 或写死的 bg-white px-1 会给整段文字外面加矩形背景；它们不是按钮本体，而是贴在边框上的背板层。',
    solution:
      '只对 xy-floating-outline-preview 预览类卡片取消标签和字数统计的白色背景与左右底片，并用轻量文字阴影挡住边框线；同时把贴边清空和脑洞输出标题改为透明背板类，保留文字位置和原有操作。',
    prevention:
      '边框贴边元素要区分文字或按钮本体和外层背板；截图要求无白底时，不要全局改普通输入框浮动标签，优先给预览卡片、贴边标题、贴边工具加专用透明背板规则。',
    keywords: ['章纲', '预览卡片', '白色底片', 'xy-floating-outline-preview', 'xy-floating-count', 'bg-white px-1'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-ai-session-button-translucent-line-001',
    title: 'AI 会话序号按钮被边框线穿过',
    area: '正文右侧 AI / 脑洞输出框 / 06 测试',
    symptom: '去掉会话工具外层白色背板后，左上角 1 号会话按钮中间被输出框上边线穿过去，看起来像数字和边框重叠。',
    cause:
      '选中的会话序号按钮使用 bg-brand/10 或 bg-[#08AACE]/10 这类半透明背景；外层背板透明后，后面的边框线会透过按钮本体显示出来。',
    solution:
      '把正式正文 AI、脑洞输出和 06 测试复刻页的选中会话按钮底色改为不透明浅蓝 #EAF9FD，只改按钮本体背景，不恢复外层白色背板。',
    prevention: '边框嵌入按钮如果覆盖在边线上，选中态背景必须使用不透明色；透明度只适合不压线的普通区域。',
    keywords: ['会话按钮', '序号', '边框线', '半透明背景', 'bg-brand/10', 'EAF9FD'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-setting-outline-ai-dialogue-label-001',
    title: '大纲生成输出区仍显示 AI 对话框标题',
    area: '工作台 / 大纲 / 右侧生成输出区',
    symptom: '大纲页面右侧输出区左上角仍显示 AI对话框 标题，用户已经要求去掉 AI 对话框格式后，这个标题还残留在边框上。',
    cause:
      '上次只改了概要/章纲正式右栏，漏掉了 SETTING_TAB = 大纲 的高级右栏输出区；该分支仍有可见的 AI对话框 边框标签和隐藏 label 文案。',
    solution:
      '删除大纲生成输出区的可见 AI对话框 标签，并移除同一输出框里的隐藏 AI对话框 label 文案；同时删除大纲流程下剧情链生成输出区的同名标题；保留清空按钮、输出内容框、关联脑洞、输入框和操作按钮的原样式。',
    prevention:
      '处理大纲页面时要同时检查大纲设定生成区、概要/章纲右栏和剧情链独立分支，不能只按一个 AI对话框 搜索结果判断完成。',
    keywords: ['大纲', '生成大纲', 'AI对话框', '边框标题', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-chat-session-action-backplate-001',
    title: '正文 AI 会话工具仍有白色背板',
    area: '正文右侧 AI / 06 测试 / 会话工具',
    symptom:
      '正文右侧 AI 输出卡片左上角 + / 1 和右上角 删除 / 清空 外面仍露出横向白色底板，边框上方看起来被一整条白底垫住。',
    cause:
      '正文会话工具使用 xy-floating-chat-session-tool 和 xy-floating-chat-action-tool，这两个类仍继承通用 xy-floating-edge-tool 的白色背景与左右内边距；组件第一层容器也带 bg-white。',
    solution:
      '只把正文会话工具与动作工具的背板层改为透明，并清除外层左右内边距；保留 + / 1 / 删除 / 清空 按钮本身的背景、边框、宽高和文本样式。',
    prevention:
      '边框嵌入工具需要区分工具背板和按钮本体；截图要求无白底时，优先检查 xy-floating-edge-tool 及第一层容器，而不是删除按钮自身背景。',
    keywords: ['正文AI', '06测试', '会话按钮', '删除清空', '白色背板', 'xy-floating-chat-session-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-outline-right-output-card-layout-001',
    title: '大纲右侧 AI 输出区仍按对话框外壳布局',
    area: '工作台 / 大纲 / 右侧 AI 输出区',
    symptom:
      '大纲/章纲页面右侧把当前信息卡片和 AI对话框 外壳分成上下两块，和 06 测试里正文右侧的顶部配置、主输出卡片、下方关联输入动作格式不一致。',
    cause:
      '大纲右栏早期把 AI 输出框包在单独的圆角对话框 section 里，输出浮动边框只是其中的内部控件，导致整体层级比正文右栏多一层。',
    solution:
      '只调整布局结构，保留模型提示词、输入框、关联控件和保存复制清空按钮原有样式尺寸；拆掉正式大纲右栏的外层 AI对话框 壳，让现有输出浮动边框直接成为右栏主卡片，并把当前章节信息、关联、输入和动作按钮排在输出卡片下方。',
    prevention:
      '以后对齐正文右栏格式时，优先判断是外层结构差异还是控件样式差异；只要求格式时不要改按钮宽高、颜色或控件 class。',
    keywords: ['大纲', '章纲', '右侧AI', '输出卡片', 'AI对话框', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-session-tool-backplate-001',
    title: '脑洞会话按钮外层出现白色背板',
    area: '工作台 / 脑洞库 / 输出框会话按钮',
    symptom: '脑洞输出框左上角的 + / 1 会话按钮外面出现一条额外白色背景，和测试图里只有按钮本体的效果不一致。',
    cause:
      '会话按钮复用了通用 xy-floating-edge-tool，该工具默认给整个浮动工具加白色背景和左右内边距；组件内部容器也带了白底。',
    solution:
      '只针对 xy-floating-brainstorm-session-tool 覆盖外层和内部容器为透明背景，并清掉外层左右内边距，保留按钮自身背景。',
    prevention: '从测试页迁移浮动工具时，要区分按钮本体样式和工具背板样式，不要把通用背板一起带到不需要的位置。',
    keywords: ['脑洞页', '会话按钮', '白色背景', '背板', 'xy-floating-edge-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-question-panel-clipped-001',
    title: '脑洞右侧生成配置显示不全',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页面右侧生成配置在可用高度不足时，底部字段可能被裁掉，看起来显示不全。',
    cause: '脑洞配置面板曾使用固定隐藏溢出的布局，内容超过可视高度时没有纵向滚动承接。',
    solution: '把脑洞配置面板改为纵向可滚动、横向隐藏，并让非末尾字段保持不被压缩，避免底部字段被裁切。',
    prevention: '表单类固定面板应保留纵向滚动兜底，横向溢出单独隐藏或收缩处理。',
    keywords: ['脑洞页', '生成配置', '显示不全', 'overflow', '滚动'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-short-label-clipped-001',
    title: '脑洞题材和故事主题标签显示不全',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页“题材”和“故事主题”两个并排短框的浮动标签靠近上边缘，文字上半截被裁掉。',
    cause:
      '短框复用了通用 xy-floating-outline-compact-textarea 标签定位，top: 0 加 translateY(-50%) 会把标签顶出当前脑洞表单可视区域。',
    solution:
      '恢复短框和“主角金手指”一致的边框外浮标签样式与 52px 单行高度；只给脑洞表单顶部增加留白，避免标签被卡片上沿裁掉。',
    prevention: '脑洞这类窄字段如果使用浮动标签，应优先调整卡片高度与容器留白，不要把标签改成框内标题。',
    keywords: ['脑洞页', '题材', '故事主题', '浮动标签', '显示不全'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-count-toggle-off-001',
    title: '脑洞数量按钮选中后不能再次点击取消',
    area: '工作台 / 脑洞库 / 右侧生成配置',
    symptom: '脑洞页“一次生成几个脑洞”数量按钮点选后保持高亮，再次点击同一个数字无法取消选择。',
    cause: '数量按钮点击时始终把当前数字写入配置，没有判断当前按钮是否已选中。',
    solution: '点击已选中的数量按钮时写入空值，点击未选中的数量按钮时仍写入对应数字。',
    prevention: '胶囊选择项如果不是必填，应支持二次点击取消，并用测试覆盖选中态切换。',
    keywords: ['脑洞页', '数量按钮', '取消选择', '二次点击', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-07',
  },
];
