import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart17: ErrorLogEntry[] = [
  {
    id: 'setting-left-splitter-range-locked-001',
    title: '设定页左侧分割线不应被安全最小宽度锁死',
    area: '作品编辑器 / 设定 / 左侧分割线拖拽',
    symptom: '设定页左侧分割线看得到但拖不动，用户拖拽后左侧目录宽度没有变化。',
    cause:
      '设定页左栏复用了旧大纲目录的 400px 工具栏安全最小宽度，同时最大宽度又受视口和缩放限制；在常见窗口下 min/max 接近或相等，拖拽计算被夹回原值。',
    solution:
      '给设定页左栏单独设置 260px 最小宽度，最大宽度按普通设定库 640px 和当前视口计算；继续复用可用分割线的 pointermove 保存逻辑，并新增真实拖拽恢复测试。',
    prevention:
      '同一个分割线组件可以复用事件处理，但不同页面不能盲目复用最小/最大宽度；新增安全最小宽度时必须保证拖拽区间仍然存在，并补交互测试。',
    keywords: ['设定', '分割线', '拖拽失效', '最小宽度', '最大宽度', 'localStorage', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'setting-splitter-width-dpi-clamp-001',
    title: '设定页分割线记忆不应被系统缩放夹回固定宽度',
    area: '作品编辑器 / 设定 / 左侧分割线宽度记忆',
    symptom: '设定页拖拽左侧分割线后，重新进入仍像回到固定宽度，尤其在 Windows 缩放或高 DPI 屏幕上更明显。',
    cause:
      '设定页左栏宽度本身使用 CSS 像素保存，但最大宽度计算又除了一次 window.devicePixelRatio；保存值在读取时会被过小的最大值 clamp 回去，看起来像没有记忆用户拖拽。',
    solution:
      '设定页左栏最大宽度只按页面 scale 和视口 CSS 像素计算，不再混入 devicePixelRatio；拖拽仍写入 localStorage，切页和 resize 只读取并显示保存值。',
    prevention:
      '布局宽度、localStorage 宽度和 gridTemplateColumns 都使用 CSS 像素时，不要再用设备像素比二次折算；以后调整宽度上限时要覆盖高 DPI/Windows 缩放场景。',
    keywords: [
      '设定',
      '分割线',
      '宽度记忆',
      'devicePixelRatio',
      'DPI',
      'Windows缩放',
      'localStorage',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-12',
  },
  {
    id: 'setting-character-clear-button-001',
    title: '人物设定需要和作品设定一样支持清空',
    area: '作品编辑器 / 设定 / 人物设定 / 清空按钮',
    symptom: '设定页切到“人物设定”后没有和“作品设定”一致的清空入口，用户无法一键清空人物设定内容。',
    cause:
      '清空按钮此前按作品设定模式限制渲染，逻辑只面向 SETTING_TAB；人物设定虽然显示在设定页内，但实际数据源是 ROLE_TAB，清空目标没有按当前设定范围切换。',
    solution:
      '新增 settings/roles 清空目标，设定页根据作品设定或人物设定模式切换清空对象；人物设定清空时删除 ROLE_TAB 条目、保留分类树，并沿用右键解锁和确认弹窗。',
    prevention:
      '设定页内的作品设定和人物设定是同一页面的两种数据源，危险操作必须按当前范围切换目标、计数、文案和解锁状态，不能只按页面 tab 判断。',
    keywords: ['设定', '人物设定', '作品设定', '清空', 'ROLE_TAB', 'SETTING_TAB', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'setting-splitter-width-memory-overwritten-001',
    title: '设定页拖拽分割线记忆不应被切页同步覆盖',
    area: '作品编辑器 / 设定 / 左侧分割线宽度记忆',
    symptom: '设定页拖拽左侧分割线后，切换页面或重新进入时没有保持用户调整的位置，看起来每次都回到固定宽度。',
    cause:
      '设定页的可见左栏宽度同步 effect 在切回设定页时会拿上一页残留的当前宽度做 clamp，并把 clamp 后的值写回 localStorage，覆盖了用户此前保存的设定页宽度。',
    solution:
      '将该同步逻辑改为只从 localStorage 读取已保存宽度并按当前视口夹取后设置显示状态；窗口 resize 也只同步显示宽度，不再调用 persistSettingLibraryWidth 覆盖用户记忆。',
    prevention:
      '分割线宽度的“用户拖拽保存”和“视口变化临时夹取”必须分离；只有拖拽行为写入 localStorage，切页、缩放和 resize 只读取并显示，不覆盖原始偏好。',
    keywords: ['设定', '分割线', '拖拽', '宽度记忆', 'localStorage', 'syncVisibleLeftWidth', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'setting-clear-unlock-menu-clamp-001',
    title: '设定清空解锁菜单不应越出屏幕',
    area: '作品编辑器 / 设定 / 清空设定右键菜单',
    symptom: '右键“清空设定”后出现的“解锁/锁定”菜单按鼠标位置直接展开，在靠近屏幕边缘或窗口边缘时会跑到屏幕外。',
    cause:
      'clearSettingsUnlockContextMenu 直接使用 event.clientX/clientY 作为 fixed 菜单 left/top，没有根据视口宽高对菜单位置做边界夹取。',
    solution:
      '新增 clampFixedMenuPosition，根据菜单预估宽高和 8px 安全边距限制 left/top；清空设定解锁菜单统一使用该函数定位，右侧或底部空间不足时自动向内收。',
    prevention:
      '所有 fixed 右键菜单都不应直接使用鼠标坐标作为最终位置；新增菜单时要按菜单尺寸和 window.innerWidth/window.innerHeight 做边界夹取，并补源码断言防回退。',
    keywords: ['设定', '清空设定', '解锁', '右键菜单', '越界', 'clampFixedMenuPosition', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'outline-flow-visible-name-setting-001',
    title: '顶部创作流程里的大纲需要显示为设定',
    area: '作品编辑器 / 顶部创作流程 / 设定页',
    symptom:
      '用户要求“大纲”页面改名为“设定”，但正式作品编辑器顶部流程按钮仍显示“大纲”，右侧 AI 输出框也仍显示“生成大纲”。',
    cause:
      '之前只在测试页和设定库内部做了“设定”显示映射，正式 WorkbenchCreationFlow 的 outline 步骤标题仍是“大纲”；设定生成输出框和空提示词文案也残留旧名称。',
    solution:
      '将正式创作流程中 outline 的可见 title 改为“设定”；设定生成输出框标题改为“生成设定”，空提示词文案改为“暂无设定提示词”；内部 SETTING_TAB 和 PROMPT_SETTING_CATEGORY 继续保留“大纲”以兼容旧数据和旧提示词分类。',
    prevention:
      '以后做页面级改名时要区分内部 key 和用户可见文案：顶部流程、弹窗标题、输出框标题、空状态、提示词空文案和测试断言都要同步核对；历史数据 key 不直接改名。',
    keywords: ['大纲', '设定', '顶部流程', '生成设定', '提示词', 'WorkbenchCreationFlow', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'brainstorm-output-copy-clear-split-combo-001',
    title: '脑洞输出操作需要区分保存替换和复制清空',
    area: '作品编辑器 / 脑洞 / 右侧脑洞输出框操作区',
    symptom: '脑洞输出框底部把替换、保存和清空放在同一组，替换按钮文案不够明确，也缺少直接复制脑洞输出内容的入口。',
    cause:
      '上一版把清空脑洞作为保存操作组的一部分处理，按钮职责混在一起；复制只能依赖用户手动选中文本，不适合多输出或长输出场景。',
    solution:
      '将“替换脑洞”改为“替换当前脑洞”；保留“保存为新脑洞”在保存替换组合中；新增“复制脑洞”，并把“复制脑洞 / 清空脑洞”拆成独立组合按钮，复制内容来自脑洞输出框当前内容。',
    prevention:
      '脑洞输出区的保存类操作和输出框工具类操作要分组展示；新增输出框工具时优先放入“复制/清空”组合，不要混入保存为新脑洞或替换当前脑洞。',
    keywords: ['脑洞', '替换当前脑洞', '复制脑洞', '清空脑洞', '组合按钮', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'detail-outline-state-expectation-split-frame-001',
    title: '章纲页需要独立显示本章状态变化预期',
    area: '作品编辑器 / 章纲 / 中间章纲编辑区',
    symptom:
      '章纲正文会越来越长，状态变化预期只能混在章纲末尾，正文生成和后续审核无法稳定区分“写作计划”和“预计状态变化”。',
    cause:
      '章纲页只有一个大输入框，底层章纲内容也没有固定状态变化标签；仅靠提示词自由输出，后续软件识别和状态同步审核都不稳定。',
    solution:
      '在章纲页把当前章节内容拆成“第X章章纲”和“状态变化预期”两个框；底层仍保存到同一条章纲内容里，通过【本章状态变化预期】标签分隔，默认章纲提示词和剧情点转章纲提示词都要求输出该标签。',
    prevention:
      '章纲阶段的状态变化只作为预期，不直接进入正式状态库；后续审核和状态同步应读取该标签区块与最终正文对照，再由用户确认写入状态库。',
    keywords: ['章纲', '状态变化预期', '本章状态变化预期', '状态库', '审核', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-12',
  },
  {
    id: 'body-context-chapter-summary-exclusive-dot-001',
    title: '正文资料关联中正文和梗概需要互斥选择',
    area: '作品编辑器 / 正文 / 资料关联弹窗 / 正文梗概章纲选择列',
    symptom:
      '资料关联弹窗里正文、章纲、梗概都使用勾选框，容易让用户理解成三者可以全部同时选择；实际正文和梗概属于同一章承接文本，只应二选一。',
    cause: '旧交互把正文、章纲、梗概都当作独立 checkbox 处理，并且默认/批量选择会同时带上同一章正文和梗概。',
    solution:
      '将行内控件改为圆点选择样式；正文和梗概改为互斥选择，选正文会清掉同章梗概，选梗概会清掉同章正文；章纲保持独立圆点样式并放到梗概后方。',
    prevention:
      '章节正文和章节梗概属于同一类叙事上下文，后续默认选择、批量选择和确认保存都必须执行互斥清理；章纲属于写作目标，可独立关联。',
    keywords: ['正文', '梗概', '章纲', '互斥选择', '圆点', '关联资料', 'WorkbenchPage'],
    updatedAt: '2026-06-11',
  },
  {
    id: 'body-context-source-word-six-digit-slot-001',
    title: '正文资料关联来源字数只应预留六位数字宽度',
    area: '作品编辑器 / 正文 / 资料关联弹窗 / 章纲正文梗概选择列',
    symptom: '章节行右侧正文、章纲、梗概三个来源选项为了避免换行使用了较大的固定宽度，导致梗概后方出现一大段空白。',
    cause:
      '上一版把每个来源标签设置为 122px 或 138px 固定宽，解决了章纲换行，但也把选项整体撑宽；真正需要固定的是数字部分，而不是整个标签。',
    solution:
      '将来源选项改为内容自适应宽度，只给字数数字预留 6ch 右对齐宽度；外层列改为 auto，让正文、章纲、梗概紧凑靠右并保持单行。',
    prevention:
      '固定格式字数控件应固定数字槽位，不要固定整块标签宽度；小说章节字数显示按六位数字预留即可，避免无效空白挤压列表。',
    keywords: ['正文', '关联资料', '字数', '六位数字', '6ch', '梗概', '空白', 'WorkbenchPage'],
    updatedAt: '2026-06-11',
  },
  {
    id: 'body-context-empty-source-and-required-outline-001',
    title: '正文资料关联缺少内容时需要显眼提示并禁止无章纲确认',
    area: '作品编辑器 / 正文 / 资料关联弹窗 / 资料来源字数与确认按钮',
    symptom:
      '正文、章纲、梗概为 0 字时仍显示成普通的“0字”，不够显眼；当前章节没有章纲内容时仍能确认读取，后续正文续写会缺少必需写作目标。',
    cause:
      '资料来源字数只按数字展示，没有区分“有内容”和“无资料”；确认按钮只检查选择项，没有校验当前章节锁定章纲是否为空。',
    solution:
      '0 字来源统一显示为红色“无正文/无章纲/无梗概”；确认读取按钮改为依赖当前章节章纲内容，当前章纲为空时置灰禁用并阻止确认。',
    prevention:
      '正文续写链路必须把当前章纲视为必需资料；资料来源状态不要只显示 0 字，应直接显示缺失原因，减少用户误确认。',
    keywords: ['正文', '关联资料', '无正文', '无章纲', '无梗概', '确认读取', 'WorkbenchPage'],
    updatedAt: '2026-06-11',
  },
  {
    id: 'body-context-row-source-controls-nowrap-001',
    title: '正文资料关联行内来源选项不应把章纲拆成两行',
    area: '作品编辑器 / 正文 / 资料关联弹窗 / 章纲正文梗概选择列',
    symptom: '资料关联弹窗的章节行里，正文、章纲、梗概三个来源选项在字数较长时会互相挤压，导致“章纲”被拆成上下两行。',
    cause: '右侧选择列和单个来源标签宽度偏紧，章纲字数达到四位数时超过了标签可用宽度；标签本身也没有显式禁止换行。',
    solution:
      '加宽章节行右侧选择列和三个来源标签宽度，并为选择列与标签文字添加不换行约束，保证“正文 / 章纲 / 梗概 + 字数”始终单行显示。',
    prevention:
      '章节资料来源选项属于固定格式控件，应使用稳定列宽和 whitespace-nowrap；后续调整字数间距时不要压缩到来源名称本身。',
    keywords: ['正文', '关联资料', '章纲', '梗概', '字数', '换行', 'WorkbenchPage'],
    updatedAt: '2026-06-11',
  },
  {
    id: 'body-context-footer-word-count-lines-001',
    title: '正文资料关联底部字数统计不应横排挤在一起',
    area: '作品编辑器 / 正文 / 资料关联弹窗 / 底部统计',
    symptom:
      '资料关联弹窗底部把“共多少字、正文、章纲、梗概”放在同一行，数字颜色和分隔点混在一起，宽度紧张时不容易分辨各项字数。',
    cause: '底部统计沿用横向摘要布局，并对整段文本使用 truncate，适合短状态但不适合同时展示多个资料来源的字数明细。',
    solution:
      '将底部统计改为竖排多行：保留将读取项数，并分别显示正文、章纲、梗概、共多少字，避免分隔符和数字挤在同一行。',
    prevention:
      '正文资料关联涉及多个来源时，弹窗底部优先使用多行明细展示；右侧 AI 面板只保留总字数，避免主工作区信息过载。',
    keywords: ['正文', '关联资料', '字数统计', '章纲', '梗概', 'WorkbenchPage'],
    updatedAt: '2026-06-11',
  },
  {
    id: 'body-context-outline-chapter-summary-default-001',
    title: '正文资料关联需要默认带本章章纲和前文资料',
    area: '作品编辑器 / 正文 / 资料关联弹窗 / AI请求上下文',
    symptom:
      '正文生成时，资料弹窗里的章纲、正文、梗概语义混在一起，用户无法明确看到本次关联了多少正文、多少章纲、多少梗概；生成第2章时也不能稳定默认带上第2章章纲、第1章正文和第1章梗概。',
    cause:
      '旧资料来源把 summary 当作章纲使用，正文与梗概还是二选一；弹窗只保存用户手动选择项，没有当前章章纲的强制锁定规则，也没有按资料类型统计字数。',
    solution:
      '新增 outline 资料来源表示章纲，summary 专门表示梗概；章纲/正文/梗概页按章节行展示正文、章纲、梗概三个独立勾选项，当前章节章纲默认关联且不可取消；未手动选择时默认带上一章正文和上一章梗概，并在弹窗与右侧AI面板显示总字数及正文/章纲/梗概分项字数。',
    prevention:
      '正文生成链路里不要再把梗概和章纲共用 summary 语义；当前章章纲属于写作目标，应作为锁定上下文，前文正文和前文梗概属于承接上下文，可按需要调整或清空。',
    keywords: [
      '正文',
      '关联资料',
      '章纲',
      '梗概',
      '前文正文',
      'outline',
      'summary',
      'WorkbenchAIPanel',
      'WorkbenchPage',
    ],
    updatedAt: '2026-06-11',
  },
  {
    id: 'detail-outline-single-selected-chapter-frame-001',
    title: '章纲页不应同时显示多个章节章纲框',
    area: '作品编辑器 / 章纲 / 中间章纲编辑区',
    symptom:
      '章纲页中间区域会同时显示第1章章纲、第2章章纲等多个大输入框，选中第1章时下方仍露出第2章章纲框，导致当前章节编辑区不能顶到屏幕下方。',
    cause:
      '章纲页复用了梗概页面的章节循环预览逻辑，outlineChapters.map 会把所有章节都渲染成独立输入框；此前只是调整单个框高度，没有改变“多章节同时展示”的根因。',
    solution:
      '仅在章纲标签下改为单章聚焦渲染：中间区域只取 selectedOutlineChapter 对应的章节，章纲输入框使用 xy-floating-fill 和 h-full 撑满当前可用高度；梗概页仍保留原来的多章节循环预览。',
    prevention:
      '章纲负责生产当前选中章节的写作执行稿，后续不要再复用梗概的全章节列表预览结构；需要切换章节时应通过左侧章节目录切换 selectedOutlineChapter，而不是在中间堆多个章纲框。',
    keywords: [
      '章纲',
      '单章聚焦',
      'selectedOutlineChapter',
      'outlineChapters.map',
      'xy-floating-fill',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-11',
  },
  {
    id: 'concept-library-genre-form-input-hit-test-001',
    title: '构思库题材表单输入框无法输入',
    area: '构思库 / 题材 / 右侧输入栏',
    symptom:
      '题材页的平台、类型、题材标题和题材设定区域能正常显示，但用户点击输入框后无法稳定输入内容，提交按钮一直保持未填写状态。',
    cause:
      '构思库三栏布局曾依赖 CSS order 调整右侧输入栏和中间列表的视觉顺序，在桌面壳缩放和命中测试环境下可能让中间滚动区覆盖右侧表单交互区域；右侧表单也缺少显式的 data-no-modal-drag 交互标记。',
    solution:
      '为右侧输入栏和中间列表指定明确的 grid 列位置，右侧栏设置 relative z-10 并给输入区添加 data-no-modal-drag，同时阻断外层鼠标、指针和键盘事件冒泡，保证输入框直接接收焦点和输入。',
    prevention:
      '三栏工作区不要只靠 order 改变视觉位置；可输入的右侧工具栏应显式声明 grid 列、交互标记和合适层级，避免被滚动列表或桌面拖拽逻辑误判。',
    keywords: ['构思库', '题材', '输入框', 'grid', 'order', 'data-no-modal-drag', '命中测试'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'prompt-categories-outline-chapter-outline-rename-001',
    title: '提示词管理分类需要改为大纲和章纲',
    area: '提示词管理 / 作品编辑器 / 模型提示词选择框',
    symptom:
      '提示词管理里仍显示“设定”“细纲”“剧情链”分类，和当前创作流程里的大纲、章纲命名不一致；剧情链已移出正式流程后不应继续作为提示词分类。',
    cause:
      '默认提示词分类仍保留旧名称，且本地旧分类会在归一化后继续作为自定义分类出现；章纲页提示词选择框也按内部 tab 名“细纲”读取。',
    solution:
      '默认分类改为脑洞、大纲、章纲、正文、审核、点评、润色、状态、概要、未分类；旧“设定”迁移到“大纲”，旧“细纲/剧情链”迁移到“章纲”，旧“更新”迁移到“状态”，并取消剧情链种子提示词注入；章纲提示词框改按“章纲”分类读取。',
    prevention:
      '提示词管理里的用户可见分类名要和正式创作流程一致；内部 tab 名如果保留旧兼容值，读取提示词时必须映射到新的用户可见分类。',
    keywords: ['提示词管理', '大纲', '章纲', '设定分类', '细纲分类', '剧情链分类', 'usePrompts'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'polish-review-flow-and-prompt-tabs-001',
    title: '点评后需要新增润色页并清理提示词旧标签',
    area: '作品编辑器 / 润色 / 提示词管理',
    symptom:
      '创作后处理流程只有审核、点评、状态、概要，缺少可在点评后对正文表达做精修的润色页；提示词管理顶部仍显示“默认提示词”标签，状态提示词分类还沿用旧名“更新”。',
    cause:
      'WorkbenchCreationFlow 还没有把 polish 作为正式后处理步骤接入 WorkbenchPage 和 ChapterEditor；提示词分类只迁移了设定、细纲、剧情链，未迁移“更新”；提示词管理 tab 仍把旧 default 类型作为可见标签。',
    solution:
      '在点评和状态之间加入“润色”后处理页，复用审核/点评的章节目录、正文预览、AI 输出和对比替换能力，并使用“润色”提示词分类；提示词管理移除“默认提示词”tab，旧 default 数据按小说提示词显示；旧“更新”分类归一为“状态”。',
    prevention:
      '新增创作流程步骤时同步更新流程配置、正式页面渲染、提示词分类、Header/流程顺序测试和错误日志；删除可见标签时保留旧数据兼容映射，避免用户已有提示词消失。',
    keywords: ['润色', '点评', '提示词管理', '默认提示词', '状态', '更新', 'ChapterEditor', 'WorkbenchPage'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'model-prompt-dropdown-gap-removed-001',
    title: '模型和提示词下拉框不应和选择框之间留空',
    area: '全局模型/提示词选择框 / CapsuleSelect / CombinedAiConfigSelect',
    symptom: '点击模型或提示词选择框后，下拉菜单和选择框底边之间出现一条明显空隙，视觉上像菜单没有贴住控件。',
    cause:
      'CapsuleSelect 的 fixed 定位使用 rect.bottom + 6，本地弹层使用 top-[calc(100%+6px)]；CombinedAiConfigSelect 也使用同样的 6px 下移量。',
    solution:
      '将 CapsuleSelect 的 fixed 菜单定位改为 rect.bottom，本地菜单改为 top-full；CombinedAiConfigSelect 的菜单也改为 top-full，让下拉框贴住选择框。',
    prevention:
      '模型、提示词这类边框嵌入选择框的下拉菜单默认紧贴控件底边；以后需要间距时必须按具体控件单独加，不要在通用选择框里加全局偏移。',
    keywords: ['模型', '提示词', '下拉框', '选择框', 'CapsuleSelect', 'CombinedAiConfigSelect', 'top-full'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'detail-outline-ai-output-clear-top-right-001',
    title: '章纲 AI 输出框清空按钮需要贴到右上角',
    area: '作品编辑器 / 章纲 / AI输出框',
    symptom: '章纲页右侧 AI输出框的清空按钮停在边框右下方，和用户标注的右上角红框位置不一致。',
    cause: 'AI输出框清空按钮使用了 xy-floating-outline-draft-clear-tool 的底边定位，继承为 bottom: 0 和向下偏移。',
    solution:
      '将 xy-floating-outline-draft-clear-tool 改为 top: 0、bottom: auto，并使用 translateY(-50%) 贴在右上角边框线上，保留透明背板按钮样式。',
    prevention: '右侧 AI输出框的贴边操作按钮单独使用 draft clear 工具类定位，避免再和卡片底部清空按钮共用底边位置。',
    keywords: ['章纲', 'AI输出框', '清空按钮', '右上角', 'xy-floating-outline-draft-clear-tool'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'plot-chain-official-page-moved-to-test-area-001',
    title: '剧情链正式页面需要移入测试集合保留',
    area: '作品编辑器 / 顶部流程导航 / 测试集合',
    symptom: '剧情链和章纲职责重叠，继续作为正式主流程页面会让“脑洞-大纲-章纲-正文”的写作路径变复杂。',
    cause:
      '正式流程曾把 plotChain 作为独立创作步骤，并在 WorkbenchPage 中保留 standalone 剧情链页面和弹窗入口；但测试集合里已经有剧情链双标签布局测试可作为后续复用备份。',
    solution:
      '从正式 WORKBENCH_MAIN_FLOW_STEPS、WorkbenchHeader 和 WorkbenchPage 正式分支中移除 plotChain；保留 PlotChainTabbedLayoutTestPage 在测试集合中，底层剧情点模型和章纲关联能力暂不删除。',
    prevention:
      '以后把实验性写作链路降级时，优先移除正式导航和页面入口，保留测试集合备份；不要删除仍被章纲辅助、提示词或数据兼容使用的底层模型。',
    keywords: ['剧情链', '测试集合', '正式导航', 'plotChain', 'WorkbenchPage', 'WorkbenchHeader'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'plot-chain-inline-ai-review-leaks-into-preview-001',
    title: '剧情链正文预览混入 AI评价文本',
    area: '作品编辑器 / 剧情链 / 时间线预览 / AI评价',
    symptom: '剧情链左二时间线预览框里出现“\\nAI评价：...”正文，用户点击 AI评价按钮前就能在正文区域看到评价内容。',
    cause:
      '候选解析只识别单独成行的 AI评价；当模型把“\\nAI评价：...”作为字面量或接在正文尾部时，displayText 没有二次剥离，getWorkbenchPlotPointReview 也没有从 adapted/original 兜底提取。',
    solution:
      '在 workbenchPlotChain 展示层新增 inline review 拆分：正文展示先截掉 AI评价段，AI评价按钮在 item.review 为空时从 adapted/original 中提取同一段。',
    prevention:
      'AI 输出字段既可能是真换行也可能是字面量 \\n；剧情点正文、变量说明和 AI评价这类元信息在展示层都要有兜底清洗，不能只依赖首次解析。',
    keywords: ['剧情链', 'AI评价', '时间线预览', '正文混入', 'adapted', 'getWorkbenchPlotPointDisplayText'],
    updatedAt: '2026-06-10',
  },
  {
    id: 'plot-chain-same-node-candidate-lock-test-001',
    title: '剧情链同一节点备选需要防止重复选择',
    area: '测试集合 / 剧情链双标签布局测试 / 生成候选',
    symptom:
      '用户担心同一批生成出来的剧情链候选其实都是同一个剧情节点的不同版本，如果把多版都加入主链，会让剧情顺序和因果关系错乱。',
    cause:
      '生成页原先把每个候选都显示为可加入，缺少“本批候选属于同一个目标节点”的锁定状态，选中一版后没有阻止继续选择同批其他备选。',
    solution:
      '在测试页新增候选批次节点锁：本批候选绑定第 N 号节点，选择一版后显示“节点已锁定”，选中项显示“已选定”，同批其他候选显示“同节点已锁定”并禁用；点击刷新剧情点后进入下一目标节点并重新开放选择。',
    prevention:
      '正式剧情链生成页应把候选批次和目标剧情点编号绑定保存，加入候选前先判断该节点是否已选中，不能只按候选卡片独立追加。',
    keywords: ['剧情链', '同节点', '候选锁定', '备选', '重复选择', 'PlotChainTabbedLayoutTestPage'],
    updatedAt: '2026-06-10',
  },
];
