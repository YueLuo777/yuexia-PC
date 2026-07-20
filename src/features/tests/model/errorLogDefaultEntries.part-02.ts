import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart2: ErrorLogEntry[] = [
  {
    id: 'chapter-editor-review-management-modal-smaller-001',
    title: '审核页提示词管理弹窗不应接近全屏',
    area: '作品编辑器 / 剧情审核 / 提示词管理弹窗',
    symptom: '从剧情审核页面打开提示词管理时，弹窗复用工作台全局管理弹窗尺寸，宽度接近铺满屏幕，遮挡审核上下文过多。',
    cause:
      'ChapterEditor 内部审核和状态管理弹窗直接使用 WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS，该尺寸是为工作台顶部和设定/脑洞管理入口准备的大弹窗。',
    solution:
      '新增 REVIEW_MANAGEMENT_MODAL_SIZE_CLASS，将审核/状态面板内的模型管理和提示词管理弹窗限制在屏幕视觉尺寸 80% 内；嵌入页按 --xinyuexia-effective-scale 抵消软件缩放，body portal 入口使用普通 80vw/80vh。',
    prevention:
      '以后调整工作台全局管理弹窗尺寸时，不应自动套到 ChapterEditor 的审核页内管理入口；审核页入口需要保持独立的中等尺寸。',
    keywords: ['剧情审核', '提示词管理', '弹窗尺寸', 'REVIEW_MANAGEMENT_MODAL_SIZE_CLASS', 'ChapterEditor'],
    updatedAt: '2026-07-09',
  },
  {
    id: 'chapter-editor-audit-structure-prompt-format-001',
    title: '剧情审核提示词格式应匹配审核结果清单',
    area: '作品编辑器 / 剧情审核 / 提示词格式 / 审核结果清单',
    symptom:
      '结构审核提示词包含 8 个审核项，和软件中间审核结果实际显示的 6 个审核元素不一致，导致 AI 输出内容和左侧状态清单出现偏差。',
    cause:
      '工作台只追加了宽泛的覆盖这些审核元素说明，没有强制模型按软件可解析的 6 项固定格式输出；状态解析还会把是否偏离章纲里的偏离等审核项文字误判为负面结果。',
    solution:
      '剧情审核发送时追加软件固定格式，6 个项目名称与中间清单完全一致；禁止新增、删除、改名审核项；每项使用【审核项】和【结果】包起来，只允许通过或不通过，状态解析优先读取对应审核项后的【结果】字段。',
    prevention: '剧情审核提示词可以写审核方法，但最终输出格式必须由软件固定模板兜底，避免提示词项目和 UI 清单漂移。',
    keywords: [
      '剧情审核',
      '结构审核',
      '提示词格式',
      '审核结果',
      'AUDIT_STRUCTURE_PROMPT_FORMAT',
      'getAuditStructureItemStatus',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-review-result-column-no-raw-output-001',
    title: '剧情审核中间审核结果列不应显示原始 AI 输出',
    area: '作品编辑器 / 剧情审核 / 审核结果列 / 右侧 AI 输出',
    symptom:
      '剧情审核中间审核后列下方还显示正在思考、通过、已停止或整段 AI 原始输出，这些内容应放在右侧 AI 输出框；中间列标题也应叫第 N 章 审核结果。',
    cause:
      '结构化审核清单下方仍额外渲染 auditVisibleOutput，而列标题沿用审核后，导致中间结构结果区和右侧原始输出区职责混在一起。',
    solution:
      '审核列标题改为审核结果；结构审核中间列只保留总体状态卡和审核元素清单，不再渲染原始 AI 输出；右侧 AI 框继续显示思考过程和完整文字输出。',
    prevention: '结构审核的中间列只做结构化结果展示，任何原始模型输出、停止提示和思考过程都只能在右侧 AI 输出框展示。',
    keywords: [
      '剧情审核',
      '审核结果',
      '审核后',
      'AI输出',
      'auditVisibleOutput',
      'renderAiThinkingContent',
      'ChapterEditor',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-review-ai-output-right-panel-001',
    title: '剧情审核右侧 AI 框仍应显示思考和原始输出',
    area: '作品编辑器 / 剧情审核 / 右侧 AI 输出 / 审核后清单',
    symptom:
      '剧情审核发送后，右侧 AI 输出框只显示结果已显示到中间，用户看不到模型的思考内容和完整文字输出；中间审核元素清单在 AI 输出结束后可能又变成待核对。',
    cause:
      '上一轮把右侧输出框改成状态提示，移除了 renderAiThinkingContent(reviewAiOutput)；剧情审核清单项只跟随整体通过状态，没有按 AI 输出中对应审核项逐项解析。',
    solution:
      '右侧 AI 框恢复显示思考过程和原始文字输出；中间审核后仍保留结构化清单；每个审核元素按对应关键词附近的通过或不通过文字解析状态，避免整体状态回退导致清单项变回待核对。',
    prevention:
      '右侧 AI 面板是模型原始输出区，中间审核后是结构化阅读区，两者应同时保留；结构化清单不能只依赖整体结论，应支持逐项状态解析。',
    keywords: [
      '剧情审核',
      'AI输出',
      '思考过程',
      '审核后',
      '待核对',
      'renderAiThinkingContent',
      'getAuditStructureItemStatus',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-audit-prompt-subcategory-view-001',
    title: '剧情审核提示词下拉应按二级分类切换审核后视图',
    area: '作品编辑器 / 剧情审核 / 提示词下拉 / 审核后预览',
    symptom:
      '剧情审核页的审核提示词混在一个下拉框里，用户无法直观看到哪些是剧情审核提示词、哪些是文本审核提示词；选择剧情审核类提示词时，审核后仍像正文对照框。',
    cause:
      '审核二级分类只在提示词管理里存在，工作台审核页没有把二级分类渲染成下拉分组，也没有根据选中提示词的二级分类切换中间审核后视图。',
    solution:
      '将旧结构审核兼容迁移为剧情审核；审核提示词下拉按剧情审核（分类）和文本审核（分类）分组显示；选择剧情审核提示词时，中间审核后显示审核元素清单和通过状态；选择文本审核提示词时，继续显示修改后正文和段落一致性核对。',
    prevention:
      '审核页的展示形态应由选中提示词的审核二级分类驱动；新增审核二级分类时需要同步提示词管理归一化、工作台下拉分组和审核后视图测试。',
    keywords: [
      '剧情审核',
      '文本审核',
      '提示词下拉',
      '二级分类',
      '审核后',
      'AUDIT_PROMPT_SUBCATEGORIES',
      'ChapterEditor',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-review-result-middle-column-001',
    title: '剧情审核结果应显示在中间审核后列',
    area: '作品编辑器 / 剧情审核 / 审核后预览 / 右侧 AI 面板',
    symptom:
      '剧情审核发送后，AI 完整内容显示在右侧输入框上方的输出框里；用户希望结果进入中间审核后列，右侧只负责模型、提示词和发送。',
    cause:
      'reviewAiOutput 同时承担 AI 原始输出存储和右侧结果框渲染；中间预览列只按标注或空态显示，没有根据审核二级分类区分结构审核和文本审核。',
    solution:
      '右侧结果框改为状态提示，不再渲染完整 AI 内容；结构审核在中间审核后列显示通过、不通过及说明；文本审核在中间审核后列显示修改后全文，并展示原文段落数、审核后段落数和一致性提示。',
    prevention:
      '审核页的输出阅读区只保留在中间对比区；右侧 AI 面板只做配置、发送和状态反馈。文本审核必须提供段落数量核对，避免修改后正文和原文段落错位。',
    keywords: ['剧情审核', '审核后', '结构审核', '文本审核', '段落一致', 'reviewAiOutput', 'ChapterEditor'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-review-preview-empty-before-output-001',
    title: '剧情审核未输出前审核后预览列不应显示原文',
    area: '作品编辑器 / 剧情审核 / 审核后预览',
    symptom: '没有发送给 AI 时，剧情审核页面中间预览区的审核后列仍然有内容，看起来像已经做过结构审核。',
    cause:
      '非润色模式的审核后预览只判断是否有原文；即使 reviewAiOutput 为空，也会把原文段落按无标注状态渲染到审核后列。',
    solution:
      '非润色模式先判断 reviewAiOutput.trim()；没有 AI 输出时显示空态提示，不再渲染原文段落；只有真正收到审核输出后才展示带标注正文。',
    prevention: '对比预览右列必须以 AI 输出是否存在作为渲染前提，不能只根据原文是否存在决定显示内容。',
    keywords: ['剧情审核', '审核后', '预览列', 'reviewAiOutput', 'reviewOriginalParagraphs', 'ChapterEditor'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-review-output-fresh-page-empty-001',
    title: '剧情审核未发送前审核后区域应为空',
    area: '作品编辑器 / 剧情审核 / 审核后输出',
    symptom: '还没有在剧情审核页面发送给 AI，审核后区域却已经显示了内容，看起来像自动生成过。',
    cause:
      '页面启动时会从本地保存的后台任务 id 恢复输出；如果该 id 指向上一次已经完成的审核任务，旧结果也会被写回 reviewAiOutput。',
    solution:
      '新增可恢复后台任务筛选，只允许 running 且属于当前小说/当前 chapterReview 的任务自动恢复；完成、失败、中断或不匹配的历史任务 id 会从本地恢复表里清理，不再填充新打开的审核页。',
    prevention: '后台任务恢复只应用于仍在运行的任务；历史完成结果应留在日志或任务记录里，不能作为新页面的初始输出。',
    keywords: [
      '剧情审核',
      '审核后',
      '后台任务',
      'reviewAiOutput',
      'readRestorableReviewBackgroundTaskIds',
      'ChapterEditor',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-review-prompt-category-001',
    title: '剧情审核页面提示词应读取审核分类',
    area: '作品编辑器 / 剧情审核 / AI 配置 / 提示词分类',
    symptom: '剧情审核页面的提示词下拉框读取了提示词管理里的正文分类，导致审核分类下的提示词不会优先显示。',
    cause:
      '修正文通用 AI 面板提示词来源时，把 ChapterEditor 的剧情审核、综合点评、文笔润色三个独立页面也统一到了 BODY_PROMPT_CATEGORY，混淆了正文生成入口和正文审核工具入口。',
    solution:
      'WorkbenchAIPanel 继续只读取正文分类；ChapterEditor 的剧情审核恢复读取审核，综合点评读取综合点评，文笔润色读取润色，提示词管理入口同步打开当前页面对应分类。',
    prevention:
      '正文通用生成入口和剧情审核工具要分别测试；正文面板锁定正文，审核、点评、润色页面按 review mode 锁定自己的分类。',
    keywords: [
      '剧情审核',
      '审核分类',
      '提示词',
      'ChapterEditor',
      'REVIEW_MODE_PROMPT_CATEGORIES',
      'BODY_PROMPT_CATEGORY',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'workbench-ai-replace-content-auto-format-001',
    title: '正文 AI 替换正文时应自动智能排版',
    area: '正文编辑器 / 右侧 AI 输出 / 替换正文',
    symptom:
      '正文页面右侧 AI 输出点击替换正文时，AI 输出会直接写入章节，段落空行、首尾空白和智能排版设置没有自动应用。',
    cause:
      'WorkbenchAIPanel 的替换按钮只调用 onReplaceContent(stripAiThinkingBlock(output))，没有复用正文编辑器已有的 applyFormat 和 getStoredFormatSettings。',
    solution:
      '替换正文前先执行 applyFormat(stripAiThinkingBlock(output), getStoredFormatSettings())，再写入章节；提示文案改为“已智能排版并替换正文”。',
    prevention: 'AI 输出写回正文的路径应和手动智能排版使用同一套格式化函数，避免同一正文来源产生两种排版规则。',
    keywords: ['正文AI', '替换正文', '智能排版', 'applyFormat', 'getStoredFormatSettings', 'WorkbenchAIPanel'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'workbench-ai-panel-send-with-linked-context-001',
    title: '正文 AI 输入为空但有关联内容时应允许发送',
    area: '正文编辑器 / 右侧 AI 输入 / 关联内容',
    symptom:
      '正文页面右侧 AI 输入框不输入内容时，发送按钮不可用；即使已经关联章纲、资料或章节内容，也无法直接让 AI 根据关联内容生成正文。',
    cause:
      'WorkbenchAIPanel 的发送函数和按钮禁用条件都只判断 input.trim()，没有把已关联资料或已关联章节正文作为可发送上下文。',
    solution:
      '发送条件改为输入内容或关联上下文至少存在一个；空输入但有关联内容时，发给模型的额外写作要求为空，只携带关联上下文和正文提示词，聊天记录显示“使用关联内容生成正文”。',
    prevention:
      '正文 AI 面板的发送可用性应基于最终请求是否有有效内容，而不是只看输入框；测试锁定空输入加关联内容可发送。',
    keywords: ['正文AI', '空输入发送', '关联章纲', '关联资料', 'WorkbenchAIPanel', 'canSendMessage'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'chapter-editor-body-prompt-category-001',
    title: '正文页面提示词应读取提示词管理的正文分类',
    area: '正文编辑器 / AI 配置 / 提示词分类',
    symptom: '正文页面右侧通用 AI 配置里的提示词使用排除列表过滤，导致题材迭代等非正文提示词仍可能出现在正文生成入口。',
    cause:
      'WorkbenchAIPanel 只排除少数分类，没有正向限定正文分类，导致正文页通用 AI 提示词来源和提示词管理里的正文分类不一致。',
    solution:
      '新增 BODY_PROMPT_CATEGORY = 正文；WorkbenchAIPanel 的提示词候选统一过滤正文分类；状态更新提示词继续读取更新状态分类，剧情审核、综合点评、文笔润色继续读取各自分类。',
    prevention:
      '正文通用生成入口用正文；审核、点评、润色页面按自己的分类读取；测试同时锁定正文面板和审核工具，避免两类入口再次混用。',
    keywords: ['正文页面', '提示词', '正文分类', 'WorkbenchAIPanel', 'BODY_PROMPT_CATEGORY'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'workbench-structured-setting-local-draft-input-001',
    title: '作品设定等结构化页面智能导入后仍应能自由输入',
    area: '工作台 / 设定 / 结构化字段 / 智能导入',
    symptom:
      '作品设定、伏笔、道具资源等结构化页面在智能导入设定后，字段内容虽然能被拆进各个框，但继续输入时可能出现字符不显示或被旧解析结果覆盖。',
    cause:
      '结构化设定字段的 value 直接来自每次解析 currentSelectedSetting.body；输入时又立即序列化整组字段并触发父级保存，父级重渲染期间如果仍以旧 body 解析，就会把当前按键覆盖掉。',
    solution:
      '新增结构化设定字段草稿快照，按条目 id、字段集 id 和 body 匹配；输入时先写草稿保证即时显示，再保存新的结构化 body；如果智能导入或外部操作替换了 body，旧草稿自动失效并使用最新解析内容。',
    prevention:
      '所有智能导入后可编辑的结构化字段都要走同一套草稿解析规则；测试覆盖导入后继续输入，以及导入新 body 时旧草稿不能污染新内容。',
    keywords: [
      '作品设定',
      '智能导入',
      '结构化字段',
      'currentSelectedSetting',
      'structuredSettingFieldDraft',
      'resolveStructuredSettingDraftFields',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'workbench-role-base-setting-local-draft-input-001',
    title: '人物基础设定输入不应被父级重渲染吞掉',
    area: '工作台 / 人物设定 / 基础设定输入框',
    symptom:
      '人物基础设定里的外貌、别称、核心性格等框在旧字段标题残留修复后，可能出现打字后字符不显示，像输入框无法输入。',
    cause:
      '这些 textarea 完全由父级解析后的 baseSetting 控制；输入时会立即序列化整组字段并触发父级重渲染，如果父级保存或解析同步期间仍拿到旧内容，当前按键会被旧值覆盖。',
    solution:
      'RoleBaseStateEditor 为人物基础设定字段增加本地草稿状态；按键先写入本地草稿保证即时显示，再同步序列化保存到角色内容；切换角色或外部内容变化时再从最新 baseSetting 同步草稿。',
    prevention:
      '需要逐字输入的结构化字段不要只依赖父级解析结果作为唯一显示源；编辑器组件应先持有本地草稿，并用渲染测试覆盖旧残留数据打开后输入一个字仍显示并保存。',
    keywords: [
      '人物设定',
      '基础设定',
      '无法输入',
      'RoleBaseStateEditor',
      'baseSettingFieldDrafts',
      'parseRoleBaseSettingFields',
    ],
    updatedAt: '2026-07-08',
  },
  {
    id: 'workbench-structured-setting-inline-field-parser-001',
    title: '结构化设定字段不应把标题串进输入框',
    area: '工作台 / 设定 / 结构化输入框',
    symptom:
      '人物设定等输入框里出现“【称号/外号/别称】：发”“【核心性格】：”，或只剩“【称号/外号/别称】”这类字段标题文本，打开页面一开始就出现，删除后也容易被解析回错误字段。',
    cause:
      '共用的 parseSectionedSettingBody 只识别字段标题后换行再写内容的格式，没有识别 AI 输出和导入文本常见的“【字段名】：内容”同一行格式，也没有把旧数据里残留的“【字段名】”孤立标题当作字段边界。',
    solution:
      '解析器改为逐行识别字段标题，支持字段标题后同一行内容、换行内容、中文冒号、英文冒号和无冒号孤立标题；人物基础设定、结构化作品设定、智能导入和导入预览统一走修复后的解析逻辑。',
    prevention:
      '结构化字段解析测试必须覆盖同一行格式、多行格式、孤立标题旧数据和人物基础设定，避免模板变化造成字段串位。',
    keywords: ['工作台', '设定', '人物设定', '结构化字段', 'parseSectionedSettingBody', '智能导入'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'editor-paper-baseline-low-line-migrated-to-production-001',
    title: '正文稿纸线正式迁入贴脚低线方案',
    area: '作品编辑器 / 正文 / 稿纸线',
    symptom:
      '测试页确认“贴脚低线”最接近字站在线上的效果后，正式正文仍使用旧的字号倍率和 underlineGapPx 公式会让虚线位置与测试结果不一致。',
    cause:
      '旧实现用 fontSize * lineHeight 计算虚线间距，并额外用 underlineGapPx 推导线位；测试确认的方案改为 rowHeight=max(字号+20, 字号*1.75)、lineOffset=rowHeight-1。',
    solution:
      '新增 getEditorGridLineMetrics 和 getEditorTextLineHeight；正式稿纸线、正文 textarea、字体设置预览和高频词覆盖层共用同一套 20px 行距补偿与 1px 贴脚线位。',
    prevention:
      '以后调整正文稿纸线时必须同步修改背景线、正文输入层和覆盖层行高，并用 ChapterEditorGridLine.test 锁住公式，避免只改虚线不改文字行盒。',
    keywords: ['正文', '稿纸线', '贴脚低线', 'getEditorGridLineMetrics', 'getEditorTextLineHeight', 'lineHeight'],
    updatedAt: '2026-07-06',
  },
  {
    id: 'editor-paper-baseline-test-needs-side-by-side-presets-001',
    title: '稿纸线测试页需要并排对照而不是单一预览',
    area: '测试集合 / 正文稿纸线基准对齐测试',
    symptom: '测试页只显示一个可调预览时，文字仍然像吊在虚线下方，用户难以判断是线位偏上还是行距过松。',
    cause:
      '稿纸线效果受字体、字号、行高和虚线偏移共同影响；只靠一个滑杆和一个大预览，无法直观看出“当前偏吊”和“图2方向”的差异。',
    solution:
      '将测试页改成四个并排预设：当前偏吊、贴脚低线、图2方向、紧凑图2；默认选中贴脚低线，并保留线距本行底部与行距补偿两个滑杆用于微调。',
    prevention:
      '以后验证字体基线、稿纸线、分割线这类体感 UI 时，测试页应提供真实大预览和并排对照方案，避免只凭一个参数来回试。',
    keywords: ['稿纸线', '基线', '虚线', '并排对照', 'EditorPaperBaselineGridTestPage'],
    updatedAt: '2026-07-06',
  },
  {
    id: 'editor-paper-baseline-test-needs-adjustable-foot-gap-001',
    title: '稿纸线测试页需要可调线位而不是固定公式',
    area: '测试集合 / 正文稿纸线基准对齐测试',
    symptom: '固定线位方案仍不像参考图，文字看起来夹在两条虚线之间，缺少“字站在线上方”的承托感。',
    cause:
      '不同字体、系统缩放和 textarea 渲染会改变中文实际字形底部位置，仅靠 rowHeight - 8 这类固定值无法一次命中视觉目标。',
    solution:
      '测试页新增“线距本行底部”控制：默认 4px，并提供 2px、4px、6px 三个方案按钮和 0-12px 微调滑杆；虚线位置按 rowHeight - footGapPx 计算，方便先用测试页调出最接近参考图的值。',
    prevention:
      '正式迁入前先让用户在测试页确认 footGapPx；涉及字体视觉基线的规则不要只依赖数学公式，应提供可验证的视觉参数并锁定最终确认值。',
    keywords: ['稿纸线', '线位', '字站在线上', 'footGapPx', 'EditorPaperBaselineGridTestPage'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'editor-paper-baseline-test-line-start-padding-001',
    title: '稿纸线测试页的虚线起点应跟文字起点一致',
    area: '测试集合 / 正文稿纸线基准对齐测试',
    symptom: '测试页里文字看起来吊在虚线下方，而不是像参考图那样站在虚线上方。',
    cause:
      'textarea 有上内边距，但虚线背景从容器最上方开始重复，导致第一条虚线提前出现；同时线位 rowHeight - 5 偏低，不利于形成“字站在线上”的视觉。',
    solution:
      '给稿纸线背景增加 backgroundPosition: 0 PAPER_TOP_PADDING_PX，让虚线从文字区域起点开始铺；线位改为 rowHeight - 8，使虚线位于字形下方而不是穿过或压住文字上方。',
    prevention:
      '正式迁入编辑器时，稿纸线背景的纵向起点必须和 textarea 文本 paddingTop 共用同一个值；调整 line offset 时要用视觉目标“字站在线上”校准，而不是只看行盒数学位置。',
    keywords: ['稿纸线', '虚线', '文字起点', 'paddingTop', 'baseline', 'EditorPaperBaselineGridTestPage'],
    updatedAt: '2026-07-05',
  },
  {
    id: 'test-collection-remove-seven-completed-tested-pages-001',
    title: '已测试分栏里的已完成临时测试应从测试集合删除',
    area: '测试集合 / 已测试 / 临时测试页清理',
    symptom: '已测试分栏里保留了 7 个已经做完并迁入正式功能的临时验证页，继续显示会干扰后续只看未完成测试。',
    cause:
      '这些测试页完成后只标记为已测试，尚未同步删除 TestCollectionPage 入口、render 分支、独立测试页文件和专属单测。',
    solution:
      '删除正文目录左移、设定标签布局、工作台流程按钮固定、发送箭头颜色、结构审核结果展示、审核润色宽度模式、右侧 AI 区统一宽度 7 个测试入口及对应页面/单测，并加入 TestCollectionDeleteMarkedCleanup 守护清单。',
    prevention:
      '以后用户明确说已测试内容都做完时，要同时清理测试集合入口、lazy import、render 分支、页面文件、专属测试和本地已测试记录过滤，避免测试集合积累已完成临时页。',
    keywords: [
      '测试集合',
      '已测试',
      '删除测试',
      '临时测试页',
      'TestCollectionPage',
      'TestCollectionDeleteMarkedCleanup',
    ],
    updatedAt: '2026-07-05',
  },
];
