import { X } from 'lucide-react';

import { AiInlineInput } from '@/shared/ui/AiInlineInput';
import { WordCountText } from '@/shared/ui/WordCountText';

import { resizeFloatingAiTextarea } from './workbenchFloatingAiTextarea';
import { renderAiChatContent } from './workbenchLibraryRequestLog';

type PlotPointGenerationModalProps = {
  plotPointStandalone: boolean;
  plotPointOutput: string;
  plotPointOutputContent: string;
  plotPointInput: string;
  isLibraryAiLoading: boolean;
  contextTitle: string;
  modelName: string;
  promptName: string;
  linkedReaderCount: number;
  linkedReaderWordCount: number;
  onClose: () => void;
  onOpenReader: () => void;
  onOutputChange: (value: string) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onUseAsOutlineInput: () => void;
  onCopyOutput: () => void;
  onClearOutput: () => void;
};

export function PlotPointGenerationModal({
  plotPointStandalone,
  plotPointOutput,
  plotPointOutputContent,
  plotPointInput,
  isLibraryAiLoading,
  contextTitle,
  modelName,
  promptName,
  linkedReaderCount,
  linkedReaderWordCount,
  onClose,
  onOpenReader,
  onOutputChange,
  onInputChange,
  onSend,
  onStop,
  onUseAsOutlineInput,
  onCopyOutput,
  onClearOutput,
}: PlotPointGenerationModalProps) {
  return (
    <div
      className={
        plotPointStandalone
          ? 'flex min-h-0 flex-1 items-stretch justify-center bg-white'
          : 'modal-sharp fixed inset-0 z-[250] flex items-center justify-center bg-black/35 p-4'
      }
      onClick={plotPointStandalone ? undefined : onClose}
    >
      <div
        className={
          plotPointStandalone
            ? 'flex h-full w-full flex-col overflow-hidden bg-white text-slate-900'
            : 'modal-sharp flex h-[min(760px,88vh)] w-[min(980px,92vw)] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl'
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">生成剧情链</h3>
            <p className="mt-1 text-xs font-bold text-slate-400">
              关联内容与生成章纲一致，会带上大纲设定、前文章纲和当前章节正文。
            </p>
          </div>
          {!plotPointStandalone && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-4">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs font-bold text-slate-400">章节</div>
                <div className="mt-1 font-black text-slate-800">{contextTitle}</div>
              </div>
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs font-bold text-slate-400">模型</div>
                <div className="mt-1 truncate font-black text-slate-800">{modelName}</div>
              </div>
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs font-bold text-slate-400">提示词</div>
                <div className="mt-1 truncate font-black text-slate-800">{promptName}</div>
              </div>
              <div className="rounded-xl bg-white p-3">
                <div className="text-xs font-bold text-slate-400">关联资料</div>
                <div className={`mt-1 font-black ${linkedReaderCount > 0 ? 'text-[#08AACE]' : 'text-slate-500'}`}>
                  已关联 {linkedReaderCount} 项
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  <WordCountText value={linkedReaderWordCount} />
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenReader}
                className="h-10 w-full rounded-xl border border-[#08AACE] bg-white text-sm font-black text-[#08AACE] hover:bg-[#EAF9FD]"
              >
                关联资料
              </button>
            </div>
          </aside>
          <main className="flex min-h-0 flex-col p-5">
            <div className="relative min-h-0 flex-1">
              <div
                className={`xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-fill xy-floating-with-bottom-count h-full ${plotPointOutput.trim() ? 'xy-has-value' : ''}`}
              >
                {plotPointOutput.startsWith('[[THINKING') ? (
                  <div className="xy-floating-rich-preview editor-scrollbar h-full overflow-y-auto text-sm leading-6 text-slate-600">
                    {renderAiChatContent(plotPointOutput)}
                  </div>
                ) : (
                  <textarea
                    data-no-modal-drag="true"
                    value={plotPointOutput}
                    onChange={(event) => onOutputChange(event.target.value)}
                    placeholder={
                      plotPointStandalone
                        ? '生成后的剧情点会显示在这里，也可以手动编辑后复制。'
                        : '生成后的剧情点会显示在这里，可以手动调整后复制到章纲要求里。'
                    }
                    className="editor-scrollbar text-sm leading-6 text-slate-600 outline-none"
                  />
                )}
                <label>剧情点预览</label>
                <span className="xy-floating-count">
                  <WordCountText value={plotPointOutputContent.replace(/\s/g, '').length} />
                </span>
              </div>
            </div>
            <div className="mt-3">
              <AiInlineInput
                value={plotPointInput}
                onChange={(event) => {
                  onInputChange(event.target.value);
                  resizeFloatingAiTextarea(event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault();
                    onSend();
                  }
                }}
                onSend={onSend}
                onStop={onStop}
                sendDisabled={isLibraryAiLoading}
                stopDisabled={!isLibraryAiLoading}
                label="请输入剧情点要求"
                textareaClassName="editor-scrollbar"
              />
            </div>
            <div className="mt-3 flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={onUseAsOutlineInput}
                disabled={!plotPointOutputContent.trim()}
                className="min-w-0 flex-1 bg-[#08AACE] px-3 py-2 text-sm font-black text-white hover:bg-[#0798b8] disabled:bg-slate-300"
              >
                放入章纲要求
              </button>
              <button
                type="button"
                onClick={onCopyOutput}
                disabled={!plotPointOutputContent.trim()}
                className="min-w-0 flex-1 border-l border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
              >
                复制
              </button>
              <button
                type="button"
                onClick={onClearOutput}
                className="min-w-0 flex-1 border-l border-red-200 bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700"
              >
                清空
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
