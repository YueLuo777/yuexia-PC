import {
  Bell,
  BookOpen,
  ChevronRight,
  EyeOff,
  Keyboard,
  MoreHorizontal,
  RefreshCcw,
  Settings,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type PopupVariant = 'work' | 'navigation' | 'system' | 'shortcut';

type PopupItem = {
  label: string;
  hint?: string;
  danger?: boolean;
  hasNext?: boolean;
};

const variants: Array<{ id: PopupVariant; label: string; icon: typeof BookOpen }> = [
  { id: 'work', label: '作品菜单', icon: BookOpen },
  { id: 'navigation', label: '导航设置', icon: Settings },
  { id: 'system', label: '系统设置', icon: Upload },
  { id: 'shortcut', label: '快捷键', icon: Keyboard },
];

const popupItems: Record<PopupVariant, PopupItem[]> = {
  work: [
    { label: '私密作品设置' },
    { label: '书封管理' },
    { label: '发布平台设置', hasNext: true },
    { label: '移入分组', hasNext: true },
    { label: '取消置顶' },
    { label: '从桌面隐藏' },
    { label: '移入回收站', danger: true },
  ],
  navigation: [
    { label: '新增分割线' },
    { label: '拖拽分割线' },
    { label: '删除分割线', danger: true },
    { label: '修改导航名称' },
    { label: '隐藏或恢复入口' },
    { label: '拖拽排序' },
    { label: '恢复默认导航', danger: true },
  ],
  system: [
    { label: '记忆关联', hint: '已开启', hasNext: true },
    { label: '软件图标', hasNext: true },
    { label: '使用首页图标' },
    { label: '上传图片' },
    { label: '恢复默认图标', danger: true },
  ],
  shortcut: [
    { label: '右键左划回首页', hint: '已开启' },
    { label: '右键右划前进', hint: '已关闭' },
    { label: '编辑快捷键', hasNext: true },
    { label: '重置快捷键', danger: true },
  ],
};

const variantMeta: Record<PopupVariant, { title: string; updatedAt: string }> = {
  work: { title: '月落软件', updatedAt: '2026-06-12 19:50 更新' },
  navigation: { title: '导航设置', updatedAt: '当前导航配置' },
  system: { title: '系统设置', updatedAt: '当前项目弹窗内容' },
  shortcut: { title: '快捷键设置', updatedAt: '当前快捷键与鼠标手势' },
};

function ReferencePopup({ variant }: { variant: PopupVariant }) {
  const meta = variantMeta[variant];
  const items = popupItems[variant];

  return (
    <div className="w-[220px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.14)]">
      <div className="border-b border-[#edf0f2] px-4 py-3 text-[14px] leading-none text-[#8d98a6]">
        {meta.updatedAt}
      </div>
      <div>
        {items.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            type="button"
            className={`flex h-[46px] w-full items-center gap-3 px-4 text-left text-[17px] font-medium transition-colors hover:bg-[#f5f7fa] ${
              item.danger ? 'text-[#ff3b30]' : 'text-[#1f2933]'
            } ${index === 1 ? 'border-b border-[#edf0f2]' : ''}`}
          >
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.hint ? <span className="shrink-0 text-[12px] text-[#9aa3af]">{item.hint}</span> : null}
            {item.hasNext ? <ChevronRight className="h-5 w-5 shrink-0 text-[#c3c9d2]" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExistingContentPreview({ variant }: { variant: PopupVariant }) {
  const rows = popupItems[variant];
  const Icon = variants.find((item) => item.id === variant)?.icon ?? BookOpen;

  return (
    <section className="min-w-0 rounded-[8px] border border-[#e5e7eb] bg-white">
      <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#f5f6f8] text-[#657080]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold text-[#1f2933]">{variantMeta[variant].title}</h2>
          <p className="mt-0.5 truncate text-[13px] text-[#8d98a6]">{variantMeta[variant].updatedAt}</p>
        </div>
      </div>
      <div className="divide-y divide-[#edf0f2]">
        {rows.map((row) => (
          <div key={row.label} className="flex min-h-[48px] items-center gap-3 px-4 py-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-[7px] ${
              row.danger ? 'bg-[#fff1f0] text-[#ff3b30]' : 'bg-[#f5f6f8] text-[#657080]'
            }`}>
              {row.danger ? <Trash2 className="h-3.5 w-3.5" /> : row.hasNext ? <Bell className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}
            </span>
            <span className={`min-w-0 flex-1 truncate text-[15px] font-medium ${row.danger ? 'text-[#ff3b30]' : 'text-[#1f2933]'}`}>{row.label}</span>
            {row.hint ? <span className="shrink-0 text-[12px] text-[#9aa3af]">{row.hint}</span> : null}
            {row.hasNext ? <ChevronRight className="h-4 w-4 shrink-0 text-[#c3c9d2]" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function SoftwareModalStyleTestPage() {
  const [activeVariant, setActiveVariant] = useState<PopupVariant>('work');
  const activeMeta = useMemo(() => variantMeta[activeVariant], [activeVariant]);

  return (
    <div className="min-h-full bg-[#f5f5f7] px-8 py-7 text-[#1f2933]">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-semibold text-[#1f2933]">弹窗样式测试</h1>
            <p className="mt-1 text-[13px] text-[#8d98a6]">参考截图的小型菜单弹窗，套入当前项目已有弹窗内容。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const Icon = variant.icon;
              const active = activeVariant === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setActiveVariant(variant.id)}
                  className={`flex h-9 items-center gap-2 rounded-[8px] border px-3 text-[13px] font-medium transition-colors ${
                    active
                      ? 'border-[#1e71ef] bg-[#eaf2ff] text-[#1e71ef]'
                      : 'border-[#dfe4eb] bg-white text-[#657080] hover:border-[#b8caef] hover:text-[#1f2933]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {variant.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="relative min-h-[560px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#edf0f2] bg-[#f8fafc] px-5 py-3">
              <div className="h-2 w-[150px] rounded-full bg-[#6da0ff]" />
            </div>
            <div className="flex flex-col items-center px-5 pt-5">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-medium text-[#1f2933]">{activeMeta.title}</h2>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#dfe4eb] bg-[#f4f6f8] text-[#657080]"
                  aria-label="打开更多操作"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2">
                <ReferencePopup variant={activeVariant} />
              </div>
            </div>
          </section>

          <div className="grid gap-5">
            <ExistingContentPreview variant={activeVariant} />

            <section className="rounded-[8px] border border-[#e5e7eb] bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[8px] bg-[#f8fafc] p-3">
                  <p className="text-[12px] font-medium text-[#8d98a6]">圆角</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#1f2933]">8px</p>
                </div>
                <div className="rounded-[8px] bg-[#f8fafc] p-3">
                  <p className="text-[12px] font-medium text-[#8d98a6]">边框</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#1f2933]">#e5e7eb</p>
                </div>
                <div className="rounded-[8px] bg-[#f8fafc] p-3">
                  <p className="text-[12px] font-medium text-[#8d98a6]">危险操作</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#ff3b30]">#ff3b30</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="flex h-9 items-center gap-2 rounded-[8px] bg-[#1e71ef] px-3 text-[13px] font-medium text-white">
                  <RefreshCcw className="h-4 w-4" />
                  应用到预览
                </button>
                <button type="button" className="flex h-9 items-center gap-2 rounded-[8px] border border-[#dfe4eb] bg-white px-3 text-[13px] font-medium text-[#657080]">
                  <EyeOff className="h-4 w-4" />
                  保持测试
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoftwareModalStyleTestPage;
