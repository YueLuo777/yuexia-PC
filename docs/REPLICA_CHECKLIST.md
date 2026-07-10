# xinyuexia 对 yuexia 复刻对比清单

说明：

- `✓`：主结构和主流程已接通，可以进入验收阶段
- `△`：已经可用，但和旧项目仍有明显差异
- `×`：还没有真正补齐

本清单同时关注：

- 页面结构
- 按钮与弹窗
- 交互逻辑
- 状态记忆
- 业务链路

| 模块                | 旧项目入口          | 新项目位置                                              | UI结构 | 按钮/弹窗 | 交互/数据 | 当前状态 |
| ------------------- | ------------------- | ------------------------------------------------------- | ------ | --------- | --------- | -------- |
| 首页                | `/dashboard`        | `src/pages/DashboardPage.tsx`                           | ✓      | △         | △         | △        |
| 导航布局            | `DashboardLayout`   | `src/shared/layout/DashboardLayout.tsx`                 | ✓      | ✓         | ✓         | ✓        |
| 导航设置            | `NavSettingsModal`  | `src/shared/navigation/NavSettingsModal.tsx`            | △      | △         | △         | △        |
| 我的小说            | `作品库`            | `src/features/novels/pages/NovelLibraryPage.tsx`        | △      | △         | △         | △        |
| 我的剧本            | `作品库`            | `src/features/novels/pages/NovelLibraryPage.tsx`        | △      | △         | △         | △        |
| 小说编辑器 / 工作台 | `WorkbenchLayout`   | `src/features/workbench/pages/WorkbenchPage.tsx`        | △      | △         | △         | △        |
| 剧本编辑器          | `ScriptEditorV2`    | `src/features/script-editor/pages/ScriptEditorPage.tsx` | △      | △         | △         | △        |
| 提炼剧情            | `ExtractPage`       | `src/features/extract/pages/ExtractPage.tsx`            | △      | △         | △         | △        |
| 剧情库              | `PlotLibrary`       | `src/features/plot-library/pages/PlotLibraryPage.tsx`   | △      | △         | △         | △        |
| 提示词管理          | `PromptZone`        | `src/features/prompts/pages/PromptsPage.tsx`            | △      | △         | △         | △        |
| 模型管理            | `ApiSettings`       | `src/features/models/pages/ModelManagePage.tsx`         | △      | △         | △         | △        |
| 资料库              | `MaterialsPage`     | `src/features/materials/pages/MaterialsPage.tsx`        | △      | △         | △         | △        |
| 云端设置 / 数据库   | `DbSettings`        | `src/features/settings/pages/DbSettingsPage.tsx`        | △      | △         | △         | △        |
| 脑洞生成器          | `IdeaGenerator`     | `src/features/ideas/pages/IdeaGeneratorPage.tsx`        | △      | △         | △         | △        |
| 大纲生成器          | `OutlineGenerator`  | `src/features/ideas/pages/OutlineGeneratorPage.tsx`     | △      | △         | △         | △        |
| 脑洞库              | `IdeaLibrary`       | `src/features/ideas/pages/IdeaLibraryPage.tsx`          | △      | △         | △         | △        |
| 调用数据            | `CallDataPage`      | `src/pages/CallDataPage.tsx`                            | △      | ✓         | △         | △        |
| 标签专区            | `TagZone`           | `src/pages/TagZonePage.tsx`                             | △      | ✓         | △         | △        |
| 按钮测试            | `ButtonTestPage`    | `src/pages/ButtonTestPage.tsx`                          | △      | △         | △         | △        |
| 启动器 / Electron   | Electron + 启动脚本 | `launch-xinyuexia.mjs` / `electron`                     | ✓      | ✓         | △         | △        |

## 已补出的关键能力

- Electron 无原生顶栏，已支持自定义窗口控制按钮
- 全局 `F5` 刷新
- 默认缩放基线已调整
- 模型管理已改成卡片页 + 新增/编辑弹窗
- 提示词管理已改成卡片流 + 创建/编辑弹窗
- 统一确认弹窗组件已接入主要危险操作
- 提炼剧情已恢复：
  - 模块列表
  - 模块编辑
  - 模块预览
  - 长按拖拽排序
  - 预览隐藏
  - 提炼确认弹窗
  - 提炼进度弹窗
  - 提炼历史
- 剧情库已补出“缓存库”视图
- 缓存库已支持“转入剧情库”
- 智能导入已支持 `.txt / .doc / .docx`

## 仍需重点核对的大项

### 1. 小说编辑器 / 工作台

这是当前最大的剩余项。虽然主结构已经可用，但和旧项目相比仍有差距：

- 头部按钮排布和细节
- 左侧章节树细节
- 右侧 AI 助手交互层级
- 设定库 / 概要库 / 备忘录细节
- 若干旧版内置小工具和弹窗

### 2. 提炼剧情

当前已经能跑通主流程，但仍需继续贴近旧版：

- 模块管理细节
- 拖拽手感
- 提炼进度页细节
- 提炼历史与缓存链的细节收口

### 3. 我的小说 / 我的剧本

- 智能导入仍需真实样本文本回归
- 卡片设置和卡片交互仍需继续贴旧版
- 回收站 / 封面 / 导出 / 删除的手感需要继续收

### 4. 提示词管理 / 模型管理 / 剧情库

- 已可用，但还没达到“与旧版几乎无差别”
- 重点差在视觉细节、说明文案、按钮留白和交互反馈

### 5. 启动器最终体验

- 主链已打通
- 但“首次双击是否必稳定拉起”仍需实际反复验

## 建议验收顺序

1. 提炼剧情
2. 我的小说
3. 小说编辑器 / 工作台
4. 提示词管理
5. 模型管理
6. 剧情库
7. 其余边角页
