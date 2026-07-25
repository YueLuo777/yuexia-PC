import { isAiThinkingContent } from '@/features/workbench/model/workbenchAiThinkingProtocol';
import { WordCountText } from '@/shared/ui/WordCountText';
import { renderAiChatContent, type AiSession } from './workbenchAiPanelSupport';

function getMessageFrameClass(role: 'user' | 'assistant', content: string) {
  if (role === 'user') return 'max-w-[82%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-white shadow-sm';
  if (isAiThinkingContent(content)) return 'max-w-[82%]';
  return 'max-w-[82%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm';
}

export function WorkbenchAiConversationView({
  sessions,
  activeSession,
  activeSessionId,
  isLoading,
  loadingText,
  outputFontSize,
  outputWordCount,
  onAddSession,
  onSelectSession,
  onDeleteSession,
  onResetSessions,
}: {
  sessions: AiSession[];
  activeSession: AiSession;
  activeSessionId: number;
  isLoading: boolean;
  loadingText: string;
  outputFontSize: number;
  outputWordCount: number;
  onAddSession: () => void;
  onSelectSession: (id: number) => void;
  onDeleteSession: (id: number) => void;
  onResetSessions: () => void;
}) {
  return (
    <div className="xy-ai-panel-output-slot xy-floating-field xy-floating-outline-fixed xy-floating-outline-preview xy-floating-with-bottom-count xy-floating-chat-shell">
      <div className="xy-floating-rich-preview xy-floating-chat-history editor-scrollbar h-full overflow-y-auto">
        {activeSession.messages.length ? (
          <div className="flex flex-col gap-3">
            {activeSession.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`whitespace-pre-wrap break-words leading-7 ${getMessageFrameClass(message.role, message.content)}`}
                  style={{ fontSize: outputFontSize }}
                >
                  {isLoading && message.role === 'assistant' && message.content === '正在生成...'
                    ? loadingText
                    : renderAiChatContent(message.content)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-start text-gray-400" style={{ fontSize: outputFontSize }}>
            暂无对话内容...
          </div>
        )}
      </div>
      <div className="xy-floating-edge-tool xy-floating-chat-session-tool">
        <div className="flex h-7 max-w-full items-center overflow-visible">
          <div className="xy-floating-session-buttons scrollbar-hidden flex min-w-0 items-center overflow-x-auto">
            <button
              type="button"
              onClick={onAddSession}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand"
              title="新建会话"
            >
              <span className="-mt-px block text-[17px] font-bold leading-none">+</span>
            </button>
            {sessions.map((session, index) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelectSession(session.id)}
                className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border px-1.5 text-xs font-bold leading-none transition-colors ${session.id === activeSessionId ? 'border-brand/30 bg-[#EAF9FD] text-brand' : 'border-gray-200 bg-white text-gray-500 hover:border-brand hover:text-brand'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="xy-floating-edge-tool xy-floating-chat-action-tool">
        <div className="flex h-7 max-w-full items-center gap-1 overflow-hidden bg-white">
          <div className="flex h-6 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => onDeleteSession(activeSessionId)}
              className="px-2 text-[11px] font-bold text-red-500 hover:bg-red-50"
            >
              删除
            </button>
            <button
              type="button"
              onClick={onResetSessions}
              className="border-l border-gray-200 px-2 text-[11px] font-bold text-gray-600 hover:bg-slate-50 hover:text-slate-900"
            >
              清空
            </button>
          </div>
        </div>
      </div>
      <span className="xy-floating-count">
        <WordCountText value={outputWordCount} compact />
      </span>
    </div>
  );
}
