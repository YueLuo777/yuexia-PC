import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart14: ErrorLogEntry[] = [
  {
    id: 'workbench-ai-linked-context-clear-and-chapter-priority-001',
    title: '正文 AI 已关联资料需要可取消并允许切回本章',
    area: '作品编辑器 / 正文 / AI 面板 / 关联资料',
    symptom:
      '正文 AI 面板显示“已关联资料”后没有直观的取消入口；点击“本章”时，已关联资料仍可能占用上下文，导致无法切回本章内容。',
    cause:
      'AI 面板只有打开资料库和切换本章的按钮，没有单独的清除资料按钮；同时 linkedContextItems 会包含父页面合并进来的资料，旧逻辑会让资料优先于本章。',
    solution:
      '在“已关联资料”右侧新增红色取消按钮；点击“本章”时清空资料关联并启用本章；预览和真实发送都在本章启用时忽略资料列表，让本章内容优先。',
    prevention:
      '以后调整正文 AI 关联控件时，资料、本章和取消三个动作要保持互斥清晰；发送逻辑和预览日志必须共用同一套优先级。',
    keywords: ['正文AI', '关联资料', '取消关联', '本章', 'WorkbenchAIPanel', 'linkedContextItems'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-ai-link-toggle-buttons-001',
    title: '正文 AI 取消关联应并入本章和资料按钮',
    area: '作品编辑器 / 正文 / AI 面板 / 关联按钮',
    symptom:
      '正文 AI 面板里“已关联资料”旁边额外出现红色 X，取消入口和资料按钮分离；用户希望再次点击已关联的本章或资料按钮即可取消关联。',
    cause:
      '旧交互把“打开资料弹窗”和“取消资料关联”拆成两个控件，本章按钮虽然可以切换，但资料按钮已关联时仍只表达状态，取消动作靠旁边小按钮完成。',
    solution:
      '资料按钮在已关联资料时直接调用清空关联并返回，不再打开弹窗；本章按钮继续以同一按钮切换关联/取消，并在关联本章时清空资料；删除右侧单独红色取消资料按钮。',
    prevention:
      '正文 AI 关联区保持两个主按钮承担切换行为：已关联状态下再次点击即取消；不要恢复独立的红色取消关联按钮或让资料按钮已关联时继续打开弹窗。',
    keywords: ['正文AI', '关联本章', '关联资料', '取消关联', '按钮切换', 'WorkbenchAIPanel'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-sidebar-bold-navigation-test-001',
    title: '正文与资料库左侧导航需要加粗方案测试',
    area: '测试集合 / 作品编辑器 / 左侧导航',
    symptom:
      '用户希望先观察正文目录里的第一卷、章节，以及脑洞、设定等页面的分组和设定条目加粗后的效果，避免直接改正式样式后不合适。',
    cause:
      '正文目录和资料库目录的字重分散在不同组件与页面里，直接落正式版会同时影响卷、章节、分组、设定条目和字数显示。',
    solution:
      '新增 WorkbenchSidebarBoldNavigationTestPage，只在测试集合里对比当前样式和加粗方案，覆盖正文第一卷/章节、脑洞库、世界观设定和人物设定等分组与条目。',
    prevention:
      '以后调整左侧导航字重时，先在测试页对比密度和可读性；正式迁入时再分别处理 ChapterSidebar、PublishedSidebar 和 WorkbenchLibraryPanel。',
    keywords: ['左侧导航', '加粗', '正文目录', '第一卷', '章节', '脑洞', '设定', '测试集合'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'chapter-sidebar-selected-orange-001',
    title: '正文目录选中章节应使用浅橙强调',
    area: '作品编辑器 / 正文目录 / 章节选中态',
    symptom: '正文目录当前章节仍使用浅青蓝选中态，和用户确认的橙色参考样式不一致。',
    cause: 'ChapterSidebar 的章节项选中态沿用了全局浅青蓝方案，没有为正文当前章节使用更醒目的橙色强调。',
    solution:
      '将正文目录章节选中态改为 #FFF7ED 浅橙底、#FDBA74 橙色边框、#F97316 标题文字，并保留右侧字数 #2563EB 蓝色强调。',
    prevention:
      '以后调整章节目录选中态时要区分正文目录和已发布目录；正文当前章节可使用橙色强调，已发布列表保持原有样式时不要误改。',
    keywords: ['正文目录', '章节选中态', '橙色', '#FFF7ED', '#FDBA74', '#F97316', 'ChapterSidebar'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-flow-button-option-d-official-summary-warning-001',
    title: '顶部流程按钮应使用小号上下排并提示梗概缺章',
    area: '作品编辑器 / 顶部流程按钮 / 梗概统计',
    symptom:
      '正式顶部栏使用横向大按钮后占用空间过多；梗概数量少于正文数量时仍显示普通颜色，用户不容易发现还有章节没有梗概。',
    cause:
      '测试页 D 方案尚未迁入正式 CSS；梗概 flowStats 只显示 summaryContextItems.length，没有和正文 chapterCount 对比。',
    solution:
      '将 xy-flow-status-button 改为 38px 左右的小号上下排；梗概统计改为 summaryChapterCount，少于 chapterCount 时设置 tone: warning，等于时恢复 normal。',
    prevention:
      '以后迁入流程按钮测试方案时要同时改正式 CSS、Header 测试和 WorkbenchPage 的真实统计逻辑；梗概这类补齐型数据必须和正文总章数对比。',
    keywords: ['流程按钮', '方案D', '小号上下排', '梗概', '未补齐', 'warning', 'WorkbenchHeader', 'flowStats'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'chapter-editor-paragraph-wrap-indent-001',
    title: '正文段落缩进不应让自动换行伪装成多段',
    area: '作品编辑器 / 正文 / 段落缩进 / 稿纸线',
    symptom: '开启段落缩进后，一段很长的文字自动换成多行时，每一行都从缩进位置开始，看起来像被拆成了多段。',
    cause:
      '上一版把段落缩进实现为 textarea 和 HighlightOverlay 的整体 paddingLeft 增加 2em；padding 会影响所有自动换行后的视觉行，所以同一段的第二、第三行也被缩进。',
    solution:
      '将正文输入层和高频词覆盖层的 paddingLeft 固定为 EDITOR_GRID_LINE_LEFT_OFFSET_PX；段落缩进只通过 textIndent: 2em 表达，让段首右移，自动换行的后续行回到稿纸线起点。',
    prevention:
      '以后调整段落缩进时，不要用整体 padding 或真实全角空格模拟段首；需要同时检查长段落自动换行、右侧换行边界和 HighlightOverlay 对齐。',
    keywords: ['正文编辑器', '段落缩进', '自动换行', 'textIndent', 'paddingLeft', '稿纸线', 'HighlightOverlay'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-soft-cyan-option-01-official-001',
    title: '作品编辑器正式主题应使用 01 浅青蓝方案',
    area: '作品编辑器 / 顶部流程按钮 / 章节侧栏 / AI 面板 / 全局品牌色',
    symptom:
      '测试中确认的 01 浅青蓝方案尚未统一迁入正式版，正式页面仍会在选中态、主要按钮、章节分组、拖拽线和蓝色边框上出现旧的深蓝色。',
    cause:
      '正式页面同时使用 Tailwind brand 色、writer-assistant-theme 全局映射、xy-flow-status 自定义类和局部硬编码 #1E71EF，单独改测试页无法影响正式页面。',
    solution:
      '将 Tailwind brand 和 writer-assistant-theme 变量切到 #08AACE / #E7F8FD / #BDEEF7；流程按钮选中态、章节分组、拖拽线和正式按钮 hover 统一迁入浅青体系。',
    prevention:
      '以后调整作品编辑器主色时，要同步检查 tailwind.config.js、src/shared/styles/index.css、WorkbenchHeader、ChapterSidebar、PublishedSidebar、ChapterEditor、WorkbenchLibraryPanel 和 WorkbenchPage。',
    keywords: ['01浅青蓝', '#08AACE', '#E7F8FD', '#BDEEF7', '作品编辑器', '流程按钮', '章节侧栏', 'brand'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-visual-indent-grid-origin-001',
    title: '正文段落缩进应使用视觉缩进并对齐稿纸线有效范围',
    area: '作品编辑器 / 正文 / 段落缩进 / 稿纸线',
    symptom: '开启段落缩进后，正文里会写入两个真实全角空格；文字起点和稿纸线起点不一致，长行尾部还会超过右侧虚线终点。',
    cause:
      '旧实现把段落缩进当成正文内容写入，并为这些全角空格增加了光标夹取和拖选保护；同时 textarea 左右内边距没有同时复用稿纸线左右偏移，导致文字有效输入范围和虚线有效范围不一致。',
    solution:
      '编辑器输入、粘贴和智能排版统一调用 stripLineIndents 清理真实行首空格；回车只插入换行符；段落缩进改用动态左内边距表现；textarea 与高频词覆盖层共用 EDITOR_GRID_LINE_LEFT_OFFSET_PX 和 EDITOR_GRID_LINE_RIGHT_OFFSET_PX 作为左右有效范围。',
    prevention:
      '以后不要再用全角空格实现正文段落缩进；调整稿纸线时必须同步检查 textarea、HighlightOverlay 和 getEditorGridLineStyle 的左右起止点是否一致。',
    keywords: [
      '正文编辑器',
      '视觉缩进',
      '段落缩进',
      '稿纸线',
      '全角空格',
      'paddingLeft',
      'paddingRight',
      'EDITOR_GRID_LINE_LEFT_OFFSET_PX',
      'EDITOR_GRID_LINE_RIGHT_OFFSET_PX',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-grid-line-repeat-top-leak-001',
    title: '正文光标上方不应露出上一格稿纸线',
    area: '作品编辑器 / 正文 / 字体设置 / 稿纸线',
    symptom: '正文开启虚线稿纸后，光标所在行上方又出现一条虚线，看起来像多出了一行上沿线。',
    cause:
      '稿纸线背景使用 repeat-y，浏览器会以 backgroundPosition 为基准向上重复上一格；移除旧顶部遮罩后，上一格里的虚线也被绘制到了编辑器顶部。',
    solution:
      '保留光标下方第一条稿纸线，同时新增 repeatedTopLineMaskHeightPx，只遮住 repeat-y 向上多出来的顶部线；右侧遮罩继续隐藏贴边线段。',
    prevention:
      '以后调整稿纸线时要区分“上一格重复线”和“当前输入行下方线”，顶部遮罩只能覆盖上一格线，不能整行盖住第一条有效稿纸线。',
    keywords: ['正文编辑器', '稿纸线', '虚线', '光标上方', 'repeat-y', '顶部遮罩', 'repeatedTopLineMaskHeightPx'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-flow-button-stats-option-c-official-001',
    title: '测试10 C方案需要迁入正式流程按钮',
    area: '作品编辑器 / 顶部流程组合按钮',
    symptom:
      '测试10里确认的 C 方案只存在于测试集合，正式作品编辑器顶部仍是纯文字按钮，用户无法直接看到脑洞、设定、章纲、正文和待处理章节数量。',
    cause:
      'WorkbenchHeader 只接收流程 title，正式页面没有向 Header 传入真实统计；资料库条目变化也不会触发父页面刷新，导致即使读取 localStorage 也容易变成静态快照。',
    solution:
      '为 WorkbenchHeader 增加 flowStats，正式页按当前作品计算脑洞/设定/章纲/正文/梗概数量，并用章节数显示审核、点评和状态待处理；接入 WORKBENCH_LIBRARY_UPDATED_EVENT 让资料库增删后顶部数字同步刷新。',
    prevention:
      '以后测试页方案正式迁入时，同步迁入真实数据来源、刷新机制和 Header 单测，避免只复制演示样式或静态文案。',
    keywords: [
      '测试10',
      'C方案',
      '流程按钮',
      '数量胶囊',
      'WorkbenchHeader',
      'flowStats',
      'WORKBENCH_LIBRARY_UPDATED_EVENT',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-caret-line-grid-hidden-001',
    title: '正文光标所在第一行没有稿纸虚线',
    area: '作品编辑器 / 正文 / 字体设置 / 稿纸线',
    symptom: '空正文或光标停在第一行时，光标下方没有虚线，第二行开始才显示稿纸虚线，看起来像当前输入行漏掉了虚线。',
    cause:
      'getEditorGridLineStyle 为了清理顶部多余线段加入了全宽顶部遮罩，遮罩高度覆盖到第一条稿纸线，导致第一行虚线被整行盖掉。',
    solution:
      '移除全宽顶部遮罩，只保留右侧遮罩和从左侧固定偏移开始绘制的 SVG 稿纸线；这样第一行光标下方也会显示虚线，同时右侧仍保留留白。',
    prevention:
      '以后调整稿纸线边缘清理时，不要用全宽顶部遮罩覆盖整行；应通过 SVG 起点、右侧遮罩或局部遮罩处理边缘线段，并用测试锁住 firstLineCoverHeightPx 不再出现。',
    keywords: ['正文编辑器', '光标', '第一行', '稿纸线', '虚线', '顶部遮罩', 'getEditorGridLineStyle'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-flow-button-selected-left-border-fuzzy-001',
    title: '测试10选中流程按钮左侧边线发虚',
    area: '测试集合 / 作品编辑器流程按钮信息化方案',
    symptom:
      '方案 A/B/C 中非首位按钮被选中时，按钮左侧蓝线看起来发虚或像灰线叠在一起，尤其是正文、梗概这类中间或末尾按钮明显。',
    cause:
      '流程按钮使用 border-y border-r first:border-l，非第一个按钮没有自己的左边框；选中态左侧视觉线来自相邻按钮的右边框，且 inset 阴影为半透明，导致边线发虚。',
    solution:
      '将按钮改为完整 border，并用 -ml-px 合并相邻边框；选中按钮加 z-10 覆盖相邻按钮边框，同时把内阴影改为实色 #1e71ef，让左侧边线清晰。',
    prevention:
      '分段按钮只要存在选中态边框，就不要只画右边框；应让每个按钮都有完整边框，并用负边距和 z-index 解决相邻边框叠线问题。',
    keywords: ['测试10', '流程按钮', '选中态', '左侧边线', 'border-y', 'z-10', 'WorkbenchFlowButtonStatsTestPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-soft-cyan-option-c-theme-override-001',
    title: '测试06 C方案文字色被全局主题蓝覆盖',
    area: '测试集合 / 作品编辑器浅青按钮状态测试 / 方案 C',
    symptom: '方案 C 源码里写了 text-[#08AACE]，但实际看起来仍不像 #08AACE，用户指出文字颜色不对。',
    cause:
      '测试页运行在 writer-assistant-theme 下，全局样式会把 .text-[#08AACE] 强制映射为 var(--xy-wa-blue)，导致 Tailwind 任意色类不等于实际显示色。',
    solution:
      '给 C 方案按钮增加 xy-soft-cyan-force-text，并在测试页内用更高优先级 CSS 将该类固定为 color: #08AACE !important；组合按钮、流程按钮、章节按钮和底部非危险按钮一起接入。',
    prevention:
      '以后在测试页验证精确色值时，不只看类名是否包含色值，还要检查是否被 writer-assistant-theme 的全局色彩映射覆盖；必要时使用测试页局部强制类。',
    keywords: ['测试06', '方案C', '#08AACE', 'writer-assistant-theme', 'xy-soft-cyan-force-text', '浅青按钮'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-grid-line-faint-top-edge-001',
    title: '正文稿纸线顶部遮罩边缘残留淡虚线',
    area: '作品编辑器 / 正文 / 稿纸线',
    symptom: '光标下方第一条可见虚线比其他虚线更淡，像是被半透明盖住或只显示了一部分。',
    cause:
      '顶部遮罩高度使用 lineOffset + 1，刚好压在第一条 1px SVG 虚线的抗锯齿边缘上，浏览器在遮罩边界处混合渲染，留下淡线残影。',
    solution:
      '新增 EDITOR_GRID_LINE_TOP_MASK_EXTRA_PX = 4，把顶部遮罩从临界 1px 扩大到完整覆盖第一条线和抗锯齿边缘，后续虚线不受影响。',
    prevention: '以后做背景线遮罩时不要让遮罩边界正好落在线条中心或边缘上，至少预留 3-4px 额外覆盖，并用测试锁住常量。',
    keywords: ['正文编辑器', '稿纸线', '虚线', '淡线', '顶部遮罩', '抗锯齿', 'EDITOR_GRID_LINE_TOP_MASK_EXTRA_PX'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-soft-cyan-button-text-option-c-001',
    title: '浅青按钮测试需要明确展示文字也变为 #08AACE 的 C 方案',
    area: '测试集合 / 作品编辑器浅青按钮状态测试',
    symptom:
      '浅青按钮测试页的方案容易被理解成只改了按钮底色和边框，用户指出按钮文字没有明确换成 #08AACE，需要新增 C 方案单独对照。',
    cause:
      'A/B 方案把重点放在选中底色和边框降噪，未选中按钮仍保留灰色文字，组合按钮也没有传入完整变体，导致“按钮文字统一青色”的效果不够直观。',
    solution:
      '新增 cyanText 变体和方案 C：选中按钮继续使用 #E7F8FD 底色 + #08AACE 文字，未选中按钮保持白底但文字也改为 #08AACE；组合按钮、流程按钮和左侧章节按钮一起接入。',
    prevention:
      '以后做配色测试时，如果用户指定“底色”和“字体颜色”，测试页需要单独给出文字色强制统一的方案，避免只在选中态或局部按钮上体现。',
    keywords: ['浅青按钮', '方案C', '#08AACE', '#E7F8FD', '按钮文字', 'WorkbenchSoftCyanButtonStyleTestPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-grid-line-edge-mask-001',
    title: '正文稿纸线首行和右侧贴边线段需要隐藏',
    area: '作品编辑器 / 正文 / 字体设置 / 稿纸线',
    symptom: '正文编辑器开启虚线后，工具栏下方第一条稿纸线过早出现；右侧边缘还能看到一小段虚线，视觉上贴到右侧区域。',
    cause:
      '稿纸线背景只控制了左侧 x1 偏移，SVG 仍一直绘制到超宽画布右侧；首条背景线也会按第一组 tile 直接露出，没有单独避开顶部空白。',
    solution:
      '在 getEditorGridLineStyle 里增加同色遮罩层：顶部遮罩盖掉第一条稿纸线，右侧 64px 遮罩盖掉贴边线段；保留原有左侧 64px 起线和字号联动行距。',
    prevention:
      '以后调整稿纸线时同时检查左起点、右边距和顶部首行，不只看虚线是否跟随字号变化；需要用测试锁住背景层顺序和遮罩尺寸。',
    keywords: ['正文编辑器', '稿纸线', '虚线', '右侧边距', '顶部遮罩', 'getEditorGridLineStyle', 'ChapterEditor'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'novel-library-recent-title-and-organize-icon-001',
    title: '最近编辑标题过大且作品整理标题图标多余',
    area: '我的小说 / 顶部四卡片 / 作品整理与最近编辑',
    symptom:
      '最近编辑卡片标题字号明显大于作品整理，视觉重心过重；作品整理标题左侧还有一个归档图标，和当前简洁卡片标题层级不一致。',
    cause:
      '最近编辑标题沿用了更早的大标题样式 text-[24px] font-bold；作品整理标题保留 Archive 图标容器，但顶部四卡片已经改成紧凑数据卡风格。',
    solution:
      '将最近编辑标题改为和作品整理一致的 text-[15px] font-semibold；删除作品整理标题左侧 Archive 图标和对应 import，只保留文字标题与右侧数量。',
    prevention: '以后调整顶部四卡片时，标题层级应保持统一，图标只用于按钮或列表项，不再放在作品整理这类卡片标题左侧。',
    keywords: ['我的小说', '作品整理', '最近编辑', '标题字号', 'Archive', 'NovelLibraryPage'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-soft-cyan-button-style-test-001',
    title: '作品编辑器深蓝按钮和边框需要浅青方案测试',
    area: '测试集合 / 作品编辑器 / 当前页按钮与右侧边框',
    symptom:
      '正文、优化、查找、展开已发布、章节操作、右侧模型提示词框、关联资料和输入框等区域仍使用强蓝色选中态或蓝色边框，用户反馈角色蓝色不好看，希望改成作品信息按钮同款浅青底和青色文字。',
    cause:
      '当前生产样式里按钮选中态、主要操作按钮和部分输入/配置边框分散使用深蓝背景、深蓝边框或高饱和蓝色，视觉权重过强。',
    solution:
      '先新增 WorkbenchSoftCyanButtonStyleTestPage，在测试集合 UI 与主题分组末尾用 #E7F8FD 作为选中底色和边框色、#08AACE 作为选中文字和已关联数字色，集中预览当前页按钮、优化/查找/展开已发布、章节操作、右侧配置框、关联资料和输入框。',
    prevention:
      '正式迁入前先确认测试页方案；迁入时要统一提取浅青状态样式，避免只改某个按钮导致同一页面继续混用深蓝边框和浅青选中态。',
    keywords: ['浅青按钮', '选中态', '#E7F8FD', '#08AACE', '作品编辑器', '右侧边框', '已关联字数', '测试集合'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'workbench-flow-button-stats-test-001',
    title: '作品编辑器流程按钮需要显示内容数量和待处理状态',
    area: '测试集合 / 作品编辑器 / 顶部流程组合按钮',
    symptom:
      '顶部两组组合按钮只显示“脑洞、设定、章纲、正文、审核、点评、润色、状态、梗概”等入口名称，用户无法从按钮上直接知道对应库里有多少内容或还有多少章待处理。',
    cause:
      'WorkbenchHeader 的按钮文本只来自流程 title，未承载脑洞数、设定数、章纲章数、正文章数，以及审核/点评/状态这类待处理数量。',
    solution:
      '先新增 WorkbenchFlowButtonStatsTestPage，在测试集合 AI 链路测试分组末尾展示三套方案：名称加粗+数量同排、紧凑同排、待处理数量胶囊化；按钮文案覆盖“脑洞 X个脑洞、设定 X个设定、章纲 X章、正文 X章、审核 X章未审、点评 X章未点评、状态 X章未更新、梗概 X章”。',
    prevention:
      '正式迁入前先确认按钮宽度和信息密度；迁入时需要从真实小说数据计算数量，并保持润色入口不强行添加数量，避免顶部工具栏拥挤或出现假数据。',
    keywords: [
      '流程按钮',
      '组合按钮',
      '脑洞数量',
      '章纲数量',
      '审核未审',
      '点评未点评',
      '状态未更新',
      '测试集合',
      'WorkbenchHeader',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'panel-splitter-overlay-existing-border-001',
    title: '拖拽分割线不应额外画在真实边界旁边',
    area: '首页导航 / 作品编辑器 / 章纲脑洞剧情链状态审核分栏',
    symptom:
      '鼠标可拖拽分割线显示在真实区域边界线右侧，视觉上变成两条线；用户指出真正的区域分割线是左边那条，hover 时应像参考图一样只把边界线显示为蓝色。',
    cause:
      '部分分栏用 6px、8px 或 16px 独立轨道承载拖拽热区，并在热区中间再画一条线；grid 分栏还为这条热区额外占位，导致边界线和拖拽线分离。',
    solution:
      '首页和正文页的 6px 热区用负 margin 覆盖相邻面板边界；WorkbenchLibraryPanel 和 ChapterEditor 的 grid 拖拽轨道改为 0px，热区用 translate 覆盖原 border-r/border-l；所有 hover 反馈统一为 #1E71EF 蓝线，不再绘制独立红线或居中灰线。',
    prevention:
      '以后新增分栏拖拽时，热区可以比线宽，但视觉线必须贴在真实面板边界上；不要为了拖拽命中率新增可见中线或额外占位列。',
    keywords: [
      '拖拽分割线',
      '边界线',
      'hover蓝色',
      'DashboardLayout',
      'WorkbenchPage',
      'WorkbenchLibraryPanel',
      'ChapterEditor',
      'gridTemplateColumns',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'chapter-editor-paper-line-mode-cleanup-001',
    title: '正文稿纸线需要三态组合按钮并清理多余视觉元素',
    area: '作品编辑器 / 正文 / 字体设置 / 稿纸线',
    symptom:
      '字体设置里只有稿纸虚线开关，缺少刚验证过的实线选项；正文工具栏下方仍有一条横线；虚线从编辑区最左侧开始，空白缩进前出现多余线段；空白正文还显示“从这里开始写...”占位文字。',
    cause:
      '稿纸线设置最初只用 gridLineEnabled 布尔值承载，无法表达无、实线、虚线三种状态；背景 SVG 从 x=0 绘制；正文 toolbar 保留 border-b；textarea placeholder 继续沿用旧引导文案。',
    solution:
      '将字体设置升级为 gridLineMode: none/solid/dashed，并兼容旧 gridLineEnabled；背景线从固定左侧偏移后开始绘制，虚线模式保留 dasharray，实线模式不加 dasharray；正文工具栏删除 border-b，textarea 占位文字置空。',
    prevention:
      '以后新增编辑器背景辅助线时要用明确枚举状态，不要用布尔值承载多个视觉版本；背景线需要检查正文起始位置、占位状态和工具栏边界，避免出现多余线段或重复分割线。',
    keywords: [
      '稿纸线',
      '实线',
      '虚线',
      '组合按钮',
      'placeholder',
      'ChapterEditor',
      'FontSettingsModal',
      'gridLineMode',
    ],
    updatedAt: '2026-06-12',
  },
];
