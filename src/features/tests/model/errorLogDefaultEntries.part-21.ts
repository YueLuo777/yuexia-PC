import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart21: ErrorLogEntry[] = [
  {
    id: 'detail-outline-card-title-meta-overlap-001',
    title: '章纲卡片浮动标题和右侧章节信息会重叠',
    area: '作品编辑器 / 章纲 / 章纲卡片边框标题',
    symptom: '章纲页面卡片上边框的“第N章章纲 + 字数”和右侧章节/卷信息在窄宽度下互相压住，出现文字重叠。',
    cause:
      '左侧 xy-floating-title-count 虽然有最大宽度，但章纲卡片右侧 meta 仍可占到 58%，左侧标题文本也没有独立截断容器，双方在同一条边框线上争空间。',
    solution:
      '给章纲卡片标题增加 xy-detail-outline-title-count 和 xy-floating-title-text，左侧标题按 min(13rem, calc(42% - 1.5rem)) 限宽并省略；右侧章节 meta 从 max-w-[58%] 收到 max-w-[44%]。',
    prevention:
      '同一条边框上同时有左右浮动信息时，两侧都必须有最大宽度，标题文本要独立支持 ellipsis，不能只依赖整组 label nowrap。',
    keywords: ['章纲', '浮动标题', '字数', '章节信息', '重叠', 'ellipsis'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-delete-and-outline-action-row-001',
    title: '剧情链卡片删除命名和生成章纲位置需要统一',
    area: '作品编辑器 / 生成剧情链 / 已选剧情点操作',
    symptom:
      '已选剧情点卡片里的破坏性按钮仍叫“移除”，不如“删除”明确；“生成章纲”放在每张卡片右侧，和过滤按钮分散，卡片操作区也偏挤。',
    cause:
      '此前把生成章纲当成单张剧情点操作放进卡片按钮组，但当前需求是针对当前剧情链整体生成章纲；过滤按钮使用固定三列，扩展新按钮时不够灵活。',
    solution:
      '把“移除”改名为“删除”；将“生成章纲”移动到左二顶部过滤按钮行，放在全部/只看未写/只看已写右侧；按钮行改为 flex-wrap 和 basis 自适应宽度。',
    prevention:
      '链级操作优先放在链级工具条，单卡片只保留该剧情点自身状态和删除动作；过滤/操作混排时用自适应宽度，不再固定三列。',
    keywords: ['剧情链', '删除', '生成章纲', '按钮行', '自适应宽度'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-written-filter-and-restore-001',
    title: '剧情链已写视图需要只显示已写并支持移回未写',
    area: '作品编辑器 / 生成剧情链 / 已写状态过滤',
    symptom:
      '正式剧情链左二的“已写隐藏”与“只看未写”效果重复，用户进入已写相关视图时仍看到未写内容；误点“标为已写”后也缺少撤回入口。',
    cause:
      '正式页沿用了测试方案里的 hideWritten 模式，但正式数据没有废弃状态，导致第三个过滤按钮没有独立价值；已写卡片按钮被禁用，只能显示状态不能恢复。',
    solution:
      '将第三个过滤模式改为“只看已写”，过滤时只显示已写剧情点；已写卡片按钮改为“移回未写”，点击后从当前链已写集合移除，并重新出现在未写序号导航里。',
    prevention: '过滤按钮名称必须对应可见内容；所有容易误点的状态迁移都要提供同屏撤回动作。',
    keywords: ['剧情链', '已写', '未写', '只看已写', '移回未写', '过滤'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-scheme-e-promote-and-remove-test-001',
    title: '剧情链方案 E 需要转入正式页并删除临时测试',
    area: '作品编辑器 / 生成剧情链 / 测试集合',
    symptom:
      '方案 E 已在测试集合里确认，但正式剧情链页面仍停留在多链目录和普通已选卡片结构，测试集合也继续保留“剧情链左二调试方案”临时入口。',
    cause: '方案选型完成后没有立即迁入 WorkbenchLibraryPanel，导致正式页面和测试预览出现两套剧情链交互。',
    solution:
      '正式剧情链页改为方案 E：左一显示当前主链、未写序号导航、右键重命名和备选链折叠；左二加入全部/只看未写/已写隐藏、当前卡片高亮和“标为已写”；删除测试集合入口、临时测试页和测试页单测。',
    prevention: '测试页选型完成后必须迁入正式页面，并同步删除测试入口，避免用户继续在临时方案和正式功能之间来回找。',
    keywords: ['剧情链', '方案E', '正式页', '测试集合', '删除测试', '未写序号'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-scheme-e-main-chain-context-menu-001',
    title: '剧情链方案 E 主链操作不应占用左侧目录空间',
    area: '测试集合 / 剧情链左二调试方案 / 方案 E',
    symptom:
      '方案 E 左侧当前主链下方仍显示“重命名 / 返回对比”两个按钮，占用目录树空间；用户确定主链后也不再需要返回多链对比入口。',
    cause: '主链锁定方案沿用了多链对比阶段的显性操作按钮，把低频操作和主线推进导航放在同一层级。',
    solution:
      '删除方案 E 的返回对比入口和对比分支；重命名改为当前主链分组的右键菜单项，默认界面只保留可折叠主链和未写序号导航。',
    prevention: '确定主链后的左侧栏优先展示推进目录；低频链级操作放入上下文菜单，不再占用常驻按钮位。',
    keywords: ['剧情链', '方案E', '返回对比', '重命名', '右键菜单', '当前主链'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-scheme-e-main-chain-unwritten-nav-001',
    title: '剧情链方案 E 当前主链需要折叠未写序号导航',
    area: '测试集合 / 剧情链左二调试方案 / 方案 E',
    symptom:
      '方案 E 左侧“当前主链”仍是大信息卡片，只显示主链名称和未写数量，不能像目录分组一样折叠，也不能直接按未写剧情点序号跳转。',
    cause: '主链信息展示和长链推进导航混在同一张卡片里，左侧空间被信息卡占用，几百个剧情点时缺少稳定的未写入口。',
    solution:
      '将当前主链改成可折叠分组，展开后只显示未写剧情点的数字按钮；点击数字会切回全部视图并选中对应剧情点，标为已写后该数字从未写导航中移除。',
    prevention:
      '长剧情链确认主链后，左侧优先承担目录导航职责；信息说明保持在分组标题和计数里，未写推进入口必须跟状态流转联动并用交互测试覆盖。',
    keywords: ['剧情链', '方案E', '当前主链', '未写序号', '折叠分组', '跳转'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-scheme-e-mark-written-content-density-001',
    title: '剧情链方案 E 需要把已完成剧情点移入已写板块',
    area: '测试集合 / 剧情链左二调试方案 / 方案 E',
    symptom:
      '剧情链左二调试方案 E 只展示过滤，用户看不到“未写剧情点写完以后进入已写板块”的迁移过程；卡片内容也太空，无法判断已写板块和未写板块的信息密度。',
    cause:
      '方案 E 最初只模拟长剧情链过滤状态，剧情点列表没有分成未写/已写/废弃板块，标记已写后也只是从当前过滤列表消失。',
    solution:
      '方案 E 改为本地看板状态，默认展示未写板块、已写板块、废弃板块；列表卡片补两行正文预览，底部详情补正文、AI评价和衔接；点击“标为已写”后，当前卡片从未写板块移动到已写板块。',
    prevention:
      '测试方案里的按钮不能只做样式占位；涉及状态流转时，要展示对象从一个板块迁移到另一个板块的完整过程，并用交互测试锁定迁移结果。',
    keywords: ['剧情链', '方案E', '标为已写', '已写板块', '未写板块', '测试集合'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'project-quick-verify-gates-001',
    title: '项目缺少一键快速验证门禁',
    area: '工程质量 / package scripts / lint 与 verify',
    symptom:
      '项目优化和 UI 调整后，需要手动记住类型检查、Electron 语法检查、启动器检查、测试和构建命令，容易漏跑某一项。',
    cause:
      'package.json 只有分散脚本，没有 lint、format、launcher check 和快速验证组合脚本；长期会让回归问题更晚暴露。',
    solution:
      '新增 ESLint flat config、Prettier 配置和 lint、format、format:check、check:launcher、verify:quick、verify 脚本；verify:quick 覆盖 lint、类型检查、Electron/启动器语法检查和测试。',
    prevention: '以后提交前优先跑 npm.cmd run verify:quick；涉及发布或打包前再跑 npm.cmd run verify。',
    keywords: ['项目优化', 'lint', 'verify', 'Prettier', 'ESLint', '快速验证'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'launcher-log-rotation-001',
    title: '启动日志需要轮转避免越积越大',
    area: '启动器 / 日志 / launch-xinyuexia',
    symptom:
      'launcher.log、dev-server.log、electron-dev.log 会持续追加，时间久了会变成很大的本地文件，影响排查和 Git 清理。',
    cause: '启动器只负责追加日志，没有在写入前检查文件大小，也没有稳定的 .old 备份策略。',
    solution:
      '新增 scripts/logRotation.mjs，在启动器创建日志流前按 5MB 上限轮转三类日志，并补 scripts/logRotation.test.mjs 锁定空文件、小文件、大文件和目录缺失场景。',
    prevention: '以后新增长期追加日志时先接入统一轮转函数，不要在启动脚本里各写一套文件大小判断。',
    keywords: ['启动器', '日志轮转', 'launcher.log', 'dev-server.log', 'electron-dev.log'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-storage-normalize-001',
    title: '工作台存储读取需要统一 normalize',
    area: '工作台 / 本地存储 / useWorkbenchData',
    symptom:
      '本地存储里的作品、卷章节映射或回收站数据一旦出现坏数据，工作台初始化容易回退不一致，后续页面会读到形状不稳定的数据。',
    cause:
      'useWorkbenchData 局部 JSON 读取逻辑和共享 jsonStorage 分散存在，初始化、刷新和回收站读取没有统一经过显式 normalizer。',
    solution:
      'useWorkbenchData 改为复用 readJsonValue、writeJsonValue，并导出 normalizeWorkbenchNovels、normalizeWorkbenchVolumeMap、normalizeWorkbenchRecycledMap；新增存储测试覆盖坏数据、缺失字段和回收站兜底。',
    prevention: '以后新增工作台本地存储 key 时同步提供 normalizer 和单测，页面不直接信任 localStorage 反序列化结果。',
    keywords: ['工作台', 'localStorage', 'normalize', 'jsonStorage', 'useWorkbenchData'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-real-interaction-tests-001',
    title: '剧情链交互测试不能只靠源码字符串',
    area: '测试集合 / 剧情链 / 真实交互测试',
    symptom: '剧情链测试页和正式页频繁改 UI 时，只检查源码字符串无法确认按钮真的能点击、折叠和切换。',
    cause:
      '之前测试更多锁定结构文本，缺少渲染后点击 1/2/3、AI评价、AI建议、隐藏已写、返回对比和确定主链的真实交互覆盖。',
    solution:
      '新增 PlotChainLeftDetailTestPage.test.tsx，渲染测试页并点击关键控件，确认方案 A 的序号跳转和 AI 折叠按钮、方案 E 的过滤与主链锁定都能实际生效。',
    prevention: '后续测试页如果有按钮、折叠、过滤或切换状态，至少补一个真实交互测试，不再只做静态预览。',
    keywords: ['剧情链', '交互测试', 'AI评价', 'AI建议', '隐藏已写', '测试集合'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-model-extraction-001',
    title: '剧情链模型逻辑不应堆在 WorkbenchLibraryPanel',
    area: '工作台 / 剧情链 / 模型层',
    symptom:
      'WorkbenchLibraryPanel.tsx 已经承载大纲、脑洞、剧情链等大量逻辑，剧情链候选、分数、链名和 slot normalize 继续堆在里面会增加改 UI 时误伤数据逻辑的概率。',
    cause: '剧情链模型辅助函数和组件渲染混在同一个大组件中，测试只能从组件源码间接判断逻辑是否存在。',
    solution:
      '新增 src/features/workbench/model/workbenchPlotChain.ts，抽出剧情链类型、常量、normalize、候选转换、预览文本、评价文本和指标分级函数；新增模型单测并让组件测试读取新模型文件。',
    prevention: '以后剧情链纯数据规则优先放在 model 层测试，WorkbenchLibraryPanel 只负责状态组合和渲染。',
    keywords: ['剧情链', 'WorkbenchLibraryPanel', 'model', 'normalize', 'workbenchPlotChain'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'electron-webview-security-guard-tests-001',
    title: 'Electron 和 webview 安全边界需要测试锁定',
    area: 'Electron / webview / 安全回归测试',
    symptom: 'Electron 主窗口、外部链接和内置 webview 的安全设置如果被后续改动放松，可能不会在普通 UI 测试里暴露。',
    cause:
      '安全边界主要写在 Electron 主进程和 webview 属性里，缺少针对 contextIsolation、nodeIntegration、sandbox、外部协议白名单和 allowpopups 的回归测试。',
    solution:
      '新增 electron/security.test.mjs，检查 BrowserWindow 安全配置、setWindowOpenHandler deny 默认策略、http/https/mailto 协议白名单，以及 webview 不再使用 allowpopups。',
    prevention: '以后调整 Electron 窗口、外链打开或 webview 能力时先扩展安全测试，再放开具体协议或能力。',
    keywords: ['Electron', 'webview', '安全', 'allowpopups', 'contextIsolation', 'sandbox'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-main-lock-hidden-written-test-001',
    title: '剧情链需要主链锁定和隐藏已写测试方案',
    area: '测试集合 / 生成剧情链 / 主链推进模式',
    symptom:
      '小说剧情链可能有几百个剧情点，已写剧情点继续显示会占用大量空间；确定一条剧情链后，剧情链2、剧情链3仍在左侧出现也会干扰继续推进。',
    cause:
      '现有测试方案主要围绕多链对比和单点详情，没有模拟“主链已确定后”的单链推进状态，也没有为剧情点状态过滤提供预览。',
    solution:
      '在“剧情链左二调试方案”末尾新增方案 E：主链锁定 + 隐藏已写剧情点。它默认展示当前主链、重命名、返回对比、备选链折叠，以及全部/只看未写/已写隐藏三个过滤按钮。',
    prevention:
      '剧情链正式实现时，剧情点需要保存未写/已写/废弃状态；主链确定后只显示当前主链，备选链收进折叠区，不直接删除。',
    keywords: ['剧情链', '主链锁定', '隐藏已写', '只看未写', '备选链', '测试集合'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-left-detail-buttons-001',
    title: '剧情链左二调试方案需要序号跳转和 AI 按钮',
    area: '测试集合 / 生成剧情链 / 剧情链左二调试方案',
    symptom:
      '测试页方案 A 里上方剧情点序号只是静态展示，点击后不会切换到对应剧情点；AI评价和接下来衔接仍是大块内容区，占用空间且不像可折叠操作。',
    cause: '测试预览最初只用于静态布局对比，没有给序号按钮绑定当前剧情点状态，也没有把评价和建议拆成独立按钮。',
    solution:
      '方案 A 新增当前剧情点状态，点击上方 1/2/3 会切换正文、标题和指标；把 AI评价和 AI建议改成两个按钮，点击后分别展开对应内容。',
    prevention:
      '后续剧情链调试方案如果出现序号导航，必须绑定选中剧情点；AI评价、AI建议这类辅助内容默认以按钮入口呈现，避免直接占满正文空间。',
    keywords: ['剧情链', '左二栏', '序号跳转', 'AI评价', 'AI建议', '测试集合'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-left-detail-design-test-001',
    title: '多条剧情链切换和左二栏调试需要方案对比',
    area: '测试集合 / 生成剧情链 / 剧情链切换与剧情点详情栏',
    symptom:
      '用户可能同时维护多条剧情链并进行对比，需要先快速切换剧情链，再查看当前剧情点正文、AI评价和接下来剧情点衔接；现有左二栏单独承载这些信息会显得拥挤。',
    cause: '剧情链切换和剧情点详情调试是两个不同层级，如果都塞在同一栏里，会导致链切换入口和当前点详情互相抢空间。',
    solution:
      '在测试集合 AI 链路测试分组末尾新增“剧情链左二调试方案”，四个方案都采用左侧窄栏切换剧情链、右侧调试当前链剧情点的结构。',
    prevention:
      '涉及多条剧情链对比的布局改动，先明确“左侧切链、右侧调点”的层级，再在测试集合末尾新增多方案页，选定后再迁入正式页面并删除测试入口。',
    keywords: ['剧情链', '左二栏', '切换', '调试方案', 'AI评价', '衔接', '测试集合'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-tree-scheme-a-applied-001',
    title: '剧情链目录方案 A 需要转正并删除测试页',
    area: '作品编辑器 / 生成剧情链 / 左侧目录树',
    symptom: '剧情链目录分组方案测试页已确认使用方案 A，继续保留测试入口会干扰测试集合查找。',
    cause: '多方案测试页完成了选型，但正式剧情链目录还没有迁入方案 A 的层级结构，测试集合也还保留临时入口。',
    solution:
      '正式剧情链目录改为方案 A：分组整行色块，剧情点缩进到左侧竖线下方；删除测试集合里的剧情链目录分组方案入口、预览组件和切换分支。',
    prevention: '测试页选型完成后，应立即迁入正式页面并删除对应临时测试入口，避免测试集合长期堆积临时方案。',
    keywords: ['剧情链', '目录树', '方案A', '测试页删除', 'TestCollectionPage'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'plot-chain-tree-design-test-scroll-001',
    title: '剧情链目录方案测试页需要可滚动',
    area: '测试集合 / 剧情链目录分组方案',
    symptom: '剧情链目录分组方案测试页只能看到方案 A/B，看不到下方方案 C/D，也没有滚动条可往下拉。',
    cause: '测试页内容超过可视高度，但外层容器只设置最小高度，没有在测试集合嵌入视口内提供纵向滚动。',
    solution: '将测试页外层改为 h-full overflow-y-auto，并保留底部间距，让 A-D 四个方案都能在当前测试页内滚动查看。',
    prevention: '测试集合里的多方案页面应在页面根容器提供自己的滚动，不依赖外层页面滚动。',
    keywords: ['剧情链', '测试集合', '方案CD', '滚动条', 'PlotChainTreeDesignTestPage'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-metric-score-color-tiers-001',
    title: '剧情链指标分数需要颜色等级',
    area: '作品编辑器 / 生成剧情链 / 已选剧情点指标',
    symptom: '内容、潜力、衔接三个指标都使用白底，只靠数字区分强弱，80 分和 90 分以上的视觉差异不明显。',
    cause: '指标条没有按分数段建立颜色层级，用户需要逐个读数字才能判断优先级。',
    solution:
      '新增指标分数颜色函数，90 分以上为金色，80 分以上为紫色，70 分以上为蓝色，70 分以下为绿色；三个指标都按各自分数套用边框、底色和文字色。',
    prevention: '评分型指标应同时提供数字和颜色层级，避免所有分数在视觉上同权。',
    keywords: ['剧情链', '指标', '分数', '颜色等级', '金色', '紫色', '蓝色', '绿色'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-tree-design-schemes-001',
    title: '剧情链目录分组样式需要多方案对比',
    area: '测试集合 / 生成剧情链 / 左侧目录树分组',
    symptom: '当前剧情链目录分组虽然有颜色，但分组块和数字块堆在一起，视觉拥挤且不够美观。',
    cause: '正式页直接迭代单一方案，缺少同尺寸、同数据下的目录树视觉对比。',
    solution:
      '在测试集合新增“剧情链目录分组方案”测试页，按真实窄栏宽度提供目录树层级、分组卡片、细线目录、紧凑深浅对比四个方案。',
    prevention: '剧情链目录这类高频结构调整前，先用测试集合做多方案同域对比，再把选定方案迁入正式页面。',
    keywords: ['剧情链', '目录树', '分组方案', '测试集合', '多方案对比'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-tree-inactive-groups-visible-001',
    title: '剧情链未选中分组也需要可见底色',
    area: '作品编辑器 / 生成剧情链 / 左侧剧情链目录树',
    symptom: '剧情链目录里只有当前分组是蓝底，未选中的剧情链分组是白底文字，视觉上像普通文本，容易看不到分组边界。',
    cause: '未选中分组按钮使用 bg-white 和透明边框，只在 hover 时才出现颜色。',
    solution: '未选中分组改为浅蓝底、浅蓝边框和蓝色文字，数量也改为蓝灰色；选中分组继续使用深蓝底白字。',
    prevention: '目录树分组行不应完全依赖 hover 才可见；未选中状态也要保留轻量底色和边界。',
    keywords: ['剧情链', '目录树', '分组', '未选中', '浅蓝底', '可见性'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-selected-header-actions-moved-001',
    title: '剧情链已选栏顶部操作行应移入卡片',
    area: '作品编辑器 / 生成剧情链 / 已选剧情点栏操作区',
    symptom:
      '已选剧情链栏顶部单独显示“剧情链1 / 3点 / 生成章纲”一整行，占用纵向空间；用户希望删除这一行，并把生成章纲放到每个已选剧情点卡片的移除按钮右侧。',
    cause: '生成章纲入口仍放在左二栏 header，和当前以剧情点卡片为主的布局不一致。',
    solution:
      '删除左二栏顶部 header；在已选剧情点卡片顶部右侧新增“移除 / 生成章纲”按钮组，生成章纲复用原来的 openDetailOutlineFromPlotPoint。',
    prevention: '剧情链左二栏避免再增加独立顶部操作行；针对已选剧情点的操作优先收进卡片顶部按钮组。',
    keywords: ['剧情链', '生成章纲', '移除', '已选剧情点', '顶部操作行', '卡片按钮'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-selected-metrics-above-review-001',
    title: '剧情链已选剧情点指标不应挤压正文宽度',
    area: '作品编辑器 / 生成剧情链 / 已选剧情点详情指标',
    symptom: '内容、潜力、衔接三个指标放在卡片右侧固定列，指标名和分数之间留白偏大，同时挤压左侧剧情正文宽度。',
    cause: '指标使用右侧固定宽度列布局，正文和指标横向分栏后，正文区域被迫变窄。',
    solution: '删除右侧指标列，把三个指标改为正文下方、AI评价按钮上方的三列横向信息条。',
    prevention: '剧情链已选卡片内的辅助指标不要抢正文横向空间；正文优先满宽，指标放在正文下方横排。',
    keywords: ['剧情链', '已选剧情点', '指标', '正文宽度', 'AI评价', '横向排列'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-selected-point-title-removed-001',
    title: '剧情链已选剧情点卡片不应重复显示标题',
    area: '作品编辑器 / 生成剧情链 / 已选剧情点卡片标题',
    symptom:
      '已选剧情点卡片顶部同时显示蓝色数字圆点和“剧情点 1 / 剧情点 2”文字标题，信息重复，用户希望只保留数字序号。',
    cause: '卡片标题区在圆形序号之外又渲染了一行剧情点编号文字。',
    solution: '删除已选剧情点卡片顶部的文字标题，只保留左侧数字序号和右侧移除按钮。',
    prevention: '剧情链已选卡片的序号只保留一种表达；如果已有明显数字徽标，不再重复渲染文字编号标题。',
    keywords: ['剧情链', '已选剧情点', '标题', '数字序号', '剧情点1', '重复显示'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-selected-metrics-inline-001',
    title: '剧情链已选剧情点指标应横向单行显示',
    area: '作品编辑器 / 生成剧情链 / 已选剧情点详情指标',
    symptom:
      '已选剧情点右侧的内容、潜力、衔接三个指标使用上下两行小卡片显示，占用高度偏大，和参考图的单行指标条不一致。',
    cause: '指标栏沿用窄列卡片结构，每个指标内部把标签和分数上下排列，导致三项叠加后视觉过高。',
    solution: '把指标栏改为 104px 宽的横向条目，每项使用白底圆角行，左侧显示指标名，右侧显示分数。',
    prevention: '剧情链详情卡右侧指标应优先使用紧凑单行信息条，不要回退成上下分层的小卡片。',
    keywords: ['剧情链', '已选剧情点', '指标', '内容', '潜力', '衔接', '单行显示'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-number-blue-and-review-collapsed-001',
    title: '剧情链目录按钮应白底蓝色选中且 AI 评价默认折叠',
    area: '作品编辑器 / 生成剧情链 / 目录数字与剧情点详情',
    symptom: '剧情链目录分组按钮和数字序号仍可能出现橙色选中态；已选剧情点卡片默认展开 AI评价，占用正文展示空间。',
    cause: '目录数字块和剧情链分组按钮继承了旧剧情链选中态的橙色风格；剧情点详情卡把评价内容作为固定内容块直接渲染。',
    solution:
      '目录分组按钮与数字块都改为白底默认态，当前项使用蓝色选中态；AI评价默认只显示折叠按钮，点击后才展开评价内容，正文区域可显示更多生成内容。',
    prevention: '目录按钮的选中态应跟章纲数字块一致用蓝色；辅助评价类内容默认折叠，避免挤占主内容空间。',
    keywords: ['剧情链', '目录按钮', '数字序号', '蓝色选中', 'AI评价', '折叠', '剧情点详情'],
    updatedAt: '2026-06-08',
  },
  {
    id: 'workbench-plot-chain-tree-number-blocks-compact-001',
    title: '剧情链目录数字序号块仍然偏大',
    area: '作品编辑器 / 生成剧情链 / 左侧目录树数字序号',
    symptom: '剧情点数字序号块虽然固定尺寸，但视觉上仍然比参考图大，用户希望高度再缩小约 40%，宽度缩小约 20%。',
    cause: '上一版固定为 48px 宽、54px 高，仍接近卡片按钮尺寸，不够像紧凑目录序号。',
    solution: '把数字序号块压缩为 38px 宽、32px 高，同时收小圆角和字号。',
    prevention: '目录数字块需要按参考图的紧凑尺度落地，避免把卡片按钮尺寸直接搬到目录里。',
    keywords: ['剧情链', '目录树', '数字序号', '紧凑尺寸', '宽度', '高度'],
    updatedAt: '2026-06-08',
  },
];
