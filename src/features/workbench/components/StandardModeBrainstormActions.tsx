import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';
import { countTextWords } from '@/features/workbench/model/workbenchLibraryPanelModel';
import { getBrainstormEntryBody } from './workbenchLibraryAiText';

type StandardModeBrainstormActionsProps = {
  entry: WorkbenchLibraryEntry | null;
  onCreateSettings: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
};

export function StandardModeBrainstormActions({
  entry,
  onCreateSettings,
  onCopy,
  onDuplicate,
}: StandardModeBrainstormActionsProps) {
  const content = entry ? getBrainstormEntryBody(entry) : '';
  return (
    <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#fbfdff] p-4">
      <div className="border-b border-[#dce1e8] pb-3">
        <h2 className="text-base font-bold text-[#1f2933]">脑洞操作</h2>
        <p className="mt-1 text-xs font-medium text-[#8a95a2]">围绕当前选中的脑洞继续下一步。</p>
      </div>

      {entry ? (
        <div className="min-h-0 flex-1 py-4">
          <dl className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-md border border-[#BFC8D2] bg-white p-4 text-sm">
            <dt className="font-semibold text-[#8a95a2]">脑洞名称</dt>
            <dd className="truncate font-bold text-[#1f2933]" title={entry.title}>{entry.title}</dd>
            <dt className="font-semibold text-[#8a95a2]">内容字数</dt>
            <dd className="font-bold text-[#1f2933]">{countTextWords(content)} 字</dd>
            <dt className="font-semibold text-[#8a95a2]">创建时间</dt>
            <dd className="font-semibold text-[#657180]">{entry.createdAt || '暂无记录'}</dd>
            <dt className="font-semibold text-[#8a95a2]">最近修改</dt>
            <dd className="font-semibold text-[#657180]">{entry.updatedAt || entry.createdAt || '暂无记录'}</dd>
          </dl>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 place-items-center px-6 text-center text-sm font-semibold leading-6 text-[#8a95a2]">
          从左侧选择一个脑洞后，这里会显示可执行的操作。
        </div>
      )}

      <div className="shrink-0 space-y-2 border-t border-[#dce1e8] pt-3">
        <button type="button" disabled={!entry} onClick={onCreateSettings} className="h-10 w-full rounded-md border border-[#0799B8] bg-[#08AACE] text-sm font-bold text-white disabled:border-[#A8D3DD] disabled:bg-[#b9dce4]">
          根据此脑洞生成设定
        </button>
        <div className="grid grid-cols-2 gap-2" data-brainstorm-library-copy-actions="true">
          <button type="button" disabled={!entry || !content.trim()} onClick={onCopy} className="h-9 min-w-0 rounded-md border border-[#BFC8D2] bg-white px-2 text-sm font-semibold text-[#657180] disabled:text-[#b8c0ca]">
            复制脑洞
          </button>
          <button type="button" disabled={!entry} onClick={onDuplicate} className="h-9 min-w-0 rounded-md border border-[#BFC8D2] bg-white px-2 text-sm font-semibold text-[#657180] disabled:text-[#b8c0ca]">
            创建脑洞副本
          </button>
        </div>
      </div>
    </aside>
  );
}
