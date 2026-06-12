import { ArrowRight, CheckCircle2, ClipboardList, FileText, UserRound } from 'lucide-react';

const workSettingCategories = [
  '核心设定',
  '题材卖点',
  '世界规则',
  '成长体系',
  '金手指',
  '势力组织',
  '人物关系',
  '道具资源',
  '地点地图',
  '主线剧情',
  '伏笔谜团',
  '禁写规则',
  '其他设定',
  '未分类',
];

const characterFields = [
  '人物设定',
  '性格设定',
  '人物背景',
  '人物关系',
  '当前状态',
];

const workCategoryNotes: Record<string, string> = {
  核心设定: '一句话定位、主角处境、故事底层承诺。',
  题材卖点: '男频读者第一眼能看到的爽点、差异点和期待感。',
  世界规则: '世界如何运行，科技、修炼、社会秩序和限制条件。',
  成长体系: '等级、职业、技能、境界、资源消耗与晋升条件。',
  金手指: '主角独有能力、限制、代价、升级方式和误用风险。',
  势力组织: '宗门、公司、官方、反派组织、阵营立场和资源。',
  人物关系: '只放全局关系网或关系规则，具体人物之间的关系优先写回人物卡。',
  道具资源: '关键物品、资源、货币、装备、权限和稀缺性。',
  地点地图: '地图层级、重要地点、交通限制和地域冲突。',
  主线剧情: '长期目标、阶段目标、核心冲突和推进顺序。',
  伏笔谜团: '已埋线索、未揭示真相、回收章节和风险提示。',
  禁写规则: '不能写错、不能越界、不能前后矛盾的硬约束。',
  其他设定: '暂时无法归类但确定要保留的设定。',
  未分类: '智能导入失败或用户临时丢入的待整理内容。',
};

const characterFieldNotes: Record<string, string> = {
  人物设定: '身份、定位、外显标签、能力边界和剧情作用。',
  性格设定: '性格关键词、行为方式、说话习惯、价值观和弱点。',
  人物背景: '出身、经历、秘密、创伤、动机来源和旧关系。',
  人物关系: '与主角、阵营、亲友、敌人、师徒、利益对象的关系。关系绑定人物，不绑定世界。',
  当前状态: '每章后同步身份、伤势、资源、立场、目标、心态和暴露程度。',
};

export function SettingTaxonomyPlanTestPage() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-950">设定分类与人物字段方案测试</h1>
          <p className="mt-1 text-xs font-bold text-slate-400">
            临时保存未做事项：作品设定分类顺序、人物设定字段、人物关系归属，后续实现正式设定页时按这里对照。
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-[#08AACE]/20 bg-[#EAF9FD] px-3 py-1.5 text-xs font-black text-[#078FAE]">
          待迁入正式设定页
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[minmax(360px,1fr)_minmax(420px,1fr)] gap-4">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF9FD] text-[#08AACE]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-900">作品设定分类顺序</h2>
              <p className="mt-0.5 text-xs font-bold text-slate-400">用于设定页左侧分类树和智能导入设定的目标分类。</p>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {workSettingCategories.map((category, index) => (
                <article
                  className="grid grid-cols-[40px_minmax(0,150px)_minmax(0,1fr)] items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-sm font-black text-slate-700">
                      {category}
                    </div>
                  </div>
                  <p className="min-w-0 text-sm leading-6 text-slate-500">{workCategoryNotes[category]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-900">人物设定字段方案</h2>
              <p className="mt-0.5 text-xs font-bold text-slate-400">人物关系放进人物设定卡片，不作为作品设定主分类优先实现。</p>
            </div>
          </div>

          <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-amber-700">
                <CheckCircle2 className="h-4 w-4" />
                建议结论
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                人物关系更适合放在人物设定里。关系绑定人物，不绑定世界。书刚创建、人物少时，把关系写进人物卡更清晰，也方便后续 AI 读取。
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {characterFields.map((field, index) => (
                <article className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-black text-white">
                      {index + 1}
                    </div>
                    <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-sm font-black text-slate-700">
                      {field}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{characterFieldNotes[field]}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <FileText className="h-4 w-4" />
                后续实现提示
              </div>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#08AACE]" />
                  <span>人物设定页新增“人物关系”输入框，位于“人物背景”和“当前状态”之间。</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#08AACE]" />
                  <span>智能导入设定时，作品设定按左侧 14 类排序；人物相关内容优先落到人物卡字段。</span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#08AACE]" />
                  <span>全局“人物关系”分类只保留关系网、阵营关系、家族谱系等跨人物材料。</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
