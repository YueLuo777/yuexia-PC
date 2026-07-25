import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { createAiThinkingPlaceholder } from '@/features/workbench/model/workbenchAiThinkingProtocol';

import { renderAiChatContent as renderBodyAiChatContent } from './workbenchAiPanelSupport';
import { renderAiChatContent as renderLibraryAiChatContent } from './workbenchLibraryRequestLog';
import { WorkbenchAiConversationView } from './WorkbenchAiConversationView';

const currentDir = dirname(fileURLToPath(import.meta.url));

function readSource(relativePath: string) {
  return readFileSync(join(currentDir, relativePath), 'utf8');
}

describe('workbench AI thinking first frame', () => {
  afterEach(cleanup);

  it('renders the first body and library AI frames as the shared blue thinking card', () => {
    const pendingOutput = createAiThinkingPlaceholder(0);

    render(renderBodyAiChatContent(pendingOutput));
    expect(screen.getByText('正在思考（0 秒）')).toBeInTheDocument();
    expect(screen.queryByText('正在思考...')).not.toBeInTheDocument();
    cleanup();

    render(renderLibraryAiChatContent(pendingOutput));
    expect(screen.getByText('正在思考（0 秒）')).toBeInTheDocument();
    expect(screen.queryByText('正在思考...')).not.toBeInTheDocument();
  });

  it('keeps every formal AI sender on the marker-backed first frame', () => {
    const bodySource = readSource('WorkbenchAIPanel.tsx');
    const outlineSource = readSource('createOutlineControllerPhase3.tsx');
    const librarySource = readSource('../hooks/useWorkbenchLibraryControllerPhase4.tsx');
    const reviewSource = readSource('../hooks/useChapterReviewRequest.ts');

    expect(bodySource).toContain('const pendingOutput = createAiThinkingPlaceholder(0);');
    expect(outlineSource).toContain("const pendingOutput = formatAiThinkingResponse('', '', 0, false);");
    expect(librarySource).toContain("formatAiThinkingResponse('', '', 0, false)");
    expect(reviewSource).toContain('const pendingOutput = createAiThinkingPlaceholder(0);');

    for (const source of [bodySource, outlineSource, librarySource]) {
      expect(source).not.toContain("initialOutput: '正在思考...'");
    }
  });

  it('does not wrap the body thinking card in a second white assistant bubble', () => {
    const pendingOutput = createAiThinkingPlaceholder(0);
    const session = {
      id: 1,
      input: '',
      output: pendingOutput,
      linkChapter: false,
      hasSentChapterContext: false,
      messages: [{ id: 1, role: 'assistant' as const, content: pendingOutput }],
    };

    render(
      <WorkbenchAiConversationView
        sessions={[session]}
        activeSession={session}
        activeSessionId={1}
        isLoading
        loadingText="正在生成"
        outputFontSize={14}
        outputWordCount={0}
        onAddSession={() => undefined}
        onSelectSession={() => undefined}
        onDeleteSession={() => undefined}
        onResetSessions={() => undefined}
      />,
    );

    const thinkingCard = screen.getByText('正在思考（0 秒）').closest('.rounded-xl');
    expect(thinkingCard).not.toBeNull();
    expect(thinkingCard?.parentElement).not.toHaveClass('bg-white', 'bg-gray-50', 'border-gray-200');
  });

  it('removes the extra assistant bubble from setting and brainstorm thinking turns', () => {
    const settingViewSource = readSource('workbenchSettingLibraryView.tsx');

    expect(settingViewSource).toContain('isAiThinkingContent(content)');
    expect(settingViewSource).toContain("if (isAiThinkingContent(content)) return 'max-w-[96%]';");
  });
});
