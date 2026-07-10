import { describe, expect, it, beforeEach, vi } from 'vitest';

import {
  clearFinishedBackgroundAiTasks,
  getBackgroundAiTask,
  getBackgroundAiTasksSnapshot,
  resetBackgroundAiTasksForTests,
  startBackgroundAiTask,
  stopBackgroundAiTask,
  subscribeBackgroundAiTasks,
} from './backgroundAiTasks';

function waitForTask(taskId: string, predicate: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();
    const tick = () => {
      if (predicate()) {
        resolve();
        return;
      }
      if (Date.now() - startedAt > 1000) {
        reject(new Error(`Timed out waiting for task ${taskId}`));
        return;
      }
      window.setTimeout(tick, 0);
    };
    tick();
  });
}

describe('backgroundAiTasks', () => {
  beforeEach(() => {
    resetBackgroundAiTasksForTests();
    localStorage.clear();
  });

  it('keeps streaming after the subscriber is removed', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const events: number[] = [];
    const unsubscribe = subscribeBackgroundAiTasks(() => {
      events.push(getBackgroundAiTasksSnapshot().length);
    });

    const task = startBackgroundAiTask({
      kind: 'detailOutline',
      title: '章纲后台测试',
      input: '测试切页后继续输出',
      runner: async ({ emit }) => {
        emit('第一段');
        await gate;
        emit('第二段');
      },
    });

    await waitForTask(task.id, () => getBackgroundAiTask(task.id)?.output === '第一段');
    unsubscribe();
    release();
    await waitForTask(task.id, () => getBackgroundAiTask(task.id)?.status === 'success');

    expect(events.length).toBeGreaterThan(0);
    expect(getBackgroundAiTask(task.id)?.output).toBe('第一段第二段');
    expect(getBackgroundAiTask(task.id)?.status).toBe('success');
  });

  it('stops a running task only when explicitly aborted', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const task = startBackgroundAiTask({
      kind: 'chapterDraft',
      title: '正文后台测试',
      runner: async ({ emit, signal }) => {
        emit('开头');
        await gate;
        if (signal.aborted) return;
        emit('结尾');
      },
    });

    await waitForTask(task.id, () => getBackgroundAiTask(task.id)?.output === '开头');
    stopBackgroundAiTask(task.id);
    release();
    await waitForTask(task.id, () => getBackgroundAiTask(task.id)?.status === 'aborted');

    expect(getBackgroundAiTask(task.id)?.output).toBe('开头');
    expect(getBackgroundAiTask(task.id)?.error).toBe('已手动停止。');
  });

  it('clears finished tasks but keeps running tasks visible', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const runningTask = startBackgroundAiTask({
      kind: 'outline',
      title: '大纲后台测试',
      runner: async ({ emit }) => {
        emit('等待中');
        await gate;
      },
    });
    const finishedTask = startBackgroundAiTask({
      kind: 'brainstorm',
      title: '脑洞后台测试',
      runner: async ({ emit }) => {
        emit('完成');
      },
    });

    await waitForTask(finishedTask.id, () => getBackgroundAiTask(finishedTask.id)?.status === 'success');
    clearFinishedBackgroundAiTasks();

    expect(getBackgroundAiTask(runningTask.id)?.status).toBe('running');
    expect(getBackgroundAiTask(finishedTask.id)).toBeNull();
    release();
  });

  it('coalesces rapid stream chunks before serializing task snapshots', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const task = startBackgroundAiTask({
      kind: 'review',
      title: '流式持久化限流',
      runner: async ({ emit }) => {
        for (let index = 0; index < 50; index += 1) emit(String(index));
        await gate;
      },
    });

    const immediateWrites = setItemSpy.mock.calls.filter(([key]) => key === 'xinyuexia_background_ai_tasks_v1');
    expect(immediateWrites).toHaveLength(1);

    release();
    await waitForTask(task.id, () => getBackgroundAiTask(task.id)?.status === 'success');
    const completedWrites = setItemSpy.mock.calls.filter(([key]) => key === 'xinyuexia_background_ai_tasks_v1');
    expect(completedWrites.length).toBeLessThanOrEqual(2);
    setItemSpy.mockRestore();
  });
});
