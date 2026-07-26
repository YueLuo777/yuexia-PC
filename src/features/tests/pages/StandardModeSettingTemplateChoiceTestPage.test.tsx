import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { TEMPLATE_CHOICE_TEST_STORAGE_KEY } from './standardModeTemplateChoiceTestModel';
import { StandardModeSettingTemplateChoiceTestPage } from './StandardModeSettingTemplateChoiceTestPage';

describe('StandardModeSettingTemplateChoiceTestPage', () => {
  beforeEach(() => localStorage.clear());

  it('renames and adds every level before saving the template', () => {
    render(<StandardModeSettingTemplateChoiceTestPage />);

    fireEvent.click(screen.getByRole('button', { name: '修改默认模板' }));
    fireEvent.change(screen.getAllByLabelText('设定分类名称')[0], {
      target: { value: '作品资料' },
    });
    fireEvent.change(screen.getAllByLabelText('设定分组名称')[0], {
      target: { value: '作品基础' },
    });
    fireEvent.change(screen.getAllByLabelText('设定名称')[0], {
      target: { value: '作品方向' },
    });
    fireEvent.change(screen.getAllByLabelText('子设定名称')[0], {
      target: { value: '小说类别' },
    });

    fireEvent.click(screen.getByRole('button', { name: '新增分类' }));
    fireEvent.change(screen.getAllByLabelText('设定分类名称').at(-1)!, {
      target: { value: '宗门设定' },
    });
    fireEvent.click(screen.getByRole('button', { name: '新增分组' }));
    fireEvent.change(screen.getAllByLabelText('设定分组名称')[0], {
      target: { value: '宗门资料' },
    });
    fireEvent.click(screen.getByRole('button', { name: '新增设定' }));
    fireEvent.change(screen.getAllByLabelText('设定名称')[0], {
      target: { value: '青云宗' },
    });
    fireEvent.click(screen.getByRole('button', { name: '新增子设定' }));
    fireEvent.change(screen.getByLabelText('子设定名称'), {
      target: { value: '宗门位置' },
    });

    fireEvent.change(screen.getByRole('textbox', { name: '模板名称' }), {
      target: { value: '玄幻自定义模板' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存到我的模板' }));

    const stored = localStorage.getItem(TEMPLATE_CHOICE_TEST_STORAGE_KEY) ?? '';
    expect(stored).toContain('作品资料');
    expect(stored).toContain('作品基础');
    expect(stored).toContain('作品方向');
    expect(stored).toContain('小说类别');
    expect(stored).toContain('宗门设定');
    expect(stored).toContain('宗门资料');
    expect(stored).toContain('青云宗');
    expect(stored).toContain('宗门位置');
  });

  it('deletes newly added categories and requires confirmation before deleting saved templates', () => {
    render(<StandardModeSettingTemplateChoiceTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '修改默认模板' }));
    fireEvent.click(screen.getByRole('button', { name: '新增分类' }));
    expect(screen.getByDisplayValue('新设定分类')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '新增分组' }));
    fireEvent.click(screen.getByRole('button', { name: '新增设定' }));
    fireEvent.click(screen.getByRole('button', { name: '新增子设定' }));
    fireEvent.click(screen.getByRole('button', { name: '删除子设定：新子设定' }));
    expect(screen.queryByDisplayValue('新子设定')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '删除设定：新设定' }));
    expect(screen.queryByDisplayValue('新设定')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '删除设定分组：新分组' }));
    expect(screen.queryByDisplayValue('新分组')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '删除设定分类：新设定分类' }));
    expect(screen.queryByDisplayValue('新设定分类')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '保存到我的模板' }));
    fireEvent.click(screen.getByRole('button', { name: '我的模板' }));
    fireEvent.click(screen.getByRole('button', { name: '删除模板：未命名模板' }));

    expect(screen.getByText('删除模板？')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '保留模板' }));
    expect(screen.getByRole('button', { name: '选择模板：未命名模板' })).toBeInTheDocument();
  });
});
