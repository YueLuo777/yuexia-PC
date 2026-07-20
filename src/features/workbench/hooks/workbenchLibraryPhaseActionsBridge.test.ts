import { describe, expect, it, vi } from 'vitest';
import {
  getWorkbenchLibraryPhaseActions,
  registerWorkbenchLibraryPhaseActions,
} from './workbenchLibraryPhaseActionsBridge';

describe('workbench library phase actions bridge', () => {
  it('keeps the same live action object when later phases register handlers', () => {
    const controllerKey = {};
    const earlyActions = getWorkbenchLibraryPhaseActions(controllerKey);
    const addRole = vi.fn();

    registerWorkbenchLibraryPhaseActions(controllerKey, { addRole, roleEntries: [{ id: 'role-1' }] });

    expect(earlyActions.addRole).toBe(addRole);
    expect(earlyActions.roleEntries).toEqual([{ id: 'role-1' }]);
  });

  it('does not leak actions between two mounted controller instances', () => {
    const firstKey = {};
    const secondKey = {};

    registerWorkbenchLibraryPhaseActions(firstKey, { updateEntry: 'first' });
    registerWorkbenchLibraryPhaseActions(secondKey, { updateEntry: 'second' });

    expect(getWorkbenchLibraryPhaseActions(firstKey).updateEntry).toBe('first');
    expect(getWorkbenchLibraryPhaseActions(secondKey).updateEntry).toBe('second');
  });
});
