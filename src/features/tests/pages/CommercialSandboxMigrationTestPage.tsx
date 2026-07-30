import { useMemo, useState } from 'react';

type UserRole = 'admin' | 'user';
type LedgerType = 'grant' | 'freeze' | 'settle' | 'refund' | 'invite-pending' | 'invite-activate' | 'invite-revoke' | 'admin-add';
type RewardStatus = 'pending' | 'active' | 'revoked';
type TaskStatus = 'quoted' | 'running' | 'completed' | 'failed-refunded';

type SandboxUser = {
  id: string;
  name: string;
  role: UserRole;
  membership: string;
  points: number;
  frozen: number;
  invitedBy?: string;
};

type Plan = {
  id: string;
  name: string;
  price: string;
  monthlyPoints: number;
  devices: number;
  concurrency: number;
  permissions: string[];
};

type LedgerEntry = {
  id: string;
  type: LedgerType;
  userId: string;
  amount: number;
  before: number;
  after: number;
  reason: string;
};

type InviteReward = {
  id: string;
  inviterId: string;
  inviteeId: string;
  amount: number;
  status: RewardStatus;
  availableDay: number;
};

type SandboxTask = {
  id: string;
  userId: string;
  name: string;
  maxPoints: number;
  actualPoints: number;
  status: TaskStatus;
};

const NOTICE = '本地商业系统沙箱：不连接真实服务器、真实支付、真实账号、短信或邮件；这里的余额和会员不能作为正式销售权益。';
const STATUS_NOTICE = '本地沙箱：不能作为正式权益。';

const PLANS: Plan[] = [
  { id: 'free', name: '免费体验版', price: '0', monthlyPoints: 100, devices: 1, concurrency: 1, permissions: ['首次体验'] },
  { id: 'starter', name: '入门会员', price: '19.9/月', monthlyPoints: 1000, devices: 1, concurrency: 1, permissions: ['视频转提示词', '基础创作'] },
  { id: 'professional', name: '专业会员', price: '59.9/月', monthlyPoints: 4000, devices: 2, concurrency: 3, permissions: ['批量处理', '高级创作', '本地模型'] },
];

const INITIAL_USERS: SandboxUser[] = [
  { id: 'admin', name: '测试管理员', role: 'admin', membership: '管理员', points: 0, frozen: 0 },
  { id: 'user-a', name: '测试用户A', role: 'user', membership: '未开通', points: 0, frozen: 0 },
  { id: 'user-b', name: '测试用户B', role: 'user', membership: '未开通', points: 0, frozen: 0 },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function available(user: SandboxUser) {
  return Math.max(0, user.points - user.frozen);
}

function useCommercialSandbox() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [activeUserId, setActiveUserId] = useState('user-a');
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [tasks, setTasks] = useState<SandboxTask[]>([]);
  const [rewards, setRewards] = useState<InviteReward[]>([]);
  const [day, setDay] = useState(0);
  const [message, setMessage] = useState(STATUS_NOTICE);
  const [adminReason, setAdminReason] = useState('验收管理员补发积分');

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[1];

  const appendLedger = (entry: Omit<LedgerEntry, 'id'>) => {
    setLedger((current) => [{ ...entry, id: makeId('ledger') }, ...current]);
  };

  const updateUser = (userId: string, updater: (user: SandboxUser) => SandboxUser) => {
    setUsers((current) => current.map((user) => (user.id === userId ? updater(user) : user)));
  };

  const grantPoints = (userId: string, amount: number, type: LedgerType, reason: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    updateUser(userId, (item) => ({ ...item, points: item.points + amount }));
    appendLedger({ type, userId, amount, before: user.points, after: user.points + amount, reason });
  };

  const purchasePlan = (planId: string, userId = activeUser.id) => {
    const plan = PLANS.find((item) => item.id === planId);
    const user = users.find((item) => item.id === userId);
    if (!plan || !user || user.role !== 'user') return;
    updateUser(userId, (item) => ({ ...item, membership: plan.name, points: item.points + plan.monthlyPoints }));
    appendLedger({
      type: 'grant',
      userId,
      amount: plan.monthlyPoints,
      before: user.points,
      after: user.points + plan.monthlyPoints,
      reason: `模拟开通${plan.name}`,
    });
    const relation = users.find((item) => item.id === userId)?.invitedBy;
    const alreadyRewarded = rewards.some((reward) => reward.inviteeId === userId);
    if (relation && !alreadyRewarded && plan.id !== 'free') {
      setRewards((current) => [
        ...current,
        { id: makeId('reward'), inviterId: relation, inviteeId: userId, amount: 200, status: 'pending', availableDay: day + 7 },
      ]);
      appendLedger({ type: 'invite-pending', userId: relation, amount: 0, before: 0, after: 0, reason: '首次付费，奖励观察期' });
    }
    setMessage(`已模拟开通${plan.name}，发放 ${plan.monthlyPoints} 积分。`);
  };

  const quoteTask = () => {
    if (activeUser.role !== 'user') return;
    const task: SandboxTask = {
      id: makeId('task'),
      userId: activeUser.id,
      name: '视频转提示词任务',
      maxPoints: 180,
      actualPoints: 0,
      status: 'quoted',
    };
    setTasks((current) => [task, ...current]);
    setMessage('已创建 180 积分上限的模拟任务报价。');
  };

  const freezeTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    const user = users.find((item) => item.id === task?.userId);
    if (!task || !user || task.status !== 'quoted') return;
    if (available(user) < task.maxPoints) {
      setMessage('可用积分不足，未冻结也未扣除。');
      return;
    }
    updateUser(user.id, (item) => ({ ...item, frozen: item.frozen + task.maxPoints }));
    setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, status: 'running' } : item)));
    appendLedger({ type: 'freeze', userId: user.id, amount: 0, before: user.points, after: user.points, reason: `冻结 ${task.maxPoints} 积分上限` });
    setMessage('已冻结任务积分，正式扣除要等任务结束按实际用量结算。');
  };

  const settleTask = (taskId: string, success: boolean) => {
    const task = tasks.find((item) => item.id === taskId);
    const user = users.find((item) => item.id === task?.userId);
    if (!task || !user || task.status !== 'running') return;
    const actual = success ? 145 : 0;
    updateUser(user.id, (item) => ({
      ...item,
      frozen: Math.max(0, item.frozen - task.maxPoints),
      points: success ? item.points - actual : item.points,
    }));
    setTasks((current) =>
      current.map((item) =>
        item.id === taskId ? { ...item, actualPoints: actual, status: success ? 'completed' : 'failed-refunded' } : item,
      ),
    );
    appendLedger({
      type: success ? 'settle' : 'refund',
      userId: user.id,
      amount: success ? -actual : 0,
      before: user.points,
      after: success ? user.points - actual : user.points,
      reason: success ? '实际 145 积分结算' : '失败退回冻结积分',
    });
    setMessage(success ? '任务成功：扣除 145，解冻 35。' : '任务失败：没有真实扣分，冻结已退回。');
  };

  const bindInvite = () => {
    const inviter = users.find((item) => item.id === 'user-a');
    const invitee = users.find((item) => item.id === 'user-b');
    if (!inviter || !invitee || invitee.invitedBy) return;
    updateUser('user-b', (user) => ({ ...user, invitedBy: inviter.id }));
    setMessage('测试用户B已绑定测试用户A的邀请码；只允许一级邀请，不能重复绑定。');
  };

  const advanceReward = () => {
    const nextDay = day + 7;
    const activatingRewards = rewards.filter((reward) => reward.status === 'pending' && reward.availableDay <= nextDay);
    setDay(nextDay);
    setRewards((current) =>
      current.map((reward) =>
        activatingRewards.some((item) => item.id === reward.id) ? { ...reward, status: 'active' } : reward,
      ),
    );
    activatingRewards.forEach((reward) => {
      grantPoints(reward.inviterId, reward.amount, 'invite-activate', '观察期结束，奖励生效');
    });
    setMessage('沙箱时间前进 7 天，待生效邀请奖励已处理。');
  };

  const refundInviteeOrder = () => {
    const activeReward = rewards.find((reward) => reward.inviteeId === 'user-b' && reward.status === 'active');
    if (!activeReward) {
      setMessage('当前没有已生效的邀请奖励可撤回。');
      return;
    }
    const inviter = users.find((user) => user.id === activeReward.inviterId);
    if (!inviter) return;
    updateUser(inviter.id, (user) => ({ ...user, points: Math.max(0, user.points - activeReward.amount) }));
    setRewards((current) => current.map((reward) => (reward.id === activeReward.id ? { ...reward, status: 'revoked' } : reward)));
    appendLedger({
      type: 'invite-revoke',
      userId: inviter.id,
      amount: -activeReward.amount,
      before: inviter.points,
      after: Math.max(0, inviter.points - activeReward.amount),
      reason: '模拟退款，奖励撤回',
    });
    setMessage('已模拟退款：邀请奖励被撤回，保留撤回流水。');
  };

  const adminAddPoints = () => {
    if (adminReason.trim().length < 4) {
      setMessage('管理员操作必须填写至少 4 个字的原因。');
      return;
    }
    grantPoints('user-a', 300, 'admin-add', adminReason);
    setMessage('管理员已给测试用户A补发 300 积分，并留下审计原因。');
  };

  const reset = () => {
    setUsers(INITIAL_USERS);
    setActiveUserId('user-a');
    setLedger([]);
    setTasks([]);
    setRewards([]);
    setDay(0);
    setMessage(STATUS_NOTICE);
  };

  return {
    users,
    activeUser,
    activeUserId,
    ledger,
    tasks,
    rewards,
    day,
    message,
    adminReason,
    setActiveUserId,
    setAdminReason,
    purchasePlan,
    quoteTask,
    freezeTask,
    settleTask,
    bindInvite,
    advanceReward,
    refundInviteeOrder,
    adminAddPoints,
    reset,
  };
}

export function CommercialSandboxMigrationTestPage() {
  const sandbox = useCommercialSandbox();
  const activeTasks = sandbox.tasks.filter((task) => task.userId === sandbox.activeUser.id);
  const inviteStats = useMemo(
    () => ({
      bound: sandbox.users.filter((user) => user.invitedBy).length,
      pending: sandbox.rewards.filter((reward) => reward.status === 'pending').length,
      active: sandbox.rewards.filter((reward) => reward.status === 'active').length,
      revoked: sandbox.rewards.filter((reward) => reward.status === 'revoked').length,
    }),
    [sandbox.rewards, sandbox.users],
  );

  return (
    <div
      className="flex h-full min-h-[760px] flex-col overflow-hidden bg-[#F5F8FA] text-slate-800"
      data-testid="commercial-sandbox-migration-test"
      data-sandbox-scope="local-only"
    >
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-base font-black">用户系统与用户裂变本地沙箱</h1>
            <p className="mt-1 max-w-[980px] text-xs font-semibold leading-5 text-slate-500">{NOTICE}</p>
          </div>
          <button type="button" onClick={sandbox.reset} className="h-9 rounded-md border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 hover:border-red-200 hover:text-red-500">
            重置沙箱
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[260px_minmax(560px,1fr)_420px] overflow-hidden">
        <aside className="editor-scrollbar min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
          <div className="mb-3 text-xs font-black text-slate-400">测试身份</div>
          <div className="space-y-2">
            {sandbox.users.map((user) => (
              <button
                key={user.id}
                type="button"
                aria-pressed={sandbox.activeUserId === user.id}
                data-testid={`commercial-sandbox-user-${user.id}`}
                onClick={() => sandbox.setActiveUserId(user.id)}
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  sandbox.activeUserId === user.id ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <strong className="block text-sm font-black text-slate-800">{user.name}</strong>
                <span className="mt-1 block text-xs font-bold text-slate-400">
                  {user.membership} · 可用 {available(user)} · 冻结 {user.frozen}
                </span>
              </button>
            ))}
          </div>
          <section className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
            正式销售时必须换成服务端账户、支付、订单和余额事实源；桌面端只能显示结果，不能自己决定正式权益。
          </section>
        </aside>

        <section className="editor-scrollbar min-h-0 overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map((plan) => (
              <article key={plan.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">{plan.name}</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">{plan.price}</p>
                  </div>
                  <span className="rounded bg-[#EAF9FD] px-2 py-1 text-xs font-black text-[#078FAB]">{plan.monthlyPoints}</span>
                </div>
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                  {plan.devices} 台设备 · 并发 {plan.concurrency} · {plan.permissions.join('、')}
                </p>
                <button
                  type="button"
                  data-testid={`commercial-sandbox-plan-${plan.id}`}
                  onClick={() => sandbox.purchasePlan(plan.id)}
                  className="mt-4 h-9 w-full rounded-md bg-[#08AACE] text-sm font-black text-white hover:bg-[#0798B8]"
                >
                  模拟开通
                </button>
              </article>
            ))}
          </div>

          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black">任务积分冻结与结算</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">先报价，再冻结上限，结束时按实际消耗扣除或失败退款。</p>
              </div>
              <button
                type="button"
                data-testid="commercial-sandbox-quote-task"
                onClick={sandbox.quoteTask}
                className="h-9 rounded-md border border-[#9DDFEA] bg-white px-4 text-xs font-black text-[#078FAB]"
              >
                创建报价
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {activeTasks.length ? activeTasks.map((task) => (
                <article key={task.id} className="flex min-h-14 items-center justify-between gap-3 rounded-md border border-slate-200 bg-[#FBFCFD] px-3 py-2">
                  <div>
                    <strong className="text-sm font-black">{task.name}</strong>
                    <span className="ml-2 text-xs font-bold text-slate-400">{task.status} · 上限 {task.maxPoints} · 实际 {task.actualPoints}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {task.status === 'quoted' ? (
                      <button
                        type="button"
                        data-testid="commercial-sandbox-freeze-task"
                        onClick={() => sandbox.freezeTask(task.id)}
                        className="h-8 rounded border border-slate-200 bg-white px-3 text-xs font-bold"
                      >
                        冻结
                      </button>
                    ) : null}
                    {task.status === 'running' ? (
                      <>
                        <button
                          type="button"
                          data-testid="commercial-sandbox-settle-task"
                          onClick={() => sandbox.settleTask(task.id, true)}
                          className="h-8 rounded bg-[#08AACE] px-3 text-xs font-black text-white"
                        >
                          成功结算
                        </button>
                        <button type="button" onClick={() => sandbox.settleTask(task.id, false)} className="h-8 rounded border border-slate-200 bg-white px-3 text-xs font-bold">失败退款</button>
                      </>
                    ) : null}
                  </div>
                </article>
              )) : <div className="grid min-h-[84px] place-items-center rounded-md border border-dashed border-slate-200 text-xs font-bold text-slate-400">当前身份暂无模拟任务</div>}
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black">一级邀请裂变</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">A 邀请 B，B 首次模拟付费后，B 立即得分，A 的奖励进入观察期。</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">沙箱第 {sandbox.day} 天</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <button type="button" data-testid="commercial-sandbox-bind-invite" onClick={sandbox.bindInvite} className="h-9 rounded-md border border-slate-200 bg-white text-xs font-black">B 绑定 A</button>
              <button type="button" data-testid="commercial-sandbox-invitee-pay" onClick={() => sandbox.purchasePlan('starter', 'user-b')} className="h-9 rounded-md border border-slate-200 bg-white text-xs font-black">B 首次付费</button>
              <button type="button" data-testid="commercial-sandbox-activate-reward" onClick={sandbox.advanceReward} className="h-9 rounded-md border border-slate-200 bg-white text-xs font-black">观察期结束</button>
              <button type="button" data-testid="commercial-sandbox-revoke-reward" onClick={sandbox.refundInviteeOrder} className="h-9 rounded-md border border-slate-200 bg-white text-xs font-black">退款撤回</button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                ['已绑定', inviteStats.bound],
                ['待生效', inviteStats.pending],
                ['已生效', inviteStats.active],
                ['已撤回', inviteStats.revoked],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-slate-200 bg-[#FBFCFD] px-3 py-2">
                  <span className="block text-xs font-bold text-slate-400">{label}</span>
                  <strong className="mt-1 block text-lg font-black text-slate-800">{value}</strong>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white">
          <section className="shrink-0 border-b border-slate-200 p-4">
            <h2 className="text-sm font-black">管理员与状态</h2>
            <p
              className="mt-2 whitespace-normal break-words rounded-md bg-[#EAF9FD] px-3 py-2 text-xs font-bold leading-5 text-[#078FAB]"
              style={{ wordBreak: 'break-all' }}
              aria-live="polite"
            >
              {sandbox.message}
            </p>
            <label className="mt-3 block text-xs font-bold text-slate-500">
              管理员操作原因
              <input
                value={sandbox.adminReason}
                onChange={(event) => sandbox.setAdminReason(event.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
              />
            </label>
            <button type="button" onClick={sandbox.adminAddPoints} className="mt-3 h-9 w-full rounded-md border border-[#9DDFEA] bg-white text-xs font-black text-[#078FAB]">
              给用户A补发 300 积分
            </button>
          </section>
          <section className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black">追加式积分账本</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">{sandbox.ledger.length} 条</span>
            </div>
            <div className="space-y-2">
              {sandbox.ledger.length ? sandbox.ledger.map((entry) => (
                <article key={entry.id} className="rounded-md border border-slate-200 bg-[#FBFCFD] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-xs font-black text-slate-800">{entry.type}</strong>
                    <span className={entry.amount < 0 ? 'text-xs font-black text-red-500' : 'text-xs font-black text-emerald-600'}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </span>
                  </div>
                  <p
                    className="mt-1 max-w-full whitespace-normal break-words text-[11px] font-semibold leading-4 text-slate-400"
                    style={{ maxWidth: 300, overflowWrap: 'anywhere', whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {entry.userId} · {entry.before} → {entry.after} · {entry.reason}
                  </p>
                </article>
              )) : <div className="grid min-h-[160px] place-items-center rounded-md border border-dashed border-slate-200 text-xs font-bold text-slate-400">暂无账本流水</div>}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default CommercialSandboxMigrationTestPage;
