import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { STRUCTURED_SETTING_FIELD_SETS } from '@/features/workbench/components/workbenchStructuredSettings';

import { SettingNameWidthDesignTestPage } from './SettingNameWidthDesignTestPage';
import { getCompactFieldLayout, STRUCTURED_SETTING_PREVIEW_GROUPS } from './structuredSettingCompactLayout';

const pagePath = resolve(process.cwd(), 'src/features/tests/pages/SettingNameWidthDesignTestPage.tsx');
const replicaPath = resolve(process.cwd(), 'src/features/tests/pages/StructuredSettingFullPageReplica.tsx');
const collectionPath = resolve(process.cwd(), 'src/features/tests/pages/TestCollectionPage.tsx');

describe('SettingNameWidthDesignTestPage', () => {
  it('previews every structured setting family with the figure-one form language', () => {
    const source = readFileSync(pagePath, 'utf8');
    const replica = readFileSync(replicaPath, 'utf8');
    const collection = readFileSync(collectionPath, 'utf8');
    expect(source).toContain('StructuredSettingFullPageReplica');
    expect(replica).toContain('STRUCTURED_SETTING_FIELD_SETS');
    expect(replica).toContain('StructuredSettingCompactPreview');
    expect(replica).toContain('ReplicaFlowHeader');
    expect(replica).toContain('ReplicaAiPanel');
    expect(collection).toContain("title: '设定页面完整复原（图1表单）'");
    expect(collection).toContain('原08号测试');
    expect(collection).toContain("path: '/setting-name-width-design-test'");
  });

  it('keeps every current structured setting page in the preview navigation', () => {
    const previewIds = STRUCTURED_SETTING_PREVIEW_GROUPS.flatMap((group) => group.fieldSetIds).sort();
    const formalIds = STRUCTURED_SETTING_FIELD_SETS.map((fieldSet) => fieldSet.id).sort();
    expect(previewIds).toEqual(formalIds);
  });

  it('assigns bounded metadata and long narrative fields to different widths', () => {
    const foreshadow = STRUCTURED_SETTING_FIELD_SETS.find((fieldSet) => fieldSet.id === 'foreshadow-main');
    expect(getCompactFieldLayout(foreshadow!.fields.find((field) => field.key === 'foreshadowCode')!)).toBe('short');
    expect(getCompactFieldLayout(foreshadow!.fields.find((field) => field.key === 'foreshadowContent')!)).toBe('full');
  });

  it('lets the user switch pages and edit the figure-one style controls', () => {
    render(<SettingNameWidthDesignTestPage />);
    expect(screen.getByLabelText('设定名')).toBeInTheDocument();
    expect(screen.getByLabelText('故事类型')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /伏笔线索/ }));
    fireEvent.click(screen.getByRole('button', { name: /1号主线伏笔/ }));
    expect(screen.getByLabelText('伏笔名称')).toBeInTheDocument();
    expect(screen.getByLabelText('伏笔编号')).toHaveAttribute('maxlength', '10');
    expect(screen.getByLabelText('伏笔内容').closest('label')).toHaveAttribute('data-field-layout', 'full');
  });

  it('restores the character domain and the formal right-side AI area', () => {
    render(<SettingNameWidthDesignTestPage />);
    fireEvent.click(screen.getByRole('button', { name: /人物设定/ }));
    expect(screen.getByLabelText('人物姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('外貌')).toBeInTheDocument();
    expect(screen.getByText('生成设定')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '智能导入设定' })).toBeInTheDocument();
  });
});
