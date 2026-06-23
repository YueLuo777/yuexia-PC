import { ArrowRight, Check, FolderOpen, MousePointer2, Plus, RefreshCw } from 'lucide-react';

type SettingEntry = {
  group: string;
  title: string;
  body: string;
};

type ParsedSettingEntry = SettingEntry & {
  children: string[];
};

type ImportPreviewEntry = ParsedSettingEntry & {
  status: 'created' | 'updated';
};

const sampleImportText = `<剧情规划>
*剧情蓝图*：

【主线目标】：
内容

【阶段剧情】：
内容

</剧情规划>`;

const existingEntries: SettingEntry[] = [
  {
    group: '剧情规划',
    title: '剧情蓝图',
    body: '【主线目标】：\n旧版本目标。\n\n【阶段剧情】：\n旧版本阶段。',
  },
  {
    group: '核心设定',
    title: '世界架构',
    body: '九重天界按灵气浓度和血脉阶层分层。',
  },
];

function parseSettingImportText(text: string): ParsedSettingEntry[] {
  const sectionPattern = /<([^</>\n]+)>([\s\S]*?)<\/\1>/g;
  const entries: ParsedSettingEntry[] = [];
  let sectionMatch: RegExpExecArray | null;

  while ((sectionMatch = sectionPattern.exec(text)) !== null) {
    const group = sectionMatch[1].trim();
    const sectionBody = sectionMatch[2].trim();
    const titleMatch = sectionBody.match(/^\*([^*\n]+)\*\s*[：:]\s*/m);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();
    const bodyStart = (titleMatch.index ?? 0) + titleMatch[0].length;
    const body = sectionBody.slice(bodyStart).trim();
    const children = Array.from(body.matchAll(/^【([^】\n]+)】\s*[：:]/gm), (match) => match[1].trim());

    entries.push({ group, title, body, children });
  }

  return entries;
}

function applyImportPreview(currentEntries: SettingEntry[], parsedEntries: ParsedSettingEntry[]): ImportPreviewEntry[] {
  return parsedEntries.map((entry) => {
    const exists = currentEntries.some((item) => item.group === entry.group && item.title === entry.title);
    return { ...entry, status: exists ? 'updated' : 'created' };
  });
}

function groupPreviewEntries(entries: ImportPreviewEntry[]) {
  return entries.reduce<Record<string, ImportPreviewEntry[]>>((groups, entry) => {
    groups[entry.group] = [...(groups[entry.group] ?? []), entry];
    return groups;
  }, {});
}

function renameGroup(entries: SettingEntry[], from: string, to: string) {
  return entries.map((entry) => (entry.group === from ? { ...entry, group: to } : entry));
}

const parsedEntries = parseSettingImportText(sampleImportText);
const importPreviewEntries = applyImportPreview(existingEntries, parsedEntries);
const groupedPreviewEntries = groupPreviewEntries(importPreviewEntries);
const renamedEntries = renameGroup(
  [...existingEntries, { group: '临时分组', title: '临时条目', body: '【主线目标】：\n临时目标。' }],
  '临时分组',
  '正式分组',
);

const statusStyles = {
  created: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  updated: 'border-sky-200 bg-sky-50 text-sky-700',
};

const statusText = {
  created: '没有则创建',
  updated: '已有则填入',
};

export function SettingImportHierarchyTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <h1 className="text-xl font-black text-slate-950">智能导入三层结构测试</h1>
        <p className="mt-1 text-xs font-bold text-slate-400">
          验证上一级标签、设定条目、条目子设定的识别方式，以及右键分组菜单新增重命名后的迁移效果。
        </p>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.3fr)_minmax(280px,0.8fr)] gap-5 overflow-hidden p-5">
        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">导入文本样例</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">尖括号标签是上一级标签，星号标题是设定条目，方括号标题是条目里的子设定。</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-500">Prompt</span>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-100 bg-slate-950 p-4 text-xs font-bold leading-6 text-slate-100">
            {sampleImportText}
          </pre>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">模拟导入结果</h2>
              <p className="mt-1 text-xs font-bold text-slate-400">已有则填入，没有则创建；子设定会保留在对应设定条目的正文里。</p>
            </div>
            <span className="rounded-full border border-brand/20 bg-brand-light px-2.5 py-1 text-xs font-black text-brand">Import 3</span>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-auto pr-1">
            {Object.entries(groupedPreviewEntries).map(([group, entries]) => (
              <section key={group} className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-brand" />
                    <span className="text-sm font-black text-slate-900">上一级标签：{group}</span>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-brand">{entries.length}</span>
                </div>

                <div className="mt-3 space-y-3">
                  {entries.map((entry) => (
                    <article key={`${entry.group}-${entry.title}`} className="rounded-xl border border-slate-100 bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-black text-slate-900">设定条目：{entry.title}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusStyles[entry.status]}`}>
                          {statusText[entry.status]}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2">
                        {entry.children.map((child) => (
                          <div key={child} className="contents">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">子设定</span>
                            <span className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700">{child}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-5 overflow-auto">
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-5 w-5 text-brand" />
              <h2 className="text-sm font-black text-slate-900">右键分组菜单</h2>
            </div>
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
              <button className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-black text-slate-700">
                <RefreshCw className="h-4 w-4 text-brand" />
                重命名
              </button>
              <button className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-black text-slate-700">
                <Plus className="h-4 w-4 text-slate-400" />
                新建设定
              </button>
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-slate-400">
              分组重命名后，所有属于原分组的设定条目一起迁移到新分组名下。
            </p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">重命名迁移预览</h2>
            <div className="mt-4 flex items-center gap-2 text-xs font-black text-slate-600">
              <span className="rounded-lg bg-slate-100 px-2 py-1">临时分组</span>
              <ArrowRight className="h-4 w-4 text-slate-300" />
              <span className="rounded-lg bg-brand-light px-2 py-1 text-brand">正式分组</span>
            </div>
            <div className="mt-4 space-y-2">
              {renamedEntries
                .filter((entry) => entry.group === '正式分组')
                .map((entry) => (
                  <div key={`${entry.group}-${entry.title}`} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <span className="text-xs font-black text-slate-700">{entry.title}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                      已迁移
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">正式功能落地判断</h2>
            <ul className="mt-3 space-y-2 text-xs font-bold leading-5 text-slate-500">
              <li>1. 上一级标签不存在时创建分组。</li>
              <li>2. 设定条目同名存在时覆盖正文，不存在时新建。</li>
              <li>3. 子设定保留在对应条目正文里，不拆成独立条目。</li>
              <li>4. 分组右键菜单增加重命名。</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default SettingImportHierarchyTestPage;
