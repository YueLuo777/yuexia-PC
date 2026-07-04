import { AlertTriangle, CheckCircle2, FileText, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

type AuditMetric = {
  label: string;
  value: '通过' | '不通过' | '是' | '否';
};

type AuditAnnotation = {
  id: string;
  severity: string;
  type: string;
  paragraphIndex: number;
  originalText: string;
  problem: string;
  suggestion: string;
  action: string;
};

type AuditScenario = {
  id: 'pass' | 'fail';
  title: string;
  badge: string;
  outline: string;
  paragraphs: string[];
  metrics: AuditMetric[];
  summary: string;
  annotations: AuditAnnotation[];
};

const auditScenarios: AuditScenario[] = [
  {
    id: 'pass',
    title: '结构通过样例',
    badge: '可进入文本审核',
    outline: [
      '第1章章纲：',
      '1. 主角夜巡废弃药园，发现灵泉异常复苏。',
      '2. 主角用祖传玉牌试探灵泉，确认玉牌能吸收泉气。',
      '3. 宗门执事突然出现，主角隐藏玉牌，只承认发现水脉。',
      '4. 本章目标：主角获得秘密资源，但不能暴露底牌。',
    ].join('\n'),
    paragraphs: [
      '夜色压在废弃药园上，沈青沿着塌了一半的石阶往下走，听见枯井里传出细微的水声。',
      '他取出祖传玉牌贴近井口，玉牌边缘浮出一线微光，井底的灵泉也随之翻起淡淡雾气。',
      '沈青刚要继续试探，外院执事的脚步声已经逼近。他立刻收起玉牌，只说自己发现了地下水脉。',
      '执事半信半疑地记下位置，转身去叫人。沈青低头看着掌心余温，知道自己终于有了不能让旁人知道的底牌。',
    ],
    metrics: [
      { label: '是否符合章纲', value: '通过' },
      { label: '是否完成本章目标', value: '是' },
      { label: '人物行为是否合理', value: '是' },
      { label: '剧情因果是否顺畅', value: '是' },
      { label: '设定是否一致', value: '是' },
      { label: '是否建议进入文本审核', value: '是' },
    ],
    summary: '正文覆盖了章纲要求的灵泉复苏、玉牌试探、执事出现和隐藏底牌。本章目标完成，主角行为动机清楚，可以进入文本审核。',
    annotations: [],
  },
  {
    id: 'fail',
    title: '结构未通过样例',
    badge: '先修结构再复审',
    outline: [
      '第1章章纲：',
      '1. 主角夜巡废弃药园，发现灵泉异常复苏。',
      '2. 主角用祖传玉牌试探灵泉，确认玉牌能吸收泉气。',
      '3. 宗门执事突然出现，主角隐藏玉牌，只承认发现水脉。',
      '4. 本章目标：主角获得秘密资源，但不能暴露底牌。',
    ].join('\n'),
    paragraphs: [
      '夜色压在废弃药园上，沈青沿着塌了一半的石阶往下走，听见枯井里传出细微的水声。',
      '他取出祖传玉牌贴近井口，玉牌边缘浮出一线微光，井底的灵泉也随之翻起淡淡雾气。',
      '沈青心中一喜，当场把玉牌递给外院执事，说这是祖上传下来的宝物，应该能帮宗门找出灵泉源头。',
      '执事拍了拍他的肩，当即决定把玉牌带回内堂检查。沈青松了口气，觉得自己终于为宗门立了一功。',
    ],
    metrics: [
      { label: '是否符合章纲', value: '不通过' },
      { label: '是否完成本章目标', value: '否' },
      { label: '人物行为是否合理', value: '否' },
      { label: '剧情因果是否顺畅', value: '否' },
      { label: '设定是否一致', value: '是' },
      { label: '是否建议进入文本审核', value: '否' },
    ],
    summary: '正文写到了灵泉和玉牌，但主角主动暴露玉牌，和章纲“隐藏底牌”的本章目标相反。当前不建议进入文本审核，应先改写第3-4段结构。',
    annotations: [
      {
        id: 'S001',
        severity: '严重',
        type: '本章目标未完成',
        paragraphIndex: 3,
        originalText: '当场把玉牌递给外院执事',
        problem: '章纲要求主角隐藏玉牌，只承认发现水脉；这里直接暴露底牌，改变了本章结果。',
        suggestion: '改为主角迅速收起玉牌，对执事隐瞒真实发现，只说井下可能有地下水脉。',
        action: '重写',
      },
      {
        id: 'S002',
        severity: '中等',
        type: '人物动机',
        paragraphIndex: 4,
        originalText: '觉得自己终于为宗门立了一功',
        problem: '主角刚发现私人底牌就主动交给宗门，缺少足够动机支撑。',
        suggestion: '如果要保留主动上交，需要提前补充主角极度信任宗门或急需宗门庇护的理由。',
        action: '调整',
      },
    ],
  },
];

function isPositiveAuditValue(value: AuditMetric['value']) {
  return value === '通过' || value === '是';
}

function renderMarkedParagraph(paragraph: string, annotations: AuditAnnotation[]) {
  if (annotations.length === 0) return paragraph;
  const matched = annotations.find((annotation) => paragraph.includes(annotation.originalText));
  if (!matched) return paragraph;
  const [before, afterStart] = paragraph.split(matched.originalText);
  return (
    <>
      {before}
      <mark className="rounded bg-red-100 px-1 font-black text-red-700" title={matched.problem}>{matched.originalText}</mark>
      {afterStart}
    </>
  );
}

function buildAiResultText(scenario: AuditScenario) {
  const annotationJson = JSON.stringify(scenario.annotations, null, 2);
  return [
    '【结构审核结论】',
    ...scenario.metrics.map((metric) => `${metric.label}：${metric.value}`),
    '',
    '结论说明：',
    scenario.summary,
    '',
    '# 原文标注',
    '```json',
    annotationJson,
    '```',
  ].join('\n');
}

export function StructureAuditResultPreviewTestPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<AuditScenario['id']>('fail');
  const scenario = auditScenarios.find((item) => item.id === activeScenarioId) ?? auditScenarios[0];
  const aiResultText = useMemo(() => buildAiResultText(scenario), [scenario]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
        <div>
          <h1 className="text-base font-black text-slate-900">结构审核结果展示测试</h1>
          <p className="mt-0.5 text-xs font-bold text-slate-400">模拟 AI 对“章纲 + 原文”的结构审核输出，以及页面如何显示结论和标注。</p>
        </div>
        <div className="flex items-center gap-2">
          {auditScenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveScenarioId(item.id)}
              className={`h-9 rounded-lg border px-3 text-xs font-black transition-colors ${
                item.id === activeScenarioId
                  ? 'border-[#9BEFFC] bg-[#EAF9FD] text-[#078fb0]'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[26%_1fr_1fr_340px] bg-white">
        <section className="flex min-h-0 flex-col border-r border-slate-100">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 text-xs font-black text-slate-500">
            <FileText className="h-4 w-4 text-[#08AACE]" />
            第1章 章纲
          </div>
          <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words p-5 font-sans text-sm leading-7 text-slate-700">
            {scenario.outline}
          </pre>
        </section>

        <section className="flex min-h-0 flex-col border-r border-slate-100">
          <div className="flex h-10 shrink-0 items-center border-b border-slate-100 bg-slate-50 px-4 text-xs font-black text-slate-500">第1章 原文</div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 text-sm leading-7 text-slate-700">
            {scenario.paragraphs.map((paragraph, index) => (
              <p key={index} className="border-l-2 border-transparent px-3 py-1.5">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col border-r border-slate-100">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-100 bg-[#EAF9FD] px-4">
            <span className="text-xs font-black text-[#078fb0]">第1章 AI标注</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400">{scenario.annotations.length} 条</span>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5 text-sm leading-7 text-slate-700">
            {scenario.paragraphs.map((paragraph, index) => {
              const paragraphAnnotations = scenario.annotations.filter((annotation) => annotation.paragraphIndex === index + 1);
              return (
                <div
                  key={index}
                  className={`border-l-2 px-3 py-1.5 ${
                    paragraphAnnotations.length > 0 ? 'border-red-300 bg-red-50/40' : 'border-transparent'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{renderMarkedParagraph(paragraph, paragraphAnnotations)}</p>
                  {paragraphAnnotations.map((annotation) => (
                    <div key={annotation.id} className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold leading-5 text-red-700">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black">{annotation.id}</span>
                        <span>{annotation.severity}</span>
                        <span>{annotation.type}</span>
                        <span>{annotation.action}</span>
                      </div>
                      <div className="mt-1">问题：{annotation.problem}</div>
                      <div className="mt-1">建议：{annotation.suggestion}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col bg-slate-50">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
            <span className="text-xs font-black text-slate-500">审核结果</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
              scenario.id === 'pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {scenario.badge}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                {scenario.id === 'pass' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                <h2 className="text-sm font-black text-slate-900">结构审核结论</h2>
              </div>
              <div className="space-y-2">
                {scenario.metrics.map((metric) => {
                  const positive = isPositiveAuditValue(metric.value);
                  return (
                    <div key={metric.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-black">
                      <span className="text-slate-500">{metric.label}</span>
                      <span className={positive ? 'text-emerald-600' : 'text-red-600'}>{metric.value}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs font-bold leading-5 text-slate-500">{scenario.summary}</p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-black text-[#078fb0]">
                <Send className="h-4 w-4" />
                AI 完整输出
              </div>
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                {aiResultText}
              </pre>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
