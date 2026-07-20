import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart35: ErrorLogEntry[] = [
  {
    id: 'tomato-browser-force-mobile-reload-loop-001',
    title: '番茄浏览器清理移动端参数不应造成页面卡住',
    area: '番茄浏览器 / webview / URL 同步',
    symptom: '点击番茄浏览器进入页面时，页面可能长时间卡住或反复加载。',
    cause:
      'webview 实际地址可能被站点重定向为带 force_mobile=1 的 URL；同步导航状态时如果直接把该地址清理后写回 currentUrl，而 currentUrl 又绑定到 webview src，就会导致实际地址和 React 期望地址来回切换。',
    solution:
      '分离 webview 实际加载地址和软件显示/保存地址；currentUrl 保留实际加载地址避免重载循环，地址栏、首页和收藏继续使用 normalizeTomatoBrowserUrl 后的干净地址。',
    prevention:
      '第三方站点的实际导航地址不要和本地展示/配置地址共用同一个规范化状态；清理参数时只能清理本地显示和持久化路径，不能强行反复改写 webview 的 src。',
    keywords: ['番茄浏览器', '卡住', 'force_mobile', 'webview', 'currentUrl', 'normalizeTomatoBrowserUrl'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'tomato-browser-ai-panel-resize-release-001',
    title: '番茄浏览器 AI 配置栏拖拽松手后不应继续拖动',
    area: '番茄浏览器 / AI 配置栏 / 拖拽分割线',
    symptom: '拖拽番茄浏览器右侧 AI 配置栏宽度后，松开鼠标仍可能继续触发拖拽效果。',
    cause:
      '拖拽使用 document 级 mousemove/mouseup，当鼠标释放发生在 Electron webview 或窗口外时，页面可能收不到 mouseup，导致全局移动监听没有被移除。',
    solution:
      '改用 Pointer Events 和 setPointerCapture；拖拽开始前先清理旧监听，结束时统一移除 pointermove/pointerup/pointercancel/blur，并释放 pointer capture。',
    prevention: '靠近 webview、iframe 或窗口边缘的拖拽控件应使用 pointer capture，并提供 cancel/blur 兜底释放路径。',
    keywords: ['番茄浏览器', 'AI配置', '拖拽', 'pointerup', 'pointercancel', 'setPointerCapture'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'new-work-groups-default-expanded-001',
    title: '打开软件后的设定页分组默认应展开',
    area: '工作台 / 设定库 / 人物库 / 资料侧栏',
    symptom: '打开软件后进入工作台设定页、人物设定或设定里的各个标签页时，多个分组仍默认处于折叠状态，需要手动展开。',
    cause:
      '角色/设定分组会读取上次保存的折叠集合；即使代码有无历史状态的默认展开逻辑，只要本地曾保存过折叠状态，重新打开软件仍会恢复为折叠。',
    solution:
      '设定页启动或切换标签页时，自动把当前可见的角色和设定分类补入展开集合，并跳过这次自动展开的持久化；剧本资料侧栏记录已初始化过的小说分组，新出现的分组默认加入展开集合。',
    prevention:
      '设定页这类主要导航分组应以打开软件默认展开为准；折叠只作为当前会话的临时操作，不应导致下次启动默认折叠。',
    keywords: ['设定页', '默认展开', '分组', 'expandedSettingTypes', 'expandedRoleTypes', 'expandedNovelIds'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'novel-library-dashboard-action-card-stable-width-001',
    title: '我的小说顶部作品整理卡片尺寸不应随作品数量变化',
    area: '我的小说 / 顶部四卡片 / 作品整理',
    symptom: '我的小说页面里，两本书和三本书状态下，顶部作品整理卡片中“新建小说”这一行的视觉宽度不一致。',
    cause:
      '顶部四卡片使用 fr 比例分配宽度，并读取旧的比例型本地宽度配置；页面可用宽度或历史拖拽值变化时，作品整理卡片会跟随伸缩。',
    solution:
      '将顶部四卡片改为固定像素宽度 [464, 434, 428, 424]，旧的比例型本地宽度自动回退到新默认值；拖拽调整也改为直接保存像素宽度。',
    prevention:
      '操作卡片承载固定 2x2 功能入口时，应使用稳定像素宽度或明确尺寸约束，不应让作品数量、滚动条或比例分配影响按钮行尺寸。',
    keywords: ['我的小说', '作品整理', '新建小说', '顶部四卡片', 'DEFAULT_DASHBOARD_CARD_WIDTHS', 'NovelLibraryPage'],
    updatedAt: '2026-07-08',
  },
  {
    id: 'workbench-character-setting-role-types-scope-001',
    title: '角色设定创建入口不应读取未定义的角色类型列表',
    area: '工作台 / 设定库 / 角色设定创建',
    symptom: '在设定库切换到角色范围并打开创建入口时，可能出现 roleTypeOptions 未定义，导致弹窗无法打开。',
    cause:
      '大文件拆分后，Phase2 保留了对 roleTypeOptions 的引用，但该变量要到后续 Phase6 才计算，且没有通过当前 scope 传入；@ts-nocheck 又掩盖了这个未定义引用。',
    solution:
      '把角色类型合并规则提取为 buildWorkbenchRoleTypeOptions 纯函数，Phase2 创建入口和 Phase6 展示逻辑共用同一计算来源，并为默认、隐藏、自定义和已保存角色类型增加单元测试。',
    prevention:
      '控制器分阶段拆分后应缩小 scope 并逐步恢复类型检查；跨阶段共享的派生数据应提取为纯函数，不能直接引用后续阶段才声明的局部变量。',
    keywords: ['工作台', '角色设定', 'roleTypeOptions', 'Phase2', 'Phase6', '@ts-nocheck', 'scope'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'workbench-ai-panel-extracted-input-scope-001',
    title: '工作台 AI 面板拆分后不应丢失输入框状态',
    area: '工作台 / 正文 AI 面板 / 视图拆分',
    symptom: '进入工作台时页面显示运行错误，提示 input is not defined，正文 AI 面板无法正常渲染。',
    cause:
      'WorkbenchAIPanelView 抽出为独立视图后仍直接读取 input，但父组件调用视图函数时没有把 input 放入 scope，视图端也没有从 scope 解构该值；类型豁免掩盖了未定义变量。',
    solution:
      '在 WorkbenchAIPanel 与 WorkbenchAIPanelView 的 scope 边界同时补入 input，并增加源码回归测试锁定传入、解构和输入框绑定三处连接。',
    prevention:
      '拆分采用 scope 传参的视图时，应为每个自由变量建立传入与解构的成对检查，并用 Electron 冒烟测试验证真实工作台入口，避免仅靠 TypeScript 和组件静态测试。',
    keywords: ['工作台', 'AI面板', 'input is not defined', 'WorkbenchAIPanelView', 'scope', 'Electron冒烟测试'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'workbench-outline-controller-group-scope-001',
    title: '工作台大纲入口不应传入未定义的 group 变量',
    area: '工作台 / 大纲库 / 控制器拆分',
    symptom: '切换到大纲、细纲或剧情链相关入口时，页面可能提示 group is not defined。',
    cause: '大纲分支调用拆出的控制器时，scope 中残留了未定义的 group 简写属性。',
    solution: '在兼容适配层中显式定义该旧字段，避免对象简写求值报错，并增加源码回归测试。',
    prevention: '拆分 scope 参数时检查对象简写属性是否在当前词法作用域真实存在。',
    keywords: ['工作台', '大纲', 'group is not defined', 'scope'],
    updatedAt: '2026-07-12',
  },
  {
    id: 'workbench-library-split-phase-action-links-001',
    title: '工作台拆分后的按钮动作不应断开跨阶段连接',
    area: '工作台 / 设定库 / 人物库 / 控制器拆分',
    symptom: '人物分组、创建角色、关联其他设定、清空和条目菜单等按钮可能无响应，或点击后出现未定义变量错误。',
    cause:
      '控制器拆成多个 Phase 后，前阶段事件处理器仍直接引用后阶段才声明的动作和派生数据；部分数据还在首次渲染时被提前快照为空数组，@ts-nocheck 隐藏了这些跨阶段断链。',
    solution:
      '使用按控制器实例隔离的动作桥注册后阶段函数和数据，前阶段事件在实际点击时读取实时值；角色列表、角色类型和关联设定列表改为惰性读取，并增加首次渲染直接点击的交互回归测试。',
    prevention:
      '拆分含循环依赖的控制器时，应明确建立实例级动作边界；禁止把后阶段数据在前阶段初始化时静态快照，并对创建、关联、清空、复制、移动、重命名和删除入口保留真实点击测试。',
    keywords: ['工作台', '按钮断链', 'Phase3', 'Phase4', 'Phase5', 'Phase6', '动作桥', '首次渲染'],
    updatedAt: '2026-07-12',
  },
];
