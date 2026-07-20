import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart1: ErrorLogEntry[] = [
  {
    id: 'novel-library-dashboard-four-card-width-lock-001',
    title: '小说库顶部四张概览卡片必须始终限制在可视区域内',
    area: '小说库 / 顶部概览 / 响应式布局',
    symptom: '软件缩放到 110% 后，第四张扩展卡片超出窗口，顶部概览区域出现横向滚动条。',
    cause: '四张卡片使用固定像素宽度，网格还设置了大于窗口的固定最小宽度并允许横向滚动。',
    solution:
      '将卡片宽度改为相对权重，用 minmax(0, weight fr) 在可用宽度内分配四列；拖动分隔条改为按当前网格宽度换算权重，整行始终保持 100% 宽度。',
    prevention:
      '多卡片概览行不得设置大于视口的固定最小宽度；调宽交互应保持总宽度不变，并覆盖 100%、110% 和窄窗口回归。',
    keywords: ['小说库', '扩展卡片', '横向滚动条', '响应式网格', '110%缩放', '卡片调宽'],
    updatedAt: '2026-07-11',
  },
  {
    id: 'desktop-runtime-audit-and-electron-e2e-001',
    title: '桌面运行时与构建工具链必须保持无已知审计漏洞并具备自动桌面冒烟',
    area: 'Electron / Vite / electron-builder / CI',
    symptom: '旧运行时完整审计包含高危漏洞，而且既有测试无法确认主进程、预加载桥和真实桌面页面能否共同启动。',
    cause: 'Electron 虽位于 devDependencies 却实际进入便携版；项目缺少真正启动 Electron 窗口的自动化门禁。',
    solution:
      '升级 Electron 43.1.0、electron-builder 26.15.3 和 Vite 7.3.6，吸收全部审计补丁；新增 Playwright Electron 冒烟、Windows CI 和新版运行时显式安装支持。',
    prevention: '桌面发布前运行完整审计；运行时大版本升级必须经过类型检查、构建、Electron E2E 和 VBS 实际启动。',
    keywords: ['Electron43', 'Vite7', 'electron-builder', 'Playwright', 'Windows CI', 'npm audit'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'model-api-key-electron-safe-storage-001',
    title: '模型 API Key 不应以明文留在 localStorage 或渲染层请求头',
    area: '模型管理 / Electron safeStorage / IPC',
    symptom: '模型 API Key 与普通模型元数据一起写入 localStorage，并由渲染层直接放入鉴权请求头。',
    cause: '主进程仅转发完整模型请求，没有独立的密钥仓库和鉴权头注入职责。',
    solution:
      '新增 safeStorage 加密仓库和受信 IPC；渲染层只发送模型实例密钥标识，主进程解密并注入鉴权头；旧明文加密成功后才清除。',
    prevention: '长期密钥不得进入可导出的页面存储、调用日志或渲染层请求快照；迁移必须先安全落盘再清除旧值。',
    keywords: ['API Key', 'safeStorage', 'localStorage', '模型管理', '密钥迁移', '受信IPC'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'backup-import-transaction-rollback-001',
    title: '全局备份导入失败时必须恢复导入前的数据',
    area: '数据迁移 / 全局备份 / localStorage',
    symptom: '覆盖式导入在清空旧数据后如果中途写入失败，会同时失去旧数据并只留下半份新数据。',
    cause: '导入流程缺少旧快照、体积预检和失败回滚。',
    solution: '恢复前保存当前快照并检查体积；写入失败时清理半成品并恢复旧快照，同时限制文件和解压后数据大小。',
    prevention: '覆盖式导入必须遵守先验证、再快照、后替换，并为失败路径加入自动回滚测试。',
    keywords: ['全局备份', '事务导入', '自动回滚', 'QuotaExceededError', '数据迁移'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'workbench-library-interaction-lazy-load-001',
    title: '大型工作台资料库应按需加载而不是阻塞普通章节编辑',
    area: '工作台 / 代码分割 / 首次加载性能',
    symptom: '约 302KB 的资料库面板以及管理页面在普通章节编辑入口也会被静态依赖加载。',
    cause: '工作台页面静态导入所有子工作流和管理弹窗，没有按真实交互入口拆分。',
    solution: '资料库面板、模型管理和提示词管理改为 React.lazy 动态导入，并提供统一加载状态。',
    prevention: '超过 100KB 且只在特定弹窗或工作流出现的模块默认使用交互级动态导入，并锁定不得恢复静态导入。',
    keywords: ['WorkbenchLibraryPanel', 'React.lazy', '代码分割', '工作台性能', '按需加载'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'desktop-launcher-vite-dependency-fingerprint-001',
    title: '桌面启动器不应复用依赖变更前的 Vite 预构建进程',
    area: '桌面启动器 / Vite / Electron 开发环境',
    symptom:
      '依赖或锁文件变化后，启动器仍复用返回 HTTP 200 的旧 Vite 进程，Electron 可能出现 Invalid hook call 并导致页面无法渲染。',
    cause: '启动器只检查服务器可访问性，没有判断长驻进程的依赖预构建是否与磁盘上的依赖输入一致。',
    solution:
      '为 package.json、package-lock.json 和 vite.config.ts 生成依赖指纹；指纹缺失或过期时，仅清理同时匹配本项目 Vite 入口和端口的进程，再启动服务器并写入最新指纹。',
    prevention: '复用长驻开发服务器前必须校验依赖输入；清理进程必须同时校验项目路径和端口，不能按进程名批量结束。',
    keywords: ['桌面启动器', 'Vite', '依赖指纹', 'Invalid hook call', 'launch-xinyuexia'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'save-and-ai-stream-persistence-coalescing-001',
    title: '正文自动保存和 AI 流式输出不应高频重写整份索引',
    area: '作品编辑器 / 自动保存 / 后台 AI 任务',
    symptom: '连续输入或接收较长 AI 流式输出时，作品、卷目录和全部后台任务会被短时间反复序列化写入。',
    cause: '正文变更同步重写大对象元数据，AI 每个分片都立即持久化全部任务，没有合并窗口。',
    solution:
      '正文保持即时保存；作品与卷目录元数据使用 350ms 可取消合并队列；AI 分片使用 250ms 合并持久化，关键生命周期和离开页面时立即刷新。',
    prevention: '高频路径只立即写最小必要数据；大对象索引与流式快照必须使用可刷新、可取消的合并队列并测试写入次数。',
    keywords: ['自动保存', '写入合并', 'AI流式输出', 'localStorage', 'workbenchPersistenceQueue'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'hotspot-production-dependency-audit-001',
    title: '生产依赖不应为热点聚合引入高危间接依赖',
    area: 'Electron 热点服务 / 生产依赖 / 安全审计',
    symptom: '生产依赖审计包含由 dailyhot-api 本地服务链带入的高危漏洞，而桌面端实际只使用公开热点接口。',
    cause: '热点服务同时保留第三方包的本地服务启动模式和公开接口回退，扩大了生产依赖面。',
    solution: '移除 dailyhot-api，统一通过既有公开 HTTPS 基址和 Electron 主进程代理获取热点，生产依赖审计归零。',
    prevention: '小型网络适配器能够完成的功能不引入整套服务端运行时；新增生产依赖必须检查实际调用路径和生产审计。',
    keywords: ['dailyhot-api', '生产依赖', 'npm audit', '热点服务', '供应链安全'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'source-contract-tests-format-stability-001',
    title: '源码契约测试不应因统一格式化产生大面积误报',
    area: '测试门禁 / Prettier / 工作台资料库',
    symptom: '统一格式化后，大量功能未变的源码断言因换行、尾逗号、颜色大小写或模块拆分而失败。',
    cause: '测试绑定原始源码排版和模块位置，资料库夹具还会把默认已展开分类再次点击为折叠。',
    solution:
      '源码守卫改用规范化匹配并指向真实拆分模块；分类夹具使用幂等展开；保留拖拽、右键和结构化字段的真实 DOM 测试。',
    prevention: '行为优先使用函数或 DOM 测试；源码守卫只断言稳定语义片段，不绑定格式化结果或旧模块位置。',
    keywords: ['源码契约', 'Prettier', 'toContainSource', '测试门禁', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'electron-trust-boundary-and-hotspot-ssrf-001',
    title: 'Electron 主页面、IPC、网页权限和热点抓取需要统一安全边界',
    area: 'Electron 主进程 / IPC / webview / 热点详情',
    symptom:
      '开发启动地址可指向任意远程网页并加载预加载桥，IPC 未核验调用页面，嵌入网页权限默认开放，热点详情可请求或跳转到本机及内网。',
    cause: '启动 URL、IPC sender、session 权限和主进程代发网络请求分别缺少完整的可信来源与公网地址校验。',
    solution:
      '启动地址仅允许回环 HTTP/HTTPS；主窗口阻止离开可信来源；特权 IPC 统一验证 sender；session 拒绝权限和新窗口；热点请求逐次验证 DNS、IP、跳转及最终 URL。',
    prevention:
      '新增 preload 能力必须接入可信 sender 包装；webview 默认拒绝权限；渲染层提交并由主进程代发的 URL 必须按 SSRF 规则验证重定向链。',
    keywords: ['Electron安全', 'IPC sender', 'webview权限', 'SSRF', '热点详情'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'novel-id-reuse-and-scoped-residue-001',
    title: '永久删除作品后不应复用作品 ID 或残留作品数据',
    area: '作品管理 / 永久删除 / 本地持久化',
    symptom:
      '永久删除当前最大编号作品后，新建作品可能复用相同 ID，并重新读到旧作品的设定、章纲、AI 会话、备忘录或剧本关联。',
    cause:
      '作品 ID 仅按当前作品和回收站中的最大值加一生成；永久删除只移除章节正文和卷目录，没有清除按作品 ID 命名的工作台存储。',
    solution:
      '新增单调递增的作品 ID 游标；永久删除成功写入索引后，精确清理该作品的正文、设定、章纲、AI 会话、备忘录、审核任务、润色状态和剧本关联。',
    prevention: '持久化实体 ID 不得从当前剩余数据反推复用；新增作品分区存储键时同步加入删除清单和邻近 ID 防误删测试。',
    keywords: ['作品ID', '永久删除', '数据残留', 'localStorage', 'novelPersistence'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'chapter-delete-recycle-transaction-001',
    title: '删除章节必须先可靠写入回收站再移除正文',
    area: '作品编辑器 / 章节删除 / 回收站',
    symptom: '章节删除依赖 React 状态更新函数同步执行时，章节可能从目录消失但没有进入回收站。',
    cause: '代码在状态 updater 内给局部变量赋值后立即在外部判断，并在目录更新后才保存回收站和删除正文。',
    solution:
      '从当前快照同步生成回收章节和新目录，先写回收站、再写卷目录，失败时回滚；两份索引成功后才删除正文并更新界面。',
    prevention:
      '多份本地存储的数据移动应先写可恢复副本、再更新索引、最后删除原数据，不通过状态 updater 向外传递事务结果。',
    keywords: ['章节删除', '回收站', '事务顺序', '数据安全', 'useWorkbenchData'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'chapter-review-task-scope-and-outline-sync-001',
    title: '审核后台任务和章纲预览必须跟随当前章节',
    area: '作品编辑器 / 审核 / 后台任务与章纲',
    symptom: '第一章开始审核后切到第二章，后台结果可能显示到第二章；同一作品修改章纲后审核预览仍可能显示旧内容。',
    cause: '任务 ID 只按作品和审核模式保存且恢复时未校验章节；章纲列表只依赖存储键做一次 memo。',
    solution:
      '任务索引按作品、章节和模式分区并校验元数据；切章恢复目标章节自己的任务。章纲预览改用父页面订阅到的实时资料快照。',
    prevention: '异步任务恢复必须校验完整业务作用域；localStorage 派生界面数据必须订阅写入事件或由响应式快照下发。',
    keywords: ['审核任务', '章节隔离', '章纲刷新', '后台AI', 'ChapterEditor'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'script-linked-novel-scoped-storage-001',
    title: '剧本关联小说必须按剧本独立保存',
    area: '剧本编辑器 / 关联小说 / 本地存储',
    symptom: '在剧本 A 关联小说后切换到剧本 B，剧本 B 会继承同一个关联小说。',
    cause: '所有剧本共用单一关联存储键，并在切换剧本时重复读取该全局值。',
    solution:
      '关联键升级为带剧本 ID 的 v2 键；旧值只迁移给首次打开的当前剧本一次，取消关联、会话清理和永久删除同步处理新键。',
    prevention: '作品级或剧本级状态必须把实体 ID 放入键或数据结构，并测试至少两个实体互不串值。',
    keywords: ['剧本编辑器', '关联小说', '数据隔离', 'scriptId', 'ScriptEditorPage'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'text-audit-paragraph-number-left-gutter-001',
    title: '文本审核段落编号应放在正文左侧并只显示数字',
    area: '作品编辑器 / 文本审核 / 审核后段落',
    symptom: '文本审核的第 N 段标签单独占据正文上方一行，段落正文左侧留有空位，纵向空间浪费且编号与正文对应不够直接。',
    cause: '审核后段落卡片按上下结构渲染完整的第 N 段标签和正文，没有为段落编号设置独立的左侧窄栏。',
    solution:
      '审核后段落改为左侧编号栏、右侧正文的横向网格；编号视觉上只显示 1、2、3 等数字，并保留第 N 段的无障碍说明。',
    prevention: '段落序号属于定位辅助信息，应使用窄侧栏或页边标记，不应占用独立正文行。',
    keywords: ['文本审核', '段落编号', '左侧编号栏', '审核后', 'ChapterEditor'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'audit-result-title-subcategory-001',
    title: '审核结果标题应明确区分剧情审核和文本审核',
    area: '作品编辑器 / 审核 / 结果列标题',
    symptom: '选择剧情审核或文本审核后，中间结果列都显示第 N 章 审核后，无法从标题直接确认当前审核类型。',
    cause: '审核结果标题只判断是否处于审核模式，没有继续读取所选审核提示词的二级分类。',
    solution:
      '标题改为跟随审核提示词类型；剧情审核显示第 N 章 剧情审核，文本审核显示第 N 章 文本审核，切换提示词后即时更新。',
    prevention:
      '审核页面中与类型相关的标题、视图和发送规则都应统一从当前提示词的审核二级分类派生，避免只按顶层审核模式判断。',
    keywords: ['剧情审核', '文本审核', '结果标题', '提示词二级分类', 'ChapterEditor'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'text-audit-side-by-side-red-diff-001',
    title: '文本审核应采用左右对照并标红审核后改动',
    area: '作品编辑器 / 文本审核 / 审核后左右对照',
    symptom:
      '用户确认文本审核使用方案 B，希望左侧显示原文、右侧显示审核后，并且修改后的地方能用红字显示；同时担心 AI 把整段删除后右侧不知道如何展示。',
    cause:
      '此前文本审核只逐段显示审核后正文，没有按原文和审核后计算差异；如果审核后段落为空或缺失，只能看到空段落或段落数不一致提示，不能明确表达整段已删除。',
    solution:
      '正式文本审核接入左右对照差异渲染：原文列对删除、替换内容显示淡红删除线，审核后列对新增、改写内容显示红字；审核后空段显示整段已删除，缺少对应段落时提示审核后缺少本段。发送给 AI 的文本审核兜底规则同步要求保持段落数，整段删除时保留空段位置，且不要输出 HTML、Markdown 颜色标记。',
    prevention:
      '文本审核高亮应由软件根据原文和【修改后全文】自动计算，提示词只负责输出纯正文；不要让模型输出颜色标签，否则会污染可替换正文。',
    keywords: ['文本审核', '方案B', '左右对照', '红字', '整段已删除', '修改后全文', 'ChapterEditor'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'test-content-page-needs-vertical-scroll-001',
    title: '测试内容页应允许纵向滚动',
    area: '测试集合 / 单个测试内容 / 滚动容器',
    symptom: '打开 10 号文本审核差异显示方案测试后，方案 C 只露出标题，页面底部没有向下滚动条，无法继续查看后续方案。',
    cause:
      '测试集合进入单个测试内容时，内容区域外层使用 overflow-hidden，长测试页超过可视高度后被直接裁剪；测试首页列表本身可滚动，但单个测试页没有继承这套滚动能力。',
    solution:
      '将测试内容承载区改为 overflow-y-auto，保留 min-h-0 flex-1，让 10 号测试的方案 C、方案 D 和以后更长的测试页都能在内容区内滚动查看。',
    prevention:
      '测试页外层可以使用 min-h-full 展示内容，但测试集合的 active content 容器必须提供纵向滚动，不能用 overflow-hidden 裁剪未知高度的测试页面。',
    keywords: ['测试集合', '10号测试', '文本审核差异显示方案', '滚动条', 'overflow-y-auto', 'TestCollectionPage'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'text-audit-result-audit-after-diff-preview-001',
    title: '文本审核结果应显示为审核后并提供红字差异方案',
    area: '作品编辑器 / 文本审核 / 审核后预览',
    symptom:
      '选择文本审核后发送给 AI，如果 AI 返回已停止等状态，审核结果列仍把状态提示当成审核后正文显示，并出现原文 N 段 / 审核后 1 段的误导；用户希望标题先改为审核后，并探索修改处红字显示的文本审核效果。',
    cause:
      '文本审核的审核后正文提取失败后，代码兜底使用了完整可见 AI 输出，导致错误、停止、未按格式输出的内容也进入段落对比；审核列标题仍沿用审核结果，不符合文本审核的正文修改语义。',
    solution:
      '审核预览列标题改为审核后；文本审核只接受本地草稿或【修改后全文】提取结果，不再把普通 AI 状态输出当成审核后正文；新增文本审核差异显示方案测试页，对比审核后正文红字、左右对照、段落卡片和改动清单 4 种方案。',
    prevention:
      '文本审核展示正文时必须先确认来源是修改后全文；错误、停止、思考状态和格式不合规输出只能作为提示，不能参与段落数核对。差异高亮正式迁入前先通过测试页确认视觉方案。',
    keywords: ['文本审核', '审核后', '红字', '差异显示', '修改后全文', 'TextAuditDiffDisplayTestPage'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'audit-prompt-flat-list-with-subcategory-meta-001',
    title: '审核提示词下拉应回到普通列表并用小字区分二级分类',
    area: '作品编辑器 / 剧情审核 / 提示词下拉 / 二级分类标记',
    symptom:
      '审核提示词下拉显示剧情审核 / 文本审核分组行后，列表视觉仍然偏重，用户希望恢复成普通提示词列表，只在提示词右侧用小字标明剧情或文本。',
    cause:
      '审核二级分类被渲染成独立下拉项或目录结构，会抢走提示词本身的视觉焦点；用户实际操作时更关心选择哪个提示词，而不是切换哪个分类。',
    solution:
      '审核提示词下拉不再生成分组项，改为平铺显示审核分类下所有提示词；每个选项增加 metaLabel，剧情审核提示词显示剧情，文本审核提示词显示文本。选择逻辑继续按提示词 subCategory 切换结构审核结果或文本审核结果视图。',
    prevention: '少量二级分类不要做成强分组或目录，优先用选项辅助信息表达；下拉列表的主文本始终应是可选提示词名称。',
    keywords: ['审核提示词', '普通列表', '剧情', '文本', 'metaLabel', 'CombinedAiConfigSelect', 'CapsuleSelect'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'audit-prompt-tree-grouping-too-strong-001',
    title: '审核提示词树形分组切换感过强',
    area: '作品编辑器 / 剧情审核 / 提示词下拉 / 测试方案',
    symptom:
      '审核提示词下拉采用树形分组后，剧情审核 / 文本审核分类感太强，用户感觉像在切换目录，选择结构审核时视觉动作偏硬。',
    cause: '树形线、分组图标、分类数量和缩进提示词共同强化了层级关系；分类标题在小下拉里占据了过多注意力。',
    solution:
      '删除旧审核提示词分组下拉原型测试页，新增审核提示词轻量下拉方案测试页，提供提示词后加小标签、轻分隔标题、顶部小筛选和双列分类 4 个更轻的方案。',
    prevention:
      '审核提示词数量少时，优先用标签或轻筛选表达分类，不要一开始就使用强树形目录；正式落地前先在测试板块比较切换感。',
    keywords: ['审核提示词', '树形分组', '切换感', '测试板块', 'AuditPromptSelectSoftGroupingTestPage'],
    updatedAt: '2026-07-10',
  },
  {
    id: 'audit-prompt-category-option-visual-confusion-001',
    title: '审核提示词下拉分类标题不应像普通提示词',
    area: '作品编辑器 / 剧情审核 / 提示词下拉 / 分类层级',
    symptom:
      '剧情审核页的提示词下拉里，剧情审核（分类）字号和普通提示词接近，看起来像一个可选择的提示词，用户不容易理解结构审核其实属于剧情审核分类。',
    cause:
      '下拉选项把审核二级分类作为 disabled option 渲染，虽然不能点击，但视觉层级仍接近普通选项，分类和提示词的主从关系不够明显。',
    solution:
      '曾将方案 D 树形分组迁入正式审核提示词下拉；分类行只显示剧情审核 / 文本审核和提示词数量徽标，不再显示分类二字，提示词选项缩进并显示文件图标。后续因切换感偏硬，旧测试页已删除，改为在审核提示词轻量下拉方案中继续比较更轻的方案。',
    prevention: '审核提示词分类标题应使用更小字号、弱颜色、目录语义和不可点击样式；不要再把分类当成普通选项同级渲染。',
    keywords: [
      '剧情审核',
      '结构审核',
      '提示词下拉',
      '分类',
      '分组',
      '测试板块',
      'AuditPromptSelectSoftGroupingTestPage',
    ],
    updatedAt: '2026-07-09',
  },
  {
    id: 'model-management-modal-compact-content-001',
    title: '模型管理弹窗顶部空间利用率不足',
    area: '模型管理 / 弹窗布局 / 模型卡片区',
    symptom:
      '从正文、审核等页面打开模型管理弹窗时，标题栏下方到模型卡片之间留有明显空白，只有一个模型时也会空出一条提示行位置。',
    cause:
      '模型管理内容区使用 px-7 py-6 的宽松内边距；“拖拽卡片可调整模型顺序”提示外层始终渲染 mb-5，即使模型数量不足 2 个、提示文字不显示，也会保留空行。',
    solution: '模型管理内容区改为 px-5 py-4；拖拽排序提示改为仅在 models.length > 1 时渲染，并将下方间距收紧为 mb-3。',
    prevention: '管理弹窗内的条件提示不能只隐藏文字而保留外层占位；单条数据状态要单独检查顶部空白。',
    keywords: ['模型管理', '弹窗', '空间利用率', '顶部空白', '模型卡片', 'ModelManagePage'],
    updatedAt: '2026-07-09',
  },
  {
    id: 'prompt-management-modal-compact-toolbar-001',
    title: '提示词管理弹窗顶部空间利用率不足',
    area: '提示词管理 / 弹窗布局 / 顶部工具区',
    symptom:
      '从正文、审核等页面打开提示词管理弹窗时，标题栏下方、小说/剧本切换下方、分类行下方和审核二级分类上方存在大段空白，卡片区开始位置过低。',
    cause:
      'PromptsPage 是按独立管理页的宽松布局写的，外层使用 px-7 py-7，顶部工具行和分类行又分别叠加 mb-6/mb-7，嵌入 80% 弹窗后浪费了明显的垂直空间。',
    solution:
      '将提示词管理主体压缩为弹窗友好的紧凑工具区：外层改为 px-5 py-4，顶部工具行、分类行、审核二级分类行分别收紧为 mb-3/mb-3/mb-4；工具栏和分类行支持换行与弹性占位，卡片区更早进入可视区域。',
    prevention: '管理页嵌入弹窗时，顶部筛选/工具区应按弹窗密度单独检查，不要沿用整页管理后台的宽松上下边距。',
    keywords: ['提示词管理', '弹窗', '空间利用率', '顶部工具区', '分类行', '审核二级分类', 'PromptsPage'],
    updatedAt: '2026-07-09',
  },
  {
    id: 'workbench-management-modal-max-80-percent-001',
    title: '管理弹窗应固定居中并保持软件窗口 80%',
    area: '工作台 / 模型管理弹窗 / 提示词管理弹窗 / 固定居中',
    symptom:
      '提示词管理、模型管理等管理弹窗在拖拽缩放或读取旧尺寸记录后，可能突然变得很大，宽高接近铺满软件窗口；从工作台顶部入口打开时，点击右下角缩放手柄会先缩小高度，随后只能改宽度，点右侧边线也会让宽度突然变窄；拖动标题区域时还可能跑到屏幕左上侧。',
    cause:
      '管理弹窗的 CSS 尺寸曾允许到 94vw/88vh；拖拽缩放后 useDraggableModal 会把宽高写成内联样式，本地保存过的大尺寸会绕过普通宽高类。工作台顶部和资料库模型/提示词管理弹窗接入了拖拽定位，初始 CSS 居中、鼠标视口坐标和 fixed 内联几何不在同一个坐标系里，拖动或缩放时会重新落盘成错误位置/宽高。即使组件里移除了 useDraggableModal，AppFrame 的全局弹窗拖拽兜底仍会扫描 .fixed.inset-0 浮层并自动注入拖拽/缩放能力。',
    solution:
      '提示词管理和模型管理弹窗统一固定居中显示，不再接入 useDraggableModal，不再传 headerDragHandleProps，不再渲染右下角缩放手柄；portaled 到 body 的管理弹窗使用固定 80vw/80vh，审核/状态页内入口按 --xinyuexia-effective-scale 抵消软件缩放后保持视觉 80%；所有模型/提示词管理弹窗外壳增加 data-global-modal-static="true"，让 AppFrame 全局托管跳过它们。',
    prevention:
      '提示词管理、模型管理这类全局管理弹窗默认固定居中，不保存位置和尺寸；除非确有强需求，不要给它们重新接入拖拽/缩放能力；新增固定弹窗时要同时检查组件自己的拖拽 hook 和 AppFrame 全局拖拽兜底。',
    keywords: [
      '提示词管理',
      '模型管理',
      '弹窗尺寸',
      '固定居中',
      '80vw',
      '80vh',
      'useDraggableModal',
      'headerDragHandleProps',
      'createPortal',
      'data-global-modal-static',
    ],
    updatedAt: '2026-07-09',
  },
  {
    id: 'chapter-editor-audit-item-details-collapse-001',
    title: '剧情审核清单项应能展开查看说明和建议',
    area: '作品编辑器 / 剧情审核 / 审核结果清单',
    symptom: '剧情审核中间列只显示 6 个审核项和通过/不通过状态，用户需要去右侧 AI 原始输出里找每项对应的说明和建议。',
    cause:
      '结构化审核清单只解析了每项状态，没有解析 AI 固定格式里的【说明】和【建议】字段，也没有为清单项提供展开状态。',
    solution:
      '新增审核项详情解析，将每个【审核项】下的【说明】和【建议】提取到对应卡片；审核项行改为可点击折叠或展开，展开后显示本项说明和建议。',
    prevention: '剧情审核固定格式新增字段时，应同步更新结构化解析和中间清单渲染，避免用户只能查看右侧原始输出。',
    keywords: ['剧情审核', '审核结果', '说明', '建议', '折叠', '展开', 'getAuditStructureItemDetail'],
    updatedAt: '2026-07-09',
  },
];
