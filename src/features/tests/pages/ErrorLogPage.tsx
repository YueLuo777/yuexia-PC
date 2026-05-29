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
    solution: '细纲页隐藏外层 outlinePreviewTitle，只保留边框嵌入的章节细纲标签；卷概要和章节概要仍继续显示原来的外层标题。',
    prevention: '以后给输入框或预览框增加边框嵌入标签时，先检查外层标题是否重复；若标签已承担标题作用，应移除外层标题避免挤占空间。',
    keywords: ['细纲预览', '显示不全', '边框标签', 'outlinePreviewTitle', 'detail outline'],
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
