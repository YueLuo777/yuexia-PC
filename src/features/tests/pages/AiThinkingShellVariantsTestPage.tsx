import { BrainCircuit, ChevronDown } from 'lucide-react';

const sample = (
  <>
    <p>我需要仔细检查用户提供的模板，确保输出格式完全匹配。</p>
    <p className="mt-4">模板顶层是作品设定，内部分类和设定条目名必须固定，不能更改。</p>
  </>
);

function ThinkingHeader() {
  return (
    <div className="flex items-center gap-2 text-[#078FB0]">
      <BrainCircuit className="h-4 w-4" />
      <strong className="text-sm font-black">思考过程</strong>
      <ChevronDown className="ml-auto h-4 w-4" />
    </div>
  );
}

const variants = [
  {
    title: 'A 当前双层框',
    note: '保留现在的白色消息框，里面再放蓝色思考框。白色外框就是目前显得多余的那一层。',
    preview: (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="rounded-xl border border-[#08AACE]/25 bg-[#EAF9FD] p-4 text-slate-600">
          <ThinkingHeader />
          <div className="mt-3 border-l-2 border-[#08AACE]/25 pl-4 text-base leading-8">{sample}</div>
        </div>
      </div>
    ),
  },
  {
    title: 'B 单层蓝框',
    note: '删除白色消息框，只保留完整蓝色思考框。边界清楚，也最接近其他页面现有的蓝色思考样式。',
    preview: (
      <div className="rounded-xl border border-[#08AACE]/30 bg-[#EAF9FD] p-4 text-slate-600">
        <ThinkingHeader />
        <div className="mt-3 border-l-2 border-[#08AACE]/30 pl-4 text-base leading-8">{sample}</div>
      </div>
    ),
  },
  {
    title: 'C 蓝色消息块',
    note: '思考内容直接成为一整块浅蓝消息，不再额外套内框，正文区域更宽。',
    preview: (
      <div className="rounded-2xl bg-[#EAF9FD] px-5 py-4 text-slate-600 shadow-sm">
        <ThinkingHeader />
        <div className="mt-3 text-base leading-8">{sample}</div>
      </div>
    ),
  },
  {
    title: 'D 紧凑折叠条',
    note: '标题单独形成蓝色折叠条，展开内容无外框，适合思考内容较长、需要节省横向层级时使用。',
    preview: (
      <div className="overflow-hidden rounded-xl border border-[#08AACE]/30 bg-white">
        <div className="bg-[#EAF9FD] px-4 py-3"><ThinkingHeader /></div>
        <div className="px-4 py-3 text-base leading-8 text-slate-600">{sample}</div>
      </div>
    ),
  },
] as const;

export function AiThinkingShellVariantsTestPage() {
  return (
    <div className="min-h-full overflow-y-auto bg-[#F3F6F9] p-6 text-slate-700">
      <div className="mx-auto max-w-[1280px]">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-sm font-black text-[#08AACE]">思考框外层对比</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">同一段思考内容的四种显示方式</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">只比较外层结构，思考文字、蓝色基调、折叠能力和业务内容保持不变。</p>
        </header>
        <main className="mt-5 grid gap-5 xl:grid-cols-2">
          {variants.map((variant) => (
            <section key={variant.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-black text-slate-950">{variant.title}</h2>
              <p className="mb-4 mt-1 min-h-10 text-sm leading-5 text-slate-500">{variant.note}</p>
              {variant.preview}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
