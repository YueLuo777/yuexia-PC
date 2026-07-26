import { useState } from 'react';

import type {
  PreparationView,
  StandardTestBook,
  StandardTestBrainstorm,
} from './standardModeFourStageTestModel';

interface StandardModePreparationStageTestProps {
  book: StandardTestBook;
  view: PreparationView;
  brainstorms: StandardTestBrainstorm[];
  selectedBrainstormId: string;
  onSelectBrainstorm: (id: string) => void;
  onGenerate: (request: string) => void;
  onRevise: (id: string, request: string) => void;
  onGenerateSettings: (id: string) => void;
}

function InputLabel({ children }: { children: string }) {
  return <span className="mb-2 block text-sm font-medium text-[#44515f]">{children}</span>;
}

function GenerateBrainstormView({
  book,
  latestBrainstorm,
  onGenerate,
}: {
  book: StandardTestBook;
  latestBrainstorm?: StandardTestBrainstorm;
  onGenerate: (request: string) => void;
}) {
  const [request, setRequest] = useState('主角从宗门底层起步，有一个能识别功法缺陷的能力');

  return (
    <div className="grid h-full min-h-0 grid-cols-[280px_minmax(420px,1fr)_320px] bg-white">
      <aside className="overflow-y-auto border-r border-[#dce1e8] bg-[#f8f9fa] p-4">
        <h2 className="text-base font-semibold text-[#26323f]">生成要求</h2>
        <p className="mt-1 text-xs leading-5 text-[#8a95a2]">书名和类型已从建书信息中带入。</p>
        <div className="mt-5 space-y-4">
          <label className="block">
            <InputLabel>小说名字</InputLabel>
            <input value={book.title} readOnly className="h-10 w-full rounded-md border border-[#dce1e8] bg-white px-3 text-sm text-[#44515f]" />
          </label>
          <label className="block">
            <InputLabel>小说类型</InputLabel>
            <input value={book.genre} readOnly className="h-10 w-full rounded-md border border-[#dce1e8] bg-white px-3 text-sm text-[#44515f]" />
          </label>
          <label className="block">
            <InputLabel>预计篇幅</InputLabel>
            <select className="h-10 w-full rounded-md border border-[#dce1e8] bg-white px-3 text-sm text-[#44515f]">
              <option>长篇 · 150万字左右</option>
              <option>中篇 · 60万字左右</option>
              <option>短篇 · 20万字以内</option>
            </select>
          </label>
          <label className="block">
            <InputLabel>补充要求</InputLabel>
            <textarea
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              className="h-36 w-full resize-none rounded-md border border-[#dce1e8] bg-white p-3 text-sm leading-6 text-[#44515f] outline-none focus:border-[#08AACE]"
            />
          </label>
        </div>
      </aside>

      <main className="min-h-0 overflow-y-auto px-7 py-6">
        <div className="flex items-center justify-between border-b border-[#e7eaee] pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#26323f]">脑洞预览</h2>
            <p className="mt-1 text-xs text-[#8a95a2]">生成完成后会自动保存进脑洞库。</p>
          </div>
          {latestBrainstorm ? <span className="text-xs font-medium text-[#078FAB]">已保存</span> : null}
        </div>
        <div className="py-6 text-[15px] leading-8 text-[#44515f]">
          {latestBrainstorm ? (
            <>
              <h3 className="text-xl font-semibold text-[#1f2933]">{latestBrainstorm.title}</h3>
              <p className="mt-3 font-medium text-[#078FAB]">{latestBrainstorm.summary}</p>
              <p className="mt-5 whitespace-pre-wrap">{latestBrainstorm.content}</p>
            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center text-sm text-[#a4adb7]">填写要求后生成第一个脑洞</div>
          )}
        </div>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#f8f9fa] p-4">
        <h2 className="text-base font-semibold text-[#26323f]">AI操作台</h2>
        <div className="mt-4 border-t border-[#dce1e8] pt-4 text-sm leading-6 text-[#657180]">
          AI会结合书名、类型、篇幅和补充要求生成完整脑洞。
        </div>
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onGenerate(request)}
            className="h-11 w-full rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB]"
          >
            生成脑洞并保存
          </button>
        </div>
      </aside>
    </div>
  );
}

function BrainstormLibraryView({
  brainstorms,
  selectedBrainstormId,
  onSelectBrainstorm,
  onRevise,
  onGenerateSettings,
}: Omit<StandardModePreparationStageTestProps, 'book' | 'view' | 'onGenerate'>) {
  const [request, setRequest] = useState('');
  const selected = brainstorms.find((item) => item.id === selectedBrainstormId) ?? brainstorms[0];

  return (
    <div className="grid h-full min-h-0 grid-cols-[240px_minmax(440px,1fr)_340px] bg-white">
      <aside className="min-h-0 overflow-y-auto border-r border-[#dce1e8] bg-[#f8f9fa] p-3">
        <div className="px-2 pb-3 text-sm font-semibold text-[#26323f]">脑洞列表</div>
        <div className="space-y-2">
          {brainstorms.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === selected.id ? 'true' : undefined}
              onClick={() => onSelectBrainstorm(item.id)}
              className={[
                'w-full rounded-md border bg-white px-3 py-3 text-left',
                item.id === selected.id ? 'border-[#08AACE]' : 'border-[#dce1e8] hover:border-[#9fdce8]',
              ].join(' ')}
            >
              <div className="truncate text-sm font-semibold text-[#26323f]">{item.title}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#8a95a2]">{item.summary}</div>
            </button>
          ))}
        </div>
      </aside>

      <main className="min-h-0 overflow-y-auto px-7 py-6">
        <div className="border-b border-[#e7eaee] pb-4">
          <div className="text-xs font-medium text-[#078FAB]">脑洞预览</div>
          <h2 className="mt-1 text-xl font-semibold text-[#1f2933]">{selected.title}</h2>
        </div>
        <article className="py-6 text-[15px] leading-8 text-[#44515f]">
          <p className="font-medium text-[#078FAB]">{selected.summary}</p>
          <p className="mt-5 whitespace-pre-wrap">{selected.content}</p>
        </article>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#f8f9fa] p-4">
        <div>
          <h2 className="text-base font-semibold text-[#26323f]">AI修改脑洞</h2>
          <p className="mt-1 text-xs leading-5 text-[#8a95a2]">当前脑洞会自动作为AI上下文。</p>
        </div>
        <textarea
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          placeholder="例如：加强宗门竞争，让主角更稳重"
          className="mt-4 h-32 resize-none rounded-md border border-[#cfd6dd] bg-white p-3 text-sm leading-6 text-[#44515f] outline-none focus:border-[#08AACE]"
        />
        <button
          type="button"
          disabled={!request.trim()}
          onClick={() => {
            onRevise(selected.id, request);
            setRequest('');
          }}
          className="mt-3 h-10 rounded-md border border-[#08AACE] bg-white text-sm font-semibold text-[#078FAB] disabled:border-[#dce1e8] disabled:text-[#a4adb7]"
        >
          按要求修改脑洞
        </button>
        <div className="mt-auto border-t border-[#dce1e8] pt-4">
          <div className="mb-3 text-xs leading-5 text-[#7b8794]">生成设定时会自动关联当前脑洞，不需要再次选择。</div>
          <button
            type="button"
            onClick={() => onGenerateSettings(selected.id)}
            className="h-11 w-full rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB]"
          >
            根据这个脑洞生成设定
          </button>
        </div>
      </aside>
    </div>
  );
}

export function StandardModePreparationStageTest(props: StandardModePreparationStageTestProps) {
  if (props.view === 'library') {
    return <BrainstormLibraryView {...props} />;
  }
  return <GenerateBrainstormView book={props.book} latestBrainstorm={props.brainstorms[0]} onGenerate={props.onGenerate} />;
}
