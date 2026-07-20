import { Check, ChevronDown, Settings, Sparkles } from 'lucide-react';
import { useState } from 'react';

const compactInput =
  'h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10';

export function CompactLibraryFormTestPage() {
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [advantage, setAdvantage] = useState('');
  const [extra, setExtra] = useState('');
  const [count, setCount] = useState(10);

  return (
    <div className="min-h-full bg-[#F3F6F9] p-6 text-slate-700">
      <div className="mx-auto max-w-[1180px]">
        <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#08AACE]">
            <Sparkles className="h-5 w-5" />
            <b className="text-xs tracking-[0.16em]">COMPACT FORM</b>
          </div>
          <h1 className="mt-2 text-2xl font-black text-slate-950">资料库紧凑行式表单</h1>
          <p className="mt-1 text-sm text-slate-500">
            短字段按内容宽度排列，避免输入框横向铺满；只有长文本保留较宽区域。
          </p>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">脑洞生成</h2>
                <p className="mt-1 text-xs text-slate-400">正常尺寸预览，可直接点击输入。</p>
              </div>
              <span className="rounded-full bg-[#E7F8FD] px-3 py-1 text-xs font-bold text-[#078FAE]">紧凑行式</span>
            </div>

            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[10px] border border-[#08AACE]/40 bg-white">
              <button className="flex h-12 items-center justify-between border-r border-slate-200 px-4 text-left">
                <span>
                  <b className="block text-xs text-[#08AACE]">模型</b>
                  <span className="text-sm font-bold text-slate-700">暂无可用模型</span>
                </span>
                <ChevronDown className="h-4 w-4 text-[#08AACE]" />
              </button>
              <button className="flex h-12 items-center justify-between px-4 text-left">
                <span>
                  <b className="block text-xs text-[#08AACE]">提示词</b>
                  <span className="text-sm font-bold text-slate-700">脑洞</span>
                </span>
                <ChevronDown className="h-4 w-4 text-[#08AACE]" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <label className="flex items-center gap-2">
                  <span className="shrink-0 text-sm font-bold text-slate-600">题材</span>
                  <input
                    value={genre}
                    onChange={(event) => setGenre(event.target.value)}
                    className={`${compactInput} w-[180px]`}
                    placeholder="如都市、玄幻"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="shrink-0 text-sm font-bold text-slate-600">故事主题</span>
                  <input
                    value={theme}
                    onChange={(event) => setTheme(event.target.value)}
                    className={`${compactInput} w-[180px]`}
                    placeholder="如系统流"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="shrink-0 text-sm font-bold text-slate-600">主角金手指</span>
                  <input
                    value={advantage}
                    onChange={(event) => setAdvantage(event.target.value)}
                    className={`${compactInput} w-[260px]`}
                    placeholder="如面板系统、神豪系统"
                  />
                </label>
              </div>

              <label className="mt-3 flex items-start gap-2">
                <span className="w-[84px] shrink-0 pt-2 text-sm font-bold text-slate-600">补充内容</span>
                <textarea
                  value={extra}
                  onChange={(event) => setExtra(event.target.value)}
                  className="h-20 min-w-0 flex-1 resize-none rounded-[10px] border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-4 focus:ring-[#08AACE]/10"
                  placeholder="主角名字、性格、女主设定等"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <b className="text-sm text-slate-700">生成个数</b>
                <div className="flex overflow-hidden rounded-[10px] border border-slate-200 bg-white">
                  {[1, 3, 5, 10].map((item) => (
                    <button
                      key={item}
                      onClick={() => setCount(item)}
                      className={`h-9 w-12 border-r border-slate-200 text-sm font-bold last:border-r-0 ${count === item ? 'bg-[#08AACE] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#08AACE] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#0798B8]">
                <Sparkles className="h-4 w-4" />
                生成
              </button>
            </div>
          </section>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#08AACE]" />
              <h2 className="font-black text-slate-900">节省空间方式</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['短字段不铺满', '题材、故事主题只保留 180px 输入宽度。'],
                ['标签与输入同行', '每个短字段减少一行标签高度。'],
                ['短字段自动并排', '窗口宽度足够时在同一行展示。'],
                ['长文本单独占行', '补充内容保留宽度，高度压缩为 80px。'],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-[10px] border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {title}
                  </div>
                  <p className="mt-1 pl-6 text-xs leading-5 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[10px] border border-cyan-100 bg-[#E7F8FD]/60 p-3 text-xs leading-5 text-[#078FAE]">
              此测试只验证资料库表单密度，不包含作品库、提示词管理或模型管理。
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
