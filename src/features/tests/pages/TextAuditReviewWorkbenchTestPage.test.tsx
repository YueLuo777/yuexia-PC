import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextAuditReviewWorkbenchTestPage } from './TextAuditReviewWorkbenchTestPage';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/TextAuditReviewWorkbenchTestPage.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('TextAuditReviewWorkbenchTestPage', () => {
  it('copies the formal review three-column shell, directory, preview toolbar, and AI panel', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContainSource('extractReviewRevisedText(TEXT_AUDIT_REPLICA_AI_OUTPUT)');
    expect(source).toContainSource('splitReviewParagraphs');
    expect(source).toContainSource('buildReviewTextDiff(original, revised)');
    expect(source).toContainSource('REVIEW_PAGE_LEFT_WIDTH');
    expect(source).toContainSource('REVIEW_PAGE_RIGHT_WIDTH');
    expect(source).toContainSource('WORKBENCH_FOLDER_GROUP_BUTTON_CLASS');
    expect(source).toContainSource('ChapterNumberButton');
    expect(source).toContainSource('CombinedAiConfigSelect');
    expect(source).toContainSource('AiInlineInput');
    expect(source).toContainSource('FontSizeStepper');
    expect(source).toContainSource('正文预览');
    expect(source).toContainSource('等宽锁定');
    expect(source).toContainSource('自由调节');
  });

  it('lets the user accept a paragraph and preview the applied result', () => {
    render(<TextAuditReviewWorkbenchTestPage />);

    expect(screen.getByText('第1章 文本审核', { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /第一卷 暗潮初起/ })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '接受本段' })[0]);
    fireEvent.click(screen.getByRole('button', { name: '应用已接受修改（1）' }));

    expect(screen.getByText('最终正文预览', { exact: true })).toBeInTheDocument();
  });

  it('is appended to the AI test group and opens through its own test route', () => {
    const source = readFileSync(collectionPath, 'utf8');

    expect(source).toContainSource('TextAuditReviewWorkbenchTestPage');
    expect(source).toContainSource('/text-audit-review-workbench-test');
    expect(source).toContainSource('文本审核逐段审阅工作台');
    expect(source.indexOf("path: '/text-audit-review-workbench-test'")).toBeGreaterThan(
      source.indexOf("path: '/text-audit-diff-display-test'"),
    );
  });
});
