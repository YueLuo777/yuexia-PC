import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Dna,
  FileText,
  GitMerge,
  Layers3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  deconstructionStages,
  repositoryFindings,
  rightsGuards,
  styleAuditFindings,
  styleProfiles,
  targetGenres,
  transferableAssets,
} from '@/features/tests/pages/storyAnalysisFusionPrototypeData';

type ViewId = 'style-audit' | 'deconstruct' | 'fusion';

const views: Array<{ id: ViewId; label: string }> = [
  { id: 'style-audit', label: '正文后文风审查' },
  { id: 'deconstruct', label: '拆书 + 类型迁移' },
  { id: 'fusion', label: '融合架构与许可' },
];

function SectionTitle({ icon: Icon, title, note }: { icon: typeof Dna; title: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <Icon className="h-4 w-4 text-brand" />
        {title}
      </div>
      {note ? <span className="text-xs font-bold text-slate-400">{note}</span> : null}
    </div>
  );
}

function StyleAuditPrototype() {
  const [profileId, setProfileId] = useState(styleProfiles[0].id);
  const activeProfile = styleProfiles.find((profile) => profile.id === profileId) ?? styleProfiles[0];

  return (
    <div className="space-y-4" data-testid="style-audit-prototype">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle icon={Layers3} title="正文完成后的检查顺序" note="系统推荐，不让新手编排" />
        <div className="mt-4 grid grid-cols-5 gap-2">
          {['正文完成', '剧情审核', '文本审核', '文风审查', '确认后修改'].map((step, index) => (
            <div
              key={step}
              className={`rounded-xl border px-3 py-3 text-center text-xs font-black ${
                index === 3
                  ? 'border-[#8EDFF0] bg-[#EAF9FD] text-[#078FAB]'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className="mb-1 text-[10px] text-slate-400">0{index + 1}</div>
              {step}
            </div>
          ))}
        </div>
      </section>

      <div className="grid min-h-[510px] grid-cols-[250px_minmax(0,1fr)_minmax(320px,0.9fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className="border-r border-slate-200 bg-slate-50 p-4">
          <SectionTitle icon={Dna} title="文风资产" />
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">优先使用本人作品；第三方风格必须确认语料权限。</p>
          <div className="mt-4 space-y-2">
            {styleProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                aria-label={`选择文风：${profile.name}`}
                onClick={() => setProfileId(profile.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  profile.id === activeProfile.id
                    ? 'border-[#8EDFF0] bg-white shadow-sm'
                    : 'border-transparent bg-transparent hover:bg-white'
                }`}
              >
                <div className="text-sm font-black text-slate-800">{profile.name}</div>
                <div className="mt-1 text-xs font-semibold text-slate-400">{profile.source}</div>
                <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
                  {profile.confidence}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
            不提供“模仿某作者”入口，只选择已保存的抽象规则资产。
          </div>
        </aside>

        <section className="border-r border-slate-200 p-5">
          <SectionTitle icon={FileText} title="待审正文" note="第 12 章 · 第 8 段" />
          <div className="mt-4 rounded-xl border border-slate-100 bg-[#FBFCFD] p-5 text-sm font-medium leading-8 text-slate-700">
            林刻在石门前停了很久。他想起执事先前说过的话，也想起一路走来遇到的那些事情，于是慢慢抬起手，终于把掌心贴在冰冷的门上。
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {Object.entries(activeProfile.scores).map(([label, score]) => (
              <div key={label} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between text-xs font-black text-slate-600">
                  <span>{label}</span>
                  <span className={score >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{score}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-4 text-xs font-bold leading-6 text-slate-500">
            审查输入：当前段落 + 本章上下文 + Writing DNA 摘要。默认不发送原始语料库，也不把审查结果直接覆盖正文。
          </div>
        </section>

        <section className="flex min-h-0 flex-col p-5">
          <SectionTitle icon={BookOpenCheck} title="文风偏差" note="3 项" />
          <div className="mt-4 flex-1 space-y-3">
            {styleAuditFindings.map((finding) => (
              <article key={finding.title} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-800">{finding.title}</div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-black ${
                      finding.level === '通过'
                        ? 'bg-emerald-50 text-emerald-700'
                        : finding.level === '需处理'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {finding.level}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">{finding.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="xy-capsule-button justify-center bg-white text-slate-600">
              保留原文
            </button>
            <button type="button" className="xy-wa-primary h-9 rounded-lg px-4 text-sm font-black">
              生成修改建议
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function DeconstructionPrototype() {
  const [stageIndex, setStageIndex] = useState(0);
  const [targetGenre, setTargetGenre] = useState<string>(targetGenres[0][0]);
  const [blueprintReady, setBlueprintReady] = useState(false);
  const activeTarget = targetGenres.find(([id]) => id === targetGenre) ?? targetGenres[0];

  return (
    <div className="space-y-4" data-testid="deconstruction-prototype">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SectionTitle icon={Layers3} title="拆书到迭代的五步管道" note="先预览，再决定是否全书分析" />
        <div className="mt-4 grid grid-cols-5 gap-2">
          {deconstructionStages.map(([number, title], index) => (
            <button
              key={number}
              type="button"
              onClick={() => setStageIndex(index)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                stageIndex === index
                  ? 'border-[#8EDFF0] bg-[#EAF9FD] text-[#078FAB]'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-black opacity-60">STEP {number}</div>
              <div className="mt-1 text-sm font-black">{title}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
          {deconstructionStages[stageIndex][2]}
        </div>
      </section>

      <div className="grid min-h-[520px] grid-cols-[0.9fr_1fr_1.1fr] gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={ShieldCheck} title="原文与权限" />
          <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center">
            <FileText className="mx-auto h-7 w-7 text-brand" />
            <div className="mt-3 text-sm font-black text-slate-800">拖入 TXT / MD</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">本地文件 · 不自动抓取付费章节</div>
            <button type="button" className="mt-4 h-8 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600">
              选择文件
            </button>
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">
            <input type="checkbox" defaultChecked className="mt-1" />
            我确认这是本人作品、合法购买且许可分析的副本，或已经获得权利人授权。
          </label>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
            <AlertTriangle className="mb-2 h-4 w-4" />
            购买阅读权不一定等于获得复制、训练或公开传播权；正式版需要更明确的授权提示。
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Sparkles} title="可迁移资产" note="去除作品外壳" />
          <div className="mt-4 space-y-3">
            {transferableAssets.map(([title, detail]) => (
              <article key={title} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  {title}
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
            丢弃：人物名、专有名词、具体桥段、原句、章节顺序和可识别的独创组合。
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={GitMerge} title="选择目标类型" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {targetGenres.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTargetGenre(id);
                  setBlueprintReady(false);
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-black ${
                  targetGenre === id
                    ? 'border-[#8EDFF0] bg-[#EAF9FD] text-[#078FAB]'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs font-black text-slate-400">迁移预览</div>
            <div className="mt-2 text-base font-black text-slate-900">{activeTarget[1]}</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{activeTarget[2]}</p>
            <div className="mt-4 space-y-2 text-xs font-bold leading-5 text-slate-600">
              <div className="rounded-lg bg-white p-3">保留：信息差、低开高走、阶段反馈</div>
              <div className="rounded-lg bg-white p-3">替换：世界规则、人物关系、资源体系、冲突场景</div>
              <div className="rounded-lg bg-white p-3">新建：目标读者承诺、前三章事件、首卷升级路径</div>
            </div>
            <div className="mt-4 min-h-14 rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs font-bold leading-5 text-slate-500">
              {blueprintReady
                ? `已形成「${activeTarget[1]}」迁移蓝图：只输出新故事骨架，不直接续写或改写原书。`
                : '点击下方按钮后，在固定区域显示迁移蓝图摘要。'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBlueprintReady(true)}
            className="xy-wa-primary mt-4 h-9 rounded-lg px-4 text-sm font-black"
          >
            生成迁移蓝图
          </button>
        </section>
      </div>
    </div>
  );
}

function FusionAndLicensePrototype() {
  return (
    <div className="space-y-4" data-testid="fusion-license-prototype">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={GitMerge} title="推荐合并方式：合并能力，不合并两个仓库运行时" />
        <div className="mt-5 grid grid-cols-[1fr_48px_1.15fr_48px_1fr] items-stretch gap-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-black text-slate-400">合法输入</div>
            <div className="mt-2 text-sm font-black text-slate-900">本人正文 / 已授权对标书</div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">原文独立存储，记录权利确认与模型发送范围。</p>
          </div>
          <div className="flex items-center justify-center text-xl font-black text-slate-300">→</div>
          <div className="rounded-xl border border-[#BDEEF7] bg-[#F4FCFE] p-4">
            <div className="text-xs font-black text-[#078FAB]">月下分析资产库</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-slate-700">
              {['StyleDNA', 'PayoffModule', 'RhythmProfile', 'StoryBlueprint'].map((item) => (
                <div key={item} className="rounded-lg bg-white px-3 py-2 shadow-sm">{item}</div>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">统一版本、来源、证据、置信度和可使用范围。</p>
          </div>
          <div className="flex items-center justify-center text-xl font-black text-slate-300">→</div>
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-900">正文后文风审查</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">读取 StyleDNA，不读取整套原始语料。</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm font-black text-slate-900">拆书 + 类型迁移</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">读取爽点、节奏和蓝图，不复制故事外壳。</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        {repositoryFindings.map((repository) => (
          <section key={repository.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-base font-black text-slate-900">{repository.name}</div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">MIT</span>
            </div>
            <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600">
              <p><strong className="text-slate-800">可借鉴：</strong>{repository.useful}</p>
              <p><strong className="text-slate-800">接入方式：</strong>{repository.integrate}</p>
              <p><strong className="text-slate-800">许可要求：</strong>{repository.license}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <SectionTitle icon={ShieldCheck} title="上线前必须锁住的内容权利边界" note="许可证合规不等于原文合规" />
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
          {rightsGuards.map((guard) => (
            <div key={guard} className="flex items-start gap-2 text-sm font-bold leading-6 text-amber-900">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
              {guard}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function StoryAnalysisFusionTestPage() {
  const [view, setView] = useState<ViewId>('style-audit');
  const pageTopRef = useRef<HTMLElement>(null);

  useEffect(() => {
    pageTopRef.current?.scrollIntoView?.({ block: 'start' });
  }, [view]);

  return (
    <main ref={pageTopRef} className="min-h-full bg-[#F5F8FA] p-6" data-story-analysis-fusion-test>
      <div className="mx-auto max-w-[1580px]">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-brand">
                <Sparkles className="h-4 w-4" />
                方案原型 · 不调用真实 AI
              </div>
              <h1 className="mt-2 text-2xl font-black text-slate-900">文风蒸馏 × 拆书迭代融合方案</h1>
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500">
                把文风蒸馏放进正文后的审查阶段，把拆书结果变成可迁移的爽点、情绪、节奏和结构资产，再由用户选择目标类型生成新故事蓝图。
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right">
              <div className="text-xs font-black text-emerald-700">集成判断</div>
              <div className="mt-1 text-sm font-black text-emerald-900">可以接入 · 建议重写服务层</div>
            </div>
          </div>
          <nav className="mt-5 flex gap-2" aria-label="融合方案页面">
            {views.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`h-9 rounded-lg px-4 text-sm font-black transition-colors ${
                  view === item.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="mt-4">
          {view === 'style-audit' ? (
            <StyleAuditPrototype />
          ) : view === 'deconstruct' ? (
            <DeconstructionPrototype />
          ) : (
            <FusionAndLicensePrototype />
          )}
        </div>
      </div>
    </main>
  );
}
