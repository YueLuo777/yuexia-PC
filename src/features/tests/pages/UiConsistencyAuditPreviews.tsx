import { Check, Folder, Keyboard, Search, Settings, UserRound, X } from 'lucide-react';
import type { ReactNode } from 'react';

export type UiAuditPreviewKind =
  | 'role-library'
  | 'setting-library'
  | 'simple-library'
  | 'brainstorm-reader'
  | 'setting-reader'
  | 'outline-reader'
  | 'review-workflow'
  | 'status-workflow'
  | 'standard-modal'
  | 'handmade-modal'
  | 'system-settings'
  | 'shortcut-settings'
  | 'navigation-settings'
  | 'compact-dialogs'
  | 'delete-dialogs'
  | 'empty-states';

const textButton = 'inline-flex h-6 items-center justify-center rounded-md px-2 text-[9px] font-black';
const cyanButton = `${textButton} bg-[#08AACE] text-white`;
const lightButton = `${textButton} border border-slate-200 bg-white text-slate-500`;

function PreviewShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white text-[9px] text-slate-600 shadow-sm">
      <div className="flex h-9 items-center justify-between border-b border-slate-200 px-3">
        <div>
          <div className="font-black text-slate-900">{title}</div>
          {subtitle ? <div className="text-[7px] text-slate-400">{subtitle}</div> : null}
        </div>
        <span className="grid h-5 w-5 place-items-center rounded border border-slate-200 text-slate-400"><X className="h-3 w-3" /></span>
      </div>
      {children}
    </div>
  );
}

function SearchField({ label }: { label: string }) {
  return (
    <div className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[8px] text-slate-400">
      <Search className="h-2.5 w-2.5" />{label}
    </div>
  );
}

function FolderRow({ label, count, active = false }: { label: string; count: number; active?: boolean }) {
  return (
    <div className={`flex h-6 items-center gap-1 rounded-md px-1.5 font-bold ${active ? 'bg-[#EAF9FD] text-[#078FAE]' : 'text-slate-500'}`}>
      <Folder className="h-3 w-3" /><span className="flex-1 truncate">{label}</span><span>{count}</span>
    </div>
  );
}

function LibraryPreview({ kind }: { kind: 'role-library' | 'setting-library' | 'simple-library' }) {
  const role = kind === 'role-library';
  const simple = kind === 'simple-library';
  const title = role ? '人物设定' : simple ? '资料' : '大纲设定';
  return (
    <PreviewShell title={title} subtitle={role ? '人物分类、角色卡片与状态' : simple ? '简单条目编辑器' : '作品设定、世界观与资料卡片'}>
      <div className={`grid h-40 ${simple ? 'grid-cols-[34%_66%]' : 'grid-cols-[39%_61%]'}`}>
        <aside className={`flex min-w-0 flex-col border-r border-slate-200 ${role ? 'bg-slate-50 p-2' : 'bg-white p-1.5'}`}>
          {role ? <SearchField label="搜索角色..." /> : null}
          <div className="mt-1 flex-1 space-y-0.5 overflow-hidden">
            <FolderRow label={role ? '主角' : simple ? '资料列表' : '作品设定'} count={role ? 2 : 3} active />
            <div className={`${role ? 'rounded-lg border bg-white px-2 py-1.5' : 'rounded-md bg-[#EAF9FD] px-2 py-1'} font-black text-slate-800`}>
              {role ? '萧炎　●　男主' : simple ? '灵感记录 01' : '作品信息'}
            </div>
            <FolderRow label={role ? '重要配角' : simple ? '临时资料' : '世界观'} count={role ? 6 : 4} />
            {!simple ? <FolderRow label={role ? '反派角色' : '势力设定'} count={role ? 3 : 5} /> : null}
          </div>
          <div className={`mt-1 grid ${role ? 'grid-cols-2' : 'grid-cols-1'} gap-1`}>
            <span className={cyanButton}>{role ? '新建分类' : '＋ 新增'}</span>
            {role ? <span className={cyanButton}>新建角色</span> : null}
          </div>
        </aside>
        <section className="flex min-w-0 flex-col gap-2 p-2.5">
          <div className="flex items-center justify-between"><strong className="text-[11px] text-slate-900">{role ? '角色生成' : simple ? '灵感记录 01' : '作品信息'}</strong><span className={lightButton}>{role ? '历史版本' : '字段设置'}</span></div>
          {role ? <div className="flex gap-1"><span className={cyanButton}>基础资料</span><span className={lightButton}>人物关系</span></div> : null}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-md border border-slate-200 p-2"><span className="text-slate-400">{role ? '人物姓名' : '设定名称'}</span><div className="mt-1 font-bold text-slate-800">{role ? '萧炎' : '斗气大陆'}</div></div>
            <div className="rounded-md border border-slate-200 p-2"><span className="text-slate-400">{role ? '身份定位' : '设定分类'}</span><div className="mt-1 font-bold text-slate-800">{role ? '男主角' : '世界观'}</div></div>
          </div>
          <div className="flex-1 rounded-md border border-slate-200 p-2 text-slate-400">{simple ? '在这里编辑资料正文……' : role ? '人物背景、性格、外貌和当前目标……' : '作品世界、规则和核心设定……'}</div>
        </section>
      </div>
    </PreviewShell>
  );
}

function ReaderPreview({ kind }: { kind: 'brainstorm-reader' | 'setting-reader' | 'outline-reader' }) {
  const outline = kind === 'outline-reader';
  const brainstorm = kind === 'brainstorm-reader';
  const title = brainstorm ? '关联脑洞' : outline ? '关联资料' : '关联其他设定';
  return (
    <PreviewShell title={title} subtitle={brainstorm ? '左侧切换预览，右侧确认关联' : '勾选需要关联到当前内容的资料'}>
      {!brainstorm ? (
        <div className="flex h-8 items-center gap-1 border-b border-slate-200 px-2">
          {(outline ? ['章纲', '设定', '角色'] : ['作品', '世界观', '势力']).map((tab, index) => <span key={tab} className={index === 0 ? cyanButton : lightButton}>{tab}</span>)}
          <span className={`ml-auto ${lightButton}`}>关联所有</span>
        </div>
      ) : null}
      <div className={`grid h-32 ${outline ? 'grid-cols-[28%_44%_28%]' : 'grid-cols-[38%_62%]'}`}>
        <aside className="space-y-1 border-r border-slate-200 bg-slate-50 p-2">
          <strong>{brainstorm ? '候选书单' : outline ? '前文章纲' : '设定目录'}</strong>
          {['第一卷', brainstorm ? '废土求生' : '世界结构', brainstorm ? '仙侠经营' : '主角势力'].map((item, index) => (
            <div key={item} className={`flex items-center gap-1 rounded-md border px-1.5 py-1 ${index === 1 ? 'border-[#08AACE] bg-white text-[#078FAE]' : 'border-transparent bg-white/70'}`}>
              {!brainstorm ? <span className="grid h-3 w-3 place-items-center rounded-sm border border-[#08AACE] text-[7px]">{index === 1 ? <Check className="h-2 w-2" /> : null}</span> : null}
              <span className="truncate font-bold">{item}</span>
            </div>
          ))}
        </aside>
        <section className="flex min-w-0 flex-col gap-2 p-2.5">
          <div className="flex items-center justify-between"><strong className="text-[11px] text-slate-900">{brainstorm ? '废土求生' : outline ? '第 3 章章纲' : '世界结构'}</strong>{brainstorm ? <span className={cyanButton}>关联此项</span> : <span className="text-[#08AACE]">已勾选</span>}</div>
          <div className={`${brainstorm ? 'border-[#08AACE]/30 bg-[#F8FDFF]' : 'border-slate-800 bg-white'} flex-1 rounded-lg border p-2 leading-4 text-slate-500`}>这里粗略显示当前资料的完整预览内容。你可以先看内容，再决定是否关联。</div>
        </section>
        {outline ? <aside className="border-l border-slate-200 bg-slate-50 p-2"><strong>已选资料</strong><div className="mt-2 rounded-md bg-white p-2">✓ 世界结构</div><div className="mt-1 rounded-md bg-white p-2">✓ 主角设定</div></aside> : null}
      </div>
      <div className="flex h-8 items-center justify-between border-t border-slate-200 px-2"><span>{brainstorm ? '将关联：废土求生' : '已选 2 项'}</span><span className={cyanButton}>确认关联</span></div>
    </PreviewShell>
  );
}

function WorkflowPreview({ status }: { status: boolean }) {
  return (
    <PreviewShell title={status ? '更新状态' : '综合点评'} subtitle={status ? '把角色、宝物、势力的最新状态写入设定卡片' : '左侧选择章节，中间预览正文，右侧配置 AI 参数'}>
      <div className="grid h-40 grid-cols-[25%_46%_29%]">
        <aside className="border-r border-slate-200 bg-slate-50 p-2"><strong>章节目录</strong><FolderRow label="第一卷" count={12} active /><div className="mt-1 grid grid-cols-4 gap-1">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <span key={n} className={`grid h-5 place-items-center rounded ${n === 3 ? 'bg-[#08AACE] text-white' : 'bg-white'}`}>{n}</span>)}</div></aside>
        <section className="flex flex-col gap-2 bg-white p-2"><div className="flex justify-between"><strong>第 3 章　夜袭</strong><span className="text-slate-400">1,826 字</span></div><div className="flex-1 rounded-md border border-slate-200 bg-slate-50 p-2 leading-4">夜色笼罩山谷，主角察觉到营地外的异常动静……</div></section>
        <aside className="space-y-2 border-l border-slate-200 bg-white p-2"><strong>{status ? '状态更新参数' : 'AI 点评参数'}</strong><div className="rounded-md border p-1.5">模型：DeepSeek</div><div className="rounded-md border p-1.5">提示词：{status ? '更新人物状态' : '综合点评'}</div>{status ? <div className="rounded-md border p-1.5">更新目标：萧炎、玄重尺</div> : null}<span className={`${cyanButton} w-full`}>{status ? '生成状态更新' : '开始点评'}</span></aside>
      </div>
    </PreviewShell>
  );
}

function ModalPreview({ handmade }: { handmade: boolean }) {
  return (
    <div className={`${handmade ? 'bg-slate-500/30' : 'bg-slate-900/40'} rounded-xl p-4`}>
      <div className={`${handmade ? 'rounded-2xl' : 'rounded-xl'} mx-auto w-[88%] overflow-hidden bg-white shadow-xl`}>
        <div className={`${handmade ? 'px-4 py-3' : 'border-b px-3 py-2'} flex items-center justify-between`}><div><strong className={handmade ? 'text-[12px]' : ''}>{handmade ? '小说封面' : '新建作品'}</strong>{!handmade ? <div className="text-[7px] text-slate-400">填写作品基本信息</div> : null}</div><span className={handmade ? 'text-slate-400' : 'grid h-5 w-5 place-items-center rounded border text-slate-400'}><X className="h-3 w-3" /></span></div>
        <div className="grid h-24 grid-cols-[35%_65%] gap-2 p-3"><div className={`${handmade ? 'rounded-xl bg-slate-200' : 'rounded-md border border-dashed'} grid place-items-center text-slate-400`}>{handmade ? '封面预览' : '上传封面'}</div><div className="space-y-2"><div className="rounded-md border p-2">作品名称</div><div className="rounded-md border p-2">作品简介</div></div></div>
        <div className={`${handmade ? '' : 'bg-slate-50'} flex justify-end gap-1 px-3 py-2`}><span className={lightButton}>取消</span><span className={cyanButton}>{handmade ? '保存封面' : '创建作品'}</span></div>
      </div>
    </div>
  );
}

function SettingsPreview({ kind }: { kind: 'system-settings' | 'shortcut-settings' | 'navigation-settings' }) {
  const shortcut = kind === 'shortcut-settings';
  const navigation = kind === 'navigation-settings';
  const title = shortcut ? '快捷键设置' : navigation ? '导航设置' : '系统设置';
  return (
    <div className={`${navigation ? 'mx-auto w-[82%]' : shortcut ? 'w-full' : 'mx-auto w-[92%]'} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`}>
      <div className="flex items-start justify-between border-b border-slate-200 px-3 py-2.5"><div className="flex gap-2">{shortcut ? <span className="grid h-6 w-6 place-items-center rounded bg-[#EAF9FD] text-[#08AACE]"><Keyboard className="h-3 w-3" /></span> : navigation ? <Settings className="h-4 w-4 text-[#08AACE]" /> : null}<div><strong className={navigation ? 'text-[12px]' : ''}>{title}</strong>{shortcut || navigation ? <div className={`${navigation ? 'text-[9px]' : 'text-[7px]'} text-slate-400`}>{shortcut ? '点击快捷键按钮后按下新的组合键' : '重命名、隐藏显示和拖拽排序'}</div> : null}</div></div>{shortcut ? <span className={cyanButton}>恢复默认</span> : null}</div>
      <div className="grid h-32 grid-cols-[31%_69%]"><aside className="space-y-1 border-r bg-slate-50 p-2">{['窗口设置', shortcut ? '全局操作' : navigation ? '主要导航' : '数据与备份', '外观设置'].map((item, index) => <div key={item} className={`rounded-md px-2 py-1.5 ${index === 1 ? 'bg-[#EAF9FD] font-black text-[#078FAE]' : ''}`}>{item}</div>)}</aside><section className="space-y-2 p-3"><strong>{shortcut ? '全局操作' : navigation ? '主要导航' : '窗口设置'}</strong><div className="rounded-md border p-2">{shortcut ? '关闭浮层　　Esc' : navigation ? '☰　我的小说　　显示' : '记住窗口大小　　开启'}</div><div className="rounded-md border p-2">{shortcut ? '打开搜索　　Ctrl + K' : navigation ? '☰　提示词管理　显示' : '启动窗口大小　1600 × 900'}</div></section></div>
    </div>
  );
}

function CompactPreview({ kind }: { kind: 'compact-dialogs' | 'delete-dialogs' | 'empty-states' }) {
  if (kind === 'empty-states') return <div className="grid h-44 grid-cols-3 gap-2 rounded-xl bg-slate-100 p-3"><div className="grid place-items-center rounded-lg bg-white text-slate-400">暂无章节</div><div className="grid place-items-center rounded-xl border border-dashed bg-white text-slate-400">暂无脑洞</div><div className="grid place-items-center rounded-2xl border border-dashed bg-slate-50 font-bold text-slate-300">请选择左侧内容</div></div>;
  if (kind === 'delete-dialogs') return <div className="grid h-44 grid-cols-2 gap-3 rounded-xl bg-slate-900/30 p-3"><div className="self-center rounded-xl bg-white p-3"><strong>删除作品？</strong><p className="my-3 text-slate-500">删除后可在回收站恢复。</p><div className="flex justify-end gap-1"><span className={lightButton}>取消</span><span className={`${textButton} bg-red-500 text-white`}>删除</span></div></div><div className="self-center rounded-xl bg-white p-4"><div className="flex gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-red-50 text-red-500">!</span><strong>确认删除</strong></div><p className="my-3 text-slate-500">此操作需要确认。</p><div className="flex justify-end gap-1"><span className={lightButton}>取消</span><span className={`${textButton} bg-red-500 text-white`}>确认删除</span></div></div></div>;
  return <div className="grid h-44 grid-cols-3 gap-2 rounded-xl bg-slate-900/25 p-3"><div className="self-center rounded-xl bg-white p-3"><strong>新增分类</strong><div className="my-2 rounded-md border p-2">分类名称</div><div className="flex justify-end gap-1"><span className={lightButton}>取消</span><span className={cyanButton}>确定</span></div></div><div className="self-center rounded-xl bg-white p-3"><div className="flex items-center gap-1"><UserRound className="h-3 w-3" /><strong>新建角色</strong></div><div className="my-2 rounded-lg border p-2">角色名字</div><div className="flex justify-end gap-1"><span className={lightButton}>取消</span><span className={cyanButton}>确认创建</span></div></div><div className="self-center rounded-xl bg-white p-3"><strong>修改作品名称</strong><div className="my-2 rounded-md border p-2">月下长歌</div><div className="flex justify-end gap-1"><span className="px-2 py-1 text-slate-400">取消</span><span className={cyanButton}>确认</span></div></div></div>;
}

export function UiConsistencyAuditPreview({ kind }: { kind: UiAuditPreviewKind }) {
  if (kind.endsWith('library')) return <LibraryPreview kind={kind as 'role-library' | 'setting-library' | 'simple-library'} />;
  if (kind.endsWith('reader')) return <ReaderPreview kind={kind as 'brainstorm-reader' | 'setting-reader' | 'outline-reader'} />;
  if (kind === 'review-workflow' || kind === 'status-workflow') return <WorkflowPreview status={kind === 'status-workflow'} />;
  if (kind === 'standard-modal' || kind === 'handmade-modal') return <ModalPreview handmade={kind === 'handmade-modal'} />;
  if (kind.endsWith('settings')) return <SettingsPreview kind={kind as 'system-settings' | 'shortcut-settings' | 'navigation-settings'} />;
  return <CompactPreview kind={kind as 'compact-dialogs' | 'delete-dialogs' | 'empty-states'} />;
}
