import { CheckCircle2, ExternalLink, Search, ShieldCheck, Trophy } from 'lucide-react';

const requirementFields = [
  '题材、频道、主角类型和核心爽点',
  '连载或完结、字数范围和更新要求',
  '目标平台、榜单类型和统计时间范围',
  '必须包含的元素，以及需要排除的内容',
] as const;

const plannedFlow = [
  '用户用自然语言输入找书要求，并选择需要搜索的公开排行榜来源',
  'AI 将要求拆成可核对的筛选条件，再访问榜单页面读取公开书籍信息',
  '按匹配度整理候选书单，保留当前排名、榜单名称、来源链接和查询时间',
  '逐本说明推荐理由与不确定项，用户确认后才能收藏或进入后续分析',
] as const;

const futureSafeguards = [
  '不得编造书名、排名或来源；无法核对的信息必须明确标记未知',
  '每条结果保留原始排行榜链接和查询时间，方便用户自行复查',
  '只读取公开页面，不绕过登录、付费、验证码或平台访问限制',
  '排行榜会随时间变化，结果页面必须提示数据时效，不能当作长期固定结论',
] as const;

export function AiRankingBookSearchIdeaTestPage() {
  return (
    <div className="min-h-full overflow-y-auto bg-[#F5F7FA] p-5 text-slate-700">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
        <header className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                <Search className="h-4 w-4" aria-hidden="true" />
                未做·功能灵感记录
              </div>
              <h1 className="mt-3 text-2xl font-black text-slate-950">AI 排行榜找书</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                用户描述自己想找的小说，AI 搜索公开排行榜并核对来源，最后整理一份带排名、链接和匹配理由的候选书单。
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-right">
              <div className="text-xs font-bold text-amber-700">当前状态</div>
              <div className="mt-1 text-lg font-black text-amber-900">仅记录，尚未实现</div>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-cyan-700" aria-hidden="true" />
              <h2 className="text-base font-black text-slate-950">用户可以提出的找书要求</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {requirementFields.map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-cyan-700" aria-hidden="true" />
              <h2 className="text-base font-black text-slate-950">计划中的找书流程</h2>
            </div>
            <div className="mt-4 space-y-3">
              {plannedFlow.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-bold leading-6">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-cyan-700" aria-hidden="true" />
            <h2 className="text-base font-black text-slate-950">以后实现时必须保留的核对规则</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {futureSafeguards.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" aria-hidden="true" />
                <p className="text-sm font-bold leading-6">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AiRankingBookSearchIdeaTestPage;
