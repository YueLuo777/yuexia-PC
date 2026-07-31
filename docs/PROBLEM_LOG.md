# xinyuexia 问题记录

## 模板管理进入页面时应选中列表最上方模板

- 现象：进入模板管理后，左侧最上方显示“玄幻仙侠（轻量版）”，实际选中和右侧载入的却是“玄幻仙侠（标准版）”。
- 原因：初始选中直接取男频模板原始数组的第一项，而页面列表使用单独的展示排序，两处顺序规则不一致。
- 处理：初始化与列表渲染统一复用展示筛选和排序逻辑，并为模板选中状态增加可访问标识和回归断言。
- 预防：默认选中列表首项时必须从最终展示列表取值，不得绕过筛选或排序从原始数据单独取值。

# 空伏笔条目不应把结构化字段模板算入字数

- 现象：伏笔所有可编辑内容为空，但左侧条目显示 44 字。
- 原因：侧栏统计直接计算结构化设定序列化后的正文，字段标题、标点和换行模板被误计入字数。
- 处理：结构化设定统计改为解析字段后只拼接各字段实际值；空字段全部为空时显示 0 字，普通非结构化设定仍按原正文统计。
- 预防：结构化内容统计必须基于字段值，不得直接统计带字段标题的序列化存储文本。

# 伏笔顶部编号框应按编号内容收窄且不显示字数统计

- 现象：伏笔名称、伏笔编号、首次出现章节和回收章节的字体观感不一致；伏笔编号框与其他顶部字段一样过宽，三个顶部字段还显示了“0字”。
- 原因：伏笔顶部字段沿用通用结构化输入样式，编号字段没有独立宽度约束，顶部字段标题统一复用了字数统计渲染；名称框则使用独立的 17px 输入字和 900 字重标题。
- 处理：将伏笔编号框固定为 176px 宽，仅容纳编号及“最多10位编号”提示；顶部三个伏笔元数据字段移除字数统计，保留标题和输入值；保留现状并列出全页字体差异，待确认统一方案后再调整字体。
- 预防：短编号、章节号等有限长度字段应按内容设置固定窄宽度；不需要统计的元数据字段不得复用字数统计标签；统一字体前应先完成同类字段差异审计。

# 伏笔编号框宽度不得被通用浮动字段规则覆盖

- 现象：伏笔编号框虽然配置了 176px，但实际仍然横跨顶部的大部分空间。
- 原因：通用 `.xy-floating-field` 的 `width: 100%` 在最终样式中覆盖了 Tailwind 宽度类，导致编号字段继续按父容器拉伸。
- 处理：为伏笔编号增加专用字段类，显式锁定 `flex-basis`、`width`、`min-width` 和 `max-width` 均为 176px，并保留顶部元数据字数统计移除规则。
- 预防：有限宽度的结构化字段必须同时锁定 flex 基准和四向宽度约束，不能只依赖单个宽度工具类。

## 小说库顶部四张概览卡片必须始终限制在可视区域内

- 现象：软件缩放到 110% 后，小说库顶部第四张“扩展卡片”超出窗口，概览区域出现原本没有的横向滚动条。
- 原因：四张卡片使用持久化的固定像素宽度，网格同时设置了 `min-w-[1780px]` 和 `overflow-x-auto`；窗口有效宽度小于固定最小宽度时只能横向溢出。
- 处理：把已保存的卡片宽度解释为相对权重，网格使用 `minmax(0, weight fr)` 在当前可用宽度内分配四张卡片；容器补充 `w-full`、`min-w-0` 和横向溢出隐藏。拖动分隔条时按当前网格像素宽度换算权重，保持可调比例但不再扩大整行。
- 预防：窗口内的多卡片概览行不得设置大于视口的固定最小宽度；需要支持拖动调宽时，应调整相邻卡片比例并保持总宽度不变，同时覆盖 100%、110% 和窄窗口回归。
- 验证：执行 `npm.cmd run test:run -- src/features/novels/pages/NovelLibraryPage.test.tsx`、`npm.cmd run check` 和 `npm.cmd run build`；在应用内浏览器切换到 110%，确认四张卡片均位于网格边界内且容器 `scrollWidth` 等于 `clientWidth`。

## 桌面运行时与构建工具链必须保持无已知审计漏洞并具备自动桌面冒烟

- 现象：旧版 Electron、electron-builder 和 Vite 的完整依赖审计包含高危漏洞；Electron 虽声明在 `devDependencies`，但它会通过 `electronDist` 进入便携版，不能按普通开发依赖忽略。项目也缺少能真正打开桌面窗口的自动化门禁。
- 原因：依赖长期只做功能兼容升级，生产审计使用 `--omit=dev` 会漏掉实际随安装包发布的 Electron 二进制；既有测试无法验证主进程、预加载桥和真实渲染页面能否共同启动。
- 处理：Electron 升级到 43.1.0、electron-builder 升级到 26.15.3、Vite 升级到兼容补丁线 7.3.6，并吸收全部可用审计补丁，完整 `npm audit` 归零。新增 Playwright Electron 冒烟脚本与 Windows CI，自动验证“小说库 → 工作台 → 第1章 剧情审核”。启动器同步支持新版 Electron 显式运行时安装。
- 预防：桌面发布前必须运行完整审计而不只检查生产依赖；运行时大版本升级必须经过 TypeScript、构建、Electron E2E 和 VBS 实际启动四层回归。
- 验证：执行 `npm.cmd audit`、`npm.cmd run verify:desktop` 和 `月下PC版.vbs`。

## 模型 API Key 不应以明文留在 localStorage 或渲染层请求头

- 现象：模型配置把 API Key 与模型元数据一起写入 `localStorage`，任何能读取渲染层存储或请求对象的代码都能获得长期密钥。
- 原因：模型请求最初由渲染层直接构造鉴权头，Electron 主进程只负责转发完整请求，没有独立的密钥所有权与系统加密存储。
- 处理：新增 Electron `safeStorage` 密钥仓库和受信 IPC；渲染层只把模型实例密钥标识交给主进程，主进程解密后再注入 `Authorization` 或 `x-api-key`。旧明文只有在加密写入成功后才会从 `localStorage` 清除，编辑模型时按需读取。
- 预防：新增模型服务不得把长期密钥写进可导出的页面存储、调用日志或渲染层请求快照；密钥迁移必须遵守“先加密落盘、再清除旧值”。
- 验证：执行 `npm.cmd run test:run -- electron/modelSecretStore.test.ts src/features/models/hooks/useModels.test.ts src/features/models/services/callModel.test.ts electron/security.test.mjs`。

## 全局备份导入失败时必须恢复导入前的数据

- 现象：旧导入流程先删除全部本软件数据，再逐项写入备份；如果中途触发容量限制或浏览器存储异常，会同时失去旧数据并只留下半份新数据。
- 原因：导入操作没有保存旧快照、大小预检和失败回滚，也没有限制压缩包解压后的数据体积。
- 处理：恢复前保存当前应用数据快照并校验总大小；写入失败时清理半成品并自动恢复旧快照。备份文件限制为 64MB，解压后的可恢复文本限制为 32MB。
- 预防：任何覆盖式导入都必须先验证、再快照、后替换，失败路径必须有自动回滚测试。
- 验证：执行 `npm.cmd run test:run -- src/features/settings/pages/DbSettingsPage.test.ts`。

## 大型工作台资料库应按需加载而不是阻塞普通章节编辑

- 现象：`WorkbenchLibraryPanel` 产物约 302KB，普通用户只进入章节编辑也会由工作台静态依赖加载资料库、模型管理和提示词管理代码。
- 原因：工作台页面静态导入所有子工作流，即使相关资料库或管理弹窗尚未打开，浏览器仍需要解析这些模块。
- 处理：资料库面板、模型管理和提示词管理改为 `React.lazy` 动态导入，并在真实入口外包裹统一加载状态；普通章节编辑不再预先请求这些功能块。
- 预防：超过 100KB 且只在特定弹窗或工作流出现的模块默认使用路由或交互级动态导入，并用源码守卫锁定不得恢复静态导入。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx` 和 `npm.cmd run build`。

## 桌面启动器不应复用依赖变更前的 Vite 预构建进程

- 现象：更新 `package.json` 或锁文件后再次运行桌面启动器，旧 Vite 进程仍然返回 HTTP 200，启动器会直接复用它；Electron 随后可能出现 React `Invalid hook call`，页面无法正常渲染。
- 原因：启动器只检查开发服务器是否可访问，没有判断当前进程的依赖预构建是否与磁盘上的依赖输入一致。
- 处理：对 `package.json`、`package-lock.json` 和 `vite.config.ts` 生成依赖指纹；当现存服务器的指纹缺失或过期时，仅清理命令行同时匹配本项目 Vite 入口与端口的进程，再启动新的开发服务器并写入最新指纹。
- 预防：桌面开发启动器在复用长驻开发服务器前必须校验依赖输入；清理进程必须同时校验项目路径和端口，不能按进程名批量结束。
- 验证：执行 `npm.cmd run test:run -- src/app/startupRoute.test.ts`、`npm.cmd run check:launcher`，再运行 `月下PC版.vbs`，确认启动日志出现指纹变更重启、开发服务器返回 HTTP 200、Electron 日志不再出现 `Invalid hook call`。

## 正文自动保存和 AI 流式输出不应高频重写整份索引

- 现象：连续输入正文或接收较长 AI 流式输出时，会在很短时间内反复序列化并写入作品、卷目录或全部后台任务；作品越大、输出越长，主线程抖动和磁盘写入越明显。
- 原因：正文每次变更除立即保存章节内容外，还同步重写作品与卷目录元数据；AI 每收到一个分片就把全部后台任务写回 localStorage，没有合并窗口。
- 处理：章节正文仍即时保存；作品和卷目录元数据改为 350ms 合并写入，结构性写入会取消同键旧队列，离开页面前强制落盘。AI 分片改为 250ms 合并持久化，开始、结束、失败、停止、清空和离开页面时立即落盘。
- 预防：高频输入路径只立即写最小必要数据；大对象索引与流式快照必须使用可刷新、可取消的合并队列，并用假定时器验证多次更新只产生有限写入。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/model/workbenchPersistenceQueue.test.ts src/shared/ai/backgroundAiTasks.test.ts src/features/workbench/hooks/useWorkbenchData.storage.test.ts`。

## 生产依赖不应为热点聚合引入高危间接依赖

- 现象：生产依赖审计包含由 `dailyhot-api` 本地服务链带入的高危漏洞，但桌面端实际只需要调用公开热点聚合接口。
- 原因：热点服务同时保留了第三方包的本地 Express 启动模式和公开接口回退，扩大了依赖面与维护面。
- 处理：移除 `dailyhot-api`，热点服务统一使用既有公开 HTTPS 基址与 Electron 主进程代理；更新锁文件后，`npm audit --omit=dev` 为 0 个漏洞。
- 预防：能用小型、明确的网络适配器完成的功能不要引入整套服务端运行时；升级或新增生产依赖时必须检查生产审计结果和实际调用路径。
- 验证：执行 `npm.cmd run test:run -- electron/hotspots/hotspotService.test.ts` 和 `npm.cmd audit --omit=dev`。

## 源码契约测试不应因统一格式化产生大面积误报

- 现象：统一执行 Prettier 后，功能未变化但大量源码契约测试因换行、尾逗号、十六进制颜色大小写或已拆分模块位置变化而失败，真实 DOM 回归被噪声淹没。
- 原因：部分测试直接用原始 `toContain` 和精确 `indexOf` 绑定源码排版；资料库测试还会把默认已展开的分类再次点击为折叠状态。
- 处理：新增只用于源码契约的 `toContainSource` 规范化匹配器，忽略无语义空白、尾逗号和颜色大小写；已拆分逻辑改为读取对应模块；分类夹具使用幂等展开，同时保留拖拽、右键、结构化字段等真实 DOM 交互用例。
- 预防：行为优先使用函数或 DOM 测试；确需源码守卫时只断言稳定语义片段，不绑定 Prettier 排版、整段 JSX 或模块原位置。
- 验证：执行 `npm.cmd run format:check` 和完整 `npm.cmd run test:run`。

## Electron 主页面、IPC、网页权限和热点抓取需要统一安全边界

- 现象：开发启动地址可指向任意远程网页并仍加载预加载桥；IPC 没有核验调用页面；嵌入网页未统一拒绝摄像头、定位等权限；热点详情可以请求本机、内网地址或通过跳转进入内网。
- 原因：启动环境变量只被当作普通 URL 使用；IPC 默认信任所有 sender；webview 只限制协议和 Node 权限；热点抓取使用自动跟随跳转且没有 DNS/IP 公网校验。
- 处理：自定义启动地址只允许无凭据的回环 HTTP/HTTPS，主窗口离开可信来源时阻止导航；全部特权 IPC 经统一包装校验主窗口 sender 与可信 URL；所有 Electron session 默认拒绝网页权限和新窗口；热点详情在请求前、每次跳转及最终 URL 上校验域名解析结果，拒绝本机、私网、保留地址和过多跳转。
- 预防：新增 preload 能力必须接入可信 sender 包装；新增 webview/session 时默认拒绝权限；任何由渲染层提交、主进程代发的 URL 都必须按 SSRF 规则验证，并手动检查重定向链。
- 验证：执行 `npm.cmd run test:run -- electron/security.test.mjs electron/hotspots/hotspotDetailService.test.ts electron/ipcValidation.test.ts`、`npm.cmd run check:electron` 和 `npm.cmd run check`。

## 永久删除作品后不应复用作品 ID 或残留作品数据

- 现象：永久删除当前最大编号作品后，新建作品可能复用相同 ID，并重新读到旧作品的设定、章纲、AI 会话、备忘录或剧本关联。
- 原因：作品 ID 仅按当前作品和回收站中的最大值加一生成；永久删除只移除章节正文和卷目录，没有清除按作品 ID 命名的工作台存储。
- 处理：新增单调递增的作品 ID 游标，删除最高编号作品后也不会回退；永久删除成功写入作品回收站和卷目录后，精确清理该作品的正文、设定、章纲、AI 会话、备忘录、审核任务、润色状态和剧本关联。
- 预防：持久化实体 ID 不得从当前剩余数据反推复用；新增按作品分区的存储键时，应同步加入永久删除清理清单和邻近 ID 防误删测试。
- 验证：执行 `npm.cmd run test:run -- src/features/novels/model/novelPersistence.test.ts src/features/novels/hooks/useNovelLibrary.test.tsx` 和 `npm.cmd run check`。

## 删除章节必须先可靠写入回收站再移除正文

- 现象：章节删除逻辑在 React 状态更新函数里给局部变量赋值，随后立即在外部判断；状态更新异步执行时，章节可能从目录消失但没有进入回收站。
- 原因：代码依赖 React 状态 updater 同步执行，并在目录更新后才保存回收站和删除正文，没有形成可恢复的提交顺序。
- 处理：删除前从当前快照同步生成回收章节和新目录，先写回收站、再写卷目录，卷目录写入失败时回滚回收站；两份索引写入成功后才删除正文并更新界面状态。
- 预防：涉及多份本地存储的数据移动应先写可恢复副本、再更新索引、最后删除原数据，不得通过状态 updater 向外传递事务结果。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/hooks/useWorkbenchData.storage.test.ts` 和 `npm.cmd run check`。

## 审核后台任务和章纲预览必须跟随当前章节

- 现象：第一章开始审核后切到第二章，后台任务结果可能显示到第二章；同一作品内修改章纲后，审核预览仍可能显示旧内容。
- 原因：后台任务 ID 只按作品和审核模式保存，恢复时没有校验章节和模式；章纲列表只依赖存储键做一次 memo，存储内容变化不会触发刷新。
- 处理：审核任务索引升级为按作品、章节和审核模式分区，恢复和加载状态时同时校验任务元数据；切章清空当前显示并恢复目标章节自己的任务。章纲预览改为使用工作台父页面订阅到的实时资料快照。
- 预防：异步任务恢复必须校验完整业务作用域；从 localStorage 派生的界面数据必须订阅写入事件或由已有响应式快照下发。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx -t "stores and restores|uses the reactive"` 和 `npm.cmd run check`。

## 剧本关联小说必须按剧本独立保存

- 现象：在剧本 A 关联小说后切换到剧本 B，剧本 B 会继承同一个关联小说。
- 原因：所有剧本共用 `xinyuexia_script_editor_linked_novel` 单一存储键，并在切换剧本时重复读取该全局值。
- 处理：关联键升级为带剧本 ID 的 `xinyuexia_script_editor_linked_novel_v2_{scriptId}`；旧全局值只迁移给首次打开的当前剧本一次，取消关联、会话清理和作品永久删除均同步处理新键。
- 预防：任何作品级或剧本级状态都必须把所属实体 ID 放入键或数据结构，测试至少覆盖两个实体互不串值。
- 验证：执行 `npm.cmd run test:run -- src/features/script-editor/pages/ScriptEditorPage.test.tsx src/features/workbench/model/workbenchAssociationCleanup.test.ts` 和 `npm.cmd run check`。

## 文本审核段落编号应放在正文左侧并只显示数字

- 现象：文本审核的“第 1 段”标签单独占据正文上方一行，段落正文左侧留有空位，纵向空间浪费且编号与正文对应不够直接。
- 原因：审核后段落卡片按上下结构渲染完整的“第 N 段”标签和正文，没有为段落编号设置独立的左侧窄栏。
- 处理：审核后段落改为左侧编号栏、右侧正文的横向网格；编号视觉上只显示 `1、2、3…`，并保留“第 N 段”的无障碍说明。
- 预防：段落序号属于定位辅助信息，应使用窄侧栏或页边标记，不应占用独立正文行。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx -t "renders audit results"` 和 `npm.cmd run build`。

## 审核结果标题应明确区分剧情审核和文本审核

- 现象：选择剧情审核或文本审核后，中间结果列都显示“第 N 章 审核后”，无法从标题直接确认当前审核类型。
- 原因：审核结果标题只判断是否处于审核模式，没有继续读取所选审核提示词的二级分类。
- 处理：标题改为跟随审核提示词类型；剧情审核显示“第 N 章 剧情审核”，文本审核显示“第 N 章 文本审核”，切换提示词后即时更新。
- 预防：审核页面中与类型相关的标题、视图和发送规则都应统一从当前提示词的审核二级分类派生，避免只按顶层“审核”模式判断。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx -t "renders audit results"` 和 `npm.cmd run check`。

## 文本审核应采用左右对照并标红审核后改动

- 现象：用户确认文本审核使用方案 B，希望左侧显示原文、右侧显示审核后，并且修改后的地方能用红字显示；同时担心 AI 把整段删除后右侧不知道如何展示。
- 原因：此前文本审核只逐段显示审核后正文，没有按原文和审核后计算差异；如果审核后段落为空或缺失，只能看到空段落或段落数不一致提示，不能明确表达“整段已删除”。
- 处理：正式文本审核接入左右对照差异渲染：原文列对删除/替换内容显示淡红删除线，审核后列对新增/改写内容显示红字；审核后空段显示“整段已删除”，缺少对应段落时提示“审核后缺少本段”。发送给 AI 的文本审核兜底规则同步要求保持段落数，整段删除时保留空段位置，且不要输出 HTML/Markdown 颜色标记。
- 预防：文本审核高亮应由软件根据原文和 `【修改后全文】` 自动计算，提示词只负责输出纯正文；不要让模型输出颜色标签，否则会污染可替换正文。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx -t "renders audit results"` 和 `npm.cmd run test:run -- src/features/tests/pages/TextAuditDiffDisplayTestPage.test.tsx`。

## 测试内容页应允许纵向滚动

- 现象：打开 10 号“文本审核差异显示方案”测试后，方案 C 只露出标题，页面底部没有向下滚动条，无法继续查看后续方案。
- 原因：测试集合进入单个测试内容时，内容区域外层使用 `overflow-hidden`，长测试页超过可视高度后被直接裁剪；测试首页列表本身可滚动，但单个测试页没有继承这套滚动能力。
- 处理：将测试内容承载区改为 `overflow-y-auto`，保留 `min-h-0 flex-1`，让 10 号测试的方案 C、方案 D 和以后更长的测试页都能在内容区内滚动查看。
- 预防：测试页外层可以使用 `min-h-full` 展示内容，但测试集合的 active content 容器必须提供纵向滚动，不能用 `overflow-hidden` 裁剪未知高度的测试页面。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/TextAuditDiffDisplayTestPage.test.tsx`。

## 文本审核结果应显示为审核后并提供红字差异方案

- 现象：选择文本审核后发送给 AI，如果 AI 返回“已停止”等状态，审核结果列仍把状态提示当成审核后正文显示，并出现“原文 N 段 / 审核后 1 段”的误导；用户希望标题先改为“审核后”，并探索“修改处红字显示”的文本审核效果。
- 原因：文本审核的审核后正文提取失败后，代码兜底使用了完整可见 AI 输出，导致错误、停止、未按格式输出的内容也进入段落对比；审核列标题仍沿用“审核结果”，不符合文本审核的正文修改语义。
- 处理：审核预览列标题改为“审核后”；文本审核只接受本地草稿或 `【修改后全文】` 提取结果，不再把普通 AI 状态输出当成审核后正文；新增“文本审核差异显示方案”测试页，对比审核后正文红字、左右对照、段落卡片和改动清单 4 种方案。
- 预防：文本审核展示正文时必须先确认来源是修改后全文；错误、停止、思考状态和格式不合规输出只能作为提示，不能参与段落数核对。差异高亮正式迁入前先通过测试页确认视觉方案。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/TextAuditDiffDisplayTestPage.test.tsx src/features/workbench/pages/WorkbenchPage.test.tsx` 和 `npm.cmd run check`。

## 审核提示词下拉应回到普通列表并用小字区分二级分类

- 现象：审核提示词下拉显示“剧情审核 / 文本审核”分组行后，列表视觉仍然偏重，用户希望恢复成普通提示词列表，只在提示词右侧用小字标明“剧情”或“文本”。
- 原因：审核二级分类被渲染成独立下拉项或目录结构，会抢走提示词本身的视觉焦点；用户实际操作时更关心选择哪个提示词，而不是切换哪个分类。
- 处理：审核提示词下拉不再生成分组项，改为平铺显示审核分类下所有提示词；每个选项增加 `metaLabel`，剧情审核提示词显示“剧情”，文本审核提示词显示“文本”。选择逻辑继续按提示词 `subCategory` 切换结构审核结果或文本审核结果视图。
- 预防：少量二级分类不要做成强分组或目录，优先用选项辅助信息表达；下拉列表的主文本始终应是可选提示词名称。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx src/shared/ui/UiReuseConventions.test.ts` 和 `npm.cmd run check`。

## 审核提示词树形分组切换感过强

- 现象：审核提示词下拉采用树形分组后，“剧情审核 / 文本审核”分类感太强，用户感觉像在切换目录，选择“结构审核”时视觉动作偏硬。
- 原因：树形线、分组图标、分类数量和缩进提示词共同强化了层级关系；分类标题在小下拉里占据了过多注意力。
- 处理：删除旧“审核提示词分组下拉原型”测试页，新增“审核提示词轻量下拉方案”测试页，提供提示词后加小标签、轻分隔标题、顶部小筛选和双列分类 4 个更轻的方案。
- 预防：审核提示词数量少时，优先用标签或轻筛选表达分类，不要一开始就使用强树形目录；正式落地前先在测试板块比较切换感。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/AuditPromptSelectSoftGroupingTestPage.test.tsx src/features/tests/pages/TestCollectionDeleteMarkedCleanup.test.tsx` 和 `npm.cmd run check`。

## 审核提示词下拉分类标题不应像普通提示词

- 现象：剧情审核页的提示词下拉里，“剧情审核（分类）”字号和普通提示词接近，看起来像一个可选择的提示词，用户不容易理解“结构审核”其实属于“剧情审核”分类。
- 原因：下拉选项把审核二级分类作为 disabled option 渲染，虽然不能点击，但视觉层级仍接近普通选项，分类和提示词的主从关系不够明显。
- 处理：曾将方案 D 树形分组迁入正式审核提示词下拉；分类行只显示“剧情审核 / 文本审核”和提示词数量徽标，不再显示“分类”二字，提示词选项缩进并显示文件图标。后续因切换感偏硬，旧测试页已删除，改为在“审核提示词轻量下拉方案”中继续比较更轻的方案。
- 预防：审核提示词分类标题应使用更小字号、弱颜色、目录语义和不可点击样式；不要再把分类当成普通选项同级渲染。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx` 和 `npm.cmd run check`。

## 模型管理弹窗顶部空间利用率不足

- 现象：从正文、审核等页面打开模型管理弹窗时，标题栏下方到模型卡片之间留有明显空白，只有一个模型时也会空出一条提示行位置。
- 原因：模型管理内容区使用 `px-7 py-6` 的宽松内边距；“拖拽卡片可调整模型顺序”提示外层始终渲染 `mb-5`，即使模型数量不足 2 个、提示文字不显示，也会保留空行。
- 处理：模型管理内容区改为 `px-5 py-4`；拖拽排序提示改为仅在 `models.length > 1` 时渲染，并将下方间距收紧为 `mb-3`。
- 预防：管理弹窗内的条件提示不能只隐藏文字而保留外层占位；单条数据状态要单独检查顶部空白。
- 验证：执行 `npm.cmd run test:run -- src/features/models/pages/ModelManagePage.test.tsx` 和 `npm.cmd run check`。

## 提示词管理弹窗顶部空间利用率不足

- 现象：从正文、审核等页面打开提示词管理弹窗时，标题栏下方、小说/剧本切换下方、分类行下方和审核二级分类上方存在大段空白，卡片区开始位置过低。
- 原因：`PromptsPage` 是按独立管理页的宽松布局写的，外层使用 `px-7 py-7`，顶部工具行和分类行又分别叠加 `mb-6/mb-7`，嵌入 80% 弹窗后浪费了明显的垂直空间。
- 处理：将提示词管理主体压缩为弹窗友好的紧凑工具区：外层改为 `px-5 py-4`，顶部工具行、分类行、审核二级分类行分别收紧为 `mb-3/mb-3/mb-4`；工具栏和分类行支持换行与弹性占位，卡片区更早进入可视区域。
- 预防：管理页嵌入弹窗时，顶部筛选/工具区应按弹窗密度单独检查，不要沿用整页管理后台的宽松上下边距。
- 验证：执行 `npm.cmd run test:run -- src/features/prompts/pages/PromptsPage.test.tsx` 和 `npm.cmd run check`。

## 管理弹窗应固定居中并保持软件窗口 80%

- 现象：提示词管理、模型管理等管理弹窗在拖拽缩放或读取旧尺寸记录后，可能突然变得很大，宽高接近铺满软件窗口；从工作台顶部入口打开时，点击右下角缩放手柄会先缩小高度，随后只能改宽度，点右侧边线也会让宽度突然变窄；拖动标题区域时还可能跑到屏幕左上侧。
- 原因：管理弹窗的 CSS 尺寸曾允许到 `94vw/88vh`；拖拽缩放后 `useDraggableModal` 会把宽高写成内联样式，本地保存过的大尺寸会绕过普通宽高类。工作台顶部和资料库模型/提示词管理弹窗接入了拖拽定位，初始 CSS 居中、鼠标视口坐标和 fixed 内联几何不在同一个坐标系里，拖动或缩放时会重新落盘成错误位置/宽高。即使组件里移除了 `useDraggableModal`，`AppFrame` 的全局弹窗拖拽兜底仍会扫描 `.fixed.inset-0` 浮层并自动注入拖拽/缩放能力。
- 处理：提示词管理和模型管理弹窗统一固定居中显示，不再接入 `useDraggableModal`，不再传 `headerDragHandleProps`，不再渲染右下角缩放手柄；portaled 到 `body` 的管理弹窗使用固定 `80vw/80vh`，审核/状态页内入口按 `--xinyuexia-effective-scale` 抵消软件缩放后保持视觉 80%；所有模型/提示词管理弹窗外壳增加 `data-global-modal-static="true"`，让 `AppFrame` 全局托管跳过它们。
- 预防：提示词管理、模型管理这类全局管理弹窗默认固定居中，不保存位置和尺寸；除非确有强需求，不要给它们重新接入拖拽/缩放能力；新增固定弹窗时要同时检查组件自己的拖拽 hook 和 `AppFrame` 全局拖拽兜底。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx src/features/models/pages/ModelManagePage.test.tsx` 和 `npm.cmd run check`。

## 剧情审核清单项应能展开查看说明和建议

- 现象：剧情审核中间列只显示 6 个审核项和通过/不通过状态，用户需要去右侧 AI 原始输出里找每项对应的说明和建议。
- 原因：结构化审核清单只解析了每项状态，没有解析 AI 固定格式里的 `【说明】` 和 `【建议】` 字段，也没有为清单项提供展开状态。
- 处理：新增审核项详情解析，将每个 `【审核项】` 下的 `【说明】` 和 `【建议】` 提取到对应卡片；审核项行改为可点击折叠/展开，展开后显示本项说明和建议。
- 预防：剧情审核固定格式新增字段时，应同步更新结构化解析和中间清单渲染，避免用户只能查看右侧原始输出。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx` 和 `npm.cmd run check`。

## 审核页提示词管理弹窗不应接近全屏

- 现象：从剧情审核页面打开提示词管理时，弹窗复用工作台全局管理弹窗尺寸，宽度接近铺满屏幕，遮挡审核上下文过多。
- 原因：`ChapterEditor` 内部审核/状态管理弹窗直接使用 `WORKBENCH_MANAGEMENT_MODAL_SIZE_CLASS`，该尺寸是为工作台顶部和设定/脑洞管理入口准备的大弹窗。
- 处理：新增 `REVIEW_MANAGEMENT_MODAL_SIZE_CLASS`，将审核/状态面板内的模型管理和提示词管理弹窗限制在屏幕视觉尺寸 80% 内；嵌入页按 `--xinyuexia-effective-scale` 抵消软件缩放，body portal 入口使用普通 `80vw/80vh`。
- 预防：以后调整工作台全局管理弹窗尺寸时，不应自动套到 `ChapterEditor` 的审核页内管理入口；审核页入口需要保持独立的中等尺寸。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx` 和 `npm.cmd run check`。

## 剧情审核提示词格式应匹配审核结果清单

- 现象：结构审核提示词包含 8 个审核项，和软件中间“审核结果”实际显示的 6 个审核元素不一致，导致 AI 输出内容和左侧状态清单出现偏差。
- 原因：工作台只追加了宽泛的“覆盖这些审核元素”说明，没有强制模型按软件可解析的 6 项固定格式输出；状态解析还会把“是否偏离章纲”里的“偏离”等审核项文字误判为负面结果。
- 处理：剧情审核发送时追加软件固定格式，6 个项目名称与中间清单完全一致；禁止新增、删除、改名审核项；每项使用【审核项】和【结果】包起来，只允许“通过 / 不通过”，状态解析优先读取对应审核项后的【结果】字段。
- 预防：剧情审核提示词可以写审核方法，但最终输出格式必须由软件固定模板兜底，避免提示词项目和 UI 清单漂移。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx`。

## 剧情审核中间审核结果列不应显示原始 AI 输出

- 现象：剧情审核中间“审核后”列下方还显示“正在思考”“通过”“已停止”或整段 AI 原始输出，这些内容应放在右侧 AI 输出框；中间列标题也应叫“第 N 章 审核结果”。
- 原因：结构化审核清单下方仍额外渲染 `auditVisibleOutput`，而列标题沿用“审核后”，导致中间结构结果区和右侧原始输出区职责混在一起。
- 处理：审核列标题改为“审核结果”；结构审核中间列只保留总体状态卡和审核元素清单，不再渲染原始 AI 输出；右侧 AI 框继续显示思考过程和完整文字输出。
- 预防：结构审核的中间列只做结构化结果展示，任何原始模型输出、停止提示和思考过程都只能在右侧 AI 输出框展示。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx`。

## 剧情审核右侧 AI 框仍应显示思考和原始输出

- 现象：剧情审核发送后，右侧 AI 输出框只显示“结果已显示到中间”，用户看不到模型的思考内容和完整文字输出；中间审核元素清单在 AI 输出结束后可能又变成“待核对”。
- 原因：上一轮把右侧输出框改成状态提示，移除了 `renderAiThinkingContent(reviewAiOutput)`；剧情审核清单项只跟随整体通过状态，没有按 AI 输出中对应审核项逐项解析。
- 处理：右侧 AI 框恢复显示思考过程和原始文字输出；中间“审核后”仍保留结构化清单；每个审核元素按对应关键词附近的通过/不通过文字解析状态，避免整体状态回退导致清单项变回待核对。
- 预防：右侧 AI 面板是模型原始输出区，中间审核后是结构化阅读区，两者应同时保留；结构化清单不能只依赖整体结论，应支持逐项状态解析。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx`。

## 剧情审核提示词下拉应按二级分类切换审核后视图

- 现象：剧情审核页的审核提示词混在一个下拉框里，用户无法直观看到哪些是剧情审核提示词、哪些是文本审核提示词；选择剧情审核类提示词时，“审核后”仍像正文对照框。
- 原因：审核二级分类只在提示词管理里存在，工作台审核页没有把二级分类渲染成下拉分组，也没有根据选中提示词的二级分类切换中间“审核后”视图。
- 处理：将旧“结构审核”兼容迁移为“剧情审核”；审核提示词下拉按“剧情审核（分类）/ 文本审核（分类）”分组显示；选择剧情审核提示词时，中间“审核后”显示审核元素清单和通过状态；选择文本审核提示词时，继续显示修改后正文和段落一致性核对。
- 预防：审核页的展示形态应由选中提示词的审核二级分类驱动；新增审核二级分类时需要同步提示词管理归一化、工作台下拉分组和审核后视图测试。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx src/features/prompts/hooks/usePrompts.test.ts`。

## 剧情审核结果应显示在中间审核后列

- 现象：剧情审核发送后，AI 完整内容显示在右侧输入框上方的输出框里；用户希望结果进入中间“审核后”列，右侧只负责模型、提示词和发送。
- 原因：`reviewAiOutput` 同时承担 AI 原始输出存储和右侧结果框渲染；中间预览列只按标注或空态显示，没有根据审核二级分类区分结构审核和文本审核。
- 处理：右侧结果框改为状态提示，不再渲染完整 AI 内容；结构审核在中间“审核后”列显示通过/不通过及说明；文本审核在中间“审核后”列显示【修改后全文】，并展示原文段落数、审核后段落数和一致性提示。
- 预防：审核页的输出阅读区只保留在中间对比区；右侧 AI 面板只做配置、发送和状态反馈。文本审核必须提供段落数量核对，避免修改后正文和原文段落错位。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx`。

## 剧情审核未输出前审核后预览列不应显示原文

- 现象：没有发送给 AI 时，剧情审核页面中间预览区的“审核后”列仍然有内容，看起来像已经做过结构审核。
- 原因：非润色模式的审核后预览只判断是否有原文；即使 `reviewAiOutput` 为空，也会把原文段落按“无标注”状态渲染到审核后列。
- 处理：非润色模式先判断 `reviewAiOutput.trim()`；没有 AI 输出时显示空态提示，不再渲染原文段落；只有真正收到审核输出后才展示带标注正文。
- 预防：对比预览右列必须以 AI 输出是否存在作为渲染前提，不能只根据原文是否存在决定显示内容。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx`。

## 剧情审核未发送前审核后区域应为空

- 现象：还没有在剧情审核页面发送给 AI，“审核后”区域却已经显示了内容，看起来像自动生成过。
- 原因：页面启动时会从本地保存的后台任务 id 恢复输出；如果该 id 指向上一次已经完成的审核任务，旧结果也会被写回 `reviewAiOutput`。
- 处理：新增可恢复后台任务筛选，只允许 `running` 且属于当前小说/当前 `chapterReview` 的任务自动恢复；完成、失败、中断或不匹配的历史任务 id 会从本地恢复表里清理，不再填充新打开的审核页。
- 预防：后台任务恢复只应用于“仍在运行”的任务；历史完成结果应留在日志/任务记录里，不能作为新页面的初始输出。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx`。

## 剧情审核页面提示词应读取审核分类

- 现象：剧情审核页面的提示词下拉框读取了提示词管理里的“正文”分类，导致审核分类下的提示词不会优先显示。
- 原因：修正文通用 AI 面板提示词来源时，把 `ChapterEditor` 的剧情审核、综合点评、文笔润色三个独立页面也统一到了 `BODY_PROMPT_CATEGORY`，混淆了正文生成入口和正文审核工具入口。
- 处理：`WorkbenchAIPanel` 继续只读取“正文”分类；`ChapterEditor` 的剧情审核恢复读取“审核”，综合点评读取“综合点评”，文笔润色读取“润色”，提示词管理入口同步打开当前页面对应分类。
- 预防：正文通用生成入口和剧情审核工具要分别测试；正文面板锁定“正文”，审核/点评/润色页面按 review mode 锁定自己的分类。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/pages/WorkbenchPage.test.tsx src/features/workbench/components/WorkbenchAIPanel.test.tsx src/features/prompts/hooks/usePrompts.test.ts`。

## 正文 AI 替换正文时应自动智能排版

- 现象：正文页面右侧 AI 输出点击“替换正文”时，AI 输出会直接写入章节，段落空行、首尾空白和智能排版设置没有自动应用。
- 原因：`WorkbenchAIPanel` 的替换按钮只调用 `onReplaceContent(stripAiThinkingBlock(output))`，没有复用正文编辑器已有的 `applyFormat` 和 `getStoredFormatSettings`。
- 处理：替换正文前先执行 `applyFormat(stripAiThinkingBlock(output), getStoredFormatSettings())`，再写入章节；提示文案改为“已智能排版并替换正文”。
- 预防：AI 输出写回正文的路径应和手动智能排版使用同一套格式化函数，避免同一正文来源产生两种排版规则。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.test.tsx`。

## 正文 AI 输入为空但有关联内容时应允许发送

- 现象：正文页面右侧 AI 输入框不输入内容时，发送按钮不可用；即使已经关联章纲、资料或章节内容，也无法直接让 AI 根据关联内容生成正文。
- 原因：`WorkbenchAIPanel` 的发送函数和按钮禁用条件都只判断 `input.trim()`，没有把已关联资料或已关联章节正文作为可发送上下文。
- 处理：发送条件改为“输入内容或关联上下文至少存在一个”；空输入但有关联内容时，发给模型的额外写作要求为空，只携带关联上下文和正文提示词，聊天记录显示“使用关联内容生成正文”。
- 预防：正文 AI 面板的发送可用性应基于最终请求是否有有效内容，而不是只看输入框；测试锁定空输入加关联内容可发送。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.test.tsx`。

## 正文页面提示词应读取提示词管理的正文分类

- 现象：正文页面右侧通用 AI 配置里的提示词使用排除列表过滤，导致“题材迭代”等非正文提示词仍可能出现在正文生成入口。
- 原因：`WorkbenchAIPanel` 只排除少数分类，没有正向限定“正文”分类，导致正文页通用 AI 提示词来源和提示词管理里的“正文”分类不一致。
- 处理：新增 `BODY_PROMPT_CATEGORY = '正文'`；`WorkbenchAIPanel` 的提示词候选统一过滤“正文”分类；状态更新提示词继续读取“更新状态”分类，剧情审核、综合点评、文笔润色继续读取各自分类。
- 预防：正文通用生成入口用“正文”；审核/点评/润色页面按自己的分类读取；测试同时锁定正文面板和审核工具，避免两类入口再次混用。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.test.tsx src/features/workbench/pages/WorkbenchPage.test.tsx src/features/prompts/hooks/usePrompts.test.ts`。

## 结构化设定输入框不应把字段标题串到内容里

- 现象：人物设定等结构化输入框里出现 `【称号/外号/别称】：发`、`【核心性格】：`，或只剩 `【称号/外号/别称】` 这类字段标题文本；打开页面一开始就出现，删除后也容易被重新解析到错误字段。
- 原因：共用的 `parseSectionedSettingBody` 只识别“【字段名】：”后换行再写内容的格式；AI 输出或导入内容常见的“【字段名】：内容”同一行格式，以及旧数据里残留的“【字段名】”孤立标题，都没有被正确当作字段边界。
- 处理：解析器改为逐行识别字段标题，支持同一行内容、换行内容、中文冒号、英文冒号和无冒号孤立标题；人物基础设定、作品结构化设定、智能导入和导入预览等复用该解析器的页面同步生效。
- 预防：结构化字段解析测试同时覆盖同一行格式、编辑器生成的多行格式、孤立标题旧数据和人物基础设定，避免后续 AI 模板变化再次造成字段串位。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/workbenchStructuredSettings.test.ts`。

## 人物基础设定输入不应被父级重渲染吞掉

- 现象：人物基础设定里的外貌、别称、核心性格等框在旧字段标题残留修复后，可能出现打字后字符不显示，像输入框无法输入。
- 原因：这些 textarea 完全由父级解析后的 `baseSetting` 控制；输入时会立即序列化整组字段并触发父级重渲染，如果父级保存或解析同步期间仍拿到旧内容，当前按键会被旧值覆盖。
- 处理：`RoleBaseStateEditor` 为人物基础设定字段增加本地草稿状态；按键先写入本地草稿保证即时显示，再同步序列化保存到角色内容；当切换角色或外部内容变化时，再从最新 `baseSetting` 同步草稿。
- 预防：需要逐字输入的结构化字段不要只依赖父级解析结果作为唯一显示源；编辑器组件应先持有本地草稿，并用渲染测试覆盖“旧残留数据打开后输入一个字仍显示并保存”。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/workbenchRoleEditor.test.tsx src/features/workbench/components/workbenchStructuredSettings.test.ts`。

## 作品设定等结构化页面智能导入后仍应能自由输入

- 现象：作品设定、伏笔、道具资源等结构化页面在智能导入设定后，字段内容虽然能被拆进各个框，但继续输入时可能出现字符不显示或被旧解析结果覆盖。
- 原因：结构化设定字段的 `value` 直接来自每次解析 `currentSelectedSetting.body`；输入时又立即序列化整组字段并触发父级保存，父级重渲染期间如果仍以旧 body 解析，就会把当前按键覆盖掉。
- 处理：新增结构化设定字段草稿快照，按“条目 id + 字段集 id + body”匹配；输入时先写草稿保证即时显示，再保存新的结构化 body；如果智能导入或外部操作替换了 body，旧草稿会自动失效并使用最新解析内容。
- 预防：所有智能导入后可编辑的结构化字段都要走同一套草稿解析规则；测试覆盖导入后继续输入、以及导入新 body 时旧草稿不能污染新内容。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/workbenchStructuredSettings.test.ts src/features/workbench/components/workbenchRoleEditor.test.tsx`。

## 章纲字号控件不应重复出现在每个章纲框里

- 现象：每个章纲框左下角都显示一组字号加减按钮，滚动长章纲列表时重复占用框体边线空间；用户希望把它移到“日志/字段尺寸”这一行，并放在字段尺寸按钮左侧。
- 原因：章纲字号控件在章节卡片循环内部渲染，虽然修改的是同一个 `detailOutlineFontSize` 状态，但视觉上像每个框都有独立控件。
- 处理：新增顶部工具栏级 `renderDetailOutlineFontSizeTool`，只在章纲页显示；章纲目录工具行顺序调整为“日志 / 章纲字号 / 字段尺寸 / 设置”；删除每个章纲卡片内部的字号控件，所有章纲 textarea 继续共用 `detailOutlineFontSize`。
- 预防：控制所有章纲框的全局工具应放在章纲工具栏，不放进章节卡片循环；测试锁定字号控件不再出现在卡片源码里，并且位于字段尺寸按钮左侧。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲关联设定按钮右侧只应紧邻显示关联字数

- 现象：章纲页“关联设定”按钮右侧显示“已关联 3 项 · 233 字”，并且因为使用 `justify-between`，字数被推到区域最右侧；未关联时也容易被误认为仍有字数提示。
- 原因：右侧关联入口的 meta 同时承担数量和字数展示，并使用两端对齐布局，导致按钮和字数之间距离过远。
- 处理：关联 meta 改为仅在关联字数大于 0 时显示 `WordCountText`；移除“已关联 N 项”文案；布局改为 `flex items-center gap-3`，让字数紧跟按钮右侧。
- 预防：关联入口的按钮负责表达是否已关联，按钮旁 meta 只显示关联字数；不要用 `justify-between` 推开按钮和字数。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲卡片清空按钮需要嵌入右下边框

- 现象：中间区域单章章纲框的“清空”显示在框内右下角，和边框贴合不够，用户希望嵌入到章纲框右下边框线上。
- 原因：章纲卡片本身没有独立的贴边清空按钮，只依赖右侧或底部清空入口，无法对单章卡片形成一致的边框嵌入操作位。
- 处理：给每个章纲卡片新增只清空本章章纲的 `xy-floating-outline-card-clear-tool` 按钮，并复用 `xy-border-embedded-transparent-backplate`；CSS 将按钮定位到右下边框，使用 `bottom: 0` 和 `translateY(50%)` 压在边框线上。
- 预防：章纲卡片级操作要放在卡片自身边框工具位，和右侧 AI 输出框清空区分；测试锁定按钮 class、清空本章逻辑和右下边框定位。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链双标签测试需要更贴近长链推进工作流

- 现象：剧情链双标签测试虽然拆成了生成和预览，但左侧未写/已写状态不够突出；没有总链预览；生成候选只是静态展示，不能清楚表达“从 1/2/3 继续生成 4 并接到链尾”；写过的剧情点迁移和链尾建议也不够集中。
- 原因：测试页仍以静态候选和单卡片预览为主，缺少“链尾生成下一号剧情点”“总链一眼看完”“状态分类强提示”这三个长链核心入口。
- 处理：左侧未写/已写分组改为更醒目的双状态目录；生成页固定显示链尾剧情点和下一号剧情点，点击候选会追加为新的链尾并切到预览；预览页顶部新增剧情链总览；标为已写会移动到已写分类；下一步建议只出现在最大序号链尾剧情点。
- 预防：剧情链测试页后续改动必须同时覆盖五个工作流：状态目录、总链预览、链尾续写、已写迁移、链尾建议。测试需覆盖候选追加成新链尾和尾巴标为已写后建议仍只跟随最大序号。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainTabbedLayoutTestPage.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链预览不应给每个已串联剧情点重复提示衔接到下一个编号

- 现象：剧情链预览页每个剧情点下方都显示“衔接到 N”，即使这些剧情点已经连成剧情链，也会继续提示衔接到 4、5，干扰用户判断当前未写尾部下一步方向。
- 原因：预览卡片按数组里的 `next` 固定渲染桥接说明，没有区分“链内既有衔接”和“最后未写剧情点之后的生成建议”。
- 处理：卡片内不再显示“衔接到 N”；只在当前未写剧情点中序号最大的那个剧情点下方显示“下一步推荐方向”。右侧 AI 建议也从最大编号改为最后未写剧情点，已写状态变化后会自动前移。
- 预防：剧情链预览页只展示已成链内容，下一步方向属于尾部未写剧情点的生成建议；测试需要锁定不会再出现 `衔接到`，并覆盖尾部剧情点标为已写后的建议前移。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainTabbedLayoutTestPage.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲右侧 AI 输出框清空按钮和选中章节信息位置混乱

- 现象：章纲页右侧 AI 输出框的“清空”按钮停在上边框标题线附近；输出框下方还显示当前卷/章节、正文或章节字数信息，和用户要求删除的图 2 内容一致。
- 原因：右侧区域在输出框后额外渲染了一块 `isDetailOutlineTab` 选中章节信息；清空按钮复用了贴边标题线定位，未按右侧输出框内部操作按钮处理。
- 处理：删除右侧输出框下方的选中卷/章节信息块；把 `xy-floating-outline-inner-clear-tool` 改为框内右下角定位，保留透明贴边按钮样式。
- 预防：章纲页右侧只承担 AI 输出和关联/操作入口，不再重复展示当前章节字数；清空按钮位置由 CSS 测试锁定在底部右侧，同时测试右侧源码不再包含选中章节信息块。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲右侧 AI 输出框不应显示字数统计

- 现象：章纲页右侧 AI 输出框边框标题旁仍显示 `0字`，用户要求删除；同时中间区域章纲卡片自身的字数统计不应被删。
- 原因：右侧 AI 输出框的 `shouldShowOutlineDraftWordCount` 把 `isDetailOutlineTab` 也算作显示条件，导致章纲页右侧标题线继续浮出字数；此前修复时又误把中间卡片统计当作目标。
- 处理：右侧 AI 输出框只在剧情链 standalone 模式显示字数；中间章纲卡片恢复基于 `outlineCardContent` 的字数统计，并保持它不进入边框标题 label。
- 预防：章纲页有两个不同区域的字数统计：右侧 AI 输出框字数不要显示；中间章纲卡片内容字数要保留。测试需要分别锁定这两个位置。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链预览卡片状态按钮不应单独占用空白行

- 现象：剧情链预览卡片顶部左侧整行空白，只在右侧显示“移回未写 / 标为已写”按钮，导致卡片内容被往下挤，视觉上像缺了一块。
- 原因：测试页预览卡片把状态按钮放在独立的 `justify-end` 顶部行；正式页已选剧情点卡片也保留了一个 `aria-hidden` 的空 flex 占位。
- 处理：测试页将状态按钮并入剧情点标题/正文同一行右侧；正式页将正文直接放到序号和按钮之间，删除空占位。
- 预防：剧情链卡片的状态按钮应作为内容行的右侧操作，不再创建只有右侧按钮的空白行；测试锁定不再出现 `mb-3 flex items-center justify-end` 和空 `aria-hidden` 占位。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainTabbedLayoutTestPage.test.tsx`、`npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲关联设定需要支持关联剧情链

- 现象：章纲的“关联设定”弹窗只能选择设定、角色和前文章纲，无法把当前剧情链作为章纲生成上下文一起发给 AI。
- 原因：关联弹窗只有三类 `DetailOutlineReaderTab` 和三套选择状态，AI 请求上下文也只拼接 `关联设定 / 关联角色 / 关联章纲`。
- 处理：新增 `剧情链` 标签和 `detailOutlineReaderPlotChainIds` 持久字段；将当前主链已选剧情点整理为可勾选条目，支持关联所有、清空和单项勾选；AI 上下文新增 `【关联剧情链】` 分组，章纲默认提示词同步说明会参考剧情链。
- 预防：章纲生成新增上下文来源时，要同时补类型、草稿选择、持久配置、弹窗标签、字数统计、输出日志和最终请求文本，避免只显示入口但不发送给 AI。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲卡片边框标题不应和正文字数挤在一起

- 现象：章纲卡片边框标题仍显示成“第N章章纲 0字（第N卷）”一类拥挤效果，正文字数和卷信息夹在同一条边框线上，截图中出现文字压叠。
- 原因：此前只删除了左侧标题 label 里的正文计数，但右侧章节 meta 仍在章纲卡片边框线上渲染 `chapter.wordCount`，左侧标题还包含卷信息，双方继续抢空间。
- 处理：章纲卡片左侧标题只保留 `第N章章纲`；右侧 meta 改为 `第N卷 · 章节名`，不再显示正文 `WordCountText`。概要卡片仍保留原本的章节字数显示。
- 预防：章纲卡片边框线上只放定位信息和章节名，不放正文统计；正文统计如果需要显示，应放在中间章纲内容区的独立统计位置。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链预览测试页需要提供未写转已写入口

- 现象：剧情链测试页里“当前承接”命名不符合当前设计语义；切到“剧情链预览”后，只能查看剧情点衔接，不能把未写剧情点标为已写，也看不到它移动到已写分组。
- 原因：测试页仍使用固定 `plotPoints` 状态数组，左侧目录按初始状态分组，预览页没有状态迁移按钮。
- 处理：将“当前承接”改名为“当前剧情点”；测试页根组件新增已写剧情点状态集合，预览页每个剧情点卡片新增“标为已写 / 移回未写”按钮，点击后同步刷新左侧“未写剧情 / 已写剧情”分组。
- 预防：剧情链测试页涉及状态流转时，不能只做静态预览；预览页也要暴露推进状态按钮，并用交互测试确认分组迁移。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainTabbedLayoutTestPage.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲右侧 AI 输出需要支持替换所选章纲和撤销

- 现象：章纲页最右侧区域仍按“章纲预览/保存章纲”理解，用户生成 AI 章纲后，无法明确用右侧 AI 输出替换当前选中的章纲，也没有误替换后的撤销入口。
- 原因：右侧草稿 `outlinePreviewDraft` 同时承担预览和编辑保存含义，按钮只调用旧的保存逻辑，替换前没有记录所选章纲原内容。
- 处理：将细纲页右侧标题改为 `AI输出章纲`，选择章节时不再把已保存章纲自动回填到右侧 AI 输出；把“保存章纲”改为“替换章纲”；替换前缓存章节序号、原章纲内容和 AI 输出草稿，并在“复制章纲”左侧新增“撤销替换”按钮用于恢复上一次替换。
- 预防：AI 输出区和正式章纲内容区要保持职责分离；任何覆盖式写入都需要保存上一次快照并提供同屏撤销入口。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲卡片标题不应显示正文内容字数

- 现象：章纲卡片上边框标题里显示“第N章章纲 + 0字 + 卷信息”，字数统计和标题挤在一起，仍会造成视觉重叠。
- 原因：章纲卡片标题 label 在 `isDetailOutlineTab` 下额外渲染了 `countTextWords(outlineCardContent)`，把正文内容字数放到了卡片边框标题线上。
- 处理：删除章纲卡片标题里的 `WordCountText`，只保留章纲标题本身；中间章纲预览区域原有的字数统计不改。
- 预防：卡片边框标题只承担定位和标题职责；字数统计应放在预览区或独立统计位，避免和章节/卷信息抢同一条边框线。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞预览框边线颜色和新脑洞输出框不一致

- 现象：脑洞页面左侧“脑洞4”预览框边线是浅灰蓝色，中间“新脑洞1”输出框边线是深色，两个相邻内容框视觉不统一。
- 原因：左侧脑洞预览同时使用了 `xy-floating-outline-preview`，继承通用预览框的 `border-color: #d9e2ea`；中间新脑洞输出框只使用普通 `xy-floating-outline-fixed`，保留了深色 `#111827` 边线。
- 处理：给 `xy-brainstorm-preview-field textarea` 增加专用 `border-color: #111827`，只把脑洞预览框改成和新脑洞输出框一致的深色线。
- 预防：脑洞页左右相邻主内容框的边线颜色要单独锁定；通用预览框的浅色边线不能自动套到脑洞主预览。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞输出贴边标题和同排边框标题不在同一水平线

- 现象：脑洞页面中间输出框的“新脑洞1 + 字数统计”贴边标题和黑色上边框，比左侧“脑洞4 + 字数统计”与右侧生成配置标题整体下沉，看起来没有水平对齐。
- 原因：脑洞输出区是 `overflow-y-auto` 滚动列表，贴边标题会向边框上方伸出半个标题高度；如果顶部留白只有 `0.25rem`，标题会被滚动容器裁剪，如果留白保持 `0.625rem`，首个输出框边框又会比左侧下沉 6px。
- 处理：保留 `xy-brainstorm-output-preview-list` 的 `padding-top: 0.625rem` 作为标题裁剪缓冲，同时增加 `margin-top: -0.375rem` 抵消这 6px 下沉，让中间输出框上边框与左侧脑洞预览对齐且标题完整显示。
- 预防：滚动容器里的贴边标题不能只按边框位置调 padding；必须同时保留裁剪缓冲并用外层位移校正边框起点。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲卡片浮动标题和右侧章节信息会重叠

- 现象：章纲页面卡片上边框的“第N章章纲 + 字数”和右侧章节/卷信息在窄宽度下互相压住，出现文字重叠。
- 原因：左侧 `xy-floating-title-count` 虽然有最大宽度，但章纲卡片右侧 meta 仍可占到 58%，左侧标题文本也没有独立截断容器，双方在同一条边框线上争空间。
- 处理：给章纲卡片标题增加 `xy-detail-outline-title-count` 和 `xy-floating-title-text`，左侧标题按 `min(13rem, calc(42% - 1.5rem))` 限宽并省略；右侧章节 meta 从 `max-w-[58%]` 收到 `max-w-[44%]`。
- 预防：同一条边框上同时有左右浮动信息时，两侧都必须有最大宽度，标题文本要独立支持 ellipsis，不能只依赖整组 label nowrap。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链卡片删除命名和生成章纲位置需要统一

- 现象：已选剧情点卡片里的破坏性按钮仍叫“移除”，不如“删除”明确；“生成章纲”放在每张卡片右侧，和过滤按钮分散，卡片操作区也偏挤。
- 原因：此前把生成章纲当成单张剧情点操作放进卡片按钮组，但当前需求是针对当前剧情链整体生成章纲；过滤按钮使用固定三列，扩展新按钮时不够灵活。
- 处理：把“移除”改名为“删除”；将“生成章纲”移动到左二顶部过滤按钮行，放在 `全部 / 只看未写 / 只看已写` 右侧；按钮行改为 `flex-wrap` 和 `basis` 自适应宽度。
- 预防：链级操作优先放在链级工具条，单卡片只保留该剧情点自身状态和删除动作；过滤/操作混排时用自适应宽度，不再固定三列。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链已写视图需要只显示已写并支持移回未写

- 现象：正式剧情链左二的“已写隐藏”与“只看未写”效果重复，用户进入已写相关视图时仍看到未写内容；误点“标为已写”后也缺少撤回入口。
- 原因：正式页沿用了测试方案里的 `hideWritten` 模式，但正式数据没有废弃状态，导致第三个过滤按钮没有独立价值；已写卡片按钮被禁用，只能显示状态不能恢复。
- 处理：将第三个过滤模式改为“只看已写”，过滤时只显示已写剧情点；已写卡片按钮改为“移回未写”，点击后从当前链已写集合移除，并重新出现在未写序号导航里。
- 预防：过滤按钮名称必须对应可见内容；所有容易误点的状态迁移都要提供同屏撤回动作。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链方案 E 需要转入正式页并删除临时测试

- 现象：方案 E 已在测试集合里确认，但正式剧情链页面仍停留在多链目录和普通已选卡片结构，测试集合也继续保留“剧情链左二调试方案”临时入口。
- 原因：方案选型完成后没有立即迁入 `WorkbenchLibraryPanel`，导致正式页面和测试预览出现两套剧情链交互。
- 处理：正式剧情链页改为方案 E：左一显示当前主链、未写序号导航、右键重命名和备选链折叠；左二加入 `全部 / 只看未写 / 已写隐藏`、当前卡片高亮和“标为已写”；删除测试集合入口、临时测试页和测试页单测。
- 预防：测试页选型完成后必须迁入正式页面，并同步删除测试入口，避免用户继续在临时方案和正式功能之间来回找。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链方案 E 主链操作不应占用左侧目录空间

- 现象：方案 E 左侧当前主链下方仍显示“重命名 / 返回对比”两个按钮，占用目录树空间；用户确定主链后也不再需要返回多链对比入口。
- 原因：主链锁定方案沿用了多链对比阶段的显性操作按钮，把低频操作和主线推进导航放在同一层级。
- 处理：删除方案 E 的返回对比入口和对比分支；重命名改为当前主链分组的右键菜单项，默认界面只保留可折叠主链和未写序号导航。
- 预防：确定主链后的左侧栏优先展示推进目录；低频链级操作放入上下文菜单，不再占用常驻按钮位。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainLeftDetailTestPage.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链方案 E 当前主链需要折叠未写序号导航

- 现象：方案 E 左侧“当前主链”仍是大信息卡片，只显示主链名称和未写数量，不能像目录分组一样折叠，也不能直接按未写剧情点序号跳转。
- 原因：主链信息展示和长链推进导航混在同一张卡片里，左侧空间被信息卡占用，几百个剧情点时缺少稳定的未写入口。
- 处理：将当前主链改成可折叠分组，展开后只显示未写剧情点的数字按钮；点击数字会切回全部视图并选中对应剧情点，标为已写后该数字从未写导航中移除。
- 预防：长剧情链确认主链后，左侧优先承担目录导航职责；信息说明保持在分组标题和计数里，未写推进入口必须跟状态流转联动并用交互测试覆盖。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainLeftDetailTestPage.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链方案 E 需要把已完成剧情点移入已写板块

- 现象：剧情链左二调试方案 E 只展示过滤，用户看不到“未写剧情点写完以后进入已写板块”的迁移过程；卡片内容也太空，无法判断已写板块和未写板块的信息密度。
- 原因：方案 E 最初只模拟长剧情链过滤状态，剧情点列表没有分成未写/已写/废弃板块，标记已写后也只是从当前过滤列表消失。
- 处理：方案 E 改为本地看板状态，默认展示 `未写板块 / 已写板块 / 废弃板块`；列表卡片补两行正文预览，底部详情补正文、AI评价和衔接；点击“标为已写”后，当前卡片从未写板块移动到已写板块。
- 预防：测试方案里的按钮不能只做样式占位；涉及状态流转时，要展示对象从一个板块迁移到另一个板块的完整过程，并用交互测试锁定迁移结果。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainLeftDetailTestPage.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 项目缺少一键快速验证门禁

- 现象：项目优化和 UI 调整后，需要手动记住 `check`、Electron 语法检查、启动器检查、测试和构建命令，容易漏跑某一项。
- 原因：`package.json` 只有分散脚本，没有 lint、format、launcher check 和快速验证组合脚本；长期会让回归问题更晚暴露。
- 处理：新增 ESLint flat config、Prettier 配置和 `lint`、`format`、`format:check`、`check:launcher`、`verify:quick`、`verify` 脚本；`verify:quick` 覆盖 lint、类型检查、Electron/启动器语法检查和测试。
- 预防：以后提交前优先跑 `npm.cmd run verify:quick`；涉及发布或打包前再跑 `npm.cmd run verify`。
- 验证：执行 `npm.cmd run lint`、`npm.cmd run check`、`npm.cmd run check:electron`、`npm.cmd run check:launcher`、`npm.cmd run test:run`、`npm.cmd run build`。

## 启动日志需要轮转避免越积越大

- 现象：`launcher.log`、`dev-server.log`、`electron-dev.log` 会持续追加，时间久了会变成很大的本地文件，影响排查和 Git 清理。
- 原因：启动器只负责追加日志，没有在写入前检查文件大小，也没有稳定的 `.old` 备份策略。
- 处理：新增 `scripts/logRotation.mjs`，在启动器创建日志流前按 5MB 上限轮转三类日志，并补 `scripts/logRotation.test.mjs` 锁定空文件、小文件、大文件和目录缺失场景。
- 预防：以后新增长期追加日志时先接入统一轮转函数，不要在启动脚本里各写一套文件大小判断。
- 验证：执行 `npm.cmd run test:run -- scripts/logRotation.test.mjs`、`npm.cmd run check:launcher`。

## 工作台存储读取需要统一 normalize

- 现象：本地存储里的作品、卷章节映射或回收站数据一旦出现坏数据，工作台初始化容易回退不一致，后续页面会读到形状不稳定的数据。
- 原因：`useWorkbenchData` 局部 JSON 读取逻辑和共享 `jsonStorage` 分散存在，初始化、刷新和回收站读取没有统一经过显式 normalizer。
- 处理：`useWorkbenchData` 改为复用 `readJsonValue`、`writeJsonValue`，并导出 `normalizeWorkbenchNovels`、`normalizeWorkbenchVolumeMap`、`normalizeWorkbenchRecycledMap`；新增存储测试覆盖坏数据、缺失字段和回收站兜底。
- 预防：以后新增工作台本地存储 key 时同步提供 normalizer 和单测，页面不直接信任 `localStorage` 反序列化结果。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/hooks/useWorkbenchData.storage.test.ts src/shared/storage/jsonStorage.test.ts`、`npm.cmd run check`。

## 剧情链交互测试不能只靠源码字符串

- 现象：剧情链测试页和正式页频繁改 UI 时，只检查源码字符串无法确认按钮真的能点击、折叠和切换。
- 原因：之前测试更多锁定结构文本，缺少渲染后点击 `1/2/3`、`AI评价`、`AI建议`、隐藏已写、返回对比和确定主链的真实交互覆盖。
- 处理：新增 `PlotChainLeftDetailTestPage.test.tsx`，渲染测试页并点击关键控件，确认方案 A 的序号跳转和 AI 折叠按钮、方案 E 的过滤与主链锁定都能实际生效。
- 预防：后续测试页如果有按钮、折叠、过滤或切换状态，至少补一个真实交互测试，不再只做静态预览。
- 验证：执行 `npm.cmd run test:run -- src/features/tests/pages/PlotChainLeftDetailTestPage.test.tsx`。

## 剧情链模型逻辑不应堆在 WorkbenchLibraryPanel

- 现象：`WorkbenchLibraryPanel.tsx` 已经承载大纲、脑洞、剧情链等大量逻辑，剧情链候选、分数、链名和 slot normalize 继续堆在里面会增加改 UI 时误伤数据逻辑的概率。
- 原因：剧情链模型辅助函数和组件渲染混在同一个大组件中，测试只能从组件源码间接判断逻辑是否存在。
- 处理：新增 `src/features/workbench/model/workbenchPlotChain.ts`，抽出剧情链类型、常量、normalize、候选转换、预览文本、评价文本和指标分级函数；新增模型单测并让组件测试读取新模型文件。
- 预防：以后剧情链纯数据规则优先放在 model 层测试，`WorkbenchLibraryPanel` 只负责状态组合和渲染。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/model/workbenchPlotChain.test.ts src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## Electron 和 webview 安全边界需要测试锁定

- 现象：Electron 主窗口、外部链接和内置 webview 的安全设置如果被后续改动放松，可能不会在普通 UI 测试里暴露。
- 原因：安全边界主要写在 Electron 主进程和 webview 属性里，缺少针对 `contextIsolation`、`nodeIntegration`、`sandbox`、外部协议白名单和 `allowpopups` 的回归测试。
- 处理：新增 `electron/security.test.mjs`，检查 BrowserWindow 安全配置、`setWindowOpenHandler` deny 默认策略、`http/https/mailto` 协议白名单，以及 webview 不再使用 `allowpopups`。
- 预防：以后调整 Electron 窗口、外链打开或 webview 能力时先扩展安全测试，再放开具体协议或能力。
- 验证：执行 `npm.cmd run test:run -- electron/security.test.mjs`、`npm.cmd run check:electron`。

## 多条剧情链切换和左二栏调试需要方案对比

- 现象：用户可能同时维护多条剧情链并进行对比，需要先快速切换剧情链，再查看当前剧情点正文、AI评价和接下来剧情点衔接；现有左二栏单独承载这些信息会显得拥挤。
- 原因：剧情链切换和剧情点详情调试是两个不同层级，如果都塞在同一栏里，会导致链切换入口和当前点详情互相抢空间。
- 处理：在测试集合 AI 链路测试分组末尾新增“剧情链左二调试方案”，四个方案都采用左侧窄栏切换剧情链、右侧调试当前链剧情点的结构，并分别提供顶部序号三段详情、焦点调试卡、时间线展开、折叠调试台。
- 预防：涉及多条剧情链对比的布局改动，先明确“左侧切链、右侧调点”的层级，再在测试集合末尾新增多方案页，选定后再迁入正式页面并删除测试入口。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链需要主链锁定和隐藏已写测试方案

- 现象：小说剧情链可能有几百个剧情点，已写剧情点继续显示会占用大量空间；确定一条剧情链后，剧情链2、剧情链3仍在左侧出现也会干扰继续推进。
- 原因：现有测试方案主要围绕多链对比和单点详情，没有模拟“主链已确定后”的单链推进状态，也没有为剧情点状态过滤提供预览。
- 处理：在“剧情链左二调试方案”末尾新增方案 E：主链锁定 + 隐藏已写剧情点。它默认展示当前主链、重命名、返回对比、备选链折叠，以及 `全部 / 只看未写 / 已写隐藏` 三个过滤按钮。
- 预防：剧情链正式实现时，剧情点需要保存 `未写 / 已写 / 废弃` 状态；主链确定后只显示当前主链，备选链收进折叠区，不直接删除。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链左二调试方案需要序号跳转和 AI 按钮

- 现象：测试页方案 A 里上方剧情点序号只是静态展示，点击后不会切换到对应剧情点；AI评价和接下来衔接仍是大块内容区，占用空间且不像可折叠操作。
- 原因：测试预览最初只用于静态布局对比，没有给序号按钮绑定当前剧情点状态，也没有把评价和建议拆成独立按钮。
- 处理：方案 A 新增当前剧情点状态，点击上方 `1 / 2 / 3` 会切换正文、标题和指标；把 AI评价和 AI建议改成两个按钮，点击后分别展开对应内容。
- 预防：后续剧情链调试方案如果出现序号导航，必须绑定选中剧情点；AI评价、AI建议这类辅助内容默认以按钮入口呈现，避免直接占满正文空间。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录方案 A 需要转正并删除测试页

- 现象：剧情链目录分组方案测试页已确认使用方案 A，继续保留测试入口会干扰测试集合查找。
- 原因：多方案测试页完成了选型，但正式剧情链目录还没有迁入方案 A 的层级结构，测试集合也还保留临时入口。
- 处理：正式剧情链目录改为方案 A：分组整行色块，剧情点缩进到左侧竖线下方；删除测试集合里的剧情链目录分组方案入口、预览组件和切换分支。
- 预防：测试页选型完成后，应立即迁入正式页面并删除对应临时测试入口，避免测试集合长期堆积临时方案。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录方案测试页需要可滚动

- 现象：剧情链目录分组方案测试页只能看到方案 A/B，看不到下方方案 C/D，也没有滚动条可往下拉。
- 原因：测试页内容超过可视高度，但外层容器只设置最小高度，没有在测试集合嵌入视口内提供纵向滚动。
- 处理：将测试页外层改为 `h-full overflow-y-auto`，并保留底部间距，让 A-D 四个方案都能在当前测试页内滚动查看。
- 预防：测试集合里的多方案页面应在页面根容器提供自己的滚动，不依赖外层页面滚动。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链指标分数需要颜色等级

- 现象：内容、潜力、衔接三个指标都使用白底，只靠数字区分强弱，80 分和 90 分以上的视觉差异不明显。
- 原因：指标条没有按分数段建立颜色层级，用户需要逐个读数字才能判断优先级。
- 处理：新增指标分数颜色函数，90 分以上为金色，80 分以上为紫色，70 分以上为蓝色，70 分以下为绿色；三个指标都按各自分数套用边框、底色和文字色。
- 预防：评分型指标应同时提供数字和颜色层级，避免所有分数在视觉上同权。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录分组样式需要多方案对比

- 现象：当前剧情链目录分组虽然有颜色，但分组块和数字块堆在一起，视觉拥挤且不够美观。
- 原因：正式页直接迭代单一方案，缺少同尺寸、同数据下的目录树视觉对比。
- 处理：在测试集合新增“剧情链目录分组方案”测试页，按真实窄栏宽度提供目录树层级、分组卡片、细线目录、紧凑深浅对比四个方案。
- 预防：剧情链目录这类高频结构调整前，先用测试集合做多方案同域对比，再把选定方案迁入正式页面。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链未选中分组也需要可见底色

- 现象：剧情链目录里只有当前分组是蓝底，未选中的剧情链分组是白底文字，视觉上像普通文本，容易看不到分组边界。
- 原因：未选中分组按钮使用 `bg-white` 和透明边框，只在 hover 时才出现颜色。
- 处理：未选中分组改为浅蓝底、浅蓝边框和蓝色文字，数量也改为蓝灰色；选中分组继续使用深蓝底白字。
- 预防：目录树分组行不应完全依赖 hover 才可见；未选中状态也要保留轻量底色和边界。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链已选栏顶部操作行应移入卡片

- 现象：已选剧情链栏顶部单独显示“剧情链1 / 3点 / 生成章纲”一整行，占用纵向空间；用户希望删除这一行，并把生成章纲放到每个已选剧情点卡片的移除按钮右侧。
- 原因：生成章纲入口仍放在左二栏 header，和当前以剧情点卡片为主的布局不一致。
- 处理：删除左二栏顶部 header；在已选剧情点卡片顶部右侧新增“移除 / 生成章纲”按钮组，生成章纲复用原来的 `openDetailOutlineFromPlotPoint`。
- 预防：剧情链左二栏避免再增加独立顶部操作行；针对已选剧情点的操作优先收进卡片顶部按钮组。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链已选剧情点指标不应挤压正文宽度

- 现象：内容、潜力、衔接三个指标放在卡片右侧固定列，指标名和分数之间留白偏大，同时挤压左侧剧情正文宽度。
- 原因：指标使用右侧固定宽度列布局，正文和指标横向分栏后，正文区域被迫变窄。
- 处理：删除右侧指标列，把三个指标改为正文下方、AI评价按钮上方的三列横向信息条。
- 预防：剧情链已选卡片内的辅助指标不要抢正文横向空间；正文优先满宽，指标放在正文下方横排。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链已选剧情点卡片不应重复显示标题

- 现象：已选剧情点卡片顶部同时显示蓝色数字圆点和“剧情点 1 / 剧情点 2”文字标题，信息重复，用户希望只保留数字序号。
- 原因：卡片标题区在圆形序号之外又渲染了一行 `剧情点 {index + 1}` 文本。
- 处理：删除已选剧情点卡片顶部的文字标题，只保留左侧数字序号和右侧移除按钮。
- 预防：剧情链已选卡片的序号只保留一种表达；如果已有明显数字徽标，不再重复渲染文字编号标题。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链已选剧情点指标应横向单行显示

- 现象：已选剧情点右侧的内容、潜力、衔接三个指标使用上下两行小卡片显示，占用高度偏大，和参考图的单行指标条不一致。
- 原因：指标栏沿用窄列卡片结构，每个指标内部把标签和分数上下排列，导致三项叠加后视觉过高。
- 处理：把指标栏改为 `104px` 宽的横向条目，每项使用白底圆角行，左侧显示指标名，右侧显示分数。
- 预防：剧情链详情卡右侧指标应优先使用紧凑单行信息条，不要回退成上下分层的小卡片。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录按钮应白底蓝色选中且 AI 评价默认折叠

- 现象：剧情链目录分组按钮和数字序号仍可能出现橙色选中态；已选剧情点卡片默认展开 AI评价，占用正文展示空间。
- 原因：目录数字块和剧情链分组按钮继承了旧剧情链选中态的橙色风格；剧情点详情卡把评价内容作为固定内容块直接渲染。
- 处理：目录分组按钮与数字块都改为白底默认态，当前项使用蓝色选中态；AI评价默认只显示折叠按钮，点击后才展开评价内容，正文区域可显示更多生成内容。
- 预防：目录按钮的选中态应跟章纲数字块一致用蓝色；辅助评价类内容默认折叠，避免挤占主内容空间。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录数字序号块仍然偏大

- 现象：剧情点数字序号块虽然固定尺寸，但视觉上仍然比参考图大，用户希望高度再缩小约 40%，宽度缩小约 20%。
- 原因：上一版固定为 `48px` 宽、`54px` 高，仍接近卡片按钮尺寸，不够像紧凑目录序号。
- 处理：把数字序号块压缩为 `38px` 宽、`32px` 高，同时收小圆角和字号。
- 预防：目录数字块需要按参考图的紧凑尺度落地，避免把卡片按钮尺寸直接搬到目录里。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录数字序号块不应随栏宽拉伸

- 现象：剧情链下的数字序号块在窄栏里被拉得过宽过高，和章纲目录里紧凑的固定尺寸数字块不一致。
- 原因：数字块容器使用 CSS grid 的 `1fr` 列宽，按钮会跟随可用宽度均分拉伸。
- 处理：改为 `flex-wrap` 固定尺寸数字块，每个序号按钮使用固定宽高并自动换行，不再随栏宽撑大。
- 预防：固定格式的目录序号应使用稳定宽高和换行布局，不要使用 `1fr` 让按钮被容器拉伸。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录子项需要用数字序号网格

- 现象：剧情链分组展开后显示“剧情点1、剧情点2”这类纵向文字行，但用户希望像章纲目录一样用 `1 / 2 / 3` 的数字方块网格表示剧情点序号。
- 原因：此前沿用章节行列表结构，只改了文本，没有复用章纲目录的数字序号块视觉。
- 处理：把每条剧情链下的剧情点子项改成自适应网格数字按钮，只显示序号数字，hover 和选中链时使用边框/底色强调。
- 预防：用户引用章纲目录数字序号时，应优先使用数字块网格，而不是文字列表行。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录不应保留总剧情链分组

- 现象：左侧目录树顶部还保留一个总“剧情链”分组，下面才是剧情链1、剧情链2、剧情链3；用户希望删除总分组，让每条剧情链本身成为可折叠分组，并在分组下显示具体剧情点序号。
- 原因：此前按正文卷/章节结构做了“剧情链”总分组，但剧情链业务层级本身已经是分组，不需要再包一层总目录。
- 处理：移除总“剧情链”分组，直接将剧情链1、剧情链2、剧情链3渲染为可折叠分组行；每个分组右侧显示剧情点数量，展开后列出剧情点1、剧情点2等序号项。
- 预防：目录树层级要和业务层级一致；当业务对象本身就是分组时，不要额外再套一个同名父分组。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链详情需要可改名并重排剧情点卡片

- 现象：左二顶部“剧情链1”只是静态标题，目录树不能同步自定义名称；已选剧情点卡片把来源、潜力、链头等标签混在正文上方，内容、AI评价和内容/潜力/衔接指标没有按用户指定结构分区显示。
- 原因：剧情链只保存 slot 编号和候选 ID，没有保存链名；已选剧情点卡片沿用旧标签式摘要布局，没有把评价和指标拆成明确左右结构。
- 处理：新增 `plotPointChainNames` 配置并持久化，左二标题改成可编辑输入框，目录树读取同一链名；已选剧情点卡片改成上方标题与移除按钮，下方左侧依次显示剧情内容和 AI评价，右侧固定显示内容、潜力、衔接三个指标。
- 预防：多条剧情链需要有可命名状态并和目录树共享；剧情点详情卡应区分正文、评价和指标，不要把指标混入正文标签区。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录顶部标题多余且缺少左一左二拖拽线

- 现象：剧情链目录顶部额外显示“剧情链 3”标题栏，占用空间；折叠入口不像整行可点击；左一目录树和左二剧情链详情之间没有拖拽分割线。
- 原因：目录树在正文侧边栏结构外又加了一层独立标题栏，分组折叠按钮只包住内部内容；四栏 grid 只给左二到中间、第三栏到右侧配置加了拖拽 handle，没有给目录树宽度单独建状态。
- 处理：删除目录顶部标题栏，把“剧情链”分组行改成整行按钮并增加 `aria-expanded`；新增剧情链目录宽度状态、持久化和拖拽分割线，让左一和左二之间可调整宽度。
- 预防：目录树复用正文样式时不要额外叠标题栏；分组折叠入口应整行可点；新增独立分栏时要同步补宽度状态、持久化和拖拽手柄。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链目录树需要沿用正文目录结构

- 现象：剧情链目录虽然改成竖排，但不像正文“未发布 / 已发布”目录树；用户希望“未发布”改名为“剧情链”，章节项改成剧情链1、剧情链2等，并且分组可以折叠。
- 原因：此前只做了独立的竖向按钮列表，没有复用正文侧边栏的标题栏、数量徽标、卷分组行、Chevron 折叠和章节行样式。
- 处理：把剧情链目录改成正文目录同款结构：顶部标题为“剧情链”，下方分组行也为“剧情链”并可折叠；子项显示剧情链1、剧情链2等，右侧显示各链剧情点数量。
- 预防：用户明确要求参考已有目录树时，优先复用既有目录层级和视觉结构，不要只把按钮改成竖排。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链导航不应使用横向滚动条

- 现象：剧情链1、剧情链2等按钮横向排列后，左侧区域出现底部滚动条；用户希望它像目录树一样显示，并把剧情链页面拆成目录、当前链详情、AI剧情点和右侧配置四个区域。
- 原因：此前把剧情链 slot 导航和当前链详情放在同一个左侧栏里，为了容纳较长按钮只能使用 `overflow-x-auto`，导致出现横向滚动条。
- 处理：新增固定宽度的剧情链目录树栏，剧情链按钮改为竖向全宽目录项；当前剧情链的剧情点列表独立为左二栏，页面 grid 改为目录树、当前链详情、AI生成候选、右侧配置四栏。
- 预防：目录或链路选择器不要放在横向滚动导航里；当导航项需要显示名称和数量时，应优先使用竖向目录树，并把导航与详情拆成独立区域。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链切换按钮需要显示链名和剧情点数量

- 现象：左侧顶部只有 `1 / 2 / 3` 三个数字按钮，用户需要自行理解它们代表剧情链；按钮上也看不出每条剧情链下已有多少剧情点。
- 原因：剧情链切换沿用了紧凑数字 slot 样式，只用圆点提示是否有内容，没有把链名和内容数量作为导航信息展示出来。
- 处理：把数字按钮改成横向剧情链导航，每个按钮显示“剧情链1 / 剧情链2”等名称，并在按钮内显示该链的剧情点数量，如“1点”。
- 预防：多条业务链路的切换入口不要只显示编号；需要同时给出对象名称和关键状态数量，避免用户在不同链之间切换时丢失上下文。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链已选剧情点移除按钮不够醒目

- 现象：已选剧情点卡片右上角的“移除”只是红色纯文字，和卡片内容混在一起，不像一个明确可点击的移除动作。
- 原因：移除按钮只设置了文字颜色和粗体，没有边框、底色或固定点击区域，视觉权重不足。
- 处理：把“移除”改为浅红底、红色边框、固定高度和阴影的警示按钮，并保留 hover 强调。
- 预防：破坏性或移除类操作不能只用裸文字；至少要给出清晰的点击区域、边框和 hover 反馈。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链中间栏操作按钮仍停在顶部标题区

- 现象：生成剧情链页面中间区域顶部仍显示“剧情点预览”和“等待手动刷新衔接剧情 · 5 个”等说明文字，`清空 / 重新生成 / 继续生成` 也停在顶部，没有移动到剧情点选择框下方的屏幕最下方。
- 原因：`plotPointStandalone` 中间栏把标题、状态说明和三个操作按钮写在同一个顶部 header 中；此前调整时没有把按钮行从顶部结构迁出。
- 处理：删除中间栏顶部标题和状态说明，让剧情点候选列表占据 `flex-1` 滚动空间；把 `清空 / 重新生成 / 继续生成` 三个按钮移动到候选列表之后的底部 `border-t` 操作行，只保留这三个按钮。
- 预防：剧情链中间栏后续只保留候选选择内容和底部操作按钮；涉及“移动到最下方”的 UI 修改要用源码顺序测试确认操作行在候选列表之后，并确认旧标题/状态文案不在该区域出现。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞预览和输出贴边标题未完全按设定预览嵌入

- 现象：脑洞页左侧“脑洞4”和字数统计仍不像“大纲/设定预览”的同组贴边标签；右侧“新脑洞1”和“清空”贴到容器顶部，被上边缘裁切，且“清空”还是独立白色圆角小框，不像边框内文字工具。
- 原因：脑洞可编辑标题位于 `.xy-floating-field` 内，既会继承普通 input 的盒模型，又受组件里的 Tailwind `min-w` 撑宽，导致字数统计离标题不够像同组标签；此前还禁用了脑洞标题组的 `::before` 线遮罩，使它和设定预览的贴边遮线方式不一致。右侧输出列表顶部只留 `0.25rem`，负向浮动的标题和清空按钮没有足够空间；“清空”还保留 `bg-white shadow-sm` 的按钮外框，和透明贴边背板不一致。
- 处理：脑洞预览/输出标题组改回和设定预览一致的 `20px` 行高、`22px` 左偏移、同组 `::before` 遮线；标题输入框宽度改按中英文字符估算为 `em`，并用 CSS 变量覆盖 Tailwind 最小宽度；通用贴边工具继续使用 `background-color`，避免清掉遮线背景图；右侧输出列表顶部留白收敛为 `0.625rem`，让输出框顶线和脑洞预览、模型/提示词框保持水平，同时保留 10px 顶部安全空间；“清空”改为 `xy-border-embedded-transparent-backplate` 透明贴边文字工具，和“新脑洞1”共用 `20px` 贴边行高。
- 预防：可编辑贴边标题不能只看中心线是否对齐，还要复用设定预览的同组遮线、行高和标签宽度策略；带负向浮动标题/按钮的滚动容器必须给顶部预留可见空间；贴边清空类动作不能再回退成白色圆角浮框。
- 验证：用 Chrome 真实渲染复现“脑洞4 106字 / 新脑洞1 0字 / 清空”：左侧标题与字数间距约 `6.31px`，脑洞标题组 `::before` 为 `block`；右侧输出标题相对滚动容器顶部约 `15.4px`，清空按钮约 `11px`，不再被裁切。执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞流式输出需要嵌入输出框底边

- 现象：脑洞输出区的 `流式输出` 还是底部操作区里的文字复选框，占用按钮行空间，和用户希望的边框内嵌小开关不一致。
- 原因：流式输出开关早期跟 `替换脑洞 / 保存为新脑洞` 放在同一操作行，使用 `xy-animated-checkbox` 复选框样式；但它本质是输出框参数，应该贴近脑洞输出框本身。
- 处理：移除底部文字复选框，新增 `xy-floating-border-stream-tool`，把开关嵌到脑洞输出框底部边框、字号控件右侧；开关改为图 2 的青色滑块样式，外层透明，轨道本体用白色遮线层避免边框线穿过。
- 预防：输出框参数类开关优先放在输出框边框工具位，外层不要加白底块；需要遮线时由控件本体或透明背板技术完成。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞生成数量不需要单独外框

- 现象：脑洞右侧表单里 `一次生成几个脑洞` 仍作为一个大边框输入框展示，占用一整行空间，和用户希望的右下角操作区不一致。
- 原因：生成数量早期被当作普通问题字段放进 `BRAINSTORM_QUESTION_FIELDS` 渲染列表，复用了浮动输入框外壳；但它本质是生成动作的参数，更适合贴近生成按钮。
- 处理：保留 `brainstormCount` 数据和确认/生成逻辑不变，仅跳过它在问题字段列表里的外框渲染；在右下角 `生成` 按钮左侧新增 1/2/3/5/10 分段组合按钮，并保留再次点击已选项可取消。
- 预防：生成参数类选项优先放在生成按钮附近，只有需要长文本输入的内容才放进问题字段框；不要给少量数字选项额外套大输入框。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 大纲右侧清空按钮被输出框滚动条遮住

- 现象：大纲右侧输出框的 `清空` 贴边按钮虽然用了边框透明背板，但仍贴在最右侧，和输出框滚动条重叠，截图里文字被滚动条遮住。
- 原因：大纲/章纲右侧输出区的清空按钮仍使用 `right-4`，该位置距离输出框右边太近；当输出框内部出现纵向滚动条时，按钮和滚动条落在同一视觉区域。
- 处理：仅将大纲/章纲右侧输出框的清空按钮从 `right-4` 左移到 `right-10`，并增加 `z-30` 层级；继续保留 `xy-border-embedded-transparent-backplate`，不恢复白底。
- 预防：贴在带滚动条输出框右上角的清空/删除类按钮，需要避开滚动条宽度，不要直接贴最右边；源码测试锁定为 `right-10 z-30`。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 边框透明背板候选位置需要先集中放到测试页

- 现象：边框透明背板技术已经用于部分正式页面，但还有左上标题、右上元信息、右上清空、右下字数、左下字号、模型/提示词标签、会话按钮、审核/点评输出工具等候选位置需要统一看效果。
- 原因：这些位置分散在大纲、章纲、脑洞、正文、角色、审核和点评等页面，直接批量改正式页面风险较高，也不方便逐项比较是否有白底、穿线或尺寸不统一。
- 处理：新增 `边框透明背板应用预览` 测试页，集中展示所有建议使用该技术的位置；先只放在测试集合里预览，不批量替换正式页面。
- 预防：后续要把边框透明背板技术推广到正式页面时，先按该测试页逐项验收，再迁移到对应页面，避免同类贴边内容又出现白底块或边框线穿字。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞回收站测试方案需要落到正式按钮并删除测试页

- 现象：脑洞回收站按钮方案已经在测试页里确认使用 D 方案，但正式脑洞页面仍是旧的蓝色入口；测试集合里也继续保留 `脑洞回收站按钮方案` 页面。
- 原因：测试页只用于挑选 A/B/C/D 样式，方案确认后还没有把 D 的浅红按钮结构迁移到正式入口，也没有清理临时测试页和测试集合路由。
- 处理：正式脑洞回收站入口改为 D 方案的浅红整行按钮，图标换用 B 方案的 `Trash2` 垃圾桶并改成红色；数量保留为右侧红色数字胶囊；删除 `BrainstormRecycleButtonTestPage` 并移除测试集合入口与路由。
- 预防：临时 UI 方案页在用户确认某一方案后，需要同步迁移到正式页面并删除方案页入口，避免测试方案长期留在软件测试集合里。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲字数统计需要跟随左上标题

- 现象：章纲卡片左上角显示 `第X章章纲（第X卷）`，右上角显示章节正文元信息，但章纲自身的字数统计仍在右下角，用户不容易判断这个字数是章纲内容还是章节正文内容。
- 原因：章纲卡片沿用了通用预览框的右下角 `xy-floating-count` 字数统计位置，而章纲页又额外在右上角展示了章节正文总字数，两个字数分散在不同贴边位置，语义不够明确。
- 处理：仅在章纲页把章纲内容字数移动到左上标题后，显示为 `章纲：X字`；右下角通用字数统计只保留给非章纲的章节概要卡片，避免同一章纲卡片重复显示字数。
- 预防：章纲卡片需要同时展示“章纲内容字数”和“章节正文字数”时，章纲字数跟随左上章纲标题，正文字数留在右上章节元信息，避免把不同语义的统计混放到同一个边角。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲贴边章节元信息不需要“正文：”前缀

- 现象：章纲卡片右上角贴边元信息显示为 `第X章 章节名 正文：3056字`，其中 `正文：` 多余，视觉上比用户需要的 `第X章 章节名 3056字` 更啰嗦。
- 原因：最初添加右上角章节信息时，为了区分章纲字数和正文字数，直接把 `正文：` 写进了贴边元信息；但该位置本身已经表达章节正文信息，前缀反而增加噪音。
- 处理：删除章纲卡片右上角贴边元信息里的 `正文：`，保留章节序号、章节名和字数；右侧详情说明区的 `正文：` 不属于贴边标题，暂不改动。
- 预防：边框贴边元信息要尽量短，能靠位置和上下文说明含义时，不再添加额外字段名前缀。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞输出框会话按钮多余且清空按钮格式不统一

- 现象：脑洞输出框左上角仍显示 `+ / 1` 会话按钮，但脑洞中间输出区只需要展示当前脑洞正文，不需要像正文 AI 面板一样切换会话；右上角 `清空` 按钮还是单个红色圆角按钮，和正文右侧 `删除 / 清空` 的小分段按钮格式不一致。
- 原因：脑洞输出框之前复用了会话型 AI 输出框的左上会话工具；清空按钮单独写了一套红色按钮样式，没有复用正文边框动作按钮的高度、圆角、边框和字号。
- 处理：移除脑洞输出框左上会话按钮渲染和专用会话工具 CSS；脑洞标题移回左上边框正常位置；右上角 `清空` 改成正文同款 `h-7` 外层 + `h-6 rounded-md border` 小按钮格式。
- 预防：脑洞输出框属于单内容输出/保存区，不再放 `+ / 1` 这类会话切换控件；边框右上角轻操作优先复用正文动作按钮格式，避免同类位置按钮尺寸不一致。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞生成表单底部留白过大

- 现象：脑洞页面右侧生成表单里，`补充内容` 下方到 `生成` 按钮之间出现大块空白，看起来像固定空区，空间利用不合理。
- 原因：问题面板和按钮区是上下分离布局，字段列表没有填满可用高度；`补充内容` 只保留固定最小高度，剩余高度落在字段和按钮之间，无法随未来新增按钮自动收回。
- 处理：把脑洞问题面板改成纵向 flex 布局，让最后一个字段 `补充内容` 作为弹性字段占用剩余高度；字段最小高度仍为 `180px`，用户输入多行时继续向下增长，下方新增按钮或操作行时则自动压缩这个弹性高度。
- 预防：表单中需要吸收空白的区域应放在主文本输入框本体上，不要放成固定留白；后续新增按钮时优先让弹性文本框回缩，而不是重新挤压整个表单。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲边框字号控件被正文显示字号放大

- 现象：章纲卡片左下角的字号设置控件比正文页面右侧区域的同款控件明显更大，输入框里的 `14` 和加减按钮都显得膨胀。
- 原因：通用 `.xy-floating-border-font-tool` 只复用了正文 `.xy-floating-chat-font-tool` 的定位，没有同步锁定步进器、按钮、图标和数字输入框的紧凑尺寸；当章纲卡片正文使用可调字号渲染时，边框工具容易跟着上下文视觉放大。
- 处理：把 `.xy-floating-border-font-tool` 和 `.xy-floating-chat-font-tool` 合并到同一套紧凑尺寸规则里，显式固定控件本体 `5.52rem x 1.76rem`、按钮 `1.76rem`、输入框 `2rem`、图标 `0.48rem`，并把工具自身字号锁为 `14px`。
- 预防：以后新增左下角边框字号设置时，必须复用共享的 `.xy-floating-border-font-tool` 尺寸规则；不要只复用定位类，也不要让控件继承所在卡片的正文显示字号。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲贴边标题仍有明显分割线

- 现象：章纲卡片左上标题和右上章节信息虽然已经用了透明背板和伪元素细遮罩，但边框上沿仍从文字中间完整穿过，分割感明显。
- 原因：上一版 `::before` 细遮罩依赖伪元素层级，实际渲染时可能落到边框层下面；文字描边只能遮住字形附近，无法稳定切断整段标题宽度内的边框线。
- 处理：在 `xy-border-embedded-transparent-backplate`、预览框 `label` 和 `.xy-floating-count` 自身增加中线 `background-image: linear-gradient(...)`，只覆盖文字中线区域，宽度跟随文字自身，不恢复整块白底。
- 预防：边框嵌入文字需要以元素自身背景图切断边框线，伪元素遮罩只能作为辅助；不要只靠 `text-stroke` 或层级不稳定的伪元素。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲贴边标题中间仍被边框线穿过

- 现象：章纲卡片左上角 `第X章章纲（第X卷）`、右上章节信息等贴边文字虽然没有白底块，但边框线仍会从文字中间或字间空隙穿过去。
- 原因：此前的边框嵌入式透明背板主要靠 `-webkit-text-stroke` 给文字本身描白边，只能遮住字形附近的线；中文标题字符之间和整段文字中线位置仍会露出边框线。
- 处理：为 `xy-border-embedded-transparent-backplate`、预览框 `label` 和 `.xy-floating-count` 增加一条很薄的 `::before` 线遮罩，只覆盖边框线经过的位置；保留透明背景和零左右 padding，不恢复整块白色背板。
- 预防：边框贴边文字不能只靠文字描边遮线；需要同时使用“文字描边 + 中线细遮罩”，字号按钮这类控件则继续用控件本体覆盖边框线。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞输出字号工具和底部操作区层级不统一

- 现象：脑洞输出框左下角字号设置没有完全使用大纲/正文同一套边框字号工具；输出框下方的输入与保存操作区还保留 `rounded-xl border bg-white p-3` 卡片外壳，看起来像主输出框下面又套了一块卡片。
- 原因：脑洞输出字号控件仍使用独立的 `xy-floating-brainstorm-output-font-tool`，和通用 `xy-floating-border-font-tool` 分叉；底部操作区沿用早期卡片容器，未跟随作品编辑器右侧区域无卡片化规则同步。
- 处理：脑洞输出字号控件改用通用 `xy-floating-border-font-tool`，删除脑洞专用字号工具样式；底部操作区改为 `shrink-0 space-y-3` 直铺，只保留输入框、按钮组和流式输出控件自身边界。
- 预防：边框左下角字号设置统一使用 `xy-floating-border-font-tool`；右侧主输出框下方的动作区只承担布局，不再额外加卡片外壳。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 剧情链右侧思考内容与左侧剧情点不一致

- 现象：剧情链生成后，左侧“剧情点预览”显示的是最终解析出的候选剧情点，但右侧输出框展开 `已思考` 后会看到模型 reasoning 里的中途草稿，内容可能和左侧最终剧情点不一致。
- 原因：左侧候选卡片来自 `plotPointGeneratedCandidateText` 的最终答案解析；右侧输出框直接渲染 `outlinePreviewDraft` 的 `[[THINKING]]` 思考块。带 reasoning 的模型会在思考过程里尝试不同方案，这部分不等于最终输出。
- 处理：给 `renderAiChatContent` 增加 `hideReasoningBody` 选项；剧情链右侧输出框只显示“已思考/正在思考”的状态和最终答案，不再展示 reasoning 正文，避免把思考草稿误认为最终剧情点。
- 预防：剧情链、候选列表这类“左侧为最终解析结果”的页面，右侧只展示最终输出和思考状态；不要把模型内部思考正文与最终候选并列给用户核对。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲卡片左下角缺少字号设置

- 现象：章纲页面每个章纲框只有内容、右上章节信息和右下字数统计，左下角没有像大纲/设定预览那样的字号设置，无法直接调节章纲卡片正文显示字号。
- 原因：此前只把 `xy-floating-border-font-tool` 接入角色、脑洞预览、设定预览等边框预览框，章纲列表卡片虽然也使用 `xy-floating-outline-preview`，但没有单独的字号状态和步进器。
- 处理：新增 `detailOutlineFontSize` 标签页配置，章纲卡片 textarea 使用该字号渲染；仅在章纲页 `isDetailOutlineTab` 下给每个章纲卡片左下角添加 `FontSizeStepper`，复用 `xy-floating-border-font-tool` 的左下角边框工具格式，不影响概要页。
- 预防：凡是章纲、大纲、设定这类可编辑预览框需要字号调节时，统一使用左下角 `xy-floating-border-font-tool`，避免同类边框框体能力不一致。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 脑洞生成表单空间利用不合理

- 现象：脑洞页面右侧生成表单里，题材和模型框左侧没有对齐，故事主题和提示词框右侧没有对齐；模型/题材之间、补充内容/生成按钮之间留白偏大；构思写到两行后需要内部滚动或不能完整看到。
- 原因：顶部模型/提示词选择器和下方问题面板使用了不同的内边距与对齐方式；问题面板额外 `p-3` 导致字段整体内缩；补充内容字段用 `flex-1` 撑满剩余高度，而文本行数又被限制到最多 4 行。
- 处理：脑洞右栏模型/提示词选择器强制占满同一列宽；问题面板改为 `px-0 py-2`，题材/故事主题行改为更紧凑的 `gap-2.5`；构思、补充内容等文本框按内容行数弹性增高，不再内部滚动；补充内容取消撑满剩余高度，生成按钮间距收紧到 `mt-2`。
- 预防：右侧生成表单应以顶部配置框作为左右边界基准，内部字段不再额外套横向 padding；用户输入型文本框优先外部增高，只有整个表单区域滚动。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 技术词典需要记录边框嵌入式透明背板

- 现象：边框内嵌内容已经在正式页面使用 `xy-border-embedded-transparent-backplate`，但 UI 库“技术词典”里没有独立条目，后续无法直接说“用 T 编号那个技术”。
- 原因：此前只把该技术记录在错误日志和 CSS 类名里，没有补充到 `SoftwareUiCatalogPage` 的 `techItems`。
- 处理：新增技术词典 `T-20 边框嵌入式透明背板`，说明用途是边框线上文字/字数/清空/章节信息不使用白底块，改用透明背板和文字描边遮线，并增加对应小预览。
- 预防：以后新增可复用 UI 技术时，除了日志和 CSS 类名，也同步写进技术词典，方便直接按编号复用。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 边框内嵌内容需要全部使用透明背板技术

- 现象：章纲卡片右上角 `第X章 章节名 正文：XXX字` 这类内容贴在边框线上，如果没有显式使用透明背板技术，后续容易被改回白底块或被边框线穿过。
- 原因：此前部分边框内容是靠 `.xy-floating-outline-preview` 的后代选择器间接获得透明背板效果，源码里看不出这个位置已经受规则保护；右下角字数统计仍有一套通用白底背景规则。
- 处理：把章纲右上章节信息、各右侧输出 `清空`、脑洞输出标题、审核/点评输出工具显式接入 `xy-border-embedded-transparent-backplate`；将通用 `.xy-floating-count` 改为透明背景与文字级遮线，让正文、大纲、章纲、角色、脑洞、状态等右下角字数统一使用同一技术。
- 预防：以后任何压在边框线上的内容都默认使用 `xy-border-embedded-transparent-backplate` 或同等规则；不要再为边框内嵌文字增加 `bg-white px-*` 白底背板。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run check`、`npm.cmd run build`。

## 嵌入边框字号控件位置不统一

- 现象：正文右侧 AI 输出框的字号控件在边框左下角，但大纲/设定预览等页面的字号控件出现在右上角，导致同一种“嵌入边框工具”格式在不同页面不一致。
- 原因：正文使用专用的 `.xy-floating-chat-font-tool` 左下定位；角色背景、角色状态、脑洞预览、设定预览等位置仍复用通用 `.xy-floating-edge-tool`，该类默认是右上角工具位。
- 处理：新增通用左下字号工具类 `.xy-floating-border-font-tool`，并把角色背景、角色状态、脑洞预览、设定预览、空设定预览统一接入；脑洞输出字号继续保留独立类名，但定位规则改为同样的左下角；软件格式目录 UI-141 同步改成左下角示例。
- 预防：嵌入边框的“字号设置”统一使用左下角工具位，危险/清空类操作放右上角；不要再用 `.xy-floating-edge-tool` 承载字号步进器。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run check`、`npm.cmd run build`。

## 边框贴边文字仍像有白色底片

- 现象：章纲卡片左上角 `第X章章纲（第X卷）`、右下角字数、右上角章节信息，以及右侧输出框贴边 `清空` 等位置虽然已去掉 `bg-white`，但截图里仍能看到类似白色底片的块感；部分贴边文字还容易被边框线穿过。
- 原因：上一版透明背板用四向白色 `text-shadow` 遮住边框线，视觉上会形成一圈接近矩形的白影；嵌套的字数组件如果只处理外层，也可能让边框线继续压到内部文字。
- 处理：将大纲/章纲/右侧输出框的贴边标签、字数、章节元信息、清空文字统一改为“透明背景 + 文字描边遮线”的边框嵌入式透明背板；抽出可复用类 `xy-border-embedded-transparent-backplate`，去掉四向白影，并给字数、章节元信息、清空工具的子元素同步描边；脑洞输出右上工具外层也去掉通用白色背板。
- 预防：贴边文字需要遮线时优先用 `xy-border-embedded-transparent-backplate` 或同等的 `-webkit-text-stroke` + `paint-order: stroke fill` 做文字级遮线，不再用 `bg-white px-*` 或四向 `text-shadow` 做块状遮罩；按钮本体样式和外层背板要分开检查。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run check`、`npm.cmd run build`。

## 章纲卡片右上角缺少正文章节信息

- 现象：章纲页面每个章纲卡片只有左上角的 `第X章章纲（第X卷）`，无法在卡片内直接看到对应正文的章节名和正文字数。
- 原因：章纲预览卡片只渲染章纲标题与章纲内容字数，未把已有的 `chapter.title` 和 `chapter.wordCount` 显示到卡片贴边区域。
- 处理：在章纲页每个章纲卡片右上角新增 `第X章 章节名 正文：XXX字` 信息，标题为空时显示 `未命名章节`；该信息只在章纲页显示，不影响概要页；复用透明贴边文字阴影技术，避免恢复白色底片。
- 预防：章纲卡片需要同时区分“章纲内容字数”和“正文内容字数”，右上角放正文元信息，右下角继续保留章纲自身字数统计。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 剧情链右侧生成规则标题需要删除

- 现象：剧情链右侧 AI 区域在模型/提示词下方显示 `生成规则` 标题，占用一行空间，和当前右侧区域希望更紧凑直铺的格式不一致。
- 原因：剧情链右栏早期把长度、剧情点类型、剧情点数量归到一个显式标题下；右侧布局统一后，这个标题成为冗余提示。
- 处理：删除剧情链右侧可见的 `生成规则` 标题，只保留下方长度、剧情点类型、剧情点数量按钮组；不改实际发送给 AI 的规则内容和按钮样式尺寸。
- 预防：右侧参数区如果标签项已经能说明用途，不再额外添加分组标题；需要保留给 AI 的提示规则时，和可见 UI 标题分开处理。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 清空正文 AI 会话后不应显示“已新开空会话”

- 现象：正文右侧 AI 面板点击清空/重置会话后，顶部状态栏会显示 `已新开空会话`，占用右侧区域上方空间。
- 原因：`WorkbenchAIPanel` 的 `resetSessions` 在完成重建空会话后调用了 `flashStatus('已新开空会话')`，但这个操作本身已经通过会话列表变化可见，不需要额外提示。
- 处理：移除 `resetSessions` 里的顶部状态提示，只保留停止输出、清空关联、创建新空会话和重置日志状态的逻辑。
- 预防：会话删除、清空、重置这类用户主动触发且结果直接可见的操作，不再追加顶部状态提示；需要提示时优先确认是否会遮挡右侧工作区。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.deleteSession.test.ts`。

## 作品编辑器右侧区域需要统一为 07 测试无卡片式

- 现象：角色生成、大纲/题材生成、剧情点生成、章纲/概要、状态更新、审核/点评等右侧区域仍混用外层白色卡片、软卡参数块或 `AI 配置 / AI 输出框` 标题，和 07 号测试及正文页右侧“顶部配置 + 主输出框 + 下方输入动作”的直铺格式不一致。
- 原因：此前只拆掉了部分 AI 对话框外壳，并保留了 `xy-soft-shell-panel` 作为过渡弱化方案；不同分支仍各自包了一层 `rounded-xl border ... bg-white`，导致右侧区域层级不统一。
- 处理：将正式作品编辑器右侧区域统一改为 `bg-gray-50 px-4 pb-4 pt-2` 的直铺壳；角色、题材/设定、剧情点、状态、审核/点评的主输出区改由现有 `xy-floating-field xy-floating-outline-preview` 直接承载；章纲/概要当前信息和审核/点评参数摘要去掉软卡壳，仅保留文字信息；保留按钮、输入框、列表项和弹窗本身的尺寸与样式。
- 预防：以后对齐正文右栏或 07 测试格式时，先拆“右侧承载外壳”，不要再给右侧整块或参数摘要套白卡/软卡；主输出框、输入框、按钮组和列表项仍按控件自身边界保留。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 会话按钮不应连成分段按钮

- 现象：正文 AI、脑洞输出和右侧测试页的 `+ / 1 / 2 / 3 / 4` 会话按钮被合并成一条分段按钮，虽然中间不再露线，但视觉上不如最早的独立圆角按钮。
- 原因：上次为了解决 `+` 和 `1` 之间露出输出框边线的问题，把按钮间距设为 0，并用 `margin-left: -1px` 合并相邻边框，副作用是按钮变成连体样式。
- 处理：`xy-floating-session-buttons` 恢复独立按钮间距和完整圆角，取消负边距与圆角压平；每个按钮本体增加一圈极窄的 `box-shadow` 遮线层，遮住输出框上边线，避免恢复整块白色背板；正式正文 AI、脑洞输出和右侧测试复刻页同步改为 `overflow-visible`，防止遮线层被裁切。
- 预防：边框上的会话按钮需要“独立按钮 + 遮线层”，不要再用连体分段按钮解决露线；遮线应挂在按钮本体，不要恢复工具外层白底背板。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.deleteSession.test.ts src/features/workbench/components/WorkbenchLibraryPanel.test.tsx src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run check`、`npm.cmd run build`。

## 作品编辑器外层卡片审查建议需要正式落地

- 现象：测试页已经给出大纲、脑洞、章纲/概要、正文、角色/设定、审核/点评/状态的外层卡片去留建议，但正式作品编辑器里仍有个别重复外壳或残留的 `AI对话框` 标题。
- 原因：此前先做了审查测试页和脑洞去外壳，尚未把“弱化参数/信息外壳、保留主输出卡片”的规则同步到正式页面的其他分支；角色生成右栏还残留旧对话框标题。
- 处理：新增 `xy-soft-shell-panel` 弱化外壳技术；保留正文 AI、章纲/概要预览、审核/点评结果等主卡片，弱化章纲/概要右侧当前信息块与审核/点评参数摘要；移除角色生成输出区残留的 `AI对话框` 可见标题和隐藏 label。
- 预防：后续批量调整作品编辑器外壳时，先按“主工作卡片 / 列表项 / 弹窗 / 字段组外壳 / 参数摘要”分类，只对字段组和参数摘要使用 `xy-shellless-panel` 或 `xy-soft-shell-panel`，不要改动主输出区域边界。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 会话新增按钮和序号按钮之间仍露出边框线

- 现象：去掉 `+ / 1` 会话工具外层白色背板后，`+` 和 `1` 两个按钮本体中间仍能看到一小段输出框上边线，像按钮之间夹了一条线。
- 原因：会话按钮组内部仍使用 `gap-1` 留出横向空隙；外层背板透明后，空隙位置会直接露出下面的浮动输出框边框。正文页的序号按钮还额外包了一层 `div`，只改按钮本体圆角时也可能漏掉包裹层。
- 处理：新增 `xy-floating-session-buttons` 会话按钮组规则，取消按钮间 gap，让相邻按钮用 `margin-left: -1px` 合并边框，并同时处理直接按钮和包裹一层按钮的相邻圆角；正文 AI、脑洞 AI 和右侧测试复刻页统一接入该类。
- 预防：边框上的连续小按钮去掉背板后，不能再依赖透明间距分隔；需要用组合按钮方式合并相邻边框，避免底层边框线从按钮缝隙露出。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.deleteSession.test.ts src/features/workbench/components/WorkbenchLibraryPanel.test.tsx src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run check`。

## 作品编辑器缺少外层卡片去留审查测试

- 现象：脑洞页去掉外层卡片后，需要继续判断大纲、章纲、正文、角色、审核、点评、状态等作品编辑器页面是否也存在“字段已经是强边框，但外面又套一层卡片”的重复层级。
- 原因：不同页面里的卡片用途不同；有些是字段组外壳，可以用 `xy-shellless-panel` 去掉，有些是 AI 主输出、章节预览、列表项或结果卡片，仍需要保留边界。
- 处理：新增“作品编辑器外层卡片审查”测试页，集中展示大纲、脑洞、章纲/概要、正文、角色/设定、审核/点评/状态的建议状态：建议去外壳、建议弱化、建议保留；测试页用 `xy-shellless-panel` 预览只去承载外壳、不动字段本体的效果。
- 预防：批量改作品编辑器页面前先在测试集合做审查预览，按“字段组外壳”和“主工作卡片”分类，不要把 AI 输出、章节预览、列表项这类主要视觉单位误删边界。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 脑洞生成配置外层卡片框需要去掉

- 现象：脑洞页面右侧生成配置里，题材、故事主题、主角金手指、构思、数量和补充内容这些输入框外面还有一层整体卡片框，视觉上形成“框里套框”。
- 原因：脑洞问题面板的承载容器同时负责滚动和外观，类名里带有 `rounded-xl border border-gray-200 bg-white p-3`；用户只想保留各个输入框本身，不需要外层卡片壳。
- 处理：新增可复用的 `xy-shellless-panel` 技术类，只移除承载容器的边框、圆角、背景和阴影；脑洞问题面板保留 `xy-brainstorm-question-panel`、滚动、横向隐藏和 `p-3` 内边距，确保内部输入框不被改动。
- 预防：去掉一组表单外层卡片时，不要删除内部字段的浮动边框；优先把“承载能力”和“卡片外观”拆开，保留滚动、内边距、宽度限制，单独去掉外壳样式。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 章纲/预览卡片贴边标题仍有白色底片

- 现象：章纲卡片左上角的 `第N章章纲（第N卷）` 标题，以及部分贴边的 `清空`、脑洞输出标题、字数统计，会露出一段横向白色底片，视觉上像边框被白条垫住。
- 原因：这些位置复用了浮动边框标签写法，默认 `label`、`.xy-floating-count` 或写死的 `bg-white px-1` 会给整段文字外面加矩形背景；它们不是按钮本体，而是贴在边框上的背板层。
- 处理：只对 `.xy-floating-outline-preview` 预览类卡片取消标签和字数统计的白色背景与左右底片，并用轻量文字阴影挡住边框线；同时把贴边 `清空` 和脑洞输出标题改为透明背板类，保留文字位置和原有操作。
- 预防：边框贴边元素要区分“文字/按钮本体”和“外层背板”；截图要求无白底时，不要全局改普通输入框浮动标签，优先给预览卡片、贴边标题、贴边工具加专用透明背板规则。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## AI 会话序号按钮被边框线穿过

- 现象：去掉会话工具外层白色背板后，左上角 `1` 号会话按钮中间被输出框上边线穿过去，看起来像数字和边框重叠。
- 原因：选中的会话序号按钮使用 `bg-brand/10` 或 `bg-[#08AACE]/10` 这类半透明背景；外层背板透明后，后面的边框线会透过按钮本体显示出来。
- 处理：把正式正文 AI、脑洞输出和 06 测试复刻页的选中会话按钮底色改为不透明浅蓝 `#EAF9FD`，只改按钮本体背景，不恢复外层白色背板。
- 预防：边框嵌入按钮如果覆盖在边线上，选中态背景必须使用不透明色；透明度只适合不压线的普通区域。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.deleteSession.test.ts src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 大纲生成输出区仍显示 AI 对话框标题

- 现象：大纲页面右侧输出区左上角仍显示 `AI对话框` 标题，用户已经要求去掉 AI 对话框格式后，这个标题还残留在边框上。
- 原因：上次只改了概要/章纲正式右栏，漏掉了 `SETTING_TAB = '大纲'` 的高级右栏输出区；该分支仍有可见的 `AI对话框` 边框标签和隐藏 label 文案。
- 处理：删除大纲生成输出区的可见 `AI对话框` 标签，并移除同一输出框里的隐藏 `AI对话框` label 文案；同时删除大纲流程下剧情链生成输出区的同名标题；保留清空按钮、输出内容框、关联脑洞、输入框和操作按钮的原样式。
- 预防：处理“大纲页面”时要同时检查大纲设定生成区、概要/章纲右栏和剧情链独立分支，不能只按一个 `AI对话框` 搜索结果判断完成。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 正文 AI 会话工具仍有白色背板

- 现象：正文右侧 AI 输出卡片左上角 `+ / 1` 和右上角 `删除 / 清空` 外面仍露出横向白色底板，边框上方看起来被一整条白底垫住。
- 原因：正文会话工具使用 `.xy-floating-chat-session-tool` 和 `.xy-floating-chat-action-tool`，这两个类仍继承通用 `.xy-floating-edge-tool` 的白色背景与左右内边距；组件第一层容器也带 `bg-white`。
- 处理：只把正文会话工具与动作工具的背板层改为透明，并清除外层左右内边距；保留 `+ / 1 / 删除 / 清空` 按钮本身的背景、边框、宽高和文本样式。
- 预防：边框嵌入工具需要区分“工具背板”和“按钮本体”；截图要求无白底时，优先检查 `.xy-floating-edge-tool` 及第一层容器，而不是删除按钮自身背景。
- 验证：执行 `npm.cmd run test:run -- src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run check`。

## 大纲右侧 AI 输出区仍按对话框外壳布局

- 现象：大纲/章纲页面右侧把当前信息卡片和 `AI对话框` 外壳分成上下两块，和 06 测试里正文右侧“顶部配置 + 主输出卡片 + 下方关联/输入/动作”的格式不一致。
- 原因：大纲右栏早期把 AI 输出框包在单独的圆角对话框 section 里，输出浮动边框只是其中的内部控件，导致整体层级比正文右栏多一层。
- 处理：只调整布局结构，保留模型提示词、输入框、关联控件和保存/复制/清空按钮原有样式尺寸；拆掉正式大纲右栏的外层 `AI对话框` 壳，让现有输出浮动边框直接成为右栏主卡片，并把当前章节信息、关联、输入和动作按钮排在输出卡片下方。
- 预防：以后对齐正文右栏格式时，优先判断是外层结构差异还是控件样式差异；只要求“格式”时不要改按钮宽高、颜色或控件 class。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞会话按钮外层出现白色背板

- 现象：脑洞输出框左上角的 `+ / 1` 会话按钮外面出现一条额外白色背景，和测试图里只有按钮本体的效果不一致。
- 原因：会话按钮复用了通用 `xy-floating-edge-tool`，该工具默认给整个浮动工具加白色背景和左右内边距；组件内部容器也带了白底。
- 处理：只针对 `xy-floating-brainstorm-session-tool` 覆盖外层和内部容器为透明背景，并清掉外层左右内边距，保留按钮自身背景。
- 预防：从测试页迁移浮动工具时，要区分“按钮本体样式”和“工具背板样式”，不要把通用背板一起带到不需要的位置。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞右侧生成配置显示不全

- 现象：脑洞页面右侧生成配置在可用高度不足时，底部字段可能被裁掉，看起来显示不全。
- 原因：脑洞配置面板曾使用固定隐藏溢出的布局，内容超过可视高度时没有纵向滚动承接。
- 处理：把脑洞配置面板改为纵向可滚动、横向隐藏，并让非末尾字段保持不被压缩，避免底部字段被裁切。
- 预防：表单类固定面板应保留纵向滚动兜底，横向溢出单独隐藏或收缩处理。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞题材和故事主题标签显示不全

- 现象：脑洞页“题材”和“故事主题”两个并排短框的浮动标签靠近上边缘，文字上半截被裁掉。
- 原因：短框复用了通用 `xy-floating-outline-compact-textarea` 标签定位，`top: 0` 加 `translateY(-50%)` 会把标签顶出当前脑洞表单可视区域。
- 处理：恢复短框和“主角金手指”一致的边框外浮标签样式与 `52px` 单行高度；只给脑洞表单顶部增加留白，避免标签被卡片上沿裁掉。
- 预防：脑洞这类窄字段如果使用浮动标签，应优先调整卡片高度与容器留白，不要把标签改成框内标题。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞数量按钮选中后不能再次点击取消

- 现象：脑洞页“一次生成几个脑洞”数量按钮点选后保持高亮，再次点击同一个数字无法取消选择。
- 原因：数量按钮点击时始终把当前数字写入配置，没有判断当前按钮是否已选中。
- 处理：点击已选中的数量按钮时写入空值，点击未选中的数量按钮时仍写入对应数字。
- 预防：胶囊选择项如果不是必填，应支持二次点击取消，并用测试覆盖选中态切换。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞题材和故事主题占位文字过长

- 现象：脑洞页“题材”和“故事主题”两个短输入框里的占位示例过长，在窄框里容易换行或显示拥挤。
- 原因：占位文字沿用了较完整的示例列表，和当前短字段的可视宽度不匹配。
- 处理：题材占位改为 `如都市、玄幻`；故事主题占位改为 `如系统流`。
- 预防：短字段占位只保留一到两个最关键示例，避免示例文本比输入框本身更抢眼。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞数量按钮去掉单位后仍然换行

- 现象：脑洞页“一次生成几个脑洞”按钮去掉“个”后，`10` 仍被挤到第二行，外框也保留了两行高度。
- 原因：数量按钮仍使用 `min-w-[50px]`、`h-9`、`gap-2` 和可换行布局；外框内边距与最小高度也按两行按钮保留。
- 处理：按钮缩为 `h-8 min-w-[40px] px-2`，选项容器改为 `flex-nowrap gap-1.5 px-3`，外框高度收紧为单行显示需要的 `64px`。
- 预防：数量选择这类固定少量选项应同时控制按钮宽度、容器 nowrap 和外框高度，不能只删单位文字。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 大纲设定左侧滚动条过宽

- 现象：大纲页面左侧设定分类列表的滚动条偏粗，视觉上比列表内容更抢眼。
- 原因：左侧分类列表只使用普通 `overflow-y-auto`，没有接入当前工作台列表专用的细滚动条样式。
- 处理：给左侧分类列表增加 `xy-setting-sidebar-scrollbar` 专用 class，并把 WebKit 滚动条宽度设为 `5px`，约为常用 `8px` 滚动条的 60%。
- 预防：只调整特定侧栏滚动条时使用专用 class，避免把全局滚动条或正文编辑区滚动条一起改细。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞数量按钮带“个”导致一行放不下

- 现象：脑洞页“一次生成几个脑洞”数量选项显示为 `1个 / 2个 / 3个 / 5个 / 10个`，按钮文字偏宽，容易换成两行。
- 原因：数量选项自身已经位于“几个脑洞”的字段标题下，按钮里再次显示单位“个”造成冗余占宽；旧配置也会把 `3个` 这类值直接保存。
- 处理：数量按钮改为只显示 `1 / 2 / 3 / 5 / 10`；读取和写入数量字段时归一旧的 `N个` 值为纯数字，保证旧数据仍能正确高亮。
- 预防：同一字段标题已经说明单位时，胶囊选项只显示核心值；回归测试同时断言不会再渲染 `3个` 按钮。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`。

## 脑洞数量选择需要改成不可输入的浮动外框

- 现象：脑洞页“一次生成几个脑洞”只是普通按钮行，视觉上不像“你的构思”这类浮动边框输入框。
- 原因：数量选择虽然在表单字段循环里渲染，但缺少独立外框样式，内部也没有明确的“只点击数字、不输入文本”结构约束。
- 处理：新增 `xy-brainstorm-count-field` 外框，沿用浮动标签边框风格；内部保留 `1 / 2 / 3 / 5 / 10` 数字按钮，不渲染文本框。
- 预防：选择类字段如果需要和输入框视觉一致，应使用不可输入的 field 容器包住可点击选项，并用测试确认容器内没有 textbox。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 脑洞页面右侧表单出现左右滚动条

- 现象：脑洞页面右侧生成配置表单底部出现横向滚动条，页面在窄宽度下可以左右滚动。
- 原因：脑洞表单容器使用了 `overflow-y-auto` 的滚动容器，内部计数按钮行固定单行排列，窄宽度下内容撑出容器宽度并触发横向滚动。
- 处理：把脑洞表单容器改为固定 `overflow-hidden` 布局，增加 `xy-brainstorm-question-panel` 限制内部最大宽度；计数按钮行改为可换行的 `xy-brainstorm-count-options`。
- 预防：固定页面里的右侧配置表单不能使用会暴露横向滚动的容器；胶囊按钮组在窄宽度下应允许换行或收缩。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 脑洞输出框清空与字号控件位置需要互换

- 现象：脑洞库右侧输出框的“清空”按钮位于下方操作区，字号设置占用输出框右上角，和正文页面对话框的工具布局不一致。
- 原因：`WorkbenchLibraryPanel` 的脑洞输出区把 `FontSizeStepper` 放在通用右上角浮动工具里，而清空按钮渲染在输入框下方操作栏。
- 处理：把“清空”移动到脑洞输出框右上角边框工具；把“脑洞输出字号”移动到输出框左下角边框位置，并新增回归测试锁定位置类。
- 预防：脑洞输出框、正文对话框这类大文本浮动框应保持工具分区一致：危险/清空操作在右上，字号等辅助调节在左下或不遮挡正文的位置。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 工作台创作流程按钮顺序需要脑洞前置

- 现象：工作台顶部创作流程按钮显示为“大纲 / 剧情链 / 章纲 / 正文 / 脑洞”，脑洞入口排在正文后面，不符合当前希望先脑洞再进入大纲的创作路径。
- 原因：`WORKBENCH_MAIN_FLOW_STEPS` 的共享流程配置仍把 `brainstorm` 放在主流程末尾，顶部 Header 直接按该数组顺序渲染。
- 处理：把 `brainstorm` 移到创作流程首位，并同步更新流程顺序回归测试和 Header 渲染顺序测试。
- 预防：调整工作台顶部流程顺序时优先修改 `workbenchCreationFlow.ts` 的共享配置，并用 Header 测试锁定视觉顺序。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/model/workbenchCreationFlow.test.ts src/features/workbench/components/WorkbenchHeader.test.tsx`。

## 删除当前 AI 会话后顶部状态提示暂时隐藏

- 现象：正文续写 AI 对话框点击“删除”后，页面最上方会显示“已删除当前会话并新建空会话”，遮挡当前操作视线。
- 原因：`WorkbenchAIPanel` 在删除最后一个会话并重建空会话时调用了 `flashStatus`，触发顶部状态条。
- 处理：移除删除会话分支里的状态提示调用，保留删除、停止输出、清空上下文和新建空会话逻辑不变。
- 预防：会话删除这类用户明确点击后的即时操作，若没有失败或阻断，默认不再追加顶部状态提示；需要恢复时先确认是否会遮挡工作区。
- 验证：新增并执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchAIPanel.deleteSession.test.ts`。

## 正文续写会话按钮没有恢复旧版左上位置

- 现象：正文续写 AI 对话框的 `+ / 1` 会话按钮仍不像旧版仓库，按钮组偏向内容框中部，看起来没有恢复到原来的左上边框位置。
- 原因：上次修复只把按钮从内容区挪回边框，但额外使用了 `left: var(--xy-chat-session-tool-left, 6.25rem)` 和新的宽度计算；旧仓库 `YueLuo777/yuexia-PC` 实际使用的是 `left: 1.1rem`、`max-width: calc(100% - 8.5rem)`，垂直位置继承通用 `.xy-floating-edge-tool`。
- 处理：读取旧仓库 `src/shared/styles/index.css` 后，把 `.xy-floating-chat-session-tool`、`.xy-floating-chat-action-tool` 和子容器规则恢复到旧版横向定位；更新回归测试锁定旧版左上位置。
- 预防：恢复旧 UI 时必须先对照旧仓库具体 CSS，不要只凭截图推断新的安全间距。
- 验证：执行 `npm.cmd run test:run -- src/shared/styles/floatingChatShell.test.ts`。

## 删除非空卷提示使用系统原生弹窗

- 现象：右键卷名删除仍包含章节的卷时，提示“该卷下还有章节，请先删除章节”会以系统原生窗口弹出，标题栏和按钮风格都不像月下写作内的提示框。
- 原因：`ChapterSidebar` 在非空卷阻断分支直接调用 `window.alert`，绕过了项目里的 `ConfirmDialog` 统一弹窗样式。
- 处理：给 `ConfirmDialog` 增加可选单按钮模式；删除非空卷时打开应用内“无法删除卷”提示，使用 warning 图标和单个“确定”按钮。
- 预防：业务阻断、确认、警告类提示都应优先复用共享弹窗，不要在 React 组件里新增 `window.alert`。
- 验证：新增并执行 `npm.cmd run test:run -- src/features/workbench/components/ChapterSidebar.test.tsx`。

## 正文续写会话按钮跑进 AI 对话内容框

- 现象：正文续写的 AI 对话框左上会话按钮（+、1）显示在内容框内部，空态“暂无对话内容...”也被顶部预留空间挤得偏低。
- 原因：正式样式里左侧会话工具覆写了通用边框工具定位，使用 `top: 0.65rem` 和 `transform: none`，导致它不再贴在上边框，而是落进滚动内容区；聊天内容区还保留了 `2.75rem` 顶部内边距。测试集合的右侧 AI 面板复刻页也硬编码了 `top-2` 和 `pt-12`，所以同样会复现。
- 处理：让 `.xy-floating-chat-session-tool` 回到 `top: 0` 与 `translateY(-50%)` 的边框嵌入定位；把正式聊天记录区顶部内边距恢复到正常内容留白；同步把复刻页的正文会话按钮、删除/清空按钮移到上边框，并取消空态的大顶部 padding。
- 预防：边框嵌入工具需要保持和 `.xy-floating-edge-tool` 一致的垂直定位，只允许左右位置、宽度这类轴向差异；测试复刻页不能用另一套会漂移的硬编码布局。
- 验证：新增并执行 `npm.cmd run test:run -- src/shared/styles/floatingChatShell.test.ts`、`npm.cmd run test:run -- src/features/tests/pages/WorkbenchAiPanelReplicaTestPage.test.ts`。

## 测试内容页左滑不能返回测试总页

- 现象：在测试集合里打开某个测试内容后，右键向左滑动手势不再退回测试总页。
- 原因：测试内容页使用 `TestCollectionPage` 内部 `activePath` 状态切换，浏览器路由仍停在 `/test-collection`；全局左滑只执行回首页逻辑，没有派发测试集合已有的“显示测试总页”事件。
- 处理：全局左滑在当前路由为 `/test-collection` 时派发 `TEST_COLLECTION_SHOW_INDEX_EVENT`，由测试集合清空 `activePath`；其他页面继续保持左滑回首页。手势预览文案在测试页同步显示“返回测试”。
- 预防：对内部状态模拟子页面的模块，导航手势不能只依赖浏览器 history，应复用模块自己的返回事件或显式回调。
- 验证：执行 `npm.cmd run check`、`npm.cmd run test:run -- src/features/workbench/components/WorkbenchHeader.test.tsx src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 剧情链右侧关联设定点击 X 后会自动恢复

- 现象：剧情链右侧 AI 对话框下方已经显示“已关联”，点击 X 取消关联后，界面仍然显示已关联，像是取消无效。
- 原因：章纲/剧情链关联读取存在默认继承逻辑；当关联 id 未显式配置时，会自动继承可读取设定或默认角色。清空后如果没有记录“用户已手动处理过关联”，默认继承又会把内容补回来。
- 处理：给关联读取配置增加手动处理标记；确认读取或点击 X 清空后写入该标记，并把设定、角色、章纲 id 清成空数组，后续不再自动继承默认关联。
- 预防：带默认继承的关联选择器必须区分“从未配置”和“用户主动清空”，不能只用空值判断，否则清空类按钮会被默认值回填。
- 验证：执行 `npm.cmd run check`、`npm.cmd run test:run -- src/features/workbench/components/WorkbenchHeader.test.tsx src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 作品编辑器 AI 配置需要统一为组合齿轮框

- 现象：测试页已经确认模型和提示词应放在同一个组合框里，标签旁使用标准齿轮；正式作品编辑器多个页面仍是上下两个独立选择框，状态页缺少同位置 AI 配置，脑洞页还用独立禁用提示词图标。
- 原因：组合框方案先落在测试页，没有抽成正式可复用控件；提示词禁用能力绑定在 CapsuleSelect 内部图标上，和新的组合框结构不一致。
- 处理：新增组合 AI 配置控件并替换作品编辑器内大纲、角色、脑洞、概要、章纲、剧情链、审核、点评的模型/提示词选择；状态页右栏同位置补充组合 AI 配置；提示词禁用改为右键提示词段弹出“禁用/启用”菜单。
- 预防：AI 配置视觉方案从测试页转正时要抽成共享控件，并同时迁移管理入口、禁用入口、输出日志相邻布局和状态页等后处理页面。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 右侧 AI 配置组合框需要模型和提示词管理入口

- 现象：组合后的模型/提示词下拉框顶部只有“模型”和“提示词”标签，用户希望在两个标签右侧各增加齿轮管理入口，并分别打开模型管理或提示词管理窗口。
- 原因：测试页先验证了模型和提示词合并成组合下拉框，但没有同步补回原来单独选择框里的管理能力入口。
- 处理：在组合下拉框的模型段和提示词段顶部边框位置各增加齿轮按钮；点击模型齿轮打开模型管理测试窗口，点击提示词齿轮打开提示词管理测试窗口。
- 预防：把两个配置控件合并成组合控件时，要同时保留每个分段原本的辅助操作入口，避免节省空间时丢失管理路径。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 大纲清空设定入口在左下角且需要顶部确认式组合按钮

- 现象：清空设定按钮放在左侧栏底部，和新建分类、新建设定入口距离较远；用户希望把“清空”放到顶部“新建 / 分类 / 设定”组合按钮最右侧，并防止误触。
- 原因：清空设定作为全局设定操作，早期按危险操作放到底部；移动到顶部后如果只是普通按钮，容易和分类/设定创建入口一样被误点。
- 处理：把清空设定入口移动到顶部同一组合条里，四段平均分配“新建 / 分类 / 设定 / 清空”；清空段使用红底白字，默认锁定且左键不可清空，悬停提示右键解锁，右键弹出仅含“解锁”的下拉菜单，解锁后才允许左键打开清空确认弹窗。
- 预防：大纲设定栏的同组全局操作应优先放在同一个组合条内；危险操作必须同时使用视觉警示、锁定状态、右键菜单解锁和清空确认弹窗，不要只靠位置隔离风险。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 右侧 AI 配置 A 方案齿轮点不开且预览有黑色说明条

- 现象：A 小齿轮展开行方案里，齿轮按钮看起来可以点击但没有展开配置；方案预览顶部还显示黑色说明框，挤占了右侧栏真实可用高度。
- 原因：测试页只把 A 方案画成静态展示，没有给齿轮绑定展开状态；预览面板又额外渲染了方案标题和说明条，和正式右栏结构混在一起。
- 处理：给 A 方案齿轮接入本地展开/收起状态，默认只露出宽度、模型简称和配置入口，点击后原地显示模型、提示词和输出日志；同时移除预览面板顶部黑色说明条。
- 预防：交互方案测试页里的按钮必须绑定对应状态或明确禁用；方案说明应留在测试页外层，不要占用模拟右侧栏内部空间。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 大纲设定新建入口文案重复

- 现象：大纲设定左侧顶部显示“新建分类 / 新建设定”两个完整按钮，文案重复，占用横向空间。
- 原因：创建分类和创建设定作为两个独立等宽按钮渲染，没有把共同动作“新建”抽成组合按钮前缀。
- 处理：改为组合按钮样式，左侧固定显示“新建”，右侧两个动作按钮分别显示“分类”和“设定”，原点击逻辑保持不变。
- 预防：同组操作有共同动词时，优先用组合控件减少重复文案，同时保持每个动作的点击目标清晰。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 大纲设定左侧分类和设定条目过高

- 现象：大纲设定左侧分类标题和分类下设定条目高度过大，同一屏只能看到较少内容。
- 原因：分类头使用 `py-2.5`，条目使用 `py-2`，外层分类间距为 `space-y-2`；没有固定高度变量，主要由内边距和行高撑开。
- 处理：分类头收紧为 `py-1.5`、`text-sm`、`leading-5`，条目收紧为 `py-1.5`、`leading-5`，分类间距从 `space-y-2` 降到 `space-y-1`，条目间距从 `space-y-1` 降到 `space-y-0.5`。
- 预防：侧边列表以信息密度为主，分类/条目高度调整应集中改列表容器的内边距、行高和间距，并同步说明当前近似高度。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 作品编辑器顶部脑洞入口顺序不符合当前流程

- 现象：作品编辑器顶部创作流程按钮显示为“脑洞、大纲、剧情链、章纲、正文”，用户希望“大纲”作为第一个入口，“脑洞”移动到“正文”右侧成为最后一个。
- 原因：顶部按钮顺序来自 `WORKBENCH_MAIN_FLOW_STEPS` 共享配置，旧顺序仍把 `brainstorm` 放在创作组第一位。
- 处理：调整 `WORKBENCH_MAIN_FLOW_STEPS` 为“大纲、剧情链、章纲、正文、脑洞”，同步更新步骤序号和 Header 顺序测试。
- 预防：顶部流程顺序只从共享流程配置派生；调整入口顺序时必须同步测试断言，避免只改视觉或只改单个页面。
- 验证：执行 `npm.cmd run test:run -- src/features/workbench/model/workbenchCreationFlow.test.ts src/features/workbench/components/WorkbenchHeader.test.tsx`、`npm.cmd run check`。

## 小说卡片点进去后工作台显示未选择作品

- 现象：干净数据下点击“默认小说1”后，顶部会出现作品标签并跳到工作台，但正文区域显示“未选择作品”，用户无法继续编辑。
- 原因：默认小说只由 `useNovelLibrary` 的 fallback state 创建，没有写回 `xinyuexia_novels_v1`；工作台 `useWorkbenchData` 只从 localStorage 读取作品库，因此找不到这个默认作品。
- 处理：新增 `readInitialNovels`，在首次生成默认小说时同步写入 `xinyuexia_novels_v1`；小说卡片点击先进入正式作品总览页，用户再从总览页进入正文编辑器。
- 预防：所有默认数据如果会被多个模块读取，必须在初始化时落到共享持久层；新增跨页入口时要用测试覆盖首次启动、默认数据和目标页面读取同一份数据的链路。
- 验证：`npm.cmd run test:run -- src/features/novels/hooks/useNovelLibrary.test.tsx`、`npm.cmd run test:run -- src/features/novels/pages/NovelOverviewPage.test.tsx`、`npm.cmd run check`。

## 清空脑洞回收站确认弹窗被回收站遮住

- 现象：在脑洞回收站里点击“清空回收站”后，确认弹窗出现在回收站弹窗后面，被回收站主体遮住。
- 原因：`ConfirmDialog` 虽然设置了 `z-[300]`，但它按普通 React 子树渲染，没有 portal 到 `document.body`；当父级页面或其他 portal 弹窗形成新的层级上下文时，确认弹窗会被脑洞回收站的 portal 层压住。
- 处理：`ConfirmDialog` 改为使用 `createPortal` 渲染到 `document.body`，让确认弹窗始终位于全局浮层栈中，`z-[300]` 能正确压过回收站 `z-[260]`。
- 预防：通用确认弹窗、二次确认弹窗这类“弹窗上的弹窗”必须进入全局 portal 层，不能依赖调用方所在 DOM 层级。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 脑洞用户要求固定说明过长

- 现象：脑洞输出日志的“用户要求”顶部显示较长固定说明，用户希望只保留一个明确分隔标题。
- 原因：`buildBrainstormPromptFromQuestions` 里把脑洞生成任务说明和生成要求固定拼进用户要求正文，导致日志里看起来不像纯用户输入。
- 处理：脑洞用户要求前缀改为 `【以下是用户输出的内容】`，后面继续只拼接实际填写过的字段。
- 预防：输出日志里的“用户要求”应尽量接近用户实际输入；任务规则更适合放在提示词里，不要混进用户输入展示区。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 脑洞输出日志显示无效关联内容和空用户要求

- 现象：脑洞生成并没有关联内容功能，但输出日志仍显示“关联内容 / 未关联”；当用户没有输入任何脑洞字段时，用户要求里仍显示固定模板说明。
- 原因：脑洞输出日志复用了通用日志分组，默认会渲染关联内容分组；`buildBrainstormPromptFromQuestions` 在没有字段时仍返回固定模板，日志对象也给空用户输入补了“无额外要求”兜底。
- 处理：脑洞日志调用通用日志时关闭关联内容分组；脑洞用户要求为空时不渲染用户要求分组；脑洞请求构建在没有已填字段时返回空字符串，日志侧栏也不显示空用户输入卡片。
- 预防：通用日志组件要按业务能力传入显式开关；没有该能力的页面不要显示“未关联”这类占位分组，空输入也不能用模板文案冒充用户请求。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 脑洞用户要求会发送未填写字段

- 现象：脑洞输出日志的“用户要求”会把主角金手指、你的构思、补充内容等空字段显示为“未填写”，看起来像用户实际输入了这些内容。
- 原因：`buildBrainstormPromptFromQuestions` 在拼接脑洞 AI 请求时，对每个字段都固定输出一行，空值用“未填写”占位；生成前确认弹窗也复用同样的占位展示。
- 处理：脑洞请求拼接改为只保留实际填写过的字段；确认弹窗同样过滤空字段，不再展示“未填写”。
- 预防：表单类 AI 请求不要把空字段用占位文本发送给模型；占位只属于输入框 UI，不应进入请求正文或输出日志。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 脑洞输出框露出 THINKING 内部标记

- 现象：脑洞输出框里显示 `[[THINKING seconds=... status=thinking]]`、`[[/THINKING]]` 这类英文内部标记。
- 原因：脑洞流式生成过程中 `aiResult` 可能保存了带思考块的中间文本；生成结束虽然会清理一次，但渲染输出框时没有像其他 AI 预览区一样再做展示层兜底过滤。
- 处理：脑洞输出框展示值统一经过 `stripAiThinkingBlock` 清理后再渲染和统计字数，历史残留或流式中间态都不会直接露出内部标记。
- 预防：所有直接展示 AI 原始输出的区域都要在渲染层做一次内部标记过滤，不能只依赖请求完成后的保存清理。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 脑洞切换后右侧输出框仍显示旧内容

- 现象：在脑洞页左侧切换不同脑洞时，中间“脑洞预览”会变化，但右侧“脑洞输出框”仍停留在上一次生成或上一次选中的内容；输出框上方还残留一行重复标题。
- 原因：脑洞列表点击只更新当前选中条目的 `selectedId`，右侧输出框取值仍来自当前 Tab 的 `aiResult/aiOutput`；页面化后右侧输出区域又保留了旧分区 header。
- 处理：脑洞列表点击时同步把当前脑洞正文写入脑洞 Tab 的 `aiResult`，并清空旧 `aiOutput`，让输出框跟随选中脑洞切换；删除右侧输出框上方重复标题栏，仅保留边框内标签。
- 预防：同一个内容在预览区和输出区同时展示时，切换选中项必须同步所有展示状态；页面边框标签已经承担标题语义时，不要再保留外层重复 header。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 状态页面化后仍显示旧弹窗关闭按钮

- 现象：作品编辑器顶部切到“状态”页面后，页面 header 右侧仍显示“关闭”按钮；状态已经是嵌入式页面，不应该再出现弹窗关闭入口。
- 原因：`ChapterEditor` 的状态更新视图同时服务旧弹窗模式和新的 `embeddedMode === 'status'` 页面模式，但 header 里的关闭按钮没有区分两种模式。
- 处理：关闭按钮改为仅在非嵌入模式渲染；顶部“状态”页面不再显示“关闭”，旧弹窗模式仍保留关闭能力。
- 预防：弹窗功能页面化时，所有关闭按钮、遮罩点击关闭和保存后关闭逻辑都要按嵌入模式与弹窗模式分别判断，避免旧弹窗控件残留到页面里。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 字段尺寸按钮分散在页面内部且位置不统一

- 现象：字段尺寸按钮在不同页面内部各自显示，位置不统一；用户希望移动到作品编辑器顶部右上角，只有当前页面有字段尺寸配置时才显示，正文页隐藏。
- 原因：`WorkbenchLibraryPanel` 和 `ChapterEditor` 各自维护字段尺寸弹窗入口，`WorkbenchHeader` 不知道当前流程是否支持字段尺寸，也没有统一触发当前页面弹窗的通道。
- 处理：`WorkbenchHeader` 新增右上角可选字段尺寸按钮；`WorkbenchPage` 按当前流程判断是否显示，并通过打开信号触发当前页面自己的字段尺寸弹窗；`WorkbenchLibraryPanel` 和 `ChapterEditor` 支持外部打开信号与隐藏内部按钮，避免重复入口；正文流程不在字段尺寸流程集合内，因此自动隐藏。
- 预防：跨流程的通用工具入口应放在流程外层统一控制显示，再把动作信号下发给当前页面；不要在多个业务页面里重复放同一个全局工具按钮。
- 验证：执行 `npm.cmd run check`、`npm.cmd run test:run -- src/features/workbench/components/WorkbenchHeader.test.tsx src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run build`。

## 审核点评状态串用且概要仍有旧弹窗入口

- 现象：审核、点评、状态、概要改成顶部页面后，审核和点评仍可能共用同一份 AI 输出、修订草稿和输出日志；正文里的概要按钮还会打开旧概要弹窗；状态页保存后仍执行旧弹窗关闭逻辑。
- 原因：`ChapterEditor` 里审核和点评沿用单套 `reviewAiOutput/reviewRevisedDraft/reviewRequestLog` 状态；`WorkbenchPage` 保留 `summaryLibrary` modal；状态保存逻辑没有区分嵌入页面和旧弹窗模式；顶部流程分组靠 Header 内部硬编码集合判断。
- 处理：审核和点评改为按 `ReviewMode` 分别保存输入、输出、修订稿、对比视图、已确认段落和请求日志；AI 流式输出固定写回发起请求时的模式；切换章节会清理旧输出和对比草稿；正文概要入口统一切换到顶部“概要”页面并删除旧概要弹窗；状态页嵌入模式保存后不再关闭页面；流程配置拆成主流程和后处理流程分组。
- 预防：把弹窗功能页面化时，要同时拆状态、入口、保存后的关闭行为和顶部流程数据结构；AI 流式回调必须绑定请求发起时的业务模式，不能依赖当前正在显示的模式。
- 验证：执行 `npm.cmd run check`。

## 细纲预览首个卡片顶部留白过大

- 现象：细纲预览区第一个细纲卡片上方留白偏高，红框处空隙显得浪费空间。
- 原因：细纲预览中间滚动容器复用了概要预览的 `pt-5` 顶部内边距，细纲卡片本身还有边框标签占位，叠加后顶部显得过空。
- 处理：仅在细纲模式下把中间滚动容器顶部内边距从 `pt-5` 调整为 `pt-2.5`，保留概要页原有间距。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 细纲关联入口仍显示为读取设定

- 现象：细纲里这个功能本质是把设定和前文细纲关联到本次 AI 请求，但按钮、弹窗、日志仍显示“读取设定”，语义不一致。
- 原因：早期实现按“读取”命名 UI 文案，后续逻辑已经接近关联功能，但可见文案没有同步改名。
- 处理：把细纲和剧情点相关入口、弹窗标题、输出日志分组、已关联统计、空状态和默认请求文案统一改为“关联设定/已关联”；底层字段名保持不变，避免破坏已保存的关联选择。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 细纲输出日志会自动读取当前章节正文

- 现象：打开生成细纲的输出日志时，日志里会出现“关联正文/所选章节正文”，看起来细纲请求会自动读取正文。
- 原因：生成细纲和章节概要共用了 `getOutlineAiContext` 与日志分组，细纲分支也把当前章节正文拼进 `contextText`，日志侧栏再统一显示“关联正文”。
- 处理：生成细纲分支不再自动拼接当前章节正文，只保留“读取设定/前文细纲”中用户主动选择的内容；输出日志在细纲模式下隐藏“关联正文”侧栏和“关联内容”分组。章节概要仍保留读取正文逻辑。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 角色详情分类框比角色名低一截

- 现象：角色详情同一行里，角色名、分类、存活/死亡没有水平对齐，分类框视觉上比角色名低一截。
- 原因：角色名是 44px 本体高度，但分类框的 `CapsuleSelect` 额外保留了顶部浮动标签预留，整块在布局里被算成更高的 56px，导致下沉。
- 处理：角色详情分类框取消顶部预留，并以角色名字段尺寸为基准，只保留和角色名相同的高度与字号，让同一行三块基线对齐。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 模型提示词选择框没有统一套用内嵌禁用图标样式

- 现象：测试页里的提示词选择框已经是边框标签、左侧禁用图标、右侧管理按钮的一体式样式，但正式页面仍有提示词禁用按钮独立占位，模型行还需要额外空列对齐。
- 原因：`CapsuleSelect` 只支持 `floatingLabel` 和 `actionLabel`，不支持内嵌禁用图标；禁用逻辑被 `WorkbenchLibraryPanel` 单独用 `PromptDisableButton` 拼在选择框右侧。
- 处理：给 `CapsuleSelect` 新增可选内嵌禁用开关；有禁用功能的提示词框把禁用图标放进选择框左侧，没有禁用功能的模型/提示词框不显示图标；删除独立禁用按钮和对齐空列。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 输出日志右侧内容缺少分组折叠测试

- 现象：输出日志右侧区域把提示词、关联内容和用户要求连续展示，内容很长时用户不能临时隐藏不想看的部分。
- 原因：日志展示层没有分组折叠状态，查看体验和实际发送 payload 绑得太紧，容易误以为隐藏内容会影响发送。
- 处理：在测试集合新增“输出日志折叠分组测试”，按“提示词 / 关联内容 / 用户要求”拆分折叠区，并保留“完整发送预览”证明折叠只影响查看、不影响发送给 AI。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 细纲输出日志看不出读取设定后的内容

- 现象：细纲输出日志虽然会把读取设定拼进 `Context`，但和所选章节正文混在一起，用户无法一眼确认读取设定后实际带了哪些内容。
- 原因：`buildOutlineAiRequestLog` 只保存完整 `contextText`，没有单独记录读取设定/前文细纲的上下文片段和字数。
- 处理：细纲日志新增“读取设定”侧栏卡片，显示已读取项数和字数；正文区新增“读取设定后的内容”，单独展示读取设定和前文细纲拼接后的实际内容。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 读取设定左侧导航树文字偏小

- 现象：读取设定弹窗左侧“设定导航”的分组名和设定名字号偏小，筛选时不够清楚。
- 原因：导航标题、分组按钮和条目按钮统一使用 `text-xs`，实际只有约 `12px`，和弹窗主体内容层级不匹配。
- 处理：把读取设定左侧导航标题、分组名、条目名放大到约 `15px`，计数放大到 `13px`，行高同步从 `32px` 提到 `40px`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 角色详情分类下拉框弹层偏左

- 现象：角色详情顶部“分类”选择框本身已经使用边框嵌入标签，但展开后的下拉菜单跑到左侧，未贴住分类框。
- 原因：该分类框没有“管理”按钮，`CapsuleSelect` 仍按普通选择框把下拉层 portal 到 `body` 并使用 fixed 坐标；在当前缩放/弹窗布局里坐标会被算偏。带管理按钮的模型/提示词选择框已走本地 absolute，所以没有同样问题。
- 处理：`CapsuleSelect` 对所有带 `floatingLabel` 的选择框都改成本地 absolute 下拉层；只有普通无浮动标签的选择框继续 portal 到 `body`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 测试页提示词禁用图标偏大

- 现象：测试页方案 G 的提示词禁用圆圈图标在选择框左侧占比偏大，压迫选中内容起点。
- 原因：内嵌禁用图标沿用了 `h-7 w-7` 和 `border-[3px]`，相对 48px 选择框显得过重。
- 处理：把内嵌禁用图标缩小约 20%，从 `28px` 改为 `22px`，斜线长度和粗细同步按比例收紧。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 提炼剧情模块编辑短字段高度过高

- 现象：提炼剧情页面的模块编辑短字段复用全局 `xy-floating-compact`，名称框视觉高度偏高，和页面里 `44px` 规格的紧凑行不一致。
- 原因：`xy-floating-compact` 是全局浮动输入框样式，适配范围较宽，直接改它会影响其他 AI 输入框和边框标签控件。
- 处理：给提炼剧情模块名称输入框增加 `xy-extract-compact-field` 专用样式，把 input 高度固定为 `44px`，并同步收紧圆角、左右 padding 和浮动标签字号。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 章节定位栏卷名和章节之间仍有箭头和中间线

- 现象：卷名“第一卷”和“第1章”之间还有向下箭头和贴合形成的中间分割线，用户只想保留一个空位。
- 原因：上一次为了让两个胶囊衔接，把卷名胶囊去掉右边框并让章节胶囊负 margin 贴上，同时卷名仍保留 `ChevronDown` 图标。
- 处理：删除卷名里的 `ChevronDown` 图标；卷名和章节改回两个独立圆角胶囊，去掉负 margin 和去右边框，只依赖父级 `gap` 留出空位。
- 验证：`npm.cmd run check`。

## 模型提示词选择框宽度不能按页面单独调节

- 现象：模型和提示词选择框统一改成 60% 后，部分页面仍会挤压文字；禁用按钮占用列宽也会影响提示词显示。
- 原因：字段尺寸配置只覆盖角色名、分类名、设定名等文本字段，没有覆盖三类生成面板的模型/提示词选择框；禁用按钮宽度固定 `52px`。
- 处理：字段尺寸新增设定、角色、脑洞三组模型框和提示词框配置；对应页面读取各自配置；禁用按钮列缩小为 `44px`，降低对提示词文本的挤压。
- 验证：`npm.cmd run check`。

## 读取设定弹窗缺少导航树且会读取后文细纲

- 现象：读取设定弹窗只有平铺列表，设定和细纲多了后不好找；生成第10章细纲时也会列出第10章之后的细纲。
- 原因：读取弹窗直接渲染全量设定/细纲列表，没有像设定页一样按分组生成左侧导航；细纲来源没有按当前章节序号过滤。
- 处理：弹窗改为左侧分组导航树加右侧列表；设定按类型分组，细纲按分卷分组；读取细纲只保留当前选中章节之前的章节。
- 验证：`npm.cmd run check`。

## 正文续写会话超过上限只禁用新增按钮

- 现象：会话按钮最多需要保留8个，但继续点击新增时应该弹窗询问是否清空，而不是无反馈或继续增加。
- 原因：新增会话逻辑使用固定 10 个上限，并直接禁用 + 按钮；没有确认弹窗来承接“清空后新开会话”的操作。
- 处理：会话上限改为 8；点击 + 且已达上限时弹出确认框，确认后调用清空逻辑新开空白会话。
- 验证：`npm.cmd run check`。

## UI库折叠状态不保存且打开渲染过重

- 现象：UI库打开时一次性渲染大量手动上传预览，体感偏慢；左侧导航或内容分组折叠后下次打开不会记住。
- 原因：折叠状态只存在组件内存，关闭后丢失；手动上传内容合并到 UI 后仍默认展开，首次进入就要渲染大量复杂预览。
- 处理：新增导航折叠和内容折叠 `localStorage`；手动上传区默认折叠，点击编号时会自动展开对应分组再滚动。
- 验证：`npm.cmd run check`。

## 大纲设定字段尺寸只能靠代码反复调整

- 现象：角色名、搜索角色、分类名字、设定名等短字段的高度、宽度和字号每次都需要通过代码修改，用户无法自己试到合适尺寸。
- 原因：真实大纲设定页面没有字段级尺寸配置入口，UI库里的规格配置只用于展示和收藏，没有写回 `WorkbenchLibraryPanel` 的实际字段。
- 处理：在大纲设定顶部新增“字段尺寸”按钮，打开弹窗后可分别调整搜索角色、分类名字、角色名字、角色名、设定名的宽度、高度和字号；配置写入 localStorage 并实时作用到对应字段。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 设定名输入框偏高且内容字偏小

- 现象：设定名输入框外框显得臃肿，内部设定名文字不够醒目。
- 原因：设定名复用了 `xy-floating-outline-fixed` 的默认输入框高度 `66px` 和 `1rem` 字号，这套尺寸更适合大输入区，不适合短名称字段。
- 处理：新增 `xy-floating-outline-setting-name` 专用样式，把设定名输入框高度降到 `56px`，圆角同步收敛，并把输入文字提升到 `1.125rem`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 设定名和设定预览边框标签间距过近

- 现象：设定名输入框底部和设定预览边框标签靠得太近，两块边框标签视觉上挤在一起。
- 原因：设定名区域和设定预览区域之间只保留 `mb-3`，边框标签自身会向上浮动，占用这段间距。
- 处理：把设定名区域底部间距从 `mb-3` 调整为 `mb-6`，选中设定和空状态保持一致。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 智能导入设定导入后不会自动锁定

- 现象：智能导入设定成功执行后，按钮仍然保持可点击状态，用户容易误以为还需要再点一次，或误触发重复导入。
- 原因：`smartImportLocked` 只由右侧锁按钮手动切换，`smartImportSettings` 在成功解析并写入设定后没有主动把锁定状态写回当前 Tab 配置。
- 处理：在智能导入成功 `persist` 之后调用 `updateActiveTabConfig({ smartImportLocked: true })`，让导入过一次后默认锁定；需要重新导入时再手动点击锁图标解锁。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 大纲设定 AI 对话框没有真正显示边框标签

- 现象：用户看不到“AI对话框”边框标签效果，清空虽然贴到了右上角，但输出区域本身仍然是普通 rounded border 容器。
- 原因：上一次只在普通相对定位容器上添加 `xy-floating-edge-tool`，没有把 AI 输出区域外层改为 `xy-floating-field / xy-floating-outline-preview` 结构，因此左上角标签不会出现。
- 处理：把大纲设定 AI 输出区外层改为 `xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview`，并把滚动内容放进 `xy-floating-rich-preview`；左上角补 `label=AI对话框`，右上角继续保留红色清空边框工具。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 大纲设定清空按钮占用下方操作区空间

- 现象：大纲设定 AI 输出框下方的红色“清空”按钮和智能导入、关联脑洞按钮挤在一起，占用操作区宽度，且距离要清空的输出框较远。
- 原因：清空操作属于 AI 输出框本身，但原先被放在输入框上方的普通按钮行里，没有复用边框嵌入工具的布局方式。
- 处理：把清空入口从下方按钮行移除，放到 AI 输出框右上角边框上，使用 `xy-floating-edge-tool` 形成边框标签效果，只保留“清空”两个字并使用红色文字。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 模型和提示词选择框在部分生成区仍然横向撑满

- 现象：大纲生成区的模型、提示词选择框已固定为区域宽度的 60%，但角色、脑洞和正文续写仍然横向撑满，看起来和大纲页不一致。
- 原因：大纲页只在 `SETTING_TAB` 下设置 `w-[60%]`；角色页有独立渲染分支，正文续写使用 `WorkbenchAIPanel` 的独立配置框，没有复用大纲页宽度规则。
- 处理：角色生成的模型/提示词行加 `w-[60%]`；脑洞生成纳入 `WorkbenchLibraryPanel` 的 60% 选择区判断；正文续写的顶部配置框改为 `w-[60%] max-w-full`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 大纲生成标题占位且输出日志离模型管理太远

- 现象：右侧配置区顶部显示“大纲生成”标题，占用一行空间；“输出日志”按钮放在右上角，和模型选择框里的“管理”按钮距离过远。
- 原因：大纲页复用了高级配置区的通用 header，把 `panelTitle` 和输出日志按钮统一放在顶部，而不是按大纲页的紧凑表单布局放在模型行。
- 处理：大纲页隐藏顶部 `panelTitle`，不再显示“大纲生成”；输出日志改为模型选择行的相邻按钮，放在模型管理右侧，脑洞页仍保留原顶部日志入口。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 技术词典只有文字没有展示

- 现象：UI库的技术词典只显示编号、大白话说明和技术名，缺少对应的界面缩略展示，用户不容易理解每个技术词具体代表什么效果。
- 原因：`TechItem` 渲染时使用纯文本栅格，没有为技术词典项提供可视化预览组件；收藏页里的技术词典也复用了同样的纯文本布局。
- 处理：新增 `TechPreview` 和 `TechDictionaryCard`，为 `T-01` 到 `T-19` 分别渲染小型界面示意，并让技术词典页和收藏页统一使用带展示区的卡片布局。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 边框嵌入标签顶部留白偏窄

- 现象：选择框边框嵌入标签上方预留只有 8px，标签和边框顶部靠得偏紧，视觉上不够透气。
- 原因：测试 mock 和正式带管理按钮的 `CapsuleSelect` 都使用 `pt-2` 作为浮动标签顶部预留，对应 8px。
- 处理：把浮动标签顶部预留从 `pt-2` 调整为 `pt-3`，对应 12px；测试页和正式 `CapsuleSelect` 同步更新。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 第04号测试选择框边框标签被裁切

- 现象：选择框边框标签测试里，“模型”“提示词”等嵌入边框的标签文字被上方裁掉，看起来像字被遮住。
- 原因：测试用 `FloatingLabelSelectMock` 把外层边框容器设置为 `overflow-hidden`，但标签是 `absolute` 放在边框线上并向上偏移，超出容器的上半部分被裁切。
- 处理：外层边框容器改为 `overflow-visible`，让边框标签可以完整露出；内部按钮行单独保留 `overflow-hidden` 和圆角，继续裁切按钮背景和管理按钮区域。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 测试集合缺少稳定编号且 UI 库入口不在第一位

- 现象：测试集合里每个测试没有数字编号，后续沟通只能按名称描述；UI库测试在第二组里，不在第一行第一位，用户需要先找入口。
- 原因：测试集合只按分组和标题渲染卡片，没有从全量测试顺序生成稳定编号；AI 链路测试组排在最前，导致 UI库无法取代第一张卡片。
- 处理：把 UI 与主题分组移动到第一组，并让 UI库成为 01 号测试；按全量测试列表顺序生成两位数字编号，卡片和打开后的测试标题都显示编号，搜索也支持按编号匹配。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 作品编辑器 Esc 没有关闭对象时缺少回首页兜底

- 现象：在作品编辑器页面按 Esc 时，如果当前没有弹窗或侧边浮层可以关闭，页面没有进一步反馈；用户希望这时直接跳回首页。
- 原因：Esc 只作为 `close_floating` 快捷键派发给页面内浮层关闭逻辑，`WorkbenchPage` 只关闭回收站和普通弹窗，没有处理“没有可关闭对象”的空状态。
- 处理：扩展 `WorkbenchPage` 的 `close_floating` 处理：先关闭快速导航、回收站、导出、查找、编辑设置、管理弹窗、关联章节和发布确认等可关闭层；如果都没有打开，则跳转到 `/dashboard`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 一键替换组合按钮顺序反了

- 现象：一键替换组合按钮从左到右显示为齿轮、开关、一键替换，和操作阅读顺序相反；用户期望一键替换在最左边，设置齿轮在最右边。
- 原因：组合按钮在增加设置入口时按“设置、开关、执行”的内部实现顺序渲染，没有按工具栏用户操作顺序排列。
- 处理：把一键替换组合按钮调整为“一键替换 / 开关 / 齿轮设置”，并复用分段按钮边框衔接方式，避免独立分隔线造成视觉杂点。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 章节工具栏组合按钮中间出现模糊阴影

- 现象：复制/优化组合按钮中间出现一块模糊的白色阴影，看起来像两个按钮没有干净衔接；审核、点评、状态三段按钮的视觉样式也不统一。
- 原因：组合按钮中间使用独立的竖线 div 作为分隔，在浅底按钮和蓝底按钮交界处会产生额外背景层和抗锯齿痕迹；审核、点评仍是描边样式，状态是蓝底样式。
- 处理：删除组合按钮内部独立分隔线，改为按钮自身 `border-l` 形成硬边界；审核、点评、状态统一为蓝底白字分段按钮，三段复用同一套高度、圆角和 hover 样式。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 章节右键菜单缺少修改入口

- 现象：右键点击章节时，弹出的菜单只有发布或删除等操作，没有直接进入修改当前章节的入口。
- 原因：章节侧栏和已发布侧栏的右键菜单只覆盖发布、撤回、删除这类状态操作，没有把“选择并编辑章节”作为显式菜单项。
- 处理：在未发布章节和已发布章节右键菜单顶部新增“修改章节”，点击后调用章节选择逻辑并关闭菜单，让正文编辑区切到该章节。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 章节定位栏卷名和章节之间留出多余分隔区

- 现象：顶部“第一卷 / 第1章”区域里，卷名和章节之间仍有一个分隔点或空白区，两个胶囊没有衔接起来；章节数字只有一位时也曾预留过宽。
- 原因：章节序号 input 最初固定使用 `w-8`，后来虽然改为 `ch` 自适应，但卷名胶囊和章节胶囊之间仍保留了独立分隔符和父级间距。
- 处理：章节序号 input 继续按 `String(serialValue).length` 计算 `ch` 宽度；删除卷名和章节之间的分隔符，卷名胶囊去掉右边框，章节胶囊用负 margin 接上，形成连续区域。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## UI库软件 UI 和手动上传拆成两个入口

- 现象：UI库里“软件 UI”和“手动上传”分成两个 Tab，查找 UI 编号时需要在两个入口之间切换，左侧编号导航也没有一个可折叠的统一 UI 分类。
- 原因：手动上传的 UI 样式按来源单独成页，软件内置 UI 按标准样式成页，导航只按当前 Tab 扁平列出编号。
- 处理：把手动上传内容合并到 `UI` Tab，顶部 Tab 改为 `UI / 技术词典 / 收藏`；左侧编号导航增加可折叠的顶层分类，UI 编号统一收进“UI”分类。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 正文续写 AI 对话框边框工具和上方区域挤压

- 现象：正文续写里 AI 对话框的边框标签贴近上方模型/提示词选择区，`AI对话框` 文案占住左上角，`+`、删除、清空都挤在右上角，并且单个空会话时不显示 `1` 号会话按钮。
- 原因：会话工具被统一放在右上 `xy-floating-edge-tool`，左上仍保留标题标签；之前为了“清空像黑板擦”隐藏了单空会话序号，但现在会话切换需要始终显示当前序号。
- 处理：删除 AI 对话框边框标签，把左上角改为会话控制区，始终显示 `+` 和当前会话序号；右上角只保留删除/清空；聊天框上边距从 `mt-3` 增加到 `mt-5`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 测试导航在测试内容页不能返回测试总页

- 现象：在“测试”总页点击某个测试内容进入内嵌测试页面后，再点击左侧导航里的“测试”没有回到测试总页，只能点左上角返回。
- 原因：测试内容是在 `TestCollectionPage` 内部通过 `activePath` 切换的，浏览器路由仍是 `/test-collection`；左侧导航再次跳到同一路由时不会重置组件内部状态。
- 处理：新增 `TEST_COLLECTION_SHOW_INDEX_EVENT`，`TestCollectionPage` 监听该事件并清空 `activePath`；左侧导航点击当前 `/test-collection` 时派发事件，让“测试”导航成为返回测试总页入口。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 正文续写会话工具条没有融入 AI 对话框边框

- 现象：正文续写聊天区域上方有独立的胶囊工具条，新增会话、序号、删除、清空和下方聊天框分成两层，视觉上不够像 UI141 的边框嵌入工具。
- 原因：会话工具条单独渲染在模型/提示词配置区下方，聊天记录框仍是普通灰底边框，字数统计也使用独立浮层样式。
- 处理：移除独立工具条，把聊天记录框改为 `xy-floating-outline-fixed` + `xy-floating-rich-preview`，并将新增会话、序号、删除、清空收进 `xy-floating-edge-tool` 右上角边框工具，字数统计复用 `xy-floating-count`。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 启动器会闪出 CMD

- 现象：双击启动器时会短暂弹出 CMD 窗口。
- 原因：启动链路里混用了 `cmd.exe`、Vite 和 Electron。
- 处理：统一改为根目录 `launch-xinyuexia.mjs` 托管，`start-xinyuexia.vbs` / `start-xinyuexia-web.vbs` / `start-xinyuexia-dist.vbs` 只做静默调用。
- 验证：`web / desktop / dist` 三种模式都已能从根级脚本拉起。

## 开发版启动器无法启动

- 现象：用户反馈 `新月下开发版软件启动器.vbs` 无法启动。
- 原因：
- 旧版 VBS 直接调用 `node.exe`，依赖系统 PATH，双击场景下不稳定。
- 启动脚本和 Vite / Electron 共用一个日志文件，Windows 下会出现 `EBUSY` 文件锁。
- 处理：
- VBS 改为优先查找绝对 Node 路径，再调用根目录 `launch-xinyuexia.mjs`。
- 启动日志拆分为 `launcher.log`、`dev-server.log`、`electron-dev.log`，避免文件锁死。
- `dist` 模式也纳入同一套根级启动脚本。
- 验证：
- `node launch-xinyuexia.mjs web`
- `node launch-xinyuexia.mjs desktop`
- `node launch-xinyuexia.mjs dist`

## 启动日志已补强

- 现象：之前只能看到“没启动”，无法区分卡在 Vite、PID 文件还是 Electron。
- 处理：启动脚本记录模式、根目录、端口、Node 版本、Vite PID、Electron PID 和 PID 清理结果。
- 结果：排查时可以直接查看 `launcher.log`、`dev-server.log` 和 `electron-dev.log`。

## 提炼剧情刷新报错

- 现象：`/extract` 刷新后曾出现 React Hook 相关报错。
- 原因：第三方拖拽库与热更新冲突。
- 处理：改成项目内原生拖拽实现，并增强长按拖拽和跨区提示。
- 验证：`npm run verify` 通过。

## 旧入口对齐

- 现象：新项目里部分旧入口缺失，或只有占位页。
- 处理：补齐 `tag-zone`、`call-data`、`button-test`，并保留 `/script-editor-v2` 独立入口。
- 验证：路由都可正常打开。

## 工作台占位文案清理

- 现象：工作台信息弹窗里保留了旧版占位文案。
- 处理：改成真实作品信息、时间、位置和简介展示。
- 验证：`WorkbenchPage` 可直接显示真实作品数据。

## 首页和导航假入口

- 现象：首页“编辑工作台 / 卡片设置”和左侧“导航设置”之前没有实际功能。
- 处理：补了首页卡片设置弹窗、导航设置弹窗，并加上顺序调整、显隐和恢复默认。
- 验证：页面入口可直接使用。

## 作品库空按钮

- 现象：作品卡片设置、封面、导入、导出、回收站刷新等按钮最初只是空壳。
- 处理：补齐作品卡片设置、封面编辑、单作品导出、JSON 导入和回收站刷新。
- 验证：`NovelLibraryPage` 已形成完整链路。

## Electron 生产态打包

- 现象：最初只有开发态 Electron 壳，没有正式桌面交付链路。
- 处理：
- `electron/main.cjs` 同时支持开发态 URL 和本地 `dist`。
- 新增 `desktop:dist`、`pack:win`。
- `electron-builder` 使用本地 `node_modules/electron/dist`。
- 关闭 `signAndEditExecutable`，绕开当前机器的签名链权限问题。
- 验证：
- `npm run verify` 通过。
- `npm run pack:win` 成功。
- 产物输出到 `release/新月下写作 0.1.0.exe`。

## PowerShell 中文乱码

- 现象：`Get-Content` 输出中文时会显示为乱码。
- 原因：PowerShell 控制台编码显示问题，不代表源文件损坏。
- 处理：优先用 TypeScript / Vite 校验文件，不只看控制台输出。
- 验证：页面功能正常，构建通过。

## 标题栏拖动路径冲突

- 现象：最大化后拖动标题栏不稳定，拖动弹窗时可能带动主窗口退出最大化。
- 原因：标题栏同时使用 Electron 原生 `-webkit-app-region: drag` 和前端 pointer + IPC 的模拟拖动，两套逻辑会互相抢事件。
- 处理：只保留 Electron 原生 drag region；删除前端 titlebar drag IPC 调用、preload 暴露和主进程 handler。
- 验证：`npm.cmd run check:electron`、`npm.cmd run check`。

## PostgreSQL 运行数据被 Git 跟踪

- 现象：`shujuku/postgres-data` 下的 `pg_control`、`pg_wal`、`pg_internal.init` 等运行文件频繁出现在 Git 状态里。
- 原因：数据库运行目录曾被加入 Git 索引，后续只补 `.gitignore` 不会停止跟踪已入库文件。
- 处理：`.gitignore` 增加 `shujuku/postgres-data/**`，并执行 `git rm -r -f --cached --ignore-unmatch shujuku/postgres-data`，保留本地真实数据文件。
- 验证：`git ls-files shujuku/postgres-data` 应为空。

## 清空会话不是完整新上下文

- 现象：正文续写点击清空后仍显示 1 号会话，看起来只是清掉内容，不像新开空白上下文。
- 原因：`resetSessions` 固定创建 `id=1` 的默认会话，单会话也渲染序号按钮；外部关联上下文和上一次输出日志没有一起断开。
- 处理：清空时使用下一个会话 id 创建新的空会话，清除输入、输出、消息、关联状态、外部关联上下文和上一次请求日志；单个空白会话不显示序号按钮。
- 验证：点击清空后输入区为空，未继承本章或上下文关联，输出日志不再显示上一次请求，且不显示单个会话序号。

## 错误日志没有入口

- 现象：`ErrorLogPage` 已有默认问题记录，但软件里找不到入口。
- 原因：页面组件没有挂到路由，也没有加入测试集合。
- 处理：新增 `/error-log` 路由，并在测试集合加入“错误日志”入口。
- 验证：测试集合中可以打开错误日志。

## webview 弹窗和外部链接边界过宽

- 现象：内置浏览器和剧本浏览器允许 `allowpopups`，主窗口 `window.open` 会直接交给系统打开，webview ref 使用 `any`。
- 原因：内置网页能力默认放得过宽，类型边界也没有收口。
- 处理：移除 webview 的 `allowpopups`；主进程只允许 `http:`、`https:`、`mailto:` 外部打开；补 `ElectronWebviewElement` 类型。
- 验证：`npm.cmd run check`。

## 模型提示词选择框标签和内容上下堆叠

- 现象：带“模型”“提示词”边框标签的选择框变高，标签和当前选中内容看起来像上下两行，截图中 `模型 / GPT5.5`、`提示词 / 生成细纲` 不够一体。
- 原因：`CapsuleSelect` 的复合选择框固定使用 `h-12`，忽略调用方传入的 `h-9/h-10/h-11`；标签字号偏大，按钮内容没有显式垂直居中，管理按钮右侧定位也没有按真实高度统一。
- 处理：复合选择框根据 `buttonClassName` 里的高度选择真实外框高度；边框标签降为小号并与选中内容左边对齐；内容按钮改为 flex 垂直居中；管理按钮恢复贴住真实右边界。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 章节概要中间标题重复且边框标签顶线

- 现象：章节概要弹窗中间预览区上方又显示一行“章节概要”，下方卡片已经用边框标签显示“第X章概要（第X卷）”，两层标题挤在一起。
- 原因：概要预览复用了外层 `outlinePreviewTitle` 标题，同时卡片标题已经嵌入边框；删除外层标题后如果不补顶部内边距，第一张卡片的边框标签会贴到滚动区顶部。
- 处理：章节概要/细纲预览中间栏统一不渲染外层预览标题，只保留卡片边框标签；滚动区顶部固定留出边框标签空间。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 细纲空内容卡片过高

- 现象：细纲预览里没有内容的章节卡片仍然占用完整高度，一屏只能看到很少章节。
- 原因：章节细纲 textarea 固定使用 `h-[260px]`，不区分空内容、短内容和长内容；滚动条也使用常规编辑器滚动条，空内容时视觉上显得很重。
- 处理：细纲卡片空内容高度改为原来一半；有内容时按估算行数撑开，最高仍为原来的 260px；超过高度后在 textarea 内部滚动，并复用 `scrollbar-scroll-only`，平时隐藏滚动条，滚动时短暂显示滑块。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 已发布栏缺少内部分割线

- 现象：展开已发布章节后，未发布栏和已发布栏之间只有普通边线，不能直接拖拽调整两栏宽度。
- 原因：章节侧栏原来只有 `chapterSidebarWidth` 一套宽度状态，已发布栏固定为 190px，分割线只放在章节区和正文编辑器之间。
- 处理：给已发布栏增加独立宽度状态和 `xinyuexia_published_sidebar_width` 记忆；未发布/已发布之间新增红色悬停分割线，外侧分割线在已发布展开时改为调整已发布栏。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 标题复制和优化按钮占用过宽

- 现象：复制标题、标题优化作为两个独立按钮横向占位偏大，并重复显示“标题”两个字。
- 原因：同一对象的相邻操作被拆成两个完整按钮，文案没有利用标题输入框这一上下文。
- 处理：合并为分段组合按钮，左侧“复制”、右侧“优化”，保留复制和打开标题优化弹窗的原有逻辑。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 章节序号输入框预留过宽

- 现象：顶部“第一卷 / 第1章”区域里，章节数字只有一位时仍占用较宽空间。
- 原因：章节序号 input 固定使用 `w-8`，相当于为多位数字提前留白。
- 处理：章节序号 input 改为按数字位数设置 `ch` 宽度，一位数只占一位空间，两位、三位、四位时再自然撑开；同时收紧“第/章”和数字之间的间距。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 审核点评和状态按钮割裂

- 现象：审核、点评已是组合按钮，但更新状态单独放在右侧，占用额外横向空间。
- 原因：同一层级的章节辅助操作没有合并，更新状态文案也偏长。
- 处理：把更新状态并入审核/点评组合按钮，形成“审核 / 点评 / 状态”三段按钮，状态段保留品牌色强调。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 设定库左侧新建区留白过高

- 现象：新建分类、新建设定按钮上方和下方留白偏高，核心设定列表被向下挤。
- 原因：左侧栏统一使用 `p-4`，且新建按钮和分类列表之间使用 `mt-5`，在窄弹窗里垂直空间浪费。
- 处理：左侧栏改为 `px-4 pb-3 pt-2`，按钮到分类列表的间距从 `mt-5` 收窄为 `mt-2.5`，保留按钮本身点击高度。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 大纲生成选择框过长

- 现象：大纲生成右侧的模型和提示词选择框横向撑满整块区域，视觉上过长。
- 原因：右侧配置区复用了通用模型/提示词选择布局，默认占满整行，没有按大纲生成区域比例收窄。
- 处理：仅在大纲生成页，把模型和提示词选择框外层宽度固定为父区域的 60%；其他脑洞、细纲、概要等区域保持原布局。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 智能导入设定重复生成

- 现象：大纲设定里点击“智能导入设定”后，再误点一次会生成同名同分类的重复设定。
- 原因：智能导入逻辑每次都把解析出的设定片段直接新增到列表前面，没有按分类和设定名检查已有条目。
- 处理：导入时按“分类 + 设定名”查找已有设定；已存在且内容相同则复用旧条目，内容不同则更新旧条目，不存在时才新增。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 选择框箭头占位过宽

- 现象：带管理按钮的模型或提示词选择框里，箭头离管理按钮偏远，选中内容过早截断。
- 原因：`CapsuleSelect` 的 inline action 箭头热区使用 `w-9/w-10`，箭头中心偏左，占用了文本显示空间。
- 处理：缩窄带管理按钮选择框的箭头热区，`h-9/h-10/h-11` 使用 `w-6`，`h-12` 使用 `w-7`，让箭头靠近管理按钮并给文本释放空间。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 大纲设定 AI 输出框缺少边框标签

- 现象：大纲设定右侧 AI 输出区域顶部有空白位置，但没有像设定预览那样显示边框嵌入标题。
- 原因：AI 输出区域仍使用旧的 `xy-floating-label-fixed` 样式，标签不嵌入边框。
- 处理：把 AI 输出区域改为 `xy-floating-outline-fixed`，标签文案改为“AI对话框”，复用设定预览的边框嵌入标签技术。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 提示词禁用图标嵌入测试

- 现象：提示词禁用功能放在选择框右侧独立按钮时，会挤压提示词名称显示空间。
- 原因：禁用状态作为外部按钮参与网格布局，占用了原本可用于显示选中提示词的宽度。
- 处理：在测试页新增“禁用图标嵌入选中内容左侧”方案，把禁用圆圈放进选择框内部、选中内容左侧，点击图标复用原禁用切换逻辑。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 角色详情角色名输入框过高

- 现象：角色详情里的“角色名”输入框比左侧搜索角色输入框高很多，显得臃肿。
- 原因：详情区角色名只使用 `xy-floating-outline-fixed`，默认 input 高度为 66px；搜索角色使用了 `xy-floating-outline-role-compact`，高度为 44px。
- 处理：给详情区角色名输入框补上 `xy-floating-outline-compact` 和 `xy-floating-outline-role-compact`，使高度、圆角和字号与搜索角色一致。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 角色详情分类选择框标签外置

- 现象：角色详情里的“分类”文字放在选择框外侧，和模型、提示词这类边框嵌入标签选择框不一致。
- 原因：分类字段使用外置 label + CapsuleSelect 普通模式，没有启用 `floatingLabel`。
- 处理：移除外置“分类”文字，把分类选择框改为 `CapsuleSelect floatingLabel="分类"`，复用模型/提示词选择框的边框嵌入标签方式。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 边框字数统计像浮动胶囊

- 现象：部分输入框右下角的“0字”留白偏大，看起来像一个浮动小胶囊，而不是嵌入边框的文字。
- 原因：`xy-floating-count` 的左右 padding 和 line-height 偏大，白底遮罩区域视觉上过厚。
- 处理：缩小 `xy-floating-count` 的左右留白和行高，去掉圆角和阴影，并微调右侧位置，让字数统计更像贴在边框上的纯文本。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 读取设定弹窗设定和细纲标签顺序不符合预期

- 现象：读取设定弹窗顶部标签顺序是“设定、细纲”，用户希望调换为“细纲、设定”。
- 原因：读取设定弹窗的标签按钮按 `settings` 再 `outlines` 的顺序硬编码渲染。
- 处理：调整按钮渲染顺序为 `outlines` 在前、`settings` 在后；保留原有 tab state 和内容切换逻辑。
- 预防：只改标签顺序时不要改 tab key 或数据源，避免文字换了但内容映射错误。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 读取设定里的剧情大纲被强制默认读取

- 现象：读取设定弹窗里“剧情大纲”自动勾选并显示默认读取，用户无法取消，只能被强制一起发送给 AI。
- 原因：读取设定条目用 `/剧情大纲/` 标记 `required`，并在 `selected`、`clear`、`confirm`、`toggle` 逻辑里始终合并 required id。
- 处理：移除剧情大纲 `required` 标记；`selected` 只读取用户保存的选择；清空不再保留剧情大纲；确认不再强制合并；界面文案改为可按需求勾选或取消。
- 预防：默认读取和强制读取必须是明确需求；可选上下文项不要在 `selected/confirm` 多处硬合并，否则 UI 上取消也不会真正取消。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 细纲预览滚动条没有落在右侧空白带

- 现象：细纲中间预览区的滚动条贴在内容卡片右侧，没有移动到预览区和右侧分割线之间的空白位置。
- 原因：滚动容器放在 `main` 的 padding 内容盒内，滚动条只能出现在 padding 左侧边界，右侧 padding 形成空白带但滚动条进不去。
- 处理：细纲模式下给中间滚动容器增加 `-mr-4` 和 `pr-4`，让滚动条向右进入空白带，同时保留内容到滚动条的间距。
- 预防：需要把滚动条放入内边距空白区时，要扩展滚动容器自身宽度，单纯调整内容 padding 不会改变滚动条位置。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 组合按钮固定宽度后右侧出现空白

- 现象：审核、点评、状态组合按钮右侧出现一块空白，像是状态按钮后面还有一个空按钮。
- 原因：字段尺寸给组合按钮外框设置了固定宽度，但内部按钮按文字内容宽度排列，没有 `flex` 填满剩余空间。
- 处理：组合按钮 action class 增加 `flex-1`，让每个子按钮按比例填满父容器，固定宽度时不会在右侧留下空白。
- 预防：可调宽度的组合按钮内部子项必须参与 `flex` 分配，不能只按内容宽度排布。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 剧情点独立窗口没有参考生成细纲布局

- 现象：生成剧情点已经独立打开，但内容仍是小型生成框布局，没有像生成细纲一样保留章节目录、预览区和右侧生成区。
- 原因：`plotPointStandalone` 模式直接渲染剧情点 overlay，而不是复用细纲页面主体布局，只解决了双层弹窗问题，没有满足“参考生成细纲布局”。
- 处理：`plotPointStandalone` 改为复用细纲三栏主体布局，隐藏顶部细纲页签；右侧生成任务改为剧情点，窗口标题保持“剧情点”。
- 预防：用户说“参考某弹窗布局”时，应保留该弹窗的信息架构，只替换业务任务和标题，而不是改成另一种紧凑弹窗。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 生成剧情点按钮误打开细纲窗口

- 现象：点击生成剧情点时先打开“细纲”大窗口，再在细纲窗口上叠加剧情点弹窗，看起来像把细纲也弹出来了。
- 原因：顶部生成剧情点按钮复用了 `detailOutlineLibrary` modal，只通过 `openPlotPointSignal` 在细纲窗口内自动弹出剧情点层。
- 处理：新增独立 `plotPointGenerator` modal，标题改为“剧情点”；`WorkbenchLibraryPanel` 增加 `plotPointStandalone` 模式，只渲染剧情点生成布局，不渲染细纲目录和细纲编辑区。
- 预防：“参考某页面布局”不等于复用该页面弹窗；独立功能入口应使用独立 modal key 和独立渲染模式。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 审核点评状态按钮没有完全复用复制按钮样式

- 现象：审核、点评、状态按钮外框接近复制按钮，但文字颜色仍与复制按钮不一致。
- 原因：按钮使用了另一套近似 class，虽然背景和边框改成了白底蓝边，但字体 class 没有直接复用复制按钮的 `SPLIT_BUTTON_OUTLINE_ACTION_CLASS`。
- 处理：审核、点评、状态组合按钮改为直接使用 `SPLIT_BUTTON_OUTLINE_GROUP_CLASS` 和 `SPLIT_BUTTON_OUTLINE_ACTION_CLASS`，保证边框、背景、hover 和字体颜色与复制按钮一致。
- 预防：要求“和某按钮一样”时应直接复用已有 class 或组件，不要复制一套近似样式后再逐项修。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 提示词禁用图标导致标签和模型不对齐

- 现象：带禁用按钮的提示词选择框里，“提示词”标签没有和“模型”标签左对齐，禁用图标还占在标签前面。
- 原因：`CapsuleSelect` 在存在禁用按钮时把浮动标签 `left` 改到 `58px`，并把禁用按钮放在控件最左侧，导致标签和内容整体被错位。
- 处理：浮动标签统一使用 `left-5`；禁用按钮从最左侧移动到选中内容右侧、箭头左侧，既保留禁用入口，也不影响模型/提示词标签对齐。
- 预防：浮动标签的起点不能跟随内部按钮变化；禁用、箭头、管理这类操作区应放在文本右侧，避免破坏标签层级。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 生成剧情点按钮放错到细纲弹窗内部

- 现象：生成剧情点按钮被放在细纲页读取设定旁边，而不是作品编辑器顶部“大纲设定”和“生成细纲”之间。
- 原因：把“生成细纲左侧”理解成细纲弹窗内部读取设定区域，实际目标是作品编辑器顶部导航按钮顺序。
- 处理：在 `WorkbenchHeader` 中新增“生成剧情点”导航按钮，位于“大纲设定”右侧、“生成细纲”左侧；点击后打开细纲窗口并自动弹出剧情点弹窗，同时移除细纲页内部重复入口。
- 预防：涉及“按钮左侧/右侧”的需求要先确认所在容器是顶部导航、页面工具栏还是弹窗内部，不要只按功能所在模块放置。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 审核点评状态组合按钮样式和复制按钮不一致

- 现象：审核、点评、状态三个按钮显示为整块蓝底，和旁边复制按钮的白底蓝边风格不一致。
- 原因：审核点评状态组合按钮使用了 filled group/action class，分割线也使用白色半透明边线。
- 处理：把组合按钮改为白底、蓝色边框、蓝色文字和浅蓝 hover；中间分割线改为品牌蓝，视觉与复制按钮保持一致。
- 预防：同一工具栏里的组合按钮应复用同一视觉语义；新增 filled 样式前先确认是否需要和复制/优化组保持一致。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 细纲概要和审核点评缺少字段尺寸入口

- 现象：字段尺寸只能调大纲设定、角色、脑洞等区域，生成细纲、章节概要、审核点评的模型/提示词框，以及作品编辑器顶部审核点评状态按钮无法调整。
- 原因：字段尺寸 key 只覆盖 `WorkbenchLibraryPanel` 的设定/角色/脑洞分支，细纲概要右侧配置和 `ChapterEditor` 审核点评配置没有接入同一存储逻辑。
- 处理：给细纲和概要新增独立模型框/提示词框尺寸 key；作品编辑器新增字段尺寸弹窗，放在审核点评弹窗输出日志右侧，并覆盖审核点评状态组合按钮、审核模型框、审核提示词框和点评提示词框。
- 预防：新增 AI 配置区时要同时检查模型框、提示词框、输出日志旁字段尺寸入口和页面级字段分组，不能只给大纲设定页接入尺寸设置。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 角色搜索按钮被挤成两行

- 现象：侧栏宽度较窄时，“搜索”按钮被 `flex` 压缩，两个字上下换行显示。
- 原因：搜索按钮没有设置 `shrink-0`、`whitespace-nowrap` 或最小宽度，和可调宽度输入框放在同一行时会被压缩。
- 处理：给搜索按钮增加 `shrink-0`、`whitespace-nowrap` 和 `min-w-[64px]`，保证“搜索”始终单行显示。
- 预防：侧栏里的短文本按钮如果和可调宽度输入框同排，要固定不收缩并禁止换行，避免中文按钮逐字换行。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 细纲页缺少独立生成剧情点入口

- 现象：生成细纲前无法先单独生成剧情点，只能把剧情点要求混在细纲输入框里。
- 原因：细纲页只有读取设定和生成细纲输入框，没有并列的剧情点生成弹窗，也没有复用细纲读取设定上下文。
- 处理：在细纲页读取设定左侧新增“生成剧情点”按钮；弹窗复用当前细纲模型、提示词、当前章节正文、读取设定和前文细纲，可生成、复制或放入细纲要求。
- 预防：细纲相关的辅助生成入口应复用同一套读取设定和前文细纲上下文，避免出现一个按钮读得到设定、另一个按钮读不到设定的分叉逻辑。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 字段尺寸弹窗混入其他页面字段

- 现象：从设定页面打开字段尺寸时，弹窗里同时显示角色短字段、角色名、分类、角色模型框、脑洞模型框等其他页面字段。
- 原因：字段尺寸弹窗直接遍历全量 `WORKBENCH_FIELD_SIZE_DEFAULTS`，没有按当前 `activeTab` 过滤可配置字段。
- 处理：按设定、角色、脑洞建立字段尺寸 key 分组；弹窗根据当前页面只渲染对应分组，标题同步显示当前页面名称。
- 预防：跨页面共享设置弹窗要区分保存全集和展示子集；新增字段尺寸 key 时必须加入对应页面分组，避免污染其他页面的设置入口。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 大纲设定角色短字段尺寸重复且新建按钮间距过大

- 现象：搜索角色、分类名字、角色名字需要分别调尺寸；分类名字和角色名字右侧的新建按钮被 `grid` 推到很远，输入框和按钮之间空隙明显。
- 原因：三个短输入框分别暴露了独立字段尺寸 key；新建分类/新建角色区域使用 `grid-cols-[1fr_84px]`，固定宽度输入框不会填满 `1fr` 列，按钮仍贴在最右列。
- 处理：字段尺寸弹窗只保留“角色短字段”一个设置；搜索角色、分类名字、角色名字共用 `roleSearch` 尺寸；新建分类/新建角色两行改成 `flex + gap-2`，让按钮紧贴输入框。
- 预防：同一类短字段要优先复用一个尺寸入口；固定宽度控件旁边如果有按钮，避免用 `1fr grid` 把按钮推到容器最右侧。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 角色详情分类下拉框没有纳入字段尺寸

- 现象：大纲设定里“字段尺寸”可以调搜索角色、分类名字、角色名字、设定名，但角色详情顶部的“分类”下拉框仍保持固定宽高，截图里的分类框看起来没有被修复。
- 原因：上一轮字段尺寸只覆盖了输入框类字段，角色详情的分类使用 `CapsuleSelect floatingLabel="分类"`，没有独立的字段尺寸 key，也没有让 `CapsuleSelect` 接收尺寸样式。
- 处理：新增 `roleDetailCategory` 字段尺寸配置，并让 `CapsuleSelect` 支持 `style`；给角色详情分类下拉框套用 `xy-capsule-custom-field-size`，通过 CSS 变量同步宽度、高度和字号。
- 预防：以后把某个字段加入“字段尺寸”时，要同时确认输入框、下拉框、按钮式选择框是否都覆盖到，不能只按字段文字判断。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 细纲生成缺少读取设定和前文细纲

- 现象：细纲右下角只能输入要求并读取当前章节正文，无法把大纲设定里的剧情大纲或已有前文细纲一起发给 AI，导致 AI 生成细纲时缺少设定依据。
- 原因：细纲生成分支的 `sendOutlineAiMessage` 只调用 `getSelectedOutlineContext`，把所选章节正文作为 `chapterContext`，没有类似关联脑洞或关联上下文的读取弹窗和持久化选择。
- 处理：在细纲输入框上方新增“读取设定”按钮；弹窗提供“设定/细纲”切换；设定里的“剧情大纲”默认勾选且不能取消；确认后把选中设定和细纲拼入 `getOutlineAiContext`，再作为 `callModelStream` 的 `chapterContext` 发送。
- 预防：以后新增关联/读取按钮时，要同时检查 UI 选择、默认必选项、输出日志预览和实际 `callModelStream/callModel` 参数，避免只做选择弹窗而没有进入 AI 请求。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## UI库编号导航只显示一个 UI 总分类

- 现象：UI库左侧编号导航把字体、颜色、按钮、输入框等所有条目都折叠到一个“UI”分类里，用户无法按“字体设置、颜色记录、按钮样式”等具体类型查找。
- 原因：`catalogNavGroups` 按 tab 粗略分组，把 `ui` tab 全部命名为 UI，`collection` tab 全部命名为收藏，丢失了每条记录自身的 `group` 信息。
- 处理：编号导航改为按条目自身 `group` 聚合；字体映射为“字体设置”，颜色映射为“颜色记录”，按钮映射为“按钮样式”；搜索和收藏状态也复用同一套具体分类。
- 预防：UI库左侧导航应服务查找编号，优先使用可操作的 UI 类型分类，不能只按页面 Tab 作为导航分组。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 字段尺寸数字全选后输入会拼接旧值

- 现象：字段尺寸弹窗里宽度原本是 220，全选后输入 5，输入框会变成 520，像是没有真正替换选中的旧数字。
- 原因：原控件使用受控的 `type=number`，输入过程中父级状态同步会让浏览器的选区和光标状态被重置，导致替换输入被当成插入输入。
- 处理：字段尺寸数字框改为 `text + inputMode=numeric`，并增加本地草稿值；编辑时只更新草稿，失焦或回车时再按宽度/高度/字号各自范围归一化并写入设置。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 角色新建按钮被字段尺寸输入框挤出隐藏

- 现象：分类名字和角色名字输入框右侧的新建按钮只露出“新建”，后半段被右侧容器裁掉。
- 原因：字段尺寸配置给输入框写入固定 `width`，左侧栏宽度不足时输入框仍按配置宽度占位，导致 grid 行整体横向溢出，按钮被 `overflow` 裁切。
- 处理：字段尺寸样式在保留设置宽度的同时增加 `maxWidth: 100%`，让输入框在窄容器里自动让位，按钮列保持可见。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 读取设定导航树颜色和未发布导航不一致

- 现象：读取设定弹窗左侧导航树分组仍是白底，选中设定是浅蓝色，和未发布导航的分组色、选中色不一致。
- 原因：读取设定导航树独立写了 `bg-white` 和 `#EAF9FD`，没有复用未发布导航的色彩规则。
- 处理：导航树分组块改为 `#E6F7FB`，选中设定改为 `#FFF7ED`；右侧设定/细纲列表的选中态同步使用 `#FFF7ED`。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 带管理按钮的模型提示词选择框文本过早省略

- 现象：模型或提示词名称明明距离箭头还有空间，却提前显示省略号，能显示的字数偏少。
- 原因：带管理按钮的 `CapsuleSelect` 文本按钮右侧额外留白偏大，文本 `span` 也没有按 flex 可用宽度撑满，省略边界比箭头位置更靠左。
- 处理：收紧带管理按钮选择框的文字右侧 `padding`，并让文本 `span` 使用 `min-w-0 + flex-1`，把省略边界推到箭头左侧的安全距离内。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 输出日志折叠卡片过高且没有全局复用

- 现象：折叠后的日志卡片仍显示说明文字，占用高度；分组折叠只停留在测试页，没有同步到所有输出日志。
- 原因：测试页把“折叠只影响当前查看”的说明写进每个折叠头部，正式日志仍使用普通标题加大文本块，各页面没有共享折叠组件。
- 处理：新增 `AiRequestLogGroups` 共享组件，折叠态只显示“提示词 / 关联内容 / 用户要求”等标题和统计；大纲设定、脑洞、细纲、正文续写、审核点评输出日志统一接入该组件。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 模型提示词边框标签压在选中内容上方

- 现象：“模型”“提示词”标签显示在选中模型或提示词名称的正上方，看起来像上下堆叠，而不是嵌在左上边框上。
- 原因：`CapsuleSelect` 的浮动标签和选中内容使用了接近的左侧偏移；带管理按钮和带禁用图标的分支没有把标签层、图标层、文本层分开定位。
- 处理：把浮动标签向左贴近边框；有禁用图标时标签放在图标右侧边框处，并把选中内容右移一点，避免标签和内容上下重叠。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 审核点评弹窗打开时按 ESC 直接回首页

- 现象：点击审核或点评后明明有弹窗，按 `ESC` 没有先关闭弹窗，而是触发作品编辑器兜底逻辑直接回到首页。
- 原因：审核点评、状态更新、审核输出日志和审核模型/提示词管理是 `ChapterEditor` 内部 `createPortal` 渲染的浮层，但没有注册 `useTopModalEscape`，`AppFrame` 判断没有顶层弹窗后继续派发 `close_floating`，`WorkbenchPage` 执行了回首页兜底。
- 处理：给审核输出日志、审核管理弹窗、审核点评主弹窗、状态更新弹窗和编辑器查找条注册 `useTopModalEscape`；`ESC` 现在按最上层浮层优先关闭，全部关闭后才允许页面级回首页。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 读取设定导航树整组被染成蓝色

- 现象：读取设定导航树里整个分组卡片都是蓝色，导致分类下的未选中选项也变成蓝底。
- 原因：上次把 `#E6F7FB` 加在分组外层容器上，而不是只加在组标题按钮上。
- 处理：分组外层和选项区恢复白底；只有组标题行使用 `#E6F7FB`；未选中选项保持白底，选中项才使用 `#FFF7ED`。
- 验证：执行 `npm.cmd run check`、`npm.cmd run build`。

## 剧情点测试页输出日志按钮没有效果

- 现象：06号剧情点工作台测试里，顶部“输出日志”按钮点击后没有任何反馈，用户无法检查本次剧情点请求会发送给 AI 的内容。
- 原因：测试页只绘制了输出日志按钮样式，没有绑定打开日志弹窗的状态，也没有把当前模型、来源、数量、长度、关联设定、用户要求和剧情链上下文整理成可查看内容。
- 处理：给按钮接入 `isOutputLogOpen` 状态，点击后打开输出日志弹窗；弹窗按“AI配置 / 关联设定 / 用户要求 / 剧情链上下文”分组展示当前测试请求内容。
- 预防：测试页里的按钮如果用于验证真实交互，不能只做静态样式；新增按钮时至少要有弹窗、状态切换或可见反馈，避免误判方案已完成。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 作品编辑器快速导航按钮误改成全局侧栏收起

- 现象：用户只希望作品编辑器左侧快速导航小按钮平时隐藏、鼠标移过去显示，但首页全局左侧导航也被收起，导致首页内容被遮挡和挤偏。
- 原因：把需求里的“左边这个框”误判为 `DashboardLayout` 的全局侧栏，而实际目标是 `WorkbenchPage` 里的 `WorkbenchQuickNav` 悬浮按钮。
- 处理：恢复 `DashboardLayout` 的固定左侧导航布局；随后按用户最终要求删除 `WorkbenchQuickNav` 功能本身，包括悬浮按钮、快速导航弹层、状态和 `close_floating` 关闭分支。
- 预防：修改“左侧按钮/框”前先确认它属于全局导航、作品编辑器快速导航，还是业务面板侧栏；如果用户决定不要该功能，应删除入口和状态链路，而不是继续隐藏。
- 验证：`npm.cmd run check`、`npm.cmd run build`。

## 顶部脑洞流程点击后仍停在大纲页

- 现象：点击顶部“脑洞”流程按钮后，页面看起来没有切到脑洞流程；同时“作品信息”和创作流程被连成同一组按钮，视觉层级不清。
- 原因：脑洞和大纲共用同一个 `WorkbenchLibraryPanel` 实例，组件内部 `activeTab` 会优先读取旧的本地存储；顶部 `WorkbenchHeader` 也把作品信息和流程按钮渲染在同一个 `xy-capsule-group`。
- 处理：内嵌流程页按 `activeCreationFlow` 设置 React `key`，并让传入的 `defaultActiveTab` 优先于旧存储；`WorkbenchHeader` 拆成“作品信息”按钮组和独立创作流程按钮组。
- 预防：同一组件承载不同流程页时，流程切换必须重置或显式同步内部页签；作品级信息入口和创作流程入口不要共用一个组合按钮。
- 验证：`npm.cmd run test:run -- src/features/workbench/components/WorkbenchHeader.test.tsx src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`、`npm.cmd run check`、`npm.cmd run build`。

## 设定多框预览不应在条目改名后消失

- 现象：作品设定里把“剧情蓝图”等多框设定条目改名后，原本的“整体规划 / 主线目标 / 阶段节奏”等拆分预览会消失，界面退回普通设定预览。
- 原因：结构化设定预览只按“分组 + 固定条目名”匹配，没有把使用的预览模板身份写入设定内容；标题一变，模板关系就断开。
- 处理：给结构化设定模板增加稳定 ID；默认创建这些条目时写入 `structuredFieldSetId`；读取时优先按模板 ID 匹配，旧数据继续兼容原标题识别；改名时若能识别模板，会同步补写模板 ID。
- 预防：结构化预览不能只依赖用户可改的标题，应依赖稳定模板标记；测试覆盖“填写剧情蓝图内容后改名，拆分预览和内容仍保留”。
- 验证：执行 `npm.cmd test -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

## 默认设定骨架不应被改名或删除

- 现象：默认生成的设定条目可以被改名或删除，清空设定/清空分组也可能绕过单条锁定，导致新小说默认设定骨架被破坏。
- 原因：默认设定条目和用户自建条目没有稳定区分标记；标题输入框、右键菜单、底部删除按钮、清空入口各自处理，没有统一默认骨架锁定规则。
- 处理：给默认设定条目写入 `lockedDefaultEntryId`，旧数据按默认分组和默认标题兼容识别；默认设定条目禁用设定名输入、隐藏删除按钮、右键不显示重命名/删除；默认分组不打开删除菜单；清空设定和清空分组只删除用户自建内容，默认骨架保留。
- 预防：默认骨架类数据必须通过统一锁定判断保护；后续新增删除、重命名、清空、拖拽归类或迁移入口时，都要确认不会绕过默认骨架锁定。
- 验证：执行 `npm.cmd test -- src/features/workbench/components/WorkbenchLibraryPanel.test.tsx`。

# 提示词管理缺少 TXT 导入导出入口

- 现象：提示词管理右上角只有回收站入口，用户无法直接把当前提示词库导出为 TXT，也无法从 TXT 文件导入提示词。
- 原因：提示词管理此前只覆盖创建、编辑、删除、回收站和分类管理，缺少批量导入导出的页面入口；`usePrompts` 也只有单条新增，连续导入多条时容易依赖旧状态。
- 处理：在回收站旁新增“导入提示词”和“导出提示词”按钮；导出生成 `月下提示词导出 v1` 纯 TXT；导入优先识别同格式，多条一次性写入并同步新增分类，普通 TXT 会按单条提示词导入。
- 预防：提示词库新增迁移或备份入口时，页面按钮、TXT/JSON 格式解析、批量写入 hook 和源码断言测试要一起补，避免只有 UI 入口没有可靠数据写入。

# 两台电脑之间需要可见的全局数据迁移入口

- 现象：家里电脑和公司电脑安装同一项目后，提示词、新建小说和页面设置不一致；旧的本地备份页面入口隐藏，导入也只是叠加写入，不能保证公司电脑变成家里电脑状态。
- 原因：备份能力停留在数据库设置隐藏页面，导航和设置页没有明确入口；导入逻辑只写入备份中的 key，没有先清除本软件已有的可恢复 key，旧数据可能残留。
- 处理：设置页新增“数据迁移”分区，复用并升级全局备份页面；导出生成 `yuexia-global-backup-YYYY-MM-DD.zip`；导入前确认覆盖，先清除本软件可恢复 localStorage key，再写入备份内容，并兼容旧 JSON key 映射格式。
- 预防：全局迁移必须同时覆盖入口可见性、项目 key 白名单、安全脱敏、替换式恢复和导入确认；新增本地存储 key 时要确认 `isRestorableLocalStorageKey` 能覆盖。

# 测试集合里已测试的临时测试页应及时清理

- 现象：测试集合里已有 6 个测试页被本机运行时标记为已测试，但入口、懒加载组件、渲染分支和专用测试文件仍然留在源码中，测试区继续堆积已完成验证的临时页面。
- 原因：测试集合的已测试状态保存在 `xinyuexia_test_collection_tested_paths_v1`，源码不会自动根据该运行时标记删除页面；完成验证后需要手动做源码清理。
- 处理：清理 `/clean-writer-style-preview-test`、`/workbench-ai-right-width-preview-test`、`/shuimo-selection-state-preview-test`、`/shuimo-sidebar-scheme-preview-test`、`/shuimo-semantic-palette-preview-test`、`/genre-iteration-moonfall-style-test` 这 6 个已测试页面，删除对应组件和测试文件，并把路径加入清理回归断言。
- 预防：临时测试页确认完成后，应同步删除 `TestCollectionPage` 的入口和渲染分支、删除页面文件和专用测试文件，并在 `TestCollectionDeleteMarkedCleanup.test.tsx` 中登记已移除路径，避免后续重新加入。

# 番茄浏览器网页不应被右侧 AI 配置区挤到显示不全

- 现象：番茄浏览器中间网页区域被左侧导航和 420px 右侧 AI 配置区挤窄时，网页右侧需要横向滚动才能看到，看起来像网页显示不全。
- 原因：`webview` 内层强制使用 1280px 最小宽度，外层中间列实际宽度不足时会裁切网页；右侧 AI 配置区也没有收起态，无法临时释放空间。
- 处理：番茄浏览器根布局改为动态 `gridTemplateColumns`；`webview` 改为随中间列 `minWidth: '100%'` 自适应；右侧 AI 配置区新增收起/展开按钮，收起后只保留 56px 窄栏。
- 预防：内嵌网页页面不要在业务工作台里硬编码大于可见列宽的最小宽度；固定右侧配置栏应提供收起态，并用测试锁定自适应网页和展开按钮。

# 番茄浏览器左侧快捷区不应长期占用网页横向空间

- 现象：番茄浏览器左侧“题材迭代”快捷区独立占用 220px 宽度，网页本体可见宽度被压缩；用户还无法像浏览器收藏夹一样自由保存当前网页并命名。
- 原因：番茄快捷入口沿用了测试原型的三列布局，左侧流程导航与浏览器地址栏分离；页面没有持久化收藏数据，也没有为当前 `webview` URL 和标题提供保存入口。
- 处理：移除左侧独立导航列，把番茄排行榜、男频分类、搜索小说、迭代流程整合到地址栏下方快捷栏；新增收藏名称输入框、收藏当前网页按钮、收藏项列表和删除收藏能力，收藏数据保存到 `xinyuexia_tomato_browser_bookmarks`。
- 预防：浏览器类页面优先把快捷入口放在地址栏附近，避免常驻侧栏挤压网页；新增收藏能力时要同步保存 URL、可编辑标题、删除入口和本地持久化 key。

# 番茄浏览器需要可配置首次进入首页

- 现象：点击左侧导航进入番茄浏览器时只能打开固定的番茄排行榜，用户不能把常用榜单、分类页或搜索页设为下次首次进入的页面。
- 原因：页面初始化直接使用 `TOMATO_DEFAULT_URL`，没有独立保存用户选择的首页 URL；快捷栏也缺少打开首页和设为首页入口。
- 处理：新增 `xinyuexia_tomato_browser_home_url` 本地存储 key；初始化时优先读取该 URL；快捷栏新增“打开首页”和“设为首页”按钮，允许把当前网页保存为下次进入番茄浏览器的首页。
- 预防：浏览器类导航页如果有默认打开地址，应把默认值和用户配置分开；提供显式“设为首页”入口，并在初始化测试中锁定本地 key 和打开逻辑。

# 番茄浏览器默认首页应打开指定排行榜页面

- 现象：进入番茄浏览器或点击番茄排行榜时仍可能打开 `https://fanqienovel.com/rank`，而不是用户指定的 `https://fanqienovel.com/rank/1_1_8`；如果本地首页保存过旧默认值，设为首页看起来也可能没有变化。
- 原因：`TOMATO_DEFAULT_URL` 和番茄排行榜快捷入口仍指向旧 rank 根路径；首页读取逻辑没有把历史旧默认值迁移到新的指定排行榜 URL。
- 处理：将 `TOMATO_DEFAULT_URL` 和番茄排行榜入口统一改为 `https://fanqienovel.com/rank/1_1_8`；新增 `TOMATO_OLD_DEFAULT_URL` 兼容判断，读取到旧默认首页时自动回退到新默认地址。
- 预防：浏览器首页默认值调整时，要同步默认常量、快捷入口和本地历史值迁移规则，避免旧 `localStorage` 覆盖新默认。

# 番茄浏览器右侧 AI 配置栏需要可拖拽调整宽度

- 现象：番茄浏览器右侧 AI 配置栏固定为 420px，用户不能根据网页和 AI 区内容自由调整空间。
- 原因：页面 grid 只按固定宽度渲染右侧 AI 配置栏，没有独立分割线、拖拽状态和最小宽度限制。
- 处理：将布局改为浏览器主体、6px 分割线、AI 配置栏三列；新增 `startAiPanelResize` 拖拽逻辑，默认宽度 420px，最小宽度为默认宽度的 60% 即 252px，最大宽度 720px；收起状态隐藏分割线并保持 56px 窄栏。
- 预防：可调右侧栏应同时定义默认宽度、最小宽度、最大宽度和拖拽手柄，并用测试锁定 60% 最小宽度规则。

# 番茄浏览器软件默认首页不应保存移动端参数

- 现象：软件默认首页应为 `https://fanqienovel.com/rank/1_1_8`，但再次进入时可能变成 `https://fanqienovel.com/rank/1_1_8?force_mobile=1`。
- 原因：`webview` 实际导航后的 URL 可能带有 `force_mobile=1`；此前只在设为首页或读取本地首页时清理，地址栏同步、收藏和新窗口跳转仍可能把该参数重新带回软件状态。
- 处理：新增 `normalizeTomatoBrowserUrl` 作为番茄浏览器统一入口；首页读取/保存、地址栏同步、打开链接、收藏和新窗口跳转都统一删除 `force_mobile` 参数。
- 预防：浏览器首页和软件地址栏属于本地软件状态，不应直接持久化站点跳转产生的临时参数；所有 webview URL 回写路径都必须先做统一清理。

# 番茄浏览器宽网页被右侧栏压窄时底部应有横向滚动条

- 现象：右侧 AI 配置栏占用宽度后，番茄网页右侧内容被裁掉，页面最下方没有横向滚动条，用户无法看到完整网页。
- 原因：上一轮为了解决网页显示不全把 `webview` 容器改成 `overflow-hidden` 且 `minWidth: 100%`，但番茄榜单实际是桌面宽页；当可视列变窄时缺少横向滚动容器。
- 处理：恢复 `webview` 外层 `overflow-x-auto overflow-y-hidden`，并设置 `TOMATO_BROWSER_DESKTOP_MIN_WIDTH` 为 `1280px`，让底部出现横向滚动条查看完整网页。
- 预防：内嵌桌面网页如果保持桌面宽度，外层必须保留横向滚动；只做 100% 自适应会导致站点内部内容被压缩或裁切。

# 番茄浏览器点击书名应在当前页进入书籍详情

- 现象：番茄排行榜页面可以打开，但点击书名无法进入书籍详情。
- 原因：番茄站点的书籍详情链接可能通过新窗口或新标签打开；当前 `webview` 没有 `allowpopups`，也没有监听 `new-window` / `did-create-window` 事件接管跳转。
- 处理：保持不使用 `allowpopups`，在 `TomatoGenreIterationTestPage` 中监听 `webview` 的 `new-window` 和 `did-create-window` 事件，提取目标 URL 后在当前番茄浏览器 `webview` 内打开；同时在 `dom-ready` / `did-finish-load` 后注入安全脚本，把页面里的 `a[target]` 改为 `target=_self`。
- 预防：内嵌浏览器不应放开任意弹窗；需要新窗口跳转时，应拦截目标 URL 并在当前受控 `webview` 中导航；站点使用 `target=_blank` 时应在 `webview` 内改为当前页打开。

# 番茄浏览器清理移动端参数不应造成页面卡住

- 现象：点击番茄浏览器进入页面时，页面可能长时间卡住或反复加载。
- 原因：`webview` 实际地址可能被站点重定向为带 `force_mobile=1` 的 URL；此前同步导航状态时直接把该地址清理后写回 `currentUrl`，而 `currentUrl` 又绑定到 `webview src`，导致 webview 实际地址和 React 期望地址来回切换。
- 处理：分离 webview 实际加载地址和软件显示/保存地址；`currentUrl` 保留实际加载地址避免重载循环，地址栏、首页和收藏继续使用 `normalizeTomatoBrowserUrl` 后的干净地址。
- 预防：第三方站点的实际导航地址不要和本地展示/配置地址共用同一个规范化状态；清理参数时只能清理本地显示和持久化路径，不能强行反复改写 webview 的 `src`。

# 番茄浏览器 AI 配置栏拖拽松手后不应继续拖动

- 现象：拖拽番茄浏览器右侧 AI 配置栏宽度后，松开鼠标仍可能继续触发拖拽效果。
- 原因：拖拽使用 `document` 级 `mousemove/mouseup`，当鼠标释放发生在 Electron `webview` 或窗口外时，页面可能收不到 `mouseup`，导致全局移动监听没有被移除。
- 处理：改用 Pointer Events 和 `setPointerCapture`；拖拽开始前先清理旧监听，结束时统一移除 `pointermove/pointerup/pointercancel/blur`，并释放 pointer capture。
- 预防：靠近 `webview`、iframe 或窗口边缘的拖拽控件应使用 pointer capture，并提供 `cancel/blur` 兜底释放路径。

# 打开软件后的设定页分组默认应展开

- 现象：打开软件后进入工作台设定页、人物设定或设定里的各个标签页时，多个分组仍默认处于折叠状态，需要手动展开。
- 原因：角色/设定分组会读取上次保存的折叠集合；即使代码有无历史状态的默认展开逻辑，只要本地曾保存过折叠状态，重新打开软件仍会恢复为折叠。
- 处理：设定页启动或切换标签页时，自动把当前可见的角色和设定分类补入展开集合，并跳过这次自动展开的持久化；剧本资料侧栏记录已初始化过的小说分组，新出现的分组默认加入展开集合。
- 预防：设定页这类主要导航分组应以“打开软件默认展开”为准；折叠只作为当前会话的临时操作，不应导致下次启动默认折叠。

# 我的小说顶部作品整理卡片尺寸不应随作品数量变化

- 现象：我的小说页面里，两本书和三本书状态下，顶部“作品整理”卡片中“新建小说”这一行的视觉宽度不一致。
- 原因：顶部四卡片使用 `fr` 比例分配宽度，并读取旧的比例型本地宽度配置；页面可用宽度或历史拖拽值变化时，作品整理卡片会跟随伸缩。
- 处理：将顶部四卡片改为固定像素宽度 `[464, 434, 428, 424]`，旧的比例型本地宽度自动回退到新默认值；拖拽调整也改为直接保存像素宽度。
- 预防：操作卡片承载固定 2x2 功能入口时，应使用稳定像素宽度或明确尺寸约束，不应让作品数量、滚动条或比例分配影响按钮行尺寸。

# 章纲标题应同时显示卷序号和章节序号

- 现象：章纲编辑框标题只显示“第1章章纲”，无法从标题判断当前章节属于哪一卷。
- 原因：章纲标题只拼接了章节序号，没有读取当前章所在卷的名称，且章节序号与“章纲”之间缺少空格。
- 处理：章纲标题改为读取当前卷名称和章节序号，按“第一卷 第1章 章纲”的格式显示。
- 预防：章纲标题回归测试必须同时锁定当前卷名称、章节序号和空格格式，避免再次退化为仅显示章节序号。

# 章纲和状态变化应使用独立的框边字号与标题字数

- 现象：章纲字号位于页面右上角，章纲框重复显示章节名称，两个编辑框的字数又分散在右下角；状态变化没有独立字号。
- 原因：章纲页沿用全局标题栏字号入口和通用右下角字数组件，状态变化 textarea 直接复用了章纲字号配置。
- 处理：删除章纲框右上章节名称；将章纲、状态变化字号分别嵌入各自右上边框并独立保存；字数合并到左上标题，显示为“章纲 X字”和“状态变化 X字”。
- 预防：同页不同编辑区域需要独立字号时必须使用独立配置键；框体字数优先与标题同行，回归测试锁定无右下角重复统计和无章节名称残留。

# 结构化设定首个标签应统一为基础设定

- 现象：部分设定类型显示“固定设定”，人物和其他区域则显示“基础设定”，同一层级名称不一致。
- 原因：结构化设定标签、默认选中值和部分字段分组仍使用早期的“固定设定”文案。
- 处理：将结构化设定的首个标签、默认选中值及势力、功法、特殊资源等分组标题统一改为“基础设定”。
- 预防：设定页同级标签统一使用“基础设定”；回归测试应断言结构化设定源码和可见标签中不再出现“固定设定”。

# 章纲标题字数应恢复双色并保留三字符间距

- 现象：字数移动到标题后变成与标题相同的黑色，并且紧贴“章纲”或“状态变化”文字。
- 原因：标题内直接拼接了纯文本字数，没有复用原字数统计的品牌蓝数字和灰色单位，也没有独立间距。
- 处理：新增标题内字数组件，数字使用品牌蓝、“字”使用灰色，并通过 `3ch` 左外边距稳定保留三个空格距离。
- 预防：移动字数统计位置时应同时保留原有颜色语义；需要固定多个空格时使用 `ch` 间距，不能依赖会被 HTML 合并的普通空格。

# 章纲框边字号输入框不应继承正文浮动框尺寸

- 现象：字号工具中间的数字框被拉成约 66px 高的大圆角框，减号和加号悬在两侧，控件整体变形。
- 原因：字号工具嵌入章纲浮动框后，其中的 `input` 命中了浮动框通用输入框样式；新工具类没有加入原字号控件的高优先级尺寸选择器。
- 处理：将章纲框边字号工具加入字号容器、按钮、图标和输入框的隔离选择器，强制恢复 `1.76rem` 高度、`2rem` 数字宽度和无圆角中段。
- 预防：在浮动字段内部嵌入带 `input` 的工具时，必须为内部输入框提供高于浮动字段通用规则的完整尺寸覆盖，并用源码测试锁定。

# 章纲标题应从章节序号开始显示字数

- 现象：章纲标题前面带有卷名称，导致字数统计位置随卷名称长度变化，标题信息显得过长。
- 原因：章纲标题复用了卷名称和章节名称组合，字数统计只使用相对间距。
- 处理：章纲标题改为“第X章 章纲”，删除卷名称；字数统计使用 `2ch` 的固定标题间距，保持紧凑且清晰。
- 预防：章纲标题只保留章节序号和章纲语义，字数统计起始位置需要固定时使用独立 spacingClassName。

# 章纲字号工具应置于边框上层且两个编辑框保持间距

- 现象：右上角字号工具被章纲边框或浮动元素遮挡，章纲和状态变化两个编辑框在纵向上贴得过紧。
- 原因：字号工具层级低且未建立独立层叠上下文；两个编辑框使用 16px 间距，工具高度让视觉间距进一步被压缩。
- 处理：将字号工具提升到 `z-index: 60` 并建立独立层叠上下文；编辑框间距调整为约 24px。
- 预防：边框嵌入工具必须明确高于标签和边框的层级；上下相邻的大型编辑框应按工具高度预留稳定间距。

# 人物姓名输入框字号应与外貌字段统一

- 现象：点击人物姓名输入框时，文字字号与“外貌”等基础设定字段不一致，聚焦前后出现视觉跳变。
- 原因：人物姓名输入框写死 17px，而外貌等字段使用统一的 `roleTextFontSize`；浮动输入框聚焦时的通用规则进一步放大了差异。
- 处理：人物姓名输入框改为使用 `roleTextFontSize`，并移除写死的 17px 样式。
- 预防：人物设定基础字段和标题输入框应共用 `roleTextFontSize`，禁止在单个字段上写死字号。

# 设定名和人物姓名标签聚焦前后应保持粗体

- 现象：点击设定名或人物姓名输入框后，边框上的标签会从粗体变回普通字重，与外貌字段标题不一致。
- 原因：名称标签虽声明 900 字重，但后面的浮动框聚焦通用规则以相同优先级覆盖为 500。
- 处理：将设定名和人物姓名专用标签字重固定为 900 并提高声明优先级，确保聚焦、已有值和未聚焦状态一致。
- 预防：专用浮动标签如果需要稳定视觉，应显式覆盖通用聚焦态的字号、字重和变换规则，并增加聚焦前后回归断言。

# 新建角色弹窗采用测试08方案C并退役临时测试

- 现象：正式新建角色弹窗仍使用通用创建弹窗，信息层级偏重；测试08的方案C更符合只输入角色名字的创建流程。
- 原因：角色与普通设定共用同一个创建弹窗，已确认的极简方案尚未迁移到正式页面。
- 处理：为新建角色接入方案C，移除英文装饰，只保留标题、角色名字输入、关闭、取消和确认创建；示例名改为“例如：萧炎”，同时删除测试08页面、集合入口和路由。
- 预防：已确认并迁移的临时设计测试应在同一任务清理；角色专用弹窗与仍需选择所属分组的设定弹窗分开维护。

# 文本审核启动时应直接显示思考卡片

- 现象：点击文本审核开始后先显示纯文本“正在思考...”，随后才切换为带浅蓝背景和耗时标题的思考卡片，界面出现一次闪变。
- 原因：结构审核使用了标记化思考占位符，文本审核仍使用普通字符串占位符，导致两种审核模式的首帧渲染路径不一致。
- 处理：文本审核启动时也使用 `[[THINKING seconds=0 status=thinking]]` 占位符，首帧直接渲染“正在思考（0 秒）”卡片，后续流式推理继续写入同一卡片。
- 预防：审核类 AI 请求的首帧都应使用统一的思考标记；新增审核模式时必须增加无推理内容首帧回归测试，禁止回退到纯文本占位符。

# 文本审核未解析出修改后全文时应显示等待提示

- 现象：文本审核右侧已经开始请求，但审核后区域显示“未识别到【修改后全文】”，用户容易误以为 AI 已经结束并且输出失败。
- 原因：审核后预览只根据当前是否解析出修改后全文渲染格式错误提示，没有区分 AI 仍在思考或尚未完成输出的阶段。
- 处理：将该状态提示改为“AI正在思考，请稍后……”，保留段落数量不一致等真正格式问题的提示。
- 预防：AI 流式输出尚未形成最终结构时应显示等待状态；只有确认输出完成后仍无法解析，才显示格式错误或修正建议。

# 文本审核应与15号测试一样逐段展示修改结果

- 现象：正式文本审核返回“【修改后全文】”后，如果原文148段、审核后147段，页面没有进入逐段审核界面，而是整列显示段落数量不一致。
- 原因：正式页把 `auditParagraphCountMatches` 作为进入连续逐段审核组件的硬门槛；15号测试则按原文索引逐段读取，缺失项自然显示为空段。
- 处理：只要成功解析出修改后全文就进入 `ChapterTextAuditContinuousReview`，移除段落数量相等限制；缺失段落按空内容参与差异展示和确认流程。
- 预防：审核后正文展示应优先保证逐段可审阅，段落数量差异作为局部缺失提示处理，不应阻断整篇审核结果；正式页和15号测试共用同一逐段映射规则。

# 设定页名称框应与顶部标签页保持统一间距和字体

- 现象：作品设定和人物设定顶部标签页到名称框的距离不一致；人物姓名字号小于作品设定的设定名；点击设定名时浮动标签会跳动。
- 原因：结构化设定标题行叠加了额外 `pt-3`，叠加编辑器自身顶部间距；人物姓名标题输入被 `roleTextFontSize` 内联样式覆盖；名称标签没有固定聚焦态的顶部位置和变换。
- 处理：名称框统一使用12px顶部间距；人物姓名输入改为与设定名相同的17px；设定名和人物姓名标签固定为边框上沿位置，聚焦时不再移动。
- 预防：顶部标签页到编辑器首个字段应只保留一层间距；名称输入字号使用名称框统一样式，不能复用正文字号；嵌入边框标签必须同时锁定未聚焦和聚焦状态的 `top/transform`。

# 人物身份定位和生存状态应形成紧凑状态组

- 现象：身份定位使用浅青高亮胶囊，与人物姓名和黑色边框字段风格脱节；存活/死亡切换贴在标题行最右侧；左侧角色导航看不出人物当前是否存活。
- 原因：身份定位沿用通用青色选择框，生存状态使用 `justify-between` 独立推到右侧，角色导航没有读取 `lifeStatus`。
- 处理：身份定位改为黑色边框、无阴影的浮动标签选择框；存活/死亡紧跟在身份定位右侧，选中存活显示绿色、死亡显示红色；导航角色名后增加同色状态灯。
- 预防：人物顶部短字段应作为连续信息组排列，不得把关联状态控件推到页面边缘；角色关键状态应在导航列表提供轻量可视提示，并与编辑区颜色语义一致。

# 生存状态颜色只应显示在导航状态灯

- 现象：编辑区“存活”按钮被改成绿色、“死亡”按钮被改成红色，改变了原有状态切换控件的视觉样式。
- 原因：把导航状态灯的语义颜色误用到了编辑区按钮选中态。
- 处理：恢复编辑区原有青色选中、灰色未选中样式；绿色/红色只保留在导航角色名右侧的状态灯。
- 预防：导航状态提示与编辑控件状态应分开定义，颜色需求必须限定到具体界面位置。

# 切换设定页时名称框尺寸和上方间距必须保持不变

- 现象：在作品设定、人物设定及其他设定页之间切换时，设定名框会产生宽度、高度或距上方标签页间距的体感差异，用户只希望标题文字变化。
- 原因：名称框同时受不同编辑器父级布局和 `max-width` 约束，页面间距依赖各自包裹类名，缺少统一的尺寸与顶部间距约束。
- 处理：为设定名、人物姓名统一强制 232×48px，并给作品设定和人物设定编辑器使用同一名称框容器类，固定顶部12px间距。
- 预防：名称框尺寸和标签页到名称框的间距必须由共享样式约束，页面切换不得重新定义宽高或顶部 padding。

# 名称标签首字应与输入文字首字对齐

- 现象：点击人物姓名或设定名输入框时，标签文字会产生水平位移；标签首字与输入内容首字不在同一竖线上。
- 原因：标签使用 `left: 20px`，输入文字使用 `padding-left: 1.75rem`（28px），且浮动缩放没有显式锁定左侧变换原点。
- 处理：将名称标签左起点固定为28px，并固定 `transform-origin: left center`，使聚焦前后首字位置不变且与输入文字对齐。
- 预防：边框嵌入标签的水平起点必须和输入控件的文字 padding 共用同一基准，浮动缩放必须显式设置变换原点。

# 名称标签点击时不应执行浮动过渡

- 现象：即使名称标签普通态和聚焦态位置数值一致，点击输入框时“设定名/人物姓名”仍会轻微动一下。
- 原因：通用浮动标签保留了150ms transition，聚焦选择器重新应用样式时仍可能产生一次亚像素过渡。
- 处理：为名称标签的普通、聚焦和已有值状态声明完全相同的强制样式，并关闭 transition 与 animation。
- 预防：固定嵌入边框的标签不得继承通用浮动标签动画；需要完全静止时应同时覆盖三种状态并关闭过渡。

# 切换设定标签时名称框的上边框断口不应变化

- 现象：在作品设定、人物设定、势力设定等标签间切换时，名称框虽然数值宽高一致，但仍有外框伸缩或轻微位移的体感。
- 原因：名称框继续复用通用浮动标签结构，标题白色背板的宽度会跟随“设定名、人物姓名、势力名称”等文字长度变化，导致上边框断口长度改变；聚焦状态还会重新匹配通用浮动规则。
- 处理：新增独立的 `WorkbenchNameField` 固定名称框，统一锁定 232×48px 外框、76px 标题槽、28px 标题与输入文字起点；标题改为静态元素，不再参与通用浮动标签的聚焦和已有值状态。
- 预防：跨页面只更换标题文字的名称框必须共用同一 DOM 结构和固定标题槽，不得用随文字宽度变化的遮挡区制造边框断口，也不得继承通用浮动标签状态。

# 名称框标题右侧不应留下固定空白

- 现象：名称框外框尺寸已经固定，但“设定名、人物姓名”等标题右侧出现一段明显空白；不同设定页面切换时，标题和值的视觉关系仍不一致。
- 原因：上一版为稳定边框断口给标题背板设置了固定宽度，短标题也占用了最长标题的槽位，导致标题右侧出现空白。
- 处理：保留名称框本身的固定 232×48px 几何尺寸，只把标题背板改为随标题内容自适应宽度，并固定标题与输入文字的左起点；名称框增加 `align-self:flex-start`，避免父级 flex 对位置产生拉伸影响。
- 预防：固定的是外框尺寸和定位，不应固定标题背板宽度；标题背板必须按内容自适应，所有设定页继续复用同一个名称框组件。
# 桌面启动不应闪现黑框或只显示标题栏

- 现象：双击打开软件时先闪现黑色控制台，随后软件窗口只出现顶部标题栏，正式页面稍后才补齐。
- 原因：VBS 通过 WMI 创建普通 node.exe 进程时仍可能短暂生成控制台；Electron 又在 ready-to-show 或文档加载完成时提前显示，而首个懒加载路由尚未完成渲染。
- 处理：VBS 改用隐藏窗口方式直接启动 Node；Electron 增加与现有浅色界面一致的独立启动窗，主窗口保持隐藏，直到 Suspense 内首个正式路由挂载并通过受信 IPC 报告 renderer-ready 后再切换显示。
- 预防：启动回归必须锁定隐藏启动器、启动窗安全配置和 renderer-ready 握手；不得重新使用 ready-to-show 作为主窗口的唯一显示条件。
