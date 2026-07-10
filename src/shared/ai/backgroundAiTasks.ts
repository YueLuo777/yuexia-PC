export type BackgroundAiTaskKind =
  | 'brainstorm'
  | 'outline'
  | 'detailOutline'
  | 'chapterDraft'
  | 'summary'
  | 'review'
  | 'polish'
  | 'custom';

export type BackgroundAiTaskStatus = 'running' | 'success' | 'failed' | 'aborted' | 'interrupted';

export type BackgroundAiTask = {
  id: string;
  kind: BackgroundAiTaskKind;
  title: string;
  status: BackgroundAiTaskStatus;
  input: string;
  output: string;
  error?: string;
  progressLabel?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type BackgroundAiTaskPatch = Partial<Omit<BackgroundAiTask, 'id' | 'createdAt'>>;

export type BackgroundAiTaskRunnerContext = {
  signal: AbortSignal;
  emit: (chunk: string, options?: { replace?: boolean; progressLabel?: string }) => void;
  update: (patch: BackgroundAiTaskPatch) => void;
  getTask: () => BackgroundAiTask | null;
};

export type BackgroundAiTaskRunner = (context: BackgroundAiTaskRunnerContext) => Promise<string | void>;

export type StartBackgroundAiTaskInput = {
  kind: BackgroundAiTaskKind;
  title: string;
  input?: string;
  initialOutput?: string;
  progressLabel?: string;
  meta?: BackgroundAiTask['meta'];
  runner: BackgroundAiTaskRunner;
};

const BACKGROUND_AI_TASKS_STORAGE_KEY = 'xinyuexia_background_ai_tasks_v1';
const BACKGROUND_AI_TASK_LIMIT = 30;
const BACKGROUND_AI_PERSIST_INTERVAL_MS = 250;

const listeners = new Set<() => void>();
const controllers = new Map<string, AbortController>();
let tasks = readPersistedTasks();
let beforeUnloadBound = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function nowText() {
  return new Date().toLocaleString('zh-CN');
}

function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `bg-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizePersistedTask(value: unknown): BackgroundAiTask | null {
  if (!value || typeof value !== 'object') return null;
  const task = value as Partial<BackgroundAiTask>;
  if (typeof task.id !== 'string' || typeof task.title !== 'string') return null;
  const status: BackgroundAiTaskStatus =
    task.status === 'running'
      ? 'interrupted'
      : task.status === 'success' ||
          task.status === 'failed' ||
          task.status === 'aborted' ||
          task.status === 'interrupted'
        ? task.status
        : 'interrupted';
  return {
    id: task.id,
    kind: task.kind ?? 'custom',
    title: task.title,
    status,
    input: typeof task.input === 'string' ? task.input : '',
    output: typeof task.output === 'string' ? task.output : '',
    error: status === 'interrupted' ? '软件已关闭或页面已刷新，本次后台任务已停止。' : task.error,
    progressLabel: task.progressLabel,
    createdAt: typeof task.createdAt === 'string' ? task.createdAt : nowText(),
    updatedAt: typeof task.updatedAt === 'string' ? task.updatedAt : nowText(),
    completedAt: task.completedAt,
    meta: task.meta,
  };
}

function readPersistedTasks() {
  if (!canUseLocalStorage()) return [] as BackgroundAiTask[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BACKGROUND_AI_TASKS_STORAGE_KEY) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePersistedTask).filter((task): task is BackgroundAiTask => Boolean(task));
  } catch {
    return [];
  }
}

function persistTasks() {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(
      BACKGROUND_AI_TASKS_STORAGE_KEY,
      JSON.stringify(tasks.slice(0, BACKGROUND_AI_TASK_LIMIT)),
    );
  } catch {
    // Local snapshots are best-effort; the in-memory task remains the source of truth while the app is open.
  }
}

function clearPersistTimer() {
  if (persistTimer === null) return;
  clearTimeout(persistTimer);
  persistTimer = null;
}

function flushPersistTasks() {
  clearPersistTimer();
  persistTasks();
}

function schedulePersistTasks() {
  if (persistTimer !== null) return;
  persistTimer = setTimeout(flushPersistTasks, BACKGROUND_AI_PERSIST_INTERVAL_MS);
}

function notifyListeners(options: { flush?: boolean } = {}) {
  if (options.flush) flushPersistTasks();
  else schedulePersistTasks();
  listeners.forEach((listener) => listener());
}

function patchTask(taskId: string, patch: BackgroundAiTaskPatch) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, ...patch, updatedAt: patch.updatedAt ?? nowText() } : task,
  );
  notifyListeners({ flush: patch.status !== undefined });
}

function bindBeforeUnload() {
  if (beforeUnloadBound || typeof window === 'undefined') return;
  beforeUnloadBound = true;
  window.addEventListener('beforeunload', () => {
    const closedAt = nowText();
    controllers.forEach((controller) => controller.abort());
    controllers.clear();
    tasks = tasks.map((task) =>
      task.status === 'running'
        ? {
            ...task,
            status: 'interrupted',
            error: '软件已关闭，本次后台任务已停止。',
            updatedAt: closedAt,
            completedAt: closedAt,
          }
        : task,
    );
    flushPersistTasks();
  });
}

export function getBackgroundAiTasksSnapshot() {
  return tasks;
}

export function getBackgroundAiTask(taskId: string) {
  return tasks.find((task) => task.id === taskId) ?? null;
}

export function subscribeBackgroundAiTasks(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function startBackgroundAiTask(input: StartBackgroundAiTaskInput) {
  bindBeforeUnload();
  const id = createTaskId();
  const controller = new AbortController();
  const createdAt = nowText();
  const task: BackgroundAiTask = {
    id,
    kind: input.kind,
    title: input.title,
    status: 'running',
    input: input.input ?? '',
    output: input.initialOutput ?? '',
    progressLabel: input.progressLabel ?? '正在生成',
    createdAt,
    updatedAt: createdAt,
    meta: input.meta,
  };
  controllers.set(id, controller);
  tasks = [task, ...tasks].slice(0, BACKGROUND_AI_TASK_LIMIT);
  notifyListeners({ flush: true });

  const emit: BackgroundAiTaskRunnerContext['emit'] = (chunk, options) => {
    if (controller.signal.aborted) return;
    const current = getBackgroundAiTask(id);
    if (!current || current.status !== 'running') return;
    patchTask(id, {
      output: options?.replace ? chunk : `${current.output}${chunk}`,
      progressLabel: options?.progressLabel ?? current.progressLabel,
    });
  };

  const update: BackgroundAiTaskRunnerContext['update'] = (patch) => {
    if (controller.signal.aborted) return;
    patchTask(id, patch);
  };

  void input
    .runner({
      signal: controller.signal,
      emit,
      update,
      getTask: () => getBackgroundAiTask(id),
    })
    .then((finalOutput) => {
      const current = getBackgroundAiTask(id);
      if (!current || current.status !== 'running') return;
      const completedAt = nowText();
      patchTask(id, {
        status: 'success',
        output: typeof finalOutput === 'string' ? finalOutput : current.output,
        progressLabel: '已完成',
        completedAt,
      });
    })
    .catch((error: unknown) => {
      const current = getBackgroundAiTask(id);
      if (!current || current.status !== 'running') return;
      const completedAt = nowText();
      const aborted = controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError');
      patchTask(id, {
        status: aborted ? 'aborted' : 'failed',
        error: aborted ? '已手动停止。' : error instanceof Error ? error.message : '后台任务失败。',
        progressLabel: aborted ? '已停止' : '失败',
        completedAt,
      });
    })
    .finally(() => {
      controllers.delete(id);
    });

  return task;
}

export function stopBackgroundAiTask(taskId: string, reason = '已手动停止。') {
  const controller = controllers.get(taskId);
  controller?.abort();
  controllers.delete(taskId);
  const task = getBackgroundAiTask(taskId);
  if (!task || task.status !== 'running') return;
  const completedAt = nowText();
  patchTask(taskId, {
    status: 'aborted',
    error: reason,
    progressLabel: '已停止',
    completedAt,
  });
}

export function stopAllBackgroundAiTasks(reason = '已手动停止。') {
  getBackgroundAiTasksSnapshot()
    .filter((task) => task.status === 'running')
    .forEach((task) => stopBackgroundAiTask(task.id, reason));
}

export function clearFinishedBackgroundAiTasks() {
  tasks = tasks.filter((task) => task.status === 'running');
  notifyListeners({ flush: true });
}

export function resetBackgroundAiTasksForTests() {
  controllers.forEach((controller) => controller.abort());
  controllers.clear();
  tasks = [];
  notifyListeners({ flush: true });
}
