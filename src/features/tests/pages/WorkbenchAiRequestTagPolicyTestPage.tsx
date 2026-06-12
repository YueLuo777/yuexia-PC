import { Check, X } from 'lucide-react';

import { WORKBENCH_AI_REQUEST_TAG_POLICIES } from '@/features/workbench/model/workbenchAiRequestTagPolicy';

function buildSample(policy: (typeof WORKBENCH_AI_REQUEST_TAG_POLICIES)[number]) {
  if (!policy.useXmlTags) {
    return '脑洞链路继续使用固定表单字段，不额外包 XML 标签。';
  }
  return policy.tags.map((tag) => `<${tag}>\n这里放对应的材料或用户要求。\n</${tag}>`).join('\n\n');
}

export function WorkbenchAiRequestTagPolicyTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="shrink-0 border-b border-slate-100 bg-white px-6 py-4">
        <h1 className="text-xl font-black text-slate-950">AI 请求标签策略测试</h1>
        <p className="mt-1 text-xs font-bold text-slate-400">对照脑洞、大纲、章纲、正文等链路，测试哪些内容需要用标签隔开。</p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {WORKBENCH_AI_REQUEST_TAG_POLICIES.map((policy) => (
            <section key={policy.id} className="flex min-h-[320px] flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{policy.label}</h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{policy.reason}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${
                    policy.useXmlTags
                      ? 'border-red-100 bg-red-50 text-red-600'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  {policy.useXmlTags ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {policy.useXmlTags ? '使用标签' : '不加标签'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {policy.tags.length > 0 ? policy.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">
                    {tag}
                  </span>
                )) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-400">固定字段足够清晰</span>
                )}
              </div>

              <pre className="mt-4 min-h-0 flex-1 overflow-auto rounded-xl border border-slate-100 bg-slate-950 p-4 text-xs font-bold leading-6 text-slate-100">
                {buildSample(policy)}
              </pre>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default WorkbenchAiRequestTagPolicyTestPage;
