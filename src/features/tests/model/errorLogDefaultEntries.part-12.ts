import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart12: ErrorLogEntry[] = [
  {
    id: 'theme-color-detail-outline-number-block-colors-001',
    title: '主题颜色缺少章纲数字块四状态配置',
    area: '主页 / 主题颜色 / 章纲数字块',
    symptom: '章纲页数字块的选中、已用、有章纲、无章纲状态颜色固定在代码里，用户无法在主题颜色中按自己的视觉习惯调整。',
    cause:
      '主题颜色自定义页只覆盖全局界面颜色，没有把章纲页新增的小数字块状态纳入颜色槽；章纲页数字块也直接写死蓝白边框和背景。',
    solution:
      '在主题颜色页新增“章纲数字块”标签，提供选中、已用、有章纲、无章纲四个配置项；新增对应 CSS 变量并让正式章纲页 36px 数字块按状态读取变量。',
    prevention: '新增可复用 UI 状态时，同步检查是否应进入主题颜色配置；正式页面不要把状态色长期硬编码在组件类名里。',
    keywords: [
      '主题颜色',
      '章纲数字块',
      '选中',
      '已用',
      '有章纲',
      '无章纲',
      'DarkThemeColorPage',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-palette-sorted-tabs-in-header-001',
    title: '主题颜色自定义色板颜色相近项分散且标签占用独立行',
    area: '主页 / 主题颜色 / 自定义颜色',
    symptom:
      '自定义颜色色板里灰色、红橙黄绿蓝紫等相近颜色分布较散，用户找同类颜色需要来回扫；自定义颜色和主题色板标签页单独占一行，顶部标题栏中间留空。',
    cause:
      '色板按历史添加顺序拼接基础色和扩展色，没有统一按饱和度、灰阶和色相排序；标签页沿用页面主体下方布局，未利用标题栏中间空位。',
    solution:
      '新增色板排序函数，低饱和灰阶先按明暗排列，彩色按红、橙、黄、绿、青、蓝、紫、粉的色相顺序排列；将自定义颜色/主题色板标签移入主题颜色标题栏中间。',
    prevention:
      '长色板扩展时不要只追加到末尾，应保持按视觉相近度排序；页面顶部有足够空间时，主标签优先并入标题栏，避免单独占一整行。',
    keywords: ['主题颜色', '自定义颜色', '色板排序', '灰色', '标签页', '标题栏', 'DarkThemeColorPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-picker-three-column-workspace-001',
    title: '主题颜色点击颜色区工具和常用色混在一起',
    area: '主页 / 主题颜色 / 自定义颜色 / 点击颜色',
    symptom:
      '点击颜色区域顶部把手动色值、使用颜色、恢复默认、确认替换、常用颜色全部排在同一块，控件很多时需要横向扫读，常用色也会占满一整行。',
    cause:
      '早期为了让预览先出现，把所有操作集中到颜色区顶部工具栏；但色板扩展到 100 色后，工具栏承担了太多职责，和用户主要任务“点颜色”抢空间。',
    solution:
      '将点击颜色区改成三栏：左侧为大面积滚动色板，中间窄列只放常用颜色，右侧窄列只放手动色值和操作按钮；标题区只保留“点击颜色”。',
    prevention: '色板类界面优先让候选项占最大面积，常用项和操作按钮应作为独立窄列或工具区，不要和主色板标题混排。',
    keywords: ['主题颜色', '点击颜色', '自定义颜色', '常用颜色', '确认替换', '三栏布局', 'DarkThemeColorPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-page-compact-header-and-copy-001',
    title: '主题颜色页面顶部空间过松且说明文字过多',
    area: '主页 / 主题颜色 / 自定义颜色',
    symptom:
      '主题颜色页面顶部标题卡片、主题切换和标签栏占用高度过大；说明文字重复解释操作流程，用户需要多滚动、多扫读才能进入选择位置、预览和点击颜色区域。',
    cause:
      '主题颜色页从测试页演化而来，保留了偏说明型的标题描述、长主题名称和较大的 header/tab 内边距；自定义颜色区域也保留了多处帮助文案，增加了视觉噪音。',
    solution:
      '压缩页面外边距、header 高度、返回键和标签栏高度；把“白色主题（默认主题）/黑色主题”缩短为“白色/黑色”；删除顶部说明、选择位置说明、预览说明和当前修改说明，并收紧自定义区域卡片内边距。',
    prevention:
      '从测试页迁入正式设置页面时，只保留用户完成操作必须看到的标题、状态和按钮；可从控件本身推断的流程说明不要长期留在页面顶部。',
    keywords: ['主题颜色', '自定义颜色', '顶部空间', '说明文字', '标签栏', '返回键', 'DarkThemeColorPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'dashboard-settings-page-back-button-style-001',
    title: '左下角设置页返回键样式不统一',
    area: '主页 / 左下角设置入口 / 系统设置、快捷键、导航设置',
    symptom:
      '系统设置、快捷键和导航设置虽然已有返回按钮，但按钮放在右上角，形态更像关闭按钮；用户希望都参考主题颜色页面的返回键。',
    cause:
      '非主题设置页从原弹窗关闭按钮演化而来，页面模式只替换了图标，没有同步主题颜色页“标题左侧 36px 带边框返回按钮”的页面级导航样式。',
    solution:
      '三个设置页的 page variant 统一把返回按钮移动到标题左侧，并使用 h-9 w-9、边框、浅底、ArrowLeft 的图标按钮样式；modal variant 继续保留右上角关闭按钮。',
    prevention:
      '左下角设置入口改成页面后，返回导航应统一放在标题左侧；右上角只保留弹窗关闭语义，避免页面和弹窗交互混用。',
    keywords: ['左下角', '系统设置', '快捷键', '导航设置', '返回键', '主题颜色', 'DashboardLayout'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-custom-color-picker-bottom-scroll-preview-fixed-001',
    title: '主题颜色自定义色板过长导致预览被挤到下方',
    area: '主页 / 主题颜色 / 自定义颜色',
    symptom:
      '自定义颜色页里“选择位置”“点击颜色”“预览”混排，100 色色板过长时会把预览挤到下方；用户选靠后的颜色时需要来回滚动才能确认预览效果。',
    cause:
      '自定义颜色工作流沿用三栏或顺序堆叠布局，颜色按钮区参与整页高度计算，预览没有固定在颜色区之前；常用颜色和确认按钮也以独立卡片占用额外高度。',
    solution:
      '自定义颜色页改为上下两段：上方固定展示“选择位置”和“预览”，下方单独承载“点击颜色”；手动色值、常用颜色、恢复默认和确认替换放在颜色区顶部工具栏，100 色色板在下方独立滚动。',
    prevention:
      '长色板、长列表类选择器必须让结果预览先于滚动选择区出现；预览、当前目标和确认动作不要被可滚动候选列表推到屏幕底部。',
    keywords: ['主题颜色', '自定义颜色', '预览', '点击颜色', '常用颜色', '确认替换', '独立滚动', 'DarkThemeColorPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'dashboard-footer-settings-pages-not-modals-001',
    title: '主页左下角设置入口不应继续打开弹窗',
    area: '主页 / 左下角设置入口 / DashboardLayout',
    symptom:
      '主页左下角的系统设置、主题颜色、快捷键、导航设置四个入口使用弹窗承载内容，弹窗拖拽、缩放、关闭和遮罩状态容易互相影响，用户希望它们作为稳定页面打开。',
    cause:
      'DashboardLayout 直接持有四个 show state，并在主页末尾渲染多个 fixed 弹窗；设置内容和主页布局耦合，任何弹窗层问题都会回到主页交互。',
    solution:
      '四个入口改为 Link 跳转页面；主题颜色复用已有 /theme-colors 页面，系统设置、快捷键、导航设置在原组件旁新增 Page 出口并注册 /system-settings、/shortcut-settings、/nav-settings 路由；导航设置保存时派发配置更新事件刷新左侧栏。',
    prevention:
      '主页左下角这类常驻设置入口优先走主内容区页面路由，不再在 DashboardLayout 内新增固定遮罩弹窗；确实需要弹窗时才保留 modal variant，并配套页面级回归测试。',
    keywords: ['主页', '左下角', '系统设置', '主题颜色', '快捷键', '导航设置', '弹窗', '页面路由', 'DashboardLayout'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'dashboard-home-click-freeze-draggable-modal-default-loop-001',
    title: '主页打开后所有内容都点不了',
    area: '主页 / DashboardLayout / useDraggableModal',
    symptom:
      '软件能打开到“我的小说”主页，但主页、侧栏和顶部按钮点击都像没有反应；Electron 日志里连续刷出 Maximum update depth exceeded。',
    cause:
      'DashboardLayout 调用 useDraggableModal 时直接传入内联默认几何对象，例如 { x: 0, y: 0, width: 1280, height: 860 }。每次渲染都会创建新对象，hook 的 effect 把 defaultGeometry 当依赖后又 setGeometry，形成渲染、effect、setState、再渲染的循环。',
    solution:
      'useDraggableModal 改为按 defaultGeometry 的 x、y、left、top、width、height 数值作为依赖，并在写入 state 前比较几何值是否真的变化；新增回归测试覆盖“调用方传内联默认几何对象不应触发 Maximum update depth exceeded”。',
    prevention:
      '共享 hook 不要把调用方传入的对象字面量直接作为会 setState 的 effect 依赖；要么拆成稳定的原始值依赖，要么在 setState 前做值相等判断。以后主页级弹窗接入 useDraggableModal 后必须跑该 hook 回归测试。',
    keywords: [
      '主页',
      '点不了',
      'Maximum update depth exceeded',
      'useDraggableModal',
      'DashboardLayout',
      'defaultGeometry',
      'setState',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'dashboard-sidebar-navigation-hash-router-stale-001',
    title: '首页左侧导航点击后 hash 改变但页面不切换',
    area: '首页 / 左侧导航 / DashboardLayout / HashRouter',
    symptom:
      '左侧导航看起来点不了；实际点击后 URL hash 会从 #/novels 变成 #/library 或 #/prompts，但左侧选中态和主内容仍停在“我的小说”。如果之前主题颜色弹窗没有关闭，隐藏的 fixed 遮罩还会直接拦截左侧导航点击。',
    cause:
      '主题颜色验证后可能残留 dashboard-theme-colors 浮层遮罩；遮罩关闭后，DashboardLayout 原先依赖 Link/raw hash 导航，当前 HashRouter 运行态里会出现 hash 已更新但 React Router location 没有同步刷新的情况，导致 Outlet 和 aria-current 都保持旧路由。',
    solution:
      '左侧导航改为 button + useNavigate 控制跳转，并给每个导航按钮标记 data-dashboard-nav-path；跳转后主动补发 hashchange/popstate 事件。如果 160ms 后 URL 已到目标但对应按钮仍不是 aria-current="page"，自动 reload 到当前 hash，保证导航最终可用；主题颜色弹窗接入 data-draggable-managed，避免全局弹窗托管和残留遮罩干扰。',
    prevention:
      '浏览器验证主题颜色等全屏弹窗后要关闭遮罩再测首页导航；首页左侧导航不要只依赖原生 hash 改变，应保留 React Router 控制跳转和“hash 到位但路由状态未同步”的兜底检测。',
    keywords: [
      '首页',
      '左侧导航',
      'HashRouter',
      'hashchange',
      'popstate',
      'useNavigate',
      '主题颜色',
      '遮罩',
      'DashboardLayout',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-modal-managed-resize-preview-001',
    title: '主题颜色弹窗拖拽缩放和预览裁切',
    area: '首页 / 主题颜色 / 自定义颜色弹窗',
    symptom:
      '主题颜色页面拖拽放大缩小时容易和全局兜底弹窗托管冲突，缩放后位置或尺寸不稳定；自定义颜色页三栏太硬，右侧预览在常见弹窗宽度下显示不全。',
    cause:
      '主题颜色弹窗仍是 DashboardLayout 内手写 fixed 浮层，没有显式接入 useDraggableModal、data-draggable-managed 和 ModalResizeHandles；自定义颜色内容在 xl 宽度就强制三栏，1280px 左右的弹窗会挤压预览。',
    solution:
      '主题颜色弹窗改用 useDraggableModal("dashboard_theme_colors") 管理位置和大小，外壳标记 data-draggable-managed 并补齐 ModalResizeHandles；DarkThemeColorPage 的标题区作为拖拽柄；自定义颜色标签前置并默认打开，预览在 modal 的 xl 宽度下跨整行显示，2xl 以上再回到右侧栏。',
    prevention:
      '以后新增首页级可缩放弹窗时，不要依赖 AppFrame 的全局兜底；应显式使用 useDraggableModal、稳定 storageId、data-draggable-managed 和 ModalResizeHandles。弹窗内部三栏布局要按实际弹窗宽度响应，不能只按整页宽度设计。',
    keywords: [
      '主题颜色',
      '自定义颜色',
      '拖拽',
      '缩放',
      '预览显示不全',
      'useDraggableModal',
      'ModalResizeHandles',
      'data-draggable-managed',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'theme-color-modal-scaled-palette-preview-001',
    title: '主题颜色弹窗在缩放下超出视口并挤压预览',
    area: '首页 / 主题颜色 / 自定义颜色',
    symptom:
      '软件处于 110% 等全局缩放时，主题颜色弹窗视觉高度会超过窗口；100 色色板没有内部滚动时，会把预览挤到页面很下面。',
    cause:
      '自定义颜色页扩展到 100 个颜色后仍让色板参与整页高度；useDraggableModal 读取 window.innerWidth/innerHeight 和鼠标位移时，没有扣除 AppFrame 的 --xinyuexia-effective-scale。',
    solution:
      '自定义颜色页把选择位置和 100 色色板改为弹窗内滚动，并让预览在 modal 排序中前置；useDraggableModal 读取有效缩放，按缩放后的 CSS 视口夹取尺寸、位置和拖拽/缩放增量。',
    prevention:
      '放在 AppFrame 缩放容器内的可拖拽缩放弹窗，都要用缩放后的可用视口和缩放后的鼠标 delta；长色板或长列表必须内滚，不要把预览推到整页末尾。',
    keywords: [
      '主题颜色',
      '自定义颜色',
      '100色',
      '预览',
      '拖拽',
      '缩放',
      '--xinyuexia-effective-scale',
      'useDraggableModal',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'context-library-empty-source-disabled-001',
    title: '正文关联资料不能选择无内容来源',
    area: '作品编辑器 / 正文 / 关联资料弹窗',
    symptom: '关联资料弹窗里某章显示“无正文”时仍能点击正文单选点，并且底部会显示将读取 0 字却仍出现确认关联入口。',
    cause:
      '正文/梗概/章纲的小圆点只判断当前章节或锁定状态，没有判断对应资料内容字数；确认按钮也只校验当前章纲是否存在，没有校验草稿选择是否包含有效字数。',
    solution:
      '新增 hasContextContent 校验；正文、梗概、章纲单项选择都要求字数大于 0 才可点；行选中不会再加入空内容项；确认关联要求草稿总字数大于 0 且所有选中项都有内容，并按原因显示禁用提示。',
    prevention:
      '以后关联资料弹窗新增资料来源时，选择控件和确认按钮都必须同时校验“存在该类型”和“内容字数大于 0”，不要把“无正文/无章纲”当作可关联资料。',
    keywords: ['关联资料', '无正文', '无梗概', '无章纲', '0字', '确认关联', 'hasContextContent', 'WorkbenchPage'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'global-custom-theme-colors-001',
    title: '主题颜色需要支持全局自定义和预览后确认',
    area: '全局主题 / 主题颜色弹窗 / 工作台颜色变量',
    symptom:
      '主页侧栏、工作台选中态、流程分组、正文输入区和软件标题栏颜色分散写死，用户想在主题颜色入口里选择位置、点击颜色、预览后确认保存。',
    cause:
      '原“主题颜色”页只是色板测试，没有保存到正式界面的全局变量；多个正式组件仍直接使用 #F5F5F7、#DBE7FB、#EAFBF3、#E7F8FD、#E4E9EF 等硬编码色。',
    solution:
      '新增 customThemeColors 模型，保存 6 个全局颜色目标和最近 20 个常用色；主题颜色页改为“主题色板 / 自定义颜色”双标签；主页侧栏、工作台选中态、流程分组、正文输入区和标题栏统一接入 CSS 变量并支持预览后确认应用。',
    prevention:
      '后续新增主题相关颜色时优先加入 CUSTOM_THEME_COLOR_SLOTS 和 CSS 变量，不要在组件里新增不可配置的硬编码背景色；改动后同步覆盖主题页、变量应用和相关源码断言测试。',
    keywords: [
      '主题颜色',
      '自定义颜色',
      '常用颜色',
      '#F5F5F7',
      '#DBE7FB',
      '#EAFBF3',
      '#E7F8FD',
      '#E4E9EF',
      'customThemeColors',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-small-blue-white-official-001',
    title: '章纲小号蓝白数字块迁入正式页并删除测试页',
    area: '作品编辑器 / 章纲 / 左侧章节数字块',
    symptom:
      '用户确认 12 号测试的小号蓝白按钮方案后，需要正式章纲页使用同样的数字块，并删除临时测试页，避免测试集合继续保留已迁入方案。',
    cause:
      '测试页已经验证了无章纲白底、有章纲蓝底、选中强蓝外框，但正式 WorkbenchLibraryPanel 仍停留在上一版 58px 带字数徽标的方案，测试集合也还挂着章纲选中态方案测试。',
    solution:
      '正式章纲左侧章节数字块改为 50px 小号按钮：无章纲白底，有章纲 #E7F8FD 蓝底；选中时统一加 #08AACE 强蓝外框和 ring，不再显示章纲字数或“无章纲”徽标；同步删除 WorkbenchDetailOutlineSelectionStyleTestPage 入口、render case 和测试页文件。',
    prevention:
      '以后测试页方案迁入正式页时，要把视觉方案、生产回归测试、测试集合入口删除和测试页文件删除一起完成；不要只改正式样式而留下临时测试入口。',
    keywords: [
      '章纲',
      '小号蓝白按钮',
      '50px',
      '#E7F8FD',
      '#08AACE',
      'WorkbenchLibraryPanel',
      'WorkbenchDetailOutlineSelectionStyleTestPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-flow-button-option-02-compact-double-line-001',
    title: '顶部流程按钮迁入 02 双行紧凑方案',
    area: '作品编辑器 / 顶部流程按钮',
    symptom: '用户确认测试页里的“02 双行紧凑”方案，要求正式顶部流程按钮使用标题和数据上下排的紧凑样式。',
    cause: '正式 Header 仍停留在上一版小号上下排和浅灰柔线的混合状态，组间距偏大，边框和尺寸没有完全按 02 方案收窄。',
    solution:
      'WorkbenchHeader 的流程按钮组改为 ml-8/gap-4；xy-flow-status-button 使用 40px 高、78px 最小宽、#D8E1EC 边框；选中态使用 #E7F8FD 背景与 #8FE4F2 边框。',
    prevention:
      '以后迁入流程按钮方案时，要同步更新 WorkbenchHeader、index.css、WorkbenchHeader.test.tsx 和本错误日志；不要只改测试页预览。',
    keywords: ['流程按钮', '02双行紧凑', 'WorkbenchHeader', '#D8E1EC', '#E7F8FD', '#8FE4F2'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-brainstorm-body-setting-selected-mint-001',
    title: '薄荷绿选中态应应用到脑洞正文设定而不是章纲数字块',
    area: '作品编辑器 / 脑洞 / 正文 / 设定 / 左侧选中态',
    symptom:
      '用户要求使用截图里的薄荷绿背景时，误把颜色改到了章纲左侧数字块；实际目标是脑洞、正文、设定页面的选中状态背景。',
    cause: '章纲数字块近期也在做选中态方案测试，且同样提到“有章纲/无章纲”，导致颜色需求被错误归类到章纲目录。',
    solution:
      '新增 xy-selected-mint-bg，颜色为 #EAFBF3；正文未发布/已发布章节、脑洞条目和设定条目选中态改用该类；正式章纲数字块的有内容选中态撤回浅蓝 #E7F8FD，不再使用 #EAFBF3/#8CEBC0。',
    prevention:
      '以后用户提到“脑洞、正文、设定页面选中状态”时，只改这些页面的左侧条目；章纲数字块颜色必须等用户明确点名章纲后再改。',
    keywords: ['薄荷绿', '#EAFBF3', '脑洞', '正文', '设定', '选中态', 'xy-selected-mint-bg', '章纲数字块'],
    updatedAt: '2026-06-13',
  },
  {
    id: 'detail-outline-selection-small-blue-white-test-001',
    title: '章纲选中态测试改为小号蓝白按钮且不显示字数',
    area: '测试集合 / 作品编辑器 / 章纲左侧数字条目',
    symptom:
      '上一版章纲选中态按钮偏大，并且显示章纲字数；用户希望重新看更轻的小方块，只靠白底、蓝底和强蓝外框表达状态。',
    cause:
      '方案 A 迁入后把“有内容”状态和字数徽标绑定在一起，测试页也继续展示字数，导致按钮高度和信息密度都比目标图更重。',
    solution:
      '章纲选中态测试页改为单一“小号蓝白按钮”方案：按钮缩小到 50px，只显示编号；无章纲为白底，有章纲为 #E7F8FD 蓝底；无章纲选中保持白底并使用 #08AACE 强蓝外框。',
    prevention:
      '正式迁入前先在测试页确认是否采用这版；如果采用，迁入时只改章纲数字条目，不重新带回字数徽标或旧的橙色空状态。',
    keywords: [
      '章纲',
      '小号蓝白按钮',
      '无章纲白底',
      '有章纲蓝底',
      '强蓝外框',
      'WorkbenchDetailOutlineSelectionStyleTestPage',
    ],
    updatedAt: '2026-06-13',
  },
  {
    id: 'workbench-flow-button-ten-design-options-test-001',
    title: '顶部流程组合按钮需要十套设计方案对比',
    area: '测试集合 / 作品编辑器流程按钮信息化方案',
    symptom:
      '现有流程按钮测试主要围绕 A-D 信息密度方案，用户希望针对截图里的两组组合按钮本身，再多比较组合按钮结构或更好的设计方向。',
    cause:
      '之前的测试页只展示名称/数量同排、紧凑、胶囊和上下排等少量变体，没有把标签页、步骤编号、时间线、仪表盘、下划线等不同组合模式放到同一页横向比较。',
    solution:
      '在 WorkbenchFlowButtonStatsTestPage 新增“十套组合按钮设计方向”，提供经典分段、双行紧凑、状态胶囊、步骤编号、底部进度条、标签页浮层、分组标题栏、时间线节点、小仪表盘、极简下划线 10 套可点击预览。',
    prevention:
      '正式迁入前先从该测试区选定一种组合模式；迁入时只带入被选方案的按钮结构、选中态和状态表达，不连带改变顶部栏其他控件。',
    keywords: [
      '流程按钮',
      '组合按钮',
      '十套方案',
      'WorkbenchFlowButtonStatsTestPage',
      '经典分段',
      '双行紧凑',
      '时间线',
      '仪表盘',
    ],
    updatedAt: '2026-06-13',
  },
];
