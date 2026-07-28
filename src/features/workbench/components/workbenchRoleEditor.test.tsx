import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import type { WorkbenchLibraryEntry } from '@/features/workbench/model/workbenchLibraryStorage';

import { RoleBaseStateEditor } from './workbenchRoleEditor';
import {
  parseRoleBaseSettingFields,
  parseRoleContent,
  stringifyRoleContent,
  type RoleContent,
} from './workbenchRoleContent';

function createRoleEntry(role: RoleContent): WorkbenchLibraryEntry {
  return {
    id: 'role-1',
    tab: '人物设定',
    title: '林刻',
    content: stringifyRoleContent(role),
    updatedAt: '2026/7/8 15:40:00',
  };
}

function RoleEditorHarness({
  initialRole,
  roleTypeOptions = ['男主角', '女主角', '未分类'],
}: {
  initialRole: RoleContent;
  roleTypeOptions?: string[];
}) {
  const [entry, setEntry] = useState(() => createRoleEntry(initialRole));
  const role = parseRoleContent(entry.content);

  return (
    <>
      <RoleBaseStateEditor
        entry={entry}
        role={role}
        roleEntries={[entry]}
        roleTypeOptions={roleTypeOptions}
        roleTextFontSize={16}
        currentChapterNumber={1}
        roleLifeStatus={role.lifeStatus}
        onTitleChange={(title) => setEntry((current) => ({ ...current, title }))}
        onRoleChange={(updates) =>
          setEntry((current) => {
            const currentRole = parseRoleContent(current.content);
            return {
              ...current,
              content: stringifyRoleContent({ ...currentRole, ...updates }),
            };
          })
        }
      />
      <output data-testid="saved-role-content">{entry.content}</output>
    </>
  );
}

describe('RoleBaseStateEditor', () => {
  it('uses the current role groups for identity positioning without offering male protagonist', () => {
    render(
      <RoleEditorHarness
        initialRole={{
          type: '女主角',
          lifeStatus: '存活',
          baseSetting: '',
          relationship: '',
          stateSettings: {
            currentSituation: '',
            currentGoal: '',
            abilityState: '',
            resourceState: '',
            otherState: '',
          },
          personality: '',
          background: '',
          status: '',
          history: [],
        }}
        roleTypeOptions={['男主角', '女主角', '核心盟友', '幕后反派']}
      />,
    );

    const identitySelect = screen.getByRole('combobox', { name: '身份定位' });
    expect(identitySelect).toHaveValue('女主角');
    expect(screen.queryByRole('option', { name: '男主角' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: '核心盟友' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '幕后反派' })).toBeInTheDocument();
    fireEvent.change(identitySelect, { target: { value: '核心盟友' } });
    expect(identitySelect).toHaveValue('核心盟友');
    const lifeStatusSelect = screen.getByRole('combobox', { name: '生存状态' });
    expect(identitySelect.parentElement).toHaveStyle({ width: '140px' });
    expect(lifeStatusSelect.parentElement).toHaveStyle({ width: '140px' });
    expect(lifeStatusSelect.parentElement).toHaveClass('rounded-xl', 'border-2', 'border-slate-950', 'bg-white');
    expect(lifeStatusSelect).toHaveValue('存活');
    fireEvent.change(lifeStatusSelect, { target: { value: '死亡' } });
    expect(lifeStatusSelect).toHaveValue('死亡');
    expect(screen.getByTestId('saved-role-content')).toHaveTextContent('"lifeStatus":"死亡"');
  });

  it('keeps typing visible after opening old orphan field labels', () => {
    render(
      <RoleEditorHarness
        initialRole={{
          type: '男主角',
          lifeStatus: '存活',
          baseSetting: ['【外貌】', '【称号/外号/别称】', '【核心性格】：', '【人物背景】：', '【金手指/能力】：'].join(
            '\n',
          ),
          relationship: '',
          stateSettings: {
            currentSituation: '',
            currentGoal: '',
            abilityState: '',
            resourceState: '',
            otherState: '',
          },
          stateUpdateChapters: {},
          personality: '',
          background: '',
          status: '',
          history: [],
        }}
      />,
    );

    const appearanceInput = screen.getByPlaceholderText('身形、容貌、衣着、气质和辨识特征。');
    fireEvent.change(appearanceInput, { target: { value: '黑' } });

    expect(appearanceInput).toHaveValue('黑');
    const savedRole = parseRoleContent(screen.getByTestId('saved-role-content').textContent ?? '');
    expect(parseRoleBaseSettingFields(savedRole.baseSetting).appearance).toBe('黑');
  });

  it('shows locked identity and status controls for the male protagonist', () => {
    render(
      <RoleEditorHarness
        initialRole={{
          type: '男主角',
          lifeStatus: '存活',
          baseSetting: '',
          relationship: '',
          stateSettings: {
            currentSituation: '',
            currentGoal: '',
            abilityState: '',
            resourceState: '',
            otherState: '',
          },
          stateUpdateChapters: {},
          personality: '',
          background: '',
          status: '',
          history: [],
        }}
      />,
    );

    expect(screen.getByRole('combobox', { name: '身份定位' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: '身份定位' })).toHaveValue('男主角');
    const lifeStatusSelect = screen.getByRole('combobox', { name: '生存状态' });
    expect(lifeStatusSelect).toBeDisabled();
    expect(lifeStatusSelect).toHaveValue('存活');
    expect(screen.queryByRole('option', { name: '死亡' })).not.toBeInTheDocument();
    fireEvent.change(lifeStatusSelect, { target: { value: '死亡' } });
    expect(screen.getByTestId('saved-role-content')).toHaveTextContent('"lifeStatus":"存活"');
  });

  it('lets long role fields grow beyond the default compact height', () => {
    const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'scrollHeight');
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 192,
    });

    try {
      render(
        <RoleEditorHarness
          initialRole={{
            type: '男主角',
            lifeStatus: '存活',
            baseSetting: '',
            relationship: '',
            stateSettings: {
              currentSituation: '',
              currentGoal: '',
              abilityState: '',
              resourceState: '',
              otherState: '',
            },
            stateUpdateChapters: {},
            personality: '',
            background: '',
            status: '',
            history: [],
          }}
        />,
      );

      expect(screen.getByPlaceholderText('身形、容貌、衣着、气质和辨识特征。')).toHaveStyle({ height: '192px' });
    } finally {
      if (originalScrollHeight) {
        Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', originalScrollHeight);
      }
    }
  });
});
