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

function RoleEditorHarness({ initialRole }: { initialRole: RoleContent }) {
  const [entry, setEntry] = useState(() => createRoleEntry(initialRole));
  const role = parseRoleContent(entry.content);

  return (
    <>
      <RoleBaseStateEditor
        entry={entry}
        role={role}
        roleEntries={[entry]}
        roleTypeOptions={['男主角', '女主角', '未分类']}
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

    const appearanceInput = screen.getByPlaceholderText('身形、容貌、衣着、气质、标志性细节。');
    fireEvent.change(appearanceInput, { target: { value: '黑' } });

    expect(appearanceInput).toHaveValue('黑');
    const savedRole = parseRoleContent(screen.getByTestId('saved-role-content').textContent ?? '');
    expect(parseRoleBaseSettingFields(savedRole.baseSetting).appearance).toBe('黑');
  });
});
