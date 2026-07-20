import type { ErrorLogEntry } from './errorLogEntryTypes';
export const defaultEntriesPart8: ErrorLogEntry[] = [
  {
    id: 'character-male-female-switch-header-height-stable-001',
    title: '男主角切换到女主角时中间区域不应出现明显落差',
    area: '工作台 / 设定 / 人物设定 / 角色切换',
    symptom: '从男主角切到女主角时，人物设定中间区域会明显上下跳动，像是头部区域突然多出一截。',
    cause: '男主角直接不渲染身份定位和存活死亡控件，女主角会渲染这两个控件，导致两类角色头部骨架高度和视觉重心不一致。',
    solution:
      '男主角继续隐藏身份定位和存活死亡控件，但用同尺寸空占位保留头部结构；女主角显示真实控件，切换时内容区位置保持稳定。',
    prevention:
      '以后隐藏固定属性控件时，如果相邻角色仍会显示同类控件，应优先保留不可见占位，避免切换详情时产生布局落差。',
    keywords: ['人物设定', '男主角', '女主角', '切换', '布局落差', '占位', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-name-compact-vertical-padding-001',
    title: '人物姓名输入框内容上下留白不应过大',
    area: '工作台 / 设定 / 人物设定 / 人物姓名',
    symptom: '人物姓名短框里的输入文字上下留白明显偏大，文字看起来被放在一个过高的空区域里。',
    cause: '人物姓名短框使用 54px 高度并叠加 pt-4 pb-2，输入框又使用 h-full，导致文字区域被上下 padding 拉开。',
    solution:
      '将人物姓名短框改为 48px 居中布局，移除额外上下 padding，并把输入行进一步收紧为 h-6 / leading-6 / 17px 字号，使文字上下间距更紧凑。',
    prevention:
      '头部短字段应优先用 flex items-center 控制垂直居中，不要同时用固定高度、大上下 padding 和 h-full 输入框。',
    keywords: ['人物设定', '人物姓名', '上下留白', '短字段', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'work-basic-and-world-view-two-column-layout-001',
    title: '基础设定和世界观也应使用两列结构化布局',
    area: '工作台 / 设定 / 作品设定 / 基础设定与世界观',
    symptom: '基础设定和世界观各有三个结构化字段，但仍按三列横向平铺，输入框偏窄，和主角金手指优势的新两列布局不一致。',
    cause: '基础设定、世界观字段集仍保留 grid-cols-3，没有跟随长文本结构化设定改为两列顺序流。',
    solution:
      '将基础设定和世界观字段集都改为 grid-cols-2，保持字段顺序不变，使前两个字段在第一行，第三个字段自动落到下一行。',
    prevention: '作品设定里的三字段结构化设定默认使用两列布局，避免为了凑齐字段数而横向挤成三列。',
    keywords: ['作品设定', '基础设定', '世界观', '两列布局', '结构化设定', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'work-cheat-advantage-two-column-layout-001',
    title: '主角金手指优势字段不应五列平铺',
    area: '工作台 / 设定 / 作品设定 / 主角金手指/优势',
    symptom:
      '能力来源、核心功能、升级方式、使用限制、隐藏真相五个字段被排成一行五列，每个框过窄且高度过长，阅读和输入都显得拥挤。',
    cause: '主角金手指/优势结构化字段集沿用了 grid-cols-5，字段数量正好等于五个时全部横向铺开。',
    solution:
      '将该字段集改为两列布局，字段顺序保持为能力来源、核心功能、升级方式、使用限制、隐藏真相，使前两行各两个字段，第三行显示隐藏真相。',
    prevention: '结构化设定字段超过四个时不要默认等列横铺；长文本设定应优先两列或分组布局。',
    keywords: ['作品设定', '主角金手指', '优势', '两列布局', '隐藏真相', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-name-font-match-setting-name-001',
    title: '人物姓名输入框应跟作品设定的设定名保持同字重',
    area: '工作台 / 设定 / 人物设定 / 人物姓名',
    symptom: '人物姓名短框仍使用 text-xl 和 font-black，视觉上比作品设定的设定名、势力名更粗更突出。',
    cause: '人物姓名框最初按角色标题样式迁入，后续只统一了势力名，没有同步把人物姓名从粗黑字降到设定名的中等字重。',
    solution:
      '将人物姓名输入文字改为 text-lg font-medium，浮动标签也改为 font-medium，使人物姓名、势力名和作品设定设定名保持一致。',
    prevention: '头部短字段若属于设定实体名，统一使用设定名样式；只有真正的页面标题或强调标题才使用 font-black。',
    keywords: ['人物设定', '人物姓名', '作品设定', '设定名', '字重', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'faction-title-field-font-match-setting-name-001',
    title: '势力名输入框应跟作品设定的设定名保持同字重',
    area: '工作台 / 设定 / 势力地图 / 势力名',
    symptom: '势力地图里的势力名虽然已经独立到头部短框，但输入文字用了人物姓名式粗黑字，看起来比作品设定的设定名更重。',
    cause:
      '势力名短框从人物姓名样式迁移而来，保留了 text-xl 和 font-black，没有按作品设定的设定名输入框使用 18px 和 500 字重。',
    solution:
      '将势力名短框输入文字改为 text-lg font-medium，浮动标签也降为 font-medium，使它和作品设定的设定名视觉一致。',
    prevention:
      '实体名称字段独立到头部时，要先判断它应对齐人物姓名还是作品设定名；势力名、地点名、物品名这类设定实体名默认对齐作品设定名。',
    keywords: ['势力地图', '势力名', '作品设定', '设定名', '字重', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'ai-request-log-title-toggle-fixed-font-size-001',
    title: '输出日志显示标题内容后正文不能变小变糊',
    area: '作品编辑器 / 输出日志 / 显示标题内容',
    symptom: '点击显示标题内容后，右侧日志正文从纯内容预览切到分组预览，字体看起来变小并发糊。',
    cause:
      '纯内容预览使用 ai-request-log-text 固定日志字体，但分组内容额外叠加 text-xs 和 leading-5，切换后字号和行高发生变化。',
    solution:
      '移除 AiRequestLogGroups 分组内容上的 text-xs 和 leading-5，让标题模式和纯内容模式都使用 ai-request-log-text 的固定 15px 日志字体。',
    prevention:
      '输出日志内容区只允许通过 ai-request-log-text 控制正文字号；分组标题、徽标可以独立设置，但正文不要再叠加 Tailwind 字号类。',
    keywords: ['输出日志', '显示标题内容', '字体模糊', '字号固定', 'AiRequestLogGroups', 'ai-request-log-text'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-male-protagonist-controls-hidden-but-linkable-001',
    title: '男主角身份定位和存活状态只应隐藏不应丢失',
    area: '工作台 / 设定 / 人物设定 / 男主角',
    symptom:
      '男主角详情顶部仍显示身份定位和存活死亡控件，虽然已锁定但占用界面空间，也容易让人误以为这些固定属性需要手动维护。',
    cause: '上一版只把男主角身份和生存状态做成禁用态，没有区分界面无需显示和底层仍要保留数据供关联读取。',
    solution: '男主角详情隐藏身份定位和存活死亡控件，但保留 role.type=男主角 和 lifeStatus=存活 的保存与归一化规则。',
    prevention: '以后隐藏主角专属固定属性时，只隐藏 UI 控件，不移除结构化数据和关联读取字段。',
    keywords: ['人物设定', '男主角', '身份定位', '存活死亡', '隐藏', '关联读取', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'faction-name-standalone-like-character-name-001',
    title: '势力名应像人物姓名一样独立在头部',
    area: '工作台 / 设定 / 势力地图',
    symptom: '势力地图套用三标签后，势力名仍作为固定设定里的一个大文本框，占用了固定设定内容区第一格。',
    cause: '结构化设定标题字段仍沿用 group 内渲染逻辑，只是在固定设定组里追加“势力名”字段，没有迁移到头部短字段。',
    solution:
      '当结构化设定存在 titleFieldLabel 时，在标签区上方渲染独立短边框标题输入框，并从固定设定网格中移除标题字段。',
    prevention:
      '以后结构化设定中的实体名字段，如势力名、地点名、物品名，应优先放在头部短框，不要混入固定设定或状态设定内容网格。',
    keywords: ['势力地图', '势力名', '固定设定', '结构化设定', '头部短框', 'WorkbenchLibraryPanel'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-name-and-role-type-height-match-001',
    title: '人物姓名和身份定位短框高度需要一致',
    area: '工作台 / 设定 / 人物设定 / 头部短字段',
    symptom: '人物姓名框明显高于身份定位框，两个短字段放在同一行时不齐，姓名框显得过大，身份定位显得偏矮。',
    cause: '人物姓名使用 56px 高度，身份定位 CapsuleSelect 使用 40px 本体加浮动标签预留后约 52px，视觉高度不一致。',
    solution: '将人物姓名框缩到 54px，并让身份定位 CapsuleSelect 支持 42px 本体高度，浮动标签预留后与姓名框保持同高。',
    prevention:
      '以后同一行短字段应先统一外观总高度；带浮动标签的 CapsuleSelect 要同时检查按钮本体高度和外层标签预留高度。',
    keywords: ['人物设定', '人物姓名', '身份定位', '高度一致', 'CapsuleSelect', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'setting-faction-tabs-and-role-select-ghosting-001',
    title: '势力地图应使用人物设定三标签且身份定位不能双边框重影',
    area: '工作台 / 设定 / 人物设定与势力地图',
    symptom:
      '男主角身份定位锁定后，选择框内部仍带一层按钮边框，和外层胶囊边框叠在一起形成重影；势力地图结构化设定仍用固定设定和状态设定左右分栏，没有跟随人物设定的标签格局。',
    cause:
      '身份定位 CapsuleSelect 的内层 buttonClassName 继续携带 border-2 border-cyan-200；结构化势力设定沿用 groups 并排渲染，没有抽成固定设定、状态设定、确认三个切换入口。',
    solution:
      '去掉身份定位内层按钮边框，只保留外层胶囊描边；结构化分组设定改为固定设定、状态设定、确认三标签，确认区用于后续 AI 回写前后的确认对照。',
    prevention:
      '以后带浮动标签的胶囊选择框只由外层控件负责边框，内层按钮不要再加边框；势力、角色等有固定和状态边界的设定页优先复用三标签格局。',
    keywords: ['人物设定', '身份定位', '重影', '势力地图', '固定设定', '状态设定', '确认', 'CapsuleSelect'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-male-protagonist-type-locked-001',
    title: '男主角身份定位应锁定不可改分类',
    area: '工作台 / 设定 / 人物设定 / 身份定位',
    symptom: '把主角的身份定位移动到其他分类后，会因为男主角唯一规则无法再移回男主角，导致主角身份丢失。',
    cause: '原逻辑只限制其他角色不能占用男主角分类，并限制男主角存活状态，但没有限制已有男主角被改成其他身份定位。',
    solution:
      '新增男主角身份变更锁定规则，男主角下拉框置灰不可改；角色保存、人物设定保存和拖拽移动分类入口都拒绝把男主角改成其他分类。',
    prevention:
      '以后涉及男主角这类唯一且必保留身份时，既要限制别人进入该分类，也要限制当前男主离开该分类，并在所有写入入口统一兜底。',
    keywords: ['人物设定', '身份定位', '男主角', '锁定', '分类移动', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-pending-update-before-after-compare-001',
    title: '未确认更新需要显示更新前后对照',
    area: '工作台 / 设定 / 人物设定 / 未确认',
    symptom:
      '人物设定的未确认更新只显示一句 AI 反馈，用户无法直接看到人物关系、资源状态或当前目标在确认前后具体会变成什么。',
    cause: '未确认区沿用了早期建议列表的写法，只记录待确认原因，没有把当前已确认内容和 AI 建议更新内容拆成左右对照。',
    solution:
      '将 pendingRoleStateUpdates 改为 beforeTitle、afterTitle、beforeValue、afterValue 结构，并在卡片内渲染左右两栏，左侧显示未更新前内容，右侧显示更新后内容。',
    prevention:
      '以后 AI 回写人物状态前，应先进入未确认区并展示更新前和更新后对比，再由用户手动确认或自动确认写入状态设定。',
    keywords: ['未确认更新', '人物关系', '更新前', '更新后', 'AI反馈', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-edit-meta-move-to-tab-row-001',
    title: '人物编辑章节和字数信息应放在标签行右侧',
    area: '工作台 / 设定 / 人物设定',
    symptom: '“当前编辑 / 状态设定字数”显示在人物姓名下方，挤占左侧头部空间，而标签行右侧留有空白。',
    cause: '方案七迁入时沿用标题信息在姓名区域下方的写法，没有利用标签行右侧的空位。',
    solution: '将当前编辑章节和状态设定字数移动到基础设定、状态设定、未确认标签行右侧，标签按钮保持左侧排列。',
    prevention: '以后人物设定头部的辅助信息优先放在标签行或操作行右侧，避免堆在姓名字段下方。',
    keywords: ['人物设定', '当前编辑', '状态设定字数', '标签行', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-basic-alias-name-field-001',
    title: '人物基础设定需要称号外号别称字段',
    area: '工作台 / 设定 / 人物设定 / 基础设定',
    symptom: '人物基础设定里缺少单独记录称号、外号、别称、化名等称呼信息的字段，只能混写进外貌或背景。',
    cause: '方案七迁入正式页时基础设定只保留外貌、核心性格、人物背景和金手指/能力，没有给人物称呼信息留独立结构。',
    solution: '在人物基础设定字段定义中新增 aliasName，显示名为“称号/外号/别称”，并随基础设定解析和保存流程自动读写。',
    prevention: '以后人物基础设定新增稳定身份类信息时，应作为基础设定字段加入，不要塞进状态设定或正文备注。',
    keywords: ['人物设定', '基础设定', '称号', '外号', '别称', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-name-short-embedded-border-001',
    title: '人物姓名应使用短嵌入边框框体',
    area: '工作台 / 设定 / 人物设定',
    symptom: '人物姓名以标题文字形式显示，和外貌、核心性格等嵌入边框字段风格不一致；姓名字段也不需要占用长宽度。',
    cause:
      '方案七迁入正式页时，为了压缩头部，把姓名临时做成“标签 + 大标题输入”的样式，没有复用下方设定字段的边框语言。',
    solution: '将人物姓名改成短嵌入边框输入框，宽度控制为约 5 个中文名的空间，保留边框浮动标题和紧凑输入样式。',
    prevention: '以后人物姓名这类短字段应优先使用短边框块，不要用标题式文本占位；宽度按真实输入长度控制。',
    keywords: ['人物设定', '人物姓名', '嵌入边框', '短字段', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-relationship-missing-chapter-label-001',
    title: '人物关系缺少未记录章节标记',
    area: '工作台 / 设定 / 人物设定 / 状态设定',
    symptom:
      '状态设定页里当前处境、当前目标、能力状态等字段右上角都有“未记录章节”，但人物关系只显示字数，和同组字段不一致。',
    cause:
      '人物关系早期作为独立角色字段保存，没有纳入 stateUpdateChapters 的章节记录键，迁入状态设定后只沿用了字数标记。',
    solution:
      '扩展状态章节记录键，新增 relationshipState；人物关系右上角使用 getRoleStateUpdateLabel 展示章节状态，编辑人物关系时同步记录当前章节。',
    prevention: '以后人物关系归入状态设定后，应和其他状态字段共享章节记录规则，不再单独使用字数作为右上角状态标记。',
    keywords: ['人物设定', '人物关系', '未记录章节', '状态设定', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-two-column-equal-height-001',
    title: '方案七人物设定不应出现单项独占整行',
    area: '工作台 / 设定 / 人物设定',
    symptom:
      '人物背景、人物关系等字段独占一整行时，页面节奏不统一，纵向空间被拉长；部分文本框高度也偏低，不够填写设定内容。',
    cause:
      '迁入方案七时为了突出长文本字段保留了 col-span-2 跨列布局，同时未确认页使用三列紧凑卡片，和用户希望每行两个设定的规则不一致。',
    solution:
      '将人物设定内容区统一为两列网格，移除人物背景和人物关系等字段的跨列样式；将文本框高度从 96px 提升到 116px，未确认卡片最低高度提升到 125px。',
    prevention:
      '以后人物设定页新增或调整字段时，默认每行两个设定，不让单个设定独占整行；除非用户明确要求重点字段跨行，否则不要使用 col-span-2。',
    keywords: ['人物设定', '方案七', '两列布局', '人物背景', '人物关系', '高度', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-compact-tab-content-001',
    title: '方案七标签与内容之间出现大面积空白',
    area: '工作台 / 设定 / 人物设定',
    symptom: '基础设定、状态设定和未确认标签下方被撑出大块空白，未确认更新卡片出现在很靠下的位置，页面显得松散。',
    cause:
      '人物设定编辑器外层使用单列 grid 承载头部和内容区，但没有明确行高分配，剩余高度会把头部区域撑大；同时未确认页仍按两列大卡片排布，空状态下占用空间过松。',
    solution:
      '将人物设定编辑器外层改为纵向 flex，头部只占实际高度，内容区 flex-1 紧贴标签；未确认页改为三列紧凑卡片，顶部确认条和待确认卡片之间减少间距。',
    prevention:
      '以后在人物设定这类上下结构里，外层优先使用 flex-col 或明确 grid rows，避免 auto grid 行分摊剩余高度；未确认类卡片使用独立紧凑网格。',
    keywords: ['人物设定', '方案七', '未确认', '空白', '紧凑布局', 'RoleBaseStateEditor'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-production-migration-001',
    title: '方案七迁入正式人物设定并删除测试页',
    area: '工作台 / 设定 / 人物设定',
    symptom:
      '方案七已经被用户确定为正式人物设定布局，但仍停留在测试集合里，正式人物设定没有完全承接基础设定、状态设定和未确认更新的结构。',
    cause:
      '布局方案先在测试页验证，确认后缺少迁入正式编辑器并删除测试入口的收尾步骤，容易造成测试页和正式页两套体验并存。',
    solution:
      '将方案七迁入 RoleBaseStateEditor：基础设定保留外貌、核心性格、人物背景、金手指/能力；状态设定保留当前处境、当前目标、人物关系、能力状态、资源状态和其他；未确认作为顶部标签，集中承接 AI 回传状态并提供手动确认、一键确认和自动确认。',
    prevention:
      '以后布局方案被确定采用后，同步移除 TestCollectionPage 中的测试入口和独立测试页，只保留正式页面测试来锁定结构。',
    keywords: ['人物设定', '方案七', '正式页', '未确认', '状态设定', 'RoleBaseStateEditor', 'TestCollectionPage'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-remove-right-summary-001',
    title: '方案七未确认标签独立后右侧状态摘要区应删除',
    area: '测试集合 / 人物设定布局方案测试 / 方案七',
    symptom: '未确认已经成为顶部标签后，右侧仍保留状态设定摘要和自动确认说明，造成内容重复并挤占中间编辑区宽度。',
    cause:
      '上一版为了展示状态摘要和自动确认，将状态设定与未确认说明保留在右侧栏；但未确认改为顶部标签后，该侧栏不再承担必要功能。',
    solution: '删除方案七右侧侧栏，将主区域改为单列铺满；自动确认开关移动到未确认页顶部，与一键确认放在同一操作区。',
    prevention: '以后标签页已经承载独立内容时，不要再在侧栏重复展示同一类摘要；确认类操作优先放在对应标签页顶部。',
    keywords: ['人物设定', '方案七', '右侧栏', '未确认', '自动确认', '一键确认', 'CharacterSettingLayoutPlanTestPage'],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-pending-tab-placement-001',
    title: '方案七未确认入口应放在状态设定右侧标签位',
    area: '测试集合 / 人物设定布局方案测试 / 方案七',
    symptom:
      '用户希望“未确认”出现在顶部标签排中，紧跟状态设定右侧；上一版把未确认更新做成右侧卡片标题，位置不符合预期。',
    cause: '实现时把“状态设定右侧”理解成页面右侧栏，而不是基础设定、状态设定这一排标签中的右侧位置。',
    solution:
      '将方案七顶部标签改为基础设定、状态设定、未确认；点击未确认后在主内容区显示 AI 回传的待确认状态更新，并保留手动确认、一键确认和自动确认入口。',
    prevention: '以后用户用截图指向标签排位置时，应优先理解为同一排控件中的相邻位置，不要把内容移到页面侧栏。',
    keywords: [
      '人物设定',
      '方案七',
      '未确认',
      '状态设定',
      '标签位置',
      '手动确认',
      '自动确认',
      'CharacterSettingLayoutPlanTestPage',
    ],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-pending-state-confirm-001',
    title: '方案七状态更新需要未确认队列和确认模式',
    area: '测试集合 / 人物设定布局方案测试 / 方案七',
    symptom:
      '方案七已经规定 AI 只更新状态设定，但右侧缺少 AI 反馈回来的未确认状态更新队列，用户无法在自动写入前手动核对，也没有一键确认和自动确认模式。',
    cause:
      '上一版只说明 AI 更新边界，没有把“待确认 -> 手动确认/一键确认 -> 写入状态设定”和“自动确认直接写入”的操作流展示出来。',
    solution:
      '在方案七右侧新增“未确认更新”区，展示 AI 回传的状态变更；每条支持手动确认，顶部提供一键确认，并增加自动确认开关，开启后表示可自动写入状态设定。',
    prevention:
      '以后实现正式人物状态更新时，AI 扫描结果默认进入未确认队列；只有用户手动确认、一键确认或开启自动确认后，才写入状态设定字段。',
    keywords: [
      '人物设定',
      '方案七',
      '状态设定',
      '未确认更新',
      '手动确认',
      '一键确认',
      '自动确认',
      'CharacterSettingLayoutPlanTestPage',
    ],
    updatedAt: '2026-06-21',
  },
  {
    id: 'character-layout-plan-seven-basic-state-boundary-001',
    title: '方案七需要明确基础设定和状态设定的更新边界',
    area: '测试集合 / 人物设定布局方案测试 / 方案七',
    symptom:
      '方案七上一版把 AI 更新单独作为标签，并把人物关系、能力状态等内容拆散展示，和用户希望“以后 AI 只更新状态设定，关联内容也只关联状态设定”的规则不一致。',
    cause: '原型仍按展示类别拆出 AI 更新区，没有把字段按“固定基础资料”和“可随正文变化的状态资料”来划边界。',
    solution:
      '方案七收束为基础设定和状态设定两个标签：基础设定只放外貌、核心性格、人物背景、金手指/能力；状态设定放当前处境、当前目标、人物关系、能力状态、资源状态和其他，并提示 AI 只更新状态设定。',
    prevention:
      '以后迁入正式人物设定页时，正文扫描和关联更新逻辑只写入状态设定字段；基础设定作为人工维护的稳定档案，不要被 AI 自动状态更新覆盖。',
    keywords: [
      '人物设定',
      '方案七',
      '基础设定',
      '状态设定',
      'AI更新',
      '人物关系',
      '资源状态',
      'CharacterSettingLayoutPlanTestPage',
    ],
    updatedAt: '2026-06-21',
  },
];
