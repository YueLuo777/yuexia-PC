import { PRIMARY_TEXT_BUTTON_CLASS } from '@/shared/ui/actionButtonClasses';

type WindowSettingsCompactSectionProps = {
  settings: WindowSettingsResult | null;
  onToggleRemember: () => void;
  onResetBounds: () => void;
};

const SETTINGS_GRID_CLASS = 'grid w-full grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-4';
const CARD_CLASS = 'flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm';
const META_CLASS = 'rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500';

export function WindowSettingsCompactSection({
  settings,
  onToggleRemember,
  onResetBounds,
}: WindowSettingsCompactSectionProps) {
  const rememberSize = settings?.rememberSize ?? true;
  const defaultBounds = settings?.defaultBounds ?? { width: 1366, height: 768 };

  return (
    <div className={SETTINGS_GRID_CLASS}>
      <section className={CARD_CLASS}>
        <div>
          <h3 className="text-sm font-black text-slate-950">记住窗口大小</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">下次启动时继续使用当前窗口的宽高和位置。</p>
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <div className="flex flex-wrap gap-2">
            <span className={META_CLASS}>
              默认 {defaultBounds.width} × {defaultBounds.height}
            </span>
            {settings?.currentBounds ? (
              <span className={META_CLASS}>
                当前 {settings.currentBounds.width} × {settings.currentBounds.height}
              </span>
            ) : null}
          </div>
          <button type="button" onClick={onToggleRemember} className={PRIMARY_TEXT_BUTTON_CLASS}>
            {rememberSize ? '已开启' : '已关闭'}
          </button>
        </div>
      </section>

      <section className={CARD_CLASS}>
        <div>
          <h3 className="text-sm font-black text-slate-950">恢复默认窗口大小</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">清除保存的窗口尺寸，并立即恢复默认宽高。</p>
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <span className={META_CLASS}>
            启动尺寸 {defaultBounds.width} × {defaultBounds.height}
          </span>
          <button type="button" onClick={onResetBounds} className={PRIMARY_TEXT_BUTTON_CLASS}>
            恢复默认
          </button>
        </div>
      </section>
    </div>
  );
}

export function AssociationSettingsCompactSection() {
  return (
    <div className={SETTINGS_GRID_CLASS}>
      <section className={CARD_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-950">关联有效期</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              章节、上下文、脑洞和关联资料只在当前软件会话中保留。
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-200 bg-[#E7F8FD] px-3 py-1 text-xs font-black text-[#078FAE]">
            当前会话
          </span>
        </div>
      </section>

      <section className={CARD_CLASS}>
        <div>
          <h3 className="text-sm font-black text-slate-950">自动清理</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            关闭软件后自动取消临时关联，下次打开时恢复为未关联状态。
          </p>
        </div>
        <div className="mt-auto pt-3">
          <span className={META_CLASS}>无需手动清理</span>
        </div>
      </section>
    </div>
  );
}
