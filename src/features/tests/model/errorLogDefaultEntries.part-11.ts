import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart11: ErrorLogEntry[] = [
  {
    id: 'linked-brainstorm-reference-log-format-001',
    title: '关联脑洞日志需要标明仅为参考资料',
    area: '工作台 / 设定生成 / 关联脑洞 / 输出日志',
    symptom:
      '关联内容日志中使用 <关联脑洞> 这类 XML 风格标签包裹脑洞，容易让 AI 把它误识别成需要输出或导入的正文结构。',
    cause:
      '关联脑洞和作品设定导入格式都使用尖括号标签，模型容易把参考资料边界当成生成格式的一部分，进而输出额外标签或多套设定。',
    solution:
      '将关联脑洞包装为“【参考资料开始：用户关联脑洞】...【参考资料结束：用户关联脑洞】”，并在块内明确说明它只是参考资料，不是输出格式，不要照抄标签，不要单独生成设定。',
    prevention:
      '所有参考资料都应使用和导入格式明显不同的边界；不要用 <...> XML 风格标签包裹脑洞、资料或示例，避免和智能导入顶层标签混淆。',
    keywords: [
      '关联脑洞',
      '参考资料',
      '输出日志',
      '智能导入',
      'formatBrainstormReferenceForAi',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-15',
  },
  {
    id: 'detail-outline-linked-brainstorm-lost-after-log-open-001',
    title: '章纲关联脑洞后点击日志会取消关联',
    area: '工作台 / 章纲 / 关联脑洞 / 输出日志',
    symptom:
      '章纲页选择提示词并关联脑洞后，点击“日志”打开输出日志，右侧已关联的脑洞/资料状态会消失，像是日志按钮把关联取消了。',
    cause:
      'WorkbenchLibraryPanel 用 tabs 数组引用作为 normalizedTabs 的 useMemo 依赖；父组件点击日志后重新渲染并传入新的 tabs 数组，触发配置重读。未开启记忆关联时 readTabConfigs 会剥离临时关联信息，导致章纲当前会话关联丢失。',
    solution:
      '新增 tabsSignature，用标签内容签名而不是数组引用驱动 normalizedTabs；父组件普通重渲染或打开日志不再触发配置重读，章纲关联状态保持不变。',
    prevention:
      '父组件传入的数组或对象不应直接作为会话配置重读的依赖；涉及临时关联状态的面板要用稳定签名或显式变更信号来判断是否需要重读。',
    keywords: ['章纲', '关联脑洞', '日志', 'tabsSignature', 'normalizedTabs', 'readTabConfigs', 'loadedBrainstormId'],
    updatedAt: '2026-06-15',
  },
  {
    id: 'detail-outline-volume-row-count-wrapped-001',
    title: '章纲目录卷行计数被挤到下一行',
    area: '工作台 / 章纲 / 未发布目录',
    symptom: '章纲页左侧未发布目录里，卷行的“2章”计数从卷名右侧掉到下一行，下面的章节数字块看起来像被整体挤散。',
    cause:
      '章纲卷行使用了两列 grid 布局，但行内实际渲染文件夹图标、卷名、章节计数三个元素，第三个元素会自动换到下一行。',
    solution: '将章纲卷行改为横向 flex 布局，让文件夹图标、卷名和章节计数稳定保持在同一行。',
    prevention:
      '带图标、标题和计数的目录行优先使用 flex；如果使用 grid，列数必须和实际子元素数量一致，并补充防止计数换行的源码回归断言。',
    keywords: ['章纲', '未发布目录', '卷行', '章节计数', 'DETAIL_OUTLINE_VOLUME_ROW_CLASS', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-15',
  },
  {
    id: 'detail-outline-ai-output-clear-cleared-saved-outline-001',
    title: '章纲右侧 AI 输出框清空误清已保存章纲',
    area: '工作台 / 章纲 / AI 输出框',
    symptom: '在章纲页点击右侧 AI 输出框的“清空”后，左侧当前章节的章纲正文框也被清空，两个区域表现得像仍然绑定在一起。',
    cause:
      '右侧输出框清空按钮调用的清空逻辑同时执行 updateChapterSummary 或 updateVolumeSummary，把清空输出草稿误写回了已保存的章纲/梗概内容。',
    solution:
      '将 AI 输出框清空逻辑改为只停止当前 outlineAiTaskId 并清空 outlinePreviewDraft；保存的章节章纲和卷梗概只能通过正文编辑或“替换章纲/保存梗概”按钮修改。',
    prevention:
      '章纲正文框和 AI 输出框必须使用单向替换关系；所有输出框清空按钮的回归测试都要断言不调用 updateChapterSummary/updateVolumeSummary。',
    keywords: ['章纲', 'AI输出框', '清空', 'outlinePreviewDraft', 'updateChapterSummary', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-15',
  },
  {
    id: 'chapter-editor-toolbar-editor-divider-missing-001',
    title: '正文功能条和稿纸区域之间分隔线消失',
    area: '工作台 / 正文编辑器 / 功能条',
    symptom:
      '字体设置、智能排版、高频词等功能条下方原本有一条横向分隔线；正文背景统一为白色后，功能条和稿纸区域连在一起，红框中间的线不见了。',
    cause:
      '第二行功能条没有真实的 border-bottom，之前主要依赖工具条白色和正文浅灰背景之间的色差形成视觉分隔；当正文稿纸区域也统一为白色后，这个隐性分界自然消失。',
    solution:
      '给 ChapterEditor 的第二行功能条补上 border-b border-[#e1e5eb]，让功能条和正文编辑器之间始终有真实、稳定的分隔线。',
    prevention:
      '功能区和内容区之间的结构分隔要使用真实边框，不要依赖相邻背景色差；调整正文背景时同步检查功能条、标题条和底部状态条边界。',
    keywords: ['正文编辑器', '功能条', '字体设置', '智能排版', '分隔线', 'border-b', 'ChapterEditor'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'chapter-editor-paper-background-split-color-001',
    title: '正文编辑器稿纸区域和右侧露底背景颜色不一致',
    area: '工作台 / 正文编辑器 / 背景色',
    symptom: '正文界面中间虚线稿纸区域和右侧空白露底区域显示成两种浅色，分割位置突兀，像编辑区被切成两块。',
    cause:
      '正文纸面实际呈现白色，但正文外层和稿纸线右侧遮罩曾使用 #F5F5F7 / #F8FAFC；本地保存过的旧主题默认值还会继续覆盖新的 CSS 变量。',
    solution:
      '以中间虚线稿纸区域为准，将 --xy-wa-editor-bg、稿纸线遮罩色和主题颜色默认的正文输入区背景统一为 #FFFFFF；正文根容器改用 xy-wa-editor-root 读取同一个变量，并把已保存的旧 #F5F5F7 / #F8FAFC 正文背景迁移到白色。',
    prevention:
      '以后调整正文背景时要同时检查 ChapterEditor 根容器、xy-wa-editor-surface、xy-wa-editor-text-layer、getEditorGridLineStyle 遮罩、主题默认值和旧 localStorage 迁移，避免只改其中一层。',
    keywords: ['正文编辑器', '背景色', '#FFFFFF', '#F8FAFC', '#F5F5F7', '虚线稿纸', 'xy-wa-editor-bg', 'ChapterEditor'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'chapter-sidebar-chapter-row-spacing-too-tall-001',
    title: '正文左侧章节目录两章之间间隔过大',
    area: '工作台 / 正文编辑器 / 左侧章节目录',
    symptom: '卷分组下面的第1章、第2章等章节行之间视觉间隔偏长，红框位置看起来空了一大块，目录密度不够紧凑。',
    cause:
      '章节行自身使用 py-2，上下内边距叠加后让相邻章节标题之间距离过大；外层 space-y 已经很小，继续调 gap 不能解决主要空隙。',
    solution:
      '未发布 ChapterSidebar 和已发布 PublishedSidebar 的章节行都从 py-2 收紧为 py-1，保留原来的横向缩进、选中底色、右侧字数和卷分组样式。',
    prevention:
      '调整章节目录密度时优先检查条目自身 padding，再检查外层 gap；未发布和已发布两套侧栏要同步，避免切换后行距不一致。',
    keywords: ['工作台', '正文', '左侧章节目录', '第1章', '第2章', '行距', 'ChapterSidebar', 'PublishedSidebar'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'dashboard-sidebar-active-custom-color-not-applied-001',
    title: '左侧导航选中颜色修改后正式主页仍显示默认蓝色',
    area: '主页 / 主题颜色 / 左侧导航选中态',
    symptom:
      '在主题颜色中把“主页左侧导航栏选中颜色”改为 #FED7AA 后，主题页预览会变成橙色，但正式主页左侧当前导航项仍显示 #DBE7FB。',
    cause:
      '自定义颜色模型已经保存 sidebarActive 并注入 --xy-custom-sidebar-active-bg，主题页预览也读取了 previewColors.sidebarActive；但 DashboardLayout 正式导航项仍硬编码 bg-[#dbe7fb]，侧栏和底部区域也继续写死 bg-[#f5f5f7]，没有使用 xy-dashboard-sidebar/xy-dashboard-sidebar-active 变量类。',
    solution:
      'DashboardLayout 左侧 aside 改用 xy-dashboard-sidebar，底部设置组外层改用 xy-dashboard-sidebar-footer，当前导航项改用 xy-dashboard-sidebar-active；补充回归测试禁止重新出现 bg-[#dbe7fb] 选中背景，并断言 sidebarActive 会写入 --xy-custom-sidebar-active-bg。',
    prevention:
      '以后主题颜色槽位必须检查“保存、CSS 变量注入、预览、正式组件消费”四段链路；正式组件不要继续写硬编码背景色覆盖主题变量。',
    keywords: [
      '主题颜色',
      '左侧导航',
      '选中颜色',
      '#DBE7FB',
      '#FED7AA',
      '--xy-custom-sidebar-active-bg',
      'DashboardLayout',
    ],
    updatedAt: '2026-06-14',
  },
  {
    id: 'library-nav-label-renamed-materials-library-001',
    title: '库入口名称统一改为资料库',
    area: '主页 / 左侧导航 / 资料库入口',
    symptom:
      '用户希望把左侧导航里的“库”改名为“资料库”；默认导航虽然已有部分位置显示资料库，但旧保存配置归一化和返回按钮提示仍可能继续显示“库”。',
    cause:
      '导航配置里 DEFAULT_NAV_CONFIG 与 NORMALIZED_ROUTE_LABELS 不一致，/library 的默认项已经改成资料库，但归一化旧配置时仍把 /library 映射回“库”。',
    solution:
      '将 /library 的归一化标签改为“资料库”，并把封面库返回按钮提示从“返回库”改成“返回资料库”；新增导航配置回归测试覆盖旧本地配置自动改名。',
    prevention:
      '以后修改导航入口名称时，要同时检查默认配置、旧配置归一化映射、返回按钮提示和导航设置页，避免新老配置显示不同名称。',
    keywords: ['库', '资料库', '左侧导航', '/library', 'navConfig', 'NORMALIZED_ROUTE_LABELS'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'detail-outline-sidebar-replica-migrated-to-production-001',
    title: '13号章纲正文侧栏复刻测试迁入正式页',
    area: '工作台 / 章纲 / 左侧目录',
    symptom:
      '13号测试页已经确认了章纲未发布头部和第一卷行应按正文侧栏视觉复刻，但正式章纲页仍保留更小的头部、计数和卷行样式，测试集合里也继续挂着临时入口。',
    cause:
      '测试页只完成了视觉验证，没有同步收敛到 WorkbenchLibraryPanel 的正式章纲目录；临时测试入口未删除，导致方案停留在测试集合里。',
    solution:
      '把 13号测试的 h-14 头部、23px 标题、8号计数徽标、40px 展开按钮、54px 卷行、23px 文件夹图标和 17px 章节计数迁入正式章纲页；保留章纲页无加号设计，并删除临时测试页和测试集合入口。',
    prevention:
      '以后测试页方案被确认后，要在同一轮完成正式页迁入、生产回归测试和测试入口清理，避免用户还要再提醒“做进去”。',
    keywords: ['13号测试', '章纲', '正文侧栏', '1:1复刻', '未发布', '展开已发布', '第一卷', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'project-verification-temp-artifacts-and-broad-style-test-001',
    title: '项目快速验证被临时脚本和过宽样式断言阻断',
    area: '项目验证 / lint / Vitest / 运行产物',
    symptom:
      '执行 npm.cmd run verify:quick 时，lint 先被根目录临时脚本里的 JSX 片段解析错误阻断；单独跑测试时，浮动聊天按钮样式测试误扫整个 CSS，命中其它按钮组的 margin-left: -1px。',
    cause:
      '一次性修复用的 fix-shortcut-modal3.mjs 已完成使命但仍留在仓库根目录并被 ESLint 扫描；floatingChatShell.test.ts 使用全局 css 字符串断言禁止某些样式，范围超过了它真正想保护的浮动聊天按钮规则。',
    solution:
      '删除已跟踪的临时脚本和旧 Vite 日志文件；把浮动聊天按钮测试改成只检查 buttonGroupRule 与 maskRule；将错误日志默认数据拆到独立 model 文件，减少页面组件体量。',
    prevention:
      '临时修复脚本和运行日志不要进入 Git 索引；样式回归测试应锁定具体 selector 或规则片段，不要用全局 CSS 字符串做宽泛否定断言。',
    keywords: ['verify:quick', 'lint', 'Vitest', '临时脚本', '运行日志', 'floatingChatShell', 'ErrorLogPage'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'theme-color-confirm-replace-always-clickable-001',
    title: '主题颜色确认替换按钮无变化时不可点击且使用此颜色含义不清',
    area: '主页 / 主题颜色 / 自定义颜色 / 操作按钮',
    symptom:
      '自定义颜色页存在“使用此颜色”和“确认替换”两步操作，用户选择或输入颜色后仍可能看到确认替换不可点击，无法判断到底哪一个按钮才会真正生效。',
    cause:
      '“使用此颜色”只负责把手动输入框里的颜色写入草稿，而“确认替换”又依赖草稿和已保存颜色是否不同才可点击；两个按钮拆开后，手动输入、色板点击和保存反馈的状态来源不一致。',
    solution:
      '删除“使用此颜色”按钮；色板点击、原生取色器和有效 HEX 输入都会直接写入草稿并刷新预览；“确认替换”始终可点击，有变化时保存应用，无变化时提示当前没有新的颜色变化。',
    prevention:
      '设置类页面只保留一个最终确认动作；中间态应自动进入预览，确认按钮不要用禁用态隐藏原因，而是用点击反馈说明当前是否有可保存变化。',
    keywords: ['主题颜色', '自定义颜色', '确认替换', '使用此颜色', '手动色值', 'draftColors', 'DarkThemeColorPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-manual-input-confirm-disabled-001',
    title: '主题颜色手动输入有效颜色后确认替换仍不可点',
    area: '主页 / 主题颜色 / 自定义颜色 / 手动色值',
    symptom:
      '在自定义颜色右侧手动色值输入框里输入新的 HEX 颜色后，预期可以直接点击“确认替换”，但按钮仍保持禁用；用户必须额外点击“使用此颜色”或按回车才会生成待保存变化。',
    cause:
      '手动色值文本框的 onChange 只更新 manualColorValue 显示值，没有同步更新 draftColors；确认替换按钮的禁用条件依赖 draftColors 是否不同于已保存颜色，因此输入框显示已经变化但待保存草稿没有变化。',
    solution:
      '文本框 onChange 在写入 manualColorValue 后，若当前内容能规范化为有效 HEX，就立即调用 applyDraftColor 同步到 draftColors，使预览、确认替换按钮和最终写入逻辑保持一致。',
    prevention:
      '设置页里“可确认”的状态必须绑定到同一个草稿数据源；输入框显示值不要和待保存草稿长期分离，除非页面明确提示还需要二次应用。',
    keywords: [
      '主题颜色',
      '自定义颜色',
      '确认替换',
      '手动色值',
      'draftColors',
      'manualColorValue',
      'DarkThemeColorPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'dashboard-footer-settings-actions-framed-group-001',
    title: '主页左下角四个设置按钮缺少整体边界',
    area: '主页 / 左下角设置入口 / DashboardLayout',
    symptom:
      '系统设置、主题颜色、快捷键、导航设置四个按钮直接铺在左下角 footer 区里，虽然都是文字按钮，但视觉上像四个零散入口，和侧栏其它区域的分组感不一致。',
    cause:
      '此前只把图标按钮改成文字按钮，没有给四个常驻设置入口增加统一容器；footer 外层只有顶部边线，内部按钮没有共同边界。',
    solution:
      '保留四个 Link 的页面跳转功能不变，在 footer 内新增 dashboard-footer-settings-group 容器，使用浅白底、细边框、8px 圆角、轻阴影和更紧凑的 2x2 间距，把四个按钮框成一个整体。',
    prevention:
      '常驻工具入口如果数量超过两个，应优先放进统一按钮组或工具盒里；不要让多个同级小按钮直接散落在侧栏底部。',
    keywords: ['主页', '左下角', '系统设置', '主题颜色', '快捷键', '导航设置', '按钮组', 'DashboardLayout'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'dashboard-footer-settings-actions-individual-frames-001',
    title: '主页左下角四个设置按钮不应共用一个外框',
    area: '主页 / 左下角设置入口 / DashboardLayout',
    symptom:
      '系统设置、主题颜色、快捷键、导航设置四个按钮被一个整体边框包住，用户希望四个按钮分别有自己的按钮框，而不是整组共用一个大框。',
    cause:
      'footer 设置入口外层容器承担了边框、底色、圆角和阴影，单个文字按钮只在 hover/focus 时才显示边框，默认状态下视觉上仍像一个整体按钮组。',
    solution:
      '保留 2x2 网格和四个 Link 跳转不变，外层容器只负责 gap；把边框、浅底、圆角和轻阴影移到 SETTINGS_TEXT_BUTTON_CLASS，让每个按钮默认独立成框。',
    prevention:
      '用户要求“分别框起来”时，边框职责应放在单个可点击元素上；外层网格只负责排列和间距，避免整体容器样式覆盖单按钮边界。',
    keywords: ['主页', '左下角', '系统设置', '主题颜色', '快捷键', '导航设置', '分别框起来', 'DashboardLayout'],
    updatedAt: '2026-06-14',
  },
  {
    id: 'detail-outline-sidebar-unpublished-header-not-matching-body-001',
    title: '章纲未发布侧栏与正文侧栏样式不一致',
    area: '工作台 / 章纲 / 测试集合',
    symptom:
      '章纲页的未发布标题、展开已发布按钮和第一卷行与正文目录同一位置的视觉规格不同，按钮高度、圆角、间距和卷行质感不一致，用户在章纲和正文之间切换时会感觉像两套组件。',
    cause:
      '章纲目录前期围绕数字块单独做了测试页，未同步正文目录已经确认过的未发布栏和卷行样式；正文侧栏还有新增按钮，而章纲当前需求只需要同款结构并去掉新增入口。',
    solution:
      '新增“章纲正文侧栏 1:1 复刻”测试页，把未发布计数、展开已发布按钮和第一卷胶囊行按正文侧栏尺寸与配色复刻，暂时不改正式章纲页，且不包含右侧新增按钮。',
    prevention:
      '后续把测试页迁入正式章纲页时，优先复用同一套侧栏 header 和 volume row 视觉规格；如果章纲不需要新增入口，应只移除新增按钮，不重新发明按钮和卷行样式。',
    keywords: [
      '章纲',
      '正文',
      '侧栏',
      '未发布',
      '展开已发布',
      '第一卷',
      '测试页',
      'WorkbenchDetailOutlineSidebarReplicaTestPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-selected-color-targeted-fill-instead-of-ring-001',
    title: '章纲数字块选中颜色错误作用到块内底色',
    area: '主页 / 主题颜色 / 章纲数字块',
    symptom:
      '章纲数字块设置页里“选中”本应控制外侧高亮框，但选择颜色后预览和正式数字块把颜色用到了数字块内部底色，用户会误以为自己在调框色却染了块内。',
    cause:
      'detailOutlineSelected 槽位最初沿用了浅蓝底色默认值，并在 .xy-detail-outline-number-selected 中同时作为 background 使用；主题页预览也直接把 previewColors.detailOutlineSelected 赋给 backgroundColor。',
    solution:
      '将 detailOutlineSelected 的语义改为外圈高亮色，默认值改为 #08AACE；读取旧的 #E7F8FD 选中保存值时迁移到新默认外圈色；正式样式用该变量控制 border/ring，块内底色改用有章纲底色；主题页选择项和预览同步展示外圈效果。',
    prevention:
      '以后主题颜色槽位要区分“填充色、边框色、外圈高亮色”等作用区域；预览和正式 CSS 必须使用同一语义，不要只用一个 color 值同时控制 background 和 ring。',
    keywords: [
      '主题颜色',
      '章纲数字块',
      '选中',
      '外圈',
      '边框',
      'detailOutlineSelected',
      '--xy-detail-outline-number-selected',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-confirm-save-not-visibly-applied-001',
    title: '主题颜色确认替换后部分正式界面没有跟随变化',
    area: '主页 / 主题颜色 / 自定义颜色 / 全局样式变量',
    symptom:
      '用户在主题颜色中点击“确认替换”后，保存提示出现，但正文、章纲等选中态或深色主题标题栏视觉上仍保持旧颜色，看起来像没有生效。',
    cause:
      '确认替换已正确写入 localStorage 并调用 applyCustomThemeColors，但部分正式 CSS 仍写死颜色；其中 xy-selected-orange-bg 固定为 #FFF7ED，深色主题的 .app-titlebar 也用 !important 固定黑灰色覆盖了 --xy-wa-titlebar。',
    solution:
      '将 xy-selected-orange-bg 改为读取 --xy-custom-content-selected-bg；深色主题 app-titlebar 改为读取 --xy-wa-titlebar；补充样式回归测试，确保确认替换后的变量不会再被固定颜色覆盖。',
    prevention:
      '以后新增主题颜色槽位或选中态样式时，必须检查正式 CSS 是否读变量，并避免在后续 .theme-dark 或通用覆盖规则里用固定色和 !important 抢掉自定义变量。',
    keywords: [
      '主题颜色',
      '确认替换',
      '没有生效',
      'xy-selected-orange-bg',
      '--xy-custom-content-selected-bg',
      '--xy-wa-titlebar',
      'theme-dark',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-palette-duplicate-hex-values-001',
    title: '主题颜色自定义色板出现相同 HEX 的重复颜色',
    area: '主页 / 主题颜色 / 自定义颜色',
    symptom:
      '自定义颜色色板中会同时出现两个颜色值完全相同的色块，例如“浅橙”和“Orange 200”都是 #FED7AA，用户需要多扫一遍却得不到新的可选颜色。',
    cause:
      '主题色板由中文语义色和 Tailwind 色阶合并而成，合并时只检查总数，没有按 normalized HEX 去重，因此灰、红、橙、黄、绿、青、蓝等色系都可能保留重复值。',
    solution:
      '新增共享色板去重函数，按小写 HEX 保留首次出现的色块；色板目标数量改为去重后的 86 个，主题色板页和自定义颜色选择区共用同一份去重结果。',
    prevention: '以后扩展主题色板时必须按 HEX 去重后再校验数量，避免不同命名体系中的同色值重复占用选择空间。',
    keywords: ['主题颜色', '自定义颜色', '重复颜色', 'HEX', '#FED7AA', 'DarkThemeColorPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-published-lane-auto-manual-001',
    title: '章纲页缺少已发布分栏导致用过的章纲继续挤在未发布目录',
    area: '工作台 / 章纲 / WorkbenchLibraryPanel',
    symptom:
      '章纲页只有一列章节数字块，已经写完或已经随正文章节发布的章纲仍然留在未发布目录中；用户后续有数百章时，旧章纲会长期占用筛选和定位空间。',
    cause:
      '正文章节目录已有未发布/已发布分栏，但章纲目录仍按全部 volumes 直接渲染，没有独立的章纲发布状态，也没有跟随 chapter.isPublished 自动归档。',
    solution:
      '为章纲目录新增“未发布 / 展开已发布”头部和“章纲已发布”侧栏；已发布状态由正文章节 chapter.isPublished 和手动移动记录共同决定；右键数字块可移动到已发布，手动移动的条目可移回未发布，正文已发布的条目保持自动归档。',
    prevention:
      '新增章节状态类目录时，应同步考虑正文状态和派生素材状态的联动；目录类 UI 不要只新增视觉筛选，还要明确自动归档、手动归档和不可移回状态的规则。',
    keywords: ['章纲', '已发布', '未发布', 'chapter.isPublished', '右键菜单', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-13',
  },
];
