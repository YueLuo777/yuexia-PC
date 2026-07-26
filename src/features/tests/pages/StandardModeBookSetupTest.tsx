import { useState } from 'react';

import type { StandardTestBook } from './standardModeFourStageTestModel';

const GENRES = ['玄幻', '仙侠', '都市', '历史', '科幻', '悬疑'];

export function StandardModeBookSetupTest({ onCreate }: { onCreate: (book: StandardTestBook) => void }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('玄幻');

  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-[#f5f5f7] px-8" data-testid="standard-book-setup">
      <section className="w-full max-w-[720px] border-y border-[#dce1e8] bg-white px-10 py-9">
        <div className="text-sm font-semibold text-[#078FAB]">标准模式</div>
        <h1 className="mt-2 text-2xl font-semibold text-[#1f2933]">先创建一本书</h1>
        <p className="mt-2 text-sm leading-6 text-[#7b8794]">书籍创建后会保留进度，下次可以继续进入准备、设定、创作和审核阶段。</p>

        <div className="mt-8 grid grid-cols-2 gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#44515f]">小说名字</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="请输入小说名字"
              className="h-11 w-full rounded-md border border-[#cfd6dd] bg-white px-3 text-sm text-[#26323f] outline-none focus:border-[#08AACE]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#44515f]">小说类型</span>
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="h-11 w-full rounded-md border border-[#cfd6dd] bg-white px-3 text-sm text-[#26323f] outline-none focus:border-[#08AACE]"
            >
              {GENRES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={!title.trim()}
          onClick={() => onCreate({ title: title.trim(), genre })}
          className="mt-8 h-11 w-full rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB] disabled:cursor-not-allowed disabled:bg-[#cbd3d9]"
        >
          创建书籍并进入准备阶段
        </button>
      </section>
    </div>
  );
}
