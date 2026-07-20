import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart23: ErrorLogEntry[] = [
  {
    id: 'workbench-brainstorm-question-label-preview-font-test-001',
    title: '脑洞输入标题字体需要先按脑洞预览风格做测试对比',
    area: '测试集合 / 边框透明背板应用预览 / 脑洞输入框',
    symptom:
      '脑洞输入框里的题材、故事主题、主角金手指等边框标题虽然已接入 T20 透明背板，但字体比脑洞预览标题更小更紧，截图里清晰度不足。',
    cause:
      '脑洞输入框标题仍沿用 compact textarea 的 0.875rem 字号和输入区上下文，而脑洞预览标题使用预览框标题视觉，二者只共享 T20 遮线规则，不共享字体规则。',
    solution:
      '先在边框透明背板应用预览测试页新增“脑洞输入标题字体对比”：左侧展示当前字体，右侧展示脑洞预览同级字号和字重方案，并继续保留 T20 透明背板。',
    prevention:
      '正式替换脑洞字段标题字体前，先用测试页对比当前版和新字体版，确认清晰度、遮线和占位文字间距都合适后再迁入正式脑洞页面。',
    keywords: ['脑洞', '输入标题', '脑洞预览字体', 'T20', '测试页'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-outline-clear-button-embedded-inside-output-frame-001',
    title: '大纲右侧清空按钮需要嵌入输出框边框内部',
    area: '作品编辑器 / 大纲 / 右侧输出框',
    symptom:
      '大纲右侧输出框的“清空”按钮即使左移后仍贴在输出框外层容器右上区域，容易和滚动条、圆角或上方模型提示词框产生遮挡，看起来像悬在边框外。',
    cause:
      '清空按钮渲染在输出框外层 relative 容器里，而不是渲染在真正的 xy-floating-field 输出边框内部；位置类只能修偏移，不能保证按钮属于输出框边框。',
    solution:
      '删除外层清空按钮，把同一个 clearOutlinePreviewDraft 功能按钮移动进输出框 xy-floating-field 内部，并新增 xy-floating-outline-inner-clear-tool 放到上边框右侧留白处；按钮继续使用 xy-border-embedded-transparent-backplate 透明背板技术。',
    prevention:
      '输出框自身的清空、字数、标题等边框工具应作为输出框内部子元素渲染；不要放在外层布局容器上再靠绝对定位模拟嵌入。',
    keywords: ['大纲', '清空按钮', '输出框', '透明背板', 'xy-floating-outline-inner-clear-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-question-labels-t20-backplate-001',
    title: '脑洞问题输入框浮动标题需要接入 T20 透明背板',
    area: '作品编辑器 / 脑洞 / 题材与构思输入框',
    symptom:
      '题材、故事主题、主角金手指、你的构思、补充内容这些输入框标题贴在边框线上，但没有使用 T20 边框嵌入式透明背板，边框线容易从文字旁边或中间穿过。',
    cause:
      'T20 规则此前主要覆盖预览框 label、字数统计和贴边工具；脑洞问题面板使用通用 xy-floating-field label，没有被纳入透明背板选择器。',
    solution:
      '把 .xy-brainstorm-question-panel 内的 xy-floating-outline-fixed label 加入 T20 透明背板规则和 ::before 中线遮罩，保留透明背景、文字描边遮线，不恢复 bg-white px-* 白底块。',
    prevention:
      '以后脑洞字段或其他边框线上浮动标题，只要标题压在边框线上，就应接入 T20 或同等透明背板规则；不要只依赖通用 floating label 的白底 padding。',
    keywords: ['脑洞', '题材', '故事主题', '浮动标题', 'T-20', 'xy-border-embedded-transparent-backplate'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-stream-toggle-height-align-001',
    title: '脑洞流式输出开关外框高度需要和字号设置对齐',
    area: '作品编辑器 / 脑洞 / 输出框底部边框工具',
    symptom: '脑洞输出框底部的“流式输出”开关外框比左侧字号设置控件矮，两个工具贴在同一条边框上时上下高度不齐。',
    cause:
      '字号设置控件通过 xy-floating-border-font-tool 显式锁定为 1.76rem 高；流式输出开关外框则依赖 padding 和内部滑块高度撑开，实际高度低于字号步进器。',
    solution:
      '给 xy-floating-border-stream-tool 显式设置 height: 1.76rem，并把上下 padding 改为 0，让外框高度与字号设置控件一致，内部滑块继续保持小尺寸。',
    prevention:
      '同一条边框上的工具应先统一外框高度，再分别调整内部图标、文字或滑块尺寸；不要让 padding 隐式决定工具外框高度。',
    keywords: ['脑洞', '流式输出', '字号设置', '高度对齐', 'xy-floating-border-stream-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-output-single-clear-button-001',
    title: '脑洞输出框右上角不应同时显示删除和清空',
    area: '作品编辑器 / 脑洞 / 输出框右上角动作',
    symptom:
      '脑洞输出框右上角显示“删除 / 清空”两个分段按钮，但用户只想保留把脑洞下方输出内容清空的功能，另一个删除条目按钮容易误解为清空输出。',
    cause:
      '上一版为了复用正文右侧动作按钮格式，把删除当前脑洞条目的 confirmDeleteEntry 和清空输出内容的 clearLibraryAiDialog 放进同一个分段按钮组，混合了两个不同语义。',
    solution:
      '确认原本清空脑洞下方输出内容的功能是 clearLibraryAiDialog；移除右上角“删除”分段，只保留单个红色“清空”按钮，继续放在 xy-floating-brainstorm-output-action-tool 位置。',
    prevention:
      '脑洞输出框右上角只承载输出框自身的轻操作；删除脑洞条目这类会进入回收站的危险操作，不要和清空输出内容混排在同一个边框按钮组里。',
    keywords: ['脑洞', '清空', '删除', 'clearLibraryAiDialog', 'xy-floating-brainstorm-output-action-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-count-align-left-with-label-001',
    title: '脑洞生成个数组合按钮需要和补充内容左侧对齐',
    area: '作品编辑器 / 脑洞 / 右侧生成表单底部',
    symptom:
      '脑洞生成数量 1/2/3/5/10 组合按钮贴近右侧生成按钮，和上方补充内容输入框左侧线不对齐，也缺少“生成个数：”说明。',
    cause:
      '上一版把生成数量作为生成按钮旁边的辅助控件，外层使用 justify-end，导致控件整体靠右，没有按表单字段左边线排布。',
    solution:
      '底部操作行改为 justify-between：左侧放“生成个数：”和 1/2/3/5/10 分段按钮，右侧保留生成按钮；标签从“生”字开始随左侧表单线对齐。',
    prevention:
      '生成参数虽然靠近生成按钮，但在表单视觉上仍应和输入字段左侧对齐；少量数字按钮需要保留明确标签，不要只显示裸数字。',
    keywords: ['脑洞', '生成个数', '组合按钮', '左侧对齐', 'brainstormCount'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-outline-clear-button-dedicated-offset-001',
    title: '大纲右侧清空按钮仍被滚动条和右上角挤住',
    area: '作品编辑器 / 大纲 / 右侧输出框',
    symptom:
      '大纲右侧输出框的清空按钮虽然改成了透明背板，但仍然贴在右上角附近，只露出一小段红字，和滚动条及圆角边框重叠。',
    cause:
      '上一版仍使用 -top-2 right-10 的通用贴边写法，对带内部滚动条的大纲右侧输出框不够；按钮没有独立避开滚动条和右上圆角。',
    solution:
      '新增 xy-floating-outline-output-clear-tool，把大纲/章纲右侧输出框清空按钮改为 top: 0、right: 5rem、translateY(-50%)，并提高到 z-40，继续使用 xy-border-embedded-transparent-backplate。',
    prevention:
      '带滚动条的右侧输出框清空按钮不要复用普通 right-4/right-10；必须使用专用偏移类，确保避开滚动条、圆角和上方配置框。',
    keywords: ['大纲', '清空按钮', '滚动条', 'xy-floating-outline-output-clear-tool', '透明背板'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-detail-outline-count-overlaps-title-001',
    title: '章纲卡片字数统计与左上标题重叠',
    area: '作品编辑器 / 章纲 / 章纲卡片左上边框',
    symptom: '章纲卡片左上角字数统计贴在“第X章章纲（第X卷）”中间，和卷号重叠，视觉上像文字挤在一起。',
    cause:
      '章纲卡片复用了通用左上字数统计偏移，原来的 7.4rem 对“第X章章纲（第X卷）”这种较长标题不够，导致字数统计没有落到标题后的空白边线处。',
    solution:
      '将章纲页专用的 --xy-floating-count-left 从 7.4rem 调整到 12.8rem，概要页仍保留 6.2rem，让章纲字数统计放到标题右侧红框位置。',
    prevention: '长标题卡片不能直接复用短标题字数统计偏移；章纲这类带卷号的标题需要单独留出标题宽度后再放字数统计。',
    keywords: ['章纲', '字数统计', '重叠', 'xy-floating-count-top-left', '--xy-floating-count-left'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-stream-toggle-label-compact-001',
    title: '脑洞流式输出开关缺少文字且滑块过大',
    area: '作品编辑器 / 脑洞 / 输出框底部流式开关',
    symptom: '脑洞输出框底部只显示一个青色滑块，没有“流式输出”文字说明，滑块本体也偏大，和边框工具位不够协调。',
    cause: '上一版按开关本体嵌入边框，只保留了 track/thumb，没有把文字标签和开关作为一个整体按钮组处理。',
    solution:
      '给 xy-floating-border-stream-tool 增加“流式输出”文字，外层改为白色小胶囊边框；缩小 track/thumb 尺寸，形成“文字 + 小滑块”的一体化边框工具。',
    prevention:
      '边框上的开关如果不是图标语义明确的控件，需要同时保留短文字说明；开关和说明文字应组成一个紧凑按钮组，而不是只放孤立滑块。',
    keywords: ['脑洞', '流式输出', '开关文字', '小滑块', 'xy-floating-border-stream-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-output-delete-clear-segmented-001',
    title: '脑洞输出框清空按钮需要改成删除清空分段按钮',
    area: '作品编辑器 / 脑洞 / 输出框右上角动作',
    symptom: '脑洞输出框右上角只有一个红色清空文字，和用户指定的删除/清空分段按钮格式不一致，位置也太靠右。',
    cause:
      '上一版把清空当作单个边框贴边文字处理，忽略了用户参考图里需要的是带白色胶囊按钮体的分段动作按钮，并且需要整体向左避开右侧圆角。',
    solution:
      '把脑洞输出框右上角改成删除/清空双按钮组：删除调用现有脑洞删除确认流程，清空继续调用 clearLibraryAiDialog；按钮组使用白色圆角边框和分隔线，并通过 xy-floating-brainstorm-output-action-tool 右侧偏移到 4.8rem。',
    prevention:
      '当用户给出正文区域动作按钮作为参考时，应复用“动作按钮组”的外观，而不是只把文字贴到边框上；贴近右上圆角的按钮组需要预留更大的 right 偏移。',
    keywords: ['脑洞', '删除', '清空', '分段按钮', 'xy-floating-brainstorm-output-action-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-preview-count-top-left-and-red-clear-001',
    title: '预览框清空按钮和字数统计贴边位置不统一',
    area: '作品编辑器 / 脑洞 / 大纲设定 / 章纲 / 概要',
    symptom:
      '脑洞输出框右上角清空仍是灰色文字和白色小按钮壳；脑洞、设定预览、章纲卡片、概要预览和右侧输出框的字数统计散落在右下角，和标题含义分离。',
    cause:
      '这些预览框沿用了早期 xy-floating-count 的右下角默认位置，脑洞清空按钮也保留了正文动作按钮的白色边框容器，没有完全按边框嵌入式透明背板规范处理。',
    solution:
      '新增 xy-floating-count-top-left，把字数统计统一移动到上边框左侧标题右边；脑洞、设定预览、章纲卡片、概要预览和右侧 AI 输出框都改用该位置；脑洞清空按钮改为红色文字，并直接使用 xy-border-embedded-transparent-backplate 透明背板。',
    prevention:
      '所有贴在预览框边框上的字数统计默认跟随左上标题，不再放到右下角；清空或删除类贴边按钮使用红色文字和透明背板，不额外包白色小按钮壳。',
    keywords: ['字数统计', '清空按钮', '边框透明背板', 'xy-floating-count-top-left', '预览框'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-stream-toggle-border-embedded-001',
    title: '脑洞流式输出需要嵌入输出框底边',
    area: '作品编辑器 / 脑洞 / 输出框底部工具',
    symptom: '脑洞输出区的流式输出还是底部操作区里的文字复选框，占用按钮行空间，和边框内嵌小开关不一致。',
    cause:
      '流式输出开关早期跟替换脑洞、保存为新脑洞放在同一操作行，使用 xy-animated-checkbox 复选框样式；但它本质是输出框参数，应该贴近脑洞输出框本身。',
    solution:
      '移除底部文字复选框，新增 xy-floating-border-stream-tool，把开关嵌到脑洞输出框底部边框、字号控件右侧；开关改为青色滑块样式，外层透明，轨道本体用白色遮线层避免边框线穿过。',
    prevention: '输出框参数类开关优先放在输出框边框工具位，外层不要加白底块；需要遮线时由控件本体或透明背板技术完成。',
    keywords: ['脑洞', '流式输出', '边框嵌入', '透明背板', 'xy-floating-border-stream-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-count-segmented-near-generate-001',
    title: '脑洞生成数量不需要单独外框',
    area: '作品编辑器 / 脑洞 / 右侧生成表单',
    symptom: '脑洞右侧表单里“一次生成几个脑洞”仍作为一个大边框输入框展示，占用一整行空间，和右下角操作区不一致。',
    cause:
      '生成数量早期被当作普通问题字段放进 BRAINSTORM_QUESTION_FIELDS 渲染列表，复用了浮动输入框外壳；但它本质是生成动作的参数，更适合贴近生成按钮。',
    solution:
      '保留 brainstormCount 数据和确认生成逻辑不变，仅跳过它在问题字段列表里的外框渲染；在右下角生成按钮左侧新增 1/2/3/5/10 分段组合按钮，并保留再次点击已选项可取消。',
    prevention:
      '生成参数类选项优先放在生成按钮附近，只有需要长文本输入的内容才放进问题字段框；不要给少量数字选项额外套大输入框。',
    keywords: ['脑洞', '生成数量', '组合按钮', 'brainstormCount', '生成按钮'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-outline-clear-button-avoid-scrollbar-001',
    title: '大纲右侧清空按钮被输出框滚动条遮住',
    area: '作品编辑器 / 大纲 / 右侧输出框',
    symptom: '大纲右侧输出框的清空贴边按钮虽然用了边框透明背板，但仍贴在最右侧，和输出框滚动条重叠，文字被滚动条遮住。',
    cause:
      '大纲和章纲右侧输出区的清空按钮仍使用 right-4，距离输出框右边太近；当输出框内部出现纵向滚动条时，按钮和滚动条落在同一视觉区域。',
    solution:
      '仅将大纲和章纲右侧输出框的清空按钮从 right-4 左移到 right-10，并增加 z-30 层级；继续保留 xy-border-embedded-transparent-backplate，不恢复白底。',
    prevention:
      '贴在带滚动条输出框右上角的清空或删除按钮，需要避开滚动条宽度，不要直接贴最右边；源码测试锁定为 right-10 z-30。',
    keywords: ['大纲', '清空按钮', '滚动条遮挡', 'right-10', 'xy-border-embedded-transparent-backplate'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-border-backplate-application-test-001',
    title: '边框透明背板候选位置需要先集中放到测试页',
    area: '测试集合 / 边框透明背板应用预览',
    symptom:
      '边框透明背板技术已经用于部分正式页面，但左上标题、右上元信息、右上清空、右下字数、左下字号、模型提示词标签、会话按钮、审核点评输出工具等候选位置分散，无法一次看全效果。',
    cause:
      '候选位置分布在大纲、章纲、脑洞、正文、角色、审核和点评等页面，直接批量改正式页面风险较高，也不方便逐项比较是否有白底、穿线或尺寸不统一。',
    solution:
      '新增边框透明背板应用预览测试页，集中展示所有建议使用该技术的位置；先只放在测试集合里预览，不批量替换正式页面。',
    prevention:
      '后续正式推广边框透明背板技术时，先按该测试页逐项验收，再迁移到对应页面，避免同类贴边内容再次出现白底块或边框线穿字。',
    keywords: [
      '边框透明背板',
      '测试页',
      'xy-border-embedded-transparent-backplate',
      '字数统计',
      '清空',
      '模型提示词标签',
    ],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-recycle-button-finalize-001',
    title: '脑洞回收站测试方案需要落到正式按钮并删除测试页',
    area: '作品编辑器 / 脑洞 / 回收站入口',
    symptom:
      '脑洞回收站按钮方案已经确认使用 D 方案，但正式脑洞页面仍是旧蓝色入口，测试集合里也继续保留脑洞回收站按钮方案页面。',
    cause:
      'A/B/C/D 方案页只用于临时挑选样式，方案确认后尚未把 D 的浅红按钮结构迁移到正式入口，也没有清理测试页和测试集合路由。',
    solution:
      '正式入口改为 D 方案浅红整行按钮，图标换用 B 方案的 Trash2 垃圾桶并改成红色；数量保留为右侧红色数字胶囊；删除 BrainstormRecycleButtonTestPage 并移除测试集合入口。',
    prevention:
      '临时 UI 方案页在用户确认某一方案后，需要同步迁移到正式页面并删除方案页入口，避免测试方案长期留在软件测试集合里。',
    keywords: ['脑洞回收站', 'D方案', 'Trash2', '测试页删除', 'BrainstormRecycleButtonTestPage'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-detail-outline-count-after-title-001',
    title: '章纲字数统计需要跟随左上标题',
    area: '作品编辑器 / 章纲 / 章纲卡片左上标题',
    symptom:
      '章纲卡片左上角显示第X章章纲和卷号，右上角显示章节正文元信息，但章纲自身字数仍在右下角，容易和章节正文字数混淆。',
    cause:
      '章纲卡片沿用了通用预览框右下角 xy-floating-count 位置，同时章纲页又在右上角展示章节正文字数，两个不同语义的字数统计被分散显示。',
    solution:
      '仅在章纲页把章纲内容字数移动到左上标题后，显示为 章纲：X字；右下角通用字数统计只保留给非章纲的章节概要卡片。',
    prevention:
      '章纲内容字数跟随左上章纲标题，章节正文字数留在右上章节元信息；后续不要把两个统计放在同一个边角或让章纲字数继续落到右下角。',
    keywords: ['章纲', '字数统计', '左上标题', 'xy-floating-count', 'WordCountText'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-detail-outline-chapter-meta-remove-body-prefix-001',
    title: '章纲贴边章节元信息不需要“正文：”前缀',
    area: '作品编辑器 / 章纲 / 章纲卡片右上角',
    symptom: '章纲卡片右上角贴边元信息显示为 第X章 章节名 正文：3056字，其中 正文： 多余。',
    cause:
      '最初添加右上角章节信息时，为了区分章纲字数和正文字数，把 正文： 写进了贴边元信息；但该位置本身已经表达章节正文信息，前缀增加了视觉噪音。',
    solution:
      '删除章纲卡片右上角贴边元信息里的 正文：，保留章节序号、章节名和字数；右侧详情说明区的 正文： 不属于贴边标题，暂不改动。',
    prevention: '边框贴边元信息要尽量短，能靠位置和上下文说明含义时，不再添加额外字段名前缀。',
    keywords: ['章纲', '章节元信息', '正文前缀', 'xy-floating-outline-chapter-meta', '贴边标题'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-output-session-controls-clear-format-001',
    title: '脑洞输出框会话按钮多余且清空按钮格式不统一',
    area: '作品编辑器 / 脑洞 / 中间输出框',
    symptom:
      '脑洞输出框左上角仍显示 + / 1 会话按钮，但这里不需要切换会话；右上角清空还是单个红色圆角按钮，和正文右侧删除 / 清空的小分段按钮格式不一致。',
    cause:
      '脑洞输出框复用了会话型 AI 输出框的左上会话工具；清空按钮单独写了一套红色按钮样式，没有复用正文边框动作按钮的高度、圆角、边框和字号。',
    solution:
      '移除脑洞输出框左上会话按钮渲染和专用会话工具 CSS；脑洞标题移回左上边框正常位置；右上角清空改成正文同款 h-7 外层加 h-6 rounded-md border 小按钮格式。',
    prevention:
      '脑洞输出框属于单内容输出/保存区，不再放 + / 1 这类会话切换控件；边框右上角轻操作优先复用正文动作按钮格式。',
    keywords: ['脑洞', '会话按钮', '清空', 'xy-floating-brainstorm-output-clear-tool', '正文按钮格式'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-generator-elastic-requirement-field-001',
    title: '脑洞生成表单底部留白过大',
    area: '作品编辑器 / 脑洞 / 右侧生成表单',
    symptom: '脑洞页面右侧生成表单里，补充内容下方到生成按钮之间出现大块空白，看起来像固定空区。',
    cause:
      '问题面板和按钮区是上下分离布局，字段列表没有填满可用高度；补充内容只保留固定最小高度，剩余高度落在字段和按钮之间，无法随未来新增按钮自动收回。',
    solution:
      '把脑洞问题面板改成纵向 flex 布局，让最后一个字段补充内容作为弹性字段占用剩余高度；字段保留 180px 最小高度，用户输入多行时继续增长，下方新增按钮时自动回缩。',
    prevention:
      '需要吸收空白的区域应放在主文本输入框本体上，不要放成固定留白；后续新增按钮时优先让弹性文本框回缩，而不是重新挤压整个表单。',
    keywords: ['脑洞', '补充内容', '弹性高度', '生成按钮', 'xy-brainstorm-question-panel'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-detail-outline-font-stepper-size-inheritance-001',
    title: '章纲边框字号控件被正文显示字号放大',
    area: '作品编辑器 / 章纲 / 边框字号设置',
    symptom: '章纲卡片左下角的字号设置控件比正文页面右侧区域的同款控件明显更大，数字输入框和加减按钮都显得膨胀。',
    cause:
      '通用 xy-floating-border-font-tool 只复用了正文 xy-floating-chat-font-tool 的定位，没有同步锁定步进器、按钮、图标和数字输入框的紧凑尺寸；章纲正文可调字号渲染后，边框工具容易跟着上下文视觉放大。',
    solution:
      '把 xy-floating-border-font-tool 和 xy-floating-chat-font-tool 合并到同一套紧凑尺寸规则里，显式固定控件本体、按钮、输入框和图标尺寸，并把工具自身字号锁为 14px。',
    prevention:
      '新增左下角边框字号设置时必须复用共享尺寸规则；不要只复用定位类，也不要让控件继承所在卡片的正文显示字号。',
    keywords: ['章纲', '字号设置', 'FontSizeStepper', 'xy-floating-border-font-tool', 'xy-floating-chat-font-tool'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-outline-embedded-title-gradient-line-mask-001',
    title: '章纲贴边标题仍有明显分割线',
    area: '作品编辑器 / 章纲 / 边框嵌入式透明背板',
    symptom:
      '章纲卡片左上标题和右上章节信息虽然已经用了透明背板和伪元素细遮罩，但边框上沿仍从文字中间完整穿过，分割感明显。',
    cause:
      '上一版 ::before 细遮罩依赖伪元素层级，实际渲染时可能落到边框层下面；文字描边只能遮住字形附近，无法稳定切断整段标题宽度内的边框线。',
    solution:
      '在 xy-border-embedded-transparent-backplate、预览框 label 和 xy-floating-count 自身增加中线 background-image: linear-gradient(...)，只覆盖文字中线区域，宽度跟随文字自身，不恢复整块白底。',
    prevention:
      '边框嵌入文字需要以元素自身背景图切断边框线，伪元素遮罩只能作为辅助；不要只靠 text-stroke 或层级不稳定的伪元素。',
    keywords: ['章纲', '边框嵌入式透明背板', '分割线', 'background-image', 'linear-gradient'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-outline-embedded-title-line-mask-001',
    title: '章纲贴边标题中间仍被边框线穿过',
    area: '作品编辑器 / 章纲 / 边框嵌入式透明背板',
    symptom:
      '章纲卡片左上角第X章章纲（第X卷）、右上章节信息等贴边文字虽然没有白底块，但边框线仍会从文字中间或字间空隙穿过去。',
    cause:
      '此前的边框嵌入式透明背板主要靠 -webkit-text-stroke 给文字本身描白边，只能遮住字形附近的线；中文标题字符之间和整段文字中线位置仍会露出边框线。',
    solution:
      '为 xy-border-embedded-transparent-backplate、预览框 label 和 xy-floating-count 增加一条很薄的 ::before 线遮罩，只覆盖边框线经过的位置；保留透明背景和零左右 padding，不恢复整块白色背板。',
    prevention:
      '边框贴边文字不能只靠文字描边遮线；需要同时使用文字描边 + 中线细遮罩，字号按钮这类控件则继续用控件本体覆盖边框线。',
    keywords: ['章纲', '边框嵌入式透明背板', '贴边标题', '线遮罩', 'xy-border-embedded-transparent-backplate'],
    updatedAt: '2026-06-07',
  },
  {
    id: 'workbench-brainstorm-output-font-tool-shellless-actions-001',
    title: '脑洞输出字号工具和底部操作区层级不统一',
    area: '作品编辑器 / 脑洞 / AI 输出区',
    symptom:
      '脑洞输出框左下角字号设置没有完全使用大纲和正文同一套边框字号工具；输出框下方的输入与保存操作区还保留 rounded-xl border bg-white p-3 卡片外壳，看起来像主输出框下面又套了一块卡片。',
    cause:
      '脑洞输出字号控件仍使用独立的 xy-floating-brainstorm-output-font-tool，和通用 xy-floating-border-font-tool 分叉；底部操作区沿用早期卡片容器，未跟随作品编辑器右侧区域无卡片化规则同步。',
    solution:
      '脑洞输出字号控件改用通用 xy-floating-border-font-tool，删除脑洞专用字号工具样式；底部操作区改为 shrink-0 space-y-3 直铺，只保留输入框、按钮组和流式输出控件自身边界。',
    prevention:
      '边框左下角字号设置统一使用 xy-floating-border-font-tool；右侧主输出框下方的动作区只承担布局，不再额外加卡片外壳。',
    keywords: ['脑洞', '字号设置', 'xy-floating-border-font-tool', '无卡片', '操作区'],
    updatedAt: '2026-06-07',
  },
];
