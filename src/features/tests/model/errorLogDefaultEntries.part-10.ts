import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart10: ErrorLogEntry[] = [
  {
    id: 'setting-current-catalog-core-advantage-order-001',
    title: '当前默认设定漏掉主角金手指并写错剧情规划顺序',
    area: '工作台 / 设定 / 新小说默认设定',
    symptom:
      '当前核心设定下实际有“基础设定、世界观、主角金手指/优势”，剧情规划下实际顺序为“剧情蓝图、爽点设计、分卷剧情”，但默认模板少了主角金手指/优势，且剧情规划顺序写成了分卷剧情在爽点设计前。',
    cause: '上一次固化默认模板时只依据已写入代码的旧目录，没有按用户当前界面里最终确认的条目和顺序重新核对。',
    solution:
      '默认模板补入“主角金手指/优势”，并将剧情规划条目顺序调整为“剧情蓝图、爽点设计、分卷剧情”；同时升级默认模板版本，让已跑过旧模板的小说也能补齐当前条目。',
    prevention: '以后固化当前设定目录时，测试必须断言每个分组的条目完整列表和顺序，不能只断言分组存在或总数量。',
    keywords: ['设定', '默认模板', '主角金手指', '剧情规划', '顺序', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-18',
  },
  {
    id: 'setting-current-catalog-default-template-001',
    title: '当前设定目录需要固化为新小说默认模板',
    area: '工作台 / 设定 / 新小说默认设定',
    symptom:
      '用户已经整理好当前设定页的标签、分组和设定条目，希望以后创建小说时默认就是这一套结构，而不是继续沿用旧版本或只补一部分条目。',
    cause:
      '设定页默认模板依赖 work_setting_starter_version 控制补齐；如果版本号仍停留在上一轮结构，即使代码里已有当前目录，跑过旧版本默认生成的小说也不会再次补齐当前目录。',
    solution:
      '将默认模板版本升级为当前设定目录版本，并用测试锁定作品设定、人物设定、势力地图、道具资源、伏笔线索、书写规则的默认分组和默认设定条目。',
    prevention:
      '以后调整当前设定目录时，同时更新默认模板版本和“当前设定默认目录”测试，确认新小说能得到完整标签、分组、条目和空正文。',
    keywords: ['设定', '默认模板', '新小说', '分组', '设定条目', '当前设定', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-18',
  },
  {
    id: 'work-setting-world-view-bound-old-group-001',
    title: '作品设定的世界观拆分框挂到旧分组',
    area: '工作台 / 设定 / 作品设定 / 世界观',
    symptom: '用户要求把作品设定里的“世界观”拆成多个设定框后，界面没有变化，并指出当前页面并没有“世界规则”分组。',
    cause:
      '结构化设定框仍绑定在旧的“世界规则 / 世界观”组合上，默认作品设定也还会生成空白“世界规则”分组和“世界规则”条目，导致新拆分框没有出现在当前实际使用的“核心设定 / 世界观”位置。',
    solution:
      '将“世界观”默认条目迁到“核心设定”分组下，默认作品设定只保留“核心设定、剧情规划”两个分组；结构化三框也改为匹配“核心设定 / 世界观”，并清理空白旧默认“世界规则 / 世界规则”条目。',
    prevention:
      '作品设定默认结构测试要确认“核心设定”下包含“基础设定、世界观”，且不出现“世界规则”分组；世界观结构化预览测试必须直接在“核心设定 / 世界观”下验证时代背景、世界格局、社会秩序三个框。',
    keywords: ['设定', '作品设定', '核心设定', '世界观', '世界规则', '结构化设定', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-18',
  },
  {
    id: 'setting-entry-hover-cursor-hand-001',
    title: '设定条目悬停时显示抓取手掌',
    area: '工作台 / 设定 / 左侧设定条目',
    symptom: '鼠标移动到设定条目上时显示手掌或抓取手势，用户希望这些条目悬停时仍然是普通箭头。',
    cause:
      '上一次为条目拖拽排序增加长按拖动能力时，把条目行样式设置成 cursor-grab，并在按下时切换 active:cursor-grabbing，导致普通悬停也像拖拽把手。',
    solution:
      '将设定条目和人物条目的列表行默认改为 cursor-default，保留 select-none、pointer 事件和拖拽排序逻辑；只有当前条目真正进入 draggingLibraryEntry 拖动状态后，才临时加 cursor-grabbing。',
    prevention:
      '设定条目行样式测试要同时检查默认 cursor-default 和拖动中 cursor-grabbing，并禁止 cursor-grab / active:cursor-grabbing 回到普通悬停状态；如果以后需要拖拽提示，应使用虚影或边框反馈配合拖动中鼠标样式。',
    keywords: ['设定', '设定条目', '鼠标样式', 'cursor-default', 'cursor-grab', '拖拽排序', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-18',
  },
  {
    id: 'structured-setting-placeholder-hidden-001',
    title: '结构化设定框有提示字但界面看不到',
    area: '工作台 / 设定 / 剧情规划 / 结构化设定预览',
    symptom:
      '剧情蓝图的“整体规划”等小框已经配置了灰色提示字，但用户在界面里看不到，尤其是“预计总字数、共几卷、故事从哪里开始到哪里结束。”没有显示出来。',
    cause:
      '浮动边框输入框的默认样式会把 input/textarea 的 placeholder 颜色设为 transparent；上一次只给字段加了 placeholder 属性，没有给结构化设定框加可见 placeholder 的样式类，所以测试能看到属性存在，但真实界面肉眼不可见。',
    solution:
      '给结构化设定小框增加 xy-floating-visible-placeholder 样式类，让 placeholder 以灰色文字显示；仍然保持这些提示只作为背景提示字，不会写入设定正文。',
    prevention:
      '结构化设定提示字测试必须同时检查 placeholder 属性和 xy-floating-visible-placeholder 样式类，避免再次出现“数据有了但界面看不到”的问题。',
    keywords: [
      '设定',
      '结构化设定',
      '整体规划',
      'placeholder',
      '灰色提示字',
      'xy-floating-visible-placeholder',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-18',
  },
  {
    id: 'drag-sort-stuck-on-ghost-preview-002',
    title: '拖拽换位时虚影命中自身导致卡住或弹回',
    area: '工作台 / 设定条目 / 导航设置 / 模型管理 / 拖拽排序',
    symptom: '拖动条目或卡片换位时，鼠标还压在虚影位置上，预览有时会停住、弹回，或者松手后不是用户看到的落点。',
    cause:
      '换位预览会改变 DOM 顺序，旧逻辑继续按命中的真实条目 id 判断目标；当鼠标命中被拖动条目的虚影时，会被误判为回到原始位置。导航设置和模型管理的 pointer 事件还只绑定在当前行/卡片上，鼠标拖出元素后移动和松手事件可能丢失，表现为卡住。',
    solution:
      '设定条目、导航设置、模型管理统一改为按“预览行号/卡片序号”判断落点，而不是按命中的真实 id；命中自身虚影时保持当前预览行。导航设置和模型管理也改为窗口级 pointermove/pointerup 跟踪，拖出元素后仍能继续更新预览并在松手时提交。',
    prevention:
      '拖拽排序测试要覆盖命中自身虚影时仍落实当前预览行、明确回拖到第一行才能恢复原位、导航和模型都存在窗口级 pointer 跟踪、每个可排序项都有 preview index，避免后续只调灵敏度却再次引入卡住。',
    keywords: [
      '拖拽排序',
      '虚影',
      '卡住',
      '换位预览',
      'previewIndex',
      'pointermove',
      'pointerup',
      'WorkbenchLibraryPanel',
      'NavSettingsModal',
      'ModelManagePage',
    ],
    updatedAt: '2026-06-18',
  },
  {
    id: 'drag-sort-preview-reverted-on-drag-end-001',
    title: '拖拽换位预览松手后回到原顺序',
    area: '工作台 / 设定条目 / 导航设置 / 模型管理 / 拖拽排序',
    symptom: '拖动条目时界面已经显示 C 方案的换位预览，但松开鼠标后顺序回到拖拽前，用户会感觉虚影落实失败。',
    cause:
      '换位预览会在拖动过程中改变 DOM 顺序，浏览器松手时不一定把 drop 事件派发到原本预期的目标行；设定条目还同时声明了原生 draggable 和 pointer 鼠标拖拽兜底，真实鼠标拖动时可能被原生拖拽抢走 pointer 流程，导致最后预览位置没有提交。后续手感偏灵敏是因为 pointer 拖拽启动阈值只有 6px，轻微鼠标抖动也会进入排序态；列表重排后同一个鼠标坐标可能重新命中下一行，导致第一行刚换到第二行又连跳到第三行。更隐蔽的问题是鼠标只离开第一行一点点时，elementFromPoint 有时命中分组容器而不是具体行，旧逻辑会把它当成拖到分组末尾，于是 1 直接跑到 3 后面。回拖不灵敏则是因为虚影换位后鼠标往回会命中正在拖的条目自身，旧逻辑直接忽略这个落点，用户必须继续拖到上一行才会恢复原位。',
    solution:
      '给设定条目、导航设置、模型管理三个拖拽排序入口增加 drop handled 标记；正常 drop 时立即提交，若 dragEnd 发现没有收到 drop，则使用最后一次 dragOver 的预览目标兜底提交排序。设定条目改为以 pointer 排序为主：移除条目自身的原生 draggable 属性，按下后用窗口级 pointermove/pointerup 持续跟踪鼠标所在行，松手直接按最后虚影位置提交。所有 pointer 排序入口的启动距离统一提高到 14px，并增加 160ms 按住激活延迟和 28px 换目标防连跳距离；设定条目只有在鼠标越过当前分组最后一个可见条目的底部后，才允许触发分组末尾投放。拖过其他行后再次命中自身虚影时允许恢复原始落点，但回拖距离同样保持 28px，避免恢复过敏。',
    prevention:
      '拖拽排序回归测试必须覆盖三条路径：正常 drop 能保存顺序，只有 dragOver + dragEnd、没有 drop 时也能按最后虚影位置保存顺序，以及真实 pointerDown + pointerMove + pointerUp 能在没有原生 draggable 属性时保存顺序；同时覆盖 12px 小移动不会启动排序、未按住足够时间不会启动排序、同一鼠标位置不会让第一行从第二行连跳到第三行、未到第二行时命中分组容器也不能把第一行送到末尾、向下换位后 22px 小幅移动不能继续换到下一行、明确回拖到自身虚影行能恢复原位，避免手感再次变得过灵敏或回拖迟钝。',
    keywords: [
      '拖拽排序',
      '换位预览',
      'dragEnd',
      'drop',
      'pointer',
      'draggable',
      '虚影',
      '拖拽阈值',
      '拖拽延迟',
      '回拖',
      '连跳',
      '分组末尾',
      'elementFromPoint',
      'WorkbenchLibraryPanel',
      'NavSettingsModal',
      'ModelManagePage',
    ],
    updatedAt: '2026-06-18',
  },
  {
    id: 'setting-workspace-tabs-groups-merged-map-001',
    title: '设定页默认标签和分组需要按新结构收束',
    area: '工作台 / 设定 / 默认标签 / 默认分组',
    symptom:
      '设定页仍把“势力设定”和“地点场景”拆成两个顶部标签，并且默认生成过细的设定条目；用户希望改成作品设定、人物设定、势力地图、道具资源、伏笔线索、书写规则六个标签，并完整保留每个标签下的分组。',
    cause:
      '默认设定结构沿用了早期多标签方案，地点类分组独立挂在“地点场景”标签下，默认 starter entries 也把每个小项都建成设定条目，和新的“分组承载分类、正文小标题承载细节”方案不一致。',
    solution:
      '将“世界地图、危险区域”并入“势力地图”顶部标签，保留正派势力、反派势力、中立势力、其他势力、世界地图、危险区域六个分组；默认设定条目压缩为核心设定、世界规则、剧情规划、主线伏笔、人物伏笔、已回收伏笔、硬规则、禁写规则，并清理空白旧默认细条目。',
    prevention:
      '以后调整设定页结构时，测试要同时覆盖顶部标签名称、每个标签的完整分组、默认条目数量，以及旧空白默认条目迁移，避免标签拆散或条目再次膨胀。',
    keywords: ['设定', '默认标签', '默认分组', '势力地图', '地点场景', '默认条目', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-18',
  },
  {
    id: 'setting-create-selected-group-and-drag-sort-001',
    title: '设定页新建设定默认落到最上分组且条目不能自由排序',
    area: '工作台 / 设定 / 新建设定 / 条目排序',
    symptom:
      '在道具资源、地点场景等设定标签下点击“新建 / 设定”时，新条目会自动创建到当前标签的第一个分组，例如道具资源总是落到“功法能力”；同时左侧设定条目只能拖到分组上改归属，不能把同一分组内的条目拖到指定位置排序。',
    cause:
      '新建设定流程只读取当前一级标签的默认第一个分组，没有给弹窗提供“所属分组”选择；拖拽逻辑也只处理分组 drop，没有处理条目 drop，因此缺少“拖到某个条目前面”的持久排序路径。',
    solution:
      '新建设定弹窗增加“所属分组”下拉选择，确认时按用户选择的分组创建设定或角色；列表条目新增 drag over/drop 处理，拖到目标条目上时会把当前条目移动到目标条目前，并在跨分组拖放时同步修改分组归属。',
    prevention:
      '设定页新建流程测试要覆盖“选择非首个分组后创建”，拖拽测试要覆盖“把一个设定拖到另一个设定前并保存顺序”，防止以后回退成默认首组或只能移动分组。',
    keywords: [
      '设定',
      '新建设定',
      '所属分组',
      '拖拽排序',
      '道具资源',
      'WorkbenchLibraryPanel',
      'settingCreateTypeDraft',
    ],
    updatedAt: '2026-06-17',
  },
  {
    id: 'setting-domain-default-entry-filter-first-group-001',
    title: '设定页一级标签只显示第一个分组的默认条目',
    area: '工作台 / 设定 / 一级标签 / 默认设定条目',
    symptom:
      '给势力设定、道具资源、地点场景等一级标签生成默认设定条目后，顶部标签数量显示正确，但切到势力设定时左侧只有“正派势力”显示 1，其它分组仍显示 0。用户会以为默认条目没有创建完整。',
    cause:
      '设定页切到带一级标签的分区时，currentEntries 被筛成该分区的第一个固定分组，例如势力设定只保留“正派势力”，导致同一分区下其它分组条目被左侧分组计数和中间编辑区过滤掉。',
    solution:
      '将 currentEntries 的筛选条件从“当前一级标签的第一个分组”改为“当前一级标签所属的整个分区”，让正派势力、反派势力、中立势力、其他势力等同级分组一起参与左侧计数和编辑区显示。',
    prevention:
      '以后给设定页一级标签增加默认条目或分组时，测试要同时断言顶部一级标签数量、左侧每个分组数量，以及第一个分组之外的条目是否可见。',
    keywords: ['设定', '默认条目', '一级标签', '分区筛选', '势力设定', 'currentEntries', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-16',
  },
  {
    id: 'setting-create-group-domain-hidden-001',
    title: '设定页顶部标签下新建分组后左侧不显示',
    area: '工作台 / 设定 / 新建分组 / 顶部标签',
    symptom:
      '在势力组织、道具资源等设定顶部标签下点击“新建 / 分组”，输入名称并确认后，弹窗关闭但左侧仍只显示原来的固定分组，看起来像无法新建分组。',
    cause:
      '新建分组已经写入 customSettingTypes，但当前顶部标签的左侧列表只保留和标签同名的固定分组，例如势力组织标签只显示“势力组织”，没有记录并读取自定义分组属于哪个顶部标签。',
    solution:
      '新增 setting_type_domains 本地映射；在顶部标签下新建分组时记录分组归属，左侧过滤时显示同名固定分组和归属到当前标签的自定义分组。',
    prevention:
      '以后给设定页增加一级标签时，不能只按设定 type 等于标签名过滤；需要明确保存分组与一级标签的归属关系，并用真实交互测试覆盖新建后立刻显示。',
    keywords: [
      '设定',
      '新建分组',
      '顶部标签',
      '势力组织',
      'customSettingTypes',
      'setting_type_domains',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-16',
  },
  {
    id: 'setting-create-group-ime-enter-001',
    title: '设定页新建分组只能稳定输入数字名',
    area: '工作台 / 设定 / 新建分组弹窗',
    symptom:
      '设定页点击“新建 / 分组”后，输入中文分组名时容易无法正常创建，数字名字可以创建，看起来像只能新建数字名字的分组。',
    cause:
      '新建分组弹窗复用了页面级 activeTabConfig.titleDraft；每次输入都会写入配置并触发设定页重渲染，中文输入法合成过程容易被打断。同时部分输入法会用 Enter 或 keyCode 229 完成选词，不能当作提交。',
    solution:
      '弹窗改用本地 settingCreateDraft 暂存输入，点击确认时才创建分组或设定；Enter 确认同时跳过 event.nativeEvent.isComposing 和 keyCode 229。',
    prevention:
      '以后所有支持中文输入的弹窗、重命名框和标题输入框，不要在输入法合成期间写全局配置或持久存储；如果用 Enter 作为确认键，要同时过滤 IME composition 和 keyCode 229。',
    keywords: [
      '设定',
      '新建分组',
      '中文输入法',
      'IME',
      'isComposing',
      'keyCode 229',
      'settingCreateDraft',
      'confirmSettingCreate',
    ],
    updatedAt: '2026-06-16',
  },
  {
    id: 'detail-outline-empty-selected-chapter-blue-fill-001',
    title: '章纲空章节选中后出现蓝色底色',
    area: '工作台 / 章纲 / 未发布目录',
    symptom:
      '章纲左侧章节数字按钮选中没有章纲的章节时，按钮底色也变成了蓝色，看起来像已有章纲内容，和“只有外圈表示选中”的规则不一致。',
    cause:
      '章节数字按钮把“是否选中”和“是否有章纲/正文”的状态合并成一个类名；选中后只保留 xy-detail-outline-number-selected，丢失了 xy-detail-outline-number-no-outline。selected 样式里还直接写了蓝色背景，并且样式顺序会覆盖内容状态。',
    solution:
      '把章节数字按钮拆成内容状态类和选中状态类：内容状态继续决定白底/有章纲/有正文，选中状态只叠加蓝色外圈；同时把 selected 样式移到内容状态之后，并移除 background 声明。',
    prevention:
      '章纲章节按钮的回归测试要同时断言空章、选中外圈和 CSS 顺序：空章选中必须同时带 no-outline 与 selected 类，selected 不允许写背景色，并且要在内容状态之后生效。',
    keywords: ['章纲', '章节数字按钮', '空章', '选中态', 'xy-detail-outline-number-selected', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-15',
  },
  {
    id: 'smart-import-filled-hidden-groups-stayed-invisible-001',
    title: '智能导入填入隐藏分组后左侧仍只显示一个分组',
    area: '作品信息 / 作品设定 / 智能导入设定',
    symptom:
      '智能导入后本地已经生成多组设定内容，但左侧导航仍只显示“人物设定”等少数未隐藏分组，顶部作品设定数量也只显示可见的几条。',
    cause:
      '之前删除或隐藏过的默认分组会被写入 hidden_setting_types；智能导入虽然创建了对应类型的设定，也会补充 customSettingTypes，但没有把本次导入涉及的分组从 hidden_setting_types 中移除，导致内容存在却被导航过滤。',
    solution:
      '智能导入时收集本次导入的所有作品设定分组；导入完成后自动从 hidden_setting_types 中移除这些分组，并写回 localStorage，让被填入的分组立即在左侧显示。',
    prevention:
      '所有“自动创建/填入分组”的流程都必须同步检查隐藏分组状态；回归测试要同时断言存储条目数量、隐藏列表和左侧可见分组数量。',
    keywords: [
      '智能导入设定',
      '隐藏分组',
      'hidden_setting_types',
      'settingTypeOptions',
      '左侧导航',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-15',
  },
  {
    id: 'smart-import-direct-subsections-skipped-groups-001',
    title: '智能导入跳过没有二级标题包装的顶层分组',
    area: '作品信息 / 作品设定 / 智能导入设定',
    symptom:
      'AI 输出里明明包含 <核心设定>、<主线剧情> 等多个顶层分组，但某些分组因为没有 *二级设定名*： 包装而没有导入。',
    cause:
      'createTaggedSettingSegments 解析到顶层标签后，要求分组正文里必须先出现 *二级标题*：或 #二级标题#：才会继续拆分；像 <核心设定> 下面直接写【故事起点】：这种格式时，整个分组被跳过。只要另一个分组成功解析出结果，导入流程就不会再回退到普通解析。',
    solution:
      '当顶层分组内没有星号或井号二级设定名时，使用顶层标签本身作为设定名，并把【故事起点】、【核心矛盾】等方括号子分类完整保留在正文中。',
    prevention:
      '智能导入回归测试必须覆盖混合格式：一部分顶层分组直接包含【子分类】，另一部分顶层分组使用 *二级设定名*：包住【子分类】，确保分组会导入但三级子分类不会被拆成独立设定。',
    keywords: [
      '智能导入设定',
      '顶层分组',
      '三级子分类',
      '方括号标题',
      'createTaggedSettingSegments',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-15',
  },
  {
    id: 'setting-scope-badge-count-included-hidden-groups-001',
    title: '作品设定顶部数量包含隐藏分组条目',
    area: '作品信息 / 作品设定 / 左侧分组导航',
    symptom: '智能导入后左侧只显示“人物设定”5 条，但顶部“作品设定”胶囊显示 48，数量明显大于当前可见设定。',
    cause:
      '顶部“作品设定”数量直接使用 settingEntries.length，统计了所有保存过的作品设定，包括被隐藏分组、旧分组或当前分组树不可见的条目；左侧分组列表则使用 settingTypeOptions 过滤后的可见分组。',
    solution:
      '将顶部作品设定和人物设定胶囊计数改为可见分组树中的条目数量，分别按 settingTypeOptions 和 roleTypeOptions 过滤后统计。',
    prevention:
      '涉及分组隐藏、分类迁移或智能导入后的导航数量时，顶部汇总计数必须和左侧当前可见分组使用同一套过滤规则。',
    keywords: ['作品设定', '数量', '隐藏分组', 'settingTypeOptions', 'roleTypeOptions', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-15',
  },
  {
    id: 'smart-import-bracket-subsections-split-into-settings-001',
    title: '智能导入把三级子分类误拆成多个设定',
    area: '作品信息 / 作品设定 / 智能导入设定',
    symptom:
      'AI 输出 <核心设定> 下的 *核心设定*：，正文里包含【故事起点】、【核心矛盾】、【读者期待】后，智能导入却生成了“故事起点”“核心矛盾”“读者期待”三条设定。',
    cause:
      '解析器在识别到 *二级设定名*：之后，又继续把正文里的【三级子分类】：当成独立设定标题拆分，混淆了二级设定和三级正文小节。',
    solution:
      '智能导入只把 <顶层标签> 当作分组、把 *...*：或 #...#：当作设定名；【...】：只作为正文里的子分类文本保留，不再拆成独立设定。',
    prevention:
      '智能导入回归测试必须断言“顶层分组 + 星号二级设定名 + 多个方括号子分类”最终只生成一条设定，正文中仍保留所有【子分类】。',
    keywords: [
      '智能导入设定',
      '三级子分类',
      '核心设定',
      'createTaggedSettingSegments',
      '方括号标题',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-15',
  },
  {
    id: 'smart-import-unknown-top-level-group-dropped-001',
    title: '智能导入遇到新一级分组时没有导入任何设定',
    area: '作品信息 / 作品设定 / 智能导入设定',
    symptom:
      'AI 按新格式输出 <资源装备>、<核心设定> 等顶层标签后，点击“智能导入设定”没有生成对应设定，用户感觉智能导入失效。',
    cause:
      '智能导入虽然能解析 <顶层标签>，但在导入前只保留当前 settingTypeOptions 已存在的分组；当顶层标签是新分组或重命名后的分组时，解析结果会被整批过滤为空。',
    solution:
      '移除 taggedSegments 的已存在分组过滤；导入时对 segment.type 做 normalizeSettingType，并把未知分组写入 customSettingTypes，同时展开该分组。',
    prevention:
      '智能导入解析到结构化顶层标签后，应遵循“已有则填入，没有则创建”；回归测试必须覆盖未知顶层分组，避免只验证默认分组。',
    keywords: [
      '智能导入设定',
      '一级分组',
      '未知分组',
      'customSettingTypes',
      'createTaggedSettingSegments',
      'WorkbenchLibraryPanel',
    ],
    updatedAt: '2026-06-15',
  },
];
