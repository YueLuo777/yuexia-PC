import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart33: ErrorLogEntry[] = [
  {
    id: 'model-402-insufficient-balance-message-001',
    title: '大纲生成显示原始 402 余额不足错误',
    area: '通用模型调用 / 大纲生成 / callModel',
    symptom: '大纲生成输出框一直显示“Model request failed (402): Insufficient Balance”，用户容易以为大纲生成页面坏了。',
    cause:
      '模型接口返回 402 或 Insufficient Balance 时，通用模型调用层只把服务端 JSON 原样拼进错误信息，没有转换成用户能直接理解的中文提示。',
    solution:
      '在 callModel 的 formatModelError 中解析服务端 error.message，并识别 402、Insufficient Balance、余额不足等情况，统一提示当前模型 API 账户余额不足，需要换模型或充值。',
    prevention: '以后新增模型错误处理时，先在通用模型调用层归一化高频错误码，不要在单个页面里分别拼接原始接口错误。',
    keywords: ['大纲生成', '402', 'Insufficient Balance', '余额不足', 'callModel', '模型调用'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'prompt-disable-column-alignment-001',
    title: '提示词禁用按钮和模型/提示词选择框不对齐',
    area: '大纲设定 / 脑洞生成 / 角色生成 / 模型提示词选择框',
    symptom:
      '模型选择框占满整行，导致“管理”按钮出现在禁用按钮上方；提示词选择框因为右侧多了禁用按钮而变短，两行宽度不一致，禁用按钮也和提示词框不在同一水平线。',
    cause:
      '模型行使用单列布局，提示词行使用“选择框 + 禁用按钮”双列布局；同时禁用按钮没有按浮动标签选择框的顶部留白对齐。',
    solution:
      '有禁用按钮的区域里，模型行也使用同样的双列网格，但右侧只放空占位；禁用按钮增加顶部偏移并改为与选择框边框同高。',
    prevention:
      '以后模型/提示词成对出现且提示词右侧有独立操作按钮时，模型行也要保留同宽右侧占位，保证两行选择框宽度和左边文字起点一致。',
    keywords: ['模型', '提示词', '禁用按钮', '管理按钮', '对齐', 'CapsuleSelect'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-action-button-offset-001',
    title: '模型/提示词选择框的管理按钮下沉歪斜',
    area: '全局模型管理 / 提示词管理 / CapsuleSelect',
    symptom:
      '带“模型”“提示词”嵌入标签的选择框里，右侧“管理”按钮背景没有贴满整个右侧圆角区域，看起来比外框矮一截并向下偏。',
    cause:
      'CapsuleSelect 使用 fieldset + legend 做边框嵌入标签后，管理按钮仍放在 legend 下方的内容行里，按钮高度只跟内容行对齐，没有跟整个 fieldset 外框对齐。',
    solution:
      '带 actionLabel 的 CapsuleSelect 不再使用 fieldset/legend，改为普通相对定位边框容器；嵌入标签用 absolute 压在边框上，管理按钮在真实边框高度内 absolute inset-y-0 right-0 铺满，并给左侧选择区域预留 pr-12。',
    prevention:
      '以后在带嵌入标签的复合选择框里做右侧固定操作区时，不要依赖 fieldset/legend 的默认布局；固定操作区应相对真实边框容器定位，内容区单独预留宽度。',
    keywords: ['CapsuleSelect', '管理按钮', 'fieldset', 'legend', '模型选择框', '提示词选择框', '对齐'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'capsule-select-floating-label-stacked-001',
    title: '模型提示词选择框标签和内容上下堆叠',
    area: '全局模型/提示词选择框 / CapsuleSelect',
    symptom: '带“模型”“提示词”边框标签的选择框变高，标签和当前选中内容看起来像上下两行，不够一体。',
    cause:
      '复合选择框固定使用 h-12，忽略调用方传入的 h-9/h-10/h-11；标签字号偏大，按钮内容没有显式垂直居中，管理按钮右侧定位也没有按真实高度统一。',
    solution:
      '复合选择框根据 buttonClassName 的高度选择真实外框高度；边框标签降为小号并与选中内容左边对齐；内容按钮改为 flex 垂直居中；管理按钮贴住真实右边界。',
    prevention:
      '以后调整 CapsuleSelect 的浮动标签时，必须同时检查高度、标签字号、选中内容起点、箭头和管理按钮的同一高度基准，避免只改标签背景造成整体错位。',
    keywords: ['CapsuleSelect', '浮动标签', '模型', '提示词', '上下堆叠', '管理按钮', '高度'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'panel-splitter-drag-stolen-by-modal-001',
    title: '大纲设定分割线拖拽失效',
    area: '大纲设定 / 细纲 / 概要 / 脑洞 / 面板分割线',
    symptom: '拖拽左右分割线时，面板宽度不变化，像是分割线没有反应。',
    cause:
      '全局弹窗拖拽托管会在捕获阶段接管弹窗内部的普通区域；另外脑洞页把左栏和预览栏做了更小的可视最大宽度，但拖拽计算仍从旧通用宽度开始，导致要拖很远才会有视觉变化。',
    solution:
      '给 WorkbenchLibraryPanel 的左侧、右侧、脑洞预览分割线补上 data-no-modal-drag，并在开始拖拽时 preventDefault + stopPropagation + stopImmediatePropagation；拖拽增量按 zoom 比例换算；脑洞页按当前可见宽度和脑洞自己的最大宽度计算。正文编辑页和剧本编辑器分割线也补同样隔离。',
    prevention:
      '以后新增弹窗内部分割线、拖拽条、滑块等交互区域时，必须标记 data-no-modal-drag，并在拖拽开始事件里阻止冒泡；如果布局对某个标签页有 min/max 二次限制，拖拽计算必须使用同一套可视 min/max。',
    keywords: ['大纲设定', '分割线', '拖拽失效', 'data-no-modal-drag', 'WorkbenchLibraryPanel', 'resize', 'zoom'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'model-prompt-floating-label-width-001',
    title: '模型和提示词选择框文字被外置标签挤压',
    area: '全局模型管理 / 提示词管理 / CapsuleSelect',
    symptom:
      '模型或提示词选择框左侧外置“模型”“提示词”标签占用宽度，窄栏里当前名称容易被截断；有禁用功能时更难一眼分清选择框和禁用按钮。',
    cause:
      '不同页面各自拼接标签、选择框、管理按钮和禁用按钮，布局规则不统一，导致右侧管理区和左侧标签同时挤占可用文本宽度。',
    solution:
      '在 CapsuleSelect 增加 floatingLabel，并让带管理按钮的选择框统一使用边框嵌入标签、独立箭头和窄管理按钮；有禁用能力的提示词继续把禁用/启用按钮放在选择框右侧。',
    prevention:
      '以后新增模型或提示词选择框时，统一复用 CapsuleSelect 的 floatingLabel + actionLabel，不再手写外置“模型/提示词”标签。',
    keywords: ['模型管理', '提示词管理', '选择框', 'CapsuleSelect', 'floatingLabel', '禁用按钮'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'modal-resize-jump-001',
    title: '输出日志弹窗缩放跳动、缩小不了',
    area: '作品编辑器 / 审核 / 点评 / 输出日志',
    symptom: '拖动弹窗边缘或右下角时，窗口会突然位移、放大，甚至大出屏幕后很难缩小。',
    cause:
      '页面手写 fixed 弹窗或内部 absolute 日志层，没有复用统一的 WorkbenchModal + useDraggableModal。还有一种情况是弹窗渲染在带 transform/zoom 的应用容器里，hook 按视口坐标写 fixed left/top/width/height，坐标系不一致就会在拖边时突然放大。',
    solution:
      '把独立弹窗迁移到 WorkbenchModal，或至少用 createPortal 渲染到 document.body，再接 useDraggableModal。拖拽时先把当前 DOM rect 固定成 left/top/width/height，并把尺寸夹在视口范围内。输出日志不要写在父弹窗内部 absolute 覆盖层里，优先改为独立 WorkbenchModal。遇到旧尺寸残留时换新的 storageId 或清理对应 xinyuexia_modal_position_* localStorage。',
    prevention:
      '以后新增可拖拽或可缩放弹窗，默认使用 WorkbenchModal 或 body portal。不要把可缩放 fixed 弹窗放在 transform/zoom 容器里，也不要在业务组件里重复写 fixed inset-0 + 手动 section 弹窗，除非只是不可缩放的轻提示。',
    keywords: ['弹窗', '输出日志', '缩放', '跳动', 'WorkbenchModal', 'useDraggableModal', 'createPortal', 'transform'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'utf8-bulk-replace-001',
    title: '中文文件批量替换后变成乱码',
    area: '全项目中文 TSX 文件',
    symptom: 'TypeScript 报大量 Unterminated string literal、File appears to be binary，页面中文显示乱码。',
    cause: '用 PowerShell Get-Content | Set-Content 对 UTF-8 中文文件做批量替换时，编码被错误重写。',
    solution:
      '先用 git 恢复被误伤文件，再用 apply_patch 做小范围修改。必要时先备份损坏文件，恢复后运行 npm.cmd run check 和 npm.cmd run build。',
    prevention:
      '不要用 PowerShell 管道批量改中文源码。优先使用 apply_patch；确实要脚本处理时，使用明确的 UTF-8 Node 脚本并立刻检查 diff。',
    keywords: ['编码', '乱码', 'PowerShell', 'UTF-8', 'apply_patch'],
    updatedAt: '2026-05-28',
  },
  {
    id: 'capsule-select-scaled-portal-001',
    title: '缩放弹窗里的下拉菜单偏位',
    area: '大纲设定 / 脑洞生成 / CapsuleSelect',
    symptom: '模型或提示词下拉展开后，菜单不贴着选择框，偏到左侧或被弹窗区域裁掉。',
    cause:
      '下拉层挂到带 transform/zoom/overflow 的缩放容器中，再把 getBoundingClientRect 的视口坐标换算成容器坐标。多层缩放或弹窗裁剪叠加后，坐标会二次偏移。',
    solution:
      'CapsuleSelect 的下拉层统一 createPortal 到 document.body，并使用 fixed + getBoundingClientRect 的视口坐标定位。不要在缩放容器内再做相对坐标换算。',
    prevention:
      '以后做通用下拉、菜单、浮层，优先挂到 body 并用视口坐标定位；只有明确需要跟随局部滚动容器时才挂到局部容器。',
    keywords: ['下拉框', 'CapsuleSelect', '缩放', '弹窗', '定位', 'portal'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'maximized-window-drag-restore-001',
    title: '最大化窗口拖动无效',
    area: '桌面窗口 / 标题栏拖动',
    symptom: '窗口最大化后拖动标题栏没有反应，不能像常规软件一样先还原尺寸再拖动。',
    cause:
      '只用前端 pointermove + IPC 模拟拖动不够稳定。最大化窗口下 Windows/Electron 可能不持续派发 pointermove，或者退出最大化与 setBounds 的时序不同步，导致拖动看起来完全没生效。',
    solution:
      '标题栏空白区域使用 Electron 原生 -webkit-app-region: drag，让系统处理最大化还原拖动；标签页、测试按钮、UI库按钮、主题、比例、最小化、最大化、关闭等交互区域设置 -webkit-app-region: no-drag。自定义 IPC 拖动保留为非 Electron 或兜底逻辑。',
    prevention:
      '窗口标题栏拖动优先用 Electron 原生 drag region，不要把所有标题栏区域都设成 no-drag 后再完全依赖前端模拟。新增标题栏按钮或标签时必须放在 no-drag 区域。',
    keywords: ['最大化', '拖动', '标题栏', 'Electron', 'app-region', 'drag', 'no-drag'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'context-word-count-align-001',
    title: '关联上下文字数不对齐',
    area: '正文续写 / 关联上下文 / 章节列表',
    symptom: '正文和概要后的字数位数不同，导致单选项横向错位；右侧“概要 0 字”离滚动条太近，列表扫读时显得拥挤。',
    cause:
      '字数直接跟在“正文”“概要”后面渲染，没有给数字部分预留固定宽度；列表行右侧只使用普通 px-4 内边距，未给滚动条单独留出安全间距。',
    solution:
      '把字数拆成数字和“字”，数字使用 4ch 固定宽度、右对齐和 tabular-nums；右侧选择列加宽到 256px，并把行右内边距提高到 pr-10。',
    prevention:
      '同类统计数字出现在列表中时，先按常见最大位数预留固定字符宽度；带滚动条的列表右侧要额外预留空白，避免文字贴近滚动条。',
    keywords: ['关联上下文', '字数', '对齐', 'tabular-nums', '4ch', '滚动条', '右侧留白'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'modal-geometry-persistence-001',
    title: '部分弹窗不记忆大小和位置',
    area: '全局弹窗 / WorkbenchModal / 手写 fixed 弹窗',
    symptom: '部分弹窗关闭后再次打开会回到默认大小或默认位置，有些只能记住位置不能记住大小。',
    cause:
      '一部分手写弹窗接了 useDraggableModal 但没有 data-draggable-managed 和缩放手柄，导致全局弹窗托管与 hook 可能同时接管；另一部分 WorkbenchModal 依赖标题生成存储 key，标题变化时会丢失旧位置。',
    solution:
      '抽出 ModalResizeHandles 统一缩放手柄；已接 useDraggableModal 的手写弹窗统一标记 data-draggable-managed，并补齐相同的缩放手柄；主要 WorkbenchModal 增加稳定 storageId；全局弹窗托管增加无 header 弹窗的标题栏识别。',
    prevention:
      '以后新增可拖拽弹窗时优先使用 WorkbenchModal 并显式传 storageId；必须手写 fixed 弹窗时，若使用 useDraggableModal 就同时加 data-draggable-managed、relative 容器和 ModalResizeHandles。',
    keywords: ['弹窗', '记忆位置', '记忆大小', 'storageId', 'useDraggableModal', 'ModalResizeHandles'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'brainstorm-prompt-select-truncated-001',
    title: '脑洞生成提示词显示不全',
    area: '大纲设定 / 脑洞生成 / 模型和提示词选择框',
    symptom: '提示词选择框里只显示前一两个字，右侧管理和禁用按钮挤占空间，用户无法看清当前提示词。',
    cause:
      '脑洞右侧栏被限制到 300px，选择行还预留了 64px 禁用列和较大的列间距，CapsuleSelect 内部管理按钮继续占用选择框宽度。',
    solution:
      '脑洞右侧栏最低宽度提高到 340px、上限提高到 380px；模型/提示词行改成更紧凑的 44px 标签列和 52px 禁用列，列间距缩小；管理按钮宽度缩小到 44px。',
    prevention: '以后在窄侧栏里放选择框和操作按钮时，先按实际中文名称长度检查可用文字宽度，不要只看控件总宽。',
    keywords: ['脑洞生成', '提示词', '显示不全', 'CapsuleSelect', '禁用按钮', '管理按钮'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'review-modal-drag-unmaximizes-window-001',
    title: '审核弹窗拖动时带动软件窗口',
    area: '作品编辑器 / 审核点评弹窗 / 最大化窗口拖动',
    symptom: '软件最大化时打开审核弹窗，拖动审核弹窗会让软件窗口退出最大化，并且弹窗拖动时软件窗口也跟着移动。',
    cause:
      '窗口标题栏使用 Electron 原生 app-region: drag 后，覆盖到顶部区域的弹窗如果没有明确声明 app-region: no-drag，可能被系统命中为窗口拖拽区域。',
    solution:
      '审核点评弹窗的遮罩层、弹窗容器和弹窗标题栏统一设置 WebkitAppRegion: no-drag，弹窗本身仍使用 useDraggableModal 处理内部拖拽。',
    prevention:
      '所有覆盖标题栏或可能靠近顶部的可拖拽弹窗，都要显式设置 app-region: no-drag，避免和软件窗口最大化拖拽逻辑混在一起。',
    keywords: ['审核', '点评', '最大化', '拖动', 'app-region', 'no-drag', 'useDraggableModal'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-preview-title-overflow-001',
    title: '细纲预览标题重复导致显示不全',
    area: '作品信息 / 细纲预览 / 边框嵌入标签',
    symptom:
      '细纲预览区域已经在边框中显示“第X章细纲（第X卷）”，外层仍然显示“细纲预览”，导致顶部空间拥挤并出现显示不全。',
    cause: '细纲页复用了概要预览的外层标题，同时又新增了边框嵌入标签，两个标题表达的是同一层级信息。',
    solution: '细纲页和章节概要页都隐藏外层 outlinePreviewTitle，只保留边框嵌入的章节标签；卷概要由自身卡片标题表达。',
    prevention:
      '以后给输入框或预览框增加边框嵌入标签时，先检查外层标题是否重复；若标签已承担标题作用，应移除外层标题避免挤占空间。',
    keywords: ['细纲预览', '章节概要', '显示不全', '边框标签', 'outlinePreviewTitle', 'detail outline'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'detail-outline-frame-label-clipped-001',
    title: '细纲边框标签顶部被裁切',
    area: '作品信息 / 细纲预览 / 边框嵌入标签',
    symptom:
      '细纲预览第一张卡片的“第X章细纲（第X卷）”贴在滚动区顶部，标签上半部分被 overflow 容器裁掉，看起来显示不全。',
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
    symptom:
      '章节概要弹窗中间预览区上方又显示一行“章节概要”，下方卡片已经用边框标签显示“第X章概要（第X卷）”，两层标题挤在一起。',
    cause:
      '概要预览复用了外层 outlinePreviewTitle 标题，同时卡片标题已经嵌入边框；删除外层标题后如果不补顶部内边距，第一张卡片的边框标签会贴到滚动区顶部。',
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
    cause:
      '章节细纲 textarea 固定使用 h-[260px]，不区分空内容、短内容和长内容；滚动条也使用常规编辑器滚动条，空内容时视觉上显得很重。',
    solution:
      '细纲卡片空内容高度改为原来一半；有内容时按估算行数撑开，最高仍为原来的 260px；超过高度后在 textarea 内部滚动，并复用 scrollbar-scroll-only，平时隐藏滚动条，滚动时短暂显示滑块。',
    prevention:
      '列表型大文本卡片不要默认占满最大高度；应按内容量设置 min/max 高度，长内容内部滚动，滚动条默认隐藏以减少空白区域的视觉重量。',
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
    cause:
      '标题栏已经使用 -webkit-app-region: drag，但 AppFrame 仍监听 pointer 事件并通过 IPC 调 main 进程 setBounds 模拟拖动，两套拖动路径会互相抢事件和状态。',
    solution:
      '标题栏拖动只保留 Electron 原生 drag region；删除前端 begin/move/end titlebar drag 调用、preload 暴露和主进程 IPC handler。按钮、标签页等可点击区域继续使用 no-drag。',
    prevention:
      '标题栏拖动优先使用 Electron 原生 drag region。除非明确要兼容非 Electron 环境，否则不要再叠加 pointer + IPC 的窗口移动实现。',
    keywords: ['标题栏', '最大化', '拖动', 'IPC', 'app-region', 'setBounds', 'Electron'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'postgres-data-tracked-runtime-001',
    title: 'PostgreSQL 运行数据目录被 Git 跟踪',
    area: '版本库 / 数据库 / shujuku/postgres-data',
    symptom: '工作区经常出现 pg_control、pg_wal、pg_internal.init 等数据库运行文件变动，提交体积变大。',
    cause:
      'shujuku/postgres-data 是本地运行时数据目录，但曾被加入 Git 索引，后续 .gitignore 也无法自动停止跟踪已入库文件。',
    solution:
      '在 .gitignore 忽略 shujuku/postgres-data/**，并用 git rm --cached 从索引移除该目录，保留本地真实数据库文件不删除。',
    prevention:
      '数据库数据目录、日志、构建产物一旦误入库，必须同时补 .gitignore 和 git rm --cached；只改 .gitignore 不会影响已跟踪文件。',
    keywords: ['PostgreSQL', 'postgres-data', 'git rm --cached', '运行时数据', 'pg_wal', 'pg_control'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'workbench-clear-new-session-no-index-001',
    title: '正文续写清空后不是完整新上下文',
    area: '正文续写 / AI 会话 / 清空按钮',
    symptom: '点击清空后看起来像把当前内容清掉了，仍显示 1 号会话，不像真正新开一块空白输入区。',
    cause:
      'resetSessions 固定创建 id=1 的默认会话，单会话状态也渲染序号按钮；外部关联上下文和上一次输出日志没有一起断开。',
    solution:
      '清空改为使用下一个会话 id 创建新的空会话，不继承输入、输出、消息、关联状态、外部关联上下文和上一次请求日志；只有一个空白会话时隐藏会话序号按钮。',
    prevention:
      '类似“黑板擦”的清空语义应表达为完整新上下文，不要重用可见会话序号，也不要保留父级关联上下文或上一轮日志。',
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
    symptom:
      'webview 使用 allowpopups，主窗口 window.open 会直接 openExternal，webviewRef 使用 any，安全和类型边界都偏松。',
    cause: '内置浏览器为了方便打开网页保留了宽松默认值，没有限制外部 URL 协议，也没有给 Electron webview 补专用类型。',
    solution:
      '移除 webview 的 allowpopups；主进程只允许 http、https、mailto 外部打开；补 ElectronWebviewElement 类型替代 useRef<any>。',
    prevention: '嵌入第三方网页时默认关闭弹窗能力，并限制外部打开协议；需要新能力时再按白名单放开。',
    keywords: ['webview', 'allowpopups', 'openExternal', 'Electron', '安全', 'any'],
    updatedAt: '2026-05-29',
  },
  {
    id: 'setting-association-runtime-and-preview-cleanup-001',
    title: '设定关联重开后仍保持且预览显示内部代码',
    area: '设定 / 关联其他设定 / 正文关联资料 / 智能导入',
    symptom:
      '关闭软件再打开后，正文和设定页仍可能显示上一轮关联资料；关联其他设定的预览里还会显示 {"type":"...","body":""} 这类内部保存结构，并占用路径和字数说明空间。',
    cause:
      '关联状态写入了本地保存的正文上下文和设定标签配置，清理依赖关闭事件不够稳；空正文设定使用原始 JSON 作为兜底预览；智能导入还保留旧分组名自动归类逻辑。',
    solution:
      '关联资料写入本次运行标记，读取时只接受当前运行创建的关联；软件启动、页面关闭和窗口隐藏都会清理本地关联痕迹；其他设定预览只显示标题和正文，空正文显示“暂无内容”；删除旧分组名兼容映射，测试页改用新版 <剧情规划> / *剧情蓝图* / 【子设定】格式。',
    prevention:
      '临时关联只能按运行期生效，不能直接信任本地持久化值；预览层禁止展示内部 JSON；智能导入格式升级后要删除旧名兼容，避免提示词和导入规则不一致。',
    keywords: ['关联其他设定', '正文关联资料', '运行期关联', '智能导入', '预览 JSON', '旧名兼容'],
    updatedAt: '2026-06-23',
  },
  {
    id: 'world-map-default-entries-locked-001',
    title: '世界地图默认条目应不可删除',
    area: '工作台 / 设定 / 势力地图 / 世界地图',
    symptom: '世界地图下的“世界架构”和“危险区域”属于默认骨架，但旧作品可能缺失或被当成普通设定处理。',
    cause: '默认设定种子版本没有为这次锁定规则单独升级，已有作品不会重新检查并补齐这两个默认条目。',
    solution:
      '提升默认设定种子版本，继续用 lockedDefaultEntryId 和默认类型标题识别“世界地图 / 世界架构”“世界地图 / 危险区域”，让右键删除、清空分组和清空设定都保留它们。',
    prevention:
      '新增默认骨架条目时，要同时加入默认种子、锁定识别、清空保留逻辑和回归测试；旧作品补齐场景需要升级种子版本。',
    keywords: ['世界地图', '世界架构', '危险区域', '默认设定', '不可删除', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-24',
  },
];
