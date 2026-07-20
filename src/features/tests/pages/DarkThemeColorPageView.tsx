import { ArrowLeft, Moon, Sun } from 'lucide-react';
import type { Dispatch, HTMLAttributes, ReactNode, SetStateAction } from 'react';

import type { CustomThemeColorSlot } from '@/features/theme/model/customThemeColors';
import {
  detailOutlineNumberSlots,
  globalCustomThemeSlots,
  type DarkThemeColorPageProps,
  type ThemeColorTab,
  type ThemeMode,
  getPagePalette,
} from './darkThemeColorData';

type DarkThemeColorPageViewInput = {
  activeThemeTab: ThemeColorTab;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
  handleBack: () => void;
  isEmbedded: boolean;
  mode: ThemeMode;
  page: ReturnType<typeof getPagePalette>;
  renderCustomThemeEditor: (themeSlots: CustomThemeColorSlot[]) => ReactNode;
  renderPaletteTab: () => ReactNode;
  selectThemeTab: (tab: ThemeColorTab) => void;
  setMode: Dispatch<SetStateAction<ThemeMode>>;
  variant: NonNullable<DarkThemeColorPageProps['variant']>;
};

export function renderDarkThemeColorPageView({
  activeThemeTab,
  dragHandleProps,
  handleBack,
  isEmbedded,
  mode,
  page,
  renderCustomThemeEditor,
  renderPaletteTab,
  selectThemeTab,
  setMode,
  variant,
}: DarkThemeColorPageViewInput) {
  return (
    <div className="h-full min-h-0 overflow-y-auto" style={{ backgroundColor: page.page, color: page.title }}>
      <div
        className={
          isEmbedded
            ? 'flex h-full min-h-0 flex-col space-y-4 overflow-y-auto pr-1'
            : variant === 'modal'
              ? 'min-h-0 space-y-3 px-4 py-4'
              : 'mx-auto max-w-[1180px] space-y-5 px-8 py-6'
        }
      >
        <header
          {...dragHandleProps}
          className={
            isEmbedded
              ? 'flex min-h-[52px] shrink-0 items-center justify-between gap-3 border-b py-2.5'
              : variant === 'modal'
                ? 'grid min-h-[52px] grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] items-center gap-3 rounded-xl border px-4 py-2.5'
                : 'grid min-h-[52px] grid-cols-[minmax(160px,1fr)_auto_minmax(160px,1fr)] items-center gap-3 border-b px-4 py-2.5'
          }
          style={{
            ...dragHandleProps?.style,
            backgroundColor: variant === 'modal' ? page.header : 'transparent',
            borderColor: page.border,
          }}
        >
          {!isEmbedded ? (
            <div className="flex items-center gap-3 justify-self-start">
              <button
                onClick={handleBack}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-white text-brand transition-colors hover:bg-brand-light"
                title="返回测试"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-black" style={{ color: page.title }}>
                  主题颜色
                </h1>
              </div>
            </div>
          ) : null}

          <div className="inline-flex rounded-lg border bg-white p-0.5" style={{ borderColor: page.border }}>
            {[
              { key: 'custom' as const, label: '自定义颜色' },
              { key: 'detailOutline' as const, label: '章纲数字块' },
              { key: 'palette' as const, label: '主题色板' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => selectThemeTab(tab.key)}
                className="h-8 rounded-md px-4 text-sm font-black transition-colors"
                style={{
                  backgroundColor: activeThemeTab === tab.key ? '#E7F8FD' : 'transparent',
                  color: activeThemeTab === tab.key ? '#08AACE' : '#64748b',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="flex justify-self-end rounded-lg border p-0.5"
            style={{ backgroundColor: page.button, borderColor: page.border }}
          >
            {[
              { key: 'light' as const, label: '白色', icon: Sun },
              { key: 'dark' as const, label: '黑色', icon: Moon },
            ].map((item) => {
              const Icon = item.icon;
              const active = mode === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setMode(item.key)}
                  className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-black transition-colors"
                  style={{
                    backgroundColor: active ? (mode === 'dark' ? '#e8e8e8' : '#0f172a') : 'transparent',
                    color: active ? (mode === 'dark' ? '#171717' : '#ffffff') : page.body,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {activeThemeTab === 'palette'
          ? renderPaletteTab()
          : activeThemeTab === 'detailOutline'
            ? renderCustomThemeEditor(detailOutlineNumberSlots)
            : renderCustomThemeEditor(globalCustomThemeSlots)}
      </div>
    </div>
  );
}
