# 功能专区生成器归档

归档时间：2026-06-09

这里保存从正式功能专区剥离的旧生成器链路，后续如果需要恢复或参考，可以从这里取回。

包含内容：

- `src/features/ideas/pages/IdeaGeneratorPage.tsx`：脑洞生成器页面
- `src/features/ideas/pages/OutlineGeneratorPage.tsx`：大纲生成器页面
- `src/features/ideas/pages/IdeaLibraryPage.tsx`：旧脑洞库页面及生成器跳转链路
- `src/features/ideas/hooks/useIdeaStorage.ts`：脑洞生成器相关本地存储逻辑
- `src/features/ideas/model/ideaTypes.ts`：脑洞生成器相关类型

正式应用中已删除 `/idea-generator`、`/outline-generator` 和 `/idea-library` 路由；`Token用量` 保留，并移动到数据专区。
